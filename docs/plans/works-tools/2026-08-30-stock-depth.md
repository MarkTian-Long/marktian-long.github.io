# A股 AI 助手深化 Implementation Plan

> **For Codex:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 把混合 Mock、公共行情代理和静态文案的六 Tab 演示深化为证据来源、引用、工具执行与治理边界可见的金融研究流程原型。

**Architecture:** 默认只用确定性演示快照；用户主动切换后才请求外部行情，成功与失败都不静默混入 Mock。六 Tab 共享一个研究会话和来源契约，不接交易、真实模型或后端。

**Tech Stack:** HTML/CSS、Vanilla JS、Node test runner。

---

### Task 1: 锁定行情与来源契约

**Files:**
- Modify: `scripts/stock-rendering.test.js`
- Create: `scripts/stock-workflow.test.js`
- Create: `scripts/stock-workflow.browser.test.js`

**Step 1:** 写失败测试，要求行情统一返回 `kind/source/transport/marketAsOf/fetchedAt/rows`；未知股票不能回退茅台，网络失败不能静默混入 Mock，数值 close 必须保留。

**Step 2:** 测试禁止“LLM 实时生成”“引用准确率达标”“≤3 次修改”“Secrets 注入”“35 万条”等未实现声明。

**Step 3:** 运行两个局部测试并确认当前实现失败。

**Step 4:** 浏览器测试采用 `node:test + Playwright chromium + createStaticServer`，通过可注入 fetch 或路由夹具固定联网成功、超时、HTTP 错误、非法 JSON 和全部代理失败；真实外网调用不作为阻断测试。

### Task 2: 统一研究会话与行情降级

**Files:**
- Modify: `tools/stock/app.js`
- Modify: `tools/stock/index.html`

**Step 1:** 默认使用稳定演示快照；用户明确切换“联网行情”后才访问 Yahoo。成功显示原始来源、代理传输、市场时间和抓取时间，不称实时。

**Step 2:** 联网失败显示重试或改用演示快照，不自动替换；提供完整证据、资料冲突/过期、数据缺失三个确定性场景。

**Step 3:** 行情页用本地规则生成趋势摘要并声明非模型结论；诊断页改为证据完整度与待核查项，不给无依据买入/持有置信度。

**Step 4:** 每次运行记录 runId、scenario、dataMode、sourceIds 和版本，形成六 Tab 可见的研究会话摘要。

### Task 3: RAG、反馈与引用闭环

**Files:**
- Modify: `tools/stock/app.js`
- Modify: `tools/stock/index.html`

**Step 1:** “实时市场库”改为带固定 `asOf` 的演示资料；关键词召回与规则重排如实命名，不称 LLM 精排。

**Step 2:** 场景化静态研报草稿的引用编号可跳回来源卡；逐 Claim 显示 sourceId、证据级别、数据时间和未解决冲突。质量卡仅保留有效引用编号覆盖、证据桶完整度等 proxy 与字数 target。

**Step 3:** 每个 run 仅能提交一次最终反馈，记录“问题类型 → 修复对象 → 回归结果”并支持 JSON 导出；私有知识库只在内存存在并明确不上传、不持久化。

### Task 4: Radar、Agent 与治理

**Files:**
- Modify: `tools/stock/app.js`
- Modify: `tools/stock/index.html`

**Step 1:** Radar 使用确定性快照和筛选，不再随机生成值或写当前时间。

**Step 2:** Agent 改为任务理解、工具计划、执行记录、证据汇总、人工确认；按问题选择工具，单工具失败时显示 partial 且不生成完整结论。

**Step 3:** 治理区只描述实际实现，删除 Secrets 注入、虚构数据量/清洗能力和未核验法规名称；`proxy.py` 标注为未参与公开页面的历史本地工具，不删除。

### Task 5: 文档与验证

**Files:**
- Modify: `tools/stock/README.md`
- Test: `scripts/stock-rendering.test.js`
- Test: `scripts/stock-workflow.test.js`
- Test: `scripts/stock-workflow.browser.test.js`

**Step 1:** README 记录外部快照、演示夹具、本地计算、静态文案、用户输入五类来源，以及非投资建议/无生产评估边界。

**Step 2:** 运行局部测试和 `node --check tools/stock/app.js`。

**Step 3:** 视觉检查 1440×1000 六 Tab、联网成功/失败、无检索、Agent partial、反馈提交，以及 390×844 Tab、RAG/Agent 堆叠、长引文和免责声明。

**Step 4:** 返回修改文件、RED/GREEN 证据和限制；首页、共享证据与 manifest 由主任务处理。
