# Blog Governance

GitHub 是 Blog Project 的唯一长期真源。ChatGPT Project Source、已安装 Skill、本地下载稿或其他副本只作为运行时入口、迁移前快照或临时缓存，不再与 GitHub 并列维护。

## 长期规范

- `tools/blog/governance/blog-sop.md`：探讨、收敛、大纲确认、正式写稿与流程路由。
- `tools/blog/governance/blog-research-backlog-spec.md`：研究待办的记录结构、编号与日期、原位更新和整理验收；补充 SOP，不重定义研究流程或立项规则。
- `tools/blog/governance/blog-review-checklist.md`：初稿后的全量终审、确定性修复与交付验证。
- `tools/blog/governance/blog-charts-spec.md`：表格、流程图和其他可视化规范。
- `tools/blog/WRITING_GUIDE.md`：最终 Markdown、metadata 和发布契约。
- `tools/blog/data/blog-taxonomy.json`：category / tags / topics / concepts 的唯一词典。
- `.agents/skills/blog-human-writing/`：材料承载力检查与活人感审校的唯一长期规则真源。

## 研究待办

[研究待办与聚合候选](../research_backlog.md) 是唯一当前记录，保存研究总览、当前研究卡、跨事项聚合关系和关键决策/结项；它不等于正式立项，也不进入网站文章索引。

研究决策仍由 [Blog SOP](blog-sop.md) 的“研究待办记录与跨事项聚合”负责：何时收录、如何召回与聚合、采用什么状态、何时有资格进入正式写作。维护记录时另读 [待办维护规范](blog-research-backlog-spec.md)：创建、内容更新、证据核验与事件日期分开；同一问题原位合并，独立新问题才建新 ID；当前判断默认展开，长材料折叠。不要在记录文件复制规范，也不要把 SOP 与维护细则各写成一套相同流程。

## Series Brief

进行中的系列统一维护在 `tools/blog/series/`。当前包括：

- `multimodal-video-ai-series-brief.md`
- `ai-industry-history-strategy-series-brief.md`

Series Brief 只保存系列母题、文章地图、跨篇边界和运行状态，不复制长期 SOP / Checklist / 图表规范。

## 当前工作稿

未确认发布的完整文章维护在 `drafts/blog/<slug>.md`。这样可以保留完整 frontmatter，同时不触发 `docs/blog/` 的发布源校验。用户确认正式发布后，再将唯一当前稿迁移到 `docs/blog/<slug>.md`，同步 `posts-meta.json` 并生成发布 HTML；迁移完成后删除对应 draft，避免双版本。

## 运行原则

1. 新会话直接读取 GitHub 当前文件，不依赖旧聊天附件或 Project Source 快照。
2. 同一用途只维护一个当前文件；更新原位覆盖，不创建内容等价的 `(1)`、`v2`、`v3`。
3. 每次 GitHub 写入后重新读取文件或校验 SHA，确认真实落盘。
4. 规范变更按职责归属更新对应文件；文章专属判断不升级为长期规则。
5. 历史公开事实仍按“当前线上正式发布页 → GitHub 发布 HTML → Markdown 源稿”判断；Series Brief 与聊天草稿不得覆盖正式发布事实。
6. taxonomy 发生语义变化时，按 `WRITING_GUIDE.md` 执行 taxonomy 一致性检查和历史影响审查。
