/* =============================================
   AI INSIGHTS - SCRIPT
   Loads products.json √ Render cards √ Filter √ Detail modal
   ============================================= */

let products = [];
let currentFilter = 'all';

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
        const stars = '★'.repeat(p.stars) + '☆'.repeat(5 - p.stars);
        const grad = CARD_GRADS[i % CARD_GRADS.length];

        return `
      <div class="product-card" style="--card-grad: ${grad}; animation-delay: ${i * 0.06}s"
           onclick="showDetail('${p.id}')">
        <div class="card-top">
          <span class="card-logo">${p.logo}</span>
          <span class="card-trend ${trend.cls}">${trend.label}</span>
        </div>
        <div class="card-name">${p.name}</div>
        <div class="card-company">${p.company}</div>
        <div class="card-tagline">${p.tagline}</div>
        <div class="card-desc">${p.description}</div>
        <div class="card-tags">
          <span class="card-category">${p.category}</span>
          ${p.techStack.slice(0, 3).map(t => `<span class="card-tag">${t}</span>`).join('')}
        </div>
        <div class="card-footer">
          <span class="card-stars">${stars}</span>
          <span class="card-cta">查看分析 →</span>
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
    const stars = '★'.repeat(p.stars) + '☆'.repeat(5 - p.stars);

    const content = document.getElementById('detailContent');
    content.innerHTML = `
    <div class="detail-header">
      <span class="detail-logo">${p.logo}</span>
      <div>
        <div class="detail-name">${p.name}</div>
        <div class="detail-company">${p.company} · ${stars}</div>
      </div>
    </div>
    <div class="detail-tagline">${p.tagline}</div>
    <div class="detail-desc">${p.description}</div>

    <div class="detail-meta">
      <div class="detail-meta-item">
        <span class="detail-meta-label">分类</span>${p.category}
      </div>
      <div class="detail-meta-item">
        <span class="detail-meta-label">商业模式</span>${p.businessModel}
      </div>
      <div class="detail-meta-item">
        <span class="detail-meta-label">上线时间</span>${p.launchDate}
      </div>
      <div class="detail-meta-item">
        <span class="detail-meta-label">趋势</span>${trend.label}
      </div>
    </div>

    <div class="detail-section">
      <div class="detail-section-title">🔥 核心亮点</div>
      <ul class="detail-list">
        ${p.highlights.map(h => `<li>${h}</li>`).join('')}
      </ul>
    </div>

    <div class="detail-section">
      <div class="detail-section-title">💡 PM 视角洞察</div>
      <ul class="detail-list insights">
        ${p.pmInsights.map(i => `<li>${i}</li>`).join('')}
      </ul>
    </div>

    <div class="detail-section">
      <div class="detail-section-title">🛠 技术关键词</div>
      <div class="card-tags" style="margin-top:8px">
        ${p.techStack.map(t => `<span class="card-tag">${t}</span>`).join('')}
      </div>
    </div>

    <button class="detail-close" onclick="closeDetailDirect()">关闭</button>
  `;

    document.getElementById('detailModal').classList.remove('hidden');
    document.body.style.overflow = 'hidden';
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
