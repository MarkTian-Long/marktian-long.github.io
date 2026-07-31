/* ================================================================
   CONSTANTS & PROMPTS
================================================================ */

const STORAGE_KEY_APIKEY = 'qiuzhi_esop_apikey';
const STORAGE_KEY_RESULT = 'qiuzhi_esop_last_result';
const DEEPSEEK_BASE_URL  = 'https://api.deepseek.com';
const DEEPSEEK_MODEL     = 'deepseek-chat';
const BUILTIN_API_KEY    = '';

/* ---- Field label maps ---- */
const FIELD_LABELS_BASIC = {
  tickerCode:         '股票代码',
  industryCat:        '行业类别',
  registeredLocation: '公司注册地',
  listingBoard:       '上市板块',
  securityType:       '证券类型',
  founders:           '公司创始人',
  listingDate:        '上市日期',
  ipoPrice:           '上市发行价',
  totalSharesAfter:   '发行后总股本',
  totalSharesBefore:  '发行前总股本',
  ipoMarketCap:       '首发市值（亿人民币）'
};

const FIELD_LABELS_PLAN = {
  adoptionDate:       '采纳激励计划日期',
  planName:           '激励计划名称',
  reservedShares:     '预留ESOP股份数',
  reservedShareRatio: '预留ESOP股比',
  shareType:          '股份标的类型',
  incentiveTool:      '激励工具',
  grantedShares:      '授予股数',
  grantedShareRatio:  '授予ESOP股比',
  exercisePrice:      '行权价格',
  grantDateFMV:       '授予日期普通股FMV'
};

const FIELD_LABELS_GRANTEE = {
  name:               '姓名',
  position:           '岗位',
  hireDate:           '入职时间',
  grantDate:          '授予日期',
  incentiveTool:      '激励工具',
  grantedShares:      '授予股数',
  grantedShareRatio:  '授予ESOP股比',
  vestingSchedule:    '归属安排',
  holdingPlatform:    '持股平台',
  cashComp:           '个人现金薪酬'
};

/* ---- Synonym Map (金融术语同义词映射表，同时注入 SYSTEM_PROMPT) ---- */
const SYNONYM_MAP = [
  { standard: 'ESOP / 股权激励计划',   variants: ['员工持股计划', '股票期权计划', '购股权计划', '股份奖励计划', '雇员股份激励计划'] },
  { standard: '行权价格',              variants: ['认购价', '行使价', '购股价', '授予价格'] },
  { standard: '归属安排',              variants: ['归属期', '解锁条件', '行权条件', '解禁安排'] },
  { standard: '发行前总股本',          variants: ['上市前已发行股份', '全球发售前已发行股份'] },
  { standard: 'FMV（公允市值）',       variants: ['每股公平价值', '授予日公允价值'] },
  { standard: '首发市值',              variants: ['IPO 市值', '全球发售时市值', '上市时估值'] },
  { standard: '授予日期',              variants: ['期权授出日期', '股份授予日', '授股日'] },
  { standard: '持股平台',              variants: ['员工持股平台', '期权池载体', '合伙企业'] },
  { standard: '激励工具',              variants: ['权益类型', '股权激励类型（如：限制性股份、期权、RSU）'] },
  { standard: '发行价',                variants: ['全球发售价', '上市发行价', 'IPO 价格'] }
];

/* ---- System Prompt ---- */
const SYSTEM_PROMPT = `你是一名专业的股权激励数据提取专家，专门处理港股和A股招股说明书（招股书/招股文件/Prospectus）。

## 你的职责
从用户提供的招股书原文片段中，精确提取股权激励相关字段，并以严格的 JSON 格式返回。

## 招股书章节结构参考
- 公司基本信息：通常分布在"公司概览"、"业务介绍"、"全球发售"、"股本结构"章节
- 股权激励计划：通常在"股权架构"、"重要合约"、"董事、监事及高级管理人员"、附录章节
- 授予信息（人员级别）：通常在"董事酬金及其他资料"、"向若干董事及高管授出期权"章节

## 金融术语同义词映射（提取时需识别以下所有变体）
- ESOP = 员工持股计划 = 股票期权计划 = 购股权计划 = 股份奖励计划 = 雇员股份激励计划
- 行权价格 = 认购价 = 行使价 = 购股价 = 授予价格
- 归属 = 归属安排 = 归属期 = 解锁条件 = 行权条件 = 解禁安排
- 发行前总股本 = 上市前已发行股份 = 全球发售前已发行股份
- FMV = 公允市值 = 每股公平价值 = 授予日公允价值
- 首发市值 = IPO 市值 = 全球发售时市值 = 上市时估值
- 授予日期 = 期权授出日期 = 股份授予日 = 授股日
- 持股平台 = 员工持股平台 = 期权池载体 = 合伙企业
- 激励工具 = 权益类型 = 股权激励类型（如：限制性股份、期权、RSU）
- 发行价 = 全球发售价 = 上市发行价 = IPO 价格

## 置信度定义
- high：在原文中找到明确、精确的对应表述，数值或日期清晰
- medium：找到相关表述，但存在一定歧义或需要推算
- low：未找到明确依据，或字段语义模糊无法确认

## 缺失字段处理规则
- 若某字段在提供的文本中未出现，或无法确定，必须返回 null 值，不得猜测或捏造
- 缺失字段的 confidence 固定为 "low"
- 缺失字段的 source 返回 "未在提供的文本中找到相关内容"

## 输出格式要求
- 严格返回合法 JSON，不附加任何说明文字、markdown 代码块标记
- 金额统一以原文币种表示，不换算
- 日期统一为 YYYY-MM-DD 格式（如原文为"二零二四年三月十五日"，转换为"2024-03-15"）
- 股数/股比保留原文精度，不做四舍五入`;

