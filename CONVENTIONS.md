# 项目开发规范 CONVENTIONS

> 本文档定义了项目的开发标准和扩展规范，确保项目增长时保持一致性和可维护性。

---

## 一、目录结构规范

```
qiuzhi/
├── index.html              # 唯一入口文件
├── assets/                 # 静态资源（CSS / JS / 图片）
│   ├── css/                # 样式文件
│   ├── js/                 # 脚本文件
│   └── images/             # 图片资源
├── tools/                  # 嵌入式工具（每个工具独立文件夹）
│   └── <tool-name>/
│       └── index.html
├── content/                # Markdown 内容资料
└── docs/                   # 文档目录（分两类）
    ├── plans/              # 设计文档、复盘（纳入版本控制）
    │   └── archive/        # 已完结的计划文档归档
    └── personal/           # 个人文件（简历等，.gitignore 排除）
```

### 关键规则

1. **index.html 是唯一入口**，所有页面内容通过锚点导航，不新增独立页面
2. **静态资源统一放 `assets/`**，禁止在根目录放散落的 CSS/JS/图片
3. **工具类页面放 `tools/<tool-name>/`**，通过 iframe 嵌入主页面
4. **每个工具必须有 `README.md`**，说明功能、数据来源和维护方式
5. **内容资料放 `content/`**，与代码分离，方便独立编辑和管理
6. **设计文档放 `docs/plans/`**，纳入版本控制；**个人文件放 `docs/personal/`**，已在 `.gitignore` 中排除

---

## 二、命名规范

### 文件命名

| 类型 | 规则 | 示例 |
|------|------|------|
| HTML | 小写 kebab-case | `index.html` |
| CSS | 小写 kebab-case | `style.css`, `dashboard-dark.css` |
| JS | 小写 kebab-case | `main.js`, `interview.js` |
| Markdown | 小写 snake_case | `case_analysis.md` |
| 图片 | 小写 kebab-case + 用途 | `hero-bg.webp`, `icon-ai.svg` |

### CSS 命名

- **类名**：BEM 简化版（`block-element`），如 `hero-title`, `nav-link`
- **CSS 变量**：语义化前缀，如 `--bg-primary`, `--accent-blue`, `--text-secondary`
- **不使用**：ID 选择器做样式（ID 仅用于 JS 操作 和锚点）

### JS 命名

- **函数名**：camelCase，如 `renderCases()`, `switchTool()`
- **常量**：UPPER_SNAKE_CASE，如 `STATUS_LABELS`, `STORAGE_KEY`
- **DOM 元素 ID**：camelCase，如 `casesGrid`, `timerDisplay`

---

## 三、CSS 设计系统

### Design Tokens（在 `assets/css/style.css` 的 `:root` 中定义）

所有颜色、间距、圆角、字体 **必须使用 CSS 变量**，禁止硬编码色值。

```css
/* ✅ 正确 */
color: var(--text-primary);
background: var(--bg-card);

/* ❌ 错误 */
color: #f0f4ff;
background: rgba(255, 255, 255, 0.04);
```

### 当前 Token 体系

| 类别 | 变量前缀 | 完整列表 |
|------|----------|----------|
| 背景色 | `--bg-` | `--bg-primary`, `--bg-secondary`, `--bg-card`, `--bg-card-hover` |
| 强调色（实色） | `--accent-` | `--accent-blue`, `--accent-purple`, `--accent-cyan`, `--accent-green`, `--accent-clay`, `--accent-coral`, `--accent-yellow`, `--accent-red` |
| 强调色（Alpha·蓝） | `--accent-blue-NN` | `--accent-blue-06`, `-08`, `-10`, `-12`, `-15`, `-20`, `-25`, `-30`, `-35`, `-40`, `-50` |
| 强调色（Alpha·陶） | `--accent-clay-NN` | `--accent-clay-06`, `-10`, `-15`, `-25`, `-35` |
| 文字色 | `--text-` | `--text-primary`, `--text-secondary`, `--text-muted`, `--text-on-gradient` |
| 边框 | `--border` | `--border`, `--border-warm`, `--border-hover` |
| 渐变 | `--grad-` | `--grad-primary`, `--grad-text` |
| 阴影 | `--shadow-` | `--shadow-glow`, `--shadow-card` |
| 圆角 | `--radius-` | `--radius-sm`, `--radius-md`, `--radius-lg`, `--radius-xl` |
| 字体 | `--font` | `--font`（无衬线）, `--font-serif`（衬线） |
| 过渡 | `--transition` | 统一动画曲线 |

