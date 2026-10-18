# Leo Liu · Personal Website

[中文](README.md) | [English](README.en.md)

> A personal website centered on “Thought Fragments”: articles develop ideas, tools record experiments, and sanitized case studies preserve project methods.

This is the English repository overview. Linked articles, detailed guides, and tool interfaces may still be in Chinese.

## Visit the site

[marktian-long.github.io](https://marktian-long.github.io)

The public site consists of static pages and can be opened directly. The local Node toolchain is used only for generation, validation, and pre-publication checks.

## Thought Fragments comes first

[Read Thought Fragments](https://marktian-long.github.io/tools/blog/)

The blog records observations on AI, products, technology, business, and industry. Articles are the main thread of the site: tools, prototypes, and case studies add practical examples and evidence to the ideas developed in writing.

## How to browse

The homepage organizes content in this order:

1. **Home and introduction**: personal focus, interests, and contact information.
2. **Thought Fragments**: ongoing articles on AI, products, technology, business, industry, and practice, with a full blog archive.
3. **Tools and workflows**: selected GitHub projects illustrating product work and collaboration methods, each with its purpose, conditions, and one starting point.
4. **Prototypes and research**: interactive prototypes and information tools that open independently.
5. **Past product case studies**: sanitized accounts in their historical context, with expandable decisions and process notes. Stages and metrics retain their original context.
6. **Contact**: email, phone, and website links.

## Content entry points

| Area | Path | Contents |
| --- | --- | --- |
| Thought Fragments | [`tools/blog/`](tools/blog/) | Article archive, filters, and individual article pages |
| Tools and workflows | [`index.html#resources`](index.html#resources) | Multi-platform Content Library, Local Folder Bridge, AI Workflow Kit, and Harness · AI collaboration framework |
| Homepage | [`index.html`](index.html) | Main entry for articles, GitHub projects, on-site prototypes, case studies, and contact information |
| Interactive prototypes | [`tools/`](tools/) | Four AI product and system prototypes for specific scenarios |
| Information tools | [`tools/`](tools/) | Four tools for everyday information gathering and analysis |

Before adding a GitHub project, use the [homepage project selection guidelines](docs/github-resources-guidelines.md) to assess reader value and how well it represents the author's work. The current four selections and rationale for Kit are in the [2026-10-18 Kit selection record](docs/plans/2026-10-18-homepage-kit-selection.md). The [2026-10-11 homepage positioning](docs/plans/2026-10-11-homepage-project-positioning.md) preserves the earlier three-project selection.

## Prototypes and research

### Interactive prototypes

| Tool | Path | Description |
| --- | --- | --- |
| ESOP field extraction demo | [`tools/esop-extractor/`](tools/esop-extractor/) | A workbench for field evidence checks, human review, offline evaluation, and session-scoped custom endpoints |
| A-share AI assistant | [`tools/stock/`](tools/stock/) | A financial research prototype with explicit Mock/network boundaries, per-claim citations, feedback regression, and tool traces |
| Intelligent customer service design sandbox | [`tools/service-agent/`](tools/service-agent/) | A decision sandbox with three-scenario acceptance, fault injection, human-in-the-loop review, run retrospectives, and safe export |
| ASCI research task execution system | [`tools/asci/`](tools/asci/) | A 14-node research protocol with audit traces, human checkpoints, and a recoverable fallback pipeline |

### Information tools

| Tool | Path | Description |
| --- | --- | --- |
| AI product analysis | [`tools/ai-insights/`](tools/ai-insights/) | A static research archive with filters, deep links, sources, and explicit items awaiting review |
| Frontier radar | [`tools/radar/`](tools/radar/) | An information entry point organized by research intent, coverage gaps, and where to go next |
| Trend snapshots | [`tools/trends/`](tools/trends/) | A signal assessment workspace separating historical snapshots from structural review, with action filters and a source ledger |
| Agent landscape | [`tools/agent-hub/`](tools/agent-hub/) | A six-question guide to deciding whether an Agent is needed, with controls, fallback, and alternatives |

All public tools open independently. They use static data or Mock demonstrations and contain no third-party service credentials.

## Maintaining Thought Fragments

The single source of blog metadata is [`tools/blog/data/posts-meta.json`](tools/blog/data/posts-meta.json). New Markdown drafts live in [`docs/blog/`](docs/blog/), and public article pages live in [`tools/blog/posts/`](tools/blog/posts/).

Historical articles retain their original published text; older articles are not rewritten in bulk to match a template. Scripts and metadata maintain SEO, RSS, the sitemap, and related-article navigation.

## Technical and publication architecture

```text
Public visitors
    |
    +-- index.html                  Homepage, runs directly in the browser
    +-- tools/blog/                 Blog and article pages
    +-- tools/<name>/               Independent static tools

Local validation and publication
    |
    +-- scripts/public-dist-manifest.js   Public file allowlist
    +-- scripts/build-public-dist.js      Build dist/ for publication
    +-- scripts/check-public-dist.js      File and link checks
    +-- scripts/build-candidate-site.js   Build the candidate generated site
    +-- scripts/check-candidate-equivalence.js
                                         Compare candidate and public baseline
```

- **Public runtime**: HTML, CSS, and Vanilla JavaScript, with no framework runtime dependency.
- **Publication boundary**: GitHub Pages receives only files generated into `dist/` by an explicit allowlist.
- **Candidate generation**: Eleventy is used only for local candidate builds and equivalence validation. It writes to the ignored `build/candidate-site/` directory and does not overwrite public source files or `dist/` by default.
- **Write controls**: generators check or produce candidate output by default; updating public generated files requires an explicit `--write`.
- **Tool boundary**: public tools are passed through using an exact file allowlist, preserving standalone static pages and Mock boundaries.

This keeps the public site simple while providing a verifiable rehearsal path for maintenance.

## Local preview and validation

```bash
# Preview locally to avoid browser file:// restrictions
python -m http.server 8080
# Open http://localhost:8080
```

The development checks below use Windows terminal syntax. Start in the repository root:

```powershell
cd scripts
cmd /c npm ci
cmd /c npx playwright install chromium
cmd /c npm run check
cmd /c npm run build:public
cmd /c npm run check:public-dist
cmd /c npm run check:equivalence:a0
cmd /c npm run build:candidate
cmd /c npm run check:equivalence:candidate
```

Before committing, return to the repository root and also run:

```bash
node scripts/check-repository-policy.js
```

See [CONVENTIONS.md](CONVENTIONS.md) for development conventions and [docs/repository-policy.md](docs/repository-policy.md) for repository file boundaries.

## License

Personal website. All rights reserved.
