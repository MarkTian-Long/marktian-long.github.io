# ASCI 科研任务执行系统 Demo — 实现计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 在 `tools/asci/index.html` 实现一个可独立运行的三屏交互 Demo，展示 ASCI 科研 Agent 的完整工作流（任务提交 → 执行过程 → 结果评估），并注册到主页面 PM 作品分组。

**Architecture:** 单文件纯前端，CSS 变量自包含（`--asci-*` 前缀），JS 内联。三屏通过 `showScreen(n)` 切换，Screen2 核心是 5 步任务树 + 终端日志 + 状态面板三列同屏，所有数据 Mock 预置，不接 API。因文件预估 ~1150 行，用 `tools/asci/gen_index.js` 脚本生成 `index.html`，生成后立即删除脚本。

**Tech Stack:** HTML5 + CSS3 + Vanilla JS，零依赖，`node` 执行生成脚本，浏览器直接打开验证。

---

## Task 1：创建工具目录 + README

**Files:**
- Create: `tools/asci/README.md`

**Step 1: 创建目录**

```bash
mkdir tools/asci
```

**Step 2: 用 Write 工具创建 `tools/asci/README.md`**

内容：

```markdown
# ASCI 科研任务执行系统 Demo

## 功能描述
模拟 ASCI（Artificial Science Intelligence）科研 Agent OS 的任务执行全流程：
文献综述任务从关键词提取 → 数据库检索 → 摘要筛选（Human Checkpoint）→ 全文精读 → 综述生成，
展示风险分级标注、可信度评估、Human-in-the-Loop 等核心产品设计能力。

## 数据来源
纯 Mock 数据，无 API 调用，所有数据内嵌于 index.html 的 JS 常量中。

## 文件结构
- `index.html` — 单文件完整实现（Screen 1/2/3 三屏）

## 面试题覆盖
- Q1：风险标注（低/中/高 + 颜色体系）
- Q3：可信度评分（三维度条形图）
- Q4：Human-in-the-Loop（Step 3 Checkpoint 内联卡片）

## 维护指南
修改 Mock 数据：编辑 index.html 中 MOCK_STEPS、MOCK_LOGS、MOCK_RESULT 常量。
新增演示路径：复制文献综述卡片逻辑，接入新的步骤/日志数据集。
```

**Step 3: 验证文件已创建**

读取 `tools/asci/README.md` 确认内容正确。

**Step 4: Commit**

```bash
git add tools/asci/README.md
git commit -m "chore(asci): 初始化工具目录和 README"
```

---

## Task 2：编写生成脚本 gen_index.js

**Files:**
- Create: `tools/asci/gen_index.js`

因 index.html 预估超过 300 行，通过 Node.js 脚本生成，生成后立即删除脚本。

**整体脚本结构：**

```js
const fs = require('fs');
const path = require('path');

const MOCK_STEPS = [ /* 5 步数据，见下方规格 */ ];
const CONF_BY_STEP = [95, 88, 82, 75, 78];
const MOCK_RESULT = { /* 结果数据，见下方规格 */ };

const CSS = `/* 完整 CSS */`;
const HTML_TEMPLATE = `<!DOCTYPE html>...`; // 含占位符 /*__CSS__*/ /*__JS__*/
const JS = `/* 完整 JS 逻辑 */`;

const output = HTML_TEMPLATE
  .replace('/*__CSS__*/', CSS)
  .replace('/*__JS__*/', JS);

fs.writeFileSync(path.join(__dirname, 'index.html'), output, 'utf-8');
console.log('Generated tools/asci/index.html (' + output.length + ' chars)');
```

**Mock 数据规格（MOCK_STEPS）：**

