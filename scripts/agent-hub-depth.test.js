const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

function loadModule(relativePath) {
  try {
    return require(relativePath);
  } catch (error) {
    if (relativePath.includes('decision-model')) {
      return {
        __loadError: error,
        meta: {},
        questions: [],
        outcomes: [],
        decisionRules: [],
        architectures: [],
        scenes: [],
        judgments: [],
        frameworkFacts: [],
      };
    }
    return {
      __loadError: error,
      evaluateDecision: () => ({ status: 'missing-implementation' }),
      getFrameworkFreshness: () => ({ state: 'missing-implementation' }),
    };
  }
}

const model = loadModule('../tools/agent-hub/data/decision-model.js');
const engine = loadModule('../tools/agent-hub/decision-engine.js');
const { evaluateDecision, getFrameworkFreshness } = engine;

const VALID_METRIC_KINDS = new Set([
  'target',
  'proxy',
  'offline-measured',
  'production-result',
  'external-research',
]);

const ANSWERS = Object.freeze({
  taskClarity: 'clear',
  repeatability: 'recurring',
  knowledge: 'rules',
  decomposition: 'single',
  risk: 'low',
  evaluation: 'measurable',
});

function assertImplementationLoaded() {
  assert.equal(model.__loadError, undefined);
  assert.equal(engine.__loadError, undefined);
}

function assertStableIds(records, label) {
  const ids = records.map((record) => record.id);
  assert.equal(new Set(ids).size, ids.length, `${label} IDs must be unique`);
  ids.forEach((id) => assert.match(id, /^[a-z][a-zA-Z0-9]*(?:-[a-zA-Z0-9]+)*$/, `${label} ID is not parseable: ${id}`));
}

test('decision model exposes the planned six-question contract and six content sets', () => {
  assertImplementationLoaded();
  assert.equal(model.meta.id, 'agent-hub-depth-2026-08-30');
  assert.equal(model.questions.length, 6);
  assert.equal(model.outcomes.length, 6);
  assert.equal(model.decisionRules.length >= 8, true);
  assert.equal(model.architectures.length, 4);
  assert.equal(model.scenes.length, 6);
  assert.equal(model.judgments.length, 6);
  assert.equal(model.frameworkFacts.length, 6);

  assertStableIds(model.questions, 'question');
  assertStableIds(model.outcomes, 'outcome');
  assertStableIds(model.decisionRules, 'rule');
  assertStableIds(model.architectures, 'architecture');
  assertStableIds(model.scenes, 'scene');
  assertStableIds(model.judgments, 'judgment');
  assertStableIds(model.frameworkFacts, 'framework');

  for (const question of model.questions) {
    assert.ok(question.prompt);
    assert.ok(question.helper);
    assert.ok(question.options.length >= 2);
    assertStableIds(question.options, `option:${question.id}`);
  }
});

test('model rules cover no-agent, automation, retrieval, single-agent, parallel and human review outcomes', () => {
  assertImplementationLoaded();
  const coveredModes = new Set(model.decisionRules.flatMap((rule) => rule.thenModes || []));
  for (const mode of [
    'no-agent',
    'automation',
    'rag-assistant',
    'single-agent-tools',
    'parallel-multi-agent',
    'human-review',
  ]) {
    assert.equal(coveredModes.has(mode), true, `missing rule coverage for ${mode}`);
  }
  assert.equal(model.decisionRules.some((rule) => /independent/i.test(rule.when)), true);
  assert.equal(model.decisionRules.some((rule) => /preview|预览/i.test(rule.explanation)), true);
  assert.equal(model.decisionRules.some((rule) => /撤回|insufficient|不完整/i.test(rule.explanation)), true);
});

