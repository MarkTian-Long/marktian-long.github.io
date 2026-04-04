# ASCI 工具 UI 改进计划 v3

## Context
QA 完成后用户提出多项体验问题，并经过全面 mock 数据一致性审计，本计划整合所有改动：
- 修复节点职责重叠、数据不一致（审计发现 5 处矛盾）
- Screen 1 重构（节点改为信息卡片、移除排序列、锁定必选节点）
- Screen 2 增加时间线分组框、替换执行日志为对话框、支持节点重跑
- 约束节点可选范围，防止无效流程

所有交互均为**纯前端 Mock**，不接入真实 API。

---

## 数据修复清单（优先执行，其他改动依赖它）

### Fix 1：统一矛盾数量为 1 处（data.js）
- `contradiction-detect` 的 logs 第 2 条改为"发现 1 处潜在矛盾：Liu 2022 vs Wang 2023，AUROC 差值 0.060"（去掉"2 处"的说法）
- `contradiction-detect` 的 `findings` 保留 47，但 `findingsList` 改为展示 3 条（与 fulltext-read 一致）

### Fix 2：NODE_SUMMARIES 修正（ui.js）
- `contradiction-detect`：从 `'2 处矛盾已处置'` 改为 `'1 处矛盾已处置'`
- `quality-assess`：从 `'8 篇 A 级 / 11 篇 B 级'` 改为 `'8 篇 A / 11 篇 B / 2 篇 C'`

### Fix 3：拆分 fulltext-read / contradiction-detect 职责（data.js + ui.js）
**根因**：两个节点的 `contradiction` 对象数据完全重复，decision 字段各自独立，决策流不清晰。

- `fulltext-read.result.type` 改为 `'fulltext'`
- `fulltext-read.result` 删去 `contradiction` 字段，只保留 `findings`/`findingsList`
- `fulltext-read.result` 新增 `contradictionCount: 1`（只标注"发现了几处矛盾"，不含处置数据）
- `contradiction-detect` 保留完整的 `contradiction` 对象（这是唯一的决策入口）
- `engine.js`：`calcConfidence()` 中 `fulltext-read` 分支改为固定值 75

新增 `renderFulltextResult(body, nodeId, ud)`（ui.js）：
- 展示：已处理文献数、发现列表（可展开）、"检测到 1 处矛盾待后续处置"提示
- 不展示矛盾处置 UI

### Fix 4：abstract-screen 纳入数与后续节点同步（data.js）
- `fulltext-read` 的日志"下载全文 PDF (21 篇)"改为动态读取，但 Mock 场景下写死 21 篇并在注释中标明"以边界文献全部纳入为假设"
- 实际上 borderline decision 只影响 NODE_SUMMARIES 展示，不影响后续 mock 数据（这是 Mock 的合理简化，加注释说明）

### Fix 5：expand-search 标记为演示版不可用
- 加 `demoUnavailable: true` 字段，在 Screen 1 节点网格中灰化显示

---

## 任务 1：Screen 1 节点网格改为信息卡片

**改动**：chip 改为小卡片，直接显示节点功能说明，无需 hover。

#### main.js — `renderNodeGrid()`
节点卡片结构：
```html
<div class="s1-node-card [selected] [required] [demo-unavailable]" onclick="toggleNode('id')">
  <div class="s1-card-top">
    <span class="s1-card-icon">🔑</span>
    <span class="s1-card-name">关键词提取</span>
    <span class="s1-card-lock">🔒</span>  <!-- 仅必选节点显示 -->
  </div>
  <div class="s1-card-desc">从研究主题提取核心词，映射 MeSH 标准术语</div>
  <div class="s1-card-tags">
    <span class="s1-card-risk low">低风险</span>
  </div>
</div>
```

每个节点加 `desc` 字段（data.js），内容见下方节点说明表。

布局：按分组（配置/发现/筛选/分析/输出）排列，每组 2-3 列网格。

**必选节点**（`keyword-extract`、`db-search`）：
- `required: true` 字段加入 NODE_REGISTRY
- 始终在 `activePipeline` 中，不可取消
- 点击忽略（轻微 shake 动效）

**演示版不可用节点**（`citation-chase`、`expand-search`、`meta-analysis`、`bibtex-export`）：
- 灰色半透明显示
- 点击 → `showToast('演示版暂不支持，实际产品中可启用')`
- 不加入管线

