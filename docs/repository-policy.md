# GitHub 与本地文件边界

本文档是 qiuzhi 仓库“哪些内容进入 GitHub、哪些内容只保留本地”的唯一判定规则。
GitHub 用于保存可公开部署、可复现开发、可审查维护的项目资产，不作为整台电脑的备份盘。

## 判定顺序

新增或修改文件时，按以下顺序判断：

1. 文件是否决定线上页面、公开数据或部署结果？如果是，必须提交。
2. 文件是否用于重新生成、测试、审查或维护线上结果？如果是，必须提交。
3. 文件是否是项目级规范、设计决策、实施计划、复盘或共享上下文？如果是，必须提交。
4. 文件是否含密钥、个人隐私、本机路径、本机权限、缓存、依赖、临时输出或备份？如果是，只留本地。
5. 无法明确归类时，默认不提交；先转成脱敏、可复现的项目文件，再决定是否提交。

不能用“这次顺手提交、下次不提交”作为例外。改变分类必须先修改本文档和 `.gitignore`。

## 必须提交到 GitHub

| 类别 | 路径或示例 | 原因 |
|---|---|---|
| 线上站点 | `index.html`、`assets/`、`tools/` | GitHub Pages 的实际运行内容 |
| 公开生成物 | `robots.txt`、`sitemap.xml`、`feed.xml`、博客文章 HTML | 线上直接读取，必须和源码同版本 |
| 内容源与数据 | `docs/blog/*.md`、`content/`、`tools/**/data/*.json` | 文章源稿、可公开项目资料和数据源 |
| 生成与验证代码 | `scripts/`、`tools/blog/generate-post.js`、测试文件 | 保证别人和未来 Agent 能复现结果 |
| 脱敏配置模板 | `config.example.js`、不含密钥的公共配置 | 说明配置结构，不携带真实凭据 |
| 项目规范 | `README.md`、`CONVENTIONS.md`、`AGENTS.md`、`CLAUDE.md` | 所有维护者共同遵守 |
| 项目文档 | `docs/plans/`、`docs/reviews/`、`docs/design-kit/`、`docs/agent-context/` | 设计依据、实施记录和共享经验 |
| 项目自定义 Skill | `.agents/skills/` 中在 AGENTS.md 登记的 7 个 Skill | 唯一编辑源，必须能从 GitHub 恢复 |
| Claude 兼容 Skill | `.claude/skills/` | 为 Claude 提供兼容入口；项目自定义 Skill 必须与 `.agents/skills/` 同步提交 |
| 部署定义 | `.github/workflows/` | 可复现部署流程；修改前仍需用户确认 |
| 项目级待办 | `TODO.md` | 只记录项目工作，不写个人隐私或账号信息 |

博客新文章必须同时提交 Markdown 源稿、发布 HTML、`posts-meta.json` 更新和重新生成的搜索发现资产。历史文章的 Markdown 与 HTML 如有差异，按文章逐篇核对，不能批量覆盖。

## 必须只保留本地

| 类别 | 路径或示例 | 处理方式 |
|---|---|---|
| 真实密钥与环境变量 | `*.local.*`、`.env*`、`.npmrc`、`credentials.json`、私钥/证书文件 | 由 `.gitignore` 排除；只允许提交脱敏的 `.env.example` 和 `config.example.*`，线上值使用 GitHub Secrets |
| 本机 Agent 权限与状态 | `.claude/settings.local.json`、`.codex/`、`.gstack/`、`.codebuddy/` | 不提交，不作为项目规则来源 |
| IDE 配置 | `.idea/`、`.vscode/` | 默认只留本地；确需共享时先在本文档登记例外 |
| 依赖与构建缓存 | `node_modules/`、`dist/`、`build/`、日志 | 由源码或命令重新生成 |
| 临时预览与备份 | `index-preview.html`、`*.bak`、`*.tmp`、`docs/blog/files.zip` | 只用于本机恢复或短期检查 |
| 独立 Worktree | `.worktrees/`、`.claude/worktrees/` | Git 管理的本机工作目录，不是仓库内容 |
| Git stash | `git stash list` 中的条目 | 只存在本机 Git 数据库，不会随 push 上传 |
| 个人原始文件 | `docs/personal/`、`docs/*.docx`、`docs/*.pdf`、`docs/*.html` | 保留本地；需要发布时制作脱敏版本并放入公开站点目录 |
| 旧兼容目录 | 根目录 `skills/` | 只作本机兼容，不是项目 Skill 源 |

## Agent Skill 规则

- `scripts/repository-policy.json` 是项目自定义 Skill 的机器可读清单；清单中的 `.agents/skills/` 是唯一编辑源。
- `adapt`、`audit`、`impeccable` 等第三方设计 Skill 由 `skills-lock.json` 管理，其 `.agents/skills/` 安装产物只留本地，不手工提交。
- `.claude/skills/` 是 Claude 兼容层；其中项目自定义 Skill 与 `.agents/skills/` 文件名和内容必须一致。第三方兼容文件只通过 Skill 管理器和锁文件更新，不手工修改。
- 需要 Agent 专属说明时，写入 `AGENTS.md` 或 `CLAUDE.md`，不要分叉共享 Skill。
- 修改项目自定义 Skill 后先运行 `powershell -ExecutionPolicy Bypass -File scripts/sync-agent-context.ps1 -Write`，再运行默认只读检查和 `node scripts/check-repository-policy.js`。

## 提交前检查

每次提交前至少运行：

```powershell
node scripts/check-repository-policy.js
git status --short
```

涉及搜索发现或博客发布时，继续运行：

```powershell
node scripts/generate-search-assets.js --check
node scripts/check-search-foundation.js
node --test scripts/search-foundation.test.js
```

检查失败时先修正归属或同步问题，不使用 `git add -f` 绕过规则。确有新例外时，先更新本文档、`.gitignore` 和自动检查。

## 历史异常处理

- `.claude/settings.local.json` 曾被提交。它不含已发现的真实密钥，但包含本机路径和权限白名单，应停止 Git 跟踪并继续保留本地副本。
- `.agents/skills/` 曾被 `.gitignore` 整体排除，导致 GitHub 缺少项目自定义 Skill 的唯一规范源。现在只跟踪已登记的项目自定义 Skill，第三方安装产物继续忽略。
- `.claude/skills/` 与 `.agents/skills/` 曾出现 Agent 名称和路径差异。共享内容应改成中性表述，并由检查脚本阻止再次漂移。
