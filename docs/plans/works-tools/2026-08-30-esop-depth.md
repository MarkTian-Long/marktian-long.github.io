# ESOP 字段提取深化 Implementation Plan

> **For Codex:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 把固定结果演示深化为 ESOP 文档抽取、证据核验与人工复核工作台，并纠正准确率、PDF 页数和敏感数据持久化等失真边界。

**Architecture:** 保持纯前端；默认模式只运行三个明确夹具，现有自定义 API 仅由用户主动选择且凭证只在当前会话存在。模型原始输出、人工复核和指标分层存放；新结果仅保留在会话内。

**Tech Stack:** HTML/CSS、Vanilla JS、Node test runner。

---

### Task 1: 可信度与隐私契约

**Files:**
- Create: `scripts/esop-extractor-depth.test.js`

**Step 1:** 写失败测试：高置信字段占比只能标为 `proxy`，不能称准确率；`≥95%` 只能标成未测量 target。

**Step 2:** 测试人工纠正保留原始值和原 confidence；来源分为 exact/partial/missing；PDF 不能按文件大小虚构页数。

**Step 3:** 测试默认夹具与自由文本不会被标为真实抽取；新抽取结果不再自动写入 `qiuzhi_esop_last_result`。

**Step 3a:** 负路径测试只允许 HTTPS（显式 loopback 调试除外），拒绝 URL credentials、非法协议和畸形 URL；Authorization 只能发往用户确认的 origin，错误信息脱敏。枚举 localStorage/sessionStorage，确认 Key、endpoint、model、输入和新结果均未持久化。

**Step 4:** 运行 `node --test esop-extractor-depth.test.js`，确认当前实现失败。

### Task 2: 重构运行与复核模型

**Files:**
- Modify: `tools/esop-extractor/app.js`

**Step 1:** 增加 `runMeta`：runId、mode、scenarioId、schemaVersion、开始/完成时间；默认提供标准、缺失/歧义、逻辑冲突三个输入结果一一对应的夹具。

**Step 2:** 自定义 API 才接受自由文本，调用前显示目标域名和数据外发提示；空输入、缺 key、网络/限流、非法 JSON、schema 缺字段均有可操作错误态。

**Step 3:** confidence 保持只读，人工结果写入独立 `reviews[path]`，状态为 accepted/corrected/unresolved。

**Step 4:** 指标改为字段覆盖、模型自报高置信占比、来源声明覆盖、可定位证据覆盖、复核进度和规则异常数；引文必须与输入做 exact/partial/missing 匹配。

**Step 5:** 为三个夹具提供合成标注答案，评估模式计算样例级 exact match、完整率和可定位证据覆盖；结果标为 `offline-measured` 并显示样例范围、版本与日期。

**Step 6:** 停止自动持久化新结果；检测到旧 key 时只提示用户选择加载或清除，不静默读取或删除。

**Step 7:** Bad Case 记录根因分类、修复对象、Prompt/schema 版本和回归结果；人工纠正不能覆盖模型原始值或原始 confidence。

### Task 3: 形成复核操作台

**Files:**
- Modify: `tools/esop-extractor/index.html`

**Step 1:** 首屏增加模式/隐私/指标边界、场景选择和六步处理状态；结果头始终显示 Demo 或自定义 API 模式。

**Step 2:** 结果表展示原始值、有效值、模型置信度、证据匹配和复核状态；增加待复核队列、异常规则与 Bad Case 修复对象/回归结果。

**Step 3:** PDF 仅显示真实文件名和大小，并明确默认演示不读取 PDF 内容；样式只使用已有或新增在 `:root` 的变量。

### Task 4: 文档与验证

**Files:**
- Modify: `tools/esop-extractor/README.md`
- Test: `scripts/esop-extractor-depth.test.js`

**Step 1:** README 明确三个夹具、自定义 API 外发、固定 PDF 边界、会话内数据、旧存储选择和指标语义。

**Step 2:** 运行局部测试和 `node --check tools/esop-extractor/app.js`。

**Step 3:** 视觉检查 1440×1000 标准/冲突/复核/API 错误，以及 390×844 单列、表格滚动、弹窗和焦点态。

**Step 4:** 返回修改文件、RED/GREEN 证据和限制；首页与 portfolio evidence 由主任务处理。
