# qiuzhi 站点可信度、架构与编辑体验改进计划

日期：2026-07-31

状态：待执行，采用“非前台优先”顺序

当前基线：`main`，`f66eeba`，已有 37 个未提交修改；执行时必须保护这些改动。

## 1. 目标

在不迁移框架、不改变纯静态多页面基本架构的前提下，提高：

1. 安全与公开可信度；
2. 测试、生成器和文档的一致性；
3. 作品证据链；
4. 首页、博客和 Demo 的阅读与视觉体验；
5. 跨 Agent 可复用的规范和 Skill。

本计划不引入 React、Vite、CMS 或大规模构建链。

## 2. 执行策略：先不改变阅读体验

任务分为三条轨道，必须依次执行。

### Track A：公开页面零变化

> 执行状态（2026-07-31）：已完成 A0–A6。交接、验证结果和 Track B 前置条件见 `docs/plans/2026-07-31-track-a-handoff.md`；未授权进入 Track B 或 Track C。

允许修改脚本、测试、非公开文档和共享规范，但不得修改公开 HTML/CSS、公开 JSON 内容或部署行为。

完成后预期：

- 首页、博客、文章和 Demo 的画面、文案与交互完全不变；
- 本地检查入口更完整；
- 后续修改有更好的回归保护；
- Agent 更不容易重复犯同类错误。

### Track B：布局不变，但功能或部署行为可能改变

包括安全边界、密钥处理、DOM 安全渲染、生成器输出、部署白名单和大型页面重构。

完成后预期：

- 首页和博客阅读布局不变；
- 部分 Demo 可能从真实调用改为 Mock-only；
- 错误、模型输出或 Markdown 的显示格式可能出现小幅变化；
- 部署产物和工具运行方式会发生变化。

Track B 必须在 Track A 完成并验收后执行。修改 `.github/workflows/`、Secrets、`config.local.js` 前仍需用户单独确认。

### Track C：明确改变前台阅读与视觉体验

包括首页信息顺序、Hero 文案、颜色、字号、留白、作品层级、博客策展、作者说明和 Demo 视觉统一。

Track C 暂缓，等用户统一处理视觉与内容时再执行。

## 3. 修改前后影响

| 领域 | 修改前 | 修改后 | 是否影响公开阅读体验 |
|---|---|---|---|
| 本地检查 | 多个命令分散，`npm test` 是占位入口 | 一个统一的本地 `test/check` 入口 | 否 |
| CI 门禁 | 只覆盖部分仓库策略测试 | 后续可覆盖搜索、生成物、语法和 Smoke | 否，但改 workflow 需 HITL |
| 生成器 | 模板、生成源和产物关系不清 | 唯一源、`--check`、候选输出与安全替换 | Track A 只设计/测试时不影响；实际重生成可能影响 |
| 文档 | 直链与 iframe、真实与 Mock 描述冲突 | 文档与现状一致 | 不影响网站读者；会影响源码读者 |
| 密钥 | 静态部署可能公开真实 key | Mock-only 或服务端代理 | 不改变排版，但改变 Demo 能力 |
| DOM 输出 | 部分远端内容进入 `innerHTML` | 安全文本或白名单结构化渲染 | 可能改变 Demo 输出格式 |
| 作品证据 | 指标、真实项目、Mock 边界分散 | 单一证据 schema 和检查器 | Track A 建 schema 不影响；展示时影响 |
| 首页结构 | Writing、Judgment、Tools、Cases 层级较平 | 精选作品、判断、阅读路径和 Labs 分层 | 是，Track C |
| 博客发现 | 时间流和宽分类为主 | 精选、系列、阅读时长和 Start Here | 是，Track C |
| 视觉系统 | 首页编辑感较强，Demo 风格分裂 | 陶土色、排版和可信度标识统一 | 是，Track C |

## 4. Track A：非前台执行包

### A0. 工作区保护

