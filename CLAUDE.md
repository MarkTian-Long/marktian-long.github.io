# qiuzhi - 个人品牌网站

## 项目概览
刘洋的 AI 产品经理个人求职网站。纯前端，零依赖，无构建工具。

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
tools/esop-extractor/config.local.js  # 本地 API key 配置（.gitignore 排除）
scripts/                        # 本地脚本（fetch-trends.js 爬虫）
content/                        # Markdown 内容资料（不是代码）
docs/                           # 个人文档（.gitignore 排除）
.claude/skills/                 # Claude skill 定义
```

## 已有工具模块
工具箱分两组展示（`信息工具` 在左，`PM 作品` 在右），默认展示 AI 产品拆解。

| 工具 | 路径 | 功能 | 分组 |
|------|------|------|------|
| AI 产品拆解 | `tools/ai-insights/index.html` | 产品卡片 + 七 Tab 深度拆解 | 信息工具（默认） |
| 前沿雷达 | `tools/radar/index.html` | 信息源导航（中/英分栏）+ 精选 AI 工具列表 | 信息工具 |
| 热点快照 | `tools/trends/index.html` | 五大平台热榜（GitHub/HN/PH/出海/国内）+ Claude 点评 | 信息工具 |
| ESOP 字段提取 Demo | `tools/esop-extractor/index.html` | ESOP 文件字段提取演示 | PM 作品 |
| A股 AI 助手 | `tools/stock/index.html` | 自然语言查询 A股/指数行情，Yahoo Finance 数据 + AI 解读 | PM 作品 |
| 求职 Dashboard | `tools/dashboard/index.html` | 投递表格 + 漏斗图 + 待办 | 隐藏（dev only） |
| 产品信息采集器 | `tools/product-collector/index.html` | 结构化表单 → JSON，localStorage 草稿 | 隐藏（dev only） |
| 面试练习器 | `assets/js/interview.js` | 20 题练习，内嵌在主页 | 隐藏（dev only） |

## 核心规范（必须遵守）
- CSS 颜色/间距**必须用 CSS 变量**，禁止硬编码色值
- 新工具放 `tools/<name>/`，必须能独立运行
- 每个工具必须有 `README.md`
- 工具注册到 `index.html` 的 tab 系统（`switchTool()` 函数）
- Commit 格式：`feat/fix/style/refactor/docs/chore: 描述`

## 常见修改位置
- 个人联系方式：`index.html` 搜索 `your@email.com`
- 产品案例：`assets/js/main.js` → `casesData` 数组
- AI 产品数据：`tools/ai-insights/data/products.json`

## 给 Claude 的工作指令
- 修改代码前先读相关文件，不要靠猜
- 样式改动必须用已有 CSS 变量，需要新变量时先在 `:root` 定义
- 添加新工具时使用 `/add-tool` skill
- 采集新 AI 产品数据时使用 `/analyze-product 产品名` skill（联网搜索 → 生成 JSON → 写入 products.json）
- 更新热点快照数据时：先运行 `cd scripts && node fetch-trends.js`（自动抓取 GitHub/HN/36Kr），再使用 `/update-trends` skill 补充 Product Hunt + Claude 点评
- ESOP 工具内置 key 配置在 `tools/esop-extractor/config.local.js`（不进 git），修改此文件而非 index.html
- A股助手 key 配置在 `tools/stock/config.local.js`（不进 git），修改此文件而非 index.html
- 线上部署的 key 存在 GitHub Secrets，由 `.github/workflows/deploy.yml` 在构建时注入：
  - `ESOP_API_KEY` → tools/esop-extractor/config.local.js
  - `STOCK_OPENROUTER_KEY` → tools/stock/config.local.js
  - 换 key 去 Settings → Secrets 改，改完重新触发 Actions 即可
- 怀疑代码偏离规范时使用 `/code-health-check` skill
- 文档和代码不同步时使用 `/sync-docs` skill
- 保持最小改动，不要顺手重构没有被要求改的代码
