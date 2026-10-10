'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const shareCard = require('../tools/blog/share-card');

const monoContext = { measureText(text) { return { width: Array.from(text).length * 10 }; } };
const noStart = /^[，。、；：？！,.!?;:）)\]｝}］】〕〉》」』”’％%…]/u;
const noEnd = /[（(\[｛{［【〔〈《「『“‘]$/u;
const compact = (text) => text.replace(/\s+/gu, '');

function expectLayout(text, width, context = monoContext) {
  const lines = shareCard.linesForWidth(context, text, width);
  assert.equal(compact(lines.join('')), compact(text), 'wrapping must not remove, add, or reorder source text');
  for (const [index, line] of lines.entries()) {
    assert.ok(context.measureText(line).width <= width, `line exceeds its box: ${line}`);
    if (index > 0) assert.equal(noStart.test(line), false, `closing punctuation begins a wrapped line: ${line}`);
    if (index < lines.length - 1) assert.equal(noEnd.test(line), false, `opening punctuation ends a wrapped line: ${line}`);
  }
  return lines;
}

test('poster reflows the screenshot period and semicolon instead of deleting them', () => {
  const quote = '生成模型首先需要让结果合理；预测模型还要让结果忠于那个它正在描述的世界。';
  assert.deepEqual(expectLayout(quote, 130), [
    '生成模型首先需要让结果合',
    '理；预测模型还要让结果忠于',
    '那个它正在描述的世界。',
  ]);
  const summary = '后续行动。两者共享很多能力，但不是同一场考试。';
  assert.deepEqual(expectLayout(summary, 40).slice(0, 2), ['后续行', '动。两者']);
});

test('poster respects common closing marks and opening brackets at wrap boundaries', () => {
  for (const mark of Array.from('，。、；：？！,.!?;:）)]｝}］】〕〉》」』”’％%')) {
    expectLayout('甲乙丙丁' + mark + '戊己庚辛。', 40);
  }
  for (const [open, close] of [['（', '）'], ['(', ')'], ['[', ']'], ['【', '】'], ['《', '》'], ['「', '」'], ['『', '』'], ['“', '”'], ['‘', '’']]) {
    expectLayout('甲乙' + open + '丙丁戊己庚辛' + close + '壬癸。', 30);
  }
  expectLayout('甲乙丙丁？！”，戊己庚辛。', 60);
  expectLayout('甲乙丙丁 ；戊己庚辛。', 50);
});

test('paired ellipses and dashes survive narrow and oversized-token wrapping', () => {
  for (const text of ['甲乙……丙丁——戊己。', '“甲乙……丙丁——戊己庚辛”', '甲乙...丙丁。']) {
    const lines = expectLayout(text, 50);
    assert.ok(!lines.some((line, index) => index < lines.length - 1 && /…$/.test(line) && /^…/.test(lines[index + 1])));
    assert.ok(!lines.some((line, index) => index < lines.length - 1 && /—$/.test(line) && /^—/.test(lines[index + 1])));
  }
});

test('fitting identifiers and short quoted phrases retain existing wrapping behavior', () => {
  assert.deepEqual(expectLayout('中文模型的 Harness', 100), ['中文模型的', 'Harness']);
  assert.deepEqual(expectLayout('中文模型的 GPT-4.1', 100), ['中文模型的', 'GPT-4.1']);
  assert.deepEqual(expectLayout('当人和 AI 都在改变，“对齐”还能一次完成吗？', 150), [
    '当人和 AI 都在改变，', '“对齐”还能一次完成吗？',
  ]);
  expectLayout('超长的标识符 ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890；仍需完整保留。', 100);
  expectLayout('𠮷的未来（观察与预测）', 50);
});

test('layout does not require complete sentences or replace the chosen excerpt', () => {
  expectLayout('从“生成未来”到预测行动后果', 70);
  const model = shareCard.createPosterModel({
    slug: 'excerpt', title: '世界模型', summary: '合理与可信', share_quote: '不是同一场考试', date: '2026.10', url: 'posts/excerpt.html',
  }, { siteUrl: 'https://example.com', blogPath: '/tools/blog/', authorName: 'Leo' });
  assert.equal(model.summary, '合理与可信');
  assert.equal(model.quote, '不是同一场考试');
});

test('fitText shrinks an indivisible word-plus-punctuation cluster instead of overflowing', () => {
  const context = {
    font: '',
    measureText(text) { return { width: Array.from(text).length * Number(this.font.match(/(\d+)px/)[1]) }; },
  };
  const options = { text: 'AI；', maxWidth: 25, maxLines: 2, maxSize: 12, minSize: 8, leading: 1.4, weight: '400', font: 'sans-serif', label: '测试文案' };
  const fitted = shareCard.fitText(context, options);
  assert.equal(fitted.size, 8);
  assert.deepEqual(fitted.lines, ['AI；']);
  assert.ok(fitted.lines.every((line) => context.measureText(line).width <= options.maxWidth));
  assert.throws(() => shareCard.fitText(context, { ...options, maxWidth: 10 }), /无法在海报中完整排版/);
});

test('real article title, summary and excerpt obey punctuation rules across widths', () => {
  const fields = [
    '视频已经能“生成未来”，为什么还不等于会预测世界？',
    '视频生成最擅长的是造出一个合理的未来；面向预测和行动的世界模型更难的，是根据当前状态和不同动作，判断世界接下来会怎样变化，并让这种预测真的帮助后续行动。两者共享很多能力，但不是同一场考试。',
    '生成模型首先需要让结果合理；预测模型还要让结果忠于那个它正在描述的世界。',
  ];
  const context = {
    font: '',
    measureText(text) { return { width: Array.from(text).length * Number(this.font.match(/(\d+)px/)[1]) }; },
  };
  for (const text of fields) for (let width = 30; width <= 900; width += 10) {
    const fitted = shareCard.fitText(context, { text, maxWidth: width, maxLines: 100, maxSize: 10, minSize: 2, leading: 1.4, weight: '400', font: 'sans-serif', label: '测试文案' });
    assert.deepEqual(expectLayout(text, width, context), fitted.lines);
  }
});
