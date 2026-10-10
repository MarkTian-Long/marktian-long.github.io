# Blog 研究待办与聚合候选

结构整理：2026-10-09。这里保存研究问题，不是已批准的文章排期；分类、标题、大纲和发布仍需走正式流程。维护方式见 [待办维护规范](governance/blog-research-backlog-spec.md)，研究决策见 [Blog SOP](governance/blog-sop.md)，系列规划见 [series/](series/)。

本轮核验的是 Git 提交历史、记录边界与内部引用；外部来源沿用既有摘录，未重新逐站核验。下文“材料记录日期”不冒充本轮原文核验日期。创建、内容更新与新闻发生时间分别记录。

## 一、研究总览

| 研究问题 | 创建日期 | 状态 | 下一步 / 等待条件 |
|---|---|---|---|
| [为什么都重视招聘，有些公司却能形成持续的人才优势？](#br-20261009-02) | 2026-10-09 | 待研究 | 核实高管转一线案例；比较招聘、授权、配置与业务结果的关系 |
| [本轮焦点：Agent 而不是文件成为工作单位，软件怎样设计？](#br-20261009-01) | 2026-10-09 | 待补证 | 补 Yuchen 原话；比较 Agent、任务、成果三种组织方式 |
| [软件市场带来什么采购增量？](#br-20260930-01) | 2026-09-30 | 待补证 | 等待真实采购、伙伴交付与结算实践 |
| [第三方能力怎样被持续复用？](#br-20260930-02) | 2026-09-30 | 待补证 | 补跨任务复用与开发者实际收益证据 |
| [Agent 操作后，哪些产品设计价值会变化？](#br-20260930-03) | 2026-09-30 | 待研究 | 保留宽问题；先区分与新工作单位选题、旧文的增量 |
| [长期委托能否有用且可持续？](#br-20260930-04) | 2026-09-30 | 待补证 | 补完整事务周期中的收益、监督、补救及收入成本 |
| [消费入口与中介价值怎样迁移？](#br-20260930-05) | 2026-09-30 | 待补证 | 补真实用户迁移、商家渠道与内容收入实践 |

## 二、当前研究卡

<a id="br-20261009-02"></a>

### BR-20261009-02｜为什么都重视人才招聘，有些公司却能形成持续的人才优势？

**创建：2026-10-09｜内容更新：2026-10-09｜状态：待研究。** 触发于本会话连续几轮讨论：Anthropic 为什么在部分战场形成优势、这种优势与招聘是否有关；张一鸣和早期字节如何看待招聘；为何一些创始人/CTO 愿意去 Anthropic 从事一线工作；Netflix、Amazon、SpaceX、Stripe 等公司同样强调人才，差异究竟在哪里。本轮只是整理对话中的问题与案例线索，**未重新核验外部来源、任职变动或市场份额**；不把对话中的推测当成已证结论。

**核心问题与用户重点。** 几乎所有优秀公司都强调招聘，为什么只有部分公司能够持续把人才转化为产品能力、组织效率和竞争优势？研究重点不是“谁更重视招聘”，而是**招聘标准、人才吸引、角色配置、授权方式、协作机制与业务回报之间如何连接**。特别追问：早期字节“招强人、给业务空间”与 Anthropic“让资深管理者回到核心问题一线”的相似性和差异；高管放弃显赫头衔是否代表评价体系变化，还是存在薪酬、算力、行业周期等其他解释。

**当前判断（待验证假设）。** “重视招聘”可能只是必要但不充分条件。更有解释力的候选机制是：识别并吸引合适的人 → 提供独特问题、资源和责任空间 → 让关键人才靠近核心产出 → 通过协作与决策机制降低摩擦 → 将个人贡献放大为可验证的业务结果。不同公司可能优化这条链路的不同环节；不能把“人才密度高”“管理扁平”“AI 放大顶尖员工产出”直接写成可量化的普遍因果定律。

**关键证据与反证。** 既有对话提出早期字节创始人深度参与招聘、Anthropic 研究/工程融合与 MTS 职称，以及 Netflix 的人才密度、Amazon 的 Bar Raiser、SpaceX 的使命/稀缺工程问题、Stripe 的小团队高影响力、McKinsey 的招聘与培养机制。这些是**待核实的比较维度**，不是同口径的招聘绩效证据。尤其“Anthropic 反超 OpenAI”必须明确是哪个市场、指标和时点，不能等同于全面超越；“CTO/Founder 加入后做 MTS”也不能等同于降为普通工程师。若成功企业都宣称招聘重要，可能存在幸存者偏差；业务机会、算力、股权激励、产品分发、资本与行业景气度也可能是更主要的解释。

**缺口与下一步。** 先逐一核实任职/流动案例的前后职务、时间、职责与来源（尤其是 Peter Bailis、Bryan McCann、Tom Blomfield、Mike Krieger、Andrej Karpathy 等对话中提到的人物），再核验字节早期招聘实践与 Anthropic 的公开招聘/组织原则。随后选同赛道对照（包括 OpenAI）和跨行业反例，比较招聘门槛、创始人参与、职责设计、晋升/淘汰、激励、决策权，以及能够观察的留任、产品产出或经营结果；区分企业自述、独立报道与可比数据。最后收敛成可供 AI 创业团队/产品组织使用的判断问题，而不是泛泛的“多招牛人”。

**关联与去向。** 可与 [AI 产业史与战略判断系列 Brief](series/ai-industry-history-strategy-series-brief.md) 的“组织篇”对照：该系列目前关注 **AI 改变工作协调单位和公司边界**，本题则研究 **公司如何建立人才与组织竞争优势**，目前不应直接并为同一篇。可能落在商业或行业视角，待核心问题和证据明确后再定；用户本轮仅确认保存为讨论待办，不代表批准文章、大纲或排期。

<details>
<summary>展开：对话观点、跨公司比较框架与资料线索</summary>

- **早期字节 vs Anthropic（待证分析对照）**：前者的候选关键词是创始人参与选人、超前储备高潜人才、让创业者型人才负责新业务；后者是稀缺前沿问题、研究与工程协作、一线 Builder 的地位、模型与产品反馈闭环。需要检查这些描述是否准确、是否稳定，以及差异究竟来自组织设计还是产业阶段。
- **其他机制对照**：Netflix——以高绩效人才减少管理流程；Amazon——用 Bar Raiser 制度化保持招聘标准；SpaceX——靠稀缺工程任务与使命吸引；Stripe——小团队的大范围产出；McKinsey——规模化识别、训练和流动人才。不要把几个不同年代、行业、公司规模的口号直接排成优劣榜，比较时应明确各家试图解决的具体组织问题。
- **从“人才战略”到“竞争优势”的比较维度**：①招谁与怎样识别；②候选人为何愿意加入（问题、同行、资源、薪酬/股权、声誉）；③进入后如何分工与授权；④如何保持人才密度、培养与更替；⑤个人贡献如何通过产品、流程、技术和组织规模放大；⑥能否用同口径结果排除反向因果（公司已成功所以更容易招到强人）。
- **对话中的强判断需特别压力测试**：“顶尖 CTO 放弃管理头衔回归一线是新范式”可能只适用于少数顶尖实验室；MTS 是岗位称谓，不能单独证明职级或薪酬下降；“顶尖员工经 AI 加持生产力扩大到 20 倍”等比例只是之前讨论中的举例，不是数据；也不能从某些 Coding/API 指标推导 Anthropic 全面超过 OpenAI。
- **后续外部核验的起点（本轮未重验）**：[Anthropic Careers](https://www.anthropic.com/careers)、[ByteDance Seed](https://seed.bytedance.com/en/seedearlycareer)、[Netflix Culture](https://jobs.netflix.com/culture)、[Amazon 如何招聘](https://www.aboutamazon.com/news/workplace/how-amazon-hires)、[SpaceX Careers](https://new.spacex.com/careers)、[Stripe Careers](https://stripe.com/careers)、[Menlo Ventures 企业 AI 支出报告](https://menlovc.com/perspective/2025-the-state-of-generative-ai-in-the-enterprise/)。这些一手公司材料主要验证公开政策及定位，行业份额估算要交代样本与口径，人物流动和实际绩效仍需独立来源。
- **可形成的现实问题**：一家中小 AI 公司应先招通用高潜人才还是特定岗位专家？什么时候应该给强 IC 更多业务所有权而不是管理人数？哪些 Anthropic/字节做法依赖独特资源、无法直接复制？需要检验具体团队而非照搬“大厂成功学”。

</details>

<a id="br-20261009-01"></a>

### BR-20261009-01｜当 Agent 而不是文件成为工作单位，软件应该怎么设计？

**创建：2026-10-09｜内容更新：2026-10-09｜状态：待补证。** 触发材料是本对话 10 月 5 日 AIHOT 日报 D3；用户在 10 月 9 日要求研究保存，并进一步明确重点。此前被写进旧 03，现独立建项，创建日不回溯为新闻日期。既有材料记录为 10 月 9 日；Yuchen 原帖仍待核验。

**核心问题与用户重点。** 用户强调两条陈述：“文件 → App → 页面 → 操作”与“目标 → Agent → 长期 Context → 自主执行 → 用户验收”的对照，以及 Yuchen Jin 的“The new primitive is the agent, not the file”。要研究的不只是长期代办，而是当 AI 接手执行，人应围绕什么单位理解、安排和协调工作。

**当前判断。** 候选变化是从直接操作对象，转向设定目标、委派执行者、观察进展与处理例外。但 Agent 成为执行单位，不等于所有首页都应变成 Agent 列表。应比较执行者中心、任务/项目中心、成果/业务对象中心三种设计；半小时内的并行工作也可能体现变化，不以长期常驻为前提。

**关键证据与反证。** Codex app 的多 Agent 工作线程和 Linear 的 Issue 委派提供不同组织方式的产品对照；文件、编辑器和正式业务状态仍被保留。厂商设计只证明功能与路线，不证明用户迁移或可重复收益。Yuchen 引言当前只到二级存档，不能当成行业共识或正式编程语言定义。

**缺口与下一步。** 先取得 Yuchen 原帖上下文；选一个多 Agent 开发任务和一个跨系统业务项目，在相同目标下比较三种界面的协调负担、可见状态、接管与可验收结果；再做历史正文覆盖。不是先证明长期委托成立，才有资格研究工作单位变化。

**关联与去向。** 从 [旧产品设计问题](#br-20260930-03) 分出；[持续委托](#br-20260930-04)只负责长期场景的价值检验；[消费参与价值](#br-20260930-05)作边界。产品类与上述标题均为候选，用户确认的是重点与保存，不是正式写稿。

<details>
<summary>展开：来源、概念校准、旧文增量与研究方案</summary>

- **引用线索（既有记录：2026-10-09）**：[Yuchen Jin 公开二级存档](https://superx.so/creators/Yuchenj_UW)。旧记录将语境概括为同时管理许多终端标签页的负担与上下文持续性；原 X 帖全文、时间和完整语境仍需核验。Primitive 暂译为安排和协调工作的“基本单位”，不当作形式化技术定义。
- **产品对照（既有记录：2026-10-09）**：[Codex app 官方介绍](https://openai.com/index/introducing-the-codex-app/)强调多 Agent 线程、项目和变更审查，也保留差异检查与编辑器；[Linear 事项委派](https://linear.app/docs/assigning-issues)以 Issue 为显式对象，Agent 承担执行，人保留责任。两者用于提出不同设计选择，不据此宣称某一选择普遍更优。
- **箭头如何使用**：它们是作者的启发性对照，不是严格架构图或普遍历史分期。可改写为“人定位对象、选择工具并逐步操作”与“人提出目标和约束、委派 Agent，由 Agent 组织资料与工具，人在必要时干预和验收”。长期 Context 贯穿过程；验收不是人唯一出现的时点。文件/App 是资源、成果或事实系统，不会因执行者变化自动消失。
- **最强反驳**：用户可能只关心任务结果而不想管理 Agent；多 Agent 可能增加权限、责任与协调成本。传统工作流也能后台运行，一次性局部编辑仍适合直接操作。长期服务的机制、历史自动化与授权反证统一保存在 [04](#br-20260930-04)，不再复制一份厂商名录。
- **历史内容增量**：[《AI 正在把“使用软件”和“操作软件”拆开》](posts/ai-software-operator-shift.html)已谈对象、正式状态、权限、任务工作区和恢复；[《我为什么开始给自己搭 Harness？》](posts/personal-harness.html)已谈个人背景、任务接续与判断历史。新题应新增“用户如何理解、委派、协调和验收一组工作”，而非换一组箭头重述旧文。此前只做相关段落初扫，正式立项前仍须全文覆盖与独立性评审。
- **作者现实锚点**：AIHOT 日报从单次内容要求发展到持续规则调整，能说明作者希望反馈影响后续工作，不证明历史抓取已完整、执行可靠或净节省时间。正式使用作者经历前确认哪些实际过程可公开，不补写体验。
- **尚未执行的研究方案**：对照同一任务在对象、任务、Agent 三种界面中的用户路径，记录寻找工作位置、切换执行者、理解状态、调整方向、检查结果和接管的总投入。长周期分支再观察未完事项、授权变化、暂停与交接；2–4 周只是可调整的观察起点，不是已实施实验。不能用工具调用数或 Agent 数量替代收益。

</details>

<a id="br-20260930-01"></a>

### BR-20260930-01｜OpenAI Marketplace 与企业软件采购

**创建：2026-09-30｜内容更新：2026-09-30｜状态：待补证。** 既有材料记录日期：2026-09-30；事件为美国时间 9 月 29 日 DevDay。本次仅整理版式，不刷新原文核验日期。

**核心问题与用户重点。** 软件市场相对 GPT Store 真正新增什么采购机制，会否改变伙伴软件销售，而不只是换一个商店入口？

**当前判断。** 企业采购市场与插件能力分发不同。合同承诺额度可能降低采购阻力，但新增需求、既有支出转移和平台依赖需要分别验证。

**关键证据与反证。** 官方 FAQ 描述采购 beta：合格伙伴产品购买可计入符合条件客户的部分 OpenAI 合同承诺；客户与伙伴签约，伙伴开票，没有自助结账。这是机制说明，不是成交或伙伴收益证据。

**缺口与下一步。** 等待真实准入、额度认定、交付、续约和结算实践；区分新增成交与支出转移，不用发布会功能数量证明独立选题价值。

**关联与去向。** 商业类候选；与 [02](#br-20260930-02)组成下方唯一跨事项聚合观察，不并入当前 Personal Agent 主体。

<details>
<summary>展开：来源及边界</summary>

[Marketplace for enterprise customers](https://help.openai.com/en/articles/20001553-openai-marketplace-for-enterprise-customers)。动态帮助文档，沿用 9 月 30 日摘录；正式引用前复核准入、签约、开票和额度口径。采购市场不能与在伙伴应用中消耗 OpenAI 推理额度混写。

</details>

<a id="br-20260930-02"></a>

### BR-20260930-02｜从定制 GPT 到 Plugins，能力如何被持续复用

**创建：2026-09-30｜内容更新：2026-09-30｜状态：待补证。** 既有材料记录日期：2026-09-30；涉及 2023 年 GPTs、2024 年 GPT Store、2025 年应用目录及 2026 年迁移安排。

**核心问题与用户重点。** 第三方到底交付什么，用户怎样发现、调用和反复使用，它是否形成新的开发者价值？

**当前判断。** 产品承接不代表用户关系、历史流量和创作者收入完整迁移。GPT Store 热度感受不能替代失败证据；能力分发与企业采购是两个机制。

**关键证据与反证。** GPTs 原有工具/API Actions；后来出现应用提交、Codex 插件分发与迁移说明。第三方使用 ChatGPT 套餐额度的有限伙伴机制，可以与独立服务收费并存，但不等于免费算力、全部 Context 共享或所有开发者都获准接入。

**缺口与下一步。** 补开发者实际提交、维护和获益，以及用户跨任务复用的实践；引用迁移安排时重新核验时间与范围，不能把计划退休写成已关闭。

**关联与去向。** 可支持软件交付与复用研究，或与 [01](#br-20260930-01)检验使用到采购的连接；尚未独立立项。

<details>
<summary>展开：历史节点与来源</summary>

- **产品承接**：[Introducing GPTs](https://openai.com/index/introducing-gpts/)、[GPT Store](https://openai.com/index/introducing-the-gpt-store/)、[Apps submissions](https://openai.com/index/developers-can-now-submit-apps-to-chatgpt/)、[Plugin changelog](https://developers.openai.com/plugins/changelog)、[Custom GPT migration FAQ](https://help.openai.com/en/articles/20001519-custom-gpt-retirement-and-migration-faq)。旧记录包含 2026-03-25 已批准 Apps SDK 集成可作为 Codex plugins 分发的节点；它说明产品机制，未证明持续使用或收入。
- **运行与付费**：[DevDay 回顾](https://openai.com/index/devday-2026-recap/)、[第三方使用套餐说明](https://help.openai.com/en/articles/20001542-using-your-chatgpt-plan-in-other-apps-and-sites)。9 月 30 日摘录记录 Sign in with ChatGPT 的有限参与工具包括 OpenClaw，合格请求计入 Plus/Pro 额度，第三方仍可另收订阅、基础设施或服务费。平台与独立产品可同时合作竞争，但收入归属、用户关系与稳定分发仍待验证。

</details>

<a id="br-20260930-03"></a>

### BR-20260930-03｜Agent 成为操作者后，哪些产品设计价值会变化？

**创建：2026-09-30｜内容更新：2026-10-09｜状态：待研究。** 9 月 30 日即存在的宽问题；本次恢复原范围，将今天更具体的“工作组织单位”分出。未完成本题整体的定向证据研究，不能因子题有材料就统一标成已补证。

**核心问题与用户重点。** 当 Agent 操作软件，为人优化的菜单、No-code、多维表格、模板、Dashboard 和 Eval，哪些优势会减弱，哪些仍重要或更有价值？这些并非同一层级的能力，不能机械逐项判生死。

**当前判断。** 比较“减少人的操作步骤”与“减少完整任务的阻力”。权威状态、业务语义、专业能力、异常处理和验证可能仍有价值；不预设界面整体消失。

**关键证据与反证。** 当前主要依据作者的既有问题和已发表观点，不把作者旧文当成外部实证。[《AI 正在把“使用软件”和“操作软件”拆开》](posts/ai-software-operator-shift.html)已覆盖部分范围，重复风险较高。

**缺口与下一步。** 先推进 [工作单位子题](#br-20261009-01)，再检查宽问题是否还有独立的新机制或真实任务对照。没有增量就并入旧文复盘或关闭，不为了保留待办而拼功能清单。

**关联与去向。** 作为产品设计研究母问题保留，不是第二篇已排期文章；不重复维护新子题的主线、证据与研究方案。

<a id="br-20260930-04"></a>

### BR-20260930-04｜持续委托的真实需求、净收益与商业可持续性

**创建：2026-09-30｜内容更新：2026-10-10｜状态：待补证。** 既有材料记录包括 9 月 30 日与 10 月 9 日两批；本次把旧 03 中的持续委托资料合并到这里，不宣称已重验原站。

**核心问题与用户重点。** 单次有用的代办，能否变成愿意长期保留的服务？交代、授权、检查、接管和纠错会不会抵消收益？商业可持续不以消费者直接订阅为必要条件；OpenClaw 应作为“热潮后还剩多少真实价值”的反证，而非只作正面先驱。

**当前判断。** 候选价值是少记挂、少协调和少跟进；是否实现必须看完整事务结果和人的总投入。Instinct 的入口与主动服务设计提供了消费产品层面的重要对照，但融资和创始人增长叙事不证明长期采用。个人生活、个人工作与组织岗位分别判断，个人付费、AI Native、独立入口和独立公司不能相互代证。

**关键证据与反证。** 有厂商持续任务与控制机制、Instinct 创始人的增长/交易自述、付费自述和家庭服务实践，也有独立实测中的任务遗漏、未经请求的购物推荐、授权收缩、错误与安装后无事可做的反证；尚无足以支撑大众长期采用或健康单位经济的可比数据。未检索到不等于数据不存在。

**缺口与下一步。** 比较最佳现有工具/确定性自动化、逐次指挥 Agent 和持续委托，覆盖自然事务周期，记录收益与人的全部投入；分开核验订阅、广告、商家获客、佣金、按次与捆绑模式的收入归属和完整成本。

**关联与去向。** 当前 Personal Agent 研究的价值检验线，也为 [工作单位新题](#br-20261009-01)提供长期场景边界。用户 10 月 9 日确定正式大纲需包含三家大厂产品（Dots、Muse、消费级 Gemini Spark）及两家创业产品（Manus Cue、Instinct）的**简短同维度对照**，比较委托入口、持续环境、身份/行动边界与产品取舍，而不是五份参数横评。后文重点用 Dots/Muse/Spark 说明持续运行的不同承载，Cue 说明专用身份与有限多代理协作，Instinct 说明低交互负担、主动服务和商业利益冲突；OpenClaw 只作热潮后持续采用的反证。保持本篇“长期个人委托如何成立”的已锁定主线；创业、消费渠道和并购问题另入分支。消费入口见 [05](#br-20260930-05)。

<details>
<summary>展开：需求、持续运行机制与真实使用反证</summary>

**9 月 30 日既有材料。** [Daminger 2019 研究](https://journals.sagepub.com/doi/10.1177/0003122419859007)区分预见需求、寻找选项、决策与跟进，支持执行外还有认知劳动，不证明 AI 能减负。[Apple WWDC19 Shortcuts](https://developer.apple.com/videos/play/wwdc2019/213/)已有事件触发、跨 App 串联与预定义追问，不能把它们当成大模型独有。[WIRED 的 Instinct 亲历](https://www.wired.com/story/i-finally-found-an-ai-agent-worth-the-risk/)同时记录有用代办与违反限制的错误；单人体验不代表总体成功率，不把不同任务金额相减当净收益。

**10 月 9 日既有机制材料。** [Dots 发布](https://openai.com/index/introducing-dots/)（9/29）与[帮助文档](https://help.openai.com/en/articles/20001530-getting-started-with-your-dot)记录跨对话推进、活动状态、暂停和行动控制；背景主动研究仅只读，首发不能给个人 dot 单独邮箱或主动向用户发起电话。[工作区管理](https://help.openai.com/en/articles/20001554-manage-dots-in-chatgpt-workspaces)与发布页区分 primary dot 与组织 specialist dots，后者为企业试点。[Muse 发布](https://about.fb.com/news/2026/09/introducing-muse-personal-ai-agent/)（页面标注9/8发布、9/30更新）描述关闭 App 后任务继续、需批准时返回、App/WhatsApp入口与审计撤权；不采纳“世界首个”的优先权断言。[Google Gemini at Work](https://cloud.google.com/blog/products/ai-machine-learning/welcome-to-gemini-at-work-2026)（10/8）将持续执行、共同记忆与角色型 Agent 放在一起，同时保留 Gmail/Docs/Sheets 原位入口；这是10/5日报之后的材料，不回填为此前已知事实。

**2026-10-09 五款产品案例角色补证。** [OpenAI Dots 官宣](https://openai.com/index/introducing-dots/)包含个人 dot 的独立云电脑、跨插件连接和明确授权，组织 specialist dots 仍为企业试点；[Meta Muse 官宣](https://about.fb.com/news/2026/09/introducing-muse-personal-ai-agent/)强调消费者 App/WhatsApp 入口、独立 Secure VM 与授权判断；[Google 个人 Spark 官方介绍](https://blog.google/intl/zh-tw/products/devices-services/gemini-spark-ai/)确认在部分地区面向 Google AI Pro/Ultra 的 Gemini 个人代理与云端后台工作，须与 [Google Cloud 的企业 Gemini Agent](https://cloud.google.com/blog/products/ai-machine-learning/welcome-to-gemini-at-work-2026)区分；[Manus 2.0 / Cue 官宣](https://manus.im/en/blog/introducing-manus-2-0)明确 Cue 是在同一基础设施上构建的独立、早期邀请制应用，并提供每 Agent 邮箱、电话、钱包、电脑和团队分工，而非 Manus 2.0 的改名；[Manus 9/1 官方声明](https://manus.im/blog/manus-resumes-independent-operations)确认已恢复独立运营。Instinct 的创始人访谈与独立用户反馈另见下方专段。共同信号只支持产品架构收敛，不足以证明使用、长期留存和商业化结果。正文按三家大厂加两家创业公司介绍异同，不依据是否有独立 VM/邮箱/多个 Agent 就判定更成熟。

**2026-10-10 Google 路线时间线复核。** Google [I/O 5/19 初发](https://blog.google/innovation-and-ai/products/gemini-app/next-evolution-gemini-app/)面向消费者的 Gemini Spark（测试者与 Ultra Beta），[7 月官方更新](https://support.google.com/gemini/answer/17171264)增加语言/地区及美国 Pro 访问；[8/26 Gemini Live](https://blog.google/innovation-and-ai/products/gemini-app/productivity-features-gemini-live/)扩展语音代理能力；[9/9 订阅更新](https://blog.google/products-and-platforms/products/google-one/fall-2026-ai-plan-updates/)宣布 Spark 连接 Chrome/Google Photos，[9/10 Windows 版](https://blog.google/innovation-and-ai/products/gemini-app/gemini-app-now-on-windows/)支持委派 Spark 任务。**9/17 另有新形态**：[Google Labs CC for groups](https://blog.google/innovation-and-ai/models-and-research/google-labs/cc-expanding-to-groups/)面向最多六名家庭成员，拥有独立 Google 账号、隔离云电脑、共享/个人信息边界和按人授权，属于早期实验/候补，与 Spark 并非同一产品。[10/8 Gemini at Work](https://cloud.google.com/blog/products/ai-machine-learning/welcome-to-gemini-at-work-2026)则主要发布企业通用 Gemini agent，可作为个人工作助理或组织 coworker，包含独立工作账号、权限和长期 Context，属于企业路线，不能写成 Spark 当天才发布或所有消费用户已获得功能。**本篇意义**：Google 从 5 月起渐进发布 Spark，而 9 月 CC 家庭协作及 10 月组织代理成为同一长期委托原语在不同授权主体下的案例；不把这组发布当作用户长期采用或大众商业化效果。

**机制校准。** [Anthropic 长任务工程复盘](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents)（2025-11-26）通过进度文件、版本历史与验证接续会话，并记录过早宣告完成等失败；[Horvitz 混合主动交互论文](https://www.microsoft.com/en-us/research/publication/principles-mixed-initiative-user-interfaces/)（1999）早已讨论代理与直接操作结合。持续性不要求永久在线的同一模型进程或拟人身份；有记忆、定时按钮、独立邮箱也不自动代表承接持续职责。

**使用反证（10 月 9 日补录，报道10/6）。** [Business Insider 早期用户采访](https://www.businessinsider.com/early-users-delete-personal-ai-agents-privacy-scares-blunders-2026-10)记录四名用户因隐私或错误顾虑删除或限制接入；Meta 回应用户可管理与撤回权限。它证明实际授权阻力，不证明总体留存下降，也不裁定争议性越权指控。

**Instinct 访谈与新实测（2026-10-09 核验）。** 用户上传 Founder Park 对 [Noah Shinn 原始播客访谈（9/28）](https://colossus.com/episode/instinct-the-personal-agent/)的 22 页中文编译：创始人强调不要求用户打开新 App，以短信、电话和邮箱作为熟悉入口，重视消息前两行的可理解性与对人际打扰的分寸；Trusted Person Network 让不同人的代理在差异化授权下约时间与协调活动；探索从单次任务转向长期目标。这些属于产品目标与厂商自述，协作故事尚不能等同普遍效果。[公司 9/28 融资公告](https://finance.yahoo.com/technology/ai/articles/instinct-raises-1-billion-series-120300548.html)宣布募资 10 亿美元、估值 100 亿美元，属于融资事实；创始人自述每日增长约 10%、年化平台交易额约 10 亿美元（约一半来自旅行）、三周后约 40% 用户提供信用卡、提供过敏感信息者留存约 80%，缺少总样本/统计周期或外部审计；[TechCrunch](https://techcrunch.com/2026/09/29/instinct-founder-said-more-than-50-of-transactions-on-the-platform-are-travel-related/)特别指出年化计算口径未公开。平台交易额不等于 Agent 收入、抽佣或利润；创始人提出对商家交易抽佣、个人服务尽可能免费，目前仍是计划。[The Verge 10/9 实际试用](https://www.theverge.com/tech/1008254/instinct-agent-ai-hands-on-muse-dots)既记录模糊需求理解、邮件跟进等帮助，也发现游泳报名漏掉前置课程；[Business Insider 10/5](https://www.businessinsider.com/instinct-users-say-its-ai-agent-is-pushing-unsolicited-products-2026-10)采访收到未经主动请求购物建议的用户，但无证据证明商业推广或平台从这些建议获利。**本篇可用的新冲突是：主动贴心服务何时越界为打扰，未来按交易抽佣如何确保同等重视“不买、退货、取消订阅”；不是指控当前产品已经诱导消费。**

</details>

<details>
<summary>展开：付费方式、收入归属与完整服务成本</summary>

以下沿用9月30日材料。[Muse 订阅自述](https://github.com/steipete/CodexBar/issues/3797)在9/21称9/20开始订阅、下次续费10/20：这是用户陈述，不是付款凭证或已发生续费。Dots 首个包含在 Pro/Business Premium 的公告，不证明增量付费意愿；[Muse for Small Business](https://about.fb.com/news/2026/09/introducing-muse-small-business/)说明个人入口也混有经营需求，不可当纯消费生活样本。

[2025 Instant Checkout](https://openai.com/index/buy-it-in-chatgpt/)有商家成交收费；[ChatGPT 广告计费](https://openai.com/index/new-ways-to-buy-chatgpt-ads/)（2026-05-05）有 CPC；[Sponsored Agents](https://openai.com/index/reimagining-advertising-with-ai/)（2026-09-16）区分赞助会话与原聊天。这些证明相关产品存在商业化机制，不证明 Dots 已采用相同模式、已经盈利或推荐一定中立；当前具体结账收费调整见 [05](#br-20260930-05)。

需要检验：谁为哪部分价值付钱，收入归谁，是否新增交易或只多收渠道费；收入能否覆盖不产生交易的持续事务、失败、人工与维护成本；用户最优结果是“不买、取消、退款”时是否仍获同等服务。订阅不自动保证目标一致，广告/佣金也不自动证明损害用户。一次追回退款不能外推成每月收益，交易额不等于 Agent 收入或利润。

</details>

<details>
<summary>展开：历史热潮、创业实践与退出反例</summary>

- **热度、迁移、失败分开**：[Appfigures 对 Lensa 的2023-01-06估计](https://appfigures.com/resources/insights/20230106/5-is-the-ride-over-for-lensa-ai-(and-ai-generated-art))显示峰值回落后收入仍高于旧基线，不是利润或留存数据。[AutoGPT Classic](https://github.com/Significant-Gravitas/AutoGPT/blob/master/classic/README.md)不再支持，但[同名平台](https://agpt.co/)仍经营。GPT迁移时间表见 [02](#br-20260930-02)来源；旧记录为计划2026-12-11退休、部分合格企业可延期，不冒充已全面关闭。[Humane 官方消费者通知](https://support.humane.com/hc/en-us/articles/34374173951373-Important-Update-for-Consumer-Ai-Pin-Customers)对应2025-02-28主要云服务终止；旧记录是搜索可读、原站直接访问失败，不声称已读全文。少量精选历史案例不能计算本轮产品失败概率。
- **Ohai 的窄服务**：[家庭协作](https://www.ohai.ai/features/ai-household-collaboration-tools/)与[费用/人工支持 FAQ](https://www.ohai.ai/)说明共享日历、学校更新、Circle及人工复核；分派需用户请求、再联系成员确认，并非完全自主家务管理。报价和机制不是留存、净收益或护城河。[Good Housekeeping 家长试用](https://www.goodhousekeeping.com/relationships/parenting/a68017298/ohai-app-review/)（2025-09-23）有整理收益也有查校历/清旧日历障碍，且有联盟营销披露。[Ohai 2024 Instacart 合作](https://www.ohai.ai/blog/ohai-integrates-instacart-ordering/)由用户在 Instacart 完成购买；[Instacart Clementine](https://investors.instacart.com/News/news-releases/news-details/2026/Meet-Clementine-Instacarts-AI-Shopping-Assistant-That-Takes-Whats-for-Dinner-Off-Your-Plate/default.aspx)（2026-09-09）说明履约平台也有自有助手。接履约网络本身不是独占优势。
- **OpenClaw 是热潮后的压力测试**：[WIRED 3/13用户采访](https://www.wired.com/story/china-is-going-all-in-on-openclaw/)记录跨境电商使用者付云服务器和模型费后，把设想收窄为新闻与公众号辅助；这不是应用收入或长期续费。[澎湃3/12采访](https://www.thepaper.cn/newsDetail_forward_32752436)记录安装后不知做什么、Token成本、安全顾虑与卸载服务，不代表总体卸载率。[遥测说明](https://docs.openclaw.ai/gateway/telemetry)不提供逐安装长期留存；旧轮未取得同口径长期序列，不能写成留存崩塌。用户希望追问新鲜期后仍保留什么委托，而不是把它只写成后续产品先驱。
- **退出不等于买下公司**：[创始人公告](https://steipete.me/posts/2026/openclaw)与[项目官网](https://openclaw.ai/)记录加入 OpenAI、基金会独立管理、OpenAI 为捐助方，不支持“OpenAI 买下 OpenClaw”。未来研究须分公司/资产收购、许可和团队加入，并纳入未退出样本；“卖给大厂是最佳机会”仍是待证判断，暂不另立并购或创业赛道文章。

</details>

<details>
<summary>展开：持续委托的评估与写作边界</summary>

比较单次回应、有限任务、预定义触发流程和可调整的持续职责，不把它们当线性升级阶梯。持续职责要能交代范围、未完事项、触发条件、何时请用户判断、暂停及交接；反复运行相同提示词不是充分证据。目标、执行状态与正式业务记录分别维护，人物化名称可以稳定，执行模型与会话可以替换。

拟选情报/内容研究与跨周项目跟进，观察至少一个自然事务周期；记录交代、监控、纠错、接管总投入，漏跟进、有效提醒、可验收结果成本、授权变更后的行为、暂停或更换执行者后的损失。研究尚未执行，不填成功率或 ROI。后台少被打开不等于留存不足；多生成、多下载、多星标、多调用也不等于被持续委托。

事务密集且背景、连接、信任可复用的人群可能先受益，但目前只是定位假设。作者 AIHOT 规则调整是需求锚点，不是可靠性或净收益结果。按9月30日记录，Personal Agent曾收敛为持续委托的产品条件，分类/大纲尚待确认；本文件不据此猜测另一会话是否已完成文章。消费渠道、社区参与和退出不扩成当前主文。

</details>

<a id="br-20260930-05"></a>

### BR-20260930-05｜消费入口迁移与信息中介的价值

**创建：2026-09-30｜内容更新：2026-09-30｜状态：待补证。** 既有材料记录日期：2026-09-30；本次仅合并展示，不刷新原文核验日期。

**核心问题与用户重点。** 当用户把任务交给 Agent，消费中哪些环节迁移、收入和议价权归谁？用户特别强调逛购、审美、惊喜、自我表达与社区互动本身可能是价值，不能一律当作应消除的操作。

**当前判断。** 按一次活动的目的和环节划分，比按 App 行业划分更准确。发现、比较和执行可被代理，亲历体验未必可代劳；少打开 App 不等于不再使用其内容与服务，供给仍被需要也不保证原厂商保住收入。

**关键证据与反证。** 商家自有结账、原生平台 AI 发现、第三方代理阻断与兴趣推荐并存；即刻说明“得到摘要”不同于亲自互动和被认识。不能从这些设计推断真实迁移规模、平台利润或性别决定偏好。

**缺口与下一步。** 等待从发现到售后的同类任务数据、商家结算、渠道转化和发布者流量/授权收入，区分交易额、佣金与利润。分别验证技术能做、用户愿意交付、服务方允许进入。

**关联与去向。** 商业类候选，与 [04](#br-20260930-04)互补；为[工作单位新题](#br-20261009-01)提供参与边界，不自动与企业采购或产品设计合并。

<details>
<summary>展开：渠道机制、参与价值与即刻材料</summary>

- **结账机制有时间变化**：[OpenAI 路线调整](https://openai.com/index/powering-product-discovery-in-chatgpt/)（2026-03-24）说明初版 Instant Checkout 灵活性不足，改为支持商家结账并加强发现；[Shopify ChatGPT 渠道条款](https://help.shopify.com/en/manual/online-sales-channels/agentic-storefronts/chatgpt)在旧核验记录中为应用内浏览器/新标签页商家结账、无额外销售费，仅标准支付费。不能拿2025收费公告作此渠道当前费率，正式使用前须重核。
- **平台不是被动退出**：[YouTube 购物辅助发布](https://blog.youtube/news-and-events/made-on-youtube-viewer-custom-feeds-shopping-tools/)（2026-09-23）保留视频观看和继续追问；[Amazon 对 Comet 的声明](https://www.aboutamazon.com/news/company-news/amazon-perplexity-comet-statement)表示不接受相关第三方代理接入。后者是当事方立场，不直接采纳安全指控或推断最新诉讼结果。非合作供给可见性、授权、原生AI与阻断影响仍待验证。
- **过程与结果可以同时有价值**：[Babin等1994购物价值研究摘要](https://aquila.usm.edu/fac_pubs/7202/)区分功用与享乐；[Amazon Interests](https://www.aboutamazon.com/news/retail/artificial-intelligence-amazon-features-interest)保存偏好并持续推荐，保留用户浏览选择。喜欢逛不等于每一步都想参与，想省事也不等于交出全部判断；不按性别推断代办偏好。
- **即刻**：[官方 App Store](https://apps.apple.com/cn/app/即刻app/id966129812)、[会员权益](https://h5.ruguoapp.com/member?disablePanBack=true&displayFooter=false&displayHeader=false)在旧记录中为月20元/年128元、提供信息管理表达与身份展示；价格不是利润证据。[隐私政策](https://post.okjike.com/jike-privacy/)涉及广告/分析合作，不证明收入占比。[品玩2019创始人采访](https://www.pingwest.com/a/182079)记录2015上线、科技圈传播与2018社区转型，不代表当前年龄、职业或留存结构。Agent 可以发现、筛选与准备交流，但摘要不等于关系与社区体验。
- **仍需检验**：公开信息搬运、原始数据、版权、供给、信用、售后、履约分别有什么约束；新中介是否创造新增价值；一次购物助手是否已足够，还是必须长期个人背景。当前 Personal Agent 主体只保留需求与激励边界，不新增完整社区或渠道章节。

</details>

## 三、跨事项聚合候选

### 能力分发与软件采购，何时形成一条商业链路？

**关联：[01 采购](#br-20260930-01) + [02 复用](#br-20260930-02)｜待补证。** 01 提供预算、购买机制，02 提供交付、发现与复用；共同问题是实际使用能否转为伙伴软件采购。仍缺调用/复用到真实采购的连接及客户/伙伴实践，不能因同属 OpenAI 就合并，也不能拿插件分发证明采购成功。无连接则分开使用或关闭候选；独立成文须超出旧文“体系竞争、默认调用权、平台上的行业能力”。来源留在原卡，不再重复。

“Agent 而不是文件”已由 [BR-20261009-01](#br-20261009-01)独立维护，不再重复一份同名聚合候选；04只是长期场景的辅助问题。

## 四、关键决策与结项

| 日期 | 决策 / 变化 | 原因与去向 |
|---|---|---|
| 2026-09-30 | 首次建立01–04，随后新增05 | [首次提交19d738c](https://github.com/MarkTian-Long/marktian-long.github.io/commit/19d738c97149261e9bf681453b3e982c19ece615)与[新增05的a91abc4](https://github.com/MarkTian-Long/marktian-long.github.io/commit/a91abc44394e40a83a0785955a9f092633a1d27c)可核查；日期是记录创建，不是所有想法首次产生的日期。 |
| 2026-10-09 | 先按“持续委托”收录，后转向“Agent作为工作单位” | [8a46261](https://github.com/MarkTian-Long/marktian-long.github.io/commit/8a462619fa7c38b3f3e0aced2e04a720930c6767)与[b71d292](https://github.com/MarkTian-Long/marktian-long.github.io/commit/b71d292256bc376e877d984f2b2bbea9c0e0a670)。用户强调的重点比长期代办更上游；旧追加段落不再与新主线并列生效。 |
| 2026-10-09 | 新题独立为BR-20261009-01；恢复旧03范围 | 修正此前同主题即并项造成的日期与边界混淆；旧ID保留，新题内容只维护一次，旧03仍是未展开的宽问题。 |
| 2026-10-09 | 持续委托材料归04；同名聚合说明去重 | 保留用户重点、来源与反证，合并当前判断，长材料折叠；完整旧稿由Git历史保存。 |
| 2026-10-09 | 分离维护规范与研究记录 | 新维护规范只管格式、日期与安全更新，SOP继续管研究/写作流程；不建立第二份选题库、平行Skill或文章索引。 |

| 2026-10-09 | 人才与组织竞争优势讨论独立建项 BR-20261009-02 | 保存本会话的跨公司比较和待核实案例；与系列组织篇只建立关联，不改 Series Brief、文章排期或元数据。 |

尚无事项转入正式文章、合并关闭或完成结项。上述拆分是研究维护，不是批准立项或发布；本轮没有修改 `posts-meta.json`、文章关系、Series Brief 或正式正文。
