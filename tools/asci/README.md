# ASCI 科研任务执行系统 Demo

## 功能描述
模拟 ASCI（Artificial Science Intelligence）科研 Agent OS 的任务执行全流程：
文献综述任务从关键词提取 → 数据库检索 → 摘要筛选（Human Checkpoint）→ 全文精读 → 综述生成，
展示风险分级标注、可信度评估、Human-in-the-Loop 等核心产品设计能力。

## 数据来源
纯 Mock 数据，无 API 调用，所有数据内嵌于 index.html 的 JS 常量中。

## 文件结构
- `index.html` — 单文件完整实现（Screen 1/2/3 三屏）

## 面试题覆盖
- Q1：风险标注（低/中/高 + 颜色体系）
- Q3：可信度评分（三维度条形图）
- Q4：Human-in-the-Loop（Step 3 Checkpoint 内联卡片）

## 维护指南
修改 Mock 数据：编辑 index.html 中 MOCK_STEPS、MOCK_RESULT 常量。
新增演示路径：复制文献综述卡片逻辑，接入新的步骤/日志数据集。
