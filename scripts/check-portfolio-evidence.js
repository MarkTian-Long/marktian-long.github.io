const fs = require('node:fs');
const path = require('node:path');

const repoRoot = path.resolve(__dirname, '..');
const metricKinds = new Set(['target', 'proxy', 'offline-measured', 'production-result', 'external-research']);
const datePattern = /^\d{4}-\d{2}-\d{2}$/;

function hasText(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function validatePortfolio(document) {
  const errors = [];
  if (!document || document.schemaVersion !== '1.0' || !Array.isArray(document.portfolio)) {
    return ['根对象必须包含 schemaVersion: "1.0" 和 portfolio 数组'];
  }
  const ids = new Set();
  for (const [index, record] of document.portfolio.entries()) {
    const label = `portfolio[${index}]`;
    for (const field of ['id', 'title', 'tier', 'type', 'status', 'myRole', 'mockBoundary', 'lastVerified']) {
      if (!hasText(record[field])) errors.push(`${label}.${field} 缺失或为空`);
    }
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(record.id || '')) errors.push(`${label}.id 必须是 kebab-case`);
    if (ids.has(record.id)) errors.push(`${label}.id 重复: ${record.id}`);
    ids.add(record.id);
    if (!Array.isArray(record.realParts)) errors.push(`${label}.realParts 必须是数组`);
    if (!Array.isArray(record.mockParts)) errors.push(`${label}.mockParts 必须是数组（即使为空也必须声明 Mock 边界）`);
    if (!datePattern.test(record.lastVerified || '')) errors.push(`${label}.lastVerified 必须是 YYYY-MM-DD`);
    if (!Array.isArray(record.metrics) || !record.metrics.length) {
      errors.push(`${label}.metrics 至少需要一条指标口径`);
    } else {
      for (const [metricIndex, metric] of record.metrics.entries()) {
        const metricLabel = `${label}.metrics[${metricIndex}]`;
        if (!metricKinds.has(metric.kind)) errors.push(`${metricLabel}.kind 不合法`);
        for (const field of ['definition', 'source', 'asOf']) {
          if (!hasText(metric[field])) errors.push(`${metricLabel}.${field} 缺失或为空`);
        }
        if (!datePattern.test(metric.asOf || '')) errors.push(`${metricLabel}.asOf 必须是 YYYY-MM-DD`);
      }
    }
    if (!Array.isArray(record.evidence) || !record.evidence.length) errors.push(`${label}.evidence 至少需要一条证据`);
    if (!record.links || typeof record.links !== 'object') errors.push(`${label}.links 缺失`);
    else for (const field of ['demo', 'case', 'code', 'article']) if (!(field in record.links)) errors.push(`${label}.links.${field} 缺失`);
  }
  return errors;
}

function readDocument(argument) {
  const relative = argument || 'docs/portfolio-evidence.examples.json';
  if (path.isAbsolute(relative) || relative.includes('..')) throw new Error('只接受仓库内的相对 JSON 文件路径');
  return JSON.parse(fs.readFileSync(path.join(repoRoot, relative), 'utf8'));
}

function main() {
  const [flag, file] = process.argv.slice(2);
  if (flag && flag !== '--file') throw new Error('Usage: node scripts/check-portfolio-evidence.js [--file <relative.json>]');
  const errors = validatePortfolio(readDocument(file));
  if (errors.length) {
    errors.forEach((error) => console.error(`[ERROR] ${error}`));
    process.exitCode = 1;
  } else console.log('Portfolio evidence check passed: 5 records.');
}

if (require.main === module) main();

module.exports = { validatePortfolio };
