'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const cheerio = require('cheerio');
const { publicFiles } = require('./public-dist-manifest');

const repoRoot = path.resolve(__dirname, '..');

function read(relativePath) {
  return fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

function resolveLocalHref(pagePath, href) {
  const cleanHref = href.split(/[?#]/, 1)[0];
  if (cleanHref.startsWith('/')) return cleanHref.slice(1).replace(/\\/g, '/');
  return path.relative(repoRoot, path.resolve(path.dirname(path.join(repoRoot, pagePath)), cleanHref))
    .split(path.sep)
    .join('/');
}

test('homepage exposes eight trustworthy tool links without unverified outcome claims', () => {
  const $ = cheerio.load(read('index.html'));
  const expected = new Map([
    ['tools/esop-extractor/index.html', ['esop-extractor', '证据核验']],
    ['tools/stock/index.html', ['financial-rag', '证据来源']],
    ['tools/service-agent/index.html', ['service-agent', '故障注入']],
    ['tools/asci/index.html', ['asci-research-system', '14 节点']],
    ['tools/ai-insights/index.html', ['ai-insights', '证据账本']],
    ['tools/radar/index.html', ['radar', '研究意图']],
    ['tools/trends/index.html', ['trends', '可追溯']],
    ['tools/agent-hub/index.html', ['agent-hub', '是否需要 Agent']],
  ]);
  const items = $('#tools .works-item').toArray();

  assert.equal(items.length, 8);
  for (const item of items) {
    const href = $(item).attr('href');
    assert.ok(expected.has(href), `unexpected homepage tool href: ${href}`);
    const [portfolioId, taskPattern] = expected.get(href);
    assert.equal($(item).attr('data-portfolio-id'), portfolioId, `${href} should map to its evidence record`);
    assert.equal($(item).attr('target'), '_blank', `${href} should open in a new tab`);
    assert.ok(new Set(($(item).attr('rel') || '').split(/\s+/)).has('noopener'), `${href} needs rel=noopener`);
    assert.match($(item).find('.works-desc').text(), new RegExp(taskPattern), `${href} description should state its task`);
  }

  const sectionText = $('#tools').text();
  assert.doesNotMatch(sectionText, /≥\s*95%/);
  assert.doesNotMatch(sectionText, /5\s*步全链路/);
});

test('the four information tools expose one consistent workflow navigation contract', () => {
  const pages = [
    ['tools/radar/index.html', '信源'],
    ['tools/trends/index.html', '信号'],
    ['tools/ai-insights/index.html', '分析'],
    ['tools/agent-hub/index.html', '方法'],
  ];
  const expectedTargets = pages.map(([page]) => page);

  for (const [page] of pages) {
    const $ = cheerio.load(read(page));
    const workflow = $('nav[data-workflow-nav]');
    assert.equal(workflow.length, 1, `${page} should expose one semantic workflow navigation`);

    const anchors = workflow.find('a').toArray();
    assert.equal(anchors.length, pages.length, `${page} should expose exactly four workflow steps`);
    const actualTargets = anchors.map((anchor, index) => {
      const href = $(anchor).attr('href');
      assert.ok(href, `${page} workflow step ${index + 1} needs an href`);
      assert.match(
        $(anchor).text().replace(/\s+/g, ' ').trim(),
        new RegExp(`^0?${index + 1}\\s+${pages[index][1]}`),
        `${page} workflow step ${index + 1} needs the canonical label`,
      );
      return resolveLocalHref(page, href);
    });
    assert.deepEqual(actualTargets, expectedTargets, `${page} workflow hrefs must use the canonical order`);

    const current = workflow.find('[aria-current="step"]');
    assert.equal(current.length, 1, `${page} should expose exactly one current workflow step`);
    assert.equal(resolveLocalHref(page, current.attr('href')), page, `${page} should mark only itself as current`);
  }
});

test('public manifest includes every local runtime asset referenced by the eight tool pages', () => {
  const pages = [
    'tools/esop-extractor/index.html',
    'tools/stock/index.html',
    'tools/service-agent/index.html',
    'tools/asci/index.html',
    'tools/ai-insights/index.html',
    'tools/radar/index.html',
    'tools/trends/index.html',
    'tools/agent-hub/index.html',
  ];
  const manifest = new Set(publicFiles(repoRoot));

  for (const page of pages) {
    assert.ok(manifest.has(page), `${page} must be public`);
    const $ = cheerio.load(read(page));
    $('[src], link[href]').each((_, element) => {
      const reference = $(element).attr('src') || $(element).attr('href');
      if (!reference || /^(?:https?:|data:|mailto:|tel:|\/\/|#)/i.test(reference)) return;
      const target = resolveLocalHref(page, reference);
      assert.ok(fs.existsSync(path.join(repoRoot, target)), `${page} references missing source asset ${target}`);
      assert.ok(manifest.has(target), `${page} references non-public asset ${target}`);
    });
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
