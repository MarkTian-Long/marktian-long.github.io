'use strict';

const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const cheerio = require('cheerio');
const { parseSourceMarkdown } = require('../tools/blog/markdown-source');
const { parsePublishHandoff } = require('../tools/blog/publish-handoff');
const { renderStandaloneImage } = require('../tools/blog/generate-post');
const { validateImageContract } = require('./blog-image-contract');
const { validateBlogImageAsset } = require('./check-blog-images');

const SOURCE_PATTERN = /^drafts\/blog\/([a-z0-9]+(?:-[a-z0-9]+)*)\.md$/;

function sha256(bytes) {
  return crypto.createHash('sha256').update(bytes).digest('hex');
}

// A lexical prefix check alone permits an ancestor symlink to escape the root.
// This is also used for candidate inputs/outputs; no caller may follow a link.
function safeRepositoryPath(rootDir, relativePath, { allowMissing = false, directory = false } = {}) {
  if (typeof relativePath !== 'string' || !relativePath || relativePath.includes('\\')
    || path.posix.isAbsolute(relativePath) || path.posix.normalize(relativePath) !== relativePath
    || relativePath === '..' || relativePath.startsWith('../')) {
    throw new Error(`Path must be a normalized repository-relative path: ${relativePath}`);
  }
  const root = path.resolve(rootDir);
  if (fs.realpathSync(root) !== root) throw new Error(`Repository root must not contain symlinks: ${root}`);
  let current = root;
  const segments = relativePath.split('/');
  for (const [index, segment] of segments.entries()) {
    current = path.join(current, segment);
    let stat;
    try { stat = fs.lstatSync(current); } catch (error) {
      if (allowMissing && error.code === 'ENOENT') continue;
      throw new Error(`Missing local path: ${relativePath} (${error.message})`);
    }
    if (stat.isSymbolicLink()) throw new Error(`Symbolic links are not allowed: ${relativePath}`);
    if (index < segments.length - 1 || directory) {
      if (!stat.isDirectory()) throw new Error(`Path component must be a directory: ${relativePath}`);
    } else if (!stat.isFile()) throw new Error(`Path must be a regular file: ${relativePath}`);
  }
  return current;
}

function readOpeningException({ rootDir, slug, title, reason, evidence }) {
  if (reason === undefined && evidence === undefined) return null;
  if (typeof reason !== 'string' || !reason.trim() || reason !== reason.trim() || reason.length > 500
    || /[\r\n\x00-\x1f]/.test(reason) || typeof evidence !== 'string' || !evidence) {
    throw new Error('Opening image exception requires a specific reason and evidence path together');
  }
  const reviewPath = `drafts/blog/reviews/${slug}.md`;
  const previewPath = `tools/blog/previews/${slug}.html`;
  if (evidence !== reviewPath && evidence !== previewPath) {
    throw new Error(`Opening image evidence must belong to article ${slug}: ${reviewPath} or ${previewPath}`);
  }
  const bytes = fs.readFileSync(safeRepositoryPath(rootDir, evidence));
  const text = bytes.toString('utf8');
  let kind;
  if (evidence === reviewPath) {
    if (!text.includes(reason)) throw new Error('Opening image exception reason must be present in the cited review record');
    kind = 'author-review';
  } else {
    const $ = cheerio.load(text);
    const robots = $('meta[name="robots"]').attr('content') || '';
    if (!robots.split(/[\s,]+/).includes('noindex') || $('meta[http-equiv="refresh" i]').length
      || $('h1.post-title').length !== 1 || $('h1.post-title').text().trim() !== title
      || $('.post-body').length !== 1 || !$('.post-body').text().trim()) {
      throw new Error('Opening image evidence must be an existing complete noindex preview of the same draft');
    }
    kind = 'existing-preview';
  }
  return { kind, reason, evidence, sha256: sha256(bytes), authorizationVerified: false };
}