```js
const MOCK_STEPS = [
  {
    id: 1, icon: '🔑', name: '关键词提取', risk: 'low', riskLabel: '低风险',
    tools: ['NLP Parser', 'MeSH API'],
    subs: ['主题词拆解', 'MeSH 术语映射'],
    logs: [
      { level: 'INFO', text: '解析任务描述：Transformer in Drug Discovery' },
      { level: 'INFO', text: '提取核心主题词：Transformer, Drug Discovery, Molecular Property' },
      { level: 'INFO', text: '调用 MeSH API 映射标准术语 (3 terms)' },
      { level: 'INFO', text: '✓ 关键词提取完成，共 8 个检索词' },
    ]
  },
  {
    id: 2, icon: '🔍', name: '数据库检索', risk: 'low', riskLabel: '低风险',
    tools: ['PubMed API', 'Semantic Scholar', 'Deduplicator'],
    subs: ['PubMed 检索', 'Semantic Scholar 检索', '去重合并'],
    logs: [
      { level: 'INFO', text: '查询 PubMed：Transformer AND Drug Discovery [2018:2024]' },
      { level: 'INFO', text: 'PubMed 返回 142 条记录' },
      { level: 'INFO', text: '查询 Semantic Scholar API (top_k=200)' },
      { level: 'INFO', text: 'Semantic Scholar 返回 198 条记录' },
      { level: 'INFO', text: '去重合并：340 → 276 篇（移除 64 条重复）' },
      { level: 'INFO', text: '✓ 数据库检索完成，候选文献 276 篇' },
    ]
  },
  {
    id: 3, icon: '📋', name: '摘要筛选', risk: 'medium', riskLabel: '中风险', checkpoint: true,
    tools: ['Relevance Scorer', 'Threshold Filter'],
    subs: ['相关性打分', '阈值过滤', '👤 Human Checkpoint'],
    logs: [
      { level: 'INFO', text: '对 276 篇文献进行相关性评分（模型：SciBERT-ft）' },
      { level: 'INFO', text: '评分完成，阈值 0.72 过滤后剩余 21 篇' },
      { level: 'WARN', text: '3 篇文献置信度处于边界区间 [0.72–0.75]，触发 Human Checkpoint' },
      { level: 'INFO', text: '⏸ 等待人工确认边界文献...' },
    ]
  },
  {
    id: 4, icon: '📖', name: '全文精读', risk: 'high', riskLabel: '高风险',
    tools: ['PDF Parser', 'Method Extractor', 'Contradiction Detector'],
    subs: ['方法论提取', '关键发现提取', '矛盾检测'],
    logs: [
      { level: 'INFO', text: '下载全文 PDF (21 篇)，解析文档结构' },
      { level: 'INFO', text: '提取方法论章节：21/21 篇' },
      { level: 'INFO', text: '识别关键发现：共 47 条 findings' },
      { level: 'WARN', text: '发现潜在矛盾：Liu et al.(2022) 与 Wang et al.(2023) 在 AUROC 指标上结论相悖' },
      { level: 'INFO', text: '矛盾已标注，待综述生成时人工复核' },
      { level: 'INFO', text: '✓ 全文精读完成' },
    ]
  },
  {
    id: 5, icon: '✍️', name: '综述生成', risk: 'medium', riskLabel: '中风险',
    tools: ['Outline Generator', 'Para Writer', 'Citation Inserter'],
    subs: ['生成大纲', '段落撰写', '引用插入'],
    logs: [
      { level: 'INFO', text: '根据 47 条 findings 生成综述大纲（5 节）' },
      { level: 'INFO', text: '撰写各段落，自动插入 APA 引用格式' },
      { level: 'INFO', text: '引用文献 21 篇，精选核心 6 篇进入摘要层' },
      { level: 'INFO', text: '✓ 综述生成完成，总字数约 2400 字' },
    ]
  },
];
```

**Mock 数据规格（MOCK_RESULT）：**

