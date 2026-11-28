'use strict';

const path = require('node:path');
const crypto = require('node:crypto');
const test = require('node:test');
const assert = require('node:assert/strict');

const { createCandidatePlan, resolveCandidateOutput } = require('./candidate-site');
const { publicFiles } = require('./public-dist-manifest');
const { readFrozenPage } = require('../site/candidate/frozen-page-source');

const repoRoot = path.resolve(__dirname, '..');
const approvedFrozenPageHashes = Object.freeze({
  'index.html': 'd0006fb86819dd874dd00c255de2d86959d86ef7040d006855a66f2689bf74b6',
  'tools/blog/index.html': '3d39618c7633fba3e297bb9b11b447b39b3dfc7af239eba9c843f1dafddbd3c2'
});

function normalizedSha256(value) {
  return crypto
    .createHash('sha256')
    .update(value.replace(/\r\n?/g, '\n'), 'utf8')
    .digest('hex');
}

test('candidate output is restricted to the ignored build directory', () => {
  assert.throws(() => resolveCandidateOutput(repoRoot, 'dist'), /build[\\/]candidate-site/);
  assert.throws(() => resolveCandidateOutput(repoRoot, '../outside'), /build[\\/]candidate-site/);
  assert.match(resolveCandidateOutput(repoRoot, 'build/candidate-site/run-a'), /build[\\/]candidate-site[\\/]run-a$/);
});

test('candidate plan derives the exact public manifest route contract', () => {
  const plan = createCandidatePlan({ repoRoot, outputDir: 'build/candidate-site/run-a' });
  assert.deepEqual(plan.files, publicFiles(repoRoot));
  assert.equal(plan.htmlRoutes.length, plan.files.filter((file) => file.endsWith('.html')).length);
  assert.equal(plan.files.includes('tools/dashboard/index.html'), false);
  assert.equal(plan.files.includes('tools/product-collector/index.html'), false);
});

test('candidate plan has frozen Eleventy home/blog routes plus exact static islands', () => {
  const plan = createCandidatePlan({ repoRoot, outputDir: 'build/candidate-site/run-a' });
  assert.deepEqual(plan.frozenTemplates, ['index.html', 'tools/blog/index.html']);
  assert.equal(plan.passthrough.some(file => file === 'tools/service-agent/gen_index.js'), false);
  assert.equal(plan.passthrough.includes('tools/service-agent/index.html'), true);
});

test('frozen candidate route inputs retain their approved immutable hashes', () => {
  for (const [route, expectedHash] of Object.entries(approvedFrozenPageHashes)) {
    assert.equal(normalizedSha256(readFrozenPage(route)), expectedHash, route);
  }
});
