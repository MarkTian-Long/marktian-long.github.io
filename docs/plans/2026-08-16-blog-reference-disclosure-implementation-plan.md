# Blog Reference Disclosure Implementation Plan

> **For Codex:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Collapse every article’s reference sources by default so `继续阅读` remains visible immediately after the conclusion, while keeping all sources one accessible action away.

**Architecture:** Extend the existing shared reference presentation in `tools/blog/article-runtime.js`. It will add an accessible disclosure button to the exact `参考资料` heading, hide only the reference elements already identified by the runtime, and expand automatically for a matching reference anchor. The runtime remains the sole behaviour owner for legacy `.refs` and Markdown-generated pages; no historical published HTML is rewritten.

**Tech Stack:** Static HTML, CSS custom properties, vanilla browser JavaScript, Node built-in test runner.

---

### Task 1: Add failing tests for the disclosure decisions

**Files:**
- Modify: `scripts/blog-reference-presentation.test.js`
- Modify: `tools/blog/article-runtime.js`

**Step 1: Write failing pure-function tests.**

```js
test('reference disclosure labels report source counts and state', () => {
  assert.deepEqual(runtime.referenceDisclosureCopy(12, false), {
    text: '展开 12 条来源', expanded: false
  });
  assert.equal(runtime.referenceDisclosureCopy(0, true).text, '收起参考资料');
});

test('reference anchors open the matching disclosure only', () => {
  assert.equal(runtime.shouldExpandReferenceForHash('#references', 'references'), true);
  assert.equal(runtime.shouldExpandReferenceForHash('#section-10', 'references'), false);
});
```

**Step 2: Run the focused test and verify it fails.**

Run: `node --test scripts/blog-reference-presentation.test.js`

Expected: FAIL because disclosure helpers are not exported.

**Step 3: Implement minimal helpers.**

Add `referenceDisclosureCopy(count, expanded)` and `shouldExpandReferenceForHash(hash, headingId)` to `article-runtime.js`. Use normalized/decoded hash input and only the exact heading ID; no storage or analytics state.

**Step 4: Re-run the focused test.**

Run: `node --test scripts/blog-reference-presentation.test.js`

Expected: PASS.

### Task 2: Add the runtime disclosure control for both historical structures

**Files:**
- Modify: `tools/blog/article-runtime.js`
- Test: `scripts/blog-reference-presentation.test.js`

**Step 1: Keep a reference-content element list during existing presentation classification.**

For a legacy `.refs` section, use its source child elements after its exact `h2`. For an unwrapped Markdown section, use the siblings gathered after its exact direct-child `h2` until the existing page-chrome terminator. Do not include `继续阅读`, post navigation or footer navigation.

**Step 2: Add an accessible disclosure button.**

For each reference heading:

- Ensure it has an ID (`references` only when the historic heading has none).
- Replace the heading’s displayed label with a native button containing `参考资料` and `展开 N 条来源` (or `展开参考资料` for zero links).
- Count `a[href]` in the collected source elements.
- Set `aria-expanded="false"` and `hidden=true` on only those source elements at initial load.
- On click or keyboard activation, invert the state, update the hint to `收起 …`, and restore or hide the same source elements.
- Keep the button itself inside the existing `h2` so heading hierarchy and direct anchors remain intact.

**Step 3: Support direct and TOC anchor navigation.**

When the current hash matches a generated or existing reference heading ID, initialize it expanded. Register one `hashchange` listener that expands the matching reference control when a reader navigates from the TOC or follows `#references`.

**Step 4: Add compact disclosure CSS in the existing shared stylesheet.**

Add `.reference-toggle` and `.reference-toggle-hint` styles using the current `--text-2`, `--clay` and focus-outline treatment. The hint is visibly secondary; the heading remains 13px. Do not add a card, animation, per-post CSS, or layout-affecting transition.

**Step 5: Run relevant tests.**

Run: `node --test scripts/blog-reference-presentation.test.js scripts/blog-relationships.test.js`

Expected: all tests PASS.

### Task 3: Update the permanent authoring and design rules

