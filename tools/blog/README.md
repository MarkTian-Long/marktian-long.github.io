# tools/blog — 思考碎片博客

个人对 AI 产品、技术演进、行业判断的持续记录。

## 目录结构

```
tools/blog/
├── README.md               本文件
├── WRITING_GUIDE.md        博客规范（元数据/结构/命名/更新流程）
├── index.html              归档列表页（按年份分组，JS 渲染）
└── posts/
    ├── harness-engineering.html          工程演进三段论（2026.04）
    ├── agent-three-problems.html         Agent 三大工程问题（2026.04）
    ├── market-landscape-2026.html        AI Agent 市场格局（2026.04）
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
