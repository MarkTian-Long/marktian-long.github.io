# AI Insights 产品拆解周刊升级 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 将 AI Insights 工具从静态产品库升级为"产品拆解周刊"格式，支持期号、一句话结论、四Tab深度拆解。

**Architecture:** 纯前端改造，无新依赖。扩展 products.json 数据结构（向后兼容），改造 script.js 渲染逻辑（卡片+弹窗），新增 style.css Tab 样式。旧数据无 tabs 字段时自动 fallback 到原有展示。

**Tech Stack:** Vanilla JS, CSS3, JSON

---

### Task 1: 扩展 products.json 数据结构

**Files:**
- Modify: `tools/ai-insights/data/products.json`

**Step 1: 为全部 6 条产品添加新字段**

在每条记录中新增以下字段（保留所有旧字段不动）：

```json
"issue": 1,
"oneLiner": "一句话核心洞察",
"tabs": {
  "overview": {
    "intro": "产品介绍段落（2-3句）",
    "features": [
      "核心功能1：说明",
      "核心功能2：说明"
    ]
  },
  "tech": {
    "summary": "技术架构总结段落",
    "points": [
      "架构要点1",
      "架构要点2"
    ]
  },
  "competition": {
    "summary": "可选文字段落，没有表格时单独展示",
    "table": [
      {
        "type": "产品类型",
        "name": "竞品名",
        "strength": "核心能力",
        "scene": "适用场景",
        "limit": "局限性"
      }
    ]
  },
  "insights": {
    "points": [
      "洞察1",
      "洞察2"
    ],
    "myTake": "我的判断：更个人化的总结，体现作者视角"
  }
}
```

**各产品具体内容如下：**

**#001 ChatGPT（issue: 1）**
```json
"issue": 1,
"oneLiner": "ChatGPT 真正的护城河不是模型，是 2 亿用户的行为数据飞轮",
"tabs": {
  "overview": {
    "intro": "ChatGPT 是 OpenAI 于 2022 年 11 月发布的对话式 AI 产品，2 个月内突破 1 亿用户，成为史上增长最快的消费级产品。它的核心定位从「聊天机器人」持续进化，如今已是集对话、创作、代码、Agent 执行于一体的 AI 操作系统。",
    "features": [
      "GPTs 平台：用户可创建自定义 AI，首周 300 万+ 创建，构建 UGC 生态",
      "记忆功能：跨会话记住用户偏好，大幅提升长期粘性",
      "Canvas 协作：文档/代码的交互式编辑范式，超越纯对话形式",
      "Projects：将对话、文件、记忆整合为工作项目单元"
    ]
  },
  "tech": {
    "summary": "ChatGPT 的技术核心是 GPT-4o 多模态模型 + RLHF 持续优化机制。用户反馈直接成为训练数据，形成「使用→反馈→优化→更好用→更多使用」的飞轮。Tool Use 能力让模型可以调用外部工具，是 Agent 功能的基础。",
    "points": [
      "GPT-4o：多模态（文字/图片/语音/视频）统一模型",
      "RLHF：人类反馈强化学习，用户行为直接优化模型",
      "Tool Use：模型调用搜索、代码执行、文件读取等外部工具",
      "RAG：检索增强生成，支持用户上传文件进行知识问答"
    ]
  },
  "competition": {
    "summary": "ChatGPT 面临来自 Claude、Gemini、国内各大模型的竞争，但其核心优势在于品牌认知度和生态规模。",
    "table": [
      { "type": "通用对话", "name": "Claude", "strength": "长文本/安全/编程", "scene": "专业写作、代码", "limit": "品牌认知度低于 ChatGPT" },
      { "type": "通用对话", "name": "Gemini", "strength": "Google 生态集成", "scene": "搜索增强、办公", "limit": "对话体验不及 ChatGPT" },
      { "type": "国产模型", "name": "文心一言", "strength": "中文优化、百度生态", "scene": "国内企业用户", "limit": "国际化能力弱" }
    ]
  },
  "insights": {
    "points": [
      "免费策略是数据飞轮的入口，不是让利，是投资",
      "功能上线时机比功能本身更重要——记忆功能的克制发布节奏值得研究",
      "从对话工具到 AI 操作系统，每次形态升级都重新定义了竞争边界"
    ],
    "myTake": "ChatGPT 最值得学的不是技术，是产品节奏感。它知道什么时候该激进（抢先发布）、什么时候该克制（记忆功能慢慢推）。这种对用户心理的把握，比任何单一功能都更难复制。"
  }
}
```