状态：已完成（2026-07-31）

优先级：P0

模型：中等模型或强模型

公开影响：无

步骤：

1. 读取并记录当前 37 个修改文件。
2. 不覆盖、不 stash、不还原现有修改。
3. 不在 `main` 上直接实施代码变更；如果当前修改尚未提交，先由用户决定如何处理，再建立 `codex/site-trust-editorial-v2` 分支或 worktree。
4. 记录以下基线：
   - repository policy；
   - repository tests；
   - search foundation tests；
   - search foundation checker；
   - tracked JS 语法；
   - tracked JSON 解析。

验收：

- 基线结果被记录；
- 执行前后的既有修改文件内容未被无意改变；
- 没有执行 push、reset、stash 或文件删除。

### A1. 统一本地测试和检查入口

状态：已完成（2026-07-31）

优先级：P1

模型：低成本模型可执行

公开影响：无

目标文件：

- `scripts/package.json`
- 新增或调整 `scripts/check-all.js`
- 必要的 Node 测试文件
- 非公开开发文档

要求：

1. 修复不存在的 `main: index.js` 和占位 `npm test`。
2. 建立 Windows 兼容的统一入口。
3. 本地检查至少覆盖：
   - `scripts/repository-policy.test.js`
   - `scripts/search-foundation.test.js`
   - `scripts/check-repository-policy.js`
   - `scripts/check-search-foundation.js`
   - tracked JS `node --check`
   - tracked JSON 解析
4. 此任务不得修改 `.github/workflows/deploy.yml`。

验收：

```powershell
cd scripts
npm test
npm run check
```

两条命令均成功，且没有公开页面 diff。

### A2. 增加只读安全和证据检查

状态：已完成（2026-07-31）

优先级：P1

模型：中等模型设计，低成本模型可按明确规则实现

公开影响：无

建议新增：

- `scripts/check-static-client-secrets.js`
- `scripts/check-portfolio-evidence.js`
- 对应测试

第一轮检查只报告，不自动改公开页面：

1. 检测 workflow 或公开静态文件中的密钥注入模式；
2. 检测高风险 `innerHTML` 使用位置；
3. 检测“真实、准确率、提升、生产级”等高风险公开表述；
4. 为每条结果提供文件、行号和修复建议；
5. 不读取或输出 `config.local.js` 内容。

验收：

- 已知问题能被测试夹具稳定检出；
- 检查器不会打印 Secret；
- 检查器在当前仓库以报告模式运行，不改任何文件。

### A3. 定义 Portfolio 证据 schema，但暂不接入页面

状态：已完成（2026-07-31）

优先级：P1

模型：强模型定义字段，中/低模型实现校验

公开影响：无

建议先新增非展示性 schema 或示例：

```text
id / title / tier / type / status
myRole / realParts / mockParts
metrics.kind / definition / source / asOf
evidence / limitations
demo / case / code / article
lastVerified
```

指标类型必须区分：

- `target`
- `proxy`
- `offline-measured`
- `production-result`
- `external-research`

本阶段只定义 schema、样例和检查器，不让首页读取，不批量改写现有作品文案。

验收：

- schema 能表达 ESOP、金融 RAG、智能客服、反洗钱、ASCI 五类作品；
- 缺少指标口径或 Mock 边界时检查失败；
- `index.html`、`assets/css/style.css`、公开工具页面无修改。

### A4. 固化共享规范

状态：已完成（2026-07-31）

优先级：P1

模型：低成本模型可执行，强模型复核

公开影响：无

更新位置：

- `CONVENTIONS.md`
- `docs/agent-context/memory.md`
- `docs/agent-context/skills.md`
- `.agents/skills/code-health-check/SKILL.md`
- 需要时更新 `.agents/skills/publish-blog/SKILL.md`

沉淀以下规则：

