const test = require('node:test');
const assert = require('node:assert/strict');
const { loadBlogTaxonomy, validateSemanticMetadata } = require('../tools/blog/blog-taxonomy.js');
const { analyzeHealth, scanRepository, parseArgs } = require('../tools/blog/check-taxonomy-health.js');
const path = require('node:path');

const base = () => ({ slug: 'example', title: 'Example', summary: 'Example summary', category: '产品',
  tags: ['概念解析'], topics: ['Agent'], concepts: ['需求边界', '结果验证', '任务状态', '错误恢复'],
  share_quote: '完整的正文原句。', relations: [] });
const run = (posts, taxonomy = loadBlogTaxonomy()) => analyzeHealth({ posts }, taxonomy);

test('report is read-only and empty optional fields are reviewable, not silently fixed', () => {
  const p = { ...base(), tags: [], topics: [] }; const before = JSON.stringify(p);
  const r = run([p]);
  assert.equal(JSON.stringify(p), before);
  assert.equal(r.errors.length, 0);
  assert.ok(r.reviewSignals.some(s => s.code === 'label-density'));
  assert.ok(r.reviewSignals.some(s => s.code === 'topic-gap'));
});
test('four labels trigger review, a third valid label does not trigger density warning', () => {
  const four = { ...base(), tags: ['概念解析', '技术判断'], topics: ['Agent', '企业AI'] };
  assert.ok(run([four]).reviewSignals.some(s => s.code === 'label-density'));
  assert.ok(!run([{ ...four, tags: ['概念解析'] }]).reviewSignals.some(s => s.code === 'label-density'));
});
test('concentration is not an invalid-metadata error or a migration decision', () => {
  const posts = Array.from({ length: 24 }, (_, i) => ({ ...base(), slug: `post-${i}` }));
  const r = run(posts);
  assert.equal(r.errors.length, 0);
  assert.ok(r.reviewSignals.some(s => s.code === 'corpus-concentration'));
  assert.ok(r.reviewSignals.some(s => s.code === 'category-concentration'));
  assert.equal(posts[0].tags[0], '概念解析');
});
test('bad fields and duplicate slugs report partial coverage instead of a false all-clear', () => {
  const r = run([base(), base(), { ...base(), slug: 'bad', tags: ['未定义'] }]);
  assert.equal(r.valid, 1); assert.equal(r.errors.length, 2); assert.equal(r.coverage, 'partial');
});
test('reserved tags cannot be used; a retired topic is reported even in legacy metadata', () => {
  const taxonomy = loadBlogTaxonomy();
  for (const name of ['独立开发', '冷启动', '出海']) {
    assert.ok(taxonomy.reserved_tags.some(t => t.name === name));
    assert.throws(() => validateSemanticMetadata({ ...base(), tags: [name] }, { taxonomy }), /not defined/);
  }
  assert.ok(run([{ ...base(), topics: ['前沿研究'] }]).reviewSignals.some(s => s.code === 'inactive-in-use'));
  assert.doesNotThrow(() => validateSemanticMetadata({ ...base(), topics: ['科研自动化'] }, { taxonomy }));
});
test('signal fingerprints are stable across ordering, and change with membership or definition', () => {
  const posts = Array.from({ length: 24 }, (_, i) => ({ ...base(), slug: `post-${i}` }));
  const get = r => r.reviewSignals.find(s => s.code === 'corpus-concentration' && s.subject === 'topics:Agent').fingerprint;
  assert.equal(get(run(posts)), get(run(posts.slice().reverse())));
  assert.notEqual(get(run(posts)), get(run(posts.slice(1))));
  const taxonomy = structuredClone(loadBlogTaxonomy()); taxonomy.topics.find(t => t.name === 'Agent').definition += ' changed';
  assert.notEqual(get(run(posts)), get(run(posts, taxonomy)));
});
test('CLI rejects unsupported and duplicate flags', () => {
  assert.deepEqual(parseArgs(['--json']), { json: true });
  assert.throws(() => parseArgs(['--write']), /Usage/);
  assert.throws(() => parseArgs(['--json', '--json']), /Usage/);
});
test('current index has valid metadata without retired labels in use', () => {
  const r = scanRepository(path.resolve(__dirname, '..'));
  assert.equal(r.errors.length, 0, JSON.stringify(r.errors));
  assert.equal(r.valid, r.examined);
  assert.ok(!r.reviewSignals.some(s => s.code === 'inactive-in-use'));
});
