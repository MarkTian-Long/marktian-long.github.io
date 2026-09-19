'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { parseSourceMarkdown } = require('./markdown-source.js');
const { validateSemanticMetadata } = require('./blog-taxonomy.js');
const { validateBlogMetadata } = require('../../scripts/generate-search-assets.js');

function currentPublicationMonth() {
  const now = new Date();
  return `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}`;
}

function validateDate(date) {
  if (!/^\d{4}\.\d{2}$/.test(date)) throw new Error(`Publication date must use YYYY.MM: ${date}`);
}

function syncPostMetadata({ sourcePath, rootDir = process.cwd(), date } = {}) {
  if (!sourcePath) throw new Error('sourcePath is required');
  if (date !== undefined) validateDate(date);
  const absoluteSourcePath = path.resolve(sourcePath);
  const source = fs.readFileSync(absoluteSourcePath, 'utf8');
  const slug = path.basename(absoluteSourcePath, '.md');
  const parsed = parseSourceMarkdown(source, sourcePath);
  const metadataPath = path.join(rootDir, 'tools/blog/data/posts-meta.json');
  const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
  const existingIndex = metadata.posts.findIndex((post) => post.slug === slug);

  if (!parsed.frontmatter) {
    if (existingIndex === -1) throw new Error(`New Markdown sources require strict frontmatter: ${sourcePath}`);
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
    url: `posts/${slug}.html`,
  };
  validateDate(synced.date);
  const next = { ...metadata, posts: [...metadata.posts] };
  if (existingIndex === -1) next.posts.push(synced);
  else next.posts[existingIndex] = synced;
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

function main(argv = process.argv.slice(2)) {
  const result = syncPostMetadata(parseArgs(argv));
  console.log(result.legacy ? `✓ legacy metadata retained: ${result.slug}` : `✓ metadata sync: ${result.slug}${result.changed ? '' : ' (current)'}`);
}

if (require.main === module) main();

module.exports = { currentPublicationMonth, parseArgs, syncPostMetadata };
