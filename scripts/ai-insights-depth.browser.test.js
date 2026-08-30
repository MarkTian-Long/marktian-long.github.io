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
const malformedFieldsProduct = JSON.parse(JSON.stringify(products[0]));
malformedFieldsProduct.id = 'malformed-fields';
malformedFieldsProduct.company = { rendered: 'must be text' };
malformedFieldsProduct.logo = ['not', 'text'];
malformedFieldsProduct.tabs.mechanism.system[0] = { rendered: 'must be text' };
const invalidEnumProduct = JSON.parse(JSON.stringify(products[0]));
invalidEnumProduct.id = 'invalid-enum';
invalidEnumProduct.lifecycle = 'unknown-lifecycle';
const invalidIdProduct = JSON.parse(JSON.stringify(products[0]));
invalidIdProduct.id = 'invalid-id';
invalidIdProduct.keyMetrics[0].id = 'invalid metric id';
const duplicateProduct = JSON.parse(JSON.stringify(products[0]));
duplicateProduct.thesis.text = '重复产品 ID 不应生成第二张卡片。';
const invalidJavascriptUrlProduct = JSON.parse(JSON.stringify(products[0]));
invalidJavascriptUrlProduct.id = 'javascript-url';
invalidJavascriptUrlProduct.sources[0].url = 'javascript:window.__unsafeUrl = true';
const maliciousTextProduct = JSON.parse(JSON.stringify(products[0]));
maliciousTextProduct.id = 'malicious-text';
maliciousTextProduct.name = '<img src=x onerror="window.__xss = true">';
maliciousTextProduct.thesis.text = '<script>window.__xss = true</script><img src=x onerror="window.__xss = true">';
maliciousTextProduct.sources[0].title = '<svg onload="window.__xss = true">恶意来源</svg>';
const longDetailProduct = JSON.parse(JSON.stringify(products[0]));
longDetailProduct.id = 'long-detail';
const longText = '超长详情文本'.repeat(800);
longDetailProduct.thesis.text = longText;
longDetailProduct.tabs.summary.problem = longText;
longDetailProduct.tabs.mechanism.summary = longText;
longDetailProduct.tabs.tradeoffs.summary = longText;
longDetailProduct.tabs.evidence.summary = longText;
longDetailProduct.tabs.evolution.summary = longText;
longDetailProduct.sources[0].title = longText;
longDetailProduct.keyMetrics[0].definition = longText;

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

function findLocalEdgeExecutable() {
  const candidates = [
    process.env['ProgramFiles(x86)'] && path.join(process.env['ProgramFiles(x86)'], 'Microsoft', 'Edge', 'Application', 'msedge.exe'),
    process.env.ProgramFiles && path.join(process.env.ProgramFiles, 'Microsoft', 'Edge', 'Application', 'msedge.exe'),
    process.env.LOCALAPPDATA && path.join(process.env.LOCALAPPDATA, 'Microsoft', 'Edge', 'Application', 'msedge.exe'),
  ].filter(Boolean);
  return candidates.find(candidate => fs.existsSync(candidate)) || null;
}

function isSpawnEperm(error) {
  const details = [error?.code, error?.message, error?.stack, ...(error?.log || [])]
    .filter(Boolean)
    .join(' ');
  return error?.code === 'EPERM' || /spawn[\s\S]*EPERM|EPERM[\s\S]*spawn|operation not permitted/i.test(details);
}

async function launchBrowser() {
  const explicitExecutablePath = process.env.PLAYWRIGHT_EXECUTABLE_PATH;
  if (explicitExecutablePath) {
    return chromium.launch({ headless: true, executablePath: explicitExecutablePath });
  }

  try {
    return await chromium.launch({ headless: true });
  } catch (error) {
    if (!isSpawnEperm(error)) throw error;
    const edgeExecutablePath = findLocalEdgeExecutable();
    if (!edgeExecutablePath) throw error;
    return chromium.launch({ headless: true, executablePath: edgeExecutablePath });
  }
}

async function waitForProducts(page) {
  await page.locator('.product-card').first().waitFor({ state: 'visible' });
}

