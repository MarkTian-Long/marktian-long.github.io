'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const test = require('node:test');

const repoRoot = path.resolve(__dirname, '..');
const generatorPath = path.join(repoRoot, 'tools', 'service-agent', 'gen_index.js');
const artifactPath = path.join(repoRoot, 'tools', 'service-agent', 'index.html');

function readSource() {
  return fs.readFileSync(generatorPath, 'utf8');
}

function readArtifact() {
  return fs.readFileSync(artifactPath, 'utf8');
}

function readPublicData() {
  const match = readArtifact().match(/<script type="application\/json" id="service-agent-data">([\s\S]*?)<\/script>/);
  const raw = match && match[1];
  assert.ok(raw, 'generated artifact must expose its structured public data');
  return JSON.parse(raw);
}

function runGeneratorWithTemporaryArtifact(content) {
  const temporaryRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'service-agent-depth-'));
  const temporaryGeneratorPath = path.join(temporaryRoot, 'gen_index.js');
  const temporaryArtifactPath = path.join(temporaryRoot, 'index.html');
  fs.copyFileSync(generatorPath, temporaryGeneratorPath);
  fs.writeFileSync(temporaryArtifactPath, content, 'utf8');

  try {
    return spawnSync(process.execPath, [temporaryGeneratorPath, '--check'], {
      cwd: repoRoot,
      encoding: 'utf8',
    });
  } finally {
    fs.rmSync(temporaryRoot, { recursive: true, force: true });
  }
}

test('service-agent keeps the mock boundary visible in the first screen', () => {
  const source = readSource();
  const artifact = readArtifact();

  assert.match(source, /const DEMO_META\s*=/);
  assert.match(source, /realParts/);
  assert.match(source, /mockParts/);
  assert.match(source, /limitations/);
  assert.doesNotMatch(artifact, /跑一遍真实对话链路|跑真实对话/);
  assert.match(artifact, /完整模拟链路/);
  assert.match(artifact, /真实部分/);
  assert.match(artifact, /Mock/);
  assert.match(artifact, /data-testid="demo-trust-boundary"/);
});

test('each scenario has a distinct four-field acceptance card', () => {
  const data = readPublicData();
  const expectedFields = ['successMetric', 'hardGuardrail', 'costConstraint', 'hitlPolicy'];
  const scenarioKeys = ['bank', 'ecom', 'startup'];

  assert.deepEqual(Object.keys(data.scenarios), scenarioKeys);
  for (const key of scenarioKeys) {
    const acceptance = data.scenarios[key].acceptance;
    assert.deepEqual(Object.keys(acceptance), expectedFields, key);
    for (const field of expectedFields) {
      assert.ok(['target', 'proxy'].includes(acceptance[field].kind), `${key}.${field} kind`);
      assert.ok(acceptance[field].description, `${key}.${field} description`);
    }
  }

  const renderedFields = readArtifact().match(/data-acceptance-key="(?:successMetric|hardGuardrail|costConstraint|hitlPolicy)"/g) || [];
  assert.equal(renderedFields.length, expectedFields.length);
  assert.match(readArtifact(), /function renderAcceptanceCard\s*\(/);
  assert.match(readArtifact(), /function selectScenario\s*\(/);
});

test('every scene defines four fault classes with distinct outcomes and a hard SQL boundary', () => {
  const data = readPublicData();
  const expectedFaults = ['stale-knowledge', 'prompt-injection', 'unauthorized-data', 'low-confidence-intent'];

  for (const [scenarioKey, faultCases] of Object.entries(data.faultCases)) {
    assert.deepEqual(Object.keys(faultCases), expectedFaults, scenarioKey);
    const outcomes = new Set();
    for (const [faultKey, fault] of Object.entries(faultCases)) {
      assert.ok(fault.input, `${scenarioKey}.${faultKey} input`);
      assert.ok(fault.triggerNode, `${scenarioKey}.${faultKey} triggerNode`);
      assert.ok(fault.expectedGuardrail, `${scenarioKey}.${faultKey} expectedGuardrail`);
      assert.ok(fault.expectedOutcome, `${scenarioKey}.${faultKey} expectedOutcome`);
      assert.ok(['low', 'medium', 'high', 'critical'].includes(fault.riskLevel), `${scenarioKey}.${faultKey} riskLevel`);
      outcomes.add(fault.expectedOutcome);
    }
    assert.equal(outcomes.size, expectedFaults.length, `${scenarioKey} fault outcomes must differ`);
    assert.equal(faultCases['unauthorized-data'].triggerNode, 'sql');
    assert.match(faultCases['unauthorized-data'].expectedGuardrail, /权限|授权/);
  }

  const artifact = readArtifact();
  assert.match(artifact, /id="fault-select"/);
  assert.match(artifact, /function runFaultCase\s*\(/);
  assert.match(artifact, /无权限|权限拦截/);
});

test('run review and export contracts carry trace data without invented performance claims', () => {
  const source = readSource();
  const artifact = readArtifact();
  const data = readPublicData();

  assert.equal(data.decisionCards.length, 9);
  const numericEvidence = data.decisionCards
    .map((card) => card.evidence)
    .filter((evidence) => evidence && /\d/.test(evidence.text));
  assert.ok(numericEvidence.length > 0, 'fixture should exercise external numeric evidence');
  for (const evidence of numericEvidence) {
    assert.equal(evidence.kind, 'external-research');
    assert.ok(evidence.sourceDate);
    assert.match(evidence.href, /^https:\/\//);
  }

  assert.match(source, /var runTrace\s*=|let runTrace\s*=/);
  assert.match(source, /function renderRunReview\s*\(/);
  assert.match(source, /function exportRunData\s*\(/);
  assert.match(source, /hitlActions/);
  assert.match(source, /pendingHumanItems/);
  assert.doesNotMatch(artifact, /准确率提升|节省成本|耗时\s*\d/);
  assert.match(artifact, /id="run-review"/);
  assert.match(artifact, /id="export-run-btn"/);
  assert.match(artifact, /id="service-agent-data"/);
});

test('the generated public artifact is current under the generator check mode', () => {
  const result = spawnSync(process.execPath, [generatorPath, '--check'], {
    cwd: repoRoot,
    encoding: 'utf8',
  });
  assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
  assert.match(`${result.stdout}${result.stderr}`, /check: public artifact is current/);
});

test('generator check accepts CRLF and CR artifacts without changing generated content', () => {
  const artifact = readArtifact();
  const artifactBefore = fs.readFileSync(artifactPath);
  const normalizedArtifact = artifact.replace(/\r\n?/g, '\n');

  for (const lineEnding of ['\r\n', '\r']) {
    const lineEndingArtifact = normalizedArtifact.replace(/\n/g, lineEnding);
    const result = runGeneratorWithTemporaryArtifact(lineEndingArtifact);
    assert.equal(result.status, 0, `${lineEnding === '\r' ? 'CR' : 'CRLF'}\n${result.stdout}\n${result.stderr}`);
    assert.match(`${result.stdout}${result.stderr}`, /check: public artifact is current/);
  }

  assert.deepEqual(fs.readFileSync(artifactPath), artifactBefore);
});
