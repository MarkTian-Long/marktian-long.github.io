# Agent 认知全景深化 Implementation Plan

> **For Codex:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 把框架与架构陈列页深化为约束驱动的 Agent 决策手册，允许明确得出“不需要 Agent”，并解释人工控制、失败与退出条件。

**Architecture:** 把事实、规则、场景和判断迁移到可被浏览器与 Node 共用的数据模型；用纯函数规则引擎生成确定、可追踪的建议，页面只负责输入和解释，不调用模型。

**Tech Stack:** HTML/CSS、Vanilla JS、Node test runner、Playwright。

---

### Task 1: 决策数据与规则契约

**Files:**
- Create: `tools/agent-hub/data/decision-model.js`
- Create: `tools/agent-hub/decision-engine.js`
- Create: `scripts/agent-hub-depth.test.js`

**Step 1:** 写失败测试，要求 meta、六个问题、可解释 outcomes、四类架构、六个企业场景、六条判断、框架事实与来源完整且 ID 可解析。

**Step 2:** 规则覆盖传统自动化、RAG/助手、单 Agent+工具、主从并行和人工方案评审；只有多个可独立子任务才推荐并行多 Agent。

**Step 3:** 高风险/不可逆动作必须包含预览、HITL、审计与停止条件；输入不足或矛盾时撤回自动建议。相同输入结果必须稳定，并显示命中规则和排除项。

**Step 4:** 所有数字指标声明合法 `kind`；无来源的 247k Stars、40% 节省与 ROI 结果删除、改为目标或补齐官方来源与日期。

### Task 2: 重构决策器与解释页面

**Files:**
- Modify: `tools/agent-hub/index.html`
- Create: `tools/agent-hub/app.js`
- Create: `scripts/agent-hub-depth.browser.test.js`

**Step 1:** 写浏览器失败测试，覆盖六问键盘操作、不同预设的不同方案、高风险强制人工控制、失败路径、过期资料、数据缺失和完整 Tab ARIA。

**Step 1a:** 浏览器测试使用 `node:test + Playwright chromium + createStaticServer`，通过阻断数据脚本和冻结时间稳定复现缺失/过期状态。

**Step 2:** 首屏加入 H1、用途、静态/无模型/无生产数据边界和四步信息链路；先判断是否需要 Agent，再显示框架事实。

**Step 3:** 结果包含推荐模式、命中规则、排除替代、正常链路、HITL、失败降级、停止条件与带类型的评估指标。

**Step 4:** 企业场景改为预填决策器；客服与文档场景分别链接 Service Agent 和 ESOP。框架资料超过 90 天标待复核，超过 180 天不再显示当前推荐。

### Task 3: 深化架构、场景与判断

**Files:**
- Modify: `tools/agent-hub/index.html`
- Modify: `tools/agent-hub/data/decision-model.js`

**Step 1:** 四种拓扑补齐适用/不适用条件、故障传播、重试与停止边界、HITL 和最小可观测信息。

**Step 2:** 六个企业场景补齐输入假设、人工责任、目标/代理指标、测量方法和停止条件。

**Step 3:** 六条判断标为设计原则或待验证假设，并补适用条件、决策规则、证据、反例和改变判断所需的新证据。

### Task 4: 文档与验证

**Files:**
- Modify: `tools/agent-hub/README.md`

**Step 1:** README 与数据中的问题、场景、判断数量一致，记录复核周期、规则优先级和静态边界。

**Step 2:** 运行数据/引擎/浏览器测试并对新 JS 执行 `node --check`。

**Step 3:** 视觉检查 1440×900 初始/低风险/高风险/框架证据/故障路径，以及 390×844 逐项作答/结果/Tab/长来源和无裁切。

**Step 4:** 返回修改文件与验证；manifest、首页与共享证据由主任务处理。
