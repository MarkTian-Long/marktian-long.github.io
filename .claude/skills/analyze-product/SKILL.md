---
name: analyze-product
description: 联网研究一款 AI 产品，生成符合 products.json schema 的结构化 JSON，并 append 写入数据文件。当用户说「帮我采集/分析/拆解 XXX 产品」时使用。
---

# AI 产品拆解采集

目标产品：$ARGUMENTS

## 执行步骤

### 第一步：联网研究

用 WebSearch / WebFetch 搜集以下信息，**优先找一手来源**（官网、官方博客、官方公告）：

搜索关键词模板：
- `"[产品名]" site:官网 OR 官方博客`
- `"[产品名]" MAU users revenue ARR 2024 2025`
- `"[产品名]" funding valuation`
- `"[产品名]" product launch timeline history`
- `"[产品名]" PM product manager review analysis`

需要收集的信息维度：
1. **基本信息**：公司、分类、商业模式、上线时间、官网
2. **关键数据**：MAU/DAU、ARR/收入、用户增长、融资金额（带来源和日期）
3. **产品时间线**：重要发布节点、里程碑、融资轮次
4. **核心功能**：产品做什么、怎么做、差异化在哪
5. **技术架构**：底层技术、关键技术选择
6. **竞品格局**：主要竞争对手、各自优劣势
7. **PM 洞察**：产品策略亮点、增长逻辑、值得学习的地方
8. **信息来源**：记录每条数据的出处 URL 和日期

### 第二步：读取现有数据

读取 `tools/ai-insights/data/products.json`，检查：
- 该产品是否已存在（按 `id` 字段判断）
- 现有最大 `issue` 编号是多少（新条目 issue = max + 1）

### 第三步：生成 JSON

按以下 schema 严格生成，**所有字段按需填写，没有数据的字段不要瞎填**：

```json
{
  "id": "产品英文小写-kebab-case",
  "name": "产品名",
  "company": "公司名",
  "category": "通用大模型 | AI 创作 | AI 开发工具 | AI 搜索 | AI 效率工具 | 其他",
  "logo": "最贴切的单个 Emoji",
  "tagline": "10字以内，产品最核心的一句话定位",
  "description": "2-3句话，客观描述产品是什么、核心数据、核心特点",
  "oneLiner": "PM 视角的一句话洞察，要有观点，不要平铺直叙",
  "techStack": ["技术关键词1", "技术关键词2"],
  "businessModel": "商业模式简述",
  "launchDate": "YYYY-MM",
  "trend": "up | stable | down",
  "stars": 1-5整数（综合评价：影响力/创新性/商业化成熟度）,
  "issue": 自增编号,
  "detailLink": "官网URL",
  "keyMetrics": [
    { "label": "指标名", "value": "数值", "source": "来源名称", "date": "YYYY-MM", "url": "来源链接或空字符串" }
  ],
  "timeline": [
    { "date": "YYYY-MM", "event": "事件描述", "type": "launch | milestone | feature | funding" }
  ],
  "sources": [
    { "title": "文章/页面标题", "url": "链接", "date": "YYYY-MM-DD或YYYY-MM", "type": "official | media | report" }
  ],
  "tabs": {
    "overview": {
      "intro": "2-3段，深度介绍产品背景、定位、核心价值",
      "features": ["功能1：详细说明", "功能2：详细说明"]
    },
    "tech": {
      "summary": "技术架构总结，2-3句话",
      "points": ["技术点1：解释", "技术点2：解释"]
    },
    "competition": {
      "summary": "竞品格局概述",
      "table": [
        { "type": "竞品类型", "name": "竞品名", "strength": "核心优势", "scene": "适用场景", "limit": "局限性" }
      ]
    },
    "insights": {
      "points": ["洞察1", "洞察2", "洞察3"],
      "myTake": "第一人称，我的判断，要有立场和观点，100-150字"
    }
  }
}
```

**质量要求**：
- `oneLiner` 和 `myTake` 必须有观点，不能是中性描述
- `keyMetrics` 的数据必须有实际来源，不能编造
- `timeline` 按时间正序排列
- `tabs.overview.intro` 要比 `description` 深入得多

### 第四步：写入文件

1. 确认 JSON 格式合法（无语法错误）
2. 将新条目 append 到 `tools/ai-insights/data/products.json` 数组末尾
3. 如果产品已存在，询问用户是否覆盖更新

### 第五步：告知用户

输出：
- 采集到的关键数据摘要（3-5条最重要的数据点）
- 哪些字段因为没找到可靠数据而留空/省略
- 刷新浏览器即可在 AI 产品拆解看到新条目
