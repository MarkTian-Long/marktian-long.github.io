// ============================================================
// data.js — ASCI 数据层
// 包含：NODE_REGISTRY（节点注册表）、PIPELINE_TEMPLATES（预设模板）
//       MOCK_STEPS（向后兼容）、MOCK_RESULT、PAPER_DATA、S3_ABSTRACTS
// ============================================================

// ---- 节点注册表（15 个节点，5 类）----
var NODE_REGISTRY = {
  'data-source-config': {
    id: 'data-source-config',
    icon: '🗄️',
    name: '数据源配置',
    category: 'config',
    categoryLabel: '配置',
    risk: 'low',
    riskLabel: '低风险',
    deps: [],
    hasFullUI: true,
    tools: ['Source Selector'],
    subs: ['数据库选择', '访问权限配置'],
    logs: [
      { level: 'INFO', text: '加载可用数据源列表...' },
      { level: 'INFO', text: '检测到 6 个数据源，3 个已授权（PubMed/arXiv/Semantic Scholar）' },
      { level: 'INFO', text: '根据研究主题推荐默认数据源组合...' },
      { level: 'INFO', text: '✓ 数据源配置就绪' }
    ],
    result: {
      type: 'datasource',
      sources: [
        { id: 'pubmed', name: 'PubMed', note: '生物医学核心', authorized: true, recommended: true },
        { id: 'arxiv', name: 'arXiv', note: '预印本，CS/物理', authorized: true, recommended: true },
        { id: 'semantic', name: 'Semantic Scholar', note: '跨学科', authorized: true, recommended: true },
        { id: 'ieee', name: 'IEEE Xplore', note: '工程/电子', authorized: false, recommended: false },
        { id: 'acm', name: 'ACM DL', note: '计算机科学', authorized: false, recommended: false },
        { id: 'scopus', name: 'Scopus', note: '综合引文数据库', authorized: false, recommended: false }
      ],
      selected: ['pubmed', 'arxiv', 'semantic'],
      hint: '已授权数据源免费使用，付费数据库需配置机构凭证。'
    }
  },
  'keyword-extract': {
    id: 'keyword-extract',
    icon: '🔑',
    name: '关键词提取',
    category: 'discovery',
    categoryLabel: '发现',
    risk: 'low',
    riskLabel: '低风险',
    deps: [],
    hasFullUI: true,
    tools: ['NLP Parser', 'MeSH API'],
    subs: ['主题词拆解', 'MeSH 术语映射'],
    logs: [
      { level: 'INFO', text: '解析任务描述：Transformer in Drug Discovery' },
      { level: 'INFO', text: '提取核心主题词：Transformer, Drug Discovery, Molecular Property' },
      { level: 'INFO', text: '调用 MeSH API 映射标准术语 (3 terms)' },
      { level: 'INFO', text: '✓ 关键词提取完成，共 8 个检索词' }
    ],
    result: {
      type: 'keywords',
      keywords: [
        { term: 'Transformer', mesh: 'Neural Networks, Computer', editable: true },
        { term: 'Drug Discovery', mesh: 'Drug Discovery', editable: true },
        { term: 'Molecular Property', mesh: 'Molecular Structure', editable: true },
        { term: 'Self-Attention', mesh: null, editable: true },
        { term: 'SMILES', mesh: 'Drug Design', editable: true },
        { term: 'Protein-Ligand', mesh: 'Ligands', editable: true },
        { term: 'Deep Learning', mesh: 'Deep Learning', editable: true },
        { term: 'Binding Affinity', mesh: 'Protein Binding', editable: true }
      ],
      hint: '可删除不相关词，或添加遗漏的领域术语。确认后进入数据库检索。'
    }
  },
  'db-search': {
    id: 'db-search',
    icon: '🔍',
    name: '数据库检索',
    category: 'discovery',
    categoryLabel: '发现',
    risk: 'low',
    riskLabel: '低风险',
    deps: ['keyword-extract'],
    hasFullUI: true,
    tools: ['PubMed API', 'Semantic Scholar', 'Deduplicator'],
    subs: ['PubMed 检索', 'Semantic Scholar 检索', '去重合并'],
    logs: [
      { level: 'INFO', text: '查询 PubMed：Transformer AND Drug Discovery [2018:2024]' },
      { level: 'INFO', text: 'PubMed 返回 142 条记录' },
      { level: 'INFO', text: '查询 Semantic Scholar API (top_k=200)' },
      { level: 'INFO', text: 'Semantic Scholar 返回 198 条记录' },
      { level: 'INFO', text: '去重合并：340 → 276 篇（移除 64 条重复）' },
      { level: 'INFO', text: '✓ 数据库检索完成，候选文献 276 篇' }
    ],
    result: {
      type: 'search',
      query: 'Transformer AND ("Drug Discovery" OR "Molecular Property") [2018:2024]',
      sources: [
        { name: 'PubMed', count: 142, color: '#2563eb' },
        { name: 'Semantic Scholar', count: 198, color: '#7c3aed' },
        { name: '去重后合计', count: 276, color: '#059669' }
      ],
      yearRange: { min: 2018, max: 2024, current: [2018, 2024] },
      preview: [
        { title: 'Attention Is All You Need', year: 2017, key: 'cp1' },
        { title: 'ChemBERTa: Large-Scale Self-Supervised Pretraining for Molecular Property Prediction', year: 2020, key: 'cp2' },
        { title: 'MolBERT: Molecular Property Prediction with BERT', year: 2020, key: null },
        { title: 'Transformer-based DTI Prediction for Drug Discovery', year: 2022, key: null },
        { title: 'REINVENT 2.0: An AI Tool for De Novo Drug Design', year: 2020, key: null }
      ],
      hint: '可调整时间范围后点击"重新检索"，或直接确认当前结果。'
    }
  },
  'citation-chase': {
    id: 'citation-chase',
    icon: '🔗',
    name: '引文追踪',
    category: 'discovery',
    categoryLabel: '发现',
    risk: 'low',
    riskLabel: '低风险',
    deps: ['db-search'],
    hasFullUI: false,
    tools: ['Citation Graph API', 'Backward Chaser'],
    subs: ['正向引文追踪', '反向引文追踪'],
    logs: [
      { level: 'INFO', text: '基于 276 篇候选文献构建引文图谱...' },
      { level: 'INFO', text: '反向追踪（查引用了谁）：新增 34 篇相关文献' },
      { level: 'INFO', text: '正向追踪（被谁引用）：发现 12 篇近期重要引用' },
      { level: 'INFO', text: '合并去重后，新增候选文献 41 篇（总计 317 篇）' },
      { level: 'INFO', text: '✓ 引文追踪完成' }
    ],
    result: {
      type: 'simple',
      icon: '🔗',
      summary: '引文追踪完成',
      details: '通过正向（被引）和反向（引用）追踪，在原有 276 篇基础上新增 41 篇候选文献，总量扩展至 317 篇。追踪深度：2 跳。核心文献（Attention Is All You Need）引用网络中发现 12 篇近期高被引新作。'
    }
  },
  'expand-search': {
    id: 'expand-search',
    icon: '🔭',
    name: '焦点扩展搜索',
    category: 'discovery',
    categoryLabel: '发现',
    risk: 'low',
    riskLabel: '低风险',
    deps: ['abstract-screen'],
    hasFullUI: false,
    tools: ['Topic Expander', 'Semantic Embed'],
    subs: ['相邻主题识别', '扩展检索'],
    logs: [
      { level: 'INFO', text: '分析已纳入文献的主题分布...' },
      { level: 'INFO', text: '识别相邻高价值主题：Graph Transformer、Protein Language Model' },
      { level: 'INFO', text: '扩展检索相邻主题，新增候选 28 篇' },
      { level: 'INFO', text: '✓ 焦点扩展完成，共新增 28 篇候选文献' }
    ],
    result: {
      type: 'simple',
      icon: '🔭',
      summary: '焦点扩展搜索完成',
      details: '基于已纳入的 21 篇文献，系统识别出 2 个高关联相邻主题：Graph Transformer（图神经网络+Transformer 融合）和 Protein Language Model（ESM 系列蛋白质语言模型）。在这两个方向扩展检索，新增 28 篇候选文献，建议优先阅读 ESM-2 相关论文。'
    }
  },
  'abstract-screen': {
    id: 'abstract-screen',
    icon: '📋',
    name: '摘要筛选',
    category: 'filter',
    categoryLabel: '筛选',
    risk: 'medium',
    riskLabel: '中风险',
    checkpoint: true,
    deps: ['db-search'],
    hasFullUI: true,
    tools: ['Relevance Scorer', 'Threshold Filter'],
    subs: ['相关性打分', '阈值过滤', '👤 Human Checkpoint'],
    logs: [
      { level: 'INFO', text: '对 276 篇文献进行相关性评分（模型：SciBERT-ft）' },
      { level: 'INFO', text: '评分完成，阈值 0.72 过滤后剩余 21 篇' },
      { level: 'WARN', text: '3 篇文献置信度处于边界区间 [0.72–0.75]，触发 Human Checkpoint' },
      { level: 'INFO', text: '⏸ 等待人工确认边界文献...' }
    ],
    result: {
      type: 'screening',
      threshold: 0.72,
      included: 18,
      borderline: [
        {
          id: 'cp1', title: 'Attention Is All You Need', authors: 'Vaswani et al.', year: 2017, score: 0.74,
          abstract: '本文提出 Transformer 架构，完全基于注意力机制，摒弃了循环和卷积结构。在机器翻译任务上，模型质量更优，并行性更强，所需训练时间显著减少。该架构已成为现代 NLP 和药物发现 AI 的基础组件，其自注意力机制可高效捕获分子序列中的长程依赖关系。',
          decision: null
        },
        {
          id: 'cp2', title: 'Drug-Target Interaction via Transformer', authors: 'Zhang et al.', year: 2021, score: 0.73,
          abstract: '本文将 Transformer 双编码器架构应用于药物-靶点相互作用（DTI）预测：蛋白质序列编码器 + SMILES 分子编码器，通过交叉注意力融合两路表示。在 BindingDB 和 Davis 数据集上，AUROC 达 0.924，优于 GNN 和 LSTM 基线。',
          decision: null
        },
        {
          id: 'cp3', title: 'Molecular Graph Transformer', authors: 'Liu et al.', year: 2022, score: 0.72,
          abstract: '本文将图神经网络与 Transformer 注意力机制结合，提出 Molecular Graph Transformer（MGT），在分子属性预测任务中引入全局自注意力层以捕获远程原子交互。在 QM9 和 MoleculeNet 基准上，MGT 在多个属性预测任务上超越纯 GNN 方法。',
          decision: null
        }
      ],
      hint: '请对每篇边界文献做出判断后，调整阈值或确认纳入数量。'
    }
  },
  'fulltext-read': {
    id: 'fulltext-read',
    icon: '📖',
    name: '全文精读',
    category: 'filter',
    categoryLabel: '筛选',
    risk: 'high',
    riskLabel: '高风险',
    deps: ['abstract-screen'],
    hasFullUI: true,
    tools: ['PDF Parser', 'Method Extractor', 'Contradiction Detector'],
    subs: ['方法论提取', '关键发现提取', '矛盾检测'],
    logs: [
      { level: 'INFO', text: '下载全文 PDF (21 篇)，解析文档结构' },
      { level: 'WARN', text: '全文覆盖率 67%（14/21 篇为 OA），7 篇降级为摘要+元数据分析' },
      { level: 'INFO', text: '提取方法论章节：21/21 篇' },
      { level: 'INFO', text: '识别关键发现：共 47 条 findings' },
      { level: 'WARN', text: '发现潜在矛盾：Liu et al.(2022) 与 Wang et al.(2023) 在 AUROC 指标上结论相悖' },
      { level: 'INFO', text: '矛盾已标注，等待人工处置...' }
    ],
    result: {
      type: 'contradiction',
      findings: 47,
      findingsList: [
        { text: 'ChemBERTa 在 MoleculeNet BBBP 任务上 AUROC 达 0.947，较 ECFP+RF 提升 8.3%', source: 'Chithrananda et al., 2020' },
        { text: 'MolBERT 在 HIV 抑制剂筛选任务中准确率提升 12.1%，预训练数据规模是关键', source: 'Fabian et al., 2020' },
        { text: 'Transformer DTI 双编码器在 BindingDB AUROC=0.924，显著优于 GNN 基线 0.871', source: 'Liu et al., 2022' },
        { text: 'REINVENT 2.0 在 QED×SA 综合指标排名第一，但 3D 构象预测误差率 >15%', source: 'Blaschke et al., 2020' },
        { text: '多组学 Transformer 在阿尔茨海默症靶点预测 F1=0.89，训练数据需 >50k 样本', source: 'Wang et al., 2023' }
      ],
      contradiction: {
        metric: 'AUROC（BindingDB 数据集）',
        paperA: {
          title: 'Transformer-based DTI Prediction',
          authors: 'Liu et al., 2022',
          journal: 'Bioinformatics (SCI Q1)',
          value: '0.924',
          method: 'Transformer 双编码器 + 交叉注意力'
        },
        paperB: {
          title: 'Multi-omics Integration via Transformer',
          authors: 'Wang et al., 2023',
          journal: 'Nature Methods (SCI Q1)',
          value: '0.864',
          method: 'Transformer 跨模态注意力（多组学）'
        },
        options: [
          { id: 'A', label: '采信 Liu 2022', reason: '同类任务基准更匹配' },
          { id: 'B', label: '采信 Wang 2023', reason: '更新、期刊更高' },
          { id: 'both', label: '两篇均纳入并标注争议', reason: '保留学术争议' },
          { id: 'exclude', label: '排除两篇，仅用其他文献', reason: '矛盾无法调和' }
        ],
        decision: null
      },
      hint: '此为高风险步骤，矛盾文献必须人工处置后才能继续。'
    }
  },
  'quality-assess': {
    id: 'quality-assess',
    icon: '🏅',
    name: '方法学质量评估',
    category: 'filter',
    categoryLabel: '筛选',
    risk: 'medium',
    riskLabel: '中风险',
    deps: ['fulltext-read'],
    hasFullUI: false,
    tools: ['GRADE Scorer', 'Bias Detector'],
    subs: ['GRADE 评级', '偏倚风险评估'],
    logs: [
      { level: 'INFO', text: '对 21 篇全文精读结果进行 GRADE 方法学评估...' },
      { level: 'INFO', text: '评估维度：样本量、随机性、盲法、结局报告完整性' },
      { level: 'WARN', text: '3 篇文献存在数据集重叠风险（相同 BindingDB 测试集）' },
      { level: 'INFO', text: '✓ 质量评估完成：高质量 8 篇 / 中等 11 篇 / 低质量 2 篇' }
    ],
    result: {
      type: 'simple',
      icon: '🏅',
      summary: '方法学质量评估完成',
      details: '基于 GRADE 框架对 21 篇文献进行质量评估。高质量（证据等级 A）：8 篇，均有充足样本量且独立测试集验证；中等质量（B）：11 篇，存在数据集重叠或样本量不足；低质量（C）：2 篇，缺乏对照实验。建议在综述中明确标注各文献证据等级。'
    }
  },
  'contradiction-detect': {
    id: 'contradiction-detect',
    icon: '⚡',
    name: '矛盾检测',
    category: 'analysis',
    categoryLabel: '分析',
    risk: 'high',
    riskLabel: '高风险',
    deps: ['fulltext-read'],
    hasFullUI: true,
    tools: ['Claim Extractor', 'Conflict Resolver'],
    subs: ['主张提取', '跨文献对比', '👤 Human Checkpoint'],
    logs: [
      { level: 'INFO', text: '提取各文献核心主张（指标 / 结论）...' },
      { level: 'INFO', text: '共提取 147 条可验证主张' },
      { level: 'WARN', text: '发现 2 处潜在矛盾：AUROC 差值 >0.05' },
      { level: 'INFO', text: '⏸ 等待人工处置矛盾...' }
    ],
    result: {
      type: 'contradiction',
      findings: 47,
      findingsList: [
        { text: 'ChemBERTa 在 MoleculeNet BBBP 任务上 AUROC 达 0.947', source: 'Chithrananda et al., 2020' },
        { text: 'Transformer DTI 在 BindingDB AUROC=0.924', source: 'Liu et al., 2022' }
      ],
      contradiction: {
        metric: 'AUROC（BindingDB 数据集）',
        paperA: {
          title: 'Transformer-based DTI Prediction',
          authors: 'Liu et al., 2022',
          journal: 'Bioinformatics (SCI Q1)',
          value: '0.924',
          method: 'Transformer 双编码器 + 交叉注意力'
        },
        paperB: {
          title: 'Multi-omics Integration via Transformer',
          authors: 'Wang et al., 2023',
          journal: 'Nature Methods (SCI Q1)',
          value: '0.864',
          method: 'Transformer 跨模态注意力（多组学）'
        },
        options: [
          { id: 'A', label: '采信 Liu 2022', reason: '同类任务基准更匹配' },
          { id: 'B', label: '采信 Wang 2023', reason: '更新、期刊更高' },
          { id: 'both', label: '两篇均纳入并标注争议', reason: '保留学术争议' },
          { id: 'exclude', label: '排除两篇，仅用其他文献', reason: '矛盾无法调和' }
        ],
        decision: null
      },
      hint: '高风险节点：矛盾文献必须人工处置后才能继续。'
    }
  },
  'theme-cluster': {
    id: 'theme-cluster',
    icon: '🗂️',
    name: '主题聚类',
    category: 'analysis',
    categoryLabel: '分析',
    risk: 'low',
    riskLabel: '低风险',
    deps: ['abstract-screen'],
    hasFullUI: false,
    tools: ['BERTopic', 'Cluster Viz'],
    subs: ['主题建模', '聚类可视化'],
    logs: [
      { level: 'INFO', text: '对 21 篇纳入文献进行主题建模（BERTopic）...' },
      { level: 'INFO', text: '识别 4 个主要主题聚类' },
      { level: 'INFO', text: '✓ 主题聚类完成：分子属性预测 / DTI / 从头生成 / 多组学' }
    ],
    result: {
      type: 'simple',
      icon: '🗂️',
      summary: '主题聚类完成',
      details: '基于 BERTopic 对 21 篇文献摘要进行主题建模，识别 4 个高内聚主题：① 分子属性预测（8 篇，核心：ChemBERTa/MolBERT 预训练范式）② 药物-靶点相互作用（5 篇，核心：双编码器架构）③ 从头分子生成（5 篇，核心：REINVENT 变体）④ 多组学整合（3 篇，核心：跨模态注意力）。主题分布清晰，适合按聚类组织综述章节。'
    }
  },
  'meta-analysis': {
    id: 'meta-analysis',
    icon: '📊',
    name: '效应量汇总',
    category: 'analysis',
    categoryLabel: '分析',
    risk: 'medium',
    riskLabel: '中风险',
    deps: ['fulltext-read'],
    hasFullUI: false,
    tools: ['Effect Size Calc', 'Forest Plot'],
    subs: ['效应量提取', '森林图生成'],
    logs: [
      { level: 'INFO', text: '提取各文献在标准基准上的效应量（AUROC/F1/RMSE）...' },
      { level: 'INFO', text: '异质性检验：I² = 0.42（中等异质性）' },
      { level: 'WARN', text: '数据集差异（BindingDB vs CHEMBL）导致效应量不可直接合并' },
      { level: 'INFO', text: '✓ 效应量汇总完成，生成分层森林图' }
    ],
    result: {
      type: 'simple',
      icon: '📊',
      summary: '效应量汇总完成',
      details: '在可合并的同质数据集（MoleculeNet BBBP 任务，N=8 研究）中，Transformer 模型相对传统指纹方法的平均 AUROC 提升量为 +0.073（95% CI: 0.051–0.095），效应量中等偏大。异质性 I²=0.42，建议在不同数据集上分层报告结果，避免过度合并。'
    }
  },
  'outline-gen': {
    id: 'outline-gen',
    icon: '📝',
    name: '综述大纲',
    category: 'output',
    categoryLabel: '输出',
    risk: 'low',
    riskLabel: '低风险',
    deps: ['abstract-screen'],
    hasFullUI: true,
    tools: ['Outline Generator'],
    subs: ['生成大纲', '结构优化'],
    logs: [
      { level: 'INFO', text: '基于 21 篇纳入文献生成综述大纲...' },
      { level: 'INFO', text: '结构优化：按主题聚类组织章节顺序' },
      { level: 'INFO', text: '✓ 综述大纲生成完成（5 节）' }
    ],
    result: {
      type: 'outline',
      sections: [
        { id: 1, title: '引言：Transformer 架构概述', points: '自注意力机制原理；从 NLP 到生物医学的迁移路径', editable: true },
        { id: 2, title: '分子属性预测应用', points: 'ChemBERTa / MolBERT 预训练范式；MoleculeNet 基准对比', editable: true },
        { id: 3, title: '药物-靶点相互作用识别', points: '双编码器架构；BindingDB / Davis 数据集结果', editable: true },
        { id: 4, title: '从头分子生成', points: 'REINVENT 变体；QED × SA 综合指标；3D 构象局限性', editable: true },
        { id: 5, title: '局限性与未来方向', points: '可解释性不足；标注数据稀缺；多模态整合趋势', editable: true }
      ],
      hint: '可编辑节标题或调整论点描述，确认大纲后生成正文。'
    }
  },
  'review-write': {
    id: 'review-write',
    icon: '✍️',
    name: '综述撰写',
    category: 'output',
    categoryLabel: '输出',
    risk: 'medium',
    riskLabel: '中风险',
    deps: ['outline-gen'],
    hasFullUI: true,
    tools: ['Outline Generator', 'Para Writer', 'Citation Inserter'],
    subs: ['生成大纲', '段落撰写', '引用插入'],
    logs: [
      { level: 'INFO', text: '启动综述报告生成模块...' },
      { level: 'INFO', text: '加载全文精读结果与矛盾处置记录...' },
      { level: 'ERROR', text: '[ERROR-1] 报告结构生成失败：上下文窗口溢出，内容截断', _trigger: 'error1' },
      { level: 'WARN', text: '[重试 1/3] 扩大上下文窗口至 128K，重新生成...' },
      { level: 'ERROR', text: '[ERROR-2] 输出结构异常：章节编号错位，与已有文献结论矛盾', _trigger: 'error2' },
      { level: 'WARN', text: '[重试 2/3] 切换备用模型（降低温度至 0.2）...' },
      { level: 'ERROR', text: '[ERROR-3] 置信度极低（23%）：生成内容与矛盾处置结果不一致', _trigger: 'error3' },
      { level: 'INFO', text: '根据 47 条 findings 生成综述大纲（5 节）' },
      { level: 'INFO', text: '撰写各段落，自动插入 APA 引用格式' },
      { level: 'INFO', text: '引用文献 21 篇，精选核心 6 篇进入摘要层' },
      { level: 'INFO', text: '✓ 综述生成完成，总字数约 2400 字' }
    ],
    result: {
      type: 'outline',
      sections: [
        { id: 1, title: '引言：Transformer 架构概述', points: '自注意力机制原理；从 NLP 到生物医学的迁移路径', editable: true },
        { id: 2, title: '分子属性预测应用', points: 'ChemBERTa / MolBERT 预训练范式；MoleculeNet 基准对比', editable: true },
        { id: 3, title: '药物-靶点相互作用识别', points: '双编码器架构；BindingDB / Davis 数据集结果', editable: true },
        { id: 4, title: '从头分子生成', points: 'REINVENT 变体；QED × SA 综合指标；3D 构象局限性', editable: true },
        { id: 5, title: '局限性与未来方向', points: '可解释性不足；标注数据稀缺；多模态整合趋势', editable: true }
      ],
      hint: '可编辑节标题或调整论点描述，确认大纲后生成正文。'
    }
  },
  'bibtex-export': {
    id: 'bibtex-export',
    icon: '📚',
    name: '参考文献导出',
    category: 'output',
    categoryLabel: '输出',
    risk: 'low',
    riskLabel: '低风险',
    deps: ['db-search'],
    hasFullUI: false,
    tools: ['BibTeX Formatter', 'DOI Resolver'],
    subs: ['格式转换', 'DOI 验证'],
    logs: [
      { level: 'INFO', text: '从检索结果生成 BibTeX 格式...' },
      { level: 'INFO', text: '共处理 276 条文献，DOI 验证通过 271 条' },
      { level: 'WARN', text: '5 条文献 DOI 无效，已标注需手动核实' },
      { level: 'INFO', text: '✓ 参考文献导出完成（BibTeX / APA / GB/T 7714 三种格式）' }
    ],
    result: {
      type: 'simple',
      icon: '📚',
      summary: '参考文献导出完成',
      details: '276 条检索文献已格式化为 BibTeX 标准格式。DOI 验证：271 条有效，5 条无效（需手动核实）。同时提供 APA 7th 和 GB/T 7714 两种格式。文件大小约 48KB，可直接导入 Zotero / EndNote / Mendeley。'
    }
  }
};

