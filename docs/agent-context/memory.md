# Shared Agent Memory

This file is the cross-agent memory ledger for the qiuzhi project. It preserves
durable knowledge from Claude Code, Codex, and future coding agents in one
repository-readable place.

## Migration baseline

Created on 2026-07-10 from:

- `CLAUDE.md`
- `AGENTS.md`
- `.claude/skills/`
- `.agents/skills/`
- Claude project memory:
  `C:\Users\15517\.claude\projects\D--CS-Coding-qiuzhi\memory\MEMORY.md`

The Claude memory index existed at migration time and had:

- `monthly-review: last=2026-06-16 next=2026-07-16`
- entries covering general development workflow, tool development, demo design,
  JS/DOM pitfalls, JSON safety, blog publishing, content/design rules, and user
  preferences.

## Agent interoperability rules

- Claude and Codex must both read `docs/agent-context/*` at session start.
- Durable lessons from either agent must be written back here, not only into
  private memory.
- Private agent memory is allowed, but it is not the project source of truth.
- When private memory contains a useful lesson, summarize the reusable rule here
  and leave private implementation details out.
- If an agent updates this file, it should also check whether `CONVENTIONS.md`
  or `.agents/skills/` needs the same change.

## Imported Claude lessons

These items were distilled from the Claude project memory index during the
initial migration.

### Workflow

- 2026-07-26 Codex: GitHub is the source of truth for deployable assets,
  reproducible source/tests, project documentation, shared context, and
  project-owned `.agents/skills/`. Machine permissions, secrets, IDE state, dependencies,
  previews, backups, worktrees, and stashes stay local. The full matrix lives
  in `docs/repository-policy.md` and is enforced by
  `scripts/check-repository-policy.js`; the machine-readable project Skill list
  lives in `scripts/repository-policy.json`. Project-owned `.claude/skills/`
  compatibility files must not diverge from `.agents/skills/`; vendor-managed
  design skills remain governed by `skills-lock.json`.
- 2026-07-26 Codex: When pushing to GitHub from this Windows workspace, direct
  HTTPS to `github.com:443` may time out even though the local machine has a
  working proxy. Before declaring push blocked, probe common local proxy ports;
  `127.0.0.1:7897` worked in this session. Use temporary Git proxy flags such
  as `git -c http.proxy=http://127.0.0.1:7897 -c
  https.proxy=http://127.0.0.1:7897 push origin <branch>` instead of changing
  global Git config. SSH port 22 can be reachable while GitHub rejects the
  operation because no SSH key is installed, so SSH reachability alone is not a
  complete fallback.
- 2026-07-29 Codex: A managed Codex sandbox can reach GitHub through
  `127.0.0.1:7897` while still failing to push because Git Credential Manager
  cannot access the Windows `wincredman` store. If proxy `ls-remote` succeeds
  but push exits silently or reports a credential-store error, keep the
  temporary proxy flags and retry with user-approved system-level execution.
  Do not switch to plaintext credential storage, request a personal access
  token in chat, or change global Git settings. If the approval reviewer fails
  before command startup with `Unknown parameter: input[...].namespace`,
  restart Codex with this repository as the workspace, then resume by checking
  `git status --short --branch`; the existing local commit remains valid.
- Large HTML/JS writes over 300 lines should use a project-local generation
  script instead of ad hoc giant writes. Windows `/tmp` should not be used for
  project scripts.
- Plans belong under project `docs/plans/`, not global private agent folders.
- Completion should include code self-review, practical verification, relevant
  review/design checks, documentation updates, and experience capture when
  something durable was learned.
- Before running QA against stashed work, restore the relevant changes first;
  otherwise the check may validate old code.

### Tool development

- New tools need a pre-launch checklist: favicon, self-contained CSS variables,
  iframe height, standalone browser validation, correct paths, staged/tracked
  files, and README coverage.
- Tool CSS should define its own `:root` variables with tool-specific prefixes
  when needed. Standalone tools should not depend on global `style.css` token
  names unless explicitly designed to.
- New tools that depend on API keys need deployment-secret follow-up captured in
  docs and user-facing handoff, without editing `config.local.js` automatically.

### Demo design