```js
const MOCK_RESULT = {
  title: 'Transformer 架构在药物发现中的应用综述',
  abstract: 'Transformer 架构自 2017 年提出以来，凭借其自注意力机制在自然语言处理领域取得突破性进展，并迅速渗透至生物医学与药物发现领域。本综述系统梳理了 2018–2024 年间 Transformer 在分子属性预测、药物-靶点相互作用识别、从头分子生成及多组学数据整合四个核心场景中的应用进展，汇总分析 21 篇高质量文献，重点探讨模型架构演化路径、基准数据集选取策略及临床转化瓶颈。',
  findings: [
    '预训练 Transformer（如 ChemBERTa、MolBERT）在分子属性预测任务上平均 AUROC 提升 8.3%，优于传统 ECFP 指纹方法。',
    '药物-靶点相互作用（DTI）任务中，Transformer 双编码器架构在 BindingDB 数据集 AUROC 达 0.924，显著优于图神经网络基线。',
    '从头分子生成领域，基于 Transformer 的 REINVENT 变体在 QED × SA 综合指标上表现最优，但 3D 构象生成准确性仍有较大提升空间。',
  ],
  sources: [
    { title: 'Attention Is All You Need', authors: 'Vaswani et al.', year: 2017, journal: 'NeurIPS', score: 9.2 },
    { title: 'ChemBERTa: Large-Scale Self-Supervised Pretraining', authors: 'Chithrananda et al.', year: 2020, journal: 'arXiv / Nature MI', score: 8.8 },
    { title: 'MolBERT: Molecular Property Prediction', authors: 'Fabian et al.', year: 2020, journal: 'ICLR workshop', score: 8.5 },
    { title: 'Transformer-based DTI Prediction', authors: 'Liu et al.', year: 2022, journal: 'Bioinformatics (SCI Q1)', score: 8.3 },
    { title: 'REINVENT 2.0 with Transformer Prior', authors: 'Blaschke et al.', year: 2020, journal: 'J. Chem. Inf. Model. (SCI Q1)', score: 7.9 },
    { title: 'Multi-omics Integration via Transformer', authors: 'Wang et al.', year: 2023, journal: 'Nature Methods (SCI Q1)', score: 7.6 },
  ],
  credibility: {
    sourceQuality: { score: 8.5, note: '87% 文献来自 SCI Q1 期刊，核心论文高被引（>500 次）' },
    reasoning:     { score: 7.8, note: '推理链路清晰，结论均有文献支撑，逻辑一致' },
    consistency:   { score: 7.2, note: 'Liu(2022) 与 Wang(2023) AUROC 指标存在 0.06 差异，已标注' },
    overall: 7.8,
    suggestion: '综合评分 7.8/10。建议对全文精读步骤中检测到的矛盾标注（Liu vs Wang AUROC）进行人工复核后再提交。',
  }
};
```

**CSS 规格（关键部分）：**

```css
:root {
  --asci-bg: #080c18;
  --asci-surface: #0d1224;
  --asci-log-bg: #0a0e1a;
  --asci-border: rgba(79, 143, 255, 0.15);
  --asci-blue: #4f8fff;
  --asci-green: #34d399;
  --asci-yellow: #fbbf24;
  --asci-red: #f87171;
  --asci-text: #e2e8f0;
  --asci-text-dim: #94a3b8;
  --asci-radius: 12px;
  --asci-radius-sm: 6px;
}

/* 三列布局 */
.asci-execution {
  display: grid;
  grid-template-columns: 220px 1fr 280px;
  grid-template-rows: 1fr auto;
  height: calc(100vh - 52px);  /* 减去 topbar */
  overflow: hidden;
}
.asci-controls { grid-column: 1 / -1; }

/* 置信度圆环 */
.confidence-ring {
  width: 80px; height: 80px;
  border-radius: 50%;
  background: conic-gradient(var(--asci-blue) calc(var(--pct, 0) * 1%), #1e2840 0);
  display: flex; align-items: center; justify-content: center;
  position: relative;
}
.confidence-ring::after {
  content: ''; position: absolute;
  width: 60px; height: 60px;
  border-radius: 50%;
  background: var(--asci-surface);
  border-radius: 50%;
}
.conf-num { position: relative; z-index: 1; font-size: 13px; font-weight: 700; color: var(--asci-blue); }

/* 动画 */
@keyframes pulse-dot { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.5;transform:scale(1.5)} }
@keyframes log-in { from{opacity:0;transform:translateY(4px)} to{opacity:1;transform:translateY(0)} }
.status-dot { width:8px; height:8px; border-radius:50%; display:inline-block; }
.status-dot.running { animation: pulse-dot 1s infinite; background: var(--asci-blue); }
.status-dot.done    { background: var(--asci-green); }
.status-dot.pending { background: #334155; }
.log-line { animation: log-in 0.25s ease forwards; }
```

**HTML 骨架规格（Screen 2 关键结构）：**

