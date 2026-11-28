# Agent 上线后，怎样量出真实业务价值？｜视觉 Prompt Packet

- Article slug: agent-business-value-measurement
- Article draft: drafts/blog/agent-business-value-measurement.md
- Packet status: In progress
- Shared visual anchor: 暖米白背景；深海军蓝作为主色；克制的陶土橙与支撑蓝作为强调色；哑光纸雕与轻 3D 材质；真实柔和光照；留白充足、主体清楚。避免通用机器人头像、霓虹科技装饰、漂浮 UI、无意义数据流和密集矩形卡片。
- Model handoff rule: 每次只复制当前图块的 Final Prompt；本文件其他内容仅用于工作记录，不发送给 image_gen。

---

## Image 01 — opening-work-system

- Status: Ready
- Asset path: assets/images/blog/agent-business-value-measurement/opening-work-system.webp
- Insertion position: 摘要框之后、导语之前
- Reading task: 让读者看到 Agent 的价值发生在完整工作系统中，而不是 Agent 单独完成一段动作。
- Single visual proposition: 一项业务请求经过 Agent、业务工具与人工判断，最终形成经过核验的交付。
- Local context: Agent 能读取业务状态、调用工具并推进工作；遇到例外或高风险事项时，需要请求人工介入并核验最终结果。
- Required subjects / relationships: 左侧业务请求；中央 Agent 与业务工具协同；右侧员工只处理例外/复核；最右侧已核验交付。保持一条连续左到右动线。
- Exact labels or numbers: 无。
- Evidence boundary: 概念示意；不表示某家企业的真实系统或实际部署数据。
- Composition and aspect ratio: 独立横幅 16:9；单一连续场景；主体清楚；锐利焦点；避免浅景深造成文字或主体模糊。
- Reference images and their roles: 仅参考同篇已选图片的材质、配色与光线；不复制其他图片的主体和构图。
- Final Prompt:

生成一张独立的 16:9 博客编辑插画：一项业务请求从左侧进入中央 Agent 工作台，Agent 协调少量业务工具推进任务，遇到例外时由右侧员工判断复核，最后形成清晰的已核验交付；重点表现人、Agent 与工具共同完成工作，而不是机器人单独执行。采用暖米白背景、深海军蓝与克制陶土橙/支撑蓝的哑光 3D 纸雕质感，构图简洁、焦点锐利、主体细节清楚；不要文字、数字、UI 面板、Logo、网页边框或无关装饰。

- Attempt log:
  - Attempt 1（2026-11-28）：调用时未提供当前图块的显式 Prompt，模型从会话上下文生成了多章节总览海报；违反一图一命题，直接 Reject，不入稿、不作为参考图。
  - Attempt 2：待执行；将只交接本图 Final Prompt。
- Final decision: Pending

---

## Image 02 — four-step-map

- Status: Ready
- Asset path: assets/images/blog/agent-business-value-measurement/four-step-map.webp
- Insertion position: 开篇导语之后、第一章之前
- Reading task: 让读者先理解本文的四步衡量顺序。
- Single visual proposition: 从价值目标出发，经过工作系统变化和结果归因，最终判断价值是否兑现。
- Local context: 本文把 Agent 业务价值衡量归纳为四步；该框架是本文工作框架，不是行业统一标准。
- Required subjects / relationships: 四个连续步骤，严格从左到右：价值目标与主体 → 工作系统变化 → 结果证据与归因 → 价值兑现与投入决策。
- Exact labels or numbers: “价值目标与主体”“工作系统变化”“结果证据与归因”“价值兑现与投入决策”；只保留这四个标签和相邻箭头。
- Evidence boundary: 作者归纳的工作框架；不添加行业标准、成功率或财务数据。
- Composition and aspect ratio: 横向四阶段；四个节点等权；箭头清楚；适配手机正文宽度。
- Reference images and their roles: 可参考开篇首图的配色与材质，不复制机器人/人物主体。
- Final Prompt:

生成一张独立的横向四阶段框架图，严格从左到右呈现四个等权步骤，标签逐字为“价值目标与主体”“工作系统变化”“结果证据与归因”“价值兑现与投入决策”，每步配一个简洁且语义贴切的符号，并用清晰箭头连接。采用暖米白背景、深海军蓝文字、克制陶土橙与支撑蓝的轻 3D 纸雕信息图风格，标签大而清楚、留白充足；不要副标题、长解释、额外模块、数据或网页边框。