test('framework references carry archive date and pending manual fact-check status', () => {
  assertImplementationLoaded();
  assert.equal(model.meta.frameworkEvidenceStatus, 'archive-only');
  for (const fact of model.frameworkFacts) {
    assert.ok(fact.name);
    assert.ok(fact.claim);
    assert.equal(fact.status, 'unverified');
    assert.equal(fact.source.type, 'candidate-official-url');
    assert.match(fact.source.url, /^https:\/\//);
    assert.match(fact.source.archivedAt, /^2026-08-30$/);
    assert.equal(fact.source.verificationStatus, '待人工事实复核');
    assert.equal(fact.reviewAfterDays, undefined);
    assert.equal(fact.currentRecommendation, undefined);
    assert.doesNotMatch(fact.claim, /官方文档|官方仓库/);
    assert.ok(fact.source.id);
  }

  const freshness = getFrameworkFreshness(model.frameworkFacts[0], '2027-03-01');
  assert.equal(freshness.state, 'archive-only');
  assert.equal(freshness.label, '待人工事实复核');
  assert.equal(freshness.currentRecommendation, false);

  const readme = fs.readFileSync(path.join(__dirname, '..', 'tools/agent-hub/README.md'), 'utf8');
  assert.match(readme, /档案整理日期/);
  assert.match(readme, /待人工事实复核/);
  assert.doesNotMatch(readme, /按官方文档核对/);
});

test('all public metrics separate definition date from unmeasured runtime evidence', () => {
  assertImplementationLoaded();
  for (const record of [...model.scenes, ...model.architectures]) {
    for (const metric of record.metrics || []) {
      assert.equal(VALID_METRIC_KINDS.has(metric.kind), true, `${record.id} has invalid metric kind`);
      assert.ok(metric.definition, `${record.id} metric needs a definition`);
      assert.ok(metric.source, `${record.id} metric needs a source`);
      assert.match(metric.definitionAsOf, /^2026-08-30$/, `${record.id} metric needs a definitionAsOf date`);
      assert.equal(metric.measuredAt, null, `${record.id} metric must not imply an unmeasured result`);
      assert.equal(Object.prototype.hasOwnProperty.call(metric, 'asOf'), false, `${record.id} metric must not use ambiguous asOf`);
    }
  }
  const serialized = JSON.stringify(model);
  assert.equal(serialized.includes('247k'), false);
  assert.equal(serialized.includes('40%'), false);
  assert.equal(serialized.includes('ROI 结果'), false);
});

test('scene presets contain six valid answers and required ownership and stop details', () => {
  assertImplementationLoaded();
  const questionIds = new Set(model.questions.map((question) => question.id));
  for (const scene of model.scenes) {
    assert.equal(Object.keys(scene.presetAnswers).length, 6, `${scene.id} preset is incomplete`);
    for (const questionId of questionIds) {
      assert.ok(scene.presetAnswers[questionId], `${scene.id} misses ${questionId}`);
    }
    assert.ok(scene.inputAssumptions.length >= 2);
    assert.ok(scene.humanResponsibility.length >= 2);
    assert.ok(scene.measurementMethod);
    assert.ok(scene.stopConditions.length >= 2);
  }
});

test('topologies and judgments explain fit, failure, human control, and counter-evidence', () => {
  assertImplementationLoaded();
  for (const topology of model.architectures) {
    assert.ok(topology.suitableWhen.length >= 2);
    assert.ok(topology.notSuitableWhen.length >= 2);
    assert.ok(topology.failurePropagation);
    assert.ok(topology.retryBoundary);
    assert.ok(topology.stopBoundary);
    assert.ok(topology.hitl);
    assert.ok(topology.minimumObservability.length >= 3);
  }
  for (const judgment of model.judgments) {
    assert.ok(['design-principle', 'hypothesis'].includes(judgment.kind));
    assert.ok(judgment.appliesWhen);
    assert.ok(judgment.decisionRule);
    assert.ok(judgment.evidence);
    assert.ok(judgment.counterexample);
    assert.ok(judgment.newEvidenceNeeded);
  }
});

test('engine returns traditional automation for a clear deterministic task', () => {
  assertImplementationLoaded();
  const result = evaluateDecision(ANSWERS, { now: '2026-08-30' });
  assert.equal(result.status, 'ready');
  assert.equal(result.outcomeId, 'automation');
  assert.equal(result.modeId, 'automation');
  assert.equal(result.requiresAgent, false);
  assert.ok(result.hitRules.length > 0);
  assert.ok(result.excludedAlternatives.length > 0);
  assert.ok(result.normalPath.length >= 3);
  assert.ok(result.failureFallback.length >= 2);
  assert.ok(result.stopConditions.length >= 2);
});

test('engine fails closed for unresolved answers in the six-question gate', () => {
  assertImplementationLoaded();
  const cases = [
    ['taskClarity', 'unclear'],
    ['repeatability', 'unknown'],
    ['decomposition', 'unknown'],
  ];

  for (const [questionId, value] of cases) {
    const result = evaluateDecision({ ...ANSWERS, [questionId]: value }, { now: '2026-08-30' });
    assert.equal(result.status, 'needs-input', `${questionId}=${value} must need input`);
    assert.equal(result.modeId, 'human-review', `${questionId}=${value} must route to human review`);
    assert.equal(result.outcomeId, 'human-review', `${questionId}=${value} must identify the human-review outcome`);
    assert.equal(result.requiresAgent, false, `${questionId}=${value} must not require an agent`);
    assert.equal(result.hitRules.some((rule) => rule.id === 'input-incomplete'), true, `${questionId}=${value} must hit input-incomplete`);
    assert.equal(result.excludedAlternatives.some((item) => item.id === 'automation'), true, `${questionId}=${value} must explain traditional automation as an alternative`);
    assert.equal(result.excludedAlternatives.some((item) => item.id === 'human-review'), false, `${questionId}=${value} must not exclude its selected fallback`);
  }
});

test('engine distinguishes retrieval, single-agent and independent parallel work', () => {
  assertImplementationLoaded();
  const retrieval = evaluateDecision({ ...ANSWERS, knowledge: 'retrieval' }, { now: '2026-08-30' });
  assert.equal(retrieval.modeId, 'rag-assistant');
  assert.equal(retrieval.outcomeId, 'rag-assistant');

  const single = evaluateDecision({ ...ANSWERS, knowledge: 'judgment', decomposition: 'dependent' }, { now: '2026-08-30' });
  assert.equal(single.modeId, 'single-agent-tools');

  const parallel = evaluateDecision({ ...ANSWERS, knowledge: 'judgment', decomposition: 'independent' }, { now: '2026-08-30' });
  assert.equal(parallel.modeId, 'parallel-multi-agent');
  assert.equal(parallel.outcomeId, 'parallel-multi-agent');
  assert.equal(parallel.requiresMultipleIndependentSubtasks, true);
  assert.equal(parallel.excludedAlternatives.some((item) => item.id === 'single-agent-tools'), true);
  assert.equal(parallel.excludedAlternatives.some((item) => item.id === 'human-review'), false);

  const dependent = evaluateDecision({ ...ANSWERS, knowledge: 'judgment', decomposition: 'dependent' }, { now: '2026-08-30' });
  assert.equal(dependent.modeId === 'parallel-multi-agent', false);
});

test('rules-based independent work stays in traditional automation or workflow', () => {
  assertImplementationLoaded();
  const cases = [
    ['single', 'automation'],
    ['independent', 'automation'],
  ];

  for (const [decomposition, expectedMode] of cases) {
    const result = evaluateDecision({ ...ANSWERS, decomposition }, { now: '2026-08-30' });
    assert.equal(result.modeId, expectedMode, `rules + ${decomposition} should not become multi-agent`);
    assert.equal(result.outcomeId, 'automation');
    assert.equal(result.requiresAgent, false);
    assert.equal(result.hitRules.some((rule) => rule.id === 'deterministic-automation'), true);
    assert.equal(result.hitRules.some((rule) => rule.id === 'parallel-independent-only'), false);
  }
});

test('high-risk rules-based independent work fails closed instead of using multi-agent', () => {
  assertImplementationLoaded();
  const cases = [
    ['high', 'human-review'],
    ['irreversible', 'human-review'],
  ];

  for (const [risk, expectedMode] of cases) {
    const result = evaluateDecision({ ...ANSWERS, risk, decomposition: 'independent' }, { now: '2026-08-30' });
    assert.equal(result.modeId, expectedMode, `rules + independent + ${risk} must not use multi-agent`);
    assert.equal(result.outcomeId, 'human-review');
    assert.equal(result.requiresAgent, false);
    assert.equal(result.requiresMultipleIndependentSubtasks, false);
    assert.equal(result.hitRules.some((rule) => rule.id === 'parallel-independent-only'), false);
  }
});

test('medium risk and partial evaluation expose sampling and approval controls', () => {
  assertImplementationLoaded();
  const cases = [
    { risk: 'medium', evaluation: 'measurable', knowledge: 'rules', decomposition: 'single' },
    { risk: 'low', evaluation: 'partial', knowledge: 'judgment', decomposition: 'dependent' },
    { risk: 'medium', evaluation: 'partial', knowledge: 'judgment', decomposition: 'dependent' },
  ];

  for (const overrides of cases) {
    const result = evaluateDecision({ ...ANSWERS, ...overrides }, { now: '2026-08-30' });
    assert.equal(result.requiresHumanApproval, true, `${JSON.stringify(overrides)} must require human approval`);
    assert.equal(result.controls.preview, true, `${JSON.stringify(overrides)} must enable preview`);
    assert.equal(result.controls.hitl, true, `${JSON.stringify(overrides)} must enable HITL`);
    assert.equal(result.controls.audit, true, `${JSON.stringify(overrides)} must enable audit`);
    assert.equal(result.controls.sampling, true, `${JSON.stringify(overrides)} must enable sampling`);
    assert.equal(result.controls.approval, true, `${JSON.stringify(overrides)} must enable approval`);
    assert.match(result.hitl.join(' '), /抽检|审批|接管/);
  }
});

test('every complete six-question combination preserves mode identity and rules fail closed', () => {
  assertImplementationLoaded();
  const combinations = model.questions.reduce((sets, question) => sets.flatMap((answers) => question.options.map((option) => ({
    ...answers,
    [question.id]: option.id,
  }))), [{}]);
  const agentModes = new Set(['rag-assistant', 'single-agent-tools', 'parallel-multi-agent']);

  assert.equal(combinations.length, 864);
  for (const answers of combinations) {
    const result = evaluateDecision(answers, { now: '2026-08-30' });
    assert.equal(result.outcomeId, result.modeId, `outcomeId must identify the selected mode for ${JSON.stringify(answers)}`);
    assert.equal(result.requiresAgent, agentModes.has(result.modeId), `requiresAgent must match mode for ${JSON.stringify(answers)}`);
    assert.equal(result.requiresMultipleIndependentSubtasks, result.modeId === 'parallel-multi-agent', `parallel flag must match mode for ${JSON.stringify(answers)}`);
    assert.equal(result.excludedAlternatives.some((item) => item.id === result.modeId), false, `selected mode cannot be excluded for ${JSON.stringify(answers)}`);
    if (answers.knowledge === 'rules') {
      assert.equal(agentModes.has(result.modeId), false, `rules knowledge must never enter an Agent mode: ${JSON.stringify(answers)}`);
      assert.equal(result.requiresAgent, false, `rules knowledge must not require an Agent: ${JSON.stringify(answers)}`);
    }
  }
});

test('hit rules are returned in ascending priority order', () => {
  assertImplementationLoaded();
  const result = evaluateDecision({
    ...ANSWERS,
    knowledge: 'judgment',
    decomposition: 'dependent',
    repeatability: 'one-off',
    risk: 'irreversible',
    evaluation: 'partial',
  }, { now: '2026-08-30' });
  const priorities = result.hitRules.map((rule) => rule.priority);
  assert.ok(priorities.length >= 2);
  assert.deepEqual(priorities, priorities.slice().sort((left, right) => left - right));
  assert.equal(result.hitRules[0].priority, Math.min(...priorities));
  assert.equal(result.hitRules.some((rule) => rule.id === 'high-risk-controls'), true);
});

test('human review remains a visible fallback rather than an excluded alternative', () => {
  assertImplementationLoaded();
  const cases = [
    { ...ANSWERS },
    { ...ANSWERS, knowledge: 'retrieval', decomposition: 'dependent' },
    { ...ANSWERS, knowledge: 'judgment', decomposition: 'independent' },
  ];
  for (const answers of cases) {
    const result = evaluateDecision(answers, { now: '2026-08-30' });
    assert.equal(result.excludedAlternatives.some((item) => item.id === 'human-review'), false, `${JSON.stringify(answers)} must keep human review available`);
  }
});

test('excluded alternative reasons come from the rule that excludes each outcome', () => {
  assertImplementationLoaded();
  const result = evaluateDecision({ ...ANSWERS, knowledge: 'retrieval', decomposition: 'dependent' }, { now: '2026-08-30' });
  const excludedParallel = result.excludedAlternatives.find((item) => item.id === 'parallel-multi-agent');
  const retrievalRule = model.decisionRules.find((rule) => rule.id === 'retrieval-assistant');

  assert.ok(excludedParallel);
  assert.ok(retrievalRule);
  assert.equal(excludedParallel.reason, retrievalRule.explanation);
});

test('engine forces preview, HITL, audit and stop conditions for high-risk or irreversible actions', () => {
  assertImplementationLoaded();
  const result = evaluateDecision({
    ...ANSWERS,
    knowledge: 'judgment',
    decomposition: 'dependent',
    risk: 'irreversible',
  }, { now: '2026-08-30' });
  assert.equal(result.status, 'ready');
  assert.equal(result.controls.preview, true);
  assert.equal(result.controls.hitl, true);
  assert.equal(result.controls.audit, true);
  assert.equal(result.controls.stopConditions, true);
  assert.equal(result.requiresHumanApproval, true);
  assert.match(result.normalPath.join(' '), /预览|preview/i);
});

test('engine withdraws an automatic recommendation for missing or contradictory input', () => {
  assertImplementationLoaded();
  const missing = evaluateDecision({ taskClarity: 'clear' }, { now: '2026-08-30' });
  assert.equal(missing.status, 'needs-input');
  assert.equal(missing.requiresAgent, false);
  assert.equal(missing.modeId, 'human-review');
  assert.ok(missing.missingQuestions.length >= 5);

  const contradictory = evaluateDecision({
    ...ANSWERS,
    taskClarity: 'unclear',
    risk: 'irreversible',
  }, { now: '2026-08-30' });
  assert.equal(contradictory.status, 'needs-input');
  assert.ok(contradictory.contradictions.length > 0);
  assert.equal(contradictory.modeId, 'human-review');
});

test('same answers and evaluation date produce the same explainable decision', () => {
  assertImplementationLoaded();
  const first = evaluateDecision({ ...ANSWERS, knowledge: 'judgment' }, { now: '2026-08-30' });
  const second = evaluateDecision({ ...ANSWERS, knowledge: 'judgment' }, { now: '2026-08-30' });
  assert.deepEqual(second, first);
});

test('framework dates fail closed for invalid, missing and future archive dates', () => {
  assertImplementationLoaded();
  const cases = [
    ['2026-02-30', '2026-08-31', '资料日期不可用'],
    ['invalid', '2026-08-31', '资料日期不可用'],
    [undefined, '2026-08-31', '资料日期不可用'],
    ['2026-09-01', '2026-08-31', '整理日期在未来'],
  ];

  for (const [archivedAt, now, expectedLabel] of cases) {
    const freshness = getFrameworkFreshness({ source: { archivedAt } }, now);
    assert.equal(freshness.state, 'unavailable', `${String(archivedAt)} must be unavailable`);
    assert.match(freshness.label, new RegExp(expectedLabel));
    assert.match(freshness.label, /待人工事实复核/);
    assert.equal(freshness.currentRecommendation, false);
  }

  assert.equal(getFrameworkFreshness({ source: { archivedAt: '2026-02-30' } }, '2026-08-31').archivedAt, null);
});

test('engine uses the current date when no evaluation date is supplied', () => {
  assertImplementationLoaded();
  const RealDate = Date;
  class ControlledDate extends RealDate {
    constructor(...args) {
      super(...(args.length ? args : ['2031-04-04T16:05:00Z']));
    }
  }

  let result;
  global.Date = ControlledDate;
  try {
    result = evaluateDecision(ANSWERS);
  } finally {
    global.Date = RealDate;
  }
  assert.equal(result.evaluatedAt, '2031-04-05');
  assert.equal(result.metrics.every((metric) => metric.definitionAsOf === '2026-08-30'), true);
  assert.equal(result.metrics.every((metric) => metric.measuredAt === null), true);
  assert.equal(result.metrics.some((metric) => Object.prototype.hasOwnProperty.call(metric, 'asOf')), false);
  assert.notEqual(result.evaluatedAt, result.metrics[0].definitionAsOf);
});
