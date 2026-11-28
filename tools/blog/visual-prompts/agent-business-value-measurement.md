# Agent 上线后，怎样量出真实业务价值？｜视觉 Prompt Packet

## Article identity

- Article title: Agent 上线后，怎样量出真实业务价值？
- Article slug: agent-business-value-measurement
- Repository: MarkTian-Long/marktian-long.github.io
- Branch: main
- Unique draft: drafts/blog/agent-business-value-measurement.md
- Prompt Packet: tools/blog/visual-prompts/agent-business-value-measurement.md
- Current noindex preview: https://marktian-long.github.io/tools/blog/previews/agent-business-value-measurement.html
- Packet status: Ready for one-session sequential production
- Session mode: One new clean session for this article; process the three diagram tasks sequentially in this same session. Do not open a separate session per image.
- Existing hero to retain: assets/images/blog/agent-business-value-measurement/opening-work-system.webp
- Current source diagrams: four-step-map.svg; workflow-before-after.svg; measurement-evidence-map.svg
- Intended final diagram assets: corresponding .webp files with the same base names.
- Shared visual anchor: 暖米白背景；深海军蓝主色；克制陶土橙与支撑蓝点缀；轻 3D / 纸雕与编辑图形混合质感；柔和真实光照；清晰焦点和充足留白。避免通用机器人头像、霓虹科技装饰、漂浮 UI、无意义数据流和密集矩形卡片。

## Single-session handoff prompt

Copy this whole handoff block into **one new ChatGPT conversation inside the Blog Project**. It is the session orchestration prompt, not an image-generation prompt. The assistant must only send the active image block's Final Prompt to image_gen.