### 通用组件类

| 类名 | 用途 |
|------|------|
| `.glass-card` | 毛玻璃卡片：背景透明 + border + blur |
| `.btn` + `.btn-primary` / `.btn-ghost` | 按钮样式 |
| `.section-header` + `.section-label` + `.section-title` | 区块标题组 |
| `.reveal` + `.visible` | 滚动入场动画 |
| `.grad-text` | 渐变文字 |
| `.container` | 内容最大宽度容器 |
| `.prediction-item` + `.expanded` | 观点折叠卡片（见下方） |
| `.expand-btn-link` | 支撑材料链接/按钮（a 或 button 均可） |

### 页面视觉复核

- 任何会改变页面可见结果的修改（新增或替换 UI 图标、布局与间距、字体与颜色、状态反馈、图表、图片、响应式样式等）完成后，必须在本地页面运行，并使用具备图像理解能力的视觉模型审查真实截图；不能只依赖 DOM、文本或静态代码检查。
- 审查至少覆盖受影响的默认状态和可交互状态，确认图标位置与含义、对齐、层级、文字溢出、触控/点击区域，以及关键视口下的布局是否合理。修改既有 UI 时，在条件允许时使用同一页面与视口做改前/改后对照；发现问题后修正并重新截图确认。
- 交付说明必须记录已审查的页面（URL 或本地路径）、视口和状态，以及结论；截图本身无需作为仓库资产提交，除非它是产品内容或测试基线。
- 纯文案、数据或不可见逻辑改动不强制截图；若页面已无法运行，应明确说明视觉复核未完成及原因。

### 观点折叠组件（`.prediction-item`）

「我的观点」区块使用折叠交互，默认收起只展示标题，点击展开详情。

**HTML 结构：**

```html
<div class="prediction-item" onclick="togglePrediction(this)">
    <!-- 始终可见的标题行 -->
    <div class="prediction-header">
        <span class="prediction-lead">核心判断一句话（≤30字）</span>
        <div class="prediction-meta">
            <span class="prediction-date">2026.03</span>
            <span class="prediction-label">标签名</span>
            <span class="prediction-toggle">▾</span>
        </div>
    </div>
    <!-- 折叠详情体（默认 max-height:0） -->
    <div class="prediction-body">
        <div class="prediction-body-inner">
            <p class="prediction-text">完整论述...</p>
            <!-- 可选：支撑材料 -->
            <div class="prediction-expand">
                <a class="expand-btn-link" href="..." target="_blank"
                   onclick="event.stopPropagation()">📝 思考碎片：标题 →</a>
                <button class="expand-btn-link"
                        onclick="event.stopPropagation();openTool('id')">🛠 工具：名称 →</button>
            </div>
        </div>
    </div>
</div>
```

**规则：**
- `togglePrediction(this)` 挂在最外层容器，切换 `.expanded` class
- 所有内部可点击元素（链接、按钮）必须加 `event.stopPropagation()` 阻止冒泡
- 支撑材料格式：思考碎片 `📝 思考碎片：标题 →`，工具 `🛠 工具：名称 →`
- 没有合适资源时无需补支撑材料，留空即可

---

## 四、新工具接入规范

当需要添加新工具时，遵循以下步骤：

### 1. 创建工具目录

```text
tools/
└── <new-tool>/
    ├── README.md     # 必须：工具说明文档
    ├── index.html    # 工具主页面（可独立运行）
    ├── style.css     # 工具私有样式（可选）
    ├── script.js     # 工具私有脚本（可选）
    └── data/         # 数据文件目录（可选，内容驱动型工具用）
        └── *.json
```

### 2. 每个工具的 README.md 模板

```markdown
# 工具名称

## 功能描述
一句话说明这个工具做什么。

## 数据来源
说明数据从哪来、如何更新。

## 文件结构
列出本工具包含的文件及各自用途。

## 维护指南
如何添加新内容、修改配置等。
```

