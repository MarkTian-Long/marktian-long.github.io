# 前沿雷达深化 Implementation Plan

> **For Codex:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 把静态外链墙深化为可按研究意图选择信源、理解覆盖与盲区、完成后交接给热点快照的个人 AI 信源操作台。

**Architecture:** 将硬编码内容迁移到可被 `file://` 使用的经典 JS 数据文件；页面仅做本地筛选与排序，不在浏览器探测外链、不引入收藏同步或后端。

**Tech Stack:** HTML/CSS、Vanilla JS、Node test runner、Playwright。

---

### Task 1: 数据化信源与研究路线

**Files:**
- Create: `tools/radar/data.js`
- Create: `scripts/radar-depth.test.js`

**Step 1:** 写失败测试，约束 `meta`、`intents`、`sources` 与 `workflowTools` 的唯一 ID、安全 HTTPS URL、日期和枚举。

**Step 2:** 要求每个研究意图引用至少两种来源，每个来源包含语言、类型、角色、主题、更新节奏、优先级、访问方式、适合任务、盲区、保留理由、最近复核和人工状态。

**Step 3:** 将现有 11 个信源逐项迁移；把工具区改成“搜索 → 验证 → 综合 → 沉淀”处理栈，无明确关系的创作工具移出本页。

**Step 4:** 运行 `node --test radar-depth.test.js`，由 RED 转 GREEN。

### Task 2: 页面任务与交互

**Files:**
- Modify: `tools/radar/index.html`
- Create: `tools/radar/style.css`
- Create: `tools/radar/app.js`
- Create: `scripts/radar-depth.browser.test.js`

**Step 1:** 先写 `node:test + Playwright chromium + createStaticServer` 浏览器失败测试，覆盖意图预设改变推荐顺序、语言/类型/主题/优先级组合筛选、清空条件、键盘操作、外链安全属性，以及阻断 `data.js` 后的可读降级且无未处理异常。

**Step 2:** 页面加入可信边界、四个研究意图、覆盖摘要、带 `priority/access/bestFor/blindSpot/retentionReason/lastCheckedAt` 的信源列表和处理栈。

**Step 3:** 实现默认、预设选中、组合筛选、无结果并重置、数据脚本缺失状态；状态为人工复核，不冒充实时可达检测。

**Step 4:** 页尾加入四步信息工作流并明确下一步进入 Trends；断网或 `file://` 打开时核心筛选仍可运行。

### Task 3: 维护说明与验证

**Files:**
- Modify: `tools/radar/README.md`
- Test: `scripts/radar-depth.test.js`
- Test: `scripts/radar-depth.browser.test.js`

**Step 1:** README 记录字段、季度复核流程、链接状态语义和不做实时探测的限制。

**Step 2:** 运行局部数据与浏览器测试，并对 `data.js`、`app.js` 执行 `node --check`。

**Step 3:** 视觉检查 1440×900 默认/意图预设/空态，以及 390×844 筛选、长文案、焦点态和 44px 触控目标。

**Step 4:** 返回修改文件、RED/GREEN 证据和限制；共享 manifest 与首页留给主任务。
