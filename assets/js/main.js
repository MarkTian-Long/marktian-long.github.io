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

// ---- SKILL RADAR CHART (ECharts) ----
function initRadarChart() {
  const dom = document.getElementById('radarChart');
  if (!dom || typeof echarts === 'undefined') return;
  const chart = echarts.init(dom, null, { renderer: 'svg' });
  chart.setOption({
    backgroundColor: 'transparent',
    radar: {
      indicator: [
        { name: 'AI产品设计', max: 100 },
        { name: '数据分析', max: 100 },
        { name: '用户研究', max: 100 },
        { name: '技术理解', max: 100 },
        { name: '项目管理', max: 100 },
        { name: '商业分析', max: 100 },
      ],
      shape: 'polygon',
      splitNumber: 4,
      axisName: { color: '#8a95b5', fontSize: 11 },
      splitLine: { lineStyle: { color: 'rgba(255,255,255,0.06)', width: 1 } },
      splitArea: { areaStyle: { color: ['rgba(79,143,255,0.03)', 'rgba(79,143,255,0.06)'] } },
      axisLine: { lineStyle: { color: 'rgba(255,255,255,0.08)' } },
    },
    series: [{
      type: 'radar',
      data: [{
        value: [88, 82, 85, 78, 84, 80],
        name: '能力评估',
        areaStyle: {
          color: {
            type: 'radial',
            x: 0.5, y: 0.5, r: 0.5,
            colorStops: [
              { offset: 0, color: 'rgba(79,143,255,0.55)' },
              { offset: 1, color: 'rgba(155,109,255,0.2)' }
            ]
          }
        },
        lineStyle: { color: '#4f8fff', width: 2 },
        itemStyle: { color: '#4f8fff', borderColor: '#fff', borderWidth: 2 },
        symbolSize: 6,
      }],
    }],
  });
  window.addEventListener('resize', () => chart.resize());
}

// ---- CASE STUDIES DATA ----
const casesData = [
  {
    emoji: '🤖',
    tag: 'AI 产品 · 0→1',
    grad: 'linear-gradient(135deg, #4f8fff, #9b6dff)',
    tagBg: 'rgba(79,143,255,0.12)',
    tagColor: '#4f8fff',
    tagBorder: 'rgba(79,143,255,0.25)',
    accentColor: '#00e5a0',
    title: 'AI 智能客服产品从 0 到 1',
    desc: '主导 AI 客服产品的全链路设计，从用户痛点调研到意图识别模型设计，再到多轮对话体验优化，实现人工介入率大幅降低。',
    metrics: [
      { num: '-42%', label: '人工介入率' },
      { num: '+38%', label: '用户满意度' },
      { num: '3个月', label: '首版上线' },
    ],
  },
  {
    emoji: '📊',
    tag: '数据产品 · 增长',
    grad: 'linear-gradient(135deg, #9b6dff, #00d4ff)',
    tagBg: 'rgba(155,109,255,0.12)',
    tagColor: '#9b6dff',
    tagBorder: 'rgba(155,109,255,0.25)',
    accentColor: '#9b6dff',
    title: '智能推荐系统产品设计',
    desc: '负责基于机器学习的个性化推荐功能产品设计，制定冷启动策略、效果评估体系与 A/B 测试方案，推动业务转化提升。',
    metrics: [
      { num: '+25%', label: '点击转化率' },
      { num: '10+', label: 'AB实验组次' },
      { num: '2亿+', label: '覆盖用户量' },
    ],
  },
  {
    emoji: '✍️',
    tag: 'AIGC · 内容产品',
    grad: 'linear-gradient(135deg, #00d4ff, #00e5a0)',
    tagBg: 'rgba(0,212,255,0.12)',
    tagColor: '#00d4ff',
    tagBorder: 'rgba(0,212,255,0.25)',
    accentColor: '#00d4ff',
    title: 'AI 写作助手功能设计',
    desc: '调研 10+ 竞品，结合用户访谈定义产品功能优先级，设计 Prompt 工程方案与内容安全策略，完成完整 PRD 并推动研发落地。',
    metrics: [
      { num: '10+', label: '竞品分析' },
      { num: '3轮', label: '用户测试' },
      { num: '95%', label: '需求交付率' },
    ],
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
    </div>
  `).join('');
  // Re-observe new elements
  document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));
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
  initRadarChart();
  injectSvgDefs();
  updateActiveNavLink();
});
