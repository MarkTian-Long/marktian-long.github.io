# 网站可检索基础关联影响与回退说明

## 结论

第一阶段对普通读者的页面内可见影响应为零。预期变化只发生在搜索引擎、
AI crawler、搜索结果摘要、链接分享预览和 RSS 阅读器中。

## 用户感知矩阵

| 改动 | 站内页面可见 | 站外可能可见 | 风险 |
| --- | --- | --- | --- |
| `robots.txt` | 否 | crawler 读取 | 极低 |
| `sitemap.xml` | 否 | 搜索引擎发现 URL | 极低 |
| `feed.xml` | 否 | RSS 阅读器可订阅 | 极低 |
| canonical | 否 | 搜索引擎选择正式 URL | 极低 |
| meta description | 否 | 搜索结果摘要可能变化 | 低 |
| `BlogPosting` JSON-LD | 否 | 搜索结果理解增强 | 低 |
| 首页/归档 JSON-LD | 否 | 搜索实体理解增强 | 低 |
| RSS auto-discovery | 否 | 浏览器/阅读器发现 Feed | 极低 |
| 生成与检查脚本 | 否 | 无 | 低 |

## 文件影响

### 新建

| 文件 | 用途 | 页面可见 |
| --- | --- | --- |
| `scripts/site-config.js` | 集中站点地址与作者配置 | 否 |
| `scripts/search-foundation.js` | 纯函数生成模块 | 否 |
| `scripts/search-foundation.test.js` | Node 内置测试 | 否 |
| `scripts/generate-search-assets.js` | 生成根目录搜索资产 | 否 |
| `scripts/retrofit-blog-seo.js` | 补齐现有文章 head | 否 |
| `robots.txt` | crawler 规则与 sitemap 声明 | 否 |
| `sitemap.xml` | URL 清单 | 否 |
| `feed.xml` | RSS 2.0 Feed | 否 |

### 修改

| 文件 | 修改范围 | 明确禁止 |
| --- | --- | --- |
| `index.html` | 仅 `<head>` | 不改 `<body>`、CSS、脚本交互 |
| `tools/blog/index.html` | 仅 `<head>` | 不改筛选、分页、布局 |
| `tools/blog/generate-post.js` | 复用 SEO 生成逻辑 | 不改 Markdown 渲染和正文替换 |
| `tools/blog/posts/*.html` | 仅受控 SEO head 标记块 | 不改 `<body>` |
| `tools/blog/WRITING_GUIDE.md` | 发布与检查步骤 | 不改写作风格规范 |
| `tools/blog/README.md` | 搜索资产维护说明 | 不改工具功能说明 |
| `CONVENTIONS.md` | 补充搜索元数据规范 | 不改现有视觉规范 |

### 不修改

- `assets/css/**`
- `assets/js/main.js`
- `assets/js/analytics.js`
- `.github/workflows/**`
- `tools/blog/data/posts-meta.json`
- `docs/blog/**`
- dev-only 工具
- API key 配置文件

## 当前工作区保护

规划时工作区存在以下用户状态：

```text
 M docs/blog/human-ai-boundary-shift.md
 M tools/blog/posts/human-ai-boundary-shift.html
?? docs/blog/physical-world-llm.md
```

执行任务开始时必须重新运行 `git status --short`，不能假设状态保持不变。

保护规则：

1. 不提交 `docs/blog/**` 的任何现有改动。
2. 若 `tools/blog/posts/human-ai-boundary-shift.html` 仍有真实内容差异，
   SEO 脚本只能修改 head，并且必须证明 body 不变。
3. 若无法把 SEO head hunk 与用户 hunk 安全分离，跳过该文件并报告，
   不得把用户正文一起提交。
4. 不使用 stash、reset、checkout 或其他会隐藏、覆盖用户改动的操作。

## 依赖影响

不增加浏览器依赖、CSS 依赖或前端运行时。

测试使用 Node 内置 `node:test`、`assert`、`fs`、`path` 和 `URL`。生成脚本
不依赖网络，不要求安装新的 npm 包。

## 搜索与 crawler 影响

### 预期正向影响

- crawler 能从 sitemap 发现全部文章
- canonical 统一正式 URL
- description 提供稳定摘要候选
- JSON-LD 明确文章、作者和主页实体
- RSS 提供持续发现渠道

### 明确边界

- sitemap 是发现提示，不保证收录
- JSON-LD 不保证富结果或排名
- 第一阶段不改变 GPTBot 等 crawler 的现有访问权限
- 不伪造发布日期
- 不做关键词堆砌

## 回退层级

### 单文件回退

删除或恢复 `robots.txt`、`sitemap.xml`、`feed.xml` 不影响页面运行。

### 能力回退

每项能力使用独立提交，可以分别执行：

```powershell
git revert <commit-sha>
```

### 整体回退

按提交逆序逐个 revert。禁止使用 `git reset --hard`。

### 部署回退

GitHub Pages 只有在 push 后才更新。实施任务必须先完成本地验证并提供报告，
得到用户确认后才能 push。

## 验收证据

实施任务最终必须提供：

- 新增和修改文件清单
- `git diff --check` 结果
- Node 测试结果
- 搜索资产一致性检查结果
- 文章 body 不变检查结果
- 首页、博客归档、三篇文章的桌面/移动截图
- 本地 HTTP 状态检查
- 未提交用户文件仍被保留的 `git status --short`
- 每个提交 SHA 和对应回退方式

## 域名后续影响

未来购买域名时只需：

1. 修改 `scripts/site-config.js` 的 `siteUrl`
2. 重新生成 robots、sitemap、RSS 和文章 SEO head
3. 配置 GitHub Pages 与 DNS
4. 重新提交 Search Console/Bing 属性

不需要重新设计页面或内容体系。

## 可见改动延后清单

以下内容属于第二阶段，必须重新设计和确认：

- 专题页和首页专题入口
- 作者、发布日期、更新时间的可见展示
- 面包屑
- 核心结论区
- 相关文章重排
- 静态博客归档
- 任何 CSS 或布局调整
