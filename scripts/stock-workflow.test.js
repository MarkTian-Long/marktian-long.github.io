const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');
const { webcrypto } = require('node:crypto');

const repoRoot = path.resolve(__dirname, '..');

function loadStockApi(options = {}) {
  const source = fs.readFileSync(path.join(repoRoot, 'tools/stock/app.js'), 'utf8');
  const context = {
    AbortController,
    AbortSignal,
    crypto: webcrypto,
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
  selectAgentTools: typeof selectAgentTools === 'function' ? selectAgentTools : null,
  searchNews: typeof searchNews === 'function' ? searchNews : null,
  getFundamentalEvidence: typeof getFundamentalEvidence === 'function' ? getFundamentalEvidence : null,
  getSentimentEvidence: typeof getSentimentEvidence === 'function' ? getSentimentEvidence : null,
  getSourceRegistry: typeof getSourceRegistry === 'function' ? getSourceRegistry : null,
  resolveAllowedSymbol: typeof resolveAllowedSymbol === 'function' ? resolveAllowedSymbol : null
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
    'attemptedTransports', 'candidateTransports', 'fetchedAt', 'kind', 'marketAsOf', 'rows', 'source', 'transport',
  ]);
  assert.equal(snapshot.kind, 'market-snapshot');
  assert.equal(snapshot.source, 'Yahoo Finance');
  assert.match(snapshot.transport, /proxy/);
  assert.equal(snapshot.fetchedAt, '2026-08-30T00:00:00.000Z');
  assert.equal(snapshot.marketAsOf, '2026-08-29T11:00:00.000Z');
  assert.equal(typeof snapshot.rows[0].close, 'number');
  assert.equal(snapshot.rows[0].close, 123.45);
  assert.deepEqual(Array.from(snapshot.attemptedTransports), ['corsproxy.io']);
  assert.deepEqual(Array.from(snapshot.candidateTransports), ['corsproxy.io', 'allorigins.win', 'codetabs.com']);
});

