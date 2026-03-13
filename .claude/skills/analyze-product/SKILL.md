---
name: analyze-product
description: 联网研究一款 AI 产品，生成符合 products.json schema 的结构化 JSON，并 append 写入数据文件。当用户说「帮我采集/分析/拆解 XXX 产品」时使用。
---

# AI 产品拆解采集 Agent

目标：$ARGUMENTS

---

## 入口判断（第一步必做）

**先读取 `tools/ai-insights/data/products.json`**，然后根据 $ARGUMENTS 决定执行模式：

| $ARGUMENTS | 执行模式 |
|---|---|
| 空 / `--scan` | 健康检查模式：输出数据库现状报告，不采集，不写入 |
| `--fill-gaps` | 补全模式：找出字段残缺的现有产品，逐个补全 |
| `--update <id>` | 强制更新模式：重新采集指定产品并覆盖 |
| 单个产品名 | 精准采集模式：采集该产品，新增或更新 |
| 多个产品名（逗号分隔） | 批量采集模式：依次采集每个产品 |

---

## 健康检查模式（$ARGUMENTS 为空或 `--scan`）

读取 products.json 后输出报告，格式如下：

```
📊 数据库现状：共 N 款产品

✅ 完整条目（keyMetrics + timeline + sources 齐全）：
   - ChatGPT, ...

⚠️  残缺条目（缺少核心字段）：
   - MidJourney：缺 keyMetrics / timeline / sources
   - ...

💡 建议：
   - 优先执行 /analyze-product --fill-gaps 补全 N 条残缺数据
   - 可新增产品：[列出 TODO.md 或用户提及的待采集产品]
```

**输出报告后停止，等待用户指令。**

---

## 补全模式（`--fill-gaps`）

1. 扫描 products.json，找出 `keyMetrics` / `timeline` / `sources` 任一为空的条目
2. 按缺失字段数从多到少排序，优先处理最残缺的
3. 对每个残缺产品：
   - 只搜索缺失字段对应的数据（不重新全量采集）
   - 搜索关键词聚焦：`"产品名" MAU users revenue 2024 2025 funding timeline`
   - 生成补全字段后，展示摘要确认（见"写入确认"章节）
   - 用户确认后写入，然后处理下一个

---

## 精准采集 / 批量采集模式

### 研究阶段

用 WebSearch / WebFetch 搜集信息，**优先一手来源**（官网、官方博客、官方公告）：

搜索关键词模板：
- `"[产品名]" site:官网`
- `"[产品名]" MAU users revenue ARR 2024 2025`
- `"[产品名]" funding valuation`
- `"[产品名]" product launch timeline history`
- `"[产品名]" PM product strategy analysis`

需要收集的维度：
1. **基本信息**：公司、分类、商业模式、上线时间、官网
2. **关键数据**：MAU/DAU、ARR/收入、融资金额（带来源 URL 和日期）
3. **产品时间线**：重要发布节点、里程碑、融资轮次
4. **核心功能**：产品做什么、怎么做、差异化在哪
5. **技术架构**：底层技术、关键技术选择
6. **竞品格局**：主要竞争对手、各自优劣势
7. **PM 洞察**：产品策略亮点、增长逻辑

**批量模式**：先对所有产品做快速搜索（各 2-3 条），再逐个深度搜索，减少等待。

### 生成 JSON

按以下 schema 严格生成：

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
  "issue": 自增编号（现有最大值 + 1）,
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

### 质量自检（写入前必做）

生成 JSON 后，对照以下清单自检，**不合格项必须说明原因**：

- [ ] `keyMetrics` ≥ 3 条，且每条有实际数值（非"待定"、非估算）
- [ ] `keyMetrics` 每条都有 `url`（即使是空字符串也要说明为何无链接）
- [ ] `timeline` ≥ 3 个节点
- [ ] `oneLiner` 包含具体观点或数据，不是"XXX 是一款 AI 产品"类描述句
- [ ] `myTake` 为第一人称，有明确立场，100-150 字
- [ ] `sources` ≥ 2 条

有字段因无可靠数据而跳过时，明确标注"因未找到可靠来源，跳过 XXX 字段"。

### 写入确认

**写入前展示摘要，等用户确认**：

```
📋 准备写入：[产品名]

  新增字段：keyMetrics（N条）、timeline（N个节点）、sources（N条）
  ⚠️  跳过字段：[字段名]（原因：未找到可靠数据）

  是否写入 products.json？[y/n]
```

用户确认后：
1. 校验 JSON 格式合法
2. 新产品 append 到数组末尾；已有产品询问是否覆盖
3. 写入文件

### 完成告知

```
✅ 已写入：[产品名]
   关键数据：[3-5条最重要的数据点]
   刷新浏览器即可在 AI 产品拆解看到更新
```
