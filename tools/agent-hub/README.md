# Agent 认知全景

一个独立运行的静态判断工具：先回答六个任务问题，再决定“不需要 Agent”、传统自动化、RAG / 助手、单 Agent + 工具、并行多 Agent，或人工方案评审。

## 功能

- **六问决策器**：任务清晰度、重复性、知识形态、拆解方式、风险和评估闭环。
- **可解释规则**：结果展示命中规则、被排除的替代方案、正常链路、失败回退和停止条件。
- **风险控制**：高风险或不可逆动作强制预览、HITL、审计和停止条件；中风险或部分可测结果增加人工抽检与审批/接管；输入缺失或矛盾时撤回自动建议。
- **架构与故障**：单 Agent + 工具、主从并行、互审 / 辩论、显式工作流，分别说明故障传播、重试边界和人工接管。
- **六个场景预设**：招聘初筛、代码审查、客服工单、BI 周报、法务文档、IT 帮助台；每个场景都有输入假设、人的责任、测量方式和停止条件。
- **框架资料档案**：LangGraph、OpenAI Agents SDK、CrewAI、Microsoft Agent Framework、Dify、OpenAI Swarm 仅保留候选官方 URL 与档案整理日期；本次实施未逐一打开核对，统一标记为“待人工事实复核”。
- **判断框架**：六条带适用条件、判断规则、反例和下一条证据需求的产品判断。

## 可信边界

页面是静态规则判断器，不调用模型、不接入生产数据，也不保存问卷答案。场景中的 target、proxy 和 offline-measured 指标是目标、代理指标或离线测量设计，不是生产结果或效果承诺。指标将评估日期、口径日期（`definitionAsOf`）和真实测量日期（`measuredAt`）分开；当前 `measuredAt` 为空，不把运行日伪装成证据。

候选框架 URL 的档案整理日期为 2026-08-30；这不是官方事实核验日期。实施时未逐一打开这些 URL，产品状态、能力和链接均待人工事实复核。
引擎不会为缺失、非法或未来的整理日期兜底；这类资料会进入 `unavailable`，并继续保持待人工事实复核。

## 技术与运行

- 纯 HTML + CSS + Vanilla JS，零运行时依赖。
- 页面脚本按 data/decision-model.js → decision-engine.js → app.js 顺序加载。
- 可直接打开 index.html；需要跑浏览器测试时使用本地静态服务器。
- 测试采用 Node.js node:test 与 Playwright，不调用外部服务。

单元测试：

~~~powershell
node --test scripts/agent-hub-depth.test.js
~~~
浏览器测试（当前 worktree 未安装依赖时，可指向本机已存在的 Playwright 依赖）：

~~~powershell
$env:NODE_PATH='D:\CS\Coding\qiuzhi\scripts\node_modules'
node --test scripts/agent-hub-depth.browser.test.js
~~~

生成视觉审查截图时设置 AGENT_HUB_SCREENSHOT_DIR；截图应记录页面、视口和状态，不纳入仓库提交。

## 文件结构

~~~text
tools/agent-hub/
├── index.html                 # 页面骨架、样式、四 Tab 与跨页认知链
├── app.js                     # 数据渲染、六问交互、Tab 键盘操作与错误状态
├── decision-engine.js         # 纯规则决策、风险控制与框架新鲜度
├── data/
│   └── decision-model.js      # 六问、规则、架构、场景、判断与候选框架资料
└── README.md
~~~
