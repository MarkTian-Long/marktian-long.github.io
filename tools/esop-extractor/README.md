# ESOP 字段提取 Demo

## 功能描述
基于 AI 的港股招股书股权激励字段结构化提取工具。用户粘贴招股书原文片段（或上传 PDF Demo），AI 自动提取三组字段（公司基本信息 / 激励计划 / 授予信息），输出带置信度标注和原文溯源的结构化结果，支持 Bad Case 标注和 JSON 导出。

本工具是简历项目"股权激励AI对标数据库"的可交互 Demo，展示 Prompt Engineering 设计能力与数据质量迭代流程。

## 核心设计亮点
- **金融同义词映射**：识别行使价/行权价/认购价等港股/A股术语变体
- **章节定位提示**：Prompt 中预标注各字段所在招股书章节，引导模型定位
- **缺失字段兜底**：找不到时返回 null，不编造内容
- **溯源三元素**：每个字段附带原文来源片段，支持核查
- **Bad Case 标注闭环**：对任意字段标注错误类型 + 正确值 + 备注，导出结构化 bad case 用于迭代优化

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
| 系统默认 | 使用内置 OpenRouter key + `stepfun/step-3.5-flash:free`，开箱即用 |
| 自定义 API | 填入自己的 API Key / Endpoint / 模型名，兼容任意 OpenAI Chat 格式接口 |

### 内置 key 配置方式
复制 `config.example.js` 为 `config.local.js`，填入真实 key：

```js
window.ESOP_CONFIG = {
  builtinApiKey: 'sk-or-v1-xxx...',
  baseUrl:       'https://openrouter.ai/api',
  model:         'stepfun/step-3.5-flash:free',
};
```

`config.local.js` 已被 `.gitignore` 排除，不会提交到 GitHub。

## 文件结构
```
tools/esop-extractor/
├── README.md           # 本文件
├── index.html          # 单文件工具，HTML/CSS/JS 全部内联
├── config.example.js   # 内置 key 配置示例（进 git）
└── config.local.js     # 本地真实配置，含 API Key（不进 git）
```

## localStorage Keys
| Key | 内容 |
|-----|------|
| `qiuzhi_esop_apikey` | 自定义模式的用户 API Key |
| `qiuzhi_esop_endpoint` | 自定义模式的 API Endpoint |
| `qiuzhi_esop_model` | 自定义模式的模型名称 |
| `qiuzhi_esop_apimode` | 当前模式（`default` / `custom`） |
| `qiuzhi_esop_last_result` | 上次提取结果（JSON） |

## 输入模式
| 模式 | 说明 |
|------|------|
| 文本输入 | 粘贴招股书原文，调用真实 AI 提取，结果含原文溯源 |
| 上传 PDF（Demo）| 上传任意 PDF 文件，返回预设模拟数据，用于演示交互流程 |

## Bad Case 标注与导出
提取结果中每个字段均可点击「编辑」进行标注：
- **错误类型**（多选）：数值/内容错误、应有内容未提取、标注为「高置信」但实际有误、原文来源定位不对、其他
- **正确值**（可选）：填写后自动修正字段值
- **备注**（可选）：记录错误原因，方便后续分析

标注后字段显示红色 `⚑ Bad Case` 标记，结果头部出现「导出 Bad Cases」按钮，导出格式：

```json
{
  "exportedAt": "...",
  "promptVersion": "v1",
  "totalBadCases": 2,
  "cases": [
    {
      "section": "esopPlan",
      "field": "exercisePrice",
      "extracted": "港币15.50元/股",
      "errorTypes": ["value_wrong", "overconfident"],
      "correctValue": "港币16.00元/股",
      "note": "原文有歧义，模型取了旧价格",
      "source": "第47页 · ...",
      "markedAt": "..."
    }
  ]
}
```

## 维护指南
- **修改内置模型/key**：编辑 `config.local.js`（不影响 git 历史）
- **修改字段**：同步更新 `FIELD_LABELS_*` 常量 + User Prompt 模板中的 JSON schema
- **修改 Prompt**：更新 `SYSTEM_PROMPT` 常量，同义词映射表在其中维护
- **迭代优化流程**：提取 → 标注 bad case → 导出 JSON → 分析错误原因 → 修改 Prompt → 重新提取验证
