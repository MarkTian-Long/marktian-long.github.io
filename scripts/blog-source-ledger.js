'use strict';

const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const { parseSourceMarkdown } = require('../tools/blog/markdown-source');

const LEGACY = Object.freeze({
  'training-vs-inference': 'training-vs-inference-final.md', 'ai-chips-explainer': 'ai-chips-explainer-v4.md',
  'automated-research': 'automated-research-blog-v7.md', 'ai-coding-hardware': 'ai-coding-hardware-blog-v2.md',
  'llm-second-half': 'blog-llm-second-half.md', 'enterprise-ai-data-security': 'enterprise-ai-data-security-v3.md',
  'manus-agent-analysis': 'manus_blog_v2.md', 'openclaw-brand-creation': 'openclaw-blog-final.md',
  'enterprise-ai-three-stages': 'ai_enterprise_blog_v2.md',
});
const BLOCKED = new Set(['memory-system', 'harness-engineering', 'agent-three-problems', 'market-landscape-2026', 'tech-obsolescence', 'rag-evolution', 'skill-system-and-harness', 'finetuning-evolution', 'prompt-engineering-lifecycle']);
const SNAPSHOT_ONLY = Object.freeze({
  'automated-research-blog-v5.md': 'automated-research-blog-v7.md',
  'automated-research-blog-v6.md': 'automated-research-blog-v7.md',
});
const sha256 = value => crypto.createHash('sha256').update(value).digest('hex');
const normalizeTitle = value => value.normalize('NFKC').replace(/[“”]/g, '"').replace(/[‘’]/g, "'").replace(/\s+/g, ' ').trim();

