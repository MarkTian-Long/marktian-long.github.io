const fs = require('node:fs');
const path = require('node:path');

const { publicFiles, toPosix } = require('./public-dist-manifest');

const repoRoot = path.resolve(__dirname, '..');

function resolveOutputDir(value) {
  const outputDir = path.resolve(repoRoot, value);
  const relativePath = path.relative(repoRoot, outputDir);
  if (relativePath.startsWith('..') || path.isAbsolute(relativePath)) {
    throw new Error('Output directory must stay within the repository');
  }
  return outputDir;
}

function listFiles(rootDir, relativeDir = '') {
  const directory = path.join(rootDir, relativeDir);
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const relativePath = path.join(relativeDir, entry.name);
    return entry.isDirectory()
      ? listFiles(rootDir, relativePath)
      : [toPosix(relativePath)];
  });
}

function isLocalReference(value) {
  return value
    && !value.startsWith('#')
    && !value.startsWith('data:')
    && !value.startsWith('mailto:')
    && !value.startsWith('tel:')
    && !value.startsWith('javascript:')
    && !value.startsWith('%')
    && !value.startsWith('//')
    && !/^[a-z][a-z0-9+.-]*:/i.test(value)
    && !value.includes('${');
}

function resolveReference(fromFile, reference) {
  const pathname = reference.split(/[?#]/, 1)[0];
  if (!pathname || pathname.endsWith('/')) return null;
  const base = pathname.startsWith('/')
    ? pathname.slice(1)
    : path.posix.join(path.posix.dirname(fromFile), pathname);
  const normalized = path.posix.normalize(base);
  if (normalized.startsWith('../')) return null;
  return normalized;
}

function referencedPaths(relativePath, text, resolutionFrom = relativePath) {
  const extension = path.posix.extname(relativePath).toLowerCase();
  const patterns = extension === '.html'
    ? [/\b(?:href|src)=["']([^"']+)["']/gi, /\bfetch\(\s*["']([^"']+)["']/gi]
    : extension === '.css'
      ? [/\burl\(\s*["']?([^"')]+)["']?\s*\)/gi]
      : [/\bfetch\(\s*["']([^"']+)["']/gi];
  const paths = [];
  for (const pattern of patterns) {
    for (const match of text.matchAll(pattern)) {
      if (!isLocalReference(match[1])) continue;
      const resolved = resolveReference(resolutionFrom, match[1]);
      if (resolved) paths.push(resolved);
    }
  }
  return paths;
}

function checkPublicDist({ rootDir = repoRoot, outputDir = path.join(repoRoot, 'dist') } = {}) {
  const errors = [];
  if (!fs.existsSync(outputDir)) {
    return [`Missing public dist directory: ${outputDir}`];
  }
  const expected = publicFiles(rootDir);
  const actual = listFiles(outputDir).sort();
  const missing = expected.filter(file => !actual.includes(file));
  const unexpected = actual.filter(file => !expected.includes(file));
  missing.forEach(file => errors.push(`Missing public artifact: ${file}`));
  unexpected.forEach(file => errors.push(`Unexpected public artifact: ${file}`));

  const scriptDocuments = new Map();
  for (const htmlPath of actual.filter(file => file.endsWith('.html'))) {
    const html = fs.readFileSync(path.join(outputDir, htmlPath), 'utf8');
    for (const target of referencedPaths(htmlPath, html).filter(file => file.endsWith('.js'))) {
      if (!scriptDocuments.has(target)) scriptDocuments.set(target, []);
      scriptDocuments.get(target).push(htmlPath);
    }
  }

  for (const relativePath of actual.filter(file => /\.(?:html|css|js)$/i.test(file))) {
    const text = fs.readFileSync(path.join(outputDir, relativePath), 'utf8');
    const executionDocuments = relativePath.endsWith('.js')
      ? scriptDocuments.get(relativePath) || [relativePath]
      : [relativePath];
    for (const executionDocument of executionDocuments) {
      for (const target of referencedPaths(relativePath, text, executionDocument)) {
        if (!actual.includes(target)) {
          errors.push(`${relativePath} references missing artifact: ${target}`);
        }
      }
    }
  }
  return errors;
}

function outputDirFromArgs(args) {
  const index = args.indexOf('--out');
  if (index === -1) return path.join(repoRoot, 'dist');
  const value = args[index + 1];
  if (!value || args.length !== 2) {
    throw new Error('Usage: node scripts/check-public-dist.js [--out <directory>]');
  }
  return resolveOutputDir(value);
}

function main() {
  const errors = checkPublicDist({ outputDir: outputDirFromArgs(process.argv.slice(2)) });
  if (errors.length) {
    errors.forEach(error => console.error(`FAIL ${error}`));
    process.exitCode = 1;
    return;
  }
  console.log('Public dist smoke check passed.');
}

if (require.main === module) main();

module.exports = {
  checkPublicDist,
  isLocalReference,
  outputDirFromArgs,
  resolveOutputDir,
  referencedPaths,
  resolveReference,
};
