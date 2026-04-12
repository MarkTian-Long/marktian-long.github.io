# 首页维护手册

> 本文档记录 `index.html`（主页面）的结构和改动规范，方便后续自行维护内容、调整区块、增减工具模块。
> 样式文件：`assets/css/style.css`（深色版本已废弃，当前用浅色版）

---

## 设计系统：Claude Editorial 风格（2026-04 重设计）

当前首页采用 **Claude 品牌设计令牌** + **Editorial 杂志质感**，核心规则：

| 角色 | 颜色值 | CSS 变量 |
|-----|--------|---------|
| 页面背景 | `#f5f4ed`（Parchment 羊皮纸） | `--bg-primary` |
| 次级背景 | `#f0eee6`（Border Cream） | `--bg-secondary` |
| 卡片背景 | `#faf9f5`（Ivory 象牙白） | `--bg-card` |
| 主文字 | `#141413`（Near Black 暖黑） | `--text-primary` |
| 次要文字 | `#5e5d59`（Olive Gray） | `--text-secondary` |
| **陶土强调色** | `#c96442`（Terracotta） | `--accent-clay` |
| **蓝色 CTA** | `#2563eb` | `--accent-blue` |
| 轻边框 | `#f0eee6` | `--border` |
| 重边框 | `#e8e6dc` | `--border-warm` |

**双轨颜色策略：**
- 陶土色 → 思想性元素（section-label 徽章、观点序号、日期、展开链接）
- 蓝色 → 行动性元素（主 CTA 按钮、外链）

**字体系统：**
- `Libre Baskerville`（衬线 display）→ 标题、序号、日期、宣言句（`--font-serif`）
- `Source Sans 3`（人文主义无衬线）→ 正文、导航、描述（`--font`）

---

## 区块地图

```
index.html 区块顺序（从上到下）
│
├── <nav class="navbar">            — 顶部固定导航
├── <section id="hero">             — 首屏：身份 + CTA 按钮
├── <section id="about">            — 我的判断（观点 + 行业落地 + 能力短板）
├── <section id="writing">          — 思考碎片（文章列表，JS 动态渲染）
├── <section id="cases">            — 产品案例（3个脱敏案例）
├── <section id="tools">            — 作品 & 工具（链接卡片列表）
└── <section id="contact">          — 联系我
```

---

## 各区块改动指南

### 导航栏（.navbar）

**改导航链接文字/锚点：**
```html
<a href="#about" class="nav-link">我的判断</a>
```
- 文字直接改 `>文字<`
- 锚点 `href="#xxx"` 对应 section 的 `id`

**加/删导航项：**
- 复制一个 `<a>` 标签，改 href 和文字
- 注意移动端折叠菜单也在同一 `.nav-links` 容器里，无需单独处理

**主题切换按钮**（右侧 ☀️/🌙）：`#themeToggle` — 不要动

---

### Hero 区块（#hero）

**改主标题：** 找 `<h1 class="hero-title">` → 直接改文字
**改副标题：** 找 `<p class="hero-sub">` → 直接改
**改 CTA 按钮：** 找 `<div class="hero-cta">` 下的两个 `<a>` 标签

---

### 我的判断（#about）

内有三个子区块，各自独立：

#### 1. 观点列表（`.view-list`）

每条观点是一个 `.view-item`，点击展开详情（手风琴，同时只展开一条）：
```html
<div class="view-item" onclick="toggleView(this)">
  <div class="view-head">
    <span class="view-num">01</span>
    <span class="view-lead">观点核心句</span>
    <span class="view-tag">标签</span>
    <span class="view-date">2026.03</span>
    <span class="view-toggle">展开</span>
  </div>
  <div class="view-body">
    <p>展开后的详细说明...</p>
    <!-- 可选：链接 -->
    <div class="view-links">
      <a class="view-link-btn" href="..." target="_blank" onclick="event.stopPropagation()">📝 思考碎片：标题</a>
    </div>
  </div>
</div>
```
增/删：直接复制/删除 `.view-item` 块，序号 `view-num` 手动更新