/* ---- User Prompt Template ---- */
const USER_PROMPT_TEMPLATE = `请从以下招股书原文中提取股权激励相关字段。

## 原文内容
{{TEXT}}

## 需要提取的字段（严格按此 JSON schema 返回，直接返回JSON，不要有任何前缀或后缀）

{
  "companyBasic": {
    "tickerCode":          { "value": null, "confidence": "low", "source": "" },
    "industryCat":         { "value": null, "confidence": "low", "source": "" },
    "registeredLocation":  { "value": null, "confidence": "low", "source": "" },
    "listingBoard":        { "value": null, "confidence": "low", "source": "" },
    "securityType":        { "value": null, "confidence": "low", "source": "" },
    "founders":            { "value": null, "confidence": "low", "source": "" },
    "listingDate":         { "value": null, "confidence": "low", "source": "" },
    "ipoPrice":            { "value": null, "confidence": "low", "source": "" },
    "totalSharesAfter":    { "value": null, "confidence": "low", "source": "" },
    "totalSharesBefore":   { "value": null, "confidence": "low", "source": "" },
    "ipoMarketCap":        { "value": null, "confidence": "low", "source": "" }
  },
  "esopPlan": {
    "adoptionDate":        { "value": null, "confidence": "low", "source": "" },
    "planName":            { "value": null, "confidence": "low", "source": "" },
    "reservedShares":      { "value": null, "confidence": "low", "source": "" },
    "reservedShareRatio":  { "value": null, "confidence": "low", "source": "" },
    "shareType":           { "value": null, "confidence": "low", "source": "" },
    "incentiveTool":       { "value": null, "confidence": "low", "source": "" },
    "grantedShares":       { "value": null, "confidence": "low", "source": "" },
    "grantedShareRatio":   { "value": null, "confidence": "low", "source": "" },
    "exercisePrice":       { "value": null, "confidence": "low", "source": "" },
    "grantDateFMV":        { "value": null, "confidence": "low", "source": "" }
  },
  "grantees": [
    {
      "name":              { "value": null, "confidence": "low", "source": "" },
      "position":          { "value": null, "confidence": "low", "source": "" },
      "hireDate":          { "value": null, "confidence": "low", "source": "" },
      "grantDate":         { "value": null, "confidence": "low", "source": "" },
      "incentiveTool":     { "value": null, "confidence": "low", "source": "" },
      "grantedShares":     { "value": null, "confidence": "low", "source": "" },
      "grantedShareRatio": { "value": null, "confidence": "low", "source": "" },
      "vestingSchedule":   { "value": null, "confidence": "low", "source": "" },
      "holdingPlatform":   { "value": null, "confidence": "low", "source": "" },
      "cashComp":          { "value": null, "confidence": "low", "source": "" }
    }
  ]
}

注意：grantees 为数组，若有多名被授予人，每人单独一条记录；若无相关信息则返回空数组 []。`;

/* ---- Sample Text ---- */
// 故意使用港股术语变体（行使价、购股权计划），测试同义词映射
const SAMPLE_TEXT = `某科技集团有限公司（股票代码：01234，香港联交所主板上市）
全球发售招股说明书

【公司概况】
某科技集团有限公司（以下简称"本公司"）于开曼群岛注册成立，以控股公司形式运营，主要从事企业级人工智能软件研发与云服务业务，属于信息技术行业。

本公司证券类型为普通股（H股），创始人为陈志远先生及王晓燕女士，二人合计控制发行后本公司约52.3%的已发行股份。

【全球发售】
本次全球发售发行价定为每股H股港币18.88元（以下简称"发售价"）。全球发售前本公司已发行股份总数为800,000,000股，全球发售后本公司已发行股份总数为1,000,000,000股，按发售价计算，本公司首次公开发售时市值约为人民币173亿元（按港元兑人民币汇率0.92换算）。

本公司股份预计于二零二四年三月二十八日起在联交所主板正式买卖。

【购股权计划】
本公司董事会于二零二二年一月十日采纳一项购股权计划（以下简称"购股权计划"）。该计划获批准预留股份数目为80,000,000股，占全球发售前本公司已发行股份总数的10%，股份标的类型为普通股。激励工具类型为购股权（股份期权）。

根据购股权计划，董事会已就以下人士授出购股权，行使价为每股港币15.50元，授出购股权的日期为二零二三年六月一日，授出日期每股普通股公平市值为港币13.20元。

已授出购股权合计为60,000,000份，占全球发售前本公司已发行股份总数的7.5%。

【向若干董事及高管授出购股权详情】

1. 张伟先生（首席执行官CEO）
入职日期：二零一八年五月十六日
购股权授出日期：二零二三年六月一日
激励工具：购股权
已授出购股权数目：20,000,000份
占全球发售前总股本：2.5%
归属安排：自授出日起计第一年届满后，25%的购股权归属；其后每满一个季度（即3个月），额外6.25%的购股权归属，直至全部购股权归属为止，须持续受雇方可归属。
持股平台：不适用（直接持有）
年度现金薪酬：港币3,200,000元

2. 李明先生（首席技术官CTO）
入职日期：二零一九年十一月零三日
购股权授出日期：二零二三年六月一日
激励工具：购股权
已授出购股权数目：15,000,000份
占全球发售前总股本：1.875%
归属安排：自授出日起计第一年届满后，25%的购股权归属；其后每满一个季度（即3个月），额外6.25%的购股权归属，直至全部购股权归属为止，须持续受雇方可归属。
持股平台：不适用（直接持有）
年度现金薪酬：港币2,600,000元`;


