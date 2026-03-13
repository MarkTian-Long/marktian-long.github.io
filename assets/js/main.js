/* =============================================
   MAIN.JS - Navigation, Animations, Charts, Cases
   ============================================= */

// ---- NAVBAR SCROLL ----
const navbar = document.getElementById('navbar');
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');

window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 40);
  updateActiveNavLink();
});
navToggle.addEventListener('click', () => {
  navLinks.classList.toggle('open');
});
document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', () => navLinks.classList.remove('open'));
});

// ---- ACTIVE NAV LINK ----
function updateActiveNavLink() {
  const sections = document.querySelectorAll('section[id]');
  const scrollY = window.scrollY + 100;
  sections.forEach(sec => {
    const top = sec.offsetTop, height = sec.offsetHeight;
    const id = sec.getAttribute('id');
    const link = document.querySelector(`.nav-link[href="#${id}"]`);
    if (link) {
      link.classList.toggle('active', scrollY >= top && scrollY < top + height);
    }
  });
}

// ---- REVEAL ON SCROLL ----
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));


// ---- CASE STUDIES DATA ----
const casesData = [
  {
    emoji: '📋',
    tag: 'AI 产品 · Prompt Engineering',
    grad: 'linear-gradient(135deg, #4f8fff, #9b6dff)',
    tagBg: 'rgba(79,143,255,0.12)',
    tagColor: '#4f8fff',
    tagBorder: 'rgba(79,143,255,0.25)',
    accentColor: '#00e5a0',
    title: '股权激励 AI 对标数据库',
    desc: '某股权激励 SaaS 服务商。针对港交所/SEC招股书等非结构化PDF文档，主导Prompt Engineering方案设计，推动MVP上线并投入商用。',
    metrics: [
      { num: '20+', label: '已服务客户项目' },
      { num: '4-5天→1天', label: '对标数据准备时间' },
      { num: '≥95%', label: '核心字段提取准确率' },
    ],
    detail: {
      background: '股权激励属于垂直咨询场景，核心对标数据散落在港交所、SEC等平台的招股书与公告中，市面上无同类结构化产品，咨询师每次项目需重复检索整理，单家对标公司耗时 4-5 小时。',
      decisions: [
        '<b>文档定位策略：</b>港股招股书章节结构相对统一，在 Prompt 中预标注各字段大致所在章节范围，引导模型优先在目标区域定位，降低跨章节误提取概率。',
        '<b>金融术语统一：</b>设计系统级金融同义词映射表（如行使价 = 行权价格 = 认购价），作为全局配置供所有模块 Prompt 复用，提升跨公司、跨语言场景下的字段识别一致性。',
        '<b>缺失字段兜底：</b>设计明确规范——找不到依据时返回 null 并标注低置信度，严禁模型编造，配合字段间逻辑校验规则自动标记异常，支持一键跳转源文件核查。',
      ],
      demoLink: true,
    },
  },
  {
    emoji: '🔍',
    tag: 'RAG · 金融 AI 平台',
    grad: 'linear-gradient(135deg, #9b6dff, #00d4ff)',
    tagBg: 'rgba(155,109,255,0.12)',
    tagColor: '#9b6dff',
    tagBorder: 'rgba(155,109,255,0.25)',
    accentColor: '#9b6dff',
    title: 'LLM 驱动：金融资讯研报 AI 平台',
    desc: '某头部金融科技公司。主导RAG架构设计，覆盖10+数据源实时接入、双层知识库、数据溯源分级标注；制定业务与技术双轨评估指标，建立 Bad Case 驱动的数据飞轮。',
    metrics: [
      { num: '10+', label: '数据源实时接入' },
      { num: '提升6倍', label: '资讯整合效率' },
      { num: 'SIT/UAT', label: '已完成原型并进入验收' },
    ],
    detail: {
      background: '金融分析师面临多源资讯碎片化（非结构化数据 >60%）、人工整合效率低易遗漏，以及研报生成基础工作耗时的问题。目标是构建 AI 平台，实现资讯自动整合与研报基础内容生成，释放分析师精力。',
      decisions: [
        '<b>双层知识库设计：</b>实时市场库自动同步 24 小时内财报/新闻/政策动态；私有知识库支持分析师上传历史研报按需检索。生成研报时联合召回，兼顾时效性与深度。',
        '<b>金融语义专项处理：</b>采用专用中文金融 Embedding 模型替代通用向量化，设计系统级金融同义词对齐机制（ROE = 净资产收益率），基于人工标注测试集验证检索相关性。',
        '<b>可量化评估体系：</b>业务侧"研报采用率 ≥75%、修改轮次 ≤3次"；技术侧"核心数据引用准确率 100%、合规词检出率 100%"，让产品价值与技术效果可度量。',
      ],
      demoLink: false,
    },
  },
  {
    emoji: '🛡️',
    tag: 'LLM · 金融风控',
    grad: 'linear-gradient(135deg, #00d4ff, #00e5a0)',
    tagBg: 'rgba(0,212,255,0.12)',
    tagColor: '#00d4ff',
    tagBorder: 'rgba(0,212,255,0.25)',
    accentColor: '#00d4ff',
    title: '反洗钱系统 LLM 审批助手',
    desc: '某头部金融科技公司。设计"AI生成参考意见 + 人工最终审批"协作模式，在提升尽调效率的同时守住合规底线，推动私有化部署落地。',
    metrics: [
      { num: 'AI辅助+人工决策', label: '合规协作模式' },
      { num: '私有化部署', label: '落地交付' },
      { num: '书面表扬', label: '客户公司级认可' },
    ],
    detail: {
      background: '传统反洗钱尽调依赖人工录入分析意见，存在分析维度不全面、操作易出错的问题。在确保风控合规前提下引入 AI 辅助，提升审批效率与全面性。',
      decisions: [
        '<b>"AI辅助 + 人工决策"模式：</b>AI 生成参考意见，人工保留最终审批权。这一设计在金融风控场景下平衡了效率提升与合规底线，是 AI 落地严肃业务场景的关键设计原则。',
        '<b>灵活可配置 Prompt 体系：</b>支持不同审批场景的 Prompt 自定义配置，使 AI 能力灵活适配多样化的反洗钱尽调任务需求，降低业务方接入门槛。',
      ],
      demoLink: false,
    },
  },
];

