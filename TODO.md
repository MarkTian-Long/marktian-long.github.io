# 待办事项

> 最后更新：2026-03-30

## 下次开工

### AI 产品拆解（ai-insights）

- [ ] 用 `/analyze-product` 补充更多产品条目（当前约 9 条，建议扩充到 15+）
  - 优先补充：Gemini、GitHub Copilot、Runway、Figma AI、Replit AI 等
  - 执行方式：对话中输入 `/analyze-product 产品名`，Claude 联网采集后写入
- [ ] 为现有旧数据补充 keyMetrics / timeline / sources 字段

### ASCI Demo

- [ ] 补充"数据分析"和"假设生成"两条演示路径的 Mock 数据（当前只有"文献综述"路径完整）
- [ ] README 中补充 Q2（连续出错→人工介入）覆盖说明

### 持续运营

- [ ] 定期更新 AI Insights 内容（建议每周1篇 AI 产品拆解）
- [ ] 简历上补充网站链接：<https://marktian-long.github.io>

---

## 代码质量（低优先级）

- [x] style.css 中硬编码色值清理（2026-03-13 完成）
- [ ] main.js casesData 中硬编码色值与 CSS 变量重复，后续统一

---

## 已上线工具

| 工具 | 状态 | 说明 |
|------|------|------|
| ai-insights | ✅ 稳定 | 数据持续补充中 |
| trends | ✅ 稳定 | 自动爬取脚本就绪 |
| radar | ✅ 稳定 | 内容静态，偶尔手动更新 |
| stock | ✅ 稳定 | 6 Tab 完整，真实 LLM 调用 |
| esop-extractor | ✅ 稳定 | Mock Demo |
| asci | ✅ 上线 | 文献综述路径完整，另两条路径待补数据 |
| agent-hub | ✅ 上线 | 4 Tab 完整 |
| service-agent | ✅ 上线 | 真实 LLM 投诉链路，其余 Mock |