### 2. 在 index.html 中注册直链卡片

主页工具区采用 `works-list` 直链卡片模式，分两组：PM 作品（上）、信息工具（下）。在对应分组的 `<div class="works-list">` 中追加：

```html
<a class="works-item" href="tools/<name>/index.html" target="_blank">
  <span class="works-icon">🎯</span>
  <div class="works-body">
    <span class="works-title">工具名称</span>
    <span class="works-desc">一句话描述，突出核心能力</span>
  </div>
  <span class="works-arrow">↗</span>
</a>
```

### 3. 设计原则

- 工具必须可独立运行（直接打开 `tools/<name>/index.html`）
- 数据使用 `localStorage`，Key 格式：`qiuzhi_<tool>_v<version>`
- 工具页面内部样式自包含，不依赖主页面 CSS

---

## 五、数据存储规范

| 工具 | localStorage Key | 数据格式 |
|------|------------------|----------|
| 求职追踪 Dashboard | `qiuzhi_jobs_v1`, `qiuzhi_todos_v1`, `qiuzhi_notes_v1` | JSON Array / String |
| 面试练习器 | （暂无持久化，未来可加）| - |

### 规则

- Key 命名：`qiuzhi_<模块>_<版本>`（新工具遵守此格式）
- 所有数据存 `localStorage`，不依赖后端
- 敏感信息（手机号、身份证）**不得** 存入 localStorage
- 有持久化需求的工具须提供导出/导入 JSON 备份功能，防止浏览器清缓存丢失数据

---

## 六、Git 提交规范

### Commit 格式

```
<type>: <简短描述>

type 可选值：
- feat:     新功能
- fix:      修复
- style:    样式调整（不影响逻辑）
- refactor: 重构
- docs:     文档
- chore:    杂项（构建、依赖、配置）
```

### 示例

```
feat: 添加面试练习器分类筛选功能
style: 统一 Dashboard 为暗色主题
docs: 更新 README 项目结构说明
refactor: 迁移文件到 assets/ 目录结构
```

---

## 七、GitHub 与本地文件边界

完整分类表和例外处理见 `docs/repository-policy.md`。核心原则：

- 决定线上结果、可复现开发、测试验证、项目规范和共享上下文的文件必须提交。
- 密钥、个人隐私、本机路径、本机权限、IDE 状态、依赖缓存、临时预览、备份、Worktree 和 stash 只留本地。
- `.agents/skills/` 是项目自定义 Skill 唯一编辑源，已在 AGENTS.md 登记的项目 Skill 必须提交；第三方设计 Skill 由 `skills-lock.json` 管理，其本机安装产物不提交。`.claude/skills/` 中的项目自定义兼容副本必须同步提交且内容一致。
- `*.local.js`、`.env*`、`.claude/settings.local.json` 和 `docs/personal/` 永远不得提交；只提交脱敏的示例配置。
- 线上直接读取的生成物（博客 HTML、`robots.txt`、`sitemap.xml`、`feed.xml`）必须提交，不能仅保留生成脚本。
- 无法归类的文件默认不提交；确需新增例外时，先同步修改 `docs/repository-policy.md`、`.gitignore` 和自动检查。

提交前运行：

```powershell
node scripts/check-repository-policy.js
git status --short
```

禁止使用 `git add -f` 绕过边界规则。停止跟踪已经进入 GitHub 的本地专用文件、修改 `.github/workflows/` 或执行 `git push` 前，仍须按 HITL 规则获得用户确认。

### GitHub 推送网络排查

- 本地 `git commit` 成功但 `git push` 报 `Failed to connect to github.com port 443`、`Recv failure: Connection was reset` 时，通常是 **Git CLI 网络链路问题**，不是 GitHub 权限问题。
- 先检查状态：`git status --short --branch`。若显示 `main...origin/main [ahead 1]`，说明本地提交已存在，只是还没推到远端。
- 若浏览器能访问 GitHub，但 Git CLI 不能访问，优先检查本机代理。常见 Clash Verge/Mihomo 端口如 `127.0.0.1:7897`。
- 可用临时代理推送，不改全局 Git 配置：
  ```bash
  git -c http.proxy=http://127.0.0.1:7897 -c https.proxy=http://127.0.0.1:7897 push origin main
  ```
