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

> **摘要 vs 正文导语：** `summary` 字段（列表页摘要）和文章正文第一段（导语）**允许不同**，两者各司其职——摘要负责吸引点击（常用数据/问题钩子），导语负责承接读者情绪（点进来后的第一感受）。两段质量须对等，不能一强一弱。若两段完全相同也可接受，但不要求强制统一。
```

### 双维度标签体系

每篇文章打两个维度的标签，各司其职：

| 维度 | 字段 | 用途 | 前台展示 | 每篇数量 |
|------|------|------|----------|----------|
| 视角类型 | `tags` | 描述文章的核心动作，「这篇在做什么」 | 是 | 1-2 个 |
| 话题领域 | `topics` | 描述文章讨论的具体领域，「在讨论什么」 | 是 | 1-2 个 |

两个字段同时显示在列表页标签徽章上。`tags` 帮读者判断文章的思维方式，`topics` 帮读者按领域找文章。两者描述不同维度，不应出现相同的词。

> **给 Claude 的操作规范：** 每次新增文章时，若现有标签库在 `tags` 或 `topics` 维度无法准确描述文章性质，**不要强行套用近义标签**，应先提出修改方案（新增标签或调整定义）并等待用户确认后再写入。

**`tags` 标签库（视角类型）**

标签描述文章的**核心动作**，而非内容领域。标签库随内容主题扩展，**新增前先确认无近义标签**。

| 标签 | 文章在做什么 | 区分说明 |
|------|------------|---------|
| 竞争判断 | 分析单一产品/事件背后的竞争信号 | 核心词是「竞争」——文章的落点必须是某产品或事件对竞争格局的含义；不涉及竞争的风险评估、行业趋势不属于此标签 |
| 市场格局 | 判断行业整体趋势、竞争重心迁移、多方势力博弈 | 视角跨越多家公司或整个行业；单一产品用「竞争判断」，行业趋势用「市场格局」 |
| 技术判断 | 判断某项技术或技术风险的生命周期、价值与边界 | 结论是「这个技术/这个风险值不值得关注、还有多久消亡、边界在哪」；包含风险评估类文章 |
| 工程演进 | 技术栈/工程范式的整体演进趋势 | 结论是「工程重心在往哪个方向移动」 |
| 决策框架 | 提供任何领域可复用的判断结构 | 核心产出是一个可套用的框架，不限受众是 PM 还是通用 |
| 独立开发 | 独立产品从 0 到 1、工程实践 | — |
| 冷启动 | 产品早期增长、首批用户获取 | — |
| 出海 | 海外市场、本地化、跨境产品 | — |
| 职业判断 | 职业选择、机会评估、个人策略 | — |

> **给 Claude 的打标规范：** 新文章打标前，先看同标签下已有文章列表，确认放进去语义一致再写入。孤立判断容易漂移——「这篇感觉是竞争相关」不够，要问「这篇和 Manus 分析、Claude Design 分析放在一起，读者会觉得是同类文章吗」。

**`topics` 标签库（话题领域）**

按文章的核心技术或场景选择；若两个领域都是核心讨论对象则都打，不强求只选一个。

| 标签 | 适用方向 | 区分说明 |
|------|----------|---------|
| `Agent` | Agent 设计、工作流编排、多 Agent 协作 | 核心讨论 Agent 机制才打，泛提及不打 |
| `RAG` | 检索增强生成、知识库架构 | — |
| `Fine-tuning` | 微调策略、数据工程、模型定制 | — |
| `提示工程` | Prompt 设计、上下文工程、提示生命周期 | — |
| `企业AI` | 企业 AI 落地、采购决策、组织推进 | 侧重落地场景和决策，非技术机制本身 |
| `产品设计` | 产品方法论、竞品分析、功能设计、用户体验 | — |
| `模型能力` | 大模型的能力边界、软性质量、适用场景分析 | 侧重对模型本身能力的判断；区别于 `AI工具`（具体工具产品的有效性）和 `前沿研究`（实验阶段系统） |
| `评测体系` | benchmark 设计、评测方法论、第三方评测生态 | 文章核心必须是评测机制本身，而非具体模型的能力表现 |
| `AI工具` | 已上线 AI 工具/产品的拆解、能力评测、使用实践 | 起点必须是某个具体产品（如 Claude Design、Cursor 等）；泛模型能力分析不属于此标签 |
| `前沿研究` | 以具体研究成果或实验系统为切口的分析 | 起点必须是研究/实验阶段的系统或论文（非生产工具）；区别于 `AI工具`（已上线工具）和 `技术判断` tag（成熟技术的选型判断） |

### 文章分类

| 分类 | 适用方向 |
|------|----------|
| 技术 | 架构设计、工程实现、技术选型、模型机制、训练体系演进 |
| 产品 | PM 决策框架、产品分析、场景判断、功能设计 |
| 商业 | 市场分析、竞争格局、商业模式、行业趋势 |

> **分类判断原则：看核心内容，不看叙事视角。** 一篇文章可以用"竞争格局正在变化"作为叙事框架，但如果核心内容是讲预训练/后训练机制、算力分配比例、工程范式演进，分类就是「技术」而非「商业」。反之，如果核心内容是分析哪家公司会赢、商业模式如何变化，才归「商业」。**叙事角度 ≠ 分类依据。**

> **给 Claude 的操作规范：** 若新文章的内容方向无法清晰归入以上三类，**不要默认选最近似的**，应说明理由并提出是否需要新增分类，等待用户确认。

---

## 文章结构规范

```
一、核心判断（总）
   1 段，200 字以内
   读者只读这段也能理解核心观点

