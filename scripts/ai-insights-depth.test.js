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
const VALID_LIFECYCLES = new Set(['current', 'historical']);
const VALID_THEMES = new Set([
  'distribution',
  'workflow',
  'trust',
  'creation',
  'community',
  'cost',
  'openness',
  'ecosystem',
  'enterprise',
  'autonomy',
  'control',
  'context',
  'retrieval',
  'safety',
]);
const VALID_TIMELINE_TYPES = new Set(['archive', 'boundary', 'launch', 'retirement']);
const VALID_SURFACE_IDS = new Set(['web', 'app', 'api']);
const VALID_SURFACE_STATUSES = new Set(['available', 'ended', 'sunset-scheduled']);
const REQUIRED_TABS = ['summary', 'mechanism', 'tradeoffs', 'evidence', 'evolution'];

function assertText(value, label) {
  assert.equal(typeof value, 'string', `${label} must be a string`);
  assert.ok(value.trim(), `${label} must not be empty`);
}

function assertSafeId(value, label) {
  assertText(value, label);
  assert.match(value, /^[\p{L}\p{N}][\p{L}\p{N}_-]*$/u, `${label} must use a safe ID format`);
}

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
    assertText(product.name, `${product.id}.name`);
    assertText(product.company, `${product.id}.company`);
    assertText(product.category, `${product.id}.category`);
    assertText(product.logo, `${product.id}.logo`);
    assertText(product.tagline, `${product.id}.tagline`);
    assertText(product.description, `${product.id}.description`);
    assert.equal(VALID_LIFECYCLES.has(product.lifecycle), true, `${product.id} has an invalid lifecycle`);
    assert.match(product.detailLink, /^https:\/\/[^\s]+$/);
    assert.equal(typeof product.archiveDate, 'string');
    assert.equal(product.factReviewStatus, '待人工事实复核');
    assert.equal('reviewedAt' in product, false, `${product.id} must not imply a completed fact review`);
    assert.equal('reviewDueAt' in product, false, `${product.id} must not imply a scheduled fact review`);
    assertIsoDate(product.archiveDate, `${product.id}.archiveDate`);

    assertText(product.thesis?.text, `${product.id}.thesis.text`);
    assert.ok(product.thesis.text.trim().length >= 12, `${product.id}.thesis must be a useful judgment`);
    assert.ok(Array.isArray(product.decisionThemes) && product.decisionThemes.length >= 3);
    assert.equal(product.decisionThemes.every(theme => VALID_THEMES.has(theme)), true, `${product.id} has an invalid decision theme`);
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
      assertText(source.title, `${product.id}.${source.id}.title`);
      assertIsoDate(source.date, `${product.id}.${source.id}.date`);
      assert.equal(source.date, product.archiveDate, `${product.id}.${source.id}.date must be the archive整理 date`);
      assert.equal(source.type, 'official', `${product.id}.${source.id}.type must be official`);
    }

    assertEvidenceRefs(product.thesis.evidenceRefs, sourceIds, `${product.id}.thesis`);
    const decisionIds = new Set();
    for (const [index, decision] of product.decisions.entries()) {
      assertSafeId(decision.id, `${product.id}.decisions[${index}].id`);
      assert.equal(decisionIds.has(decision.id), false, `${product.id} has duplicate decision id ${decision.id}`);
      decisionIds.add(decision.id);
      assertText(decision.title, `${product.id}.decisions[${index}].title`);
      assertText(decision.choice, `${product.id}.decisions[${index}].choice`);
      assertText(decision.why, `${product.id}.decisions[${index}].why`);
      assertText(decision.tradeoff, `${product.id}.decisions[${index}].tradeoff`);
      assertEvidenceRefs(decision.evidenceRefs, sourceIds, `${product.id}.decisions[${index}]`);
    }
    assertIdRefs(product.tabs.summary.decisionIds, decisionIds, `${product.id}.tabs.summary.decisionIds`);
    for (const [index, uncertainty] of product.uncertainties.entries()) {
      assertText(uncertainty.question, `${product.id}.uncertainties[${index}].question`);
      assert.ok(['open', 'watch', 'bounded'].includes(uncertainty.status));
      assertText(uncertainty.note, `${product.id}.uncertainties[${index}].note`);
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
    const decisionIds = new Set(product.decisions.map(decision => decision.id));
    const metricIds = new Set();
    assert.ok(Array.isArray(product.keyMetrics), `${product.id} must expose an evidence ledger`);
    for (const [index, metric] of product.keyMetrics.entries()) {
      assert.equal(typeof metric.id, 'string');
      assert.match(metric.id, /^[a-z0-9]+(?:-[a-z0-9]+)*$/);
      assert.equal(metricIds.has(metric.id), false, `${product.id} has duplicate metric id ${metric.id}`);
      metricIds.add(metric.id);
      assertText(metric.label, `${product.id}.keyMetrics[${index}].label`);
      assertText(metric.value, `${product.id}.keyMetrics[${index}].value`);
      assertText(metric.definition, `${product.id}.keyMetrics[${index}].definition`);
      assert.ok(metric.definition.trim(), `${product.id}.keyMetrics[${index}] needs a definition`);
      assert.equal(VALID_METRIC_KINDS.has(metric.kind), true, `${product.id} has an invalid metric kind`);
      assertIsoDate(metric.asOf, `${product.id}.keyMetrics[${index}].asOf`);
      assertEvidenceRefs(metric.sourceRefs, sourceIds, `${product.id}.keyMetrics[${index}]`);
      assertText(metric.caveat, `${product.id}.keyMetrics[${index}].caveat`);
      }
    assertIdRefs(product.tabs.evidence.metricIds, metricIds, `${product.id}.tabs.evidence.metricIds`);

    const { summary, mechanism, tradeoffs, evidence, evolution } = product.tabs;
    assertText(summary.problem, `${product.id}.tabs.summary.problem`);
    assertText(summary.whyAi, `${product.id}.tabs.summary.whyAi`);
    assertText(summary.humanRole, `${product.id}.tabs.summary.humanRole`);
    assert.ok(Array.isArray(mechanism.system) && mechanism.system.every(item => typeof item === 'string' && item.trim()));
    assertText(mechanism.summary, `${product.id}.tabs.mechanism.summary`);
    assertText(mechanism.humanRole, `${product.id}.tabs.mechanism.humanRole`);
    assert.ok(Array.isArray(mechanism.failureModes) && mechanism.failureModes.every(item => typeof item === 'string' && item.trim()));
    assertText(tradeoffs.summary, `${product.id}.tabs.tradeoffs.summary`);
    assert.ok(Array.isArray(tradeoffs.rows) && tradeoffs.rows.every(row => decisionIds.has(row.decision) && [row.decision, row.gain, row.cost, row.boundary].every(value => typeof value === 'string' && value.trim())));
    assertText(evidence.summary, `${product.id}.tabs.evidence.summary`);
    assertText(evidence.missing, `${product.id}.tabs.evidence.missing`);
    assertText(evolution.summary, `${product.id}.tabs.evolution.summary`);
    assertText(evolution.migrationBoundary, `${product.id}.tabs.evolution.migrationBoundary`);
    assertText(evolution.counterEvidence, `${product.id}.tabs.evolution.counterEvidence`);
    for (const [index, event] of evolution.timeline.entries()) {
      assert.equal(VALID_TIMELINE_TYPES.has(event.type), true, `${product.id}.timeline[${index}] has an invalid type`);
    }

    if (product.surfaces !== undefined) {
      assert.ok(Array.isArray(product.surfaces) && product.surfaces.length > 0, `${product.id}.surfaces must be a non-empty array`);
      const surfaceIds = new Set();
      for (const [index, surface] of product.surfaces.entries()) {
        assert.equal(VALID_SURFACE_IDS.has(surface.id), true, `${product.id}.surfaces[${index}] has an invalid surface id`);
        assert.equal(surfaceIds.has(surface.id), false, `${product.id} has duplicate surface id ${surface.id}`);
        surfaceIds.add(surface.id);
        assertText(surface.label, `${product.id}.surfaces[${index}].label`);
        assert.equal(VALID_SURFACE_STATUSES.has(surface.status), true, `${product.id}.surfaces[${index}] has an invalid status`);
        assertText(surface.summary, `${product.id}.surfaces[${index}].summary`);
        assertEvidenceRefs(surface.evidenceRefs, sourceIds, `${product.id}.surfaces[${index}]`);
        if (surface.status === 'ended') assertIsoDate(surface.statusDate, `${product.id}.surfaces[${index}].statusDate`);
        if (surface.status === 'available') assertIsoDate(surface.asOf, `${product.id}.surfaces[${index}].asOf`);
        if (surface.retirementDate !== undefined) assertIsoDate(surface.retirementDate, `${product.id}.surfaces[${index}].retirementDate`);
      }
    }
  }
});

test('Sora records availability by surface instead of claiming overall unavailability', () => {
  const sora = products.find(product => product.id === 'sora');
  assert.ok(sora);
  assert.deepEqual(sora.surfaces.map(surface => surface.id), ['web', 'app', 'api']);
  const web = sora.surfaces.find(surface => surface.id === 'web');
  const app = sora.surfaces.find(surface => surface.id === 'app');
  const api = sora.surfaces.find(surface => surface.id === 'api');
  for (const surface of [web, app]) {
    assert.equal(surface.status, 'ended');
    assert.equal(surface.statusDate, '2026-04-26');
  }
  assert.equal(api.status, 'available');
  assert.equal(api.asOf, '2026-08-31');
  assert.equal(api.retirementDate, '2026-09-24');
  assert.ok(sora.tabs.evolution.timeline.some(event => event.date === '2026-04-26' && /web|app|网页|应用/i.test(event.event)));
  assert.ok(sora.tabs.evolution.timeline.some(event => event.date === '2026-08-31' && /API.*2026-09-24|2026-09-24.*API/i.test(event.event)));
  assert.equal(JSON.stringify(sora).includes('整体不可用'), false);
  assert.equal(sora.sources.find(source => source.id === 'sunset').type, 'official');
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
