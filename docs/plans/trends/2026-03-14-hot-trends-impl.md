# 热点快照模块实现计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 新增 `tools/trends/` 热点快照模块，展示 AI & 科技领域五大平台热榜，数据由 Claude 联网搜索后写入 JSON。

**Architecture:** 纯静态前端，`trends.json` 作数据层，`index.html` 读取后渲染。页面注册到主页 `switchTool()` Tab 系统。新增 `/update-trends` skill 供后续数据更新使用。

**Tech Stack:** HTML5 + CSS3 + Vanilla JS，CSS 变量复用前沿雷达风格，无构建工具。

---

### Task 1: 创建数据文件 trends.json（含真实初始数据）

**Files:**
- Create: `tools/trends/data/trends.json`

**Step 1: 写入初始数据（使用今天搜索的真实结果）**

```json
{
  "updated_at": "2026-03-14",
  "boards": [
    {
      "id": "github-ai",
      "title": "GitHub AI 热榜",
      "icon": "⚡",
      "items": [
        {
          "rank": 1,
          "title": "OpenClaw",
          "summary": "本地 AI 个人助手，连接 WhatsApp/Slack/Discord 等 50+ 平台，210k+ Stars",
          "insight": "本地化 AI 是 2026 最大趋势。OpenClaw 的爆发说明用户对数据隐私的诉求正在压倒云端便利性，「个人 AI 网关」这个品类值得持续关注。",
          "url": "https://github.com/trending",
          "source": "GitHub Trending",
          "tags": ["本地AI", "Agent", "隐私"]
        },
        {
          "rank": 2,
          "title": "n8n",
          "summary": "开源工作流自动化平台，可视化 + 代码双模式，原生集成 AI 能力",
          "insight": "工作流自动化正在被 AI 重新定义。n8n 的增长反映出「无代码+AI」的市场需求，对 PM 而言这类工具值得深度体验。",
          "url": "https://github.com/n8n-io/n8n",
          "source": "GitHub Trending",
          "tags": ["工作流", "无代码", "自动化"]
        },
        {
          "rank": 3,
          "title": "Ollama",
          "summary": "本地 LLM 运行框架，Go 实现，支持一键部署主流开源模型",
          "insight": "Ollama 把「本地跑大模型」的门槛降到了普通开发者可接受的水平，是理解 LLM 基础设施的最佳入门工具。",
          "url": "https://github.com/ollama/ollama",
          "source": "GitHub Trending",
          "tags": ["本地LLM", "开源", "基础设施"]
        }
      ]
    },
    {
      "id": "product-hunt",
      "title": "Product Hunt 本月",
      "icon": "🚀",
      "items": [
        {
          "rank": 1,
          "title": "Aident AI Beta 2",
          "summary": "用自然语言管理开放世界自动化任务，无需编程",
          "insight": "「自然语言即接口」的趋势在 2026 加速落地。Aident 的方向是把复杂自动化逻辑抽象为对话，PM 视角看这是 UX 范式的根本转变。",
          "url": "https://www.producthunt.com/leaderboard/monthly/2026/3",
          "source": "Product Hunt",
          "tags": ["AI自动化", "无代码", "NL接口"]
        },
        {
          "rank": 2,
          "title": "NOVA",
          "summary": "AI 编程加速器，消灭「运行-报错-修复」死循环",
          "insight": "开发者工具正在被 AI 重构。NOVA 切入的是编程中最痛苦的调试环节，产品价值主张清晰，值得研究其交互设计。",
          "url": "https://www.producthunt.com/leaderboard/monthly/2026/3",
          "source": "Product Hunt",
          "tags": ["AI编程", "开发工具", "效率"]
        },
        {
          "rank": 3,
          "title": "Anything API",
          "summary": "将任意浏览器操作转化为可调用的 API 接口",
          "insight": "这个方向本质是「RPA + AI」的进化形态，解决的是大量遗留系统没有 API 的历史问题，企业服务市场有巨大潜力。",
          "url": "https://www.producthunt.com/leaderboard/monthly/2026/3",
          "source": "Product Hunt",
          "tags": ["API", "RPA", "企业服务"]
        }
      ]
    },
    {
      "id": "hacker-news",
      "title": "HN 热议",
      "icon": "🔥",
      "items": [
        {
          "rank": 1,
          "title": "OpenAI Codex Security 扫描 120 万 Commits",
          "summary": "发现 10,561 个高危安全漏洞，AI 安全审计正在规模化",
          "insight": "AI 做代码安全审计的速度和覆盖面已经远超人工。这对安全工程师是威胁，对产品经理是机会——安全 AI 工具的 PMF 正在快速形成。",
          "url": "https://thehackernews.com/2026/03/openai-codex-security-scanned-12.html",
          "source": "Hacker News",
          "tags": ["AI安全", "代码审计", "OpenAI"]
        },
        {
          "rank": 2,
          "title": "Claude Opus 4.6 独立发现 Firefox 22 个安全漏洞",
          "summary": "其中 14 个高危，占 Firefox 2025 年全年高危漏洞的近 1/5",
          "insight": "LLM 在安全漏洞发现上的能力已达到顶级安全研究员水平。Anthropic 将这作为能力展示，说明安全领域将是 AI 能力竞争的下一个主战场。",
          "url": "https://news.ycombinator.com/front",
          "source": "Hacker News",
          "tags": ["Claude", "安全", "漏洞发现"]
        },
        {
          "rank": 3,
          "title": "Billion-Parameter Theories：大模型参数规模的理论边界",
          "summary": "HN 社区热讨超大规模模型的理论上限与实际收益",
          "insight": "Scaling Law 的讨论从未停歇。这类基础理论讨论往往预示着下一轮技术路线的分歧，值得 AI PM 保持关注。",
          "url": "https://news.ycombinator.com/front",
          "source": "Hacker News",
          "tags": ["大模型", "Scaling", "理论"]
        }
      ]
    },
    {
      "id": "overseas-ai",
      "title": "出海 AI 动态",
      "icon": "🌍",
      "items": [
        {
          "rank": 1,
          "title": "AI Agent 框架竞争白热化",
          "summary": "LangChain、AutoGen、CrewAI 等框架持续迭代，Agent 编排成核心战场",
          "insight": "Agent 框架正在经历「浏览器大战」式的竞争。对出海产品而言，选对底层框架至关重要，目前 LangChain 生态最成熟但也最重。",
          "url": "https://github.com/trending",
          "source": "Twitter/X + GitHub",
          "tags": ["Agent", "框架", "出海"]
        },
        {
          "rank": 2,
          "title": "个人 AI 助手赛道爆发",
          "summary": "OpenClaw 等本地 AI 网关产品涌现，个人数据主权意识觉醒",
          "insight": "欧美用户对数据隐私的敏感度远高于国内。本地化 AI 助手在出海市场的接受度可能比国内更高，值得关注。",
          "url": "https://github.com/trending",
          "source": "Twitter/X",
          "tags": ["个人AI", "隐私", "出海机会"]
        }
      ]
    },
    {
      "id": "cn-ai",
      "title": "国内 AI 热点",
      "icon": "🇨🇳",
      "items": [
        {
          "rank": 1,
          "title": "DeepSeek 持续引发国际关注",
          "summary": "开源模型能力对标闭源头部，国产大模型技术实力获国际认可",
          "insight": "DeepSeek 的意义不只是模型本身，而是证明了「高效训练」路线的可行性。这对国内 AI 产品生态的影响将持续释放。",
          "url": "https://www.36kr.com",
          "source": "36Kr / 知乎",
          "tags": ["DeepSeek", "开源", "国产大模型"]
        },
        {
          "rank": 2,
          "title": "AI 应用出海热度持续升温",
          "summary": "国内开发者借助 AI 工具加速出海，工具类产品表现突出",
          "insight": "国内 AI 人才密度高、工程效率强，出海窗口期正在打开。对 AI PM 而言，出海经验是差异化竞争力。",
          "url": "https://www.36kr.com",
          "source": "36Kr",
          "tags": ["出海", "AI工具", "创业"]
        }
      ]
    }
  ]
}
```

