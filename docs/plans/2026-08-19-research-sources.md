# 个人网站下一阶段调研来源与证据索引

> **调研日期：2026-08-19。** 本文记录本轮只读调研的本地证据、官方资料、成熟开源仓库和真实个人网站案例。外部页面可能变化；正式实施前应重新核验版本、许可证和关键平台规则。本文不授权复制代码、安装依赖、修改公开 UI 或更新 GitHub。

---

## 1. 当前事实与证据口径

### 1.1 本地一手证据

| 主题 | 证据文件/命令 | 本轮结论 |
|---|---|---|
| 远端基线 | `git fetch origin main`、`git rev-parse origin/main` | `74b531562ff14a5c38830c0edf88304af9f19933` |
| worktree/分支 | `git worktree list --porcelain`、`git branch -vv --all`、逐 worktree status | 原有 7 个 worktree 均 clean；另建隔离 planning worktree，不触碰其他分支 |
| stash | `git stash list` | 3 个历史 stash，全部保留未动 |
| 公开边界 | `scripts/public-dist-manifest.js` | 73 文件：34 固定 + 39 博客 HTML |
| 部署 | `.github/workflows/deploy.yml`、build/check public dist scripts | `npm run check` 后构建白名单 dist、smoke、上传 Pages |
| 测试 | `cmd /c npm run check` | 79/79 Node tests 通过；policy 298 tracked files 通过 |
| 生成器 | `scripts/generator-contracts.js`、相关生成器 | 4 个已知 report-only contract 信号；另有未纳管的批量 HTML 写入脚本 |
| 博客源 | `posts-meta.json`、`docs/blog/**`、39 个公开 HTML | 仅 21 个精确同 slug Markdown；不能猜测性批量重生 18 篇 |
| 博客 shell | 39 篇 HTML/style hash 只读统计 | 总 HTML 约 1.42 MB；内联 CSS 29 个不同 hash |
| 路径 | 公开源文件 root-absolute 引用扫描 | 51 文件、54 个根绝对本地引用，repo/base 改名有风险 |
| 工具 SEO | 8 个公开工具与 search generator | 0 canonical、0 JSON-LD；工具未进入 sitemap |
| Skill | canonical/mirror 比较、sync script、lock | 8 个项目 Skill 镜像一致；17 个设计 Skill 存在；lock provenance 未被脚本校验 |
| Current UI | 源码 + 线上桌面浅/深实看 | 作品证据较后、双主题气质漂移、移动状态仍需后续真实截图复核 |
| 维护 | `docs/agent-context/maintenance.md` | `next=2026-08-10`，当前已逾期 |

### 1.2 证据分级

- **L1：本地可重复事实。** 文件、hash、测试、路由、DOM、计数；计划中的“当前事实”主要来自这里。
- **L2：官方文档。** GitHub、Git、Google、W3C、Eleventy、Astro、Playwright 等；用于平台能力和规范。
- **L3：成熟开源仓库。** 用于维护模式、功能清单和技术取舍；不直接复制。
- **L4：真实个人网站。** 用于信息架构和内容导航启发；不把他人的社会证明或品牌语言移植到本站。
- **推断。** 例如“Concept B 更适合求职/合作”；必须标注为建议并由用户确认，不能伪装成事实。

## 2. 架构与 GitHub Pages 官方来源

