/* =============================================
   AI INSIGHTS - SCRIPT
   Loads products.json √ Render cards √ Filter √ Detail modal
   ============================================= */

let products = [];
let currentFilter = 'all';

function dataComplete(p) {
    return p.keyMetrics && p.keyMetrics.length > 0
        && p.timeline && p.timeline.length > 0
        && p.sources && p.sources.length > 0;
}

const TREND_MAP = {
    up: { label: '📈 上升趋势', cls: 'trend-up' },
    stable: { label: '➡️ 稳定', cls: 'trend-stable' },
    down: { label: '📉 下降', cls: 'trend-down' },
};

const CARD_GRADS = [
    'linear-gradient(135deg, #4f8fff, #9b6dff)',
    'linear-gradient(135deg, #9b6dff, #00d4ff)',
    'linear-gradient(135deg, #00d4ff, #00e5a0)',
    'linear-gradient(135deg, #f59e0b, #ef4444)',
    'linear-gradient(135deg, #00e5a0, #4f8fff)',
    'linear-gradient(135deg, #ef4444, #9b6dff)',
];

// ---- LOAD DATA ----
async function loadProducts() {
    try {
        const res = await fetch('data/products.json');
        products = await res.json();
        renderFilters();
        renderGrid();
        document.getElementById('productCount').textContent = `共 ${products.length} 款产品`;
    } catch (err) {
        document.getElementById('productGrid').innerHTML =
            '<div class="loading">⚠️ 数据加载失败，请确认 data/products.json 文件存在</div>';
        console.error(err);
    }
}

// ---- FILTERS ----
function renderFilters() {
    const cats = [...new Set(products.map(p => p.category))];
    const bar = document.getElementById('filterBar');
    // Keep the "全部" button, add category buttons
    cats.forEach(cat => {
        const btn = document.createElement('button');
        btn.className = 'filter-btn';
        btn.dataset.cat = cat;
        btn.textContent = cat;
        btn.onclick = function () { filterCategory(this, cat); };
        bar.appendChild(btn);
    });
}

function filterCategory(btn, cat) {
    currentFilter = cat;
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderGrid();
}

