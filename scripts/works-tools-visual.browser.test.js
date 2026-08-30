'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const { chromium } = require('@playwright/test');

const { BLOCKED_BROWSER_PORTS, createStaticServer } = require('./equivalence/servers');

const repoRoot = path.resolve(__dirname, '..');
const screenshotRoot = process.env.WORKS_TOOLS_SCREENSHOT_DIR || '';
const configuredBrowserPath = process.env.PLAYWRIGHT_EXECUTABLE_PATH
  || process.env.WORKS_TOOLS_BROWSER_EXECUTABLE
  || '';
const fallbackBrowserPaths = [
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
].filter(Boolean);

const pages = [
  { id: 'home', route: '/index.html', ready: '#tools .works-item' },
  { id: 'esop', route: '/tools/esop-extractor/index.html', ready: '#scenarioPicker .scenario-card' },
  { id: 'stock', route: '/tools/stock/index.html', ready: '#dataModeDemo' },
  { id: 'service-agent', route: '/tools/service-agent/index.html', ready: '#acceptance-card' },
  { id: 'asci', route: '/tools/asci/index.html', ready: '#researchProtocolCard' },
  { id: 'ai-insights', route: '/tools/ai-insights/index.html', ready: '.product-card' },
  { id: 'radar', route: '/tools/radar/index.html', ready: 'body[data-radar-state="ready"]' },
  { id: 'trends', route: '/tools/trends/index.html', ready: '#app[data-state="ready"]' },
  { id: 'agent-hub', route: '/tools/agent-hub/index.html', ready: '#data-ready' },
];

const viewports = [
  { id: 'desktop', width: 1440, height: 900 },
  { id: 'mobile', width: 390, height: 844 },
];

async function launchBrowser() {
  if (configuredBrowserPath) {
    return chromium.launch({ headless: true, executablePath: configuredBrowserPath });
  }
  try {
    return await chromium.launch({ headless: true });
  } catch (error) {
    if (!(error.code === 'EPERM' || /spawn\s+EPERM/i.test(error.message))) throw error;
    const executablePath = fallbackBrowserPaths.find((candidate) => fs.existsSync(candidate));
    if (!executablePath) throw error;
    return chromium.launch({ headless: true, executablePath });
  }
}

function startServer() {
  return new Promise((resolve, reject) => {
    const server = createStaticServer({ rootDir: repoRoot, label: 'works-tools-visual' });
    server.once('error', reject);
    const listen = () => server.listen(0, '127.0.0.1', () => {
      const { port } = server.address();
      if (BLOCKED_BROWSER_PORTS.has(port)) return server.close(listen);
      resolve({ server, url: `http://127.0.0.1:${port}` });
    });
    listen();
  });
}

function stopServer(server) {
  return new Promise((resolve) => server.close(resolve));
}

async function settleLayout(page) {
  await page.evaluate(() => new Promise((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(resolve));
  }));
}

async function assertPageHealth(page, pageId) {
  const dimensions = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
    title: document.title,
  }));
  assert.ok(dimensions.title.trim(), `${pageId} needs a document title`);
  assert.ok(
    dimensions.scrollWidth <= dimensions.clientWidth + 1,
    `${pageId} overflows horizontally: ${dimensions.scrollWidth}/${dimensions.clientWidth}`,
  );
}

function trackRuntimeFailures(page) {
  const failures = { pageErrors: [], localResponses: [] };
  page.on('pageerror', (error) => failures.pageErrors.push(error.message));
  page.on('response', (response) => {
    const responseUrl = new URL(response.url());
    if (responseUrl.hostname === '127.0.0.1' && response.status() >= 400) {
      failures.localResponses.push(`${response.status()} ${responseUrl.pathname}`);
    }
  });
  return failures;
}

async function assertHealthyState(page, failures, stateId) {
  await settleLayout(page);
  await assertPageHealth(page, stateId);
  assert.deepEqual(failures.pageErrors, [], `${stateId} page errors`);
  assert.deepEqual(failures.localResponses, [], `${stateId} local HTTP failures`);
}

async function capture(page, filename) {
  if (!screenshotRoot) return;
  fs.mkdirSync(screenshotRoot, { recursive: true });
  await page.screenshot({ path: path.join(screenshotRoot, filename), fullPage: false });
}

