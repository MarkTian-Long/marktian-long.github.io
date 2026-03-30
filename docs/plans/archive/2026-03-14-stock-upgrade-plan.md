# A股 AI 研究助手升级 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 将 tools/stock/index.html 从单一聊天界面升级为 6-Tab AI 能力展示台，每个 Tab 体现不同的 AI 产品设计能力（Prompt 工程、结构化输出、RAG、多源数据整合、Agent、合规设计）。

**Architecture:** 单文件重构，保留现有 CSS 变量体系和 Yahoo Finance + OpenRouter 集成。新增 Tab 导航系统，各 Tab 的 HTML/CSS/JS 全部内联在同一 index.html 中，无外部依赖。Mock 数据硬编码为 JS 常量，带 [MOCK] 标注。

**Tech Stack:** Vanilla JS + CSS3，Yahoo Finance（CORS 代理），OpenRouter API，零依赖，无构建步骤。

---

## Task 1：Tab 框架 + 全局合规栏

**Files:**
- Modify: `tools/stock/index.html`（全局结构重构）

**Step 1: 替换 header，加入 Tab 导航**

将现有 `.header` 和 `.quick-bar` 替换为：

```html
<div class="header">
  <div class="header-icon">📊</div>
  <div class="header-title">A股 AI 研究助手</div>
  <div class="header-badge">AI 产品能力展示台</div>
</div>

<nav class="tab-nav">
  <button class="tab-btn active" onclick="switchTab('chat')" data-tab="chat">
    <span class="tab-icon">💬</span>行情助手
    <span class="tab-tech">Prompt Engineering</span>
  </button>
  <button class="tab-btn" onclick="switchTab('diagnosis')" data-tab="diagnosis">
    <span class="tab-icon">🔬</span>个股诊断
    <span class="tab-tech">Structured Output</span>
  </button>
  <button class="tab-btn" onclick="switchTab('report')" data-tab="report">
    <span class="tab-icon">📄</span>研报生成
    <span class="tab-tech">RAG</span>
  </button>
  <button class="tab-btn" onclick="switchTab('radar')" data-tab="radar">
    <span class="tab-icon">📡</span>市场雷达
    <span class="tab-tech">Multi-Source</span>
  </button>
  <button class="tab-btn" onclick="switchTab('agent')" data-tab="agent">
    <span class="tab-icon">🤖</span>Agent 实验室
    <span class="tab-tech">AI Agent</span>
  </button>
  <button class="tab-btn" onclick="switchTab('compliance')" data-tab="compliance">
    <span class="tab-icon">🛡️</span>合规设计
    <span class="tab-tech">Governance</span>
  </button>
</nav>
```

**Step 2: 加入全局免责栏（body 底部固定）**

```html
<div class="disclaimer-bar">
  ⚠️ 本工具为 AI 产品能力演示，所有内容仅供参考，不构成投资建议。
  <span class="disclaimer-tags">
    <span class="tag-real">📊 真实数据</span>
    <span class="tag-mock">🎭 模拟数据</span>
    <span class="tag-ai">🤖 AI 生成</span>
  </span>
</div>
```

**Step 3: 加入 Tab 切换 CSS**

```css
.tab-nav {
  display: flex; gap: 4px; padding: 8px 16px;
  border-bottom: 1px solid var(--border);
  background: var(--bg-sec); overflow-x: auto;
  flex-shrink: 0;
}
.tab-btn {
  display: flex; flex-direction: column; align-items: center;
  padding: 6px 14px; border: 1px solid var(--border);
  border-radius: var(--radius-sm); background: var(--card);
  color: var(--text-sec); font-size: 12px; cursor: pointer;
  transition: var(--transition); white-space: nowrap; gap: 2px;
}
.tab-btn.active {
  background: rgba(79,143,255,0.12);
  border-color: var(--accent); color: var(--accent);
}
.tab-tech {
  font-size: 10px; color: var(--text-muted);
  font-style: italic;
}
.tab-btn.active .tab-tech { color: var(--accent); opacity: 0.7; }
.tab-icon { font-size: 14px; }

.tab-panel { display: none; flex: 1; flex-direction: column; overflow: hidden; }
.tab-panel.active { display: flex; }

.disclaimer-bar {
  padding: 6px 16px; background: rgba(239,68,68,0.06);
  border-top: 1px solid rgba(239,68,68,0.15);
  font-size: 11px; color: var(--text-muted);
  display: flex; align-items: center; gap: 12px; flex-shrink: 0;
}
.tag-real { color: var(--accent-cyan); }
.tag-mock { color: var(--accent-purple); }
.tag-ai { color: var(--accent-green); }
.header-badge {
  margin-left: auto; font-size: 10px;
  padding: 3px 8px; border: 1px solid var(--border);
  border-radius: 10px; color: var(--text-muted);
}
```

**Step 4: 加入 Tab 切换 JS**

```js
function switchTab(name) {
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('tab-' + name).classList.add('active');
  document.querySelector(`[data-tab="${name}"]`).classList.add('active');
}
```

**Step 5: 验证**
浏览器打开 tools/stock/index.html，确认 6 个 Tab 可切换，底部固定免责栏显示正常。

**Step 6: Commit**
```bash
git add tools/stock/index.html
git commit -m "feat: A股助手添加 Tab 框架和全局合规栏"
```

---

## Task 2：Tab 1 行情助手（增强 Prompt 卡）

**Files:**
- Modify: `tools/stock/index.html`（Tab 1 内容区 + JS 增强）

**Step 1: 将原有聊天区移入 Tab 1 面板**

原有 `.quick-bar`、`.messages`、`.input-area` 包裹进：
```html
<div class="tab-panel active" id="tab-chat">
  <!-- quick-bar -->
  <!-- messages -->
  <!-- input-area -->
</div>
```

**Step 2: 在 `buildAnswer()` 函数中增加 Prompt 设计卡**

在 AI 回复气泡后追加可折叠的 Prompt 卡：

```js
function buildPromptCard(params) {
  const id = 'pc_' + Date.now();
  return `
  <div class="prompt-card" id="${id}">
    <div class="prompt-card-header" onclick="toggleCollapse('${id}')">
      <span>🔧 Prompt 设计说明</span>
      <span class="prompt-card-arrow">▼</span>
    </div>
    <div class="prompt-card-body" style="display:none;">
      <div class="prompt-section">
        <div class="prompt-label">Step 1 · 意图识别 Prompt 策略</div>
        <div class="prompt-content">使用 Few-shot 示例约束输出为 JSON，明确字段类型（symbol/range/interval），避免 LLM 自由发挥导致格式漂移。</div>
      </div>
      <div class="prompt-section">
        <div class="prompt-label">模型选型</div>
        <div class="prompt-content">stepfun/step-3.5-flash — 轻量快速，意图解析任务不需要推理深度，优先响应速度和成本控制。</div>
      </div>
      <div class="prompt-section">
        <div class="prompt-label">解析结果</div>
        <div class="prompt-content">symbol: <b>${escHtml(params.symbol)}</b> · range: <b>${escHtml(params.range)}</b> · interval: <b>${escHtml(params.interval)}</b></div>
      </div>
      <div class="prompt-section">
        <div class="prompt-label">Step 3 · 解读 Prompt 策略</div>
        <div class="prompt-content">角色设定（资深分析师）+ 字数约束（100-200字）+ 负面约束（不复述数字表格），引导 LLM 产出洞察而非摘要。</div>
      </div>
    </div>
  </div>`;
}
```

