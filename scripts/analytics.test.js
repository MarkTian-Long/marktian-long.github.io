const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const source = fs.readFileSync(path.join(__dirname, '../assets/js/analytics.js'), 'utf8');
const runtime = fs.readFileSync(path.join(__dirname, '../tools/blog/article-runtime.js'), 'utf8');

test('blog click analytics separates all internal navigation surfaces without collecting content', () => {
  for (const surface of ['body', 'continue_reading', 'archive', 'homepage']) {
    assert.match(source, new RegExp(`['"]${surface}['"]`));
  }
  assert.match(runtime, /analyticsSource = 'post_nav'/);
  assert.match(runtime, /data-analytics-source="continue_reading"/);
  assert.match(source, /relation_type/);
  assert.match(source, /BLOCKED_KEYS = \/email\|phone\|name\|content\/i/);
});
