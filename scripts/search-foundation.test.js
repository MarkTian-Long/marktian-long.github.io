const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const {
  absoluteUrl,
  buildRobots,
  buildSitemap,
  buildRss,
  ensureArticleSeo,
  extractBody
} = require('./search-foundation');
const { buildSearchAssets } = require('./generate-search-assets');
const { retrofitBlogSeo } = require('./retrofit-blog-seo');

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

function makeRetrofitFixture(html, posts) {
  const rootDir = fs.mkdtempSync(path.join(os.tmpdir(), 'search-foundation-'));
  fs.mkdirSync(path.join(rootDir, 'tools/blog/data'), { recursive: true });
  fs.mkdirSync(path.join(rootDir, 'tools/blog/posts'), { recursive: true });
  fs.writeFileSync(
    path.join(rootDir, 'tools/blog/data/posts-meta.json'),
    JSON.stringify({ posts }, null, 2),
    'utf8'
  );
  for (const post of posts) {
    if (html !== null) {
      fs.writeFileSync(path.join(rootDir, 'tools/blog', post.url), html, 'utf8');
    }
  }
  return rootDir;
}

test('retrofitBlogSeo supports dry-run, check, write, and idempotent rewrites', () => {
  const sourceHtml = [
    '<!doctype html>',
    '<html lang="zh-CN">',
    '<head>',
    '<title>Example</title>',
    '</head>',
    '<body>',
    '<main><p>Body stays put.</p></main>',
    '</body>',
    '</html>'
  ].join('\n');
  const posts = [{
    slug: 'example',
    title: 'Example',
    summary: 'Example summary',
    url: 'posts/example.html'
  }];
  const rootDir = makeRetrofitFixture(sourceHtml, posts);
  const filePath = path.join(rootDir, 'tools/blog/posts/example.html');

  const dryRun = retrofitBlogSeo({ argv: [], rootDir, siteConfig: config });
  assert.equal(dryRun.code, 0);
  assert.equal(fs.readFileSync(filePath, 'utf8'), sourceHtml);

  const check = retrofitBlogSeo({ argv: ['--check'], rootDir, siteConfig: config });
  assert.equal(check.code, 1);
  assert.match(check.messages.join('\n'), /MISSING/);

  const write = retrofitBlogSeo({ argv: ['--write'], rootDir, siteConfig: config });
  const writtenHtml = fs.readFileSync(filePath, 'utf8');
  assert.equal(write.code, 0);
  assert.notEqual(writtenHtml, sourceHtml);
  assert.equal(extractBody(writtenHtml), extractBody(sourceHtml));
  assert.match(writtenHtml, /search-foundation:start/);

  const secondWrite = retrofitBlogSeo({ argv: ['--write'], rootDir, siteConfig: config });
  assert.equal(secondWrite.code, 0);
  assert.equal(fs.readFileSync(filePath, 'utf8'), writtenHtml);
});

test('retrofitBlogSeo fails when metadata files are missing or HTML is malformed', () => {
  const validHtml = '<html><head><title>Example</title></head><body><p>Body</p></body></html>';
  const missingFileRoot = makeRetrofitFixture(null, [{
    slug: 'missing',
    title: 'Missing',
    summary: 'Missing summary',
    url: 'posts/missing.html'
  }]);
  const missingBodyRoot = makeRetrofitFixture('<html><head><title>Bad</title></head></html>', [{
    slug: 'bad-body',
    title: 'Bad Body',
    summary: 'Bad summary',
    url: 'posts/bad-body.html'
  }]);
  const missingHeadRoot = makeRetrofitFixture('<html><body><p>Bad</p></body></html>', [{
    slug: 'bad-head',
    title: 'Bad Head',
    summary: 'Bad summary',
    url: 'posts/bad-head.html'
  }]);
  const excludedRoot = makeRetrofitFixture(validHtml, [{
    slug: 'example',
    title: 'Example',
    summary: 'Example summary',
    url: 'posts/example.html'
  }]);

  assert.equal(retrofitBlogSeo({ argv: ['--check'], rootDir: missingFileRoot, siteConfig: config }).code, 1);
  assert.equal(retrofitBlogSeo({ argv: ['--write'], rootDir: missingBodyRoot, siteConfig: config }).code, 1);
  assert.equal(retrofitBlogSeo({ argv: ['--write'], rootDir: missingHeadRoot, siteConfig: config }).code, 1);
  assert.equal(
    retrofitBlogSeo({
      argv: ['--write', '--exclude', 'tools/blog/posts/example.html'],
      rootDir: excludedRoot,
      siteConfig: config
    }).code,
    0
  );
});
