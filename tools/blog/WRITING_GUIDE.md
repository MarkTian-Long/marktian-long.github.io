# Writing Guide — 博客规范文件

本文件定义「思考碎片」博客的元数据、结构、命名和更新规范，所有文章必须遵守。

---

## 文章元数据规范

每篇文章的 `<head>` 注释中必须包含以下元数据：

```
date:     YYYY.MM（年月，精确到月即可）
title:    简洁动词短语或判断句，不超过 20 字
tags:     从固定标签库选择（见下方）
slug:     kebab-case，对应 posts/xxx.html 文件名
summary:  1-2 句，概括核心观点，用于列表页展示
category: 技术 | 产品 | 商业（大分类，用于列表页分类导航；「生活/成长」类暂不维护，不使用）
```

### 标签库（可扩展）

每篇最多 2 个标签。标签库随内容主题扩展，**新增前先确认无近义标签**。

**AI 技术方向**

| 标签 | 适用方向 |
|------|----------|
| 产品框架 | 产品设计方法论、决策框架 |
| 工程演进 | 技术栈演进、工程架构趋势 |
| 市场格局 | 竞争态势、行业格局判断 |
| 行业洞察 | 垂直行业的 AI 落地观察 |
| 技术判断 | 对具体技术方向的判断与评估 |
| 架构设计 | 系统架构、技术选型 |
| Agent | Agent 设计、工作流、编排 |

**Builder 方向**

| 标签 | 适用方向 |
|------|----------|
| 独立开发 | 独立产品从 0 到 1、工程实践 |
| 冷启动 | 产品早期增长、首批用户获取 |
| 出海 | 海外市场、本地化、跨境产品 |

**方法论方向**

| 标签 | 适用方向 |
|------|----------|
| 思维框架 | 通用判断框架、认知方法论 |
| 职业判断 | 职业选择、机会评估、个人策略 |

### 文章分类

| 分类 | 适用方向 |
|------|----------|
| 技术 | 架构设计、工程实现、技术选型、模型机制 |
| 产品 | PM 决策框架、产品分析、场景判断、功能设计 |
| 商业 | 市场分析、竞争格局、商业模式、行业趋势 |

---

## 文章结构规范

```
一、核心判断（总）
   1 段，200 字以内
   读者只读这段也能理解核心观点

二、展开论证（分）
   2-4 段，每段聚焦一个支撑维度
   可用小标题区分，避免每段都是叙述型，要有判断

三、实践启示（总，必须）
   用 callout 块收尾，不加 <h2> 小标题
   标题可结合文章受众自定义，推荐形式：<strong>对 [受众] 的启示：</strong> 或 <strong>构建者视角：</strong>
   内容：1-2 句实践意义
```

**callout 收尾示例：**

```html
<!-- AI 技术/产品方向 -->
<div class="callout">
    <strong>对构建者的启示：</strong>评估一个 AI 产品的工程能力，不能只看模型选型和 Prompt 策略，要看它的 Harness 设计……
</div>

<!-- Builder/方法论方向 -->
<div class="callout">
    <strong>构建者视角：</strong>冷启动阶段的核心资源不是代码，而是第一批愿意给你真实反馈的用户……
</div>
```

**注意：**
- callout 必须是文章 `post-body` 内的**最后一个元素**
- 不要在 callout 后面再加 `<h2>` 正文节
- callout 使用 `accent-soft` 背景（`.callout` 类已在各文章 `<style>` 中定义）

---

## 目录（TOC）规范

所有有目录的文章统一使用**左侧 sticky 卡片**（双栏布局）。h2 ≤ 2 个的极短文可不加目录。

| 情况 | 处理方式 |
|------|---------|
| h2 ≤ 2 个 | 可选不加目录，保持单栏 |
| h2 ≥ 3 个 | 统一使用左侧 toc-card 双栏布局（见下方"双栏布局规范"） |

> **历史说明：** 早期存在"模式 B"内联目录（`.toc-inline`），已于 2026-04 全量迁移为左侧 toc-card，禁止新文章使用内联模式。

### 目录文字 vs 正文 h2

目录链接文字和正文 `<h2>` 文字**可以不一致**，通过 `href="#sec-xxx"` 锚点关联。

**规则：**
- 目录文字取**核心关键词**，要求简短、能一眼扫完（建议 ≤ 12 字）
- 正文 h2 可以更长，带破折号说明或情绪表达
- 两者语义必须一致，读者能对应上

