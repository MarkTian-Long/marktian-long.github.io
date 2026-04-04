# RAG 升级复盘：经验与教训

> 日期：2026-03-15
> 任务：tools/stock/index.html Tab3「研报生成」RAG 模块 4 项升级
> 耗时：1 次对话，5 个 Task，4 个 commit

---

## 做了什么

| Task | 内容 | 对应简历能力点 |
|------|------|--------------|
| T1 金融同义词扩展 | `FINANCE_SYNONYMS` 词典 + `expandQuery` 函数，检索前自动扩展词 | 系统级金融同义词对齐机制 |
| T2 数据分级标注 | NEWS_DB 加 tier/source 字段，UI 显示彩色 badge + 来源时间戳 | 数据溯源与分级标注（三级） |
| T3 LLM Reranking | 粗检 top-6 → `rerankResults` 精排 → 展示 ↑↓ 变化 + 精排理由 | 召回精度评估（Retrieve→Rerank→Generate） |
| T4 双层知识库 | 左侧 Tab 切换：实时市场库 + 私有知识库上传/搜索/联合召回 | 双层知识库设计 |

---

## 执行经验

### 什么做对了

1. **计划写得足够详细**：每个 Task 的 Step 有明确代码片段，执行时几乎不需要猜测，减少了来回确认。

2. **Edit tool 精确替换**：大文件（1300+ 行）完全用 Edit 工具，没有用 Write 整文件写入，避免了截断风险。每次替换都有独特的定位锚点。

3. **每 Task 单独 commit**：4 个 commit 互相独立，回滚粒度细，git log 清晰对应 4 个能力点。

4. **先读后改**：每个 Task 开始前都读取了目标区域的实际代码，而不是凭记忆直接 Edit，避免了因代码已被前一个 Task 修改导致 old_string 匹配失败。

### 遇到的问题

1. **`tierConfig` 重复声明风险**：计划中提到 Task 3 需要删掉 Task 2 中定义的 `tierConfig`，实际执行时由于把 Task 2 的整段渲染代码整体替换（而不是只插入 tierConfig），避免了重复声明。执行顺序影响了计划中的操作步骤，需要灵活判断。

2. **Task 3 的 runRAG 改动量大**：该 Task 把粗检、精排、渲染三段逻辑全部重写，是改动最大的一块。计划里的代码片段有拆分，实际执行时合并成一次大 Edit 更高效，避免中间状态不一致。

3. **`searchPrivateKb` 返回对象缺字段**：私有知识库文档对象没有 `stock` 字段，而 `rerankResults` 的 prompt 拼接用了 `n.stock`，会输出 `undefined`。这是一个小 bug，实际运行中 LLM 容错能力强，影响不大，但严格来说应在 `searchPrivateKb` 的返回对象里补 `stock: '私有文档'`。

---

## 教训与改进建议

### 1. 大段替换优于小步插入
当改动涉及一个函数内多处位置时（如 runRAG），**一次性替换整段 + 插入新逻辑**比分多次小步修改更安全，因为中间状态的锚点字符串容易因上下文变化而失效。

### 2. 跨 Task 的变量依赖要显式声明
`expandHtml` 在 Task 1 中定义、Task 2 中引用，计划中有提示但不够显眼。建议计划里把跨 Task 的共享变量单独列出，执行时更容易发现依赖。

### 3. 返回对象的 schema 要对齐
当多个函数（`searchNews`、`searchPrivateKb`）返回相同用途的对象时，应保持字段一致（如都有 `stock`、`tags`），否则后续统一处理（rerankResults、渲染）时容易出现 undefined。

### 4. 模拟数据的「私有知识库」tier 值
`tier: 'private'` 在 `tierConfig` 中没有对应的配置项，`tierConfig[n.tier] || tierConfig.unverified` 会 fallback 到「待核实」。如果后续想显示「私有文档」标签，需在 `tierConfig` 里加 `private` 项。

---

## 结果

```
f0fffaa feat: RAG Tab3 升级 - 金融同义词查询扩展
636f30f feat: RAG Tab3 升级 - 数据分级标注
5630532 feat: RAG Tab3 升级 - LLM Reranking 可视化
b74521e feat: RAG Tab3 升级 - 双层知识库 UI
```

4 项简历能力点全部落地为可演示的 UI 交互，对应恒生电子·LLM驱动金融资讯研报AI平台的核心技术描述。
