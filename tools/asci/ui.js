// ============================================================
// ui.js — ASCI UI 渲染层
// 包含：renderTree、renderNodeResult、各类型结果渲染
//       renderScreen3、Paper Modal、Export、HITL Summary
// ============================================================

// ---- 左侧树渲染 ----
function renderTree() {
  var tree = document.getElementById('taskTree');
  if (!tree) return;
  tree.innerHTML = '';

  activePipeline.forEach(function (nodeId, idx) {
    var node = NODE_REGISTRY[nodeId];
    if (!node) return;

    var isDone = doneSets.has(nodeId);
    var isRunningNode = (nodeState[nodeId] === 'running');
    var isActive = (idx === currentNodeIdx);
    var statusKey = isDone ? 'done' : isRunningNode ? 'running' : 'pending';
    var statusLabel = { pending: '待执行', running: '执行中', done: '已完成' }[statusKey];

    var div = document.createElement('div');
    div.className = 'tree-step' + (isActive ? ' active' : '');

    var cpMark = node.checkpoint ? ' 👤' : '';

    div.innerHTML = '<div class="tree-step-header">' +
      '<span class="status-dot ' + statusKey + '"></span>' +
      '<span class="tree-step-icon">' + node.icon + '</span>' +
      '<span class="tree-step-name">' + node.name + cpMark + '</span>' +
      '<span class="tree-step-status ' + statusKey + '">' + statusLabel + '</span>' +
      '</div>';

    // 节点摘要（完成后显示）
    if (isDone && NODE_SUMMARIES[nodeId]) {
      var ud = nodeUserData[nodeId];
      var summary = document.createElement('div');
      summary.className = 'tree-step-summary';
      summary.textContent = NODE_SUMMARIES[nodeId](ud);
      div.appendChild(summary);
    }

    // 子步骤（执行中或完成时显示）
    if (isActive || isDone) {
      var subsDiv = document.createElement('div');
      subsDiv.className = 'tree-subs';
      node.subs.forEach(function (sub) {
        subsDiv.innerHTML += '<div class="tree-sub">' + sub + '</div>';
      });
      div.appendChild(subsDiv);
    }

    // 点击已完成步骤可切换主内容
    if (isDone) {
      div.style.cursor = 'pointer';
      div.addEventListener('click', (function (nid) {
        return function () { showStepInMain(nid); };
      })(nodeId));
    }

    tree.appendChild(div);
  });
}

// ---- 节点结果渲染入口 ----
function renderNodeResult(nodeId) {
  var node = NODE_REGISTRY[nodeId];
  if (!node || !node.result) return;

  // 初始化用户数据（若已有则保留）
  if (!nodeUserData[nodeId]) {
    nodeUserData[nodeId] = JSON.parse(JSON.stringify(node.result));
  }
  var ud = nodeUserData[nodeId];

  var card = document.createElement('div');
  card.className = 'step-result-card';
  card.id = 'nodeResult_' + nodeId;

  var riskLabel = node.risk === 'high' ? '⚠ 高风险 · 必须人工处置' :
    node.risk === 'medium' ? '📋 中风险 · 建议审核' : '✓ 低风险 · 可选审核';
  card.innerHTML =
    '<div class="src-header"><span>节点产出 · ' + escHtml(node.name) + '</span>' +
    '<span style="font-weight:400;opacity:.7">' + riskLabel + '</span></div>' +
    '<div class="src-body" id="nodeBody_' + nodeId + '"></div>';

  var main = document.getElementById('mainContent');
  main.innerHTML = '';
  main.appendChild(card);

  var body = document.getElementById('nodeBody_' + nodeId);

  if (ud.type === 'datasource') renderDatasourceResult(body, nodeId, ud);
  else if (ud.type === 'keywords') renderKeywordsResult(body, nodeId, ud);
  else if (ud.type === 'search') renderSearchResult(body, nodeId, ud);
  else if (ud.type === 'screening') renderScreeningResult(body, nodeId, ud);
  else if (ud.type === 'contradiction') renderContradictionResult(body, nodeId, ud);
  else if (ud.type === 'outline') renderOutlineResult(body, nodeId, ud);
  else if (ud.type === 'simple') renderSimpleResult(body, nodeId, ud);

  main.scrollTop = 0;
}