/* ---- Mock PDF Result ---- */
const MOCK_PDF_RESULT = {
  companyBasic: {
    tickerCode:          { value: "01234",            confidence: "high",   source: "第2页 · 封面及基本信息 | 股票代码：01234，香港联交所主板上市" },
    industryCat:         { value: "信息技术",          confidence: "high",   source: "第12页 · 公司概况 | 主要从事企业级人工智能软件研发与云服务业务，属于信息技术行业" },
    registeredLocation:  { value: "开曼群岛",          confidence: "high",   source: "第14页 · 公司注册及成立 | 本公司于开曼群岛注册成立，以控股公司形式运营" },
    listingBoard:        { value: "香港联交所主板",     confidence: "high",   source: "第2页 · 封面及基本信息 | 香港联合交易所有限公司主板上市" },
    securityType:        { value: "普通股（H股）",      confidence: "high",   source: "第18页 · 股本结构章节 | 本公司证券类型为普通股（H股）" },
    founders:            { value: "陈志远、王晓燕",    confidence: "medium", source: "第22页 · 主要股东及创始人 | 创始人为陈志远先生及王晓燕女士，合计控制约52.3%股份" },
    listingDate:         { value: "2024-03-28",        confidence: "high",   source: "第8页 · 全球发售时间表 | 股份预计于二零二四年三月二十八日起在联交所主板正式买卖" },
    ipoPrice:            { value: "港币18.88元/股",    confidence: "high",   source: "第8页 · 全球发售定价章节 | 发行价定为每股H股港币18.88元" },
    totalSharesAfter:    { value: "1,000,000,000股",   confidence: "high",   source: "第31页 · 股本结构表 | 全球发售后本公司已发行股份总数为1,000,000,000股" },
    totalSharesBefore:   { value: "800,000,000股",     confidence: "high",   source: "第31页 · 股本结构表 | 全球发售前本公司已发行股份总数为800,000,000股" },
    ipoMarketCap:        { value: "约人民币173亿元",   confidence: "medium", source: "第9页 · 发售统计数据 | 按发售价计算，本公司首次公开发售时市值约为人民币173亿元" }
  },
  esopPlan: {
    adoptionDate:        { value: "2022-01-10",        confidence: "high",   source: "第45页 · 购股权计划章节第一段 | 董事会于二零二二年一月十日采纳一项购股权计划" },
    planName:            { value: "购股权计划",         confidence: "high",   source: "第45页 · 购股权计划章节 | 以下简称「购股权计划」" },
    reservedShares:      { value: "80,000,000股",      confidence: "high",   source: "第46页 · 计划预留股份 | 该计划获批准预留股份数目为80,000,000股" },
    reservedShareRatio:  { value: "10%",               confidence: "high",   source: "第46页 · 计划预留股份 | 占全球发售前本公司已发行股份总数的10%" },
    shareType:           { value: "普通股",             confidence: "high",   source: "第45页 · 购股权计划章节 | 股份标的类型为普通股" },
    incentiveTool:       { value: "购股权（股份期权）", confidence: "high",   source: "第45页 · 购股权计划章节 | 激励工具类型为购股权（股份期权）" },
    grantedShares:       { value: "60,000,000份",      confidence: "high",   source: "第47页 · 已授购股权汇总 | 已授出购股权合计为60,000,000份" },
    grantedShareRatio:   { value: "7.5%",              confidence: "high",   source: "第47页 · 已授购股权汇总 | 占全球发售前本公司已发行股份总数的7.5%" },
    exercisePrice:       { value: "港币15.50元/股",    confidence: "high",   source: "第47页 · 购股权授予条款 | 行使价为每股港币15.50元" },
    grantDateFMV:        { value: "港币13.20元/股",    confidence: "medium", source: "第47页 · 购股权授予条款 | 授出日期每股普通股公平市值为港币13.20元" }
  },
  grantees: [
    {
      name:              { value: "张伟",               confidence: "high",   source: "第48页 · 董事购股权明细表 | 张伟先生（首席执行官CEO）" },
      position:          { value: "首席执行官（CEO）",  confidence: "high",   source: "第48页 · 董事购股权明细表 | 张伟先生（首席执行官CEO）" },
      hireDate:          { value: "2018-05-16",         confidence: "high",   source: "第48页 · 董事购股权明细表 | 入职日期：二零一八年五月十六日" },
      grantDate:         { value: "2021-11-15",         confidence: "high",   source: "第48页 · 董事购股权明细表 | 购股权授出日期：二零二一年十一月十五日" },
      incentiveTool:     { value: "购股权",              confidence: "high",   source: "第48页 · 董事购股权明细表 | 激励工具：购股权" },
      grantedShares:     { value: "20,000,000份",       confidence: "high",   source: "第48页 · 董事购股权明细表 | 已授出购股权数目：20,000,000份" },
      grantedShareRatio: { value: "2.5%",               confidence: "high",   source: "第48页 · 董事购股权明细表 | 占全球发售前总股本：2.5%" },
      vestingSchedule:   { value: "1年cliff后25%归属，其后每季度6.25%归属", confidence: "medium", source: "第48页 · 归属安排说明 | 自授出日起计第一年届满后25%归属，其后每满一个季度额外6.25%归属" },
      holdingPlatform:   { value: "不适用（直接持有）", confidence: "low",    source: "第48页 · 董事购股权明细表 | 持股平台：不适用（直接持有）" },
      cashComp:          { value: "港币3,200,000元/年", confidence: "high",   source: "第49页 · 董事酬金披露 | 年度现金薪酬：港币3,200,000元" }
    },
    {
      name:              { value: "李明",               confidence: "high",   source: "第49页 · 高管购股权明细表 | 李明先生（首席技术官CTO）" },
      position:          { value: "首席技术官（CTO）",  confidence: "high",   source: "第49页 · 高管购股权明细表 | 李明先生（首席技术官CTO）" },
      hireDate:          { value: "2019-11-03",         confidence: "high",   source: "第49页 · 高管购股权明细表 | 入职日期：二零一九年十一月零三日" },
      grantDate:         { value: "2023-06-01",         confidence: "high",   source: "第49页 · 高管购股权明细表 | 购股权授出日期：二零二三年六月一日" },
      incentiveTool:     { value: "购股权",              confidence: "high",   source: "第49页 · 高管购股权明细表 | 激励工具：购股权" },
      grantedShares:     { value: "15,000,000份",       confidence: "high",   source: "第49页 · 高管购股权明细表 | 已授出购股权数目：15,000,000份" },
      grantedShareRatio: { value: "1.875%",             confidence: "medium", source: "第49页 · 高管购股权明细表 | 占全球发售前总股本：1.875%" },
      vestingSchedule:   { value: "1年cliff后25%归属，其后每季度6.25%归属", confidence: "medium", source: "第49页 · 归属安排说明 | 自授出日起计第一年届满后25%归属，其后每满一个季度额外6.25%归属" },
      holdingPlatform:   { value: "不适用（直接持有）", confidence: "low",    source: "第49页 · 高管购股权明细表 | 持股平台：不适用（直接持有）" },
      cashComp:          { value: "港币2,600,000元/年", confidence: "low",    source: "第50页 · 高管酬金披露（数据由附件B推算，请核查）| 年度现金薪酬：港币2,600,000元" }
    }
  ]
};


