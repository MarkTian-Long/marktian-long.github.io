const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

function loadRenderingApi() {
  const source = fs.readFileSync(path.join(__dirname, '../tools/stock/app.js'), 'utf8');
  const messages = { scrollHeight: 100, scrollTop: 0 };
  const context = {
    AbortSignal,
    URLSearchParams,
    console,
    document: { getElementById: () => messages },
    fetch,
    STATIC_RUNTIME_MODE: 'mock',
    setTimeout,
  };
  vm.runInNewContext(
    `${source}\nglobalThis.__stockRendering = { buildAnswer, callLLM, parseIntent, updateMsg };`,
    context,
  );
  return context.__stockRendering;
}

test('Stock exposes a workflow API instead of making tests depend on page-only globals', () => {
  const source = fs.readFileSync(path.join(__dirname, '../tools/stock/app.js'), 'utf8');
  assert.match(source, /StockResearch/);
});

test('Stock renders trusted answer templates while escaping model text', () => {
  const api = loadRenderingApi();
  const bubble = { innerHTML: '' };
  const message = { querySelector: () => bubble };
  const html = api.buildAnswer(
    '<img src=x onerror=alert(1)>\nsecond line',
    [],
    { symbol: '600519.SS', range: '5d', interval: '1d' },
  );

  api.updateMsg(message, html);

  assert.match(bubble.innerHTML, /<span class="step-tag step2">/);
  assert.match(bubble.innerHTML, /<div class="prompt-card"/);
  assert.match(bubble.innerHTML, /&lt;img src=x onerror=alert\(1\)&gt;<br\/>second line/);
  assert.doesNotMatch(bubble.innerHTML, /<img\b/);
});

test('Stock mock adapter returns the JSON contract required by intent parsing', async () => {
  const api = loadRenderingApi();
  const intent = await api.parseIntent('查询宁德时代近一月行情');

  assert.deepEqual(
    {
      symbol: intent.symbol,
      range: intent.range,
      interval: intent.interval,
      unresolved: intent.unresolved,
    },
    { symbol: '300750.SZ', range: '1mo', interval: '1d', unresolved: false },
  );
});

test('Stock mock adapter returns structured contracts for JSON-only prompts', async () => {
  const api = loadRenderingApi();
  const diagnosis = JSON.parse(await api.callLLM('输出严格JSON格式的诊断结果', '股票：贵州茅台'));
  const reranked = JSON.parse(await api.callLLM('输出严格JSON数组', '[12] 新闻一\n[7] 新闻二'));
  const plan = JSON.parse(await api.callLLM('以JSON格式输出think和plan两段', '用户问题：分析贵州茅台'));

  assert.equal(typeof diagnosis.summary, 'string');
  assert.deepEqual(reranked.map((item) => item.id), [12, 7]);
  assert.equal(typeof plan.think, 'string');
  assert.equal(typeof plan.plan, 'string');
});
