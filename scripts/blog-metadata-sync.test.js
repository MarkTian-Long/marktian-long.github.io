'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { syncPostMetadataAsync, parseArgs } = require('../tools/blog/sync-post-metadata');

function fixtureRoot() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'blog-metadata-sync-'));
}

function writeFixture(rootDir, slug, imagePath) {
  const metadataPath = path.join(rootDir, 'tools/blog/data/posts-meta.json');
  fs.mkdirSync(path.dirname(metadataPath), { recursive: true });
  fs.writeFileSync(metadataPath, JSON.stringify({
    version: 4,
    image_contract: { version: 1, legacy_without_visuals: [] },
    posts: [],
  }, null, 2) + '\n');

  const sourcePath = path.join(rootDir, 'drafts/blog', slug + '.md');
  fs.mkdirSync(path.dirname(sourcePath), { recursive: true });
  fs.writeFileSync(sourcePath, [
    '---',
    'category: 商业',
    'tags: ["决策框架"]',
    'topics: ["Agent"]',
    'concepts: ["Agent 业务价值", "业务结果归因", "工作系统变化", "人工接管", "合格任务成本", "Agent 扩围"]',
    'share_quote: "Agent 的业务价值来自可验证的业务结果。"',
    'relations: []',
    '---',
    '',
    '# Agent 上线后，怎样量出真实业务价值？',
    '',
    '> 企业引入 Agent 后，需要验证业务结果是否改善，以及价值是否值得持续投入。',
    '',
    '---',
    '',
    '![企业工作系统示意](../../' + imagePath + ' "业务任务经过人员、工具与 Agent，最终形成可核验结果。")',
    '',
    '## 一、先定义结果',
    '',
    'Agent 的业务价值来自可验证的业务结果。',
    '',
  ].join('\n'), 'utf8');
  const assetPath = path.join(rootDir, ...imagePath.split('/'));
  fs.mkdirSync(path.dirname(assetPath), { recursive: true });
  fs.writeFileSync(assetPath,
    '<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="0 0 1280 720">'
    + '<rect width="1280" height="720" fill="#faf9f5"/></svg>');
  return sourcePath;
}

test('new post metadata sync derives registered inline visuals from Markdown and image bytes', async () => {
  const rootDir = fixtureRoot();
  const slug = 'agent-value-fixture';
  const imagePath = 'assets/images/blog/' + slug + '/opening-work-system.svg';
  const sourcePath = writeFixture(rootDir, slug, imagePath);

  const result = await syncPostMetadataAsync({
    sourcePath: path.relative(rootDir, sourcePath),
    rootDir,
    date: '2026.11',
  });
  const metadata = JSON.parse(fs.readFileSync(path.join(rootDir, 'tools/blog/data/posts-meta.json'), 'utf8'));
  const post = metadata.posts[0];

  assert.equal(result.changed, true);
  assert.equal(post.slug, slug);
  assert.equal(post.date, '2026.11');
  assert.deepEqual(post.visuals.inline, [{
    src: imagePath,
    alt: '企业工作系统示意',
    caption: '业务任务经过人员、工具与 Agent，最终形成可核验结果。',
    width: 1280,
    height: 720,
  }]);
});

test('metadata sync ignores image-looking examples inside fenced code blocks', async () => {
  const rootDir = fixtureRoot();
  const slug = 'agent-value-code-example';
  const imagePath = 'assets/images/blog/' + slug + '/opening-work-system.svg';
  const sourcePath = writeFixture(rootDir, slug, imagePath);
  const source = fs.readFileSync(sourcePath, 'utf8').replace(
    '## 一、先定义结果',
    '~~~markdown\n![not an asset](../../assets/images/blog/not-real/example.svg "code example")\n~~~\n\n## 一、先定义结果',
  );
  fs.writeFileSync(sourcePath, source, 'utf8');

  const result = await syncPostMetadataAsync({
    sourcePath: path.relative(rootDir, sourcePath),
    rootDir,
    date: '2026.11',
  });
  assert.equal(result.post.visuals.inline.length, 1);
});

test('metadata sync rejects remote and cross-article image paths', async () => {
  const rootDir = fixtureRoot();
  const slug = 'agent-value-invalid-image';
  const imagePath = 'assets/images/blog/' + slug + '/opening-work-system.svg';
  const sourcePath = writeFixture(rootDir, slug, imagePath);
  const source = fs.readFileSync(sourcePath, 'utf8').replace(
    '../../' + imagePath,
    'https://example.com/image.svg',
  );
  fs.writeFileSync(sourcePath, source, 'utf8');

  await assert.rejects(
    () => syncPostMetadataAsync({
      sourcePath: path.relative(rootDir, sourcePath),
      rootDir,
      date: '2026.11',
    }),
    /local assets/i,
  );
});

test('metadata sync refuses a new article without a registered opening image', async () => {
  const rootDir = fixtureRoot();
  const slug = 'agent-value-no-image';
  const sourcePath = writeFixture(rootDir, slug, 'assets/images/blog/' + slug + '/opening.svg');
  const source = fs.readFileSync(sourcePath, 'utf8').replace(
    /^!\[[^\n]+\]\([^\n]+\)\n\n/m,
    '',
  );
  fs.writeFileSync(sourcePath, source, 'utf8');

  await assert.rejects(
    () => syncPostMetadataAsync({
      sourcePath: path.relative(rootDir, sourcePath),
      rootDir,
      date: '2026.11',
    }),
    /at least one registered inline image/i,
  );
});

test('CLI parser retains the documented date option', () => {
  assert.deepEqual(parseArgs(['--write', 'drafts/blog/example.md', '--date', '2026.11']), {
    sourcePath: 'drafts/blog/example.md',
    date: '2026.11',
  });
  assert.equal(parseArgs(['--write', 'drafts/blog/example.md', '--date', '26.11']).date, '26.11');
});
