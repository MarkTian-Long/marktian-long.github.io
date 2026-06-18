# 2026-06 月度维护报告

## 记忆维护

**总文件数：** 37 个 memory 文件 + 1 个 MEMORY.md 索引

### 需清理的条目（5 个）

| 文件 | 问题 | 建议操作 |
|------|------|----------|
| `feedback_ui_consistency.md` | 引用的 `dashboard-wrapper`/`dashboard-topbar`/`tool-panel` 在当前 `index.html` 中已不存在，工具展示改为直链卡片 | **删除或重写**——规则已失效 |
| `feedback_panel_dom_position.md` | 引用的 `tool-panel`/`panel-xxx` ID 和 `scrollIntoView` 机制已不存在 | **删除**——与 `feedback_ui_consistency` 同因失效 |
| `feedback_plan_location.md` | 列出的 `docs/plans/service-agent/` 目录不存在 | **更新**——移除不存在的示例路径 |
| `feedback_supporting_material_consistency.md` | `expand-btn-link` 在 CSS 中定义但 `index.html` 未使用 | **标记待确认**——可能在 views 重设计后失效 |
| `feedback_chart_implementation.md` | frontmatter `name` 字段为空字符串 | **修复**——补充 name 值 |

### 元数据问题（2 个）

| 文件 | 问题 |
|------|------|
| `feedback_blog_tag_validation.md` | `type` 嵌套在 `metadata.type` 而非顶层 |
| `feedback_chart_implementation.md` | `name: ""` 为空 |

### MEMORY.md 索引问题

- `feedback_verification_before_done.md` 仍有独立行，但标注"已合并"——建议删除该行以简化索引

### 内容重叠（无需合并，仅记录）

- `feedback_demo_design.md`（原则 3）与 `feedback_mock_data_alignment.md` 都涉及 mock 数据，但角度不同（原则 vs 三层对齐）
- ASCI 相关的 3 个 memory（`global_state_reset`/`dom_refactor_aux_functions`/`innerhtml_panel_swap`）有重叠示例但关注点不同

### 遗留问题

- 21 篇较老博客文章的 `og:url` 仍使用 `liu-yang.me` 而非实际部署域名 `marktian-long.github.io`

---

## 规范文档差异清单

### CLAUDE.md

| 差异 | 详情 |
|------|------|
| **缺少 blog 工具** | `tools/blog/` 目录存在但未列入「已有工具模块」表格 |
| **ASCI 节点数错误** | 表格写"15节点"，实际 NODE_REGISTRY 只有 14 个节点 |

### 工具 README

| 工具 | 差异 |
|------|------|
| `tools/service-agent/README.md` | 默认模型写 `stepfun/step-3.5-flash:free`，代码实际用 `anthropic/claude-3-haiku` |
| `tools/asci/README.md` | 声称 15 节点，实际 14 个（README 表格本身只列了 14 行） |
| `tools/blog/README.md` | 目录树列 26 篇文章，实际 28 篇；缺 `ai-arbitration-layer.html` 和 `ai-chips-explainer.html` |

### CONVENTIONS.md — CSS 变量

style.css `:root` 定义了 **42 个变量**，CONVENTIONS.md 仅记录了 **14 个**。未记录的 28 个：

- **背景：** `--bg-secondary`, `--bg-card-hover`
- **强调色：** `--accent-cyan/green/clay/coral/yellow/red`
- **文本：** `--text-muted`, `--text-on-gradient`
- **边框：** `--border-warm`
- **阴影（整类缺失）：** `--shadow-glow`, `--shadow-card`
- **圆角：** `--radius-md`, `--radius-xl`
- **字体（整类缺失）：** `--font`, `--font-serif`
- **Alpha 系列（整类缺失）：** `--accent-blue-06~50`（11个）、`--accent-clay-06~35`（5个）

### 博客规范

| 差异 | 详情 |
|------|------|
| **BLOG_DESIGN.md Section IX** | 描述了 tag 二级筛选功能，但代码未实现（仅有 category + search 筛选） |
| **OG 域名不一致** | WRITING_GUIDE 写 `liu-yang.me`，实际部署用 `marktian-long.github.io` |
| **4 个标签未使用** | `独立开发`/`冷启动`/`出海`/`职业判断` 在标签库中定义但从未被任何文章使用（信息性，不一定需要删除） |

### Skill 定义

| Skill | 差异 |
|------|------|
| `add-tool` | Line 65 "Tab 按钮和 Panel 都已添加"——**过时**，现为 works-list 直链卡片 |
| `add-tool` | Line 69 "iframe 高度"检查——**过时**，工具已改为 `target="_blank"` 新窗口打开 |
| `code-health-check` | Line 57 posts-meta.json 字段清单缺少 `topics` 字段 |

---

## 架构快照（季度）

本月跳过（6 月非季度月，下次执行：**2026 年 7 月**）

---

## Skill 自我更新建议

### monthly-review SKILL.md 需更新

1. **新增 blog 工具**：`tools/blog/` 已存在但不在 CLAUDE.md 工具表格中，SKILL.md 的工具 README 检查列表已包含 `tools/blog/README.md`，但应确保 CLAUDE.md 同步更新
2. **检查逻辑无失效**：SKILL.md 引用的所有文件路径均有效
3. **无新 Skill**：`.claude/skills/` 下仍为 7 个 skill，与 SKILL.md 列表一致

**结论：monthly-review SKILL.md 本身无需更新。**

---

## 已执行的修复操作

### 记忆维护
- **删除** 3 个过时 memory：`feedback_ui_consistency.md`、`feedback_panel_dom_position.md`、`feedback_supporting_material_consistency.md`
- **更新** `feedback_plan_location.md`：移除不存在的 `docs/plans/service-agent/` 示例
- **修复元数据**：`feedback_chart_implementation.md` 补充 name 字段、`feedback_blog_tag_validation.md` 修正 type 层级
- **清理 MEMORY.md**：移除已合并的 `feedback_verification_before_done` 残留行，移除 3 个已删文件的索引行
- **更新时间戳**：`last=2026-06-16 next=2026-07-16`

### 规范文档
- **CLAUDE.md**：添加 blog 工具条目、ASCI 节点数 15→14
- **CONVENTIONS.md**：Token 表从 7 行扩充到 11 行，覆盖全部 42 个 CSS 变量
- **BLOG_DESIGN.md**：Section IX 标记为 `Planned — 尚未实现`
- **WRITING_GUIDE.md**：OG meta 模板域名 `liu-yang.me` → `marktian-long.github.io`（og:url + og:image + twitter:image）

### 工具 README
- **service-agent**：默认模型 `stepfun/step-3.5-flash:free` → `anthropic/claude-3-haiku`
- **asci**：节点数 15 → 14
- **blog**：文章列表补充 `ai-arbitration-layer.html` 和 `ai-chips-explainer.html`（26→28）

### Skill 定义
- **add-tool**：验证清单移除过时的 tab/iframe 项，改为直链卡片检查 + 新标签页验证
- **code-health-check**：posts-meta.json 字段清单补充 `topics`

### 博客文章
- **21 篇文章** og:url 域名批量替换：`liu-yang.me` → `marktian-long.github.io`

---

## 下月关注点

1. **7 月为季度月**——需执行架构快照（硬编码色值扫描、全局变量审计、死代码检测）
2. **BLOG_DESIGN.md Section IX**——文章数量增长后考虑实现 tag 二级筛选
3. **4 个未使用标签**——`独立开发`/`冷启动`/`出海`/`职业判断` 长期无文章使用，评估是否保留

_执行日期：2026-06-16 ~ 2026-06-17_
