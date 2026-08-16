# Blog Reference Density Design

## Confirmed outcome

Every article’s `参考资料` section is rendered as one deliberately quieter auxiliary-information layer. It remains fully expanded and readable, but its type scale, colour and vertical rhythm no longer compete with the final paragraphs or the `继续阅读` block.

## Audience and direction

Readers are AI hiring leads, AI product peers and founders evaluating the density and independence of Leo Liu’s thinking. The broader article keeps the site’s sharp, intellectual and restrained editorial voice. References behave like a magazine’s endnotes: present, credible and easy to scan, without becoming another body-text chapter.

## Standard

| Role | Desktop and mobile treatment |
| --- | --- |
| Section boundary | One quiet top rule, then 20px of separation from the final body element. |
| `参考资料` label | 13px, semibold, auxiliary text colour, 0.06em tracking; no body-heading accent stripe. |
| Source-group heading | 12px, semibold, auxiliary text colour, 14px above and 8px below. |
| Source row and link | 12px / 1.6, the contrast-safe secondary text token `--text-2`, with a 6px row rhythm. Links gain clay colour and underline only on hover or focus. |
| Credibility note | 12px / 1.6, auxiliary text colour; it remains content, not a callout or card. |
| Disclosure | No accordion, truncation or hidden sources. Long reference lists keep meaningful groups. |

The numbers intentionally match the established `llm-reshapes-software-roles.html` reference treatment that the user selected as the visual baseline. They are a specialised caption scale; article body copy remains unchanged at its existing readable size.

## Compatibility model

Historical pages have two valid shapes:

1. Legacy pages wrap references in `.refs`.
2. Markdown-generated pages place the `h2` labelled `参考资料` and its following source elements directly in `.post-body`.

`tools/blog/article-runtime.js` will identify both shapes on load, add presentational classes, and inject the one shared reference stylesheet after page-local CSS. The detection stops before continuation, post navigation, footer navigation or other page chrome. This changes neither historical article text nor reference URLs; it only adds transient DOM classes after the document loads. New articles already load the same runtime through the independent article template, so they inherit the standard automatically. Its compact text uses `--text-2`, rather than low-contrast caption colour, so the 12px scale remains readable in both themes.

## Guardrails

- Only an exact `参考资料` heading starts the treatment; ordinary `h2` sections must retain body-heading styling.
- The runtime uses existing CSS variables (`--border`, `--text-2`, `--clay`) so light and dark themes remain aligned with the page’s own theme tokens.
- `.refs` links retain shared keyboard focus behaviour from `article-links.css`.
- No historical HTML body is regenerated or mass-edited. The existing integrity checker remains the protection against accidental body changes.