test('AI Insights supports decision filters, deep links, keyboard modal behavior, and empty states', { timeout: 40000 }, async () => {
  const { server, url } = await startServer();
  let browser;
  try {
    browser = await launchBrowser();
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    const pageErrors = [];
    page.on('pageerror', error => pageErrors.push(error));
    await page.goto(`${url}/tools/ai-insights/index.html`, { waitUntil: 'domcontentloaded' });
    await waitForProducts(page);

    assert.equal(await page.locator('.product-card').count(), products.length);
    assert.ok(await page.locator('#categoryFilters [data-filter-group="category"]').count() >= 2);
    assert.ok(await page.locator('#themeFilters [data-filter-group="theme"]').count() >= 2);
    assert.match(await page.locator('#dataBoundary').textContent(), /静态研究档案/);
    assert.match(await page.locator('#dataBoundary').textContent(), /非实时/);
    assert.match(await page.locator('#dataBoundary').textContent(), /档案整理日期/);
    assert.match(await page.locator('#dataBoundary').textContent(), /待人工事实复核/);
    const workflowNav = page.locator('nav[data-workflow-nav]');
    assert.equal(await workflowNav.count(), 1);
    const workflowLinks = workflowNav.locator('a');
    assert.deepEqual(await workflowLinks.evaluateAll(links => links.map(link => link.textContent.trim())), [
      '1 信源',
      '2 信号',
      '3 分析',
      '4 方法',
    ]);
    assert.deepEqual(await workflowLinks.evaluateAll(links => links.map(link => link.getAttribute('href'))), [
      '../radar/index.html',
      '../trends/index.html',
      'index.html',
      '../agent-hub/index.html',
    ]);
    assert.equal(await workflowNav.locator('[aria-current="step"]').count(), 1);
    assert.equal(await workflowNav.locator('[aria-current="step"]').textContent(), '3 分析');

    const creationFilter = page.locator('#categoryFilters [data-filter-group="category"][data-value="AI 创作"]');
    await creationFilter.focus();
    await creationFilter.click();
    assert.equal(await page.evaluate(() => {
      const active = document.activeElement;
      return active?.matches('[data-filter-group="category"]') && active.dataset.value === 'AI 创作' && !active.hidden;
    }), true, 'filter rebuild should restore focus to the replacement filter');
    assert.ok(await page.locator('.product-card').count() >= 1);
    assert.ok(await page.locator('.product-card').evaluateAll(cards => cards.every(card => card.dataset.category === 'AI 创作')));

    const enterpriseFilter = page.locator('#themeFilters [data-filter-group="theme"][data-value="enterprise"]');
    await enterpriseFilter.focus();
    await enterpriseFilter.click();
    assert.equal(await page.evaluate(() => {
      const active = document.activeElement;
      return active?.matches('[data-filter-group="theme"]') && active.dataset.value === 'enterprise' && !active.hidden;
    }), true, 'empty filter rebuild should restore focus to the replacement filter');
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
    assert.equal(new URL(page.url()).searchParams.get('product'), 'chatgpt');
    assert.equal(new URL(page.url()).searchParams.get('tab'), 'summary');
    assert.equal(await page.locator('#detailModal').getAttribute('aria-modal'), 'true');
    assert.equal(await page.locator('[role="tab"][aria-selected="true"]').count(), 1);
    assert.equal(await page.locator('[role="tabpanel"]:not([hidden])').count(), 1);
    assert.equal(await page.locator('[role="tabpanel"]:not([hidden])').getAttribute('id'), 'tab-summary');
    const detailText = await page.locator('#detailContent').textContent();
    assert.match(detailText, /档案整理 2026\.08\.30/);
    assert.match(detailText, /事实复核：待人工事实复核/);
    assert.doesNotMatch(detailText, /最近复核|计划复核/);
    assert.match(await page.locator('.detail-meta-line').textContent(), new RegExp(`${products[0].sources.length} 条来源`));
    assert.equal(await page.locator('.source-ledger .detail-label').textContent(), `来源账本 · ${products[0].sources.length} 条`);
    assert.equal(await page.locator('.source-link').first().getAttribute('target'), '_blank');
    assert.match(await page.locator('.source-link').first().getAttribute('rel'), /noopener/);
    await page.locator('#detailClose').focus();
    await page.keyboard.press('Shift+Tab');
    assert.equal(await page.evaluate(() => document.activeElement?.classList.contains('source-link')), true);
    await page.keyboard.press('ArrowRight');
    assert.equal(await page.locator('[role="tab"][aria-selected="true"]').getAttribute('data-tab'), 'summary');
    assert.equal(await page.locator('[role="tabpanel"]:not([hidden])').getAttribute('id'), 'tab-summary');
    assert.equal(await page.evaluate(() => document.activeElement?.classList.contains('source-link')), true, 'source links must not be hijacked by tab arrows');
    await page.keyboard.press('Tab');
    assert.equal(await page.evaluate(() => document.activeElement?.id), 'detailClose');
    await page.keyboard.press('ArrowRight');
    assert.equal(await page.locator('[role="tab"][aria-selected="true"]').getAttribute('data-tab'), 'summary');
    await page.locator('[role="tab"][data-tab="summary"]').focus();
    await page.keyboard.press('ArrowRight');
    assert.match(await page.locator('[role="tab"][aria-selected="true"]').getAttribute('data-tab'), /mechanism/);
    assert.equal(new URL(page.url()).searchParams.get('tab'), 'mechanism');
    assert.equal(await page.locator('[role="tabpanel"]:not([hidden])').getAttribute('id'), 'tab-mechanism');
    await page.keyboard.press('End');
    assert.equal(await page.locator('[role="tab"][aria-selected="true"]').getAttribute('data-tab'), 'evolution');
    assert.equal(new URL(page.url()).searchParams.get('tab'), 'evolution');
    await page.keyboard.press('Home');
    assert.equal(await page.locator('[role="tab"][aria-selected="true"]').getAttribute('data-tab'), 'summary');
    assert.equal(new URL(page.url()).searchParams.get('tab'), 'summary');
    await page.keyboard.press('Escape');
    await page.locator('#detailModal.hidden').waitFor({ state: 'attached' });
    assert.equal(await page.evaluate(() => document.activeElement?.id), await firstCard.getAttribute('id'));
    assert.equal(new URL(page.url()).searchParams.has('product'), false);

    await page.goto(`${url}/tools/ai-insights/index.html`, { waitUntil: 'domcontentloaded' });
    await waitForProducts(page);
    await page.locator('.product-open').first().click();
    assert.equal(new URL(page.url()).searchParams.get('tab'), 'summary');
    await page.locator('[role="tab"][data-tab="mechanism"]').click();
    assert.equal(new URL(page.url()).searchParams.get('tab'), 'mechanism');
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.locator('#detailModal:not(.hidden)').waitFor({ state: 'visible' });
    assert.equal(await page.locator('[role="tab"][data-tab="mechanism"]').getAttribute('aria-selected'), 'true');
    await page.goBack();
    await page.waitForFunction(() => new URL(window.location.href).searchParams.get('tab') === 'summary');
    assert.equal(await page.locator('#detailModal:not(.hidden)').isVisible(), true);
    assert.equal(await page.locator('[role="tab"][data-tab="summary"]').getAttribute('aria-selected'), 'true');
    await page.goBack();
    await page.waitForFunction(() => !new URL(window.location.href).searchParams.has('product'));
    assert.equal(await page.locator('#detailModal').isHidden(), true);
    assert.equal(await page.evaluate(() => document.activeElement !== document.body && !document.activeElement?.hidden), true, 'Back must leave focus on a visible control');
    await page.goForward();
    await page.waitForFunction(() => new URL(window.location.href).searchParams.get('product') === 'chatgpt');
    await page.locator('#detailModal:not(.hidden)').waitFor({ state: 'visible' });
    assert.equal(await page.locator('[role="tab"][data-tab="summary"]').getAttribute('aria-selected'), 'true');
    await page.locator('#detailClose').click();
    await page.waitForFunction(() => !new URL(window.location.href).searchParams.has('product'));
    assert.equal(await page.locator('#detailModal').isHidden(), true);
    assert.equal(await page.evaluate(() => document.activeElement?.matches('.product-open')), true);

    for (const tabId of ['summary', 'mechanism', 'tradeoffs', 'evidence', 'evolution']) {
      await page.goto(`${url}/tools/ai-insights/index.html?product=chatgpt&tab=${tabId}`, { waitUntil: 'domcontentloaded' });
      await page.locator('#detailModal:not(.hidden)').waitFor({ state: 'visible' });
      if (tabId === 'mechanism') {
        await page.reload({ waitUntil: 'domcontentloaded' });
        await page.locator('#detailModal:not(.hidden)').waitFor({ state: 'visible' });
      }
      assert.equal(await page.locator('#detailModal').getAttribute('data-product-id'), 'chatgpt');
      assert.equal(await page.locator(`[role="tab"][data-tab="${tabId}"]`).getAttribute('aria-selected'), 'true');
      assert.equal(await page.locator('[role="tabpanel"]:not([hidden])').count(), 1);
      assert.equal(await page.locator('[role="tabpanel"]:not([hidden])').getAttribute('id'), `tab-${tabId}`);
      await page.keyboard.press('Escape');
      await page.locator('#detailModal.hidden').waitFor({ state: 'attached' });
      assert.equal(await page.evaluate(() => document.activeElement !== document.body && !document.activeElement?.hidden && document.activeElement?.offsetParent !== null), true, 'deep-link close must restore focus to a visible control');
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
    assert.deepEqual(pageErrors, [], 'the real page must not emit pageerror events');
  } finally {
    if (browser) await browser.close();
    await stopServer(server);
  }
});

test('AI Insights keeps valid records, explains load failures, and recovers on retry', { timeout: 50000 }, async () => {
  const { server, url } = await startServer();
  let browser;
  try {
    browser = await launchBrowser();
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
        name: 'partial-malformed-rendered-fields',
        first: { status: 200, contentType: 'application/json', body: JSON.stringify([products[0], malformedFieldsProduct]) },
        partial: /部分|无效/,
      },
      {
        name: 'partial-invalid-enum',
        first: { status: 200, contentType: 'application/json', body: JSON.stringify([products[0], invalidEnumProduct]) },
        partial: /部分|无效/,
      },
      {
        name: 'partial-invalid-id',
        first: { status: 200, contentType: 'application/json', body: JSON.stringify([products[0], invalidIdProduct]) },
        partial: /部分|无效/,
      },
      {
        name: 'partial-duplicate-product-id',
        first: { status: 200, contentType: 'application/json', body: JSON.stringify([products[0], duplicateProduct]) },
        partial: /部分|无效/,
      },
      {
        name: 'partial-javascript-url',
        first: { status: 200, contentType: 'application/json', body: JSON.stringify([products[0], invalidJavascriptUrlProduct]) },
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
      {
        name: 'all-malformed-rendered-fields',
        first: { status: 200, contentType: 'application/json', body: JSON.stringify([malformedFieldsProduct]) },
        error: /有效档案|无效|加载失败/,
      },
    ];

    for (const scenario of cases) {
      const page = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true });
      const pageErrors = [];
      page.on('pageerror', error => pageErrors.push(error));
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

      await page.locator('#retryLoad').focus();
      await page.locator('#retryLoad').click();
      await waitForProducts(page);
      assert.equal(await page.locator('.product-card').count(), products.length, `${scenario.name} retry should restore all records`);
      assert.equal(await page.evaluate(() => document.activeElement !== document.body && !document.activeElement?.hidden && document.activeElement?.offsetParent !== null), true, `${scenario.name} retry should restore focus to a visible control`);
      assert.equal(await page.evaluate(() => document.activeElement?.matches('.product-open, #clearFilters')), true, `${scenario.name} retry should focus a product or filter control`);
      assert.ok(requests >= 2, `${scenario.name} should issue a new request on retry`);
      assert.deepEqual(pageErrors, [], `${scenario.name} must not emit pageerror events`);
      await page.close();
    }
  } finally {
    if (browser) await browser.close();
    await stopServer(server);
  }
});

