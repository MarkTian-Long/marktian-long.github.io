# Skill 与工程生态审计计划

> **状态：只读审计结论与后续计划，待用户确认。** 本轮没有安装、更新、创建或编辑任何 Skill。新增 Skill 只有在同一多步骤流程稳定重复至少三次后才可提议；本轮结论是 **零新增 Skill**。

**基线：** `74b531562ff14a5c38830c0edf88304af9f19933`

**审计范围：** `.agents/skills/`、`.claude/skills/`、`skills-lock.json`、`docs/agent-context/*`、repository policy、73 文件部署、生成器与 Track C 流程

**治理原则：** 确定性规则放脚本/测试/CI；Skill 只负责编排、解释、暂停与 HITL。

---

## 1. 当前事实与证据

### 1.1 只读验证结果

- `.agents/skills/` 有 8 个项目自定义 Skill，均在 repository policy 中纳管。
- `.claude/skills/` 有 25 个目录：8 个项目 Skill 镜像 + 17 个 Impeccable 设计 Skill。
- 8 个项目 Skill 的 canonical 与 Claude 镜像递归内容一致。
- `scripts/sync-agent-context.ps1` 只读检查：23 项通过，0 warning，0 error。
- `node scripts/check-repository-policy.js`：通过，覆盖 298 个 tracked files。
- `skills-lock.json` 声明的 17 个设计 Skill 均存在，但当前没有项目脚本验证锁定 hash、版本、commit、来源和许可证完整性。
- 当前公开 manifest 精确为 73 文件：34 个固定文件 + 39 篇博客 HTML。
- `npm run check` 不包含 `build:public` 与 `check:public-dist`；workflow 另行执行它们，现有多数 Skill 没有明确覆盖这两个发布门禁。
- generator contracts 仍有 4 个已知信号；Skill 中与直接写入最相关的是 `update-trends` 和 `publish-blog`。
- 共享 maintenance marker 为 `next=2026-08-10`，在 2026-08-19 已逾期。

### 1.2 共享上下文一致性

当前共享上下文已经明确：

- `.agents/skills/<name>/SKILL.md` 是项目 Skill 唯一编辑源。
- `.claude/skills/` 是兼容层，项目 Skill 必须同步一致。
- runtime 是纯静态，但开发/发布已有 Node 生成、测试、dist 构建。
- Pages 只部署 manifest 指定的 `dist/`。
- 平台 secret 不得注入公开静态客户端。
- UI 可见改动必须真实页面截图审查。
- workflow、Secrets、删除、push 等保留 HITL。

主要漂移并非镜像失同步，而是 **Skill 正文没有完全跟上这些规则**。

## 2. 目标与非目标

### 2.1 目标

- 让项目 Skill 与混合静态架构、73 文件白名单、candidate 生成器、Track C 原型和视觉验收一致。
- 把 URL/DOM/截图/a11y/SEO/deploy 等确定性门禁落实到可重复脚本，而不是提示词承诺。
- 降低第三方 Skill/CLI 的供应链、许可证、提示注入与越权风险。
- 保持 Claude/Codex 的 canonical/mirror 同步与共享上下文优先级。

### 2.2 非目标

- 本轮不安装 Playwright、axe、Lighthouse、Pagefind 或任何插件。
- 不升级 Impeccable，不运行 `npx ...@latest`。
- 不修改 Skill、lockfile、workflow 或 GitHub 设置。
- 不为一次 Track C、一次改名或一次架构迁移创建专用 Skill。
- 不把自动测试逻辑藏进 Skill 文本。

## 3. 项目自定义 Skill 逐项审计

“保留”表示保留职责与入口，不代表正文无需更新。

