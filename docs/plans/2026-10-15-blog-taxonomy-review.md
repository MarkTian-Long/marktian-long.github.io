# Blog taxonomy 语义治理复核｜2026-10-15

## 范围与依据

用户授权：统一概念定义并推进全部必要修改；不调整 UI。此次不引入四种强制阅读类型，不按数量配额削减标签。词义真源仍为 `tools/blog/data/blog-taxonomy.json`，本文件只记录一次迁移的依据和结果。

变更前基线：`487061b22094389e03a80cfd2cc5ac4fe0770489`。发布事实使用该提交对应的成功部署产物（Actions run `38689348393`）中的 48 篇 HTML，并与仓库当前源文件核对。全部元数据先独立筛查，再依据正文主要问题、论证与结论决定保持或调整；未对历史新闻、数字和引用重新做外部事实审计，不以本次标注为历史观点重新背书。

## 结果

48 篇均有审查结论：24 篇调整，24 篇保持。只变更 `category / tags / topics`；文章标题、摘要、分享引语、concepts、发布日期、URL、数组顺序、显式关系和视觉资产均保持。所有发布 HTML、UI 样式、运行时与推荐算法不修改，五篇精选不修改。

| 项目 | 变更前 | 变更后 |
|---|---:|---:|
| 决策框架 | 15 | 10 |
| 技术判断 | 20 | 14 |
| 市场格局 | 9 | 6 |
| 工程演进 | 4 | 2 |
| 企业AI 话题 | 13 | 11 |
| 人机协作话题 | 1 | 7 |
| 无附加 tags | 0 | 11 |
| 话题暂缺 | 0 | 2 |

分类分布：技术 21→22，产品 12→13，商业 3→3，行业 8→8，实践 4→2。分布是逐篇判定的结果，不是迁移目标。

## 逐篇决策

“—”表示审查后选择不标注；不是未审查。下表仅列实际变更字段。正文依据为各行文章的主要论证，不以标题字面单独判定。

