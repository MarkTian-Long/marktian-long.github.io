const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const scriptsDir = __dirname;
const repoRoot = path.resolve(scriptsDir, '..');
const node = process.execPath;

function run(label, command, args, cwd = scriptsDir) {
  process.stdout.write(`\n== ${label} ==\n`);
  try {
    execFileSync(command, args, { cwd, stdio: 'inherit' });
    return true;
  } catch {
    process.stderr.write(`FAILED: ${label}\n`);
    return false;
  }
}

function trackedFiles(pattern) {
  return execFileSync('git', ['ls-files', pattern], {
    cwd: repoRoot,
    encoding: 'utf8',
  }).split(/\r?\n/).filter(Boolean);
}

function checkJson() {
  const failures = [];
  for (const file of trackedFiles('*.json')) {
    try {
      JSON.parse(fs.readFileSync(path.join(repoRoot, file), 'utf8'));
    } catch (error) {
      failures.push(`${file}: ${error.message}`);
    }
  }
  if (failures.length) {
    process.stderr.write(`${failures.join('\n')}\n`);
    return false;
  }
  process.stdout.write(`Parsed ${trackedFiles('*.json').length} tracked JSON file(s).\n`);
  return true;
}

function main() {
  const checks = [
    ['Node tests', node, ['--test'], scriptsDir],
    ['Repository policy', node, ['check-repository-policy.js'], scriptsDir],
    ['Search foundation', node, ['check-search-foundation.js'], scriptsDir],
    ['Blog image assets', node, ['check-blog-images.js'], scriptsDir],
    ['Static client safety report', node, ['check-static-client-secrets.js'], scriptsDir],
    ['Portfolio evidence', node, ['check-portfolio-evidence.js'], scriptsDir],
    ['Generator contracts report', node, ['check-generator-contracts.js'], scriptsDir],
    ['Share-card QR vendor', node, ['sync-share-card-vendor.js', '--check'], scriptsDir],
  ];
  let success = true;
  for (const [label, command, args, cwd] of checks) {
    success = run(label, command, args, cwd) && success;
  }
  for (const file of trackedFiles('*.js')) {
    success = run(`JavaScript syntax: ${file}`, node, ['--check', file], repoRoot) && success;
  }
  process.stdout.write('\n== Tracked JSON parse ==\n');
  success = checkJson() && success;
  if (!success) process.exitCode = 1;
}

main();