```html
<!-- Screen 2 -->
<div id="screen2" class="asci-screen hidden">
  <div class="asci-topbar">
    <span>📚 文献综述 · Transformer in Drug Discovery</span>
    <span class="asci-badge-task">任务执行中</span>
  </div>
  <div class="asci-execution">
    <div class="asci-tree" id="taskTree"><!-- renderTree() 注入 --></div>
    <div class="asci-log-wrap">
      <div class="log-header">执行日志 · Agent Runtime</div>
      <div class="asci-log" id="logPanel">
        <div id="logBody"></div>
        <!-- Checkpoint 内联卡片 -->
        <div class="checkpoint-card hidden" id="checkpointCard">
          <div class="cp-title">👤 Human Checkpoint — 摘要筛选质量确认</div>
          <div class="cp-body">
            <p>AI 已筛选 <strong>21 篇</strong>摘要（阈值 0.72），其中 <strong>3 篇</strong>置信度处于边界区间 [0.72–0.75]，建议人工确认。</p>
            <div class="cp-papers">
              <div class="cp-paper">📄 Attention Is All You Need (2017) — 相关性 0.74</div>
              <div class="cp-paper">📄 Drug-Target Interaction via Transformer (2021) — 相关性 0.73</div>
              <div class="cp-paper">📄 Molecular Graph Transformer (2022) — 相关性 0.72</div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="asci-panel" id="statusPanel">
      <div class="panel-section">
        <div class="panel-label">置信度</div>
        <div class="confidence-ring" id="confRing" style="--pct:95">
          <span class="conf-num" id="confNum">95%</span>
        </div>
      </div>
      <div class="panel-section">
        <div class="panel-label">进度</div>
        <div class="progress-bar-wrap"><div class="progress-bar" id="progressBar" style="width:0%"></div></div>
        <div class="progress-text" id="progressText">步骤 0 / 5</div>
      </div>
      <div class="panel-section">
        <div class="panel-label">当前步骤</div>
        <div class="step-name" id="stepName">—</div>
        <div class="step-risk" id="stepRisk"></div>
        <div class="step-tools" id="stepTools"></div>
      </div>
    </div>
    <div class="asci-controls">
      <button class="asci-btn-next" id="nextBtn" onclick="handleNext()">▶ 执行下一步</button>
      <span class="ctrl-progress" id="ctrlProgress">准备就绪</span>
    </div>
  </div>
</div>
```

**JS 逻辑规格（核心函数伪码）：**

```js
let currentStep = 0;
let isRunning = false;
let awaitingCheckpoint = false;

function showScreen(n) {
  document.querySelectorAll('.asci-screen').forEach(s => s.classList.add('hidden'));
  document.getElementById('screen' + n).classList.remove('hidden');
}

function startTask() { showScreen(2); renderTree(); }

function renderTree() {
  // 遍历 MOCK_STEPS，每个步骤渲染：图标+名称+风险标签+状态圆点
  // 已完成的展开子步骤，当前 running 的展开，其余折叠
  // checkpoint 步骤显示 👤 标记
}

function handleNext() {
  if (isRunning) return;
  if (awaitingCheckpoint) { confirmCheckpoint(); return; }
  if (currentStep >= 5) return;
  isRunning = true;
  runStep(currentStep + 1);
}

async function runStep(stepIdx) {
  currentStep = stepIdx;
  const step = MOCK_STEPS[stepIdx - 1];
  // 按钮灰化 + 文字"执行中..."
  // 左列节点切 running 状态
  updatePanel(stepIdx);
  renderTree();
  // 逐条打印日志（300-800ms 随机间隔）
  for (const log of step.logs) {
    await sleep(300 + Math.random() * 500);
    appendLog(log.level, log.text);
  }
  // checkpoint 判断
  if (step.checkpoint) {
    awaitingCheckpoint = true;
    document.getElementById('checkpointCard').classList.remove('hidden');
    document.getElementById('nextBtn').textContent = '✅ 确认并继续';
    document.getElementById('nextBtn').disabled = false;
    isRunning = false;
    return;
  }
  // 非 checkpoint：节点 done，更新面板
  setStepDone(stepIdx);
  updatePanel(stepIdx);
  renderTree();
  isRunning = false;
  document.getElementById('nextBtn').textContent = '▶ 执行下一步';
  document.getElementById('nextBtn').disabled = false;
  // 最后一步完成后跳 Screen 3
  if (stepIdx === 5) {
    setTimeout(() => showScreen(3), 400);
  }
}

function confirmCheckpoint() {
  document.getElementById('checkpointCard').classList.add('hidden');
  awaitingCheckpoint = false;
  setStepDone(3);
  updatePanel(3);
  renderTree();
  document.getElementById('nextBtn').textContent = '▶ 执行下一步';
  isRunning = false;
}

function setStepDone(idx) { /* 记录已完成步骤 */ }

function appendLog(level, text) {
  const ts = new Date().toTimeString().slice(0,8);
  const div = document.createElement('div');
  div.className = 'log-line log-' + level.toLowerCase();
  div.innerHTML = '<span class="log-ts">[' + ts + ']</span> <span class="log-lvl log-lvl-' + level.toLowerCase() + '">' + level + '</span> ' + text;
  document.getElementById('logBody').appendChild(div);
  document.getElementById('logPanel').scrollTop = 99999;
}

function updatePanel(stepIdx) {
  const pct = CONF_BY_STEP[stepIdx - 1];
  document.getElementById('confRing').style.setProperty('--pct', pct);
  document.getElementById('confNum').textContent = pct + '%';
  document.getElementById('progressBar').style.width = (stepIdx / 5 * 100) + '%';
  document.getElementById('progressText').textContent = '步骤 ' + stepIdx + ' / 5';
  const s = MOCK_STEPS[stepIdx - 1];
  document.getElementById('stepName').textContent = s.icon + ' ' + s.name;
  // 更新风险标签颜色和工具列表
}

function acceptResult() {
  showToast('✅ 结果已保存至知识库');
}
function restart() {
  currentStep = 0; isRunning = false; awaitingCheckpoint = false;
  document.getElementById('logBody').innerHTML = '';
  document.getElementById('checkpointCard').classList.add('hidden');
  document.getElementById('progressBar').style.width = '0%';
  showScreen(1);
}
function showToast(msg) {
  const t = document.createElement('div');
  t.className = 'asci-toast';
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 2500);
}
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
```

