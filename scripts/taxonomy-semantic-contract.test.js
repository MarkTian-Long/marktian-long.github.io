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

function taxonomyFile(t) {
  const directory = fs.mkdtempSync(path.join(__dirname, '.taxonomy-fixture-'));
  t.after(() => fs.rmSync(directory, { recursive: true, force: true }));
  const file = path.join(directory, 'taxonomy.json');
  return (taxonomy) => {
    fs.writeFileSync(file, JSON.stringify(taxonomy));
    return loadBlogTaxonomy(file);
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

for (const field of ['tags', 'topics']) {
  test(`candidate ${field} cannot be used by new or legacy metadata`, () => {
    const taxonomy = structuredClone(loadBlogTaxonomy());
    taxonomy[field].push({ name: '候选词', definition: '待审查', status: 'candidate' });
    for (const allowLegacyCategory of [false, true]) {
      assert.throws(() => validateSemanticMetadata(fixture({ [field]: ['候选词'] }), {
        taxonomy, allowLegacyCategory,
      }), /candidate|not active/);
    }
  });

  test(`unknown ${field} status cannot bypass vocabulary validation`, () => {
    for (const status of ['', null, false, 'retired']) {
      const taxonomy = structuredClone(loadBlogTaxonomy());
      taxonomy[field].push({ name: '无效状态词', definition: '测试词', status });
      for (const allowLegacyCategory of [false, true]) {
        assert.throws(() => validateSemanticMetadata(fixture({ [field]: ['无效状态词'] }), {
          taxonomy, allowLegacyCategory,
        }), /status|not active/);
      }
    }
  });

  test(`omitted and explicit active ${field} remain available`, () => {
    for (const status of [undefined, 'active']) {
      const taxonomy = structuredClone(loadBlogTaxonomy());
      taxonomy[field].push({ name: '有效词', definition: '测试词', status });
      assert.doesNotThrow(() => validateSemanticMetadata(fixture({ [field]: ['有效词'] }), { taxonomy }));
    }
  });
}

test('deprecated topics retain the explicit legacy metadata exception', () => {
  const value = fixture({ topics: ['前沿研究'] });
  assert.throws(() => validateSemanticMetadata(value), /deprecated/);
  assert.doesNotThrow(() => validateSemanticMetadata(value, { allowLegacyCategory: true }));
});

test('taxonomy loader rejects invalid vocabulary statuses before any article uses them', (t) => {
  const read = taxonomyFile(t);
  for (const field of ['tags', 'topics']) {
    for (const status of ['', null, false, 'retired']) {
      const taxonomy = structuredClone(loadBlogTaxonomy());
      taxonomy[field][0].status = status;
      assert.throws(() => read(taxonomy), /status/);
    }
  }
});

test('taxonomy loader rejects duplicate names within one vocabulary', (t) => {
  const read = taxonomyFile(t);
  for (const field of ['tags', 'topics']) {
    const taxonomy = structuredClone(loadBlogTaxonomy());
    taxonomy[field].push({ ...taxonomy[field][0], definition: '冲突定义' });
    assert.throws(() => read(taxonomy), /duplicate|unique/);
  }
});

test('taxonomy loader rejects category names repeated within or across availability lists', (t) => {
  const read = taxonomyFile(t);
  for (const target of ['active', 'legacy']) {
    const taxonomy = structuredClone(loadBlogTaxonomy());
    taxonomy.categories[target].push({ ...taxonomy.categories.active[0] });
    assert.throws(() => read(taxonomy), /duplicate|unique/);
  }
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

test('new semantic vocabulary supports genuine concept explanations and specialized topics', () => {
  const taxonomy = loadBlogTaxonomy();
  assert.ok(taxonomy.tags.some((entry) => entry.name === '概念解析' && entry.examples?.include?.length >= 3));
  for (const topic of ['影视产业', '技术生命周期']) {
    assert.ok(taxonomy.topics.some((entry) => entry.name === topic && entry.distinguish_from));
  }
  assert.doesNotThrow(() => validateSemanticMetadata(fixture({ tags: ['概念解析'], topics: ['影视产业'] }), { taxonomy }));
  assert.doesNotThrow(() => validateSemanticMetadata(fixture({ tags: ['决策框架'], topics: ['技术生命周期'] }), { taxonomy }));
  assert.throws(() => validateSemanticMetadata(fixture({ topics: ['技术生命周期'], concepts: ['技术生命周期', '证据质量', '结果验证', '错误成本'] }), { taxonomy }), /duplicate tag or topic/);
});

test('every published record satisfies the current semantic contract, including reviewed empties', () => {
  const metadata = JSON.parse(fs.readFileSync(path.join(__dirname, '../tools/blog/data/posts-meta.json'), 'utf8'));
  const knownSlugs = metadata.posts.map(post => post.slug);
  for (const post of metadata.posts) {
    assert.doesNotThrow(() => validateSemanticMetadata(post, { allowLegacyCategory: true, knownSlugs, source: post.slug }));
  }
});
