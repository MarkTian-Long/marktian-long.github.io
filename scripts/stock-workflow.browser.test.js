const assert = require('node:assert/strict');
const path = require('node:path');
const test = require('node:test');
const { chromium } = require('@playwright/test');

const { BLOCKED_BROWSER_PORTS, createStaticServer } = require('./equivalence/servers');

const repoRoot = path.resolve(__dirname, '..');
const proxyPattern = /https:\/\/(?:corsproxy\.io|api\.allorigins\.win|api\.codetabs\.com)\//;

function startServer() {
  return new Promise((resolve, reject) => {
    const server = createStaticServer({ rootDir: repoRoot, label: 'stock-workflow' });
    server.once('error', reject);
    function listen() {
      server.listen(0, '127.0.0.1', () => {
        const { port } = server.address();
        if (BLOCKED_BROWSER_PORTS.has(port)) return server.close(listen);
        resolve({ server, url: `http://127.0.0.1:${port}` });
      });
    }
    listen();
  });
}

function stopServer(server) {
  return new Promise((resolve) => server.close(resolve));
}

async function evaluateMarketFixture(page, fixture, routeAction) {
  await page.route(proxyPattern, async (route) => routeAction(route));
  return page.evaluate(async ({ fixture: response, timeoutMs }) => {
    try {
      const snapshot = await window.StockResearch.fetchMarketData(
        '600519.SS',
        '5d',
        '1d',
        { mode: 'market', timeoutMs, now: '2026-08-30T00:00:00.000Z' },
      );
      return { ok: true, snapshot };
    } catch (error) {
      return { ok: false, error: String(error && error.message || error) };
    }
  }, { fixture, timeoutMs: fixture === 'timeout' ? 5 : 1000 });
}

test('stock browser workflow keeps demo default and handles explicit market fixtures', { timeout: 30000 }, async () => {
  const { server, url } = await startServer();
  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    await page.goto(`${url}/tools/stock/index.html`, { waitUntil: 'domcontentloaded' });

    assert.equal(await page.locator('#dataModeDemo').count(), 1);
    assert.equal(await page.locator('#dataModeMarket').count(), 1);
    assert.equal(await page.locator('#dataModeDemo').getAttribute('aria-pressed'), 'true');
    assert.equal(await page.evaluate(() => typeof window.StockResearch), 'object');
    assert.match(await page.locator('#sessionSummary').textContent(), /研究会话/);
    await page.locator('#dataModeMarket').click();
    assert.equal(await page.locator('#dataModeMarket').getAttribute('aria-pressed'), 'true');
    assert.match(await page.locator('#dataModeStatus').textContent(), /提交查询后才请求/);
    await page.locator('#dataModeDemo').click();

    const fixture = {
      chart: {
        result: [{
          meta: { regularMarketTime: 1788001200 },
          timestamp: [1787914800],
          indicators: { quote: [{ close: [123.45], open: [120], high: [125], low: [119], volume: [1000000] }] },
        }],
      },
    };

    const success = await evaluateMarketFixture(page, fixture, async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(fixture) });
    });
    assert.equal(success.ok, true);
    assert.equal(success.snapshot.source, 'Yahoo Finance');
    assert.equal(success.snapshot.transport, 'corsproxy.io');
    assert.equal(success.snapshot.rows[0].close, 123.45);
    await page.unroute(proxyPattern);

    const cases = [
      { name: 'timeout', action: async (route) => route.abort('timedout'), pattern: /数据请求失败/ },
      { name: 'http error', action: async (route) => route.fulfill({ status: 502, body: 'bad gateway' }), pattern: /HTTP 502/ },
      { name: 'invalid json', action: async (route) => route.fulfill({ status: 200, body: 'not-json' }), pattern: /响应解析失败/ },
      { name: 'all proxy failure', action: async (route) => route.abort(), pattern: /数据请求失败/ },
    ];
    for (const item of cases) {
      const result = await evaluateMarketFixture(page, item.name === 'timeout' ? 'timeout' : {}, item.action);
      assert.equal(result.ok, false, item.name);
      assert.match(result.error, item.pattern, item.name);
      await page.unroute(proxyPattern);
    }
  } finally {
    if (browser) await browser.close();
    await stopServer(server);
  }
});

test('stock browser states expose deterministic radar, citation, partial agent, and feedback boundaries', { timeout: 30000 }, async () => {
  const { server, url } = await startServer();
  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true });
    await page.goto(`${url}/tools/stock/index.html`, { waitUntil: 'domcontentloaded' });

    await page.locator('[data-tab="radar"]').click();
    const radarBefore = await page.locator('#radarTimestamp').textContent();
    await page.locator('#radarRefreshButton').click();
    assert.equal(await page.locator('#radarTimestamp').textContent(), radarBefore);

    await page.locator('[data-tab="report"]').click();
    await page.locator('#ragInput').fill('茅台');
    await page.locator('#runRagButton').click();
    await page.locator('#ragReport .rag-report-content').waitFor();
    assert.match(await page.locator('#ragReport').textContent(), /claim-01|有效引用编号覆盖/);
    assert.equal(await page.locator('.feedback-bar').count(), 1);

    await page.locator('[data-tab="agent"]').click();
    await page.locator('#agentInput').fill('查询不存在的星河机器人');
    await page.locator('#runAgentButton').click();
    await page.locator('#agentProcess .agent-partial').waitFor();
    assert.match(await page.locator('#agentProcess').textContent(), /partial|部分证据/);

    await page.locator('#dataModeMarket').click();
    await page.route(proxyPattern, async (route) => route.abort());
    await page.locator('#agentInput').fill('茅台近期走势');
    await page.locator('#runAgentButton').click();
    await page.locator('#agentProcess .agent-partial').waitFor();
    assert.match(await page.locator('#agentProcess').textContent(), /partial|部分完成/);
    await page.unroute(proxyPattern);
    await page.locator('#dataModeDemo').click();
  } finally {
    if (browser) await browser.close();
    await stopServer(server);
  }
});