**示例（enterprise-ai-three-stages.html）：**

```
目录文字                    正文 h2
──────────────────────────────────────────────────────
用技术复杂度判断……是认知陷阱  →  用技术复杂度判断企业AI成熟度，是一个常见的认知陷阱
第一层：探索期              →  第一层：探索期——真正的问题是"值不值得做"
第二层：交付期              →  第二层：交付期——……
```

---

## 双栏布局规范

适用于 h2 ≥ 3 个的文章（含目录的标准布局）。

### 布局结构

```
div.page-outer（max-width: 1008px; padding: 40px 20px 80px）
├── div.top-bar（返回链接 + 主题切换按钮，max-width:1008px 居中）
└── div.two-col.page-outer（display: grid; grid-template-columns: 220px 1fr; gap: 48px）
    ├── aside.toc-wrap（position: sticky; top: 40px）
    │   └── nav.toc-card（目录卡片，--bg-subtle 底色，1px border，圆角 8px）
    │       ├── span.toc-card-label（"本文目录" 小标题）
    │       └── ul.toc-list > li > a（目录条目，hover/active 用 clay 色 + 左竖线）
    └── main（文章内容区）
        ├── header.post-header
        ├── hr.divider
        └── div.post-body
```

### 目录高亮（JS 模板）

```js
// IntersectionObserver 激活当前节
(function(){
    var sections = document.querySelectorAll('.post-body h2[id]');
    var links = document.querySelectorAll('.toc-list a');
    if (!sections.length || !links.length) return;
    var observer = new IntersectionObserver(function(entries){
        entries.forEach(function(entry){
            if (entry.isIntersecting) {
                var id = entry.target.id;
                links.forEach(function(a){
                    a.classList.toggle('toc-active', a.getAttribute('href') === '#' + id);
                });
            }
        });
    }, { rootMargin: '-20% 0px -70% 0px' });
    sections.forEach(function(s){ observer.observe(s); });
})();
```

- 目录链接 hover / active 用 `var(--clay)` 高亮 + 左侧 3px 竖线
- `h2` 需加 `id` 属性供锚点跳转，同时加 `scroll-margin-top: 60px`

### 响应式规则

```css
@media (max-width: 800px) {
    .two-col { grid-template-columns: 1fr; }
    .toc-wrap { display: none; }  /* < 800px 隐藏左侧目录 */
}
```

### callout 位置规则（长文适用）

长文（双栏布局）中，callout 通常用于最后一节的结尾，但**不强制**作为 `post-body` 的最后一个元素——节内使用也可以。短文（单栏）保留原规范：callout 必须是 `post-body` 的最后元素。

---

## 文件命名规范

- 文件名：`{topic-keyword}.html`，英文 kebab-case
- 不用日期前缀（归档靠 `index.html` 的 JS 数据管理）
- 示例：`tech-obsolescence.html`、`harness-engineering.html`

---

## 新增文章操作流程

1. 在 `tools/blog/posts/` 下新建 HTML 文件（参照现有文章模板）
2. 在 `tools/blog/data/posts-meta.json` 的 `posts` 数组**头部**追加新条目：
   ```json
   {
     "slug": "your-slug",
     "date": "YYYY.MM",
     "title": "...",
     "summary": "...",
     "tags": ["标签1"],
     "category": "技术",
     "url": "posts/your-slug.html"
   }
   ```
3. 主页和列表页自动从 JSON 读取，**无需改动任何 HTML 文件**
4. `git add tools/blog/posts/xxx.html tools/blog/data/posts-meta.json`
   （新文件必须显式 add，否则 GitHub Pages 404）

---

## 本地开发

博客列表页通过 `fetch` 加载 `posts-meta.json`，在 `file://` 协议下会因 CORS 失败。
本地验证需启动 HTTP server：

```bash
python -m http.server 8080
# 然后访问 http://localhost:8080/tools/blog/
```

GitHub Pages 部署后无此问题。

---

## 主题切换

博客支持浅色/深色双主题，列表页和文章页均已支持：

**列表页（`index.html`）：**
- 初始化：优先读 `localStorage` 的 `blog_theme` 值 → 无则跟随 `prefers-color-scheme`
- 切换按钮在左侧导航栏底部（月亮/太阳图标）
- `blog_theme` 取值：`'dark'` = 深色，`''`（空字符串）= 跟随系统浅色