- 在 Codex 受限环境中，若代理 `ls-remote` 能读取远端，但 `push` 无输出退出，或 Git Credential Manager 报 `Unable to persist credentials with the 'wincredman' credential store`，说明网络已通、失败点在 Windows 凭据访问。应在用户确认后使用系统级执行权限重试同一条临时代理命令；不得改用明文凭据存储、向用户索要 Token，或修改全局 Git 代理。
- 若系统级授权在命令启动前报 `Unknown parameter: input[...].namespace`，这是 Codex 授权审查通道故障，不是仓库或 GitHub 配置问题。停止重复尝试，重启 Codex 并直接以本仓库为工作区恢复任务，再重新核对 `ahead` 状态后推送。
- 没有已配置 SSH key 时，不把 SSH 作为 HTTPS 推送失败的自动回退方案。
- 推送成功后确认：`git status --short --branch` 不再显示 ahead，`git log -1 --oneline --decorate` 中应同时出现 `HEAD -> main, origin/main`。
- GitHub Pages 发布还需验证线上结果：文章 URL 返回 HTTP 200，且页面正文或标题包含本次文章的唯一标题。远端分支同步不等于页面已刷新完成。

---

## 八、博客内容规范

### 数据文件
- 博客元数据统一存放在 `tools/blog/data/posts-meta.json`（单一来源）
- 主页和列表页都通过 `fetch` 读取，**不得**在 HTML 内联重复的文章数组
- `posts-meta.json` 是文章元数据的单一来源；新增文章时先添加元数据，再由生成脚本创建 HTML 和搜索发现资产
- 博客正文源稿优先维护在 `docs/blog/<slug>.md`；新文章必须同时提交 Markdown 源稿和 `tools/blog/posts/<slug>.html` 发布物。历史文章可能存在 HTML 与 Markdown 不一致，禁止批量从旧 Markdown 重新生成并覆盖已发布 HTML

### posts-meta.json 字段规范

| 字段 | 类型 | 说明 |
|------|------|------|
| slug | string | 文件名不含 .html，唯一标识符，kebab-case |
| date | string | 格式 `YYYY.MM` |
| title | string | 完整标题 |
| summary | string | 1-2 句自然摘要：说明对象/问题、核心判断及关键机制或边界（用于搜索和主页展示） |
| tags | string[] | 细粒度标签，见 WRITING_GUIDE.md 标签库 |
| topics | string[] | 话题领域标签，见 WRITING_GUIDE.md 标签库 |
| concepts | string[] | 4-7 个具体检索概念：关键对象、机制、产品/公司或层级；不用于前台、SEO 或静态关联 |
| category | string | 正式大分类：技术 / 产品 / 商业 / 行业；生活仅为历史兼容值，不作为当前维护中的正式分类 |
| url | string | 相对于 `tools/blog/` 的路径，如 `posts/xxx.html` |
| relations | object[]（可选） | 新文章单向指向较早文章的强关系；仅 `builds_on` / `revises` / `companion`，target 必须存在且不能自引或重复 |

`concepts` 只用于历史语义召回，不能推导显式关系或前端推荐。文章页「继续阅读」从中央 metadata 动态计算：强关系优先，旧文自动反向显示后续延展/修正；未来关系不得回写历史正文。

### 历史文章两阶段检索

- 按 `tools/blog/WRITING_GUIDE.md` 的「历史博客滚动检索与复用」执行：完整读取 `posts-meta.json` 的 `title`、`summary`、`concepts`、`topics`、`tags` 与 `category` 形成高相关/潜在相关/弱相关候选池；无固定候选数量上限，只有论点、机制、边界、案例或大纲出现实质变化时才滚动重搜，正式大纲前再做最终覆盖扫描。
- 编辑和生成仍以 `docs/blog/<slug>.md` 为源并生成 `tools/blog/posts/<slug>.html`；判断历史发表事实、引用资格或观点冲突时，正文按“线上正式页 → 仓库 HTML → Markdown”读取。禁止为了检索而批量重新生成或补写历史源稿。
- 命中元数据不等于应引用。只有核心问题、因果机制、观点延伸/修正、可复用框架、直接证据或读者需要理解的观点连续性成立时，才在新文章中引用旧文；共享关键词、分类、公司或模型名称，以及仅为增加内链的需求均不足以构成引用理由。