**#002 Midjourney（issue: 2）**
```json
"issue": 2,
"oneLiner": "Midjourney 证明：当 PMF 足够强，免费增长不是必须的",
"tabs": {
  "overview": {
    "intro": "Midjourney 是 AI 图像生成的标杆产品，以 Discord Bot 起步，靠极致的美学调教和社区效应实现差异化。仅约 40 人的团队达到约 1 亿美元 ARR，是 AI 领域效率最高的商业化案例之一。",
    "features": [
      "Discord Bot 入口：在用户已有社区中运行，零冷启动成本",
      "高美学一致性：V5/V6 版本的画风调教形成独特的 Midjourney 美学",
      "Prompt 智能优化：降低使用门槛，非设计师也能产出专业级图片",
      "版本迭代病毒传播：每次大版本升级都引发社区内大规模二次传播"
    ]
  },
  "tech": {
    "summary": "Midjourney 使用自研的 Diffusion 模型，核心技术优势在于美学方向的精细调教，而非单纯的参数规模。其 Prompt 优化层将用户的模糊意图转化为高质量生成指令，这本身就是重要的产品技术壁垒。",
    "points": [
      "自研 Diffusion Model：不依赖 Stable Diffusion 开源底座",
      "美学调教层：大量人工标注确立独特视觉风格",
      "Prompt 优化：自动增强用户输入，降低专业门槛",
      "Discord 基础设施：Bot 架构天然支持社区互动和内容传播"
    ]
  },
  "competition": {
    "summary": "图像生成赛道竞争激烈，但 Midjourney 通过品牌美学和社区形成了难以复制的护城河。",
    "table": [
      { "type": "AI 图像生成", "name": "DALL·E 3", "strength": "ChatGPT 内置，用户基数大", "scene": "快速原型、插图", "limit": "美学风格不如 Midjourney" },
      { "type": "开源图像生成", "name": "Stable Diffusion", "strength": "完全开源可自部署", "scene": "开发者、本地部署", "limit": "需要较高技术门槛" },
      { "type": "设计工具", "name": "Adobe Firefly", "strength": "无版权风险、Adobe 生态", "scene": "商业设计、办公", "limit": "生成质量和自由度不及 MJ" }
    ]
  },
  "insights": {
    "points": [
      "产品载体的选择决定了用户获取方式——Discord 是反常识但高度正确的决策",
      "关闭免费试用反而提升了付费转化，说明强 PMF 下免费不是必须条件",
      "美学品牌是护城河——用户愿意付费不只是为功能，是为「Midjourney 风格」"
    ],
    "myTake": "Midjourney 最反直觉的地方：它在最火的时候关掉了免费试用。大多数产品经理会本能地反对这个决策。但结果证明，当产品足够好，稀缺感是正向的。这让我重新思考「增长黑客」思维的适用边界。"
  }
}
```

