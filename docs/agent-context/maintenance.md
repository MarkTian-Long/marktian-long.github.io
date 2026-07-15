# Agent Context Maintenance

<!-- monthly-review: last=2026-07-10 next=2026-08-10 -->

This file owns cross-agent maintenance state for qiuzhi. Both Claude and Codex
should read this file instead of using private memory comments as the only
monthly-review source.

## Monthly review check

At session start:

1. Read the `monthly-review` comment above.
2. Compare today's date with `next`.
3. If today is on or after `next`, remind the user:
   `月度维护已到期（next=YYYY-MM-DD），可输入 /monthly-review 执行。`

The previous Claude private memory marker was:

```text
monthly-review: last=2026-06-16 next=2026-07-16
```

The shared marker was reset on 2026-07-10 so both Claude and Codex now use one
repository-visible schedule.

## Recurring checks

Run `scripts/sync-agent-context.ps1` after changes to shared agent context, skill
policy, or entry files.

The script is a checker. It should report drift but should not delete, replace,
or rewrite directories automatically.

## Maintenance checklist

- Confirm `CLAUDE.md` and `AGENTS.md` both require reading
  `docs/agent-context/*`.
- Confirm durable private-memory lessons have been summarized in
  `docs/agent-context/memory.md`.
- Confirm skill edits were made in `.agents/skills/`.
- Confirm real `.claude/skills/*` directories did not drift from
  `.agents/skills/*` unintentionally.
- Confirm new project rules that affect all development are in `CONVENTIONS.md`,
  not only in private agent memory.