二、展开论证（分）
   2-4 段，每段聚焦一个支撑维度
   可用小标题区分，避免每段都是叙述型，要有判断

三、实践启示（总，按需）
   有可带走的判断框架时，用 callout 块收尾，不加 <h2> 小标题
   正文收尾本身已经完整有力时，不加 callout——强行加反而稀释结尾
   内容：1-2 句实践意义，必须是正文没有凝练成一句话的东西
```

**callout 的判断标准（加还是不加）：**

加 callout 的前提——满足以下任一条：
- 有一个判断框架/公式可以凝练成一句可带走的工具（如 `prompt-engineering`、`agent-three-problems`）
- 有一句话是"所以对你的含义是什么"，正文论证完了但没有点破受众侧的结论
- 文章受众明确，可以点名说给某类人听

不加 callout 的情况：
- 正文末尾已经做了完整有力的总结性收尾，callout 没有增量
- 没有可以凝练的判断框架，只能重复正文已说过的内容

**callout 内容类型（只允许以下三类）：**

| 类型 | 说明 | 示例 |
|------|------|------|
| 判断框架/公式 | 给读者一个带走的工具，一句话能独立使用 | "去掉这个 Prompt，用更强的模型能达到相同效果吗？" |
| 核心论点蒸馏 | 全文最重要的一句判断，适合不看全文的人 | "跑稳的工作流比概念更先进但跑不稳的智能体有用得多" |
| 受众定向建议 | 点名说给某类人听，正文是给所有人的 | "先判断阶段，再谈技术" |

**数据来源声明不属于 callout**，写入 `refs` 区域的前置说明段，或在正文中直接注明。

**callout 收尾示例：**

```html
<!-- 判断框架类 -->
<div class="callout">
    <strong>评估标准：</strong>去掉这个 Prompt，用更强的模型能达到相同效果吗？能——补救型，会消亡；不能——定义型，会留下。
</div>

<!-- 受众定向类 -->
<div class="callout">
    <strong>对构建者的启示：</strong>评估一个 AI 产品的工程能力，不能只看模型选型和 Prompt 策略，要看它的 Harness 设计……
