// ============================================================
// engine.js — ASCI 执行引擎
// 包含：runNode、finishNode、handleNext、handleBack、doBack
//       降级策略、非线性扩展、确认 Modal、日志相关
// ============================================================

// ---- 置信度计算 ----
function calcConfidence(nodeId) {
  var base = CONF_BY_NODE[nodeId] || 80;
  var delta = 0;

  if (nodeId === 'abstract-screen') {
    var ud = nodeUserData['abstract-screen'];
    if (ud && ud.borderline) {
      var accepted = ud.borderline.filter(function (p) { return p.decision === 'include'; }).length;
      if (accepted < 1) delta -= 5;
    }
  }
  if (nodeId === 'fulltext-read' || nodeId === 'contradiction-detect') {
    var ud2 = nodeUserData[nodeId];
    var decision = ud2 && ud2.contradiction ? ud2.contradiction.decision : null;
    if (decision === 'exclude') delta -= 8;
    else if (decision === 'both') delta -= 3;
    else if (decision === 'A' || decision === 'B') delta += 2;
  }
  if (nodeId === 'review-write' && degradeMode) delta -= 12;

  return Math.max(60, Math.min(99, base + delta));
}

// ---- 日志追加 ----
function appendLog(level, text, nodeId) {
  var d = new Date();
  var ts = d.toTimeString().slice(0, 8);
  var div = document.createElement('div');
  div.className = 'log-line';
  if (nodeId) div.setAttribute('data-nodeid', nodeId);
  div.innerHTML = '<span class="log-ts">[' + ts + ']</span>' +
    '<span class="log-lvl log-lvl-' + level.toLowerCase() + '">' + level + '</span> ' + escHtml(text);
  document.getElementById('logBody').appendChild(div);
  document.getElementById('logPanel').scrollTop = 99999;

  if (level === 'WARN') {
    logWarnCount++;
    var badge = document.getElementById('logWarnBadge');
    if (badge) {
      badge.textContent = '⚠ ' + logWarnCount + ' 条警告';
      badge.classList.remove('hidden');
    }
  }
}

// ---- 决策记录追加 ----
function appendHitlDecisionLog(stepLabel, decisionText) {
  var wrap = document.getElementById('artifactsDecisions');
  if (!wrap) return;
  var empty = wrap.querySelector('.artifacts-empty');
  if (empty) empty.remove();

  var item = document.createElement('div');
  item.className = 'artifacts-decision-item';
  item.innerHTML = '<strong>' + escHtml(stepLabel) + '</strong>：' + escHtml(decisionText);
  wrap.appendChild(item);
}

// ---- 工具标签追加 ----
function appendArtifactTool(toolName) {
  var wrap = document.getElementById('artifactsTools');
  if (!wrap) return;
  var existing = wrap.querySelectorAll('.artifacts-tool-tag');
  for (var i = 0; i < existing.length; i++) {
    if (existing[i].textContent === toolName) return;
  }
  var empty = wrap.querySelector('.artifacts-empty');
  if (empty) empty.remove();

  var tag = document.createElement('span');
  tag.className = 'artifacts-tool-tag';
  tag.textContent = toolName;
  wrap.appendChild(tag);
}

// ---- HITL 状态更新 ----
function updateHitlStatus(nodeId) {
  var node = NODE_REGISTRY[nodeId];
  var box = document.getElementById('hitlStatusBox');
  if (!box || !node) return;

  if (node.risk === 'high') {
    box.className = 'hitl-status hitl-status-required';
    box.textContent = '⚠ 高风险步骤：必须完成人工处置才能继续';
  } else if (node.risk === 'medium') {
    box.className = 'hitl-status hitl-status-wait';
    box.textContent = '📋 中风险：建议审核结果后再继续';
  } else {
    box.className = 'hitl-status hitl-status-done';
    box.textContent = '✓ 低风险：可直接继续，或选择审核修改';
  }
}

