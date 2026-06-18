# Impeccable 设计规则精华

来源：`.agents/skills/impeccable/` 设计知识库，提炼为新项目可直接复用的规则清单。

---

## 颜色规则

### 必须做
- 用 OKLCH 而不是 HSL（感知均匀，等步长视觉效果一致）
- 中性色（背景/边框）必须向品牌主色微偏（chroma 0.005~0.015），创造潜意识连贯
- 按 60-30-10 分配视觉权重：60% 中性面 / 30% 次要文字边框 / 10% 强调色
- 深色模式：用**更浅的表面**制造层次，而不是用阴影（光源逻辑相反）

### 禁止
- 纯黑 `#000`、纯白 `#fff`（自然界不存在）
- 灰色文字叠在彩色背景上（视觉发灰）
- `cyan + dark背景 + 紫蓝渐变`（AI 标准配色，立刻被识别）
- 渐变文字（`background-clip: text`）——用纯色代替
- 强调色到处用（稀缺性是它力量的来源）

---

## 排版规则

### 必须做
- 5 级字号，相邻级别比例 ≥ 1.25x（字号差太小 = 层级模糊）
- 大标题用 `letter-spacing` 负值压缩（-0.02em ~ -0.03em）
- 全大写小标签用 `letter-spacing` 正值拉宽（0.1em ~ 0.2em）
- 正文 `max-width: 65-75ch`（防止一行过长眼睛追踪困难）
- 暗色背景浅色文字：行高 +0.05~0.1（感知字重更轻需要更多呼吸空间）

### 禁止
- 以下字体（过度流行已成 AI 默认）：
  Inter / DM Sans / Plus Jakarta Sans / Outfit / Fraunces / Newsreader /
  Playfair Display / Cormorant / Space Mono / Space Grotesk / Instrument Sans
- 一个项目用超过 2-3 个字体家族
- 大段文字全大写
- 字号相差 1-2px 却代表不同层级

---

## 布局与间距规则

### 必须做
- 4pt 间距基础单位：4, 8, 12, 16, 24, 32, 48, 64, 96
- 用 `gap` 代替 margin 做兄弟元素间距（避免 margin collapse）
- 间距要有节奏：标题上方留更多空间，体现其重要性
- 响应式网格：`repeat(auto-fit, minmax(280px, 1fr))` 无断点自适应
- 容器查询（@container）用于组件级响应，视口查询用于页面布局

### 禁止
- 所有卡片同样大小、同样结构（无限格栅模板）
- 所有间距相同（无节奏）
- 卡片嵌套卡片（加剧视觉噪音，用分割线/字体/间距替代）
- 全部居中（左对齐 + 不对称布局更有设计感）
- body text 超过 ~80 字符宽度

---

## 交互规则

### 必须做
- 8 个交互状态都要设计：Default / Hover / Focus / Active / Disabled / Loading / Error / Success
- 用 `:focus-visible` 区分鼠标焦点和键盘焦点
- 表单字段：always 用 `<label>`，不能只靠 placeholder
- 触控目标 ≥ 44×44px
- 下拉菜单：避免 `position:absolute` + `overflow:hidden` 父容器（会被裁剪）

### 禁止
- `outline: none` 不配替代方案
- Modal 作为懒人方案（优先考虑行内展开/抽屉/气泡）
- 使用颜色作为信息的唯一传达手段（无障碍问题）

---

## 动效规则

### 必须做
- 只 animate `transform` 和 `opacity`（其他属性触发重排）
- 高度动画改用 `grid-template-rows: 0fr → 1fr`
- 时长：微交互 100-150ms / 状态变化 200-300ms / 布局变化 300-500ms / 入场 500-800ms
- 退场 = 进场时长 × 75%
- 支持 `prefers-reduced-motion`

### 禁止
- Bounce / elastic easing（2015 年审美，现在显得业余）
- 到处加动画（动画疲劳，只留高价值时刻）
- 动画掩盖加载慢（要用 skeleton / optimistic UI）

---

## 文案（UX Writing）规则

### 必须做
- 按钮文字：动词 + 对象（"Create account" 不要 "Submit"）
- 错误信息三要素：发生了什么 / 为什么 / 怎么修
- 空状态：承认空 + 说明价值 + 提供行动
- 破坏性操作：说明数量（"Delete 5 items"）

### 禁止
- "OK" / "Yes" / "No" 类模糊按钮
- 错误信息责怪用户（"你输入错误" → "请输入有效的日期格式"）
- 错误信息用幽默（用户已经烦了）
- 同一概念多个词：Delete/Remove/Trash 选一个统一

---

## 综合「AI 感」检查

完成设计后问自己：

> 给不了解背景的人看，说"这是 AI 生成的"，他们会立刻相信吗？

如果会，找到以下问题的一个或多个修：

1. 调色板缺少个性（纯蓝 + 灰）
2. 字体太默认（Inter/DM Sans 等）  
3. 卡片全部等宽等高（模板化网格）
4. 到处都有 border-left 彩色条纹
5. 标题或数字用了渐变文字
6. 每个 section 标题都有 icon + 文字 + 说明文字的三段式结构
7. 阴影和圆角过于"安全"
8. 没有任何打破网格的装饰元素
