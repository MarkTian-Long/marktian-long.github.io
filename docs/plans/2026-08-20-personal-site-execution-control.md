# Personal Site Staged Execution Control Implementation Plan

> **For Codex:** REQUIRED SUB-SKILL: Use `/executing-plans` to implement one active phase task-by-task. Use `/dispatching-parallel-agents` only for the bounded parallel work declared by that phase. Before any commit use `/review`; before claiming completion use `/verification-before-completion`.

**Goal:** 用一份由 planning task 独占维护的动态控制文件，按阶段推进个人网站架构、Track C、治理与改名；阶段内在独立分支验证，探索产物不进入 `main`，可落地阶段最多以一个 squash commit 进入 `main`。

**Architecture:** 本文件是执行控制层，不替代六份专题计划。执行任务从当前已批准的精确 `origin/main` SHA 建立独立 worktree，阶段内允许多个小提交；通过机器验证、独立审查和 HITL 后，才可将可交付结果 squash 为一个 `main` commit。当前 planning task 负责在每阶段完成后更新状态、证据和下一阶段 prompt，其他执行任务不得编辑本文件。

**Tech Stack:** Git worktree、HTML/CSS/Vanilla JS、Node.js、现有 73 文件公开 manifest、Playwright + 固定 Chromium（Phase 1）、Eleventy candidate-only（Phase 2，待 Phase 1 通过后）、GitHub Pages。

---

## 1. 控制信息

| 字段 | 当前值 |
|---|---|
| 控制日期 | 2026-08-20 |
| 控制分支 | `codex/personal-site-planning` |
| 控制 worktree | `D:\CS\Coding\qiuzhi\.worktrees\personal-site-planning` |
| 初始 planning commit | `6a5c220f82d0c35136e76bdf0aba255fcce8c084` |
| 已验证网站基线 | `74b531562ff14a5c38830c0edf88304af9f19933` |
| 当前活动阶段 | Phase 0：控制计划本地 review，等待未来 main 落地决定 |
| 下一执行阶段 | Phase 1：A0 技术等价门禁 |
| 下一 execution ID | `P1-A0-001` |
| 下一 execution resume count | `0` |
| 活动执行窗口 | 无；Phase 1 新窗口创建后登记 |
| GitHub 状态 | 本控制文件尚未 push；执行前必须重新 fetch 并核对 |
| UI 权限 | Phase 1 禁止公开 UI 变化 |

### 状态枚举

- `pending`：尚未开始。
- `in_progress`：已有唯一执行任务和 worktree。
- `review`：实现完成，等待验证或 HITL。
- `landed`：已以批准的单一 commit 进入 GitHub `main` 并完成远端核验。
- `local_only`：阶段完成但按设计不进入 `main`。
- `rejected`：候选未采用，保留报告，不进入 `main`。
- `blocked`：发现基线漂移、权限问题或需要用户内容判断。

## 2. 已确认决策

1. A0–A1 属于技术验证，由执行主 Agent 根据硬门禁决策；用户不需要选择具体技术实现。
2. Phase 1 只执行 A0；A0 通过后才生成 Phase 2/A1 的最终 prompt。
3. 18 篇无精确 Markdown 映射的历史文章冻结当前 HTML；不补源、不批量重生。
4. 全量视觉截图先保存在本地忽略目录；未来 workflow 获批后使用 CI artifact；暂不向 Git 提交全量 PNG。
5. Track C 定位采用 Concept A+：它是用户确认后对旧 `Concept A` 的修订版，不是第三个 Concept。文章和判断优先，真实案例作证；早期 Demo 只作静态 Labs 或不展示、不提供入口。旧 Track C 专题计划在进入 Phase 4 前必须同步改名和定义。
6. 不强制选择三个可点击 Demo；正式案例候选优先来自现有三个脱敏真实案例，公开角色、指标与证据仍需用户事实确认。
7. 对外品牌保持 `Leo Liu`；内部工程名暂定 `leo-liu-site`，不在架构阶段改名。
8. GitHub 仓库 `MarkTian-Long/marktian-long.github.io` 保持不变。
9. 当前不启用自定义域名；架构只需保证 site URL/base 集中配置、未来可迁移。
10. 当前不改任何 localStorage key；本地目录等全部 worktree 收束后最后迁移。
11. `update-trends` 与 `brand-design-md` 进入受控模式并优先修订，不停止外部研究或既有 Skill 更新。
12. 当前 push 到 `main` 会触发 Pages；因此 main landing、push 和线上验证必须在同一阶段末尾明确呈现并获得 HITL。

## 3. 主任务与子 Agent 模型锁

### 3.1 主任务

