const test = require('node:test');
const assert = require('node:assert/strict');

const {
  validateImageContract,
  collectPostImagePaths,
  resolvePostCover,
} = require('./blog-image-contract');

function post(slug, visuals) {
  return {
    slug,
    title: slug,
    summary: `${slug} summary`,
    url: `posts/${slug}.html`,
    ...(visuals ? { visuals } : {}),
  };
}

function cover(slug, overrides = {}) {
  return {
    src: `assets/images/blog/${slug}/cover.jpg`,
    alt: `${slug} 的主题概念插画`,
    width: 1200,
    height: 630,
    ...overrides,
  };
}

function inline(slug, name = 'context-loop', overrides = {}) {
  return {
    src: `assets/images/blog/${slug}/${name}.webp`,
    alt: `${slug} 的上下文闭环示意`,
    caption: '上下文、记忆与反馈形成持续闭环。',
    width: 1280,
    height: 720,
    ...overrides,
  };
}

function metadata(posts, exemptions = []) {
  return {
    image_contract: {
      version: 1,
      legacy_without_visuals: exemptions,
    },
    posts,
  };
}

test('posts outside the explicit legacy exemption require visuals', () => {
  const posts = [post('new-post'), post('legacy-boundary')];
  assert.throws(
    () => validateImageContract(metadata(posts, ['legacy-boundary'])),
    /new-post.*visuals/i,
  );
});

test('legacy posts may omit visuals', () => {
  const posts = [post('legacy-boundary')];
  assert.doesNotThrow(
    () => validateImageContract(metadata(posts, ['legacy-boundary'])),
  );
});

test('the image contract and legacy exemption list are explicit and exact', () => {
  const legacy = post('legacy-boundary');
  assert.throws(
    () => validateImageContract({ posts: [legacy] }),
    /image_contract/i,
  );
  assert.throws(
    () => validateImageContract(metadata([legacy], ['legacy-boundary', 'legacy-boundary'])),
    /duplicate.*legacy-boundary/i,
  );
  assert.throws(
    () => validateImageContract(metadata([legacy], ['unknown-post'])),
    /unknown.*unknown-post/i,
  );
  assert.throws(
    () => validateImageContract(metadata([legacy], [' legacy-boundary '])),
    /trimmed.*legacy/i,
  );
});

test('post slugs must be lowercase kebab-case before they are used in asset paths', () => {
  for (const slug of ['../escape', 'Upper-Post', 'double--dash', 'trailing-']) {
    const current = post(slug, { cover: cover(slug), inline: [] });
    assert.throws(
      () => validateImageContract(metadata([current])),
      /slug.*lowercase kebab-case/i,
      slug,
    );
  }
});

test('a post with visuals cannot remain in the legacy exemption list', () => {
  const current = post('current-post', {
    cover: cover('current-post'),
    inline: [],
  });
  assert.throws(
    () => validateImageContract(metadata([current], ['current-post'])),
    /current-post.*legacy.*visuals/i,
  );
});

test('cover paths, dimensions, and alt text are validated', () => {
  const cases = [
    [cover('new-post', { src: 'assets/images/blog/other/cover.jpg' }), /new-post.*cover.*path/i],
    [cover('new-post', { src: 'assets/images/blog/new-post/cover.png' }), /new-post.*cover.*path/i],
    [cover('new-post', { width: 1199 }), /new-post.*1200.*630/i],
    [cover('new-post', { height: 629 }), /new-post.*1200.*630/i],
    [cover('new-post', { alt: '' }), /new-post.*cover.*alt/i],
    [cover('new-post', { alt: ` ${'a'.repeat(160)}` }), /new-post.*cover.*alt/i],
    [cover('new-post', { alt: 'a'.repeat(161) }), /new-post.*cover.*alt/i],
  ];
  for (const [candidate, expected] of cases) {
    const current = post('new-post', { cover: candidate, inline: [] });
    assert.throws(() => validateImageContract(metadata([current])), expected);
  }
});

test('inline images stay local, descriptive, bounded, and fully described', () => {
  const invalid = [
    [[inline('new-post'), inline('new-post', 'second'), inline('new-post', 'third')], /new-post.*0.*2.*inline/i],
    [[inline('new-post', 'context-loop', { src: 'https://example.com/image.webp' })], /new-post.*inline.*path/i],
    [[inline('new-post', 'context-loop', { src: 'assets/images/blog/other/context-loop.webp' })], /new-post.*inline.*path/i],
    [[inline('new-post', 'context-loop', { src: 'assets/images/blog/new-post/../other.webp' })], /new-post.*inline.*path/i],
    [[inline('new-post', 'context-loop', { src: 'assets/images/blog/new-post/context-loop.jpg' })], /new-post.*inline.*path/i],
    [[inline('new-post', 'image-1')], /new-post.*descriptive.*filename/i],
    [[inline('new-post', 'Context-Loop')], /new-post.*inline.*path/i],
    [[inline('new-post', 'context-loop', { width: 1200 })], /new-post.*1280.*720/i],
    [[inline('new-post', 'context-loop', { height: 630 })], /new-post.*1280.*720/i],
    [[inline('new-post', 'context-loop', { alt: ' ' })], /new-post.*inline.*alt/i],
    [[inline('new-post', 'context-loop', { alt: 'Context ] loop' })], /inline.*alt.*Markdown/i],
    [[inline('new-post', 'context-loop', { alt: 'Context\nloop' })], /inline.*alt.*Markdown/i],
    [[inline('new-post', 'context-loop', { caption: '' })], /new-post.*caption/i],
    [[inline('new-post', 'context-loop', { caption: 'The "context" loop.' })], /caption.*Markdown/i],
    [[inline('new-post', 'context-loop', { caption: 'Context\nloop.' })], /caption.*Markdown/i],
    [[inline('new-post', 'context-loop', { caption: 'c'.repeat(161) })], /new-post.*caption/i],
  ];
  for (const [inlineImages, expected] of invalid) {
    const current = post('new-post', { cover: cover('new-post'), inline: inlineImages });
    assert.throws(() => validateImageContract(metadata([current])), expected);
  }
});

test('image paths cannot be duplicated within or across posts', () => {
  const repeatedInline = inline('new-post');
  const current = post('new-post', {
    cover: cover('new-post'),
    inline: [repeatedInline, { ...repeatedInline }],
  });
  assert.throws(
    () => validateImageContract(metadata([current])),
    /duplicate.*context-loop\.webp/i,
  );
});

test('collectPostImagePaths returns declared images once in stable order', () => {
  const paths = collectPostImagePaths([
    post('z-post', { cover: cover('z-post'), inline: [inline('z-post', 'z-loop')] }),
    post('a-post', { cover: cover('a-post'), inline: [] }),
    post('legacy-post'),
  ]);
  assert.deepEqual(paths, [
    'assets/images/blog/a-post/cover.jpg',
    'assets/images/blog/z-post/cover.jpg',
    'assets/images/blog/z-post/z-loop.webp',
  ]);
});

test('resolvePostCover uses the article cover or the configured legacy fallback', () => {
  const config = {
    blog: {
      imagePath: '/assets/images/og-cover.png',
      imageAlt: 'Leo · AI · Product · Builder',
      imageWidth: 1200,
      imageHeight: 630,
    },
  };
  const currentCover = cover('new-post');
  assert.deepEqual(resolvePostCover(post('new-post', { cover: currentCover, inline: [] }), config), currentCover);
  assert.deepEqual(resolvePostCover(post('legacy-post'), config), {
    src: 'assets/images/og-cover.png',
    alt: 'Leo · AI · Product · Builder',
    width: 1200,
    height: 630,
  });
});
