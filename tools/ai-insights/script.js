'use strict';

const DATA_URL = 'data/products.json';
const TAB_IDS = ['summary', 'mechanism', 'tradeoffs', 'evidence', 'evolution'];
const TAB_LABELS = {
    summary: '决策摘要',
    mechanism: '产品机制',
    tradeoffs: '竞争取舍',
    evidence: '证据账本',
    evolution: '演化与边界',
};
const VALID_METRIC_KINDS = new Set(['target', 'proxy', 'offline-measured', 'production-result', 'external-research']);
const THEME_LABELS = {
    distribution: '分发',
    workflow: '工作流',
    trust: '信任',
    creation: '创作',
    community: '社区',
    cost: '成本',
    openness: '开放',
    ecosystem: '生态',
    enterprise: '企业',
    autonomy: '自主性',
    control: '控制',
    context: '上下文',
    retrieval: '检索',
    safety: '安全',
};
const STATUS_LABELS = {
    current: '维护中',
    due: '待复核',
    historical: '历史档案',
};
const STATUS_DESCRIPTIONS = {
    current: '在维护周期内',
    due: '已超过计划复核日期',
    historical: '产品状态已发生变化',
};

const state = {
    products: [],
    category: 'all',
    theme: 'all',
    activeProductId: null,
    activeTab: 'summary',
    lastFocused: null,
    loading: true,
};

const elements = {
    productGrid: document.getElementById('productGrid'),
    loadingState: document.getElementById('loadingState'),
    emptyState: document.getElementById('emptyState'),
    productCount: document.getElementById('productCount'),
    categoryFilters: document.getElementById('categoryFilters'),
    themeFilters: document.getElementById('themeFilters'),
    filterSummary: document.getElementById('filterSummary'),
    clearFilters: document.getElementById('clearFilters'),
    loadError: document.getElementById('loadError'),
    loadErrorMessage: document.getElementById('loadErrorMessage'),
    partialLoadNotice: document.getElementById('partialLoadNotice'),
    partialLoadMessage: document.getElementById('partialLoadMessage'),
    retryLoad: document.getElementById('retryLoad'),
    deepLinkNotice: document.getElementById('deepLinkNotice'),
    detailModal: document.getElementById('detailModal'),
    detailContent: document.getElementById('detailContent'),
    detailClose: document.getElementById('detailClose'),
};

function createElement(tagName, className, ...children) {
    const element = document.createElement(tagName);
    if (className) element.className = className;
    for (const child of children) {
        if (child === undefined || child === null) continue;
        if (child instanceof Node) {
            element.append(child);
        } else {
            element.append(document.createTextNode(String(child)));
        }
    }
    return element;
}

function append(parent, ...children) {
    for (const child of children) {
        if (child) parent.append(child);
    }
    return parent;
}

function clear(element) {
    while (element.firstChild) element.removeChild(element.firstChild);
}

function setHidden(element, hidden) {
    element.hidden = hidden;
    element.classList.toggle('hidden', hidden);
}

function isObject(value) {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function isHttps(url) {
    return typeof url === 'string' && /^https:\/\/[^\s]+$/i.test(url);
}

function isIsoDate(value) {
    return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(`${value}T00:00:00Z`));
}

function isNonEmptyString(value) {
    return typeof value === 'string' && value.trim().length > 0;
}

