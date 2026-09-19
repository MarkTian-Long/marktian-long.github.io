const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const { parseSourceMarkdown } = require('../tools/blog/markdown-source.js');
const { syncPostMetadata } = require('../tools/blog/sync-post-metadata.js');
const { validateBlogMetadata } = require('./generate-search-assets.js');
const { generatePost } = require('../tools/blog/generate-post.js');

const validSource = [
  '---',
  'category: 商业',
  'tags: ["市场格局"]',
  'topics: ["企业AI"]',
  'concepts: ["软件采购经济性", "Build vs Buy", "软件价值捕获", "软件价值链"]',
  'share_quote: "这是一句最终正文中真实存在的完整原句。"',
  'relations: []',
  '---',
  '',
  '# 新文章标题',
  '',
  '> 正式 summary。',
  '',
  '---',
  '',
  '这是一句最终正文中真实存在的完整原句。',
].join('\n');

test('Markdown parser returns strict frontmatter and structural source fields', () => {
  const parsed = parseSourceMarkdown(validSource, 'new-post.md');
  assert.deepEqual(parsed.frontmatter, {
    category: '商业',
    tags: ['市场格局'],
    topics: ['企业AI'],
    concepts: ['软件采购经济性', 'Build vs Buy', '软件价值捕获', '软件价值链'],
    share_quote: '这是一句最终正文中真实存在的完整原句。',
    relations: [],
  });
  assert.equal(parsed.sourceTitle, '新文章标题');
  assert.equal(parsed.sourceSummary, '正式 summary。');
  assert.match(parsed.bodyMarkdown, /真实存在/);
});

test('strict frontmatter accepts a UTF-8 BOM', () => {
  const parsed = parseSourceMarkdown('\uFEFF' + validSource, 'new-post.md');
  assert.equal(parsed.frontmatter.category, '商业');
});

function replaceFrontmatter(field, value) {
  return validSource.replace(new RegExp(`^${field}:.*$`, 'm'), `${field}: ${value}`);
}

test('strict frontmatter rejects missing, unknown, duplicated, and non-JSON fields', () => {
  assert.throws(() => parseSourceMarkdown(validSource.replace('category: 商业\n', '')), /missing required field: category/);
  assert.throws(() => parseSourceMarkdown(validSource.replace('relations: []', 'unexpected: value\nrelations: []')), /unknown field/);
  assert.throws(() => parseSourceMarkdown(validSource.replace('relations: []', 'tags: ["市场格局"]\nrelations: []')), /duplicated: tags/);
  assert.throws(() => parseSourceMarkdown(replaceFrontmatter('tags', '[市场格局]')), /JSON-compatible/);
});

test('strict frontmatter validates category, vocabulary, concepts, quote, and relation type', () => {
  assert.throws(() => parseSourceMarkdown(replaceFrontmatter('category', '未知')), /Category is not defined/);
  assert.throws(() => parseSourceMarkdown(replaceFrontmatter('category', '生活')), /Legacy category/);
  assert.throws(() => parseSourceMarkdown(replaceFrontmatter('tags', '["未知标签"]')), /tags value is not defined/);
  assert.throws(() => parseSourceMarkdown(replaceFrontmatter('topics', '["未知话题"]')), /topics value is not defined/);
  assert.throws(() => parseSourceMarkdown(replaceFrontmatter('concepts', '["a", "b", "c"]')), /4 to 7/);
  assert.throws(() => parseSourceMarkdown(replaceFrontmatter('concepts', '["a", "b", "c", "d", "e", "f", "g", "h"]')), /4 to 7/);
  assert.throws(() => parseSourceMarkdown(replaceFrontmatter('concepts', '["AI", "b", "c", "d"]')), /generic terms/);
  assert.throws(() => parseSourceMarkdown(replaceFrontmatter('concepts', '["市场格局", "b", "c", "d"]')), /duplicate tag or topic/);
  assert.throws(() => parseSourceMarkdown(replaceFrontmatter('share_quote', '""')), /share_quote/);
  assert.throws(() => parseSourceMarkdown(replaceFrontmatter('share_quote', '"正文不存在的句子。"')), /must exist in the final body/);
  assert.throws(() => parseSourceMarkdown(replaceFrontmatter('relations', '[{"slug":"other","type":"invalid"}]')), /type is invalid/);
});

function basePost(slug, overrides = {}) {
  return {
    slug,
    date: '2026.08',
    title: slug,
    summary: `${slug} summary`,
    share_quote: `${slug} quote。`,
    url: `posts/${slug}.html`,
    tags: ['市场格局'],
    topics: ['企业AI'],
    category: '商业',
    concepts: [`${slug}-a`, `${slug}-b`, `${slug}-c`, `${slug}-d`],
    ...overrides,
  };
}

