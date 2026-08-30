const assert = require('node:assert/strict');
const test = require('node:test');

global.document = {
  getElementById() {
    return { addEventListener() {} };
  },
  addEventListener() {},
};

const app = require('../tools/esop-extractor/app.js');

const {
  FIXTURE_SCENARIOS,
  SCHEMA_VERSION,
  EVALUATION_VERSION,
  calculateMetrics,
  createRunMeta,
  createDemoResult,
  evaluateFixtureSet,
  evidenceMatch,
  getPdfMeta,
  getEffectiveField,
  recordReview,
  validateCustomEndpoint,
  apiCompletionUrl,
  buildApiRequest,
  sanitizeApiError,
  validateExtractionSchema,
  parseAIResponse,
  inspectLegacyStorage,
  storageKeys,
  collectBadCases,
  runValidation,
} = app;

const BASIC_KEYS = [
  'tickerCode', 'industryCat', 'registeredLocation', 'listingBoard', 'securityType',
  'founders', 'listingDate', 'ipoPrice', 'totalSharesAfter', 'totalSharesBefore',
  'ipoMarketCap',
];
const PLAN_KEYS = [
  'adoptionDate', 'planName', 'reservedShares', 'reservedShareRatio', 'shareType',
  'incentiveTool', 'grantedShares', 'grantedShareRatio', 'exercisePrice', 'grantDateFMV',
];
const GRANTEE_KEYS = [
  'name', 'position', 'hireDate', 'grantDate', 'incentiveTool', 'grantedShares',
  'grantedShareRatio', 'vestingSchedule', 'holdingPlatform', 'cashComp',
];

function field(value = null, confidence = 'low', source = '') {
  return { value, confidence, source };
}

function minimalResult() {
  const makeSection = (keys) => Object.fromEntries(
    keys.map((key) => [key, field()]),
  );
  return {
    companyBasic: makeSection(BASIC_KEYS),
    esopPlan: makeSection(PLAN_KEYS),
    grantees: [makeSection(GRANTEE_KEYS)],
  };
}

function assertFunction(value, name) {
  assert.equal(typeof value, 'function', `${name} should be exported by app.js`);
}

test('metrics label model high-confidence share as a proxy, not extraction accuracy', () => {
  assertFunction(calculateMetrics, 'calculateMetrics');
  const result = minimalResult();
  result.companyBasic.tickerCode = field('01234', 'high', '股票代码：01234');
  const metrics = calculateMetrics(result, '股票代码：01234');

  assert.equal(metrics.modelHighConfidenceShare.kind, 'proxy');
  assert.match(metrics.modelHighConfidenceShare.label, /自报|proxy/i);
  assert.equal(metrics.accuracyTarget.kind, 'target');
  assert.equal(metrics.accuracyTarget.status, 'not-measured');
  assert.equal(metrics.accuracyTarget.value, '≥95%');
});

test('manual correction changes only the effective value and keeps original value and confidence', () => {
  assertFunction(recordReview, 'recordReview');
  assertFunction(getEffectiveField, 'getEffectiveField');
  const result = minimalResult();
  result.companyBasic.tickerCode = field('01234', 'medium', '股票代码：01234');
  result.reviews = {};

  recordReview(result, 'companyBasic.tickerCode', {
    status: 'corrected',
    correctedValue: '05678',
    errorTypes: ['value_wrong'],
    rootCause: 'value_wrong',
    repairTarget: 'prompt',
    regression: 'not-run',
  });

  const original = result.companyBasic.tickerCode;
  const effective = getEffectiveField(result, 'companyBasic.tickerCode');
  assert.equal(original.value, '01234');
  assert.equal(original.confidence, 'medium');
  assert.equal(effective.value, '05678');
  assert.equal(effective.confidence, 'medium');
  assert.equal(result.reviews['companyBasic.tickerCode'].status, 'corrected');
});

test('evidence matching distinguishes exact, partial, and missing source claims', () => {
  assertFunction(evidenceMatch, 'evidenceMatch');
  assert.equal(
    evidenceMatch('全球发售 | 发行价定为每股港币18.88元', '本次全球发售发行价定为每股港币18.88元。'),
    'exact',
  );
  assert.equal(
    evidenceMatch('定价章节 | 港币18.88元/股', '本次全球发售发行价定为每股港币18.88元。'),
    'partial',
  );
  assert.equal(evidenceMatch('', '有输入但没有来源'), 'missing');
  assert.equal(evidenceMatch('未在提供的文本中找到相关内容', '有输入'), 'missing');
});