function isValidProduct(product) {
    if (!isObject(product) || !product.id || !product.name || !product.category) return false;
    if (!isIsoDate(product.reviewedAt) || !isIsoDate(product.reviewDueAt)) return false;
    if (!isNonEmptyString(product.detailLink) || !isHttps(product.detailLink)) return false;
    if (!isObject(product.thesis) || !isNonEmptyString(product.thesis.text) || !Array.isArray(product.thesis.evidenceRefs)) return false;
    if (!Array.isArray(product.decisionThemes) || product.decisionThemes.length < 3) return false;
    if (!Array.isArray(product.decisions) || product.decisions.length < 3) return false;
    if (!Array.isArray(product.uncertainties) || product.uncertainties.length < 2) return false;
    if (!Array.isArray(product.sources) || product.sources.length < 2) return false;
    if (!Array.isArray(product.keyMetrics) || !product.keyMetrics.length) return false;
    if (!isObject(product.tabs) || TAB_IDS.some(tabId => !isObject(product.tabs[tabId]))) return false;

    const sourceIds = new Set();
    for (const source of product.sources) {
        if (!source || !isNonEmptyString(source.id) || sourceIds.has(source.id) || !isNonEmptyString(source.title) || !isIsoDate(source.date) || !isHttps(source.url)) return false;
        sourceIds.add(source.id);
    }
    const refsResolve = refs => Array.isArray(refs) && refs.length > 0 && refs.every(ref => sourceIds.has(ref));
    if (!refsResolve(product.thesis.evidenceRefs)) return false;
    if (product.decisions.some(decision => !decision || !isNonEmptyString(decision.id) || !isNonEmptyString(decision.title) || !isNonEmptyString(decision.choice) || !isNonEmptyString(decision.why) || !isNonEmptyString(decision.tradeoff) || !refsResolve(decision.evidenceRefs))) return false;
    if (product.uncertainties.some(uncertainty => !uncertainty || !isNonEmptyString(uncertainty.question) || !['open', 'watch', 'bounded'].includes(uncertainty.status) || !isNonEmptyString(uncertainty.note) || !Array.isArray(uncertainty.evidenceRefs) || uncertainty.evidenceRefs.some(ref => !sourceIds.has(ref)))) return false;
    if (product.keyMetrics.some(metric => !metric || !isNonEmptyString(metric.id) || !isNonEmptyString(metric.label) || !isNonEmptyString(metric.value) || !isNonEmptyString(metric.definition) || !VALID_METRIC_KINDS.has(metric.kind) || !isIsoDate(metric.asOf) || !refsResolve(metric.sourceRefs) || !isNonEmptyString(metric.caveat))) return false;

    const summary = product.tabs.summary;
    const mechanism = product.tabs.mechanism;
    const tradeoffs = product.tabs.tradeoffs;
    const evidence = product.tabs.evidence;
    const evolution = product.tabs.evolution;
    if (!isNonEmptyString(summary.problem) || !isNonEmptyString(summary.whyAi) || !isNonEmptyString(summary.humanRole) || !Array.isArray(summary.decisionIds)) return false;
    if (!isNonEmptyString(mechanism.summary) || !Array.isArray(mechanism.system) || !mechanism.system.every(isNonEmptyString) || !isNonEmptyString(mechanism.humanRole) || !Array.isArray(mechanism.failureModes) || !mechanism.failureModes.every(isNonEmptyString)) return false;
    if (!isNonEmptyString(tradeoffs.summary) || !Array.isArray(tradeoffs.rows) || tradeoffs.rows.length < 1 || tradeoffs.rows.some(row => !row || !isNonEmptyString(row.decision) || !isNonEmptyString(row.gain) || !isNonEmptyString(row.cost) || !isNonEmptyString(row.boundary))) return false;
    if (!isNonEmptyString(evidence.summary) || !Array.isArray(evidence.metricIds) || !isNonEmptyString(evidence.missing)) return false;
    if (!isNonEmptyString(evolution.summary) || !Array.isArray(evolution.timeline) || evolution.timeline.length < 1 || !isNonEmptyString(evolution.migrationBoundary) || !isNonEmptyString(evolution.counterEvidence)) return false;
    if (evolution.timeline.some(event => !event || !isIsoDate(event.date) || !isNonEmptyString(event.event) || !isNonEmptyString(event.type) || !refsResolve(event.evidenceRefs))) return false;
    return true;
}

function sourceMap(product) {
    return new Map(product.sources.map(source => [source.id, source]));
}

function sourceCount(product) {
    const refs = new Set(product.thesis.evidenceRefs);
    product.decisions.forEach(decision => decision.evidenceRefs.forEach(ref => refs.add(ref)));
    product.keyMetrics.forEach(metric => metric.sourceRefs.forEach(ref => refs.add(ref)));
    return refs.size;
}

function formatDate(date) {
    return String(date || '').replaceAll('-', '.');
}

function todayIso() {
    return new Date().toISOString().slice(0, 10);
}

function reviewState(product) {
    if (product.lifecycle === 'historical') return { key: 'historical', label: STATUS_LABELS.historical, detail: STATUS_DESCRIPTIONS.historical };
    if (product.reviewDueAt < todayIso()) return { key: 'due', label: STATUS_LABELS.due, detail: STATUS_DESCRIPTIONS.due };
    return { key: 'current', label: STATUS_LABELS.current, detail: STATUS_DESCRIPTIONS.current };
}

function themeLabel(theme) {
    return THEME_LABELS[theme] || theme;
}

