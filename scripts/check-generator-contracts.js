const { analyzeGeneratorSources, loadCurrentSources } = require('./generator-contracts');

function main() {
  const findings = analyzeGeneratorSources(loadCurrentSources());
  console.log(`Generator contracts report: ${findings.length} known migration signal(s), report-only.`);
  findings.forEach((finding) => console.log(`[REPORT] ${finding} — see docs/plans/2026-07-31-generator-safe-migration.md`));
}

main();
