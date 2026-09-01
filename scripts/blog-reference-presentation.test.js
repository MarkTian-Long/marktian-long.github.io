const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const runtime = require('../tools/blog/article-runtime.js');

test('reading metadata counts Chinese characters and English word groups', () => {
  assert.equal(runtime.readingUnitsFromText('你好，AI 与 GPT-5.6 协作。 123'), 8);
  assert.equal(runtime.readingUnitsFromText('  ，。  '), 0);
});

test('reading metadata rounds display count and calculates a 400-unit reading time', () => {
  assert.equal(runtime.formatReadingMeta(7785), '约 7,800 字 · 20 分钟阅读');
  assert.equal(runtime.formatReadingMeta(1), '约 100 字 · 1 分钟阅读');
});

test('reading metadata keeps only body content before an exact reference section', () => {
  assert.equal(runtime.readingTextFromNodes([
    { tagName: 'H2', text: '核心判断' },
    { tagName: 'P', text: '这是正文。' },
    { tagName: 'PRE', text: 'const ignored = true;' },
    { tagName: 'FIGURE', text: '这是一张不计入的图注。' },
    { tagName: 'H2', text: '参考资料' },
    { tagName: 'UL', text: '不计入的来源文字。' },
    { tagName: 'P', text: '不计入的补充说明。' }
  ]), '核心判断 这是正文。');
});

test('article runtime exposes one DOM renderer for reading metadata', () => {
  assert.equal(typeof runtime.renderReadingMeta, 'function');
});

test('reference section detection accepts only an exact reference heading', () => {
  assert.equal(runtime.isReferenceHeading('  参考资料  '), true);
  assert.equal(runtime.isReferenceHeading('\n参考资料\t'), true);
  assert.equal(runtime.isReferenceHeading('参考资料与延伸阅读'), false);
  assert.equal(runtime.isReferenceHeading('延伸阅读'), false);
});

test('reference content receives compact roles and stops before page navigation', () => {
  assert.deepEqual(runtime.referencePresentationRoles([
    { tagName: 'H2', text: '参考资料' },
    { tagName: 'H3', text: '一手文件 / 官方发布' },
    { tagName: 'UL', text: '' },
    { tagName: 'P', text: '来源可信度说明：样本及局限。' },
    { tagName: 'SECTION', id: 'continueReading', text: '' },
    { tagName: 'P', text: '页面导航后的内容' }
  ]), [
    'reference-heading',
    'reference-group',
    'reference-list',
    'reference-note',
    null,
    null
  ]);
});

test('ordinary body sections and reference copy remain distinguishable', () => {
  assert.deepEqual(runtime.referencePresentationRoles([
    { tagName: 'H2', text: '结论' },
    { tagName: 'P', text: '这是正文。' },
    { tagName: 'H2', text: '参考资料' },
    { tagName: 'P', text: '以下是外部来源。' },
    { tagName: 'OL', text: '' }
  ]), [null, null, 'reference-heading', 'reference-copy', 'reference-list']);
});

test('reference disclosure labels report source counts and state', () => {
  assert.deepEqual(runtime.referenceDisclosureCopy(12, false), { text: '展开 12 条来源', expanded: false });
  assert.deepEqual(runtime.referenceDisclosureCopy(12, true), { text: '收起 12 条来源', expanded: true });
  assert.equal(runtime.referenceDisclosureCopy(0, false).text, '展开参考资料');
  assert.equal(runtime.referenceDisclosureCopy(0, true).text, '收起参考资料');
});

test('reference anchors expand only their matching disclosure', () => {
  assert.equal(runtime.shouldExpandReferenceForHash('#references', 'references'), true);
  assert.equal(runtime.shouldExpandReferenceForHash('#section-10', 'section-10'), true);
  assert.equal(runtime.shouldExpandReferenceForHash('#%E5%8F%82%E8%80%83', '参考'), true);
  assert.equal(runtime.shouldExpandReferenceForHash('#section-10', 'references'), false);
  assert.equal(runtime.shouldExpandReferenceForHash('', 'references'), false);
});

test('every published article loads the shared reference presentation runtime', () => {
  const postsDir = path.resolve(__dirname, '../tools/blog/posts');
  const pages = fs.readdirSync(postsDir).filter((file) => file.endsWith('.html'));
  assert.ok(pages.length > 0);
  pages.forEach((file) => {
    const html = fs.readFileSync(path.join(postsDir, file), 'utf8');
    assert.match(html, /<script src="\.\.\/article-runtime\.js"><\/script>/, file);
  });
});
