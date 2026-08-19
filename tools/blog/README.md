# tools/blog — 思考碎片博客

个人对 AI 产品、技术演进、行业判断的持续记录。

## 目录结构

```
tools/blog/
├── README.md               本文件
├── WRITING_GUIDE.md        博客规范（元数据/结构/命名/更新流程）
├── article-links.css       文章页共享链接语义与键盘焦点样式
├── article-runtime.js      文章页共享主题、元数据降级、参考资料呈现、继续阅读与时间导航
├── article-template.html   新文章生成的独立模板来源
├── index.html              归档列表页（按年份分组，JS 渲染）
└── posts/
    ├── agent-boundary.html                      业务流程，如何变成 Agent 产品架构？（2026.07）
    ├── ontology-business-semantic-layer.html    从同义词表到业务语义层（2026.07）
    ├── enterprise-agent-fde.html                从 WorkBuddy 到 FDE：企业 Agent 落地方式（2026.07）
    ├── physical-world-llm.html                  物理世界会有自己的 LLM 时刻吗？（2026.07）
    ├── llm-customer-service-tech-guide.html     从零搭建一个LLM智能客服（2026.07）
    ├── spacex-ai-infrastructure-valuation.html  一份招股书里，两种不同节奏的"AI"（2026.06）
    ├── llm-saas-moat-disruption.html            AI coding 之后，哪些 B 端 SaaS 会死，哪些会活（2026.06）
    ├── perplexity-analysis.html                 Perplexity：做对了产品，但站错了位置（2026.06）
    ├── ai-arbitration-layer.html                当AI开始主动找你：仲裁层范式的产品机会（2026.06）
    ├── ai-chips-explainer.html                  搞懂 AI 芯片这件事（2026.06）
    ├── human-ai-boundary-shift.html             从模糊到确定：人机边界是怎么移动的（2026.05）
    ├── training-vs-inference.html               训练和推理，是两件不同的事（2026.05）
    ├── ai-benchmark-failure.html                模型跑出了测量边界，评测体系跟不上了（2026.05）
    ├── llm-soft-quality.html                    大模型的分越来越高，但有些差距只用几天就能感觉到（2026.05）
    ├── automated-research.html                  AI能大量生产方向，但还不会判断什么重要（2026.05）
    ├── ai-coding-hardware.html                  让 AI 写代码这件事，为什么到硬件就不行了（2026.05）
    ├── fde-blog-v3.html                         OpenAI 和 Anthropic 同一周下场做咨询，FDE 时代来了？（2026.05）
    ├── llm-second-half.html                     大模型的下半场：当预训练不再是唯一战场（2026.05）
    ├── enterprise-ai-data-security.html         企业引入大模型 API，数据真的安全吗（2026.04）
    ├── agent-vs-workflow.html                   你叫它智能体，但它可能只是个工作流（2026.04）
    ├── claude-design-blog.html                  Claude Design：设计工具的iPhone时刻，还是一场更大的吞并？（2026.04）
    ├── manus-agent-analysis.html                Manus：它卖的不是 Agent，是一次认知震撼（2026.04）
    ├── openclaw-brand-creation.html             OpenClaw 爆红背后：一个品类的诞生与宿命（2026.04）
    ├── enterprise-ai-three-stages.html          企业AI应用不是一条线，而是三个不同的战场（2026.04）
    ├── memory-system.html                       AI产品记忆系统：从四阶段演进到怎么做对（2026.04）
    ├── harness-engineering.html                 工程演进三段论：从 Prompt 到 Harness（2026.04）
    ├── agent-three-problems.html                Agent 现在面临的三大工程问题（2026.04）
    ├── market-landscape-2026.html               2026 年 AI Agent 市场格局（2026.04）
    ├── tech-obsolescence.html                   技术消亡度框架（2026.03）
    ├── rag-evolution.html                       RAG 的演进（2026.03）
    ├── skill-system-and-harness.html            Skill 系统的本质（2026.03）
    ├── finetuning-evolution.html                微调的演进（2026.03）
    └── prompt-engineering-lifecycle.html        Prompt Engineering 的生命周期（2026.03）
```

## 快速使用

- **浏览文章**：直接打开 `index.html` 或从主页「写作」区块进入
- **新增文章**：遵循 `WRITING_GUIDE.md` 规范，在 `data/posts-meta.json` 的 `posts` 数组头部添加完整元数据（含 `concepts`）；仅当内容评审已确认强关系时，额外维护可选 `relations`
- **文章清单**：以 `data/posts-meta.json` 为单一来源；上方目录只保留近期与代表性文章，避免手工清单漂移
- **精选文章**：维护 `data/featured-posts.json` 的有序 slug 列表即可。第一项是首页精选，Blog 最多展示前三项；最多 3 项，空数组关闭精选。不要把精选字段写入文章 metadata。
- **正文源稿**：新文章必须在 `docs/blog/<slug>.md` 保留 Markdown 编辑源，并与 `tools/blog/posts/<slug>.html` 发布物一起提交；历史文章可能存在 HTML 与旧 Markdown 不一致，禁止批量覆盖
- **历史检索**：完整读取 metadata 形成高相关/潜在相关/弱相关候选池，并随核心论点、机制、边界、案例或大纲的实质变化滚动重搜；正式大纲前完成最终覆盖扫描。判断历史发表事实时按“线上正式页 → 仓库 HTML → Markdown”读正文。命中不等于应引用，详见 `WRITING_GUIDE.md`。
- **发布生成**：先在 `posts-meta.json` 添加元数据，再运行 `node tools/blog/generate-post.js <source.md> <output.html>`，最后运行 `node scripts/generate-search-assets.js --write`
- **继续阅读**：新文只单向声明已确认的 `builds_on` / `revises` / `companion`；旧文的后续延展/修正由 metadata 自动反向更新，正文不回写。
- **参考资料**：仅写语义化标题、分组、列表和可选可信度说明；历史 `.refs` 与新文章的 Markdown 结构均由 `article-runtime.js` 统一为默认收起、可键盘展开的紧凑辅助信息层。目录或 URL 锚点直达会自动展开，不批量改写 HTML 正文。
- **发布检查**：提交前依次运行 `node scripts/generate-search-assets.js --check`、`node scripts/check-search-foundation.js`、`node --test scripts/search-foundation.test.js scripts/blog-relationships.test.js scripts/blog-reference-presentation.test.js`、`node scripts/migrate-blog-continue-reading.js --check`、`node scripts/check-blog-body-integrity.js` 和 `node scripts/check-repository-policy.js`
- **发布交付**：检查通过后只暂存本次文章及对应生成资产，完成 review 和 commit；`git push` 前必须按 HITL 规则取得用户确认
- **推送回退**：直连 GitHub 失败时按 `CONVENTIONS.md` 的「GitHub 推送网络排查」使用临时代理，不修改全局 Git 配置，也不把凭据写入仓库
- **完成标准**：远端 `main` 与本地 HEAD 指向同一提交，线上文章 URL 返回 HTTP 200，且页面包含文章唯一标题。仅生成 HTML 或仅完成 commit 都不算发布完成
- **域名维护**：搜索资产与自动生成的页面 head 域名维护在 `scripts/site-config.js`；正文显式链接按内容语义单独核对。Search Console/Bing 验证属于后续账号操作，不写入文章或本目录配置

## 嵌入方式

本模块在主页以独立 section 展示（非 iframe），文章在新标签页打开。
