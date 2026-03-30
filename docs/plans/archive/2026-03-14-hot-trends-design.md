# 热点快照模块设计文档

**日期**：2026-03-14
**状态**：已批准，待实现

---

## 背景与目标

在现有"前沿雷达"（信息源导航）的基础上，新增"热点快照"模块，展示当前 AI 及科技领域各平台的热点排行。

- 前沿雷达：告诉你去哪里看信息
- 热点快照：告诉你现在什么最热

目标用户场景：面试前快速了解当前 AI 领域热议话题。

---

## 技术方案

**数据更新方式（方案 B）**：手动触发 Claude 联网搜索 → 生成结构化 JSON → 写入数据文件 → 页面展示。

- 无后端、无定时任务、零运营成本
- 与现有 `/analyze-product` skill 工作流一致
- 每次全量更新约 3-5 分钟，token 耗费可控

---

## 文件结构

```
tools/trends/
  index.html          # 展示页面
  data/
    trends.json       # 热点数据
  README.md
```

---

## 数据结构（trends.json）

```json
{
  "updated_at": "2026-03-14",
  "boards": [
    {
      "id": "github-ai",
      "title": "GitHub AI 热榜",
      "icon": "⚡",
      "items": [
        {
          "rank": 1,
          "title": "项目名称",
          "summary": "一句话描述",
          "insight": "Claude 点评内容",
          "url": "https://...",
          "source": "GitHub Trending",
          "tags": ["标签1", "标签2"]
        }
      ]
    }
  ]
}
```

---

## 五个数据板块

| ID | 标题 | 数据来源 | 条目数 |
|----|------|---------|--------|
| `github-ai` | GitHub AI 热榜 | GitHub Trending | 5-8 条 |
| `product-hunt` | Product Hunt 本月 | PH 月榜 | 5-8 条 |
| `hacker-news` | HN 热议 | Hacker News | 5-8 条 |
| `overseas-ai` | 出海 AI 动态 | Twitter/X + 独立媒体 | 5-8 条 |
| `cn-ai` | 国内 AI 热点 | 微博/知乎/36kr | 5-8 条 |

---

## UI 设计

- **风格**：与前沿雷达一致，深色主题，复用 CSS 变量
- **布局**：
  - 顶部 Header：模块标题 + 最后更新时间
  - 横向 Tab 切换五个板块
  - 每条热点卡片：
    - 左侧：排名序号
    - 主体：标题（超链接）+ 一句摘要 + 标签
    - 底部：Claude 点评（可折叠展开）
    - 右上：来源标签

---

## 与现有模块的关联

- 风格统一：复用前沿雷达的 CSS 变量和视觉语言
- 入口：在前沿雷达页面底部加"查看热点快照 →" 链接
- 数据维护：注册新 skill `/update-trends`，与 `/analyze-product` 模式一致
- 主页 Tab：注册到 `index.html` 的 `switchTool()` Tab 系统

---

## 新增 Skill

`/update-trends` — 触发后 Claude 依次搜索五个板块，生成完整 trends.json 写入数据文件。
