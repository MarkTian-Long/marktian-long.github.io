# ASCI Bug 复盘：点击「上一步」后主内容区空白

**日期**：2026-04-01  
**模块**：`tools/asci/index.html`  
**严重程度**：中（功能性 Bug，影响核心交互体验）

---

## 问题描述

在 ASCI 文献综述 Demo 中，用户点击「← 上一步」回退到上一个步骤后，中列主内容区（`mainContent`）一片空白，没有展示上一步的结果卡片。

## 根因分析

### DOM 生命周期认知错误

**核心假设（错误）**：开发时认为每个步骤的结果卡片（`stepResult_N`）会持久存在于 DOM 中，`doBack` 时只需 `getElementById` 找到它再移入 `mainContent` 即可。

**实际行为**：`renderStepResult(stepN)` 在渲染新步骤结果时，第一步是 `main.innerHTML = ''`，这会**清除整个 `mainContent`** 的内容，包括上一步的卡片。卡片并没有被保存在其他地方，就此从 DOM 消失。

```js
// renderStepResult 每次执行都会清空主内容区
var main = document.getElementById('mainContent');
main.innerHTML = '';       // ← 上一步的卡片在这里被销毁
main.appendChild(card);   // ← 放入新卡片
```

```js
// doBack 中的恢复逻辑永远找不到目标卡片
var prevCard = document.getElementById('stepResult_' + targetStep);
if (prevCard) {            // ← prevCard 始终为 null，条件永不满足
    main.innerHTML = '';
    main.appendChild(prevCard);
}
// 结果：主内容区保持空白
```

### 次要问题：置信度历史重复写入

`doBack` 调用了 `updatePanel(targetStep, 'done')`，该函数内包含 `confHistory.push(...)` 逻辑，会向置信度折线图重复追加同一步骤的数据点，导致图表异常。

## 修复方案

**核心思路**：不再尝试「找回」已销毁的卡片，而是直接调用 `renderStepResult(targetStep)` 重新渲染。

```js
// 修复后的 doBack else 分支
} else {
    // 不调用 updatePanel（避免重复追加 confHistory）
    // 手动更新进度条和 HITL 状态
    document.getElementById('progressBar').style.width = (targetStep / 5 * 100) + '%';
    document.getElementById('progressText').textContent = '步骤 ' + targetStep + ' / 5';
    updateHitlStatus(targetStep);
    // ...按钮状态更新...

    // 直接重新渲染上一步结果（从 stepUserData 读取，不丢失用户决策）
    renderStepResult(targetStep);
    updateNextBtnState();
}
```

`renderStepResult` 内部会优先读取 `stepUserData[step.id]`（已存在则保留），因此用户在上一步做的所有操作（关键词编辑、边界文献判断、矛盾处置选择等）**不会丢失**。

## 经验教训

### 1. 警惕 `innerHTML = ''` 的副作用

`innerHTML = ''` 是一种"核弹式"清空操作，会销毁其内所有子元素的 DOM 引用。如果后续逻辑依赖 `getElementById` 找回某个子元素，会静默失败（返回 `null`）而不报错，极难排查。

**原则**：清空容器后，不要假设其内的元素还能被获取到。应当使用**重新渲染**而非**移动 DOM 节点**来恢复内容。

### 2. 分离「数据状态」与「视图状态」

本项目已有 `stepUserData` 作为数据层，结果卡片是视图层。Bug 的本质是把**视图节点当作数据存储**使用，导致视图一旦被清除，"数据"也随之消失。

**原则**：视图是数据的映射，可以随时销毁并从数据重建。需要持久化的必须放在 JS 数据对象中，而非 DOM 节点上。

### 3. 状态恢复逻辑要与状态初始化逻辑保持一致

`renderStepResult` 是状态初始化路径；`doBack` 的恢复逻辑曾走的是另一条不一致的路径（找旧节点移动）。两条路径的前提假设不同，极易出现不一致 Bug。

**原则**：恢复（restore）和初始化（init）应复用同一套渲染函数，确保行为一致。

### 4. 「有函数但不调用它」的陷阱

`renderStepResult` 本身是完善的，能正确处理已有 `stepUserData` 的情况。Bug 不是因为缺少功能，而是因为在 `doBack` 中没有调用它。代码审查时要关注"该调用的地方有没有调用"。

## 相关文件

- `tools/asci/index.html` — `doBack()` 函数（约第 1348 行）
- `tools/asci/index.html` — `renderStepResult()` 函数（约第 1558 行）
