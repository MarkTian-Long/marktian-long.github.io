const fs = require('node:fs');
const path = require('node:path');

const rootDir = path.resolve(__dirname, '..');
const postsDir = path.join(rootDir, 'tools/blog/posts');
const templatePath = path.join(rootDir, 'tools/blog/article-template.html');
const writingGuidePath = path.join(rootDir, 'tools/blog/WRITING_GUIDE.md');
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

function replacePostBody(html, replacement) {
  const start = html.indexOf('<div class="post-body">');
  if (start === -1) throw new Error('template source has no post-body');
  const tags = /<\/?div\b[^>]*>/gi;
  tags.lastIndex = start;
  let depth = 0; let match;
  while ((match = tags.exec(html))) {
    depth += match[0].startsWith('</') ? -1 : 1;
    if (depth === 0) return html.slice(0, start) + replacement + html.slice(tags.lastIndex);
  }
  throw new Error('template source post-body is not closed');
}

function createTemplate() {
  const source = migrateHtml(fs.readFileSync(path.join(postsDir, 'ontology-business-semantic-layer.html'), 'utf8'));
  const template = replacePostBody(source, '<div class="post-body"><p>文章正文由生成器写入。</p></div>');
  fs.writeFileSync(templatePath, template, 'utf8');
  console.log('Created tools/blog/article-template.html.');
}

function updateWritingGuide() {
  const replacement = `## Continue Reading 关系规范\n\n文章页底部使用由 \`article-runtime.js\` 统一渲染的「继续阅读」，最多 3 篇；候选不足时允许少展示。不要在文章 HTML 中复制推荐算法。\n\n### 显式 relations\n\n新文章可选在 \`posts-meta.json\` 中声明较新文章指向较早文章的强关系：\n\n\`\`\`json\n"relations": [{ "slug": "older-article", "type": "builds_on" }]\n\`\`\`\n\n只允许 \`builds_on\`、\`revises\`、\`companion\`；target 必须存在、不得自引用或重复。正向依次显示「承接前文 / 修正前文 / 并列阅读」，旧文由中央 metadata 自动反向显示「后续延展 / 后续修正 / 并列阅读」。正文内链不自动构成 relation；只有核心前提、实质修正或直接互补已经由内容评审确认时才写入。历史正文不因未来关系回写。\n\n### 自动同主题与正文去重\n\n强关系始终优先。自动候选必须至少共享一个 \`topic\`；共享 topic 数、tag 数、category 和发布时间仅用于资格满足后的稳定排序。\`concepts\` 只服务历史语义召回，不参与前端推荐或关系。正文已有的站内历史文章不会再作为同主题推荐；最多仅允许最重要的一条显式关系与正文重复。\n\n### 发布 QA\n\n- 大纲确认时分别判断：正文是否需要历史内链，以及是否值得成为公开强 relation；两者都可以为否。\n- 运行 \`node --test scripts/blog-relationships.test.js\`、\`node scripts/migrate-blog-continue-reading.js --check\` 和 \`node scripts/check-blog-body-integrity.js\`。\n- 保留「上一篇 / 下一篇」作为独立日期导航，不与继续阅读合并。\n\n---\n\n## 分享功能规范`;
  const source = fs.readFileSync(writingGuidePath, 'utf8');
  const next = source.replace(/## 相关文章推荐规范[\s\S]*?---\r?\n\r?\n## 分享功能规范/, replacement);
  if (next === source) throw new Error('Writing guide legacy related-post section not found');
  fs.writeFileSync(writingGuidePath, next, 'utf8');
  console.log('Updated tools/blog/WRITING_GUIDE.md.');
}

function main(argv = process.argv.slice(2)) {
  if (argv.length === 1 && argv[0] === '--create-template') return createTemplate();
  if (argv.length === 1 && argv[0] === '--update-writing-guide') return updateWritingGuide();
  const mode = argv.includes('--write') ? 'write' : argv.includes('--check') ? 'check' : null;
  if (!mode || argv.length !== 1) throw new Error('Usage: node scripts/migrate-blog-continue-reading.js --write|--check|--create-template|--update-writing-guide');
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
