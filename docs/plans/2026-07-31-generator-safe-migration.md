# 生成器安全迁移方案（Track B 前置）

本文件只记录迁移方案和 Track A 的只读 contract 基线；不重生成已发布页面或热点数据。

## 已证实的漂移/失败模式

| 组件 | 当前证据 | 风险 | Track B 迁移目标 |
|---|---|---|---|
| 博客生成器 | `tools/blog/generate-post.js` 把已发布的 `ontology-business-semantic-layer.html` 当模板读取 | 模板与一篇公开文章耦合，模板修复可能意外携带内容或 SEO 漂移 | 新建唯一受控模板文件；先用 fixture 和 `--check` 比较，再逐篇、经确认迁移 |
| Service Agent | `tools/service-agent/gen_index.js` 直接写 `tools/service-agent/index.html` | 执行命令即覆盖公开产物 | 将数据、模板和渲染器拆开；默认 `--check`，只有显式 `--write` 才能写入 |
| Trends | `scripts/fetch-trends.js` 直接写 `tools/trends/data/trends.json`，失败时可插入空 board | 网络局部失败可把已发布数据替换为不完整数据 | 先写 candidate；按 schema、板块最低条数和 `partial` 状态校验；人工确认后才替换公开数据 |

`scripts/check-generator-contracts.js` 与 `scripts/generator-contracts.test.js` 将这些信号固化为当前基线。报告模式始终零写入、零退出码；Track B 修复后应把测试改为验证新契约，而非继续断言旧问题存在。

## Track B 安全迁移步骤

1. 为博客创建独立、版本控制的模板，迁移前用受控 Markdown fixture 生成内存结果；`--check` 只比较，不写 HTML。禁止批量重生历史文章。
2. Service Agent 先把页面数据与模板分离；生成命令默认 dry-run/`--check`，`--write` 必须明确传入，并只允许目标路径白名单。
3. Trends fetch 只写入 candidate JSON。schema 必须声明采集时间、每个 board 的状态、错误原因和条目数；完整快照必须满足每个 board 的最低条数，局部失败只能输出 `partial` candidate。
4. 所有写入模式先展示目标文件和 `git diff --name-only`；公开产物替换前运行对应 checker，确认没有用户未提交的同路径变更。
5. 每次只迁移一个产物，运行 `npm test`、`npm run check`、搜索基础检查和浏览器 smoke；通过后再处理下一项。

## 非目标

- Track A 不创建模板、不重写 Service Agent 页面、不覆盖 trends 数据，也不更新博客 HTML。
- 此方案不授权修改 workflow、Secrets 或 `config.local.js`。
