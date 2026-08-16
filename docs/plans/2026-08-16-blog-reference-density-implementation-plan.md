# Blog Reference Density Implementation Plan

> **For Codex:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make every historic and future blog `参考资料` block use the compact, editorial reference treatment already proven on `llm-reshapes-software-roles.html`, without changing published article bodies.

**Architecture:** Extend `tools/blog/article-runtime.js`, the script loaded by every article, with a small DOM classifier and a shared injected stylesheet. Legacy `.refs` containers receive a section class; Markdown-generated sibling content after an exact `参考资料` `h2` receives the same roles until page navigation. Keep selection rules pure and export them for Node tests. Document the writing and design rule once, not in individual posts.

**Tech Stack:** Static HTML, CSS custom properties, vanilla browser JavaScript, Node’s built-in test runner.

---

### Task 1: Capture the standard and write the failing classifier tests

**Files:**
- Create: `scripts/blog-reference-presentation.test.js`
- Modify: `tools/blog/article-runtime.js`
- Modify: `docs/plans/2026-08-16-blog-reference-density-design.md`

**Step 1: Write failing tests for the pure reference-boundary helper.**

```js
test('reference section detection accepts only an exact reference heading', () => {
  assert.equal(runtime.isReferenceHeading('  参考资料  '), true);
  assert.equal(runtime.isReferenceHeading('参考资料与延伸阅读'), false);
});

test('reference content stops before page navigation', () => {
  assert.deepEqual(
    runtime.referencePresentationRoles([
      { tagName: 'H2', text: '参考资料' },
      { tagName: 'H3', text: '官方资料' },
      { tagName: 'UL', text: '' },
      { tagName: 'P', text: '来源可信度说明' },
      { tagName: 'SECTION', id: 'continueReading', text: '' }
    ]),
    ['reference-heading', 'reference-group', 'reference-list', 'reference-note', null]
  );
});
```

**Step 2: Run the focused test and verify it fails.**

Run: `node --test scripts/blog-reference-presentation.test.js`

Expected: FAIL because the reference helper does not yet exist.

**Step 3: Add the minimal pure helpers.**

In `article-runtime.js`, add exported helpers that normalize an exact heading, identify the supported reference content roles (`H3`, `UL`, `OL`, `P`), and stop at continuation, post navigation and footer navigation. Keep the helper input independent of DOM so Node tests can cover the boundary rules.

**Step 4: Re-run the focused test.**

Run: `node --test scripts/blog-reference-presentation.test.js`

Expected: PASS.

**Step 5: Commit the planning and test baseline.**

```bash
git add docs/plans/2026-08-16-blog-reference-density-design.md docs/plans/2026-08-16-blog-reference-density-implementation-plan.md scripts/blog-reference-presentation.test.js tools/blog/article-runtime.js
git commit -m "test: cover blog reference presentation boundaries"
```

### Task 2: Apply shared reference presentation in the article runtime

**Files:**
- Modify: `tools/blog/article-runtime.js`
- Test: `scripts/blog-reference-presentation.test.js`

**Step 1: Extend the failing test with legacy and Markdown shapes.**

```js
test('legacy refs and markdown reference siblings share roles', () => {
  assert.deepEqual(runtime.referencePresentationRoles([
    { tagName: 'H2', text: '参考资料' },
    { tagName: 'H3', text: '一手文件' },
    { tagName: 'UL', text: '' }
  ]), ['reference-heading', 'reference-group', 'reference-list']);
});
```

**Step 2: Run it and verify the unsupported path fails.**

Run: `node --test scripts/blog-reference-presentation.test.js`

Expected: FAIL until the DOM application path handles both shapes.

**Step 3: Implement the compact shared style and DOM application.**

Add one `installReferencePresentation()` function called from `boot()` before metadata rendering:

- Add `reference-section` to each legacy `.refs` container whose heading is exactly `参考资料`.
- For unwrapped `.post-body h2` headings, add `reference-section reference-heading` to the heading and role classes to following source siblings until a page-chrome terminator.
- Mark `.refs-note` and paragraphs beginning with `来源可信度` as `reference-note`.
- Inject CSS using only the existing `--border`, `--text-2` and `--clay` tokens. Give section labels 13px, source groups/source rows/notes 12px, and rows a 1.6 line-height / 6px rhythm. Use a late, sufficiently specific selector so historic page-local `.refs` rules are consistently overridden.
- Preserve source links, document order, keyboard focus and every post’s existing body HTML string.