/* ================================================================
   STATE
================================================================ */
const state = {
  apiKey:      '',
  apiEndpoint: 'https://api.deepseek.com',
  apiModel:    'deepseek-chat',
  apiMode:     'default',
  isLoading:   false,
  result:      null,
  activeTab:   'basic',
  editingCell: null,   // { section, key, granteeIndex }
  inputMode:   'text', // 'text' | 'pdf'
  pdfFile:             null,   // File object
  pdfMeta:             null,   // { name, size, pageCount }
  validationWarnings:  {}
};


/* ================================================================
   INIT
================================================================ */
function init() {
  // Fill prompt previews
  document.getElementById('previewSystem').textContent = SYSTEM_PROMPT;
  document.getElementById('previewUser').textContent   = USER_PROMPT_TEMPLATE;

  // Render synonym map
  const synonymGrid = document.getElementById('synonymMapGrid');
  synonymGrid.innerHTML = SYNONYM_MAP.map(item => `
    <div style="margin-bottom:8px;padding:8px 10px;background:var(--bg);border:1px solid var(--border);border-radius:var(--radius-sm);">
      <div style="font-size:12px;font-weight:600;color:var(--accent);margin-bottom:4px;">${escapeHTML(item.standard)}</div>
      <div style="display:flex;flex-wrap:wrap;gap:4px;">
        ${item.variants.map(v => `<span style="font-size:11px;padding:1px 7px;background:rgba(79,143,255,0.08);border:1px solid rgba(79,143,255,0.2);border-radius:20px;color:var(--text-sec);">${escapeHTML(v)}</span>`).join('')}
      </div>
    </div>
  `).join('');

  // Load API mode. Custom credentials must never survive a browser session.
  const savedMode = localStorage.getItem('qiuzhi_esop_apimode') || 'default';
  setApiMode(savedMode, true);
  localStorage.removeItem(STORAGE_KEY_APIKEY);
  localStorage.removeItem('qiuzhi_esop_endpoint');
  localStorage.removeItem('qiuzhi_esop_model');

  // Load last result
  const savedResult = localStorage.getItem(STORAGE_KEY_RESULT);
  if (savedResult) {
    try {
      state.result = JSON.parse(savedResult);
      renderOutput();
    } catch (e) { /* ignore */ }
  }
}


/* ================================================================
   COLLAPSIBLE
================================================================ */
function toggleCollapsible(id) {
  const el = document.getElementById(id);
  el.classList.toggle('open');
}

function openCollapsible(id) {
  document.getElementById(id).classList.add('open');
}

function closeCollapsible(id) {
  document.getElementById(id).classList.remove('open');
}


/* ================================================================
   API KEY
================================================================ */
function setApiMode(mode, silent) {
  state.apiMode = mode;
  if (!silent) localStorage.setItem('qiuzhi_esop_apimode', mode);

  document.getElementById('modeDefault').classList.toggle('active', mode === 'default');
  document.getElementById('modeCustom').classList.toggle('active', mode === 'custom');
  document.getElementById('defaultModeHint').style.display = mode === 'default' ? 'block' : 'none';
  document.getElementById('customKeyArea').style.display   = mode === 'custom'  ? 'block' : 'none';
}

function onKeyInput() {
  const input = document.getElementById('keyInput');
  input.classList.remove('error');
  document.getElementById('keyErrorTip').classList.remove('visible');
}

function saveApiKey() {
  const val = document.getElementById('keyInput').value.trim();
  if (!val) {
    document.getElementById('keyInput').classList.add('error');
    document.getElementById('keyErrorTip').classList.add('visible');
    return;
  }
  const ep = document.getElementById('endpointInput').value.trim();
  const mdl = document.getElementById('modelInput').value.trim();
  state.apiKey = val;
  state.apiEndpoint = ep || 'https://api.deepseek.com';
  state.apiModel = mdl || 'deepseek-chat';
  document.getElementById('keySavedBadge').classList.remove('hidden');
  closeCollapsible('keySection');
}


/* ================================================================
   TEXT INPUT
================================================================ */
function onTextInput() {
  const ta = document.getElementById('textInput');
  ta.classList.remove('error');
  document.getElementById('textErrorTip').classList.remove('visible');
  document.getElementById('charCount').textContent = ta.value.length + ' 字';
}

function fillSampleText() {
  const ta = document.getElementById('textInput');
  ta.value = SAMPLE_TEXT;
  onTextInput();
}


/* ================================================================
   EXTRACTION
================================================================ */
async function startExtraction() {
  if (state.inputMode === 'pdf') return startExtractionPdf();

  // Read values
  const textVal = document.getElementById('textInput').value.trim();

  let hasError = false;

  // Validate custom key
  if (state.apiMode === 'custom' && !state.apiKey) {
    document.getElementById('keyInput').classList.add('error');
    document.getElementById('keyErrorTip').classList.add('visible');
    openCollapsible('keySection');
    hasError = true;
  }

  // Validate text
  if (!textVal) {
    document.getElementById('textInput').classList.add('error');
    document.getElementById('textErrorTip').classList.add('visible');
    hasError = true;
  }

  if (hasError) return;

  setLoading(true);

  if (state.apiMode === 'default') {
    // Demo 模式：返回 mock 数据，无需 API
    setTimeout(() => {
      try {
        const result = completeResult(JSON.parse(JSON.stringify(MOCK_PDF_RESULT)));
        result._meta = {
          extractedAt: new Date().toISOString(),
          inputLength: textVal.length,
          sourceMode: 'text'
        };
        state.result = result;
        localStorage.setItem(STORAGE_KEY_RESULT, JSON.stringify(state.result));
        renderOutput();
      } finally {
        setLoading(false);
      }
    }, 1800);
    return;
  }

  try {
    const userPrompt = USER_PROMPT_TEMPLATE.replace('{{TEXT}}', textVal);
    const raw = await callDeepSeek(userPrompt);
    const parsed = parseAIResponse(raw);
    const completed = completeResult(parsed);

    state.result = completed;
    state.result._meta = {
      extractedAt: new Date().toISOString(),
      inputLength: textVal.length
    };

    localStorage.setItem(STORAGE_KEY_RESULT, JSON.stringify(state.result));
    renderOutput();
  } catch (err) {
    showError(err.message);
  } finally {
    setLoading(false);
  }
}

