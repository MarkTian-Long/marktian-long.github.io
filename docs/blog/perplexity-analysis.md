# Perplexity：做对了产品，但站错了位置

> 它在正确的时间解决了真实的问题，技术路径也没走错。但独立 AI 搜索这个品类本身，正在被一股更大的力量压缩。

---

## 一个 AI product builder 的流失路径

我第一次用 Perplexity，是 2024 年听说它很火。

身边做产品的人开始提它，说搜索体验比 Google 好，答案有来源、不乱编。我下载了，用了几次，觉得不错，然后慢慢就不再打开了。不是因为哪次体验很差，而是没有找到非用它不可的理由。

这件事本身就值得拆解。一个产品能在早期吸引用户，但留不住他们，通常不是产品做错了什么，而是没能嵌入用户的工作流。我后来回想，我的日常信息获取路径是：感兴趣的话题直接问 Claude 或 ChatGPT，需要具体内容开 Google，两个工具已经覆盖了我几乎所有场景。Perplexity 想站的那个位置，在我的使用习惯里根本没有空缺。

但这不代表 Perplexity 没有意义。作为一个 AI product builder，我更想搞清楚的是：它到底在解决什么问题，产品决策背后的逻辑是什么，以及它正在面对的结构性困境从哪里来。

---

## 它在解决什么问题

