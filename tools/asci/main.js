// ============================================================
// main.js — ASCI 全局状态 + 入口函数 + Screen 1 流程配置器
// ============================================================

// ---- 全局状态变量 ----
var activePipeline = [];        // 当前管线（节点 ID 有序列表）
var nodeState = {};             // { nodeId: 'pending'|'running'|'done' }
var nodeUserData = {};          // 替代 stepUserData，key = nodeId
var currentNodeIdx = -1;       // 管线中当前位置（-1 = 尚未开始）
var isRunning = false;
var awaitingCheckpoint = false;
var degradeMode = false;
var humanEdited = false;
var draftContent = '';
var confHistory = [];           // [{ nodeId, val }]
var logWarnCount = 0;
var doneSets = new Set();       // 已完成的节点 ID 集合
var auditTrail = [];            // 可复现的人工/系统决策轨迹
var fallbackHistory = [];       // 降级路径选择
var dynamicInsertions = [];     // 动态插入节点记录
var rerunHistory = [];          // 重跑记录

// Screen1 配置器状态
var s1SelectedTemplate = 'quick';  // 当前选中的模板 ID
var researchTopic = DEMO_META.defaultTopic;
var taskContract = null;           // 本次任务锁定的研究协议与固定数据包快照
var topicInputBound = false;

// ---- 深化契约：任务启动时锁定协议和数据包 ----
function recordAuditEvent(event) {
  var input = event || {};
  var normalized = {
    version: DEMO_META.version,
    timestamp: input.timestamp || new Date().toISOString(),
    node: String(input.node || 'task'),
    action: String(input.action || 'unknown'),
    reason: String(input.reason || '未提供理由'),
    impactScope: String(input.impactScope || '未声明影响范围'),
    mode: String(input.mode || DEMO_META.mode)
  };
  auditTrail.push(normalized);
  return cloneData(normalized);
}

function getAuditTrailSnapshot() {
  return cloneData(auditTrail);
}

function cloneData(value) {
  return JSON.parse(JSON.stringify(value));
}

function getDefaultResearchProtocol() {
  return RESEARCH_PROTOCOLS[DEFAULT_RESEARCH_PROTOCOL_ID];
}

function createTaskContractSnapshot(topic) {
  var requestedTopic = String(topic || DEMO_META.defaultTopic).trim() || DEMO_META.defaultTopic;
  var protocol = getDefaultResearchProtocol();
  return {
    version: DEMO_META.version,
    requestedTopic: requestedTopic,
    titleTopic: requestedTopic,
    topicMode: requestedTopic === DEMO_META.defaultTopic ? 'preset' : 'custom-title-only',
    protocol: cloneData(protocol),
    dataPackage: cloneData(FIXED_DATA_PACKAGE),
    pipeline: activePipeline.slice(),
    templateId: s1SelectedTemplate || 'custom'
  };
}

function getTaskContractSnapshot() {
  return taskContract ? cloneData(taskContract) : null;
}

function renderResearchProtocolCard() {
  var card = document.getElementById('researchProtocolCard');
  if (!card) return;
  var protocol = getDefaultResearchProtocol();
  card.innerHTML =
    '<div class="s1-protocol-kicker">研究协议预检</div>' +
    '<div class="s1-protocol-title">' + escHtml(protocol.name) + '</div>' +
    '<div class="s1-protocol-question">' + escHtml(protocol.question) + '</div>' +
    '<div class="s1-protocol-meta"><span>年份：' + protocol.years[0] + '–' + protocol.years[1] + '</span>' +
      '<span>来源：' + protocol.sources.length + ' 类</span></div>' +
    '<div class="s1-protocol-boundary"><strong>' + escHtml(FIXED_DATA_PACKAGE.label) + '</strong>：' +
      escHtml(FIXED_DATA_PACKAGE.topic) + ' · ' + escHtml(FIXED_DATA_PACKAGE.scope) + '</div>' +
    '<div class="s1-protocol-rules">纳入 ' + protocol.inclusionRules.length + ' 条 · 排除 ' +
      protocol.exclusionRules.length + ' 条 · 交付物 ' + protocol.deliverables.length + ' 项</div>';
}

