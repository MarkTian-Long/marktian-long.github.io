const test = require('node:test');
const assert = require('node:assert/strict');

const {
  absoluteUrl,
  buildRobots,
  buildSitemap,
  buildRss,
  ensureArticleSeo,
  extractBody
} = require('./search-foundation');
const { buildSearchAssets } = require('./generate-search-assets');

const config = Object.freeze({
  siteUrl: 'https://marktian-long.github.io',
  siteName: 'Leo Liu · AI / Product / Builder',
  siteDescription: 'Leo Liu — AI 产品与工程实践，写关于 AI 落地的独立观察。',
  author: {
    name: 'Leo Liu',
    url: 'https://marktian-long.github.io'
  },
  blog: {
    title: '思考碎片 — Leo Liu',
    description: 'Leo Liu 关于 AI、产品、工程与商业的长期思考。',
    path: '/tools/blog/',
    feedPath: '/feed.xml',
    imagePath: '/assets/images/og-cover.png',
    feedLimit: 20
  }
});

test('absoluteUrl normalizes the site root and relative path', () => {
  assert.equal(
    absoluteUrl('https://marktian-long.github.io', 'tools/blog/'),
    'https://marktian-long.github.io/tools/blog/'
  );
});

test('buildRobots keeps wildcard access and declares the sitemap', () => {
  assert.equal(
    buildRobots({ siteUrl: 'https://marktian-long.github.io' }),
    'User-agent: *\nAllow: /\n\n'
      + 'Sitemap: https://marktian-long.github.io/sitemap.xml\n'
  );
});

test('buildSitemap escapes URLs and includes every supplied page once', () => {
  const xml = buildSitemap(
    { siteUrl: 'https://marktian-long.github.io' },
    ['/', '/tools/blog/', '/tools/blog/posts/a.html']
  );

  assert.match(xml, /<loc>https:\/\/marktian-long\.github\.io\/<\/loc>/);
  assert.equal((xml.match(/<url>/g) || []).length, 3);
});

test('buildRss limits items, escapes XML, and uses absolute links', () => {
  const posts = Array.from({ length: 22 }, (_, index) => ({
    slug: `post-${index}`,
    title: index === 0 ? 'A & B < C "quote"' : `Post ${index}`,
    summary: index === 0 ? 'Summary & detail <ok>' : `Summary ${index}`,
    url: `posts/post-${index}.html`
  }));

  const xml = buildRss(config, posts);

  assert.equal((xml.match(/<item>/g) || []).length, 20);
  assert.match(xml, /<title>A &amp; B &lt; C &quot;quote&quot;<\/title>/);
  assert.match(xml, /<description>Summary &amp; detail &lt;ok&gt;<\/description>/);
  assert.match(xml, /<link>https:\/\/marktian-long\.github\.io\/tools\/blog\/posts\/post-0\.html<\/link>/);
  assert.match(xml, /<guid>https:\/\/marktian-long\.github\.io\/tools\/blog\/posts\/post-0\.html<\/guid>/);
  assert.doesNotMatch(xml, /<pubDate>/);
});

test('ensureArticleSeo inserts an idempotent head block without changing body', () => {
  const sourceHtml = [
    '<!doctype html>',
    '<html lang="zh-CN">',
    '<head>',
    '<meta charset="UTF-8" />',
    '<title>Old title</title>',
    '<meta property="og:title" content="Old title" />',
    '</head>',
    '<body>',
    '<main><h1>Visible body</h1><p>Do not touch.</p></main>',
    '</body>',
    '</html>'
  ].join('\n');
  const metadata = {
    slug: 'example-post',
    title: 'Example <Post>',
    summary: 'Summary with "quotes" & angle <brackets>.',
    url: 'posts/example-post.html'
  };

  const once = ensureArticleSeo(sourceHtml, metadata, config);
  const twice = ensureArticleSeo(once, metadata, config);

  assert.equal(twice, once);
  assert.equal(extractBody(once), extractBody(sourceHtml));
  assert.match(once, /<meta name="description"/);
  assert.match(once, /<link rel="canonical"/);
  assert.match(once, /"@type":"BlogPosting"/);
});

test('buildSearchAssets emits entry pages, unique article URLs, and a limited feed', () => {
  const posts = Array.from({ length: 22 }, (_, index) => ({
    slug: `post-${index}`,
    title: `Post ${index}`,
    summary: `Summary ${index}`,
    url: `posts/post-${index}.html`
  }));

  const assets = buildSearchAssets(config, posts);

  assert.match(assets.sitemap, /<loc>https:\/\/marktian-long\.github\.io\/<\/loc>/);
  assert.match(assets.sitemap, /<loc>https:\/\/marktian-long\.github\.io\/tools\/blog\/<\/loc>/);
  assert.match(assets.sitemap, /<loc>https:\/\/marktian-long\.github\.io\/tools\/blog\/posts\/post-0\.html<\/loc>/);
  assert.equal((assets.sitemap.match(/<url>/g) || []).length, 24);
  assert.equal((assets.feed.match(/<item>/g) || []).length, 20);
});

test('buildSearchAssets rejects duplicate slugs and URLs', () => {
  const duplicateSlugPosts = [
    { slug: 'same', title: 'A', summary: 'A', url: 'posts/a.html' },
    { slug: 'same', title: 'B', summary: 'B', url: 'posts/b.html' }
  ];
  const duplicateUrlPosts = [
    { slug: 'a', title: 'A', summary: 'A', url: 'posts/same.html' },
    { slug: 'b', title: 'B', summary: 'B', url: 'posts/same.html' }
  ];

  assert.throws(() => buildSearchAssets(config, duplicateSlugPosts), /Duplicate slug/);
  assert.throws(() => buildSearchAssets(config, duplicateUrlPosts), /Duplicate url/);
});
