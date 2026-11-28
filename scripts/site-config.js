module.exports = Object.freeze({
  siteUrl: 'https://marktian-long.github.io',
  siteName: 'Leo Liu · AI Builder',
  siteDescription: 'Leo Liu — AI 产品与工程实践，写关于 AI 落地的独立观察。',
  author: {
    name: 'Leo Liu'
  },
  blog: {
    title: '思考碎片 — Leo Liu',
    description: 'Leo Liu 关于 AI 技术、产品、商业、行业与实践的长期思考。',
    path: '/tools/blog/',
    feedPath: '/feed.xml',
    imagePath: '/assets/images/og-cover.png',
    imageAlt: 'Leo · AI Builder',
    imageWidth: 1200,
    imageHeight: 630,
    feedLimit: 20
  },
  toolPages: [
    {
      "path": "/tools/agent-hub/",
      "title": "Agent 认知全景 · Leo Liu",
      "description": "用六问规则判断任务是否需要 Agent，并比较架构组合、风险边界、人工介入与失败回退。静态规则工具，不调用模型或生产数据。"
    },
    {
      "path": "/tools/ai-insights/",
      "title": "AI 产品研究档案 · Leo Liu",
      "description": "整理 AI 产品的公开资料与个人判断，按研究视角筛选产品档案，并标注档案日期与待人工事实复核边界。非实时数据。"
    },
    {
      "path": "/tools/asci/",
      "title": "ASCI 科研文献综述工具",
      "description": "通过固定演示数据包体验科研文献综述的节点编排、模拟工具调用、人工决策与安全过程导出；不触发真实论文检索。"
    },
    {
      "path": "/tools/esop-extractor/",
      "title": "ESOP 数据提取器",
      "description": "演示从招股书片段到字段结构化、证据定位、规则校验与人工复核的工作台；默认仅运行版本化合成夹具，不读取 PDF 正文。"
    },
    {
      "path": "/tools/radar/",
      "title": "前沿雷达 · Leo Liu",
      "description": "按研究意图筛选人工整理的 AI 信息源，查看来源覆盖、复核状态与下一步研究路线；页面读取静态清单，不实时监测外链。"
    },
    {
      "path": "/tools/service-agent/",
      "title": "智能客服产品设计沙盘 · AI PM 决策推演",
      "description": "交互式 AI 智能客服产品设计沙盘，比较银行、电商与 FAQ 场景下的产品决策、请求链路和人工介入；Agent 输出与业务数据为预设 Mock。"
    },
    {
      "path": "/tools/stock/",
      "title": "A股 AI 助手",
      "description": "A 股 AI 研究助手原型，展示固定行情快照、证据卡、关键词检索、任务型 Agent 与金融 AI 合规边界；联网行情仅在用户主动切换并提交后尝试请求。"
    },
    {
      "path": "/tools/trends/",
      "title": "热点快照 · AI 信号研判台",
      "description": "把五个平台的 AI 热点信号按来源、时间和行动意图整理为静态历史快照；结构复核不等于逐条事实复核，也不是实时热度。"
    }
  ]
});
