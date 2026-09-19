# Writing Guide — 博客规范文件

本文件定义「思考碎片」博客的元数据、结构、命名和更新规范，所有文章必须遵守。

---

## 文章元数据规范

最终 Markdown 是新文章内容语义的唯一来源；发布端只做严格校验、同步、生成和测试。文章最顶部必须使用受限 frontmatter：

```
---
category: 商业
tags: ["市场格局"]
topics: ["企业AI"]
concepts: ["软件采购经济性", "Build vs Buy", "软件价值捕获", "软件价值链"]
share_quote: "这里必须是最终正文中真实存在的一句完整原句。"
relations: [{"slug":"llm-saas-moat-disruption","type":"builds_on"}]
---

# 文章标题

> 正式 summary。

---

正文……

> **summary 与正文导语：** 最终 Markdown 标题下、正文分隔线之前的唯一连续 blockquote 就是正式 `summary`。发布阶段只做结构解析、去掉每行 `>` 并规范空白，然后原样同步到 `posts-meta.json`；不得重新创作、改写、扩写或缩写。真正的正文导语是 `---` 之后的正文开头，它可以与 `summary` 不同。

> **摘要 vs 分享引语：** `summary` 回答“这篇文章讲什么”；`share_quote` 回答“这篇文章最值得单独带走的一句话是什么”。两者均由写作阶段定稿：`summary` 是 H1 下唯一 blockquote，`share_quote` 是 frontmatter 中且在最终正文真实出现的完整原句。Codex 不重新创作、选择或替换它们。
>
> **share_quote 选择规则：** `share_quote` 必须是最终正文中真实存在、可独立阅读的完整句子，不得为 metadata 另造一句。
> 写作/审校阶段选择并固定该原句；若没有合适原句，应先修改最终 Markdown，而不是让发布端另造文案。
>
> `share_quote` 只服务分享海报，不服务 SEO / RSS / continue-reading，也不替代 `summary`；不用标题、摘要或夸张口号替代。

> **标题质量规则：** 标题应先说清对象与核心判断，再追求修辞；发布前在列表页的桌面和移动宽度检查，不应因 CSS 裁切而丢失关键语义。标题可以超过 20 字，但若删去修饰语后不损失判断，应优先精简；不要为了凑字数批量改写已发布文章。

> **摘要质量规则：** 标题下 blockquote 应是可自然阅读的文章摘要，不是关键词列表或 SEO 文案，尽量交代文章讨论的对象或问题、核心判断/冲突，以及决定性机制、关系或边界。`posts-meta.json` 是网站运行索引/派生 metadata，不能替代最终 Markdown 的内容语义判断。
```

### `posts-meta.json` v4 视觉契约

`tools/blog/data/posts-meta.json` 必须使用根级 `version: 4`。根级 `image_contract.legacy_without_visuals` 仅保留历史兼容记录；新文章可以省略 `visuals`，纯文字文章会使用全站默认分享图。只有选择使用图片时才声明 `visuals`：

```json
{
  "version": 4,
  "image_contract": {
    "version": 1,
    "legacy_without_visuals": ["older-slug"]
  },
  "posts": [{
    "slug": "your-slug",
    "visuals": {
      "cover": {
        "src": "assets/images/blog/your-slug/cover.jpg",
        "alt": "与核心论点有关的主体和关系描述",
        "width": 1200,
        "height": 630
      },
      "inline": []
    }
  }]
}
```

- 封面和正文图都完全可选；正文图只在能解释文字难以快速说清的关系、顺序、边界、分层或反馈回路时使用，数量为 0–2 张。
- 无图文章和已在 `legacy_without_visuals` 中的历史文章都使用全站图片回退；不必补图或改正文。
- 主页与 Blog 列表继续保持纯文字，`visuals` 只服务文章页、OG/Twitter 分享预览、JSON-LD 和 public dist 白名单。
- 尺寸、大小、alt/caption、生成提示词与 0–2 张决策门详见 [VISUAL_GUIDE.md](VISUAL_GUIDE.md)。

### 双维度标签体系

每篇文章打两个维度的标签，各司其职：

| 维度 | 字段 | 用途 | 前台展示 | 每篇数量 |
|------|------|------|----------|----------|
| 视角类型 | `tags` | 描述文章的核心动作，「这篇在做什么」 | 是 | 1-2 个 |
| 话题领域 | `topics` | 描述文章讨论的具体领域，「在讨论什么」 | 是 | 1-2 个 |

两个字段同时显示在列表页标签徽章上，也显示在文章页 header。`tags` 帮读者判断文章的思维方式，`topics` 帮读者按领域找文章。两者描述不同维度，不应出现相同的词。

正式可用值、完整定义、区分说明和 deprecated 状态只维护在 [`data/blog-taxonomy.json`](data/blog-taxonomy.json)。本指南不复制完整词典；发布脚本和校验器都读取该文件。

### `concepts`：AI 历史检索概念

`concepts` 写在最终 Markdown frontmatter，并由同步流程写入 `posts-meta.json`；不在前台显示，也不参与 SEO、RSS、继续阅读或静态文章关系。它的职责是补足标题和摘要没有完整覆盖、但将来值得被语义召回的关键对象、机制、产品/公司、技术或层级。

- 每篇 4-7 个，均为去重、命名稳定的短语；优先选择作者以后会自然搜索的表达。
- 不写 `AI`、`产品`、`技术`、`行业` 等几乎没有区分度的泛词；不要因正文偶然提到品牌或术语就升级为 concept。
- 不与本篇 `tags` 或 `topics` 使用完全相同的词。`tags` 是文章在做什么，`topics` 是核心讨论领域，`category` 是大类；`concepts` 是用于召回具体论点的语义锚点。
- 同一概念尽量全站同名；只有确有语义差异时才使用不同表达。

### 历史博客滚动检索与复用

历史检索是新文章**探讨过程中的动态能力**，不是开题时只运行一次的固定步骤。新文章的核心判断、机制、案例角色、覆盖边界和大纲会在讨论中变化；首次召回不是最终候选集。只有讨论对象发生实质变化时才重搜，不要求每轮对话机械扫描。

历史检索首先服务于查重/碰撞检查、必要前提复用、观点变化发现和独立内容增量判断；它不是选题生成器。检索到旧文不能单独成为扩大题目、新增一级章节、重引旧框架、修改主线或为了站内连续性制造关系的理由。最终仅同主题或实际不相关时，可以不引用、不建立显式关系，也不调整当前文章。