1. 静态客户端不得承载服务端秘密；
2. 外部输入和模型输出不得直接注入 HTML；
3. 数字指标必须声明类型、定义、来源和日期；
4. Mock 必须在首次交互处标识；
5. 生成物必须有唯一源、`--check` 和安全替换流程；
6. 新建 Skill 的门槛是稳定流程已重复至少三次。

Skill 策略：

- 第一轮优先扩展 `code-health-check` 和 `publish-blog`；
- 暂不创建 `portfolio-proof-audit`；
- 完成一次完整作品证据改造后，再判断是否独立成 Skill。

知识沉淀规则：

| 发现类型 | 必须写入 | 是否需要自动检查 |
|---|---|---|
| 稳定、短、不可违反的项目规则 | `CONVENTIONS.md` | 能检查则增加 checker/test |
| 已验证的架构事实、长期决定和常见陷阱 | `docs/agent-context/memory.md` | 视情况 |
| Skill 来源、同步和触发规则 | `docs/agent-context/skills.md` | 必须运行同步检查 |
| 已重复至少三次的多步骤工作流 | `.agents/skills/<name>/SKILL.md` | 必须登记并同步兼容层 |
| 可机械判断的错误模式 | `scripts/check-*.js` 和测试 | 必须 |
| 仍需观察、尚未稳定的经验 | Track A handoff 的候选区 | 暂不升级为规范 |
| 一次性的设计或范围决定 | 本计划或对应 ADR | 不创建 Skill |

如果新增项目 Skill，必须同时：

1. 登记 `scripts/repository-policy.json`；
2. 更新 `.agents/skills/<name>/SKILL.md`；
3. 同步 `.claude/skills/`；
4. 更新 `AGENTS.md`、`CLAUDE.md` 和共享 Skill 清单；
5. 运行上下文同步检查与 repository policy。

验收：

```powershell
powershell -ExecutionPolicy Bypass -File scripts/sync-agent-context.ps1 -Write
powershell -ExecutionPolicy Bypass -File scripts/sync-agent-context.ps1
node scripts/check-repository-policy.js
```

### A5. 生成器修复方案与测试夹具

状态：已完成（2026-07-31）

优先级：P1

模型：中等模型

公开影响：无，只允许方案、测试和 `--check` 基础设施

范围：

- 博客独立模板方案；
- Service Agent 唯一生成源；
- Trends candidate/schema/最低条数/partial 策略。

本阶段禁止：

- 重生成任何已发布博客 HTML；
- 重生成 `tools/service-agent/index.html`；
- 覆盖 `tools/trends/data/trends.json`；
- 修改用户当前 35 篇文章的未提交 SEO 变更。

验收：

- 测试能证明当前漂移和失败模式；
- 没有公开产物被重写；
- 后续 Track B 有明确迁移步骤。

### A6. Track A 交接与经验台账

状态：已完成（2026-07-31）

优先级：P1

模型：低成本模型可整理，强模型最终复核

公开影响：无

必须新增：

- `docs/plans/2026-07-31-track-a-handoff.md`

交接文档至少包含：

1. 实际完成的任务和未完成项；
2. 修改文件与验证命令；
3. 公开页面冻结检查结果；
4. 新发现的问题及其证据；
5. 已写入 `CONVENTIONS.md` 的稳定规则；
6. 已写入共享 memory 的架构事实和陷阱；
7. 已增加的 checker/test；
8. 已扩展或新增的 Skill；
9. 尚未达到 Skill 门槛的候选经验；
10. Track B 的前置条件、风险与 HITL 项。

问题台账使用统一字段：

```text
problem / evidence / recurrence / classification
destination / enforcement / status / owner_or_gate
```

完成判定：

- 不能只在聊天中报告问题；
- 每条可复用发现都必须明确“已沉淀到哪里”或“为什么暂不沉淀”；
- 文档、Skill、checker 和实际命令必须互相一致；
- 计划文件更新 Track A 状态后，才可声称 Track A 完成。

