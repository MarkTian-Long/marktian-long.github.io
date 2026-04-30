---
name: code-health-check
description: 检查项目代码是否偏离规范，发现潜在的"屎山"风险。当用户感觉代码乱了、或定期维护时使用。
---

# 代码健康检查

检查范围：$ARGUMENTS（留空则检查整个项目）

## 检查项目

### 1. CSS 规范检查
读取 `assets/css/style.css`，检查：
- 是否存在硬编码颜色值（如 `#xxx`, `rgba(...)` 出现在变量定义之外）
- 是否有重复定义的样式
- CSS 变量是否都在 `:root` 中统一定义

读取各工具的 CSS（`tools/*/style.css` 或内嵌 `<style>`），检查：
- 是否重复定义了主页面已有的通用样式
- 颜色是否与主页面设计系统一致

### 2. 目录结构检查
检查 `tools/` 下每个工具目录：
- 是否有 `README.md`
- 是否有 `index.html`
- 是否存在孤立文件（无对应工具目录的散落文件）

检查根目录：
- 是否有不属于规范结构的文件（JS/CSS/图片不在 `assets/` 下）

### 3. JS 代码检查
读取 `assets/js/main.js` 和各工具 JS：
- 是否有全局变量污染（在 `window` 上直接挂载变量）
- 函数命名是否遵循 camelCase
- 常量是否使用 UPPER_SNAKE_CASE
- localStorage Key 是否符合 `qiuzhi_<模块>_<版本>` 格式

### 4. 工具独立性检查
抽查 1-2 个工具的 `index.html`：
- 是否引用了主页面的 CSS 文件路径（如 `../../assets/css/style.css`）
- 如果是，该工具就失去了独立运行能力，需要修复

### 5. index.html 一致性检查
读取 `index.html`：
- `tool-tabs` 中的 Tab 数量是否与 `tools/` 目录下的工具数量一致
- 是否存在注册了 Tab 但没有对应 Panel 的情况（或反过来）

### 6. 博客双主题规范检查
读取 `tools/blog/index.html`（或其内联 CSS）：
- 是否同时定义了 `:root`（浅色）和 `[data-theme="dark"]`（深色）两套变量？
- 主题切换状态是否使用 `blog_theme` 作为 localStorage key？
- 初始化逻辑是否优先读 localStorage，其次回退到 `prefers-color-scheme`？
- CSS 是否**自包含**，没有依赖 `../../assets/css/style.css` 的变量名？

读取 `tools/blog/data/posts-meta.json`：
- 每条条目是否包含完整字段：`slug/date/title/summary/tags/category/url`？
- 是否有空字段或格式不符（如 date 非 `YYYY.MM`）？

## 输出格式

### 健康报告
```
## 代码健康检查报告

### 发现的问题
1. [严重] xxx 文件存在硬编码颜色 `#1a1a2e`，应使用 `var(--bg-primary)`
2. [中等] tools/ai-insights/ 缺少 README.md
3. [轻微] localStorage key `jobs` 不符合命名规范，建议改为 `qiuzhi_jobs_v1`

### 建议修复顺序
先修 [严重]，再修 [中等]，[轻微] 可以积累后一起处理。

### 整体评价
当前代码健康度：[良好 / 需要关注 / 建议重构]
```

询问用户是否要立即修复发现的问题。修复时每次只改一个问题，改完确认再继续。
