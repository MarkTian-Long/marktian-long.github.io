# AI 产品信息采集器

单文件工具，用于结构化录入 AI 产品信息并生成 `products.json` 兼容的 JSON 数据。

## 功能

- **左右分栏**：左侧四个 Section 表单，右侧实时 JSON 预览
- **四个 Section**：基本信息 / 信息来源 / 关键数据指标 / 产品时间线
- **实时预览**：表单输入即时更新 JSON，带语法高亮
- **一键复制**：复制按钮将完整 JSON 复制到剪贴板
- **草稿自动保存**：localStorage key `qiuzhi_collector_v1`，刷新不丢失

## 输出字段

生成的 JSON 与 `tools/ai-insights/data/products.json` Schema 完全兼容，新增字段：

```json
{
  "keyMetrics": [{ "label": "", "value": "", "source": "", "date": "", "url": "" }],
  "timeline": [{ "date": "", "event": "", "type": "launch|milestone|feature|funding" }],
  "sources": [{ "title": "", "url": "", "date": "", "type": "official|media|report" }]
}
```

## 使用方式

1. 打开工具，填写表单
2. 复制右侧 JSON
3. 粘贴到 `products.json` 对应条目
