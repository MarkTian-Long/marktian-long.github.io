const fs = require('node:fs');
const path = require('node:path');

const PUBLIC_FILES = [
  'index.html',
  'robots.txt',
  'sitemap.xml',
  'feed.xml',
  'assets/css/style.css',
  'assets/css/style-light.css',
  'assets/images/og-cover.png',
  'assets/js/analytics.js',
  'assets/js/interview.js',
  'assets/js/main.js',
  'tools/agent-hub/index.html',
  'tools/ai-insights/index.html',
  'tools/ai-insights/script.js',
  'tools/ai-insights/style.css',
  'tools/ai-insights/data/products.json',
  'tools/asci/index.html',
  'tools/asci/asci.css',
  'tools/asci/data.js',
  'tools/asci/engine.js',
  'tools/asci/main.js',
  'tools/asci/ui.js',
  'tools/blog/index.html',
  'tools/blog/data/posts-meta.json',
  'tools/esop-extractor/index.html',
  'tools/esop-extractor/app.js',
  'tools/radar/index.html',
  'tools/service-agent/index.html',
  'tools/stock/index.html',
  'tools/stock/app.js',
  'tools/trends/index.html',
  'tools/trends/data/trends.json',
];

function toPosix(filePath) {
  return filePath.split(path.sep).join('/');
}

function listBlogPosts(rootDir) {
  const postsDir = path.join(rootDir, 'tools/blog/posts');
  return fs.readdirSync(postsDir, { withFileTypes: true })
    .filter(entry => entry.isFile() && entry.name.endsWith('.html'))
    .map(entry => `tools/blog/posts/${entry.name}`)
    .sort();
}

function publicFiles(rootDir) {
  return [...PUBLIC_FILES, ...listBlogPosts(rootDir)].sort();
}

function validateManifest(rootDir, files = publicFiles(rootDir)) {
  const errors = [];
  for (const relativePath of files) {
    const absolutePath = path.join(rootDir, relativePath);
    if (!fs.existsSync(absolutePath) || !fs.statSync(absolutePath).isFile()) {
      errors.push(`Missing public source file: ${relativePath}`);
    }
  }
  for (const relativePath of files) {
    if (/^(docs|scripts)\//.test(relativePath)
      || /(^|\/)(README\.md|config\.example\.js|gen_index\.js|proxy\.py)$/.test(relativePath)
      || /^tools\/(dashboard|product-collector)\//.test(relativePath)) {
      errors.push(`Disallowed public artifact path: ${relativePath}`);
    }
  }
  return errors;
}

module.exports = {
  PUBLIC_FILES,
  publicFiles,
  toPosix,
  validateManifest,
};
