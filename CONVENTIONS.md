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
└── docs/                   # 个人文档（不纳入版本控制）
```

### 关键规则

1. **index.html 是唯一入口**，所有页面内容通过锚点导航，不新增独立页面
2. **静态资源统一放 `assets/`**，禁止在根目录放散落的 CSS/JS/图片
3. **工具类页面放 `tools/<tool-name>/`**，通过 iframe 嵌入主页面
4. **每个工具必须有 `README.md`**，说明功能、数据来源和维护方式
5. **内容资料放 `content/`**，与代码分离，方便独立编辑和管理
6. **个人文件放 `docs/`**，已在 `.gitignore` 中排除

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

## 七、待办：未来规范扩展

- [ ] 响应式断点标准化（目前仅 768px 一个断点）
- [ ] 图片资源优化规范（WebP 格式、尺寸限制）
- [ ] 无障碍可访问性规范（ARIA 标签、键盘导航）
- [ ] 部署规范（GitHub Pages / Vercel / Netlify）