第一次读取历史文章前，先保留简短的独立起点：原始问题、初步判断或待验证假设、写作/研究动因、当前边界，以及不知道历史文章时原本准备研究的方向。这不是新的确认环节；它只用于后续检查新文章是否被旧文反向带偏。

1. **先完整读元数据，形成候选池。** 每次检索都读取完整 `posts-meta.json`，综合 `title`、`summary`、`concepts`、`topics`、`tags`、`category` 形成候选池；`date` 用于判断观点先后，`slug/url` 用于定位正文。按当前问题区分：高相关（现在应读正文，可能影响判断）、潜在相关（先保留，随讨论再决定）与弱相关（仅关键词、大类、公司或模型名称重合，可丢弃）。不设“最多 5 篇”等固定上限；正文深读按实际相关度控制，不为召回完整而打开大量弱相关正文。
2. **事件触发地调整候选。** 当核心论点明显改变、出现新的核心机制或概念、覆盖边界或案例角色变化、新增重要章节，或作者/AI 怀疑过去讨论过当前判断时，重新读元数据或调整检索条件。正式大纲确认前，基于相对稳定的主论点、章节问题、关键机制和案例做一次最终历史覆盖扫描：检查应承接的旧文、可能重复的完整论证、本文相对旧文的新增判断，以及与旧文的冲突或修正。
3. **再读发布事实，判断实质关联。** 元数据命中只意味着“值得打开”，不构成引用理由。判断作者过去最终公开发表了什么、旧文能否被引用或新旧观点是否冲突时，正文优先级是：当前线上正式发布页面 → 仓库 `tools/blog/posts/<slug>.html` → `docs/blog/<slug>.md`。线上页尚未刷新或不可访问时，以仓库 HTML 为发布事实的可复现副本；它通常应与线上页一致，但历史上可能比 Markdown 更接近最终发表稿。
4. **严格决定引用与复用。** 只有存在相同/直接承接的核心问题、相同或高度相关的因果机制、新判断延伸旧判断、新证据修正或挑战旧判断、可直接复用的框架或概念解释、可参与当前论证的案例/证据，或读者理解所需的观点连续性时才引用。同属 AI/Agent/产品等大类、同一公司/模型/品牌、单纯关键词重合，或只是为了增加内链/继续阅读数量，都不足以引用。
5. **以内容增量为目标。** 对已解释清楚的框架、概念、案例和判断，采用“最小必要前提 + 历史文章行内链接 + 本文新增判断”，而不是重写一遍。若当前判断不同，明确它是条件或边界不同、新证据造成修正，还是旧判断需要更新；不要为了表面一致性隐藏变化。
6. **只在核心遗漏时反馈 metadata。** 若一篇高度相关旧文没有进入合理的 metadata 候选池，检查其 `summary` 或 `concepts` 是否遗漏了该文真正的核心主题/机制；仅在确有遗漏时修正。一次特殊语境下的偶然关联不扩词。不为此新建平行索引、静态文章关系、知识图谱、embedding 或向量数据库。
7. **全文搜索只作定向兜底。** 当新概念或机制已很明确而 metadata 未召回预期文章时，可对历史发布正文做定向全文搜索，再回到正文精读确认。当前仓库没有可复用的博客全文检索资产；本规则不要求建设服务或索引。只有文章规模已证明现有方式不可用时，才先说明新基础设施的收益、复杂度和维护成本并另行决策。

> **高相关旧文的独立性检查：** 只有在大纲确认前发现一篇或以上真正高相关旧文时，才检查新旧核心问题是否不同、本文增加了什么，以及是否至少在机制、粒度、因果、边界、决策落地或证据强度之一明显深入；同时判断它属于必须承接、有价值但非必要、仅同主题还是不相关。暂时移除旧文名称和链接后，本文核心问题仍应独立成立。没有高相关旧文时，不为完成流程继续寻找关系。

> **显式关系是评审结果：** `builds_on`、`revises`、`companion` 只在独立性和增量判断完成后写入；不得为了获得「承接前文」「后续延展」「修正前文」或「并列阅读」而反向调整文章主线。

> **标签渲染：** 文章页的标签由 JS 从 `posts-meta.json` 动态渲染（`#post-tags` 容器），HTML 文件里不写静态 `<span class="tag">`。新文章先维护最终 Markdown，再由同步命令更新该运行索引；不需要手工修改文章 HTML。

> **发布操作规范：** 每次新增文章时，若现有标签库在 `tags` 或 `topics` 维度无法准确描述文章性质，**不要强行套用近义标签**，应先提出修改方案（新增标签或调整定义）并等待用户确认后再写入。
>
> **taxonomy 变更（发布阻断）：** 新增、定义调整、适用范围扩大/缩小、rename、merge 或 deprecate 时，先提出变更并获得用户确认；然后在同一次变更中更新 `blog-taxonomy.json`、执行历史 impact audit、再让当前文章使用新值。不得先使用未定义值；不因 taxonomy 变化自动批量重分类历史文章。
>
> **taxonomy 变更时的回溯规范：** 每篇发布始终先运行 `node tools/blog/check-blog-taxonomy.js`。只有本次发布/维护实际修改 `tools/blog/data/blog-taxonomy.json` 时，才以真实的变更前 Git ref 运行 `node tools/blog/audit-taxonomy-impact.js --base-ref <真实的 taxonomy 变更前 git ref>`；普通文章发布不要求 taxonomy base ref，也不得执行带 placeholder 的 audit 命令。触发变更时，需完成以下两项检查，不得分批遗漏：
> 1. **taxonomy 一致性检查**：确认新标签与现有 taxonomy 中各标签的定义边界无语义重叠或歧义；
> 2. **历史语义影响审查**：category 的 `core_question`、`definition`、`status`，tag/topic 的 `definition`、`distinguish_from`、`notes`、`status`，以及范围、rename、merge、deprecate、remove 和新增 category/tag/topic 都是语义变化。它们全部让完整 `posts-meta.json` 进入第一轮 metadata 筛查，不能只按新 vocabulary 名字字面命中；新增词尤其不能假定历史文章会预先带有它。`--categories` 仅用于标出优先读的范围。已落地定义的专项复核若要覆盖跨产品/行业等边界，必须显式运行 `--focus category:<名称> --full-screen`；只有 `--focus` 不代表已完成全量筛查。Codex 再按 title / summary / concepts / tags / topics / category 缩小真正相关候选，并对这些候选按“线上正式页 → 仓库发布 HTML → Markdown”读取正文，逐篇输出“保持现状 / 建议人工复核 / 有充分理由建议迁移”。脚本不自动修改历史 metadata，不为数量均衡迁移，也不能把 taxonomy 定义变化本身当作批量重分类理由；没有历史语义影响时输出“历史 audit 完成，无需迁移。”

