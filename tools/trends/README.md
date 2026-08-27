# 热点快照

AI 与科技领域五大平台热点快照，含 Codex PM 视角点评。

## 功能描述

聚合五大平台热榜数据，每条热点附带 PM 视角解读，体现对行业动态的持续跟踪与信息获取体系。

## 数据板块

| 板块 | 来源 | 更新方式 |
|------|------|---------|
| ⚡ GitHub AI 热榜 | GitHub Trending | 爬虫自动抓取 |
| 🚀 Product Hunt 本月 | Product Hunt | Codex 联网研究补充（有反爬限制） |
| 🔥 HN 热议 | Hacker News | 爬虫自动抓取 |
| 🌍 出海 AI 动态 | 出海 AI 聚合 | 爬虫自动抓取 |
| 🇨🇳 国内 AI 热点 | 36Kr 等 | 爬虫自动抓取 |

## 数据更新

**推荐双步更新流程：**

1. 爬虫自动抓取（GitHub / HN / 36Kr / 出海 AI）：

   ```bash
   cd scripts
   node fetch-trends.js --write
   ```

2. 使用 `/update-trends` 补充 Product Hunt 并写入 PM 点评：

   ```
   /update-trends
   ```

> Product Hunt 有反爬限制，由 `/update-trends` 的联网研究补充。其余四个板块可由显式 `--write` 抓取并写入公开快照。

## 文件结构

```
tools/trends/
├── index.html        # 展示页面
├── data/
│   └── trends.json   # 热点数据（显式写入 + 联网研究补充）
└── README.md
```

## 访问方式

- 独立打开：`tools/trends/index.html`
- 主页入口：信息工具区的「热点快照」直链卡片，在新标签页打开

## 维护指南

- **数据格式**：`trends.json` 由 `scripts/fetch-trends.js` 写入，结构见脚本注释
- **手动补充**：可直接编辑 `trends.json`，按现有条目格式追加
- **更新频率**：建议每周运行一次完整更新流程
