# A0 architecture equivalence gate

This harness compares the approved public baseline at
`74b531562ff14a5c38830c0edf88304af9f19933` with the current architecture
worktree. It does not create or enable a candidate build.

## Contract

- Materialize two independent 73-file snapshots: baseline bytes come from
  `git cat-file --filters` at the approved SHA (so Windows checkout filters are
  applied) and current bytes come from the worktree.
- Serve the snapshots from separate Node processes, roots, ports, and PIDs.
- Skip Fetch/Chromium-blocked ports before either server reports ready.
- Check 73 public files and 49 HTML routes at `/` and simulated
  `/repo-name/` base paths.
- Compare missing-route 404 status, MIME, and body hash at both base paths.
- Compare HTTP status, MIME, canonical values, RSS/sitemap bytes, public hashes, actual browser resources,
  normalized head/body/text/links/IDs/classes, ARIA snapshots, full-page PNGs,
  console errors, page errors, local request failures, and expected external
  request isolation.
- Exercise desktop `1440x1000`, mobile `390x844`, light/dark themes, homepage
  navigation/menu/judgment/case states, blog filter/search/pagination/reference
  states, all eight public tool entrypoints, and all eight entrypoints again
  with JavaScript disabled as an explicit degradation state. The complete gate
  contains 221 tests.

Chromium uses `zh-CN`, `Asia/Shanghai`, DPR 1, sRGB software rendering,
reduced motion, deterministic font smoothing, disabled animations/transitions,
explicit theme storage, and `document.fonts.ready`. Baseline/current are captured
once each, with no screenshot retry. The theme toggle
is sampled in the real DOM first, then mapped to deterministic single-codepoint
`☀`/`☾` glyphs only for screenshot capture; its real text remains part of the
strict normalized-DOM comparison.

Raw PNG differences are decoded and reported. The only cross-platform raster
noise allowance is global (never route-specific): at most 64 pixels may differ,
with a maximum per-channel delta of 2. Dimensions must match, and any larger
change fails. Raw counts, channel delta, and bounds remain in `a0-report.json`;
public bytes, resources, DOM, and ARIA retain exact equality.
Google Fonts and analytics hosts are fulfilled locally with empty responses;
all unknown external requests fail the gate. No API key is loaded.

## Run

From `scripts/`:

```powershell
cmd /c npm run check:equivalence:a0
```

Generated snapshots, screenshots, traces, and JSON reports are written below
the ignored `build/architecture-equivalence/` directory. The report schema is
`build/architecture-equivalence/report/a0-report.json` with candidate status,
environment versions, server identities, public hashes, comparison counts,
completion status, setup/test failures, and any recorded differences. A setup
failure or incomplete test/comparison count can never produce `status: passed`.

## Candidate adapter contract

`site-matrix.js` exposes `candidate: { enabled: false, rootDir: null }`. A later
phase must explicitly supply and enable a third root. A0 never imports,
registers, serves, or reports a candidate.
