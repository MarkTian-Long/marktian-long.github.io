# 组件用法说明 + HTML 模板

所有组件依赖 `01-design-tokens.css` + `02-base-components.css`。

---

## 1. Hero 区块

```html
<section class="hero">
  <!-- 右侧漂浮大字装饰（可选，替换为品牌字母） -->
  <div class="hero-bg">
    <div class="hero-deco-char">L</div>
  </div>

  <div class="hero-content">
    <!-- 状态徽章（可选） -->
    <div class="hero-badge">
      <span class="badge-dot"></span>
      Open to opportunities
    </div>

    <!-- 眉标（可选） -->
    <p class="hero-eyebrow">AI · Product · Builder</p>

    <!-- 主标题：用 <em> 或 .grad-text 强调关键词 -->
    <h1 class="hero-title">
      Building for<br>
      the <span class="grad-text">AI era</span>
    </h1>

    <!-- 副标题 -->
    <p class="hero-sub">一句话定位描述，说明你是谁、做什么。</p>

    <!-- 手写感副句（可选） -->
    <p class="hero-manifesto">简短的价值主张或信条。</p>

    <!-- CTA 按钮组 -->
    <div class="hero-actions">
      <a href="#work" class="btn btn-primary">查看作品</a>
      <a href="#contact" class="btn btn-ghost">联系我</a>
    </div>
  </div>

  <!-- 滚动提示（可选） -->
  <div class="hero-scroll-hint">
    <div class="scroll-mouse">
      <div class="scroll-wheel"></div>
    </div>
  </div>
</section>
```

---

## 2. Section 标题组

```html
<div class="section-header">
  <!-- 小标签（陶土色） -->
  <span class="section-label">ABOUT</span>
  <!-- 主标题（衬线字体） -->
  <h2 class="section-title">关于我</h2>
  <!-- 描述（可选） -->
  <p class="section-desc">简短的区块描述，不超过 2 句话。</p>
</div>

<!-- 居中版本 -->
<div class="section-header section-header--center">
  <span class="section-label">TOOLS</span>
  <h2 class="section-title">工具箱</h2>
</div>
```

---

## 3. Glass Card（通用卡片）

```html
<div class="glass-card" style="padding: 32px;">
  <h3>卡片标题</h3>
  <p>卡片内容</p>
</div>
```

---

## 4. 观点折叠条目（view-item）

```html
<div class="view-list">
  <div class="view-item" tabindex="0" onclick="this.classList.toggle('open')">
    <div class="view-head">
      <span class="view-num">01</span>
      <span class="view-lead">核心判断一句话，30 字以内</span>
      <span class="view-tag">标签</span>
      <span class="view-date">2026.05</span>
      <span class="view-toggle">展开 ▾</span>
    </div>
    <div class="view-body">
      <div style="padding: 20px 0 8px 3.8rem;">
        <p style="color: var(--text-secondary); line-height: 1.8; font-size: 0.92rem;">
          详细论述内容放在这里……
        </p>
      </div>
    </div>
  </div>
</div>

<!-- 展开/收起逻辑（JS） -->
<script>
document.querySelectorAll('.view-item').forEach(item => {
  item.addEventListener('click', () => item.classList.toggle('open'));
  item.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); item.classList.toggle('open'); }
  });
});
</script>
```

---

## 5. 导航栏

```html
<nav class="navbar" id="navbar">
  <div class="nav-inner">
    <a href="#" class="nav-logo">
      <span class="logo-text">Name</span>
      <span class="logo-dot">·</span>
      <span class="logo-sub">副标题</span>
    </a>

    <ul class="nav-links" id="navLinks">
      <li><a href="#about"  class="nav-link">关于</a></li>
      <li><a href="#work"   class="nav-link">作品</a></li>
      <li><a href="#contact" class="nav-link">联系</a></li>
    </ul>

    <!-- 移动端汉堡按钮 -->
    <button class="nav-toggle" id="navToggle" aria-label="打开菜单">
      <span></span><span></span><span></span>
    </button>
  </div>
</nav>

<!-- 滚动变色 + 汉堡菜单 JS -->
<script>
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 50);
});
document.getElementById('navToggle').addEventListener('click', () => {
  document.getElementById('navLinks').classList.toggle('open');
});
</script>
```

---

## 6. 状态徽章

```html
<span class="status-badge status-blue">进行中</span>
<span class="status-badge status-green">已完成</span>
<span class="status-badge status-yellow">待处理</span>
<span class="status-badge status-red">已拒绝</span>
<span class="status-badge status-purple">面试中</span>
```

---

## 7. 工具卡片直链（works-item）

```html
<div class="works-list">
  <a class="works-item" href="tools/xxx/index.html" target="_blank">
    <span class="works-icon">🎯</span>
    <div class="works-body">
      <span class="works-title">工具名称</span>
      <span class="works-desc">一句话核心能力描述</span>
    </div>
    <span class="works-arrow">↗</span>
  </a>
</div>
```

---

## 8. iframe 嵌入面板

```html
<div class="dashboard-wrapper">
  <div class="dashboard-topbar">
    <span class="dashboard-label">🛠 工具名称</span>
    <a href="tools/xxx/index.html" target="_blank" class="btn btn-ghost dashboard-open-btn">
      独立窗口打开 ↗
    </a>
  </div>
  <iframe
    class="dashboard-iframe"
    src="tools/xxx/index.html"
    title="工具名称"
    loading="lazy"
  ></iframe>
</div>
```

---

## 9. 滚动入场动画

```html
<!-- 给需要动画的元素加 .reveal，可选 .delay-1~4 -->
<div class="reveal delay-1">内容</div>
<div class="reveal delay-2">内容</div>

<script>
const observer = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      observer.unobserve(e.target);
    }
  });
}, { threshold: 0.1 });
document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
</script>
```

---

## 10. 页面完整 HTML 骨架

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>页面标题</title>

  <!-- Google Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Source+Sans+3:wght@300;400;500;600;700&display=swap" rel="stylesheet">

  <!-- Design System -->
  <link rel="stylesheet" href="01-design-tokens.css">
  <link rel="stylesheet" href="02-base-components.css">
  <link rel="stylesheet" href="03-layout-patterns.css">
  <link rel="stylesheet" href="04-animation.css">
</head>
<body>

  <!-- 导航 -->
  <nav class="navbar" id="navbar">...</nav>

  <!-- Hero -->
  <section class="hero" id="home">...</section>

  <!-- 内容区块（交替背景） -->
  <section class="section about-section" id="about">
    <div class="container">
      <div class="section-header">...</div>
      ...
    </div>
  </section>

  <!-- Footer -->
  <footer class="footer">
    <div class="container">
      <p>© 2026 Name. All rights reserved.</p>
    </div>
  </footer>

</body>
</html>
```