- Attempt log: 尚未在本轮调用。
- Final decision: Pending

---

## Image 03 — workflow-before-after

- Status: Ready
- Asset path: assets/images/blog/agent-business-value-measurement/workflow-before-after.webp
- Insertion position: 第二章“看清工作系统”中
- Reading task: 说明 Agent 进入后，任务分工、授权判断和交付路径如何变化。
- Single visual proposition: Agent 承担授权范围内的执行，人工保留例外判断与风险把关，双方最终汇入结果核验。
- Local context: 引入前以人工分流、判断和操作为主；引入后由 Agent 处理适格任务，但授权与风险条件决定是否交给工具执行或转人工。
- Required subjects / relationships: 引入前：请求进入 → 人工分流 → 人工处理 → 复核交付。引入后：请求进入 → Agent 处理 → 判断“授权范围内且风险可接受？”；是 → 工具执行；否 → 人工判断/审批；两条路径最终汇入结果核验与交付。
- Exact labels or numbers: “引入前”“请求进入”“人工分流”“人工处理”“复核交付”“引入后”“Agent 处理”“授权范围内且风险可接受？”“工具执行”“人工判断/审批”“结果核验与交付”。
- Evidence boundary: 通用示意，不代表某家企业实测流程；不暗示人工岗位消失。
- Composition and aspect ratio: 上下两条流程对照；共享起点与最终交付；中间只有一个真实分支；标签短而清楚。
- Reference images and their roles: 可参考四步框架图的颜色和材质；不复制其四节点布局。
- Final Prompt:

生成一张独立的上下对照业务流程图。上方按顺序呈现“引入前：请求进入→人工分流→人工处理→复核交付”；下方呈现“引入后：请求进入→Agent 处理→授权范围内且风险可接受？”；满足条件时进入“工具执行”，不满足时进入“人工判断/审批”，两条路径最终汇入“结果核验与交付”。只呈现这两条流程和这一个真实分支，箭头方向必须准确，不暗示人工消失；采用暖米白、深海军蓝、陶土橙与支撑蓝的轻 3D 编辑图形风格，文字大而清楚，不添加性能数字、额外步骤或其他章节内容。

- Attempt log: 尚未在本轮调用。
- Final decision: Pending

---

## Image 04 — measurement-evidence-map

- Status: Ready
- Asset path: assets/images/blog/agent-business-value-measurement/measurement-evidence-map.webp
- Insertion position: 第三章“怎样证明业务结果确实因 Agent 而改变”开头
- Reading task: 区分业务结果、流程机制和 Agent 诊断三类指标的职责。
- Single visual proposition: 三类指标回答不同问题，归因条件与硬护栏横跨整个衡量过程。
- Local context: 业务结果指标回答最终得到了什么；流程机制指标解释工作方式如何变化；Agent 诊断指标解释系统自身表现。三者是诊断层级，不表示单向因果。
- Required subjects / relationships: 三个并列诊断层级“业务结果”“流程机制”“Agent 诊断”；底部归因条件“基线·对照·分母·观察窗口”；横向贯穿三层的护栏“授权·安全·质量·合规”。
- Exact labels or numbers: “业务结果”“流程机制”“Agent 诊断”“基线·对照·分母·观察窗口”“授权·安全·质量·合规”。
- Evidence boundary: 三层是诊断职责，不是因果链或成熟度等级；不添加数值或未定义指标。
- Composition and aspect ratio: 三层清晰分区；归因条件作为底部独立带；护栏作为侧边或横向贯穿结构；不得使用因果上升箭头。
- Reference images and their roles: 可参考开篇首图的色彩和材质；不复制其他图的主体。
- Final Prompt:

生成一张独立的三层指标诊断图：从上到下分别标注“业务结果”“流程机制”“Agent 诊断”，三层表示不同诊断职责，不是因果链或成熟度等级。底部设置独立归因条件带“基线·对照·分母·观察窗口”，并用一条横向贯穿三层的护栏带标注“授权·安全·质量·合规”；不要添加因果箭头、数据数值或其他章节模块，采用暖米白、深海军蓝、支撑蓝与克制陶土橙的清晰编辑信息图风格，文字大而清楚。

- Attempt log: 尚未在本轮调用。
- Final decision: Pending