function typeLabel(kind) {
    return {
        target: '目标',
        proxy: '代理指标',
        'offline-measured': '离线测量',
        'production-result': '生产结果',
        'external-research': '外部研究',
    }[kind] || kind;
}

function renderFilterGroup(container, values, active, group, allLabel) {
    clear(container);
    const options = ['all', ...values];
    options.forEach(value => {
        const label = value === 'all' ? allLabel : group === 'theme' ? themeLabel(value) : value;
        const button = createElement('button', 'filter-option', label);
        button.type = 'button';
        button.dataset.filterGroup = group;
        button.dataset.value = value;
        button.setAttribute('aria-pressed', String(value === active));
        button.classList.toggle('is-active', value === active);
        button.addEventListener('click', () => {
            if (group === 'category') state.category = value;
            else state.theme = value;
            renderFilters();
            renderGrid();
        });
        container.append(button);
    });
}

function renderFilters() {
    const categories = [...new Set(state.products.map(product => product.category))].sort();
    const themes = [...new Set(state.products.flatMap(product => product.decisionThemes))]
        .filter(theme => THEME_LABELS[theme])
        .sort((a, b) => themeLabel(a).localeCompare(themeLabel(b), 'zh-CN'));
    renderFilterGroup(elements.categoryFilters, categories, state.category, 'category', '全部类别');
    renderFilterGroup(elements.themeFilters, themes, state.theme, 'theme', '全部主题');
    const labels = [];
    if (state.category !== 'all') labels.push(state.category);
    if (state.theme !== 'all') labels.push(themeLabel(state.theme));
    elements.filterSummary.textContent = labels.length ? `当前：${labels.join(' · ')}` : '显示全部档案';
    elements.clearFilters.disabled = state.category === 'all' && state.theme === 'all';
}

function filteredProducts() {
    return state.products.filter(product => {
        const categoryMatches = state.category === 'all' || product.category === state.category;
        const themeMatches = state.theme === 'all' || product.decisionThemes.includes(state.theme);
        return categoryMatches && themeMatches;
    });
}

function makeBadge(text, className = '') {
    return createElement('span', `badge ${className}`.trim(), text);
}

function createCard(product) {
    const card = createElement('article', 'product-card');
    card.dataset.productId = product.id;
    card.dataset.category = product.category;
    const review = reviewState(product);
    const open = createElement('button', 'product-open');
    open.type = 'button';
    open.id = `product-card-${product.id}`;
    open.setAttribute('aria-label', `打开 ${product.name} 研究档案`);
    open.addEventListener('click', () => openDetail(product.id, open));

    const top = createElement('div', 'card-topline');
    append(top,
        createElement('span', 'product-mark', product.logo || product.name.slice(0, 1)),
        makeBadge(review.label, `status-${review.key}`));
    const identity = createElement('div', 'card-identity');
    append(identity, createElement('h3', 'card-name', product.name), createElement('p', 'card-company', product.company));
    const thesis = createElement('p', 'card-thesis', product.thesis.text);
    const tags = createElement('div', 'card-tags');
    append(tags, makeBadge(product.category, 'category-badge'));
    product.decisionThemes.slice(0, 2).forEach(theme => tags.append(makeBadge(themeLabel(theme), 'theme-badge')));
    const evidence = createElement('span', 'evidence-count', `${sourceCount(product)} 条来源`);
    const footer = createElement('div', 'card-footer');
    append(footer,
        createElement('span', 'review-date', `复核 ${formatDate(product.reviewedAt)}`),
        createElement('span', 'card-cta', '打开档案 ↗'));
    append(open, top, identity, thesis, tags, evidence, footer);
    card.append(open);
    if (product.lifecycle === 'historical') {
        const historical = createElement('p', 'card-warning', '历史状态：不作为当前选型推荐');
        card.append(historical);
    }
    return card;
}

function renderGrid() {
    elements.productGrid.querySelectorAll('.product-card').forEach(card => card.remove());
    setHidden(elements.loadingState, !state.loading);
    setHidden(elements.emptyState, true);
    if (state.loading) return;
    const visible = filteredProducts();
    if (!visible.length) {
        setHidden(elements.emptyState, false);
        return;
    }
    visible.forEach(product => elements.productGrid.insertBefore(createCard(product), elements.emptyState));
}

