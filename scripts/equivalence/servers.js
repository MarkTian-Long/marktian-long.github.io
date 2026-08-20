'use strict';

const crypto = require('node:crypto');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const { execFileSync, spawn } = require('node:child_process');

const { publicFiles } = require('../public-dist-manifest');
const {
  APPROVED_BASELINE_SHA,
  EXPECTED_HTML_ROUTE_COUNT,
  EXPECTED_PUBLIC_FILE_COUNT,
} = require('./site-matrix');

const MIME_TYPES = Object.freeze({
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
});
const BLOCKED_BROWSER_PORTS = new Set([
  1, 7, 9, 11, 13, 15, 17, 19, 20, 21, 22, 23, 25, 37, 42, 43, 53, 69, 77, 79, 87, 95,
  101, 102, 103, 104, 109, 110, 111, 113, 115, 117, 119, 123, 135, 137, 139, 143, 161, 179,
  389, 427, 465, 512, 513, 514, 515, 526, 530, 531, 532, 540, 548, 554, 556, 563, 587, 601,
  636, 989, 990, 993, 995, 1719, 1720, 1723, 2049, 3659, 4045, 4190, 5060, 5061, 6000,
  6566, 6665, 6666, 6667, 6668, 6669, 6697, 10080,
]);

function sha256(buffer) {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

function assertWithin(parent, target) {
  const relative = path.relative(parent, target);
  if (!relative || relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error(`Path must be a child of ${parent}: ${target}`);
  }
}

function writeSnapshotFile(rootDir, relativePath, content) {
  const target = path.resolve(rootDir, relativePath);
  assertWithin(rootDir, target);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, content);
}

function listFiles(rootDir, relativeDir = '') {
  return fs.readdirSync(path.join(rootDir, relativeDir), { withFileTypes: true }).flatMap(entry => {
    const relativePath = path.join(relativeDir, entry.name);
    return entry.isDirectory()
      ? listFiles(rootDir, relativePath)
      : [relativePath.split(path.sep).join('/')];
  }).sort();
}

function prepareSnapshots({ repoRoot, outputRoot, baselineSha = APPROVED_BASELINE_SHA }) {
  const files = publicFiles(repoRoot);
  const htmlCount = files.filter(file => file.endsWith('.html')).length;
  if (files.length !== EXPECTED_PUBLIC_FILE_COUNT || htmlCount !== EXPECTED_HTML_ROUTE_COUNT) {
    throw new Error(`Public contract drifted: ${files.length} files / ${htmlCount} HTML routes`);
  }

  const baselineRoot = path.join(outputRoot, 'baseline');
  const currentRoot = path.join(outputRoot, 'current');
  assertWithin(repoRoot, outputRoot);
  fs.mkdirSync(baselineRoot, { recursive: true });
  fs.mkdirSync(currentRoot, { recursive: true });

  const manifest = [];
  for (const relativePath of files) {
    const baseline = execFileSync('git', [
      'cat-file', '--filters', `--path=${relativePath}`, `${baselineSha}:${relativePath}`,
    ], {
      cwd: repoRoot,
      encoding: 'buffer',
      maxBuffer: 20 * 1024 * 1024,
      windowsHide: true,
    });
    const current = fs.readFileSync(path.join(repoRoot, relativePath));
    writeSnapshotFile(baselineRoot, relativePath, baseline);
    writeSnapshotFile(currentRoot, relativePath, current);
    manifest.push({
      path: relativePath,
      baselineSha256: sha256(baseline),
      currentSha256: sha256(current),
      size: current.length,
    });
  }

  for (const [label, root] of [['baseline', baselineRoot], ['current', currentRoot]]) {
    const actual = listFiles(root);
    const extras = actual.filter(file => !files.includes(file));
    const missing = files.filter(file => !actual.includes(file));
    if (extras.length || missing.length) {
      throw new Error(`${label} snapshot mismatch: extras=${extras.join(',')} missing=${missing.join(',')}`);
    }
  }

  return {
    baselineRoot,
    currentRoot,
    files,
    htmlCount,
    manifest,
    mismatches: manifest.filter(item => item.baselineSha256 !== item.currentSha256),
  };
}