// ---- Phase 5.3: 数据源配置结果 ----
function renderDatasourceResult(body, nodeId, ud) {
  var html = '<div class="datasource-grid">';
  ud.sources.forEach(function (src) {
    var isSelected = ud.selected.indexOf(src.id) >= 0;
    html += '<div class="datasource-item' + (isSelected ? ' selected' : '') + '" onclick="toggleDatasource(\'' + nodeId + '\',\'' + src.id + '\')">' +
      '<div class="datasource-checkbox"><span class="datasource-check-mark">' + (isSelected ? '✓' : '') + '</span></div>' +
      '<div><div class="datasource-name">' + escHtml(src.name) +
      (src.recommended ? '<span class="datasource-recommend-badge">推荐</span>' : '') +
      '</div>' +
      '<div class="datasource-note">' + escHtml(src.note) + (src.authorized ? '' : ' · 需授权') + '</div>' +
      '</div></div>';
  });
  html += '</div>';
  html += '<div class="src-hint">' + escHtml(ud.hint) + '</div>';
  body.innerHTML = html;
}

function toggleDatasource(nodeId, srcId) {
  var ud = nodeUserData[nodeId];
  if (!ud) return;
  var idx = ud.selected.indexOf(srcId);
  if (idx >= 0) {
    ud.selected.splice(idx, 1);
  } else {
    ud.selected.push(srcId);
  }
  var body = document.getElementById('nodeBody_' + nodeId);
  renderDatasourceResult(body, nodeId, ud);
}

// ---- 关键词结果 ----
function renderKeywordsResult(body, nodeId, ud) {
  var html = '<div class="kw-tags" id="kwTags_' + nodeId + '">';
  ud.keywords.forEach(function (kw, i) {
    html += '<span class="kw-tag">' +
      escHtml(kw.term) +
      (kw.mesh ? '<span class="kw-tag-mesh">→ ' + escHtml(kw.mesh) + '</span>' : '') +
      '<button class="kw-tag-del" onclick="removeKeyword(\'' + nodeId + '\',' + i + ')">×</button>' +
      '</span>';
  });
  html += '</div>';
  html += '<div class="kw-add-row">' +
    '<input class="kw-add-input" id="kwInput_' + nodeId + '" placeholder="添加关键词..." maxlength="40" />' +
    '<button class="kw-add-btn" onclick="addKeyword(\'' + nodeId + '\')">+ 添加</button>' +
    '</div>';
  html += '<div class="src-hint">' + escHtml(ud.hint) + '</div>';
  body.innerHTML = html;
  var input = document.getElementById('kwInput_' + nodeId);
  if (input) input.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') addKeyword(nodeId);
  });
}

function removeKeyword(nodeId, idx) {
  var ud = nodeUserData[nodeId];
  var removed = ud.keywords[idx].term;
  ud.keywords.splice(idx, 1);
  appendLog('INFO', '用户删除关键词：' + removed, nodeId);
  var body = document.getElementById('nodeBody_' + nodeId);
  renderKeywordsResult(body, nodeId, ud);
  document.getElementById('nextBtn').textContent = '✓ 确认并继续';
}

function addKeyword(nodeId) {
  var input = document.getElementById('kwInput_' + nodeId);
  var val = input ? input.value.trim() : '';
  if (!val) return;
  var ud = nodeUserData[nodeId];
  ud.keywords.push({ term: val, mesh: null, editable: true });
  appendLog('INFO', '用户添加关键词：' + val, nodeId);
  var body = document.getElementById('nodeBody_' + nodeId);
  renderKeywordsResult(body, nodeId, ud);
  document.getElementById('nextBtn').textContent = '✓ 确认并继续';
}

