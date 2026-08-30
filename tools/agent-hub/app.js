(function exposeAgentHubApp(root, factory) {
  const app = factory(root);
  if (root) root.AgentHubApp = app;
  if (typeof module !== 'undefined' && module.exports) module.exports = app;
}(typeof globalThis !== 'undefined' ? globalThis : this, function buildAgentHubApp(root) {
  const doc = root && root.document;
  const state = {
    answers: {},
    activeTab: 'decision-panel',
  };

  function byId(id) {
    return doc ? doc.getElementById(id) : null;
  }

  function make(tag, className, value) {
    const element = doc.createElement(tag);
    if (className) element.className = className;
    if (value !== undefined && value !== null) element.textContent = String(value);
    return element;
  }

  function clear(element) {
    if (!element) return;
    while (element.firstChild) element.removeChild(element.firstChild);
  }

  function append(parent, child) {
    if (parent && child) parent.appendChild(child);
    return child;
  }

  function addText(parent, tag, className, value) {
    return append(parent, make(tag, className, value));
  }

  function addList(parent, items, className) {
    const list = make('ul', className || '');
    for (const item of items || []) append(list, make('li', '', item));
    append(parent, list);
    return list;
  }

  function getNow() {
    return root.__AGENT_HUB_NOW || new Date();
  }

  function countAnswers() {
    return model.questions.filter((question) => state.answers[question.id]).length;
  }

  function renderQuestions() {
    const target = byId('question-list');
    clear(target);
    for (const question of model.questions) {
      const fieldset = make('fieldset', 'question-card');
      const legend = make('legend');
      append(legend, make('span', 'question-number', question.number));
      append(legend, make('span', '', question.prompt));
      append(fieldset, legend);
      append(fieldset, make('p', 'question-help', question.helper));
      const options = make('div', 'option-list');
      for (const option of question.options) {
        const wrap = make('div', 'option-wrap');
        const input = make('input');
        input.type = 'radio';
        input.name = question.id;
        input.value = option.id;
        input.id = 'answer-' + question.id + '-' + option.id.replace(/[^a-zA-Z0-9-]/g, '-');
        input.checked = state.answers[question.id] === option.id;
        input.addEventListener('change', function onChange() {
          state.answers[question.id] = option.id;
          renderDecision();
        });
        const label = make('label', 'option-label', option.label);
        label.htmlFor = input.id;
        append(wrap, input);
        append(wrap, label);
        append(options, wrap);
      }
      append(fieldset, options);
      append(target, fieldset);
    }
  }

  function renderPresets() {
    const target = byId('scene-presets');
    clear(target);
    const heading = make('strong', '', '场景预设');
    append(target, heading);
    const list = make('div', 'preset-list');
    for (const scene of model.scenes) {
      const button = make('button', 'preset-button');
      button.type = 'button';
      button.id = 'preset-' + scene.id;
      append(button, make('span', '', scene.shortLabel));
      append(button, make('span', '', '↗'));
      button.addEventListener('click', function onPreset() {
        state.answers = engine.normalizeAnswers(scene.presetAnswers);
        renderQuestions();
        renderDecision();
      });
      append(list, button);
    }
    append(target, list);
  }

  function renderMetricList(target, metrics) {
    clear(target);
    if (!metrics || !metrics.length) {
      append(target, make('p', '', '暂无可复核指标；先建立人工基线。'));
      return;
    }
    for (const metric of metrics) {
      const row = make('div', 'metric-row');
      const name = make('div');
      append(name, make('strong', '', metric.label));
      append(name, make('span', 'metric-kind', metric.kind));
      const definition = make('div');
      append(definition, make('span', '', metric.definition));
      const evidence = make('div');
      append(evidence, make('span', '', metric.unit || '未指定单位'));
      append(evidence, make('small', '', String(metric.source || '') + ' · as of ' + String(metric.asOf || '未注明')));
      append(row, name);
      append(row, definition);
      append(row, evidence);
      append(target, row);
    }
  }

  function renderExplanation(target, items, label, emptyText) {
    clear(target);
    if (!items || !items.length) {
      append(target, make('p', '', emptyText || '暂无记录。'));
      return;
    }
    for (const item of items) {
      const row = make('div', 'explanation-item');
      append(row, make('span', 'rule-tag', label));
      const content = make('span', '');
      const title = item.label || item.id || '';
      append(content, make('strong', '', title));
      if (item.explanation || item.reason) append(content, make('span', '', '：' + (item.explanation || item.reason)));
      append(row, content);
      append(target, row);
    }
  }

  function renderDecision() {
    const answered = countAnswers();
    const progressText = byId('progress-text');
    const progressBar = byId('progress-bar');
    if (progressText) progressText.textContent = answered + ' / ' + model.questions.length + ' 已回答';
    if (progressBar) progressBar.style.width = ((answered / model.questions.length) * 100) + '%';

    const empty = byId('decision-empty');
    const resultElement = byId('decision-result');
    if (!answered) {
      if (empty) empty.hidden = false;
      if (resultElement) resultElement.hidden = true;
      return;
    }

    const result = engine.evaluateDecision(state.answers, { now: getNow() });
    if (empty) empty.hidden = true;
    resultElement.hidden = false;
    resultElement.classList.toggle('needs-input', result.status === 'needs-input');

    const mode = model.outcomes.find((outcome) => outcome.id === result.modeId) || result.recommendation;
    const title = result.status === 'needs-input'
      ? '先停一下：人工方案评审'
      : result.outcomeId === 'no-agent'
        ? '建议：不需要 Agent'
        : '建议：' + (mode ? mode.label : result.modeId);
    byId('decision-mode').textContent = title;
    byId('decision-status').textContent = result.status === 'needs-input' ? '需要补充' : '可形成建议';
    byId('decision-summary').textContent = (result.recommendation ? result.recommendation.description : '') + ' 评估日期：' + result.evaluatedAt + '。';
    renderExplanation(byId('decision-rules'), result.hitRules, '命中规则', '尚未命中具体规则。');
    renderExplanation(byId('decision-exclusions'), result.excludedAlternatives, '替代方案', '没有需要排除的替代方案。');
    byId('decision-normal-path').textContent = '正常链路：' + (result.normalPath || []).join(' → ');
    byId('decision-controls').textContent = '预览：' + (result.controls.preview ? '开启' : '按风险开启') +
      ' · HITL：' + (result.controls.hitl ? '开启' : '按风险开启') +
      ' · 审计：' + (result.controls.audit ? '开启' : '按风险开启') +
      ' · 停止：' + (result.controls.stopConditions ? '已定义' : '待定义');
    byId('decision-fallback').textContent = '失败回退：' + (result.failureFallback || []).join('；');
    byId('decision-stop').textContent = '停止条件：' + (result.stopConditions || []).join('；');

    const chips = byId('control-chips');
    clear(chips);
    for (const item of [
      ['preview', '预览'],
      ['hitl', 'HITL'],
      ['audit', '审计'],
      ['stopConditions', '停止条件'],
    ]) {
      const chip = make('span', 'control-chip' + (result.controls[item[0]] ? ' is-on' : ''), item[1] + (result.controls[item[0]] ? ' · 开启' : ' · 按需'));
      append(chips, chip);
    }
    renderMetricList(byId('decision-metrics'), result.metrics);
  }

  function renderFrameworkFacts() {
    const target = byId('framework-facts');
    clear(target);
    for (const fact of model.frameworkFacts) {
      const freshness = engine.getFrameworkFreshness(fact, getNow());
      const card = make('article', 'framework-card');
      card.dataset.freshness = freshness.state;
      const top = make('div', 'card-top');
      const titleGroup = make('div');
      append(titleGroup, make('h3', '', fact.name));
      append(titleGroup, make('p', '', '资料状态：未核验'));
      append(top, titleGroup);
      append(top, make('span', 'source-status', freshness.label));
      append(card, top);
      append(card, make('p', '', fact.claim));
      const facts = make('div', 'card-facts');
      for (const item of [
        ['能力', fact.capabilities.join('、')],
        ['适用信号', fact.selectionSignal],
        ['限制', fact.caveat],
        ['档案整理日期', (freshness.archivedAt || '日期不可用') + ' · ' + freshness.label],
      ]) {
        const line = make('div', 'card-fact');
        append(line, make('strong', '', item[0]));
        append(line, make('span', '', item[1]));
        append(facts, line);
      }
      append(card, facts);
      const sourceLink = make('a', 'source-link', '查看候选官方 URL ↗');
      sourceLink.href = fact.source.url;
      sourceLink.target = '_blank';
      sourceLink.rel = 'noopener noreferrer';
      append(card, sourceLink);
      if (fact.secondarySource) {
        const secondaryLink = make('a', 'source-link', '查看补充候选 URL ↗');
        secondaryLink.href = fact.secondarySource.url;
        secondaryLink.target = '_blank';
        secondaryLink.rel = 'noopener noreferrer';
        append(card, secondaryLink);
      }
      append(target, card);
    }
  }

  const topologyNodes = {
    single: ['输入', '单 Agent', '工具', '预览 / 人工'],
    parallel: ['协调者', '分支 A', '分支 B', '聚合质控'],
    debate: ['候选', '反方', '证据互审', '人工裁决'],
    pipeline: ['状态', '节点 1', '检查点', '恢复 / 退出'],
  };

  function addDetailList(card, title, items) {
    const block = make('div', 'card-detail-list');
    const line = make('div');
    append(line, make('strong', '', title));
    addList(line, items);
    append(block, line);
    append(card, block);
  }

  function addDetailText(card, title, value) {
    const block = make('div', 'card-detail-list');
    const line = make('div');
    append(line, make('strong', '', title));
    append(line, make('span', '', value));
    append(block, line);
    append(card, block);
  }

  function renderArchitectures() {
    const target = byId('topology-grid');
    clear(target);
    for (const architecture of model.architectures) {
      const card = make('article', 'topology-card');
      const top = make('div', 'card-top');
      const titleGroup = make('div');
      append(titleGroup, make('h3', '', architecture.label));
      append(titleGroup, make('p', '', architecture.kicker));
      append(top, titleGroup);
      append(top, make('span', 'source-status', '架构卡'));
      append(card, top);
      const diagram = make('div', 'topology-diagram');
      for (const [index, node] of topologyNodes[architecture.topology].entries()) {
        if (index) append(diagram, make('span', 'topology-arrow', '→'));
        append(diagram, make('span', 'topology-node', node));
      }
      append(card, diagram);
      addDetailList(card, '适合', architecture.suitableWhen);
      addDetailList(card, '不适合', architecture.notSuitableWhen);
      addDetailText(card, '故障传播', architecture.failurePropagation);
      addDetailText(card, '重试边界', architecture.retryBoundary);
      addDetailText(card, '停止边界', architecture.stopBoundary);
      addDetailText(card, 'HITL', architecture.hitl);
      addDetailList(card, '最小可观测性', architecture.minimumObservability);
      addDetailText(card, '正常链路', architecture.path.join(' → '));
      const metricTitle = make('div', 'card-detail-list');
      const metricLine = make('div');
      append(metricLine, make('strong', '', '测量字段'));
      renderMetricList(metricLine, architecture.metrics);
      append(metricTitle, metricLine);
      append(card, metricTitle);
      append(target, card);
    }
  }

  function applyScene(scene) {
    state.answers = engine.normalizeAnswers(scene.presetAnswers);
    renderQuestions();
    renderDecision();
    switchTab('decision-panel');
    const panel = byId('decision-panel');
    if (panel && panel.scrollIntoView) panel.scrollIntoView({ block: 'start' });
  }

  function renderScenes() {
    const target = byId('scene-grid');
    clear(target);
    for (const scene of model.scenes) {
      const card = make('article', 'scene-card');
      const top = make('div', 'card-top');
      const titleGroup = make('div');
      append(titleGroup, make('h3', '', scene.label));
      append(titleGroup, make('p', '', '六问预设 · 可替换假设'));
      append(top, titleGroup);
      append(top, make('span', 'source-status', '业务场景'));
      append(card, top);
      append(card, make('p', '', scene.problem));
      addDetailList(card, '输入假设', scene.inputAssumptions);
      addDetailList(card, '人的责任', scene.humanResponsibility);
      addDetailText(card, '测量方式', scene.measurementMethod);
      addDetailList(card, '停止条件', scene.stopConditions);
      const metricTitle = make('div', 'card-detail-list');
      const metricLine = make('div');
      append(metricLine, make('strong', '', '指标与证据'));
      renderMetricList(metricLine, scene.metrics);
      append(metricTitle, metricLine);
      append(card, metricTitle);

      const links = make('div', 'related-links');
      for (const link of scene.relatedLinks || []) {
        const anchor = make('a', '', link.label + ' ↗');
        anchor.href = link.href;
        if (link.href.includes('service-agent')) anchor.id = 'scene-link-service-agent';
        if (link.href.includes('esop-extractor')) anchor.id = 'scene-link-esop';
        append(links, anchor);
      }
      if ((scene.relatedLinks || []).length) append(card, links);

      const action = make('div', 'scene-action');
      const button = make('button', '', '用此场景预填六问');
      button.type = 'button';
      button.id = 'scene-use-' + scene.id;
      button.addEventListener('click', function onUseScene() {
        applyScene(scene);
      });
      append(action, button);
      append(card, action);
      append(target, card);
    }
  }

  const judgmentKindLabels = {
    'design-principle': '设计原则',
    hypothesis: '待验证假设',
  };

  function renderJudgments() {
    const target = byId('judgment-grid');
    clear(target);
    for (const judgment of model.judgments) {
      const card = make('article', 'judgment-card');
      const top = make('div', 'card-top');
      const titleGroup = make('div');
      append(titleGroup, make('h3', '', judgment.title));
      append(top, titleGroup);
      append(top, make('span', 'judgment-kind', judgmentKindLabels[judgment.kind] || judgment.kind));
      append(card, top);
      append(card, make('p', 'statement', judgment.statement));
      addDetailText(card, '适用条件', judgment.appliesWhen);
      addDetailText(card, '判断规则', judgment.decisionRule);
      addDetailText(card, '证据', judgment.evidence.text + ' · ' + judgment.evidence.sourceIds.join('、'));
      addDetailText(card, '反例', judgment.counterexample);
      addDetailText(card, '下一条证据', judgment.newEvidenceNeeded);
      append(target, card);
    }
  }

  function switchTab(panelId) {
    const panels = Array.from(doc.querySelectorAll('[role="tabpanel"]'));
    const tabs = Array.from(doc.querySelectorAll('[role="tab"]'));
    for (const panel of panels) panel.hidden = panel.id !== panelId;
    for (const tab of tabs) {
      const selected = tab.getAttribute('aria-controls') === panelId;
      tab.setAttribute('aria-selected', selected ? 'true' : 'false');
      tab.tabIndex = selected ? 0 : -1;
    }
    state.activeTab = panelId;
  }

  function bindTabs() {
    const tabs = Array.from(doc.querySelectorAll('[role="tab"]'));
    tabs.forEach((tab, index) => {
      tab.addEventListener('click', function onTabClick() {
        switchTab(tab.getAttribute('aria-controls'));
      });
      tab.addEventListener('keydown', function onTabKeydown(event) {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          switchTab(tab.getAttribute('aria-controls'));
          return;
        }
        if (!['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp', 'Home', 'End'].includes(event.key)) return;
        event.preventDefault();
        let nextIndex = index;
        if (event.key === 'Home') nextIndex = 0;
        else if (event.key === 'End') nextIndex = tabs.length - 1;
        else if (event.key === 'ArrowRight' || event.key === 'ArrowDown') nextIndex = (index + 1) % tabs.length;
        else nextIndex = (index - 1 + tabs.length) % tabs.length;
        tabs[nextIndex].focus();
        switchTab(tabs[nextIndex].getAttribute('aria-controls'));
      });
    });
  }

  function showDataError() {
    const ready = byId('data-ready');
    const error = byId('data-error');
    if (ready) ready.hidden = true;
    if (error) error.hidden = false;
  }

  function init() {
    if (!doc) return;
    if (!root.AgentHubModel || !root.AgentHubEngine || !root.AgentHubEngine.evaluateDecision) {
      showDataError();
      return;
    }
    model = root.AgentHubModel;
    engine = root.AgentHubEngine;
    state.answers = engine.normalizeAnswers({});
    renderQuestions();
    renderPresets();
    renderDecision();
    renderFrameworkFacts();
    renderArchitectures();
    renderScenes();
    renderJudgments();
    bindTabs();
    switchTab('decision-panel');
  }

  let model = root.AgentHubModel;
  let engine = root.AgentHubEngine;
  const api = { state, init, renderDecision, switchTab };
  if (doc) {
    if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', init);
    else init();
  }
  return api;
}));