- Product demos should treat the user as a decision maker.
- Background explanation should not crowd the operation panel.
- Mock scenarios need predesigned trigger conditions.
- Scenario-driven demos should keep all visible sections aligned to the selected
  scenario.
- Retry or rerun flows must keep initial data, modal defaults, and mock retry
  results synchronized.

### JS and DOM pitfalls

- Functions returning the same semantic object must align their field names to
  avoid `undefined` in rendering or prompt assembly.
- SVG `className` can be an `SVGAnimatedString`; use `.baseVal` or `String()`
  before string operations.
- Replacing containers with `innerHTML` can remove ID anchors used later by
  `getElementById`; prefer display/state switching when preserving anchors.
- New global flow state should be reset in restart/reset flows immediately.
- Layout refactors should search for related helper functions such as
  `restoreXxx` and `initXxx`.
- After regex-based JS block removal, verify there are no orphaned `});`
  fragments; `node scripts/check-search-foundation.js` also parses every article's
  inline JavaScript as a release guard.
- Unique-source counts should use `Set.size`, not raw match counts.
- User-visible metrics need clear semantics before implementation.

### JSON and data files

- JSON updates are high risk. Prefer structured parsing and regeneration over
  manual edits, and verify syntax after changes.
- Avoid smart quotes in JSON field values.

### Blog system

- 2026-07-24 Codex: Search discovery has one public configuration source at
  `scripts/site-config.js`. After changing the domain or article metadata, run
  `node scripts/generate-search-assets.js --write` and then
  `node scripts/check-search-foundation.js`; the generator updates entry-page
  and article head metadata plus robots, sitemap, and RSS without changing
  HTML bodies.
- 2026-07-26 Codex: Blog publishing treats `docs/blog/<slug>.md` as the
  preferred source draft for new articles and `tools/blog/posts/<slug>.html` as
  the deployed artifact. Historical articles may have HTML edits newer than
  their Markdown candidates, and some early posts have no top-level Markdown
  source. Do not bulk-regenerate historical HTML from Markdown; audit one
  article at a time and backfill Markdown from current HTML when needed.
- 2026-08-02 Codex: Every blog article loads `tools/blog/article-runtime.js`
  immediately after `<body>`. It shares the list page's `blog_theme`,
  migrates the legacy `blog-theme` key once, and degrades a failed
  `posts-meta.json` request to an empty local index plus a readable notice;
  article body content remains available.
- 2026-08-27 Codex: Blog share posters use required, body-grounded
  `share_quote` metadata; `article-runtime.js` supplies every article's single
  entry, while `tools/blog/share-card.html` renders a local 1080 × 1920 Canvas
  PNG and local QR from generated canonical site config. The HTML preview's
  action, QR region, and hostname link to the canonical article; exported PNGs
  remain raster images and rely on the QR for navigation. `share_quote` must not
  change SEO fields; keep the page and vendor asset in the public-dist manifest.
- 2026-07-16 Codex: Markdown-generated blog pages can inherit stale template
  fragments when regex replacement stops at the first nested `</ul>`. For
  `tools/blog/generate-post.js`, replace the entire `.toc-list` by matching
  nested `<ul>` depth, not with a non-greedy regex.
- 2026-07-16 Codex: Blog Markdown tables generated from `docs/blog/*.md`
  should use the article template's `.blog-table` wrapper, not `.table-wrap`,
  otherwise published article tables lose the expected styling.
- 2026-07-16 Codex: The left TOC should include the top-level `参考资料` h2
  when present, but should not include its supporting h3 sections such as
  `一手资料`, `学术研究`, or `系列文章`.
- 2026-07-16 Codex: When moving an Agent article from technical framing to
  product framing, make the product-design audience explicit in the title,
  summary, and opening context, but avoid repeating "PM" throughout the body.
  Metadata can then use `category: 产品` and include `产品设计` as a topic.
- Validate `tags` and `topics` against the writing guide before writing them: a
  topic must be central to the title, summary, and conclusion, rather than an
  example, implementation path, or frequently mentioned technology.
- `tags` and `topics` should not duplicate the same terms.
- 2026-08-08 Codex: Historical blog retrieval is a rolling two-stage process:
  read complete `posts-meta.json` title, summary, concepts, topics, tags, and
  category into high/potential/weak candidates; re-search only after a material
  change in the developing article, and scan once more before outline lock.
  For published-viewpoint facts, read online page, repository HTML, then
  Markdown; Markdown remains the editing/generation source. `concepts` contains
  4-7 specific semantic anchors; it is not a front-end, SEO, tag, or
  static-related-post field.
