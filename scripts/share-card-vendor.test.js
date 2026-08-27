const test = require('node:test');
const assert = require('node:assert/strict');

const { isCurrent, parseArgs, targetRelativePath } = require('./sync-share-card-vendor');

test('checked-in QR vendor is synchronized with the pinned package source', () => {
  assert.equal(targetRelativePath, 'tools/blog/vendor/qrcode-generator.js');
  assert.equal(isCurrent(), true);
});

test('QR vendor sync accepts only explicit safe modes', () => {
  assert.equal(parseArgs([]), 'preview');
  assert.equal(parseArgs(['--check']), 'check');
  assert.equal(parseArgs(['--write']), 'write');
  assert.throws(() => parseArgs(['--write', '--check']), /Usage/);
});
