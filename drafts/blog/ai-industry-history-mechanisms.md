---
category: 行业
tags: ["决策框架", "市场格局"]
topics: ["产业史"]
concepts: ["历史类比", "产业阶段", "瓶颈迁移", "通用目的技术", "互补创新", "人类参与边界", "资源生产率"]
share_quote: "产业史更像一组压力测试：哪些机制重新出现了，哪些成立条件已经变化，以及今天真正值得盯住的变量是什么。"
relations: [{"slug":"market-landscape-2026","type":"revises"}]
---

# 看 AI，不要只问它像历史上的哪一年

> 面对 AI，历史最有价值的不是告诉我们“今天对应过去哪一年”，而是帮助我们辨认哪些产业机制会重复、这些机制成立需要什么条件，以及这一次有哪些条件已经变了。我们仍然需要位置感，但这个位置应该足够粗，不应该假装整个 AI 产业在同一时刻、以同一速度前进。

---

这篇文章最直接的触发，是最近看了张小珺和曾鸣关于 AI 产业史的[那场长访谈](https://mp.weixin.qq.com/s/KiN29IcdzkNY_Yo4GJus0w)。曾鸣把 AI 产业化大致分成三个阶段：先让智能逐渐成为可以规模化使用的基础设施，再在基础设施上出现海量应用，最后才可能形成真正属于 AI 范式的原生应用。具体到 2026 年，他的判断是第一阶段已经基本成熟、进入尾声，同时第二阶段开始。这让我重新想一个此前没有想清楚的问题：AI 和工业革命、互联网革命放在一起比较时，我们究竟应该比较什么？是找到一个历史年份，然后顺着历史继续往后推；还是从历史里抽出一些更稳定的机制，再判断这些机制今天是否还成立？

曾鸣自己的历史坐标也变过。他在这次访谈里回顾，前两年还做过“让我们拥抱 Yahoo 吧”的演讲，当时觉得 Yahoo 很快就会出现；到了 2026 年，他反而把位置往前调，认为产业化可能连“浏览器阶段”都还没有真正走到。同一套产业史视角，两年以后，对历史坐标的判断反而前移了。

这种错位感，资本市场也会放大。[Anthropic 2021 年成立](https://www.reuters.com/technology/anthropic-plans-raise-10-billion-350-billion-valuation-wsj-reports-2026-01-07/)，到 2026 年 5 月私募估值已经达到[约 9650 亿美元](https://www.reuters.com/business/anthropic-raises-65-billion-now-valued-965-billion-2026-05-28/)。只看今天，这种速度很容易制造一种“以前从来没有过”的感觉。但互联网早期也出现过类似的资本重估：Yahoo 1994 年成立，到 2000 年互联网泡沫高点时，[市场价值一度超过 1000 亿美元](https://knowledge.wharton.upenn.edu/article/can-verizon-unlock-yahoos-hidden-value/)。这两个数字不能直接等同：按美国 CPI 粗略折算，2000 年的 1000 亿美元到今天大约是 2000 亿美元量级，并不接近 1 万亿美元；[BLS 的 CPI 数据](https://www.bls.gov/news.release/cpi.t01.htm)显示，2000 年全年平均指数约为 172.2，而 2026 年 8 月已到约 335。真正值得比较的不是绝对金额，而是**一个新技术周期可以在很早的时候，就让一家成立只有几年的公司获得极高定价；资本给出的阶段性价格，与产业最终会把最大的价值留在哪一层，是两件不同的事。**

我自己也踩过类似的坑。今年 4 月，我在[《2026 年 AI Agent 市场格局》](https://marktian-long.github.io/tools/blog/posts/market-landscape-2026.html)里写过一句很满的话：“框架大战已经基本结束，赢家已经确定。”当时看到的局部收敛是真的，但现在再看，把某一类 Agent 开发框架的收敛放大成整个 Agent 生态的阶段判断，这个判断推得太远。曾鸣是在重新校准整个产业的历史坐标，我的问题则是把一个子层的成熟度放大成了整个市场的成熟度，但两件事都指向同一个提醒：**历史坐标和阶段判断有用，前提是先选对比较的对象和粒度。**

差不多就在这段时间，我又连续看到两条收购新闻。8 月，[Stripe 宣布已达成收购 OpenRouter 的协议](https://stripe.com/newsroom/news/stripe-agrees-to-acquire-openrouter)，后者已经覆盖 400 多个模型和 80 多家模型供应商；9 月，[NVIDIA 宣布已达成以约 129.3 亿美元收购 Hugging Face 的协议](https://blogs.nvidia.com/blog/nvidia-to-acquire-hugging-face/)，后者已经聚集超过 1800 万开发者和 300 多万个模型。我最初对这两条新闻感兴趣，并不是因为它们“像历史上的谁”，而是另一个问题：**为什么模型能力还在快速进步的时候，负责发现、选择、调用和路由这些能力的中间层，也开始变得越来越重要？** 再回头看 Yahoo、浏览器和 Google，这个问题比寻找某个精确历史年份更值得追下去。

## 一、从“Yahoo 时刻”往回看，真正重复的是什么？

先看曾鸣为什么会想到 Yahoo。在他的类比里，互联网早期先经历了接入和内容生产门槛下降，浏览器让更多人更容易访问 Web；网站数量增加以后，新的问题开始从“网上有没有东西”变成“我应该去哪里、怎样找到需要的信息”。Yahoo 的目录、导航和门户，正是在这种供给增长之后获得价值。

1998 年，Brin 和 Page 在介绍 Google 的论文里也直接写到，[Yahoo 这类人工维护目录](https://research.google/pubs/the-anatomy-of-a-large-scale-hypertextual-web-search-engine/)可以有效覆盖热门主题，但它主观、维护成本高、更新慢，也很难覆盖不断增加的长尾内容。Web 继续扩张以后，搜索和算法排序又接过了下一层问题。**所以 Yahoo 最值得记住的，并不是“门户网站”这个产品形态，而是一次瓶颈迁移：当互联网逐渐解决“让信息上线”之后，新的稀缺开始变成“怎样发现和组织这些信息”。**

这时再看 OpenRouter 和 Hugging Face，就比寻找“谁是 AI Yahoo”有意思得多。Hugging Face 更靠近模型、数据集和应用的发现、协作与分发。[2026 年夏季报告](https://huggingface.co/blog/state-of-open-models-summer-2026)显示，Hub 上公开模型仓库从年初的 243 万增长到 296 万，数据集从 71.1 万增长到约 100 万，Spaces 从 100 万增长到 144 万；但 85.6% 的模型终身下载不足 200 次，而 1.5% 的仓库拿走了 99.2% 的下载量。供给越来越多，本身并不能解决“什么值得用”。

OpenRouter 处理的是另一个环节。模型已经存在以后，实际运行时还要决定调用哪个模型、使用哪家供应商，以及怎样在成本、性能和可靠性之间路由。Stripe 的收购公告强调的，也正是 400 多个模型、80 多家供应商之上的 Token（词元）路由和优化。

所以 Hugging Face、OpenRouter 和 Yahoo 并不是三个可以逐项对应的产品，但它们背后共享一个更稳定的机制：**当一种技术把供给做得足够丰富以后，稀缺性往往会从“有没有供给”，迁向“怎样发现、评价、选择和协调供给”。**

而且，这并不是我第一次碰到这个问题。今年早些时候写[《Skill 系统的本质》](https://marktian-long.github.io/tools/blog/posts/skill-system-and-harness.html)时，我已经发现，Skill 一多，问题会从“有没有 Skill”变成用户怎样发现它、系统怎样自动路由到正确能力。后来写[《当 AI 开始主动找你》](https://marktian-long.github.io/tools/blog/posts/ai-arbitration-layer.html)时，我又把这个问题往前推了一步：如果越来越多 Agent 都能主动发现问题、发起请求，那么稀缺的不只是“找到正确能力”，还包括**谁的判断应该先递到人面前**。当时我把它理解成新的排序和仲裁问题。

现在把 Yahoo、Hugging Face、OpenRouter、Skill 发现机制和 Agent 仲裁放在一起，它们更像同一个机制在不同位置上的表现：模型越来越多，需要发现和评价；模型供应商越来越多，需要调用和路由；Skill 越来越多，需要自动选择；Agent 越来越主动，人类有限的注意力又可能成为新的协调瓶颈。

所以以后再看到“AI 像历史上的 X”，我会先问三件事：**当时真正发生的机制是什么，这个机制成立需要哪些条件，AI 今天又改变了其中哪些条件。** 与其先问“我们处在历史的哪里”，不如先看“历史上反复出现的机制，在今天分别发生到了什么程度”。

## 二、不找精确年份，我们仍然可以判断大方向

放弃精确年份，并不意味着放弃位置判断。曾鸣的三阶段在这里依然有用：第一阶段让智能逐渐成为可以规模化使用的基础设施；第二阶段在这套基础设施上出现大量应用；第三阶段再出现真正属于 AI 范式的原生应用。

下面这张表只做一件事：把曾鸣的三阶段和我对 2026 年的当前判断放在一起。阶段定义来自访谈，右侧是本文判断；相邻阶段可以重叠，不表示一个阶段结束以后下一个才开始。

| **产业化阶段** | **核心变化** | **我对 2026 年的判断** |
|---|---|---|
| **第一阶段｜基础设施形成** | 智能可规模化调用 | **进入尾声，仍在补完** |
| **第二阶段｜应用大量出现** | 应用与互补创新扩散 | **已经开场，仍属早期** |
| **第三阶段｜原生应用形成** | 新范式逐渐稳定 | **尚未形成稳定答案** |

这张表最关键的不是把 2026 年塞进某一个格子，而是承认阶段本来就会重叠。曾鸣自己在访谈里的表述也是：2026 年是第一阶段“基本完成”的标志，意味着基础设施开始成熟；与此同时，它也是第二阶段的开场。第一阶段并不会因此停止，模型还会变强，服务还会改善，成本还会继续下降。

现实数据大致支持这种重叠。企业侧，AI 已经不再是一项少数公司测试的前沿能力。[Stanford 2026 AI Index](https://hai.stanford.edu/ai-index/2026-ai-index-report/economy)显示，88% 的受访组织已经在至少一个业务功能使用 AI，70% 使用生成式 AI；但 AI Agent 在绝大多数业务功能里的部署仍然只有个位数。基础能力已经普及，Agent 真正进入业务流程仍处在早期扩散。

基础设施本身也在继续补。[A2A](https://www.linuxfoundation.org/press/a2a-protocol-surpasses-150-organizations-lands-in-major-cloud-platforms-and-sees-enterprise-production-use-in-first-year)在一年内获得超过 150 个组织支持，并进入 Google、Microsoft 和 AWS 等主要平台与真实生产环境；与此同时，Linux Foundation 还在推进 [DNS-AID](https://www.linuxfoundation.org/press/linux-foundation-announces-dns-aid-project-to-advance-decentralized-ai-agent-discovery) 和 [Agent Name Service](https://www.linuxfoundation.org/press/linux-foundation-announces-intent-to-launch-agent-name-service-to-establish-trusted-identity-infrastructure-for-ai-agents)，继续解决 Agent 的发现、身份、验证和信任问题。第二阶段越往前走，反而越会暴露第一阶段还没有解决的新基础设施问题。

应用侧也开始长出自己的互补结构。奇绩最近在[《前沿创业机会｜奇绩在找这样的 AI 创业者 #2》](https://mp.weixin.qq.com/s/mi9atrSEpyQuM7RiBweRPA)里列出的很多方向，已经不再是“再训练一个更强的基础模型”，而是围绕真实反馈数据、运行环境（Runtime）、长期记忆、权限、业务本体（Ontology）、FDE（Forward Deployed Engineer，前沿部署工程师）和组织记忆展开。这不能证明哪些产品最后会成功，但至少说明第二阶段已经不是一个抽象预测，围绕基础智能重新设计产品、流程和工程系统，已经成为真实创业活动的一部分。

因此，如果只看数字世界，我目前基本认同曾鸣的方向：**AI 正处在第一阶段尾声与第二阶段早期的重叠区。基础智能已经足够成熟，可以支撑大量应用创新；但 Agent 时代需要的可靠性、身份、权限、发现、反馈等基础设施仍在继续建设。第三阶段已经有候选形态出现，却还谈不上形成稳定范式。**

这里还要加一个边界：这主要说的是数字世界。Physical AI（物理世界 AI）整体更早。[Stanford AI Index](https://hai.stanford.edu/ai-index/2026-ai-index-report/technical-performance)显示，机器人在软件仿真环境 RLBench 上的操作成功率已经达到 89.4%，但真实家庭任务成功率只有 12%。数字环境里的智能可以快速复制和调用，物理世界仍受到真实数据、本体、可靠性和反馈闭环的更多限制，所以不能把数字 AI 的产业进度直接外推到物理世界。

“AI 大致走到哪里”因此仍然是一个有意义的问题，只是这个答案不再需要一个互联网年份。当第二阶段已经启动以后，我们还得继续问：AI 带来的变化，难道只是把今天已有的工作一项项自动化掉吗？

## 三、通用技术改变的不只是“谁来做”，还会改变“什么值得做”

关于 AI 对工作的影响，一个很自然的想象是做减法：今天经济里有一组任务，模型逐渐覆盖其中一些；模型越强，留给人的任务就越少。这部分当然存在。Acemoglu 和 Restrepo 的任务框架把自动化带来的这一面称为**替代效应（displacement effect）**：技术开始完成过去由劳动完成的任务，对这些任务的人力需求就会下降。与此同时，新任务的出现又可能形成**劳动恢复效应（reinstatement effect）**，让劳动重新进入新的任务环节。[他们的研究](https://www.nber.org/papers/w25684)解释的是，自动化如何改变任务在人和机器之间的分配，以及新任务怎样把劳动需求重新拉回来。

但如果 AI 接近一种通用目的技术，只研究任务怎样重新分工还不够。我们还需要解释另一件事：**为什么技术进步会让原本不存在、或者过去不经济的产品和流程，第一次变得值得做？** 这里需要通用目的技术的视角。Bresnahan 和 Trajtenberg 在经典研究中指出，通用目的技术除了广泛适用和持续改善，还有一个关键特征——**创新互补性（innovational complementarities）**：底层技术改善以后，下游继续创新的回报也会上升。[Helpman 和 Trajtenberg](https://www.nber.org/papers/w4854)又进一步指出，新的通用技术出现以后，往往还要等足够多兼容的互补投入形成，经济效果才会充分释放。([Bresnahan & Trajtenberg](https://www.nber.org/papers/w4148))

放到 AI，这里的“互补投入”并不只是换一个更强的模型。它可能包括让智能进入真实任务所需要的数据和上下文、工具与权限、评测与反馈、业务流程重构，以及相应的组织和责任调整。具体产品形态会变化，但共同点是：**基础模型提供能力，互补创新决定这种能力最终怎样进入真实经济活动。**

2025 年 Bresnahan、Greenstein 和 Yin 又把共同创新（co-invention）区分成渐进式和新颖式两类：前者是在既有业务上继续改善，后者则可能创造过去不存在的新产品和服务。[这项研究](https://www.nber.org/papers/w34090)也强调，新颖式共同创新成本更高、不确定性更大，但潜在回报也更高。

电气化的历史很适合说明这种机制。早期工厂引入电动机时，很多企业只是把原来的大型蒸汽动力换成大型电机，仍然通过中央动力轴组织生产，收益并不大。后来，小型电机可以分散安装到不同机器上，工程师才开始围绕工作流，而不是动力轴的位置重新设计工厂。[Chicago Fed 对这段历史的梳理](https://www.chicagofed.org/publications/chicago-fed-letter/2003/september-193)显示，电气化的大部分收益并不是来自“换了一个动力源”，而是来自之后的生产组织重构和共同创新。

所以电力带来的变化，不只是“谁来提供动力”，还包括**什么样的工厂开始值得被设计出来**。AI 也可能有类似的一面：奇绩这次列出的真实反馈数据飞轮、Agent 运行环境、FDE、大规模定制和科学智能系统，未来未必都会成为大公司，但它们至少展示了另一种创业逻辑——不只是去旧流程里找一步人工操作换成 AI，而是利用更便宜的认知能力，尝试过去成本太高、很难持续运行的新系统。

不过，AI 像电力的地方到这里也差不多了。电力最终提供的是相对标准、同质的能源输入；AI 提供的是持续变化、概率化而且高度异质的认知和行动能力。AI 可以参与决策、调用工具，甚至参与下一代 AI 的研发；软件能力的分发速度也和铺设电网、改造工厂完全不同。因此，电气化能支持的是一个机制判断：**通用技术要创造大规模价值，往往需要大量互补创新和系统重构。** 它不能继续推出 AI 会复制电气化的时间节奏、产业结构或者应用形态。

到这里，“模型越来越强，人还剩什么”这道减法题就少算了一个变量：**未来到底有哪些值得做的事情，本身就会变化。**

## 四、任务全集会变，人也不能被定义成“模型剩下的部分”

把人的空间理解成“模型射程之外”很直观，但它隐含着一个前提：未来所有值得做的事情，今天已经存在。上一章说明，这个前提并不稳。技术不仅会改变模型能完成什么，还会改变哪些产品、服务和流程值得存在，所以至少要把三个问题分开。

下面是本文为了讨论这个问题做的工作归纳，不是行业统一分类。三条边界相互影响，也不是三个互斥区域。

| **边界** | **它回答的问题** | **主要由什么推动变化** |
|---|---|---|
| **模型能力边界** | AI 当前能完成什么 | 模型、工具、Agent 能力 |
| **经济活动边界** | 什么开始值得被创造 | 成本下降、互补创新 |
| **人类参与边界** | 哪些部分最终由人参与 | 成本、责任、制度、偏好 |

模型能力扩大，不等于经济活动空间只会缩小；经济活动空间扩大，也不意味着新出现的部分天然属于人。未来很多新服务，很可能从出生第一天起就是高度 AI 化的。

我最近写[《AI 正在把“使用软件”和“操作软件”拆开》](https://marktian-long.github.io/tools/blog/posts/ai-software-operator-shift.html)时，已经碰到了这个问题的一个产品版本。模型越来越会操作软件以后，一些 Prompt（提示词）、Workflow（工作流）、Skill（技能）和 GUI（图形界面）等人工配置或操作步骤可能逐渐被吸收；但完成真实任务依赖的业务对象、权威状态、规则、权限和责任，并不会因为模型升级自动消失。奇绩的观察里也有相近的一层：一部分今天的 Agent 脚手架可能随着模型能力提高被内化，但任务、工具、环境和反馈仍然需要某种工程系统承载。

这不是在说 Runtime、Skill 或今天某一种产品形态能够永久存在。恰恰相反，**今天的解法会折旧，真实任务里的约束不会因为模型升级自动消失。**

而到了“人最终还承担什么”这一层，只看技术能力更不够。技术上能做，不等于经济上一定值得自动化：人工和 AI 的成本、质量、失败损失不同，实际分工就可能不同。技术上能做，也不等于责任可以一起转移：医疗、金融、审批、治理等场景里，谁可以作决定、谁必须签字、出了问题谁负责，本身就是制度和责任结构。还有一些活动里，“人参与”本身就是结果的一部分，信任、身份、关系、真实性和体验都会进入用户偏好。

同时，新活动还在不断进入这套分工。未来的人机分工不是在今天的任务清单上重新切一块固定蛋糕，而是一边重新分配，蛋糕本身也在变化。

**人的未来位置不是“AI 做不到的剩余集合”，而是一个动态分工结果：技术决定什么可行，成本决定什么划算，制度与责任决定什么可以授权，人的偏好决定什么值得保留人的参与，而新的经济活动又不断改变整个任务集合。** 这比寻找一块“模型永远到不了的安全区”麻烦得多，却也更接近现实。

## 五、能力越来越强以后，还要问我们究竟想优化什么

到这里，我们回答的还是技术会把经济活动带到哪里。但还有另一个问题：如果能力越来越强、经济活动越来越多，“做得更多”本身就是最终目标吗？

据媒体报道，王坚今年在外滩大会提出的一个问题给了我另一种观察角度。他问，[未来城市有没有可能只用今天大约 10% 的资源，仍然让人生活得很好](https://news.caijingmobile.com/article/detail/581243?source_id=40)；谈到 AI 自身耗电时，他还提出过“[AI 投入一度电，世界也许能在别处少用十度电](https://news.10jqka.com.cn/20260911/c679836136.shtml)”的设想。这里的 10% 和“一度换十度”，我更愿意把它们理解成一个价值目标，而不是已经验证的效率数据。

这个问题把技术价值从另一个方向打开了。技术进步当然可以意味着“同样的资源做更多事情”，但也可以反过来问：“得到同样甚至更好的结果，能不能少用很多资源？”奇绩材料里的“Token Max → Token 效益”，是在更窄的产业尺度上问类似的问题：探索能力边界时，使用更多 Token 有价值；进入真实业务以后，单位 Token 到底换来多少真实结果，会越来越重要。

一旦把视角从 Token 扩大到能源和现实资源，就不能只看单次效率。[IEA 2026](https://www.iea.org/reports/key-questions-on-energy-and-ai/executive-summary)预计，全球数据中心用电会从 2025 年约 485 TWh 增长到 2030 年约 950 TWh；与此同时，IEA 也观察到单个 AI 任务的能源效率近年来快速提升。两件事完全可以同时成立：单次任务越来越省，但更复杂的推理、视频和 Agent 工作负载不断出现，调用规模也在扩大。

这里会出现经典的**反弹效应（rebound effect）**：效率提高、单位成本下降以后，需求和使用规模也可能随之增长，抵消一部分原本预计的资源节约。IEA 在[《Energy and AI》](https://www.iea.org/reports/energy-and-ai/executive-summary)里就提醒，AI 虽然可能让自动驾驶更加高效，但更低的出行成本也可能把一部分用户从公共交通吸引到私人出行，从而削弱原来的能源收益。

因此，评价 AI 的资源效果至少要算三笔账：完成同样结果需要多少资源，效率提高以后使用规模扩大了多少，以及把 AI 自己新增的资源消耗和它在其他系统实际节约的资源放到同一个边界以后，最终净效果是什么。**效率提高，不自动等于总消耗下降；能力提高，也不自动等于最终结果更好。**

这看起来已经离“AI 相当于历史哪一年”很远，但本质上还是文章开头的同一个问题：不要拿一个局部指标，过早代表整个系统。模型能力、框架收敛、单次能效都可以是真实进展，却不能单独替整个产业或整个社会结果下结论。

## 六、研究完这些之后，我现在更愿意相信什么

如果研究产业史最后只是让我对所有判断都补一句“事情很复杂”，那这篇文章就没有太大价值。到 2026 年 9 月，我更愿意留下四个相对明确的判断。

第一，**AI 已经不是一个只看模型能力就能理解的产业，而要同时看基础能力、互补创新，以及这些能力怎样进入真实任务。** 第一阶段没有彻底结束，模型继续变强、基础设施也继续完善；但第二阶段已经启动。当基础智能越来越普遍以后，新增价值不会只继续发生在基础模型内部，还会出现在围绕它形成的数据、工具、反馈、工作流和组织重构里。所以我现在看 AI，会同时观察两件事：基础能力的边界还在怎样移动，以及这些能力进入真实任务以后，新的互补创新正在长在哪里。

第二，**判断下一步机会时，不是只看“模型又会做什么”，而是看瓶颈正在往哪里迁移。** Web 内容增长以后，导航、搜索和排序变得重要；模型、Skill、Agent 增加以后，能力发现（Discovery）、路由（Routing）、身份（Identity）、信任（Trust）和真实反馈开始成为新的约束。历史不会告诉我们最后是哪家公司吃掉这些价值，但它能帮助我们更早看见，为什么价值产生的位置正在移动。

第三，**不是把今天的产品形态当成长久护城河，而是看模型变强以后仍然存在的真实约束。** Prompt（提示词）、Workflow（工作流）、Skill（技能）、GUI（图形界面）都可能被更强的模型吸收；业务对象、权威状态、规则、权限、责任和真实反馈，不会因为一次模型升级自动消失。今天的实现方式可以不断折旧，任务里的真实约束仍然需要有人或者某个系统承担。

第四，**进入真实业务以后，不是看“使用了多少智能”，而是看得到一个真实结果付出了什么代价。** 更多 Token、更大的模型、更多 Agent、更高的基准评测（benchmark）分数，都只是中间变量。能不能稳定完成任务、单位结果成本是多少、有没有形成真实反馈，以及整个系统的净资源效果，才更接近最终价值。

这几个判断对我做 AI 产品也有影响，但它们不会替代产品最基本的判断顺序。我仍然会先看用户到底有什么真实问题，这个问题值不值得解决，以及 AI 是否真的比规则、传统软件或者流程改造更适合解决它。用户价值、商业价值和技术可行性，仍然是起点。

产业史这套视角是在此基础上，再帮我多问两层。第一，**现在是不是合适的产品时点？** 同一个需求，在基础能力还不足的时候和应用开始扩散以后，需要做的产品可能完全不同；问题究竟还卡在模型能力，还是已经迁到可靠性、上下文、权限、反馈和流程重构，会直接影响现在该不该做、应该做多厚。第二，**今天的解法里，哪些价值会随着模型继续变强而折旧？** 如果删掉当前产品以后，完成任务仍然必须重新建立业务对象、权威状态、规则、权限、责任和反馈，这些约束就更值得长期投入。

最后仍然回到产品原本就应该回答的问题：用户的真实结果有没有变好，为此付出了多少成本，这份价值能不能被稳定、重复地创造出来。**产业史不会告诉我应该做什么产品。它更像是在一个机会已经通过“用户问题—商业价值—技术可行性”的基本判断以后，继续帮助我判断时点、瓶颈和价值的耐久性。**

产品只是这种观察方式的一个应用。用同样的视角看创业、公司战略或者产业竞争，本质上仍然是在问：现在主要被什么约束，底层技术继续变化以后，旧瓶颈会消失还是迁移出新的瓶颈，今天看到的价值又有多少能够穿过下一轮技术变化。

这也是我最后还愿意保留产业史的原因。它不会告诉我下一家伟大的 AI 公司是谁，也不会告诉我 2026 年精确等于互联网的哪一年；相比一个历史年份，它提供的是另一种位置感：**哪些机制已经发生，哪些条件正在成熟，以及限制下一步发展的瓶颈，正在往哪里移动。**

历史不是一张未来时间表。**产业史更像一组压力测试：哪些机制重新出现了，哪些成立条件已经变化，以及今天真正值得盯住的变量是什么。**

## 参考资料

### 问题来源 / 战略观点

- [张小珺 × 曾鸣：《和曾鸣聊产业史观：我的非共识判断》](https://mp.weixin.qq.com/s/KiN29IcdzkNY_Yo4GJus0w)
- [《财经》：外滩大会｜王坚抛出未来城市之问：可否仅用 10% 资源实现美好生活？](https://news.caijingmobile.com/article/detail/581243?source_id=40)
- [同花顺财经：王坚谈 AI 用电与资源节约](https://news.10jqka.com.cn/20260911/c679836136.shtml)
- [奇绩：《前沿创业机会｜奇绩在找这样的 AI 创业者 #2》](https://mp.weixin.qq.com/s/mi9atrSEpyQuM7RiBweRPA)
- [Reuters：Anthropic plans new fundraise at $350 billion valuation](https://www.reuters.com/technology/anthropic-plans-raise-10-billion-350-billion-valuation-wsj-reports-2026-01-07/)
- [Reuters：Anthropic's valuation surges to $965 billion](https://www.reuters.com/business/anthropic-raises-65-billion-now-valued-965-billion-2026-05-28/)
- [Knowledge at Wharton：Can Verizon Unlock Yahoo’s ‘Hidden Value’?](https://knowledge.wharton.upenn.edu/article/can-verizon-unlock-yahoos-hidden-value/)
- [U.S. Bureau of Labor Statistics：CPI-U, August 2026](https://www.bls.gov/news.release/cpi.t01.htm)

### 学术研究 / 历史材料

- [Brin & Page：The Anatomy of a Large-Scale Hypertextual Web Search Engine](https://research.google/pubs/the-anatomy-of-a-large-scale-hypertextual-web-search-engine/)
- [Bresnahan & Trajtenberg：General Purpose Technologies “Engines of Growth?”](https://www.nber.org/papers/w4148)
- [Helpman & Trajtenberg：A Time to Sow and a Time to Reap](https://www.nber.org/papers/w4854)
- [Acemoglu & Restrepo：Automation and New Tasks](https://www.nber.org/papers/w25684)
- [Bresnahan, Greenstein & Yin：New Economic Forces Behind the Value Distribution of Innovation](https://www.nber.org/papers/w34090)
- [Chicago Fed：Information Technology and the U.S. Productivity Acceleration](https://www.chicagofed.org/publications/chicago-fed-letter/2003/september-193)

### 当前产业状态 / 官方与研究机构资料

- [Stripe：Stripe agrees to acquire OpenRouter](https://stripe.com/newsroom/news/stripe-agrees-to-acquire-openrouter)
- [NVIDIA：NVIDIA to Acquire Hugging Face](https://blogs.nvidia.com/blog/nvidia-to-acquire-hugging-face/)
- [Hugging Face：State of Open Models: Summer 2026](https://huggingface.co/blog/state-of-open-models-summer-2026)
- [Stanford HAI：2026 AI Index — Economy](https://hai.stanford.edu/ai-index/2026-ai-index-report/economy)
- [Stanford HAI：2026 AI Index — Technical Performance](https://hai.stanford.edu/ai-index/2026-ai-index-report/technical-performance)
- [Linux Foundation：A2A Protocol Surpasses 150 Organizations](https://www.linuxfoundation.org/press/a2a-protocol-surpasses-150-organizations-lands-in-major-cloud-platforms-and-sees-enterprise-production-use-in-first-year)
- [Linux Foundation：DNS-AID](https://www.linuxfoundation.org/press/linux-foundation-announces-dns-aid-project-to-advance-decentralized-ai-agent-discovery)
- [Linux Foundation：Agent Name Service](https://www.linuxfoundation.org/press/linux-foundation-announces-intent-to-launch-agent-name-service-to-establish-trusted-identity-infrastructure-for-ai-agents)
- [IEA：Key Questions on Energy and AI — Executive summary](https://www.iea.org/reports/key-questions-on-energy-and-ai/executive-summary)
- [IEA：Energy and AI — Executive summary](https://www.iea.org/reports/energy-and-ai/executive-summary)

### 历史博客

- [《2026 年 AI Agent 市场格局：开放 vs 封闭的博弈》](https://marktian-long.github.io/tools/blog/posts/market-landscape-2026.html)
- [《Skill 系统的本质：不是 Prompt 工程化，是 Harness 的支撑》](https://marktian-long.github.io/tools/blog/posts/skill-system-and-harness.html)
- [《当 AI 开始主动找你：下一个软件入口，会是用来排序 AI 请求的那一层》](https://marktian-long.github.io/tools/blog/posts/ai-arbitration-layer.html)
- [《AI 正在把“使用软件”和“操作软件”拆开》](https://marktian-long.github.io/tools/blog/posts/ai-software-operator-shift.html)
