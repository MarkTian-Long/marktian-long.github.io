# 已经有知识库了，企业 AI 为什么又开始做 Wiki？

> Wiki 并不是知识库或 RAG 的替代品。更值得关注的变化是：当 AI 开始长期参与工作，知识产品除了让模型“找到资料”，还开始尝试管理已经形成的知识怎样被确认、更新和继续复用，而今天不同产品口中的 Wiki，远不是同一种东西。

---

最近一段时间，我在几个原本不太相关的场景里反复碰到一个其实很老的词：**Wiki**。企业 AI 的产品交流里开始有人讨论 Wiki；一个还在学校做研究的朋友也提到实验室在搭自己的 Wiki；再往外看，企业知识产品、Karpathy 的 LLM Wiki，以及最近讨论 Agent 经验积累的 WikiSkill，也都把 Wiki 放到了核心位置。

这反而让我有点困惑。Wiki 明明不是一个新概念，Confluence、Notion 这样的团队知识工具已经存在很多年；企业 AI 这几年又已经建立起知识库和 RAG。**为什么现在不同地方又同时开始谈 Wiki？更重要的是，他们说的到底是不是同一件事？**

继续往下看以后，首先需要拆掉一个容易混淆的前提：这些场景里的 Wiki 并不是同一种产品。真正值得关注的，也许不是“Wiki 又火了”，而是 AI 正在重新改变一件 Wiki 三十年前就开始解决的事情：**长期协作产生的知识，怎样不随着一次讨论或任务结束而散掉，又怎样在现实继续变化时保持有效。**

## 一、Wiki 不是新东西，但今天被放在一起讨论的产品并不是一回事

