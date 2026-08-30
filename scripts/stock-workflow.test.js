const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

const repoRoot = path.resolve(__dirname, '..');

function loadStockApi(options = {}) {
  const source = fs.readFileSync(path.join(repoRoot, 'tools/stock/app.js'), 'utf8');
  const context = {
    AbortController,
    AbortSignal,
    URL,
    URLSearchParams,
    console,
    Date,
    Intl,
    JSON,
    Math,
    Promise,
    clearTimeout,
    fetch: options.fetchImpl || (() => { throw new Error('test fetch was not provided'); }),
    setTimeout,
    STATIC_RUNTIME_MODE: 'mock',
  };
  vm.runInNewContext(
    `${source}
globalThis.__stockWorkflow = {
  fetchMarketData: typeof fetchMarketData === 'function' ? fetchMarketData : null,
  fetchYahoo: typeof fetchYahoo === 'function' ? fetchYahoo : null,
  parseIntent: typeof parseIntent === 'function' ? parseIntent : null,
  buildQualityCard: typeof buildQualityCard === 'function' ? buildQualityCard : null,
  getDemoMarketSnapshot: typeof getDemoMarketSnapshot === 'function' ? getDemoMarketSnapshot : null,
  getRadarSnapshot: typeof getRadarSnapshot === 'function' ? getRadarSnapshot : null,
  recordResearchRun: typeof recordResearchRun === 'function' ? recordResearchRun : null,
  getResearchSession: typeof getResearchSession === 'function' ? getResearchSession : null,
  submitFeedback: typeof submitFeedback === 'function' ? submitFeedback : null,
  exportFeedback: typeof exportFeedback === 'function' ? exportFeedback : null,
  selectAgentTools: typeof selectAgentTools === 'function' ? selectAgentTools : null
};`,
    context,
  );
  return context.__stockWorkflow;
}

function responseFromJson(value, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    text: async () => JSON.stringify(value),
  };
}

function chartFixture() {
  return {
    chart: {
      result: [{
        meta: { regularMarketTime: 1788001200 },
        timestamp: [1787914800, 1788001200],
        indicators: {
          quote: [{
            open: [120, 123],
            high: [125, 126],
            low: [119, 121],
            close: [123.45, 124.56],
            volume: [1000000, 2000000],
          }],
        },
      }],
    },
  };
}

test('market data uses one source contract and keeps close as a number', async () => {
  const api = loadStockApi({ fetchImpl: async () => responseFromJson(chartFixture()) });
  assert.equal(typeof api.fetchMarketData, 'function', 'fetchMarketData must be the single market entry point');

  const snapshot = await api.fetchMarketData('600519.SS', '5d', '1d', {
    mode: 'market',
    now: '2026-08-30T00:00:00.000Z',
  });

  assert.deepEqual(Object.keys(snapshot).sort(), [
    'fetchedAt', 'kind', 'marketAsOf', 'rows', 'source', 'transport',
  ]);
  assert.equal(snapshot.kind, 'market-snapshot');
  assert.equal(snapshot.source, 'Yahoo Finance');
  assert.match(snapshot.transport, /proxy/);
  assert.equal(snapshot.fetchedAt, '2026-08-30T00:00:00.000Z');
  assert.equal(snapshot.marketAsOf, '2026-08-29T11:00:00.000Z');
  assert.equal(typeof snapshot.rows[0].close, 'number');
  assert.equal(snapshot.rows[0].close, 123.45);
});

test('default market mode is a deterministic demo snapshot, not a hidden network call', async () => {
  const calls = [];
  const api = loadStockApi({ fetchImpl: async (...args) => {
    calls.push(args);
    return responseFromJson(chartFixture());
  } });
  assert.equal(typeof api.getDemoMarketSnapshot, 'function');

  const first = await api.fetchMarketData('600519.SS', '5d', '1d');
  const second = await api.fetchMarketData('600519.SS', '5d', '1d');

  assert.deepEqual(first, second);
  assert.equal(first.source, '演示快照');
  assert.equal(first.transport, 'local');
  assert.equal(calls.length, 0);
  assert.ok(first.rows.length > 0);
});

test('an unresolved stock stays unresolved instead of falling back to Moutai', async () => {
  const api = loadStockApi();
  assert.equal(typeof api.parseIntent, 'function');

  const intent = await api.parseIntent('查询不存在的星河机器人股票近5日行情');

  assert.equal(intent.symbol, null);
  assert.equal(intent.unresolved, true);
  assert.notEqual(intent.symbol, '600519.SS');
});

