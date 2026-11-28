# AI Builder 品牌表达统一记录

日期：2026-11-28  
分支：`chore/ai-builder-brand-update`  
PR：[#1](https://github.com/MarkTian-Long/marktian-long.github.io/pull/1)  
状态：分支修改与静态核对已完成；完整自动化测试、合并和部署待完成。

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
- 在 2026-04 的品牌讨论文档中追加本次决策说明，不覆盖历史讨论。

## 已完成核对

- 分支相对 main 的差异已复核；文章改动限于两处分享元信息，不涉及正文。
- 首页 Title、导航、Hero、Footer、SEO 元信息、JSON-LD 与 `scripts/site-config.js` 已读回核对为 AI Builder。
- 分享封面已读回检查，尺寸为 1200 × 630；Git blob SHA 与验证过的图片文件一致。
- 候选站点冻结快照已同步首页与博客入口；对 gzip 快照做了格式、CRC、长度和内容回环核验，并更新候选页 SHA-256 断言。
- 当前写作规则使用 AI Builder；历史版本日志中出现的 AI Product Builder 作为历史记录保留。

## 尚未完成的发布门槛

- 尚未在完整仓库环境运行 `npm run check`、`npm run build:public` 和 `npm run check:public-dist`。
- 现有 `.github/workflows/deploy.yml` 仅在 main push 或手动触发时运行，手动运行会执行 Pages 部署，不适合作为分支验证。当前 PR 没有可用的验证工作流。
- 未合并 main，未触发生产部署。必须完成测试和 public-dist smoke 后才能合并。
- 如需新增仅验证、不部署的 PR workflow，须先获得对 `.github/workflows/` 配置修改的明确授权。

## 保留的历史内容

`docs/2026-04-12-editorial-redesign-notes.md` 中对 2026 年 4 月三词定位的讨论继续保留，作为当时的决策记录；本次追加说明当前品牌表达，不将后来的选择伪装成早期结论。
