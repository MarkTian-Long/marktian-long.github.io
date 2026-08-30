# Blog Visual Publishing Implementation Plan

> **For Codex:** REQUIRED SUB-SKILL: Use executing-plans to implement this plan task-by-task.

**Goal:** Add a per-article visual contract so every future blog post ships with a Codex-generated cover, optional content-justified inline illustrations, deterministic static assets, and complete SEO/deployment validation.

**Architecture:** Keep image creation outside the static site: Codex built-in `imagegen` creates a candidate, a repository script converts it into bounded JPEG/WebP assets, and metadata drives article HTML, social tags, JSON-LD, and the public-dist allowlist. Legacy posts retain the current global cover; `personal-harness` is the single pilot and becomes the first image-contract post.

**Tech Stack:** Node.js CommonJS, `sharp` for deterministic raster processing, vanilla HTML/CSS, JSON metadata, the existing search/public-dist generators, Codex built-in `imagegen`, Node test runner, Playwright-backed browser QA where available.

**Design source:** `docs/plans/2026-08-30-blog-visual-publishing-design.md`

**Required execution skills:** `using-git-worktrees`, `executing-plans`, `test-driven-development`, `imagegen`, `design-review`, `review`, and `verification-before-completion`.

**Hard boundaries:** Do not modify `.github/workflows/`, do not add or expose an API key, do not batch-regenerate historical article bodies, do not add thumbnails to the homepage/blog list, and do not push without the repository's explicit HITL confirmation.

---

### Task 0: Create an isolated implementation worktree and record the baseline

**Files:**
- Verify only: repository and worktree state

**Step 1: Re-read the execution context**

Read in order:

```text
CONVENTIONS.md
docs/agent-context/README.md
docs/agent-context/memory.md
docs/agent-context/skills.md
docs/agent-context/maintenance.md
.agents/skills/publish-blog/SKILL.md
tools/blog/README.md
tools/blog/WRITING_GUIDE.md
tools/blog/BLOG_DESIGN.md
docs/plans/2026-08-30-blog-visual-publishing-design.md
```

Expected: no conflict with the design or repository policy. If rules have changed, stop and reconcile the plan before editing.

**Step 2: Capture the primary-workspace baseline**

Run:

```powershell
git status --short --branch
git diff --name-only
git diff --cached --name-only
git worktree list
```

Expected: record existing changes exactly. Never stash, reset, checkout over, format, or absorb unrelated user work.

**Step 3: Create the isolated worktree**

Use the `using-git-worktrees` skill. Preferred branch and local-only path:

```powershell
git worktree add .worktrees/blog-visual-publishing -b codex/blog-visual-publishing main
```

Expected: the worktree is rooted at `.worktrees/blog-visual-publishing` and does not appear as a tracked repository change. If the branch already exists, inspect it instead of inventing a replacement or deleting anything.

**Step 4: Run baseline checks inside the worktree**

Run from `scripts/`:

```powershell
cmd /c npm test
cmd /c npm run check
```

Expected: both exit 0. If an existing unrelated failure appears, record it before proceeding; do not fix it inside this feature.

---

### Task 1: Define the backward-compatible visual metadata contract

**Files:**
- Create: `scripts/blog-image-contract.js`
- Create: `scripts/blog-image-contract.test.js`
- Modify: `scripts/generate-search-assets.js:13-140`
- Modify: `tools/blog/data/posts-meta.json:1-12`

**Step 1: Write the failing contract tests**

Create fixtures covering:

```javascript
const basePosts = [
  {
    slug: 'new-post',
    title: 'New',
    summary: 'Summary',
    url: 'posts/new-post.html'
  },
  {
    slug: 'legacy-boundary',
    title: 'Legacy',
    summary: 'Summary',
    url: 'posts/legacy-boundary.html'
  }
];

test('posts outside the explicit legacy exemption require visuals', () => {
  assert.throws(() => validateImageContract({
    image_contract: { version: 1, legacy_without_visuals: ['legacy-boundary'] },
    posts: basePosts
  }), /new-post.*visuals/i);
});

test('legacy posts may omit visuals', () => {
  const metadata = {
    image_contract: { version: 1, legacy_without_visuals: ['legacy-boundary'] },
    posts: [basePosts[1]]
  };
  assert.doesNotThrow(() => validateImageContract(metadata));
});
```

