'use strict';

const childProcess = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const { assertEmptyOutput, copyExactPassthrough, createCandidatePlan } = require('./candidate-site');

const repoRoot = path.resolve(__dirname, '..');

function parseArgs(args) {
  if (!args.length) return 'build/candidate-site/current';
  if (args.length === 2 && args[0] === '--out') return args[1];
  throw new Error('Usage: node scripts/build-candidate-site.js [--out build/candidate-site/<name>]');
}

function buildCandidate({ outputDir = parseArgs(process.argv.slice(2)) } = {}) {
  const plan = createCandidatePlan({ repoRoot, outputDir });
  assertEmptyOutput(plan.outputDir);
  fs.mkdirSync(plan.outputDir, { recursive: true });
  childProcess.execFileSync(process.execPath, [
    path.join(__dirname, 'node_modules', '@11ty', 'eleventy', 'cmd.cjs'),
    '--config', path.join(repoRoot, 'eleventy.candidate.cjs'),
    '--output', plan.outputDir,
  ], { cwd: repoRoot, env: { ...process.env, CANDIDATE_REPO_ROOT: repoRoot }, stdio: 'inherit' });
  copyExactPassthrough({ repoRoot, plan });
  return plan;
}

if (require.main === module) {
  try {
    const plan = buildCandidate();
    console.log(`Candidate built: ${plan.files.length} file(s) -> ${path.relative(repoRoot, plan.outputDir)}`);
  } catch (error) {
    console.error(`Candidate build failed: ${error.message}`);
    process.exitCode = 1;
  }
}

module.exports = { buildCandidate, parseArgs };