function markdownTitle(markdown, sourcePath) {
  const match = markdown.replace(/\r/g, '').match(/^#\s+(.+)$/m);
  if (!match) throw new Error(`Markdown source lacks a top-level title: ${sourcePath}`);
  return match[1].trim();
}

function postBody(html) {
  const start = html.indexOf('<div class="post-body">');
  const end = html.indexOf('<section class="continue-reading"', start);
  if (start === -1 || end === -1) throw new Error('Published post body boundary is missing');
  return html.slice(start, end).replace(/\r\n/g, '\n');
}

function auditSourceInventory(rootDir) {
  const posts = JSON.parse(fs.readFileSync(path.join(rootDir, 'tools/blog/data/posts-meta.json'), 'utf8')).posts;
  const docsDir = path.join(rootDir, 'docs/blog');
  const docsFiles = fs.readdirSync(docsDir).filter(file => file.endsWith('.md')).sort();
  const docsSet = new Set(docsFiles);
  const postSlugs = new Set(posts.map(post => post.slug));
  const exactPosts = posts.filter(post => docsSet.has(post.slug + '.md'));
  const legacyPosts = posts.filter(post => !docsSet.has(post.slug + '.md') && Boolean(LEGACY[post.slug]));
  const blockedPosts = posts.filter(post => !docsSet.has(post.slug + '.md') && !LEGACY[post.slug] && BLOCKED.has(post.slug));
  const unclassifiedPostSlugs = posts
    .filter(post => !docsSet.has(post.slug + '.md') && !LEGACY[post.slug] && !BLOCKED.has(post.slug))
    .map(post => post.slug).sort();
  const staleLegacyMappings = Object.keys(LEGACY).filter(slug => !postSlugs.has(slug)).sort();
  const staleBlockedSlugs = [...BLOCKED].filter(slug => !postSlugs.has(slug)).sort();
  const mappedFiles = new Set([
    ...exactPosts.map(post => post.slug + '.md'),
    ...legacyPosts.map(post => LEGACY[post.slug]),
  ]);
  const missingLegacyFiles = legacyPosts.map(post => LEGACY[post.slug]).filter(file => !docsSet.has(file)).sort();
  const supersededSnapshots = Object.entries(SNAPSHOT_ONLY).sort(([a], [b]) => a.localeCompare(b)).map(([file, canonicalSource]) => {
    if (!docsSet.has(file)) throw new Error('Missing declared historical snapshot: docs/blog/' + file);
    if (!docsSet.has(canonicalSource) || !mappedFiles.has(canonicalSource)) {
      throw new Error('Historical snapshot must point to a mapped canonical source: ' + file + ' -> ' + canonicalSource);
    }
    if (mappedFiles.has(file)) throw new Error('Historical snapshot cannot also be a current source: ' + file);
    const snapshotTitle = markdownTitle(fs.readFileSync(path.join(docsDir, file), 'utf8'), 'docs/blog/' + file);
    const canonicalTitle = markdownTitle(fs.readFileSync(path.join(docsDir, canonicalSource), 'utf8'), 'docs/blog/' + canonicalSource);
    if (normalizeTitle(snapshotTitle) !== normalizeTitle(canonicalTitle)) {
      throw new Error('Historical snapshot title differs from its canonical source: ' + file);
    }
    return { file, canonicalSource };
  });
  const snapshotFiles = new Set(supersededSnapshots.map(item => item.file));
  const unclassifiedMarkdownFiles = docsFiles.filter(file => !mappedFiles.has(file) && !snapshotFiles.has(file));
  return {
    metadataPostCount: posts.length,
    sourceFileCount: docsFiles.length,
    exactSlugSourceCount: exactPosts.length,
    legacyMappedCount: legacyPosts.length,
    blockedNoSourceCount: blockedPosts.length,
    supersededSnapshotCount: supersededSnapshots.length,
    supersededSnapshots,
    unclassifiedPostSlugs,
    unclassifiedMarkdownFiles,
    missingLegacyFiles,
    staleLegacyMappings,
    staleBlockedSlugs,
  };
}

function createLedger(rootDir) {
  const inventory = auditSourceInventory(rootDir);
  const inventoryErrors = [
    ...inventory.unclassifiedPostSlugs.map(slug => 'unclassified published post: ' + slug),
    ...inventory.unclassifiedMarkdownFiles.map(file => 'unclassified Markdown source: docs/blog/' + file),
    ...inventory.missingLegacyFiles.map(file => 'missing legacy source: docs/blog/' + file),
    ...inventory.staleLegacyMappings.map(slug => 'stale legacy slug mapping: ' + slug),
    ...inventory.staleBlockedSlugs.map(slug => 'stale blocked slug: ' + slug),
  ];
  if (inventoryErrors.length) throw new Error('Blog source inventory is incomplete:\n' + inventoryErrors.join('\n'));
  const posts = JSON.parse(fs.readFileSync(path.join(rootDir, 'tools/blog/data/posts-meta.json'), 'utf8')).posts;
  return posts.map(post => {
    const slug = post.slug;
    const exact = path.join(rootDir, 'docs/blog', `${slug}.md`);
    const sourcePath = fs.existsSync(exact) ? `docs/blog/${slug}.md` : LEGACY[slug] ? `docs/blog/${LEGACY[slug]}` : null;
    const sourceStatus = fs.existsSync(exact) ? 'source-confirmed' : LEGACY[slug] ? 'legacy-frozen' : 'blocked';
    if (BLOCKED.has(slug) !== (sourceStatus === 'blocked')) throw new Error(`Unexpected source status: ${slug}`);
    const html = fs.readFileSync(path.join(rootDir, 'tools/blog/posts', `${slug}.html`), 'utf8');
    const sourceMarkdown = sourcePath ? fs.readFileSync(path.join(rootDir, sourcePath), 'utf8').replace(/\r\n/g, '\n') : null;
    let sourceTitle = sourceMarkdown ? markdownTitle(sourceMarkdown, sourcePath) : null;
    let sourceSummary = null;
    let summaryStatus = sourceMarkdown ? 'unparseable' : 'not-applicable';
    let summaryError = null;
    if (sourceMarkdown) {
      try {
        const parsed = parseSourceMarkdown(sourceMarkdown, sourcePath);
        sourceTitle = parsed.sourceTitle;
        sourceSummary = parsed.sourceSummary;
        summaryStatus = sourceSummary === post.summary ? 'match' : 'mismatch';
      } catch (error) {
        summaryError = error.message;
      }
    }
    if (sourceTitle && normalizeTitle(sourceTitle) !== normalizeTitle(post.title)) {
      throw new Error(`Source title does not match metadata for ${slug}: ${sourcePath}`);
    }
    const regenerated = sourcePath && summaryStatus === 'match'
      ? require('node:child_process').spawnSync(process.execPath, ['tools/blog/generate-post.js', sourcePath, path.join(rootDir, 'tools/blog/posts', `${slug}.html`)], { cwd: rootDir }).status === 0
      : false;
    return { slug, html_path: `tools/blog/posts/${slug}.html`, source_path: sourcePath, source_status: sourceStatus,
      source_mapping_basis: sourceStatus === 'source-confirmed' ? 'exact-slug' : sourceStatus === 'legacy-frozen' ? 'legacy-title-match' : 'no-source',
      source_title: sourceTitle, source_summary: sourceSummary, summary_status: summaryStatus, summary_error: summaryError,
      metadata_title: post.title, title_verified: Boolean(sourceTitle),
      regeneration_status: sourceStatus === 'source-confirmed' ? (regenerated ? 'render-confirmed' : 'frozen-required') : 'not-eligible',
      html_editorial_sha256: sha256(postBody(html)), markdown_sha256: sourceMarkdown ? sha256(sourceMarkdown) : null };
  });
}

if (require.main === module) console.log(JSON.stringify(createLedger(path.resolve(__dirname, '..')), null, 2));
module.exports = { auditSourceInventory, createLedger, postBody };
