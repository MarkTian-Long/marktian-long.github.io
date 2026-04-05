# tools/blog — 思考碎片博客

个人对 AI 产品、技术演进、行业判断的持续记录。

## 目录结构

```
tools/blog/
├── README.md           本文件
├── WRITING_GUIDE.md    博客规范（元数据/结构/命名/更新流程）
├── index.html          归档列表页（按年份分组，JS 渲染）
└── posts/
    ├── tech-obsolescence.html      技术消亡度框架
    ├── harness-engineering.html    工程演进三段论
    └── ...（后续文章）
```

## 快速使用

- **浏览文章**：直接打开 `index.html` 或从主页「写作」区块进入
- **新增文章**：遵循 `WRITING_GUIDE.md` 规范，同步更新两处 `posts` 数组

## 嵌入方式

本模块在主页以独立 section 展示（非 iframe），文章在新标签页打开。
