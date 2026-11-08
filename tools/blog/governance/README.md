# Blog Governance

GitHub 是 Blog Project 的唯一长期真源。ChatGPT Project Source、已安装 Skill、本地下载稿或其他副本只作为运行时入口、迁移前快照或临时缓存，不再与 GitHub 并列维护。

## 长期规范

- `tools/blog/governance/blog-sop.md`：探讨、收敛、大纲确认、正式写稿与流程路由。
- `tools/blog/governance/blog-cognitive-review-spec.md`：正文收束、图文预览前的可见认知增量反馈与章节依赖检查；不重复事实终审，不新增一轮默认审批。
- `tools/blog/governance/blog-preview-release-spec.md`：正文确认后的发布级图文预览、作者批准与正式发布切换；补充 SOP 的阶段交付，不另定写作、视觉或发布契约。
- `tools/blog/governance/blog-research-backlog-spec.md`：研究待办的记录结构、编号与日期、原位更新和整理验收；补充 SOP，不重定义研究流程或立项规则。
- `tools/blog/governance/blog-review-checklist.md`：初稿后的全量终审、确定性修复与交付验证。
- `tools/blog/governance/blog-charts-spec.md`：表格、流程图和其他可视化规范。
- `tools/blog/IMAGE_GENERATION_WORKFLOW.md`：正文概念/场景插图的任务定义、生图迭代、文字校验、选图与资产交接。
- `tools/blog/WRITING_GUIDE.md`：最终 Markdown、metadata 和发布契约。
- `tools/blog/data/blog-taxonomy.json`：category / tags / topics / concepts 的唯一词典。
- `.agents/skills/blog-human-writing/`：材料承载力检查与活人感审校的唯一长期规则真源。

## 按阶段读取

下表只负责导航到正确的规范入口，不复制各文件中的详细规则。默认按当前阶段读取相关章节，不把全部规范在每轮重复加载。

| 阶段 | 默认读取 | 按需读取 |
|---|---|---|
| 新文章探讨 | blog-sop.md 的探讨与收敛部分、blog-taxonomy.json | 系列文章读取对应 Series Brief；先保存独立起点，再读取 research_backlog.md 和 posts-meta.json |
| 历史关联与大纲确认 | blog-sop.md 的历史检索与大纲部分、完整 posts-meta.json | 只深读高相关历史正文；材料承载力检查按需触发 |
| 正文写作 | 已确认大纲、blog-sop.md 的相关写作章节 | 仅为实际采用的图表读取 blog-charts-spec.md |
| 初稿审校 | .agents/skills/blog-human-writing/SKILL.md 与 references/prose-review.md，随后 blog-review-checklist.md | 有图表时复核图表规范；材料检查不是初稿审校的替代品 |
| 正文收束／认知增量验收 | blog-cognitive-review-spec.md、独立起点与当前正文 | 向用户反馈认识的保留／修正／新增及章节依赖图；只在核心问题或立场改变时再确认，不把图文预览提前到本节点之前 |
| 正文配图与制作 | blog-sop.md 的视觉规划路由、VISUAL_GUIDE.md | 生图读取 IMAGE_GENERATION_WORKFLOW.md；精确图表读取 blog-charts-spec.md |
| 插图后全局预览 | blog-preview-release-spec.md、正式文章模板与共享运行时 | 按待发布稿完成审校、metadata 与真实页面验收；不因预览地址而降低标准 |
| 终稿与发布 | 最新 blog-taxonomy.json、WRITING_GUIDE.md、publish-blog/SKILL.md | 有图片时读取 VISUAL_GUIDE.md；按发布脚本运行对应检查 |

## 标签定期维护

[标签巡检与历史问题台账](../taxonomy-maintenance.md) 是分类与标签维护的单一运行入口，保存周期检查、提醒去重、当前问题及历史处置。它不复制 taxonomy 定义，不替代 SOP 的变更决策或 Checklist 的终审。定时任务每次读取该文件最新内容；同一问题复发沿用原 ID，不另建重复周报。词义、文章标签、正文和 UI 不因统计信号而自动修改。

## 研究待办

[研究待办与聚合候选](../research_backlog.md) 是唯一当前记录，保存研究总览、当前研究卡、跨事项聚合关系和关键决策/结项；它不等于正式立项，也不进入网站文章索引。

研究决策仍由 [Blog SOP](blog-sop.md) 的“研究待办记录与跨事项聚合”负责：何时收录、如何召回与聚合、采用什么状态、何时有资格进入正式写作。维护记录时另读 [待办维护规范](blog-research-backlog-spec.md)：创建、内容更新、证据核验与事件日期分开；同一问题原位合并，独立新问题才建新 ID；当前判断默认展开，长材料折叠。不要在记录文件复制规范，也不要把 SOP 与维护细则各写成一套相同流程。

