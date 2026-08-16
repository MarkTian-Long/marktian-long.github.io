# AI 研发已经开始自我加速，但这还不是 RSI

> AI 已经开始参与代码、实验、训练和评估，甚至直接帮助开发下一代 AI。但这和递归式自我改进之间还隔着一层更关键的变化：AI 不只是更会执行研发，而是开始稳定接过“研究什么、实验说明了什么、什么才算真正进步”的判断权。

---

7 月底，一份梁文锋与投资人的闭门交流实录在网上流传。[《每日经济新闻》核实](https://www.nbd.com.cn/articles/2026-07-23/4504670.html)，这场会确实在今年 5 月召开，参与投资 DeepSeek 的机构认为实录内容真实可信；DeepSeek 本身则没有对流出的逐字稿作正式确认。

其中有个判断对我影响很大。在这份流出的交流记录里，梁文锋把 AGI 看成长期主线，CoT、Agent、持续学习是沿这条线继续往前的阶梯，而多模态、视频、3D 等能力更多被放在能力组件或分支的位置。持续学习之后，他甚至推测模型可能进入“研究并开发自己下一版本”的阶段。

我并不准备把这套路线图当成 AGI 的标准答案。真正让我重新想问题的，是“主线和分支”这个区分。

过去我很容易把多模态、视频、Coding、Agent、世界模型理解成几条平行赛道，关注哪条进展更快、哪家公司暂时领先。但如果最终关心的是智能本身的增长，还应该再问一步：**哪些进步只是让 AI 多会一种事情，哪些变化会反过来改变 AI 自己变强的速度？**

恰好过去一年，另一类信号也越来越密集。OpenAI、Anthropic、Google 都开始公开谈论模型参与自身研发；最近 Jeff Dean、Sanjay Ghemawat、Oriol Vinyals、Quoc Le 等长期处在 Google AI 核心位置的人又离开，创办的公司甚至就叫 Discovery Loop，目标直接指向自动化机器学习、科学和工程研究。[Reuters 对这轮变化有较完整报道](https://www.reuters.com/business/google-shakes-up-ai-leadership-deepmind-chief-shifts-role-2026-08-05/)。

与此同时，Frontier Labs 吸收大学研究者的范围也在扩大。[The Atlantic](https://www.theatlantic.com/technology/2026/07/ai-companies-hiring-academics/688002/)统计到 OpenAI、Anthropic、Meta、DeepMind 中超过 80 位现任或前任教授，涉及的领域也已经不只有计算机科学。

至少从我近期看到的公开报道里，美国 Frontier Labs 吸收跨学科教授的动作尤其显眼，而中国基模厂商还没有出现同样密集的公开叙事。这里究竟是报道偏差、人才市场差异，还是科研组织与 AGI 路线已经出现了不同选择，值得以后单独研究，这篇文章不展开。

这些变化一度让我产生一个很自然的解释：**Claude 在 Coding 上形成强势之后，Science 会不会成为 Frontier Labs 的下一个主战场？**

继续看下去，我反而觉得这个理解还是太像“赛道分析”了。Coding 和 Science 未必是前后两场战争。Coding Agent 本身正在变成 Research Agent 的执行能力：写实验代码、修改训练系统、跑评测、处理数据、分析失败，然后继续下一轮实验。

**真正值得观察的变化不是“大家开始做 Science”，而是 AI 已经开始进入制造下一代 AI 的研发循环。**

这到底只是更强的研发工具，还是已经算 AI 在“自我改进”？

## 一、同一句“AI 帮助开发下一代 AI”，其实差得很远

Anthropic 最近在 [《When AI builds itself》](https://www.anthropic.com/institute/recursive-self-improvement)中，把 AI 最终能够自主设计并开发自己继任系统的状态称为 **Recursive Self-Improvement（RSI，递归式自我改进）**。但它同时明确强调：今天还没有到这一步，RSI 也并非必然发生。

问题是，“模型参与自身研发”现在已经可以描述很多完全不同的事情。AI 帮工程师写训练代码，是参与研发；自己修改代码、运行实验、根据结果继续优化，也是参与研发；今天的模型直接产生训练数据去改善下一代模型，仍然可以叫参与研发。

如果要判断这些现象到底离 RSI 有多远，我更关心的不是 AI 完成了多少研发工作，而是它在“制造下一代 AI”的研发闭环里，已经拿走了哪一类工作和判断权。

沿着这个标准，会出现三道比较明显的分界。第一道是 AI 能否在固定目标下独立完成“尝试—验证—再尝试”的局部实验闭环；第二道是这些自动化能力是否已经反过来提高下一代 AI 的研发效率，让更强 AI 和更快研发之间出现正反馈；第三道则从执行进入判断——AI 是否开始决定研究什么、怎样理解实验结果，以及什么才算真正进步。

基于这三道分界，我暂且把今天经常混在一起讨论的“自我迭代”拆成四种状态：

| **AI 在研发闭环中的位置** | **AI 实际在做什么** | **人仍然掌握什么** | **与 RSI 的关系** |
|---|---|---|---|
| 研发辅助 | 写代码、检索、分析 | 目标、方法、验收 | 还很远 |
| 自动实验 | 修改、运行、验证、再迭代 | 目标、评价规则 | 局部闭环 |
| 研发自我加速 | 执行更多研发环节，并反哺下一代研发 | 方向、关键判断 | 已出现早期现实信号 |
| 完整 RSI | 自主设计、开发和验证继任系统 | 人不再是关键闭环节点 | 尚未实现 |

*这是本文为了回答“AI 参与自身迭代到底到了哪一步”所做的工作划分，不是行业统一成熟度模型。四层描述的是不同的能力与判断边界，并非互斥的产品类型；同一个模型在不同任务上可能同时处于相邻层级。*

这里最容易被忽略的是第三层。

**AI 研发完全可能在没有实现 RSI 的情况下，先出现自我加速。**

更强的模型让研究人员一天能实现更多想法、运行更多实验、排除更多失败路线；这些效率提升又被用于开发下一代模型，下一代模型再反过来提高研发效率。这里已经有了正反馈，但人仍然可以掌握研究方向、评价标准和最终决策。

所以“AI 帮助开发下一代 AI”和“AI 自主开发下一代自己”之间，并不是一道开关，而是一大片正在被快速填满的中间地带。

## 二、为什么容易验证的环节最先自动化

我之前在[《让 AI 写代码这件事，为什么到硬件就不行了》](https://marktian-long.github.io/tools/blog/posts/ai-coding-hardware.html)里讨论过 Coding 为什么特别适合 Agent：代码、执行结果、错误日志和测试天然组成了机器可读的反馈闭环。

后来在[《从模糊到确定：人机边界是怎么移动的》](https://marktian-long.github.io/tools/blog/posts/human-ai-boundary-shift.html)里，我又把这个判断推进成一个更一般的结论：技术能力决定边界能走到哪里，真实场景里的验证反馈决定边界移动得有多快。

但 AI R&D 暴露出了一个我过去没有充分区分的问题：**即使所有工作都已经数字化，不同研发任务的自动化速度依然可以相差很大。**

真正拉开差距的是**验证机制**：AI 完成一次尝试以后，有没有一个足够便宜、快速、可靠的外部结果，告诉它“这次究竟有没有变好”。

优化 GPU Kernel 就很典型。代码能不能编译，有测试；计算结果对不对，有正确性检查；吞吐有没有提高，可以直接测量。生成方案、执行、验证、留下更优结果，一轮可以很快完成。

Google DeepMind 的 [AlphaEvolve](https://deepmind.google/blog/alphaevolve-a-gemini-powered-coding-agent-for-designing-advanced-algorithms/)就是这种结构：模型生成代码，自动评价器给出反馈，再让更好的方案继续演化。它已经被用于数据中心、芯片设计和 AI 训练优化，其中包括改进支撑 AlphaEvolve 自身的大模型训练。

OpenAI 最近公布的例子更加直接。[GPT-5.6 Sol 在 Codex 中](https://openai.com/index/gpt-5-6-frontier-intelligence-efficiency/)已经能够自主重写和优化生产 Kernel，并配合专门的正确性验证工具；它还为自己的 speculative decoding 草稿模型设计并运行了数百次实验。OpenAI 披露的 20% serving cost 降低和超过 15% token-generation efficiency 提升，都是特定系统优化的内部结果，不能理解成“GPT-5.6 让自身整体智能提高了 20%”。

这些任务有一个共同点：**目标已经确定，结果也很容易判断。**

当问题变成“下一代模型最值得研究什么”，结构马上不同。继续 Scaling 还是换训练方法？一个 Benchmark 上升是不是代表真实能力增强？一个失败实验说明参数没调好，还是整个假设错了？某个方向连续几个月没有收益，是死路，还是值得再坚持两年？

这里没有一个单元测试能在五分钟后告诉你答案。

因此，AI 研发自动化的速度，不只取决于任务是不是数字化，还取决于**反馈有多快、验证有多便宜、结果有多可信，以及“什么算更好”这个标准本身是否稳定。**

验证机制也不是另一套成熟度框架。它解释的是：为什么前面四种状态之间的边界，会在不同研发任务上以完全不同的速度移动。

这也改变了我对 Coding 和 Science 关系的理解。Coding 并不是 Science 之前的一场战争，它正在成为 Research Agent 最先自动化的那层基础设施。

## 三、AI 不需要先成为爱因斯坦，就能让研发开始复利

这里有一个很强的反驳：如果 AI 连什么问题值得研究都判断不好，怎么能谈“自己研发自己”？

最近关于 AI 科研能力的研究，确实给了这个反驳不少支持。

香港科技大学的 [《AI Research Agents Narrow Scientific Exploration》](https://arxiv.org/abs/2605.27905)在最新版本中，用五类科研 Agent 设置和五种模型生成并分析了 219,655 个研究想法。AI 的想法整体比人类研究更集中，也更靠近起始文献；只有 10.5% 提出了种子文献中不存在的新研究问题，却有 90.4% 引入了新的研究方法。作者把这种特征概括为 AI 更擅长 **local elaboration（局部展开）**，而不是扩张科学探索的边界。

芝加哥大学另一项[大规模科学家评测](https://arxiv.org/abs/2606.08251)则邀请了 6,749 名科学家评价 25,139 组模型提出的后续假设。推理模型虽然能扩大一些探索范围，但没有一类测试模型会自发提出零假设；研究还发现，自动评价器与领域专家的判断存在明显差距。

不过，这条边界也不是静止的。2026 年以来，Google 的研究型数学 Agent、OpenAI 对多个长期开放数学问题的推进，以及最近 Claude 挑战黎曼猜想时在大量失败搜索中转向一个相关新结果，都说明前沿模型已经不只是在做答案已知的竞赛题，而开始越来越深入地进入开放研究搜索。([Google DeepMind](https://deepmind.google/blog/accelerating-mathematical-and-scientific-discovery-with-gemini-deep-think/)、[OpenAI](https://openai.com/index/ten-advances-in-mathematics/)、[Anthropic](https://www.anthropic.com/research/riemann-zeta))

但我更愿意把最近密集出现的这些“AI 科学突破”新闻看成**同一阶段内边界持续向前移动的证据，而不是每隔几个月就出现一次新的能力阶段**。模型已经能承担越来越多开放搜索、局部路线选择和结果验证，但这和稳定决定“什么问题真正重要、一个结果是否值得长期押注”仍然不是一回事。

这和我之前[《AI 能大量生产方向，但还不会判断什么重要》](https://marktian-long.github.io/tools/blog/posts/automated-research.html)里留下的问题非常接近：研究执行越来越便宜，但“什么值得做”的判断仍然稀缺。

不过这次我意识到，自己过去其实把门槛想得太高了。

**“AI 能不能成为一个真正的顶尖科学家”和“AI 能不能显著加快 AI 研发”，根本不是同一道题。**

Anthropic 给了一个很直观的内部实验。它让 Claude 优化一段训练小模型的代码，目标和正确性检查都已经固定。2025 年 5 月，Claude Opus 4 平均能做到约 3× 加速；到 2026 年 4 月，内部 Mythos Preview 达到约 52×。Anthropic 自己特别提醒，这个数字高度依赖起始代码，也绝不能理解成真实前沿模型训练整体提速 52 倍。

真正有意义的是，在同一个实验环境里，模型执行“提出修改—运行—验证—继续优化”这个循环的能力提升得非常快。

而在“研究什么”这件事上，Anthropic 给出的判断恰好相反：Claude 已经能执行定义清楚的实验，但在选择目标、判断哪些问题重要时，人与模型之间仍有明显差距。

Anthropic 经常把这类能力称为 **research taste**。在本文的框架里，我更愿意把它拆得具体一点：它主要涉及后面要讲的**方向判断和结果判断**，而不是一个神秘而不可拆解的“科学家直觉”。

这两件事放在一起，反而说明：

**AI 不需要先成为爱因斯坦，才有资格开始加速自己的进化。**

现实里的 AI 研究也不是每天都在发明 Transformer。更多时候，是实现一个想法、跑实验、做消融、优化性能、调数据、定位失败，再根据结果设计下一轮尝试。只要这一大块工作被持续压缩，即使最后决定“为什么要做这件事”的仍然是人，研发组织本身的速度也已经变了。

## 四、“AI 参与自己的迭代”，今天到底走到了哪一步

回头再看过去一年厂商不断说“模型参与了自己的开发”，更有意义的问题就不是一句“这算不算 RSI”，而是它已经进入研发链的哪一段。

最成熟的是**工程执行**。Anthropic 官方披露，截至 2026 年 5 月，超过 80% 合并进其代码库的代码可归因于 Claude；典型工程师每日合并代码量相较 2024 年约为 8 倍。但 Anthropic 也主动提醒，代码量不等于真实生产率，8× 几乎肯定高估了实际生产率提升。

再往里，是**实验执行**。OpenAI 已经让 GPT-5.6 自主设计、启动和监控部分模型优化实验，Anthropic 也已经观察到 Claude 在定义清楚的实验上可以达到或超过熟练研究人员的执行水平。人与模型之间更明显的差距，开始从“怎么做实验”后移到“做哪个实验”。

再往前一步，今天的模型已经可以直接产生**训练下一代模型的反馈信号**。

OpenAI 的 [GPT-Red](https://openai.com/index/unlocking-self-improvement-gpt-red/)通过自动红队寻找新的提示注入攻击，再把这些攻击用于 GPT-5.6 的对抗训练。OpenAI 自己把它描述成一种安全方向的 self-improvement flywheel：今天的模型开始直接帮助下一代模型变得更稳健。

这些变化已经相当深入，但 OpenAI 自己的 [GPT-5.6 System Card](https://deploymentsafety.openai.com/gpt-5-6/)同时给出了一个很好的边界：在包括研究 Debug、Kernel、NanoGPT、PostTrainBench 等评测后，GPT-5.6 系列仍然没有达到 OpenAI 定义的 AI Self-Improvement **High capability threshold**。

所以“AI 已经参与自己的迭代”和“AI 已经实现 RSI”完全可以同时一真一假。

**更准确的状态可能是：AI 正从研发助手变成实验执行者，并开始进入部分训练反馈循环；研发自我加速已经出现，但研发目标和关键判断还没有形成自主闭环。**

## 五、从研发自我加速到 RSI，还隔着哪几种判断权

前面的四种状态是全文的主地图。到了最后一道“研发自我加速 → RSI”的边界，问题发生了变化：前两道分界主要是执行和反馈越来越自动化，最后一道分界则是**原本由研究者掌握的关键判断，是否也开始进入自主闭环。**

这里我暂且把它拆成三类。它们不是三个依次解锁的阶段，而是最后一道边界里的**三个并列自治维度**。

### 方向判断：下一步究竟研究什么

模型可以一天运行一千个实验，但前提仍然可能是人类先决定：这个季度应该研究 reasoning 还是 memory？有限算力应该押在哪条路线？一个长期不见收益的方向要不要继续？

这不仅是“生成更多 Idea”，而是在有限资源下决定**什么问题值得押注**。

### 结果判断：一次实验究竟说明了什么

指标下降了，是参数没调好，还是理论假设错了？两个实验互相冲突，应该继续补实验，还是重新定义问题？

这里需要的不只是读懂数字，而是让一次结果真正改变后面的研究路线。

### 评价标准判断：我们现在优化的东西本身对不对

这一类可能比前两种更难。如果 Benchmark 已经不能代表真正想要的能力，模型越来越擅长通过评测，却没有变成我们真正需要的系统，那么问题就从“如何取得更高分”变成了“这把尺子是不是还值得用”。

我之前在[《模型跑出了测量边界，评测体系跟不上了》](https://marktian-long.github.io/tools/blog/posts/ai-benchmark-failure.html)里讨论过类似问题：Agent 能力越开放，自动评分和真实任务成功之间越容易出现裂缝。模型通过 Benchmark，并不自动意味着我们真正关心的能力变强。

到了 AI 研发自身，这个问题会更加尖锐。优化 Kernel 时，结果正确而且更快，基本就是进步；到了开放研究，可能连**用什么标准定义进步**都需要重新判断。

这三类判断权不是时间顺序。一个系统可能已经很会解释实验失败，却不会决定未来半年应该研究什么；也可能能够提出不错的研究方向，但仍然只能围绕人类给定的 Benchmark 优化。

它们也不是“某一天三项同时达到 100%，RSI 就突然发生”的三个开关。完整 RSI 仍然默认前面的执行能力已经足够强：AI 能自主开展实验、修改系统、构建或训练继任系统、验证结果，并把整个过程持续运行下去。在这个前提下，三类判断权描述的是**人还在哪些关键位置上构成不可替代的闭环节点**。

只要其中某一种关键判断长期必须由人完成，研发循环就还没有真正自主闭合。

三类判断权的地位是并列的，但困难程度也未必相同。其中尤其值得注意的是评价标准判断：方向和结果至少还可以在一套既定目标里工作，而评价标准判断进一步要求系统有能力追问：

**我们正在优化的东西，本身是不是错的？**

因此，我现在不太想再用“AI 完成了研发工作的百分之多少”来衡量离 RSI 有多远。80% 的代码可以由 AI 写，但如果剩下的部分恰好包含研究方向和评价标准，人仍然站在循环的关键节点上。

反过来，如果未来模型写代码的占比几乎没有变化，却开始稳定判断哪些问题值得研究、哪些结果可信、什么时候应该放弃当前路线，甚至什么时候应该换掉旧的评价标准，那可能才是性质更大的变化。

**真正值得观察的不是 AI 做了多少研发工作，而是研发循环里的哪一种判断权正在移动。**

## 结尾：Science 可能不是 Coding 之后的下一场战争

回到最开始，我原本是因为几件事情撞在一起，才开始思考这个问题。

梁文锋把 AGI 和各种能力分支区分开的那套说法，让我开始问“什么东西真正改变智能增长的速度”；Frontier Labs 对科学研究和学术人才的投入，又让我一度把它理解成 Coding 之后的新战场。

现在看，这两件事情可能还有另一种连接方式。

Coding 没有因为 Science 兴起而退场。它反而正在变成自动科研的执行基础设施；自动科研也不只是在替人研究外部世界，它已经进入了 AI 自身的研发流程。

于是更值得追踪的问题不再是哪家公司下一场赢了什么赛道，而是：**AI 在“制造下一代 AI”这条链路上，究竟还需要人决定什么？**

今天的答案仍然很多。选择值得研究的问题，理解实验究竟证明了什么，以及判断现有评价标准是否还代表真正的进步，这些关键判断还远没有形成可靠的自主闭环。

但 AI 自我研发已经不再只是“有一天机器突然发明下一代自己”的科幻问题。它正在从写代码、跑实验、生成训练反馈这些更普通的工作里一点一点出现，并让研发本身开始获得正反馈。

**AI 研发的自我加速已经开始。真正接近 RSI 的标志，不会是 AI 第一次帮自己写代码，而是它在具备完整研发执行能力之后，开始可靠地决定：下一步，自己应该变成什么。**

## 参考资料

### 一手文件 / 厂商官方发布

- [When AI builds itself — Anthropic Institute](https://www.anthropic.com/institute/recursive-self-improvement)
- [How GPT-5.6 fuses frontier intelligence with frontier efficiency — OpenAI](https://openai.com/index/gpt-5-6-frontier-intelligence-efficiency/)
- [GPT-5.6 System Card — OpenAI](https://deploymentsafety.openai.com/gpt-5-6/)
- [GPT-Red: Unlocking Self-Improvement for Robustness — OpenAI](https://openai.com/index/unlocking-self-improvement-gpt-red/)
- [AlphaEvolve — Google DeepMind](https://deepmind.google/blog/alphaevolve-a-gemini-powered-coding-agent-for-designing-advanced-algorithms/)
- [AlphaEvolve: scaling impact across fields — Google DeepMind](https://deepmind.google/blog/alphaevolve-impact/)
- [Accelerating mathematical and scientific discovery with Gemini Deep Think — Google DeepMind](https://deepmind.google/blog/accelerating-mathematical-and-scientific-discovery-with-gemini-deep-think/)
- [Ten advances in mathematics — OpenAI](https://openai.com/index/ten-advances-in-mathematics/)
- [Claude and the Riemann zeta function — Anthropic](https://www.anthropic.com/research/riemann-zeta)

### 学术研究

- [AI Research Agents Narrow Scientific Exploration — Tang & Yang, 2026](https://arxiv.org/abs/2605.27905)
- [Contemporary AI lacks the imagination to diverge or negate in science — Bao et al., 2026](https://arxiv.org/abs/2606.08251)

### 近期新闻 / 行业信号

- [梁文锋 3 小时 44 分钟闭门会聊了什么？— 每日经济新闻](https://www.nbd.com.cn/articles/2026-07-23/4504670.html)
- [Google shakes up AI leadership as DeepMind chief shifts role — Reuters](https://www.reuters.com/business/google-shakes-up-ai-leadership-deepmind-chief-shifts-role-2026-08-05/)
- [Where Did All the Computer-Science Professors Go? — The Atlantic](https://www.theatlantic.com/technology/2026/07/ai-companies-hiring-academics/688002/)

### 历史文章

- [AI 能大量生产方向，但还不会判断什么重要](https://marktian-long.github.io/tools/blog/posts/automated-research.html)
- [让 AI 写代码这件事，为什么到硬件就不行了](https://marktian-long.github.io/tools/blog/posts/ai-coding-hardware.html)
- [从模糊到确定：人机边界是怎么移动的](https://marktian-long.github.io/tools/blog/posts/human-ai-boundary-shift.html)
- [模型跑出了测量边界，评测体系跟不上了](https://marktian-long.github.io/tools/blog/posts/ai-benchmark-failure.html)
