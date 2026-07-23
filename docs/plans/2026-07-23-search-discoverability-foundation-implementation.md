# 网站可检索基础 Implementation Plan

> **For Codex:** REQUIRED SUB-SKILL: Use `executing-plans` to implement this plan task-by-task.

**Goal:** 在不改变任何页面可见内容、布局和交互的前提下，为主页、博客归档和全部博客文章建立可自动生成、验证和回退的搜索发现基础。

**Architecture:** 使用一个 CommonJS 配置文件和一个纯函数模块集中生成 canonical、结构化数据、robots、sitemap 与 RSS。现有文章通过幂等脚本只补齐 `<head>` 中的受控标记块；生成脚本复用同一逻辑，避免未来文章漂移。

**Tech Stack:** HTML5、Vanilla JavaScript、Node.js 内置模块、Node `node:test`、GitHub Pages。

---

## 执行前硬性约束

- 使用独立 worktree 和分支 `codex/search-foundation`
- 先读 `CONVENTIONS.md` 与 `docs/agent-context/*`
- 先读设计和影响文档
- 不修改 CSS
- 不修改任意 HTML `<body>`
- 不修改 `.github/workflows/`
- 不删除文件
- 不覆盖或提交用户现有改动
- push 前必须暂停并取得用户确认

### Task 0: 建立安全基线

**Files:**

- Read: `CONVENTIONS.md`
- Read: `docs/agent-context/README.md`
- Read: `docs/agent-context/memory.md`
- Read: `docs/agent-context/skills.md`
- Read: `docs/agent-context/maintenance.md`
- Read: `docs/plans/2026-07-23-search-discoverability-foundation-design.md`
- Read: `docs/plans/2026-07-23-search-discoverability-foundation-impact.md`
- Read: `tools/blog/generate-post.js`
- Read: `tools/blog/data/posts-meta.json`

**Step 1: 检查工作区**

Run:

```powershell
git status --short --branch
git log -5 --oneline
```

Expected:

- 记录现有修改和未跟踪文件
- 不清理、不 stash、不 reset 用户文件

**Step 2: 建立分支或独立 worktree**

使用 Codex 提供的 worktree 能力；如果当前任务已经位于独立 worktree，只创建或
确认分支：

```powershell
git switch -c codex/search-foundation
```

不得在有无法分离的用户正文改动时强行切换或搬移文件。

**Step 3: 记录视觉和 body 基线**

启动本地 HTTP server，保存以下页面的桌面与移动截图：

- `/`
- `/tools/blog/`
- `/tools/blog/posts/agent-boundary.html`
- `/tools/blog/posts/ontology-business-semantic-layer.html`
- `/tools/blog/posts/human-ai-boundary-shift.html`

同时用只读脚本计算所有文章 `<body>` 的 SHA-256，输出到任务临时目录，不纳入提交。

**Step 4: 确认基线**

Expected:

- 页面可以正常加载
- 截图和 body hash 清单齐全
- 浏览器控制台无阻塞性错误

### Task 1: 先写搜索基础单元测试

**Files:**

- Create: `scripts/search-foundation.test.js`
- Test: `scripts/search-foundation.test.js`

**Step 1: 写 URL 和 XML 生成测试**

测试至少覆盖：

```js
const test = require('node:test');
const assert = require('node:assert/strict');

test('absoluteUrl normalizes the site root and relative path', () => {
  assert.equal(
    absoluteUrl('https://marktian-long.github.io', 'tools/blog/'),
    'https://marktian-long.github.io/tools/blog/'
  );
});

test('buildRobots keeps wildcard access and declares the sitemap', () => {
  assert.equal(
    buildRobots({ siteUrl: 'https://marktian-long.github.io' }),
    'User-agent: *\nAllow: /\n\n'
      + 'Sitemap: https://marktian-long.github.io/sitemap.xml\n'
  );
});

test('buildSitemap escapes URLs and includes every supplied page once', () => {
  const xml = buildSitemap(
    { siteUrl: 'https://marktian-long.github.io' },
    ['/', '/tools/blog/', '/tools/blog/posts/a.html']
  );
  assert.match(xml, /<loc>https:\/\/marktian-long\.github\.io\/<\/loc>/);
  assert.equal((xml.match(/<url>/g) || []).length, 3);
});
```

**Step 2: 写 RSS 测试**

覆盖：

- 只输出最近 20 项
- title、description 正确 XML 转义
- link 与 guid 为绝对 URL
- 不伪造 `pubDate`

**Step 3: 写文章 head 幂等测试**

构造包含现有 title、OG 和 body 的最小 HTML fixture，验证：

