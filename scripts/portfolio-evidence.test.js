const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const { parseArgs, successMessage, validatePortfolio } = require('./check-portfolio-evidence');

const repoRoot = path.resolve(__dirname, '..');
const fixture = JSON.parse(fs.readFileSync(path.join(repoRoot, 'docs/portfolio-evidence.examples.json'), 'utf8'));

test('portfolio evidence covers eight public tools and retains the private case', () => {
  assert.deepEqual(validatePortfolio(fixture), []);
  assert.deepEqual(
    fixture.portfolio.map((record) => record.id),
    [
      'esop-extractor',
      'financial-rag',
      'service-agent',
      'asci-research-system',
      'ai-insights',
      'radar',
      'trends',
      'agent-hub',
      'aml-due-diligence',
    ],
  );
});

test('every published evidence record resolves to its shipped demo and artifact source', () => {
  for (const record of fixture.portfolio.filter((entry) => entry.status === 'published')) {
    assert.equal(typeof record.links.demo, 'string', `${record.id} needs a demo link`);
    assert.ok(fs.existsSync(path.join(repoRoot, record.links.demo)), `${record.id} demo must exist`);
    for (const evidence of record.evidence.filter((entry) => entry.kind === 'artifact')) {
      assert.ok(fs.existsSync(path.join(repoRoot, evidence.source)), `${record.id} artifact source must exist`);
    }
  }
});

test('portfolio evidence rejects a metric without a definition', () => {
  const invalid = structuredClone(fixture);
  delete invalid.portfolio[0].metrics[0].definition;
  assert.ok(validatePortfolio(invalid).some((error) => error.includes('metrics[0].definition')));
});

test('portfolio evidence rejects a missing mock boundary even when mock parts exist', () => {
  const invalid = structuredClone(fixture);
  delete invalid.portfolio[1].mockBoundary;
  assert.ok(validatePortfolio(invalid).some((error) => error.includes('mockBoundary')));
});

test('portfolio evidence enforces every record taxonomy enum from the schema', () => {
  for (const field of ['tier', 'type', 'status']) {
    const invalid = structuredClone(fixture);
    invalid.portfolio[0][field] = 'bogus';
    assert.ok(
      validatePortfolio(invalid).some((error) => error.includes(`portfolio[0].${field}`)),
      `${field} should reject values outside its schema enum`,
    );
  }
});

test('portfolio evidence enforces nested evidence and link shapes', () => {
  const invalidEvidence = structuredClone(fixture);
  invalidEvidence.portfolio[0].evidence[0].kind = 'bogus';
  assert.ok(validatePortfolio(invalidEvidence).some((error) => error.includes('evidence[0].kind')));

  const missingEvidenceSource = structuredClone(fixture);
  delete missingEvidenceSource.portfolio[0].evidence[0].source;
  assert.ok(validatePortfolio(missingEvidenceSource).some((error) => error.includes('evidence[0].source')));

  const invalidLink = structuredClone(fixture);
  invalidLink.portfolio[0].links.demo = 42;
  assert.ok(validatePortfolio(invalidLink).some((error) => error.includes('links.demo')));

  const extraLink = structuredClone(fixture);
  extraLink.portfolio[0].links.extra = null;
  assert.ok(validatePortfolio(extraLink).some((error) => error.includes('links.extra')));
});

test('portfolio evidence CLI parses only the documented argument forms', () => {
  assert.deepEqual(parseArgs([]), { file: 'docs/portfolio-evidence.examples.json' });
  assert.deepEqual(parseArgs(['--file', 'docs/custom.json']), { file: 'docs/custom.json' });
  assert.throws(() => parseArgs(['--file']), /Usage:/);
  assert.throws(() => parseArgs(['--file', 'docs/custom.json', 'extra']), /Usage:/);
  assert.throws(() => parseArgs(['docs/custom.json']), /Usage:/);
});

test('portfolio evidence success message reports the validated record count', () => {
  assert.equal(successMessage({ portfolio: [{}, {}] }), 'Portfolio evidence check passed: 2 records.');
});

test('portfolio evidence uses reader-facing authorship language for Trends', () => {
  const trends = fixture.portfolio.find((record) => record.id === 'trends');
  assert.ok(trends, 'Trends evidence record should exist');
  assert.doesNotMatch(JSON.stringify(trends), /Codex 点评/);
  assert.match(JSON.stringify(trends.mockParts), /作者静态判断/);
});
