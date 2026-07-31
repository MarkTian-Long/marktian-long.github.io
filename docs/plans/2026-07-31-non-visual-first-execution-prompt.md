# Track A 新任务执行提示词

将下面内容复制到新的 Codex 任务。建议只交给模型执行 Track A，不要让它自动进入 Track B 或 Track C。

---

请在 `D:\CS\Coding\qiuzhi` 执行：

`docs/plans/2026-07-31-site-trust-architecture-editorial-plan.md`

中的 **Track A：公开页面零变化**。

## 本次范围

只执行：

- A0 工作区保护
- A1 统一本地测试和检查入口
- A2 增加只读安全和证据检查
- A3 定义 Portfolio 证据 schema，但不接入页面
- A4 固化共享规范
- A5 生成器修复方案和测试夹具
- A6 Track A 交接与经验台账

不得执行 Track B 或 Track C。

## 开始前

1. 按 `AGENTS.md` 顺序读取共享上下文。
2. 读取完整计划文件。
3. 使用 `/executing-plans`，每批最多执行 3 个任务。
4. 当前 `main` 上已有 37 个未提交修改，必须先记录并保护。
5. 不要 stash、reset、checkout 覆盖或格式化这些既有修改。
6. 未经用户确认，不得直接在 `main` 上开始实现。

## 公开页面冻结

本次不得主动修改：

- `index.html`
- `assets/css/style.css`
- `assets/js/main.js`
- `tools/blog/index.html`
- `tools/blog/posts/*.html`
- `tools/*/index.html`
- `robots.txt`
- `sitemap.xml`
- `feed.xml`
- 任何公开 JSON 数据内容

允许读取这些文件用于检查和编写测试，但不得写入。

特别注意：当前 35 篇博客文章、博客入口、首页和 `robots.txt` 已有用户未提交修改。不得把它们当成本次改动，也不得覆盖。

## HITL 禁区

未经当轮明确确认，不得：

- 修改 `.github/workflows/`
- 提示或执行 GitHub Secrets 变更
- 修改任何 `config.local.js`
- push
- 删除文件
- 停止跟踪文件
- `git reset --hard`

## 生成器限制

本次可以新增测试、`--check` 基础设施和迁移方案，但不得：

- 重生成已发布博客 HTML；
- 重生成 `tools/service-agent/index.html`；
- 覆盖 `tools/trends/data/trends.json`；
- 让生成器以写入模式触碰公开产物。

## 验收要求

每批完成后报告：

1. 修改文件；
2. 执行的命令；
3. 测试结果；
4. 与执行前相比，公开页面是否出现新 diff；
5. 是否发现计划需要调整。

## 知识沉淀和交接

反复出现的问题、规则和教训不能只留在聊天记录中。按以下规则处理：

- 稳定项目规则写入 `CONVENTIONS.md`；
- 已验证的架构事实和常见陷阱写入 `docs/agent-context/memory.md`；
- 可机械判断的问题增加 checker 和测试；
- 已重复至少三次的多步骤流程才新建 Skill；
- 尚未稳定的经验写入 handoff 的“候选经验”，不要过早升级为全局规则。

如果修改或新增项目 Skill，必须以 `.agents/skills/` 为唯一源，同步 `.claude/skills/`，并更新 repository policy、`AGENTS.md`、`CLAUDE.md` 和共享 Skill 文档。

Track A 结束时必须新增：

`docs/plans/2026-07-31-track-a-handoff.md`

其中逐条写清：

- 问题与证据；
- 是否反复出现；
- 归类为规范、memory、checker/test、Skill、ADR 或候选经验；
- 具体落盘位置；
- 验证方式；
- 未完成项和 Track B 前置条件。

Track A 完成前运行：

```powershell
cd scripts
npm test
npm run check
cd ..
powershell -ExecutionPolicy Bypass -File scripts/sync-agent-context.ps1
node scripts/check-repository-policy.js
```

再检查：

```powershell
git status --short
git diff -- index.html assets/css/style.css assets/js/main.js tools/blog/index.html tools/blog/posts tools/*/index.html robots.txt sitemap.xml feed.xml
```

如果公开页面出现不属于执行前 37 个既有修改的新变化，立即停止，不要自行还原，报告差异并等待用户处理。

完成 A6 并更新计划状态后停止并等待反馈，不要自动进入 Track B。
