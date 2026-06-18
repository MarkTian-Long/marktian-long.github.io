# 你叫它智能体，但它可能只是个工作流

> 当"智能体"成为招聘关键词和社媒热词，真正值得追问的是：你以为自己在做的那个东西，到底是什么？

## 两个并行的现象

最近打开招聘平台，AI PM 的岗位描述里有一个词出现频率极高：智能体。与此同时，社交媒体上关于智能体的博文也从未停止——某公司上线了多智能体协作系统，某平台发布了新的 agent 框架，某创业公司用智能体把人工成本砍掉了一半。

声量很大。但有一组数据让我觉得值得停下来想一想。

这个现象不只发生在国外。[《中国企业家人工智能应用调研报告（2025）》](https://m.bjnews.com.cn/detail/1753782186129556.html)显示，89.84% 的受访企业声称已在实际业务中部署 AI 应用。但细看具体场景，率先落地的主要是智能客服、知识库问答、内容生成——这些基本都是流程固定的工作流形态。国际上也是类似的情况，根据 [Bain 2024 年的调查](https://towardsdatascience.com/a-developers-guide-to-building-scalable-ai-workflows-vs-agents/)，79% 的企业声称正在实施 AI agent，但其中只有 1% 认为这些实施是"成熟的"。[Gartner 预测](https://www.gartner.com/en/newsroom/press-releases/2025-08-26-gartner-predicts-40-percent-of-enterprise-apps-will-feature-task-specific-ai-agents-by-2026-up-from-less-than-5-percent-in-2025) 2026 年底将有 40% 的企业应用集成 task-specific agent，同时也预测超过 [40% 的 agentic AI 项目](https://www.outreach.io/resources/blog/agent-washing-ai-projects-fail-guide)将在 2027 年底前被取消，原因是成本失控、商业价值不清晰、风险控制不足。市场预期很高，失败率也很高，两个数字并排放在一起，本身就说明了问题。

这个落差不是偶然的。它指向一个更基础的问题：大家在说"智能体"的时候，说的是同一件事吗？

## 智能体到底是什么

在讨论企业在做什么之前，需要先把概念说清楚。

判断一个系统是不是智能体，核心标准不是它用了什么技术栈，也不是节点数量，而是**决策权在哪里**，以及**有没有自我反馈回路**。

用这个标准，可以区分出三个层级：

**工作流**：路径由人预先定义，AI 在固定节点上执行任务。整个流程是有向的、单向的，出了分支按规则走，不会自己调整方向。Coze、Dify 上大多数"智能体"本质上属于这一类，只是把 if-else 换成了 LLM 判断，但流程还是人工设计好的。

**伪智能体**：能自主选择调用哪个工具，但没有真正的自我评估机制。执行完一步不会主动判断结果是否达标，更不会根据反馈回溯重来。看起来比工作流"智能"，但缺少关键的闭环。

**真智能体**：有完整的感知-决策-执行-反馈循环。执行后会评估输出是否达到目标，不达标则调整策略，必要时重新执行。决策路径在运行时动态生成，而不是事先规划好的。

有一个常见误解值得单独说：很多人认为单个 agent 不算智能体，必须多个 agent 协作才算。这个判断不太准确。Multi-agent 系统解决的是分工和协作问题，是在单 agent 基础上的扩展，不是智能体的必要条件。反过来也成立：多个 agent 协作，如果每个 agent 本身没有反馈回路，只是把工作流拆成了多段分布式执行，本质还是工作流，不因为数量多就变成真智能体。

举个例子：一个代码审查 agent，接收一个 PR 后，自己决定先读代码、再查相关文档、发现问题后回溯重新检查、最终输出报告。整个过程是单个 agent，但它有完整的反馈回路，跟直接调用一次 API 有本质区别。大多数"单 agent 等于 API 调用"的感知，来自于实现得过于简陋，把 LLM 加固定 prompt 就当成了 agent。

## 企业里真实在做的是什么

理解了定义之后，再来看企业侧的实际情况。

我在某金融科技公司参与过一套 RAG 系统的开发。业务场景是金融信息的跨源汇聚与比对——数据来自三个方向：API 数据厂商的结构化行情数据、需要实时联网抓取的新闻资讯，以及历史研报、政府公告等非结构化文件。这三类数据的格式、更新频率、可信度完全不同，核心问题是怎么把它们整合成可以被查询和推理的知识库。技术实现上，整套流程由工程师预先设计好：数据清洗、分块、向量化、检索、LLM 做内容理解和提取，每一步做什么、输出给谁，都是提前定义好的有向图。LLM 在里面是"聪明的执行者"，负责理解和生成，不负责决策流程走向。

按照上面的三级标准，这套系统最多算伪智能体。但它在当时的业务场景里解决了真实问题，运行稳定，交付了可验证的价值。用"伪"来定性，不是说它没用，而是说它的实际架构和"智能体"这个词所暗示的能力之间，存在明显的距离。

根据 [Gartner 2025 年 8 月的数据](https://www.gartner.com/en/newsroom/press-releases/2025-08-26-gartner-predicts-40-percent-of-enterprise-apps-will-feature-task-specific-ai-agents-by-2026-up-from-less-than-5-percent-in-2025)，真正自主运行的 agent 在企业生产环境中渗透率不足 5%，AI 工作流已经相当普遍。这不是技术限制造成的，更多是企业自身准备度的问题——场景没想清楚、数据质量差、基础应用效果就已经不稳定，在这个基础上谈真智能体，链路只会更长，问题只会更难定位。

## 为什么"智能体"这个词被用滥了

落差存在，但原因不是单一的。

供应商侧有明确的动机。"智能体"是当前企业科技市场最热的标签，打上这个标签可以提高产品溢价、进入更高预算的采购决策。[Gartner 把这种现象定义为"Agentwashing"](https://www.gartner.com/en/newsroom/press-releases/2025-08-26-gartner-predicts-40-percent-of-enterprise-apps-will-feature-task-specific-ai-agents-by-2026-up-from-less-than-5-percent-in-2025)，专指把 AI 助手、聊天机器人、规则自动化系统包装成 agent 出售的行为，本质是用市场热度掩盖产品能力的实际边界。这不一定是恶意的，但结果是一样的：企业买到的和预期的不是同一件事。

企业侧的情况略有不同。很多决策者并不真正理解工作流和智能体的区别，看到"智能体"这个词觉得足够先进，就拿来描述自己正在做或计划做的事。这更多是被概念带跑，而不是主动欺骗。但效果类似：实际推进的项目和对外描述的目标之间存在明显落差，内部资源的分配也因此容易失准。

两种情况叠加，造成了今天这个局面：招聘 JD 写智能体，社媒热词是智能体，但落地的大多数是工作流，能跑通的更少。

## 工作流够用吗

在讨论企业为什么没有准备好之前，有一个问题值得先回答：对于当前大多数企业，工作流到底够不够用？

答案是：在很多场景下，够用，而且是更合适的选择。

流程固定、输入规范、容错成本低的场景——合同信息提取、客服问题分类、报告自动生成——工作流的稳定性和可控性反而是优势。真智能体的动态决策能力在这类场景里是过度设计，带来的是更高的工程复杂度和更难预测的输出结果。

真正需要真智能体的场景，是任务目标明确但路径不固定、中间步骤需要根据结果动态调整的情况。这类场景在企业里存在，但比想象中少，而且对数据质量和系统可观测性的要求更高。

所以更准确的判断不是"工作流会被智能体替代"，而是——在想清楚场景之前，先把工作流做稳，是更务实的路径。

## 为什么真智能体在企业侧还很远

即便场景合适，真智能体的落地也面临几个比技术更基础的障碍。

一是数据质量。真智能体需要在运行时做动态判断，低质量的输入会被放大成更不可控的输出。但大多数企业内部的数据现状，连支撑稳定的工作流都勉强，遑论更高要求的动态决策。

二是链路长度带来的风险累积。真智能体意味着更多的自主决策节点，每增加一个动态决策点就增加一层不确定性。链路越长，出问题的概率越高，问题定位也越难。在没有完善的可观测性工具和回滚机制之前，这个风险很难被企业接受。

三是成本问题。真智能体需要多轮推理和工具调用，[Token 消耗量较传统对话式应用提升上百倍](https://adg.csdn.net/696f3883437a6b403369af2d.html)，直接推高运行成本。对于缺乏精细化成本管控能力的中小企业，这是一道实际的门槛，不是优化一下 prompt 就能解决的。

四是商业价值的量化难度。工作流的收益相对容易衡量——处理速度提升了多少、人工成本降低了多少。真智能体因为路径动态、结果多样，收益的归因更复杂，在向决策层证明投入产出比的时候，这是一个实际的障碍。

这四个问题不是模型能力的问题，是企业自身准备度的问题。

---

我不认为工作流是一个贬义词。在大多数企业的当前阶段，一个运行稳定、交付可验证价值的工作流，比一个概念上更先进但跑不稳的"智能体"有用得多。

Agentwashing 是一个认知和利益的混合问题，不会因为模型变强就自动消失。概念的混乱不会阻止技术进步，但会让很多企业在错误的期待里浪费掉本可以验证的机会。

---

## 参考资料

- [A Developer's Guide to Building Scalable AI: Workflows vs Agents](https://towardsdatascience.com/a-developers-guide-to-building-scalable-ai-workflows-vs-agents/)
- [Gartner Predicts 40% of Enterprise Apps Will Feature Task-Specific AI Agents by 2026](https://www.gartner.com/en/newsroom/press-releases/2025-08-26-gartner-predicts-40-percent-of-enterprise-apps-will-feature-task-specific-ai-agents-by-2026-up-from-less-than-5-percent-in-2025)
- [Agent washing exposed: Why 40% of AI projects fail in 2025](https://www.outreach.io/resources/blog/agent-washing-ai-projects-fail-guide)
- [AI Agents vs. AI Workflows: Why Pipelines Dominate in 2025](https://intuitionlabs.ai/articles/ai-agent-vs-ai-workflow)
- [The dangers of AI agentwashing](https://www.thoughtworks.com/en-us/insights/blog/generative-ai/Agentwashing-and-how-AI-agents-fail-us)
- [中国企业家人工智能应用调研报告（2025）](https://m.bjnews.com.cn/detail/1753782186129556.html)
- [2025年中国企业AI应用落地深度研究](https://adg.csdn.net/696f3883437a6b403369af2d.html)