**`tags` 标签库（视角类型）**

标签描述文章的**核心动作**，而非内容领域。标签库随内容主题扩展，**新增前先确认无近义标签**。

> **打标规范：** 新文章打标前，先看同标签下已有文章列表，确认放进去语义一致再写入。孤立判断容易漂移——「这篇感觉是竞争相关」不够，要问「这篇和 Manus 分析、Claude Design 分析放在一起，读者会觉得是同类文章吗」。
>
> **强制检查：** 写入 `tags` 前必须逐项对照 `blog-taxonomy.json`，确认标签名称完全一致；`tags` 和 `topics` 不得出现相同的词。不在 taxonomy 中的词禁止直接写入，必须先提出新增方案并等待确认。

**`topics` 标签库（话题领域）**

按文章的核心技术或场景选择；只有一个核心领域时只打一个，**不为凑数量补第二个**。若有两个领域都支撑文章核心论点，才同时打两个。

判断某个 `topic` 是否属于核心领域时，依次核对：

1. 标题、摘要和结论是否都在回答该领域的问题；
2. 去掉该领域后，文章的核心论点是否会失去成立基础；
3. 它是否只是案例、实现路径、引用来源或与其他系统并列的应用场景。若是，则不打该标签。

标签必须通过前两项，且不属于第三项的排除情形。技术在文中多次出现，并不自动使它成为 `topic`。

### 文章分类

| 分类 | 核心问题 |
|------|----------|
| 技术 | 能力为什么成立 |
| 产品 | 产品应该怎么做 |
| 商业 | 企业如何创造并捕获价值 |
| 行业 | 整个领域正在怎么变 |

正式名称、完整定义和 legacy 分类以 [`data/blog-taxonomy.json`](data/blog-taxonomy.json) 为准；`生活`只为历史兼容保留，不能写入新 Markdown。

> **分类判断原则：看核心内容，不看叙事视角。** 「行业」不是「提到多家公司」的同义词：具体产品判断仍归「产品」；以竞争叙事讲技术机制或工程演进仍归「技术」；以收入、成本、采购、估值或护城河为核心仍归「商业」。**叙事角度 ≠ 分类依据。**

> **给 Agent 的操作规范：** 若新文章的内容方向无法清晰归入现有正式分类，**不要默认选最近似的**，应说明理由并提出是否需要新增分类，等待用户确认。

---

## 文章结构规范

```
一、核心判断（总）
   1 段，200 字以内
   读者只读这段也能理解核心观点

二、展开论证（分）
   2-4 段，每段聚焦一个支撑维度
   可用小标题区分，避免每段都是叙述型，要有判断

三、实践启示（总，按需）
   有可带走的判断框架时，用 callout 块收尾，不加 <h2> 小标题
   正文收尾本身已经完整有力时，不加 callout——强行加反而稀释结尾
   内容：1-2 句实践意义，必须是正文没有凝练成一句话的东西
```

**callout 的判断标准（加还是不加）：**

加 callout 的前提——满足以下任一条：
- 有一个判断框架/公式可以凝练成一句可带走的工具（如 `prompt-engineering`、`agent-three-problems`）
- 有一句话是"所以对你的含义是什么"，正文论证完了但没有点破受众侧的结论
- 文章受众明确，可以点名说给某类人听

不加 callout 的情况：
- 正文末尾已经做了完整有力的总结性收尾，callout 没有增量
- 没有可以凝练的判断框架，只能重复正文已说过的内容

**callout 内容类型（只允许以下三类）：**

| 类型 | 说明 | 示例 |
|------|------|------|
| 判断框架/公式 | 给读者一个带走的工具，一句话能独立使用 | "去掉这个 Prompt，用更强的模型能达到相同效果吗？" |
| 核心论点蒸馏 | 全文最重要的一句判断，适合不看全文的人 | "跑稳的工作流比概念更先进但跑不稳的智能体有用得多" |
| 受众定向建议 | 点名说给某类人听，正文是给所有人的 | "先判断阶段，再谈技术" |

**数据来源声明不属于 callout**，写入 `refs` 区域的前置说明段，或在正文中直接注明。

**callout 收尾示例：**

```html
<!-- 判断框架类 -->
<div class="callout">
    <strong>评估标准：</strong>去掉这个 Prompt，用更强的模型能达到相同效果吗？能——补救型，会消亡；不能——定义型，会留下。
</div>

<!-- 受众定向类 -->
<div class="callout">
    <strong>对构建者的启示：</strong>评估一个 AI 产品的工程能力，不能只看模型选型和 Prompt 策略，要看它的 Harness 设计……
</div>
```

**注意：**
- callout 如果存在，必须是文章 `post-body` 内的**最后一个元素**（双栏长文见「双栏布局规范 → callout 位置规则」，该规则优先）
- 不要在 callout 后面再加 `<h2>` 正文节
- callout 使用 `accent-soft` 背景（`.callout` 类已在各文章 `<style>` 中定义）
- **标题禁止照抄"对 AI PM 的启示"**——每篇结合自己的受众和角度独立起名

**callout 标题命名参考：**

| 文章角度 | 推荐标题形式 | 示例 |
|---------|------------|------|
| AI 技术分析 | 对构建者的启示 | `<strong>对构建者的启示：</strong>` |
| 产品决策框架 | 产品判断框架 | `<strong>产品判断框架：</strong>` |
| 市场/商业分析 | 判断这件事 | `<strong>判断这件事：</strong>` |
| 行业竞争格局 | 竞争视角 | `<strong>竞争视角：</strong>` |
| 通用方法论 | 构建者视角 | `<strong>构建者视角：</strong>` |
| 带具体受众 | 对 [具体角色] 的启示 | `<strong>对独立开发者的启示：</strong>` |

---

## 目录（TOC）规范

所有有目录的文章统一使用**左侧 sticky 卡片**（双栏布局）。h2 ≤ 2 个的极短文可不加目录。

| 情况 | 处理方式 |
|------|---------|
| h2 ≤ 2 个 | 可选不加目录，保持单栏 |
| h2 ≥ 3 个 | 统一使用左侧 toc-card 双栏布局（见下方"双栏布局规范"） |

> **历史说明：** 早期存在"模式 B"内联目录（`.toc-inline`），已于 2026-04 全量迁移为左侧 toc-card，禁止新文章使用内联模式。

### 目录层级、文字与编号

