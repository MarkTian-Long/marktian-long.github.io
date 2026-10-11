# 首页「我的判断」历史内容快照

保存日期：2026-10-09。原观点标注日期：2026.03–2026.04。

用途：保留旧首页内容，供后续文章选题、复盘与迁移参考。这里保留的是历史表述，不代表对其中时效性结论进行了重新核验。

来源：index.html 中完整 ABOUT 区块。
原 index.html SHA256：31B7832EC8DDBBF22E445F03A1B2CAE39C2B08F414AA03E5876F1AD518CF3D52

```html
    <!-- ========== ABOUT ========== -->
    <section class="section about-section" id="about">
        <div class="container">
            <div class="section-header reveal">
                <span class="section-label">Judgment</span>
                <h2 class="section-title">我的判断</h2>
                <p class="section-desc">对 AI 落地现状的独立观察，持续更新</p>
            </div>

            <!-- 观点列表 -->
            <div class="view-list reveal">

                <div class="view-item" onclick="toggleView(this)">
                    <div class="view-head">
                        <span class="view-num">01</span>
                        <span class="view-lead">全自动无监督的 Agent 在 2027 年前不会大规模落地</span>
                        <span class="view-tag">Agent 落地</span>
                        <span class="view-date">2026.03</span>
                        <span class="view-toggle">展开</span>
                    </div>
                    <div class="view-body">
                        <p>B 端：真正的阻碍从来不是技术——工作流整合、权责归属、内部系统对接，这三道坎没有纯技术解法，也不会因为模型更强而自动消失。</p>
                        <p>C 端：平台接入解决的是"用起来"，解决不了"用得稳"。Agent 能产生实际效果的操作往往不可逆或存在隐私风险，信任壁垒不会因为入口变了就消失。</p>
                        <p>当前阶段普通用户的日常需求复杂度本就有限，长链条 Agent 的能力溢出于实际需要——但随着使用习惯建立，C 端对复杂任务的需求也会逐步释放。</p>
                        <div class="view-links">
                            <a class="view-link-btn" href="tools/blog/posts/agent-three-problems.html" target="_blank" onclick="event.stopPropagation()">📝 思考碎片：Agent 三大工程问题</a>
                            <a class="view-link-btn" href="tools/agent-hub/index.html" target="_blank" rel="noopener" onclick="event.stopPropagation()">🛠 工具：Agent 认知全景</a>
                        </div>
                    </div>
                </div>

                <div class="view-item" onclick="toggleView(this)">
                    <div class="view-head">
                        <span class="view-num">02</span>
                        <span class="view-lead">金融 AI 的近期形态是"有人工节点的半自动化"，而非完全自主 Agent 链</span>
                        <span class="view-tag">金融行业</span>
                        <span class="view-date">2026.03</span>
                        <span class="view-toggle">展开</span>
                    </div>
                    <div class="view-body">
                        <p>B 端：监管与审计要求每一步决策可追溯、可签字，推理步骤不透明的 Agent 进不了审批流程。</p>
                        <p>C 端：大模型不具备直接替代持牌顾问做出最终投资建议的资质。</p>
                        <p>现实切入点：智能投顾的核心是用户行为管理而非涨跌预测；研报生成 AI 承担资讯聚合与格式校验；客服路由 AI 识别意图后精准分发，人工专注高复杂度案例。</p>
                    </div>
                </div>

                <div class="view-item" onclick="toggleView(this)">
                    <div class="view-head">
                        <span class="view-num">03</span>
                        <span class="view-lead">国内大模型与 Claude 在对齐取向上存在实质差异，影响产品设计</span>
                        <span class="view-tag">模型对齐</span>
                        <span class="view-date">2026.03</span>
                        <span class="view-toggle">展开</span>
                    </div>
                    <div class="view-body">
                        <p>Claude 的不同在于：批判性输出更克制，不倾向于给用户想听的答案；执行任务前会先澄清意图，而非直接开始——国内模型普遍跳过这个环节。</p>
                        <p>对 AI PM 的影响是实质性的：如果产品以"快速给答案"为核心交互，意图澄清机制天然被挤掉；但在企业场景，一个理解错了的快速输出，代价往往比慢一步确认更大。</p>
                        <div class="view-links">
                            <a class="view-link-btn" href="tools/blog/posts/llm-soft-quality.html" target="_blank" onclick="event.stopPropagation()">📝 思考碎片：大模型的软性质量差距</a>
                        </div>
                    </div>
                </div>

                <div class="view-item" onclick="toggleView(this)">
                    <div class="view-head">
                        <span class="view-num">04</span>
                        <span class="view-lead">AI 技术的投入价值取决于它是"补救缺陷"还是"编码知识"</span>
                        <span class="view-tag">产品框架</span>
                        <span class="view-date">2026.03</span>
                        <span class="view-toggle">展开</span>
                    </div>
                    <div class="view-body">
                        <p>补救缺陷型技术（CoT 提示、角色扮演设定）会随着基础模型能力提升而消亡。编码知识型技术（金融合规规则结构化、行业约束条件代码化）不会消亡——模型无法从训练数据推断特定组织的内部规则。</p>
                        <p>实际意义：在消亡度高的技术上大量投入，ROI 是递减的；真正值得建立的护城河是领域知识的结构化能力。</p>
                        <div class="view-links">
                            <a class="view-link-btn" href="tools/blog/posts/tech-obsolescence.html" target="_blank" onclick="event.stopPropagation()">📝 思考碎片：技术消亡度框架</a>
                        </div>
                    </div>
                </div>

                <div class="view-item" onclick="toggleView(this)">
                    <div class="view-head">
                        <span class="view-num">05</span>
                        <span class="view-lead">AI 工程竞争重心已从 Prompt 转向 Harness，2026 年护城河在系统可靠性</span>
                        <span class="view-tag">工程演进</span>
                        <span class="view-date">2026.04</span>
                        <span class="view-toggle">展开</span>
                    </div>
                    <div class="view-body">
                        <p>Prompt Engineering → Context Engineering → Harness Engineering，关注层次从"这次调用输出更好"上移到"整个 Agent 系统怎么在生产环境稳定运行"。</p>
                        <p>Harness Engineering 解决系统可靠性问题，与模型能力正交——模型越强，真正暴露出的系统设计问题反而越多。工具调用的安全边界、失败恢复、人工介入节点、可观测性，这些才是难以复制的工程壁垒。</p>
                        <div class="view-links">
                            <a class="view-link-btn" href="tools/blog/posts/harness-engineering.html" target="_blank" onclick="event.stopPropagation()">📝 思考碎片：工程演进三段论</a>
                        </div>
                    </div>
                </div>

            </div>

            <!-- 行业落地（折叠） -->
            <div class="view-extra reveal">
                <button class="view-extra-toggle" onclick="toggleExtra(this)">
                    行业落地现状 <span>展开 +</span>
                </button>
                <div class="view-extra-body">
                    <div class="landing-body">
                        <!-- 第一层：通用场景 -->
                        <p class="landing-lead">部分通用场景已率先跑通，与行业无关——凡是标准化程度高、错误代价低的工作，AI 替代速度都超出预期：</p>
                        <div class="landing-scenes">
                            <span class="ls-item">客服 / 售前自动化</span>
                            <span class="ls-sep">·</span>
                            <span class="ls-item">代码补全与 Review</span>
                            <span class="ls-sep">·</span>
                            <span class="ls-item">文案与内容生产</span>
                            <span class="ls-sep">·</span>
                            <span class="ls-item">知识库问答</span>
                        </div>
                        <!-- 第二层：行业进度 -->
                        <p class="landing-lead landing-lead--sec">各行业的落地进度则由自身壁垒决定，而非技术成熟度：</p>
                        <div class="landing-industries">
                            <div class="li-row">
                                <span class="li-name">金融</span>
                                <span class="li-stage li-stage--pilot">试点</span>
                                <span class="li-note">合规审计与数据安全是主要壁垒，每步决策需可追溯</span>
                            </div>
                            <div class="li-row">
                                <span class="li-name">教育</span>
                                <span class="li-stage li-stage--pilot">试点</span>
                                <span class="li-note">个性化辅导场景明确；AI 代写的边界尚无定论</span>
                            </div>
                            <div class="li-row">
                                <span class="li-name">医疗</span>
                                <span class="li-stage li-stage--early">早期</span>
                                <span class="li-note">责任归属不明确，AI 输出需全量人工复核才能入流程</span>
                            </div>
                            <div class="li-row">
                                <span class="li-name">法律</span>
                                <span class="li-stage li-stage--early">早期</span>
                                <span class="li-note">合同审查有价值，但幻觉问题对律师可用性是硬伤</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 能力短板（折叠） -->
            <div class="view-extra reveal">
                <button class="view-extra-toggle" onclick="toggleExtra(this)">
                    当前能力短板 <span>展开 +</span>
                </button>
                <div class="view-extra-body">
                    <div class="gap2-list">
                        <div class="gap2-item">
                            <span class="gap2-title">过度迎合</span>
                            <p>模型倾向认同用户判断，在需要批判性反馈的工作场景中可用性低。真正解决意味着模型能主动识别并指出用户假设中的错误。</p>
                            <div class="gap2-tags"><span>客服质检</span><span>方案评审</span><span>需求分析</span></div>
                        </div>
                        <div class="gap2-item">
                            <span class="gap2-title">长期记忆与上下文持久化</span>
                            <p>跨会话记忆依赖浅层存储，无真正的语义检索，用户无法跨设备延续上下文。</p>
                            <div class="gap2-tags"><span>个人助理</span><span>企业知识库</span><span>长周期辅导</span></div>
                        </div>
                        <div class="gap2-item">
                            <span class="gap2-title">知识边界的自我认知不足</span>
                            <p>面对可能已过时的信息不主动提示不确定性，需用户显式要求联网才会验证。</p>
                            <div class="gap2-tags"><span>金融行情</span><span>新闻摘要</span><span>动态监控</span></div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    </section>


```
