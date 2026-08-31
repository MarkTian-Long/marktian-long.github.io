const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('@playwright/test');

const { BLOCKED_BROWSER_PORTS, createStaticServer } = require('./equivalence/servers');

const repoRoot = path.resolve(__dirname, '..');

function rgb(value) {
  const channels = String(value).match(/\d+(?:\.\d+)?/g);
  assert.ok(channels && channels.length >= 3, `Expected an RGB color, received ${value}`);
  return channels.slice(0, 3).map(Number);
}

function relativeLuminance(channels) {
  return channels.map((channel) => {
    const value = channel / 255;
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  }).reduce((total, value, index) => total + value * [0.2126, 0.7152, 0.0722][index], 0);
}

function contrastRatio(foreground, background) {
  const [light, dark] = [relativeLuminance(rgb(foreground)), relativeLuminance(rgb(background))].sort((a, b) => b - a);
  return (light + 0.05) / (dark + 0.05);
}

function startServer() {
  return new Promise((resolve, reject) => {
    const server = createStaticServer({ rootDir: repoRoot, label: 'share-card' });
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

async function blockRemoteFonts(context) {
  await context.route(/https:\/\/fonts\.(?:googleapis|gstatic)\.com\//, (route) => route.abort());
}

async function expectErrorState(page, address, pattern) {
  await page.goto(address, { waitUntil: 'domcontentloaded' });
  await page.locator('#shareCardError').waitFor({ state: 'visible' });
  assert.match(await page.locator('#shareCardError').textContent(), pattern);
  assert.equal(await page.locator('#shareCardActions').isHidden(), true);
  assert.equal(await page.locator('#posterArticleLink').isHidden(), true);
  assert.equal(await page.locator('#posterHostLink').isHidden(), true);
}

async function expectToolbarAtViewportTop(page) {
  await page.locator('.post-body h2').first().evaluate((heading) => heading.scrollIntoView());
  assert.equal(await page.locator('.top-bar').evaluate((bar) => Math.round(bar.getBoundingClientRect().top)), 0);
  assert.equal(await page.locator('.top-bar').evaluate((bar) => {
    const element = document.elementFromPoint(window.innerWidth / 2, 1);
    return Boolean(element && bar.contains(element));
  }), true);
}

test('share-card renders and downloads a 1080×1920 poster across desktop and mobile themes', { timeout: 30000 }, async () => {
  const { server, url } = await startServer();
  let browser;
  try {
    browser = await chromium.launch({
      headless: true,
      ...(process.env.PLAYWRIGHT_EXECUTABLE_PATH
        ? { executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH }
        : {}),
    });
    const desktopContext = await browser.newContext({ viewport: { width: 1440, height: 1100 } });
    await desktopContext.addInitScript(() => localStorage.setItem('blog_theme', 'dark'));
    await blockRemoteFonts(desktopContext);
    const desktop = await desktopContext.newPage();
    await desktop.goto(`${url}/tools/blog/share-card.html?slug=alignment-under-change`, { waitUntil: 'domcontentloaded' });
    await desktop.waitForFunction(() => !document.querySelector('#downloadPoster').disabled);

    assert.equal(await desktop.locator('body').getAttribute('data-theme'), 'dark');
    assert.deepEqual(await desktop.locator('#shareCard').evaluate((canvas) => [canvas.width, canvas.height]), [1080, 1920]);
    assert.match(await desktop.locator('#posterAccessibleText').textContent(), /我们不只需要决定 AI 今天应该是什么样/);
    assert.equal(await desktop.locator('#shareCard').evaluate((canvas) => Array.from(canvas.getContext('2d').getImageData(0, 0, 1, 1).data).join(',')), '245,244,237,255');
    const expectedArticleUrl = await desktop.evaluate(async () => {
      const [config, metadata] = await Promise.all([
        fetch('data/share-card-config.json').then((response) => response.json()),
        fetch('data/posts-meta.json').then((response) => response.json()),
      ]);
      const post = metadata.posts.find((item) => item.slug === 'alignment-under-change');
      return window.BlogShareCard.createPosterModel(post, config).articleUrl;
    });
    assert.equal(await desktop.locator('#openArticle').getAttribute('href'), expectedArticleUrl);
    assert.equal(await desktop.locator('#posterArticleLink').getAttribute('href'), expectedArticleUrl);
    assert.equal(await desktop.locator('#posterArticleLink').isVisible(), true);
    assert.equal(await desktop.locator('#posterHostLink').getAttribute('href'), expectedArticleUrl);
    assert.equal(await desktop.locator('#posterHostLink').isVisible(), true);
    assert.equal(await desktop.evaluate(async () => {
      const [config, metadata] = await Promise.all([
        fetch('data/share-card-config.json').then((response) => response.json()),
        fetch('data/posts-meta.json').then((response) => response.json()),
      ]);
      return metadata.posts.map((post) => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = window.BlogShareCard.POSTER_WIDTH;
          canvas.height = window.BlogShareCard.POSTER_HEIGHT;
          window.BlogShareCard.drawPoster(canvas, window.BlogShareCard.createPosterModel(post, config));
          return '';
        } catch (error) {
          return `${post.slug}: ${error.message}`;
        }
      }).filter(Boolean).join('\n');
    }), '');

    const [download] = await Promise.all([
      desktop.waitForEvent('download'),
      desktop.locator('#downloadPoster').click(),
    ]);
    const downloadPath = await download.path();
    const png = fs.readFileSync(downloadPath);
    assert.equal(download.suggestedFilename(), 'alignment-under-change-share.png');
    assert.equal(png.toString('ascii', 1, 4), 'PNG');
    assert.equal(png.readUInt32BE(16), 1080);
    assert.equal(png.readUInt32BE(20), 1920);

    await expectErrorState(desktop, `${url}/tools/blog/share-card.html`, /缺少文章 slug/);
    await expectErrorState(desktop, `${url}/tools/blog/share-card.html?slug=unknown`, /未找到对应文章/);

    await desktop.goto(`${url}/tools/blog/posts/alignment-under-change.html`, { waitUntil: 'domcontentloaded' });
    await desktop.waitForSelector('#shareCardLink');
    assert.equal(await desktop.locator('#shareCardLink').getAttribute('href'), '../share-card.html?slug=alignment-under-change');
    assert.ok(await desktop.locator('#shareCardLink').evaluate((link) => link.getBoundingClientRect().height >= 44));
    await expectToolbarAtViewportTop(desktop);
    await desktopContext.close();

    const mobileContext = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true });
    await mobileContext.addInitScript(() => localStorage.setItem('blog_theme', ''));
    await blockRemoteFonts(mobileContext);
    const mobile = await mobileContext.newPage();
    await mobile.goto(`${url}/tools/blog/share-card.html?slug=alignment-under-change`, { waitUntil: 'domcontentloaded' });
    await mobile.waitForFunction(() => !document.querySelector('#downloadPoster').disabled);
    assert.equal(await mobile.locator('body').getAttribute('data-theme'), 'light');
    assert.equal(await mobile.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth), true);
    assert.equal(await mobile.locator('#shareCard').evaluate((canvas) => canvas.getBoundingClientRect().width <= window.innerWidth), true);
    assert.equal(await mobile.locator('#shareCard').evaluate((canvas) => Array.from(canvas.getContext('2d').getImageData(0, 0, 1, 1).data).join(',')), '245,244,237,255');
    const controls = await mobile.evaluate(() => ({
      buttonColor: getComputedStyle(document.querySelector('#downloadPoster')).color,
      buttonBackground: getComputedStyle(document.querySelector('#downloadPoster')).backgroundColor,
      linkColor: getComputedStyle(document.querySelector('#openArticle')).color,
      pageBackground: getComputedStyle(document.body).backgroundColor,
    }));
    assert.ok(contrastRatio(controls.buttonColor, controls.buttonBackground) >= 4.5);
    assert.ok(contrastRatio(controls.linkColor, controls.pageBackground) >= 4.5);
    await mobile.goto(`${url}/tools/blog/posts/alignment-under-change.html`, { waitUntil: 'domcontentloaded' });
    await mobile.waitForSelector('#shareCardLink');
    await expectToolbarAtViewportTop(mobile);
    await mobileContext.close();
  } finally {
    if (browser) await browser.close();
    await stopServer(server);
  }
});