test('homepage and all eight public tools render through one HTTP origin at desktop and mobile widths', { timeout: 120000 }, async () => {
  const { server, url } = await startServer();
  let browser;
  try {
    browser = await launchBrowser();
    for (const viewport of viewports) {
      const context = await browser.newContext({ viewport, locale: 'zh-CN' });
      for (const pageSpec of pages) {
        const page = await context.newPage();
        const failures = trackRuntimeFailures(page);

        await page.goto(`${url}${pageSpec.route}`, { waitUntil: 'domcontentloaded' });
        await page.locator(pageSpec.ready).first().waitFor({ state: 'visible' });
        await assertHealthyState(page, failures, `${pageSpec.id}/${viewport.id}`);
        if (pageSpec.id === 'home') assert.equal(await page.locator('#tools .works-item').count(), 8);
        await capture(page, `${viewport.id}-${pageSpec.id}-default.png`);
        await page.close();
      }
      await context.close();
    }
  } finally {
    if (browser) await browser.close();
    await stopServer(server);
  }
});

test('ESOP and ASCI expose their core post-action states without a reload', { timeout: 30000 }, async () => {
  const { server, url } = await startServer();
  let browser;
  try {
    browser = await launchBrowser();
    const context = await browser.newContext({ viewport: viewports[0], locale: 'zh-CN' });

    const esop = await context.newPage();
    const esopFailures = trackRuntimeFailures(esop);
    await esop.goto(`${url}/tools/esop-extractor/index.html`, { waitUntil: 'domcontentloaded' });
    await esop.locator('#extractBtn').click();
    await esop.locator('#outputContent:not(.hidden)').waitFor({ state: 'visible' });
    assert.notEqual((await esop.locator('#metricFieldCoverage').textContent()).trim(), '—');
    await assertHealthyState(esop, esopFailures, 'esop/result');
    await capture(esop, 'desktop-esop-result.png');

    const asci = await context.newPage();
    const asciFailures = trackRuntimeFailures(asci);
    await asci.goto(`${url}/tools/asci/index.html`, { waitUntil: 'domcontentloaded' });
    await asci.locator('#startPipelineBtn').click();
    await asci.locator('#screen2:not(.hidden)').waitFor({ state: 'visible' });
    assert.match(await asci.locator('#taskBadge').textContent(), /任务执行中|等待人工|已完成/);
    await assertHealthyState(asci, asciFailures, 'asci/running');
    await capture(asci, 'desktop-asci-running.png');

    await context.close();
  } finally {
    if (browser) await browser.close();
    await stopServer(server);
  }
});

