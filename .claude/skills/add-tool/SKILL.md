---
name: add-tool
description: 按项目规范添加新的嵌入式工具模块。当用户要添加新功能页面、新工具到网站时使用。
---

# 添加新工具

用户想添加的工具：$ARGUMENTS

## 执行步骤

### 第一步：理解需求
先向用户确认：
1. 工具名称（英文，用于目录名，kebab-case）
2. 工具功能描述（一句话）
3. 数据来源（手动输入 / JSON 文件 / localStorage）
4. 是否需要图表（ECharts）

### 第二步：检查现有代码
读取以下文件，了解现有模式：
- `index.html`：找到 `tool-tabs` 和 `tool-panel` 区域，理解 Tab 注册方式
- `tools/dashboard/index.html`：作为工具页面的参考模板
- `assets/css/style.css`：获取可用的 CSS 变量列表

### 第三步：创建工具文件

创建目录结构：
```
tools/<tool-name>/
├── README.md      # 必须
├── index.html     # 工具主页面
└── script.js      # 工具逻辑（如果 JS 较多）
```

**README.md 必须包含**：功能描述、数据来源、文件结构、维护指南

**index.html 要求**：
- 必须可独立在浏览器打开运行
- 样式自包含（不依赖主页面 CSS）
- 但风格与主页面一致（暗色系、毛玻璃卡片、同款字体）
- 使用 CSS 变量时需在工具内部 `:root` 重新定义

**localStorage Key 格式**：`qiuzhi_<toolname>_v1`

### 第四步：在 index.html 注册

在 `tool-tabs` div 中添加 Tab 按钮：
```html
<button class="tool-tab" id="tab-<name>" onclick="switchTool('<name>')">
  [合适的 emoji] 工具名称ed
</button>
```

在对应位置添加 Panel：
```html
<div class="tool-panel hidden" id="panel-<name>">
  <div class="dashboard-wrapper reveal">
    <div class="dashboard-topbar">
      <span class="dashboard-label">工具描述</span>
      <a href="tools/<name>/index.html" target="_blank"
         class="btn btn-ghost dashboard-open-btn">独立窗口打开</a>
    </div>
    <iframe src="tools/<name>/index.html"
            class="dashboard-iframe"
            loading="lazy"></iframe>
  </div>
</div>
```

### 第五步：验证清单
完成后逐项确认：
- [ ] `tools/<name>/README.md` 存在且内容完整
- [ ] 工具页面可独立打开（不依赖主页面）
- [ ] index.html 中 Tab 按钮和 Panel 都已添加
- [ ] 没有硬编码颜色值（使用 CSS 变量）
- [ ] localStorage Key 符合命名规范

### 第六步：告知用户
说明创建了哪些文件，如何在浏览器中查看效果。