- 2026-08-16 Codex: `concepts` remains historical semantic recall only. Confirmed strong article relationships live in optional `relations`, declared once by the newer article; the shared article runtime derives an older article's follow-up or revision navigation without changing historical body text.
- 2026-08-16 Codex: Reference sections are a shared compact auxiliary-information layer owned by `tools/blog/article-runtime.js`: exact `参考资料` headings work for both legacy `.refs` pages and Markdown-generated sibling structures. Keep every source semantic and preserved, but default the section to a keyboard-accessible “展开 N 条来源” control so `继续阅读` remains visible; direct reference anchors auto-expand. Do not copy per-post typography overrides.
- A new or redefined blog tag/topic is a single atomic change: obtain approval,
  update the WRITING_GUIDE vocabulary and posts-meta.json together, then audit
  all existing articles. The historical Markdown-source exception never
  exempts metadata vocabulary synchronization.
- Blog publishing follows: Markdown, generation script, metadata JSON update,
  product maturity check when applicable, then delivery.
- Blog callouts should be the last element inside `post-body` and use
  article-specific titles.
- Article pages should derive filenames from metadata URLs with
  `.split('/').pop()` to avoid `posts/posts/` paths.
- Overuse of Chinese em dashes can make copy feel machine-written; simplify
  punctuation when editing.
- First mention of third-party product names should include a short description.
- Blog TOC should use the left-side `toc-card` pattern when there are at least
  three `h2` headings.
- Fixed buttons inside max-width centered layouts should live in a content
  container or top bar, not float against viewport edges.
- Blog article navigation pairs a sticky `.top-bar` (`top: 16px`, `8px` on
  mobile) with a desktop TOC offset of `72px`, so the return link and directory
  never crowd each other.
- `og:image` must use the actual deployed domain.
- Qualitative comparison or positioning charts should prefer HTML tables when
  rotated Chinese SVG labels would render poorly.

### Content and design

- Names should match content type, such as prediction versus opinion.
- Parallel opinion blocks need consistent internal structure.
- Do not drop concrete examples while rewriting.
- When filling missing fields, reuse existing CSS classes unless a visual
  distinction has been confirmed.
- Subjective scores, rankings, and trend labels need user-confirmed criteria
  before implementation.
- Strong opinion copy should be backed by evidence and distinguish observation
  from causation.

### User preference signal

- Historical Claude memory says the user felt Claude's experience was better
  than domestic models because it was less sycophantic, while the user remained
  cautious about agents. Treat this as a prior note, not a permanent preference.

### Track A architecture facts (2026-07-31, Codex)

- The local quality entrance is `scripts/package.json`: `npm test` runs Node
  fixtures and `npm run check` additionally runs policy/search/static safety,
  portfolio evidence, generator-contract reports, tracked JS syntax, and JSON
  parsing. In a PowerShell session that blocks `npm.ps1`, use a process-local
  execution-policy bypass or `cmd /c npm ...`; do not change machine policy.
- `check-static-client-secrets.js` is intentionally report-only. It excludes
  every `config.local.js` before reading, reports file/line/remediation without
  printing a matched secret, and records workflow injection, `innerHTML`, and
  evidence-sensitive public claims for a later security track.
- Portfolio evidence is non-public source data in `docs/portfolio-evidence.*`.
  It distinguishes targets/proxies/offline/production/external metrics and
  requires an explicit Mock boundary. It is not wired into any public page in
  Track A.
- Generator baseline updated 2026-08-31: the blog and Service Agent generators
  default to non-writing checks, and Service Agent fails closed unless exactly
  one supported fault mode is active. Trends separates read-only validation,
  `--discover --candidate` output, and explicit `--write --input` publication;
  public writes require a complete human-reviewed snapshot and use an atomic
  same-directory replacement. Preserve these gates when changing generators.

### Track B architecture facts (2026-07-31, Codex)

