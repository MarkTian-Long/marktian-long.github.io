# A股 AI 研究助手

> AI 产品能力展示台 — 6-Tab 多维度 AI 能力演示

## 功能概览

| Tab | 功能 | AI 能力 | 数据来源 |
|-----|------|---------|---------|
| 💬 行情助手 | 自然语言查询 A股/指数行情 | Prompt Engineering | Yahoo Finance（真实） |
| 🔬 个股诊断 | 多维度诊断卡（技术面/基本面/情绪面） | Structured Output | Yahoo Finance + 模拟 |
| 📄 研报生成 | RAG 检索 + LLM 生成带引用研报 | RAG | 模拟新闻库 |
| 📡 市场雷达 | 热点板块热力图 + 异动 + AI 简报 | Multi-Source | 模拟数据 |
| 🤖 Agent 实验室 | ReAct Agent 可视化（THINK/PLAN/ACT/OBSERVE） | AI Agent | Yahoo Finance + 模拟 |
| 🛡️ 合规设计 | 金融 AI 合规原则 + 数据血缘图 + 标注规范 | Governance | 静态内容 |

## 技术架构

- **前端**：Vanilla JS + CSS3，零依赖，无构建步骤
- **行情数据**：Yahoo Finance（CORS 代理，15分钟延迟）
- **AI 推理**：OpenRouter API（stepfun/step-3.5-flash）
- **模拟数据**：基本面、情绪评分、新闻库（硬编码 JS 常量，标注 🎭）

## 数据标注规范

- 📊 **真实数据** — Yahoo Finance 实时行情
- 🎭 **模拟数据** — 演示用硬编码数据
- 🤖 **AI 生成** — LLM 输出内容，标注置信度

## 配置

API Key 存放在 `config.local.js`（不进 git），格式：
```js
window.STOCK_CONFIG = { openrouterKey: 'sk-or-...' };
```

线上通过 GitHub Secrets (`STOCK_OPENROUTER_KEY`) 自动注入。

## 免责声明

本工具为 AI 产品能力演示，所有内容仅供参考，不构成投资建议。
