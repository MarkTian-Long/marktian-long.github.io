const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.resolve(__dirname, '..');
const ASCI_DIR = path.join(ROOT, 'tools', 'asci');

function loadScript(scriptName, context) {
  const source = fs.readFileSync(path.join(ASCI_DIR, scriptName), 'utf8');
  vm.runInNewContext(source, context, { filename: scriptName });
}

function loadAsci(scripts = ['data.js']) {
  const context = {
    console,
    setTimeout,
    clearTimeout,
    document: {
      getElementById() { return null; },
      querySelectorAll() { return []; }
    }
  };
  scripts.forEach((scriptName) => loadScript(scriptName, context));
  return context;
}

function makeElement(overrides = {}) {
  const classes = new Set();
  return Object.assign({
    value: '',
    textContent: '',
    innerHTML: '',
    disabled: false,
    style: {},
    className: '',
    classList: {
      add(...names) { names.forEach((name) => classes.add(name)); },
      remove(...names) { names.forEach((name) => classes.delete(name)); },
      contains(name) { return classes.has(name); },
      toggle(name) {
        if (classes.has(name)) classes.delete(name);
        else classes.add(name);
      }
    }
  }, overrides);
}

function makeTaskDocument() {
  const elements = new Map([
    ['screen1', makeElement()],
    ['screen2', makeElement()],
    ['screen3', makeElement()],
    ['topicInput', makeElement({ value: 'Transformer in Drug Discovery' })],
    ['topicScopeNotice', makeElement()],
    ['researchProtocolCard', makeElement()],
    ['nodeGridContainer', makeElement()],
    ['templateButtons', makeElement()],
    ['topicTitle', makeElement()],
    ['ctrlProgress', makeElement()],
    ['mainContent', makeElement()],
    ['chatMessages', makeElement()],
    ['logBody', makeElement()],
    ['progressBar', makeElement()],
    ['progressText', makeElement()],
    ['artifactsTools', makeElement()],
    ['artifactsDecisions', makeElement()],
    ['hitlStatusBox', makeElement()],
    ['logWarnBadge', makeElement()],
    ['nextBtn', makeElement()],
    ['backBtn', makeElement()],
    ['taskBadge', makeElement()],
    ['s3Title', makeElement()],
    ['s3Abstract', makeElement()],
    ['s3Findings', makeElement()],
    ['s3TableBody', makeElement()],
    ['s3TableFooter', makeElement()],
    ['s3CredBars', makeElement()],
    ['s3CredSummary', makeElement()],
    ['s3ManifestSummary', makeElement()],
    ['s3ManifestFacts', makeElement()]
  ]);
  return {
    getElementById(id) { return elements.get(id) || null; },
    querySelectorAll() { return []; },
    createElement() { return makeElement(); }
  };
}

function loadRuntime() {
  const context = loadAsci(['data.js', 'main.js', 'engine.js', 'ui.js']);
  context.document = makeTaskDocument();
  context.renderTree = () => {};
  context.renderScreen1 = () => {};
  context.startTask();
  return context;
}

test('fixed demo contract declares metadata and a complete research protocol', () => {
  const context = loadAsci();

  assert.equal(context.DEMO_META.mode, 'fixed-demo-packet');
  assert.equal(context.DEMO_META.realRetrieval, false);
  assert.equal(context.DEMO_META.dataPackageId, context.FIXED_DATA_PACKAGE.id);
  assert.equal(Object.keys(context.NODE_REGISTRY).length, 14);
  assert.ok(context.FIXED_DATA_PACKAGE.exclusions.includes('真实数据库请求'));
  assert.ok(context.FIXED_DATA_PACKAGE.exclusions.includes('真实科研正确率评估'));

  const protocol = context.RESEARCH_PROTOCOLS[context.DEFAULT_RESEARCH_PROTOCOL_ID];
  assert.ok(protocol);
  assert.equal(typeof protocol.question, 'string');
  assert.deepEqual(Array.from(protocol.years), [2018, 2024]);
  assert.ok(protocol.sources.length >= 1);
  assert.ok(protocol.inclusionRules.length >= 1);
  assert.ok(protocol.exclusionRules.length >= 1);
  assert.ok(protocol.deliverables.length >= 1);
});