Also assert that validation rejects:

- a missing, duplicated, or unknown legacy exemption slug;
- a post that has visuals but remains in the exemption list;
- cover paths outside `assets/images/blog/<slug>/cover.jpg`;
- cover dimensions other than 1200 × 630;
- more than two inline images;
- inline paths outside the post's directory or without `.webp`;
- blank/overlong alt text or captions;
- duplicate image paths.

**Step 2: Run the test and verify it fails**

Run:

```powershell
node --test scripts/blog-image-contract.test.js
```

Expected: FAIL because `blog-image-contract.js` does not exist.

**Step 3: Implement the structural validator**

Export these constants and functions from `scripts/blog-image-contract.js`:

```javascript
const IMAGE_CONTRACT_VERSION = 1;
const COVER_WIDTH = 1200;
const COVER_HEIGHT = 630;
const INLINE_WIDTH = 1280;
const INLINE_HEIGHT = 720;
const MAX_INLINE_IMAGES = 2;

function validateImageContract(metadata) { /* exact checks below */ }
function collectPostImagePaths(posts) { /* cover + inline, unique and sorted */ }
function resolvePostCover(post, config) { /* post cover or legacy fallback */ }
```

`validateImageContract` must:

1. Validate `image_contract.version === 1` and a unique `legacy_without_visuals` string array whose slugs all exist.
2. Require `visuals` for every post not explicitly listed; reject stale exemptions once a post has visuals.
3. When `visuals` exists, require exactly one cover object and an inline array.
4. Require cover path `assets/images/blog/<slug>/cover.jpg`, dimensions 1200 × 630, and trimmed alt text of 1–160 characters.
5. Allow 0–2 inline objects; each must use `assets/images/blog/<slug>/<descriptive-name>.webp`, dimensions 1280 × 720, trimmed alt/caption, and a non-generic kebab-case filename.
6. Reject duplicate paths across cover and inline entries.

`resolvePostCover` returns a normalized object for both cases:

```javascript
return post.visuals?.cover || {
  src: config.blog.imagePath.replace(/^\//, ''),
  alt: config.blog.imageAlt,
  width: config.blog.imageWidth,
  height: config.blog.imageHeight
};
```

**Step 4: Connect the validator without requiring a pilot image yet**

In `generate-search-assets.js`:

- bump `BLOG_SCHEMA_VERSION` from 3 to 4;
- call `validateImageContract(metadata)` inside `validateBlogMetadata`;
- export no duplicate image validation logic.

In `posts-meta.json`, set:

```json
"version": 4,
"image_contract": {
  "version": 1,
  "legacy_without_visuals": ["<all 40 current slugs>"]
}
```

Populate the temporary exemption list from the exact 40 current metadata slugs. Task 7 removes only `personal-harness` after its asset exists. This keeps every intermediate commit green while making the final rule independent of array order.

**Step 5: Run targeted and metadata tests**

Run:

```powershell
node --test scripts/blog-image-contract.test.js scripts/search-foundation.test.js scripts/blog-summary-contract.test.js
node scripts/generate-search-assets.js --check
```

Expected: all tests pass and existing search assets remain current.

**Step 6: Commit the contract**

```powershell
git add scripts/blog-image-contract.js scripts/blog-image-contract.test.js scripts/generate-search-assets.js tools/blog/data/posts-meta.json
git diff --cached --check
git commit -m "feat: define blog visual metadata contract"
```

---

### Task 2: Add deterministic image preparation and asset validation

**Files:**
- Create: `scripts/prepare-blog-image.js`
- Create: `scripts/check-blog-images.js`
- Create: `scripts/blog-image-assets.test.js`
- Modify: `scripts/package.json`
- Modify: `scripts/package-lock.json`
- Modify: `scripts/check-all.js`

**Step 1: Add the raster dependency in the scripts package**

Run from `scripts/`:

