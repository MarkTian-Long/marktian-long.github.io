# 网站数据分析接入设计

## 目标

为 `https://marktian-long.github.io` 建立无需自建后端的网站数据分析能力：在 GA4 中查看全站访问、来源渠道和关键互动，并能单独评估每篇博客文章的浏览与阅读完成度；在 Search Console 中查看自然搜索表现。

## 方案与取舍

采用 **GA4 + Google Search Console**。

- GA4 负责访问、互动和文章阅读数据。GitHub Pages 只需加载 Google tag，不增加服务器或构建依赖。
- Search Console 负责搜索曝光、查询词、点击和平均排名，并与 GA4 的同域网站数据关联。
- 不采用仅访问级的 Cloudflare Web Analytics：它适合基础流量监控，但本次还需要可定义的博客阅读与作品互动事件。
- 不收集姓名、邮箱、电话、表单内容或其他可识别个人信息；事件只携带页面路径、文章 slug、页面类别和交互名称。

## 架构

```text
所有公开 HTML 页面
  -> /assets/js/analytics.js
  -> Google tag (GA4 Measurement ID)
  -> GA4 Reports / Explore

Google Search Console
  -> 自然搜索曝光、点击、查询词
  -> 关联 GA4 Web data stream
```

`assets/js/analytics.js` 是唯一的统计运行时：配置 Google tag、发送全站 page view、提供无操作安全降级的 `trackAnalyticsEvent()`，并根据 URL 自动识别文章页。Measurement ID 是公开标识符，集中在该文件配置，避免散落到 30 多个 HTML 页面。

## 数据口径

| 指标或事件 | 触发 | 参数 | 用途 |
| --- | --- | --- | --- |
| `page_view` | 每个公开页面加载 | 默认 `page_path`、`page_title` | PV、独立访客、落地页、单篇文章浏览量 |
| `blog_article_view` | URL 位于 `/tools/blog/posts/` | `article_slug` | 单篇文章报表和内容分组 |
| `blog_read_depth` | 文章首次达到 50% / 90% 阅读深度 | `article_slug`、`percent` | 区分打开与有效阅读 |
| `blog_article_open` | 首页或归档页点击文章 | `article_slug`、`source_surface` | 找到文章分发入口 |
| `tool_open` | 首页打开工具面板或进入工具直链 | `tool_name`、`source_surface` | 判断作品兴趣 |
| `case_detail_open` | 展开案例详情 | `case_title` | 判断案例内容参与度 |
| `contact_click` | 点击邮箱、复制电话等联系动作 | `contact_method` | 求职转化代理指标 |

同一访客重复打开文章会按 GA4 的标准会话与用户口径计算；文章“阅读完成”不等于真实读完，而是首次滚动至 90% 的行为代理，应在后台命名为“90% 阅读深度”。

## 页面覆盖范围

- 首页 `index.html`
- 公开工具页：`ai-insights`、`radar`、`trends`、`agent-hub`、`asci`、`service-agent`、`stock`、`esop-extractor`
- 博客归档页 `tools/blog/index.html`
- 当前 33 篇博客文章，以及后续新文章模板/写作规范

`dashboard` 和 `product-collector` 为 dev only，不加载生产分析脚本。

## 后台配置与验收

1. 用户在 GA4 创建一个 Web data stream，时区设为 `Asia/Shanghai`，开启增强型衡量，并提供 `G-` 开头的 Measurement ID。
2. 将站点加入 Search Console，使用 HTML meta 验证；在 GA4 管理后台关联同一 Web data stream。
3. 部署后用 GA4 Realtime 验证首页、任一工具页、任一博客文章及一个互动事件。
4. 24-48 小时后检查标准报告：Landing page、Traffic acquisition、Pages and screens、Events；以 `article_slug` 建立文章阅读 Explore 报告。

## 风险与边界

- Measurement ID 不是密钥，放进静态站点是正常做法；不要把 Google 账号、访问令牌或服务账号密钥放入仓库。
- 统计数据从脚本上线后开始累积，无法回补历史访问。
- 若面向需要 Cookie 同意的地区投放或开展广告再营销，需单独补充隐私声明与 Consent Mode；本次只做匿名内容分析。