// ---- 数据库检索结果 ----
function renderSearchResult(body, nodeId, ud) {
  var maxCount = Math.max.apply(null, ud.sources.map(function (s) { return s.count; }));
  var html = '<div class="search-query-box">🔍 ' + escHtml(ud.query) + '</div>';
  html += '<div class="search-bars">';
  ud.sources.forEach(function (s) {
    var pct = Math.round(s.count / maxCount * 100);
    html += '<div class="search-bar-item">' +
      '<span class="search-bar-label">' + escHtml(s.name) + '</span>' +
      '<div class="search-bar-track"><div class="search-bar-fill" style="width:' + pct + '%;background:' + escHtml(s.color) + '"></div></div>' +
      '<span class="search-bar-count">' + s.count + '</span>' +
      '</div>';
  });
  html += '</div>';
  html += '<div class="year-range-row">' +
    '<span class="year-range-label">时间范围：</span>' +
    '<input class="year-input" id="yearFrom_' + nodeId + '" type="number" value="' + ud.yearRange.current[0] + '" min="2010" max="2024" />' +
    '<span style="color:var(--asci-text-muted);font-size:12px"> — </span>' +
    '<input class="year-input" id="yearTo_' + nodeId + '" type="number" value="' + ud.yearRange.current[1] + '" min="2010" max="2024" />' +
    '<button class="re-search-btn" onclick="reSearch(\'' + nodeId + '\')">重新检索</button>' +
    '</div>';
  if (ud.preview && ud.preview.length > 0) {
    html += '<div class="paper-preview-block">' +
      '<div class="paper-preview-toggle" id="previewToggle_' + nodeId + '" onclick="togglePreview(\'' + nodeId + '\')">' +
      '<span>📄 论文预览（前 ' + ud.preview.length + ' 条）</span>' +
      '<span class="toggle-arrow">▼</span>' +
      '</div>' +
      '<div class="paper-preview-list" id="previewList_' + nodeId + '">';
    ud.preview.forEach(function (p) {
      var clickHandler = p.key ? 'onclick="showPaperModal(\'' + p.key + '\')"' : '';
      html += '<div class="preview-paper-item" ' + clickHandler + '>' +
        '<span class="preview-paper-year">' + p.year + '</span>' +
        '<span class="preview-paper-title">' + escHtml(p.title) + '</span>' +
        (p.key ? '<span class="preview-paper-hint">查看摘要 →</span>' : '') +
        '</div>';
    });
    html += '</div></div>';
  }
  html += '<div class="export-row">' +
    '<button class="export-btn" onclick="exportSearchResults(this,' + ud.sources[2].count + ')">📋 导出检索结果</button>' +
    '</div>';
  html += '<div class="src-hint">' + escHtml(ud.hint) + '</div>';
  body.innerHTML = html;
}

function togglePreview(nodeId) {
  var toggle = document.getElementById('previewToggle_' + nodeId);
  var list = document.getElementById('previewList_' + nodeId);
  if (!toggle || !list) return;
  list.classList.toggle('open');
  toggle.classList.toggle('open');
}

function exportSearchResults(btn, count) {
  showToast('已导出 ' + count + ' 条 BibTeX');
}

function reSearch(nodeId) {
  var ud = nodeUserData[nodeId];
  var from = parseInt(document.getElementById('yearFrom_' + nodeId).value);
  var to = parseInt(document.getElementById('yearTo_' + nodeId).value);
  if (from > to) { showToast('起始年份不能大于结束年份'); return; }
  ud.yearRange.current = [from, to];
  var factor = (to - from) / (ud.yearRange.max - ud.yearRange.min);
  ud.sources[0].count = Math.round(142 * factor);
  ud.sources[1].count = Math.round(198 * factor);
  ud.sources[2].count = Math.round(276 * factor);
  ud.query = 'Transformer AND ("Drug Discovery" OR "Molecular Property") [' + from + ':' + to + ']';
  appendLog('INFO', '重新检索：时间范围调整为 ' + from + '–' + to + '，候选文献 ' + ud.sources[2].count + ' 篇', nodeId);
  var body = document.getElementById('nodeBody_' + nodeId);
  renderSearchResult(body, nodeId, ud);
}

