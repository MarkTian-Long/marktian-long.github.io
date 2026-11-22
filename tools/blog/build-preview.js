'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { buildPage } = require('./generate-post');
const { validateSemanticMetadata } = require('./blog-taxonomy');
const { publicFiles, validateManifest } = require('../../scripts/public-dist-manifest');
const { assertEmptyOutput, resolveCandidateOutput } = require('../../scripts/candidate-site');
const { inspectDraftImages, parseArgs, safeRepositoryPath, sha256 } = require('../../scripts/check-blog-opening-image');

async function buildPreview({
  rootDir = process.cwd(), mode = 'check', sourcePath, outputDir,
  openingImageException, openingImageEvidence,
} = {}) {
  if (!['check', 'write'].includes(mode)) throw new Error('Preview mode must be check or write');
  if ((mode === 'write') !== Boolean(outputDir)) {
    throw new Error('Preview writes require --write and --out together; check mode does not write output');
  }
  let output;
  if (mode === 'write') {
    output = safeRepositoryPath(rootDir, outputDir, { allowMissing: true, directory: true });
    resolveCandidateOutput(rootDir, outputDir);
    assertEmptyOutput(output);
  }

  const inspected = await inspectDraftImages({ rootDir, sourcePath, openingImageException, openingImageEvidence });
  const { parsedSource, visuals, ...sourceReport } = inspected;
  const metadataPath = 'tools/blog/data/posts-meta.json';
  const publishedBytes = fs.readFileSync(safeRepositoryPath(rootDir, metadataPath));
  const published = JSON.parse(publishedBytes.toString('utf8'));
  if (!Array.isArray(published.posts)) throw new Error('Published metadata must contain posts');
  if (published.posts.some(post => post.slug === inspected.slug)) {
    throw new Error(`Preview source is already published; do not create a parallel editable draft: ${inspected.slug}`);
  }
  validateSemanticMetadata({ ...parsedSource.frontmatter, slug: inspected.slug }, {
    knownSlugs: published.posts.map(post => post.slug), source: sourcePath,
  });
  const metadata = {
    slug: inspected.slug, title: parsedSource.sourceTitle, summary: parsedSource.sourceSummary,
    ...parsedSource.frontmatter, url: `previews/${inspected.slug}.html`, visuals,
  };
  const template = fs.readFileSync(safeRepositoryPath(rootDir, 'tools/blog/article-template.html'), 'utf8');
  const html = buildPage(template, parsedSource.bodyMarkdown, metadata, sourcePath, { preview: true });
  const previewPath = `tools/blog/previews/${inspected.slug}.html`;

  // The complete candidate mirrors the exact public whitelist. It does not
  // discover/copy drafts, or add the draft to published posts-meta or feeds.
  safeRepositoryPath(rootDir, 'tools/blog/posts', { directory: true });
  const files = [...new Set(publicFiles(rootDir))];
  const content = new Map();
  for (const relative of files) {
    if (/^(?:drafts|docs|scripts)\//.test(relative)) throw new Error(`Internal source cannot enter a preview candidate: ${relative}`);
    const absolute = safeRepositoryPath(rootDir, relative);
    content.set(relative, fs.readFileSync(absolute));
  }
  const errors = validateManifest(rootDir, files);
  if (errors.length) throw new Error(errors.join('\n'));
  if (!content.get(metadataPath).equals(publishedBytes)) throw new Error('Published metadata changed while preparing the preview; retry');
  for (const image of inspected.images) {
    const bytes = fs.readFileSync(safeRepositoryPath(rootDir, image.src));
    if (sha256(bytes) !== image.sha256) throw new Error(`Image changed while preparing the preview; retry: ${image.src}`);
    content.set(image.src, bytes);
  }
  if (sha256(fs.readFileSync(safeRepositoryPath(rootDir, sourcePath))) !== inspected.sourceSha256) {
    throw new Error('Draft changed while preparing the preview; retry');
  }
  content.set(previewPath, Buffer.from(html, 'utf8'));

  if (mode === 'write') {
    // Validate everything before creating output. An interrupted write remains
    // in an isolated nonempty directory, which the next run refuses to erase.
    safeRepositoryPath(rootDir, outputDir, { allowMissing: true, directory: true });
    assertEmptyOutput(output);
    fs.mkdirSync(output, { recursive: true });
    for (const [relative, bytes] of content) {
      const target = safeRepositoryPath(rootDir, `${outputDir}/${relative}`, { allowMissing: true });
      fs.mkdirSync(path.dirname(target), { recursive: true });
      fs.writeFileSync(target, bytes, { flag: 'wx' });
    }
  }
  return {
    ...sourceReport, mode, metadata, previewPath, previewSha256: sha256(html),
    outputDir: outputDir || null, files: [...content.keys()].sort(),
  };
}

async function main(argv = process.argv.slice(2)) {
  const report = await buildPreview(parseArgs(argv, { allowWrite: true }));
  console.log(JSON.stringify(report, null, 2));
  return report;
}

if (require.main === module) main().catch(error => { console.error(error.message); process.exitCode = 1; });

module.exports = { buildPreview, main };
