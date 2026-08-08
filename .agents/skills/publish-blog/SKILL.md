---
name: publish-blog
description: 发布 qiuzhi 博客文章的端到端流程，覆盖 Markdown 源稿、元数据、HTML 与搜索资产生成、检查、review、commit、HITL 推送、GitHub 网络与凭据回退、远端同步和 GitHub Pages 线上验证。用户要求“发布博客”“上传文章”“推送文章到 GitHub”或继续处理未完成的博客发布时使用。
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

## 2. 生成发布资产

1. 确认元数据包含 `slug/date/title/summary/tags/topics/concepts/category/url`，且 `url` 为 `posts/<slug>.html`。
2. 审核 `summary` 是否自然说明对象/问题、核心判断及关键机制或边界；审核 `concepts` 是否为 4-7 个具体、去重、非泛词的语义锚点，且不与 `tags/topics` 精确重复。若分类、标签、摘要或 concepts 存在实质歧义时向用户确认。
3. 生成文章：

   ```powershell
   node tools/blog/generate-post.js docs/blog/<slug>.md tools/blog/posts/<slug>.html
   ```

4. 刷新搜索发现资产：

   ```powershell
   node scripts/generate-search-assets.js --write
   ```

5. 不批量用旧 Markdown 覆盖历史文章 HTML。生成器触碰但 `git diff --name-only` 不显示的文件属于换行符状态，不纳入提交。

## 3. 验证与提交

依次运行：

```powershell
node scripts/generate-search-assets.js --check
node scripts/check-search-foundation.js
node --test scripts/search-foundation.test.js
node scripts/check-repository-policy.js
```

然后：

1. 检查新 HTML 包含正确标题、canonical、description、JSON-LD 和文章正文。
2. 执行项目要求的 review。
3. 只暂存 Markdown、文章 HTML、元数据、真实发生内容变化的搜索资产，以及为支持该文章所需的生成器修复。
4. 运行 `git diff --cached --check` 和 `git diff --cached --stat`，再按 `docs: <描述>` 提交。

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

报告提交 SHA、远端同步状态、线上文章链接和验证结果。只完成生成、commit 或 push 中的一部分时，明确说明剩余步骤，不得声称“已发布”。
