'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { chromium } = require('@playwright/test');
const { BLOCKED_BROWSER_PORTS, createStaticServer } = require('./equivalence/servers');

function startServer() {
  return new Promise((resolve, reject) => {
    const server = createStaticServer({ rootDir: path.resolve(__dirname, '..'), label: 'share-card-punctuation' });
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

test('actual Canvas poster lines keep punctuation, source text and bounds on desktop and mobile', { timeout: 60000 }, async () => {
  const { server, url } = await startServer();
  let browser;
  try {
    browser = await chromium.launch({
      headless: true,
      ...(process.env.PLAYWRIGHT_EXECUTABLE_PATH ? { executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH } : {}),
    });
    for (const viewport of [{ width: 1440, height: 1100 }, { width: 390, height: 844 }]) {
      const page = await browser.newPage({ viewport });
      await page.route(/https:\/\/fonts\.(?:googleapis|gstatic)\.com\//, (route) => route.abort());
      await page.goto(`${url}/tools/blog/share-card.html?slug=video-world-model`, { waitUntil: 'domcontentloaded' });
      await page.waitForFunction(() => !document.querySelector('#downloadPoster').disabled);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth), true);
      const errors = await page.evaluate(async () => {
        const [config, metadata] = await Promise.all([
          fetch('data/share-card-config.json').then((response) => response.json()),
          fetch('data/posts-meta.json').then((response) => response.json()),
        ]);
        const noStart = /^[，。、；：？！,.!?;:）)\]｝}］】〕〉》」』”’％%…]/u;
        const noEnd = /[（(\[｛{［【〔〈《「『“‘]$/u;
        const compact = (text) => text.replace(/\s+/gu, '');
        const errors = [];
        for (const post of metadata.posts) {
          try {
            const canvas = document.createElement('canvas');
            canvas.width = 1080; canvas.height = 1920;
            const ctx = canvas.getContext('2d');
            const drawn = [];
            const fillText = ctx.fillText;
            ctx.fillText = function (text, x, y) {
              drawn.push({ text, x, y, font: this.font });
              return fillText.apply(this, arguments);
            };
            const model = window.BlogShareCard.createPosterModel(post, config);
            window.BlogShareCard.drawPoster(canvas, model);
            ctx.fillText = fillText;
            const quote = drawn.filter((row) => row.x === 202);
            const quoteTop = quote[0].y - 126;
            const main = drawn.filter((row) => row.x === 96 && row.y >= 368 && row.y < quoteTop);
            const roles = { title: main.filter((row) => /^(?:700|bold) /.test(row.font)), summary: main.filter((row) => !/^(?:700|bold) /.test(row.font)), quote };
            for (const [role, rows] of Object.entries(roles)) {
              if (compact(rows.map((row) => row.text).join('')) !== compact(model[role])) errors.push(`${post.slug}/${role}: source text changed`);
              for (const [index, row] of rows.entries()) {
                ctx.font = row.font;
                const width = { title: 900, summary: 870, quote: 700 }[role];
                if (ctx.measureText(row.text).width > width + 0.01) errors.push(`${post.slug}/${role}: width overflow`);
                if (index > 0 && noStart.test(row.text)) errors.push(`${post.slug}/${role}: line begins with closing punctuation: ${row.text}`);
                if (index < rows.length - 1 && noEnd.test(row.text)) errors.push(`${post.slug}/${role}: line ends with opening punctuation: ${row.text}`);
              }
            }
          } catch (error) { errors.push(`${post.slug}: ${error.message}`); }
        }
        return errors;
      });
      assert.deepEqual(errors, [], `${viewport.width}px poster regressions`);
      await page.close();
    }
  } finally {
    if (browser) await browser.close();
    await new Promise((resolve) => server.close(resolve));
  }
});