| Skill | 分类/优先级 | 与当前流程的对齐情况 | 建议与成本 |
|---|---|---|---|
| `publish-blog` | 保留；P1 更新 | 已覆盖 metadata、生成、搜索资产、禁止批量重生、push HITL、远端 SHA 与线上验证；缺完整 `npm run check`、73 文件 dist、桌面/移动/双主题视觉验收 | 增补发布 profile 与视觉证据，约 0.5 天 |
| `code-health-check` | 保留；P1 更新 | 只读、安全、证据和 generator 检查较好；缺 dist 白名单、SEO/a11y、workflow/action、浏览器级检查；1–2 个工具抽样不足 | 增加 manifest 驱动的覆盖矩阵，0.5–1 天 |
| `monthly-review` | 保留；P1 更新 | 共享 memory/规范治理有效；工具清单和 grep 规则硬编码，缺 dist、workflow、generator、SEO/a11y 健康度 | 改成 registry/manifest 驱动，约 0.5 天；当前应执行一次独立维护轮 |
| `sync-docs` | 保留；P1 更新 | 章节引用和博客字段已漂移；“冲突时以代码为准”不符合共享上下文/用户指令优先级 | 改为报告冲突并按权限/证据裁决，0.25–0.5 天 |
| `analyze-product` | 保留；P2 更新 | 来源、日期和结构化 JSON 较好；搜索词硬编码 `2024/2025`，缺当前年份、外部内容不可信边界、dist/视觉检查 | 日期动态化并补边界，约 0.5 天 |
| `add-tool` | 保留；P1 重写关键门禁 | 仍称“嵌入式”，用隐藏 dashboard 作模板；缺 manifest/dist/全量测试/视觉/a11y/SEO/generator 安全；API key 与 ECharts 指引不符当前默认架构 | 改成直链静态岛 + 精确 allowlist + 无平台 secret，0.5–1 天 |
| `update-trends` | **建议暂停；P0 更新** | 当前直接覆盖公开 `trends.json`，无 candidate、schema、最低条数、partial/fail-closed、写入确认；与 Track B 生成器计划冲突 | 建立抓取→候选→验证→显式写入，0.5–1 天 |
| `brand-design-md` | **建议暂停；P0 重写** | 使用未固定 `getdesign@latest`，含 POSIX/删除命令，支持直接生成 React/Vue；缺 HITL、a11y、视觉、dist 和安全门禁 | 固定来源、禁止删除/越栈、只生成设计参考，约 1 天 |

暂停建议需要用户确认；在确认/修订前，可以手工按项目规范完成相同任务，但不能把有风险的 Skill 流程当作授权。

## 4. 第三方设计 Skill 与 Track C

17 个 Impeccable Skill 暂时保留当前文件，不在本轮升级或删除；后续需独立供应链审查：

- lock 只有 source 与 `computedHash`，缺 tag/version/commit/许可证字段，也没有实际校验脚本。
- 本地 `critique` 仍可调用未固定版本的 `npx impeccable`，可能绕过 lock。
- `audit/critique` 推荐 `/harden`，但锁定集合没有独立 `harden`。
- 本地文件引用 `NOTICE.md`，兼容目录未发现对应文件；上游有 Apache-2.0 LICENSE 与 NOTICE，采用/升级前应验证归档完整性。
- `.impeccable.md` 把旧 Track C 的杂志感、陶土色、左对齐等写成长期背景。本轮 A/B 必须将其标记为历史假设，而不是硬约束。
- 原型选择前，只建议：
  - `/shape` 做信息架构探索；
  - `/audit`、`/critique` 做只读诊断；
  - 不让 `/bolder`、`/colorize`、`/delight`、`/animate`、`/overdrive` 直接作用于公开页面。
- `overdrive` 不适合作为默认流程：高动效/Canvas/WebGL 会扩大性能、视觉回归和可访问性风险。

项目也依赖全局 `/brainstorming`、`/writing-plans`、`/review`、`/verification-before-completion`。这些是环境能力，不应全部复制进仓库；未来可在共享文档列出“能力缺失时的等价手工流程”。

## 5. 分类输出

### 5.1 保留

- 项目入口与职责：`publish-blog`、`code-health-check`、`monthly-review`、`sync-docs`、`analyze-product`、`add-tool`。
- 17 个当前锁定的设计 Skill 文件，在独立升级审查完成前保持不动。
- `.agents` canonical → `.claude` mirror 的同步方式。
- Skill 中的权限/HITL 编排和共享上下文读取要求。

### 5.2 需要更新

- P0：`update-trends`、`brand-design-md`。
- P1：`add-tool`、`publish-blog`、`code-health-check`、`monthly-review`、`sync-docs`。
- P2：`analyze-product`。
- `skills-lock.json` 的版本、commit、来源、许可证与实际 hash 验证。
- `critique` 的未固定 CLI、本地服务与不存在命令引用。
- `.impeccable.md` 的“历史假设”隔离说明。
- 发布 Skill 对 `npm run check`、`build:public`、`check:public-dist` 和浏览器视觉门禁的统一表达。