## Series Brief

系列规划和归档统一保留在 `tools/blog/series/`，以文件内标记的状态为准，不只靠文件目录区分。

- `ai-industry-history-strategy-series-brief.md`：进行中
- `multimodal-video-ai-series-brief.md`：**2026-10-10 已结项，原路径只读归档**；技术主线已发布，后续相关新问题另列研究待办

Series Brief 只保存系列母题、文章地图、跨篇边界和运行状态，不复制长期 SOP / Checklist / 图表规范。

## 当前工作稿

未确认发布的完整文章维护在 `drafts/blog/<slug>.md`。这样可以保留完整 frontmatter，同时不触发 `docs/blog/` 的发布源校验。用户确认正式发布后，再将唯一当前稿迁移到 `docs/blog/<slug>.md`，同步 `posts-meta.json` 并生成发布 HTML；迁移完成后删除对应 draft，避免双版本。

正文确定时，先按[认知增量与章节依赖检查](blog-cognitive-review-spec.md)向用户说明相对独立起点新增了什么解释、修正了什么判断、连接了哪些体系，以及各章如何共同回答主问题。不能只把更多案例和篇幅作为增量，也不凭空声称用户已经学会了什么。

用户在正文讨论后要求插图或完整预览时，按[发布级图文预览规范](blog-preview-release-spec.md)先完成发布质量的加工与验收；预览只保留分发状态差异。确认发布后再迁移路径、索引和 SEO，不重新维护一份正文。

## GitHub 读写能力与工具发现（跨会话操作门槛）

**不得因某轮工具列表仅显示读取接口，就认定 ChatGPT 无法修改 GitHub。** Blog Project 在已授权仓库内可以通过 GitHub 连接器读取、创建、修改、提交文件；可用动作和权限以每轮实际工具发现及调用结果为准，而不是依据旧会话的工具清单。

- 接到 GitHub 更新、正式发布、修改规范等任务时，先通过当前会话的工具目录完整检索 GitHub 命名空间（例如在 `functions.exec` 中筛选 `ALL_TOOLS` 的 `mcp__GitHub__*`），尤其检查 `update_file`、`create_file`、`create_blob`、`create_tree`、`create_commit`、`update_ref`，不要只检查 `fetch` / `fetch_file` 或部分工具检索结果。
- **单文件文字修改**：读取目标文件及其 blob SHA，调用 `update_file` 以相同路径替换；多文件原子变更或删除使用 Blob → Tree → Commit → `update_ref`，操作前获取最新分支 head，移动分支时带 `expected_sha` 并禁用强推。具体参数以工具当轮完整签名为准。
- **验证边界**：创建 Blob / Tree / Commit 不等于分支已经更新；仅在 ref 更新成功，并重新读取文件或分支 commit 确认写入后，才能报告“GitHub 已更新”。“已提交”也不等于 Pages 已部署成功；按实际 Actions、部署和网页检查分开报告。
- **并发或失败**：分支 head 变化时重新读取并合并差异，不能覆盖其他会话提交；接口返回权限错误时记录真实错误和所需权限。只有在完整发现写入工具并实际尝试适用操作后仍受限，才可说明该轮写入不可用。不得把工具发现遗漏表述成“当前会话只有读取能力”，更不能未经检查就要求用户转交本机 Codex。
- 新会话不保证工具状态与上一轮相同；因此这是一项**发现、执行和回读义务**，而不是对任意时刻写权限的无条件承诺。

## 运行原则

1. 新会话直接读取 GitHub 当前文件，不依赖旧聊天附件或 Project Source 快照。
2. 同一用途只维护一个当前文件；更新原位覆盖，不创建内容等价的 `(1)`、`v2`、`v3`。
3. 每次 GitHub 写入后重新读取文件或校验 SHA，确认真实落盘。
4. 规范变更按职责归属更新对应文件；文章专属判断不升级为长期规则。
5. 历史公开事实仍按“当前线上正式发布页 → GitHub 发布 HTML → Markdown 源稿”判断；Series Brief 与聊天草稿不得覆盖正式发布事实。
6. taxonomy 发生语义变化时，按 `WRITING_GUIDE.md` 执行 taxonomy 一致性检查和历史影响审查。
7. 规范按当前阶段读取并以 SHA 识别变化；同一轮未变化的规则不反复全文加载。已确认正文只做受影响范围的修复，发布时验证同稿迁移，不重新写作。规范中的可执行命令必须有实现与测试，不能把规则写入当成执行闭环。