## 5. Track B：行为、安全和部署

暂不在“阅读体验保持不变”任务中执行。

执行状态（2026-07-31）：B1、B2、B3 已完成；B4、B5 未开始。

### B1. 停止静态部署公开真实密钥

优先级：P0

模型：强模型

HITL：修改 workflow 和 Secrets 前必须确认

影响：

- 首页和博客排版不变；
- 真实 AI Demo 可能暂时变为 Mock-only；
- 已发布 credential 可能需要用户轮换。

### B2. 修复 DOM XSS 和 Key 持久化

优先级：P0/P1

模型：强模型

影响：

- 页面结构通常不变；
- 模型回答的换行、富文本或错误样式可能变化；
- 自定义 key 不再跨会话长期保存。

### B3. 收口直链架构和文档

优先级：P1

模型：低/中模型

影响：

- 阅读布局不变；
- 旧的 iframe 跳转和失效函数被删除；
- 源码与 README 的理解路径改变。

### B4. 生成公开 `dist/` 白名单

优先级：P1

模型：中/强模型

HITL：接入 workflow 前必须确认

影响：

- 正常页面 URL 应保持不变；
- dev-only 页面、脚本和文档不再进入 Pages artifact；
- 漏配白名单可能导致线上 404，因此必须先本地构建和 Smoke。

### B5. 拆分 Stock 和 ESOP

优先级：P2

模型：中模型

影响：

- 目标是视觉与功能不变；
- 属于高回归风险重构，应在浏览器 Smoke 完整后单独执行。

## 6. Track C：前台视觉和内容

以下全部暂缓：

1. 首页顺序调整；
2. Hero 定位和 CTA 文案；
3. 蓝色 CTA 改陶土色；
4. Emoji 作品列表改编号或类型标签；
5. 三个旗舰作品上移；
6. “我的判断”精简和证据状态；
7. 博客 Start Here、系列、精选和阅读时长；
8. 作者说明、Colophon 和 AI 协作披露；
9. 字号、留白、对比度和移动端列表调整；
10. Demo 视觉统一。

Track C 执行前需要强模型和用户共同确认：

- 站点更偏“独立思想杂志”还是“AI Builder 作品证明”；
- 首页第二屏先放精选作品还是我的判断；
- 三个旗舰作品名单；
- 真实项目角色、指标和 AI 协作说明。

## 7. 模型分工

低成本模型可执行：

- A1 统一命令；
- A2 已明确规则的检查器实现；
- A4 文档和 Skill 同步；
- 后续元数据机械迁移；
- 明确验收下的链接、测试和规范修订。

中等模型更合适：

- A5 生成器契约；
- 浏览器 Smoke；
- 可访问性；
- Stock/ESOP 模块拆分。

必须使用强模型或人工事实确认：

- 密钥和服务端代理设计；
- XSS 修复方案复核；
- Mock/真实边界；
- 指标是否真实达成；
- 旗舰作品选择；
- Hero、案例和作者说明；
- 最终安全与品牌验收。

## 8. 总体验收

每个 Track 完成后必须检查：

1. 当前用户已有修改是否被保护；
2. 公开页面是否出现计划外 diff；
3. 测试和检查是否通过；
4. 是否触碰 HITL 清单；
5. 文档、Skill 和实际行为是否一致。

Track A 的额外验收：

```powershell
git diff -- index.html assets/css/style.css tools/blog/index.html tools/blog/posts tools/*/index.html
```

除执行前已有的 37 个修改外，不得出现 Track A 新增的公开页面变化。

## 9. 推荐执行顺序

```text
A0 工作区保护
→ A1 统一本地检查
→ A2 只读安全/证据检查
→ A3 Portfolio schema
→ A4 共享规范与 Skill
→ A5 生成器方案和测试夹具
→ A6 交接与经验台账
→ Track A 验收
→ 用户决定是否进入 Track B
→ Track C 最后统一处理
```
