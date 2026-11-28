'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { classifyChanges } = require('./classify-public-changes');

test('draft Markdown and draft-only images run source checks without Pages deployment', () => {
  const result = classifyChanges({
    changedFiles: [
      'drafts/blog/new-article.md',
      'assets/images/blog/new-article/opening.svg',
    ],
    currentPublicFiles: ['index.html', 'tools/blog/data/posts-meta.json'],
    basePublicFiles: ['index.html', 'tools/blog/data/posts-meta.json'],
  });
  assert.deepEqual(result, {
    publicChanged: false,
    fullCheck: false,
    blogSourceChanged: true,
  });
});

test('published HTML, metadata, and registered images trigger full verification and deployment', () => {
  const result = classifyChanges({
    changedFiles: [
      'tools/blog/posts/new-article.html',
      'tools/blog/data/posts-meta.json',
      'assets/images/blog/new-article/opening.svg',
    ],
    currentPublicFiles: [
      'tools/blog/posts/new-article.html',
      'tools/blog/data/posts-meta.json',
      'assets/images/blog/new-article/opening.svg',
    ],
    basePublicFiles: [],
  });
  assert.deepEqual(result, {
    publicChanged: true,
    fullCheck: true,
    blogSourceChanged: true,
  });
});

test('deleting a previously published image still triggers deployment', () => {
  const result = classifyChanges({
    changedFiles: ['assets/images/blog/old-article/diagram.svg'],
    currentPublicFiles: [],
    basePublicFiles: ['assets/images/blog/old-article/diagram.svg'],
  });
  assert.equal(result.publicChanged, true);
  assert.equal(result.fullCheck, true);
});

test('a script-only change runs the full quality suite without redeploying unchanged public files', () => {
  const result = classifyChanges({
    changedFiles: ['scripts/check-blog-images.js', 'scripts/blog-image-assets.test.js'],
    currentPublicFiles: ['index.html'],
    basePublicFiles: ['index.html'],
  });
  assert.deepEqual(result, {
    publicChanged: false,
    fullCheck: true,
    blogSourceChanged: false,
  });
});

test('research backlog and governance documentation do not run site deployment or full checks', () => {
  const result = classifyChanges({
    changedFiles: [
      'tools/blog/research_backlog.md',
      'tools/blog/governance/blog-sop.md',
      'docs/plans/release-optimization.md',
    ],
    currentPublicFiles: ['index.html'],
    basePublicFiles: ['index.html'],
  });
  assert.deepEqual(result, {
    publicChanged: false,
    fullCheck: false,
    blogSourceChanged: false,
  });
});

test('public manifest and public artifact builder changes trigger deployment', () => {
  const result = classifyChanges({
    changedFiles: ['scripts/public-dist-manifest.js'],
    currentPublicFiles: ['index.html'],
    basePublicFiles: ['index.html'],
  });
  assert.equal(result.publicChanged, true);
  assert.equal(result.fullCheck, true);
});