### 5.3 可考虑引入

当前优先考虑的是 **工具/测试项目，不是 Skill**：

| 候选 | 用途 | 引入方式与维护成本 | 安全边界 |
|---|---|---|---|
| Playwright | baseline/current/candidate 截图、DOM、URL、资源、功能 | 架构 Batch A0；中等，需固定浏览器/字体/快照环境 | 仅 dev dependency；不访问真实 secret/生产写接口 |
| axe-core | 自动发现部分 a11y 问题 | 与 Playwright 集成；低至中 | 不能替代人工键盘/WCAG 审查 |
| Lighthouse CI | 性能、SEO、a11y 预算 | 先 report-only；中等且结果有波动 | 阈值稳定后再阻断，不以单次分数定生死 |
| Nu HTML Checker | dist HTML 结构验证 | 可对 49 个 HTML 批量；低 | 固定版本/容器，避免不可复现远端服务 |
| Lychee | HTML/Markdown 外链 | 定时或 report-only；低至中 | 网络波动需 retry/allowlist，不能阻断所有临时失败 |
| actionlint / zizmor | workflow 语法与安全 | 先本地/report-only；低 | workflow 变更和 Action 安装仍需 HITL |
| Dependabot for Actions | Action 更新提案 | 小仓库可比 Renovate 轻；低 | 启用 GitHub 配置前 HITL；升级不自动合并 |
| Skill provenance checker | lock/mirror/source/license 校验 | 项目内 Node/PowerShell 脚本；中 | 只读默认，结果确定性，不执行第三方指令 |
| Pagefind | 博客规模扩大后的静态搜索 | 架构与内容路线确定后再评估；中 | 属产品功能，不是治理 Skill；不在本轮引入 |

只有“视觉与发布验收”人工流程完成至少三次且步骤稳定后，才可以考虑将其编排层沉淀为一个 Skill；Playwright 等确定性逻辑仍必须留在脚本。

### 5.4 不建议引入

- 当前直接运行 `brand-design-md` / `getdesign@latest`。
- 当前直接运行 `update-trends` 写公开 JSON。
- 为单次 Track C 建立专用 Skill。
- 把 73 文件检查、截图 diff 或 generator contract 只写在提示词里。
- 默认启用 `overdrive`。
- 架构决定前引入 AstroPaper、al-folio、Brittany Chiang 或其他模板代码。
- 把 Vale 设为中文内容硬门禁；规则维护成本尚未证明值得。
- 通用大型 Skill 市场或自动安装器；会扩大供应链和提示注入面。
- 为本轮安装 GitHub/Figma 等插件；现有本地 Git 与只读 web 研究已经足够。

## 6. Skill、脚本与 CI 的职责边界

| 能力 | 正确载体 | Skill 的角色 |
|---|---|---|
| 73 文件集合、引用、hash | Node 脚本 + 测试/CI | 调用并解释差异，不能替代规则 |
| 截图/DOM/URL/资源等价 | Playwright | 选择场景、评审例外、触发 HITL |
| 键盘/focus/ARIA/axe | Playwright + 人工 | 编排人工检查并记录限制 |
| Lighthouse 预算 | Lighthouse CI | 根据稳定基线提出阈值，不自动拍板 |
| HTML/链接 | vnu/Lychee | 管理 allowlist 与重试策略 |
| generator check/candidate/write | 生成器代码 + tests | 确认何时允许显式 write |
| workflow/Action 风险 | actionlint/zizmor/CI | 解释风险；修改 workflow 前暂停 |
| Skill mirror/provenance | repository policy 脚本 | 指导 canonical 编辑和同步 |

## 7. 文件级影响范围

以下是后续可能范围，本轮不修改：

- `.agents/skills/{add-tool,analyze-product,brand-design-md,code-health-check,monthly-review,publish-blog,sync-docs,update-trends}/SKILL.md`
- 对应 `.claude/skills/*` 镜像，由 `scripts/sync-agent-context.ps1 -Write` 生成/同步。
- `skills-lock.json`
- 未来的 `scripts/check-skill-provenance.*` 与测试。
- `scripts/check-all.js`、`scripts/package.json`/lockfile（测试工具接入）。
- `CONVENTIONS.md`、`docs/agent-context/skills.md`、`maintenance.md`。
- `.github/workflows/**`：只有单独 HITL 后才可能接入检查。