```powershell
cmd /c npm install sharp --save-exact
```

Expected: only `scripts/package.json` and `scripts/package-lock.json` change; no dependency enters public browser assets.

**Step 2: Write failing tests for preparation and validation**

Use a project-local fixture directory under `build/test-blog-images/`; do not use `/tmp`. The tests must create a synthetic input raster with `sharp`, then assert:

```javascript
test('cover preparation writes a 1200x630 jpeg under the slug directory', async () => {
  const output = await prepareBlogImage({
    rootDir: fixtureRoot,
    slug: 'sample-post',
    role: 'cover',
    inputPath
  });
  const metadata = await sharp(output).metadata();
  assert.equal(metadata.format, 'jpeg');
  assert.equal(metadata.width, 1200);
  assert.equal(metadata.height, 630);
});
```

Add tests that reject traversal slugs, unknown roles, missing inline names, non-kebab names, and overwriting an existing output. Add a validator fixture that catches missing, wrong-sized, oversized, wrong-format, and orphan image files.

**Step 3: Run the test and verify it fails**

```powershell
node --test scripts/blog-image-assets.test.js
```

Expected: FAIL because the preparation and checking modules do not exist.

**Step 4: Implement `prepare-blog-image.js`**

Required CLI:

```text
node scripts/prepare-blog-image.js --slug <slug> --role cover --input <candidate>
node scripts/prepare-blog-image.js --slug <slug> --role inline --name <descriptive-name> --input <candidate>
```

Required behavior:

```javascript
const profiles = {
  cover: {
    width: 1200,
    height: 630,
    extension: '.jpg',
    maxBytes: 350 * 1024,
    qualities: [82, 78, 74],
    encode: (image, quality) => image.jpeg({ quality, progressive: true, mozjpeg: true })
  },
  inline: {
    width: 1280,
    height: 720,
    extension: '.webp',
    maxBytes: 250 * 1024,
    qualities: [82, 78, 74],
    encode: (image, quality) => image.webp({ quality, effort: 5 })
  }
};
```

- resolve the output exclusively beneath `assets/images/blog/<slug>/`;
- reject an input whose width or height is smaller than the target; never upscale;
- use centered `fit: 'cover'` after the imagegen prompt reserves a safe central subject area;
- rotate according to source orientation and strip metadata by creating a fresh encoded output;
- encode to memory at qualities 82, 78, then 74 and write the first result within the role's byte budget; fail if none qualifies;
- refuse to overwrite any existing file;
- print the final repo-relative path, dimensions, format, and byte size;
- export the core function for tests and keep CLI parsing thin.

**Step 5: Implement `check-blog-images.js`**

The checker must read `posts-meta.json`, call `validateImageContract`, and then:

- compare metadata-declared paths with actual files under `assets/images/blog/`;
- reject missing and orphan files;
- inspect cover JPEGs for 1200 × 630 and ≤ 350 KB;
- inspect inline WebPs for 1280 × 720 and ≤ 250 KB;
- reject unexpected formats and symlinks;
- print `PASS blog image assets: X/X` on success.

Export the validation function so the test can pass a fixture root.

**Step 6: Add the checker to the unified quality gate**

Add `node check-blog-images.js` to `scripts/check-all.js` after JSON/metadata validation and before public-dist checks. The checker must pass with zero current image assets while all 40 current slugs remain explicitly exempt.

**Step 7: Run targeted and full checks**

```powershell
node --test scripts/blog-image-assets.test.js scripts/blog-image-contract.test.js
node scripts/check-blog-images.js
cmd /c npm test
cmd /c npm run check
```

Expected: all exit 0; the asset checker reports zero declared blog images at this intermediate stage.

**Step 8: Commit the deterministic asset pipeline**

```powershell
git add scripts/prepare-blog-image.js scripts/check-blog-images.js scripts/blog-image-assets.test.js scripts/package.json scripts/package-lock.json scripts/check-all.js
git diff --cached --check
git commit -m "feat: add deterministic blog image pipeline"
```

---

### Task 3: Make article SEO use per-post covers with a legacy fallback

