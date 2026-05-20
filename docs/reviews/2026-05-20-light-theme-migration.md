# 深色→浅色主题迁移日志

**日期**：2026-05-20  
**操作人**：Claude（用户授权）  
**目标**：将 6 个深色工具统一改为浅色，清理 ESOP 双主题残留

---

## 改造范围

| 工具 | 文件 | 状态 |
|------|------|------|
| AI 产品拆解 | `tools/ai-insights/style.css` | ✅ 完成 |
| 前沿雷达 | `tools/radar/index.html` | ✅ 完成 |
| 热点快照 | `tools/trends/index.html` | ✅ 完成 |
| A股 AI 助手 | `tools/stock/index.html` | ✅ 完成 |
| 智能客服中台 | `tools/service-agent/index.html` | ✅ 完成（含 SVG 流程图节点色） |
| Agent 认知全景 | `tools/agent-hub/index.html` | ✅ 完成（含 4 个架构 SVG 图） |
| ESOP 字段提取 | `tools/esop-extractor/index.html` | ✅ 完成（:root 提升浅色值，删除双主题逻辑） |

---

## 浅色色系映射方案

所有工具统一使用以下浅色语义，与 ASCI 保持一致的基调：

| 语义 | 深色旧值（代表） | 浅色新值 |
|------|----------------|---------|
| 页面背景 | `#080c18` / `#0a0a0f` / `#0d0d14` | `#f8f9fc` |
| 表面/卡片背景 | `#0d1224` / `#13131a` / `#13131f` | `#ffffff` |
| 次级卡片 | `#1a1a2e` / `#111827` | `#f1f3f8` |
| 主边框 | `rgba(255,255,255,0.08)` | `rgba(0,0,0,0.08)` |
| hover 边框 | `rgba(79,143,255,0.4)` | `rgba(37,99,235,0.35)` |
| 主文字 | `#f0f4ff` / `#e8e8f0` / `#f0f0f8` | `#1e293b` |
| 次要文字 | `#8a95b5` / `#8888a0` | `#64748b` |
| 弱文字 | `#4a5270` / `#8888a0` | `#94a3b8` |
| overlay/遮罩 | `rgba(8,12,24,0.82)` | `rgba(248,249,252,0.92)` |

强调色（accent）保持各工具原有色相，仅调整为在浅色背景下可读的深版本：

| 工具 | 原 accent | 浅色 accent |
|------|----------|------------|
| ai-insights / stock / esop | `#4f8fff` | `#2563eb` |
| radar / trends | `#6366f1` | `#4f46e5` |
| agent-hub | `#63b3ed` | `#2563eb` |
| service-agent | `#4f8fff` | `#2563eb` |

---

## 改动详细记录

### 1. tools/ai-insights/style.css

**改动时间**：2026-05-20  
**改动内容**：`:root` 全部色系变量替换为浅色值

原始关键变量快照（用于复原）：
```css
--bg-primary: #080c18;
--bg-secondary: #0d1224;
--bg-card: rgba(255, 255, 255, 0.04);
--accent-blue: #4f8fff;
--accent-purple: #9b6dff;
--accent-cyan: #00d4ff;
--accent-green: #00e5a0;
--text-primary: #f0f4ff;
--text-secondary: #8a95b5;
--text-muted: #4a5270;
--border: rgba(255, 255, 255, 0.08);
--border-hover: rgba(79, 143, 255, 0.4);
--bg-card-2: rgba(255, 255, 255, 0.02);
--bg-card-3: rgba(255, 255, 255, 0.03);
--overlay-dark-50: rgba(0, 0, 0, 0.50);
--overlay-dark-60: rgba(0, 0, 0, 0.60);
--text-on-gradient: #ffffff;
/* Alpha 系列 */
--accent-blue-10: rgba(79, 143, 255, 0.10);
--accent-blue-12: rgba(79, 143, 255, 0.12);
--accent-blue-20: rgba(79, 143, 255, 0.20);
--accent-blue-25: rgba(79, 143, 255, 0.25);
--accent-purple-10: rgba(155, 109, 255, 0.10);
--accent-purple-12: rgba(155, 109, 255, 0.12);
--accent-purple-20: rgba(155, 109, 255, 0.20);
--accent-green-06: rgba(0, 229, 160, 0.06);
--accent-green-12: rgba(0, 229, 160, 0.12);
--accent-green-20: rgba(0, 229, 160, 0.20);
--accent-green-30: rgba(0, 229, 160, 0.30);
--accent-yellow-12: rgba(245, 158, 11, 0.12);
--accent-red-12: rgba(239, 68, 68, 0.12);
```

---

### 2. tools/radar/index.html

**改动时间**：2026-05-20  
**改动内容**：`<style>` 内 `:root` 色系变量替换

原始关键变量快照：
```css
--color-bg: #0a0a0f;
--color-surface: #13131a;
--color-border: rgba(255, 255, 255, 0.08);
--color-text: #e8e8f0;
--color-text-muted: #8888a0;
--color-accent: #6366f1;
--color-accent-light: rgba(99, 102, 241, 0.15);
--color-tag-bg: rgba(99, 102, 241, 0.12);
```

---

### 3. tools/trends/index.html