| 文章 | 判定 / 字段变更 | 正文依据 |
|---|---|---|
| [AI 越来越强，怎样把一件事做出价值？](../../tools/blog/posts/ai-work-value-loop.html) | 保持 | 亲历调研、PRD 交付和写作积累构成主体；四个问题贯穿全文并提供取舍依据，保留实践／决策框架／人机协作。 |
| [视频已经能“生成未来”，为什么还不等于会预测世界？](../../tools/blog/posts/video-world-model.html) | 保持 | 主要区分视频生成与世界预测的能力边界，并以一致性、动作和结果验证判断能力；保留技术判断。 |
| [看 AI，不要只问它像历史上的哪一年](../../tools/blog/posts/ai-industry-history-mechanisms.html) | 标签：决策框架、市场格局 → 决策框架 | 六节主线是历史机制与成立条件的压力测试，不是当前市场参与方竞争分布；保留决策框架，删除市场格局。 |
| [AI 正在把“使用软件”和“操作软件”拆开](../../tools/blog/posts/ai-software-operator-shift.html) | 保持 | 以“删除测试”判断软件职责和存续价值，Agent 与产品职责均构成主线；保持。 |
| [当 AI 让拍电影变快、变便宜，电影工业会先改变什么？](../../tools/blog/posts/ai-film-industry.html) | 话题：模型能力 → — | 主线是影视制作解耦、参与方与资产重组；模型能力只是前提，不据此标模型能力。现有话题缺少合适领域，已审查后暂缺。 |
| [视频模型到底在进化什么？为什么“画面惊艳”已经不够了](../../tools/blog/posts/video-model-evolution.html) | 保持 | 持续状态、可控修改和可用结果的可靠性构成技术评价主线；保留技术判断。 |
| [多模态到底统一了什么？](../../tools/blog/posts/multimodal-unification.html) | 标签：技术判断 → — | 主要解释理解、生成、原生模态和系统组合的区别；不因是技术文章或结尾有问题清单就加技术判断。 |
| [已经有知识库了，企业 AI 为什么又开始做 Wiki？](../../tools/blog/posts/enterprise-ai-wiki.html) | 标签：决策框架 → — | 主体是知识产品的职责、维护和边界；文末何时需要 Wiki 的建议不等于全文以决策方法为主要产出。企业知识落地仍是核心话题。 |
| [我为什么开始给自己搭 Harness？](../../tools/blog/posts/personal-harness.html) | 标签：决策框架 → —；话题：Agent → Agent、人机协作 | 真实系统由工作摩擦逐步演化的复盘；并非给所有人一套通用框架。Agent 环境与人的长期协作各自构成主线。 |
| [当人和 AI 都在改变，“对齐”还能一次完成吗？](../../tools/blog/posts/alignment-under-change.html) | 标签：技术判断、决策框架 → 决策框架；话题：Agent → Agent、人机协作 | “哪些变化有资格留下”及其证据、风险、回退条件构成可复用方法；技术判断不再重复附加，人和 AI 共同变化是独立主线。 |
| [AI 研发已经开始自我加速，但这还不是 RSI](../../tools/blog/posts/ai-rd-self-acceleration-rsi.html) | 保持 | 区分研发工具、自动研究与递归自我改进的能力和验证边界；模型能力与实验研究均必要，保持。 |
| [为什么企业开始谈 Agent「纳管」？](../../tools/blog/posts/enterprise-agent-governance.html) | 标签：市场格局 → — | 主体是跨应用身份、权限和责任治理为什么出现，未把市场参与方的竞争分布作为主要产出；保留行业栏目及两个主题，删除市场格局。 |
| [半年之后，AI 办公从产品赛马走向体系竞争](../../tools/blog/posts/ai-work-system-competition.html) | 保持 | 比较多家厂商在入口、模型、云和治理上的体系竞争；市场格局及 Agent／企业AI 均有实质支撑。 |
| [AI POC 到底在验证什么？一份给金融 B 端 AI PM 的推进地图](../../tools/blog/posts/ai-poc-financial-b2b-guide.html) | 分类：实践 → 产品 | 主体是 POC 客户决策、验证标准、退出和交接的通用指南，并非某次亲历项目的行动反馈复盘；归产品，决策框架及金融企业落地保持。 |
| [业务流程，如何变成 Agent 产品架构？](../../tools/blog/posts/agent-boundary.html) | 保持 | 围绕自主性、责任、信息、权限和协调成本建立“删、合、拆”条件，框架是主要产出，保持。 |
| [从同义词表到业务语义层：企业 AI 如何减少对业务含义的猜测](../../tools/blog/posts/ontology-business-semantic-layer.html) | 保持 | 业务语义显式化能消除何种猜测、哪些风险仍在以及采用条件是主要论证；保留技术判断、企业AI 与业务语义。 |
| [从 WorkBuddy 到 FDE：企业 Agent 为什么会走向不同落地方式？](../../tools/blog/posts/enterprise-agent-fde.html) | 保持 | 比较企业 Agent 的落地方式、复杂性承担与产品化收益；核心为商业创造和捕获价值，保持。 |
| [物理世界会有自己的 LLM 时刻吗？](../../tools/blog/posts/physical-world-llm.html) | 保持 | 评估物理交互和世界模型能否形成可靠闭环，实验条件与能力边界是主问题，保持。 |
| [从零搭建一个LLM智能客服：完整技术链路与关键决策](../../tools/blog/posts/llm-customer-service-tech-guide.html) | 标签：技术判断、架构设计 → 决策框架 | 从客服输入到检索、模型、评测、转人工的技术指南，反复给出场景条件与选型取舍；只保留决策框架，不沿用废弃架构设计或重复技术判断。 |
| [LLM 重构职场：不是谁消失，是每个人都在变](../../tools/blog/posts/llm-reshapes-software-roles.html) | 话题：企业AI → 人机协作 | 分析执行、协调和判断工作怎样在人与 AI 间重分配，落到职业能力投入；企业只是工作背景，话题改人机协作。 |
| [当AI开始主动找你：下一个软件入口，会是用来排序AI请求的那一层](../../tools/blog/posts/ai-arbitration-layer.html) | 标签：决策框架 → —；话题：Agent → Agent、人机协作 | 主要推演主动 AI 请求的排序入口及人的决策负担，不是可重复执行的决策方法；去掉决策框架，补人机协作。 |
| [一份招股书里，两种不同节奏的“AI”](../../tools/blog/posts/spacex-ai-infrastructure-valuation.html) | 标签：技术判断 → — | 正文明确重心在估值数字的时间尺度与商业证据，而非技术可行性；保留商业／算力基础设施，不加无对应的附加标签。 |
| [AI coding 之后，哪些 B 端 SaaS 会死，哪些会活](../../tools/blog/posts/llm-saas-moat-disruption.html) | 保持 | 自研成本、购买选择、行业知识及 SaaS 价值分配构成主线；保持商业、市场格局、企业AI。 |
| [Perplexity：做对了产品，但站错了位置](../../tools/blog/posts/perplexity-analysis.html) | 保持 | 围绕具体产品设计与竞争位置的矛盾展开，竞争判断及产品设计有独立信息；保持。 |
| [从模糊到确定：人机边界是怎么移动的](../../tools/blog/posts/human-ai-boundary-shift.html) | 分类：实践 → 产品；标签：决策框架 → —；话题：Agent → Agent、人机协作 | 数据管道经历主要引出一般的人机边界与产品控制设计，未展开作者系统改造后的反馈链；归产品。核心解释边界移动机制，文末两维建议不足以把全篇标为决策框架；补人机协作。 |
| [训练和推理，是两件不同的事](../../tools/blog/posts/training-vs-inference.html) | 标签：技术判断 → — | 解释训练与推理如何产生不同硬件需求及供给影响；主要贡献是机制解释，不默认附加技术判断。 |
| [芯片战争背后，藏着一张分工地图](../../tools/blog/posts/ai-chips-explainer.html) | 标签：技术判断 → — | 主要建立芯片分工、通用与专用的概念地图；并非技术选择或投资方法，删除默认技术判断。 |
| [模型跑出了测量边界，评测体系跟不上了](../../tools/blog/posts/ai-benchmark-failure.html) | 保持 | 评测饱和、污染和真实任务差异影响能力判断的有效性，技术判断与评测体系保持。 |
| [大模型的分越来越高，但有些差距只用几天就能感觉到](../../tools/blog/posts/llm-soft-quality.html) | 保持 | 评价主体性、抗谄媚和多轮压力下的稳定性，以及评分与真实使用的差距；保持技术判断、模型能力。 |
| [AI能大量生产方向，但还不会判断什么重要](../../tools/blog/posts/automated-research.html) | 话题：前沿研究 → 前沿研究、人机协作 | 实验研究系统能生产方向但仍依赖问题选择与研究判断，是研究对象与人的参与边界双主线；补人机协作，保留技术判断。 |
| [让 AI 写代码这件事，为什么到硬件就不行了](../../tools/blog/posts/ai-coding-hardware.html) | 保持 | 判断编码能力迁移到硬件为何受反馈周期和验证限制，技术能力边界为主；保持。 |
| [OpenAI 和 Anthropic 同一周下场做咨询，FDE 时代来了？](../../tools/blog/posts/fde-blog-v3.html) | 保持 | 多家模型厂商进入企业咨询及其落地竞争分工为主，保持行业、市场格局、企业AI。 |
| [大模型的下半场：当预训练不再是唯一战场](../../tools/blog/posts/llm-second-half.html) | 标签：市场格局 → 工程演进 | 主要分析从预训练向推理与 Agent 工程的范式转移，不是市场参与者分布；标签改工程演进，两个核心话题保持。 |
| [企业引入大模型 API，数据真的安全吗](../../tools/blog/posts/enterprise-ai-data-security.html) | 保持 | 企业模型 API 风险来源与不同约束下的应对选择为主，保留产品栏目与技术风险判断。 |
| [你叫它智能体，但它可能只是个工作流](../../tools/blog/posts/agent-vs-workflow.html) | 标签：决策框架 → —；话题：Agent → Agent、企业AI | 区分工作流与 Agent 后，重点解释企业采用现状及落地限制；不是通用选型框架。删除决策框架，补企业AI。 |
| [Claude Design：设计工具的iPhone时刻，还是一场更大的吞并？](../../tools/blog/posts/claude-design-blog.html) | 保持 | 以 Claude Design 和既有设计工具的职责与竞争位置为主要对象，保持竞争判断／产品设计。 |
| [Manus：它卖的不是 Agent，是一次认知震撼](../../tools/blog/posts/manus-agent-analysis.html) | 保持 | 围绕 Manus 的体验组织、产品认知与竞争信号，Agent 与产品设计共同支撑主线；保持。 |
| [OpenClaw 爆红背后：一个品类的诞生与宿命](../../tools/blog/posts/openclaw-brand-creation.html) | 保持 | 围绕具体产品的品类、品牌和壁垒展开；Agent 技术属于背景，不仅因产品是 Agent 再补话题。保持。 |
| [企业AI应用不是一条线，而是三个不同的战场](../../tools/blog/posts/enterprise-ai-three-stages.html) | 保持 | 以企业目标和验证阶段区分探索、交付、迭代，并明确每层决策；作者面试经历只是入口，产品／决策框架保持。 |
| [AI产品记忆系统：从四阶段演进到怎么做对](../../tools/blog/posts/memory-system.html) | 话题：Agent、产品设计 → 产品设计 | 跨会话记忆的用户目标、评估、成本和产品取舍为核心；Agent 是若干实现和案例，不把所有记忆产品自动标 Agent。保留产品设计与决策框架。 |
| [工程演进三段论：从 Prompt 到 Harness，竞争重心在哪里](../../tools/blog/posts/harness-engineering.html) | 保持 | 明确比较 Prompt、上下文与 Harness 的工程重心转移，保持工程演进／Agent。 |
| [Agent 现在面临的三大工程问题](../../tools/blog/posts/agent-three-problems.html) | 标签：工程演进 → — | 主体列举可靠性、成本、可控性三个当前工程问题；文末建议不等于完整范式迁移或决策方法。删除工程演进，保留技术／Agent。 |
| [2026 年 AI Agent 市场格局：开放 vs 封闭的博弈](../../tools/blog/posts/market-landscape-2026.html) | 话题：Agent、企业AI → Agent | 主要讨论平台订阅、Harness 控制与开放封闭生态竞争；不是企业采购或组织采用，移除企业AI，保留 Agent。 |
| [技术消亡度框架：判断哪些 AI 技术值得长期投入](../../tools/blog/posts/tech-obsolescence.html) | 分类：产品 → 技术；标签：决策框架、技术判断 → 决策框架；话题：企业AI → — | 判断技术需求是弥补模型缺陷还是编码领域知识，核心是技术生命周期投入；归技术，仅保留决策框架。企业例子不是企业AI主题，现有话题暂缺。 |
| [RAG 的演进：从被动检索到主动信息系统](../../tools/blog/posts/rag-evolution.html) | 保持 | 判断 RAG 的必要性、限制及随模型能力变化的长期位置，不止概念介绍；保持技术判断／RAG。 |
| [Skill 系统的本质：不是 Prompt 工程化，是 Harness 的支撑](../../tools/blog/posts/skill-system-and-harness.html) | 标签：工程演进、决策框架 → 技术判断 | 主要解释 Skill 的长期可靠性价值及哪些成分会失效，不是决策步骤，也没有充分的工程范式迁移展开；按主评价改为技术判断，Agent 保持。 |
| [微调的演进：哪些场景还值得做，哪些已被替代](../../tools/blog/posts/finetuning-evolution.html) | 保持 | 正文以值得继续微调与可被替代的场景区分为主，保留技术判断／Fine-tuning。 |
| [Prompt Engineering 的生命周期：哪些会消亡，哪些会留下](../../tools/blog/posts/prompt-engineering-lifecycle.html) | 标签：工程演进、技术判断 → 技术判断 | 主线是不同提示工作需求的生命周期与长期投入，不再并列附加工程演进；保留技术判断／提示工程。 |

