const fs = require('fs');
const path = require('path');
const config = require('../../scripts/site-config.js');
const { articleUrl, ensureArticleSeo } = require('../../scripts/search-foundation.js');
const { parseSourceMarkdown } = require('./markdown-source.js');
const { parsePublishHandoff } = require('./publish-handoff.js');

function parseGeneratorArgs(generatorArgs) {
  if (generatorArgs.includes('--write') && generatorArgs.includes('--candidate')) throw new Error('Choose exactly one generator mode');
  const mode = generatorArgs[0] === '--write' ? 'write' : generatorArgs[0] === '--candidate' ? 'candidate' : 'check';
  const [sourcePath, outputPath] = generatorArgs.slice(mode === 'check' ? 0 : 1);
  if (!sourcePath || !outputPath) {
    throw new Error('Usage: node tools/blog/generate-post.js [--write|--candidate] <source.md> <output.html>');
  }
  return { mode, sourcePath, outputPath };
}

const escapeHtml = value => String(value ?? '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;');
const inline = value => escapeHtml(value)
  .replace(/`([^`]+)`/g, '<code>$1</code>')
  .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
  .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
  .replace(/\*([^*]+)\*/g, '<em>$1</em>');

function isTableSeparator(line) {
  return /^\s*\|?[\s:|-]+\|[\s:|-]+/.test(line || '');
}

function renderTable(rows) {
  const cells = row => row.trim().replace(/^\||\|$/g, '').split('|').map(cell => inline(cell.trim()));
  const header = cells(rows[0]);
  const body = rows.slice(2).map(cells);
  return '<div class="blog-table"><table><thead><tr>'
    + header.map(cell => '<th>' + cell + '</th>').join('')
    + '</tr></thead><tbody>'
    + body.map(row => '<tr>' + row.map(cell => '<td>' + cell + '</td>').join('') + '</tr>').join('')
    + '</tbody></table></div>';
}

function renderCodeBlock(rows) {
  return '<pre><code>' + escapeHtml(rows.join('\n')) + '</code></pre>';
}

function replaceTocList(html, inner) {
  const openTag = '<ul class="toc-list">';
  const start = html.indexOf(openTag);
  if (start === -1) throw new Error('No toc-list found in template');

  const tagPattern = /<\/?ul\b[^>]*>/g;
  tagPattern.lastIndex = start;
  let depth = 0;
  let match;
  while ((match = tagPattern.exec(html))) {
    depth += match[0].startsWith('</') ? -1 : 1;
    if (depth === 0) {
      return html.slice(0, start) + openTag + inner + '</ul>' + html.slice(tagPattern.lastIndex);
    }
  }
  throw new Error('Unclosed toc-list in template');
}

function isBlockStart(line, next) {
  return !line || /^```/.test(line) || /^#{1,3}\s+/.test(line) || /^---+\s*$/.test(line)
    || /^>\s?/.test(line) || /^!\[/.test(line) || /^\s*(?:[-*]|\d+\.)\s+/.test(line)
    || (line.includes('|') && isTableSeparator(next));
}

function articleAssetUrl(src) {
  if (typeof src !== 'string' || !/^assets\/images\/blog\/[a-z0-9-]+\/[a-z0-9-]+\.(?:jpg|webp)$/.test(src)) {
    throw new Error('Blog image must be a registered local article asset');
  }
  return '../../../' + src;
}

function renderPostCover(metadata) {
  if (!metadata || !metadata.visuals || !metadata.visuals.cover) return '';
  const cover = metadata.visuals.cover;
  if (!cover || cover.src !== `assets/images/blog/${metadata.slug}/cover.jpg`) {
    throw new Error(`Post ${metadata.slug} cover must be a registered local article asset`);
  }
  return '<figure class="post-cover">\n'
    + `  <img src="${articleAssetUrl(cover.src)}" alt="${escapeHtml(cover.alt)}" width="${cover.width}" height="${cover.height}" loading="eager" decoding="async" fetchpriority="high" />\n`
    + '</figure>';
}

