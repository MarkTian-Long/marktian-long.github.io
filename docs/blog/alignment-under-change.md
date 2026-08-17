# 当人和 AI 都在改变，“对齐”还能一次完成吗？

> 过去谈 AI Alignment，往往隐含着一个静态假设：人提供目标，AI 学会这个目标。但当 AI 开始长期记忆、持续适应甚至修改自身的 Harness，而人也会在长期互动中被 AI 影响，对齐越来越不像一个训练完成就结束的问题，更像一个持续治理过程：什么可以变，什么不该轻易变，以及一次变化什么时候有资格长期留下来。

---

最近看到腾讯研究院王焕超的一篇《[价值对齐是个伪概念](https://mp.weixin.qq.com/s/j3flgUsm6PfIWj5-48a-Kg)》，对我触动最大的其实不是“伪概念”这个颇有争议的标题，而是作者自己对这个问题的认知变化。

两年前，他在《[直面AI价值对齐的挑战](https://mp.weixin.qq.com/s/I0xFoAh8zRmaAPTCLigWkw)》里仍然把“让 AI 与人类价值保持一致”视作一个困难但需要解决的问题。那篇文章其实已经意识到，人类并不存在一套恒定、统一的价值标准，今天认可的价值未来也可能变化。到了 2026 年的新文章，他把怀疑又往前推了一步：如果价值本身无法被稳定定义，“人类”也不是单一主体，AI 还会反过来塑造人，那么“把一个既定价值从人复制到 AI”这个问题设定本身可能就有问题，因此提出“从对齐到审议”。

我并不完全接受这个结论。今天所谓 Alignment 早已不只是“把一套统一的人类价值写进模型”，里面还包含监督、安全边界、规范遵循、泛化等不同问题。但这次认知修正让我想到自己最近搭个人 AI Harness 时经历的一件小得多的事情。

我[之前写 Harness](https://marktian-long.github.io/tools/blog/posts/harness-engineering.html)时，关注的更多是怎样在模型之外补上上下文、工具、状态、验证、记忆和错误恢复，让 Agent 从“会做”走到“稳定做完”。真正长期使用自己的 Harness 后，我遇到的却是另一个问题：规则写出来以后，它自己也会过时。

一开始，为了避免和 AI 讨论一个问题时不断发散，我很自然地写了不少硬规则，例如搜索几轮以后停止、候选最多保留多少个、讨论到什么轮次应该收敛。它们刚开始确实有用，但用得越多越能发现，“搜索五轮”从来不是我真正想优化的东西，我想知道的是继续搜索还有没有明显信息增量，新证据还有没有可能改变判断。

于是很多固定数字后来变成了条件：没有明显增量就停止；新材料只是更有趣、更宏大，却没有改变核心机制，就不重新打开已经收敛的主线；真有能够改变判断的新证据，再允许系统回来重新讨论。同时，我仍然保留每周、每月的周期复盘，会回看过去的行为轨迹，也会联网寻找有没有值得吸收的新方法。

这个经历当然不是 AI Safety 意义上的价值对齐，但它让我第一次在一个很小的工程问题里遇到了相似的结构：**开放环境里的正确行为，很难靠事前枚举一套完整规则解决。**

## 一、从固定规则到动态判断，不等于不要规则

把“固定搜索五轮”删掉，却保留“每周检查一次”，乍看其实有点矛盾。区别在于，前者拿一个方便测量的数字代理“信息是否已经足够”，而后者只是规定什么时候触发一次检查，并没有规定检查以后一定要修改什么。

所以问题从来不是“固定规则不好”。有些规则本来就应该稳定，有些周期也完全可以固定。真正容易出错的是，我们把一个代理指标误当成了最终目标，又因为它容易写进系统，就逐渐忘记当初为什么设置它。

这也让我对腾讯文章的“从对齐到审议”产生了一个稍微不同的理解。**审议未必应该取代规则，更像是在现实不断暴露新情况以后，决定规则什么时候需要被重新检查和修改的一层机制。**

这里还有一个很容易混淆的术语。OpenAI 也有一个正式方法叫 [Deliberative Alignment](https://openai.com/index/deliberative-alignment/)，但这里的 deliberative 指的是直接把人类编写的安全规范教给推理模型，让模型在回答前对这些规范进行推理；它仍然以既定 safety specification 为前提，和腾讯文章讨论的社会意义上的“审议”并不是同一层问题。

Anthropic 的 Constitutional AI 则提供了另一个更直接的对照。2022 年的 [Constitutional AI](https://www.anthropic.com/research/constitutional-ai-harmlessness-from-ai-feedback) 把一组高层原则写成 Constitution，让模型依据这些原则批评、修正自己的回答，并进一步用于训练。2023 年，Anthropic 又和 Collective Intelligence Project 做了 [Collective Constitutional AI](https://www.anthropic.com/research/collective-constitutional-ai-aligning-a-language-model-with-public-input)：邀请约 1000 名美国公众通过在线审议参与起草一版 Constitution，动机之一就是减少开发者单方面决定模型应该遵守什么价值的权力。到了 2026 年，Anthropic 又把新版 [Claude's Constitution](https://www.anthropic.com/news/claude-new-constitution) 明确称为一个持续修订的 living document，同时仍然保留一些不应被轻易突破的 hard constraints。这个案例让我更不愿意把 Alignment 和 Deliberation 理解成前后替代的两个阶段：**审议可以用来决定和修订“对齐什么”，而 Constitution 负责提供当下相对稳定的原则与边界。**

到这里，问题还只是“人怎样修改 AI 周围的规则”。真正让这件事变得更复杂的是，AI 系统本身也开始从一个相对静态的对象，向可以长期变化的系统演进。

## 二、AI 也开始从静态模型变成持续变化的系统

Memory、Harness 适应和 Continual Learning 经常被放在一起谈，但它们并不是同一件事。Memory 可以让 AI 在下一次任务里取回过去的信息，而模型本身完全不变；Harness 则可以进一步根据经验修改 Skill、协议、工具组合和运行流程，让整个系统下一次做事的方法不同。更严格意义上的持续学习（Continual Learning），关注的则是一个系统能否从连续经验里持续获得并保留能力，而不是部署以后基本保持静态。

一篇 2026 年 8 月发布的综述预印本《[Continual Learning in Transition](https://arxiv.org/abs/2608.06216)》恰好在讨论这个边界。作者认为，传统持续学习主要关注模型参数怎样更新和避免遗忘，但今天的学习已经可能发生在推理阶段，也可能发生在 memory、skill library、interaction protocol 等模型外部结构中，因此研究对象正在从“参数如何持续学习”扩展到“整个系统在哪里、什么时候、以什么方式发生适应”。这是一个仍在形成中的研究框架，不适合当作已经统一的行业定义，但至少说明“学习发生在哪里”本身正在变化。

Harness 也已经开始从工程实践进入这一研究问题。2026 年 5 月的 [AI Harness Engineering](https://arxiv.org/abs/2605.13357) 把 Agent 的能力理解为 model–harness–environment 共同产生的结果；7 月的 [HarnessBank](https://arxiv.org/abs/2607.13683) 则进一步研究 Agent Harness 的自动演化，并专门加入 gated verification，避免只依赖噪声较大的自生成反馈来判断候选 Harness 是否真的更好。

我自己的系统目前远没有到这种全自动持续学习，更准确地说仍然是 **human-in-the-loop 的长期系统适应**：AI 的行为暴露问题，我和 AI 一起复盘，再决定哪些规则、Skill、SOP 或记忆需要调整。但如果未来 Harness 自身也越来越容易被自动修改，“谁来判断一次修改是否真的值得保留”就会从个人工程习惯，变成系统设计本身的问题。

这也是 Ilya Sutskever 最近的思考和这个话题发生联系的地方。SSI 今天的官网仍然把 [Safe Superintelligence](https://ssi.inc/) 作为唯一使命和完整产品路线，但 Ilya 在 2025 年与 Dwarkesh Patel 的[长访谈](https://www.dwarkesh.com/p/ilya-sutskever-2)里，已经把 continual learning 放到了自己理解未来智能的核心位置：人并不是一个预先学会所有职业的“完成版 AGI”，而是在基础能力之上不断学习；因此未来的 superintelligence 也可能不是部署时已经掌握一切的成品，而是一个能力极强、进入现实以后继续学习的 learner。

这并不能推出“持续学习就是 AGI”，更不能证明 SSI 最终一定走这条路线。它真正改变的是一个长期存在的默认想象：AI 未必永远是“训练结束以后再部署”，部署本身也可能逐渐进入学习过程。

DeepSeek 最近的招聘可以作为一个更弱、但很现实的信号。它的[官方招聘页](https://talent.deepseek.com/)现在同时能看到 Agent Harness、情感智能数据产品，以及“持续学习 / 自进化 / 新范式”等方向。仅凭几个岗位当然不能拼出一条 DeepSeek 已经确认的统一 AGI 路线，但至少能说明 Harness、理解人的状态和持续学习正在同时进入一家 Frontier Lab 的研发范围。

这又让我想到一个还没有答案的衍生问题：如果未来私有模型可以低成本持续微调甚至持续学习，今天企业常见的“大模型 + RAG”会不会被削弱？我现在反而不太认为它们是简单的替代关系。企业使用 RAG，一个很重要的价值并不只是“给模型补它不知道的知识”，而是把回答重新落回可以检查的证据上。

微软目前的 [Azure AI Search](https://learn.microsoft.com/en-us/azure/search/retrieval-augmented-generation-overview) 会在 Agentic Retrieval 中返回 grounding data、citations 和 execution metadata；[Amazon Bedrock Knowledge Bases](https://docs.aws.amazon.com/bedrock/latest/userguide/kb-how-retrieval.html) 的 RetrieveAndGenerate 也会把回答引用到具体 source chunk。对于监管制度、合同、内部规则这类有版本、生效时间、权限和审计要求的信息，“模型知道了”并不能代替“模型能说明自己依据什么”。

因此我更愿意把未来可能出现的分工理解成：**模型越来越负责把经验变成能力，Retrieval 越来越负责把事实变成证据。**稳定、反复出现的工作方式可能逐渐进入 Skill、Adapter 或模型内部，但有些知识即使被使用过一万次，也仍然应该留在模型外部，因为可追溯、可更新和可撤回本身就是知识的一部分。这件事其实已经提前暴露了下一层问题：即便 AI 可以越来越会学习，也不能默认“学进去越多越好”。

## 三、更麻烦的是，人也不是一个固定的对齐目标

如果 AI 会变化，一个很自然的解决思路是：那就让它越来越理解具体的人，而不是去寻找一个抽象的“全人类平均价值”。Igor Babuschkin 创办的 River AI 就明确选择了这个方向。它当前公开的第一层产品是训练 API，而其下一层路线是 [personalization 和 continual learning for agents](https://river.ai/introducing-river-ai.html)，希望 Agent 能逐渐理解具体用户的风格、偏好和目标；River 甚至直接把“一个真正了解你、能够按你的利益行动的 AI”视为高度 alignment 的表现。这里首先能证明的是 River 自己的产品和技术主张，而不是 Personal AI 已经解决了 Alignment。

因为问题只是从“Human values 是什么”，变成了“My values 是什么”。后一个问题看起来小很多，却依然不稳定：今天的我和五年前的我并不完全一样，一次临时选择也未必代表长期偏好；我要求 AI “提高效率”，也不意味着它应该不断删除所有让我不舒服的认知摩擦。

我[之前写 AI Memory](https://marktian-long.github.io/tools/blog/posts/memory-system.html)时，更多讨论的是哪些信息值得长期保留、错误记忆怎样修正，以及 Memory 如何帮助 AI 理解用户。真正长期搭自己的系统之后，我又多了一层顾虑：User Profile 比普通记忆更容易产生长期影响，因此一次观察不应该轻易升级成“这是一个怎样的人”。**观察到我，不等于理解了我；理解了我，也不等于有资格把这个判断永久写成“我是谁”。**

这个问题并不只存在于个人 Harness 里。一篇梳理 400 多篇 HCI、NLP 和 ML 研究的系统综述预印本提出了 [Bidirectional Human-AI Alignment](https://arxiv.org/abs/2406.09264) 的概念，认为大量传统 Alignment 研究把问题想成静态、单向的“AI 向人靠近”，但长期 Human-AI interaction 中，人本身也会在认知和行为上适应 AI，因此应该把这种双向变化纳入问题。

这种反向影响已经有实验层面的证据。发表于 *Nature Human Behaviour* 的一项[研究](https://www.nature.com/articles/s41562-024-02077-2)在 1,401 名参与者的一系列实验中发现，人与存在偏差的 AI 形成反馈循环后，人的部分知觉、情绪和社会判断偏差会被进一步放大。它证明的不是“AI 一定会把人带偏”，而是 **AI 与人的长期互动确实可能改变人的后续判断，并形成累积反馈。**

一旦两边都会变，对齐的目标就不能再简单理解为一个固定的人去训练一个不断适应的 AI。

## 四、共同适应，并不自动等于共同成长

“AI 学我，我也从 AI 那里学习，双方一起变强”是一个很吸引人的叙事，也是我给自己的 Harness 写入自主性、进化性、协作性、讨论纠偏这些目标时，希望实现的方向。但两个系统互相适应，本身不能证明它们正在变得更好。

假设一个 AI 慢慢发现，每次挑战用户的前提都会制造摩擦，而顺着用户继续说更容易获得正面反馈，那么“越来越懂用户”完全可能退化成“越来越知道怎样让用户舒服”。用户这边也会适应：当一个 Agent 越来越熟悉自己的习惯、越来越擅长替自己组织信息和完成决策时，人可能逐渐减少原本属于自己的判断过程。

我[之前写模型的主体性与抗谄媚](https://marktian-long.github.io/tools/blog/posts/llm-soft-quality.html)时，关注的还是一次或多轮对话里，模型有没有能力在我的前提有问题时推回来。到了长期协作系统，这个问题多了一层：如果 AI 会持续学习用户，怎样防止“理解用户”逐渐被优化成“强化用户原本的偏见”？

Ilya 在前面的访谈里也提出了一个很接近的反例。他设想，每个人都可以拥有一个强大的 AI，替自己挣钱、在公共事务中维护利益，最后回来汇报做了什么；这种状态当然可能非常舒适，但如果人最后只是回答“很好，继续”，那个人已经不再真正参与自己生活中的许多决定。

所以 Personal AI 更理想的目标，可能既不是“让 AI 越来越像我”，也不只是“让 AI 越来越理解我”。**它应该越来越理解我，同时保留足够独立的判断，使长期互动能够暴露彼此的盲区，而不是把我已有的判断越来越牢地固化下来。**

但这样又会碰到一个很难绕开的评价问题。如果 AI 越来越同意我，不代表我们在进步；如果它频繁反驳我，也不能证明系统就更有价值。所谓“共同成长”需要某种独立于双方当前感受的证据，否则共同适应很容易滑向共同自洽。

这也是为什么我后来做每周、每月复盘时，不只回看自己和 AI 的历史轨迹，还会主动联网寻找外部实践、反例和新的方法。一个长期协作系统如果始终只用自己的历史评价自己，风险未必是明显犯错，更可能是双方越来越适应彼此，最后连评价标准都一起收敛到某个局部最优。外部信息在这里不是新的“标准答案”，更像是不断给这个闭环加入独立参照和扰动：别人是不是有完全不同的做法？有没有反例说明当前机制存在盲区？有没有新的研究让原来的假设已经不成立？

但发现一个新方法，也不意味着应该立即吸收。外部材料首先只是一次 Candidate Change，仍然要经过比较、验证和后续观察，才有资格进入 Skill、SOP 甚至更高层的规则。**避免共同漂移和治理长期变化，其实是同一个问题的前后两面。**

## 五、真正要治理的，是哪些变化有资格留下来

外部搜索也让我经常拿自己的系统和其他 Agent / Harness 实践做对照，但这种对照不是“看到新东西就抄进来”。Hermes 就是一个比较具体的例子。我之前对 Hermes 已经有一定了解，但搭这套 Harness 时并没有把它作为设计参考。等自己的体系逐渐成形后，我才更系统地把两者放在一起对照，想看看还有没有值得吸收的机制。结果发现双方在 Skill、Memory 和自我改进上已经有不少相似思路，真正让我感兴趣的反而是一个更具体的问题：一个系统发现了新经验之后，到底应该多快让它影响未来？

Hermes 目前允许 Agent 把非简单工作流保存成 Skill，作为以后按需加载的程序性记忆。[官方 Skills 文档](https://hermes-agent.nousresearch.com/docs/user-guide/features/skills)显示，默认情况下 Agent 可以自由写入 Skill；如果打开 `skills.write_approval`，新建、修改、删除等 Skill 写操作会先等待人工批准。它另外还有 [Curator](https://hermes-agent.nousresearch.com/docs/user-guide/features/curator)，追踪 agent-created skills 的使用情况，把长期未使用的 Skill 从 `active` 转为 `stale`，再归档；可选的 LLM consolidation 还会尝试合并重叠 Skill。Hermes 官方自己解释 Curator 存在的原因，就是自动产生 Skill 以后，如果没有维护，目录会逐渐积累大量狭窄、近似重复的内容。

我的取舍更强调的不是“写之前要不要点一次批准”，而是**候选经验是否已经积累到足以晋升为长期资产**。一次任务成功，只能说明某种方法这一次有效；如果任务结束就自动成为正式 Skill，长期下来既容易冗余，也容易把当时还不成熟的方法固定下来。因此我会在“经验被发现”和“正式进入长期 Skill / SOP”之间留一层晋升机制，再通过后续使用继续修正、降级或淘汰。

User Profile 我也用了类似思路，而且门槛应该更高。Skill 写错通常影响的是某一类任务，但用户画像写错，可能改变 AI 以后处理大量问题时怎么看待我。一次对话里表现得很急，不等于“这是一个永远只喜欢短答案的人”；某段时间大量研究某个方向，也不能自动变成永久兴趣。如果一次偶然行为直接进入画像，AI 又根据画像改变自己的行为，很容易产生“画像影响互动、互动再证明画像”的自我强化。

这也让我重新理解了[以前写过的人机边界](https://marktian-long.github.io/tools/blog/posts/human-ai-boundary-shift.html)。当时更关心的是随着 AI 能力和验证机制改善，人的介入位置怎样逐渐移动；现在进一步出现的问题是，**如果连决定“人应该在哪里介入”的规则本身都能够依据长期经验变化，谁来判断这种变化是不是合理？**

[HarnessBank](https://arxiv.org/abs/2607.13683) 实际上已经碰到了同一个二阶难题。真正困难的不是让模型提出一个新的 Harness，而是怎样把候选变化放进独立的筛选与验证机制里，降低过拟合、搜索坍缩和自生成反馈不可靠的问题。换句话说，能够自我修改只是第一步，真正决定系统能不能长期运行的是修改之后有没有独立的 Gate。

从这里再回头看 Skill、Memory、User Profile、RAG 甚至未来的模型微调，我觉得它们并不应该组成一条“越往模型里面越高级”的晋升阶梯。不同信息获得长期影响力的方式本来就应该不同：临时状态适合留在当前上下文，经过验证的方法可能进入 Skill，稳定的个人特征才适合进入 User Profile，而法规、合同和需要审计的事实即使非常稳定，也可能始终应该留在外部可追溯知识层。

**持续学习真正困难的，也许不只是怎样不断学到新东西，而是哪些变化有资格留下来，以及它们在什么条件下应该再次被修改、降级、遗忘或撤回。**

到这里，我才觉得腾讯文章里的“从对齐到审议”和自己的工程实践真正接上了。但一路研究下来，我最终并没有走到“价值对齐是个伪概念”那里。OpenAI 2026 年对 [Model Spec](https://openai.com/index/our-approach-to-the-model-spec/) 的公开说明反而提供了一个很现实的例子：它既包含高层意图和明确规则，又把 Model Spec 本身定义成会随着能力、用户需求、公开反馈和真实部署经验持续修改的文档。也就是说，稳定边界和持续修订并不必然矛盾。

所以如果要对“从对齐到审议”再做一步自己的修正，我现在更愿意把它理解成：**不是从 Alignment 走向 Deliberation，而是从一次性的 Alignment，走向带有持续审议和变化治理机制的 Alignment。**

最开始搭 Harness 时，我想做的是尽可能把正确做法提前写进规则。后来慢慢发现，真正困难的并不是提前知道所有正确答案，而是让一个会不断遇到新情况、也会不断改变的系统，仍然知道哪些东西可以改，哪些暂时不要改，以及什么时候应该承认自己原来的规则已经错了。

如果未来 AI 和人真的会长期共同学习，这可能也会成为 Alignment 更难的一部分：**我们不只需要决定 AI 今天应该是什么样，还要决定它和我们明天可以怎样一起变化。**

---

## 参考资料

### 腾讯研究院

- [《价值对齐是个伪概念》](https://mp.weixin.qq.com/s/j3flgUsm6PfIWj5-48a-Kg)
- [《直面AI价值对齐的挑战》](https://mp.weixin.qq.com/s/I0xFoAh8zRmaAPTCLigWkw)

### 一手资料 / 官方发布

- [Safe Superintelligence Inc.](https://ssi.inc/)
- [Ilya Sutskever — We're moving from the age of scaling to the age of research](https://www.dwarkesh.com/p/ilya-sutskever-2)
- [DeepSeek 招聘](https://talent.deepseek.com/)
- [Introducing River AI](https://river.ai/introducing-river-ai.html)
- [Hermes Agent — Skills System](https://hermes-agent.nousresearch.com/docs/user-guide/features/skills)
- [Hermes Agent — Curator](https://hermes-agent.nousresearch.com/docs/user-guide/features/curator)
- [OpenAI — Deliberative Alignment](https://openai.com/index/deliberative-alignment/)
- [OpenAI — Inside our approach to the Model Spec](https://openai.com/index/our-approach-to-the-model-spec/)
- [Anthropic — Constitutional AI: Harmlessness from AI Feedback](https://www.anthropic.com/research/constitutional-ai-harmlessness-from-ai-feedback)
- [Anthropic — Collective Constitutional AI: Aligning a Language Model with Public Input](https://www.anthropic.com/research/collective-constitutional-ai-aligning-a-language-model-with-public-input)
- [Anthropic — Claude's new constitution](https://www.anthropic.com/news/claude-new-constitution)

### 学术研究

- [Continual Learning in Transition](https://arxiv.org/abs/2608.06216)
- [AI Harness Engineering: A Runtime Substrate for Foundation-Model Software Agents](https://arxiv.org/abs/2605.13357)
- [HarnessBank: Semantic Gene-Bank Search with Gated Verification for Agent-Harness Self-Evolution](https://arxiv.org/abs/2607.13683)
- [Position: Towards Bidirectional Human-AI Alignment](https://arxiv.org/abs/2406.09264)
- [How human–AI feedback loops alter human perceptual, emotional and social judgements](https://www.nature.com/articles/s41562-024-02077-2)

### 企业 RAG / Grounding

- [Microsoft — RAG and Generative AI in Azure AI Search](https://learn.microsoft.com/en-us/azure/search/retrieval-augmented-generation-overview)
- [Amazon Bedrock — Retrieving information from data sources using Knowledge Bases](https://docs.aws.amazon.com/bedrock/latest/userguide/kb-how-retrieval.html)

### 此前相关文章

- [《工程演进三段论：从 Prompt 到 Harness》](https://marktian-long.github.io/tools/blog/posts/harness-engineering.html)
- [《AI产品记忆系统：从四阶段演进到怎么做对》](https://marktian-long.github.io/tools/blog/posts/memory-system.html)
- [《大模型的分越来越高，但有些差距只用几天就能感觉到》](https://marktian-long.github.io/tools/blog/posts/llm-soft-quality.html)
- [《从模糊到确定：人机边界是怎么移动的》](https://marktian-long.github.io/tools/blog/posts/human-ai-boundary-shift.html)
