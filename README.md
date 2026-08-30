# Leo Liu · 个人网站

> 以「思考碎片」为核心的个人网站：用文章沉淀判断，用工具记录实验，用脱敏案例保留项目方法。

## 在线访问

[marktian-long.github.io](https://marktian-long.github.io)

网站公开运行时是纯静态页面，可直接访问；本地 Node 工具链只用于生成、验证和发布前检查。

## 思考碎片是主线

[进入思考碎片](https://marktian-long.github.io/tools/blog/)

这里持续记录对 AI、产品、技术、商业与行业的观察。文章不是工具的附录，而是网站的主线：判断从文章出发，再由工具、原型和案例补充具体的实践与证据。

## 如何浏览

首页按以下顺序组织内容：

1. **首页与简介**：个人定位、关注方向和联系方式。
2. **思考碎片（核心）**：持续更新的 AI、产品、技术、商业与行业文章，可进入完整博客归档。
3. **我的判断**：把文章、工具和具体判断串联起来的短观点。
4. **作品与工具**：可独立打开的交互原型与信息工具。
5. **产品案例**：脱敏项目案例，展开后阅读完整的背景、判断与过程。
6. **联系**：邮件、电话和网站入口。

## 内容入口

| 区域 | 路径 | 内容 |
| --- | --- | --- |
| 思考碎片 | [`tools/blog/`](tools/blog/) | 文章归档、筛选和独立文章页 |
| 首页 | [`index.html`](index.html) | 文章、判断、工具、案例与联系信息的主入口 |
| 交互原型 | [`tools/`](tools/) | 四个场景化的 AI 产品与系统原型 |
| 信息工具 | [`tools/`](tools/) | 四个日常信息获取与分析工具 |

## 作品与工具

### 交互原型

| 工具 | 路径 | 说明 |
| --- | --- | --- |
| ESOP 字段提取 Demo | [`tools/esop-extractor/`](tools/esop-extractor/) | 字段证据核验、人工复核、离线评估与会话级自定义接口工作台 |
| A股 AI 助手 | [`tools/stock/`](tools/stock/) | 明确 Mock/联网边界、逐 Claim 引用、反馈回归与工具轨迹的金融研究原型 |
| 智能客服产品设计沙盘 | [`tools/service-agent/`](tools/service-agent/) | 三场景验收、故障注入、HITL、运行复盘与安全导出的决策沙盘 |
| ASCI 科研任务执行系统 | [`tools/asci/`](tools/asci/) | 14 节点研究协议、审计轨迹、人工检查点与可恢复降级管线 |

### 信息工具

| 工具 | 路径 | 说明 |
| --- | --- | --- |
| AI 产品拆解 | [`tools/ai-insights/`](tools/ai-insights/) | 可筛选、可深链、带来源与待复核边界的静态产品研究档案 |
| 前沿雷达 | [`tools/radar/`](tools/radar/) | 按研究意图组织信源、覆盖盲区与下一步去向的信息入口 |
| 热点快照 | [`tools/trends/`](tools/trends/) | 区分历史快照与结构复核、支持行动筛选和来源账本的信号研判台 |
| Agent 认知全景 | [`tools/agent-hub/`](tools/agent-hub/) | 以六问规则判断是否需要 Agent，并解释控制、回退与替代方案 |

所有公开工具均可独立打开。它们使用静态数据或 Mock 演示，不携带第三方服务凭据。

## 思考碎片的内容维护

博客元数据的单一来源是 [`tools/blog/data/posts-meta.json`](tools/blog/data/posts-meta.json)。新文章的 Markdown 源稿位于 [`docs/blog/`](docs/blog/)，公开文章页位于 [`tools/blog/posts/`](tools/blog/posts/)。

历史文章保留原始公开正文；不会为了统一模板批量重写旧文章。文章的 SEO、RSS、sitemap 和博客关系导航由脚本与元数据共同维护。

## 技术与发布架构

```text
公开访问者
    │
    ├── index.html                  首页，浏览器直接运行
    ├── tools/blog/                 博客与文章页
    └── tools/<name>/               独立静态工具

本地验证与发布
    │
    ├── scripts/public-dist-manifest.js   公开文件白名单
    ├── scripts/build-public-dist.js      构建 dist/ 发布产物
    ├── scripts/check-public-dist.js      文件与链接检查
    ├── scripts/build-candidate-site.js   候选生成站构建
    └── scripts/check-candidate-equivalence.js
                                         候选站与公开基线等价检查
```

- **公开运行时**：HTML、CSS 与 Vanilla JavaScript，无框架运行时依赖。
- **发布边界**：GitHub Pages 只接收 `dist/` 中由显式白名单生成的文件。
- **候选生成架构**：Eleventy 仅用于本地 candidate 构建与等价验证，输出到忽略的 `build/candidate-site/`，默认不会覆盖公开源文件或 `dist/`。
- **安全写入约束**：生成器默认检查或生成候选结果；更新公开生成物必须显式使用 `--write`。
- **工具边界**：公开工具按精确文件级白名单透传，保持独立静态页面与 Mock 边界。

这意味着网站既保留了静态站的简单可靠，也有一条可验证的演练路径来保护后续维护。

## 本地预览与验证

```bash
# 本地预览，避免浏览器 file:// 限制
python -m http.server 8080
# 打开 http://localhost:8080
```

```bash
cd scripts
cmd /c npm ci
cmd /c npx playwright install chromium
cmd /c npm run check
cmd /c npm run build:public
cmd /c npm run check:public-dist
cmd /c npm run check:equivalence:a0
cmd /c npm run build:candidate
cmd /c npm run check:equivalence:candidate
```

提交前还应运行：

```bash
node scripts/check-repository-policy.js
```

开发规范见 [CONVENTIONS.md](CONVENTIONS.md)，仓库文件边界见 [docs/repository-policy.md](docs/repository-policy.md)。

## License

个人网站，保留所有权利。