**Files:**
- Modify: `scripts/site-config.js:7-15`
- Modify: `scripts/search-foundation.js:133-238`
- Modify: `scripts/search-foundation.test.js:35-195,464-670`
- Modify: `scripts/check-search-foundation.js:248-305`
- Modify: `tools/blog/article-template.html:15-35`
- Generated head-only updates: `tools/blog/posts/*.html`

**Step 1: Write failing SEO tests**

Add one fixture post with `visuals.cover` and one legacy post without it. Assert that:

```javascript
const html = ensureArticleSeo('<html><head><title>A</title></head><body>x</body></html>', post, config);
assert.match(html, /og:image" content="https:\/\/example\.com\/assets\/images\/blog\/new-post\/cover\.jpg"/);
assert.match(html, /og:image:width" content="1200"/);
assert.match(html, /og:image:height" content="630"/);
assert.match(html, /og:image:alt" content="Meaningful alt"/);
assert.match(html, /twitter:card" content="summary_large_image"/);
assert.match(html, /twitter:image:alt" content="Meaningful alt"/);
```

Assert the legacy fixture still uses `/assets/images/og-cover.png`, and that the JSON-LD `image` array uses the same resolved URL as OG/Twitter.

**Step 2: Run the tests and verify they fail**

```powershell
node --test scripts/search-foundation.test.js
```

Expected: FAIL because SEO still reads only `config.blog.imagePath`.

**Step 3: Add explicit fallback image metadata to site config**

Keep the existing path and add:

```javascript
imagePath: '/assets/images/og-cover.png',
imageAlt: 'Leo · AI · Product · Builder',
imageWidth: 1200,
imageHeight: 630,
```

**Step 4: Resolve one article image object in `search-foundation.js`**

Import `resolvePostCover` from `blog-image-contract.js`. Use the resolved object in both `buildArticleJsonLd` and `buildArticleSeoBlock`; do not calculate separate URLs in multiple functions.

The generated block must contain:

```html
<meta property="og:image" content="..." />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:image:alt" content="..." />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:image" content="..." />
<meta name="twitter:image:alt" content="..." />
```

Extend `stripArticleSeo` so repeated generation removes legacy `twitter:card`, image width/height/alt, and twitter image alt before inserting one canonical block. Keep the body-preservation assertion unchanged.

**Step 5: Update the checker and template**

`check-search-foundation.js` must resolve the expected cover per post rather than one global `imageUrl`. Add the new width/height/alt/card expectations.

Update the template's example head to match the generated block and remove the standalone old `twitter:card` tag.

**Step 6: Regenerate head-only search assets**

Run:

```powershell
node scripts/generate-search-assets.js --write
node scripts/check-blog-body-integrity.js
```

Expected: all article SEO heads gain the canonical image metadata; `PASS historical post-body integrity` confirms no article body changed.

**Step 7: Verify SEO tests and generated assets**

```powershell
node --test scripts/search-foundation.test.js scripts/blog-summary-contract.test.js
node scripts/generate-search-assets.js --check
node scripts/check-search-foundation.js
```

Expected: all exit 0; current articles still resolve to the default image until Task 7.

**Step 8: Review the head-only diff and commit**

```powershell
git diff -- tools/blog/posts
git diff --check
git add scripts/site-config.js scripts/search-foundation.js scripts/search-foundation.test.js scripts/check-search-foundation.js tools/blog/article-template.html tools/blog/posts
git commit -m "feat: support per-post blog social images"
```

Reject the commit if any `post-body` content changed.

---

### Task 4: Render article covers and validated Markdown figures

**Files:**
- Create: `scripts/blog-image-rendering.test.js`
- Modify: `tools/blog/generate-post.js:37-183`
- Modify: `tools/blog/article-template.html:37-80`

**Step 1: Write failing generator fixtures**

Create a temporary fixture root or export pure parsing/rendering helpers so tests can cover:

- a metadata cover renders once after the header and before the divider;
- a legacy post renders no cover;
- a registered standalone Markdown image renders a figure with matching alt/caption;
- an unregistered, remote, cross-slug, traversal, or mismatched alt/caption image is rejected;
- cover uses eager/high-priority loading and inline images use lazy loading;
- user-controlled alt/caption values are HTML-escaped.

