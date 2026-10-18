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

test('archive preserves newest month when input is reversed and canonical same-month editorial order', { timeout: 30000 }, async () => {
  const metadata = require('../tools/blog/data/posts-meta.json');
  const featured = new Set(require('../tools/blog/data/featured-posts.json').featured);
  const expected = metadata.posts.find((post) => !featured.has(post.slug));
  const { server, url } = await startServer();
  let browser;
  try {
    browser = await chromium.launch({
      headless: true,
      ...(process.env.PLAYWRIGHT_EXECUTABLE_PATH ? { executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH } : {}),
    });
    const page = await browser.newPage({ viewport: { width: 1440, height: 1100 } });
    await page.route('**/tools/blog/data/posts-meta.json', (route) => route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ ...metadata, posts: metadata.posts.slice().reverse() }),
    }));
    await page.goto(`${url}/tools/blog/index.html`, { waitUntil: 'domcontentloaded' });
    const firstArchiveLink = page.locator('#archiveRoot .post-title').first();
    await firstArchiveLink.waitFor({ state: 'visible' });
    // Reversing JSON destroys its editorial tie-break among posts in the same month.
    // The archive can guarantee the newest month here, but not recover that lost tie order.
    const hrefFromReversed = await firstArchiveLink.getAttribute('href');
    const matched = metadata.posts.find((post) => post.url === hrefFromReversed);
    assert.ok(matched, 'first rendered article must be present in metadata');
    assert.equal(matched.date, expected.date);
    await page.unroute('**/tools/blog/data/posts-meta.json');
    await page.reload({ waitUntil: 'domcontentloaded' });
    const firstCanonicalLink = page.locator('#archiveRoot .post-title').first();
    await firstCanonicalLink.waitFor({ state: 'visible' });
    assert.equal(await firstCanonicalLink.getAttribute('href'), expected.url);
    await page.close();
  } finally {
    if (browser) await browser.close();
    await stopServer(server);
  }
});