Perplexity 的联合创始人 Aravind Srinivas 在创办公司之前，在 OpenAI、Google Brain 和 DeepMind 都工作过。[据他在 Figma 的采访](https://www.figma.com/blog/perplexity-ai-interview/)，他创办 Perplexity 的出发点是对现有搜索方式的挫败感——他不想要一堆链接，他想要直接的、准确的答案。

传统搜索引擎给你十个链接，你需要自己判断哪个可信、自己打开阅读、自己综合信息。这个过程对于简单查询还好，但一旦问题稍复杂——"某个技术方案的 trade-off 是什么"、"这家公司最近发生了什么"——用户需要在多个页面之间反复跳转，信息综合的成本很高。

Perplexity 想替你做"搜索之后的那一步"：阅读、筛选、综合，然后给你一个有来源引用的直接答案。[Figma 对 Srinivas 的采访](https://www.figma.com/blog/perplexity-ai-interview/)里有一个清晰的表述：他把 Perplexity 定位为"answer engine"，而不是搜索引擎——核心差异在于，它综合来自网络的相关信息，而不是返回一个链接列表。

这个切入点在 2022 年是真实的。彼时 ChatGPT 刚刚发布，联网搜索能力还很初级，Google 的 AI 能力还没有跟上，"能给出有来源的直接答案"是市场上真实存在的空缺。

---

## 产品形态与设计决策

Perplexity 的产品形态有几个核心设计选择，每个都有明确的 trade-off。

**强制引用**是最核心的一个。每个答案都必须标注来源，用户可以点开原文验证。这个设计直接对标了 LLM 的最大痛点：幻觉问题。对于需要可信信息的用户——研究人员、记者、顾问——这个设计降低了验证成本，建立了信任。代价是：答案的生成质量受制于检索到的来源质量。如果网上关于某个话题的公开信息本身质量不高，Perplexity 的答案也会受限。它的天花板不是模型能力，而是互联网内容的质量。

**对话式界面**是第二个核心选择。用自然语言提问，而不是输入关键词。这降低了使用门槛，但也模糊了它和 ChatGPT 之间的边界——两者的交互方式从用户感知上越来越接近。

**Pro Search 和 Deep Research 的分层**是后来加入的。普通查询走轻量 pipeline，复杂研究任务走多轮搜索、分解子问题、综合多源信息的深度模式。这个分层逻辑是对的——用户的需求本来就有深浅之分。但这也带来了新的竞争压力：轻量查询上，它和 ChatGPT Search 的差异在缩小；深度研究上，它面对 OpenAI Deep Research、Google NotebookLM 等专项产品的正面竞争。

---

## 技术架构与护城河的边界

产品形态决定了 Perplexity 的技术路径：既然要做有来源的实时答案，就必须在检索和编排上做文章，而不是只依赖预训练模型的静态知识。

Perplexity 的技术核心是一套定制化的 RAG（Retrieval-Augmented Generation）pipeline，分为六个阶段：查询意图解析、实时网页检索、混合排序（BM25 + 语义向量）、多层机器学习重排、带引用的 prompt 组装、LLM 综合生成。它使用的底层模型混合了自研的 pplx 系列和第三方模型（OpenAI、Anthropic 等），根据任务类型动态路由。

这里有一个容易被误解的地方：Perplexity 的核心竞争力从来不是自己的底层 LLM，而是这套检索和编排系统的质量。实时检索解决了 LLM 知识截止日期的问题，强制引用解决了幻觉的信任问题，多层排序保证了来源质量。

这套技术路径在早期是差异化的。但它本身并不构成护城河——RAG 是业界通用方法，实时检索是工程问题，排序模型也可以被其他团队复制。技术可复制意味着竞争对手可以用同等方案追上，差异化一旦消失，用户就没有理由优先选择 Perplexity，这也直接传导到了它的留存表现上。

---

## 用户画像与留存困境

技术可复制性意味着产品差异化最终要落到用户体验和场景契合度上。但数据显示，Perplexity 在这两点上都面临结构性压力。

Perplexity 的真实用户不是随机的信息消费者。[用户数据显示](https://www.wearetenet.com/blog/perplexity-ai-statistics)，超过 53% 的用户年龄在 18 到 34 岁之间。桌面端使用比例从 2024 年 2 月的 36.5% 激增至 2025 年 3 月的 83.5%——一种可能的解读是，它的用户在向专业研究型迁移，因为做深度研究的人更倾向于坐在电脑前工作，而非移动端碎片化使用。用更直白的话描述真实用户画像：需要快速搞清楚一件事、同时需要来源可信的研究型用户——学生、记者、顾问、产品经理。

但留存数据揭示了问题：[只有 19% 的用户每天使用 Perplexity](https://www.wearetenet.com/blog/perplexity-ai-statistics)，超过一半是低频或偶发使用。这不是个别用户的问题，是产品层面的系统性困境。

原因不难理解。"需要有来源的深度研究"这个场景，本质上是低频需求。多数人不是每天都需要做深度信息综合，日常的快速查询用 ChatGPT 已经够了。Perplexity 精准命中了一个真实的场景，但这个场景的频率支撑不起高留存。

从竞争格局来看，这个留存困境也反映在了市场份额上。[据 InsightMark Research 的数据](https://insightmarkresearch.com/insights/perplexity-ai-statistics-size-and-usage)，Perplexity 在 AI 搜索市场约占 2.5%，而 ChatGPT 占 64.5%，Google Gemini 占 21.5%（数据来源为聚合统计，未经独立验证）。[据 Digital Applied 2026 年报告](https://www.digitalapplied.com/blog/ai-search-engine-statistics-2026-market-share)，ChatGPT Search 每周处理约 2.5 到 5 亿次查询，Perplexity 约 5000 万次，差距超过五倍。用户数量方面，[据 FatJoe 统计](https://fatjoe.com/blog/perplexity-ai-stats/)，Perplexity 月活跃用户超过 3300 万，2025 年全年查询量超过 7.8 亿次，增长依然可观，但增速已落后于整个 AI 行业平均水平。

---

## 技术发展正在压缩它的空间

留存困境是内因，而外部技术格局的变化，正在从另一个方向同时施压。

2022 年，Perplexity 的核心能力是稀缺的。但到 2025 年，ChatGPT Search、Claude、Gemini 都在做带来源引用的实时搜索，这些产品背后的底层模型能力更强，资金更充裕，用户基数更大。从目前格局来看，Perplexity 当年的差异化能力，正在成为行业标配。

更深层的威胁来自入口逻辑的变化。对于大多数 C 端产品而言，IM 式的对话界面正在成为主流信息获取方式——用户不会专门打开一个搜索产品，而是在已经使用的 AI 助手里直接提问。这个趋势对 Perplexity 的打击是结构性的：独立搜索产品的流量入口，正在被基模厂商的原生界面蚕食。

ChatGPT 和 Perplexity 的竞争，在这个维度上尤为直接。两者的使用场景几乎完全重叠：用户想搜索一件事，可以打开 Perplexity，也可以直接在 ChatGPT 里问。切换成本趋近于零。[据 Trending Topics 的报道](https://www.trendingtopics.eu/googles-gemini-eats-into-chatgpts-market-share-grok-overtakes-perplexity/)，Grok 的市场份额在 2025 年内从零增长至 3.4%，在某一时间段内已超过 Perplexity 的 2.0%——一个几乎从零起步的产品，靠 X 平台的流量入口优势，就能在短时间内追平一个深耕搜索场景多年的产品。这说明，在没有强绑定入口的情况下，AI 搜索的用户忠诚度极难建立。

[Perplexity 意识到了这个威胁，在 2025 年 7 月推出了 Comet 浏览器](https://www.cnbc.com/2025/10/02/perplexity-ai-comet-browser-free-.html)，试图从搜索入口延伸到浏览器入口，[10 月向所有用户免费开放](https://www.perplexity.ai/hub/blog/comet-is-now-available-to-everyone-worldwide)，[11 月扩展到 Android 移动端](https://www.bloomberg.com/news/articles/2025-11-20/perplexity-brings-ai-browser-comet-to-android-ios-coming-soon)。这个战略方向的出发点可以理解——没有入口就没有留存，浏览器是最接近"默认入口"的产品形态。但浏览器市场的竞争壁垒比搜索更高：Chrome 的生态优势和用户习惯惯性构成了不小的障碍，而 Anthropic 的 Claude for Chrome 也在 2025 年 8 月以浏览器插件形式切入同一场景。从一个正在被压缩的市场，跳入一个更难攻克的市场，这个押注能否成立，目前还看不清楚。

---

## 三个判断，一条逻辑线

把这一切串起来，我自己归纳出三个递进的判断，大致可以描述 Perplexity 的处境。

**第一个判断：产品本身没有做错。** 它在正确的时间识别了真实的痛点，产品设计逻辑自洽，技术路径合理。强制引用、实时检索、对话式界面——每个选择都有清晰的产品理由，解决的也是用户真实存在的问题。

**第二个判断：它的壁垒没有建起来。** 先发优势没能转化成用户迁移成本，技术能力可以被复制，用户场景频率不足以支撑高留存。有时会有人把 Perplexity 和 Cursor 类比——同样是"套壳"产品，Cursor 却活得不错。但两者有本质差异：Cursor 深度嵌入了开发者的工作流，项目配置、快捷键、使用习惯都在里面，换用成本相对更高；而 Perplexity 的使用行为更接近"随时可以去别处问一句"，粘性天然更弱。

**第三个判断：独立 AI 搜索这个品类的位置，正在变小。** 这不是 Perplexity 的失误，而是基模厂商能力边界扩张的必然结果。当 ChatGPT、Claude、Gemini 都能做有来源引用的实时搜索，独立搜索产品的存在理由就从"唯一能做这件事的"变成了"做这件事的其中一个"——而用户通常不会为了"其中一个"专门保留一个入口。

Perplexity 大概率不会消失。我的判断是，它会继续服务那批真正需要深度研究和来源验证的用户，在细分市场里找到位置。但 [210 亿美元的估值](https://digidai.github.io/2025/11/08/aravind-srinivas-perplexity-deep-analysis/)预设了它能成为搜索领域的主流玩家——这个前提，在目前的格局下，很难成立。

它做对了产品，但站错了位置。或者更准确地说：它站对了位置，只是这个位置本身正在变小。

---

## 参考资料

- [What Would You Ask If No One Could Judge You? – Figma Blog](https://www.figma.com/blog/perplexity-ai-interview/)
- [Perplexity AI User Statistics – Tenet](https://www.wearetenet.com/blog/perplexity-ai-statistics)
- [Perplexity AI Statistics – InsightMark Research](https://insightmarkresearch.com/insights/perplexity-ai-statistics-size-and-usage)
- [AI Search Engine Statistics 2026 – Digital Applied](https://www.digitalapplied.com/blog/ai-search-engine-statistics-2026-market-share)
- [Perplexity AI Stats 2026 – FatJoe](https://fatjoe.com/blog/perplexity-ai-stats/)
- [Google's Gemini eats into ChatGPT's market share, Grok overtakes Perplexity – Trending Topics](https://www.trendingtopics.eu/googles-gemini-eats-into-chatgpts-market-share-grok-overtakes-perplexity/)
- [Perplexity AI rolls out Comet browser for free worldwide – CNBC](https://www.cnbc.com/2025/10/02/perplexity-ai-comet-browser-free-.html)
- [The Internet is Better on Comet – Perplexity Blog](https://www.perplexity.ai/hub/blog/comet-is-now-available-to-everyone-worldwide)
- [Perplexity Brings AI Browser Comet to Android – Bloomberg](https://www.bloomberg.com/news/articles/2025-11-20/perplexity-brings-ai-browser-comet-to-android-ios-coming-soon)
- [Aravind Srinivas: Perplexity AI Challenges Google – digidai](https://digidai.github.io/2025/11/08/aravind-srinivas-perplexity-deep-analysis/)
