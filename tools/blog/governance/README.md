# Blog Governance

GitHub 是 Blog Project 的唯一长期真源。ChatGPT Project Source、已安装 Skill、本地下载稿或其他副本只作为运行时入口、迁移前快照或临时缓存，不再与 GitHub 并列维护。

## 长期规范

- [ChatGPT 网页版项目指令](chatgpt-project-instructions.md)：可直接复制到 Blog Project 设置的长期约束入口；GitHub 文件为维护真源，网页版是运行副本。仅在权威层级、作者关口、授权或默认交付方式变化时同步该入口；CLI、规格、词表和检查细则留在所属文件。更新本文件不代表已经修改网页版设置。
- `tools/blog/governance/blog-sop.md`：探讨、收敛、大纲确认、正式写稿与流程路由。
- `tools/blog/governance/blog-cognitive-review-spec.md`：大纲确认后的写作前认知增量反馈、正文完成后的认知增量验收及章节依赖检查；具体触发顺序由 SOP 路由。
- `tools/blog/governance/blog-preview-release-spec.md`：首次完整图文预览、同稿迭代、公开预览授权和正式发布切换；补充 SOP 的阶段交付，不另定写作、视觉或发布契约。
- `tools/blog/governance/blog-research-backlog-spec.md`：研究待办的记录结构、编号与日期、原位更新和整理验收；补充 SOP，不重定义研究流程或立项规则。
- `tools/blog/governance/blog-review-checklist.md`：初稿后的全量终审、确定性修复与交付验证。
- `tools/blog/governance/blog-charts-spec.md`：表格、流程图和其他可视化规范。
- `tools/blog/VISUAL_GUIDE.md`：首图与其他正文图的视觉语言、资产规格、许可、制作方式和实际页面验收。
- `tools/blog/IMAGE_GENERATION_WORKFLOW.md`：正文概念/场景插图的任务定义、生图迭代、文字校验、选图与资产交接。
- `tools/blog/WRITING_GUIDE.md`：最终 Markdown、metadata 和发布契约。
- `tools/blog/data/blog-taxonomy.json`：category / tags / topics / concepts 的唯一词典。
- `.agents/skills/blog-human-writing/`：材料承载力检查与活人感审校的唯一长期规则真源。

## 按阶段读取

[Blog SOP](blog-sop.md) 维护完整流程、进入条件、交付和作者授权关口；本入口只导航到当前任务所需的规范，不再复制一张流程表。按阶段读取相关章节，同一轮以文件 SHA 判断是否需要重读。

- **研究、收敛与大纲**：[SOP](blog-sop.md)；taxonomy、研究待办、历史 metadata 和 Series Brief 按 SOP 的读取顺序进入。
- **认知增量反馈与验收方法**：[认知规范](blog-cognitive-review-spec.md)。
- **正文审校**：GitHub 当前 `.agents/skills/blog-human-writing/SKILL.md` 与对应 reference；终审执行 [Checklist](blog-review-checklist.md)。
- **图片与图表**：[图表规范](blog-charts-spec.md)、[视觉规范](../VISUAL_GUIDE.md)；决定使用生成式图片时再读 [生图工作流](../IMAGE_GENERATION_WORKFLOW.md)。
- **网页预览与同稿发布切换**：[预览规范](blog-preview-release-spec.md)；模板、metadata 与生成器契约查 [Writing Guide](../WRITING_GUIDE.md)。
- **正式发布执行**：最新 `blog-taxonomy.json`、[Writing Guide](../WRITING_GUIDE.md) 和 GitHub 当前 `.agents/skills/publish-blog/SKILL.md`。

## 标签定期维护

[标签巡检与历史问题台账](../taxonomy-maintenance.md) 是分类与标签维护的单一运行入口，保存周期检查、提醒去重、当前问题及历史处置。它不复制 taxonomy 定义，不替代 SOP 的变更决策或 Checklist 的终审。定时任务每次读取该文件最新内容；同一问题复发沿用原 ID，不另建重复周报。词义、文章标签、正文和 UI 不因统计信号而自动修改。

## 研究待办

[研究待办与聚合候选](../research_backlog.md) 是唯一当前记录，保存研究总览、当前研究卡、跨事项聚合关系和关键决策/结项；它不等于正式立项，也不进入网站文章索引。

研究决策由 [Blog SOP](blog-sop.md) 的“研究待办记录与跨事项聚合”负责；结构、编号、日期、原位更新和记录验收由 [待办维护规范](blog-research-backlog-spec.md) 负责。记录文件只保存研究事项，不复制上述通用规则。

## Series Brief

系列规划和归档统一保留在 `tools/blog/series/`，以文件内标记的状态为准，不只靠文件目录区分。

- `ai-industry-history-strategy-series-brief.md`：进行中
- `multimodal-video-ai-series-brief.md`：**2026-10-10 已结项，原路径只读归档**；技术主线已发布，后续相关新问题另列研究待办

Series Brief 只保存系列母题、文章地图、跨篇边界和运行状态，不复制长期 SOP / Checklist / 图表规范。

## 当前工作稿

未发布唯一 Markdown 工作稿位于 `drafts/blog/<slug>.md`；正式发布批准后的迁移、预览地址和同稿一致性检查见 [预览规范](blog-preview-release-spec.md)，最终 `docs/blog/<slug>.md` 与网站 metadata/HTML 契约见 [Writing Guide](../WRITING_GUIDE.md)。内容审校、认知验收和首次完整网页审阅的先后关系由 [SOP](blog-sop.md) 统一路由，不在本入口另写流程。

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