**#003 DeepSeek（issue: 3）**
```json
"issue": 3,
"oneLiner": "DeepSeek 重新定义了 AI 军备竞赛的规则：不是谁算力多，是谁算法省",
"tabs": {
  "overview": {
    "intro": "DeepSeek 是深度求索于 2024 年推出的系列大模型，以极低训练成本和开源策略快速崛起。DeepSeek-V3/R1 在多项基准测试中比肩 GPT-4 级别，但推理成本降低 90%+，彻底打破了「顶级模型必然昂贵」的行业认知。",
    "features": [
      "极致成本优化：V3 训练成本约 557 万美元，是同级模型的 1/10",
      "开源策略：模型权重完全开放，快速建立开发者生态",
      "R1 推理模型：在数学和编程推理任务上表现突出，对标 o1",
      "API 极低定价：推理成本远低于 OpenAI，吸引大量企业迁移"
    ]
  },
  "tech": {
    "summary": "DeepSeek 的核心技术突破在于 MoE（混合专家）架构的工程优化。通过只激活模型的一部分参数来处理每个 token，大幅降低计算量。同时在 RLHF 流程上做了创新，用更少的人工标注数据达到更好的对齐效果。",
    "points": [
      "MoE 架构：每次只激活部分专家网络，降低计算成本",
      "FP8 混合精度训练：在不损失精度的前提下减少显存占用",
      "Multi-head Latent Attention：压缩 KV Cache，降低推理成本",
      "Group Relative Policy Optimization：更高效的强化学习对齐方案"
    ]
  },
  "competition": {
    "summary": "DeepSeek 的出现对整个 AI 行业的定价体系形成了冲击，迫使 OpenAI 等公司加速降价。",
    "table": [
      { "type": "顶级闭源模型", "name": "GPT-4o", "strength": "生态最完善、品牌最强", "scene": "企业级应用", "limit": "价格昂贵，中国访问受限" },
      { "type": "顶级闭源模型", "name": "Claude 3.5", "strength": "长文本、编程、安全", "scene": "专业代码/文档", "limit": "同样价格较高" },
      { "type": "国产开源模型", "name": "Qwen 2.5", "strength": "中文优化、阿里生态", "scene": "国内企业应用", "limit": "国际影响力不及 DeepSeek" }
    ]
  },
  "insights": {
    "points": [
      "成本是产品竞争力的核心维度——「同等质量更便宜」本身就是强大的产品力",
      "开源在特定阶段是最高效的市场占领策略，不是让利，是建立标准",
      "技术突破可以重新定义市场格局——DeepSeek 让 AI 军备竞赛的焦点从算力转向算法效率"
    ],
    "myTake": "DeepSeek 给我最大的启示是：在一个所有人都在堆算力的赛道里，找到一个正交的竞争维度（成本效率）反而创造了降维优势。这不只是技术故事，是产品战略故事。"
  }
}
```

