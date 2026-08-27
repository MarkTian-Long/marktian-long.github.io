const fs = require('fs');
const path = require('path');
const { isDeepStrictEqual } = require('util');

const siteConfig = require('./site-config');
const { buildSearchAssets, buildShareCardConfig, validateBlogMetadata } = require('./generate-search-assets');
const {
  articleUrl,
  absoluteUrl,
  buildArticleJsonLd,
  buildEntryJsonLd,
  ensureArticleSeo,
  ensureEntryPageSeo
} = require('./search-foundation');

function readText(rootDir, relPath) {
  return fs.readFileSync(path.join(rootDir, relPath), 'utf8');
}

function loadPosts(rootDir) {
  const metadata = JSON.parse(readText(rootDir, 'tools/blog/data/posts-meta.json'));
  validateBlogMetadata(metadata);
  return metadata.posts;
}

function tagsByName(html, tagName) {
  return [...html.matchAll(new RegExp(`<${tagName}\\b[^>]*>`, 'gi'))].map(match => match[0]);
}

function attr(tag, name) {
  const match = tag.match(new RegExp(`${name}=(["'])(.*?)\\1`, 'i'));
  return match ? match[2] : '';
}

function canonicalLinks(html) {
  return tagsByName(html, 'link')
    .filter(tag => /\brel=["']canonical["']/i.test(tag))
    .map(tag => attr(tag, 'href'));
}

function metaValues(html, attribute, value) {
  const pattern = new RegExp(`\\b${attribute}=["']${value}["']`, 'i');
  return tagsByName(html, 'meta')
    .filter(tag => pattern.test(tag))
    .map(tag => attr(tag, 'content'));
}

function alternateFeeds(html) {
  return tagsByName(html, 'link')
    .filter(tag => /\brel=["']alternate["']/i.test(tag)
      && /\btype=["']application\/rss\+xml["']/i.test(tag))
    .map(tag => attr(tag, 'href'));
}

function htmlUnescape(value) {
  return String(value)
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');
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

function normalizeNewlines(value) {
  return String(value).replace(/\r\n/g, '\n');
}

function checkExactFile(rootDir, relPath, expected, errors, errorMessage) {
  const actual = readText(rootDir, relPath);
  if (normalizeNewlines(actual) !== normalizeNewlines(expected)) {
    errors.push(errorMessage);
    return false;
  }
  return true;
}

function checkAssets(rootDir, config, posts, errors, messages) {
  const assets = buildSearchAssets(config, posts);
  if (checkExactFile(rootDir, 'robots.txt', assets.robots, errors, 'robots.txt content mismatch')) {
    messages.push('PASS robots.txt');
  }
  if (checkExactFile(rootDir, 'sitemap.xml', assets.sitemap, errors, 'sitemap.xml content mismatch')) {
    messages.push('PASS sitemap.xml');
  }
  if (checkExactFile(rootDir, 'feed.xml', assets.feed, errors, 'feed.xml content mismatch')) {
    messages.push('PASS feed.xml');
  }
  if (checkExactFile(
    rootDir,
    'tools/blog/data/share-card-config.json',
    buildShareCardConfig(config),
    errors,
    'blog share-card config mismatch'
  )) {
    messages.push('PASS blog share-card config');
  }
}

function findJsonLdByType(blocks, expectedType) {
  const values = [];
  function visit(value) {
    if (Array.isArray(value)) {
      value.forEach(visit);
      return;
    }
    if (!value || typeof value !== 'object') {
      return;
    }
    const nodeTypes = Array.isArray(value['@type']) ? value['@type'] : [value['@type']];
    if (nodeTypes.includes(expectedType)) {
      values.push(value);
    }
    if (Array.isArray(value['@graph'])) {
      value['@graph'].forEach(visit);
    }
  }
  for (const block of blocks) {
    visit(block);
  }
  return values;
}

function checkPageSeo({
  html,
  relPath,
  expectedCanonical,
  expectedDescription,
  expectedFeed,
  expectedJsonLd,
  expectedJsonLdType,
  expectedShareUrls,
  errors
}) {
  const canonicals = canonicalLinks(html);
  if (canonicals.length !== 1) {
    errors.push(`${relPath} duplicate canonical count: ${canonicals.length}`);
  } else if (canonicals[0] !== expectedCanonical) {
    errors.push(`${relPath} canonical mismatch: ${canonicals[0]} !== ${expectedCanonical}`);
  }

  const descriptions = metaValues(html, 'name', 'description').map(htmlUnescape);
  if (descriptions.length !== 1) {
    errors.push(`${relPath} description count mismatch: ${descriptions.length}`);
  } else if (descriptions[0] !== expectedDescription) {
    errors.push(`${relPath} description mismatch`);
  }

  const feeds = alternateFeeds(html);
  if (feeds.length !== 1 || feeds[0] !== expectedFeed) {
    errors.push(`${relPath} RSS alternate mismatch`);
  }

  const parsedJsonLd = parseJsonLd(html, relPath, errors);
  const matchingJsonLd = findJsonLdByType(parsedJsonLd, expectedJsonLdType);
  if (matchingJsonLd.length !== 1) {
    errors.push(`${relPath} ${expectedJsonLdType} JSON-LD count mismatch: ${matchingJsonLd.length}`);
  } else if (!isDeepStrictEqual(matchingJsonLd[0], expectedJsonLd)) {
    errors.push(`${relPath} ${expectedJsonLdType} JSON-LD mismatch`);
  }

  for (const [attribute, value, expected] of expectedShareUrls || []) {
    const values = metaValues(html, attribute, value).map(htmlUnescape);
    if (values.length !== 1 || values[0] !== expected) {
      errors.push(`${relPath} ${value} mismatch`);
    }
  }
}

function checkArticleFileSet(rootDir, posts, errors) {
  const postsDir = path.join(rootDir, 'tools/blog/posts');
  const actual = fs.readdirSync(postsDir)
    .filter(file => file.endsWith('.html'))
    .sort();
  const expected = posts.map(post => path.posix.basename(post.url)).sort();
  const missing = expected.filter(file => !actual.includes(file));
  const orphaned = actual.filter(file => !expected.includes(file));
  for (const file of missing) {
    errors.push(`Missing article file: tools/blog/posts/${file}`);
  }
  for (const file of orphaned) {
    errors.push(`Orphan article file: tools/blog/posts/${file}`);
  }
}

function checkInlineScripts(html, relPath, errors) {
  const scripts = [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)];
  let checked = 0;
  for (const [, attributes, code] of scripts) {
    if (/\bsrc\s*=/i.test(attributes) || /type=["']application\/ld\+json["']/i.test(attributes)) {
      continue;
    }
    try {
      new Function(code);
      checked++;
    } catch (error) {
      errors.push(`${relPath} inline script ${checked + 1} has invalid JavaScript: ${error.message}`);
    }
  }
  return checked;
}

function checkSharedArticleStyles(rootDir, errors, messages) {
  const stylesheetPath = 'tools/blog/article-links.css';
  const runtimePath = 'tools/blog/article-runtime.js';
  if (!fs.existsSync(path.join(rootDir, stylesheetPath))) {
    errors.push(`${stylesheetPath} is missing`);
    return;
  }

  const runtime = readText(rootDir, runtimePath);
  if (!runtime.includes('article-links.css')) {
    errors.push(`${runtimePath} does not load ${stylesheetPath}`);
    return;
  }

  const stylesheet = readText(rootDir, stylesheetPath);
  const navigationSafeguard = /\.post-body a\.related-item\s*,\s*\.post-body a\.related-item:hover\s*,\s*\.post-body \.post-nav a:hover\s*\{[^}]*text-decoration:\s*none;/;
  if (!navigationSafeguard.test(stylesheet)) {
    errors.push(`${stylesheetPath} must keep related and post navigation links underline-free`);
    return;
  }
  messages.push('PASS blog shared link styles');
}

function checkArticles(rootDir, config, posts, errors, messages) {
  const articleErrorStart = errors.length;
  const scriptErrorStart = errors.length;
  checkArticleFileSet(rootDir, posts, errors);
  const feedUrl = absoluteUrl(config.siteUrl, config.blog.feedPath);
  const imageUrl = absoluteUrl(config.siteUrl, config.blog.imagePath);
  let checked = 0;
  let articlesWithValidScripts = 0;
  let articlesWithSharedRuntime = 0;
  for (const post of posts) {
    const relPath = path.posix.join('tools/blog', post.url);
    if (!fs.existsSync(path.join(rootDir, relPath))) {
      continue;
    }
    const html = readText(rootDir, relPath);
    if (/<script\b[^>]*\bsrc=["']\.\.\/article-runtime\.js["'][^>]*><\/script>/i.test(html)) {
      articlesWithSharedRuntime++;
    } else {
      errors.push(`${relPath} missing shared article runtime`);
    }
    const scriptErrorsBefore = errors.length;
    checkInlineScripts(html, relPath, errors);
    if (errors.length === scriptErrorsBefore) {
      articlesWithValidScripts++;
    }
    const expectedUrl = articleUrl(config, post);
    const expectedHtml = ensureArticleSeo(html, post, config);
    if (normalizeNewlines(html) !== normalizeNewlines(expectedHtml)) {
      errors.push(`${relPath} generated SEO block is stale`);
    }
    checkPageSeo({
      html,
      relPath,
      expectedCanonical: expectedUrl,
      expectedDescription: post.summary,
      expectedFeed: feedUrl,
      expectedJsonLd: JSON.parse(buildArticleJsonLd(config, post, expectedUrl)),
      expectedJsonLdType: 'BlogPosting',
      expectedShareUrls: [
        ['property', 'og:title', post.title],
        ['property', 'og:description', post.summary],
        ['property', 'og:url', expectedUrl],
        ['property', 'og:image', imageUrl],
        ['name', 'twitter:title', post.title],
        ['name', 'twitter:description', post.summary],
        ['name', 'twitter:image', imageUrl]
      ],
      errors
    });
    checked++;
  }

  if (errors.length === articleErrorStart) {
    messages.push(`PASS blog article SEO: ${checked}/${posts.length}`);
  }
  if (errors.length === scriptErrorStart) {
    messages.push(`PASS blog inline scripts: ${articlesWithValidScripts}/${posts.length}`);
  }
  if (articlesWithSharedRuntime === posts.length) {
    messages.push(`PASS blog shared runtime: ${articlesWithSharedRuntime}/${posts.length}`);
  }
}

function checkEntryPages(rootDir, config, errors, messages) {
  const pages = [
    {
      relPath: 'index.html',
      pageType: 'home',
      canonical: absoluteUrl(config.siteUrl, '/'),
      description: config.siteDescription,
      jsonLdType: 'WebSite'
    },
    {
      relPath: 'tools/blog/index.html',
      pageType: 'blog',
      canonical: absoluteUrl(config.siteUrl, config.blog.path),
      description: config.blog.description,
      jsonLdType: 'CollectionPage'
    }
  ];
  const feedUrl = absoluteUrl(config.siteUrl, config.blog.feedPath);
  let checked = 0;
  for (const page of pages) {
    const html = readText(rootDir, page.relPath);
    const expectedHtml = ensureEntryPageSeo(html, page.pageType, config);
    if (normalizeNewlines(html) !== normalizeNewlines(expectedHtml)) {
      errors.push(`${page.relPath} generated SEO block is stale`);
    }
    const expectedJsonLdDocument = JSON.parse(buildEntryJsonLd(config, page.pageType));
    const expectedJsonLd = page.pageType === 'home'
      ? findJsonLdByType([expectedJsonLdDocument], page.jsonLdType)[0]
      : expectedJsonLdDocument;
    checkPageSeo({
      html,
      relPath: page.relPath,
      expectedCanonical: page.canonical,
      expectedDescription: page.description,
      expectedFeed: feedUrl,
      expectedJsonLd,
      expectedJsonLdType: page.jsonLdType,
      expectedShareUrls: [['property', 'og:url', page.canonical]],
      errors
    });
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
    checkAssets(rootDir, config, posts, errors, messages);
    checkSharedArticleStyles(rootDir, errors, messages);
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
