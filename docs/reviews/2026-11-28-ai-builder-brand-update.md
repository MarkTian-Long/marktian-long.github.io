# AI Builder 品牌表达统一记录

日期：2026-11-28  
分支：`chore/ai-builder-brand-update`  
PR：[#1](https://github.com/MarkTian-Long/marktian-long.github.io/pull/1)  
状态：品牌更新与残留清理均已合并；代码检查、公开构建和产物冒烟检查通过。首次品牌部署成功，follow-up 部署遇到 Pages artifact 元数据短暂不可见，新的主线运行将再次尝试部署。

## 决策

- 当前身份标签统一使用 **AI Builder**，不再把 Product 作为身份限定词。
- Product / 产品仍用于真实且具体的工作语境，例如产品分析、产品设计、产品原型、产品开发和历史产品案例。
- 不批量改写博客正文，不删除历史项目或历史定位决策。
- 文章中 AI PM 等职业/视角限定只有在语境确实需要时保留，不作为首页身份标签。

## 修改范围

- 首页导航、Hero、Footer、页面标题、Open Graph、Twitter 与 JSON-LD。
- SEO 统一配置 `scripts/site-config.js`、博客入口、文章模板与图片替代文本。
- 更新 54 篇已发布文章的 OG/Twitter 分享图替代文本；每篇只改两处 head 元信息，正文保持不变。
- 更新 1200 × 630 OG 分享封面。
- 更新 README 中英文版、首页维护手册、AGENTS / CLAUDE、共享项目记忆、Impeccable 设计上下文、博客写作指令、SOP 与 Checklist。
- 更新设计索引参考页、SEO/图片契约测试断言，以及候选站点冻结首页和博客入口快照与对应哈希。
- 通过 follow-up PR #3 修正 Agent Hub、AI Insights 两个工具页页脚，以及一处未发布博客预览标题中的旧身份标签；已发布文章正文未改写。
- 在 2026-04 的品牌讨论文档中追加本次决策说明，不覆盖历史讨论。
- 首次部署后的公开产物复核发现两个独立工具页页脚仍使用旧身份标签；另有一处未发布博客预览标题仍使用旧角色称呼，本 follow-up 同步修正这三处，不触及已发布博客正文。

## 已完成核对

- 分支相对 main 的差异已复核；文章改动限于两处分享元信息，不涉及正文。
- 首页 Title、导航、Hero、Footer、SEO 元信息、JSON-LD 与 `scripts/site-config.js` 已读回核对为 AI Builder。
- 分享封面已读回检查，尺寸为 1200 × 630；Git blob SHA 与验证过的图片文件一致。
- 候选站点冻结快照已同步首页与博客入口；对 gzip 快照做了格式、CRC、长度和内容回环核验，并更新候选页 SHA-256 断言。
- 当前写作规则使用 AI Builder；历史版本日志中出现的 AI Product Builder 作为历史记录保留。
- PR #1 已合并至 main（`10fc52dd3849728897a6be61999f9062e036a47e`），GitHub Pages 部署运行 `46090213979` 成功；实际 Pages artifact `15240678300` 已下载并核验首页 Title、导航、Hero、Footer、博客 JSON-LD 及 1200 × 630 OG 图片。直接访问公网的外部网络检查受当前执行环境 DNS 限制，未将其误报为浏览器端验收。

## 发布与验收结果

- 已在品牌 PR 的独立验证工作流中通过 `npm run check`、`node scripts/build-public-dist.js` 和 `node scripts/check-public-dist.js`；两个并行 job 均成功。
- 已先通过 PR #2 将 `.github/workflows/verify-pr.yml` 合入 main。该工作流对 main 的 PR 并行执行仓库测试与 public artifact 构建/冒烟检查，只授予 `contents: read`，不上传 Pages artifact、不申请 Pages 权限、不部署。
- PR #1（品牌主调整）已合并，Pages 部署运行 `46090213979` 成功；PR #3（残留清理）已合并，验证运行 `46090729892` 成功。
- PR #3 合并后的部署运行 `46090847297` 中，仓库检查、公开构建、产物冒烟和 artifact 上传均成功；`deploy-pages` 随后查询到 0 个 artifact，尽管运行内 artifact `15240779618` 已存在。该失败发生在 Pages artifact 元数据读取，不是站点构建或测试失败。
- 本次文档整理 PR 会触发新的主线 Pages 运行，以新 run id 重新上传并部署；不修改现有部署权限或工作流。实际部署状态以该运行结果为准。


## 保留的历史内容

`docs/2026-04-12-editorial-redesign-notes.md` 中对 2026 年 4 月三词定位的讨论继续保留，作为当时的决策记录；本次追加说明当前品牌表达，不将后来的选择伪装成早期结论。
