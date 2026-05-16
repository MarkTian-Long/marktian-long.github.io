# qiuzhi - 个人品牌网站

## 项目概览
Leo Liu（刘洋）的个人品牌站，定位为 AI · Product · Builder 的长期思想输出站。纯前端，零依赖，无构建工具。

**入口文件**：`index.html`（唯一入口，锚点导航）
**工具目录**：`tools/<tool-name>/index.html`（iframe 嵌入主页面）
**规范文档**：`CONVENTIONS.md`（完整开发规范，有疑问先查这里）

## 技术栈
- HTML5 + CSS3 + Vanilla JS（零依赖）
- localStorage（数据持久化，Key 格式：`qiuzhi_<模块>_<版本>`）
- 无后端，无构建步骤，浏览器直接打开

## 目录结构（快速定位）
```
index.html                      # 主页面，所有区块都在这里
assets/css/style.css            # 全局样式 + Design Tokens（CSS 变量）
assets/js/main.js               # 导航、动画、案例数据
assets/js/interview.js          # 面试练习器逻辑
tools/dashboard/                # 求职追踪 Dashboard
tools/ai-insights/              # AI 产品拆解展示（含 data/products.json）
tools/product-collector/        # AI 产品信息采集器（手动录入）
tools/radar/                    # 前沿雷达（信息源导航 + 精选工具）
tools/trends/                   # 热点快照（五大平台热榜 + Claude 点评）
tools/service-agent/                # 智能客服中台 Demo（意图路由+多Agent+HITL）
tools/esop-extractor/config.local.js  # 本地 API key 配置（.gitignore 排除）
scripts/                        # 本地脚本（fetch-trends.js 爬虫）
content/                        # Markdown 内容资料（不是代码）
docs/                           # 个人文档（.gitignore 排除）
.claude/skills/                 # 项目自定义 Claude skill 定义
.agents/skills/                 # impeccable 设计 skill（17个，含 audit/polish/typeset 等）
```

## 已有工具模块
工具箱分两组展示：`PM 作品`（2列预览卡片）在上，`信息工具`（3列预览卡片）在下。点击卡片展开对应 iframe。

| 工具 | 路径 | 功能 | 分组 |
|------|------|------|------|
| AI 产品拆解 | `tools/ai-insights/index.html` | 产品卡片 + 七 Tab 深度拆解 | 信息工具（默认） |
| 前沿雷达 | `tools/radar/index.html` | 信息源导航（中/英分栏）+ 精选 AI 工具列表 | 信息工具 |
| 热点快照 | `tools/trends/index.html` | 五大平台热榜（GitHub/HN/PH/出海/国内）+ Claude 点评 | 信息工具 |
| ESOP 字段提取 Demo | `tools/esop-extractor/index.html` | ESOP 文件字段提取演示 | PM 作品 |
| A股 AI 助手 | `tools/stock/index.html` | 6-Tab AI 能力演示：行情/诊断/研报（RAG+Reranking+双层知识库）/雷达/Agent/合规 | PM 作品 |
| 智能客服中台 Demo | `tools/service-agent/index.html` | 5-Tab：意图路由+多 Agent 协作+HITL，两列视角布局（用户视角/系统视角） | PM 作品 |
| ASCI 科研任务执行系统 | `tools/asci/index.html` | 非线性科研 Agent 管线（15节点）+ HITL + 降级策略，浅色主题 | PM 作品（直链） |
| Agent 认知全景 | `tools/agent-hub/index.html` | 4-Tab：框架选型/架构设计/企业提效地图/PM 判断框架 | 信息工具（直链） |
| 求职 Dashboard | `tools/dashboard/index.html` | 投递表格 + 漏斗图 + 待办 | 隐藏（dev only） |
| 产品信息采集器 | `tools/product-collector/index.html` | 结构化表单 → JSON，localStorage 草稿 | 隐藏（dev only） |
| 面试练习器 | `assets/js/interview.js` | 20 题练习，内嵌在主页 | 隐藏（dev only） |

## 核心规范（必须遵守）
- CSS 颜色/间距**必须用 CSS 变量**，禁止硬编码色值
- 新工具放 `tools/<name>/`，必须能独立运行
- 每个工具必须有 `README.md`
- 工具注册到 `index.html` 的 `works-list` 直链卡片区（PM 作品 / 信息工具两组）
- Commit 格式：`feat/fix/style/refactor/docs/chore: 描述`

## 常见修改位置
- 个人联系方式：`index.html` 搜索 `your@email.com`
- 产品案例：`assets/js/main.js` → `casesData` 数组
- AI 产品数据：`tools/ai-insights/data/products.json`
- AI 落地判断模块：`index.html` 搜索 `view-list`，直接编辑 HTML 内的 `.view-item`（观点条目）、`.landing-body`（行业落地两级结构）、`.gap2-list`（能力短板）
- 博客文章元数据：`tools/blog/data/posts-meta.json`（单一来源，主页和列表页都 fetch 读取）

