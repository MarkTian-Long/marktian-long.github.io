# Blog Governance

GitHub 是 Blog Project 的唯一长期真源。ChatGPT Project Source、已安装 Skill、本地下载稿或其他副本只作为运行时入口、迁移前快照或临时缓存，不再与 GitHub 并列维护。

## 长期规范

- `tools/blog/governance/blog-sop.md`：探讨、收敛、大纲确认、正式写稿与流程路由。
- `tools/blog/governance/blog-review-checklist.md`：初稿后的全量终审、确定性修复与交付验证。
- `tools/blog/governance/blog-charts-spec.md`：表格、流程图和其他可视化规范。
- `tools/blog/WRITING_GUIDE.md`：最终 Markdown、metadata 和发布契约。
- `tools/blog/data/blog-taxonomy.json`：category / tags / topics / concepts 的唯一词典。
- `.agents/skills/blog-human-writing/`：材料承载力检查与活人感审校的唯一长期规则真源。

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
