# AI 产品洞察

## 功能描述

展示 AI 行业最新标杆产品的深度分析，从产品经理视角解读产品策略、技术选型和商业模式。体现作者对 AI 产品生态的持续关注与深度思考。

## 数据来源

手动维护 `data/products.json`，每个产品条目包含：

| 字段 | 说明 |
| --- | --- |
| `name` / `company` | 产品名 / 公司 |
| `category` | 分类（通用大模型 / AI 创作 / AI 搜索 等） |
| `description` | 产品描述 |
| `highlights` | 核心亮点（3 条） |
| `pmInsights` | PM 视角洞察（3 条） |
| `techStack` | 技术关键词 |
| `businessModel` | 商业模式 |
| `trend` | 趋势方向（up / stable / down） |
| `stars` | 推荐等级（1-5） |

## 文件结构

```text
tools/ai-insights/
├── README.md          ← 本文件
├── index.html         ← 工具主页面
├── style.css          ← 私有样式
├── script.js          ← 数据加载 + 渲染逻辑
└── data/
    └── products.json  ← AI 产品数据源
```

## 维护指南

### 添加新产品

编辑 `data/products.json`，在数组中追加新对象，格式参考现有条目。

### 修改已有产品

直接在 `data/products.json` 中找到对应 `id` 修改即可。

### 分类筛选

页面自动从数据中提取所有 category 生成筛选按钮，无需手动配置。