不应由 Skill 更新批次修改：公开 HTML/CSS、博客正文、工具业务逻辑、manifest 文件集合、生产 canonical。

## 8. 分支/worktree、依赖与批次

### 分支策略

- S0 是只读决策门，不创建分支、不编辑 Skill。S1 及以后统一使用 `codex/personal-site-governance` 独立 worktree，并从用户确认的 architecture SHA 建立；不要在 main 或 Track C 分支写。
- canonical 文件先改，运行同步脚本后审查 `.claude` diff。
- 第三方设计 Skill 升级必须使用独立供应链审查分支，不与 Track C 原型混合。
- workflow 接入必须另开明确批准的批次。
- 若 architecture 尚未完成，维持 S-H1 的暂缓建议并停止在 S0；任何“先从 74b 紧急修 Skill”的例外都需要新 HITL 和单独合并策略。

### Batch S0：立即治理决定，0.25 天

1. 用户确认是否暂缓 `update-trends` 与 `brand-design-md`。
2. 确认本轮不新增 Skill，`.impeccable.md` 只作历史参考。
3. 确认测试依赖、截图存储和 workflow 权限边界。

### Batch S1a：发布与数据 Skill，1–2 天

1. 修订 `publish-blog` 的全量 check、73 文件 dist 与视觉门禁。
2. 修订 `update-trends` 的 candidate/schema/最低条数/fail-closed/显式写入。
3. 修订 `analyze-product` 的动态年份、数据口径、外部不可信输入与验收边界。

交付条件：同步三个 `.claude` 镜像，sync check 与 repository policy 通过。

### Batch S1b：页面与品牌 Skill，1–2 天

1. 修订 `add-tool` 为直链静态岛、精确 allowlist、无平台 secret 的流程。
2. 重写 `brand-design-md` 的固定来源、Windows 命令、无删除和当前技术栈边界。

交付条件：同步两个 `.claude` 镜像；不安装/运行第三方 CLI，sync check 与 repository policy 通过。

### Batch S1c：治理 Skill，1–2 天

1. 修订 `code-health-check` 的 manifest、浏览器、SEO/a11y 与 workflow 报告覆盖。
2. 修订 `monthly-review` 的 registry/manifest、generator 与质量门禁健康度。
3. 修订 `sync-docs` 的章节/字段和冲突裁决优先级。

交付条件：同步三个 `.claude` 镜像，8 个 canonical/mirror 全量相等，sync check 与 repository policy 通过。

### Batch S2：供应链治理，1–2 天

1. 设计 lock 的版本/tag/commit、许可证和允许目录字段。
2. 实现项目 Skill mirror 与 vendor hash/provenance 只读检查。
3. 评估 Impeccable 受控升级，移除未固定 CLI 与无效命令引用。

### Batch S3：确定性验收，2–4 天

1. Playwright baseline/current/candidate harness。
2. axe、Lighthouse、HTML 验证先 report-only。
3. 链接和 Actions 检查；任何 CI/workflow 接入前暂停 HITL。

依赖：S0 → 用户确认 architecture SHA → S1a → S1b → S1c。S2 在 S1c 后独立进行；S3 复用已验证架构 harness。S2 与 Track C 原型分离，避免第三方 Skill 升级改变设计行为。

## 9. 测试与视觉验收

- canonical/mirror 递归相等；sync check 0 warning/error。
- repository policy 通过，且没有未声明的 Skill/兼容目录文件。
- 每个 Skill frontmatter 有 `name/description/type`。
- 示例命令在 PowerShell/Windows 可用；不得出现 `/tmp`、无 HITL 删除或未固定 `@latest`。
- 任何涉及页面的 Skill 明确要求：73 文件 dist、desktop/mobile、双主题、页面状态、真实视觉截图和结论。
- 发布类 Skill 明确区分 `npm run check` 与 build/dist smoke，不漏掉任一 profile。
- 安全审查覆盖：公开静态端不持有平台 secret、外部内容不可信、workflow/push/delete/Secrets HITL。
- Skill 修改本身不应改变公开 UI；如测试工具产生截图，只保存本地或经批准的 artifact。

## 10. 回滚方案