// ---- Phase 5.2: 摘要筛选结果（含阈值说明）----
function renderScreeningResult(body, nodeId, ud) {
  var incCount = 0, holdCount = 0, excCount = 0;
  ud.borderline.forEach(function (p) {
    if (p.decision === 'include') incCount++;
    else if (p.decision === 'maybe') holdCount++;
    else if (p.decision === 'exclude') excCount++;
  });
  var totalInc = ud.included + incCount;

  var html = '<div class="decision-count-bar">' +
    '<span class="dc-badge dc-include">✅ 纳入 ' + totalInc + ' 篇</span>' +
    (holdCount > 0 ? '<span class="dc-badge dc-hold">⏸ 暂缓 ' + holdCount + ' 篇</span>' : '') +
    (excCount > 0 ? '<span class="dc-badge dc-exclude">❌ 排除 ' + excCount + ' 篇</span>' : '') +
    '</div>';

  html += '<div class="batch-actions">' +
    '<button class="batch-btn" onclick="blBatchAction(\'' + nodeId + '\',\'include\')">全选纳入</button>' +
    '<button class="batch-btn" onclick="blBatchAction(\'' + nodeId + '\',\'exclude\')">全选排除</button>' +
    '<button class="batch-btn" onclick="blBatchAction(\'' + nodeId + '\',\'sort\')">按评分排序</button>' +
    '</div>';

  // Phase 5.2：阈值计算说明
  html += '<div class="threshold-row">' +
    '<span class="threshold-label">相关性阈值：</span>' +
    '<input class="threshold-slider" id="threshSlider_' + nodeId + '" type="range" min="60" max="90" value="' + Math.round(ud.threshold * 100) + '" oninput="updateThreshold(\'' + nodeId + '\',this.value)" />' +
    '<span class="threshold-val" id="threshVal_' + nodeId + '">' + ud.threshold.toFixed(2) + '</span>' +
    '<span class="threshold-preview" id="threshPreview_' + nodeId + '"></span>' +
    '<span class="threshold-explain-toggle" onclick="toggleThresholdExplain(\'' + nodeId + '\')">？ 计算说明</span>' +
    '</div>';

  html += '<div class="threshold-explain-box hidden" id="threshExplain_' + nodeId + '">' +
    '使用 <strong>SciBERT</strong> 编码器将摘要和研究主题分别转为 768 维向量，计算余弦相似度。' +
    '阈值 <strong>0.72</strong> = 自动纳入；<strong>0.65–0.72</strong> = 边界文献，需人工判断。' +
    '</div>';

  html += '<div class="included-count" id="includedCount_' + nodeId + '">✓ 高置信度纳入：<strong>' + ud.included + ' 篇</strong>（边界文献另行判断）</div>';
  html += '<div style="font-size:11px;font-weight:700;color:var(--asci-text-muted);margin-bottom:6px">边界文献（逐篇判断）</div>';

  html += '<div class="borderline-list">';
  ud.borderline.forEach(function (p, i) {
    var decided = p.decision;
    var decidedClass = decided ? ' decided-' + decided : '';
    html += '<div class="bl-paper' + decidedClass + '" id="blPaper_' + nodeId + '_' + i + '">' +
      '<div class="bl-paper-top" onclick="toggleBlDetail(\'' + nodeId + '\',' + i + ')">' +
      '<span class="bl-paper-title">' + escHtml(p.title) +
      ' <span style="font-size:10px;color:var(--asci-text-muted);font-weight:400">— ' + escHtml(p.authors) + ', ' + p.year + '</span></span>' +
      '<span class="bl-paper-score">' + p.score + '</span>' +
      '<span class="bl-paper-expand" id="blArrow_' + nodeId + '_' + i + '">▾</span>' +
      '</div>' +
      '<div class="bl-paper-detail" id="blDetail_' + nodeId + '_' + i + '">' +
      '<div class="bl-paper-abstract">' + escHtml(p.abstract) + '</div>' +
      '<div class="bl-decision-row">' +
      '<button class="bl-btn bl-btn-include' + (decided === 'include' ? ' active' : '') + '" onclick="blDecide(\'' + nodeId + '\',' + i + ',\'include\')">✓ 纳入</button>' +
      '<button class="bl-btn bl-btn-maybe' + (decided === 'maybe' ? ' active' : '') + '" onclick="blDecide(\'' + nodeId + '\',' + i + ',\'maybe\')">⏸ 暂缓（需全文确认）</button>' +
      '<button class="bl-btn bl-btn-exclude' + (decided === 'exclude' ? ' active' : '') + '" onclick="blDecide(\'' + nodeId + '\',' + i + ',\'exclude\')">✕ 排除</button>' +
      '</div></div></div>';
  });
  html += '</div>';
  html += '<div class="src-hint">' + escHtml(ud.hint) + '</div>';
  body.innerHTML = html;
}

function toggleThresholdExplain(nodeId) {
  var box = document.getElementById('threshExplain_' + nodeId);
  if (box) box.classList.toggle('hidden');
}