**Step 4: Run focused and existing runtime tests.**

Run: `node --test scripts/blog-reference-presentation.test.js scripts/blog-relationships.test.js`

Expected: all tests PASS.

**Step 5: Commit the runtime behaviour.**

```bash
git add tools/blog/article-runtime.js scripts/blog-reference-presentation.test.js
git commit -m "style: unify blog reference density"
```

### Task 3: Synchronise long-lived authoring and design documentation

**Files:**
- Modify: `tools/blog/BLOG_DESIGN.md`
- Modify: `tools/blog/WRITING_GUIDE.md`
- Modify: `tools/blog/README.md`
- Modify: `CONVENTIONS.md`
- Modify: `docs/agent-context/memory.md`

**Step 1: Add a compact reference presentation section to `BLOG_DESIGN.md`.**

Document the 13px/12px hierarchy, 1.6 row line-height, non-collapsing rule, and the selected baseline page. State that article body copy is not changed by the reference scale.

**Step 2: Update `WRITING_GUIDE.md`.**

State the permitted source structure (`h2` `参考资料`, optional `h3` groups, `ul`/`ol`, optional credibility note), the recommended twelve-source grouping threshold, and that authors do not copy reference CSS into new posts because the runtime supplies it.

**Step 3: Update operational docs only where their responsibility changes.**

In `README.md`, identify `article-runtime.js` as the shared reference-presentation owner. In `CONVENTIONS.md`, preserve the rule that references are auxiliary and excluded from detailed TOC. In shared `memory.md`, record the no-body-rewrite constraint and the runtime ownership for future agents.

**Step 4: Review the documentation diff.**

Run: `git diff --check; git diff -- tools/blog/BLOG_DESIGN.md tools/blog/WRITING_GUIDE.md tools/blog/README.md CONVENTIONS.md docs/agent-context/memory.md`

Expected: no whitespace errors and no duplicated algorithm.

**Step 5: Commit the documentation sync.**

```bash
git add tools/blog/BLOG_DESIGN.md tools/blog/WRITING_GUIDE.md tools/blog/README.md CONVENTIONS.md docs/agent-context/memory.md
git commit -m "docs: define compact blog reference standard"
```

### Task 4: Run static checks and browser QA against historic and recent articles

**Files:**
- Verify: `tools/blog/posts/llm-reshapes-software-roles.html`
- Verify: `tools/blog/posts/ai-rd-self-acceleration-rsi.html`
- Verify: `tools/blog/posts/enterprise-agent-governance.html`
- Verify: `scripts/check-blog-body-integrity.js`

**Step 1: Run the full relevant static suite.**

Run:

```bash
node --test scripts/search-foundation.test.js scripts/blog-relationships.test.js scripts/blog-reference-presentation.test.js scripts/analytics.test.js
node scripts/generate-search-assets.js --check
node scripts/check-search-foundation.js
node scripts/migrate-blog-continue-reading.js --check
node scripts/check-blog-body-integrity.js
node scripts/check-repository-policy.js
```

Expected: all commands PASS; the integrity checker reports every tracked article body unchanged.

**Step 2: Start or reuse the local static server.**

Run: `python -m http.server 8080`

Expected: pages are reachable at `http://127.0.0.1:8080/`.

**Step 3: Check the legacy baseline and a current Markdown-generated article.**

At 1440px, inspect the end of `llm-reshapes-software-roles.html` and `ai-rd-self-acceleration-rsi.html` in light mode. Confirm reference title, group label, links and credibility note share the compact hierarchy and sit before continue reading.

**Step 4: Check responsiveness and dark theme.**

At 390px inspect the same current article for no horizontal overflow and readable wrapped links. Toggle or set dark theme, inspect one legacy and one current page, and confirm the reference colours follow tokens with visible hover/focus states.

**Step 5: Capture screenshots and review the final diff.**

Run: `git diff --check; git status --short`

Expected: screenshots show the auxiliary information layer clearly, no static errors remain, and only intentional files are changed.

### Task 5: Review and hand off

**Files:**
- Review: all files in `git diff --name-only`

**Step 1: Run the project review workflow.**

Run the review skill against the complete diff; fix any mechanical issue it finds and re-run the affected checks.

**Step 2: Confirm final status.**

Run: `git status --short; git log -1 --oneline`

Expected: report precise modified files, test and browser results, documentation sync, and the absence of `git push`.
