# 博客精选文章功能实施计划

**状态：Ready for implementation**
**当前精选文章：**《当人和 AI 都在改变，“对齐”还能一次完成吗？》
**slug：** `alignment-under-change`

## 一、目标

为个人网站增加一套轻量的「精选文章」机制，将以下三种逻辑明确分离：

- **精选（Featured）**：作者手动策展，表达当前最希望读者优先看到的文章；
- **最新（Latest）**：继续由发布时间 / `posts-meta.json` 顺序自动决定；
- **文章关系（Relations / Continue Reading）**：继续表达文章之间的内容承接、修正和互补关系，不受精选状态影响。

本次不是重做博客首页，也不是增加推荐算法，而是在现有信息架构上增加一个独立、低维护成本的展示层。

## 二、当前基线

当前首页 Writing 区直接读取 `tools/blog/data/posts-meta.json`，展示最新三篇。

当前 Blog 列表页同样读取 `posts-meta.json`，支持：

- 全部 / 技术 / 产品 / 商业 / 行业分类；
- 搜索；
- `YYYY.MM` 时间分组；
- 分页。

当前精选文章：

- title：`当人和 AI 都在改变，“对齐”还能一次完成吗？`
- slug：`alignment-under-change`
- category：`技术`

现有博客视觉保持克制的 editorial list 风格，因此精选功能不应引入大尺寸 Hero Card、轮播、封面图或资讯门户式视觉。

## 三、核心产品规则

### 3.1 精选由作者手动决定

精选不是自动推荐算法。

系统只负责：

- 根据配置展示；
- 去重；
- 自动补最新文章；
- 配置异常时安全降级。

不根据以下信号自动改变精选：

- 阅读量；
- 发布时间；
- 内链数量；
- `relations` 数量；
- category / tags / topics / concepts；
- 搜索排名；
- 系列关系。

未来 AI 可以建议精选候选，但最终写入精选配置仍由作者决定。

### 3.2 只维护一份精选列表

新增：

```text
tools/blog/data/featured-posts.json
```

初始内容：

```json
{
  "version": 1,
  "featured": [
    "alignment-under-change"
  ]
}
```

规则：

- `featured` 使用文章 `slug`，不复制 title、summary、url 等 metadata；
- 是有序列表；
- 允许 `0–3` 篇；
- 不要求填满；
- 不允许重复 slug；
- 每个 slug 必须存在于 `posts-meta.json`。

顺序同时承担展示优先级：

```text
featured[0]   → 首页唯一精选
featured[0..2] → Blog「精选阅读」
```

无需分别维护 Homepage Featured 和 Blog Featured 两套配置。

## 四、首页设计

### 4.1 数量保持 3 篇

首页 Writing 区仍然只显示 **3 篇文章**。

### 4.2 展示算法

当存在有效精选时：

```text
第 1 篇：featured[0]
第 2 篇：最新文章中第一篇非 featured[0]
第 3 篇：最新文章中第二篇非 featured[0]
```

即：

> **1 篇精选 + 2 篇最新**

第二、第三篇永远从当前 `posts-meta.json` 自动产生，不硬编码。

如果精选同时也是最新文章：

- 只展示一次；
- 自动向后继续补最新文章；
- 首页最终尽量保持 3 篇。

### 4.3 无精选时的降级

以下任一情况发生：

- `featured` 为空；
- `featured-posts.json` 加载失败；
- 配置的 slug 已不存在；
- 当前没有任何有效精选；

首页自动退化为现有行为：

```js
posts.slice(0, 3)
```

精选功能故障不能导致 Writing 区无法显示。

### 4.4 首页视觉

沿用当前文章 row 视觉，不设计独立大卡片。

精选文章增加轻量：

```text
精选
```

标签。

要求：

- 复用现有 clay / tag 视觉语言；
- 不使用 📌；
- 不使用「TOP」「必读」；
- 不显著放大精选文章；
- 精选仍然首先是一篇普通文章。

### 4.5 首页 CTA

首页 Hero 当前：

```text
最近文章 →
```

改为：

```text
阅读文章 →
```

链接目标 `#writing` 不变。

## 五、Blog 列表页设计

### 5.1 默认状态增加「精选阅读」

仅在以下条件同时成立时显示：

```text
category = 全部
AND
search query = 空
AND
page = 1
AND
存在有效 featured
```

位置：

```text
Writing / 思考碎片
分类与搜索

精选阅读
[精选文章 1]
[精选文章 2，可选]
[精选文章 3，可选]

2026 · 08
普通时间流……
```

目前只有一篇精选，因此只显示一篇。

**不要为了视觉完整补满三篇。**

### 5.2 Blog 精选区视觉

保持当前 Blog editorial list 风格：