**Step 2: 确认目录结构**
```
tools/trends/data/trends.json  ✓
```

**Step 3: Commit**
```bash
git add tools/trends/data/trends.json
git commit -m "feat: 添加热点快照初始数据 trends.json"
```

---

### Task 2: 创建展示页面 tools/trends/index.html

**Files:**
- Create: `tools/trends/index.html`

**Step 1: 写入完整 HTML**

完整页面结构：
- Header（标题 + 更新时间）
- 五个板块 Tab 切换按钮
- 热点卡片列表（排名 + 标题链接 + 摘要 + 标签 + 可折叠点评）
- 底部 footer

CSS 变量与前沿雷达保持一致：
```css
:root {
  --color-bg: #0a0a0f;
  --color-surface: #13131a;
  --color-border: rgba(255,255,255,0.08);
  --color-text: #e8e8f0;
  --color-text-muted: #8888a0;
  --color-accent: #6366f1;
  --color-accent-light: rgba(99,102,241,0.15);
  --radius: 10px;
  --radius-sm: 6px;
}
```

JS 逻辑：
```javascript
// 1. fetch('./data/trends.json')
// 2. 渲染 Tab 按钮
// 3. 渲染当前板块卡片
// 4. Tab 切换事件
// 5. 点评折叠/展开事件
```

