# 作品与工具内容深化 Implementation Plan

> **For Codex:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 在保持纯前端与首页极简结构的前提下，把 8 个作品/工具页面深化为可完成任务、可解释决策、明确证据边界并可持续维护的作品体系。

**Architecture:** 八个工具各自维护独立页面、数据和测试，互不共享运行时；四个信息工具通过语义链接形成工作流。主集成任务独占首页、public-dist manifest、portfolio evidence、全量验证，以及“候选冻结页保持不变”的边界判定，避免并发编辑共享文件。

**Tech Stack:** HTML5、CSS3、Vanilla JS、JSON、Node.js 生成器与 `node:test`、Playwright 视觉/浏览器检查。

---

### Task 1: 建立隔离基线与批准设计

**Files:**
- Create: `docs/plans/2026-08-30-works-tools-depth-design.md`
- Create: `docs/plans/2026-08-30-works-tools-depth.md`
- Create: `docs/plans/works-tools/2026-08-30-*-depth.md`

**Step 1:** 从 `origin/main` 创建 `codex/works-tools-deepening` 隔离 worktree，确认 `.worktrees/` 已忽略。

**Step 2:** 在 `scripts/` 运行 `cmd /c npm ci`。

**Step 3:** 运行 `cmd /c npm run check`；若只有 Chromium `spawn EPERM`，用允许浏览器启动的权限单独重跑失败测试。

**Step 4:** 写入用户批准的总设计和八份实施计划。

**Step 5:** 运行 `node check-repository-policy.js`，确认计划文件符合仓库边界。

### Task 2: 派发八个独立实现任务

**Files:**
- Execute plan: `docs/plans/works-tools/2026-08-30-ai-insights-depth.md`
- Execute plan: `docs/plans/works-tools/2026-08-30-radar-depth.md`
- Execute plan: `docs/plans/works-tools/2026-08-30-trends-depth.md`
- Execute plan: `docs/plans/works-tools/2026-08-30-agent-hub-depth.md`
- Execute plan: `docs/plans/works-tools/2026-08-30-esop-depth.md`
- Execute plan: `docs/plans/works-tools/2026-08-30-stock-depth.md`
- Execute plan: `docs/plans/works-tools/2026-08-30-service-agent-depth.md`
- Execute plan: `docs/plans/works-tools/2026-08-30-asci-depth.md`

**Step 1:** 从已提交的 `codex/works-tools-deepening` 创建八个用户可见的独立项目任务，每个任务使用隔离 worktree，只负责一个工具。

**Step 2:** 每个任务先写失败测试，再实现、运行局部测试、自审并创建独立提交；禁止修改首页、portfolio evidence、public-dist manifest、候选冻结页和其他工具。

任务文件所有权如下：

| 任务 | 可写范围 |
|---|---|
| AI Insights | `tools/ai-insights/**`、`scripts/ai-insights-depth*.test.js` |
| Radar | `tools/radar/**`、`scripts/radar-depth*.test.js` |
| Trends | `tools/trends/**`、`scripts/trends-depth*.test.js`、`scripts/fetch-trends.js` |
| Agent Hub | `tools/agent-hub/**`、`scripts/agent-hub-depth*.test.js` |
| ESOP | `tools/esop-extractor/**`、`scripts/esop-extractor-depth*.test.js` |
| Stock | `tools/stock/**`、`scripts/stock-rendering.test.js`、`scripts/stock-workflow.test.js`、`scripts/stock-workflow.browser.test.js` |
| Service Agent | `tools/service-agent/**`、`scripts/service-agent-depth*.test.js` |
| ASCI | `tools/asci/**`、`scripts/asci-depth*.test.js` |

这些专属脚本不算共享文件；未列出的根文件、其他测试和其他工具仍禁止修改。

**Step 3:** 总控使用 `wait_threads` 等待完成或需要输入的任务，读取每个任务的变更文件、RED/GREEN 证据、测试结果、视觉状态和提交 SHA。

**Step 4:** 若任务未满足规格或质量门槛，由总控把具体问题回发到原任务修复，不接受只凭文字声称完成。

### Task 3: 汇总八个实现提交

**Files:**
- Integrate: eight tool-scoped commits returned by Task 2

**Step 1:** 逐个审查提交的文件边界和完整 diff，确认没有触碰共享文件或其他工具。

**Step 2:** 按工具顺序 cherry-pick 到总控分支；发生冲突时先查明原因，不丢弃任何一方内容。

**Step 3:** 每合入一项运行其局部测试；八项合入后运行全部新增工具测试。

**Step 4:** 对不合格项将修复请求发回原任务并等待新提交，不在总控中静默改写其核心实现。

### Task 4: 共享证据与首页收口

**Files:**
- Modify: `index.html`
- Modify: `docs/portfolio-evidence.schema.json`（仅增加信息工作流类型时）
- Modify: `docs/portfolio-evidence.examples.json`
- Modify: `scripts/portfolio-evidence.test.js`
- Create: `scripts/works-tools-integration.test.js`
- Modify: `scripts/public-dist-manifest.js`（仅在新增公开资产时）
- Modify: `.agents/skills/update-trends/SKILL.md`
- Generated: `.claude/skills/update-trends/SKILL.md`
- Modify: `README.md`、`CONVENTIONS.md` 或共享上下文（仅存在真实文档漂移时）