function toggleBlDetail(nodeId, i) {
  var detail = document.getElementById('blDetail_' + nodeId + '_' + i);
  var arrow = document.getElementById('blArrow_' + nodeId + '_' + i);
  if (!detail) return;
  detail.classList.toggle('open');
  if (arrow) arrow.textContent = detail.classList.contains('open') ? '▴' : '▾';
}

function blDecide(nodeId, i, decision) {
  var ud = nodeUserData[nodeId];
  ud.borderline[i].decision = decision;
  var decisionLabel = decision === 'include' ? '纳入' : decision === 'maybe' ? '待定' : '排除';
  appendLog('INFO', '用户决策边界文献 "' + ud.borderline[i].title + '"：' + decisionLabel, nodeId);
  appendHitlDecisionLog(NODE_REGISTRY[nodeId].name + ' 边界文献 ' + (i + 1), decisionLabel);
  var body = document.getElementById('nodeBody_' + nodeId);
  renderScreeningResult(body, nodeId, ud);
  var nextUndecided = ud.borderline.findIndex(function (p, idx) { return idx > i && !p.decision; });
  if (nextUndecided >= 0) toggleBlDetail(nodeId, nextUndecided);
  updateNextBtnState();
}

function blBatchAction(nodeId, action) {
  var ud = nodeUserData[nodeId];
  if (action === 'sort') {
    ud.borderline.sort(function (a, b) { return b.score - a.score; });
    appendLog('INFO', '用户操作：边界文献按评分降序排列', nodeId);
  } else {
    ud.borderline.forEach(function (p) { p.decision = action; });
    var label = action === 'include' ? '全部纳入' : '全部排除';
    appendLog('INFO', '用户批量操作：' + label + '所有边界文献', nodeId);
    appendHitlDecisionLog(NODE_REGISTRY[nodeId].name + ' 批量操作', label);
  }
  var body = document.getElementById('nodeBody_' + nodeId);
  renderScreeningResult(body, nodeId, ud);
  updateNextBtnState();
}

function updateThreshold(nodeId, val) {
  var ud = nodeUserData[nodeId];
  var newThresh = val / 100;
  var prevIncluded = ud.included;
  ud.threshold = newThresh;
  var threshValEl = document.getElementById('threshVal_' + nodeId);
  if (threshValEl) threshValEl.textContent = ud.threshold.toFixed(2);
  var base = 18;
  var delta = Math.round((0.72 - ud.threshold) * 200);
  ud.included = Math.max(5, base + delta);
  var includedCountEl = document.getElementById('includedCount_' + nodeId);
  if (includedCountEl) includedCountEl.innerHTML = '✓ 高置信度纳入：<strong>' + ud.included + ' 篇</strong>（边界文献另行判断）';
  var preview = document.getElementById('threshPreview_' + nodeId);
  if (preview) {
    var diff = ud.included - prevIncluded;
    if (diff > 0) preview.textContent = '↑ 纳入 +' + diff + ' 篇';
    else if (diff < 0) preview.textContent = '↓ 纳入 ' + diff + ' 篇';
    else preview.textContent = '';
  }
}