// ---- 预设模板 ----
var PIPELINE_TEMPLATES = {
  quick: {
    id: 'quick',
    name: '快速综述',
    desc: '5 步标准流程',
    nodes: ['keyword-extract', 'db-search', 'abstract-screen', 'outline-gen', 'review-write']
  },
  deep: {
    id: 'deep',
    name: '深度分析',
    desc: '含全文精读 + 质量评估',
    nodes: ['data-source-config', 'keyword-extract', 'db-search', 'abstract-screen', 'fulltext-read', 'quality-assess', 'contradiction-detect', 'outline-gen', 'review-write']
  },
  map: {
    id: 'map',
    name: '文献地图',
    desc: '含引文追踪 + 主题聚类',
    nodes: ['keyword-extract', 'db-search', 'citation-chase', 'abstract-screen', 'theme-cluster', 'bibtex-export', 'outline-gen']
  }
};

// ---- 节点置信度配置 ----
var CONF_BY_NODE = {
  'data-source-config': 96,
  'keyword-extract': 95,
  'db-search': 88,
  'citation-chase': 90,
  'expand-search': 87,
  'abstract-screen': 82,
  'fulltext-read': 75,
  'quality-assess': 78,
  'contradiction-detect': 72,
  'theme-cluster': 85,
  'meta-analysis': 76,
  'outline-gen': 80,
  'review-write': 78,
  'bibtex-export': 92
};