#### asci.css 新增
```css
.s1-node-card { border: 1.5px solid var(--asci-border); border-radius: 8px; padding: 10px; cursor: pointer; transition: all 0.15s; }
.s1-node-card:hover { border-color: var(--asci-blue); }
.s1-node-card.selected { border-color: var(--asci-blue); background: var(--asci-blue-bg); }
.s1-node-card.required { border-color: var(--asci-blue); opacity: 1; cursor: default; }
.s1-node-card.demo-unavailable { opacity: 0.4; cursor: not-allowed; }
.s1-card-top { display: flex; align-items: center; gap: 6px; margin-bottom: 4px; }
.s1-card-icon { font-size: 14px; }
.s1-card-name { font-size: 12px; font-weight: 700; flex: 1; }
.s1-card-desc { font-size: 11px; color: var(--asci-text-muted); line-height: 1.4; margin-bottom: 6px; }
.s1-card-risk { font-size: 10px; padding: 1px 6px; border-radius: 10px; }
.s1-card-risk.low { background: var(--asci-green-bg); color: var(--asci-green); }
.s1-card-risk.medium { background: var(--asci-yellow-bg); color: var(--asci-yellow); }
.s1-card-risk.high { background: var(--asci-red-bg); color: var(--asci-red); }
```

#### 节点 desc 字段（data.js 各节点新增）
```
data-source-config:   '选择检索数据库（PubMed/arXiv/Semantic Scholar）并配置访问权限'
keyword-extract:      '从研究主题提取核心词，映射 MeSH 标准术语，生成检索策略'
db-search:            '在已选数据库执行关键词检索，返回初始候选文献列表'
citation-chase:       '通过正向/反向引文链接发现检索遗漏的相关论文'
expand-search:        '基于已纳入文献识别相邻主题，扩展搜索覆盖面'
abstract-screen:      '用 SciBERT 对摘要打分，阈值过滤，边界文献需人工判断'
fulltext-read:        '下载全文 PDF，提取方法论和关键发现，标注潜在矛盾'
quality-assess:       '用 GRADE 量表评估方法学质量，识别偏倚风险'
contradiction-detect: '对矛盾文献进行结构化处置，四选一人工决策'
theme-cluster:        '对全部纳入文献做主题聚类，发现研究方向分布'
meta-analysis:        '汇总效应量，输出森林图数据和异质性统计'
outline-gen:          '根据发现和主题自动生成综述大纲（可编辑）'
review-write:         '基于大纲和文献生成完整综述草稿'
bibtex-export:        '导出所有纳入文献的 BibTeX 引用文件'
```

---

## 任务 2：Screen 1 移除排序列，简化布局

**改动**：`s1-configurator` 改为左宽右窄两列。

#### main.js
- 删除 `renderPipelinePreview()`、`moveNode()` 函数
- `s1-pipeline-wrap` 内只保留：预设模板按钮 + 启动按钮
- `activePipeline` 初始化时加入必选节点：`activePipeline = ['keyword-extract', 'db-search']`

#### index.html
- 删除 `<div class="s1-pipeline-list" id="pipelineList">` 相关 HTML

---

## 任务 3：置信度图优化 + 右侧面板小改

#### engine.js — `updateConfMiniChart()`（约 155-201 行）
- 节点数 > 6 时，X 轴标签改为序号：`(i+1)+'·'+val+'%'`，SVG dot hover 仍显示节点名

#### index.html（Screen 2 右侧面板，约 114-119 行）
- `工具调用` → `AI 工具调用`
- label 下加 `<div class="panel-sublabel">本节点调用的外部 API / 算法模型</div>`

#### asci.css
- `.panel-sublabel { font-size: 10px; color: var(--asci-text-muted); margin: -4px 0 6px; }`

---

## 任务 4：执行时间线加分组框

新增 `PIPELINE_GROUPS`（data.js）：
```js
var PIPELINE_GROUPS = [
  { id: 'config',    label: '配置',    nodeIds: ['data-source-config'] },
  { id: 'discovery', label: '文献发现', nodeIds: ['keyword-extract','db-search','citation-chase','expand-search'] },
  { id: 'filter',    label: '质量筛选', nodeIds: ['abstract-screen','fulltext-read','quality-assess'] },
  { id: 'analysis',  label: '深度分析', nodeIds: ['contradiction-detect','theme-cluster','meta-analysis'] },
  { id: 'output',    label: '综述输出', nodeIds: ['outline-gen','review-write','bibtex-export'] }
];
```

#### ui.js — `renderTree()` 重构
- 按分组渲染，每组 `<div class="tree-group">`
- 组内全部完成后，组头加 `done` class + 追加 `<div class="tree-group-summary">` 组级汇总
- `GROUP_SUMMARIES` 对象（写在 ui.js）

#### asci.css 新增
```css
.tree-group { margin-bottom: 8px; }
.tree-group-header { font-size: 10px; font-weight: 700; color: var(--asci-text-muted); padding: 3px 8px; border-left: 2px solid var(--asci-blue-light); margin-bottom: 4px; }
.tree-group-header.done { border-left-color: var(--asci-green); color: var(--asci-green); }
.tree-group-summary { font-size: 10px; color: var(--asci-text-muted); padding-left: 10px; margin-top: 2px; }
```

---

## 任务 5：执行日志替换为对话交互框

#### index.html（Screen 2 中列下区，约 79-88 行）
将 `.asci-log-section` 替换为对话框结构（含消息列表 + 输入行 + 上传按钮）。

