'use strict';

const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const LEGACY = Object.freeze({
  'training-vs-inference': 'training-vs-inference-final.md', 'ai-chips-explainer': 'ai-chips-explainer-v4.md',
  'automated-research': 'automated-research-blog-v7.md', 'ai-coding-hardware': 'ai-coding-hardware-blog-v2.md',
  'llm-second-half': 'blog-llm-second-half.md', 'enterprise-ai-data-security': 'enterprise-ai-data-security-v3.md',
  'manus-agent-analysis': 'manus_blog_v2.md', 'openclaw-brand-creation': 'openclaw-blog-final.md',
  'enterprise-ai-three-stages': 'ai_enterprise_blog_v2.md',
});
const BLOCKED = new Set(['memory-system', 'harness-engineering', 'agent-three-problems', 'market-landscape-2026', 'tech-obsolescence', 'rag-evolution', 'skill-system-and-harness', 'finetuning-evolution', 'prompt-engineering-lifecycle']);
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

function createLedger(rootDir) {
  const posts = JSON.parse(fs.readFileSync(path.join(rootDir, 'tools/blog/data/posts-meta.json'), 'utf8')).posts;
  return posts.map(post => {
    const slug = post.slug;
    const exact = path.join(rootDir, 'docs/blog', `${slug}.md`);
    const sourcePath = fs.existsSync(exact) ? `docs/blog/${slug}.md` : LEGACY[slug] ? `docs/blog/${LEGACY[slug]}` : null;
    const sourceStatus = fs.existsSync(exact) ? 'source-confirmed' : LEGACY[slug] ? 'legacy-frozen' : 'blocked';
    if (BLOCKED.has(slug) !== (sourceStatus === 'blocked')) throw new Error(`Unexpected source status: ${slug}`);
    const html = fs.readFileSync(path.join(rootDir, 'tools/blog/posts', `${slug}.html`), 'utf8');
    const sourceMarkdown = sourcePath ? fs.readFileSync(path.join(rootDir, sourcePath), 'utf8').replace(/\r\n/g, '\n') : null;
    const sourceTitle = sourceMarkdown ? markdownTitle(sourceMarkdown, sourcePath) : null;
    if (sourceTitle && normalizeTitle(sourceTitle) !== normalizeTitle(post.title)) {
      throw new Error(`Source title does not match metadata for ${slug}: ${sourcePath}`);
    }
    const regenerated = sourcePath ? require('node:child_process').spawnSync(process.execPath, ['tools/blog/generate-post.js', sourcePath, path.join(rootDir, 'tools/blog/posts', `${slug}.html`)], { cwd: rootDir }).status === 0 : false;
    return { slug, html_path: `tools/blog/posts/${slug}.html`, source_path: sourcePath, source_status: sourceStatus,
      source_mapping_basis: sourceStatus === 'source-confirmed' ? 'exact-slug' : sourceStatus === 'legacy-frozen' ? 'legacy-title-match' : 'no-source',
      source_title: sourceTitle, metadata_title: post.title, title_verified: Boolean(sourceTitle),
      regeneration_status: sourceStatus === 'source-confirmed' ? (regenerated ? 'render-confirmed' : 'frozen-required') : 'not-eligible',
      html_editorial_sha256: sha256(postBody(html)), markdown_sha256: sourceMarkdown ? sha256(sourceMarkdown) : null };
  });
}

if (require.main === module) console.log(JSON.stringify(createLedger(path.resolve(__dirname, '..')), null, 2));
module.exports = { createLedger, postBody };
