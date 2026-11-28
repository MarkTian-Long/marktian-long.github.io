# 网站可检索与 Agent Discoverability 第二阶段实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在现有静态网站上为博客归档增加静态可爬取链接，为 8 个公开工具补齐 SEO / Sitemap，并生成公开的 `llms.txt`。

**Architecture:** 工具页 SEO、Sitemap 和 LLM 索引使用 `scripts/site-config.js` 作为公共配置入口；博客归档 HTML 仅在 public dist 构建时从现有 metadata 生成，源页面仍由 JavaScript 增强。所有生成物均有确定性测试或检查。

**Tech Stack:** HTML5、Vanilla JavaScript、Node.js 22、Node 内置 `node:test`、GitHub Pages public dist allowlist。

**Spec:** `docs/plans/2026-11-28-search-discoverability-phase-2-design.md`

## Global Constraints

- GitHub Pages 只发布 `scripts/public-dist-manifest.js` 的显式白名单。
- `tools/blog/data/posts-meta.json` v4 是博客文章标题、摘要、URL 的运行索引；不维护第二份文章列表。
- `tools/blog/data/featured-posts.json` 是精选文章的有序 slug 列表。
- `scripts/site-config.js` 只包含公开配置，不包含密钥、账号验证 token 或私人路径。
- 线上运行继续使用 HTML、CSS、Vanilla JavaScript；不新增应用后端或浏览器依赖。
- 文章日期只有 YYYY.MM，不生成精确发布日期或更新时间。
- 保留 `robots.txt` 当前通配访问规则；不新增 crawler 特例或 noindex。
- 不修改 `.github/workflows/**`，不修改现有文章正文，不迁移框架。
- 用户授权范围是独立开发分支和本阶段改造；合并、推送 main、生产发布均不在授权范围内。

## Review Focus

- metadata 中含 `<`、`&`、引号或恶意 HTML 的标题/摘要/标签必须安全转义，不能注入脚本或破坏属性。
- 文章数为 0、少于 10、恰好 10 或超过 10 时，静态归档和无脚本后备链接必须完整、无重复。
- featured slug 缺失、重复或指向未知文章时，生成器必须明确失败或按既有验证规则拒绝，不能静默丢失精选内容。
- 工具页缺少 head/body、title 与配置不一致、重复路径或不安全路径时，SEO 生成器必须失败关闭。
- `llms.txt` 只能引用配置中明确登记的公开工具和公开 GitHub 仓库，不能从所有可访问仓库自动推断公开发布资格。

---

### Task 1: 工具页 SEO 配置、生成和 Sitemap 白名单

**Files:**
- Modify: `scripts/site-config.js`
- Modify: `scripts/search-foundation.js`
- Modify: `scripts/generate-search-assets.js`
- Modify: `scripts/check-search-foundation.js`
- Modify: `scripts/search-foundation.test.js`
- Modify head only: `tools/agent-hub/index.html`
- Modify head only: `tools/ai-insights/index.html`
- Modify head only: `tools/asci/index.html`
- Modify head only: `tools/esop-extractor/index.html`
- Modify head only: `tools/radar/index.html`
- Modify head only: `tools/service-agent/index.html`
- Modify head only: `tools/stock/index.html`
- Modify head only: `tools/trends/index.html`
- Regenerate: `sitemap.xml`

**Interfaces:**
- `siteConfig.toolPages` is an ordered array of `{ path, title, description }`; paths are site-relative directory URLs ending in `/`.
- `ensureToolPageSeo(sourceHtml, tool, config)` returns an idempotent HTML string and throws if head/body/title/path are invalid.
- `buildSearchAssets(config, posts)` adds `toolPages[].path` to the sitemap exactly once.

- [ ] **Step 1: Write failing tests** for tool page SEO insertion, idempotence, body preservation, escaping, JSON-LD shape, duplicate tool paths, and sitemap inclusion.
- [ ] **Step 2: Run** `node --test scripts/search-foundation.test.js`.
  **Expected:** tests fail because tool-page SEO generation and config entries do not yet exist.
