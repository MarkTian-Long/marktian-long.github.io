const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { chromium } = require('@playwright/test');

const { BLOCKED_BROWSER_PORTS, createStaticServer } = require('./equivalence/servers');

const repoRoot = path.resolve(__dirname, '..');
const radarFileUrl = pathToFileURL(path.join(repoRoot, 'tools/radar/index.html')).href;
const fallbackBrowserPaths = [
  process.env.RADAR_BROWSER_EXECUTABLE,
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
].filter(Boolean);

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
    const server = createStaticServer({ rootDir: repoRoot, label: 'radar-depth' });
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

function trackBrowserProblems(page) {
  const problems = { console: [], page: [], requests: [] };
  page.on('console', (message) => {
    if (message.type() === 'error') problems.console.push(message.text());
  });
  page.on('pageerror', (error) => problems.page.push(error.message));
  page.on('request', (request) => problems.requests.push(request.url()));
  return problems;
}

async function waitForRadar(page) {
  await page.locator('#sourceList').waitFor({ state: 'attached' });
  await page.waitForFunction(() => document.body.dataset.radarState === 'ready');
}

test('radar supports intent ordering, combined filters, keyboard controls, and safe source links', { timeout: 30000 }, async () => {
  const { server, url } = await startServer();
  let browser;
  try {
    browser = await launchBrowser();
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: 'zh-CN' });
    const page = await context.newPage();
    const problems = trackBrowserProblems(page);
    await page.goto(`${url}/tools/radar/index.html`, { waitUntil: 'domcontentloaded' });
    await waitForRadar(page);

    assert.equal(await page.locator('.source-card').count(), 11);
    assert.match(await page.locator('#resultsSummary').textContent(), /11/);
    assert.match(await page.locator('#dataStatus').textContent(), /待逐条复核/);
    assert.equal(await page.locator('.workflow-step').count(), 4);

    const semanticNav = page.locator('nav[data-radar-nav]');
    assert.equal(await semanticNav.count(), 1);
    const navItems = await semanticNav.locator('a').evaluateAll((links) => links.map((link) => ({
      label: link.textContent.trim(),
      href: link.getAttribute('href'),
      current: link.getAttribute('aria-current'),
    })));
    assert.deepEqual(navItems, [
      { label: '1 信源', href: '../radar/index.html', current: 'step' },
      { label: '2 信号', href: '../trends/index.html', current: null },
      { label: '3 分析', href: '../ai-insights/index.html', current: null },
      { label: '4 方法', href: '../agent-hub/index.html', current: null },
    ]);
    assert.equal(await semanticNav.locator('[aria-current="step"]').count(), 1);

    const sourceLinks = await page.locator('.source-card').evaluateAll((links) => links.map((link) => ({
      href: link.href,
      target: link.target,
      rel: link.rel,
    })));
    sourceLinks.forEach((link) => {
      assert.match(link.href, /^https:/);
      assert.equal(link.target, '_blank');
      assert.match(link.rel, /noopener/);
    });

    const intentButton = page.locator('[data-intent="research-frontier"]');
    await intentButton.focus();
    await page.keyboard.press('Enter');
    assert.equal(await intentButton.getAttribute('aria-pressed'), 'true');
    assert.equal(await page.locator('.source-card').first().getAttribute('data-source-id'), 'import-ai');
    assert.match(await page.locator('#activeIntent').textContent(), /研究前沿/);

    await page.locator('#languageFilter').selectOption('en');
    await page.locator('#typeFilter').selectOption('newsletter');
    await page.locator('#topicFilter').selectOption('research');
    await page.locator('#priorityFilter').selectOption('core');
    assert.equal(await page.locator('.source-card').count(), 2);
    assert.deepEqual(await page.locator('.source-card').evaluateAll((cards) => cards.map((card) => card.dataset.sourceId)), ['import-ai', 'the-batch']);

    await page.locator('#clearFilters').focus();
    await page.keyboard.press('Enter');
    assert.equal(await page.locator('#languageFilter').inputValue(), '');
    assert.equal(await page.locator('.source-card').count(), 11);

    await page.locator('#languageFilter').selectOption('zh');
    await page.locator('#typeFilter').selectOption('blog');
    await page.locator('#emptyState').waitFor({ state: 'visible' });
    assert.equal(await page.locator('.source-card').count(), 0);
    await page.locator('#resetFilters').press('Enter');
    assert.equal(await page.locator('.source-card').count(), 11);
    assert.equal(await page.locator('#emptyState').isVisible(), false);

    const workflowLinks = await page.locator('.workflow-step').evaluateAll((steps) => steps.map((step) => {
      const link = step.querySelector('a');
      return { href: link.href, target: link.target, rel: link.rel };
    }));
    workflowLinks.forEach((link) => {
      assert.match(link.href, /^https:/);
      assert.equal(link.target, '_blank');
      assert.match(link.rel, /noopener/);
    });

    const localOrigin = new URL(url).origin;
    assert.deepEqual([...new Set(problems.requests.map((requestUrl) => new URL(requestUrl).origin))], [localOrigin]);
    assert.deepEqual(problems.console, []);
    assert.deepEqual(problems.page, []);
    await context.close();
  } finally {
    if (browser) await browser.close();
    await stopServer(server);
  }
});

test('radar remains readable when its local data script is unavailable', { timeout: 30000 }, async () => {
  const { server, url } = await startServer();
  let browser;
  try {
    browser = await launchBrowser();
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, locale: 'zh-CN' });
    await context.route(`${url}/tools/radar/data.js`, (route) => route.fulfill({
      status: 204,
      contentType: 'text/javascript',
      body: '',
    }));
    const page = await context.newPage();
    const problems = trackBrowserProblems(page);
    await page.goto(`${url}/tools/radar/index.html`, { waitUntil: 'domcontentloaded' });
    await page.locator('#dataError').waitFor({ state: 'visible' });
    assert.match(await page.locator('#dataError').textContent(), /本地数据|暂不可用/);
    assert.equal(await page.locator('#sourceList').isVisible(), false);
    assert.deepEqual(problems.page, []);
    assert.deepEqual(problems.console, []);
    await context.close();
  } finally {
    if (browser) await browser.close();
    await stopServer(server);
  }
});

test('radar keeps core filtering available from a file URL without a network fetch', { timeout: 30000 }, async () => {
  let browser;
  try {
    browser = await launchBrowser();
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, locale: 'zh-CN' });
    const page = await context.newPage();
    const problems = trackBrowserProblems(page);
    await page.goto(radarFileUrl, { waitUntil: 'domcontentloaded' });
    await waitForRadar(page);
    assert.equal(await new URL(page.url()).protocol, 'file:');
    await page.locator('#languageFilter').selectOption('zh');
    await page.locator('#topicFilter').selectOption('industry');
    assert.ok(await page.locator('.source-card').count() > 0);
    assert.deepEqual(problems.console, []);
    assert.deepEqual(problems.page, []);
    await context.close();
  } finally {
    if (browser) await browser.close();
  }
});