```text
你现在接手 Blog Project 中一篇已存在文章的视觉生产。请不要重新选题、研究或改写正文，也不要生成整篇总结图。

【文章身份与唯一工作源】
- 文章标题：《Agent 上线后，怎样量出真实业务价值？》
- GitHub 仓库：MarkTian-Long/marktian-long.github.io
- 分支：main
- Slug：agent-business-value-measurement
- 唯一工作稿：drafts/blog/agent-business-value-measurement.md
- 唯一视觉 Prompt Packet：tools/blog/visual-prompts/agent-business-value-measurement.md
- 当前 noindex 预览：https://marktian-long.github.io/tools/blog/previews/agent-business-value-measurement.html
- 本轮保留现有开篇首图 assets/images/blog/agent-business-value-measurement/opening-work-system.webp，不重新生成、不覆盖。
- 本轮只重制正文中的三张 SVG 图，目标是同名 WebP；不要新增第四张图或第五张总览图。

【先读取当前规范和源文件】
先读取 tools/blog/governance/README.md，再按当前 GitHub main 的最新版本读取：
1. tools/blog/governance/blog-sop.md
2. tools/blog/IMAGE_GENERATION_WORKFLOW.md
3. .agents/skills/blog-image-prompting/SKILL.md
4. .agents/skills/blog-image-prompting/references/prompt-recipes.md
5. tools/blog/IMAGE_REVIEW_CHECKLIST.md
6. tools/blog/VISUAL_GUIDE.md
7. tools/blog/governance/blog-charts-spec.md
8. drafts/blog/agent-business-value-measurement.md 中与当前图对应的局部章节
9. 本 Prompt Packet 中当前激活的图片块

GitHub 当前内容和 SHA 是唯一事实源。不要依赖旧会话摘要或过期缓存。不要把整篇文章复制给 image_gen；文章全文只用于助手核对上下文，模型只接收当前图片的局部 Final Prompt。

【单会话、多图顺序推进】
这是同一篇文章的一个完整视觉生产会话。你必须在本会话内依次完成以下三张图，不要要求我为每张图另开会话，也不要把三张图合成一张：
1. Image 02 — four-step-map
2. Image 03 — workflow-before-after
3. Image 04 — measurement-evidence-map

任务队列只用于安排顺序，不是图片内容。任何时刻只有一张图处于 Active。每张图都必须单独回显任务摘要和本次实际提交的完整 Prompt，单独调用 image_gen，单独验收。当前图通过单图门、资产门后，更新 Packet 状态并明确关闭，再激活下一张。前一张图片只允许作为后续图片的风格参考，不得复制其主体、布局或逻辑。

【每张图的执行门】
- 先读取当前图块，不要一次性把三个图块都作为图像生成上下文。
- 回显当前图片的阅读任务、唯一视觉命题和本次实际提交的完整 Prompt。
- 检查实际 Prompt 与 Packet Final Prompt 一致，只对应当前这一张图，没有混入其他图、文章其他章节或总结海报要求。
- 然后只生成这一张独立图片。普通修订最多再做一次定向编辑/重生成。
- 检查中文、节点、箭头、分支、数字、画幅、清晰度和实际阅读尺度；未通过不能入稿。
- 每次失败记录归因：A = Prompt scope 越界；B = 会话上下文污染；C = Prompt 正确但模型执行偏差。
- 同一会话连续两次出现全文海报、多模块总览、网页截图等范围/媒介错误，停止本会话剩余生图，不再继续消耗循环；不要自动新开多个会话，改用精确 SVG、表格或正文文字承载，并说明原因。
- 不要每次都向我请求确认；除非图片内容需要改变文章事实、逻辑或作者立场，否则自行完成单图生产与验收。

【完成后的资产与预览交付】
三张图全部通过单图 QA 后：
1. 将最终图规范化为 VISUAL_GUIDE 允许的 WebP 资产，检查真实像素和文件大小，不用插值放大掩盖低清。
2. 上传至 assets/images/blog/agent-business-value-measurement/，使用四步图、前后流程图、指标图各自的同名 .webp。
3. 更新同一工作稿 drafts/blog/agent-business-value-measurement.md 的三处图片引用与 alt/caption；开篇首图保持原样。
4. 移除已被替换且不再被引用的 SVG 前，先检查所有引用和构建依赖。
5. 从同一工作稿和图源更新 tools/blog/previews/agent-business-value-measurement.html、public-dist 白名单和所需构建产物。
6. 更新并部署同一个 noindex 预览 URL，不创建新预览地址，不正式发布文章。
7. 回读 GitHub 文件和部署状态；区分 commit、Pages deploy、URL 可访问和浏览器视觉验收，不虚报完成。

【现在只激活第一张图】
当前 Active：Image 02 — four-step-map。
它只服务于本文的四步衡量框架，不是全文总览。

唯一视觉命题：从价值目标与主体出发，经过工作系统变化和结果归因，最终判断价值是否兑现与投入是否值得。

必须呈现的局部结构：
- 小标题：“Agent 业务价值的四步衡量框架”
- 四个等权阶段，从左到右：
  01 价值目标与主体｜谁受益、谁付款、谁承担风险？
  02 工作系统变化｜任务、人机分工和交接怎样改变？
  03 结果证据与归因｜相对基线，结果是否改善？
  04 价值兑现与投入决策｜收益是否实现，扩围是否仍值得？
- 底部两条横向辅助带：
  技术诊断：正确性 · 可靠性 · 延迟 · 成本
  硬护栏：授权 · 安全 · 质量 · 合规

视觉与布局要求：
- 独立横向 5:4 信息图，建议最终输出 1280×1024 WebP。
- 四步是唯一主线；底部技术诊断与硬护栏是横跨四步的辅助带，不是第五、第六阶段。
- 每步配一个简洁、语义准确的小符号；四步之间用方向清楚的箭头连接。
- 中文标签与问题必须准确、足够大，四个阶段等权，留白充分。
- 使用暖米白、深海军蓝、陶土橙与支撑蓝，轻 3D 纸雕/编辑图形风格。
- 不要大标题 Banner、长解释、案例、KPI 清单、其他章节内容、网页边框、UI 截图或多栏文章总结海报。

本图唯一 Final Prompt：
生成一张独立的横向 5:4 四阶段衡量框架图，只表达 Agent 业务价值的四步顺序。顶部仅用小标题“Agent 业务价值的四步衡量框架”；主体严格从左到右呈现四个等权阶段，每个阶段包含一条准确标签和一条短问题：01“价值目标与主体”／“谁受益、谁付款、谁承担风险？”；02“工作系统变化”／“任务、人机分工和交接怎样改变？”；03“结果证据与归因”／“相对基线，结果是否改善？”；04“价值兑现与投入决策”／“收益是否实现，扩围是否仍值得？”。四个阶段之间用清楚的左到右箭头连接，每阶段配一个简洁语义图标。底部只放两条横向辅助带：“技术诊断：正确性·可靠性·延迟·成本”和“硬护栏：授权·安全·质量·合规”；两条带横跨四步，不构成新的阶段。采用暖米白背景、深海军蓝文字、克制陶土橙与支撑蓝、轻 3D 纸雕编辑信息图风格；标签清晰、留白充足。不要文章标题海报、其他章节、案例、KPI 模块、网页截图或无关卡片。

现在请先回显本图任务摘要和实际提交 Prompt，然后直接生成第一张图；通过验收后，在同一会话继续第二张、第三张，直至三张图与同一预览页面全部完成。
```

