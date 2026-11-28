'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { parseSourceMarkdown } = require('./markdown-source.js');
const { validateSemanticMetadata } = require('./blog-taxonomy.js');
const { validateBlogMetadata } = require('../../scripts/generate-search-assets.js');
const { validateBlogImageAsset } = require('../../scripts/check-blog-images.js');

function currentPublicationMonth() {
  const now = new Date();
  return String(now.getFullYear()) + '.' + String(now.getMonth() + 1).padStart(2, '0');
}

function validateDate(date) {
  if (!/^\d{4}\.\d{2}$/.test(date)) throw new Error('Publication date must use YYYY.MM: ' + date);
}

function markdownLinesOutsideFences(markdown, sourcePath) {
  const lines = String(markdown).replace(/\r/g, '').split('\n');
  const outsideFence = [];
  let fenceChar = null;
  let fenceLength = 0;

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const fence = line.match(/^\s{0,3}(\x60{3,}|~{3,})/);
    if (fenceChar === null) {
      outsideFence[index] = true;
      if (fence) {
        fenceChar = fence[1][0];
        fenceLength = fence[1].length;
        outsideFence[index] = false;
      }
      continue;
    }

    outsideFence[index] = false;
    const closing = line.match(/^\s{0,3}(\x60{3,}|~{3,})\s*$/);
    if (closing && closing[1][0] === fenceChar && closing[1].length >= fenceLength) {
      fenceChar = null;
      fenceLength = 0;
    }
  }
  if (fenceChar !== null) throw new Error('Markdown source has an unclosed code fence: ' + sourcePath);
  return { lines, outsideFence };
}

async function collectInlineVisuals({ bodyMarkdown, sourcePath, slug, rootDir }) {
  const absoluteSourcePath = path.resolve(rootDir, sourcePath);
  const relativeSourcePath = path.relative(rootDir, absoluteSourcePath).replace(/\\/g, '/');
  if (!/^(?:docs|drafts)\/blog\/[a-z0-9]+(?:-[a-z0-9]+)*\.md$/.test(relativeSourcePath)) {
    throw new Error('Metadata sync source must be a single blog Markdown file under docs/blog or drafts/blog: ' + sourcePath);
  }

  const parsed = markdownLinesOutsideFences(bodyMarkdown, relativeSourcePath);
  const imagePattern = /^!\[([^\]\r\n]+)\]\(([^)\s()]+)\s+"([^"\r\n]+)"\)\s*$/;
  const expectedPrefix = 'assets/images/blog/' + slug + '/';
  const visuals = [];

  for (let index = 0; index < parsed.lines.length; index += 1) {
    if (!parsed.outsideFence[index]) continue;
    const match = imagePattern.exec(parsed.lines[index]);
    if (!match) continue;

    const alt = match[1];
    const source = match[2];
    const caption = match[3];
    if (/^(?:[a-z][a-z0-9+.-]*:|\/\/)/i.test(source)
      || source.includes('\\')
      || path.posix.isAbsolute(source)) {
      throw new Error('New article images must use registered local assets: ' + relativeSourcePath);
    }

    const resolved = path.posix.normalize(path.posix.join(path.posix.dirname(relativeSourcePath), source));
    if (!resolved.startsWith(expectedPrefix)
      || source !== '../../' + resolved
      || !/^assets\/images\/blog\/[a-z0-9-]+\/[a-z0-9-]+\.(?:svg|webp)$/.test(resolved)) {
      throw new Error('Markdown image must resolve to a local asset inside ' + expectedPrefix + ': ' + source);
    }

    const asset = await validateBlogImageAsset({ rootDir, imagePath: resolved });
    visuals.push({
      src: resolved,
      alt,
      caption,
      width: asset.width,
      height: asset.height,
    });
  }
  return visuals;
}

