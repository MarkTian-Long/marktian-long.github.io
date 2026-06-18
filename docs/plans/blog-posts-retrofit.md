# 博客存量文章改造计划（阶段二）

## 前置条件

本计划依赖阶段一规范文件已写入：`tools/blog/WRITING_GUIDE.md`

执行前请先确认 WRITING_GUIDE.md 已包含以下章节：
- 第一章：标签体系扩展规范（双维度：`tags` 视角 + `topics` 话题）
- 第二章：相关文章推荐规范（评分策略 + HTML/JS/CSS 模板）
- 第三章：上一篇/下一篇导航规范（模板）
- 第四章：分享功能规范（OG meta + 复制链接按钮模板）

---

## 改造范围

存量文章列表（12 篇，按日期倒序）：

| slug | 文件路径 | 分类 | 现有 tags |
|------|----------|------|-----------|
| manus-agent-analysis | posts/manus-agent-analysis.html | 产品 | 行业洞察 |
| openclaw-brand-creation | posts/openclaw-brand-creation.html | 商业 | 产品框架 |
| enterprise-ai-three-stages | posts/enterprise-ai-three-stages.html | 产品 | 产品框架 |
| memory-system | posts/memory-system.html | 技术 | 架构设计 |
| harness-engineering | posts/harness-engineering.html | 技术 | 工程演进 |
| agent-three-problems | posts/agent-three-problems.html | 技术 | 工程演进 |
| market-landscape-2026 | posts/market-landscape-2026.html | 商业 | 市场格局 |
| tech-obsolescence | posts/tech-obsolescence.html | 商业 | 技术判断 |
| rag-evolution | posts/rag-evolution.html | 技术 | 工程演进 |
| skill-system-and-harness | posts/skill-system-and-harness.html | 技术 | 架构设计 |
| finetuning-evolution | posts/finetuning-evolution.html | 技术 | 工程演进 |
| prompt-engineering-lifecycle | posts/prompt-engineering-lifecycle.html | 技术 | 工程演进 |

---

## 每篇文章改造清单（3 项）

### 改造项 1：补 OG meta 标签

在每篇文章 `<head>` 内，`<title>` 标签之后插入：

```html
<meta property="og:type"        content="article" />
<meta property="og:title"       content="【文章标题】" />
<meta property="og:description" content="【文章摘要，同 posts-meta.json 中 summary 字段】" />
<meta property="og:url"         content="https://liu-yang.me/tools/blog/posts/【slug】.html" />
<meta name="twitter:card"       content="summary" />
<meta name="twitter:title"      content="【文章标题】" />
<meta name="twitter:description" content="【文章摘要】" />
```

> 域名以实际部署地址为准，执行时确认。

---

### 改造项 2：补 POST_META + 相关推荐 + 上下篇导航模块

在每篇文章 `</main>` 之前（`.post-body` 之后）插入 HTML 结构，并在 `</body>` 前补充 JS。

**HTML（插入位置：`.post-body` 闭合标签之后）：**

```html
<!-- 相关文章 -->
<div class="related-posts" id="relatedPosts" style="display:none">
  <div class="related-title">相关文章</div>
  <div class="related-list" id="relatedList"></div>
</div>

<!-- 上下篇导航 -->
<nav class="post-nav" id="postNav">
  <a class="post-nav-prev" id="navPrev" style="display:none" href="#">
    <span class="nav-label">← 上一篇</span>
    <span class="nav-title" id="navPrevTitle"></span>
  </a>
  <a class="post-nav-next" id="navNext" style="display:none" href="#">
    <span class="nav-label">下一篇 →</span>
    <span class="nav-title" id="navNextTitle"></span>
  </a>
</nav>
```

**JS（插入位置：`</body>` 前，TOC 脚本之后）：**

```javascript
// 相关文章 + 上下篇导航（从 posts-meta.json 动态加载）
var POST_META = {
  slug: '【当前文章 slug】',
  tags: ['【tags 字段值】'],
  topics: ['【topics 字段值，参照 WRITING_GUIDE 第一章标签库填写】'],
  category: '【技术|产品|商业】'
};

(async function() {
  var data = await fetch('../data/posts-meta.json').then(function(r) { return r.json(); });
  var posts = data.posts;

  // 相关文章推荐
  if (posts.length >= 5) {
    var scored = posts
      .filter(function(p) { return p.slug !== POST_META.slug; })
      .map(function(p) {
        var score = 0;
        (p.topics || []).forEach(function(t) { if ((POST_META.topics||[]).includes(t)) score += 3; });
        (p.tags || []).forEach(function(t) { if ((POST_META.tags||[]).includes(t)) score += 2; });
        if (p.category === POST_META.category) score += 1;
        return Object.assign({}, p, { score: score });
      })
      .filter(function(p) { return p.score >= 1; })
      .sort(function(a, b) { return b.score - a.score || b.date.localeCompare(a.date); })
      .slice(0, 2);

    if (scored.length) {
      var list = document.getElementById('relatedList');
      list.innerHTML = scored.map(function(p) {
        return '<a class="related-item" href="' + p.url + '">' +
          '<span class="related-item-date">' + p.date + '</span>' +
          '<span class="related-item-title">' + p.title + '</span>' +
          '</a>';
      }).join('');
      document.getElementById('relatedPosts').style.display = 'block';
    }
  }

  // 上下篇导航
  var sorted = posts.slice().sort(function(a, b) { return b.date.localeCompare(a.date); });
  var idx = sorted.findIndex(function(p) { return p.slug === POST_META.slug; });
  var prev = idx > 0 ? sorted[idx - 1] : null;
  var next = idx < sorted.length - 1 ? sorted[idx + 1] : null;
  if (prev) {
    var el = document.getElementById('navPrev');
    el.href = prev.url;
    document.getElementById('navPrevTitle').textContent = prev.title;
    el.style.display = 'flex';
  }
  if (next) {
    var el2 = document.getElementById('navNext');
    el2.href = next.url;
    document.getElementById('navNextTitle').textContent = next.title;
    el2.style.display = 'flex';
  }
})();
```