// ---- 下一步按钮状态 ----
function updateNextBtnState() {
  var currentNodeId = activePipeline[currentNodeIdx];

  // 检查当前节点是否有未完成的 HITL
  if (currentNodeId && doneSets.has(currentNodeId)) {
    var node = NODE_REGISTRY[currentNodeId];
    if (node && node.risk === 'high') {
      var ud = nodeUserData[currentNodeId];
      if (ud && ud.contradiction && !ud.contradiction.decision) {
        document.getElementById('nextBtn').disabled = true;
        document.getElementById('ctrlProgress').textContent = '⚠ 请先处置矛盾文献';
        return;
      }
    }
    if (node && node.id === 'abstract-screen') {
      var ud2 = nodeUserData['abstract-screen'];
      if (ud2 && ud2.borderline) {
        var undecided = ud2.borderline.filter(function (p) { return !p.decision; }).length;
        if (undecided > 0) {
          document.getElementById('nextBtn').disabled = true;
          document.getElementById('ctrlProgress').textContent = '还有 ' + undecided + ' 篇边界文献待判断';
          return;
        }
      }
    }
  }

  var btn = document.getElementById('nextBtn');
  if (currentNodeIdx < activePipeline.length - 1 && !isRunning) {
    btn.disabled = false;
  }
}

// ---- 面板更新 ----
function updatePanel(nodeId, state) {
  var node = NODE_REGISTRY[nodeId];
  if (!node) return;

  if (state === 'done') {
    var pct = calcConfidence(nodeId);
    confHistory.push({ nodeId: nodeId, val: pct });
    updateConfMiniChart();

    var doneCount = doneSets.size;
    var totalCount = activePipeline.length;
    document.getElementById('progressBar').style.width = (doneCount / totalCount * 100) + '%';
    document.getElementById('progressText').textContent = '节点 ' + doneCount + ' / ' + totalCount;

    node.tools.forEach(function (t) { appendArtifactTool(t); });
  }
}

// ---- 置信度折线图更新 ----
function updateConfMiniChart() {
  var svg = document.getElementById('confMiniChart');
  var line = document.getElementById('confMiniLine');
  var dots = document.getElementById('confMiniDots');
  var labels = document.getElementById('confMiniLabels');
  if (!svg || !line) return;

  var W = 200, H = 60, pad = 10;
  var vals = confHistory.map(function (c) { return c.val; });
  var minV = Math.min.apply(null, vals.concat([60]));
  var maxV = Math.max.apply(null, vals.concat([100]));
  var range = maxV - minV || 10;

  var pts = vals.map(function (v, i) {
    var x = pad + (vals.length > 1 ? i / (vals.length - 1) * (W - 2 * pad) : (W - 2 * pad) / 2);
    var y = H - pad - ((v - minV) / range * (H - 2 * pad));
    return x.toFixed(1) + ',' + y.toFixed(1);
  });

  line.setAttribute('points', pts.join(' '));

  dots.innerHTML = '';
  vals.forEach(function (v, i) {
    var parts = pts[i].split(',');
    var circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', parts[0]);
    circle.setAttribute('cy', parts[1]);
    circle.setAttribute('r', '3');
    circle.setAttribute('fill', 'var(--asci-blue)');
    var title = document.createElementNS('http://www.w3.org/2000/svg', 'title');
    title.textContent = NODE_REGISTRY[confHistory[i].nodeId] ?
      NODE_REGISTRY[confHistory[i].nodeId].name + ': ' + v + '%' :
      confHistory[i].nodeId + ': ' + v + '%';
    circle.appendChild(title);
    dots.appendChild(circle);
  });

  labels.innerHTML = '';
  confHistory.forEach(function (c, i) {
    var span = document.createElement('span');
    span.className = 'conf-mini-label';
    var node = NODE_REGISTRY[c.nodeId];
    var shortName = node ? node.name.slice(0, 4) : c.nodeId.slice(0, 4);
    span.textContent = shortName + ':' + c.val + '%';
    labels.appendChild(span);
  });
}

