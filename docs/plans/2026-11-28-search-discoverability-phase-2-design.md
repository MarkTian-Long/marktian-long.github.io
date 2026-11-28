# 网站可检索与 Agent Discoverability 第二阶段设计

日期：2026-11-28
目标分支：`codex/discoverability-phase-2`

## 目标与原因

在现有 GitHub Pages 静态网站上增强搜索引擎和 AI 系统发现、理解公开内容的能力。当前 56 篇博客文章已有独立 URL、Sitemap、RSS 和文章级结构化数据，但博客归档的文章链接由浏览器 JavaScript 动态生成；8 个公开工具页面没有完整的 canonical / JSON-LD / Sitemap 治理；站点根目录缺少统一的 LLM 内容索引。

本阶段延续既有架构，不迁移框架、不引入后端，也不承诺排名或 AI 引用结果。

## 目标

1. **博客归档渐进增强**：GitHub Pages 的 `dist/tools/blog/index.html` 在不执行 JavaScript 时也提供全部 56 篇文章的可爬取链接。首屏 HTML 与现有默认页面一致：5 篇精选 + 10 篇普通文章；其余文章通过 `<noscript>` 后备链接提供。JavaScript 继续负责搜索、分类、时间筛选和分页。
2. **工具页 SEO**：为 8 个公开工具页面生成唯一的 meta description、canonical、Open Graph、Twitter Card 和 `WebPage` JSON-LD。工具描述必须准确说明静态数据、Mock、合成夹具或主动联网边界。
3. **Sitemap 白名单**：在原有首页、博客归档和 56 篇文章之外，显式加入 8 个公开工具页面；不扫描整个 `tools/` 目录，不加入 dev-only 页面、个人行程页或其他未筛选资源。
4. **LLM 导航**：新增根目录 `llms.txt`，索引站点定位、精选文章、8 个公开工具和经过筛选的公开 GitHub 项目。文章标题和摘要继续读取现有 metadata，不另造第二份文章目录。
5. **验证与维护**：生成过程可重复、可检查；public dist 白名单明确包含 `llms.txt`；构建与 Smoke Check 能验证静态归档和本地链接。

LLM 索引的公开 GitHub 项目范围固定为 8 项：当前首页精选的 AI Workflow Kit、多平台资料库、LocalFolderBridge、Harness Starter；以及 AI Daily Radar、Codex Work Watch、AI Usage Dashboard、FolderLens。只引用这些明确登记的公开项目，不自动枚举账号仓库。

## 非目标

- 不改网站视觉设计、CSS、现有 URL、导航顺序或文章正文。
- 不改变 `robots.txt` 的现有 crawler 访问权限，不新增 GPTBot / OAI-SearchBot 特殊规则，不增加 `noindex`。
- 不修改 GitHub Actions 工作流，不配置 Search Console、Bing Webmaster、自定义域名或账号验证。
- 不把私有仓库、个人 Harness 配置、密钥、本机路径或用户数据写入公开索引。
- 不迁移 Astro / Next.js，不新增浏览器运行时依赖或后端服务。
- 不合并到 `main`，不部署生产站点。

## 方案比较与选择

### 博客归档

- **A. 只在源 HTML 手工写入文章清单**：不采用。会复制 `posts-meta.json` 数据，后续文章容易漏更。
- **B. 在 public dist 构建时从 metadata 生成静态首屏和无脚本后备链接**：采用。保留 metadata 单一来源；只改变发布产物，不复制维护文章列表；JavaScript 继续增强既有交互。
- **C. 继续只依赖客户端渲染**：不采用。无法解决不执行 JavaScript 的爬虫只看到空列表的问题。

### 工具页 SEO

- **A. 人工逐页维护 head**：不采用。8 页会出现重复、遗漏和域名漂移。
- **B. 在 `scripts/site-config.js` 集中维护工具页描述，由现有搜索资产生成器生成 head 与 Sitemap**：采用。沿用现有幂等生成和检查机制，页面正文不变。
- **C. 把全部 `tools/` 目录递归加入 Sitemap**：不采用。会误收 dev-only、个人行程或低价值资源。

### LLM 索引

- **A. 手工维护所有文章标题和摘要**：不采用。会与 `posts-meta.json` 形成第二份事实来源。
- **B. 从站点配置、精选文章 metadata 和精选项目清单生成 `llms.txt`**：采用。文章元数据单一来源，项目描述集中维护，支持 `--check`。

## 实施架构

- `scripts/site-config.js`：站点公共配置、8 个工具页的标题/描述/收录状态、8 个公开 GitHub 项目索引。
- `scripts/search-foundation.js`：新增工具页 SEO block 生成、幂等 head 更新和 Sitemap 页面 URL 生成。
- `scripts/generate-search-assets.js`：继续承担 robots、Sitemap、RSS、入口页和文章 SEO；扩展工具页 head 与 `llms.txt` 生成。
- `scripts/llms-index.js`：从 site config、`posts-meta.json` 和 `featured-posts.json` 生成机器可读索引。
- `scripts/blog-archive.js`：从 `posts-meta.json` 和 `featured-posts.json` 生成精选区、默认 10 篇文章和 `<noscript>` 全量链接；对输入进行 HTML 转义。
- `scripts/build-public-dist.js`：复制白名单文件后，只对 dist 中的博客归档页应用静态 HTML 渲染。
- `scripts/check-public-dist.js`：重建预期归档并比较 dist 输出，继续检查所有本地资源引用。
- `scripts/public-dist-manifest.js`：将根目录 `llms.txt` 加入显式公开白名单。

## 公开工具清单

本阶段仅处理现有主页已公开链接的 8 个工具：Agent Hub、AI Insights、ASCI、ESOP Extractor、Radar、Service Agent、Stock、Trends。8 个工具都补齐准确的页面元数据，并作为显式条目进入 Sitemap；不递归加入其他目录。

## 安全与内容边界

- JSON-LD 与 HTML 属性必须转义；文章标题、摘要、标签不能作为可信 HTML 直接拼接。
- `llms.txt` 只引用公开 URL 和公开仓库；不包含私有仓库路径、账号标识、凭据或私人配置。
- 工具页描述保留原型性质：固定快照、Mock、合成数据和主动联网条件必须写清。
- 文章只有月份级日期，不补造 `datePublished`、`dateModified` 或 RSS `pubDate`。
- Sitemap 是发现提示，不保证收录、排名或富结果；`llms.txt` 是辅助导航，不是 Google 排名信号。

## 验收标准

- 静态归档首屏包含 5 篇精选与 10 篇普通文章；无脚本后备链接补齐剩余文章；56 篇文章 URL 恰好各出现一次。
- 启用 JavaScript 后，原有搜索、分类、时间筛选、分页、URL 状态和精选展示行为保持不变。
- 8 个工具页面各有且仅有一个正确 canonical、description 和 `WebPage` JSON-LD；正文不被 SEO 生成器修改。
- Sitemap 保留原有首页、博客和 56 篇文章，并精确增加 8 个工具 URL。
- `llms.txt` 由公开配置与现有文章 metadata 生成，且在 public dist 中可访问。
- 搜索资产检查、归档生成测试、public dist 构建与 Smoke Check 通过。
- 不修改 `.github/workflows/**`，不推送 `main`，不部署。

## 实施者自行决定

- 静态归档标记块和生成模块的具体函数签名，以最小可测接口为准。
- `llms.txt` 的章节顺序与简短描述措辞，以可读、可维护、不过度承诺为准。
- 8 个工具页面的 `<title>` 必须与配置中的机器可读名称一致；若源页面标题与配置不一致，先检查后修正配置，不自动改可见标题。
