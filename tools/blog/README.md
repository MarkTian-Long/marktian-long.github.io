# tools/blog — 思考碎片博客

个人对 AI 产品、技术演进、行业判断的持续记录。

## 目录结构

```
tools/blog/
├── README.md               本文件
├── WRITING_GUIDE.md        博客规范（元数据/结构/命名/更新流程）
├── index.html              归档列表页（按年份分组，JS 渲染）
└── posts/
    ├── ai-benchmark-failure.html         模型跑出了测量边界，评测体系跟不上了（2026.05）
    ├── llm-soft-quality.html             大模型的分越来越高，但有些差距只用几天就能感觉到（2026.05）
    ├── automated-research.html           AI能大量生产方向，但还不会判断什么重要（2026.05）
    ├── ai-coding-hardware.html           让 AI 写代码这件事，为什么到硬件就不行了（2026.05）
    ├── fde-blog-v3.html                  OpenAI 和 Anthropic 同一周下场做咨询，FDE 时代来了？（2026.05）
    ├── llm-second-half.html              大模型的下半场：当预训练不再是唯一战场（2026.05）
    ├── enterprise-ai-data-security.html  企业引入大模型 API，数据真的安全吗（2026.04）
    ├── agent-vs-workflow.html            你叫它智能体，但它可能只是个工作流（2026.04）
    ├── claude-design-blog.html           Claude Design：设计工具的iPhone时刻，还是一场更大的吞并？（2026.04）
    ├── manus-agent-analysis.html         Manus：它卖的不是 Agent，是一次认知震撼（2026.04）
    ├── openclaw-brand-creation.html      OpenClaw 爆红背后：一个品类的诞生与宿命（2026.04）
    ├── enterprise-ai-three-stages.html   企业AI应用不是一条线，而是三个不同的战场（2026.04）
    ├── memory-system.html                AI产品记忆系统：从四阶段演进到怎么做对（2026.04）
    ├── harness-engineering.html          工程演进三段论：从 Prompt 到 Harness（2026.04）
    ├── agent-three-problems.html         Agent 现在面临的三大工程问题（2026.04）
    ├── market-landscape-2026.html        2026 年 AI Agent 市场格局（2026.04）
    ├── tech-obsolescence.html            技术消亡度框架（2026.03）
    ├── rag-evolution.html                RAG 的演进（2026.03）
    ├── skill-system-and-harness.html     Skill 系统的本质（2026.03）
    ├── finetuning-evolution.html         微调的演进（2026.03）
    └── prompt-engineering-lifecycle.html Prompt Engineering 的生命周期（2026.03）
```

## 快速使用

- **浏览文章**：直接打开 `index.html` 或从主页「写作」区块进入
- **新增文章**：遵循 `WRITING_GUIDE.md` 规范，同步更新两处 `posts` 数组

## 嵌入方式

本模块在主页以独立 section 展示（非 iframe），文章在新标签页打开。
