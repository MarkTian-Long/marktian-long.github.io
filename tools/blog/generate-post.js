const fs = require('fs');
const path = require('path');

const [sourcePath, outputPath] = process.argv.slice(2);
if (!sourcePath || !outputPath) {
  throw new Error('Usage: node tools/blog/generate-post.js <source.md> <output.html>');
}

const slug = path.basename(outputPath, '.html');
const metadata = JSON.parse(fs.readFileSync('tools/blog/data/posts-meta.json', 'utf8')).posts
  .find(post => post.slug === slug);
if (!metadata) throw new Error('No metadata found for slug: ' + slug);

const markdown = fs.readFileSync(sourcePath, 'utf8').replace(/\r/g, '');
const lines = markdown.split('\n');
const escapeHtml = value => value
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

const blocks = [];
const sections = [];
let currentSection = null;
let index = 0;
let headingCount = 0;

function appendBlock(html) {
  blocks.push(html);
}

function isBlockStart(line, next) {
  return !line || /^#{1,3}\s+/.test(line) || /^---+\s*$/.test(line)
    || /^>\s?/.test(line) || /^\s*(?:[-*]|\d+\.)\s+/.test(line)
    || (line.includes('|') && isTableSeparator(next));
}

while (index < lines.length) {
  const line = lines[index];
  if (!line.trim()) { index++; continue; }
  if (/^#\s+/.test(line)) { index++; continue; }
  if (/^>\s?/.test(line)) {
    while (index < lines.length && /^>\s?/.test(lines[index])) index++;
    continue;
  }
  if (/^---+\s*$/.test(line)) { index++; continue; }
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

function renderToc() {
  return sections.map(section => {
    if (!section.children.length) return '<li><a href="#' + section.id + '">' + inline(section.title) + '</a></li>';
    const sublistId = 'toc-' + section.id;
    return '<li class="toc-group"><div class="toc-group-row"><button class="toc-toggle" type="button" aria-expanded="false" aria-controls="' + sublistId + '"><span class="toc-toggle-icon" aria-hidden="true">▸</span><span class="sr-only">展开子章节</span></button><a href="#' + section.id + '">' + inline(section.title) + '</a></div><ul class="toc-sublist" id="' + sublistId + '" hidden>'
      + section.children.map(child => '<li><a href="#' + child.id + '">' + inline(child.title) + '</a></li>').join('')
      + '</ul></li>';
  }).join('');
}

let page = fs.readFileSync('tools/blog/posts/ontology-business-semantic-layer.html', 'utf8');
page = page.replace(/<!--[\s\S]*?-->/, '<!--\ndate:    ' + metadata.date + '\ntitle:   ' + metadata.title + '\ntags:    [' + metadata.tags.join(', ') + ']\nslug:    ' + metadata.slug + '\nsummary: ' + metadata.summary + '\ncategory: ' + metadata.category + '\n-->');
page = page.replace(/<title>[\s\S]*?<\/title>/, '<title>' + escapeHtml(metadata.title) + ' — Leo 的思考碎片</title>');
page = page.replace(/(<meta property="og:title" content=")[^"]*(" \/>)/, '$1' + escapeHtml(metadata.title) + '$2');
page = page.replace(/(<meta property="og:description" content=")[^"]*(" \/>)/, '$1' + escapeHtml(metadata.summary) + '$2');
page = page.replace(/(<meta property="og:url" content=")[^"]*(" \/>)/, '$1https://marktian-long.github.io/tools/blog/posts/' + metadata.slug + '.html$2');
page = page.replace(/(<meta name="twitter:title" content=")[^"]*(" \/>)/, '$1' + escapeHtml(metadata.title) + '$2');
page = page.replace(/(<meta name="twitter:description" content=")[^"]*(" \/>)/, '$1' + escapeHtml(metadata.summary) + '$2');
page = replaceTocList(page, renderToc());
page = page.replace(/<span class="post-date">[^<]*<\/span>[\s\S]*?<h1 class="post-title">[\s\S]*?<\/h1>[\s\S]*?<p class="post-summary">[\s\S]*?<\/p>/, '<span class="post-date">' + metadata.date + '</span><span id="post-tags"></span></div><h1 class="post-title">' + inline(metadata.title) + '</h1><p class="post-summary">' + inline(metadata.summary) + '</p>');
page = page.replace(/<div class="post-body">[\s\S]*?<\/div>\s*<div class="related-posts"/, () => '<div class="post-body">' + blocks.join('\n') + '</div>\n        <div class="related-posts"');
page = page.replace(/var POST_META = \{ slug:'[^']+', tags:\[\], topics:\[\], category:'[^']+' \};/, "var POST_META = { slug:'" + metadata.slug + "', tags:[], topics:[], category:'" + metadata.category + "' };");
fs.writeFileSync(outputPath, page, 'utf8');
