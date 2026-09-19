---
name: blog-human-writing
description: GitHub project authority for the blog material-capacity check and human-writing review. Runtime entries and compatibility copies may invoke it, but must not evolve independently. Use only for Chinese nonfiction blog work; it does not draft articles or replace the blog SOP, review checklist, or chart specification.
type: workflow
---

# 博客材料与活人感审校

`.agents/skills/blog-human-writing/` 是本 Skill 唯一的长期规则真源。每次真正执行材料承载力检查或活人感审校，都先读取当前 `SKILL.md`，再读取该阶段相应的 references：材料检查读 [材料承载力检查](references/material-check.md)，活人感审校读 [自然中文与段落推进](references/prose-review.md)。读取失败时如实说明，不假称已经执行。

已安装的 ChatGPT Skill 与 `.claude/skills/blog-human-writing/` 只提供运行入口或兼容副本，不能独立演化；若与本目录冲突，以本目录为准。规则确需变更时只修改本目录，再用项目的单向同步和一致性检查更新兼容副本。

先读取当前用户指令和项目级约束，再根据阶段选择“材料检查”或“活人感审校”。本 Skill 只适用于中文非虚构博客；不用于小说、邮件、工作消息、PR 稿、规范文档或代码。它不负责正式写稿，也不替代 `blog-sop`、`blog-review-checklist` 或 `blog-charts-spec`。

## 共通约束

1. 当前用户明确指令优先于项目级硬约束、当前阶段专项规范和本 Skill 的风格建议。
2. 每篇正式 Blog 完成后的统一规范沉淀复盘，都评估是否出现跨文章稳定的新规则；只有确有变化时才更新本 GitHub 权威目录，不维护双真源。
3. 直接修改当前稿；除非用户明确要求导出或保留版本，不创建 `v2`、`v3` 副本。

## 材料检查

在探讨收敛后、大纲确认前使用。检查计划中的主要判断和章节是否有足够材料支撑，输出“已足够 / 需补证 / 应缩小”。

- 不设固定字数或材料数量门槛。
- 公开事实可核验时先研究；个人经历或私人判断缺失时，只在缺口会改变方向时集中提问。
- 材料不足时优先补证、缩小主张、合并重复章节或明确未知；不虚构、不靠同义改写撑长度。
- 正式长文仍须等用户确认大纲后才能写。

## 活人感审校

在初稿完成后、正式 Checklist 终审前使用。

1. 先扫描全文，再修改；不要发现一个问题就停下来汇报。
2. 标出作者位置、各段承担的自然推理任务和新增信息；让共同完成一次连续推理的事实、解释、例子、边界和结论保持连贯，合并或删除只换说法的段落。
3. 直接修复能够确定的句法、节奏和空泛表达问题；涉及作者经历、观点强度或事实取舍时集中询问。
4. 保留准确的事实、数字、引语、术语、链接和不确定性表达；不得为口语化牺牲精度或补充新材料。
5. 修改后重新核对事实、数字、术语、判断强度、链接，以及表格和图中的对应标签。
6. 再执行完整 `blog-review-checklist`；本 Skill 不能替代事实、逻辑、格式、图表和发布终审。

## 语义判断原则

- 允许冒号、分号、破折号和“不是 A，而是 B”等正常表达；只在它们重复、制造假转折或掩盖证据不足时调整。
- 允许准确的专业词、概念校正、必要排比、有效比喻、回环和总结；条件是增加理解，而非增加姿态。
- 不以句长比例、连词数量或材料数量作为交付门禁；量化结果只用于定位值得人工复核的位置。
