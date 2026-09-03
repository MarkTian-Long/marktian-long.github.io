---
name: publish-blog
description: 发布 qiuzhi 博客文章的端到端流程，覆盖 Markdown 源稿、视觉资产、元数据、HTML 与搜索资产生成、检查、review、commit、HITL 推送、GitHub 网络与凭据回退、远端同步和 GitHub Pages 线上验证。用户要求“发布博客”“上传文章”“推送文章到 GitHub”或继续处理未完成的博客发布时使用。
type: workflow
---

# 发布博客

将“发布完成”定义为：源稿和生成资产已提交，远端分支已同步，线上文章返回 200 且标题正确。

## 1. 预检

1. 按 `AGENTS.md` 顺序读取共享上下文、`tools/blog/README.md`、`tools/blog/WRITING_GUIDE.md` 和 `docs/repository-policy.md`。
2. 确认源稿位于 `docs/blog/<slug>.md`，从文件名取得 kebab-case `slug`。
3. 运行 `git status --short --branch`、`git diff --name-only` 和 `git diff --cached --name-only`。保留用户已有改动，只处理本次文章相关文件。
4. 读取 `tools/blog/data/posts-meta.json`。使用 JSON 解析处理元数据，不做字符串拼接。
5. 判断恢复点：
   - 若文章已在本地提交且分支显示 `ahead`，核对最新提交包含本次文章后直接进入“推送 HITL”，不要重复生成或创建空提交。
   - 若本地与远端已同步，直接进入线上验证；线上也已通过时报告完成。
   - 只有文章资产缺失或存在真实内容差异时，才继续生成、验证和提交。
6. 若源稿末尾含 `publish_handoff`，先确保该 slug 已存在于 `posts-meta.json`，再运行 `node tools/blog/publish-handoff.js --write <source.md>`；不要先运行交接脚本再补元数据。

## 2. 生成发布资产

1. 发布阶段由 Codex 按 `tools/blog/WRITING_GUIDE.md` 从最终 Markdown 正文选择 `share_quote` 并写入 `posts-meta.json`；Markdown 不需要携带该字段。确认元数据包含 `slug/date/title/summary/share_quote/tags/topics/concepts/category/url`，且 `url` 为 `posts/<slug>.html`。
2. 审核 `summary` 是否自然说明对象/问题、核心判断及关键机制或边界；审核 `concepts` 是否为 4-7 个具体、去重、非泛词的语义锚点，且不与 `tags/topics` 精确重复。若分类、标签、摘要或 concepts 存在实质歧义时向用户确认。
3. 在最终内容与元数据评审完成后、生成 HTML 前执行视觉阶段：
   - 图片完全可选。先判断封面、正文图或纯文字哪种形式最适合文章；纯文字文章可省略 `visuals` 并让 OG/Twitter/JSON-LD 回退到全站默认图。若使用图片，再按 `tools/blog/VISUAL_GUIDE.md` 声明 `visuals`、处理资产和复核显示效果。
   - 默认使用 Codex 内置 `imagegen`，此模式不索取、读取或配置 API key。只有用户明确选择时才使用 CLI/API 回退。
   - 按 `tools/blog/VISUAL_GUIDE.md` 为实际使用的图片确定意图和提示词，检查完整分辨率结果；文字、数字和标识可按表达需要使用。若存在明确缺陷，最多进行一次仅针对该缺陷的定向修订，不生成开放式候选批次。
   - 将选中的候选复制到 `build/blog-image-work/<slug>/`，不得只留在 Codex 的生成图片目录。记录每张最终图使用的完整 prompt 和生成模式。
   - 仅为实际需要的封面或正文图运行对应命令；正文图使用唯一、描述性的 kebab-case `name`：

     ```powershell
     node scripts/prepare-blog-image.js --slug <slug> --role cover --input build/blog-image-work/<slug>/<cover-candidate>
     node scripts/prepare-blog-image.js --slug <slug> --role inline --name <descriptive-name> --input build/blog-image-work/<slug>/<inline-candidate>
     ```

   - 将最终路径、尺寸、alt、caption 写入该文章的 `visuals`；声明的封面由生成器从元数据渲染，正文图同时按 `tools/blog/WRITING_GUIDE.md` 的 Markdown 图片语法放到确有解释价值的位置。
   - 已决定保留的图片在 `imagegen` 失败、结果经一次定向修订仍不合格、或资产准备失败时，移除该图片后仍能完整表达的文章可以按纯文字文章继续发布；否则暂停并报告原因。不得为了满足流程而强制配图。
4. 生成文章：

   ```powershell
   node tools/blog/generate-post.js --write docs/blog/<slug>.md tools/blog/posts/<slug>.html
   ```

5. 刷新搜索发现资产：

   ```powershell
   node scripts/generate-search-assets.js --write
   ```

