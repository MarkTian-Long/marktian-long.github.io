# ESOP 字段提取 Demo

## 功能描述
基于 DeepSeek API 的港股招股书股权激励字段结构化提取工具。用户粘贴招股书原文片段，AI 自动提取三组字段（公司基本信息 / 激励计划 / 授予信息），输出带置信度标注和原文溯源的结构化结果，支持人工校验和 JSON 导出。

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

## 数据来源
用户自行粘贴招股书原文，实时调用 DeepSeek Chat API 提取。API Key 由用户填写，仅存储在本地 localStorage，不上传。

## 文件结构
```
tools/esop-extractor/
├── README.md     # 本文件
└── index.html    # 单文件工具，HTML/CSS/JS 全部内联
```

## localStorage Keys
| Key | 内容 |
|-----|------|
| `qiuzhi_esop_apikey` | 用户的 DeepSeek API Key |
| `qiuzhi_esop_last_result` | 上次提取结果（JSON） |

## 维护指南
- **修改字段**：同步更新 `FIELD_LABELS_*` 常量 + User Prompt 模板中的 JSON schema
- **修改 Prompt**：更新 `SYSTEM_PROMPT` 常量，同义词映射表在其中维护
- **切换模型**：修改 `DEEPSEEK_MODEL` 常量（当前：`deepseek-chat`）
- **切换 API**：修改 `DEEPSEEK_BASE_URL` 常量，兼容 OpenAI 格式的接口均可替换