---

## Session queue

### Image 02 — four-step-map

- Status: Ready
- Current source asset: assets/images/blog/agent-business-value-measurement/four-step-map.svg
- Intended final asset: assets/images/blog/agent-business-value-measurement/four-step-map.webp
- Insertion position: 开篇导语之后、第一章之前
- Reading task: 让读者先理解本文的四步衡量顺序。
- Single visual proposition: 从价值目标与主体出发，经过工作系统变化和结果归因，最终判断价值是否兑现与投入是否值得。
- Local context: 本文把 Agent 业务价值衡量归纳为四步；这是本文工作框架，不是行业统一标准。
- Exact content:
  - Title: Agent 业务价值的四步衡量框架
  - Step 1: 价值目标与主体｜谁受益、谁付款、谁承担风险？
  - Step 2: 工作系统变化｜任务、人机分工和交接怎样改变？
  - Step 3: 结果证据与归因｜相对基线，结果是否改善？
  - Step 4: 价值兑现与投入决策｜收益是否实现，扩围是否仍值得？
  - Cross-cutting diagnostics: 技术诊断：正确性·可靠性·延迟·成本
  - Cross-cutting guardrails: 硬护栏：授权·安全·质量·合规
- Evidence boundary: 四步是本文归纳的工作框架，不是行业统一标准；不添加成功率、财务数字或其他阶段。
- Composition: 横向 5:4，四步横排、两个底部辅助带；建议 1280×1024。
- Final Prompt:

生成一张独立的横向 5:4 四阶段衡量框架图，只表达 Agent 业务价值的四步顺序。顶部仅用小标题“Agent 业务价值的四步衡量框架”；主体严格从左到右呈现四个等权阶段，每个阶段包含一条准确标签和一条短问题：01“价值目标与主体”／“谁受益、谁付款、谁承担风险？”；02“工作系统变化”／“任务、人机分工和交接怎样改变？”；03“结果证据与归因”／“相对基线，结果是否改善？”；04“价值兑现与投入决策”／“收益是否实现，扩围是否仍值得？”。四个阶段之间用清楚的左到右箭头连接，每阶段配一个简洁语义图标。底部只放两条横向辅助带：“技术诊断：正确性·可靠性·延迟·成本”和“硬护栏：授权·安全·质量·合规”；两条带横跨四步，不构成新的阶段。采用暖米白背景、深海军蓝文字、克制陶土橙与支撑蓝、轻 3D 纸雕编辑信息图风格；标签清晰、留白充足。不要文章标题海报、其他章节、案例、KPI 模块、网页截图或无关卡片。

- Attempt log: 当前新会话尚未生成。
- Final decision: Pending

---

### Image 03 — workflow-before-after

- Status: Queued
- Current source asset: assets/images/blog/agent-business-value-measurement/workflow-before-after.svg
- Intended final asset: assets/images/blog/agent-business-value-measurement/workflow-before-after.webp
- Insertion position: 第二章“Agent 实际改变了哪段业务工作？”中
- Reading task: 说明 Agent 进入后，任务分工、授权判断和交付路径如何变化。
- Single visual proposition: Agent 承担授权范围内的执行，人工保留例外判断与风险把关，最终汇入状态核验与交付。
- Exact nodes and relations:
  - 上方车道标题：“引入前：人工主导”
  - 请求进入 → 人工分流 → 判断与操作 → 复核与跟进
  - 下方车道标题：“引入后：Agent 与人协作”
  - 请求进入 → Agent 处理 → 决策节点（两行）：“在授权范围？”／“风险可接受？”
  - 只有两个条件均为“是”才进入“工具执行”
  - 任一条件为“否”则进入“人工判断或暂停”
  - 两条分支最终汇入“状态核验与交付”
- Evidence boundary: 通用示意，不代表某家企业实测流程；不得暗示人工岗位消失或完全自动化。
- Composition: 独立横向 5:4 上下两车道流程图，唯一一个判断节点、两个分支、一个汇合终点；建议 1280×1024。
- Final Prompt:

