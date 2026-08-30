'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const { chromium } = require('@playwright/test');

const { BLOCKED_BROWSER_PORTS, createStaticServer } = require('./equivalence/servers');

const repoRoot = path.resolve(__dirname, '..');
const screenshotRoot = process.env.WORKS_TOOLS_SCREENSHOT_DIR || '';
const fallbackBrowserPaths = [
  process.env.WORKS_TOOLS_BROWSER_EXECUTABLE,
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
  try {
    return await chromium.launch({ headless: true });
  } catch (error) {
    if (!/spawn EPERM/.test(error.message)) throw error;
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
        const pageErrors = [];
        const localFailures = [];
        page.on('pageerror', (error) => pageErrors.push(error.message));
        page.on('response', (response) => {
          const responseUrl = new URL(response.url());
          if (responseUrl.hostname === '127.0.0.1' && response.status() >= 400) {
            localFailures.push(`${response.status()} ${responseUrl.pathname}`);
          }
        });

        await page.goto(`${url}${pageSpec.route}`, { waitUntil: 'domcontentloaded' });
        await page.locator(pageSpec.ready).first().waitFor({ state: 'visible' });
        await settleLayout(page);
        await assertPageHealth(page, `${pageSpec.id}/${viewport.id}`);
        assert.deepEqual(pageErrors, [], `${pageSpec.id}/${viewport.id} page errors`);
        assert.deepEqual(localFailures, [], `${pageSpec.id}/${viewport.id} local HTTP failures`);
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
    await esop.goto(`${url}/tools/esop-extractor/index.html`, { waitUntil: 'domcontentloaded' });
    await esop.locator('#extractBtn').click();
    await esop.locator('#outputContent:not(.hidden)').waitFor({ state: 'visible' });
    assert.notEqual((await esop.locator('#metricFieldCoverage').textContent()).trim(), '—');
    await assertPageHealth(esop, 'esop/result');
    await capture(esop, 'desktop-esop-result.png');

    const asci = await context.newPage();
    await asci.goto(`${url}/tools/asci/index.html`, { waitUntil: 'domcontentloaded' });
    await asci.locator('#startPipelineBtn').click();
    await asci.locator('#screen2:not(.hidden)').waitFor({ state: 'visible' });
    assert.match(await asci.locator('#taskBadge').textContent(), /任务执行中|等待人工|已完成/);
    await assertPageHealth(asci, 'asci/running');
    await capture(asci, 'desktop-asci-running.png');

    await context.close();
  } finally {
    if (browser) await browser.close();
    await stopServer(server);
  }
});