6. 不批量用旧 Markdown 覆盖历史文章 HTML，也不为 legacy 清单中的文章补图。交接脚本若改写了无关 metadata 的格式，先恢复这些无关差异，再继续生成；只保留本文章条目、关系和交接块剥离的真实变化。生成器触碰但 `git diff --name-only` 不显示的文件属于换行符状态，不纳入提交。
7. 生成器模板或搜索资产逻辑变更时，先运行对应 `--check` 与 contract fixture；除本次文章明确产物外，不得以写入模式批量重生历史 HTML。写入前先核对目标文件和既有公开页面 diff。

## 3. 验证与提交

所有写入操作完成后，只运行一次最终验证批次：

```powershell
node scripts/check-blog-images.js
node scripts/generate-search-assets.js --check
node scripts/check-search-foundation.js
node --test scripts/search-foundation.test.js scripts/blog-image-contract.test.js scripts/blog-image-assets.test.js scripts/blog-image-rendering.test.js scripts/public-dist.test.js
node scripts/check-blog-body-integrity.js
node scripts/check-repository-policy.js
node scripts/build-public-dist.js --out build/public-dist-<slug>
node scripts/check-public-dist.js --out build/public-dist-<slug>
```

然后：

1. 检查新 HTML 包含正确标题、canonical、description、JSON-LD、OG/Twitter 图片元数据与完整正文；声明图片时再核对封面和正文图，无图文章不得渲染页首封面并使用全站默认 OG 图。
2. 确认新图片进入 public-dist，`build/blog-image-work/` 候选没有进入；若输出目录已经存在且非空，改用新的显式同级目录，不隐式删除或覆盖。
3. 通过本地 HTTP 服务打开真实文章；在受影响的桌面/移动视口完成一次页面复核。如使用图片，再在明/暗主题下检查图片加载状态，并模拟一次图片加载失败，确认裁切、层级、间距、alt 回退、溢出和目录碰撞均正常。
4. 执行项目要求的 review。若本次 diff 只有内容、metadata 和生成资产，没有运行时、模板、CSS、JS、生成器、部署或安全边界改动，则完成主窗口 staged diff 审查和确定性检查，不让 delegated adversarial Agent 阻塞发布；其他情况执行完整 review。若 delegated review 被启用，等待上限为 60 秒，超时记录为“未完成”并继续，不重复轮询。
5. 只暂存 Markdown、文章 HTML、元数据、最终图片、真实发生内容变化的搜索资产，以及为支持该文章所需的生成器修复；不得暂存候选图或临时 public-dist。
6. 运行 `git diff --cached --check` 和 `git diff --cached --stat`，再按 `docs: <描述>` 提交。若检查后只发生格式修正，先重新确认 staged diff，再只重跑受影响的检查，不重复整套无关 QA。

## 4. 推送 HITL

`git push` 是危险操作。展示目标远端、分支和提交 SHA，明确等待用户确认。未经确认不得推送，禁止 force push。

确认后先尝试：

```powershell
git push origin <branch>
```

失败时按顺序处理：

1. 若直连 `github.com:443` 超时或重置，检查 `git status --short --branch`，确认提交仍为 `ahead`。
2. 探测本机代理。`127.0.0.1:7897` 可用时，先用相同临时代理执行 `git ls-remote origin HEAD`。
3. `ls-remote` 成功后，用临时代理推送，不修改全局 Git 配置：

   ```powershell
   git -c http.proxy=http://127.0.0.1:7897 -c https.proxy=http://127.0.0.1:7897 push origin <branch>
   ```

4. 若代理读取成功但 push 无输出退出，或 Git Credential Manager 报 `wincredman` 无法持久化凭据，请求用户批准系统级执行后重试同一命令。不得改用明文凭据存储、在聊天中索要 Token，或自动修改全局 Git 配置。
5. 若授权审查在命令启动前报 `Unknown parameter: input[...].namespace`，停止重复推送。说明这是 Codex 授权通道故障，建议重启 Codex 并以本仓库为工作区恢复；恢复后从状态核对继续。
6. 未配置 SSH key 时不自动切换 SSH。

## 5. 远端与线上验证

1. 确认 `git status --short --branch` 不再显示 `ahead`。
2. 确认 `git log -1 --oneline --decorate` 同时显示 `HEAD -> <branch>, origin/<branch>`。
3. 用 `git ls-remote origin refs/heads/<branch>` 确认远端 SHA 等于本地 HEAD。
4. 从 `scripts/site-config.js` 和元数据 URL 组合线上地址。
5. 等待 GitHub Pages 刷新并请求文章 URL，确认 HTTP 200 且响应包含文章唯一标题。代理环境下可为 Node 临时设置 `NODE_USE_ENV_PROXY=1` 与 `HTTPS_PROXY=http://127.0.0.1:7897`；不得写入项目配置。
6. 页面尚未刷新时最多重试 3 次，每次间隔约 20 秒，并向用户报告进度。

## 6. 完成报告

报告提交 SHA、远端同步状态、线上文章链接和验证结果；如使用图片，再报告每张图的最终公开路径、完整最终 prompt、生成模式，以及图片/生成器/SEO/public-dist/视觉检查结果。只完成生成、commit 或 push 中的一部分时，明确说明剩余步骤，不得声称“已发布”。
