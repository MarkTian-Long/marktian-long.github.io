# AI 正在把“使用软件”和“操作软件”拆开

> 在创作和专业工作软件里，智能体（Agent）正在把“使用一个软件”和“亲自操作一个软件”拆开。判断一个产品会不会被 AI 吃掉，与其看用户以后还会不会打开它，不如看：当 Agent 已经能替用户完成操作，把这个软件从完整任务里删掉以后，还有什么必须重新建回来。

---

今年四月，Claude Design 刚发布时给我的震撼很大。那时我已经越来越习惯一种新的工作方式：和 Claude Code 讨论自己想做什么，方向确定以后，把不少中间执行交给它，最后再检查结果。我不需要知道每一个文件怎么改、每一条命令怎么敲。Claude Design 又把这种感觉带到了设计，我在之前的[《Claude Design：设计工具的 iPhone 时刻，还是一场更大的吞并？》](https://marktian-long.github.io/tools/blog/posts/claude-design-blog.html)里甚至写过一句很强的判断：“Figma：死得慢，但方向是确定的。”

现在看，我错的不是注意到软件操作方式正在变化，而是太早把这种变化推成了 Figma 的终局。当时这个判断隐含了两个前提：Figma 的核心角色仍然是一套让人操作图形界面的设计软件；一旦用户可以直接向 Claude 表达意图，再把结果交给 Claude Code 实现，Figma 所在的中间环节就会越来越容易被绕过。

几个月以后，第一个前提已经明显松动。Figma 在 3 月[把画布开放给外部 Agent](https://www.figma.com/blog/the-figma-canvas-is-now-open-to-agents/)，让它们可以直接创建和修改设计；5 月又[把自己的 Design Agent 放进画布](https://www.figma.com/blog/the-figma-agent-is-here/)；随后又继续补充 [Code Layers](https://www.figma.com/blog/code-on-the-figma-canvas/)、Skills 和更多 Agent 上下文。Figma 正在尝试把自己从“人操作的设计编辑器”，变成“人和 Agent 都能使用的设计环境”。另一边，[Claude Design 自己也没有走成“只剩一个聊天框”](https://claude.com/blog/claude-design-stays-on-brand-for-daily-work)：Anthropic 继续加强设计系统导入、和 Claude Code 的衔接，也保留画布上的直接编辑。

所以我现在不会反过来说 Figma 已经安全。真正需要收回的是“方向已经确定”：**如果 Figma 最后只剩让人拖图层，它确实危险；但如果设计对象、组件关系和团队状态变成 Agent 也要依赖的工作环境，那么人不再亲自操作 Figma，并不能直接推出 Figma 不再被使用。**

这篇文章讨论的也不是所有软件。社交、游戏、内容消费的价值逻辑不同；我更关心创作和专业工作软件，因为 Agent 已经开始真实进入这些任务链。

## 一、人不再亲自操作软件，不等于软件已经消失

最近一位同时覆盖设计和前端的使用者 Kosta Z. 分享了一个很有代表性的实践。他把 Figma MCP 接进 Claude 后，技术上很快就跑通了：可以生成真实画框，图层命名和设计 token 也基本正常。但用了几周以后，他还是把 Figma 从自己的常用流程里删掉了，因为设计和代码已经在同一个 Claude 会话里完成。他直接改组件、看运行中的产品、继续调整，额外生成的 Figma 文件只是另一份很快会过时的快照。[这份个人实践自述](https://www.linkedin.com/posts/kostazanin_i-wired-a-figma-mcp-into-my-claude-session-activity-7495857967162966018-TazQ)不能代表整个设计行业，但它提供了一个很干净的反例：删除 Figma 后，没有必要工作重新落到他身上，也没有任何下游角色在等那份设计文件。

Coinbase Design System 团队提供了相反的例子。他们使用 Figma Code Connect，把设计系统里的组件映射到生产代码中的真实组件，再把这些关系提供给 Coding Agent。Figma 公布的[客户案例](https://www.figma.com/blog/how-coinbase-used-code-connect-to-shrink-token-costs/)称，在团队自己的小规模对照测试里，相同设计、提示词和模型条件下，加入这些映射后 Token（词元）成本平均下降了 22.5%。这个数字不能外推成行业平均效果；更值得看的是，模型没有变化，Agent 少猜了一层“这个设计对象在真实代码里到底对应什么”。

同样是 Figma，一个人可以完全绕过，另一个团队却可能继续依赖。区别不在谁“更 AI Native”，而在后续任务到底消费什么：对 Kosta 来说，运行中的代码已经是事实来源；对 Coinbase 来说，设计组件及其与生产代码的映射仍然会被工程师和 Agent 继续使用。

这种区别并不限于设计。假设财富管理机构的客户经理刚和客户做完一次电话、企业微信或视频沟通，客户提到收入增加、准备买房、几年后孩子准备留学。过去，这些信息从“客户说过”变成“公司的正式业务状态”，往往还要经过会议记录、客户匹配、CRM 或财富管理系统更新等步骤。

美国的 Jump 可以理解成面向财务顾问的 AI 会议与工作助手，[它会结合会议、CRM、财务规划软件、邮件和任务等数据辅助顾问工作](https://help.jumpapp.com/en/articles/11824817-how-to-use-ai-associate)；RightCapital 则是一套专业财务规划系统。两者连接以后，[Jump 会读取会议记录，与 RightCapital 已有客户数据比较，再提出收入、支出、目标和家庭信息的更新建议](https://help.jumpapp.com/en/articles/11408193-rightcapital-integration)。今天的产品仍要求顾问逐项接受、修改或忽略，再把批准的变化同步进去。

这并不说明“最后必须由人确认”是长期结构。模型更可靠以后，客户匹配、事实提取、低风险字段更新，甚至一部分正式写入都可能继续自动化。更耐久的问题是：系统必须知道当前有效状态是什么，一次变化什么时候已经生效，以及谁或什么机制有权限改变它。昨天客户收入是 50 万，今天客户说已经涨到 60 万；未来完全可能由 Agent 自动验证并更新，但后续财务规划不能长期不知道究竟应该按哪个数字继续工作。

我最近设计审核产品时也碰到类似问题。客户未来完全可以直接聊天、上传制度材料，让 AI 形成审核规则，不再手工填写大量配置。但“草案”和“正式生效规则”的区别、当前使用哪一版、它适用于什么范围、哪些审核任务正在引用它，并不会因为交互变成聊天而自然消失。谁来触发生效动作可以变化，人甚至可以越来越少介入；业务世界仍然需要一个明确的“现在是什么”。

**所以，Agent 最容易拿走的是为了让人完成任务而存在的操作步骤；软件是否继续有必要，更应该看它是否仍承载后续任务需要使用的业务对象、状态、关系和专业能力。**

## 二、AI 原生，不是给旧软件加一个聊天框

这个判断落到 AI 产品经理的工作上，比“图形界面会不会被语言界面替代”更具体。现在传统软件最容易想到的 AI 改造，是在原来的客户、产品、交易、规则、报表旁边再加一个“AI 助手”。这种方式可以很快上线，但经常把最重要的问题留到了后面：这个 AI 到底在操作当前对象，还是在组织一项跨模块任务？它给出的结果只是聊天内容，还是已经改变了正式业务状态？任务中断以后又从哪里继续？

我更倾向先按**任务作用范围**决定 AI 的位置，而不是先讨论聊天框放左边还是右边：

| **任务作用范围** | **更自然的产品位置** | **例子** |
|---|---|---|
| 局部修改 | 字段、表格、画布内的局部 AI | “只改这一段 / 这个字段” |
| 单一业务对象 | 客户、规则、设计稿等对象旁 | “根据刚才会议更新这个客户” |
| 跨模块目标 | 全局 AI 入口 | “分析这批客户并生成跟进任务” |
| 长时间跨系统任务 | 独立任务工作区 | 调研、批处理、跨系统写回 |

*这是本文为了讨论产品位置做的任务范围归纳，不是行业固定分类。一个产品也可能同时支持多个范围。*

这张表只回答“意图从哪里进入”。任务一旦开始，正式业务对象和 Agent 自己的运行状态还要分别处理。用户说“把客户风险等级改成稳健型”，AI 回复“已经处理”，可能代表三种完全不同的事情：它只是理解了要求；它生成了一份待生效修改；或者 CRM 的正式字段已经真的变化。如果产品不把这些状态区分开，聊天记录很快会变成第二套模糊的业务系统。

因此，**Chat 更适合承担意图表达、解释和协作，正式结果最终应该落回明确的业务对象。** 客户变化进入客户档案，规则变化进入规则包，订单形成订单记录，设计结果成为真正的设计对象或代码。长任务则需要自己的执行状态，让系统知道做到哪里、哪些动作已经生效、哪里失败、能否回退，以及什么时候需要人重新介入。

这也意味着，“AI 助手”不应该天然成为和“客户”“交易”“规则”并列的一级业务模块。AI 往往更像一种跨对象的操作方式；只有当它产生了长期任务、历史、产物和可恢复状态时，才需要独立的任务工作区。入口、对象和任务不是三套平行框架，而是同一项工作从表达意图到改变现实状态的几个环节。

## 三、当 Agent 变成主要操作者，产品底座也要重做

过去设计业务软件，很容易从页面和功能开始：有哪些一级菜单、一个页面放哪些字段、用户要按什么顺序点击。当 Agent 开始承担更多执行以后，AI 产品经理（AI PM）需要先问另一组问题：如果用户根本不亲自操作，这些页面背后的哪些东西仍然必须存在？如果把页面先拿掉，产品底座至少还要回答三类问题。

**第一，业务对象与状态。** 设计软件里有画框、组件和设计系统，CRM 里有客户和商机，审核产品里有规则包和审核任务。它们不是因为 GUI 需要一个页面才存在，而是任务本身在操作这些对象；同样，草案还是生效、订单有没有提交、任务是否完成，也必须有明确状态。人可以少看页面，系统却不能不知道“现在是什么”。

**第二，权限与状态迁移。** 今天很多 AI 产品采用“AI 草拟 → 人确认 → 生效”，但人工确认不应该被当作永久结构。更合理的设计，是根据风险、置信度和授权范围决定哪些动作可以自动提交，哪些动作需要升级给人。Jump 当前对 CRM 和财务规划数据的写入仍要求用户批准，这证明的是今天的产品和合规机制，而不是未来所有修改都必须点一次确认。[Jump 当前的 Compliance settings](https://help.jumpapp.com/en/articles/11526343-compliance-settings)就体现了这种当下边界。

**第三，可观察与可恢复。** Agent 已经执行二十步以后，人真正需要看到的通常不是重新操作二十个按钮，而是目标、关键变化、异常、依据以及少数需要本人决定的问题。失败以后，产品还要知道能否重试、从哪一步恢复、哪些已经生效的动作需要撤销。GUI 因此不会简单消失，但它的重心可能从“教人怎样一步步操作系统”，转向观察、比较、异常处理和精确干预；大量执行则可以通过 API、MCP 或计算机操作（Computer Use）完成。

**AI 原生产品真正重组的是“意图入口 → Agent 任务 → 业务对象与状态 → 必要的人类介入”，而不只是把原来的 GUI 换成一个聊天框。** 这也是为什么 Figma 与 Claude Design 最后都没有走成纯聊天产品：两家公司虽然竞争，却都在尝试把自然语言、专业工作对象和直接编辑放进同一套工作环境。

## 四、人工操作退出、第一入口迁移、软件退出任务链，不是一回事

我在[《半年之后，AI 办公从产品赛马走向体系竞争》](https://marktian-long.github.io/tools/blog/posts/ai-work-system-competition.html)里已经讨论过一个前提：Agent 会压缩一部分人工操作软件的价值，而事实记录、规则、权限和责任这些底层职责可能变得更重要。这篇继续往下追的是，即使专业软件仍承载这些东西，它的产品位置和商业位置也未必不变。很多“AI 替代软件”的讨论，把三种程度完全不同的变化混在了一起：

| **变化** | **同一个 Figma 中可能出现的任务链** | **产品层发生什么** | **商业层可能发生什么** |
|---|---|---|---|
| **人工操作退出** | 用户 → Figma → Agent → 设计 | 人少做操作，Figma 仍是明确工作环境 | 席位、学习成本等锁定因素减弱，但软件仍可收费 |
| **第一入口迁移** | 用户 → Claude Code / Codex → Figma MCP → 设计 | 用户不再从 Figma 开始任务，Figma 退到后台 | 客户关系、默认选择权和议价权可能向上层 Agent 迁移 |
| **软件退出任务链** | 用户 → Claude / Codex → Code → Browser | Figma 对这类任务不再承担必要职责 | 独立付费理由在这类任务中被吸收 |

*这是本文为了区分产品替代程度做的归纳，不是行业标准。三个状态描述的是具体任务链，不等于对 Figma 整家公司下结论；同一产品也可能在不同用户、不同任务里同时处于不同状态。*

**前两种变化有一个共同点：Figma 仍然留在任务链里。** 用户如果仍从 Figma 开始，只是让 Agent 完成越来越多画布操作，变化主要发生在“谁来操作”；如果用户从 Claude Code 或 Codex 开始，再通过 [Figma MCP 的 Write to canvas](https://developers.figma.com/docs/figma-mcp-server/write-to-canvas/) 调用 Figma，那么人的直接操作和第一入口都发生了迁移，但 Figma 仍然承担设计环境的职责。两者都会改变产品形态和商业位置，却还不能说 Figma 已经被这项任务淘汰。

第三种才发生了更根本的变化。前面的 Kosta 案例里，如果代码和运行页面已经承担全部后续工作，没有任何人或 Agent 继续消费 Figma 对象，那么 Figma 就可以从这条任务链中被完整删除。这仍然只是任务级的软件退出，不代表 Figma 公司或设计软件品类整体消失。

这个区分也解释了为什么“用户不打开软件”是一个不够好的替代指标。对产品团队而言，人工操作退出首先改变交互和 Agent 接口设计；第一入口迁移进一步改变产品如何被发现、调用和组合；软件退出任务链才意味着独立产品的存在理由在这项任务里真的被吸收。对商业团队而言，第一入口迁移往往比单纯的人工操作退出更值得警惕：专业软件依然不可或缺，却可能从用户主动选择的品牌，变成上层 Agent 可以路由、替换和议价的供应商。

但 AI 并不只会让旧软件退到后台。演语科技（Evoken）的创意产品提供了一个反方向例子。公开资料能看到它围绕模型与创作生态、设计 Agent、视频创作环境形成多条产品线；这里真正值得关注的不是到底有“三个还是五个产品”，而是同一种应用层思路：模型和工具越多，用户越可能不想自己理解每个模型、参数和工作流，而希望有人把它们重新组织成完整任务。[36氪对演语科技的报道](https://www.36kr.com/p/3868439589491969)也把这种跨产品组合和应用层压力放在一起讨论。

其中，[Lovart 的官方产品说明](https://www.lovart.ai/docs/getting-started/how-lovart-works)把任务直接组织成“从 Brief 到可编辑设计结果”的完整链路；[LibTV](https://www.liblib.tv/wappro?sourceid=040004)则把剧本、角色、分镜、模型选择和视频生成继续组合成视频生产环境。LibTV 还[公开了面向外部 Agent 的 Skill](https://github.com/libtv-labs/libtv-skills)，让上层 Agent 只需要传递原始创作意图，再由专业环境拆解分镜、编排工作流和选择模型。

这类产品会同时面对通用 Agent 的竞争与合作：通用 Agent 的软件操控能力越强，越可能直接绕过垂直产品；但如果 Lovart、LibTV 能持续把角色资产、多镜头状态、模型选择、专业编辑和生产流程组织得更好，它们也可能反过来成为通用 Agent 调用的专业环境。**模型越来越强，并不只会让应用变薄；它也会把原来分散在多个软件里的能力重新组合，让过去成本太高、难以形成产品的完整任务第一次值得产品化。**

## 五、不要把今天的实现形式，当成长久价值

这个判断不只适用于软件。早几年使用大模型时，提示词（Prompt）的存在感很强：怎样写角色、少样本示例（Few-shot）、思维链（Chain-of-Thought），怎样要求格式，都可能明显影响结果。今天 Prompt 没有消失，系统指令仍然重要，但很多过去需要用户显式完成的提示词工程已经退到后台，被更强模型、结构化输出、工具调用和 Agent 运行时接走。

之后大量企业 AI 又采用工作流（Workflow）：把模型放进提前定义好的流程里，由人规定每一步怎样走。技能（Skill）再往前一步。Anthropic 把 [Agent Skills](https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills) 定义成可以被 Agent 动态发现和加载的 instructions、scripts 和 resources，用来把程序性知识和组织上下文打包给通用 Agent；Anthropic 甚至明确提出，未来 Agent 可以自己创建、编辑和评估 Skills。

如果把这些放在一起，我更愿意把它理解成**显式编排重心的迁移**，而不是一条后一阶段淘汰前一阶段的严格时间线：

| **阶段性重心** | **人主要显式编码什么** | **Agent 自己决定什么** |
|---|---|---|
| Prompt 为中心 | 单次指令 | 很少 |
| Workflow 为中心 | 步骤与分支 | 局部判断 |
| Skill 为中心 | 方法、资源和工具 | 执行路径 |
| 真实环境为中心 | 目标、对象、规则和权限 | 规划与执行 |

*这是本文为了理解产品设计重心变化做的趋势图，不是行业四阶段定律。四种方式今天可以同时存在，同一个系统也可能混合使用。*

最后一行和智能体支撑层（Harness）很接近，但不是同一个概念。这里说的“真实环境”是任务客观依赖的客户、订单、设计对象、规则、权限、当前状态和反馈；Harness 更像让 Agent 能可靠读取、操作和维护这些环境的执行支撑层，包括上下文（Context）、工具、状态管理、权限、恢复和评测。我之前在[《工程演进三段论：从 Prompt 到 Harness，竞争重心在哪里》](https://marktian-long.github.io/tools/blog/posts/harness-engineering.html)里更多讨论的是后者，这篇关注的是产品需要把什么真实环境交给越来越自主的 Agent。

这也让我想给以前的[《技术消亡度框架：判断哪些 AI 技术值得长期投入》](https://marktian-long.github.io/tools/blog/posts/tech-obsolescence.html)再加一层限定。**过去我更关注一项技术是在补救模型缺陷，还是在编码领域知识；现在我认为，即使领域知识本身长期存在，今天承载它的形态仍然可以不断折旧。**一家公司当前有效的合规规则不会因为下一代模型更强而消失，但它可以从 Prompt 进入 Workflow，再进入 Skill、策略（Policy）、业务对象，或者由 Agent 根据当前环境动态加载。

因此，现在评估一个 AI 产品时，我越来越喜欢做一个简单的“删除测试”：假设模型已经足够强，也获得合理的数据、工具和权限，把这个产品整个删掉，为了完成同一个任务，还必须重新建设什么？如果答案只是换一个 Prompt、聊天框或者几步 Agent 已经能自己完成的操作，这个产品的位置很危险；如果必须重新建立业务对象、权威状态、对象关系、专业知识、权限、工具和长期维护机制，它仍然在承担真实产品职责。再往后，才需要继续判断这些资产究竟属于供应商还是客户，竞争者复制起来有多难，以及这份产品价值最终能不能转化成商业价值。

我可能真的会越来越少学习每套软件怎么点、怎么拖、怎么配置，但这不一定意味着我使用的软件越来越少。有些软件会从“我亲自操作的工具”，变成“我的 AI 替我调用的专业环境”；有些新的 Lovart、LibTV 之类产品，会把越来越复杂的 AI 能力重新组织成完整任务；还有一些软件，会因为删掉以后什么都不用重新补，真正离开任务链。

**AI 改变的不只是软件界面，而是在重新决定：哪些过程还需要被显式编码，哪些现实对象、状态、规则和责任无论谁来操作都必须继续存在。**

## 参考资料

### 一手文件 / 官方产品资料

- [Figma：Agents, meet the Figma canvas](https://www.figma.com/blog/the-figma-canvas-is-now-open-to-agents/)
- [Figma：The Figma design agent is here](https://www.figma.com/blog/the-figma-agent-is-here/)
- [Figma：Code on the Figma canvas](https://www.figma.com/blog/code-on-the-figma-canvas/)
- [Figma：Write to canvas](https://developers.figma.com/docs/figma-mcp-server/write-to-canvas/)
- [Anthropic：Claude Design now stays on brand for daily work](https://claude.com/blog/claude-design-stays-on-brand-for-daily-work)
- [Jump：How to use AI Associate](https://help.jumpapp.com/en/articles/11824817-how-to-use-ai-associate)
- [Jump：RightCapital Integration](https://help.jumpapp.com/en/articles/11408193-rightcapital-integration)
- [Jump：Compliance settings](https://help.jumpapp.com/en/articles/11526343-compliance-settings)
- [Lovart：How Lovart Works](https://www.lovart.ai/docs/getting-started/how-lovart-works)
- [LibTV：专业视频创作工具](https://www.liblib.tv/wappro?sourceid=040004)
- [LibTV Skills：GitHub](https://github.com/libtv-labs/libtv-skills)
- [Anthropic：Equipping agents for the real world with Agent Skills](https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills)

### 主流媒体 / 公司动态

- [36氪：单月收入暴涨 3000% 之后，演语科技的三重隐忧](https://www.36kr.com/p/3868439589491969)

### 企业实践（厂商发布）

- [Figma：How Coinbase used Code Connect to guide agents and shrink token costs](https://www.figma.com/blog/how-coinbase-used-code-connect-to-shrink-token-costs/) — Coinbase Design System 团队案例，其中 22.5% 为该团队的小规模对照测试结果，不代表行业平均效果。

### 从业者实践

- [Kosta Z.：Claude MCP Figma Integration Fails to Add Value](https://www.linkedin.com/posts/kostazanin_i-wired-a-figma-mcp-into-my-claude-session-activity-7495857967162966018-TazQ) — 个人设计与前端一体化场景的实践自述，用于提供反例，不代表设计行业整体趋势。

### 历史文章

- [Claude Design：设计工具的 iPhone 时刻，还是一场更大的吞并？](https://marktian-long.github.io/tools/blog/posts/claude-design-blog.html)
- [半年之后，AI 办公从产品赛马走向体系竞争](https://marktian-long.github.io/tools/blog/posts/ai-work-system-competition.html)
- [工程演进三段论：从 Prompt 到 Harness，竞争重心在哪里](https://marktian-long.github.io/tools/blog/posts/harness-engineering.html)
- [技术消亡度框架：判断哪些 AI 技术值得长期投入](https://marktian-long.github.io/tools/blog/posts/tech-obsolescence.html)
