'use strict';

const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const { test, expect, chromium } = require('@playwright/test');
const { PNG } = require('playwright-core/lib/utilsBundle');
const playwrightVersion = require('@playwright/test/package.json').version;
const { captureDocument, normalizeAriaSnapshot, normalizeDocument } = require('./normalize');
const { listFiles, prepareSnapshots, sha256, startIndependentServers, startServerProcess, stopIndependentServers } = require('./servers');
const {
  APPROVED_BASELINE_SHA,
  EXPECTED_HTML_ROUTE_COUNT,
  EXPECTED_PUBLIC_FILE_COUNT,
  VIEWPORTS,
  createSiteMatrix,
} = require('./site-matrix');

const repoRoot = path.resolve(__dirname, '../..');
const candidateRoot = process.env.CANDIDATE_ROOT ? path.resolve(repoRoot, process.env.CANDIDATE_ROOT) : null;
const outputRoot = path.join(repoRoot, 'build', 'architecture-equivalence');
const screenshotRoot = path.join(outputRoot, 'report', 'screenshots');
const EXPECTED_EXTERNAL_HOSTS = new Set([
  'fonts.googleapis.com', 'fonts.gstatic.com', 'www.googletagmanager.com', 'www.google-analytics.com',
]);
const MAX_RASTER_NOISE_PIXELS = 64;
const MAX_RASTER_CHANNEL_DELTA = 2;
const EXPECTED_TEST_COUNT = 221;
const EXPECTED_COMPARISONS = Object.freeze({ url: 146, negativeUrl: 2, dom: 220, aria: 220, screenshot: 220, function: 24 });
const TOOL_ACTIONS = Object.freeze({
  '/tools/agent-hub/index.html': '.tab-btn:nth-child(2)',
  '/tools/ai-insights/index.html': '.filter-btn:nth-child(2)',
  '/tools/asci/index.html': '#startPipelineBtn',
  '/tools/esop-extractor/index.html': '#extractBtn',
  '/tools/radar/index.html': null,
  '/tools/service-agent/index.html': '.scn-card[data-scn="ecom"]',
  '/tools/stock/index.html': '.tab-btn[data-tab="diagnosis"]',
  '/tools/trends/index.html': '.tab-btn:nth-child(2)',
});

let browser;
let matrix;
let snapshots;
let servers;
const report = {
  schemaVersion: 1,
  phase: candidateRoot ? 'P2-candidate' : 'A0',
  executionId: candidateRoot ? 'P2-ARCH-NONVISUAL-001' : 'P1-A0-001',
  baselineSha: APPROVED_BASELINE_SHA,
  status: 'not-run',
  setupError: null,
  candidate: { enabled: Boolean(candidateRoot), rootDir: candidateRoot },
  environment: { node: process.version, playwright: playwrightVersion, locale: 'zh-CN', timezone: 'Asia/Shanghai' },
  tests: { expected: EXPECTED_TEST_COUNT, passed: 0, failed: 0, skipped: 0 },
  contract: {}, comparisons: { url: 0, negativeUrl: 0, resource: 0, dom: 0, aria: 0, screenshot: 0, screenshotRetries: 0, function: 0 },
  expectedComparisons: EXPECTED_COMPARISONS,
  failures: [],
  differences: [], expectedExternalHosts: [...EXPECTED_EXTERNAL_HOSTS].sort(),
  rasterNoise: [],
  screenshotPolicy: { maxNoisePixels: MAX_RASTER_NOISE_PIXELS, maxChannelDelta: MAX_RASTER_CHANNEL_DELTA },
};

