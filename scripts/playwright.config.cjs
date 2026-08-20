'use strict';

const path = require('node:path');

const repoRoot = path.resolve(__dirname, '..');
const outputRoot = path.join(repoRoot, 'build', 'architecture-equivalence');

module.exports = {
  testDir: path.join(__dirname, 'equivalence'),
  testMatch: 'a0-equivalence.spec.js',
  timeout: 120000,
  expect: { timeout: 10000 },
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [['line'], ['json', { outputFile: path.join(outputRoot, 'report', 'playwright-results.json') }]],
  outputDir: path.join(outputRoot, 'test-results'),
  use: {
    browserName: 'chromium',
    locale: 'zh-CN',
    timezoneId: 'Asia/Shanghai',
    colorScheme: 'light',
    reducedMotion: 'reduce',
    deviceScaleFactor: 1,
    serviceWorkers: 'block',
    trace: 'retain-on-failure',
  },
};
