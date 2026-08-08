# Blog Historical Retrieval Implementation Plan

> **For Codex:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make existing blog metadata reliably usable for AI-assisted two-stage
historical article retrieval without changing the public blog experience.

**Architecture:** Extend the sole metadata source with a versioned `concepts`
field and validate it through the existing generation/check path. Document the
candidate-recall then body-confirmation workflow in the existing writing and
publication guidance; fall back to current published HTML where historical
Markdown is absent.

**Tech Stack:** JSON, Node.js built-in test runner, existing static HTML and
blog generation scripts.

---

### Task 1: Add failing retrieval-metadata tests

**Files:**
- Modify: `scripts/search-foundation.test.js`
- Modify: `scripts/generate-search-assets.js`

**Step 1: Write failing tests**

Add tests for a version-2 post with valid `date`, `tags`, `topics`, `category`,
and four concepts. Add rejection cases for a missing concepts array, fewer than
four concepts, a duplicate concept, an exact tag/topic duplicate, and a generic
concept such as `AI`.

**Step 2: Run test to verify it fails**

Run: `node --test scripts/search-foundation.test.js`

Expected: the new validation cases fail because `validatePosts()` currently
does not inspect the retrieval fields.

**Step 3: Implement minimal validation**

Validate version 2 metadata in the existing loader and validate each post's
`date`, non-empty `tags/topics`, allowed category, and 4–7 unique `concepts`.
Preserve the existing slug, title, summary, URL, duplicate-path, and XML checks.

**Step 4: Run test to verify it passes**

Run: `node --test scripts/search-foundation.test.js`

Expected: all existing and newly added tests pass.

### Task 2: Migrate the single metadata source

**Files:**
- Modify: `tools/blog/data/posts-meta.json`

**Step 1: Review each post's title, summary, tags/topics, headings, and body
where those do not settle the semantic centre**

Use the current published article HTML as the body authority for historic posts
without a matching Markdown file. Do not generate or overwrite article HTML.

**Step 2: Update records**

Set the root version to 2 and add four to seven specific concepts to every post.
Revise only summaries that omit the object, central judgement, or decisive
mechanism after that review.

**Step 3: Parse and validate the migration**

Run: `node -e "const d=require('./tools/blog/data/posts-meta.json'); console.log(d.version, d.posts.length)"`

Run: `node scripts/generate-search-assets.js --check`

Expected: valid JSON, version 2, 35 records, and no stale SEO assets because
the public SEO fields are unchanged except for any necessary summary edits.

### Task 3: Make the process durable

**Files:**
- Modify: `CONVENTIONS.md`
- Modify: `tools/blog/WRITING_GUIDE.md`
- Modify: `tools/blog/README.md`
- Modify: `.agents/skills/publish-blog/SKILL.md`
- Modify: `.claude/skills/publish-blog/SKILL.md` via sync script
- Modify: `docs/agent-context/memory.md`

**Step 1: Document field boundaries and the retrieval protocol**

Define `concepts`, its 4–7 range, prohibited generic terms, and the boundary
against `tags`, `topics`, and `category`. Document that HTML is an acceptable
historic body fallback and that a metadata match is not a reason by itself to
cite an article.

**Step 2: Add release-time safeguards**

Update the publish skill and new-article checklist to require title, summary,
category, tags/topics, concepts, slug/URL, and content consistency review.

**Step 3: Synchronize project-owned skills**

Run: `powershell -ExecutionPolicy Bypass -File scripts/sync-agent-context.ps1 -Write`

Expected: the Claude compatibility copy matches the canonical project skill.

### Task 4: Verify the complete change

**Files:**
- Verify: all modified files

**Step 1: Run repository and metadata checks**

Run:

```powershell
node --test scripts/search-foundation.test.js
node scripts/generate-search-assets.js --check
node scripts/check-search-foundation.js
powershell -ExecutionPolicy Bypass -File scripts/sync-agent-context.ps1
node scripts/check-repository-policy.js
git diff --check
```

**Step 2: Inspect the final diff**

Confirm there is one metadata source, no historical article HTML body rewrite,
no new public index, and no UI/SEO consumer of `concepts`.

**Step 3: Commit**

```powershell
git add CONVENTIONS.md tools/blog/data/posts-meta.json tools/blog/README.md tools/blog/WRITING_GUIDE.md scripts/generate-search-assets.js scripts/search-foundation.test.js .agents/skills/publish-blog/SKILL.md .claude/skills/publish-blog/SKILL.md docs/agent-context/memory.md docs/plans/2026-08-08-blog-history-retrieval-design.md docs/plans/2026-08-08-blog-history-retrieval.md
git commit -m "feat: add blog history retrieval metadata"
```
