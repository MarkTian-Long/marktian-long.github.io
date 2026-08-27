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
  assert.ok(files.includes('tools/blog/article-links.css'));
  assert.ok(files.includes('tools/blog/article-runtime.js'));
  assert.ok(files.includes('tools/blog/share-card.html'));
  assert.ok(files.includes('tools/blog/share-card.css'));
  assert.ok(files.includes('tools/blog/share-card.js'));
  assert.ok(files.includes('tools/blog/vendor/qrcode-generator.js'));
  assert.ok(files.includes('tools/blog/data/share-card-config.json'));
  assert.ok(files.includes('tools/blog/data/featured-posts.json'));
  assert.ok(files.includes('tools/blog/index.html'));
  assert.ok(files.includes('tools/blog/posts/agent-boundary.html'));
  assert.ok(files.includes('tools/service-agent/index.html'));
  assert.ok(files.includes('tools/esop-extractor/app.js'));
  assert.ok(files.includes('tools/stock/app.js'));
  assert.ok(!files.some(file => file.startsWith('tools/dashboard/')));
  assert.ok(!files.some(file => file.startsWith('tools/product-collector/')));
  assert.ok(!files.some(file => /(?:README\.md|config\.example\.js|gen_index\.js|proxy\.py)$/.test(file)));
});

test('Stock and ESOP load their application logic from dedicated files', () => {
  const fixtures = [
    ['tools/esop-extractor/index.html', 'tools/esop-extractor/app.js'],
    ['tools/stock/index.html', 'tools/stock/app.js'],
  ];
  for (const [htmlFile, appFile] of fixtures) {
    const html = require('node:fs').readFileSync(path.join(repoRoot, htmlFile), 'utf8');
    assert.match(html, new RegExp(`<script\\s+src=["']\\./app\\.js["']><\\/script>`));
    assert.doesNotMatch(html, /function\s+(?:startExtraction|handleSend)\s*\(/);
    assert.match(require('node:fs').readFileSync(path.join(repoRoot, appFile), 'utf8'), /function\s+/);
  }
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

test('external scripts resolve fetch paths from the document that executes them', () => {
  assert.deepEqual(
    referencedPaths(
      'tools/blog/article-runtime.js',
      "fetch('../data/posts-meta.json')",
      'tools/blog/posts/example.html',
    ),
    ['tools/blog/data/posts-meta.json'],
  );
  assert.deepEqual(
    referencedPaths(
      'tools/blog/share-card.js',
      "fetch('data/share-card-config.json'); fetch('data/posts-meta.json')",
      'tools/blog/share-card.html',
    ),
    ['tools/blog/data/share-card-config.json', 'tools/blog/data/posts-meta.json'],
  );
});

test('public dist output directory cannot escape the repository', () => {
  assert.throws(() => outputDirFromArgs(['--out', '../outside']), /must stay within the repository/);
  assert.match(outputDirFromArgs(['--out', 'dist/smoke']), /[\\/]dist[\\/]smoke$/);
});