function injectPostCover(template, metadata) {
  const marker = '<!-- post-cover -->';
  if ((template.match(/<!-- post-cover -->/g) || []).length !== 1) {
    throw new Error('Article template must contain one post-cover marker');
  }
  const coverHtml = renderPostCover(metadata);
  if (!coverHtml) return template.replace(/^[\t ]*<!-- post-cover -->\r?\n?/m, '');
  return template.replace(marker, () => coverHtml);
}

function resolveMarkdownImagePath(sourceRepoPath, imagePath) {
  if (typeof imagePath !== 'string'
    || /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i.test(imagePath)
    || imagePath.includes('\\')
    || path.posix.isAbsolute(imagePath)) {
    throw new Error('Markdown image must use a registered local article path');
  }
  const source = String(sourceRepoPath || '').replace(/\\/g, '/');
  const resolved = path.posix.normalize(path.posix.join(path.posix.dirname(source), imagePath));
  if (resolved.startsWith('../') || resolved === '..') {
    throw new Error('Markdown image path escapes the repository');
  }
  return resolved;
}

function renderStandaloneImage(line, metadata, sourceRepoPath) {
  const match = /^!\[([^\]\r\n]+)\]\(([^\s()]+)\s+"([^"\r\n]+)"\)\s*$/.exec(line);
  if (!match) throw new Error('Markdown image must use the registered standalone image form');
  const [, alt, source, caption] = match;
  const resolved = resolveMarkdownImagePath(sourceRepoPath, source);
  const expectedPrefix = `assets/images/blog/${metadata.slug}/`;
  if (!resolved.startsWith(expectedPrefix)) {
    throw new Error(`Markdown image must stay within article ${metadata.slug}`);
  }
  const registered = (metadata.visuals && metadata.visuals.inline || []).find(image => image.src === resolved);
  if (!registered) throw new Error(`Markdown image is not registered in metadata: ${resolved}`);
  if (registered.alt !== alt || registered.caption !== caption) {
    throw new Error(`Markdown image alt and caption must match metadata: ${resolved}`);
  }
  return '<figure class="post-figure">\n'
    + `  <img src="${articleAssetUrl(registered.src)}" alt="${escapeHtml(registered.alt)}" width="${registered.width}" height="${registered.height}" loading="lazy" decoding="async" />\n`
    + `  <figcaption>${escapeHtml(registered.caption)}</figcaption>\n`
    + '</figure>';
}

