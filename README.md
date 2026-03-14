# 刘洋 · AI 产品经理 个人品牌网站

> 用产品思维构建的个人求职网站，展示 AI PM 的专业能力与产品品味。

## 🚀 快速开始

线上地址：**https://marktian-long.github.io**

或者直接用浏览器打开 `index.html`，无需任何构建工具或服务器。

```bash
# 或者用 VS Code Live Server / Python HTTP Server 启动
python -m http.server 8080
# 然后访问 http://localhost:8080
```

> ⚠️ 推荐使用本地服务器启动（如上），否则 iframe 嵌入的 Dashboard 在某些浏览器中可能因安全策略被阻止。

## 📁 项目结构

```
qiuzhi/
├── index.html                 # 🏠 主页面入口
├── README.md                  # 📖 项目说明（本文件）
├── CONVENTIONS.md             # 📐 开发规范
├── .gitignore                 # 🚫 Git 忽略规则
│
├── assets/                    # 🎨 静态资源
│   ├── css/
│   │   └── style.css          #   全局样式 + Design Tokens
│   ├── js/
│   │   ├── main.js            #   导航、动画、雷达图、案例渲染
│   │   ├── interview.js       #   面试题练习器
│   │   └── tracker.js         #   (已弃用，功能由 dashboard 替代)
│   └── images/                #   图片资源（暂为空）
│
├── tools/                     # 🛠️ 嵌入式工具（每个工具独立目录）
│   ├── dashboard/
│   │   └── index.html         #   求职追踪 Dashboard（完整独立页面）
│   ├── ai-insights/
│   │   ├── index.html         #   AI 产品拆解展示
│   │   ├── script.js          #   数据加载 + 渲染逻辑
│   │   ├── style.css          #   私有样式
│   │   └── data/products.json #   AI 产品数据源
│   ├── product-collector/
│   │   └── index.html         #   AI 产品信息采集器（表单 → JSON）
│   ├── esop-extractor/
│   │   └── index.html         #   ESOP 字段提取 Demo
│   ├── radar/
│   │   └── index.html         #   前沿雷达（信息源导航 + 精选工具）
│   └── trends/
│       ├── index.html         #   热点快照展示页
│       └── data/trends.json   #   热点数据（爬虫 + Claude 搜索）
│
├── scripts/                   # 🤖 本地脚本
│   └── fetch-trends.js        #   热点爬虫（GitHub/HN/36Kr 自动抓取）
│
├── content/                   # 📝 Markdown 内容资料
│   ├── case_analysis.md       #   AI 产品案例分析（ChatGPT + Midjourney）
│   ├── interview_prep.md      #   面试准备资料库（STAR 故事 + 模板）
│   └── output/                #   每日总结 / 输出文档
│
└── docs/                      # 📄 个人文档（.gitignore 中已排除）
    ├── 刘洋.docx
    └── 刘洋简历.pdf
```

## 🧩 功能模块

| 模块 | 位置 | 说明 |
|------|------|------|
| Hero 个人定位 | `index.html` | 一句话定位 + 求职状态 + CTA |
| 关于我 | `index.html` | bio 文字介绍 + 技能标签 + 联系入口 |
| 产品案例 | `index.html` + `assets/js/main.js` | 3 个脱敏案例卡片，支持展开详情 |
| 面试练习器 | `assets/js/interview.js` | 20 题，4类别，计时 + 自评 + 进度环 |
| 求职 Dashboard | `tools/dashboard/index.html` | 投递表格 + 漏斗图 + 待办 + 笔记 |
| AI 产品拆解 | `tools/ai-insights/index.html` | 9 款产品，四维拆解 + 关键数据 + 时间线 + 信息来源 |
| 产品信息采集器 | `tools/product-collector/index.html` | 结构化表单 → 实时 JSON 预览 → 一键复制 |
| ESOP 字段提取 Demo | `tools/esop-extractor/index.html` | ESOP 文件字段提取演示 |
| 前沿雷达 | `tools/radar/index.html` | 信息源导航（中/英分栏）+ 精选 AI 工具列表 |
| 热点快照 | `tools/trends/index.html` | 五大平台热榜 + Claude PM 视角点评，爬虫自动更新 |
| 联系方式 | `index.html` | 邮件 / 微信 / LinkedIn |

## ✏️ 自定义指南

### 修改个人信息

- **联系方式**：`index.html` 搜索 `your@email.com`、`your_wechat`
- **数字统计**：`index.html` 搜索 `stat-num`

### 修改产品案例

编辑 `assets/js/main.js` 中的 `casesData` 数组。

### 添加新工具

详见 [CONVENTIONS.md](CONVENTIONS.md) 中的「新工具接入规范」。

## 🔧 技术栈

- **HTML5** + **CSS3** + **Vanilla JS**（零依赖，纯前端）
- **Google Fonts - Inter**（字体）
- **localStorage**（数据持久化）

## 📜 License

本项目为个人求职用途，未开源。