async function callDeepSeek(userPrompt) {
  // Resolve endpoint / key / model based on current mode
  let apiKey, baseUrl, model;
  if (state.apiMode === 'custom') {
    apiKey  = state.apiKey;
    baseUrl = state.apiEndpoint.replace(/\/$/, '');
    model   = state.apiModel;
  } else {
    apiKey  = BUILTIN_API_KEY;
    baseUrl = DEEPSEEK_BASE_URL;
    model   = DEEPSEEK_MODEL;
  }

  const resp = await fetch(`${baseUrl}/v1/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user',   content: userPrompt }
      ],
      temperature: 0.1
    })
  });

  if (resp.status === 401) throw new Error('API Key 无效，请检查后重新保存');
  if (resp.status === 429) throw new Error('请求频率过高，请稍后重试');
  if (!resp.ok) throw new Error(`API 请求失败：HTTP ${resp.status}`);

  const data = await resp.json();
  return data.choices?.[0]?.message?.content || '';
}

function parseAIResponse(raw) {
  // Strip markdown code block markers if present
  let cleaned = raw.trim();
  cleaned = cleaned.replace(/^```json\s*/i, '').replace(/^```\s*/i, '');
  cleaned = cleaned.replace(/\s*```$/i, '');
  cleaned = cleaned.trim();

  try {
    return JSON.parse(cleaned);
  } catch (e) {
    const preview = cleaned.substring(0, 200);
    throw new Error(`AI 返回格式异常，无法解析 JSON。\n原始内容（前200字）：\n${preview}`);
  }
}

/** Ensure all expected keys exist in result, filling defaults for missing ones */
function completeResult(data) {
  const ensureField = (obj, key) => {
    if (!obj[key] || typeof obj[key] !== 'object') {
      obj[key] = { value: null, confidence: 'low', source: '未在提供的文本中找到相关内容' };
    } else {
      if (obj[key].value === undefined) obj[key].value = null;
      if (!obj[key].confidence) obj[key].confidence = 'low';
      if (obj[key].source === undefined) obj[key].source = '';
    }
  };

  // companyBasic
  if (!data.companyBasic || typeof data.companyBasic !== 'object') data.companyBasic = {};
  Object.keys(FIELD_LABELS_BASIC).forEach(k => ensureField(data.companyBasic, k));

  // esopPlan
  if (!data.esopPlan || typeof data.esopPlan !== 'object') data.esopPlan = {};
  Object.keys(FIELD_LABELS_PLAN).forEach(k => ensureField(data.esopPlan, k));

  // grantees
  if (!Array.isArray(data.grantees)) data.grantees = [];
  data.grantees.forEach(g => {
    Object.keys(FIELD_LABELS_GRANTEE).forEach(k => ensureField(g, k));
  });

  return data;
}


/* ================================================================
   LOADING STATE
================================================================ */
function setLoading(on) {
  state.isLoading = on;
  const btn = document.getElementById('extractBtn');
  const overlay = document.getElementById('loadingOverlay');

  btn.disabled = on;
  btn.textContent = on
    ? (state.inputMode === 'pdf' ? '⏳ 解析 PDF 中...' : '⏳ 提取中...')
    : '🔍 开始提取';

  if (on) {
    overlay.classList.remove('hidden');
  } else {
    overlay.classList.add('hidden');
  }
}


/* ================================================================
   ERROR DISPLAY
================================================================ */
function showError(msg) {
  // Show in output area
  document.getElementById('outputPlaceholder').classList.add('hidden');
  document.getElementById('outputContent').classList.add('hidden');

  let errDiv = document.getElementById('errorDisplay');
  if (!errDiv) {
    errDiv = document.createElement('div');
    errDiv.id = 'errorDisplay';
    errDiv.style.cssText = `
      background: rgba(239,68,68,0.1);
      border: 1px solid rgba(239,68,68,0.3);
      border-radius: var(--radius-sm);
      padding: 16px 20px;
      color: var(--red);
      white-space: pre-wrap;
      line-height: 1.7;
      font-size: 13px;
    `;
    document.getElementById('panelOutput').appendChild(errDiv);
  }

  errDiv.style.display = 'block';
  errDiv.textContent = '⚠ 提取失败\n\n' + msg;
}

function clearError() {
  const errDiv = document.getElementById('errorDisplay');
  if (errDiv) errDiv.style.display = 'none';
}


/* ================================================================
   RENDER OUTPUT
================================================================ */
function renderOutput() {
  clearError();

  if (!state.result) return;

  // Show content, hide placeholder
  document.getElementById('outputPlaceholder').classList.add('hidden');
  document.getElementById('outputContent').classList.remove('hidden');

  // --- Run validation ---
  state.validationWarnings = runValidation(state.result);

  // --- Stats ---
  const meta = state.result._meta || {};
  document.getElementById('statTime').textContent =
    meta.extractedAt ? new Date(meta.extractedAt).toLocaleString('zh-CN') : '—';

  // Count fields
  const { fieldCount, lowCount, highCount, sourcedCount } = countFields(state.result);
  document.getElementById('statFields').textContent = fieldCount + ' 个';

  // 高置信度率
  const highRatio = fieldCount > 0 ? Math.round(highCount / fieldCount * 100) : 0;
  document.getElementById('statHighConf').textContent = highRatio + '%';

  // 溯源覆盖率
  const sourceRatio = fieldCount > 0 ? Math.round(sourcedCount / fieldCount * 100) : 0;
  document.getElementById('statSourceCov').textContent = sourceRatio + '%';

  const warnWrap = document.getElementById('statWarnWrap');
  if (lowCount > 0) {
    warnWrap.classList.remove('hidden');
    document.getElementById('statWarn').textContent = `⚠ ${lowCount} 个低置信度`;
  } else {
    warnWrap.classList.add('hidden');
  }

  // --- Bad case count ---
  updateBadCaseCount();

  // --- Tab warning dots ---
  updateTabDots();

  // --- Render active tab ---
  renderTab(state.activeTab);
}

