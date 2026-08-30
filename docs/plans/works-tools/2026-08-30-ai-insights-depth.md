# AI 产品拆解深化 Implementation Plan

> **For Codex:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 把 9 个产品的七 Tab 资料陈列深化为证据可追溯、结论有边界、可按决策主题检索的 AI 产品决策档案。

**Architecture:** 保持静态 JSON 与纯前端运行；先建立内容契约，再以安全 DOM 渲染卡片和详情，支持 URL 深链、筛选、键盘交互与错误降级。不上实时抓取或模型调用。

**Tech Stack:** JSON、HTML/CSS、Vanilla JS、Node test runner、Playwright。

---

### Task 1: 锁定档案与证据契约

**Files:**
- Modify: `tools/ai-insights/data/products.json`
- Create: `scripts/ai-insights-depth.test.js`

**Step 1:** 写失败测试，要求每个产品具有唯一 `id`、`reviewedAt`、`reviewDueAt`、`thesis`、`decisionThemes`、至少三条 `decisions` 与两条 `uncertainties`。

**Step 2:** 要求 thesis/decision 的 `evidenceRefs` 可解析到 `sources`；每条公开指标具有 `definition`、五类合法 `kind`、`asOf`、`sourceRefs` 和 `caveat`；来源 URL 必须是 HTTPS。

**Step 3:** 运行 `node --test ai-insights-depth.test.js`，确认旧数据因缺字段与无依据数字失败。

**Step 4:** 逐项审计现有 9 个产品并迁移；无可复核来源的数字删除、降为待核实或改为定性判断，不新增产品凑数。

### Task 2: 重构产品任务与安全渲染

**Files:**
- Modify: `tools/ai-insights/index.html`
- Modify: `tools/ai-insights/script.js`
- Modify: `tools/ai-insights/style.css`
- Create: `scripts/ai-insights-depth.browser.test.js`

**Step 1:** 先写浏览器失败测试，覆盖类别/决策主题筛选、`?product=<id>&tab=<id>` 深链、非法深链降级和筛选空态。

**Step 1a:** 浏览器测试使用 `node:test + Playwright chromium + createStaticServer`；拦截 `products.json` 分别返回 404、非法 JSON、部分非法记录和全非法记录，验证有效记录保留、可读错误与重试恢复。

**Step 2:** 将详情收敛为“决策摘要、产品机制、竞争取舍、证据账本、演化与边界”，卡片前置个人判断、复核日期、主题和证据数。

**Step 3:** 动态数据全部用 DOM API 与 `textContent` 输出；恶意文本不能生成 HTML。产品卡、dialog 和 Tab 补齐焦点圈定、Esc、焦点恢复、方向键与 ARIA 状态。

**Step 4:** 页面头显示“静态研究档案、非实时、最近复核”；详情清晰展示反证、迁移边界、缺失来源和待复核状态。

### Task 3: 错误状态、工作流与文档

**Files:**
- Modify: `tools/ai-insights/index.html`
- Modify: `tools/ai-insights/script.js`
- Modify: `tools/ai-insights/README.md`

**Step 1:** 实现加载、部分记录无效、全部失败并重试、筛选空态与非法深链状态；`file://` 模式明确提示使用本地 HTTP 服务。

**Step 2:** 页尾加入“Radar → Trends → AI Insights → Agent Hub”链路，当前步骤为分析；提供上游 Trends 和下游 Agent Hub 链接。

**Step 3:** README 记录数据字段、证据类型、复核流程、静态边界与本地运行方式。

### Task 4: 验证

**Files:**
- Test: `scripts/ai-insights-depth.test.js`
- Test: `scripts/ai-insights-depth.browser.test.js`

**Step 1:** 运行两个局部测试并对 `script.js` 执行 `node --check`。

**Step 2:** 视觉检查 1440×900 默认/筛选/五类详情/错误态，以及 390×844 全屏详情、长来源、焦点态和无横向溢出。

**Step 3:** 返回修改文件、RED/GREEN 证据、截图状态和限制；共享首页、manifest 与 portfolio evidence 留给主任务。
