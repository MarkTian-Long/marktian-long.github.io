'use strict';
const assert = require('node:assert/strict');
const path = require('node:path');
const test = require('node:test');
const { createLedger } = require('./blog-source-ledger');
test('blog ledger accounts for every published post and freezes stale regenerations', () => {
  const ledger = createLedger(path.resolve(__dirname, '..'));
  assert.equal(ledger.length, 40);
  assert.equal(ledger.filter(row => row.source_status === 'source-confirmed').length, 22);
  assert.equal(ledger.filter(row => ['render-confirmed', 'frozen-required'].includes(row.regeneration_status)).length, 22);
  assert.equal(ledger.filter(row => row.source_status === 'legacy-frozen').length, 9);
  assert.equal(ledger.filter(row => row.source_status === 'blocked').length, 9);
});