test('screen one explains that topic input does not trigger real retrieval', () => {
  const html = fs.readFileSync(path.join(ASCI_DIR, 'index.html'), 'utf8');

  assert.match(html, /固定演示数据包/);
  assert.match(html, /不会触发真实论文检索/);
  assert.doesNotMatch(html, /修改主题后可展示真实 Agent 的任务适配能力/);
});

test('initial template render populates the protocol precheck and topic boundary notice', () => {
  const context = loadAsci(['data.js', 'main.js']);
  context.document = makeTaskDocument();

  context.selectTemplate('quick');

  assert.match(context.document.getElementById('researchProtocolCard').innerHTML, /研究协议预检/);
  assert.match(context.document.getElementById('researchProtocolCard').innerHTML, /固定演示数据包/);
  assert.match(context.document.getElementById('topicScopeNotice').textContent, /匹配固定数据包/);
});

test('startTask snapshots the fixed protocol while custom topics only change the title', () => {
  const context = loadAsci(['data.js', 'main.js', 'engine.js', 'ui.js']);
  context.document = makeTaskDocument();
  context.renderTree = () => {};
  context.renderScreen1 = () => {};

  context.document.getElementById('topicInput').value = 'Graph Neural Networks in Oncology';
  context.startTask();

  const contract = context.getTaskContractSnapshot();
  assert.equal(contract.requestedTopic, 'Graph Neural Networks in Oncology');
  assert.equal(contract.titleTopic, 'Graph Neural Networks in Oncology');
  assert.equal(contract.topicMode, 'custom-title-only');
  assert.equal(contract.protocol.id, context.DEFAULT_RESEARCH_PROTOCOL_ID);
  assert.equal(contract.dataPackage.id, context.DEMO_META.dataPackageId);
  assert.equal(contract.dataPackage.realRetrieval, false);
  assert.equal(contract.protocol.question, context.RESEARCH_PROTOCOLS[context.DEFAULT_RESEARCH_PROTOCOL_ID].question);
});

test('restart clears the task contract and restores the default topic', () => {
  const context = loadAsci(['data.js', 'main.js', 'engine.js', 'ui.js']);
  context.document = makeTaskDocument();
  context.renderTree = () => {};
  context.renderScreen1 = () => {};

  context.document.getElementById('topicInput').value = 'A custom topic';
  context.startTask();
  assert.ok(context.getTaskContractSnapshot());

  context.restart();

  assert.equal(context.getTaskContractSnapshot(), null);
  assert.equal(context.document.getElementById('topicInput').value, context.DEMO_META.defaultTopic);
  assert.equal(context.s1SelectedTemplate, 'quick');
});

test('callable state transitions record ordered audit events with the full event schema', () => {
  const context = loadRuntime();

  context.transitionScreeningDecision('abstract-screen', 0, 'include');
  context.transitionContradictionDecision('contradiction-detect', 'both');
  context.transitionRollback(2);
  context.transitionDynamicInsertion('citation-chase', 'db-search');
  context.transitionRetry('keyword-extract');
  context.transitionDegrade('human', 'review-write');
  context.transitionHumanDraft('review-write', '## 人工确认的结构化草稿');

  const events = context.getAuditTrailSnapshot().filter((event) => event.action !== 'task-start');
  assert.deepEqual(
    Array.from(events, (event) => event.action),
    ['screening-decision', 'contradiction-decision', 'rollback', 'dynamic-insert', 'rerun', 'degrade', 'human-draft']
  );
  events.forEach((event) => {
    assert.deepEqual(Object.keys(event).sort(), [
      'action', 'impactScope', 'mode', 'node', 'reason', 'timestamp', 'version'
    ].sort());
    assert.equal(event.version, context.DEMO_META.version);
    assert.equal(event.mode, context.DEMO_META.mode);
    assert.equal(typeof event.timestamp, 'string');
    assert.ok(event.node);
    assert.ok(event.reason);
    assert.ok(event.impactScope);
  });
});

