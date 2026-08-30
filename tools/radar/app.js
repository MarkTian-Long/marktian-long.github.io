(function initializeRadarApp() {
    const state = {
        data: null,
        selectedIntentId: '',
        filters: {
            language: '',
            type: '',
            topic: '',
            priority: ''
        }
    };

    const LABELS = {
        language: { en: '英文', zh: '中文' },
        type: { blog: '技术博客', essay: '长文', newsletter: 'Newsletter', community: '社区', media: '媒体' },
        role: { primary: '主线', analysis: '分析', community: '社区', bridge: '桥接' },
        updateCadence: { daily: '每日', weekly: '每周', monthly: '每月', irregular: '不定期', ongoing: '持续' },
        priority: { core: '核心', supporting: '补充', watch: '观察' },
        access: { open: '开放', partial: '部分开放', subscription: '订阅', account: '需登录' },
        manualStatus: { reviewed: '已复核', 'needs-review': '待复核', 'not-reviewed': '未复核' },
        stage: { search: '搜索', verify: '验证', synthesize: '综合', distill: '沉淀' },
        cadence: { quarterly: '每季度', monthly: '每月', weekly: '每周' }
    };

    const PRIORITY_ORDER = { core: 0, supporting: 1, watch: 2 };

    function getElement(id) {
        return document.getElementById(id);
    }

    function createElement(tagName, className, text) {
        const element = document.createElement(tagName);
        if (className) element.className = className;
        if (text !== undefined) element.textContent = text;
        return element;
    }

    function validRadarData(data) {
        return Boolean(data && data.meta && Array.isArray(data.intents) && Array.isArray(data.sources) && Array.isArray(data.workflowTools));
    }

    function safeHttpsUrl(value) {
        try {
            const url = new URL(value);
            return url.protocol === 'https:' ? url.href : '#';
        } catch (error) {
            return '#';
        }
    }

    function showDataError() {
        document.body.dataset.radarState = 'error';
        const errorBox = getElement('dataError');
        const status = getElement('dataStatus');
        if (errorBox) errorBox.hidden = false;
        if (status) {
            status.textContent = '本地数据暂不可用';
            status.className = 'status-label status-label-error';
        }
        ['intentGrid', 'filterForm', 'sourceList', 'workflowList'].forEach((id) => {
            const element = getElement(id);
            if (element) element.hidden = true;
        });
        const activeIntent = getElement('activeIntent');
        if (activeIntent) activeIntent.textContent = '请先恢复同目录的 data.js 文件';
    }

    function renderMeta() {
        const { data } = state;
        const languageCounts = data.sources.reduce((counts, source) => {
            counts[source.language] = (counts[source.language] || 0) + 1;
            return counts;
        }, {});
        getElement('dataStatus').textContent = `人工复核清单 · ${data.sources.length} 个来源`;
        getElement('coverageSummary').textContent = `${data.sources.length} 个来源 · 英文 ${languageCounts.en || 0} · 中文 ${languageCounts.zh || 0} · 覆盖 ${data.meta.coverageDimensions.join('、')}`;
        getElement('lastUpdated').textContent = data.meta.updatedAt;
        getElement('reviewCadence').textContent = LABELS.cadence[data.meta.reviewCadence] || data.meta.reviewCadence;
        const nextStep = getElement('nextStep');
        nextStep.href = data.meta.nextStep.href;
        nextStep.firstChild.textContent = `进入${data.meta.nextStep.label} `;
    }

    function renderIntents() {
        const intentGrid = getElement('intentGrid');
        intentGrid.replaceChildren();
        state.data.intents.forEach((intent, index) => {
            const button = createElement('button', 'intent-card');
            button.type = 'button';
            button.dataset.intent = intent.id;
            button.setAttribute('aria-pressed', 'false');
            button.append(
                createElement('span', 'intent-number', `0${index + 1}`),
                createElement('h3', '', intent.label),
                createElement('p', '', intent.question),
                createElement('span', 'intent-foot', `${intent.sourceIds.length} 个推荐来源 · ${intent.shortLabel}`)
            );
            button.addEventListener('click', () => {
                state.selectedIntentId = state.selectedIntentId === intent.id ? '' : intent.id;
                updateIntentState();
                renderSources();
            });
            intentGrid.append(button);
        });
    }

    function updateIntentState() {
        document.querySelectorAll('[data-intent]').forEach((button) => {
            button.setAttribute('aria-pressed', String(button.dataset.intent === state.selectedIntentId));
        });
        const activeIntent = getElement('activeIntent');
        const intent = state.data.intents.find((candidate) => candidate.id === state.selectedIntentId);
        activeIntent.textContent = intent
            ? `${intent.label} · ${intent.description}`
            : `全部来源 · 选择一个研究意图可调整推荐顺序`;
    }

    function addOptions(selectId, values, labels) {
        const select = getElement(selectId);
        values.forEach((value) => select.append(createElement('option', '', labels[value] || value)));
        values.forEach((value, index) => {
            select.options[index + 1].value = value;
        });
    }

    function renderFilters() {
        const sources = state.data.sources;
        addOptions('languageFilter', [...new Set(sources.map((source) => source.language))], LABELS.language);
        addOptions('typeFilter', [...new Set(sources.map((source) => source.type))], LABELS.type);
        addOptions('topicFilter', state.data.meta.topicOptions.map((topic) => topic.id), Object.fromEntries(state.data.meta.topicOptions.map((topic) => [topic.id, topic.label])));
        addOptions('priorityFilter', ['core', 'supporting', 'watch'], LABELS.priority);

        ['languageFilter', 'typeFilter', 'topicFilter', 'priorityFilter'].forEach((id) => {
            getElement(id).addEventListener('change', (event) => {
                state.filters[event.target.name] = event.target.value;
                renderSources();
            });
        });
        getElement('filterForm').addEventListener('submit', (event) => event.preventDefault());
        getElement('clearFilters').addEventListener('click', clearFilters);
        getElement('resetFilters').addEventListener('click', clearFilters);
    }

    function clearFilters() {
        Object.keys(state.filters).forEach((key) => {
            state.filters[key] = '';
            getElement(`${key}Filter`).value = '';
        });
        renderSources();
    }

    function matchesFilters(source) {
        const { filters } = state;
        return (!filters.language || source.language === filters.language)
            && (!filters.type || source.type === filters.type)
            && (!filters.topic || source.topics.includes(filters.topic))
            && (!filters.priority || source.priority === filters.priority);
    }

    function orderedSources() {
        const intent = state.data.intents.find((candidate) => candidate.id === state.selectedIntentId);
        const recommendationOrder = new Map((intent ? intent.sourceIds : []).map((id, index) => [id, index]));
        return state.data.sources
            .map((source, index) => ({ source, index }))
            .filter(({ source }) => matchesFilters(source))
            .sort((left, right) => {
                const leftIntent = recommendationOrder.has(left.source.id) ? recommendationOrder.get(left.source.id) : Number.MAX_SAFE_INTEGER;
                const rightIntent = recommendationOrder.has(right.source.id) ? recommendationOrder.get(right.source.id) : Number.MAX_SAFE_INTEGER;
                if (leftIntent !== rightIntent) return leftIntent - rightIntent;
                const priorityDifference = (PRIORITY_ORDER[left.source.priority] || 0) - (PRIORITY_ORDER[right.source.priority] || 0);
                return priorityDifference || left.index - right.index;
            })
            .map(({ source }) => source);
    }

    function createChip(text, modifier) {
        return createElement('span', `meta-chip${modifier ? ` ${modifier}` : ''}`, text);
    }

    function createDetail(label, values) {
        const detail = createElement('div', 'source-detail');
        detail.append(createElement('span', 'source-detail-label', label), createElement('p', '', values.join('；')));
        return detail;
    }

    function createSourceCard(source) {
        const card = createElement('a', 'source-card');
        card.dataset.sourceId = source.id;
        card.href = safeHttpsUrl(source.url);
        card.target = '_blank';
        card.rel = 'noopener noreferrer';

        const cardTop = createElement('div', 'source-card-top');
        cardTop.append(
            createElement('span', 'source-type', `${LABELS.type[source.type]} · ${LABELS.role[source.role]}`),
            createElement('span', 'manual-status', `● 人工复核：${LABELS.manualStatus[source.manualStatus]}`)
        );
        card.append(cardTop, createElement('h3', '', source.name), createElement('p', 'source-description', source.description));

        const meta = createElement('div', 'source-meta');
        meta.append(
            createChip(LABELS.language[source.language]),
            createChip(LABELS.updateCadence[source.updateCadence]),
            createChip(LABELS.priority[source.priority], `priority-${source.priority}`),
            createChip(LABELS.access[source.access])
        );
        card.append(meta);

        const details = createElement('div', 'source-card-details');
        details.append(createDetail('适合任务', source.bestFor), createDetail('盲区', source.blindSpot));
        card.append(details);

        const retention = createElement('div', 'retention-block');
        retention.append(createElement('span', 'retention-label', '保留理由'), createElement('p', 'retention-copy', source.retentionReason));
        card.append(retention);

        const footer = createElement('div', 'source-card-footer');
        footer.append(createElement('span', 'checked-date', `最近复核 ${source.lastCheckedAt}`));
        footer.append(createElement('span', 'source-action', '打开来源 ↗'));
        card.append(footer);
        return card;
    }

    function renderSources() {
        const sources = orderedSources();
        const sourceList = getElement('sourceList');
        const emptyState = getElement('emptyState');
        sourceList.replaceChildren(...sources.map(createSourceCard));
        sourceList.hidden = sources.length === 0;
        emptyState.hidden = sources.length !== 0;
        getElement('resultsSummary').textContent = sources.length
            ? `展示 ${sources.length} / ${state.data.sources.length} 个来源`
            : `展示 0 / ${state.data.sources.length} 个来源 · 无匹配`;
    }

    function renderWorkflow() {
        const workflowList = getElement('workflowList');
        workflowList.replaceChildren();
        state.data.workflowTools.forEach((tool) => {
            const item = createElement('li', 'workflow-step');
            item.append(createElement('h3', '', LABELS.stage[tool.stage] || tool.stage), createElement('p', '', tool.description));
            const link = createElement('a', '', `使用 ${tool.name} ↗`);
            link.href = safeHttpsUrl(tool.url);
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
            item.append(link);
            workflowList.append(item);
        });
    }

    function init() {
        try {
            if (!validRadarData(window.RADAR_DATA)) {
                showDataError();
                return;
            }
            state.data = window.RADAR_DATA;
            renderMeta();
            renderIntents();
            renderFilters();
            renderWorkflow();
            updateIntentState();
            renderSources();
            document.body.dataset.radarState = 'ready';
        } catch (error) {
            showDataError();
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init, { once: true });
    } else {
        init();
    }
})();
