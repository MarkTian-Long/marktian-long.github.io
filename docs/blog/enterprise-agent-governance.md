# 为什么企业开始谈 Agent「纳管」？

> Agent 纳管不只是因为企业里的 Agent 变多了。真正开始出现的问题是：当 Agent 访问企业数据、调用工具和执行真实动作后，本来属于公司的身份、权限、审批和责任规则，如果仍散落在每个应用里维护，就很难保持一致；但这些规则最终应该落在哪个平台，目前还没有定型。

---

我真正开始留意“Agent 纳管”，是最近两件小事碰到了一起。

前段时间，工作群里有人转了一篇腾讯云 4 月发布的 [ADP Agent Portal](https://adp.tencentcloud.com/zh/blog/adp-agent-portal) 文章。里面讨论的已经不只是怎么开发一个 Agent，而是当企业里的 Agent 分散在不同团队和平台以后，怎么统一纳入管理、调度和治理。

如果只有这一篇，我可能会把它当成厂商对 Agent 平台的一次产品扩展。但这周和一家头部券商交流时，对方也提到了“纳管”。

这当然不足以说明券商行业已经普遍走到这一步，但两个信号碰到一起，我开始认真想一个问题：**Agent 真正进入企业以后，为什么还会多出一个“管 Agent”的问题？**

这刚好接上我之前两篇文章里的思考。[《一个业务流程，到底应该拆成几个 Agent？》](https://marktian-long.github.io/tools/blog/posts/agent-boundary.html)更多讨论单个 Agent 的边界：它负责什么结果、可以知道什么、又能做什么；[《从 WorkBuddy 到 FDE：企业 Agent 为什么会走向不同落地方式？》](https://marktian-long.github.io/tools/blog/posts/enterprise-agent-fde.html)则往生产环境推进了一步：Agent 一旦开始读取真实数据、修改系统状态和推动后续流程，权限、审批、审计和责任归属都会变得重要。

但这两篇文章基本都在回答同一个层级的问题：怎么管好**这个 Agent**。

如果一家企业同时出现销售 Agent、客服 Agent、投研 Agent、研发 Agent，而且它们来自不同团队、不同 SaaS 和不同 AI 平台，原来由每个应用自己处理的边界，还适合继续各管各的吗？

本文所说的“纳管”先取一个很朴素的定义：**不管一个 Agent 在哪里开发、由谁提供，企业至少能知道它存在、知道谁负责、知道它被允许做什么，并在需要时追溯行为、撤销权限或停用它。**

## 一、不是 Agent 变多了，而是公司规则散落了

假设一家企业只有一个销售 Agent，需要读取 CRM。

产品团队给它配置好权限：哪些客户信息能看，哪些字段不能看，修改关键数据必须经过人工确认。到这里没有太大问题。

后来客服团队也做了一个 Agent，同样访问 CRM，于是重新配置一遍权限。再后来，运营和客户成功团队也各自做了 Agent。

这时候公司调整了一条数据访问规则：**某类敏感客户信息，从今天开始只有特定岗位可以访问。**

如果访问规则都维护在各个 Agent 自己的配置里，这条本来属于公司的规则，就会变成四五份甚至十几份应用配置。企业不但要逐个修改，还得先回答：哪些 Agent 正在使用这项权限？谁批准的？有没有长期没人维护的 Agent 还保留旧权限？员工换岗或离职以后，相关权限有没有一起变化？

**真正麻烦的不是第十个 Agent 比第一个更难开发，而是同一条企业规则开始被复制很多遍。**

所以 Agent 数量并不是根因。几十个只能回答公开 FAQ 的 Agent，治理要求可能依然很轻；一个能够付款、修改合同或访问高敏感数据的 Agent，即使只有一个，也可能需要严格控制。

更准确地说，当同一套公司规则开始影响多个 Agent、Agent 开始代表员工或组织执行真实动作、Agent 又来自不同团队和平台时，“每个应用自己管自己”的成本和风险都会明显增加。Agent 数量只是把这个问题放大了。

## 二、纳管统一的不是 Agent 怎么干活，而是企业允许它做什么

如果解决办法只是“把所有东西都塞进一个统一后台”，同样会走到另一个极端。

一个销售 Agent 怎么分析客户、先查财报还是先读 CRM、失败后怎么调整策略，这些属于它自己的业务逻辑。企业没有必要把所有 Prompt、任务规划和工具调用顺序都统一规定，否则 Agent 也失去了动态决策的意义。

真正值得区分的是两类事情：

| **维度** | **Agent / 业务应用负责** | **企业更适合统一负责** |
|---|---|---|
| **任务执行** | Prompt、规划、重试 | 通常不统一 |
| **身份责任** | 在授权身份下执行 | 身份、责任人、所属组织 |
| **权限策略** | 在授权范围内选择 | 数据、工具权限和风险规则 |
| **高风险操作** | 发起操作请求 | 审批门槛 |
| **效果与留痕** | 场景业务指标 | 最低评测、轨迹和审计要求 |
| **生命周期** | 局部重试、降级 | 撤权、暂停、停用 |

*这是本文为了说明边界所做的归纳，不是行业标准，也不试图覆盖全部 Agent 治理能力。实际边界还取决于行业监管、业务风险和企业已有系统。*

这里的“统一”，不是让所有 Agent 获得同样的权限。

销售 Agent 和客服 Agent 完全可以看到不同的数据。企业真正需要统一的是**规则从哪里来**：最好由同一套可信的身份和权限体系判断“这个人、这个 Agent、在这个场景下能做什么”，而不是四个团队分别在自己的 Prompt、代码和配置里解释一遍。

评测也是类似的。企业可以统一要求高风险 Agent 保留必要的执行轨迹、关键动作和审计记录，但销售 Agent 的效果可能看商机转化，客服 Agent 看问题解决率，投研 Agent 又有自己的准确性和合规要求。

**统一的是企业底线和规则来源，不是每个 Agent 的具体业务策略。**

这样再看“纳管”，其实可以压成几个很具体的问题：它是谁？谁负责？它被允许做什么？出了问题以后，能不能把权力收回来？

最后一个问题尤其重要。

开发 Agent 时，我们天然会关注怎么给它更多数据、工具和行动能力；企业还必须关心另一半：员工离职以后权限能不能一起失效，某个接口出现风险能不能统一禁用，一个长期无人维护的 Agent 谁能停掉，异常发生后能不能还原它做过什么。

**企业级纳管不仅是授权，也是撤权。**

Agent 还会让传统身份与权限问题变得更复杂。Meta AI 高级总监 [Madhu Gurumurthy](https://x.com/realmadhuguru) 此前在 Google 领导过 Gemini、Veo 等模型产品，他最近在 [X 上抛过一个很具体的问题](https://x.com/realmadhuguru/status/2080315474093760714)：传统 IAM（身份与访问管理）原本是围绕数量相对有限的员工设计的，当企业开始拥有大量 Agent 时，身份和访问应该怎么管理？

沿着这个问题往下想，Agent 与普通员工账号最大的不同之一，是它可能只是为了某个任务临时获得能力，也可能代表员工去调用另一个系统。于是权限不再只是“这个人能不能访问 CRM”，还会变成“这个 Agent 代表谁行动、这次任务被授予了什么权限、任务结束后这些权限什么时候失效”。

Madhu 的帖子只能算从业者侧的问题信号，不足以证明企业已经普遍遇到同一种架构难题；但它至少把“纳管”从一个平台名词拉回到一个很具体的问题：**当 Agent 成为新的执行主体，企业原有的身份和权限体系需要开始回答过去没有遇到的问题。**

## 三、这个问题已经开始进入真实产品

前面腾讯那篇文章只能说明一家厂商已经开始把“管理一群 Agent”产品化，还不足以证明这是一个更普遍的问题。

Vercel 自己的内部实践提供了一个更具体的参照。Vercel 在 2026 年 6 月发布的 [Enterprise Apps and Agents](https://vercel.com/blog/vercel-for-enterprise-apps-and-agents) 中披露，过去一年里，内部员工已经发布了数百个 Agent 和内部应用。真正困难的问题反而是在这些应用进入公司内部使用之后出现的：谁可以使用每个 Agent？怎么保证内部 Agent 不暴露到外部？Agent 可以访问哪些数据和系统？

这是 Vercel 自己披露的内部实践，不是独立第三方调研。但它的处理方式很值得观察：Vercel 没有继续要求每个 Builder 分别把安全配置做好，而是把 ownership（责任归属）、access（访问控制）和 security（安全边界）做成平台默认能力。比如企业身份提供方配置一次后，可以自动应用到内部应用和 Agent；Agent 访问外部系统时使用按任务发放、任务结束后失效的短期凭证，而不是长期密钥。

这和前面的 CRM 例子其实是同一个问题：**不是团队没有能力自己配置权限，而是有些公司规则一旦需要被几十、几百个 Agent 反复遵守，就不应该再依赖每个 Builder 分别做对。**

Vercel 自己的生产 Agent 又给出了一个更具体的权限例子。[Vercel Agent](https://vercel.com/blog/vercel-agent)拥有独立身份，默认只有只读权限；需要回滚部署、修改配置等真实操作时，它会先提出计划，由人批准后获得只针对这次任务的短期权限，任务结束后重新回到只读状态。谁发起、谁批准、最后由 Agent 执行，也分别留下记录。

这里已经能看到前一章“授权和撤权”的实际形态：**能力可以给 Agent，但不必永久给；Agent 可以行动，但行动不必和发起人的身份混在一起。**

再看第三方研究，IDC 在 2026 年讨论[企业级 AI 编排](https://www.idc.com/resource-center/blog/futurescape-2026-charting-the-path-to-enterprise-wide-orchestration/)时，也把从孤立部署走向集中协调列为规模化 AI 面临的问题之一，并提出通过统一控制层协调 Agent、Workflow（工作流）和治理机制。

到这里，“纳管”已经不太像腾讯一家厂商自己的产品概念：它既出现在企业客户的讨论里，也开始在内部 Agent 数量真正上来后的实践里暴露，还被第三方研究和不同企业软件平台分别产品化。

但各家对于“这层能力应该长在哪里”的答案仍然不同。

[Microsoft Agent 365](https://www.microsoft.com/en-us/microsoft-agent-365)直接把自己定义为 Agent 的 Control Plane（控制平面），重点面向 IT 和安全团队。Microsoft 的[官方安全说明](https://learn.microsoft.com/en-us/security/security-for-ai/agent-365-security)列出的风险就包括 Agent Sprawl（Agent 分散增长）、权限过大的 Agent 和工具滥用，并把 Agent 可见性、身份和安全控制接入原有的 Entra、Defender、Purview 等体系。

[ServiceNow AI Control Tower](https://www.servicenow.com/products/ai-control-tower.html)代表另一条路线。它不是从 Agent 开发工具起步，而是把企业已有的 IT 资产和治理体系继续向 AI 扩张。[2026 年的官方发布](https://newsroom.servicenow.com/press-releases/details/2026/ServiceNow-expands-AI-Control-Tower-to-discover-observe-govern-secure-and-measure-AI-deployed-across-any-system-in-the-enterprise/default.aspx)强调发现不同系统中的 AI，再把 Agent、模型、身份、风险、合规和运行表现接回统一治理体系。

它们共同说明的并不是“Control Plane 已经形成标准产品”，而是一件更小的事：

**一些原本容易散落在单个 Agent 里的企业控制能力，开始被当成多个 Agent 可以共同依赖的能力。**

## 四、需要统一规则，不等于一定要多一套平台

走到这里，很容易顺势得出一个更大的结论：企业以后都会单独采购一套 Agent Control Plane。

现在还不能这么判断。

企业需要统一身份、权限、策略、审计和生命周期，首先是一个**逻辑上的需求**；这些能力最后放在哪套产品里，则是另一个问题。

AWS 就提供了一个很好的反例。[Amazon Bedrock AgentCore Policy](https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/policy.html)没有要求企业先建设一个独立的 Agent 管理门户，而是把策略执行放在 Agent 代码之外：Agent 真正调用工具之前，由 Gateway（网关）按照确定性策略判断这次操作是否允许。重点仍然是企业规则可以在 Agent 之外统一定义，而不用分别复制进每个 Agent。

类似能力也可以从 Agent 开发平台往上长，或者由 IAM（身份与访问管理）、安全平台、ITSM（IT 服务管理）等原有企业系统向 Agent 扩张。

所以相比争论 Control Plane 会不会成为一个独立新品类，我现在更关心几个实际问题：一个平台能不能发现不是自己创建的 Agent？能不能把企业已有的身份、权限和策略真正施加到这些 Agent 上？需要的时候，能不能撤权、停用并保留完整的责任记录？

如果只能汇总运行日志，而真正的权限仍然分别藏在每个 Agent 里，它更多解决的是观测问题；如果只能很好地管理自己平台开发的 Agent，它解决的更多是平台内部治理。

真正的企业级纳管，至少意味着**管理范围开始越过单个 Agent、单个团队，甚至单个开发平台。**

因此，目前相对确定的并不是“Agent Control Plane 这个新品类已经成立”，而是：

**Agent 开始真正行动以后，一部分本来属于企业的控制规则，不能继续跟着每个 Agent 一起分散下去。**

至于这些规则最终由一套独立系统承载，还是继续长在企业已有的平台里，现在仍然是开放问题。

---

写到这里，我又想起之前那篇[《从同义词表到业务语义层》](https://marktian-long.github.io/tools/blog/posts/ontology-business-semantic-layer.html)。

那篇文章最初从一张同义词表出发，最后讨论的是：既然多个 AI 应用都在同一家企业里工作，就不应该让它们分别解释一遍“客户”“收入”“有效合同”到底是什么意思，而应该逐步把关键业务含义沉淀成可以复用的企业资产。

现在看 Agent 纳管，其实像是同一个问题的另一面。

**业务语义层解决的是：多个 AI 不应该各自理解一遍同一个企业。**

**Agent 纳管解决的是：多个 Agent 也不应该各自维护一遍企业允许它们做什么。**

前者更关心 AI 如何理解企业里的对象、关系、口径和规则；后者更关心 Agent 真正开始行动以后，身份、权限、审批和责任边界从哪里来。

所以，对企业来说，可能比“要不要买一个 Agent Control Plane”更值得先想清楚的是：

**哪些决定属于某个 Agent 自己，应该允许它持续迭代；哪些规则从一开始就不属于任何一个 Agent，而应该属于整个企业。**

---

## 参考资料

### 一手文件 / 官方发布

- [腾讯云 ADP：企业级 AI 智能体管理平台 Agent Portal](https://adp.tencentcloud.com/zh/blog/adp-agent-portal)
- [Vercel for Enterprise Apps and Agents](https://vercel.com/blog/vercel-for-enterprise-apps-and-agents)
- [Introducing the new Vercel Agent](https://vercel.com/blog/vercel-agent)
- [Microsoft Agent 365](https://www.microsoft.com/en-us/microsoft-agent-365)
- [Microsoft：Agent 365 安全与治理说明](https://learn.microsoft.com/en-us/security/security-for-ai/agent-365-security)
- [ServiceNow AI Control Tower](https://www.servicenow.com/products/ai-control-tower.html)
- [ServiceNow：AI Control Tower 跨系统治理能力](https://newsroom.servicenow.com/press-releases/details/2026/ServiceNow-expands-AI-Control-Tower-to-discover-observe-govern-secure-and-measure-AI-deployed-across-any-system-in-the-enterprise/default.aspx)
- [AWS：Policy in Amazon Bedrock AgentCore](https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/policy.html)

### 行业研究

- [IDC：Charting the Path to Enterprise-Wide AI Orchestration](https://www.idc.com/resource-center/blog/futurescape-2026-charting-the-path-to-enterprise-wide-orchestration/)

### 社区讨论

- [Madhu Gurumurthy：Agent 与传统 IAM 的身份治理问题](https://x.com/realmadhuguru/status/2080315474093760714)（代表从业者问题意识，不作为行业普及率或效果数据）

### 历史文章

- [一个业务流程，到底应该拆成几个 Agent？](https://marktian-long.github.io/tools/blog/posts/agent-boundary.html)
- [从 WorkBuddy 到 FDE：企业 Agent 为什么会走向不同落地方式？](https://marktian-long.github.io/tools/blog/posts/enterprise-agent-fde.html)
- [从同义词表到业务语义层：企业 AI 如何减少对业务含义的猜测](https://marktian-long.github.io/tools/blog/posts/ontology-business-semantic-layer.html)
