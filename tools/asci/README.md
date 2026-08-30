# ASCI 科研文献综述工具 Demo

## 功能描述

ASCI（Artificial Science Intelligence）科研任务执行系统的固定数据包演示，展示：
- **非线性管线**：可自定义节点组合，动态插入引文追踪/焦点扩展等节点
- **流程配置器**：Screen 1 提供节点网格 + 管线预览 + 三种预设模板
- **Human-in-the-Loop**：摘要筛选（边界文献逐篇判断）、矛盾检测（必须处置才能继续）
- **降级策略**：连续 3 次 ERROR → 三条路径（重试/换模型/人工接管）
- **过程指标**：Screen 3 展示节点覆盖、人工闭环和过程一致性，不把它们解释为科研正确率
- **可复现清单**：导出研究协议、实际执行节点、HITL、回退/重跑/降级和人工编辑摘要
- **浅色配色**：符合科研用户使用习惯的浅色主题

## 演示边界与研究协议

ASCI 当前是纯前端、Mock-only 的固定数据包演示。默认数据包为
`asci-transformer-drug-discovery-v1`，包含内置节点日志、论文摘要/元数据示例、结构化结果和预设失败路径。
主题输入只写入任务标题；即使输入自定义主题，协议、节点结果和数据包也不会变化，不会发起真实论文检索、全文下载或生产凭证调用。

Screen 1 的“研究协议预检”会展示研究问题、年份范围、来源类型、纳入/排除规则和交付物数量。
启动任务时会把协议与数据包快照锁定到任务状态，重新配置会清除快照并恢复默认主题。

## 文件结构

```
tools/asci/
├── index.html    — HTML 骨架（三屏布局，约 192 行）
├── asci.css      — 全部样式（浅色配色，约 2811 行）
├── data.js       — 数据层：演示边界、研究协议、14 节点、模拟流程指标、PIPELINE_TEMPLATES（3 模板）和 MOCK 数据
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

## 人工审计与回退语义

每次关键状态转换都会写入 `auditTrail`。事件包含 `version`、`timestamp`、`node`、`action`、`reason`、`impactScope` 和 `mode`。
摘要筛选、矛盾处置、动态插入、回退、重跑、降级和人工草稿提交都通过可调用转换函数完成；回退会保留“发生过回退”的审计事实，同时清除回退点之后的失效节点结果。
重跑会按依赖图清除当前节点及下游结果；降级路径会保留重试、切换备用模型或人工接管的选择。

## 关键设计问题

| 设计问题 | 覆盖方式 |
|--------|---------|
| Q1：最容易出错的环节 | 节点风险分级（低/中/高），高风险节点强制 HITL |
| Q2：连续 3 次出错如何处理 | review-write 节点：三次 ERROR → 降级面板 → 三条路径（重试/换模型/人工接管） |
| Q3：用户为什么审查结果 | Screen 3 模拟流程指标 + 人工决策摘要 + 可复现过程清单；不声称论文真实性或综述正确率 |
| Q4：哪步必须由人来做 | abstract-screen（边界文献）、fulltext-read/contradiction-detect（矛盾处置必须完成才能继续） |

## 过程清单与安全导出

Screen 3 的“本次过程清单”包含研究协议、当前管线和执行状态、动态插入、HITL 决策、排除项、矛盾处置、回退/重跑、降级和人工编辑字符数。
`buildProcessManifest()` 只输出演示过程和结构化摘要，不输出原始论文全文/摘要、生产凭证或真实外部 API 响应。
导出使用可注入下载适配器；浏览器下载失败时会恢复按钮状态并提示“导出失败，请重试；过程状态已保留”。

“模拟流程指标”只用于表达固定数据包中的过程状态变化，不能作为论文真实性、综述正确率、检索召回率或模型科学结论的证据。

## 非线性扩展

执行完 `db-search` 后，主内容区显示"+ 引文追踪"按钮；执行完 `abstract-screen` 后，显示"+ 焦点扩展搜索"按钮。点击后将新节点动态插入当前管线位置之后。

## 维护指南

- 修改 Mock 数据：编辑 `data.js` 中 `NODE_REGISTRY` 和 `MOCK_RESULT`
- 新增节点：在 `NODE_REGISTRY` 中添加定义，在 `PIPELINE_TEMPLATES` 中引用
- 样式修改：编辑 `asci.css`（所有颜色使用 CSS 变量）
