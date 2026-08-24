const fs = require('node:fs');
const path = require('node:path');

const repoRoot = path.resolve(__dirname, '..');

function analyzeGeneratorSources(sources) {
  const findings = [];
  if (/writeFileSync\(outputPath/.test(sources.blog) && !/mode === 'check'/.test(sources.blog)) findings.push('blog-write-without-check-mode');
  if (/mode === 'candidate'/.test(sources.blog) && !/Candidate output must stay under build\/candidate-site/.test(sources.blog)) findings.push('blog-candidate-path-unbounded');
  if (/writeFileSync\(publicPath/.test(sources.service) && !/GENERATOR_MODE === 'check'/.test(sources.service)) findings.push('service-write-without-check-mode');
  if (/GENERATOR_MODE === 'candidate'/.test(sources.service) && !/Candidate output must stay under build\/candidate-site/.test(sources.service)) findings.push('service-candidate-path-unbounded');
  if (/writeFileSync\(OUTPUT_PATH/.test(sources.trends) && !/GENERATOR_MODE\s*!?==\s*'write'/.test(sources.trends)) findings.push('trends-write-without-explicit-mode');
  if (/GENERATOR_MODE === 'candidate'/.test(sources.trends) && !/Candidate output must stay under build\/candidate-site/.test(sources.trends)) findings.push('trends-candidate-path-unbounded');
  if (!/Refusing partial trends result/.test(sources.trends)) findings.push('trends-partial-write-not-refused');
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
