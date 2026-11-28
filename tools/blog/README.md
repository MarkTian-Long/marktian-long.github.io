# tools/blog — 思考碎片博客

个人对 AI 技术、产品、商业、行业与实践的持续记录。

## 目录结构

```text
tools/blog/
├── governance/                 唯一博客治理入口：SOP、认知审查、Checklist、预览规范等
├── data/                       taxonomy、正式文章索引、精选列表、分享图配置
├── series/                     系列研究 Brief
├── research_backlog.md         跨会话研究待办与聚合候选
├── WRITING_GUIDE.md            Markdown、metadata、发布契约
├── VISUAL_GUIDE.md             首图、资产、来源许可与视觉验收
├── IMAGE_GENERATION_WORKFLOW.md
├── BLOG_DESIGN.md              博客界面设计参考
├── article-template.html       正式文章模板
├── markdown-source.js          单一 Markdown 源稿解析
├── article-runtime.js          主题、阅读信息、参考资料、继续阅读
├── article-links.css           共享链接样式
├── build-preview.js            独立草稿预览构建与首图检查入口
├── sync-post-metadata.js       metadata 与图片登记同步（发布编排器调用）
├── publish.js                  确认稿晋升、资产生成与发布检查编排
├── generate-post.js            正式文章 HTML 生成
├── index.html                  博客归档列表页
├── share-card.html / .css / .js 分享海报（浏览器本地 PNG）
├── vendor/                     本地二维码代码
├── posts/                      已发布 HTML；不在 README 手工维护文章清单
└── previews/                   预览入口（也可能保留已发布文章的历史跳转）
```