- 每次新开执行窗口时，用户先按本文件 3.1.1 的表格选择主模型和 reasoning；阶段 prompt 的首段必须再次写明该选择，不能只在子 Agent 配置中出现型号。
- 只有主任务可以创建/切换分支、编辑文件、安装依赖、stage、commit、merge 或请求 push。
- 主任务负责合并证据、架构判断、自审和最终结论；不能把关键决策交给低级别 Agent。

#### 3.1.1 执行窗口模型选择

| Phase | 新窗口主模型 | reasoning | 原因 |
|---|---|---|---|
| 1：A0 等价门禁 | `gpt-5.6-sol` | `high` | 涉及 Git/worktree、安全边界、Playwright 稳定性和测试可信度，主任务不能降级 |
| 2：A1 架构 PoC | `gpt-5.6-sol` | `high` | 需要判断 Eleventy 契约、依赖与迁移可行性 |
| 3：正式架构迁移 | `gpt-5.6-sol` | `high` | 影响范围最大，需跨生成器、博客、工具和部署边界集成 |
| 4：Track C 原型 | `gpt-5.6-sol` | `high` | 需要视觉、内容层级、可信度和移动端综合判断 |
| 5：选定 UI 实现 | `gpt-5.6-sol` | `high` | 涉及公开 UI 与视觉回归 |
| 6：Skill/工程治理 | `gpt-5.6-terra` | `high` | 以规则、文档和机械一致性为主，但仍需安全判断 |
| 7：内部 rename | `gpt-5.6-terra` | `high` | 主要是路径与标识迁移；以完整清单和验证为主 |
| 8：workflow/Pages | `gpt-5.6-sol` | `high` | 涉及 CI 权限、供应链、Secrets 边界与线上发布 |

如果新窗口无法选择指定型号，必须在开始执行前说明实际可用型号并暂停；不得静默降级。Phase 1 的明确选择是：**窗口模型 `gpt-5.6-sol`，reasoning `high`。**

### 3.2 并行子 Agent

Phase 1 必须使用 `/dispatching-parallel-agents`，但只允许两个同时运行的只读子 Agent：

| Agent | 固定模型 | reasoning | fork_turns | 任务 | 写入权限 |
|---|---|---|---|---|---|
| `a0_route_inventory` | `gpt-5.6-luna` | `medium` | `none` | 复核 73 文件、49 HTML、route/resource/manifest 和基线路径风险 | 只读 |
| `a0_harness_risk` | `gpt-5.6-luna` | `medium` | `none` | 复核 Playwright 稳定化、Windows/字体/主题、双服务器和误报风险 | 只读 |

规则：

1. 每个子 Agent 的 initial message 必须包含仓库绝对路径、精确基线 SHA、只读边界和交付格式；因为指定了模型 override，`fork_turns` 必须使用 `none`。
2. 子 Agent 不得运行 `git add`、`commit`、`merge`、`push`，不得安装依赖，不得编辑共享文件。
3. 两个 Agent 可并行；主任务同时完成本地状态复核和现有测试读取。
4. 实现完成后可再启动一个 `gpt-5.6-luna`/`medium` 的只读独立 reviewer；它必须串行运行，不能与实现写入并发。
5. 子 Agent 结论只是证据，主任务必须亲自核对关键命令与文件后才能采用。

### 3.2.1 一阶段一窗口

1. 每个 Phase 只有一个 `phase_execution_id` 和一个活动执行窗口；Phase 1 固定为 `P1-A0-001`。
2. 新窗口开始后必须在首条状态报告中回显 execution ID、主模型、reasoning、branch 和 worktree。
3. 同一 Phase 到达 HITL 时由原窗口暂停；用户在原窗口批准后继续完成 landing，不得另开第二个执行窗口重复工作。
4. 如果原窗口不可恢复，用户先把 branch、commit、dirty state 和最后验证结果带回本 planning task；替代窗口沿用同一 `phase_execution_id`，本文件把 `resume_count` 加 1 并记录原因后，才能发放 resume prompt。不得通过创建新 execution ID 绕过原阶段状态。
5. planning task 不与执行窗口并行改执行分支；执行窗口不得编辑本控制文件。

### 3.3 不允许并行的工作

- Phase 1 与 Phase 2 不并行。
- 架构迁移与 Track C 原型不并行。
- Track C 正式实现与项目 rename 不并行。
- 两个 Agent 不得同时编辑同一文件。
- planning task 是本文件唯一编辑者；执行任务只能读取本文件并在结束时报告结构化 handoff。

## 4. 阶段总览与 main 策略