function updateTopicScopeNotice() {
  var input = document.getElementById('topicInput');
  var notice = document.getElementById('topicScopeNotice');
  if (!input || !notice) return;
  var topic = input.value.trim() || DEMO_META.defaultTopic;
  notice.textContent = topic === DEMO_META.defaultTopic
    ? '当前主题匹配固定数据包，可按预设协议演示。'
    : '流程演示，结果仍使用预设数据包；当前主题只会写入任务标题。';
  notice.className = 's1-topic-scope' + (topic === DEMO_META.defaultTopic ? '' : ' custom');
}

// ---- 工具函数 ----
function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function sleep(ms) {
  return new Promise(function (r) { setTimeout(r, ms); });
}

function showScreen(n) {
  document.querySelectorAll('.asci-screen').forEach(function (s) {
    s.classList.add('hidden');
  });
  document.getElementById('screen' + n).classList.remove('hidden');
}

function showToast(msg) {
  var t = document.createElement('div');
  t.className = 'asci-toast';
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(function () { t.remove(); }, 2500);
}

// ---- Screen 1: 流程配置器渲染 ----

function renderScreen1() {
  renderNodeGrid();
  renderTemplateButtons();
  renderResearchProtocolCard();
  var topicInput = document.getElementById('topicInput');
  if (topicInput && !topicInputBound && topicInput.addEventListener) {
    topicInput.addEventListener('input', updateTopicScopeNotice);
    topicInputBound = true;
  }
  updateTopicScopeNotice();
  updateStartBtn();
}

function renderNodeGrid() {
  var container = document.getElementById('nodeGridContainer');
  if (!container) return;

  // 按类别分组
  var categories = [
    { key: 'config', label: '配置' },
    { key: 'discovery', label: '文献发现' },
    { key: 'filter', label: '质量筛选' },
    { key: 'analysis', label: '深度分析' },
    { key: 'output', label: '综述输出' }
  ];

  var html = '';
  categories.forEach(function (cat) {
    var nodes = Object.values(NODE_REGISTRY).filter(function (n) { return n.category === cat.key; });
    if (!nodes.length) return;

    html += '<div class="s1-group-label">' + cat.label + '</div>';
    html += '<div class="s1-group-grid">';
    nodes.forEach(function (node) {
      var isSelected = activePipeline.indexOf(node.id) >= 0;
      var classes = 's1-node-card';
      if (node.required) classes += ' required selected';
      else if (node.demoUnavailable) classes += ' demo-unavailable';
      else if (isSelected) classes += ' selected';

      var lockHtml = node.required ? '<span class="s1-card-lock">🔒</span>' : '';
      var desc = node.desc || '';

      html += '<div class="' + classes + '" onclick="toggleNode(\'' + node.id + '\')">' +
        '<div class="s1-card-top">' +
        '<span class="s1-card-icon">' + node.icon + '</span>' +
        '<span class="s1-card-name">' + escHtml(node.name) + '</span>' +
        lockHtml +
        '</div>' +
        '<div class="s1-card-desc">' + escHtml(desc) + '</div>' +
        '</div>';
    });
    html += '</div>';
  });

  container.innerHTML = html;
}

// renderPipelinePreview 已移除（任务 2：移除排序列）

function renderTemplateButtons() {
  var container = document.getElementById('templateButtons');
  if (!container) return;

  var html = '';
  Object.values(PIPELINE_TEMPLATES).forEach(function (tpl) {
    var isActive = s1SelectedTemplate === tpl.id;
    html += '<button class="s1-template-btn' + (isActive ? ' active' : '') + '" onclick="selectTemplate(\'' + tpl.id + '\')">' +
      tpl.name +
      '<span class="s1-template-badge">（' + tpl.desc + '）</span>' +
      '</button>';
  });

  container.innerHTML = html;
}

function updateStartBtn() {
  var btn = document.getElementById('startPipelineBtn');
  if (!btn) return;
  btn.disabled = activePipeline.length === 0;
}

// ---- Screen 1: 配置器交互 ----

function selectTemplate(templateId) {
  var tpl = PIPELINE_TEMPLATES[templateId];
  if (!tpl) return;
  s1SelectedTemplate = templateId;
  // 必选节点始终保留
  activePipeline = tpl.nodes.slice();
  ensureRequiredNodes();
  renderNodeGrid();
  renderTemplateButtons();
  renderResearchProtocolCard();
  updateTopicScopeNotice();
  updateStartBtn();
}

