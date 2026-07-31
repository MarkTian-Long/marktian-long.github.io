const assert = require('node:assert/strict');
const path = require('node:path');
const test = require('node:test');

const { publicFiles, validateManifest } = require('./public-dist-manifest');
const { isLocalReference, referencedPaths, resolveReference } = require('./check-public-dist');
const { outputDirFromArgs } = require('./build-public-dist');

const repoRoot = path.resolve(__dirname, '..');

test('public dist manifest includes every public entrypoint and excludes dev-only files', () => {
  const files = publicFiles(repoRoot);

  assert.deepEqual(validateManifest(repoRoot, files), []);
  assert.ok(files.includes('index.html'));
  assert.ok(files.includes('tools/blog/index.html'));
  assert.ok(files.includes('tools/blog/posts/agent-boundary.html'));
  assert.ok(files.includes('tools/service-agent/index.html'));
  assert.ok(!files.some(file => file.startsWith('tools/dashboard/')));
  assert.ok(!files.some(file => file.startsWith('tools/product-collector/')));
  assert.ok(!files.some(file => /(?:README\.md|config\.example\.js|gen_index\.js|proxy\.py)$/.test(file)));
});

test('public dist smoke resolves local asset and data references only', () => {
  assert.equal(isLocalReference('https://example.com'), false);
  assert.equal(isLocalReference('#tools'), false);
  assert.equal(isLocalReference('%23g'), false);
  assert.equal(isLocalReference('assets/js/main.js'), true);
  assert.equal(resolveReference('tools/blog/index.html', '../stock/index.html'), 'tools/stock/index.html');
  assert.deepEqual(
    referencedPaths('index.html', '<script src="assets/js/main.js"></script><script>fetch(\'tools/blog/data/posts-meta.json\')</script>'),
    ['assets/js/main.js', 'tools/blog/data/posts-meta.json'],
  );
});

test('public dist output directory cannot escape the repository', () => {
  assert.throws(() => outputDirFromArgs(['--out', '../outside']), /must stay within the repository/);
  assert.match(outputDirFromArgs(['--out', 'dist/smoke']), /[\\/]dist[\\/]smoke$/);
});
