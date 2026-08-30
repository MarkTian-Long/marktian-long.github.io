# 智能客服产品设计沙盘深化 Implementation Plan

> **For Codex:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 把现有多场景客服沙盘深化为可注入故障、可复盘决策、明确证据口径的纯前端产品实验台。

**Architecture:** 继续以 `gen_index.js` 作为唯一生成源，在现有场景、决策卡和 Mock 对话之上增加场景验收卡、故障注入和运行复盘。生成后的 `index.html` 仍是唯一公开页面，不新增后端或模型调用。

**Tech Stack:** Node.js 生成器、HTML/CSS、Vanilla JS、Node test runner。

---

### Task 1: 锁定可信度与生成契约

**Files:**
- Create: `scripts/service-agent-depth.test.js`
- Create: `scripts/service-agent-depth.browser.test.js`
- Modify: `tools/service-agent/gen_index.js`
- Generated: `tools/service-agent/index.html`

**Step 1:** 写失败测试，读取生成器与公开 HTML，断言：首页不再出现“跑真实对话”；首屏包含“完整模拟链路”和 Mock 边界；生成器存在场景验收数据、故障数据与复盘渲染入口。

**Step 2:** 运行 `node --test service-agent-depth.test.js`，确认因新契约缺失而失败。

**Step 3:** 在 `gen_index.js` 增加 `DEMO_META`，至少包含 `mode`、`reviewedAt`、`realParts`、`mockParts`、`limitations`，并由首屏渲染。

**Step 4:** 把所有“真实对话”表述改为“完整模拟链路”，不得弱化现有 Mock 徽章。

**Step 5:** 运行 `node tools/service-agent/gen_index.js --write`，再运行测试并确认通过。

### Task 2: 场景验收卡

**Files:**
- Modify: `tools/service-agent/gen_index.js`
- Generated: `tools/service-agent/index.html`

**Step 1:** 为 `SCENARIOS` 增加 `successMetric`、`hardGuardrail`、`costConstraint`、`hitlPolicy`；每个字段同时包含 `kind`（仅 `target` 或 `proxy`）与说明。

**Step 2:** 在场景选择器下方渲染验收卡，并在 `selectScenario()` 中与标签、决策矩阵和 Demo 同步更新。

**Step 3:** 切换银行、电商、创业场景，验证四个字段全部改变且没有残留上一场景内容。

### Task 3: 故障注入

**Files:**
- Modify: `tools/service-agent/gen_index.js`
- Generated: `tools/service-agent/index.html`
- Test: `scripts/service-agent-depth.test.js`

**Step 1:** 为每个场景定义四类 `FAULT_CASES`：过期知识、Prompt 注入、无权限数据查询、低置信意图。每类包含输入、触发节点、预期 guardrail、最终处置和风险级别。

**Step 2:** 在 Demo 快捷任务旁增加“故障演练”选择器；运行前重置节点、日志、HITL 与复盘状态。

**Step 3:** 扩展 `runChat()` 或新增 `runFaultCase()`，确保故障改变节点状态并产生拒答、降级或 HITL，而不是只显示提示文字。

**Step 4:** 测试断言四类故障均有不同的 `expectedOutcome`，无权限 SQL 不会进入数据返回状态。

### Task 4: 运行复盘与导出

**Files:**
- Modify: `tools/service-agent/gen_index.js`
- Generated: `tools/service-agent/index.html`
- Test: `scripts/service-agent-depth.test.js`

**Step 1:** 增加运行态 `runTrace`，记录场景、用户任务、经过节点、guardrail、HITL 动作、最终状态和待人工项。

**Step 2:** 正常或故障流程结束后渲染复盘卡；不得生成虚构耗时、准确率或节省成本。

**Step 3:** 增加 JSON 导出，导出版本、演示模式、当前场景九张决策卡、验收卡、运行轨迹和限制，不包含真实用户信息。

**Step 4:** 验证重新开始会清空旧轨迹，场景切换不会复用旧复盘。

### Task 5: 证据与文档

**Files:**
- Modify: `tools/service-agent/gen_index.js`
- Modify: `tools/service-agent/README.md`
- Generated: `tools/service-agent/index.html`

**Step 1:** 为决策卡外部数字增加 `kind: external-research`、来源日期与链接；无法可靠说明日期的数字改为定性原则。

**Step 2:** README 补充场景验收、故障演练、复盘导出和 Mock 边界。

**Step 3:** 运行生成器 check 模式和显式 write 模式，确认生成物同步。

### Task 6: 验证与交付

**Files:**
- Test: `scripts/service-agent-depth.test.js`

**Step 1:** 运行 `node --test service-agent-depth.test.js`。

**Step 1a:** 运行 `node --test service-agent-depth.browser.test.js`；测试使用 `node:test + Playwright chromium + createStaticServer`，实际切换三场景、运行四类故障、HITL、导出和 restart，断言节点/日志/复盘同步且无权限路径从未进入数据返回状态。

**Step 2:** 从 `scripts/` 运行 `cmd /c npm run check`。

**Step 3:** 用 1440×900 和 390×844 检查默认电商、银行故障注入、HITL 和复盘状态。

**Step 4:** 返回修改文件、测试、截图状态和限制；由主任务审查后提交。
