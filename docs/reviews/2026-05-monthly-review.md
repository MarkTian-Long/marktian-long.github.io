# 2026-05 月度维护报告

## 记忆维护

- 合并/删除条目：0 个
- `feedback_verification_before_done.md` 文件已不存在，MEMORY.md 索引中标注"已合并"，状态正常
- 所有记忆文件存在且内容清晰，无重叠条目
- MEMORY.md 时间戳更新：`last=2026-05-13 next=2026-06-13`

---

## 规范文档同步

### CLAUDE.md 工具表格

新增两个此前未记录的工具：

| 工具 | 嵌入方式 | 分组 |
|------|---------|------|
| `tools/asci/` ASCI 科研任务执行系统 | 直链（works-item） | PM 作品 |
| `tools/agent-hub/` Agent 认知全景 | 直链（works-item） | 信息工具 |

其余工具记录与实际一致，无差异。

### CLAUDE.md Skill 管理表格

7 个 skill 全部已记录，无差异。`monthly-review` 最近更新日期同步为 `2026-05-13`。

### CONVENTIONS.md CSS 变量

采用前缀概念描述方式，不逐变量枚举，与 style.css 实际定义的差异在可接受范围内，无需修改。

### 工具 README 检查

| 工具 | 状态 | 说明 |
|------|------|------|
| tools/ai-insights/README.md | ✅ | 7-Tab 描述与实际代码一致 |
| tools/radar/README.md | ✅ | 无差异 |
| tools/trends/README.md | ✅ | 5 板块描述与实际一致 |
| tools/esop-extractor/README.md | ✅ | 字段体系、模型配置、bad case 流程描述准确 |
| tools/stock/README.md | ✅ | 6-Tab 描述与 CLAUDE.md 一致 |
| tools/service-agent/README.md | ✅ | 5-Tab 与四条 Agent 链路描述准确 |
| tools/blog/README.md | ✅（已修复） | posts 列表从 8 篇补全至 21 篇 |
| tools/agent-hub/README.md | ✅ | 4-Tab 内容完整 |
| tools/asci/README.md | ✅ | 节点注册表和面试题覆盖完整 |
| tools/dashboard/README.md | ✅（已修复） | 删除"嵌入主页 iframe"误导描述，改为"开发内部工具，不在主页展示" |
| tools/product-collector/README.md | ✅ | 无差异 |

### 博客规范

tags 实际使用：`市场格局` / `技术判断` / `工程演进` / `决策框架` / `竞争判断`

topics 实际使用：`Agent` / `RAG` / `Fine-tuning` / `提示工程` / `企业AI` / `产品设计` / `模型能力` / `评测体系` / `前沿研究`

全部在 WRITING_GUIDE 标签库内，无漂移。

### Skill 定义深度对比

7 个 SKILL.md 全部逐一检查：

| Skill | 触发描述 vs CLAUDE.md 选择树 | 引用路径检查 | 处理 |
|-------|----------------------------|------------|------|
| `add-tool` | 一致 | `tool-tabs`/`tool-panel`/`switchTool()` 引用已失效（主页已迁移为 works-list 直链模式） | ✅ 已修复 |
| `analyze-product` | 一致 | `tools/ai-insights/data/products.json` 存在 | 无需修改 |
| `update-trends` | 一致 | `tools/trends/data/trends.json` 存在 | 无需修改 |
| `brand-design-md` | 一致 | 引用 `npx getdesign@latest`（外部命令，无本地路径依赖）；`tools/.design-tmp/` 为临时目录，按需创建 | 无需修改 |
| `sync-docs` | 一致 | 引用 `CONVENTIONS.md 第七章「博客内容规范」`，章节存在 | 无需修改 |
| `code-health-check` | 一致 | `tool-tabs` 引用已失效，同上 | ✅ 已修复 |
| `monthly-review` | 一致 | 新增 blog README 文章数量检查项 | ✅ 已更新 |

**连带修复：** `add-tool`/`code-health-check` 的失效引用同时存在于 `CLAUDE.md` 核心规范和 `CONVENTIONS.md` 第四章，已一并更新为 `works-list` 直链卡片注册方式。

---

## 架构快照（季度）

本月跳过（5 月非季度月）。下次执行：**7 月**。

---

## 下月关注点

- 新发博客文章时同步更新 `tools/blog/README.md` posts 列表
- 下次月度维护（6 月 13 日）补做各 skill SKILL.md 的深度对比

_执行日期：2026-05-13_
