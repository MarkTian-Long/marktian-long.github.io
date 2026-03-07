/* =============================================
   INTERVIEW.JS - AI PM 面试题练习器
   ============================================= */

// ---- QUESTION BANK ----
const questionBank = {
    design: [
        {
            q: '请设计一款 AI 语音助手，目标用户是 60 岁以上的老年人，你会如何思考这个产品？',
            difficulty: '★★★',
            answer: `• 用户洞察：老年人核心痛点——视力下降、操作复杂、高频需求（用药提醒、天气、新闻、联系家人）
• 核心功能优先级：语音交互为主（免输入），超大播音量，慢速语音，关键词容错识别
• AI策略：本地化唤醒词降低网络依赖，方言识别，主动出声减少等待焦虑
• 安全策略：防诈骗话术识别，异常行为告警给家属
• 成功指标：7日留存率、日均对话轮次、误识别率`
        },
        {
            q: '如何为一款 B2B SaaS 产品设计 AI 功能，帮助销售团队提升效率？',
            difficulty: '★★★',
            answer: `• 场景挖掘：销售痛点——客户资料准备耗时、跟进节点遗漏、话术不统一、复盘困难
• AI功能优先级设计（按价值/成本矩阵）：
  1. 客户画像自动生成（高价值·中成本）
  2. 智能话术推荐（高价值·高成本）
  3. 跟进时机提醒（中价值·低成本）✓ MVP
• 落地策略：先做"辅助决策"而非"自动执行"，建立信任
• 数据飞轮：销售行为数据→模型训练→推荐优化`
        },
        {
            q: '你的产品数据显示用户在某步骤流失率高达60%，你如何排查和解决？',
            difficulty: '★★★',
            answer: `• 数据定位：漏斗分析确认流失步骤，细分维度（渠道、设备、用户分层）找规律
• 定性验证：用户录屏回放、用户访谈（5人原则），寻找"卡点"
• 假设排列：认知成本高？操作路径长？信息缺失？系统Bug？
• 解决方案（对应假设）：简化表单、添加引导、内容前置、技术修复
• 验证：A/B测试，定义成功指标（完成率提升X%），灰度发布`
        },
        {
            q: '设计一个"AI 帮我写简历"的功能，从产品角度，你会如何规划？',
            difficulty: '★★',
            answer: `• 核心需求：用户不知道如何描述经历，不了解 JD 匹配逻辑
• MVP功能：输入工作经历 → AI润色为STAR结构 → 匹配JD关键词高亮
• 体验设计：保留用户原意（AI辅助不是代替），可编辑对比"前后效果"
• 差异化：行业语言包（互联网/金融/制造）、岗位关键词库
• 商业化：基础免费，高级功能（多版本、定制款式）付费`
        },
        {
            q: '如果你是微信读书的 PM，你会如何设计 AI 助读功能？',
            difficulty: '★★★★',
            answer: `• 用户价值：降低阅读门槛，提升理解深度，增加"读完"成就感
• 功能矩阵：
  1. 实时释义：划词即解，联系全书上下文解释
  2. 章节总结：每章读完自动生成要点卡片
  3. 苏格拉底式追问：AI 提出思考问题，引导深度阅读
  4. 书本对话：基于全书内容Q&A
• 优先级：释义 > 章节总结 > 书本对话 > 追问
• 风险：版权、内容失真、替代阅读（需要反向激励读原文）`
        },
    ],
    ai: [
        {
            q: '什么是 RAG（检索增强生成）？作为 PM，你如何判断一个产品场景是否适合用 RAG？',
            difficulty: '★★★',
            answer: `• RAG简述：将检索系统与大模型结合，先从知识库检索相关内容，再让模型基于检索结果生成回答，解决模型知识截止和幻觉问题
• 适合 RAG 的场景特征：
  ✅ 需要访问实时/私有/定制知识库
  ✅ 回答需要有溯源（企业客服、法律、医疗）
  ✅ 内容更新频繁，不适合每次微调模型
• 不适合 RAG 的场景：
  ❌ 通用对话、创意写作（模型本身够用）
  ❌ 数据量极小（直接放进Prompt更快）
• PM关注指标：召回准确率、答案可溯源度、响应延迟`
        },
        {
            q: '如何评估一个 AI 功能上线后的效果？你会设计哪些指标体系？',
            difficulty: '★★★',
            answer: `• 指标分层框架：
  1. 技术指标（模型层）：准确率、召回率、响应时长、幻觉率
  2. 用户体验指标：功能使用率、满意度评分、负反馈率（踩/差评）
  3. 业务指标：因AI功能带来的转化提升、留存提升、支持成本降低
• 建立基线：上线前设定 baseline，剔除自然增长
• A/B 对照：AI版 vs 非AI版，单变量对照
• 定性补充：用户访谈、支持工单分析，捕获量化指标遗漏的问题
• 迭代触发条件：明确哪些指标低于阈值时需要回滚或紧急迭代`
        },
        {
            q: '大模型的"幻觉"问题，产品经理应该如何在产品设计层面应对？',
            difficulty: '★★★',
            answer: `• 幻觉本质：模型自信地生成了错误事实（"流利地撒谎"）
• 产品层解法（不依赖模型优化）：
  1. 信息溯源：在回答旁显示"来源文档"，用户可验证
  2. 置信度展示：低置信内容加警示标注
  3. 范围限制：缩小模型回答范围（System Prompt 约束 + RAG）
  4. 人工兜底：重要场景（医疗/法律/金融）加"以专业人士意见为准"免责
  5. 用户反馈闭环：设置"纠错"入口，数据回流改善模型
• PM决策点：在高风险场景宁可回答"不知道"也不能编造`
        },
        {
            q: '如果你负责的 AI 产品存在算法偏见/歧视，你会如何处理？',
            difficulty: '★★★★',
            answer: `• 首先：承认问题存在的严重性，不回避不掩盖
• 短期（止损）：
  - 评估影响范围和用户群体
  - 临时下线或降级敏感场景
  - 准备对外沟通口径
• 中期（溯源修复）：
  - 数据层：审查训练数据偏差，补充代表性样本
  - 模型层：引入公平性约束，对保护群体做测试集专项评估
  - 产品层：增加人工核查节点
• 长期（制度化）：
  - 建立 AI 伦理审查流程（上线前必过）
  - 外部红队测试
• PM立场：AI产品的公平性是底线，不是优化项`
        },
        {
            q: '你如何看待 Prompt Engineering 在 AI 产品中的作用？PM 需要掌握到什么程度？',
            difficulty: '★★',
            answer: `• Prompt 的产品价值：直接决定 AI 功能的输出质量，是最快的"零代码优化"路径
• PM 需要掌握的核心技能：
  1. 角色设定（System Prompt）：让模型有清晰人设和能力边界
  2. 少样本示例（Few-shot）：给模型"看范例"降低错误率
  3. 思维链（Chain of Thought）：复杂推理让模型"想清楚再说"
  4. 输出格式控制：JSON/Markdown结构化输出，方便前端解析
• PM不需要深入的：模型微调、向量数据库原理（理解即可）
• 实践建议：建立团队 Prompt 资产库，版本管理，A/B对比优化`
        },
    ],
    data: [
        {
            q: '你的 App DAU 突然下降 20%，请你用数据分析的思路一步步定位问题。',
            difficulty: '★★★',
            answer: `• 第一步（排除干扰）：确认数据口径无误，排查埋点/统计Bug，查看是否节假日/大盘影响
• 第二步（维度拆解）：
  - 时间维度：何时开始下降，是持续还是突降
  - 渠道维度：哪个来源渠道下降最明显
  - 用户分层：新用户/活跃用户/流失用户哪个变化大
  - 版本维度：是否与某次发版时间重合
• 第三步（假设验证）：
  - 技术Bug → 崩溃率、报错日志
  - 体验变化 → 用户录屏、NPS反馈
  - 竞品影响 → App Store排行榜、竞品动态
• 第四步（结论输出）：明确根因，评估影响，提出修复方案和时间节点`
        },
        {
            q: '什么是 A/B 测试？如何设计一次有效的 A/B 实验？',
            difficulty: '★★',
            answer: `• 本质：通过随机分组，单变量对照，统计显著性验证，判断某改动是否产生正向效果
• 设计步骤：
  1. 明确假设：我认为"改变X"会使"指标Y"提升，因为"Z原因"
  2. 确定指标：主指标（转化率）+ 辅助指标（留存）+ 护栏指标（不能下降的）
  3. 样本计算：根据效应量和期望置信度（95%）计算最小样本量
  4. 分流策略：用户ID哈希分流，保证随机性和互斥性
  5. 实验时长：至少1个完整用户周期（通常7天以上）
  6. 结果分析：p值<0.05认为显著，注意辛普森悖论、多重检验问题
• 常见坑：过早看结果（p-hacking）、分流不均、脏数据`
        },
        {
            q: '请用 SQL 逻辑（不一定写标准语法）描述：如何找出"连续7天登录"的用户？',
            difficulty: '★★★★',
            answer: `• 思路：
  1. 获取用户每次登录日期（去重，按用户+日期聚合）
  2. 计算辅助列：登录日期 - ROW_NUMBER() → 如果连续，这个差值相同
  3. 按 用户ID + 差值 分组，count(*)>=7 的就是连续7天登录用户

• 伪 SQL：
  WITH daily_login AS (
    SELECT user_id, DATE(login_time) AS dt
    FROM events WHERE event='login'
    GROUP BY 1,2
  ),
  with_rn AS (
    SELECT user_id, dt,
      DATE_SUB(dt, INTERVAL ROW_NUMBER() OVER(PARTITION BY user_id ORDER BY dt) DAY) AS grp
    FROM daily_login
  )
  SELECT DISTINCT user_id FROM with_rn
  GROUP BY user_id, grp
  HAVING COUNT(*) >= 7`
        },
        {
            q: '如何判断一个功能的上线是"真的有效"还是"自然增长带来的"？',
            difficulty: '★★★',
            answer: `• 核心方法：A/B实验（最严谨）
• 无法A/B时的替代方案：
  1. 前后对比 + 大盘趋势剔除：实验组增长幅度 vs 整体大盘增长幅度差值
  2. DID（双重差分）：选相似对照组，比较"功能上线前后"两组的差异变化量
  3. 断点回归：功能上线是天然"断点"，观察指标是否有结构性突变
• PM判断标准：
  - 多个指标同向变化（主指标↑ + 辅助指标也↑）
  - 变化时间点与上线时间吻合
  - 排除了外部事件干扰（节假日/营销活动）`
        },
    ],
    behavior: [
        {
            q: '请分享一个你推动过最困难的跨部门协作经历，你是如何解决冲突的？',
            difficulty: '★★★',
            answer: `• STAR框架回答：
• Situation：描述背景（部门目标不一致/资源争夺/信息不透明）
• Task：你的角色和需要达成的目标
• Action（核心）：
  - 主动建立共同利益点（"我们都希望用户满意"）
  - 数据说话，减少主观判断
  - 引入决策框架（RICE/优先级矩阵），让冲突变成流程讨论
  - 必要时升级至共同上级，但以"求共识"而非"告状"为目的
• Result：量化结果（上线时间、关系改善、流程沉淀）
• 加分项：总结出可复用的协作模式或规范`
        },
        {
            q: '在资源有限的情况下，你如何确定产品功能的优先级？',
            difficulty: '★★',
            answer: `• 框架选择（根据场景）：
  - RICE = (Reach×Impact×Confidence)/Effort → 适合需求多、资源少的场景
  - MoSCoW = Must/Should/Could/Won't → 适合版本规划
  - 用户价值/商业价值 2x2矩阵 → 快速决策
• 优先级决策过程：
  1. 明确当前阶段核心目标（增长/留存/变现）
  2. 评估每个需求对核心目标的贡献度
  3. 估算研发成本，计算性价比
  4. 与团队对齐，避免只是"PM的决定"
• 避免的陷阱：老板要求 ≠ 高优先级（需要数据支撑）；声音最大的用户 ≠ 代表所有用户`
        },
        {
            q: '你认为一个好的 AI 产品经理，最核心的能力是什么？',
            difficulty: '★★',
            answer: `• 我认为最核心的能力是"AI能力边界的判断力"
• 解释：AI PM 不需要会跑模型，但必须清楚：
  - 什么问题 AI 能解（准确且低成本）
  - 什么问题 AI 不能解（或者会带来风险）
  - 用户什么时候接受AI犯错，什么时候不能接受
• 这种判断力决定了产品是否能找到真正有价值的 AI 应用场景，而不是为了 "AI" 而 AI
• 其次：技术同理心（能和算法工程师说同一种语言）
• 再次：用户洞察（AI 解决的是用户问题，不是技术展示）`
        },
        {
            q: '如果你的老板要求你快速上线一个你认为体验不够好的功能，你怎么办？',
            difficulty: '★★★',
            answer: `• 不是简单"执行"或"对抗"，而是"争取空间+建立共识"
• 步骤：
  1. 理解老板的真实动机（deadline压力？竞对压力？商务承诺？）
  2. 用数据量化"体验不好"的风险：预估差评率、流失率、TS工单量
  3. 提出折中方案：能不能用最小工期完成"可接受"的体验（而不是完美版）？
  4. 明确"技术债"和后续修复计划，白纸黑字记录共识
• 如果最终还是要上：
  - 确保监控完备，能第一时间发现问题
  - 上线后第一时间复盘，推动后续改善迭代
• 核心态度：PM 是产品的"守门人"，但也是团队的"推进者"，要能在约束中找最优解`
        },
        {
            q: '你加入一家公司后，第一个月你会如何快速了解和融入产品？',
            difficulty: '★★',
            answer: `• 第一周：信息收集
  - 阅读所有能找到的产品文档（PRD、竞品报告、用户反馈报告）
  - 自己当用户，深度体验产品，记录感受
  - 1on1 关键stakeholder（研发负责人、设计师、客服、销售）
• 第二周：理解背景
  - 梳理产品现阶段核心目标和OKR
  - 研究数据看板，了解核心指标的健康状态
  - 了解现有用户分层和典型用户画像
• 第三四周：输出贡献
  - 整理一份"新人视角的产品观察报告"（优势/问题/机会）
  - 主动认领一个小需求，走完完整流程（需求→评审→跟进→上线）
• 核心：尽快从"接受者"变成"贡献者"，但建立判断要基于足够信息`
        },
    ],
};

