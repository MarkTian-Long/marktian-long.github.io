# ASCI HITL 重设计实现计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 把 ASCI 文献综述 Demo 从"用户当观众"改为"用户是决策者"——每步 AI 产出都是建议，用户可审核、修改、决策后才继续。

**Architecture:** 在现有 Screen 2（执行过程）的基础上，为每个步骤新增"结果展示区"和"用户干预面板"；步骤完成后日志区下方插入结构化结果卡片，右侧面板切换为该步的操作控件；底部控制栏新增"← 回退"按钮，回退时弹窗确认并清除后续状态。风险标注重新绑定到交互强制程度（低=可跳过，中=建议审核，高=强制 Checkpoint）。

**Tech Stack:** 纯 HTML5 + CSS3 + Vanilla JS，零依赖，所有数据均为 Mock。文件只有一个：`tools/asci/index.html`（约 660 行），所有修改通过 Edit tool 整段替换。

---

## CEO Review 决策（2026-03-29，SELECTIVE EXPANSION 模式）

### 接受的 Cherry-pick
1. **Step 3 批量操作** — 边界文献结果卡片顶部加"全选纳入 / 全选排除 / 按评分排序"三个快捷按钮（约30行JS）
2. **右侧面板决策历史** — 每次用户完成人工判断后，右侧面板底部追加"已处置决策"小列表（Step+决策内容）
3. **Screen 3 人工决策摘要卡片** — 结果页新增一张卡片，列出3个关键决策及用户选择

### 必须修复（实现时同步修复）
- **XSS：** `addKeyword` 用户输入拼入 innerHTML 前必须 `escHtml()` 转义
- **回退锁定：** `handleBack()` 开头加 `if (isRunning) return;`；`runStep` 开始时禁用 backBtn，`finishStep` 后重新启用

### 建议同步加入（工作量均为 S）
- **用户操作日志：** `blDecide` / `contraDecide` / `add/removeKeyword` 各自调用 `appendLog` 记录用户决策
- **确认感：** Step 1（低风险）关键词有修改时，按钮文字改为"✓ 确认并继续"
- **关键词长度：** 输入框加 `maxlength=40`，防止视觉溢出
- **Task 8 验证清单补充：** 回退后重执行同步骤验证、Step 3 全部 Exclude 后解锁验证、XSS 修复验证、批量操作后逐篇覆盖一致性验证

### TODOS.md（P3，不阻塞本次）
- 将 `renderStepResult` 的 Mock 数据替换点提取为独立 `dataProvider` 层，未来接真实 API 只换 provider

### 删除过时变量
- `awaitingCheckpoint` 在新设计里已被 `updateNextBtnState` 取代，实现时可删除

---

## 改动总览

| 区域 | 改动内容 |
|------|---------|
| Mock 数据 | 为每步新增 `result` 字段（结构化产出）；Checkpoint 文献增加 per-paper 决策状态 |
| 风险标注逻辑 | 低→展示结果可跳过；中→必须展开结果确认；高→强制逐项决策 |
| 日志区 | 步骤完成后追加"步骤结果卡片"（不替换日志，附加在下方） |
| 右侧面板 | 步骤运行中显示工具列表；步骤完成后切换为该步的操作控件 |
| 底部控制栏 | 新增"← 上一步"按钮；回退时弹窗确认 |
| 状态管理 | 新增 `stepResults[]` 数组保存每步的用户决策；回退时清除后续项 |
| CSS | 新增结果卡片、操作控件、回退按钮、矛盾对比卡片等样式 |

---

## Task 1：重新定义 Mock 数据结构

**文件：** `tools/asci/index.html`，`MOCK_STEPS` 变量（当前第372行）

**目标：** 为每步添加 `result` 字段，描述该步完成后的结构化产出，供结果卡片渲染使用。

**Step 1：定位 MOCK_STEPS 变量**

在文件中搜索 `var MOCK_STEPS`，确认位于约第372行。

**Step 2：替换 MOCK_STEPS 为新版（含 result 字段）**

将整个 `var MOCK_STEPS = [...];` 替换为：

