const test = require('node:test');
const assert = require('node:assert/strict');
const runtime = require('../tools/blog/article-runtime.js');
const { validateBlogMetadata } = require('./generate-search-assets.js');

function post(slug, date, topics, extra = {}) {
  return { slug, date, title: slug, summary: slug, url: `posts/${slug}.html`, tags: ['技术判断'], topics, category: '技术', concepts: [`${slug}-a`, `${slug}-b`, `${slug}-c`, `${slug}-d`], ...extra };
}
function slugs(items) { return items.map((item) => item.post.slug); }

test('relations reject invalid type, target, self-reference, and duplicate targets', () => {
  const base = { version: 2, posts: [post('a', '2026.01', ['Agent']), post('b', '2026.02', ['Agent'])] };
  assert.doesNotThrow(() => validateBlogMetadata(base));
  const withRelations = (relations) => ({ version: 2, posts: base.posts.map((entry) => entry.slug === 'a' ? { ...entry, relations } : entry) });
  assert.throws(() => validateBlogMetadata(withRelations([{ slug: 'b', type: 'wrong' }])), /type is invalid/);
  assert.throws(() => validateBlogMetadata(withRelations([{ slug: 'missing', type: 'builds_on' }])), /target must exist/);
  assert.throws(() => validateBlogMetadata(withRelations([{ slug: 'a', type: 'builds_on' }])), /cannot reference itself/);
  assert.throws(() => validateBlogMetadata(withRelations([{ slug: 'b', type: 'builds_on' }, { slug: 'b', type: 'companion' }])), /target is duplicated/);
});

test('new explicit relations render forward and reverse labels without editing old metadata', () => {
  const a = post('a', '2026.01', ['Agent']);
  const b = post('b', '2026.02', ['Agent'], { relations: [{ slug: 'a', type: 'builds_on' }] });
  const c = post('c', '2026.03', ['Agent'], { relations: [{ slug: 'a', type: 'revises' }] });
  assert.deepEqual(runtime.selectContinueReading([a, b, c], 'b', new Set()).map((item) => item.relationType), ['builds_on', 'same_topic']);
  const reverse = runtime.selectContinueReading([a, b, c], 'a', new Set());
  assert.deepEqual(slugs(reverse), ['c', 'b']);
  assert.deepEqual(reverse.map((item) => item.relationType), ['revised_by', 'follow_up']);
});

test('same-topic requires a shared topic; tags, category, and concepts only affect eligible ordering', () => {
  const a = post('a', '2026.01', ['Agent'], { concepts: ['shared', 'a-b', 'a-c', 'a-d'] });
  const categoryOnly = post('category', '2026.03', ['RAG'], { concepts: ['shared', 'x-b', 'x-c', 'x-d'] });
  const related = post('topic', '2026.02', ['Agent'], { tags: ['市场格局'] });
  const result = runtime.selectContinueReading([a, categoryOnly, related], 'a', new Set());
  assert.deepEqual(slugs(result), ['topic']);
  assert.equal(result[0].relationType, 'same_topic');
});

test('body links only repeat once for the most important explicit relationship and results cap at three', () => {
  const a = post('a', '2026.01', ['Agent'], { relations: [{ slug: 'b', type: 'builds_on' }, { slug: 'c', type: 'companion' }] });
  const b = post('b', '2026.02', ['Agent']); const c = post('c', '2026.03', ['Agent']); const d = post('d', '2026.04', ['Agent']);
  const result = runtime.selectContinueReading([a, b, c, d], 'a', new Set(['b', 'c']));
  assert.deepEqual(slugs(result), ['b', 'd']);
  assert.ok(result.length <= 3);
});

test('previous and next remain date navigation', () => {
  const posts = [post('old', '2026.01', ['Agent']), post('current', '2026.02', ['Agent']), post('new', '2026.03', ['Agent'])];
  const nav = runtime.adjacentPosts(posts, 'current');
  assert.equal(nav.prev.slug, 'new'); assert.equal(nav.next.slug, 'old');
});