</div>
```

**注意：**
- callout 如果存在，必须是文章 `post-body` 内的**最后一个元素**（双栏长文见「双栏布局规范 → callout 位置规则」，该规则优先）
- 不要在 callout 后面再加 `<h2>` 正文节
- callout 使用 `accent-soft` 背景（`.callout` 类已在各文章 `<style>` 中定义）
- **标题禁止照抄"对 AI PM 的启示"**——每篇结合自己的受众和角度独立起名

**callout 标题命名参考：**

| 文章角度 | 推荐标题形式 | 示例 |
|---------|------------|------|
| AI 技术分析 | 对构建者的启示 | `<strong>对构建者的启示：</strong>` |
| 产品决策框架 | 产品判断框架 | `<strong>产品判断框架：</strong>` |
| 市场/商业分析 | 判断这件事 | `<strong>判断这件事：</strong>` |
| 行业竞争格局 | 竞争视角 | `<strong>竞争视角：</strong>` |
| 通用方法论 | 构建者视角 | `<strong>构建者视角：</strong>` |
| 带具体受众 | 对 [具体角色] 的启示 | `<strong>对独立开发者的启示：</strong>` |

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
├── div.top-bar（返回链接 + 主题切换按钮，两端对齐，max-width:1008px 居中）
└── div.two-col.page-outer（display: grid; grid-template-columns: 220px 1fr; gap: 48px）
    ├── aside.toc-wrap（position: sticky; top: 40px）
    │   └── nav.toc-card（目录卡片，--bg-subtle 底色，1px border，圆角 8px）
    │       ├── span.toc-card-label（"本文目录" 小标题）
    │       └── ul.toc-list > li > a（目录条目，hover/active 用 clay 色 + 左竖线 + clay-soft 背景）
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

- 目录链接 hover / active 用 `var(--clay)` 高亮 + 左侧竖线 + `background: var(--clay-soft)` + `border-radius: 4px`
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
     "topics": ["话题1"],
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

---

## 相关文章推荐规范

**触发条件：** `posts-meta.json` 中 `posts` 数组长度 ≥ 5 时，文章底部显示推荐模块；< 5 篇时不显示。

### 推荐评分策略

```
同 topics 标签，每个 +3 分
同 tags 标签，每个   +2 分
同 category           +1 分
当前文章本身          排除
```

取分最高的 2 篇，分数相同时取 `date` 更近的。最低展示分数 ≥ 1（0 分时不显示推荐模块，宁缺毋滥）。

> **待完善：** 评分权重可根据实际推荐效果调整。

### HTML 模板

插入位置：`.post-body` 闭合标签之后、`</main>` 之前。

```html
<!-- 相关文章 -->
<div class="related-posts" id="relatedPosts" style="display:none">
    <div class="related-title">相关文章</div>
    <div class="related-list" id="relatedList"></div>
</div>
```

### CSS（加入文章 inline `<style>`）

```css
.related-posts { margin-top: 2.5rem; padding-top: 1.5rem; border-top: 1px solid var(--border); }
.related-title { font-size: .75rem; letter-spacing: .08em; text-transform: uppercase; color: var(--text-2); margin-bottom: 1rem; }
.related-item { display: flex; gap: .75rem; align-items: baseline; padding: .5rem 0; text-decoration: none; }
.related-item:hover .related-item-title { color: var(--clay); }
.related-item-date { font-size: .75rem; color: var(--text-2); white-space: nowrap; }
.related-item-title { font-size: .9rem; color: var(--text-1); }
```

### JS 模板

在文章 `<head>` 内定义 `POST_META`（每篇填写），JS 逻辑与上下篇导航共用一次 fetch（见下节）。

```javascript
// 放在 <head> 内或 <script> 顶部
var POST_META = {
    slug: 'current-slug',        // 当前文章 slug
    tags: ['工程演进'],           // 同 posts-meta.json tags 字段
    topics: ['RAG'],              // 同 posts-meta.json topics 字段
    category: '技术'              // 技术 | 产品 | 商业
};
```

---

## 上一篇 / 下一篇导航规范

**触发条件：** 文章详情页始终尝试渲染；文章数 ≥ 2 时才有实际链接。

**实现方式：** fetch `../data/posts-meta.json`，按 `date` 字段倒序排列，找到当前 slug 的前后两篇（与相关推荐共用同一次 fetch，见下方完整 JS 模板）。

### HTML 模板

插入位置：`.related-posts` 之后。

```html
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

### CSS（加入文章 inline `<style>`）

```css
.post-nav { display: flex; justify-content: space-between; gap: 1rem; margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px solid var(--border); }
.post-nav a { display: flex; flex-direction: column; gap: .25rem; text-decoration: none; max-width: 45%; }
.post-nav-next { align-items: flex-end; margin-left: auto; }
.nav-label { font-size: .75rem; color: var(--text-2); }
.nav-title { font-size: .875rem; color: var(--text-1); }
.post-nav a:hover .nav-title { color: var(--clay); }
```

### 完整 JS 模板（相关推荐 + 上下篇合并，放在 `</body>` 前）

