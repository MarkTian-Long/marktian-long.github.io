const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const cheerio = require('cheerio');
const jsQR = require('jsqr');

const metadata = require('../tools/blog/data/posts-meta.json');
const siteConfig = require('./site-config');
const { articleUrl } = require('./search-foundation');
const { buildShareCardConfig, validateBlogMetadata } = require('./generate-search-assets');
const articleRuntime = require('../tools/blog/article-runtime');
const shareCard = require('../tools/blog/share-card');
const qrcode = require('../tools/blog/vendor/qrcode-generator');

const repoRoot = path.resolve(__dirname, '..');
const normalize = (value) => String(value).replace(/\s+/g, '').replace(/[“”]/g, '"').replace(/[‘’]/g, "'");
const normalizeLineEndings = (value) => String(value).replace(/\r\n?/g, '\n');

test('v3 blog metadata has a trimmed, body-grounded share_quote for every post', () => {
  assert.equal(metadata.version, 3);
  assert.ok(metadata.posts.length > 0, 'posts metadata must contain at least one published post');
  assert.doesNotThrow(() => validateBlogMetadata(metadata));
  assert.equal(metadata.posts.filter((post) => typeof post.share_quote === 'string' && post.share_quote.trim()).length, metadata.posts.length);
  assert.equal(
    metadata.posts.find((post) => post.slug === 'alignment-under-change').share_quote,
    '我们不只需要决定 AI 今天应该是什么样，还要决定它和我们明天可以怎样一起变化。'
  );

  for (const post of metadata.posts) {
    const articleHtml = fs.readFileSync(path.join(repoRoot, 'tools/blog', post.url), 'utf8');
    const $ = cheerio.load(articleHtml);
    assert.ok(normalize($('.post-body').text()).includes(normalize(post.share_quote)), `${post.slug} share_quote must occur in published body`);
    assert.match(articleHtml, /<script src="\.\.\/article-runtime\.js"><\/script>/, `${post.slug} must use the shared share-card entry runtime`);
    assert.ok($('.top-bar').length, `${post.slug} must have a shared-entry host`);
  }
});

test('share_quote does not alter continue-reading selection or article SEO source fields', () => {
  for (const post of metadata.posts) {
    const withoutQuote = metadata.posts.map((entry) => {
      const clone = { ...entry };
      delete clone.share_quote;
      return clone;
    });
    const actual = articleRuntime.selectContinueReading(metadata.posts, post.slug, new Set()).map((entry) => [entry.post.slug, entry.relationType]);
    const expected = articleRuntime.selectContinueReading(withoutQuote, post.slug, new Set()).map((entry) => [entry.post.slug, entry.relationType]);
    assert.deepEqual(actual, expected, post.slug);
  }
  const articleHead = fs.readFileSync(path.join(repoRoot, 'tools/blog/posts/alignment-under-change.html'), 'utf8').split('</head>', 1)[0];
  assert.doesNotMatch(articleHead, /share_quote/);
});

test('share-card config and canonical article URL use the one site configuration', () => {
  const actualConfig = fs.readFileSync(path.join(repoRoot, 'tools/blog/data/share-card-config.json'), 'utf8');
  assert.equal(normalizeLineEndings(actualConfig), normalizeLineEndings(buildShareCardConfig(siteConfig)));
  const post = metadata.posts.find((entry) => entry.slug === 'alignment-under-change');
  const model = shareCard.createPosterModel(post, JSON.parse(actualConfig));
  const expected = 'https://marktian-long.github.io/tools/blog/posts/alignment-under-change.html';
  assert.equal(model.articleUrl, expected);
  assert.equal(model.articleUrl, articleUrl(siteConfig, post));
  assert.doesNotMatch(model.articleUrl, /localhost|127\.0\.0\.1/i);
  assert.equal(model.authorName, siteConfig.author.name);
  assert.equal(model.date, '2026/08');
});

test('share-card loads the same font variants as the site entry', () => {
  const fontUrl = (file) => {
    const source = fs.readFileSync(path.join(repoRoot, file), 'utf8');
    const match = source.match(/https:\/\/fonts\.googleapis\.com\/css2\?[^"\s]+/);
    assert.ok(match, `${file} must load the shared Google Fonts URL`);
    return match[0];
  };
  assert.equal(fontUrl('tools/blog/share-card.html'), fontUrl('index.html'));
});

test('QR uses local M-level encoding, a quiet zone, and decodes to the canonical article URL', () => {
  const post = metadata.posts.find((entry) => entry.slug === 'alignment-under-change');
  const model = shareCard.createPosterModel(post, JSON.parse(buildShareCardConfig(siteConfig)));
  const matrix = shareCard.createQrMatrix(model.articleUrl, qrcode);
  const pixels = shareCard.renderQrPixels(matrix, 8);
  const decoded = jsQR(pixels.data, pixels.width, pixels.height, { inversionAttempts: 'dontInvert' });

  assert.equal(matrix.payload, model.articleUrl);
  assert.equal(matrix.errorCorrection, 'M');
  assert.equal(matrix.quietZone, 4);
  assert.ok(matrix.moduleCount > 20);
  assert.ok(decoded, 'independent decoder should read the QR image');
  assert.equal(decoded.data, model.articleUrl);
});

test('poster wrapping keeps fitting Latin terms and technical identifiers intact', () => {
  const monoContext = { measureText(value) { return { width: Array.from(value).length * 10 }; } };
  assert.deepEqual(
    shareCard.linesForWidth(monoContext, '中文模型的 Harness', 100),
    ['中文模型的', 'Harness']
  );
  assert.deepEqual(
    shareCard.linesForWidth(monoContext, '中文模型的 GPT-4.1', 100),
    ['中文模型的', 'GPT-4.1']
  );
  assert.deepEqual(
    shareCard.linesForWidth(monoContext, '当人和 AI 都在改变，“对齐”还能一次完成吗？', 150),
    ['当人和 AI 都在改变，', '“对齐”还能一次完成吗？']
  );
});

test('poster model fails clearly if a new article omits share_quote', () => {
  const post = { ...metadata.posts[0] };
  delete post.share_quote;
  assert.throws(() => shareCard.createPosterModel(post, JSON.parse(buildShareCardConfig(siteConfig))), /分享引语/);
  assert.equal(articleRuntime.shareCardHref(metadata.posts[0]), '../share-card.html?slug=alignment-under-change');
  assert.equal(shareCard.filenameFor({ slug: 'alignment-under-change' }), 'alignment-under-change-share.png');
});
