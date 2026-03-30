# RAG 模块升级 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 将 tools/stock/index.html 的 Tab 3「研报生成」RAG 模块从简单关键词匹配升级为体现简历描述的 4 大能力：金融同义词对齐、数据分级标注、LLM Reranking 可视化、双层知识库 UI。

**对应简历（恒生电子 · LLM驱动金融资讯研报AI平台）：**
- 向量检索策略：金融同义词对齐机制（如 ROE=净资产收益率）
- 数据溯源与分级标注：官方权威/主流媒体/待核实三级，来源+时间戳强制标注
- 召回精度评估：Retrieve → Rerank → Generate 三阶段，精排理由可视化
- 知识库分层设计：实时市场库 + 私有知识库双层联合召回

**Architecture:** 所有改动仅修改 tools/stock/index.html，用 Edit tool 精确替换，不整文件写入。

**Tech Stack:** Vanilla JS，零依赖，OpenRouter API（Reranking 复用现有 callLLM）。

**重要执行规则（必须严格遵守）：**
- **禁止使用 Write tool 对整个 index.html 写入** —— 文件超 1300 行，会截断失败
- **禁止用 heredoc（cat << 'EOF'）写 HTML/JS** —— 单引号冲突
- **每次只用 Edit tool 做精确替换**，每个 Task 分多次小块 Edit
- 遇到工具失败立刻换方案，不重试同样方式
- 每个 Task 完成后立即 commit，再执行下一个

---

## Task 1：金融同义词扩展（Query Expansion）

**Files:** `tools/stock/index.html`

**目标：** 检索前自动扩展查询词，UI 展示扩展过程，对应简历「金融同义词对齐机制」。

### Step 1: 读取文件
用 Read tool 读取 tools/stock/index.html，找到：
1. `const NEWS_DB` 的位置（约第 1006 行）
2. `function searchNews` 的完整内容
3. `async function runRAG` 的完整内容
4. `</style>` 的位置

### Step 2: 替换 NEWS_DB，给每条数据加扩展字段

找到现有 `const NEWS_DB = [` 开头的数组，在其前面（即 `const NEWS_DB` 这行之前）用 Edit tool **插入**同义词词典：

```js
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
```

### Step 3: 替换 searchNews 函数

用 Edit tool 将现有 `function searchNews(query, topK)` 整体替换为：

```js
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
```

### Step 4: 修改 runRAG 函数，加入查询扩展展示

找到 `async function runRAG()` 中的这段：
```js
  sourcesEl.innerHTML = '<div class="rag-searching">🔍 正在向量检索中...</div>';
  reportEl.innerHTML = '<div class="rag-searching">⏳ 等待检索完成...</div>';
  await new Promise(function(r) { setTimeout(r, 800); });
  const results = searchNews(query);
```

用 Edit tool 替换为：
```js
  // 查询扩展
  const expansion = expandQuery(query);
  const expandHtml = expansion.expanded.length > 0
    ? '<div class="rag-expansion">🔤 查询扩展：<b>' + escHtml(query) + '</b> → ' + expansion.terms.map(function(t) { return '<span class="expand-tag">' + escHtml(t) + '</span>'; }).join(' ') + '</div>'
    : '';
  sourcesEl.innerHTML = expandHtml + '<div class="rag-searching">🔍 正在检索中...</div>';
  reportEl.innerHTML = '<div class="rag-searching">⏳ 等待检索完成...</div>';
  await new Promise(function(r) { setTimeout(r, 800); });
  const results = searchNews(query);
```

### Step 5: 在 CSS 中加入扩展标签样式

在 `</style>` 前插入：
```css
/* RAG 升级：查询扩展 */
.rag-expansion { font-size:11px; color:var(--text-sec); padding:8px; background:rgba(79,143,255,0.06); border-radius:var(--radius-sm); margin-bottom:8px; line-height:1.8; }
.expand-tag { display:inline-block; background:rgba(79,143,255,0.12); color:var(--accent); padding:1px 6px; border-radius:8px; margin:1px 2px; font-size:10px; }
```

### Step 6: Commit
```bash
git add tools/stock/index.html
git commit -m "feat: RAG Tab3 升级 - 金融同义词查询扩展（对应简历同义词对齐机制）"
```

### 验证
- FINANCE_SYNONYMS 对象存在
- expandQuery 函数存在
- searchNews 函数使用 expandQuery
- 输入「茅台」后左栏顶部显示扩展词 tag
- commit 成功

---

## Task 2：数据分级标注（Source Tiering）

**Files:** `tools/stock/index.html`

**目标：** NEWS_DB 每条数据加 tier 字段，检索结果显示来源级别标签 + 时间戳，对应简历「数据溯源与分级标注」。

