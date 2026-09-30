# Blog 研究待办与聚合候选

最近更新：2026-09-30。这里保存未解决的问题、后续证据和可能的文章去向；“可立项”仍是研究建议，分类、大纲与正文需继续经过正式流程。

记录、召回、聚合和结项规则唯一维护在 [Blog SOP](governance/blog-sop.md) 的“研究待办记录与跨事项聚合”。正式系列规划见 [series/](series/)，已发布文章见 [posts-meta.json](data/posts-meta.json)。

## 未结项总览

| ID | 核心问题 | 状态 | 最近核验 |
|---|---|---|---|
| BR-20260930-01 | 软件市场带来什么采购增量 | 待补证 | 2026-09-30 |
| BR-20260930-02 | 第三方能力怎样被持续复用 | 待补证 | 2026-09-30 |
| BR-20260930-03 | Agent 操作后设计价值怎样变 | 待研究 | 2026-09-30 |
| BR-20260930-04 | 长期委托能否有用且可持续 | 待补证 | 2026-09-30 |
| BR-20260930-05 | 消费入口与中介价值怎样迁移 | 待补证 | 2026-09-30 |

## 事项详情

### BR-20260930-01｜OpenAI Marketplace 与企业软件采购

- **创建 / 最近核验**：2026-09-30 / 2026-09-30。事件发生于美国时间 2026-09-29 的 DevDay。
- **原始触发与问题**：Personal Agent 研究中出现 OpenAI 软件市场。它是否延续旧 GPT Store，真正新增的是何种采购机制，未来会否改变伙伴软件的销售渠道？
- **已知事实与来源**：官方 FAQ 将 Marketplace 定义为企业采购 beta：合格伙伴产品的购买金额可计入符合条件客户的部分 OpenAI 合同承诺额度；客户与伙伴签约，由伙伴开票，当前没有自助结账。来源：[Marketplace for enterprise customers](https://help.openai.com/en/articles/20001553-openai-marketplace-for-enterprise-customers)。该材料证明当前机制，不证明交易规模或伙伴收益。
- **当前判断 / 待验证假设**：可作为企业软件采购与渠道研究的候选。它不是 GPT Store 的直接改名；采购市场与在伙伴应用中使用 OpenAI 推理额度也须区分。是否产生新增需求、降低采购阻力或加强平台依赖，仍是待验证问题。
- **关键缺口**：客户、产品与采购的准入和额度认定实践；伙伴如何销售、交付和续约；新增成交与既有支出转移如何区分；有无真实客户或伙伴反馈。
- **下一步 / 重访条件**：出现详细采购规则、伙伴交易实践或可核实的采购结果时定向补证；不以发布会功能数量作为独立文章理由。
- **状态与可能去向**：待补证。商业类候选，尚未立项；与 BR-20260930-02 共同列入下方聚合观察，但不并入当前 Personal Agent 主体。
- **检索提示**：企业软件采购、合同承诺额度、伙伴渠道、客户关系、分发与采购。

### BR-20260930-02｜从定制 GPT 到 Plugins，能力如何被持续复用

- **创建 / 最近核验**：2026-09-30 / 2026-09-30。涉及多个事件：2023 年 GPTs、2024 年 GPT Store、2025 年应用目录及 2026 年迁移安排。
- **原始触发与问题**：用户记得早期类似 App Store 的 Agent 商店。第三方交付的内容、调用入口和复用方式实际改变了什么，是否足以形成新的开发者价值？
- **已知事实与来源**：GPTs 原本已经支持工具和 API Actions；2025 年开放应用提交与目录；2026-03-25 官方文档说明已批准的 Apps SDK 集成可作为 Codex plugins 分发；当前 custom GPT 退休计划提供迁移至 Plugins 的路线。来源：[Introducing GPTs](https://openai.com/index/introducing-gpts/)、[GPT Store](https://openai.com/index/introducing-the-gpt-store/)、[Apps submissions](https://openai.com/index/developers-can-now-submit-apps-to-chatgpt/)、[Plugin changelog](https://developers.openai.com/plugins/changelog)、[Custom GPT migration FAQ](https://help.openai.com/en/articles/20001519-custom-gpt-retirement-and-migration-faq)。
- **当前判断 / 待验证假设**：存在产品承接证据，但不能把历史流量、用户关系或创作者经济视为完整迁移。GPT Store 的关注度感受不能替代失败证据。当前 Plugins 的能力分发与 Marketplace 的企业采购是不同机制。
- **2026-09-30 第三方运行与付费补证**：9/29 DevDay 的 Sign in with ChatGPT 将 OpenClaw 列入可使用 ChatGPT 套餐额度的参与工具；官方 FAQ 说明该机制先与有限伙伴推出，合格 AI 请求计入用户原有 Plus / Pro 额度，第三方仍可对订阅、基础设施或服务另行收费。共享额度不等于免费算力、第三方获得全部 ChatGPT Context，也不等于所有商业开发者已获准接入。来源：[DevDay 回顾](https://openai.com/index/devday-2026-recap/)、[第三方使用套餐说明](https://help.openai.com/en/articles/20001542-using-your-chatgpt-plan-in-other-apps-and-sites)。这为平台与独立产品可能同时竞争、合作提供机制证据；第三方能否保留用户关系、服务收入与稳定分发仍待验证。
- **关键缺口**：开发者实际提交、维护与更新什么；用户是否跨任务重复使用；Agent 的选择与调用如何影响分发；创作者收益、平台抽成或商业化安排是否有可验证数据。
- **下一步 / 重访条件**：出现真实插件开发者、用户复用或商业实践时补证。重访时核验迁移时点与范围，不能提前把计划退休写成已经全面关闭。
- **状态与可能去向**：待补证。可为“软件如何被交付与复用”提供材料，也可作为采购市场研究的对照；尚无独立文章或系列承诺。
- **检索提示**：GPT Store、Apps SDK、Plugins、能力分发、持续复用、开发者交付。

### BR-20260930-03｜Agent 成为操作者后，优秀产品设计的价值变化

- **创建 / 最近核验**：2026-09-30 / 2026-09-30。问题来自当前 Blog 探讨，不是已经发生的行业结论。
- **原始触发与问题**：当 Agent 承担更多软件操作，过去为人优化的菜单、No-code、多维表格、模板、Dashboard、Eval 等，哪些优势可能减弱，哪些仍然重要或更有价值？AI PM 的优化对象如何变化？
- **已有背景与来源性质**：作者已明确将其保留为 Personal Agent 之后的研究线。历史文章 [《AI 正在把“使用软件”和“操作软件”拆开》发布 HTML](https://github.com/MarkTian-Long/marktian-long.github.io/blob/main/tools/blog/posts/ai-software-operator-shift.html) 已讨论操作方式与软件在任务链中的位置；它只能证明作者的历史公开观点，不能替代新实践证据。
- **当前判断 / 待验证假设**：候选角度是比较“减少人的操作步骤”与“减少完整任务和流程中的阻力”。不能预设菜单、表格、Dashboard 或 Eval 会整体消亡，也不能因为它们同属产品设计就当成同一层级。
- **关键缺口**：同一真实任务在人操作与 Agent 操作下的具体差异；界面便利、业务语义、权威状态、异常处理和验证分别贡献什么；替代或互补证据；与历史文章的独立内容增量。
- **下一步 / 重访条件**：当前 Personal Agent 主线完成后，先保留本题独立起点，再选少量可比较的真实任务展开研究并做历史覆盖；不按功能名录机械逐项评判。
- **状态与可能去向**：待研究。产品类候选，属于已保留的下一研究线；大纲与结论尚未确认。当前 Personal Agent 结尾只打开问题。
- **检索提示**：Agent 操作软件、交互摩擦、任务与流程阻力、多维表格、产品设计、AI PM。

### BR-20260930-04｜持续委托的真实需求、净收益与商业可持续性

- **创建 / 最近核验**：2026-09-30 / 2026-09-30。由 Personal Agent 前两轮研究的证据缺口产生；本轮用户进一步追问需求来源、旧方案为何未解决、持续付费与 C 端 AI Native 是否成立。
- **原始触发与问题**：有用的单次代办，能否变成用户愿意长期保留的服务？解释、授权、监督、接管与纠错是否抵消节省的精力，持续运行是否经济？
- **已有证据与边界**：官方 Dots / Muse 发布证明持续职责与运行控制的产品路线；一名记者的 Instinct 亲历同时报告有用的代办与违反限制的错误。来源：[Dots](https://openai.com/index/introducing-dots/)、[Muse](https://about.fb.com/news/2026/09/introducing-muse-personal-ai-agent/)、[WIRED 使用报道](https://www.wired.com/story/i-finally-found-an-ai-agent-worth-the-risk/)。单人亲历不代表总体成功率，不将不同任务的金额相减充当产品净收益。
- **2026-09-30 补证**：2019 年家庭认知劳动研究已区分预见需求、寻找选项、决策与跟进，支持“执行之外存在管理负担”，不证明 AI 效果或付费意愿；Apple WWDC19 已展示事件触发、跨 App 串联和预定义流程中的追问，不能把这些机制当作大模型独有。来源：[Daminger 研究摘要](https://journals.sagepub.com/doi/10.1177/0003122419859007)、[Apple 官方逐字稿](https://developer.apple.com/videos/play/wwdc2019/213/)。
- **2026-09-30 付费与人群证据**：9/21 的公开 GitHub issue 中，一位用户自述 9/20 开始订阅 Muse Power，下次续费为 10/20；这是购买自述，未展示付款凭证，也未发生续费。Dots 9/29 公告则说明首个包含在 Pro / Business Premium 中且不额外收费，不能据此推断增量付费意愿。Meta 9/29 向同一 Muse 增加小生意工具连接，提示个人入口中混有经营与工作需求。来源：[Muse 订阅用户自述](https://github.com/steipete/CodexBar/issues/3797)、[Dots 套餐说明](https://openai.com/index/introducing-dots/)、[Muse for Small Business 官方发布](https://about.fb.com/news/2026/09/introducing-muse-small-business/)。这些材料均不能证明大众长期付费或健康单位经济。
- **2026-09-30 商业化口径修正**：用户指出，商业可持续不以消费者直接订阅为必要条件。广告、商家获客费用、成交佣金、按次服务与生态捆绑都应分别检验付款方买到什么、收入归谁以及完整服务成本；先前的购买与续费材料只覆盖直接付费分支。OpenAI 2025-09-29 公布 Instant Checkout 商家成交收费，2026-05-05 又公布 ChatGPT 广告 CPC 计费；这些证明相关 AI 产品存在商家付费路径，不证明 Dots 已用相同模式，更不证明长期个人代理已经盈利。来源：[2025 Instant Checkout](https://openai.com/index/buy-it-in-chatgpt/)、[ChatGPT 广告计费](https://openai.com/index/new-ways-to-buy-chatgpt-ads/)。
- **商业化压力测试**：商家付费能否覆盖不产生交易的长期事务与失败 / 接管成本；它带来新增或成本更低的成交，还是仅多收一层渠道费用；用户最优结果为不买、取消或退款时是否仍获得同等服务。订阅不自动保证目标一致，广告和佣金也不自动证明损害用户。OpenAI 2026-09-16 的 Sponsored Agents 测试明确区分商家赞助会话与原聊天，只证明其角色隔离设计，不是独立效果审计或 Dots 变现事实。来源：[Sponsored Agents 公告](https://openai.com/index/reimagining-advertising-with-ai/)。
- **2026-09-30 历史热潮压力测试**：不能把热度回落、原型停止支持、载体迁移和商业失败混为一类。Lensa 的 AI 头像热潮在 2022 年末爆发，2023-01-06 的 Appfigures 估计显示峰值回落后收入仍高于此前基线；这是统计估计，不是利润或留存披露。AutoGPT Classic 官方标记不再支持，但同名平台仍在经营；custom GPTs 当前仍可用，官方计划 2026-12-11 退休并提供 Plugins 迁移，部分合格企业可延期。Humane AI Pin 则于 2025-02-28 停止主要云端服务。来源：[Appfigures 当期估计](https://appfigures.com/resources/insights/20230106/5-is-the-ride-over-for-lensa-ai-(and-ai-generated-art))、[AutoGPT Classic](https://github.com/Significant-Gravitas/AutoGPT/blob/master/classic/README.md)、[AutoGPT 当前平台](https://agpt.co/)、[GPT 迁移 FAQ](https://help.openai.com/en/articles/20001519-custom-gpt-retirement-and-migration-faq)、[Humane 官方消费者通知](https://support.humane.com/hc/en-us/articles/34374173951373-Important-Update-for-Consumer-Ai-Pin-Customers)。Humane 原站本轮直接访问失败，相关官方通知可由搜索读取，不能声称已直接访问全文页面。
- **历史比较后的检验**：观察新鲜期之后的重复委托、实际结果与人的总投入，区分有价值的低频体验和持续事务服务；创作数、下载量、GitHub 星标及发布数量不替代采用。产品能连续运行仍可能交付无用结果；关闭或迁移时，未完事务、承诺、授权与未来触发器能否被接续，也应纳入长期服务价值。历史案例用于暴露机制与反例，不能以少量精选案例计算本轮产品的失败概率，更不能把原型 / 单个厂商退出当作整个需求消失。
- **2026-09-30 消费创业机会补证**：用户进一步追问独立 Personal Agent 产品如何存续。Ohai 的当前官方材料提供家庭事务的窄机制：共享日历、学校更新与 Circle 成员协作；任务分派需用户提出请求，再联系成员确认，尚非自行分派全部家务。官网同时提供付费套餐及复杂日程 / 文档的人工复核。来源：[家庭协作与能力边界](https://www.ohai.ai/features/ai-household-collaboration-tools/)、[官网费用与人工支持 FAQ](https://www.ohai.ai/)。这些证明服务设计与报价，不证明用户长期采用、总体净收益或单位经济；候选价值在持续协调与减少检查负担，不能仅凭“做垂直”“有长期记忆”判定护城河。
- **消费服务的反证**：Good Housekeeping 2025-09-23 的家长记者试用同时记录资料整理收益与校历查找 / 旧日历清理障碍，属于带联盟营销披露的单人体验。Ohai 的购物合作由用户在 Instacart 检查并完成购买；Instacart 又于 2026-09-09 发布自有 Clementine 并连接多个 AI 入口。因此，接入既有履约网络本身不构成独占优势，仍需证明跨来源家庭背景和持续协调的额外价值。来源：[亲历记录](https://www.goodhousekeeping.com/relationships/parenting/a68017298/ohai-app-review/)、[Ohai 2024 合作发布](https://www.ohai.ai/blog/ohai-integrates-instacart-ordering/)、[Instacart 当前发布](https://investors.instacart.com/News/news-releases/news-details/2026/Meet-Clementine-Instacarts-AI-Shopping-Assistant-That-Takes-Whats-for-Dinner-Off-Your-Plate/default.aspx)。
- **OpenClaw 热潮与收入归属**：2026-03-13 WIRED 的具名用户采访记录，一位跨境电商从业者支付云服务器与模型接入费用后，把原来的广泛设想收窄为新闻聚合和公众号内容辅助。来源：[WIRED 用户采访](https://www.wired.com/story/china-is-going-all-in-on-openclaw/)。这是尝试与基础服务支出的个案，不是 Agent 应用收入、稳定工作成效或长期续费数据；不能由安装热潮推成大众持续委托已成立。
- **新增机会检验**：个人生活、个人工作和组织岗位分别看需求与采购。Dots 官方将代表个人的 primary dot 与组织配置身份 / 凭证的 specialist dots 区分，后者仍为企业试点；共享产品形态不证明消费生活需求。来源：[Dots 发布](https://openai.com/index/introducing-dots/)、[工作区管理范围](https://help.openai.com/en/articles/20001554-manage-dots-in-chatgpt-workspaces)。独立产品的后续证据应显示：通用平台也能执行后，特定事务还留下多少可持续的净价值；服务方能保留何种收入、承担多少人工 / 失败 / 维护成本，以及用户为什么继续委托。创业赛道地图暂不另行立项。
- **当前判断 / 待验证假设**：需求检验已从文末限制前移为本篇前提。候选价值是减少持续记挂、协调与跟进，并使原本难以推进的个人目标更可行；是否实现需同时看结果与人的总投入。事务密集且能复用背景、连接与信任的人群可能更早获得持续价值，但这只是待验证的定位假设。一次清理历史订阅或追回退款的收益不能外推为每月新收益；个人付费、生活用途、AI Native、独立入口与独立公司分别判断。
- **关键缺口**：完整事务周期中的真实重复需求、交代 / 核查 / 补救投入及未发现的错误；跨任务背景与连接的实际复用；新鲜期和补贴之后的持续使用与授权、直接付费者的续费及原因、商家实际支出与收益、捆绑服务的增量价值；生活与工作人群差异；可比服务成本、平台准入与原生 App / 确定性自动化替代。已有付费个案，但本轮仍未找到足以证明稳定大众消费范式的可比长期数据，不宣称相关数据不存在。
- **下一步 / 重访条件**：出现独立长期使用、客户实践或可解释的成本数据时，核对样本、观察周期、任务范围、付费口径与最佳现有替代方案，再决定是否改变主张；不把支付授权、商品交易额或捆绑会员数当作 Agent 服务收入。
- **状态与可能去向**：待补证。需求判别进入当前 Personal Agent 的前置研究；大纲尚未获确认，正文未写。长期效果与商业验证继续留在本条；消费入口和渠道价值的深入讨论另见 BR-20260930-05。未来有强证据时可用于复盘或新选题，尚未另行立项。
- **检索提示**：持续委托、认知劳动、用户接管、净精力收益、支付意愿、长期留存、运行成本、原生 AI、现有替代方案。

### BR-20260930-05｜消费入口迁移与信息中介的价值

- **创建 / 最近核验**：2026-09-30 / 2026-09-30。来自用户对 Personal Agent 商业化及手机 App 入口的追问，不是已经确认的行业结论。
- **原始触发与问题**：当用户把任务交给 Agent，购物、视频、小说等消费活动的哪些环节会转移？原有信息聚合和交易中介的收入会减少，还是迁给新的中介？内容、数据、供给和履约方能保留什么价值与议价权？
- **已知事实与来源**：OpenAI 2026-03-24 明确称初版 Instant Checkout 灵活性不足，转向支持商家自己的结账体验并加强商品发现。当前 Shopify ChatGPT 渠道允许在应用内浏览器 / 新标签页使用商家结账，条款说明没有额外销售费，仅标准支付处理费；不能把 2025 年的成交收费公告当作此渠道当前收费。来源：[OpenAI 路线调整](https://openai.com/index/powering-product-discovery-in-chatgpt/)、[Shopify ChatGPT 当前条款](https://help.shopify.com/en/manual/online-sales-channels/agentic-storefronts/chatgpt)。这些材料证明具体合作及交接机制，不能证明用户迁移规模、佣金收入或商业成功。
- **反例与边界**：YouTube 2026-09-23 发布的购物辅助可先组织评测推荐，再进入视频观看页继续追问，说明原生平台也在吸收 AI 发现能力；Amazon 关于 Comet 的公开声明表达了不接受相关第三方购物代理接入的立场。来源：[YouTube 发布](https://blog.youtube/news-and-events/made-on-youtube-viewer-custom-feeds-shopping-tools/)、[Amazon 声明](https://www.aboutamazon.com/news/company-news/amazon-perplexity-comet-statement)。前者不证明留存效果，后者是当事方立场，不采纳其争议性安全指控，也不据此判定最新诉讼结果。
- **2026-09-30 参与价值补证**：用户进一步强调，筛选和逛购可能本身就是休闲娱乐。Babin 等 1994 年购物价值研究区分可同时存在的功用与享乐维度，支持同一次购买同时具有结果与过程价值；不据此推断性别决定代办偏好。产品判断应了解此人对此次活动希望保留哪些参与，不能将更少操作、更快结账或更长停留直接视作用户获益。来源：[作者所在大学收录的研究摘要](https://aquila.usm.edu/fac_pubs/7202/)。
- **辅助探索的实际机制**：Amazon Interests 允许保存兴趣、预算和偏好，持续查找并提示新商品、补货和优惠，保留用户浏览与选择。官方说明证明主动服务可以支持探索，不证明用户享受程度、留存或完整 Personal Agent 范式。来源：[Amazon Interests](https://www.aboutamazon.com/news/retail/artificial-intelligence-amazon-features-interest)。分析上允许同一事务在代办与辅助探索之间切换；喜欢逛不等于喜欢每一步，想省事也不等于交出全部偏好判断。
- **当前判断 / 待验证假设**：按一次消费的目的和环节划分，比按 App 行业划分更准确。发现、比较和操作可能被代理，用户想亲历的观看、阅读、社交或逛购不宜当作待消除的工作；体验不可代劳也不保证发现入口不变。少打开 App 不等于不再使用其内容和服务。公开信息搬运与导流可能更受压力，但原始数据、版权、供给、信用、售后和履约有不同约束；仍被需要不保证原厂商保住收入。Agent 也可能成为新的分发与交易中介。
- **关键缺口**：同类真实任务从发现到售后的迁移比例、商家新增或替代渠道收入、内容和数据授权成本、非合作供给的可见性、平台阻断与原生 AI 的影响；商业化成功究竟需要长期个人背景，还是一次性购物助手已足够。技术可执行、用户愿意交付与服务方允许接入需分别判断。
- **下一步 / 重访条件**：出现可核实的商家结算、渠道转化、发布者流量 / 授权收入或持续消费者实践时补证，区分交易额、渠道佣金与利润；新闻中的收费计划、支付能力和合作名单不能替代结果。独立成文前检验相对历史“AI 操作软件 / 平台入口”的内容增量。
- **状态与可能去向**：待补证。可作为商业类研究候选，未确认分类、未立项。当前 Personal Agent 只保留需求边界与代表用户的激励约束；深入的消费渠道重分配留在此条。与 BR-20260930-04 互补，但不因此与企业采购 BR-20260930-01 或产品设计 BR-20260930-03 自动合并。
- **检索提示**：购物代理、广告、成交佣金、商家获客、消费入口、体验消费、信息中介、原始供给、平台准入、渠道价值。

## 聚合候选（尚未立项）

### 能力分发与软件采购，何时会形成一条商业链路？

- **关联事项**：BR-20260930-01、BR-20260930-02。
- **待验证的关系**：前者涉及购买与预算，后者涉及能力交付、发现和复用。拟研究平台能否把使用和复用带来的需求转为伙伴软件采购；二者同属 OpenAI 不是合并依据。
- **材料角色**：01 提供采购机制；02 提供交付和使用入口的背景及边界，不能拿插件分发证明采购成功。
- **仍缺什么**：调用、复用与采购之间的实际连接，以及伙伴或客户的可核实实践。若没有这层连接，应分别使用或关闭聚合候选，不把两个机制硬写成一个商店。
- **当前处置**：待补证，尚未立项。独立成文前须证明相对旧文“体系竞争 / 默认调用权 / 平台上的行业能力”的增量；暂不写整场 DevDay 综述。

## 结项记录

暂无。条目转入、合并或关闭后，在这里保留原 ID、处理日期、去向与理由。
