const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const dataPath = path.resolve(__dirname, '../tools/radar/data.js');

function loadRadarData() {
  if (!fs.existsSync(dataPath)) return null;
  delete require.cache[require.resolve(dataPath)];
  return require(dataPath);
}

function assertUniqueIds(records, label) {
  assert.ok(Array.isArray(records) && records.length > 0, `${label} must be a non-empty array`);
  const ids = records.map((record) => record.id);
  assert.equal(new Set(ids).size, ids.length, `${label} IDs must be unique`);
  ids.forEach((id) => assert.match(id, /^[a-z0-9]+(?:-[a-z0-9]+)*$/, `${label} ID must be kebab-case`));
}

function assertDate(value, label) {
  assert.equal(typeof value, 'string', `${label} must be a string`);
  assert.match(value, /^\d{4}-\d{2}-\d{2}$/, `${label} must use YYYY-MM-DD`);
  const parsed = new Date(`${value}T00:00:00Z`);
  assert.equal(Number.isNaN(parsed.getTime()), false, `${label} must be a valid date`);
  assert.equal(parsed.toISOString().slice(0, 10), value, `${label} must be a calendar date`);
}

function assertHttpsUrl(value, label) {
  assert.equal(typeof value, 'string', `${label} must be a string`);
  const parsed = new URL(value);
  assert.equal(parsed.protocol, 'https:', `${label} must use HTTPS`);
  assert.ok(parsed.hostname && !parsed.hostname.includes(' '), `${label} must include a safe hostname`);
}

test('radar data exports the versioned contract metadata and four unique research intents', () => {
  const data = loadRadarData();
  assert.ok(data, 'tools/radar/data.js must export radar data');
  assert.deepEqual(Object.keys(data).sort(), ['intents', 'meta', 'sources', 'workflowTools'].sort());
  assert.equal(data.meta.schemaVersion, 1);
  assert.equal(data.meta.noRealtimeProbe, true);
  assert.match(data.meta.statusSemantics, /人工复核/);
  assertDate(data.meta.updatedAt, 'meta.updatedAt');
  assertUniqueIds(data.intents, 'intents');
  assert.equal(data.intents.length, 4, 'the radar must define four research intents');
  data.intents.forEach((intent) => {
    assert.equal(typeof intent.label, 'string');
    assert.equal(typeof intent.question, 'string');
    assert.ok(Array.isArray(intent.sourceIds) && intent.sourceIds.length >= 2, `${intent.id} needs at least two sources`);
  });
});

test('radar sources contain complete editorial metadata with safe URLs and controlled enums', () => {
  const data = loadRadarData();
  assert.ok(data, 'radar data must load before source validation');
  assertUniqueIds(data.sources, 'sources');
  assert.equal(data.sources.length, 11, 'the original eleven sources must be migrated');

  const languages = new Set(['zh', 'en']);
  const types = new Set(['blog', 'essay', 'newsletter', 'community', 'media']);
  const roles = new Set(['primary', 'analysis', 'community', 'bridge']);
  const cadences = new Set(['daily', 'weekly', 'monthly', 'irregular', 'ongoing']);
  const priorities = new Set(['core', 'supporting', 'watch']);
  const accessModes = new Set(['open', 'partial', 'subscription', 'account']);
  const statuses = new Set(['reviewed', 'needs-review', 'not-reviewed']);

  data.sources.forEach((source) => {
    assert.equal(typeof source.name, 'string');
    assertHttpsUrl(source.url, `${source.id}.url`);
    assert.ok(languages.has(source.language), `${source.id}.language must be controlled`);
    assert.ok(types.has(source.type), `${source.id}.type must be controlled`);
    assert.ok(roles.has(source.role), `${source.id}.role must be controlled`);
    assert.ok(Array.isArray(source.topics) && source.topics.length > 0, `${source.id}.topics is required`);
    assert.ok(cadences.has(source.updateCadence), `${source.id}.updateCadence must be controlled`);
    assert.ok(priorities.has(source.priority), `${source.id}.priority must be controlled`);
    assert.ok(accessModes.has(source.access), `${source.id}.access must be controlled`);
    assert.ok(Array.isArray(source.bestFor) && source.bestFor.length > 0, `${source.id}.bestFor is required`);
    assert.ok(Array.isArray(source.blindSpot) && source.blindSpot.length > 0, `${source.id}.blindSpot is required`);
    assert.equal(typeof source.retentionReason, 'string');
    assert.ok(source.retentionReason.trim().length > 0, `${source.id}.retentionReason is required`);
    assertDate(source.lastCheckedAt, `${source.id}.lastCheckedAt`);
    assert.ok(statuses.has(source.manualStatus), `${source.id}.manualStatus must be controlled`);
  });
});

test('every intent references known sources and the workflow tools form a four-stage research stack', () => {
  const data = loadRadarData();
  assert.ok(data, 'radar data must load before relationship validation');
  const sourceIds = new Set(data.sources.map((source) => source.id));
  data.intents.forEach((intent) => {
    intent.sourceIds.forEach((sourceId) => assert.ok(sourceIds.has(sourceId), `${intent.id} references an unknown source`));
  });

  assertUniqueIds(data.workflowTools, 'workflowTools');
  assert.deepEqual(data.workflowTools.map((tool) => tool.stage), ['search', 'verify', 'synthesize', 'distill']);
  data.workflowTools.forEach((tool) => {
    assert.equal(typeof tool.name, 'string');
    assertHttpsUrl(tool.url, `${tool.id}.url`);
    assert.equal(typeof tool.description, 'string');
    assert.ok(tool.description.trim().length > 0, `${tool.id}.description is required`);
    assert.ok(['search', 'verify', 'synthesize', 'distill'].includes(tool.stage));
  });
});
