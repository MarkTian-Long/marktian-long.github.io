'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('@playwright/test');

const { BLOCKED_BROWSER_PORTS, createStaticServer } = require('./equivalence/servers');

const repoRoot = path.resolve(__dirname, '..');
const dataPath = path.join(repoRoot, 'tools', 'ai-insights', 'data', 'products.json');
const dataUrl = '**/tools/ai-insights/data/products.json';
const products = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
const invalidProduct = JSON.parse(JSON.stringify(products[0]));
invalidProduct.id = 'broken-metric';
invalidProduct.keyMetrics[0].definition = '';
const invalidReferenceProduct = JSON.parse(JSON.stringify(products[0]));
invalidReferenceProduct.id = 'broken-references';
invalidReferenceProduct.tabs.summary.decisionIds = ['missing-decision'];
invalidReferenceProduct.tabs.evidence.metricIds = ['missing-metric'];
const invalidDateProduct = JSON.parse(JSON.stringify(products[0]));
invalidDateProduct.id = 'broken-date';
invalidDateProduct.archiveDate = '2026-02-30';

function startServer() {
  return new Promise((resolve, reject) => {
    const server = createStaticServer({ rootDir: repoRoot, label: 'ai-insights-depth' });
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
  return new Promise(resolve => server.close(resolve));
}

async function waitForProducts(page) {
  await page.locator('.product-card').first().waitFor({ state: 'visible' });
}

test('AI Insights supports decision filters, deep links, keyboard modal behavior, and empty states', { timeout: 40000 }, async () => {
  const { server, url } = await startServer();
  let browser;
  try {
    browser = await chromium.launch({
      headless: true,
      ...(process.env.PLAYWRIGHT_EXECUTABLE_PATH ? { executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH } : {}),
    });
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await page.goto(`${url}/tools/ai-insights/index.html`, { waitUntil: 'domcontentloaded' });
    await waitForProducts(page);

    assert.equal(await page.locator('.product-card').count(), products.length);
    assert.ok(await page.locator('#categoryFilters [data-filter-group="category"]').count() >= 2);
    assert.ok(await page.locator('#themeFilters [data-filter-group="theme"]').count() >= 2);
    assert.match(await page.locator('#dataBoundary').textContent(), /静态研究档案/);
    assert.match(await page.locator('#dataBoundary').textContent(), /非实时/);
    assert.match(await page.locator('#dataBoundary').textContent(), /档案整理日期/);
    assert.match(await page.locator('#dataBoundary').textContent(), /待人工事实复核/);
    const workflowLinks = page.locator('.workflow-nav a');
    assert.deepEqual(await workflowLinks.evaluateAll(links => links.map(link => link.textContent.trim())), [
      '01 信源',
      '02 信号',
      '03 分析',
      '04 方法',
    ]);
    assert.deepEqual(await workflowLinks.evaluateAll(links => links.map(link => link.getAttribute('href'))), [
      '../radar/index.html',
      '../trends/index.html',
      'index.html',
      '../agent-hub/index.html',
    ]);
    assert.equal(await page.locator('.workflow-nav [aria-current="step"]').count(), 1);
    assert.equal(await page.locator('.workflow-nav [aria-current="step"]').textContent(), '03 分析');

    await page.locator('#categoryFilters [data-filter-group="category"][data-value="AI 创作"]').click();
    assert.ok(await page.locator('.product-card').count() >= 1);
    assert.ok(await page.locator('.product-card').evaluateAll(cards => cards.every(card => card.dataset.category === 'AI 创作')));

    await page.locator('#themeFilters [data-filter-group="theme"][data-value="enterprise"]').click();
    await page.locator('#emptyState').waitFor({ state: 'visible' });
    assert.match(await page.locator('#emptyState').textContent(), /没有符合条件/);

    await page.locator('#clearFilters').click();
    await waitForProducts(page);
    const firstCardText = await page.locator('.product-card').first().textContent();
    assert.match(firstCardText, /整理 2026\.08\.30/);
    assert.doesNotMatch(firstCardText, /最近复核|计划复核|复核 2026/);
    const firstCard = page.locator('.product-open').first();
    await firstCard.focus();
    await page.keyboard.press('Enter');
    await page.locator('#detailModal:not(.hidden)').waitFor({ state: 'visible' });
    assert.equal(await page.locator('#detailModal').getAttribute('aria-modal'), 'true');
    assert.equal(await page.locator('[role="tab"][aria-selected="true"]').count(), 1);
    assert.equal(await page.locator('[role="tabpanel"]:not([hidden])').count(), 1);
    assert.equal(await page.locator('[role="tabpanel"]:not([hidden])').getAttribute('id'), 'tab-summary');
    const detailText = await page.locator('#detailContent').textContent();
    assert.match(detailText, /档案整理 2026\.08\.30/);
    assert.match(detailText, /事实复核：待人工事实复核/);
    assert.doesNotMatch(detailText, /最近复核|计划复核/);
    await page.locator('#detailClose').focus();
    await page.keyboard.press('Shift+Tab');
    assert.equal(await page.evaluate(() => document.activeElement?.classList.contains('source-link')), true);
    await page.keyboard.press('ArrowRight');
    assert.equal(await page.locator('[role="tab"][aria-selected="true"]').getAttribute('data-tab'), 'summary');
    assert.equal(await page.locator('[role="tabpanel"]:not([hidden])').getAttribute('id'), 'tab-summary');
    await page.keyboard.press('Tab');
    assert.equal(await page.evaluate(() => document.activeElement?.id), 'detailClose');
    await page.keyboard.press('ArrowRight');
    assert.equal(await page.locator('[role="tab"][aria-selected="true"]').getAttribute('data-tab'), 'summary');
    await page.locator('[role="tab"][data-tab="summary"]').focus();
    await page.keyboard.press('ArrowRight');
    assert.match(await page.locator('[role="tab"][aria-selected="true"]').getAttribute('data-tab'), /mechanism/);
    assert.equal(await page.locator('[role="tabpanel"]:not([hidden])').getAttribute('id'), 'tab-mechanism');
    await page.keyboard.press('End');
    assert.equal(await page.locator('[role="tab"][aria-selected="true"]').getAttribute('data-tab'), 'evolution');
    await page.keyboard.press('Home');
    assert.equal(await page.locator('[role="tab"][aria-selected="true"]').getAttribute('data-tab'), 'summary');
    await page.keyboard.press('Escape');
    await page.locator('#detailModal.hidden').waitFor({ state: 'attached' });
    assert.equal(await page.evaluate(() => document.activeElement?.id), await firstCard.getAttribute('id'));

    for (const tabId of ['summary', 'mechanism', 'tradeoffs', 'evidence', 'evolution']) {
      await page.goto(`${url}/tools/ai-insights/index.html?product=chatgpt&tab=${tabId}`, { waitUntil: 'domcontentloaded' });
      await page.locator('#detailModal:not(.hidden)').waitFor({ state: 'visible' });
      assert.equal(await page.locator('#detailModal').getAttribute('data-product-id'), 'chatgpt');
      assert.equal(await page.locator(`[role="tab"][data-tab="${tabId}"]`).getAttribute('aria-selected'), 'true');
      assert.equal(await page.locator('[role="tabpanel"]:not([hidden])').count(), 1);
      assert.equal(await page.locator('[role="tabpanel"]:not([hidden])').getAttribute('id'), `tab-${tabId}`);
    }

    await page.goto(`${url}/tools/ai-insights/index.html?product=chatgpt&tab=not-a-tab`, { waitUntil: 'domcontentloaded' });
    await page.locator('#deepLinkNotice').waitFor({ state: 'visible' });
    assert.match(await page.locator('#deepLinkNotice').textContent(), /未识别详情分区/);
    assert.equal(await page.locator('#detailModal:not(.hidden)').isVisible(), true);
    assert.equal(await page.locator('[role="tab"][data-tab="summary"]').getAttribute('aria-selected'), 'true');
    assert.equal(await page.locator('[role="tabpanel"]:not([hidden])').getAttribute('id'), 'tab-summary');

    await page.goto(`${url}/tools/ai-insights/index.html?product=not-a-product&tab=not-a-tab`, { waitUntil: 'domcontentloaded' });
    await page.locator('#deepLinkNotice').waitFor({ state: 'visible' });
    assert.match(await page.locator('#deepLinkNotice').textContent(), /无法打开|未找到/);
    assert.equal(await page.locator('#detailModal').isHidden(), true);
  } finally {
    if (browser) await browser.close();
    await stopServer(server);
  }
});

test('AI Insights keeps valid records, explains load failures, and recovers on retry', { timeout: 50000 }, async () => {
  const { server, url } = await startServer();
  let browser;
  try {
    browser = await chromium.launch({
      headless: true,
      ...(process.env.PLAYWRIGHT_EXECUTABLE_PATH ? { executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH } : {}),
    });
    const cases = [
      {
        name: '404',
        first: { status: 404, contentType: 'text/plain', body: 'missing' },
        error: /加载失败|找不到研究档案/,
      },
      {
        name: 'invalid-json',
        first: { status: 200, contentType: 'application/json', body: '{not-json' },
        error: /格式|解析|JSON/,
      },
      {
        name: 'partial-invalid',
        first: { status: 200, contentType: 'application/json', body: JSON.stringify([products[0], invalidProduct]) },
        partial: /部分|无效/,
      },
      {
        name: 'partial-dangling-references',
        first: { status: 200, contentType: 'application/json', body: JSON.stringify([products[0], invalidReferenceProduct]) },
        partial: /部分|无效/,
      },
      {
        name: 'partial-invalid-date',
        first: { status: 200, contentType: 'application/json', body: JSON.stringify([products[0], invalidDateProduct]) },
        partial: /部分|无效/,
      },
      {
        name: 'all-invalid',
        first: { status: 200, contentType: 'application/json', body: JSON.stringify([invalidProduct]) },
        error: /有效档案|无效|加载失败/,
      },
      {
        name: 'all-dangling-references',
        first: { status: 200, contentType: 'application/json', body: JSON.stringify([invalidReferenceProduct]) },
        error: /有效档案|无效|加载失败/,
      },
    ];

    for (const scenario of cases) {
      const page = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true });
      let requests = 0;
      await page.route(dataUrl, async route => {
        requests += 1;
        if (requests === 1) return route.fulfill(scenario.first);
        return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(products) });
      });
      await page.goto(`${url}/tools/ai-insights/index.html`, { waitUntil: 'domcontentloaded' });

      if (scenario.partial) {
        await waitForProducts(page);
        assert.equal(await page.locator('.product-card').count(), 1, `${scenario.name} should retain valid records`);
        assert.match(await page.locator('#partialLoadNotice').textContent(), scenario.partial);
      } else {
        await page.locator('#loadError').waitFor({ state: 'visible' });
        assert.match(await page.locator('#loadError').textContent(), scenario.error);
        assert.equal(await page.locator('#emptyState').isHidden(), true, `${scenario.name} should not show an empty-result state`);
      }

      await page.locator('#retryLoad').click();
      await waitForProducts(page);
      assert.equal(await page.locator('.product-card').count(), products.length, `${scenario.name} retry should restore all records`);
      assert.ok(requests >= 2, `${scenario.name} should issue a new request on retry`);
      await page.close();
    }
  } finally {
    if (browser) await browser.close();
    await stopServer(server);
  }
});
