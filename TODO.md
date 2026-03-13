# 待办事项

> 最后更新：2026-03-14

## 下次开工

- [ ] 用 `/analyze-product` 补充更多产品条目（当前 9 条，建议扩充到 15+）
  - 优先补充：Gemini、GitHub Copilot、Runway、Figma AI、Replit AI 等
  - 执行方式：对话中输入 `/analyze-product 产品名`，Claude 联网采集后写入
- [ ] 为现有 8 条旧数据补充 keyMetrics / timeline / sources 字段（目前只 ChatGPT 有示范数据）

## 代码质量（低优先级，空闲时处理）

- [x] style.css 中硬编码色值清理（2026-03-13 完成）
  - `#fff` 3处 → 改为 `var(--text-on-gradient)`（新增变量）
  - `#f5f5f7` 1处 → 改为 `var(--bg-secondary)`（iframe 背景）
  - 大量 `rgba(79,143,255,...)` → 提取为 `--accent-blue-06` ~ `--accent-blue-50` alpha 系列变量
- [ ] main.js casesData 中硬编码色值与 CSS 变量重复，后续统一

## 持续运营

- [ ] 定期更新 AI Insights 内容（建议每周1篇 AI 产品拆解）
- [ ] 简历上补充网站链接：https://marktian-long.github.io
