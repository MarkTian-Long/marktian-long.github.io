'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { publicFiles } = require('./public-dist-manifest');

const CANDIDATE_ROOT = path.join('build', 'candidate-site');
// These two routes pass through Eleventy templates. Their published HTML is a
// deliberately frozen source until a separately reviewed semantic migration can
// reproduce it byte-for-byte; all remaining public files are exact islands.
const FROZEN_TEMPLATE_ROUTES = Object.freeze(['index.html', 'tools/blog/index.html']);

function assertWithin(parent, target) {
  const relative = path.relative(parent, target);
  if (!relative || relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error(`Candidate output must stay within ${CANDIDATE_ROOT}`);
  }
}

function resolveCandidateOutput(repoRoot, value = CANDIDATE_ROOT) {
  const root = path.resolve(repoRoot, CANDIDATE_ROOT);
  const output = path.resolve(repoRoot, value);
  assertWithin(root, output);
  return output;
}

function createCandidatePlan({ repoRoot, outputDir = CANDIDATE_ROOT }) {
  const files = publicFiles(repoRoot);
  return Object.freeze({
    outputDir: resolveCandidateOutput(repoRoot, outputDir),
    files: Object.freeze(files),
    htmlRoutes: Object.freeze(files.filter(file => file.endsWith('.html')).map(file => `/${file}`)),
    frozenTemplates: FROZEN_TEMPLATE_ROUTES,
    passthrough: Object.freeze(files.filter(file => !FROZEN_TEMPLATE_ROUTES.includes(file))),
  });
}

function assertEmptyOutput(outputDir) {
  if (!fs.existsSync(outputDir)) return;
  if (!fs.statSync(outputDir).isDirectory() || fs.readdirSync(outputDir).length) {
    throw new Error(`Candidate output must be an empty directory: ${outputDir}`);
  }
}

function copyExactPassthrough({ repoRoot, plan }) {
  for (const relativePath of plan.passthrough) {
    const target = path.join(plan.outputDir, relativePath);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.copyFileSync(path.join(repoRoot, relativePath), target);
  }
}

module.exports = { CANDIDATE_ROOT, FROZEN_TEMPLATE_ROUTES, assertEmptyOutput, copyExactPassthrough, createCandidatePlan, resolveCandidateOutput };
