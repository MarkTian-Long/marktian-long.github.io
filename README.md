# 刘洋 · AI 产品经理个人品牌网站

> 用产品思维构建的求职网站——不只是简历，而是一个可以运行的 AI PM 作品集。

## 为什么做这个网站

市面上的个人主页大多是静态简历的翻版。这个网站想做的事不一样：**让面试官不用听我说，直接看我做了什么**。

每一个嵌入的工具模块都是一个真实 demo，覆盖了 AI 产品经理最核心的能力维度——AI 产品拆解、行业趋势感知、AI 能力落地设计、信息获取体系。

---

## 线上地址

**https://marktian-long.github.io**

或本地直接打开 `index.html`，无需任何构建工具或服务器。

```bash
# 推荐用本地服务器启动，避免 iframe 安全策略限制
python -m http.server 8080
# 访问 http://localhost:8080
```

---

## 网站结构

整个网站是单页应用，分为三个区块：

1. **Hero + 关于我**：一句话定位、求职状态、技能标签、联系方式
2. **产品案例**：3 个脱敏工作案例卡片，支持展开查看完整 STAR 故事
3. **工具箱**：5 个可交互工具模块，分「PM 作品」（2 列卡片）和「信息工具」（3 列卡片）两组，点击卡片展开 iframe

---

## 工具模块详解

### 信息工具组

#### AI 产品拆解（默认展示）
`tools/ai-insights/`

对市场上主流 AI 产品做结构化拆解，目前覆盖 **10+ 款产品**（ChatGPT、Claude、Midjourney、Perplexity、Notion AI 等）。

每款产品有七个维度的深度分析：
- 核心亮点 + PM 视角洞察
- 技术栈与商业模式
- 用户增长数据
- 产品时间线（关键版本演进）
- 竞品对比
- 信息来源与置信度

数据存储在 `tools/ai-insights/data/products.json`，结构化 JSON，通过 `/analyze-product` skill 联网采集生成。

**体现能力**：AI 产品认知深度、结构化分析框架、持续学习习惯

---

#### 热点快照
`tools/trends/`

聚合五大平台的 AI/科技热榜，每周自动更新：

| 平台 | 内容 |
|------|------|
| GitHub Trending | 本周增长最快的 AI 开源仓库 |
| Hacker News | 技术社区热门讨论 |
| Product Hunt | 新产品发布榜 |
| 出海产品榜 | 中国出海 AI 产品动态 |
| 国内科技 | 36Kr 等国内媒体热点 |

每条热点附带 **Claude PM 视角点评**，从产品角度解读技术趋势的商业意义。

数据来源：`scripts/fetch-trends.js` 自动爬取 + Claude API 点评生成，存入 `tools/trends/data/trends.json`。

**体现能力**：信息获取与筛选体系、AI 工具工程化应用、行业动态持续跟踪

---

#### 前沿雷达
`tools/radar/`

精选 AI 产品经理的信息源导航，中英文分栏展示：
- 中文：36Kr、虎嗅、产品星球、即刻等
- 英文：a16z、Benedict Evans、Lenny's Newsletter 等
- 精选 AI 工具列表（按使用频率和价值分类）

**体现能力**：信息获取体系的系统性思考

---

### PM 作品组

#### A股 AI 助手
`tools/stock/`

一个完整的 AI 功能 Demo，模拟"AI 如何切入证券/财富管理场景"，包含 **6 个 Tab**：

| Tab | 功能 | 技术标注 |
|-----|------|----------|
| 行情播报 | 实时行情摘要生成 | LLM + 结构化 prompt |
| 个股诊断 | 输入股票代码，AI 生成诊断报告 | 真实 LLM 调用（OpenRouter） |
| 深度研报 | RAG 增强研报生成 | RAG + Reranking + 双层知识库 |
| 市场雷达 | 热点板块扫描 | mock 数据 + AI 点评 |
| Agent 操盘 | AI 自主规划买卖策略 | Agent 任务拆解演示 |
| 合规审查 | 投研内容合规检查 | 规则 + LLM 混合判断 |

底部有免责声明和标注（真实 LLM 调用 / mock 数据 / AI 生成），清晰标注每个模块的技术实现方式。

**体现能力**：AI 能力落地设计、RAG/Agent/合规等复杂场景的产品化思考、Demo 原型构建能力

---

#### ESOP 字段提取 Demo
`tools/esop-extractor/`

模拟用 AI 处理 ESOP（员工持股计划）文件字段提取的场景：
- 左侧：文本输入（粘贴 ESOP 合同原文）
- 右侧：AI 结构化提取结果（JSON 格式，含置信度标注）

基于真实工作场景抽象，展示 AI 在文档智能领域的能力边界认知。

**体现能力**：to B AI 产品场景设计、文档智能 + 信息抽取的产品 sense

---

## 整体技术架构

```
qiuzhi/
├── index.html                 # 主页面（单入口，锚点导航）
├── assets/
│   ├── css/style.css          # 全局样式 + CSS Design Tokens
│   ├── js/main.js             # 导航、动画、产品案例渲染
│   └── js/interview.js        # 面试练习器（隐藏，dev only）
├── tools/                     # 工具模块（每个可独立运行）
│   ├── ai-insights/           # AI 产品拆解
│   ├── trends/                # 热点快照
│   ├── radar/                 # 前沿雷达
│   ├── stock/                 # A股 AI 助手
│   ├── esop-extractor/        # ESOP 字段提取
│   ├── dashboard/             # 求职追踪（dev only）
│   └── product-collector/     # 产品信息采集器（dev only）
├── scripts/
│   └── fetch-trends.js        # 热点爬虫（GitHub/HN/36Kr 自动抓取）
├── content/                   # Markdown 内容资料
└── docs/                      # 个人文档（.gitignore 排除）
```

**技术选型原则**：零依赖，纯前端，浏览器直开。用最简单的方式把内容呈现出来，把精力花在产品思考上而不是技术配置上。

- HTML5 + CSS3 + Vanilla JS（无框架，无构建工具）
- localStorage 数据持久化（Key 格式：`qiuzhi_<模块>_<版本>`）
- OpenRouter API（stock 工具的真实 LLM 调用）
- GitHub Actions 自动部署 + Secrets 管理 API Key

---

## 这个网站体现了什么

| 维度 | 体现方式 |
|------|----------|
| AI 产品认知 | 10+ 款产品的结构化七维拆解，有自己的分析框架 |
| 行业信息获取 | 多平台热榜聚合 + 持续更新的信息源体系 |
| AI 能力落地 | A股助手的 6 个场景，覆盖 RAG/Agent/合规等复杂设计 |
| 工程执行力 | 从 0 独立构建可运行 demo，爬虫 + AI 生成 + 前端展示全链路 |
| 产品品味 | 暗色设计系统、CSS Design Tokens、模块化架构 |

---

## 本地开发

直接编辑文件，浏览器刷新即可。无需 npm install，无需构建步骤。

详细开发规范见 [CONVENTIONS.md](CONVENTIONS.md)。

---

## License

个人求职用途，未开源。
