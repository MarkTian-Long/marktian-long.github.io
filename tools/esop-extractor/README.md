# ESOP 字段提取工作台

## 功能描述
基于 AI 的港股招股书股权激励字段结构化提取工作台。Demo 模式运行三个版本化合成夹具；自定义 API 模式允许用户在确认准确 origin 后发送自由文本。结果保留模型原始字段、可定位证据、跨字段规则异常和独立复核记录。

本工具是「股权激励 AI 对标数据库」的可交互 Demo，重点呈现从抽取、证据核查到人工复核和 Bad Case 回归的质量闭环。

## 核心设计亮点
- **三个版本化夹具**：`standard`、`missing-ambiguous`、`logical-conflict`，分别覆盖正常、缺失/歧义和跨字段冲突。
- **指标语义分离**：模型自报高置信占比明确标为 `proxy`；“准确率目标 ≥95%”只有在离线标注评估后才可称为测量值。
- **证据三态匹配**：每个 source 都显示 `exact`、`partial` 或 `missing`，不再用不可核查的虚构页码代替来源。
- **独立复核记录**：人工修正只生成 effective value，不覆盖原始 value 或 confidence；复核包含状态、根因、修复对象和回归结果。
- **跨字段规则校验**：展示授予超池、行权价异常、日期倒置和来源无法定位等提示，只提示矛盾，不静默改值。
- **Bad Case 回归导出**：导出原始/有效值、原始 confidence、证据、版本号、根因和 regression 状态，便于后续迭代。

## 字段体系
| 分组 | 字段数 | 说明 |
|------|--------|------|
| 公司基本信息 | 11 | 股票代码、上市日期、发行价、股本等 |
| 股权激励计划 | 10 | 计划名称、ESOP股比、行权价格等 |
| 授予信息 | 10 | 被授予人姓名、岗位、授予股数、归属安排等 |

## 模型配置

工具支持两种模式，在「模型配置」面板切换：

| 模式 | 说明 |
|------|------|
| 系统默认 | Demo 模式，返回模拟提取结果，无需 API Key |
| 自定义 API | 当前页面输入 Key / Endpoint / 模型名，兼容 OpenAI Chat 格式接口；只允许 HTTPS，HTTP 仅限明确 loopback |

### 自定义 API 使用边界
自定义 API Key、Endpoint、模型、输入和结果只保存在当前页面内存，关闭页面后即清除；不会写入 localStorage/sessionStorage。请求前页面显示目标 origin，并要求确认完全一致的 origin，且不会跟随重定向。接口需要返回完整的 `companyBasic`、`esopPlan`、`grantees` 字段形状，每个字段包含 `value`、`confidence`、`source`。自由文本最多 200,000 字，授予对象最多 100 条，响应最多 1,000,000 字符，超限会停在脱敏错误态。公开页面不会加载 `config.local.js`，也不会内置或部署注入真实 Key。API 错误只显示脱敏后的可操作提示。

## 文件结构
```
tools/esop-extractor/
├── README.md           # 本文件
├── index.html          # 页面结构与样式
├── app.js              # 交互、Prompt 与演示数据
└── config.example.js   # 历史配置示例（运行时不会加载）
```

## 浏览器存储边界

当前实现只持久化安全的模式偏好；不会自动持久化结果或敏感配置。启动时只检查旧版 key 是否存在，并提示用户主动选择加载或清除。

| Key | 内容 |
|-----|------|
| `qiuzhi_esop_apimode` | 当前模式（`default` / `custom`） |
| `qiuzhi_esop_last_result` | 旧版结果 key，仅在用户主动点击“加载到本会话”时读取 |
| `qiuzhi_esop_apikey` / `qiuzhi_esop_endpoint` / `qiuzhi_esop_model` | 旧版敏感 key，仅提示存在；不会自动读取、上传或删除 |

## 输入模式
| 模式 | 说明 |
|------|------|
| 文本输入 | Demo 模式选择夹具并使用合成文本；自定义 API 模式才会把自由文本发送到用户确认的接口 |
| 上传 PDF（Demo）| 只展示真实文件名、类型和大小，返回标准夹具；不读取 PDF 内容、不推断页数 |

## Bad Case 标注与导出
提取结果中每个字段均可点击「复核」进行标注：
- **复核状态**：已接受、已修正、未解决；原始字段永远只读。
- **错误类型**（多选）：数值/内容错误、缺失、过度自信、来源错误、歧义、逻辑冲突、其他。
- **正确值**（可选）：只影响 effective value，不覆盖原始值或原始 confidence。
- **根因 / 修复对象 / 回归结果**：用于独立复核和 Bad Case 回归追踪。

标注后字段显示红色 `⚑ Bad Case` 标记，结果头部出现「导出 Bad Cases」按钮，导出格式：

```json
{
  "promptVersion": "esop-prompt-v2",
  "schemaVersion": "esop-schema-v2",
  "cases": [
    {
      "path": "esopPlan.exercisePrice",
      "section": "esopPlan",
      "field": "exercisePrice",
      "originalValue": "港币15.50元/股",
      "effectiveValue": "港币16.00元/股",
      "originalConfidence": "high",
      "errorTypes": ["value_wrong", "overconfident"],
      "rootCause": "overconfident",
      "repairTarget": "schema",
      "regression": "not-run",
      "source": "行使价为每股港币15.50元",
      "promptVersion": "esop-prompt-v2",
      "schemaVersion": "esop-schema-v2",
      "markedAt": "..."
    }
  ]
}
```

## 维护指南
- **真实模型接入**：优先设计服务端代理；不要向静态页面或 Pages artifact 注入 Key。若保留自定义 API，必须继续执行 HTTPS/loopback、origin 确认和脱敏错误边界。
- **修改交互或演示数据**：编辑 `app.js`；页面结构或样式编辑 `index.html`。
- **修改字段 / Schema / Prompt**：同步更新 `FIELD_LABELS`、`DEPTH_USER_PROMPT_TEMPLATE`、版本常量和对应测试。
- **修改同义词映射**：更新 `SYNONYM_MAP` 数组，并确认 Prompt 预览仍显示版本化约束。
- **迭代优化流程**：夹具运行 → 证据匹配 → 规则检查 → 独立复核 → Bad Case 导出 → 回归验证。
