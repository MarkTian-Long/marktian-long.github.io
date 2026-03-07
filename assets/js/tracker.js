/* =============================================
   TRACKER.JS - 求职进度追踪器
   ============================================= */

const STATUS_LABELS = {
    submitted: { label: '已投递', cls: 'status-submitted' },
    test: { label: '笔试中', cls: 'status-test' },
    interview: { label: '面试中', cls: 'status-interview' },
    offer: { label: '🎉 Offer', cls: 'status-offer' },
    rejected: { label: '已结束', cls: 'status-rejected' },
};

const STORAGE_KEY = 'qiuzhi_tracker_v1';

let applications = [];

// Load from localStorage
function loadApps() {
    try {
        applications = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    } catch {
        applications = [];
    }
}

function saveApps() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(applications));
}

function addApplication() {
    document.getElementById('inputCompany').value = '';
    document.getElementById('inputPosition').value = '';
    document.getElementById('inputStatus').value = 'submitted';
    document.getElementById('inputNote').value = '';
    document.getElementById('appModal').classList.remove('hidden');
}

function closeModal() {
    document.getElementById('appModal').classList.add('hidden');
}

function saveApplication() {
    const company = document.getElementById('inputCompany').value.trim();
    const position = document.getElementById('inputPosition').value.trim();
    const status = document.getElementById('inputStatus').value;
    const note = document.getElementById('inputNote').value.trim();

    if (!company || !position) {
        document.getElementById('inputCompany').style.borderColor = company ? '' : '#ef4444';
        document.getElementById('inputPosition').style.borderColor = position ? '' : '#ef4444';
        return;
    }

    applications.unshift({
        id: Date.now(),
        company,
        position,
        status,
        note,
        date: new Date().toLocaleDateString('zh-CN'),
    });

    saveApps();
    closeModal();
    renderTracker();
}

function deleteApp(id) {
    applications = applications.filter(a => a.id !== id);
    saveApps();
    renderTracker();
}

function renderTracker() {
    const list = document.getElementById('trackerList');
    const empty = document.getElementById('trackerEmpty');

    if (!list) return;

    // Stats
    const counts = { total: applications.length, interview: 0, offer: 0, rejected: 0 };
    applications.forEach(a => {
        if (a.status === 'interview') counts.interview++;
        if (a.status === 'offer') counts.offer++;
        if (a.status === 'rejected') counts.rejected++;
    });

    const el = id => document.getElementById(id);
    if (el('countTotal')) el('countTotal').textContent = counts.total;
    if (el('countInterview')) el('countInterview').textContent = counts.interview;
    if (el('countOffer')) el('countOffer').textContent = counts.offer;
    if (el('countRejected')) el('countRejected').textContent = counts.rejected;

    if (applications.length === 0) {
        list.innerHTML = '';
        if (empty) {
            empty.style.display = 'block';
            list.appendChild(empty);
        }
        return;
    }

    if (empty) empty.style.display = 'none';

    list.innerHTML = applications.map(a => {
        const s = STATUS_LABELS[a.status] || STATUS_LABELS.submitted;
        return `
      <div class="tracker-item" id="item-${a.id}">
        <div class="tracker-item-info">
          <div class="tracker-company">${escapeHtml(a.company)}</div>
          <div class="tracker-position">${escapeHtml(a.position)}</div>
          ${a.note ? `<div class="tracker-note">📝 ${escapeHtml(a.note)}</div>` : ''}
        </div>
        <div class="tracker-date" style="font-size:0.75rem;color:var(--text-muted);flex-shrink:0">${a.date}</div>
        <span class="tracker-status ${s.cls}">${s.label}</span>
        <button class="tracker-delete" onclick="deleteApp(${a.id})" title="删除">✕</button>
      </div>
    `;
    }).join('');
}

function escapeHtml(str) {
    const div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
}

// Close modal on overlay click
document.addEventListener('click', (e) => {
    const modal = document.getElementById('appModal');
    if (modal && e.target === modal) closeModal();
});

// Init
loadApps();
document.addEventListener('DOMContentLoaded', () => {
    renderTracker();
});
