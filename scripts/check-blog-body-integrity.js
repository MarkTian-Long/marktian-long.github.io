'use strict';
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const ROOT_DIR = path.resolve(__dirname, '..');

function postBody(html) {
  const start = html.indexOf('<div class="post-body">');
  if (start === -1) throw new Error('post-body not found');
  const tags = /<\/?div\b[^>]*>/gi;
  tags.lastIndex = start;
  let depth = 0, match;
  while ((match = tags.exec(html))) {
    depth += match[0].startsWith('</') ? -1 : 1;
    if (depth === 0) return html.slice(start, tags.lastIndex);
  }
  throw new Error('post-body is not closed');
}
function escapeHtml(value) {
  return String(value ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
function generatedInlineFigure(image) {
  return '<figure class="post-figure">\n'
    + '  <img src="../../../' + image.src + '" alt="' + escapeHtml(image.alt) + '" width="' + image.width + '" height="' + image.height + '" loading="lazy" decoding="async" />\n'
    + '  <figcaption>' + escapeHtml(image.caption) + '</figcaption>\n'
    + '</figure>';
}
function editorialBody(html, inlineImages = []) {
  let body = postBody(html).replace(/\r\n/g, '\n')
    .replace(/<div class="related-posts"[\s\S]*?<nav class="post-nav"/g, '<nav class="post-nav"')
    .replace(/<section class="continue-reading"[\s\S]*?<nav class="post-nav"/g, '<nav class="post-nav"');
  for (const image of inlineImages) body = body.replace(generatedInlineFigure(image), '');
  return body.replace(/\n{2,}/g, '\n');
}
function runGit(args, rootDir, options = {}) {
  return execFileSync('git', args, { cwd: rootDir, encoding: 'utf8', ...options });
}
function comparePostBodies({ rootDir = ROOT_DIR, baseRef = 'HEAD' } = {}) {
  if (typeof baseRef !== 'string' || !baseRef || baseRef.startsWith('-') || /[\r\n\0]/.test(baseRef)) {
    throw new Error('baseRef must be a valid Git commit or ref');
  }
  runGit(['cat-file', '-e', baseRef + '^{commit}'], rootDir, { stdio: 'ignore' });
  const tracked = runGit(['ls-files', 'tools/blog/posts'], rootDir).split(/\r?\n/).filter(Boolean);
  const metadata = JSON.parse(fs.readFileSync(path.join(rootDir, 'tools/blog/data/posts-meta.json'), 'utf8'));
  const postsBySlug = new Map(metadata.posts.map(post => [post.slug, post]));
  const changed = [];
  let checkedCount = 0;
  for (const relPath of tracked) {
    try { runGit(['cat-file', '-e', baseRef + ':' + relPath], rootDir, { stdio: 'ignore' }); }
    catch { continue; }
    checkedCount += 1;
    const baseline = runGit(['show', baseRef + ':' + relPath], rootDir);
    const currentPath = path.join(rootDir, relPath);
    if (!fs.existsSync(currentPath)) { changed.push(relPath); continue; }
    const current = fs.readFileSync(currentPath, 'utf8');
    const slug = path.basename(relPath, '.html');
    const inlineImages = postsBySlug.get(slug)?.visuals?.inline || [];
    if (editorialBody(baseline, inlineImages) !== editorialBody(current, inlineImages)) changed.push(relPath);
  }
  return { trackedCount: tracked.length, checkedCount, changed };
}
function parseArgs(argv) {
  if (!argv.length) return { baseRef: 'HEAD' };
  if (argv.length !== 2 || argv[0] !== '--base-ref' || !/^[a-f0-9]{40}$/i.test(argv[1])) {
    throw new Error('Usage: node scripts/check-blog-body-integrity.js [--base-ref <40-char-commit>]');
  }
  return { baseRef: argv[1].toLowerCase() };
}
function main(argv = process.argv.slice(2), rootDir = ROOT_DIR) {
  const { baseRef } = parseArgs(argv);
  const result = comparePostBodies({ rootDir, baseRef });
  if (result.changed.length) throw new Error('Published article body changed against ' + baseRef + ': ' + result.changed.join(', '));
  console.log('PASS historical post-body integrity: ' + result.checkedCount + '/' + result.trackedCount + ' tracked articles unchanged against ' + baseRef + '.');
  return result;
}
if (require.main === module) main();
module.exports = { postBody, editorialBody, generatedInlineFigure, comparePostBodies, parseArgs, main };