### 搜索元数据与发现资产
- `posts-meta.json` 仍是文章 `title`、`summary`、`url` 的单一来源；canonical、标准 description、JSON-LD、RSS 与 sitemap 由脚本生成，**不得**在文章里手工复制域名或维护重复数据源。
- 新文章发布流程：先更新 `posts-meta.json`（包括 `concepts`）→ 在 `docs/blog/<slug>.md` 保存源稿 → `node tools/blog/generate-post.js <source.md> <output.html>` → `node scripts/generate-search-assets.js --write` → `node scripts/check-search-foundation.js`。
- 未来更换搜索资产与自动生成页面 head 使用的域名，只修改 `scripts/site-config.js`，再运行 `node scripts/generate-search-assets.js --write`；该命令会同步入口页、文章 head、`robots.txt`、`sitemap.xml` 与 `feed.xml`。正文中的显式链接不在生成范围内，仍需按内容语义单独核对。
- 现有元数据只有月份，不伪造精确 `pubDate`、`datePublished` 或 `dateModified`。
- Search Console、Bing Webmaster、自定义域名和账号验证 token 属于后续人工步骤；`robots.txt` 当前不区分 GPTBot 等 crawler。

### 分类原则
- **技术**：回答「为什么能工作」；适用于架构设计、工程实现、技术选型、模型机制与训练/推理/评测机制。
- **产品**：回答「产品应该怎么做」；适用于 PM 决策框架、产品分析、场景判断、边界划分与功能设计。
- **商业**：回答「谁付钱、怎么赚钱、值多少钱、买还是建」；适用于商业模式、定价、收入、成本、TCO、采购经济性、估值/TAM、单位经济、Build vs Buy、护城河与价值分配。
- **行业**：回答「这个领域正在怎么变」；适用于产业/职业结构、市场演进、跨公司厂商路线、生态与标准、组织形态与行业级竞争重心迁移。
- **生活**：个人成长、工作方法、读书笔记；仅为历史兼容值，不作为当前维护中的正式博客分类。
- **判断原则**：核心内容决定分类，叙事视角不决定分类。具体产品判断仍归「产品」；竞争叙事下的技术机制仍归「技术」；收入、成本、采购、估值或护城河为核心仍归「商业」。

### 目录导航
- 目录服务于读者建立论证地图，不是正文标题的逐条镜像：所有核心 `h2` 作为一级目录；只有可独立跳转的关键 `h3` 才作为可折叠二级项。
- 参考资料、附录和协作要点等辅助区块默认不展开二级目录，避免与正文论证争夺侧栏注意力。
- 参考资料是默认收起的辅助信息层：标题按钮显示“展开 N 条来源”，让读者先看到其后的「继续阅读」；点击、键盘操作或通过目录/URL 锚点跳至该标题时才展开全部来源。语义结构由文章维护，紧凑字号、行距、链接状态、展开状态和浅深色呈现统一由 `tools/blog/article-runtime.js` 维护；不得为历史文章批量重写正文或在新文章复制局部样式。
- 目录文字可压缩正文标题，但必须保留同一核心概念；正文使用一级编号时，目录必须保留相同编号。详细结构和交互规范见 `tools/blog/WRITING_GUIDE.md`。
- 双栏文章的返回入口使用 `.top-bar { position: sticky; top: 16px; }`；桌面端 `.toc-wrap` 使用 `top: 72px`，为该入口留出间距。小于 800px 时目录隐藏、顶部入口改为 `top: 8px`。

