# A股 AI 研究助手

> AI 产品能力展示台 — 6-Tab 多维度 AI 能力演示

## 功能概览

| Tab | 功能 | AI 能力 | 数据来源 |
|-----|------|---------|---------|
| 💬 行情助手 | 自然语言查询 A股/指数行情 | Prompt Engineering | Yahoo Finance（真实） |
| 🔬 个股诊断 | 多维度诊断卡（技术面/基本面/情绪面） | Structured Output | Yahoo Finance + 模拟 |
| 📄 研报生成 | RAG 检索 + LLM 生成带引用研报；金融同义词扩展、数据分级标注、LLM Reranking 可视化、双层知识库（实时市场库 + 私有知识库）、**质量评估卡**（引用覆盖/字数/修改轮次）、**反馈闭环**（👍采用/👎需修改/🚩Bad Case → localStorage） | RAG + Reranking | 模拟新闻库 + 私有上传 |
| 📡 市场雷达 | 热点板块热力图 + 异动 + AI 简报 + **数据时间戳 + 刷新按钮** | Multi-Source | 模拟数据 |
| 🤖 Agent 实验室 | ReAct Agent 可视化（THINK/PLAN/ACT/OBSERVE），**THINK/PLAN 由 LLM 实时生成**（与用户输入真实相关） | AI Agent | Yahoo Finance + 模拟 |
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

## 数据飞轮（反馈闭环）

研报生成后，用户可通过反馈条记录使用情况：

- 👍 **采用**：累计采用次数存入 `localStorage`（key: `qiuzhi_stock_feedback_v1`）
- 👎 **需修改**：选择原因（引用不准/分析浅/格式问题），记录到 `badCases` 数组
- 🚩 **Bad Case**：填写自由文本，提交后入库

演示时可打开 DevTools → Application → localStorage 查看实际记录，对应简历中「构建 Bad Case 入库、根因分析、修复验证的完整闭环」。

## 质量评估指标

对应简历中「制定业务与技术双轨指标」，研报生成后自动评估：

| 指标 | 目标值 | 说明 |
|------|--------|------|
| 引用覆盖 | 所有来源均被引用 | 统计不同引用编号数 vs 来源数 |
| 研报字数 | 150-250字 | LLM 输出字数范围控制 |
| 预计修改轮次 | ≤3次 | 基于引用数量给出参考评估 |

## 免责声明

本工具为 AI 产品能力演示，所有内容仅供参考，不构成投资建议。