// ---- 节点摘要函数 ----
var NODE_SUMMARIES = {
  'data-source-config': function () { return '3 个数据源已配置'; },
  'keyword-extract': function () { return '8 个检索词'; },
  'db-search': function () { return '276 篇候选'; },
  'citation-chase': function () { return '+41 篇（引文追踪）'; },
  'expand-search': function () { return '+28 篇（焦点扩展）'; },
  'abstract-screen': function (ud) {
    var inc = 18, hold = 0, exc = 0;
    if (ud && ud.borderline) {
      ud.borderline.forEach(function (p) {
        if (p.decision === 'include') inc++;
        else if (p.decision === 'maybe') hold++;
        else if (p.decision === 'exclude') exc++;
      });
    }
    return inc + ' 篇纳入' + (hold > 0 ? ' · ' + hold + ' 篇待定' : '');
  },
  'fulltext-read': function () { return '47 条 Findings · 1 处矛盾'; },
  'quality-assess': function () { return '8 篇 A 级 / 11 篇 B 级'; },
  'contradiction-detect': function () { return '2 处矛盾已处置'; },
  'theme-cluster': function () { return '4 个主题聚类'; },
  'meta-analysis': function () { return 'AUROC 提升 +0.073'; },
  'outline-gen': function () { return '5 节大纲'; },
  'review-write': function () { return '2400 字综述'; },
  'bibtex-export': function () { return '276 条文献导出'; }
};

