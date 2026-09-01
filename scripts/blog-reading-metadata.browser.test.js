const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { chromium } = require('@playwright/test');

const { BLOCKED_BROWSER_PORTS, createStaticServer } = require('./equivalence/servers');

const repoRoot = path.resolve(__dirname, '..');

function startServer() {
  return new Promise((resolve, reject) => {
    const server = createStaticServer({ rootDir: repoRoot, label: 'blog-reading-metadata' });
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

function stopServer(server) { return new Promise((resolve) => server.close(resolve)); }

async function expectReadingMetadata(page, address) {
  await page.goto(address, { waitUntil: 'domcontentloaded' });
  var readingMeta = page.locator('.post-reading-meta');
  await readingMeta.waitFor({ state: 'visible' });
  assert.match(await readingMeta.textContent(), /^约 \d{1,3}(?:,\d{3})* 字 · \d+ 分钟阅读$/);
  assert.equal(await readingMeta.evaluate((element) => {
    const date = element.previousElementSibling;
    const tags = element.nextElementSibling;
    return Boolean(date && date.classList.contains('post-date') && tags && tags.id === 'post-tags');
  }), true);
}

test('reading metadata renders from final HTML on recent and legacy articles', { timeout: 30000 }, async () => {
  const { server, url } = await startServer();
  let browser;
  try {
    browser = await chromium.launch({
      headless: true,
      ...(process.env.PLAYWRIGHT_EXECUTABLE_PATH ? { executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH } : {}),
    });
    const desktop = await browser.newPage({ viewport: { width: 1440, height: 1100 } });
    await expectReadingMetadata(desktop, `${url}/tools/blog/posts/personal-harness.html`);
    await expectReadingMetadata(desktop, `${url}/tools/blog/posts/rag-evolution.html`);
    await desktop.close();

    const mobile = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true });
    await expectReadingMetadata(mobile, `${url}/tools/blog/posts/personal-harness.html`);
    assert.equal(await mobile.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth), true);
    await mobile.close();
  } finally {
    if (browser) await browser.close();
    await stopServer(server);
  }
});