// ---- Phase 5.1: 全文精读（含边界说明）----
function renderContradictionResult(body, nodeId, ud) {
  var html = '';

  // Phase 5.1：如果是 fulltext-read 节点，加边界说明
  if (nodeId === 'fulltext-read') {
    html += '<div class="fulltext-boundary-notice">' +
      '<strong>数据边界说明</strong>：当前接入开放获取数据库（PubMed、arXiv、Semantic Scholar），全文覆盖率约 67%（OA 论文）。' +
      '付费数据库全文接入为后续规划。无全文论文已降级为摘要+元数据分析，输出中标注数据完整度。' +
      '</div>';
  }

  var c = ud.contradiction;
  html += '<div class="contradiction-card">' +
    '<div class="contradiction-header">⚡ 检测到矛盾文献 · 必须人工处置</div>' +
    '<div class="contradiction-metric">矛盾指标：<strong>' + escHtml(c.metric) + '</strong></div>' +
    '<div class="contradiction-papers">' +
    '<div class="contra-paper">' +
    '<div class="contra-paper-title">' + escHtml(c.paperA.title) + '</div>' +
    '<div class="contra-paper-meta">' + escHtml(c.paperA.authors) + ' · ' + escHtml(c.paperA.journal) + '</div>' +
    '<div class="contra-paper-value">' + escHtml(c.paperA.value) + '</div>' +
    '<div class="contra-paper-method">' + escHtml(c.paperA.method) + '</div>' +
    '</div>' +
    '<div class="contra-paper">' +
    '<div class="contra-paper-title">' + escHtml(c.paperB.title) + '</div>' +
    '<div class="contra-paper-meta">' + escHtml(c.paperB.authors) + ' · ' + escHtml(c.paperB.journal) + '</div>' +
    '<div class="contra-paper-value">' + escHtml(c.paperB.value) + '</div>' +
    '<div class="contra-paper-method">' + escHtml(c.paperB.method) + '</div>' +
    '</div>' +
    '</div>' +
    '<div class="contradiction-options">';

  c.options.forEach(function (opt) {
    var selected = c.decision === opt.id;
    html += '<div class="contra-opt' + (selected ? ' selected' : '') + '" onclick="contraDecide(\'' + nodeId + '\',\'' + opt.id + '\')">' +
      '<div class="contra-opt-radio"></div>' +
      '<div><div class="contra-opt-label">' + escHtml(opt.label) + '</div><div class="contra-opt-reason">' + escHtml(opt.reason) + '</div></div>' +
      '</div>';
  });
  html += '</div></div>';

  if (ud.findingsList && ud.findingsList.length > 0) {
    html += '<div class="findings-block">' +
      '<div class="findings-block-toggle" id="findingsToggle_' + nodeId + '" onclick="toggleFindings(\'' + nodeId + '\')">' +
      '<span>📋 全部 Findings（' + ud.findings + ' 条，显示前 ' + ud.findingsList.length + ' 条）</span>' +
      '<span class="toggle-arrow">▼</span>' +
      '</div>' +
      '<div class="findings-list" id="findingsList_' + nodeId + '">';
    ud.findingsList.forEach(function (f) {
      html += '<div class="finding-item">' +
        '<div class="finding-text">' + escHtml(f.text) + '</div>' +
        '<div class="finding-source">出处：' + escHtml(f.source) + '</div>' +
        '</div>';
    });
    html += '</div></div>';
  }

  html += '<div class="export-row">' +
    '<button class="export-btn" onclick="exportFindings(this)">📋 导出 Findings</button>' +
    '</div>';
  html += '<div class="src-hint">' + escHtml(ud.hint) + '</div>';
  body.innerHTML = html;
}

function toggleFindings(nodeId) {
  var toggle = document.getElementById('findingsToggle_' + nodeId);
  var list = document.getElementById('findingsList_' + nodeId);
  if (!toggle || !list) return;
  list.classList.toggle('open');
  toggle.classList.toggle('open');
}

function exportFindings(btn) {
  showToast('已导出 Findings 列表');
}

function contraDecide(nodeId, optId) {
  var ud = nodeUserData[nodeId];
  ud.contradiction.decision = optId;
  var opt = ud.contradiction.options.find(function (o) { return o.id === optId; });
  var label = opt ? opt.label : optId;
  appendLog('INFO', '用户处置矛盾文献：' + label, nodeId);
  appendHitlDecisionLog(NODE_REGISTRY[nodeId].name + ' 矛盾处置', label);
  var body = document.getElementById('nodeBody_' + nodeId);
  renderContradictionResult(body, nodeId, ud);
  updateNextBtnState();
}

// ---- 大纲结果 ----
function renderOutlineResult(body, nodeId, ud) {
  var html = '<div class="outline-list">';
  ud.sections.forEach(function (sec, i) {
    html += '<div class="outline-item">' +
      '<div class="outline-num">' + sec.id + '</div>' +
      '<div class="outline-content">' +
      '<input class="outline-title-input" id="outlineTitle_' + nodeId + '_' + i + '" value="' + escHtml(sec.title) + '" onchange="updateOutlineTitle(\'' + nodeId + '\',' + i + ',this.value)" />' +
      '<div class="outline-points">' + escHtml(sec.points) + '</div>' +
      '</div></div>';
  });
  html += '</div>';
  html += '<div class="src-hint">' + escHtml(ud.hint) + '</div>';
  body.innerHTML = html;
}

function updateOutlineTitle(nodeId, i, val) {
  var ud = nodeUserData[nodeId];
  if (ud) ud.sections[i].title = val;
}