// ---- Mock 最终结果 ----
var MOCK_RESULT = {
  title: 'Transformer 架构在药物发现中的应用综述',
  abstract: 'Transformer 架构自 2017 年提出以来，凭借其自注意力机制在自然语言处理领域取得突破性进展，并迅速渗透至生物医学与药物发现领域。本综述系统梳理了 2018–2024 年间 Transformer 在分子属性预测、药物-靶点相互作用识别、从头分子生成及多组学数据整合四个核心场景中的应用进展，汇总分析 21 篇高质量文献，重点探讨模型架构演化路径、基准数据集选取策略及临床转化瓶颈。研究表明，预训练-微调范式已成为药物发现 AI 的主流方法，但可解释性不足与标注数据稀缺仍是限制规模化落地的关键障碍。',
  findings: [
    '预训练 Transformer（如 ChemBERTa、MolBERT）在分子属性预测任务上平均 AUROC 提升 8.3%，优于传统 ECFP 指纹方法。',
    '药物-靶点相互作用（DTI）任务中，Transformer 双编码器架构在 BindingDB 数据集 AUROC 达 0.924，显著优于图神经网络基线。',
    '从头分子生成领域，基于 Transformer 的 REINVENT 变体在 QED × SA 综合指标上表现最优，但 3D 构象生成准确性仍有较大提升空间。'
  ],
  sources: [
    { title: 'Attention Is All You Need', authors: 'Vaswani et al.', year: 2017, journal: 'NeurIPS', score: 9.2, doi: 'https://doi.org/10.48550/arXiv.1706.03762' },
    { title: 'ChemBERTa: Large-Scale Self-Supervised Pretraining', authors: 'Chithrananda et al.', year: 2020, journal: 'arXiv / Nature MI', score: 8.8, doi: 'https://doi.org/10.48550/arXiv.2010.09885' },
    { title: 'MolBERT: Molecular Property Prediction', authors: 'Fabian et al.', year: 2020, journal: 'ICLR workshop', score: 8.5, doi: 'https://doi.org/10.48550/arXiv.2011.13230' },
    { title: 'Transformer-based DTI Prediction', authors: 'Liu et al.', year: 2022, journal: 'Bioinformatics (SCI Q1)', score: 8.3, doi: 'https://doi.org/10.1093/bioinformatics/btab500' },
    { title: 'REINVENT 2.0 with Transformer Prior', authors: 'Blaschke et al.', year: 2020, journal: 'J. Chem. Inf. Model. (SCI Q1)', score: 7.9, doi: 'https://doi.org/10.26434/chemrxiv.12058026' },
    { title: 'Multi-omics Integration via Transformer', authors: 'Wang et al.', year: 2023, journal: 'Nature Methods (SCI Q1)', score: 7.6, doi: 'https://doi.org/10.1038/s41592-023-01970-4' }
  ],
  credibility: {
    sourceQuality: { score: 8.5, note: '87% 文献来自 SCI Q1 期刊，核心论文高被引（>500 次）' },
    reasoning: { score: 7.8, note: '推理链路清晰，结论均有文献支撑，逻辑一致' },
    consistency: { score: 7.2, note: 'Liu(2022) 与 Wang(2023) AUROC 指标存在 0.06 差异，已标注' },
    overall: 7.8,
    suggestion: '综合评分 7.8/10。建议对全文精读步骤中检测到的矛盾标注（Liu vs Wang AUROC）进行人工复核后再提交。'
  }
};

