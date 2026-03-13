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
index.html          # 主页面，所有区块都在这里
assets/css/style.css    # 全局样式 + Design Tokens（CSS 变量）
assets/js/main.js       # 导航、动画、案例数据
assets/js/interview.js  # 面试练习器逻辑
tools/dashboard/        # 求职追踪 Dashboard
tools/ai-insights/      # AI 产品洞察工具
content/                # Markdown 内容资料（不是代码）
docs/                   # 个人文档（.gitignore 排除）
```

## 已有工具模块
| 工具 | 路径 | 功能 |
|------|------|------|
| 求职 Dashboard | `tools/dashboard/index.html` | 投递表格 + 漏斗图 + 待办 |
| AI Insights | `tools/ai-insights/index.html` | AI 产品洞察展示 |
| 面试练习器 | `assets/js/interview.js` | 20 题练习，内嵌在主页 |
| ESOP 字段提取 Demo | `tools/esop-extractor/index.html` | ESOP 文件字段提取演示 |

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
- 怀疑代码偏离规范时使用 `/code-health-check` skill
- 文档和代码不同步时使用 `/sync-docs` skill
- 保持最小改动，不要顺手重构没有被要求改的代码
