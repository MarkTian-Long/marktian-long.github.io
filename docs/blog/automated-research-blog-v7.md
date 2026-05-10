# AI能大量生产方向，但还不会判断什么重要

> 自动化科研让AI第一次跑完了整条研究链路。但这件事真正的意义不在于它能产出多少论文，而在于它把AI最难突破的边界暴露得足够清楚：执行可以工业化，判断还不行。

今年2月，我在刷信息流的时候看到一个正在直播的页面：屏幕上滚动着实时更新的任务队列，从假设生成到实验执行再到论文写作，每隔几分钟就有一个新项目推进到下一阶段。没有人坐在那里操作，也没有人监督，整个系统在自己跑。这是FARS（Fully Automated Research System）的公开直播，由新加坡初创公司Analemma发起。

一个系统能在没有任何人监督的情况下自己跑完整条科研链路，光是这件事本身就已经很不寻常。

## FARS是什么

[FARS](https://analemma.ai/blog/introducing-fars/)是一个端到端的自动化科研系统，由四个专职Agent组成：Ideation负责文献调研和假设生成，Planning制定实验方案，Experiment执行实验，Writing完成论文写作。整个流程无需人工干预，研究提案、实验代码和完整论文均已公开在[官网](https://analemma.ai/fars)，实验代码同步托管于[GitLab](https://gitlab.com/fars-a)。

这次直播的目标是产出100篇完整论文。[据Analemma官方公告](https://x.com/AnalemmaAI/status/2025822814633423189)，系统在启动后228小时28分33秒完成了这一目标，期间全程无人值守，自主生成了244个研究假设，平均每篇论文约2小时17分钟，每篇成本约1000美元。完成100篇后直播继续运行，直到2026年3月3日才正式结束。

有几点边界需要说清楚：FARS目前主要针对机器学习领域的研究，它能全流程自动化的前提是实验可以在代码层面完成，不依赖真实物理实验。生物、化学、材料科学等需要真实物理实验的领域，暂时无法复制这套模式。

## 这个生态里还有哪些工具

FARS不是第一个进入这个领域的尝试，围绕AI辅助科研，目前已经形成了一个层次分明的工具生态。

**辅助型工具**处于这个生态的基础层，帮研究者完成文献密集型工作。[Undermind](https://www.undermind.ai)通过语义搜索和引用图谱遍历，在数亿篇论文中定位真正相关的研究，定位是加速文献检索，人类研究者依然主导判断。[OpenScholar](https://arxiv.org/abs/2411.14199)由Allen Institute for AI开发，专门针对科学文献问答，相关研究已发表于Nature，在多个学科的文献综合准确性上超过了GPT-4o。这类工具的共同特点是：AI负责加速信息处理，人类继续做判断。

**假设生成型工具**往前迈了一步，开始介入研究方向的提议环节。[Google AI co-scientist](https://research.google/blog/accelerating-scientific-breakthroughs-with-an-ai-co-scientist/)基于Gemini 2.0构建，通过多个专职Agent持续生成、辩论和改进研究假设。它已在生物医学领域得到实际验证：与Imperial College London合作的抗菌素耐药性研究中，系统在数天内得出了传统方式需要数年才能推进的结论；在急性髓系白血病的药物重定向研究中，它提出的候选药物经实验验证得到证实。Google明确将其定位为辅助工具，强调需要"科学家持续介入和引导"。

**全流程自动化**是目前最激进的方向。Sakana AI的[The AI Scientist](https://arxiv.org/abs/2408.06292)于2024年8月率先发布，其v2版本已将一篇完全AI生成的论文送进ICLR 2025研讨会并通过同行评审，这是AI生成论文首次通过正式评审流程。FARS在此基础上更进一步，将整个过程以直播形式公开，并通过大规模产出测试系统的稳定性。

这个工具生态说明了一件事：执行层面的能力在快速推进。从辅助检索，到帮助提假设，再到全流程无人干预，每个层次都有产品在做。

## 执行能力之后，瓶颈在哪里

执行能力不再是问题，但这并不意味着自动化科研的核心挑战被解决了。

使用Andrew Ng团队开发的[Stanford Agentic Reviewer](https://paperreview.ai/tech-overview)对FARS产出的100篇论文按ICLR标准评分，平均分为5.05，区间3.0到6.3。Analemma自己在公告中也指出，这个评分只能作为参考，不代表官方评价，他们正在另行组织独立的人工质量评估。值得注意的是，Stanford Agentic Reviewer本身也承认其准确性主要适用于机器学习领域，在其他领域因文献覆盖不足效果有限——这和FARS本身的适用边界基本一致。

这个评分系统衡量的是"论文在现有学术标准下的质量"，而不是"这个研究方向本身值不值得做"。这两件事不是同一回事，而后者才是自动化科研真正需要解决的问题。

这就触碰到了AI目前面临的真正瓶颈：**价值判断能力**。价值判断可以拆成两个层次：一是判断一个方向有没有价值，二是判断这个方向的价值有多大、值不值得优先追。前者相对容易，AI已经能做到和人类专家基本一致；后者才是真正的难点，也是自动化科研目前卡住的地方。

这个能力的缺口，可以进一步拆成两层来看。

第一层是**上下文缺口**：AI因为缺乏对具体场景的深度理解，导致判断偏离实际。这层问题理论上有解，通过补充私有数据、细化场景描述、构建更完整的知识库可以缓解，是个工程问题。

第二层是更根本的**方向判断缺口**：即使信息足够，AI仍然难以判断"这个方向的价值有多大"。一项来自清华大学的研究（[HybridQuestion](https://arxiv.org/abs/2602.03849)，arxiv预印本，未经同行评审）专门探讨了AI与人类在科研选题上的分歧：AI在识别"已有突破性成果"方面与人类专家高度一致，但在预测"前瞻性研究方向"时出现明显分歧——恰好对应价值判断的两个层次，有无价值AI能判断，但价值有多大、值不值得现在追，AI和人类的判断就开始出现差距。这层能力依赖的是对领域走向的感知、对未来的预判，以及对"什么问题更重要"的价值取向，很难从现有语料里学到。

## 价值判断本来就是困难的事

价值判断本来就是困难的事，对人类也不例外——尤其是判断一个方向的价值有多大。

Geoffrey Hinton研究神经网络的那几十年，是这个问题最清晰的案例。他的博士导师建议他不要研究神经网络，以免影响职业发展。整个AI学术界在"AI寒冬"期间集体转向，认为神经网络这条路走不通。[Hinton的论文屡遭拒绝，研究被同行视为无关紧要](https://radical.vc/geoffrey-hinton-on-the-algorithm-powering-modern-ai/)，他在几乎无人支持的情况下坚持了数十年。直到2024年，他和Hopfield共同获得诺贝尔物理学奖，距离1986年那篇奠定反向传播算法基础的论文，已经过去了38年。

类似的案例不止一个。[Peter Higgs关于希格斯玻色子的论文被Physics Letters以"不值得快速发表"为由拒稿](https://www.sciencealert.com/these-8-papers-were-rejected-before-going-on-to-win-the-nobel-prize)，47年后才等来诺贝尔奖。Kary Mullis发明PCR技术的第一篇论文被Science拒稿，三年后PCR被同一期刊评为"年度分子"，Mullis随后获得诺贝尔化学奖。

这些案例说明的不是"同行评审很烂"，而是：在一个方向被验证之前，判断它的价值有多大，本来就是一件极其困难的事，即使是领域内最优秀的专家也会频繁判断错。把这个逻辑带回FARS的5.05平均分：我们没有办法仅凭学术评审标准，判断其中有多少篇论文指向了真正重要的方向——就像没有人能在1986年用当时的评审标准判断Hinton的研究会通向哪里。

区别在于，人类偶尔会出现像Hinton这样的研究者，凭借直觉和信念在无人支持的情况下坚持推进。AI目前还没有表现出这种能力。

## 同一个缺口，不同的代价

自动化科研是一个清晰的切口，但它折射的问题在AI被应用的几乎所有领域都存在——只是表现形式和后果结构不同。

**产品开发**：在AI PM的日常工作里，AI可以在很短时间内给出一套完整的产品方案，功能逻辑自洽，优先级排列清晰。但实际使用下来，偏差往往集中在同一个地方：方案里的指标优先级和真实商业环境对不上。AI倾向于优化它认为"重要"的技术指标，但实际业务更在意的可能是另一套完全不同的优先级——这套优先级藏在公司所处的竞争阶段、团队资源约束和用户的真实使用路径里，不是从需求文档里能读出来的。这类偏差代价相对可控，发现后可以迭代纠正。

**投资决策**：AI可以处理海量财务数据，在已有信息的基础上做出相当准确的分析。但"这家公司值不值得押注"这个判断，依赖的是对行业拐点的感知、对创始团队在压力下表现的判断，以及对一个还没发生的市场的想象力。这些判断所需的信息大部分不在任何数据库里，而一旦判断失误，资金损失往往难以回头。这里的问题不只是信息缺口，还有决策的不可逆性——谁来承担判断错误的后果，是一个AI目前无法回答的问题。

**组织管理**：AI可以从考勤、产出、协作频次等数据里分析团队效率，做得相当精细。但"这个人适不适合承担更大的责任"这个判断，需要对人在不确定环境下如何响应的感知。这里还多了一层人机边界的问题：即便AI给出了建议，最终决定由谁来拍板、出了问题由谁负责，这条责任链不理清楚，AI的判断就很难被真正采纳。

三个场景有一个共同结构：AI可以在信息充分的条件下完成分析和执行，但在需要做出"什么更重要"这类判断时，能力出现了系统性的边界。这个边界不是临时的工程缺陷，而是当前AI的结构性特征。不同领域的差异在于，偏差被发现的速度、判断失误的代价、以及人机之间如何划定责任边界——这些在每个场景里都需要单独讨论，没有统一的答案。

## 人机分工是现实，但不是终点

面对这个结构性缺口，各领域目前采取的应对方式，本质上都在走同一条路：**人类保留价值判断，AI负责执行和生成**。只是在不同场景里，这条分工线划在哪里、如何维持，有很大差异。

在科研领域，这意味着AI大规模生成候选方向和执行实验，人类专家在关键节点做筛选。已经有[研究团队在构建更系统化的协作框架](https://arxiv.org/abs/2602.03849)，让AI处理文献和假设生成，人类在价值判断环节介入。Google AI co-scientist也是这个逻辑，它明确强调需要"科学家持续介入和引导"。

在产品、投资、管理等领域，人机分工的边界更难标准化，因为"什么信息算足够"、"谁来为判断结果负责"在每个组织里的答案都不同。这些问题还没有通用解法，更多依赖各自场景下的摸索。

还有人在探索更根本的方向：通过类似强化学习的机制，让模型从真实世界的结果反馈中学习"什么决策有价值"，而不只是从现有语料里归纳模式。理论上这能缩小方向判断缺口，但目前还没有看到突破性的实证。

三条路都还在摸索中。更诚实的说法是：我们现在知道问题在哪，但还不知道怎么解。AI能高效生产大量方向和选项，但在判断哪个真正重要这件事上，目前还需要人来把关——不管是在科研、产品还是组织里。这个格局短期内不会改变，真正值得关注的，是各个领域如何在这个前提下，把人机之间的分工线划得更清楚。

---

**参考资料**

- [Introducing FARS](https://analemma.ai/blog/introducing-fars/) - Analemma
- [FARS研究成果页](https://analemma.ai/fars/) - Analemma
- [FARS GitLab代码仓库](https://gitlab.com/fars-a) - Analemma
- [FARS官方公告推文](https://x.com/AnalemmaAI/status/2025822814633423189) - Analemma
- [The AI Scientist: Towards Fully Automated Open-Ended Scientific Discovery](https://arxiv.org/abs/2408.06292) - Sakana AI, 2024
- [The AI Scientist-v2](https://arxiv.org/abs/2504.08066) - Sakana AI, 2025
- [Accelerating scientific breakthroughs with an AI co-scientist](https://research.google/blog/accelerating-scientific-breakthroughs-with-an-ai-co-scientist/) - Google Research, 2025
- [OpenScholar: Synthesizing Scientific Literature with Retrieval-augmented LMs](https://arxiv.org/abs/2411.14199) - Allen Institute for AI
- [Stanford Agentic Reviewer](https://paperreview.ai/tech-overview) - Andrew Ng team, Stanford ML Group
- [HybridQuestion: Human-AI Collaboration for Identifying High-Impact Research Questions](https://arxiv.org/abs/2602.03849) - 清华大学，arxiv预印本，未经同行评审，2025
- [8 Scientific Papers That Were Rejected Before Going on to Win a Nobel Prize](https://www.sciencealert.com/these-8-papers-were-rejected-before-going-on-to-win-the-nobel-prize) - ScienceAlert
- [Geoffrey Hinton on the algorithm powering modern AI](https://radical.vc/geoffrey-hinton-on-the-algorithm-powering-modern-ai/) - Radical Ventures
