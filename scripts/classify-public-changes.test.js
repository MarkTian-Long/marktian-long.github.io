'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { classifyChanges } = require('./classify-public-changes');

test('draft Markdown and draft-only images run source checks without Pages deployment', () => {
  assert.deepEqual(classifyChanges({
    changedFiles: ['drafts/blog/new-article.md', 'assets/images/blog/new-article/opening.svg'],
    currentPublicFiles: ['index.html', 'tools/blog/data/posts-meta.json'],
    basePublicFiles: ['index.html', 'tools/blog/data/posts-meta.json'],
  }), { publicChanged: false, fullCheck: false, blogReleaseChanged: true });
});

test('published article HTML, metadata, image and generated search assets use focused release checks', () => {
  assert.deepEqual(classifyChanges({
    changedFiles: ['docs/blog/new-article.md', 'tools/blog/posts/new-article.html', 'tools/blog/data/posts-meta.json',
      'assets/images/blog/new-article/opening.svg', 'tools/blog/index.html', 'feed.xml', 'sitemap.xml'],
    currentPublicFiles: ['tools/blog/posts/new-article.html', 'tools/blog/data/posts-meta.json',
      'assets/images/blog/new-article/opening.svg', 'tools/blog/index.html', 'feed.xml', 'sitemap.xml'],
    basePublicFiles: [],
  }), { publicChanged: true, fullCheck: false, blogReleaseChanged: true });
});

test('deleting a previously published image still triggers focused verification and deployment', () => {
  assert.deepEqual(classifyChanges({
    changedFiles: ['assets/images/blog/old-article/diagram.svg'],
    currentPublicFiles: [],
    basePublicFiles: ['assets/images/blog/old-article/diagram.svg'],
  }), { publicChanged: true, fullCheck: false, blogReleaseChanged: true });
});

test('a script-only change runs the full quality suite without redeploying unchanged public files', () => {
  assert.deepEqual(classifyChanges({
    changedFiles: ['scripts/check-blog-images.js', 'scripts/blog-image-assets.test.js'],
    currentPublicFiles: ['index.html'], basePublicFiles: ['index.html'],
  }), { publicChanged: false, fullCheck: true, blogReleaseChanged: false });
});

test('research backlog and governance documentation do not run site deployment or full checks', () => {
  assert.deepEqual(classifyChanges({
    changedFiles: ['tools/blog/research_backlog.md', 'tools/blog/governance/blog-sop.md', 'docs/plans/release-optimization.md'],
    currentPublicFiles: ['index.html'], basePublicFiles: ['index.html'],
  }), { publicChanged: false, fullCheck: false, blogReleaseChanged: false });
});

test('public manifest and public artifact builder changes still trigger full verification and deployment', () => {
  assert.deepEqual(classifyChanges({
    changedFiles: ['scripts/public-dist-manifest.js'],
    currentPublicFiles: ['index.html'], basePublicFiles: ['index.html'],
  }), { publicChanged: true, fullCheck: true, blogReleaseChanged: false });
});

test('mixed blog and non-blog public changes fall back to the full repository suite', () => {
  assert.deepEqual(classifyChanges({
    changedFiles: ['tools/blog/posts/new-article.html', 'tools/blog/data/posts-meta.json', 'assets/css/style.css'],
    currentPublicFiles: ['tools/blog/posts/new-article.html', 'tools/blog/data/posts-meta.json', 'assets/css/style.css'],
    basePublicFiles: [],
  }), { publicChanged: true, fullCheck: true, blogReleaseChanged: true });
});

test('generated blog search assets without an article/source change do not bypass full checks', () => {
  assert.deepEqual(classifyChanges({
    changedFiles: ['feed.xml', 'tools/blog/index.html'],
    currentPublicFiles: ['feed.xml', 'tools/blog/index.html'], basePublicFiles: [],
  }), { publicChanged: true, fullCheck: true, blogReleaseChanged: true });
});

test('site-wide robots changes remain full-site changes even when blog sources also change', () => {
  assert.deepEqual(classifyChanges({
    changedFiles: ['docs/blog/new-article.md', 'robots.txt'],
    currentPublicFiles: ['robots.txt'], basePublicFiles: ['robots.txt'],
  }), { publicChanged: true, fullCheck: true, blogReleaseChanged: true });
});

test('root homepage changes remain full-site changes even when blog sources also change', () => {
  const result = classifyChanges({
    changedFiles: ['docs/blog/new-article.md', 'index.html'],
    currentPublicFiles: ['index.html'], basePublicFiles: ['index.html'],
  });
  assert.equal(result.fullCheck, true);
  assert.equal(result.blogReleaseChanged, true);
});