function renderMarkdown(markdown, metadata, sourceRepoPath) {
  const lines = String(markdown).replace(/\r/g, '').split('\n');
  const blocks = [];
  const sections = [];
  let currentSection = null;
  let index = 0;
  let headingCount = 0;
  const appendBlock = html => blocks.push(html);

  while (index < lines.length) {
    const line = lines[index];
    if (!line.trim()) { index++; continue; }
    if (/^#\s+/.test(line)) { index++; continue; }
    if (/^>\s?/.test(line)) {
      while (index < lines.length && /^>\s?/.test(lines[index])) index++;
      continue;
    }
    if (/^---+\s*$/.test(line)) { index++; continue; }
    if (/^```/.test(line)) {
      const rows = [];
      index++;
      while (index < lines.length && !/^```/.test(lines[index])) rows.push(lines[index++]);
      if (index < lines.length) index++;
      appendBlock(renderCodeBlock(rows));
      continue;
    }
    if (/^!\[/.test(line)) {
      appendBlock(renderStandaloneImage(line, metadata, sourceRepoPath));
      index++;
      continue;
    }
    if (/^#{2,3}\s+/.test(line)) {
      const level = line.startsWith('###') ? 3 : 2;
      const title = line.replace(/^#+\s+/, '').trim();
      const id = 'section-' + (++headingCount);
      appendBlock('<h' + level + ' id="' + id + '">' + inline(title) + '</h' + level + '>');
      if (level === 2) {
        currentSection = { id, title, children: [] };
        sections.push(currentSection);
      } else if (currentSection && currentSection.title !== '参考资料') {
        currentSection.children.push({ id, title });
      }
      index++;
      continue;
    }
    if (line.includes('|') && isTableSeparator(lines[index + 1])) {
      const rows = [line, lines[index + 1]];
      index += 2;
      while (index < lines.length && lines[index].trim() && lines[index].includes('|')) rows.push(lines[index++]);
      appendBlock(renderTable(rows));
      continue;
    }
    if (/^\s*(?:[-*]|\d+\.)\s+/.test(line)) {
      const ordered = /^\s*\d+\./.test(line);
      const tag = ordered ? 'ol' : 'ul';
      const items = [];
      while (index < lines.length && /^\s*(?:[-*]|\d+\.)\s+/.test(lines[index])) {
        items.push(lines[index++].replace(ordered ? /^\s*\d+\.\s+/ : /^\s*[-*]\s+/, ''));
      }
      appendBlock('<' + tag + '>' + items.map(item => '<li>' + inline(item) + '</li>').join('') + '</' + tag + '>');
      continue;
    }
    const paragraph = [];
    while (index < lines.length && !isBlockStart(lines[index], lines[index + 1])) paragraph.push(lines[index++].trim());
    if (paragraph.length) appendBlock('<p>' + inline(paragraph.join(' ')) + '</p>');
  }

  return { bodyHtml: blocks.join('\n'), sections };
}

function renderToc(sections) {
  return sections.map(section => {
    if (!section.children.length) return '<li><a href="#' + section.id + '">' + inline(section.title) + '</a></li>';
    const sublistId = 'toc-' + section.id;
    return '<li class="toc-group"><div class="toc-group-row"><button class="toc-toggle" type="button" aria-expanded="false" aria-controls="' + sublistId + '"><span class="toc-toggle-icon" aria-hidden="true">▸</span><span class="sr-only">展开子章节</span></button><a href="#' + section.id + '">' + inline(section.title) + '</a></div><ul class="toc-sublist" id="' + sublistId + '" hidden>'
      + section.children.map(child => '<li><a href="#' + child.id + '">' + inline(child.title) + '</a></li>').join('')
      + '</ul></li>';
  }).join('');
}

function buildPage(template, markdown, metadata, sourceRepoPath) {
  const rendered = renderMarkdown(markdown, metadata, sourceRepoPath);
  let page = template;
  if (!/<script src="\.\.\/article-runtime\.js"><\/script>/.test(page)) {
    page = page.replace(/<body([^>]*)>/, '<body$1>\n  <script src="../article-runtime.js"></script>');
  }
  page = page.replace(/<!--[\s\S]*?-->/, '<!--\ndate:    ' + metadata.date + '\ntitle:   ' + metadata.title + '\ntags:    [' + metadata.tags.join(', ') + ']\nslug:    ' + metadata.slug + '\nsummary: ' + metadata.summary + '\ncategory: ' + metadata.category + '\n-->');
  page = page.replace(/<title>[\s\S]*?<\/title>/, '<title>' + escapeHtml(metadata.title) + ' — Leo 的思考碎片</title>');
  page = page.replace(/(<meta property="og:title" content=")[^"]*(" \/>)/, '$1' + escapeHtml(metadata.title) + '$2');
  page = page.replace(/(<meta property="og:description" content=")[^"]*(" \/>)/, '$1' + escapeHtml(metadata.summary) + '$2');
  page = page.replace(/(<meta property="og:url" content=")[^"]*(" \/>)/, '$1' + escapeHtml(articleUrl(config, metadata)) + '$2');
  page = page.replace(/(<meta name="twitter:title" content=")[^"]*(" \/>)/, '$1' + escapeHtml(metadata.title) + '$2');
  page = page.replace(/(<meta name="twitter:description" content=")[^"]*(" \/>)/, '$1' + escapeHtml(metadata.summary) + '$2');
  page = ensureArticleSeo(page, metadata, config);
  if (!/\.post-body pre\b/.test(page)) {
    page = page.replace(/(\.post-body code \{[^}]+\})/, '$1 .post-body pre { margin:0 0 18px; padding:14px 16px; overflow:auto; border-radius:8px; background:var(--code-bg); color:var(--text-1); font-size:13px; line-height:1.7; } .post-body pre code { padding:0; background:transparent; font-size:inherit; }');
  }
  page = replaceTocList(page, renderToc(rendered.sections));
  page = page.replace(/<span class="post-date">[^<]*<\/span>[\s\S]*?<h1 class="post-title">[\s\S]*?<\/h1>[\s\S]*?<p class="post-summary">[\s\S]*?<\/p>/, '<span class="post-date">' + metadata.date + '</span><span id="post-tags"></span></div><h1 class="post-title">' + inline(metadata.title) + '</h1><p class="post-summary">' + inline(metadata.summary) + '</p>');
  page = injectPostCover(page, metadata);
  page = page.replace(/<div class="post-body">[\s\S]*?<\/div>\s*<section class="continue-reading"/, () => '<div class="post-body">' + rendered.bodyHtml + '</div>\n        <section class="continue-reading"');
  return page;
}

function generatePost({ mode, sourcePath, outputPath }) {
  if (mode === 'candidate') {
    const candidateRoot = path.resolve(__dirname, '../../build/candidate-site');
    const target = path.resolve(outputPath);
    const relative = path.relative(candidateRoot, target);
    if (relative.startsWith('..') || path.isAbsolute(relative)) throw new Error('Candidate output must stay under build/candidate-site');
  }

  const slug = path.basename(outputPath, '.html');
  const absoluteSourcePath = path.resolve(sourcePath);
  const sourceRepoPath = path.relative(process.cwd(), absoluteSourcePath).replace(/\\/g, '/');
  const markdown = fs.readFileSync(absoluteSourcePath, 'utf8').replace(/\r/g, '');
  if (parsePublishHandoff(markdown, sourcePath).handoff) {
    throw new Error(`Publish handoff must be applied before generating HTML: ${sourcePath}`);
  }
  const metadata = JSON.parse(fs.readFileSync('tools/blog/data/posts-meta.json', 'utf8')).posts
    .find(post => post.slug === slug);
  if (!metadata) throw new Error('No metadata found for slug: ' + slug);
  if (typeof metadata.share_quote !== 'string' || !metadata.share_quote.trim()) {
    throw new Error('No share_quote found for slug: ' + slug);
  }

  const { sourceTitle, sourceSummary } = parseSourceMarkdown(markdown, sourcePath);
  if (metadata.title !== sourceTitle) {
    throw new Error(`Metadata title does not match final Markdown H1: ${slug}`);
  }
  if (metadata.summary !== sourceSummary) {
    throw new Error(`Metadata summary does not match final Markdown blockquote: ${slug}`);
  }

  const template = fs.readFileSync('tools/blog/article-template.html', 'utf8');
  const page = buildPage(template, markdown, metadata, sourceRepoPath);
  const current = fs.existsSync(outputPath) ? fs.readFileSync(outputPath, 'utf8') : '';
  if (mode === 'check') {
    if (current !== page) process.exitCode = 1;
    console.log(current === page ? '✓ check: output is current' : '✗ check: output is stale');
  } else {
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, page, 'utf8');
    console.log(`✓ ${mode}: ${outputPath}`);
  }
  return page;
}

function main(argv = process.argv.slice(2)) {
  return generatePost(parseGeneratorArgs(argv));
}

if (require.main === module) main();

module.exports = {
  buildPage,
  escapeHtml,
  generatePost,
  injectPostCover,
  parseGeneratorArgs,
  renderMarkdown,
  renderPostCover,
  renderStandaloneImage,
};