function makeSyncFixture(posts = [basePost('related')]) {
  const rootDir = fs.mkdtempSync(path.join(os.tmpdir(), 'blog-taxonomy-sync-'));
  fs.mkdirSync(path.join(rootDir, 'docs/blog'), { recursive: true });
  fs.mkdirSync(path.join(rootDir, 'tools/blog/data'), { recursive: true });
  fs.writeFileSync(path.join(rootDir, 'tools/blog/data/posts-meta.json'), JSON.stringify({
    version: 4,
    image_contract: { version: 1, legacy_without_visuals: posts.filter((post) => !post.visuals).map((post) => post.slug) },
    posts,
  }, null, 2) + '\n', 'utf8');
  return rootDir;
}

function writeSource(rootDir, slug, source = validSource) {
  const sourcePath = path.join(rootDir, 'docs/blog', `${slug}.md`);
  fs.writeFileSync(sourcePath, source, 'utf8');
  return sourcePath;
}

test('new frontmatter relations must target an existing post and empty relations are valid', () => {
  const rootDir = makeSyncFixture();
  const badPath = writeSource(rootDir, 'new-post', replaceFrontmatter('relations', '[{"slug":"missing","type":"builds_on"}]'));
  assert.throws(() => syncPostMetadata({ rootDir, sourcePath: badPath, date: '2026.09' }), /target must exist: missing/);
  const goodPath = writeSource(rootDir, 'new-post', validSource);
  const synced = syncPostMetadata({ rootDir, sourcePath: goodPath, date: '2026.09' });
  assert.equal(synced.post.slug, 'new-post');
  assert.equal(synced.post.url, 'posts/new-post.html');
  assert.equal(synced.post.date, '2026.09');
  assert.deepEqual(synced.post.relations, []);
});

test('legacy Markdown is retained only for an existing metadata record', () => {
  const rootDir = makeSyncFixture([basePost('legacy-post')]);
  const legacy = '# Existing title\n\n> Existing summary\n\n---\n\nExisting body。\n';
  assert.equal(syncPostMetadata({ rootDir, sourcePath: writeSource(rootDir, 'legacy-post', legacy) }).legacy, true);
  assert.throws(() => syncPostMetadata({ rootDir, sourcePath: writeSource(rootDir, 'new-post', legacy) }), /New Markdown sources require strict frontmatter/);
});

test('metadata sync preserves date and visuals and is idempotent', () => {
  const visuals = { cover: { src: 'assets/images/blog/existing-post/cover.jpg', alt: 'existing-post 的主题概念插画', width: 1200, height: 630 }, inline: [] };
  const rootDir = makeSyncFixture([basePost('related'), basePost('existing-post', { date: '2025.01', visuals })]);
  const sourcePath = writeSource(rootDir, 'existing-post');
  const first = syncPostMetadata({ rootDir, sourcePath, date: '2026.09' });
  const firstContents = fs.readFileSync(path.join(rootDir, 'tools/blog/data/posts-meta.json'), 'utf8');
  const second = syncPostMetadata({ rootDir, sourcePath, date: '2026.10' });
  const secondContents = fs.readFileSync(path.join(rootDir, 'tools/blog/data/posts-meta.json'), 'utf8');
  assert.equal(first.post.date, '2025.01');
  assert.deepEqual(first.post.visuals, visuals);
  assert.equal(second.changed, false);
  assert.equal(secondContents, firstContents);
  validateBlogMetadata(JSON.parse(secondContents));
});

test('posts-meta validation reads taxonomy rather than local category or concept constants', () => {
  const metadata = {
    version: 4,
    image_contract: { version: 1, legacy_without_visuals: ['post'] },
    posts: [basePost('post', { category: '未知分类' })],
  };
  assert.throws(() => validateBlogMetadata(metadata), /Category is not defined by blog taxonomy/);
  metadata.posts[0].category = '商业';
  metadata.posts[0].concepts = ['AI', 'b', 'c', 'd'];
  assert.throws(() => validateBlogMetadata(metadata), /generic terms/);
});

test('temporary new-article fixture flows from frontmatter through sync to generated HTML', () => {
  const rootDir = makeSyncFixture();
  const sourcePath = writeSource(rootDir, 'new-post');
  fs.mkdirSync(path.join(rootDir, 'tools/blog'), { recursive: true });
  fs.copyFileSync(path.join(__dirname, '../tools/blog/article-template.html'), path.join(rootDir, 'tools/blog/article-template.html'));
  syncPostMetadata({ rootDir, sourcePath, date: '2026.09' });
  const outputPath = path.join(rootDir, 'tools/blog/posts/new-post.html');
  const previousCwd = process.cwd();
  try {
    process.chdir(rootDir);
    generatePost({ mode: 'write', sourcePath, outputPath });
  } finally {
    process.chdir(previousCwd);
  }
  const html = fs.readFileSync(outputPath, 'utf8');
  assert.match(html, /新文章标题/);
  assert.match(html, /正式 summary。/);
  assert.doesNotMatch(html, /<div class="post-body">[\s\S]*?<p>category: 商业/);
});
