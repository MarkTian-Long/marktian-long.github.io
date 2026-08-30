'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const repoRoot = path.resolve(__dirname, '..');
const productsPath = path.join(repoRoot, 'tools', 'ai-insights', 'data', 'products.json');
const products = JSON.parse(fs.readFileSync(productsPath, 'utf8'));

const EXPECTED_IDS = new Set([
  'chatgpt',
  'midjourney',
  'deepseek',
  'claude',
  'cursor',
  'notion-ai',
  'sora',
  'perplexity',
  'claude-code',
]);
const VALID_METRIC_KINDS = new Set([
  'target',
  'proxy',
  'offline-measured',
  'production-result',
  'external-research',
]);
const REQUIRED_TABS = ['summary', 'mechanism', 'tradeoffs', 'evidence', 'evolution'];

function assertIsoDate(value, label) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value));
  assert.ok(match, `${label} must use YYYY-MM-DD`);
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(0);
  date.setUTCFullYear(year, month - 1, day);
  date.setUTCHours(0, 0, 0, 0);
  assert.equal(date.getUTCFullYear(), year, `${label} must be a real UTC date`);
  assert.equal(date.getUTCMonth(), month - 1, `${label} must be a real UTC date`);
  assert.equal(date.getUTCDate(), day, `${label} must be a real UTC date`);
}

function assertEvidenceRefs(refs, sourceIds, label) {
  assert.ok(Array.isArray(refs) && refs.length > 0, `${label} must cite at least one source`);
  for (const ref of refs) {
    assert.equal(typeof ref, 'string', `${label} evidence refs must be source ids`);
    assert.equal(sourceIds.has(ref), true, `${label} points to missing source ${ref}`);
  }
}

function assertIdRefs(refs, ids, label) {
  assert.ok(Array.isArray(refs) && refs.length > 0, `${label} must cite at least one id`);
  for (const ref of refs) {
    assert.equal(typeof ref, 'string', `${label} refs must be ids`);
    assert.equal(ids.has(ref), true, `${label} points to missing id ${ref}`);
  }
}

test('date validation uses a UTC calendar round-trip', () => {
  assert.doesNotThrow(() => assertIsoDate('2024-02-29', 'leap-day'));
  for (const value of ['2026-02-30', '2025-02-29', '2026-13-01']) {
    assert.throws(() => assertIsoDate(value, 'invalid-date'));
  }
});

test('the nine existing products are complete decision archives', () => {
  assert.equal(products.length, EXPECTED_IDS.size, 'the depth pass must not add or remove products');
  assert.deepEqual(new Set(products.map(product => product.id)), EXPECTED_IDS);

  for (const product of products) {
    assert.match(product.id, /^[a-z0-9]+(?:-[a-z0-9]+)*$/);
    assert.equal(typeof product.archiveDate, 'string');
    assert.equal(product.factReviewStatus, '待人工事实复核');
    assert.equal('reviewedAt' in product, false, `${product.id} must not imply a completed fact review`);
    assert.equal('reviewDueAt' in product, false, `${product.id} must not imply a scheduled fact review`);
    assertIsoDate(product.archiveDate, `${product.id}.archiveDate`);

    assert.equal(typeof product.thesis?.text, 'string');
    assert.ok(product.thesis.text.trim().length >= 12, `${product.id}.thesis must be a useful judgment`);
    assert.ok(Array.isArray(product.decisionThemes) && product.decisionThemes.length >= 3);
    assert.ok(Array.isArray(product.decisions) && product.decisions.length >= 3);
    assert.ok(Array.isArray(product.uncertainties) && product.uncertainties.length >= 2);
    assert.deepEqual(Object.keys(product.tabs).sort(), REQUIRED_TABS.slice().sort());

    assert.ok(Array.isArray(product.sources) && product.sources.length >= 2);
    const sourceIds = new Set();
    for (const source of product.sources) {
      assert.match(source.id, /^[a-z0-9]+(?:-[a-z0-9]+)*$/);
      assert.equal(sourceIds.has(source.id), false, `${product.id} has duplicate source id ${source.id}`);
      sourceIds.add(source.id);
      assert.match(source.url, /^https:\/\/[^\s]+$/);
      assert.equal(typeof source.title, 'string');
      assert.ok(source.title.trim());
      assertIsoDate(source.date, `${product.id}.${source.id}.date`);
      assert.equal(source.date, product.archiveDate, `${product.id}.${source.id}.date must be the archive整理 date`);
    }

    assertEvidenceRefs(product.thesis.evidenceRefs, sourceIds, `${product.id}.thesis`);
    const decisionIds = new Set();
    for (const [index, decision] of product.decisions.entries()) {
      assert.equal(typeof decision.id, 'string');
      assert.equal(decisionIds.has(decision.id), false, `${product.id} has duplicate decision id ${decision.id}`);
      decisionIds.add(decision.id);
      assert.equal(typeof decision.title, 'string');
      assert.equal(typeof decision.choice, 'string');
      assert.equal(typeof decision.why, 'string');
      assert.equal(typeof decision.tradeoff, 'string');
      assertEvidenceRefs(decision.evidenceRefs, sourceIds, `${product.id}.decisions[${index}]`);
    }
    assertIdRefs(product.tabs.summary.decisionIds, decisionIds, `${product.id}.tabs.summary.decisionIds`);
    for (const [index, uncertainty] of product.uncertainties.entries()) {
      assert.equal(typeof uncertainty.question, 'string');
      assert.ok(uncertainty.question.trim());
      assert.ok(['open', 'watch', 'bounded'].includes(uncertainty.status));
      assert.equal(typeof uncertainty.note, 'string');
      assert.ok(Array.isArray(uncertainty.evidenceRefs));
      for (const ref of uncertainty.evidenceRefs) {
        assert.equal(sourceIds.has(ref), true, `${product.id}.uncertainties[${index}] points to missing source ${ref}`);
      }
    }
  }
});