// ---- 执行节点 ----
async function runNode(nodeId) {
  nodeState[nodeId] = 'running';
  document.getElementById('backBtn').disabled = true;

  var node = NODE_REGISTRY[nodeId];
  if (!node) { console.error('Unknown node:', nodeId); return; }

  document.getElementById('ctrlProgress').textContent =
    '正在执行：' + node.name + ' (' + (currentNodeIdx + 1) + '/' + activePipeline.length + ')';
  updatePanel(nodeId, 'running');
  renderTree();

  var errorCount = 0;
  for (var i = 0; i < node.logs.length; i++) {
    var logEntry = node.logs[i];
    if (logEntry._resume_only) continue;
    await sleep(300 + Math.random() * 500);
    appendLog(logEntry.level, logEntry.text, nodeId);

    if (logEntry._trigger === 'error1') {
      errorCount = 1;
      await sleep(600);
    } else if (logEntry._trigger === 'error2') {
      errorCount = 2;
      await sleep(600);
    } else if (logEntry._trigger === 'error3') {
      errorCount = 3;
      isRunning = false;
      showDegradePanel(nodeId);
      return;
    }
  }

  finishNode(nodeId);
}

// ---- 完成节点 ----
function finishNode(nodeId) {
  doneSets.add(nodeId);
  nodeState[nodeId] = 'done';
  isRunning = false;
  updatePanel(nodeId, 'done');
  renderTree();
  renderNodeResult(nodeId);

  var btn = document.getElementById('nextBtn');
  btn.disabled = false;

  var isLast = (currentNodeIdx >= activePipeline.length - 1);

  if (!isLast) {
    btn.textContent = '▶ 执行下一步';
    document.getElementById('ctrlProgress').textContent =
      '节点完成 · 请审核结果后继续';
    updateHitlStatus(nodeId);
  } else {
    btn.textContent = '✓ 查看结果';
    btn.onclick = function () { renderScreen3(); showScreen(3); };
    document.getElementById('ctrlProgress').textContent = '全部完成 · 点击查看综述结果';
    var taskBadge = document.getElementById('taskBadge');
    if (taskBadge) {
      taskBadge.textContent = '执行完成';
      taskBadge.className = 'asci-badge asci-badge-done';
    }
    updateHitlStatus(nodeId);
  }

  document.getElementById('backBtn').disabled = false;

  // 渲染非线性扩展按钮
  renderNonlinearActions(nodeId);
  updateNextBtnState();
}

// ---- 非线性扩展按钮 ----
function renderNonlinearActions(nodeId) {
  var actionsEl = document.getElementById('nonlinearActions');
  if (actionsEl) actionsEl.remove();

  var btnDefs = [];

  if (nodeId === 'db-search' && activePipeline.indexOf('citation-chase') < 0) {
    btnDefs.push({ label: '+ 引文追踪', nodeToInsert: 'citation-chase', afterNode: 'db-search' });
  }
  if (nodeId === 'abstract-screen' && activePipeline.indexOf('expand-search') < 0) {
    btnDefs.push({ label: '+ 焦点扩展搜索', nodeToInsert: 'expand-search', afterNode: 'abstract-screen' });
  }

  if (!btnDefs.length) return;

  var wrap = document.createElement('div');
  wrap.className = 'nonlinear-actions';
  wrap.id = 'nonlinearActions';

  btnDefs.forEach(function (def) {
    var btn = document.createElement('button');
    btn.className = 'nonlinear-btn';
    btn.textContent = def.label;
    btn.onclick = function () { insertNonlinearNode(def.nodeToInsert, def.afterNode); wrap.remove(); };
    wrap.appendChild(btn);
  });

  // 追加到主内容区末尾
  var main = document.getElementById('mainContent');
  if (main) main.appendChild(wrap);
}

// ---- 插入非线性节点 ----
function insertNonlinearNode(nodeId, afterNodeId) {
  var afterIdx = activePipeline.indexOf(afterNodeId);
  if (afterIdx < 0) return;
  activePipeline.splice(afterIdx + 1, 0, nodeId);
  nodeState[nodeId] = 'pending';
  appendLog('INFO', '已插入节点：' + NODE_REGISTRY[nodeId].name + '（将在当前位置之后执行）');
  renderTree();
  showToast('已添加：' + NODE_REGISTRY[nodeId].name);
}

// ---- 执行下一步 ----
function handleNext() {
  if (isRunning) return;
  if (currentNodeIdx >= activePipeline.length - 1) return;

  isRunning = true;
  var btn = document.getElementById('nextBtn');
  btn.disabled = true;
  btn.textContent = '执行中...';
  btn.classList.remove('checkpoint-mode');

  currentNodeIdx++;
  var nodeId = activePipeline[currentNodeIdx];
  runNode(nodeId);
}

