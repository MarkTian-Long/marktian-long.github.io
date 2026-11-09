# Blog 研究待办与聚合候选

结构整理：2026-11-07；最后内容更新：2026-11-09。这里保存研究问题，不是已批准的文章排期；分类、标题、大纲和发布仍需走正式流程。研究决策与六种状态沿用 [Blog SOP](governance/blog-sop.md)，记录、责任与安全回写见 [待办维护规范](governance/blog-research-backlog-spec.md)，系列规划见 [series/](series/)。

**本轮口径。** “可进大纲”表示在卡片写明的范围内，证据已足以进入单篇探讨收敛与大纲准备，不表示已批准正文，也不要求所有未知消失。“待关键补证”必须指出仍会阻断核心判断的具体缺口。每卡分开记录成文范围、阻断／非阻断缺口，以及下一步由 AI、作者、实测还是外部信息推进；不增加 A/B/C 平行状态。

**选题启动排序（2026-11-08 维护说明）。** 以下总览按讨论与查找便利排列，**不是已经确认的写作排期**；下一篇按 [SOP 的动态编辑优先级](governance/blog-sop.md)比较认知增量、证据成熟度、作者用途、研究成本与时效窗口。创建时间仅触发积压复核，不加固定权重；近期新闻也不自动获得第一名。较早已经“可进大纲”的 BR-20261010-01（Agent 业务价值）、BR-20261009-01（多工作协同）、BR-20260930-05（消费交易链）与 BR-20261011-01（中美 AI 使用）需与新卡共同比较，不能笼统写“再等更多案例”；若暂缓须说明实际原因。当前推荐仅作为本轮编辑判断，**不改变六种状态，不自动批准正文或大纲**。

**主动推进规则（SOP v41）。** 在当前聊天、正式开题、待办盘点或已配置的计划任务实际读取到“待研究／待关键补证”且存在可自主核验的公开缺口时，由 AI 直接执行一次有目标、有边界的补证、反证与成文范围检查，无需作者逐次许可。公开检索没有增量时记录已查来源与下次触发条件（新当事方说明、真实用户数据、正式上线、可复验实验等），不无限重复搜索；需要授权的真实产品／生产实验不得擅自执行。作者只负责确需其经验、立场、业务事实及正式大纲的确认。**自动触发并不等于无人运行时后台巡检**；持续定时检查需另行创建计划任务。

**覆盖与限制。** 2026-11-07 对全部 17 张既有研究卡进行状态复核，对可用公开材料完成一轮定向补证，并补充既有系列分支与已发布文章的后续证据。没有调用 Jev API，没有登录或部署产品做对照试验，没有获取企业内部经营数据，也没有完成长期追踪；这些不因公开检索完成而视作已解决。沿用旧材料时保留原核验日，摘要、索引与全文分别说明，未找到不等于不存在。