/* ================================================================
   VALIDATION
================================================================ */
/**
 * 跨字段逻辑校验，返回异常字段路径集合
 * key 格式：`section.fieldKey` 或 `grantees.${i}.fieldKey`
 */
function runValidation(result) {
  const warnings = {}; // path -> message

  const parseNum = (v) => {
    if (v === null || v === undefined) return null;
    const n = parseFloat(String(v).replace(/[^0-9.\-]/g, ''));
    return isNaN(n) ? null : n;
  };

  const parseDate = (v) => {
    if (!v) return null;
    const d = new Date(v);
    return isNaN(d.getTime()) ? null : d;
  };

  const plan   = result.esopPlan    || {};
  const basic  = result.companyBasic || {};

  const grantedShares  = parseNum(plan.grantedShares?.value);
  const reservedShares = parseNum(plan.reservedShares?.value);
  const exercisePrice  = parseNum(plan.exercisePrice?.value);
  const ipoPrice       = parseNum(basic.ipoPrice?.value);
  const adoptionDate   = parseDate(plan.adoptionDate?.value);

  // 规则1：授予股数 > 预留股数（授予不能超过预留池）
  if (grantedShares !== null && reservedShares !== null && grantedShares > reservedShares) {
    warnings['esopPlan.grantedShares']  = `授予股数(${grantedShares})超过预留股数(${reservedShares})`;
    warnings['esopPlan.reservedShares'] = `预留股数(${reservedShares})小于授予股数(${grantedShares})`;
  }

  // 规则2：行权价 < IPO 价格 × 10%（行权价异常低）
  if (exercisePrice !== null && ipoPrice !== null && exercisePrice < ipoPrice * 0.1) {
    warnings['esopPlan.exercisePrice'] = `行权价(${exercisePrice})低于 IPO 发行价(${ipoPrice})的 10%，疑似异常`;
  }

  // 规则3：被授予人 grantDate < esopPlan.adoptionDate（授予时间早于计划采纳）
  if (Array.isArray(result.grantees) && adoptionDate) {
    result.grantees.forEach((g, i) => {
      const grantDate = parseDate(g.grantDate?.value);
      if (grantDate && grantDate < adoptionDate) {
        warnings[`grantees.${i}.grantDate`] =
          `授予日期(${g.grantDate.value})早于计划采纳日期(${plan.adoptionDate.value})`;
      }
    });
  }

  // 规则4：各被授予人授予股数之和 > esopPlan.grantedShares
  if (Array.isArray(result.grantees) && grantedShares !== null) {
    const totalGranted = result.grantees.reduce((sum, g) => {
      const n = parseNum(g.grantedShares?.value);
      return sum + (n || 0);
    }, 0);
    if (totalGranted > grantedShares * 1.01) { // 允许 1% 误差（单位/精度问题）
      warnings['esopPlan.grantedShares'] =
        (warnings['esopPlan.grantedShares'] ? warnings['esopPlan.grantedShares'] + '；' : '') +
        `各被授予人授予股数合计(${totalGranted})超过计划授予总数(${grantedShares})`;
    }
  }

  return warnings;
}

function countFields(result) {
  let total  = 0;
  let low    = 0;
  let high   = 0;
  let sourced = 0;

  const scan = (obj) => {
    if (!obj || typeof obj !== 'object') return;
    if ('value' in obj && 'confidence' in obj) {
      total++;
      if (obj.confidence === 'low' && obj.value !== null) low++;
      if (obj.confidence === 'high') high++;
      if (obj.source && obj.source.trim() && obj.source !== '未在提供的文本中找到相关内容') sourced++;
      return;
    }
    Object.values(obj).forEach(v => {
      if (Array.isArray(v)) v.forEach(scan);
      else scan(v);
    });
  };

  scan(result.companyBasic);
  scan(result.esopPlan);
  if (Array.isArray(result.grantees)) result.grantees.forEach(scan);

  return { fieldCount: total, lowCount: low, highCount: high, sourcedCount: sourced };
}

function haslowWarning(obj) {
  if (!obj) return false;
  if ('value' in obj && 'confidence' in obj) {
    return obj.confidence === 'low' && obj.value !== null;
  }
  return Object.values(obj).some(v => {
    if (Array.isArray(v)) return v.some(haslowWarning);
    return haslowWarning(v);
  });
}

function updateTabDots() {
  const r = state.result;
  document.getElementById('dot-basic').classList.toggle(
    'hidden', !haslowWarning(r.companyBasic));
  document.getElementById('dot-plan').classList.toggle(
    'hidden', !haslowWarning(r.esopPlan));

  const granteeWarn = Array.isArray(r.grantees) && r.grantees.some(haslowWarning);
  document.getElementById('dot-grantees').classList.toggle('hidden', !granteeWarn);
}


/* ================================================================
   TABS
================================================================ */
function switchTab(tab) {
  state.activeTab = tab;

  // Update tab buttons
  ['basic','plan','grantees'].forEach(t => {
    document.getElementById('tab-' + t).classList.toggle('active', t === tab);
  });

  renderTab(tab);
}

function renderTab(tab) {
  const container = document.getElementById('tabContent');

  if (tab === 'basic') {
    container.innerHTML = renderFieldTable(
      state.result.companyBasic,
      FIELD_LABELS_BASIC,
      'companyBasic'
    );
  } else if (tab === 'plan') {
    container.innerHTML = renderFieldTable(
      state.result.esopPlan,
      FIELD_LABELS_PLAN,
      'esopPlan'
    );
  } else if (tab === 'grantees') {
    container.innerHTML = renderGrantees();
  }
}

