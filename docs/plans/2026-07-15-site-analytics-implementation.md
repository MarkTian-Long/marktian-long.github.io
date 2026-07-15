# 网站数据分析接入 Implementation Plan

> **For Codex:** REQUIRED SUB-SKILL: Use `executing-plans` to implement this plan task-by-task.

**Goal:** 在 GitHub Pages 静态站点接入 GA4 和文章级阅读分析，并给出 Search Console 后台配置与验收步骤。

**Architecture:** 公开页面统一加载一个原生 JavaScript 分析模块；模块集中配置 GA4、发送通用和博客专用事件。首页和博客归档页只在用户显式交互时补充来源事件，文章页由 URL 自动识别并发送浏览与阅读深度事件。

**Tech Stack:** HTML5、Vanilla JavaScript、GA4 Google tag、Google Search Console、GitHub Pages。

---

### Task 1: 添加可安全降级的 GA4 分析模块

**Files:**

- Create: `assets/js/analytics.js`
- Test: browser console and GA4 Realtime

**Step 1: 写出配置与隐私约束**

在文件顶部保留唯一的 `GA_MEASUREMENT_ID` 配置位，并注释说明只接受 `G-` 开头的公开 Measurement ID，不能填入账号凭据或密钥。

**Step 2: 实现 tag 装载与事件队列**

实现 `window.trackAnalyticsEvent(name, params)`：当 ID 未配置或浏览器禁止脚本时无异常返回；当 ID 有效时动态加载 Google tag，调用 `gtag('config', id)` 并发送事件。参数过滤规则禁止 `email`、`phone`、`name`、`content` 等可能含个人信息的字段。

**Step 3: 实现文章自动统计**

当 pathname 匹配 `/tools/blog/posts/<slug>.html` 时发送 `blog_article_view`，并以 `IntersectionObserver` 或滚动高度计算首次达到 50% 和 90% 的 `blog_read_depth` 事件。每个阈值在一次页面加载中只能发送一次。

**Step 4: 手工验证降级与事件**

在本地 HTTP server 中验证：未配置 ID 时页面控制台无错误；临时有效 ID 时首页及文章页生成预期 `dataLayer` 调用。

### Task 2: 覆盖所有公开页面和博客文章

**Files:**

- Modify: `index.html`
- Modify: `tools/{ai-insights,radar,trends,agent-hub,asci,service-agent,stock,esop-extractor}/index.html`
- Modify: `tools/blog/index.html`
- Modify: `tools/blog/posts/*.html` (当前 33 篇)
- Modify: `tools/blog/WRITING_GUIDE.md`

**Step 1: 加载共享分析模块**

在每个公开 HTML 的 `</body>` 前加入 `/assets/js/analytics.js` 的 `defer` 脚本引用；保留本页已有脚本顺序。不得向 dev only 工具注入脚本。

**Step 2: 防止未来遗漏**

更新博客写作指南中的文章 HTML 模板和发布检查清单，要求新文章引用共享分析模块；验证 33 篇现有文章均包含该引用。

**Step 3: 验证覆盖范围**

用 `rg` 统计分析脚本引用数量，与公开工具页、博客归档页和文章数量相符；确认没有加入 `config.local.js` 或 secret。

### Task 3: 添加首页与归档页关键互动事件

**Files:**

- Modify: `assets/js/main.js`
- Modify: `index.html`
- Modify: `tools/blog/index.html`

**Step 1: 写出事件调用点**

在 `toggleCaseDetail()` 首次展开时发送 `case_detail_open`；在 `openTool()` 真正打开工具面板时发送 `tool_open`。首页工具直链和联系链接使用不含个人信息的 `data-analytics-*` 属性或事件委托，记录对应类型。

**Step 2: 标注文章入口来源**

首页文章列表点击发送 `blog_article_open`，`source_surface: homepage`；博客归档渲染的文章行点击发送同事件，`source_surface: archive`。`article_slug` 取自元数据而不使用用户输入。

**Step 3: 回归交互**

手工检查案例展开/收起、工具面板开关、文章新标签页打开、联系方式复制和筛选分页；统计调用不得改变既有交互或阻塞跳转。

### Task 4: 配置后台并上线验证

**Files:**

- Modify: `README.md`
- Modify: `tools/blog/README.md`

**Step 1: 由用户创建 GA4 Web data stream**

在 Google Analytics 中创建站点属性，时区设为 `Asia/Shanghai`，提供 `G-` 开头的 Measurement ID。此 ID 是公开标识符；绝不要求账号、密码或 OAuth token。

**Step 2: 填入 Measurement ID 并验证 Realtime**

填入 `assets/js/analytics.js` 后部署。访问首页、工具、博客文章并触发一项互动，在 GA4 Realtime 中确认 page view 和事件。

**Step 3: 配置 Search Console**

添加 `marktian-long.github.io` 属性并采用 HTML meta 验证；以站点验证身份将该属性关联至 GA4 web stream。记录该步骤和指标说明到 README。

**Step 4: 验证文档与代码**

检查 README 和博客 README 说明数据范围、隐私边界、管理入口与历史数据不回填。运行 `git diff --check`、HTML 脚本引用检查，以及本地浏览器控制台检查。
