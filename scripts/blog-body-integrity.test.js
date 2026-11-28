'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const { editorialBody, comparePostBodies } = require('./check-blog-body-integrity.js');

const image = {
  src: 'assets/images/blog/example/change-gate.webp',
  alt: '候选变化经过独立验证门后分流',
  caption: '只有通过独立验证的变化才进入长期机制。',
  width: 1280,
  height: 720,
};
const baseline = '<div class="post-body"><p>正文前。</p>\n<p>正文后。</p></div><section class="continue-reading">';
const registeredFigure = '<figure class="post-figure">\n'
  + '  <img src="../../../assets/images/blog/example/change-gate.webp" alt="候选变化经过独立验证门后分流" width="1280" height="720" loading="lazy" decoding="async" />\n'
  + '  <figcaption>只有通过独立验证的变化才进入长期机制。</figcaption>\n'
  + '</figure>';

function createGitFixture() {
  const rootDir = fs.mkdtempSync(path.join(os.tmpdir(), 'blog-body-integrity-'));
  const git = args => execFileSync('git', args, { cwd: rootDir, encoding: 'utf8' }).trim();
  const write = (relativePath, content) => {
    const absolute = path.join(rootDir, relativePath);
    fs.mkdirSync(path.dirname(absolute), { recursive: true });
    fs.writeFileSync(absolute, content, 'utf8');
  };
  git(['init', '-q']);
  git(['config', 'user.name', 'Local Test']);
  git(['config', 'user.email', 'test@example.invalid']);
  write('tools/blog/data/posts-meta.json', JSON.stringify({ posts: [] }));
  write('tools/blog/posts/example.html', baseline);
  git(['add', '.']);
  git(['commit', '-qm', 'Baseline article']);
  return { rootDir, git, write, baseRef: git(['rev-parse', 'HEAD']) };
}

test('body integrity ignores only a metadata-registered generated inline figure', () => {
  const current = baseline.replace('<p>正文后。', registeredFigure + '\n<p>正文后。');
  assert.equal(editorialBody(current, [image]), editorialBody(baseline, [image]));
});

test('body integrity does not ignore an inline figure whose generated content differs from metadata', () => {
  const changedFigure = registeredFigure.replace('独立验证门', '未知验证门');
  const current = baseline.replace('<p>正文后。', changedFigure + '\n<p>正文后。');
  assert.notEqual(editorialBody(current, [image]), editorialBody(baseline, [image]));
});

test('body integrity compares historical article bodies against an explicit base commit', () => {
  const fixture = createGitFixture();
  try {
    fixture.write('tools/blog/posts/example.html', baseline.replace('正文后。', '正文被改写。'));
    const result = comparePostBodies({ rootDir: fixture.rootDir, baseRef: fixture.baseRef });
    assert.deepEqual(result.changed, ['tools/blog/posts/example.html']);
    assert.equal(result.checkedCount, 1);
  } finally {
    fs.rmSync(fixture.rootDir, { recursive: true, force: true });
  }
});

test('body integrity allows a newly published article that did not exist at the base commit', () => {
  const fixture = createGitFixture();
  try {
    fixture.write('tools/blog/posts/new-article.html', baseline.replace('正文后。', '新文章正文。'));
    fixture.git(['add', 'tools/blog/posts/new-article.html']);
    const result = comparePostBodies({ rootDir: fixture.rootDir, baseRef: fixture.baseRef });
    assert.deepEqual(result.changed, []);
    assert.equal(result.checkedCount, 1);
    assert.equal(result.trackedCount, 2);
  } finally {
    fs.rmSync(fixture.rootDir, { recursive: true, force: true });
  }
});
