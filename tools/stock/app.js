let isLoading = false;

// =============================================
//  股票代码映射（A股 → Yahoo Finance 格式）
// =============================================
const SYMBOL_MAP = {
  // 指数
  '上证':     '000001.SS', '上证指数': '000001.SS',
  '深证':     '399001.SZ', '深证成指': '399001.SZ',
  '创业板':   '399006.SZ', '创业板指': '399006.SZ',
  '中证500':  '000905.SS', '沪深300':  '000300.SS',
  // 个股
  '茅台':     '600519.SS', '贵州茅台': '600519.SS',
  '宁德时代': '300750.SZ',
  '比亚迪':   '002594.SZ',
  '招商银行': '600036.SS',
  '中国平安': '601318.SS',
  '腾讯':     '0700.HK',
};

const STOCK_APP_VERSION = 'stock-assistant-v2';
const DATA_MODE_DEMO = 'demo';
const DATA_MODE_MARKET = 'market';
const DEMO_SNAPSHOT_TIME = '2026-08-28T07:00:00.000Z';
let currentDataMode = DATA_MODE_DEMO;
let domSequence = 0;
let runSequence = 0;
let privateSequence = 0;
let lastMarketQuery = '';

const DEMO_CLOSES = Object.freeze({
  '000001.SS': [3388.12, 3394.75, 3382.41, 3401.06, 3410.22],
  '000905.SS': [5210.4, 5242.8, 5221.6, 5260.1, 5288.7],
  '399001.SZ': [10822.1, 10848.3, 10790.5, 10876.8, 10902.4],
  '399006.SZ': [2210.4, 2226.8, 2218.2, 2240.1, 2254.3],
  '000300.SS': [3890.6, 3912.2, 3884.1, 3925.7, 3940.8],
  '600519.SS': [1478.2, 1491.4, 1485.6, 1502.8, 1496.3],
  '300750.SZ': [241.6, 244.2, 242.8, 246.1, 248.5],
  '002594.SZ': [278.4, 281.7, 280.2, 283.5, 286.1],
  '600036.SS': [39.1, 39.5, 39.3, 39.8, 40.2],
  '601318.SS': [48.7, 49.1, 48.9, 49.4, 49.8],
  '0700.HK': [382.4, 386.1, 384.8, 389.2, 391.5],
});
const DEMO_DATES = Object.freeze(['2026-08-24', '2026-08-25', '2026-08-26', '2026-08-27', '2026-08-28']);

const RESEARCH_SESSION = {
  version: STOCK_APP_VERSION,
  sessionId: 'session-local-001',
  runs: [],
};

const FEEDBACK_LOG = [];

function nextDomId(prefix) {
  domSequence += 1;
  return prefix + '-' + String(domSequence).padStart(3, '0');
}

function cloneData(value) {
  return JSON.parse(JSON.stringify(value));
}

function dataModeLabel(mode) {
  return mode === DATA_MODE_MARKET ? '联网行情' : '演示快照';
}

function sourceLabel(snapshot) {
  return snapshot && snapshot.source === 'Yahoo Finance' ? 'Yahoo Finance' : '演示快照';
}

function recordResearchRun(input) {
  runSequence += 1;
  const run = {
    runId: 'run-' + String(runSequence).padStart(3, '0'),
    scenario: input.scenario || 'unspecified',
    dataMode: input.dataMode || currentDataMode,
    sourceIds: Array.from(new Set(input.sourceIds || [])),
    status: input.status || 'success',
    version: STOCK_APP_VERSION,
  };
  RESEARCH_SESSION.runs.push(run);
  renderResearchSession();
  return cloneData(run);
}

function updateResearchRun(runId, patch) {
  const run = RESEARCH_SESSION.runs.find(function(item) { return item.runId === runId; });
  if (run) Object.assign(run, patch || {});
  renderResearchSession();
  return run ? cloneData(run) : null;
}

function getResearchSession() {
  return cloneData(RESEARCH_SESSION);
}

function renderResearchSession() {
  const summary = typeof document !== 'undefined' && document.getElementById ? document.getElementById('sessionSummary') : null;
  if (!summary) return;
  const lastRun = RESEARCH_SESSION.runs[RESEARCH_SESSION.runs.length - 1];
  const lastText = lastRun ? ' · 最近 ' + lastRun.runId + ' ' + lastRun.scenario : '';
  summary.textContent = '研究会话 ' + RESEARCH_SESSION.sessionId + ' · ' + RESEARCH_SESSION.runs.length + ' 次运行 · 当前' + dataModeLabel(currentDataMode) + ' · 仅本页内存' + lastText;
}

function setDataMode(mode) {
  if (mode !== DATA_MODE_DEMO && mode !== DATA_MODE_MARKET) return currentDataMode;
  currentDataMode = mode;
  const rootDocument = typeof document !== 'undefined' ? document : null;
  if (rootDocument && typeof rootDocument.querySelectorAll === 'function') rootDocument.querySelectorAll('[data-mode-choice]').forEach(function(button) {
    const active = button.getAttribute('data-mode-choice') === mode;
    button.classList.toggle('active', active);
    button.setAttribute('aria-pressed', String(active));
  });
  const status = rootDocument && rootDocument.getElementById ? rootDocument.getElementById('dataModeStatus') : null;
  if (status) status.textContent = mode === DATA_MODE_MARKET
    ? '已选择联网行情，提交查询后才请求 Yahoo；失败不会替换为演示数据。'
    : '默认不联网，使用固定演示快照。';
  renderResearchSession();
  return currentDataMode;
}

function getCurrentDataMode() {
  return currentDataMode;
}