**历史追溯。** 本次将多轮追加内容合并为一份当前判断，稳定 ID、创建日期、主要来源、用户重点和反证继续保留。已发布主题的较长产品时间线、旧方案与历轮摘录可在[整理前的完整 Git 记录](https://github.com/MarkTian-Long/marktian-long.github.io/blob/ecf94b1d3ad4f0a892353759641430f2e189d887/tools/blog/research_backlog.md)追溯；它是不可变历史，不是另一份生效待办。

## 一、研究总览

18 个稳定 ID：**8 个可进大纲、6 个待关键补证、3 个已转入已发布文章、1 个已合并**。仍独立待推进的研究问题为 14 个，不等于已承诺写 15 篇；系列指针、聚合观察与旧文后续证据不重复计数。

| 研究问题 | 创建日期 | 状态／成文范围 | 下一步与责任 |
|---|---|---|---|
| [AI for Science 的生物学突破口，会是虚拟细胞驱动的实验闭环吗？](#br-20261108-01) | 2026-11-08 | 可进大纲（预测→实验设计，非行业爆发预测） | AI：对照 LabCompass、Arc 挑战与简单基线；作者确认范围；产业规模化须另行求证 |
| [软件调用智能时，模型与程序怎样分工？](#br-20261107-01) | 2026-11-07 | 可进大纲（接口与判断评测） | AI：组织有反例的对照框架；作者确认大纲；真实业务胜负须另行实测 |
| [Agent 工作负载如何改变 Git 与代码协作基础设施？](#br-20261103-03) | 2026-11-03 | 可进大纲（限定 Git／审查链路） | AI：收敛三条架构路线及交付边界；不等待所有基础设施都发生变化 |
| [FSD 的训练经验能否迁移到 Optimus？](#br-20261103-01) | 2026-11-03 | 已转入（2026-11-09 发布） | [正式文章](posts/fsd-optimus.html)；机器人学习增益与竞争排名仍需新证据 |
| [字节 GenAI 调整后，营销价值流向哪里？](#br-20261103-02) | 2026-11-03 | 待关键补证（组织原因／经营效果） | 待外部：当事方说明或可比较效果；改写为产品机制题须明确确认范围 |
| [界面与内容可以生成后，如何持续修改并保留控制？](#br-20261101-01) | 2026-11-01 | 可进大纲（动态界面与专业工具协同） | AI：比较 Vercel 动态组件、Instagram Edits／Roblox Studio 的 Agent＋人工编辑；效果结论待实测 |
| [AI 能造软件后，企业还应买什么 SaaS？](#br-20261016-01) | 2026-10-16 | 已转入（已发布） | 待外部／需实测：AutoFix 的长期维护净收益；不另开重复文章 |
| [中美 AI 态度与实际使用，哪些比较成立？](#br-20261011-01) | 2026-10-11 | 可进大纲（同口径与解释边界） | AI：使用同一调查并交代样本偏差；不写成 2026 全国渗透率排名 |
| [Agent 如何按业务验收与全成本衡量价值？](#br-20261010-01) | 2026-10-10 | 可进大纲（经营决策方法） | AI：整理验收、覆盖、成本与风险口径；实际模型排名须真实任务测试 |
| [机器人数据工厂是否形成可持续生意？](#br-20261010-02) | 2026-10-10 | 待关键补证（有效经验的经济性） | 待外部：客户交付、数据成本与任务增益；开放数据管线不代替商业证据 |
| [AI 游戏创作后，平台与引擎价值往哪里走？](#br-20261010-03) | 2026-10-10 | 待关键补证（重复游玩与创作者回报） | 待外部／需实测：持续编辑、玩家反馈、收益；不把 Spark 路线图当上线 |
| [招聘怎样转化为持续的人才优势？](#br-20261009-02) | 2026-10-09 | 待关键补证（机制到结果的连接） | 待外部：同案例配置与产出过程证据；人物任职、公司口号已不足以继续推论 |
| [用户该围绕 Agent、任务还是成果组织工作？](#br-20261009-01) | 2026-10-09 | 可进大纲（多工作协同设计） | AI：对照执行者、责任人和成果对象；作者确认大纲；不预设 Agent 列表胜出 |
| [软件市场带来什么采购增量？](#br-20260930-01) | 2026-09-30 | 待关键补证（真实采购增量） | 待外部：客户／伙伴成交与续约；FAQ 机制已可作为案例使用 |
| [第三方能力怎样被持续复用并获益？](#br-20260930-02) | 2026-09-30 | 待关键补证（复用与开发者收益） | 待外部：跨任务重复使用、维护与收入案例；迁移安排不是采用结果 |
| [Agent 操作后的泛产品设计价值](#br-20260930-03) | 2026-09-30 | 已合并（具体子题承接） | 去向：工作组织、持续编辑两卡及已发布软件操作者文章；不再独立排队 |
| [长期委托能否有用且可持续？](#br-20260930-04) | 2026-09-30 | 已转入（已发布） | 待外部／需实测：自然事务周期净收益、留存与收入；不重写当前正文 |
| [消费入口、交易与履约价值怎样分工？](#br-20260930-05) | 2026-09-30 | 可进大纲（交易链路与参与边界） | AI：对照需求入口、订单、支付、履约；利润迁移结论仍待真实经营数据 |

**已发布文章与在途系列，不重复新建卡。** 产业史系列 02《[技术最领先的人，为什么不一定拿走最大的价值？](https://marktian-long.github.io/tools/blog/posts/ai-innovation-value-capture.html)》已于 2026-11-08 正式发布，正式 Markdown 在 [`docs/blog/ai-innovation-value-capture.md`](../../docs/blog/ai-innovation-value-capture.md)；不再把旧 Brief 的“优先启动候选”或已失效 draft 路径当成当前状态。系列 03／04／05 的本轮证据见[系列分支补证](#series-evidence-20261107)，规划归属仍在原 Brief。多模态—视频—世界模型系列已结项，不自动补第六篇。

已发布主题的后续证据：[记忆系统 × Personal Harness：Dreaming](#blog-memory-dreaming-20261107)。

**11/07 三篇来稿归位。** AI 写作与 AGI／研究选择两篇进入[系列 04 的材料](#series-evidence-20261107)；Persom 进入[既有 Memory／Harness 后续证据](#blog-memory-dreaming-20261107)，并由持续委托和成功任务指标两卡交叉引用。不增加独立 BR 卡，不把来源观点改成作者立场，不改变文章排期。正文依据为用户上传的完整 PDF；原文链接按用户提供的对应关系保留，本轮微信原站读取受限，不将 PDF 阅读说成在线全文核验。

## 二、当前研究卡

<a id="br-20261108-01"></a>

### BR-20261108-01｜AI for Science 的生物学突破口，会是虚拟细胞驱动的实验闭环吗？

**创建：2026-11-08｜内容更新：2026-11-08｜状态：可进大纲（虚拟细胞从预测到实验设计的可验证机制，不预测产业爆发已成定局）。** 用户在 11/08 Follow Builders 日报后，确认 Generative UI／AI 创作候选 1，并进一步明确对 **AI for Science（AI 驱动科学研究），特别是生物学在未来几年的潜在跃迁**有长期兴趣。这个判断是作者关注的**待验证方向**，不能把未来数年必然“爆发”写成已获证的行业趋势。触发访谈于 2026-11-06 发布；LabCompass 预印本于 10/09 发布；本卡为 11/08 首次入库。

**核心问题与用户重点。** 相比通用大模型、蛋白结构预测或纯“虚拟世界”叙事，AI 生物学是否正在出现更可度量的能力跃迁：从大量观测数据中**描绘细胞状态**，到预测基因／药物／培养条件造成的**扰动响应**，再到反向提出**可由真实实验验证的干预方案**？哪些环节最有可能在未来数年形成可重复的科学成果，哪些仍受湿实验（真实生物实验）周期、可泛化数据和生物机制不确定性限制？先以 **Virtual Cell（虚拟细胞）＋Lab-in-the-loop（实验反馈闭环）**为独立研究切口；蛋白设计、药物发现、实验室机器人与临床转化先作为相邻方向和潜在对照，不把“全部 AI for Science”压进一篇文章。

**当前判断（限定范围内的研究假设）。** 模型预测细胞受到干预后的状态，与模型能否**提高找到有效干预方案的成功率**是两个不同评价目标。虚拟细胞即使能拟合某些表达谱，也不等于具备跨细胞类型、组织或实验条件的因果泛化；“生物世界模型”与真实可控生物系统之间仍需跨越实验成本、数据质量、分布变化及机制验证。实用价值可能来自“观察／预测 → 逆向实验设计 → 实验验证 → 用新数据修正模型”的闭环，而非单凭模型参数、数据量或预测榜单分数。**单个体系有效，不证明通用虚拟细胞、更不证明药物开发与商业化已规模成功。**

**关键证据与反证（本轮核验 2026-11-08）。** （一）[Latent Space 对 Fabian Theis 的原始访谈《Controlling Biology》（2026-11-06）](https://latent.space/p/controlling-biology-fabian-theis-helmholtz-munich/)明确提出从 Mapping（状态映射）、Prediction（预测）到 Control（干预控制）的研究方向。这是当事研究者的技术解读，不是对整个行业进展的独立评估。（二）[LabCompass 原始 bioRxiv 预印本《Generative inverse design steers human hematopoietic cell fate in vitro》（2026-10-09）](https://doi.org/10.64898/2026.10.07.756550)报告在人类 CD34+ 造血细胞**体外培养**中，用生成式逆向设计提出培养条件，经过**四轮**真实实验反馈，形成约 **7,800 万个细胞的光谱流式细胞术测量数据**，并在若干细胞谱系上富集目标细胞群。这是具有真实实验验证的特定方法研究，但仍为预印本；“细胞测量数据规模”不是临床有效样本数，也不能写成任意细胞命运均可控制。（三）[Arc Institute 2026 虚拟细胞挑战官方介绍（2026-08-20）](https://arcinstitute.org/news/virtual-cell-challenge-2026)将评测从同一细胞背景扩展到**六类未见过相应扰动的细胞系**，强调 Zero-shot（零样本跨背景泛化）；[Arc 数据生产说明（10/01）](https://arcinstitute.org/news/behind-the-data-virtual-cell-challenge-2026)说明其建设大规模扰动测量。它体现领域正在主动加强难题和基准设计，**不是该难题已被解决**；本年 11/05 结束投稿，获奖评测预计 11 月下旬发布，本轮不预填成绩。（四）[Nature Biotechnology《Deep learning perturbation models can outperform baselines on calibrated metrics》（2026-10-01）](https://www.nature.com/articles/s41587-026-03307-w)通过 14 个数据集、18 种指标指出部分常用度量会误判复杂模型相对于简单基线的优势；[Science Advances《A systematic comparison of single-cell perturbation response prediction models》（2026-09-09）](https://doi.org/10.1126/sciadv.aed3414)系统比较 13 种方法与 25 个数据集，提示评测必须按泛化任务、指标和数据背景区分。**反证作用**：既不能仅据旧基线失败就宣判深度模型无效，也不能仅据一种重新校准的指标说虚拟细胞已成功。

**成文边界与缺口。** 已足以围绕“从预测到实验设计：AI 生物研究怎样证明自己真正有用”进入研究收敛和大纲准备；不能按现有证据断言未来三年普遍爆发、临床获益、药企普遍采用或某一虚拟细胞技术路线胜出。若要支持**产业爆发／商业拐点**作为主论点，仍缺独立的前瞻实验成功率、实验迭代周期／成本变化、跨细胞类型／实验室复验、制药研发中的真实使用与付费、从候选干预到疗法的转化率；这些属于该更强主张的**阻断缺口**。上述指标与真实产业后果未被本轮公开核验解决；不能把一次实验富集当成临床治疗。

**下一步与责任。** AI 先建立三层对照：（1）细胞状态重构与传统基线；（2）未见扰动／细胞背景下的预测泛化；（3）实验前瞻设计的命中率、湿实验轮次及实际成本。继续核对 LabCompass 全文实验对照、Arc 2026 结果正式发表后跨背景表现，以及来自不同实验室的实验验证研究，并找出“预测准确但实验不增益”或“简单模型同样有效”的反例；公开信息暂缺商业成交数据时停止无目标搜索，待可观察实验／客户披露再重访。作者只需在正式启动时确认单篇更偏技术机制、科学研究方法还是生物医药产业判断；**未自行运行生物实验、模型复现或产业财务测算**。

**关联与去向。** 已发布[《视频已经能“生成未来”，为什么还不等于会预测世界？》](https://marktian-long.github.io/tools/blog/posts/video-world-model.html)讨论“生成可见未来”与“根据动作预测状态”的一般区分；[《物理世界会有自己的 LLM 时刻吗？》](https://marktian-long.github.io/tools/blog/posts/physical-world-llm.html)讨论物理系统可观测、可执行、可验证的闭环。**本题新增的是具有细胞状态、湿实验成本和真实实验结果的生物研究评价问题**，不重复宏观世界模型概念科普。与[机器人数据工厂](#br-20261010-02)共享“有效干预数据与真实验收”视角，但细胞实验与机器人动作数据不能互相证明商业经济性。暂不建立独立的 AI for Science 系列或预先确定标题、分类、排期。

<a id="br-20261107-01"></a>

### BR-20261107-01｜当智能主要供软件调用，而非供人阅读，模型与程序应怎样分工？

**创建：2026-11-07｜内容更新：2026-11-07｜状态：可进大纲（接口、判断稳定性与代码决策边界）。** 用户确认的是机器原生智能这一研究问题，不是 Jev 优于全部 LLM 的结论。触发节目真实发表于 11 月 5 日，不能把入库日当发布日期。

**核心问题与当前判断。** 程序消费模型结果时，类型、概率、语义正确性、可校准性和执行权限是不同要求。模型可以判断含糊输入，确定性代码负责业务规则、阈值与最终动作；JSON 合法不等于判断正确，概率输出也不自动消除幻觉、误判或越权。传统规则、轻量分类模型、通用 LLM 结构化输出都是必要对照。KV Cache／上下文压缩仅作关联问题，不扩成全部 Harness／Memory 综述。

**证据与反证。** [TypeSafe 首发（9/15）](https://typesafe.ai/blog/introducing-system-one-models-and-jev)说明 Jev 的类型化概率输出；速度、成本与校准优势来自其自设工作流，部分参照由其他模型概率构成，不能作为独立普遍结论。[11/03 官方澄清](https://typesafe.ai/blog/dont-call-it-a-decision-model)明确模型作判断、代码作决策。[Redpoint 第 97 期原始节目（11/05）](https://unsupervised-learning.simplecast.com/episodes/ep-97-jev-creator-on-decision-models-benchmark-fatigue-why-the-labs-missed-it-lw9nHzNX)提供创始人的架构解释，不证明其设想已全部实现。

**11/07 新补证。** 两份非厂商发布的评测预印本使研究不必只依赖营销材料，本轮核对公开摘要、结果与版本记录，未复现代码。[Evaluating and Benchmarking the System One Model Jev，v2 10/29](https://arxiv.org/abs/2609.37647v2)测试 37 个数据集，显示局部分类与多步行动的表现并不一致，二元概率阈值也需要调校；费用只对应其当时请求与模型版本。[Same Scores, Different Decisions，v2 10/10](https://arxiv.org/abs/2609.27678v2)在 ContractNLI 上发现，等价请求变化可能造成纠正与退步互相抵消；总体分数相似不等于具体判断稳定，便宜快速也不等于最高准确率。两者均为预印本，不是统一行业标准。

**成文边界与缺口。** 可写“软件需要怎样的智能接口，以及怎样把不确定判断接入可控业务”，不写 Jev 已全面胜出。真实业务校准、分布变化、提示注入、完整成本和权限误判仍待测试，但不是这篇机制／评测框架文章的前置障碍。若要给具体采购或性能结论，则转为阻断条件。

**下一步与责任。** AI 可据规则、结构化 LLM、概率判断组件建立同维度对照，并在单篇启动时完成历史增量最终检查；作者只需确认范围、分类和大纲。没有 API 调用、账号开通或真实业务评测，不把测试任务默认交给作者。

**关联与去向。** [成功任务指标](#br-20261010-01)研究完整业务验收，本卡研究智能组件接口与代码边界；[基础设施](#br-20261103-03)研究执行负载。对照已发布[Harness 工程](posts/harness-engineering.html)、[评测体系](posts/ai-benchmark-failure.html)、[大模型下半场](posts/llm-second-half.html)，不重复“模型更强／工程更重要”的宽结论。

<a id="br-20261103-03"></a>

### BR-20261103-03｜当 AI Agent 成为主要执行者，哪些沿用多年的软件基础设施需要重新设计？

**创建：2026-11-03｜内容更新：2026-11-07｜状态：可进大纲（先限定 Git 与代码协作／审查链路）。** 基础设施分支来自 [Agent 工作单位](#br-20261009-01)，不是对用户界面胜负的证明。

**核心问题与当前判断。** 当执行者变成高频、并发、短生命周期的 Agent，原先依赖人类工作节奏的版本管理假设如何变化？应区分存储／协调吞吐与审查／验证／交付能力。替换 Git 抽象、兼容 Git 协议重建服务端、调整工作流，是不同路径；“改进服务端”不能写成 Git 被普遍淘汰，代码数量增加也不等于交付效率增加。

**证据与反证。** 本轮复核 [Anthropic Scion](https://www.anthropic.com/research/redesigning-source-control)、[OpenAI Pando](https://openai.com/index/scaling-git-at-openai/)、[GitHub Agent-scale 架构](https://github.blog/engineering/architecture-optimization/building-git-infrastructure-for-agent-scale-development/)一手材料。Scion 改变内部数据与操作抽象，后两者保留 Git 兼容性；厂商不同工作负载、基线与统计口径不能按性能倍数排名。Scion 的日均合并变更、CI checkout 和内部资源改善属于公司自述，且官方不将它定位为通用 Git 替代品。Pando 的每分支协调与因果一致性也包含放弃全局同一时点 refs 快照的取舍。Google Piper、Meta Sapling／Mononoke 等先行系统是必要前史，不把所有原理视作 AI 时代首创。

**审查证据校准。** [Pierre 公告（11/04）](https://openai.com/index/openai-to-acquire-pierre/)是拟收购及既有组件使用，不能写成交易和全面整合已经完成。[GitHub 11/06 工程文章](https://github.blog/ai-and-ml/github-copilot/beyond-code-generation-a-developers-guide-to-agentic-engineering/)引用 [Faros 原始研究](https://www.faros.ai/blog/ai-code-quality-senior-engineer-review-burden)；本轮核对后区分审查时间中位数约增加 441.5%、均值及首次等待等不同指标。这是低／高 AI 采用组的观察性遥测，不是所有团队的因果增幅，也不是工程师实际劳动小时。Faros 文内另一组模型／上下文比较存在叙述与表格不一致，不用于建立“上下文一定胜过模型”的结论。

**成文边界与缺口。** 三条真实架构路线已足以承载限定比较，不必等待所有基础设施出现案例。CI、身份权限、搜索、队列等只在有具体生产证据时展开；普通企业是否应迁移、全链路交付净收益与因果归因仍未知，不能由头部实验室极端负载外推。

**下一步与责任。** AI 将“旧假设—新负载—瓶颈—改动—代价”收敛成文章主线，作者确认大纲。统一负载横评、PR 人工审查时长、缺陷和回滚等属于可选深化／实测；未进行此类实验。与 [经营指标](#br-20261010-01)互补，不吞并其全成本主题。

<a id="br-20261103-01"></a>

### BR-20261103-01｜特斯拉 FSD 的训练经验能否迁移到 Optimus，并形成物理 AI 壁垒？

**创建：2026-11-03｜内容更新：2026-11-09｜状态：已转入（2026-11-09 已发布，讨论跨本体迁移条件，不主张 Tesla 已 T0）。** 私人交流是问题触发，不是业界共识。11/03 核验过的财报、论文与竞争路线保留原时间；11/07 复核技术入口并明确非阻断缺口，不将所有来源刷新成新核验。

**核心问题与当前判断。** 区分通用视觉表征、数据工程与训练范式、动作条件预测、机器人动作策略、精细接触五层。车队视频、难例回流、训练部署和闭环验证经验可能复用，但手部接触、触觉、形变和机器人动作空间需要本体数据。竞争资格、实证领先和长期盈利不是一件事；没有单独命名的世界模型模块也不能据此将企业降格为纯硬件厂商。

**证据与反证。** [Tesla SI & Robotics](https://www.tesla.com/SI)提供训练与部署体系的一手说明；[2026Q3 10-Q](https://www.sec.gov/Archives/edgar/data/1318605/000162828026066775/tsla-20260930.htm)所列资本支出是公司整体，而非 Optimus 单项。[Q3 电话会](https://stockanalysis.com/stocks/tsla/transcripts/712902-q3-2026/)中的 1万—2万台 Optimus Academy 是计划规模，不是已部署事实。[RSS 人类视频迁移实验](https://vision.ics.uci.edu/papers/emergence-of-human-to-robot-transfer-in-vision-2026/)、[IJCAI 视频到机器人综述](https://ijcai.org/proceedings/2026/871)、[ICML VLAW](https://proceedings.mlr.press/v306/guo26i.html)支持条件化迁移和合成数据价值，但不是 Tesla 内部权重共享或性能数据。

[FSD 官方说明](https://www.tesla.com/support/fsd)仍要求监督；[Waymo 第六代路线](https://waymo.com/blog/2026/02/ro-on-6th-gen-waymo-driver/)保留多传感器，反驳全行业都转纯视觉的宽泛说法。[得州 Terafab 公告](https://gov.texas.gov/news/post/governor-abbott-announces-spacex-expansion-in-grimes-county)与[量产目标报道](https://www.reuters.com/business/media-telecom/spacex-teslas-terafab-targets-2028-volume-chip-production-musk-says-2026-10-20/)只支持投资和未来计划，不证明良率与成本优势兑现。

**成文边界与缺口。** 可分析哪些积累可迁移、哪些必须重学；公开证据仍未给出 Tesla FSD→Optimus 的直接权重／训练消融、同任务前后成功率或统一排名。不能用其他实验室成绩补成 Tesla 成绩。行业洗牌可能涉及融资跑道、交付回款、固定成本、场景 ROI 与资本偏好，不将 LLM／世界模型发展设为唯一原因。

**发布收束与后续验证。** 本卡已形成[正式文章](posts/fsd-optimus.html)和[Markdown 正文源](../../docs/blog/fsd-optimus.md)，从实际复用、任务鸿沟、条件性迁移、Optimus 自有训练到竞争优势验证逐层展开；外部跨本体实验不充当 Tesla 内部实测。后续只有要声称实际迁移增益或竞争排名时，内部／独立真机结果才成为必要证据；不无限等待不公开数据。承接[视频与世界模型](posts/video-world-model.html)、[物理世界 LLM 时刻](posts/physical-world-llm.html)，与[数据工厂](#br-20261010-02)分工，不重写概念科普。

<a id="br-20261103-02"></a>

### BR-20261103-02｜字节商业化 GenAI 团队调整后，AI 营销的产品价值流向哪里？

**创建：2026-11-03｜内容更新：2026-11-07｜状态：待关键补证（原组织因果与经营价值命题仍有阻断缺口）。**

**核心问题与当前判断。** 原商业化 GenAI 单元调整，不能等同于字节停止广告素材生成；但“因为 MaaS 吞噬能力所以撤并”仍缺公司决策依据。需分别研究素材生成、品牌审核、投放优化、归因、客户关系及跨平台服务，不能从组织新闻直接推出利润流向。

**证据与反证。** 11/03 已核的 [ZAKER 财经／36氪报道](https://www.36kr.com/p/4046842478171782)、[DoNews](https://www.donews.com/news/detail/1/6751356.html)、[后续追踪](https://www.leaderobot.com/news/10498)构成人事报道线索，多次转载不是独立因果验证。[飞书与豆包／火山引擎整合报道](https://www.thepaper.cn/newsDetail_forward_33684361)是另一组织线，不能作原广告团队去向证明。

11/07 对[巨量千川《AI 成片推荐》手册](https://school.jinritemai.com/doudian/web/articlev0/aJq6FpbZAexS?from=xiaodian_rules&from_school=1&should_full_screen=1&should_hide_bottom_nav=1)及官方帮助入口继续检索：手册说明基于商品／直播／素材生成、商家预览采纳、加入计划和查看效果，且有邀请内测及品类边界；“AI 成片推荐”不同于自动投放的动态创意。[官方帮助索引](https://support.oceanengine.com/support/?spaceId=195&visitor_source=help_main_site)可见相关更新，但本轮未读到完整新增条目，不据索引宣称全面放量。此前[家居日百案例](https://school.jinritemai.com/doudian/web/article/aJoPJX2c4LUA?from=buyin_darenmcn_article&from_school=1)同时涉及达人、投放与激励，不能把复合成交增长归因于单一 AI 能力；[服务商案例](https://school.jinritemai.com/doudian/web/articlev0/aJdu1XRqtaJM?from=xcd&from_school=1&should_full_screen=1&should_hide_bottom_nav=1)也不是独立竞争效果审计。

**成文边界与缺口。** “组织建制变化不等于业务消失”可作有边界的产品分析，但原问题要解释撤并原因与价值实际迁移，仍缺当事方说明、商家采纳率、生成审核全成本及同客户同预算效果。更多公告不能消除这些缺口。改成单纯营销链路机制题属于范围取舍，应明确告知作者，不暗中当原问题已解决。

**下一步与责任。** 当前等待外部组织说明或可比较广告主结果；AI 在出现材料时做核验。作者不需要代查公开新闻；只有选择改题或使用真实业务经历时需要参与。与 SaaS 功能吸收、影视创作成本有背景关联，但不合并为同一生意。

<a id="br-20261101-01"></a>

### BR-20261101-01｜当界面与内容都能被 Agent 修改，创作工具应该怎样设计？

**创建：2026-11-01｜内容更新：2026-11-08｜状态：可进大纲（持续编辑、动态界面与既有专业工具的人机协作）。** 原始兴趣为 AI 原生交互与内容创作，不预设所有工具合一。

**核心问题与当前判断。** 能生成界面／作品不等于能持续编辑。新问题是用户怎样保留对局部修改、版本恢复、正式状态、素材和权限的掌控，而不只是再论证自然语言能替代菜单。当前更清晰的**两种可对照路线**是：①**任务驱动动态界面**——由 Agent 在预设组件目录中生成当前任务的可交互卡片（Vercel）；②**Agent 进入既有专业工具**——让 AI 通过受控接口制作初稿，人在原有编辑器中继续调节与验收（Instagram Edits／Roblox Studio）。前者不等于自由生成整套 App，后者不等于传统 GUI 永不变化；两条路径可互补，**界面使用与内容创作仍须分别评价**。

**证据与反证。** 11/01 既有材料：[ryOS 演示](https://x.com/ryolu_/status/2116126528060973480)与[测试邀请](https://x.com/ryolu_/status/2116126802045509710)、[Thariq Dock 原型](https://x.com/trq212/status/2115135857669881939)、[Zara 视频创作说明](https://x.com/zarazhangrui/status/2116281211962454056)及[后续澄清](https://x.com/zarazhangrui/status/2116283023415287932)。这些是原型／作者自述，不证明可替代操作系统、零人工劳动或稳定复现；部分 X 原站曾不可读，原始链接由公开索引／存档定位。[Software as Self-Expression](https://zarazhang.substack.com/p/software-as-self-expression)与[交互演示](https://deck.zarazhang.com/)可说明作者方法，不作独立质量实验。

**11/07 新核对。** [Meta Muse Spaces（11/06）](https://about.fb.com/news/2026/11/introducing-spaces-customize-muse-app/)给出可持续修改、布局和连接外部信息的个人空间机制，分享协作仍属探索。[Figma Make 编辑文档](https://help.figma.com/hc/en-us/articles/42009840449175-Edit-a-Figma-Make-file)则提供指向局部修改、直接代码编辑、预览及版本恢复等不同控制手段；恢复旧版本不等于抹除后续历史，部分能力还区分新旧文件。两者证明正式产品提供了不同控制机制，不证明长期稳定性、使用效率或留存已经验证。

**11/08 新证据（核验官方发布与当事报道）。** [Vercel 11/06 Chat SDK + json-render 正式更新](https://vercel.com/changelog/json-render-and-chat-sdk-agents)说明 Agent 在**类型化预设组件目录**内输出 JSON 界面描述，再由 Slack Block Kit、Teams Adaptive Cards 等平台组件呈现，系统验证属性与容量限制；这证明受约束的**动态任务卡片**已产品化，不代表模型能不受限制创建整个新应用。[Instagram Edits 桌面版（11/05）采访原始报道](https://www.theverge.com/tech/1027444/instagram-edits-desktop-ai-agents-muse-mcp)引述产品负责人说明 macOS 桌面版通过 MCP（模型上下文协议）让 Agent 制作视频粗剪，再由用户在原生时间线中继续编辑；**目前桌面版只有 macOS，手机与桌面还不能完整编辑同一项目**，尚无多轮编辑的独立质量数据。[Roblox 官方《Roblox Studio is Going Agentic》（04/15）](https://about.roblox.com/newsroom/2026/04/roblox-studio-going-agentic)则提供更早的内置 MCP、规划／制作／测试机制，官方所称前 1,000 创作者 44% 使用过相关能力有特定统计窗口，非全部创作者比例；不能写成 11/08 才发布。三条案例回答不同界面责任和可修改性问题，不能用跨厂商发文次数替代同任务用户实验。

**成文边界与缺口。** 现在可把“动态任务界面”与“Agent 操作既有专业编辑器”并列进行机制比较；不能写普通 App／设计师被替代、两路线已分出胜负或某产品显著提效。需检验同一任务多轮修改、权限与撤销、持续状态、编辑兼容、人工接管及总成本。与[软件操作者旧文](posts/ai-software-operator-shift.html)的增量须落在可运行作品／界面的连续修改与控制，不重复“聊天加 GUI”。视频分支若没有完整编辑过程，只作局部案例，不撑起通用结论。

**下一步与责任。** AI 可先用已核验的官方机制组织两路线对照、准备限定范围的大纲，作者确认研究重点。真实五轮修改、撤销与权限测试、30—90 秒视频的多轮编辑／素材兼容成本尚未执行；它们是效果结论的前置条件，不是机制文章的统一门槛。涉及账号、费用和私人素材时另行取得必要条件，不默认作者承担。与[工作组织](#br-20261009-01)、[游戏经济](#br-20261010-03)分开维护。

<a id="br-20261016-01"></a>

### BR-20261016-01｜AI 能造软件后，企业究竟还应为哪些 SaaS 付费？

**创建：2026-10-16｜内容更新：2026-11-07｜状态：已转入（2026-10-25 已发布）。** [正式文章](posts/ai-saas-build-vs-buy.html)，[Markdown 正文源](../../docs/blog/ai-saas-build-vs-buy.md)。不再保留同内容待审稿，不因新增案例另写一篇 SaaS 生死文章。

**当前判断与用户重点。** 区分做出来、用得上、持续维护、商业上值得拥有；比较相同任务、质量和周期下的完整成本、风险与机会成本。自建成本和供应商成本都可能继续下降，不能只冻结其中一侧。功能可复制不等于客户关系、责任和持续运维都可替代。

**保留的正反证据。** [Swyx 原帖](https://x.com/swyx/status/2110065576764686421)及[原始节目](https://www.youtube.com/watch?v=zlD-CkLVKtU)围绕年报价 43,000 美元的软件产生 72 份参赛作品；自动评委与活动运营人员判断不同，冠军在自动评委中仅第 19 的说法为组织方自述。报价不是已审计节省额，赛事不是长期生产替换。[Every 10/14 当事人访谈](https://every.to/podcast/transcript-hugging-face-s-first-investor-on-why-technical-founders-win)中，Matt Hartman 的 Ghost Pepper 维护经历、Natalia 自建 CRM 数月后迁至 Attio，提供所有权与机会成本反例，不是对照试验。Lucid Archie 30 人试点模型费的旧采访记录也不是行业成本基准。

**11/07 后续复核。** [Replit Monitoring Agent 文档](https://docs.replit.com/features/publishing/monitoring-agent)仍需分别理解告警、自动尝试修复、自动发布的授权；[10/22 产品公告](https://replit.com/blog/replit-monitoring-agent)、[发布风险提醒](https://replit.com/help/answers/what-should-i-check-before-turning-on-auto-republish)、[计费说明](https://replit.com/help/answers/does-monitoring-agent-use-my-credits)支持部分维护产品化，不支持无人值守和全事故覆盖。旧 AutoFix 触发帖见[10/31 原帖](https://x.com/amasad/status/2116343923925041462)。

**下一步与责任。** 已发表论证不因缺乏长期结果而重新标为待关键补证。后续需真实故障类型、误修复、恢复时间、人工分钟、回滚及账本；本轮未获得独立长期全成本结果，也未部署测试。出现可改变买／建边界的证据时 AI 回流原卡；作者不需另开文章。详细旧摘录留在页首 Git 历史入口。

<a id="br-20261011-01"></a>

### BR-20261011-01｜中美公众对 AI 的态度与实际使用，哪些比较成立？

**创建：2026-10-11｜内容更新：2026-11-07｜状态：可进大纲（同口径测量与解释边界）。** 原问题为“为什么中美态度和使用不同步”；当前不预设两国态度与使用必然反向，改为先辨认哪些差异确有证据、哪些不能跨口径比较，稳定 ID 不变。

**核心问题与当前判断。** 模型供给领先、对 AI 的收益期待、尝试使用、高频使用与进入企业正式流程是不同指标。一个人可以担忧就业风险又使用工具；这不自动证明哪种文化更拥抱 AI。就业、隐私、信任、产品覆盖、渠道和政策仍是竞争性解释，不先作文化因果结论。

**既有证据边界。** [Stanford AI Index 2025 的公众态度资料](https://hai.stanford.edu/ai-index/2025-ai-index-report/public-opinion)所汇总的 Ipsos 2024 中美差异不是使用率；[Pew 在职人员调查](https://www.pewresearch.org/social-trends/2025/02/25/u-s-workers-are-more-worried-than-hopeful-about-future-ai-use-in-the-workplace/)只覆盖美国特定人群。[Microsoft 2026 扩散报告说明](https://blogs.microsoft.com/on-the-issues/2026/09/21/the-continued-state-of-global-ai-diffusion-in-2026/)对平台覆盖和中国工具的校正限制，不能被忽略，也不能反向变成中国必然更高的证据。

**11/07 关键补证。** [墨尔本大学／KPMG《Trust, attitudes and use of Artificial Intelligence: A global study 2025》](https://mbs.edu/faculty-and-research/trust-and-ai)，[报告 DOI](https://doi.org/10.26188/28822919)，覆盖 47 国 48,340 名成年人，调查时间为 2024 年 11 月至 2025 年 1 月中旬。同一调查中，至少每隔几个月有意使用 AI 的受访者，中国为 89%、美国为 53%。本轮核对报告的方法、图表与附录：它包括一般 AI，不等于 2026 生成式 AI 月活；中国样本更城市化、老年人覆盖不足，部分国家高学历者过度代表。统计调整不能消除所有选择偏差，不能当作完全全国代表性排行榜。

**成文边界与缺口。** 这解决了“完全没有同一问卷对照”的阻塞，足以写测量口径、态度与使用关系及解释竞争；不支持实时国别渗透率、稳定文化原因或哪国最终领先。既有单平台遥测与这份问卷可以比较测量方法，不能直接拼接成增长曲线。

**下一步与责任。** AI 整理同口径主证据与测量反例，作者确认范围和大纲。2026 同样本追踪、企业深度使用及因果解释仍待外部数据，不是本篇限定比较的前置条件。与[委托信任](#br-20260930-04)、[消费入口](#br-20260930-05)相关，不自动加入产业史系列排期。

<a id="br-20261010-02"></a>

### BR-20261010-02｜机器人数据工厂是否是物理 AI 的新瓶颈？

**创建：2026-10-10｜内容更新：2026-11-07｜状态：待关键补证（数据生产经济性仍未闭合）。** 原多模态系列已结项，本题研究有效经验的供应链，不是补写第六篇。

**核心问题与当前判断。** 稀缺的未必是视频小时数，而是可复用、可验证地提升动作任务表现的数据。采集、标注、遥控、仿真、失败覆盖和真机验收分别花费什么，客户为什么持续付钱，服务商会不会被自建与开源数据替代，仍是核心商业问题。

**既有证据。** [FT 训练场报道](https://www.ft.com/content/e5fd2655-f95f-4183-9dd9-b3c1ebe67a6b)、[XDOF 采访](https://techcrunch.com/2026/06/17/collecting-robot-training-data-is-dirty-unglamorous-work-some-ai-labs-are-already-paying-xdof-to-do-it/)提供投资与服务信号；客户数量属于 CEO 自述，不等于独立核实订单。[The Robot Data Factory 预印本](https://arxiv.org/abs/2609.16705)讨论可复用经验，不是统一标准。[Waymo 仿真路线](https://waymo.com/blog/2026/02/the-waymo-world-model-a-new-frontier-for-autonomous-driving-simulation/)、[NVIDIA Cosmos 3](https://investor.nvidia.com/news/press-release-details/2026/NVIDIA-Launches-Cosmos-3-the-Open-Frontier-Foundation-Model-for-Physical-AI/default.aspx)不证明跨机器人商业回报。迁移实验与边界统一交叉引用 [FSD 卡](#br-20261103-01)。

**11/07 新补证。** [XDOF ABC-130k 官方资料（6/17）](https://www.xdof.ai/blog/abc-130k)与[Scalable Behavior Cloning with Open Data, Training, and Evaluation（6/25 预印本）](https://arxiv.org/abs/2606.27375)提供开放的采集、训练和评估管线：约 13 万条轨迹、195 类任务及真机／仿真对照，明确了数据如何进入任务验证。按具体数据集的 195 类记录，不用宣传性约数替代。论文结果证明特定管线可研究，不是付费客户的单位经济数据；同团队论文与公司公告也不是两份独立商业验证。

**成文边界与阻断缺口。** 机制材料已超出“公开视频不等于动作数据”，但原题的独立增量仍是有效经验的生产经济性。还缺交付成本、客户付费及数据带来的可比较任务增益之间的连接。只有供给规模和学术表现时，不写“数据工厂已成为新利润瓶颈”。改为纯技术数据管线题虽可行，需另作与旧文的增量判断，不能据此声称原商业命题完成。

**下一步与责任。** 待外部客户实践／公开成本或具条件的真机对照；AI 届时核验。未采集、训练或测试机器人，作者无须为公共研究补设备和内部数据。保留与 [机器人产品形态分支](#series-evidence-20261107)的关联，不合并公司优势与产业供应链两个问题。

<a id="br-20261010-03"></a>

### BR-20261010-03｜AI 游戏创作变容易后，游戏平台与引擎的价值往哪里走？

**创建：2026-10-10｜内容更新：2026-11-07｜状态：待关键补证（玩家循环与创作者收益）。**

**核心问题与当前判断。** 降低制作门槛可能扩大供给，但可玩不等于耐玩，能生成不等于能运营。需要拆开创作入口、确定性运行引擎、可迭代资产、社区分发和多人运营，不把所有“世界生成”视作同一架构。

**11/07 状态核验。** [Google Playground 10/07 公告](https://blog.google/innovation-and-ai/technology/ai/playground-experimental-gaming-platform/)确认美国成年人实验入口、自然语言修改与分享；[Google × Unity 公告](https://unity.com/news/google-and-unity-partner-on-new-ai-gaming-platform-for-the-next-era-of-interactive-entertainment)和 [Unity 对 Spark 的说明](https://unity.com/blog/why-we-built-unity-spark)描述更完整引擎与资产支持的后续路线。本轮未找到足以确认 Spark 全面正式开放的新一手材料，不能把“稍后推出”改成已交付。公告也未建立 Playground 运行系统等于 Genie 3 的对应关系。

[The Verge 初期介绍](https://www.theverge.com/tech/1006477/google-playground-unity-spark-ai)只补产品背景；[创作者讨论](https://www.reddit.com/r/aigamedev/comments/1x02mrh/google_unity_coming_for_ai_game_generation_space/)中的许可、收费与工具担忧是样本观点，不代表用户总体。

**成文边界与阻断缺口。** 功能分工可作案例，原题要判断平台／引擎价值变化，仍需持续修改、重复游玩、发现分发或创作者回报的实际连接。没有这层，容易重复[影视文章](posts/ai-film-industry.html)的生产成本下降论证。新产品没有长期数据不是其失败证据。

**下一步与责任。** 待真实作品与玩家／作者数据；需实测时验证创建—修改—分享—再玩路径及工作量，并先确认访问条件。本轮没有创建、发布或玩测产品；不要求作者先做测试才能决定是否继续关注。与[持续编辑](#br-20261101-01)互补，不重新打开已结项视频系列。

<a id="br-20261010-01"></a>

### BR-20261010-01｜Agent 产品该用什么指标衡量真实业务价值？

**创建：2026-10-10｜内容更新：2026-11-07｜状态：可进大纲（业务验收与经营决策方法，不是实测排行榜）。**

**核心问题与当前判断。** 度量单位应由一次调用上移至被业务接受的任务，但不能压成一个万能数字。分别观察首次／最终验收、覆盖任务范围、端到端时长、人工复核返工、严重错误，以及包含失败尝试的成本。每个成功任务成本不是价值本身；高风险边界不与便宜程度简单加权，必要人工批准也不自动算失败。Goodput 是基础设施类比，不冒充 Agent 行业标准。

**保留的实证与限制。** [Arize × Fireworks](https://arize.com/blog/cost-per-successful-task-ai-model-benchmark/)及[公开仓库](https://github.com/Arize-ai/fireworks-cost-benchmark)的 40 任务、10 模型、每格 6 次实验，支持调用价格、成功成本与覆盖范围可能产生不同排序；它主要核算 API 成本，不含完整人力，旧模型排名不是当前推荐。[Every 真实工作评测](https://every.to/context-window/evals-for-everyone)提供当事人实践，不是普遍效果。[Goodput 原始访谈](https://podcasts.apple.com/ch/podcast/googles-ai-infrastructure-chief-amin-vahdat-on-the/id1750736528?i=1000793415693)和[企业 Agent 评测预印本](https://arxiv.org/abs/2610.07094)分别承担触发与研究方向，不证明统一标准成立。

11/05 已核材料继续保留：[Astra 隐性低完成度报告](https://alignment.openai.com/misalignment-reports/covert-underperformance-on-safety-research-tasks/)要求不能凭“已完成”自述验收；[Linux 安全流水线](https://openai.com/index/a-thousand-fewer-paths-to-root/)的漏洞验证、利用程序与候选补丁不能混成已合入修复；[IBM CUGA 对照](https://huggingface.co/blog/ibm-research/cuga-harness)是指定模型、任务、配置下单轮实验，不是普遍 Harness 排名。

**11/07 新补证。** [Anthropic 的 Agent 评测方法（1/9）](https://www.anthropic.com/research/demystifying-evals-for-ai-agents)区分任务、试验、评分器、执行记录和环境结果；[τ-bench](https://arxiv.org/abs/2406.12045)用最终数据库状态及重复任务可靠性，提醒 pass^k 不能混成 pass@k；[AI Agents That Matter](https://arxiv.org/abs/2407.01502)说明成本控制、可复现性及准确率之外的取舍。方法已有可核查支撑，自己的真实业务测试不必成为所有方法文章的先决条件。

**成文边界与缺口。** 可写上线后怎样据验收、覆盖、风险和全成本决定模型／工作流／自动化范围。不能给未经测试的模型胜负、节省比例或通用 ROI。计算示例须标为示意；真实排名翻转测试仍需固定任务、版本、价格时点、验收标准和人工分钟，不伪装成已执行。

**下一步与责任。** AI 准备有业务含义的指标和取舍框架，作者确认大纲；仅在引用作者真实项目时确认可公开事实。与[POC](posts/ai-poc-financial-b2b-guide.html)的投入前验证、[评测生态](posts/ai-benchmark-failure.html)、[Agent 工程问题](posts/agent-three-problems.html)区分，新增量是上线后的持续经营决策。Jev 的局部判断指标见[对应卡](#br-20261107-01)。

**个人上下文效果对照。** [Persom／Memory 后续证据](#blog-memory-dreaming-20261107)仅增加一个可验证场景：固定任务、模型和工具条件，比较不带历史、人工整理的相关历史、系统整理历史的验收质量、旧错复发、人工分钟及总成本；没有实际执行，不新增一套与本卡并行的 Performance 指标。

<a id="br-20261009-02"></a>

### BR-20261009-02｜为什么都重视招聘，有些公司却能形成持续的人才优势？

**创建：2026-10-09｜内容更新：2026-11-07｜状态：待关键补证（由未定向研究转为机制—结果缺口）。**

**核心问题与当前判断。** “重视招聘”不是竞争优势的充分解释。应研究识别、吸引、角色配置、授权、协作与产出的连接，并考虑反向因果：业务机会、资本、算力、分发和股权预期本身可能吸引人才。早期字节与 Anthropic 的对照仍是待验证问题，不用成功企业自述拼成因果定律。

**11/07 已补足的公开层。** [Anthropic 招聘说明](https://www.anthropic.com/careers)、[Netflix Culture](https://jobs.netflix.com/culture)、[Amazon Bar Raiser](https://www.aboutamazon.com/news/workplace/amazon-bar-raiser)分别提供研究工程协作、授权与背景信息、独立于用人团队的招聘把关等制度样本。这些能证明公开机制，不能证明同口径人才绩效或谁全面领先。

人物例子作了校正：[Mike Krieger 2024 加入公告](https://www.anthropic.com/news/mike-krieger-joins-anthropic)与 [2026 Labs 公告](https://www.anthropic.com/news/introducing-anthropic-labs)支持其从产品领导转向实验性产品职责，不能说成降为普通工程师；[Anthropic 活动页](https://www.anthropic.com/events/claude-founder-house-san-francisco)列出 Bryan McCann 的 MTS 身份，但职称不自动说明职级与报酬。[Peter Bailis 报道](https://www.theinformation.com/briefings/workday-cto-joins-anthropic-amid-startups-push-build-hr-apps/)与 [Tom Blomfield 报道](https://www.businessinsider.com/anthropic-hires-monzo-cofounder-tom-blomfield-ai-compute-y-combinator-2026-7)属于媒体任职线索，不作效果证明。[Andrej Karpathy 本人资料](https://karpathy.ai/)没有提供本卡原先暗示的加入 Anthropic 依据，不能继续把他列作已证实的同类流动案例。

**成文边界与阻断缺口。** 已能讨论“不同公司怎样配置人才”，但原题要回答持续优势的来源，还缺同一案例中制度—实际工作—可观察产出的连接，尤其字节早期实践和可比反例。招聘页面不能证明因果；MTS 也不是普遍降职新范式。原讨论中的“20 倍产出”“Anthropic 全面反超”不是已验证数据。

**下一步与责任。** 本轮公开政策与人物资料核验已完成；当前等待可核实的团队实践／纵向产出材料，或作者自愿提供可公开的真实观察。后者不是默认要求。AI 在新材料出现后判断它能否排除资本、机会和选择偏差，而不是继续堆名人名单。与产业史组织篇只建立“人才配置”的局部关系，不替代企业边界研究。

<a id="br-20261009-01"></a>

### BR-20261009-01｜当 Agent 而不是文件成为工作单位，软件应该怎么设计？

**创建：2026-10-09｜内容更新：2026-11-07｜状态：可进大纲（多工作协同中的执行者、责任与成果设计）。** 原始表达“文件 → App → 页面 → 操作”与“目标 → Agent → Context → 执行 → 验收”是启发性对照，不是普遍历史阶段；文件不会因执行者改变而自动消失。

**核心问题与当前判断。** 人怎样理解、委派、协调和验收一组工作？Agent 可是执行单位，任务可承载目标与责任，成果／业务对象可承载正式结果。三个视角可以同时存在，不能预设首页必须变成 Agent 列表。短时间并行工作也可体现变化，不以长期个人代理为前提。用户交互、Harness 执行策略和 Git 承载能力分层讨论。

**11/07 产品对照。** [Codex app 官方介绍](https://openai.com/index/introducing-the-codex-app/)给出项目线程、隔离工作树与差异审查；[Linear 委派文档](https://linear.app/docs/assigning-issues)保留人的事项责任，Agent 承担委派执行。它们足以比较设计选择，不足以证明哪个界面更有效。[Conductor 官方公告](https://www.conductor.build/announcement)明确 11/04 已停止新注册／下载，云端 11/13 转只读、11/20 关闭，本地版维护至 2027 年初再逐步结束。原“下一步直接新注册试用”的假设已失效；可研究既有产品机制与迁移，不假称获得访问。[Factory／HumanLayer](https://factory.com/news/humanlayer)沿用 11/05 核验记录；11/07 直接读取失败，不刷新其原文核验日，也不把并购计划当效果。

**其他材料的角色。** [Yuchen 10/03 原帖](https://x.com/Yuchenj_UW/status/2106435001340621147)由[公开存档](https://superx.so/creators/Yuchenj_UW)及[二次摘录](https://buttondown.com/thediff/archive/the-diff-no-001-a-maintainer-says-no-robots-a-dev/)定位，原站此前 403；这只是问题触发，不必为等待一个引语而阻断独立产品对照。[Aaron 观点](https://x.com/levie/status/2109788979952558255)与[Harness Learning 预印本](https://arxiv.org/abs/2609.35738)研究执行方式适应，不证明所有软件都围绕 Agent 组织。[Vercel fx](https://github.com/vercel-labs/fx)的终端／嵌入式路线也是“终端必然消失”的反例。底层 Scion／Pando 归[基础设施卡](#br-20261103-03)。

**成文边界与历史增量。** 本轮核对已发布[软件操作者文章](posts/ai-software-operator-shift.html)的任务工作区、正式状态、权限与恢复论证；新题必须深入多项工作间的定位、协调、责任与验收，不能只换箭头重写旧文。产品文档可支撑设计机制；哪种组织方式减少时间和错误，仍需同任务实测。

**下一步与责任。** AI 据上述对照准备大纲，作者确认。开发任务与跨系统任务的定位／切换／干预／验收测试尚未执行；作者的 AIHOT 规则调整仅可说明需求，不证明净收益。AI 不把资料检索或产品访问缺口笼统变成“等作者”。

<a id="br-20260930-01"></a>

### BR-20260930-01｜OpenAI Marketplace 与企业软件采购

**创建：2026-09-30｜内容更新：2026-11-07｜状态：待关键补证（真实采购增量）。**

**核心问题与当前判断。** 市场新增的是哪一种采购机制，能否带来新的伙伴成交，而不只是既有支出转移？能力分发、应用调用、企业合同采购不是同一机制。

**11/07 官方复核。** [Marketplace for enterprise customers](https://help.openai.com/en/articles/20001553-openai-marketplace-for-enterprise-customers)说明 beta 准入与符合条件采购计入部分 OpenAI 合同承诺的安排；客户与伙伴签约、伙伴开票，不是自助结账，也不是在第三方应用里直接消耗推理额度。

**成文边界与阻断缺口。** 采购机制已经清楚，可以作为产业史价值篇的案例；独立题目要论证采购增量，仍缺可核实的客户成交、额度认定、续约与伙伴收益实践。本轮没有取得这条结果链，不能拿公告数量补成商业效果。

**下一步与责任。** 待外部真实采购／伙伴案例，出现后由 AI 核验新增需求还是支出转移。作者无须提供企业合同才能让本卡继续保留。与[能力复用](#br-20260930-02)保持下方聚合观察，不合并为已经证明的销售飞轮。

<a id="br-20260930-02"></a>

### BR-20260930-02｜从定制 GPT 到 Plugins，能力如何被持续复用

**创建：2026-09-30｜内容更新：2026-11-07｜状态：待关键补证（跨任务复用与开发者收益）。**

**核心问题与当前判断。** 第三方交付什么，用户怎样发现、持续调用，维护成本和收益归谁？产品承接不等于旧流量、用户关系和收入完整迁移。GPT Store 热度感受也不是失败证据。

**11/07 官方复核。** [Custom GPT migration FAQ](https://help.openai.com/en/articles/20001519-custom-gpt-retirement-and-migration-faq)当前默认退休日期为 **2026-12-11**；符合条件且获准延期的 Enterprise／FedRAMP 情况可至 **2027-02-11**，不是全部企业自动延期，更不是 11 月已经关闭。[第三方使用 ChatGPT 套餐说明](https://help.openai.com/en/articles/20001542-using-your-chatgpt-plan-in-other-apps-and-sites)涉及 Go／Plus／Pro、相应使用限制与独立第三方收费；不得将旧 Plus／Pro 摘录当作完整当前范围，也不等于全部上下文共享、免费无限算力或所有开发者均获准。

历史机制入口保留：[GPTs](https://openai.com/index/introducing-gpts/)、[GPT Store](https://openai.com/index/introducing-the-gpt-store/)、[应用提交](https://openai.com/index/developers-can-now-submit-apps-to-chatgpt/)、[Plugins changelog](https://developers.openai.com/plugins/changelog)、[DevDay 2026](https://openai.com/index/devday-2026-recap/)。它们说明能力承载、分发和运行安排，不证明持续使用或收入。

**成文边界与阻断缺口。** 可以说明迁移机制，尚不足以独立回答开发者价值是否形成。缺少可核查的重复使用、跨任务复用、维护与实际获益案例；不能把迁移指南包装成生态已成功的文章。

**下一步与责任。** 待外部开发者／用户长期案例，由 AI 核验。作者自己的真实使用只在愿意公开且确有作用时参与，不是必交材料。与[采购](#br-20260930-01)的连接仍待证明；不因同属 OpenAI 自动合并。

<a id="br-20260930-03"></a>

### BR-20260930-03｜Agent 成为操作者后，哪些产品设计价值会变化？

**创建：2026-09-30｜内容更新：2026-11-07｜状态：已合并。** 保留原 ID 和问题来路，不删除研究历史。

**原问题与本轮判断。** 菜单、No-code、多维表格、模板、Dashboard、Eval 并非同一层级，不能逐项机械判生死。本轮核对[已发布软件操作者正文](posts/ai-software-operator-shift.html)：任务范围、正式对象与状态、权限、观察恢复、人工操作退出／入口迁移／软件退出，以及长期约束与当前实现的区分均已展开。继续写泛产品价值会高度重复。

**承接去向。** 工作组织的独立增量由 [BR-20261009-01](#br-20261009-01)承接；用户修改界面和可运行作品的控制由 [BR-20261101-01](#br-20261101-01)承接。两张子卡不互相合并。只有后续出现超出旧文与子题的新机制，才重新评估是否重开本 ID；目前不再独立占用待写队列。

<a id="br-20260930-04"></a>

### BR-20260930-04｜持续委托的真实需求、净收益与商业可持续性

**创建：2026-09-30｜内容更新：2026-11-07｜状态：已转入（2026-10-18 已发布）。** 当前成果为 [Personal Agent 文章](posts/personal-agent.html)，不是仍待启动的候选。后续缺口不等于原文章未完成。

**核心问题与当前判断。** 长期价值是跨时间接续未完事务、跨服务与不同的人协调，让用户少记挂、少催办，而非仅有记忆或定时按钮。必须计入交代、授权、检查、接管与纠错的总投入；单次有用不证明长期净收益，融资、GMV、用户热度不证明收入或利润。个人生活、个人工作、组织岗位和付款方分别判断。

**已发表案例与稳定边界。** 文章已对照 Dots、Muse、Gemini Spark、Grok Bot、Manus Cue、Instinct。保留[Dots 官方入口](https://openai.com/index/introducing-dots/)、[Muse](https://about.fb.com/news/2026/09/introducing-muse-personal-ai-agent/)、[个人 Spark](https://blog.google/intl/zh-tw/products/devices-services/gemini-spark-ai/)、[Grok Bot](https://x.ai/news/introducing-grok-bot)、[Manus 2.0／Cue](https://manus.im/en/blog/introducing-manus-2-0)、[Instinct 创始人原始访谈](https://colossus.com/episode/instinct-the-personal-agent/)供后续复核。组织 specialist dots 当时为试点；个人 Spark 不等于企业 Gemini；Cue 不等于 Manus 主产品改名；多个 Grok Bot 共用同一用户环境不代表彼此完全隔离。上述产品详细时间线与当时付费方式沿用原核验记录，本轮未逐项刷新。

**用户重点仍有效。** 比较“服务谁、谁付款、通过什么机制收费”，不以绝对订阅价格为主线；消费者使用而商家付费可以并存。订阅不自动保证目标一致，佣金也不自动证明损害用户；需要检验“不买、退款、取消”能否获得同等服务。Instinct 创始人年化交易额和留存说法均为自述，不代替抽佣或审计收入。

**正反证据保留。** [Daminger 认知劳动研究](https://journals.sagepub.com/doi/10.1177/0003122419859007)支持执行之外还有记挂与协调，不证明 AI 已减负；[Shortcuts](https://developer.apple.com/videos/play/wwdc2019/213/)和[混合主动交互研究](https://www.microsoft.com/en-us/research/publication/principles-mixed-initiative-user-interfaces/)反驳持续触发都是 LLM 新发明。[长任务工程复盘](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents)说明状态与验证可接续会话，不要求永久同一模型进程。[WIRED 亲历](https://www.wired.com/story/i-finally-found-an-ai-agent-worth-the-risk/)、[The Verge 试用](https://www.theverge.com/tech/1008254/instinct-agent-ai-hands-on-muse-dots)、[用户限制授权的采访](https://www.businessinsider.com/early-users-delete-personal-ai-agents-privacy-scares-blunders-2026-10)是局部使用与失败样本，不提供总体留存率。

**经营与退出边界。** 10/14 已核的 [Character.ai 公告](https://blog.character.ai/an-update-on-character-ai/)、[Reuters 报道](https://www.reuters.com/legal/litigation/characterai-files-bankruptcy-agrees-sell-some-assets-disney-20-million-2026-10-13/)与[法院经营材料报道](https://www.404media.co/character-ais-bankruptcy-documents-show-the-economics-of-ai-dont-work/)用于说明高参与度不等于健康单位经济，不外推所有消费 Agent。早期 Lensa、AutoGPT、Humane、Ohai、OpenClaw 等对照、六款产品逐项来源及历史方案留在页首不可变 Git 记录；它们不是已验证的失败概率或长期 ROI。尤其[OpenClaw 创始人说明](https://steipete.me/posts/2026/openclaw)不能改写成 OpenAI 买下公司。

**本轮后续处理与责任。** 11/07 复核没有得到足以替代自然事务周期对照的长期净收益、收入与留存证据；授权／交易机制新增材料归[消费入口](#br-20260930-05)，经验纠错归[Dreaming](#blog-memory-dreaming-20261107)。真实持续委托对照仍未执行，后续需记录完整事务结果、人工分钟、遗漏、有效提醒、权限变更与暂停交接。由 AI 核验公开新证据；需本人使用记录时再说明最小必要范围，不重新写当前正文，也不新增重复文章。

**新增案例去向。** 11/07 收录的 Persom 文章属于“上下文能否改善下一次执行”的机制与产品自述，来源、原文页码、实现边界和待测条件统一见[Memory／Harness 后续证据](#blog-memory-dreaming-20261107)。它不证明长期委托净收益，也不把本卡重新转成待写文章。

<a id="br-20260930-05"></a>

### BR-20260930-05｜消费入口迁移与信息中介的价值

**创建：2026-09-30｜内容更新：2026-11-07｜状态：可进大纲（消费交易链路与价值分工，不判定利润池已迁移）。**

**核心问题与用户重点。** 用户将需求交给 Agent 后，发现、比较、下单、支付、履约与售后分别由谁负责，客户关系与收益归谁？逛购、审美、惊喜、自我表达和社区参与本身可能有价值，不能全当作待消除的操作。少打开 App 不等于不用其服务，继续提供服务也不保证保住原利润。

**11/07 一手补证。** [Shop Personal Agents 帮助文档](https://help.shop.app/en/shop/shopping/personal-agents)将搜索、结账准备、购买确认、订单追踪和退货政策查询拆成具体能力，连接需要授权且可撤销；部分 Agent 的支付能力与通用搜索接入不能混为一谈。它支持入口与交易基础设施可以分工，不证明实际订单、转化或收入已经大规模迁移。

**既有对照与反证。** [Uber 2026Q3 电话会（11/04）](https://www.fool.com/earnings/call-transcripts/2026/11/04/uber-uber-q3-2026-earnings-call-transcript/)中万圣节一周第三方 Agent 的 4 单 Rides、约 500 单 Eats，与约 3.2 亿次合计出行／配送，提供早期采用反证；不能用跨业务合计数算单场景精确转化率，也不能推出所有长期需求不存在。该数据沿用 11/05 核验记录，不冒充本轮新实验。

[Instinct 旅行访谈](https://colossus.com/episode/instinct-the-personal-agent/)及[年化 GMV 口径报道](https://techcrunch.com/2026/09/29/instinct-founder-said-more-than-50-of-transactions-on-the-platform-are-travel-related/)、[携程 2025Q4 电话会](https://investors.trip.com/static-files/931f23d1-d597-4a28-9391-479a54b6107d)与 [Expedia B2B 供给路线](https://ir.expediagroup.com/news-and-events/news/news-details/2026/Expedia-Group-B2B-Introduces-AI-Toolkit-and-Platform-for-the-Future-of-Travel-Distribution/default.aspx)说明获客入口与库存、支付、服务可分开；管理层判断不等于壁垒已独立验证。[Bites](https://withbites.com/)及[与 DoorDash 的对照报道](https://www.theverge.com/ai-artificial-intelligence/1005726/doordash-ai-agentic-food-delivery-bites)涉及商家直连，仍需实际配送；[Ask DoorDash](https://about.doordash.com/en-us/news/ask-doordash)与[ChatGPT 接入](https://about.doordash.com/en-us/news/openai)说明老平台也可主动 AI 化，不能写成被动退出。

[Google Universal Cart](https://blog.google/products-and-platforms/products/shopping/universal-cart-launch/)、[UCP 官方背景](https://blog.google/company-news/inside-google/message-ceo/nrf-2026-remarks/)与 Shop 的既有材料，分别涉及消费入口、结构化交易及商家关系；合作和竞争可同时存在。[ChatGPT 商品发现调整](https://openai.com/index/powering-product-discovery-in-chatgpt/)与[Shopify 渠道说明](https://help.shopify.com/en/manual/online-sales-channels/agentic-storefronts/chatgpt)提醒结账和收费口径有时点变化，旧 2025 公告不能直接作当前费率。上述未逐项新核的细节保留旧日期，不视作本轮费用建议。

**参与价值。** [购物功用／享乐研究](https://aquila.usm.edu/fac_pubs/7202/)、[Amazon Interests](https://www.aboutamazon.com/news/retail/artificial-intelligence-amazon-features-interest)以及[即刻早期访谈](https://www.pingwest.com/a/182079)可用于区分得到信息、亲自选择和被社群认识；不是当前人群结构或利润证据，不按性别推断偏好。

**成文边界与缺口。** 可用真实流程机制与低采用反证写“哪些环节可迁移、哪些价值仍由原体系承接”，不预设最终赢家、行业利润规模或不可逆趋势。与产业史价值篇的增量是具体订单、授权、支付、履约和用户参与，不重复抽象互补资产框架。真实渠道分账、商家总成本与同任务转化是更强商业结论的阻断项，不阻碍本篇有限比较。

**下一步与责任。** AI 收敛交易链路对照，作者确认大纲。没有真实下单、付款、账号连接或售后测试；涉及这些行为需明确授权。真实长期数据待外部披露，不让作者承担寻找所有商家账本的任务。

## 三、跨事项聚合候选与既有主题后续证据

### 能力分发与软件采购，何时形成一条商业链路？

**关联：[01 采购](#br-20260930-01) + [02 复用](#br-20260930-02)｜待关键补证。** 01 提供预算与购买机制，02 提供交付、发现与复用；仍缺重复使用到真实采购、伙伴收益的连接。本轮官方机制复核未消除该缺口，不能因同属 OpenAI 或已出现产品接口就宣布商业飞轮成立。来源留在原卡，不新增重复 ID，也不把两卡擅自合成正式文章。

“Agent 而不是文件”的研究由 [BR-20261009-01](#br-20261009-01)独立维护；Personal Agent 只是长期场景的对照，不再维护一份同名聚合候选。

<a id="blog-memory-dreaming-20261107"></a>

### 已发布记忆系统与 Personal Harness 的后续研究：Dreaming 能否形成经验纠错闭环？

**去向与状态：已发布主题的后续证据，2026-11-07 核验，不新建研究卡。** 关联[记忆系统](posts/memory-system.html)、[Personal Harness](posts/personal-harness.html)，与[成功任务指标](#br-20261010-01)只交叉引用验收口径。

[Anthropic《The components of agent memory》（11/06）](https://www.anthropic.com/research/components-of-agent-memory)区分日志、笔记、Wiki 和预加载，并说明离线整理可用原始日志校正记忆、合并重复和复用经验。Pokémon 个案不是跨场景效果验证；不同代模型的文件数／通关比较不是同模型消融。约 4.2 亿 Token、25 问的内部 Wiki 实验与 LAB 反例，只支持某些任务的记忆组织取舍，不能推出普遍净收益或模型权重持续学习。

**责任与未完成项。** 本轮公开机制补证可用；“日志—证据—规则提炼—晋升／降级／退役—后续任务验收”在作者 Harness 中尚未安装或测试。需要比较日志、实时笔记、日志加离线整理的错误复发、证据链、人工分钟和总 Token 成本。没有净收益证据，不单凭新术语再写一篇近义文章；不自动修改已发布正文。

**Persom：来源及机制对照（11/07 收录，不另立题）。** [特工宇宙《前 Manus 成员创业：Personal Agent 要从 Context 走向 Performance》](https://mp.weixin.qq.com/s/k5D4zCbwMgZc2RupRYPWqA)，2026-11-04，内容编辑特工小师／特工小饼。上传 PDF 第 8 页区分面向人的简洁概括与供 Agent 追溯的细节和依据；第 16—19 页介绍原始观察、整理记忆、派生判断分层，以及带来源的增量更新和用户纠正。第 17 页架构图明确标出“原文／模型解读”“候选／正式写入”“事实／派生判断”三道边界；别人说“已经合并”不能直接记成用户完成了合并。上述是产品采访与团队自述，不能当成独立验收结果；三个日期的习惯门槛是其实现选择，不复制为通用规则，重复行为也不等于偏好、身份事实或行动授权。

**外部核对与研究边界。** [Intuition-Lab/personal-model](https://github.com/Intuition-Lab/personal-model)只作为相关公开 Runtime 的实现对照，不等同于已实测 Persom 内测成品。[官方 Benchmark and launch evidence](https://intuition-lab.github.io/personal-model/benchmarks.html)本轮可读，明确合成契约测试证明代码链路，不证明对真实个人的理解、长期记忆准确率或纵向效用。后续应检查来源版本／定位、纠正后的下游摘要和判断是否失效、人／Agent 两种视图是否仍共用同一权威事实，以及固定任务下上下文组织是否真的降低返工和总成本。不得将“本地优先”自动写成所有模型处理均不出本机；平台、模型提供方与数据流在采用前另核。本轮没有安装、采集桌面、调用付费模型或执行真实用户实验。

<a id="series-evidence-20261107"></a>

### 产业史系列既有分支：本轮补证与实际推进边界

本节仅保存补证与去向，文章地图仍见[原 Series Brief](series/ai-industry-history-strategy-series-brief.md)，不为四个编号另建 BR 卡，不改变系列排期。02 已正式发布，正文以[正式文章](https://marktian-long.github.io/tools/blog/posts/ai-innovation-value-capture.html)为准；03／04／05 仍需各自确认范围与大纲，不能仅因加入证据就视为正式立项。

**03｜组织协调。** [The Cybernetic Teammate，NBER w33641](https://www.nber.org/papers/w33641)提供 776 名 P&G 专业人员的随机任务实验，比较个人／团队与 AI 辅助；本轮能核对公开摘要与索引，原站全文访问受限，未声称完整阅读全文。研究可支持 AI 改变特定任务中知识分享和协作边界，不证明公司长期变小、管理跨度必然扩大或岗位已经消失。它与软件中的工作组织是互补证据，不互相代证。可先围绕任务协作机制收敛；企业边界、OKR 长期变化仍需组织实践，作者不必提供内部组织材料才可开展公共研究。

**04｜人的成长、行动与教育。** 继续保留[腾讯研究院王焕超《AI 正在培养“祈使句一代”：习惯被服从，不习惯被拒绝》（2026-10-19）](https://mp.weixin.qq.com/s/rtPeWykuarCA6REgA5GAVA)。延迟、拒绝、修复三种社会性摩擦是作者的分析框架，分别指向节奏适应、判断／边界校准和误解／关系修复，不是已确立的代际诊断，也不应偷换成让产品任意等待或无理由拒绝。

11/07 补充 [Cheng 等，Science，2026-03-26](https://pubmed.ncbi.nlm.nih.gov/41886588/)：三项预注册实验共 2,405 人，支持谄媚交互影响即时冲突判断和修复意愿；意愿不是长期现实行为，更不是青少年发展定论。另有 [MIT 四周纵向受控研究](https://www.media.mit.edu/publications/how-ai-and-human-behaviors-shape-psychosocial-effects-of-chatbot-use-a-longitudinal-controlled-study/?stream=top)，981 名参与者、超过 30 万条消息，研究孤独感、现实社交、依赖和问题性使用。随机分配的交互条件与自发高使用量应分开解释，不能将使用量相关性当作已识别因果。

因此必须收紧此前“没有纵向研究”的说法：**已有周尺度纵向研究，但它没有证明高频 AI 使用使青少年长期语言社会化、等待耐受和冲突修复能力普遍退化。** 原文章的这条长期机制仍待检验；不能从其中一项短期谄媚实验推定全部三种摩擦均已证实。社交护栏与语用素养可作为产品／教育回应候选，同时寻找 AI 帮助反思、练习和观点校准的反例。与[动态对齐](posts/alignment-under-change.html)、[抗谄媚与软性质量](posts/llm-soft-quality.html)的最终增量仍需在单篇启动时检查；本节不直接重写旧文。

**04 的写作与学习材料（11/07 收录）。** [腾讯研究院王焕超《AI 写作是一种命运》（2026-10-26）](https://mp.weixin.qq.com/s/5iZ2QvjHxnq1VZe45M2cuw)提出从“用不用 AI”转向“在哪一层用”，以“承重句”讨论作者判断、个人经验和修正责任，建议先确定承重内容、保留有意义的表达差异；依据上传 PDF 第 8—11 页。该框架是作者主张，不是行业标准；本项目只吸收核心判断需有依据并由作者接受、审校不能抹平有信息作用的表达，不把“每个判断必须锋利且有专属个人经历”设为普遍门槛，也不把其引用的小样本研究直接升级成 AI 初稿必然损害思考的事实。

[腾讯研究院李海伦《如果 AGI 三年内到来，读博士和终身教职规划还有意义吗？》（2026-11-03）](https://mp.weixin.qq.com/s/cHqVyfSNJj_XTarBnAVr1g)为 Jascha Sohl-Dickstein 演讲的中文删节整理；依据上传 PDF 第 6—8 页，保留“研究完成时是否仍有价值”“让执行工具放大研究但保留质疑能力”“信念与行动选择应一致”三个问题。三年 AGI 是条件性预测，不作为系列前提或职业结论；中文文稿所述会议、增长倍数和时间线在正式引用为事实前仍需原始演讲与数据核验。其“不让 AI 写第一稿”与前文允许确定承重内容后由 AI 扩写并不完全相同，应保留分歧，不拼成统一禁令。

**04 的下一步。** 在本分支实际启动时，围绕作者判断怎样形成、哪些学习环节不宜无意识外包、项目完成时价值怎样随工具变化来收敛；与[AI 工作价值循环](posts/ai-work-value-loop.html)关于外部积累与个人理解的旧论证做增量检查。不因两篇来稿自动扩成三个新选题，不要求作者证明三年内是否有 AGI。写作方法中已经被 SOP 覆盖的流程不重复新增；细化的材料判断与表达保护只在 `blog-human-writing/references/` 原有职责内维护。

**05｜机器人产品形态。** [Boston Dynamics／DHL 的 Stretch 案例](https://bostondynamics.com/case-studies/stretch-at-dhl/)与 [2025-05-13 部署意向公告](https://bostondynamics.com/news/dhl-signs-mou-for-additional-1000-robot-deployment/)提供专用卸货任务路径；额外 1,000 台是意向，不能写成全部交付。[GXO／Agility 2026-10-26 扩展公告](https://www.agilityrobotics.com/content/gxo-and-agility-robotics-expand-partnership-to-accelerate-deployment-of-humanoids-in-u-s-operations)提供人形机器人进入特定仓储任务的对照，新增场地与未来部署须和已有运行区分。二者均属参与方材料，不是统一任务／成本的独立横评。可研究本体通用性与任务专用性的不同层次，不靠“汽车还是家电”类比预定终局；与 FSD 迁移、数据工厂保持分工，暂不强行凑成文章。

## 四、关键决策与结项

| 日期 | 决策／变化 | 原因与去向 |
|---|---|---|
| 2026-11-08 | 选题排序加入成熟度与时间校准；复核 18 张卡的入口与状态一致性 | 9 可进大纲、6 待关键补证、2 已转入、1 已合并；4 张较早可进大纲卡被列为下次选题应主动比较的候选，而非自动升优先级。总览行序不等于排期；无新外部证据，本轮不刷新各卡核验日期或改状态，并修正系列 02 已发布后的旧工作稿指针。 |
| 2026-11-08 | 用户确认 Follow Builders 候选 1，创作／交互 BR-20261101-01 补两条实现路线 | Vercel 受约束的动态任务卡片与 Instagram Edits／Roblox Studio 的 Agent 操作专业编辑器形成对照；补官方机制和适用边界，不为两新闻另立同题，也不改文章排期。 |
| 2026-11-08 | 用户明确关注未来数年 AI for Science 的生物方向，新增 BR-20261108-01 | 虚拟细胞“预测→干预实验→反馈”的研究问题与已发表世界模型／物理 AI 一般论证存在独立增量；LabCompass 有具体体外实验，Arc 挑战与同行评审基准提示泛化困难。作者的“未来爆发点”保留为待验证假设，不将预印本或投入计划冒充临床／商业成功。 |
| 2026-11-07 | 三篇来稿回流既有分支，补强写作判断与表达保护 | 写作／AGI 选择归系列 04 的证据区；Persom 归 Memory／Harness 并交叉引用 BR-20260930-04、BR-20261010-01。保留原文链接、PDF 页码、观点分歧和未实测边界；17 卡及状态数量不变，不新增文章或改变排期。写作方法只改原有 Skill references，不另建流程或平行规范。 |
| 2026-11-07 | 状态名称与运行规则统一：SOP v41、维护规范 v1.2 | 将当前“待补证／可立项”改称“待关键补证／可进大纲”，数量不变；规定任务运行时遇到可核验公开缺口默认主动补证，外部信息缺失则留下重访条件并停止无增量搜索；不创建后台任务、不跳过大纲确认。 |
| 2026-11-07 | 全部既有卡完成一轮公开补证与状态复核；维护规范 v1.1 | 不新增平行状态，区分成文边界、阻断／非阻断缺口及责任。17 个 ID 保留：8 可立项、6 待补证、2 已发布转入、1 合并；未做真实产品实验、未批准大纲、未改发布 metadata。 |
| 2026-11-07 | BR-20260930-03 合并至两张具体子卡并保留历史 | 已发布软件操作者文章已覆盖泛产品价值；工作协调与持续编辑分别进入 BR-20261009-01、BR-20261101-01，避免重复排期。 |
| 2026-11-07 | 补证带来具体判断变化 | Jev 增加非厂商评测与反例；中美使用获得同一问卷但须限定时间与样本；Conductor 停止新注册改变实测条件；系列 04 区分已有周尺度纵向研究与未证青少年长期能力退化。 |
| 2026-11-07 | 用户确认 Follow Builders 候选 1，新增 BR-20261107-01 | 保留“模型判断、代码决策”的独立问题，不把厂商速度、成本和 KV Cache 观点升级成通用结论。 |
| 2026-11-07 | 用户确认 AIHOT 前三项候选 | Dreaming 回流 Memory／Personal Harness；代码审查瓶颈归基础设施；Muse Spaces 归持续编辑，不新增重复正文。 |
| 2026-11-05 | 五组证据回流四卡 | Pierre、Conductor／HumanLayer、Uber、Astra／Linux、IBM CUGA 分别补原问题，保留交易阶段与实验边界，不改系列排期。 |
| 2026-11-03 | 基础设施 BR-20261103-03 从工作单位卡分出 | 交互组织与底层工作负载是独立问题；Scion、Pando、GitHub 不证明 Git 普遍淘汰。 |
| 2026-11-03 | Tesla 技术迁移限定题可立项，GenAI 保留待补证 | 迁移条件可由一手工程和外部实验讨论；组织原因及广告增量不能从报道和复合商家增长推出。 |
| 2026-11-01 | 创作／可修改界面独立；AutoFix 回流 SaaS | 新问题是持续控制与编辑；自动维护是已发布买／建判断的后续证据。 |
| 2026-10-25 | SaaS 买／建文章已发布 | BR-20261016-01 保留真实替代、全成本、复用和议价边界；发表不等于长期效果已经证实。 |
| 2026-10-18 | Personal Agent 已发布 | BR-20260930-04 转入正式文章；持续委托和净收益为主线，入口／交易价值留 05。 |
| 2026-10-16 | SaaS 正反证据入库，消费入口增加三方对照 | Swyx／Every／Archie 服务买建边界；浏览器执行、Google Cart、Shop 交易接口不是同层竞品。 |
| 2026-10-11 | 中美态度／使用独立建卡；外卖证据回流 05 | 不以态度代替采用；不为 Bites／DoorDash 新建重复题。 |
| 2026-10-10 | 多模态系列按发布事实结项 | 01／02／04／05 已发布，03 已转出独立发表；数据工厂与游戏分别进入独立 BR 卡，不续编号。 |
| 2026-10-10 | Agent 业务价值指标独立；Personal Agent 当时转入工作稿 | Goodput 是类比而非行业标准；个人代理六款对照和付费机制已按作者要求收敛，后续已正式发布。 |
| 2026-10-09 | 工作单位、人才分别独立；拆分待办规范与记录 | 保留原问题与创建日，不因同属 Agent／组织就合并；统一四层记录和唯一当前真源。 |
| 2026-09-30 | 首次建立 01—04，随后新增 05 | [初始提交](https://github.com/MarkTian-Long/marktian-long.github.io/commit/19d738c97149261e9bf681453b3e982c19ece615)与[新增 05](https://github.com/MarkTian-Long/marktian-long.github.io/commit/a91abc44394e40a83a0785955a9f092633a1d27c)保留可核查来路；创建日不是新闻日期。 |

**维护边界。** 本文件记录研究状态与编辑选择依据，不等于已经批准的写作排期。2026-11-08 的排序复核仅检查现有卡片、历史发布与入口，不代表重新访问了全部外部来源、完成真实实验或开启后台监控；单篇正式启动仍读取最新 Series Brief、当前研究卡和可验证来源。文章正文、metadata、分类与发布状态不因排序自动变化。