- GitHub Pages deployment must never write credentials into the uploaded
  artifact. The deployment workflow contains no Secret injection, and the
  deployment job runs the unified `scripts/npm run check` gate before building;
  the static-client safety fixture checks both the workflow and browser
  entrypoints. Node tests use test-runner discovery so newly added fixtures are
  not omitted from either local or deployment checks.
- Homepage tool navigation is direct-link architecture: tool cards and case
  links open `tools/<tool-name>/index.html` in a new tab. Do not reintroduce
  homepage panel openers or iframe routing without an explicit architecture
  decision.
- ESOP custom API credentials are current-page memory only; clear legacy
  `localStorage` key material on startup. Any string rendered from a model or
  other untrusted input must be HTML-escaped before preserving line breaks.
- Pages deployment builds `dist/` from `scripts/public-dist-manifest.js` and
  uploads only that directory. The manifest is an explicit allowlist, while
  `check-public-dist.js` verifies its file set and local resource references.
  Adding a public asset requires a manifest update plus build and Smoke checks.
- Stock and ESOP keep their public DOM and CSS in `index.html`, while their
  application logic now lives in same-directory `app.js` files. Preserve the
  relative script reference and update the public-dist manifest/test whenever
  either file boundary changes; use browser Smoke after a script extraction.
- Stock message helpers render only application-owned templates as HTML;
  dynamic model/error fields must be escaped where those templates are built.
  Its mock adapter must return each caller's expected JSON or prose contract.
- The Portfolio validator derives required fields, enums, nested shapes, and
  additional-property rules from `docs/portfolio-evidence.schema.json`; keep
  the schema as the single contract and cover CLI argument behavior in tests.

### Works and tools depth facts (2026-08-31, Codex)

- The eight public Works & Tools entries remain independent static runtimes.
  Homepage cards expose stable `data-portfolio-id` values, and the four
  information tools expose exactly one `nav[data-workflow-nav]` with the order
  `1 信源 / 2 信号 / 3 分析 / 4 方法`; no shared runtime is required.
- Public research pages must distinguish archive organization from current
  fact verification. AI Insights records are static archives pending fact
  review; Radar's 11 sources are individually `not-reviewed`; the Trends data
  is a 2026-05-19 historical snapshot whose 2026-08-30 review was structural,
  not a re-verification of historical facts; Agent Hub framework facts are
  archive-only until separately reviewed.
- Product demos with asynchronous work must invalidate stale runs on restart,
  mode changes, rollback, or scenario switches. HITL outcomes, faults, evidence
  states, and exports must reflect the effective current run rather than old
  callbacks or hidden global state.
- `scripts/works-tools-visual.browser.test.js` is the cross-tool HTTP smoke
  gate for the homepage plus all eight tools at desktop and mobile widths. Keep
  tool-specific browser tests for deeper interactions, failures, focus, export,
  and last-write-wins behavior; the smoke gate does not replace them.

### Blog publishing (2026-09-02, Codex)

- Blog images are optional for every article. New metadata may omit `visuals`; if images are used, retain the local-asset, size, declaration and rendered-markup checks. Text, numbers and article-relevant marks are allowed in images; avoid unreadable artifacts, misleading watermarks and unauthorized third-party assets. Affected files: `CONVENTIONS.md`, `tools/blog/*GUIDE.md`, blog image contract and `publish-blog` skill. This rule is already in `CONVENTIONS.md`.

## Update protocol

### Candidate architecture (2026-08-24, Codex)

- Candidate architecture uses exact `@11ty/eleventy@3.1.6` only in the isolated build path. `scripts/build-candidate-site.js` may write only under `build/candidate-site/`; homepage and blog index use byte-frozen, version-controlled candidate inputs while every remaining public artifact passes through the explicit manifest.
- Blog, Service Agent, and Trends generators default to a non-writing check path; candidate writes are restricted to `build/candidate-site/`, and public replacement requires explicit `--write`. Trends refuses an incomplete result with an empty board.
- `scripts/blog-source-ledger.js` records 39 published articles as 21 source-confirmed, 9 legacy-frozen, and 9 blocked. Historical bodies remain frozen and must not be bulk-regenerated.

When adding a memory item, include:

- Date
- Source agent or tool, if useful
- Concrete rule or lesson
- Affected files or modules
- Whether the rule should also move into `CONVENTIONS.md`

Keep entries concise. This file should be a working memory, not a full chat log.
