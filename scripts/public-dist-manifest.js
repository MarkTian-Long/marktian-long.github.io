const fs = require('node:fs');
const path = require('node:path');
const { collectPostImagePaths, validateImageContract } = require('./blog-image-contract');

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
  'tools/agent-hub/app.js',
  'tools/agent-hub/decision-engine.js',
  'tools/agent-hub/data/decision-model.js',
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
  'tools/blog/article-links.css',
  'tools/blog/article-runtime.js',
  'tools/blog/share-card.css',
  'tools/blog/share-card.html',
  'tools/blog/share-card.js',
  'tools/blog/vendor/qrcode-generator.js',
  'tools/blog/index.html',
  'tools/blog/data/featured-posts.json',
  'tools/blog/data/posts-meta.json',
  'tools/blog/data/share-card-config.json',
  'tools/esop-extractor/index.html',
  'tools/esop-extractor/app.js',
  'tools/esop-extractor/data/depth-candidate-predictions.json',
  'tools/esop-extractor/data/depth-evaluation-meta.json',
  'tools/esop-extractor/data/depth-gold.json',
  'tools/esop-extractor/data/depth-inputs.json',
  'tools/radar/index.html',
  'tools/radar/app.js',
  'tools/radar/data.js',
  'tools/radar/style.css',
  'tools/service-agent/index.html',
  'tools/stock/index.html',
  'tools/stock/app.js',
  'tools/trends/index.html',
  'tools/trends/app.js',
  'tools/trends/contract.js',
  'tools/trends/data/trends.json',
];

function toPosix(filePath) {
  return filePath.split(path.sep).join('/');
}

function resolvePublicPath(rootDir, relativePath) {
  if (typeof relativePath !== 'string' || !relativePath || relativePath.includes('\\') || path.posix.isAbsolute(relativePath)) {
    throw new Error(`Public artifact must use a non-empty forward-slash relative path: ${relativePath}`);
  }
  const normalized = path.posix.normalize(relativePath);
  if (normalized !== relativePath || normalized === '..' || normalized.startsWith('../')) {
    throw new Error(`Public artifact must stay within the public root: ${relativePath}`);
  }
  const absoluteRoot = path.resolve(rootDir);
  const absolutePath = path.resolve(absoluteRoot, ...relativePath.split('/'));
  const relative = path.relative(absoluteRoot, absolutePath);
  if (!relative || relative === '..' || relative.startsWith(`..${path.sep}`) || path.isAbsolute(relative)) {
    throw new Error(`Public artifact must stay within the public root: ${relativePath}`);
  }
  return absolutePath;
}

function listBlogPosts(rootDir) {
  const postsDir = path.join(rootDir, 'tools/blog/posts');
  return fs.readdirSync(postsDir, { withFileTypes: true })
    .filter(entry => entry.isFile() && entry.name.endsWith('.html'))
    .map(entry => `tools/blog/posts/${entry.name}`)
    .sort();
}

function listBlogImages(rootDir) {
  const metadataPath = path.join(rootDir, 'tools/blog/data/posts-meta.json');
  const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
  validateImageContract(metadata);
  return collectPostImagePaths(metadata.posts);
}

function publicFiles(rootDir) {
  return [...PUBLIC_FILES, ...listBlogPosts(rootDir), ...listBlogImages(rootDir)].sort();
}

function validateManifest(rootDir, files = publicFiles(rootDir)) {
  const errors = [];
  for (const relativePath of files) {
    let absolutePath;
    try {
      absolutePath = resolvePublicPath(rootDir, relativePath);
    } catch (error) {
      errors.push(error.message);
      continue;
    }
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
  listBlogImages,
  publicFiles,
  resolvePublicPath,
  toPosix,
  validateManifest,
};
