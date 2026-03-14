# ESOP 字段提取 Demo

## 功能描述
基于 AI 的港股招股书股权激励字段结构化提取工具。用户粘贴招股书原文片段，AI 自动提取三组字段（公司基本信息 / 激励计划 / 授予信息），输出带置信度标注和原文溯源的结构化结果，支持人工校验和 JSON 导出。

本工具是简历项目"股权激励AI对标数据库"的可交互 Demo，展示 Prompt Engineering 设计能力。

## 核心设计亮点
- **金融同义词映射**：识别行使价/行权价/认购价等港股/A股术语变体
- **章节定位提示**：Prompt 中预标注各字段所在招股书章节，引导模型定位
- **缺失字段兜底**：找不到时返回 null，不编造内容
- **溯源三元素**：每个字段附带原文来源片段，支持核查
- **人工校验闭环**：可编辑任意字段，保存后标注"已校验"

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

## 维护指南
- **修改内置模型/key**：编辑 `config.local.js`（不影响 git 历史）
- **修改字段**：同步更新 `FIELD_LABELS_*` 常量 + User Prompt 模板中的 JSON schema
- **修改 Prompt**：更新 `SYSTEM_PROMPT` 常量，同义词映射表在其中维护