test('explicit network failure rejects and never silently replaces the result with demo data', async () => {
  let attempts = 0;
  const api = loadStockApi({ fetchImpl: async () => {
    attempts += 1;
    throw new Error('fixture timeout');
  } });
  assert.equal(typeof api.fetchMarketData, 'function');

  await assert.rejects(
    api.fetchMarketData('600519.SS', '5d', '1d', { mode: 'market', timeoutMs: 5 }),
    /数据请求失败/,
  );
  assert.equal(attempts, 3);
});

test('research session records a run without inventing production metrics', () => {
  const api = loadStockApi();
  assert.equal(typeof api.recordResearchRun, 'function');
  assert.equal(typeof api.getResearchSession, 'function');

  const run = api.recordResearchRun({
    scenario: 'market-query',
    dataMode: 'demo',
    sourceIds: ['demo-price-600519'],
  });
  const session = api.getResearchSession();

  assert.match(run.runId, /^run-\d{3}$/);
  assert.equal(run.scenario, 'market-query');
  assert.equal(run.dataMode, 'demo');
  assert.deepEqual(run.sourceIds, ['demo-price-600519']);
  assert.equal(run.version, session.version);
  assert.equal(session.runs.length, 1);
});

test('quality output names measurable proxies and does not claim accuracy or a fixed edit count', () => {
  const api = loadStockApi();
  assert.equal(typeof api.buildQualityCard, 'function');

  const html = api.buildQualityCard(183, 2, 3);

  assert.match(html, /有效引用编号覆盖/);
  assert.match(html, /证据桶完整度/);
  assert.doesNotMatch(html, /引用准确率达标|≤3\s*次|预计修改轮次/);
});

test('radar snapshot stays byte-stable when refreshed', () => {
  const api = loadStockApi();
  assert.equal(typeof api.getRadarSnapshot, 'function');

  const first = api.getRadarSnapshot();
  const second = api.getRadarSnapshot();

  assert.deepEqual(first, second);
  assert.equal(first.asOf, '2026-08-28T07:00:00.000Z');
  assert.equal(first.generatedAt, '2026-08-28T07:00:00.000Z');
});

test('agent selects tools from the research task instead of always running every tool', () => {
  const api = loadStockApi();
  assert.equal(typeof api.selectAgentTools, 'function');

  assert.deepEqual(Array.from(api.selectAgentTools('茅台近期走势')), ['get_price']);
  assert.deepEqual(Array.from(api.selectAgentTools('宁德时代基本面与行业风险')), ['get_valuation', 'search_news']);
  assert.deepEqual(Array.from(api.selectAgentTools('招商银行市场情绪与舆情')), ['search_news', 'get_sentiment']);
});

test('feedback is one final decision per run and can be exported as JSON', () => {
  const api = loadStockApi();
  assert.equal(typeof api.submitFeedback, 'function');
  assert.equal(typeof api.exportFeedback, 'function');

  const first = api.submitFeedback({
    runId: 'run-001',
    decision: 'revise',
    issueType: 'citation',
    target: 'claim-02',
  });
  const duplicate = api.submitFeedback({
    runId: 'run-001',
    decision: 'adopt',
    issueType: 'none',
    target: 'report',
  });

  assert.equal(first.accepted, true);
  assert.equal(duplicate.accepted, false);
  assert.match(duplicate.reason, /一次/);
  const exported = JSON.parse(api.exportFeedback());
  assert.equal(exported.feedback[0].runId, 'run-001');
});

test('claim and governance source files do not advertise unimplemented capabilities', () => {
  const files = [
    'tools/stock/app.js',
    'tools/stock/index.html',
    'tools/stock/README.md',
  ];
  const contents = files.map((file) => fs.readFileSync(path.join(repoRoot, file), 'utf8')).join('\n');

  assert.doesNotMatch(contents, /LLM\s*实时生成|引用准确率达标|≤3\s*次|Secrets\s*注入|35万条/);
  const page = fs.readFileSync(path.join(repoRoot, 'tools/stock/index.html'), 'utf8');
  assert.match(page, /proxy\.py.*未参与公开页面的历史本地工具/);
  assert.doesNotMatch(page, /text2vec-base-chinese|异常值过滤/);
});