- [ ] **Step 3: Add 8 tool page entries** to `scripts/site-config.js`. Each description must accurately disclose Mock/static/synthetic/online-request boundaries. Keep each current HTML `<title>` unchanged and verify the config title matches it.
- [ ] **Step 4: Implement** `buildToolPageJsonLd(config, tool, canonical)`, `buildToolPageSeoBlock(config, tool)`, and `ensureToolPageSeo(sourceHtml, tool, config)` in `scripts/search-foundation.js`. The controlled marker is `search-foundation-tool:start/end`; it owns description, canonical, OG, Twitter, and one `WebPage` JSON-LD block. Preserve unrelated head tags and the complete body.
- [ ] **Step 5: Extend** `generate-search-assets.js` to include all 8 tool pages in `targetContents()`; extend `check-search-foundation.js` to verify exact generated head, unique canonical/description, parseable JSON-LD and expected canonical URL for every tool.
- [ ] **Step 6: Extend Sitemap generation** to include the explicit `toolPages` array, preserving home, blog archive and all article URLs. Do not recursively scan `tools/`.
- [ ] **Step 7: Run** `node --test scripts/search-foundation.test.js`, `node scripts/generate-search-assets.js --write`, then `node scripts/check-search-foundation.js`.
  **Expected:** tool SEO checks report 8/8; Sitemap includes 66 URLs (home + blog + 56 posts + 8 tools); all existing blog SEO checks remain green.
- [ ] **Step 8: Commit** as `feat: add SEO metadata for public tools`.

### Task 2: Static HTML blog archive in public dist

**Files:**
- Create: `scripts/blog-archive.js`
- Create: `scripts/blog-archive.test.js`
- Modify: `tools/blog/index.html` (add stable empty generation markers only)
- Modify: `scripts/build-public-dist.js`
- Modify: `scripts/check-public-dist.js`
- Modify: `scripts/public-dist.test.js`

**Interfaces:**
- `buildBlogArchive(posts, featuredSlugs, options)` returns `{ featuredHtml, archiveHtml, noScriptHtml }`.
- `renderBlogArchivePage(sourceHtml, posts, featuredSlugs, options)` replaces the exact featured/archive marker blocks and returns the transformed HTML.
- `buildPublicDist()` transforms only `dist/tools/blog/index.html` after copying the allowlisted files.
- `checkPublicDist()` compares the dist archive against a freshly generated expected page.

- [ ] **Step 1: Write failing tests** for 0/1/10/11/56 posts, featured filtering, duplicate/unknown slugs, escaping, unique article links, 10-item pagination boundary, and full `<noscript>` fallback.
- [ ] **Step 2: Run** `node --test scripts/blog-archive.test.js`.
  **Expected:** FAIL because the archive renderer does not exist.
- [ ] **Step 3: Implement** a pure Node module that validates metadata shape, renders the same existing `.post-row` / `.featured-section` classes, groups default articles by YYYY.MM, shows the first 10 non-featured posts, and places all remaining article links in a `<noscript>` section. Escape all dynamic text and URLs.
- [ ] **Step 4: Add** `blog-archive:featured` and `blog-archive:archive` marker comments around the current placeholders in `tools/blog/index.html`; do not change CSS or visible source-page content.
- [ ] **Step 5: Integrate** the renderer into `build-public-dist.js` after allowlist copying. The source HTML stays dynamic; only dist receives generated static markup.
- [ ] **Step 6: Extend** `check-public-dist.js` to rebuild the expected archive from source metadata and compare the exact dist page. Add public-dist tests proving all 56 links exist, each exactly once, and every relative article link resolves to an allowlisted artifact.
- [ ] **Step 7: Run** `node --test scripts/blog-archive.test.js scripts/public-dist.test.js`, `node scripts/build-public-dist.js --out dist/smoke`, and `node scripts/check-public-dist.js --out dist/smoke`.
  **Expected:** tests pass; public dist smoke passes; no source article metadata or article body is modified.
- [ ] **Step 8: Commit** as `feat: render static blog archive in public dist`.

### Task 3: Generate llms.txt and publish it in public dist

**Files:**
- Create: `scripts/llms-index.js`
- Create: `scripts/llms-index.test.js`
- Modify: `scripts/site-config.js` (add 8 explicitly curated public projects)
- Modify: `scripts/generate-search-assets.js`
- Modify: `scripts/search-foundation.test.js`
- Modify: `scripts/public-dist-manifest.js`
- Create: `llms.txt`

**Interfaces:**
- `buildLlmsIndex(config, posts, featuredSlugs)` returns deterministic UTF-8 Markdown text.
- `generate-search-assets.js` writes/checks `llms.txt` in the same preview / `--write` / `--check` flow as robots, sitemap and RSS.
- `public-dist-manifest.js` explicitly includes root `llms.txt`.

