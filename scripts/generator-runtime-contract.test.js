'use strict';

const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const test = require('node:test');

const root = path.resolve(__dirname, '..');
const candidateRoot = path.join(root, 'build', 'candidate-site', 'generator-contract-tests');
const sha256 = file => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const run = (file, args) => execFileSync(process.execPath, [file, ...args], { cwd: root, encoding: 'utf8' });

test('default generator checks do not write a public artifact', () => {
  const publicBlog = path.join(root, 'tools', 'blog', 'posts', 'agent-boundary.html');
  const publicService = path.join(root, 'tools', 'service-agent', 'index.html');
  const before = [sha256(publicBlog), sha256(publicService)];
  const neverWritten = path.join(candidateRoot, `default-${process.pid}.html`);
  assert.throws(() => run('tools/blog/generate-post.js', ['docs/blog/agent-boundary.md', neverWritten]));
  assert.equal(fs.existsSync(neverWritten), false);
  assert.throws(() => run('tools/service-agent/gen_index.js', []));
  assert.deepEqual([sha256(publicBlog), sha256(publicService)], before);
  assert.match(run('scripts/fetch-trends.js', []), /structurally complete/);
});

test('candidate generators are confined to the candidate build root', () => {
  const target = path.join(candidateRoot, `trends-${process.pid}.json`);
  run('scripts/fetch-trends.js', ['--candidate', target]);
  assert.equal(fs.existsSync(target), true);
  assert.throws(() => run('scripts/fetch-trends.js', ['--candidate', 'tools/trends/data/escape.json']));
  assert.throws(() => run('tools/blog/generate-post.js', ['--candidate', 'docs/blog/agent-boundary.md', 'tools/blog/posts/escape.html']));
  assert.throws(() => run('tools/service-agent/gen_index.js', ['--candidate', 'tools/service-agent/escape.html']));
  assert.throws(() => run('tools/blog/generate-post.js', ['--write', '--candidate', 'docs/blog/agent-boundary.md', target]));
  assert.throws(() => run('tools/service-agent/gen_index.js', ['--write', '--candidate', target]));
  assert.throws(() => run('scripts/fetch-trends.js', ['--write', '--candidate', target]));
});