Representative assertion:

```javascript
assert.match(html, /<figure class="post-cover">[\s\S]*fetchpriority="high"[\s\S]*<\/figure>/);
assert.match(html, /<figure class="post-figure">[\s\S]*loading="lazy"[\s\S]*<figcaption>One sentence<\/figcaption>/);
```

**Step 2: Run the test and verify it fails**

```powershell
node --test scripts/blog-image-rendering.test.js
```

Expected: FAIL because no cover/figure renderer exists.

**Step 3: Add cover and figure placeholders/styles to the template**

Insert `<!-- post-cover -->` immediately after `</header>` and before the divider. Add scoped styles using existing article variables:

```css
.post-cover,.post-figure { margin:24px 0 32px; }
.post-cover img,.post-figure img {
  display:block; width:100%; height:auto;
  border:1px solid var(--border); border-radius:var(--radius);
  background:var(--bg-subtle);
}
.post-figure figcaption {
  margin-top:8px; color:var(--text-3); font-size:12px; line-height:1.6;
}
```

Keep the 390px layout full-width and do not add a lightbox or click handler.

**Step 4: Render metadata covers**

Add a helper that converts `assets/images/...` into an article-relative `../../../assets/images/...` URL and renders:

```html
<figure class="post-cover">
  <img src="../../../assets/images/blog/<slug>/cover.jpg"
       alt="..." width="1200" height="630"
       decoding="async" fetchpriority="high" />
</figure>
```

Replace the template marker with this block or an empty string for legacy posts.

**Step 5: Parse only registered standalone Markdown images**

Extend `isBlockStart` for `^!\[` and parse only this source form:

```markdown
![alt](../../assets/images/blog/<slug>/<name>.webp "caption")
```

Resolve the repo-relative path, find an exact matching entry in `metadata.visuals.inline`, and require alt/caption equality. Render semantic `<figure>` HTML with metadata dimensions and safe escaping. Never allow remote URLs, `data:` URLs, arbitrary HTML, or another article's directory.

**Step 6: Run rendering and existing generator tests**

```powershell
node --test scripts/blog-image-rendering.test.js scripts/search-foundation.test.js scripts/blog-summary-contract.test.js
node scripts/check-blog-body-integrity.js
```

Expected: all pass; no historical body has been regenerated.

**Step 7: Commit generator support**

```powershell
git add scripts/blog-image-rendering.test.js tools/blog/generate-post.js tools/blog/article-template.html
git diff --cached --check
git commit -m "feat: render blog covers and inline figures"
```

---

### Task 5: Include only declared blog images in the Pages artifact

**Files:**
- Modify: `scripts/public-dist-manifest.js:4-62`
- Modify: `scripts/public-dist.test.js:8-40`
- Modify: `scripts/check-public-dist.js` only if reference parsing needs an image-specific fix

**Step 1: Write failing manifest tests**

Create a fixture root with metadata that declares one cover and one inline image. Assert:

```javascript
const files = publicFiles(fixtureRoot);
assert.ok(files.includes('assets/images/blog/sample-post/cover.jpg'));
assert.ok(files.includes('assets/images/blog/sample-post/context-loop.webp'));
assert.ok(!files.includes('assets/images/blog/sample-post/orphan.webp'));
```

Also assert `validateManifest` reports a declared-but-missing image.

**Step 2: Run the test and verify it fails**

```powershell
node --test scripts/public-dist.test.js
```

Expected: FAIL because `publicFiles()` does not read blog visuals.

**Step 3: Derive the exact allowlist from metadata**

Add `listBlogImages(rootDir)` that:

1. Parses `tools/blog/data/posts-meta.json`.
2. Calls `validateImageContract`.
3. Returns `collectPostImagePaths(metadata.posts)`.
4. Never recursively publishes every file in `assets/images/blog/`.

Include the returned paths in `publicFiles(rootDir)`. This keeps the manifest explicit even as articles grow.