test('the archive does not claim a completed current-round source review', () => {
  for (const product of products) {
    const serialized = JSON.stringify(product);
    assert.equal(serialized.includes('本轮复核'), false, `${product.id} must not imply a completed current-round review`);
    assert.equal(product.tabs.evolution.timeline.some(event => event.type === 'review'), false, `${product.id} must use honest archive timeline labels`);
  }
});

test('every public metric declares its meaning, kind, date, caveat, and evidence', () => {
  for (const product of products) {
    const sourceIds = new Set(product.sources.map(source => source.id));
    const metricIds = new Set();
    assert.ok(Array.isArray(product.keyMetrics), `${product.id} must expose an evidence ledger`);
    for (const [index, metric] of product.keyMetrics.entries()) {
      assert.equal(typeof metric.id, 'string');
      assert.equal(metricIds.has(metric.id), false, `${product.id} has duplicate metric id ${metric.id}`);
      metricIds.add(metric.id);
      assert.equal(typeof metric.label, 'string');
      assert.equal(typeof metric.value, 'string');
      assert.equal(typeof metric.definition, 'string');
      assert.ok(metric.definition.trim(), `${product.id}.keyMetrics[${index}] needs a definition`);
      assert.equal(VALID_METRIC_KINDS.has(metric.kind), true, `${product.id} has an invalid metric kind`);
      assertIsoDate(metric.asOf, `${product.id}.keyMetrics[${index}].asOf`);
      assertEvidenceRefs(metric.sourceRefs, sourceIds, `${product.id}.keyMetrics[${index}]`);
      assert.equal(typeof metric.caveat, 'string');
      assert.ok(metric.caveat.trim(), `${product.id}.keyMetrics[${index}] needs a caveat`);
    }
    assertIdRefs(product.tabs.evidence.metricIds, metricIds, `${product.id}.tabs.evidence.metricIds`);
  }
});

test('the archive does not present unexplained rankings or unsupported source records', () => {
  for (const product of products) {
    assert.equal('stars' in product, false, `${product.id} must not use an unexplained star ranking`);
    assert.equal('trend' in product, false, `${product.id} must not use an unexplained trend label`);
    for (const event of product.tabs.evolution.timeline) {
      assertIsoDate(event.date, `${product.id}.timeline.date`);
      assertEvidenceRefs(event.evidenceRefs, new Set(product.sources.map(source => source.id)), `${product.id}.timeline`);
    }
  }
});
