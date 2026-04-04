# ASCI 科研文献综述工具 Demo

## 功能描述

模拟 ASCI（Artificial Science Intelligence）科研 Agent OS 的文献综述全流程，展示：
- **非线性管线**：可自定义节点组合，动态插入引文追踪/焦点扩展等节点
- **流程配置器**：Screen 1 提供节点网格 + 管线预览 + 三种预设模板
- **Human-in-the-Loop**：摘要筛选（边界文献逐篇判断）、矛盾检测（必须处置才能继续）
- **降级策略**：连续 3 次 ERROR → 三条路径（重试/换模型/人工接管）
- **可信度评估**：Screen 3 三维度评分 + 人工决策摘要
- **浅色配色**：符合科研用户使用习惯的浅色主题

## 文件结构

```
tools/asci/
├── index.html    — HTML 骨架（三屏布局，约 192 行）
├── asci.css      — 全部样式（浅色配色，约 2811 行）
├── data.js       — 数据层：NODE_REGISTRY（15 节点）、PIPELINE_TEMPLATES（3 模板）、MOCK 数据
├── main.js       — 全局状态 + Screen 1 流程配置器逻辑
├── engine.js     — 执行引擎：runNode/finishNode/handleBack/降级策略/非线性扩展
├── ui.js         — UI 渲染层：renderTree/renderNodeResult/renderScreen3 等
└── README.md
```

> 纯前端，零依赖，浏览器直接打开即可运行。

## 节点注册表（NODE_REGISTRY）

| 类别 | 节点 ID | 名称 | 有完整交互 |
|------|---------|------|-----------|
| 配置 | `data-source-config` | 数据源配置 | 是（checkbox 网格） |
| 发现 | `keyword-extract` | 关键词提取 | 是（可增删关键词） |
| 发现 | `db-search` | 数据库检索 | 是（年份筛选 + 预览） |
| 发现 | `citation-chase` | 引文追踪 | 简单文字（可非线性插入） |
| 发现 | `expand-search` | 焦点扩展搜索 | 简单文字（可非线性插入） |
| 筛选 | `abstract-screen` | 摘要筛选 | 是（HITL 边界文献 + 阈值说明） |
| 筛选 | `fulltext-read` | 全文精读 | 是（HITL + 全文边界说明） |
| 筛选 | `quality-assess` | 方法学质量评估 | 简单文字 |
| 分析 | `contradiction-detect` | 矛盾检测 | 是（HITL） |
| 分析 | `theme-cluster` | 主题聚类 | 简单文字 |
| 分析 | `meta-analysis` | 效应量汇总 | 简单文字 |
| 输出 | `outline-gen` | 综述大纲 | 是（可编辑标题） |
| 输出 | `review-write` | 综述撰写 | 是（降级策略 + 人工草稿） |
| 输出 | `bibtex-export` | 参考文献导出 | 简单文字 |

## 预设模板

| 模板 | 节点序列 |
|------|---------|
| 快速综述（默认） | keyword-extract → db-search → abstract-screen → outline-gen → review-write |
| 深度分析 | data-source-config → keyword-extract → db-search → abstract-screen → fulltext-read → quality-assess → contradiction-detect → outline-gen → review-write |
| 文献地图 | keyword-extract → db-search → citation-chase → abstract-screen → theme-cluster → bibtex-export → outline-gen |

## 面试题覆盖

| 面试题 | 覆盖方式 |
|--------|---------|
| Q1：最容易出错的环节 | 节点风险分级（低/中/高），高风险节点强制 HITL |
| Q2：连续 3 次出错如何处理 | review-write 节点：三次 ERROR → 降级面板 → 三条路径（重试/换模型/人工接管） |
| Q3：用户为什么相信结果 | Screen 3 可信度三维度评分（来源质量/推理链路/数据一致性）|
| Q4：哪步必须由人来做 | abstract-screen（边界文献）、fulltext-read/contradiction-detect（矛盾处置必须完成才能继续） |

## 非线性扩展

执行完 `db-search` 后，主内容区显示"+ 引文追踪"按钮；执行完 `abstract-screen` 后，显示"+ 焦点扩展搜索"按钮。点击后将新节点动态插入当前管线位置之后。

## 维护指南

- 修改 Mock 数据：编辑 `data.js` 中 `NODE_REGISTRY` 和 `MOCK_RESULT`
- 新增节点：在 `NODE_REGISTRY` 中添加定义，在 `PIPELINE_TEMPLATES` 中引用
- 样式修改：编辑 `asci.css`（所有颜色使用 CSS 变量）
