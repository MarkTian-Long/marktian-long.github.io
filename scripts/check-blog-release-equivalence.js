'use strict';
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { execFileSync } = require('node:child_process');
const ROOT_DIR = path.resolve(__dirname, '..');
const META_PATH = 'tools/blog/data/posts-meta.json';
const TEMPLATE_PATH = 'tools/blog/article-template.html';
const DOCS_DIR = 'docs/blog';
const PREVIEWS_DIR = 'tools/blog/previews';
function read(rootDir, relativePath) { return fs.readFileSync(path.join(rootDir, relativePath), 'utf8').replace(/\r/g, ''); }
function htmlTagContent(html, tag) {
  const match = new RegExp(`<${tag}\\b[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i').exec(html);
  return match ? match[1] : '';
}
function extractBody(html) {
  const match = /<div class="post-body">([\s\S]*?)<\/div>\s*<section class="continue-reading"/.exec(html);
  return match ? match[1] : null;
}
function checkPublishedNavigation(rootDir, post, errors) {
  const previewPath = `${PREVIEWS_DIR}/${post.slug}.html`;
  if (!fs.existsSync(path.join(rootDir, previewPath))) return;
  const preview = read(rootDir, previewPath);
  const canonical = `https://marktian-long.github.io/tools/blog/posts/${post.slug}.html`;
  if (!/noindex/.test(preview) || !preview.includes(canonical)) errors.push(`${previewPath}: preview-to-published redirect must preserve noindex and point to the canonical published URL.`);
  if (/class="post-body"/.test(preview)) errors.push(`${previewPath}: published article still has a duplicate live preview body.`);
}
function checkSource(rootDir, post, template, errors) {
  const { parseSourceMarkdown } = require('../tools/blog/markdown-source.js');
  const { buildPage } = require('../tools/blog/generate-post.js');
  const sourcePath = `${DOCS_DIR}/${post.slug}.md`;
  const htmlPath = `tools/blog/posts/${post.slug}.html`;
  if (!fs.existsSync(path.join(rootDir, sourcePath))) return;
  const source = read(rootDir, sourcePath);
  let parsed;
  try { parsed = parseSourceMarkdown(source, sourcePath); } catch (error) { errors.push(error.message); return; }
  if (!parsed.frontmatter) return;
  const expected = buildPage(template, parsed.bodyMarkdown, post, sourcePath);
  const actual = read(rootDir, htmlPath);
  if (extractBody(actual) !== extractBody(expected)) {
    const got = extractBody(actual), wanted = extractBody(expected);
    let offset = 0;
    if (got !== null && wanted !== null) while (offset < Math.min(got.length, wanted.length) && got[offset] === wanted[offset]) offset++;
    errors.push(`${htmlPath}: body is not generated from the current Markdown source. Diagnostics: ${JSON.stringify({ source_sha256: sha256(source), html_sha256: sha256(actual), expected_length: wanted === null ? null : wanted.length, actual_length: got === null ? null : got.length, first_difference: offset, expected_excerpt: wanted === null ? null : wanted.slice(Math.max(0, offset - 40), offset + 120), actual_excerpt: got === null ? null : got.slice(Math.max(0, offset - 40), offset + 120) })}`);
  }
  if (htmlTagContent(actual, 'title') !== htmlTagContent(expected, 'title')) errors.push(`${htmlPath}: title differs from source metadata.`);
  if (!actual.includes(post.summary)) errors.push(`${htmlPath}: summary differs from source metadata. Diagnostics: ${JSON.stringify({ metadata_summary: post.summary, source_summary: parsed.sourceSummary, rendered_summary: /<p class="post-summary">([\s\S]*?)<\/p>/.exec(actual)?.[1] ?? null })}`);
  checkPublishedNavigation(rootDir, post, errors);
}
function main(rootDir = ROOT_DIR) {
  const metadata = JSON.parse(read(rootDir, META_PATH));
  const template = read(rootDir, TEMPLATE_PATH);
  const errors = [];
  for (const post of metadata.posts || []) checkSource(rootDir, post, template, errors);
  if (errors.length) { console.error('Blog release equivalence check failed:\n' + errors.map(error => `- ${error}`).join('\n')); return 1; }
  console.log(`Blog release equivalence check passed (${(metadata.posts || []).length} posts).`);
  return 0;
}

function validateSlug(slug) {
  if (typeof slug !== 'string' || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) throw new Error('Invalid slug');
}
function normalizeNewlines(text) { return String(text).replace(/\r\n?/g, '\n'); }
function sha256(bytes) { return crypto.createHash('sha256').update(bytes).digest('hex'); }

// drafts/blog and docs/blog have the same depth, so image paths stay unchanged.
// Resolve them relative to each source directory and compare the same repo asset bytes.
function collectStandaloneImages(source) {
  const images = [];
  let fence = null;
  const pattern = /^!\[([^\]\r\n]+)\]\(([^\s()]+)\s+"([^"\r\n]+)"\)\s*$/;
  for (const line of normalizeNewlines(source).split('\n')) {
    const marker = /^\s*(\x60{3,}|~{3,})/.exec(line);
    if (marker) {
      if (!fence) fence = marker[1][0];
      else if (fence === marker[1][0]) fence = null;
      continue;
    }
    if (fence || !line.startsWith('![')) continue;
    const match = pattern.exec(line);
    if (!match) throw new Error('Markdown image must use the registered standalone image form');
    images.push({ src: match[2] });
  }
  return images;
}

