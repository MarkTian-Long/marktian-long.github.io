const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const { isScanTarget, scanText } = require('./check-static-client-secrets');

test('static safety scanner detects workflow injection without exposing its value', () => {
  const text = 'API_KEY: ${{ secrets.DEPLOY_ONLY_KEY }}\n';
  const findings = scanText('.github/workflows/deploy.yml', text);

  assert.deepEqual(findings.map((item) => item.rule), ['workflow-secret-injection']);
  assert.equal(findings[0].line, 1);
  assert.doesNotMatch(findings[0].recommendation, /DEPLOY_ONLY_KEY/);
});

test('static safety scanner reports innerHTML and evidence-sensitive claims with locations', () => {
  const text = [
    'panel.innerHTML = modelReply;',
    '该生产级 Demo 的准确率提升 20%。',
  ].join('\n');
  const findings = scanText('tools/demo/index.html', text);

  assert.deepEqual(
    findings.map((item) => [item.rule, item.line]),
    [
      ['high-risk-innerHTML', 1],
      ['high-risk-public-claim', 2],
      ['high-risk-public-claim', 2],
      ['high-risk-public-claim', 2],
    ],
  );
  assert.ok(findings.every((item) => item.recommendation));
});

test('static safety scanner never reads local key configuration files', () => {
  assert.equal(isScanTarget('tools/stock/config.local.js'), false);
  assert.equal(isScanTarget('tools/stock/config.example.js'), true);
  assert.equal(isScanTarget('.github/workflows/deploy.yml'), true);
});

test('public deployment has no credential injection or browser-loaded local config', () => {
  const root = path.resolve(__dirname, '..');
  const workflow = fs.readFileSync(path.join(root, '.github/workflows/deploy.yml'), 'utf8');
  const esop = fs.readFileSync(path.join(root, 'tools/esop-extractor/index.html'), 'utf8');
  const stock = fs.readFileSync(path.join(root, 'tools/stock/index.html'), 'utf8');

  assert.doesNotMatch(workflow, /secrets\./);
  assert.doesNotMatch(workflow, /config\.local\.js/);
  assert.doesNotMatch(esop, /src="config\.local\.js"/);
  assert.doesNotMatch(stock, /src="config\.local\.js"/);
  assert.doesNotMatch(stock, /openrouter\.ai/);
  assert.doesNotMatch(stock, /Authorization:\s*'Bearer/);
  assert.doesNotMatch(stock, /🤖 AI 生成/);
  assert.match(stock, /const STATIC_RUNTIME_MODE = 'mock';/);
});

test('custom API keys stay in memory and untrusted multiline output is escaped', () => {
  const root = path.resolve(__dirname, '..');
  const esop = fs.readFileSync(path.join(root, 'tools/esop-extractor/index.html'), 'utf8');
  const stock = fs.readFileSync(path.join(root, 'tools/stock/index.html'), 'utf8');

  assert.doesNotMatch(esop, /localStorage\.(getItem|setItem)\(STORAGE_KEY_APIKEY/);
  assert.match(esop, /localStorage\.removeItem\(STORAGE_KEY_APIKEY\)/);
  assert.match(esop, /state\.apiKey\s*=\s*val/);
  assert.match(stock, /function escapeMultiline\(text\)\s*{\s*return escHtml\(text\)\.replace\(\/\\n\/g,'<br\/>'\);/);
  assert.doesNotMatch(stock, /(?:report|conclusion|brief|content)\.replace\(\/\\n\/g,'<br\/>'\)/);
});

test('homepage tool navigation keeps direct links and has no obsolete panel opener', () => {
  const root = path.resolve(__dirname, '..');
  const main = fs.readFileSync(path.join(root, 'assets/js/main.js'), 'utf8');

  assert.match(main, /href="tools\/esop-extractor\/index\.html" target="_blank" rel="noopener"/);
  assert.doesNotMatch(main, /function (openTool|switchTool)\(/);
  assert.doesNotMatch(main, /switchTool\(/);
});
