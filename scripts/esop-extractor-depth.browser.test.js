'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');
const { chromium } = require('@playwright/test');

const { createStaticServer, BLOCKED_BROWSER_PORTS } = require('./equivalence/servers');
const { FIXTURE_SCENARIOS } = require('../tools/esop-extractor/app.js');

const repoRoot = path.resolve(__dirname, '..');

function isSpawnEperm(error) {
  return error?.code === 'EPERM' || /spawn\s+EPERM|EACCES.*browser/i.test(String(error?.message || error));
}

function edgeExecutableCandidates() {
  const localAppData = process.env.LOCALAPPDATA || path.join(os.homedir(), 'AppData', 'Local');
  return [
    process.env.PROGRAMFILES && path.join(process.env.PROGRAMFILES, 'Microsoft', 'Edge', 'Application', 'msedge.exe'),
    process.env['PROGRAMFILES(X86)'] && path.join(process.env['PROGRAMFILES(X86)'], 'Microsoft', 'Edge', 'Application', 'msedge.exe'),
    path.join(localAppData, 'Microsoft', 'Edge', 'Application', 'msedge.exe'),
  ].filter(Boolean);
}

async function launchBrowserWithFallback() {
  const configured = String(process.env.PLAYWRIGHT_EXECUTABLE_PATH || '').trim();
  const candidates = configured ? [configured, ...edgeExecutableCandidates()] : [null, ...edgeExecutableCandidates()];
  let lastError = null;
  for (const executablePath of [...new Set(candidates)]) {
    if (executablePath && !fs.existsSync(executablePath)) continue;
    try {
      return await chromium.launch({ headless: true, ...(executablePath ? { executablePath } : {}) });
    } catch (error) {
      lastError = error;
      if (!isSpawnEperm(error)) throw error;
    }
  }
  const error = new Error('bundled Chromium returned spawn EPERM and no usable Edge executable was found');
  error.skipBrowser = true;
  error.cause = lastError;
  throw error;
}

function startStaticServer() {
  return new Promise((resolve, reject) => {
    const server = createStaticServer({ rootDir: repoRoot, label: 'esop-depth-browser' });
    server.once('error', reject);
    const listen = () => server.listen(0, '127.0.0.1', () => {
      const address = server.address();
      if (BLOCKED_BROWSER_PORTS.has(address.port)) return server.close(listen);
      resolve({ server, url: `http://127.0.0.1:${address.port}` });
    });
    listen();
  });
}

function startApiServer() {
  const responseBody = JSON.stringify(FIXTURE_SCENARIOS[0].result);
  let requestCount = 0;
  return new Promise((resolve, reject) => {
    const server = http.createServer((request, response) => {
      const origin = request.headers.origin || '*';
      response.setHeader('Access-Control-Allow-Origin', origin);
      response.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
      response.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      if (request.method === 'OPTIONS') { response.writeHead(204); response.end(); return; }
      if (request.method !== 'POST') { response.writeHead(405); response.end(); return; }
      requestCount += 1;
      request.on('data', () => {});
      request.on('end', () => {
        setTimeout(() => {
          if (response.writableEnded) return;
          response.writeHead(200, { 'content-type': 'application/json; charset=utf-8' });
          response.end(responseBody);
        }, 650);
      });
    });
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => resolve({
      server,
      url: `http://127.0.0.1:${server.address().port}`,
      getRequestCount: () => requestCount,
    }));
  });
}

function stopServer(server) { return new Promise((resolve) => server.close(resolve)); }

