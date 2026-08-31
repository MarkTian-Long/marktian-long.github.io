const test = require('node:test');
const assert = require('node:assert/strict');
const { editorialBody } = require('./check-blog-body-integrity.js');

const image = {
  src: 'assets/images/blog/example/change-gate.webp',
  alt: '候选变化经过独立验证门后分流',
  caption: '只有通过独立验证的变化才进入长期机制。',
  width: 1280,
  height: 720,
};

const baseline = '<div class="post-body"><p>正文前。</p>\n<p>正文后。</p></div><section class="continue-reading">';
const registeredFigure = '<figure class="post-figure">\n'
  + '  <img src="../../../assets/images/blog/example/change-gate.webp" alt="候选变化经过独立验证门后分流" width="1280" height="720" loading="lazy" decoding="async" />\n'
  + '  <figcaption>只有通过独立验证的变化才进入长期机制。</figcaption>\n'
  + '</figure>';

test('body integrity ignores only a metadata-registered generated inline figure', () => {
  const current = baseline.replace('<p>正文后。', `${registeredFigure}\n<p>正文后。`);
  assert.equal(editorialBody(current, [image]), editorialBody(baseline, [image]));
});

test('body integrity does not ignore an inline figure whose generated content differs from metadata', () => {
  const changedFigure = registeredFigure.replace('独立验证门', '未知验证门');
  const current = baseline.replace('<p>正文后。', `${changedFigure}\n<p>正文后。`);
  assert.notEqual(editorialBody(current, [image]), editorialBody(baseline, [image]));
});
