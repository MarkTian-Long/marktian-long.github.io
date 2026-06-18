# 模型跑出了测量边界，评测体系跟不上了

> 静态 benchmark 被能力增长打穿，agent 时代的动态评测基础设施还没建立，而在这个真空期里，大厂凭借能力集中转向自建评测，独立第三方的生存空间正在被结构性压缩。

## 一个不该倒的公司倒了

2026 年 3 月 31 日，Yupp.ai 宣布关闭。

这家公司的死不太像一般的创业失败。[它在 2025 年 6 月上线](https://www.prismnews.com/news/crowdsourced-ai-feedback-startup-yuppai-shuts-down-less)，融了 a16z 领投的 3300 万美元种子轮，投资人名单里有 Google DeepMind 的 Jeff Dean、Perplexity CEO Aravind Srinivas。产品逻辑是让用户免费使用 800 多个 AI 模型，通过众包偏好数据帮助 AI 实验室评测模型表现（即通过大规模用户投票来模拟人类偏好反馈，替代实验室内部昂贵的人工标注），数据再卖给各大实验室。上线不到一年，累计 130 万用户，付费客户包括多家实验室。

按通常的创业逻辑，这不是一家做得烂的公司。

关闭声明里，联合创始人 Pankaj Gupta 写道（译自英文原文）："AI 模型的能力格局在过去一年里发生了根本性的变化，未来也会继续快速演变。未来不只是模型，而是 agentic 系统。在那个世界里，chatbot 层面的众包模型评测变得越来越不重要。"

这段话值得细读。Yupp.ai 死掉不是因为执行差，而是因为它试图填补的那个空间本身正在消失，或者更准确地说，正在被重新定义。

Yupp.ai 的倒闭是一个截面，它切到的是大模型评测体系目前正在经历的一场结构性危机。

## 静态 benchmark 跑出了测量边界

先说已经确定发生的事。

传统静态 benchmark 的天花板问题不是新鲜话题，但 2025-2026 年的数据让这个问题从"趋势"变成了"已完成的事实"。[MMLU 满分区间已经是 90% 以上](https://hai.stanford.edu/ai-index/2025-ai-index-report/technical-performance)，前沿模型之间差 2 个百分点，这个数字已经没有区分能力；HumanEval 的 Pass@1 接近 99%，作为编程评测基准事实上已经退休。研究者用来描述 2024-2026 年这段时期的词是"benchmark 饱和时代"。

更重要的问题不是"题不够难"，而是能力增长速度超过了评测体系的刷新速度。

METR（一家专注 AI 风险评估的独立机构）从 2019 年开始追踪一个叫"任务完成时间地平线"的指标：测量 AI agent 在 50% 成功率下能完成的任务时长，任务时长用人类专家完成同一任务所需的时间来校准。[这个指标从 2019 年到 2025 年保持约 7 个月翻倍一次的增速](https://metr.org/blog/2025-03-19-measuring-ai-ability-to-complete-long-tasks/)，2024 年之后加速到约 105 天翻倍一次。

然后 Claude Mythos Preview 出现了。

[METR 在 2026 年 5 月 8 日更新了追踪页面](https://metr.org/time-horizons/)，同时加上了一条注释："16 小时以上的测量结果在当前任务集下不可靠。"Mythos 的 50% 时间地平线估计为至少 16 小时，95% 置信区间是 8.5 小时到 55 小时。区间跨度 6 倍多，不是因为模型表现不稳定，而是因为 METR 的 228 个任务里只有 5 个被标注为 16 小时以上，样本太少，曲线失去了统计意义。

这不是"评测集快被打穿了"，是评测集已经跑出了测量边界。METR 自己在页面上承认，要可靠地测量 Mythos 这个级别的能力，需要"新的任务、新的人类基线，以及大幅增加的评测资源"。

这里有一个细节值得单独拎出来。METR 在 2025 年 8 月做了一组对比实验，发现用算法自动评分测出的时间地平线（Claude 3.7 Sonnet 约 1 小时），和他们做的开发者生产力随机对照实验里观察到的真实结果之间存在系统性缺口：[算法评分高估了 AI 的真实能力，因为 agent 经常能通过自动化测试，但代码质量差、测试覆盖不足、不符合生产标准](https://metr.org/blog/2025-08-12-research-update-towards-reconciling-slowdown-with-time-horizons/)。

这意味着即便是 METR 这样专门为 agent 时代设计的评测框架，算法评分这个核心工具也已经被发现存在系统性偏差。

## agent 时代的评测范式还没有共识

结果指标测的不是真实能力，只是"能通过自动评分的能力"——这个问题在 agent 时代不是细节，是范式层面的缺陷。因为 agent 评测面临的根本问题不是旧尺子不够用，而是**尺子本身还没有被发明出来。**

现有的 agent benchmark，SWE-bench 测真实 GitHub issue 的修复，WebArena 测网页导航，OSWorld 测跨应用的桌面操作，都是局部解。[一项对 12 个主要 agent benchmark 的系统性分析发现，10 个中有 7 个存在有效性问题，成本估算误差最高达 100%](https://arxiv.org/html/2511.14136v1)。WebArena 的 substring matching 评分方式会系统性高估成功率 1.4-5.2%；OSWorld 的评测环境对新型 agent 架构适配性差。

但这些还不是核心问题。核心问题在于，单步任务和多步骤任务的评测逻辑根本不同。

单步任务的答案空间是封闭的，对错相对清晰。多步骤 agent 任务里，同一个目标可以有多条有效路径，中间步骤的"对错"依赖上下文，失败可能发生在第 5 步但根因在第 1 步的决策，而且真实业务场景里的成功标准往往无法被算法自动评分。

这不是难度升级，是评测范式的根本性变化。

我在实际工作里部署 AI 系统时，评测从来不是单一指标的事，需要同时追踪技术指标、业务指标，以及一个和战略目标绑定的北极星指标，三层之间的关系需要人来校准。公开的大模型评测体系长期停留在单一维度的技术指标上，连"这个指标服务于什么业务目标"这个问题都没有被系统性地问过。

这个缺口在 chatbot 时代还能接受，因为用户场景相对简单，偏好可以被众包。到了 agent 时代，一个 agent 在真实业务环境里是否可靠，涉及的维度远超现有任何公开评测框架能回答的范围。Yupp.ai 的死法之所以有代表性，正是因为它的商业模式建立在"chatbot 层面的偏好数据有价值"这个前提上，而这个前提已经被 agent 范式的切换给架空了。

## 大厂填真空，但带来新问题

agent 评测框架的空白不会一直空着。正是因为外部机构越来越难以设计有效的评测，大厂有了充分的理由和空间自己来填——这是两节之间的因果链，不只是时间上的先后。

但填真空这件事本身，带来了两种新问题，性质不同。

第一种问题是叙事控制。随着模型能力进入更深水区，评测的专业门槛在提高，能设计出有区分度的任务的人，越来越集中在模型研发团队内部。OpenAI 的 PaperBench 让 agent 从零复现 ICML 论文，Anthropic 用内部性能工程考试测 Opus 系列（官方声称，未经独立验证）。这些评测本身不一定有问题，问题是当评测的设计者和被评测的对象是同一家公司时，"选择测什么"本身就已经是一种叙事控制。

第二种问题是独立平台被渗透。[Cohere、Stanford、MIT、Allen AI 等多家机构联合发表的论文《The Leaderboard Illusion》揭示](https://blog.collinear.ai/p/gaming-the-system-goodharts-law-exemplified-in-ai-leaderboard-controversy)，Meta 在 Llama-4 发布前在 LMSYS Chatbot Arena 上私下测试了 27 个模型变体，选择性披露最佳结果。Arena 原本是学术机构运营的独立评测平台，这个案例说明，即便评测平台本身没有主动妥协，大厂也可以通过私测和选择性披露来扭曲排名。Cohere 研究副总裁 Sara Hooker 在论文发布后写道（译自英文原文）："科学诚信的关键是我们能信任进步的衡量标准。"

两种问题指向同一个结构：能力集中和利益冲突相互强化。正因为外部机构越来越难以设计有效的评测，大厂的自建评测才更难被外部质疑；正因为难以被质疑，选择性披露的代价才更低。OpenAI 和 Anthropic 在 2025 年做了一次互相评测对方模型的联合实验，测试 sycophancy、自我保护倾向等对齐指标。这个举动可以解读为两家公司都意识到单边自评公信力不足，但它同时也说明，独立评测的职能正在被大厂之间的"互评"所替代。

METR 和各国政府的 AI 安全研究所（AISI）的存在证明独立评测的需求是真实的。但[研究者已经明确指出，独立机构在评测节奏上已经形成了对大厂的依赖关系，"无法跟上大厂的速度和资源"](https://aievaluation.substack.com/p/2025-august-ai-evaluation-digest)。METR 对 Mythos 的评测本身，评测结果主要服务于 Anthropic 的部署前风险评估流程，评测窗口和任务选择都受到了约束。

独立评测的空间不是一夜消失的，是被资源差距和速度差距慢慢挤压的。

---

## 确定的和不确定的

有一件事现在是确定的：评测体系已经落后于能力增长，而且在 agent 时代，这个差距的性质变了，不再是"题不够难"，而是测量范式本身需要重建。

不确定的是谁来重建，以及按照谁的利益来建。下一套评测标准有三条可能的路：METR 这样的独立机构获得足够资源，把任务集扩展到能覆盖 agent 时代的复杂度；政府监管框架介入，强制要求独立评测作为部署前提；或者大厂主导的"联合评测"成为新的行业默认，就像 OpenAI 和 Anthropic 那次互测所暗示的方向。

这三条路的结果差异很大。前两条保留了外部监督的结构，第三条本质上是把裁判权交还给运动员，只是从单边自评变成了双边互评。

Yupp.ai 的 3300 万美元回答了一个否定版本：分散的众包平台走不通。正确答案还没有出现，但谁先建立起被行业接受的评测基础设施，谁就掌握了定义"AI 能力"的话语权。这不只是技术问题。

---

## 参考资料

- [METR: Task-Completion Time Horizons of Frontier AI Models](https://metr.org/time-horizons/)
- [METR: Measuring AI Ability to Complete Long Tasks (March 2025)](https://metr.org/blog/2025-03-19-measuring-ai-ability-to-complete-long-tasks/)
- [METR: Research Update – Algorithmic vs. Holistic Evaluation (August 2025)](https://metr.org/blog/2025-08-12-research-update-towards-reconciling-slowdown-with-time-horizons/)
- [Yupp.ai 关闭公告](https://blog.yupp.ai/winddown/)
- [Prism News: Yupp.ai Shuts Down Less Than a Year After Launch](https://www.prismnews.com/news/crowdsourced-ai-feedback-startup-yuppai-shuts-down-less)
- [Stanford HAI: 2025 AI Index – Technical Performance](https://hai.stanford.edu/ai-index/2025-ai-index-report/technical-performance)
- [The Leaderboard Illusion – Collinear AI 解析](https://blog.collinear.ai/p/gaming-the-system-goodharts-law-exemplified-in-ai-leaderboard-controversy)
- [2025 August AI Evaluation Digest](https://aievaluation.substack.com/p/2025-august-ai-evaluation-digest)
- [Beyond Accuracy: A Multi-Dimensional Framework for Evaluating Enterprise Agentic AI Systems](https://arxiv.org/html/2511.14136v1)
- [METR evaluates Claude Mythos Preview at 16-hour time horizon](https://the-decoder.com/metr-says-it-can-barely-measure-claude-mythos-palo-alto-networks-warns-of-autonomous-ai-attackers/)
- [Startup Fortune: METR says Claude Mythos is testing the limits of AI evaluation](https://startupfortune.com/metr-says-claude-mythos-is-testing-the-limits-of-ai-evaluation/)