**Step 1: 将上述完整内容写入 gen_index.js**

注意：字符串模板中的反引号用 `\`` 转义，或整个 CSS/HTML/JS 用字符串拼接方式代替模板字符串。

**Step 2: 执行脚本生成 index.html**

```bash
node tools/asci/gen_index.js
```

期望输出：`Generated tools/asci/index.html (XXXXX chars)`

**Step 3: 验证生成文件**

```bash
# 检查行数（期望 900-1300 行）
wc -l tools/asci/index.html
```

然后 Read `tools/asci/index.html` 前 30 行，确认 `<!DOCTYPE html>` 和 `<head>` 结构正确。

**Step 4: 删除生成脚本**

```bash
rm tools/asci/gen_index.js
```

---

## Task 3：验证独立运行 + 修复问题

**Files:**
- Read: `tools/asci/index.html`

**Step 1: 检查三屏 ID 存在**

Grep `screen1|screen2|screen3` in `tools/asci/index.html`，确认三个 ID 均存在。

**Step 2: 检查 CSS 变量自包含**

Grep `--asci-bg` in `tools/asci/index.html`，确认 `:root` 定义在文件内。

**Step 3: 检查 favicon**

Grep `rel="icon"` in `tools/asci/index.html`，确认存在。

**Step 4: 检查无外部路径依赖**

Grep `../assets/` in `tools/asci/index.html`，确认无结果（工具自包含）。

**Step 5: 检查 Screen 2 高度不溢出**

Read `.asci-execution` 的 CSS，确认 `height: calc(100vh - 52px)` 且 `overflow: hidden`，避免 iframe 双滚动条。

**Step 6: 如有问题，用 Edit 精确修复**

每次 Edit 前先重新读取目标区域行号。

---

## Task 4：注册到主页面 PM 作品分组

**Files:**
- Modify: `index.html`

**Step 1: 读取 PM 作品卡片区域（234–302 行附近）**

确认 service-agent 卡片末尾的 `</div>` 位置（`.toolbox-cards` 闭合标签前）。

**Step 2: 在 service-agent 卡片之后、`.toolbox-cards` 闭合前插入 ASCI 卡片**

