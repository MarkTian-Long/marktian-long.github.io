const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');
const assert = require('node:assert/strict');

const { applyPublishHandoff, parsePublishHandoff } = require('../tools/blog/publish-handoff.js');
const { generatePost } = require('../tools/blog/generate-post.js');

function makeFixture(markdown) {
  const rootDir = fs.mkdtempSync(path.join(os.tmpdir(), 'blog-publish-handoff-'));
  const sourcePath = path.join(rootDir, 'docs/blog/current.md');
  const metadataPath = path.join(rootDir, 'tools/blog/data/posts-meta.json');
  fs.mkdirSync(path.dirname(sourcePath), { recursive: true });
  fs.mkdirSync(path.dirname(metadataPath), { recursive: true });
  fs.writeFileSync(sourcePath, markdown, 'utf8');
  fs.writeFileSync(metadataPath, JSON.stringify({
    version: 4,
    image_contract: { version: 1, legacy_without_visuals: ['current', 'alignment-under-change', 'harness-engineering'] },
    posts: [
      { slug: 'current', date: '2026.08', title: 'Current', summary: 'Summary', share_quote: 'Quote.', url: 'posts/current.html', tags: ['技术判断'], topics: ['Agent'], category: '技术', concepts: ['a', 'b', 'c', 'd'], relations: [{ slug: 'harness-engineering', type: 'builds_on' }] },
      { slug: 'alignment-under-change', date: '2026.07', title: 'Alignment', summary: 'Summary', share_quote: 'Quote.', url: 'posts/alignment-under-change.html', tags: ['技术判断'], topics: ['Agent'], category: '技术', concepts: ['e', 'f', 'g', 'h'], relations: [{ slug: 'harness-engineering', type: 'companion' }] },
      { slug: 'harness-engineering', date: '2026.06', title: 'Harness', summary: 'Summary', share_quote: 'Quote.', url: 'posts/harness-engineering.html', tags: ['技术判断'], topics: ['Agent'], category: '技术', concepts: ['i', 'j', 'k', 'l'], relations: [{ slug: 'alignment-under-change', type: 'builds_on' }] }
    ]
  }, null, 2) + '\n', 'utf8');
  return { rootDir, sourcePath, metadataPath };
}

const handoff = [
  '# Current',
  '',
  '> Summary',
  '',
  '---',
  '',
  '正文保留 [Harness](https://example.test/tools/blog/posts/harness-engineering.html) 链接。',
  '',
  'publish_handoff:',
  '  relations:',
  '    - slug: alignment-under-change',
  '      type: builds_on',
  '  body_link_only:',
  '    - harness-engineering',
  ''
].join('\n');

const fencedHandoff = [
  '# Current',
  '',
  '> Summary',
  '',
  '---',
  '',
  '正文保留 [Harness](https://example.test/tools/blog/posts/harness-engineering.html) 链接。',
  '',
  '```yaml',
  'publish_handoff:',
  '  relations:',
  '    - slug: alignment-under-change',
  '      type: builds_on',
  '  body_link_only:',
  '    - harness-engineering',
  '```',
  ''
].join('\n');

test('publish handoff parses only the final transport block and strips it from Markdown', () => {
  const parsed = parsePublishHandoff(handoff, 'current.md');
  assert.deepEqual(parsed.handoff, {
    relations: [{ slug: 'alignment-under-change', type: 'builds_on' }],
    bodyLinkOnly: ['harness-engineering']
  });
  assert.doesNotMatch(parsed.markdown, /publish_handoff|body_link_only/);
  assert.match(parsed.markdown, /harness-engineering\.html/);
});

test('publish handoff replaces only the declared strong relations and never writes body_link_only to metadata', () => {
  const fixture = makeFixture(handoff);
  const result = applyPublishHandoff({ sourcePath: fixture.sourcePath, rootDir: fixture.rootDir });
  const metadata = JSON.parse(fs.readFileSync(fixture.metadataPath, 'utf8'));
  const current = metadata.posts.find((post) => post.slug === 'current');
  const source = fs.readFileSync(fixture.sourcePath, 'utf8');

  assert.deepEqual(result.relations, [{ slug: 'alignment-under-change', type: 'builds_on' }]);
  assert.deepEqual(current.relations, [{ slug: 'alignment-under-change', type: 'builds_on' }]);
  assert.equal(Object.hasOwn(current, 'body_link_only'), false);
  assert.doesNotMatch(source, /publish_handoff|body_link_only/);
  assert.match(source, /harness-engineering\.html/);
});

