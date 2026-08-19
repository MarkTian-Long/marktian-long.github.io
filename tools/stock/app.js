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

  box.value = ''; box.style.height = 'auto';
  isLoading = true;
  document.getElementById('sendBtn').disabled = true;
  appendUserMsg(text);

  const loadingDiv = appendLoadingMsg('Step 1 · 解析意图');

  try {
    // Step 1: LLM 解析意图
    const params = await parseIntent(text);
    updateMsg(loadingDiv, `<span class="step-tag step1">Step 1 完成</span><br/>股票：<b>${escHtml(params.symbol)}</b>，周期：${escHtml(params.range)}，间隔：${escHtml(params.interval)}`);

    // Step 2: 拉取数据
    const dataLoading = appendLoadingMsg('Step 2 · 获取行情数据');
    const rawData = await fetchYahoo(params.symbol, params.range, params.interval);
    updateMsg(dataLoading, `<span class="step-tag step1">Step 2 完成</span><br/>获取到 ${rawData.length} 条数据`);

    // Step 3: AI 解读
    const aiLoading = appendLoadingMsg('Step 3 · AI 解读');
    const answer = await interpretData(text, params, rawData);
    updateMsg(aiLoading, buildAnswer(answer, rawData, params));

  } catch (err) {
    updateMsg(loadingDiv, `<span style="color:var(--accent-red)">⚠️ ${escHtml(String(err.message || err))}</span>`);
  } finally {
    isLoading = false;
    document.getElementById('sendBtn').disabled = false;
  }
}

// =============================================
//  LLM Step 1: 意图解析
// =============================================
async function parseIntent(userQuery) {
  const symbolList = Object.entries(SYMBOL_MAP).map(([k,v])=>`${k}=${v}`).join(',');
  const systemPrompt = `解析A股/港股查询意图，只返回JSON，无其他文字。
字段：symbol(Yahoo格式股票代码),range(数据范围:1d/5d/1mo/3mo/6mo/1y),interval(粒度:1d/1wk/1mo)
代码映射：${symbolList}
若用户提到的股票不在映射表，自行推断Yahoo Finance格式（沪市.SS，深市.SZ）
"今日/最近交易日/最近一个交易日"→range=1d,interval=1d；"近5日/一周"→range=5d,interval=1d；"近3日"→range=5d,interval=1d；"近一月"→range=1mo,interval=1d
示例：{"symbol":"600519.SS","range":"5d","interval":"1d"}`;

  const resp = await callLLM(systemPrompt, userQuery);
  try {
    const cleaned = resp.replace(/```json?\s*/gi,'').replace(/```/g,'').trim();
    return JSON.parse(cleaned);
  } catch {
    throw new Error('意图解析失败：' + resp.slice(0, 150));
  }
}