function safeName(value) {
  return value.replace(/^\//, '').replace(/[^a-z0-9.-]+/gi, '_') || 'index';
}

function aggregateHash(manifest, field) {
  const hash = crypto.createHash('sha256');
  manifest.forEach(item => hash.update(`${item.path}\0${item[field]}\n`));
  return hash.digest('hex');
}

async function requestEvidence(baseUrl, route) {
  const response = await fetch(`${baseUrl}${route}`);
  const body = Buffer.from(await response.arrayBuffer());
  const canonicalMatch = route.endsWith('.html')
    ? body.toString('utf8').match(/<link\s+[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["'][^>]*>/i)
    : null;
  return {
    status: response.status,
    mime: response.headers.get('content-type'),
    hash: sha256(body),
    canonical: canonicalMatch ? canonicalMatch[1] : null,
  };
}

function themeStorage(theme) {
  return { qiuzhi_theme: theme, blog_theme: theme === 'dark' ? 'dark' : '' };
}

async function openEvidence(context, endpoint, scenario, action, sharedPage) {
  const external = [];
  const errors = [];
  const localFailures = [];
  const resourcePromises = [];
  const page = sharedPage || await context.newPage();
  page.removeAllListeners();
  await page.unrouteAll({ behavior: 'wait' });
  await page.route('**/*', async route => {
    const url = new URL(route.request().url());
    if (url.origin === endpoint.url) return route.continue();
    external.push(url.hostname);
    if (EXPECTED_EXTERNAL_HOSTS.has(url.hostname)) {
      return route.fulfill({ status: 204, contentType: url.hostname.includes('fonts') ? 'text/css' : 'text/plain', body: '' });
    }
    return route.abort('blockedbyclient');
  });
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('pageerror', error => errors.push(`pageerror: ${error.message}`));
  page.on('requestfailed', request => {
    const url = new URL(request.url());
    if (url.origin === endpoint.url) localFailures.push(`${url.pathname}: ${request.failure()?.errorText || 'failed'}`);
  });
  page.on('response', response => {
    const url = new URL(response.url());
    if (url.origin !== endpoint.url) return;
    resourcePromises.push((async () => {
      const body = await response.body().catch(() => Buffer.alloc(0));
      return { path: url.pathname, status: response.status(), mime: response.headers()['content-type'] || '', hash: sha256(body) };
    })());
  });
  await page.goto(`${endpoint.url}${scenario.route}`, { waitUntil: 'domcontentloaded' });
  if (scenario.javaScriptEnabled === false) {
    await page.waitForFunction(() => (
      [...document.querySelectorAll('link[rel="stylesheet"]')].every(link => Boolean(link.sheet))
      && [...document.images].every(image => image.complete)
    ));
  } else {
    await page.waitForLoadState('networkidle');
  }
  if (scenario.javaScriptEnabled === false) {
    await page.evaluate(() => window.scrollTo(0, 0));
  } else {
    await page.addStyleTag({ content: '*,*::before,*::after{animation:none!important;transition:none!important;caret-color:transparent!important;scroll-behavior:auto!important;-webkit-font-smoothing:antialiased!important;text-rendering:geometricPrecision!important}.theme-toggle{font-family:"Segoe UI Symbol",sans-serif!important}' });
    await page.evaluate(async () => {
      document.querySelectorAll('.reveal').forEach(element => element.classList.add('visible'));
      if (document.fonts?.ready) await document.fonts.ready;
      window.scrollTo(0, 0);
    });
  }
  if (action) await action(page);
  await page.waitForTimeout(50);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(50);
  const dom = normalizeDocument(await captureDocument(page));
  const aria = normalizeAriaSnapshot(await page.locator('body').ariaSnapshot());
  const resources = (await Promise.all(resourcePromises)).sort((a, b) => `${a.path}:${a.hash}`.localeCompare(`${b.path}:${b.hash}`));
  return { page, dom, aria, resources, external: [...new Set(external)].sort(), errors, localFailures };
}

async function captureScreenshot(page, theme) {
  await page.evaluate(activeTheme => {
    const toggle = document.querySelector('.theme-toggle');
    if (toggle) toggle.textContent = activeTheme === 'dark' ? '☾' : '☀';
  }, theme);
  return page.screenshot({ fullPage: true, animations: 'disabled' });
}

function comparePngBuffers(baselineBuffer, currentBuffer) {
  const baseline = PNG.sync.read(baselineBuffer);
  const current = PNG.sync.read(currentBuffer);
  if (baseline.width !== current.width || baseline.height !== current.height) {
    return { dimensionsEqual: false, baseline: [baseline.width, baseline.height], current: [current.width, current.height] };
  }
  let differentPixels = 0;
  let maxChannelDelta = 0;
  let minX = baseline.width;
  let minY = baseline.height;
  let maxX = -1;
  let maxY = -1;
  for (let offset = 0; offset < baseline.data.length; offset += 4) {
    let pixelDiffers = false;
    for (let channel = 0; channel < 4; channel += 1) {
      const delta = Math.abs(baseline.data[offset + channel] - current.data[offset + channel]);
      maxChannelDelta = Math.max(maxChannelDelta, delta);
      pixelDiffers ||= delta !== 0;
    }
    if (!pixelDiffers) continue;
    differentPixels += 1;
    const pixel = offset / 4;
    const x = pixel % baseline.width;
    const y = Math.floor(pixel / baseline.width);
    minX = Math.min(minX, x); minY = Math.min(minY, y);
    maxX = Math.max(maxX, x); maxY = Math.max(maxY, y);
  }
  return {
    dimensionsEqual: true,
    width: baseline.width,
    height: baseline.height,
    differentPixels,
    maxChannelDelta,
    bounds: differentPixels ? [minX, minY, maxX, maxY] : null,
  };
}

async function compareScenario(scenario, action, group = 'matrix') {
  const context = await browser.newContext({
    viewport: scenario.viewport,
    locale: 'zh-CN', timezoneId: 'Asia/Shanghai', colorScheme: scenario.theme,
    reducedMotion: 'reduce', deviceScaleFactor: 1, serviceWorkers: 'block',
    javaScriptEnabled: scenario.javaScriptEnabled !== false,
  });
  await context.addInitScript(storage => {
    for (const [key, value] of Object.entries(storage)) localStorage.setItem(key, value);
  }, themeStorage(scenario.theme));
  const page = await context.newPage();
  let baseline = await openEvidence(context, servers.baseline, scenario, action, page);
  baseline.screenshot = await captureScreenshot(page, scenario.theme);
  let current = await openEvidence(context, servers.current, scenario, action, page);
  current.screenshot = await captureScreenshot(page, scenario.theme);
  let candidate = null;
  if (servers.candidate) {
    candidate = await openEvidence(context, servers.candidate, scenario, action, page);
    candidate.screenshot = await captureScreenshot(page, scenario.theme);
  }
  await page.close();
  await context.close();
  const name = `${safeName(scenario.route)}__${scenario.viewportName}__${scenario.theme}__${group}`;
  fs.mkdirSync(screenshotRoot, { recursive: true });
  fs.writeFileSync(path.join(screenshotRoot, `${name}__baseline.png`), baseline.screenshot);
  fs.writeFileSync(path.join(screenshotRoot, `${name}__current.png`), current.screenshot);
  if (candidate) fs.writeFileSync(path.join(screenshotRoot, `${name}__candidate.png`), candidate.screenshot);
  const screenshotDiff = comparePngBuffers(baseline.screenshot, current.screenshot);
  const candidateScreenshotDiff = candidate ? comparePngBuffers(baseline.screenshot, candidate.screenshot) : null;
  if (screenshotDiff.differentPixels) report.rasterNoise.push({ name, ...screenshotDiff });
  expect(current.errors, `${name} current console/page errors`).toEqual([]);
  expect(baseline.errors, `${name} baseline console/page errors`).toEqual([]);
  expect(current.localFailures, `${name} current local request failures`).toEqual([]);
  expect(baseline.localFailures, `${name} baseline local request failures`).toEqual([]);
  expect(current.resources.filter(resource => resource.status >= 400), `${name} current HTTP errors`).toEqual([]);
  expect(baseline.resources.filter(resource => resource.status >= 400), `${name} baseline HTTP errors`).toEqual([]);
  expect(current.external.filter(host => !EXPECTED_EXTERNAL_HOSTS.has(host)), `${name} current unexpected external hosts`).toEqual([]);
  expect(baseline.external.filter(host => !EXPECTED_EXTERNAL_HOSTS.has(host)), `${name} baseline unexpected external hosts`).toEqual([]);
  expect(current.external, `${name} external request set`).toEqual(baseline.external);
  expect(current.resources, `${name} resources`).toEqual(baseline.resources);
  expect(current.dom, `${name} normalized DOM`).toEqual(baseline.dom);
  expect(current.aria, `${name} ARIA`).toEqual(baseline.aria);
  if (candidate) {
    expect(candidate.errors, `${name} candidate console/page errors`).toEqual([]);
    expect(candidate.localFailures, `${name} candidate local request failures`).toEqual([]);
    expect(candidate.resources.filter(resource => resource.status >= 400), `${name} candidate HTTP errors`).toEqual([]);
    expect(candidate.external.filter(host => !EXPECTED_EXTERNAL_HOSTS.has(host)), `${name} candidate unexpected external hosts`).toEqual([]);
    expect(candidate.external, `${name} candidate external request set`).toEqual(baseline.external);
    expect(candidate.resources, `${name} candidate resources`).toEqual(baseline.resources);
    expect(candidate.dom, `${name} candidate normalized DOM`).toEqual(baseline.dom);
    expect(candidate.aria, `${name} candidate ARIA`).toEqual(baseline.aria);
    expect(candidateScreenshotDiff.dimensionsEqual, `${name} candidate screenshot dimensions`).toBe(true);
    expect(candidateScreenshotDiff.maxChannelDelta, `${name} candidate screenshot max channel delta`).toBeLessThanOrEqual(MAX_RASTER_CHANNEL_DELTA);
    expect(candidateScreenshotDiff.differentPixels, `${name} candidate screenshot raster-noise pixels`).toBeLessThanOrEqual(MAX_RASTER_NOISE_PIXELS);
  }
  expect(screenshotDiff.dimensionsEqual, `${name} screenshot dimensions`).toBe(true);
  expect(screenshotDiff.maxChannelDelta, `${name} screenshot max channel delta`).toBeLessThanOrEqual(MAX_RASTER_CHANNEL_DELTA);
  expect(screenshotDiff.differentPixels, `${name} screenshot raster-noise pixels`).toBeLessThanOrEqual(MAX_RASTER_NOISE_PIXELS);
  report.comparisons.resource += current.resources.length;
  if (candidate) report.comparisons.candidateResource = (report.comparisons.candidateResource || 0) + candidate.resources.length;
  report.comparisons.dom += 1;
  report.comparisons.aria += 1;
  report.comparisons.screenshot += 1;
}

test.beforeAll(async () => {
  try {
    report.status = 'running';
    matrix = createSiteMatrix(repoRoot, { candidateRoot });
    snapshots = prepareSnapshots({ repoRoot, outputRoot });
    servers = await startIndependentServers(snapshots);
    if (candidateRoot) {
      const candidateFiles = listFiles(candidateRoot);
      const extras = candidateFiles.filter(file => !snapshots.files.includes(file));
      const missing = snapshots.files.filter(file => !candidateFiles.includes(file));
      if (extras.length || missing.length) throw new Error(`candidate manifest mismatch: extras=${extras.join(',')} missing=${missing.join(',')}`);
      servers.candidate = await startServerProcess(candidateRoot, 'candidate');
    }
    browser = await chromium.launch({
      args: [
        '--disable-font-subpixel-positioning', '--disable-gpu', '--disable-lcd-text',
        '--font-render-hinting=none', '--force-color-profile=srgb',
      ],
    });
    report.environment.chromium = browser.version();
    report.servers = {
      baseline: { pid: servers.baseline.pid, port: servers.baseline.port, root: snapshots.baselineRoot },
      current: { pid: servers.current.pid, port: servers.current.port, root: snapshots.currentRoot },
      ...(servers.candidate ? { candidate: { pid: servers.candidate.pid, port: servers.candidate.port, root: candidateRoot } } : {}),
    };
    report.contract = {
      publicFiles: snapshots.files.length,
      htmlRoutes: snapshots.htmlCount,
      baselinePublicHash: aggregateHash(snapshots.manifest, 'baselineSha256'),
      currentPublicHash: aggregateHash(snapshots.manifest, 'currentSha256'),
      ...(candidateRoot ? { candidatePublicHash: aggregateHash(snapshots.files.map(file => ({ path: file, candidateSha256: sha256(fs.readFileSync(path.join(candidateRoot, file)))})), 'candidateSha256') } : {}),
    };
  } catch (error) {
    report.status = 'setup-failed';
    report.setupError = { name: error.name, message: error.message };
    throw error;
  }
});

test.afterEach(async ({}, testInfo) => {
  if (testInfo.status === 'passed') report.tests.passed += 1;
  else if (testInfo.status === 'skipped') report.tests.skipped += 1;
  else report.tests.failed += 1;
  if (testInfo.status !== testInfo.expectedStatus) {
    report.failures.push({
      title: testInfo.title,
      status: testInfo.status,
      expectedStatus: testInfo.expectedStatus,
      error: testInfo.error ? testInfo.error.message : null,
    });
  }
});

test.afterAll(async () => {
  try {
    if (browser) await browser.close();
    await stopIndependentServers(servers);
  } catch (error) {
    report.failures.push({ title: 'A0 cleanup', status: 'failed', expectedStatus: 'passed', error: error.message });
  }
  const comparisonsComplete = Object.entries(EXPECTED_COMPARISONS)
    .every(([key, expected]) => report.comparisons[key] === expected);
  if (report.status !== 'setup-failed') {
    report.status = report.tests.passed === EXPECTED_TEST_COUNT
      && report.tests.failed === 0
      && report.tests.skipped === 0
      && report.failures.length === 0
      && comparisonsComplete
      ? 'passed'
      : 'failed';
  }
  report.completedAt = new Date().toISOString();
  fs.mkdirSync(path.join(outputRoot, 'report'), { recursive: true });
  fs.writeFileSync(path.join(outputRoot, 'report', 'a0-report.json'), `${JSON.stringify(report, null, 2)}\n`);
});

test('locks the contract and compares all public bytes', async () => {
  expect(matrix.files).toHaveLength(EXPECTED_PUBLIC_FILE_COUNT);
  expect(matrix.htmlRoutes).toHaveLength(EXPECTED_HTML_ROUTE_COUNT);
  expect(matrix.candidate).toEqual({ enabled: Boolean(candidateRoot), rootDir: candidateRoot });
  expect(matrix.files.some(file => file.includes('config.local'))).toBe(false);
  expect(snapshots.mismatches).toEqual([]);
  expect(servers.baseline.pid).not.toBe(servers.current.pid);
  expect(servers.baseline.port).not.toBe(servers.current.port);
  expect(servers.baseline.rootDir).not.toBe(servers.current.rootDir);
  if (servers.candidate) {
    expect(servers.candidate.pid).not.toBe(servers.baseline.pid);
    expect(servers.candidate.port).not.toBe(servers.baseline.port);
    expect(servers.candidate.rootDir).not.toBe(servers.baseline.rootDir);
  }
  for (const basePath of matrix.basePaths) {
    for (const file of matrix.files) {
      const route = `${basePath}${file}`.replace(/\/+/g, '/');
      const [baseline, current] = await Promise.all([
        requestEvidence(servers.baseline.url, route), requestEvidence(servers.current.url, route),
      ]);
      expect({ status: current.status, mime: current.mime, hash: current.hash, canonical: current.canonical }, route)
        .toEqual({ status: baseline.status, mime: baseline.mime, hash: baseline.hash, canonical: baseline.canonical });
      expect(current.status, `${route} current status`).toBe(200);
      expect(baseline.status, `${route} baseline status`).toBe(200);
      if (servers.candidate) {
        const candidate = await requestEvidence(servers.candidate.url, route);
        expect({ status: candidate.status, mime: candidate.mime, hash: candidate.hash, canonical: candidate.canonical }, `${route} candidate`)
          .toEqual({ status: baseline.status, mime: baseline.mime, hash: baseline.hash, canonical: baseline.canonical });
        expect(candidate.status, `${route} candidate status`).toBe(200);
      }
      report.comparisons.url += 1;
    }
  }
  for (const route of ['/__a0_missing__.html', '/repo-name/__a0_missing__.html']) {
    const [baseline, current] = await Promise.all([
      requestEvidence(servers.baseline.url, route), requestEvidence(servers.current.url, route),
    ]);
    expect(current, `${route} negative route`).toEqual(baseline);
    expect(current.status, `${route} current negative status`).toBe(404);
    expect(baseline.status, `${route} baseline negative status`).toBe(404);
    if (servers.candidate) {
      const candidate = await requestEvidence(servers.candidate.url, route);
      expect(candidate, `${route} candidate negative route`).toEqual(baseline);
      expect(candidate.status, `${route} candidate negative status`).toBe(404);
    }
    report.comparisons.negativeUrl += 1;
  }
});

for (const route of createSiteMatrix(repoRoot).htmlRoutes) {
  for (const [viewportName, viewport] of Object.entries(VIEWPORTS)) {
    for (const theme of ['light', 'dark']) {
      test(`visual DOM ARIA ${route} ${viewportName} ${theme}`, async () => {
        await compareScenario({ route, viewportName, viewport, theme });
      });
    }
  }
}

const functionalStates = [
  ['home-nav', '/index.html', VIEWPORTS.desktop, async page => {
    await page.locator('.nav-link[href="#about"]').click();
    await expect(page).toHaveURL(/#about$/);
  }],
  ['mobile-menu', '/index.html', VIEWPORTS.mobile, async page => {
    await page.locator('#navToggle').click();
    await expect(page.locator('#navLinks')).toHaveClass(/open/);
  }],
  ['judgment-expand', '/index.html', VIEWPORTS.desktop, async page => {
    const button = page.locator('.view-extra-toggle').first();
    await button.click();
    await expect(button.locator('xpath=..')).toHaveClass(/open/);
  }],
  ['case-expand', '/index.html', VIEWPORTS.desktop, async page => {
    const button = page.locator('.case-detail-btn').first();
    await button.click();
    await expect(button).toHaveClass(/open/);
  }],
  ['blog-filter', '/tools/blog/index.html', VIEWPORTS.desktop, async page => {
    const filter = page.locator('[data-cat="技术"]').first();
    await filter.click();
    await expect(filter).toHaveClass(/active/);
    await expect(page.locator('#archiveRoot .post-row').first()).toBeVisible();
  }],
  ['blog-search', '/tools/blog/index.html', VIEWPORTS.desktop, async page => {
    await page.locator('#searchInput').fill('Agent');
    await expect(page.locator('#activeFilters')).toContainText('Agent');
    await expect(page.locator('#archiveRoot .post-row').first()).toBeVisible();
  }],
  ['blog-pagination', '/tools/blog/index.html', VIEWPORTS.desktop, async page => {
    await page.locator('.page-btn[data-goto="2"]').first().click();
    await expect(page.locator('.page-btn.active')).toHaveText('2');
  }],
  ['article-references', '/tools/blog/posts/training-vs-inference.html', VIEWPORTS.desktop, async page => {
    const button = page.locator('.reference-toggle');
    await button.click();
    await expect(button).toHaveAttribute('aria-expanded', 'true');
  }],
];

for (const [name, route, viewport, action] of functionalStates) {
  test(`function ${name}`, async () => {
    await compareScenario({ route, viewportName: name, viewport, theme: 'light' }, action, 'function');
    report.comparisons.function += 1;
  });
}

for (const [route, selector] of Object.entries(TOOL_ACTIONS)) {
  test(`tool main ${route}`, async () => {
    const action = selector ? async page => {
      const target = page.locator(selector);
      await expect(target).toBeVisible();
      await target.click();
    } : async page => expect(page.locator('body')).not.toHaveText('');
    await compareScenario({ route, viewportName: 'tool-main', viewport: VIEWPORTS.desktop, theme: 'light' }, action, 'tool');
    report.comparisons.function += 1;
  });

  test(`tool degraded no-js ${route}`, async () => {
    const action = async page => {
      await expect(page.locator('body')).not.toHaveText('');
      await expect(page.locator('body')).toBeVisible();
    };
    await compareScenario({
      route,
      viewportName: 'tool-no-js',
      viewport: VIEWPORTS.mobile,
      theme: 'light',
      javaScriptEnabled: false,
    }, action, 'tool-no-js');
    report.comparisons.function += 1;
  });
}