test('PDF metadata never invents a page count and keeps only file identity and size', () => {
  assertFunction(getPdfMeta, 'getPdfMeta');
  const meta = getPdfMeta({ name: 'plan.pdf', size: 123456, type: 'application/pdf' });
  assert.deepEqual(meta, { name: 'plan.pdf', size: 123456, type: 'application/pdf' });
  assert.equal('pageCount' in meta, false);
});

test('default mode exposes exactly three named fixtures and each run records provenance metadata', () => {
  assertFunction(createDemoResult, 'createDemoResult');
  assert.deepEqual(
    FIXTURE_SCENARIOS.map((scenario) => scenario.id),
    ['standard', 'missing-ambiguous', 'logical-conflict'],
  );
  const result = createDemoResult('logical-conflict', {
    runId: 'run-test-001',
    startedAt: '2026-08-30T00:00:00.000Z',
    completedAt: '2026-08-30T00:00:01.000Z',
  });
  assert.deepEqual(result.runMeta, {
    runId: 'run-test-001',
    mode: 'demo',
    scenarioId: 'logical-conflict',
    promptVersion: app.PROMPT_VERSION,
    schemaVersion: SCHEMA_VERSION,
    startedAt: '2026-08-30T00:00:00.000Z',
    completedAt: '2026-08-30T00:00:01.000Z',
  });
  assert.equal(result.inputText, undefined);
  assert.equal(result.evaluation.kind, 'offline-measured');
});

test('synthetic evaluation reports sample range, version, date, exact match, completeness, and evidence coverage', () => {
  assertFunction(evaluateFixtureSet, 'evaluateFixtureSet');
  const evaluation = evaluateFixtureSet();
  assert.equal(evaluation.kind, 'offline-measured');
  assert.equal(evaluation.sampleCount, 3);
  assert.equal(evaluation.sampleRange, '3 个合成夹具');
  assert.equal(evaluation.version, EVALUATION_VERSION);
  assert.match(evaluation.measuredOn, /^2026-08-30$/);
  assert.equal(evaluation.sampleExactMatch.value, '67%');
  assert.equal(evaluation.fieldCompleteness.value, '100%');
  assert.equal(evaluation.fieldExactMatch.value, '98%');
  assert.ok(evaluation.sampleExactMatch.denominator > 0);
  assert.ok(evaluation.fieldCompleteness.denominator > 0);
  assert.ok(evaluation.locatableEvidenceCoverage.denominator > 0);
});

test('legacy storage inspection is read-only and new result persistence is absent', () => {
  assertFunction(inspectLegacyStorage, 'inspectLegacyStorage');
  const storage = makeStorage({
    qiuzhi_esop_last_result: '{"old":true}',
    qiuzhi_esop_apikey: 'secret-key',
    qiuzhi_esop_endpoint: 'https://private.example',
    qiuzhi_esop_model: 'private-model',
  });
  const before = storage.snapshot();
  const inspection = inspectLegacyStorage(storage);
  assert.deepEqual(storage.snapshot(), before);
  assert.deepEqual(inspection.resultKeys, ['qiuzhi_esop_last_result']);
  assert.deepEqual(inspection.sensitiveKeys.sort(), [
    'qiuzhi_esop_apikey',
    'qiuzhi_esop_endpoint',
    'qiuzhi_esop_model',
  ]);
  assert.equal(app.persistResultToStorage, undefined);
});

test('storage key audit can enumerate local and session storage without reading values', () => {
  assertFunction(storageKeys, 'storageKeys');
  const local = makeStorage({ qiuzhi_esop_apimode: 'default' });
  const session = makeStorage({ temporary: 'ok' });
  assert.deepEqual(storageKeys(local), ['qiuzhi_esop_apimode']);
  assert.deepEqual(storageKeys(session), ['temporary']);
});