## 已审查的两个话题缺口

- `ai-film-industry`：核心是影视制作流程、能力解耦和产业价值分配；模型能力只是变化前提，不能继续当作话题兜底。暂不为单篇新增“影视产业”等词；保留行业栏目、市场格局标签及原有显式关系。
- `tech-obsolescence`：核心是技术可替代性和投资耐久性的判断，企业只是适用场景；不再用企业AI兜底。保留技术栏目和决策框架。以后若同类内容形成持续检索需要，再独立评估准确的新话题，不把缺口伪装为已覆盖。

## 推荐影响复核

用当前 `article-runtime.js` 原函数和每篇发布正文的站内链接，分别输入变更前后完整索引进行对照。48 篇中 25 篇推荐名单发生变化；显式关系没有修改且仍优先展示。此次没有调整推荐算法，也没有把代码试算当成读者点击或满意度提升的证据。

代表性结果：当前工作价值文章在 Personal Harness 强关系之外，可关联持续对齐与软件岗位协作；电影工业文章保留视频模型演进的明确承接，不再凭宽泛模型话题补不相关文章；技术消亡度文章因没有准确话题且无显式关系，不强行补满推荐。Personal Harness 的明确关系保持，自动候选变化后仍在 Agent 与人机协作范围。

## 源稿兼容与保护

