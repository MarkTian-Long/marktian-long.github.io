# Personal Agent：当 AI 开始长期接手你的事

> Personal Agent 并非新发明；2026 年的一批产品正在尝试让 AI 不只执行某个任务，还能长期代表个人跟进、协调和处理事务。它是否值得保留，取决于用户是否真的减少了记挂、催办和跨服务协调的负担，而不是它有多少个 Agent 或多大的行动权限。

---

2026 年 5 月，Google 在 Gemini App 中推出 [Spark](https://blog.google/innovation-and-ai/products/gemini-app/next-evolution-gemini-app/)，尝试让 AI 在用户离开后继续办事。8 月 11 日，xAI 发布 [Grok Bot](https://x.ai/news/introducing-grok-bot)，主打持续工作的 AI 同事与多 Bot 协作。9 月，Meta 发布 [Muse](https://about.fb.com/news/2026/09/introducing-muse-personal-ai-agent/)，Manus 推出独立个人代理应用 [Cue](https://manus.im/zh-cn/blog/introducing-manus-2-0)，OpenAI 又发布了 [Dots](https://openai.com/zh-Hans-CN/index/introducing-dots/)；创业公司 Instinct 则凭借短信、邮件和电话里的 AI 助理，成为 [The Verge 等媒体关注的消费产品](https://www.theverge.com/tech/1008254/instinct-agent-ai-hands-on-muse-dots)。

这些产品并不完全属于同一种市场：有的主要接受个人委托，有的承接组织分配的职责。但它们共享一种产品尝试：用户不只交出眼前的一步操作，还希望有服务持续记得未完成的事，并主动协调后续。对 Personal Agent 而言，关键不在于这些能力是否第一次出现，而在于它能否稳定代表一个人的目标，把原本分散在不同应用和联系人之间的事务接起来。

之前写[《我为什么开始给自己搭 Harness？》](https://marktian-long.github.io/tools/blog/posts/personal-harness.html)时，我更关心怎样让 AI 持续理解自己的工作环境、少重复解释。这次的问题向外走了一步：**当我把一类事情长期交出去以后，AI 能不能替我承担原本必须亲自记挂、协调、催办和补救的那部分工作？**

## 一、值得长期委托的，不只是执行动作

想象一件普通的事：你下个月要出行，机票已经订好，酒店还没定；同行人的安排可能变化，出发前又可能碰上航班调整。如果只让 AI 搜索并预订一次，它完成的是一个任务。之后谁记得继续核对行程，发现变化又由谁联系商家、确认成本、处理改签？

对于需要反复协调的事务，真正消耗精力的部分往往不在最后那个点击动作上。社会学者 Allison Daminger 在 [2019 年关于家庭认知劳动的研究](https://journals.sagepub.com/doi/10.1177/0003122419859007)中，将这种看不见的劳动区分为预见需求、寻找选项、作出决定和监督进展。研究基于 35 对伴侣的访谈，说明这些负担早已存在；它并没有证明 AI 一定能把负担减下来。

同样，过去的日历提醒、邮件规则和 [Apple Shortcuts](https://developer.apple.com/videos/play/wwdc2019/213/)早就能触发动作、串联应用。Personal Agent 不该靠“能定时执行”来宣称自己是新物种。它更值得尝试的，是在情况不完全确定、事务跨越多个服务时，持续发现未完成事项、处理变化并安排后续，不要求用户每次重新组织整件事。

这也限定了它的适用范围。有些事可以用固定规则稳定处理，没有理由换成一个更昂贵、更难监督的生成式系统。有些活动的价值恰恰在亲自参与：挑衣服、逛社区、探索目的地、与朋友讨论，本就不全是等待消除的摩擦。一个好的个人代理，应该帮用户处理他们想卸下的负担，而不是以“效率”为名接走所有过程。

## 二、六款产品分别适合哪种委托？

个人代理并不是 2026 年才提出的想法。MIT 在[1995 年介绍软件代理研究](https://news.mit.edu/1995/agents-0816)时，就区分了了解特定用户兴趣、习惯并代表其行动的 user bot，与执行一般任务的 task bot。今天常见的聊天式 Assistant 和任务型 Agent 也不是 Personal Agent 的两个必经历史阶段：前者可以长期了解用户，后者的一次任务也可能跨越数天。

本文把 Personal Agent 理解为一种产品职责：**代表一个人，在约定范围内持续跟进某类事务，必要时协调不同应用和相关方，并根据新的情况推进后续工作。** 这是本文归纳的工作定义，不是统一行业标准。记住偏好、拥有独立邮箱，或完成一个很长的任务，都不能单独证明它已经承担了持续职责。

要理解六款产品的差异，可以先问自己：想交出去的是跨周项目、每天的生活琐事，还是需要多人分工的工作？下面按典型委托场景列出值得优先了解的产品。

| 我想交出去的事 | 优先了解 | 主要区别 | 付费方与方式 |
|---|---|---|---|
| 个人项目、研究跟进 | [OpenAI Dots](https://openai.com/zh-Hans-CN/index/introducing-dots/) | 跨任务接续与审批 | 个人／企业会员 | 
| 预约、旅行等生活杂事 | [Meta Muse](https://about.fb.com/news/2026/09/introducing-muse-personal-ai-agent/) | 主动代办、独立代理 | 个人／小商户订阅 | 
| Google 邮件和日程 | [Gemini Spark](https://blog.google/innovation-and-ai/products/gemini-app/next-evolution-gemini-app/) | 原有账号应用连接 | 个人 AI 套餐 | 
| 团队共用 AI 工作伙伴 | [Grok Bot](https://x.ai/news/introducing-grok-bot) | 共享 Bot 和工作背景 | 个人／团队／企业 | 
| 多个代理分别对外办事 | [Manus Cue](https://manus.im/zh-cn/blog/introducing-manus-2-0) | 独立邮箱、电话、钱包 | 早期免费；模式待定 | 
| 用短信电话处理生活事 | [Instinct](https://colossus.com/episode/instinct-the-personal-agent/) | 消息入口、低切换 | 免费；计划商家分成 | 

*“优先了解”按官方产品定位匹配场景，并非同任务实测后的性能排名。几款产品都可能处理表中的其他事情；开放地区、功能、邀请资格和授权范围仍有限制。“计划商家分成”不是已实现收入。*

从生活事务看，Muse 与 Instinct 都想替用户处理预约、旅行和日常安排，但前者以独立代理提供主动服务，后者尽量融入已有的短信、电话与邮件习惯。如果已经习惯用 Gmail、日历等服务整理生活，Spark 更值得先了解：它可以利用原有账号和应用中的背景信息。[Spark 的会员扩展](https://blog.google/products-and-platforms/products/google-one/fall-2026-ai-plan-updates/)和 Muse [面向小商户的扩展](https://about.fb.com/news/2026/09/introducing-muse-small-business/)也体现了不同的获客路线。目前没有可靠的同任务对照数据，无法据此断言谁更会订旅行。

在工作场景中，Dots 与 Grok Bot 的区别不是谁能处理更多任务。Dots 的个人主代理侧重一个人跨项目持续推进，[帮助文档](https://help.openai.com/en/articles/20001530-getting-started-with-your-dot)也强调任务接续与行动控制；它面向组织的 specialist dots 仍属试点。Grok Bot 强调可分工的 AI 同事，[9 月 3 日](https://x.ai/news/grok-bot-for-enterprise)推出企业版，[9 月 28 日](https://x.ai/news/team-bots)又推出可由团队共享工作背景与职责的 Team Bots。Dots 的主代理更偏个人工作的连续性，Grok Team Bots 更强调团队可复用的工作背景；个人和团队的功能与付费方式也可能交叉。

需要几个代理分别对外联系、在限定预算内付款时，Cue 的设计值得关注：每个 Agent 有独立邮箱、电话、钱包和电脑，可以围绕一个目标分工。相比之下，[Grok Bot 官方文档](https://docs.x.ai/grok-bot/computer-and-apps)说明，同一用户的多个 Bot 共享一台云电脑以及其中的文件、登录状态；这使共同工作的资料更容易接续，也意味着角色名称本身不能充当权限隔离。Instinct 的另一种取舍则是减少交代事情的负担：创始人 [Noah Shinn 在访谈中](https://colossus.com/episode/instinct-the-personal-agent/)特别强调消息前两行是否清楚、什么时候适合打扰用户。**这几种设计分别优化的是独立对外行动、团队共享协作和日常交流，而不是同一条能力排行榜。**

这六种定位也对应不同的付款逻辑。个人或团队套餐要证明这项服务值得持续订阅，企业方案要证明它能交付工作能力；Instinct 则希望让消费者免费使用、由获得订单的商家承担费用。**消费者在使用，不代表最终一定由消费者付费**，更不意味着成交金额就是代理服务收入。这些差异帮助用户选择从哪款产品开始了解，却还没有回答更重要的一件事：如果一周后用户不再反复提醒，委托能不能继续推进？

## 三、用户离开后，一件事怎样继续存在？

一次任务型 Agent 可以运行很久，也可以在交付后结束；个人代理则尝试把用户交出去的一类事情长期放在自己的待办里。几天后，订位仍在候补，邮件还没收到回复，预算已经改变，或者前一次动作已经对外生效。区别不在一次任务跑了多久，而在下一次变化出现时，是否仍有人替用户接着处理。

要接住这种变化，系统需要的不只是聊天历史。它至少得区分三种信息：用户真正想达到的结果与限制；外部世界当前可靠的事实以及哪些动作已经生效；下一步尚未完成、正在等待什么条件。将这三种信息混成一段不断增长的“记忆”，很容易让代理把过期偏好当成现行指令，或把计划完成误认成事情已经完成。

拿餐厅候补举例。假设用户周一没有订到位置，代理需要保留人数、日期、时间范围和可接受的变更条件，记录“仍在候补”，并知道在什么情况下应重新查询。周三出现空位时，还要核对用户要求是否仍然有效；一旦预订真正生效，就应停止重复寻找，而不是每隔一段时间机械地重新执行旧指令。

独立云电脑、已经连接的应用以及按事件重新启动的任务，都可能承载这样的工作。实现方式不同，用户真正需要的却一样：**不再反复交代之后，代理仍知道事情推进到哪里、下一步等什么，以及什么时候该停止。**

但**长期委托不等于同一个模型进程、同一台云电脑必须永远在线**。一个任务可以暂停，在外部事件到来时再运行；换一个执行模型，原委托也应该能够恢复。真正重要的是状态能否被接续、结果能否核实、变化会不会被漏掉。对于只需按固定条件提醒的工作，传统自动化依然可能是更可靠的选择；当外部信息含糊、需要重新规划时，生成式 AI 的灵活性才更有价值。

这也带来一项不容易在演示里看见的产品要求：如果 Agent 消失、账户被撤权或用户想换服务商，未完事项、已有承诺和下一次触发条件该怎么办？长期服务越像一种托付，退出和交接就越不能留给用户自己重新回忆。

## 四、当一件事牵涉多方，Agent 怎样继续代表你？

上节讨论的是同一件事隔了几天还能不能接着做。但个人事务经常还横跨不同服务和其他人。让 Agent 帮忙安排旅行，可能需要联系同行人、查询酒店政策、调整日历、处理付款。航班改变后，谁发现哪些安排受到影响，谁联系各方，谁继续跟进未完成的调整？今天，这些工作往往靠用户亲自把几个应用和联系人的信息串起来。**Personal Agent 更值得研究的角色，是尝试成为这段跨服务协调工作的持续经办人。**

它不必自己提供机票、酒店或支付服务。那些实际商品、库存和履约能力依然可以由专业服务商提供。它要做的是围绕一个人的目标组织不同服务：例如按原预算完成旅行、让同行人知道变化、避免重复预订，并在某个环节卡住时继续寻找解决办法。如果每遇到一家新服务商，用户都要重新解释全部背景并自己追踪结果，那么代理只接管了分散的操作，没有接管协调负担。

当一件事涉及多个人，“代表谁”就更重要。[Google Labs 的家庭代理 CC](https://blog.google/innovation-and-ai/models-and-research/google-labs/cc-expanding-to-groups/)让家庭成员分别决定共享哪些信息；Instinct 的[群聊代理](https://www.businessinsider.com/instincts-ai-agents-are-coming-to-your-group-chat-2026-10)也要求个人代理另行获得授权，才能进入群体协作。一个家庭或朋友群有共同安排，不代表每个人的私人邮件、日历和支付账户都自动合并。Dots 的组织专职代理、Grok 的团队 Bot 更是另一种关系：它们的部分职责由组织而非单个个人配置。技术上都可以长期工作，但委托方不同，代理需要维护的关系也不同。

这种差异一旦进入真实沟通，就会暴露风险。[Business Insider 10 月 9 日记录的一位使用者自述](https://www.businessinsider.com/personal-ai-agent-grok-bot-posted-bank-details-company-slack-2026-10)中，个人财务月报被 Grok Bot 发到了公司高管 Slack 群；当事人称事后撤销了部分账户连接。这个个案不能说明总体事故率，却提示了一个具体问题：知道一份资料、能使用某个聊天渠道，不等于获准把资料发送给渠道中的所有人。

授权还会随事务变化。用户可能已经批准预订酒店，随后却取消行程；代理不仅要停止后续支出，还要查清已生效订单如何处理、联系谁申请退款，以及退款迟迟未到账时是否继续跟进。这里必须分清哪些动作可以自主进行、哪些需要请示。**授权决定代理能做到哪一步；用户真正希望节省的，是事务跨越多个参与方时反复跟进、协调和补救的劳动。**

## 五、热潮之后，要看事情有没有真的少让人操心

年初 [OpenClaw 的装机热潮](https://marktian-long.github.io/tools/blog/posts/openclaw-brand-creation.html)已经表明，很多人愿意尝试一个能操作真实软件的个人 Agent。但尝鲜并不等于持续委托。[澎湃新闻 3 月的报道](https://www.thepaper.cn/newsDetail_forward_32752436)记录了安装后不知用来做什么、Token 成本和安全顾虑，以及由此出现的卸载服务。它能说明某些用户的尝试遇到了阻力，却不能计算整个项目的卸载率或长期留存，更不能证明这类需求已经失败。

Instinct 则提供了另一面。The Verge 记者在[10 月初的实际试用](https://www.theverge.com/tech/1008254/instinct-agent-ai-hands-on-muse-dots)中，让它联系医生办公室、启动退货，还让它查找孩子的游泳课程。它能够理解模糊指令，却漏掉了报名所需的前置课程。任务看上去已经向前推进，真实世界的关键条件却可能还没有满足。一个普通搜索助手出错，用户通常会自己继续查；一个被长期委托的代理出错，问题可能直到报名截止、付款完成或事情没有发生时才显现。

因此，判断 Personal Agent 值不值得留下，不应该只看它每周回答了多少条消息、跑了多少任务，也不能只看用户打开 App 的频率。**后台服务做得越好，用户可能反而越少想起它。** 更有意义的检验，是经过一个完整的事务周期之后，原本要用户记挂的事是否被正确推进，用户投入多少时间交代、核查、催办和补救；如果停止服务，这些工作是不是又回到了用户身上。

商业模式能否成立，也要用同一尺度检验。个人会员或企业采购，终究要证明代理能长期节省精力、交付工作成果，足以让用户续费或组织持续投入预算；已有套餐捆绑的能力，还要分清是带来新收入，还是只提高原有会员的使用价值。Instinct 创始人提出另一条路线：消费者免费，由获得订单的商家支付分成。旅行事务可能带来较大的交易额，但平台交易额不等于代理收入，更无法证明那些没有新购买的长期事务已有人为之付费。

这里有两道现实约束。第一，用户希望它处理的并不都是交易：跟进邮件、等待回复、撤销订阅和退款，未必产生新的购买佣金。第二，商家希望更多成交，用户最好的决定有时却恰好是“不买”。[Business Insider 10 月的采访](https://www.businessinsider.com/instinct-users-say-its-ai-agent-is-pushing-unsolicited-products-2026-10)记录了用户收到未经请求的商品推荐；报道没有证据证明这些是付费广告或 Instinct 从中获利，但它已经把“主动帮忙”和“主动创造消费机会”的界线变成了真实产品问题。

现在几家大厂和创业公司都已把“替人长期处理事务”做成了可辨认的产品方向。还不能确定它会成为每个人独立付费的新入口，还是逐渐融入既有应用与企业服务。对用户而言，留下这项服务的理由不在于它某一次回答得多好，而在于一段时间后，自己有没有少做那些记挂、联络、协调和补救的工作。**如果这些未完事项仍需要人一件件盯着，Personal Agent 就还没有比一个能执行任务的工具走远多少。**

## 参考资料

**一手文件／官方发布**

- [xAI：Introducing Grok Bot（2026-08-11）](https://x.ai/news/introducing-grok-bot)
- [xAI：Grok Bot for Enterprise（2026-09-03）](https://x.ai/news/grok-bot-for-enterprise)
- [xAI：Team Bots（2026-09-28）](https://x.ai/news/team-bots)
- [xAI：Grok Bot 的云电脑与应用权限](https://docs.x.ai/grok-bot/computer-and-apps)
- [MIT News：Software agents can smooth users' interactions with computers（1995）](https://news.mit.edu/1995/agents-0816)
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

**学术研究**

- [Daminger：The Cognitive Dimension of Household Labor（2019）](https://journals.sagepub.com/doi/10.1177/0003122419859007)

**独立媒体与真实使用反馈**

- [Business Insider：Grok Bot 个人财务资料误发工作群（2026-10-09）](https://www.businessinsider.com/personal-ai-agent-grok-bot-posted-bank-details-company-slack-2026-10)
- [The Verge：Instinct hands-on（2026-10-09）](https://www.theverge.com/tech/1008254/instinct-agent-ai-hands-on-muse-dots)
- [Business Insider：Instinct unsolicited shopping recommendations（2026-10-05）](https://www.businessinsider.com/instinct-users-say-its-ai-agent-is-pushing-unsolicited-products-2026-10)
- [Business Insider：Instinct group chat agents（2026-10）](https://www.businessinsider.com/instincts-ai-agents-are-coming-to-your-group-chat-2026-10)
- [澎湃新闻：OpenClaw 装机热潮后的卸载与培训（2026-03-12）](https://www.thepaper.cn/newsDetail_forward_32752436)

**相关阅读（作者已发布文章）**

- [《我为什么开始给自己搭 Harness？》](https://marktian-long.github.io/tools/blog/posts/personal-harness.html)
- [《OpenClaw 爆红背后：一个品类的诞生与宿命》](https://marktian-long.github.io/tools/blog/posts/openclaw-brand-creation.html)