```javascript
var MOCK_STEPS = [
  {
    id: 1, icon: '🔑', name: '关键词提取', risk: 'low', riskLabel: '低风险',
    tools: ['NLP Parser', 'MeSH API'],
    subs: ['主题词拆解', 'MeSH 术语映射'],
    logs: [
      {level:'INFO', text:'解析任务描述：Transformer in Drug Discovery'},
      {level:'INFO', text:'提取核心主题词：Transformer, Drug Discovery, Molecular Property'},
      {level:'INFO', text:'调用 MeSH API 映射标准术语 (3 terms)'},
      {level:'INFO', text:'✓ 关键词提取完成，共 8 个检索词'}
    ],
    result: {
      type: 'keywords',
      keywords: [
        {term: 'Transformer', mesh: 'Neural Networks, Computer', editable: true},
        {term: 'Drug Discovery', mesh: 'Drug Discovery', editable: true},
        {term: 'Molecular Property', mesh: 'Molecular Structure', editable: true},
        {term: 'Self-Attention', mesh: null, editable: true},
        {term: 'SMILES', mesh: 'Drug Design', editable: true},
        {term: 'Protein-Ligand', mesh: 'Ligands', editable: true},
        {term: 'Deep Learning', mesh: 'Deep Learning', editable: true},
        {term: 'Binding Affinity', mesh: 'Protein Binding', editable: true}
      ],
      hint: '可删除不相关词，或添加遗漏的领域术语。确认后进入数据库检索。'
    }
  },
  {
    id: 2, icon: '🔍', name: '数据库检索', risk: 'low', riskLabel: '低风险',
    tools: ['PubMed API', 'Semantic Scholar', 'Deduplicator'],
    subs: ['PubMed 检索', 'Semantic Scholar 检索', '去重合并'],
    logs: [
      {level:'INFO', text:'查询 PubMed：Transformer AND Drug Discovery [2018:2024]'},
      {level:'INFO', text:'PubMed 返回 142 条记录'},
      {level:'INFO', text:'查询 Semantic Scholar API (top_k=200)'},
      {level:'INFO', text:'Semantic Scholar 返回 198 条记录'},
      {level:'INFO', text:'去重合并：340 → 276 篇（移除 64 条重复）'},
      {level:'INFO', text:'✓ 数据库检索完成，候选文献 276 篇'}
    ],
    result: {
      type: 'search',
      query: 'Transformer AND ("Drug Discovery" OR "Molecular Property") [2018:2024]',
      sources: [
        {name: 'PubMed', count: 142, color: '#4f8fff'},
        {name: 'Semantic Scholar', count: 198, color: '#9b6dff'},
        {name: '去重后合计', count: 276, color: '#34d399'}
      ],
      yearRange: {min: 2018, max: 2024, current: [2018, 2024]},
      hint: '可调整时间范围后点击"重新检索"，或直接确认当前结果。'
    }
  },
  {
    id: 3, icon: '📋', name: '摘要筛选', risk: 'medium', riskLabel: '中风险',
    checkpoint: true,
    tools: ['Relevance Scorer', 'Threshold Filter'],
    subs: ['相关性打分', '阈值过滤', '👤 Human Checkpoint'],
    logs: [
      {level:'INFO', text:'对 276 篇文献进行相关性评分（模型：SciBERT-ft）'},
      {level:'INFO', text:'评分完成，阈值 0.72 过滤后剩余 21 篇'},
      {level:'WARN', text:'3 篇文献置信度处于边界区间 [0.72–0.75]，触发 Human Checkpoint'},
      {level:'INFO', text:'⏸ 等待人工确认边界文献...'}
    ],
    result: {
      type: 'screening',
      threshold: 0.72,
      included: 18,
      borderline: [
        {id:'cp1', title:'Attention Is All You Need', authors:'Vaswani et al.', year:2017, score:0.74,
         abstract:'本文提出 Transformer 架构，完全基于注意力机制，摒弃了循环和卷积结构。在机器翻译任务上，模型质量更优，并行性更强，所需训练时间显著减少。该架构已成为现代 NLP 和药物发现 AI 的基础组件，其自注意力机制可高效捕获分子序列中的长程依赖关系。',
         decision: null},
        {id:'cp2', title:'Drug-Target Interaction via Transformer', authors:'Zhang et al.', year:2021, score:0.73,
         abstract:'本文将 Transformer 双编码器架构应用于药物-靶点相互作用（DTI）预测：蛋白质序列编码器 + SMILES 分子编码器，通过交叉注意力融合两路表示。在 BindingDB 和 Davis 数据集上，AUROC 达 0.924，优于 GNN 和 LSTM 基线。',
         decision: null},
        {id:'cp3', title:'Molecular Graph Transformer', authors:'Liu et al.', year:2022, score:0.72,
         abstract:'本文将图神经网络与 Transformer 注意力机制结合，提出 Molecular Graph Transformer（MGT），在分子属性预测任务中引入全局自注意力层以捕获远程原子交互。在 QM9 和 MoleculeNet 基准上，MGT 在多个属性预测任务上超越纯 GNN 方法。',
         decision: null}
      ],
      hint: '请对每篇边界文献做出判断后，调整阈值或确认纳入数量。'
    }
  },
  {
    id: 4, icon: '📖', name: '全文精读', risk: 'high', riskLabel: '高风险',
    tools: ['PDF Parser', 'Method Extractor', 'Contradiction Detector'],
    subs: ['方法论提取', '关键发现提取', '矛盾检测'],
    logs: [
      {level:'INFO', text:'下载全文 PDF (21 篇)，解析文档结构'},
      {level:'INFO', text:'提取方法论章节：21/21 篇'},
      {level:'INFO', text:'识别关键发现：共 47 条 findings'},
      {level:'WARN', text:'发现潜在矛盾：Liu et al.(2022) 与 Wang et al.(2023) 在 AUROC 指标上结论相悖'},
      {level:'INFO', text:'矛盾已标注，等待人工处置...'}
    ],
    result: {
      type: 'contradiction',
      findings: 47,
      contradiction: {
        metric: 'AUROC（BindingDB 数据集）',
        paperA: {
          title: 'Transformer-based DTI Prediction',
          authors: 'Liu et al., 2022',
          journal: 'Bioinformatics (SCI Q1)',
          value: '0.924',
          method: 'Transformer 双编码器 + 交叉注意力'
        },
        paperB: {
          title: 'Multi-omics Integration via Transformer',
          authors: 'Wang et al., 2023',
          journal: 'Nature Methods (SCI Q1)',
          value: '0.864',
          method: 'Transformer 跨模态注意力（多组学）'
        },
        options: [
          {id:'A', label:'采信 Liu 2022', reason:'同类任务基准更匹配'},
          {id:'B', label:'采信 Wang 2023', reason:'更新、期刊更高'},
          {id:'both', label:'两篇均纳入并标注争议', reason:'保留学术争议'},
          {id:'exclude', label:'排除两篇，仅用其他文献', reason:'矛盾无法调和'}
        ],
        decision: null
      },
      hint: '此为高风险步骤，矛盾文献必须人工处置后才能继续。'
    }
  },
  {
    id: 5, icon: '✍️', name: '综述生成', risk: 'medium', riskLabel: '中风险',
    tools: ['Outline Generator', 'Para Writer', 'Citation Inserter'],
    subs: ['生成大纲', '段落撰写', '引用插入'],
    logs: [
      {level:'INFO', text:'根据 47 条 findings 生成综述大纲（5 节）'},
      {level:'INFO', text:'撰写各段落，自动插入 APA 引用格式'},
      {level:'INFO', text:'引用文献 21 篇，精选核心 6 篇进入摘要层'},
      {level:'INFO', text:'✓ 综述生成完成，总字数约 2400 字'}
    ],
    result: {
      type: 'outline',
      sections: [
        {id:1, title:'引言：Transformer 架构概述', points:'自注意力机制原理；从 NLP 到生物医学的迁移路径', editable:true},
        {id:2, title:'分子属性预测应用', points:'ChemBERTa / MolBERT 预训练范式；MoleculeNet 基准对比', editable:true},
        {id:3, title:'药物-靶点相互作用识别', points:'双编码器架构；BindingDB / Davis 数据集结果', editable:true},
        {id:4, title:'从头分子生成', points:'REINVENT 变体；QED × SA 综合指标；3D 构象局限性', editable:true},
        {id:5, title:'局限性与未来方向', points:'可解释性不足；标注数据稀缺；多模态整合趋势', editable:true}
      ],
      hint: '可编辑节标题或调整论点描述，确认大纲后生成正文。'
    }
  }
];
```

**Step 3：同步删除旧的 CONF_BY_STEP（保持不变，仍然需要）**

`CONF_BY_STEP` 保留，不需要修改。

**Step 4：提交**
```bash
git add tools/asci/index.html
git commit -m "refactor(asci): 重构 MOCK_STEPS 添加每步 result 结构化字段"
```

---

## Task 2：新增 CSS 样式

**文件：** `tools/asci/index.html`，`</style>` 标签前（当前第193行）

**目标：** 为结果卡片、操作控件、矛盾对比卡片、回退按钮添加样式。

**Step 1：在 `</style>` 前插入以下 CSS**

