# Writing Guide — 博客规范文件

本文件定义「思考碎片」博客的元数据、结构、命名和更新规范，所有文章必须遵守。

---

## 文章元数据规范

每篇文章的 `<head>` 注释中必须包含以下元数据：

```
date:    YYYY.MM（年月，精确到月即可）
title:   简洁动词短语或判断句，不超过 20 字
tags:    从固定标签库选择（见下方）
slug:    kebab-case，对应 posts/xxx.html 文件名
summary: 1-2 句，概括核心观点，用于列表页展示
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

---

## 文章结构规范

```
一、核心判断（总）
   1 段，200 字以内
   读者只读这段也能理解核心观点

二、展开论证（分）
   2-4 段，每段聚焦一个支撑维度
   可用小标题区分，避免每段都是叙述型，要有判断

三、结论与影响（总，可选）
   1 段，说明对 AI PM 实践的实际意义
```

---

## 文件命名规范

- 文件名：`{topic-keyword}.html`，英文 kebab-case
- 不用日期前缀（归档靠 `index.html` 的 JS 数据管理）
- 示例：`tech-obsolescence.html`、`harness-engineering.html`

---

## 新增文章操作流程

1. 在 `tools/blog/posts/` 下新建 HTML 文件，参照现有文章的模板
2. 在 `tools/blog/index.html` 的 `posts` 数组里加一行：
   ```javascript
   { date: '2026.MM', title: '文章标题', tags: ['标签'], url: 'posts/xxx.html', summary: '摘要' }
   ```
3. 在主页 `index.html` 的 `blogPosts` 数组里加同一行（保持同步）
4. `git add tools/blog/posts/xxx.html`（新文件必须显式 add，否则 GitHub Pages 404）

---

## 样式规范

- CSS 变量完全自包含于文章 HTML 的 `<style>` 标签，不依赖外部 `style.css`
- 配色方案参考 `tools/blog/posts/tech-obsolescence.html` 的 `:root` 定义
- 文章正文用语义 HTML（`<h2>`、`<p>`、`<ul>`、`<code>`），无需 Markdown 解析库
