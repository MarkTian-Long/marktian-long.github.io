const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
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

async function blockAnalytics(page) {
  await page.route('https://www.googletagmanager.com/**', (route) => route.abort());
  await page.route('https://www.google-analytics.com/**', (route) => route.abort());
}

function chartFixture(closes = [123.45, 124.56]) {
  const timestamps = [1787914800, 1788001200].slice(-closes.length);
  return {
    chart: {
      result: [{
        meta: { regularMarketTime: timestamps[timestamps.length - 1] },
        timestamp: timestamps,
        indicators: {
          quote: [{
            open: closes.map((close) => close - 3),
            high: closes.map((close) => close + 2),
            low: closes.map((close) => close - 4),
            close: closes,
            volume: closes.map(() => 1000000),
          }],
        },
      }],
    },
  };
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function lastAiText(page) {
  const last = page.locator('#messages .msg.ai').last();
  await last.waitFor();
  return last.textContent();
}

test('stock browser controls disclose data risks and keep explicit market success/failure/timeout visible', { timeout: 30000 }, async () => {
  const { server, url } = await startServer();
  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    await blockAnalytics(page);
    let proxyRequests = 0;
    page.on('request', (request) => {
      if (proxyPattern.test(request.url())) proxyRequests += 1;
    });
    await page.goto(`${url}/tools/stock/index.html`, { waitUntil: 'domcontentloaded' });

    const sessionId = await page.evaluate(() => window.StockResearch.getResearchSession().sessionId);
    assert.match(sessionId, /^session-local-/);
    assert.match(await page.locator('#networkDisclosure').textContent(), /corsproxy\.io.*allorigins\.win.*codetabs\.com/);
    assert.match(await page.locator('#networkDisclosure').textContent(), /symbol.*range.*interval/);
    assert.match(await page.locator('#networkDisclosure').textContent(), /完整性.*隐私风险/);
    assert.match(await page.locator('#dataModeStatus').textContent(), /默认不发起行情数据请求/);

    await page.locator('#inputBox').fill('<img src=x onerror=alert(1)>');
    await page.locator('#sendBtn').click();
    const maliciousUserMessage = page.locator('#messages .msg.user').last();
    await maliciousUserMessage.waitFor();
    await page.locator('#messages .market-error-state').last().waitFor();
    assert.doesNotMatch(await maliciousUserMessage.innerHTML(), /<img\b/);
    assert.equal(proxyRequests, 0, 'demo and unresolved flows must not request market proxies');

    await page.locator('#dataModeMarket').click();
    assert.match(await page.locator('#dataModeStatus').textContent(), /提交查询后才请求/);
    assert.match(await page.locator('#dataModeStatus').textContent(), /Yahoo/);

    const successFixture = chartFixture();
    await page.route(proxyPattern, async (route) => route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(successFixture),
    }));
    await page.locator('#inputBox').fill('茅台近5日行情');
    await page.locator('#sendBtn').click();
    await page.locator('#messages .market-provenance').last().waitFor();
    const successText = await lastAiText(page);
    assert.match(successText, /Yahoo Finance via corsproxy\.io/);
    assert.match(successText, /市场时间/);
    await page.unroute(proxyPattern);

    await page.route(proxyPattern, async (route) => route.abort());
    await page.locator('#inputBox').fill('茅台近5日行情');
    await page.locator('#sendBtn').click();
    await page.locator('#messages .msg.user').nth(2).waitFor();
    await page.locator('#messages .market-error-state').nth(1).waitFor();
    const failureText = await page.locator('#messages .market-error-state').nth(1).textContent();
    assert.match(failureText, /数据请求失败/);
    assert.match(failureText, /Yahoo Finance via/);
    assert.match(failureText, /失败结果不会静默替换/);
    assert.match(failureText, /重试/);
    await page.unroute(proxyPattern);

    await page.route(proxyPattern, async (route) => {
      await delay(8500);
      try {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(successFixture) });
      } catch (_) {
        // The page's real AbortController timeout should close this route first.
      }
    });
    await page.locator('#inputBox').fill('茅台近5日行情');
    await page.locator('#sendBtn').click();
    await page.locator('#messages .msg.user').nth(3).waitFor();
    await page.locator('#messages .market-error-state').nth(2).waitFor({ timeout: 12000 });
    const timeoutText = await page.locator('#messages .market-error-state').nth(2).textContent();
    assert.match(timeoutText, /请求超时|数据请求失败/);
    assert.doesNotMatch(timeoutText, /本地规则摘要/);
    await page.unroute(proxyPattern);

    const secondPage = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    await secondPage.goto(`${url}/tools/stock/index.html`, { waitUntil: 'domcontentloaded' });
    const secondSessionId = await secondPage.evaluate(() => window.StockResearch.getResearchSession().sessionId);
    assert.notEqual(sessionId, secondSessionId, 'each page must have its own research session');
    await secondPage.close();
  } finally {
    if (browser) await browser.close();
    await stopServer(server);
  }
});

