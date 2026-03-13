# 待办事项

> 最后更新：2026-03-13

## 下次开工

- [ ] AI Insights 工具内容填充（`tools/ai-insights/` 目录已有但内容空）
  - 填充你对 AI 产品的分析洞察数据（`tools/ai-insights/data/products.json`）
  - 验证工具页面能正常展示

## 代码质量（低优先级，空闲时处理）

- [ ] style.css 中硬编码色值清理
  - `#fff` 3处（行约134、554、943）→ 改为 `var(--text-primary)`
  - `#f5f5f7` 1处（行约1626）→ 疑似浅色主题残留，确认后删除
  - 大量 `rgba(79,143,255,...)` → 考虑提取为 `--accent-blue-10` 等 alpha 系列变量
- [ ] main.js casesData 中硬编码色值与 CSS 变量重复，后续统一

## 持续运营

- [ ] 定期更新 AI Insights 内容（建议每周1篇 AI 产品拆解）
- [ ] 简历上补充网站链接：https://marktian-long.github.io
