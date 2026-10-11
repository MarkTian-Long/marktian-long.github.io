'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { chromium, expect } = require('@playwright/test');
const { BLOCKED_BROWSER_PORTS, createStaticServer } = require('./equivalence/servers');

async function withDelayedArticles(viewport, run) {
  const server = createStaticServer({ rootDir: path.resolve(__dirname, '..'), label: 'home-resources' });
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    const listen = () => server.listen(0, '127.0.0.1', () => {
      if (BLOCKED_BROWSER_PORTS.has(server.address().port)) return server.close(listen);
      resolve();
    });
    listen();
  });
  let browser;
  let releaseArticles;
  const gate = new Promise(resolve => { releaseArticles = resolve; });
  try {
    browser = await chromium.launch({
      headless: true,
      ...(process.env.PLAYWRIGHT_EXECUTABLE_PATH ? { executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH } : {}),
    });
    const page = await browser.newPage({ viewport });
    await page.route('https://**/*', route => route.abort());
    // Disable motion before the browser starts its initial fragment scroll.
    await page.route('**/assets/css/style.css', async route => {
      const response = await route.fetch();
      await route.fulfill({
        response,
        body: `${await response.text()}\nhtml { scroll-behavior: auto !important; } .reveal { transition: none !important; transform: none !important; }`,
      });
    });
    await page.route('**/posts-meta.json', async route => {
      await gate;
      await route.continue();
    });
    await page.goto(`http://127.0.0.1:${server.address().port}/index.html#resources`, { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => document.fonts.ready);
    // Establish the fragment's initial position before releasing the article response.
    await page.locator('#resources').evaluate(section => section.scrollIntoView({ behavior: 'instant' }));
    await expect.poll(() => anchorDistance(page)).toBeLessThan(2);
    await run(page, releaseArticles);
  } finally {
    releaseArticles();
    if (browser) await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
}

function anchorDistance(page) {
  return page.locator('#resources').evaluate(section => Math.abs(
    section.getBoundingClientRect().top - parseFloat(getComputedStyle(section).scrollMarginTop),
  ));
}

for (const viewport of [{ width: 1440, height: 900 }, { width: 390, height: 844 }]) {
  test(`GitHub resources deep link stays aligned after delayed articles load at ${viewport.width}px`, { timeout: 30000 }, async () => {
    await withDelayedArticles(viewport, async (page, releaseArticles) => {
      releaseArticles();
      await page.locator('#writingRecent .writing-post-row').first().waitFor({ state: 'visible' });
      await expect.poll(() => anchorDistance(page)).toBeLessThan(2);
      assert.ok(await page.locator('#resources .resource-item').count() > 0);
    });
  });
}

test('delayed articles do not pull readers back after they move away from the resource deep link', { timeout: 30000 }, async () => {
  await withDelayedArticles({ width: 1440, height: 900 }, async (page, releaseArticles) => {
    await page.keyboard.press('Control+Home');
    await expect.poll(() => page.evaluate(() => scrollY)).toBeLessThan(2);
    releaseArticles();
    await page.locator('#writingRecent .writing-post-row').first().waitFor({ state: 'visible' });
    await expect.poll(() => page.evaluate(() => scrollY)).toBeLessThan(2);
  });
});