test('mobile browser keeps RAG/Agent last-write-wins, reloads private KB, escapes text, and downloads minimal feedback JSON', { timeout: 30000 }, async () => {
  const { server, url } = await startServer();
  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true });
    await blockAnalytics(page);
    await page.goto(`${url}/tools/stock/index.html`, { waitUntil: 'domcontentloaded' });

    await page.locator('[data-tab=report]').click();
    await page.locator('#kbTabPrivate').click();
    await page.locator('#privateKbInput').fill('secret-private-note：仅用于 reload 清空回归测试。');
    await page.locator('.kb-upload-btn').click();
    assert.match(await page.locator('#privateKbList').textContent(), /secret-private-note/);
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.locator('[data-tab=report]').click();
    await page.locator('#kbTabPrivate').click();
    assert.doesNotMatch(await page.locator('#privateKbList').textContent(), /secret-private-note/);

    await page.locator('#kbTabMarket').click();
    await page.locator('#ragInput').fill('茅台');
    await page.locator('#runRagButton').click();
    assert.equal(await page.locator('#runRagButton').isDisabled(), true);
    await page.locator('#ragInput').fill('宁德时代');
    await page.evaluate(() => window.runRAG());
    await page.locator('#ragReport .rag-report-content').waitFor();
    await page.waitForTimeout(250);
    const ragText = await page.locator('#ragReport').textContent();
    assert.match(ragText, /宁德时代/);
    assert.doesNotMatch(ragText, /茅台 研究草稿/);
    assert.equal(await page.locator('#runRagButton').isDisabled(), false);
    const ragRuns = await page.evaluate(() => window.StockResearch.getResearchSession().runs.filter((run) => run.scenario === 'research-report'));
    assert.equal(ragRuns.length, 1, 'stale RAG generation must not record a run');
    assert.equal(ragRuns[0].status, 'success');
    assert.equal(await page.locator('.feedback-bar').count(), 1);

    await page.locator('.fb-adopt').click();
    const downloadPromise = page.waitForEvent('download');
    await page.locator('.fb-export').click();
    const download = await downloadPromise;
    const downloadText = await fs.readFile(await download.path(), 'utf8');
    const exported = JSON.parse(downloadText);
    assert.deepEqual(Object.keys(exported), ['version', 'session', 'runs', 'feedback']);
    assert.match(exported.session.sessionId, /^session-local-/);
    assert.ok(exported.runs.every((run) => Object.keys(run).sort().join(',') === 'dataMode,runId,scenario,sourceIds,status'));
    assert.equal(exported.feedback.length, 1);
    assert.doesNotMatch(downloadText, /secret-private-note|宁德时代|茅台/);

    await page.locator('[data-tab=agent]').click();
    await page.locator('#agentInput').fill('茅台近期走势');
    await page.locator('#dataModeMarket').click();
    const firstAgentRequest = page.waitForRequest((request) => proxyPattern.test(request.url()));
    const slowAgentRoute = async (route) => {
      await delay(1200);
      try {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(chartFixture()) });
      } catch (_) {
        // The second generation should abort this stale request first.
      }
    };
    await page.route(proxyPattern, slowAgentRoute);
    await page.locator('#runAgentButton').click();
    assert.equal(await page.locator('#runAgentButton').isDisabled(), true);
    assert.match(await page.locator('#agentTools').textContent(), /Yahoo Finance via corsproxy\.io/);
    await firstAgentRequest;
    await page.locator('#dataModeDemo').click();
    await page.locator('#agentInput').fill('宁德时代基本面与行业风险');
    await page.evaluate(() => window.runAgent());
    await page.locator('#agentProcess .agent-evidence-summary').waitFor();
    await page.waitForTimeout(750);
    const agentText = await page.locator('#agentProcess').textContent();
    assert.match(agentText, /宁德时代/);
    assert.doesNotMatch(agentText, /茅台近期走势/);
    assert.equal(await page.locator('#runAgentButton').isDisabled(), false);
    const agentRuns = await page.evaluate(() => window.StockResearch.getResearchSession().runs.filter((run) => run.scenario === 'agent-evidence'));
    assert.equal(agentRuns.length, 1, 'stale Agent generation must not record a run');
    assert.equal(agentRuns[0].status, 'success');
    assert.equal(agentRuns[0].dataMode, 'demo');

    await page.unroute(proxyPattern, slowAgentRoute);
    await page.locator('#dataModeMarket').click();
    await page.route(proxyPattern, async (route) => route.abort());
    await page.locator('#agentInput').fill('茅台近期走势');
    await page.locator('#runAgentButton').click();
    await page.locator('#agentProcess .agent-partial').waitFor();
    assert.match(await page.locator('#agentProcess').textContent(), /Yahoo Finance via|partial|部分完成/);
    await page.unroute(proxyPattern);
    await page.locator('#dataModeDemo').click();
  } finally {
    if (browser) await browser.close();
    await stopServer(server);
  }
});