目录是读者的**论证地图**，不是把全部标题平铺出来。一级目录始终由核心 `h2` 组成；只有读者会按需直接跳转的并列模块，才作为 `h3` 二级项收录。

| 正文内容 | 目录处理 |
|------|---------|
| 核心论点 `h2` | 始终作为一级目录 |
| 某个 `h2` 下 2–4 个可独立阅读的关键 `h3` | 收录为默认折叠的二级目录，由箭头展开 |
| 顺序性解释、协作要点、表格小结等 `h3` | 不收录，避免目录变成标题清单 |
| 参考资料、附录、声明下的 `h3` | 默认不收录，只保留一级「参考资料」或「附录」 |

**目录文字规则：**

- 正文标题在 14 字以内时，目录直接复用；较长时可压缩为核心关键词（建议 ≤ 12 字），但必须保留同一核心概念与判断方向。
- 正文使用一级编号（如「一、」「二、」）时，目录必须保留相同编号；不要一边编号、一边省略。参考资料、结语、附录可不编号。
- `h3` 不因出现在目录就强制加编号；仅技术手册等需要精确引用或表达步骤顺序的文章，保留正文已有的 `1.1 / 1.2` 编号。
- 一篇文章的侧栏同时可见的一级项以 8–12 条为宜；二级项默认收起。超长技术手册优先收起二级项，而不是减少正文结构。

---

## 双栏布局规范

适用于 h2 ≥ 3 个的文章（含目录的标准布局）。

### 布局结构

```
div.page-outer（max-width: 1008px; padding: 40px 20px 80px）
├── div.top-bar（返回链接 + 主题切换按钮；`position: sticky; top: 16px`，带页面背景和 `z-index: 10`）
└── div.two-col（display: grid; grid-template-columns: 220px minmax(0, 1fr); gap: 48px）
    ├── aside.toc-wrap（position: sticky; top: 72px，为顶部返回入口留出间距）
    │   └── nav.toc-card（目录卡片，--bg-subtle 底色，1px border，圆角 8px）
    │       ├── span.toc-card-label（"本文目录" 小标题）
    │       └── ul.toc-list
    │           ├── li > a（一级目录，标题本身可跳转）
    │           └── li.toc-group（含关键 h3 的一级项）
    │               ├── div.toc-group-row > button.toc-toggle + a（左侧箭头控制展开）
    │               └── ul.toc-sublist[hidden] > li > a（默认收起的二级项）
    └── main（文章内容区）
        ├── header.post-header
        ├── hr.divider
        └── div.post-body
```

> **容器职责：** 页面横向留白只由最外层 .page-outer 负责；body 不设置页面 padding，.two-col 不得再带 .page-outer 或内联 width/padding。这样移动端不会叠加左右留白，正文列也能保持与其他文章一致。

### 目录高亮（JS 模板）

```js
// 激活当前节；若当前 h3 已纳入目录，则展开它的父级
(function(){
    var sections = document.querySelectorAll('.post-body h2[id], .post-body h3[id]');
    var links = document.querySelectorAll('.toc-list a');
    if (!sections.length || !links.length) return;

    function setGroupExpanded(group, expanded) {
        var toggle = group.querySelector('.toc-toggle');
        var sublist = group.querySelector('.toc-sublist');
        if (!toggle || !sublist) return;
        toggle.setAttribute('aria-expanded', String(expanded));
        sublist.hidden = !expanded;
    }

    document.querySelectorAll('.toc-toggle').forEach(function(toggle){
        toggle.addEventListener('click', function(){
            var group = toggle.closest('.toc-group');
            setGroupExpanded(group, toggle.getAttribute('aria-expanded') !== 'true');
        });
    });

    var observer = new IntersectionObserver(function(entries){
        entries.forEach(function(entry){
            if (entry.isIntersecting) {
                var id = entry.target.id;
                links.forEach(function(a){
                    a.classList.toggle('toc-active', a.getAttribute('href') === '#' + id);
                });
                var active = document.querySelector('.toc-list a[href="#' + id + '"]');
                var group = active && active.closest('.toc-group');
                if (group) setGroupExpanded(group, true);
            }
        });
    }, { rootMargin: '-20% 0px -70% 0px' });
    sections.forEach(function(s){ observer.observe(s); });
})();
```

- 一级目录 hover / active 用 `var(--clay)` 高亮 + 左侧竖线 + `background: var(--clay-soft)` + `border-radius: 4px`；二级项缩进、字号更小，active/hover 不使用整块背景。
- `h2` 与被收录的 `h3` 均需加 `id` 和 `scroll-margin-top: 60px`；`h3` 是否收录由阅读价值决定，而不是由标签层级自动决定。
- 箭头必须使用 `<button class="toc-toggle">`，配 `aria-expanded` 与 `aria-controls`；放在一级标题链接左侧，作为固定宽度的树形层级栏。没有子项的一级链接也要预留等宽空位，使全部标题文字左边缘对齐；标题链接和箭头是两个独立交互，点击标题不应触发展开。

### 响应式规则

```css
@media (max-width: 800px) {
    .page-outer { padding: 28px 18px 64px; }
    .top-bar { top: 8px; }
    .two-col { grid-template-columns: 1fr; }
    .toc-wrap { display: none; }  /* < 800px 隐藏左侧目录 */
}
```

### callout 位置规则（长文适用）

长文（双栏布局）中，callout 通常用于最后一节的结尾，但**不强制**作为 `post-body` 的最后一个元素——节内使用也可以。短文（单栏）保留原规范：callout 必须是 `post-body` 的最后元素。

---

## 文件命名规范

- 文件名：`{topic-keyword}.html`，英文 kebab-case
- 不用日期前缀（归档靠 `index.html` 的 JS 数据管理）
- 示例：`tech-obsolescence.html`、`harness-engineering.html`

---

## Markdown 源稿与发布 HTML 规范

博客有两层文件：

| 层级 | 路径 | 角色 |
|------|------|------|
| 源稿 | `docs/blog/*.md` | 新文章写作、编辑和 Markdown → HTML 生成的正文维护源 |
| 发布物 | `tools/blog/posts/*.html` | GitHub Pages 实际访问的文章页面；历史观点检索时的仓库发布事实源 |

### 单一来源原则