```css
/* ---- STEP RESULT CARD（步骤结果卡片，插入日志区） ---- */
.step-result-card{margin:14px 0 4px;border:1px solid rgba(79,143,255,0.25);border-radius:8px;background:rgba(79,143,255,0.05);overflow:hidden;font-family:system-ui,sans-serif}
.src-header{padding:8px 14px;font-size:11px;font-weight:700;color:var(--asci-blue);letter-spacing:.06em;text-transform:uppercase;border-bottom:1px solid rgba(79,143,255,0.15);display:flex;align-items:center;justify-content:space-between}
.src-body{padding:12px 14px}
.src-hint{font-size:11px;color:var(--asci-text-muted);margin-top:10px;font-style:italic}

/* ---- KEYWORD TAGS ---- */
.kw-tags{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:8px}
.kw-tag{display:inline-flex;align-items:center;gap:4px;font-size:12px;padding:4px 10px;border-radius:99px;background:var(--asci-blue-dim);color:var(--asci-blue);border:1px solid rgba(79,143,255,0.25);cursor:default}
.kw-tag-mesh{font-size:10px;color:var(--asci-text-muted);margin-left:2px}
.kw-tag-del{background:none;border:none;color:var(--asci-text-muted);cursor:pointer;font-size:13px;line-height:1;padding:0 0 0 2px;transition:color .15s}
.kw-tag-del:hover{color:var(--asci-red)}
.kw-add-row{display:flex;gap:6px;margin-top:8px}
.kw-add-input{flex:1;padding:5px 10px;border-radius:6px;background:rgba(255,255,255,0.05);border:1px solid var(--asci-border2);color:var(--asci-text);font-size:12px;outline:none}
.kw-add-input:focus{border-color:var(--asci-blue)}
.kw-add-btn{padding:5px 12px;border-radius:6px;background:var(--asci-blue);color:#fff;border:none;cursor:pointer;font-size:12px;font-weight:600}

/* ---- SEARCH RESULT BARS ---- */
.search-bars{display:flex;flex-direction:column;gap:8px;margin-bottom:10px}
.search-bar-item{display:flex;align-items:center;gap:8px}
.search-bar-label{font-size:11px;color:var(--asci-text-dim);width:120px;flex-shrink:0}
.search-bar-track{flex:1;height:6px;background:#1e2840;border-radius:99px;overflow:hidden}
.search-bar-fill{height:100%;border-radius:99px}
.search-bar-count{font-size:12px;font-weight:700;color:var(--asci-text);width:32px;text-align:right;flex-shrink:0}
.search-query-box{background:rgba(255,255,255,0.03);border:1px solid var(--asci-border);border-radius:6px;padding:8px 10px;font-size:11px;color:var(--asci-text-dim);font-family:'Courier New',monospace;word-break:break-all;margin-bottom:10px}
.year-range-row{display:flex;align-items:center;gap:8px;margin-bottom:8px}
.year-range-label{font-size:11px;color:var(--asci-text-dim);flex-shrink:0}
.year-input{width:60px;padding:3px 6px;border-radius:4px;background:rgba(255,255,255,0.05);border:1px solid var(--asci-border2);color:var(--asci-text);font-size:12px;text-align:center;outline:none}
.year-input:focus{border-color:var(--asci-blue)}
.re-search-btn{padding:4px 12px;border-radius:6px;background:transparent;border:1px solid var(--asci-blue);color:var(--asci-blue);font-size:11px;cursor:pointer;transition:background .15s}
.re-search-btn:hover{background:var(--asci-blue-dim)}

/* ---- SCREENING / BORDERLINE PAPERS ---- */
.threshold-row{display:flex;align-items:center;gap:10px;margin-bottom:10px}
.threshold-label{font-size:11px;color:var(--asci-text-dim);flex-shrink:0}
.threshold-slider{flex:1;accent-color:var(--asci-blue)}
.threshold-val{font-size:13px;font-weight:700;color:var(--asci-blue);width:36px;text-align:right;flex-shrink:0}
.included-count{font-size:11px;color:var(--asci-green);margin-bottom:10px}
.borderline-list{display:flex;flex-direction:column;gap:6px}
.bl-paper{border:1px solid var(--asci-border);border-radius:6px;overflow:hidden}
.bl-paper-top{display:flex;align-items:center;gap:8px;padding:8px 10px;cursor:pointer;background:rgba(255,255,255,0.02)}
.bl-paper-top:hover{background:rgba(79,143,255,0.06)}
.bl-paper-title{flex:1;font-size:12px;font-weight:600;color:var(--asci-text)}
.bl-paper-score{font-size:11px;padding:2px 7px;border-radius:99px;background:var(--asci-blue-dim);color:var(--asci-blue);border:1px solid rgba(79,143,255,0.2);flex-shrink:0}
.bl-paper-expand{font-size:11px;color:var(--asci-text-muted)}
.bl-paper-detail{padding:0 10px;max-height:0;overflow:hidden;transition:max-height .25s ease,padding .25s}
.bl-paper-detail.open{max-height:200px;padding:8px 10px}
.bl-paper-abstract{font-size:11px;color:var(--asci-text-dim);line-height:1.7;margin-bottom:8px}
.bl-decision-row{display:flex;gap:6px}
.bl-btn{padding:4px 10px;border-radius:99px;font-size:11px;font-weight:600;cursor:pointer;border:1px solid;transition:background .15s,color .15s}
.bl-btn-include{color:var(--asci-green);border-color:rgba(52,211,153,0.4);background:rgba(52,211,153,0.08)}
.bl-btn-include:hover,.bl-btn-include.active{background:rgba(52,211,153,0.2)}
.bl-btn-maybe{color:var(--asci-yellow);border-color:rgba(251,191,36,0.4);background:rgba(251,191,36,0.08)}
.bl-btn-maybe:hover,.bl-btn-maybe.active{background:rgba(251,191,36,0.2)}
.bl-btn-exclude{color:var(--asci-red);border-color:rgba(248,113,113,0.4);background:rgba(248,113,113,0.08)}
.bl-btn-exclude:hover,.bl-btn-exclude.active{background:rgba(248,113,113,0.2)}
.bl-paper.decided-include{border-color:rgba(52,211,153,0.35)}
.bl-paper.decided-maybe{border-color:rgba(251,191,36,0.35)}
.bl-paper.decided-exclude{border-color:rgba(248,113,113,0.35);opacity:.6}

/* ---- CONTRADICTION CARD ---- */
.contradiction-card{border:1px solid rgba(248,113,113,0.3);border-radius:8px;background:rgba(248,113,113,0.04);overflow:hidden;margin-bottom:10px}
.contradiction-header{padding:8px 12px;font-size:11px;font-weight:700;color:var(--asci-red);border-bottom:1px solid rgba(248,113,113,0.2)}
.contradiction-metric{font-size:12px;color:var(--asci-text-dim);padding:8px 12px;border-bottom:1px solid rgba(248,113,113,0.1)}
.contradiction-papers{display:grid;grid-template-columns:1fr 1fr;gap:0}
.contra-paper{padding:10px 12px;border-right:1px solid rgba(248,113,113,0.15)}
.contra-paper:last-child{border-right:none}
.contra-paper-title{font-size:11px;font-weight:700;color:var(--asci-text);margin-bottom:3px}
.contra-paper-meta{font-size:10px;color:var(--asci-text-muted);margin-bottom:6px}
.contra-paper-value{font-size:20px;font-weight:800;color:var(--asci-red);margin-bottom:3px}
.contra-paper-method{font-size:10px;color:var(--asci-text-dim);line-height:1.4}
.contradiction-options{padding:10px 12px;display:flex;flex-direction:column;gap:6px}
.contra-opt{display:flex;align-items:flex-start;gap:8px;padding:7px 10px;border-radius:6px;border:1px solid var(--asci-border);background:rgba(255,255,255,0.02);cursor:pointer;transition:border-color .15s,background .15s}
.contra-opt:hover{border-color:var(--asci-border2);background:rgba(79,143,255,0.05)}
.contra-opt.selected{border-color:var(--asci-blue);background:var(--asci-blue-dim)}
.contra-opt-radio{width:14px;height:14px;border-radius:50%;border:2px solid var(--asci-text-muted);flex-shrink:0;margin-top:1px;transition:border-color .15s,background .15s}
.contra-opt.selected .contra-opt-radio{border-color:var(--asci-blue);background:var(--asci-blue)}
.contra-opt-label{font-size:12px;font-weight:600;color:var(--asci-text)}
.contra-opt-reason{font-size:11px;color:var(--asci-text-muted);margin-top:1px}

/* ---- OUTLINE EDITOR ---- */
.outline-list{display:flex;flex-direction:column;gap:6px;margin-bottom:10px}
.outline-item{display:flex;align-items:flex-start;gap:8px;padding:8px 10px;border-radius:6px;border:1px solid var(--asci-border);background:rgba(255,255,255,0.02)}
.outline-num{width:20px;height:20px;border-radius:50%;background:var(--asci-blue-dim);color:var(--asci-blue);display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;flex-shrink:0;border:1px solid rgba(79,143,255,0.25);margin-top:1px}
.outline-content{flex:1;min-width:0}
.outline-title-input{width:100%;background:transparent;border:none;color:var(--asci-text);font-size:12px;font-weight:600;outline:none;padding:0;margin-bottom:3px}
.outline-title-input:focus{border-bottom:1px solid var(--asci-blue)}
.outline-points{font-size:11px;color:var(--asci-text-muted);line-height:1.5}

/* ---- BACK BUTTON ---- */
.asci-btn-back{padding:9px 16px;border-radius:8px;background:transparent;color:var(--asci-text-muted);border:1px solid var(--asci-border);cursor:pointer;font-size:13px;font-weight:600;transition:border-color .15s,color .15s}
.asci-btn-back:hover:not(:disabled){border-color:var(--asci-border2);color:var(--asci-text)}
.asci-btn-back:disabled{opacity:.3;cursor:default}

/* ---- CONFIRM MODAL ---- */
.confirm-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.55);z-index:2000;display:flex;align-items:center;justify-content:center}
.confirm-modal{background:var(--asci-surface);border:1px solid var(--asci-border2);border-radius:var(--asci-radius);padding:24px;max-width:380px;width:90%}
.confirm-modal-title{font-size:15px;font-weight:700;margin-bottom:8px;color:var(--asci-yellow)}
.confirm-modal-body{font-size:13px;color:var(--asci-text-dim);line-height:1.6;margin-bottom:20px}
.confirm-modal-actions{display:flex;gap:10px;justify-content:flex-end}
.confirm-btn-cancel{padding:7px 16px;border-radius:6px;background:transparent;border:1px solid var(--asci-border);color:var(--asci-text-dim);cursor:pointer;font-size:13px}
.confirm-btn-ok{padding:7px 16px;border-radius:6px;background:var(--asci-yellow);border:none;color:#000;cursor:pointer;font-size:13px;font-weight:700}

/* ---- RIGHT PANEL: HITL STATUS ---- */
.hitl-status{padding:8px 10px;border-radius:6px;font-size:11px;line-height:1.5;margin-top:6px}
.hitl-status-wait{background:rgba(251,191,36,0.08);border:1px solid rgba(251,191,36,0.25);color:var(--asci-yellow)}
.hitl-status-done{background:rgba(52,211,153,0.08);border:1px solid rgba(52,211,153,0.25);color:var(--asci-green)}
.hitl-status-required{background:rgba(248,113,113,0.08);border:1px solid rgba(248,113,113,0.25);color:var(--asci-red)}
```

