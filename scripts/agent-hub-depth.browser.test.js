const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('@playwright/test');

const { BLOCKED_BROWSER_PORTS, createStaticServer } = require('./equivalence/servers');

const repoRoot = path.resolve(__dirname, '..');

function startServer() {
  return new Promise((resolve, reject) => {
    const server = createStaticServer({ rootDir: repoRoot, label: 'agent-hub-depth' });
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

async function maybeScreenshot(page, name) {
  const outputDir = process.env.AGENT_HUB_SCREENSHOT_DIR;
  if (!outputDir) return;
  fs.mkdirSync(outputDir, { recursive: true });
  await page.screenshot({ path: path.join(outputDir, `${name}.png`), fullPage: true });
}

async function gotoAgentHub(page, url) {
  await page.goto(`${url}/tools/agent-hub/index.html`, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('#agentHubApp');
  await page.waitForSelector('#data-ready');
}

async function selectPreset(page, id) {
  await page.locator(`#${id}`).click();
  await page.locator('#decision-result').waitFor({ state: 'visible' });
  return page.locator('#decision-mode').textContent();
}

test('Agent Hub depth supports six-question keyboard decisions, explainable outcomes and safe failure states', { timeout: 60000 }, async () => {
  const { server, url } = await startServer();
  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: 'zh-CN' });
    await context.route(/https:\/\/fonts\.(?:googleapis|gstatic)\.com\//, (route) => route.abort());
    const page = await context.newPage();
    await gotoAgentHub(page, url);

    assert.match(await page.locator('h1').textContent(), /Agent 认知全景/);
    assert.match(await page.locator('#boundary-note').textContent(), /静态/);
    assert.match(await page.locator('#boundary-note').textContent(), /不调用模型/);
    assert.match(await page.locator('#boundary-note').textContent(), /不代表生产数据/);
    assert.equal(await page.locator('.chain-step').count(), 4);
    assert.deepEqual(await page.locator('.chain-step').evaluateAll((links) => links.map((link) => ({
      href: link.getAttribute('href'),
      label: link.querySelector('.chain-index')?.textContent,
    }))), [
      { href: '../radar/index.html', label: '1 信源' },
      { href: '../trends/index.html', label: '2 信号' },
      { href: '../ai-insights/index.html', label: '3 分析' },
      { href: '../agent-hub/index.html', label: '4 方法' },
    ]);
    assert.equal(await page.locator('.chain-step[aria-current="step"]').count(), 1);
    assert.equal(await page.locator('.chain-step[aria-current="step"]').getAttribute('href'), '../agent-hub/index.html');
    assert.equal(await page.locator('.question-card').count(), 6);
    assert.equal(await page.locator('#decision-result').isHidden(), true);
    await maybeScreenshot(page, 'desktop-initial');

    const firstAnswer = page.locator('input[name="taskClarity"][value="clear"]');
    await firstAnswer.focus();
    await page.keyboard.press('Space');
    assert.equal(await firstAnswer.isChecked(), true);
    for (const questionId of ['repeatability', 'knowledge', 'decomposition', 'risk', 'evaluation']) {
      const firstOption = page.locator(`input[name="${questionId}"]`).first();
      await firstOption.focus();
      await page.keyboard.press('Space');
      assert.equal(await firstOption.isChecked(), true, `${questionId} should be keyboard operable`);
    }
    await maybeScreenshot(page, 'desktop-low-risk');

    const tabs = page.getByRole('tab');
    const tabPanels = page.getByRole('tabpanel', { includeHidden: true });
    assert.equal(await tabs.count(), 4);
    assert.equal(await tabPanels.count(), 4);
    for (let index = 0; index < 4; index += 1) {
      const tab = tabs.nth(index);
      await tab.focus();
      await page.keyboard.press('Enter');
      assert.equal(await tab.getAttribute('aria-selected'), 'true');
      assert.equal(await tabPanels.nth(index).isVisible(), true);
    }
    await tabs.nth(0).click();

    const parallelMode = await selectPreset(page, 'preset-bi-reporting');
    const retrievalMode = await selectPreset(page, 'preset-legal-documents');
    assert.notEqual(parallelMode, retrievalMode);
    assert.match(retrievalMode, /RAG|检索|Agent/);
    assert.match(await page.locator('#decision-rules').textContent(), /命中规则/);
    assert.match(await page.locator('#decision-exclusions').textContent(), /排除|替代/);
    assert.match(await page.locator('#decision-normal-path').textContent(), /正常链路/);
    assert.match(await page.locator('#decision-fallback').textContent(), /失败|降级/);
    assert.match(await page.locator('#decision-stop').textContent(), /停止条件/);
    assert.match(await page.locator('#decision-metrics').textContent(), /proxy|代理|指标/);
    assert.equal(await page.locator('#scene-link-service-agent').getAttribute('href'), '../service-agent/index.html');
    assert.equal(await page.locator('#scene-link-esop').getAttribute('href'), '../esop-extractor/index.html');
    assert.match(await page.locator('#decision-controls').textContent(), /预览/);
    assert.match(await page.locator('#decision-controls').textContent(), /HITL/);
    assert.match(await page.locator('#decision-controls').textContent(), /审计/);
    assert.match(await page.locator('#decision-controls').textContent(), /停止/);
    await maybeScreenshot(page, 'desktop-high-risk');

    await page.locator('input[name="taskClarity"][value="unclear"]').check();
    assert.equal(await page.locator('#decision-result.needs-input').count(), 1);
    assert.match(await page.locator('#decision-result').textContent(), /自动建议已撤回|补齐|人工方案评审/);
    await maybeScreenshot(page, 'desktop-failure-path');

    await tabs.nth(1).click();
    assert.equal(await page.locator('#architecture-panel').isVisible(), true);
    assert.equal(await page.locator('.topology-card').count(), 4);
    assert.equal(await page.locator('.topology-card').filter({ hasText: '故障传播' }).count(), 4);
    await maybeScreenshot(page, 'desktop-architecture');

    await tabs.nth(2).click();
    assert.equal(await page.locator('#enterprise-panel').isVisible(), true);
    assert.equal(await page.locator('.scene-card').count(), 6);
    await maybeScreenshot(page, 'desktop-enterprise');

    await tabs.nth(3).click();
    assert.equal(await page.locator('#judgments-panel').isVisible(), true);
    assert.equal(await page.locator('.judgment-card').count(), 6);
    await maybeScreenshot(page, 'desktop-judgments');
    await context.close();

    const mobileContext = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, locale: 'zh-CN' });
    const mobile = await mobileContext.newPage();
    await gotoAgentHub(mobile, url);
    await selectPreset(mobile, 'preset-it-helpdesk');
    assert.equal(await mobile.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth), true);
    assert.equal(await mobile.locator('.question-card').count(), 6);
    assert.equal(await mobile.locator('#decision-result').isVisible(), true);
    await maybeScreenshot(mobile, 'mobile-result');
    await mobile.getByRole('tab', { name: /判断/ }).click();
    assert.equal(await mobile.locator('#judgments-panel').isVisible(), true);
    assert.equal(await mobile.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth), true);
    await maybeScreenshot(mobile, 'mobile-long-content');
    await mobileContext.close();
  } finally {
    if (browser) await browser.close();
    await stopServer(server);
  }
});

