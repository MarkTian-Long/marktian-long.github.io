# 视频模型到底在进化什么？为什么“画面惊艳”已经不够了

> 三年前，视频模型连人物的手和一盘意大利面都很难保持正确；今天，“画面像真的”反而越来越不够用了。真正拉开差距的，正在变成模型能否持续保持状态、可靠兑现创作意图，并在出错后保留已经正确的部分——最终让一个可用结果越来越少依赖运气。

---

我第一次真正被 AI 视频刷屏，还是 2024 年的 Sora。那时最震撼的地方很直接：此前的视频生成还经常伴随着脸部融化、人物突然变形和奇怪的运动，Sora 展示出来的很多片段却已经接近真实摄影。OpenAI 当时甚至把这项研究称为“Video generation models as world simulators”，并观察到随着训练规模扩大，模型开始表现出三维空间一致性、物体持久性和较长时间的一致性。[OpenAI：Video generation models as world simulators](https://openai.com/index/video-generation-models-as-world-simulators/)

但因为自己的工作和使用习惯并不直接围绕视频制作，我后来其实没有持续追每一代模型。真正让我重新注意这个领域，是最近半年一些更贴近生活的变化：我的信息流里 AI 短剧明显多了，也开始不断看到原本自己拍视频的创作者讨论 AI 带来的压力。公开报道里的变化更加具体，一些全 AI 短剧的制作周期已经可以压到 5 天以内，成本大约是真人项目的十分之一。[Caixin Global：China’s Short-Drama Makers Rush to Ride AI Boom as Production Costs Plunge](https://www.caixinglobal.com/2026-03-17/chinas-short-drama-makers-rush-to-ride-ai-boom-as-production-costs-plunge-102423944.html)

另一个让我意外的信号来自可灵。2026 年 7 月，可灵以约 150 亿美元投前估值引入超过 28 亿美元外部资金，融资后快手仍持有约 68% 股权；到了 9 月初，可灵的投后估值已经和快手整个上市公司的公开市值处在非常接近的量级。[Reuters：Alibaba, Tencent back Kuaishou's Kling AI in $2.8 billion fundraise](https://www.reuters.com/world/china/alibaba-tencent-back-kuaishous-kling-ai-28-billion-fundraise-2026-07-03/) [CompaniesMarketCap：Kuaishou Technology Market Cap](https://companiesmarketcap.com/kuaishou-technology/marketcap/) 上市公司实时市值和私募融资估值当然不是完全相同的口径，也不能把子公司的估值和母公司的市值直接相加；但一个 2024 年才推出的视频生成业务，两年后已经被资本市场单独给出这样的定价，本身已经足够值得注意。

当然，这些变化还远不足以说明 AI 视频已经取代真人拍摄，今天的视频模型也没有解决生产里的全部问题。正因为“生成一段看起来很真的视频”不像三年前那么稀奇，我才开始更想知道：**这些公司现在到底还在快速迭代什么？**

在[上一篇《多模态到底统一了什么？》](https://marktian-long.github.io/tools/blog/posts/multimodal-unification.html)里，我把多模态理解和多模态生成分开讨论过：通用模型越来越能共同理解文字、图片、声音和视频，并不意味着图片、语音和视频的生成端也必须全部合并成一个万能模型。视频生成恰好提供了一个更具体的后续问题：过去三年，它真正进化的究竟是什么？

## 一、一盘意大利面，为什么能代表视频生成的变化？

如果想直观理解视频生成有多难，一个经典案例其实已经足够：Will Smith 吃意大利面。

2023 年那段著名的 “Will Smith eating spaghetti” AI 视频里，人物的脸、嘴、手、餐具和面条不断扭曲、纠缠。后来这个提示词几乎变成了一项民间测试，新模型发布后总有人再让 Will Smith 吃一次意大利面。Stanford 2025 AI Index 甚至专门用不同年份的版本展示视频生成质量的巨大变化。[Stanford HAI：AI Index Report 2025](https://hai.stanford.edu/assets/files/hai_ai-index-report-2025_chapter2_final.pdf)

它好笑，是因为错误太明显；但从技术上看，这其实是一道相当复杂的题。如果只是生成一张 Will Smith 吃面的图片，模型只需要保证一个瞬间成立。到了视频里，上一秒建立起来的世界必须被下一秒继承：还是同一个人，还是那双手，餐具还在正确的位置，盘子里的面条应该随着动作发生变化，人物转头以后不能突然换脸，被遮挡的手重新出现时也不能多出一根手指。

因此，**视频不是简单地连续生成很多张漂亮图片，而是在时间推进时不断继承一个已有状态，再对其中一部分进行合理修改。**

沿着这个角度，过去很多容易统一叫作“一致性”的问题，其实对应着不同层面的失败：

| **读者看到的现象** | **底层真正失败的地方** | **模型需要补的能力** |
|---|---|---|
| 脸、手指、材质本身画错 | 当前状态没有生成正确 | 视觉质量、人体结构 |
| 人物转身后换脸、物体凭空复原 | 过去状态没有被继承 | 时间、身份、状态一致性 |
| 手穿过杯子、人物抓不住物体 | 对象关系无法持续成立 | 交互关系保持 |
| 碰撞、重力、液体运动不合理 | 状态变化规律错误 | 运动、物理、常识 |
| 视频很好看，但不是创作者想要的 | 太多状态由模型自行决定 | 参考素材、首尾帧、镜头和动作控制 |
| 改一个地方却让整段一起变化 | 无法保留正确状态、局部更新 | 视频编辑 |
| 时间变长后人物和剧情逐渐漂移 | 状态和约束无法长期继承 | 视频延展、多镜头、长叙事 |
| 口型、对白、动作声对不上 | 不同模态没有在同一时间线上同步 | 音视频联合生成 |

*这是本文为了理解视频生成演进所做的归纳，不是行业统一分类。不同失效之间存在交叉，例如手指异常既可能是一帧本身生成错误，也可能在运动过程中逐渐产生。*

今天的 benchmark 也越来越明确地区分这些问题。VBench-2.0 不再只看画面质量、时间连贯和基本提示遵循，而是进一步加入人体真实性、物理、常识和可控性等维度；Physics-IQ 则专门用流体、光学、材料、磁力、热力学等物理现象测试视频模型，并发现视觉真实感和物理正确性之间并不存在简单对应关系。一个视频完全可以看起来非常自然，里面发生的事情却仍然不符合真实规律。[VBench-2.0](https://vchitect.github.io/VBench-2.0-project/) [Physics-IQ](https://openaccess.thecvf.com/content/WACV2026/html/Motamed_Do_Generative_Video_Models_Understand_Physical_Principles_WACV_2026_paper.html)

所以 Will Smith 的意大利面真正代表的，并不只是“AI 画质从很差变得很好”。它让视频生成更底层的难点变得直观：**模型不仅要把当前世界生成出来，还必须记住过去的世界，并让这个世界按照合理的方式继续变化。**

## 二、三年时间里，真正扩大的，是模型能管理的状态范围

回头看过去三年，很容易把视频模型的发展总结成一串表面指标：画质更高、人物更稳、物理更合理、控制更多、视频更长。但这些变化背后其实存在一条更连续的技术逻辑——模型能够稳定管理的东西越来越多。

2023 年，最基础的问题还是“当前这一刻能不能成立”。人物的脸、手和物体关系都可能随时崩掉，模型首先需要解决的是一帧本身，以及很短时间里不要立即失去连续性。

到了 2024 年，Sora 把这个问题明显向前推进。OpenAI 不只展示了更真实的画面，还观察到模型开始表现出简单的物体持久性、空间一致性和长程一致性。换句话说，它开始不只是负责“现在画什么”，而是在一定程度上维护“刚才发生过什么”。Sora 当年已经可以生成最长一分钟视频，但 OpenAI 同时明确展示了很多失败：玻璃破碎可能不符合物理规律，物体状态会错误改变，长时间生成也并不总能保持一致。[OpenAI：Video generation models as world simulators](https://openai.com/index/video-generation-models-as-world-simulators/)

到了 2025 年，模型需要管理的对象第一次明显超出了画面本身。早期 Sora 等主流视频生成模型主要输出无声视频，而 Google 在 Veo 3 发布时把原生对白、环境声和音效作为关键升级，Sora 2 也把同步对白和音效纳入模型输出，同时强调更准确的物理表现和更强的可操控性。[Google：Veo 3 与 Flow 发布](https://blog.google/innovation-and-ai/products/google-ai-updates-may-2025/) [OpenAI：Sora 2 is here](https://openai.com/index/sora-2/)

声音并不是简单在视频后面多加一条轨道。谁在说话、口型何时变化、杯子什么时候落地、环境声怎样随镜头切换，都要和已经生成的视觉事件落在同一条时间线上。视频模型需要维护的状态，因此从“这个世界现在是什么样”，进一步扩张到“这个世界现在听起来也应该是什么样”。一个很有意思的变化是，Will Smith 吃意大利面的老测试到了 Veo 3 时，画面已经自然很多，但人们很快又注意到新的违和感——面条发出了不符合直觉的脆响。几年前最显眼的问题还是脸和手会不会变形；视觉质量提高以后，音画是否属于同一个世界反而开始变得值得挑剔。[Ars Technica：Google’s Will Smith double is better at eating AI spaghetti … but it’s crunchy?](https://arstechnica.com/ai/2025/05/googles-will-smith-double-is-better-at-eating-ai-spaghetti-but-its-crunchy/)

到 2026 年，模型需要维护的内容又增加了一层：除了自己之前生成了什么，还要记住**创作者规定了什么不能变、接下来希望怎样变化，以及结果出来以后哪些部分已经确认正确**。Seedance 2.5 把 30 秒长叙事、多模态参考和精确编辑同时放进核心能力，并明确说用户需求正在从“生成一个片段”转向“完成一个创作作品”；Kling 3.0 也把参考生成、视频内编辑、叙事控制和原生音频组织进同一套多模态架构。[ByteDance Seed：Seedance 2.5](https://seed.bytedance.com/en/blog/one-take-creation-flexible-referencing-introducing-seedance-2-5) [Kuaishou：Kling AI 3.0](https://ir.kuaishou.com/news-releases/news-release-details/kling-ai-launches-30-model-ushering-era-where-everyone-can-be)

所以更准确的演进并不是“先解决画质，再轮到一致性，然后轮到物理和控制”。**模型能够管理的范围，是从当前画面扩张到过去状态，再扩张到状态怎样变化，最后继续扩张到创作者施加的约束和已经生成的正确结果。** 前面的能力当然没有彻底解决，只是随着它们越来越可靠，下一层问题开始更明显地决定模型是否可用。

这也解释了一个看起来有些反直觉的现象：视频模型发展得极快，但“最长能生成多少秒”却不是一条稳定向上的曲线。2024 年的 Sora 研究版已经能展示一分钟视频；到今天，Runway Gen-4.5 的基础生成仍主要集中在 2 到 10 秒，而 Kling、Seedance、Wan 又分别在 15 秒、30 秒等范围寻找不同平衡。[Runway：Gen-4.5](https://help.runwayml.com/hc/en-us/articles/46974685288467-Creating-with-Gen-4-5) [Alibaba Cloud：Wan 3.0 Video Generation](https://docs.modelstudio.console.alibabacloud.com/en/model-studio/wan3-video-generation-guide)

如果视频生成只是一个不断拉长时间的 scaling 问题，这种演进并不好解释。作品最终当然会越来越长，但模型真正有价值的进步，未必是一次生成得更久，而可能是**在有限时间里更可靠地继承状态、执行约束，并让已经正确的东西不用重新来一次。**

## 三、从随机生成到可靠兑现意图，中间到底差了什么？

早期文字生成视频最吸引人的想象一直很简单：输入一段文字，然后得到一段视频。这种体验很容易让人进一步想象，既然自然语言已经能描述创作意图，那么未来复杂的视频制作工具是不是最终只需要留下一个提示词输入框？

重新看这一轮视频模型以后，我不太认为终点会这么简单。如果真的让我做一个 30 秒的视频，我自己的第一反应也不会是写一大段提示词直接交给 Seedance。更自然的方式是先和 GPT 这样的模型讨论故事结构、镜头顺序和几个关键分镜，再把已经确定的内容交给视频模型。原因不是提示词不够长，而是视频里存在大量创作者并不希望模型随意决定的变量：人物是谁、穿什么衣服，场景和光线是什么，镜头从哪里开始、怎样移动，下一镜里哪些东西必须继续保持。

“一个人在雨夜离开车站”只说明了大致语义。剩下的变量如果全部交给模型自由发挥，它当然可以不断生成不同但都合理的答案。在 Demo 阶段，这种随机性能够制造惊喜；真正创作时，它却意味着反复得到“不错，但不是我要的那一个”。

这也是为什么过去两年越来越多视频模型开始强调**参考素材（Reference）、首尾帧控制、镜头控制、动作控制和分镜**。它们看起来是不同产品功能，底层其实都在缩小同一个差距：创作者已经知道自己要什么，而模型仍然拥有太多没有必要的自由度。参考素材是在告诉模型，这个人、这个商品或者这个场景不要随意改变；首尾帧规定一段变化从哪里开始、在哪里结束；镜头与动作控制限制变化的方式；分镜则进一步规定故事的大致演化路径。Seedance 2.5 一次可以使用大量图片、视频和音频作为参考；Wan 3.0 则把多模态参考、首尾帧、视频编辑和视频延展放进同一个统一模型（All-in-One）能力面。[ByteDance Seed：Seedance 2.5](https://seed.bytedance.com/en/blog/one-take-creation-flexible-referencing-introducing-seedance-2-5) [Alibaba Cloud：Wan 3.0 Video Generation](https://docs.modelstudio.console.alibabacloud.com/en/model-studio/wan3-video-generation-guide)

但在真正制作里，提前规定条件仍然不够。假设三个镜头里只有第三镜的动作错了，如果模型唯一能做的是重新生成，新的采样可能连原本正确的人物、光线和环境也一起改变。于是问题从“怎样生成正确结果”，继续变成“**正确的部分为什么每次也要一起归零？**”

这正是视频编辑开始变重要的原因。Runway 的 Aleph 2.0 把目标写得非常明确：修改用户指定的内容，同时尽量保持背景、光线和其他没有要求改变的细节；它甚至可以把同一种修改应用到多个镜头。Seedance 2.5 则走另一条路线，把时间点级别的编辑继续收进视频模型本身，使人物、动作或剧情的局部调整尽量保持前后的连续性。[Runway：Aleph 2.0](https://runway.com/product/aleph-2) [ByteDance Seed：Seedance 2.5](https://seed.bytedance.com/en/blog/one-take-creation-flexible-referencing-introducing-seedance-2-5)

所以参考、控制、编辑和延展并不是几条互不相关的功能线。它们共同推动视频生成从“每次重新创造一个世界”，走向“在已经建立的世界里继续工作”。真正变化的不是控制按钮数量本身，而是一个创作意图到最终作品之间，有多少原本只能靠随机抽样碰运气的变量，开始可以被明确地保留、约束和修改。

## 四、这些控制，未来还需要人亲自操作吗？

前一章里的参考素材、首尾帧、分镜和局部编辑，并不意味着未来创作者一定要亲自操作越来越多控制项。AI Coding 的演进提供了一个值得参考的类比：早期使用 Coding Agent 时，人往往需要把任务拆得更细，不断检查中间结果；随着模型长程能力和工具使用提高，越来越多开发任务已经可以直接作为更完整的目标交给 Agent，让它自己阅读代码、修改文件、执行测试，再根据结果继续迭代。OpenAI 2026 年对 Codex 使用情况的统计也显示，用户正在把越来越长的任务直接委托给 Agent：2026 年 5 月，超过 70% 的用户曾提交过人工完成需要一小时以上的任务。[OpenAI：How agents are transforming work](https://openai.com/index/how-agents-are-transforming-work/)

视频生成也可能沿着类似方向前进。今天大量显式的参考素材、分镜、镜头参数和局部编辑入口，首先是在补齐模型和系统必须具备的底层控制能力；以后这些能力未必都要暴露成创作者亲手操作的按钮，而可能逐渐由更上层的创作智能体自动调用。Runway Agent 现在已经可以围绕一个创作目标进行规划、生成、分析和编辑，自己选择不同模型，还能直接构建和运行可复用工作流；Google Flow 在 2026 年也把 Agent 引入创作流程，希望覆盖从构思到编辑的更多环节。[Runway：Creating with Runway Agent](https://help.runwayml.com/hc/en-us/articles/51601639579667-Creating-with-Runway-Agent) [Google：New agents, mobile apps and Gemini Omni for Google Flow](https://blog.google/innovation-and-ai/models-and-research/google-labs/flow-updates/)

**底层控制能力可以越来越丰富，人亲自介入的层级却可能逐步上移。** 今天创作者可能还需要手工指定人物参考图、首尾帧、第三秒的动作和第五镜重做；以后更可能只给出品牌、故事、目标人群、情绪、不能改变的资产和审美边界，再由智能体自己拆解剧本、分镜、参考素材、生成、检查和修改。

但视频创作不会完全复制 AI Coding。软件拥有相对更强的外部验证机制：编译器、类型系统、单元测试和运行结果都可以帮助 Agent 判断一项修改是否正确；视频创作里的很多关键判断却没有同等清晰的验证器。“这个表情是不是太满”“这里应该停两秒还是三秒”“这个镜头技术上没有错误，为什么就是不像这个品牌”，都很难被一个确定性的测试直接判成通过或失败。更特殊的是，创作者的目标本身也可能在看到生成结果以后继续变化——生成不仅是在执行意图，有时也在帮助人发现自己真正想要什么。

**视频和 Coding 更关键的差异，不是谁最终保留决定权，而是视频创作缺少同样清晰的外部验证器，而且创作意图本身经常会在看到结果以后继续变化。** 因此，未来的视频创作未必需要人继续手工指定每一个参考图、首尾帧和镜头参数。AI 可以接管越来越多规划、生成、检查和修改，但人的介入更可能集中在创作目标、审美方向、边界和阶段性选择上。今天这些显式控制能力仍然重要，只是它们更可能逐渐成为 AI 可以调用的基础设施，而不是永远暴露给人的操作界面。

## 五、共同问题已经趋同，视频模型为什么仍然走向不同路线？

如果只看今天几家视频模型的发布页，会有一个很明显的感觉：大家越来越像了。人物与场景一致性、参考素材、视频编辑、长叙事、声音、镜头控制，已经成为一组高度重复的目标。Kling 3.0 明确采用统一产品框架，把文字、图片、音频和视频输入输出，以及视频理解、生成、编辑放入一个原生多模态架构；Wan 3.0 同样把自己定义成统一视频模型，一套模型覆盖文字生成视频、首尾帧、多模态参考、编辑和延展。[Kuaishou：Kling AI 3.0](https://ir.kuaishou.com/news-releases/news-release-details/kling-ai-launches-30-model-ushering-era-where-everyone-can-be) [Alibaba Cloud：Wan 3.0 Video Generation](https://docs.modelstudio.console.alibabacloud.com/en/model-studio/wan3-video-generation-guide)

这说明行业对“接下来必须解决什么”已经形成了相当强的共识，但**共同问题收敛，不代表应该在哪一层解决这些问题也已经形成共识。** Kling、Wan、Seedance 更明显地在测试一个视频模型最终可以承担多少任务；Runway 目前却保持着清楚的专业分工：Gen-4.5 主要做文字/图片生成视频，Aleph 2.0 专门做既有视频编辑，上层再通过 Edit Studio、Agent 和 Workflows 组织成完整创作流程。[Runway：Gen-4.5](https://help.runwayml.com/hc/en-us/articles/46974685288467-Creating-with-Gen-4-5) [Runway：Aleph 2.0](https://runway.com/product/aleph-2)

长内容也有同样的分叉。一种方向继续把单次生成推到 15 秒、30 秒甚至更长，让模型内部承担多镜头叙事；另一种方向则维持相对可靠的镜头生成单位，把人物资产、镜头关系、修改历史和最终组合交给上层系统。**作品越来越长，并不意味着模型最适合一次生成的片段也必须越来越长。** 一个镜头或几秒片段如果足够稳定，再由上层系统维护人物、场景和叙事状态，同样可以组成长作品。现实影视制作本来就是通过分镜、拍摄、重拍和剪辑管理复杂作品；未来甚至可能不是“单次长生成”和“分镜生成”二选一，而是 Agent 根据任务动态决定哪一部分应该一次完成，哪一部分应该拆成镜头。

## 六、视频生成应该是一条基础模型主线，还是独立的专业能力？

视频模型内部路线尚未收敛，行业更上层也发生了另一种变化。2024 年 Sora 刚出现时，视频生成很容易被理解成所有前沿 AI 公司都应该参与的一条主线；GPT-4o 又把 Omni 直接写进模型名字，多模态本身也是当时最显眼的前沿标签之一。

两年以后，一部分通用基础模型公司的组织姿态已经发生变化。腾讯今年把混元多模态模型部门和大语言模型部门合并成立统一的基础模型部，给出的理由是提高模型研发协同效率、探索全模态模型的智能上限。腾讯没有停止多模态研发，而是把它收回到统一的基础模型组织里：**多模态不再需要作为和语言基础模型平行的一条组织主线存在。** [财新：腾讯合并混元多模态和大语言模型部门](https://companies.caixin.com/2026-07-24/102467665.html)

一份今年流出的梁文锋投资者交流录音整理稿把这种路线区分说得更直接：在他的判断里，多模态对 C 端产品很重要，DeepSeek 也会继续做，但对于智能上限而言更像一项组件；视频生成和世界模型则不属于 DeepSeek 当前定义的 AGI 主线。他同时强调这只是 DeepSeek 自己的路线图，不是唯一路线。由于这不是 DeepSeek 正式发布的技术路线文件，更适合作为路线判断信号，而不是行业共识。[梁文锋投资者交流会录音整理稿](https://yidinghuiziyou.com/posts/2026-07-16-liangwenfeng-investor-meeting/)

OpenAI 的变化则更有象征意义。2025 年的 Sora 2 仍然在物理表现、画面真实感、可操控性和同步音频上继续升级；但 Sora 网页版和 App 已于 2026 年 4 月 26 日停止服务，API 也将在 9 月 24 日关闭。OpenAI 官方确认了停止时间，Reuters 的报道则称，Sora 长期占用大量计算资源，并与企业产品、Coding 和 AGI 等其他战略优先级争夺资源。[OpenAI：Sora 停止服务须知](https://openai.com/api-docs/sora/) [Reuters：OpenAI drops AI video tool Sora](https://www.reuters.com/technology/openai-set-discontinue-sora-video-platform-app-wsj-reports-2026-03-24/)

我现在回头看 Sora，确实会觉得有点惋惜。所以我不太愿意把 Sora 的退出理解成“它打不过 Kling 或 Seedance 了”。更像是 OpenAI 最后决定，把有限的算力和组织资源押到别的方向。**模型还能不能继续变强，和一家公司是否值得继续把大量算力与组织资源投在这里，已经是两个不同问题。**

快手面对的是另一套资源账。它不只可以直接向可灵用户收费，还有短视频、直播、广告和电商生态，可以把生成能力继续用于内容和营销生产。可灵 2026 年第二季度收入已经超过 8.5 亿元，同比增长超过 200%。[快手：2026 年第二季度及中期业绩](https://ir.kuaishou.com/news-releases/news-release-details/kuaishou-technology-announces-second-quarter-and-interim-2026)

但“有短视频平台才能做好视频模型”同样过于简单。Runway 没有快手、抖音这样的分发平台，依然可以围绕专业创作者和企业制作工具建立商业闭环；腾讯本身也并不缺内容分发渠道，却仍然选择把内部多模态组织收拢，同时又参与了可灵融资。[Reuters：Alibaba, Tencent back Kuaishou's Kling AI in $2.8 billion fundraise](https://www.reuters.com/world/china/alibaba-tencent-back-kuaishous-kling-ai-28-billion-fundraise-2026-07-03/)

因此，更值得区分的是：**看好视频生成这项能力，不等于认为它必须成为自己的基础模型主线。** 对于追求通用智能的公司，多模态可能越来越像基础模型默认应该具备的能力；对于快手、字节、Runway 这样的专业路线，视频生成则可以继续围绕内容生产，把一致性、控制、编辑、成本和创作工作流不断做深。这也和上一篇文章形成了一个现实中的延伸：理解侧和通用能力可以继续收拢，专业生成侧却未必因此消失。

## 七、所以，今天到底什么叫一个“更强”的视频模型？

因此，“哪个视频模型最好”已经越来越难用一张总榜回答。假设有两个模型：A 的最佳样本非常惊艳，但人物容易漂移，指定动作不一定执行，哪里出错以后经常要整段重新生成；B 的单条最佳样本未必比 A 更震撼，却能稳定保持人物和场景，更可靠地理解参考素材，失败以后还能局部修改。如果真的要完成一个作品，我会更倾向 B。

控制项多少本身也不能直接代表模型强弱。更合适的评价至少要拆成三个层面：**能力上限**，也就是这个模型最好能做到什么；**兑现可靠性**，也就是当意图已经明确以后，它多大概率能按照要求做到；以及**完成成本**，也就是为了得到那个真正可以用的结果，需要多少生成时间、算力、重试和人工介入。

这三个层面也能解释为什么过去几年很多看起来没有“画质提升”那么耀眼的能力变得重要。人物一致性减少的是前面成果被意外丢失；参考和分镜减少的是不必要的自由采样；编辑避免的是为了一个错误把正确结果也清零；Agent 则可能继续减少人亲自管理这些中间控制的成本。Google Flow 今年增加首尾帧控制、低成本 360p 草稿和 1080p/4K 输出，也很能说明这种变化：用户可以先用更低成本试构图和方向，确认以后再投入高质量渲染，优化的已经不只是“最好一次能有多漂亮”，而是找到正确结果的过程。[Google：Flow creative controls](https://blog.google/innovation-and-ai/models-and-research/google-labs/new-creative-controls-google-flow/)

因此，很难把今天的视频模型概括成已经跨过了一条清晰的“Demo Quality → Production Quality”门槛。Physics-IQ 仍然提醒我们，视觉逼真和物理正确之间存在明显距离；模型在长时间状态、人体、交互和复杂约束上也还会失败。但另一边，短剧生产成本已经出现明显下降，可灵也已经形成数亿元单季收入。这说明视频模型即使远没有“解决视频创作”，也已经能够在部分生产环节创造真实经济价值。[Physics-IQ](https://openaccess.thecvf.com/content/WACV2026/html/Motamed_Do_Generative_Video_Models_Understand_Physical_Principles_WACV_2026_paper.html) [快手：2026 年第二季度及中期业绩](https://ir.kuaishou.com/news-releases/news-release-details/kuaishou-technology-announces-second-quarter-and-interim-2026)

如果继续往下一阶段看，比“谁先把单次生成从 30 秒推到 60 秒”更值得关注的，是三件事：模型能把人物、物体和故事状态保持多久；系统能多可靠地从一个高层创作意图自动完成分镜、生成、检查和修改；以及在得到同样质量结果时，需要付出的推理和人工成本还能下降多少。

**视频生成能力越来越强，并不意味着它会自然走向 World Model。** 内容生成要解决的是“结果是否符合创作者意图”；真正用于预测、规划甚至机器人行动的世界模型，还必须回答“给定当前状态和一个行动，真实世界接下来究竟会发生什么”。今天的视频模型在两者之间已经出现一些有趣的交叉，但 Physics-IQ 的结果也说明，它们离稳定解决后一个问题还有明显距离。

三年前，我们会因为 Will Smith 连一盘意大利面都吃不好而笑。今天，同样的画面已经很难再承担这样的笑点，但问题没有消失，只是从“能不能生成”移动到了“能不能保持”“能不能按照意图完成”“出了错能不能继续修”，然后又开始进入下一层：**这些中间工作究竟还需要人亲自做多少？**

视频模型真正进化的，可能不只是它生成出来的那段视频，也不只是控制按钮越来越多，而是**从一个创作意图到最终作品之间，越来越多原本依赖随机试错和人工补救的环节，开始可以被模型和系统可靠地完成。**

而我现在觉得，视频生成真正进入生产的标志，也许并不是某一天我们突然再也分不清 AI 视频和真实视频，而是另一件更朴素的事：**得到一个自己真正想要的结果，开始越来越少依赖运气。**

---

## 参考资料

### 一手文件 / 官方发布

- [OpenAI：Video generation models as world simulators](https://openai.com/index/video-generation-models-as-world-simulators/)
- [OpenAI：Sora 2 is here](https://openai.com/index/sora-2/)
- [OpenAI：Sora 停止服务须知](https://openai.com/api-docs/sora/)
- [Google：Veo 3 与 Flow 发布](https://blog.google/innovation-and-ai/products/google-ai-updates-may-2025/)
- [Google：New agents, mobile apps and Gemini Omni for Google Flow](https://blog.google/innovation-and-ai/models-and-research/google-labs/flow-updates/)
- [Google：Flow creative controls](https://blog.google/innovation-and-ai/models-and-research/google-labs/new-creative-controls-google-flow/)
- [ByteDance Seed：Seedance 2.5](https://seed.bytedance.com/en/blog/one-take-creation-flexible-referencing-introducing-seedance-2-5)
- [Kuaishou：Kling AI 3.0](https://ir.kuaishou.com/news-releases/news-release-details/kling-ai-launches-30-model-ushering-era-where-everyone-can-be)
- [Kuaishou：2026 年第二季度及中期业绩](https://ir.kuaishou.com/news-releases/news-release-details/kuaishou-technology-announces-second-quarter-and-interim-2026)
- [Alibaba Cloud：Wan 3.0 Video Generation](https://docs.modelstudio.console.alibabacloud.com/en/model-studio/wan3-video-generation-guide)
- [Runway：Gen-4.5](https://help.runwayml.com/hc/en-us/articles/46974685288467-Creating-with-Gen-4-5)
- [Runway：Aleph 2.0](https://runway.com/product/aleph-2)
- [Runway：Creating with Runway Agent](https://help.runwayml.com/hc/en-us/articles/51601639579667-Creating-with-Runway-Agent)
- [OpenAI：How agents are transforming work](https://openai.com/index/how-agents-are-transforming-work/)

### 学术研究 / Benchmark

- [Stanford HAI：AI Index Report 2025](https://hai.stanford.edu/assets/files/hai_ai-index-report-2025_chapter2_final.pdf)
- [VBench-2.0](https://vchitect.github.io/VBench-2.0-project/)
- [Physics-IQ：Do Generative Video Models Understand Physical Principles?](https://openaccess.thecvf.com/content/WACV2026/html/Motamed_Do_Generative_Video_Models_Understand_Physical_Principles_WACV_2026_paper.html)

### 产业与商业信号

- [Caixin Global：China’s Short-Drama Makers Rush to Ride AI Boom as Production Costs Plunge](https://www.caixinglobal.com/2026-03-17/chinas-short-drama-makers-rush-to-ride-ai-boom-as-production-costs-plunge-102423944.html)
- [Reuters：Alibaba, Tencent back Kuaishou's Kling AI in $2.8 billion fundraise](https://www.reuters.com/world/china/alibaba-tencent-back-kuaishous-kling-ai-28-billion-fundraise-2026-07-03/)
- [Reuters：OpenAI drops AI video tool Sora](https://www.reuters.com/technology/openai-set-discontinue-sora-video-platform-app-wsj-reports-2026-03-24/)
- [CompaniesMarketCap：Kuaishou Technology Market Cap](https://companiesmarketcap.com/kuaishou-technology/marketcap/)
- [Ars Technica：Google’s Will Smith double is better at eating AI spaghetti … but it’s crunchy?](https://arstechnica.com/ai/2025/05/googles-will-smith-double-is-better-at-eating-ai-spaghetti-but-its-crunchy/)

### 路线观点材料

- [财新：腾讯合并混元多模态和大语言模型部门](https://companies.caixin.com/2026-07-24/102467665.html)
- [梁文锋投资者交流会录音整理稿](https://yidinghuiziyou.com/posts/2026-07-16-liangwenfeng-investor-meeting/)