**Step 2：提交**
```bash
git add tools/asci/index.html
git commit -m "style(asci): 添加 HITL 结果卡片、操作控件、矛盾对比等样式"
```

---

## Task 3：重构底部控制栏 HTML

**文件：** `tools/asci/index.html`，`asci-controls` div（当前约第312行）

**目标：** 在底部控制栏新增"← 上一步"按钮，调整布局为左中右三区。

**Step 1：替换 `.asci-controls` 内容**

将：
```html
    <div class="asci-controls">
      <button class="asci-btn-next" id="nextBtn" onclick="handleNext()">▶ 执行下一步</button>
      <span class="ctrl-progress" id="ctrlProgress">准备就绪 · 共 5 个步骤</span>
    </div>
```

替换为：
```html
    <div class="asci-controls">
      <button class="asci-btn-back" id="backBtn" onclick="handleBack()" disabled>← 上一步</button>
      <span class="ctrl-progress" id="ctrlProgress">准备就绪 · 共 5 个步骤</span>
      <button class="asci-btn-next" id="nextBtn" onclick="handleNext()">▶ 执行下一步</button>
    </div>
```

同时在 CSS 中更新 `.asci-controls` 的 justify-content（当前是 `space-between`，三个子元素自然撑开，不需要修改）。

**Step 2：提交**
```bash
git add tools/asci/index.html
git commit -m "feat(asci): 底部控制栏新增回退按钮"
```

---

## Task 4：实现步骤结果卡片渲染函数

**文件：** `tools/asci/index.html`，`<script>` 块内

**目标：** 新增 `renderStepResult(stepIdx)` 函数，根据每步的 `result.type` 渲染对应的结果卡片并追加到日志区。

**Step 1：在 `appendLog` 函数后新增以下函数**

