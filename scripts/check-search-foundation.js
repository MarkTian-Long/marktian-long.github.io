const fs = require('fs');
const path = require('path');

const siteConfig = require('./site-config');
const { validatePosts } = require('./generate-search-assets');
const { articleUrl, absoluteUrl } = require('./search-foundation');

function readText(rootDir, relPath) {
  return fs.readFileSync(path.join(rootDir, relPath), 'utf8');
}

function loadPosts(rootDir) {
  const metadata = JSON.parse(readText(rootDir, 'tools/blog/data/posts-meta.json'));
  if (!Array.isArray(metadata.posts)) {
    throw new Error('posts-meta.json must contain posts array');
  }
  validatePosts(metadata.posts);
  return metadata.posts;
}

function tagsByName(html, tagName) {
  return [...html.matchAll(new RegExp(`<${tagName}\\b[^>]*>`, 'gi'))].map(match => match[0]);
}

function attr(tag, name) {
  const match = tag.match(new RegExp(`${name}=["']([^"']*)["']`, 'i'));
  return match ? match[1] : '';
}

function canonicalLinks(html) {
  return tagsByName(html, 'link')
    .filter(tag => /\brel=["']canonical["']/i.test(tag))
    .map(tag => attr(tag, 'href'));
}

function hasDescription(html) {
  return tagsByName(html, 'meta')
    .some(tag => /\bname=["']description["']/i.test(tag) && attr(tag, 'content'));
}

function jsonLdBlocks(html) {
  return [...html.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)]
    .map(match => match[1]);
}

function parseJsonLd(html, relPath, errors) {
  const blocks = jsonLdBlocks(html);
  if (!blocks.length) {
    errors.push(`${relPath} missing JSON-LD`);
    return [];
  }

  const parsed = [];
  for (const block of blocks) {
    try {
      parsed.push(JSON.parse(block));
    } catch (error) {
      errors.push(`${relPath} invalid JSON-LD: ${error.message}`);
    }
  }
  return parsed;
}

function sitemapLocs(xml) {
  return [...xml.matchAll(/<loc>([\s\S]*?)<\/loc>/g)].map(match => match[1]
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'"));
}

function checkRobots(rootDir, config, errors, messages) {
  const robots = readText(rootDir, 'robots.txt');
  const sitemapUrl = absoluteUrl(config.siteUrl, '/sitemap.xml');
  if (!robots.includes(`Sitemap: ${sitemapUrl}`)) {
    errors.push('robots missing sitemap declaration');
    return;
  }
  messages.push('PASS robots.txt');
}

function checkSitemap(rootDir, config, posts, errors, messages) {
  const sitemap = readText(rootDir, 'sitemap.xml');
  const locs = new Set(sitemapLocs(sitemap));
  const expected = [
    absoluteUrl(config.siteUrl, '/'),
    absoluteUrl(config.siteUrl, config.blog.path),
    ...posts.map(post => articleUrl(config, post))
  ];

  for (const url of expected) {
    if (!locs.has(url)) {
      errors.push(`sitemap missing ${url}`);
    }
  }

  if (!errors.some(error => error.startsWith('sitemap '))) {
    messages.push('PASS sitemap.xml');
  }
}

function checkFeed(rootDir, config, errors, messages) {
  const feed = readText(rootDir, 'feed.xml');
  const itemCount = (feed.match(/<item>/g) || []).length;
  if (itemCount > config.blog.feedLimit) {
    errors.push(`feed item count exceeds limit: ${itemCount}/${config.blog.feedLimit}`);
  }
  if (!/<rss\b/i.test(feed)) {
    errors.push('feed missing rss root');
  }
  if (!errors.some(error => error.startsWith('feed '))) {
    messages.push('PASS feed.xml');
  }
}

function checkPageSeo({ html, relPath, expectedCanonical, errors }) {
  const canonicals = canonicalLinks(html);
  if (canonicals.length !== 1) {
    errors.push(`${relPath} duplicate canonical count: ${canonicals.length}`);
  } else if (canonicals[0] !== expectedCanonical) {
    errors.push(`${relPath} canonical mismatch: ${canonicals[0]} !== ${expectedCanonical}`);
  }

  if (!hasDescription(html)) {
    errors.push(`${relPath} missing description`);
  }

  parseJsonLd(html, relPath, errors);
}

function checkArticles(rootDir, config, posts, errors, messages) {
  let checked = 0;
  for (const post of posts) {
    const relPath = path.posix.join('tools/blog', post.url);
    const html = readText(rootDir, relPath);
    checkPageSeo({
      html,
      relPath,
      expectedCanonical: articleUrl(config, post),
      errors
    });
    checked++;
  }

  if (!errors.some(error => error.startsWith('tools/blog/posts/'))) {
    messages.push(`PASS blog article SEO: ${checked}/${posts.length}`);
  }
}

function checkEntryPages(rootDir, config, errors, messages) {
  const pages = [
    ['index.html', absoluteUrl(config.siteUrl, '/')],
    ['tools/blog/index.html', absoluteUrl(config.siteUrl, config.blog.path)]
  ];
  let checked = 0;
  for (const [relPath, expectedCanonical] of pages) {
    const html = readText(rootDir, relPath);
    checkPageSeo({ html, relPath, expectedCanonical, errors });
    checked++;
  }

  if (!errors.some(error => error.startsWith('index.html') || error.startsWith('tools/blog/index.html'))) {
    messages.push(`PASS entry page SEO: ${checked}/${pages.length}`);
  }
}

function checkSearchFoundation({ rootDir = path.resolve(__dirname, '..'), siteConfig: config = siteConfig } = {}) {
  const messages = [];
  const errors = [];

  try {
    const posts = loadPosts(rootDir);
    checkRobots(rootDir, config, errors, messages);
    checkSitemap(rootDir, config, posts, errors, messages);
    checkFeed(rootDir, config, errors, messages);
    checkArticles(rootDir, config, posts, errors, messages);
    checkEntryPages(rootDir, config, errors, messages);
  } catch (error) {
    errors.push(error.message);
  }

  return {
    code: errors.length ? 1 : 0,
    messages,
    errors
  };
}

function main() {
  const result = checkSearchFoundation();
  for (const message of result.messages) {
    console.log(message);
  }
  for (const error of result.errors) {
    console.error(`FAIL ${error}`);
  }
  return result.code;
}

if (require.main === module) {
  process.exitCode = main();
}

module.exports = {
  checkSearchFoundation
};
