// ============================================================
// data.js — ASCI 数据层
// 包含：演示边界、研究协议、NODE_REGISTRY（节点注册表）、PIPELINE_TEMPLATES（预设模板）
//       MOCK_STEPS（向后兼容）、MOCK_RESULT、PAPER_DATA、S3_ABSTRACTS
// ============================================================

// ---- 深化演示契约：固定数据包，不接入真实论文检索 ----
var FIXED_DATA_PACKAGE = {
  id: 'asci-transformer-drug-discovery-v1',
  version: 'v1',
  label: '固定演示数据包',
  topic: 'Transformer in Drug Discovery',
  scope: '内置节点日志、论文摘要示例、结构化结果和预设失败路径',
  mode: 'mock-only',
  realRetrieval: false,
  inputBehavior: '主题输入仅用于任务标题；不会改变数据包内容，也不会触发真实论文检索。',
  exclusions: ['真实数据库请求', '真实全文下载', '真实科研正确率评估', '生产凭证']
};

var DEMO_META = {
  version: 'asci-depth-v1',
  mode: 'fixed-demo-packet',
  realRetrieval: false,
  dataPackageId: FIXED_DATA_PACKAGE.id,
  defaultTopic: FIXED_DATA_PACKAGE.topic,
  defaultProtocolId: 'transformer-drug-discovery-v1',
  confidenceMetric: {
    label: '模拟流程指标',
    meaning: '用于展示演示节点的过程状态与人工决策影响',
    notClaims: ['论文真实性', '综述正确率', '真实检索召回率']
  },
  boundary: FIXED_DATA_PACKAGE.inputBehavior
};

var DEFAULT_RESEARCH_PROTOCOL_ID = DEMO_META.defaultProtocolId;

var RESEARCH_PROTOCOLS = {
  'transformer-drug-discovery-v1': {
    id: 'transformer-drug-discovery-v1',
    name: 'Transformer in Drug Discovery · 预设研究协议',
    question: '在 2018–2024 年公开研究中，Transformer 如何用于分子属性预测、药物-靶点相互作用、分子生成与多组学整合？',
    years: [2018, 2024],
    sources: ['PubMed 示例索引', 'Semantic Scholar 示例索引', '内置论文摘要样本'],
    inclusionRules: [
      '研究对象涉及 Transformer 或其注意力变体',
      '报告药物发现相关任务、方法或基准结果',
      '能够从固定演示数据包中获得结构化摘要或元数据'
    ],
    exclusionRules: [
      '与药物发现任务无直接关系的泛化论文',
      '固定数据包中没有可用摘要或方法信息的条目',
      '重复条目或无法在演示范围内进行一致比较的结果'
    ],
    deliverables: ['结构化综述摘要', '关键发现与争议处置记录', '可复现过程清单与安全导出'],
    dataPackageId: FIXED_DATA_PACKAGE.id,
    mode: 'fixed-demo-packet'
  }
};

var SIMULATED_PROCESS_METRICS = {
  label: '模拟流程指标',
  note: '用于展示固定演示数据包中的流程覆盖、人工闭环与状态变化；不代表论文真实性或综述正确率。',
  items: [
    {
      id: 'node-coverage',
      name: '节点覆盖',
      score: 8.5,
      note: '反映已完成演示节点的过程覆盖，不代表检索召回率。'
    },
    {
      id: 'hitl-closure',
      name: '人工闭环',
      score: 7.8,
      note: '反映关键人工处置是否留下过程记录。'
    },
    {
      id: 'process-consistency',
      name: '过程一致性',
      score: 7.2,
      note: '反映固定数据包内状态与审计记录的结构一致性。'
    }
  ]
};

