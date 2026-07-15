# Agent Context

This folder is the shared context layer for all coding agents that maintain this
project, including Claude Code and Codex.

The goal is simple: when either agent learns something durable about this
project, the next agent must be able to read it from the repository without
depending on the other agent's private memory system.

## Required startup order

Every agent session that changes or reviews this project must read these files
first:

1. `CONVENTIONS.md`
2. `docs/agent-context/README.md`
3. `docs/agent-context/memory.md`
4. `docs/agent-context/skills.md`
5. `docs/agent-context/maintenance.md`
6. The task-specific skill under `.agents/skills/<name>/SKILL.md`, when a skill
   applies.

`CLAUDE.md` and `AGENTS.md` are entry adapters. They may contain tool-specific
details, but shared project knowledge belongs here or in `CONVENTIONS.md`.

## Source hierarchy

Use this priority order when sources disagree:

1. User's latest explicit instruction
2. `CONVENTIONS.md`
3. `docs/agent-context/*`
4. Tool-specific entry file: `CLAUDE.md` or `AGENTS.md`
5. Tool-private memory, such as Claude or Codex user directories
6. Historical or legacy copies, such as root `skills/`

If a private memory note is still useful, migrate the durable part into this
folder. Do not force future agents to inspect private paths to understand the
project.

## Where new durable knowledge goes

Use this rule:

- Stable development rules go in `CONVENTIONS.md`.
- Cross-agent lessons, pitfalls, workflow notes, and project memory go in
  `docs/agent-context/memory.md`.
- Skill source-of-truth and synchronization rules go in
  `docs/agent-context/skills.md`.
- Monthly review state and recurring maintenance policy go in
  `docs/agent-context/maintenance.md`.
- Temporary task plans go in `docs/plans/`.

Private Claude or Codex memory may still exist, but it should point back to this
folder for shared project facts.