- 新文章必须同时提交 Markdown 源稿和生成后的 HTML；不要只提交 `tools/blog/posts/*.html`。
- 新源稿优先命名为 `docs/blog/<slug>.md`，其中 `<slug>` 与 `posts-meta.json` 的 `slug` 完全一致。历史文件存在 `-v3`、`-final`、下划线等旧命名，保留但不作为新文章模板。
- 新文章的内容语义真源是 `docs/blog/<slug>.md` 的 frontmatter、H1 和 summary blockquote；`tools/blog/data/posts-meta.json` 是由 `sync-post-metadata.js` 产生并被前台消费的运行索引。HTML 是部署产物。历史观点检索仍遵循“线上正式页 → 仓库 HTML → Markdown”，不需要为此批量补写 Markdown。
- 如果发布后必须手工改 HTML 的正文、目录、表格、callout 或参考资料，必须把同等内容回写到对应 Markdown，或在提交说明中明确这是 HTML-only 例外。不要让 HTML 成为唯一保存正文改动的地方。

### 历史文章例外

- 早期文章不保证都有 Markdown 源稿；部分 HTML 已经在发布后做过正文或结构编辑，可能和现有 Markdown 候选不一致。
- 禁止对历史文章批量运行 `generate-post.js` 并覆盖 HTML。每次只处理一篇，先比较当前线上 HTML 与重新生成结果的可见正文，再决定是否回写 Markdown 或更新 HTML。
- 对没有源稿的历史文章，优先从当前 HTML 反向整理 Markdown，再人工复核正文、标题层级、表格和参考资料链接。

### Markdown 正文图片语法

有独立文章级解释价值时，封面不写进 Markdown，生成器会从 `visuals.cover` 将它放在文章 header 与正文分隔线之间。无图文章直接从 header 进入正文。正文图必须在 Markdown 中独立成行：

```markdown
![与论点相关的对象和关系](../../assets/images/blog/your-slug/context-feedback-loop.webp "这个回路会把本次任务的结果变成下次任务可复用的上下文。")
```

Markdown 中的路径、alt 和 caption 必须与 `visuals.inline` 完全一致。不接受远程图片、未登记图片、跨文章资产或嵌在段落中的图片语法。

---

## 参考资料结构与呈现

- 文章末尾的参考资料使用一个精确标题 `## 参考资料`，可按来源性质添加 `###` 分组，来源使用 `ul` 或 `ol`；需要交代二手引用、样本量或适用边界时，紧随其后写一段以「来源可信度说明：」开头的说明。
- 来源超过 12 条时应按读者能理解的来源性质或论证部分分组；不要为凑分组把每一条来源单独设为标题。
- 参考资料完整保留，但默认由共享运行时收起为“参考资料 · 展开 N 条来源”；不截断、不删除。读者点击或用键盘展开，目录/URL 锚点跳到该标题时自动展开；它是辅助信息而不是正文段落，目录中不展开其 `h3`。
- 新文章不复制 `.refs` CSS。所有文章由 `article-runtime.js` 在加载时统一应用 13px 标题和 12px 来源/说明的紧凑辅助信息层；只写语义 HTML 和现有主题 token，不为单篇覆盖色彩、字号或行距。
- 历史页面保留既有 `.refs` 容器也完全有效；运行时仅添加临时呈现 class，不回写参考资料文本、来源链接或其他正文。

---

## 新增文章操作流程

新文章固定路径为：**网页版写作 → 最终 Markdown frontmatter → Codex 读取当前 taxonomy 并校验 → sync posts-meta → generate HTML → search/RSS/sitemap → QA → 发布**。`publish_handoff` 和 `body_link_only` 不属于这条路径，只保留给历史文件兼容。

材料检查或活人感审校真正执行时，读取 `.agents/skills/blog-human-writing/SKILL.md` 和当前阶段对应的 `references/`；这是唯一长期规则真源。已安装 Skill 或 `.claude/skills/` 目录只是运行入口/兼容副本，冲突时以 `.agents` 为准。每篇正式文章完成后的统一规范沉淀复盘，评估是否出现应写回该权威源的跨文章稳定规则。

1. 写作阶段交付带严格 frontmatter 的最终 Markdown；Codex 读取最新 `data/blog-taxonomy.json` 后仅校验，不选择或生成 `category`、`tags`、`topics`、`concepts`、`share_quote` 或 relations。运行同步命令；它从文件名派生 slug、从 H1/blockquote 派生 title/summary，并为新文章写入实际发布月份（已有文章保留原 date）：
   ```powershell
   node tools/blog/sync-post-metadata.js --write docs/blog/your-slug.md
   ```
   不手工创建或补写语义 metadata；需要明确回填新文章月份时使用 `--date YYYY.MM`。同步不会删除或覆盖已有 `visuals` 等发布资产字段。
2. 图片完全可选。需要使用封面或正文图时，按 [VISUAL_GUIDE.md](VISUAL_GUIDE.md) 维护 `visuals`；选中的候选图先放在 `build/blog-image-work/<slug>/`，再用确定性脚本生成最终资产：
   ```powershell
   node scripts/prepare-blog-image.js --slug your-slug --role cover --input build/blog-image-work/your-slug/candidate.png
   node scripts/prepare-blog-image.js --slug your-slug --role inline --name context-feedback-loop --input build/blog-image-work/your-slug/inline-candidate.png
   node scripts/check-blog-images.js
   ```
   只运行实际需要的命令；正文图写入 `visuals.inline` 和 Markdown，只有封面时使用 `inline: []`。图片可包含服务文章表达的文字或标识，但不得使用误导性水印或未经授权的第三方素材。
3. 用生成脚本输出文章 HTML；生成器验证运行索引与最终 Markdown 一致，因此顺序不能颠倒：
   ```powershell
   node tools/blog/generate-post.js --write docs/blog/your-slug.md tools/blog/posts/your-slug.html
   ```
4. 重新生成搜索发现资产，并运行静态检查：
   ```powershell
   node scripts/generate-search-assets.js --write
   node scripts/check-search-foundation.js
   ```
5. 主页、列表页、canonical、description、JSON-LD、OG/Twitter 元数据、RSS 和 sitemap 都从 JSON/脚本生成，**不要在生成的 head 或搜索资产中手工复制域名，也不要维护重复文章数组**。主页与 Blog 列表不渲染封面或缩略图。
6. 在 `scripts/` 目录运行 `npm run build:public` 和 `npm run check:public-dist`；如使用图片，确认只有 `visuals` 声明的图片进入 Pages 产物，并按 `CONVENTIONS.md` 完成图片加载失败状态的视觉检查。
7. `git add docs/blog/xxx.md tools/blog/posts/xxx.html tools/blog/data/posts-meta.json assets/images/blog/xxx/ robots.txt sitemap.xml feed.xml`
   （新文件必须显式 add，否则 GitHub Pages 404）

