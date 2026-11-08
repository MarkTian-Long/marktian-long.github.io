'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { verifyPromotion } = require('./check-blog-release-equivalence');
const slug = 'example-post';
const approved = '# 标题\n\n> 摘要\n\n---\n\n**核心判断。**\n\n![关系](assets/example-post/relation.svg "说明")\n';
const published = approved.replace('](assets/example-post/', '](../../assets/images/blog/example-post/');
const options = { slug, readApprovedImage: () => Buffer.from('<svg/>'), readPublishedImage: () => Buffer.from('<svg/>') };
test('allows path-only promotion and identical assets', () => assert.equal(verifyPromotion(approved, published, options).images, 1));
test('allows normalized line endings', () => assert.equal(verifyPromotion(approved.replace(/\n/g, '\r\n'), published, options).images, 1));
test('rejects rewritten conclusion', () => assert.throws(() => verifyPromotion(approved, published.replace('核心判断', '新判断'), options), /Approved content changed/));
test('rejects changed emphasis', () => assert.throws(() => verifyPromotion(approved, published.replaceAll('**', ''), options), /Approved content changed/));
test('rejects changed captions', () => assert.throws(() => verifyPromotion(approved, published.replace('说明', '新图注'), options), /Approved content changed/));
test('rejects substituted image bytes', () => assert.throws(() => verifyPromotion(approved, published, { ...options, readPublishedImage: () => Buffer.from('<svg>changed</svg>') }), /Image bytes changed/));
test('rejects unsafe article names', () => assert.throws(() => verifyPromotion(approved, published, { ...options, slug: '../example-post' }), /Invalid slug/));
test('rejects unexpected image source paths', () => assert.throws(() => verifyPromotion(approved.replace('assets/example-post/', 'elsewhere/'), published, options), /Unexpected approved image path/));
test('supports text-only articles', () => assert.equal(verifyPromotion('# Title\n', '# Title\n', options).images, 0));
test('rejects changed semantic metadata', () => {
  const frontmatter = '---\ncategory: 商业\n---\n';
  assert.throws(() => verifyPromotion(frontmatter + approved, frontmatter.replace('商业', '行业') + published, options), /Approved content changed/);
});
test('requires both image readers rather than silently skipping asset checks', () => assert.throws(() => verifyPromotion(approved, published, { slug }), /Both image readers/));
test('checks an actual approved Git commit and current published files', () => {
  const fs = require('node:fs');
  const os = require('node:os');
  const path = require('node:path');
  const { execFileSync } = require('node:child_process');
  const { verifyPromotionAtRef } = require('./check-blog-release-equivalence');
  const rootDir = fs.mkdtempSync(path.join(os.tmpdir(), 'blog-promotion-test-'));
  const git = args => execFileSync('git', args, { cwd: rootDir, encoding: 'utf8' }).trim();
  const write = (name, content) => { fs.mkdirSync(path.dirname(path.join(rootDir, name)), { recursive: true }); fs.writeFileSync(path.join(rootDir, name), content); };
  try {
    git(['init', '-q']); git(['config', 'user.name', 'Local Test']); git(['config', 'user.email', 'test@example.invalid']);
    write(`drafts/blog/${slug}.md`, approved);
    write(`drafts/blog/assets/${slug}/relation.svg`, '<svg/>');
    git(['add', '.']); git(['commit', '-qm', 'Approved fixture']);
    const approvedRef = git(['rev-parse', 'HEAD']);
    write(`docs/blog/${slug}.md`, published);
    write(`assets/images/blog/${slug}/relation.svg`, '<svg/>');
    assert.equal(verifyPromotionAtRef({ rootDir, approvedRef, slug }).images, 1);
    write(`assets/images/blog/${slug}/relation.svg`, '<svg>changed</svg>');
    assert.throws(() => verifyPromotionAtRef({ rootDir, approvedRef, slug }), /Image bytes changed/);
    assert.throws(() => verifyPromotionAtRef({ rootDir, approvedRef: 'main', slug }), /40-character/);
  } finally { fs.rmSync(rootDir, { recursive: true, force: true }); }
});
