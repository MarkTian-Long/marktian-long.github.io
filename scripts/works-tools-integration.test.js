'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const cheerio = require('cheerio');

const repoRoot = path.resolve(__dirname, '..');

function read(relativePath) {
  return fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

function resolveLocalHref(pagePath, href) {
  const cleanHref = href.split(/[?#]/, 1)[0];
  return path.relative(repoRoot, path.resolve(path.dirname(path.join(repoRoot, pagePath)), cleanHref))
    .split(path.sep)
    .join('/');
}

test('homepage exposes eight trustworthy tool links without unverified outcome claims', () => {
  const $ = cheerio.load(read('index.html'));
  const expected = new Map([
    ['tools/esop-extractor/index.html', '证据核验'],
    ['tools/stock/index.html', '证据来源'],
    ['tools/service-agent/index.html', '故障注入'],
    ['tools/asci/index.html', '14 节点'],
    ['tools/ai-insights/index.html', '证据账本'],
    ['tools/radar/index.html', '研究意图'],
    ['tools/trends/index.html', '可追溯'],
    ['tools/agent-hub/index.html', '是否需要 Agent'],
  ]);
  const items = $('#tools .works-item').toArray();

  assert.equal(items.length, 8);
  for (const item of items) {
    const href = $(item).attr('href');
    assert.ok(expected.has(href), `unexpected homepage tool href: ${href}`);
    assert.equal($(item).attr('target'), '_blank', `${href} should open in a new tab`);
    assert.ok(new Set(($(item).attr('rel') || '').split(/\s+/)).has('noopener'), `${href} needs rel=noopener`);
    assert.match($(item).find('.works-desc').text(), new RegExp(expected.get(href)), `${href} description should state its task`);
  }

  const sectionText = $('#tools').text();
  assert.doesNotMatch(sectionText, /≥\s*95%/);
  assert.doesNotMatch(sectionText, /5\s*步全链路/);
});

test('the four information tools expose one consistent workflow navigation contract', () => {
  const pages = [
    ['tools/radar/index.html', '1 信源'],
    ['tools/trends/index.html', '2 信号'],
    ['tools/ai-insights/index.html', '3 分析'],
    ['tools/agent-hub/index.html', '4 方法'],
  ];
  const labels = pages.map(([, label]) => label);
  const expectedTargets = new Set(pages.map(([page]) => page));

  for (const [page, currentLabel] of pages) {
    const $ = cheerio.load(read(page));
    const bodyText = $('body').text().replace(/\s+/g, ' ');
    let previousIndex = -1;
    for (const label of labels) {
      const index = bodyText.indexOf(label);
      assert.ok(index > previousIndex, `${page} should list ${labels.join(' → ')} in order`);
      previousIndex = index;
    }

    const current = $('[aria-current="step"]');
    assert.equal(current.length, 1, `${page} should expose exactly one current workflow step`);
    assert.match(current.text().replace(/\s+/g, ' '), new RegExp(currentLabel));

    const linkedTargets = new Set();
    $('a[href]').each((_, anchor) => {
      const href = $(anchor).attr('href');
      if (!href || /^(?:https?:|mailto:|#)/i.test(href)) return;
      const target = resolveLocalHref(page, href);
      if (expectedTargets.has(target)) linkedTargets.add(target);
    });
    assert.ok(linkedTargets.size >= 3, `${page} should link to the rest of the information workflow`);
  }
});

test('portfolio evidence covers all eight public tools while retaining the private case', () => {
  const evidence = JSON.parse(read('docs/portfolio-evidence.examples.json'));
  const expectedIds = [
    'esop-extractor',
    'financial-rag',
    'service-agent',
    'asci-research-system',
    'ai-insights',
    'radar',
    'trends',
    'agent-hub',
    'aml-due-diligence',
  ];

  assert.deepEqual(evidence.portfolio.map(record => record.id), expectedIds);
  assert.equal(evidence.portfolio.filter(record => record.status === 'published').length, 8);
  assert.equal(evidence.portfolio.find(record => record.id === 'aml-due-diligence').status, 'private');
});
