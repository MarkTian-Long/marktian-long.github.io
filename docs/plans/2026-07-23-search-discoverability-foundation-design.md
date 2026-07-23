# 网站可检索基础设计

## 状态

- 设计日期：2026-07-23
- 当前阶段：设计已确认，等待独立任务实施
- 当前域名：`https://marktian-long.github.io`
- 核心约束：第一阶段保持页面视觉、正文、导航和交互不变

## 背景

网站已经公开部署，主页、博客归档和文章页可直接访问。博客当前有
34 篇独立 HTML 文章，`tools/blog/data/posts-meta.json` 是文章元数据的
单一来源。

当前缺少或不完整的搜索发现能力包括：

- 根目录没有 `robots.txt`
- 根目录没有 `sitemap.xml`
- 没有 RSS/Atom feed
- 文章普遍缺少标准 `meta description`
- 文章没有 canonical
- 文章没有 `BlogPosting` JSON-LD
- 发布脚本中的站点域名为硬编码
- 缺少可重复运行的搜索资产生成与校验脚本

网站可以被 crawler 访问，但“公开可访问”尚未形成稳定、可验证、可维护的
“可发现、可理解、可引用”能力。

## 第一阶段目标

在不改变读者页面体验的前提下，建立域名无关、可自动生成、可验证和可回退的
搜索发现基础。

完成后应达到：

1. 搜索引擎和 AI crawler 能发现主页、博客归档和全部文章 URL。
2. 每篇文章具备稳定 canonical、标准摘要和结构化文章信息。
3. 新文章发布时可以重复生成 robots、sitemap、RSS 和文章 head 元数据。
4. 站点地址集中配置，未来更换自定义域名不需要全仓手工替换。
5. 页面截图、CSS、`<body>` 内容和交互与实施前一致。

## 非目标

第一阶段明确不做：

- 不购买或绑定自定义域名
- 不注册或配置 Google Search Console、Bing Webmaster
- 不修改 `.github/workflows/`
- 不新增专题页
- 不修改首页或博客导航
- 不预渲染博客归档列表
- 不增加可见的作者、发布日期、面包屑或“核心结论”模块
- 不修改文章正文、相关文章或上一篇/下一篇
- 不修改 CSS、字体、间距、颜色、布局或响应式行为
- 不删除或移动现有文件
- 不改变 GPTBot 等 crawler 相对于当前状态的访问权限

## 方案选择

### 方案 A：只增加 robots 和 sitemap

改动最小，但文章仍缺少 canonical 和结构化信息，未来发布时容易再次遗漏。

### 方案 B：搜索基础生成系统

增加集中配置、robots、sitemap、RSS、文章 head 元数据、生成脚本和校验脚本。
页面视觉不变，同时解决一次性补齐和后续维护问题。

### 方案 C：同步建设可见内容架构

在方案 B 上增加专题页、导航入口和文章信息区。长期效果更好，但会改变读者体验，
不符合第一阶段“小幅、易回退”的要求。

采用 **方案 B**。

## 总体架构

```text
scripts/site-config.js
  ├─ 当前站点 URL
  ├─ 站点名、描述、作者
  ├─ 默认分享图
  └─ Feed 配置

tools/blog/data/posts-meta.json
  └─ 文章 slug、标题、摘要、分类、URL

scripts/search-foundation.js
  ├─ URL 规范化
  ├─ XML/HTML 转义
  ├─ robots 生成
  ├─ sitemap 生成
  ├─ RSS 生成
  └─ 文章 SEO head 生成

scripts/generate-search-assets.js
  ├─ robots.txt
  ├─ sitemap.xml
  └─ feed.xml

scripts/retrofit-blog-seo.js
  └─ 只更新文章 <head> 中的受控标记块

tools/blog/generate-post.js
  └─ 新文章生成时复用同一 SEO head 逻辑
```

## 数据与生成规则

### 站点配置

第一阶段以 `https://marktian-long.github.io` 为唯一站点地址。未来购买域名时，
只修改 `scripts/site-config.js`，重新运行生成脚本。

配置不得包含密钥、账号或验证令牌。

### robots.txt

第一阶段保持当前实际权限语义，不增加针对特定 crawler 的禁止规则：

```text
User-agent: *
Allow: /

Sitemap: https://marktian-long.github.io/sitemap.xml
```

这会明确 sitemap 位置，但不会把当前可访问的 crawler 改为不可访问。

### sitemap.xml

第一阶段包括：

- 主页
- 博客归档页
- `posts-meta.json` 中全部文章

暂不加入 dev-only 工具。暂不写不准确的 `lastmod`。将来拥有精确发布日期和
更新时间后再补充。

### feed.xml

使用 RSS 2.0，包含元数据数组中的最近 20 篇文章：

- title
- link
- guid
- description

现有元数据只有月份，没有可靠的具体日期，因此第一阶段不伪造 `pubDate`。
以后增加精确 `publishedAt` 字段时再补充。

### 文章 head

每篇文章增加一个受控标记块：

```html
<!-- search-foundation:start -->
...
<!-- search-foundation:end -->
```

标记块包含：

- `<meta name="description">`
- `<link rel="canonical">`
- RSS auto-discovery
- `BlogPosting` JSON-LD

保留现有 title、Open Graph、Twitter、favicon 和字体引用，不做无关格式化。

`BlogPosting` 第一阶段包含：

- headline
- description
- url
- mainEntityOfPage
- image
- author

不写无法确认的 `datePublished` 和 `dateModified`。

### 首页和博客归档页

只更新 `<head>`：

- canonical
- RSS auto-discovery
- 必要的 description/OG 信息
- 首页 `WebSite` 与 `Person` JSON-LD
- 博客归档 `CollectionPage` JSON-LD

不修改 `<body>`。

## 幂等与安全

所有生成脚本必须满足：

- 相同输入重复运行，输出完全一致
- `--check` 只检查，不写文件
- `--write` 才允许写文件
- 文章补齐脚本写入前比较 `<body>` 原文，任何变化立即失败
- 无法匹配 `<head>`、元数据缺失、URL 重复或 XML 转义失败时立即退出
- 不静默跳过异常文章
- 不格式化整个 HTML 文件

## 视觉与行为保证

第一阶段禁止修改：

- `assets/css/`
- 任意 HTML 的 `<body>`
- 现有可见文案
- 现有脚本加载顺序与页面交互

验收时必须证明：

- 首页桌面和移动截图前后一致
- 博客归档桌面和移动截图前后一致
- 至少三篇代表文章截图前后一致
- 文章 `<body>` 字节级一致
- 页面控制台没有新增错误

## 提交与回退

使用独立分支 `codex/search-foundation`，按能力拆分提交：

1. 搜索基础生成与单元测试
2. robots、sitemap、RSS
3. 文章和入口页 head 元数据
4. 发布规范与维护文档

任何一组出现问题时使用 `git revert <commit>` 单独回退，不使用
`git reset --hard`。

推送与部署前必须得到用户明确确认。

## 后续阶段

第一阶段稳定后，再分别设计并确认：

- Agent、企业 AI、产品设计专题页
- 首页专题入口
- 可见作者与更新时间
- 文章核心结论区
- 静态博客归档
- Search Console 与 Bing Webmaster
- 自定义域名迁移

这些可见改动不得和第一阶段合并实施。
