const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const { analyzeGeneratorSources } = require('./generator-contracts');

test('generator contract fixture detects each unsafe write and path failure mode', () => {
  const findings = analyzeGeneratorSources({
    blog: 'fs.writeFileSync(outputPath, html)',
    service: 'fs.writeFileSync(publicPath, html)',
    trends: "const OUTPUT_PATH = 'trends.json'; fs.writeFileSync(OUTPUT_PATH, data); boards.push({ items: [] })",
  });
  assert.deepEqual(findings, [
    'blog-write-without-check-mode',
    'service-write-without-check-mode',
    'trends-write-without-explicit-mode',
    'trends-partial-write-not-refused',
  ]);
});

test('candidate output requires an explicit bounded path guard', () => {
  const findings = analyzeGeneratorSources({
    blog: "if (mode === 'candidate') fs.writeFileSync(outputPath, html)",
    service: "if (GENERATOR_MODE === 'candidate') fs.writeFileSync(publicPath, html)",
    trends: "if (GENERATOR_MODE === 'candidate') fs.writeFileSync(OUTPUT_PATH, data); throw new Error('Refusing partial trends result')",
  });
  assert.deepEqual(findings, [
    'blog-write-without-check-mode', 'blog-candidate-path-unbounded',
    'service-write-without-check-mode', 'service-candidate-path-unbounded',
    'trends-write-without-explicit-mode', 'trends-candidate-path-unbounded',
  ]);
});

test('blog and service-agent generators require check, candidate, or explicit write mode', () => {
  const root = path.resolve(__dirname, '..');
  const findings = analyzeGeneratorSources({
    blog: fs.readFileSync(path.join(root, 'tools/blog/generate-post.js'), 'utf8'),
    service: fs.readFileSync(path.join(root, 'tools/service-agent/gen_index.js'), 'utf8'),
    trends: fs.readFileSync(path.join(root, 'scripts/fetch-trends.js'), 'utf8'),
  });
  assert.deepEqual(findings, []);
});
