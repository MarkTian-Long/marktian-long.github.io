const fs = require('node:fs');
const path = require('node:path');

const repoRoot = path.resolve(__dirname, '..');
const defaultSourcePath = path.join(__dirname, 'node_modules', 'qrcode-generator', 'qrcode.js');
const targetRelativePath = 'tools/blog/vendor/qrcode-generator.js';

function readVendorSource(sourcePath = defaultSourcePath) {
  if (!fs.existsSync(sourcePath)) {
    throw new Error('Missing qrcode-generator source. Run npm install in scripts first.');
  }
  return fs.readFileSync(sourcePath, 'utf8');
}

function targetPath(rootDir = repoRoot) {
  return path.join(rootDir, targetRelativePath);
}

function isCurrent(rootDir = repoRoot, sourcePath = defaultSourcePath) {
  const target = targetPath(rootDir);
  return fs.existsSync(target) && fs.readFileSync(target, 'utf8') === readVendorSource(sourcePath);
}

function parseArgs(args) {
  if (!args.length) return 'preview';
  if (args.length === 1 && args[0] === '--write') return 'write';
  if (args.length === 1 && args[0] === '--check') return 'check';
  throw new Error('Usage: node scripts/sync-share-card-vendor.js [--write|--check]');
}

function main(args = process.argv.slice(2), options = {}) {
  const mode = parseArgs(args);
  const rootDir = options.rootDir || repoRoot;
  const sourcePath = options.sourcePath || defaultSourcePath;
  const current = isCurrent(rootDir, sourcePath);

  if (mode === 'write') {
    if (!current) {
      const target = targetPath(rootDir);
      fs.mkdirSync(path.dirname(target), { recursive: true });
      fs.writeFileSync(target, readVendorSource(sourcePath), 'utf8');
      console.log(`WROTE ${targetRelativePath}`);
    } else {
      console.log(`PASS ${targetRelativePath}`);
    }
    return 0;
  }

  if (current) {
    console.log(`PASS ${targetRelativePath}`);
    return 0;
  }

  if (mode === 'preview') {
    console.log(`WOULD WRITE ${targetRelativePath}`);
    return 0;
  }

  console.error(`STALE ${targetRelativePath}`);
  return 1;
}

if (require.main === module) {
  try {
    process.exitCode = main();
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}

module.exports = {
  defaultSourcePath,
  isCurrent,
  main,
  parseArgs,
  readVendorSource,
  targetPath,
  targetRelativePath
};
