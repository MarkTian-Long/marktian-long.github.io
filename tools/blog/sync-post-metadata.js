'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { parseSourceMarkdown } = require('./markdown-source.js');
const { validateSemanticMetadata } = require('./blog-taxonomy.js');
const { validateBlogMetadata } = require('../../scripts/generate-search-assets.js');
const { inspectDraftImages } = require('../../scripts/check-blog-opening-image.js');

function currentPublicationMonth() {
  const now = new Date();
  return String(now.getFullYear()) + '.' + String(now.getMonth() + 1).padStart(2, '0');
}

function validateDate(date) {
  if (!/^\d{4}\.\d{2}$/.test(date)) throw new Error('Publication date must use YYYY.MM: ' + date);
}

async function syncPostMetadata(options = {}) {
  const sourcePath = options.sourcePath;
  const rootDir = options.rootDir || process.cwd();
  const date = options.date;
  if (!sourcePath) throw new Error('sourcePath is required');
  if (date !== undefined) validateDate(date);
  const absoluteRoot = path.resolve(rootDir);
  const absoluteSourcePath = path.resolve(absoluteRoot, sourcePath);
  const relativeSourcePath = path.relative(absoluteRoot, absoluteSourcePath).replace(/\\/g, '/');
  if (!relativeSourcePath || relativeSourcePath.startsWith('../') || path.posix.isAbsolute(relativeSourcePath)) {
    throw new Error('sourcePath must stay inside the repository');
  }
  const source = fs.readFileSync(absoluteSourcePath, 'utf8');
  const slug = path.basename(absoluteSourcePath, '.md');
  const parsed = parseSourceMarkdown(source, relativeSourcePath);
  const metadataPath = path.join(absoluteRoot, 'tools/blog/data/posts-meta.json');
  const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
  const existingIndex = metadata.posts.findIndex(post => post.slug === slug);

  if (!parsed.frontmatter) {
    if (existingIndex === -1) throw new Error('New Markdown sources require strict frontmatter: ' + relativeSourcePath);
    return { slug, legacy: true, changed: false, post: metadata.posts[existingIndex] };
  }

  validateSemanticMetadata(Object.assign({}, parsed.frontmatter, { slug }), {
    knownSlugs: metadata.posts.map(post => post.slug),
    source: relativeSourcePath,
  });
  const existing = existingIndex === -1 ? null : metadata.posts[existingIndex];

  // New articles derive visuals from Markdown image lines and registered local
  // assets. Existing articles keep their already-frozen visual metadata.
  let visuals = existing ? existing.visuals : undefined;
  if (!existing) {
    const inspection = await inspectDraftImages({
      rootDir: absoluteRoot,
      sourcePath: relativeSourcePath,
      openingImageException: options.openingImageException,
      openingImageEvidence: options.openingImageEvidence,
    });
    visuals = inspection.visuals;
  }

  const synced = Object.assign({}, existing || {}, {
    slug,
    date: existing ? existing.date : (date || currentPublicationMonth()),
    title: parsed.sourceTitle,
    summary: parsed.sourceSummary,
    category: parsed.frontmatter.category,
    tags: parsed.frontmatter.tags,
    topics: parsed.frontmatter.topics,
    concepts: parsed.frontmatter.concepts,
    share_quote: parsed.frontmatter.share_quote,
    relations: parsed.frontmatter.relations,
    url: 'posts/' + slug + '.html',
  });
  if (visuals) synced.visuals = visuals;
  validateDate(synced.date);
  const next = Object.assign({}, metadata, { posts: metadata.posts.slice() });
  if (existingIndex === -1) next.posts.unshift(synced);
  else next.posts[existingIndex] = synced;
  // The homepage, archive and RSS depend on newest-first metadata order.
  // Stable sorting preserves existing editorial order within the same month.
  next.posts.sort((a, b) => b.date.localeCompare(a.date));
  validateBlogMetadata(next);

  const serialized = JSON.stringify(next, null, 2) + '\n';
  const current = fs.readFileSync(metadataPath, 'utf8');
  if (current !== serialized) fs.writeFileSync(metadataPath, serialized, 'utf8');
  return { slug, legacy: false, changed: current !== serialized, post: synced };
}

function parseArgs(argv) {
  const usage = 'Usage: node tools/blog/sync-post-metadata.js --write <source.md> [--date YYYY.MM] [--opening-image-exception <reason> --opening-image-evidence <path>]';
  if (!argv.length || argv[0] !== '--write' || !argv[1]) throw new Error(usage);
  const result = { sourcePath: argv[1] };
  const flags = {
    '--date': 'date',
    '--opening-image-exception': 'openingImageException',
    '--opening-image-evidence': 'openingImageEvidence',
  };
  for (let index = 2; index < argv.length; index += 2) {
    const flag = argv[index];
    const value = argv[index + 1];
    if (!Object.prototype.hasOwnProperty.call(flags, flag) || !value || Object.prototype.hasOwnProperty.call(result, flags[flag])) {
      throw new Error(usage);
    }
    result[flags[flag]] = value;
  }
  if (Boolean(result.openingImageException) !== Boolean(result.openingImageEvidence)) {
    throw new Error('Opening image exception requires both a reason and an evidence path');
  }
  return result;
}

async function main(argv = process.argv.slice(2)) {
  const result = await syncPostMetadata(parseArgs(argv));
  console.log(result.legacy
    ? '✓ legacy metadata retained: ' + result.slug
    : '✓ metadata sync: ' + result.slug + (result.changed ? '' : ' (current)'));
}

if (require.main === module) {
  main().catch(error => {
    console.error(error.message);
    process.exitCode = 1;
  });
}

module.exports = { currentPublicationMonth, parseArgs, syncPostMetadata };