test('Agent Hub marks stale framework evidence for review and hides expired current recommendations', { timeout: 30000 }, async () => {
  const { server, url } = await startServer();
  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: 'zh-CN' });
    await context.addInitScript(() => { window.__AGENT_HUB_NOW = '2027-03-01'; });
    const page = await context.newPage();
    await gotoAgentHub(page, url);
    await page.locator('#tab-decision').click();
    assert.equal(await page.locator('#framework-facts .framework-card[data-freshness="expired"]').count(), 6);
    assert.equal(await page.locator('#framework-facts .current-recommendation').count(), 0);
    assert.match(await page.locator('#framework-facts').textContent(), /过期资料/);
    await maybeScreenshot(page, 'desktop-expired-frameworks');
    await context.close();
  } finally {
    if (browser) await browser.close();
    await stopServer(server);
  }
});

test('Agent Hub shows a readable data-missing state when the model script is unavailable', { timeout: 30000 }, async () => {
  const { server, url } = await startServer();
  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: 'zh-CN' });
    await context.route('**/tools/agent-hub/data/decision-model.js', (route) => route.abort());
    const page = await context.newPage();
    await page.goto(`${url}/tools/agent-hub/index.html`, { waitUntil: 'domcontentloaded' });
    await page.locator('#data-error').waitFor({ state: 'visible' });
    assert.match(await page.locator('#data-error').textContent(), /数据|模型|加载/);
    assert.equal(await page.locator('#decision-form').isHidden(), true);
    assert.equal(await page.locator('#data-ready').isHidden(), true);
    await context.close();
  } finally {
    if (browser) await browser.close();
    await stopServer(server);
  }
});
