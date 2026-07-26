---
name: monthly-review
description: 月度项目维护：记忆清理、规范文档同步检查、（季度）代码架构快照，输出 docs/reviews/YYYY-MM-monthly-review.md
type: workflow
---

# /monthly-review — 月度维护 Skill

## 触发时机
- 用户输入 `/monthly-review`
- 或共享维护文档的月度提醒触发后用户确认执行

## 执行流程

### Step 1 — 记忆维护（必做）

以 `docs/agent-context/memory.md` 为项目记忆源，逐项检查：
- 内容重叠：两个 memory 文件描述同一规则 → 合并到更详细的那个，另一个加"已合并"注释
- 引用已删除功能的条目：grep 确认引用的文件/函数是否仍然存在
- 过时的项目状态描述（project 类型 memory）：比对当前代码实际情况

如当前 Agent 另有私有 memory，只提炼可复用规则写回共享记忆，不把本机路径、会话记录或工具私有实现写入仓库。

操作完成后更新 `docs/agent-context/maintenance.md`：
- 更新注释：`<!-- monthly-review: last=YYYY-MM-DD next=YYYY-MM-DD -->`（next 设为下月同日）
- 将可复用经验同步到 `docs/agent-context/memory.md`

### Step 2 — 规范文档同步检查（必做）

**主规范**（`AGENTS.md` / `CLAUDE.md` / `CONVENTIONS.md`）：
1. 对照 AGENTS.md 和 CLAUDE.md「已有工具模块」表格 vs 实际 `tools/` 目录 → 有无新增/删除工具未同步
2. 对照两份入口文档的「Skill 管理」表格 vs `.agents/skills/` 实际目录 → 有无新增 skill 未登记
3. 对照 CONVENTIONS.md CSS 变量列表 vs `assets/css/style.css` 中 `:root` 实际定义 → 有无新增变量未记录
4. 运行 `node scripts/check-repository-policy.js` → GitHub/本地边界是否符合 `docs/repository-policy.md`

**各工具 README.md**（逐一检查）：
- `tools/ai-insights/README.md` — Tab 数量/功能描述 vs index.html 实际 Tab
- `tools/radar/README.md`
- `tools/trends/README.md`
- `tools/esop-extractor/README.md`
- `tools/stock/README.md`（6-Tab 描述是否仍准确）
- `tools/service-agent/README.md`
- `tools/agent-hub/README.md`
- `tools/asci/README.md`
- `tools/blog/README.md` — **额外检查**：posts 目录文件数 vs README 中列出的文章数量是否一致
- `tools/dashboard/README.md`
- `tools/product-collector/README.md`
- 检查重点：功能描述、Tab 数量、API Key 配置方式是否过时

**博客规范**（`tools/blog/`）：
- WRITING_GUIDE.md 标签库 vs `tools/blog/data/posts-meta.json` 实际使用的 tags/topics → 有无标签漂移
- BLOG_DESIGN.md 设计描述 vs 实际 blog CSS → 有无重大 UI 变更未同步

**Skill 定义**（`.agents/skills/` 下全部 skill）：
- **必须逐一 Read 每个 SKILL.md**，不得跳过或留"未做深入对比"占位
- 每个 SKILL.md 检查三点：① 触发条件/步骤描述 vs AGENTS.md 和 CLAUDE.md Skill 选择树是否一致；② 引用的文件路径/DOM 结构/函数名 → grep 确认是否仍然存在；③ `.claude/skills/` 兼容副本是否一致

**输出**：差异清单（不自动修改，列出后让用户确认再改）

### Step 3 — 代码架构快照（季度可选）

**判断是否执行**：
- 当前月份为 1 / 4 / 7 / 10 月 → 执行
- 其他月份 → 提示「本月跳过架构快照（季度检查，下次执行月份：X 月）」

**检查项**：
1. `tools/` 各子目录是否都有 `README.md`（用 glob 列出缺失的）
2. 工具 HTML 中是否有硬编码色值（grep `#[0-9a-fA-F]{3,6}` 排除注释和 CSS 变量）
3. `assets/js/main.js` 全局变量数量（grep `^const\|^let\|^var` 统计）
4. 无引用的 JS 函数（grep 函数定义，再反查调用次数 ≤ 1 的）

### Step 4 — 输出月度报告

写入 `docs/reviews/YYYY-MM-monthly-review.md`，结构：

```markdown
# YYYY-MM 月度维护报告

## 记忆维护
- 合并/删除条目：X 个
- 变更摘要：...

## 规范文档差异清单
- AGENTS.md / CLAUDE.md: ...
- 工具 README: ...
- 博客规范: ...
- Skill 定义: ...

## 架构快照（季度）
（仅季度月执行时填写）

## Skill 自我更新建议
- ...（如无需更新填"无"）

## 下月关注点
- ...

_执行日期：YYYY-MM-DD_
```

### Step 5 — Skill 自我审视（必做）

在生成报告之前，检查本 skill 自身是否需要更新：

**检查项**：
1. **工具目录变化**：Step 2 发现有新增/删除工具 → 相应更新 SKILL.md 中「各工具 README.md」清单
2. **规范文档新增**：发现 `tools/` 或项目根目录有新的 `README.md` / `DESIGN.md` / `WRITING_GUIDE` 类文件 → 加入 Step 2 检查列表
3. **检查逻辑失效**：某个检查项引用的文件路径已不存在 → 标记并建议删除或替换
4. **新 Skill 出现**：`.agents/skills/` 下有新的 skill 未纳入检查 → 加入 Step 2 的 Skill 定义检查列表

**操作**：
- 若发现需要更新：在报告「Skill 自我更新建议」节列出具体变更，**等用户确认后**再修改 SKILL.md
- 若无需更新：报告中填「无」

## 注意事项
- Step 2 和 Step 5 均只列差异，不自动修改任何文件，等用户确认后再改
- **每项检查必须实际读取文件**，不得用"未做深入对比"等措辞占位敷衍；若时间不足宁可明确说"本次跳过 X 项，原因是 Y"
- 报告文件路径：`docs/reviews/`（项目维护记录，纳入 Git 版本控制）
- 不在共享 Skill 中硬编码任何 Agent 的私有 memory 绝对路径
