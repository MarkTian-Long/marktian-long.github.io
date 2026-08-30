'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const { chromium } = require('@playwright/test');

const { BLOCKED_BROWSER_PORTS, createStaticServer } = require('./equivalence/servers');

const repoRoot = path.resolve(__dirname, '..');
const dataPath = path.join(repoRoot, 'tools', 'trends', 'data', 'trends.json');
const screenshotDir = process.env.TRENDS_SCREENSHOT_DIR;

async function capture(page, name, options = {}) {
  if (screenshotDir) {
    fs.mkdirSync(screenshotDir, { recursive: true });
    await page.screenshot({ path: path.join(screenshotDir, name), ...options });
  }
}

function startServer() {
  return new Promise((resolve, reject) => {
    const server = createStaticServer({ rootDir: repoRoot, label: 'trends-depth' });
    server.once('error', reject);
    const listen = () => server.listen(0, '127.0.0.1', () => {
      const address = server.address();
      if (!address || typeof address === 'string') return reject(new Error('server did not receive a TCP address'));
      if (BLOCKED_BROWSER_PORTS.has(address.port)) return server.close(listen);
      resolve({ server, url: `http://127.0.0.1:${address.port}` });
    });
    listen();
  });
}

function stopServer(server) {
  return new Promise(resolve => server.close(resolve));
}

function frozenClock(iso = '2026-08-30T12:00:00.000Z') {
  const fixed = Date.parse(iso);
  const OriginalDate = Date;
  class FrozenDate extends OriginalDate {
    constructor(...args) {
      super(...(args.length ? args : [fixed]));
    }
    static now() { return fixed; }
    static parse(value) { return OriginalDate.parse(value); }
    static UTC(...args) { return OriginalDate.UTC(...args); }
  }
  window.Date = FrozenDate;
}