**Step 4: Run manifest and smoke tests**

```powershell
node --test scripts/public-dist.test.js scripts/blog-image-contract.test.js
```

Expected: tests pass with no current blog image paths before the pilot.

**Step 5: Commit public artifact support**

```powershell
git add scripts/public-dist-manifest.js scripts/public-dist.test.js scripts/check-public-dist.js
git diff --cached --check
git commit -m "feat: include declared blog images in public dist"
```

---

### Task 6: Document the visual system and extend the publishing workflow

**Files:**
- Create: `tools/blog/VISUAL_GUIDE.md`
- Modify: `tools/blog/README.md`
- Modify: `tools/blog/WRITING_GUIDE.md:600-650`
- Modify: `CONVENTIONS.md:20-45,330-430`
- Modify: `.agents/skills/publish-blog/SKILL.md`
- Generated compatibility update: `.claude/skills/publish-blog/SKILL.md`

**Step 1: Write `VISUAL_GUIDE.md`**

The guide must contain:

- the `Leo Editorial v1` palette, composition and forbidden motifs;
- cover and inline asset profiles;
- the 0–2 inline-image decision gate;
- exact alt/caption rules;
- built-in `imagegen` as the default and CLI fallback only after explicit user choice;
- one shared prompt scaffold:

```text
Use case: stylized-concept
Asset type: blog header image
Primary request: editorial concept illustration for an article about <core judgment>
Scene/backdrop: deep navy field with restrained matte texture
Subject: one visual metaphor representing <mechanism>, using 1-3 large forms
Style/medium: sophisticated editorial illustration, paper-cut relief and matte 3D finish
Composition/framing: wide 1.91:1 composition; important subject inside the central safe area
Lighting/mood: calm, analytical, quietly confident
Color palette: deep navy, clay orange, warm off-white, minimal supporting blue
Constraints: no text; no letters; no numbers; no logos; no trademarks; no watermark
Avoid: glowing brain, humanoid robot head, neon cyberpunk, decorative circuit board, tiny clutter
```

**Step 2: Update the reader/writer documentation**

- Replace the claim that one global cover is sufficient with the new-post/legacy split.
- Document `posts-meta.json` version 4, `image_contract`, `visuals`, asset paths, and Markdown image syntax.
- State explicitly that homepage/blog lists remain text-only.
- Add `node scripts/check-blog-images.js` to publishing checks.

**Step 3: Update the canonical `publish-blog` skill**

Insert the visual stage after final content/metadata review and before HTML generation:

1. Require a cover for every post not present in `legacy_without_visuals`.
2. Decide whether 0–2 inline images add explanatory value.
3. Use built-in `imagegen` by default; never ask for an API key in that mode.
4. Inspect output, allow one targeted revision, and copy the selected candidate into `build/blog-image-work/<slug>/`.
5. Run `prepare-blog-image.js`; update `visuals` and Markdown.
6. Run image, generator, SEO, public-dist and visual checks.
7. Report final paths, final prompts and mode.

State that imagegen failure blocks a new-image-contract publication rather than silently falling back.

**Step 4: Synchronize the Claude compatibility copy**