test('AI Insights renders hostile text safely and keeps long mobile details within the viewport', { timeout: 40000 }, async () => {
  const { server, url } = await startServer();
  let browser;
  try {
    browser = await launchBrowser();
    const page = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true });
    const pageErrors = [];
    page.on('pageerror', error => pageErrors.push(error));
    await page.route(dataUrl, route => route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([maliciousTextProduct, longDetailProduct]),
    }));

    await page.goto(`${url}/tools/ai-insights/index.html?product=malicious-text&tab=evidence`, { waitUntil: 'domcontentloaded' });
    await page.locator('#detailModal:not(.hidden)').waitFor({ state: 'visible' });
    assert.match(await page.locator('#detailContent').textContent(), /<img|<script|恶意来源/);
    assert.equal(await page.locator('#detailContent img, #detailContent script, #detailContent svg').count(), 0, 'hostile text must remain text');
    assert.equal(await page.evaluate(() => window.__xss === true), false);
    assert.match(await page.locator('.source-link').first().getAttribute('rel'), /noopener/);
    assert.equal(await page.locator('.source-link').first().getAttribute('target'), '_blank');

    await page.goto(`${url}/tools/ai-insights/index.html?product=long-detail&tab=evolution`, { waitUntil: 'domcontentloaded' });
    await page.locator('#detailModal:not(.hidden)').waitFor({ state: 'visible' });
    const overflow = await page.evaluate(() => {
      const modal = document.querySelector('.modal-card');
      return {
        document: document.documentElement.scrollWidth <= window.innerWidth,
        body: document.body.scrollWidth <= window.innerWidth,
        modal: modal.scrollWidth <= modal.clientWidth,
      };
    });
    assert.deepEqual(overflow, { document: true, body: true, modal: true });
    assert.deepEqual(pageErrors, [], 'hostile and long content must not emit pageerror events');
  } finally {
    if (browser) await browser.close();
    await stopServer(server);
  }
});
