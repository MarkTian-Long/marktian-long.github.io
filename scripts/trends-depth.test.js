'use strict';

const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const { execFileSync, spawnSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const repoRoot = path.resolve(__dirname, '..');
const contract = require(path.join(repoRoot, 'tools', 'trends', 'contract.js'));
const generator = require(path.join(repoRoot, 'scripts', 'fetch-trends.js'));
const scriptsRoot = path.join(repoRoot, 'scripts');
const publicDataPath = path.join(repoRoot, 'tools', 'trends', 'data', 'trends.json');

function sha256(filePath) {
  return crypto.createHash('sha256').update(fs.readFileSync(filePath)).digest('hex');
}

function runCli(args) {
  return execFileSync(process.execPath, ['fetch-trends.js', ...args], {
    cwd: scriptsRoot,
    encoding: 'utf8',
  });
}

function failCli(args) {
  return spawnSync(process.execPath, ['fetch-trends.js', ...args], {
    cwd: scriptsRoot,
    encoding: 'utf8',
  });
}

const SOURCE = Object.freeze({
  id: 'source-example',
  name: 'Example Source',
  url: 'https://example.com/board',
  as_of: '2026-08-30',
});

function validItem(overrides = {}) {
  return {
    id: 'signal-example',
    rank: 1,
    title: 'Example signal',
    summary: 'A concrete signal summary.',
    url: 'https://example.com/signals/example',
    source_id: SOURCE.id,
    observed_at: '2026-08-30',
    verification_level: 'manual_reviewed',
    actions: ['watch', 'deep_dive'],
    tags: ['AI'],
    metrics: [{
      label: 'Observed score',
      value: '42',
      definition: 'The source-reported score at observation time.',
      kind: 'external-research',
      as_of: '2026-08-30',
      source_url: 'https://example.com/signals/example',
      caveat: 'The score is not a cross-platform comparison.',
    }],
    judgment: {
      change: 'The signal moved from experiment to active adoption.',
      evidence: ['The source reports a concrete release and usage change.'],
      impact: 'Product teams should watch the workflow boundary.',
      uncertainty: 'The source does not establish durable retention.',
      next_step: 'Compare the next release with the current workflow.',
      next_question: 'Does adoption persist outside the launch window?',
    },
    ...overrides,
  };
}

function validSnapshot(overrides = {}) {
  return {
    contract_version: 2,
    snapshot_id: 'trends-2026-08-30-example',
    snapshot_status: 'current',
    as_of: '2026-08-30',
    observed_at: '2026-08-30',
    reviewed_at: '2026-08-30',
    collection_mode: 'manual_reviewed',
    verification_level: 'manual_reviewed',
    review_scope: 'structure_only',
    facts_verified_at: null,
    featured_id: 'signal-example',
    boards: [{
      id: 'example-board',
      title: 'Example board',
      icon: '⚡',
      intro: 'A board introduction.',
      ranking_basis: 'Ranked by the source-reported score.',
      source: SOURCE,
      items: [validItem()],
    }],
    method: {
      freshness_policy: '0-7 days current; 8-30 days review; over 30 days historical.',
      collection_boundary: 'Network discovery only creates candidates; public snapshots require reviewed JSON.',
      limitation: 'Historical records are not rechecked in this round.',
      evidence_policy: 'When review_scope=structure_only, judgment.evidence is a source summary or historical observation record, not independent factual evidence.',
    },
    ...overrides,
  };
}

test('published trends data satisfies the v2 snapshot contract', () => {
  const dataPath = path.join(repoRoot, 'tools', 'trends', 'data', 'trends.json');
  const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  assert.doesNotThrow(() => contract.assertValidSnapshot(data, { now: '2026-08-30' }));
  assert.equal(data.contract_version, 2);
  assert.equal(typeof data.snapshot_id, 'string');
  assert.equal(typeof data.collection_mode, 'string');
  assert.equal(typeof data.featured_id, 'string');
  assert.equal(data.review_scope, 'structure_only');
  assert.equal(data.facts_verified_at, null);
  assert.match(data.method.evidence_policy, /历史观察记录|非独立证据/);
});

test('v2 validation requires stable ids, review metadata, source time, ranking basis and judgement fields', () => {
  const snapshot = validSnapshot();
  assert.doesNotThrow(() => contract.assertValidSnapshot(snapshot, { now: '2026-08-30' }));

  for (const field of ['snapshot_id', 'observed_at', 'reviewed_at', 'collection_mode', 'verification_level']) {
    const broken = validSnapshot({ [field]: undefined });
    assert.throws(() => contract.assertValidSnapshot(broken), new RegExp(field));
  }

  assert.throws(() => contract.assertValidSnapshot(validSnapshot({ featured_id: 'missing' })), /featured_id/);
  const historical = validSnapshot({
    as_of: '2026-05-19',
    observed_at: '2026-05-19',
    reviewed_at: '2026-05-19',
    snapshot_status: 'current',
    boards: [{
      ...validSnapshot().boards[0],
      source: { ...SOURCE, as_of: '2026-05-19' },
      items: [validItem({
        observed_at: '2026-05-19',
        metrics: [{ ...validItem().metrics[0], as_of: '2026-05-19' }],
      })],
    }],
  });
  const historicalResult = contract.assertValidSnapshot(historical, { now: '2026-08-30' });
  assert.equal(historicalResult.freshness.status, 'historical');
  assert.match(historicalResult.warnings.join(' '), /snapshot_status|freshness/i);
  assert.throws(() => contract.assertValidSnapshot(validSnapshot({
    boards: [{ ...validSnapshot().boards[0], ranking_basis: '' }],
  })), /ranking_basis/);
  assert.throws(() => contract.assertValidSnapshot(validSnapshot({
    boards: [{
      ...validSnapshot().boards[0],
      items: [validItem({ judgment: { ...validItem().judgment, impact: '' } })],
    }],
  })), /judgment.*impact/i);
});

test('review scope separates structure checks from fact verification', () => {
  assert.doesNotThrow(() => contract.assertValidSnapshot(validSnapshot()));
  assert.throws(() => contract.assertValidSnapshot(validSnapshot({ review_scope: undefined })), /review_scope/i);
  assert.throws(() => contract.assertValidSnapshot(validSnapshot({
    facts_verified_at: '2026-08-30',
  })), /facts_verified_at|review scope|结构/i);
  assert.throws(() => contract.assertValidSnapshot(validSnapshot({
    review_scope: 'facts_verified',
    facts_verified_at: null,
  })), /facts_verified_at|fact|事实/i);
  assert.throws(() => contract.assertValidSnapshot(validSnapshot({
    method: {
      ...validSnapshot().method,
      evidence_policy: 'judgment.evidence is independent factual evidence.',
    },
  })), /evidence|观察|独立/i);
  assert.doesNotThrow(() => contract.assertValidSnapshot(validSnapshot({
    review_scope: 'facts_verified',
    facts_verified_at: '2026-08-30',
    method: {
      ...validSnapshot().method,
      evidence_policy: 'judgment.evidence records fact-checked source support, not causal proof.',
    },
  })));
  assert.throws(() => contract.assertValidSnapshot(validSnapshot({
    review_scope: 'facts_verified',
    facts_verified_at: '2026-08-31',
    method: {
      ...validSnapshot().method,
      evidence_policy: 'judgment.evidence records fact-checked source support, not causal proof.',
    },
  }), { now: '2026-09-01' }), /facts_verified_at.*reviewed_at|later|晚于/i);
});

test('metrics require a legal kind, explicit as_of and an HTTPS source URL', () => {
  const metric = validItem().metrics[0];
  assert.ok(contract.VALID_METRIC_KINDS.includes(metric.kind));

  for (const patch of [
    { kind: 'made-up-kind' },
    { as_of: '' },
    { source_url: 'javascript:alert(1)' },
    { source_url: 'https://example.com/signals/example', definition: '' },
  ]) {
    const broken = validSnapshot({
      boards: [{
        ...validSnapshot().boards[0],
        items: [validItem({ metrics: [{ ...metric, ...patch }] })],
      }],
    });
    assert.throws(() => contract.assertValidSnapshot(broken), /metric|kind|as_of|source_url|definition/i);
  }
});

test('deep dive actions require a next research question and item ids stay unique', () => {
  const item = validItem({
    judgment: { ...validItem().judgment, next_question: '' },
  });
  assert.throws(() => contract.assertValidSnapshot(validSnapshot({
    boards: [{ ...validSnapshot().boards[0], items: [item] }],
  })), /next_question/);

  const duplicate = validSnapshot({
    boards: [{
      ...validSnapshot().boards[0],
      items: [validItem(), validItem({ id: 'signal-other' })],
    }],
  });
  assert.throws(() => contract.assertValidSnapshot(duplicate), /URL|duplicate/i);
});

test('dangerous, generic and placeholder URLs are rejected before publication', () => {
  const cases = [
    { url: 'javascript:alert(1)' },
    { url: 'https://www.producthunt.com/products' },
    { title: 'Product Hunt 本月榜', summary: '点击查看本月完整榜单' },
  ];
  for (const itemPatch of cases) {
    const snapshot = validSnapshot({
      boards: [{ ...validSnapshot().boards[0], items: [validItem(itemPatch)] }],
    });
    assert.throws(() => contract.assertValidSnapshot(snapshot), /URL|placeholder|占位|generic/i);
  }
});

test('unreviewed records are not publishable even when their shape is otherwise complete', () => {
  const snapshot = validSnapshot({
    boards: [{
      ...validSnapshot().boards[0],
      items: [validItem({ verification_level: 'candidate' })],
    }],
  });
  assert.throws(() => contract.assertValidSnapshot(snapshot), /review|复核|verification/i);
  assert.doesNotThrow(() => contract.assertValidSnapshot(snapshot, { allowCandidate: true }));
});

test('freshness uses an explicit clock and has exact 7/8/30/31 day boundaries', () => {
  const now = '2026-08-30';
  assert.equal(contract.freshnessFor('2026-08-23', now).status, 'current');
  assert.equal(contract.freshnessFor('2026-08-22', now).status, 'review');
  assert.equal(contract.freshnessFor('2026-07-31', now).status, 'review');
  assert.equal(contract.freshnessFor('2026-07-30', now).status, 'historical');
  assert.equal(contract.freshnessFor('2026-08-31', now).status, 'future');
  assert.equal(contract.freshnessFor('2026-08-30', now).age_days, 0);
  assert.throws(() => contract.freshnessFor('not-a-date', now), /date|日期/i);
  assert.throws(() => contract.freshnessFor('2026-08-30', 'not-a-date'), /date|日期/i);
});

test('default check validates the public snapshot without writing it and warns when it is historical', () => {
  const before = sha256(publicDataPath);
  const output = runCli(['--check']);
  assert.match(output, /structurally complete/);
  assert.match(output, /历史快照|historical/i);
  assert.equal(sha256(publicDataPath), before);
});

test('freshness is an explicit maintenance gate rather than an implicit rewrite', () => {
  const before = sha256(publicDataPath);
  const result = failCli(['--check', '--freshness']);
  assert.notEqual(result.status, 0);
  assert.match(`${result.stdout}\n${result.stderr}`, /freshness|新鲜|current/i);
  assert.equal(sha256(publicDataPath), before);
});

test('snapshot and nested observation dates cannot be in the future or after the snapshot review window', () => {
  const now = '2026-08-30';
  const futureCases = [
    validSnapshot({ as_of: '2026-08-31', observed_at: '2026-08-31', reviewed_at: '2026-08-31' }),
    validSnapshot({ reviewed_at: '2026-08-31' }),
    validSnapshot({ boards: [{
      ...validSnapshot().boards[0],
      source: { ...SOURCE, as_of: '2026-08-31' },
    }] }),
    validSnapshot({ boards: [{
      ...validSnapshot().boards[0],
      items: [validItem({ observed_at: '2026-08-31' })],
    }] }),
    validSnapshot({ boards: [{
      ...validSnapshot().boards[0],
      items: [validItem({ metrics: [{ ...validItem().metrics[0], as_of: '2026-08-31' }] })],
    }] }),
  ];
  futureCases.forEach(snapshot => assert.throws(
    () => contract.assertValidSnapshot(snapshot, { now }),
    /future|later|晚于|now|日期/i,
  ));

  assert.throws(() => contract.assertValidSnapshot(validSnapshot({
    reviewed_at: '2026-08-29',
  }), { now }), /reviewed_at|as_of|precede|晚于/i);
  assert.throws(() => contract.assertValidSnapshot(validSnapshot({
    boards: [{
      ...validSnapshot().boards[0],
      source: { ...SOURCE, as_of: '2026-08-31' },
    }],
  }), { now: '2026-09-01' }), /source\.as_of|snapshot|晚于/i);
});

test('candidate copy accepts legal relative and absolute targets but rejects true escapes', () => {
  const candidateRoot = path.join(repoRoot, 'build', 'candidate-site', `trends-depth-${process.pid}`);
  const target = path.join(candidateRoot, 'reviewed.json');
  const absoluteTarget = path.join(candidateRoot, 'absolute-reviewed.json');
  const relativeTarget = path.relative(scriptsRoot, path.join(candidateRoot, 'nested', '..', 'reviewed.json'));
  fs.mkdirSync(candidateRoot, { recursive: true });
  try {
    runCli(['--candidate', relativeTarget]);
    assert.equal(fs.existsSync(target), true);
    assert.deepEqual(JSON.parse(fs.readFileSync(target, 'utf8')), JSON.parse(fs.readFileSync(publicDataPath, 'utf8')));
    runCli(['--candidate', absoluteTarget]);
    assert.equal(fs.existsSync(absoluteTarget), true);
    assert.deepEqual(JSON.parse(fs.readFileSync(absoluteTarget, 'utf8')), JSON.parse(fs.readFileSync(publicDataPath, 'utf8')));

    for (const unsafeTarget of [
      path.join(repoRoot, 'tools', 'trends', 'data', 'escape.json'),
      path.join(candidateRoot, '..', '..', 'escape.json'),
      path.join(repoRoot, '..', 'trends-depth-escape.json'),
    ]) {
      const result = failCli(['--candidate', unsafeTarget]);
      assert.notEqual(result.status, 0);
      assert.match(`${result.stdout}\n${result.stderr}`, /Candidate output must stay under build\/candidate-site/);
    }
  } finally {
    fs.rmSync(candidateRoot, { recursive: true, force: true });
  }
});

test('write accepts only a reviewed contract input and a bounded repository data target', () => {
  const candidateRoot = path.join(repoRoot, 'build', 'candidate-site', `.trends-depth-write-${process.pid}`);
  const publicTempRoot = path.join(repoRoot, 'tools', 'trends', 'data', `.trends-depth-write-${process.pid}`);
  const inputPath = path.join(candidateRoot, 'reviewed.json');
  const outputPath = path.join(publicTempRoot, 'published-copy.json');
  const before = sha256(publicDataPath);
  fs.mkdirSync(candidateRoot, { recursive: true });
  fs.mkdirSync(publicTempRoot, { recursive: true });
  fs.writeFileSync(inputPath, fs.readFileSync(publicDataPath));
  try {
    runCli([
      '--write',
      '--input', path.relative(scriptsRoot, inputPath),
      '--target', path.relative(scriptsRoot, path.join(publicTempRoot, 'nested', '..', 'published-copy.json')),
    ]);
    assert.equal(fs.existsSync(outputPath), true);
    assert.equal(sha256(publicDataPath), before);
    assert.deepEqual(JSON.parse(fs.readFileSync(outputPath, 'utf8')), JSON.parse(fs.readFileSync(publicDataPath, 'utf8')));
    const absoluteOutputPath = path.join(publicTempRoot, 'absolute-copy.json');
    runCli(['--write', '--input', inputPath, '--target', absoluteOutputPath]);
    assert.equal(fs.existsSync(absoluteOutputPath), true);
    assert.deepEqual(JSON.parse(fs.readFileSync(absoluteOutputPath, 'utf8')), JSON.parse(fs.readFileSync(publicDataPath, 'utf8')));

    const unsafeTargets = [
      path.join(publicTempRoot, '..', '..', 'escape.json'),
      path.join(repoRoot, 'tools', 'trends', 'escape.json'),
      path.join(repoRoot, '..', 'trends-depth-escape.json'),
      path.join(repoRoot, 'build', 'candidate-site', 'escape.json'),
    ];
    for (const unsafeTarget of unsafeTargets) {
      const result = failCli(['--write', '--input', inputPath, '--target', unsafeTarget]);
      assert.notEqual(result.status, 0);
      assert.match(`${result.stdout}\n${result.stderr}`, /public trends data|target|仓库|bounded/i);
    }

    const unreviewedPath = path.join(candidateRoot, 'unreviewed.json');
    const unreviewed = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
    unreviewed.boards[0].items[0].verification_level = 'candidate';
    fs.writeFileSync(unreviewedPath, JSON.stringify(unreviewed));
    const rejected = failCli(['--write', '--input', unreviewedPath, '--target', path.join(publicTempRoot, 'should-not-exist.json')]);
    assert.notEqual(rejected.status, 0);
    assert.match(`${rejected.stdout}\n${rejected.stderr}`, /review|复核|contract/i);
    assert.equal(sha256(publicDataPath), before);
  } finally {
    fs.rmSync(candidateRoot, { recursive: true, force: true });
    fs.rmSync(publicTempRoot, { recursive: true, force: true });
  }
});

test('write completes all gates before atomic rename and cleans a failed temporary file', () => {
  const candidateRoot = path.join(repoRoot, 'build', 'candidate-site', `.trends-depth-atomic-${process.pid}`);
  const publicTempRoot = path.join(repoRoot, 'tools', 'trends', 'data', `.trends-depth-atomic-${process.pid}`);
  const inputPath = path.join(candidateRoot, 'reviewed.json');
  const targetPath = path.join(publicTempRoot, 'published.json');
  fs.mkdirSync(candidateRoot, { recursive: true });
  fs.mkdirSync(publicTempRoot, { recursive: true });
  fs.writeFileSync(inputPath, fs.readFileSync(publicDataPath));
  fs.writeFileSync(targetPath, 'original target\n');
  const before = sha256(targetPath);
  const failingFileSystem = {
    mkdirSync: fs.mkdirSync.bind(fs),
    writeFileSync: fs.writeFileSync.bind(fs),
    renameSync: () => { throw new Error('simulated atomic rename failure'); },
    rmSync: fs.rmSync.bind(fs),
  };
  try {
    assert.throws(() => generator.writeReviewedSnapshot(inputPath, targetPath, {
      now: '2026-08-31',
      fileSystem: failingFileSystem,
    }), /simulated atomic rename failure/);
    assert.equal(sha256(targetPath), before);
    assert.deepEqual(fs.readdirSync(publicTempRoot).filter(name => name.endsWith('.tmp')), []);
  } finally {
    fs.rmSync(candidateRoot, { recursive: true, force: true });
    fs.rmSync(publicTempRoot, { recursive: true, force: true });
  }
});

test('write without reviewed input never falls back to a live network fetch', () => {
  const before = sha256(publicDataPath);
  const result = failCli(['--write']);
  assert.notEqual(result.status, 0);
  assert.match(`${result.stdout}\n${result.stderr}`, /input|复核|reviewed/i);
  assert.equal(sha256(publicDataPath), before);
});

test('candidate contract keeps fetch failures as diagnostics and never as placeholder signals', () => {
  const candidate = {
    contract_version: 2,
    snapshot_id: 'candidate-2026-08-30',
    snapshot_status: 'candidate',
    as_of: '2026-08-30',
    observed_at: '2026-08-30',
    collection_mode: 'candidate',
    verification_level: 'candidate',
    review_scope: 'candidate',
    facts_verified_at: null,
    boards: [{
      id: 'product-hunt',
      title: 'Product Hunt',
      icon: '🚀',
      intro: 'Product Hunt candidate board.',
      ranking_basis: '候选发现，不构成公开排名。',
      source: SOURCE,
      status: 'failed',
      diagnostics: [{ code: 'fetch_failed', message: 'network unavailable' }],
      items: [],
    }],
    method: {
      collection_boundary: '自动发现仅生成候选；公开写入前必须人工复核完整 JSON。',
      evidence_policy: '候选摘要是来源记录，不是独立事实证据。',
    },
  };
  assert.doesNotThrow(() => contract.assertValidCandidate(candidate));
  assert.throws(() => contract.assertValidCandidate({
    ...candidate,
    boards: [{ ...candidate.boards[0], status: 'failed', diagnostics: [], items: [{ title: 'Product Hunt 本月榜' }] }],
  }), /diagnostic|placeholder|占位/i);
  assert.throws(() => contract.assertValidCandidate({
    ...candidate,
    boards: [{ ...candidate.boards[0], status: 'ready', diagnostics: [], items: [] }],
  }), /items|empty|候选/i);
  assert.throws(() => contract.assertValidCandidate({
    ...candidate,
    method: { ...candidate.method, evidence_policy: 'candidate summaries are independent factual evidence.' },
  }), /evidence|独立/i);
});

test('production candidate metadata matches the actual collectors', () => {
  assert.equal(generator.BOARD_CONFIG.length, 5);
  const hackerNews = generator.BOARD_CONFIG.find(config => config.id === 'hacker-news');
  const overseas = generator.BOARD_CONFIG.find(config => config.id === 'overseas-ai');
  const china = generator.BOARD_CONFIG.find(config => config.id === 'china-ai');
  assert.match(hackerNews.intro, /Top Stories/);
  assert.equal(hackerNews.source_url, 'https://hacker-news.firebaseio.com/v0/topstories.json');
  assert.match(hackerNews.ranking_basis, /Top Stories.*顺序/);
  const hnItem = generator.candidateItem(hackerNews, {
    rank: 4,
    score: 321,
    title: 'A Hacker News story',
    summary: 'A concrete story summary.',
    url: 'https://example.com/story',
    hnUrl: 'https://news.ycombinator.com/item?id=123',
  }, 0, '2026-08-30');
  assert.equal(hnItem.metrics[0].label, 'Points（候选）');
  assert.match(hnItem.metrics[0].value, /321 points/);
  assert.equal(overseas.source_name, 'GitHub Trending');
  assert.equal(china.source_name, '36Kr AI 频道');
  assert.doesNotMatch(JSON.stringify(generator.BOARD_CONFIG), /TechCrunch|量子位|CSDN/);
});

test('ready candidate boards include intro and pass the candidate contract', () => {
  const config = generator.BOARD_CONFIG.find(entry => entry.id === 'github-ai');
  assert.equal(typeof config.intro, 'string');
  const item = generator.candidateItem(config, {
    rank: 1,
    title: 'Example repository',
    summary: 'A concrete candidate summary.',
    url: 'https://github.com/example/repository',
    tags: ['AI'],
  }, 0, '2026-08-30');
  const board = generator.candidateBoard(config, [item], '2026-08-30');
  assert.equal(board.status, 'ready');
  assert.equal(board.intro, config.intro);
  assert.doesNotThrow(() => contract.assertValidCandidate({
    contract_version: 2,
    snapshot_id: 'candidate-2026-08-30',
    snapshot_status: 'candidate',
    as_of: '2026-08-30',
    observed_at: '2026-08-30',
    collection_mode: 'candidate',
    verification_level: 'candidate',
    review_scope: 'candidate',
    facts_verified_at: null,
    boards: [board],
    method: {
      collection_boundary: '自动发现仅生成候选；公开写入前必须人工复核完整 JSON。',
      evidence_policy: '候选摘要是来源记录，不是独立事实证据。',
    },
  }));
});
