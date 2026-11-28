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
  ],
  publicProjects: [
    {
      "name": "AI 工作流工具包（Kit）",
      "url": "https://github.com/MarkTian-Long/ai-workflow-kit",
      "description": "按任务取用 Skill、SOP、模板和小工具；不必安装整套 Harness。",
      "featured": true
    },
    {
      "name": "多平台资料库",
      "url": "https://github.com/MarkTian-Long/multi-platform-content-library",
      "description": "Windows 本地资料收集应用：保存主动提交的链接和选定本地文件，支持离线阅读、搜索、校订和导出。",
      "featured": true
    },
    {
      "name": "LocalFolderBridge｜本机文件桥",
      "url": "https://github.com/MarkTian-Long/local-folder-bridge",
      "description": "通过 MCP 连接 AI 与明确授权的本地资料；默认只读，不提供远程 shell。",
      "featured": true
    },
    {
      "name": "Harness Starter",
      "url": "https://github.com/MarkTian-Long/harness-starter",
      "description": "本地文件式 AI 协作套件，提供通用方法、任务模板、验证和续接入口；不包含个人画像或项目资料。",
      "featured": true
    },
    {
      "name": "AI Daily Radar",
      "url": "https://github.com/MarkTian-Long/ai-daily-radar",
      "description": "可交给联网 AI 使用的每日 AI 情报双源工作流，强调来源完整性、事件去重和证据边界。",
      "featured": false
    },
    {
      "name": "Codex Work Watch",
      "url": "https://github.com/MarkTian-Long/codex-work-watch",
      "description": "监测 Codex 与 ChatGPT Work 可用性、路由、额度和容量变化的证据驱动工作流。",
      "featured": false
    },
    {
      "name": "AI Usage Dashboard",
      "url": "https://github.com/MarkTian-Long/ai-usage-dashboard",
      "description": "Windows 本地只读分析 Codex 日志的个人使用看板；真实日志和本机配置留在本地。",
      "featured": false
    },
    {
      "name": "FolderLens",
      "url": "https://github.com/MarkTian-Long/folder-lens",
      "description": "单文件离线文件夹容量与目录层级分析工具；只读取名称和元数据，不上传文件正文。",
      "featured": false
    }
  ],
  publicProjects: [
    {
      "name": "AI 工作流工具包（Kit）",
      "url": "https://github.com/MarkTian-Long/ai-workflow-kit",
      "description": "按任务取用 Skill、SOP、模板和小工具；不必安装整套 Harness。",
      "featured": true
    },
    {
      "name": "多平台资料库",
      "url": "https://github.com/MarkTian-Long/multi-platform-content-library",
      "description": "Windows 本地资料收集应用：保存主动提交的链接和选定本地文件，支持离线阅读、搜索、校订和导出。",
      "featured": true
    },
    {
      "name": "LocalFolderBridge｜本机文件桥",
      "url": "https://github.com/MarkTian-Long/local-folder-bridge",
      "description": "通过 MCP 连接 AI 与明确授权的本地资料；默认只读，不提供远程 shell。",
      "featured": true
    },
    {
      "name": "Harness Starter",
      "url": "https://github.com/MarkTian-Long/harness-starter",
      "description": "本地文件式 AI 协作套件，提供通用方法、任务模板、验证和续接入口；不包含个人画像或项目资料。",
      "featured": true
    },
    {
      "name": "AI Daily Radar",
      "url": "https://github.com/MarkTian-Long/ai-daily-radar",
      "description": "可交给联网 AI 使用的每日 AI 情报双源工作流，强调来源完整性、事件去重和证据边界。",
      "featured": false
    },
    {
      "name": "Codex Work Watch",
      "url": "https://github.com/MarkTian-Long/codex-work-watch",
      "description": "监测 Codex 与 ChatGPT Work 可用性、路由、额度和容量变化的证据驱动工作流。",
      "featured": false
    },
    {
      "name": "AI Usage Dashboard",
      "url": "https://github.com/MarkTian-Long/ai-usage-dashboard",
      "description": "Windows 本地只读分析 Codex 日志的个人使用看板；真实日志和本机配置留在本地。",
      "featured": false
    },
    {
      "name": "FolderLens",
      "url": "https://github.com/MarkTian-Long/folder-lens",
      "description": "单文件离线文件夹容量与目录层级分析工具；只读取名称和元数据，不上传文件正文。",
      "featured": false
    }
  ]
});
