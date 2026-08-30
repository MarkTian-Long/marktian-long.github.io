const fs = require('node:fs');
const path = require('node:path');

const { publicFiles, resolvePublicPath, validateManifest } = require('./public-dist-manifest');

const repoRoot = path.resolve(__dirname, '..');

function resolveOutputDir(value) {
  const outputDir = path.resolve(repoRoot, value);
  const relativePath = path.relative(repoRoot, outputDir);
  if (relativePath.startsWith('..') || path.isAbsolute(relativePath)) {
    throw new Error('Output directory must stay within the repository');
  }
  return outputDir;
}

function outputDirFromArgs(args) {
  const index = args.indexOf('--out');
  if (index === -1) return path.join(repoRoot, 'dist');
  const value = args[index + 1];
  if (!value || args.length !== 2) {
    throw new Error('Usage: node scripts/build-public-dist.js [--out <empty-directory>]');
  }
  return resolveOutputDir(value);
}

function assertEmptyOutput(outputDir) {
  if (!fs.existsSync(outputDir)) return;
  if (!fs.statSync(outputDir).isDirectory()) {
    throw new Error(`Output path is not a directory: ${outputDir}`);
  }
  if (fs.readdirSync(outputDir).length > 0) {
    throw new Error(`Refusing to overwrite non-empty output directory: ${outputDir}`);
  }
}

function buildPublicDist({ rootDir = repoRoot, outputDir = path.join(repoRoot, 'dist') } = {}) {
  const files = publicFiles(rootDir);
  const errors = validateManifest(rootDir, files);
  if (errors.length) throw new Error(errors.join('\n'));
  assertEmptyOutput(outputDir);
  fs.mkdirSync(outputDir, { recursive: true });

  for (const relativePath of files) {
    const sourcePath = resolvePublicPath(rootDir, relativePath);
    const targetPath = resolvePublicPath(outputDir, relativePath);
    fs.mkdirSync(path.dirname(targetPath), { recursive: true });
    fs.copyFileSync(sourcePath, targetPath);
  }
  return files;
}

function main() {
  const outputDir = outputDirFromArgs(process.argv.slice(2));
  const files = buildPublicDist({ outputDir });
  console.log(`Public dist built: ${files.length} file(s) -> ${path.relative(repoRoot, outputDir) || '.'}`);
}

if (require.main === module) {
  try {
    main();
  } catch (error) {
    console.error(`Public dist build failed: ${error.message}`);
    process.exitCode = 1;
  }
}

module.exports = {
  assertEmptyOutput,
  buildPublicDist,
  outputDirFromArgs,
  resolveOutputDir,
};