// =============================================
//  Yahoo Finance 数据获取（通过 allorigins 代理解决 CORS）
// =============================================
async function fetchYahoo(symbol, range, interval) {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=${range}&interval=${interval}&includePrePost=false`;

  // 依次尝试多个公共 CORS 代理，任一成功即返回
  const proxies = [
    u => `https://corsproxy.io/?${encodeURIComponent(u)}`,
    u => `https://api.allorigins.win/get?url=${encodeURIComponent(u)}`,
    u => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(u)}`,
  ];

  let json = null;
  let lastErr = '';
  for (const makeProxy of proxies) {
    try {
      const resp = await fetch(makeProxy(url), { signal: AbortSignal.timeout(8000) });
      if (!resp.ok) { lastErr = 'HTTP ' + resp.status; continue; }
      const text = await resp.text();
      // allorigins 返回 {contents: "..."}, 其他直接返回 JSON
      try {
        const outer = JSON.parse(text);
        json = outer.contents ? JSON.parse(outer.contents) : outer;
      } catch { lastErr = '响应解析失败'; continue; }
      if (json?.chart) break; // 成功
      json = null;
    } catch (e) { lastErr = e.message; }
  }
  if (!json) throw new Error('数据请求失败：' + lastErr);

  const result = json?.chart?.result?.[0];
  if (!result) {
    const err = json?.chart?.error?.description || '未找到该股票数据';
    throw new Error(err);
  }

  const timestamps = result.timestamp || [];
  const quote = result.indicators?.quote?.[0] || {};
  const { open, high, low, close, volume } = quote;

  if (!timestamps.length) return [];

  // 先去重（同一天保留最后一条），再计算涨跌幅
  const deduped = timestamps.map((ts, i) => ({
    日期: new Date(ts * 1000).toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' }),
    开盘: open?.[i]?.toFixed(2) ?? '-',
    最高: high?.[i]?.toFixed(2) ?? '-',
    最低: low?.[i]?.toFixed(2) ?? '-',
    收盘: close?.[i]?.toFixed(2) ?? '-',
    成交量: volume?.[i] ? (volume[i] / 10000).toFixed(0) + '万' : '-',
    _close: close?.[i] ?? null
  })).filter(r => r.收盘 !== '-')
  .reduce((acc, row) => {
    const last = acc[acc.length - 1];
    if (last && last.日期 === row.日期) acc[acc.length - 1] = row;
    else acc.push(row);
    return acc;
  }, []);

  // 去重后再算涨跌幅（基于相邻两天收盘价）
  return deduped.map((row, i) => {
    const prev = deduped[i - 1];
    const pct = (i > 0 && row._close && prev?._close)
      ? ((row._close - prev._close) / prev._close * 100).toFixed(2) + '%'
      : '-';
    const { _close, ...rest } = row;
    return { ...rest, 涨跌幅: pct };
  });
}

// =============================================
//  LLM Step 2: 数据解读
// =============================================
async function interpretData(userQuery, params, data) {
  if (!data || data.length === 0) {
    return '未查询到相关数据，可能是非交易日或股票代码有误。';
  }
  const systemPrompt = `你是资深A股分析师，用简洁中文回答（100-200字）。根据数据分析趋势、涨跌幅、成交量变化，给出洞察结论，不要复述数字表格。`;
  const userContent = `用户问题：${userQuery}\n股票代码：${params.symbol}\n数据：${JSON.stringify(data.slice(0, 20))}`;
  return await callLLM(systemPrompt, userContent);
}

// =============================================
//  构建输出
// =============================================
function buildAnswer(answer, rawData, params) {
  const safeAnswer = escapeMultiline(answer);
  let html = `<span class="step-tag step2">AI 分析</span><br/>${safeAnswer}`;

  if (rawData && rawData.length > 0) {
    const collapseId = 'dc_' + Date.now();
    const headers = Object.keys(rawData[0]);
    const rows = rawData.slice(0, 50);
    html += `
      <div class="data-collapse" id="${collapseId}" style="margin-top:10px;">
        <div class="data-collapse-header" onclick="toggleCollapse('${collapseId}')">
          <span>📋 原始数据（${rawData.length} 条）</span>
          <span class="data-collapse-arrow">▼</span>
        </div>
        <div class="data-table-wrap">
          <table class="data-table">
            <thead><tr>${headers.map(h=>`<th>${escHtml(h)}</th>`).join('')}</tr></thead>
            <tbody>${rows.map(row=>`<tr>${headers.map(h=>`<td>${escHtml(String(row[h]??''))}</td>`).join('')}</tr>`).join('')}</tbody>
          </table>
        </div>
      </div>`;
  }
  if (params) html += buildPromptCard(params);
  return html;
}

function toggleCollapse(id) {
  const el = document.getElementById(id);
  el.classList.toggle('open');
  const body = el.querySelector('.prompt-card-body');
  const arrow = el.querySelector('.prompt-card-arrow');
  if (body) {
    body.style.display = body.style.display === 'none' ? 'flex' : 'none';
    if (arrow) arrow.style.transform = body.style.display === 'none' ? '' : 'rotate(180deg)';
  }
}

function buildPromptCard(params) {
  const id = 'pc_' + Date.now();
  return '<div class="prompt-card" id="' + id + '">' +
    '<div class="prompt-card-header" onclick="toggleCollapse(\'' + id + '\')">' +
      '<span>🔧 Prompt 设计说明</span>' +
      '<span class="prompt-card-arrow">▼</span>' +
    '</div>' +
    '<div class="prompt-card-body" style="display:none;">' +
      '<div class="prompt-section">' +
        '<div class="prompt-label">Step 1 · 意图识别 Prompt 策略</div>' +
        '<div class="prompt-content">使用 Few-shot 示例约束输出为 JSON，明确字段类型（symbol/range/interval），避免 LLM 自由发挥导致格式漂移。</div>' +
      '</div>' +
      '<div class="prompt-section">' +
        '<div class="prompt-label">真实接入参考</div>' +
        '<div class="prompt-content">若未来接入服务端模型，可选择轻量快速模型处理意图解析，并优先评估响应速度、成本和安全边界。</div>' +
      '</div>' +
      '<div class="prompt-section">' +
        '<div class="prompt-label">解析结果</div>' +
        '<div class="prompt-content">symbol: <b>' + escHtml(params.symbol) + '</b> · range: <b>' + escHtml(params.range) + '</b> · interval: <b>' + escHtml(params.interval) + '</b></div>' +
      '</div>' +
      '<div class="prompt-section">' +
        '<div class="prompt-label">Step 3 · 解读 Prompt 策略</div>' +
        '<div class="prompt-content">角色设定（资深分析师）+ 字数约束（100-200字）+ 负面约束（不复述数字表格），引导 LLM 产出洞察而非摘要。</div>' +
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
  let symbol = matchedName ? SYMBOL_MAP[matchedName] : '600519.SS';
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
  return { symbol: symbol, range: range, interval: interval };
}

function mockModelResponse(systemPrompt, userContent) {
  if (systemPrompt.includes('解析A股/港股查询意图')) {
    return JSON.stringify(inferMockIntent(userContent));
  }
  if (systemPrompt.includes('诊断结果')) {
    return JSON.stringify({
      rating: '持有', confidence: 60,
      summary: '静态演示使用模拟基本面与情绪数据，不代表真实投资判断。',
      risks: ['数据为演示样本'], catalysts: ['需结合真实市场信息验证']
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
      think: '静态演示将结合行情、估值、新闻与情绪四类模拟信息。',
      plan: '1. 解析股票代码\n2. 获取近期行情\n3. 读取模拟估值与新闻\n4. 汇总风险提示'
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
  const content = document.getElementById('diagContent');
  content.innerHTML = '<div class="diag-loading">⏳ 正在生成诊断报告...</div>';
  try {
    const params = await parseIntent(name + '近5日行情');
    const symbol = params.symbol;
    const priceData = await fetchYahoo(symbol, '5d', '1d');
    const latest = priceData[priceData.length - 1];
    const first = priceData[0];
    const pctChange = (latest && latest._close && first && first._close)
      ? ((latest._close - first._close) / first._close * 100).toFixed(2)
      : null;
    const fundamental = FUNDAMENTAL_MOCK[symbol] || DEFAULT_MOCK;
    const sentiment = SENTIMENT_MOCK[symbol] || DEFAULT_SENTIMENT;
    const diagResult = await getDiagnosisFromLLM(name, symbol, priceData, fundamental, sentiment);
    content.innerHTML = buildDiagCard(name, symbol, priceData, pctChange, fundamental, sentiment, diagResult);
  } catch(err) {
    content.innerHTML = '<div class="diag-error">⚠️ ' + escHtml(String(err.message)) + '</div>';
  }
}

async function getDiagnosisFromLLM(name, symbol, priceData, fundamental, sentiment) {
  const systemPrompt = '你是A股分析助手。基于提供的数据，输出严格JSON格式的诊断结果，无其他文字。JSON格式：{"rating":"买入|持有|观望|回避","confidence":0到100的整数,"summary":"50字以内的核心判断","risks":["风险1","风险2"],"catalysts":["催化剂1"]}';
  const userContent = '股票：' + name + '(' + symbol + ')\n近5日走势：' + JSON.stringify(priceData.slice(-5)) + '\n基本面(模拟)：PE=' + fundamental.pe + ', PB=' + fundamental.pb + ', ROE=' + fundamental.roe + '\n新闻情绪(模拟)：' + sentiment.score + '/5, ' + sentiment.label;
  const resp = await callLLM(systemPrompt, userContent);
  try {
    return JSON.parse(resp.replace(/```json?\s*/gi,'').replace(/```/g,'').trim());
  } catch {
    return { rating: '持有', confidence: 60, summary: resp.slice(0, 50), risks: [], catalysts: [] };
  }
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
    return Object.assign({}, news, { score: Math.min(news.relevance, score > 0 ? news.relevance * (0.7 + score) : 0.1) });
  });
  return scored.sort(function(a, b) { return b.score - a.score; }).slice(0, topK).filter(function(n) { return n.score > 0.1; });
}

async function rerankResults(query, candidates) {
  const systemPrompt = '你是金融信息相关性评估专家。对候选新闻与查询的相关性打分，输出严格JSON数组，无其他文字。格式：[{"id":数字,"score":0到1的小数,"reason":"10字以内的判断理由"}]';
  const userContent = '查询：' + query + '\n\n候选新闻：\n' + candidates.map(function(n) {
    return '[' + n.id + '] ' + n.title + '（' + n.date + '，' + n.stock + '）';
  }).join('\n');
  try {
    const resp = await callLLM(systemPrompt, userContent);
    const parsed = JSON.parse(resp.replace(/```json?\s*/gi,'').replace(/```/g,'').trim());
    return candidates.map(function(n) {
      const ranked = parsed.find(function(r) { return r.id === n.id; });
      return Object.assign({}, n, {
        rerankScore: ranked ? ranked.score : n.score,
        rerankReason: ranked ? ranked.reason : '',
        origRank: candidates.indexOf(n) + 1
      });
    }).sort(function(a, b) { return b.rerankScore - a.rerankScore; });
  } catch(e) {
    return candidates.map(function(n) { return Object.assign({}, n, { rerankScore: n.score, rerankReason: '', origRank: candidates.indexOf(n) + 1 }); });
  }
}

async function runRAG() {
  const query = document.getElementById('ragInput').value.trim();
  if (!query) { shakeInput(document.getElementById('ragInput')); return; }
  const sourcesEl = document.getElementById('ragSources');
  const reportEl = document.getElementById('ragReport');
  // 查询扩展
  const expansion = expandQuery(query);
  const expandHtml = expansion.expanded.length > 0
    ? '<div class="rag-expansion">🔤 查询扩展：<b>' + escHtml(query) + '</b> → ' + expansion.terms.map(function(t) { return '<span class="expand-tag">' + escHtml(t) + '</span>'; }).join(' ') + '</div>'
    : '';
  sourcesEl.innerHTML = expandHtml + '<div class="rag-searching">🔍 正在检索中...</div>';
  reportEl.innerHTML = '<div class="rag-searching">⏳ 等待检索完成...</div>';
  await new Promise(function(r) { setTimeout(r, 800); });
  // 双层知识库联合召回
  const marketResults = searchNews(query, 5);
  const privateResults = searchPrivateKb(query, 2);
  const candidates = marketResults.concat(privateResults).slice(0, 6);
  if (candidates.length === 0) {
    sourcesEl.innerHTML = '<div class="rag-placeholder">未找到相关新闻</div>';
    reportEl.innerHTML = '<div class="rag-error">知识库中无相关内容</div>';
    return;
  }
  const tierConfig = {
    official:   { label: '官方权威', color: 'var(--accent-green)', bg: 'rgba(0,229,160,0.10)' },
    mainstream: { label: '主流媒体', color: 'var(--accent)',       bg: 'rgba(79,143,255,0.10)' },
    unverified: { label: '待核实',   color: 'orange',              bg: 'rgba(255,165,0,0.10)' }
  };
  // 展示粗检结果（临时）
  sourcesEl.innerHTML = expandHtml + candidates.map(function(n, i) {
    const tc = tierConfig[n.tier] || tierConfig.unverified;
    return '<div class="rag-source-item" id="src-' + n.id + '">'
      + '<div class="rag-source-header"><span class="rag-source-idx">[' + (i+1) + ']</span>'
      + '<span class="rag-source-title">' + escHtml(n.title) + '</span></div>'
      + '<div class="rag-source-meta-row">'
      + '<span class="tier-badge" style="color:' + tc.color + ';background:' + tc.bg + '">' + tc.label + '</span>'
      + '<span class="rag-source-meta">' + escHtml(n.source) + ' · ' + escHtml(n.date) + '</span>'
      + '</div>'
      + '<div class="rag-source-snippet">' + escHtml(n.content.slice(0, 80)) + '...</div>'
      + '<div class="rag-relevance-bar-wrap">'
      + '<div class="rag-relevance-bar" style="width:' + Math.round(n.score*100) + '%"></div>'
      + '<span class="rag-relevance-val">相关度 ' + n.score.toFixed(2) + '</span>'
      + '</div></div>';
  }).join('');
  // Rerank 阶段：LLM 精排
  sourcesEl.innerHTML = expandHtml + '<div class="rag-searching">🧠 演示精排中（Reranking）...</div>';
  reportEl.innerHTML = '<div class="rag-searching">⏳ 等待精排完成...</div>';
  const reranked = await rerankResults(query, candidates);
  const results = reranked.slice(0, 3);
  // 渲染精排后结果（含排序变化）
  sourcesEl.innerHTML = expandHtml
    + '<div class="rerank-header">🧠 Reranking 完成 · 粗检6→精排3</div>'
    + results.map(function(n, i) {
      const tc = tierConfig[n.tier] || tierConfig.unverified;
      const rankChange = n.origRank - (i + 1);
      const rankTag = rankChange > 0
        ? '<span class="rank-up">↑' + rankChange + '</span>'
        : rankChange < 0 ? '<span class="rank-down">↓' + Math.abs(rankChange) + '</span>'
        : '<span class="rank-same">→</span>';
      return '<div class="rag-source-item" id="src-' + n.id + '">'
        + '<div class="rag-source-header">'
        + '<span class="rag-source-idx">[' + (i+1) + ']</span>'
        + rankTag
        + '<span class="rag-source-title">' + escHtml(n.title) + '</span></div>'
        + '<div class="rag-source-meta-row">'
        + '<span class="tier-badge" style="color:' + tc.color + ';background:' + tc.bg + '">' + tc.label + '</span>'
        + '<span class="rag-source-meta">' + escHtml(n.source) + ' · ' + escHtml(n.date) + '</span>'
        + '</div>'
        + (n.rerankReason ? '<div class="rerank-reason">💡 ' + escHtml(n.rerankReason) + '</div>' : '')
        + '<div class="rag-source-snippet">' + escHtml(n.content.slice(0, 80)) + '...</div>'
        + '<div class="rag-relevance-bar-wrap">'
        + '<div class="rag-relevance-bar" style="width:' + Math.round(n.rerankScore*100) + '%"></div>'
        + '<span class="rag-relevance-val">精排得分 ' + n.rerankScore.toFixed(2) + '</span>'
        + '</div></div>';
    }).join('');
  // Generate 阶段
  reportEl.innerHTML = '<div class="rag-searching">🤖 AI 正在撰写研报...</div>';
  const context = results.map(function(n, i) { return '[' + (i+1) + '] ' + n.title + '：' + n.content; }).join('\n');
  const systemPrompt = '你是专业A股研究员。基于提供的新闻资料撰写简短研究报告（150-250字），要求：结构清晰（概况/亮点/风险），引用来源用[数字]标注，末尾附"数据来源"列表。';
  const userContent = '研究对象：' + query + '\n\n参考资料：\n' + context;
  try {
    const report = await callLLM(systemPrompt, userContent);
    const wordCount = report.replace(/<[^>]+>/g, '').replace(/\s+/g, '').length;
    const citationCount = new Set((report.match(/\[(\d+)\]/g) || []).map(function(m){ return m; })).size;
    const qualityCard = buildQualityCard(wordCount, citationCount, results.length);
    const feedbackBar = buildFeedbackBar(query);
    reportEl.innerHTML = '<div class="rag-report-content">'
      + '<div class="rag-report-title">📋 ' + escHtml(query) + ' 研究报告 <span class="ai-tag">🎭 静态演示</span></div>'
      + '<div class="rag-report-text">' + escapeMultiline(report) + '</div>'
      + '<div class="rag-report-sources"><b>检索来源：</b>' + results.map(function(n,i){ const tc = tierConfig[n.tier] || tierConfig.unverified; return '[' + (i+1) + '] ' + escHtml(n.title) + ' <span class="tier-badge" style="color:' + tc.color + ';background:' + tc.bg + '">' + tc.label + '</span> · ' + escHtml(n.source) + ' · ' + escHtml(n.date); }).join('<br/>') + '</div>'
      + '<div class="diag-disclaimer">⚠️ 本报告基于模拟新闻数据生成，仅供演示，不构成投资建议</div>'
      + qualityCard
      + feedbackBar
      + '</div>';
  } catch(err) {
    reportEl.innerHTML = '<div class="rag-error">⚠️ ' + escHtml(err.message) + '</div>';
  }
}

function buildQualityCard(wordCount, citationCount, sourceCount) {
  const wordOk = wordCount >= 150 && wordCount <= 250;
  const citationOk = citationCount >= sourceCount;
  const roundEstimate = citationCount >= 3 ? '≤3次（引用充分）' : citationCount >= 1 ? '≤3次（参考值）' : '可能需要补充引用';
  const roundClass = citationCount >= 1 ? 'quality-pass' : 'quality-warn';
  return '<div class="report-quality-card">'
    + '<div class="quality-card-title">📊 质量评估 <span style="font-weight:400;color:var(--text-muted);font-size:10px;">基于业务指标体系</span></div>'
    + '<div class="quality-metrics">'
    + '<div class="quality-metric"><span class="quality-icon">' + (citationOk ? '✅' : '⚠️') + '</span><span class="quality-label">引用覆盖</span><span class="quality-value ' + (citationOk ? 'quality-pass' : 'quality-warn') + '">' + citationCount + '/' + sourceCount + ' 文档有溯源 → ' + (citationOk ? '引用准确率达标' : '建议补充引用') + '</span></div>'
    + '<div class="quality-metric"><span class="quality-icon">' + (wordOk ? '✅' : '⚠️') + '</span><span class="quality-label">研报字数</span><span class="quality-value ' + (wordOk ? 'quality-pass' : 'quality-warn') + '">' + wordCount + '字（目标范围 150-250）</span></div>'
    + '<div class="quality-metric"><span class="quality-icon">🔄</span><span class="quality-label">预计修改轮次</span><span class="quality-value ' + roundClass + '">' + roundEstimate + '</span></div>'
    + '</div></div>';
}

// 反馈闭环：localStorage 记录采用/修改/Bad Case
const FB_STORAGE_KEY = 'qiuzhi_stock_feedback_v1';
function getFbData() {
  try { return JSON.parse(localStorage.getItem(FB_STORAGE_KEY) || '{"adoptCount":0,"reviseCount":0,"badCases":[]}'); } catch { return { adoptCount: 0, reviseCount: 0, badCases: [] }; }
}
function saveFbData(d) { localStorage.setItem(FB_STORAGE_KEY, JSON.stringify(d)); }

function buildFeedbackBar(query) {
  const d = getFbData();
  const statsText = '已采用 ' + d.adoptCount + ' 次 · Bad Case ' + d.badCases.length + ' 条';
  return '<div class="feedback-bar" id="feedbackBar">'
    + '<span class="feedback-label">这份研报对你有帮助吗？</span>'
    + '<button class="fb-btn fb-adopt" onclick="fbAdopt(this)">👍 采用</button>'
    + '<button class="fb-btn fb-revise" onclick="fbRevise(this)">👎 需修改</button>'
    + '<button class="fb-btn fb-bad" onclick="fbBad(this)">🚩 标记 Bad Case</button>'
    + '<div class="fb-reasons" id="fbReasons">'
    + '<span style="font-size:11px;color:var(--text-muted);">原因：</span>'
    + '<button class="fb-reason-btn" onclick="fbSelectReason(this,\'' + escHtml(query) + '\')">引用不准</button>'
    + '<button class="fb-reason-btn" onclick="fbSelectReason(this,\'' + escHtml(query) + '\')">分析浅</button>'
    + '<button class="fb-reason-btn" onclick="fbSelectReason(this,\'' + escHtml(query) + '\')">格式问题</button>'
    + '</div>'
    + '<div class="fb-bad-input-wrap" id="fbBadInputWrap">'
    + '<textarea class="fb-bad-textarea" id="fbBadTextarea" placeholder="描述问题（可选）..."></textarea>'
    + '<button class="fb-bad-submit" onclick="fbSubmitBad(\'' + escHtml(query) + '\')">提交 Bad Case</button>'
    + '</div>'
    + '<span class="fb-stats" id="fbStats">' + statsText + '</span>'
    + '</div>';
}

function fbAdopt(btn) {
  const d = getFbData();
  d.adoptCount++;
  saveFbData(d);
  btn.classList.add('fb-active-adopt');
  btn.textContent = '👍 已采用';
  btn.disabled = true;
  document.getElementById('fbStats').textContent = '已采用 ' + d.adoptCount + ' 次 · Bad Case ' + d.badCases.length + ' 条';
}

function fbRevise(btn) {
  const reasons = document.getElementById('fbReasons');
  reasons.classList.toggle('show');
}

function fbSelectReason(btn, query) {
  const d = getFbData();
  d.reviseCount = (d.reviseCount || 0) + 1;
  d.badCases = d.badCases || [];
  d.badCases.push({ query: query, reason: btn.textContent, ts: Date.now(), type: 'revise' });
  saveFbData(d);
  btn.style.borderColor = 'orange';
  btn.style.color = 'orange';
  document.getElementById('fbStats').textContent = '已采用 ' + d.adoptCount + ' 次 · Bad Case ' + d.badCases.length + ' 条';
}

function fbBad(btn) {
  const wrap = document.getElementById('fbBadInputWrap');
  wrap.classList.toggle('show');
  btn.classList.toggle('fb-active-bad');
}

function fbSubmitBad(query) {
  const note = document.getElementById('fbBadTextarea').value.trim();
  const d = getFbData();
  d.badCases = d.badCases || [];
  d.badCases.push({ query: query, note: note, ts: Date.now(), type: 'bad_case' });
  saveFbData(d);
  document.getElementById('fbBadInputWrap').classList.remove('show');
  document.getElementById('fbBadTextarea').value = '';
  document.getElementById('fbStats').textContent = '已采用 ' + d.adoptCount + ' 次 · Bad Case ' + d.badCases.length + ' 条';
  const btn = document.querySelector('.fb-btn.fb-bad');
  if (btn) { btn.classList.remove('fb-active-bad'); btn.textContent = '🚩 已记录'; btn.disabled = true; }
}

// Tab 5: Agent 工具定义
const AGENT_TOOLS = [
  {
    name: 'get_price',
    desc: '获取股票近期行情数据',
    status: 'real',
    schema: { symbol: 'string (Yahoo格式)', range: '1d|5d|1mo', interval: '1d|1wk' },
    impl: async function(args) {
      const data = await fetchYahoo(args.symbol, args.range || '5d', '1d');
      return { data: data.slice(-5), source: 'Yahoo Finance', delay: '15分钟' };
    }
  },
  {
    name: 'get_valuation',
    desc: '获取股票估值指标（PE/PB/ROE）',
    status: 'mock',
    schema: { symbol: 'string', name: 'string' },
    impl: async function(args) {
      const sym = args.symbol || (Object.entries(SYMBOL_MAP).find(function(e) { return args.name && args.name.indexOf(e[0]) >= 0; }) || [])[1];
      return Object.assign({}, (FUNDAMENTAL_MOCK[sym] || DEFAULT_MOCK), { source: '模拟数据 [MOCK]' });
    }
  },
  {
    name: 'search_news',
    desc: '检索相关新闻和市场情绪',
    status: 'mock',
    schema: { query: 'string', topK: 'number (默认3)' },
    impl: async function(args) {
      const results = searchNews(args.query, args.topK || 3);
      return { news: results.map(function(n) { return { title: n.title, date: n.date, sentiment: n.score > 0.7 ? '正面' : '中性' }; }), source: '模拟数据 [MOCK]' };
    }
  },
  {
    name: 'get_sentiment',
    desc: '获取股票综合情绪评分',
    status: 'mock',
    schema: { symbol: 'string' },
    impl: async function(args) { return Object.assign({}, (SENTIMENT_MOCK[args.symbol] || DEFAULT_SENTIMENT), { source: '模拟数据 [MOCK]' }); }
  }
];

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

function addToolCall(stepEl, toolName, status) {
  const callEl = document.createElement('div');
  callEl.className = 'tool-call tool-call-pending';
  callEl.innerHTML = '<span class="tool-status">⏳</span> ' + escHtml(toolName) + '() <span class="tool-badge tool-badge-' + status + '">' + (status === 'real' ? '📊 真实' : '🎭 模拟') + '</span>';
  stepEl.querySelector('.agent-step-body').appendChild(callEl);
  return callEl;
}

function markToolCall(el, result) {
  el.className = 'tool-call tool-call-' + result;
  el.querySelector('.tool-status').textContent = result === 'success' ? '✅' : '❌';
}

function renderAgentTools() {
  document.getElementById('agentTools').innerHTML = AGENT_TOOLS.map(function(t) {
    return '<div class="agent-tool-card">'
      + '<div class="agent-tool-name">' + escHtml(t.name) + '() <span class="tool-badge tool-badge-' + t.status + '">' + (t.status === 'real' ? '真实' : '模拟') + '</span></div>'
      + '<div class="agent-tool-desc">' + escHtml(t.desc) + '</div>'
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
  renderAgentTools();
  const thinkEl = addAgentStep(el, 'think', '🤔 THINK', '🎭 演示推理中...');
  const planEl = addAgentStep(el, 'plan', '📋 PLAN', '⏳ 等待 THINK 完成...');
  // LLM 实时生成 THINK + PLAN
  try {
    const tpSystemPrompt = '你是ReAct Agent的推理模块。根据用户问题，以JSON格式输出think和plan两段。\nthink：分析这个具体问题需要哪些信息，简洁2-3句话，要提到具体的股票/行业名称。\nplan：列出4-5步执行计划，提及具体要调用的工具（get_price/get_valuation/search_news/get_sentiment）和用途。\n格式：{"think":"...","plan":"1. ...\n2. ...\n3. ..."}';
    const tpResp = await callLLM(tpSystemPrompt, '用户问题：' + question);
    let tpData;
    try {
      tpData = JSON.parse(tpResp.replace(/```json?\s*/gi,'').replace(/```/g,'').trim());
    } catch { tpData = { think: '分析问题：「' + question + '」\n需要获取价格走势、估值指标、市场情绪', plan: '1. 解析股票代码\n2. 调用 get_price → 近期行情\n3. 调用 get_valuation → 估值数据\n4. 调用 search_news → 市场情绪\n5. 综合分析输出判断' }; }
    updateAgentStep(thinkEl, tpData.think || '');
    updateAgentStep(planEl, tpData.plan || '');
  } catch(e) {
    updateAgentStep(thinkEl, '分析问题：「' + question + '」\n需要获取：价格走势数据、估值指标、市场情绪、相关新闻');
    updateAgentStep(planEl, '执行计划：\n1. 解析股票代码\n2. 调用 get_price → 近期行情\n3. 调用 get_valuation → 估值数据\n4. 调用 search_news → 市场情绪\n5. 综合分析，输出判断');
  }
  const actEl = addAgentStep(el, 'act', '⚡ ACT', '执行工具调用...');
  const toolResults = {};
  let symbol, stockName;
  try {
    const params = await parseIntent(question);
    symbol = params.symbol;
    const found = Object.entries(SYMBOL_MAP).find(function(e) { return e[1] === symbol; });
    stockName = found ? found[0] : symbol;
  } catch(e) {
    symbol = '600519.SS'; stockName = '茅台';
  }
  for (let i = 0; i < AGENT_TOOLS.length; i++) {
    const tool = AGENT_TOOLS[i];
    const callEl = addToolCall(actEl, tool.name, tool.status);
    try {
      let args = {};
      if (tool.name === 'get_price') args = { symbol: symbol, range: '5d' };
      else if (tool.name === 'get_valuation') args = { symbol: symbol, name: stockName };
      else if (tool.name === 'search_news') args = { query: stockName, topK: 3 };
      else if (tool.name === 'get_sentiment') args = { symbol: symbol };
      toolResults[tool.name] = await tool.impl(args);
      markToolCall(callEl, 'success');
    } catch(e) {
      toolResults[tool.name] = { error: e.message };
      markToolCall(callEl, 'error');
    }
    await sleep(300);
  }
  const obsEl = addAgentStep(el, 'observe', '👁 OBSERVE', '整合结果，进行推理...');
  await sleep(400);
  const systemPrompt = '你是专业A股分析师。基于以下多源数据，给出结构化投资判断（150字以内）：评级（买入/持有/观望/回避）+ 核心理由（2-3点）+ 主要风险（1-2点）。末尾注明"本分析仅供参考，不构成投资建议"。';
  const priceData = (toolResults['get_price'] && toolResults['get_price'].data) ? toolResults['get_price'].data.slice(-3) : [];
  const userContent = '问题：' + question + '\n股票：' + stockName + '(' + symbol + ')\n行情数据：' + JSON.stringify(priceData) + '\n估值：' + JSON.stringify(toolResults['get_valuation'] || {}) + '\n新闻情绪：' + JSON.stringify((toolResults['search_news'] && toolResults['search_news'].news) || []);
  try {
    const conclusion = await callLLM(systemPrompt, userContent);
    updateAgentStep(obsEl, '数据整合完成，生成最终判断');
    const finalEl = document.createElement('div');
    finalEl.className = 'agent-conclusion';
    finalEl.innerHTML = '<div class="agent-conclusion-title">📊 Agent 最终结论 <span class="ai-tag">🎭 静态演示</span></div>'
      + '<div class="agent-conclusion-body">' + escapeMultiline(conclusion) + '</div>'
      + '<div class="agent-chain-note">推理链路：THINK → PLAN → ACT(' + Object.keys(toolResults).length + '个工具) → OBSERVE → 结论</div>';
    el.appendChild(finalEl);
  } catch(err) {
    updateAgentStep(obsEl, '⚠️ ' + err.message);
  }
}

function buildDiagCard(name, symbol, priceData, pctChange, fundamental, sentiment, diag) {
  const ratingColor = { '买入': 'var(--accent-green)', '持有': 'var(--accent)', '观望': 'var(--accent-purple)', '回避': 'var(--accent-red)' };
  const confColor = diag.confidence >= 70 ? 'var(--accent-green)' : diag.confidence >= 40 ? 'orange' : 'var(--accent-red)';
  const trendRows = priceData.slice(-5).map(function(r) {
    const isNeg = r['涨跌幅'] && r['涨跌幅'].toString().startsWith('-');
    return '<tr><td>' + escHtml(r['日期'] || '') + '</td><td>' + escHtml(r['收盘'] || '') + '</td><td style="color:' + (isNeg ? 'var(--accent-red)' : 'var(--accent-green)') + '">' + escHtml(r['涨跌幅'] || '') + '</td></tr>';
  }).join('');
  const sentimentBar = Math.round((sentiment.score / 5) * 100);
  const risks = (diag.risks || []).map(function(r) { return escHtml(r); }).join('、');
  const catalysts = (diag.catalysts || []).map(function(c) { return escHtml(c); }).join('、');
  return '<div class="diag-card">'
    + '<div class="diag-header">'
    + '<div><div class="diag-name">' + escHtml(name) + '</div><div class="diag-symbol">' + escHtml(symbol) + '</div></div>'
    + '<div class="diag-rating-block"><div class="diag-rating" style="color:' + (ratingColor[diag.rating] || 'var(--accent)') + '">' + escHtml(diag.rating) + '</div>'
    + '<div class="diag-confidence">置信度 <span style="color:' + confColor + '">' + diag.confidence + '%</span></div></div>'
    + '</div>'
    + '<div class="diag-panels">'
    + '<div class="diag-panel"><div class="diag-panel-title">📊 技术面 <span class="real-tag">真实数据</span></div>'
    + '<table class="diag-mini-table"><tr><th>日期</th><th>收盘</th><th>涨跌</th></tr>' + trendRows + '</table>'
    + (pctChange ? '<div class="diag-pct" style="color:' + (parseFloat(pctChange) >= 0 ? 'var(--accent-green)' : 'var(--accent-red)') + '">5日累计 ' + (pctChange >= 0 ? '+' : '') + pctChange + '%</div>' : '')
    + '</div>'
    + '<div class="diag-panel"><div class="diag-panel-title">🏢 基本面 <span class="mock-tag">🎭 模拟数据</span></div>'
    + '<div class="diag-kv-list">'
    + '<div class="diag-kv"><span>市盈率</span><b>' + escHtml(String(fundamental.pe)) + '</b></div>'
    + '<div class="diag-kv"><span>市净率</span><b>' + escHtml(String(fundamental.pb)) + '</b></div>'
    + '<div class="diag-kv"><span>市值</span><b>' + escHtml(String(fundamental.marketCap)) + '</b></div>'
    + '<div class="diag-kv"><span>ROE</span><b>' + escHtml(String(fundamental.roe)) + '</b></div>'
    + '<div class="diag-kv"><span>毛利率</span><b>' + escHtml(String(fundamental.grossMargin)) + '</b></div>'
    + '</div></div>'
    + '<div class="diag-panel"><div class="diag-panel-title">📰 情绪面 <span class="mock-tag">🎭 模拟数据</span></div>'
    + '<div class="sentiment-score">' + sentiment.score.toFixed(1) + ' / 5</div>'
    + '<div class="sentiment-bar-wrap"><div class="sentiment-bar" style="width:' + sentimentBar + '%"></div></div>'
    + '<div class="sentiment-label">' + escHtml(sentiment.label) + '</div>'
    + '<div class="sentiment-news">' + sentiment.news.map(function(n) { return '<div class="sentiment-news-item">· ' + escHtml(n) + '</div>'; }).join('') + '</div>'
    + '</div>'
    + '</div>'
    + '<div class="diag-summary"><div class="diag-summary-label">🎭 静态演示解读</div>'
    + '<div class="diag-summary-text">' + escHtml(diag.summary || '') + '</div>'
    + (risks ? '<div class="diag-risks"><b>风险：</b>' + risks + '</div>' : '')
    + (catalysts ? '<div class="diag-catalysts"><b>催化剂：</b>' + catalysts + '</div>' : '')
    + '<div class="diag-disclaimer">⚠️ 仅供参考，不构成投资建议</div>'
    + '</div>'
    + '<div class="model-choice-note">🔧 <b>真实接入说明：</b>若未来接入模型，应使用 JSON Schema 约束结构化输出，而非自由对话。金融诊断报告需要字段确定性（评级/置信度/风险点），便于前端渲染和后续校验。</div>'
    + '</div>';
}

// Tab 4: 市场雷达 Mock 数据
const RADAR_DATA = {
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
    { date: '11-05', score: 2.1 }, { date: '11-06', score: 2.8 },
    { date: '11-07', score: 3.5 }, { date: '11-08', score: 3.2 },
    { date: '11-10', score: 3.8 },
  ]
};

function refreshRadarData() {
  const icon = document.getElementById('radarRefreshIcon');
  if (icon) { icon.classList.add('spinning'); setTimeout(function() { icon.classList.remove('spinning'); }, 600); }
  // 随机微调数值，模拟更新感
  RADAR_DATA.hotSectors = RADAR_DATA.hotSectors.map(function(s) {
    return Object.assign({}, s, { change: parseFloat((s.change + (Math.random() - 0.5) * 0.4).toFixed(1)), heat: Math.min(99, Math.max(20, s.heat + Math.round((Math.random() - 0.5) * 6))) });
  });
  RADAR_DATA.sentimentTrend[RADAR_DATA.sentimentTrend.length - 1].score = parseFloat(Math.max(0.5, Math.min(5, RADAR_DATA.sentimentTrend[RADAR_DATA.sentimentTrend.length-1].score + (Math.random() - 0.5) * 0.6)).toFixed(1));
  const now = new Date();
  const ts = now.getFullYear() + '-' + String(now.getMonth()+1).padStart(2,'0') + '-' + String(now.getDate()).padStart(2,'0') + ' ' + String(now.getHours()).padStart(2,'0') + ':' + String(now.getMinutes()).padStart(2,'0') + '（模拟）';
  const tsEl = document.getElementById('radarTimestamp');
  if (tsEl) tsEl.textContent = ts;
  initRadar();
}

function initRadar() {
  const heatmap = document.getElementById('sectorHeatmap');
  if (!heatmap) return;
  heatmap.innerHTML = RADAR_DATA.hotSectors.map(function(s) {
    const alpha = 0.15 + s.heat / 200;
    const color = s.change >= 0 ? 'rgba(5,150,105,' + alpha + ')' : 'rgba(239,68,68,' + alpha + ')';
    return '<div class="sector-block" style="background:' + color + '">'
      + '<div class="sector-name">' + escHtml(s.name) + '</div>'
      + '<div class="sector-change" style="color:' + (s.change >= 0 ? 'var(--accent-green)' : 'var(--accent-red)') + '">'
      + (s.change >= 0 ? '+' : '') + s.change + '%</div></div>';
  }).join('');
  const moversList = document.getElementById('moversList');
  if (moversList) {
    moversList.innerHTML = RADAR_DATA.movers.map(function(m) {
      return '<div class="mover-item">'
        + '<div class="mover-name">' + escHtml(m.name) + '</div>'
        + '<div class="mover-change" style="color:' + (m.change >= 0 ? 'var(--accent-green)' : 'var(--accent-red)') + '">'
        + (m.change >= 0 ? '+' : '') + m.change + '%</div>'
        + '<div class="mover-reason">' + escHtml(m.reason) + '</div>'
        + '</div>';
    }).join('');
  }
  const trendEl = document.getElementById('sentimentTrend');
  if (trendEl) {
    trendEl.innerHTML = '<div class="trend-chart">' + RADAR_DATA.sentimentTrend.map(function(p) {
      const h = Math.round(((p.score - 0) / (5 - 0)) * 60);
      return '<div class="trend-bar-wrap">'
        + '<div class="trend-bar" style="height:' + h + 'px; background:' + (p.score >= 3 ? 'var(--accent-green)' : 'orange') + '"></div>'
        + '<div class="trend-label">' + escHtml(p.date) + '</div>'
        + '</div>';
    }).join('') + '</div>';
  }
}

async function generateBrief() {
  const el = document.getElementById('radarBrief');
  el.innerHTML = '<div class="rag-searching">🤖 生成中...</div>';
  const sectorSummary = RADAR_DATA.hotSectors.slice(0,3).map(function(s) {
    return s.name + '(' + (s.change > 0 ? '+' : '') + s.change + '%)';
  }).join('、');
  const avgSentiment = (RADAR_DATA.sentimentTrend.reduce(function(s, p) { return s + p.score; }, 0) / RADAR_DATA.sentimentTrend.length).toFixed(1);
  const prompt = '你是A股市场分析师。基于以下信息生成今日市场简报（100字以内，简洁客观）：\n热点板块：' + sectorSummary + '\n今日异动：' + RADAR_DATA.movers.map(function(m) { return m.name + m.change + '%'; }).join('、') + '\n市场情绪：近5日均值' + avgSentiment + '/5';
  try {
    const brief = await callLLM(prompt, '请生成简报');
    el.innerHTML = '<div class="radar-brief-text">' + escapeMultiline(brief) + '</div>'
      + '<div class="diag-disclaimer">⚠️ 基于模拟数据生成，仅供演示</div>';
  } catch(e) {
    el.innerHTML = '<div class="rag-error">' + escHtml(e.message) + '</div>';
  }
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
    PRIVATE_KB.push({
      id: 'priv_' + Date.now() + '_' + Math.random().toString(36).slice(2),
      content: seg.trim(),
      title: seg.trim().slice(0, 30) + (seg.length > 30 ? '...' : ''),
      date: new Date().toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' }),
      source: '私有知识库',
      tier: 'private',
      addedAt: Date.now()
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
    return Object.assign({}, doc, { score: score > 0 ? Math.min(0.95, score) : 0, relevance: 0.9, rerankScore: 0, rerankReason: '', origRank: 0 });
  }).filter(function(d) { return d.score > 0; })
  .sort(function(a, b) { return b.score - a.score; })
  .slice(0, topK);
}