```js
const once = ensureArticleSeo(sourceHtml, metadata, config);
const twice = ensureArticleSeo(once, metadata, config);

assert.equal(twice, once);
assert.equal(extractBody(once), extractBody(sourceHtml));
assert.match(once, /<meta name="description"/);
assert.match(once, /<link rel="canonical"/);
assert.match(once, /"@type":"BlogPosting"/);
```

**Step 4: 运行测试确认失败**

Run:

```powershell
node --test scripts/search-foundation.test.js
```

Expected: FAIL because `scripts/search-foundation.js` does not exist.

**Step 5: 提交测试**

```powershell
git add scripts/search-foundation.test.js
git commit -m "test: define search foundation behavior"
```

### Task 2: 实现集中配置和纯函数模块

**Files:**

- Create: `scripts/site-config.js`
- Create: `scripts/search-foundation.js`
- Test: `scripts/search-foundation.test.js`

**Step 1: 创建站点配置**

`scripts/site-config.js` 必须只包含公开配置：

```js
module.exports = Object.freeze({
  siteUrl: 'https://marktian-long.github.io',
  siteName: 'Leo Liu · AI / Product / Builder',
  siteDescription: 'Leo Liu — AI 产品与工程实践，写关于 AI 落地的独立观察。',
  author: {
    name: 'Leo Liu',
    url: 'https://marktian-long.github.io'
  },
  blog: {
    title: '思考碎片 — Leo Liu',
    description: 'Leo Liu 关于 AI、产品、工程与商业的长期思考。',
    path: '/tools/blog/',
    feedPath: '/feed.xml',
    imagePath: '/assets/images/og-cover.png',
    feedLimit: 20
  }
});
```

不得加入密钥、Search Console token 或账号信息。

**Step 2: 实现基础转义和 URL 函数**

`scripts/search-foundation.js` 导出：

```js
module.exports = {
  absoluteUrl,
  xmlEscape,
  htmlAttributeEscape,
  extractBody,
  buildRobots,
  buildSitemap,
  buildRss,
  ensureArticleSeo,
  articleUrl
};
```

规则：

- `absoluteUrl()` 去除重复斜杠并保留根路径
- `xmlEscape()` 转义 `& < > " '`
- `htmlAttributeEscape()` 至少转义 `& < > "`
- JSON-LD 先 `JSON.stringify()`，再把 `<` 替换为 `\\u003c`

**Step 3: 实现受控 SEO 标记块**

使用固定标记：

```html
<!-- search-foundation:start -->
<meta name="description" content="..." />
<link rel="canonical" href="..." />
<link rel="alternate" type="application/rss+xml" title="思考碎片 — Leo Liu" href=".../feed.xml" />
<script type="application/ld+json">...</script>
<!-- search-foundation:end -->
```

若标记已存在则整体替换；不存在则插在 `</title>` 后。函数返回前必须比较
`extractBody(before)` 与 `extractBody(after)`，不同则抛错。

JSON-LD 使用：

```js
{
  '@context': 'https://schema.org',
  '@type': 'BlogPosting',
  headline: metadata.title,
  description: metadata.summary,
  url,
  mainEntityOfPage: { '@type': 'WebPage', '@id': url },
  image: [absoluteUrl(config.siteUrl, config.blog.imagePath)],
  author: {
    '@type': 'Person',
    name: config.author.name,
    url: config.author.url
  }
}
```

不写 `datePublished` 或 `dateModified`。

**Step 4: 运行测试**

Run:

```powershell
node --test scripts/search-foundation.test.js
```

Expected: all tests PASS.

**Step 5: 自检并提交**

```powershell
git diff --check
git add scripts/site-config.js scripts/search-foundation.js scripts/search-foundation.test.js
git commit -m "feat: add search foundation generators"
```

### Task 3: 生成 robots、sitemap 和 RSS

**Files:**

- Create: `scripts/generate-search-assets.js`
- Create: `robots.txt`
- Create: `sitemap.xml`
- Create: `feed.xml`
- Test: `scripts/search-foundation.test.js`

**Step 1: 为生成器写失败测试**

增加测试，验证从临时 metadata 生成：

- 主页
- 博客归档
- 每个唯一文章 URL
- RSS 最多 20 篇
- slug 或 URL 重复时抛错

Run:

```powershell
node --test scripts/search-foundation.test.js
```

Expected: FAIL until CLI generation function exists.

**Step 2: 实现 CLI**

`scripts/generate-search-assets.js`：

- 读取 `scripts/site-config.js`
- 读取 `tools/blog/data/posts-meta.json`
- 校验 `posts` 为数组
- 校验 slug、URL 唯一
- 校验 title、summary、url 必填
- 生成三个字符串
- `--write` 写入根目录文件
- `--check` 与已提交文件比较；过期时 exit code 1
- 无参数只打印将变化的文件，不写入