function renderCases() {
  const grid = document.getElementById('casesGrid');
  if (!grid) return;
  grid.innerHTML = casesData.map((c, i) => `
    <div class="case-card glass-card reveal" style="animation-delay:${i * 0.1}s; --grad: ${c.grad}; --tag-bg: ${c.tagBg}; --tag-color: ${c.tagColor}; --tag-border: ${c.tagBorder}; --accent-color: ${c.accentColor}">
      <div class="case-emoji">${c.emoji}</div>
      <span class="case-tag">${c.tag}</span>
      <h3 class="case-title">${c.title}</h3>
      <p class="case-desc">${c.desc}</p>
      <div class="case-metrics">
        ${c.metrics.map(m => `
          <div class="case-metric">
            <span class="metric-num">${m.num}</span>
            <span class="metric-label">${m.label}</span>
          </div>
        `).join('')}
      </div>
      <button class="case-detail-btn" onclick="toggleCaseDetail(this)">
        查看设计详情 <i class="btn-arrow">▾</i>
      </button>
      <div class="case-detail-body">
        <div class="case-detail-inner">
          <div class="detail-section">
            <div class="detail-section-title">项目背景</div>
            <p style="font-size:0.85rem;color:var(--text-secondary);line-height:1.7;">${c.detail.background}</p>
          </div>
          <div class="detail-section">
            <div class="detail-section-title">核心设计决策</div>
            <ul class="detail-points">
              ${c.detail.decisions.map(d => `<li>${d}</li>`).join('')}
            </ul>
          </div>
          ${c.detail.demoLink ? `<a class="detail-demo-link" href="#tools" onclick="setTimeout(()=>switchTool('esop'),100)">▶ 立即体验 ESOP 提取 Demo</a>` : ''}
        </div>
      </div>
    </div>
  `).join('');
  document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));
}

function toggleCaseDetail(btn) {
  const body = btn.nextElementSibling;
  const isOpen = body.classList.contains('open');
  body.classList.toggle('open', !isOpen);
  btn.classList.toggle('open', !isOpen);
}

// ---- TOOL SWITCHER ----
function switchTool(tool) {
  document.querySelectorAll('.tool-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.tool-panel').forEach(p => p.classList.add('hidden'));
  document.getElementById(`tab-${tool}`).classList.add('active');
  document.getElementById(`panel-${tool}`).classList.remove('hidden');
}

// ---- SVG GRADIENT for Progress Ring ----
function injectSvgDefs() {
  const svg = document.querySelector('.progress-ring');
  if (!svg) return;
  const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
  defs.innerHTML = `
    <linearGradient id="progressGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#4f8fff"/>
      <stop offset="100%" style="stop-color:#9b6dff"/>
    </linearGradient>
  `;
  svg.prepend(defs);
}

// ---- INIT ----
document.addEventListener('DOMContentLoaded', () => {
  renderCases();
  injectSvgDefs();
  updateActiveNavLink();
});