test('custom endpoints allow HTTPS and explicit loopback HTTP, but reject credentials, illegal protocols, and malformed URLs', () => {
  assertFunction(validateCustomEndpoint, 'validateCustomEndpoint');
  assert.equal(validateCustomEndpoint('https://api.example.com').ok, true);
  assert.equal(validateCustomEndpoint('http://localhost:8787').ok, true);
  assert.equal(validateCustomEndpoint('http://127.0.0.1:8787').ok, true);
  assert.equal(validateCustomEndpoint('http://[::1]:8787').ok, true);
  assert.equal(validateCustomEndpoint('https://user:pass@api.example.com').ok, false);
  assert.equal(validateCustomEndpoint('http://api.example.com').ok, false);
  assert.equal(validateCustomEndpoint('file:///C:/secret.txt').ok, false);
  assert.equal(validateCustomEndpoint('not a url').ok, false);
  assert.equal(apiCompletionUrl('https://api.example.com/v1'), 'https://api.example.com/v1/chat/completions');
  assert.equal(apiCompletionUrl('https://api.example.com/v1/chat/completions'), 'https://api.example.com/v1/chat/completions');
});

test('custom API authorization is sent only after the user confirms the exact origin', () => {
  assertFunction(buildApiRequest, 'buildApiRequest');
  assert.throws(
    () => buildApiRequest({
      endpoint: 'https://api.example.com',
      apiKey: 'secret-key',
      model: 'model-a',
      userPrompt: 'private input',
      confirmedOrigin: '',
    }),
    /origin|确认/i,
  );

  const request = buildApiRequest({
    endpoint: 'https://api.example.com/v1',
    apiKey: 'secret-key',
    model: 'model-a',
    userPrompt: 'private input',
    confirmedOrigin: 'https://api.example.com',
  });
  assert.equal(new URL(request.url).origin, 'https://api.example.com');
  assert.equal(request.options.headers.Authorization, 'Bearer secret-key');
  assert.equal(request.options.redirect, 'error');
  assert.match(request.options.body, /model-a/);
  assert.equal(
    apiCompletionUrl('https://api.example.com/v1/chat/completions?api-version=2026-01'),
    'https://api.example.com/v1/chat/completions?api-version=2026-01',
  );
});

test('API errors are actionable but do not echo keys, endpoints, input, or model output', () => {
  assertFunction(sanitizeApiError, 'sanitizeApiError');
  const secret = 'secret-key-123';
  const endpoint = 'https://api.example.com/private';
  const input = '董事会于二零二四年采纳计划';
  const message = sanitizeApiError(new Error(`fetch failed for ${endpoint} using ${secret}: ${input}`));
  assert.match(message, /重试|配置|网络|确认/);
  for (const secretValue of [secret, endpoint, input]) assert.equal(message.includes(secretValue), false);
});

test('custom model output with missing schema fields produces a specific validation error', () => {
  assertFunction(validateExtractionSchema, 'validateExtractionSchema');
  const result = minimalResult();
  delete result.esopPlan.exercisePrice;
  const validation = validateExtractionSchema(result);
  assert.equal(validation.ok, false);
  assert.ok(validation.errors.some((error) => error.includes('esopPlan.exercisePrice')));

  const malformedGrantee = minimalResult();
  malformedGrantee.grantees[0].name.source = { unexpected: true };
  const granteeValidation = validateExtractionSchema(malformedGrantee);
  assert.equal(granteeValidation.ok, false);
  assert.ok(granteeValidation.errors.some((error) => error.includes('grantees[0].name.source')));

  malformedGrantee.grantees = Array.from({ length: 101 }, () => minimalResult().grantees[0]);
  const oversizedValidation = validateExtractionSchema(malformedGrantee);
  assert.equal(oversizedValidation.ok, false);
  assert.ok(oversizedValidation.errors.some((error) => error.includes('最多允许')));
});

test('custom model parser accepts direct and fenced OpenAI-style JSON, with a sanitized schema error', () => {
  assertFunction(parseAIResponse, 'parseAIResponse');
  const payload = JSON.stringify({ choices: [{ message: { content: `\`\`\`JSON\n${JSON.stringify(FIXTURE_SCENARIOS[0].result)}\n\`\`\`` } }] });
  const parsed = parseAIResponse(payload);
  assert.equal(parsed.companyBasic.tickerCode.value, '01234');
  assert.throws(() => parseAIResponse(JSON.stringify({ companyBasic: {} })), (error) => {
    assert.equal(error.code, 'SCHEMA_INVALID');
    assert.match(sanitizeApiError(error), /schema/);
    return true;
  });
});