### Markdown 转 HTML 发布 QA

从 `docs/blog/*.md` 转成 `tools/blog/posts/*.html` 时，发布前必须做以下检查：

- 检查 `tags` 与 `topics`：逐一按「双维度标签体系」中的主次判定核对标题、摘要和结论；不因技术名词频繁出现、作为案例或应用路径而打标签。
- 检查 `concepts`：逐一核对其是否是支撑文章核心论点的具体对象或机制；保持 4-7 个，避免泛词、偶然提及和与 `tags/topics` 的精确重复。
- 写作或引用旧文前按「历史博客滚动检索与复用」处理：完整 metadata 粗召回可随论点变化重跑，正文按发布事实优先级确认；不要因为同关键词或同分类强行添加内链。
- 检查 taxonomy 同步：每个 `tags/topics` 值都必须在 `blog-taxonomy.json` 中有完全一致的条目；新增词或定义调整必须在同一次变更更新 taxonomy 并完成历史 audit，不能把近期文章当作历史例外。
- 检查 `topics` 数量：一个核心领域即可；第二个 `topic` 必须同样通过主次判定，不能作为凑数标签。
- 检查继续阅读：最多 3 篇且允许不足；强关系优先。自动同主题候选必须共享至少一个 `topic`，tags/category 只作排序，`concepts` 不参与；正文已有历史文章不进入自动同主题，最多一条必要的显式关系可重复。若推荐明显偏题，应先复核 `topics` 或关系评审，而不是降低门槛凑满。
- 检查视觉契约：图片完全可选；如使用图片，正文图为 0–2 张，Markdown 的路径、alt/caption 与 `visuals.inline` 一致。运行 `node scripts/check-blog-images.js`。
- 检查正文和参考资料区是否出现可见的转义标签，例如 `&lt;br /&gt;`、`&lt;a`、`&lt;strong`。这些不是编码乱码，而是 HTML 标签被错误转义，必须修成真实标签或改写为语义 HTML。
- 多行列表说明（例如参考资料链接下一行的「注：...」）可以用真实 `<br />` 换行，但不能把 `<br />` 作为已转义文本写进页面。
- 检查浏览器标题 `<title>` 是否保留中文后缀 `— Leo 的思考碎片`，避免 Windows 管道或脚本编码把它改成问号。
- 检查 `node scripts/check-search-foundation.js` 是否通过；它会同时验证搜索资产和文章内联 JS 的语法。若修改了 `posts-meta.json`，还要确认 `node scripts/generate-search-assets.js --check` 不报过期。
- 检查左侧目录层级：核心 `h2` 都作为一级项；只把可独立跳转的关键 `h3` 放进默认折叠的二级项。参考资料、附录与协作要点等辅助 h3 不应占用目录。
- 在浏览器中至少查看一次文章页的正文末尾和参考资料区；只做 JSON/HTML 静态校验不足以发现可见转义文本和目录层级问题。
- 涉及封面或正文图时，构建并检查 public dist，然后截图复核文章页的桌面/移动、浅色/深色状态；还要模拟图片加载失败，确认 alt 可读且布局不坍塌。
- 涉及目录图标、缩进或展开状态时，按 `CONVENTIONS.md` 的「页面视觉复核」要求截图检查：默认收起、手动展开与滚动到已收录二级项后的状态都应保持层级和文字对齐。

---

## 本地开发

博客列表页通过 `fetch` 加载 `posts-meta.json`，在 `file://` 协议下会因 CORS 失败。
本地验证需启动 HTTP server：

```bash
python -m http.server 8080
# 然后访问 http://localhost:8080/tools/blog/
```

GitHub Pages 部署后无此问题。

---

## 主题切换

博客支持浅色/深色双主题，列表页和文章页均已支持：

**列表页（`index.html`）：**
- 初始化：优先读 `localStorage` 的 `blog_theme` 值 → 无则跟随 `prefers-color-scheme`
- 切换按钮在左侧导航栏底部（月亮/太阳图标）
- `blog_theme` 取值：`'dark'` = 深色，`''`（空字符串）= 跟随系统浅色

**文章页（`posts/*.html`）：**
- 在 `<body data-theme="light">` 后立刻加载 `<script src="../article-runtime.js"></script>`，与列表页共享同一套主题读取逻辑
- 自动同步列表页的 `blog_theme` 设置；无独立切换按钮
- 未设置时跟随 `prefers-color-scheme`；旧 `blog-theme` 值会在首次访问时迁移到 `blog_theme`
- `posts-meta.json` 请求失败时只显示“文章索引暂时不可用，正文仍可正常阅读。”提示，正文保持可读
- 日期行的“约 X 字 · Y 分钟阅读”由运行时读取最终 HTML 正文计算；不依赖 Markdown，所有历史文章与新文章统一按每分钟 400 个阅读单位估算。统计不包含摘要、参考资料、代码块、图片或图注，不能手填或写入 `posts-meta.json`。

---

## 观点区支撑材料规范

主页「我的观点」区块（`prediction-item`）可关联支撑材料，格式如下：

```html
<div class="prediction-expand">
    <!-- 思考碎片文章 -->
    <a class="expand-btn-link" href="tools/blog/posts/xxx.html" target="_blank"
       onclick="event.stopPropagation()">📝 思考碎片：文章标题 →</a>
    <!-- 站内工具 -->
    <a class="expand-btn-link" href="tools/<tool-name>/index.html" target="_blank" rel="noopener" onclick="event.stopPropagation()">🛠 工具：工具名称 →</a>
</div>
```

**规则：**
- 思考碎片链接用 `<a>` + `expand-btn-link`，前缀 `📝 思考碎片：`
- 站内工具用直链 `<a>` + `expand-btn-link`，新标签页打开；前缀 `🛠 工具：`
- 多个支撑材料横排（`.prediction-expand` 已设 `display:flex; gap:8px`）
- 内部所有交互元素必须加 `onclick="event.stopPropagation()"` 阻止触发父级折叠
- 没有合适资源的观点无需强行补充支撑材料，留空即可

---

## 样式规范

- CSS 变量完全自包含于文章 HTML 的 `<style>` 标签，不依赖外部 `style.css`
- 文章正文用语义 HTML（`<h2>`、`<p>`、`<ul>`、`<code>`），无需 Markdown 解析库
- 字体：正文 `Source Sans 3`，标题 `Libre Baskerville`（衬线）
- 品牌色：clay 橙（`--clay`），深色 `#d97757`，浅色 `#c96442`

### CSS 变量命名规范（文章页标准模板）