- 使用轻量「精选阅读」section label；
- 文章复用现有 `.post-row` 信息结构；
- 保留日期、标题、summary、tags/topics；
- 不创建大封面图；
- 不创建大背景 Hero；
- 不使用轮播；
- 不增加图片依赖。

### 5.3 默认时间流避免重复

当精选区正在显示时，下方默认时间流排除已经显示的精选文章。

默认未筛选模式中：

```text
archivePosts = posts - validFeaturedPosts
```

分页基于 `archivePosts` 计算。

### 5.4 搜索或分类时隐藏精选区

一旦：

```text
category != 全部
OR
search query != 空
```

则：

- 隐藏整个「精选阅读」；
- 恢复完整 `posts` 数据进入筛选；
- 精选文章不获得额外排名权；
- 精选文章如果符合条件，按正常时间位置出现。

### 5.5 分页行为

默认「全部 + 无搜索」：

- Page 1：精选区 + 普通时间流；
- Page 2 及以后：不重复显示精选区；
- 普通时间流分页基于排除精选后的文章集合。

搜索或分类：

- 精选区完全退出；
- 分页重新基于完整过滤结果计算。

分类计数继续统计全部文章，包括精选文章。

## 六、精选功能明确不影响的系统

精选不改变：

- `posts-meta.json` 文章语义；
- `relations`；
- Continue Reading；
- Previous / Next；
- 搜索权重；
- tags / topics / concepts / category；
- RSS；
- sitemap；
- canonical；
- JSON-LD；
- OG / Twitter metadata；
- SEO；
- 历史文章 AI 召回；
- 系列文章关系。

不要向 `posts-meta.json` 增加：

```text
featured
pinned
homepagePriority
```

Featured 只属于站内发现入口。

## 七、实现建议

### 7.1 首页

修改：

```text
/index.html
```

同时读取：

```text
tools/blog/data/posts-meta.json
tools/blog/data/featured-posts.json
```

精选配置读取失败应被单独容错，不能使 metadata 一起失败。

核心逻辑：

```js
const posts = postsData.posts;
const featuredSlugs = validFeaturedSlugs(featuredData, posts);

const homeFeatured = featuredSlugs.length
  ? posts.find(p => p.slug === featuredSlugs[0])
  : null;

const homePosts = [];

if (homeFeatured) {
  homePosts.push(homeFeatured);
}

for (const post of posts) {
  if (homePosts.some(item => item.slug === post.slug)) continue;
  homePosts.push(post);
  if (homePosts.length === 3) break;
}
```

### 7.2 Blog 页

修改：

```text
tools/blog/index.html
```

数据加载阶段同时读取：

```text
data/posts-meta.json
data/featured-posts.json
```

建议使用独立 DOM 容器，例如：

```html
<div id="featuredRoot"></div>
<div id="archiveRoot"></div>
```

核心判断：

```js
const showFeatured =
  cat === 'all' &&
  !query.trim() &&
  page === 1 &&
  featuredPosts.length > 0;
```

默认 archive：

```js
posts.filter(p => !featuredSlugSet.has(p.slug))
```

搜索 / 分类继续对完整 `posts` 调用现有 filtering。

避免对现有 filtering、category counts 和 search 行为做不必要重构。

## 八、配置校验

优先检查仓库是否已经存在合适的 Blog 数据校验入口。

如果有，扩展现有校验；如果没有，再创建：

```text
scripts/check-featured-posts.js
```

校验：

1. JSON 可解析；
2. `version === 1`；
3. `featured` 是数组；
4. 长度 `<= 3`；
5. 每一项都是非空字符串；
6. slug 不重复；
7. 每个 slug 都存在于 `posts-meta.json`。

错误时返回非零 exit code。

运行时仍保留容错。

## 九、文档归属

本功能属于**网站展示层**，不修改：

```text
blog-sop
blog-review-checklist
blog-charts-spec
```

### 应更新

#### `tools/blog/BLOG_DESIGN.md`

增加「精选文章」章节，记录：

- 精选定义；
- 首页 1 Featured + 2 Latest；
- Blog 最多 3 Featured；
- 搜索 / 分类时隐藏；
- 默认时间流去重；
- 视觉规则；
- 移动端 / 深色模式要求。

#### Blog 运维说明

如果仓库已有明确负责 Blog 数据维护的 README / 运维文档，在其中只增加一小段：

```text
如何编辑 featured-posts.json
```

说明：

- 修改 slug 即可；
- 第一项是首页精选；
- 最多 3 项；
- 空数组关闭精选。

**不要把同一套 Featured 规则复制到多个规范文件。**

### `WRITING_GUIDE.md`

原则上不修改。

Featured 与文章写作、metadata 语义、relation 判断无关，保持网站层规则隔离。

## 十、当前初始配置

本次上线时只设置：