CSS：
```css
.prompt-card {
  margin-top: 8px; border: 1px solid rgba(79,143,255,0.2);
  border-radius: var(--radius-sm); font-size: 11px; overflow: hidden;
}
.prompt-card-header {
  padding: 6px 10px; background: rgba(79,143,255,0.06);
  display: flex; justify-content: space-between;
  cursor: pointer; color: var(--accent); user-select: none;
}
.prompt-card-body { padding: 8px 10px; display: flex; flex-direction: column; gap: 6px; }
.prompt-section { }
.prompt-label { font-weight: 600; color: var(--text-sec); margin-bottom: 2px; }
.prompt-content { color: var(--text-muted); line-height: 1.5; }
.prompt-card-arrow { transition: var(--transition); }
```

**Step 3: 修改 `handleSend()` 把 params 传给 `buildAnswer()`**

```js
const answer = await interpretData(text, params, rawData);
updateMsg(aiLoading, buildAnswer(answer, rawData, params)); // 新增 params 参数
```

`buildAnswer(answer, rawData, params)` 末尾追加：
```js
html += buildPromptCard(params);
```

**Step 4: 验证**
发送一条查询，确认回复底部出现「Prompt 设计说明」折叠卡，展开后显示三个 section。

**Step 5: Commit**
```bash
git add tools/stock/index.html
git commit -m "feat: Tab1 行情助手增加 Prompt 设计卡"
```

---

## Task 3：Tab 2 个股诊断（结构化输出 + 模型选型）

**Files:**
- Modify: `tools/stock/index.html`

**Step 1: 添加 Tab 2 HTML 结构**

```html
<div class="tab-panel" id="tab-diagnosis">
  <div class="diagnosis-input-bar">
    <input class="diag-input" id="diagInput" placeholder="输入股票名称，如：茅台、宁德时代、比亚迪" />
    <button class="send-btn" onclick="runDiagnosis()">生成诊断报告</button>
  </div>
  <div class="diagnosis-content" id="diagContent">
    <div class="welcome">
      <div class="welcome-icon">🔬</div>
      <div class="welcome-title">个股诊断报告</div>
      <div>输入股票名称，AI 将生成结构化多维度诊断卡</div>
      <div class="model-tip">🔧 此模块使用结构化输出模式（JSON Schema 约束），而非自由对话</div>
    </div>
  </div>
</div>
```

**Step 2: Mock 基本面数据**

```js
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
```

**Step 3: 诊断逻辑（真实行情 + mock 基本面 + LLM 结构化输出）**

```js
async function runDiagnosis() {
  const name = document.getElementById('diagInput').value.trim();
  if (!name) return;
  const content = document.getElementById('diagContent');
  content.innerHTML = '<div class="diag-loading">⏳ 正在生成诊断报告...</div>';

  try {
    // Step 1: 解析股票代码（复用 parseIntent）
    const params = await parseIntent(name + '近5日行情');
    const symbol = params.symbol;

    // Step 2: 获取真实行情
    const priceData = await fetchYahoo(symbol, '5d', '1d');
    const latest = priceData[priceData.length - 1];
    const first = priceData[0];
    const pctChange = (latest?._close && first?._close)
      ? ((latest._close - first._close) / first._close * 100).toFixed(2)
      : null;

    // Step 3: 获取 mock 数据
    const fundamental = FUNDAMENTAL_MOCK[symbol] || DEFAULT_MOCK;
    const sentiment = SENTIMENT_MOCK[symbol] || DEFAULT_SENTIMENT;

    // Step 4: LLM 结构化输出（JSON Schema）
    const diagResult = await getDiagnosisFromLLM(name, symbol, priceData, fundamental, sentiment);

    // Step 5: 渲染诊断卡
    content.innerHTML = buildDiagCard(name, symbol, priceData, pctChange, fundamental, sentiment, diagResult);
  } catch(err) {
    content.innerHTML = `<div class="diag-error">⚠️ ${escHtml(String(err.message))}</div>`;
  }
}

async function getDiagnosisFromLLM(name, symbol, priceData, fundamental, sentiment) {
  const systemPrompt = `你是A股分析助手。基于提供的数据，输出严格JSON格式的诊断结果，无其他文字。
JSON格式：{"rating":"买入|持有|观望|回避","confidence":0-100的整数,"summary":"50字以内的核心判断","risks":["风险1","风险2"],"catalysts":["催化剂1"]}`;
  const userContent = `股票：${name}(${symbol})
