# 热点快照

热点快照 v2 是一个可追溯的 AI 信号研判台。它把五个平台的榜单记录成带来源、观察时间、指标口径、行动分类和人工判断的静态快照，不把静态数据伪装成实时热度。

## 页面能力

- 统一工作流：`1 信源 → 2 信号 → 3 分析 → 4 方法`，本页是第 2 步。
- 快照状态：`本期`、`建议复核`、`历史快照，不代表当前热度`。
- 信号视图：按平台切换，按 `持续关注`、`横向对比`、`评估落地`、`继续深挖`筛选。
- 判断视图：每条信号展开“变化、证据、影响、不确定性、下一步”，深挖信号还必须提供下一研究问题。
- 来源账本：展示每个平台的来源链接、来源记录日期、页面观察日期和排名依据。
- 错误态：数据不存在、JSON 无效、空板块都会显示可重试的错误信息。

页面只通过本地 HTTP 读取 JSON。直接用 `file://` 打开时，浏览器可能阻止 `fetch`，请使用任意本地静态服务器。

## v2 数据契约

公开 `tools/trends/data/trends.json` 必须满足 `tools/trends/contract.js`：

- 快照元数据：`contract_version`、`snapshot_id`、`snapshot_status`、`as_of`、`observed_at`、`reviewed_at`、`collection_mode`、`verification_level`、`featured_id`。
- 板块：稳定 `id`、标题、图标、简介、`ranking_basis`、来源对象和非空 `items`。
- 来源：稳定 `id`、名称、HTTPS `url`、`as_of`。
- 信号：稳定 `id`、`rank`、标题、摘要、具体 HTTPS `url`、`source_id`、`observed_at`、`verification_level`、行动分类、指标和判断。
- 指标：`label`、`value`、`definition`、合法 `kind`、`as_of`、HTTPS `source_url`、`caveat`。
- 判断：`change`、非空 `evidence`、`impact`、`uncertainty`、`next_step`；包含 `deep_dive` 时还需要 `next_question`。

不接受 `javascript:`、`data:`、HTTP 链接、榜单根页面、重复 URL、占位文本或未复核记录。日期按 UTC 日历计算，0–7 天为本期，8–30 天建议复核，超过 30 天为历史快照。

## 数据更新边界

默认命令只校验，不抓取、不写入：

```bash
cd scripts
node fetch-trends.js --check
```

需要把过期数据当作失败时，显式使用 freshness gate：

```bash
node fetch-trends.js --check --freshness
```

自动抓取只生成候选，候选文件必须落在 `build/candidate-site/`，失败板块保留诊断且不补占位条目：

```bash
node fetch-trends.js --discover --candidate ..\build\candidate-site\trends-candidate.json
```

人工完成来源、时间、指标、行动和判断复核后，才允许写入 `tools/trends/data/`。写入前会再次验证完整 v2 契约，写入命令不联网：

```bash
node fetch-trends.js --write --input ..\build\candidate-site\trends-reviewed.json
```

如需测试其他公开目标，`--target` 也只能指向 `tools/trends/data/` 下的文件。绝对路径、`..` 逃逸、候选目录或仓库外路径都会被拒绝。写入前先完成路径校验和 JSON 校验，失败不会创建目标文件。

## 当前快照限制

仓库内当前公开快照的 `as_of` / `observed_at` 是 `2026-05-19`，页面在 `2026-08-30` 显示“历史快照，不代表当前热度”。`reviewed_at` 只表示本轮契约和编辑字段复核日期，不代表重新核对了当日榜单。历史记录中的数值、排序、事实和因果判断没有在本轮联网重验，不能当作 2026-08-30 的当前事实。

来源排名只说明对应平台当时的排序或互动口径，不等于跨平台热度、用户留存、市场规模或因果结果。下一轮更新应保留可追溯的具体条目链接、来源日期和核验说明。

## 文件结构

```
tools/trends/
├── index.html        # 页面结构与设计 token
├── app.js            # 安全 DOM 渲染、工作流视图和交互
├── contract.js       # v2 契约、URL 边界和 freshness 纯函数
├── data/
│   └── trends.json   # 人工复核后的公开快照
└── README.md
```

相关测试：

```bash
cd scripts
node --test trends-depth.test.js
node --test trends-depth.browser.test.js
```

浏览器测试使用固定时钟 `2026-08-30`，覆盖正常、筛选、键盘、来源、移动端、空板块、404 和无效 JSON 状态。