#### 2. 行业落地现状（`.view-extra` 折叠）

两级结构，通过 `onclick="toggleExtra(this)"` 按钮展开：
- **第一层 `.landing-scenes`**：通用场景横排标签（客服/代码/内容/知识库）
- **第二层 `.landing-industries`**：行业进度列表（`.li-row`：名称 + 阶段标签 + 一句说明）

改行业条目：找 `.li-row`，修改 `.li-name`、`.li-stage`（`li-stage--pilot` 或 `li-stage--early`）、`.li-note`

#### 3. 当前能力短板（`.view-extra` 折叠）

`.gap2-list` 下每条是 `.gap2-item`：标题 + 说明 + `.gap2-tags` 场景标签
增/删：直接复制/删除 `.gap2-item` 块

---

### 思考碎片（#writing）

**文章列表由 `assets/js/main.js` 动态渲染**，改文章不要在 HTML 里改。

在 `main.js` 找 `writingData` 数组（或类似命名），格式：
```js
{ title: '标题', date: '2026-03-01', tags: ['Tag1'], url: 'content/xxx.md', desc: '摘要' }
```

新增文章：在数组头部 push 一条新记录。

---

### 产品案例（#cases）

每个案例是 `.case-card`，数据在 `assets/js/main.js` 的 `casesData` 数组。不要直接改 HTML，改 `casesData`。

---

### 作品 & 工具（#tools）

工具从 iframe 嵌入改为卡片链接，点击打开新标签页。

**每个工具的 HTML 结构：**
```html
<a href="tools/xxx/index.html" target="_blank" class="works-item">
  <div class="works-icon">🔧</div>
  <div class="works-info">
    <div class="works-name">工具名称</div>
    <div class="works-desc">一句话描述</div>
  </div>
  <div class="works-arrow">→</div>
</a>
```

**新增工具：**
1. 在 `tools/<name>/` 创建工具（参考 CONVENTIONS.md 的 `/add-tool` 说明）
2. 在 `#tools` section 的 `.works-list` 里复制一个 `<a>` 标签，修改 href、图标、名称、描述

**删除工具：** 直接删对应的 `<a class="works-item">` 整块

---

### 联系（#contact）

改邮箱/微信/链接：找对应 `<a>` 标签直接改

---

## 主题切换系统

| 文件 | 作用 |
|-----|------|
| `assets/css/style.css` | 同时包含浅色（:root）和深色（[data-theme="dark"]）变量 |
| `index.html` 顶部 `<script>` | 防闪烁：读 localStorage，初始化主题 |
| `index.html` `#themeToggle` 按钮 | 点击切换，写 localStorage |

**改默认主题（当前是浅色）：**
把顶部 `<script>` 里的逻辑反转，或在 `<html>` 上加 `data-theme="dark"`。

**持久化 key：** `localStorage.getItem('qiuzhi_theme')` → `'dark'` 或 `''`

---

## 增加新区块

1. 在 `index.html` 合适位置插入 `<section id="new-section" class="section">` 结构
2. 在 `style.css` 的对应位置加样式（按区块顺序组织，见文件注释）
3. 在导航栏 `.nav-links` 里加锚点链接
4. **颜色必须用 CSS 变量**，不能硬编码色值

---

## 常见问题

**Q：改了 index.html 但页面没更新？**
强刷（Ctrl+Shift+R）清除缓存。

**Q：工具页点开是 404？**
检查 `href` 路径是否存在，注意相对路径（相对于 index.html 位置）。

**Q：深色模式下某元素颜色奇怪？**
找 `style.css` 末尾的 `[data-theme="dark"]` 块，添加对应覆写。

**Q：新增工具后 GitHub Pages 404？**
新目录必须 `git add tools/xxx/` 后 push，Pages 才能部署。