test('market responses record actual proxy attempts and stop after a proxy timeout', async () => {
  const urls = [];
  const api = loadStockApi({ fetchImpl: async (url) => {
    urls.push(url);
    if (urls.length === 1) return responseFromJson({}, 503);
    return responseFromJson(chartFixture());
  } });

  const snapshot = await api.fetchMarketData('600519.SS', '5d', '1d', { mode: 'market', timeoutMs: 20 });

  assert.equal(snapshot.transport, 'allorigins.win');
  assert.deepEqual(Array.from(snapshot.attemptedTransports), ['corsproxy.io', 'allorigins.win']);
  assert.deepEqual(Array.from(snapshot.candidateTransports), ['corsproxy.io', 'allorigins.win', 'codetabs.com']);
  assert.match(urls[0], /corsproxy\.io/);
  assert.match(urls[1], /allorigins\.win/);

  let attempts = 0;
  const timeoutApi = loadStockApi({ fetchImpl: async (_url, options) => {
    attempts += 1;
    await new Promise((resolve, reject) => {
      const timer = setTimeout(resolve, 100);
      options.signal.addEventListener('abort', () => {
        clearTimeout(timer);
        reject(new Error('fixture aborted'));
      }, { once: true });
    });
    return responseFromJson(chartFixture());
  } });
  await assert.rejects(
    timeoutApi.fetchMarketData('600519.SS', '5d', '1d', { mode: 'market', timeoutMs: 5 }),
    (error) => {
      assert.match(error.message, /请求超时/);
      assert.deepEqual(Array.from(error.attemptedTransports), ['corsproxy.io']);
      assert.deepEqual(Array.from(error.candidateTransports), ['corsproxy.io', 'allorigins.win', 'codetabs.com']);
      return true;
    },
  );
  assert.equal(attempts, 1);
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

test('arbitrary six-digit codes stay unresolved instead of inferring an exchange from the first digit', async () => {
  const api = loadStockApi();
  assert.equal(typeof api.resolveAllowedSymbol, 'function');
  assert.equal(api.resolveAllowedSymbol('123456'), null);

  const intent = await api.parseIntent('查询 123456 近5日行情');

  assert.equal(intent.symbol, null);
  assert.equal(intent.unresolved, true);
});

test('missing fundamental and sentiment fixtures are structured partial evidence with no invented sources', () => {
  const api = loadStockApi();
  assert.equal(typeof api.getFundamentalEvidence, 'function');
  assert.equal(typeof api.getSentimentEvidence, 'function');

  const fundamental = api.getFundamentalEvidence('000001.SS');
  const sentiment = api.getSentimentEvidence('000001.SS');

  assert.equal(fundamental.kind, 'missing-evidence');
  assert.equal(fundamental.status, 'missing');
  assert.deepEqual(Array.from(fundamental.sourceIds), []);
  assert.equal(fundamental.data, null);
  assert.equal(sentiment.kind, 'missing-evidence');
  assert.equal(sentiment.status, 'missing');
  assert.deepEqual(Array.from(sentiment.sourceIds), []);
  assert.equal(sentiment.data, null);
});

test('every recorded source id resolves through the source registry', () => {
  const api = loadStockApi();
  assert.equal(typeof api.getSourceRegistry, 'function');
  const registry = api.getSourceRegistry();
  assert.ok(registry['fundamental-demo-600519.SS']);
  assert.ok(registry['sentiment-demo-600519.SS']);
  assert.ok(registry['market-news-01']);

  const run = api.recordResearchRun({
    scenario: 'source-registry-check',
    dataMode: 'demo',
    sourceIds: ['fundamental-demo-600519.SS', 'sentiment-demo-600519.SS', 'market-news-01'],
  });
  assert.ok(run.sourceIds.every((sourceId) => registry[sourceId]), 'run source ids must be registered');
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

test('news fixtures are explicitly unverified and do not impersonate primary or real-media sources', () => {
  const api = loadStockApi();
  assert.equal(typeof api.searchNews, 'function');
  const results = api.searchNews('茅台', 3);
  assert.ok(results.length > 0);
  assert.ok(results.every((item) => item.source === '未核验演示夹具'));
  assert.ok(results.every((item) => item.evidenceLevel === '未核验演示夹具'));
  assert.doesNotMatch(JSON.stringify(results), /official|mainstream|一手资料|公司公告|新浪财经|东方财富|证券时报|财报系统/);
  assert.doesNotMatch(JSON.stringify(results), /净利润同比|出货量同比|年产能|客户数突破/);
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

test('feedback is one final decision per real run and export contains only minimal session metadata', () => {
  const api = loadStockApi();
  assert.equal(typeof api.submitFeedback, 'function');
  assert.equal(typeof api.exportFeedback, 'function');

  const unknown = api.submitFeedback({
    runId: 'run-999',
    decision: 'adopt',
  });
  assert.equal(unknown.accepted, false);

  const run = api.recordResearchRun({
    scenario: 'research-report',
    dataMode: 'demo',
    sourceIds: ['market-news-01'],
  });
  const unrelated = api.recordResearchRun({
    scenario: 'unrelated-market-query',
    dataMode: 'demo',
    sourceIds: ['demo-price-600519.SS'],
  });
  const first = api.submitFeedback({
    runId: run.runId,
    decision: 'revise',
    issueType: 'citation',
    target: 'claim-02',
  });
  const duplicate = api.submitFeedback({
    runId: run.runId,
    decision: 'adopt',
    issueType: 'none',
    target: 'report',
  });

  assert.equal(first.accepted, true);
  assert.equal(duplicate.accepted, false);
  assert.match(duplicate.reason, /一次/);
  const exported = JSON.parse(api.exportFeedback());
  assert.deepEqual(Object.keys(exported), ['version', 'session', 'runs', 'feedback']);
  assert.deepEqual(Object.keys(exported.session).sort(), ['sessionId', 'version']);
  assert.deepEqual(Object.keys(exported.runs[0]).sort(), ['dataMode', 'runId', 'scenario', 'sourceIds', 'status']);
  assert.equal(exported.runs.length, 1);
  assert.equal(exported.runs[0].runId, run.runId);
  assert.doesNotMatch(JSON.stringify(exported), new RegExp(unrelated.runId));
  assert.doesNotMatch(JSON.stringify(exported), /demo-price-600519\.SS/);
  assert.equal(exported.feedback[0].runId, run.runId);
  assert.doesNotMatch(JSON.stringify(exported), /茅台|私有资料|secret/i);
});

test('session ids are unique per page context', () => {
  const first = loadStockApi().getResearchSession().sessionId;
  const second = loadStockApi().getResearchSession().sessionId;
  assert.match(first, /^session-local-/);
  assert.match(second, /^session-local-/);
  assert.notEqual(first, second);
});

test('claim and governance source files do not advertise unimplemented capabilities', () => {
  const files = [
    'tools/stock/app.js',
    'tools/stock/index.html',
    'tools/stock/README.md',
  ];
  const contents = files.map((file) => fs.readFileSync(path.join(repoRoot, file), 'utf8')).join('\n');

  assert.doesNotMatch(contents, /LLM\s*实时生成|引用准确率达标|≤3\s*次|Secrets\s*注入|35万条/);
  assert.match(contents, /未核验演示夹具/);
  assert.doesNotMatch(contents, /official|mainstream|一手资料|公司公告|新浪财经|东方财富|证券时报|财报系统/);
  assert.doesNotMatch(contents, /净利润同比|出货量同比|年产能15万辆|客户数突破2亿/);
  assert.match(contents, /默认不发起行情数据请求/);
  assert.doesNotMatch(contents, /默认不联网/);
  assert.match(contents, /corsproxy\.io[\s\S]*allorigins\.win[\s\S]*codetabs\.com/);
  assert.match(contents, /symbol[\s\S]*range[\s\S]*interval/);
  assert.match(contents, /完整性[\s\S]*隐私风险/);
  assert.match(contents, /私有资料流程[：:][\s\S]*不发起第三方请求/);
  assert.doesNotMatch(contents, /站点统计[\s\S]*可能[\s\S]*联网/);
  assert.match(contents, /Yahoo Finance via/);
  const page = fs.readFileSync(path.join(repoRoot, 'tools/stock/index.html'), 'utf8');
  assert.match(page, /proxy\.py.*未参与公开页面的历史本地工具/);
  assert.doesNotMatch(page, /text2vec-base-chinese|异常值过滤/);
});

test('stock page keeps private material flow free of page analytics and third-party requests', () => {
  const page = fs.readFileSync(path.join(repoRoot, 'tools/stock/index.html'), 'utf8');
  assert.doesNotMatch(page, /<script[^>]+(?:src=["'][^"']*analytics\.js|analytics\.js[^>]*src=)/i);
  assert.match(page, /私有资料流程[：:]?[^<]*(?:不发起|不加载)第三方请求/);
});