生成一张独立的横向 5:4 上下双车道业务流程对照图，只解释 Agent 介入前后工作方式的变化。上方车道标题“引入前：人工主导”，按顺序连接“请求进入”→“人工分流”→“判断与操作”→“复核与跟进”。下方车道标题“引入后：Agent 与人协作”，连接“请求进入”→“Agent 处理”→一个菱形判断节点，节点两行文字为“在授权范围？”和“风险可接受？”。只有两个条件均为“是”时走向“工具执行”；任一条件为“否”时走向“人工判断或暂停”；两条分支最后汇合到“状态核验与交付”。所有箭头方向、是/否标签和汇合路径必须准确；不能暗示人工消失。使用暖米白、深海军蓝、陶土橙与支撑蓝的清晰轻 3D 编辑图形风格，文字足够大，留白充分。只呈现这两条流程和一个判断节点，不加其他章节、性能数字、网页截图或文章总结模块。

- Attempt log: 尚未在新会话调用。
- Final decision: Pending

---

### Image 04 — measurement-evidence-map

- Status: Queued
- Current source asset: assets/images/blog/agent-business-value-measurement/measurement-evidence-map.svg
- Intended final asset: assets/images/blog/agent-business-value-measurement/measurement-evidence-map.webp
- Insertion position: 第三章“怎样证明业务结果确实因 Agent 而改变？”开头
- Reading task: 区分业务结果、流程机制和 Agent 诊断三类指标的职责。
- Single visual proposition: 三类指标分别回答不同问题；归因条件和硬护栏横跨整个衡量过程。
- Exact content:
  - Title: 指标有不同职责，不能互相替代
  - Subtitle: 分别观察经营结果、流程变化与 Agent 自身表现
  - Parallel diagnostic lens 1: 业务结果指标｜成本·合格吞吐·收入｜客户结果·风险
  - Parallel diagnostic lens 2: 流程机制指标｜覆盖·分流·周期·交接｜接管·返工·重开
  - Parallel diagnostic lens 3: Agent 诊断指标｜最终状态·完整验收·可靠性｜延迟·工具错误·调用成本
  - Cross-cutting attribution: 归因条件：基线·对照·分母·观察窗口
  - Cross-cutting guardrails: 硬护栏：授权·安全·质量·合规
- Evidence boundary: 三类指标是并列诊断职责，不是因果链、成熟度等级或前后步骤；不添加数值、因果箭头或未定义指标。
- Composition: 独立横向 5:4，三条平行诊断带 + 两条横向辅助带；建议 1280×1024。
- Final Prompt:

生成一张独立的横向 5:4 指标诊断图，只说明三类指标的不同职责。顶部小标题“指标有不同职责，不能互相替代”，副标题“分别观察经营结果、流程变化与 Agent 自身表现”。主体为三条视觉并列、互不构成因果顺序的诊断带：第一条“业务结果指标”，下方短词“成本·合格吞吐·收入｜客户结果·风险”；第二条“流程机制指标”，下方短词“覆盖·分流·周期·交接｜接管·返工·重开”；第三条“Agent 诊断指标”，下方短词“最终状态·完整验收·可靠性｜延迟·工具错误·调用成本”。三条诊断带只作并列观察视角，使用相同层级和视觉权重，不画连接箭头、不表达成熟度或单向因果。底部设置两条横向辅助带：“归因条件：基线·对照·分母·观察窗口”和“硬护栏：授权·安全·质量·合规”，明确它们横跨三类指标。采用暖米白背景、深海军蓝文字、克制陶土橙与支撑蓝、轻 3D 纸雕编辑图形风格；文字大而清楚，留白充足。不要数据数值、额外章节、网页截图或全文总结海报。

- Attempt log: 尚未在新会话调用。
- Final decision: Pending

## Asset and preview rules

- Existing hero: keep `opening-work-system.webp` unchanged.
- Final WebP target paths: `four-step-map.webp`, `workflow-before-after.webp`, `measurement-evidence-map.webp`.
- The current draft still references the three SVG source files. Do not change Markdown paths until each corresponding WebP has passed the image review gate and has been uploaded.
- The current noindex preview is a previous version. After all three replacements pass, regenerate and update the same preview URL; do not create a second preview file or formally publish the article.