## 给 Claude 的工作指令
- **月度维护提醒**：每次对话开始时，检查 `C:\Users\15517\.claude\projects\D--CS-Coding-qiuzhi\memory\MEMORY.md` 第 3 行的 `<!-- monthly-review: last=... next=YYYY-MM-DD -->` 注释。若今天日期 ≥ next 日期，在第一条回复末尾追加提示：「📋 月度维护已到期（next=YYYY-MM-DD），可输入 /monthly-review 执行。」
- 修改代码前先读相关文件，不要靠猜
- 样式改动必须用已有 CSS 变量，需要新变量时先在 `:root` 定义
- 添加新工具时使用 `/add-tool` skill
- 采集新 AI 产品数据时使用 `/analyze-product 产品名` skill（联网搜索 → 生成 JSON → 写入 products.json）
- 更新热点快照数据时：先运行 `cd scripts && node fetch-trends.js`（自动抓取 GitHub/HN/36Kr），再使用 `/update-trends` skill 补充 Product Hunt + Claude 点评；或直接 `/update-trends` 联网全量搜索更新
- ESOP 工具内置 key 配置在 `tools/esop-extractor/config.local.js`（不进 git），修改此文件而非 index.html
- A股助手 key 配置在 `tools/stock/config.local.js`（不进 git），修改此文件而非 index.html
- 线上部署的 key 存在 GitHub Secrets，由 `.github/workflows/deploy.yml` 在构建时注入：
  - `ESOP_API_KEY` → tools/esop-extractor/config.local.js
  - `STOCK_OPENROUTER_KEY` → tools/stock/config.local.js
  - `SERVICE_OPENROUTER_KEY` → tools/service-agent/config.local.js
  - 换 key 去 Settings → Secrets 改，改完重新触发 Actions 即可
- 怀疑代码偏离规范时使用 `/code-health-check` skill
- UI 视觉美化时：先 `/impeccable` 加载设计知识，再用 `/audit` 诊断，用 `/polish`、`/typeset`、`/layout` 等子命令定向改动
- 文档和代码不同步时使用 `/sync-docs` skill
- 保持最小改动，不要顺手重构没有被要求改的代码
- **大文件写入**（>300行的 HTML/JS）：不要用 Write tool 或 bash heredoc，应把生成脚本写到工具目录（如 `tools/<name>/gen_index.js`），用 `node tools/<name>/gen_index.js` 执行，完成后删除脚本（Windows 下 `/tmp` 不可用，统一用项目内路径）
- **大文件修改**（已存在的大文件）：用 Edit tool 精确替换，每次 Edit 前先重新读取目标区域；涉及一个函数多处改动时，整段替换比小步插入更安全；连续多个 Task 修改同一文件时，注意前 Task 新增的变量/字段会影响后 Task 的代码锚点

## 危险操作 HITL 清单（必须暂停等用户确认）
在执行以下操作前，必须明确告知用户并等待确认，不得自动执行：
- git push / git push --force（推送到远程）
- 删除任何文件或目录（rm、unlink）
- 修改 .github/workflows/ 下的 CI/CD 配置
- 提示用户修改 GitHub Secrets
- git reset --hard 或其他丢弃本地改动的操作
- 修改 config.local.js（API key 文件）

## Skill 选择树（任务类型 → 触发哪个 Skill）
| 场景 | 必用 Skill |
|------|-----------|
| 新建功能/组件 | /brainstorming 然后 /writing-plans，不要直接写代码 |
| 实现已有 plan | /executing-plans 或 /subagent-driven-development |
| 遇到 bug | /systematic-debugging 或 /investigate，禁止不调查直接改代码 |
| 添加新工具页面 | /add-tool |
| 采集 AI 产品数据 | /analyze-product 产品名 |
| 更新热点快照 | /update-trends |
| 套用品牌设计风格 | /brand-design-md 品牌名 |
| 声称完成前 | /verification-before-completion |
| 提交代码前 | /review |
| 代码质量存疑 | /code-health-check |
| 文档与代码不同步 | /sync-docs |
| 样式/UI 改动后 | /design-review 或 /impeccable audit（更细致的设计审查） |
| 安全相关改动 | /insecure-defaults 加 /sharp-edges |
| 2+ 独立并行任务 | /dispatching-parallel-agents |
| 月度维护（记忆+规范+架构） | /monthly-review |

## Skill 管理（项目级 skill 维护指南）

项目级 skill 定义在 `.claude/skills/<name>/SKILL.md`，共 6 个：

| Skill | 用途 | 最近更新 |
|-------|------|----------|
| `add-tool` | 新建工具页面完整流程 | 2026-04 |
| `analyze-product` | 联网采集 AI 产品数据→写入 products.json | 2026-04 |
| `brand-design-md` | 获取品牌 DESIGN.md 规范并生成 UI | 2026-04 |
| `code-health-check` | 代码规范检查（含博客双主题） | 2026-04 |
| `sync-docs` | 代码变更后同步 README/CLAUDE/CONVENTIONS（含博客文档） | 2026-04 |
| `update-trends` | 五大平台热榜联网搜索 → trends.json | 2026-04 |
| `monthly-review` | 月度维护：记忆清理 + 规范文档同步 + 季度架构快照 | 2026-05-13 |

**维护规则：**
- skill 文件必须是 `.claude/skills/<name>/SKILL.md` 目录结构（不能是根目录裸 `.md` 文件）
- 每个 SKILL.md 必须有 `---` frontmatter，包含 `name`/`description`/`type` 字段
- Windows 环境下路径限制：skill 内的 shell 命令禁止使用 `/tmp`，统一用项目内路径（如 `tools/.design-tmp/`）
- 系统级 skill（pbakaus/impeccable 的 17 个设计 skill）由 `skills-lock.json` 哈希锁管理，更新用：`npx skills-manager@latest update`（或重新 install）；不要手动编辑 `.claude/skills/adapt/` 等目录
- 当 skill 的检查项/流程与项目规范出现偏差时，优先更新 skill 文件，同步更新本表格的「最近更新」日期