function normalizeRequestPath(urlPath) {
  let pathname = decodeURIComponent(urlPath.split('?', 1)[0]);
  if (pathname === '/repo-name' || pathname === '/repo-name/') pathname = '/';
  else if (pathname.startsWith('/repo-name/')) pathname = pathname.slice('/repo-name'.length);
  if (pathname === '/' || pathname.endsWith('/')) pathname += 'index.html';
  return pathname.replace(/^\/+/, '');
}

function createStaticServer({ rootDir, label }) {
  const resolvedRoot = path.resolve(rootDir);
  return http.createServer((request, response) => {
    try {
      const relativePath = normalizeRequestPath(request.url || '/');
      const target = path.resolve(resolvedRoot, relativePath);
      assertWithin(resolvedRoot, target);
      if (!fs.existsSync(target) || !fs.statSync(target).isFile()) {
        response.writeHead(404, { 'content-type': 'text/plain; charset=utf-8', 'x-a0-label': label });
        response.end('Not found');
        return;
      }
      const content = fs.readFileSync(target);
      response.writeHead(200, {
        'cache-control': 'no-store',
        'content-length': content.length,
        'content-type': MIME_TYPES[path.extname(target).toLowerCase()] || 'application/octet-stream',
        'x-a0-label': label,
      });
      response.end(content);
    } catch (error) {
      response.writeHead(400, { 'content-type': 'text/plain; charset=utf-8', 'x-a0-label': label });
      response.end(`Bad request: ${error.message}`);
    }
  });
}

function runServerProcess({ rootDir, label }) {
  const server = createStaticServer({ rootDir, label });
  const listen = () => server.listen(0, '127.0.0.1', () => {
    const address = server.address();
    if (BLOCKED_BROWSER_PORTS.has(address.port)) {
      server.close(listen);
      return;
    }
    process.stdout.write(`${JSON.stringify({ ready: true, label, pid: process.pid, port: address.port })}\n`);
  });
  listen();
  const close = () => server.close(() => process.exit(0));
  process.on('SIGINT', close);
  process.on('SIGTERM', close);
}

function startServerProcess(rootDir, label) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [__filename, '--serve', '--root', rootDir, '--label', label], {
      cwd: path.dirname(__dirname),
      stdio: ['ignore', 'pipe', 'pipe'],
      windowsHide: true,
    });
    let stdout = '';
    let stderr = '';
    const timer = setTimeout(() => reject(new Error(`${label} server startup timed out: ${stderr}`)), 10000);
    child.stderr.on('data', chunk => { stderr += chunk; });
    child.stdout.on('data', chunk => {
      stdout += chunk;
      const newline = stdout.indexOf('\n');
      if (newline === -1) return;
      try {
        const ready = JSON.parse(stdout.slice(0, newline));
        clearTimeout(timer);
        resolve({ ...ready, child, rootDir, url: `http://127.0.0.1:${ready.port}` });
      } catch (error) {
        clearTimeout(timer);
        reject(new Error(`${label} server emitted invalid startup data: ${error.message}`));
      }
    });
    child.once('exit', code => {
      if (code && !stdout.includes('"ready":true')) {
        clearTimeout(timer);
        reject(new Error(`${label} server exited ${code}: ${stderr}`));
      }
    });
  });
}

async function startIndependentServers(snapshot) {
  const baseline = await startServerProcess(snapshot.baselineRoot, 'baseline');
  const current = await startServerProcess(snapshot.currentRoot, 'current');
  if (baseline.pid === current.pid || baseline.port === current.port || baseline.rootDir === current.rootDir) {
    await stopIndependentServers({ baseline, current });
    throw new Error('baseline/current servers are not independent');
  }
  return { baseline, current };
}

async function stopIndependentServers(servers) {
  await Promise.all(Object.values(servers || {}).map(server => new Promise(resolve => {
    if (!server?.child || server.child.killed || server.child.exitCode !== null) return resolve();
    server.child.once('exit', resolve);
    server.child.kill('SIGTERM');
    setTimeout(() => resolve(), 3000).unref();
  })));
}

function argumentValue(name) {
  const index = process.argv.indexOf(name);
  return index === -1 ? null : process.argv[index + 1];
}

if (require.main === module && process.argv.includes('--serve')) {
  runServerProcess({ rootDir: argumentValue('--root'), label: argumentValue('--label') });
}

module.exports = {
  BLOCKED_BROWSER_PORTS,
  MIME_TYPES,
  createStaticServer,
  listFiles,
  normalizeRequestPath,
  prepareSnapshots,
  sha256,
  startIndependentServers,
  stopIndependentServers,
};