现有严格 frontmatter 的受影响源稿是 `docs/blog/ai-industry-history-mechanisms.md`，只移除其 tags 中的市场格局，再与索引对齐。其他受影响文章没有严格 frontmatter，部分历史 Markdown 与已发布页面不等价；依发布指南的历史例外，仅修改运行索引，不批量生成 HTML 或重建源稿。历史 HTML 注释保留旧发布记录，前台当前标注由索引读取。

## 规则与校验实现

- taxonomy 保持数据格式 version 1，语义修订号为 2；增加字段职责、空值语义、数量范围、选择原则和高风险标签正反例。
- 校验器读取词典中的标签数量范围，允许已审查的空数组，但仍拒绝缺失字段、null、空字符串、未知词、重复词、跨字段重复、超过上限，以及新稿使用废弃词。concepts、分类、分享原句、关系约束不放松。
- impact audit 扩大到字段职责、数量规则、选择原则、正反例和概念约束变化；对象属性排序和纯 bookkeeping 日期/修订号不会制造语义变化。工具只产生全量候选池，不自动决定迁移。
- 发布指南同步字段契约及历史源稿例外。SOP 和 Checklist 已引用当前 taxonomy 判断语义与数量，本次不再复制第二套定义；前台设计、模板、筛选控件、共享运行时、分享图功能均不调整。

## 验证与复现

本地已执行 8 项新增语义契约测试、48 项元数据字段校验、保护字段对照和推荐函数回放。完整仓库测试与部署状态以本次提交对应 GitHub Actions 结果为准，不能用本地单元测试代替完整 CI。

在完整仓库中可复现：

```bash
node tools/blog/check-blog-taxonomy.js
node tools/blog/audit-taxonomy-impact.js --base-ref 487061b22094389e03a80cfd2cc5ac4fe0770489 --full-screen --json
node --test scripts/taxonomy-semantic-contract.test.js
cd scripts && npm run check
```

复核重点：48 篇均进入语义变更候选池；各字段的决定对应上表；发布 HTML 与变更前完全一致；仅一个已有严格 frontmatter 的字段发生同步修改；精选不变。

这些是一次编辑治理的判断，不是永久正确的分类。以后发现正文与标签不符，应回到同一份词典与当前正文处理，不通过改变旧文内容维护标签的一致性。