// ---- 显示某步骤结果（点击已完成步骤时）----
function showStepInMain(nodeId) {
  document.querySelectorAll('.tree-step').forEach(function (el) { el.classList.remove('active'); });
  // 高亮该节点
  var allSteps = document.getElementById('taskTree').querySelectorAll('.tree-step');
  var nodeIdx = activePipeline.indexOf(nodeId);
  if (allSteps[nodeIdx]) allSteps[nodeIdx].classList.add('active');
  renderNodeResult(nodeId);
}

// ---- 回退 ----
function handleBack() {
  if (isRunning) return;
  if (currentNodeIdx <= 0) return;

  var targetIdx = currentNodeIdx - 1;
  var currentNodeId = activePipeline[currentNodeIdx];

  if (doneSets.has(currentNodeId)) {
    var targetNode = NODE_REGISTRY[activePipeline[targetIdx]];
    var targetName = targetNode ? targetNode.name : '前一节点';
    var curNode = NODE_REGISTRY[currentNodeId];
    var curName = curNode ? curNode.name : '当前节点';
    showConfirmModal(
      '⚠ 确认回退？',
      '回退到"' + targetName + '"将清除"' + curName + '"及之后所有节点的执行结果。',
      function () { doBack(targetIdx); }
    );
  } else {
    doBack(targetIdx);
  }
}

function doBack(targetIdx) {
  // 清除 targetIdx+1 及之后的所有节点状态
  for (var i = targetIdx + 1; i < activePipeline.length; i++) {
    var nid = activePipeline[i];
    doneSets.delete(nid);
    delete nodeUserData[nid];
    nodeState[nid] = 'pending';
  }

  // 裁剪日志：移除 data-nodeid 在 targetIdx+1 之后的行
  var removedNodeIds = activePipeline.slice(targetIdx + 1);
  var logLines = document.getElementById('logBody').querySelectorAll('.log-line[data-nodeid]');
  logLines.forEach(function (line) {
    if (removedNodeIds.indexOf(line.getAttribute('data-nodeid')) >= 0) line.remove();
  });

  currentNodeIdx = targetIdx;
  isRunning = false;
  awaitingCheckpoint = false;

  // 截断置信度历史
  var keepNodeIds = activePipeline.slice(0, targetIdx + 1);
  confHistory = confHistory.filter(function (c) {
    return keepNodeIds.indexOf(c.nodeId) >= 0;
  });
  updateConfMiniChart();

  if (targetIdx < 0) {
    document.getElementById('backBtn').disabled = true;
    document.getElementById('nextBtn').textContent = '▶ 执行下一步';
    document.getElementById('nextBtn').onclick = handleNext;
    document.getElementById('nextBtn').disabled = false;
    document.getElementById('ctrlProgress').textContent = '准备就绪 · 共 ' + activePipeline.length + ' 个节点';
    document.getElementById('progressBar').style.width = '0%';
    document.getElementById('progressText').textContent = '节点 0 / ' + activePipeline.length;
    document.getElementById('hitlStatusBox').className = 'hitl-status hitl-status-wait';
    document.getElementById('hitlStatusBox').textContent = '等待任务启动...';
    document.getElementById('mainContent').innerHTML =
      '<div class="main-content-empty">' +
      '<div class="main-empty-icon">⏳</div>' +
      '<div class="main-empty-title">等待执行</div>' +
      '<div class="main-empty-sub">点击"执行下一步"开始第一个节点</div>' +
      '</div>';
  } else {
    var targetNodeId = activePipeline[targetIdx];
    document.getElementById('progressBar').style.width = ((targetIdx + 1) / activePipeline.length * 100) + '%';
    document.getElementById('progressText').textContent = '节点 ' + (targetIdx + 1) + ' / ' + activePipeline.length;
    updateHitlStatus(targetNodeId);
    document.getElementById('nextBtn').textContent = '▶ 执行下一步';
    document.getElementById('nextBtn').onclick = handleNext;
    document.getElementById('nextBtn').disabled = false;
    document.getElementById('backBtn').disabled = (targetIdx <= 0);
    document.getElementById('ctrlProgress').textContent = '已回退至"' + NODE_REGISTRY[targetNodeId].name + '"· 准备重新执行下一步';
    renderNodeResult(targetNodeId);
    updateNextBtnState();
  }

  renderTree();
  var prevNode = activePipeline[targetIdx];
  appendLog('INFO', '← 已回退至节点"' + (prevNode && NODE_REGISTRY[prevNode] ? NODE_REGISTRY[prevNode].name : '起始') + '"，后续节点结果已清除');
}