**#004 Claude（issue: 4）**
```json
"issue": 4,
"oneLiner": "Claude 证明了「安全」可以是差异化卖点，而不只是合规负担",
"tabs": {
  "overview": {
    "intro": "Claude 是 Anthropic 的旗舰 AI 产品，强调 AI 安全与对齐。Claude 3.5 Sonnet 在编程、推理、长文本理解上表现顶级，200K token 超长上下文窗口是目前最强之一。其核心差异化是 Constitutional AI 训练方案和对企业客户的高度可控性。",
    "features": [
      "200K 上下文窗口：可处理整本书、大型代码库，长文档能力最强",
      "Artifacts：交互式代码/文档输出，开创 AI 产品新交互范式",
      "Projects：持久化工作空间，支持跨会话上下文保留",
      "强编程能力：代码生成、调试、解释在多项基准测试名列前茅"
    ]
  },
  "tech": {
    "summary": "Claude 的核心技术差异是 Constitutional AI（宪法 AI）训练方案。不同于传统 RLHF 依赖大量人工标注，Constitutional AI 让模型根据一套明确的原则自我评估和改进，更可解释、更可控。这也是 Anthropic 在 AI 安全研究上的核心成果。",
    "points": [
      "Constitutional AI：基于原则的自我改进训练，减少有害输出",
      "超长上下文：200K token 窗口，业界领先的长文本处理",
      "强代码能力：在 SWE-bench 等编程基准上持续领先",
      "Artifacts：可执行的交互式输出，超越纯文字对话形式"
    ]
  },
  "competition": {
    "summary": "Claude 在专业用户群体中口碑极好，但在消费者市场品牌认知度仍落后于 ChatGPT。",
    "table": [
      { "type": "通用对话", "name": "ChatGPT", "strength": "品牌最强、生态最大", "scene": "通用消费者", "limit": "安全性不如 Claude" },
      { "type": "企业 AI", "name": "Gemini for Workspace", "strength": "Google 办公套件集成", "scene": "Google 生态企业", "limit": "对话质量不及 Claude" },
      { "type": "代码助手", "name": "GitHub Copilot", "strength": "IDE 深度集成", "scene": "日常编码", "limit": "不具备通用对话能力" }
    ]
  },
  "insights": {
    "points": [
      "安全性不是限制，而是差异化卖点——Constitutional AI 让 B2B 客户愿意为「可控」付溢价",
      "Artifacts 功能验证：AI 产品不只是对话，结果的呈现方式和交互方式同等重要",
      "专注特定用户群的极致体验，比追求全面覆盖更有效"
    ],
    "myTake": "Claude 让我最印象深刻的是 Artifacts。这个功能本质上是在回答一个问题：「AI 生成的结果，应该怎么呈现？」纯文字是一个答案，但可以交互、可以直接运行的 Artifact 是另一个维度的答案。这种对输出形态的思考，是很多 AI 产品忽视的。"
  }
}
```

**#005 Cursor（issue: 5）**
```json
"issue": 5,
"oneLiner": "Cursor 的本质不是更好的代码补全，是把 AI 无缝嵌入程序员已有的工作流",
"tabs": {
  "overview": {
    "intro": "Cursor 是基于 VS Code 的 AI 编程编辑器，将大模型深度集成到编码工作流中。它不是独立的 AI 工具，而是在程序员最熟悉的环境里提供 AI 能力，最大限度降低迁移成本。Tab 补全 + Chat + Composer 的组合，开创了 AI IDE 品类。",
    "features": [
      "Tab 智能补全：预测下一步代码意图，不只是补全当前行",
      "Cmd+K 内联编辑：选中代码直接用自然语言修改，无需切换窗口",
      "Chat with Codebase：基于整个项目上下文回答，理解代码库全局",
      "Composer：多文件同时编辑，执行跨文件的复杂重构任务"
    ]
  },
  "tech": {
    "summary": "Cursor 基于 VS Code 二次开发，复用了整个 VS Code 插件生态。核心技术是代码库的 RAG 索引——将整个项目建立语义索引，让模型在回答时有完整的代码上下文。模型层集成了 GPT-4 和 Claude，根据任务类型自动调度。",
    "points": [
      "VS Code Fork：复用成熟编辑器基础设施和插件生态",
      "Codebase RAG：对项目代码建立向量索引，支持全局代码理解",
      "多模型调度：根据任务复杂度调用不同模型（GPT-4/Claude）",
      "Shadow Workspace：后台并行执行，不阻塞主编辑流程"
    ]
  },
  "competition": {
    "summary": "AI 编程助手赛道竞争激烈，但 Cursor 通过编辑器级深度集成建立了壁垒。",
    "table": [
      { "type": "AI 代码补全", "name": "GitHub Copilot", "strength": "微软/GitHub 生态、品牌强", "scene": "日常代码补全", "limit": "编辑器集成深度不及 Cursor" },
      { "type": "AI 编程助手", "name": "Windsurf", "strength": "Agentic 执行能力强", "scene": "复杂任务自动化", "limit": "用户基数小于 Cursor" },
      { "type": "命令行工具", "name": "Claude Code", "strength": "终端原生、任务执行强", "scene": "复杂工程任务", "limit": "无 GUI，学习门槛高" }
    ]
  },
  "insights": {
    "points": [
      "AI 产品的核心不是 AI 能力，而是把 AI 无缝融入用户已有工作流——迁移成本越低，采用率越高",
      "基于成熟产品改造（VS Code Fork）vs 从零开发：复用生态是降低冷启动成本的最优解",
      "Tab 补全的「意图预测」设计哲学：AI 应该预测你要做什么，而不只是完成你已经开始做的"
    ],
    "myTake": "Cursor 让我重新理解了「工作流集成」的价值。很多 AI 产品都有强大的能力，但需要用户主动切换到新工具去使用。Cursor 选择寄生在程序员最熟悉的环境里，这个「不改变习惯」的设计决策，比任何功能创新都更有力量。"
  }
}
```