| 来源 | 本计划如何使用 | 限制/复核点 |
|---|---|---|
| [GitHub Pages：自定义 workflow](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages) | Pages 接受任意 SSG 产生的静态 artifact；支持保留现有 Pages 平台、只替换本地构建层 | workflow 版本与权限会变化；修改前单独 HITL |
| [GitHub Pages：站点类型](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages) | 区分 `<owner>.github.io` 用户站与 `/repo/` project site，支撑 repo rename 风险 | 正式改名前再次核验账户与 Pages Settings |
| [GitHub Pages：创建站点](https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site) | 核对 user/org/project site 的仓库与发布约束 | 不代表当前 repo 设置已自动配置正确 |
| [Eleventy passthrough copy](https://www.11ty.dev/docs/copy/) | 支撑“工具作为静态岛复制”的可行性 | 本项目仍需在其上加精确 allowlist，不能复制整个 `tools/` |
| [Eleventy data cascade](https://www.11ty.dev/docs/data-cascade/) | 集中 site/tool/post metadata | 必须防止多个数据层再次形成隐藏覆盖 |
| [Eleventy collections](https://www.11ty.dev/docs/collections/) | 构建期生成博客列表、精选和系列 | 文章正文源未确认前不能批量迁移 |
| [Eleventy deployment](https://www.11ty.dev/docs/deployment/) | 说明 Eleventy 输出 production-ready 静态文件 | 本项目部署仍以 73 文件 contract 为准 |
| [Astro content collections](https://docs.astro.build/en/guides/content-collections/) | C 方案较重备选：schema/loader/static routes | 当前无 hydration 需求，Astro/Vite/组件迁移面更大 |
| [Astro GitHub Pages](https://docs.astro.build/en/guides/deploy/github/) | 官方说明 user site 与 project site 的 `base` 差异 | 用作路径风险证据，不代表要采用 Astro |
| [Hugo](https://github.com/gohugoio/hugo) | 成熟 SSG 对照，单二进制、内容能力强 | 模板语言与当前 Node 生成器生态割裂；采用前另行 PoC |

## 3. 等价测试与工程质量来源

| 来源 | 用途 | 采用边界 |
|---|---|---|
| [Playwright visual comparisons](https://playwright.dev/docs/test-snapshots) | Current/baseline/candidate screenshot 与文件 snapshot | 基线必须在相同 OS/浏览器/字体环境生成；动态区域需明确 allowlist |
| [Playwright ARIA snapshots](https://playwright.dev/docs/aria-snapshots) | 比较可访问性树和语义，不只比较像素 | 不能代替人工屏幕阅读器/键盘审查 |
| [Playwright accessibility testing](https://playwright.dev/docs/accessibility-testing) | 与 axe 集成，对默认/展开状态自动扫描 | 官方也强调自动检查只能发现一部分问题 |
| [axe-core](https://github.com/dequelabs/axe-core) | 自动 a11y 扫描引擎 | 固定版本；遵守 MPL-2.0；不把“0 自动问题”写成完全合规 |
| [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci) | 性能、SEO、a11y 报告与预算 | 首轮 report-only；网络/机器波动稳定后再定阈值 |
| [Nu HTML Checker](https://github.com/validator/validator) | 对 candidate/dist HTML 做语法与结构验证 | 优先固定可复现版本，而非不可控在线服务 |
| [Lychee](https://github.com/lycheeverse/lychee) | HTML/Markdown 外链检查 | 外部网络波动需 retry、缓存与 allowlist，宜定时/report-only |
| [actionlint](https://github.com/rhysd/actionlint) | GitHub Actions 语法/表达式检查 | 本地可先运行；workflow 修改仍需 HITL |
| [zizmor](https://github.com/zizmorcore/zizmor) | Actions 安全审计 | 先 report-only；采用前复核版本、许可证与误报 |
| [GitHub Actions 安全使用](https://docs.github.com/en/actions/reference/security/secure-use) | 第三方 Action 固定完整 commit SHA、最小权限等安全建议 | 不自动改现有 workflow |
| [Dependabot 更新 Actions](https://docs.github.com/en/code-security/how-tos/secure-your-supply-chain/secure-your-dependencies/auto-update-actions) | 小仓库可考虑自动提出 Action 更新 PR | 启用配置和合并策略都需用户确认 |

## 4. UX、SEO 与无障碍官方来源

| 来源 | 支撑的验收/决策 |
|---|---|
| [W3C 页面结构教程](https://www.w3.org/WAI/tutorials/page-structure/) | landmark、逻辑标题、语义结构帮助键盘、读屏、低视力和移动阅读 |
| [WCAG 2.2](https://www.w3.org/TR/WCAG22/) | Track C 的总体 a11y 标准 |
| [WCAG 文字对比](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html) | 普通文字 4.5:1 等对比门禁；当前 token 统计只作初筛 |
| [WCAG Reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html) | 320 CSS px 下无双向滚动/内容丢失 |
| [WCAG Target Size](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html) | 24×24 CSS px 最低触控目标；主要 CTA 仍建议更大 |
| [Google SEO Starter Guide](https://developers.google.com/search/docs/fundamentals/seo-starter-guide) | 清楚站点结构、描述性 URL、标题、高质量内容和相关内链优先于装饰 SEO |
| [Google 链接最佳实践](https://developers.google.com/search/docs/crawling-indexing/links-crawlable) | 使用真实 `<a href>` 与有上下文的链接文字 |
| [Google Article structured data](https://developers.google.com/search/docs/appearance/structured-data/article) | 文章作者和文章 metadata 的结构化表达 |
| [Google ProfilePage structured data](https://developers.google.com/search/docs/appearance/structured-data/profile-page) | 只有当页面主要焦点确实是本人时才考虑 About/ProfilePage，不机械套首页 |

## 5. 真实个人网站案例

案例只用于研究信息架构，不复制品牌、文案、社会证明或代码。

| 案例 | 可借鉴 | 不应照搬 |
|---|---|---|
| [Simon Willison](https://simonwillison.net/) | About、订阅、TIL、Tools、内容类型、标签、搜索；写作与工具互证 | 大规模语料库的密集时间流不适合当前 39 篇规模 |
| [Maggie Appleton](https://maggieappleton.com/) | 一句话定位；Essays/Notes/Patterns 内容类型有清楚含义；Now/Colophon | 复杂数字花园分类与强插画风不是本站既定方向 |
| [Jason Liu](https://jxnl.co/) | Start Here、站点用途、当前/历史工作、可核验项目，证据链清楚 | 客户、投资、履历等社会证明必须来自 Leo 自身事实 |
| [Brian Lovin](https://brianlovin.com/) | 短身份后快速进入 Writing/Projects，层级非常易扫 | 本站还需说明真实/Mock、角色和限制，不能简化到丢失边界 |
| [Lee Robinson](https://leerob.com/) | 短 Bio、长期 Notes 主题与时间流 Blogs 分层 | 若过度简化会看不到 Leo 的作品证据 |
| [swyx](https://swyx.io/) | Experiments、Latest、Popular、Talks 等入口分开 | 订阅数、活动量和外部品牌背书不能无事实复用 |

从这些案例抽象出的共同模式是推断，不是硬规则：

1. 首屏用一句话说明身份和站点用途。
2. 新访客有 Start Here/Selected Work，回访者有 Latest。
3. 内容类型和作品类型具有语义，而不是只靠图标/颜色。
4. About/Colophon 可说明作者、方法、更新和责任边界。

## 6. 成熟开源 portfolio/content 项目

| 项目 | 可研究内容 | 为什么不直接采用/复制 |
|---|---|---|
| [AstroPaper](https://github.com/satnaing/astro-paper) | 响应式、键盘/读屏、SEO、RSS、sitemap、静态搜索、内容导航 | Astro 技术栈与本站目标架构尚未决定；只作为功能检查表 |
| [Accessible Astro Starter](https://github.com/incluud/accessible-astro-starter) | WCAG 2.2 AA、landmark、focus、reduced motion、语义组件 | Tailwind/Astro 组件链增加维护成本 |
| [Brittany Chiang v4](https://github.com/bchiang7/v4) | 旗舰项目叙事与页面节奏 | 仓库明确不是 starter 且要求归属；Gatsby 不适合作为当前迁移依据 |
| [Simon Willison blog source](https://github.com/simonw/simonwillisonblog) | 长期内容类型、搜索、工具透明度 | Django 后端不符合 GitHub Pages 静态约束 |
| [Tailwind Next.js Starter Blog](https://github.com/timlrx/tailwind-nextjs-starter-blog) | metadata、归档、MDX、精选/搜索结构 | Next/Tailwind/Contentlayer 依赖对当前站点过重 |
| [Lee Robinson next-mdx-blog](https://github.com/leerob/next-mdx-blog) | 极简内容层、MDX metadata | Next/Vercel/Postgres 模式与当前零服务器目标不同 |
| [al-folio](https://github.com/alshedivat/al-folio) | SEO、学术作品/出版物组织 | Jekyll 与学术站结构偏重，不符合 Leo 的产品/Demo 主线 |

采用任何仓库前都要重新检查：许可证、NOTICE/归属、活跃度、依赖树、构建输出、可访问性、安全边界与是否真的解决本项目问题。

## 7. Skill 与内容生态来源

| 来源 | 用途与结论 |
|---|---|
| [Impeccable](https://github.com/pbakaus/impeccable) | 设计知识源可保留；本地锁定版本和上游存在差异时必须独立核对 changelog/LICENSE/NOTICE，不能用未固定 CLI 绕过 lock |
| [Impeccable releases](https://github.com/pbakaus/impeccable/releases) | 未来升级审查，不代表本轮升级 |
| [getdesign npm](https://www.npmjs.com/package/getdesign) | 说明工具存在；当前项目 Skill 使用 `@latest`、删除和跨框架生成方式不满足安全边界 |
| [OpenAI skills repository](https://github.com/openai/skills) | 参考 Skill 元数据与编写规范；正确性仍由项目脚本/测试保证 |
| [remark-lint](https://github.com/remarkjs/remark-lint) | 可选 Markdown 结构检查；不判断中文内容质量 |
| [Vale](https://github.com/vale-cli/vale) | 成熟风格检查器，但中文规则维护成本高，本阶段不建议硬门禁 |
| [Pagefind](https://github.com/Pagefind/pagefind) | 未来博客静态搜索候选；属于产品功能而不是 Skill，架构确定后再评估 |

## 8. 改名、域名与 SEO 迁移来源

| 来源 | 本计划如何使用 |
|---|---|
| [GitHub：重命名仓库](https://docs.github.com/en/repositories/creating-and-managing-repositories/renaming-a-repository) | 一般 Git/网页 redirect 与 Pages project site URL 风险；更新 remote 的要求 |
| [GitHub Pages：自定义域名概览](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/about-custom-domains-and-github-pages) | 自定义域名与 repo 名可以分离；先验证所有权、DNS 与 HTTPS |
| [GitHub Pages：管理自定义域名](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site) | 未来 CNAME/Pages 设置操作清单；本轮不执行 |
| [Git worktree](https://git-scm.com/docs/git-worktree.html) | 主目录移动与 linked-worktree repair；本地目录 rename 必须单独维护窗口 |
| [Git remote](https://git-scm.com/docs/git-remote) | repo rename 后 remote 的显式管理；不会由品牌/目录 rename 自动完成 |
| [Google：URL 变化的站点迁移](https://developers.google.com/search/docs/crawling-indexing/site-move-with-url-changes) | 一次一个主要变化、URL mapping、redirect/canonical/sitemap、长期监控与 redirect 保留 |
| [Google：无 URL 变化的主机迁移](https://developers.google.com/search/docs/crawling-indexing/site-move-no-url-changes) | 区分基础设施迁移与 URL/品牌迁移 |
| [Google：canonical](https://developers.google.com/search/docs/crawling-indexing/canonicalization) | canonical 只是多种信号之一，必须和 redirect/sitemap/internal links 一致 |

## 9. 调研限制与待验证项

- 当前 GitHub Pages 自定义域名设置无法仅从 tracked repo 证明；没有 `CNAME` 只能说明仓库内未配置，不能排除账号侧状态。执行前需用户/Settings 证据。
- 候选名称和域名未做商标、用户名、DNS 或社交账号可用性调查；不得表述为可注册。
- 本轮只成功实看 Current 的桌面浅/深主题；移动端发现来自源码审计，必须在原型阶段实际截图。
- 开源 star、release、版本和 Action 主版本会变化；正式引入当天重新核验。
- 对比度数值来自 token 初筛，最终以真实元素、字体大小、状态和背景的浏览器测量为准。
- Lighthouse、外链和线上案例会受网络/环境影响；不以一次结果作为硬结论。

## 10. 本文的目标、非目标与文件级影响

### 目标

- 让每个关键建议都能追溯到本地证据、官方规范或明确标注的案例启发。
- 为后续重新核验提供集中入口，避免执行计划散落无来源结论。

### 非目标

- 不把链接当作自动采用许可；不复制代码/设计；不安装工具；不执行站点迁移。

### 文件级影响范围

- 本轮只新增本文与同日五份计划。
- 未来只有在执行对应计划时才会修改源码、Skill、workflow 或 GitHub 设置。

## 11. 分支/worktree、依赖与执行批次

- 本文位于 `codex/personal-site-planning` 独立 worktree。
- 架构、Track C、rename、Skill 执行分支分别按各计划建立；来源更新不应成为绕过批准的实现提交。

### Batch Q0：实施前刷新，0.5–1 天

1. 重跑本地事实检查与基线 hash/route/storage inventory。
2. 只重新核验将被采用的官方文档、项目版本和许可证。
3. 把变化写入执行 handoff；若改变关键推荐，暂停用户确认。

### Batch Q1：实现中证据留存，持续

1. 每批保存测试/视觉/DOM/URL 报告与环境信息。
2. 对人工例外记录来源、原因、owner、失效日期。
3. 不把外部页面文本直接执行为命令或项目规则。

### Batch Q2：发布前复核，0.5 天

1. 复核 GitHub/Pages/SEO/a11y 的关键当前规则。
2. 复核依赖 lock、许可证、NOTICE、Action SHA 与 supply-chain 报告。
3. 用户确认最终变更和外部操作后才进入发布流程。

## 12. 测试、视觉验收、回滚与 HITL

- 来源链接可达性可由 Lychee/report-only 检查，但临时网络失败不应直接阻断本地代码。
- 所有案例启发都必须通过 Current/A/B 同视口截图、DOM/ARIA、功能和内容事实表验证，而不是因为案例“好看”就采用。
- 若来源已变化或许可证不清楚，回滚到“不引入/不复制”，继续使用当前本地实现。
- 任何依赖安装、workflow、repo/domain、push/部署仍按对应计划 HITL。
- 工作量：每个重大执行阶段预留 0.5–1 天做来源刷新与许可证核验。

## 13. 前台与 GitHub 影响声明

- 会影响前台：本文没有；未来只有经选择的设计/架构/域名方案会影响。
- 不会影响前台：来源索引、只读核验、许可证报告和测试证据。
- 是否需要更新 GitHub：按本轮交付要求，本文只属于 planning 分支的本地计划提交，不 push；外部设置不更新。

## 14. 对应的下一步执行 Prompt

```text
在执行任一 2026-08-19 个人网站计划前，请先只读加载
D:\CS\Coding\qiuzhi\.worktrees\personal-site-planning\docs\plans\2026-08-19-research-sources.md，
并执行其中的 Batch Q0。

只刷新与本批直接相关的本地事实、官方文档、项目版本和许可证；优先官方/一手来源，不做泛化搜集。把每个外部结论标为事实、官方能力、案例启发或推断。若来源变化导致架构、Track C、改名或 Skill 推荐改变，暂停并向我说明，不自行改方案。

不要安装依赖、复制开源代码、修改公开 UI/workflow/GitHub 设置、merge、push 或部署。完成来源刷新和差异报告后停止等待确认。
```