### 博客双主题规范
- 列表页和文章页 CSS 均**自包含**（不依赖 style.css 变量名）
- **列表页**：`:root`（浅色默认）+ `[data-theme="dark"]`（深色覆盖），切换按钮在左侧导航栏底部
- **文章页**：`:root`（深色默认）+ `[data-theme="light"]`（浅色覆盖），自动同步列表页设置（无独立切换按钮）
- 主题状态持久化到 `localStorage` key：`blog_theme`（`'dark'` = 深色，`''` = 跟随系统浅色）
- 列表页初始化逻辑：先读 localStorage → 无则读 `prefers-color-scheme`
- 文章页初始化逻辑：读取 `blog_theme`，`'dark'` 则深色，否则浅色
- CSS 变量命名体系：`--text-1/2/3`、`--clay`、`--clay-soft`、`--font-serif`（详见 WRITING_GUIDE.md）

### 本地开发注意
- `fetch` 在 `file://` 协议下因 CORS 失败，需用 HTTP server：`python -m http.server 8080`

## 九、公开内容可信度与生成物规范

1. **静态客户端不承载服务端秘密**：公开静态文件和 workflow 不得把 Secret 注入浏览器可读取的产物；发现后先用只读检查记录，架构修复进入有 HITL 的安全 Track。
2. **不可信文本不直接注入 HTML**：外部输入、模型输出和远端数据进入 DOM 前必须追踪来源；优先 `textContent` 或 DOM API，确需 HTML 时使用经过审查的 allowlist。
3. **公开指标必须可解释**：任何数字指标必须声明 `kind`、定义、来源和日期；`target`、`proxy`、`offline-measured`、`production-result`、`external-research` 不得混用。
4. **Mock 边界前置**：Demo 必须在首次交互位置明确真实部分、Mock 部分和限制，不能把脚本输出、示例数据或目标值表述为生产结果。
5. **生成物必须可检查**：每个公开生成物应有唯一源、默认无写入的 `--check` 路径和受控替换流程；不得通过批量重生覆盖历史发布物。
6. **Skill 创建门槛**：只有已经重复至少三次、步骤稳定且可复用的流程才创建新项目 Skill；其余经验先留在 handoff 的候选区。

## 十、Skill 管理规范

### 目录结构

```
.agents/skills/
├── <name>/
│   └── SKILL.md        # canonical source：含 frontmatter 的 skill 定义
└── ...
.claude/skills/         # Claude 兼容层，优先使用 Junction
skills-lock.json        # 系统级 skill 哈希锁（不要手动编辑）
```

### SKILL.md frontmatter 格式

```markdown
---
name: skill-name
description: 一句话描述，会显示在 Skill 列表里，要准确反映触发场景
type: workflow
---

# Skill 标题

...
```

### 关键规则

1. **目录结构固定**：`<name>/SKILL.md`，不允许根目录裸 `.md` 文件
2. **frontmatter 必须完整**：缺少 `name`、`description` 或 `type` 时 skill 可能无法被正确识别
3. **路径兼容 Windows**：shell 命令中禁止 `/tmp`，统一用项目内路径（如 `tools/.design-tmp/`）
4. **系统级 skill 不手动改**：`adapt/animate/audit` 等 17 个 impeccable skill 由 `skills-lock.json` 管理
5. **skill 与规范同步**：新增规范后，检查相关 skill 是否覆盖（反之亦然）；变更时同步更新 CLAUDE.md 的「Skill 管理」表格

### 新增项目级 Skill 流程

1. 在 `scripts/repository-policy.json` 的 `projectSkills` 中登记名称
2. 创建 `.agents/skills/<name>/SKILL.md`，写完整 frontmatter + 内容
3. 运行 `powershell -ExecutionPolicy Bypass -File scripts/sync-agent-context.ps1 -Write` 生成或更新 `.claude/skills/` 兼容副本
4. 同步更新 AGENTS.md 和 CLAUDE.md 的「Skill 选择树」与「Skill 管理」表格
5. 运行 `node scripts/check-repository-policy.js` 和只读的 `scripts/sync-agent-context.ps1` 检查

---

## 十一、待办：未来规范扩展

- [ ] 响应式断点标准化（目前仅 768px 一个断点）
- [ ] 图片资源优化规范（WebP 格式、尺寸限制）
- [ ] 无障碍可访问性规范（ARIA 标签、键盘导航）
- [ ] 扩展部署目标规范（当前 GitHub Pages 已按 `docs/repository-policy.md` 管理）
