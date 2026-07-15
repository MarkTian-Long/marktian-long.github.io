# Claude and Codex Context Unification Plan

Date: 2026-07-10

## Core requirement

Whether Claude or Codex maintains the project, each side must be able to read
the durable content produced by the other side, including rules, skills, memory,
workflow notes, and maintenance policy.

The solution is not to make Claude chase Codex private memory or Codex chase
Claude private memory. The solution is to create a repository-visible shared
context layer and make both entry files read and maintain it.

## Final target state

```text
CONVENTIONS.md                 # stable project rules
docs/agent-context/README.md   # shared context entry
docs/agent-context/memory.md   # cross-agent memory
docs/agent-context/skills.md   # skill source and sync policy
docs/agent-context/maintenance.md
.agents/skills/                # canonical skill source
CLAUDE.md                      # Claude adapter
AGENTS.md                      # Codex adapter
```

## Decisions

1. Keep both `CLAUDE.md` and `AGENTS.md`.
2. Treat both files as adapters, not independent rule sources.
3. Store shared memory in `docs/agent-context/memory.md`.
4. Store shared maintenance state in `docs/agent-context/maintenance.md`.
5. Treat `.agents/skills/` as the canonical skill source.
6. Leave existing `.claude/skills/` real directories untouched during the first
   migration; converting them to junctions requires explicit user confirmation.
7. Do not create a separate `.codex/skills/` source tree.
8. Add a script that detects drift instead of silently rewriting or deleting
   files.

## Execution phases

### Phase 1: Inventory

- Check `CLAUDE.md` and `AGENTS.md`.
- Check `.claude/skills/` and `.agents/skills/`.
- Check Claude project memory at
  `C:\Users\15517\.claude\projects\D--CS-Coding-qiuzhi\memory\MEMORY.md`.
- Check whether Codex project-private memory exists for this repo.

### Phase 2: Shared context

- Add `docs/agent-context/README.md`.
- Add `docs/agent-context/memory.md`.
- Add `docs/agent-context/skills.md`.
- Add `docs/agent-context/maintenance.md`.
- Preserve this migration plan as
  `docs/agent-context/migration-plan-2026-07-10.md`.

### Phase 3: Entry adapters

- Add a required startup block to `CLAUDE.md`.
- Add the same required startup block to `AGENTS.md`.
- Make both files point to `docs/agent-context/*`.
- Keep tool-specific differences inside their own entry files.

### Phase 4: Drift detection

- Add `scripts/sync-agent-context.ps1`.
- The script should check entry references, monthly-review state, skill
  divergence, and legacy source trees.
- The script should not delete or rewrite directories.

### Phase 5: Verification

- Run the sync script.
- Inspect `git status`.
- Record remaining manual follow-up, especially any `.claude/skills/*` real
  directories that still differ from `.agents/skills/*`.

## Failure modes this plan prevents

- Codex learns a project rule but only stores it in Codex private memory.
- Claude learns a project rule but only stores it in Claude private memory.
- `.claude/skills` and `.agents/skills` silently diverge.
- Monthly review state exists only in one agent's private memory.
- A future agent reads one entry file and misses the other side's history.
