# AI 产品拆解

## 功能描述

AI PM 视角的产品深度拆解，每条记录包含期号、一句话核心洞察、四维拆解（产品概述 / 技术架构 / 竞品分析 / 启示总结）。体现作者对 AI 产品生态的持续关注与独立判断。

## 数据来源

手动维护 `data/products.json`，每个产品条目包含以下字段：

### 基础字段（原有）

| 字段 | 说明 |
| --- | --- |
| `id` | 唯一标识符（英文小写） |
| `name` / `company` | 产品名 / 公司 |
| `category` | 分类（通用大模型 / AI 创作 / AI 搜索 等） |
| `logo` | emoji 图标 |
| `tagline` | 一句话产品定位 |
| `description` | 产品描述（fallback 用） |
| `highlights` | 核心亮点数组（fallback 用） |
| `pmInsights` | PM 视角洞察数组（fallback 用） |
| `techStack` | 技术关键词数组 |
| `businessModel` | 商业模式 |
| `launchDate` | 上线时间（YYYY-MM） |
| `trend` | 趋势方向（`up` / `stable` / `down`） |
| `stars` | 推荐等级（1-5） |
| `detailLink` | 官网链接 |

### 新增字段（四Tab拆解）

| 字段 | 说明 |
| --- | --- |
| `issue` | 期号（整数，显示为 #001 格式） |
| `oneLiner` | 一句话核心洞察（卡片正文展示） |
| `tabs.overview` | 产品概述：`intro`（段落）+ `features`（数组） |
| `tabs.tech` | 技术架构：`summary`（段落）+ `points`（数组） |
| `tabs.competition` | 竞品分析：`summary`（段落）+ `table`（数组，含 type/name/strength/scene/limit） |
| `tabs.insights` | 启示总结：`points`（数组）+ `myTake`（个人判断段落） |

> `tabs` 字段不存在时，弹窗自动 fallback 到 `highlights` / `pmInsights` 的原有展示，向后兼容。

### 扩展字段（按需渲染，字段存在才显示 Tab）

| 字段 | 说明 |
| --- | --- |
| `keyMetrics` | 关键数据指标数组：`label` / `value` / `source` / `date` / `url` |
| `timeline` | 产品时间线数组：`date` / `event` / `type`（launch/milestone/feature/funding） |
| `sources` | 信息来源数组：`title` / `url` / `date` / `type`（official/media/report） |

> 这三个字段不存在或为空时，对应 Tab 不渲染，老数据展示完全不受影响。

## 文件结构

```text
tools/ai-insights/
├── README.md          ← 本文件
├── index.html         ← 工具主页面
├── style.css          ← 私有样式
├── script.js          ← 数据加载 + 渲染逻辑
└── data/
    └── products.json  ← AI 产品数据源（当前 9 条）
```

## 维护指南

### 添加新产品（推荐方式）

在对话中输入 `/analyze-product 产品名`，Claude 会联网搜索、生成完整 JSON、确认后自动写入。

### 手动添加新产品

在 `data/products.json` 末尾追加新对象，`issue` 期号顺序递增，`tabs` 四个维度都填写。

### 修改已有产品

直接在 `data/products.json` 中找到对应 `id` 修改即可。

### 分类筛选

页面自动从数据中提取所有 `category` 生成筛选按钮，无需手动配置。