```css
/* 深色（默认） */
:root {
    --bg:          #080c18;
    --bg-card:     rgba(255,255,255,0.04);
    --bg-subtle:   rgba(255,255,255,0.07);
    --border:      rgba(255,255,255,0.08);
    --text-1:      #f0f4ff;       /* 主文本 */
    --text-2:      #8a95b5;       /* 次要文本、callout 正文 */
    --text-3:      #4a5270;       /* 辅助文本、日期、小标注 */
    --accent:      #4f8fff;       /* 蓝色，用于章节标识等辅助强调 */
    --clay:        #d97757;       /* 品牌色：标签、callout strong、hover */
    --clay-soft:   rgba(217,119,87,0.12);
    --tag-bg:      rgba(217,119,87,0.12);
    --tag-text:    #d97757;
    --code-bg:     #0a0f1e;
    --font:        'Source Sans 3', -apple-system, sans-serif;
    --font-serif:  'Libre Baskerville', Georgia, serif;
    --radius:      10px;
    --max-width:   720px;
}
/* 浅色主题 */
[data-theme="light"] {
    --bg:          #f5f4ed;
    --bg-card:     #faf9f5;
    --bg-subtle:   #f0eee6;
    --border:      #e8e6dc;
    --text-1:      #141413;
    --text-2:      #5e5d59;
    --text-3:      #87867f;
    --accent:      #2563eb;
    --clay:        #c96442;
    --clay-soft:   rgba(201,100,66,0.10);
    --tag-bg:      rgba(201,100,66,0.10);
    --tag-text:    #c96442;
    --code-bg:     #ece9e0;
}
```

### 关键组件样式规则

| 组件 | 规则 |
|------|------|
| `.post-title` | `font-family: var(--font-serif)` |
| `.post-summary` | `border-left: 3px solid var(--clay)` |
| `.post-body h2` | `font-size: 20px; font-weight: 700; color: var(--text-1); border-left: 3px solid var(--accent); padding-left: 10px; margin: 40px 0 14px` |
| `.post-body h3` | `font-size: 16px; font-weight: 700; color: var(--text-1); margin: 28px 0 10px` |
| `.tag` | `background: var(--tag-bg); color: var(--tag-text)` |
| `.callout` | `background: var(--clay-soft); border: clay 色系` |
| `.callout strong` | `color: var(--clay)` |
| `.back-link:hover` | `color: var(--clay)` |
| `.footer-nav a:hover` | `color: var(--clay)` |

### 超链接与跳转规范

文章页统一由 `article-runtime.js` 加载 `article-links.css`；不要在单篇文章中重新定义链接颜色、下划线或焦点样式。

| 场景 | 默认状态 | hover / active | 键盘焦点 |
|------|----------|----------------|----------|
| 正文内引用链接（`.post-body a`） | 正文色 + 陶土色细下划线 | 文字与下划线变 `var(--clay)` | 陶土色 2px outline |
| 参考资料（`.refs a`） | 辅助文字色，不加下划线 | 陶土色 + 下划线 | 陶土色 2px outline |
| 返回、目录、继续阅读、上一篇/下一篇 | 不加下划线，依靠位置与标签表达跳转 | 文字变 `var(--clay)`；目录保留现有 active 状态 | 陶土色 2px outline |

- 正文链接不能使用浏览器默认蓝色；引用的可点击性由细下划线表达。
- 不要为导航链接增加 hover 下划线，也不要只用颜色作为键盘焦点反馈。
- 外链使用 `target="_blank"` 时必须同时写 `rel="noopener noreferrer"`；站内文章跳转保持同页打开。

### 结构化信息块

`.level-card`、`.decision-card` 等卡片只用于 2–4 个互斥层级、阶段或选项的并列比较。每项只包含标签、短标题和一段说明；普通段落、参考资料与单句结论不使用卡片，不嵌套卡片。单句可带走的判断继续使用 `.callout`。

### Google Fonts 引入（每篇文章 `<head>` 必须包含）

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital@0;1&family=Source+Sans+3:wght@400;500;600&display=swap" rel="stylesheet" />
```

### 文章页共享运行时（每篇文章 `<body>` 后必须包含）

```html
<body data-theme="light">
  <script src="../article-runtime.js"></script>
```

`article-runtime.js` 会在解析正文前加载共享链接样式；新文章不得省略该脚本。

---

## Continue Reading 关系规范

文章页底部使用由 `article-runtime.js` 统一渲染的「继续阅读」。默认目标为 3 篇，候选不足时允许少展示；已确认的显式强关系可自然扩展到 4 篇。不要在文章 HTML 中复制推荐算法。

### 显式 relations

新文章只在最终 Markdown frontmatter 中声明较新文章指向较早文章的强关系：

```yaml
relations: [{"slug":"older-article","type":"builds_on"}]
```

只允许 `builds_on`、`revises`、`companion`；target 必须存在、不得自引用或重复。正向依次显示「承接前文 / 修正前文 / 并列阅读」，旧文由中央 metadata 自动反向显示「后续延展 / 后续修正 / 并列阅读」。正文内链不自动构成 relation；只有核心前提、实质修正或直接互补已经由内容评审确认时才写入。历史正文不因未来关系回写。

relations 是上游编辑评审已经确认的结果。GitHub / Codex 不根据 topics、tags、正文链接、参考资料或相似度自动增加、删除、修改或降级 relations；发布层只验证 target/type、计算正反向展示和排序。

### legacy `publish_handoff` 发布交接接口

发布工具仍兼容历史 Markdown 末尾的裸 `publish_handoff` block 和独立 fenced YAML block；两者都会被完整剥离。新 Markdown 禁止依赖此 transport block：relations 已由 frontmatter 持久保存，且不需要 `body_link_only`。

```yaml
publish_handoff:
  relations:
    - slug: alignment-under-change
      type: builds_on
  body_link_only:
    - harness-engineering
