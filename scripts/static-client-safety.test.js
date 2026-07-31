const assert = require('node:assert/strict');
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
