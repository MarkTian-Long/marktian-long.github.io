const fs = require('fs');
const path = require('path');

const config = require('./site-config');
const {
  articleUrl,
  buildRobots,
  buildSitemap,
  buildRss,
  ensureArticleSeo,
  ensureEntryPageSeo
} = require('./search-foundation');

function loadPosts(rootDir) {
  const metadataPath = path.join(rootDir, 'tools/blog/data/posts-meta.json');
  const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
  if (!Array.isArray(metadata.posts)) {
    throw new Error('posts-meta.json must contain posts array');
  }
  return metadata.posts;
}

function validatePosts(posts) {
  if (!Array.isArray(posts)) {
    throw new Error('posts must be an array');
  }

  const slugs = new Set();
  const urls = new Set();
  for (const post of posts) {
    if (!post || typeof post !== 'object' || Array.isArray(post)) {
      throw new Error('Each post must be an object');
    }
    for (const field of ['slug', 'title', 'summary', 'url']) {
      if (typeof post[field] !== 'string' || !post[field].trim()) {
        throw new Error(`Post ${field} must be a non-empty string`);
      }
    }
    if (post.slug !== post.slug.trim() || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(post.slug)) {
      throw new Error(`Invalid slug: ${post.slug}`);
    }
    if (post.title !== post.title.trim() || post.summary !== post.summary.trim()) {
      throw new Error(`Post text fields must be trimmed: ${post.slug}`);
    }
    const expectedUrl = `posts/${post.slug}.html`;
    if (post.url !== expectedUrl) {
      throw new Error(`Invalid url for ${post.slug}: expected ${expectedUrl}`);
    }
    if (slugs.has(post.slug)) {
      throw new Error(`Duplicate slug: ${post.slug}`);
    }
    if (urls.has(post.url)) {
      throw new Error(`Duplicate url: ${post.url}`);
    }
    slugs.add(post.slug);
    urls.add(post.url);
  }
}

function pathFromAbsoluteUrl(url) {
  return new URL(url).pathname;
}

function buildSearchAssets(siteConfig, posts) {
  validatePosts(posts);
  const pages = [
    '/',
    siteConfig.blog.path,
    ...posts.map(post => pathFromAbsoluteUrl(articleUrl(siteConfig, post)))
  ];

  return {
    robots: buildRobots(siteConfig),
    sitemap: buildSitemap(siteConfig, pages),
    feed: buildRss(siteConfig, posts)
  };
}

function targetContents(siteConfig, posts, rootDir = path.resolve(__dirname, '..')) {
  const assets = buildSearchAssets(siteConfig, posts);
  const contents = {
    'robots.txt': assets.robots,
    'sitemap.xml': assets.sitemap,
    'feed.xml': assets.feed
  };
  const entryPages = [
    ['index.html', 'home'],
    ['tools/blog/index.html', 'blog']
  ];
  for (const [relPath, pageType] of entryPages) {
    const source = fs.readFileSync(path.join(rootDir, relPath), 'utf8');
    contents[relPath] = ensureEntryPageSeo(source, pageType, siteConfig);
  }
  for (const post of posts) {
    const relPath = path.posix.join('tools/blog', post.url);
    const source = fs.readFileSync(path.join(rootDir, relPath), 'utf8');
    contents[relPath] = ensureArticleSeo(source, post, siteConfig);
  }
  return contents;
}

function readExisting(filePath) {
  return fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf8') : null;
}

function normalizeLineEndings(content) {
  return content === null ? null : content.replace(/\r\n/g, '\n');
}

function changedTargets(rootDir, contents) {
  return Object.keys(contents)
    .filter(file => normalizeLineEndings(readExisting(path.join(rootDir, file))) !== normalizeLineEndings(contents[file]));
}

function writeTargets(rootDir, contents) {
  for (const file of Object.keys(contents)) {
    fs.writeFileSync(path.join(rootDir, file), contents[file], 'utf8');
    console.log(`WROTE ${file}`);
  }
}

function checkTargets(rootDir, contents) {
  const changed = changedTargets(rootDir, contents);
  if (!changed.length) {
    console.log('PASS robots.txt');
    console.log('PASS sitemap.xml');
    console.log('PASS feed.xml');
    console.log('PASS entry page SEO: 2/2');
    console.log(`PASS blog article SEO: ${Object.keys(contents).length - 5}/${Object.keys(contents).length - 5}`);
    return 0;
  }

  for (const file of changed) {
    console.error(`STALE ${file}`);
  }
  return 1;
}

function previewTargets(rootDir, contents) {
  const changed = changedTargets(rootDir, contents);
  if (!changed.length) {
    console.log('All search assets are up to date.');
    return 0;
  }

  for (const file of changed) {
    console.log(`WOULD WRITE ${file}`);
  }
  return 0;
}

function parseArgs(argv) {
  let mode = 'preview';
  for (const arg of argv) {
    if (arg === '--write' || arg === '--check') {
      const nextMode = arg.slice(2);
      if (mode !== 'preview' && mode !== nextMode) {
        throw new Error('Use either --write or --check, not both');
      }
      mode = nextMode;
      continue;
    }
    throw new Error(`Unknown option: ${arg}`);
  }
  return mode;
}

function main(argv = process.argv.slice(2), rootDir = path.resolve(__dirname, '..')) {
  const mode = parseArgs(argv);
  const posts = loadPosts(rootDir);
  const contents = targetContents(config, posts, rootDir);

  if (mode === 'write') {
    writeTargets(rootDir, contents);
    return 0;
  }
  if (mode === 'check') {
    return checkTargets(rootDir, contents);
  }
  return previewTargets(rootDir, contents);
}

if (require.main === module) {
  try {
    process.exitCode = main();
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}

module.exports = {
  buildSearchAssets,
  validatePosts,
  targetContents,
  changedTargets,
  parseArgs,
  main
};
