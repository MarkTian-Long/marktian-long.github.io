'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

const {
  injectPostCover,
  renderMarkdown,
  renderPostCover,
  renderStandaloneImage,
} = require('../tools/blog/generate-post.js');

const visualPost = {
  slug: 'sample-post',
  title: 'Sample post',
  summary: 'Sample summary',
  visuals: {
    cover: {
      src: 'assets/images/blog/sample-post/cover.jpg',
      alt: 'Harness "loop" <map>',
      width: 1200,
      height: 630,
    },
    inline: [{
      src: 'assets/images/blog/sample-post/context-loop.webp',
      alt: 'Context <loop>',
      caption: 'One & useful sentence',
      width: 1280,
      height: 720,
    }],
  },
};

test('metadata cover renders once after the header and before the divider', () => {
  const template = '<main><header class="post-header">Header</header>\n<!-- post-cover -->\n<hr class="divider" /></main>';
  const html = injectPostCover(template, visualPost);
  const headerEnd = html.indexOf('</header>');
  const coverStart = html.indexOf('<figure class="post-cover">');
  const dividerStart = html.indexOf('<hr class="divider"');

  assert.ok(headerEnd < coverStart && coverStart < dividerStart);
  assert.equal((html.match(/class="post-cover"/g) || []).length, 1);
  assert.match(html, /src="\.\.\/\.\.\/\.\.\/assets\/images\/blog\/sample-post\/cover\.jpg"/);
  assert.match(html, /alt="Harness &quot;loop&quot; &lt;map&gt;"/);
  assert.match(html, /width="1200" height="630"/);
  assert.match(html, /loading="eager" decoding="async" fetchpriority="high"/);
});

test('legacy posts render no cover and consume the template marker', () => {
  const template = '<header>Header</header>\n<!-- post-cover -->\n<hr class="divider" />';
  const html = injectPostCover(template, { slug: 'legacy-post' });

  assert.doesNotMatch(html, /post-cover|post-cover -->/);
  assert.equal(renderPostCover({ slug: 'legacy-post' }), '');
});

test('registered standalone Markdown images render semantic lazy figures', () => {
  const line = '![Context <loop>](../../assets/images/blog/sample-post/context-loop.webp "One & useful sentence")';
  const html = renderStandaloneImage(line, visualPost, 'docs/blog/sample-post.md');

  assert.match(html, /^<figure class="post-figure">/);
  assert.match(html, /src="\.\.\/\.\.\/\.\.\/assets\/images\/blog\/sample-post\/context-loop\.webp"/);
  assert.match(html, /alt="Context &lt;loop&gt;"/);
  assert.match(html, /width="1280" height="720" loading="lazy" decoding="async"/);
  assert.match(html, /<figcaption>One &amp; useful sentence<\/figcaption>/);
});

test('Markdown parsing treats a registered standalone image as a figure block', () => {
  const markdown = [
    '# Sample post',
    '',
    '> Sample summary',
    '',
    '---',
    '',
    '## Context',
    '',
    '![Context <loop>](../../assets/images/blog/sample-post/context-loop.webp "One & useful sentence")',
  ].join('\n');
  const result = renderMarkdown(markdown, visualPost, 'docs/blog/sample-post.md');

  assert.match(result.bodyHtml, /<h2 id="section-1">Context<\/h2>/);
  assert.match(result.bodyHtml, /<figure class="post-figure">/);
  assert.doesNotMatch(result.bodyHtml, /<p>!\[/);
});

test('standalone images reject unsafe, unregistered, and metadata-mismatched sources', () => {
  const invalid = [
    '![Context <loop>](https://example.com/context.webp "One & useful sentence")',
    '![Context <loop>](data:image/webp;base64,AAAA "One & useful sentence")',
    '![Context <loop>](../../assets/images/blog/other-post/context-loop.webp "One & useful sentence")',
    '![Context <loop>](../../assets/images/blog/sample-post/../other-post/context-loop.webp "One & useful sentence")',
    '![Context <loop>](../../assets/images/blog/sample-post/unregistered.webp "One & useful sentence")',
    '![Wrong alt](../../assets/images/blog/sample-post/context-loop.webp "One & useful sentence")',
    '![Context <loop>](../../assets/images/blog/sample-post/context-loop.webp "Wrong caption")',
    '![Context <loop>](../../assets/images/blog/sample-post/context-loop.webp)',
  ];

  for (const line of invalid) {
    assert.throws(
      () => renderStandaloneImage(line, visualPost, 'docs/blog/sample-post.md'),
      /Markdown image|registered|metadata|article|local/i,
      line
    );
  }
});
