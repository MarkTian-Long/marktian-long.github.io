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
category: 技术 | 产品 | 商业 | 生活（大分类，用于列表页分类导航）
```

### 固定标签库

从以下标签中选择，每篇最多 2 个：

| 标签 | 适用方向 |
|------|----------|
| 产品框架 | 产品设计方法论、决策框架 |
| 工程演进 | 技术栈演进、工程架构趋势 |
| 市场格局 | 竞争态势、行业格局判断 |
| 行业洞察 | 垂直行业的 AI 落地观察 |
| 技术判断 | 对具体技术方向的判断与评估 |
| 架构设计 | 系统架构、技术选型 |
| Agent | Agent 设计、工作流、编排 |

### 文章分类

| 分类 | 适用方向 |
|------|----------|
| 技术 | 架构设计、工程实现、技术选型、模型机制 |
| 产品 | PRD 思路、PM 决策框架、用户研究、功能设计 |
| 商业 | 市场分析、竞争格局、商业模式、行业趋势 |
| 生活 | 个人成长、工作方法、读书笔记 |

---

## 文章结构规范

```
一、核心判断（总）
   1 段，200 字以内
   读者只读这段也能理解核心观点

二、展开论证（分）
   2-4 段，每段聚焦一个支撑维度
   可用小标题区分，避免每段都是叙述型，要有判断

三、对 AI PM 的启示（总，必须）
   用 callout 块收尾，不加 <h2> 小标题
   格式固定：<strong>对 AI PM 的启示：</strong> + 1-2 句实践意义
```

**callout 收尾示例：**

```html
<div class="callout">
    <strong>对 AI PM 的启示：</strong>评估一个 AI 产品的工程能力，不能只看模型选型和 Prompt 策略，要看它的 Harness 设计……
</div>
```

**注意：**
- callout 必须是文章 `post-body` 内的**最后一个元素**
- 不要在 callout 后面再加 `<h2>` 正文节
- callout 使用 `accent-soft` 背景（`.callout` 类已在各文章 `<style>` 中定义）

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

博客列表页支持浅色/深色双主题：
- 初始化：优先读 `localStorage` 的 `blog_theme` 值 → 无则跟随 `prefers-color-scheme`
- 切换按钮在左侧导航栏底部
- 文章页（`posts/*.html`）暂不支持主题切换，固定为深色

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
- 配色方案参考 `tools/blog/posts/tech-obsolescence.html` 的 `:root` 定义
- 文章正文用语义 HTML（`<h2>`、`<p>`、`<ul>`、`<code>`），无需 Markdown 解析库