**改动时间**：2026-05-20  
**改动内容**：`<style>` 内 `:root` 色系变量替换，tab 激活态背景调整

原始关键变量快照：
```css
--color-bg: #0a0a0f;
--color-surface: #13131a;
--color-border: rgba(255, 255, 255, 0.08);
--color-text: #e8e8f0;
--color-text-muted: #8888a0;
--color-accent: #6366f1;
--color-accent-light: rgba(99, 102, 241, 0.15);
--color-tag-bg: rgba(99, 102, 241, 0.12);
/* tab hover 硬编码 */
.tab-btn:hover { background: rgba(255,255,255,0.04); }
.tab-btn.active { background: var(--color-bg); border-bottom-color: var(--color-bg); }
/* tag 硬编码 */
.tag { background: rgba(255,255,255,0.05); }
/* stat-gain 硬编码 */
.item-stat-gain { color: #4ade80; }
```

---

### 4. tools/stock/index.html

**改动时间**：2026-05-20  
**改动内容**：`:root` 色系变量替换，SVG/inline 硬编码色调整

原始关键变量快照：
```css
--bg: #080c18;
--bg-sec: #0d1224;
--card: rgba(255,255,255,0.04);
--card-hover: rgba(255,255,255,0.07);
--border: rgba(255,255,255,0.08);
--border-hover: rgba(79,143,255,0.4);
--accent: #4f8fff;
--accent-purple: #9b6dff;
--accent-cyan: #00d4ff;
--accent-green: #00e5a0;
--accent-red: #ef4444;
--text: #f0f4ff;
--text-sec: #8a95b5;
--text-muted: #4a5270;
```

---

### 5. tools/service-agent/index.html

**改动时间**：2026-05-20  
**改动内容**：`:root` 色系变量替换，SVG 流程图节点 fill 颜色调整

原始关键变量快照：
```css
--sa-bg: #080c18;
--sa-surface: #0d1224;
--sa-card: #111827;
--sa-border: rgba(255,255,255,0.08);
--sa-text: #f0f4ff;
--sa-muted: #8a95b5;
--sa-dimmed: #4a5270;
--sa-accent: #4f8fff;
--sa-hover: rgba(255,255,255,0.05);
/* SVG 节点 fill 硬编码 */
.fn-group.idle .fn-rect { fill: #111827; stroke: rgba(255,255,255,0.1); }
.fn-text { fill: #8a95b5; }
/* 连接线 */
.flow-line { stroke: rgba(255,255,255,0.1); }
```

---

### 6. tools/agent-hub/index.html

**改动时间**：2026-05-20  
**改动内容**：`:root` 色系变量替换，SVG/硬编码色调整

原始关键变量快照：
```css
--bg: #0d0d14;
--bg-card: #13131f;
--bg-card2: #1a1a2e;
--border: rgba(255,255,255,0.08);
--border-hover: rgba(99,179,237,0.4);
--text-primary: #f0f0f8;
--text-secondary: rgba(240,240,248,0.6);
--text-muted: rgba(240,240,248,0.4);
--accent: #63b3ed;
--accent2: #9f7aea;
--accent3: #68d391;
--accent-warn: #f6ad55;
```

---

### 7. tools/esop-extractor/index.html

**改动时间**：2026-05-20  
**改动内容**：`:root` 改为浅色值（原 `[data-theme="light"]` 的内容提升），删除 `[data-theme="light"]` 块，JS 主题监听逻辑简化（保留 iframe 通信但不再切换 dark）

原始 `:root` 快照：
```css
:root {
  --bg: #080c18; --bg-sec: #0d1224;
  --card: rgba(255,255,255,0.04); --card-hover: rgba(255,255,255,0.07);
  --border: rgba(255,255,255,0.08); --border-hover: rgba(79,143,255,0.4);
  --accent: #4f8fff; --accent-purple: #9b6dff; --accent-cyan: #00d4ff;
  --grad: linear-gradient(135deg, #4f8fff, #9b6dff);
  --text: #f0f4ff; --text-sec: #8a95b5; --text-muted: #4a5270;
  --green: #00e5a0; --yellow: #f59e0b; --red: #ef4444;
  --overlay: rgba(8,12,24,0.82); --overlay-modal: rgba(8,12,24,0.75);
}
[data-theme="light"] {
  --bg: #f5f4ed; --bg-sec: #f0eee6;
  --card: #faf9f5; --card-hover: #f0eee6;
  --border: #e8e6dc; --border-hover: rgba(201,100,66,0.4);
  --accent: #2563eb; --accent-purple: #7c3aed; --accent-cyan: #0891b2;
  --grad: linear-gradient(135deg, #2563eb, #7c3aed);
  --text: #141413; --text-sec: #5e5d59; --text-muted: #87867f;
  --green: #059669; --yellow: #d97706; --red: #dc2626;
  --overlay: rgba(245,244,237,0.88); --overlay-modal: rgba(245,244,237,0.80);
}
```

---

## 复原说明

若需复原任意工具，找到对应工具的「原始关键变量快照」，将 `:root { }` 内容替换回即可。  
全量复原可使用：`git diff HEAD` 查看所有改动，`git checkout -- <file>` 还原单文件。
