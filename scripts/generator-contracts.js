const fs = require('node:fs');
const path = require('node:path');

const repoRoot = path.resolve(__dirname, '..');

function analyzeGeneratorSources(sources) {
  const findings = [];
  if (/readFileSync\('tools\/blog\/posts\/ontology-business-semantic-layer\.html'/.test(sources.blog)) {
    findings.push('blog-template-coupled-to-published-html');
  }
  if (/path\.join\(__dirname, 'index\.html'\)/.test(sources.service) && /writeFileSync\(outPath/.test(sources.service)) {
    findings.push('service-agent-direct-public-write');
  }
  if (/trends\.json/.test(sources.trends) && /writeFileSync\(OUTPUT_PATH/.test(sources.trends)) {
    findings.push('trends-direct-public-write');
  }
  if (/items:\s*\[\]/.test(sources.trends)) findings.push('trends-partial-can-publish-empty-board');
  return findings;
}

function loadCurrentSources(root = repoRoot) {
  return {
    blog: fs.readFileSync(path.join(root, 'tools/blog/generate-post.js'), 'utf8'),
    service: fs.readFileSync(path.join(root, 'tools/service-agent/gen_index.js'), 'utf8'),
    trends: fs.readFileSync(path.join(root, 'scripts/fetch-trends.js'), 'utf8'),
  };
}

function main() {
  const findings = analyzeGeneratorSources(loadCurrentSources());
  console.log(`Generator contracts report: ${findings.length} known migration signal(s), report-only.`);
  findings.forEach((finding) => console.log(`[REPORT] ${finding} — see docs/plans/2026-07-31-generator-safe-migration.md`));
}

if (require.main === module) main();

module.exports = { analyzeGeneratorSources, loadCurrentSources };