**#006 Perplexity（issue: 6）**
```json
"issue": 6,
"oneLiner": "Perplexity 把搜索的核心从「找到信息」重新定义为「理解信息」",
"tabs": {
  "overview": {
    "intro": "Perplexity AI 是新一代 AI 搜索引擎，不返回链接列表，而是直接给出带引用来源的结构化答案。它重新定义了搜索体验：不是帮你找到信息在哪里，而是帮你直接理解信息。月活过千万，已成为 AI 搜索的标杆产品。",
    "features": [
      "直接答案 + 引用来源：不是网页列表，是带溯源的结构化回答",
      "Pro Search：多步推理模式，自动拆解复杂问题逐步搜索",
      "Spaces：知识库功能，收藏和组织搜索结果",
      "实时性：接入最新网页内容，克服大模型知识截止限制"
    ]
  },
  "tech": {
    "summary": "Perplexity 的核心技术是 RAG（检索增强生成）的产品化应用。实时爬取目标网页，将内容作为上下文注入模型，生成有引用的答案。底层模型是多家大模型的混合调度（OpenAI、自研模型），根据问题类型选择最优模型。",
    "points": [
      "实时 RAG：每次查询实时检索网页，不受训练数据截止日期限制",
      "引用生成：答案中每个关键信息标注来源，支持一键验证",
      "多模型调度：Pro Search 使用更强模型，普通搜索用轻量模型",
      "索引系统：自建网页爬虫索引，不完全依赖 Google/Bing API"
    ]
  },
  "competition": {
    "summary": "Perplexity 面临来自传统搜索引擎 AI 化和独立 AI 搜索产品的双重竞争。",
    "table": [
      { "type": "传统搜索 AI 化", "name": "Google AI Overview", "strength": "搜索流量最大、SEO 生态", "scene": "日常搜索", "limit": "体验改进保守，不如 Perplexity 激进" },
      { "type": "传统搜索 AI 化", "name": "Bing Copilot", "strength": "微软生态、Office 集成", "scene": "办公场景搜索", "limit": "用户习惯仍偏向 Google" },
      { "type": "AI 对话", "name": "ChatGPT Search", "strength": "用户基数大", "scene": "通用问答搜索", "limit": "实时性和引用体验不及 Perplexity" }
    ]
  },
  "insights": {
    "points": [
      "搜索产品的核心价值从「找到信息」转移到「理解信息」——这是用户真正的需求",
      "引用设计在专业场景（研究/金融/医疗）中是核心信任建立机制",
      "AI 搜索不是替代传统搜索，是在特定场景（需要综合理解而非简单查找）的体验升维"
    ],
    "myTake": "Perplexity 最值得学的是它敢于「不返回链接」。这在搜索领域是极大的范式突破——搜索引擎的商业模式本来就建立在「给你链接，让你点击」上。Perplexity 选择直接给答案，颠覆了整个流量逻辑。这种对用户体验的极致追求，是传统搜索公司因为商业模式限制而不敢做的。"
  }
}
```

**Step 2: 验证 JSON 格式合法**