test('trends v2 page renders research states, keyboard actions and recoverable load errors', { timeout: 45000 }, async () => {
  const { server, url } = await startServer();
  let browser;
  const pageErrors = [];
  const originalData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  const noResultData = structuredClone(originalData);
  noResultData.boards.forEach(board => board.items.forEach(item => { item.actions = ['watch']; }));
  const longTitleData = structuredClone(originalData);
  longTitleData.boards[0].items[0].title = '这是一个很长的信号标题，用来确认窄屏卡片会自然换行而不会把页面撑出横向滚动条';
  const freshnessData = structuredClone(originalData);
  freshnessData.reviewed_at = freshnessData.as_of;
  let fixture = 'good';
  try {
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    await context.addInitScript(frozenClock);
    await context.route(/https:\/\/fonts\.(?:googleapis|gstatic)\.com\//, route => route.abort());
    await context.route('**/tools/trends/data/trends.json', async route => {
      if (fixture === '404') return route.fulfill({ status: 404, contentType: 'text/plain', body: 'missing' });
      if (fixture === 'invalid') return route.fulfill({ status: 200, contentType: 'application/json', body: '{not-json' });
      if (fixture === 'empty') {
        const empty = structuredClone(originalData);
        empty.boards[0].items = [];
        return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(empty) });
      }
      if (fixture === 'no-result') return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(noResultData) });
      if (fixture === 'long-title') return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(longTitleData) });
      return route.continue();
    });
    const page = await context.newPage();
    page.on('pageerror', error => pageErrors.push(error.message));

    await page.goto(`${url}/tools/trends/index.html`, { waitUntil: 'domcontentloaded' });
    await page.locator('#app[data-state="ready"]').waitFor();
    assert.match(await page.locator('#snapshot-status').textContent(), /历史快照，不代表当前热度/);
    assert.equal(await page.locator('#verification-status').textContent(), '结构检查完成');
    assert.match(await page.locator('#snapshot-dates').textContent(), /快照观察 2026-05-19 · 契约\/结构复核 2026-08-30/);
    assert.match(await page.locator('#historical-caveat').textContent(), /历史事实未在本轮重验/);
    assert.doesNotMatch(await page.locator('body').textContent(), /Claude 点评|Codex 点评|最新|manual_reviewed|candidate/);
    assert.ok(await page.locator('.signal-meta').first().evaluate(meta => {
      const text = meta.textContent || '';
      return /快照观察 2026-05-19/.test(text) && /历史事实未在本轮重验/.test(text) && /仅结构检查/.test(text);
    }));
    assert.doesNotMatch(await page.locator('.signal-meta').first().textContent(), /manual_reviewed|candidate/);
    assert.equal(await page.locator('[role="tab"][data-board-id]').count(), 5);
    assert.equal(await page.locator('#workflow .workflow-step').count(), 4);
    assert.deepEqual(await page.locator('#workflow .workflow-title').allTextContents(), ['信源', '信号', '分析', '方法']);
    assert.deepEqual(await page.locator('#workflow .workflow-step').evaluateAll(links => links.map(link => link.getAttribute('href'))), [
      '../radar/index.html', '../trends/index.html', '../ai-insights/index.html', '../agent-hub/index.html',
    ]);
    assert.equal(await page.locator('[aria-current="step"]').count(), 1);
    assert.equal(await page.locator('[aria-current="step"]').getAttribute('id'), 'workflow-nav-trends');
    assert.equal(await page.locator('#workflow-nav a').count(), 4);
    await capture(page, 'desktop-default.png');

    const boardTabs = page.locator('[role="tab"][data-board-id]');
    await boardTabs.first().focus();
    await page.keyboard.press('Tab');
    assert.equal(await page.evaluate(() => document.activeElement?.dataset.boardId), await boardTabs.nth(1).getAttribute('data-board-id'));
    await page.keyboard.press('Enter');
    assert.equal(await boardTabs.nth(1).getAttribute('aria-selected'), 'true');

    await page.locator('#action-filter').selectOption('deep_dive');
    await page.locator('.signal-card').first().waitFor();
    assert.ok(await page.locator('.signal-card').evaluateAll(cards => cards.every(card => card.dataset.actions.split(' ').includes('deep_dive'))));

    const judgmentToggle = page.locator('.judgment-toggle').first();
    const judgmentId = await judgmentToggle.getAttribute('aria-controls');
    assert.equal(await judgmentToggle.getAttribute('aria-expanded'), 'false');
    await judgmentToggle.click();
    assert.equal(await judgmentToggle.getAttribute('aria-expanded'), 'true');
    assert.equal(await page.locator(`#${judgmentId}`).isVisible(), true);
    assert.match(await page.locator(`#${judgmentId}`).textContent(), /变化|证据|影响|不确定性|下一步/);
    assert.ok(await page.locator('a[target="_blank"]').evaluateAll(links => links.every(link => /^https:\/\//.test(link.href) && /noopener/.test(link.rel) && /noreferrer/.test(link.rel))));
    await capture(page, 'desktop-filter-expanded.png');

    await page.locator('#view-tab-sources').click();
    assert.equal(await page.locator('#sources-panel').isVisible(), true);
    assert.equal(await page.locator('#signals-panel').isVisible(), false);
    await capture(page, 'desktop-sources.png');
    await page.locator('#view-tab-signals').click();

    fixture = 'no-result';
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.locator('#app[data-state="ready"]').waitFor();
    await page.locator('#action-filter').selectOption('adopt');
    await page.locator('#filter-empty').waitFor({ state: 'visible' });
    assert.match(await page.locator('#filter-empty').textContent(), /没有符合|无结果/);

    for (const mode of ['404', 'invalid', 'empty']) {
      fixture = mode;
      await page.reload({ waitUntil: 'domcontentloaded' });
      await page.locator('#app[data-state="error"]').waitFor();
      assert.equal(await page.locator('#retry-button').isVisible(), true);
      assert.match(await page.locator('#error-state').textContent(), mode === 'empty' ? /空板块|没有可用/ : /加载失败|JSON|不存在/);
      assert.equal(await page.locator('.signal-card').count(), 0);
      if (mode === '404') await capture(page, 'desktop-error.png');
      fixture = 'good';
      await page.locator('#retry-button').click();
      await page.locator('#app[data-state="ready"]').waitFor();
    }

    await page.setViewportSize({ width: 390, height: 844 });
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.locator('#app[data-state="ready"]').waitFor();
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth), true);
    assert.equal(await page.locator('.judgment-toggle').first().evaluate(button => button.getBoundingClientRect().height >= 44), true);
    assert.ok(await page.locator('.signal-title').evaluateAll(titles => titles.every(title => title.getBoundingClientRect().width <= window.innerWidth)));
    await page.evaluate(() => window.scrollTo(0, 0));
    await capture(page, 'mobile-default.png');
    await page.locator('#view-tab-sources').click();
    await capture(page, 'mobile-sources.png');
    await page.locator('#view-tab-signals').click();
    fixture = 'no-result';
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.locator('#app[data-state="ready"]').waitFor();
    await page.locator('#action-filter').selectOption('adopt');
    await page.locator('#filter-empty').waitFor({ state: 'visible' });
    await capture(page, 'mobile-no-results.png');
    fixture = 'long-title';
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.locator('#app[data-state="ready"]').waitFor();
    await page.locator('.signal-title').first().scrollIntoViewIfNeeded();
    await capture(page, 'mobile-long-title.png');
    await page.locator('.judgment-toggle').first().click();
    await capture(page, 'mobile-long-title-expanded.png', { fullPage: true });
    assert.equal(pageErrors.length, 0, pageErrors.join('\n'));
    await context.close();

    const expectedFreshness = [
      ['2026-05-26T12:00:00.000Z', '本期'],
      ['2026-05-27T12:00:00.000Z', '建议复核'],
      ['2026-06-18T12:00:00.000Z', '建议复核'],
      ['2026-06-19T12:00:00.000Z', '历史快照，不代表当前热度'],
    ];
    for (const [clock, label] of expectedFreshness) {
      const freshnessContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
      await freshnessContext.addInitScript(frozenClock, clock);
      await freshnessContext.route('**/tools/trends/data/trends.json', route => route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(freshnessData),
      }));
      const freshnessPage = await freshnessContext.newPage();
      freshnessPage.on('pageerror', error => pageErrors.push(error.message));
      await freshnessPage.goto(`${url}/tools/trends/index.html`, { waitUntil: 'domcontentloaded' });
      await freshnessPage.locator('#app[data-state="ready"]').waitFor();
      assert.equal(await freshnessPage.locator('#snapshot-status').textContent(), label);
      await freshnessContext.close();
    }
    assert.equal(pageErrors.length, 0, pageErrors.join('\n'));
  } finally {
    if (browser) await browser.close();
    await stopServer(server);
  }
});
