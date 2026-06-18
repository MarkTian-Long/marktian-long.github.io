# OpenAI 和 Anthropic 同一周下场做咨询，FDE 时代来了？

> 大模型厂商相继成立企业部署合资公司，表面是商业扩张，实质是在宣告 AI 竞争主战场的迁移——从模型能力到落地能力。FDE 是第一批响应者，FDX 可能是这个逻辑的完整形态。

---

去年，我从一些渠道陆续接触到 FDE（Forward Deployed Engineer，前线部署工程师）这个概念。当时的判断是：这个岗位会增长，但还处于早期，不同公司大概率还在摸索阶段。

直到最近看到一则新闻，让我觉得有必要认真写一篇。

2026 年 5 月 4 日，[Bloomberg 报道](https://www.bloomberg.com/news/articles/2026-05-04/openai-finalizes-10-billion-joint-venture-with-pe-firms-to-deploy-ai) OpenAI 正式完成一个估值约 100 亿美元的合资公司"The Deployment Company"，从 TPG、Brookfield Asset Management、Bain Capital 等 19 家机构募资超过 40 亿美元，专门负责帮助企业部署和落地 AI 工具。就在同一天，Anthropic 也[宣布](https://www.cnbc.com/2026/05/04/anthropic-goldman-blackstone-ai-venture.html)与 Blackstone、Hellman & Friedman、Goldman Sachs 等机构成立一家 15 亿美元的合资公司，目标是把 Claude 直接嵌入企业的核心业务流程。

两家顶级 AI 实验室，同一天，同一个动作。这种巧合不像偶然，更像是两家公司在相互确认同一个判断。

这篇文章想搞清楚这个判断是什么，以及它背后更大的趋势——FDE 的崛起，以及它可能演化成的 FDX（Forward Deployed X，X 指代产品、设计、市场、销售、研究等一切参与创新的职能）。

---

## 一、PoC 很容易，生产很难

要理解为什么大模型厂商要亲自下场做"咨询"，得先搞清楚企业 AI 落地到底卡在哪里。

做一个 AI 的概念验证（PoC，Proof of Concept）并不难。调几个 API，搭一个 demo，让模型在测试数据上跑出漂亮的结果，这件事很多团队都能在几周内完成。

难的是从 demo 到生产系统。

真正的生产环境意味着：AI 的能力边界要在哪里设定？出错了怎么兜底？如何与企业现有的遗留系统集成？数据隐私和合规怎么处理？组织内部谁负责维护？当 AI 给出一个错误建议，责任归属如何界定？

这些问题没有一个是模型能力可以解决的。它们本质上是组织问题、流程问题、人的问题。正因如此，Anthropic 的 CFO Krishna Rao 在宣布合资公司时说："企业对 Claude 的需求已经大幅超过任何单一交付模式的承载能力。"Goldman Sachs 全球资产与财富管理负责人 Marc Nachmann 的表述更直接（译自英文原文）：["光有模型不会改变你的工作流。你需要能把技术和业务实际情况结合起来、并真正落地的人。"](https://www.cnbc.com/2026/05/04/anthropic-goldman-blackstone-ai-venture.html)

这个判断并不新鲜，但由全球最顶级的 AI 实验室在同一天用真金白银来确认，意义不同。

据 Indeed 数据（经 [Financial Times 引用](https://www.fastcompany.com/91435680/postings-for-this-ai-job-are-up-800)，官方声称，未经独立验证），FDE 岗位招聘数量在 2025 年 1 月到 9 月间同比增长超过 800%。另有招聘数据平台统计同比增幅达到 1165%。无论哪个数字更准确，趋势方向是一致的：这个岗位正在从边缘走向主流。

---

## 二、FDE 是什么，从哪里来

FDE 这个概念并不新。它最早由数据软件公司 Palantir 在 2010 年代初发明并实践，当时 Palantir 的主要客户是美国政府的情报和国防部门——这些客户的需求极度非标准化，根本没有通用产品可以满足。

前 OpenAI 首席研究官 Bob McGrew 对 FDE 的定义是："常驻客户现场、填补产品现有功能与客户实际需求之间缺口的技术人员。"用更直白的话说：FDE 不是远程支持，是驻场共创。他们直接在客户的真实基础设施上写代码，而不是用脱敏数据做演示。

据 [Palantir 官方博客](https://blog.palantir.com/dev-versus-delta-demystifying-engineering-roles-at-palantir-ad44c2a6e87)及多篇行业分析，Palantir 将驻场团队分为两类：Echo 团队通常来自客户所在行业，负责识别真实的高价值问题，并担任客户关系的桥梁；Delta 团队是执行导向的工程师，负责快速原型开发和方案落地。两者形成互补——Echo 找对问题，Delta 快速构建解决方案。这个双循环模式——FDE 先在客户现场铺出一条能走的路，产品团队再把这条路抽象成服务更多客户的通用能力——成为 Palantir 最核心的产品发现机制。Palantir 的 Ontology（本体模型）就是这样诞生的：不是产品团队凭空设计出来的，而是 FDE 团队在大量定制实践中逐渐抽象出来的通用框架。

今天的 AI 时代 FDE 和 Palantir 当年有重要区别。Palantir 的 FDE 解决的是"数据整合和分析平台的定制化落地"；今天的 FDE 解决的是"大模型能力嵌入企业工作流"。底层技术逻辑完全不同，但核心动作一样：把强大的通用技术能力，翻译成具体业务场景里真正可用的解决方案。

这种翻译工作在 AI 时代变得比以往更难——因为大模型的能力边界本身就模糊，它能做什么、不能做什么、在什么场景下会出错，没有人能给出通用答案。每个企业、每个业务场景，都需要重新摸索和设定。

---

## 三、为什么是合资公司，而不是自己扩张

理解了落地的难度，就能理解 OpenAI 和 Anthropic 为什么选择合资公司这个结构，而不是直接扩张内部团队。

原因之一是分发渠道。PE（私募股权，Private Equity）机构背后管理着庞大的被投企业组合。Blackstone、Goldman Sachs、TPG 这类机构，其被投企业横跨医疗、制造、金融、零售、物流等几乎所有行业，全球 PE 行业合计管理资产超过 13 万亿美元。通过合资公司，AI 厂商一步获得了进入这些企业的直接通道，而不是一个一个去打企业销售。

原因之二是能力互补。大模型公司在技术上毋庸置疑，但企业落地需要的不只是技术能力，还需要深厚的行业理解、变革管理经验、以及在复杂组织内部推动事情落地的能力。PE 机构和其背后的顾问网络，恰恰具备这些能力。

原因之三是商业模式的自然延伸。大模型厂商在帮客户落地的过程中，积累了最深的场景理解和技术实践——这个能力天然适合自己做，而不是交给第三方系统集成商（SI，System Integrator）代劳。JV（Joint Venture，合资公司）是这个逻辑的组织化表达。服务本身不是主要收入来源，而是驱动产品深度采用的手段：FDE 驻场帮企业落地，最终目的是让企业深度依赖这家 AI 厂商的模型和平台。

这个逻辑对传统咨询公司是一个直接冲击——对此，我们放到下一节展开。

---

## 四、FDE 到 FDX：三类受冲击的组织和角色

FDE 是工程师的前线部署形态。但工程师只是开始。

FDX 把 X 扩展到产品、设计、市场、销售、研究等所有参与创新的职能。这个判断背后的逻辑是：如果落地的瓶颈不在于技术能实现什么，而在于是否理解业务需要什么，那么所有和业务理解相关的职能，最终都需要有"前线部署"的形态。

这个趋势在招聘数据上已经有了早期印证。[一份追踪 200 多家顶级 AI 公司招聘数据的报告](https://adamgtm.com/p/forward-deployed-everything)发现，其中 39% 的公司在招聘"Forward Deployed"相关岗位，而且不只是工程师——FDPM（Forward Deployed Product Manager）、Forward Deployed Data Scientist 等角色正在出现。瓶颈正在从"能不能构建"转向"知不知道构建什么"，能熟练运用 AI 的领域专家，可能比需要重新学习业务的 AI 工程师更有价值。

FDE 和 FDX 的崛起，对三类组织和角色的冲击最为直接，但冲击的性质各不相同。

对传统 SI（系统集成商）而言，冲击发生在公司层面。SI 原本是企业和技术产品之间的中间层，负责把产品定制化落地。FDE 的出现意味着这个中间层被技术厂商直接内化，SI 作为一类企业的生存空间会被持续压缩，而不只是某个具体岗位受到影响。

对管理咨询公司而言，冲击发生在业务线层面。McKinsey、BCG 的数字化转型和 AI 咨询业务，面对的新竞争对手本身就掌握最前沿的模型能力，这是一个能力维度上的不对称竞争。传统咨询公司可以学习 AI，但很难复制 AI 厂商在真实落地场景中积累的第一手经验。

对企业内部数字化转型团队而言，冲击发生在职能定位层面。很多大企业过去几年建立了内部 AI 团队来主导落地，而 JV 模式直接把外部 FDE 嵌入企业内部，内部团队的角色边界需要重新界定——是继续主导，还是转型为与外部 FDE 对接的协调方，取决于各自的能力积累。

---

## 五、这个窗口期会持续多久

有一个合理的反驳是：FDX 可能只是一个过渡形态。随着 AI Agent 能力的提升，今天需要大量人工驻场解决的问题，若干年后或许 Agent 能自动处理，FDX 的规模会随之收缩。

这个反驳有道理，但我认为它低估了非技术难题的复杂度。

FDE 的核心工作是读懂企业业务——理解一家医院的排班流程、一家制造企业的质检标准、一家银行的风控逻辑。大模型基础能力的增长，对这件事的加速是有限的，因为瓶颈从来不是"有没有足够聪明的 AI"，而是"有没有足够深入的业务理解"，以及"谁来承担 AI 出错的责任"。

更重要的是，企业 AI 转型面临的阻力大部分来自组织层面：如何调整原有的考核体系？哪些岗位会受影响，如何安置？组织文化能否接受 AI 参与决策？这些是管理问题，是文化问题，不是工程问题。模型能力的提升对它们的加速作用极为有限。

企业数字化转型提供了一个参照系。这件事业界讨论了将近三十年，但直到今天，大量传统企业仍未真正完成。更值得注意的是，数字化转型的完成程度，很可能直接决定 AI 转型的难易程度——数字资产管理已经规范化、内部技术基础设施相对成熟的企业，AI 嵌入的阻力会小得多；而那些连数字化都还没完成的企业，AI 转型面临的是双重挑战。换言之，企业 AI 转型不是一个独立启动的新周期，而是叠加在数字化转型这个尚未完成的长周期之上的。

把这些因素叠加起来，我倾向于认为企业 AI 转型的窗口期保守估计会持续 20 年以上。这不是一个短暂的技术迭代周期，而是一次量级相似、但复杂度更高的长周期产业变革。

---

FDE 已经不是一个边缘概念，两家顶级 AI 实验室在同一天给出了确认。

FDX 是不是终点，这个窗口期最终会持续多久，现在都还没有答案。我的判断建立在"企业 AI 转型的非技术难题不会快速消失"这个前提上，如果未来几年的实际落地数据证明这个前提错了，结论自然需要修正。

但对于当下的 AI 从业者来说，这个趋势已经有了一些可以观察的含义：工程师之外，具备深度行业理解的产品、设计、研究等职能，可能比以往任何时候都更有机会直接参与 AI 落地的核心环节，而不只是在总部做支持性的工作。FDX 不是一个新头衔，更像是一种新的工作方式——离业务更近，离问题更近，也因此离价值更近。

这个方向值不值得认真对待，每个人的判断会不同。但它正在发生，这一点已经比较清楚了。

---

## 参考资料

- [Anthropic and OpenAI are both launching joint ventures for enterprise AI services](https://techcrunch.com/2026/05/04/anthropic-and-openai-are-both-launching-joint-ventures-for-enterprise-ai-services/) - TechCrunch
- [OpenAI Finalizes $10 Billion Joint Venture With PE Firms to Deploy AI](https://www.bloomberg.com/news/articles/2026-05-04/openai-finalizes-10-billion-joint-venture-with-pe-firms-to-deploy-ai) - Bloomberg
- [Anthropic teams with Goldman, Blackstone and others on $1.5 billion AI venture](https://www.cnbc.com/2026/05/04/anthropic-goldman-blackstone-ai-venture.html) - CNBC
- [Postings for this AI job are up 800%](https://www.fastcompany.com/91435680/postings-for-this-ai-job-are-up-800) - Fast Company
- [Forward Deployed Everything](https://adamgtm.com/p/forward-deployed-everything) - Adam's GTM Report
- [OpenAI and Anthropic Strike at Consulting in May 2026](https://nerdleveltech.com/openai-anthropic-private-equity-consulting-ventures) - Nerd Level Tech
- [Dev versus Delta: Demystifying engineering roles at Palantir](https://blog.palantir.com/dev-versus-delta-demystifying-engineering-roles-at-palantir-ad44c2a6e87) - Palantir Blog
- [FDE 是什么？为什么软件业界需要 FDE？](https://www.explainthis.io/zh-hans/ai/what-is-fde) - ExplainThis
- [人工智能初创企业前沿部署工程师行动指南](https://v2su.com/6236/) - V2SU（Bob McGrew Lightcone Podcast 译文）