Run:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/sync-agent-context.ps1 -Write
powershell -ExecutionPolicy Bypass -File scripts/sync-agent-context.ps1
node scripts/check-repository-policy.js
```

Expected: the compatibility copy matches the canonical skill and repository policy passes.

**Step 5: Commit documentation and workflow changes**

```powershell
git add tools/blog/VISUAL_GUIDE.md tools/blog/README.md tools/blog/WRITING_GUIDE.md CONVENTIONS.md .agents/skills/publish-blog/SKILL.md .claude/skills/publish-blog/SKILL.md
git diff --cached --check
git commit -m "docs: add blog visual publishing workflow"
```

---

### Task 7: Generate and land the `personal-harness` pilot cover

**Files:**
- Create: `assets/images/blog/personal-harness/cover.jpg`
- Modify: `tools/blog/data/posts-meta.json`
- Modify: `tools/blog/posts/personal-harness.html`
- Generated SEO head updates only as needed: `tools/blog/posts/*.html`

**Step 1: Build the final pilot prompt**

Use the `imagegen` skill and this normalized prompt:

```text
Use case: stylized-concept
Asset type: blog header image
Primary request: an editorial concept illustration for an article about building a personal AI harness that makes repeated human-AI collaboration accumulate over time
Scene/backdrop: deep navy field with a restrained matte paper texture
Subject: one warm clay-colored personal workspace at the center, surrounded by five distinct modular layers that connect into a coherent loop, suggesting context, memory, tools, methods, and feedback without labels
Style/medium: sophisticated editorial illustration, paper-cut relief blended with subtle matte 3D, clean geometry, restrained detail
Composition/framing: wide 1.91:1 composition; central subject and all essential connections inside the middle 75 percent so a 1200x630 center crop remains intact
Lighting/mood: calm, analytical, quietly confident, soft directional depth
Color palette: deep navy, clay orange, warm off-white, a very small amount of supporting blue
Constraints: no text; no letters; no numbers; no logos; no trademarks; no watermark; no UI screenshot
Avoid: glowing brain, humanoid robot head, neon cyberpunk, decorative circuit board, tiny clutter, stock-photo look
```

**Step 2: Generate and inspect one candidate**

Use built-in `imagegen`, not the CLI/API fallback. Inspect the full-resolution result for:

- one clear metaphor and central safe composition;
- no accidental text, glyphs, watermark or brand marks;
- no broken geometry or meaningless extra modules;
- palette compatibility with both blog themes.

If it fails, make one targeted revision that names only the failed condition. Do not generate an open-ended batch.

**Step 3: Copy the selected candidate into project-local work space**

Copy, without overwriting, to:

```text
build/blog-image-work/personal-harness/candidate.png
```

The final project-referenced asset must not remain only under `$CODEX_HOME/generated_images/`.

**Step 4: Prepare the final cover**

Run:

```powershell
node scripts/prepare-blog-image.js --slug personal-harness --role cover --input build/blog-image-work/personal-harness/candidate.png
```

Expected: `assets/images/blog/personal-harness/cover.jpg`, exactly 1200 × 630 and ≤ 350 KB.

**Step 5: Activate the visual contract for the pilot**

Remove only `personal-harness` from `image_contract.legacy_without_visuals`, leaving the other 39 current slugs unchanged, then add metadata:

```json
"image_contract": {
  "version": 1,
  "legacy_without_visuals": ["<the remaining 39 historical slugs>"]
}
```

```json
"visuals": {
  "cover": {
    "src": "assets/images/blog/personal-harness/cover.jpg",
    "alt": "深色背景中，一个个人工作台被多层协作模块环绕连接，象征 Context、Memory、工具、方法和反馈组成的 Personal Harness",
    "width": 1200,
    "height": 630
  },
  "inline": []
}
```

Do not add an inline image merely to exercise the feature; unit fixtures already cover it.

**Step 6: Generate the pilot article and search metadata**

Run:

```powershell
node tools/blog/generate-post.js --write docs/blog/personal-harness.md tools/blog/posts/personal-harness.html
node scripts/generate-search-assets.js --write
```

Expected: the article gains one cover outside `post-body`; its OG/Twitter/JSON-LD image changes to the new absolute URL. Other article bodies remain untouched.

**Step 7: Run targeted pilot validation**

```powershell
node scripts/check-blog-images.js
node tools/blog/generate-post.js docs/blog/personal-harness.md tools/blog/posts/personal-harness.html
node scripts/generate-search-assets.js --check
node scripts/check-search-foundation.js
node scripts/check-blog-body-integrity.js
```

Expected: all exit 0. The generator prints that output is current, image assets report 1/1, and historical body integrity passes.

**Step 8: Commit the pilot separately**

```powershell
git add assets/images/blog/personal-harness/cover.jpg tools/blog/data/posts-meta.json tools/blog/posts/personal-harness.html
git diff --cached --check
git commit -m "feat: add Personal Harness article cover"
```

---

### Task 8: Verify the complete local publication contract

**Files:**
- Verify all files changed by Tasks 1–7
- Create only ignored output: `build/public-dist-blog-images/`

**Step 1: Run the complete automated suite**

From the repository root:

```powershell
node scripts/check-blog-images.js
node scripts/generate-search-assets.js --check
node scripts/check-search-foundation.js
node --test scripts/search-foundation.test.js scripts/blog-image-contract.test.js scripts/blog-image-assets.test.js scripts/blog-image-rendering.test.js scripts/public-dist.test.js scripts/blog-summary-contract.test.js scripts/blog-relationships.test.js scripts/blog-reference-presentation.test.js
node scripts/migrate-blog-continue-reading.js --check
node scripts/check-blog-body-integrity.js
node scripts/check-repository-policy.js
```

Then from `scripts/`:

```powershell
cmd /c npm test
cmd /c npm run check
```

Expected: every command exits 0.

**Step 2: Build and check a fresh public artifact**

Use an absent or empty output directory:

```powershell
node scripts/build-public-dist.js --out build/public-dist-blog-images
node scripts/check-public-dist.js --out build/public-dist-blog-images
```

Expected: the artifact contains `assets/images/blog/personal-harness/cover.jpg`, contains no `build/blog-image-work` candidate, and public-dist smoke passes. If the output directory is non-empty, choose a new explicit sibling path; do not delete or overwrite it implicitly.

**Step 3: Serve the real page locally**

Run a local HTTP server from the repository root and open:

```text
http://127.0.0.1:8080/tools/blog/posts/personal-harness.html
```

Do not use `file://`; the article runtime fetches metadata.

**Step 4: Perform required visual-model review**

Use `design-review` and inspect real screenshots at:

- 1440 × 1000, light theme;
- 1440 × 1000, dark theme;
- 390 × 844, light theme;
- 390 × 844, dark theme.

Check the page with the image loaded and also simulate image-load failure once to confirm alt text does not collapse the header. Verify crop, border, corner radius, spacing after summary, title/image hierarchy, no horizontal overflow, and no TOC collision.

If a visible defect is found, fix only the image/template scope, rerun the affected test, and repeat the screenshot.

**Step 5: Verify source and generated boundaries**

Run:

```powershell
git diff main...HEAD --name-only
git diff main...HEAD --stat
git diff main...HEAD -- tools/blog/posts
git status --short --branch
```

Expected:

- no `.github/workflows/` changes;
- no config.local/API credential changes;
- no homepage/blog-list visual changes;
- no historical `post-body` changes;
- no generated candidate or public `dist/` output tracked.

---

### Task 9: Review, hand off, and release only after HITL

**Files:**
- Review the complete branch diff

**Step 1: Run the required review and completion skills**

Use `review`, then `verification-before-completion`. Resolve all in-scope findings and rerun the affected checks. Do not claim completion from earlier results after a change.

**Step 2: Confirm the branch is fully committed**

```powershell
git status --short --branch
git log --oneline --decorate main..HEAD
```

Expected: clean branch with the planned commits only.

**Step 3: Report local completion before any push**

Report:

- final cover path and dimensions/bytes;
- final imagegen prompt and built-in mode;
- metadata/SEO/public-dist contract results;
- exact automated commands and outcomes;
- screenshot page, viewport, theme/state and conclusion;
- changed files and commit SHAs;
- confirmation that historical bodies, list pages, workflow and credentials were not changed.

**Step 4: Pause for push HITL**

Show remote, branch and commit SHA, then explicitly wait. Do not execute `git push` or modify a workflow without user confirmation.

**Step 5: After authorized push, verify remote and Pages**

Follow `.agents/skills/publish-blog/SKILL.md`:

1. push the approved branch/commit without force;
2. verify remote SHA equals local SHA;
3. wait for Pages;
4. verify article URL returns 200 and contains the unique title;
5. verify `https://marktian-long.github.io/assets/images/blog/personal-harness/cover.jpg` returns 200 with an image content type;
6. verify the live article head contains the exact per-post OG/Twitter/JSON-LD image URL.

Only after all six checks may the result be called published. If push is not authorized, report local completion and the remaining release gate precisely.