test('bad case exports preserve root cause, repair target, versions, regression result, and original confidence', () => {
  assertFunction(recordReview, 'recordReview');
  assertFunction(collectBadCases, 'collectBadCases');
  const result = minimalResult();
  result.companyBasic.tickerCode = field('01234', 'high', '股票代码：01234');
  result.reviews = {};
  recordReview(result, 'companyBasic.tickerCode', {
    status: 'unresolved',
    correctedValue: null,
    errorTypes: ['overconfident'],
    rootCause: 'overconfident',
    repairTarget: 'schema',
    regression: 'failed',
    note: '需要增加证据约束',
  });
  const cases = collectBadCases(result);
  assert.equal(cases.length, 1);
  assert.equal(cases[0].originalConfidence, 'high');
  assert.equal(cases[0].rootCause, 'overconfident');
  assert.equal(cases[0].repairTarget, 'schema');
  assert.equal(cases[0].promptVersion, app.PROMPT_VERSION);
  assert.equal(cases[0].schemaVersion, SCHEMA_VERSION);
  assert.equal(cases[0].regression, 'failed');

  const accepted = minimalResult();
  accepted.reviews = {};
  recordReview(accepted, 'companyBasic.tickerCode', { status: 'accepted', errorTypes: ['not-a-valid-type'] });
  assert.deepEqual(accepted.reviews['companyBasic.tickerCode'].errorTypes, []);
  assert.deepEqual(collectBadCases(accepted), []);
});

test('logical conflict fixture produces rule anomalies without changing the extracted fields', () => {
  assertFunction(createDemoResult, 'createDemoResult');
  assertFunction(runValidation, 'runValidation');
  const result = createDemoResult('logical-conflict', {
    runId: 'run-test-002',
    startedAt: '2026-08-30T00:00:00.000Z',
    completedAt: '2026-08-30T00:00:01.000Z',
  });
  const original = result.esopPlan.reservedShares.value;
  const warnings = runValidation(result);
  assert.deepEqual(Object.keys(warnings).sort(), [
    'esopPlan.exercisePrice',
    'esopPlan.grantedShares',
    'grantees[0].grantDate',
  ].sort());
  assert.match(warnings['esopPlan.grantedShares'], /超过/);
  assert.match(warnings['esopPlan.exercisePrice'], /低于/);
  assert.match(warnings['grantees[0].grantDate'], /日期倒置/);
  assert.equal(result.esopPlan.reservedShares.value, original);
});

test('synthetic evaluation uses an independent gold object when a result is mutated', () => {
  const scenarios = JSON.parse(JSON.stringify(FIXTURE_SCENARIOS));
  scenarios[0].result.companyBasic.tickerCode.value = 'wrong';
  const evaluation = evaluateFixtureSet(scenarios);
  assert.equal(evaluation.sampleExactMatch.value, '33%');
  assert.equal(FIXTURE_SCENARIOS[0].gold.companyBasic.tickerCode.value, '01234');
});

test('date rule points to the grantee that actually violates the plan date', () => {
  const result = minimalResult();
  result.esopPlan.adoptionDate = field('2024-01-01', 'high', '采纳日');
  result.grantees.push(minimalResult().grantees[0]);
  result.grantees[1].grantDate = field('2023-12-31', 'high', '授予日');
  const warnings = runValidation(result);
  assert.equal(warnings['grantees[0].grantDate'], undefined);
  assert.match(warnings['grantees[1].grantDate'], /日期倒置/);
});

function makeStorage(values) {
  const data = new Map(Object.entries(values));
  return {
    get length() { return data.size; },
    key(index) { return [...data.keys()][index] || null; },
    getItem(key) { return data.has(key) ? data.get(key) : null; },
    setItem(key, value) { data.set(key, String(value)); },
    removeItem(key) { data.delete(key); },
    snapshot() { return Object.fromEntries(data.entries()); },
  };
}
