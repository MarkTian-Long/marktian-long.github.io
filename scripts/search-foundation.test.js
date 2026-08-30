const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const {
  absoluteUrl,
  buildRobots,
  buildSitemap,
  buildRss,
  ensureArticleSeo,
  ensureEntryPageSeo,
  extractBody
} = require('./search-foundation');
const {
  buildSearchAssets,
  buildShareCardConfig,
  targetContents,
  changedTargets,
  validatePosts,
  validateBlogMetadata,
  parseArgs: parseSearchAssetArgs
} = require('./generate-search-assets');
const {
  retrofitBlogSeo,
  parseArgs: parseRetrofitArgs
} = require('./retrofit-blog-seo');
const { checkSearchFoundation } = require('./check-search-foundation');

const config = Object.freeze({
  siteUrl: 'https://marktian-long.github.io',
  siteName: 'Leo Liu · AI / Product / Builder',
  siteDescription: 'Leo Liu — AI 产品与工程实践，写关于 AI 落地的独立观察。',
  author: {
    name: 'Leo Liu'
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

test('XML generators reject XML 1.0 control characters', () => {
  assert.throws(
    () => buildRss(config, [{
      slug: 'bad',
      title: 'Bad',
      summary: 'Bad\u0001summary',
      url: 'posts/bad.html'
    }]),
    /forbidden by XML 1\.0/
  );
  assert.throws(
    () => buildRss(config, [{
      slug: 'bad-surrogate',
      title: 'Bad',
      summary: 'Bad\uD800summary',
      url: 'posts/bad-surrogate.html'
    }]),
    /unpaired UTF-16 surrogate/
  );
  assert.doesNotThrow(
    () => buildRss(config, [{
      slug: 'valid-surrogate-pair',
      title: 'Valid',
      summary: 'Valid \uD83D\uDE00 summary',
      url: 'posts/valid-surrogate-pair.html'
    }])
  );
});

test('ensureArticleSeo inserts an idempotent head block without changing body', () => {
  const sourceHtml = [
    '<!doctype html>',
    '<html lang="zh-CN">',
    '<head>',
    '<meta charset="UTF-8" />',
    '<title>Old title</title>',
    '<meta property="og:title" content="Old title" />',
    '<meta property="og:description" content="Old summary" />',
    '<meta property="og:url" content="https://old.example/post.html" />',
    '<meta property="og:image" content="https://old.example/cover.png" />',
    '<meta name="twitter:title" content="Old title" />',
    '<meta name="twitter:description" content="Old summary" />',
    '<meta name="twitter:image" content="https://old.example/cover.png" />',
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
  assert.doesNotMatch(once, /old\.example/);
  assert.match(once, /"url":"https:\/\/marktian-long\.github\.io\/"/);
  assert.match(once, /<meta property="og:title" content="Example &lt;Post&gt;" \/>/);
  assert.match(once, /<meta property="og:description" content="Summary with &quot;quotes&quot; &amp; angle &lt;brackets&gt;\." \/>/);
  assert.match(once, /<meta name="twitter:title" content="Example &lt;Post&gt;" \/>/);
  assert.match(once, /<meta name="twitter:description" content="Summary with &quot;quotes&quot; &amp; angle &lt;brackets&gt;\." \/>/);
});

test('SEO rewrites preserve unrelated JSON-LD scripts', () => {
  const breadcrumb = '<script type="application/ld+json">{"@type":"BreadcrumbList"}</script>';
  const organization = '<script type="application/ld+json">{"@type":"Organization"}</script>';
  const article = '<script type="application/ld+json">{"@type":"BlogPosting"}</script>';
  const articleArray = '<script type="application/ld+json">[{"@type":"BlogPosting","marker":"array"}]</script>';
  const articleMultiType = '<script type="application/ld+json">{"@type":["BlogPosting","Article"],"marker":"multi"}</script>';
  const website = '<script type="application/ld+json">{"@type":"WebSite"}</script>';
  const sourceArticle = `<html><head><title>Article</title>${breadcrumb}${article}${articleArray}${articleMultiType}${organization}</head>`
    + '<body>Article body</body></html>';
  const sourceEntry = `<html><head><title>Home</title>${organization}${website}${breadcrumb}</head>`
    + '<body>Home body</body></html>';
  const metadata = {
    slug: 'example',
    title: 'Example',
    summary: 'Example summary',
    url: 'posts/example.html'
  };

  const rewrittenArticle = ensureArticleSeo(sourceArticle, metadata, config);
  const rewrittenEntry = ensureEntryPageSeo(sourceEntry, 'home', config);

  assert.match(rewrittenArticle, /"@type":"BreadcrumbList"/);
  assert.match(rewrittenArticle, /"@type":"Organization"/);
  assert.equal((rewrittenArticle.match(/"@type":"BlogPosting"/g) || []).length, 1);
  assert.doesNotMatch(rewrittenArticle, /"marker":"array"|"marker":"multi"/);
  assert.match(rewrittenEntry, /"@type":"Organization"/);
  assert.match(rewrittenEntry, /"@type":"BreadcrumbList"/);
  assert.equal((rewrittenEntry.match(/"@type":"WebSite"/g) || []).length, 1);
});

test('ensureEntryPageSeo centralizes entry metadata without changing body', () => {
  const sourceHtml = '<html><head><title>Home</title>'
    + '<meta name="description" content="Old" />'
    + '<link rel="canonical" href="https://old.example/" />'
    + '<meta property="og:url" content="https://old.example/" />'
    + '<script type="application/ld+json">{"@context":"https://schema.org","@type":"WebSite"}</script>'
    + '</head><body><main>Visible</main></body></html>';

  const once = ensureEntryPageSeo(sourceHtml, 'home', config);
  const twice = ensureEntryPageSeo(once, 'home', config);

  assert.equal(twice, once);
  assert.equal(extractBody(once), extractBody(sourceHtml));
  assert.doesNotMatch(once, /old\.example/);
  assert.match(once, /search-foundation-entry:start/);
  assert.match(once, /"@graph"/);
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
    { slug: 'same', title: 'A', summary: 'A', url: 'posts/same.html' },
    { slug: 'same', title: 'B', summary: 'B', url: 'posts/same.html' }
  ];
  const duplicateUrlPosts = [
    { slug: 'same', title: 'A', summary: 'A', url: 'posts/same.html' },
    { slug: 'same', title: 'B', summary: 'B', url: 'posts/same.html' }
  ];

  assert.throws(() => buildSearchAssets(config, duplicateSlugPosts), /Duplicate slug/);
  assert.throws(() => validatePosts(duplicateUrlPosts), /Duplicate slug|Duplicate url/);
});

test('validatePosts rejects malformed fields and unsafe article paths', () => {
  assert.throws(
    () => validatePosts([{ slug: {}, title: 'A', summary: 'A', url: 'posts/a.html' }]),
    /slug.*string/
  );
  assert.throws(
    () => validatePosts([{ slug: '../a', title: 'A', summary: 'A', url: '../../../outside.html' }]),
    /Invalid slug|Invalid url/
  );
  assert.throws(
    () => validatePosts([{ slug: 'a', title: 'A', summary: 'A', url: 'posts/./a.html' }]),
    /Invalid url/
  );
  assert.throws(
    () => validatePosts([{ slug: 'a', title: ' A', summary: 'A', url: 'posts/a.html' }]),
    /trimmed/
  );
});

test('validateBlogMetadata requires compact, specific retrieval concepts', () => {
  const valid = {
    version: 3,
    posts: [{
      slug: 'example',
      date: '2026.08',
      title: 'Example',
      summary: 'This summary identifies the object, judgement, and mechanism.',
      share_quote: 'This is the conclusion worth carrying into a share card.',
      tags: ['决策框架'],
      topics: ['企业AI'],
      category: '产品',
      concepts: ['POC 验证范围', '验收标准', '金融软件厂商', '正式项目转化'],
      url: 'posts/example.html'
    }]
  };

  assert.doesNotThrow(() => validateBlogMetadata(valid));
  assert.throws(
    () => validateBlogMetadata({ ...valid, version: 1 }),
    /version must be 3/
  );
  assert.throws(
    () => validateBlogMetadata({ ...valid, posts: [{ ...valid.posts[0], date: '2026-08' }] }),
    /YYYY\.MM/
  );
  assert.throws(
    () => validateBlogMetadata({ ...valid, posts: [{ ...valid.posts[0], share_quote: ' ' }] }),
    /share_quote/
  );
  assert.throws(
    () => validateBlogMetadata({ ...valid, posts: [{ ...valid.posts[0], tags: [] }] }),
    /tags.*non-empty array/
  );
  assert.throws(
    () => validateBlogMetadata({ ...valid, posts: [{ ...valid.posts[0], category: '其他' }] }),
    /category is invalid/
  );
  assert.throws(
    () => validateBlogMetadata({ ...valid, posts: [{ ...valid.posts[0], concepts: undefined }] }),
    /concepts.*array/
  );
  assert.throws(
    () => validateBlogMetadata({ ...valid, posts: [{ ...valid.posts[0], concepts: ['a', 'b', 'c'] }] }),
    /4 to 7/
  );
  assert.throws(
    () => validateBlogMetadata({ ...valid, posts: [{ ...valid.posts[0], concepts: ['AI', '验收标准', '金融软件厂商', '正式项目转化'] }] }),
    /generic/
  );
  assert.throws(
    () => validateBlogMetadata({ ...valid, posts: [{ ...valid.posts[0], concepts: ['企业AI', '验收标准', '金融软件厂商', '正式项目转化'] }] }),
    /duplicate tag or topic/
  );
  assert.throws(
    () => validateBlogMetadata({ ...valid, posts: [{ ...valid.posts[0], concepts: ['验收标准', '验收标准', '金融软件厂商', '正式项目转化'] }] }),
    /unique/
  );
});

test('search CLIs reject unknown and ambiguous options', () => {
  assert.throws(() => parseSearchAssetArgs(['--wrtie']), /Unknown option/);
  assert.throws(() => parseSearchAssetArgs(['--write', '--check']), /either/);
  assert.throws(() => parseRetrofitArgs(['--wrtie']), /Unknown option/);
  assert.throws(() => parseRetrofitArgs(['--exclude', '--write']), /non-option path/);
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
    share_quote: 'Example conclusion.',
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

function makeCheckFixture(postOverrides = {}) {
  const rootDir = fs.mkdtempSync(path.join(os.tmpdir(), 'search-check-'));
  const posts = [{
    slug: 'example',
    date: '2026.08',
    title: 'Example',
    summary: 'Example summary',
    share_quote: 'Example conclusion.',
    tags: ['决策框架'],
    topics: ['企业AI'],
    category: '产品',
    concepts: ['验证范围', '验收标准', '金融软件厂商', '正式项目转化'],
    url: 'posts/example.html',
    ...postOverrides
  }];
  fs.mkdirSync(path.join(rootDir, 'tools/blog/data'), { recursive: true });
  fs.mkdirSync(path.join(rootDir, 'tools/blog/posts'), { recursive: true });
  fs.writeFileSync(
    path.join(rootDir, 'tools/blog/data/posts-meta.json'),
    JSON.stringify({ version: 3, posts }, null, 2),
    'utf8'
  );
  const assets = buildSearchAssets(config, posts);
  fs.writeFileSync(path.join(rootDir, 'robots.txt'), assets.robots, 'utf8');
  fs.writeFileSync(path.join(rootDir, 'sitemap.xml'), assets.sitemap, 'utf8');
  fs.writeFileSync(path.join(rootDir, 'feed.xml'), assets.feed, 'utf8');
  fs.writeFileSync(path.join(rootDir, 'tools/blog/data/share-card-config.json'), buildShareCardConfig(config), 'utf8');
  fs.writeFileSync(
    path.join(rootDir, 'tools/blog/article-links.css'),
    '.post-body a.related-item,\n'
      + '.post-body a.related-item:hover,\n'
      + '.post-body .post-nav a:hover { text-decoration: none; }\n',
    'utf8'
  );
  fs.writeFileSync(path.join(rootDir, 'tools/blog/article-runtime.js'), '/* loads article-links.css */\n', 'utf8');

  const article = ensureArticleSeo(
    '<html><head><title>Example</title></head><body><main>Article</main><script src="../article-runtime.js"></script></body></html>',
    posts[0],
    config
  );
  fs.writeFileSync(path.join(rootDir, 'tools/blog/posts/example.html'), article, 'utf8');
  const home = ensureEntryPageSeo(
    '<html><head><title>Home</title></head><body>Home</body></html>',
    'home',
    config
  );
  fs.writeFileSync(path.join(rootDir, 'index.html'), home, 'utf8');
  fs.mkdirSync(path.join(rootDir, 'tools/blog'), { recursive: true });
  const blog = ensureEntryPageSeo(
    '<html><head><title>Blog</title></head><body>Blog</body></html>',
    'blog',
    config
  );
  fs.writeFileSync(path.join(rootDir, 'tools/blog/index.html'), blog, 'utf8');

  return { rootDir, posts };
}

test('checkSearchFoundation passes a complete fixture', () => {
  const { rootDir } = makeCheckFixture();
  const result = checkSearchFoundation({ rootDir, siteConfig: config });

  assert.equal(result.code, 0);
});

test('checkSearchFoundation accepts escaped social metadata values', () => {
  const { rootDir } = makeCheckFixture({
    title: 'A & B <C>',
    summary: 'Summary with "quotes" & <angles>'
  });
  const result = checkSearchFoundation({ rootDir, siteConfig: config });

  assert.equal(result.code, 0, result.errors.join('\n'));
});

test('checkSearchFoundation reports missing sitemap entries', () => {
  const { rootDir } = makeCheckFixture();
  fs.writeFileSync(
    path.join(rootDir, 'sitemap.xml'),
    buildSitemap(config, ['/', '/tools/blog/']),
    'utf8'
  );

  const result = checkSearchFoundation({ rootDir, siteConfig: config });

  assert.equal(result.code, 1);
  assert.match(result.errors.join('\n'), /sitemap/);
});

test('checkSearchFoundation reports article SEO defects', () => {
  const canonicalRoot = makeCheckFixture().rootDir;
  const descriptionRoot = makeCheckFixture().rootDir;
  const jsonRoot = makeCheckFixture().rootDir;
  const duplicateCanonicalRoot = makeCheckFixture().rootDir;
  const staleJsonRoot = makeCheckFixture().rootDir;
  const duplicateArrayJsonRoot = makeCheckFixture().rootDir;
  const articlePath = 'tools/blog/posts/example.html';

  fs.writeFileSync(
    path.join(canonicalRoot, articlePath),
    fs.readFileSync(path.join(canonicalRoot, articlePath), 'utf8')
      .replace('https://marktian-long.github.io/tools/blog/posts/example.html', 'https://example.com/wrong.html'),
    'utf8'
  );
  fs.writeFileSync(
    path.join(descriptionRoot, articlePath),
    fs.readFileSync(path.join(descriptionRoot, articlePath), 'utf8')
      .replace(/<meta name="description"[^>]+>\n/, ''),
    'utf8'
  );
  fs.writeFileSync(
    path.join(jsonRoot, articlePath),
    fs.readFileSync(path.join(jsonRoot, articlePath), 'utf8')
      .replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/, '<script type="application/ld+json">{bad</script>'),
    'utf8'
  );
  fs.writeFileSync(
    path.join(duplicateCanonicalRoot, articlePath),
    fs.readFileSync(path.join(duplicateCanonicalRoot, articlePath), 'utf8')
      .replace('</head>', '<link rel="canonical" href="https://marktian-long.github.io/tools/blog/posts/example.html" /></head>'),
    'utf8'
  );
  fs.writeFileSync(
    path.join(staleJsonRoot, articlePath),
    fs.readFileSync(path.join(staleJsonRoot, articlePath), 'utf8')
      .replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/, '<script type="application/ld+json">{}</script>'),
    'utf8'
  );
  fs.writeFileSync(
    path.join(duplicateArrayJsonRoot, articlePath),
    fs.readFileSync(path.join(duplicateArrayJsonRoot, articlePath), 'utf8')
      .replace(
        '</head>',
        '<script type="application/ld+json">[{"@type":["BlogPosting","Article"],"marker":"legacy"}]</script></head>'
      ),
    'utf8'
  );

  assert.match(checkSearchFoundation({ rootDir: canonicalRoot, siteConfig: config }).errors.join('\n'), /canonical/);
  assert.match(checkSearchFoundation({ rootDir: descriptionRoot, siteConfig: config }).errors.join('\n'), /description/);
  assert.match(checkSearchFoundation({ rootDir: jsonRoot, siteConfig: config }).errors.join('\n'), /JSON-LD/);
  assert.match(checkSearchFoundation({ rootDir: duplicateCanonicalRoot, siteConfig: config }).errors.join('\n'), /duplicate canonical/);
  assert.match(checkSearchFoundation({ rootDir: staleJsonRoot, siteConfig: config }).errors.join('\n'), /JSON-LD|stale/);
  assert.match(
    checkSearchFoundation({ rootDir: duplicateArrayJsonRoot, siteConfig: config }).errors.join('\n'),
    /JSON-LD count mismatch|stale/
  );
});

test('checkSearchFoundation reports feed and robots defects', () => {
  const feedRoot = makeCheckFixture().rootDir;
  const robotsRoot = makeCheckFixture().rootDir;
  fs.writeFileSync(
    path.join(feedRoot, 'feed.xml'),
    '<rss><channel>' + '<item></item>'.repeat(config.blog.feedLimit + 1) + '</channel></rss>',
    'utf8'
  );
  fs.writeFileSync(path.join(robotsRoot, 'robots.txt'), 'User-agent: *\nAllow: /\n', 'utf8');

  assert.match(checkSearchFoundation({ rootDir: feedRoot, siteConfig: config }).errors.join('\n'), /feed/);
  assert.match(checkSearchFoundation({ rootDir: robotsRoot, siteConfig: config }).errors.join('\n'), /robots/);
});

test('checkSearchFoundation reports orphaned articles', () => {
  const { rootDir } = makeCheckFixture();
  fs.writeFileSync(
    path.join(rootDir, 'tools/blog/posts/orphan.html'),
    '<html><head><title>Orphan</title></head><body>Orphan</body></html>',
    'utf8'
  );

  const result = checkSearchFoundation({ rootDir, siteConfig: config });

  assert.equal(result.code, 1);
  assert.match(result.errors.join('\n'), /Orphan article file/);
  assert.doesNotMatch(result.messages.join('\n'), /PASS blog article SEO/);
});

test('targetContents replaces every configured domain in generated outputs and pages', () => {
  const { rootDir, posts } = makeCheckFixture();
  const customConfig = {
    ...config,
    siteUrl: 'https://example.com',
    author: { name: config.author.name }
  };

  const contents = targetContents(customConfig, posts, rootDir);
  const combined = Object.values(contents).join('\n');

  assert.match(combined, /https:\/\/example\.com\//);
  assert.doesNotMatch(combined, /marktian-long\.github\.io/);
  assert.equal(Object.keys(contents).length, 7);
});

test('search asset freshness checks tolerate Windows CRLF checkouts', () => {
  const { rootDir, posts } = makeCheckFixture();
  const contents = targetContents(config, posts, rootDir);
  for (const [file, content] of Object.entries(contents)) {
    fs.writeFileSync(path.join(rootDir, file), content.replace(/\n/g, '\r\n'), 'utf8');
  }

  assert.deepEqual(changedTargets(rootDir, contents), []);
});

test('generate-post CLI produces centralized SEO metadata without changing URL shape', () => {
  const rootDir = path.resolve(__dirname, '..');
  const outputDir = fs.mkdtempSync(path.join(os.tmpdir(), 'search-post-cli-'));
  const outputPath = path.join(outputDir, 'fde-blog-v3.html');
  const result = spawnSync(
    process.execPath,
    [
      path.join(rootDir, 'tools/blog/generate-post.js'),
      '--write',
      path.join(rootDir, 'docs/blog/fde-blog-v3.md'),
      outputPath
    ],
    { cwd: rootDir, encoding: 'utf8' }
  );

  assert.equal(result.status, 0, result.stderr);
  const html = fs.readFileSync(outputPath, 'utf8');
  assert.match(html, /search-foundation:start/);
  assert.match(html, /"@type":"BlogPosting"/);
  assert.doesNotMatch(html, /posts\/posts\//);
  assert.match(html, /<body\b/);
});