// Flatten all questions with category info
function getQuestions(cat) {
    if (cat === 'all') {
        return Object.entries(questionBank).flatMap(([c, qs]) =>
            qs.map(q => ({ ...q, cat: c }))
        );
    }
    return (questionBank[cat] || []).map(q => ({ ...q, cat }));
}

const catNames = {
    design: '产品设计',
    ai: 'AI 专题',
    data: '数据分析',
    behavior: '行为面试',
    all: '综合',
};

// ---- STATE ----
let state = {
    cat: 'all',
    questions: [],
    current: 0,
    ratings: [],
    totalSeconds: 0,
    questionSeconds: 0,
    timerInterval: null,
    started: false,
};

// ---- UI REFS ----
const $ = id => document.getElementById(id);

function selectCategory(btn, cat) {
    document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    state.cat = cat;
}

function startPractice() {
    const qs = getQuestions(state.cat);
    // Shuffle
    state.questions = [...qs].sort(() => Math.random() - 0.5).slice(0, 10);
    state.current = 0;
    state.ratings = [];
    state.totalSeconds = 0;
    state.questionSeconds = 0;
    state.started = true;

    $('categorySelect').classList.add('hidden');
    $('resultArea').classList.add('hidden');
    $('questionArea').classList.remove('hidden');

    showQuestion();
    startTimer();
}