function resolveArticleImageRepoPath(sourcePath, imagePath, slug) {
  if (typeof imagePath !== 'string' || /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i.test(imagePath)
    || imagePath.includes('\\') || path.posix.isAbsolute(imagePath)) {
    throw new Error('Unexpected image path: ' + imagePath);
  }
  const resolved = path.posix.normalize(path.posix.join(path.posix.dirname(sourcePath), imagePath));
  if (resolved === '..' || resolved.startsWith('../')) throw new Error('Image path escapes repository: ' + imagePath);
  if (!resolved.startsWith('assets/images/blog/' + slug + '/')) {
    throw new Error('Image path must resolve inside assets/images/blog/' + slug + '/: ' + imagePath);
  }
  return resolved;
}

function verifyPromotion(approvedSource, publishedSource, options = {}) {
  const slug = options.slug;
  const approvedSourcePath = options.approvedSourcePath || ('drafts/blog/' + slug + '.md');
  const publishedSourcePath = options.publishedSourcePath || ('docs/blog/' + slug + '.md');
  const readApprovedImage = options.readApprovedImage;
  const readPublishedImage = options.readPublishedImage;
  validateSlug(slug);
  const approved = normalizeNewlines(approvedSource);
  const published = normalizeNewlines(publishedSource);
  if (approved !== published) throw new Error('Approved content changed beyond line-ending normalization');

  const approvedImages = collectStandaloneImages(approved);
  const publishedImages = collectStandaloneImages(published);
  if (approvedImages.length !== publishedImages.length) throw new Error('Approved image count changed');

  const assets = approvedImages.map((image, index) => {
    if (typeof readApprovedImage !== 'function' || typeof readPublishedImage !== 'function') {
      throw new Error('Both image readers are required to verify image bytes');
    }
    const approvedPath = resolveArticleImageRepoPath(approvedSourcePath, image.src, slug);
    const publishedPath = resolveArticleImageRepoPath(publishedSourcePath, publishedImages[index].src, slug);
    if (approvedPath !== publishedPath) throw new Error('Image repository path changed: ' + approvedPath + ' -> ' + publishedPath);
    const before = Buffer.from(readApprovedImage(approvedPath));
    const after = Buffer.from(readPublishedImage(publishedPath));
    if (!before.equals(after)) throw new Error('Image bytes changed: ' + approvedPath);
    return { path: approvedPath, sha256: sha256(after) };
  });

  return { images: approvedImages.length, source_sha256: sha256(published), assets };
}

function verifyPromotionAtRef({ rootDir = ROOT_DIR, approvedRef, slug }) {
  validateSlug(slug);
  if (typeof approvedRef !== 'string' || !/^[a-f0-9]{40}$/.test(approvedRef)) throw new Error('approved-ref must be a full 40-character commit SHA');
  const git = args => execFileSync('git', args, { cwd: rootDir, maxBuffer: 32 * 1024 * 1024 });
  git(['cat-file', '-e', approvedRef + '^{commit}']);
  const approvedPath = 'drafts/blog/' + slug + '.md';
  const publishedPath = 'docs/blog/' + slug + '.md';
  const approved = git(['show', approvedRef + ':' + approvedPath]).toString('utf8');
  const published = fs.readFileSync(path.join(rootDir, publishedPath), 'utf8');
  return verifyPromotion(approved, published, {
    slug,
    approvedSourcePath: approvedPath,
    publishedSourcePath: publishedPath,
    readApprovedImage: repoPath => git(['show', approvedRef + ':' + repoPath]),
    readPublishedImage: repoPath => fs.readFileSync(path.join(rootDir, repoPath)),
  });
}

function runCli(argv = process.argv.slice(2)) {
  if (!argv.length) return main();
  const flags = {};
  for (let i = 0; i < argv.length; i += 2) {
    const key = argv[i];
    if (!['--approved-ref', '--slug'].includes(key) || !argv[i + 1] || Object.hasOwn(flags, key)) {
      throw new Error('Usage: node scripts/check-blog-release-equivalence.js [--approved-ref <40-char-commit> --slug <slug>]');
    }
    flags[key] = argv[i + 1];
  }
  const result = verifyPromotionAtRef({ approvedRef: flags['--approved-ref'], slug: flags['--slug'] });
  console.log(JSON.stringify({ status: 'approved-content-unchanged', ...result }, null, 2));
  return 0;
}

if (require.main === module) {
  try { process.exitCode = runCli(); }
  catch (error) { console.error(error.message); process.exitCode = 1; }
}
module.exports = { checkSource, extractBody, main, verifyPromotion, verifyPromotionAtRef, runCli };

