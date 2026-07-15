# Shared Skill Policy

`.agents/skills/` is the canonical project skill source for qiuzhi.

Claude, Codex, and any future agent should treat the same skill files as the
project source of truth. Tool-specific skill directories may exist for
compatibility, but they should not become independent sources.

## Canonical layout

```text
.agents/skills/                # canonical source
.claude/skills/                # compatibility layer, preferably junctions
skills/                        # legacy compatibility copy, do not edit first
.codex/                        # Codex-private config only; not a skill source
```

## Maintenance rules

- Edit project skills in `.agents/skills/<name>/SKILL.md`.
- If `.claude/skills/<name>` is a junction to `.agents/skills/<name>`, no extra
  sync is needed.
- If `.claude/skills/<name>` is a real directory, compare it with
  `.agents/skills/<name>` before editing and migrate the durable changes back to
  `.agents/skills/`.
- Do not create a new `.codex/skills` or `.Codex/skills` source tree for this
  project unless the user explicitly requests a tool-private experiment.
- Root `skills/` is treated as legacy compatibility. Do not use it as the first
  place to edit project behavior.
- Every skill should have `SKILL.md` with frontmatter containing at least
  `name`, `description`, and `type` when the local skill format requires it.
- Skill commands should avoid `/tmp` on Windows; use project-local temporary
  folders when a script is needed.

## Current migration notes

At the 2026-07-10 migration:

- `.agents/skills/` existed and contained project/design skills.
- `.claude/skills/` existed.
- Several `.claude/skills/*` entries were already junctions to `.agents/skills/*`.
- These `.claude/skills/*` entries were still real directories and should be
  reviewed before any future junction conversion:
  `add-tool`, `analyze-product`, `brand-design-md`, `code-health-check`,
  `monthly-review`, `sync-docs`, `update-trends`.

Replacing real directories with junctions requires deletion/replacement and must
be treated as a user-confirmed operation. This migration records the policy but
does not delete or replace those directories.
