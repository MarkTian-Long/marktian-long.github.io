'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { RELEASE_TESTS, SOURCE_TESTS, checksForMode, draftSourcePaths, parseArgs } = require('./check-blog-release');

test('source mode stays focused on draft and Markdown/image contracts', () => {
  assert.deepEqual(parseArgs(['--source']), { mode: 'source', baseRef: undefined });
  assert.ok(SOURCE_TESTS.includes('blog-markdown-contract.test.js'));
  assert.ok(SOURCE_TESTS.includes('blog-metadata-sync.test.js'));
  assert.ok(SOURCE_TESTS.every(file => RELEASE_TESTS.includes(file)));
  assert.equal(checksForMode('source').length, 3);
});

test('release mode includes source mapping, SEO, public manifest and publication contracts', () => {
  for (const file of [
    'blog-source-ledger.test.js', 'blog-release-equivalence.test.js',
    'blog-publish-orchestrator.test.js', 'blog-body-integrity.test.js',
    'search-foundation.test.js', 'public-dist.test.js', 'publish-blog-workflow.test.js',
  ]) assert.ok(RELEASE_TESTS.includes(file), file);
  assert.equal(checksForMode('release').length, 9);
  const baseRef = 'a'.repeat(40);
  assert.deepEqual(
    checksForMode('release', { baseRef }).find(([label]) => label === 'Historical article body integrity')[1],
    ['scripts/check-blog-body-integrity.js', '--base-ref', baseRef],
  );
});

test('focused release suites deliberately exclude browser-only tests', () => {
  const all = [...SOURCE_TESTS, ...RELEASE_TESTS];
  assert.ok(all.every(file => fs.existsSync(path.join(__dirname, file))), 'all declared test files must exist');
  assert.ok(all.every(file => !file.includes('.browser.test.js')));
});

test('draft discovery includes only direct regular Markdown files and rejects symlinks', () => {
  const rootDir = fs.mkdtempSync(path.join(os.tmpdir(), 'blog-release-source-'));
  try {
    const drafts = path.join(rootDir, 'drafts/blog');
    fs.mkdirSync(path.join(drafts, 'reviews'), { recursive: true });
    fs.writeFileSync(path.join(drafts, 'one-article.md'), '# One');
    fs.writeFileSync(path.join(drafts, 'notes.txt'), 'not a draft');
    assert.deepEqual(draftSourcePaths(rootDir), ['drafts/blog/one-article.md']);
    fs.symlinkSync(path.join(drafts, 'one-article.md'), path.join(drafts, 'linked-article.md'));
    assert.throws(() => draftSourcePaths(rootDir), /regular kebab-case file/);
  } finally {
    fs.rmSync(rootDir, { recursive: true, force: true });
  }
});