function sourceImageLines(body) {
  const images = [];
  let fence = null;
  for (const line of body.split('\n')) {
    const marker = /^\s*(`{3,}|~{3,})/.exec(line);
    if (marker) {
      if (!fence) fence = marker[1][0];
      else if (fence === marker[1][0]) fence = null;
      continue;
    }
    if (!fence && /^!\[/.test(line)) images.push(line);
  }
  return images;
}

async function inspectDraftImages({
  rootDir = process.cwd(), sourcePath, openingImageException, openingImageEvidence,
} = {}) {
  const sourceMatch = typeof sourcePath === 'string' && SOURCE_PATTERN.exec(sourcePath);
  if (!sourceMatch) throw new Error('Source must be drafts/blog/<slug>.md or docs/blog/<slug>.md');
  const slug = sourceMatch[1];
  const absoluteSource = safeRepositoryPath(rootDir, sourcePath);
  const bytes = fs.readFileSync(absoluteSource);
  const markdown = bytes.toString('utf8');
  if (parsePublishHandoff(markdown, sourcePath).handoff) {
    throw new Error(`Publish handoff must be applied before building a preview: ${sourcePath}`);
  }
  const parsedSource = parseSourceMarkdown(markdown, sourcePath);
  if (!parsedSource.frontmatter) throw new Error(`Preview drafts require strict frontmatter: ${sourcePath}`);
  const exception = readOpeningException({
    rootDir, slug, title: parsedSource.sourceTitle, reason: openingImageException, evidence: openingImageEvidence,
  });
  const firstLine = parsedSource.bodyMarkdown.split('\n').find(line => line.trim()) || '';
  const hasOpeningImage = /^!\[/.test(firstLine);
  if (!hasOpeningImage && !exception) {
    throw new Error(`Opening image is required before the first prose block: ${sourcePath}`);
  }

  const visuals = { inline: [] };
  const images = [];
  for (const line of sourceImageLines(parsedSource.bodyMarkdown)) {
    const match = /^!\[([^\]\r\n]+)\]\(([^\s()]+)\s+"([^"\r\n]+)"\)\s*$/.exec(line);
    if (!match) throw new Error('Markdown image must use the registered standalone image form');
    const [, alt, source, caption] = match;
    const expected = new RegExp(`^\\.\\./\\.\\./(assets/images/blog/${slug}/[a-z0-9]+(?:-[a-z0-9]+)*\\.(?:svg|webp))$`).exec(source);
    if (!expected) throw new Error(`Markdown image must use a local path inside article ${slug}`);
    const imagePath = expected[1];
    safeRepositoryPath(rootDir, imagePath);
    const asset = await validateBlogImageAsset({ rootDir, imagePath });
    const visual = { src: imagePath, alt, caption, width: asset.width, height: asset.height };
    visuals.inline.push(visual);
    images.push({ ...visual, bytes: asset.bytes, sha256: asset.sha256 });
  }
  const imageMetadata = {
    image_contract: { version: 1, legacy_without_visuals: [] }, posts: [{ slug, visuals }],
  };
  validateImageContract(imageMetadata);
  for (const line of sourceImageLines(parsedSource.bodyMarkdown)) {
    renderStandaloneImage(line, imageMetadata.posts[0], sourcePath);
  }
  const report = {
    mode: 'check', slug, sourcePath, sourceSha256: sha256(bytes),
    openingImage: { present: hasOpeningImage, src: hasOpeningImage ? images[0].src : null, exception },
    images,
  };
  return { ...report, parsedSource, visuals };
}

function parseArgs(argv, { allowWrite = false } = {}) {
  const names = {
    '--source': 'sourcePath', '--opening-image-exception': 'openingImageException',
    '--opening-image-evidence': 'openingImageEvidence',
  };
  if (allowWrite) names['--out'] = 'outputDir';
  const options = { mode: 'check' };
  const seen = new Set();
  for (let i = 0; i < argv.length; i += 1) {
    const flag = argv[i];
    if (seen.has(flag)) throw new Error(`Duplicate argument: ${flag}`);
    seen.add(flag);
    if (flag === '--write' && allowWrite) { options.mode = 'write'; continue; }
    if (!Object.hasOwn(names, flag) || !argv[i + 1] || argv[i + 1].startsWith('--')) {
      throw new Error(`Unknown argument or missing value: ${flag}`);
    }
    options[names[flag]] = argv[++i];
  }
  if (!options.sourcePath) throw new Error('--source drafts/blog/<slug>.md or docs/blog/<slug>.md is required');
  if (allowWrite && (options.mode === 'write') !== Boolean(options.outputDir)) {
    throw new Error('Use --write and --out build/candidate-site/<name> together; default mode only checks');
  }
  return options;
}

async function main(argv = process.argv.slice(2)) {
  const { parsedSource, visuals, ...report } = await inspectDraftImages(parseArgs(argv));
  console.log(JSON.stringify(report, null, 2));
  return report;
}

if (require.main === module) main().catch(error => { console.error(error.message); process.exitCode = 1; });

module.exports = { inspectDraftImages, parseArgs, safeRepositoryPath, sha256, main };
