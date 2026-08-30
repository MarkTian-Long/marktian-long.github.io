const test = require('node:test');
const assert = require('node:assert/strict');

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
  assert.equal(model.meta.reviewCycleDays, 90);
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

test('framework facts carry official source, checked date and freshness policy', () => {
  assertImplementationLoaded();
  for (const fact of model.frameworkFacts) {
    assert.ok(fact.name);
    assert.ok(fact.claim);
    assert.ok(['active', 'experimental', 'successor', 'platform'].includes(fact.status));
    assert.equal(fact.source.type, 'official-doc');
    assert.match(fact.source.url, /^https:\/\//);
    assert.match(fact.source.checkedAt, /^2026-08-30$/);
    assert.equal(fact.reviewAfterDays, 90);
    assert.ok(fact.source.id);
  }

  assert.equal(getFrameworkFreshness(model.frameworkFacts[0], '2026-11-29').state, 'review');
  assert.equal(getFrameworkFreshness(model.frameworkFacts[0], '2027-03-01').state, 'expired');
});

test('all public metrics declare an allowed kind, definition, source and date', () => {
  assertImplementationLoaded();
  for (const record of [...model.scenes, ...model.architectures]) {
    for (const metric of record.metrics || []) {
      assert.equal(VALID_METRIC_KINDS.has(metric.kind), true, `${record.id} has invalid metric kind`);
      assert.ok(metric.definition, `${record.id} metric needs a definition`);
      assert.ok(metric.source, `${record.id} metric needs a source`);
      assert.match(metric.asOf, /^2026-08-30$/, `${record.id} metric needs an asOf date`);
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
  assert.equal(result.outcomeId, 'no-agent');
  assert.equal(result.modeId, 'automation');
  assert.equal(result.requiresAgent, false);
  assert.ok(result.hitRules.length > 0);
  assert.ok(result.excludedAlternatives.length > 0);
  assert.ok(result.normalPath.length >= 3);
  assert.ok(result.failureFallback.length >= 2);
  assert.ok(result.stopConditions.length >= 2);
});

test('engine distinguishes retrieval, single-agent and independent parallel work', () => {
  assertImplementationLoaded();
  const retrieval = evaluateDecision({ ...ANSWERS, knowledge: 'retrieval' }, { now: '2026-08-30' });
  assert.equal(retrieval.modeId, 'rag-assistant');

  const single = evaluateDecision({ ...ANSWERS, knowledge: 'judgment', decomposition: 'dependent' }, { now: '2026-08-30' });
  assert.equal(single.modeId, 'single-agent-tools');

  const parallel = evaluateDecision({ ...ANSWERS, knowledge: 'judgment', decomposition: 'independent' }, { now: '2026-08-30' });
  assert.equal(parallel.modeId, 'parallel-multi-agent');
  assert.equal(parallel.requiresMultipleIndependentSubtasks, true);
  assert.equal(parallel.excludedAlternatives.some((item) => item.id === 'single-agent-tools'), true);

  const dependent = evaluateDecision({ ...ANSWERS, knowledge: 'judgment', decomposition: 'dependent' }, { now: '2026-08-30' });
  assert.equal(dependent.modeId === 'parallel-multi-agent', false);
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
