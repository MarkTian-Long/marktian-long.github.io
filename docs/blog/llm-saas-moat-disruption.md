# AI coding 之后，哪些 B 端 SaaS 会死，哪些会活

> LLM 让自研成本暴跌，动摇了"买不如建"的传统假设；但这个冲击是分化的——功能薄、行业知识浅的 B 端 SaaS 面临被替代压力，而深度沉淀了行业流程知识的产品，护城河在重构而非消失。

## 从一个标题党说起

"SaaS 已死"。

这个说法在过去一两年里反复出现，每隔一段时间就会有人拿它当标题。我第一次看到时没太当回事，觉得是惯常的技术焦虑话语。但后来在金融软件行业的乙方待久了，开始觉得这个问题值得认真想一想，不是因为结论是对的，而是因为它背后藏着一个更真实的问题。

需要先说清楚范围：这篇文章讨论的是以企业为付费主体的 B 端 SaaS，包括云端订阅制产品和私有化部署的标准化软件，不涉及面向个人用户的消费类软件。后者的逻辑完全不同，不在这里讨论。

金融软件领域，[恒生电子](https://finance.sina.com.cn/stock/relnews/cn/2025-04-02/doc-ineruhuk5347584.shtml)是国内最大的金融 IT 乙方，2024 年营业收入同比下降 9.62%，[2025 年上半年继续下滑 14.44%](http://static.cninfo.com.cn/finalpage/2025-08-23/1224561753.PDF)。原因是多重的，恒生自己在年报里归因于金融机构 IT 预算收紧、采购流程拉长，以及竞争加剧。这些原因都成立，但"AI coding 导致甲方倾向自研"是不是其中一个因素，我无法确认，也没有直接证据支持。我把它放在这里，只是作为"金融软件行业整体承压"的背景，不是作为 AI coding 冲击的直接例证。

真正让我觉得这个问题值得认真分析的，是另一件事：AI coding 工具让开发成本的下降变得肉眼可见。当一个零编程经验的人能在几天内搭出一个可用的内部工具时，"我们为什么要买这套 SaaS"这个问题，就从一个不需要认真回答的假设，变成了值得计算的选项。我在乙方做过 B 端 SaaS 产品，这个问题对我来说不是抽象的行业观察，而是直接关系到自己所在行业的处境。

## "买"的逻辑是怎么建立起来的

在 AI coding 之前，甲方选择买 B 端 SaaS 而不是自研，根本逻辑只有一条：自研的性价比算不过来。

这不是因为甲方没有需求，也不是因为他们不知道现有 SaaS 满足不了自己的个性化要求。而是开发一套能用的业务软件，需要招募工程师、做需求分析、写代码、测试、上线、维护——这套成本叠加下来，远远超过付一份年费订阅。买 B 端 SaaS 的本质，是把"养一支团队"的成本外包出去，摊薄到所有客户身上。

触发这个算法重新计算的，有两个变量。一是 AI coding 让初始开发成本大幅下降。[The Pragmatic Engineer 的作者花 20 分钟用 LLM 生成代码，替换掉了一个年费 120 美元的 micro-SaaS](https://blog.pragmaticengineer.com/i-replaced-a-120-year-micro-saas-in-20-minutes-with-llm-generated-code/)，这只是个人层面的案例，但说明了开发成本的下降已经到了让"顺手自研"变得可行的量级。对于企业级场景，[一个基于现有 API 的 prompt 工程方案，构建成本可以做到 2 万到 8 万美元](https://kyanon.digital/blog/llm-development-cost-what-enterprises-budget/)，这在过去是不可想象的起点。二是对用户规模较大的企业来说，按席位收费的 B 端 SaaS 年费本来就是一笔可观的支出，规模越大，自研的相对收益越明显。

两个变量叠加，让原本不值得认真计算的选项，变得值得认真计算了。

## 自研替代的不是所有 B 端 SaaS

但"初始开发成本下降"和"自研真的划算"之间，还隔着一个容易被忽视的问题。

开发成本只是 TCO（总拥有成本）的起点，不是终点。[据 TianPan.co 援引的 2025 年多租户 SaaS 产品分析，团队的自研成本预算平均超支 340%，根本原因几乎从来不是初始开发费用，而是后续维护成本的失控](https://tianpan.co/blog/2026-04-15-build-vs-buy-llm-infrastructure)。更关键的是人力结构：[同一来源援引的一项针对 54 个部署场景的同行评审分析显示，硬件加电力只占自托管总成本的 20–30%，剩下 70–80% 是人力](https://tianpan.co/blog/2026-04-15-build-vs-buy-llm-infrastructure)。

甲方自研省掉的是订阅费，但换来的是一个需要持续投入的维护责任：bug 修复、功能迭代、合规规则更新，以及随着业务变化不断重新调研需求——这些成本在签下第一行代码之后才真正开始。

面临真实自研替代压力的，是那些功能标准、业务逻辑简单、行业知识浅的薄层产品——本质上是"数据库加表单加几条业务规则"的 B 端 SaaS。这类产品的护城河本来就不深，AI coding 只是加速了它的贬值。

## B 端 SaaS 真正的护城河从来不是代码

既然薄层产品面临压力，那些有行业积累的产品为什么更难被替代？答案藏在一个更根本的问题里：甲方买 B 端 SaaS，买的到底是什么？

表面上是功能，实际上是行业流程知识。

一家 B 端 SaaS 厂商服务了几百家同类客户，见过这些公司内部流程的各种变体，知道哪些需求是表面需求、哪些是真实痛点，哪些功能做了没人用、哪些边界情况必须处理。这些知识不在产品文档里，不在 LLM 的训练数据里，也不是任何单一甲方能自己积累的。

有人可能会反驳：LLM 不是已经包含了大量行业实践吗，直接问 LLM 不就能省掉需求调研的时间？这个反驳在高度标准化的场景下有一定道理，但 B 端业务的核心需求来自公司内部流程，这部分从来不在公开数据里，LLM 能给出的只是通用行业经验，而不是具体公司的真实操作逻辑。SaaS 厂商的优势恰恰是"见过足够多同类公司的内部流程变体"——而这个知识从来就不在公开数据里。

这也解释了为什么需求变化快、重业务体验的 B 端 SaaS 更难被自研替代：甲方在买这类产品时，不只是在买一套功能，更是在买"同行是怎么做这件事的"这个集体经验。自研可以复刻今天的功能，但复刻不了这背后的行业判断积累。

[据 Development Corporate 对 a16z 合伙人 Immerman 和 Rodriguez 2026 年 3 月分析的解读](https://developmentcorporate.com/saas/a16z-the-saas-moat-scorecard/)（译自英文原文）：代码从来就不是护城河，如果是，这些公司早就被开源软件或外包干掉了。他们把应用软件重新定义为一种"被固化的流程"，认为它随着 AI 变强而更有价值，而非更没价值。这个判断和我的观察是一致的。

## AI coding 对强 B 端 SaaS 是重构，不是终结

到这里，结论似乎是"强 B 端 SaaS 没事"，但这个判断还不完整。

AI coding 在降低甲方自研成本的同时，也在降低 B 端 SaaS 厂商的个性化响应成本。过去，SaaS 厂商对个性化需求优先级低，根本原因是研发成本高导致性价比不够，大多数个性化需求的开发投入无法被单个客户摊薄。AI coding 之后，这个约束松动了——同样的工程资源可以处理更多个性化需求，过去做不了的功能现在可以做。

这对强 B 端 SaaS 来说是机会：行业流程知识的优势还在，同时个性化响应能力在提升，两者叠加，理论上能形成更强的产品。

但有一个新的难题还没有解决：个性化功能和通用功能如何整合，在不破坏所有用户体验的前提下满足差异化需求。这是产品架构和体验设计问题，不是研发成本问题，AI coding 降不了这部分的难度。这个整合能力的高低，可能是 AI coding 时代 B 端 SaaS 厂商之间新的竞争维度。

---

这篇文章写到这里，我自己的判断是：分化确实在发生，但"SaaS 已死"是错误的简化。

哪些是我比较确定的：薄层产品的压力是真实的，功能标准、行业知识浅的 B 端 SaaS 面临被甲方自研替代的竞争压力；强 B 端 SaaS 的护城河在重构而非消失，核心在于能否持续沉淀行业流程知识，并把它转化为产品能力。至于金融甲方采购收缩的背后，AI coding 可能是其中一个加速器，但经济周期、信创替代、竞争格局变化同样是不可忽视的因素，这几个力量很难拆分，目前我没有足够的直接证据支持 AI coding 是主因的判断。

## 参考资料

- [恒生电子 2024 年年报点评，平安证券](https://finance.sina.com.cn/stock/relnews/cn/2025-04-02/doc-ineruhuk5347584.shtml)
- [恒生电子 2025 年半年度报告](http://static.cninfo.com.cn/finalpage/2025-08-23/1224561753.PDF)
- [I replaced a $120/year micro-SaaS in 20 minutes with LLM-generated code，The Pragmatic Engineer](https://blog.pragmaticengineer.com/i-replaced-a-120-year-micro-saas-in-20-minutes-with-llm-generated-code/)
- [LLM Development Cost: What Enterprises Budget in 2026，Kyanon Digital](https://kyanon.digital/blog/llm-development-cost-what-enterprises-budget/)
- [The Build-vs-Buy LLM Infrastructure Decision Most Teams Get Wrong，TianPan.co](https://tianpan.co/blog/2026-04-15-build-vs-buy-llm-infrastructure)
- [a16z: The SaaS Moat Scorecard，Development Corporate](https://developmentcorporate.com/saas/a16z-the-saas-moat-scorecard/)