function showLoadError(error) {
    state.products = [];
    state.loading = false;
    renderFilters();
    renderGrid();
    setHidden(elements.partialLoadNotice, true);
    setHidden(elements.loadError, false);
    setHidden(elements.retryLoad, false);
    let message = '加载失败：研究档案暂时不可用，请重试。';
    if (window.location.protocol === 'file:') {
        message = '加载失败：直接打开 file:// 会阻止 JSON 请求，请在仓库根目录启动本地 HTTP 服务。';
    } else if (error?.code === 'not-found') {
        message = '加载失败：找不到研究档案数据文件，请确认 data/products.json 存在。';
    } else if (error?.code === 'invalid-json') {
        message = '加载失败：研究档案 JSON 格式无法解析，请修复数据后重试。';
    } else if (error?.code === 'no-valid-records') {
        message = '加载失败：没有可展示的有效档案，数据记录需要满足研究契约。';
    }
    elements.loadErrorMessage.textContent = message;
    elements.productCount.textContent = '暂不可用';
}

async function loadProducts() {
    state.loading = true;
    setHidden(elements.loadError, true);
    setHidden(elements.partialLoadNotice, true);
    setHidden(elements.retryLoad, true);
    renderGrid();
    try {
        const response = await fetch(DATA_URL, { cache: 'no-store' });
        if (!response.ok) {
            const error = new Error(`HTTP ${response.status}`);
            error.code = response.status === 404 ? 'not-found' : 'request-failed';
            throw error;
        }
        let payload;
        try {
            payload = await response.json();
        } catch (error) {
            error.code = 'invalid-json';
            throw error;
        }
        if (!Array.isArray(payload)) {
            const error = new Error('Expected an array');
            error.code = 'invalid-json';
            throw error;
        }
        const valid = payload.filter(isValidProduct);
        if (!valid.length) {
            const error = new Error('No valid records');
            error.code = 'no-valid-records';
            throw error;
        }
        state.products = valid;
        state.loading = false;
        renderFilters();
        renderGrid();
        elements.productCount.textContent = `${valid.length} 份档案`;
        if (valid.length !== payload.length) {
            setHidden(elements.partialLoadNotice, false);
            setHidden(elements.retryLoad, false);
            elements.partialLoadMessage.textContent = `已保留 ${valid.length} 份档案，跳过 ${payload.length - valid.length} 条无效记录。`;
        }
        handleDeepLink();
    } catch (error) {
        console.error('[ai-insights] load failed', error);
        showLoadError(error);
    }
}

function makeSectionTitle(kicker, title) {
    const heading = createElement('div', 'detail-section-heading');
    append(heading, createElement('span', 'section-eyebrow', kicker), createElement('h3', '', title));
    return heading;
}

function makeTextBlock(label, text, className = 'detail-copy') {
    const block = createElement('div', className);
    append(block, createElement('span', 'detail-label', label), createElement('p', '', text));
    return block;
}

function makeList(items, className = 'detail-list') {
    const list = createElement('ul', className);
    (items || []).forEach(item => list.append(createElement('li', '', item)));
    return list;
}

function makeEvidenceRefs(product, refs) {
    const map = sourceMap(product);
    const wrapper = createElement('div', 'evidence-refs');
    if (!refs || !refs.length) {
        wrapper.append(makeBadge('暂无直接来源', 'missing-badge'));
        return wrapper;
    }
    refs.forEach(ref => {
        const source = map.get(ref);
        if (!source || !isHttps(source.url)) {
            wrapper.append(makeBadge(`来源缺失：${ref}`, 'missing-badge'));
            return;
        }
        const link = createElement('a', 'source-link', source.title);
        link.href = source.url;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.title = `打开来源：${source.title}`;
        wrapper.append(link);
    });
    return wrapper;
}

function renderSummaryPanel(product) {
    const panel = createElement('section', 'detail-panel');
    panel.append(makeSectionTitle('01 / 判断', '先看结论，再看取舍'));
    const thesis = createElement('div', 'thesis-callout');
    append(thesis, createElement('span', 'detail-label', '我的判断'), createElement('p', '', product.thesis.text), makeEvidenceRefs(product, product.thesis.evidenceRefs));
    const grid = createElement('div', 'summary-grid');
    append(grid,
        makeTextBlock('问题', product.tabs.summary.problem),
        makeTextBlock('为什么需要 AI', product.tabs.summary.whyAi),
        makeTextBlock('人必须保留的判断', product.tabs.summary.humanRole));
    const decisions = createElement('div', 'decision-preview');
    decisions.append(createElement('span', 'detail-label', '三项关键决策'));
    product.decisions.forEach((decision, index) => {
        const item = createElement('div', 'decision-preview-item');
        append(item, createElement('span', 'decision-number', `0${index + 1}`), createElement('div', '', createElement('strong', '', decision.title), createElement('p', '', decision.choice)));
        decisions.append(item);
    });
    append(panel, thesis, grid, decisions);
    return panel;
}