打开浏览器控制台，或用 Node.js 验证：
```bash
node -e "JSON.parse(require('fs').readFileSync('tools/ai-insights/data/products.json','utf8')); console.log('JSON valid')"
```
Expected: `JSON valid`

**Step 3: Commit**

```bash
git add tools/ai-insights/data/products.json
git commit -m "feat: AI Insights 数据扩展 - 新增期号、一句话结论、四Tab内容字段"
```

---

### Task 2: 改造卡片样式（style.css）

**Files:**
- Modify: `tools/ai-insights/style.css`

**Step 1: 新增期号标签样式**

在 `.card-company` 样式后添加：

```css
/* ---- ISSUE BADGE ---- */
.card-issue {
    display: inline-block;
    padding: 2px 8px;
    border-radius: 50px;
    font-size: 0.7rem;
    font-weight: 700;
    background: rgba(79, 143, 255, 0.1);
    border: 1px solid rgba(79, 143, 255, 0.25);
    color: var(--accent-blue);
    margin-bottom: 6px;
    letter-spacing: 0.5px;
}

/* ---- ONE-LINER ---- */
.card-one-liner {
    font-size: 0.88rem;
    color: var(--text-primary);
    font-weight: 500;
    line-height: 1.6;
    margin-bottom: 12px;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}
```

**Step 2: 新增 Tab 系统样式**

在 `/* ---- DETAIL MODAL ----` 块内 `.detail-close` 样式后添加：

```css
/* ---- DETAIL TABS ---- */
.detail-tabs {
    display: flex;
    gap: 4px;
    margin-bottom: 24px;
    border-bottom: 1px solid var(--border);
    padding-bottom: 0;
}

.detail-tab-btn {
    padding: 8px 16px;
    border: none;
    background: transparent;
    color: var(--text-muted);
    font-family: var(--font);
    font-size: 0.82rem;
    font-weight: 500;
    cursor: pointer;
    border-bottom: 2px solid transparent;
    margin-bottom: -1px;
    transition: all var(--transition);
    white-space: nowrap;
}

.detail-tab-btn:hover {
    color: var(--text-secondary);
}

.detail-tab-btn.active {
    color: var(--accent-blue);
    border-bottom-color: var(--accent-blue);
}

.detail-tab-panel {
    display: none;
}

.detail-tab-panel.active {
    display: block;
    animation: fadeIn 0.2s ease;
}

/* ---- MY TAKE BLOCK ---- */
.my-take {
    margin-top: 20px;
    padding: 16px 20px;
    background: rgba(0, 229, 160, 0.06);
    border: 1px solid rgba(0, 229, 160, 0.2);
    border-radius: var(--radius-md);
    position: relative;
}

.my-take-label {
    font-size: 0.72rem;
    font-weight: 700;
    color: var(--accent-green);
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-bottom: 8px;
}

.my-take-text {
    font-size: 0.88rem;
    color: var(--text-secondary);
    line-height: 1.8;
    font-style: italic;
}

/* ---- COMPETITION TABLE ---- */
.competition-table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 12px;
    font-size: 0.8rem;
}

.competition-table th {
    text-align: left;
    padding: 8px 12px;
    color: var(--text-muted);
    font-weight: 600;
    font-size: 0.72rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    border-bottom: 1px solid var(--border);
}

.competition-table td {
    padding: 10px 12px;
    color: var(--text-secondary);
    border-bottom: 1px solid rgba(255,255,255,0.04);
    vertical-align: top;
    line-height: 1.5;
}

.competition-table tr:last-child td {
    border-bottom: none;
}

.competition-table tr:hover td {
    background: rgba(255,255,255,0.02);
}
```

**Step 3: Commit**

```bash
git add tools/ai-insights/style.css
git commit -m "style: AI Insights 新增期号、Tab、竞品表格、myTake 样式"
```

---

### Task 3: 改造渲染逻辑（script.js）

