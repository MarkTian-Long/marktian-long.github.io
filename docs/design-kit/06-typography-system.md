# 字体排版系统说明

## 本项目字体方案

**双字体策略**：无衬线（正文）+ 衬线（标题/装饰）

```css
--font:       'Source Sans 3', -apple-system, BlinkMacSystemFont, sans-serif;
--font-serif: 'Libre Baskerville', Georgia, serif;
```

- **Source Sans 3**：正文、UI 标签、按钮。亲和力强，可读性高
- **Libre Baskerville**：大标题、区块标题、Hero、引言斜体。赋予高级感

**Google Fonts 引入**（HTML `<head>` 中）：
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Source+Sans+3:wght@300;400;500;600;700&display=swap" rel="stylesheet">
```

## 字号体系（5 级）

| 级别 | 场景 | 尺寸 |
|------|------|------|
| Hero 标题 | 页面最大标题 | `clamp(3.5rem, 8vw, 6.5rem)` |
| 区块标题 | Section h2 | `clamp(1.8rem, 4vw, 2.8rem)` |
| Contact 标题 | 小页标题 | `clamp(2rem, 4.5vw, 3rem)` |
| 正文 | 段落文字 | `1rem / 0.95rem` |
| 辅助 | 时间戳/标签 | `0.75rem / 0.72rem` |

**原则**：标题用 `clamp(min, fluid, max)`，正文用固定 rem（不受视口变化影响）。

## 字重用法

| 字重 | 场景 |
|------|------|
| 700 / 800 | 标题、大数字 |
| 600 | 卡片标题、导航项、按钮 |
| 500 | 次要标签、tab |
| 400 | 正文 |
| 300 | 淡化信息（慎用） |

## 关键 CSS 规则

```css
/* 标题 letter-spacing 压缩（大字号必须） */
.hero-title     { letter-spacing: -0.03em; }
.section-title  { letter-spacing: -0.01em; }
.contact-title  { letter-spacing: -0.02em; }

/* 标签 letter-spacing 拉宽（全大写小字号必须） */
.section-label  { letter-spacing: 0.20em; }
.hero-eyebrow   { letter-spacing: 0.18em; }

/* 数字等宽（数据表格/计时器） */
.timer-display { font-variant-numeric: tabular-nums; }

/* 正文最大行宽（防止一行过长） */
.section-desc { max-width: 500px; }
.hero-sub     { max-width: 500px; }
```

## 新项目字体选择建议

**禁止使用以下字体**（过度流行，产生"AI 审美"感）：
- Inter / DM Sans / Plus Jakarta Sans / Outfit（无衬线过度流行）
- Fraunces / Newsreader / Playfair Display / Cormorant（衬线过度流行）
- Space Mono / Space Grotesk（等宽被滥用为"科技感"）

**选字流程**：
1. 写出 3 个描述品牌的具体词（不要用"现代""优雅"）
2. 把字体想象成一个实物：手写体标签、印刷机手册、杂志封面……
3. 去 Google Fonts / Pangram Pangram / Future Fonts 找
4. 如果找到的字体在你的"第一反应列表"里，继续找

**衬线 + 无衬线配对原则**：
- 在比例（proportion）、性格（personality）、结构（structure）上至少一个维度形成对比
- 不要配两个性格相似的字体（如两个几何无衬线）

## 行高规范

```
Hero 标题:  line-height: 1.05
区块标题:   line-height: (默认)
正文段落:   line-height: 1.6 ~ 1.7
引言/manifesto: line-height: (默认)
列表/标签:  line-height: 1.4 ~ 1.5
```

**规律**：字号越大行高越小；暗色背景上的浅色文字，行高要比正常值 +0.05~0.1。