function showQuestion() {
    const q = state.questions[state.current];
    if (!q) return;

    $('qCategory').textContent = catNames[q.cat] || q.cat;
    $('qDifficulty').textContent = q.difficulty;
    $('questionNumber').textContent = `第 ${state.current + 1} 题 / 共 ${state.questions.length} 题`;
    $('questionText').textContent = q.q;
    $('answerArea').classList.add('hidden');
    $('showAnswerBtn').classList.remove('hidden');
    $('nextBtn').classList.add('hidden');

    // Reset star ratings
    document.querySelectorAll('.star-btn').forEach(b => b.classList.remove('active'));
    state.questionSeconds = 0;

    updateProgress();
}

function showAnswer() {
    const q = state.questions[state.current];
    $('answerText').textContent = q.answer;
    $('answerArea').classList.remove('hidden');
    $('showAnswerBtn').classList.add('hidden');
    $('nextBtn').classList.remove('hidden');
}

function rateSelf(n) {
    document.querySelectorAll('.star-btn').forEach((b, i) => {
        b.classList.toggle('active', i < n);
    });
    state.ratings[state.current] = n;
}

function nextQuestion() {
    state.current++;
    if (state.current >= state.questions.length) {
        showResult();
    } else {
        showQuestion();
    }
}

function showResult() {
    clearInterval(state.timerInterval);
    $('questionArea').classList.add('hidden');
    $('resultArea').classList.remove('hidden');

    const total = state.questions.length;
    const rated = state.ratings.filter(Boolean);
    const avg = rated.length ? (rated.reduce((a, b) => a + b, 0) / rated.length).toFixed(1) : '-';
    const mins = Math.floor(state.totalSeconds / 60);
    const secs = state.totalSeconds % 60;

    $('resultTotal').textContent = total;
    $('resultAvg').textContent = avg + ' / 5';
    $('resultTime').textContent = `${mins}:${secs.toString().padStart(2, '0')}`;

    updateProgress(true);
}

function restartPractice() {
    $('resultArea').classList.add('hidden');
    $('categorySelect').classList.remove('hidden');
    updateProgress(false, true);
}

// ---- TIMER ----
function startTimer() {
    clearInterval(state.timerInterval);
    state.timerInterval = setInterval(() => {
        state.totalSeconds++;
        state.questionSeconds++;
        const m = Math.floor(state.questionSeconds / 60);
        const s = state.questionSeconds % 60;
        const el = $('timerDisplay');
        if (el) el.textContent = `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }, 1000);
}

// ---- PROGRESS RING ----
function updateProgress(done = false, reset = false) {
    const fill = $('progressRingFill');
    const label = $('progressLabel');
    const text = $('progressText');
    if (!fill) return;

    const circumference = 150.8;
    let pct = 0;

    if (reset) {
        fill.style.strokeDashoffset = circumference;
        label.textContent = '0%';
        text.textContent = '未开始';
        return;
    }

    const total = state.questions.length || 1;
    const current = done ? total : state.current;
    pct = Math.round((current / total) * 100);

    fill.style.strokeDashoffset = circumference * (1 - pct / 100);
    label.textContent = pct + '%';
    text.textContent = done ? '已完成 🎉' : `${current} / ${total}`;
}
