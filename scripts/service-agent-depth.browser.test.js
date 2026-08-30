'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
let chromium;
try {
  ({ chromium } = require('@playwright/test'));
} catch (error) {
  // The desktop workspace bundles Playwright without the test runner package.
  ({ chromium } = require('playwright'));
}

const { BLOCKED_BROWSER_PORTS, createStaticServer } = require('./equivalence/servers');

const repoRoot = path.resolve(__dirname, '..');

function startServer() {
  return new Promise((resolve, reject) => {
    const server = createStaticServer({ rootDir: repoRoot, label: 'service-agent-depth' });
    server.once('error', reject);
    function listen() {
      server.listen(0, '127.0.0.1', () => {
        const address = server.address();
        if (BLOCKED_BROWSER_PORTS.has(address.port)) return server.close(listen);
        resolve({ server, url: `http://127.0.0.1:${address.port}` });
      });
    }
    listen();
  });
}

function stopServer(server) {
  return new Promise((resolve) => server.close(resolve));
}

async function acceptanceSnapshot(page) {
  return page.locator('#acceptance-card [data-acceptance-key]').evaluateAll((rows) => Object.fromEntries(
    rows.map((row) => [row.dataset.acceptanceKey, {
      kind: row.dataset.acceptanceKind,
      text: row.querySelector('[data-acceptance-text]').textContent.trim(),
    }])
  ));
}

async function waitForCompleteReview(page) {
  await page.locator('#run-review[data-state="complete"]').waitFor({ state: 'visible' });
}

