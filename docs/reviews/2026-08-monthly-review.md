# 2026-08 月度维护报告

## 记忆维护

- 已核对 `docs/agent-context/memory.md`：其中关于 candidate-only 站点生成、公开产物冻结和显式 `--write` 的规则仍与当前实现一致，无需新增或合并项目共享记忆。
- 维护标记已更新为 `last=2026-08-27 next=2026-09-27`。

## 规范文档差异清单

以下仅记录差异；本次不顺带修改功能或重写工具文案。

| 范围 | 差异 | 建议后续动作 |
| --- | --- | --- |
| `CLAUDE.md` | 热点快照仍写作 “Claude 点评”，博客固定写为 28 篇；当前实现和 `AGENTS.md` 使用 “Codex 点评”，博客由元数据动态读取，现有 39 篇。 | 在一次独立的文档同步任务中修正 Claude 入口层。 |
| `tools/radar/README.md` | 仍说明主页通过 iframe 嵌入；当前主页为独立直链、新标签页打开。 | 改为直链卡片描述。 |
| `tools/trends/README.md` | 仍说明 iframe 入口，并把直接执行 `node fetch-trends.js` 描述为写入刷新。当前生成器默认只检查，公开数据写入必须显式 `--write`。 | 同步入口方式与生成器契约。 |
| `tools/blog/README.md`、`tools/blog/WRITING_GUIDE.md`、`publish-blog` skill | 文章生成示例未标示 `--write`；当前默认不写公开 HTML。 | 在下一次博客流程文档同步时补充显式写入参数，并保留逐篇生成约束。 |
| 工具 README 的定位文案 | `agent-hub`、`esop-extractor`、`stock`、`service-agent` 等仍含“求职 / 简历 / 面试”表述，与站点已确定的长期个人网站定位不完全一致。 | 作为单独的内容编辑批次统一处理，避免与 UI 轨道混改。 |

## 已验证的一致项

- `tools/` 现有 11 个模块均有 `README.md`；AGENTS / CLAUDE 工具表所列路径与目录一致（忽略规范文字中的 `<tool-name>` 占位符）。
- AI 产品拆解数据当前为 9 条，README 中的数据条数一致；其“四个拆解页签 + 三个扩展页签”的描述与项目工具表的七页签描述可兼容。
- 博客元数据共 39 篇；7 个标签、13 个 topics 以及 4 个分类的实际词汇均能在 `WRITING_GUIDE.md` 中找到。
- `style.css` 的 46 个设计变量均已被 `CONVENTIONS.md` 的分类表覆盖。
- `.agents/skills/` 的 25 个 `SKILL.md` 与 `.claude/skills/` 兼容副本逐文件哈希一致；已注册的 8 个项目 skill 均存在，月度维护 skill 无需更新。

## 架构快照（季度）

8 月不是季度检查月，本月跳过完整架构快照；下次执行月份为 **2026 年 10 月**。

本月额外确认：当前 `main` 已包含已验证的非视觉站点生成架构提交链：`4fdbc49`（架构落地）及 `4140bed`、`7a551bc`、`d6c447e`（跨平台与部署门禁修复）。candidate-only 构建仍限定在 `build/candidate-site/`，并未替换公开页面。

## 规划任务交接

`personal-site-planning` worktree 中的执行控制文件仍将 Phase 1–3 标记为 `pending`，与当前 `main` 的实际提交状态不一致。该文件明确规定只能由 planning task 编辑，因此本次没有跨 worktree 修改。

建议 planning task 在下一次更新时记录：A0 证据提交 `8c51ad1`；非视觉架构落地从 `4fdbc49` 开始，部署门禁修复完成于 `d6c447e`；下一阶段应保持 candidate-only 边界，Track C 仍需在视觉方向确定后单独启动。

## 下月关注点

1. 由 planning task 回写上述阶段状态与交接证据。
2. 单独同步 README / CLAUDE 的入口、生成器契约和个人网站定位文案。
3. 10 月执行季度架构快照；不要把 candidate 构建直接提升为公开页面替换。

_执行日期：2026-08-27_
