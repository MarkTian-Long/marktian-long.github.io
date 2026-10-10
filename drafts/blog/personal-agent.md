# Personal Agent：当 AI 开始长期接手你的事

> Personal Agent 正在从会完成单次任务的助手，走向能够持续承接个人事务的产品。判断这种形态是否值得留下，关键不是它有几台云电脑、多少个子 Agent，而是它能否在条件变化后继续把事情办好，同时减少用户的管理负担，并始终守住委托边界。

---

2026 年 5 月，Google 在 Gemini App 中推出 [Spark](https://blog.google/innovation-and-ai/products/gemini-app/next-evolution-gemini-app/)，尝试让 AI 在用户离开后仍能处理事务。9 月，Meta 发布 [Muse](https://about.fb.com/news/2026/09/introducing-muse-personal-ai-agent/)，Manus 推出独立个人代理应用 [Cue](https://manus.im/zh-cn/blog/introducing-manus-2-0)，OpenAI 又发布了 [Dots](https://openai.com/zh-Hans-CN/index/introducing-dots/)；创业公司 Instinct 则凭借短信、邮件和电话里的 AI 助理，成为 [The Verge 等媒体关注的消费产品](https://www.theverge.com/tech/1008254/instinct-agent-ai-hands-on-muse-dots)。

如果只看产品发布介绍，它们都在做类似的事：帮用户找资料、发消息、订餐厅、安排旅行，甚至主动处理后续工作。但单次完成任务早已不是新概念。云电脑、记忆、定时运行、多个 Agent，也各有更早的实践。值得讨论的是，这些能力为何开始被重新组合成一种更长期的用户关系。

之前写[《我为什么开始给自己搭 Harness？》](https://marktian-long.github.io/tools/blog/posts/personal-harness.html)时，我更关心怎样让 AI 持续理解自己的工作环境、少重复解释。这次的问题向外走了一步：**如果不是每次由我发起任务，而是让 AI 在一段时间内替我记挂和推进事情，它究竟需要承担什么责任？**

## 一、值得长期委托的，不只是执行动作

想象一件普通的事：你下个月要出行，机票已经订好，酒店还没定；同行人的安排可能变化，出发前又可能碰上航班调整。如果只让 AI 搜索并预订一次，它完成的是一个任务。之后谁记得继续核对行程，发现变化又由谁联系商家、确认成本、处理改签？

对于需要反复协调的事务，真正消耗精力的部分往往不在最后那个点击动作上。社会学者 Allison Daminger 在 [2019 年关于家庭认知劳动的研究](https://journals.sagepub.com/doi/10.1177/0003122419859007)中，将这种看不见的劳动区分为预见需求、寻找选项、作出决定和监督进展。研究基于 35 对伴侣的访谈，说明这些负担早已存在；它并没有证明 AI 一定能把负担减下来。

同样，过去的日历提醒、邮件规则和 [Apple Shortcuts](https://developer.apple.com/videos/play/wwdc2019/213/)早就能触发动作、串联应用。Personal Agent 不该靠“能定时执行”来宣称自己是新物种。它更值得尝试的，是在情况并不完全确定时，根据最新信息调整下一步，同时知道什么时候需要把判断交还用户。

这也限定了它的适用范围。有些事可以用固定规则稳定处理，没有理由换成一个更昂贵、更难监督的生成式系统。有些活动的价值恰恰在亲自参与：挑衣服、逛社区、探索目的地、与朋友讨论，本就不全是等待消除的摩擦。一个好的个人代理，应该帮用户处理他们想卸下的负担，而不是以“效率”为名接走所有过程。

## 二、五款产品，都在尝试不同的委托关系

这里将 Personal Agent 暂且理解为：**在约定范围内，跨多次交互持续管理和推进某类个人事务，并能在环境变化时调整行动的 Agent。** 这是本文用于分析产品职责的工作定义，不是一个有统一技术标准的新品类。一次任务跑了几天、系统记住了用户偏好，或拥有独立邮箱，都不能单独说明它已经承担了持续职责。

五款近期产品采用了不同的入口和经营路径。表中的商业模式只区分实际提供与公开计划，不以价格或融资规模代替经营成效。

| 产品 | 主要服务关系 | 关键产品选择 | 谁付费、为何付费 |
|---|---|---|---|
| [OpenAI Dots](https://openai.com/zh-Hans-CN/index/introducing-dots/) | 个人生活／工作；组织试点 | 长期工作、审批 | 个人／企业套餐；专职试点 |
| [Meta Muse](https://about.fb.com/news/2026/09/introducing-muse-personal-ai-agent/) | 个人生活、小生意 | 独立云端、主动代办 | 个人／小商户进阶订阅 |
| [Gemini Spark](https://blog.google/innovation-and-ai/products/gemini-app/next-evolution-gemini-app/) | Google 个人生态 | 原有账号与应用连接 | 个人 AI 会员捆绑 |
| [Manus Cue](https://manus.im/zh-cn/blog/introducing-manus-2-0) | 个人代理与团队 | 专属身份、Agent 协作 | 早期免费；模式未定 |
| [Instinct](https://colossus.com/episode/instinct-the-personal-agent/) | 日常事务与社交 | 短信电话、低切换 | 当前免费；计划商家分成 |

*这是本文按产品定位作的比较，不是成熟度排名。开放地区、权限和功能仍有限制；表中“组织试点”“计划商家分成”尤其不能视作已形成稳定收入。*

Dots 的个人主代理可以跨会话推进工作，使用自己的云电脑和用户连接的应用；OpenAI 同时在企业试点中探索承担采购、发票、客服等职责的 specialist dots。后者由组织配置身份、访问权限和审批规则，并不是个人版换一种收费名称。Muse 则把个人生活事务作为起点，之后加入面向小商户的[连接和技能](https://about.fb.com/news/2026/09/introducing-muse-small-business/)；Google 的路线更像让代理从 Gmail、日历、文档和浏览器这些原有服务中生长出来，其 [Spark 的套餐扩展](https://blog.google/products-and-platforms/products/google-one/fall-2026-ai-plan-updates/)与企业 Gemini agent 也要分别看。

两家创业公司的选择尤其值得比较。Cue 为不同 Agent 配置邮箱、电话号码、钱包和电脑，让它们可以围绕目标分工；这是 Manus 2.0 发布时推出的独立应用，不能把 Manus 主产品的商业化直接算到 Cue 头上。Instinct 反过来极力减少界面的存在：用户不必进入新 App，只要像联系一个助理那样发消息或打电话。创始人 [Noah Shinn 的访谈](https://colossus.com/episode/instinct-the-personal-agent/)甚至强调，回复前两行是否清楚、什么场合适合打扰用户，可能比再增加一个功能更重要。

这五种定位也对应不同的付款逻辑。个人套餐要证明这项服务值得用户持续订阅，企业方案要证明它能交付工作能力；Instinct 则希望让消费者免费使用、由获得订单的商家承担费用。**消费者在使用，不代表最终一定由消费者付费**，更不意味着成交金额就是代理服务收入。大厂与创业公司共享长期委托的方向，却仍在验证什么样的用户关系和收入机制能够持续成立。

## 三、用户离开后，一件事怎样继续存在？

一次性助手可以在交付答案后结束会话。长期代理却可能在几天后再次面对同一件事：订位仍在候补，某封邮件尚未收到回复，昨天允许的预算今天已经改变，或者任务的前半段已经对外产生效果。

要接住这种变化，系统需要的不只是聊天历史。它至少得区分三种信息：用户真正想达到的结果与限制；外部世界当前可靠的事实以及哪些动作已经生效；下一步尚未完成、正在等待什么条件。将这三种信息混成一段不断增长的“记忆”，很容易让代理把过期偏好当成现行指令，或把计划完成误认成事情已经完成。

这解释了为什么多家公司都在提供独立运行环境。根据[官方帮助文档](https://help.openai.com/en/articles/20001530-getting-started-with-your-dot)，Dots 有自己的云电脑、任务状态及暂停机制；[Muse](https://about.fb.com/news/2026/09/introducing-muse-personal-ai-agent/)强调独立虚拟机，以及应用关闭后继续工作；[Spark](https://blog.google/innovation-and-ai/products/gemini-app/next-evolution-gemini-app/)依托云端任务和已连接的 Google 应用；[Cue](https://manus.im/zh-cn/blog/introducing-manus-2-0)则尝试为每个代理提供专用电脑。它们在解决同一个实际问题：用户不必一直开着聊天窗口，也可以把未完事项交给系统接续。

但**长期委托不等于同一个模型进程、同一台云电脑必须永远在线**。一个任务可以暂停，在外部事件到来时再运行；换一个执行模型，原委托也应该能够恢复。真正重要的是状态能否被接续、结果能否核实、变化会不会被漏掉。对于只需按固定条件提醒的工作，传统自动化依然可能是更可靠的选择；当外部信息含糊、需要重新规划时，生成式 AI 的灵活性才更有价值。

这也带来一项不容易在演示里看见的产品要求：如果 Agent 消失、账户被撤权或用户想换服务商，未完事项、已有承诺和下一次触发条件该怎么办？长期服务越像一种托付，退出和交接就越不能留给用户自己重新回忆。

## 四、它替你记得更多，不等于可以替你决定更多

让 Agent 持续跟进一件事，很容易自然滑向另一个假设：既然它知道我的行程、习惯和预算，是不是应该自己做下一步决定？这两件事必须分开。它可以知道你下周有会议，却未必有权替你购买机票；可以在今天获准发送一封邮件，却不能自动把这理解成今后每封相似邮件都可以直接发出。

而且授权不是一张永久有效的通行证。考虑一个旅行委托：用户批准了某家酒店的预订，之后行程取消。系统不仅要暂停下一笔支出，还要知道已经发生的预订无法靠“忘掉任务”撤销，是否需要进一步联系酒店退款，以及退款失败时应由谁处理。这里有需要代理灵活判断的环节，也有不能省略的正式记录、支付约束和人工介入。

各家正在把这些边界做成实际产品。Dots 提供审批和用户可修改的行动规则；Muse 官方描述了敏感操作确认、审计记录和断开应用访问的能力。这些是厂商说明的控制设计，不是系统不会误操作的保证。Cue 的独立邮箱和钱包、Instinct 在[创始人访谈](https://colossus.com/episode/instinct-the-personal-agent/)中描述的联系人访问范围，则使一件事更加具体：一个代理如果能对外联系、花钱和交换信息，用户就必须知道它此时在代表谁。

当委托涉及多个人，问题更复杂。Google Labs 在 9 月扩展为家庭协作的[CC](https://blog.google/innovation-and-ai/models-and-research/google-labs/cc-expanding-to-groups/)允许成员分别共享信息；Instinct 近期的[群聊代理](https://www.businessinsider.com/instincts-ai-agents-are-coming-to-your-group-chat-2026-10)也需要额外授权才能把个人代理连接进群体任务。家庭、朋友群和企业都可能想让 Agent 协调安排，但“我们有一个共同目标”，不意味着每个人的私人日历、邮件、支付账户就自动向其他人开放。

长期代理不应只有“自动执行”和“每一步都来问我”两个极端。低风险、可逆、边界清楚的动作可以预先约定；涉及钱、对外承诺、敏感信息或条件突然变化时，应把决定交回用户。产品的关键不是让人永远不介入，而是把人的介入留在真正有意义的时刻。

## 五、热潮之后，要看事情有没有真的少让人操心

年初 [OpenClaw 的装机热潮](https://marktian-long.github.io/tools/blog/posts/openclaw-brand-creation.html)已经表明，很多人愿意尝试一个能操作真实软件的个人 Agent。但尝鲜并不等于持续委托。[澎湃新闻 3 月的报道](https://www.thepaper.cn/newsDetail_forward_32752436)记录了安装后不知用来做什么、Token 成本和安全顾虑，以及由此出现的卸载服务。它能说明某些用户的尝试遇到了阻力，却不能计算整个项目的卸载率或长期留存，更不能证明这类需求已经失败。

Instinct 则提供了另一面。The Verge 记者在[10 月初的实际试用](https://www.theverge.com/tech/1008254/instinct-agent-ai-hands-on-muse-dots)中，让它联系医生办公室、启动退货，还让它查找孩子的游泳课程。它能够理解模糊指令，却漏掉了报名所需的前置课程。任务看上去已经向前推进，真实世界的关键条件却可能还没有满足。一个普通搜索助手出错，用户通常会自己继续查；一个被长期委托的代理出错，问题可能直到报名截止、付款完成或事情没有发生时才显现。

因此，判断 Personal Agent 值不值得留下，不应该只看它每周回答了多少条消息、跑了多少任务，也不能只看用户打开 App 的频率。**后台服务做得越好，用户可能反而越少想起它。** 更有意义的检验，是经过一个完整的事务周期之后，原本要用户记挂的事是否被正确推进，用户投入多少时间交代、核查、催办和补救；如果停止服务，这些工作是不是又回到了用户身上。

商业化也要沿着这条价值链来判断。Dots、Spark 主要作为既有个人或企业会员的一部分交付；Muse 采用基础免费与进阶订阅，Cue 尚在早期免费阶段。Instinct 创始人提出了另一种可能：用户免费，向获得订单的商家收取交易分成。这解释了为何旅行这样的高客单价事务受关注，但创始人谈到的交易额不等于 Agent 已经获得的收入，商业模式仍待验证。

这里有两道现实约束。第一，用户希望它处理的并不都是交易：跟进邮件、等待回复、撤销订阅和退款，未必产生新的购买佣金。第二，商家希望更多成交，用户最好的决定有时却恰好是“不买”。[Business Insider 10 月的采访](https://www.businessinsider.com/instinct-users-say-its-ai-agent-is-pushing-unsolicited-products-2026-10)记录了用户收到未经请求的商品推荐；报道没有证据证明这些是付费广告或 Instinct 从中获利，但它已经把“主动帮忙”和“主动创造消费机会”的界线变成了真实产品问题。

旅行平台的关系也比“取代携程”复杂。用户以后可能只对 Agent 说一句“帮我订好”，不再打开旅行 App，但实时库存、订单、改签、支付与售后仍需要有人提供。携程管理层在[2026 年 2 月的财报电话会](https://investors.trip.com/static-files/931f23d1-d597-4a28-9391-479a54b6107d)中也谈到与外部 Agent 对接，以及自建 AI 规划和预订能力。个人代理可能改变入口和渠道价值，却不必然取代整个旅行服务体系。这样的产业利润分配值得另写，放在本文只需要说明：一笔交易做成了，距离长期服务真正成立还有相当远的路。

现在几家大厂和创业公司都已把“替人长期处理事务”做成了可辨认的产品方向。还不能确定它会成为每个人独立付费的新入口，还是逐渐融入既有应用与企业服务。对于用户而言，更实际的检验是：**把一件事托付出去以后，AI 有没有持续把它办好，并且在需要你做决定的时候，确实把决定留给你。**

## 参考资料

**一手文件／官方发布**

- [OpenAI：dot 正式登场](https://openai.com/zh-Hans-CN/index/introducing-dots/)
- [OpenAI：Getting started with your dot](https://help.openai.com/en/articles/20001530-getting-started-with-your-dot)
- [Meta：Introducing Muse](https://about.fb.com/news/2026/09/introducing-muse-personal-ai-agent/)
- [Meta：Muse for Small Business](https://about.fb.com/news/2026/09/introducing-muse-small-business/)
- [Google：The Gemini app becomes more agentic](https://blog.google/innovation-and-ai/products/gemini-app/next-evolution-gemini-app/)
- [Google：Google AI plan updates](https://blog.google/products-and-platforms/products/google-one/fall-2026-ai-plan-updates/)
- [Google Labs：CC for families](https://blog.google/innovation-and-ai/models-and-research/google-labs/cc-expanding-to-groups/)
- [Manus：Introducing Manus 2.0 and Cue](https://manus.im/zh-cn/blog/introducing-manus-2-0)
- [Instinct 创始人访谈：Invest Like the Best](https://colossus.com/episode/instinct-the-personal-agent/)
- [Apple WWDC 2019：Shortcuts](https://developer.apple.com/videos/play/wwdc2019/213/)
- [Trip.com：2025 Q4 and full-year earnings call transcript](https://investors.trip.com/static-files/931f23d1-d597-4a28-9391-479a54b6107d)

**学术研究**

- [Daminger：The Cognitive Dimension of Household Labor（2019）](https://journals.sagepub.com/doi/10.1177/0003122419859007)

**独立媒体与真实使用反馈**

- [The Verge：Instinct hands-on（2026-10-09）](https://www.theverge.com/tech/1008254/instinct-agent-ai-hands-on-muse-dots)
- [Business Insider：Instinct unsolicited shopping recommendations（2026-10-05）](https://www.businessinsider.com/instinct-users-say-its-ai-agent-is-pushing-unsolicited-products-2026-10)
- [Business Insider：Instinct group chat agents（2026-10）](https://www.businessinsider.com/instincts-ai-agents-are-coming-to-your-group-chat-2026-10)
- [澎湃新闻：OpenClaw 装机热潮后的卸载与培训（2026-03-12）](https://www.thepaper.cn/newsDetail_forward_32752436)

**相关阅读（作者已发布文章）**

- [《我为什么开始给自己搭 Harness？》](https://marktian-long.github.io/tools/blog/posts/personal-harness.html)
- [《OpenClaw 爆红背后：一个品类的诞生与宿命》](https://marktian-long.github.io/tools/blog/posts/openclaw-brand-creation.html)