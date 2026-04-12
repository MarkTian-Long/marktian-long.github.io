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

| 类别 | 变量前缀 | 示例 |
|------|----------|------|
| 背景色 | `--bg-` | `--bg-primary`, `--bg-card` |
| 强调色 | `--accent-` | `--accent-blue`, `--accent-purple` |
| 文字色 | `--text-` | `--text-primary`, `--text-secondary` |
| 边框 | `--border` | `--border`, `--border-hover` |
| 渐变 | `--grad-` | `--grad-primary`, `--grad-text` |
| 圆角 | `--radius-` | `--radius-sm`, `--radius-lg` |
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

### 2. 在 index.html 中注册 Tab

```html
<!-- 在 tool-tabs div 中添加新 Tab 按钮 -->
<button class="tool-tab" id="tab-<name>" onclick="switchTool('<name>')">
  🎯 工具名称
</button>

<!-- 添加对应的 Panel -->
<div class="tool-panel hidden" id="panel-<name>">
  <div class="dashboard-wrapper reveal">
    <div class="dashboard-topbar">
      <span class="dashboard-label">描述文字</span>
      <a href="tools/<name>/index.html" target="_blank"
         class="btn btn-ghost dashboard-open-btn">↗ 独立窗口打开</a>
    </div>
    <iframe src="tools/<name>/index.html"
            class="dashboard-iframe"
            loading="lazy"></iframe>
  </div>
</div>
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

## 七、博客内容规范

### 数据文件
- 博客元数据统一存放在 `tools/blog/data/posts-meta.json`（单一来源）
- 主页和列表页都通过 `fetch` 读取，**不得**在 HTML 内联重复的文章数组
- 新增文章只需在 `posts-meta.json` 头部追加条目，无需改动 HTML

### posts-meta.json 字段规范

| 字段 | 类型 | 说明 |
|------|------|------|
| slug | string | 文件名不含 .html，唯一标识符，kebab-case |
| date | string | 格式 `YYYY.MM` |
| title | string | 完整标题 |
| summary | string | 一句话摘要（用于搜索和主页展示） |
| tags | string[] | 细粒度标签，见 WRITING_GUIDE.md 标签库 |
| category | string | 大分类：`技术` / `产品` / `商业` / `生活` |
| url | string | 相对于 `tools/blog/` 的路径，如 `posts/xxx.html` |

### 分类原则
- **技术**：架构设计、工程实现、技术选型、模型机制
- **产品**：PRD 思路、PM 决策框架、用户研究、功能设计
- **商业**：市场分析、竞争格局、商业模式、行业趋势
- **生活**：个人成长、工作方法、读书笔记

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

---

## 九、Skill 管理规范

### 目录结构

```
.claude/skills/
├── <name>/
│   └── SKILL.md        # 必须：含 frontmatter 的 skill 定义
└── ...
skills-lock.json        # 系统级 skill 哈希锁（不要手动编辑）
```

### SKILL.md frontmatter 格式

```markdown
---
name: skill-name
description: 一句话描述，会显示在 Skill 列表里，要准确反映触发场景
---

# Skill 标题

...
```

### 关键规则

1. **目录结构固定**：`<name>/SKILL.md`，不允许根目录裸 `.md` 文件
2. **frontmatter 必须完整**：缺少 `name` 或 `description` 时 skill 可能无法被正确识别
3. **路径兼容 Windows**：shell 命令中禁止 `/tmp`，统一用项目内路径（如 `tools/.design-tmp/`）
4. **系统级 skill 不手动改**：`adapt/animate/audit` 等 17 个 impeccable skill 由 `skills-lock.json` 管理
5. **skill 与规范同步**：新增规范后，检查相关 skill 是否覆盖（反之亦然）；变更时同步更新 CLAUDE.md 的「Skill 管理」表格

### 新增项目级 Skill 流程

1. 创建 `.claude/skills/<name>/SKILL.md`，写 frontmatter + 内容
2. 在 CLAUDE.md「Skill 选择树」中添加触发场景行
3. 在 CLAUDE.md「Skill 管理」表格中添加一行（含最近更新日期）

---

## 八、待办：未来规范扩展

- [ ] 响应式断点标准化（目前仅 768px 一个断点）
- [ ] 图片资源优化规范（WebP 格式、尺寸限制）
- [ ] 无障碍可访问性规范（ARIA 标签、键盘导航）
- [ ] 部署规范（GitHub Pages / Vercel / Netlify）