```javascript
// ---- STEP STATE ----
var stepUserData = {}; // 保存每步用户的修改决策，key = stepId

function renderStepResult(stepIdx) {
  var step = MOCK_STEPS[stepIdx - 1];
  var r = step.result;
  if (!r) return;

  // 初始化用户数据（若已有则保留）
  if (!stepUserData[step.id]) {
    stepUserData[step.id] = JSON.parse(JSON.stringify(r));
  }
  var ud = stepUserData[step.id];

  var card = document.createElement('div');
  card.className = 'step-result-card';
  card.id = 'stepResult_' + stepIdx;

  var riskLabel = step.risk === 'high' ? '⚠ 高风险 · 必须人工处置' :
                  step.risk === 'medium' ? '📋 中风险 · 建议审核' : '✓ 低风险 · 可选审核';
  card.innerHTML = '<div class="src-header"><span>步骤产出 · ' + step.name + '</span><span style="font-weight:400;opacity:.7">' + riskLabel + '</span></div>' +
    '<div class="src-body" id="srcBody_' + stepIdx + '"></div>';
  document.getElementById('logBody').appendChild(card);

  var body = document.getElementById('srcBody_' + stepIdx);

  if (r.type === 'keywords') renderKeywordsResult(body, stepIdx, ud);
  else if (r.type === 'search') renderSearchResult(body, stepIdx, ud);
  else if (r.type === 'screening') renderScreeningResult(body, stepIdx, ud);
  else if (r.type === 'contradiction') renderContradictionResult(body, stepIdx, ud);
  else if (r.type === 'outline') renderOutlineResult(body, stepIdx, ud);

  document.getElementById('logPanel').scrollTop = 99999;
}

function renderKeywordsResult(body, stepIdx, ud) {
  var html = '<div class="kw-tags" id="kwTags_' + stepIdx + '">';
  ud.keywords.forEach(function(kw, i) {
    html += '<span class="kw-tag" id="kw_' + i + '">' +
      kw.term +
      (kw.mesh ? '<span class="kw-tag-mesh">→ ' + kw.mesh + '</span>' : '') +
      '<button class="kw-tag-del" onclick="removeKeyword(' + stepIdx + ',' + i + ')">×</button>' +
      '</span>';
  });
  html += '</div>';
  html += '<div class="kw-add-row">' +
    '<input class="kw-add-input" id="kwInput_' + stepIdx + '" placeholder="添加关键词..." />' +
    '<button class="kw-add-btn" onclick="addKeyword(' + stepIdx + ')">+ 添加</button>' +
    '</div>';
  html += '<div class="src-hint">' + ud.hint + '</div>';
  body.innerHTML = html;
  document.getElementById('kwInput_' + stepIdx).addEventListener('keydown', function(e){
    if (e.key === 'Enter') addKeyword(stepIdx);
  });
}

function removeKeyword(stepIdx, idx) {
  var ud = stepUserData[MOCK_STEPS[stepIdx-1].id];
  ud.keywords.splice(idx, 1);
  var body = document.getElementById('srcBody_' + stepIdx);
  renderKeywordsResult(body, stepIdx, ud);
}

function addKeyword(stepIdx) {
  var input = document.getElementById('kwInput_' + stepIdx);
  var val = input.value.trim();
  if (!val) return;
  var ud = stepUserData[MOCK_STEPS[stepIdx-1].id];
  ud.keywords.push({term: val, mesh: null, editable: true});
  var body = document.getElementById('srcBody_' + stepIdx);
  renderKeywordsResult(body, stepIdx, ud);
}

function renderSearchResult(body, stepIdx, ud) {
  var maxCount = Math.max.apply(null, ud.sources.map(function(s){ return s.count; }));
  var html = '<div class="search-query-box">🔍 ' + ud.query + '</div>';
  html += '<div class="search-bars">';
  ud.sources.forEach(function(s) {
    var pct = Math.round(s.count / maxCount * 100);
    html += '<div class="search-bar-item">' +
      '<span class="search-bar-label">' + s.name + '</span>' +
      '<div class="search-bar-track"><div class="search-bar-fill" style="width:' + pct + '%;background:' + s.color + '"></div></div>' +
      '<span class="search-bar-count">' + s.count + '</span>' +
      '</div>';
  });
  html += '</div>';
  html += '<div class="year-range-row">' +
    '<span class="year-range-label">时间范围：</span>' +
    '<input class="year-input" id="yearFrom_' + stepIdx + '" type="number" value="' + ud.yearRange.current[0] + '" min="2010" max="2024" />' +
    '<span style="color:var(--asci-text-muted);font-size:12px"> — </span>' +
    '<input class="year-input" id="yearTo_' + stepIdx + '" type="number" value="' + ud.yearRange.current[1] + '" min="2010" max="2024" />' +
    '<button class="re-search-btn" onclick="reSearch(' + stepIdx + ')">重新检索</button>' +
    '</div>';
  html += '<div class="src-hint">' + ud.hint + '</div>';
  body.innerHTML = html;
}

function reSearch(stepIdx) {
  var ud = stepUserData[MOCK_STEPS[stepIdx-1].id];
  var from = parseInt(document.getElementById('yearFrom_' + stepIdx).value);
  var to = parseInt(document.getElementById('yearTo_' + stepIdx).value);
  if (from > to) { showToast('起始年份不能大于结束年份'); return; }
  ud.yearRange.current = [from, to];
  // Mock：调整年份后重新计算数量（简单线性模拟）
  var factor = (to - from) / (ud.yearRange.max - ud.yearRange.min);
  ud.sources[0].count = Math.round(142 * factor);
  ud.sources[1].count = Math.round(198 * factor);
  ud.sources[2].count = Math.round(276 * factor);
  ud.query = 'Transformer AND ("Drug Discovery" OR "Molecular Property") [' + from + ':' + to + ']';
  appendLog('INFO', '重新检索：时间范围调整为 ' + from + '–' + to + '，候选文献 ' + ud.sources[2].count + ' 篇');
  var body = document.getElementById('srcBody_' + stepIdx);
  renderSearchResult(body, stepIdx, ud);
}

function renderScreeningResult(body, stepIdx, ud) {
  var html = '<div class="threshold-row">' +
    '<span class="threshold-label">相关性阈值：</span>' +
    '<input class="threshold-slider" id="threshSlider_' + stepIdx + '" type="range" min="60" max="90" value="' + Math.round(ud.threshold * 100) + '" oninput="updateThreshold(' + stepIdx + ',this.value)" />' +
    '<span class="threshold-val" id="threshVal_' + stepIdx + '">' + ud.threshold.toFixed(2) + '</span>' +
    '</div>';
  html += '<div class="included-count" id="includedCount_' + stepIdx + '">✓ 高置信度纳入：<strong>' + ud.included + ' 篇</strong>（边界文献另行判断）</div>';
  html += '<div style="font-size:11px;font-weight:700;color:var(--asci-text-muted);margin-bottom:6px">边界文献（逐篇判断）</div>';
  html += '<div class="borderline-list">';
  ud.borderline.forEach(function(p, i) {
    var decided = p.decision;
    var decidedClass = decided ? ' decided-' + decided : '';
    html += '<div class="bl-paper' + decidedClass + '" id="blPaper_' + stepIdx + '_' + i + '">' +
      '<div class="bl-paper-top" onclick="toggleBlDetail(' + stepIdx + ',' + i + ')">' +
      '<span class="bl-paper-title">' + p.title + ' <span style="font-size:10px;color:var(--asci-text-muted);font-weight:400">— ' + p.authors + ', ' + p.year + '</span></span>' +
      '<span class="bl-paper-score">' + p.score + '</span>' +
      '<span class="bl-paper-expand" id="blArrow_' + stepIdx + '_' + i + '">▾</span>' +
      '</div>' +
      '<div class="bl-paper-detail" id="blDetail_' + stepIdx + '_' + i + '">' +
      '<div class="bl-paper-abstract">' + p.abstract + '</div>' +
      '<div class="bl-decision-row">' +
      '<button class="bl-btn bl-btn-include' + (decided==='include'?' active':'') + '" onclick="blDecide(' + stepIdx + ',' + i + ',\'include\')">✓ 纳入</button>' +
      '<button class="bl-btn bl-btn-maybe' + (decided==='maybe'?' active':'') + '" onclick="blDecide(' + stepIdx + ',' + i + ',\'maybe\')">? 待定</button>' +
      '<button class="bl-btn bl-btn-exclude' + (decided==='exclude'?' active':'') + '" onclick="blDecide(' + stepIdx + ',' + i + ',\'exclude\')">✕ 排除</button>' +
      '</div></div></div>';
  });
  html += '</div>';
  html += '<div class="src-hint">' + ud.hint + '</div>';
  body.innerHTML = html;
}

function toggleBlDetail(stepIdx, i) {
  var detail = document.getElementById('blDetail_' + stepIdx + '_' + i);
  var arrow = document.getElementById('blArrow_' + stepIdx + '_' + i);
  detail.classList.toggle('open');
  arrow.textContent = detail.classList.contains('open') ? '▴' : '▾';
}

function blDecide(stepIdx, i, decision) {
  var ud = stepUserData[MOCK_STEPS[stepIdx-1].id];
  ud.borderline[i].decision = decision;
  var body = document.getElementById('srcBody_' + stepIdx);
  renderScreeningResult(body, stepIdx, ud);
  // 自动展开下一个未决定项
  var nextUndecided = ud.borderline.findIndex(function(p, idx){ return idx > i && !p.decision; });
  if (nextUndecided >= 0) toggleBlDetail(stepIdx, nextUndecided);
  updateNextBtnState();
}

function updateThreshold(stepIdx, val) {
  var ud = stepUserData[MOCK_STEPS[stepIdx-1].id];
  ud.threshold = val / 100;
  document.getElementById('threshVal_' + stepIdx).textContent = ud.threshold.toFixed(2);
  // Mock：调整阈值影响纳入数量
  var base = 18;
  var delta = Math.round((0.72 - ud.threshold) * 200);
  ud.included = Math.max(5, base + delta);
  document.getElementById('includedCount_' + stepIdx).innerHTML = '✓ 高置信度纳入：<strong>' + ud.included + ' 篇</strong>（边界文献另行判断）';
}

function renderContradictionResult(body, stepIdx, ud) {
  var c = ud.contradiction;
  var html = '<div class="contradiction-card">' +
    '<div class="contradiction-header">⚡ 检测到矛盾文献 · 必须人工处置</div>' +
    '<div class="contradiction-metric">矛盾指标：<strong>' + c.metric + '</strong></div>' +
    '<div class="contradiction-papers">' +
    '<div class="contra-paper">' +
    '<div class="contra-paper-title">' + c.paperA.title + '</div>' +
    '<div class="contra-paper-meta">' + c.paperA.authors + ' · ' + c.paperA.journal + '</div>' +
    '<div class="contra-paper-value">' + c.paperA.value + '</div>' +
    '<div class="contra-paper-method">' + c.paperA.method + '</div>' +
    '</div>' +
    '<div class="contra-paper">' +
    '<div class="contra-paper-title">' + c.paperB.title + '</div>' +
    '<div class="contra-paper-meta">' + c.paperB.authors + ' · ' + c.paperB.journal + '</div>' +
    '<div class="contra-paper-value">' + c.paperB.value + '</div>' +
    '<div class="contra-paper-method">' + c.paperB.method + '</div>' +
    '</div>' +
    '</div>' +
    '<div class="contradiction-options">';
  c.options.forEach(function(opt) {
    var selected = c.decision === opt.id;
    html += '<div class="contra-opt' + (selected ? ' selected' : '') + '" onclick="contraDecide(' + stepIdx + ',\'' + opt.id + '\')">' +
      '<div class="contra-opt-radio"></div>' +
      '<div><div class="contra-opt-label">' + opt.label + '</div><div class="contra-opt-reason">' + opt.reason + '</div></div>' +
      '</div>';
  });
  html += '</div></div>';
  html += '<div class="src-hint">' + ud.hint + '</div>';
  body.innerHTML = html;
}

function contraDecide(stepIdx, optId) {
  var ud = stepUserData[MOCK_STEPS[stepIdx-1].id];
  ud.contradiction.decision = optId;
  var body = document.getElementById('srcBody_' + stepIdx);
  renderContradictionResult(body, stepIdx, ud);
  updateNextBtnState();
}

function renderOutlineResult(body, stepIdx, ud) {
  var html = '<div class="outline-list">';
  ud.sections.forEach(function(sec, i) {
    html += '<div class="outline-item">' +
      '<div class="outline-num">' + sec.id + '</div>' +
      '<div class="outline-content">' +
      '<input class="outline-title-input" id="outlineTitle_' + stepIdx + '_' + i + '" value="' + sec.title + '" onchange="updateOutlineTitle(' + stepIdx + ',' + i + ',this.value)" />' +
      '<div class="outline-points">' + sec.points + '</div>' +
      '</div></div>';
  });
  html += '</div>';
  html += '<div class="src-hint">' + ud.hint + '</div>';
  body.innerHTML = html;
}

function updateOutlineTitle(stepIdx, i, val) {
  var ud = stepUserData[MOCK_STEPS[stepIdx-1].id];
  ud.sections[i].title = val;
}
```

