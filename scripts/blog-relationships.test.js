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

test('more than four explicit relations requires editorial QA instead of runtime truncation', () => {
  const posts = ['a', 'b', 'c', 'd', 'e', 'f'].map((slug, index) => post(slug, `2026.0${index + 1}`, ['Agent']));
  posts[0].relations = ['b', 'c', 'd', 'e', 'f'].map((slug) => ({ slug, type: 'builds_on' }));
  assert.throws(() => validateBlogMetadata({ version: 2, posts }), /more than 4.*review/i);
});

test('relation QA counts distinct displayed targets when declarations are bidirectional', () => {
  const a = post('a', '2026.01', ['Agent'], { relations: [{ slug: 'b', type: 'companion' }] });
  const b = post('b', '2026.02', ['Agent'], { relations: [{ slug: 'a', type: 'companion' }, { slug: 'c', type: 'builds_on' }, { slug: 'd', type: 'revises' }, { slug: 'e', type: 'companion' }] });
  const c = post('c', '2026.03', ['Agent']); const d = post('d', '2026.04', ['Agent']); const e = post('e', '2026.05', ['Agent']);
  assert.doesNotThrow(() => validateBlogMetadata({ version: 2, posts: [a, b, c, d, e] }));
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

test('explicit relations remain when body or reference links already mention them', () => {
  const a = post('a', '2026.01', ['Agent'], { relations: [{ slug: 'b', type: 'builds_on' }, { slug: 'c', type: 'companion' }, { slug: 'd', type: 'revises' }] });
  const b = post('b', '2026.02', ['Agent']); const c = post('c', '2026.03', ['Agent']); const d = post('d', '2026.04', ['Agent']); const e = post('e', '2026.05', ['Agent']);
  const result = runtime.selectContinueReading([a, b, c, d, e], 'a', new Set(['b', 'c', 'd']));
  assert.deepEqual(slugs(result), ['b', 'c', 'd']);
  assert.deepEqual(result.map((item) => item.relationType), ['builds_on', 'companion', 'revises']);
});

test('same-topic excludes links already shown in the body or references', () => {
  const a = post('a', '2026.01', ['Agent'], { relations: [{ slug: 'b', type: 'builds_on' }] });
  const b = post('b', '2026.02', ['Agent']); const shown = post('shown', '2026.03', ['Agent']); const available = post('available', '2026.04', ['Agent']);
  const result = runtime.selectContinueReading([a, b, shown, available], 'a', new Set(['b', 'shown']));
  assert.deepEqual(slugs(result), ['b', 'available']);
});

test('one explicit relation receives at most two same-topic supplements', () => {
  const a = post('a', '2026.01', ['Agent'], { relations: [{ slug: 'b', type: 'builds_on' }] });
  const b = post('b', '2026.02', ['Agent']); const c = post('c', '2026.03', ['Agent']); const d = post('d', '2026.04', ['Agent']); const e = post('e', '2026.05', ['Agent']);
  assert.deepEqual(slugs(runtime.selectContinueReading([a, b, c, d, e], 'a', new Set())), ['b', 'e', 'd']);
});

test('two explicit relations receive at most one same-topic supplement', () => {
  const a = post('a', '2026.01', ['Agent'], { relations: [{ slug: 'b', type: 'builds_on' }, { slug: 'c', type: 'companion' }] });
  const b = post('b', '2026.02', ['Agent']); const c = post('c', '2026.03', ['Agent']); const d = post('d', '2026.04', ['Agent']); const e = post('e', '2026.05', ['Agent']);
  assert.deepEqual(slugs(runtime.selectContinueReading([a, b, c, d, e], 'a', new Set())), ['b', 'c', 'e']);
});

test('three explicit relations do not receive same-topic supplements', () => {
  const a = post('a', '2026.01', ['Agent'], { relations: [{ slug: 'b', type: 'builds_on' }, { slug: 'c', type: 'companion' }, { slug: 'd', type: 'revises' }] });
  const b = post('b', '2026.02', ['Agent']); const c = post('c', '2026.03', ['Agent']); const d = post('d', '2026.04', ['Agent']); const e = post('e', '2026.05', ['Agent']);
  assert.deepEqual(slugs(runtime.selectContinueReading([a, b, c, d, e], 'a', new Set())), ['b', 'c', 'd']);
});

test('four explicit relations all remain visible without same-topic supplements', () => {
  const a = post('a', '2026.01', ['Agent'], { relations: [{ slug: 'b', type: 'builds_on' }, { slug: 'c', type: 'companion' }, { slug: 'd', type: 'revises' }, { slug: 'e', type: 'builds_on' }] });
  const b = post('b', '2026.02', ['Agent']); const c = post('c', '2026.03', ['Agent']); const d = post('d', '2026.04', ['Agent']); const e = post('e', '2026.05', ['Agent']); const f = post('f', '2026.06', ['Agent']);
  const result = runtime.selectContinueReading([a, b, c, d, e, f], 'a', new Set(['b', 'c', 'd', 'e']));
  assert.deepEqual(slugs(result), ['b', 'c', 'd', 'e']);
  assert.equal(result.length, 4);
});

test('previous and next remain date navigation', () => {
  const posts = [post('old', '2026.01', ['Agent']), post('current', '2026.02', ['Agent']), post('new', '2026.03', ['Agent'])];
  const nav = runtime.adjacentPosts(posts, 'current');
  assert.equal(nav.prev.slug, 'new'); assert.equal(nav.next.slug, 'old');
});