// ---- 降级策略 ----
function appendDegradeWarningBanner() {
  var banner = document.createElement('div');
  banner.className = 'log-degrade-banner';
  banner.textContent = '⛔ 连续 3 次执行失败 · 已进入异常处理模式 · 需人工决策';
  document.getElementById('logBody').appendChild(banner);
  document.getElementById('logPanel').scrollTop = 99999;
}

function showDegradePanel(nodeId) {
  degradeMode = true;
  appendDegradeWarningBanner();
  var main = document.getElementById('mainContent');
  main.innerHTML =
    '<div class="degrade-header">' +
    '<div class="degrade-icon">⚠</div>' +
    '<div class="degrade-title">异常处理模式</div>' +
    '<div class="degrade-desc">连续 3 次执行失败，AI 已达能力边界<br>请选择处理路径</div>' +
    '</div>' +
    '<div class="degrade-reason">' +
    '<div class="degrade-reason-label">失败原因分析</div>' +
    '<div class="degrade-reason-text">综述报告生成涉及跨步骤结论综合，当前上下文中存在未完全解决的矛盾，导致模型无法生成一致性输出。</div>' +
    '</div>' +
    '<div class="degrade-options">' +
    '<button class="degrade-btn degrade-btn-a" onclick="handleDegrade(\'retry\',\'' + nodeId + '\')">' +
    '<div class="degrade-btn-title">🔄 调整参数重试</div>' +
    '<div class="degrade-btn-desc">提高采样温度，引入多样性</div>' +
    '</button>' +
    '<button class="degrade-btn degrade-btn-b" onclick="handleDegrade(\'model\',\'' + nodeId + '\')">' +
    '<div class="degrade-btn-title">🔀 切换备用模型</div>' +
    '<div class="degrade-btn-desc">使用更大参数量模型重新生成</div>' +
    '</button>' +
    '<button class="degrade-btn degrade-btn-c" onclick="handleDegrade(\'human\',\'' + nodeId + '\')">' +
    '<div class="degrade-btn-title">👤 人工接管</div>' +
    '<div class="degrade-btn-desc">AI 提供草稿，由你完成编辑</div>' +
    '</button>' +
    '</div>';
}

function handleDegrade(choice, nodeId) {
  var label = choice === 'retry' ? '调整参数重试' : choice === 'model' ? '切换备用模型' : '人工接管';
  var nodeName = NODE_REGISTRY[nodeId] ? NODE_REGISTRY[nodeId].name : nodeId;
  appendHitlDecisionLog(nodeName + ' · 异常处理', label);

  if (choice === 'human') {
    showDraftEditor(nodeId);
  } else {
    var msg = choice === 'retry' ? '参数调整完成，重新执行...' : '已切换至备用模型，重新执行...';
    appendLog('INFO', msg, nodeId);
    isRunning = true;
    sleep(1500).then(function () { resumeNode(nodeId); });
  }
}

function showDraftEditor(nodeId) {
  var draft = '# Transformer 架构在药物发现中的应用综述\n\n' +
    '## 1. 引言：Transformer 架构概述\n' +
    '自注意力机制原理；从 NLP 到生物医学的迁移路径。\n\n' +
    '## 2. 分子属性预测应用\n' +
    'ChemBERTa / MolBERT 预训练范式；MoleculeNet 基准对比。\n\n' +
    '## 3. 药物-靶点相互作用识别\n' +
    '双编码器架构；BindingDB / Davis 数据集结果。\n\n' +
    '## 4. 从头分子生成\n' +
    'REINVENT 变体；QED × SA 综合指标；3D 构象局限性。\n\n' +
    '## 5. 局限性与未来方向\n' +
    '可解释性不足；标注数据稀缺；多模态整合趋势。';
  draftContent = draft;

  var main = document.getElementById('mainContent');
  main.innerHTML =
    '<div class="draft-header">' +
    '<div class="draft-title">📝 AI 草稿（可编辑）</div>' +
    '<div class="draft-desc">请修改草稿内容后提交，系统将接回自动流程</div>' +
    '</div>' +
    '<textarea class="draft-textarea" id="draftTextarea">' + escHtml(draft) + '</textarea>' +
    '<button class="draft-submit-btn" onclick="submitDraft(\'' + nodeId + '\')">✓ 确认提交，接回自动流程</button>';
  document.getElementById('nextBtn').disabled = true;
}

