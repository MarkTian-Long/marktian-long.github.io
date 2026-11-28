const assert = require('node:assert/strict');
const test = require('node:test');

const { buildBlogArchive, renderBlogArchivePage } = require('./blog-archive');

function makePosts(count) {
  return Array.from({ length: count }, (_, index) => ({
    slug: 'post-' + index,
    date: '2026.' + String(11 - Math.floor(index / 10)).padStart(2, '0'),
    title: 'Post ' + index,
    summary: 'Summary ' + index,
    category: index % 2 ? '产品' : '技术',
    tags: index % 2 ? ['决策框架'] : [],
    topics: [],
    url: 'posts/post-' + index + '.html'
  }));
}

function articleLinks(html) {
  return [...html.matchAll(/href="(posts\/[^"]+\.html)"/g)].map(match => match[1]);
}

test('static archive exposes each article once across featured, first page, and noscript fallback', () => {
  const posts = makePosts(56);
  const featured = ['post-0', 'post-1', 'post-2', 'post-3', 'post-4'];
  const archive = buildBlogArchive(posts, featured);
  const allLinks = articleLinks(archive.featuredHtml + archive.archiveHtml + archive.noScriptHtml);

  assert.equal(articleLinks(archive.featuredHtml).length, 5);
  assert.equal(articleLinks(archive.archiveHtml).length, 10);
  assert.equal(articleLinks(archive.noScriptHtml).length, 41);
  assert.match(archive.noScriptHtml, /<noscript>/);
  assert.equal(allLinks.length, 56);
  assert.equal(new Set(allLinks).size, 56);
});

test('archive boundaries work for zero, one, ten, and eleven posts', () => {
  for (const count of [0, 1, 10, 11]) {
    const posts = makePosts(count);
    const featured = posts.slice(0, Math.min(5, count)).map(post => post.slug);
    const archive = buildBlogArchive(posts, featured);
    const links = articleLinks(archive.featuredHtml + archive.archiveHtml + archive.noScriptHtml);
    assert.equal(links.length, count);
    assert.equal(new Set(links).size, count);
  }
});

test('archive text and attributes are escaped before entering static HTML', () => {
  const posts = [{
    slug: 'safe-post',
    date: '2026.11',
    title: 'A <script>alert("x")</script> & B',
    summary: 'Summary <img src=x onerror=alert(1)> & text',
    category: '技术 <script>',
    tags: ['tag <svg>'],
    topics: [],
    url: 'posts/safe-post.html'
  }];
  const archive = buildBlogArchive(posts, []);
  const html = archive.archiveHtml;

  assert.match(html, /&lt;script&gt;alert\(&quot;x&quot;\)&lt;\/script&gt;/);
  assert.match(html, /&lt;img src=x onerror=alert\(1\)&gt;/);
  assert.match(html, /tag &lt;svg&gt;/);
  assert.doesNotMatch(html, /<script>|<img |<svg>/);
});

test('archive rejects duplicate and unknown featured slugs and invalid article paths', () => {
  const posts = makePosts(2);
  assert.throws(() => buildBlogArchive(posts, ['post-0', 'post-0']), /Duplicate featured/);
  assert.throws(() => buildBlogArchive(posts, ['missing']), /Unknown featured/);
  assert.throws(() => buildBlogArchive([{ ...posts[0], url: '../private.html' }], []), /Invalid blog archive URL/);
});

test('renderBlogArchivePage replaces only marked regions and is idempotent', () => {
  const source = '<html><body>'
    + '<div id="featuredRoot"><!-- blog-archive:featured:start --><!-- blog-archive:featured:end --></div>'
    + '<div id="archiveRoot"><!-- blog-archive:archive:start --><div class="loading">加载中…</div><!-- blog-archive:archive:end --></div>'
    + '</body></html>';
  const posts = makePosts(12);
  const once = renderBlogArchivePage(source, posts, ['post-0', 'post-1']);
  const twice = renderBlogArchivePage(once, posts, ['post-0', 'post-1']);

  assert.equal(twice, once);
  assert.match(once, /featured-section/);
  assert.match(once, /<noscript>/);
  assert.match(once, /posts\/post-11\.html/);
  assert.doesNotMatch(once, /class="loading"/);
});
