const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { loadBlogTaxonomy, validateSemanticMetadata } = require('../tools/blog/blog-taxonomy.js');
const { diffTaxonomySemantics, prepareImpactReview } = require('../tools/blog/audit-taxonomy-impact.js');

function fixture(overrides = {}) {
  return {
    slug: 'example', category: '产品', tags: [], topics: [],
    concepts: ['需求边界', '证据质量', '结果验证', '错误成本'],
    share_quote: '完整的正文原句。', relations: [], ...overrides,
  };
}

test('reviewed empty labels are valid; required fields and array types remain strict', () => {
  assert.doesNotThrow(() => validateSemanticMetadata(fixture()));
  for (const field of ['tags', 'topics']) {
    for (const bad of [undefined, null, '', 'Agent', [null], [''], [' Agent']]) {
      assert.throws(() => validateSemanticMetadata(fixture({ [field]: bad })));
    }
  }
});

test('label cardinality comes from taxonomy, without weakening vocabulary or duplicate checks', () => {
  const taxonomy = structuredClone(loadBlogTaxonomy());
  taxonomy.label_rules.tags.max_items = 1;
  assert.throws(() => validateSemanticMetadata(fixture({ tags: ['技术判断', '决策框架'] }), { taxonomy }), /0 to 1/);
  assert.throws(() => validateSemanticMetadata(fixture({ tags: ['未知标签'] })), /not defined/);
  assert.throws(() => validateSemanticMetadata(fixture({ topics: ['Agent', 'Agent'] })), /unique/);
  assert.throws(() => validateSemanticMetadata(fixture({ topics: ['Agent', 'RAG', '人机协作'] })), /0 to 2/);
});

test('deprecated tags are only accepted through the legacy metadata path', () => {
  const value = fixture({ tags: ['架构设计'] });
  assert.throws(() => validateSemanticMetadata(value), /deprecated/);
  assert.doesNotThrow(() => validateSemanticMetadata(value, { allowLegacyCategory: true }));
});

test('optional labels do not make concepts, quote, or category optional', () => {
  for (const bad of [{ concepts: [] }, { share_quote: '' }, { category: undefined }]) {
    assert.throws(() => validateSemanticMetadata(fixture(bad)));
  }
  assert.throws(() => validateSemanticMetadata(fixture({ concepts: ['AI', 'a', 'b', 'c'] })), /generic/);
});

test('tags and topics cannot repeat the same label even if both vocabularies contain it', () => {
  const taxonomy = structuredClone(loadBlogTaxonomy());
  taxonomy.topics.push({ name: '技术判断', definition: 'test-only duplicate' });
  assert.throws(() => validateSemanticMetadata(fixture({ tags: ['技术判断'], topics: ['技术判断'] }), { taxonomy }), /overlap/);
});

test('changing field roles, cardinality, or examples triggers a full screen', () => {
  const before = loadBlogTaxonomy();
  for (const mutate of [
    next => { next.field_roles.tags += ' revised'; },
    next => { next.label_rules.tags.max_items = 1; },
    next => { next.tags[0].examples.include.push('new boundary example'); },
  ]) {
    const after = structuredClone(before); mutate(after);
    const changes = diffTaxonomySemantics(before, after);
    assert.ok(changes.length);
    const posts = [fixture({ slug: 'unrelated' }), fixture({ slug: 'another' })];
    const result = prepareImpactReview({ changes, posts });
    assert.equal(result.fullMetadataScreen, true);
    assert.equal(result.candidates.length, posts.length);
    assert.equal(result.mutationCount, 0);
  }
});

test('object key order and the bookkeeping revision do not create semantic changes', () => {
  const before = loadBlogTaxonomy();
  const after = structuredClone(before);
  after.label_rules.tags = Object.fromEntries(Object.entries(after.label_rules.tags).reverse());
  after.semantic_revision += 1;
  after.updated_at = '2099-01-01';
  assert.deepEqual(diffTaxonomySemantics(before, after), []);
});

test('every published record satisfies the current semantic contract, including reviewed empties', () => {
  const metadata = JSON.parse(fs.readFileSync(path.join(__dirname, '../tools/blog/data/posts-meta.json'), 'utf8'));
  const knownSlugs = metadata.posts.map(post => post.slug);
  for (const post of metadata.posts) {
    assert.doesNotThrow(() => validateSemanticMetadata(post, { allowLegacyCategory: true, knownSlugs, source: post.slug }));
  }
});
