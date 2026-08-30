(function exposeTrendsContract(root, factory) {
    if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        root.TrendsContract = factory();
    }
}(typeof globalThis !== 'undefined' ? globalThis : this, function createTrendsContract() {
    'use strict';

    const VALID_ACTIONS = Object.freeze(['watch', 'compare', 'adopt', 'deep_dive']);
    const VALID_METRIC_KINDS = Object.freeze([
        'target',
        'proxy',
        'offline-measured',
        'production-result',
        'external-research',
    ]);
    const VALID_COLLECTION_MODES = Object.freeze(['structure_checked', 'manual_fact_reviewed', 'candidate']);
    const VALID_VERIFICATION_LEVELS = Object.freeze(['structure_checked', 'manual_fact_reviewed', 'candidate']);
    const VALID_REVIEW_SCOPES = Object.freeze(['structure_only', 'facts_verified', 'candidate']);
    const DAY_MS = 24 * 60 * 60 * 1000;
    const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

    class ContractError extends Error {
        constructor(errors) {
            const messages = Array.isArray(errors) ? errors : [errors];
            super(`Trends v2 contract rejected: ${messages.join('; ')}`);
            this.name = 'ContractError';
            this.errors = messages;
        }
    }

    function isRecord(value) {
        return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
    }

    function parseDate(value, field) {
        if (typeof value !== 'string' || !DATE_RE.test(value)) {
            throw new Error(`${field} must be an ISO date (YYYY-MM-DD)`);
        }
        const date = new Date(`${value}T00:00:00.000Z`);
        if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) {
            throw new Error(`${field} is not a real calendar date`);
        }
        return date;
    }

    function parseNow(now) {
        if (now instanceof Date) {
            if (Number.isNaN(now.getTime())) throw new Error('now is an invalid date');
            return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
        }
        if (typeof now === 'undefined') {
            const current = new Date();
            return new Date(Date.UTC(current.getUTCFullYear(), current.getUTCMonth(), current.getUTCDate()));
        }
        return parseDate(now, 'now');
    }

    function parseOptionalDate(value, field, errors) {
        if (value === null || value === undefined) return null;
        if (typeof value !== 'string') {
            errors.push(`${field} must be an ISO date or null`);
            return null;
        }
        try {
            return parseDate(value, field);
        } catch (error) {
            errors.push(error.message);
            return null;
        }
    }

    function rejectFuture(date, field, now, errors) {
        if (date && now && date > now) errors.push(`${field} cannot be in the future`);
    }

    function rejectAfter(date, field, limit, limitField, errors) {
        if (date && limit && date > limit) errors.push(`${field} cannot be later than ${limitField}`);
    }

    function freshnessFor(asOf, now) {
        const observed = parseDate(asOf, 'as_of');
        const today = parseNow(now);
        const ageDays = Math.floor((today.getTime() - observed.getTime()) / DAY_MS);
        if (ageDays < 0) {
            return { status: 'future', age_days: ageDays, label: '日期异常：来源时间在未来' };
        }
        if (ageDays <= 7) {
            return { status: 'current', age_days: ageDays, label: '本期' };
        }
        if (ageDays <= 30) {
            return { status: 'review', age_days: ageDays, label: '建议复核' };
        }
        return { status: 'historical', age_days: ageDays, label: '历史快照，不代表当前热度' };
    }

    function normalizeUrl(value) {
        try {
            const url = new URL(value);
            url.hash = '';
            return url.toString().replace(/\/$/, '');
        } catch (_) {
            return String(value || '');
        }
    }

    function isSafeUrl(value) {
        try {
            const url = new URL(value);
            return url.protocol === 'https:' && Boolean(url.hostname);
        } catch (_) {
            return false;
        }
    }

    function isGenericItemUrl(value) {
        try {
            const url = new URL(value);
            const path = url.pathname.replace(/\/+$/, '') || '/';
            const host = url.hostname.toLowerCase();
            if (path === '/' || path === '/products' || path === '/front' || path === '/leaderboard') return true;
            if (host === 'news.ycombinator.com' && (path === '/news' || path === '/newest' || path === '/front')) return true;
            if (host.includes('producthunt.com') && (path === '/products' || path === '/categories')) return true;
            if (path.endsWith('/trending') || path.endsWith('/leaderboard')) return true;
            return false;
        } catch (_) {
            return true;
        }
    }

    function looksLikePlaceholder(item) {
        const text = `${item.title || ''} ${item.summary || ''}`.trim();
        return /placeholder|待补充|暂无描述|点击查看(?:本月)?完整榜单|榜单页链接/i.test(text);
    }

    function requireText(value, field, errors) {
        if (typeof value !== 'string' || !value.trim()) errors.push(`${field} must be a non-empty string`);
    }

    function validateSource(source, boardPath, errors, context = {}) {
        if (!isRecord(source)) {
            errors.push(`${boardPath}.source must be an object`);
            return;
        }
        for (const field of ['id', 'name', 'url', 'as_of']) requireText(source[field], `${boardPath}.source.${field}`, errors);
        if (typeof source.url === 'string' && !isSafeUrl(source.url)) errors.push(`${boardPath}.source.url must use HTTPS`);
        const sourceDate = typeof source.as_of === 'string'
            ? parseOptionalDate(source.as_of, `${boardPath}.source.as_of`, errors)
            : null;
        rejectFuture(sourceDate, `${boardPath}.source.as_of`, context.now, errors);
        rejectAfter(sourceDate, `${boardPath}.source.as_of`, context.snapshotAsOf, 'snapshot.as_of', errors);
    }

    function validateMetric(metric, itemPath, sourceIds, errors, context = {}) {
        if (!isRecord(metric)) {
            errors.push(`${itemPath}.metrics must contain objects`);
            return;
        }
        for (const field of ['label', 'value', 'definition', 'kind', 'as_of', 'source_url', 'caveat']) {
            requireText(metric[field], `${itemPath}.metric.${field}`, errors);
        }
        if (typeof metric.kind === 'string' && !VALID_METRIC_KINDS.includes(metric.kind)) {
            errors.push(`${itemPath}.metric.kind is not legal`);
        }
        const metricDate = typeof metric.as_of === 'string'
            ? parseOptionalDate(metric.as_of, `${itemPath}.metric.as_of`, errors)
            : null;
        rejectFuture(metricDate, `${itemPath}.metric.as_of`, context.now, errors);
        rejectAfter(metricDate, `${itemPath}.metric.as_of`, context.snapshotAsOf, 'snapshot.as_of', errors);
        if (typeof metric.source_url === 'string' && !isSafeUrl(metric.source_url)) {
            errors.push(`${itemPath}.metric.source_url must use HTTPS`);
        }
        if (metric.source_id !== undefined && (typeof metric.source_id !== 'string' || !sourceIds.has(metric.source_id))) {
            errors.push(`${itemPath}.metric.source_id must reference a declared source`);
        }
    }

    function validateJudgment(judgment, itemPath, actions, errors) {
        if (!isRecord(judgment)) {
            errors.push(`${itemPath}.judgment must be an object`);
            return;
        }
        for (const field of ['change', 'evidence', 'impact', 'uncertainty', 'next_step']) {
            if (field === 'evidence') {
                if (!Array.isArray(judgment.evidence) || judgment.evidence.length === 0 || judgment.evidence.some(entry => typeof entry !== 'string' || !entry.trim())) {
                    errors.push(`${itemPath}.judgment.evidence must contain readable evidence`);
                }
            } else {
                requireText(judgment[field], `${itemPath}.judgment.${field}`, errors);
            }
        }
        if (actions.includes('deep_dive')) requireText(judgment.next_question, `${itemPath}.judgment.next_question`, errors);
    }

    function validateItem(item, boardPath, sourceIds, itemIds, itemUrls, errors, allowCandidate, context = {}) {
        if (!isRecord(item)) {
            errors.push(`${boardPath}.items must contain objects`);
            return;
        }
        const itemPath = `${boardPath}.items[]`;
        for (const field of ['id', 'title', 'summary', 'url', 'source_id', 'observed_at', 'verification_level']) {
            requireText(item[field], `${itemPath}.${field}`, errors);
        }
        if (typeof item.id === 'string') {
            if (itemIds.has(item.id)) errors.push(`${itemPath}.id must be unique`);
            itemIds.add(item.id);
        }
        if (!Number.isInteger(item.rank) || item.rank < 1) errors.push(`${itemPath}.rank must be a positive integer`);
        if (typeof item.source_id === 'string' && !sourceIds.has(item.source_id)) errors.push(`${itemPath}.source_id is not declared`);
        const itemDate = typeof item.observed_at === 'string'
            ? parseOptionalDate(item.observed_at, `${itemPath}.observed_at`, errors)
            : null;
        rejectFuture(itemDate, `${itemPath}.observed_at`, context.now, errors);
        rejectAfter(itemDate, `${itemPath}.observed_at`, context.snapshotAsOf, 'snapshot.as_of', errors);
        if (typeof item.url === 'string') {
            if (!isSafeUrl(item.url)) errors.push(`${itemPath}.url must use HTTPS`);
            if (isGenericItemUrl(item.url)) errors.push(`${itemPath}.url must identify a specific item, not a generic board`);
            const normalized = normalizeUrl(item.url);
            if (itemUrls.has(normalized)) errors.push(`${itemPath}.url must be unique; duplicate URL found`);
            itemUrls.add(normalized);
        }
        if (looksLikePlaceholder(item)) errors.push(`${itemPath} looks like a placeholder record`);
        if (!Array.isArray(item.actions) || item.actions.length === 0 || item.actions.some(action => !VALID_ACTIONS.includes(action))) {
            errors.push(`${itemPath}.actions must contain legal action categories`);
        } else if (new Set(item.actions).size !== item.actions.length) {
            errors.push(`${itemPath}.actions must not repeat categories`);
        }
        const expectedVerificationLevel = context.reviewScope === 'candidate'
            ? 'candidate'
            : context.reviewScope === 'facts_verified' ? 'manual_fact_reviewed' : 'structure_checked';
        if (item.verification_level !== expectedVerificationLevel) {
            errors.push(`${itemPath}.verification_level must be ${expectedVerificationLevel} for review_scope=${context.reviewScope || 'unknown'}`);
        }
        if (!Array.isArray(item.metrics) || item.metrics.length === 0) errors.push(`${itemPath}.metrics must not be empty`);
        else item.metrics.forEach(metric => validateMetric(metric, itemPath, sourceIds, errors, context));
        validateJudgment(item.judgment, itemPath, item.actions || [], errors);
    }

    function validateSnapshot(snapshot, options = {}) {
        const errors = [];
        const warnings = [];
        const allowCandidate = Boolean(options.allowCandidate);
        let freshness = null;
        if (!isRecord(snapshot)) return { ok: false, errors: ['snapshot must be an object'], warnings, freshness };
        let now = null;
        try {
            now = parseNow(options.now);
        } catch (error) {
            errors.push(error.message);
        }
        if (snapshot.contract_version !== 2) errors.push('contract_version must be 2');
        for (const field of ['snapshot_id', 'snapshot_status', 'as_of', 'observed_at', 'reviewed_at', 'collection_mode', 'verification_level', 'review_scope', 'featured_id']) {
            requireText(snapshot[field], field, errors);
        }
        if (!Object.prototype.hasOwnProperty.call(snapshot, 'facts_verified_at')) errors.push('facts_verified_at must be present and may be null');
        if (!['current', 'review', 'historical'].includes(snapshot.snapshot_status)) errors.push('snapshot_status is not legal');
        if (!VALID_COLLECTION_MODES.includes(snapshot.collection_mode)) errors.push('collection_mode is not legal');
        if (!VALID_VERIFICATION_LEVELS.includes(snapshot.verification_level)) errors.push('verification_level is not legal');
        if (!VALID_REVIEW_SCOPES.includes(snapshot.review_scope)) errors.push('review_scope is not legal');
        if (!allowCandidate && !['structure_checked', 'manual_fact_reviewed'].includes(snapshot.collection_mode)) errors.push('collection_mode must be structure_checked or manual_fact_reviewed before publication');
        if (!allowCandidate && !['structure_checked', 'manual_fact_reviewed'].includes(snapshot.verification_level)) errors.push('verification_level must be structure_checked or manual_fact_reviewed before publication');
        if (!allowCandidate && snapshot.review_scope === 'candidate') errors.push('review_scope candidate is not publishable');
        if (allowCandidate && snapshot.collection_mode === 'candidate' && snapshot.review_scope !== 'candidate') errors.push('candidate snapshot must use review_scope candidate');
        if (snapshot.review_scope === 'structure_only' && snapshot.collection_mode !== 'structure_checked') errors.push('structure_only snapshots must use collection_mode structure_checked');
        if (snapshot.review_scope === 'structure_only' && snapshot.verification_level !== 'structure_checked') errors.push('structure_only snapshots must use verification_level structure_checked');
        if (snapshot.review_scope === 'facts_verified' && snapshot.collection_mode !== 'manual_fact_reviewed') errors.push('facts_verified snapshots must use collection_mode manual_fact_reviewed');
        if (snapshot.review_scope === 'facts_verified' && snapshot.verification_level !== 'manual_fact_reviewed') errors.push('facts_verified snapshots must use verification_level manual_fact_reviewed');
        const snapshotDates = {};
        for (const field of ['as_of', 'observed_at', 'reviewed_at']) {
            snapshotDates[field] = typeof snapshot[field] === 'string'
                ? parseOptionalDate(snapshot[field], field, errors)
                : null;
            rejectFuture(snapshotDates[field], field, now, errors);
        }
        const factsVerifiedAt = parseOptionalDate(snapshot.facts_verified_at, 'facts_verified_at', errors);
        rejectFuture(factsVerifiedAt, 'facts_verified_at', now, errors);
        if (snapshot.review_scope === 'facts_verified' && !factsVerifiedAt) errors.push('facts_verified review_scope requires facts_verified_at');
        if (snapshot.review_scope !== 'facts_verified' && snapshot.facts_verified_at !== null) errors.push('facts_verified_at must be null unless review_scope is facts_verified');
        if (snapshot.review_scope === 'facts_verified') {
            if (typeof snapshot.method?.evidence_policy === 'string' && !/(fact[- ]checked|事实.{0,4}核验|verified source)/i.test(snapshot.method.evidence_policy)) {
                errors.push('facts_verified evidence_policy must describe fact-checked source support');
            }
        }
        if (snapshot.observed_at && snapshot.as_of && snapshotDates.observed_at && snapshotDates.as_of) {
            rejectAfter(snapshotDates.observed_at, 'observed_at', snapshotDates.as_of, 'snapshot.as_of', errors);
        }
        if (snapshot.as_of && snapshot.reviewed_at && snapshotDates.as_of && snapshotDates.reviewed_at) {
            rejectAfter(snapshotDates.as_of, 'as_of', snapshotDates.reviewed_at, 'reviewed_at', errors);
        }
        if (factsVerifiedAt && snapshotDates.reviewed_at) {
            rejectAfter(factsVerifiedAt, 'facts_verified_at', snapshotDates.reviewed_at, 'reviewed_at', errors);
        }
        if (!isRecord(snapshot.method)) {
            errors.push('method must be an object');
        } else {
            requireText(snapshot.method.evidence_policy, 'method.evidence_policy', errors);
            const evidencePolicy = snapshot.method.evidence_policy;
            if (typeof evidencePolicy === 'string' && /(?:independent factual evidence|独立事实证据)/i.test(evidencePolicy) && !/(?:not|非|不是|不等于)/i.test(evidencePolicy)) {
                errors.push('method.evidence_policy must not present summaries as independent evidence');
            }
            if (snapshot.review_scope === 'structure_only' && typeof evidencePolicy === 'string' && !/(?:historical observation|历史观察记录|source summary|来源摘要|非独立|not independent)/i.test(evidencePolicy)) {
                errors.push('structure_only evidence_policy must describe historical observations or non-independent evidence');
            }
        }
        if (typeof snapshot.as_of === 'string' && snapshotDates.as_of) {
            try {
                freshness = freshnessFor(snapshot.as_of, now || options.now);
                if (freshness.status === 'future') errors.push('as_of cannot be in the future');
                if (freshness.status === 'historical') warnings.push(freshness.label);
                if (options.requireFreshness && freshness.status !== 'current') errors.push(`freshness gate requires current snapshot, got ${freshness.status}`);
                if (!allowCandidate && freshness.status !== 'future' && snapshot.snapshot_status !== freshness.status) {
                    warnings.push(`snapshot_status ${snapshot.snapshot_status} differs from dynamically derived freshness ${freshness.status}`);
                }
            } catch (error) { errors.push(error.message); }
        }
        if (!Array.isArray(snapshot.boards) || snapshot.boards.length === 0) errors.push('boards must not be empty');
        const sourceIds = new Set();
        const itemIds = new Set();
        const itemUrls = new Set();
        const featuredIds = new Set();
        if (Array.isArray(snapshot.boards)) {
            snapshot.boards.forEach((board, index) => {
                const boardPath = `boards[${index}]`;
                if (!isRecord(board)) {
                    errors.push(`${boardPath} must be an object`);
                    return;
                }
                for (const field of ['id', 'title', 'icon', 'intro', 'ranking_basis']) requireText(board[field], `${boardPath}.${field}`, errors);
                if (!Array.isArray(board.items) || board.items.length === 0) errors.push(`${boardPath}.items must not be empty`);
                validateSource(board.source, boardPath, errors, { now, snapshotAsOf: snapshotDates.as_of });
                if (isRecord(board.source) && typeof board.source.id === 'string') {
                    if (sourceIds.has(board.source.id)) errors.push(`${boardPath}.source.id must be unique`);
                    sourceIds.add(board.source.id);
                }
            });
            snapshot.boards.forEach((board, index) => {
                if (!isRecord(board) || !Array.isArray(board.items)) return;
                board.items.forEach(item => {
                    validateItem(item, `boards[${index}]`, sourceIds, itemIds, itemUrls, errors, allowCandidate, { now, snapshotAsOf: snapshotDates.as_of, reviewScope: snapshot.review_scope });
                    if (isRecord(item) && typeof item.id === 'string') featuredIds.add(item.id);
                });
            });
        }
        if (typeof snapshot.featured_id === 'string' && !featuredIds.has(snapshot.featured_id)) errors.push('featured_id must reference an existing item');
        if (snapshot.reviewed_at && snapshot.observed_at && snapshotDates.reviewed_at && snapshotDates.observed_at && snapshotDates.reviewed_at < snapshotDates.observed_at) errors.push('reviewed_at cannot precede observed_at');
        return { ok: errors.length === 0, errors, warnings, freshness };
    }

    function assertValidSnapshot(snapshot, options = {}) {
        const result = validateSnapshot(snapshot, options);
        if (!result.ok) throw new ContractError(result.errors);
        return result;
    }

    function validateCandidateSnapshot(candidate, options = {}) {
        const errors = [];
        if (!isRecord(candidate)) return { ok: false, errors: ['candidate snapshot must be an object'] };
        let now = null;
        try { now = parseNow(options.now); } catch (error) { errors.push(error.message); }
        if (candidate.contract_version !== 2) errors.push('contract_version must be 2');
        for (const field of ['snapshot_id', 'snapshot_status', 'as_of', 'observed_at', 'collection_mode', 'verification_level', 'review_scope']) {
            requireText(candidate[field], field, errors);
        }
        if (!Object.prototype.hasOwnProperty.call(candidate, 'facts_verified_at')) errors.push('facts_verified_at must be present and null for candidates');
        if (candidate.snapshot_status !== 'candidate') errors.push('snapshot_status must be candidate');
        if (candidate.collection_mode !== 'candidate') errors.push('collection_mode must be candidate');
        if (candidate.verification_level !== 'candidate') errors.push('verification_level must be candidate');
        if (candidate.review_scope !== 'candidate') errors.push('candidate snapshot must use review_scope candidate');
        if (candidate.facts_verified_at !== null) errors.push('candidate facts_verified_at must be null');
        const candidateDates = {};
        for (const field of ['as_of', 'observed_at']) {
            candidateDates[field] = typeof candidate[field] === 'string'
                ? parseOptionalDate(candidate[field], field, errors)
                : null;
            rejectFuture(candidateDates[field], field, now, errors);
        }
        if (candidateDates.observed_at && candidateDates.as_of) rejectAfter(candidateDates.observed_at, 'observed_at', candidateDates.as_of, 'as_of', errors);
        if (!isRecord(candidate.method)) errors.push('method must be an object');
        else {
            requireText(candidate.method.evidence_policy, 'method.evidence_policy', errors);
            if (typeof candidate.method.evidence_policy === 'string') {
                if (!/(?:候选|candidate|来源记录|source record|非独立|not independent)/i.test(candidate.method.evidence_policy)) {
                    errors.push('candidate evidence_policy must describe a source record, not independent evidence');
                }
                if (/(?:independent factual evidence|独立事实证据)/i.test(candidate.method.evidence_policy) && !/(?:not|非|不是|不等于)/i.test(candidate.method.evidence_policy)) {
                    errors.push('candidate evidence_policy must not present summaries as independent evidence');
                }
            }
        }
        if (!Array.isArray(candidate.boards) || candidate.boards.length === 0) errors.push('candidate boards must not be empty');
        if (Array.isArray(candidate.boards)) {
            candidate.boards.forEach((board, index) => {
                const boardPath = `candidate.boards[${index}]`;
                if (!isRecord(board)) {
                    errors.push(`${boardPath} must be an object`);
                    return;
                }
                for (const field of ['id', 'title', 'icon', 'intro', 'ranking_basis', 'status']) requireText(board[field], `${boardPath}.${field}`, errors);
                validateSource(board.source, boardPath, errors, { now, snapshotAsOf: candidateDates.as_of });
                if (!['ready', 'failed'].includes(board.status)) errors.push(`${boardPath}.status is not legal`);
                if (!Array.isArray(board.diagnostics)) errors.push(`${boardPath}.diagnostics must be an array`);
                if (!Array.isArray(board.items)) errors.push(`${boardPath}.items must be an array`);
                if (board.status === 'failed') {
                    if (Array.isArray(board.items) && board.items.length > 0) errors.push(`${boardPath}.failed board cannot contain placeholder items`);
                    if (!Array.isArray(board.diagnostics) || board.diagnostics.length === 0) errors.push(`${boardPath}.failed board needs diagnostics`);
                    if (Array.isArray(board.diagnostics) && board.diagnostics.some(diagnostic => !isRecord(diagnostic) || !diagnostic.code || !diagnostic.message)) errors.push(`${boardPath}.diagnostics must explain the failure`);
                }
                if (board.status === 'ready') {
                    if (!Array.isArray(board.items) || board.items.length === 0) errors.push(`${boardPath}.ready board must contain candidate items`);
                    const firstId = Array.isArray(board.items) && board.items[0] && board.items[0].id;
                    if (firstId) {
                        const result = validateSnapshot({
                            contract_version: 2,
                            snapshot_id: `${candidate.snapshot_id}-${board.id}`,
                            snapshot_status: 'review',
                            as_of: candidate.as_of,
                            observed_at: candidate.observed_at,
                            reviewed_at: candidate.observed_at,
                            collection_mode: 'candidate',
                            verification_level: 'candidate',
                            review_scope: 'candidate',
                            facts_verified_at: null,
                            featured_id: firstId,
                            boards: [board],
                            method: candidate.method,
                        }, { allowCandidate: true, now: candidate.observed_at });
                        errors.push(...result.errors.map(error => `${boardPath}: ${error}`));
                    }
                }
            });
        }
        return { ok: errors.length === 0, errors };
    }

    function assertValidCandidate(candidate, options = {}) {
        const result = validateCandidateSnapshot(candidate, options);
        if (!result.ok) throw new ContractError(result.errors);
        return result;
    }

    return Object.freeze({
        ContractError,
        VALID_ACTIONS,
        VALID_METRIC_KINDS,
        VALID_COLLECTION_MODES,
        VALID_VERIFICATION_LEVELS,
        VALID_REVIEW_SCOPES,
        freshnessFor,
        normalizeUrl,
        isSafeUrl,
        isGenericItemUrl,
        validateSnapshot,
        assertValidSnapshot,
        validateCandidateSnapshot,
        assertValidCandidate,
    });
}));
