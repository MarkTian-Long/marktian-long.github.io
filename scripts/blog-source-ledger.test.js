'use strict';
const assert = require('node:assert/strict');
const path = require('node:path');
const test = require('node:test');
const { auditSourceInventory, createLedger } = require('./blog-source-ledger');

test('blog ledger accounts for every published post and freezes stale regenerations', () => {
  const rootDir = path.resolve(__dirname, '..');
  const inventory = auditSourceInventory(rootDir);
  const ledger = createLedger(rootDir);
  const metadata = require('../tools/blog/data/posts-meta.json');
  assert.equal(ledger.length, metadata.posts.length);
  assert.ok(ledger.every(row => typeof row.slug === 'string' && row.slug));
  assert.ok(ledger.every(row => ['source-confirmed', 'legacy-frozen', 'blocked'].includes(row.source_status)));
  assert.ok(ledger.every(row => ['match', 'mismatch', 'unparseable', 'not-applicable'].includes(row.summary_status)));
  assert.ok(ledger.some(row => row.summary_status === 'match'));
  assert.ok(ledger.some(row => row.summary_status === 'mismatch'));
  assert.ok(ledger.some(row => row.summary_status === 'unparseable'));
  assert.equal(inventory.metadataPostCount, metadata.posts.length);
  assert.equal(
    inventory.exactSlugSourceCount + inventory.legacyMappedCount + inventory.blockedNoSourceCount,
    metadata.posts.length,
  );
  assert.equal(
    inventory.exactSlugSourceCount + inventory.legacyMappedCount + inventory.supersededSnapshotCount,
    inventory.sourceFileCount,
  );
  assert.deepEqual(inventory.unclassifiedPostSlugs, []);
  assert.deepEqual(inventory.unclassifiedMarkdownFiles, []);
  assert.deepEqual(inventory.missingLegacyFiles, []);
  assert.deepEqual(inventory.staleLegacyMappings, []);
  assert.deepEqual(inventory.staleBlockedSlugs, []);
  assert.deepEqual(inventory.supersededSnapshots, [
    { file: 'automated-research-blog-v5.md', canonicalSource: 'automated-research-blog-v7.md' },
    { file: 'automated-research-blog-v6.md', canonicalSource: 'automated-research-blog-v7.md' },
  ]);
});
