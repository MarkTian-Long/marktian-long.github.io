# Track A 交接与经验台账

状态：已完成（2026-07-31）。范围仅为 A0–A6；未执行 Track B 或 Track C，未改公开页面、workflow、`config.local.js`，未 push、stash、reset 或删除文件。

## 完成项与修改文件

| 任务 | 完成内容 | 主要文件 |
|---|---|---|
| A0 | 以独立 worktree 和 `codex/site-trust-editorial-v2` 分支保护 `main` 的 37 项既有修改；记录基线 | 本 handoff、执行计划 |
| A1 | 建立跨平台 Node 测试/检查入口，修复 policy fixture 的 CRLF 匹配 | `scripts/package.json`、`scripts/check-all.js`、`scripts/repository-policy.test.js` |
| A2 | 增加不读 `config.local.js` 的静态安全/证据 report 与 fixture | `scripts/check-static-client-secrets.js`、`scripts/static-client-safety.test.js` |
| A3 | 定义 Portfolio evidence schema、五类样例与 validator | `docs/portfolio-evidence.*`、`scripts/check-portfolio-evidence.js`、`scripts/portfolio-evidence.test.js` |
| A4 | 固化公开可信度规则、shared memory、Skill 只读检查边界，并同步 Claude 兼容层 | `CONVENTIONS.md`、`docs/agent-context/*`、`.agents/skills/*`、`.claude/skills/*` |
| A5 | 固化博客/Service Agent/Trends 生成器漂移信号、fixture 和迁移方案 | `scripts/check-generator-contracts.js`、`scripts/generator-contracts.*`、`docs/plans/2026-07-31-generator-safe-migration.md` |
| A6 | 写入本台账并标记计划状态 | 本文件、`docs/plans/2026-07-31-site-trust-architecture-editorial-plan.md` |

## 验证

在隔离 worktree 中通过：

```powershell
cd scripts
npm test
npm run check
cd ..
powershell -ExecutionPolicy Bypass -File scripts/sync-agent-context.ps1
node scripts/check-repository-policy.js
```

- `npm test`：43/43 通过。
- `npm run check`：通过；覆盖所有 Node fixtures、repository policy、搜索基础、静态安全报告、Portfolio evidence、生成器 contract、tracked JS 语法和 10 个 tracked JSON 解析。
- `sync-agent-context.ps1`：23 项只读检查通过；先前 `-Write` 同步了两个扩展 Skill 的 Claude 兼容副本。
- `check-repository-policy.js`：通过。
- Windows 环境的 `npm.ps1` 可能被全局执行策略拦截；使用 `powershell -ExecutionPolicy Bypass` 或 `cmd /c npm ...`，不得更改机器级执行策略。

## 公开页面冻结

- 原 `main` 工作区开始时有 37 项既有修改，均在 `index.html`、`robots.txt`、博客入口和 35 篇文章中；它们留在原工作区，未被 stash、覆盖或格式化。
- 隔离分支的 `git diff` 与 `git diff --cached` 针对以下冻结范围均为空：`index.html`、`assets/css/style.css`、`assets/js/main.js`、`tools/blog/index.html`、`tools/blog/posts/`、`tools/*/index.html`、`robots.txt`、`sitemap.xml`、`feed.xml`。
- 本次没有运行任何生成器写模式；未重生博客 HTML、Service Agent 页面或 trends 数据。

## 问题与经验台账

| problem | evidence | recurrence | classification | destination | enforcement | status | owner_or_gate |
|---|---|---|---|---|---|---|---|
| 本地测试入口是占位脚本，PowerShell 可能拦截 `npm.ps1` | 基线 `npm test` 是占位；直接 PowerShell 调用受执行策略阻断 | 首次观察，Windows 环境可复现 | checker/test + memory | `scripts/package.json`、`scripts/check-all.js`、`docs/agent-context/memory.md` | 43 个 Node 测试和 `npm run check` | 已缓解 | 维护者使用 process-local bypass 或 `cmd /c` |
| 静态秘密注入、危险 DOM 写入和证据敏感表述缺乏统一可见性 | report-only checker 报告 326 项；workflow 有 3 项 Secret 注入信号 | 多模块出现，但尚未逐项人工确认 | checker/test + Track B 问题 | `scripts/check-static-client-secrets.js`、`scripts/static-client-safety.test.js` | 文件/行号/修复建议；不读或输出 `config.local.js` | 已记录，未修复 | Track B；workflow/Secrets 修改必须用户 HITL |
| 作品指标、真实部分与 Mock 边界没有统一机器可检格式 | 五类样例可表达；缺少 definition 或 mockBoundary 的 fixture 会失败 | 跨 ESOP、金融 RAG、客服、反洗钱、ASCI 反复出现 | convention + schema + checker/test | `CONVENTIONS.md`、`docs/portfolio-evidence.*`、`scripts/check-portfolio-evidence.js` | schema + validator | 已建立，未接入页面 | Track B/C 先逐项人工核验证据 |
| 生成器可以依赖已发布 HTML 或直接覆盖公开产物；趋势局部失败可写空 board | 4 个 generator contract 信号由 fixture 和只读报告稳定检出 | 3 个独立生成器均出现 | memory + checker/test + migration plan | `docs/agent-context/memory.md`、`scripts/check-generator-contracts.js`、`docs/plans/2026-07-31-generator-safe-migration.md` | 报告只读；迁移步骤要求 `--check`、candidate 和显式写入 | 已记录，未修复 | Track B，逐个产物迁移 |
| Skill 不应因一次改造而膨胀 | 本轮只扩展 health/publish 两个既有 Skill；尚无三次稳定复用证据 | 未达新 Skill 门槛 | convention + 候选经验 | `CONVENTIONS.md`、本 handoff | repository policy + sync check | 已固化门槛 | 三次重复后才评估新 Skill |

## 已沉淀的稳定规则与事实

- 公开可信度与生成物的六项稳定规则：`CONVENTIONS.md` 第九章。
- 架构事实、Windows npm 陷阱、无密钥读取边界、schema 位置和生成器信号：`docs/agent-context/memory.md` 的 2026-07-31 条目。
- Skill 来源与同步规则补充：`docs/agent-context/skills.md`。
- 已扩展 Skill：`code-health-check`（新增只读可信度 pass）和 `publish-blog`（生成器改动前的 `--check`/fixture 约束）；两者均已由 `sync-agent-context.ps1 -Write` 同步到 `.claude/skills/`。
- 候选经验：静态报告目前仍是广覆盖启发式，326 项不是已确认漏洞或虚假主张清单；在至少三次人工分类收敛前，不将其升级为独立 Skill 或阻断门禁。

## 未完成项与 Track B 前置条件

1. 逐条审查静态报告，先确认公开 Secret 可达性、每处 `innerHTML` 的真实不可信输入路径，以及每项公开指标的证据状态；不得把 report 数量直接当作漏洞数量。
2. 修改 `.github/workflows/`、部署边界、GitHub Secrets 或 `config.local.js` 前必须取得当轮用户明确确认；这些属于 Track B 的 HITL 项。
3. Portfolio schema 接入页面前，必须逐项验证角色、指标定义、来源、日期、真实/Mock 边界；不得批量替换现有作品文案。
4. 生成器迁移必须按 `2026-07-31-generator-safe-migration.md` 一次一个产物执行，先有 `--check`/fixture，再明确授权写入；禁止重生 35 篇历史博客、Service Agent 页面或覆盖 trends 数据。
5. Track B 开始前重新记录 `main` 的既有修改基线，并确认本分支的冻结范围仍无公开页面 diff。
