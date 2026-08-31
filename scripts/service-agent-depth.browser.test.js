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

function isSpawnEperm(error) {
  const message = error && error.message ? error.message : '';
  return Boolean(error && (error.code === 'EPERM' || /spawn\s+EPERM/i.test(message)));
}

function findLocalEdgeExecutable() {
  const candidates = [
    process.env.LOCALAPPDATA && path.join(process.env.LOCALAPPDATA, 'Microsoft', 'Edge', 'Application', 'msedge.exe'),
    process.env.ProgramFiles && path.join(process.env.ProgramFiles, 'Microsoft', 'Edge', 'Application', 'msedge.exe'),
    process.env['ProgramFiles(x86)'] && path.join(process.env['ProgramFiles(x86)'], 'Microsoft', 'Edge', 'Application', 'msedge.exe'),
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  ].filter(Boolean);
  return candidates.find((candidate) => fs.existsSync(candidate)) || null;
}

async function launchBrowser() {
  const configuredExecutablePath = (process.env.PLAYWRIGHT_EXECUTABLE_PATH || '').trim();
  if (configuredExecutablePath) {
    return chromium.launch({ headless: true, executablePath: configuredExecutablePath });
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

test('service-agent depth supports scenario switching, four fault drills, HITL, export, and restart', { timeout: 60000 }, async () => {
  const { server, url } = await startServer();
  let browser;
  try {
    browser = await launchBrowser();
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();
    const pageErrors = [];
    const sensitiveSentinel = 'SENSITIVE-UNAUTHORIZED-8f31c2';
    page.on('pageerror', (error) => pageErrors.push(error.message));

    await page.goto(`${url}/tools/service-agent/index.html`, { waitUntil: 'domcontentloaded' });
    await page.locator('#acceptance-card').waitFor({ state: 'visible' });
    assert.equal(await page.locator('.scn-card[data-scn="ecom"]').evaluate((card) => card.classList.contains('on')), true);

    const firstDecision = page.locator('.dcard').first().locator('.dcard-head');
    assert.equal(await firstDecision.evaluate((button) => button.tagName), 'BUTTON');
    assert.equal(await firstDecision.getAttribute('aria-expanded'), 'false');
    assert.ok(await firstDecision.getAttribute('aria-controls'));
    await firstDecision.focus();
    await page.keyboard.press('Enter');
    assert.equal(await firstDecision.getAttribute('aria-expanded'), 'true');
    await page.keyboard.press('Space');
    assert.equal(await firstDecision.getAttribute('aria-expanded'), 'false');

    const ragNode = page.locator('#flow-node-rag');
    assert.equal(await ragNode.evaluate((button) => button.tagName), 'BUTTON');
    assert.ok(await ragNode.getAttribute('aria-controls'));
    assert.equal(await ragNode.getAttribute('aria-expanded'), 'false');
    await ragNode.focus();
    await page.keyboard.press('Enter');
    assert.equal(await ragNode.getAttribute('aria-expanded'), 'true');
    assert.equal(await firstDecision.getAttribute('aria-expanded'), 'false');
    assert.equal(await page.locator('.dcard.flash').count(), 1);
    await page.locator('#restart-demo-btn').click();
    assert.equal(await page.locator('.dcard.flash').count(), 0);

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

    await page.locator('#chat-input').fill('请查一下我的订单到哪了？');
    await page.locator('#send-btn').click();
    await page.locator('#restart-demo-btn').click();
    await page.waitForTimeout(2200);
    assert.equal(await page.locator('#chat-messages .user').count(), 0);
    assert.equal(await page.locator('#chat-messages .assistant').count(), 1);
    assert.equal(await page.locator('#chat-input').inputValue(), '');
    assert.equal(await page.locator('#step-stream').textContent(), '');
    assert.equal(await page.locator('#run-log').textContent(), '');
    assert.equal(await page.locator('#run-review').isVisible(), false);
    assert.equal(await page.evaluate(() => window.__SERVICE_AGENT__.getRunTrace()), null);
    assert.equal(await page.locator('[data-fnode]:not([data-state="idle"])').count(), 0);

    await page.locator('#chat-input').fill('请查一下我的订单到哪了？ '+sensitiveSentinel);
    await page.locator('#send-btn').click();
    await waitForCompleteReview(page);
    const normalSensitiveState = await page.evaluate((sentinel) => {
      const trace = window.__SERVICE_AGENT__.getRunTrace();
      const exported = window.__SERVICE_AGENT__.getExportPayload();
      return {
        domText: document.body.textContent.includes(sentinel),
        domMarkup: document.body.innerHTML.includes(sentinel),
        input: document.getElementById('chat-input').value.includes(sentinel),
        trace: JSON.stringify(trace).includes(sentinel),
        export: JSON.stringify(exported).includes(sentinel),
      };
    }, sensitiveSentinel);
    assert.deepEqual(normalSensitiveState, {
      domText: false,
      domMarkup: false,
      input: false,
      trace: false,
      export: false,
    });
    const [normalDownload] = await Promise.all([
      page.waitForEvent('download'),
      page.locator('#export-run-btn').click(),
    ]);
    const normalDownloadPath = await normalDownload.path();
    assert.doesNotMatch(fs.readFileSync(normalDownloadPath, 'utf8'), new RegExp(sensitiveSentinel));

    await page.locator('#restart-demo-btn').click();
    await page.locator('#chat-input').fill('我要投诉，问题很严重 '+sensitiveSentinel);
    await page.locator('#send-btn').click();
    await page.locator('#hitl-card').waitFor({ state: 'visible' });
    assert.equal(await page.locator('#export-run-btn').isDisabled(), false);
    const hitlSensitiveState = await page.evaluate((sentinel) => {
      const trace = window.__SERVICE_AGENT__.getRunTrace();
      const exported = window.__SERVICE_AGENT__.getExportPayload();
      return {
        domText: document.body.textContent.includes(sentinel),
        domMarkup: document.body.innerHTML.includes(sentinel),
        trace: JSON.stringify(trace).includes(sentinel),
        export: JSON.stringify(exported).includes(sentinel),
      };
    }, sensitiveSentinel);
    assert.deepEqual(hitlSensitiveState, { domText: false, domMarkup: false, trace: false, export: false });
    await page.locator('[data-hitl-action="approve"]').focus();
    assert.equal(await page.evaluate(() => document.activeElement.dataset.hitlAction), 'approve');
    await page.keyboard.press('Tab');
    assert.equal(await page.evaluate(() => document.activeElement.dataset.hitlAction), 'reject');
    await page.keyboard.press('Shift+Tab');
    assert.equal(await page.evaluate(() => document.activeElement.dataset.hitlAction), 'approve');
    await page.keyboard.press('Enter');
    assert.equal(await page.locator('#run-review').getAttribute('data-final-status'), 'resolving-human');
    assert.equal(await page.locator('#export-run-btn').isDisabled(), true);
    await waitForCompleteReview(page);
    const completedSensitiveState = await page.evaluate((sentinel) => {
      const trace = window.__SERVICE_AGENT__.getRunTrace();
      const exported = window.__SERVICE_AGENT__.getExportPayload();
      return {
        domText: document.body.textContent.includes(sentinel),
        domMarkup: document.body.innerHTML.includes(sentinel),
        trace: JSON.stringify(trace).includes(sentinel),
        export: JSON.stringify(exported).includes(sentinel),
      };
    }, sensitiveSentinel);
    assert.deepEqual(completedSensitiveState, { domText: false, domMarkup: false, trace: false, export: false });
    const [hitlDownload] = await Promise.all([
      page.waitForEvent('download'),
      page.locator('#export-run-btn').click(),
    ]);
    const hitlDownloadPath = await hitlDownload.path();
    assert.doesNotMatch(fs.readFileSync(hitlDownloadPath, 'utf8'), new RegExp(sensitiveSentinel));

    await page.locator('#restart-demo-btn').click();
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
    assert.equal(await page.locator('#hitl-card').getAttribute('role'), 'dialog');
    assert.equal(await page.locator('#hitl-card').getAttribute('aria-labelledby'), 'hitl-title');
    assert.equal(await page.locator('#hitl-card').getAttribute('aria-describedby'), 'hitl-description');
    assert.equal(await page.locator('[data-review-status]').getAttribute('role'), 'status');
    assert.equal(await page.locator('[data-review-status]').getAttribute('aria-live'), 'polite');
    assert.equal(await page.evaluate(() => document.activeElement.dataset.hitlAction), 'approve');
    await page.locator('[data-hitl-action="approve"]').click();
    assert.equal(await page.locator('#run-review').getAttribute('data-final-status'), 'resolving-human');
    assert.equal(await page.locator('#export-run-btn').isDisabled(), true);
    await waitForCompleteReview(page);
    const trace = await page.evaluate(() => window.__SERVICE_AGENT__.getRunTrace());
    assert.equal(trace.finalStatus, 'completed');
    assert.ok(trace.visitedNodes.includes('hitl'));
    assert.ok(trace.visitedNodes.includes('reply'));
    assert.equal(trace.hitlActions.at(-1).action, 'approve');
    assert.equal(await page.locator('#hitl-card').getAttribute('data-hitl-state'), 'resolved');
    assert.equal(await page.evaluate(() => document.activeElement.id), 'run-fault-btn');

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

    for (const action of ['reject', 'delegate']) {
      await page.locator('#fault-select').selectOption('ecom:low-confidence-intent');
      await page.locator('#run-fault-btn').click();
      await page.locator('#hitl-card').waitFor({ state: 'visible' });
      await page.locator('[data-hitl-action="'+action+'"]').click();
      await page.locator('#hitl-card[data-hitl-state="handed-off"]').waitFor({ state: 'visible' });
      assert.equal(await page.locator('#run-review').getAttribute('data-state'), 'pending-human');
      assert.equal(await page.locator('#run-review').getAttribute('data-final-status'), 'pending-human');
      const handoffTrace = await page.evaluate(() => window.__SERVICE_AGENT__.getRunTrace());
      assert.equal(handoffTrace.finalStatus, 'pending-human');
      assert.ok(handoffTrace.pendingHumanItems.length > 0);
      assert.ok(handoffTrace.visitedNodes.includes('reply'));
      if (action === 'delegate') assert.ok(handoffTrace.visitedNodes.includes('handoff-ack'));
      assert.notEqual(await page.locator('#hitl-card').getAttribute('data-hitl-state'), 'resolved');
      assert.equal(await page.locator('#export-run-btn').isDisabled(), false);
      const handoffExport = await page.evaluate(() => window.__SERVICE_AGENT__.getExportPayload());
      assert.equal(handoffExport.runTrace.finalStatus, 'pending-human');
      assert.ok(handoffExport.runTrace.pendingHumanItems.length > 0);
      await page.locator('#restart-demo-btn').click();
    }

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
    await mobile.locator('.dcard-head').first().focus();
    await mobile.keyboard.press('Space');
    assert.equal(await mobile.locator('.dcard-head').first().getAttribute('aria-expanded'), 'true');
    assert.equal(await mobile.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth), true);
    await mobile.locator('#fault-select').selectOption('ecom:low-confidence-intent');
    await mobile.locator('#run-fault-btn').click();
    await mobile.locator('#hitl-card').waitFor({ state: 'visible' });
    assert.equal(await mobile.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth), true);
    assert.equal(await mobile.evaluate(() => document.activeElement.dataset.hitlAction), 'approve');
    await mobile.keyboard.press('Tab');
    assert.equal(await mobile.evaluate(() => document.activeElement.dataset.hitlAction), 'reject');
    await mobile.keyboard.press('Space');
    await mobile.locator('#hitl-card[data-hitl-state="handed-off"]').waitFor({ state: 'visible' });
    assert.equal(await mobile.locator('#run-review').getAttribute('data-final-status'), 'pending-human');
    assert.equal(await mobile.locator('#export-run-btn').isDisabled(), false);
    assert.equal(await mobile.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth), true);
    await mobileContext.close();
  } finally {
    if (browser) await browser.close();
    await stopServer(server);
  }
});