// ---- 节点注册表（14 个节点，5 类）----
var NODE_REGISTRY = {
  'data-source-config': {
    id: 'data-source-config',
    icon: '🗄️',
    name: '数据源配置',
    desc: '展示固定演示数据包中的来源映射与权限边界，不发起数据库请求',
    required: true,
    category: 'config',
    categoryLabel: '配置',
    risk: 'low',
    riskLabel: '低风险',
    deps: [],
    hasFullUI: true,
    tools: ['Mock Source Selector'],
    subs: ['数据库选择', '访问权限配置'],
    logs: [
      { level: 'INFO', text: '加载固定演示数据包中的来源映射...' },
      { level: 'INFO', text: '展示 6 个示例来源，3 个标记为可用（PubMed/arXiv/Semantic Scholar）' },
      { level: 'INFO', text: '根据预设研究协议展示默认来源组合...' },
      { level: 'INFO', text: '✓ 来源配置就绪（未发起外部请求）' }
    ],
    result: {
      type: 'datasource',
      sources: [
        { id: 'pubmed', name: 'PubMed 示例索引', note: '固定包·生物医学示例', authorized: true, recommended: true },
        { id: 'arxiv', name: 'arXiv 示例索引', note: '固定包·预印本示例', authorized: true, recommended: true },
        { id: 'semantic', name: 'Semantic Scholar 示例索引', note: '固定包·跨学科示例', authorized: true, recommended: true },
        { id: 'ieee', name: 'IEEE Xplore（示例）', note: '工程/电子', authorized: false, recommended: false },
        { id: 'acm', name: 'ACM DL（示例）', note: '计算机科学', authorized: false, recommended: false },
        { id: 'scopus', name: 'Scopus（示例）', note: '综合引文数据库', authorized: false, recommended: false }
      ],
      selected: ['pubmed', 'arxiv', 'semantic'],
      hint: '当前为固定演示包；权限字段仅用于展示流程，不保存或调用机构凭证。'
    }
  },
  'keyword-extract': {
    id: 'keyword-extract',
    icon: '🔑',
    name: '关键词提取',
    desc: '从预设主题提取核心词，映射内置术语示例，生成检索策略',
    required: true,
    retryable: true,
    category: 'discovery',
    categoryLabel: '发现',
    risk: 'low',
    riskLabel: '低风险',
    deps: [],
    hasFullUI: true,
    tools: ['Mock NLP Parser', '预设术语映射'],
    subs: ['主题词拆解', 'MeSH 术语映射'],
    logs: [
      { level: 'INFO', text: '解析固定演示主题：Transformer in Drug Discovery' },
      { level: 'INFO', text: '从数据包映射核心主题词：Transformer, Drug Discovery, Molecular Property' },
      { level: 'INFO', text: '使用内置术语映射示例（3 terms）' },
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
      hint: '可删除不相关词，或添加遗漏的领域术语。确认后进入固定数据包检索演示。'
    }
  },
  'db-search': {
    id: 'db-search',
    icon: '🔍',
    name: '数据库检索',
    desc: '在固定演示数据包的示例索引中模拟关键词检索，返回候选示例记录列表',
    required: true,
    retryable: true,
    category: 'discovery',
    categoryLabel: '发现',
    risk: 'low',
    riskLabel: '低风险',
    deps: ['keyword-extract'],
    hasFullUI: true,
    tools: ['Mock PubMed Index', 'Mock Semantic Index', 'Deduplicator'],
    subs: ['PubMed 示例检索', 'Semantic Scholar 示例检索', '去重合并'],
    logs: [
      { level: 'INFO', text: '模拟查询固定包中的 PubMed 示例索引：Transformer AND Drug Discovery [2018:2024]' },
      { level: 'INFO', text: '固定包返回 142 条示例记录' },
      { level: 'INFO', text: '模拟查询固定包中的 Semantic Scholar 示例索引（top_k=200）' },
      { level: 'INFO', text: '固定包返回 198 条示例记录' },
      { level: 'INFO', text: '去重合并：340 → 276 条示例记录（移除 64 条重复）' },
      { level: 'INFO', text: '✓ 固定数据包检索演示完成，候选示例记录 276 条' }
    ],
    result: {
      type: 'search',
      query: 'Transformer AND ("Drug Discovery" OR "Molecular Property") [2018:2024]',
      sources: [
        { name: 'PubMed 示例', count: 142, color: '#2563eb' },
        { name: 'Semantic Scholar 示例', count: 198, color: '#7c3aed' },
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
      hint: '可调整时间范围后在固定数据包内重算，或直接确认当前结果。'
    }
  },
  'citation-chase': {
    id: 'citation-chase',
    icon: '🔗',
    name: '引文追踪',
    desc: '在固定演示数据包中模拟正向/反向引文链接，展示候选扩展',
    demoUnavailable: true,
    category: 'discovery',
    categoryLabel: '发现',
    risk: 'low',
    riskLabel: '低风险',
    deps: ['db-search'],
    hasFullUI: false,
    tools: ['Mock Citation Graph', 'Backward Chaser'],
    subs: ['正向引文追踪', '反向引文追踪'],
    logs: [
      { level: 'INFO', text: '基于固定包中的 276 条示例记录构建引文图谱...' },
      { level: 'INFO', text: '反向追踪（查引用了谁）：新增 34 条相关示例记录' },
      { level: 'INFO', text: '正向追踪（被谁引用）：发现 12 条近期引用示例' },
      { level: 'INFO', text: '合并去重后，新增候选示例记录 41 条（总计 317 条）' },
      { level: 'INFO', text: '✓ 引文追踪演示完成（未请求外部引文服务）' }
    ],
    result: {
      type: 'citation',
      summary: '引文追踪完成',
      details: '通过正向（被引）和反向（引用）追踪，在原有 276 条示例记录基础上新增 41 条候选示例，总量扩展至 317 条。追踪深度：2 跳。核心示例（Attention Is All You Need）引用网络中发现 12 条近期引用示例。',
      newPapers: [
        { title: 'BERT: Pre-training of Deep Bidirectional Transformers', authors: 'Devlin et al.', year: 2019, chaseType: 'backward' },
        { title: 'Graph Neural Networks: A Review of Methods', authors: 'Zhou et al.', year: 2020, chaseType: 'backward' },
        { title: 'AlphaFold2: Protein Structure Prediction', authors: 'Jumper et al.', year: 2021, chaseType: 'forward' },
        { title: 'ESM-2: Language Models of Protein Sequences', authors: 'Lin et al.', year: 2022, chaseType: 'forward' },
        { title: 'Uni-Mol: A Universal 3D Molecular Representation', authors: 'Zhou et al.', year: 2023, chaseType: 'forward' },
        { title: 'MolT5: Translation between SMILES and Natural Language', authors: 'Edwards et al.', year: 2022, chaseType: 'forward' },
        { title: 'Drug Discovery with Generative Deep Learning', authors: 'Schneider et al.', year: 2020, chaseType: 'backward' },
        { title: 'Molecular Fingerprints and Pharmacophores', authors: 'Cereto-Massagué et al.', year: 2015, chaseType: 'backward' }
      ],
      bibtexMock: '@article{devlin2019bert,...}\n@article{zhou2020gnn,...}\n...(共 41 条示例 BibTeX)'
    }
  },
  'expand-search': {
    id: 'expand-search',
    icon: '🔭',
    name: '焦点扩展搜索',
    desc: '基于固定包中的已纳入示例识别相邻主题，展示扩展搜索路径',
    demoUnavailable: true,
    category: 'screening',
    categoryLabel: '筛选',
    risk: 'low',
    riskLabel: '低风险',
    deps: ['abstract-screen'],
    hasFullUI: false,
    tools: ['Mock Topic Expander', 'Semantic Embed'],
    subs: ['相邻主题识别', '扩展检索'],
    logs: [
      { level: 'INFO', text: '分析已纳入文献的主题分布...' },
      { level: 'INFO', text: '识别相邻高价值主题：Graph Transformer、Protein Language Model' },
      { level: 'INFO', text: '在固定包中模拟扩展相邻主题，新增候选示例 28 条' },
      { level: 'INFO', text: '✓ 焦点扩展演示完成，共新增 28 条候选示例' }
    ],
    result: {
      type: 'simple',
      icon: '🔭',
      summary: '焦点扩展搜索完成',
      details: '基于已纳入的 21 条示例记录，系统识别出 2 个高关联相邻主题：Graph Transformer（图神经网络+Transformer 融合）和 Protein Language Model（ESM 系列蛋白质语言模型）。在这两个方向扩展示例路径，新增 28 条候选示例，建议优先查看 ESM-2 相关示例。'
    }
  },
  'abstract-screen': {
    id: 'abstract-screen',
    icon: '📋',
    name: '摘要筛选',
    desc: '用内置模拟评分对摘要示例排序，阈值过滤，边界文献需人工判断',
    retryable: true,
    category: 'filter',
    categoryLabel: '筛选',
    risk: 'medium',
    riskLabel: '中风险',
    checkpoint: true,
    deps: ['db-search'],
    hasFullUI: true,
    tools: ['Mock Relevance Scorer', 'Threshold Filter'],
    subs: ['相关性打分', '阈值过滤', '👤 Human Checkpoint'],
    logs: [
      { level: 'INFO', text: '对 276 条示例记录进行相关性评分（模型：SciBERT-ft）' },
      { level: 'INFO', text: '评分完成，阈值 0.72 过滤后剩余 21 条示例记录' },
      { level: 'WARN', text: '3 条示例记录的模拟评分处于边界区间 [0.72–0.75]，触发 Human Checkpoint' },
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
    desc: '读取固定包中的摘要/元数据示例，提取方法论和关键发现，标注潜在矛盾',
    category: 'filter',
    categoryLabel: '筛选',
    risk: 'high',
    riskLabel: '高风险',
    deps: ['abstract-screen'],
    hasFullUI: true,
    tools: ['Mock Document Parser', 'Method Extractor', 'Contradiction Detector'],
    subs: ['方法论提取', '关键发现提取', '矛盾检测'],
    logs: [
      { level: 'INFO', text: '读取固定包中的文档示例（21 条），解析结构化字段' },
      { level: 'WARN', text: '示例字段覆盖率 67%（14/21 条含扩展字段），其余降级为摘要+元数据分析' },
      { level: 'INFO', text: '提取方法论章节：21/21 条示例记录' },
      { level: 'INFO', text: '识别关键发现：共 47 条 findings' },
      { level: 'WARN', text: '发现潜在矛盾：Liu et al.(2022) 与 Wang et al.(2023) 在 AUROC 指标上结论相悖' },
      { level: 'INFO', text: '矛盾已标注，等待人工处置...' }
    ],
    result: {
      type: 'fulltext',
      findings: 47,
      contradictionCount: 1, // 只标注"发现了几处矛盾"，处置数据由 contradiction-detect 负责
      findingsList: [
        { text: 'ChemBERTa 在 MoleculeNet BBBP 任务上 AUROC 达 0.947，较 ECFP+RF 提升 8.3%', source: 'Chithrananda et al., 2020' },
        { text: 'MolBERT 在 HIV 抑制剂筛选任务中准确率提升 12.1%，预训练数据规模是关键', source: 'Fabian et al., 2020' },
        { text: 'Transformer DTI 双编码器在 BindingDB AUROC=0.924，显著优于 GNN 基线 0.871', source: 'Liu et al., 2022' }
        // Mock 简化：边界文献全部纳入为假设，findingsList 展示前 3 条
      ],
      hint: '固定包文档示例读取完成，矛盾检测将在后续节点处置。'
    }
  },
  'quality-assess': {
    id: 'quality-assess',
    icon: '🏅',
    name: '方法学质量评估',
    desc: '用 GRADE 量表评估方法学质量，识别偏倚风险',
    category: 'filter',
    categoryLabel: '筛选',
    risk: 'medium',
    riskLabel: '中风险',
    deps: ['fulltext-read'],
    hasFullUI: false,
    tools: ['GRADE Scorer', 'Bias Detector'],
    subs: ['GRADE 评级', '偏倚风险评估'],
    logs: [
      { level: 'INFO', text: '对 21 条固定包文档示例进行 GRADE 方法学评估...' },
      { level: 'INFO', text: '评估维度：样本量、随机性、盲法、结局报告完整性' },
      { level: 'WARN', text: '3 条示例记录存在数据集重叠风险（相同 BindingDB 测试集）' },
      { level: 'INFO', text: '✓ 质量标签演示完成：A 级 8 条 / B 级 11 条 / C 级 2 条' }
    ],
    result: {
      type: 'simple',
      icon: '🏅',
      summary: '方法学质量评估完成',
      details: '基于 GRADE 框架对 21 条固定包示例记录进行质量标签演示。A 级：8 条；B 级：11 条；C 级：2 条。标签只用于展示流程分支，不代表真实证据等级或科研结论。'
    }
  },
  'contradiction-detect': {
    id: 'contradiction-detect',
    icon: '⚡',
    name: '矛盾检测',
    desc: '对矛盾文献进行结构化处置，四选一人工决策',
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
      { level: 'WARN', text: '发现 1 处潜在矛盾：Liu 2022 vs Wang 2023，AUROC 差值 0.060' },
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
          { id: 'both', label: '两条均纳入并标注争议', reason: '保留示例争议' },
          { id: 'exclude', label: '排除两条，仅用其他示例', reason: '矛盾无法调和' }
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
    desc: '对全部纳入文献做主题聚类，发现研究方向分布',
    category: 'analysis',
    categoryLabel: '分析',
    risk: 'low',
    riskLabel: '低风险',
    deps: ['abstract-screen'],
    hasFullUI: false,
    tools: ['BERTopic', 'Cluster Viz'],
    subs: ['主题建模', '聚类可视化'],
    logs: [
      { level: 'INFO', text: '对 21 条纳入示例记录进行主题建模（BERTopic）...' },
      { level: 'INFO', text: '识别 4 个主要主题聚类' },
      { level: 'INFO', text: '✓ 主题聚类完成：分子属性预测 / DTI / 从头生成 / 多组学' }
    ],
    result: {
      type: 'simple',
      icon: '🗂️',
      summary: '主题聚类完成',
      details: '基于 BERTopic 对 21 条示例摘要进行主题建模，识别 4 个高内聚主题：① 分子属性预测（8 条，核心：ChemBERTa/MolBERT 预训练范式）② 药物-靶点相互作用（5 条，核心：双编码器架构）③ 从头分子生成（5 条，核心：REINVENT 变体）④ 多组学整合（3 条，核心：跨模态注意力）。主题分布用于展示聚类组织方式，不代表真实研究分布。'
    }
  },
  'meta-analysis': {
    id: 'meta-analysis',
    icon: '📊',
    name: '效应量汇总',
    desc: '汇总效应量，输出森林图数据和异质性统计',
    demoUnavailable: true,
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
    desc: '根据发现和主题自动生成综述大纲（可编辑）',
    retryable: true,
    category: 'output',
    categoryLabel: '输出',
    risk: 'low',
    riskLabel: '低风险',
    deps: ['abstract-screen'],
    hasFullUI: true,
    tools: ['Outline Generator'],
    subs: ['生成大纲', '结构优化'],
    logs: [
      { level: 'INFO', text: '基于 21 条纳入示例记录生成综述大纲...' },
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
    desc: '基于大纲和文献生成完整综述草稿',
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
      { level: 'INFO', text: '加载固定包精读结果与矛盾处置记录...' },
      { level: 'ERROR', text: '[ERROR-1] 报告结构生成失败：上下文窗口溢出，内容截断', _trigger: 'error1' },
      { level: 'WARN', text: '[重试 1/3] 扩大上下文窗口至 128K，重新生成...' },
      { level: 'ERROR', text: '[ERROR-2] 输出结构异常：章节编号错位，与已有文献结论矛盾', _trigger: 'error2' },
      { level: 'WARN', text: '[重试 2/3] 切换备用模型（降低温度至 0.2）...' },
      { level: 'ERROR', text: '[ERROR-3] 模拟过程指标偏低（23%）：生成内容与矛盾处置结果不一致', _trigger: 'error3' },
      { level: 'INFO', text: '根据 47 条 findings 生成综述大纲（5 节）' },
      { level: 'INFO', text: '撰写各段落，自动插入 APA 引用格式' },
      { level: 'INFO', text: '引用示例记录 21 条，精选核心示例 6 条进入摘要层' },
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
    desc: '导出所有纳入文献的 BibTeX 引用文件',
    demoUnavailable: true,
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
    desc: '6 步标准流程',
    nodes: ['data-source-config', 'keyword-extract', 'db-search', 'abstract-screen', 'outline-gen', 'review-write']
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
    nodes: ['data-source-config', 'keyword-extract', 'db-search', 'citation-chase', 'abstract-screen', 'theme-cluster', 'bibtex-export', 'outline-gen']
  }
};

// ---- 节点模拟过程指标配置 ----
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
  'db-search': function () { return '276 条候选示例'; },
  'citation-chase': function () { return '+41 条（引文追踪示例）'; },
  'expand-search': function () { return '+28 条（焦点扩展示例）'; },
  'abstract-screen': function (ud) {
    var inc = 18, hold = 0, exc = 0;
    if (ud && ud.borderline) {
      ud.borderline.forEach(function (p) {
        if (p.decision === 'include') inc++;
        else if (p.decision === 'maybe') hold++;
        else if (p.decision === 'exclude') exc++;
      });
    }
    return inc + ' 条示例纳入' + (hold > 0 ? ' · ' + hold + ' 条待定' : '');
  },
  'fulltext-read': function () { return '47 条 Findings · 1 处矛盾'; },
  'quality-assess': function () { return '8 条 A / 11 条 B / 2 条 C'; },
  'contradiction-detect': function () { return '1 处矛盾已处置'; },
  'theme-cluster': function () { return '4 个主题聚类'; },
  'meta-analysis': function () { return 'AUROC 提升 +0.073'; },
  'outline-gen': function () { return '5 节大纲'; },
  'review-write': function () { return '2400 字综述'; },
  'bibtex-export': function () { return '276 条示例引用导出'; }
};

// ---- Mock 最终结果 ----
var MOCK_RESULT = {
  title: 'Transformer 架构在药物发现中的应用综述',
  abstract: '固定演示摘要：以下内容来自内置示例文本，仅用于展示输出结构，不代表真实综述结论。Transformer 架构自 2017 年提出以来，凭借其自注意力机制在自然语言处理领域取得突破性进展，并迅速渗透至生物医学与药物发现领域。本示例梳理 2018–2024 年间 Transformer 在分子属性预测、药物-靶点相互作用识别、从头分子生成及多组学数据整合四个场景中的应用，汇总 21 条示例记录，重点展示模型架构演化路径、基准数据集选取策略及临床转化瓶颈。示例文本呈现预训练-微调范式、可解释性与标注数据等讨论线索，但不应被当作研究结论。',
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
  },
  'inc1': {
    title: 'ChemBERTa: Large-Scale Self-Supervised Pretraining for Molecular Property Prediction',
    meta: 'Chithrananda et al. · arXiv 2020',
    score: '相关性评分 0.91',
    abstract: '本文提出 <strong>ChemBERTa</strong>，在 77M SMILES 字符串上进行自监督预训练，通过 fine-tuning 完成下游分子属性预测。在多个 MoleculeNet 基准上，BBBP 任务 AUROC 达 0.947，优于传统 ECFP+RF 方法 8.3%。',
    doi: 'https://doi.org/10.48550/arXiv.2010.09885'
  },
  'inc2': {
    title: 'MolBERT: Molecular Property Prediction with BERT',
    meta: 'Fabian et al. · ICLR Workshop 2020',
    score: '相关性评分 0.89',
    abstract: '本文将 BERT 预训练范式迁移至分子表示学习，提出 <strong>MolBERT</strong>，通过掩码原子预测和分子属性对齐两个预训练目标习得高质量分子嵌入。在 HIV 抑制剂筛选任务中准确率提升 12.1%，预训练数据规模是关键因素。',
    doi: 'https://doi.org/10.48550/arXiv.2011.13230'
  },
  'inc3': {
    title: 'Transformer-based Drug-Target Interaction Prediction',
    meta: 'Liu et al. · Bioinformatics 2022',
    score: '相关性评分 0.88',
    abstract: '本文将 <strong>Transformer 双编码器</strong>架构应用于 DTI 预测，蛋白质序列编码器 + SMILES 分子编码器通过交叉注意力融合。在 BindingDB 数据集 AUROC 达 0.924，优于 GNN 基线 0.871。',
    doi: 'https://doi.org/10.1093/bioinformatics/btab500'
  },
  'inc4': {
    title: 'REINVENT 2.0: Transformer Prior for Molecular Generation',
    meta: 'Blaschke et al. · J. Chem. Inf. Model. 2020',
    score: '相关性评分 0.85',
    abstract: '本文引入 <strong>Transformer 先验网络</strong>替代 RNN，通过强化学习引导 REINVENT 分子生成朝目标属性优化。在 QED × SA 综合指标上表现最优，但 3D 构象生成准确性仍有提升空间。',
    doi: 'https://doi.org/10.26434/chemrxiv.12058026'
  },
  'inc5': {
    title: 'Multi-omics Integration via Transformer Cross-Modal Attention',
    meta: 'Wang et al. · Nature Methods 2023',
    score: '相关性评分 0.83',
    abstract: '本文通过 <strong>Transformer 跨模态注意力</strong>整合基因组、转录组、蛋白质组数据，在细胞类型识别和疾病关联分析任务中显著优于单组学方法。AUROC 达 0.864（BindingDB）。',
    doi: 'https://doi.org/10.1038/s41592-023-01970-4'
  },
  'inc6': {
    title: 'SE(3)-Equivariant Graph Neural Networks for Molecular Property',
    meta: 'Fuchs et al. · NeurIPS 2020',
    score: '相关性评分 0.81',
    abstract: '本文提出 <strong>SE(3)-Transformer</strong>，将 Transformer 注意力机制与等变几何特征结合，保证分子三维表示的旋转/平移不变性，在 QM9 量子化学属性预测上达到 SOTA。',
    doi: 'https://doi.org/10.48550/arXiv.2006.10503'
  },
  'inc7': {
    title: 'Molecular Conformer Generation with Transformer',
    meta: 'Shi et al. · ICLR 2021',
    score: '相关性评分 0.80',
    abstract: '本文将 <strong>Transformer 生成模型</strong>用于分子三维构象预测，通过自回归方式生成原子坐标。在 GEOM 数据集上优于 RDKit 和 GNN 基线，尤其适用于柔性分子构象采样。',
    doi: 'https://doi.org/10.48550/arXiv.2012.09712'
  },
  'inc8': {
    title: 'Pre-training Molecular Graph Transformer via Motif Prediction',
    meta: 'Zhang et al. · AAAI 2022',
    score: '相关性评分 0.79',
    abstract: '本文提出基于 <strong>子结构动机预测</strong>的分子图 Transformer 预训练策略，结合 Graph Transformer 与 SMILES Transformer 双编码器，在低数据场景下 ADMET 属性预测优于单一模态方法。',
    doi: 'https://doi.org/10.48550/arXiv.2110.00773'
  },
  'inc9': {
    title: 'Protein Language Models Enable Zero-Shot Drug Discovery',
    meta: 'Ferruz et al. · Nature Communications 2022',
    score: '相关性评分 0.77',
    abstract: '本文利用在 UniRef50 上预训练的 <strong>蛋白质语言模型</strong>（ProtGPT2），实现对蛋白质功能的零样本推理，在药物靶点识别中展示出超越传统同源建模方法的泛化能力。',
    doi: 'https://doi.org/10.1038/s41467-022-32007-7'
  }
};

// ---- 已纳入文献键列表（摘要筛选专用）----
var INCLUDED_PAPER_KEYS = ['inc1', 'inc2', 'inc3', 'inc4', 'inc5', 'inc6', 'inc7', 'inc8', 'inc9'];

// ---- 管线分组（时间线分组框用）----
var PIPELINE_GROUPS = [
  { id: 'config',    label: '配置',    nodeIds: ['data-source-config'] },
  { id: 'discovery', label: '文献发现', nodeIds: ['keyword-extract', 'db-search', 'citation-chase'] },
  { id: 'filter',    label: '质量筛选', nodeIds: ['abstract-screen', 'expand-search', 'fulltext-read', 'quality-assess'] },
  { id: 'analysis',  label: '深度分析', nodeIds: ['contradiction-detect', 'theme-cluster', 'meta-analysis'] },
  { id: 'output',    label: '综述输出', nodeIds: ['outline-gen', 'review-write', 'bibtex-export'] }
];

// ---- 分组汇总文字 ----
var GROUP_SUMMARIES = {
  config:    '数据源配置就绪，3 个示例来源。',
  discovery: '文献发现完成，候选示例记录 276 条。',
  filter:    '质量筛选完成，21 条示例记录纳入流程。',
  analysis:  '深度分析完成，矛盾已处置，主题聚类清晰。',
  output:    '综述输出完成，可导出草稿与参考文献。'
};

// ---- 节点重跑 Mock 结果 ----
var MOCK_RETRY_RESULTS = {
  'keyword-extract': {
    type: 'keywords',
    keywords: [
      { term: 'Transformer', mesh: 'Neural Networks, Computer', editable: true },
      { term: 'Drug Discovery', mesh: 'Drug Discovery', editable: true },
      { term: 'Molecular Property', mesh: 'Molecular Structure', editable: true },
      { term: 'Self-Attention', mesh: null, editable: true },
      { term: 'SMILES', mesh: 'Drug Design', editable: true },
      { term: 'Protein-Ligand', mesh: 'Ligands', editable: true },
      { term: 'Deep Learning', mesh: 'Deep Learning', editable: true },
      { term: 'Binding Affinity', mesh: 'Protein Binding', editable: true },
      { term: 'Graph Neural Network', mesh: 'Neural Networks, Computer', editable: true },
      { term: 'Protein Language Model', mesh: 'Molecular Sequence Data', editable: true },
      { term: 'Molecular Generation', mesh: 'Drug Design', editable: true }
    ],
    hint: '扩展策略新增 Graph Neural Network、Protein Language Model 等词，检索覆盖面更广。',
    _retryHint: '扩展关键词策略'
  },
  'outline-gen': {
    type: 'outline',
    sections: [
      { id: 1, title: '引言：Transformer 架构概述', points: '自注意力机制原理；从 NLP 到生物医学的迁移路径', editable: true },
      { id: 2, title: '分子属性预测应用', points: 'ChemBERTa / MolBERT 预训练范式；MoleculeNet 基准对比', editable: true },
      { id: 3, title: '药物-靶点相互作用识别', points: '双编码器架构；BindingDB / Davis 数据集结果', editable: true },
      { id: 4, title: '从头分子生成', points: 'REINVENT 变体；QED × SA 综合指标；3D 构象局限性', editable: true },
      { id: 5, title: '多组学整合与跨模态学习', points: 'Transformer 跨模态注意力；蛋白质语言模型；图 Transformer 融合', editable: true },
      { id: 6, title: '局限性、挑战与未来方向', points: '可解释性不足；标注数据稀缺；多模态整合趋势；临床转化瓶颈', editable: true }
    ],
    hint: '扩展结构新增第 5 节（多组学整合）和扩充结论章节，共 6 节。',
    _retryHint: '扩展大纲结构至 6 节'
  },
  'abstract-screen': {
    type: 'screening',
    threshold: 0.68,
    included: 28,
    borderline: [],
    hint: '放宽阈值后纳入示例记录从 18 条增至 28 条。',
    _retryHint: '放宽阈值后纳入增加'
  },
  'db-search': {
    type: 'search',
    query: 'Transformer AND ("Drug Discovery" OR "Molecular Property" OR "SMILES" OR "Protein Binding") [2018:2024]',
    sources: [
      { name: 'PubMed', count: 178, color: '#2563eb' },
      { name: 'Semantic Scholar', count: 241, color: '#7c3aed' },
      { name: '去重后合计', count: 341, color: '#059669' }
    ],
    yearRange: { min: 2018, max: 2024, current: [2018, 2024] },
    preview: [
      { title: 'Attention Is All You Need', year: 2017, key: 'cp1' },
      { title: 'ChemBERTa: Large-Scale Self-Supervised Pretraining', year: 2020, key: 'cp2' },
      { title: 'MolBERT: Molecular Property Prediction', year: 2020, key: null },
      { title: 'Transformer-based DTI Prediction', year: 2022, key: null },
      { title: 'Graph Transformer for Molecular Property', year: 2023, key: null }
    ],
    hint: '固定包内扩展示例后候选示例记录从 276 条增至 341 条。',
    _retryHint: '扩展检索词后候选增加'
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