**Files:**
- Modify: `tools/blog/BLOG_DESIGN.md`
- Modify: `tools/blog/WRITING_GUIDE.md`
- Modify: `tools/blog/README.md`
- Modify: `CONVENTIONS.md`
- Modify: `docs/agent-context/memory.md`
- Modify: `docs/plans/2026-08-16-blog-reference-density-design.md`

**Step 1: Replace the previous no-collapse rule.**

In `BLOG_DESIGN.md`, describe the default collapsed state, `展开/收起 N 条来源` text and the reason `继续阅读` must remain visible. Keep the compact 13px/12px standard for the expanded content.

**Step 2: Update authoring guidance.**

In `WRITING_GUIDE.md`, keep the semantic source structure but remove the prior instruction that references remain expanded. State that authors do not create their own disclosure controls and that anchors/TOC open the shared disclosure.

**Step 3: Synchronise operational and durable documentation.**

In `README.md`, identify `article-runtime.js` as the reference disclosure owner and include the test in the release command. In `CONVENTIONS.md` preserve auxiliary TOC treatment while documenting default disclosure. Update `memory.md` and the prior density design to prevent future agents from restoring always-expanded references.

**Step 4: Inspect the documentation diff.**

Run: `git diff --check; git diff -- tools/blog/BLOG_DESIGN.md tools/blog/WRITING_GUIDE.md tools/blog/README.md CONVENTIONS.md docs/agent-context/memory.md docs/plans/2026-08-16-blog-reference-density-design.md`

Expected: no contradiction between the disclosure standard and authoring rules.

### Task 4: Verify all historical pages and visible behaviour

**Files:**
- Verify: `tools/blog/posts/llm-reshapes-software-roles.html`
- Verify: `tools/blog/posts/ai-rd-self-acceleration-rsi.html`
- Verify: `scripts/check-blog-body-integrity.js`

**Step 1: Run the release-relevant static suite.**

Run:

```bash
node --test scripts/search-foundation.test.js scripts/blog-relationships.test.js scripts/blog-reference-presentation.test.js scripts/analytics.test.js
node scripts/generate-search-assets.js --check
node scripts/check-search-foundation.js
node scripts/migrate-blog-continue-reading.js --check
node scripts/check-blog-body-integrity.js
node scripts/check-repository-policy.js
```

Expected: all commands PASS; integrity output reports all tracked article bodies unchanged.

**Step 2: Validate the legacy reference structure in a browser.**

At desktop width, open `llm-reshapes-software-roles.html`. Confirm the default collapsed label includes its source count, `继续阅读` is now in the same viewport after the conclusion, click and keyboard activation expand/collapse every source group and note, and the browser console remains clean.

**Step 3: Validate the Markdown-generated structure and direct anchor.**

At desktop width, open `ai-rd-self-acceleration-rsi.html` normally and at its reference heading anchor. Confirm normal load is collapsed, an anchor load expands it, and no source contents are lost.

**Step 4: Validate responsive and themed presentation.**

At 390px in light mode, verify the collapsed control has no horizontal overflow and `继续阅读` remains visible. At desktop dark mode, verify the control and expanded source text retain the current contrast-safe token and visible focus styling. Restore the preview’s original theme after QA.

**Step 5: Capture screenshots and review the final diff.**

Run: `git diff --check; git status --short`

Expected: screenshots prove default collapse and expanded source access; only intentional source, test and documentation files differ.

### Task 5: Commit and hand off without remote mutation

**Files:**
- Review: all files in `git diff --name-only`

**Step 1: Run a self-review of the complete diff.**

Verify the runtime never touches article text/URLs, click state cannot hide page navigation, and documentation does not retain an always-expanded instruction.

**Step 2: Commit the verified local change.**

```bash
git add CONVENTIONS.md docs/agent-context/memory.md docs/plans/2026-08-16-blog-reference-density-design.md docs/plans/2026-08-16-blog-reference-disclosure-implementation-plan.md scripts/blog-reference-presentation.test.js tools/blog/BLOG_DESIGN.md tools/blog/README.md tools/blog/WRITING_GUIDE.md tools/blog/article-runtime.js
git commit -m "feat: collapse blog references by default"
```

**Step 3: Report the local commit and await integration instruction.**

Do not merge or push without user confirmation.