test('service-agent depth supports scenario switching, four fault drills, HITL, export, and restart', { timeout: 60000 }, async () => {
  const { server, url } = await startServer();
  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();
    const pageErrors = [];
    page.on('pageerror', (error) => pageErrors.push(error.message));

    await page.goto(`${url}/tools/service-agent/index.html`, { waitUntil: 'domcontentloaded' });
    await page.locator('#acceptance-card').waitFor({ state: 'visible' });
    assert.equal(await page.locator('.scn-card[data-scn="ecom"]').evaluate((card) => card.classList.contains('on')), true);

    const snapshots = {};
    for (const scenario of ['ecom', 'bank', 'startup']) {
      await page.locator(`.scn-card[data-scn="${scenario}"]`).click();
      await page.locator(`.scn-card[data-scn="${scenario}"].on`).waitFor();
      snapshots[scenario] = await acceptanceSnapshot(page);
      assert.deepEqual(Object.keys(snapshots[scenario]), ['successMetric', 'hardGuardrail', 'costConstraint', 'hitlPolicy']);
    }
    for (const field of Object.keys(snapshots.ecom)) {
      assert.notEqual(snapshots.ecom[field].text, snapshots.bank[field].text, `${field} ecom/bank`);
      assert.notEqual(snapshots.bank[field].text, snapshots.startup[field].text, `${field} bank/startup`);
    }

    await page.locator('.scn-card[data-scn="ecom"]').click();
    await page.locator('#fault-select').waitFor();
    await page.locator('.quick-btn').first().click();
    await waitForCompleteReview(page);
    const normalTrace = await page.evaluate(() => window.__SERVICE_AGENT__.getRunTrace());
    assert.equal(normalTrace.finalStatus, 'completed');
    assert.equal(normalTrace.faultType, null);
    assert.ok(normalTrace.visitedNodes.includes('rag'));
    await page.locator('#restart-demo-btn').click();
    const outcomes = new Map();
    for (const faultType of ['stale-knowledge', 'prompt-injection', 'unauthorized-data']) {
      await page.locator('#fault-select').selectOption(`ecom:${faultType}`);
      await page.locator('#run-fault-btn').click();
      await waitForCompleteReview(page);
      const outcome = await page.locator('[data-run-outcome]').textContent();
      outcomes.set(faultType, outcome.trim());
      assert.equal(await page.locator('#run-review').getAttribute('data-fault-type'), faultType);
    }
    assert.equal(new Set(outcomes.values()).size, 3);

    await page.locator('#fault-select').selectOption('ecom:stale-knowledge');
    await page.locator('#run-fault-btn').click();
    await waitForCompleteReview(page);
    assert.equal(await page.locator('#flow-node-rag').getAttribute('data-state'), 'blocked');

    await page.locator('#fault-select').selectOption('ecom:prompt-injection');
    await page.locator('#run-fault-btn').click();
    await waitForCompleteReview(page);
    assert.equal(await page.locator('#flow-node-guard-in').getAttribute('data-state'), 'blocked');

    await page.locator('#fault-select').selectOption('ecom:unauthorized-data');
    await page.locator('#run-fault-btn').click();
    await waitForCompleteReview(page);
    assert.equal(await page.locator('#flow-node-sql').getAttribute('data-state'), 'blocked');
    assert.equal(await page.locator('#asp-logi-reply').evaluate((node) => node.classList.contains('done')), false);
    assert.doesNotMatch(await page.locator('#run-log').textContent(), /数据返回|返回账户数据/);

    await page.locator('#fault-select').selectOption('ecom:low-confidence-intent');
    await page.locator('#run-fault-btn').click();
    await page.locator('#hitl-card').waitFor({ state: 'visible' });
    assert.equal(await page.locator('#run-review').getAttribute('data-state'), 'pending-human');
    assert.equal(await page.locator('#flow-node-hitl').getAttribute('data-state'), 'waiting');
    await page.locator('[data-hitl-action="approve"]').click();
    await waitForCompleteReview(page);
    const trace = await page.evaluate(() => window.__SERVICE_AGENT__.getRunTrace());
    assert.equal(trace.finalStatus, 'completed');
    assert.ok(trace.visitedNodes.includes('hitl'));
    assert.equal(trace.hitlActions.at(-1).action, 'approve');

    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.locator('#export-run-btn').click(),
    ]);
    const downloadPath = await download.path();
    const exported = JSON.parse(fs.readFileSync(downloadPath, 'utf8'));
    assert.equal(exported.version, 1);
    assert.equal(exported.mode, 'mock');
    assert.equal(exported.scenario, 'ecom');
    assert.equal(exported.decisionCards.length, 9);
    assert.deepEqual(Object.keys(exported.acceptanceCard), ['successMetric', 'hardGuardrail', 'costConstraint', 'hitlPolicy']);
    assert.equal(exported.runTrace.finalStatus, 'completed');
    assert.doesNotMatch(JSON.stringify(exported), /手机号|身份证|真实用户信息|email|phone/i);

    await page.locator('#restart-demo-btn').click();
    assert.equal(await page.locator('#run-review').isVisible(), false);
    assert.equal(await page.locator('#hitl-card').count(), 0);
    assert.equal(await page.locator('#run-log').textContent(), '');
    assert.equal(await page.evaluate(() => window.__SERVICE_AGENT__.getRunTrace()), null);
    assert.equal(await page.locator('#flow-node-sql').getAttribute('data-state'), 'idle');

    await page.locator('.scn-card[data-scn="bank"]').click();
    assert.equal(await page.locator('#run-review').isVisible(), false);
    assert.equal(await page.locator('#run-log').textContent(), '');
    assert.equal(await page.locator('#chat-messages .assistant').count(), 1);
    assert.deepEqual(await acceptanceSnapshot(page), snapshots.bank);
    assert.deepEqual(pageErrors, []);
    await context.close();

    const mobileContext = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true });
    const mobile = await mobileContext.newPage();
    await mobile.goto(`${url}/tools/service-agent/index.html`, { waitUntil: 'domcontentloaded' });
    await mobile.locator('#acceptance-card').waitFor({ state: 'visible' });
    assert.equal(await mobile.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth), true);
    assert.equal(await mobile.locator('#demo-trust-boundary').isVisible(), true);
    assert.equal(await mobile.locator('#fault-select').isVisible(), true);
    await mobileContext.close();
  } finally {
    if (browser) await browser.close();
    await stopServer(server);
  }
});