#### main.js 新增函数
- `sendChatMsg()`：关键词匹配 mock 响应
  - 含"重跑/重新/再次/调整" → 提示"请点击节点卡片右上角的 ↺ 按钮发起重跑"
  - 含"解释/什么是/为什么" → 返回当前节点 desc 扩展说明
  - 含"上传/论文/文献" → 提示使用 📎 按钮
  - 默认 → "已记录问题，实际产品中将由 LLM 实时响应"
- `handleUploadPaper()`：触发 file input，选文件后 mock 消息"已将《文件名》加入检索池"

#### asci.css 新增 `.asci-chat-*` 系列样式

---

## 任务 6：节点主动重跑

**定位**：用户对某节点结果不满意，调整参数后重跑，后续节点状态重置。
**与"上一步"区别**：上一步是线性撤销；重跑是当前节点参数调整后原地重新执行。

#### ui.js — `renderNodeResult()`
在卡片 header 右侧加重跑按钮（仅对有可调参数的节点显示）：
```js
// 有参数可调的节点：abstract-screen、db-search、keyword-extract、outline-gen
if (['abstract-screen','db-search','keyword-extract','outline-gen'].indexOf(nodeId) >= 0) {
  header += '<button class="node-retry-btn" onclick="initiateRetry(\'' + nodeId + '\')">↺ 调整重跑</button>';
}
```

#### engine.js 新增 `initiateRetry(nodeId)`
1. 弹出 modal，显示：
   - 标题："重新执行「节点名」"
   - 参数调整区（按节点差异化）：
     - `abstract-screen`：阈值滑块（放宽后 mock 纳入 28 篇，原 18 篇）
     - `db-search`：检索策略下拉（扩展后 mock 返回 341 篇，原 276 篇）
     - `keyword-extract` / `outline-gen`：说明文字"将使用调整后上下文重新执行"
   - "确认重跑" / 取消

2. 确认后：
   - 清除该节点及后续节点的 `doneSets`、`nodeState`、`nodeUserData`
   - 若有 `mockRetryResult`，写入 `node.result` 替换原数据
   - `currentNodeIdx` 回退到该节点位置
   - `renderTree()`；`showToast('已重置，点击「执行下一步」继续')`
   - `appendLog('INFO', '用户发起重跑：' + nodeName)`

data.js 新增 `mockRetryResult` 字段：
- `abstract-screen`：`{ ...原 result, included: 28, hint: '放宽阈值后纳入增加' }`
- `db-search`：`{ ...原 result, total: 341, hint: '扩展检索词后候选增加' }`

---

## 文件修改清单

| 文件 | 改动 |
|------|------|
| `tools/asci/data.js` | 各节点加 `desc`/`required`/`demoUnavailable`；Fix 1-5 数据修复；新增 `PIPELINE_GROUPS`；新增 `mockRetryResult` |
| `tools/asci/main.js` | `renderNodeGrid()` 改为卡片；移除排序函数；初始化必选节点；新增对话框函数 |
| `tools/asci/engine.js` | `calcConfidence()` 修改；`updateConfMiniChart()` 标签省略；新增 `initiateRetry()` |
| `tools/asci/ui.js` | Fix 2 NODE_SUMMARIES；新增 `renderFulltextResult()`；`renderTree()` 分组重构；重跑按钮 |
| `tools/asci/index.html` | 右侧面板改名；中列下区换对话框 HTML；移除管线列表 HTML |
| `tools/asci/asci.css` | 新增卡片样式、分组框样式、对话框样式、重跑按钮样式 |

---

## 执行顺序
0. 写项目计划文档到 `docs/plans/asci/2026-04-04-asci-ui-improvements.md`（Plan Mode 限制只能在全局目录规划，执行阶段第一步补写到项目目录）
1. `data.js`（数据修复 + 新增字段，其他文件依赖）
2. `index.html`（HTML 结构变化）
3. `asci.css`（新增样式）
4. `main.js`（Screen 1 重构 + 对话框逻辑）
5. `ui.js`（renderFulltextResult + renderTree 分组 + 重跑按钮）
6. `engine.js`（calcConfidence + miniChart + initiateRetry）

## 验证方法
1. **Screen 1**：节点展示为信息卡片，有名称+描述+风险标签；必选节点无法取消；灰色节点点击 toast 提示；无排序列
2. **深度分析模板执行**：
   - fulltext-read 只显示发现列表，底部提示"1 处矛盾待后续处置"
   - contradiction-detect 正常显示矛盾处置（数量显示"1 处"）
   - 时间线有分组框，组完成后显示汇总文字
   - 中列下区是对话框，可发消息和上传 PDF
   - 已完成节点卡片右上角有"↺ 调整重跑"（仅部分节点），点击弹出参数面板
3. **数据一致性**：quality-assess 时间线摘要显示"8 篇 A / 11 篇 B / 2 篇 C"；db-search 重跑后纳入数从 276 变 341
4. **9 个节点**：置信度图标签变为序号格式