// ---- 论文弹窗数据 ----
var PAPER_DATA = {
  'cp1': {
    title: 'Attention Is All You Need',
    meta: 'Vaswani et al. · NeurIPS 2017',
    score: '相关性评分 0.74',
    abstract: '本文提出 <strong>Transformer</strong> 架构，完全基于注意力机制，摒弃了循环和卷积结构。在机器翻译任务上，模型质量更优，并行性更强，所需训练时间显著减少。该架构已成为现代 NLP 和药物发现 AI 的基础组件，其自注意力机制可高效捕获分子序列中的长程依赖关系。',
    doi: 'https://doi.org/10.48550/arXiv.1706.03762'
  },
  'cp2': {
    title: 'Drug-Target Interaction Prediction via Transformer',
    meta: 'Zhang et al. · Bioinformatics 2021',
    score: '相关性评分 0.73',
    abstract: '本文将 <strong>Transformer 双编码器</strong>架构应用于药物-靶点相互作用（DTI）预测：蛋白质序列编码器 + SMILES 分子编码器，通过交叉注意力融合两路表示。在 BindingDB 和 Davis 数据集上，AUROC 达 0.924，优于 GNN 和 LSTM 基线，展示了 Transformer 在结构生物学场景的迁移能力。',
    doi: 'https://doi.org/10.1093/bioinformatics/btab500'
  },
  'cp3': {
    title: 'Molecular Graph Transformer for Property Prediction',
    meta: 'Liu et al. · ICLR Workshop 2022',
    score: '相关性评分 0.72',
    abstract: '本文将图神经网络与 <strong>Transformer 注意力机制</strong>结合，提出 Molecular Graph Transformer（MGT），在分子属性预测任务中引入全局自注意力层以捕获远程原子交互。在 QM9 和 MoleculeNet 基准上，MGT 在多个属性预测任务上超越纯 GNN 方法，但在 3D 构象预测精度上仍有提升空间。',
    doi: 'https://doi.org/10.48550/arXiv.2202.09501'
  }
};