文章的权威运行清单为 [`data/posts-meta.json`](data/posts-meta.json)，完整在线目录由 [博客归档页](https://marktian-long.github.io/tools/blog/) 根据运行索引生成；此处只列实际目录和核心职责，不列会过期的手工文章名单。未发布唯一工作稿在 `../../drafts/blog/<slug>.md`，正式源稿在 `../../docs/blog/<slug>.md`，图片资产在 `../../assets/images/blog/<slug>/`。

## 快速使用

- **浏览文章**：直接打开 `index.html` 或从主页「写作」区块进入
- **浏览 GitHub 项目**：归档页的站点导航提供「工具与工作流」，指向首页 `#resources`；桌面侧栏和移动端页首均可访问，与文章分类分开。
- **研究待办**：[research_backlog.md](research_backlog.md) 是研究问题与聚合候选的唯一当前记录。收录、召回、聚合、状态和立项由 `governance/blog-sop.md` 管；整理记录时另读 [待办维护规范](governance/blog-research-backlog-spec.md)，统一编号、创建/更新/核验日期、当前卡片、来源折叠与安全回写，不连续追加多份旧判断。
- **新增文章**：研究/写作先从 `governance/README.md` 进入，按需读取 `governance/blog-sop.md`、`governance/blog-review-checklist.md`、`governance/blog-charts-spec.md` 与对应 `series/*.md`；网站发布契约仍以 `WRITING_GUIDE.md` 和 `VISUAL_GUIDE.md` 为准。未发布完整稿维护在 `../../drafts/blog/<slug>.md`，最终 Markdown 顶部的严格 frontmatter 固定 category、tags、topics、concepts、share_quote 和 relations；标题下唯一 blockquote 是正式 `summary`
- **文章清单**：`data/posts-meta.json` v4 是网站运行索引；文章内容语义以最终 Markdown 为源。单篇 `visuals` 仅在使用图片时声明封面和正文图，根级 `image_contract` 保留历史兼容记录。主页与 Blog 列表仍保持纯文字，不回填历史文章图片；上方为稳定架构树，不手工复制文章清单；完整文章数、标题、链接以运行索引与线上归档为准
- **精选文章**：维护 `data/featured-posts.json` 的有序 slug 列表。当前固定 5 篇，分别覆盖 技术 / 产品 / 商业 / 行业 / 实践五个一级分类且每类恰好 1 篇；第一项仍承担首页唯一「推荐阅读」，Blog 默认页展示全部 5 篇精选。精选只改变发现入口，不写入文章 metadata，也不影响 relations / Continue Reading。
- **正文源稿**：未发布完整稿在 `drafts/blog/<slug>.md` 原位维护；用户确认发布后迁移为 `docs/blog/<slug>.md`，同步 metadata、生成 `tools/blog/posts/<slug>.html` 后删除对应 draft。历史文章可能存在 HTML 与旧 Markdown 不一致，禁止批量覆盖
- **历史检索**：完整读取 metadata 形成高相关/潜在相关/弱相关候选池，并随核心论点、机制、边界、案例或大纲的实质变化滚动重搜；正式大纲前完成最终覆盖扫描。判断历史发表事实时按“线上正式页 → 仓库 HTML → Markdown”读正文。命中不等于应引用，详见 `WRITING_GUIDE.md`。
- **候选预览**：`node tools/blog/build-preview.js --source drafts/blog/<slug>.md` 默认只检查；加 `--write --out build/candidate-site/blog-preview/<slug>` 在空的隔离候选目录生成正式样式页面，并向标准输出打印 JSON 构建报告。入口自动检查首图，复用正式模板和共享资源，不把草稿加入正式 metadata。输出不是部署；首图例外和公开预览授权见 [预览规范](governance/blog-preview-release-spec.md)。
- **正式发布**：作者确认终稿并授权后，按 `.agents/skills/publish-blog/SKILL.md` 执行。新文章使用 `node tools/blog/publish.js --slug <slug> --approved-ref <完整40位SHA> --prepare`，可先附加 `--dry-run` 检查计划。编排器从批准稿验证起，统一完成 metadata/图片登记、HTML、SEO/RSS/sitemap、预览跳转、唯一源稿迁移、等价检查、全量校验和 public-dist Smoke Test；只准备工作树，不自动 commit/push。底层 `sync-post-metadata.js`、`generate-post.js` 和 `generate-search-assets.js` 保留给局部维护与专项排查。新文首图及其他图片契约以 [VISUAL_GUIDE.md](VISUAL_GUIDE.md) 为准；不得为构建预览提前走正式同步路径。
- **材料与活人感审校**：`.agents/skills/blog-human-writing/` 是唯一长期规则真源。每次真正执行材料检查或活人感审校，读取其当前 `SKILL.md` 和对应 `references/`；已安装 Skill 与 `.claude/skills/` 仅为运行入口/兼容副本，不能独立演化。每篇正式 Blog 完成后的统一规范沉淀复盘，评估是否存在应写回权威源的跨文章稳定规则。
- **taxonomy impact review**：每篇发布始终运行 `node tools/blog/check-blog-taxonomy.js`。只有本次发布/维护实际修改 `tools/blog/data/blog-taxonomy.json` 时，才在确定性校验后执行 `node tools/blog/audit-taxonomy-impact.js --base-ref <真实的 taxonomy 变更前 git ref>`；普通文章发布不需要 base ref，也不得运行 placeholder audit 命令。category 的 `core_question`、`definition`、`status`，以及 tag/topic 的 `definition`、`distinguish_from`、`notes`、`status`（包括范围、rename、merge、deprecate 等语义变化）都会触发全历史 metadata 第一轮筛查；新增 vocabulary 也不能只按新词字面召回。`--categories` 只标示优先阅读范围；已落地定义的专项复核必须明确使用 `--focus category:<名称> --full-screen` 才会跨产品/行业等边界全量筛查。脚本不改历史 metadata；Codex 再按 title / summary / concepts / tags / topics / category 缩小真正相关候选，并以“线上正式页 → 仓库 HTML → Markdown”读正文，逐篇给出保持/人工复核/有充分理由建议迁移，不为分类数量均衡迁移。
- **分享海报**：文章页的「生成分享图」统一进入 `share-card.html?slug=<slug>`；预览页的「打开原文」、二维码区和底部域名均直达 canonical 原文，导出的 PNG 是普通图片，仅通过二维码跳转。海报页加载与首页相同的 Libre Baskerville / Source Sans 3 字重组合。二维码资产更新后运行 `node scripts/sync-share-card-vendor.js --check`，不使用第三方二维码服务。
- **继续阅读**：新文只单向声明已确认的 `builds_on` / `revises` / `companion`；旧文的后续延展/修正由 metadata 自动反向更新，正文不回写。
- **参考资料**：仅写语义化标题、分组、列表和可选可信度说明；历史 `.refs` 与新文章的 Markdown 结构均由 `article-runtime.js` 统一为默认收起、可键盘展开的紧凑辅助信息层。目录或 URL 锚点直达会自动展开，不批量改写 HTML 正文。
- **阅读预期**：文章页由 `article-runtime.js` 从最终 HTML 正文在本地计算“约 X 字 · Y 分钟阅读”；排除摘要、参考资料、代码块和图片说明，按每分钟 400 个阅读单位估算。不得在 Markdown 或 `posts-meta.json` 手填该数值。
- **发布检查**：提交前始终运行 `node tools/blog/check-blog-taxonomy.js`；只有本次发布/维护实际修改 `tools/blog/data/blog-taxonomy.json` 时，才以真实变更前 Git ref 运行 `node tools/blog/audit-taxonomy-impact.js --base-ref <真实的 taxonomy 变更前 git ref>` 并完成正文审查。普通文章发布不要求 taxonomy base ref。之后再运行 `node scripts/check-blog-images.js`、`node scripts/generate-search-assets.js --check`、`node scripts/check-search-foundation.js`、相关 Node 测试、`node scripts/migrate-blog-continue-reading.js --check`、`node scripts/check-blog-body-integrity.js` 和 `node scripts/check-repository-policy.js`。新公开图片还必须进入 metadata 声明的 public-dist 白名单，运行 `npm run build:public` 与 `npm run check:public-dist`，并按 `CONVENTIONS.md` 完成文章页桌面/移动、浅色/深色和图片失败状态的视觉检查 统一 CI 的 `scripts/check-all.js` 会自动执行正式 Markdown ↔ metadata 核对与既有「继续阅读」结构只读检查；这不能替代人工语义审校。`check-blog-body-integrity.js` 是提交前比较工作区正文与 HEAD 的防误改检查，不应把干净 checkout 中的空比较误称为历史正文安全审计。
- **发布交付**：检查通过后只暂存本次文章及对应生成资产，完成 review 和 commit；`git push` 前核对目标、范围与已有授权，授权已覆盖时沿用，不重复请求同一确认
- **推送回退**：直连 GitHub 失败时按 `CONVENTIONS.md` 的「GitHub 推送网络排查」使用临时代理，不修改全局 Git 配置，也不把凭据写入仓库
- **完成标准**：远端 `main` 与本地 HEAD 指向同一提交，线上文章 URL 返回 HTTP 200 且包含唯一标题，并按 `WRITING_GUIDE.md` 的可发现性契约核对博客目录（必要时包括 RSS）。仅生成 HTML、完成 commit 或只有 GitHub Actions 绿色状态都不能代替实际读者入口验收；执行细节由 `.agents/skills/publish-blog/SKILL.md` 维护
- **域名维护**：搜索资产与自动生成的页面 head 域名维护在 `scripts/site-config.js`；正文显式链接按内容语义单独核对。Search Console/Bing 验证属于后续账号操作，不写入文章或本目录配置

## 嵌入方式

本模块在主页以独立 section 展示（非 iframe），文章在新标签页打开。