```json
{
  "version": 1,
  "featured": [
    "alignment-under-change"
  ]
}
```

不提前选择第二、第三篇。

未来如果确定其他精选，只需增加 slug，无需修改 UI 或业务逻辑。

## 十一、异常与降级

### 配置文件不存在

首页：最新 3 篇。
Blog：无精选区 + 原有时间流。

### 配置为空

```json
{
  "version": 1,
  "featured": []
}
```

等同于主动关闭 Featured。

### 某个 slug 无效

运行时忽略，不让页面报错；静态 QA 报错。

### 重复 slug

运行时可去重；静态 QA 必须报错。

## 十二、V1 明确不做

本次不要扩展为：

- 自动精选算法；
- 阅读量排名；
- Featured 推荐分数；
- 180 天自动换精选；
- AI 自动改配置；
- 精选过期自动取消；
- CMS 后台；
- 拖拽排序；
- Featured 图片系统；
- 首页轮播；
- Featured SEO 权重；
- 每个分类各自精选；
- 文章详情页「精选」徽章；
- 系列专题 UI。

## 十三、视觉 QA

### 首页

Desktop + Mobile，Light + Dark：

- 始终最多 3 篇；
- 当前精选位于第一；
- 「精选」标签不抢标题；
- 第二、第三篇来自自动最新补齐；
- 不重复；
- CTA 已变为「阅读文章 →」。

### Blog 默认全部

应看到：

```text
精选阅读
当人和 AI 都在改变，“对齐”还能一次完成吗？

2026 · 08
其他文章……
```

同一文章不在下面再次出现。

### 分类 = 技术

- 精选区隐藏；
- `alignment-under-change` 作为普通技术文章正常出现。

### 搜索 = 对齐

- 精选区隐藏；
- 对应文章正常出现。

### Page 2

- 精选区不再次出现。

### Mobile

确认：

- 精选区不破坏现有单栏；
- 标题换行正常；
- summary 和 tags 不挤压。

## 十四、回归 QA

确认以下现有功能没有变化：

- Blog category counts；
- 搜索；
- search debounce；
- mobile category tabs；
- active filter chips；
- pagination；
- `YYYY.MM` 分组；
- dark / light theme；
- 首页文章链接；
- Blog 文章链接；
- 文章详情页；
- Continue Reading；
- Previous / Next；
- RSS；
- sitemap；
- search foundation。

运行仓库现有静态检查，至少：

```bash
node scripts/check-search-foundation.js
```

如果新增独立 Featured 校验：

```bash
node scripts/check-featured-posts.js
```

## 十五、实施范围

预计主要新增 / 修改：

```text
NEW     tools/blog/data/featured-posts.json

MODIFY  index.html
MODIFY  tools/blog/index.html
MODIFY  tools/blog/BLOG_DESIGN.md

OPTIONAL MODIFY
        现有 Blog 运维 README

OPTIONAL NEW
        scripts/check-featured-posts.js
```

原则上不修改：

```text
tools/blog/data/posts-meta.json
tools/blog/WRITING_GUIDE.md
article-runtime.js
generate-post.js
relations
RSS 生成逻辑
搜索排序逻辑
博客文章 HTML / Markdown 正文
blog-sop
blog-review-checklist
blog-charts-spec
```

## 十六、完成标准

- [ ] `alignment-under-change` 已成为当前唯一 Featured；
- [ ] 首页显示 1 Featured + 2 Latest；
- [ ] 首页无重复文章；
- [ ] 首页仍只有 3 篇；
- [ ] Hero CTA 改为「阅读文章 →」；
- [ ] Blog 默认页有「精选阅读」；
- [ ] 当前仅显示 1 篇精选，不硬凑 3 篇；
- [ ] Blog 默认时间流不重复精选文章；
- [ ] 分类后精选区隐藏；
- [ ] 搜索后精选区隐藏；
- [ ] 搜索 / 分类结果仍能正常找到精选文章；
- [ ] Page 2 不重复显示精选区；
- [ ] 配置异常有 fallback；
- [ ] 精选没有写入 `posts-meta.json`；
- [ ] 精选没有影响 relations / Continue Reading；
- [ ] 精选没有影响 RSS / sitemap / SEO / search；
- [ ] 浅色 / 深色通过；
- [ ] Desktop / Mobile 通过；
- [ ] 静态检查通过；
- [ ] 浏览器无新增 console error；
- [ ] 最终重新读取实际修改文件确认内容已经写入。

## 最终产品原则

> **精选人工决策，最新自动更新。精选只改变发现入口，不改变文章本身的语义、关系和排序体系。**

V1 用一份有序 Featured 配置完成整个机制：第一篇承担首页代表作，最多前三篇承担 Blog 精选阅读；没有足够值得精选的文章时，允许留空，不为 UI 完整性制造内容。
