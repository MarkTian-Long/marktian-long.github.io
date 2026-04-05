# 规划：首页观点扩充 + 写作/思考碎片区块

## Context

用户有一份系统化的 AI PM 知识库（`docs/AI_PM_Knowledge_Base_2026.md`，1310 行，10 个章节），涵盖技术消亡度、Prompt Engineering、Skill System、Fine-tuning、RAG、Agent、Harness Engineering、工程演进、市场格局等深度观点。目前首页「我的判断」区块只有 3 条观点，第 3 条（模型对齐）仅 ~60 字偏薄弱。用户希望：

1. 补强/扩充首页「我的观点」至 5 条，加入知识库核心框架
2. 在首页新增独立的「写作/思考碎片」区块（独立 section + nav 入口），博客文章来自知识库各章节精加工版，不限于首页观点对应的 2 篇
3. 配套建立博客规范文件，保证后续更新统一规范

---

## 任务一：首页「我的观点」扩充

**关键文件**：`index.html` 第 103–131 行（`prediction-list` 内）

### 改动内容

**第 3 条（模型对齐）补强**：从 ~60 字扩展到 ~120 字，加入产品设计视角——意图澄清优先于快速输出对 AI PM 定义产品的实际影响。

**新增第 4 条：技术消亡度框架**（来自知识库 Section I）
- 核心观点：AI 技术分两类——补救基模缺陷的（消亡度高）和编码领域知识的（消亡度低）
- 举例：CoT/Role Prompt 会消亡；金融合规规则代码化不会消亡
- 产品意义：判断技术投资价值比追踪技术本身更重要
- 标签：产品框架 · 写于 2026.03
- **支撑材料链接**：`openTool('agent-hub')`

**新增第 5 条：工程演进三段论**（来自知识库 Section VIII）
- 核心观点：Prompt Engineering → Context Engineering → Harness Engineering，关注层次上移
- 三层区别：单次调用优化 → 信息组织系统化 → 生产环境可靠运行
- 2026 年竞争重心：从"谁的 Prompt 写得好"转向"谁的 Harness 设计得更稳"
- 标签：工程演进 · 写于 2026.04
- 无支撑链接

### 格式要求

所有观点采用总分或总分总结构：
- 第 1 句：核心判断（总）
- 中间段落：支撑逻辑（分）
- 末句（如有）：实际影响/结论（总）

---

## 任务二：新增「写作」独立区块

### 首页结构变更

**nav 新增入口**：在现有（关于 · 作品 · 工具箱 · 联系）加入「写作」，对应 `#writing` 锚点

**新 section 位置**（在「我的判断」和「工具箱」之间）：
```
我的判断（现有）
写作/思考碎片  ← 新增独立 section
工具箱（现有）
项目案例（现有）
联系（现有）
```

**Writing section 内容**：
- section label：Writing
- section title：思考碎片
- section desc：对 AI 产品、技术演进、行业判断的持续记录
- 直接渲染文章归档列表（不用 iframe），按年份分组，每行：日期 + 标题 + 标签
- 点击标题在新标签页打开 `tools/blog/posts/xxx.html`
- 样式参考现有 `ai-judgment` 区块的卡片风格

---

## 任务三：博客工具文件结构

### 目录结构

```
tools/blog/
├── README.md                        工具说明
├── WRITING_GUIDE.md                 博客规范文件（供作者参考）
├── index.html                       归档列表页（可独立访问，也可被链接）
└── posts/
    ├── tech-obsolescence.html       技术消亡度框架（初期建立）
    ├── harness-engineering.html     工程演进三段论（初期建立）
    ├── prompt-engineering.html      Prompt Engineering 的现状与边界（后续）
    ├── rag-evolution.html           RAG 演进：从向量检索到多模态知识图谱（后续）
    └── agent-maturity.html          Agent 成熟度梯队：2025→2026→2027（后续）
```

> 初期实现：先建 2 篇（tech-obsolescence + harness-engineering），其余后续迭代

### 文章页设计（`posts/xxx.html`）

每篇文章是自包含的独立 HTML：
- 顶部：标题 + 日期 + 标签 + 摘要（1-2句）
- 正文：结构化排版（标题/段落/列表/代码块，用 HTML，无需外部 markdown 解析库）
- 底部：「← 返回列表」链接，指向 `../index.html`
- CSS 变量完全自包含（不依赖 style.css）
- 正文格式遵循 WRITING_GUIDE.md

---

## 任务四：博客规范文件（WRITING_GUIDE.md）

新建 `tools/blog/WRITING_GUIDE.md`，内容包括：

### 文章元数据规范
```
date: YYYY.MM（年月）
title: 简洁动词短语或判断句，不超过 20 字
tags: 从固定标签库选择（产品框架/工程演进/市场格局/行业洞察/技术判断）
slug: kebab-case，用于文件命名（对应 posts/xxx.html）
summary: 1-2 句，概括核心观点，用于列表页展示
```

### 文章结构规范
```
一、核心判断（总）：1 段，200 字以内，读者只读这段也能理解核心观点
二、展开论证（分）：2-4 段，每段聚焦一个支撑维度
三、结论与影响（总）：1 段，说明对 AI PM 实践的实际意义（可选）
```

### 文件命名规范
- 文件名：`{topic-keyword}.html`，英文 kebab-case
- 不用日期前缀（归档靠 index.html 的 JS 数据管理）

### 更新 index.html 规范
每新增一篇文章，在 `tools/blog/index.html` 的 `posts` 数组里加一行，同时在 `index.html`（首页）的 `blogPosts` 数组里加同一行：
```javascript
{ date: '2026.04', title: '文章标题', tags: ['标签'], url: 'posts/xxx.html', summary: '摘要' }
```

---

## 关键文件清单

| 文件 | 操作 | 关键改动 |
|------|------|--------|
| `index.html` | 修改 | ① 观点第3条补强 ② 新增第4、5条观点 ③ nav 加「写作」 ④ 新增 Writing section + JS 数据 |
| `tools/blog/README.md` | 新建 | 工具说明 |
| `tools/blog/WRITING_GUIDE.md` | 新建 | 博客规范（元数据/结构/命名/更新流程）|
| `tools/blog/index.html` | 新建 | 归档列表页（按年份分组，JS 渲染）|
| `tools/blog/posts/tech-obsolescence.html` | 新建 | 技术消亡度框架正文 |
| `tools/blog/posts/harness-engineering.html` | 新建 | 工程演进三段论正文 |

> `tools/blog/` 所有文件需要 `git add`，否则 GitHub Pages 404

---

## 实施顺序

1. 新建 `tools/blog/WRITING_GUIDE.md` 和 `README.md`（先建好规范）
2. 新建 2 篇文章 HTML（`posts/tech-obsolescence.html`、`posts/harness-engineering.html`）
3. 新建 `tools/blog/index.html`（归档列表页）
4. 修改 `index.html`：补强第3条观点 + 新增第4、5条 + 新增 Writing section + nav

> 注意：`index.html` 修改量较大（约 +80 行），用 Edit tool 逐段精确替换，每次 Edit 前先重新读取目标区域

---

## 验证方式

- 本地打开 `index.html`：
  - 「我的观点」显示 5 条，第 4 条有 agent-hub 跳转按钮
  - 导航栏出现「写作」入口，点击跳转到 Writing section
  - Writing section 显示文章列表，点击标题新标签页打开文章
- 直接打开 `tools/blog/posts/tech-obsolescence.html`：独立运行，底部「返回列表」可用
- 直接打开 `tools/blog/index.html`：归档列表正常展示
