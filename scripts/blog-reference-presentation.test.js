const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const runtime = require('../tools/blog/article-runtime.js');

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

test('every published article loads the shared reference presentation runtime', () => {
  const postsDir = path.resolve(__dirname, '../tools/blog/posts');
  const pages = fs.readdirSync(postsDir).filter((file) => file.endsWith('.html'));
  assert.ok(pages.length > 0);
  pages.forEach((file) => {
    const html = fs.readFileSync(path.join(postsDir, file), 'utf8');
    assert.match(html, /<script src="\.\.\/article-runtime\.js"><\/script>/, file);
  });
});
