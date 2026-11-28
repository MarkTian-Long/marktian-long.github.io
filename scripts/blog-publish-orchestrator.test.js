'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const { assertApprovedDraft, buildPreviewRedirect, ensureEmptyBuildOutput, normalizeLineEndings, parseArgs } = require('../tools/blog/publish');

test('formal publication requires an explicit prepare flag and complete approved commit', () => {
  const approvedRef = 'a'.repeat(40);
  assert.deepEqual(parseArgs([
    '--slug', 'example-article',
    '--approved-ref', approvedRef,
    '--prepare',
  ]), {
    slug: 'example-article',
    approvedRef,
    date: undefined,
    dryRun: false,
  });
  assert.throws(() => parseArgs([
    '--slug', 'example-article',
    '--approved-ref', 'short',
    '--prepare',
  ]), /complete 40-character commit SHA/);
  assert.throws(() => parseArgs([
    '--slug', 'example-article',
    '--approved-ref', approvedRef,
  ]), /explicit --prepare/);
});

test('publication preview redirect is noindex, canonical and preserves the URL fragment', () => {
  const html = buildPreviewRedirect({
    slug: 'example-article',
    title: 'AI 与产品 <界面>',
  });
  assert.match(html, /name="robots" content="noindex,follow"/);
  assert.match(html, /http-equiv="refresh" content="0;url=\.\.\/posts\/example-article\.html"/);
  assert.match(html, /canonical" href="https:\/\/marktian-long\.github\.io\/tools\/blog\/posts\/example-article\.html"/);
  assert.match(html, /location\.replace\("\.\.\/posts\/example-article\.html"\+location\.hash\)/);
  assert.match(html, /AI 与产品 &lt;界面&gt;/);
});

test('approved source comparison ignores only platform newline normalization', () => {
  assert.equal(normalizeLineEndings('first\r\nsecond\r\n'), 'first\nsecond\n');
  assert.equal(normalizeLineEndings('first\rsecond\r'), 'first\nsecond\n');
});

test('publication parser accepts an explicit publication month and dry-run mode', () => {
  const result = parseArgs([
    '--slug', 'example-article',
    '--approved-ref', 'b'.repeat(40),
    '--date', '2026.11',
    '--prepare',
    '--dry-run',
  ]);
  assert.equal(result.date, '2026.11');
  assert.equal(result.dryRun, true);
});


const FIXTURE_SOURCE = [
  '---',
  'category: 商业',
  'tags: ["决策框架"]',
  'topics: ["Agent"]',
  'concepts: ["Agent 可靠性", "Agent 评测", "企业工作系统", "人机分工", "指标口径", "价值捕获", "结果核验"]',
  'share_quote: "这是一句用于测试的引用。"',
  'relations: []',
  '---',
  '',
  '# 发布预检测试文章',
  '',
  '> 这是一段测试摘要。',
  '',
  '---',
  '',
  '这是一句用于测试的引用。',
  '',
].join('\n');

function createGitFixture(slug, previewPath) {
  const rootDir = fs.mkdtempSync(path.join(os.tmpdir(), 'blog-publish-preflight-'));
  const git = args => execFileSync('git', args, { cwd: rootDir, encoding: 'utf8' }).trim();
  const write = (relativePath, content) => {
    const absolute = path.join(rootDir, ...relativePath.split('/'));
    fs.mkdirSync(path.dirname(absolute), { recursive: true });
    fs.writeFileSync(absolute, content, 'utf8');
  };
  git(['init', '-q']);
  git(['config', 'user.name', 'Local Test']);
  git(['config', 'user.email', 'test@example.invalid']);
  write('drafts/blog/' + slug + '.md', FIXTURE_SOURCE);
  write('tools/blog/data/posts-meta.json', JSON.stringify({ posts: [] }, null, 2) + '\n');
  if (previewPath) write(previewPath, '<!doctype html><meta name="robots" content="noindex"><p>Preview</p>');
  git(['add', '.']);
  git(['commit', '-qm', 'Approved draft']);
  return { rootDir, slug, approvedRef: git(['rev-parse', 'HEAD']) };
}

test('release preflight accepts an allowlisted existing preview', () => {
  const fixture = createGitFixture(
    'ai-innovation-value-capture',
    'tools/blog/previews/ai-innovation-value-capture.html',
  );
  try {
    assert.equal(assertApprovedDraft(fixture).hasPreview, true);
  } finally {
    fs.rmSync(fixture.rootDir, { recursive: true, force: true });
  }
});

test('release preflight rejects an existing preview outside the public allowlist', () => {
  const fixture = createGitFixture(
    'release-fixture-post',
    'tools/blog/previews/release-fixture-post.html',
  );
  try {
    assert.throws(() => assertApprovedDraft(fixture), /not registered in the public asset manifest/i);
  } finally {
    fs.rmSync(fixture.rootDir, { recursive: true, force: true });
  }
});

test('release preflight refuses source symlinks and build-output symlinks', () => {
  const fixture = createGitFixture('release-fixture-post');
  const outside = path.join(os.tmpdir(), 'blog-publish-outside-' + process.pid + '.md');
  try {
    fs.writeFileSync(outside, FIXTURE_SOURCE, 'utf8');
    fs.unlinkSync(path.join(fixture.rootDir, 'drafts/blog/release-fixture-post.md'));
    fs.symlinkSync(outside, path.join(fixture.rootDir, 'drafts/blog/release-fixture-post.md'));
    assert.throws(() => assertApprovedDraft(fixture), /symbolic links are not allowed/i);
  } finally {
    fs.rmSync(fixture.rootDir, { recursive: true, force: true });
    if (fs.existsSync(outside)) fs.unlinkSync(outside);
  }

  const rootDir = fs.mkdtempSync(path.join(os.tmpdir(), 'blog-publish-build-link-'));
  const outsideDir = fs.mkdtempSync(path.join(os.tmpdir(), 'blog-publish-outside-dir-'));
  try {
    fs.mkdirSync(path.join(rootDir, 'build'), { recursive: true });
    fs.symlinkSync(outsideDir, path.join(rootDir, 'build/public-dist-fixture'), 'dir');
    assert.throws(() => ensureEmptyBuildOutput(rootDir, 'fixture'), /symbolic links are not allowed/i);
  } finally {
    fs.rmSync(rootDir, { recursive: true, force: true });
    fs.rmSync(outsideDir, { recursive: true, force: true });
  }
});