// ---- Screen 3 摘要文本 ----
var S3_ABSTRACTS = [
  'Transformer 架构的奠基性工作，提出多头自注意力机制，首次证明无需循环结构即可达到 SOTA 翻译质量。被引次数超过 10 万次，是 LLM 时代最重要的基础论文之一。',
  '基于 Transformer 的分子预训练模型 ChemBERTa，在 SMILES 字符串上进行自监督预训练，通过 fine-tuning 完成下游分子属性预测任务，在多个 MoleculeNet 基准上优于传统 ECFP 指纹方法。',
  'MolBERT 将 BERT 预训练范式迁移至分子表示学习，通过掩码原子预测和分子属性对齐两个预训练目标，习得高质量分子嵌入，适配 ADMET 属性预测等下游任务。',
  '将 Transformer 双编码器架构应用于 DTI 预测，通过交叉注意力融合蛋白质序列与 SMILES 表示，在 BindingDB 数据集 AUROC 达 0.924。（注：与 Wang 2023 在 AUROC 指标上存在 0.06 差异，已标注待复核）',
  'REINVENT 2.0 引入 Transformer 先验网络替代原 RNN，通过强化学习引导分子生成朝目标分子属性优化，在 QED × SA 综合指标上表现最优，但 3D 构象预测精度仍有提升空间。',
  '将多组学数据（基因组、转录组、蛋白质组）通过 Transformer 跨模态注意力机制进行整合，在细胞类型识别和疾病关联分析任务中显著优于单组学方法。'
];