function submitDraft(nodeId) {
  var ta = document.getElementById('draftTextarea');
  if (!ta || !ta.value.trim()) {
    alert('请输入内容后再提交');
    return;
  }
  draftContent = ta.value;
  humanEdited = true;
  appendLog('INFO', '✓ 人工草稿已提交，接回自动流程', nodeId);
  var nodeName = NODE_REGISTRY[nodeId] ? NODE_REGISTRY[nodeId].name : nodeId;
  appendHitlDecisionLog(nodeName + ' · 草稿编辑', '人工修改完成');
  document.getElementById('nextBtn').disabled = false;
  isRunning = true;
  sleep(800).then(function () { resumeNode(nodeId); });
}

async function resumeNode(nodeId) {
  var node = NODE_REGISTRY[nodeId];
  if (!node) return;
  var startFromNormal = false;
  for (var i = 0; i < node.logs.length; i++) {
    var logEntry = node.logs[i];
    if (logEntry._trigger === 'error3') { startFromNormal = true; continue; }
    if (!startFromNormal) continue;
    await sleep(300 + Math.random() * 500);
    appendLog(logEntry.level, logEntry.text, nodeId);
  }
  finishNode(nodeId);
}

// ---- 快速演示降级 ----
function jumpToDegradeDemo() {
  // 快速完成前 N-1 个节点（跳过 HITL）
  var demoNodes = activePipeline.slice(0, activePipeline.length - 1);
  demoNodes.forEach(function (nid) {
    doneSets.add(nid);
    nodeState[nid] = 'done';
  });
  currentNodeIdx = activePipeline.length - 2;

  // 补齐置信度历史
  confHistory = [];
  demoNodes.forEach(function (nid) {
    confHistory.push({ nodeId: nid, val: CONF_BY_NODE[nid] || 80 });
  });
  updateConfMiniChart();

  var total = activePipeline.length;
  document.getElementById('progressBar').style.width = ((total - 1) / total * 100) + '%';
  document.getElementById('progressText').textContent = '节点 ' + (total - 1) + ' / ' + total;

  renderTree();
  document.getElementById('ctrlProgress').textContent = '前 ' + (total - 1) + ' 步已跳过 · 直接演示最后节点降级流程';

  var btn = document.getElementById('nextBtn');
  btn.disabled = false;
  btn.textContent = '▶ 执行下一步';
  btn.onclick = handleNext;
  document.getElementById('backBtn').disabled = false;
}

// ---- 确认 Modal ----
function showConfirmModal(title, body, onConfirm) {
  var overlay = document.createElement('div');
  overlay.className = 'confirm-overlay';
  overlay.innerHTML = '<div class="confirm-modal">' +
    '<div class="confirm-modal-title">' + escHtml(title) + '</div>' +
    '<div class="confirm-modal-body">' + escHtml(body) + '</div>' +
    '<div class="confirm-modal-actions">' +
    '<button class="confirm-btn-cancel" onclick="this.closest(\'.confirm-overlay\').remove()">取消</button>' +
    '<button class="confirm-btn-ok" id="confirmOkBtn">确认回退</button>' +
    '</div></div>';
  document.body.appendChild(overlay);
  overlay.querySelector('#confirmOkBtn').onclick = function () {
    overlay.remove();
    onConfirm();
  };
}

// ---- 日志折叠 ----
function toggleLog() {
  var section = document.getElementById('logSection');
  var btn = document.getElementById('logToggleBtn');
  if (!section || !btn) return;
  section.classList.toggle('collapsed');
  btn.textContent = section.classList.contains('collapsed') ? '▲ 展开日志' : '▼ 收起日志';
}