| Phase | 内容 | 分支 | 前台变化 | 阶段完成后的 main 策略 | 状态 |
|---|---|---|---|---|---|
| 0 | 控制计划与已确认决策 | `codex/personal-site-planning` | 无 | 计划最终确认后可 1 个 docs squash commit | `review` |
| 1 | A0：baseline/current 技术等价门禁 | `codex/personal-site-architecture` | 禁止 | 已以 1 个 test commit 进入 `main` | `landed` |
| 2 | A1：Eleventy candidate-only PoC | 同 architecture 分支 | 禁止 | 已与 Phase 3 一并进入 `main`，仍保持 candidate-only | `landed` |
| 3 | A2–A5：正式架构等价迁移 | 同 architecture 分支 | 必须等价 | 已以 1 个 refactor commit 进入 `main`，后续修复已完成 | `landed` |
| 4 | Current / Concept A+ / Concept B 原型 | `codex/track-c-ui-prototypes` | 仅本地原型 | 不进 main | `pending` |
| 5 | 用户选定的 Track C 正式实现 | 从确认的 prototype/architecture SHA 新建分支 | 有 | 视觉 HITL 后 1 个 UI squash commit | `pending` |
| 6 | Skill 与工程治理 | `codex/personal-site-governance` | 无 | 1 个 governance squash commit | `pending` |
| 7 | 内部项目 rename | 独立 rename 分支 | 默认无 | 1 个 rename squash commit；本地目录移动另做 | `pending` |
| 8 | workflow 与 Pages 发布门禁 | 独立 workflow 分支 | 发布流程变化 | 单独 HITL 后 1 个 workflow commit | `pending` |
| Future | 自定义域名与 SEO 迁移 | 届时另建 | 有 | 获得域名后另立计划 | `pending` |

### main 落地原则

1. 禁止在 `main` 直接开发。
2. 阶段分支内允许按小任务提交，以便回滚和审查。
3. 可落地阶段通过后，最多 squash 为一个语义完整的 `main` commit。
4. Phase 2 PoC、Phase 4 原型及所有被拒绝候选不得进入 `main`。
5. merge 前重新 fetch，复核全部 worktree/branch/stash/dirty state 和 main 漂移。
6. 未获得当次 HITL 时停在阶段分支，不 merge、不 push。
7. 当前 workflow 在 push `main` 后自动部署，因此 push 授权必须明确说明会触发 Pages；部署后核验远端 SHA、Actions 和线上静态产物。

## 5. Phase 1：A0 技术等价门禁

### 5.1 目标

- 固化已批准基线的 URL、文件、资源、DOM/ARIA、截图和关键功能矩阵。
- 建立 baseline/current 双服务器与确定性 Playwright 检查。
- 证明加入测试基础设施本身没有改变 73 文件公开产物和任何公开 UI。
- 为 Phase 2 只定义未启用的 candidate adapter contract；不得安装或运行 Eleventy。

### 5.2 非目标

- 不改变 `index.html`、公开 CSS、页面文案、工具业务逻辑或博客正文。
- 不生成 Track C 页面或改变 Demo 入口。
- 不改 localStorage key、项目名、目录、GitHub repo、canonical 或域名。
- 不改 `.github/workflows/**`。
- 不安装 axe、Lighthouse、Eleventy 或其他 A1+ 依赖。
- 不 merge、不 push、不部署，直到阶段末尾展示精确证据并取得 HITL。

### 5.3 预计文件范围

执行主 Agent 必须先核对现状，只有必要时才使用下列路径：

- Modify: `scripts/package.json`
- Modify: `scripts/package-lock.json`
- Modify: `.gitignore`
- Create: `scripts/playwright.config.cjs`
- Create: `scripts/equivalence/site-matrix.js`
- Create: `scripts/equivalence/servers.js`
- Create: `scripts/equivalence/normalize.js`
- Create: `scripts/equivalence/a0-equivalence.spec.js`
- Create: `scripts/equivalence/README.md`
- Local-only output: `build/architecture-equivalence/baseline/`
- Local-only output: `build/architecture-equivalence/current/`
- Local-only output: `build/architecture-equivalence/report/`

如需新增或改动范围外 tracked 文件，主任务必须说明原因；涉及公开文件、workflow 或已有业务测试时立即暂停。

### 5.4 Batch P1-A：启动与只读证据，最多 3 项

#### Task 1：恢复项目上下文与状态

1. 按 `AGENTS.md` 顺序完整读取共享上下文和相关 Skill。
2. 运行 `git fetch origin main`，确认 `origin/main`；若不是用户批准的基线或已有新阶段 commit，生成差异报告并暂停。
3. 记录全部 worktree、branch、stash 和未提交修改；不得触碰其他任务状态。