function toggleNode(nodeId) {
  var node = NODE_REGISTRY[nodeId];
  if (!node) return;
  // 必选节点：轻微抖动，不可取消
  if (node.required) {
    var el = document.querySelector('.s1-node-card.required[onclick*="' + nodeId + '"]');
    if (el) { el.style.animation = 'none'; el.offsetWidth; el.style.animation = 'shake 0.3s'; }
    showToast('「' + node.name + '」是必选节点，不可移除');
    return;
  }
  // 演示版不可用节点
  if (node.demoUnavailable) {
    showToast('演示版暂不支持，实际产品中可启用');
    return;
  }
  var idx = activePipeline.indexOf(nodeId);
  if (idx >= 0) {
    activePipeline.splice(idx, 1);
  } else {
    activePipeline.push(nodeId);
  }
  s1SelectedTemplate = null;
  renderNodeGrid();
  renderTemplateButtons();
  updateStartBtn();
}

// 确保必选节点始终在管线中
function ensureRequiredNodes() {
  var requiredIds = ['data-source-config', 'keyword-extract', 'db-search'];
  requiredIds.forEach(function (id) {
    if (activePipeline.indexOf(id) < 0) {
      activePipeline.unshift(id);
    }
  });
}

// ---- 启动任务 ----

function startTask() {
  var topicInput = document.getElementById('topicInput');
  if (topicInput) {
    researchTopic = topicInput.value.trim() || DEMO_META.defaultTopic;
  }

  ensureRequiredNodes();
  if (!activePipeline.length) {
    showToast('请先选择至少一个节点或选择预设模板');
    return;
  }

  taskContract = createTaskContractSnapshot(researchTopic);
  auditTrail = [];
  fallbackHistory = [];
  dynamicInsertions = [];
  rerunHistory = [];
  recordAuditEvent({
    node: 'task',
    action: 'task-start',
    reason: '锁定预设研究协议与固定演示数据包',
    impactScope: '整条演示管线'
  });

  // 初始化节点状态
  nodeState = {};
  nodeUserData = {};
  activePipeline.forEach(function (nodeId) {
    nodeState[nodeId] = 'pending';
  });
  currentNodeIdx = -1;
  doneSets.clear();

  // 更新 Screen 2 标题
  var titleEl = document.getElementById('topicTitle');
  if (titleEl) titleEl.textContent = '📚 文献综述 · ' + researchTopic;

  // 更新底部进度文字
  var ctrlProgress = document.getElementById('ctrlProgress');
  if (ctrlProgress) ctrlProgress.textContent = '准备就绪 · 共 ' + activePipeline.length + ' 个节点';

  showScreen(2);
  renderTree();
}

// ---- restart（完整重置）----

