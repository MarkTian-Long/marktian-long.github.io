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

function editorialBody(html) {
  return postBody(html)
    .replace(/<div class="related-posts"[\s\S]*?<nav class="post-nav"/g, '<nav class="post-nav"')
    .replace(/<section class="continue-reading"[\s\S]*?<nav class="post-nav"/g, '<nav class="post-nav"');
}

function main() {
  const tracked = execFileSync('git', ['ls-files', 'tools/blog/posts'], { cwd: rootDir, encoding: 'utf8' }).trim().split(/\r?\n/).filter(Boolean);
  const changed = [];
  for (const relPath of tracked) {
    try {
      execFileSync('git', ['cat-file', '-e', `HEAD:${relPath}`], { cwd: rootDir, stdio: 'ignore' });
    } catch {
      continue;
    }
    const baseline = execFileSync('git', ['show', `HEAD:${relPath}`], { cwd: rootDir, encoding: 'utf8' });
    const current = fs.readFileSync(path.join(rootDir, relPath), 'utf8');
    if (editorialBody(baseline).replace(/\r\n/g, '\n') !== editorialBody(current).replace(/\r\n/g, '\n')) changed.push(relPath);
  }
  if (changed.length) throw new Error(`Published article body changed: ${changed.join(', ')}`);
  console.log(`PASS historical post-body integrity: ${tracked.length} tracked articles unchanged.`);
}

if (require.main === module) main();
module.exports = { postBody, editorialBody };