/** Render a key-value section as a table */
function renderFieldTable(section, labels, sectionKey, granteeIndex) {
  let rows = '';
  const keys = Object.keys(labels);

  keys.forEach(key => {
    const field = section[key] || { value: null, confidence: 'low', source: '' };
    const label = labels[key] || key;

    const displayVal   = fieldValueHTML(field, sectionKey, key, granteeIndex);
    const badgeHTML    = confBadge(field.confidence);
    const srcHTML      = renderSourceCell(field.source || '');
    const editDataAttr = granteeIndex !== undefined
      ? `data-sec="${sectionKey}" data-key="${key}" data-gi="${granteeIndex}"`
      : `data-sec="${sectionKey}" data-key="${key}"`;

    rows += `
      <tr>
        <td class="col-name">${escapeHTML(label)}</td>
        <td class="col-value">${displayVal}</td>
        <td class="col-conf">${badgeHTML}</td>
        <td class="col-src">${srcHTML}</td>
        <td class="col-action">
          <button class="btn-edit" ${editDataAttr} onclick="openEditModal(this)">编辑</button>
        </td>
      </tr>`;
  });

  return `
    <div class="table-wrap">
      <table class="field-table">
        <thead>
          <tr>
            <th class="col-name">字段</th>
            <th class="col-value">提取值</th>
            <th class="col-conf">置信度</th>
            <th class="col-src">原文来源</th>
            <th class="col-action"></th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>`;
}

function fieldValueHTML(field, sectionKey, key, granteeIndex) {
  if (field.value === null || field.value === undefined || field.value === '') {
    return '<span class="value-null">—</span>';
  }

  let html = escapeHTML(String(field.value));

  if (field.badCase) {
    html += '<span class="badcase-tag">⚑ Bad Case</span>';
  }

  // 校验警告图标
  const warnPath = granteeIndex !== undefined
    ? `${sectionKey}.${granteeIndex}.${key}`
    : `${sectionKey}.${key}`;
  const warnMsg = state.validationWarnings && state.validationWarnings[warnPath];
  if (warnMsg) {
    html += `<div class="validation-warn">⚠ 校验异常：${escapeHTML(warnMsg)}</div>`;
  }

  return html;
}

function confBadge(conf) {
  if (conf === 'high')   return '<span class="conf-badge conf-high">高</span>';
  if (conf === 'medium') return '<span class="conf-badge conf-medium">中</span>';
  return '<span class="conf-badge conf-low">低·需核查</span>';
}

function renderGrantees() {
  const grantees = state.result.grantees || [];

  if (grantees.length === 0) {
    return `<div class="no-grantees">未提取到授予人信息</div>`;
  }

  return grantees.map((g, i) => `
    <div class="grantee-section">
      <div class="grantee-title">被授予人 #${i + 1}</div>
      ${renderFieldTable(g, FIELD_LABELS_GRANTEE, 'grantees', i)}
    </div>
  `).join('');
}


/* ================================================================
   EDIT MODAL
================================================================ */
function openEditModal(btn) {
  const sec = btn.dataset.sec;
  const key = btn.dataset.key;
  const gi  = btn.dataset.gi !== undefined ? parseInt(btn.dataset.gi) : undefined;

  let field;
  if (sec === 'grantees' && gi !== undefined) {
    field = state.result.grantees[gi][key];
    state.editingCell = { section: sec, key, granteeIndex: gi };
  } else {
    field = state.result[sec][key];
    state.editingCell = { section: sec, key };
  }

  let labels = {};
  if (sec === 'companyBasic') labels = FIELD_LABELS_BASIC;
  else if (sec === 'esopPlan') labels = FIELD_LABELS_PLAN;
  else labels = FIELD_LABELS_GRANTEE;

  document.getElementById('modalTitle').textContent    = labels[key] || key;
  document.getElementById('modalSubtitle').textContent = `${sec} → ${key}` + (gi !== undefined ? ` [${gi}]` : '');
  document.getElementById('modalSource').textContent   = field.source || '无原文来源';

  // Restore existing bad case data if present
  const existing = field.badCase || {};
  document.querySelectorAll('input[name="errorType"]').forEach(cb => {
    cb.checked = (existing.errorTypes || []).includes(cb.value);
  });
  document.getElementById('modalValueInput').value  = existing.correctValue != null ? existing.correctValue : (field.value !== null ? String(field.value) : '');
  document.getElementById('modalNoteInput').value   = existing.note || '';
  document.getElementById('modalErrorTypeTip').classList.remove('visible');

  document.getElementById('editModal').classList.remove('hidden');
}

function closeEditModal() {
  document.getElementById('editModal').classList.add('hidden');
  state.editingCell = null;
}

function saveBadCase() {
  if (!state.editingCell) return;

  const checked = [...document.querySelectorAll('input[name="errorType"]:checked')].map(cb => cb.value);
  if (checked.length === 0) {
    document.getElementById('modalErrorTypeTip').classList.add('visible');
    return;
  }

  const correctValue = document.getElementById('modalValueInput').value.trim();
  const note         = document.getElementById('modalNoteInput').value.trim();
  const { section, key, granteeIndex } = state.editingCell;

  let field;
  if (section === 'grantees' && granteeIndex !== undefined) {
    field = state.result.grantees[granteeIndex][key];
  } else {
    field = state.result[section][key];
  }

  field.badCase = {
    errorTypes:   checked,
    correctValue: correctValue || null,
    note:         note || null,
    markedAt:     new Date().toISOString()
  };

  // If correct value provided, update field value too
  if (correctValue) {
    field.value      = correctValue;
    field.confidence = 'high';
  }

  localStorage.setItem(STORAGE_KEY_RESULT, JSON.stringify(state.result));
  closeEditModal();
  renderOutput();
}

// Close modal on overlay click
document.getElementById('editModal').addEventListener('click', function(e) {
  if (e.target === this) closeEditModal();
});

// Keyboard shortcut: Escape to close modal
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') closeEditModal();
});


