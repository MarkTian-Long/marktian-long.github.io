# 博客阅读信息 Implementation Plan

> **For Codex:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 为全部博客文章自动显示基于最终 HTML 正文计算的约计字数和阅读时长。

**Architecture:** 复用每篇文章已经加载的 `tools/blog/article-runtime.js`。纯函数负责从可读文本计算阅读单位及格式化显示文案；DOM 层仅负责从 `.post-body` 排除非正文节点，并在日期和标签之间插入唯一元信息元素。

**Tech Stack:** Vanilla JavaScript、Node.js 内置测试运行器、现有 Playwright 本地页面测试环境。

---

### Task 1: 定义阅读统计的可测试契约

**Files:**
- Modify: `scripts/blog-reference-presentation.test.js`
- Modify: `tools/blog/article-runtime.js`

**Step 1: Write the failing test**

在 `blog-reference-presentation.test.js` 中导入 runtime，并断言尚不存在的 `readingUnitsFromText` 与 `formatReadingMeta`：中文字符和英文词组计入单位、标点和空白不计入、字数按百位显示、400 单位/分钟向上取整且至少为 1 分钟。

**Step 2: Run test to verify it fails**

Run: `node --test scripts/blog-reference-presentation.test.js`

Expected: FAIL，错误原因是阅读统计函数尚未导出。

**Step 3: Write minimal implementation**

在 `article-runtime.js` 实现纯函数并从模块 API 导出。不得引入依赖，不得读取 DOM。

**Step 4: Run test to verify it passes**

Run: `node --test scripts/blog-reference-presentation.test.js`

Expected: PASS。

### Task 2: 将统计结果插入每篇文章元信息行

**Files:**
- Modify: `tools/blog/article-runtime.js`
- Modify: `scripts/blog-reference-presentation.test.js`

**Step 1: Write the failing test**

添加静态契约断言：运行时公开阅读信息渲染能力，使用 `.post-body`、`.post-date`、`.post-reading-meta` 和 `参考资料` 排除规则；全部文章继续加载共享运行时。

**Step 2: Run test to verify it fails**

Run: `node --test scripts/blog-reference-presentation.test.js`

Expected: FAIL，错误原因是 DOM 渲染能力不存在。

**Step 3: Write minimal implementation**

克隆 `.post-body` 后移除 `pre`、`figure`、`.refs`、脚本与样式，并从精确的 `参考资料` H2 起排除其后的参考节点。插入唯一的语义化 `.post-reading-meta`，在启动时于参考资料呈现之后执行；为其添加复用文章色彩变量的紧凑样式。

**Step 4: Run test to verify it passes**

Run: `node --test scripts/blog-reference-presentation.test.js`

Expected: PASS。

### Task 3: 运行集成与视觉核验

**Files:**
- Verify: `tools/blog/posts/personal-harness.html`
- Verify: 一篇早期 `tools/blog/posts/*.html`

**Step 1: Run focused tests**

Run: `node --test scripts/blog-reference-presentation.test.js scripts/blog-body-integrity.test.js`

Expected: PASS。

**Step 2: Run static publication checks**

Run: `node scripts/check-search-foundation.js`、`npm run build:public`、`npm run check:public-dist`（在 `scripts/` 下）。

Expected: 所有命令成功。

**Step 3: Run browser verification**

在本地 HTTP 服务中打开新式 `personal-harness.html` 与一篇早期文章，确认桌面和移动视口的阅读信息位置、换行与可读性；截取真实页面截图审查。

**Step 4: Review and commit**

审查限定文件差异，运行 `node scripts/check-repository-policy.js`，然后创建本地提交：`feat: add blog reading metadata`。不推送。
