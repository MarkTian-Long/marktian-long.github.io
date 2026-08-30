# AI 产品研究档案

## 这是什么

这是一个静态、可回查的 AI 产品拆解档案库。它不做实时榜单，也不把未经人工逐项事实复核的规模、营收、估值或模型排名包装成结论；每条档案把产品判断、关键取舍、公开来源和仍待复核的问题放在一起，方便产品评估、竞品讨论和迁移前复盘。

当前保留 9 个产品档案：ChatGPT、Midjourney、DeepSeek、Claude、Cursor、Notion AI、Sora、Perplexity、Claude Code。Sora 以历史档案呈现，但按 surface 区分 Web、App 与 API 的生命周期，避免把 Web/App 的停止服务外推成所有入口的同一状态。

## 使用方式

1. 在类别或决策主题中筛选档案，组合筛选可缩小比较范围。
2. 打开一条档案，使用五个分区阅读：决策摘要、产品机制、竞争取舍、证据账本、演化与边界。
3. 通过 `?product=<id>&tab=<tab-id>` 直接打开指定产品和分区；无效参数会保留列表并给出提示。
4. 在档案内使用 Tab 移动焦点、方向键切换分区、Esc 关闭弹窗；关闭后焦点回到打开按钮。

页脚工作流按固定顺序连接：`1 信源 → 2 信号 → 3 分析 → 4 方法`。四项均使用工具目录内的相对链接，本页 `3 分析` 是唯一带 `aria-current="step"` 的步骤，导航保留 `nav[data-workflow-nav]` 契约。

## 数据契约

数据源是 [`data/products.json`](data/products.json)，页面只通过静态 JSON 加载，不调用模型、爬虫或公开 API。每个产品至少包含：

- `id`、`name`、`company`、`category`、`lifecycle`、`archiveDate`、`factReviewStatus`
- `thesis`：作者判断及其 `evidenceRefs`
- `decisionThemes`：用于主题筛选的稳定主题 ID
- `decisions`：至少三条，每条包含选择、原因、取舍和来源引用
- `uncertainties`：至少两条，明确开放问题、观察状态或边界
- `keyMetrics`：每项包含定义、`kind`、`asOf`、`sourceRefs` 和 caveat；本档案的定性 `external-research` 指标中，`asOf` 也表示档案整理日期，不是性能测量日期；`kind` 只能是 `target`、`proxy`、`offline-measured`、`production-result`、`external-research`
- `sources`：带唯一 ID、标题、日期、类型和 HTTPS URL 的来源账本；`date` 的语义是档案整理日期，不是来源发布日期，也不代表该 URL 已在该日被访问核验
- `surfaces`（可选）：按 Web、App、API 等入口记录状态、状态日期、可用窗口、计划退役日期和来源引用；不同入口的状态不得合并为一个结论
- `tabs.summary`、`tabs.mechanism`、`tabs.tradeoffs`、`tabs.evidence`、`tabs.evolution`

引用不存在的来源会使档案在质量测试中失败。`archiveDate` 和 `sources[].date` 表示本地档案整理日期；它们不是来源发布日期或 URL 访问/核对日期。`factReviewStatus` 当前明确为“待人工事实复核”，不能把档案整理日期解读为已完成联网核验。产品事件日期只在时间线中单独表达。缺少直接来源的判断会明确显示“暂无直接来源”，而不是补造证据。

## 本地运行

页面需要 HTTP 服务才能读取 JSON，不能直接双击 `index.html`。从仓库根目录启动任意静态服务器，然后打开：

```text
http://127.0.0.1:<port>/tools/ai-insights/index.html
```

## 验证

静态数据契约测试：

```powershell
cd scripts
node --test ai-insights-depth.test.js
```

浏览器测试使用 Node 内置 `node:test`、Playwright Chromium 和项目的 `createStaticServer`：

```powershell
cd scripts
npm test -- ai-insights-depth.browser.test.js
```

浏览器测试覆盖筛选、空结果、五个分区深链（逐个从全新 URL 打开并覆盖刷新）、无效深链、键盘可用性、焦点恢复、history Back、工作流链接以及 404、非法 JSON、部分无效记录、重复 ID、恶意文本、非法 URL 和重试恢复。默认先启动 Playwright bundled Chromium；若其因 `spawn EPERM` 启动失败，测试会自动回退到本机 Edge。仍可用 `PLAYWRIGHT_EXECUTABLE_PATH` 显式指定浏览器路径，且优先级最高。

## 维护边界

- 修改产品事实前，优先核对官方页面；只写入可以回查的公开事实和明确的个人判断。
- 不在本工具中接入实时抓取、模型调用或公开 API key。
- 新增产品应补齐完整契约、来源引用、反证/迁移边界和档案整理日期，并明确事实复核状态；如需完成事实核验，应先逐一记录实际打开的官方来源和核对日期，再单独更新数据与测试。
- 页面视觉改动完成后，要在桌面和移动视口进行真实页面截图审查，特别检查弹窗、来源账本、键盘焦点和横向溢出。
