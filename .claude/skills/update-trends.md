# Update Trends

当用户说「更新热榜」「刷新热点」「/update-trends」时使用此 skill。

## 执行步骤

1. 并行搜索五个板块的最新热点：
   - GitHub Trending AI 项目（本周）
   - Product Hunt 本月榜单
   - Hacker News 热议话题
   - 出海 AI 动态（Twitter/X + 独立媒体）
   - 国内 AI 热点（36Kr + 知乎 + 微博）

2. 每个板块提取 3-8 条热点，每条包含：
   - rank（排名）
   - title（标题）
   - summary（一句话描述，≤30字）
   - insight（Claude 点评，≤80字，PM 视角）
   - url（来源链接）
   - source（平台名称）
   - tags（2-3个标签）

3. 生成完整 trends.json，updated_at 设为今天日期

4. 写入 tools/trends/data/trends.json（覆盖原文件）

5. 告知用户更新完成，简述各板块亮点