```

- 历史 `relations` handoff 仍按原有 target/type 校验并同步；目标文章不会被回写。`relations: []` 明确表示没有强关系，不得为了凑「继续阅读」另建关系。
- `body_link_only` 仅为旧交接的校验兼容：它从不写入 `posts-meta.json`、不显示在页面、不改变继续阅读算法。新文章用正文内链表达普通引用，不能把它升级为 relation。
- 该命令会从历史源稿剥离交接块；生成器会拒绝尚含 handoff 的源稿。不要让生成器或发布阶段重判关系语义。

### 自动同主题与正文去重

显式强关系始终优先，且不因已在正文或参考资料出现而降级或排除。显式关系不足 3 篇时，自动同主题才补足默认目标；3 个显式关系不补同主题，4 个已经确认的显式关系允许全部展示。自动候选必须至少共享一个 `topic`；共享 topic 数、tag 数、category 和发布时间仅用于资格满足后的稳定排序。`concepts` 只服务历史语义召回，不参与前端推荐或关系。自动同主题主要承担内容发现，应优先排除正文或参考资料中已出现的站内历史文章，也不得替换显式关系。

单篇文章的正反向显式关系合计超过 4 个时，metadata validator 会触发关系 QA，要求人工复核 relation 是否定义过宽；发布层不得静默截断或重判语义。

### 发布 QA

- 大纲确认时分别判断：正文是否需要历史内链，以及是否值得成为公开强 relation；两者都可以为否。
- 运行 `node --test scripts/blog-relationships.test.js`、`node scripts/migrate-blog-continue-reading.js --check` 和 `node scripts/check-blog-body-integrity.js`。
- 保留「上一篇 / 下一篇」作为独立日期导航，不与继续阅读合并。

---

## 分享功能规范

OG meta 保证链接分享预览（微信/飞书/Twitter 卡片展示标题+摘要+封面图）。文章页由共享运行时统一提供「生成分享图」入口，打开 `share-card.html?slug=<slug>` 后在浏览器本地生成固定 1080 × 1920 PNG；预览页的「打开原文」、二维码区和底部域名均可直接打开由 `scripts/site-config.js` 生成的 canonical 原文 URL。导出的 PNG 不能携带超链接，图片场景以二维码承担跳转入口。`share_quote` 只服务海报，不进入 OG、canonical、标准 description、JSON-LD、RSS、sitemap 或 feed。上述搜索资产仍由 `scripts/site-config.js`、`scripts/search-foundation.js` 与生成脚本统一维护。

### OG meta 模板（加入每篇文章 `<head>`）

```html
<meta property="og:type"         content="article" />
<meta property="og:title"        content="文章标题" />
<meta property="og:description"  content="文章摘要（同 posts-meta.json summary 字段）" />
<meta property="og:url"          content="https://marktian-long.github.io/tools/blog/posts/slug.html" />
<meta property="og:image"        content="https://marktian-long.github.io/assets/images/blog/slug/cover.jpg" />
<meta property="og:image:width"  content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:image:alt"    content="与文章核心机制相关的图像描述" />
<meta name="twitter:card"        content="summary_large_image" />
<meta name="twitter:title"       content="文章标题" />
<meta name="twitter:description" content="文章摘要" />
<meta name="twitter:image"       content="https://marktian-long.github.io/assets/images/blog/slug/cover.jpg" />
<meta name="twitter:image:alt"   content="与文章核心机制相关的图像描述" />
```

> `og:url`、canonical、RSS 地址和 sitemap 等生成内容的域名以 `scripts/site-config.js` 为准，不在文章 head 里手工复制域名。正文中的正常外链或站内链接不属于该生成范围。声明 `visuals.cover` 的文章将其用于 OG、Twitter large image card 和 JSON-LD；无图文章回退到全站 `assets/images/og-cover.png`，不因本契约批量补图。

### 搜索发现维护

- `tools/blog/data/posts-meta.json` 仍是 `title`、`summary`、`share_quote`、`url` 和 `visuals` 的单一来源；`share-card-config.json` 由生成脚本从全站配置输出，不手工维护。
- 新文章发布后运行 `node scripts/generate-search-assets.js --write`，同步入口页与文章 head，并更新 `robots.txt`、`sitemap.xml`、`feed.xml`。
- 发布前运行 `node scripts/check-search-foundation.js`，确认 robots、sitemap、RSS、canonical、description 和 JSON-LD 一致。
- 现有元数据只有月份，不要伪造精确 `pubDate`、`datePublished` 或 `dateModified`；未来有可靠日期字段后再补。
- 未来更换搜索资产和自动生成 head 使用的域名，只改 `scripts/site-config.js`，再重新运行生成和检查脚本；正文中的显式链接仍需按内容语义单独核对。
- Google Search Console、Bing Webmaster、账号验证 token 与自定义域名属于后续人工步骤，不写入当前文章模板。
- `robots.txt` 当前只声明 sitemap 和全站允许，不区分 GPTBot 等 crawler；如需改变 crawler 策略，单独设计并确认。

### 验证方式

部署到 GitHub Pages 后，用 [opengraph.xyz](https://www.opengraph.xyz) 输入文章 URL 验证卡片预览效果。本地 `file://` 无法测试（需公网 URL）。

---

## 分页规范

**触发条件：** `posts-meta.json` 中 `posts` 数组长度 > 20 时，列表页启用分页。

**实现约定（供将来执行）：**
- 每页展示 10 篇（`PAGE_SIZE = 10`，可根据阅读习惯调整为 15 或 20）
- 分页状态用 URL hash 记录：`index.html#page=2`，支持刷新/分享还原当前页
- 分页控件放在文章列表底部，样式参照现有 `.cat-nav` 按钮风格
- 搜索框输入或分类切换时自动重置到第 1 页
- 分页在 `filtered()` 函数返回结果的基础上切片，不改数据层
- 实现时在 `index.html` JS 区新增 `paginate(list, page)` 纯函数

> **待完善：** 分页状态应优先使用 URL hash 方案；博客以独立直链页面打开，无需处理旧 iframe 路由冲突。

---

> 文章页视觉设计规范（段落节奏、强调克制、组件间距等）见 [BLOG_DESIGN.md](BLOG_DESIGN.md)

---

## 未来考虑

## 数据统计

每篇新文章在 `</body>` 前必须保留：`<script src="/assets/js/analytics.js" defer></script>`。GA4 会按文章 slug 记录浏览量，并在首次阅读至 50% 和 90% 时记录阅读深度；不得向事件参数写入读者联系方式或正文内容。

以下功能当前不实现，记录候选方案备用：

| 功能 | 候选方案 | 备注 |
|------|----------|------|
| 阅读量统计 | 不蒜子（一行引入）/ Umami（自托管） | 不蒜子数据在第三方，Umami 数据自有 |
| 点赞 / 评论 | Giscus（GitHub Discussions）/ Cusdis | Giscus 需登录 GitHub，Cusdis 无需登录 |
| RSS Feed | 已由 `scripts/generate-search-assets.js` 从 `posts-meta.json` 生成 XML | 未来可考虑增加站内订阅入口 |
| 全文搜索 | Lunr.js 客户端索引 | 建议文章 > 50 篇后再考虑 |
