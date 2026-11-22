'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const { chromium } = require('@playwright/test');
const { buildPreview } = require('../tools/blog/build-preview');
const { publicFiles } = require('./public-dist-manifest');
const { BLOCKED_BROWSER_PORTS, createStaticServer } = require('./equivalence/servers');

const repoRoot = path.resolve(__dirname, '..');

function put(root, relative, content) {
  const file = path.join(root, relative);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content);
}

async function createPreviewFixture(t) {
  const fixtureParent = path.join(repoRoot, 'build', 'test-preview-browser');
  fs.mkdirSync(fixtureParent, { recursive: true });
  const rootDir = fs.mkdtempSync(path.join(fixtureParent, 'case-'));
  t.after(() => fs.rmSync(rootDir, { recursive: true, force: true }));
  for (const relative of [...publicFiles(repoRoot), 'tools/blog/article-template.html']) {
    put(rootDir, relative, fs.readFileSync(path.join(repoRoot, relative)));
  }
  const slug = 'preview-runtime-fixture';
  const sourcePath = `drafts/blog/${slug}.md`;
  const imagePath = `assets/images/blog/${slug}/opening-context.svg`;
  const quote = '独立预览保留当前稿的正文和阅读功能。';
  put(rootDir, sourcePath, [
    '---', 'category: 商业', 'tags: ["市场格局"]', 'topics: ["企业AI"]',
    'concepts: ["软件采购经济性", "Build vs Buy", "软件价值捕获", "软件价值链"]',
    `share_quote: "${quote}"`, 'relations: []', '---', '',
    '# 未发布稿的共享运行时验收', '', '> 验证候选稿的标签、首图和参考资料交互。', '', '---', '',
    `![文章的对象与问题关系](../../${imagePath} "图片与正文来自同一份候选稿。")`, '',
    quote, '', '## 正文机制', '', '此处说明候选稿内容，正式索引保持原样。', '',
    '## 参考资料', '', '### 一手资料', '', '- [原始研究](https://example.com/primary-source)', '',
  ].join('\n'));
  put(rootDir, imagePath, '<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="0 0 1280 720"><rect width="1280" height="720" fill="#f4f3ed"/><rect x="100" y="100" width="400" height="300" fill="#c96442"/></svg>');
  const outputDir = 'build/candidate-site/preview-browser';
  const result = await buildPreview({ rootDir, sourcePath, mode: 'write', outputDir });
  return { rootDir: path.join(rootDir, outputDir), previewPath: result.previewPath };
}

function startServer(rootDir) {
  return new Promise((resolve, reject) => {
    const server = createStaticServer({ rootDir, label: 'blog-preview-runtime' });
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

test('generated previews keep draft labels, images and reference interaction without publication navigation', { timeout: 45000 }, async (t) => {
  const fixture = await createPreviewFixture(t);
  const { server, url } = await startServer(fixture.rootDir);
  let browser;
  try {
    browser = await chromium.launch({
      headless: true,
      ...(process.env.PLAYWRIGHT_EXECUTABLE_PATH ? { executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH } : {}),
    });
    for (const width of [1440, 390]) {
      const page = await browser.newPage({ viewport: { width, height: 900 }, isMobile: width === 390 });
      try {
        await page.route('https://**/*', route => route.abort());
        await page.goto(`${url}/${fixture.previewPath}`, { waitUntil: 'domcontentloaded' });
        // These are installed by the real shared runtime, not the build step.
        await page.locator('.post-reading-meta').waitFor({ state: 'visible' });
        const references = page.locator('.reference-toggle');
        await references.waitFor({ state: 'visible' });
        assert.deepEqual(await page.locator('#post-tags .tag').allTextContents(), ['市场格局', '企业AI']);
        assert.equal(await page.locator('.post-date').textContent(), '未发布预览');
        assert.equal(await page.locator('meta[name="robots"]').getAttribute('content'), 'noindex, nofollow');
        assert.equal(await page.locator('link[rel="canonical"], meta[property="og:url"], script[type="application/ld+json"]').count(), 0);
        assert.equal(await page.locator('#shareCardLink').count(), 0);
        assert.equal(await page.locator('#navPrev').isHidden(), true);
        assert.equal(await page.locator('#navNext').isHidden(), true);
        assert.equal(await page.locator('#continueReading').isHidden(), true);

        const opening = page.locator('.post-body > :first-child');
        assert.equal(await opening.getAttribute('class'), 'post-figure');
        await opening.scrollIntoViewIfNeeded();
        const image = opening.locator('img');
        await image.evaluate(element => element.decode());
        assert.deepEqual(await image.evaluate(element => [element.naturalWidth, element.naturalHeight]), [1280, 720]);

        assert.equal(await references.getAttribute('aria-expanded'), 'false');
        assert.equal(await page.locator('.reference-list').isHidden(), true);
        await references.click();
        assert.equal(await references.getAttribute('aria-expanded'), 'true');
        assert.equal(await page.locator('.reference-list').isVisible(), true);
        assert.equal(await page.locator('.reference-list a').getAttribute('href'), 'https://example.com/primary-source');
        for (const theme of ['light', 'dark']) {
          await page.evaluate(value => { document.body.dataset.theme = value; }, theme);
          const size = await page.evaluate(() => ({
            viewport: document.documentElement.clientWidth,
            document: document.documentElement.scrollWidth,
            body: document.body.scrollWidth,
          }));
          assert.ok(size.document <= size.viewport + 1 && size.body <= size.viewport + 1,
            `Whole-page overflow at ${width}px/${theme}: ${JSON.stringify(size)}`);
        }
      } finally {
        await page.close();
      }
    }
  } finally {
    if (browser) await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
});