- [ ] **Step 1: Write failing tests** for site identity, blog/RSS/Sitemap links, featured article resolution, tool page list, public project list, escaped Markdown link labels, and exclusion of unconfigured/private repositories.
- [ ] **Step 2: Run** `node --test scripts/llms-index.test.js`.
  **Expected:** FAIL because the LLM index generator does not exist.
- [ ] **Step 3: Add** `siteConfig.publicProjects` with exactly 8 public entries: AI Workflow Kit, Multi-platform Content Library, LocalFolderBridge, Harness Starter, AI Daily Radar, Codex Work Watch, AI Usage Dashboard, and FolderLens. The first four are the current homepage selections; the remaining four are additional public projects.
- [ ] **Step 4: Implement** `buildLlmsIndex()` using `site-config.js`, `posts-meta.json`, and `featured-posts.json`. Include 5 featured articles, 8 public tools, and only these explicitly curated public GitHub projects. Do not enumerate repositories from the account automatically.
- [ ] **Step 5: Integrate** `llms.txt` into `targetContents()` and the existing generator's dry-run / `--write` / `--check` modes. Add `llms.txt` to the public-dist allowlist and its manifest test.
- [ ] **Step 6: Run** `node --test scripts/llms-index.test.js scripts/search-foundation.test.js scripts/public-dist.test.js`, `node scripts/generate-search-assets.js --write`, and `node scripts/check-search-foundation.js`.
  **Expected:** `llms.txt` is current, contains only explicit public entries, and tool/Sitemap checks remain green.
- [ ] **Step 7: Commit** as `feat: add public llms content index`.

### Task 4: Documentation and integrated verification

**Files:**
- Modify: `tools/blog/README.md`
- Modify: `CONVENTIONS.md`
- Modify: `docs/agent-context/memory.md`

- [ ] **Step 1: Update** `tools/blog/README.md` to state that public dist contains a metadata-generated static initial archive and a no-script fallback; the source archive remains JavaScript-enhanced.
- [ ] **Step 2: Update** `CONVENTIONS.md` search/discovery section with the 8-page SEO config, explicit sitemap allowlist, generated `llms.txt`, and validation commands. Do not rewrite historical July search-foundation plans.
- [ ] **Step 3: Add** one concise durable architecture note to shared agent memory; do not duplicate detailed implementation instructions.
- [ ] **Step 4: Run** `node --test`, `node scripts/generate-search-assets.js --check`, `node scripts/check-search-foundation.js`, `node scripts/build-public-dist.js --out dist/smoke`, `node scripts/check-public-dist.js --out dist/smoke`, `node scripts/check-repository-policy.js`, and `git diff --check`.
  **Expected:** all commands exit 0; no changes under `.github/workflows/`, `docs/blog/`, `tools/blog/posts/`, or private configuration.
- [ ] **Step 5: Perform a separate review pass** for generated output, escaping, exact Sitemap scope, private-content exclusion and static archive fallback. Record any deferred findings.
- [ ] **Step 6: Commit** as `docs: document discoverability phase two`.

## Shared Interfaces and Ordering

- Task 1 produces `siteConfig.toolPages`, `ensureToolPageSeo()` and the 8-page Sitemap source used by Task 3's `llms.txt`.
- Task 2 is file-isolated from Task 1's SEO modules, but both affect the public HTML build; integrate and run the combined public-dist checks after both.
- Task 3 consumes Task 1's `toolPages` and the existing featured-post metadata; it also adds `llms.txt` to the public-dist manifest, which Task 2's dist Smoke Check will validate after integration.
- Tasks share a single remote branch; branch ref updates must use the latest expected head SHA and must not force-update.

## Review Focus / Final Gate

- Verify 8 tool-page URLs are exact directory canonicals and that no travel or dev-only pages enter Sitemap.
- Verify `<noscript>` contains all non-featured/non-first-page articles while JS-enabled rendering retains the current 5 + 10 default.
- Verify HTML/XML/JSON-LD escaping and marker replacement idempotence.
- Verify `llms.txt` contains public URLs only and does not enumerate all connected GitHub repositories.
- Verify public dist includes `llms.txt` and generated blog archive but no new workflow, credential or private file.
