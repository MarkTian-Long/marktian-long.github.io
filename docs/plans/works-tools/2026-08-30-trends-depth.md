# 热点快照深化 Implementation Plan

> **For Codex:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 把五个平台的过期热榜陈列深化为可追溯、可过期、可按行动筛选的跨平台 AI 信号研判台。

**Architecture:** 使用同一份 v2 contract 驱动浏览器、采集脚本与 Node 测试；网络抓取只生成候选，公开写入只接受人工复核的完整 JSON。页面渲染静态快照，不实时抓取。

**Tech Stack:** JSON、HTML/CSS、Vanilla JS、Node.js、Playwright。

---

### Task 1: 建立 v2 快照契约

**Files:**
- Create: `tools/trends/contract.js`
- Create: `scripts/trends-depth.test.js`
- Modify: `tools/trends/data/trends.json`

**Step 1:** 写失败测试，要求 snapshot 元数据、稳定 ID、采集模式、排名依据、来源时间、观察/复核时间、`review_scope`、`facts_verified_at`、验证级别、行动类别与判断结构完整；结构检查不得冒充历史事实核验。

**Step 2:** 指标必须具有合法 `kind`、`as_of` 和来源 URL；featured ID 必须存在；`deep_dive` 条目必须有下一研究问题；危险协议、泛化重复 URL、占位项和未复核记录必须被拒绝。

**Step 2a:** freshness 由接收显式 `now` 的纯函数计算，单测 7/8/30/31 天、未来日期和非法日期；浏览器测试冻结时钟，不依赖真实运行日。

**Step 3:** 迁移公开数据为 v2。无法在本轮联网核实的旧内容保留为“历史快照”，不伪造 2026-08-30 的来源日期或热度。

### Task 2: 收紧采集与发布边界

**Files:**
- Modify: `scripts/fetch-trends.js`
- Test: `scripts/trends-depth.test.js`

**Step 1:** 默认模式只校验公开快照且不写文件；`--discover --candidate <path>` 只把自动发现结果写到限定候选目录，候选不是已复核公开数据。

**Step 2:** 候选抓取失败记录诊断状态，不以 Product Hunt 榜单页或其他占位项冒充热点；GitHub/HN 自动结果只称候选发现。

**Step 3:** 公开 `--write` 仅接受通过 contract、已人工复核的输入；相对路径、绝对路径和含 `..` 的路径统一按解析后的真实目标判界，只有逃出允许目录时才失败。测试仓库外目标、候选目录外目标和未复核输入均在写入前失败，成功用例先完成全部门禁，再经同目录临时文件原子重命名。数据过期给出明确警告，但另设显式 freshness 门禁用于维护。

### Task 3: 重构信号研判页面

**Files:**
- Modify: `tools/trends/index.html`
- Create: `tools/trends/app.js`
- Create: `scripts/trends-depth.browser.test.js`

**Step 1:** 先写 `node:test + Playwright chromium + createStaticServer` 浏览器失败测试，覆盖真实 JSON 加载、冻结时钟后的快照状态、Tab 键盘切换、行动筛选、判断展开 ARIA、过期/404/非法 JSON/空板块/无结果状态。

**Step 2:** 页面加入四步工作流、可信边界、本期核心信号、来源 Tab、行动筛选、信号卡和方法限制；“Claude/Codex 点评”统一为“我的判断”。

**Step 3:** 每条判断显示变化、证据、影响、不确定性和下一步；外部数据以 `textContent` 输出，链接使用安全协议与 `noopener noreferrer`。

**Step 4:** 0–7 天显示本期，8–30 天显示建议复核，超过 30 天显示“历史快照，不代表当前热度”；不得继续使用“最新”措辞。

### Task 4: 文档与验证

**Files:**
- Modify: `tools/trends/README.md`

**Step 1:** README 记录 v2 字段、AI 辅助/人工复核范围、候选与公开写入流程、过期规则和当前来源限制。

**Step 2:** 运行局部数据、CLI 和浏览器测试；对 `contract.js`、`app.js`、`fetch-trends.js` 执行 `node --check`。

**Step 3:** 视觉检查 1440×900 默认/展开/筛选/历史/加载失败，以及 390×844 Tab/无结果/长标题/展开判断。

**Step 4:** 返回修改文件与验证；`update-trends` skill 同步、manifest 和首页由主任务处理。
