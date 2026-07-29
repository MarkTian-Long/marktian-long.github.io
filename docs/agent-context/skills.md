# Shared Skill Policy

`.agents/skills/` is the canonical project skill source for qiuzhi.

Claude, Codex, and any future agent should treat the same skill files as the
project source of truth. Tool-specific skill directories may exist for
compatibility, but they should not become independent sources.

## Canonical layout

```text
.agents/skills/                # tracked project-owned canonical source
.claude/skills/                # tracked Claude compatibility layer
skills/                        # local legacy compatibility copy, do not edit
.codex/                        # Codex-private config only; not a skill source
```

## Maintenance rules

- Edit project skills in `.agents/skills/<name>/SKILL.md`.
- `scripts/repository-policy.json` is the machine-readable list of project-owned
  skills. Commit those entries under `.agents/skills/`; they must not be
  excluded by `.gitignore`.
- Keep `.claude/skills/` as a tracked compatibility layer. Project-owned skill
  file names and contents must match `.agents/skills/`; agent-specific behavior
  belongs in `AGENTS.md` or `CLAUDE.md`, not in divergent copies.
- Vendor-managed design skills are governed by `skills-lock.json`. Their
  `.agents/skills/` installation output stays local and is updated by the skill
  manager, not by hand.
- After changing a project-owned skill, run
  `powershell -ExecutionPolicy Bypass -File scripts/sync-agent-context.ps1 -Write`
  to update the Claude compatibility copy, then run the same script without
  `-Write` plus `node scripts/check-repository-policy.js`.
- Do not create a new `.codex/skills` or `.Codex/skills` source tree for this
  project unless the user explicitly requests a tool-private experiment.
- Root `skills/` is treated as legacy compatibility. Do not use it as the first
  place to edit project behavior.
- Every skill should have `SKILL.md` with frontmatter containing at least
  `name`, `description`, and `type` when the local skill format requires it.
- Project-owned skills use top-level `type: workflow`. The system
  `skill-creator/scripts/quick_validate.py` currently rejects that extra field,
  so project acceptance is determined by `sync-agent-context.ps1`,
  `scripts/repository-policy.json`, and `check-repository-policy.js`.
- Skill commands should avoid `/tmp` on Windows; use project-local temporary
  folders when a script is needed.
- Independent Git worktrees contain tracked project-owned skills and should edit
  those files in the active worktree. Ignored vendor-managed installation output
  may be absent; the checker can resolve that output from the primary workspace
  for compatibility diagnostics only.

## Migration notes

At the 2026-07-10 migration:

- `.agents/skills/` existed and contained project/design skills.
- `.claude/skills/` existed.
- Several `.claude/skills/*` entries were already junctions to `.agents/skills/*`.
- These `.claude/skills/*` entries were still real directories and should be
  reviewed before any future junction conversion:
  `add-tool`, `analyze-product`, `brand-design-md`, `code-health-check`,
  `monthly-review`, `sync-docs`, `update-trends`.

On 2026-07-26, repository ownership was clarified:

- The seven project-owned `.agents/skills/` entries changed from ignored local
  state to tracked canonical sources; vendor-managed installation output remains
  ignored.
- `.claude/skills/` remains a tracked compatibility layer across clones.
- Four agent-specific content differences were normalized into shared wording.
- `.claude/settings.local.json` was classified as local-only because it contains
  machine paths and permission state rather than project rules.
