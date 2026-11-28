'use strict';
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const { publicFiles } = require('./public-dist-manifest');
const { collectPostImagePaths } = require('./blog-image-contract');

const PUBLIC_BUILD_FILES = new Set(['scripts/build-public-dist.js', 'scripts/public-dist-manifest.js']);
const BLOG_RELEASE_GENERATED_FILES = new Set(['tools/blog/index.html', 'sitemap.xml', 'feed.xml']);

function runGit(args, rootDir) {
  return execFileSync('git', args, { cwd: rootDir, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
}
function parseStaticPublicFiles(source) {
  const match = source.match(/const PUBLIC_FILES = \[([\s\S]*?)\n\];/);
  if (!match) throw new Error('Could not parse PUBLIC_FILES from public-dist-manifest.js');
  return [...match[1].matchAll(/'([^']+)'/g)].map(item => item[1]);
}
function readBasePublicFiles(baseRef, rootDir) {
  const manifestSource = runGit(['show', baseRef + ':scripts/public-dist-manifest.js'], rootDir);
  const metadata = JSON.parse(runGit(['show', baseRef + ':tools/blog/data/posts-meta.json'], rootDir));
  const postFiles = runGit(['ls-tree', '-r', '--name-only', baseRef, '--', 'tools/blog/posts'], rootDir)
    .split(/\r?\n/).filter(Boolean);
  return new Set([...parseStaticPublicFiles(manifestSource), ...collectPostImagePaths(metadata.posts || []), ...postFiles]);
}
function isFullCheckPath(filePath) {
  return filePath.startsWith('scripts/') || filePath.startsWith('.github/workflows/')
    || filePath.startsWith('.agents/') || filePath.startsWith('.claude/') || filePath.startsWith('site/')
    || filePath === 'AGENTS.md' || filePath === 'CLAUDE.md' || filePath === 'CONVENTIONS.md'
    || filePath === '.gitignore' || filePath === 'skills-lock.json' || filePath === 'eleventy.candidate.cjs'
    || filePath === 'tools/blog/data/blog-taxonomy.json' || /^tools\/blog\/[^/]+\.(?:js|html|css)$/.test(filePath);
}
function isBlogReleaseCorePath(filePath) {
  return filePath.startsWith('drafts/blog/') || filePath.startsWith('docs/blog/')
    || filePath.startsWith('assets/images/blog/') || filePath.startsWith('tools/blog/posts/')
    || filePath.startsWith('tools/blog/previews/') || filePath === 'tools/blog/data/blog-taxonomy.json'
    || filePath === 'tools/blog/data/posts-meta.json' || filePath === 'tools/blog/data/featured-posts.json';
}
function isBlogGeneratedPath(filePath) { return BLOG_RELEASE_GENERATED_FILES.has(filePath); }
function isBlogReleasePath(filePath) { return isBlogReleaseCorePath(filePath) || isBlogGeneratedPath(filePath); }
function classifyChanges({ changedFiles, currentPublicFiles, basePublicFiles }) {
  const publicSet = new Set([...currentPublicFiles, ...basePublicFiles]);
  const normalized = changedFiles.map(file => file.replace(/\\/g, '/'));
  const publicChanged = normalized.some(file => publicSet.has(file) || PUBLIC_BUILD_FILES.has(file));
  const blogCoreChanged = normalized.some(isBlogReleaseCorePath);
  const blogReleaseChanged = blogCoreChanged || normalized.some(isBlogGeneratedPath);
  const nonBlogPublicChanged = normalized.some(file => (publicSet.has(file) || PUBLIC_BUILD_FILES.has(file)) && !isBlogReleasePath(file));
  const fullCheck = normalized.some(isFullCheckPath) || (publicChanged && (!blogCoreChanged || nonBlogPublicChanged));
  return { publicChanged, fullCheck, blogReleaseChanged };
}
function parseArgs(argv) {
  const values = new Map();
  for (let index = 0; index < argv.length; index += 2) {
    const flag = argv[index], value = argv[index + 1];
    if (!['--base', '--head', '--root'].includes(flag)) throw new Error('Unknown argument: ' + flag);
    if (!value || value.startsWith('--')) throw new Error('Argument ' + flag + ' requires a value');
    if (values.has(flag)) throw new Error('Duplicate argument: ' + flag);
    values.set(flag, value);
  }
  if (!values.has('--base') || !values.has('--head')) throw new Error('Usage: node scripts/classify-public-changes.js --base <sha> --head <sha> [--root <path>]');
  return { base: values.get('--base'), head: values.get('--head'), rootDir: path.resolve(values.get('--root') || path.join(__dirname, '..')) };
}
function main(argv = process.argv.slice(2)) {
  const args = parseArgs(argv);
  if (/^0+$/.test(args.base)) {
    const result = { publicChanged: true, fullCheck: true, blogReleaseChanged: true, changedFiles: ['<initial-push>'] };
    writeOutputs(result);
    return result;
  }
  const changedFiles = runGit(['diff', '--name-only', '-z', args.base, args.head, '--'], args.rootDir).split('\0').filter(Boolean);
  const result = {
    ...classifyChanges({ changedFiles, currentPublicFiles: publicFiles(args.rootDir), basePublicFiles: [...readBasePublicFiles(args.base, args.rootDir)] }),
    changedFiles,
  };
  writeOutputs(result);
  return result;
}
function writeOutputs(result) {
  const output = [
    'public_changed=' + String(result.publicChanged),
    'full_check=' + String(result.fullCheck),
    'blog_release_changed=' + String(result.blogReleaseChanged),
  ].join('\n') + '\n';
  if (process.env.GITHUB_OUTPUT) fs.appendFileSync(process.env.GITHUB_OUTPUT, output, 'utf8');
  console.log(JSON.stringify(result, null, 2));
}
if (require.main === module) {
  try { main(); } catch (error) { console.error(error.message); process.exitCode = 1; }
}
module.exports = { classifyChanges, isBlogGeneratedPath, isBlogReleaseCorePath, isBlogReleasePath, isFullCheckPath, parseStaticPublicFiles, readBasePublicFiles };
