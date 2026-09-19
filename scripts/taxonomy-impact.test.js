const test = require('node:test');
const assert = require('node:assert/strict');
const childProcess = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const {
  auditTaxonomyImpact,
  diffTaxonomySemantics,
  parseArgs,
  prepareImpactReview,
} = require('../tools/blog/audit-taxonomy-impact.js');

function taxonomy(commercialDefinition = '旧定义') {
  return {
    categories: {
      active: [
        { name: '产品', definition: '产品定义' },
        { name: '商业', definition: commercialDefinition },
        { name: '行业', definition: '行业定义' },
      ],
      legacy: [],
    },
    tags: [{ name: '竞争判断', definition: '竞争' }],
    topics: [{ name: '企业AI', definition: '企业' }],
  };
}

const posts = [
  { slug: 'business', category: '商业', tags: ['竞争判断'], topics: ['企业AI'], title: '商业文章', summary: '价值捕获', concepts: ['定价'] },
  { slug: 'product', category: '产品', tags: ['竞争判断'], topics: ['企业AI'], title: '产品文章', summary: '产品设计', concepts: ['用户需求'] },
  { slug: 'industry', category: '行业', tags: ['竞争判断'], topics: ['企业AI'], title: '行业文章', summary: '行业演进', concepts: ['生态'] },
];

test('taxonomy impact audit detects semantic definition changes and prepares a non-mutating candidate pool', () => {
  const changes = diffTaxonomySemantics(taxonomy(), taxonomy('扩大后的商业定义'));
  assert.deepEqual(changes, [{ kind: 'definition_changed', entity: 'category', name: '商业' }]);

  const result = prepareImpactReview({ changes, posts });
  assert.deepEqual(result.candidates.map((candidate) => candidate.slug), ['business', 'product', 'industry']);
  assert.ok(result.candidates[0].reasons.includes('definition change: full metadata screen'));
  assert.ok(result.candidates[0].reasons.includes('changed category: 商业'));
  assert.equal(result.mutationCount, 0);
});

test('taxonomy impact audit screens all history for additions and deprecation without declaring a migration', () => {
  const before = taxonomy();
  const after = taxonomy();
  after.tags.push({ name: '工程演进', definition: '工程', status: 'deprecated' });
  const changes = diffTaxonomySemantics(before, after);
  assert.deepEqual(changes, [
    { kind: 'added', entity: 'tag', name: '工程演进' },
    { kind: 'deprecated', entity: 'tag', name: '工程演进' },
  ]);
  const result = prepareImpactReview({ changes, posts });
  assert.deepEqual(result.candidates.map((candidate) => candidate.slug), ['business', 'product', 'industry']);
  assert.ok(result.candidates.every((candidate) => candidate.reasons.includes('added tag: full metadata screen')));
  assert.equal(result.mutationCount, 0);
});

test('taxonomy impact audit detects a category core_question change and screens all historical metadata', () => {
  const before = taxonomy();
  const after = taxonomy();
  after.categories.active.find((entry) => entry.name === '商业').core_question = '企业为何能持续获利';

  const changes = diffTaxonomySemantics(before, after);
  assert.deepEqual(changes, [{ kind: 'core_question_changed', entity: 'category', name: '商业' }]);

  const result = prepareImpactReview({ changes, posts });
  assert.deepEqual(result.candidates.map((candidate) => candidate.slug), ['business', 'product', 'industry']);
  assert.ok(result.candidates.every((candidate) => candidate.reasons.includes('core_question change: full metadata screen')));
});

test('taxonomy impact audit detects a tag distinguish_from change and screens all historical metadata', () => {
  const before = taxonomy();
  const after = taxonomy();
  after.tags[0].distinguish_from = '更新后的标签边界';

  const changes = diffTaxonomySemantics(before, after);
  assert.deepEqual(changes, [{ kind: 'distinguish_from_changed', entity: 'tag', name: '竞争判断' }]);

  const result = prepareImpactReview({ changes, posts });
  assert.deepEqual(result.candidates.map((candidate) => candidate.slug), ['business', 'product', 'industry']);
  assert.ok(result.candidates.every((candidate) => candidate.reasons.includes('distinguish_from change: full metadata screen')));
});

test('taxonomy impact audit screens all history for an added topic even when no post mentions its new vocabulary', () => {
  const before = taxonomy();
  const after = taxonomy();
  after.topics.push({ name: '新专题', definition: '新增主题定义' });

  const changes = diffTaxonomySemantics(before, after);
  assert.deepEqual(changes, [{ kind: 'added', entity: 'topic', name: '新专题' }]);
  assert.ok(posts.every((post) => ![post.title, post.summary, ...post.concepts].join(' ').includes('新专题')));

  const result = prepareImpactReview({ changes, posts });
  assert.deepEqual(result.candidates.map((candidate) => candidate.slug), ['business', 'product', 'industry']);
  assert.ok(result.candidates.every((candidate) => candidate.reasons.includes('added topic: full metadata screen')));
});

test('taxonomy impact audit makes full-screen focus explicit', () => {
  const focus = [{ kind: 'manual_scope', entity: 'category', name: '商业' }];
  const focusedOnly = prepareImpactReview({ changes: focus, posts });
  assert.deepEqual(focusedOnly.candidates.map((candidate) => candidate.slug), ['business']);

  const fullScreen = prepareImpactReview({ changes: focus, posts, forceFullScreen: true });
  assert.deepEqual(fullScreen.candidates.map((candidate) => candidate.slug), ['business', 'product', 'industry']);
  assert.ok(fullScreen.candidates.every((candidate) => candidate.reasons.includes('explicit full-screen')));
});

test('taxonomy impact audit accepts explicit full-screen only with a scope or comparison', () => {
  assert.deepEqual(
    parseArgs(['--focus', 'category:商业', '--full-screen']),
    { categories: [], json: false, fullScreen: true, focus: { kind: 'manual_scope', entity: 'category', name: '商业' } },
  );
  assert.throws(() => parseArgs(['--full-screen']), /requires --focus or a taxonomy comparison/);
});

test('taxonomy impact audit reports no migration when no semantic change is present', () => {
  const result = prepareImpactReview({ changes: [], posts });
  assert.deepEqual(result.candidates, []);
  assert.equal(result.message, '历史 audit 完成，无需迁移。');
});

test('taxonomy impact audit resolves the repository root when invoked from scripts', () => {
  assert.doesNotThrow(() => childProcess.execFileSync(
    process.execPath,
    ['../tools/blog/audit-taxonomy-impact.js'],
    { cwd: __dirname, stdio: 'pipe' },
  ));
});

test('taxonomy impact audit runs the deterministic taxonomy check before preparing candidates', () => {
  assert.throws(
    () => auditTaxonomyImpact({
      rootDir: path.resolve(__dirname, '..'),
      checkTaxonomy: () => ({ errors: ['sentinel taxonomy mismatch'] }),
    }),
    /sentinel taxonomy mismatch/,
  );
});

test('enterprise-agent-fde migration keeps published HTML category metadata aligned', () => {
  const rootDir = path.resolve(__dirname, '..');
  const metadata = JSON.parse(fs.readFileSync(path.join(rootDir, 'tools/blog/data/posts-meta.json'), 'utf8'));
  const post = metadata.posts.find((candidate) => candidate.slug === 'enterprise-agent-fde');
  const publishedHtml = fs.readFileSync(path.join(rootDir, 'tools/blog', post.url), 'utf8');

  assert.equal(post.category, '商业');
  assert.match(publishedHtml, /^category:\s+商业\r?$/m);
});