**Files:**
- Modify: `tools/ai-insights/script.js`

**Step 1: 修改 renderGrid 函数中的卡片模板**

将 `renderGrid` 函数中的 `return` 模板字符串替换为：

```javascript
return `
  <div class="product-card" style="--card-grad: ${grad}; animation-delay: ${i * 0.06}s"
       onclick="showDetail('${p.id}')">
    <div class="card-top">
      <span class="card-logo">${p.logo}</span>
      <span class="card-trend ${trend.cls}">${trend.label}</span>
    </div>
    ${p.issue ? `<div class="card-issue">#${String(p.issue).padStart(3, '0')}</div>` : ''}
    <div class="card-name">${p.name}</div>
    <div class="card-company">${p.company}</div>
    <div class="card-tagline">${p.tagline}</div>
    <div class="${p.oneLiner ? 'card-one-liner' : 'card-desc'}">${p.oneLiner || p.description}</div>
    <div class="card-tags">
      <span class="card-category">${p.category}</span>
      ${p.techStack.slice(0, 3).map(t => `<span class="card-tag">${t}</span>`).join('')}
    </div>
    <div class="card-footer">
      <span class="card-stars">${stars}</span>
      <span class="card-cta">查看拆解 →</span>
    </div>
  </div>
`;
```

**Step 2: 替换 showDetail 函数**

将整个 `showDetail` 函数替换为新版本，支持四 Tab 结构（有 tabs 字段时渲染 Tab，无时 fallback 到原有展示）：