function renderMechanismPanel(product) {
    const panel = createElement('section', 'detail-panel');
    panel.append(makeSectionTitle('02 / 系统', '产品机制如何运转'));
    panel.append(createElement('p', 'detail-lead', product.tabs.mechanism.summary));
    const mechanismGrid = createElement('div', 'mechanism-grid');
    append(mechanismGrid,
        makeTextBlock('系统承担', '', 'mechanism-block'),
        makeTextBlock('人承担', product.tabs.mechanism.humanRole, 'mechanism-block'),
        makeTextBlock('失败路径', '', 'mechanism-block'));
    mechanismGrid.children[0].append(makeList(product.tabs.mechanism.system));
    mechanismGrid.children[2].append(makeList(product.tabs.mechanism.failureModes, 'failure-list'));
    panel.append(mechanismGrid);
    return panel;
}

function renderTradeoffsPanel(product) {
    const panel = createElement('section', 'detail-panel');
    panel.append(makeSectionTitle('03 / 取舍', '每个优势都带着代价'));
    panel.append(createElement('p', 'detail-lead', product.tabs.tradeoffs.summary));
    const list = createElement('div', 'tradeoff-list');
    product.tabs.tradeoffs.rows.forEach(row => {
        const item = createElement('article', 'tradeoff-row');
        append(item,
            createElement('h3', 'tradeoff-title', row.decision),
            makeTextBlock('得到', row.gain, 'tradeoff-cell'),
            makeTextBlock('付出', row.cost, 'tradeoff-cell'),
            makeTextBlock('边界', row.boundary, 'tradeoff-cell'));
        list.append(item);
    });
    panel.append(list);
    return panel;
}

function renderMetric(product, metric) {
    const item = createElement('article', 'metric-card');
    const head = createElement('div', 'metric-head');
    append(head, createElement('span', 'metric-label', metric.label), makeBadge(typeLabel(metric.kind), 'metric-kind'));
    append(item,
        head,
        createElement('strong', 'metric-value', metric.value),
        makeTextBlock('定义', metric.definition, 'metric-copy'),
        makeTextBlock(`截至 ${formatDate(metric.asOf)}`, metric.caveat, 'metric-copy'),
        makeEvidenceRefs(product, metric.sourceRefs));
    return item;
}

function renderEvidencePanel(product) {
    const panel = createElement('section', 'detail-panel');
    panel.append(makeSectionTitle('04 / 证据', '哪些话有来源，哪些还没有'));
    panel.append(createElement('p', 'detail-lead', product.tabs.evidence.summary));
    const metrics = createElement('div', 'metrics-list');
    const metricIds = new Set(product.tabs.evidence.metricIds || []);
    product.keyMetrics.filter(metric => !metricIds.size || metricIds.has(metric.id)).forEach(metric => metrics.append(renderMetric(product, metric)));
    panel.append(metrics);
    const missing = createElement('div', 'boundary-callout boundary-callout--muted');
    append(missing, createElement('span', 'detail-label', '缺失与限制'), createElement('p', '', product.tabs.evidence.missing));
    panel.append(missing);
    const sources = createElement('div', 'source-ledger');
    sources.append(createElement('span', 'detail-label', `来源账本 · ${product.sources.length} 条`));
    product.sources.forEach(source => {
        const row = createElement('div', 'source-row');
        const link = createElement('a', 'source-link', source.title);
        link.href = source.url;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        append(row, link, createElement('span', 'source-date', `${source.type} · ${formatDate(source.date)}`));
        sources.append(row);
    });
    panel.append(sources);
    return panel;
}

