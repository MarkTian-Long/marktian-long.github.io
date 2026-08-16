# Blog Reference Disclosure Design

## Confirmed outcome

All article reference sections are collapsed by default so the primary next-step, `继续阅读`, remains immediately visible after the article’s conclusion. References remain complete, keyboard-accessible and one interaction away; no source text, URL or published article body is rewritten.

## Chosen interaction

The shared article runtime owns a compact disclosure control on every exact `参考资料` heading:

- Initial label: `参考资料 · 展开 N 条来源`, where `N` is the number of source links. If a valid reference block has no links, it falls back to `展开参考资料`.
- Initial state: only the label and its existing top rule are visible. The source groups, lists and credibility note are hidden, so `继续阅读` follows directly.
- Expanded state: the same control reads `收起 N 条来源`; the existing compact hierarchy, links and credibility note reappear in source order.
- The control is a native `button` within the existing heading, with `aria-expanded`; focus is visible and the target remains usable by keyboard.
- A direct reference anchor or a TOC jump to the reference heading expands the block automatically, so a link to `#references` never lands on apparently missing material.

## Why this approach

| Approach | Result | Decision |
| --- | --- | --- |
| Runtime disclosure control | One implementation serves legacy `.refs` and Markdown-generated sibling references, with no published-body rewrite. | Chosen |
| Native `details` conversion | Semantic, but requires moving/wrapping two historical structures differently and complicates established heading/TOC anchors. | Not chosen |
| Per-post static edits | Can tailor every page, but mass-edits historical HTML and duplicates future behaviour. | Rejected |

## Compatibility and guardrails

- The runtime continues to recognise only an exact `参考资料` heading, whether it is inside `.refs` or is a direct child of `.post-body`.
- It hides only the nodes already classified as reference content; navigation, `继续阅读`, source order and all body text remain untouched.
- Existing compact type, AA contrast and light/dark tokens remain unchanged when the disclosure is expanded.
- The disclosure does not write reading state to storage or analytics. It introduces no personal data collection.
- Future articles write the same semantic `h2`/optional `h3`/list/note structure; they do not add a per-post accordion.

## Verification

- Unit tests cover link-count labels, collapsed/expanded state labels and direct-anchor expansion decisions.
- Static checks confirm every published page loads the shared runtime and the historical-body integrity checker remains clean.
- Browser QA covers legacy and Markdown-generated pages, default collapse, click and keyboard expansion, reference-anchor expansion, desktop/mobile, light/dark and visible `继续阅读`.
