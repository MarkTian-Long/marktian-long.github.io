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


test('complex inline SVG scroll stays inside the mobile article', { timeout: 60000 }, async () => {
  const { server, url } = await startServer();
  let browser;
  try {
    browser = await chromium.launch({
      headless: true,
      ...(process.env.PLAYWRIGHT_EXECUTABLE_PATH ? { executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH } : {}),
    });
    for (const width of [320, 390, 700, 800, 1440]) {
      const page = await browser.newPage({ viewport: { width, height: 900 }, isMobile: width <= 390 });
      try {
        await page.route('https://**/*', route => route.abort());
        await page.goto(url + '/tools/blog/posts/multimodal-unification.html', { waitUntil: 'domcontentloaded' });
        await page.locator('#continueReadingStyles').waitFor({ state: 'attached' });
        const figure = page.locator('.post-body figure.post-figure').first();
        // The diagram is below the fold and lazy-loaded; make it visible before awaiting decode.
        await figure.scrollIntoViewIfNeeded();
        await figure.locator('img[src$="multimodal-information-flow.svg"]').evaluate(image => image.decode());
        for (const theme of ['light', 'dark']) {
          await page.evaluate(value => document.body.dataset.theme = value, theme);
          const measure = await page.evaluate(() => {
            const main = document.querySelector('.two-col > main');
            const fig = document.querySelector('.post-body figure.post-figure');
            const img = fig.querySelector('img');
            return {
              viewport: window.innerWidth,
              document: document.documentElement.scrollWidth,
              body: document.body.scrollWidth,
              mainRight: main.getBoundingClientRect().right,
              figureRight: fig.getBoundingClientRect().right,
              figureWidth: fig.clientWidth,
              figureScroll: fig.scrollWidth,
              imageWidth: img.getBoundingClientRect().width,
              naturalWidth: img.naturalWidth,
            };
          });
          const context = width + 'px ' + theme + ': ' + JSON.stringify(measure);
          assert.ok(measure.document <= measure.viewport + 1, 'Whole document overflows: ' + context);
          assert.ok(measure.body <= measure.viewport + 1, 'Body overflows: ' + context);
          assert.ok(measure.mainRight <= measure.viewport + 1, 'Article column overflows: ' + context);
          assert.ok(measure.figureRight <= measure.viewport + 1, 'Diagram figure overflows: ' + context);
          assert.equal(measure.naturalWidth, 1280, 'SVG must actually load: ' + context);
          if (width <= 700) {
            assert.ok(measure.imageWidth >= 800, 'SVG should retain readable width: ' + context);
            assert.ok(measure.figureScroll > measure.figureWidth + 100, 'The figure must scroll independently: ' + context);
            assert.ok(await figure.evaluate(element => {
              element.scrollLeft = element.scrollWidth;
              return element.scrollLeft > 100;
            }), 'Cannot scroll within diagram: ' + context);
            assert.equal(await page.evaluate(() => document.documentElement.scrollWidth), measure.document);
          } else {
            assert.ok(measure.figureScroll <= measure.figureWidth + 1, 'Tablet/desktop SVG should fit: ' + context);
          }
        }
      } finally {
        await page.close();
      }
    }
  } finally {
    if (browser) await browser.close();
    await stopServer(server);
  }
});