**Step 1:** 先写或更新测试，要求首页八个直链含 `rel="noopener"`、ESOP 无已实现“≥95%”承诺、ASCI 描述与当前能力一致。

**Step 2:** 更新八条首页标题/描述，不改变 `works-list` 结构和视觉布局。

**Step 3:** 保留现有私有 `aml-due-diligence`，并扩展 portfolio evidence 覆盖八个公开项目，最终精确 ID 为 `esop-extractor`、`financial-rag`、`service-agent`、`asci-research-system`、`ai-insights`、`radar`、`trends`、`agent-hub` 和 `aml-due-diligence`，共 9 条。四个信息工具使用新增的 `information-workflow` 类型；每项提供角色、真实部分、Mock 部分、边界、指标、证据、限制和链接。

**Step 4:** 如工具增加公开 JS/JSON/CSS，逐项加入 `scripts/public-dist-manifest.js`，不得用目录通配。

**Step 5:** 集成测试遍历四个信息工具，断言统一导航顺序、有效相对路径、唯一当前步骤与 `aria-current`；同时断言首页八个链接和文案契约。

**Step 6:** 更新 `.agents/skills/update-trends/SKILL.md` 以匹配新候选/人工复核/写入契约，运行 `sync-agent-context.ps1 -Write` 生成兼容副本，再运行只读同步检查。

**Step 7:** 本轮有意改变公开页面，不修改 `site/candidate/frozen-page-source.js`、`scripts/equivalence/site-matrix.js` 或旧 A0 baseline。A0 零差异门禁不作为本轮通过条件；未来若推进候选基线，必须单独审查 baseline SHA、精确文件数和交互矩阵。

### Task 5: 自动验证

**Files:**
- Verify all changed source and tests.

**Step 1:** 在 `scripts/` 运行 `cmd /c npm test`。

**Step 2:** 运行 `node check-repository-policy.js`、`node check-search-foundation.js` 和 `powershell -ExecutionPolicy Bypass -File sync-agent-context.ps1`。

**Step 3:** 选择一个尚不存在的仓库内目录 `build/verification/works-tools-<run-id>`，运行 `node build-public-dist.js --out <dir>`，再对同一路径运行 `node check-public-dist.js --out <dir>`；不得复用非空目录。

**Step 4:** 不运行或伪装通过旧 A0/candidate 等价门禁；以本轮工具级 Node 浏览器测试、全站静态检查、public-dist 检查和批准截图作为有意变化的验收证据。

**Step 5:** 对所有变更 JS 运行 `node --check`，对 JSON 执行结构化解析。

### Task 6: 真实页面视觉验收

**Files:**
- Review: `index.html`
- Review: all eight `tools/*/index.html`

**Step 1:** 启动只读本地 HTTP server。

**Step 2:** 每页检查 1440×900 默认状态与核心完成状态。

**Step 3:** 每页检查 390×844 默认状态与失败/过期/HITL 状态。

**Step 4:** 使用视觉模型审查层级、溢出、触控区域、状态含义和首屏边界；发现问题后修复并重新截图。

### Task 7: 最终审查与本地提交

**Files:**
- Review: complete branch diff against `origin/main`.

**Step 1:** 运行 `/review`，先处理阻断和重要问题。

**Step 2:** 运行最终规格审查，逐项对照总设计和八份计划。

**Step 3:** 确认主工作区原有未提交修改未被带入分支。

**Step 4:** 按工具或逻辑批次创建可审查的本地提交，提交信息使用项目规范。

**Step 5:** 报告分支、提交 SHA、测试、视觉检查、未解决限制和推送状态；没有单独确认时不执行 `git push`。

---

## 交付记录（2026-08-31）

**状态：** 八个工具的深化实现、总控整合和定向复验均已完成于本地分支 `codex/works-tools-deepening`；未执行 `git push`。

| 工具 | 已落地的核心深化 | 最终整合提交 |
|---|---|---|
| ESOP 字段提取 | 版本化合成评估、origin 快照确认、响应限长、安全存储与键盘语义 | `763f66b` |
| A 股 AI 助手 | 演示/网络模式显式切换、缺证据 partial、请求取消与最小反馈导出 | `64efdd5` |
| 智能客服沙盘 | 数值口径、故障注入、HITL 处理/转交轨迹、可访问的决策控件 | `c010e94` |
| ASCI 科研系统 | 固定数据包、研究协议、可审计决策、回退与过程清单 | `266f594` |
| AI 产品拆解 | 分表面产品状态、严格数据校验、深链/焦点与安全外链 | `d74b95d` |
| 前沿雷达 | 研究意图导航、来源复核状态和跨工具工作流 | `94ff1a7` |
| 热点快照 | 历史快照、新鲜度/行动筛选与结构复核边界 | `7f2ebd4` |
| Agent 认知全景 | Agent 适用性、控制/退出条件与可解释建议 | `52d2fca` |

最终验收采用用户确认的精简矩阵：全站默认页桌面/移动 smoke，加每个工具一个代表性的核心、完成或失败状态；不再追加大规模截图组合。公共产物清单新增 ESOP 的 4 个版本化 JSON 工件。最终验收结论、截图路径与所有命令输出将在本计划对应的交付汇总中记录。