function syncPostMetadata({ sourcePath, rootDir = process.cwd(), date } = {}) {
  if (!sourcePath) throw new Error('sourcePath is required');
  if (date !== undefined) validateDate(date);
  const absoluteSourcePath = path.resolve(rootDir, sourcePath);
  const source = fs.readFileSync(absoluteSourcePath, 'utf8');
  const slug = path.basename(absoluteSourcePath, '.md');
  const parsed = parseSourceMarkdown(source, sourcePath);
  const metadataPath = path.join(rootDir, 'tools/blog/data/posts-meta.json');
  const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
  const existingIndex = metadata.posts.findIndex((post) => post.slug === slug);

  if (!parsed.frontmatter) {
    if (existingIndex === -1) throw new Error('New Markdown sources require strict frontmatter: ' + sourcePath);
    return { slug, legacy: true, changed: false, post: metadata.posts[existingIndex] };
  }

  validateSemanticMetadata({ ...parsed.frontmatter, slug }, {
    knownSlugs: metadata.posts.map((post) => post.slug),
    source: sourcePath,
  });
  const existing = existingIndex === -1 ? null : metadata.posts[existingIndex];
  const synced = {
    ...(existing || {}),
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
  };
  validateDate(synced.date);
  const next = { ...metadata, posts: [...metadata.posts] };
  if (existingIndex === -1) next.posts.unshift(synced);
  else next.posts[existingIndex] = synced;
  next.posts.sort((a, b) => b.date.localeCompare(a.date));
  validateBlogMetadata(next);

  const serialized = JSON.stringify(next, null, 2) + '\n';
  const current = fs.readFileSync(metadataPath, 'utf8');
  if (current !== serialized) fs.writeFileSync(metadataPath, serialized, 'utf8');
  return { slug, legacy: false, changed: current !== serialized, post: synced };
}

async function syncPostMetadataAsync({ sourcePath, rootDir = process.cwd(), date } = {}) {
  if (!sourcePath) throw new Error('sourcePath is required');
  if (date !== undefined) validateDate(date);
  const absoluteSourcePath = path.resolve(rootDir, sourcePath);
  const source = fs.readFileSync(absoluteSourcePath, 'utf8');
  const slug = path.basename(absoluteSourcePath, '.md');
  const parsed = parseSourceMarkdown(source, sourcePath);
  const metadataPath = path.join(rootDir, 'tools/blog/data/posts-meta.json');
  const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
  const existingIndex = metadata.posts.findIndex((post) => post.slug === slug);

  if (!parsed.frontmatter) {
    if (existingIndex === -1) throw new Error('New Markdown sources require strict frontmatter: ' + sourcePath);
    return { slug, legacy: true, changed: false, post: metadata.posts[existingIndex] };
  }

  validateSemanticMetadata({ ...parsed.frontmatter, slug }, {
    knownSlugs: metadata.posts.map((post) => post.slug),
    source: sourcePath,
  });
  const existing = existingIndex === -1 ? null : metadata.posts[existingIndex];
  const inlineVisuals = await collectInlineVisuals({
    bodyMarkdown: parsed.bodyMarkdown,
    sourcePath,
    slug,
    rootDir,
  });
  if (!existing && inlineVisuals.length === 0) {
    throw new Error('New articles require at least one registered inline image, including the opening image: ' + sourcePath);
  }
  if (existing) {
    const existingVisuals = existing.visuals && Array.isArray(existing.visuals.inline) ? existing.visuals.inline : [];
    if (JSON.stringify(existingVisuals) !== JSON.stringify(inlineVisuals)) {
      throw new Error('Existing article Markdown images differ from posts-meta visuals; resolve the source/metadata mismatch before syncing: ' + slug);
    }
  }

  const synced = {
    ...(existing || {}),
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
  };
  if (!existing) synced.visuals = { inline: inlineVisuals };
  validateDate(synced.date);
  const next = { ...metadata, posts: [...metadata.posts] };
  if (existingIndex === -1) next.posts.unshift(synced);
  else next.posts[existingIndex] = synced;
  next.posts.sort((a, b) => b.date.localeCompare(a.date));
  validateBlogMetadata(next);

  const serialized = JSON.stringify(next, null, 2) + '\n';
  const current = fs.readFileSync(metadataPath, 'utf8');
  if (current !== serialized) fs.writeFileSync(metadataPath, serialized, 'utf8');
  return { slug, legacy: false, changed: current !== serialized, post: synced };
}

function parseArgs(argv) {
  if (!argv.length || argv[0] !== '--write') throw new Error('Usage: node tools/blog/sync-post-metadata.js --write <source.md> [--date YYYY.MM]');
  if (argv.length !== 2 && argv.length !== 4) throw new Error('Usage: node tools/blog/sync-post-metadata.js --write <source.md> [--date YYYY.MM]');
  if (argv.length === 4 && argv[2] !== '--date') throw new Error('Usage: node tools/blog/sync-post-metadata.js --write <source.md> [--date YYYY.MM]');
  return { sourcePath: argv[1], date: argv[3] };
}

async function main(argv = process.argv.slice(2)) {
  const result = await syncPostMetadataAsync(parseArgs(argv));
  console.log(result.legacy ? '✓ legacy metadata retained: ' + result.slug : '✓ metadata sync: ' + result.slug + (result.changed ? '' : ' (current)'));
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}

module.exports = { collectInlineVisuals, currentPublicationMonth, markdownLinesOutsideFences, parseArgs, syncPostMetadata, syncPostMetadataAsync };