**Step 2：提交**
```bash
git add tools/asci/index.html
git commit -m "feat(asci): 新增每步结果卡片渲染函数（关键词/检索/筛选/矛盾/大纲）"
```

---

## Task 5：更新 `runStep` / `finishStep` 调用结果渲染

**文件：** `tools/asci/index.html`，`finishStep` 函数

**目标：** 步骤完成后自动调用 `renderStepResult()`，并更新右侧面板的 HITL 状态提示。

**Step 1：替换 `finishStep` 函数**

将现有 `function finishStep(stepIdx) { ... }` 替换为：

```javascript
function finishStep(stepIdx) {
  doneSets.add(stepIdx);
  isRunning = false;
  updatePanel(stepIdx, 'done');
  renderTree();

  // 渲染步骤结果卡片
  renderStepResult(stepIdx);

  var step = MOCK_STEPS[stepIdx - 1];
  var btn = document.getElementById('nextBtn');
  btn.disabled = false;

  if (stepIdx < 5) {
    btn.textContent = '▶ 执行下一步';
    document.getElementById('ctrlProgress').textContent = '步骤 ' + stepIdx + ' 完成 · 请审核结果后继续';
    // 更新右侧 HITL 状态
    updateHitlStatus(stepIdx);
  } else {
    btn.textContent = '✓ 查看结果';
    btn.onclick = function(){ renderScreen3(); showScreen(3); };
    document.getElementById('ctrlProgress').textContent = '全部完成 · 点击查看综述结果';
    document.getElementById('taskBadge').textContent = '执行完成';
    document.getElementById('taskBadge').className = 'asci-badge asci-badge-done';
  }

  // 更新回退按钮状态
  document.getElementById('backBtn').disabled = (stepIdx <= 1 && !doneSets.has(1));
  if (stepIdx >= 1) document.getElementById('backBtn').disabled = false;

  // 高风险步骤完成前禁用下一步，等待用户决策
  updateNextBtnState();
}

function updateHitlStatus(stepIdx) {
  var step = MOCK_STEPS[stepIdx - 1];
  var panel = document.getElementById('statusPanel');
  var existing = panel.querySelector('.hitl-status');
  if (existing) existing.remove();
  var div = document.createElement('div');
  if (step.risk === 'high') {
    div.className = 'hitl-status hitl-status-required';
    div.textContent = '⚠ 高风险步骤：必须完成人工处置才能继续';
  } else if (step.risk === 'medium') {
    div.className = 'hitl-status hitl-status-wait';
    div.textContent = '📋 中风险：建议审核结果后再继续';
  } else {
    div.className = 'hitl-status hitl-status-done';
    div.textContent = '✓ 低风险：可直接继续，或选择审核修改';
  }
  panel.appendChild(div);
}

function updateNextBtnState() {
  // 高风险步骤（Step 4）：矛盾未处置则禁用下一步
  if (doneSets.has(4) && !doneSets.has(5)) {
    var ud = stepUserData[4];
    if (ud && ud.contradiction && !ud.contradiction.decision) {
      document.getElementById('nextBtn').disabled = true;
      document.getElementById('ctrlProgress').textContent = '⚠ 请先处置矛盾文献';
      return;
    }
  }
  // 中风险步骤（Step 3）：边界文献必须全部判断
  if (doneSets.has(3) && !doneSets.has(4)) {
    var ud3 = stepUserData[3];
    if (ud3 && ud3.borderline) {
      var undecided = ud3.borderline.filter(function(p){ return !p.decision; }).length;
      if (undecided > 0) {
        document.getElementById('nextBtn').disabled = true;
        document.getElementById('ctrlProgress').textContent = '还有 ' + undecided + ' 篇边界文献待判断';
        return;
      }
    }
  }
  var btn = document.getElementById('nextBtn');
  if (currentStep < 5 && !isRunning && !awaitingCheckpoint) {
    btn.disabled = false;
  }
}
```

