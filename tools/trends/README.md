# 热点快照

AI & 科技领域五大平台实时热榜，含 Claude 视角点评。

## 数据板块
- ⚡ GitHub AI 热榜
- 🚀 Product Hunt 本月
- 🔥 HN 热议
- 🌍 出海 AI 动态
- 🇨🇳 国内 AI 热点

## 数据更新

**推荐双步更新流程：**

1. 爬虫自动抓取（GitHub / HN / 36Kr / 出海 AI）：
   ```bash
   cd scripts
   node fetch-trends.js
   ```

2. Claude 补充 Product Hunt + 写 PM 点评：
   ```
   /update-trends
   ```

> Product Hunt 有反爬限制，由 Claude 联网搜索填充。其余四个板块爬虫可直接获取真实数据。

## 文件结构
- `index.html` — 展示页面
- `data/trends.json` — 热点数据（爬虫写入 + Claude 补充）
