'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { validateImageContract } = require('./blog-image-contract');
const { validateStaticSvg } = require('./check-blog-images');
const { parseSourceMarkdown } = require('../tools/blog/markdown-source');
const { buildPage, renderStandaloneImage } = require('../tools/blog/generate-post');

const root = path.resolve(__dirname, '..');
const sample = {
  slug: 'svg-diagram-fixture',
  visuals: { inline: [{
    src: 'assets/images/blog/svg-diagram-fixture/value-feedback-loop.svg',
    alt: '工作过程与反馈形成循环', caption: '新证据可以修正已有判断。',
    width: 1280, height: 720,
  }] },
};
const image = sample.visuals.inline[0];

test('registered SVG diagrams retain the existing image metadata contract', () => {
  const metadata = { image_contract: { version: 1, legacy_without_visuals: [] }, posts: [sample] };
  assert.doesNotThrow(() => validateImageContract(metadata));
  const markdown = `![${image.alt}](../../${image.src} "${image.caption}")`;
  const html = renderStandaloneImage(markdown, sample, 'docs/blog/svg-diagram-fixture.md');
  assert.ok(html.includes(`src="../../../${image.src}"`));
  assert.ok(html.includes('width="1280" height="720"'));
  assert.ok(html.includes(image.caption));
  const remote = markdown.replace('../../assets/', 'https://example.com/assets/');
  assert.throws(() => renderStandaloneImage(remote, sample, 'docs/blog/svg-diagram-fixture.md'), /registered local/);
});

test('static diagram validation rejects executable or external SVG content', () => {
  assert.doesNotThrow(() => validateStaticSvg('<svg><path marker-end="url(#arrow)"/></svg>', 'diagram.svg'));
  const fragments = [
    '<script>alert(1)</script>',
    '<foreignObject><div>external HTML</div></foreignObject>',
    '<image href="https://example.com/pixel.png"/>',
    '<g onclick="alert(1)"/>',
    '<style>@import "https://example.com/style.css";</style>',
    '<style>.x { fill: url(https://example.com/x); }</style>',
    '<animate attributeName="x"/>',
  ];
  for (const fragment of fragments) {
    assert.throws(() => validateStaticSvg(`<svg>${fragment}</svg>`, 'unsafe.svg'), /static, self-contained/);
  }
  assert.throws(() => validateStaticSvg('<!DOCTYPE svg><svg></svg>', 'unsafe.svg'), /static, self-contained/);
});

test('published SVG diagrams and generated articles match their authoritative sources', () => {
  const metadata = JSON.parse(fs.readFileSync(path.join(root, 'tools/blog/data/posts-meta.json'), 'utf8'));
  const template = fs.readFileSync(path.join(root, 'tools/blog/article-template.html'), 'utf8');
  for (const post of metadata.posts) {
    const diagrams = (post.visuals?.inline || []).filter(item => item.src.endsWith('.svg'));
    if (!diagrams.length) continue;
    for (const diagram of diagrams) {
      validateStaticSvg(fs.readFileSync(path.join(root, diagram.src), 'utf8'), diagram.src);
    }
    const sourcePath = `docs/blog/${post.slug}.md`;
    const source = fs.readFileSync(path.join(root, sourcePath), 'utf8');
    const parsed = parseSourceMarkdown(source, sourcePath);
    assert.deepEqual(parsed.frontmatter.topics, post.topics);
    const expected = buildPage(template, parsed.bodyMarkdown, post, sourcePath);
    const actual = fs.readFileSync(path.join(root, `tools/blog/posts/${post.slug}.html`), 'utf8');
    assert.equal(actual, expected, `Rendered article is stale: ${post.slug}`);
  }
});