test('rollback keeps its audit fact while clearing downstream result state', () => {
  const context = loadRuntime();
  const downstreamId = 'outline-gen';
  context.doneSets.add('data-source-config');
  context.doneSets.add('keyword-extract');
  context.doneSets.add('db-search');
  context.doneSets.add('abstract-screen');
  context.doneSets.add(downstreamId);
  context.nodeState[downstreamId] = 'done';
  context.nodeUserData[downstreamId] = { type: 'outline', sections: [{ id: 1, title: '过期结果' }] };
  context.humanEdited = true;
  context.draftContent = '过期人工草稿';
  context.degradeMode = true;
  context.currentNodeIdx = context.activePipeline.indexOf(downstreamId);

  context.transitionRollback(context.activePipeline.indexOf('db-search'));

  assert.equal(context.doneSets.has(downstreamId), false);
  assert.equal(context.nodeState[downstreamId], 'pending');
  assert.equal(context.nodeUserData[downstreamId], undefined);
  assert.equal(context.humanEdited, false);
  assert.equal(context.draftContent, '');
  assert.equal(context.degradeMode, false);
  assert.ok(context.getAuditTrailSnapshot().some((event) => event.action === 'rollback'));
});

test('restart clears every audit event', () => {
  const context = loadRuntime();
  context.transitionScreeningDecision('abstract-screen', 1, 'exclude');
  assert.ok(context.getAuditTrailSnapshot().length > 0);

  context.restart();

  assert.deepEqual(Array.from(context.getAuditTrailSnapshot()), []);
});

test('process manifest contains reproducibility fields without raw paper payloads', () => {
  const context = loadRuntime();
  context.transitionScreeningDecision('abstract-screen', 0, 'exclude');
  context.transitionContradictionDecision('contradiction-detect', 'both');
  context.transitionRollback(2);
  context.transitionDynamicInsertion('citation-chase', 'db-search');
  context.transitionRetry('keyword-extract');
  context.transitionScreeningDecision('abstract-screen', 0, 'exclude');
  context.transitionDegrade('human', 'review-write');
  context.transitionHumanDraft('review-write', '## 人工确认的结构化草稿');

  const manifest = context.buildProcessManifest();
  const serialized = JSON.stringify(manifest);

  assert.equal(manifest.demo.mode, context.DEMO_META.mode);
  assert.equal(manifest.demo.realRetrieval, false);
  assert.equal(manifest.task.protocol.id, context.DEFAULT_RESEARCH_PROTOCOL_ID);
  assert.equal(manifest.task.dataPackage.id, context.DEMO_META.dataPackageId);
  assert.ok(manifest.execution.nodes.some((node) => node.id === 'citation-chase'));
  assert.equal(manifest.execution.dynamicInsertions[0].nodeId, 'citation-chase');
  assert.ok(manifest.execution.hitlDecisions.some((event) => event.action === 'screening-decision'));
  assert.equal(manifest.execution.exclusions[0].id, 'cp1');
  assert.ok(manifest.execution.contradictions.some((event) => event.action === 'contradiction-decision'));
  assert.ok(manifest.execution.rollbacks.some((event) => event.action === 'rollback'));
  assert.equal(manifest.execution.fallbacks[0].choice, 'human');
  assert.equal(manifest.execution.humanEditing.used, true);
  assert.equal(manifest.metrics.label, '模拟流程指标');
  assert.equal(manifest.metrics.items.length, context.SIMULATED_PROCESS_METRICS.items.length);
  assert.match(manifest.metrics.note, /不代表论文真实性或综述正确率/);
  assert.doesNotMatch(serialized, /PAPER_DATA|"abstract"|"doi"/);
});

