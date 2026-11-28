# Blog Image Prompt Recipes

版本：1.1｜更新：2026-11-28

这些模板用于独立图片资产。每次只选一个模板，再按当前文章 brief 替换内容；不要把所有模板字段机械叠加。除非确实需要文字，否则优先要求无文字，由正文图注和确定性排版补足。

**全局范围锁**：每次只输入当前图片所在的局部内容，不输入全文/完整大纲/所有章节。除非作者明确要求，不生成全文摘要图、完整指南海报或多章节拼贴。最终 Prompt 应明确 `one standalone image for one section-level reading task; not an article summary`。

## 1. Editorial hero / 开篇首图

~~~text
Deliverable: One standalone editorial illustration asset for a long-form technology/business article. Not a webpage, UI mockup, slide, screenshot, or collage.
Purpose: Help readers immediately understand [the article's central tension or system].
Scene and subject: [A concrete scene or visual metaphor with only the objects implied by the argument.]
Action / relationship: [What is happening; how the main objects interact.]
Composition: Wide landscape composition; one dominant focal point; clear foreground/midground/background; intentional negative space; keep essential subjects inside a safe crop.
Style / medium: Distinctive editorial illustration, [specific medium such as matte 3D diorama, paper sculpture, painterly realism].
Materials and lighting: [Concrete material cues]; [light direction, softness, shadow character].
Palette: [Base/background]; [primary subject]; [one restrained accent].
Text: No text, letters, numbers, logos, watermarks, or interface labels.
Avoid: Generic stock-photo staging, floating UI, random icons, decorative circuit patterns, extra characters, unrelated props, clutter.
~~~

## 2. Concept / scene illustration / 概念与场景图

~~~text
Deliverable: One independent editorial illustration placed beside the section explaining [specific mechanism].
Purpose: Make [one abstract idea] tangible without adding a new claim.
Subject: [One main object/scene], with [only the supporting elements needed].
Relationship: Show [cause, constraint, collaboration, or trade-off] through physical arrangement and interaction.
Composition: [Close / medium / wide]; [viewpoint]; [dominant focal point]; [space reserved for crop or caption if needed].
Style / materials: [Specific visual medium and surface qualities].
Lighting / palette: [Concrete light and color roles].
Constraints: No text or invented data; no brand marks or realistic product UI; no unrelated decorative elements.
~~~

## 3. Mechanism / relationship visual / 机制关系图（混合制作）

先把精确逻辑写在确定性逻辑源中，再使用下面的 Prompt 探索视觉主体。不要让图像模型重新定义流程。

~~~text
Deliverable: One standalone visual base image for an editorial relationship diagram, not a finished webpage or a text-heavy infographic.
Audience and purpose: Help [audience] understand [one relationship].
Frozen logic (must not change):
- Objects: [exact node/object list]
- Relationships: [exact connections and direction]
- Conditions: [exact branch conditions / constraints]
Visual exploration: Express these relationships using [a concrete metaphor, physical scene, layered environment, or spatial composition].
Composition: [Layout supported by the frozen logic]; keep distinct areas for later precise labels and arrows.
Style: Match the article's approved visual anchor: [palette, medium, material, light].
Constraints: Do not add, remove, merge, or reorder objects; do not invent arrows, labels, numbers, outcomes, or causal links; no text.
~~~

## 4. Before / after workflow comparison / 前后流程对照

~~~text
Deliverable: One independent landscape editorial illustration asset showing a before/after work-system comparison.
Purpose: Explain how the complete workflow changes after [specific intervention].
Before state: [Actors, handoffs, bottlenecks, and final output].
After state: [Agent's bounded role, tool use, human review/exception path, and final output].
Shared invariants: [Same incoming request and same definition of acceptable completion].
Composition: Two clearly distinguishable but visually coherent zones; align shared start/end points; leave clear space for exact labels and arrows to be typeset later.
Style: [Article visual anchor, materials, lighting, palette].
Constraints: Do not imply that human work disappears unless the source supports it; do not invent performance numbers; no labels, logos, UI text, or extra steps.
~~~

## 5. Layered evidence / metric hierarchy / 指标层级图

~~~text
Deliverable: One standalone editorial illustration base for a layered evidence model.
Purpose: Distinguish [the article's exact levels] without implying an unsupported causal hierarchy.
Layers:
- [Level 1]: [what it observes]
- [Level 2]: [what it explains]
- [Level 3]: [what it proves]
Cross-cutting guardrails: [authorization, safety, quality, compliance, or other real constraints].
Composition: A single coherent cutaway / layered structure with clearly differentiated levels and visible cross-cutting supports; generous room for exact labels.
Style: [Visual anchor]; clear contrast, restrained texture, no decorative noise.
Constraints: Do not invent metrics, values, or arrows; no text; no dashboard or webpage.
~~~

## 6. Hub / multiple research directions / 多方向枢纽图

~~~text
Deliverable: One standalone conceptual image for a single section-level relationship, not a summary of the article.
Purpose: Show how [one shared organizing principle] relates to [a small set of distinct objects] without turning them into a chapter list.
Central idea: [One shared core object or process].
Distinct objects: [Only the 3–5 objects required by this one relationship; each has one unmistakable visual cue].
Composition: One continuous spatial scene with one central anchor and a few surrounding objects connected by a restrained physical path; no cards, grid, numbered modules, panel layout, title block, or summary banner. If the relationship is already clear in a table, skip the image.
Style: [Approved article visual anchor].
Constraints: No article title, chapter headings, prose, numbers, logos, unrelated examples, invented categories, webpage or slide layout. This image must not recap multiple sections.
~~~

## 7. Targeted edit / 定向修改

~~~text
Edit Image 1 (the selected asset).
Change only: [one specific change].
Keep unchanged: subject identity, composition, camera angle, crop, palette, material, lighting, and all approved relationships except [explicit exception].
Preserve: [critical objects, labels, geometry, shadows, and negative space].
Remove: [specific unwanted object or artifact].
Do not add: text, logos, watermarks, extra panels, extra objects, new causal relationships, or decorative elements.
~~~

## 8. Style-anchor transfer / 同篇视觉一致性

~~~text
Image 1 is the approved style reference only. Use it for [palette / materials / light / rendering medium / visual density].
Create a new, independent image for [new article section and task].
Do not copy Image 1's subject, object arrangement, camera angle, or composition. The new image must express [new section's specific visual message].
Keep the same visual language: [repeat the most important 2–4 invariants].
No text, logos, watermarks, or unrelated decorative elements.
~~~

## 9. Prompt review before generation

Before sending a prompt, check:

- Is the requested output an independent image asset, not a web page or screenshot?
- Does the prompt contain only the local section context, not the full article or outline?
- Does the image answer one section-level question rather than summarize multiple chapters?
- Have the final prompt text been checked for accidental pasted assistant prose or unrelated context?
- Is there exactly one primary reading task?
- Are the main subject, action, relationship, and visual hierarchy explicit?
- Are materials, light, palette, and composition concrete rather than generic adjectives?
- Are facts, text, numbers, brands, and UI either sourced or explicitly excluded?
- Are reference images assigned roles (style reference vs edit target)?
- Is the prompt already specific enough? If so, normalize rather than expand it.
