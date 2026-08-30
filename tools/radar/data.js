(function exposeRadarData(root) {
    const data = {
        meta: {
            schemaVersion: 1,
            title: '前沿雷达',
            subtitle: '按研究意图整理的 AI 信息源操作台',
            updatedAt: '2026-08-30',
            reviewCadence: 'quarterly',
            noRealtimeProbe: true,
            statusSemantics: '所有状态均为人工复核记录，不代表实时可达检测或内容持续更新。',
            coverageDimensions: ['语言', '来源类型', '主题', '优先级'],
            topicOptions: [
                { id: 'research', label: '研究前沿' },
                { id: 'product', label: '产品与工具' },
                { id: 'industry', label: '行业与商业' },
                { id: 'builder', label: '实践与构建' },
                { id: 'strategy', label: '策略与组织' }
            ],
            nextStep: {
                label: '热点快照',
                href: '../trends/index.html'
            }
        },
        intents: [
            {
                id: 'research-frontier',
                label: '研究前沿',
                shortLabel: '研究',
                question: '我想知道模型、方法和研究叙事正在往哪里走。',
                description: '先看研究者与一手技术线索，再用周报补齐脉络。',
                sourceIds: ['import-ai', 'the-batch', 'simon-willison']
            },
            {
                id: 'product-signals',
                label: '产品信号',
                shortLabel: '产品',
                question: '我想判断哪些 AI 产品变化值得进入产品判断。',
                description: '组合产品实践、工具速递与中文体验观察，避免只看发布会。',
                sourceIds: ['simon-willison', 'bens-bites', 'sspai-ai', 'geekpark']
            },
            {
                id: 'industry-business',
                label: '行业与商业',
                shortLabel: '行业',
                question: '我想理解公司、市场和组织结构正在怎么变。',
                description: '从深度报道和商业分析切入，再用跨市场来源校验叙事。',
                sourceIds: ['latepost', 'investment-notebook', 'guixingren', 'paul-graham']
            },
            {
                id: 'build-verify',
                label: '实践与构建',
                shortLabel: '实践',
                question: '我想把一个线索变成可验证的原型或工作流。',
                description: '用真实讨论和实践文章找触发点，再沉淀为可复核的行动。',
                sourceIds: ['hacker-news', 'simon-willison', 'sspai-ai', 'import-ai']
            }
        ],
        sources: [
            {
                id: 'simon-willison',
                name: "Simon Willison's Blog",
                description: 'AI 工具实践与可复现技术观察，信息密度高。',
                url: 'https://simonwillison.net',
                language: 'en',
                type: 'blog',
                role: 'primary',
                topics: ['research', 'product', 'builder'],
                updateCadence: 'daily',
                priority: 'core',
                access: 'open',
                bestFor: ['验证新模型与 AI 工具的真实用法', '寻找可复现的技术线索'],
                blindSpot: ['个人作者视角，不能代表行业共识', '对中国市场信号覆盖有限'],
                retentionReason: '能把快速变化的模型能力翻译成可操作的实验与判断。',
                lastCheckedAt: '2026-08-30',
                manualStatus: 'reviewed'
            },
            {
                id: 'paul-graham',
                name: 'Paul Graham Essays',
                description: '硅谷思维、创业与产品哲学的长期文章库。',
                url: 'https://paulgraham.com/articles.html',
                language: 'en',
                type: 'essay',
                role: 'analysis',
                topics: ['strategy', 'product', 'industry'],
                updateCadence: 'irregular',
                priority: 'supporting',
                access: 'open',
                bestFor: ['建立创业与产品的长期判断框架', '给短期 AI 热点寻找反例'],
                blindSpot: ['并非 AI 专题来源', '观点带有鲜明的硅谷创业语境'],
                retentionReason: '用低频、长周期的思想材料抵抗热点驱动的过度反应。',
                lastCheckedAt: '2026-08-30',
                manualStatus: 'reviewed'
            },
            {
                id: 'the-batch',
                name: 'The Batch · deeplearning.ai',
                description: '面向实践者的 AI 研究与产业周报。',
                url: 'https://www.deeplearning.ai/the-batch/',
                language: 'en',
                type: 'newsletter',
                role: 'analysis',
                topics: ['research', 'industry', 'builder'],
                updateCadence: 'weekly',
                priority: 'core',
                access: 'open',
                bestFor: ['每周补齐研究与产业脉络', '把论文和技术变化翻译成应用问题'],
                blindSpot: ['编辑后的摘要不等于一手证据', '节奏固定，难覆盖当天突发信号'],
                retentionReason: '为高频研究线索提供稳定的周度整理与解释层。',
                lastCheckedAt: '2026-08-30',
                manualStatus: 'reviewed'
            },
            {
                id: 'bens-bites',
                name: "Ben's Bites",
                description: 'AI 产品、工具与创业动态的快速速递。',
                url: 'https://bensbites.com',
                language: 'en',
                type: 'newsletter',
                role: 'bridge',
                topics: ['product', 'industry', 'builder'],
                updateCadence: 'daily',
                priority: 'core',
                access: 'partial',
                bestFor: ['捕捉产品发布和工具变化', '形成值得二次验证的线索池'],
                blindSpot: ['速递形式容易压缩背景', '商业信号需要回到原始公告核验'],
                retentionReason: '高频发现层，适合把“今天发生了什么”转成待验证清单。',
                lastCheckedAt: '2026-08-30',
                manualStatus: 'reviewed'
            },
            {
                id: 'hacker-news',
                name: 'Hacker News',
                description: '围绕技术项目与创业话题的高密度社区讨论。',
                url: 'https://news.ycombinator.com',
                language: 'en',
                type: 'community',
                role: 'community',
                topics: ['builder', 'research', 'industry'],
                updateCadence: 'ongoing',
                priority: 'core',
                access: 'open',
                bestFor: ['观察技术从业者的真实反馈', '发现项目、论文与实现的讨论入口'],
                blindSpot: ['社区样本偏向英文技术圈', '热度与重要性并不等价'],
                retentionReason: '提供官方叙事之外的质疑、经验和项目线索。',
                lastCheckedAt: '2026-08-30',
                manualStatus: 'reviewed'
            },
            {
                id: 'import-ai',
                name: 'Import AI',
                description: '聚焦 AI 研究、政策与前沿影响的深度通讯。',
                url: 'https://importai.substack.com',
                language: 'en',
                type: 'newsletter',
                role: 'primary',
                topics: ['research', 'industry', 'strategy'],
                updateCadence: 'weekly',
                priority: 'core',
                access: 'partial',
                bestFor: ['理解研究进展背后的政策与竞争语境', '追踪模型能力之外的制度变化'],
                blindSpot: ['更新节奏不完全固定', '作者判断需要和一手材料交叉验证'],
                retentionReason: '把研究前沿放回政策、产业和社会影响的长链路中。',
                lastCheckedAt: '2026-08-30',
                manualStatus: 'reviewed'
            },
            {
                id: 'sspai-ai',
                name: '少数派 AI 频道',
                description: '中文 AI 工具评测与深度体验文章。',
                url: 'https://sspai.com/tag/AI',
                language: 'zh',
                type: 'media',
                role: 'primary',
                topics: ['product', 'builder'],
                updateCadence: 'ongoing',
                priority: 'core',
                access: 'partial',
                bestFor: ['观察中文用户的真实工具体验', '比较工具进入日常工作流的阻力'],
                blindSpot: ['评测样本和作者偏好会影响结论', '不覆盖所有底层研究进展'],
                retentionReason: '补足英文技术圈之外的中文体验与使用场景。',
                lastCheckedAt: '2026-08-30',
                manualStatus: 'reviewed'
            },
            {
                id: 'geekpark',
                name: '极客公园',
                description: '国内科技与 AI 产品动态，偏产品视角。',
                url: 'https://www.geekpark.net',
                language: 'zh',
                type: 'media',
                role: 'bridge',
                topics: ['product', 'industry', 'strategy'],
                updateCadence: 'ongoing',
                priority: 'supporting',
                access: 'partial',
                bestFor: ['跟踪国内 AI 产品与公司动态', '理解产品发布背后的市场语境'],
                blindSpot: ['媒体报道有选题与采访边界', '深度技术细节覆盖有限'],
                retentionReason: '作为国内产品信号的桥接层，补齐地域和市场差异。',
                lastCheckedAt: '2026-08-30',
                manualStatus: 'reviewed'
            },
            {
                id: 'latepost',
                name: '晚点 LatePost',
                description: '关注科技公司、组织与产业变化的深度报道。',
                url: 'https://www.latepost.com',
                language: 'zh',
                type: 'media',
                role: 'primary',
                topics: ['industry', 'strategy'],
                updateCadence: 'irregular',
                priority: 'core',
                access: 'subscription',
                bestFor: ['理解公司战略与组织变化', '为行业判断寻找深度事实材料'],
                blindSpot: ['部分内容受订阅限制', '报道滞后于即时新闻'],
                retentionReason: '提供比热榜更慢、更接近组织事实的行业纵深。',
                lastCheckedAt: '2026-08-30',
                manualStatus: 'reviewed'
            },
            {
                id: 'investment-notebook',
                name: '投资实习所',
                description: 'AI 行业分析与商业视角的中文通讯。',
                url: 'https://tzx.substack.com',
                language: 'zh',
                type: 'newsletter',
                role: 'analysis',
                topics: ['industry', 'strategy', 'product'],
                updateCadence: 'weekly',
                priority: 'supporting',
                access: 'partial',
                bestFor: ['梳理 AI 商业模式与竞争格局', '把产品新闻转译为商业问题'],
                blindSpot: ['分析结论需要回到公司披露核验', '更新频率可能受作者节奏影响'],
                retentionReason: '补足技术和产品信号之后的价值分配与商业解释层。',
                lastCheckedAt: '2026-08-30',
                manualStatus: 'reviewed'
            },
            {
                id: 'guixingren',
                name: '硅星人',
                description: '连接硅谷与国内 AI 动态的中文科技媒体。',
                url: 'https://www.guixingren.com',
                language: 'zh',
                type: 'media',
                role: 'bridge',
                topics: ['industry', 'product', 'strategy'],
                updateCadence: 'ongoing',
                priority: 'watch',
                access: 'open',
                bestFor: ['对照中美 AI 生态叙事', '发现跨市场产品和公司线索'],
                blindSpot: ['跨市场报道容易牺牲细节', '媒体选题不等于完整市场样本'],
                retentionReason: '用于发现跨地域差异和需要进一步核验的生态信号。',
                lastCheckedAt: '2026-08-30',
                manualStatus: 'reviewed'
            }
        ],
        workflowTools: [
            {
                id: 'perplexity',
                stage: 'search',
                name: 'Perplexity',
                url: 'https://www.perplexity.ai',
                description: '搜索线索与原始链接，先建立待核验的问题清单。'
            },
            {
                id: 'notebooklm',
                stage: 'verify',
                name: 'NotebookLM',
                url: 'https://notebooklm.google.com',
                description: '把来源放在同一上下文中，沿原文逐条核对说法。'
            },
            {
                id: 'claude',
                stage: 'synthesize',
                name: 'Claude',
                url: 'https://claude.ai',
                description: '比较证据、补出反例，形成带边界的产品或行业判断。'
            },
            {
                id: 'cursor',
                stage: 'distill',
                name: 'Cursor',
                url: 'https://www.cursor.com',
                description: '把判断落成可运行原型、记录或下一次可复核的实验。'
            }
        ]
    };

    root.RADAR_DATA = data;
    if (typeof module === 'object' && module.exports) module.exports = data;
})(typeof window !== 'undefined' ? window : globalThis);
