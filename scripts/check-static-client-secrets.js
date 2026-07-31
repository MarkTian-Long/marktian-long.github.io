const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const repoRoot = path.resolve(__dirname, '..');
const PUBLIC_STATIC = /^(?:index\.html|assets\/.*\.(?:js|html|json)|tools\/.*\.(?:html|js|json)|robots\.txt|sitemap\.xml|feed\.xml)$/i;
const WORKFLOW = /^\.github\/workflows\/.*\.(?:ya?ml)$/i;
const CONFIG_LOCAL = /(?:^|\/)config\.local\.js$/i;

function trackedFiles() {
  return execFileSync('git', ['ls-files'], {
    cwd: repoRoot,
    encoding: 'utf8',
  }).split(/\r?\n/).filter(Boolean);
}

function isScanTarget(filePath) {
  return !CONFIG_LOCAL.test(filePath) && (PUBLIC_STATIC.test(filePath) || WORKFLOW.test(filePath));
}

function lineNumber(text, index) {
  return text.slice(0, index).split(/\r?\n/).length;
}

function finding(file, line, rule, recommendation) {
  return { file, line, rule, recommendation };
}

function scanText(file, text) {
  const findings = [];
  const patterns = [
    {
      rule: 'workflow-secret-injection',
      regex: /\$\{\{\s*secrets\.[A-Za-z0-9_]+\s*\}\}/g,
      recommendation: 'Track B: move secret-dependent behavior behind a server-side boundary; do not inject secrets into static assets.',
    },
    {
      rule: 'high-risk-innerHTML',
      regex: /\.innerHTML\s*(?:\+?=)/g,
      recommendation: 'Trace the value to its source; prefer textContent or DOM APIs, and sanitize only with a reviewed allowlist when HTML is required.',
    },
    {
      rule: 'high-risk-public-claim',
      regex: /(?:真实(?:项目|数据|案例|结果|客户|生产)|准确率|提升\s*(?:[≥≤<>]?\s*\d|[零一二三四五六七八九十]+倍)|生产级|production[- ]grade|accuracy|improved?\s+by\s+\d)/gi,
      recommendation: 'Add evidence metadata: metric type, definition, source, as-of date, and an explicit mock boundary where applicable.',
    },
  ];
  for (const { rule, regex, recommendation } of patterns) {
    for (const match of text.matchAll(regex)) {
      findings.push(finding(file, lineNumber(text, match.index), rule, recommendation));
    }
  }
  return findings;
}

function scanFiles(root, files) {
  const findings = [];
  for (const file of files) {
    if (!isScanTarget(file)) continue;
    const absolute = path.join(root, file);
    const text = fs.readFileSync(absolute, 'utf8');
    findings.push(...scanText(file, text));
  }
  return findings;
}

function report(findings) {
  if (!findings.length) {
    console.log('Static client safety report: no findings.');
    return;
  }
  console.log(`Static client safety report: ${findings.length} finding(s), report-only.`);
  for (const item of findings) {
    console.log(`[REPORT] ${item.rule} ${item.file}:${item.line} — ${item.recommendation}`);
  }
}

function main() {
  report(scanFiles(repoRoot, trackedFiles()));
}

if (require.main === module) main();

module.exports = { isScanTarget, scanFiles, scanText };
