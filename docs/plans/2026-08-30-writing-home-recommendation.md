# Writing Home Recommendation Implementation Plan

> **For Codex:** REQUIRED SUB-SKILL: Use executing-plans to implement this plan task-by-task.

**Goal:** Give the homepage writing section a single, evergreen recommended article, three additional recent articles, and a metadata-driven archive CTA.

**Architecture:** Reuse the existing `featured-posts.json` ordering and `posts-meta.json` summaries. The first valid featured slug becomes the homepage recommendation; the existing post ordering supplies three distinct follow-up rows. CSS in the existing writing-section block differentiates the recommendation without changing the blog archive page.

**Tech Stack:** Static HTML, CSS custom properties, vanilla JavaScript, JSON fetch.

---

### Task 1: Update homepage markup and rendering

**Files:**
- Modify: `index.html:101-103,429-470`

**Step 1:** Add semantic containers for the recommended article and recent-article list, preserving the existing static CTA fallback.

**Step 2:** Refactor `renderWriting()` to render the first valid featured post as the recommendation and three distinct newest posts as recent rows, all with the existing `summary`, tags, and topics.

**Step 3:** Update the CTA text after metadata loading with the actual post count.

**Step 4:** Check the inline script syntax with `node --check` after extracting it to a temporary file only if needed; validate the rendered HTML with the site checks.

### Task 2: Add scoped visual hierarchy

**Files:**
- Modify: `assets/css/style.css:2374-2470`

**Step 1:** Add scoped styles for the recommended label, recommendation row, recent-list label, and reading cue using existing CSS variables.

**Step 2:** Add mobile styles that preserve the existing single-column list behaviour.

**Step 3:** Confirm no hard-coded color tokens are introduced.

### Task 3: Verify the static site and rendered UI

**Files:**
- Verify: `index.html`, `assets/css/style.css`

**Step 1:** Parse `tools/blog/data/posts-meta.json` and assert the current post count is used by the CTA source.

**Step 2:** Run the project quality check from `scripts/`.

**Step 3:** Serve the page locally and inspect desktop and mobile screenshots of the writing section, including dark theme if the local page supports it.

**Step 4:** Review the final diff and report files, checks, and visual evidence. Do not commit or push unless separately requested.
