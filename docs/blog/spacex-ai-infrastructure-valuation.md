# 一份招股书里，两种不同节奏的"AI"

> SpaceX 的招股书把"AI"写成了估值的核心支撑——26.5万亿美元的TAM里，AI占了92.9%。但拆开其中最具体、最可验证的一角，会发现这个标签下装着至少两种验证节奏完全不同的东西：一层已经在签合同、造卫星，另一层还停留在招股书自己写的"技术未经证实"。这两层一旦被压进同一个数字，这个数字描述的就不再是"现在"，而是一种把未来提前折算进当下的计价方式。

---

SpaceX 这次 IPO 的招股书里，有一个数字让我多看了两眼。

招股书给出的可量化总潜在市场（TAM）是 [28.5 万亿美元](https://stratechery.com/2026/the-spacex-ipo-and-data-centers-in-space/)——其中航天相关的"Space"板块只有 3700 亿，占比 1.3%；而"AI"板块高达 26.5 万亿，占比 92.9%。

一家以"全球发射成功率第一"立身二十多年的火箭公司，在自己的上市文件里，把航天业务的市场空间写成了零头，把"AI"写成了几乎全部的故事。这本身已经是一个值得停下来想一想的信号：当一家公司的核心叙事从"我们造火箭"切换成"我们是 AI 基础设施公司"，这个切换的依据是什么，又有多少是真的。

## 26.5 万亿里，本文只拆一个角

先把这 26.5 万亿摊开看。招股书的拆解是：AI 基础设施 2.4 万亿，消费订阅 7600 亿，数字广告 6000 亿，企业应用 22.7 万亿。

这四块里，"企业应用"这 22.7 万亿是最大的一块，对应的是 Grok、X 这类模型和平台业务未来可能触达的市场空间。但这个数字本质上是一个宏观行业预测——"AI 应用市场未来能有多大"，和"SpaceX 现在做到哪一步了"之间，几乎没有可以直接对照的路径。消费订阅和数字广告同理，这两块对应的是 X/Grok 现有的订阅和广告业务，但作为"未来市场空间"的估算，同样很难拆解成"SpaceX 当下的具体业务进展"。

本文要拆的，是这四块里最小的一块——AI 基础设施，2.4 万亿，占 26.5 万亿的约 9%。

选择这一块，不是因为它的数字最特殊，而是因为它是这 26.5 万亿里**唯一一个 SpaceX 已经有实际业务在跑、有具体合同、有具体硬件设计在做的部分**。地面算力租赁已经签了合同、有审计数字；太空算力已经公开了卫星设计、给出了部署时间表。换句话说，这是整个"AI"叙事里，证据链最短、最具体、最可以被拿来检验的一角。

所以接下来要问的问题，范围是有限的：**这 2.4 万亿里，SpaceX 现在的业务进展和它的定价节奏，对得上吗？** 至于剩下 91% 的"AI"——企业应用、消费订阅、广告——它们的证据基础是更厚还是更薄，本文不展开回答，但拆完这 2.4 万亿之后，这个问题大概会自己浮现出来。

<!-- INSERT_CHART: spacex-tam-breakdown -->

## 2.4 万亿里的两层：一层是真实的，但来路不光彩；一层是未来的，但招股书自己说"未经证实"

把这 2.4 万亿"AI 基础设施"再往下拆——这不是招股书自己的分类方式，而是我自己的归纳：会看到两层完全不同的东西。

**第一层，是地面算力租赁——真实，但是被动获得的。**

2026 年 2 月，SpaceX 完成了对 xAI 的合并，把 xAI 的算力基础设施、Grok 模型、X 平台一起并入了新设立的"AI segment"。招股书披露，[Anthropic 将以每月 12.5 亿美元、合同期至 2029 年 5 月的条款](https://www.datacenterdynamics.com/en/news/spacex-ipo-filing-reveals-anthropic-set-to-pay-musks-firm-125bn-a-month-to-rent-xai-data-center-space/)，租用 SpaceX 旗下 Colossus 和 Colossus II 数据中心的算力容量，三年总价值约 450 亿美元，折合每年约 150 亿美元。几天后，[Google 也宣布了一份类似的协议](https://www.ibtimes.co.uk/spacex-google-data-centre-deal-1801386)，从 2026 年 10 月到 2029 年 6 月，每月支付约 9.2 亿美元。两份合同加起来，每年能给 SpaceX 带来约 260 亿美元的收入。

这笔钱是真的，会计意义上的"AI 基础设施收入"也是真的。但它的来路值得多看一眼：Colossus 最初是为训练 xAI 自己的模型而建的。[招股书显示，xAI 相关的研发投入给 2025 年带来了 51 亿美元的费用](https://stratechery.com/2026/the-spacex-ipo-and-data-centers-in-space/)，直接把公司从小幅盈利拖成了巨额亏损——而这笔投入对应的，是一个目前在主流榜单上排名第五的模型，其创始团队近期也已经整体离职。现在把这部分算力转向对外出租，本质上是 xAI 自身模型业务遇到瓶颈之后，把闲置算力做的资产处置——[一位行业分析师的说法是](https://marketwise.com/investing/spacex-ipo-spcx-anthropic-deal/)（译自英文）："成为数据中心房东，从来不是 xAI 的原计划"。而且这笔租约本身也不是铁板一块：[合同里带有 90 天的双方互相终止条款](https://marketwise.com/investing/spacex-ipo-spcx-anthropic-deal/)。

这里有一个值得算一笔账的细节：[按招股书的说法，Colossus 1 这部分 300 兆瓦的算力，正在以每年 150 亿美元的价格租给 Anthropic](https://stratechery.com/2026/the-spacex-ipo-and-data-centers-in-space/)；有分析估计，如果 xAI 能在前沿模型竞赛中重新追上节奏，自己用这部分算力训练 Grok 所能产生的收入，理论上可能比租给 Anthropic 更高——但这本身也是一个"如果"，目前看，租出去是更确定的那个选项。这个对比至少说明：在"自己用"和"租出去"之间，xAI 现在选择的是后者。

也就是说，这层收入的"真实"，和"这是 SpaceX 主动构建并验证成功的 AI 基础设施战略"之间，是两件不完全相同的事。它更接近于：一笔意外获得、暂时稳定、但随时可能终止的过渡性收入。

**第二层，是太空算力——目前是零收入，招股书自己也没有把话说满。**

招股书里另一个引人注目的部分，是 SpaceX 计划把数据中心送上太空。[今年 6 月，SpaceX 公开了第一代轨道 AI 数据中心卫星的设计方案，命名为"AI1"](https://coincentral.com/spacex-reveals-orbital-ai-data-center-plans-ahead-of-1-75-trillion-ipo/)，单星峰值算力 150 千瓦、平均 120 千瓦，马斯克把它的算力规模类比为"一台英伟达 GB300 服务器机柜"。[配套的还有两座新工厂——"Gigasat"用于批量制造卫星，"Terafab"用于生产芯片](https://www.tradingkey.com/analysis/stocks/us-stocks/261954234-elonmusk-spacex-ipo-ai1-tradingkey)，计划到 2027 年底实现每年 1000 颗以上卫星的产能。

数字听起来很大，时间表却相当克制：招股书给出的部署起点是 2028 年。更关键的是，[招股书在风险披露部分明确写道，太空数据中心的计划"依赖于未经证实的技术"，并且"可能无法实现商业可行性"](https://36kr.com/p/3777413412672263)。马斯克本人在公开场合给出的"36 个月内太空将成为部署 AI 最便宜的地方"这类说法，[他自己也提醒投资者"需要打个折扣"](https://www.tradingkey.com/analysis/stocks/us-stocks/261954234-elonmusk-spacex-ipo-ai1-tradingkey)——招股书的口径明显比他的公开发言保守得多。

这两层放在一起看，差异其实相当大：一层是已经在发生的、有审计数字的、但来源是"业务受挫后的资产处置"且随时可终止的收入；另一层是尚未发生的、招股书自己承认"技术未经证实"的远期项目。它们唯一的共同点，是都被计入了同一个"AI 基础设施"标签，共同支撑着 2.4 万亿这个数字背后的想象空间。

<!-- INSERT_CHART: spacex-ai-infra-two-layers -->

## 这个方向不是空中楼阁——但中国的国家级规划，也在往同一个时间表走

上一节里"第二层"（太空算力）的判断，目前停留在"招股书自己都承认未经证实"——这本身并不能说明这个方向是假的，还是只是太早。如果只看 SpaceX 一家，"太空数据中心"这个说法很容易被当成马斯克式的又一次宏大叙事。但把视野放宽一点，会发现这并不是一家公司凌空虚构出来的故事。

中国这边，太空算力的布局这一两年也在密集落地。[2025 年 5 月，商业航天公司国星宇航发起的"星算计划"完成首批 12 颗计算卫星发射](https://www.guancha.cn/internation/2026_01_30_805519.shtml)，目标是组建一个由 2800 颗卫星构成的太空算力网络。[2025 年 11 月，北京市科委和中关村科学城管理委员会发布了规划，提出在 700 至 800 公里的晨昏轨道建设运营超千兆瓦功率的集中式大型数据中心系统](https://www.guancha.cn/economy/2026_03_13_809950.shtml)。中国航天科技集团也公开表示，将在"十五五"期间建设吉瓦级太空数智基础设施。

[北京的规划给出了一个"三步走"的时间表](https://kw.beijing.gov.cn/ztzl/rdzt/kjrmt/202512/t20251208_4327255.html)：2025 至 2027 年是"天数天算"阶段，重点突破能源和散热等关键技术，建设一期算力星座；2028 至 2030 年是"地数天算"阶段，突破在轨组装建造技术；2031 至 2035 年才是"天基主算"阶段，实现卫星批量生产组网、建成大规模太空数据中心。

把这个时间表和 SpaceX 招股书里"2028 年起步"对照一下，会发现一件有意思的事：**两边给出的时间节点基本是吻合的**。这说明"太空算力"作为一个技术方向，并不是空中楼阁——多个独立的主体，基于各自的判断，都把规模化部署的时间点放在了 2028 年之后。

这也正好回应了一个很自然的反驳：马斯克过去多次被认为"做不到"的事，后来都做到了，比如可回收火箭、星链。这次太空算力，是不是也可能提前兑现？

这个反驳本身是有道理的——历史上低估马斯克的人，确实经常被证明是错的。但这里要分清楚两件不同的事：**一件是"太空算力这件事能不能做成"，另一件是"现在的估值，要不要把这件事算进去"**。即便这件事最终做成了，而且做成的时间点和现在大家预估的差不多（2028 年以后），那么 2026 年中的这次 IPO，把一个 2028 年以后才可能开始验证的方向，作为当下估值里"AI 基础设施"这一项的核心增量来源，这个定价的时间点本身，是不是提前了？

这是一个关于**定价时机**的问题，不是关于**技术可行性**的问题。即便方向是对的，提前计入的部分，依然是提前计入的。

<!-- INSERT_CHART: spacex-china-timeline-comparison -->

## 这不是 SpaceX 一家的事——Cerebras 的估值曲线，斜率比业务验证快得多

上一节落在一个具体判断上：SpaceX 这次估值，把"AI 基础设施"里一个 2028 年才可能开始验证的方向，提前计入了 2026 年的定价。如果这只是 SpaceX 一家公司的孤例，那大概只是马斯克式叙事的又一次延续。但把目光从 SpaceX 移开，会发现"估值曲线跑在业务验证前面"这件事，在今年的 AI 相关 IPO 候选公司里并不罕见。

AI 芯片公司 Cerebras 是一个有意思的对照。[2025 年 9 月，Cerebras 完成 11 亿美元 G 轮融资，估值 81 亿美元；五个月后的 2026 年 2 月，又完成 10 亿美元 H 轮融资，估值跳到 230 亿美元](https://finance.sina.com.cn/tech/roll/2026-05-20/doc-inhypnup6977251.shtml)——五个月里估值接近翻三倍。

Cerebras 的核心卖点，是它的晶圆级芯片 WSE-3：[官方说法是推理速度是英伟达 H100 的 3 倍，功耗只有其五分之一](https://finance.sina.com.cn/tech/roll/2026-05-20/doc-inhypnup6977251.shtml)。但晶圆级芯片有一个长期存在的工程难题——良率。一整片晶圆上只要有微小的制造缺陷，整块芯片就可能报废。Cerebras 表示已经通过冗余电路设计解决了这个问题，但良率数据从未公开过。这也是外界对它最集中的质疑：如果良率上不去，每一片 WSE-3 的实际成本可能高得惊人。

Cerebras 和 SpaceX 的"叙事先行"，机制并不完全一样。Cerebras 是纯粹的技术叙事先行——估值的支撑点是一项尚未被独立验证的技术指标（良率）。SpaceX 则是用已有的硬资产规模（火箭发射、卫星制造、Starlink 网络）去为一个新叙事（AI 基础设施）做信用背书——"我们已经会造卫星、会发射、会管理大型星座，所以我们造太空数据中心的可信度比别人高"。

两者的具体路径不同，但共同点是：**估值上升的速度，明显快于核心技术指标或业务模式被独立验证的速度**。这种节奏，似乎正在成为今年这一批 AI 相关公司在一二级市场上的某种共性，而不是哪一家公司的特例。

## 标签里装的是什么，比标签本身更值得拆开看

拆开 2.4 万亿这一角，看到的是：一层真实但来路是"业务受挫后的资产处置"且随时可终止，另一层是招股书自己都没把话说满的远期项目。这两层东西，验证节奏完全不同，但它们被装进了同一个标签，共同构成了一个听起来很有分量的数字——而这，已经是整个"AI"叙事里证据最充分的一角。

这两周，Hacker News 上关于这次 IPO 的讨论里，"AI 泡沫"已经是一个被反复提起的框架——有分析直接给出了["我们认为这次 IPO 被高估了"](https://www.morningstar.com/stocks/why-we-think-spacex-ipo-is-overvalued?content_id=20768396545)的判断，也有更激烈的说法[称其为"世纪级的套现"](https://montanaskeptic.substack.com/p/the-spacex-ipo-will-be-the-theft)。这种担忧是不是成立，本文不打算给出结论。

但有一个动作，大概是可以重复使用的：下次再看到一个很大的"AI"数字——不管是某家公司的TAM、某个行业的市场预测，还是某次融资的估值——第一反应或许不该是"这个市场真大"，而是"这个数字里，装的是不是同一个时间尺度的东西"。是已经签了合同、有审计数字的现状，还是十年后才可能验证的远期叙事，又或者只是一个行业总盘子的宏观估算——这几种东西一旦被压进同一个标签、同一个数字，这个数字本身就不再是对"现在"的描述，而变成了一种把未来提前折算进当下的计价方式。

至于这种计价方式最终会兑现成什么——市场显然不是第一次见过这种打包方式，过去的结局，大多不算太好。

---

## 参考资料

**SEC 一手文件**
- [SpaceX Form S-1（SEC EDGAR 原文，2026年5月20日）](https://www.sec.gov/Archives/edgar/data/1181412/000162828026036936/spaceexplorationtechnologi.htm)

**一手/近一手分析（引用并核对 S-1 原文段落）**
- [The SpaceX IPO and Data Centers in Space - Stratechery（直接引用S-1 TAM拆解与AI segment财务数据）](https://stratechery.com/2026/the-spacex-ipo-and-data-centers-in-space/)

**主流财经/科技媒体（独立报道S-1内容）**
- [SpaceX IPO filing reveals Anthropic set to pay Musk's firm $1.25bn a month - DCD](https://www.datacenterdynamics.com/en/news/spacex-ipo-filing-reveals-anthropic-set-to-pay-musks-firm-125bn-a-month-to-rent-xai-data-center-space/)
- [Anthropic and Google Are Paying SpaceX $2.17 Billion Every Month - IBTimes UK](https://www.ibtimes.co.uk/spacex-google-data-centre-deal-1801386)
- [SpaceX IPO: The Grok Failure That Made Anthropic's $15 Billion Deal Possible - MarketWise](https://marketwise.com/investing/spacex-ipo-spcx-anthropic-deal/)
- [Elon Musk Unveils AI Data Center Satellite Design - TradingKey](https://www.tradingkey.com/analysis/stocks/us-stocks/261954234-elonmusk-spacex-ipo-ai1-tradingkey)
- [SpaceX Reveals Orbital AI Data Center Plans - CoinCentral](https://coincentral.com/spacex-reveals-orbital-ai-data-center-plans-ahead-of-1-75-trillion-ipo/)

**中文来源**
- [马斯克祭出「霸王条款」！600亿美元买下Cursor - 投资界（招股书风险披露部分）](https://36kr.com/p/3777413412672263)
- [马斯克画的太空AI算力大饼，中国准备先咬一小口 - 观察者网](https://www.guancha.cn/economy/2026_03_13_809950.shtml)
- ["中方打造太空AI算力中心，要挑战马斯克" - 观察者网](https://www.guancha.cn/internation/2026_01_30_805519.shtml)
- [从"为什么"到"怎么做"，解读北京布局太空数据中心四大看点 - 北京市科委、中关村科技园区管理委员会](https://kw.beijing.gov.cn/ztzl/rdzt/kjrmt/202512/t20251208_4327255.html)
- [2026上半年最大IPO：Cerebras 上市 - 新浪科技](https://finance.sina.com.cn/tech/roll/2026-05-20/doc-inhypnup6977251.shtml)

**社区讨论（Hacker News 高赞讨论，代表市场情绪而非客观数据）**
- [Fear of AI bubble ahead of SpaceX IPO - Fortune](https://fortune.com/2026/06/08/stocks-ai-bubble-spacex-ipo/)
- [We Think the SpaceX IPO Is Overvalued - Morningstar](https://www.morningstar.com/stocks/why-we-think-spacex-ipo-is-overvalued?content_id=20768396545)
- [The SpaceX IPO will be the theft of the century - Montana Skeptic](https://montanaskeptic.substack.com/p/the-spacex-ipo-will-be-the-theft)

---

## 来源可信度说明

文中关键数字（TAM拆解28.5万亿/26.5万亿/2.4万亿、AI segment研发费用51亿美元、Anthropic与Google算力合同条款）主要来自 Stratechery 对 SEC S-1 原文段落的直接引用，SEC EDGAR 原文链接已附在首位，供进一步查证。中国太空算力规划部分采用北京市科委官方发布作为一手来源。Hacker News 部分的三条链接代表的是社区讨论中的观点和情绪基准，文中已明确标注为"讨论""担忧"，未作为事实陈述使用。