```javascript
(async function() {
    var data = await fetch('../data/posts-meta.json').then(function(r) { return r.json(); });
    var posts = data.posts;

    // 相关文章推荐
    if (posts.length >= 5) {
        var scored = posts
            .filter(function(p) { return p.slug !== POST_META.slug; })
            .map(function(p) {
                var score = 0;
                (p.topics || []).forEach(function(t) { if ((POST_META.topics || []).includes(t)) score += 3; });
                (p.tags || []).forEach(function(t) { if ((POST_META.tags || []).includes(t)) score += 2; });
                if (p.category === POST_META.category) score += 1;
                return Object.assign({}, p, { score: score });
            })
            .filter(function(p) { return p.score >= 1; })
            .sort(function(a, b) { return b.score - a.score || b.date.localeCompare(a.date); })
            .slice(0, 2);

        if (scored.length) {
            var list = document.getElementById('relatedList');
            list.innerHTML = scored.map(function(p) {
                // 注意：p.url 是 "posts/xxx.html"，文章页在 posts/ 目录下，只取文件名避免路径重复
                return '<a class="related-item" href="' + p.url.split('/').pop() + '">'
                    + '<span class="related-item-date">' + p.date + '</span>'
                    + '<span class="related-item-title">' + p.title + '</span>'
                    + '</a>';
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
        var elPrev = document.getElementById('navPrev');
        elPrev.href = prev.url.split('/').pop();  // 只取文件名，避免 posts/posts/ 双层路径
        document.getElementById('navPrevTitle').textContent = prev.title;
        elPrev.style.display = 'flex';
    }
    if (next) {
        var elNext = document.getElementById('navNext');
        elNext.href = next.url.split('/').pop();  // 只取文件名，避免 posts/posts/ 双层路径
        document.getElementById('navNextTitle').textContent = next.title;
        elNext.style.display = 'flex';
    }
})();
```

> **待完善：** 上下篇目前按 `date` 字段字符串排序，如果将来日期格式变化需同步调整；可考虑在导航里加分类小徽章，帮助读者判断跳转内容。

---

## 分享功能规范

OG meta 保证链接分享预览（微信/飞书/Twitter 卡片展示标题+摘要+封面图），不在页面内放复制链接按钮。

### OG meta 模板（加入每篇文章 `<head>`）

```html
<meta property="og:type"         content="article" />
<meta property="og:title"        content="文章标题" />
<meta property="og:description"  content="文章摘要（同 posts-meta.json summary 字段）" />
<meta property="og:url"          content="https://liu-yang.me/tools/blog/posts/slug.html" />
<meta property="og:image"        content="https://liu-yang.me/assets/images/og-cover.png" />
<meta name="twitter:card"        content="summary" />
<meta name="twitter:title"       content="文章标题" />
<meta name="twitter:description" content="文章摘要" />
<meta name="twitter:image"       content="https://liu-yang.me/assets/images/og-cover.png" />
```

> `og:url` 域名以实际部署地址为准。封面图 `assets/images/og-cover.png`（1200×630px）全站统一，无需每篇单独配图。

### 验证方式

部署到 GitHub Pages 后，用 [opengraph.xyz](https://www.opengraph.xyz) 输入文章 URL 验证卡片预览效果。本地 `file://` 无法测试（需公网 URL）。

---

## 分页规范

**触发条件：** `posts-meta.json` 中 `posts` 数组长度 > 20 时，列表页启用分页。

**实现约定（供将来执行）：**
- 每页展示 10 篇（`PAGE_SIZE = 10`，可根据阅读习惯调整为 15 或 20）
- 分页状态用 URL hash 记录：`index.html#page=2`，支持刷新/分享还原当前页
- 分页控件放在文章列表底部，样式参照现有 `.cat-nav` 按钮风格
- 搜索框输入或分类切换时自动重置到第 1 页
- 分页在 `filtered()` 函数返回结果的基础上切片，不改数据层
- 实现时在 `index.html` JS 区新增 `paginate(list, page)` 纯函数

> **待完善：** URL hash 方案在 iframe 嵌入主页时可能有路由冲突，届时可改用 `?page=2` query 参数方案。

---

> 文章页视觉设计规范（段落节奏、强调克制、组件间距等）见 [BLOG_DESIGN.md](BLOG_DESIGN.md)

---

## 未来考虑

以下功能当前不实现，记录候选方案备用：

| 功能 | 候选方案 | 备注 |
|------|----------|------|
| 阅读量统计 | 不蒜子（一行引入）/ Umami（自托管） | 不蒜子数据在第三方，Umami 数据自有 |
| 点赞 / 评论 | Giscus（GitHub Discussions）/ Cusdis | Giscus 需登录 GitHub，Cusdis 无需登录 |
| RSS Feed | 从 `posts-meta.json` 生成 XML | 适合未来读者订阅需求 |
| 全文搜索 | Lunr.js 客户端索引 | 建议文章 > 50 篇后再考虑 |