/* ================================================================
   BAD CASE
================================================================ */
function collectBadCases(result) {
  const cases = [];

  const scan = (obj, section, granteeIndex) => {
    Object.entries(obj).forEach(([key, field]) => {
      if (field && field.badCase) {
        cases.push({
          section,
          field:        key,
          granteeIndex: granteeIndex != null ? granteeIndex : undefined,
          extracted:    field.value,
          source:       field.source || '',
          confidence:   field.confidence,
          errorTypes:   field.badCase.errorTypes,
          correctValue: field.badCase.correctValue,
          note:         field.badCase.note,
          markedAt:     field.badCase.markedAt
        });
      }
    });
  };

  scan(result.companyBasic, 'companyBasic');
  scan(result.esopPlan, 'esopPlan');
  if (Array.isArray(result.grantees)) {
    result.grantees.forEach((g, i) => scan(g, 'grantees', i));
  }

  return cases;
}

function updateBadCaseCount() {
  const cases = collectBadCases(state.result);
  const btn   = document.getElementById('exportBadBtn');
  document.getElementById('badCaseCount').textContent = cases.length;
  btn.classList.toggle('hidden', cases.length === 0);
}

function exportBadCases() {
  if (!state.result) return;

  const cases = collectBadCases(state.result);
  if (cases.length === 0) return;

  const payload = {
    exportedAt:    new Date().toISOString(),
    promptVersion: 'v1',
    sourceMode:    state.result._meta?.sourceMode || 'text',
    totalBadCases: cases.length,
    cases
  };

  const json = JSON.stringify(payload, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url  = URL.createObjectURL(blob);
  const ts   = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 19);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `esop_badcases_${ts}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}


/* ================================================================
   EXPORT
================================================================ */
function exportJSON() {
  if (!state.result) return;

  const payload = {
    exportedAt:      new Date().toISOString(),
    inputTextLength: state.result._meta?.inputLength || 0,
    result:          state.result
  };

  const json = JSON.stringify(payload, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url  = URL.createObjectURL(blob);

  const ts = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 19);
  const a  = document.createElement('a');
  a.href     = url;
  a.download = `esop_extraction_${ts}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}


/* ================================================================
   INPUT MODE
================================================================ */
function setInputMode(mode) {
  state.inputMode = mode;

  document.getElementById('modeText').classList.toggle('active', mode === 'text');
  document.getElementById('modePdf').classList.toggle('active', mode === 'pdf');

  document.getElementById('textInputArea').classList.toggle('hidden', mode !== 'text');
  document.getElementById('pdfInputArea').classList.toggle('hidden', mode !== 'pdf');
  document.getElementById('sampleBtnWrap').classList.toggle('hidden', mode !== 'text');
}


/* ================================================================
   PDF UPLOAD
================================================================ */
function onDragOver(e) {
  e.preventDefault();
  document.getElementById('pdfDropZone').classList.add('drag-over');
}

function onDragLeave(e) {
  document.getElementById('pdfDropZone').classList.remove('drag-over');
}

function onDrop(e) {
  e.preventDefault();
  document.getElementById('pdfDropZone').classList.remove('drag-over');
  const file = e.dataTransfer.files[0];
  if (file) handlePdfFile(file);
}

function onPdfFileSelect(e) {
  const file = e.target.files[0];
  if (file) handlePdfFile(file);
  e.target.value = '';
}

function handlePdfFile(file) {
  const errTip = document.getElementById('pdfErrorTip');
  errTip.classList.remove('visible');

  if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
    errTip.textContent = '仅支持 PDF 文件，请重新选择';
    errTip.classList.add('visible');
    return;
  }
  if (file.size > 50 * 1024 * 1024) {
    errTip.textContent = '文件超过 50MB，请选择较小的文件';
    errTip.classList.add('visible');
    return;
  }

  state.pdfFile = file;
  parsePdfMock(file);
}

function parsePdfMock(file) {
  const pageCount = Math.floor(file.size / 50000) + 5;
  const sizeMB    = (file.size / (1024 * 1024)).toFixed(1);

  state.pdfMeta = { name: file.name, size: file.size, pageCount };

  document.getElementById('pdfFileName').textContent = file.name;
  document.getElementById('pdfFileMeta').textContent = `${pageCount} 页 · ${sizeMB} MB`;
  document.getElementById('pdfInfoCard').classList.remove('hidden');
  document.getElementById('pdfDropZone').style.display = 'none';
}

function clearPdf() {
  state.pdfFile = null;
  state.pdfMeta = null;

  document.getElementById('pdfInfoCard').classList.add('hidden');
  document.getElementById('pdfDropZone').style.display = '';
  document.getElementById('pdfErrorTip').classList.remove('visible');
  document.getElementById('pdfErrorTip').textContent = '请上传 PDF 文件后再开始提取';
}

function startExtractionPdf() {
  if (!state.pdfFile) {
    document.getElementById('pdfErrorTip').classList.add('visible');
    return;
  }

  setLoading(true);

  setTimeout(() => {
    try {
      const result = completeResult(JSON.parse(JSON.stringify(MOCK_PDF_RESULT)));
      result._meta = {
        extractedAt: new Date().toISOString(),
        inputLength: state.pdfMeta ? state.pdfMeta.size : 0,
        sourceMode:  'pdf',
        fileName:    state.pdfMeta ? state.pdfMeta.name : ''
      };

      state.result = result;
      localStorage.setItem(STORAGE_KEY_RESULT, JSON.stringify(state.result));
      renderOutput();
    } finally {
      setLoading(false);
    }
  }, 1800);
}


/* ================================================================
   SOURCE CELL RENDERER
================================================================ */
function renderSourceCell(source) {
  if (!source) return '<span style="color:var(--text-muted)">—</span>';

  const sep = ' | ';
  const idx = source.indexOf(sep);
  if (idx !== -1) {
    const location = source.substring(0, idx);
    const snippet  = source.substring(idx + sep.length);
    return `<div class="src-location">${escapeHTML(location)}</div>` +
           `<div class="src-snippet">${escapeHTML(snippet)}</div>`;
  }

  // Fallback: plain text truncated
  const truncated = source.substring(0, 60) + (source.length > 60 ? '…' : '');
  return escapeHTML(truncated);
}


/* ================================================================
   UTILITY
================================================================ */
function escapeHTML(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}


/* ================================================================
   BOOT
================================================================ */
document.addEventListener('DOMContentLoaded', init);

/* 固定浅色主题 */