**CSS（加入文章 inline `<style>`，双主题变量已自包含）：**

```css
/* 相关文章 */
.related-posts { margin-top: 2.5rem; padding-top: 1.5rem; border-top: 1px solid var(--border); }
.related-title { font-size: .75rem; letter-spacing: .08em; text-transform: uppercase; color: var(--text-2); margin-bottom: 1rem; }
.related-item { display: flex; gap: .75rem; align-items: baseline; padding: .5rem 0; text-decoration: none; }
.related-item:hover .related-item-title { color: var(--clay); }
.related-item-date { font-size: .75rem; color: var(--text-2); white-space: nowrap; }
.related-item-title { font-size: .9rem; color: var(--text-1); }

/* 上下篇导航 */
.post-nav { display: flex; justify-content: space-between; gap: 1rem; margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px solid var(--border); }
.post-nav a { display: flex; flex-direction: column; gap: .25rem; text-decoration: none; max-width: 45%; }
.post-nav-next { align-items: flex-end; margin-left: auto; }
.nav-label { font-size: .75rem; color: var(--text-2); }
.nav-title { font-size: .875rem; color: var(--text-1); }
.post-nav a:hover .nav-title { color: var(--clay); }
```

---

### 改造项 3：补顶部复制链接按钮

在每篇文章 `.top-bar` 内，主题切换按钮左侧插入：

```html
<button class="share-btn" id="shareBtn" title="复制链接">
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
  </svg>
</button>
```

**JS（加入同一 `<script>` 块）：**

```javascript
document.getElementById('shareBtn').addEventListener('click', function() {
  navigator.clipboard.writeText(window.location.href).then(function() {
    var btn = document.getElementById('shareBtn');
    btn.setAttribute('title', '已复制！');
    setTimeout(function() { btn.setAttribute('title', '复制链接'); }, 2000);
  });
});
```

**CSS（加入 inline `<style>`）：**

```css
.share-btn { background: none; border: none; cursor: pointer; color: var(--text-2); padding: .25rem; display: flex; align-items: center; }
.share-btn:hover { color: var(--text-1); }
```

---

## posts-meta.json 补充 topics 字段

新文章起在 JSON 条目中加 `"topics"` 字段，存量文章无需强制回填（推荐模块降级用 `tags` 匹配）。

**建议的话题标签对照（供回填时参考）：**

| slug | 建议 topics |
|------|-------------|
| manus-agent-analysis | `["Agent"]` |
| openclaw-brand-creation | `["产品设计"]` |
| enterprise-ai-three-stages | `["企业AI"]` |
| memory-system | `["Agent"]` |
| harness-engineering | `["Agent"]` |
| agent-three-problems | `["Agent"]` |
| market-landscape-2026 | `["企业AI"]` |
| tech-obsolescence | `["企业AI"]` |
| rag-evolution | `["RAG"]` |
| skill-system-and-harness | `["Agent"]` |
| finetuning-evolution | `["Fine-tuning"]` |
| prompt-engineering-lifecycle | `["提示工程"]` |

---

## 执行顺序建议

1. 先改 `posts-meta.json`（补 topics 字段）
2. 逐篇改造文章（可用并行 Agent 处理多篇，参考 `/dispatching-parallel-agents`）
3. 改造完成后在浏览器逐篇验证：相关推荐是否出现、上下篇链接是否正确、复制按钮是否可用
4. 用 `/verification-before-completion` 做最终检查

---

## 待讨论：正文视觉节奏优化

**问题**：纯文字长文视觉单调，读者容易疲惫。

**已排除的方案**：
- blockquote / pull quote：语义不对，正文摘句重复一遍显得多余
- 分隔符 `···`：读者不知道为什么有的地方有有的地方没有，规则不透明
- 颜色强调：现有样式层次（标题/加粗/正文/链接）已经四种，再加颜色是第五种
- 斜体加粗：中文斜体渲染差；整句加粗和行内词语加粗混用会弱化两者信号

**待讨论的方向**：还没有找到合适的方案，下次继续讨论。核心约束是：不增加新的文字样式种类，不重复正文内容，视觉规则对读者透明。

---

## 验证检查项

- [ ] 每篇文章 OG meta 中 `og:url` 域名与实际部署地址一致
- [ ] 相关推荐：文章数 ≥ 5 时出现，推荐文章与当前文章话题相关
- [ ] 相关推荐：`topics` 缺失时降级用 `tags` 匹配，不报错
- [ ] 上下篇：首篇无「下一篇」，末篇无「上一篇」，边界正常
- [ ] 复制链接：点击后 title 变为「已复制！」，2 秒后复原
- [ ] 深色/浅色主题下样式均正常