```javascript
function showDetail(id) {
    const p = products.find(pr => pr.id === id);
    if (!p) return;

    const trend = TREND_MAP[p.trend] || TREND_MAP.stable;
    const stars = '★'.repeat(p.stars) + '☆'.repeat(5 - p.stars);
    const content = document.getElementById('detailContent');

    const headerHtml = `
        <div class="detail-header">
            <span class="detail-logo">${p.logo}</span>
            <div>
                <div class="detail-name">${p.name}</div>
                <div class="detail-company">${p.company} · ${stars}</div>
            </div>
            ${p.issue ? `<div class="card-issue" style="margin-left:auto">#${String(p.issue).padStart(3, '0')}</div>` : ''}
        </div>
        <div class="detail-tagline">${p.tagline}</div>
        <div class="detail-meta">
            <div class="detail-meta-item"><span class="detail-meta-label">分类</span>${p.category}</div>
            <div class="detail-meta-item"><span class="detail-meta-label">商业模式</span>${p.businessModel}</div>
            <div class="detail-meta-item"><span class="detail-meta-label">上线时间</span>${p.launchDate}</div>
            <div class="detail-meta-item"><span class="detail-meta-label">趋势</span>${trend.label}</div>
        </div>
    `;

    let bodyHtml;
    if (p.tabs) {
        bodyHtml = renderTabs(p);
    } else {
        // fallback: 原有展示
        bodyHtml = `
            <div class="detail-desc">${p.description}</div>
            <div class="detail-section">
                <div class="detail-section-title">🔥 核心亮点</div>
                <ul class="detail-list">${p.highlights.map(h => `<li>${h}</li>`).join('')}</ul>
            </div>
            <div class="detail-section">
                <div class="detail-section-title">💡 PM 视角洞察</div>
                <ul class="detail-list insights">${p.pmInsights.map(i => `<li>${i}</li>`).join('')}</ul>
            </div>
            <div class="detail-section">
                <div class="detail-section-title">🛠 技术关键词</div>
                <div class="card-tags" style="margin-top:8px">${p.techStack.map(t => `<span class="card-tag">${t}</span>`).join('')}</div>
            </div>
        `;
    }

    content.innerHTML = headerHtml + bodyHtml + `<button class="detail-close" onclick="closeDetailDirect()">关闭</button>`;
    document.getElementById('detailModal').classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function renderTabs(p) {
    const t = p.tabs;
    return `
        <div class="detail-tabs">
            <button class="detail-tab-btn active" onclick="switchTab(this, 'overview')">产品概述</button>
            <button class="detail-tab-btn" onclick="switchTab(this, 'tech')">技术架构</button>
            <button class="detail-tab-btn" onclick="switchTab(this, 'competition')">竞品分析</button>
            <button class="detail-tab-btn" onclick="switchTab(this, 'insights')">启示总结</button>
        </div>

        <div id="tab-overview" class="detail-tab-panel active">
            <div class="detail-desc">${t.overview.intro}</div>
            <div class="detail-section">
                <div class="detail-section-title">🔥 核心功能</div>
                <ul class="detail-list">${t.overview.features.map(f => `<li>${f}</li>`).join('')}</ul>
            </div>
        </div>

        <div id="tab-tech" class="detail-tab-panel">
            <div class="detail-desc">${t.tech.summary}</div>
            <div class="detail-section">
                <div class="detail-section-title">⚙️ 技术要点</div>
                <ul class="detail-list">${t.tech.points.map(pt => `<li>${pt}</li>`).join('')}</ul>
            </div>
        </div>

        <div id="tab-competition" class="detail-tab-panel">
            ${t.competition.summary ? `<div class="detail-desc">${t.competition.summary}</div>` : ''}
            ${t.competition.table && t.competition.table.length ? `
            <table class="competition-table">
                <thead>
                    <tr>
                        <th>产品类型</th>
                        <th>代表产品</th>
                        <th>核心能力</th>
                        <th>适用场景</th>
                        <th>局限性</th>
                    </tr>
                </thead>
                <tbody>
                    ${t.competition.table.map(row => `
                    <tr>
                        <td>${row.type}</td>
                        <td><strong>${row.name}</strong></td>
                        <td>${row.strength}</td>
                        <td>${row.scene}</td>
                        <td>${row.limit}</td>
                    </tr>`).join('')}
                </tbody>
            </table>` : ''}
        </div>

        <div id="tab-insights" class="detail-tab-panel">
            <div class="detail-section">
                <div class="detail-section-title">💡 产品启示</div>
                <ul class="detail-list insights">${t.insights.points.map(pt => `<li>${pt}</li>`).join('')}</ul>
            </div>
            ${t.insights.myTake ? `
            <div class="my-take">
                <div class="my-take-label">我的判断</div>
                <div class="my-take-text">${t.insights.myTake}</div>
            </div>` : ''}
        </div>
    `;
}

function switchTab(btn, tabId) {
    // 切换按钮状态
    btn.closest('.detail-tabs').querySelectorAll('.detail-tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    // 切换面板
    document.querySelectorAll('.detail-tab-panel').forEach(panel => panel.classList.remove('active'));
    document.getElementById('tab-' + tabId).classList.add('active');
}
```

**Step 3: 验证**

在浏览器中打开 `tools/ai-insights/index.html`，检查：
- [ ] 卡片左上有 `#001` 等期号标签
- [ ] 卡片正文显示 `oneLiner` 内容
- [ ] 点击卡片弹窗有四个 Tab
- [ ] Tab 切换正常
- [ ] 竞品分析 Tab 有表格
- [ ] 启示总结有「我的判断」绿色块

**Step 4: Commit**

```bash
git add tools/ai-insights/script.js
git commit -m "feat: AI Insights 升级为产品拆解周刊 - 期号标签、四Tab弹窗、竞品表格"
```

---

### Task 4: 更新 README

**Files:**
- Modify: `tools/ai-insights/README.md`

**Step 1: 更新 README 说明新的数据结构**

在 README 中更新数据字段说明，记录 `issue`、`oneLiner`、`tabs` 字段的含义和格式。

**Step 2: Commit**

```bash
git add tools/ai-insights/README.md
git commit -m "docs: 更新 AI Insights README，记录新数据结构"
```
