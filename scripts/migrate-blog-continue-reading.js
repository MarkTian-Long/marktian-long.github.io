const fs = require('node:fs');
const path = require('node:path');

const rootDir = path.resolve(__dirname, '..');
const postsDir = path.join(rootDir, 'tools/blog/posts');
const shell = '<section class="continue-reading" id="continueReading" hidden aria-labelledby="continueReadingHeading">\n'
  + '  <h2 class="continue-reading-heading" id="continueReadingHeading">继续阅读</h2>\n'
  + '  <div class="continue-reading-list" id="continueReadingList"></div>\n'
  + '</section>';

function migrateHtml(html) {
  let next = html.replace(/<div class="related-posts" id="relatedPosts"[^>]*>[\s\S]*?<div class="related-list" id="relatedList"><\/div>\s*<\/div>/g, shell);
  next = next.replace(/<script>([\s\S]*?)<\/script>/g, (whole, source) => {
    if (!/relatedPosts|relatedList/.test(source)) return whole;
    const metaStart = source.search(/\s*(?:\/\/\s*相关文章[^\n]*\n\s*)?\b(?:var|const|let)\s+POST_META\b/);
    if (metaStart !== -1) return `<script>${source.slice(0, metaStart)}</script>`;
    const combinedStart = source.search(/\s*\/\/\s*上下篇\s*\+\s*相关文章/);
    if (combinedStart !== -1 && /\(function\s*\(\)\s*\{/.test(source)) {
      return `<script>${source.slice(0, combinedStart)}\n})();\n</script>`;
    }
    return whole;
  });
  return next;
}

function checkHtml(filePath, html) {
  const errors = [];
  if (!html.includes('id="continueReading"')) errors.push(`${filePath}: missing continue-reading shell`);
  if (/\bPOST_META\b/.test(html) || /\brelatedPosts\b|\brelatedList\b/.test(html)) errors.push(`${filePath}: legacy article-level recommendation logic remains`);
  return errors;
}

// Only the existing article-shell migration and its read-only check remain supported.
function main(argv = process.argv.slice(2)) {
  const mode = argv.includes('--write') ? 'write' : argv.includes('--check') ? 'check' : null;
  if (!mode || argv.length !== 1) throw new Error('Usage: node scripts/migrate-blog-continue-reading.js --write|--check');
  const files = fs.readdirSync(postsDir).filter((file) => file.endsWith('.html')).sort();
  const errors = [];
  let changed = 0;
  for (const file of files) {
    const filePath = path.join(postsDir, file);
    const html = fs.readFileSync(filePath, 'utf8');
    const next = migrateHtml(html);
    if (mode === 'write' && next !== html) { fs.writeFileSync(filePath, next, 'utf8'); changed++; }
    if (mode === 'check' && next !== html) errors.push(`tools/blog/posts/${file}: continue-reading migration is stale`);
    errors.push(...checkHtml(`tools/blog/posts/${file}`, mode === 'write' ? next : html));
  }
  if (errors.length) throw new Error(errors.join('\n'));
  console.log(`${mode === 'write' ? 'Migrated' : 'Checked'} ${files.length} blog article shells${mode === 'write' ? ` (${changed} changed)` : ''}.`);
}

if (require.main === module) main();
module.exports = { migrateHtml, checkHtml };
