'use strict';

const childProcess = require('node:child_process');
const path = require('node:path');
const { buildCandidate } = require('./build-candidate-site');

const repoRoot = path.resolve(__dirname, '..');
const outputDir = path.join('build', 'candidate-site', `equivalence-${process.pid}-${Date.now()}`);

try {
  buildCandidate({ outputDir });
  const playwrightCli = require.resolve('@playwright/test/cli');
  childProcess.execFileSync(process.execPath, [playwrightCli, 'test', '--config=playwright.config.cjs'], {
    cwd: __dirname,
    env: { ...process.env, CANDIDATE_ROOT: outputDir },
    stdio: 'inherit',
  });
  console.log(`Candidate equivalence passed: ${outputDir}`);
} catch (error) {
  console.error(`Candidate equivalence failed: ${error.message}`);
  process.exitCode = 1;
}