**Step 3: 生成文件**

Run:

```powershell
node scripts/generate-search-assets.js --write
```

Expected:

```text
WROTE robots.txt
WROTE sitemap.xml
WROTE feed.xml
```

**Step 4: 验证幂等**

Run:

```powershell
node scripts/generate-search-assets.js --check
node scripts/generate-search-assets.js --write
git diff --exit-code -- robots.txt sitemap.xml feed.xml
```

第二次写入后内容不得继续变化。

**Step 5: 提交**

```powershell
git add scripts/generate-search-assets.js robots.txt sitemap.xml feed.xml
git commit -m "feat: publish search discovery assets"
```

### Task 4: 补齐现有文章 head，保证 body 不变

**Files:**

- Create: `scripts/retrofit-blog-seo.js`
- Modify: `tools/blog/generate-post.js:1-15,132-139`
- Modify: `tools/blog/posts/*.html` only inside `<head>`
- Test: `scripts/search-foundation.test.js`

**Step 1: 为 retrofit 写失败测试**

覆盖：

- 默认模式不写文件
- `--check` 在缺失标记时退出 1
- `--write` 只写 head
- 第二次 `--write` 无变化
- metadata 找不到对应文件时失败
- 文件没有 `<body>` 或 `<head>` 时失败

**Step 2: 实现 retrofit CLI**

脚本读取全部 metadata，逐篇调用 `ensureArticleSeo()`。

支持：

```text
node scripts/retrofit-blog-seo.js
node scripts/retrofit-blog-seo.js --check
node scripts/retrofit-blog-seo.js --write
node scripts/retrofit-blog-seo.js --write --exclude tools/blog/posts/example.html
```

写入前必须验证 body 字符串完全相同。

**Step 3: 先 dry-run**

Run:

```powershell
node scripts/retrofit-blog-seo.js
```

Expected: 报告需要修改的文章数量，不写文件。

**Step 4: 重新检查用户改动**

Run:

```powershell
git status --short
git diff -- tools/blog/posts/human-ai-boundary-shift.html
```

如果该文件仍包含用户正文差异：

- 先使用 `--exclude` 跳过
- 不提交该文件
- 在交付报告列为剩余项

如果只有工作树时间戳变化且无内容 diff，可以正常处理。

**Step 5: 写入并验证 body**

Run:

```powershell
node scripts/retrofit-blog-seo.js --write
node scripts/retrofit-blog-seo.js --check
node --test scripts/search-foundation.test.js
```

重新计算全部文章 body SHA-256，与 Task 0 基线比较。

Expected: 每一篇均一致；任何不一致立即停止。

**Step 6: 更新新文章生成器**

在 `tools/blog/generate-post.js` 中：

- require `../../scripts/site-config.js`
- require `ensureArticleSeo`
- 移除第 136 行硬编码站点 URL
- 在现有 title/OG/Twitter 更新完成后调用 `ensureArticleSeo(page, metadata, config)`
- 不修改 Markdown 解析、目录、正文替换和相关文章代码

**Step 7: 用临时输出验证生成器**

选择一个现有 Markdown 和临时输出路径运行生成器，验证：

- 生成页面包含受控 SEO 块
- body 仍与当前生成规则一致
- 不产生 `posts/posts/` 路径
- 中文编码正常

临时输出放在项目临时目录，验证后使用可恢复方式清理；删除前遵守项目确认规则。

**Step 8: 精确暂存和提交**

先检查：

```powershell
git diff -- tools/blog/generate-post.js tools/blog/posts
git diff --check
```

只暂存脚本和文章 head 变更。不得把用户正文 hunk 一起暂存。

```powershell
git add scripts/retrofit-blog-seo.js tools/blog/generate-post.js
git add tools/blog/posts
git diff --cached --check
git commit -m "feat: add structured blog metadata"
```

若存在无法分离的用户 hunk，停止并报告，不强行提交。

### Task 5: 补齐主页和博客归档 head

**Files:**

- Modify: `index.html:5-18`
- Modify: `tools/blog/index.html:3-10`

**Step 1: 保存 body hash**

在编辑前保存两个文件 `<body>` hash。

**Step 2: 修改首页 head**

增加：

- canonical
- RSS alternate
- `WebSite` 与 `Person` JSON-LD

保留现有 title、description、OG、Twitter 和字体。

**Step 3: 修改博客归档 head**

增加：

- meta description
- canonical
- RSS alternate
- `og:type=website`
- `og:title`
- `og:description`
- `og:url`
- `CollectionPage` JSON-LD

不修改 style 或 body。

**Step 4: 验证 body**

重新计算 hash，必须与 Step 1 相同。

