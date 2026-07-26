# Blog Source Normalization Plan

Date: 2026-07-26

## Context

The blog currently has two file layers:

- `docs/blog/*.md` stores authoring drafts.
- `tools/blog/posts/*.html` stores deployed GitHub Pages articles.

After the search-discovery work, the deployed HTML pages are valid and searchable,
but the historical source-draft state is mixed. Some early posts have no
top-level Markdown source, and many existing Markdown candidates no longer
generate text-identical HTML because the deployed HTML has received later edits.

## Current Audit Snapshot

- Published articles in `tools/blog/data/posts-meta.json`: 34
- Top-level Markdown files in `docs/blog`: 27
- Published articles with a Markdown candidate by title or slug: 25
- Published articles without a top-level Markdown candidate: 9
- Text-identical regenerated articles found in the spot audit:
  - `agent-boundary`
  - `physical-world-llm`
- `automated-research` has multiple historical Markdown candidates:
  - `automated-research-blog-v5.md`
  - `automated-research-blog-v6.md`
  - `automated-research-blog-v7.md`

## Decision

Do not bulk-regenerate historical HTML from Markdown.

For new articles, `docs/blog/<slug>.md` is the source draft and
`tools/blog/posts/<slug>.html` is the deployed artifact. Both must be committed
together.

For historical articles, current deployed HTML is treated as the safer text of
record until a one-article audit proves the Markdown source is equivalent.

## Follow-Up Plan

1. Backfill low-risk exact sources.

   Add Markdown sources that are text-identical to the current deployed HTML.
   `physical-world-llm.md` is the immediate candidate.

2. Create an article source map if historical cleanup becomes active.

   A future `tools/blog/data/source-map.json` could map each slug to its
   canonical Markdown source and status:
   `exact`, `html-newer`, `missing-md`, or `needs-review`.

3. Backfill missing historical Markdown from current HTML.

   For the 9 articles without top-level Markdown, reverse the current deployed
   HTML into Markdown one article at a time, then manually check headings,
   tables, callouts, and reference links.

4. Reconcile Markdown drift one article at a time.

   When a Markdown candidate differs from deployed HTML, compare visible text
   first. If the HTML contains newer edits, port those edits back into Markdown
   before regenerating. If Markdown is newer by intention, regenerate only that
   article and run the search checks.

## Required Checks

For every source/backfill change:

```powershell
node tools/blog/generate-post.js docs/blog/<slug>.md tools/blog/posts/<slug>.html
node scripts/generate-search-assets.js --write
node scripts/generate-search-assets.js --check
node scripts/check-search-foundation.js
node --test scripts/search-foundation.test.js
```

