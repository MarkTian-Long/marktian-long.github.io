# 前沿雷达

按研究意图整理 AI 信息源的静态操作台：先选择问题，再按语言、类型、主题和优先级筛选，最后把线索交接给热点快照。

## 功能描述

- 四个研究意图：研究前沿、产品信号、行业与商业、实践与构建。
- 11 个中英文来源：每个来源都记录类型、角色、主题、更新节奏、优先级、访问方式、适合任务、盲区、保留理由、逐条复核日期和人工状态；当前数据尚未逐条打开复核。
- 所有筛选和排序都在浏览器本地完成；意图预设只改变推荐顺序，不把来源标记为“实时可信”。
- 四步信息工作流：搜索 → 验证 → 综合 → 沉淀，并提供进入 `tools/trends/index.html` 的交接入口。
- 页面顶部提供四页统一语义导航：`1 信源` → `2 信号` → `3 分析` → `4 方法`。

## 文件结构

- `index.html`：可直接打开的页面骨架和可访问控件。
- `style.css`：工具自包含的浅色响应式样式与 CSS 变量。
- `app.js`：本地渲染、意图排序、组合筛选、空态和缺数据降级。
- `data.js`：经典脚本格式的数据契约；同时暴露 `window.RADAR_DATA` 和 CommonJS 导出，避免 `file://` 下依赖 `fetch`。

## 数据契约

### `meta`

- `schemaVersion`：当前为 `1`。
- `updatedAt`：数据整体最后编辑日期，格式为 `YYYY-MM-DD`。
- `reviewCadence`：当前为 `quarterly`，表示建议每季度复核。
- `noRealtimeProbe`：必须为 `true`，明确页面不探测外链。
- `statusSemantics`：说明人工状态的含义。
- `coverageDimensions`、`topicOptions`：驱动覆盖摘要和主题筛选。

### `sources`

每条来源要求有唯一 `id`、安全的 `https` `url`，以及以下字段：`language`、`type`、`role`、`topics`、`updateCadence`、`priority`、`access`、`bestFor`、`blindSpot`、`retentionReason`、`lastReviewedAt`、`manualStatus`。

`manualStatus` 只允许 `reviewed`、`needs-review`、`not-reviewed`。它表示是否完成逐条人工检查，不代表当前页面可达、内容仍在更新或观点已经被事实证明。`lastReviewedAt` 必须是实际逐条复核日期；尚未逐条复核时必须为 `null`，不能用页面编辑或访问时间冒充。

当前这份数据的 11 条来源均为 `not-reviewed`，`lastReviewedAt` 均为 `null`。没有逐条复核证据时，页面使用“尚未逐条复核 / 逐条复核日期：待补”的诚实语义。

### `workflowTools`

工具必须有唯一 `id`、安全的 `https` `url`、`stage`、`name` 和 `description`。`stage` 固定为 `search`、`verify`、`synthesize`、`distill`。只保留与信息处理链路有明确关系的工具；创作素材工具不放在本页。

## 维护指南

建议每季度按下面顺序做一次人工复核：

1. 逐条打开来源，确认入口仍指向预期的站点和内容类型；不把打不开一次等同于来源失效。
2. 重新检查每条来源的角色、主题、适合任务和盲区，尤其区分一手事实、编辑分析和社区讨论。
3. 逐条确认后再更新 `lastReviewedAt`、`manualStatus`、`retentionReason`；未打开确认的来源保持 `not-reviewed` 与 `null`，并同步检查四个意图仍各自引用至少两条来源。
4. 运行 `node --test radar-depth.test.js` 和 `node --test radar-depth.browser.test.js`；再运行 `node --check ../tools/radar/data.js`、`node --check ../tools/radar/app.js`。

## 访问方式与限制

- 独立打开：`tools/radar/index.html`。
- 页面只加载同目录的 `data.js`、`app.js` 和 `style.css`，所以 `file://` 下核心筛选仍可运行，不需要网络或后端。
- 如果 `data.js` 缺失，页面会显示可读的本地数据错误提示并隐藏动态清单，不会通过网络补齐，也不应产生未处理的 JavaScript 异常。
- 来源卡片和工作流工具会在新标签页打开并带 `noopener noreferrer`；页面不会实时请求、探测、测速或缓存外链状态。
