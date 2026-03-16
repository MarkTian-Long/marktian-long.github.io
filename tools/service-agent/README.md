# 智能客服中台 Demo

PM 作品：展示 **意图路由 + 多 Agent 协作 + Human-in-the-Loop** 的完整 AI 中台设计。

## 功能概览

| Tab | 内容 |
|-----|------|
| 💬 对话演示 | 两列视角布局：左「用户视角」（干净对话）/ 右「系统视角」（流程图高亮 + Agent 状态 + 步骤日志） |
| 🧭 路由逻辑 | 四类意图决策树可视化（PM 系统设计输出） |
| 🤖 Agent 图谱 | 各 Agent 职责/输入/输出/System Prompt 展示 |
| ⚙️ 中台治理 | HITL 触发条件、升级阈值、SLA 指标设计 |
| 🔄 数据飞轮 | Bad Case 标注流程、训练数据闭环设计 |

## 四条 Agent 链路

```
FAQ 链:       Router → FAQ Agent                               (1次LLM)
物流链:       Router → 物流查询Agent(mock) → 回复生成Agent     (2次LLM)
退换货链:     Router → 规则核查Agent → 方案生成Agent           (2次LLM)
投诉链:       Router → 情绪识别Agent → 升级判断Agent
              → [need_human=true] 暂停等待人工确认
              → [else] 安抚回复Agent                          (2-3次LLM)
```

## 本地配置

创建 `config.local.js`（已被 .gitignore 排除）：

```js
window.SERVICE_AGENT_CONFIG = {
  openrouterKey: 'sk-or-xxxx',
  model: 'stepfun/step-3.5-flash:free'
};
```

## 文件结构

```
tools/service-agent/
├── index.html        # 主文件（约 1100+ 行）
├── config.local.js   # API key（不进 git）
└── README.md
```