function renderEvolutionPanel(product) {
    const panel = createElement('section', 'detail-panel');
    panel.append(makeSectionTitle('05 / 边界', '演化、反证与下一次复核'));
    panel.append(createElement('p', 'detail-lead', product.tabs.evolution.summary));
    const timeline = createElement('div', 'timeline');
    product.tabs.evolution.timeline.forEach(event => {
        const item = createElement('div', 'timeline-item');
        append(item,
            createElement('span', 'timeline-date', formatDate(event.date)),
            createElement('div', 'timeline-event', createElement('strong', '', event.type), createElement('p', '', event.event), makeEvidenceRefs(product, event.evidenceRefs)));
        timeline.append(item);
    });
    const boundary = createElement('div', 'boundary-grid');
    const migration = createElement('div', 'boundary-callout');
    append(migration, createElement('span', 'detail-label', '迁移边界'), createElement('p', '', product.tabs.evolution.migrationBoundary));
    const counter = createElement('div', 'boundary-callout boundary-callout--warning');
    append(counter, createElement('span', 'detail-label', '反证 / 不要过度推断'), createElement('p', '', product.tabs.evolution.counterEvidence));
    append(boundary, migration, counter);
    const uncertainties = createElement('div', 'uncertainty-list');
    uncertainties.append(createElement('span', 'detail-label', '待复核问题'));
    product.uncertainties.forEach(uncertainty => {
        const item = createElement('article', 'uncertainty-item');
        append(item, makeBadge(uncertainty.status === 'open' ? '开放问题' : uncertainty.status === 'watch' ? '持续观察' : '边界明确', `uncertainty-${uncertainty.status}`), createElement('h3', '', uncertainty.question), createElement('p', '', uncertainty.note), makeEvidenceRefs(product, uncertainty.evidenceRefs));
        uncertainties.append(item);
    });
    append(panel, timeline, boundary, uncertainties);
    return panel;
}

function renderDetail(product) {
    clear(elements.detailContent);
    const review = reviewState(product);
    const header = createElement('div', 'detail-header');
    const identity = createElement('div', 'detail-identity');
    append(identity, createElement('span', 'product-mark product-mark--large', product.logo || product.name.slice(0, 1)), createElement('div', '', createElement('span', 'detail-eyebrow', product.category), createElement('h2', '', product.name), createElement('p', '', product.company)));
    const meta = createElement('div', 'detail-status');
    append(meta, makeBadge(review.label, `status-${review.key}`), createElement('span', '', review.detail));
    header.append(identity, meta);
    const summary = createElement('p', 'detail-summary', product.thesis.text);
    summary.id = 'detailSummary';
    const metaLine = createElement('div', 'detail-meta-line');
    append(metaLine,
        createElement('span', '', `最近复核 ${formatDate(product.reviewedAt)}`),
        createElement('span', '', `计划复核 ${formatDate(product.reviewDueAt)}`),
        createElement('span', '', `${sourceCount(product)} 条来源`));
    if (product.detailLink && isHttps(product.detailLink)) {
        const link = createElement('a', 'official-link', product.lifecycle === 'historical' ? '官方状态说明 ↗' : '打开官方页面 ↗');
        link.href = product.detailLink;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        metaLine.append(link);
    }
    const tabs = createElement('div', 'detail-tabs');
    tabs.setAttribute('role', 'tablist');
    tabs.setAttribute('aria-label', '产品档案分区');
    TAB_IDS.forEach(tabId => {
        const button = createElement('button', 'detail-tab', TAB_LABELS[tabId]);
        button.type = 'button';
        button.id = `tab-button-${tabId}`;
        button.dataset.tab = tabId;
        button.setAttribute('role', 'tab');
        button.setAttribute('aria-controls', `tab-${tabId}`);
        button.addEventListener('click', () => switchTab(tabId, true));
        tabs.append(button);
    });
    const panels = [renderSummaryPanel(product), renderMechanismPanel(product), renderTradeoffsPanel(product), renderEvidencePanel(product), renderEvolutionPanel(product)];
    panels.forEach((panel, index) => {
        const tabId = TAB_IDS[index];
        panel.id = `tab-${tabId}`;
        panel.setAttribute('role', 'tabpanel');
        panel.setAttribute('aria-labelledby', `tab-button-${tabId}`);
        panel.tabIndex = 0;
        panel.hidden = tabId !== state.activeTab;
        panel.classList.toggle('is-active', tabId === state.activeTab);
    });
    const closeHint = createElement('p', 'detail-hint', '方向键切换分区 · Tab 在档案内移动 · Esc 关闭');
    const archiveMark = createElement('span', 'archive-mark', product.lifecycle === 'historical' ? 'HISTORICAL SNAPSHOT' : 'RESEARCH SNAPSHOT');
    const detailTitle = identity.querySelector('h2');
    detailTitle.id = 'detailTitle';
    append(elements.detailContent, header, summary, metaLine, tabs, ...panels, closeHint, archiveMark);
}