**Step 2：更新 `confirmCheckpoint` 函数（Step 3 的老 Checkpoint 逻辑不再需要，改由 blDecide 驱动）**

将 `confirmCheckpoint` 函数替换为：
```javascript
function confirmCheckpoint() {
  // Step 3 的 checkpoint 现在由 blDecide 逐篇驱动
  // 此函数保留兼容，实际由 updateNextBtnState 控制
  awaitingCheckpoint = false;
  appendLog('INFO', '✓ 边界文献判断完成，继续执行...');
  finishStep(3);
}
```

同时更新 `runStep` 中 checkpoint 分支，把旧的 checkpointCard 逻辑去掉（因为筛选结果卡片已经包含逐篇判断），改为直接调用 finishStep 后等 updateNextBtnState 控制按钮：

在 `runStep` 中，将：
```javascript
  if (step.checkpoint) {
    awaitingCheckpoint = true;
    isRunning = false;
    document.getElementById('checkpointCard').classList.remove('hidden');
    ...
    return;
  }
  finishStep(stepIdx);
```
替换为：
```javascript
  // Step 3 的逐篇判断由结果卡片内的 blDecide 驱动，直接 finishStep
  finishStep(stepIdx);
```

同时更新 `handleNext`，去掉 `awaitingCheckpoint` 的判断分支（不再需要）：
```javascript
function handleNext() {
  if (isRunning) return;
  if (currentStep >= 5) return;
  isRunning = true;
  var btn = document.getElementById('nextBtn');
  btn.disabled = true;
  btn.textContent = '执行中...';
  btn.classList.remove('checkpoint-mode');
  runStep(currentStep + 1);
}
```

**Step 3：提交**
```bash
git add tools/asci/index.html
git commit -m "feat(asci): finishStep 集成结果渲染、HITL 状态更新、高风险步骤锁定"
```

---

## Task 6：实现回退功能

**文件：** `tools/asci/index.html`，`<script>` 块内

**目标：** 实现 `handleBack()` 函数，弹窗确认后清除后续步骤状态并回退到上一步结果界面。

**Step 1：新增 `handleBack` 和确认弹窗函数**

```javascript
function handleBack() {
  if (currentStep <= 0) return;
  var targetStep = currentStep - 1;
  if (doneSets.has(currentStep)) {
    // 当前步骤已完成，回退会清除当前及之后的结果
    showConfirmModal(
      '⚠ 确认回退？',
      '回退到步骤 ' + targetStep + '（' + (targetStep > 0 ? MOCK_STEPS[targetStep-1].name : '起始') + '）将清除步骤 ' + currentStep + '–5 的所有结果。',
      function() { doBack(targetStep); }
    );
  } else {
    doBack(targetStep);
  }
}

function doBack(targetStep) {
  // 清除 targetStep+1 及之后的所有状态
  for (var i = targetStep + 1; i <= 5; i++) {
    doneSets.delete(i);
    delete stepUserData[i];
    // 移除对应的结果卡片 DOM
    var card = document.getElementById('stepResult_' + i);
    if (card) card.remove();
  }
  // 清除当前步骤
  doneSets.delete(targetStep + 1);

  // 裁剪日志（保留到 targetStep 完成时的日志，移除之后的）
  // 简化处理：清除 targetStep 之后追加的日志行（通过 data-step 标记）
  var logLines = document.getElementById('logBody').querySelectorAll('.log-line[data-step]');
  logLines.forEach(function(line) {
    if (parseInt(line.getAttribute('data-step')) > targetStep) line.remove();
  });

  currentStep = targetStep;
  isRunning = false;
  awaitingCheckpoint = false;

  // 重置到目标步骤完成后的状态
  if (targetStep === 0) {
    // 回到初始状态
    document.getElementById('backBtn').disabled = true;
    document.getElementById('nextBtn').textContent = '▶ 执行下一步';
    document.getElementById('nextBtn').onclick = handleNext;
    document.getElementById('ctrlProgress').textContent = '准备就绪 · 共 5 个步骤';
    document.getElementById('progressBar').style.width = '0%';
    document.getElementById('progressText').textContent = '步骤 0 / 5';
    document.getElementById('confRing').style.setProperty('--pct', 0);
    document.getElementById('confNum').textContent = '—';
    document.getElementById('confTrend').innerHTML = '任务启动后<br>实时更新';
    document.getElementById('stepCard').innerHTML = '<div class="step-card-empty">等待执行...</div>';
    var hitlStatus = document.getElementById('statusPanel').querySelector('.hitl-status');
    if (hitlStatus) hitlStatus.remove();
  } else {
    updatePanel(targetStep, 'done');
    updateHitlStatus(targetStep);
    document.getElementById('nextBtn').textContent = '▶ 执行下一步';
    document.getElementById('nextBtn').onclick = handleNext;
    document.getElementById('ctrlProgress').textContent = '已回退至步骤 ' + targetStep + ' · 准备重新执行下一步';
  }

  renderTree();
  appendLog('INFO', '← 已回退至步骤 ' + targetStep + (targetStep > 0 ? '（' + MOCK_STEPS[targetStep-1].name + '）' : '（起始）') + '，步骤 ' + (targetStep+1) + '–5 结果已清除');
}

function showConfirmModal(title, body, onConfirm) {
  var overlay = document.createElement('div');
  overlay.className = 'confirm-overlay';
  overlay.innerHTML = '<div class="confirm-modal">' +
    '<div class="confirm-modal-title">' + title + '</div>' +
    '<div class="confirm-modal-body">' + body + '</div>' +
    '<div class="confirm-modal-actions">' +
    '<button class="confirm-btn-cancel" onclick="this.closest(\'.confirm-overlay\').remove()">取消</button>' +
    '<button class="confirm-btn-ok" id="confirmOkBtn">确认回退</button>' +
    '</div></div>';
  document.body.appendChild(overlay);
  overlay.querySelector('#confirmOkBtn').onclick = function() {
    overlay.remove();
    onConfirm();
  };
}
```

**Step 2：为 `appendLog` 函数增加 `data-step` 标记**

将 `appendLog` 改为接受可选 stepIdx 参数，供回退时精确清除：

```javascript
function appendLog(level, text, stepIdx) {
  var d = new Date();
  var ts = d.toTimeString().slice(0,8);
  var div = document.createElement('div');
  div.className = 'log-line';
  if (stepIdx) div.setAttribute('data-step', stepIdx);
  div.innerHTML = '<span class="log-ts">[' + ts + ']</span>' +
    '<span class="log-lvl log-lvl-' + level.toLowerCase() + '">' + level + '</span> ' + text;
  document.getElementById('logBody').appendChild(div);
  document.getElementById('logPanel').scrollTop = 99999;
}
```