test('process manifest export restores the button and reports a readable failure', () => {
  const context = loadRuntime();
  const messages = [];
  context.showToast = (message) => messages.push(message);
  const button = makeElement({ textContent: '导出过程清单' });
  const failingAdapter = {
    createBlob() { throw new Error('Blob unavailable'); },
    download() { throw new Error('should not download'); }
  };

  const result = context.exportProcessManifest(button, failingAdapter);

  assert.equal(result.ok, false);
  assert.equal(button.disabled, false);
  assert.equal(button.textContent, '导出过程清单');
  assert.match(messages.at(-1), /导出失败/);
  assert.match(messages.at(-1), /状态已保留/);
});

test('process manifest export uses an injected adapter for a successful download', () => {
  const context = loadRuntime();
  context.showToast = () => {};
  const button = makeElement({ textContent: '导出过程清单' });
  let downloaded;
  const adapter = {
    createBlob(parts, options) {
      return { parts, options };
    },
    download(blob, filename) {
      downloaded = { blob, filename };
    }
  };

  const result = context.exportProcessManifest(button, adapter);

  assert.equal(result.ok, true);
  assert.equal(downloaded.filename, 'asci-process-manifest.json');
  assert.equal(downloaded.blob.options.type, 'application/json;charset=utf-8');
  assert.match(downloaded.blob.parts[0], /"manifestVersion"/);
  assert.equal(button.disabled, false);
});

test('screen three exposes the process manifest and simulated metric boundary', () => {
  const html = fs.readFileSync(path.join(ASCI_DIR, 'index.html'), 'utf8');

  assert.match(html, /id="s3ProcessManifest"/);
  assert.match(html, /本次过程清单/);
  assert.match(html, /模拟流程指标/);
  assert.match(html, /exportProcessManifest/);
});

test('demo metrics are explicitly process indicators rather than research accuracy', () => {
  const context = loadAsci();

  assert.equal(context.SIMULATED_PROCESS_METRICS.label, '模拟流程指标');
  assert.ok(context.SIMULATED_PROCESS_METRICS.items.length >= 3);
  assert.match(context.SIMULATED_PROCESS_METRICS.note, /不代表论文真实性或综述正确率/);
});

test('result screen renders simulated process metrics instead of research confidence claims', () => {
  const context = loadRuntime();
  context.document = makeTaskDocument();

  context.renderScreen3();

  const bars = context.document.getElementById('s3CredBars').innerHTML;
  const summary = context.document.getElementById('s3CredSummary').innerHTML;
  assert.match(bars, /节点覆盖/);
  assert.match(bars, /人工闭环/);
  assert.doesNotMatch(bars, /来源质量|推理链路/);
  assert.match(summary, /模拟流程指标/);
  assert.match(summary, /不代表论文真实性或综述正确率/);
});

test('resolving the last screening decision clears the stale blocked status', () => {
  const context = loadRuntime();
  const screeningIdx = context.activePipeline.indexOf('abstract-screen');
  context.currentNodeIdx = screeningIdx;
  context.doneSets.add('abstract-screen');
  context.nodeUserData['abstract-screen'] = context.cloneData(
    context.NODE_REGISTRY['abstract-screen'].result
  );
  context.nodeUserData['abstract-screen'].borderline.forEach((paper, index) => {
    paper.decision = index === 0 ? 'exclude' : 'include';
  });
  context.document.getElementById('nextBtn').disabled = true;
  context.document.getElementById('ctrlProgress').textContent = '还有 1 篇边界文献待判断';

  context.updateNextBtnState();

  assert.equal(context.document.getElementById('nextBtn').disabled, false);
  assert.equal(context.document.getElementById('ctrlProgress').textContent, '节点完成 · 请确认后继续');
});