function switchTab(tabId, focus) {
    if (!TAB_IDS.includes(tabId)) return;
    state.activeTab = tabId;
    document.querySelectorAll('.detail-tab').forEach(button => {
        const selected = button.dataset.tab === tabId;
        button.setAttribute('aria-selected', String(selected));
        button.tabIndex = selected ? 0 : -1;
        button.classList.toggle('is-active', selected);
    });
    TAB_IDS.forEach(id => {
        const panel = document.getElementById(`tab-${id}`);
        if (!panel) return;
        panel.hidden = id !== tabId;
        panel.classList.toggle('is-active', id === tabId);
    });
    if (focus) document.getElementById(`tab-button-${tabId}`)?.focus();
}

function openDetail(id, trigger, tabId = 'summary') {
    const product = state.products.find(item => item.id === id);
    if (!product) return;
    state.activeProductId = id;
    state.activeTab = TAB_IDS.includes(tabId) ? tabId : 'summary';
    state.lastFocused = trigger || document.activeElement;
    renderDetail(product);
    elements.detailModal.dataset.productId = id;
    elements.detailModal.setAttribute('aria-hidden', 'false');
    setHidden(elements.detailModal, false);
    document.body.classList.add('modal-open');
    switchTab(state.activeTab, false);
    requestAnimationFrame(() => elements.detailClose.focus());
}

function closeDetail() {
    setHidden(elements.detailModal, true);
    elements.detailModal.setAttribute('aria-hidden', 'true');
    elements.detailModal.removeAttribute('data-product-id');
    document.body.classList.remove('modal-open');
    const restore = state.lastFocused;
    state.activeProductId = null;
    state.lastFocused = null;
    if (restore && restore.isConnected) restore.focus();
}

function focusableInModal() {
    return [...elements.detailModal.querySelectorAll('button, a[href], [tabindex]:not([tabindex="-1"])')]
        .filter(element => !element.disabled && !element.hidden && element.offsetParent !== null);
}

function handleModalKeyboard(event) {
    if (elements.detailModal.classList.contains('hidden')) return;
    if (event.key === 'Escape') {
        event.preventDefault();
        closeDetail();
        return;
    }
    if (event.key === 'Tab') {
        const focusable = focusableInModal();
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first.focus();
        }
        return;
    }
    if (['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
        const current = TAB_IDS.indexOf(state.activeTab);
        let next = current;
        if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = (current + 1) % TAB_IDS.length;
        if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = (current - 1 + TAB_IDS.length) % TAB_IDS.length;
        if (event.key === 'Home') next = 0;
        if (event.key === 'End') next = TAB_IDS.length - 1;
        event.preventDefault();
        switchTab(TAB_IDS[next], true);
    }
}

function handleDeepLink() {
    const params = new URLSearchParams(window.location.search);
    const productId = params.get('product');
    const requestedTab = params.get('tab');
    setHidden(elements.deepLinkNotice, true);
    if (!productId && !requestedTab) return;
    if (!productId) {
        elements.deepLinkNotice.textContent = '无法打开详情：URL 缺少 product 参数，已保留档案列表。';
        setHidden(elements.deepLinkNotice, false);
        return;
    }
    const product = state.products.find(item => item.id === productId);
    if (!product) {
        elements.deepLinkNotice.textContent = `无法打开产品档案“${productId}”：未找到对应记录。`;
        setHidden(elements.deepLinkNotice, false);
        return;
    }
    if (requestedTab && !TAB_IDS.includes(requestedTab)) {
        elements.deepLinkNotice.textContent = `未识别详情分区“${requestedTab}”，已打开 ${product.name} 的决策摘要。`;
        setHidden(elements.deepLinkNotice, false);
    }
    openDetail(productId, null, requestedTab || 'summary');
}

elements.clearFilters.addEventListener('click', () => {
    state.category = 'all';
    state.theme = 'all';
    renderFilters();
    renderGrid();
});
elements.retryLoad.addEventListener('click', loadProducts);
elements.detailClose.addEventListener('click', closeDetail);
elements.detailModal.addEventListener('click', event => {
    if (event.target === elements.detailModal) closeDetail();
});
document.addEventListener('keydown', handleModalKeyboard);

loadProducts();