test('ESOP browser regression covers privacy, race safety, origin snapshot, semantics, and 390px layout', { timeout: 90000 }, async (t) => {
  let browser;
  let staticServer;
  let staticServerUrl;
  let apiServer;
  let apiUrl;
  let getApiRequestCount;
  try {
    browser = await launchBrowserWithFallback();
  } catch (error) {
    if (error.skipBrowser) { t.skip(error.message); return; }
    throw error;
  }
  try {
    ({ server: staticServer, url: staticServerUrl } = await startStaticServer());
    ({ server: apiServer, url: apiUrl, getRequestCount: getApiRequestCount } = await startApiServer());
    const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, locale: 'zh-CN', serviceWorkers: 'block' });
    const remoteRequests = [];
    const page = await context.newPage();
    page.on('request', (request) => { if (/analytics\.js|googletagmanager/i.test(request.url())) remoteRequests.push(request.url()); });
    await page.goto(`${staticServerUrl}/tools/esop-extractor/index.html`, { waitUntil: 'domcontentloaded' });
    await page.locator('#keySection .collapsible-header').click();
    assert.equal(await page.locator('#keySection .collapsible-header').getAttribute('aria-expanded'), 'true');
    assert.equal(await page.locator('#keySectionBody').getAttribute('hidden'), null);
    await page.locator('#keySection .collapsible-header').click();
    assert.equal(await page.locator('#keySection .collapsible-header').getAttribute('aria-expanded'), 'false');
    assert.notEqual(await page.locator('#keySectionBody').getAttribute('hidden'), null);
    await page.locator('#keySection .collapsible-header').click();
    assert.equal(await page.locator('#pdfDropZone').getAttribute('tabindex'), '0');
    assert.equal(await page.locator('.tabs').getAttribute('role'), 'tablist');
    assert.equal(await page.locator('#tab-basic').getAttribute('aria-selected'), 'true');
    assert.equal(await page.locator('#editModal').getAttribute('role'), 'dialog');
    assert.equal(await page.locator('#editModal').getAttribute('aria-modal'), 'true');

    await page.locator('#extractBtn').click();
    await page.locator('#outputContent').waitFor({ state: 'visible' });
    assert.match(await page.locator('#resultModeHint').textContent(), /Demo/);

    await page.locator('#modeCustom').click();
    await page.locator('#textInput').fill('race-sensitive free text');
    await page.locator('#endpointInput').fill(`${apiUrl}/v1`);
    await page.locator('#modelInput').fill('test-model');
    await page.locator('#keyInput').fill('test-key');
    await page.locator('#apiOriginConfirm').check();
    await page.locator('#extractBtn').click();
    await page.waitForTimeout(100);
    await page.locator('#modeDefault').click();
    await page.waitForTimeout(900);
    assert.equal(await page.locator('#modeBoundaryLabel').textContent(), 'Demo 夹具');
    assert.equal(await page.locator('#outputContent').isHidden(), true);
    assert.equal(await page.locator('#outputPlaceholder').isHidden(), false);
    assert.equal(await page.locator('#errorDisplay').isHidden(), true);

    await page.locator('#modeCustom').click();
    await page.locator('#textInput').fill('origin snapshot test');
    await page.locator('#endpointInput').fill(`${apiUrl}/v1`);
    await page.locator('#modelInput').fill('test-model');
    await page.locator('#keyInput').fill('test-key');
    await page.locator('#apiOriginConfirm').check();
    await page.locator('#endpointInput').evaluate((input) => { input.value = input.value.replace('/v1', '/changed'); });
    const requestsBeforeBypass = getApiRequestCount();
    await page.locator('#extractBtn').click();
    await page.locator('#errorDisplay').waitFor({ state: 'visible' });
    assert.match(await page.locator('#errorMessage').textContent(), /origin|确认/i);
    assert.equal(getApiRequestCount(), requestsBeforeBypass);

    await page.locator('#modeDefault').click();
    await page.locator('#extractBtn').click();
    await page.locator('#outputContent').waitFor({ state: 'visible' });
    await page.locator('#tab-plan').click();
    assert.equal(await page.locator('#tab-plan').getAttribute('aria-selected'), 'true');
    assert.equal(await page.locator('#tab-basic').getAttribute('aria-selected'), 'false');
    const editButton = page.locator('.btn-edit').first();
    await editButton.focus();
    await editButton.click();
    await page.locator('#editModal').waitFor({ state: 'visible' });
    assert.equal(await page.locator('#editModal').getAttribute('aria-hidden'), 'false');
    assert.equal(await page.locator('#reviewStatusInput').evaluate((element) => document.activeElement === element), true);
    await page.keyboard.press('Shift+Tab');
    assert.equal(await page.locator('.modal-save-btn').evaluate((element) => document.activeElement === element), true);
    await page.keyboard.press('Tab');
    assert.equal(await page.locator('#reviewStatusInput').evaluate((element) => document.activeElement === element), true);
    await page.keyboard.press('Escape');
    assert.equal(await page.locator('#editModal').isHidden(), true);
    assert.equal(await editButton.evaluate((element) => document.activeElement === element), true);

    await page.locator('#modePdf').click();
    await page.locator('#pdfDropZone').waitFor({ state: 'visible' });
    await page.locator('#pdfDropZone').focus();
    assert.equal(await page.locator('#pdfDropZone').evaluate((element) => document.activeElement === element), true);
    assert.deepEqual(await page.locator('.tabs').evaluate((element) => ({ role: element.getAttribute('role'), tabCount: element.querySelectorAll('[role="tab"]').length })), { role: 'tablist', tabCount: 3 });
    assert.deepEqual(remoteRequests, []);
    await context.close();

    const blockedContext = await browser.newContext({ viewport: { width: 390, height: 844 }, locale: 'zh-CN', serviceWorkers: 'block' });
    await blockedContext.addInitScript(() => {
      try { Object.defineProperty(window, 'localStorage', { configurable: true, get() { throw new DOMException('blocked', 'SecurityError'); } }); } catch {}
    });
    const blockedPage = await blockedContext.newPage();
    await blockedPage.goto(`${staticServerUrl}/tools/esop-extractor/index.html`, { waitUntil: 'domcontentloaded' });
    await blockedPage.locator('#storageNotice').waitFor({ state: 'visible' });
    assert.match(await blockedPage.locator('#storageNotice').textContent(), /仍可继续使用|不会保存/);
    await blockedPage.locator('#extractBtn').click();
    await blockedPage.locator('#outputContent').waitFor({ state: 'visible' });
    assert.ok(await blockedPage.locator('#app').evaluate((element) => element.getBoundingClientRect().width <= 390));
    await blockedContext.close();
  } finally {
    if (apiServer) await stopServer(apiServer);
    if (staticServer) await stopServer(staticServer);
    if (browser) await browser.close();
  }
});
