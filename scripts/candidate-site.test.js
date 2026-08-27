'use strict';

const path = require('node:path');
const fs = require('node:fs');
const test = require('node:test');
const assert = require('node:assert/strict');

const { createCandidatePlan, resolveCandidateOutput } = require('./candidate-site');
const { publicFiles } = require('./public-dist-manifest');
const { readFrozenPage } = require('../site/candidate/frozen-page-source');

const repoRoot = path.resolve(__dirname, '..');

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

test('frozen candidate route inputs exactly match the approved public source snapshot', () => {
  for (const route of ['index.html', 'tools/blog/index.html']) {
    const normalizeNewlines = value => value.replace(/\r\n/g, '\n');
    assert.equal(normalizeNewlines(readFrozenPage(route)), normalizeNewlines(fs.readFileSync(path.join(repoRoot, route), 'utf8')), route);
  }
});