- 每批单独提交；canonical 和镜像同步在同一提交，失败用 revert。
- 保留升级前的 `skills-lock.json` 和实际 vendor hash 报告；第三方升级不通过就继续用已锁定版本。
- 新检查先 report-only；误报清单稳定后才考虑阻断。
- 如果新的 Skill 步骤与脚本不一致，以用户权限、项目规范和可重复脚本证据为准，暂停更新而不是自动“修复”生产文件。
- workflow 未获批准时，所有新检查保持本地，不影响 Pages。

## 11. HITL 节点

| 节点 | 必须确认 |
|---|---|
| S-H1 | 是否暂缓 `update-trends`、`brand-design-md`；推荐是 |
| S-H2 | 是否允许新增 dev dependencies/lockfile：Playwright、axe、Lighthouse 等 |
| S-H3 | 截图基线入 Git还是本地/CI artifact；推荐先本地 artifact |
| S-H4 | 是否升级 Impeccable；推荐架构/原型期间不升级 |
| S-H5 | 是否修改 workflow、启用 Dependabot、固定 Action SHA |
| S-H6 | 三次重复后是否真的需要新 Skill；当前建议为“否” |
| S-H7 | merge、push、部署仍分别确认 |

## 12. 工作量与时间范围

- S0：0.25 天。
- S1a–S1c：3–6 天。
- S2：1–2 天；若升级第三方设计 Skill，另加 1–2 天许可证/行为/回归审查。
- S3：2–4 天，与架构等价 harness 合并实施可减少重复。
- 总计：约 **6–12 个工作日**；不含浏览器二进制下载时间和 workflow 审批等待，可通过复用架构 harness 减少 S3 的重复劳动。

## 13. 前台与 GitHub 影响声明

### 会影响前台

- 本计划本身与 S0–S2 不应影响前台。
- S3 只增加测试；若以后按 Skill 执行工具/博客发布，才会在独立任务中产生经批准的前台变化。

### 不会影响前台

- Skill 文本、mirror、lock/provenance 检查、report-only 测试、共享文档。

### 是否需要更新 GitHub

- 本地 Skill/测试规划和验证不需要更新 GitHub。
- 将 Skill/脚本合并到远端、修改 workflow、启用 Dependabot 或 Action：都需要后续单独批准；本计划不授权 push。

## 14. 对应的下一步执行 Prompt

```text
请先只读加载
D:\CS\Coding\qiuzhi\.worktrees\personal-site-planning\docs\plans\2026-08-19-skill-and-ecosystem-audit.md，
本轮只执行其中的 Batch S0，形成决策记录后停止。不要创建治理 worktree/分支，不要编辑任何 Skill，也不要执行 S1a 或以后批次。

开始前按 AGENTS.md 读取共享上下文，并重新运行 sync-agent-context 只读检查、repository policy、generator contracts 和 public manifest 计数。

要求：
- 重新运行 sync-agent-context 只读检查、repository policy、generator contracts 和 public manifest 计数；
- 让我确认是否暂缓 update-trends/brand-design-md、保持零新增 Skill、依赖/截图/workflow 权限，以及 architecture SHA 依赖；
- 不安装、升级、创建或编辑 Skill；不运行未固定的 npx @latest；
- 不修改公开 UI、博客正文、工具业务逻辑、manifest 或 workflow；
- 不 merge，不 push，不部署。

结束时只报告 S0 的新鲜证据与 S-H1–S-H6 决策表，然后停止。确认后我会另发 S1a Prompt，指定从已确认 architecture SHA 创建 codex/personal-site-governance，并要求 /review 与 /verification-before-completion。
```

## 15. 主要生态来源

- [Playwright 视觉快照](https://playwright.dev/docs/test-snapshots)
- [Playwright accessibility testing](https://playwright.dev/docs/accessibility-testing)
- [axe-core](https://github.com/dequelabs/axe-core)
- [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci)
- [Nu HTML Checker](https://github.com/validator/validator)
- [Lychee](https://github.com/lycheeverse/lychee)
- [actionlint](https://github.com/rhysd/actionlint)
- [zizmor](https://github.com/zizmorcore/zizmor)
- [GitHub Actions 安全使用](https://docs.github.com/en/actions/reference/security/secure-use)
- [Dependabot 更新 GitHub Actions](https://docs.github.com/en/code-security/how-tos/secure-your-supply-chain/secure-your-dependencies/auto-update-actions)
- [Impeccable](https://github.com/pbakaus/impeccable)
- [Pagefind](https://github.com/Pagefind/pagefind)