近5日走势：${JSON.stringify(priceData.slice(-5))}
基本面(模拟)：PE=${fundamental.pe}, PB=${fundamental.pb}, ROE=${fundamental.roe}
新闻情绪(模拟)：${sentiment.score}/5, ${sentiment.label}`;

  const resp = await callLLM(systemPrompt, userContent);
  try {
    return JSON.parse(resp.replace(/```json?\s*/gi,'').replace(/```/g,'').trim());
  } catch {
    return { rating: '持有', confidence: 60, summary: resp.slice(0, 50), risks: [], catalysts: [] };
  }
}
```

**Step 4: 渲染诊断卡 HTML**

```js
function buildDiagCard(name, symbol, priceData, pctChange, fundamental, sentiment, diag) {
  const ratingColor = { '买入': 'var(--accent-green)', '持有': 'var(--accent)', '观望': 'var(--accent-purple)', '回避': 'var(--accent-red)' };
  const confColor = diag.confidence >= 70 ? 'var(--accent-green)' : diag.confidence >= 40 ? 'orange' : 'var(--accent-red)';
  const trendRows = priceData.slice(-5).map(r =>
    `<tr><td>${escHtml(r.日期)}</td><td>${escHtml(r.收盘)}</td><td style="color:${r.涨跌幅?.startsWith('-') ? 'var(--accent-red)' : 'var(--accent-green)'}">${escHtml(r.涨跌幅)}</td></tr>`
  ).join('');
  const sentimentBar = Math.round((sentiment.score / 5) * 100);

  return `
  <div class="diag-card">
    <div class="diag-header">
      <div>
        <div class="diag-name">${escHtml(name)}</div>
        <div class="diag-symbol">${escHtml(symbol)}</div>
      </div>
      <div class="diag-rating-block">
        <div class="diag-rating" style="color:${ratingColor[diag.rating] || 'var(--accent)'}">
          ${escHtml(diag.rating)}
        </div>
        <div class="diag-confidence">
          置信度 <span style="color:${confColor}">${diag.confidence}%</span>
        </div>
      </div>
    </div>

    <div class="diag-panels">
      <div class="diag-panel">
        <div class="diag-panel-title">📊 技术面 <span class="real-tag">真实数据</span></div>
        <table class="diag-mini-table">
          <tr><th>日期</th><th>收盘</th><th>涨跌</th></tr>
          ${trendRows}
        </table>
        ${pctChange ? `<div class="diag-pct" style="color:${parseFloat(pctChange)>=0?'var(--accent-green)':'var(--accent-red)'}">5日累计 ${pctChange >= 0 ? '+' : ''}${pctChange}%</div>` : ''}
      </div>

      <div class="diag-panel">
        <div class="diag-panel-title">🏢 基本面 <span class="mock-tag">🎭 模拟数据</span></div>
        <div class="diag-kv-list">
          <div class="diag-kv"><span>市盈率</span><b>${escHtml(String(fundamental.pe))}</b></div>
          <div class="diag-kv"><span>市净率</span><b>${escHtml(String(fundamental.pb))}</b></div>
          <div class="diag-kv"><span>市值</span><b>${escHtml(String(fundamental.marketCap))}</b></div>
          <div class="diag-kv"><span>ROE</span><b>${escHtml(String(fundamental.roe))}</b></div>
          <div class="diag-kv"><span>毛利率</span><b>${escHtml(String(fundamental.grossMargin))}</b></div>
        </div>
      </div>

      <div class="diag-panel">
        <div class="diag-panel-title">📰 情绪面 <span class="mock-tag">🎭 模拟数据</span></div>
        <div class="sentiment-score">${sentiment.score.toFixed(1)} / 5</div>
        <div class="sentiment-bar-wrap">
          <div class="sentiment-bar" style="width:${sentimentBar}%"></div>
        </div>
        <div class="sentiment-label">${escHtml(sentiment.label)}</div>
        <div class="sentiment-news">
          ${sentiment.news.map(n => `<div class="sentiment-news-item">· ${escHtml(n)}</div>`).join('')}
        </div>
      </div>
    </div>

    <div class="diag-summary">
      <div class="diag-summary-label">🤖 AI 综合解读</div>
      <div class="diag-summary-text">${escHtml(diag.summary)}</div>
      ${diag.risks.length ? `<div class="diag-risks"><b>风险：</b>${diag.risks.map(r=>escHtml(r)).join('、')}</div>` : ''}
      ${diag.catalysts.length ? `<div class="diag-catalysts"><b>催化剂：</b>${diag.catalysts.map(c=>escHtml(c)).join('、')}</div>` : ''}
      <div class="diag-disclaimer">⚠️ 仅供参考，不构成投资建议</div>
    </div>

    <div class="model-choice-note">
      🔧 <b>模型选型说明：</b>此模块使用 JSON Schema 约束的结构化输出模式，而非自由对话。
      原因：金融诊断报告需要字段确定性（评级/置信度/风险点），避免 LLM 自由发挥导致格式不稳定，便于前端渲染和后续校验。
    </div>
  </div>`;
}
```

**Step 5: 加入 Tab 2 所需 CSS**（略，主要是 `.diag-card`、`.diag-panels`、`.diag-panel`、`.sentiment-bar` 等样式）

**Step 6: 验证**
输入"茅台"，确认生成三栏诊断卡，技术面显示真实数据，基本面/情绪面显示 [模拟数据] 标注，底部有模型选型说明。

**Step 7: Commit**
```bash
git add tools/stock/index.html
git commit -m "feat: Tab2 个股诊断报告（结构化输出 + 模型选型说明）"
```

---

## Task 4：Tab 3 研报生成（RAG Demo）

**Files:**
- Modify: `tools/stock/index.html`

**Step 1: Mock 新闻数据库**

```js
const NEWS_DB = [
  { id: 1, date: '2025-11-08', stock: '茅台', symbol: '600519.SS', title: '贵州茅台Q3财报超预期', content: '贵州茅台三季报显示净利润同比增长15.2%，营收创历史新高，高端白酒市场需求持续旺盛，机构普遍上调目标价。', tags: ['茅台', '白酒', '业绩'], relevance: 0.94 },
  { id: 2, date: '2025-11-05', stock: '白酒行业', symbol: null, title: '白酒板块估值修复行情', content: '受消费复苏预期带动，白酒板块整体回暖，茅台、五粮液等龙头股量价齐升，分析师建议关注春节备货行情。', tags: ['白酒', '消费', '板块'], relevance: 0.87 },
  { id: 3, date: '2025-11-02', stock: '消费板块', symbol: null, title: '国内消费数据好转，A股消费板块获资金青睐', content: '10月社零数据环比改善，消费板块获北向资金持续净买入，食品饮料领涨，分析师认为估值已具备安全边际。', tags: ['消费', '北向资金', '食品饮料'], relevance: 0.72 },
  { id: 4, date: '2025-11-10', stock: '宁德时代', symbol: '300750.SZ', title: '宁德时代出货量创历史新高', content: '宁德时代10月动力电池出货量同比增长38%，海外市场占比提升至29%，欧洲工厂二期投产在即，市场份额进一步稳固。', tags: ['宁德时代', '电池', '新能源'], relevance: 0.96 },
  { id: 5, date: '2025-11-07', stock: '新能源', symbol: null, title: '新能源汽车渗透率突破50%', content: '11月前两周新能源汽车销量渗透率首次突破50%，产业链相关标的受益明显，动力电池、智能驾驶零部件均现强势表现。', tags: ['新能源', '汽车', '产业链'], relevance: 0.81 },
  { id: 6, date: '2025-11-09', stock: '比亚迪', symbol: '002594.SZ', title: '比亚迪海外工厂投产助力全球化布局', content: '比亚迪泰国工厂正式投产，年产能15万辆，东南亚市场布局加速，叠加国内以旧换新政策拉动，全年销量有望超预期。', tags: ['比亚迪', '汽车', '出海'], relevance: 0.93 },
  { id: 7, date: '2025-11-06', stock: '招商银行', symbol: '600036.SS', title: '招商银行零售业务优势持续强化', content: '招行三季度零售客户数突破2亿，私行AUM增速领先同业，不良率维持低位，股息率吸引力提升，机构增持意愿明显。', tags: ['招商银行', '银行', '零售'], relevance: 0.91 },
  { id: 8, date: '2025-11-01', stock: '上证指数', symbol: '000001.SS', title: 'A股市场情绪回暖，北向资金连续净流入', content: '本周北向资金累计净流入超200亿元，上证指数在3200点附近获得有效支撑，市场多头信心逐渐恢复。', tags: ['上证', '北向资金', '市场情绪'], relevance: 0.70 },
];

function searchNews(query, topK = 3) {
  // 简化的关键词匹配（模拟向量检索）
  const keywords = query.split(/[，、\s]+/).filter(k => k.length > 0);
  const scored = NEWS_DB.map(news => {
    let score = 0;
    keywords.forEach(kw => {
      if (news.title.includes(kw) || news.stock.includes(kw)) score += 0.4;
      if (news.content.includes(kw)) score += 0.2;
      if (news.tags.some(t => t.includes(kw) || kw.includes(t))) score += 0.3;
    });
    return { ...news, score: Math.min(news.relevance, score > 0 ? news.relevance * (0.7 + score) : 0.1) };
  });
  return scored.sort((a, b) => b.score - a.score).slice(0, topK).filter(n => n.score > 0.1);
}
```

**Step 2: Tab 3 HTML（双栏布局）**

```html
<div class="tab-panel" id="tab-report">
  <div class="rag-layout">
    <div class="rag-left">
      <div class="rag-left-title">
        📚 知识库
        <span class="rag-db-info">新浪财经 · 350,000+ 条 🎭</span>
      </div>
      <div class="rag-left-body" id="ragSources">
        <div class="rag-placeholder">等待检索...</div>
      </div>
      <div class="rag-why">
        <div class="rag-why-title">💡 为什么用 RAG？</div>
        <div class="rag-why-body">LLM 训练数据有截止日期，无法获知最新市场动态。RAG 通过检索实时知识库，让模型"看到"最新信息，同时保持引用可溯源，满足金融场景的合规要求。</div>
      </div>
    </div>
    <div class="rag-right">
      <div class="rag-input-bar">
        <input class="diag-input" id="ragInput" placeholder="输入股票或行业，如：茅台、新能源、招商银行" />
        <button class="send-btn" onclick="runRAG()">生成研报</button>
      </div>
      <div class="rag-report-body" id="ragReport">
        <div class="welcome" style="flex:1;">
          <div class="welcome-icon">📄</div>
          <div class="welcome-title">AI 研报生成</div>
          <div>基于知识库检索 + LLM 生成，引用来源可追溯</div>
        </div>
      </div>
    </div>
  </div>
</div>
```

**Step 3: RAG 执行逻辑**

```js
async function runRAG() {
  const query = document.getElementById('ragInput').value.trim();
  if (!query) return;

  const sourcesEl = document.getElementById('ragSources');
  const reportEl = document.getElementById('ragReport');

  // 检索动画
  sourcesEl.innerHTML = '<div class="rag-searching">🔍 正在向量检索中...</div>';
  reportEl.innerHTML = '<div class="rag-searching">⏳ 等待检索完成...</div>';

  await new Promise(r => setTimeout(r, 800)); // 模拟检索延迟

  const results = searchNews(query);

  // 渲染知识源
  if (results.length === 0) {
    sourcesEl.innerHTML = '<div class="rag-placeholder">未找到相关新闻</div>';
    reportEl.innerHTML = '<div class="rag-error">知识库中无相关内容</div>';
    return;
  }

  sourcesEl.innerHTML = results.map((n, i) => `
    <div class="rag-source-item" id="src-${n.id}">
      <div class="rag-source-header">
        <span class="rag-source-idx">[${i+1}]</span>
        <span class="rag-source-title">${escHtml(n.title)}</span>
      </div>
      <div class="rag-source-meta">${escHtml(n.date)} · ${escHtml(n.stock)}</div>
      <div class="rag-source-snippet">${escHtml(n.content.slice(0, 80))}...</div>
      <div class="rag-relevance-bar-wrap">
        <div class="rag-relevance-bar" style="width:${Math.round(n.score*100)}%"></div>
        <span class="rag-relevance-val">相关度 ${(n.score).toFixed(2)}</span>
      </div>
    </div>
  `).join('');

  // 生成报告
  reportEl.innerHTML = '<div class="rag-searching">🤖 AI 正在撰写研报...</div>';

  const context = results.map((n,i) => `[${i+1}] ${n.title}：${n.content}`).join('\n');
  const systemPrompt = `你是专业A股研究员。基于提供的新闻资料撰写简短研究报告（150-250字），要求：结构清晰（概况/亮点/风险），引用来源用[数字]标注，末尾附"数据来源"列表。`;
  const userContent = `研究对象：${query}\n\n参考资料：\n${context}`;

  try {
    const report = await callLLM(systemPrompt, userContent);
    reportEl.innerHTML = `
      <div class="rag-report-content">
        <div class="rag-report-title">📋 ${escHtml(query)} 研究报告 <span class="ai-tag">🤖 AI 生成</span></div>
        <div class="rag-report-text">${report.replace(/\n/g,'<br/>')}</div>
        <div class="rag-report-sources">
          <b>检索来源：</b>${results.map((n,i)=>`[${i+1}] ${escHtml(n.title)}`).join('；')}
        </div>
        <div class="diag-disclaimer">⚠️ 本报告基于模拟新闻数据生成，仅供演示，不构成投资建议</div>
      </div>`;
  } catch(err) {
    reportEl.innerHTML = `<div class="rag-error">⚠️ ${escHtml(err.message)}</div>`;
  }
}
```

**Step 4: 加入 RAG CSS**（`.rag-layout`、`.rag-left`、`.rag-right`、`.rag-source-item`、`.rag-relevance-bar` 等）

**Step 5: 验证**
输入"茅台"，左栏出现检索结果 + 相关度分数，右栏生成带引用标注的研报。

**Step 6: Commit**
```bash
git add tools/stock/index.html
git commit -m "feat: Tab3 研报生成 RAG Demo（检索可视化 + 引用溯源）"
```

---

## Task 5：Tab 5 Agent 实验室（优先于 Tab 4，视觉冲击更强）

**Files:**
- Modify: `tools/stock/index.html`

**Step 1: Tab 5 HTML**

```html
<div class="tab-panel" id="tab-agent">
  <div class="agent-layout">
    <div class="agent-main">
      <div class="agent-input-bar">
        <input class="diag-input" id="agentInput"
          placeholder="输入复杂问题，如：茅台现在值得买入吗？宁德时代近期怎么样？" />
        <button class="send-btn" onclick="runAgent()">启动 Agent</button>
      </div>
      <div class="agent-process" id="agentProcess">
        <div class="welcome">
          <div class="welcome-icon">🤖</div>
          <div class="welcome-title">Agent 实验室</div>
          <div>可视化 ReAct Agent 执行过程：Think → Plan → Act → Observe</div>
          <div style="margin-top:8px; font-size:12px; color:var(--text-muted)">
            快速提问：
            <span class="quick-btn" onclick="document.getElementById('agentInput').value='茅台现在值得买入吗？'">茅台值得买入？</span>
            <span class="quick-btn" onclick="document.getElementById('agentInput').value='宁德时代最近走势如何，有投资价值吗？'">宁德时代分析</span>
          </div>
        </div>
      </div>
    </div>
    <div class="agent-tools-panel">
      <div class="agent-tools-title">🔧 工具定义</div>
      <div class="agent-tools-list" id="agentTools"></div>
    </div>
  </div>
</div>
```

**Step 2: 工具定义（Function Calling Schema）**

```js
const AGENT_TOOLS = [
  {
    name: 'get_price',
    desc: '获取股票近期行情数据',
    status: 'real',
    schema: { symbol: 'string (Yahoo格式)', range: '1d|5d|1mo', interval: '1d|1wk' },
    impl: async (args) => {
      const data = await fetchYahoo(args.symbol, args.range || '5d', '1d');
      return { data: data.slice(-5), source: 'Yahoo Finance', delay: '15分钟' };
    }
  },
  {
    name: 'get_valuation',
    desc: '获取股票估值指标（PE/PB/ROE）',
    status: 'mock',
    schema: { symbol: 'string', name: 'string' },
    impl: async (args) => {
      const sym = args.symbol || Object.entries(SYMBOL_MAP).find(([k])=>args.name?.includes(k))?.[1];
      return { ...(FUNDAMENTAL_MOCK[sym] || DEFAULT_MOCK), source: '模拟数据 [MOCK]' };
    }
  },
  {
    name: 'search_news',
    desc: '检索相关新闻和市场情绪',
    status: 'mock',
    schema: { query: 'string', topK: 'number (默认3)' },
    impl: async (args) => {
      const results = searchNews(args.query, args.topK || 3);
      return { news: results.map(n => ({ title: n.title, date: n.date, sentiment: n.score > 0.7 ? '正面' : '中性' })), source: '模拟数据 [MOCK]' };
    }
  },
  {
    name: 'get_sentiment',
    desc: '获取股票综合情绪评分',
    status: 'mock',
    schema: { symbol: 'string' },
    impl: async (args) => ({ ...(SENTIMENT_MOCK[args.symbol] || DEFAULT_SENTIMENT), source: '模拟数据 [MOCK]' })
  }
];
```

**Step 3: Agent 执行逻辑（ReAct 范式）**

```js
async function runAgent() {
  const question = document.getElementById('agentInput').value.trim();
  if (!question) return;

  const el = document.getElementById('agentProcess');
  el.innerHTML = '';

  // 渲染工具面板
  renderAgentTools();

  // THINK 阶段（模拟）
  const thinkEl = addAgentStep(el, 'think', '🤔 THINK', '分析问题，规划所需信息...');
  await sleep(600);
  updateAgentStep(thinkEl, `分析问题：「${question}」\n需要获取：价格走势数据、估值指标、市场情绪、相关新闻`);

  // PLAN 阶段（模拟）
  const planEl = addAgentStep(el, 'plan', '📋 PLAN', '制定执行计划...');
  await sleep(500);
  updateAgentStep(planEl, `执行计划：\n1. 解析股票代码\n2. 调用 get_price → 近期行情\n3. 调用 get_valuation → 估值数据\n4. 调用 search_news → 市场情绪\n5. 综合分析，输出判断`);

  // ACT 阶段（部分真实）
  const actEl = addAgentStep(el, 'act', '⚡ ACT', '执行工具调用...');
  let toolResults = {};

  // 解析股票
  let symbol, stockName;
  try {
    const params = await parseIntent(question);
    symbol = params.symbol;
    stockName = Object.entries(SYMBOL_MAP).find(([,v])=>v===symbol)?.[0] || symbol;
  } catch {
    symbol = '600519.SS'; stockName = '茅台';
  }

  // 真实执行工具
  for (const tool of AGENT_TOOLS) {
    const callEl = addToolCall(actEl, tool.name, tool.status);
    try {
      let args = {};
      if (tool.name === 'get_price') args = { symbol, range: '5d' };
      else if (tool.name === 'get_valuation') args = { symbol, name: stockName };
      else if (tool.name === 'search_news') args = { query: stockName, topK: 3 };
      else if (tool.name === 'get_sentiment') args = { symbol };

      toolResults[tool.name] = await tool.impl(args);
      markToolCall(callEl, 'success');
    } catch(e) {
      toolResults[tool.name] = { error: e.message };
      markToolCall(callEl, 'error');
    }
    await sleep(300);
  }

  // OBSERVE 阶段（真实 LLM）
  const obsEl = addAgentStep(el, 'observe', '👁 OBSERVE', '整合结果，进行推理...');
  await sleep(400);

  const systemPrompt = `你是专业A股分析师。基于以下多源数据，给出结构化投资判断（150字以内）：
评级（买入/持有/观望/回避）+ 核心理由（2-3点）+ 主要风险（1-2点）。末尾注明"本分析仅供参考，不构成投资建议"。`;
  const userContent = `问题：${question}
股票：${stockName}(${symbol})
行情数据：${JSON.stringify(toolResults['get_price']?.data?.slice(-3) || [])}
估值：${JSON.stringify(toolResults['get_valuation'] || {})}
新闻情绪：${JSON.stringify(toolResults['search_news']?.news || [])}`;

  try {
    const conclusion = await callLLM(systemPrompt, userContent);
    updateAgentStep(obsEl, '数据整合完成，生成最终判断');

    const finalEl = document.createElement('div');
    finalEl.className = 'agent-conclusion';
    finalEl.innerHTML = `
      <div class="agent-conclusion-title">📊 Agent 最终结论 <span class="ai-tag">🤖 AI 生成</span></div>
      <div class="agent-conclusion-body">${conclusion.replace(/\n/g,'<br/>')}</div>
      <div class="agent-chain-note">推理链路：THINK → PLAN → ACT(${Object.keys(toolResults).length}个工具) → OBSERVE → 结论</div>
    `;
    el.appendChild(finalEl);
  } catch(err) {
    updateAgentStep(obsEl, `⚠️ ${err.message}`);
  }
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function addAgentStep(container, type, title, content) {
  const el = document.createElement('div');
  el.className = `agent-step agent-step-${type}`;
  el.innerHTML = `
    <div class="agent-step-header">${escHtml(title)}</div>
    <div class="agent-step-body">${escHtml(content)}</div>
  `;
  container.appendChild(el);
  container.scrollTop = container.scrollHeight;
  return el;
}
function updateAgentStep(el, content) {
  el.querySelector('.agent-step-body').innerHTML = content.replace(/\n/g,'<br/>');
}
function addToolCall(stepEl, toolName, status) {
  const callEl = document.createElement('div');
  callEl.className = 'tool-call tool-call-pending';
  callEl.innerHTML = `<span class="tool-status">⏳</span> ${escHtml(toolName)}() <span class="tool-badge tool-badge-${status}">${status === 'real' ? '📊 真实' : '🎭 模拟'}</span>`;
  stepEl.querySelector('.agent-step-body').appendChild(callEl);
  return callEl;
}
function markToolCall(el, result) {
  el.className = `tool-call tool-call-${result}`;
  el.querySelector('.tool-status').textContent = result === 'success' ? '✅' : '❌';
}
function renderAgentTools() {
  document.getElementById('agentTools').innerHTML = AGENT_TOOLS.map(t => `
    <div class="agent-tool-card">
      <div class="agent-tool-name">${escHtml(t.name)}() <span class="tool-badge tool-badge-${t.status}">${t.status === 'real' ? '真实' : '模拟'}</span></div>
      <div class="agent-tool-desc">${escHtml(t.desc)}</div>
      <div class="agent-tool-schema">${Object.entries(t.schema).map(([k,v])=>`${escHtml(k)}: <i>${escHtml(v)}</i>`).join('<br/>')}</div>
    </div>
  `).join('');
}
```

**Step 4: Agent CSS**（`.agent-layout`、`.agent-step`、`.tool-call`、`.agent-conclusion` 等）

**Step 5: 验证**
输入"茅台现在值得买入吗？"，页面依次出现 THINK/PLAN/ACT/OBSERVE 四步，工具调用显示真实/模拟标注，最终输出结论。

**Step 6: Commit**
```bash
git add tools/stock/index.html
git commit -m "feat: Tab5 Agent 实验室（ReAct 可视化 + 工具定义展示）"
```

---

## Task 6：Tab 6 合规 & 数据血缘（静态展示）

**Files:**
- Modify: `tools/stock/index.html`

**Step 1: Tab 6 HTML（三部分静态内容）**

```html
<div class="tab-panel" id="tab-compliance">
  <div class="compliance-layout">

    <!-- Part A: 合规设计原则 -->
    <div class="compliance-section">
      <div class="compliance-section-title">🛡️ 金融 AI 合规设计原则</div>
      <div class="compliance-cards">
        <div class="compliance-card">
          <div class="cc-icon">📋</div>
          <div class="cc-title">可解释性要求</div>
          <div class="cc-body">证监会《证券期货业算法推荐管理办法》要求 AI 推荐必须具备可解释性。本工具通过 Prompt 卡、推理链可视化实现每步决策透明化。</div>
        </div>
        <div class="compliance-card">
          <div class="cc-icon">🏷️</div>
          <div class="cc-title">AI 内容标注</div>
          <div class="cc-body">所有 AI 生成内容标注「🤖 AI 生成」，模拟数据标注「🎭 模拟数据」，真实数据标注「📊 真实数据」，来源和时效一目了然。</div>
        </div>
        <div class="compliance-card">
          <div class="cc-icon">⚖️</div>
          <div class="cc-title">投资建议豁免</div>
          <div class="cc-body">所有 AI 输出均附「仅供参考，不构成投资建议」声明。生产环境还需增加：用户适当性验证、风险承受能力评估、操作日志留存。</div>
        </div>
        <div class="compliance-card">
          <div class="cc-icon">🔒</div>
          <div class="cc-title">数据安全</div>
          <div class="cc-body">API Key 通过 GitHub Secrets 注入，不进代码仓库。CORS 代理仅用于公开行情数据。生产环境应使用后端代理，避免密钥暴露在前端。</div>
        </div>
      </div>
    </div>

    <!-- Part B: 数据血缘图 -->
    <div class="compliance-section">
      <div class="compliance-section-title">🗺️ 数据血缘图</div>
      <div class="lineage-chart">
        <div class="lineage-source">
          <div class="lineage-node source-node">Yahoo Finance API<br/><span class="lineage-meta">行情数据 · 15分钟延迟 · 📊 真实</span></div>
          <div class="lineage-arrow">↓</div>
          <div class="lineage-node process-node">数据清洗层<br/><span class="lineage-meta">去重 · 异常值过滤 · 格式标准化</span></div>
          <div class="lineage-arrow">↓</div>
          <div class="lineage-targets">
            <div class="lineage-node target-node">Tab1 行情助手</div>
            <div class="lineage-node target-node">Tab2 技术面</div>
            <div class="lineage-node target-node">Tab5 get_price()</div>
          </div>
        </div>
        <div class="lineage-source">
          <div class="lineage-node source-node">新浪财经新闻<br/><span class="lineage-meta">35万条 · 2025年 · 🎭 模拟</span></div>
          <div class="lineage-arrow">↓</div>
          <div class="lineage-node process-node">向量化层<br/><span class="lineage-meta">text2vec-base-chinese · 关键词索引</span></div>
          <div class="lineage-arrow">↓</div>
          <div class="lineage-targets">
            <div class="lineage-node target-node">Tab3 RAG 检索</div>
            <div class="lineage-node target-node">Tab5 search_news()</div>
          </div>
        </div>
        <div class="lineage-source">
          <div class="lineage-node source-node">模拟数据 [MOCK]<br/><span class="lineage-meta">基本面 · 情绪评分 · 🎭 模拟</span></div>
          <div class="lineage-arrow">↓</div>
          <div class="lineage-targets">
            <div class="lineage-node target-node">Tab2 基本面</div>
            <div class="lineage-node target-node">Tab4 市场雷达</div>
            <div class="lineage-node target-node">Tab5 get_valuation()</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Part C: 内容标注标准 -->
    <div class="compliance-section">
      <div class="compliance-section-title">📌 AI 内容标注规范</div>
      <div class="standard-table-wrap">
        <table class="standard-table">
          <thead><tr><th>标签</th><th>含义</th><th>置信度阈值</th><th>应用场景</th></tr></thead>
          <tbody>
            <tr><td>📊 真实数据</td><td>来自 Yahoo Finance 的实时行情</td><td>N/A</td><td>收盘价、成交量、涨跌幅</td></tr>
            <tr><td>🎭 模拟数据</td><td>硬编码的演示数据</td><td>N/A</td><td>基本面、情绪评分、新闻</td></tr>
            <tr><td>🤖 AI 生成</td><td>LLM 输出内容</td><td>标注置信度</td><td>分析结论、研报、Agent 判断</td></tr>
            <tr><td style="color:var(--accent-green)">绿色置信度 ≥70%</td><td>AI 较确信的输出</td><td>≥70%</td><td>数据充分时的综合判断</td></tr>
            <tr><td style="color:orange">橙色置信度 40-70%</td><td>AI 存在不确定性</td><td>40-70%</td><td>数据不足或存在矛盾信号</td></tr>
            <tr><td style="color:var(--accent-red)">红色置信度 &lt;40%</td><td>AI 输出参考价值有限</td><td>&lt;40%</td><td>缺少关键数据时</td></tr>
          </tbody>
        </table>
      </div>
    </div>

  </div>
</div>
```

**Step 2: 加入合规 CSS**（`.compliance-layout`、`.compliance-card`、`.lineage-chart` 等）

**Step 3: 验证**
切换到「合规设计」Tab，确认三部分内容全部渲染，数据血缘图清晰展示三条数据流。

**Step 4: Commit**
```bash
git add tools/stock/index.html
git commit -m "feat: Tab6 合规设计（数据血缘图 + 内容标注规范）"
```

---

## Task 7：Tab 4 市场雷达（信息看板）

**Files:**
- Modify: `tools/stock/index.html`

**Step 1: Mock 市场数据**

```js
const RADAR_DATA = {
  hotSectors: [
    { name: '人工智能', change: +4.2, heat: 95 },
    { name: '新能源车', change: +2.8, heat: 82 },
    { name: '白酒', change: +1.9, heat: 71 },
    { name: '半导体', change: -0.8, heat: 65 },
    { name: '医药生物', change: -1.2, heat: 58 },
    { name: '银行', change: +0.5, heat: 44 },
  ],
  movers: [
    { name: '寒武纪', symbol: '688256.SS', change: +8.3, volume: '高', reason: 'AI芯片订单增加' },
    { name: '东方财富', symbol: '300059.SZ', change: +5.1, volume: '高', reason: '市场活跃度提升' },
    { name: '药明康德', symbol: '603259.SS', change: -4.2, volume: '中', reason: '海外政策压力' },
  ],
  sentimentTrend: [
    { date: '11-05', score: 2.1 }, { date: '11-06', score: 2.8 },
    { date: '11-07', score: 3.5 }, { date: '11-08', score: 3.2 },
    { date: '11-10', score: 3.8 },
  ]
};
```

**Step 2: Tab 4 HTML**

```html
<div class="tab-panel" id="tab-radar">
  <div class="radar-layout">
    <div class="radar-top">
      <div class="radar-widget">
        <div class="radar-widget-title">🔥 热点板块 <span class="mock-tag">🎭 模拟</span></div>
        <div class="sector-heatmap" id="sectorHeatmap"></div>
      </div>
      <div class="radar-widget radar-brief-widget">
        <div class="radar-widget-title">📰 今日 AI 简报 <span class="ai-tag">🤖 AI 生成</span></div>
        <div class="radar-brief-body" id="radarBrief">
          <button class="send-btn" onclick="generateBrief()" style="margin:auto;">生成今日简报</button>
        </div>
      </div>
    </div>
    <div class="radar-bottom">
      <div class="radar-widget">
        <div class="radar-widget-title">⚡ 今日异动 <span class="mock-tag">🎭 模拟</span></div>
        <div class="movers-list" id="moversList"></div>
      </div>
      <div class="radar-widget">
        <div class="radar-widget-title">📈 市场情绪趋势 <span class="mock-tag">🎭 模拟</span></div>
        <div class="sentiment-trend" id="sentimentTrend"></div>
      </div>
    </div>
  </div>
  <div class="radar-data-note">🎭 热点板块/异动/情绪趋势均为模拟数据；生产环境接入：雪球 API · 新浪财经 · 东方财富 | 更新频率：每15分钟</div>
</div>
```

**Step 3: 渲染逻辑（在 switchTab 中初始化 radar）**

```js
function initRadar() {
  // 热力图
  const heatmap = document.getElementById('sectorHeatmap');
  heatmap.innerHTML = RADAR_DATA.hotSectors.map(s => {
    const color = s.change >= 0 ? `rgba(0,229,160,${0.15 + s.heat/200})` : `rgba(239,68,68,${0.15 + s.heat/200})`;
    return `<div class="sector-block" style="background:${color}">
      <div class="sector-name">${escHtml(s.name)}</div>
      <div class="sector-change" style="color:${s.change>=0?'var(--accent-green)':'var(--accent-red)'}">
        ${s.change >= 0 ? '+' : ''}${s.change}%
      </div>
    </div>`;
  }).join('');

  // 异动列表
  document.getElementById('moversList').innerHTML = RADAR_DATA.movers.map(m => `
    <div class="mover-item">
      <div class="mover-name">${escHtml(m.name)}</div>
      <div class="mover-change" style="color:${m.change>=0?'var(--accent-green)':'var(--accent-red)'}">
        ${m.change >= 0 ? '+' : ''}${m.change}%
      </div>
      <div class="mover-reason">${escHtml(m.reason)}</div>
    </div>
  `).join('');

  // 情绪趋势（简易折线，用 div 模拟）
  const trend = document.getElementById('sentimentTrend');
  const max = 5, min = 0;
  trend.innerHTML = `<div class="trend-chart">${RADAR_DATA.sentimentTrend.map(p => {
    const h = Math.round(((p.score - min) / (max - min)) * 60);
    return `<div class="trend-bar-wrap">
      <div class="trend-bar" style="height:${h}px; background:${p.score>=3?'var(--accent-green)':'orange'}"></div>
      <div class="trend-label">${escHtml(p.date)}</div>
    </div>`;
  }).join('')}</div>`;
}

async function generateBrief() {
  const el = document.getElementById('radarBrief');
  el.innerHTML = '<div class="rag-searching">🤖 生成中...</div>';
  const sectorSummary = RADAR_DATA.hotSectors.slice(0,3).map(s=>`${s.name}(${s.change>0?'+':''}${s.change}%)`).join('、');
  const prompt = `你是A股市场分析师。基于以下信息生成今日市场简报（100字以内，简洁客观）：
热点板块：${sectorSummary}
今日异动：${RADAR_DATA.movers.map(m=>m.name+m.change+'%').join('、')}
市场情绪：近5日均值${(RADAR_DATA.sentimentTrend.reduce((s,p)=>s+p.score,0)/RADAR_DATA.sentimentTrend.length).toFixed(1)}/5`;
  try {
    const brief = await callLLM(prompt, '请生成简报');
    el.innerHTML = `<div class="radar-brief-text">${brief.replace(/\n/g,'<br/>')}</div>
      <div class="diag-disclaimer">⚠️ 基于模拟数据生成，仅供演示</div>`;
  } catch(e) {
    el.innerHTML = `<div class="rag-error">${escHtml(e.message)}</div>`;
  }
}
```

更新 `switchTab` 函数：
```js
function switchTab(name) {
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('tab-' + name).classList.add('active');
  document.querySelector(`[data-tab="${name}"]`).classList.add('active');
  if (name === 'radar') initRadar();
}
```

**Step 4: Commit**
```bash
git add tools/stock/index.html
git commit -m "feat: Tab4 市场雷达（多源数据整合看板 + AI 简报）"
```

---

## Task 8：CSS 完善 + 视觉打磨

**Files:**
- Modify: `tools/stock/index.html`（`:root` 和各组件 CSS）

**Step 1: 补充所有 Task 2-7 中提到但未完整写出的 CSS**

关键 CSS 块：

```css
/* Tab 2 个股诊断 */
.diagnosis-input-bar { display:flex; gap:8px; padding:12px 16px; border-bottom:1px solid var(--border); flex-shrink:0; }
.diag-input { flex:1; padding:10px 14px; background:var(--card); border:1px solid var(--border); border-radius:var(--radius-md); color:var(--text); font-size:13px; outline:none; }
.diag-input:focus { border-color:var(--border-hover); }
.diag-card { padding:16px; display:flex; flex-direction:column; gap:12px; overflow-y:auto; }
.diag-header { display:flex; justify-content:space-between; align-items:flex-start; }
.diag-name { font-size:18px; font-weight:700; }
.diag-symbol { font-size:12px; color:var(--text-muted); }
.diag-rating { font-size:20px; font-weight:800; }
.diag-confidence { font-size:12px; color:var(--text-sec); }
.diag-panels { display:grid; grid-template-columns:1fr 1fr 1fr; gap:10px; }
.diag-panel { background:var(--card); border:1px solid var(--border); border-radius:var(--radius-md); padding:12px; }
.diag-panel-title { font-size:12px; font-weight:600; color:var(--text-sec); margin-bottom:8px; display:flex; align-items:center; gap:6px; }
.real-tag { font-size:10px; background:rgba(0,212,255,0.12); color:var(--accent-cyan); padding:2px 6px; border-radius:8px; }
.mock-tag { font-size:10px; background:rgba(155,109,255,0.12); color:var(--accent-purple); padding:2px 6px; border-radius:8px; }
.ai-tag { font-size:10px; background:rgba(0,229,160,0.12); color:var(--accent-green); padding:2px 6px; border-radius:8px; }
.diag-mini-table { width:100%; border-collapse:collapse; font-size:11px; }
.diag-mini-table th, .diag-mini-table td { padding:3px 6px; border-bottom:1px solid var(--border); }
.diag-mini-table th { color:var(--text-muted); }
.diag-kv-list { display:flex; flex-direction:column; gap:4px; }
.diag-kv { display:flex; justify-content:space-between; font-size:12px; }
.diag-kv span { color:var(--text-muted); }
.sentiment-score { font-size:20px; font-weight:700; color:var(--accent-green); }
.sentiment-bar-wrap { background:var(--border); border-radius:4px; height:6px; margin:6px 0; }
.sentiment-bar { background:var(--accent-green); height:6px; border-radius:4px; transition:width 0.5s; }
.sentiment-news-item { font-size:11px; color:var(--text-sec); padding:2px 0; }
.diag-summary { background:rgba(79,143,255,0.06); border:1px solid rgba(79,143,255,0.15); border-radius:var(--radius-md); padding:12px; }
.diag-summary-label { font-size:12px; font-weight:600; color:var(--accent); margin-bottom:6px; }
.diag-summary-text { font-size:13px; line-height:1.7; }
.diag-risks, .diag-catalysts { font-size:12px; color:var(--text-sec); margin-top:6px; }
.diag-disclaimer { font-size:11px; color:var(--text-muted); margin-top:8px; }
.model-choice-note { font-size:11px; color:var(--text-muted); background:rgba(255,255,255,0.02); border:1px solid var(--border); border-radius:var(--radius-sm); padding:8px 12px; line-height:1.6; }
.model-tip { margin-top:8px; font-size:11px; color:var(--accent-purple); }

/* Tab 3 RAG */
.rag-layout { display:flex; flex:1; overflow:hidden; }
.rag-left { width:280px; border-right:1px solid var(--border); display:flex; flex-direction:column; flex-shrink:0; background:var(--bg-sec); }
.rag-left-title { padding:10px 14px; font-size:12px; font-weight:600; border-bottom:1px solid var(--border); display:flex; align-items:center; justify-content:space-between; }
.rag-db-info { font-size:10px; color:var(--accent-purple); }
.rag-left-body { flex:1; overflow-y:auto; padding:8px; }
.rag-right { flex:1; display:flex; flex-direction:column; }
.rag-input-bar { display:flex; gap:8px; padding:12px 16px; border-bottom:1px solid var(--border); flex-shrink:0; }
.rag-report-body { flex:1; overflow-y:auto; padding:16px; }
.rag-source-item { background:var(--card); border:1px solid var(--border); border-radius:var(--radius-sm); padding:8px; margin-bottom:6px; }
.rag-source-header { display:flex; gap:6px; align-items:flex-start; margin-bottom:4px; }
.rag-source-idx { color:var(--accent); font-weight:700; flex-shrink:0; }
.rag-source-title { font-size:12px; font-weight:500; line-height:1.4; }
.rag-source-meta { font-size:10px; color:var(--text-muted); margin-bottom:4px; }
.rag-source-snippet { font-size:11px; color:var(--text-sec); margin-bottom:6px; }
.rag-relevance-bar-wrap { display:flex; align-items:center; gap:6px; }
.rag-relevance-bar { height:4px; background:var(--accent); border-radius:2px; }
.rag-relevance-val { font-size:10px; color:var(--text-muted); white-space:nowrap; }
.rag-why { padding:10px 14px; border-top:1px solid var(--border); }
.rag-why-title { font-size:11px; font-weight:600; color:var(--accent-purple); margin-bottom:4px; }
.rag-why-body { font-size:11px; color:var(--text-muted); line-height:1.6; }
.rag-searching { color:var(--text-sec); font-size:13px; padding:20px; text-align:center; }
.rag-report-content { }
.rag-report-title { font-size:14px; font-weight:600; margin-bottom:10px; display:flex; align-items:center; gap:8px; }
.rag-report-text { font-size:13px; line-height:1.8; margin-bottom:10px; }
.rag-report-sources { font-size:11px; color:var(--text-muted); padding:8px; background:var(--card); border-radius:var(--radius-sm); }

/* Tab 5 Agent */
.agent-layout { display:flex; flex:1; overflow:hidden; }
.agent-main { flex:1; display:flex; flex-direction:column; }
.agent-input-bar { display:flex; gap:8px; padding:12px 16px; border-bottom:1px solid var(--border); flex-shrink:0; }
.agent-process { flex:1; overflow-y:auto; padding:12px 16px; display:flex; flex-direction:column; gap:8px; }
.agent-tools-panel { width:220px; border-left:1px solid var(--border); background:var(--bg-sec); padding:10px; overflow-y:auto; flex-shrink:0; }
.agent-tools-title { font-size:11px; font-weight:600; color:var(--text-sec); margin-bottom:8px; }
.agent-tool-card { background:var(--card); border:1px solid var(--border); border-radius:var(--radius-sm); padding:8px; margin-bottom:6px; }
.agent-tool-name { font-size:12px; font-weight:600; font-family:monospace; margin-bottom:4px; }
.agent-tool-desc { font-size:11px; color:var(--text-sec); margin-bottom:4px; }
.agent-tool-schema { font-size:10px; color:var(--text-muted); line-height:1.6; }
.tool-badge { font-size:10px; padding:1px 6px; border-radius:8px; }
.tool-badge-real { background:rgba(0,212,255,0.12); color:var(--accent-cyan); }
.tool-badge-mock { background:rgba(155,109,255,0.12); color:var(--accent-purple); }
.agent-step { border:1px solid var(--border); border-radius:var(--radius-md); overflow:hidden; animation:fadeIn 0.3s ease; }
.agent-step-header { padding:8px 12px; font-size:12px; font-weight:600; }
.agent-step-think .agent-step-header { background:rgba(79,143,255,0.1); color:var(--accent); }
.agent-step-plan .agent-step-header { background:rgba(0,229,160,0.1); color:var(--accent-green); }
.agent-step-act .agent-step-header { background:rgba(255,165,0,0.1); color:orange; }
.agent-step-observe .agent-step-header { background:rgba(155,109,255,0.1); color:var(--accent-purple); }
.agent-step-body { padding:8px 12px; font-size:12px; color:var(--text-sec); line-height:1.7; }
.tool-call { font-size:11px; font-family:monospace; padding:4px 8px; margin-top:4px; border-radius:4px; background:rgba(255,255,255,0.03); }
.tool-call-success { border-left:2px solid var(--accent-green); }
.tool-call-error { border-left:2px solid var(--accent-red); }
.agent-conclusion { background:rgba(79,143,255,0.06); border:1px solid rgba(79,143,255,0.2); border-radius:var(--radius-md); padding:14px; }
.agent-conclusion-title { font-size:13px; font-weight:600; margin-bottom:8px; display:flex; align-items:center; gap:8px; }
.agent-conclusion-body { font-size:13px; line-height:1.8; }
.agent-chain-note { margin-top:8px; font-size:11px; color:var(--text-muted); }

/* Tab 4 市场雷达 */
.radar-layout { flex:1; overflow-y:auto; padding:12px; display:flex; flex-direction:column; gap:10px; }
.radar-top, .radar-bottom { display:grid; grid-template-columns:1fr 1fr; gap:10px; }
.radar-widget { background:var(--card); border:1px solid var(--border); border-radius:var(--radius-md); padding:12px; }
.radar-widget-title { font-size:12px; font-weight:600; color:var(--text-sec); margin-bottom:10px; display:flex; align-items:center; gap:6px; }
.sector-heatmap { display:grid; grid-template-columns:1fr 1fr 1fr; gap:6px; }
.sector-block { border-radius:var(--radius-sm); padding:8px; text-align:center; }
.sector-name { font-size:11px; color:var(--text); }
.sector-change { font-size:13px; font-weight:700; }
.mover-item { display:flex; align-items:center; gap:8px; padding:6px 0; border-bottom:1px solid var(--border); font-size:12px; }
.mover-name { font-weight:600; width:70px; }
.mover-change { font-weight:700; width:50px; }
.mover-reason { color:var(--text-muted); flex:1; }
.trend-chart { display:flex; align-items:flex-end; gap:8px; height:80px; padding-bottom:20px; }
.trend-bar-wrap { display:flex; flex-direction:column; align-items:center; gap:4px; }
.trend-bar { width:24px; border-radius:2px 2px 0 0; transition:height 0.5s; }
.trend-label { font-size:10px; color:var(--text-muted); }
.radar-brief-text { font-size:13px; line-height:1.8; }
.radar-data-note { padding:6px 12px; font-size:10px; color:var(--text-muted); border-top:1px solid var(--border); text-align:center; flex-shrink:0; }
.radar-brief-widget { display:flex; flex-direction:column; }

/* Tab 6 合规 */
.compliance-layout { flex:1; overflow-y:auto; padding:16px; display:flex; flex-direction:column; gap:16px; }
.compliance-section { }
.compliance-section-title { font-size:14px; font-weight:700; color:var(--text); margin-bottom:10px; padding-bottom:6px; border-bottom:1px solid var(--border); }
.compliance-cards { display:grid; grid-template-columns:1fr 1fr; gap:10px; }
.compliance-card { background:var(--card); border:1px solid var(--border); border-radius:var(--radius-md); padding:14px; }
.cc-icon { font-size:20px; margin-bottom:6px; }
.cc-title { font-size:13px; font-weight:600; margin-bottom:6px; }
.cc-body { font-size:12px; color:var(--text-sec); line-height:1.7; }
.lineage-chart { display:grid; grid-template-columns:1fr 1fr 1fr; gap:16px; }
.lineage-source { display:flex; flex-direction:column; align-items:center; gap:6px; }
.lineage-node { background:var(--card); border:1px solid var(--border); border-radius:var(--radius-sm); padding:8px 12px; text-align:center; font-size:12px; width:100%; }
.source-node { border-color:var(--accent); }
.process-node { border-color:var(--accent-purple); }
.target-node { border-color:var(--accent-green); font-size:11px; }
.lineage-targets { display:flex; flex-direction:column; gap:4px; width:100%; }
.lineage-arrow { color:var(--text-muted); font-size:16px; }
.lineage-meta { font-size:10px; color:var(--text-muted); display:block; margin-top:2px; }
.standard-table-wrap { overflow-x:auto; }
.standard-table { width:100%; border-collapse:collapse; font-size:12px; }
.standard-table th { padding:8px 12px; background:rgba(255,255,255,0.04); color:var(--text-sec); text-align:left; border-bottom:1px solid var(--border); }
.standard-table td { padding:8px 12px; border-bottom:1px solid var(--border); color:var(--text); }

/* 诊断 loading/error */
.diag-loading, .rag-error, .diag-error { padding:20px; text-align:center; color:var(--text-sec); font-size:13px; }
```

**Step 2: 验证整体视觉**
逐个切换所有 6 个 Tab，确认无布局错乱，所有标签（真实/模拟/AI生成）颜色一致。

**Step 3: Commit**
```bash
git add tools/stock/index.html
git commit -m "style: A股助手完善所有 Tab 的 CSS 样式"
```

---

## Task 9：最终检查 + 更新 README

**Files:**
- Modify: `tools/stock/README.md`

**Step 1: 核对所有 Tab 功能**

| Tab | 检查项 | 预期 |
|-----|--------|------|
| Tab 1 | 发送查询 → 收到 Prompt 卡 | ✅ |
| Tab 2 | 输入"茅台" → 三栏诊断卡 | ✅ |
| Tab 3 | 输入"茅台" → 左栏检索结果 + 右栏研报 | ✅ |
| Tab 4 | 切换 Tab → 热力图渲染 → 点击生成简报 | ✅ |
| Tab 5 | 输入问题 → THINK/PLAN/ACT/OBSERVE 动画 | ✅ |
| Tab 6 | 合规卡片 + 血缘图 + 标注规范 | ✅ |
| 全局 | 底部免责栏固定显示 | ✅ |

**Step 2: 更新 README.md**

更新功能说明，列出 6 个 Tab 和各自体现的 AI 能力。

**Step 3: 最终 Commit**
```bash
git add tools/stock/index.html tools/stock/README.md
git commit -m "docs: 更新 A股助手 README，记录升级后的功能架构"
```
