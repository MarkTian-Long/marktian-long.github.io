# Blog Image Prompt Recipes

版本：1.3｜更新：2026-11-28

这些模板只服务于独立图片资产。每篇文章先在 tools/blog/visual-prompts/<slug>.md 保存逐图 Brief 和 Final Prompt；一个新会话负责同篇所有图片，按队列顺序一图一调用；实际调用只取当前图片块，不把整个文件或文章全文交给模型。

**默认从简**：普通场景图 1–3 句足够。先说清独立交付物、唯一阅读任务、主体关系和视觉风格；只有精确图表需要时才增加局部结构化逻辑。不要用堆叠形容词或完整文章背景弥补未想清楚的图片任务。

## 0. One-session orchestration / 单会话顺序编排

- 一篇文章只开一个新的干净会话；同篇图片在该会话中逐张完成，不按每张图另开会话。
- 会话开场要明确文章标题、slug、仓库/分支、draft、Prompt Packet 和目标预览 URL。
- 可以列出待办图片队列，但队列只负责调度；不得把队列里的多项内容合并成一次生图请求。
- 每轮只激活一张图；调用前回显任务摘要和完整实际 Prompt，核对它与 Packet 当前图块的 Final Prompt 一致。
- 上一张验收通过并关闭后才激活下一张；后续图只复用必要风格锚点。
- 同一会话连续两次发生全文海报/多模块总览/网页截图等范围错误时，停止该会话剩余生图，不自动开新会话，切换精确 SVG、表格或正文文字。

## 1. Editorial hero / 开篇首图

~~~text
Create one standalone 16:9 editorial image for [the article's opening question].
Show [one concrete scene or visual metaphor] that makes [one central relationship] immediately understandable.
Use [the approved medium, palette, and lighting]. No webpage, UI panels, article summary, logos, or unrelated decoration.
~~~

## 2. Concept / scene illustration / 概念与场景图

~~~text
Create one independent editorial illustration for the section about [one local mechanism].
Show [one main subject] doing [one action] with [only the supporting object needed], making [one relationship or trade-off] visible.
Use [the article's approved visual anchor]. Do not add text, data, brands, UI, or other section topics.
~~~

## 3. Mechanism / relationship visual / 机制关系图

~~~text
Create one standalone visual explaining [one relationship].
The exact objects are [short list], and the exact relationship is [one sentence or a short ordered list]; preserve the direction and hierarchy.
Use [visual metaphor / composition / style]. Do not add nodes, branches, labels, numbers, or causal links that are not specified.
~~~

## 4. Before / after workflow comparison / 前后流程对照

~~~text
Create one independent before/after workflow diagram for [one local process].
Before: [short ordered steps]. After: [short ordered steps and only the real branch condition]; keep the same start and acceptable end state.
Use [visual anchor], clear arrows and short exact labels. Do not imply that human work disappears or add performance numbers.
~~~

## 5. Layered evidence / metric hierarchy / 指标层级图

~~~text
Create one standalone diagram distinguishing these levels: [level 1 and its role], [level 2 and its role], [level 3 and its role].
Show [the real cross-cutting guardrails or attribution checks] without implying an unsupported causal hierarchy.
Use [visual anchor], short exact labels and clear spacing. Do not invent values, metrics, arrows, or extra sections.
~~~

## 6. Hub / multiple research directions / 多方向枢纽图

~~~text
Create one standalone conceptual image showing how [one shared organizing principle] relates to [3–5 objects from this same section].
Use one continuous scene with one central anchor and a few clearly distinct supporting objects; avoid numbered modules or chapter-list panels.
Do not summarize the article or combine unrelated sections.
~~~

## 7. Targeted edit / 定向修改

~~~text
Edit the selected image. Change only [one specific issue].
Keep [the approved subject, composition, geometry, palette, lighting and relationships] unchanged.
Do not add new text, objects, panels, labels, or causal relationships.
~~~

## 8. Style-anchor transfer / 同篇视觉一致性

~~~text
Use Image 1 only as a style reference for [palette, materials, lighting and rendering medium].
Create a new independent image for [this section's one task]; do not copy Image 1's subject, layout, or camera angle.
Keep these visual invariants: [2–4 items].
~~~

## 9. Prompt review before generation

- Is this one independent image asset for one section-level reading task?
- Does the Prompt Packet exist, and is the selected image block marked Ready?
- Is the actual handoff only this image's Final Prompt plus the necessary style anchor?
- Is the prompt free of full-article text, complete outline, other image briefs, webpage preview, and multi-section summary language?
- Are subject, action, relationship, composition and 2–4 high-signal constraints explicit?
- Are exact labels, numbers and branches frozen in the logic source and checked after generation?
- Is this the first candidate, or is a single, narrow correction justified?