// ---- 简单文字节点结果 ----
function renderSimpleResult(body, nodeId, ud) {
  var html = '<div class="simple-node-result">' +
    '<div class="node-result-icon">' + (ud.icon || '✅') + '</div>' +
    '<p><strong>' + escHtml(ud.summary) + '</strong></p>' +
    '<p>' + escHtml(ud.details) + '</p>' +
    '</div>';
  body.innerHTML = html;
}

// ---- Paper Modal ----
function getPaperDataFromSources(idxKey) {
  var idx = parseInt(idxKey.replace('s3_', ''));
  var s = MOCK_RESULT.sources[idx];
  if (!s) return null;
  return {
    title: s.title,
    meta: s.authors + ' · ' + s.journal + ' · ' + s.year,
    score: '相关性评分 ' + s.score + ' / 10',
    abstract: S3_ABSTRACTS[idx] || '暂无摘要信息。',
    doi: s.doi || null
  };
}

function showPaperModal(key) {
  var data = key.startsWith('s3_') ? getPaperDataFromSources(key) : PAPER_DATA[key];
  if (!data) return;
  var overlay = document.createElement('div');
  overlay.className = 'paper-modal-overlay';
  overlay.onclick = function (e) { if (e.target === overlay) closePaperModal(overlay); };
  var doiLink = data.doi ?
    '<div class="paper-modal-actions"><a class="paper-modal-link" href="' + data.doi + '" target="_blank" rel="noopener">🔗 查看原文（DOI）</a></div>' : '';
  overlay.innerHTML = '<div class="paper-modal">' +
    '<button class="paper-modal-close" onclick="closePaperModal(document.querySelector(\'.paper-modal-overlay\'))">✕</button>' +
    '<div class="paper-modal-title">' + data.title + '</div>' +
    '<div class="paper-modal-meta">' + data.meta + '</div>' +
    '<div class="paper-modal-score">📊 ' + data.score + '</div>' +
    '<div class="paper-modal-abstract">' + data.abstract + '</div>' +
    doiLink +
    '</div>';
  document.body.appendChild(overlay);
  document.addEventListener('keydown', function esc(e) {
    if (e.key === 'Escape') { closePaperModal(overlay); document.removeEventListener('keydown', esc); }
  });
}

function closePaperModal(overlay) {
  if (overlay && overlay.parentNode) overlay.remove();
}

// ---- Screen 3 渲染 ----
function renderScreen3() {
  var r = MOCK_RESULT;
  var titleEl = document.getElementById('s3Title');
  if (titleEl) {
    titleEl.textContent = r.title;
    if (humanEdited) {
      var badge = document.createElement('span');
      badge.className = 'human-edited-badge';
      badge.textContent = '✓ 已由人工修改';
      titleEl.appendChild(badge);
    }
  }

  var s3Abstract = document.getElementById('s3Abstract');
  if (s3Abstract) s3Abstract.textContent = r.abstract;

  var fl = document.getElementById('s3Findings');
  if (fl) {
    fl.innerHTML = '';
    r.findings.forEach(function (f, i) {
      fl.innerHTML += '<li class="s3-finding"><span class="s3-finding-num">' + (i + 1) + '</span><span>' + f + '</span></li>';
    });
  }

  var tb = document.getElementById('s3TableBody');
  if (tb) {
    tb.innerHTML = '';
    r.sources.forEach(function (s, idx) {
      tb.innerHTML += '<tr><td><span class="s3-paper-link" onclick="showPaperModal(\'s3_' + idx + '\')">' + s.title + '</span></td>' +
        '<td>' + s.authors + '</td><td>' + s.year + '</td><td>' + s.journal + '</td><td class="s3-score">' + s.score + '</td></tr>';
    });
    var q1Count = r.sources.filter(function (s) {
      return s.journal.indexOf('Q1') >= 0 || s.journal.indexOf('NeurIPS') >= 0 || s.journal.indexOf('Nature') >= 0;
    }).length;
    var footerEl = document.getElementById('s3TableFooter');
    if (footerEl) {
      footerEl.innerHTML = '共引用 ' + r.sources.length + ' 篇文献，' +
        Math.round(q1Count / r.sources.length * 100) + '% 来自 SCI Q1 / 顶会期刊' +
        '&nbsp;&nbsp;<button class="s3-export-btn" onclick="exportReferences(this)">📋 复制参考文献（BibTeX）</button>';
    }
  }

  var cred = r.credibility;
  var bars = [
    { name: '来源质量', score: cred.sourceQuality.score, note: cred.sourceQuality.note },
    { name: '推理链路', score: cred.reasoning.score, note: cred.reasoning.note },
    { name: '数据一致性', score: cred.consistency.score, note: cred.consistency.note }
  ];
  var credWrap = document.getElementById('s3CredBars');
  if (credWrap) {
    credWrap.innerHTML = '';
    bars.forEach(function (b) {
      var pct = b.score / 10 * 100;
      credWrap.innerHTML += '<div class="cred-bar-item">' +
        '<div class="cred-bar-top"><span class="cred-bar-name">' + b.name + '</span><span class="cred-bar-score">' + b.score + ' / 10</span></div>' +
        '<div class="cred-bar-track"><div class="cred-bar-fill" style="width:' + pct + '%"></div></div>' +
        '<div class="cred-bar-note">' + b.note + '</div>' +
        '</div>';
    });
  }
  var credSummary = document.getElementById('s3CredSummary');
  if (credSummary) {
    credSummary.innerHTML = '<strong>综合评分 ' + cred.overall + ' / 10</strong> · ' + cred.suggestion;
  }

  renderScreen3HitlSummary();
}

