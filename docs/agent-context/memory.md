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
  fragments.
- Unique-source counts should use `Set.size`, not raw match counts.
- User-visible metrics need clear semantics before implementation.

### JSON and data files

- JSON updates are high risk. Prefer structured parsing and regeneration over
  manual edits, and verify syntax after changes.
- Avoid smart quotes in JSON field values.

### Blog system

- Validate `tags` and `topics` against the writing guide before writing them.
- `tags` and `topics` should not duplicate the same terms.
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

## Update protocol

When adding a memory item, include:

- Date
- Source agent or tool, if useful
- Concrete rule or lesson
- Affected files or modules
- Whether the rule should also move into `CONVENTIONS.md`

Keep entries concise. This file should be a working memory, not a full chat log.
