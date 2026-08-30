# ASCI 科研任务执行系统深化 Implementation Plan

> **For Codex:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 把现有科研 Agent 演示深化为带研究协议、人工决策审计和可复现过程清单的纯前端任务编排器。

**Architecture:** 保留现有多文件状态机，在 `data.js` 中集中声明演示边界与研究协议，在 `main.js`/`engine.js` 中记录审计事件，在 `ui.js` 中呈现和导出过程清单。现有管线、回退与降级逻辑不重写。

**Tech Stack:** HTML/CSS、Vanilla JS、Node test runner。

---

### Task 1: 建立深化契约测试

**Files:**
- Create: `scripts/asci-depth.test.js`
- Modify: `tools/asci/data.js`
- Modify: `tools/asci/index.html`

**Step 1:** 写失败测试，断言存在 `DEMO_META`、`RESEARCH_PROTOCOLS`、审计轨迹结构和过程清单导出；首屏明确输入主题不会触发真实论文检索。

**Step 2:** 运行 `node --test asci-depth.test.js`，确认缺失契约时失败。

**Step 3:** 在 `data.js` 增加演示元数据与研究协议数据；协议至少包含问题、年份、来源、纳入/排除规则和交付物。

**Step 4:** 在 `index.html` 首屏加入可见边界说明，移除“修改主题后可展示真实 Agent 适配能力”的误导表达。

### Task 2: 研究协议预检

**Files:**
- Modify: `tools/asci/index.html`
- Modify: `tools/asci/asci.css`
- Modify: `tools/asci/main.js`
- Modify: `tools/asci/data.js`

**Step 1:** 在 Screen 1 增加研究协议摘要卡，与模板选择和节点预览并列但不挤占操作区。

**Step 2:** 主题输入只影响任务标题；固定演示数据包必须显示对应主题和适用范围。若用户修改为非预设主题，启动按钮旁显示“流程演示，结果仍使用预设数据包”。

**Step 3:** `startTask()` 把当前协议快照写入任务状态，restart 时恢复默认。

### Task 3: 人工决策审计轨迹

**Files:**
- Modify: `tools/asci/main.js`
- Modify: `tools/asci/engine.js`
- Modify: `tools/asci/ui.js`
- Test: `scripts/asci-depth.test.js`

**Step 1:** 新增 `auditTrail` 和 `recordAuditEvent(event)`，事件字段为版本、时间、节点、动作、理由、影响范围和模式。

**Step 2:** 在摘要筛选、矛盾处置、回退、动态插入、重跑、降级和人工草稿路径记录事件。

**Step 3:** restart 清空轨迹；回退保留“发生过回退”的审计事实，但清除失效结果状态。

**Step 4:** 将关键状态转换提取为可调用函数并做行为测试，逐条触发摘要筛选、矛盾、回退、插入、重跑、降级和人工草稿，断言审计事件字段、顺序与影响范围；restart 必须清空轨迹，回退必须保留回退事实并清除失效结果。

### Task 4: 可复现过程清单

**Files:**
- Modify: `tools/asci/index.html`
- Modify: `tools/asci/asci.css`
- Modify: `tools/asci/ui.js`
- Test: `scripts/asci-depth.test.js`

**Step 1:** 在 Screen 3 增加“本次过程清单”，显示研究协议、实际执行节点、动态插入、HITL 决策、排除项、矛盾处置、降级和人工编辑。

**Step 2:** 把现有置信度标题改为“模拟流程指标”，并提供说明：不代表论文真实性或综述正确率。

**Step 3:** 实现 `buildProcessManifest()` 与 JSON 导出；输出只包含演示过程和结构化摘要。

**Step 4:** 导出按钮失败时恢复状态并显示可读提示。

**Step 5:** 通过可注入下载适配器模拟 Blob/下载失败，断言按钮和提示恢复；不得只用源码字符串匹配证明行为。

### Task 5: README 与回归

**Files:**
- Modify: `tools/asci/README.md`
- Test: `scripts/asci-depth.test.js`

**Step 1:** README 增加研究协议、审计轨迹、过程清单、固定数据包和指标语义。

**Step 2:** 运行 `node --check` 检查 `data.js`、`main.js`、`engine.js`、`ui.js`。

**Step 3:** 运行 `node --test asci-depth.test.js` 与全量 `cmd /c npm run check`。

**Step 4:** 用 1440×900 和 390×844 检查快速综述默认态、摘要 HITL、三次失败降级和最终过程清单。

**Step 5:** 返回修改文件、测试、截图状态和剩余限制；由主任务审查后提交。
