'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { buildPreviewRedirect, parseArgs } = require('../tools/blog/publish');

test('formal publication requires an explicit prepare flag and complete approved commit', () => {
  const approvedRef = 'a'.repeat(40);
  assert.deepEqual(parseArgs([
    '--slug', 'example-article',
    '--approved-ref', approvedRef,
    '--prepare',
  ]), {
    slug: 'example-article',
    approvedRef,
    date: undefined,
    dryRun: false,
  });
  assert.throws(() => parseArgs([
    '--slug', 'example-article',
    '--approved-ref', 'short',
    '--prepare',
  ]), /complete 40-character commit SHA/);
  assert.throws(() => parseArgs([
    '--slug', 'example-article',
    '--approved-ref', approvedRef,
  ]), /explicit --prepare/);
});

test('publication preview redirect is noindex, canonical and preserves the URL fragment', () => {
  const html = buildPreviewRedirect({
    slug: 'example-article',
    title: 'AI 与产品 <界面>',
  });
  assert.match(html, /name="robots" content="noindex,follow"/);
  assert.match(html, /http-equiv="refresh" content="0;url=\.\.\/posts\/example-article\.html"/);
  assert.match(html, /canonical" href="https:\/\/marktian-long\.github\.io\/tools\/blog\/posts\/example-article\.html"/);
  assert.match(html, /location\.replace\("\.\.\/posts\/example-article\.html"\+location\.hash\)/);
  assert.match(html, /AI 与产品 &lt;界面&gt;/);
});

test('publication parser accepts an explicit publication month and dry-run mode', () => {
  const result = parseArgs([
    '--slug', 'example-article',
    '--approved-ref', 'b'.repeat(40),
    '--date', '2026.11',
    '--prepare',
    '--dry-run',
  ]);
  assert.equal(result.date, '2026.11');
  assert.equal(result.dryRun, true);
});