#### Task 2：创建或验证 architecture worktree

1. 确认 `codex/personal-site-architecture` 和目标路径是否已存在。
2. 若不存在，从已批准的精确 `origin/main` SHA 创建 `D:\CS\Coding\qiuzhi\.worktrees\personal-site-architecture`。
3. 若已存在，只在其 clean、用途一致且基线正确时复用；否则暂停，不删除或覆盖。

#### Task 3：并行只读审计

1. 使用 `/dispatching-parallel-agents` 同时启动 `a0_route_inventory` 与 `a0_harness_risk`。
2. 严格使用本文件 3.2 节的模型和权限锁。
3. 主任务独立复核运行 `npm run check`、`npm run build:public`、`npm run check:public-dist` 的当前结果。

### 5.5 Batch P1-B：测试先行与最小实现，最多 3 项

#### Task 4：写失败的 A0 契约测试

1. 先定义 73 文件、49 HTML、双服务器和 report schema 的机器断言。
2. 运行新增测试，确认因 harness 尚未实现而按预期失败。
3. 保存失败原因，禁止通过放宽断言让测试虚假通过。

#### Task 5：安装唯一允许的新依赖

1. 在现有 `scripts/package.json` 范围内确认最小接入方式。
2. Phase 1 锁定 `@playwright/test@1.62.1`，执行 `npm install --save-dev --save-exact @playwright/test@1.62.1`，再执行 `npx playwright install chromium`；不得改用 `latest`、`^`、`~`、beta 或 alpha。Chromium 二进制只留本地，不进入 Git。
3. 安装前记录 `node --version` 并核对 package engines；本计划编写机为 Node `v24.14.0`。记录版本、Apache-2.0 许可证、安装脚本和依赖树；不兼容或出现异常供应链行为时暂停。版本证据：[npm `@playwright/test` 1.62.1](https://www.npmjs.com/package/%40playwright/test?activeTab=versions)。

#### Task 6：实现 baseline/current 自比较

1. 使用 Node 内置能力优先实现两个本地静态服务器和 route registry，不增加无必要依赖。
2. 在 `scripts/package.json` 新增 `check:equivalence:a0` script，入口必须指向新增的 Playwright config/spec；先单独运行该 script，再由 Task 7 运行完整命令组。
3. 固定 Chromium、locale、timezone、viewport、theme、动画、字体等待和外部请求策略；输出 URL/资源、normalized DOM、ARIA、截图、功能和 console/pageerror 的结构化报告，candidate adapter 保持未启用。

### 5.6 Batch P1-C：验证、审查与阶段提交，最多 3 项

#### Task 7：运行完整验证

依次运行并记录新鲜输出：

```powershell
cd D:\CS\Coding\qiuzhi\.worktrees\personal-site-architecture\scripts
npm run check
npm run build:public
npm run check:public-dist
npm run check:equivalence:a0
```

预期：

- 现有 79/79 测试保持通过，或如基线合法变化则报告精确新计数。
- 公开 manifest 仍为 73 文件，HTML route 仍为 49。
- baseline/current 的 URL、资源、DOM/ARIA、截图和功能差异为 0。
- 两端均无意外 404、console error、pageerror 或未知外部请求。
- `git diff` 不含公开 HTML/CSS/JS/data、workflow、Skill、rename 或 Track C 变化。

#### Task 8：独立审查

1. 使用 `/review` 完成主任务自审。
2. 串行启动一个只读 `gpt-5.6-luna`/`medium` reviewer，检查误报掩盖、路径覆盖、Windows 稳定性、公开边界和测试是否真的比较了两个独立服务。
3. 主任务逐项复核 reviewer 结论，修复后重新运行 Task 7；不得只引用子 Agent 声称完成。

#### Task 9：阶段分支提交与 main HITL

1. 使用 `/verification-before-completion`，运行 `git diff --check`、repository policy 和阶段文件范围检查。
2. 只在 `codex/personal-site-architecture` 提交 Phase 1 文件，建议 commit：`test: 建立站点架构等价门禁`。
3. 报告 branch commit、完整文件清单、依赖版本、测试证据和 public-dist hash，把 execution ID 状态标为 `review`，然后在**同一窗口暂停**，请求一次明确授权：是否 squash merge 到 `main` 并 push；必须说明 push 会触发 Pages 重部署但预期公开产物零变化。

HITL 获批后仍由 `P1-A0-001` 原窗口继续：重新 fetch 和复核所有 worktree/dirty state，完成一次 squash main commit、push、远端 SHA/Actions/Pages 核验，再输出最终 handoff。只有远端 `main` 与 Pages 核验完成后，Phase 1 才能填写 `landed`；branch commit 只能填写 `review`。若用户不批准，窗口以 `review` 结束，不能另起 landing 任务。

### 5.7 Phase 1 通过门槛

必须全部满足：

- 远端基线和 worktree 边界已核对。
- 两个只读并行 Agent 和一个串行 reviewer 均有可追踪结论。
- baseline/current 两个独立服务确实运行。
- 73 文件、49 HTML、资源、DOM/ARIA、截图和功能比较无未解释差异。
- 公开源文件和 `dist` 内容无变化。
- 新依赖仅为精确锁定的 Playwright dev dependency 与本地 Chromium。
- 没有 workflow、UI、Skill、rename、main、GitHub 或 Pages 修改。
- 阶段 commit 已在 architecture 分支；main/push 仍等待当次 HITL。

任何一项不满足，状态只能是 `review` 或 `blocked`，不得进入 Phase 2。

## 6. 执行窗口 handoff 格式

每个阶段执行窗口最终结束后，用户将结果带回本 planning task。达到 main HITL 的临时暂停不算窗口结束；应在原窗口继续或明确保留为 `review`。执行窗口必须输出：

```text
Phase:
Execution ID:
Window model/reasoning:
Status: review | landed | local_only | rejected | blocked
Baseline SHA:
Branch:
Worktree:
Phase commit(s):
Main commit:
Origin/main SHA:
Pushed: yes/no
Pages deployment:
Changed files:
Dependencies added/changed:
Tests and exact results:
Public dist comparison:
Visual/DOM/URL result:
Review findings:
Open risks:
Recommended next gate:
```

如果阶段已经进入 GitHub `main`，还必须附远端 SHA 和 Pages/Actions 结果；“本地 commit 成功”不能填写为 `landed`。

## 7. 当前 planning task 的动态更新协议

用户从执行窗口返回 handoff 后，本 planning task 必须：

1. 重新 fetch 并验证 handoff 中的 branch/main/remote SHA，不只依赖聊天描述。
2. 复核相关 worktree clean/dirty、提交文件范围和测试证据。
3. 只在本控制文件更新阶段状态、实际证据、偏差、决策和下一 prompt。
4. 如果 main 已推进，记录新的精确基线；不得静默把旧假设沿用到下一阶段。
5. 使用 `/review` 与 `/verification-before-completion` 后，在 planning 分支提交一次 docs 更新，不 push，除非用户另行批准。
6. 每次只发放下一个阶段 prompt；不得提前并行启动依赖尚未满足的阶段。

## 8. 动态阶段日志

| 日期 | Phase | 状态 | 证据 SHA | 决策/偏差 | 下一步 |
|---|---|---|---|---|---|
| 2026-08-20 | 0 | `review` | planning `6a5c220` + 本文件待提交 | 用户确认 Concept A+；A0–A1 技术决策交由主 Agent；要求阶段化 main landing、明确窗口模型与低级别并行 Agent | 本地提交控制文件并发放 Phase 1 prompt；Phase 0 暂不 push |
| 2026-08-23 | 1 | `landed` | `8c51ad1` | A0 等价门禁已进入 `main`；公开页面保持等价 | 进入 candidate-only 架构实施 |
| 2026-08-24 | 2–3 | `landed` | `4fdbc49`；修复 `4140bed`、`7a551bc`、`d6c447e` | Eleventy 仅用于 `build/candidate-site/`；公开静态页面未被替换；跨平台与部署门禁已修复 | 维持 candidate-only 边界，Track C 在视觉方向确定后单独启动 |

## 9. 下一阶段 prompt 状态

- Phase 1 prompt：已完成，不再发放。
- Phase 2 prompt：已与正式架构迁移完成并落地，不再发放。
- Track C prompt：架构最终 SHA 已完成验证；仍须在用户确定视觉方向后单独生成，不得与治理或文档同步混执行。

## 10. 回滚与停止条件

- 阶段分支失败：保留失败报告，不 merge；用新 revert commit 撤销已提交实验，不使用 `reset --hard`。
- main landing 后失败：用 revert 产生可审计回退提交，再验证并部署已知良好 SHA；不 force push。
- 公开 dist 出现任何未知变化：立即停止 main/push。
- 其他 worktree 出现 dirty 或同名分支冲突：立即停止，不清理、不移动、不删除。
- 需要改 workflow、Secrets、repo、Pages Settings、DNS、config.local.js 或删除文件：立即停止并请求对应 HITL。
- 用户内容事实、真实案例指标或隐私边界不明确：留到 Track C HITL，不由技术 Agent推断。
