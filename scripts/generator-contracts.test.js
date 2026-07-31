const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const { analyzeGeneratorSources } = require('./generator-contracts');

test('generator contract fixture detects each unsafe write and partial-data failure mode', () => {
  const findings = analyzeGeneratorSources({
    blog: "fs.readFileSync('tools/blog/posts/ontology-business-semantic-layer.html', 'utf8')",
    service: "const outPath = path.join(__dirname, 'index.html'); fs.writeFileSync(outPath, html)",
    trends: "const OUTPUT_PATH = 'trends.json'; fs.writeFileSync(OUTPUT_PATH, data); boards.push({ items: [] })",
  });
  assert.deepEqual(findings, [
    'blog-template-coupled-to-published-html',
    'service-agent-direct-public-write',
    'trends-direct-public-write',
    'trends-partial-can-publish-empty-board',
  ]);
});

test('current generators retain the migration signals without rewriting public artifacts', () => {
  const root = path.resolve(__dirname, '..');
  const findings = analyzeGeneratorSources({
    blog: fs.readFileSync(path.join(root, 'tools/blog/generate-post.js'), 'utf8'),
    service: fs.readFileSync(path.join(root, 'tools/service-agent/gen_index.js'), 'utf8'),
    trends: fs.readFileSync(path.join(root, 'scripts/fetch-trends.js'), 'utf8'),
  });
  assert.deepEqual(findings, [
    'blog-template-coupled-to-published-html',
    'service-agent-direct-public-write',
    'trends-direct-public-write',
    'trends-partial-can-publish-empty-board',
  ]);
});