test('diagnosis controls enforce last-write-wins and abort the stale market request', { timeout: 30000 }, async () => {
  const { server, url } = await startServer();
  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    await blockAnalytics(page);
    await page.goto(`${url}/tools/stock/index.html`, { waitUntil: 'domcontentloaded' });
    await page.locator('[data-tab=diagnosis]').click();
    await page.locator('#dataModeMarket').click();
    let requestCount = 0;
    await page.route(proxyPattern, async (route) => {
      requestCount += 1;
      if (requestCount === 1) {
        await delay(700);
        try {
          await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(chartFixture([111.11, 112.22])) });
        } catch (_) {}
        return;
      }
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(chartFixture([222.21, 223.32])) });
    });

    const firstRequest = page.waitForRequest((request) => proxyPattern.test(request.url()));
    await page.locator('#diagInput').fill('茅台');
    await page.locator('#runDiagnosisButton').click();
    assert.equal(await page.locator('#runDiagnosisButton').isDisabled(), true);
    await firstRequest;
    await page.locator('#diagInput').fill('宁德时代');
    await page.evaluate(() => window.runDiagnosis());
    await page.locator('#diagContent .diag-card').waitFor();
    await page.waitForTimeout(900);
    const diagnosisText = await page.locator('#diagContent').textContent();
    assert.match(diagnosisText, /宁德时代/);
    assert.match(diagnosisText, /Yahoo Finance via corsproxy\.io/);
    assert.doesNotMatch(diagnosisText, /111\.11/);
    assert.equal(await page.locator('#runDiagnosisButton').isDisabled(), false);
    const runs = await page.evaluate(() => window.StockResearch.getResearchSession().runs.filter((run) => run.scenario === 'evidence-check'));
    assert.equal(runs.length, 1);
    assert.equal(runs[0].status, 'success');
    await page.unroute(proxyPattern);
  } finally {
    if (browser) await browser.close();
    await stopServer(server);
  }
});
