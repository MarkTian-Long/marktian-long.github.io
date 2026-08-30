(function exposeAgentHubEngine(root, factory) {
  const model = root && root.AgentHubModel
    ? root.AgentHubModel
    : (typeof require === 'function' ? require('./data/decision-model.js') : null);
  const engine = factory(model);
  if (typeof module !== 'undefined' && module.exports) module.exports = engine;
  if (root) root.AgentHubEngine = engine;
}(typeof globalThis !== 'undefined' ? globalThis : this, function buildAgentHubEngine(model) {
  const QUESTION_IDS = model ? model.questions.map((question) => question.id) : [];
  const AGENT_MODE_IDS = ['rag-assistant', 'single-agent-tools', 'parallel-multi-agent'];

  function parseDate(value) {
    if (value instanceof Date) return new Date(value.getTime());
    const source = String(value || new Date().toISOString()).length <= 10
      ? `${value}T00:00:00Z`
      : String(value);
    const date = new Date(source);
    return Number.isNaN(date.getTime()) ? new Date('2026-08-30T00:00:00Z') : date;
  }

  function formatDate(value) {
    return parseDate(value).toISOString().slice(0, 10);
  }

  function getFrameworkFreshness(fact, now) {
    return {
      state: 'archive-only',
      archivedAt: formatDate(fact.source.archivedAt),
      label: '待人工事实复核',
      currentRecommendation: false,
    };
  }

  function normalizeAnswers(input) {
    const source = input && typeof input === 'object' ? input : {};
    const normalized = {};
    for (const question of model.questions) {
      const value = source[question.id];
      normalized[question.id] = question.options.some((option) => option.id === value) ? value : '';
    }
    return normalized;
  }

  function getOptionLabel(questionId, optionId) {
    const question = model.questions.find((item) => item.id === questionId);
    return question?.options.find((option) => option.id === optionId)?.label || optionId;
  }

  function makeMetric(id, label, definition, source) {
    return {
      id,
      label,
      kind: 'proxy',
      definition,
      unit: '任务占比',
      source,
      asOf: '2026-08-30',
    };
  }

  function findContradictions(answers) {
    const contradictions = [];
    if (answers.taskClarity === 'unclear' && ['high', 'irreversible'].includes(answers.risk)) {
      contradictions.push({
        id: 'unclear-high-risk',
        label: '验收标准不清晰，却要处理高风险或不可逆动作',
        questions: ['taskClarity', 'risk'],
      });
    }
    if (answers.evaluation === 'none' && answers.repeatability === 'recurring') {
      contradictions.push({
        id: 'recurring-unmeasured',
        label: '任务会持续发生，但没有稳定反馈或责任人',
        questions: ['repeatability', 'evaluation'],
      });
    }
    if (answers.decomposition === 'independent' && answers.taskClarity === 'unclear') {
      contradictions.push({
        id: 'unproven-decomposition',
        label: '验收标准尚未清晰，却声称子任务可以独立验收',
        questions: ['taskClarity', 'decomposition'],
      });
    }
    return contradictions;
  }

  function findRule(id) {
    return model.decisionRules.find((rule) => rule.id === id);
  }

  function addRule(hitRules, id) {
    const rule = findRule(id);
    if (rule && !hitRules.some((item) => item.id === id)) hitRules.push(rule);
  }

  function findOutcome(id) {
    return model.outcomes.find((outcome) => outcome.id === id) || model.outcomes[0];
  }

  function createExcludedAlternatives(modeId, hitRules) {
    const selectedRule = hitRules.find((rule) => rule.excludeModes.includes(modeId));
    return model.outcomes
      .filter((outcome) => outcome.id !== 'no-agent' && outcome.id !== modeId)
      .map((outcome) => ({
        id: outcome.id,
        label: outcome.label,
        reason: selectedRule?.explanation || '当前任务形态没有证明它是最小可行方案。',
      }));
  }

  function controlsFor(risk, needsReview) {
    const highRisk = ['high', 'irreversible'].includes(risk);
    return {
      preview: highRisk || needsReview,
      hitl: highRisk || needsReview,
      audit: highRisk || needsReview,
      stopConditions: true,
    };
  }

  function baseResult(answers, now) {
    return {
      evaluatedAt: formatDate(now),
      answers,
      status: 'ready',
      outcomeId: 'no-agent',
      modeId: 'human-review',
      requiresAgent: false,
      requiresMultipleIndependentSubtasks: false,
      requiresHumanApproval: true,
      missingQuestions: [],
      contradictions: [],
      hitRules: [],
      excludedAlternatives: [],
      normalPath: [],
      hitl: [],
      failureFallback: [],
      stopConditions: [],
      controls: controlsFor(answers.risk, false),
      metrics: [
        makeMetric('task-acceptance', '任务验收通过率', '结果满足预先定义验收标准的任务占比', '试点标注与责任人复核'),
        makeMetric('human-override', '人工推翻率', '人工复核后改变系统建议或结果的任务占比', '人工复核记录'),
      ],
      recommendation: findOutcome('human-review'),
    };
  }

  function evaluateDecision(input, options) {
    if (!model) throw new Error('Agent Hub decision model is unavailable');
    const answers = normalizeAnswers(input);
    const now = options?.now || '2026-08-30';
    const result = baseResult(answers, now);
    const missingQuestions = model.questions
      .filter((question) => !answers[question.id])
      .map((question) => ({ id: question.id, label: question.prompt }));
    const contradictions = findContradictions(answers);
    result.missingQuestions = missingQuestions;
    result.contradictions = contradictions;

    if (missingQuestions.length || contradictions.length) {
      result.status = 'needs-input';
      addRule(result.hitRules, missingQuestions.length ? 'input-incomplete' : 'risk-contradiction');
      if (contradictions.some((item) => item.id === 'recurring-unmeasured')) addRule(result.hitRules, 'evaluation-missing');
      result.modeId = 'human-review';
      result.outcomeId = 'no-agent';
      result.requiresAgent = false;
      result.requiresHumanApproval = true;
      result.controls = controlsFor(answers.risk, true);
      result.recommendation = findOutcome('human-review');
      result.excludedAlternatives = AGENT_MODE_IDS.map((id) => ({
        id,
        label: findOutcome(id).label,
        reason: '输入不足或存在冲突，自动建议已撤回。',
      }));
      result.normalPath = ['暂停自动建议', '由业务责任人补齐六问', '重新确认验收、责任与可逆性'];
      result.hitl = ['责任人先评审任务定义、数据范围和副作用', '没有明确批准前不执行外部动作'];
      result.failureFallback = ['保留当前输入与冲突记录', '回到人工方案评审或传统流程'];
      result.stopConditions = ['六问仍不完整时停止', '责任、验收或撤销方式未明确时停止'];
      return result;
    }

    const highRisk = ['high', 'irreversible'].includes(answers.risk);
    let modeId = 'human-review';
    if (answers.taskClarity === 'clear' && answers.knowledge === 'rules' && answers.decomposition === 'single' && ['low', 'medium'].includes(answers.risk)) {
      modeId = 'automation';
      addRule(result.hitRules, 'deterministic-automation');
    } else if (answers.decomposition === 'independent') {
      modeId = 'parallel-multi-agent';
      addRule(result.hitRules, 'parallel-independent-only');
    } else if (answers.knowledge === 'retrieval' && ['single', 'dependent'].includes(answers.decomposition)) {
      modeId = 'rag-assistant';
      addRule(result.hitRules, 'retrieval-assistant');
    } else if (answers.knowledge === 'judgment' && ['single', 'dependent'].includes(answers.decomposition)) {
      modeId = 'single-agent-tools';
      addRule(result.hitRules, 'single-agent-bounded');
    }

    if (answers.evaluation === 'none') {
      modeId = 'human-review';
      addRule(result.hitRules, 'evaluation-missing');
    }
    if (answers.repeatability === 'one-off' && answers.evaluation !== 'measurable') {
      modeId = 'human-review';
      addRule(result.hitRules, 'one-off-review');
    }
    if (highRisk) addRule(result.hitRules, 'high-risk-controls');

    if (modeId === 'human-review') {
      result.outcomeId = 'no-agent';
      result.requiresAgent = false;
      result.requiresHumanApproval = true;
      result.recommendation = findOutcome('human-review');
      result.normalPath = ['定义人工验收与责任人', '评审数据、权限和副作用', '先运行人工或规则流程', '形成可评估基线'];
      result.hitl = ['业务责任人批准方案和边界', '任何外部动作在预览后由责任人执行'];
      result.failureFallback = ['保留输入与评审意见', '退回人工处理并记录阻塞原因'];
      result.stopConditions = ['无法定义验收标准时停止', '反馈闭环或责任人缺失时停止'];
    } else {
      result.modeId = modeId;
      result.outcomeId = AGENT_MODE_IDS.includes(modeId) ? modeId : 'no-agent';
      result.requiresAgent = AGENT_MODE_IDS.includes(modeId);
      result.requiresHumanApproval = highRisk;
      result.recommendation = findOutcome(modeId);
      if (modeId === 'automation') {
        result.normalPath = ['接收结构化输入', '执行规则或工作流', '校验输出', '记录运行结果'];
        result.hitl = highRisk ? ['预览动作影响范围', '责任人批准后执行'] : ['异常或权限变化时转人工'];
        result.failureFallback = ['停止当前规则步骤', '保留输入输出并转人工排查'];
        result.stopConditions = ['规则命中冲突或输入缺失时停止', '外部副作用未获批准时停止'];
      } else if (modeId === 'rag-assistant') {
        result.normalPath = ['检索受控资料', '展示来源与版本', '生成带边界的回答', '低置信度转人工'];
        result.hitl = highRisk ? ['展示引用、影响范围与待执行动作', '责任人批准后才允许外部写入'] : ['政策冲突或用户升级时转人工'];
        result.failureFallback = ['引用缺失时不回答或给出缺口', '知识库不可用时转人工或静态 FAQ'];
        result.stopConditions = ['无有效引用时停止生成结论', '权限、版本或身份无法确认时停止'];
      } else if (modeId === 'parallel-multi-agent') {
        result.normalPath = ['拆分多个独立子任务', '并行执行并记录 branch id', '聚合并检查缺失/冲突', '人工确认后输出'];
        result.hitl = ['聚合结果展示各分支证据', '责任人确认缺失与冲突后发布'];
        result.failureFallback = ['隔离失败分支并只重试幂等分支', '关键分支缺失时降级串行或转人工'];
        result.stopConditions = ['任一关键分支无法验收时停止聚合', '预算、超时或证据冲突触顶时停止'];
        result.requiresMultipleIndependentSubtasks = true;
      } else {
        result.normalPath = ['定义单一目标与工具契约', '执行有限工具调用', '校验结果并生成预览', '按权限执行并审计'];
        result.hitl = ['外部写入前展示参数与影响范围', '责任人批准或拒绝后继续'];
        result.failureFallback = ['停在当前工具步骤并保留错误', '恢复失败时转人工处理'];
        result.stopConditions = ['schema、权限或输入校验失败时停止', '恢复/重试预算用尽时停止'];
      }
    }

    result.controls = controlsFor(answers.risk, modeId === 'human-review');
    result.excludedAlternatives = createExcludedAlternatives(modeId, result.hitRules);
    return result;
  }

  return {
    evaluateDecision,
    getFrameworkFreshness,
    normalizeAnswers,
    QUESTION_IDS,
  };
}));
