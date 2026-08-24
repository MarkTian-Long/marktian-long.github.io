'use strict';
const assert = require('node:assert/strict');
const path = require('node:path');
const test = require('node:test');
const { createLedger } = require('./blog-source-ledger');
test('blog ledger accounts for every published post and freezes stale regenerations', () => {
  const ledger = createLedger(path.resolve(__dirname, '..'));
  assert.equal(ledger.length, 39);
  assert.equal(ledger.filter(row => row.source_status === 'source-confirmed').length, 21);
  assert.equal(ledger.filter(row => row.regeneration_status === 'frozen-required').length, 21);
  assert.equal(ledger.filter(row => row.source_status === 'legacy-frozen').length, 9);
  assert.equal(ledger.filter(row => row.source_status === 'blocked').length, 9);
});