### Step 1: 读取文件
用 Read tool 读取文件，找到 `const NEWS_DB = [` 的完整内容（8 条数据）。

### Step 2: 替换 NEWS_DB，加入 tier 和 source 字段

用 Edit tool 将整个 NEWS_DB 数组替换为带 tier 字段的版本：

```js
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
```

### Step 3: 修改检索结果渲染，加入分级标签

找到 runRAG 中渲染 `sourcesEl.innerHTML` 的这段（从 `sourcesEl.innerHTML = results.map` 开始到 `.join('')`），用 Edit tool 替换为：

```js
  const tierConfig = {
    official:   { label: '官方权威', color: 'var(--accent-green)', bg: 'rgba(0,229,160,0.10)' },
    mainstream: { label: '主流媒体', color: 'var(--accent)',       bg: 'rgba(79,143,255,0.10)' },
    unverified: { label: '待核实',   color: 'orange',              bg: 'rgba(255,165,0,0.10)' }
  };
  sourcesEl.innerHTML = expandHtml + results.map(function(n, i) {
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
```

**注意：** 上面代码引用了 `expandHtml` 变量，该变量在 Task 1 的 runRAG 修改中已定义。如果 Task 1 未执行，需要在此段代码前先加 `const expandHtml = '';`。

### Step 4: 修改研报尾部，强制标注来源时间戳

找到 runRAG 中 `reportEl.innerHTML = '<div class="rag-report-content">'` 这段，将研报来源行：
```js
      + '<div class="rag-report-sources"><b>检索来源：</b>' + results.map(function(n,i){ return '[' + (i+1) + '] ' + escHtml(n.title); }).join('；') + '</div>'
```
替换为：
```js
      + '<div class="rag-report-sources"><b>检索来源：</b>' + results.map(function(n,i){ const tc = tierConfig[n.tier] || tierConfig.unverified; return '[' + (i+1) + '] ' + escHtml(n.title) + ' <span class="tier-badge" style="color:' + tc.color + ';background:' + tc.bg + '">' + tc.label + '</span> · ' + escHtml(n.source) + ' · ' + escHtml(n.date); }).join('<br/>') + '</div>'
```

### Step 5: 在 CSS 中加入分级标签样式

在 `</style>` 前插入：
```css
/* RAG 升级：数据分级标注 */
.tier-badge { font-size:10px; padding:1px 6px; border-radius:8px; font-weight:600; margin-right:4px; }
.rag-source-meta-row { display:flex; align-items:center; gap:4px; margin-bottom:4px; }
.rag-source-meta { font-size:10px; color:var(--text-muted); }
```

### Step 6: Commit
```bash
git add tools/stock/index.html
git commit -m "feat: RAG Tab3 升级 - 数据分级标注（官方权威/主流媒体/待核实 + 来源时间戳）"
```

### 验证
- NEWS_DB 每条数据有 tier 和 source 字段
- 检索结果显示彩色分级标签
- 研报来源列表显示 tier + source + date
- commit 成功

---

## Task 3：LLM Reranking 可视化（Retrieve → Rerank → Generate）

**Files:** `tools/stock/index.html`

**目标：** 粗检 top-6 后用 LLM 精排，UI 展示排序前后变化 + 精排理由，对应简历「召回精度评估方案」。

### Step 1: 读取文件
用 Read tool 读取文件，找到 `async function runRAG()` 的完整内容。

### Step 2: 添加 rerankResults 函数

在 `async function runRAG()` 之前（即 `const NEWS_DB` 代码区域末尾）插入：

