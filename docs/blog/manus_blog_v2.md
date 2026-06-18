# Manus：它卖的不是 Agent，是一次认知震撼

Manus 最火的时候，我没有付费进去。不是因为穷，而是因为我判断自己不需要它。这篇文章是事后复盘这个判断——哪里对了，哪里想浅了，以及它被 Meta 以 20 亿美元买走这件事，究竟说明了什么。

---

## 我为什么没有付费

2025 年 3 月，Manus 刷屏的时候，我作为一个有 LLM 产品经验的 AI PM，看完演示视频，做了一个决定：不付费，不进去。

理由很简单，两条。

第一，我用深度研究模式已经能满足日常需求——搜集信息、多轮推理、输出报告，这些 Manus 的演示场景我基本都有工具覆盖了。第二，我隐约感觉它被过度包装了。当时已经有媒体报告实际效果没有演示视频那么流畅，[MIT Technology Review 的实测](https://www.technologyreview.com/2025/03/11/1113133/manus-ai-review/)也写到 Manus 会在任务中途"偷懒"，用它自己的话说是"时间限制导致加速了研究过程"。

这个判断大体上是对的。但我后来意识到，我对 Manus 的理解停留在"它是一个更强的深度研究工具"这个层面——而这个理解本身就是错的。

## 它到底是什么

Manus 由武汉团队 Butterfly Effect（母公司 Monica.im）开发，[于 2025 年 3 月 6 日正式上线](https://www.technologyreview.com/2025/03/11/1113133/manus-ai-review/)，自我定位为"全球首个 General AI Agent"。它没有自研大模型，底层调用 Anthropic 的 Claude 3.5 Sonnet 和阿里巴巴 Qwen 的微调版本，核心是一套多 Agent 协作的任务执行系统。

Manus 和深度研究的本质差异，不在于谁的报告写得更好，而在于**一个只会读，一个还会动手**。

深度研究的边界是信息世界：搜集网页 → 整理分析 → 输出文字。全程不触碰任何真实系统的状态。Manus 多出来的核心能力是：登录账号、填表、点按钮、执行代码、部署应用。它能改变外部世界的状态。

这个差异在我的日常任务里确实不重要——我要的是分析报告，不是让 AI 替我操作某个后台系统。但对另一类用户来说，这个差异是决定性的：那些有重复性跨平台操作任务、但没有技术能力把它工程化的人。跨境电商卖家监控多平台价格、HR 在不同招聘网站之间搬运候选人信息——这类任务深度研究做不了，Manus 能做。

技术架构上，Manus 的设计哲学是"少结构，多智能"：多个专职子 Agent 并发执行（规划、验证、搜索各司其职），通过工具调用体系接触外部世界，任务在云端后台异步运行，用户不需要盯着屏幕等。最有辨识度的交互是"Manus's Computer"侧边栏——用户可以实时观察 Agent 在做什么，并在任何环节介入干预。

## 产品演进：从爆红到被收购

**2025 年 3 月，发布期。** 邀请码机制、极度有限的访问量、精心策划的 Demo 场景，[上线 7 天候补名单突破 200 万人](https://www.infotech.com/research/assessing-manus-the-future-of-agentic-ai)。邀请码在社交媒体上被炒卖，[Jack Dorsey、Hugging Face 产品负责人 Victor Mustar 等科技圈知名人士公开称赞](https://www.technologyreview.com/2025/03/11/1113133/manus-ai-review/)。核心能力是网页研究、数据分析、基础代码任务，"Manus's Computer"作为核心交互创新亮相。

**2025 年 3-9 月，早期迭代。** 可靠性是这一阶段被批评最多的问题。[MIT Technology Review 实测记录了 Manus 在复杂任务中的"偷懒"行为](https://www.technologyreview.com/2025/03/11/1113133/manus-ai-review/)，暴露了 General Agent 的结构性困境：任务链越长，错误累积概率越高。这一阶段的迭代重点是稳定性和错误恢复，同期[与阿里 Qwen 团队达成战略合作](https://www.leanware.co/insights/manus-ai-agent)，补充算力基础设施。

**2025 年 10 月，1.5 版本。** 这是 Manus 迄今最重要的一次更新，官方将其描述为"对整个引擎的全面重新设计"。[平均任务完成时间从约 15 分钟降至不到 4 分钟，约提升 4 倍；内部基准测试显示任务质量提升 15%](https://skywork.ai/blog/ai-agent/manus-1-5-vs-earlier-versions-2025-comparison/)（均为官方内部数据，未经独立验证）。最重磅的能力扩展是全栈应用构建：用户只需用自然语言描述需求，Manus 1.5 可以生成并部署一个带有后端数据库、用户认证、内嵌 AI 能力的完整 Web 应用。同时推出 Manus-1.5-Lite 对全部用户开放，完整版为订阅用户专属的 freemium 分层策略。

**2025 年 12 月，被 Meta 收购。** [Meta 以超过 20 亿美元收购 Manus，谈判历时约 10 天](https://www.cnbc.com/2025/12/30/meta-acquires-singapore-ai-agent-firm-manus-china-butterfly-effect-monicai.html)。此前 Manus 已在上线 8 个月内实现年化经常性收入（ARR）超过 1 亿美元，[Butterfly Effect 自称这是史上增速最快的 SaaS 产品之一](https://techcrunch.com/2025/12/29/meta-just-bought-manus-an-ai-startup-everyone-has-been-talking-about/)。

## 三个核心决策

**通用还是垂直：一个有意识的赌注。** Manus 选择做 General AI Agent，而不是某个垂直场景的专用工具。通用的代价是结构性的：任务边界越模糊，失败模式越难预测；用户不知道它最擅长什么，信任建立的路径更长。但通用的收益也是结构性的：可寻址市场远大于任何垂直场景，更重要的是——**第一个让大众感知到"AI 原来可以这样用"的产品，本身就是巨大的市场教育价值**。这个价值不体现在某一个具体任务的完成质量上，而是体现在它在用户心智里打开的那扇门。Manus 赌的不是"通用 Agent 比垂直 Agent 更好用"，而是"成为那个打开认知的产品，本身就是足够大的价值"。

**过程可视化：信任保险，不是功能。** "Manus's Computer"侧边栏让用户实时看到 Agent 在做什么。大多数用户不会真的盯着看完整个执行过程，顶多瞄一眼几个大步骤是否在正确方向上。但如果这个窗口不存在，焦虑感会完全不同——你不知道它在做什么，不知道要等多久，不知道出了问题怎么介入。可视化的作用是一种"信任保险"：不是因为用户会用它，而是因为不可以没有它。代价是沙盒可视化本身消耗大量资源，但这个成本是值得付的。

**新加坡注册、Benchmark 投资：退出路径的前期设计。** Butterfly Effect 原本注册在北京，后来迁移到新加坡。主打英文界面，放弃国内市场，[接受美国顶级 VC Benchmark 领投的 7500 万美元 A 轮](https://techcrunch.com/2025/12/29/meta-just-bought-manus-an-ai-startup-everyone-has-been-talking-about/)，同时逐步清理中国股东结构。把这几个动作放在一起看，指向一个清晰的逻辑：从一开始就把"被美国大厂收购"设计为可能的退出路径。但这不等于 Manus 不认真做产品——只有产品真的能用、ARR 真的做上去，才能拿到足够高的收购价。更准确的描述是：Manus 在认真做产品的同时，也在认真设计退出，这两件事不矛盾，后者是前者的商业理性。而且这个退出有时间压力——没有自研模型意味着基模厂商自己下场只是时间问题，估值窗口不会永远开着。

## 局限在哪里

**成本结构不可持续。** Manus 没有自研大模型，底层调用成本加上沙盒运行、多 Agent 并发的基础设施开销，单任务成本极高。1 亿美元 ARR 在这个成本结构下，大概率是亏损运营的，这不是靠规模效应能解决的结构性问题。

**可靠性天花板。** General Agent 的可靠性问题是结构性的。任务链越长，错误累积概率越高；任务越通用，边界条件越难穷举。企业客户对任务失败的容忍度远低于个人用户，这是 Manus 往 B 端走的根本障碍。

**模型依赖是估值窗口有限的根本原因。** Manus 没有自研大模型，底层跑在 Anthropic 的 Claude 和阿里的 Qwen 上。这个依赖关系在短期内不是问题，但长期来看是结构性的：[OpenAI 的 Operator、Google 的 Mariner、Anthropic 的 Computer Use](https://www.technologyreview.com/2025/03/11/1113133/manus-ai-review/) 都在做 Agent 产品，它们天然拥有模型加执行一体化的优势，不需要依赖外部授权。当基模厂商自己下场，纯 execution layer 的独立价值会被持续压缩——不是因为 Manus 做得不好，而是因为上游供应商本身就是最强的潜在竞争者。这个逻辑也解释了为什么 Manus 必须在估值窗口最高点完成退出：基模厂商还没有成熟 Agent 产品、但市场已经验证了需求的这个时间段，才是 execution layer 作为独立资产估值最高的时刻。

## 更大的判断：Meta 买的是什么

[Meta 以超过 20 亿美元收购 Manus，谈判历时约 10 天](https://www.bloomberg.com/news/articles/2025-12-29/meta-acquires-startup-manus-to-bolster-ai-business)，同时承诺收购完成后不存在任何中国所有权利益，并关闭在中国的运营。

Meta 买到的不是大模型——Manus 没有自研模型。买到的是三样东西：一套经过大规模真实任务压力测试的 execution layer，[处理了超过 147 万亿 tokens、运行了超过 8000 万个虚拟计算机实例](https://manus.im/blog/manus-joins-meta-for-next-era-of-innovation)；1 亿美元 ARR 和数百万付费用户；以及进入 Agent 赛道的时间。

最后这一点是关键。Meta 的 AI Agent 能力本可以自研，但自研的时间成本太高，竞争窗口正在关闭。Manus 用 8 个月完成了从 0 到市场验证的全套动作，Meta 用 20 亿买走的，本质上是这 8 个月。

这笔收购也在更大的层面上发出了一个信号：**AI 时代的价值，正在从"谁的模型更强"向"谁能把模型能力可靠地转化为真实任务完成结果"转移**。Manus 没有自己的模型，但它证明了 execution layer 可以独立成为一个 20 亿美元的资产。

---

Manus 最终的价值，不在于它的 Agent 有多强，而在于它是第一个让足够多的普通人感受到"AI 原来可以替我把事情做完"的产品。这个认知一旦打开，就不会再关上——哪怕 Manus 本身被收购、被整合、被迭代替代。

我当时没有付费进去，从个人需求的角度判断是对的。但如果问这个产品值不值得认真分析，答案是值得——不是因为它的技术有多先进，而是因为它完整走完了一条从认知创造到商业变现的路径，而且这条路径从一开始就是设计好的。

## 参考资料

- [TechCrunch: Manus probably isn't China's second 'DeepSeek moment'](https://techcrunch.com/2025/03/09/manus-probably-isnt-chinas-second-deepseek-moment/)
- [MIT Technology Review: Everyone in AI is talking about Manus. We put it to the test.](https://www.technologyreview.com/2025/03/11/1113133/manus-ai-review/)
- [TechCrunch: Meta just bought Manus, an AI startup everyone has been talking about](https://techcrunch.com/2025/12/29/meta-just-bought-manus-an-ai-startup-everyone-has-been-talking-about/)
- [Bloomberg: Meta Acquires Startup Manus to Bolster AI Business](https://www.bloomberg.com/news/articles/2025-12-29/meta-acquires-startup-manus-to-bolster-ai-business)
- [CNBC: Meta acquires intelligent agent firm Manus](https://www.cnbc.com/2025/12/30/meta-acquires-singapore-ai-agent-firm-manus-china-butterfly-effect-monicai.html)
- [Info-Tech Research Group: Assessing Manus: The Future of Agentic AI](https://www.infotech.com/research/assessing-manus-the-future-of-agentic-ai)
- [Manus 官方博客: Manus Joins Meta for Next Era of Innovation](https://manus.im/blog/manus-joins-meta-for-next-era-of-innovation)
- [Skywork: Manus 1.5 vs Earlier Versions](https://skywork.ai/blog/ai-agent/manus-1-5-vs-earlier-versions-2025-comparison/)
- [Leanware: Manus AI Agent](https://www.leanware.co/insights/manus-ai-agent)