test('publish handoff accepts fenced YAML, strips both fences, and preserves body links', () => {
  const fixture = makeFixture(fencedHandoff);
  const result = applyPublishHandoff({ sourcePath: fixture.sourcePath, rootDir: fixture.rootDir });
  const metadata = JSON.parse(fs.readFileSync(fixture.metadataPath, 'utf8'));
  const current = metadata.posts.find((post) => post.slug === 'current');
  const source = fs.readFileSync(fixture.sourcePath, 'utf8');

  assert.deepEqual(result.relations, [{ slug: 'alignment-under-change', type: 'builds_on' }]);
  assert.deepEqual(result.bodyLinkOnly, ['harness-engineering']);
  assert.deepEqual(current.relations, [{ slug: 'alignment-under-change', type: 'builds_on' }]);
  assert.equal(Object.hasOwn(current, 'body_link_only'), false);
  assert.doesNotMatch(source, /publish_handoff|body_link_only|```yaml|```/);
  assert.match(source, /harness-engineering\.html/);
});

test('ordinary fenced YAML examples are not treated as a publish handoff or written to metadata', () => {
  const example = [
    '# Current',
    '',
    '```yaml',
    'publish_handoff:',
    '  example: true',
    '```',
    '',
    '正文仍然在 code fence 后。',
    ''
  ].join('\n');
  const fixture = makeFixture(example);
  const beforeMetadata = fs.readFileSync(fixture.metadataPath, 'utf8');
  const beforeSource = fs.readFileSync(fixture.sourcePath, 'utf8');

  assert.equal(parsePublishHandoff(example, 'current.md').handoff, null);
  assert.throws(
    () => applyPublishHandoff({ sourcePath: fixture.sourcePath, rootDir: fixture.rootDir }),
    /No publish handoff found/
  );
  assert.equal(fs.readFileSync(fixture.metadataPath, 'utf8'), beforeMetadata);
  assert.equal(fs.readFileSync(fixture.sourcePath, 'utf8'), beforeSource);
});

test('malformed final fenced handoff is rejected explicitly without writes', () => {
  const malformed = [
    '# Current',
    '',
    '```yaml',
    'publish_handoff:',
    '  example: true',
    '```',
    ''
  ].join('\n');
  const fixture = makeFixture(malformed);
  const beforeMetadata = fs.readFileSync(fixture.metadataPath, 'utf8');
  const beforeSource = fs.readFileSync(fixture.sourcePath, 'utf8');

  assert.throws(
    () => parsePublishHandoff(malformed, 'current.md'),
    /Publish handoff must be the final transport block/
  );
  assert.throws(
    () => applyPublishHandoff({ sourcePath: fixture.sourcePath, rootDir: fixture.rootDir }),
    /Publish handoff must be the final transport block/
  );
  assert.equal(fs.readFileSync(fixture.metadataPath, 'utf8'), beforeMetadata);
  assert.equal(fs.readFileSync(fixture.sourcePath, 'utf8'), beforeSource);
});

test('publish handoff updates only the current post and preserves target metadata', () => {
  const fixture = makeFixture(handoff);
  const before = JSON.parse(fs.readFileSync(fixture.metadataPath, 'utf8'));
  applyPublishHandoff({ sourcePath: fixture.sourcePath, rootDir: fixture.rootDir });
  const after = JSON.parse(fs.readFileSync(fixture.metadataPath, 'utf8'));

  for (const slug of ['alignment-under-change', 'harness-engineering']) {
    assert.deepEqual(
      after.posts.find((post) => post.slug === slug),
      before.posts.find((post) => post.slug === slug),
      `${slug} metadata must remain unchanged`
    );
  }
  assert.deepEqual(after.posts.find((post) => post.slug === 'current').relations, [
    { slug: 'alignment-under-change', type: 'builds_on' }
  ]);
});

test('publish handoff rejects invalid relation targets, relation types, self-references, and duplicates', () => {
  for (const [label, replacement] of [
    ['missing target', 'slug: missing'],
    ['invalid type', 'type: unknown'],
    ['self reference', 'slug: current'],
    ['duplicate target', 'type: builds_on\n    - slug: alignment-under-change\n      type: companion']
  ]) {
    const fixture = makeFixture(handoff.replace('slug: alignment-under-change\n      type: builds_on', replacement));
    assert.throws(() => applyPublishHandoff({ sourcePath: fixture.sourcePath, rootDir: fixture.rootDir }), /publish handoff|Post relation/i, label);
  }
});

test('publish handoff rejects multiple handoffs and content after the final handoff', () => {
  const multiple = makeFixture(handoff + '\npublish_handoff:\n  relations: []\n');
  assert.throws(
    () => applyPublishHandoff({ sourcePath: multiple.sourcePath, rootDir: multiple.rootDir }),
    /Publish handoff must appear at most once|final transport block/
  );

  const trailing = makeFixture(handoff + '\n正文尾巴\n');
  assert.throws(
    () => applyPublishHandoff({ sourcePath: trailing.sourcePath, rootDir: trailing.rootDir }),
    /final transport block/
  );
});

test('generator rejects a pending publish handoff so it cannot appear in HTML', () => {
  const fixture = makeFixture(handoff);
  assert.throws(
    () => generatePost({ mode: 'check', sourcePath: fixture.sourcePath, outputPath: path.join(fixture.rootDir, 'current.html') }),
    /Publish handoff must be applied before generating HTML/
  );
});
