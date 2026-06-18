# Design Kit — qiuzhi 项目 UI 设计提炼包

从 qiuzhi 个人品牌站提炼的完整 UI 设计规范，供新项目借鉴复用。

## 文件列表

| 文件 | 内容 |
|------|------|
| `01-design-tokens.css` | 完整 CSS 变量体系（颜色/字体/间距/阴影/圆角） |
| `02-base-components.css` | 通用组件样式（按钮/卡片/导航/标签/标题组） |
| `03-layout-patterns.css` | 布局模式（Hero/Section/Grid/响应式） |
| `04-animation.css` | 动效系统（滚动入场/过渡曲线/常用 keyframe） |
| `05-color-system.md` | 颜色系统说明 + 使用规则 |
| `06-typography-system.md` | 字体排版系统说明 |
| `07-sop-design-workflow.md` | 设计→实现 SOP 流程 |
| `08-impeccable-rules.md` | impeccable 设计规则精华（禁忌 + 最佳实践）|
| `09-component-patterns.md` | 组件用法说明 + HTML 模板 |
| `10-index-reference.html` | 首页完整 HTML（真实参考，含结构/类名/锚点组织） |

## 快速开始

新项目可以这样使用：

1. 复制 `01-design-tokens.css` 的 `:root` 变量块到新项目 CSS 文件顶部
2. 按需引入 `02-base-components.css` 中需要的组件样式
3. 查阅 `07-sop-design-workflow.md` 了解设计实现流程
4. 查阅 `08-impeccable-rules.md` 在设计时避开 AI 审美陷阱