// =============================================
//  UI Helpers
// =============================================
function autoResize(el) {
  el.style.height = 'auto';
  el.style.height = Math.min(el.scrollHeight, 120) + 'px';
}
function handleKey(e) {
  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
}
function sendQuick(text) {
  document.getElementById('inputBox').value = text;
  handleSend();
}
function hideWelcome() {
  const w = document.getElementById('welcome');
  if (w) w.remove();
}
function scrollBottom() {
  const m = document.getElementById('messages');
  m.scrollTop = m.scrollHeight;
}
function appendUserMsg(text) {
  hideWelcome();
  const div = document.createElement('div');
  div.className = 'msg user';
  div.innerHTML = `<div class="msg-avatar">👤</div><div class="msg-body"><div class="msg-bubble">${escHtml(text)}</div></div>`;
  document.getElementById('messages').appendChild(div);
  scrollBottom();
}
function appendLoadingMsg(stepLabel) {
  const div = document.createElement('div');
  div.className = 'msg ai';
  div.innerHTML = `<div class="msg-avatar">🤖</div><div class="msg-body"><div class="msg-bubble loading"><span class="step-tag step1">${escHtml(stepLabel)}</span><br/>处理中…</div></div>`;
  document.getElementById('messages').appendChild(div);
  scrollBottom();
  return div;
}
function updateMsg(div, content) {
  div.querySelector('.msg-bubble').innerHTML = content;
  scrollBottom();
}
function escHtml(str) {
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
function escAttr(str) {
  return escHtml(str).replace(/'/g, '&#39;');
}
function escapeMultiline(text) {
  return escHtml(text).replace(/\n/g,'<br/>');
}

// =============================================
//  Main Flow
// =============================================
function shakeInput(el) {
  el.classList.add('input-shake');
  el.style.borderColor = 'var(--accent-red)';
  setTimeout(function() { el.classList.remove('input-shake'); el.style.borderColor = ''; }, 600);
}

async function handleSend() {
  if (isLoading) return;
  const box = document.getElementById('inputBox');
  const text = box.value.trim();
  if (!text) { shakeInput(box); return; }

  lastMarketQuery = text;
  const requestMode = currentDataMode;
  box.value = ''; box.style.height = 'auto';
  isLoading = true;
  document.getElementById('sendBtn').disabled = true;
  appendUserMsg(text);

  const loadingDiv = appendLoadingMsg('Step 1 · 解析任务');
  let run = null;
  let dataLoading = null;
  let marketCompleted = false;

  try {
    const params = await parseIntent(text);
    if (params.unresolved) throw new Error('未识别股票代码：请使用股票名称或 6 位代码后重试');
    updateMsg(loadingDiv, `<span class="step-tag step1">Step 1 完成</span><br/>${escHtml(params.name || params.symbol)} · ${escHtml(params.range)} · ${escHtml(params.interval)}`);

    dataLoading = appendLoadingMsg('Step 2 · 获取行情数据');
    const snapshot = await fetchMarketData(params.symbol, params.range, params.interval, { mode: requestMode });
    run = recordResearchRun({
      scenario: 'market-query',
      dataMode: requestMode,
      sourceIds: [sourceIdForSnapshot(snapshot, params.symbol)],
    });
    updateMsg(dataLoading, `<span class="step-tag step1">Step 2 完成</span><br/>${escHtml(sourceLabel(snapshot))} · ${snapshot.rows.length} 条记录 · 市场时间 ${escHtml(snapshot.marketAsOf)}`);
    marketCompleted = true;

    const summaryLoading = appendLoadingMsg('Step 3 · 本地规则摘要');
    const answer = await interpretData(text, params, snapshot);
    updateMsg(summaryLoading, buildAnswer(answer, snapshot, params, run));
  } catch (err) {
    if (run) updateResearchRun(run.runId, { status: 'failed' });
    else run = recordResearchRun({ scenario: 'market-query', dataMode: requestMode, sourceIds: [], status: 'failed' });
    if (dataLoading && !marketCompleted) updateMsg(dataLoading, `<span class="step-tag step1">Step 2 未完成</span><br/>${escHtml(err.message || err)}`);
    updateMsg(loadingDiv, buildMarketFailureState(err, requestMode, run));
  } finally {
    isLoading = false;
    document.getElementById('sendBtn').disabled = false;
  }
}

// =============================================
//  Step 1: 本地规则意图解析（保留 JSON 适配器契约）
// =============================================
async function parseIntent(userQuery) {
  const symbolList = Object.entries(SYMBOL_MAP).map(([k,v])=>`${k}=${v}`).join(',');
  const systemPrompt = `解析A股/港股查询意图，只返回JSON，无其他文字。
字段：symbol(Yahoo格式股票代码),range(数据范围:1d/5d/1mo/3mo/6mo/1y),interval(粒度:1d/1wk/1mo)
代码映射：${symbolList}
若用户提到的股票不在映射表，symbol必须为null并将unresolved设为true，不要猜测代码
"今日/最近交易日/最近一个交易日"→range=1d,interval=1d；"近5日/一周"→range=5d,interval=1d；"近3日"→range=5d,interval=1d；"近一月"→range=1mo,interval=1d
示例：{"symbol":"600519.SS","range":"5d","interval":"1d"}`;

  const resp = await callLLM(systemPrompt, userQuery);
  try {
    const cleaned = resp.replace(/```json?\s*/gi,'').replace(/```/g,'').trim();
    const parsed = JSON.parse(cleaned);
    return {
      symbol: parsed.symbol || null,
      name: parsed.name || String(userQuery || '').trim(),
      range: parsed.range || '5d',
      interval: parsed.interval || '1d',
      unresolved: Boolean(parsed.unresolved || !parsed.symbol),
    };
  } catch {
    throw new Error('意图解析失败：' + resp.slice(0, 150));
  }
}

// =============================================
//  Yahoo Finance 数据获取（通过 allorigins 代理解决 CORS）
// =============================================
function toFiniteNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function toIso(value) {
  if (typeof value === 'string') return new Date(value).toISOString();
  if (typeof value === 'number') return new Date(value).toISOString();
  return new Date().toISOString();
}

function buildRowsFromCloses(closes) {
  return closes.map(function(close, index) {
    const previous = closes[index - 1];
    return {
      date: DEMO_DATES[index] || DEMO_DATES[DEMO_DATES.length - 1],
      open: Number((close - 2.4).toFixed(2)),
      high: Number((close + 3.6).toFixed(2)),
      low: Number((close - 4.1).toFixed(2)),
      close: Number(close),
      volume: 1000000 + index * 180000,
      changePct: previous ? Number(((close - previous) / previous * 100).toFixed(2)) : null,
    };
  });
}

function getDemoMarketSnapshot(symbol) {
  const closes = DEMO_CLOSES[symbol];
  if (!closes) throw new Error('演示快照没有该标的：请确认股票代码后重试');
  return {
    kind: 'market-snapshot',
    source: '演示快照',
    transport: 'local',
    marketAsOf: DEMO_SNAPSHOT_TIME,
    fetchedAt: DEMO_SNAPSHOT_TIME,
    rows: cloneData(buildRowsFromCloses(closes)),
  };
}

function createTimeoutSignal(timeoutMs) {
  if (typeof AbortController === 'undefined' || !timeoutMs) return { signal: undefined, cleanup: function() {} };
  const controller = new AbortController();
  const timer = setTimeout(function() { controller.abort(); }, timeoutMs);
  return { signal: controller.signal, cleanup: function() { clearTimeout(timer); } };
}

function parseChartPayload(text) {
  const outer = JSON.parse(text);
  const payload = outer && outer.contents ? JSON.parse(outer.contents) : outer;
  if (!payload || !payload.chart) throw new Error('响应缺少 chart 数据');
  return payload;
}

function rowsFromChartResult(result) {
  const timestamps = result.timestamp || [];
  const quote = result.indicators && result.indicators.quote && result.indicators.quote[0] || {};
  const rowsByDate = new Map();
  timestamps.forEach(function(timestamp, index) {
    const close = toFiniteNumber(quote.close && quote.close[index]);
    if (close === null) return;
    const date = new Date(timestamp * 1000).toISOString().slice(0, 10);
    rowsByDate.set(date, {
      date: date,
      open: toFiniteNumber(quote.open && quote.open[index]),
      high: toFiniteNumber(quote.high && quote.high[index]),
      low: toFiniteNumber(quote.low && quote.low[index]),
      close: close,
      volume: toFiniteNumber(quote.volume && quote.volume[index]),
      changePct: null,
    });
  });
  const rows = Array.from(rowsByDate.values());
  return rows.map(function(row, index) {
    const previous = rows[index - 1];
    return Object.assign({}, row, {
      changePct: previous ? Number(((row.close - previous.close) / previous.close * 100).toFixed(2)) : null,
    });
  });
}

async function fetchYahoo(symbol, range, interval, options) {
  if (!symbol) throw new Error('未识别股票代码，未发起联网请求');
  const opts = options || {};
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=${range}&interval=${interval}&includePrePost=false`;
  const proxies = [
    { name: 'corsproxy.io', make: function(u) { return `https://corsproxy.io/?${encodeURIComponent(u)}`; } },
    { name: 'allorigins.win', make: function(u) { return `https://api.allorigins.win/get?url=${encodeURIComponent(u)}`; } },
    { name: 'codetabs.com', make: function(u) { return `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(u)}`; } },
  ];
  const fetchImpl = opts.fetchImpl || fetch;
  let lastErr = '未知网络错误';
  for (const proxy of proxies) {
    const timer = createTimeoutSignal(opts.timeoutMs || 8000);
    try {
      const response = await fetchImpl(proxy.make(url), { signal: timer.signal });
      if (!response.ok) {
        lastErr = 'HTTP ' + response.status;
        continue;
      }
      let payload;
      try {
        payload = parseChartPayload(await response.text());
      } catch (error) {
        lastErr = error.message === '响应缺少 chart 数据' ? error.message : '响应解析失败';
        continue;
      }
      const result = payload.chart.result && payload.chart.result[0];
      if (!result) throw new Error(payload.chart.error && payload.chart.error.description || '未找到该股票数据');
      const rows = rowsFromChartResult(result);
      const marketTimestamp = result.meta && result.meta.regularMarketTime || (result.timestamp && result.timestamp[result.timestamp.length - 1]);
      if (!rows.length) throw new Error('行情响应没有可用收盘价');
      return {
        kind: 'market-snapshot',
        source: 'Yahoo Finance',
        transport: proxy.name,
        marketAsOf: marketTimestamp ? toIso(marketTimestamp * 1000) : 'unknown',
        fetchedAt: toIso(opts.now),
        rows: rows,
      };
    } catch (error) {
      lastErr = error && error.message ? error.message : String(error);
    } finally {
      timer.cleanup();
    }
  }
  throw new Error('数据请求失败：' + lastErr);
}

async function fetchMarketData(symbol, range, interval, options) {
  const opts = options || {};
  const mode = opts.mode || currentDataMode;
  if (mode === DATA_MODE_DEMO) return getDemoMarketSnapshot(symbol, range, interval);
  if (mode === DATA_MODE_MARKET) return fetchYahoo(symbol, range, interval, opts);
  throw new Error('未知数据模式：' + mode);
}

function sourceIdForSnapshot(snapshot, symbol) {
  if (snapshot && snapshot.source === 'Yahoo Finance') return 'yahoo-price-' + symbol;
  return 'demo-price-' + symbol;
}

function buildMarketFailureState(error, mode, run) {
  const message = escHtml(String(error && error.message || error));
  const modeText = mode === DATA_MODE_MARKET ? '联网行情' : '演示快照';
  return '<div class="market-error-state">'
    + '<strong>行情未完成</strong>'
    + '<span>' + message + '</span>'
    + '<span class="state-note">当前模式：' + modeText + '。失败结果不会静默替换为另一种数据。</span>'
    + (run ? '<span class="state-note">运行：' + escHtml(run.runId) + ' · 状态：' + escHtml(run.status) + '</span>' : '')
    + '<div class="state-actions">'
    + '<button class="inline-action" type="button" onclick="retryLastQuery()">重试</button>'
    + '<button class="inline-action" type="button" onclick="setDataMode(\'demo\')">改用演示快照</button>'
    + '</div></div>';
}

function retryLastQuery() {
  const box = document.getElementById('inputBox');
  if (!box || !lastMarketQuery) return;
  box.value = lastMarketQuery;
  return handleSend();
}

// =============================================
//  Step 2: 本地规则数据解读
// =============================================
async function interpretData(userQuery, params, data) {
  const rows = Array.isArray(data) ? data : data && data.rows || [];
  if (!rows.length) return '没有可用行情记录，无法生成摘要。';
  const first = rows[0];
  const last = rows[rows.length - 1];
  const change = first.close ? ((last.close - first.close) / first.close * 100).toFixed(2) : '0.00';
  const direction = Number(change) > 0 ? '上行' : Number(change) < 0 ? '下行' : '基本持平';
  return '本地规则摘要：' + params.symbol + ' 在 ' + rows.length + ' 条记录中' + direction + '，区间变化 ' + change + '%。这是对输入数据的机械汇总，不是模型结论，也不提供买卖建议。';
}

// =============================================
//  构建输出
// =============================================
function buildAnswer(answer, rawData, params, run) {
  const safeAnswer = escapeMultiline(answer);
  const snapshot = Array.isArray(rawData) ? null : rawData;
  const rows = Array.isArray(rawData) ? rawData : rawData && rawData.rows || [];
  let html = `<span class="step-tag step2">本地规则摘要</span><br/>${safeAnswer}`;

  if (snapshot) {
    html += '<div class="market-provenance">'
      + '<span class="source-badge">' + escHtml(sourceLabel(snapshot)) + '</span>'
      + '<span>传输：' + escHtml(snapshot.transport) + '</span>'
      + '<span>市场时间：' + escHtml(snapshot.marketAsOf) + '</span>'
      + '<span>抓取时间：' + escHtml(snapshot.fetchedAt) + '</span>'
      + (run ? '<span>运行：' + escHtml(run.runId) + '</span>' : '')
      + '</div>';
  }

  if (rows.length > 0) {
    const collapseId = nextDomId('data');
    const headers = Object.keys(rows[0]);
    html += `
      <div class="data-collapse" id="${collapseId}">
        <div class="data-collapse-header" onclick="toggleCollapse('${collapseId}')" role="button" tabindex="0">
          <span>📋 原始行情（${rows.length} 条）</span>
          <span class="data-collapse-arrow">▼</span>
        </div>
        <div class="data-table-wrap">
          <table class="data-table">
            <thead><tr>${headers.map(h=>`<th>${escHtml(h)}</th>`).join('')}</tr></thead>
            <tbody>${rows.slice(0, 50).map(row=>`<tr>${headers.map(h=>`<td>${escHtml(formatRowValue(row[h]))}</td>`).join('')}</tr>`).join('')}</tbody>
          </table>
        </div>
      </div>`;
  }
  if (params) html += buildPromptCard(params);
  return html;
}

function formatRowValue(value) {
  if (value === null || typeof value === 'undefined') return '-';
  if (typeof value === 'number') return value.toFixed(2);
  return String(value);
}

function toggleCollapse(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.classList.toggle('open');
  const body = el.querySelector('.prompt-card-body, .data-table-wrap');
  const arrow = el.querySelector('.prompt-card-arrow, .data-collapse-arrow');
  if (body) {
    const isData = body.classList.contains('data-table-wrap');
    const isOpen = el.classList.contains('open');
    body.style.display = isOpen ? (isData ? 'block' : 'flex') : 'none';
    if (arrow) arrow.style.transform = isOpen ? 'rotate(180deg)' : '';
  }
}

function buildPromptCard(params) {
  const id = nextDomId('prompt');
  return '<div class="prompt-card" id="' + id + '">' +
    '<div class="prompt-card-header" onclick="toggleCollapse(\'' + id + '\')">' +
      '<span>🔧 Prompt 设计说明</span>' +
      '<span class="prompt-card-arrow">▼</span>' +
    '</div>' +
    '<div class="prompt-card-body" style="display:none;">' +
      '<div class="prompt-section">' +
        '<div class="prompt-label">Step 1 · 意图识别规则</div>' +
        '<div class="prompt-content">使用固定映射与 JSON 字段约束（symbol/range/interval）；无法识别时保留 unresolved，不猜测代码。</div>' +
      '</div>' +
      '<div class="prompt-section">' +
        '<div class="prompt-label">未来接入边界</div>' +
        '<div class="prompt-content">若未来接入服务端模型，应另行评估响应速度、成本、安全边界和离线回归；本页当前不调用模型。</div>' +
      '</div>' +
      '<div class="prompt-section">' +
        '<div class="prompt-label">解析结果</div>' +
        '<div class="prompt-content">symbol: <b>' + escHtml(params.symbol) + '</b> · range: <b>' + escHtml(params.range) + '</b> · interval: <b>' + escHtml(params.interval) + '</b></div>' +
      '</div>' +
      '<div class="prompt-section">' +
        '<div class="prompt-label">Step 3 · 摘要规则</div>' +
        '<div class="prompt-content">本地规则只计算区间方向与变化百分比，不生成预测，不替代人工研究。</div>' +
      '</div>' +
    '</div>' +
  '</div>';
}

// =============================================
//  Static demo response
// =============================================
function inferMockIntent(userContent) {
  const query = String(userContent || '');
  const matchedName = Object.keys(SYMBOL_MAP)
    .sort(function(a, b) { return b.length - a.length; })
    .find(function(name) { return query.includes(name); });
  const explicitCode = query.match(/\b(\d{6})\b/);
  const hongKongCode = query.match(/\b(\d{4,5})(?:\.HK|港股)\b/i);
  let symbol = matchedName ? SYMBOL_MAP[matchedName] : null;
  if (explicitCode) symbol = explicitCode[1] + (explicitCode[1].startsWith('6') ? '.SS' : '.SZ');
  if (hongKongCode) symbol = hongKongCode[1].padStart(4, '0') + '.HK';

  let range = '5d';
  if (/今日|最近(?:一个)?交易日/.test(query)) range = '1d';
  else if (/近?一月|近?1个月/.test(query)) range = '1mo';
  else if (/近?三月|近?3个月/.test(query)) range = '3mo';
  else if (/半年|近?6个月/.test(query)) range = '6mo';
  else if (/一年|近?1年/.test(query)) range = '1y';

  let interval = '1d';
  if (/周线|每周/.test(query)) interval = '1wk';
  else if (/月线|每月/.test(query)) interval = '1mo';
  return {
    symbol: symbol,
    name: matchedName || query.trim(),
    range: range,
    interval: interval,
    unresolved: !symbol,
  };
}

function mockModelResponse(systemPrompt, userContent) {
  if (systemPrompt.includes('解析A股/港股查询意图')) {
    return JSON.stringify(inferMockIntent(userContent));
  }
  if (systemPrompt.includes('诊断结果')) {
    return JSON.stringify({
      summary: '静态演示只汇总已提供的行情、基本面和情绪样本，不替代人工核查。',
      evidenceCompleteness: 2,
      pendingChecks: ['财务期别与来源需核对', '适当性与风险承受能力未评估'],
    });
  }
  if (systemPrompt.includes('严格JSON数组')) {
    const ids = Array.from(String(userContent).matchAll(/^\[(\d+)\]/gm), function(match) { return Number(match[1]); });
    return JSON.stringify(ids.map(function(id, index) {
      return { id: id, score: Math.max(0.5, 0.95 - index * 0.05), reason: '演示相关性' };
    }));
  }
  if (systemPrompt.includes('以JSON格式输出think和plan两段')) {
    return JSON.stringify({
      think: '静态演示先识别问题对象，再按问题选择可用证据工具。',
      plan: '1. 识别对象\n2. 执行选定工具\n3. 标记证据来源\n4. 等待人工确认'
    });
  }
  return '演示模式：本页未调用外部模型，也不会携带或暴露服务端密钥。请结合页面中的行情、模拟资料和引用状态理解产品链路。';
}

async function callLLM(systemPrompt, userContent) {
  if (typeof STATIC_RUNTIME_MODE !== 'undefined' && STATIC_RUNTIME_MODE !== 'mock') {
    throw new Error('当前静态页面仅支持 mock 运行模式');
  }
  return mockModelResponse(String(systemPrompt || ''), String(userContent || ''));
}

function switchTab(name) {
  document.querySelectorAll('.tab-panel').forEach(function(p) { p.classList.remove('active'); });
  document.querySelectorAll('.tab-btn').forEach(function(b) { b.classList.remove('active'); });
  document.getElementById('tab-' + name).classList.add('active');
  document.querySelector('[data-tab="' + name + '"]').classList.add('active');
  if (name === 'radar') initRadar();
}

// Tab 2: Mock 数据
const FUNDAMENTAL_MOCK = {
  '600519.SS': { pe: 28.3, pb: 9.2, marketCap: '2.1万亿', roe: '31.2%', grossMargin: '91.8%' },
  '300750.SZ': { pe: 22.1, pb: 4.8, marketCap: '1.4万亿', roe: '18.3%', grossMargin: '22.1%' },
  '002594.SZ': { pe: 18.7, pb: 3.2, marketCap: '8200亿', roe: '17.6%', grossMargin: '20.9%' },
  '600036.SS': { pe: 7.2, pb: 1.1, marketCap: '9800亿', roe: '15.3%', grossMargin: '-' },
  '601318.SS': { pe: 8.4, pb: 1.3, marketCap: '7600亿', roe: '14.1%', grossMargin: '-' },
};
const SENTIMENT_MOCK = {
  '600519.SS': { score: 3.2, label: '偏多', news: ['Q3财报超预期，净利润同比+15%', '高端白酒消费复苏信号', '机构持续增持'], trend: 'up' },
  '300750.SZ': { score: 2.1, label: '中性偏多', news: ['出货量创历史新高', '欧洲市场扩张加速', '原材料价格波动'], trend: 'flat' },
  '002594.SZ': { score: 1.8, label: '中性', news: ['国内销量领先', '海外工厂投产', '汽车行业价格竞争'], trend: 'flat' },
};
const DEFAULT_MOCK = { pe: '--', pb: '--', marketCap: '--', roe: '--', grossMargin: '--' };
const DEFAULT_SENTIMENT = { score: 0, label: '暂无数据', news: [], trend: 'flat' };

async function runDiagnosis() {
  const name = document.getElementById('diagInput').value.trim();
  if (!name) { shakeInput(document.getElementById('diagInput')); return; }
  const requestMode = currentDataMode;
  const content = document.getElementById('diagContent');
  content.innerHTML = '<div class="diag-loading">⏳ 正在整理证据…</div>';
  try {
    const params = await parseIntent(name + '近5日行情');
    if (params.unresolved) throw new Error('未识别股票代码：请使用股票名称或 6 位代码后重试');
    const symbol = params.symbol;
    const snapshot = await fetchMarketData(symbol, '5d', '1d', { mode: requestMode });
    const latest = snapshot.rows[snapshot.rows.length - 1];
    const first = snapshot.rows[0];
    const pctChange = (latest && latest.close && first && first.close)
      ? ((latest.close - first.close) / first.close * 100).toFixed(2)
      : null;
    const fundamental = FUNDAMENTAL_MOCK[symbol] || DEFAULT_MOCK;
    const sentiment = SENTIMENT_MOCK[symbol] || DEFAULT_SENTIMENT;
    const diagResult = getDiagnosisResult(name, symbol, snapshot, fundamental, sentiment);
    const run = recordResearchRun({
      scenario: 'evidence-check',
      dataMode: requestMode,
      sourceIds: [sourceIdForSnapshot(snapshot, symbol), 'fundamental-demo-' + symbol, 'sentiment-demo-' + symbol],
    });
    content.innerHTML = buildDiagCard(name, symbol, snapshot, pctChange, fundamental, sentiment, diagResult, run);
  } catch(err) {
    const run = recordResearchRun({ scenario: 'evidence-check', dataMode: requestMode, sourceIds: [], status: 'failed' });
    content.innerHTML = '<div class="diag-error">' + buildMarketFailureState(err, requestMode, run) + '</div>';
  }
}

function getDiagnosisResult(name, symbol, snapshot, fundamental, sentiment) {
  const buckets = [
    snapshot.rows.length ? '行情记录' : null,
    fundamental === DEFAULT_MOCK ? null : '基本面演示样本',
    sentiment === DEFAULT_SENTIMENT ? null : '情绪演示样本',
  ].filter(Boolean);
  return {
    summary: name + ' 的本页结果只展示可追溯证据和缺口，不输出买入、持有或回避判断。',
    evidenceCompleteness: buckets.length + '/3',
    evidenceBuckets: buckets,
    pendingChecks: [
      '财务数据期别、口径和原始来源待核对',
      '演示情绪样本不代表实时舆情',
      '未进行适当性、风险承受能力或交易授权评估',
    ],
  };
}

// Tab 3: RAG Mock 数据库

// RAG 升级1: 金融同义词词典（对应简历：系统级金融同义词对齐机制）
const FINANCE_SYNONYMS = {
  '茅台': ['贵州茅台', '600519', 'MOUTAI', '白酒龙头'],
  '贵州茅台': ['茅台', '600519', '白酒', '高端白酒'],
  '宁德时代': ['CATL', '300750', '动力电池', '锂电池'],
  '比亚迪': ['BYD', '002594', '新能源汽车'],
  '招商银行': ['招行', '600036', '零售银行'],
  '新能源': ['新能源汽车', '电动车', 'NEV', '动力电池', '产业链'],
  '白酒': ['白酒行业', '高端白酒', '酱香白酒', '食品饮料'],
  '银行': ['银行股', '金融股', '国有大行', '股份制银行'],
  'ROE': ['净资产收益率', '盈利能力', '股东回报'],
  '净资产收益率': ['ROE', '盈利能力'],
  'PE': ['市盈率', '估值'],
  '市盈率': ['PE', 'P/E', '估值倍数'],
  '北向资金': ['外资', '陆股通', '北上资金', '外资流入'],
};

function expandQuery(query) {
  const expanded = new Set();
  // 原始词
  query.split(/[，、\s]+/).filter(function(k) { return k.length > 0; }).forEach(function(k) {
    expanded.add(k);
  });
  // 同义词扩展
  const synonymExpanded = [];
  expanded.forEach(function(term) {
    if (FINANCE_SYNONYMS[term]) {
      FINANCE_SYNONYMS[term].forEach(function(syn) { expanded.add(syn); synonymExpanded.push(syn); });
    }
    // 模糊匹配：查询词包含在词典 key 中，或词典 key 包含在查询词中
    Object.keys(FINANCE_SYNONYMS).forEach(function(key) {
      if (key !== term && (key.indexOf(term) >= 0 || term.indexOf(key) >= 0)) {
        FINANCE_SYNONYMS[key].forEach(function(syn) { expanded.add(syn); });
      }
    });
  });
  return { terms: Array.from(expanded), expanded: synonymExpanded };
}

const NEWS_DB = [
  { id: 1, date: '2025-11-08', stock: '茅台', symbol: '600519.SS', title: '贵州茅台Q3财报超预期', content: '贵州茅台三季报显示净利润同比增长15.2%，营收创历史新高，高端白酒市场需求持续旺盛，机构普遍上调目标价。', tags: ['茅台', '白酒', '业绩'], relevance: 0.94, tier: 'official', source: '财报系统' },
  { id: 2, date: '2025-11-05', stock: '白酒行业', symbol: null, title: '白酒板块估值修复行情', content: '受消费复苏预期带动，白酒板块整体回暖，茅台、五粮液等龙头股量价齐升，分析师建议关注春节备货行情。', tags: ['白酒', '消费', '板块'], relevance: 0.87, tier: 'mainstream', source: '新浪财经' },
  { id: 3, date: '2025-11-02', stock: '消费板块', symbol: null, title: '国内消费数据好转，A股消费板块获资金青睐', content: '10月社零数据环比改善，消费板块获北向资金持续净买入，食品饮料领涨，分析师认为估值已具备安全边际。', tags: ['消费', '北向资金', '食品饮料'], relevance: 0.72, tier: 'mainstream', source: '东方财富' },
  { id: 4, date: '2025-11-10', stock: '宁德时代', symbol: '300750.SZ', title: '宁德时代出货量创历史新高', content: '宁德时代10月动力电池出货量同比增长38%，海外市场占比提升至29%，欧洲工厂二期投产在即，市场份额进一步稳固。', tags: ['宁德时代', '电池', '新能源'], relevance: 0.96, tier: 'official', source: '公司公告' },
  { id: 5, date: '2025-11-07', stock: '新能源', symbol: null, title: '新能源汽车渗透率突破50%', content: '11月前两周新能源汽车销量渗透率首次突破50%，产业链相关标的受益明显，动力电池、智能驾驶零部件均现强势表现。', tags: ['新能源', '汽车', '产业链'], relevance: 0.81, tier: 'mainstream', source: '证券时报' },
  { id: 6, date: '2025-11-09', stock: '比亚迪', symbol: '002594.SZ', title: '比亚迪海外工厂投产助力全球化布局', content: '比亚迪泰国工厂正式投产，年产能15万辆，东南亚市场布局加速，叠加国内以旧换新政策拉动，全年销量有望超预期。', tags: ['比亚迪', '汽车', '出海'], relevance: 0.93, tier: 'official', source: '公司公告' },
  { id: 7, date: '2025-11-06', stock: '招商银行', symbol: '600036.SS', title: '招商银行零售业务优势持续强化', content: '招行三季度零售客户数突破2亿，私行AUM增速领先同业，不良率维持低位，股息率吸引力提升，机构增持意愿明显。', tags: ['招商银行', '银行', '零售'], relevance: 0.91, tier: 'official', source: '财报系统' },
  { id: 8, date: '2025-11-01', stock: '上证指数', symbol: '000001.SS', title: 'A股市场情绪回暖，北向资金连续净流入', content: '本周北向资金累计净流入超200亿元，上证指数在3200点附近获得有效支撑，市场多头信心逐渐恢复。', tags: ['上证', '北向资金', '市场情绪'], relevance: 0.70, tier: 'unverified', source: '市场资讯' },
];

function searchNews(query, topK) {
  topK = topK || 3;
  const { terms } = expandQuery(query);
  const scored = NEWS_DB.map(function(news) {
    let score = 0;
    terms.forEach(function(kw) {
      if (news.title.indexOf(kw) >= 0 || news.stock.indexOf(kw) >= 0) score += 0.4;
      if (news.content.indexOf(kw) >= 0) score += 0.2;
      if (news.tags.some(function(t) { return t.indexOf(kw) >= 0 || kw.indexOf(t) >= 0; })) score += 0.3;
    });
    const staleNote = news.date < '2026-08-28' ? '固定历史资料，非当前行情' : '';
    const conflictNotes = [staleNote, news.tier === 'unverified' ? '来源层级待核查' : ''].filter(Boolean);
    return Object.assign({}, news, {
      sourceId: 'market-news-' + String(news.id).padStart(2, '0'),
      evidenceLevel: news.tier === 'official' ? '一手资料' : news.tier === 'mainstream' ? '二手资料' : '待核查',
      asOf: news.date + 'T00:00:00.000Z',
      unresolvedConflict: conflictNotes.join('；'),
      score: Math.min(news.relevance, score > 0 ? news.relevance * (0.7 + score) : 0.1),
    });
  });
  return scored.sort(function(a, b) { return b.score - a.score; }).slice(0, topK).filter(function(n) { return n.score > 0.1; });
}

function rerankResults(query, candidates) {
  return candidates.map(function(n, index) {
    return Object.assign({}, n, {
      rerankScore: n.score,
      rerankReason: '关键词命中 + 来源层级，规则可复核',
      origRank: index + 1,
    });
  }).sort(function(a, b) { return b.rerankScore - a.rerankScore; });
}

async function runRAG() {
  const query = document.getElementById('ragInput').value.trim();
  if (!query) { shakeInput(document.getElementById('ragInput')); return; }
  const sourcesEl = document.getElementById('ragSources');
  const reportEl = document.getElementById('ragReport');
  const expansion = expandQuery(query);
  const expandHtml = expansion.expanded.length > 0
    ? '<div class="rag-expansion">🔤 查询扩展：<b>' + escHtml(query) + '</b> → ' + expansion.terms.map(function(t) { return '<span class="expand-tag">' + escHtml(t) + '</span>'; }).join(' ') + '</div>'
    : '';
  sourcesEl.innerHTML = expandHtml + '<div class="rag-searching">🔍 关键词召回中…</div>';
  reportEl.innerHTML = '<div class="rag-searching">⌁ 等待来源完成…</div>';
  await new Promise(function(r) { setTimeout(r, 120); });
  const marketResults = searchNews(query, 5);
  const privateResults = searchPrivateKb(query, 2);
  const candidates = marketResults.concat(privateResults).slice(0, 6);
  if (candidates.length === 0) {
    const run = recordResearchRun({ scenario: 'research-report', dataMode: DATA_MODE_DEMO, sourceIds: [], status: 'partial' });
    sourcesEl.innerHTML = expandHtml + '<div class="rag-placeholder">没有命中固定演示资料，未生成研报。请换一个对象或先加入本页私有资料。</div>';
    reportEl.innerHTML = '<div class="rag-error">检索不完整 · 运行 ' + escHtml(run.runId) + ' · 未使用猜测内容</div>';
    return;
  }
  sourcesEl.innerHTML = expandHtml + '<div class="rag-searching">⌁ 规则重排中…</div>';
  reportEl.innerHTML = '<div class="rag-searching">⌁ 等待规则重排完成…</div>';
  const reranked = rerankResults(query, candidates);
  const results = reranked.slice(0, 3);
  const run = recordResearchRun({
    scenario: 'research-report',
    dataMode: DATA_MODE_DEMO,
    sourceIds: results.map(function(n) { return n.sourceId; }),
  });
  sourcesEl.innerHTML = expandHtml
    + '<div class="rerank-header">⌁ 关键词召回 → 规则重排 · ' + candidates.length + '→' + results.length + '</div>'
    + results.map(renderRagSource).join('');
  reportEl.innerHTML = buildRagReport(query, results, run);
}

function renderRagSource(n, index) {
  const rankChange = n.origRank - (index + 1);
  const rankTag = rankChange > 0
    ? '<span class="rank-up">↑' + rankChange + '</span>'
    : rankChange < 0 ? '<span class="rank-down">↓' + Math.abs(rankChange) + '</span>'
    : '<span class="rank-same">→</span>';
  const tierLabel = n.evidenceLevel || '待核查';
  return '<div class="rag-source-item" id="src-' + escAttr(n.sourceId) + '" data-source-id="' + escAttr(n.sourceId) + '">'
    + '<div class="rag-source-header"><span class="rag-source-idx">[' + (index + 1) + ']</span>' + rankTag
    + '<span class="rag-source-title">' + escHtml(n.title) + '</span></div>'
    + '<div class="rag-source-meta-row"><span class="tier-badge tier-' + escAttr(n.tier) + '">' + escHtml(tierLabel) + '</span>'
    + '<span class="rag-source-meta">' + escHtml(n.source) + ' · asOf ' + escHtml(n.asOf) + '</span></div>'
    + '<div class="rag-source-snippet">' + escHtml(n.content.slice(0, 100)) + '…</div>'
    + '<div class="rag-relevance-bar-wrap"><div class="rag-relevance-bar" style="width:' + Math.round(n.rerankScore * 100) + '%"></div>'
    + '<span class="rag-relevance-val">规则得分 ' + n.rerankScore.toFixed(2) + '</span></div>'
    + '<div class="rag-source-note">' + escHtml(n.rerankReason) + (n.unresolvedConflict ? ' · 冲突：' + escHtml(n.unresolvedConflict) : '') + '</div></div>';
}

function buildCitationLink(number, sourceId) {
  return '<a class="claim-citation" href="#src-' + escAttr(sourceId) + '" onclick="focusSource(\'' + escAttr(sourceId) + '\')">[' + number + ']</a>';
}

function buildClaims(query, results) {
  return results.map(function(n, index) {
    return {
      id: 'claim-' + String(index + 1).padStart(2, '0'),
      text: query + ' 的演示资料记录：' + n.title + '。',
      sourceId: n.sourceId,
      evidenceLevel: n.evidenceLevel,
      asOf: n.asOf,
      unresolvedConflict: n.unresolvedConflict || '未发现样本内冲突；仍需回到来源核查。',
    };
  });
}

function buildRagReport(query, results, run) {
  const claims = buildClaims(query, results);
  const reportText = claims.map(function(claim, index) {
    return '<p>' + escHtml(index === 0 ? '概况：' : index === 1 ? '观察：' : '边界：') + escHtml(claim.text) + ' ' + buildCitationLink(index + 1, claim.sourceId) + '</p>';
  }).join('');
  const claimHtml = claims.map(function(claim, index) {
    return '<div class="claim-card" id="' + escAttr(claim.id) + '">'
      + '<div class="claim-header"><span class="claim-id">' + escHtml(claim.id) + '</span><span class="claim-citation-label">引用 ' + buildCitationLink(index + 1, claim.sourceId) + '</span></div>'
      + '<div class="claim-text">' + escHtml(claim.text) + '</div>'
      + '<div class="claim-meta"><span>证据级别：' + escHtml(claim.evidenceLevel) + '</span><span>数据时间：' + escHtml(claim.asOf) + '</span></div>'
      + '<div class="claim-conflict">未解决冲突：' + escHtml(claim.unresolvedConflict) + '</div></div>';
  }).join('');
  const wordCount = claims.reduce(function(total, claim) { return total + claim.text.replace(/\s+/g, '').length; }, 0);
  return '<div class="rag-report-content">'
    + '<div class="rag-report-title">📋 ' + escHtml(query) + ' 研究草稿 <span class="ai-tag">本地规则</span></div>'
    + '<div class="rag-report-text">' + reportText + '</div>'
    + '<div class="claim-list-title">逐 Claim 证据</div><div class="claim-list">' + claimHtml + '</div>'
    + '<div class="rag-report-sources"><b>引用来源：</b>' + claims.map(function(claim, index) { return buildCitationLink(index + 1, claim.sourceId) + ' ' + escHtml(claim.text); }).join('<br/>') + '</div>'
    + '<div class="diag-disclaimer">⚠️ 固定演示资料 + 本地规则，仅供研究流程演示，不构成投资建议。</div>'
    + buildQualityCard(wordCount, claims.length, results.length, claims)
    + buildFeedbackBar(run.runId)
    + '</div>';
}

function buildQualityCard(wordCount, citationCount, sourceCount, claims) {
  const wordOk = wordCount >= 150 && wordCount <= 250;
  const citationOk = sourceCount > 0 && citationCount >= sourceCount;
  const evidenceBuckets = claims ? new Set(claims.map(function(claim) { return claim.evidenceLevel; })).size : Math.min(citationCount, sourceCount);
  const evidenceOk = sourceCount > 0 && evidenceBuckets >= Math.min(3, sourceCount);
  return '<div class="report-quality-card">'
    + '<div class="quality-card-title">📊 质量检查 <span>只读 proxy，不是生产评估</span></div>'
    + '<div class="quality-metrics">'
    + '<div class="quality-metric"><span class="quality-icon">' + (citationOk ? '✅' : '⚠️') + '</span><span class="quality-label">有效引用编号覆盖</span><span class="quality-value ' + (citationOk ? 'quality-pass' : 'quality-warn') + '">' + citationCount + '/' + sourceCount + ' 个来源出现编号</span></div>'
    + '<div class="quality-metric"><span class="quality-icon">' + (evidenceOk ? '✅' : '⚠️') + '</span><span class="quality-label">证据桶完整度</span><span class="quality-value ' + (evidenceOk ? 'quality-pass' : 'quality-warn') + '">' + evidenceBuckets + '/' + Math.min(3, sourceCount) + ' 个证据级别</span></div>'
    + '<div class="quality-metric"><span class="quality-icon">' + (wordOk ? '✅' : '⚠️') + '</span><span class="quality-label">研报字数</span><span class="quality-value ' + (wordOk ? 'quality-pass' : 'quality-warn') + '">' + wordCount + '字（目标范围 150-250）</span></div>'
    + '<div class="quality-note">反馈后的修复对象与回归结果由人工记录，本页不预估修改次数。</div>'
    + '</div></div>';
}

// 反馈闭环：每个 run 只接受一次最终反馈，数据仅保留在当前页面内存。
function getFbData() {
  return {
    feedback: cloneData(FEEDBACK_LOG),
    adoptCount: FEEDBACK_LOG.filter(function(item) { return item.decision === 'adopt'; }).length,
    reviseCount: FEEDBACK_LOG.filter(function(item) { return item.decision !== 'adopt'; }).length,
  };
}

function submitFeedback(input) {
  const payload = input || {};
  if (!payload.runId) return { accepted: false, reason: '缺少 runId，无法归因反馈' };
  if (FEEDBACK_LOG.some(function(item) { return item.runId === payload.runId; })) {
    return { accepted: false, reason: '每个 run 只能提交一次最终反馈' };
  }
  const entry = {
    runId: payload.runId,
    decision: payload.decision || 'revise',
    issueType: payload.issueType || 'unspecified',
    repairTarget: payload.target || '人工复核',
    regressionResult: payload.regressionResult || '尚未执行自动回归，等待人工复核',
    note: payload.note || '',
  };
  FEEDBACK_LOG.push(entry);
  return { accepted: true, entry: cloneData(entry) };
}

function exportFeedback() {
  return JSON.stringify({ version: STOCK_APP_VERSION, feedback: FEEDBACK_LOG }, null, 2);
}

function feedbackBarForElement(element) {
  return element && element.closest ? element.closest('.feedback-bar') : null;
}

function updateFeedbackBar(bar, result) {
  if (!bar || !result || !result.accepted) return;
  bar.querySelectorAll('.fb-btn, .fb-reason-btn, .fb-bad-submit').forEach(function(button) { button.disabled = true; });
  const entry = result.entry;
  const stats = bar.querySelector('.fb-stats');
  if (stats) stats.textContent = '已记录 ' + entry.decision + ' · ' + entry.issueType + ' → ' + entry.repairTarget + ' → ' + entry.regressionResult;
  const note = bar.querySelector('.fb-regression-note');
  if (note) note.textContent = '回归记录：' + entry.issueType + ' → ' + entry.repairTarget + ' → ' + entry.regressionResult;
}

function buildFeedbackBar(runId) {
  const d = getFbData();
  return '<div class="feedback-bar" data-run-id="' + escAttr(runId) + '">'
    + '<span class="feedback-label">这份草稿对你有帮助吗？每个 run 只提交一次最终反馈。</span>'
    + '<button class="fb-btn fb-adopt" onclick="fbAdopt(this)">👍 采用</button>'
    + '<button class="fb-btn fb-revise" onclick="fbRevise(this)">👎 需修改</button>'
    + '<button class="fb-btn fb-bad" onclick="fbBad(this)">🚩 标记问题</button>'
    + '<div class="fb-reasons">'
    + '<span class="feedback-reason-label">问题类型：</span>'
    + '<button class="fb-reason-btn" onclick="fbSelectReason(this)">引用不准</button>'
    + '<button class="fb-reason-btn" onclick="fbSelectReason(this)">分析浅</button>'
    + '<button class="fb-reason-btn" onclick="fbSelectReason(this)">格式问题</button>'
    + '</div>'
    + '<div class="fb-bad-input-wrap">'
    + '<textarea class="fb-bad-textarea" placeholder="补充问题（可选）…"></textarea>'
    + '<button class="fb-bad-submit" onclick="fbSubmitBad(this)">提交问题</button>'
    + '</div>'
    + '<span class="fb-stats">已记录 ' + d.feedback.length + ' 条反馈 · 当前 run 未提交</span>'
    + '<span class="fb-regression-note">问题类型 → 修复对象 → 回归结果</span>'
    + '<button class="fb-export" onclick="exportFeedbackFile(this)">导出 JSON</button>'
    + '</div>';
}

function fbAdopt(btn) {
  const bar = feedbackBarForElement(btn);
  const result = submitFeedback({ runId: bar && bar.dataset.runId, decision: 'adopt', issueType: 'none', target: 'report', regressionResult: '无需修复回归' });
  updateFeedbackBar(bar, result);
  if (result.accepted) { btn.classList.add('fb-active-adopt'); btn.textContent = '👍 已采用'; }
}

function fbRevise(btn) {
  const bar = feedbackBarForElement(btn);
  const reasons = bar && bar.querySelector('.fb-reasons');
  if (reasons) reasons.classList.toggle('show');
}

function fbSelectReason(btn) {
  const bar = feedbackBarForElement(btn);
  const result = submitFeedback({ runId: bar && bar.dataset.runId, decision: 'revise', issueType: btn.textContent, target: '对应 Claim 与引用', regressionResult: '待人工回归' });
  updateFeedbackBar(bar, result);
  if (result.accepted) btn.classList.add('fb-reason-selected');
}

function fbBad(btn) {
  const bar = feedbackBarForElement(btn);
  const wrap = bar && bar.querySelector('.fb-bad-input-wrap');
  if (wrap) wrap.classList.toggle('show');
  btn.classList.toggle('fb-active-bad');
}

function fbSubmitBad(btn) {
  const bar = feedbackBarForElement(btn);
  const textarea = bar && bar.querySelector('.fb-bad-textarea');
  const result = submitFeedback({ runId: bar && bar.dataset.runId, decision: 'bad-case', issueType: '用户补充问题', target: '对应 Claim 与生成规则', regressionResult: '待人工回归', note: textarea ? textarea.value.trim() : '' });
  updateFeedbackBar(bar, result);
  if (result.accepted) btn.textContent = '已记录问题';
}

function exportFeedbackFile(button) {
  const blob = new Blob([exportFeedback()], { type: 'application/json' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'stock-feedback.json';
  link.click();
  URL.revokeObjectURL(link.href);
  if (button) button.textContent = '已导出 JSON';
}

// Tab 5: Agent 工具定义。工具选择是可复核的本地规则，不代表模型自主决策。
const AGENT_TOOLS = [
  {
    name: 'get_price',
    desc: '按任务需要获取近期行情证据',
    status: 'market',
    schema: { symbol: 'string (Yahoo格式)', range: '1d|5d|1mo', interval: '1d|1wk' },
    impl: async function(args) {
      const snapshot = await fetchMarketData(args.symbol, args.range || '5d', args.interval || '1d', { mode: args.mode || currentDataMode });
      return {
        data: snapshot.rows.slice(-5),
        snapshot: snapshot,
        sourceIds: [sourceIdForSnapshot(snapshot, args.symbol)],
      };
    }
  },
  {
    name: 'get_valuation',
    desc: '按任务需要读取固定基本面样本（PE/PB/ROE）',
    status: 'demo',
    schema: { symbol: 'string', name: 'string' },
    impl: async function(args) {
      const value = cloneData(FUNDAMENTAL_MOCK[args.symbol] || DEFAULT_MOCK);
      return { data: value, sourceIds: ['fundamental-demo-' + args.symbol], source: '演示数据' };
    }
  },
  {
    name: 'search_news',
    desc: '按任务需要召回带来源编号的固定资料',
    status: 'demo',
    schema: { query: 'string', topK: 'number (默认3)' },
    impl: async function(args) {
      const results = searchNews(args.query, args.topK || 3);
      return {
        news: results.map(function(n) { return { title: n.title, date: n.date, source: n.source, sourceId: n.sourceId }; }),
        sourceIds: results.map(function(n) { return n.sourceId; }),
        source: '演示资料',
      };
    }
  },
  {
    name: 'get_sentiment',
    desc: '按任务需要读取固定情绪样本',
    status: 'demo',
    schema: { symbol: 'string' },
    impl: async function(args) {
      return {
        data: cloneData(SENTIMENT_MOCK[args.symbol] || DEFAULT_SENTIMENT),
        sourceIds: ['sentiment-demo-' + args.symbol],
        source: '演示数据',
      };
    }
  }
];

function selectAgentTools(question) {
  const query = String(question || '');
  const selected = [];
  function add(name) {
    if (!selected.includes(name)) selected.push(name);
  }
  if (/行情|走势|涨跌|价格|收盘|最近|今日|现在|区间/.test(query)) add('get_price');
  if (/估值|基本面|市盈率|市净率|ROE|财务|盈利|价值|值得/.test(query)) add('get_valuation');
  if (/新闻|消息|公告|政策|行业|原因|风险|出货|销量|舆情/.test(query)) add('search_news');
  if (/情绪|舆情|热度|情感/.test(query)) add('get_sentiment');
  if (!selected.length) add('get_price');
  return selected;
}

function sleep(ms) { return new Promise(function(r) { setTimeout(r, ms); }); }

function addAgentStep(container, type, title, content) {
  const el = document.createElement('div');
  el.className = 'agent-step agent-step-' + type;
  el.innerHTML = '<div class="agent-step-header">' + escHtml(title) + '</div>'
    + '<div class="agent-step-body">' + escHtml(content) + '</div>';
  container.appendChild(el);
  container.scrollTop = container.scrollHeight;
  return el;
}

function updateAgentStep(el, content) {
  el.querySelector('.agent-step-body').innerHTML = escapeMultiline(content);
}

function addToolCall(stepEl, toolName, status, mode) {
  const callEl = document.createElement('div');
  callEl.className = 'tool-call tool-call-pending';
  const label = status === 'market'
    ? ((mode || currentDataMode) === DATA_MODE_MARKET ? '可请求联网' : '演示行情')
    : '演示数据';
  callEl.innerHTML = '<span class="tool-status">⏳</span> ' + escHtml(toolName) + '() <span class="tool-badge tool-badge-' + status + '">' + escHtml(label) + '</span>';
  stepEl.querySelector('.agent-step-body').appendChild(callEl);
  return callEl;
}

function markToolCall(el, result) {
  el.className = 'tool-call tool-call-' + result;
  el.querySelector('.tool-status').textContent = result === 'success' ? '✅' : '❌';
}

function renderAgentTools(selectedNames, mode) {
  const selected = selectedNames || [];
  const selectedMode = mode || currentDataMode;
  const target = document.getElementById('agentTools');
  if (!target) return;
  target.innerHTML = AGENT_TOOLS.map(function(t) {
    const isSelected = selected.includes(t.name);
    const badge = t.status === 'market'
      ? (selectedMode === DATA_MODE_MARKET ? '联网可选' : '演示行情')
      : '演示数据';
    return '<div class="agent-tool-card ' + (isSelected ? 'agent-tool-card-selected' : 'agent-tool-card-muted') + '">'
      + '<div class="agent-tool-name">' + escHtml(t.name) + '() <span class="tool-badge tool-badge-' + t.status + '">' + escHtml(badge) + '</span></div>'
      + '<div class="agent-tool-desc">' + escHtml(t.desc) + '</div>'
      + '<div class="agent-tool-selection">' + (isSelected ? '本次任务已选择' : '本次任务未选择') + '</div>'
      + '<div class="agent-tool-schema">' + Object.entries(t.schema).map(function(e) { return escHtml(e[0]) + ': <i>' + escHtml(e[1]) + '</i>'; }).join('<br/>') + '</div>'
      + '</div>';
  }).join('');
}

async function runAgent() {
  const question = document.getElementById('agentInput').value.trim();
  if (!question) {
    const inp = document.getElementById('agentInput');
    inp.classList.add('input-shake');
    inp.style.borderColor = 'var(--accent-red)';
    setTimeout(function() { inp.classList.remove('input-shake'); inp.style.borderColor = ''; }, 600);
    return;
  }
  const el = document.getElementById('agentProcess');
  el.innerHTML = '';
  const agentMode = currentDataMode;
  const selectedNames = selectAgentTools(question);
  renderAgentTools(selectedNames, agentMode);
  const thinkEl = addAgentStep(el, 'think', '🤔 THINK', '本地任务分解：先识别对象，再只取与「' + question + '」相关的证据。');
  const planEl = addAgentStep(el, 'plan', '📋 PLAN', '执行计划：\n1. 解析研究对象\n2. 调用：' + selectedNames.join('、') + '\n3. 汇总来源编号\n4. 保留待核查项并等待人工确认');
  let params;
  try {
    params = await parseIntent(question);
  } catch (error) {
    params = { symbol: null, name: question, unresolved: true };
  }
  if (params.unresolved) {
    const run = recordResearchRun({ scenario: 'agent-evidence', dataMode: agentMode, sourceIds: [], status: 'partial' });
    addAgentStep(el, 'observe', '👁 OBSERVE', '无法确认研究对象，已停止工具调用。');
    const partialEl = document.createElement('div');
    partialEl.className = 'agent-partial';
    partialEl.innerHTML = '<div class="agent-conclusion-title">⚠️ 部分完成 <span class="ai-tag">' + escHtml(run.runId) + '</span></div>'
      + '<div class="agent-conclusion-body">未识别到映射内股票代码，未猜测标的，也未生成研究结论。请补充股票名称或 6 位代码。</div>'
      + '<div class="agent-chain-note">状态：partial · 原因：研究对象未确认</div>';
    el.appendChild(partialEl);
    return;
  }

  const actEl = addAgentStep(el, 'act', '⚡ ACT', '执行工具调用...');
  const toolResults = {};
  const symbol = params.symbol;
  const found = Object.entries(SYMBOL_MAP).find(function(e) { return e[1] === symbol; });
  const stockName = found ? found[0] : (params.name || symbol);
  const selectedTools = AGENT_TOOLS.filter(function(tool) { return selectedNames.includes(tool.name); });
  const sourceIds = [];
  const failures = [];
  for (let i = 0; i < selectedTools.length; i++) {
    const tool = selectedTools[i];
    const callEl = addToolCall(actEl, tool.name, tool.status, agentMode);
    try {
      let args = {};
      if (tool.name === 'get_price') args = { symbol: symbol, range: '5d', mode: agentMode };
      else if (tool.name === 'get_valuation') args = { symbol: symbol, name: stockName };
      else if (tool.name === 'search_news') args = { query: stockName, topK: 3 };
      else if (tool.name === 'get_sentiment') args = { symbol: symbol };
      toolResults[tool.name] = await tool.impl(args);
      (toolResults[tool.name].sourceIds || []).forEach(function(sourceId) { if (!sourceIds.includes(sourceId)) sourceIds.push(sourceId); });
      markToolCall(callEl, 'success');
    } catch (e) {
      toolResults[tool.name] = { error: e.message };
      failures.push(tool.name + '：' + e.message);
      markToolCall(callEl, 'error');
    }
    await sleep(160);
  }
  const runStatus = failures.length ? 'partial' : 'success';
  const run = recordResearchRun({ scenario: 'agent-evidence', dataMode: agentMode, sourceIds: sourceIds, status: runStatus });
  const obsEl = addAgentStep(el, 'observe', '👁 OBSERVE', failures.length
    ? '证据链不完整，已保留成功结果并停止总结。'
    : '证据已按来源编号汇总，未生成买卖判断。');
  if (failures.length) {
    const partialEl = document.createElement('div');
    partialEl.className = 'agent-partial';
    partialEl.innerHTML = '<div class="agent-conclusion-title">⚠️ 部分完成 <span class="ai-tag">' + escHtml(run.runId) + '</span></div>'
      + '<div class="agent-conclusion-body">已完成：' + escHtml(Object.keys(toolResults).filter(function(name) { return !toolResults[name].error; }).join('、') || '无') + '。失败：' + escHtml(failures.join('；')) + '。</div>'
      + '<div class="agent-chain-note">状态：partial · 请修复数据源或补充证据后人工回归。</div>';
    el.appendChild(partialEl);
    return;
  }
  const finalEl = document.createElement('div');
  finalEl.className = 'agent-conclusion agent-evidence-summary';
  finalEl.innerHTML = '<div class="agent-conclusion-title">📊 Agent 证据汇总 <span class="ai-tag">本地规则</span></div>'
    + '<div class="agent-conclusion-body">已围绕「' + escHtml(stockName) + '」完成 ' + selectedTools.length + ' 个任务相关工具调用，来源编号：' + escHtml(sourceIds.join('、') || '无') + '。结果仅用于研究流程展示，不输出交易方向。</div>'
    + '<div class="agent-chain-note">推理链路：THINK → PLAN → ACT(' + selectedTools.length + '个工具) → OBSERVE → 人工确认 · ' + escHtml(run.runId) + '</div>';
  el.appendChild(finalEl);
}

function buildDiagCard(name, symbol, snapshot, pctChange, fundamental, sentiment, diag, run) {
  const trendRows = snapshot.rows.slice(-5).map(function(row) {
    const change = row.changePct === null ? '-' : (row.changePct >= 0 ? '+' : '') + row.changePct + '%';
    return '<tr><td>' + escHtml(row.date) + '</td><td>' + escHtml(formatRowValue(row.close)) + '</td><td class="' + (row.changePct < 0 ? 'value-negative' : 'value-positive') + '">' + escHtml(change) + '</td></tr>';
  }).join('');
  const sentimentBar = Math.round((sentiment.score / 5) * 100);
  const pending = (diag.pendingChecks || []).map(function(item) { return '<li>' + escHtml(item) + '</li>'; }).join('');
  return '<div class="diag-card">'
    + '<div class="diag-header">'
    + '<div><div class="diag-name">' + escHtml(name) + '</div><div class="diag-symbol">' + escHtml(symbol) + '</div></div>'
    + '<div class="diag-rating-block"><div class="evidence-score">证据完整度 ' + escHtml(diag.evidenceCompleteness) + '</div><div class="diag-confidence-note">仅为来源覆盖计数，不是预测置信度</div></div>'
    + '</div>'
    + '<div class="diag-provenance"><span class="source-badge">' + escHtml(sourceLabel(snapshot)) + '</span><span>市场时间：' + escHtml(snapshot.marketAsOf) + '</span><span>抓取时间：' + escHtml(snapshot.fetchedAt) + '</span>' + (run ? '<span>运行：' + escHtml(run.runId) + '</span>' : '') + '</div>'
    + '<div class="diag-panels">'
    + '<div class="diag-panel"><div class="diag-panel-title">📊 行情证据 <span class="' + (snapshot.source === 'Yahoo Finance' ? 'real-tag' : 'mock-tag') + '">' + escHtml(sourceLabel(snapshot)) + '</span></div>'
    + '<table class="diag-mini-table"><tr><th>日期</th><th>收盘</th><th>涨跌</th></tr>' + trendRows + '</table>'
    + (pctChange ? '<div class="diag-pct ' + (parseFloat(pctChange) >= 0 ? 'value-positive' : 'value-negative') + '">5日区间 ' + (pctChange >= 0 ? '+' : '') + escHtml(pctChange) + '%</div>' : '')
    + '</div>'
    + '<div class="diag-panel"><div class="diag-panel-title">🏢 基本面 <span class="mock-tag">演示数据</span></div>'
    + '<div class="diag-kv-list">'
    + '<div class="diag-kv"><span>市盈率</span><b>' + escHtml(String(fundamental.pe)) + '</b></div>'
    + '<div class="diag-kv"><span>市净率</span><b>' + escHtml(String(fundamental.pb)) + '</b></div>'
    + '<div class="diag-kv"><span>市值</span><b>' + escHtml(String(fundamental.marketCap)) + '</b></div>'
    + '<div class="diag-kv"><span>ROE</span><b>' + escHtml(String(fundamental.roe)) + '</b></div>'
    + '<div class="diag-kv"><span>毛利率</span><b>' + escHtml(String(fundamental.grossMargin)) + '</b></div>'
    + '</div></div>'
    + '<div class="diag-panel"><div class="diag-panel-title">📰 情绪证据 <span class="mock-tag">演示数据</span></div>'
    + '<div class="sentiment-score">' + sentiment.score.toFixed(1) + ' / 5</div>'
    + '<div class="sentiment-bar-wrap"><div class="sentiment-bar" style="width:' + sentimentBar + '%"></div></div>'
    + '<div class="sentiment-label">' + escHtml(sentiment.label) + '</div>'
    + '<div class="sentiment-news">' + sentiment.news.map(function(n) { return '<div class="sentiment-news-item">· ' + escHtml(n) + '</div>'; }).join('') + '</div>'
    + '</div>'
    + '</div>'
    + '<div class="diag-summary"><div class="diag-summary-label">🧭 研究边界</div>'
    + '<div class="diag-summary-text">' + escHtml(diag.summary || '') + '</div>'
    + '<div class="pending-title">待核查项</div><ul class="pending-list">' + pending + '</ul>'
    + '<div class="diag-disclaimer">⚠️ 本页不构成投资建议，也不替代人工研究或适当性评估。</div>'
    + '</div>'
    + '<div class="model-choice-note">本页使用本地规则与固定演示数据。任何生产接入都需要独立的数据口径、模型评估、审计和人工确认。</div>'
    + '</div>';
}

// Tab 4: 市场雷达 Mock 数据
const RADAR_DATA = {
  asOf: DEMO_SNAPSHOT_TIME,
  generatedAt: DEMO_SNAPSHOT_TIME,
  hotSectors: [
    { name: '人工智能', change: 4.2, heat: 95 },
    { name: '新能源车', change: 2.8, heat: 82 },
    { name: '白酒', change: 1.9, heat: 71 },
    { name: '半导体', change: -0.8, heat: 65 },
    { name: '医药生物', change: -1.2, heat: 58 },
    { name: '银行', change: 0.5, heat: 44 },
  ],
  movers: [
    { name: '寒武纪', symbol: '688256.SS', change: 8.3, volume: '高', reason: 'AI芯片订单增加' },
    { name: '东方财富', symbol: '300059.SZ', change: 5.1, volume: '高', reason: '市场活跃度提升' },
    { name: '药明康德', symbol: '603259.SS', change: -4.2, volume: '中', reason: '海外政策压力' },
  ],
  sentimentTrend: [
    { date: '08-24', score: 2.1 }, { date: '08-25', score: 2.8 },
    { date: '08-26', score: 3.5 }, { date: '08-27', score: 3.2 },
    { date: '08-28', score: 3.8 },
  ]
};

function getRadarSnapshot() {
  return cloneData(RADAR_DATA);
}

function refreshRadarData() {
  const icon = document.getElementById('radarRefreshIcon');
  if (icon) { icon.classList.add('spinning'); setTimeout(function() { icon.classList.remove('spinning'); }, 600); }
  const tsEl = document.getElementById('radarTimestamp');
  if (tsEl) tsEl.textContent = '2026-08-28 15:00（演示快照）';
  recordResearchRun({ scenario: 'radar-refresh', dataMode: DATA_MODE_DEMO, sourceIds: ['demo-radar-v1'] });
  initRadar();
}

function initRadar() {
  const heatmap = document.getElementById('sectorHeatmap');
  if (!heatmap) return;
  const radar = getRadarSnapshot();
  heatmap.innerHTML = radar.hotSectors.map(function(s) {
    return '<div class="sector-block ' + (s.change >= 0 ? 'sector-positive' : 'sector-negative') + '">'
      + '<div class="sector-name">' + escHtml(s.name) + '</div>'
      + '<div class="sector-change ' + (s.change >= 0 ? 'value-positive' : 'value-negative') + '">'
      + (s.change >= 0 ? '+' : '') + s.change + '%</div></div>';
  }).join('');
  const moversList = document.getElementById('moversList');
  if (moversList) {
    moversList.innerHTML = radar.movers.map(function(m) {
      return '<div class="mover-item">'
        + '<div class="mover-name">' + escHtml(m.name) + '</div>'
        + '<div class="mover-change ' + (m.change >= 0 ? 'value-positive' : 'value-negative') + '">'
        + (m.change >= 0 ? '+' : '') + m.change + '%</div>'
        + '<div class="mover-reason">' + escHtml(m.reason) + '</div>'
        + '</div>';
    }).join('');
  }
  const trendEl = document.getElementById('sentimentTrend');
  if (trendEl) {
    trendEl.innerHTML = '<div class="trend-chart">' + radar.sentimentTrend.map(function(p) {
      const h = Math.round(((p.score - 0) / (5 - 0)) * 60);
      return '<div class="trend-bar-wrap">'
        + '<div class="trend-bar ' + (p.score >= 3 ? 'trend-positive' : 'trend-neutral') + '" style="height:' + h + 'px"></div>'
        + '<div class="trend-label">' + escHtml(p.date) + '</div>'
        + '</div>';
    }).join('') + '</div>';
  }
}

async function generateBrief() {
  const el = document.getElementById('radarBrief');
  el.innerHTML = '<div class="rag-searching">⌁ 规则摘要整理中…</div>';
  const radar = getRadarSnapshot();
  const sectorSummary = radar.hotSectors.slice(0,3).map(function(s) {
    return s.name + '(' + (s.change > 0 ? '+' : '') + s.change + '%)';
  }).join('、');
  const avgSentiment = (radar.sentimentTrend.reduce(function(s, p) { return s + p.score; }, 0) / radar.sentimentTrend.length).toFixed(1);
  const brief = '本地规则摘要：' + sectorSummary + ' 位于演示快照前列，近5日情绪均值 ' + avgSentiment + '/5。异动原因仅是样本字段，需回到原始来源核查。';
  const run = recordResearchRun({ scenario: 'radar-brief', dataMode: DATA_MODE_DEMO, sourceIds: ['demo-radar-v1'] });
  el.innerHTML = '<div class="radar-brief-text">' + escapeMultiline(brief) + '</div>'
    + '<div class="diag-disclaimer">演示快照 · 本地规则摘要 · 运行 ' + escHtml(run.runId) + '</div>';
}

// 私有知识库（内存存储）
let PRIVATE_KB = [];

function switchKbTab(tab) {
  document.querySelectorAll('.kb-tab-btn').forEach(function(b) { b.classList.remove('active'); });
  document.querySelectorAll('.kb-tab-panel').forEach(function(p) { p.classList.remove('active'); });
  if (tab === 'market') {
    document.getElementById('kbTabMarket').classList.add('active');
    document.getElementById('kbPanelMarket').classList.add('active');
  } else {
    document.getElementById('kbTabPrivate').classList.add('active');
    document.getElementById('kbPanelPrivate').classList.add('active');
  }
}

function addToPrivateKb() {
  const text = document.getElementById('privateKbInput').value.trim();
  if (!text) return;
  const segments = text.split(/\n{2,}/).filter(function(s) { return s.trim().length > 10; });
  segments.forEach(function(seg) {
    privateSequence += 1;
    PRIVATE_KB.push({
      id: 'private-doc-' + String(privateSequence).padStart(3, '0'),
      sourceId: 'private-doc-' + String(privateSequence).padStart(3, '0'),
      content: seg.trim(),
      title: seg.trim().slice(0, 30) + (seg.length > 30 ? '...' : ''),
      date: '本页内存',
      asOf: '本页内存',
      source: '私有知识库',
      tier: 'private',
      evidenceLevel: '用户资料',
    });
  });
  document.getElementById('privateKbInput').value = '';
  renderPrivateKbList();
  switchKbTab('private');
}

function renderPrivateKbList() {
  const el = document.getElementById('privateKbList');
  if (!PRIVATE_KB.length) {
    el.innerHTML = '<div class="rag-placeholder">暂无私有文档</div>';
    return;
  }
  el.innerHTML = PRIVATE_KB.map(function(doc) {
    return '<div class="private-doc-item">'
      + '<div class="private-doc-content">'
      + '<div class="private-doc-title">📄 ' + escHtml(doc.title) + '</div>'
      + '<div class="private-doc-meta">' + escHtml(doc.date) + ' · ' + doc.content.length + '字</div>'
      + '</div>'
      + '<button class="private-doc-del" onclick="deletePrivateDoc(\'' + doc.id + '\')" title="删除">✕</button>'
      + '</div>';
  }).join('');
}

function deletePrivateDoc(id) {
  PRIVATE_KB = PRIVATE_KB.filter(function(doc) { return doc.id !== id; });
  renderPrivateKbList();
}

function searchPrivateKb(query, topK) {
  topK = topK || 2;
  if (!PRIVATE_KB.length) return [];
  const { terms } = expandQuery(query);
  return PRIVATE_KB.map(function(doc) {
    let score = 0;
    terms.forEach(function(kw) {
      if (doc.content.indexOf(kw) >= 0) score += 0.3;
      if (doc.title.indexOf(kw) >= 0) score += 0.4;
    });
    return Object.assign({}, doc, {
      score: score > 0 ? Math.min(0.95, score) : 0,
      relevance: 0.9,
      rerankScore: 0,
      rerankReason: '关键词命中 + 用户资料，规则可复核',
      origRank: 0,
      evidenceLevel: '用户资料',
      asOf: '本页内存',
      unresolvedConflict: '用户资料未经外部核验',
    });
  }).filter(function(d) { return d.score > 0; })
  .sort(function(a, b) { return b.score - a.score; })
  .slice(0, topK);
}

function focusSource(sourceId) {
  const source = document.getElementById('src-' + sourceId);
  if (!source) return;
  document.querySelectorAll('.rag-source-item.source-focused').forEach(function(item) { item.classList.remove('source-focused'); });
  source.classList.add('source-focused');
  source.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function initStockApp() {
  setDataMode(DATA_MODE_DEMO);
  initRadar();
  renderAgentTools([]);
  renderPrivateKbList();
  renderResearchSession();
}

if (typeof document !== 'undefined' && typeof document.addEventListener === 'function') {
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initStockApp);
  else initStockApp();
}

if (typeof globalThis !== 'undefined') {
  globalThis.StockResearch = {
    version: STOCK_APP_VERSION,
    fetchMarketData: fetchMarketData,
    fetchYahoo: fetchYahoo,
    parseIntent: parseIntent,
    buildQualityCard: buildQualityCard,
    getDemoMarketSnapshot: getDemoMarketSnapshot,
    getRadarSnapshot: getRadarSnapshot,
    recordResearchRun: recordResearchRun,
    getResearchSession: getResearchSession,
    submitFeedback: submitFeedback,
    exportFeedback: exportFeedback,
    selectAgentTools: selectAgentTools,
    setDataMode: setDataMode,
    getCurrentDataMode: getCurrentDataMode,
  };
}
