const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const rootDir = path.resolve(__dirname, '..');

function postBody(html) {
  const start = html.indexOf('<div class="post-body">');
  if (start === -1) throw new Error('post-body not found');
  const tags = /<\/?div\b[^>]*>/gi;
  tags.lastIndex = start;
  let depth = 0; let match;
  while ((match = tags.exec(html))) {
    depth += match[0].startsWith('</') ? -1 : 1;
    if (depth === 0) return html.slice(start, tags.lastIndex);
  }
  throw new Error('post-body is not closed');
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function generatedInlineFigure(image) {
  return '<figure class="post-figure">\n'
    + `  <img src="../../../${image.src}" alt="${escapeHtml(image.alt)}" width="${image.width}" height="${image.height}" loading="lazy" decoding="async" />\n`
    + `  <figcaption>${escapeHtml(image.caption)}</figcaption>\n`
    + '</figure>';
}

function editorialBody(html, inlineImages = []) {
  let body = postBody(html).replace(/\r\n/g, '\n')
    .replace(/<div class="related-posts"[\s\S]*?<nav class="post-nav"/g, '<nav class="post-nav"')
    .replace(/<section class="continue-reading"[\s\S]*?<nav class="post-nav"/g, '<nav class="post-nav"');
  for (const image of inlineImages) body = body.replace(generatedInlineFigure(image), '');
  return body.replace(/\n{2,}/g, '\n');
}

function main() {
  const tracked = execFileSync('git', ['ls-files', 'tools/blog/posts'], { cwd: rootDir, encoding: 'utf8' }).trim().split(/\r?\n/).filter(Boolean);
  const metadata = JSON.parse(fs.readFileSync(path.join(rootDir, 'tools/blog/data/posts-meta.json'), 'utf8'));
  const postsBySlug = new Map(metadata.posts.map((post) => [post.slug, post]));
  const changed = [];
  for (const relPath of tracked) {
    try {
      execFileSync('git', ['cat-file', '-e', `HEAD:${relPath}`], { cwd: rootDir, stdio: 'ignore' });
    } catch {
      continue;
    }
    const baseline = execFileSync('git', ['show', `HEAD:${relPath}`], { cwd: rootDir, encoding: 'utf8' });
    const current = fs.readFileSync(path.join(rootDir, relPath), 'utf8');
    const slug = path.basename(relPath, '.html');
    const inlineImages = (postsBySlug.get(slug)?.visuals?.inline || []);
    if (editorialBody(baseline, inlineImages) !== editorialBody(current, inlineImages)) changed.push(relPath);
  }
  if (changed.length) throw new Error(`Published article body changed: ${changed.join(', ')}`);
  console.log(`PASS historical post-body integrity: ${tracked.length} tracked articles unchanged.`);
}

if (require.main === module) main();
module.exports = { postBody, editorialBody, generatedInlineFigure };