**Step 5: 提交**

```powershell
git diff --check
git add index.html tools/blog/index.html
git commit -m "feat: describe public content entry pages"
```

### Task 6: 增加全量静态检查

**Files:**

- Create: `scripts/check-search-foundation.js`
- Test: `scripts/search-foundation.test.js`

**Step 1: 写失败测试**

检查器必须发现：

- sitemap 缺文章
- canonical 与 metadata URL 不一致
- description 缺失
- JSON-LD 无法解析
- 同一页面重复 canonical
- feed 超过配置上限
- robots 未声明 sitemap

**Step 2: 实现检查器**

只读检查，不联网，不写文件。

Run:

```powershell
node scripts/check-search-foundation.js
```

Expected:

```text
PASS robots.txt
PASS sitemap.xml
PASS feed.xml
PASS blog article SEO: 34/34
PASS entry page SEO: 2/2
```

如果有被保护的用户文章暂时跳过，输出必须明确为 `PARTIAL` 并退出非零，
不能伪报 PASS。

**Step 3: 提交**

```powershell
git add scripts/check-search-foundation.js scripts/search-foundation.test.js
git commit -m "test: verify search discovery assets"
```

### Task 7: 同步发布与维护文档

**Files:**

- Modify: `tools/blog/WRITING_GUIDE.md:291-342,620-680`
- Modify: `tools/blog/README.md:45-55`
- Modify: `CONVENTIONS.md` blog section

**Step 1: 更新发布流程**

写明新文章发布时运行：

```powershell
node tools/blog/generate-post.js <source.md> <output.html>
node scripts/generate-search-assets.js --write
node scripts/check-search-foundation.js
```

**Step 2: 更新 head 规范**

说明：

- `posts-meta.json` 仍是 title/summary/url 的单一来源
- canonical、description 和 JSON-LD 由脚本生成
- 不手工复制域名
- 不伪造精确日期

**Step 3: 更新维护说明**

记录：

- 未来换域名只改 `scripts/site-config.js`
- Search Console/Bing 属于后续账号步骤
- robots 当前不区分 GPTBot
- 可见专题页属于第二阶段

**Step 4: 运行文档同步检查**

Run:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/sync-agent-context.ps1
git diff --check
```

Expected: 无新增共享上下文漂移。

**Step 5: 提交**

```powershell
git add CONVENTIONS.md tools/blog/README.md tools/blog/WRITING_GUIDE.md
git commit -m "docs: document search discovery publishing"
```

### Task 8: 零视觉变化验收

**Files:**

- Verify only; do not edit unless a defect is found

**Step 1: 运行自动检查**

```powershell
node --test scripts/search-foundation.test.js
node scripts/generate-search-assets.js --check
node scripts/retrofit-blog-seo.js --check
node scripts/check-search-foundation.js
git diff --check
```

Expected: 全部 PASS。

**Step 2: 本地 HTTP 验证**

启动 HTTP server，验证：

- `/robots.txt` -> 200
- `/sitemap.xml` -> 200
- `/feed.xml` -> 200
- `/` -> 200
- `/tools/blog/` -> 200
- sitemap 中每篇文章 -> 200

解析 XML，确认无语法错误。

**Step 3: 视觉复核**

使用浏览器截图比较 Task 0 的同一页面和视口：

- 首页桌面/移动
- 博客归档桌面/移动
- 三篇文章桌面/移动

Expected:

- 无可见差异
- 无新增滚动条
- 无布局、字体、颜色和间距变化
- 主题切换、筛选、分页、目录正常

**Step 4: body hash 复核**

全部文章以及首页/归档 `<body>` hash 必须与基线一致。

**Step 5: 代码审查**

按项目要求使用 `review` skill，重点检查：

- XML/HTML 转义
- JSON-LD 注入安全
- URL 重复和路径错误
- 脚本幂等
- 用户改动保护
- 无 secret

修复后重新运行全部验证。

### Task 9: 交付与部署检查点

**Step 1: 汇总提交**

Run:

```powershell
git status --short --branch
git log --oneline --decorate -10
git diff origin/main...HEAD --stat
```

向用户报告：

- 文件清单
- 测试结果
- 截图结论
- body hash 结论
- 未处理例外
- 提交 SHA
- 每个提交的 revert 方法

**Step 2: 等待用户确认**

在用户明确允许前，不执行 `git push`。

**Step 3: 用户确认后推送**

```powershell
git push -u origin codex/search-foundation
```

推送仍需遵守项目 HITL 清单。

**Step 4: 线上验证**

部署完成后检查根资产、入口页和代表文章的 HTTP 200、canonical、JSON-LD。

Search Console、Bing、自定义域名和任何可见页面改动均不在本计划内。
