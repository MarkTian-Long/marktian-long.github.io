'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { parseSourceMarkdown } = require('./markdown-source.js');
const { validateBlogMetadata } = require('../../scripts/generate-search-assets.js');
const { validateSemanticMetadata } = require('./blog-taxonomy.js');

function sourceFiles(rootDir) {
  const sourceDir = path.join(rootDir, 'docs/blog');
  if (!fs.existsSync(sourceDir)) return [];
  return fs.readdirSync(sourceDir).filter((name) => name.endsWith('.md')).sort().map((name) => path.join(sourceDir, name));
}

function checkBlogTaxonomy(rootDir = process.cwd()) {
  const metadataPath = path.join(rootDir, 'tools/blog/data/posts-meta.json');
  const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
  validateBlogMetadata(metadata);
  const postsBySlug = new Map(metadata.posts.map((post) => [post.slug, post]));
  const knownSlugs = metadata.posts.map((post) => post.slug);
  const errors = [];

  for (const filePath of sourceFiles(rootDir)) {
    const sourcePath = path.relative(rootDir, filePath).replace(/\\/g, '/');
    const slug = path.basename(filePath, '.md');
    try {
      const markdown = fs.readFileSync(filePath, 'utf8');
      if (markdown.replace(/^\uFEFF/, '').replace(/\r/g, '').split('\n')[0] !== '---') continue;
      const parsed = parseSourceMarkdown(markdown, sourcePath);
      const post = postsBySlug.get(slug);
      if (!post) {
        errors.push(`Frontmatter source has not been synced to posts-meta.json: ${sourcePath}`);
        continue;
      }
      validateSemanticMetadata({ ...parsed.frontmatter, slug }, { knownSlugs, source: sourcePath });
      for (const field of ['category', 'tags', 'topics', 'concepts', 'share_quote', 'relations']) {
        const actual = field === 'relations' ? (post.relations || []) : post[field];
        if (JSON.stringify(actual) !== JSON.stringify(parsed.frontmatter[field])) {
          errors.push(`Frontmatter and posts-meta.json differ for ${slug}: ${field}`);
        }
      }
      if (post.title !== parsed.sourceTitle) errors.push(`Frontmatter source title differs from posts-meta.json: ${slug}`);
      if (post.summary !== parsed.sourceSummary) errors.push(`Frontmatter source summary differs from posts-meta.json: ${slug}`);
    } catch (error) {
      errors.push(error.message);
    }
  }
  return { errors, sourceCount: sourceFiles(rootDir).length, postCount: metadata.posts.length };
}

function main() {
  const result = checkBlogTaxonomy();
  if (result.errors.length) {
    for (const error of result.errors) console.error(`✗ ${error}`);
    process.exitCode = 1;
    return;
  }
  console.log(`✓ blog taxonomy: ${result.postCount} metadata posts, ${result.sourceCount} Markdown sources`);
}

if (require.main === module) main();

module.exports = { checkBlogTaxonomy };
