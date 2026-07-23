const fs = require('fs');
const path = require('path');

const config = require('./site-config');
const {
  articleUrl,
  buildRobots,
  buildSitemap,
  buildRss
} = require('./search-foundation');

const TARGETS = ['robots.txt', 'sitemap.xml', 'feed.xml'];

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
    for (const field of ['slug', 'title', 'summary', 'url']) {
      if (!post[field]) {
        throw new Error(`Post is missing ${field}`);
      }
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

function targetContents(siteConfig, posts) {
  const assets = buildSearchAssets(siteConfig, posts);
  return {
    'robots.txt': assets.robots,
    'sitemap.xml': assets.sitemap,
    'feed.xml': assets.feed
  };
}

function readExisting(filePath) {
  return fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf8') : null;
}

function changedTargets(rootDir, contents) {
  return TARGETS.filter(file => readExisting(path.join(rootDir, file)) !== contents[file]);
}

function writeTargets(rootDir, contents) {
  for (const file of TARGETS) {
    fs.writeFileSync(path.join(rootDir, file), contents[file], 'utf8');
    console.log(`WROTE ${file}`);
  }
}

function checkTargets(rootDir, contents) {
  const changed = changedTargets(rootDir, contents);
  if (!changed.length) {
    for (const file of TARGETS) {
      console.log(`PASS ${file}`);
    }
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

function main(argv = process.argv.slice(2), rootDir = path.resolve(__dirname, '..')) {
  const shouldWrite = argv.includes('--write');
  const shouldCheck = argv.includes('--check');
  if (shouldWrite && shouldCheck) {
    throw new Error('Use either --write or --check, not both');
  }

  const posts = loadPosts(rootDir);
  const contents = targetContents(config, posts);

  if (shouldWrite) {
    writeTargets(rootDir, contents);
    return 0;
  }
  if (shouldCheck) {
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
  main
};