在 `runStep` 中调用 `appendLog` 时传入 stepIdx：
```javascript
appendLog(step.logs[i].level, step.logs[i].text, stepIdx);
```

**Step 3：更新 `restart` 函数，清除 stepUserData**

在现有 `restart` 函数开头加上：
```javascript
stepUserData = {};
```

**Step 4：提交**
```bash
git add tools/asci/index.html
git commit -m "feat(asci): 实现受限回退功能（弹窗确认 + 清除后续状态）"
```

---

## Task 7：清理旧的 Checkpoint Card HTML

**文件：** `tools/asci/index.html`，Screen 2 中的 `checkpointCard` div（约第273行）

**目标：** 旧的 `.checkpoint-card` HTML 元素已被步骤结果卡片取代，保留 `PAPER_DATA` 和 `showPaperModal` 供 Screen 3 使用，但移除 Screen 2 中固定的 checkpoint HTML。

**Step 1：删除旧 checkpointCard HTML**

将：
```html
        <div class="checkpoint-card hidden" id="checkpointCard">
          <div class="cp-title">👤 Human Checkpoint — 摘要筛选质量确认</div>
          <div class="cp-body">
            <p>AI 已筛选 <strong>21 篇</strong>摘要（阈值 0.72），其中 <strong>3 篇</strong>置信度处于边界区间 [0.72–0.75]，建议人工确认是否纳入精读。</p>
            <div class="cp-papers">
              <div class="cp-paper" onclick="showPaperModal('cp1')">📄 Attention Is All You Need (2017) — 相关性评分 0.74 <span class="cp-paper-hint">点击查看摘要 →</span></div>
              <div class="cp-paper" onclick="showPaperModal('cp2')">📄 Drug-Target Interaction via Transformer (2021) — 相关性评分 0.73 <span class="cp-paper-hint">点击查看摘要 →</span></div>
              <div class="cp-paper" onclick="showPaperModal('cp3')">📄 Molecular Graph Transformer (2022) — 相关性评分 0.72 <span class="cp-paper-hint">点击查看摘要 →</span></div>
            </div>
          </div>
        </div>
```

替换为空字符串（整段删除）。

**Step 2：同样清理旧的 CSS（`.checkpoint-card`, `.cp-title`, `.cp-body`, `.cp-papers` 相关样式）**

这些样式已被新 CSS 取代，可以安全删除，减少冗余。

**Step 3：提交**
```bash
git add tools/asci/index.html
git commit -m "chore(asci): 删除已废弃的旧 Checkpoint Card HTML 和 CSS"
```

---

## Task 8：端到端验证

**目标：** 逐步走完完整流程，验证所有交互节点正常工作。

**验证清单：**

1. **Step 1 完成后**：日志区下方出现关键词卡片，可以删除关键词（× 按钮），可以添加新词（输入+回车/点击），右侧面板显示"✓ 低风险"状态
2. **Step 2 完成后**：出现检索结果柱状图，修改年份后点"重新检索"，日志追加新记录，柱状图更新
3. **Step 3 完成后**：出现阈值滑动条 + 3篇边界文献，移动阈值后纳入数量变化；展开每篇文献，点击"纳入/待定/排除"；**全部判断完成前"下一步"按钮应该是禁用的**
4. **Step 4 完成后**：出现矛盾对比卡片（两列），选择处置方案后高亮；**未选择前"下一步"禁用**
5. **Step 5 完成后**：出现大纲列表，节标题可编辑
6. **回退测试**：Step 3 完成后点"← 上一步"，弹出确认弹窗，确认后 Step 3 结果卡片消失，日志截断，重新执行 Step 3 可以再次正常展示结果卡片
7. **从 Step 1 回退**：回退按钮在 Step 1 未执行时为禁用状态

**Step 1：用浏览器直接打开文件**
```
file:///D:/CS/Coding/qiuzhi/tools/asci/index.html
```

**Step 2：按验证清单逐项测试**

**Step 3：发现问题直接用 Edit tool 修复，保持小提交**

**CEO Review 补充的边界验证（必查）：**

8. **回退时 isRunning 保护**：步骤执行动画中点"← 上一步"，按钮应无响应（不弹弹窗）
9. **Step 3 全部 Exclude 后**："下一步"应解锁（undecided=0 条件满足）
10. **XSS 修复**：关键词输入框输入 `<img src=x onerror=alert(1)>` 后应显示为纯文本，不触发弹窗
11. **批量操作一致性**：Step 3 点"全选纳入"后，再手动改某篇为"排除"，状态应正确更新

---

## 实现顺序总结

```
Task 1（Mock 数据）→ Task 2（CSS）→ Task 3（HTML 控制栏）→ Task 4（渲染函数）→ Task 5（流程集成）→ Task 6（回退）→ Task 7（清理）→ Task 8（验证）
```

**Task 4 内需包含的所有函数（含 CEO Review 新增）：**
- `escHtml()` — XSS 转义工具函数
- `renderStepResult()` — 步骤结果卡片入口
- `renderKeywordsResult()` + `removeKeyword()` + `addKeyword()` — Step 1
- `renderSearchResult()` + `reSearch()` — Step 2
- `renderScreeningResult()` + `toggleBlDetail()` + `blDecide()` + `updateThreshold()` — Step 3
- `blBatchAction()` — Step 3 批量操作（cherry-pick #1）
- `renderContradictionResult()` + `contraDecide()` — Step 4
- `renderOutlineResult()` + `updateOutlineTitle()` — Step 5
- `updateHitlStatus()` + `updateNextBtnState()` — 状态控制
- `appendHitlDecisionLog()` — 右侧决策历史追加（cherry-pick #2）
- `renderScreen3HitlSummary()` — Screen 3 人工决策摘要（cherry-pick #3）

**Task 5 内需同步修改：**
- `finishStep()` 末尾调用 `appendHitlDecisionLog()` 更新决策历史面板
- `runStep()` 开始时禁用 backBtn，`finishStep()` 后重新启用
- `handleBack()` 开头加 `if (isRunning) return;`
- `renderScreen3()` 末尾调用 `renderScreen3HitlSummary()`
- Step 1 关键词有修改时按钮文字改为"✓ 确认并继续"（在 `addKeyword` / `removeKeyword` 末尾更新）

> 注意：所有 Task 修改的都是同一个文件 `tools/asci/index.html`。每次 Edit 前先重新读取目标区域，避免行号漂移导致替换错误。Task 4 新增的函数较多，建议整段追加到 `</script>` 前，而不是插入到现有函数之间。

## GSTACK REVIEW REPORT

| Review | Trigger | Why | Runs | Status | Findings |
|--------|---------|-----|------|--------|----------|
| CEO Review | `/plan-ceo-review` | 范围与策略 | 1 | DONE | 3个cherry-pick接受，6项修复/改进建议全部纳入 |
| Codex Review | `/codex review` | 独立第二意见 | 0 | — | — |
| Eng Review | `/plan-eng-review` | 架构与测试（必须） | 0 | — | — |
| Design Review | `/plan-design-review` | UI/UX 审查 | 0 | — | — |

- **UNRESOLVED:** 0 个未决定项
- **VERDICT:** CEO CLEARED — 建议在实现前运行 /plan-eng-review