test('the six remaining tools expose representative decision states across desktop and mobile', { timeout: 120000 }, async () => {
  const { server, url } = await startServer();
  let browser;
  try {
    browser = await launchBrowser();

    const desktop = await browser.newContext({ viewport: viewports[0], locale: 'zh-CN' });

    const radar = await desktop.newPage();
    const radarFailures = trackRuntimeFailures(radar);
    await radar.goto(`${url}/tools/radar/index.html`, { waitUntil: 'domcontentloaded' });
    await radar.locator('body[data-radar-state="ready"]').waitFor();
    await radar.locator('[data-intent="research-frontier"]').click();
    assert.equal(await radar.locator('[data-intent="research-frontier"]').getAttribute('aria-pressed'), 'true');
    assert.match(await radar.locator('#activeIntent').textContent(), /研究前沿/);
    assert.equal(await radar.locator('.source-card').first().getAttribute('data-source-id'), 'import-ai');
    await radar.locator('.source-card').first().scrollIntoViewIfNeeded();
    await assertHealthyState(radar, radarFailures, 'radar/desktop/research-frontier');
    await capture(radar, 'desktop-radar-research-frontier.png');
    await radar.close();

    const trends = await desktop.newPage();
    const trendsFailures = trackRuntimeFailures(trends);
    await trends.goto(`${url}/tools/trends/index.html`, { waitUntil: 'domcontentloaded' });
    await trends.locator('#app[data-state="ready"]').waitFor();
    await trends.locator('#action-filter').selectOption('deep_dive');
    const visibleTrendCards = trends.locator('#signals-list .signal-card');
    await visibleTrendCards.first().waitFor({ state: 'visible' });
    assert.ok(await visibleTrendCards.evaluateAll((cards) => cards.every((card) => card.dataset.actions.split(' ').includes('deep_dive'))));
    const judgmentToggle = visibleTrendCards.first().locator('.judgment-toggle');
    await judgmentToggle.click();
    assert.equal(await judgmentToggle.getAttribute('aria-expanded'), 'true');
    const judgmentId = await judgmentToggle.getAttribute('aria-controls');
    assert.equal(await trends.locator(`#${judgmentId}`).isVisible(), true);
    await assertHealthyState(trends, trendsFailures, 'trends/desktop/deep-dive');
    await capture(trends, 'desktop-trends-deep-dive.png');
    await trends.close();

    const serviceAgent = await desktop.newPage();
    const serviceFailures = trackRuntimeFailures(serviceAgent);
    await serviceAgent.goto(`${url}/tools/service-agent/index.html`, { waitUntil: 'domcontentloaded' });
    await serviceAgent.locator('#fault-select').selectOption('ecom:low-confidence-intent');
    await serviceAgent.locator('#run-fault-btn').click();
    await serviceAgent.locator('#hitl-card').waitFor({ state: 'visible' });
    assert.equal(await serviceAgent.locator('#run-review').getAttribute('data-state'), 'pending-human');
    assert.equal(await serviceAgent.locator('#flow-node-hitl').getAttribute('data-state'), 'waiting');
    await serviceAgent.locator('#hitl-card').scrollIntoViewIfNeeded();
    await assertHealthyState(serviceAgent, serviceFailures, 'service-agent/desktop/hitl');
    await capture(serviceAgent, 'desktop-service-agent-hitl.png');
    await serviceAgent.close();

    await desktop.close();

    const mobile = await browser.newContext({ viewport: viewports[1], locale: 'zh-CN' });

    const aiInsights = await mobile.newPage();
    const aiFailures = trackRuntimeFailures(aiInsights);
    await aiInsights.goto(`${url}/tools/ai-insights/index.html`, { waitUntil: 'domcontentloaded' });
    await aiInsights.locator('.product-card').first().waitFor({ state: 'visible' });
    await aiInsights.locator('#categoryFilters [data-filter-group="category"][data-value="AI 创作"]').click();
    assert.ok(await aiInsights.locator('.product-card').count() >= 1);
    assert.ok(await aiInsights.locator('.product-card').evaluateAll((cards) => cards.every((card) => card.dataset.category === 'AI 创作')));
    await aiInsights.locator('.product-open').first().click();
    await aiInsights.locator('#detailModal:not(.hidden)').waitFor({ state: 'visible' });
    assert.equal(await aiInsights.locator('#detailModal').getAttribute('aria-modal'), 'true');
    assert.equal(await aiInsights.locator('[role="tabpanel"]:not([hidden])').count(), 1);
    await assertHealthyState(aiInsights, aiFailures, 'ai-insights/mobile/detail');
    await capture(aiInsights, 'mobile-ai-insights-detail.png');
    await aiInsights.close();

    const agentHub = await mobile.newPage();
    const agentFailures = trackRuntimeFailures(agentHub);
    await agentHub.goto(`${url}/tools/agent-hub/index.html`, { waitUntil: 'domcontentloaded' });
    await agentHub.locator('#data-ready').waitFor({ state: 'visible' });
    await agentHub.locator('#preset-it-helpdesk').click();
    await agentHub.locator('#decision-result').waitFor({ state: 'visible' });
    assert.match(await agentHub.locator('#decision-mode').textContent(), /RAG|Agent|检索|自动化|人工/);
    assert.match(await agentHub.locator('#decision-controls').textContent(), /预览|HITL|审计|停止/);
    await agentHub.locator('#decision-result').scrollIntoViewIfNeeded();
    await assertHealthyState(agentHub, agentFailures, 'agent-hub/mobile/preset-result');
    await capture(agentHub, 'mobile-agent-hub-preset-result.png');
    await agentHub.close();

    const stock = await mobile.newPage();
    const stockFailures = trackRuntimeFailures(stock);
    await stock.goto(`${url}/tools/stock/index.html`, { waitUntil: 'domcontentloaded' });
    await stock.locator('[data-tab="report"]').click();
    await stock.locator('#ragInput').fill('宁德时代基本面与行业风险');
    await stock.locator('#runRagButton').click();
    await stock.locator('#ragReport .rag-report-content').waitFor({ state: 'visible' });
    assert.match(await stock.locator('#ragReport').textContent(), /宁德时代/);
    assert.equal(await stock.locator('#runRagButton').isDisabled(), false);
    await stock.locator('#ragReport').scrollIntoViewIfNeeded();
    await assertHealthyState(stock, stockFailures, 'stock/mobile/research-report');
    await capture(stock, 'mobile-stock-research-report.png');
    await stock.close();

    await mobile.close();
  } finally {
    if (browser) await browser.close();
    await stopServer(server);
  }
});