**Step 2: 在浏览器打开 tools/trends/index.html 验证**
- 五个 Tab 可切换
- 卡片正常显示
- 点评可折叠

**Step 3: Commit**
```bash
git add tools/trends/index.html
git commit -m "feat: 添加热点快照展示页面"
```

---

### Task 3: 注册到主页 Tab 系统

**Files:**
- Modify: `index.html`（两处：tab 按钮 + panel）

**Step 1: 在 Tab 按钮列表末尾添加（约第 204 行，`<!-- More tabs can be added here -->` 前）**

```html
<button class="tool-tab" id="tab-trends" onclick="switchTool('trends')">
    📈 热点快照
</button>
```

**Step 2: 在 panel 区域末尾添加（约第 368 行，前沿雷达 panel 之后）**

```html
<div class="tool-panel hidden" id="panel-trends">
    <div class="dashboard-header">
        <span class="dashboard-label">📈 热点快照 · AI & 科技热榜 · Claude 点评</span>
        <a href="tools/trends/index.html" target="_blank" class="btn btn-ghost dashboard-open-btn">↗ 独立窗口打开</a>
    </div>
    <iframe src="tools/trends/index.html" class="dashboard-iframe"
        title="热点快照" loading="lazy"></iframe>
</div>
```

**Step 3: 在浏览器验证**
- 主页 AI 工具箱区域出现「📈 热点快照」Tab
- 点击后 iframe 正常加载

**Step 4: Commit**
```bash
git add index.html
git commit -m "feat: 注册热点快照到主页 Tab 系统"
```

---

### Task 4: 创建 README.md

**Files:**
- Create: `tools/trends/README.md`

**Step 1: 写入内容**

```markdown
# 热点快照

AI & 科技领域五大平台实时热榜，含 Claude 视角点评。

## 数据板块
- ⚡ GitHub AI 热榜
- 🚀 Product Hunt 本月
- 🔥 HN 热议
- 🌍 出海 AI 动态
- 🇨🇳 国内 AI 热点

## 数据更新
运行 `/update-trends` skill，Claude 联网搜索后自动写入 `data/trends.json`。

## 文件结构
- `index.html` — 展示页面
- `data/trends.json` — 热点数据
```

**Step 2: Commit**
```bash
git add tools/trends/README.md
git commit -m "docs: 添加热点快照 README"
```

---

### Task 5: 创建 /update-trends skill

**Files:**
- Create: `.claude/skills/update-trends.md`

**Step 1: 写入 skill 定义**

```markdown
# Update Trends

当用户说「更新热榜」「刷新热点」「/update-trends」时使用此 skill。

## 执行步骤

1. 并行搜索五个板块的最新热点：
   - GitHub Trending AI 项目（本周）
   - Product Hunt 本月榜单
   - Hacker News 热议话题
   - 出海 AI 动态（Twitter/X + 独立媒体）
   - 国内 AI 热点（36Kr + 知乎 + 微博）

2. 每个板块提取 3-8 条热点，每条包含：
   - rank（排名）
   - title（标题）
   - summary（一句话描述，≤30字）
   - insight（Claude 点评，≤80字，PM 视角）
   - url（来源链接）
   - source（平台名称）
   - tags（2-3个标签）

3. 生成完整 trends.json，updated_at 设为今天日期

4. 写入 tools/trends/data/trends.json（覆盖原文件）

5. 告知用户更新完成，简述各板块亮点
```

**Step 2: Commit**
```bash
git add .claude/skills/update-trends.md
git commit -m "feat: 添加 /update-trends skill"
```

---

### Task 6: 在前沿雷达页面添加入口链接

**Files:**
- Modify: `tools/radar/index.html`

**Step 1: 在页面底部 footer 或合适位置添加链接**

找到 radar/index.html 的底部区域，添加：
```html
<div style="text-align:center;padding:20px;border-top:1px solid var(--color-border);margin-top:32px;">
  <a href="../trends/index.html"
     style="color:var(--color-accent);text-decoration:none;font-size:0.9rem;">
    📈 查看热点快照 →
  </a>
</div>
```

**Step 2: 验证链接跳转正常**

**Step 3: Commit**
```bash
git add tools/radar/index.html
git commit -m "feat: 前沿雷达添加热点快照入口链接"
```