```js
async function rerankResults(query, candidates) {
  const systemPrompt = '你是金融信息相关性评估专家。对候选新闻与查询的相关性打分，输出严格JSON数组，无其他文字。格式：[{"id":数字,"score":0到1的小数,"reason":"10字以内的判断理由"}]';
  const userContent = '查询：' + query + '\n\n候选新闻：\n' + candidates.map(function(n, i) {
    return '[' + n.id + '] ' + n.title + '（' + n.date + '，' + n.stock + '）';
  }).join('\n');
  try {
    const resp = await callLLM(systemPrompt, userContent);
    const parsed = JSON.parse(resp.replace(/```json?\s*/gi,'').replace(/```/g,'').trim());
    // 将精排分数合并回候选列表
    return candidates.map(function(n) {
      const ranked = parsed.find(function(r) { return r.id === n.id; });
      return Object.assign({}, n, {
        rerankScore: ranked ? ranked.score : n.score,
        rerankReason: ranked ? ranked.reason : '',
        origRank: candidates.indexOf(n) + 1
      });
    }).sort(function(a, b) { return b.rerankScore - a.rerankScore; });
  } catch(e) {
    // 精排失败，返回原顺序
    return candidates.map(function(n) { return Object.assign({}, n, { rerankScore: n.score, rerankReason: '', origRank: candidates.indexOf(n) + 1 }); });
  }
}
```

### Step 3: 修改 runRAG，加入三阶段流程

找到 runRAG 中的以下内容：
```js
  const results = searchNews(query);
  if (results.length === 0) {
```

替换为：
```js
  // Retrieve 阶段：粗检 top-6
  const candidates = searchNews(query, 6);
  if (candidates.length === 0) {
```

然后找到 `sourcesEl.innerHTML = expandHtml + results.map` 改为 `sourcesEl.innerHTML = expandHtml + candidates.map`（此处仅先展示粗检结果，后续被精排结果覆盖）。

紧接着在 `sourcesEl.innerHTML = expandHtml + candidates.map(...)...join('');` 之后，找到：
```js
  reportEl.innerHTML = '<div class="rag-searching">🤖 AI 正在撰写研报...</div>';
  const context = results.map(...)
```
替换为：
```js
  // Rerank 阶段：LLM 精排
  sourcesEl.innerHTML = expandHtml + '<div class="rag-searching">🧠 LLM 精排中（Reranking）...</div>';
  reportEl.innerHTML = '<div class="rag-searching">⏳ 等待精排完成...</div>';
  const reranked = await rerankResults(query, candidates);
  const results = reranked.slice(0, 3);

  // 渲染精排后结果（含排序变化）
  const tierConfig = {
    official:   { label: '官方权威', color: 'var(--accent-green)', bg: 'rgba(0,229,160,0.10)' },
    mainstream: { label: '主流媒体', color: 'var(--accent)',       bg: 'rgba(79,143,255,0.10)' },
    unverified: { label: '待核实',   color: 'orange',              bg: 'rgba(255,165,0,0.10)' }
  };
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
```

**注意：** 此处还需要删掉 Task 2 中定义的 `const tierConfig`（因为现在已提前定义），以避免重复声明。执行时先用 Grep 确认 tierConfig 在 runRAG 中的定义位置，确保只有一处。

### Step 4: 在 CSS 中加入精排样式

在 `</style>` 前插入：
```css
/* RAG 升级：Reranking */
.rerank-header { font-size:11px; color:var(--accent-purple); padding:6px 8px; background:rgba(155,109,255,0.08); border-radius:var(--radius-sm); margin-bottom:8px; }
.rerank-reason { font-size:10px; color:var(--accent-purple); padding:2px 0 4px 0; }
.rank-up { font-size:10px; color:var(--accent-green); font-weight:700; margin:0 3px; }
.rank-down { font-size:10px; color:var(--accent-red); font-weight:700; margin:0 3px; }
.rank-same { font-size:10px; color:var(--text-muted); margin:0 3px; }
```

### Step 5: Commit
```bash
git add tools/stock/index.html
git commit -m "feat: RAG Tab3 升级 - LLM Reranking 可视化（Retrieve→Rerank→Generate 三阶段）"
```

### 验证
- rerankResults 函数存在
- 检索结果显示 ↑↓ 排序变化标签
- 每条结果显示精排理由
- 顶部显示「Reranking 完成 · 粗检6→精排3」
- commit 成功

---

## Task 4：双层知识库 UI（实时市场库 + 私有知识库）

**Files:** `tools/stock/index.html`

**目标：** 左侧知识库栏改为双 Tab，添加私有知识库上传功能，对应简历「双层知识库设计」。

### Step 1: 读取文件
用 Read tool 读取文件，找到：
1. `id="tab-report"` 的 HTML 内容（左侧 rag-left 区域）
2. `</style>` 位置

### Step 2: 替换 rag-left 区域

找到以下内容：
```html
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
        <div class="rag-why-body">LLM 训练数据有截止日期，无法获知最新市场动态。RAG 通过检索实时知识库，让模型看到最新信息，同时保持引用可溯源，满足金融场景的合规要求。</div>
      </div>
    </div>
```

用 Edit tool 替换为：

```html
    <div class="rag-left">
      <div class="rag-left-title">
        📚 知识库
        <span class="rag-db-info">双层架构 🎭</span>
      </div>
      <div class="kb-tabs">
        <button class="kb-tab-btn active" onclick="switchKbTab('market')" id="kbTabMarket">📡 实时市场库</button>
        <button class="kb-tab-btn" onclick="switchKbTab('private')" id="kbTabPrivate">🗂️ 私有知识库</button>
      </div>
      <div class="kb-tab-panel active" id="kbPanelMarket">
        <div class="kb-meta">自动同步 · 财报/新闻/政策 · 10+ 数据源 · 🎭 模拟</div>
        <div class="rag-left-body" id="ragSources">
          <div class="rag-placeholder">等待检索...</div>
        </div>
      </div>
      <div class="kb-tab-panel" id="kbPanelPrivate">
        <div class="kb-meta">上传分析师行业报告与历史研报</div>
        <textarea class="kb-upload-area" id="privateKbInput" placeholder="粘贴研报或行业报告内容（支持多段，用空行分隔）..."></textarea>
        <button class="kb-upload-btn" onclick="addToPrivateKb()">+ 加入知识库</button>
        <div class="kb-private-list" id="privateKbList">
          <div class="rag-placeholder">暂无私有文档</div>
        </div>
      </div>
      <div class="rag-why">
        <div class="rag-why-title">💡 双层知识库设计</div>
        <div class="rag-why-body">实时市场库：自动同步24小时内财报/新闻/政策动态，覆盖市场反应窗口期；私有知识库：支持分析师上传历史研报，联合召回兼顾时效性与深度。</div>
      </div>
    </div>
```

### Step 3: 在 JS 中添加双层知识库逻辑

在 `</script>` 前插入：

```js
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
  // 切换到私有 Tab 展示
  switchKbTab('private');
}

function renderPrivateKbList() {
  const el = document.getElementById('privateKbList');
  if (!PRIVATE_KB.length) {
    el.innerHTML = '<div class="rag-placeholder">暂无私有文档</div>';
    return;
  }
  el.innerHTML = PRIVATE_KB.map(function(doc, i) {
    return '<div class="private-doc-item">'
      + '<div class="private-doc-title">📄 ' + escHtml(doc.title) + '</div>'
      + '<div class="private-doc-meta">' + escHtml(doc.date) + ' · ' + doc.content.length + '字</div>'
      + '</div>';
  }).join('');
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
```

### Step 4: 修改 runRAG，合并双库检索结果

找到 runRAG 中的：
```js
  const candidates = searchNews(query, 6);
```
替换为：
```js
  // 双层知识库联合召回
  const marketResults = searchNews(query, 5);
  const privateResults = searchPrivateKb(query, 2);
  const candidates = marketResults.concat(privateResults).slice(0, 6);
```

### Step 5: 在 CSS 中加入双层知识库样式

在 `</style>` 前插入：
```css
/* RAG 升级：双层知识库 */
.kb-tabs { display:flex; border-bottom:1px solid var(--border); flex-shrink:0; }
.kb-tab-btn { flex:1; padding:6px 8px; font-size:11px; background:none; border:none; border-bottom:2px solid transparent; color:var(--text-muted); cursor:pointer; transition:var(--transition); }
.kb-tab-btn.active { color:var(--accent); border-bottom-color:var(--accent); }
.kb-tab-panel { display:none; flex-direction:column; flex:1; overflow:hidden; }
.kb-tab-panel.active { display:flex; }
.kb-meta { font-size:10px; color:var(--text-muted); padding:5px 10px; background:rgba(255,255,255,0.02); border-bottom:1px solid var(--border); }
.kb-upload-area { flex-shrink:0; margin:8px; height:80px; padding:8px; background:var(--bg); border:1px solid var(--border); border-radius:var(--radius-sm); color:var(--text); font-size:11px; resize:none; outline:none; font-family:inherit; }
.kb-upload-btn { margin:0 8px 8px; padding:5px 10px; background:rgba(79,143,255,0.12); border:1px solid var(--accent); border-radius:var(--radius-sm); color:var(--accent); font-size:11px; cursor:pointer; }
.kb-private-list { flex:1; overflow-y:auto; padding:8px; }
.private-doc-item { background:var(--card); border:1px solid var(--border); border-radius:var(--radius-sm); padding:6px 8px; margin-bottom:4px; }
.private-doc-title { font-size:11px; font-weight:500; margin-bottom:2px; }
.private-doc-meta { font-size:10px; color:var(--text-muted); }
```

### Step 6: Commit
```bash
git add tools/stock/index.html
git commit -m "feat: RAG Tab3 升级 - 双层知识库 UI（实时市场库 + 私有知识库联合召回）"
```

### 验证
- 左侧出现「实时市场库」和「私有知识库」两个 Tab
- 私有知识库 Tab 有文本输入框和「加入知识库」按钮
- 粘贴文本后能看到文档列表
- 联合召回：有私有文档时会合并检索结果
- commit 成功

---

## Task 5：最终验证 + Commit 汇总

### Step 1: 检查所有升级点
用 Grep 验证：
- `FINANCE_SYNONYMS` 存在
- `expandQuery` 存在
- `rerankResults` 存在
- `PRIVATE_KB` 存在
- `switchKbTab` 存在
- `.tier-badge` CSS 存在
- `.rerank-header` CSS 存在
- `.kb-tabs` CSS 存在

### Step 2: 查看 git log 确认 4 个 commit 都在

```bash
git log --oneline -6
```

### Step 3: 无需额外 commit，Task 1-4 已各自 commit
