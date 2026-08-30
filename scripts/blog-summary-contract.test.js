'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const test = require('node:test');
const cheerio = require('cheerio');

const { extractSummaryBlockquote, extractSourceSummary, parseSourceMarkdown } = require('../tools/blog/markdown-source');

const rootDir = path.resolve(__dirname, '..');
const personalSourcePath = path.join(rootDir, 'docs/blog/personal-harness.md');
const personalPost = require('../tools/blog/data/posts-meta.json').posts.find(post => post.slug === 'personal-harness');
const personalMarkdown = fs.readFileSync(personalSourcePath, 'utf8');

test('Markdown parser extracts only the title blockquote before the body separator', () => {
  const markdown = [
    '# Example title',
    '',
    '> line 1',
    '> line 2',
    '',
    '---',
    '',
    'Body paragraph.',
    '',
    '> A later quotation must not become the summary.',
    '',
    '```md',
    '# Not an H1',
    '> Not a summary',
    '```'
  ].join('\n');

  assert.deepEqual(extractSummaryBlockquote(markdown), ['line 1', 'line 2']);
  assert.equal(extractSourceSummary(markdown), 'line 1 line 2');
  assert.equal(parseSourceMarkdown(markdown).sourceTitle, 'Example title');
});

test('Markdown parser does not treat a code-fence quote as the summary', () => {
  const markdown = [
    '# Example title',
    '',
    '```md',
    '> Not a summary',
    '```',
    '',
    '> Actual summary',
    '',
    '---',
    '',
    'Body'
  ].join('\n');

  assert.throws(() => parseSourceMarkdown(markdown), /summary blockquote is ambiguous/);
});

test('Markdown parser rejects missing or ambiguous summary structure', () => {
  assert.throws(() => parseSourceMarkdown('# Example\n\n---\n\nBody'), /summary blockquote/);
  assert.throws(() => parseSourceMarkdown('Body only\n\n---\n\nBody'), /H1/);
  assert.throws(() => parseSourceMarkdown('# Example\n\n> First\n\n> Second\n\n---\n\nBody'), /ambiguous/);
  assert.throws(() => parseSourceMarkdown('# Example\n\n>   \n\n---\n\nBody'), /summary is empty/);
});

test('generate-post rejects metadata whose summary differs from the final Markdown blockquote', () => {
  const outputDir = fs.mkdtempSync(path.join(os.tmpdir(), 'summary-contract-'));
  const mismatchedSource = path.join(outputDir, 'personal-harness.md');
  const mismatchedOutput = path.join(outputDir, 'personal-harness.html');
  fs.writeFileSync(mismatchedSource, personalMarkdown.replace(
    '当 AI 成为长期协作者，真正值得积累的不只是 Prompt，而是你和 AI 一起工作的方式。',
    '这是一份不应被静默采用的替代摘要。'
  ), 'utf8');
  const result = spawnSync(process.execPath, [
    path.join(rootDir, 'tools/blog/generate-post.js'),
    '--write',
    mismatchedSource,
    mismatchedOutput
  ], { cwd: rootDir, encoding: 'utf8' });

  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /Metadata summary does not match final Markdown blockquote: personal-harness/);
  assert.equal(fs.existsSync(mismatchedOutput), false);
});

test('personal-harness summary is shared by metadata, article header, homepage data, list data, SEO, RSS, and share-card model', () => {
  const sourceSummary = extractSourceSummary(personalMarkdown, personalSourcePath);
  assert.equal(personalPost.summary, sourceSummary);
  const html = fs.readFileSync(path.join(rootDir, 'tools/blog/posts/personal-harness.html'), 'utf8');
  const $ = cheerio.load(html);
  assert.equal($('.post-summary').text(), sourceSummary);
  assert.equal(require('../tools/blog/share-card').createPosterModel(personalPost, {
    siteUrl: 'https://marktian-long.github.io',
    blogPath: '/tools/blog/',
    authorName: 'Leo Liu'
  }).summary, sourceSummary);
  assert.match(fs.readFileSync(path.join(rootDir, 'index.html'), 'utf8'), /p\.summary/);
  assert.match(fs.readFileSync(path.join(rootDir, 'tools/blog/index.html'), 'utf8'), /p\.summary/);
  assert.match(fs.readFileSync(path.join(rootDir, 'feed.xml'), 'utf8'), new RegExp(sourceSummary.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  assert.match(html, new RegExp(`name="description" content="${sourceSummary.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"`));
  assert.match(html, new RegExp(`property="og:description" content="${sourceSummary.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"`));
  assert.match(html, new RegExp(`name="twitter:description" content="${sourceSummary.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"`));
  assert.match(html, new RegExp(`"description":"${sourceSummary.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"`));
  assert.equal(personalPost.share_quote, '真正的 AI 杠杆，不只是让一次任务做得更快，而是让每一次合作，都能成为下一次合作的起点。');
});
