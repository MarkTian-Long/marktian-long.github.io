(function initTrendsApp(root) {
    'use strict';

    const contract = root.TrendsContract;
    const state = { data: null, activeBoardId: null, action: 'all', view: 'signals' };
    const actionLabels = { watch: '持续关注', compare: '横向对比', adopt: '评估落地', deep_dive: '继续深挖' };
    const elements = {};

    function get(id) {
        return document.getElementById(id);
    }

    function make(tag, className, value) {
        const node = document.createElement(tag);
        if (className) node.className = className;
        if (value !== undefined && value !== null) node.textContent = String(value);
        return node;
    }

    function append(parent, ...children) {
        children.filter(Boolean).forEach(child => parent.append(child));
        return parent;
    }

    function formatDate(value) {
        return value ? String(value) : '—';
    }

    function sourceName(sourceId) {
        const board = state.data.boards.find(entry => entry.source && entry.source.id === sourceId);
        return board ? board.source.name : sourceId;
    }

    function setState(name) {
        elements.app.dataset.state = name;
        elements.loading.hidden = name !== 'loading';
        elements.error.hidden = name !== 'error';
        elements.content.hidden = name !== 'ready';
    }

    function renderMeta(validation) {
        const freshness = validation.freshness;
        elements.status.className = `status-chip ${freshness ? freshness.status : ''}`;
        elements.status.textContent = freshness ? freshness.label : '状态未知';
        elements.verification.textContent = '契约/结构复核';
        elements.dates.textContent = `快照观察 ${formatDate(state.data.observed_at)} · 契约/结构复核 ${formatDate(state.data.reviewed_at)}`;
        elements.historicalCaveat.textContent = '历史事实未在本轮重验';
        elements.snapshotId.textContent = `snapshot ${state.data.snapshot_id}`;
    }

    function renderBoardTabs() {
        elements.boardTabs.replaceChildren();
        state.data.boards.forEach(board => {
            const button = make('button', 'board-tab');
            button.type = 'button';
            button.setAttribute('role', 'tab');
            button.dataset.boardId = board.id;
            button.setAttribute('aria-selected', String(board.id === state.activeBoardId));
            button.tabIndex = 0;
            append(button, make('span', 'board-icon', board.icon), document.createTextNode(` ${board.title}`));
            button.addEventListener('click', () => {
                state.activeBoardId = board.id;
                renderBoardTabs();
                renderBoard();
            });
            elements.boardTabs.append(button);
        });
    }

    function addField(parent, label, value, full) {
        const field = make('div', `judgment-field${full ? ' full' : ''}`);
        append(field, make('p', 'judgment-label', label), make('p', 'judgment-text', value));
        parent.append(field);
    }

    function buildJudgment(item, prefix) {
        const button = make('button', 'judgment-toggle', '展开我的判断');
        const panelId = `${prefix}-${item.id}-judgment`.replace(/[^a-zA-Z0-9_-]/g, '-');
        const panel = make('div', 'judgment-panel');
        button.type = 'button';
        button.setAttribute('aria-expanded', 'false');
        button.setAttribute('aria-controls', panelId);
        panel.id = panelId;
        panel.hidden = true;
        const grid = make('div', 'judgment-grid');
        addField(grid, '变化', item.judgment.change, true);
        const evidenceField = make('div', 'judgment-field full');
        append(evidenceField, make('p', 'judgment-label', '证据'));
        const evidence = make('ul', 'evidence-list');
        item.judgment.evidence.forEach(entry => evidence.append(make('li', '', entry)));
        evidenceField.append(evidence);
        grid.append(evidenceField);
        addField(grid, '影响', item.judgment.impact, false);
        addField(grid, '不确定性', item.judgment.uncertainty, false);
        addField(grid, '下一步', item.judgment.next_step, false);
        if (item.judgment.next_question) addField(grid, '下一研究问题', item.judgment.next_question, false);
        panel.append(grid);
        button.addEventListener('click', () => {
            const expanded = button.getAttribute('aria-expanded') === 'true';
            button.setAttribute('aria-expanded', String(!expanded));
            button.textContent = expanded ? '展开我的判断' : '收起我的判断';
            panel.hidden = expanded;
        });
        return [button, panel];
    }

    function buildSignalCard(item, prefix, featured) {
        const card = make('article', `signal-card${featured ? ' featured' : ''}`);
        card.dataset.signalId = item.id;
        card.dataset.actions = item.actions.join(' ');
        const top = make('div', 'signal-top');
        const rank = make('span', 'signal-rank', `#${item.rank}`);
        const title = make('h3', 'signal-title');
        const link = make('a', 'signal-link', item.title);
        if (contract.isSafeUrl(item.url)) {
            link.href = item.url;
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
        }
        title.append(link);
        const source = make('span', 'source-chip', sourceName(item.source_id));
        append(top, rank, title, source);
        const summary = make('p', 'signal-summary', item.summary);
        const meta = make('div', 'signal-meta');
        append(meta,
            make('span', '', `快照观察 ${formatDate(item.observed_at)}`),
            make('span', '', '历史事实未在本轮重验'),
            make('span', '', '结构字段已复核'),
            ...item.actions.map(action => make('span', 'action-chip', actionLabels[action] || action)));
        const metrics = make('div', 'metric-list');
        item.metrics.forEach(metric => {
            const metricNode = make('div', 'metric');
            append(metricNode,
                make('span', 'metric-label', `${metric.label} · ${metric.kind}`),
                make('strong', 'metric-value', metric.value),
                make('span', 'metric-note', `${metric.definition} ${metric.caveat}`));
            metrics.append(metricNode);
        });
        append(card, top, summary, meta, metrics);
        append(card, ...buildJudgment(item, prefix));
        return card;
    }

    function renderFeatured() {
        elements.featured.replaceChildren();
        let featured;
        state.data.boards.some(board => board.items.some(item => {
            if (item.id === state.data.featured_id) {
                featured = item;
                return true;
            }
            return false;
        }));
        if (!featured) return;
        elements.featured.append(buildSignalCard(featured, 'featured', true));
        elements.featuredCaption.textContent = `由 ${state.data.featured_id} 指定，状态随快照时效变化`;
    }

    function renderBoard() {
        const board = state.data.boards.find(entry => entry.id === state.activeBoardId) || state.data.boards[0];
        state.activeBoardId = board.id;
        elements.boardIntro.textContent = `${board.intro} 排名依据：${board.ranking_basis}`;
        const items = state.action === 'all' ? board.items : board.items.filter(item => item.actions.includes(state.action));
        elements.signals.replaceChildren();
        items.forEach(item => elements.signals.append(buildSignalCard(item, 'signal', false)));
        elements.filterEmpty.hidden = items.length > 0;
        renderBoardTabs();
    }

    function renderSources() {
        elements.sources.replaceChildren();
        state.data.boards.forEach(board => {
            const source = board.source;
            const card = make('article', 'source-card');
            const title = make('h3', '', `${board.icon} ${source.name}`);
            const description = make('p', '', `对应板块：${board.title}。${board.ranking_basis}`);
            const meta = make('p', 'meta-line', `来源记录 ${formatDate(source.as_of)} · 快照观察 ${formatDate(state.data.observed_at)}`);
            const link = make('a', 'source-link', source.url);
            if (contract.isSafeUrl(source.url)) {
                link.href = source.url;
                link.target = '_blank';
                link.rel = 'noopener noreferrer';
            }
            append(card, title, description, meta, link);
            elements.sources.append(card);
        });
    }

    function setView(view) {
        state.view = view;
        const signals = view === 'signals';
        elements.viewSignals.setAttribute('aria-selected', String(signals));
        elements.viewSources.setAttribute('aria-selected', String(!signals));
        elements.signalsPanel.hidden = !signals;
        elements.sourcesPanel.hidden = signals;
    }

    function showError(error) {
        let message = error && error.message ? error.message : String(error);
        if (/items must not be empty/.test(message)) message = '快照包含空板块，没有可用条目。';
        elements.errorDetail.textContent = `加载失败：${message} 请检查本地 HTTP 服务与趋势 JSON。`;
        setState('error');
    }

    async function loadData() {
        setState('loading');
        try {
            const response = await fetch('./data/trends.json', { cache: 'no-store' });
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const data = await response.json();
            const validation = contract.validateSnapshot(data, { now: new Date() });
            if (!validation.ok) throw new Error(validation.errors.slice(0, 4).join('；'));
            state.data = data;
            state.activeBoardId = data.boards[0].id;
            state.action = 'all';
            elements.action.value = 'all';
            renderMeta(validation);
            renderFeatured();
            renderSources();
            renderBoard();
            setView('signals');
            setState('ready');
        } catch (error) {
            showError(error);
        }
    }

    function init() {
        Object.assign(elements, {
            app: get('app'), loading: get('loading-state'), error: get('error-state'), content: get('workspace-content'),
            errorDetail: get('error-detail'), retry: get('retry-button'), status: get('snapshot-status'),
            verification: get('verification-status'), dates: get('snapshot-dates'), historicalCaveat: get('historical-caveat'), snapshotId: get('snapshot-id'),
            featured: get('featured-card'), featuredCaption: get('featured-caption'), boardTabs: get('board-tabs'),
            boardIntro: get('board-intro'), signals: get('signals-list'), filterEmpty: get('filter-empty'),
            sources: get('sources-list'), action: get('action-filter'), viewSignals: get('view-tab-signals'),
            viewSources: get('view-tab-sources'), signalsPanel: get('signals-panel'), sourcesPanel: get('sources-panel'),
        });
        elements.retry.addEventListener('click', loadData);
        elements.action.addEventListener('change', event => {
            state.action = event.target.value;
            renderBoard();
        });
        elements.viewSignals.addEventListener('click', () => setView('signals'));
        elements.viewSources.addEventListener('click', () => setView('sources'));
        loadData();
    }

    root.TrendsApp = Object.freeze({ init, loadData });
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
    else init();
}(window));