```html
                    <div class="toolbox-card" data-tool="asci" onclick="openTool('asci')">
                        <div class="toolbox-card-icon">🔬</div>
                        <div class="toolbox-card-body">
                            <h3>ASCI 科研任务执行系统</h3>
                            <p>模拟科研 Agent OS 全链路：关键词提取 → 数据库检索 → 摘要筛选（Human Checkpoint）→ 全文精读 → 综述生成</p>
                            <div class="toolbox-card-tags">
                                <span>风险分级</span><span>Human-in-the-Loop</span><span>可信度评估</span>
                            </div>
                        </div>
                        <div class="toolbox-card-highlights">
                            <div class="highlight-item">
                                <span class="hl-num">5 步全链路</span>
                                <span class="hl-label">端到端文献综述 Agent</span>
                            </div>
                            <div class="highlight-item">
                                <span class="hl-num">三维可信度</span>
                                <span class="hl-label">来源质量 / 推理链路 / 数据一致性</span>
                            </div>
                        </div>
                        <button class="toolbox-card-btn">体验 Demo →</button>
                    </div>
```

**Step 3: 读取 panel-service 区域（327–336 行附近）**

确认其闭合 `</div>` 后的位置（信息工具组 `<!-- 信息工具组 -->` 注释之前）。

**Step 4: 在 panel-service 闭合后追加 panel-asci**

```html
            <div class="tool-panel hidden" id="panel-asci">
                <div class="dashboard-wrapper reveal">
                    <div class="dashboard-topbar">
                        <span class="dashboard-label">🔬 ASCI 科研任务执行系统 · 5步全链路 Agent · Human-in-the-Loop + 可信度评估</span>
                        <a href="tools/asci/index.html" target="_blank" class="btn btn-ghost dashboard-open-btn">↗ 独立窗口打开</a>
                    </div>
                    <iframe src="tools/asci/index.html" class="dashboard-iframe"
                        title="ASCI 科研任务执行系统" loading="lazy"></iframe>
                </div>
            </div>
```

**Step 5: 读取修改后区域，确认 HTML 结构正确**

无多余/缺失闭合标签。

**Step 6: Commit**

```bash
git add tools/asci/README.md tools/asci/index.html index.html
git commit -m "feat(asci): 添加 ASCI 科研任务执行系统 Demo"
```

---

## Task 5：最终检查清单（new_tool_checklist）

按 `feedback_new_tool_checklist.md` 六项验证：

| # | 项目 | 检查命令 |
|---|------|---------|
| 1 | favicon | Grep `rel="icon"` in `tools/asci/index.html` |
| 2 | CSS 自包含 | Grep `--asci-bg` in `tools/asci/index.html`，确认在 `:root` 中定义 |
| 3 | iframe 高度 | Read CSS，确认 `.asci-execution` 有 `height: calc(100vh - ...)`，无 `height:100vh` 在根容器 |
| 4 | 独立运行 | Grep `../assets/` in `tools/asci/index.html`，应无结果 |
| 5 | 相对路径正确 | Grep `src="/"` in `tools/asci/index.html`，应无结果 |
| 6 | git add 确认 | `git status` 确认 tools/asci/ 已被追踪，无 untracked |

发现问题用 Edit 修复后重跑检查。

---

## 执行注意事项

1. **gen_index.js 字符串转义**：CSS/HTML/JS 内容如果用 JS 模板字符串（反引号），内部所有 `\`` 需转义为 `\\\``，`$` 需转义为 `\\$`（若不是模板插值）。建议关键段落用普通字符串拼接 `+` 避免转义地狱。
2. **Edit 前必读**：每次 Edit `index.html` 前重新读取目标 5 行区域，因上一步插入会使行号偏移。
3. **Screen 2 高度**：工具根 `<html>/<body>` 设 `height:100%; overflow:hidden`，`.asci-execution` 用 `height: calc(100vh - 52px)` 或对应高度，避免 iframe 双滚动条。
4. **Checkpoint 状态机**：Step 3 完成日志后进入 `awaitingCheckpoint=true`，不调用 `setStepDone(3)`；用户点"确认并继续"后才 `setStepDone(3)` 并继续下一步。
5. **Screen 3 跳转时机**：Step 5 所有日志打印完 + `setStepDone(5)` 后，`setTimeout(() => showScreen(3), 400)` 给视觉反馈时间再跳转。
6. **GitHub Secret**：本工具无 API Key，无需添加 Secret。
