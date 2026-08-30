---
name: update-trends
description: 更新热点快照数据。先校验公开快照，再并行发现五类平台候选，经人工逐条复核后才显式写入 tools/trends/data/trends.json。当用户说「更新热榜」「刷新热点」时使用。
type: workflow
---

# Update Trends

当用户说「更新热榜」「刷新热点」「/update-trends」时使用此 skill。

## 核心边界

- 默认命令只校验现有公开快照，不联网、不写文件。
- 自动发现只能写入 `build/candidate-site/` 下的候选 JSON；候选状态不得直接发布。
- 公开数据只能由经过人工复核、满足 v2 contract 的完整 JSON 显式写入。
- 任一板块抓取失败、为空或字段不完整时保留诊断，不生成占位热点，也不覆盖公开文件。
- `as_of` 是快照观察日期；结构检查日期不能冒充事实复核日期。

## 执行步骤

1. 先在 `scripts/` 运行只读检查：

   ```powershell
   node fetch-trends.js --check
   ```

   若需要把过期快照作为维护门禁，再加 `--freshness`。历史警告不是实时数据证明。

2. 仅在用户要求刷新时，并行发现五个板块的候选：
   - GitHub Trending AI 项目（本周）
   - Product Hunt 本月榜单
   - Hacker News 热议话题
   - 出海 AI 动态（Twitter/X + 独立媒体）
   - 国内 AI 热点（36Kr + 知乎 + 微博）

   候选必须写到尚不存在的仓库内路径，例如：

   ```powershell
   node fetch-trends.js --discover --candidate ..\build\candidate-site\trends-candidate-YYYY-MM-DD.json
   ```

3. 人工逐条打开来源并复核候选，补齐 v2 contract：稳定 ID、来源时间、排名口径、行动标签、指标类型、证据、影响、不确定性和下一研究问题。所有公开条目必须标为已复核；失败板块或空板块不得伪造补位。

4. 将复核后的完整 JSON 保存到 `build/candidate-site/`，先运行 contract/专项测试；确认五个板块均完整后，才显式写入：

   ```powershell
   node fetch-trends.js --write --input ..\build\candidate-site\trends-reviewed-YYYY-MM-DD.json
   ```

   `--write` 只读取给定文件，绝不隐式联网；目标路径被限制在 `tools/trends/data/`。

5. 写入后再次运行：

   ```powershell
   node fetch-trends.js --check --freshness
   node --test trends-depth.test.js trends-depth.browser.test.js
   ```

6. 告知用户候选路径、人工复核范围、写入结果、快照观察日期、失败来源和剩余限制。没有完成复核与写入时，只能称“候选已生成”，不能称“热点已更新”。
