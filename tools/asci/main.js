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

// Screen1 配置器状态
var s1SelectedTemplate = 'quick';  // 当前选中的模板 ID
var researchTopic = 'Transformer in Drug Discovery';

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
  renderPipelinePreview();
  renderTemplateButtons();
  updateStartBtn();
}

function renderNodeGrid() {
  var container = document.getElementById('nodeGridContainer');
  if (!container) return;

  // 按类别分组
  var categories = [
    { key: 'config', label: '配置' },
    { key: 'discovery', label: '发现' },
    { key: 'filter', label: '筛选' },
    { key: 'analysis', label: '分析' },
    { key: 'output', label: '输出' }
  ];

  var html = '';
  categories.forEach(function (cat) {
    var nodes = Object.values(NODE_REGISTRY).filter(function (n) { return n.category === cat.key; });
    if (!nodes.length) return;

    html += '<div class="s1-node-category">';
    html += '<div class="s1-node-category-label">' + cat.label + '</div>';
    html += '<div class="s1-node-grid">';
    nodes.forEach(function (node) {
      var isSelected = activePipeline.indexOf(node.id) >= 0;
      html += '<span class="s1-node-chip' + (isSelected ? ' selected' : '') + '" onclick="toggleNode(\'' + node.id + '\')">' +
        node.icon + ' ' + node.name +
        '</span>';
    });
    html += '</div></div>';
  });

  container.innerHTML = html;
}

function renderPipelinePreview() {
  var list = document.getElementById('pipelineList');
  if (!list) return;

  if (!activePipeline.length) {
    list.innerHTML = '<div class="s1-pipeline-empty">从左侧选择节点，或使用预设模板</div>';
    return;
  }

  var html = '';
  activePipeline.forEach(function (nodeId, idx) {
    var node = NODE_REGISTRY[nodeId];
    if (!node) return;
    html += '<div class="s1-pipeline-item">' +
      '<span class="pipe-icon">' + node.icon + '</span>' +
      '<span class="pipe-name">' + node.name + '</span>' +
      '<span class="pipe-arrow">' +
      '<button class="pipe-move-btn" onclick="moveNode(\'' + nodeId + '\',-1)" ' + (idx === 0 ? 'disabled' : '') + '>▲</button>' +
      '<button class="pipe-move-btn" onclick="moveNode(\'' + nodeId + '\',1)" ' + (idx === activePipeline.length - 1 ? 'disabled' : '') + '>▼</button>' +
      '</span>' +
      '</div>';
    if (idx < activePipeline.length - 1) {
      html += '<div class="s1-pipeline-arrow">↓</div>';
    }
  });

  list.innerHTML = html;
}

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
  activePipeline = tpl.nodes.slice();
  renderNodeGrid();
  renderPipelinePreview();
  renderTemplateButtons();
  updateStartBtn();
}

function toggleNode(nodeId) {
  var idx = activePipeline.indexOf(nodeId);
  if (idx >= 0) {
    activePipeline.splice(idx, 1);
  } else {
    activePipeline.push(nodeId);
  }
  s1SelectedTemplate = null; // 手动修改后清空模板选中
  renderNodeGrid();
  renderPipelinePreview();
  renderTemplateButtons();
  updateStartBtn();
}

function moveNode(nodeId, dir) {
  var idx = activePipeline.indexOf(nodeId);
  if (idx < 0) return;
  var newIdx = idx + dir;
  if (newIdx < 0 || newIdx >= activePipeline.length) return;
  var tmp = activePipeline[idx];
  activePipeline[idx] = activePipeline[newIdx];
  activePipeline[newIdx] = tmp;
  s1SelectedTemplate = null;
  renderPipelinePreview();
  renderTemplateButtons();
}

// ---- 启动任务 ----

function startTask() {
  var topicInput = document.getElementById('topicInput');
  if (topicInput) {
    researchTopic = topicInput.value.trim() || 'Transformer in Drug Discovery';
  }

  if (!activePipeline.length) {
    showToast('请先选择至少一个节点或选择预设模板');
    return;
  }

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

  // 重置为快速综述模板
  s1SelectedTemplate = 'quick';
  activePipeline = PIPELINE_TEMPLATES.quick.nodes.slice();

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

  // 重置日志折叠状态
  var logSection = document.getElementById('logSection');
  if (logSection) logSection.classList.remove('collapsed');
  var logToggleBtn = document.getElementById('logToggleBtn');
  if (logToggleBtn) logToggleBtn.textContent = '▼ 收起日志';

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

  // 重置置信度折线图
  var line = document.getElementById('confMiniLine');
  if (line) line.setAttribute('points', '');
  var dotsEl = document.getElementById('confMiniDots');
  if (dotsEl) dotsEl.innerHTML = '';
  var labelsEl = document.getElementById('confMiniLabels');
  if (labelsEl) labelsEl.innerHTML = '';

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

// ---- 页面初始化 ----
(function init() {
  // 默认选中快速综述模板
  selectTemplate('quick');
})();