Wiki 最早可以追溯到 Ward Cunningham 在 1995 年创建的 WikiWikiWeb。Ward 后来回顾 Wiki 这个名字时也确认，第一版运行在 Web 上的 WikiWikiWeb 就是在 1995 年出现的。[Ward Cunningham：Correspondence on the Etymology of Wiki](https://c2.com/doc/etymology.html) Computer History Museum 则把 WikiWikiWeb 放在 Web 重新获得协作编辑能力的历史脉络里：它让共享知识不再只是被阅读，也可以被参与者继续修改和扩展。[Computer History Museum 对 WikiWikiWeb 的历史回顾](https://www.computerhistory.org/makesoftware/exhibit/wikipedia/)

所以传统 Wiki 从一开始就不只是“存文档”，而是在**降低多人共同沉淀和维护知识的成本**。这一点到今天都没有变，变化的是谁在参与维护、知识从哪里产生，以及最后除了人之外，是不是还有 Agent 在持续消费这些知识。

今天和 Wiki 放在一起讨论的产品与研究，大致可以看到几种不同方向。下面是本文为了分析产品边界做的归纳，并不是行业标准分类，也不意味着这些厂商都把自己定义成对应类型。

| **本文分析形态** | **主要管理什么** | **核心产品问题** | **代表形态 / 案例** |
|---|---|---|---|
| 协作型 Wiki | 团队页面 | 怎么共同维护知识 | Notion Wiki |
| Agent 文档型 Wiki | 可检索文档 | 怎么让 Agent 复用资料 | 腾讯云 Wiki |
| AI 维护型知识产品 | 知识形成与有效性 | 怎么减少知识整理和维护成本 | Slite、Atlassian |
| 认知积累型 Wiki | 已综合的认识 | 怎么避免反复从头推导 | LLM Wiki |

Notion 今天的 Wiki 仍然很接近传统产品心智：页面可以有负责人（Owner），也可以被标记为已验证（Verified）并定期重新确认。它关注的是一群人怎样共同维护一份可信知识。[Notion：Wikis & verified pages](https://www.notion.com/en-gb/help/wikis-and-verified-pages)

企业 AI 产品里的 Wiki 已经出现不同方向。腾讯云公开的“Wiki 知识库”更接近把团队文档加工成可供 Agent 检索和引用的知识资产；Slite、Atlassian 则开始让 AI 进一步参与知识形成和维护，例如从实际工作变化中发现文档过期，或者把反复出现的问题整理成知识草稿。这里前者是腾讯云自己的产品定位，后两者则是本文从实际产品职责出发做的分析。[腾讯云：管理 Wiki 知识库](https://cloud.tencent.com/document/product/1813/134587) [Slite：The self-maintaining knowledge base](https://slite.com/changelog/the-self-maintaining-knowledge-base) [Atlassian：Manage knowledge bases with Rovo](https://support.atlassian.com/jira-service-management-cloud/docs/manage-knowledge-bases-with-rovo/)

研究端又走得更远。Karpathy 的 LLM Wiki 想把模型已经反复综合过的认识长期留下，而不是每次提问都从原始资料重新推导。WikiSkill 论文明确受 LLM Wiki 启发，但把重点从多来源资料的综合，转到了 Agent 执行经验的积累：它把多次执行中形成的知识持续保留下来，再让后续 Skill 更新建立在这些累计知识之上。两者都强调持久积累，但知识对象和下游用途并不相同。[Andrej Karpathy：LLM Wiki](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f) [WikiSkill 论文](https://arxiv.org/abs/2608.27454)

**所以今天围绕“AI Wiki”的讨论还没有收敛成一个边界统一的产品品类。**真正叫 Wiki 的产品里，既有传统协作空间，也有 Agent 文档资产；与此同时，相邻的 AI 知识产品又出现了两种值得关注的新变化：一类让 AI 参与知识的持续维护，另一类尝试把已经完成的综合理解长期积累下来。它们正在靠近，但还不是同一种产品。真正值得继续追的是两者共同暴露的问题：AI 不只在查资料，也开始参与知识的形成、积累和维护。

## 二、知识库已经解决了什么，为什么还会有新问题？

企业 AI 最早遇到的知识问题其实很直接：模型不知道公司的东西。制度、产品资料、项目文档和内部经验不会完整存在于模型训练数据中，而且还会持续变化，所以知识库和 RAG 首先解决的是把企业自己的资料组织起来，在需要时找到相关内容交给模型。

我之前在 [《RAG 的演进：从“被动检索”到“主动信息系统”》](https://marktian-long.github.io/tools/blog/posts/rag-evolution.html) 里讨论的主要就是这一层：一次向量相似度搜索并不等于真正找到业务上需要的信息，检索可以继续变得更主动，通过多步寻找和验证逐渐接近正确证据。新文章并不否定这个判断，而是在它后面继续问一步：**即使检索已经越来越聪明，所有已经做过的综合判断，都应该在下一次问题里重新做一遍吗？**

假设一条业务规则散落在五份材料里：一份旧制度、一份新制度、两次会议结论，再加上一条特殊情况的例外说明。一个好的知识库可以把这些材料找出来，一个好的 Agent 也可以经过多步检索判断哪份更新、哪些互相矛盾，最后形成答案。但第二天另一个人问一个非常接近的问题时，如果系统仍然要重新走完同样几步，过去那次理解就只产生了 Output，没有产生积累。

这正是 Wiki 开始显出另一层产品意义的地方。知识库首先回答的是“这次应该找到哪些资料”，而一部分新的 Wiki 思路继续追问“这些资料已经反复被理解之后，我们目前到底知道什么”。两者并不冲突。尤其是实时、权威或高风险事实，最终仍可能需要回到原始来源核对；区别只在于，**有些需要多次跨来源综合的认知，未必值得每次都从零计算。**

## 三、Wiki 如果要独立存在，真正多管理的是什么？

如果 Wiki 只是把现有知识库内容换一种目录或者页面方式展示，它当然也可能改善使用体验，但这还不足以说明为什么需要一个新的产品对象。真正让我觉得 Wiki 和知识库可能出现边界的地方，是产品开始从管理原始资料，进一步尝试管理一份**当前知识**。

下面这张表是本文为了理解产品职责做的分析，不代表“知识库”和“Wiki”存在行业统一、互斥的定义；现实产品完全可以把两边能力放在同一个模块里。这里的“知识库”特指企业 AI 产品里以文档接入、解析和检索为主的知识库（Knowledge Base）模块，不是对所有传统知识库产品的定义。

| **产品问题** | **知识库更关注** | **Wiki 如果独立存在，更应关注** |
|---|---|---|
| 管理对象 | 原始资料 | 已形成的知识 |
| 任务链位置 | 输入 / 检索侧 | 两次任务之间的沉淀侧 |
| 用户主要动作 | 接入、查找 | 确认、修正、维护 |
| AI 主要作用 | 找到相关资料 | 综合并更新已有认识 |
| 来源变化后 | 更新资料 / 索引 | 判断哪些认识需要重审 |
| 可信问题 | 来源是否可靠 | 当前认识是否仍成立 |

这并不是简单的“事前 / 事后”二分。Wiki 往往在一次工作之后形成或更新，但它真正的价值，是让上一次工作的沉淀成为下一次任务开始前已经存在的资产。换句话说，知识库更偏输入侧，Wiki 更偏沉淀侧，而沉淀下来的知识下一次又会重新回到输入侧。

这里真正重要的不是 Wiki 这个名字，而是任务发生了变化。**“找到正确资料”和“维护正确知识”不是完全相同的产品问题。**

前者的典型错误是漏掉正确来源，后者会出现一组新的问题：两份权威资料冲突时怎么办？一条由 AI 综合出的结论是谁负责？原始制度已经更新而 Wiki 还没改时，到底相信谁？人工确认过的内容，下一次 AI 重新综合时能不能直接覆盖？

一旦 AI 开始生成一个不完全等于任何一份原始资料的新内容对象，产品要管理的就不只是搜索结果，而是这个新知识本身的生命周期。

## 四、为什么一个三十年前的问题，在 AI 时代重新变重要了？

如果 Wiki 从诞生起就在解决“知识怎样持续维护”，为什么今天又值得重新讨论？我现在更倾向于把公开产品里出现的变化理解为两股力量同时发生：**AI 开始降低知识维护的部分成本，而 Agent 又可能提高过时知识被重复消费的代价。**

传统 Wiki 第一次降低的是人的维护门槛：看到问题的人可以比较容易地直接修改共同页面。但“可以修改”不等于“知识会自动保持正确”。项目结束时写一篇复盘有明确产物，半年以后主动回来检查它是否仍然有效，却是一项长期、分散而且很难被感知收益的工作。

Slite 和 Atlassian 展示了 AI 进入知识生命周期的两种方式：Slite 会对照连接的真实工作来源发现文档漂移，起草修改后交给人确认；Rovo 则可以把已解决工单和反复出现的问题整理成知识文章草稿。它们不能证明行业已经形成统一路线，但至少说明一些知识产品开始让 AI 参与“知识怎么形成、怎么更新”，而不只是“怎么被检索”。[Slite：The self-maintaining knowledge base](https://slite.com/changelog/the-self-maintaining-knowledge-base) [Atlassian：Manage knowledge bases with Rovo](https://support.atlassian.com/jira-service-management-cloud/docs/manage-knowledge-bases-with-rovo/)

Slite 还提出了一个值得参考的厂商判断：过去一份过时文档主要影响碰巧读到它的人，现在同一份文档还可能被多个下游 Agent 反复读取。这个说法不能直接外推为所有企业的共同现状，但它提醒了一个产品风险——自动化消费者越多，错误知识可能被复用得越快。[Slite：为什么过时知识在 Agent 时代更麻烦](https://slite.com/learn/self-maintaining-knowledge-base-guide)

因此，我觉得比“Wiki 又火了”更值得关注的是：**三十年前，Wiki 降低了人共同维护知识的成本；今天 AI 可能继续降低持续维护知识的成本，而 Agent 又让知识是否仍然有效变得更重要。**

这个逻辑也让我想到 Memory。我之前在 [《AI 产品记忆系统：从四阶段演进到怎么做对》](https://marktian-long.github.io/tools/blog/posts/memory-system.html) 中已经碰到相似问题：当 AI 从一次性交互进入长期关系，记忆也不能只追求“留下更多”，还要处理重复、冲突和过时信息。本文语境下，Memory 更偏“哪些状态、偏好和历史仍值得带回来”，Wiki 更偏“关于某个主题，我们目前知道什么”；两者共享的难题都是：**持久化真正困难的不是把东西存下来，而是判断它什么时候仍然值得相信。**

## 五、生成只是开始，难的是半年以后还对不对

让模型读几十份资料，第一次生成一个目录清楚、结构完整的 Wiki，今天已经不是最难的部分。真正进入长期使用以后，问题会集中到“知识变化时怎么办”：新制度与旧结论冲突，是直接覆盖还是提醒复核？一条结论的来源失效，要不要连带降权？人工修改能不能被 AI 下一次重算覆盖？两个部门本来就存在不同口径，是强行合成一个答案还是保留分歧？

这些问题最后会落到一些并不新潮、但很关键的产品能力上：来源与责任、验证与版本、冲突与过期、权限与回滚。Notion 给 Wiki 页面设置负责人和可过期的验证状态；Slite 则让 Agent 负责发现和起草，但改动要经过人工审批，并展示变更差异。这是两种具体产品选择，并不意味着“人审”永远是唯一正确答案，但它们都说明了一件事：共享知识一旦会成为后续人和 Agent 的输入，**修改知识本身就需要成为一个被治理的动作。** [Notion：Wikis & verified pages](https://www.notion.com/en-gb/help/wikis-and-verified-pages) [Slite：The self-maintaining knowledge base](https://slite.com/changelog/the-self-maintaining-knowledge-base)

所以我现在判断一个 AI Wiki 时，不会先看它能不能快速把一批资料整理成一份结构清楚的知识结果，而会继续看：来源能不能追溯，知识过期怎么被发现，AI 与人的修改谁优先，变化会不会传到下游，以及错误以后能不能退回来。**如果系统只有生成，却没有维护的闭环，它更像一次更聪明的知识整理，而不是一个真正长期工作的知识产品。**

## 六、不是所有长期信息，都应该交给 Wiki 管

讨论到这里，Wiki 很容易继续扩张成一个含糊的概念：只要某些信息值得长期留下，就都可以塞进 Wiki。但我重新看了一遍自己长期使用的 Personal Harness，反而越来越不认同这种做法。

真实使用一段时间以后，我没有把所有长期信息收进一个越来越大的 Memory 或 Wiki，而是逐渐让不同信息承担不同作用。有些东西是实时事实，下一次应该重新访问真实系统；有些是项目进度、用户偏好和历史状态，更接近 Memory 或 State；还有一些是跨多份资料反复形成、未来仍会随着新证据修正的认识，这更接近本文所说的认知积累型 Wiki。

至于“遇到这类问题以后应该怎么做”，如果一种方法经过反复验证，它可能进一步沉淀成 Rule、SOP 或 Skill。但这已经是另一类资产，不需要由 Wiki 一起承担。我之前在 [《Skill 系统的本质：不是 Prompt 工程化，是 Harness 的支撑》](https://marktian-long.github.io/tools/blog/posts/skill-system-and-harness.html) 里专门讨论过这类可复用方法。

回头看，我自己的 Harness 里也没有一个等价于 Wiki 的独立模块。真正和本文所说 Wiki 比较接近的，是**总览里的当前判断、跨项目可复用的知识，以及这些判断随着新材料继续更新的机制**。[《我为什么开始给自己搭 Harness？》](https://marktian-long.github.io/tools/blog/posts/personal-harness.html) 里讨论的 Harness 范围更大，它还需要处理状态、方法、工具以及不同任务应该调用什么。

两者最大的区别可以压缩成一句：**Wiki 更以知识为中心，Harness 更以任务为中心。**前者主要回答“关于这个主题，我们现在知道什么”，后者最终要回答“为了把眼前这个任务做好，现在应该调用什么”。因此，一个 Harness 完全可以没有叫 Wiki 的模块，却通过已有机制实现其中一部分知识沉淀；反过来，一个 Wiki 也没有必要承担整个长期 Agent 系统的组织和治理。

所以，Wiki 不是“所有长期资产”的容器。它更像长期协作体系里负责沉淀和维护**“我们目前知道什么”**的那一部分。把这个边界守住，比给所有值得保存的东西找一个统一名字更重要。

## 七、所以，一个企业什么时候真的需要 Wiki？

回到最开始的问题，我现在并不认为“知识库 + Wiki”会成为所有企业 AI 产品的一种固定标准配置。如果团队当前最大的问题仍然是资料分散、权限复杂、AI 找不到正确来源，那么先把连接、权限、检索、引用和实时数据这些基础能力做好，通常比再增加一个 Wiki 模块更重要。

真正出现第二层需求，是当同一批资料开始被不同的人和 Agent 反复使用，每一次都在重复综合相同背景，而且团队逐渐需要一个共同答案：“关于这个主题，我们现在到底采用什么认识？”再往后，如果这些知识本身还会快速变化，并且被越来越多下游 Agent 消费，问题才会继续变成“谁来保证这份认识一直有效”。

因此，我现在会用一个很简单的产品判断来区分两种需求：如果用户主要需要的是**让 AI 找到这些资料**，知识库可能已经足够；如果用户开始需要管理**我们目前知道什么、依据是什么、谁确认过、什么时候需要重新验证，以及变化以后哪些已有知识会受到影响**，那么一个独立 Wiki，或者无论厂商最后给这层能力取什么名字，才开始出现真正的产品空间。

这也是为什么我不太愿意把 Wiki 写成“RAG 的下一代”。知识库、Memory、Wiki 和 Skill 解决的是不同问题，而更外层的 Harness 负责把这些能力组织进具体任务。AI 从一次性回答进入长期工作以后，更大的变化也许不是系统终于可以“记住更多”，而是**一次任务除了产生结果，还开始有机会产生下一次工作的起点。**

三十年前，Wiki 让一群人可以更容易地共同修改一份知识；今天，AI 可能继续降低发现、整理和维护知识的成本。但 Wiki 最古老的那个问题反而没有消失：下一次有人，或者 Agent，再来使用这份知识的时候，它是否仍然代表我们现在值得相信的东西。

---

## 参考资料

### 一手产品与官方资料

- [Notion — Wikis & verified pages](https://www.notion.com/en-gb/help/wikis-and-verified-pages)
- [腾讯云 — 管理 Wiki 知识库](https://cloud.tencent.com/document/product/1813/134587)
- [Slite — The self-maintaining knowledge base](https://slite.com/changelog/the-self-maintaining-knowledge-base)
- [Slite — The self-maintaining knowledge base: what it is and why every team needs one](https://slite.com/learn/self-maintaining-knowledge-base-guide)
- [Atlassian — Manage knowledge bases with Rovo](https://support.atlassian.com/jira-service-management-cloud/docs/manage-knowledge-bases-with-rovo/)

### 一手观点与研究资料

- [Andrej Karpathy — LLM Wiki](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f)
- [WikiSkill: Compiling Agent Experience into Persistent Knowledge for Skill Evolution](https://arxiv.org/abs/2608.27454)

### 历史资料

- [Ward Cunningham — Correspondence on the Etymology of Wiki](https://c2.com/doc/etymology.html)
- [Computer History Museum — Wikipedia / WikiWikiWeb history](https://www.computerhistory.org/makesoftware/exhibit/wikipedia/)

### 历史文章

- [《RAG 的演进：从“被动检索”到“主动信息系统”》](https://marktian-long.github.io/tools/blog/posts/rag-evolution.html)
- [《AI 产品记忆系统：从四阶段演进到怎么做对》](https://marktian-long.github.io/tools/blog/posts/memory-system.html)
- [《Skill 系统的本质：不是 Prompt 工程化，是 Harness 的支撑》](https://marktian-long.github.io/tools/blog/posts/skill-system-and-harness.html)
- [《我为什么开始给自己搭 Harness？》](https://marktian-long.github.io/tools/blog/posts/personal-harness.html)