**文章页（`posts/*.html`）：**
- 自动同步列表页的主题设置（读取同一 `localStorage` key）
- 无独立切换按钮，在列表页切换后再进入文章页生效
- 默认值：未设置时显示浅色（`data-theme="light"`）

---

## 观点区支撑材料规范

主页「我的观点」区块（`prediction-item`）可关联支撑材料，格式如下：

```html
<div class="prediction-expand">
    <!-- 思考碎片文章 -->
    <a class="expand-btn-link" href="tools/blog/posts/xxx.html" target="_blank"
       onclick="event.stopPropagation()">📝 思考碎片：文章标题 →</a>
    <!-- 站内工具 -->
    <button class="expand-btn-link" onclick="event.stopPropagation();openTool('tool-id')">🛠 工具：工具名称 →</button>
</div>
```

**规则：**
- 思考碎片链接用 `<a>` + `expand-btn-link`，前缀 `📝 思考碎片：`
- 站内工具用 `<button>` + `expand-btn-link` + `openTool()`，前缀 `🛠 工具：`
- 多个支撑材料横排（`.prediction-expand` 已设 `display:flex; gap:8px`）
- 内部所有交互元素必须加 `onclick="event.stopPropagation()"` 阻止触发父级折叠
- 没有合适资源的观点无需强行补充支撑材料，留空即可

---

## 样式规范

- CSS 变量完全自包含于文章 HTML 的 `<style>` 标签，不依赖外部 `style.css`
- 文章正文用语义 HTML（`<h2>`、`<p>`、`<ul>`、`<code>`），无需 Markdown 解析库
- 字体：正文 `Source Sans 3`，标题 `Libre Baskerville`（衬线）
- 品牌色：clay 橙（`--clay`），深色 `#d97757`，浅色 `#c96442`

### CSS 变量命名规范（文章页标准模板）

```css
/* 深色（默认） */
:root {
    --bg:          #080c18;
    --bg-card:     rgba(255,255,255,0.04);
    --bg-subtle:   rgba(255,255,255,0.07);
    --border:      rgba(255,255,255,0.08);
    --text-1:      #f0f4ff;       /* 主文本 */
    --text-2:      #8a95b5;       /* 次要文本、callout 正文 */
    --text-3:      #4a5270;       /* 辅助文本、日期、小标注 */
    --accent:      #4f8fff;       /* 蓝色，用于链接 focus（保留） */
    --clay:        #d97757;       /* 品牌色：标签、callout strong、hover */
    --clay-soft:   rgba(217,119,87,0.12);
    --tag-bg:      rgba(217,119,87,0.12);
    --tag-text:    #d97757;
    --code-bg:     #0a0f1e;
    --font:        'Source Sans 3', -apple-system, sans-serif;
    --font-serif:  'Libre Baskerville', Georgia, serif;
    --radius:      10px;
    --max-width:   720px;
}
/* 浅色主题 */
[data-theme="light"] {
    --bg:          #f5f4ed;
    --bg-card:     #faf9f5;
    --bg-subtle:   #f0eee6;
    --border:      #e8e6dc;
    --text-1:      #141413;
    --text-2:      #5e5d59;
    --text-3:      #87867f;
    --accent:      #2563eb;
    --clay:        #c96442;
    --clay-soft:   rgba(201,100,66,0.10);
    --tag-bg:      rgba(201,100,66,0.10);
    --tag-text:    #c96442;
    --code-bg:     #ece9e0;
}
```

### 关键组件样式规则

| 组件 | 规则 |
|------|------|
| `.post-title` | `font-family: var(--font-serif)` |
| `.post-summary` | `border-left: 3px solid var(--clay)` |
| `.tag` | `background: var(--tag-bg); color: var(--tag-text)` |
| `.callout` | `background: var(--clay-soft); border: clay 色系` |
| `.callout strong` | `color: var(--clay)` |
| `.back-link:hover` | `color: var(--clay)` |
| `.footer-nav a:hover` | `color: var(--clay)` |

### Google Fonts 引入（每篇文章 `<head>` 必须包含）

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital@0;1&family=Source+Sans+3:wght@400;500;600&display=swap" rel="stylesheet" />
```

### 主题同步 JS（每篇文章 `</body>` 前必须包含）

```html
<script>
(function(){
    var saved = localStorage.getItem('blog_theme');
    document.body.dataset.theme = (saved === 'dark') ? 'dark' : 'light';
})();
</script>
```