// ---- RENDER GRID ----
function renderGrid() {
    const grid = document.getElementById('productGrid');
    const filtered = currentFilter === 'all'
        ? products
        : products.filter(p => p.category === currentFilter);

    if (filtered.length === 0) {
        grid.innerHTML = '<div class="loading">暂无此类别产品</div>';
        return;
    }

    grid.innerHTML = filtered.map((p, i) => {
        const trend = TREND_MAP[p.trend] || TREND_MAP.stable;
        const grad = CARD_GRADS[i % CARD_GRADS.length];

        return `
      <div class="product-card" style="--card-grad: ${grad}; animation-delay: ${i * 0.06}s"
           onclick="showDetail('${p.id}')">
        <div class="card-top">
          <span class="card-logo">${p.logo}</span>
          <span class="card-trend ${trend.cls}">${trend.label}</span>
        </div>
        ${p.issue ? `<div class="card-issue">#${String(p.issue).padStart(3, '0')}</div>` : ''}
        <div class="card-name">${p.name}</div>
        <div class="card-company">${p.company}</div>
        <div class="card-tagline">${p.tagline}</div>
        <div class="${p.oneLiner ? 'card-one-liner' : 'card-desc'}">${p.oneLiner || p.description}</div>
        <div class="card-tags">
          <span class="card-category">${p.category}</span>
          ${p.techStack.slice(0, 3).map(t => `<span class="card-tag">${t}</span>`).join('')}
        </div>
        <div class="card-footer">
          ${dataComplete(p) ? '' : '<span class="card-incomplete">数据待补充</span>'}
          <span class="card-cta">查看拆解 →</span>
        </div>
      </div>
    `;
    }).join('');
}

// ---- DETAIL MODAL ----
function showDetail(id) {
    const p = products.find(pr => pr.id === id);
    if (!p) return;

    const trend = TREND_MAP[p.trend] || TREND_MAP.stable;
    const content = document.getElementById('detailContent');

    const headerHtml = `
        <div class="detail-header">
            <span class="detail-logo">${p.logo}</span>
            <div>
                <div class="detail-name">${p.name}</div>
                <div class="detail-company">${p.company}</div>
            </div>
            <div style="margin-left:auto;display:flex;align-items:center;gap:8px">
                ${p.issue ? `<div class="card-issue">#${String(p.issue).padStart(3, '0')}</div>` : ''}
                ${p.detailLink ? `<a href="${p.detailLink}" target="_blank" rel="noopener" class="detail-official-link">官网 ↗</a>` : ''}
            </div>
        </div>
        <div class="detail-tagline">${p.tagline}</div>
        <div class="detail-meta">
            <div class="detail-meta-item"><span class="detail-meta-label">分类</span>${p.category}</div>
            <div class="detail-meta-item"><span class="detail-meta-label">商业模式</span>${p.businessModel}</div>
            <div class="detail-meta-item"><span class="detail-meta-label">上线时间</span>${p.launchDate}</div>
            <div class="detail-meta-item"><span class="detail-meta-label">趋势</span>${trend.label}</div>
        </div>
    `;

    let bodyHtml;
    if (p.tabs) {
        bodyHtml = renderTabs(p);
    } else {
        // fallback: 原有展示
        bodyHtml = `
            <div class="detail-desc">${p.description}</div>
            <div class="detail-section">
                <div class="detail-section-title">🔥 核心亮点</div>
                <ul class="detail-list">${p.highlights.map(h => `<li>${h}</li>`).join('')}</ul>
            </div>
            <div class="detail-section">
                <div class="detail-section-title">💡 PM 视角洞察</div>
                <ul class="detail-list insights">${p.pmInsights.map(i => `<li>${i}</li>`).join('')}</ul>
            </div>
            <div class="detail-section">
                <div class="detail-section-title">🛠 技术关键词</div>
                <div class="card-tags" style="margin-top:8px">${p.techStack.map(t => `<span class="card-tag">${t}</span>`).join('')}</div>
            </div>
        `;
    }

    content.innerHTML = headerHtml + bodyHtml + `<button class="detail-close" onclick="closeDetailDirect()">关闭</button>`;
    document.getElementById('detailModal').classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function renderTabs(p) {
    const t = p.tabs;
    const hasMetrics = p.keyMetrics && p.keyMetrics.length > 0;
    const hasTimeline = p.timeline && p.timeline.length > 0;
    const hasSources = p.sources && p.sources.length > 0;

    return `
        <div class="detail-tabs">
            <button class="detail-tab-btn active" onclick="switchTab(this, 'overview')">产品概述</button>
            <button class="detail-tab-btn" onclick="switchTab(this, 'tech')">技术架构</button>
            <button class="detail-tab-btn" onclick="switchTab(this, 'competition')">竞品分析</button>
            <button class="detail-tab-btn" onclick="switchTab(this, 'insights')">启示总结</button>
            <button class="detail-tab-btn" onclick="switchTab(this, 'metrics')">关键数据</button>
            <button class="detail-tab-btn" onclick="switchTab(this, 'timeline')">时间线</button>
            <button class="detail-tab-btn" onclick="switchTab(this, 'sources')">信息来源</button>
        </div>

        <div id="tab-overview" class="detail-tab-panel active">
            <div class="detail-desc">${t.overview.intro}</div>
            <div class="detail-section">
                <div class="detail-section-title">🔥 核心功能</div>
                <ul class="detail-list">${t.overview.features.map(f => `<li>${f}</li>`).join('')}</ul>
            </div>
        </div>

        <div id="tab-tech" class="detail-tab-panel">
            <div class="detail-desc">${t.tech.summary}</div>
            <div class="detail-section">
                <div class="detail-section-title">⚙️ 技术要点</div>
                <ul class="detail-list">${t.tech.points.map(pt => `<li>${pt}</li>`).join('')}</ul>
            </div>
        </div>

        <div id="tab-competition" class="detail-tab-panel">
            ${t.competition.summary ? `<div class="detail-desc">${t.competition.summary}</div>` : ''}
            ${t.competition.table && t.competition.table.length ? `
            <table class="competition-table">
                <thead>
                    <tr>
                        <th>产品类型</th>
                        <th>代表产品</th>
                        <th>核心能力</th>
                        <th>适用场景</th>
                        <th>局限性</th>
                    </tr>
                </thead>
                <tbody>
                    ${t.competition.table.map(row => `
                    <tr>
                        <td>${row.type}</td>
                        <td><strong>${row.name}</strong></td>
                        <td>${row.strength}</td>
                        <td>${row.scene}</td>
                        <td>${row.limit}</td>
                    </tr>`).join('')}
                </tbody>
            </table>` : ''}
        </div>

        <div id="tab-insights" class="detail-tab-panel">
            <div class="detail-section">
                <div class="detail-section-title">💡 产品启示</div>
                <ul class="detail-list insights">${t.insights.points.map(pt => `<li>${pt}</li>`).join('')}</ul>
            </div>
            ${t.insights.myTake ? `
            <div class="my-take">
                <div class="my-take-label">我的判断</div>
                <div class="my-take-text">${t.insights.myTake}</div>
            </div>` : ''}
        </div>

        <div id="tab-metrics" class="detail-tab-panel">
            ${hasMetrics ? `
            <div class="metrics-grid">
                ${p.keyMetrics.map(m => `
                <div class="metric-card">
                    <div class="metric-value">${m.value}</div>
                    <div class="metric-label">${m.label}</div>
                    <div class="metric-meta">
                        ${m.source ? `<span>${m.source}</span>` : ''}
                        ${m.date ? `<span>${m.date}</span>` : ''}
                        ${m.url ? `<a href="${m.url}" target="_blank" rel="noopener" class="metric-link">↗</a>` : ''}
                    </div>
                </div>`).join('')}
            </div>` : '<div class="tab-empty">📊 数据指标待补充</div>'}
        </div>

        <div id="tab-timeline" class="detail-tab-panel">
            ${hasTimeline ? `
            <div class="timeline">
                ${p.timeline.map(node => `
                <div class="timeline-node">
                    <div class="timeline-dot timeline-dot--${node.type}"></div>
                    <div class="timeline-content">
                        <div class="timeline-date">${node.date}</div>
                        <div class="timeline-event">${node.event}</div>
                        <span class="timeline-badge timeline-badge--${node.type}">${TIMELINE_TYPE_LABEL[node.type] || node.type}</span>
                    </div>
                </div>`).join('')}
            </div>` : '<div class="tab-empty">📅 产品时间线待补充</div>'}
        </div>

        <div id="tab-sources" class="detail-tab-panel">
            ${hasSources ? `
            <div class="sources-list">
                ${p.sources.map(s => `
                <div class="source-item">
                    <div class="source-main">
                        <span class="source-badge source-badge--${s.type}">${SOURCE_TYPE_LABEL[s.type] || s.type}</span>
                        ${s.url ? `<a href="${s.url}" target="_blank" rel="noopener" class="source-title">${s.title}</a>`
                                : `<span class="source-title source-title--nolink">${s.title}</span>`}
                    </div>
                    ${s.date ? `<div class="source-date">${s.date}</div>` : ''}
                </div>`).join('')}
            </div>` : '<div class="tab-empty">🔗 信息来源待补充</div>'}
        </div>
    `;
}

const TIMELINE_TYPE_LABEL = {
    launch: '发布',
    milestone: '里程碑',
    feature: '新功能',
    funding: '融资',
};

const SOURCE_TYPE_LABEL = {
    official: '官方',
    media: '媒体',
    report: '报告',
};

function switchTab(btn, tabId) {
    // 切换按钮状态
    btn.closest('.detail-tabs').querySelectorAll('.detail-tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    // 切换面板
    document.querySelectorAll('.detail-tab-panel').forEach(panel => panel.classList.remove('active'));
    document.getElementById('tab-' + tabId).classList.add('active');
}

function closeDetail(e) {
    if (e.target === document.getElementById('detailModal')) {
        closeDetailDirect();
    }
}

function closeDetailDirect() {
    document.getElementById('detailModal').classList.add('hidden');
    document.body.style.overflow = '';
}

// Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeDetailDirect();
});

// ---- INIT ----
loadProducts();
