# Blog Historical Retrieval Design

## Goal

Let a future AI agent find a small set of potentially relevant historical posts
before drafting a new blog post, then read only those bodies before deciding
whether an internal reference is substantively justified.

## Confirmed constraints

- `tools/blog/data/posts-meta.json` remains the only article metadata source.
- The public site, SEO assets, and existing related-post scoring must not depend
  on the new retrieval field.
- Historical published HTML is an acceptable—and sometimes more current—second
  stage body source when a canonical Markdown source is unavailable.
- Do not generate a parallel article index or precompute static article links.
- The normal workflow remains: draft in ChatGPT, save Markdown locally, then
  publish from this repository.

## Selected design

Upgrade `posts-meta.json` to schema version 2 and add one required field:

```json
"concepts": ["specific object", "decision mechanism", "product or company"]
```

`concepts` is a compact semantic-recall aid. Each post has four to seven
distinct, specific terms that materially shape its argument. It is not a
category, a tag vocabulary, an SEO keyword list, or a static related-post map.
Generic exact terms such as `AI`, `产品`, `技术`, and `行业` are invalid; terms
must not exactly duplicate the post's `tags` or `topics`.

The two-stage operating protocol is:

1. Read `posts-meta.json` and use `title`, `summary`, `concepts`, `topics`,
   `tags`, and `category` to return a high-recall candidate set.
2. Read each candidate body—`docs/blog/<slug>.md` where present, otherwise
   `tools/blog/posts/<slug>.html`—and cite it only when the current article
   shares a substantive question, mechanism, continuation, correction,
   reusable framework, evidence, or meaningful viewpoint continuity.

## Summary policy

`summary` remains reader-facing prose, not an extracted keyword string. A good
summary identifies the primary object or problem, the core judgement or
conflict, and the decisive mechanism, relation, or boundary. One or two natural
sentences are allowed. No visual length cap is currently imposed by the home or
archive pages, so the migration changes only summaries that fail this semantic
test after a body review; it does not normalize all historical lengths.

## Enforcement

Extend the existing `validatePosts()` pathway rather than introducing a second
index or build dependency. It will validate the versioned metadata schema,
required retrieval fields, value counts, uniqueness, and prohibited generic
concepts. The normal search-foundation check will continue to validate public
SEO and article files. Tests will cover valid and invalid retrieval metadata.

The writing guide and the project-owned `publish-blog` skill will make the
field and its quality review a release requirement. A short shared project rule
will direct repository-aware agents to do the two-stage check before suggesting
historical internal references. This does not require web ChatGPT to change its
drafting workflow: its user can provide the GitHub repository metadata when
needed.

## Non-goals

- No full-text search engine, embedding store, Lunr index, or client-side UI
  change.
- No SEO use of `concepts`.
- No automatic citation or static related-article relationship.
- No historical HTML regeneration or bulk Markdown backfill.

## Verification

Run metadata/search foundation unit tests, search-asset freshness checks,
repository-policy checks, JSON parsing, and targeted assertions that the 35
historical posts have valid concepts. No visual review is required because this
design deliberately leaves visible rendering unchanged.
