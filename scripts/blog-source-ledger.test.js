'use strict';
const assert = require('node:assert/strict');
const path = require('node:path');
const test = require('node:test');
const { createLedger } = require('./blog-source-ledger');
test('blog ledger accounts for every published post and freezes stale regenerations', () => {
  const ledger = createLedger(path.resolve(__dirname, '..'));
  const metadata = require('../tools/blog/data/posts-meta.json');
  assert.equal(ledger.length, metadata.posts.length);
  assert.ok(ledger.every(row => typeof row.slug === 'string' && row.slug));
  assert.ok(ledger.every(row => ['source-confirmed', 'legacy-frozen', 'blocked'].includes(row.source_status)));
  assert.ok(ledger.every(row => ['match', 'mismatch', 'unparseable', 'not-applicable'].includes(row.summary_status)));
  assert.ok(ledger.some(row => row.summary_status === 'match'));
  assert.ok(ledger.some(row => row.summary_status === 'mismatch'));
  assert.ok(ledger.some(row => row.summary_status === 'unparseable'));
});
