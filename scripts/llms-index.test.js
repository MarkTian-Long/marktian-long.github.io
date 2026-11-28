const assert = require('node:assert/strict');
const test = require('node:test');

const {
  buildLlmsIndex,
  escapeMarkdownText,
  validatePublicProjects
} = require('./llms-index');

const config = {
  siteUrl: 'https://marktian-long.github.io',
  siteDescription: 'Leo Liu — AI 产品与工程实践。',
  author: { name: 'Leo Liu' },
  blog: { path: '/tools/blog/', feedPath: '/feed.xml' },
  toolPages: [
    { path: '/tools/radar/', title: '前沿雷达', description: '静态信源目录。' },
    { path: '/tools/service-agent/', title: '智能客服沙盘', description: 'Mock 场景演示。' }
  ],
  publicProjects: [
    { name: 'Public Project', url: 'https://github.com/MarkTian-Long/public-project', description: 'Public description.', featured: true },
    { name: 'Other Project', url: 'https://github.com/MarkTian-Long/other-project', description: 'Other description.', featured: false }
  ]
};

const posts = [
  {
    slug: 'first-post',
    date: '2026.11',
    title: 'A [featured] article',
    summary: 'Summary with <markup> & evidence.',
    url: 'posts/first-post.html',
    category: '技术',
    topics: ['Agent']
  },
  {
    slug: 'second-post',
    date: '2026.10',
    title: 'Second article',
    summary: 'Another summary.',
    url: 'posts/second-post.html',
    category: '产品',
    topics: ['产品设计']
  }
];

test('buildLlmsIndex includes canonical site, featured writing, tools, and curated public projects', () => {
  const output = buildLlmsIndex(config, posts, ['first-post']);

  assert.match(output, /# Leo Liu — AI Builder/);
  assert.match(output, /Homepage: https:\/\/marktian-long\.github\.io\//);
  assert.match(output, /Blog archive: https:\/\/marktian-long\.github\.io\/tools\/blog\//);
  assert.match(output, /RSS feed: https:\/\/marktian-long\.github\.io\/feed\.xml/);
  assert.match(output, /Sitemap: https:\/\/marktian-long\.github\.io\/sitemap\.xml/);
  assert.ok(output.includes('A \\[featured\\] article'));
  assert.match(output, /2026\.11 · Summary with &lt;markup&gt; &amp; evidence\./);
  assert.match(output, /前沿雷达/);
  assert.match(output, /智能客服沙盘/);
  assert.match(output, /Public Project/);
  assert.match(output, /Other Project/);
  assert.doesNotMatch(output, /second-post/);
  assert.doesNotMatch(output, /harness-personal|content-publishing-workbench/);
});

test('Markdown text escaping neutralizes links, raw HTML, and line breaks', () => {
  assert.equal(
    escapeMarkdownText('A [label](url) <script> & line\nbreak'),
    'A \\[label\\](url) &lt;script&gt; & line break'
  );
});

test('public project validation rejects non-owned, non-HTTPS, and duplicate repositories', () => {
  assert.throws(
    () => validatePublicProjects([{ name: 'Private', url: 'https://github.com/other/private', description: 'x', featured: false }]),
    /Only explicitly curated MarkTian-Long public repository URLs/
  );
  assert.throws(
    () => validatePublicProjects([{ name: 'Insecure', url: 'http://github.com/MarkTian-Long/demo', description: 'x', featured: false }]),
    /Only explicitly curated MarkTian-Long public repository URLs/
  );
  const duplicate = [
    { name: 'One', url: 'https://github.com/MarkTian-Long/demo', description: 'x', featured: true },
    { name: 'Two', url: 'https://github.com/MarkTian-Long/demo', description: 'y', featured: false }
  ];
  assert.throws(() => validatePublicProjects(duplicate), /Duplicate public GitHub project URL/);
});

test('buildLlmsIndex rejects unknown or duplicate featured article slugs', () => {
  assert.throws(() => buildLlmsIndex(config, posts, ['missing']), /Unknown LLM index featured slug/);
  assert.throws(() => buildLlmsIndex(config, posts, ['first-post', 'first-post']), /Duplicate LLM index featured slug/);
});
