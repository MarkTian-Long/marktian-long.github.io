'use strict';
// Local to the published multimodal diagram, not a general SVG geometry parser.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const svg = fs.readFileSync(path.join(__dirname, '../assets/images/blog/multimodal-unification/multimodal-information-flow.svg'), 'utf8');

function attributes(tag) {
  return Object.fromEntries(Array.from(tag.matchAll(/([\w-]+)="([^"]*)"/g), m => [m[1], m[2]]));
}
function vertices(d) {
  const tokens = Array.from(d.matchAll(/([MHV])([\d.,\s-]+)/g));
  assert.equal(tokens.map(m => m[0]).join(''), d, 'This regression check only supports the actual M/H/V routes');
  const points = [];
  let x, y;
  for (const [, command, raw] of tokens) {
    const values = raw.trim().split(/[\s,]+/).map(Number);
    assert.ok(values.every(Number.isFinite));
    if (command === 'M') {
      assert.equal(points.length, 0); assert.equal(values.length, 2);
      [x, y] = values;
    } else {
      assert.ok(points.length); assert.equal(values.length, 1);
      if (command === 'H') x = values[0]; else y = values[0];
    }
    points.push({ x, y });
  }
  assert.ok(points.length >= 2);
  return points;
}
function checkArrows(source) {
  const markers = new Map();
  for (const match of source.matchAll(/<marker\b([^>]*)>([\s\S]*?)<\/marker>/g)) {
    const a = attributes(match[1]);
    assert.equal(a.markerUnits, 'userSpaceOnUse', 'Arrowheads must not grow with stroke width');
    assert.equal(a.viewBox, '0 0 12 10');
    assert.equal(a.refX, '12'); assert.equal(a.refY, '5');
    assert.equal(a.markerWidth, '12'); assert.equal(a.markerHeight, '10');
    assert.equal(a.orient, 'auto');
    assert.match(match[2], /d="M0 0L12 5L0 10Z"/);
    markers.set(a.id, a);
  }
  assert.equal(markers.size, 2);
  const nodes = new Map();
  for (const match of source.matchAll(/<g id="node-([^"]+)"><rect\b([^>]*)/g)) {
    const a = attributes(match[2]);
    nodes.set(match[1], { x: +a.x, y: +a.y, width: +a.width, height: +a.height });
  }
  const results = [];
  for (const match of source.matchAll(/<path\b[^>]*>/g)) {
    const a = attributes(match[0]);
    if (!a['marker-end']) continue;
    const markerId = /^url\(#([^)]+)\)$/.exec(a['marker-end'])?.[1];
    assert.ok(markers.has(markerId), 'Unknown arrowhead');
    const target = a['data-to'] || a['data-arrow-to'];
    assert.ok(nodes.has(target), 'Every visible arrow has a known geometric target');
    const points = vertices(a.d), end = points.at(-1), previous = points.at(-2), box = nodes.get(target);
    assert.equal(end.x, previous.x, 'Final approach is vertical');
    assert.ok(end.y > previous.y, 'Final approach points down');
    const shaft = end.y - previous.y - Number(markers.get(markerId).markerWidth);
    assert.ok(shaft >= 18, `${target}: arrowhead must leave at least 18 SVG units of visible straight shaft`);
    assert.equal(box.y - end.y, 6, `${target}: arrow tip must stop clear of the target border`);
    assert.equal(end.x, box.x + box.width / 2, `${target}: arrow must align with the target centre`);
    results.push({ target, shaft });
  }
  assert.equal(results.length, 9, 'Check all visible arrowheads, including shared input/output joins');
  return results;
}

test('multimodal arrowheads preserve visible shafts, target alignment and border clearance', () => {
  assert.equal(checkArrows(svg).length, 9);
});
test('arrow check rejects stroke-scaled heads instead of checking node gaps alone', () => {
  assert.throws(() => checkArrows(svg.replaceAll('markerUnits="userSpaceOnUse"', 'markerUnits="strokeWidth"')), /must not grow/);
});
test('arrow check rejects a short shaft even when the diagram canvas and nodes are unchanged', () => {
  assert.throws(() => checkArrows(svg.replace('M640 242V273', 'M640 264V273')), /visible straight shaft/);
});
test('arrow check rejects a tip overlapping the target border', () => {
  assert.throws(() => checkArrows(svg.replace('M640 242V273', 'M640 242V279')), /target border/);
});
test('arrow check rejects a visually misaligned target with unchanged logical IDs', () => {
  assert.throws(() => checkArrows(svg.replace('M640 583H278.5V653', 'M640 583H246V653')), /target centre/);
});
