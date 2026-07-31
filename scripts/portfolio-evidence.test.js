const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const { validatePortfolio } = require('./check-portfolio-evidence');

const fixture = JSON.parse(fs.readFileSync(path.join(__dirname, '../docs/portfolio-evidence.examples.json'), 'utf8'));

test('portfolio evidence example covers the five planned portfolio types', () => {
  assert.deepEqual(validatePortfolio(fixture), []);
  assert.deepEqual(
    fixture.portfolio.map((record) => record.id),
    ['esop-extractor', 'financial-rag', 'service-agent', 'aml-due-diligence', 'asci-research-system'],
  );
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