function restart() {
  currentNodeIdx = -1;
  isRunning = false;
  awaitingCheckpoint = false;
  degradeMode = false;
  humanEdited = false;
  draftContent = '';
  confHistory = [];
  logWarnCount = 0;
  doneSets.clear();
  nodeState = {};
  nodeUserData = {};
  taskContract = null;
  researchTopic = DEMO_META.defaultTopic;
  auditTrail = [];
  fallbackHistory = [];
  dynamicInsertions = [];
  rerunHistory = [];

  // 重置为快速综述模板
  s1SelectedTemplate = 'quick';
  activePipeline = PIPELINE_TEMPLATES.quick.nodes.slice();

  var topicInput = document.getElementById('topicInput');
  if (topicInput) topicInput.value = researchTopic;

  // 清空日志
  var logBody = document.getElementById('logBody');
  if (logBody) logBody.innerHTML = '';

  // 重置主内容区
  var mainContent = document.getElementById('mainContent');
  if (mainContent) {
    mainContent.innerHTML =
      '<div class="main-content-empty">' +
      '<div class="main-empty-icon">⏳</div>' +
      '<div class="main-empty-title">等待执行</div>' +
      '<div class="main-empty-sub">点击"执行下一步"开始第一个节点</div>' +
      '</div>';
  }

  // 重置对话框消息
  var chatMessages = document.getElementById('chatMessages');
  if (chatMessages) {
    chatMessages.innerHTML = '<div class="asci-chat-msg asci-chat-msg-agent">' +
      '<span class="asci-chat-avatar">🤖</span>' +
      '<div class="asci-chat-bubble">你好！我是 ASCI Agent。你可以问我节点执行状况、发起重跑或上传补充文献。</div>' +
      '</div>';
  }

  // 重置 Artifacts 面板
  var progressBar = document.getElementById('progressBar');
  if (progressBar) progressBar.style.width = '0%';
  var progressText = document.getElementById('progressText');
  if (progressText) progressText.textContent = '节点 0 / ' + activePipeline.length;
  var artifactsTools = document.getElementById('artifactsTools');
  if (artifactsTools) artifactsTools.innerHTML = '<span class="artifacts-empty">暂无</span>';
  var artifactsDecisions = document.getElementById('artifactsDecisions');
  if (artifactsDecisions) artifactsDecisions.innerHTML = '<span class="artifacts-empty">暂无人工决策</span>';
  var hitlStatusBox = document.getElementById('hitlStatusBox');
  if (hitlStatusBox) {
    hitlStatusBox.className = 'hitl-status hitl-status-wait';
    hitlStatusBox.textContent = '等待任务启动...';
  }

  // 重置日志警告 badge
  var warnBadge = document.getElementById('logWarnBadge');
  if (warnBadge) { warnBadge.textContent = '⚠ 0 条警告'; warnBadge.classList.add('hidden'); }

  // 重置按钮
  var nextBtn = document.getElementById('nextBtn');
  if (nextBtn) {
    nextBtn.textContent = '▶ 执行下一步';
    nextBtn.onclick = handleNext;
    nextBtn.disabled = false;
    nextBtn.classList.remove('checkpoint-mode');
  }
  var backBtn = document.getElementById('backBtn');
  if (backBtn) backBtn.disabled = true;
  var ctrlProgress = document.getElementById('ctrlProgress');
  if (ctrlProgress) ctrlProgress.textContent = '准备就绪 · 共 ' + activePipeline.length + ' 个步骤';

  var taskBadge = document.getElementById('taskBadge');
  if (taskBadge) {
    taskBadge.textContent = '任务执行中';
    taskBadge.className = 'asci-badge asci-badge-running';
  }

  showScreen(1);
  // 重新渲染 Screen 1
  renderScreen1();
}

// ---- 对话框函数 ----

function sendChatMsg() {
  var input = document.getElementById('chatInput');
  if (!input) return;
  var msg = input.value.trim();
  if (!msg) return;
  input.value = '';
  appendChatMsg('user', '👤', msg);

  // 关键词匹配 mock 响应
  var resp;
  if (/重跑|重新|再次|调整/.test(msg)) {
    resp = '请点击节点卡片右上角的 ↺ 按钮发起重跑，可调整参数后重新执行该节点。';
  } else if (/解释|什么是|为什么/.test(msg)) {
    var curNode = activePipeline[currentNodeIdx];
    var nodeName = curNode && NODE_REGISTRY[curNode] ? NODE_REGISTRY[curNode].name : '当前节点';
    var nodeDesc = curNode && NODE_REGISTRY[curNode] && NODE_REGISTRY[curNode].desc ? NODE_REGISTRY[curNode].desc : '暂无详细说明';
    resp = '「' + nodeName + '」：' + nodeDesc + '。如需了解更多，可继续追问。';
  } else if (/上传|论文|文献/.test(msg)) {
    resp = '当前为固定数据包演示；📎 仅记录附件入口，不读取或合并外部文献，任务结果不会改变。';
  } else {
    resp = '已记录问题，实际产品中将由 LLM 实时响应。';
  }

  setTimeout(function () { appendChatMsg('agent', '🤖', resp); }, 400);
}

function appendChatMsg(role, avatar, text) {
  var messages = document.getElementById('chatMessages');
  if (!messages) return;
  var div = document.createElement('div');
  div.className = 'asci-chat-msg asci-chat-msg-' + role;
  div.innerHTML = '<span class="asci-chat-avatar">' + avatar + '</span>' +
    '<div class="asci-chat-bubble">' + escHtml(text) + '</div>';
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
}

function handleUploadPaper(input) {
  if (!input.files || !input.files[0]) return;
  var fileName = input.files[0].name;
  appendChatMsg('agent', '🤖', '已记录《' + fileName + '》的附件入口；固定数据包不会读取或合并该文件，任务结果不会改变。');
  input.value = '';
}

// ---- 页面初始化 ----
(function init() {
  // 默认选中快速综述模板
  selectTemplate('quick');
})();
