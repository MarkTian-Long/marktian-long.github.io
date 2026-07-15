# Agent Context Verification

Date: 2026-07-10

Command:

```powershell
powershell -ExecutionPolicy Bypass -File scripts\sync-agent-context.ps1
```

Result:

```text
Summary: 31 ok, 8 warnings, 0 errors
```

## Confirmed

- `CONVENTIONS.md`, `CLAUDE.md`, and `AGENTS.md` exist.
- `docs/agent-context/README.md` exists.
- `docs/agent-context/memory.md` exists.
- `docs/agent-context/skills.md` exists.
- `docs/agent-context/maintenance.md` exists.
- `docs/agent-context/migration-plan-2026-07-10.md` exists.
- `CLAUDE.md` references the shared context and `.agents/skills/<name>/SKILL.md`.
- `AGENTS.md` references the shared context and `.agents/skills/<name>/SKILL.md`.
- Shared monthly-review marker exists in `docs/agent-context/maintenance.md`.
- `.agents/skills` exists as the canonical skill directory.
- Most design skills under `.claude/skills` are already junctions to
  `.agents/skills`.

## Warnings to revisit

- Root `skills/` exists as legacy compatibility. Do not edit it first.
- `.claude/skills/add-tool` is a real directory but `SKILL.md` matches canonical.
- `.claude/skills/analyze-product` is a real directory but `SKILL.md` matches
  canonical.
- `.claude/skills/brand-design-md` is a real directory and differs from
  `.agents/skills/brand-design-md`.
- `.claude/skills/code-health-check` is a real directory but `SKILL.md` matches
  canonical.
- `.claude/skills/monthly-review` is a real directory and differs from
  `.agents/skills/monthly-review`.
- `.claude/skills/sync-docs` is a real directory and differs from
  `.agents/skills/sync-docs`.
- `.claude/skills/update-trends` is a real directory and differs from
  `.agents/skills/update-trends`.

## Follow-up policy

The differing `.claude/skills/*` directories were not converted to junctions in
this migration because that would require deleting/replacing existing
directories. Treat that as a separate user-confirmed cleanup task.