function renderScreen3HitlSummary() {
  var decisions = [];

  // 收集所有节点的 HITL 决策
  var screenNode = nodeUserData['abstract-screen'];
  if (screenNode && screenNode.borderline) {
    var decided = screenNode.borderline.filter(function (p) { return p.decision; });
    if (decided.length > 0) {
      var summary = decided.map(function (p) {
        return p.title.slice(0, 20) + '…→' + (p.decision === 'include' ? '纳入' : p.decision === 'maybe' ? '待定' : '排除');
      }).join('；');
      decisions.push({ step: '摘要筛选', text: '边界文献处置：' + summary });
    }
  }

  ['fulltext-read', 'contradiction-detect'].forEach(function (nid) {
    var ud = nodeUserData[nid];
    if (ud && ud.contradiction && ud.contradiction.decision) {
      var opt = ud.contradiction.options.find(function (o) { return o.id === ud.contradiction.decision; });
      var nodeName = NODE_REGISTRY[nid] ? NODE_REGISTRY[nid].name : nid;
      decisions.push({ step: nodeName, text: '矛盾处置：' + (opt ? opt.label : ud.contradiction.decision) });
    }
  });

  var kwNode = nodeUserData['keyword-extract'];
  if (kwNode && kwNode.keywords) {
    decisions.push({ step: '关键词提取', text: '最终检索词 ' + kwNode.keywords.length + ' 个' });
  }

  if (!decisions.length) return;

  var grid = document.querySelector('.s3-grid');
  if (!grid) return;
  var existing = document.getElementById('s3HitlCard');
  if (existing) existing.remove();

  var card = document.createElement('div');
  card.className = 's3-card s3-full';
  card.id = 's3HitlCard';
  var html = '<div class="s3-card-label">人工决策摘要</div><div class="s3-hitl-card">';
  decisions.forEach(function (d) {
    html += '<div class="s3-hitl-item"><span class="s3-hitl-step">' + escHtml(d.step) + '</span><span class="s3-hitl-decision">' + escHtml(d.text) + '</span></div>';
  });
  html += '</div>';
  card.innerHTML = html;
  grid.appendChild(card);
}

// ---- 接受结果 ----
function acceptResult() {
  showToast('✅ 结果已保存至知识库');
}

// ---- 导出参考文献 ----
function exportReferences(btn) {
  var bibtex = MOCK_RESULT.sources.map(function (s, i) {
    return '@article{ref' + (i + 1) + ',\n' +
      '  title={' + s.title + '},\n' +
      '  author={' + s.authors + '},\n' +
      '  journal={' + s.journal + '},\n' +
      '  year={' + s.year + '},\n' +
      '  doi={' + (s.doi || 'N/A') + '}\n}';
  }).join('\n\n');
  navigator.clipboard.writeText(bibtex).then(function () {
    var orig = btn.textContent;
    btn.textContent = '✓ 已复制！';
    setTimeout(function () { btn.textContent = orig; }, 2000);
  }).catch(function () {
    btn.textContent = '复制失败，请手动复制';
  });
}
