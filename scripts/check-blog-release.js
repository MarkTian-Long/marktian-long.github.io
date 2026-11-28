'use strict';
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const SOURCE_TESTS = Object.freeze([
  'blog-image-assets.test.js',
  'blog-image-contract.test.js',
  'blog-markdown-contract.test.js',
  'blog-metadata-sync.test.js',
  'blog-preview-build.test.js',
  'check-blog-release.test.js',
]);
const RELEASE_TESTS = Object.freeze([
  ...SOURCE_TESTS,
  'blog-body-integrity.test.js',
  'blog-flow-arrows.test.js',
  'blog-image-rendering.test.js',
  'blog-publish-handoff.test.js',
  'blog-publish-orchestrator.test.js',
  'blog-reference-presentation.test.js',
  'blog-relationships.test.js',
  'blog-release-equivalence.test.js',
  'blog-share-card.test.js',
  'blog-share-card-wrapping.test.js',
  'blog-source-ledger.test.js',
  'blog-summary-contract.test.js',
  'blog-svg-assets.test.js',
  'publish-blog-workflow.test.js',
  'public-dist.test.js',
  'search-foundation.test.js',
]);

function parseArgs(argv) {
  let mode = null;
  let baseRef;
  for (let index = 0; index < argv.length; index += 1) {
    const flag = argv[index];
    if (flag === '--source' || flag === '--release') {
      if (mode) throw new Error('Choose exactly one verification mode: --source or --release');
      mode = flag === '--source' ? 'source' : 'release';
      continue;
    }
    if (flag === '--base-ref') {
      if (baseRef || !/^[a-f0-9]{40}$/i.test(argv[index + 1] || '')) {
        throw new Error('--base-ref requires one complete 40-character commit SHA');
      }
      baseRef = argv[index + 1].toLowerCase();
      index += 1;
      continue;
    }
    throw new Error('Usage: node scripts/check-blog-release.js --source|--release [--base-ref <40-char-commit>]');
  }
  if (!mode) throw new Error('Usage: node scripts/check-blog-release.js --source|--release [--base-ref <40-char-commit>]');
  if (baseRef && mode !== 'release') throw new Error('--base-ref is available only with --release');
  return { mode, baseRef };
}

function draftSourcePaths(rootDir) {
  const draftsDir = path.join(rootDir, 'drafts', 'blog');
  if (!fs.existsSync(draftsDir)) return [];
  const entries = fs.readdirSync(draftsDir, { withFileTypes: true });
  const markdownEntries = entries.filter(entry => entry.name.endsWith('.md'));
  for (const entry of markdownEntries) {
    if (!entry.isFile() || !/^[a-z0-9]+(?:-[a-z0-9]+)*\.md$/.test(entry.name)) {
      throw new Error('Draft Markdown must be a regular kebab-case file: ' + entry.name);
    }
  }
  return markdownEntries.map(entry => 'drafts/blog/' + entry.name).sort();
}

function runNode(rootDir, label, args) {
  process.stdout.write('\n== ' + label + ' ==\n');
  const result = spawnSync(process.execPath, args, { cwd: rootDir, stdio: 'inherit' });
  if (result.error) {
    console.error(result.error.message);
    return false;
  }
  if (result.status !== 0) {
    console.error(label + ' failed with exit code ' + result.status);
    return false;
  }
  return true;
}

function checksForMode(mode, { baseRef } = {}) {
  const sourceTests = ['--test', ...SOURCE_TESTS.map(file => path.posix.join('scripts', file))];
  if (mode === 'source') {
    return [
      ['Blog taxonomy and source sync', ['tools/blog/check-blog-taxonomy.js']],
      ['Blog image assets', ['scripts/check-blog-images.js']],
      ['Focused blog source tests', sourceTests],
    ];
  }
  if (mode !== 'release') throw new Error('Unknown blog verification mode: ' + mode);
  const releaseTests = ['--test', ...RELEASE_TESTS.map(file => path.posix.join('scripts', file))];
  const bodyIntegrityArgs = ['scripts/check-blog-body-integrity.js'];
  if (baseRef) bodyIntegrityArgs.push('--base-ref', baseRef);
  return [
    ['Blog taxonomy and source sync', ['tools/blog/check-blog-taxonomy.js']],
    ['Blog image assets', ['scripts/check-blog-images.js']],
    ['Search asset freshness', ['scripts/generate-search-assets.js', '--check']],
    ['Search foundation', ['scripts/check-search-foundation.js']],
    ['Continue Reading shells', ['scripts/migrate-blog-continue-reading.js', '--check']],
    ['Featured blog posts', ['scripts/check-featured-posts.js']],
    ['Historical article body integrity', bodyIntegrityArgs],
    ['Repository policy', ['scripts/check-repository-policy.js']],
    ['Blog release tests', releaseTests],
  ];
}

function runDraftOpeningImageChecks(rootDir) {
  const sources = draftSourcePaths(rootDir);
  if (!sources.length) {
    console.log('\nNo current draft Markdown; opening-image checks are not applicable.');
    return true;
  }
  let success = true;
  for (const sourcePath of sources) {
    success = runNode(rootDir, 'Opening image: ' + sourcePath, [
      'scripts/check-blog-opening-image.js', '--source', sourcePath,
    ]) && success;
  }
  return success;
}

function runChecks(mode, rootDir = path.resolve(__dirname, '..'), options = {}) {
  let success = true;
  for (const [label, args] of checksForMode(mode, options)) {
    success = runNode(rootDir, label, args) && success;
  }
  if (mode === 'source') success = runDraftOpeningImageChecks(rootDir) && success;
  return success;
}

function main(argv = process.argv.slice(2), rootDir = path.resolve(__dirname, '..')) {
  const { mode, baseRef } = parseArgs(argv);
  console.log('Blog verification mode: ' + mode);
  const success = runChecks(mode, rootDir, { baseRef });
  if (success) console.log('\nPASS blog ' + mode + ' checks');
  else console.error('\nFAIL blog ' + mode + ' checks');
  return success ? 0 : 1;
}

if (require.main === module) {
  try {
    process.exitCode = main();
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
module.exports = { RELEASE_TESTS, SOURCE_TESTS, checksForMode, draftSourcePaths, main, parseArgs, runChecks };
