'use strict';

const assert = require('node:assert/strict');
const childProcess = require('node:child_process');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const cheerio = require('cheerio');
const { PUBLIC_FILES } = require('./public-dist-manifest');

const repoRoot = path.resolve(__dirname, '..');
const slug = 'preview-fixture';
const sourcePath = `drafts/blog/${slug}.md`;
const imagePath = `assets/images/blog/${slug}/opening-context.svg`;
const imageLine = `![开篇对象与问题关系](../../${imagePath} "开篇对象帮助读者理解本文的问题。")`;
const quote = '这是一句最终正文中真实存在的完整原句。';
const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="0 0 1280 720"><rect width="1280" height="720" fill="#f4f3ed"/><text x="100" y="200">Context</text></svg>';

function source(body = `${imageLine}\n\n${quote}`) {
  return [
    '---', 'category: 商业', 'tags: ["市场格局"]', 'topics: ["企业AI"]',
    'concepts: ["软件采购经济性", "Build vs Buy", "软件价值捕获", "软件价值链"]',
    `share_quote: "${quote}"`, 'relations: []', '---', '', '# 候选预览标题', '',
    '> 用于检验预览隔离的摘要。', '', '---', '', body, '',
    '## 参考资料', '', '### 一手资料', '', '- [研究原文](https://example.com/paper)', '',
  ].join('\n');
}

function put(root, relative, value) {
  const target = path.join(root, relative);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, value);
}

function fixture(t, body) {
  fs.mkdirSync(path.join(repoRoot, 'build'), { recursive: true });
  const root = fs.mkdtempSync(path.join(repoRoot, 'build/blog-preview-test-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  for (const file of PUBLIC_FILES) put(root, file, `Published fixture: ${file}\n`);
  for (const file of ['tools/blog/article-template.html', 'tools/blog/article-runtime.js', 'tools/blog/article-links.css']) {
    put(root, file, fs.readFileSync(path.join(repoRoot, file)));
  }
  put(root, 'tools/blog/data/posts-meta.json', JSON.stringify({
    version: 4, image_contract: { version: 1, legacy_without_visuals: [] }, posts: [],
  }, null, 2) + '\n');
  fs.mkdirSync(path.join(root, 'tools/blog/posts'), { recursive: true });
  put(root, sourcePath, source(body));
  put(root, imagePath, svg);
  put(root, 'drafts/blog/internal-note.md', 'Never publish this internal note.');
  return root;
}

function cli(root, args, script = 'tools/blog/build-preview.js') {
  return childProcess.spawnSync(process.execPath, [path.join(repoRoot, script), ...args], {
    cwd: root, encoding: 'utf8', env: process.env,
  });
}

function snapshot(root) {
  const result = {};
  function visit(directory, prefix = '') {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const relative = prefix + entry.name;
      if (relative === 'build') continue;
      const absolute = path.join(directory, entry.name);
      if (entry.isDirectory()) visit(absolute, relative + '/');
      else if (entry.isSymbolicLink()) result[relative] = `symlink:${fs.readlinkSync(absolute)}`;
      else result[relative] = crypto.createHash('sha256').update(fs.readFileSync(absolute)).digest('hex');
    }
  }
  visit(root);
  return result;
}

test('preview CLI defaults to validation and never creates output or publishes draft metadata', (t) => {
  const root = fixture(t);
  const before = snapshot(root);
  const result = cli(root, ['--source', sourcePath]);
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /check/);
  assert.deepEqual(snapshot(root), before);
  assert.equal(fs.existsSync(path.join(root, 'build')), false);
});

test('explicit candidate build renders a real noindex preview without changing any source file', (t) => {
  const root = fixture(t);
  const before = snapshot(root);
  const outputDir = 'build/candidate-site/review';
  const result = cli(root, ['--write', '--source', sourcePath, '--out', outputDir]);
  assert.equal(result.status, 0, result.stderr);
  const candidateRoot = path.join(root, outputDir);
  const htmlPath = path.join(candidateRoot, `tools/blog/previews/${slug}.html`);
  const $ = cheerio.load(fs.readFileSync(htmlPath, 'utf8'));
  assert.equal($('h1.post-title').text(), '候选预览标题');
  assert.equal($('.post-date').text(), '未发布预览');
  assert.equal($('meta[name="robots"]').attr('content'), 'noindex, nofollow');
  assert.equal($('link[rel="canonical"], meta[property="og:url"], script[type="application/ld+json"]').length, 0);
  assert.deepEqual($('#post-tags .tag').map((_, el) => $(el).text()).get(), ['市场格局', '企业AI']);
  assert.equal($('.post-body').children().first().attr('class'), 'post-figure');
  assert.equal($('.post-body figure img').attr('src'), `../../../${imagePath}`);
  assert.equal($('.post-body figure figcaption').text(), '开篇对象帮助读者理解本文的问题。');
  assert.equal($('.post-body h2').last().text(), '参考资料');
  assert.equal($('.post-body h3').last().text(), '一手资料');
  assert.equal($('script[src="../article-runtime.js"]').length, 1);
  assert.equal(fs.readFileSync(path.join(candidateRoot, 'tools/blog/article-runtime.js'), 'utf8'), fs.readFileSync(path.join(root, 'tools/blog/article-runtime.js'), 'utf8'));
  assert.deepEqual(fs.readFileSync(path.join(candidateRoot, imagePath)), fs.readFileSync(path.join(root, imagePath)));
  assert.equal(fs.existsSync(path.join(candidateRoot, 'drafts')), false);
  assert.equal(fs.existsSync(path.join(candidateRoot, `tools/blog/posts/${slug}.html`)), false);
  assert.deepEqual(snapshot(root), before);
  assert.deepEqual(fs.readFileSync(path.join(candidateRoot, 'tools/blog/data/posts-meta.json')), fs.readFileSync(path.join(root, 'tools/blog/data/posts-meta.json')));
});

test('new previews require an opening figure before prose, including when a later image exists', (t) => {
  for (const body of [quote, `${quote}\n\n${imageLine}`, `\`\`\`markdown\n${imageLine}\n\`\`\`\n\n${quote}`]) {
    const root = fixture(t, body);
    const result = cli(root, ['--source', sourcePath]);
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /opening image|首图/i);
    assert.equal(fs.existsSync(path.join(root, 'build')), false);
  }
});

test('preview writes require an explicit bounded output and reject existing content without deleting it', (t) => {
  const root = fixture(t);
  for (const args of [
    ['--write', '--source', sourcePath],
    ['--source', sourcePath, '--out', 'build/candidate-site/review'],
    ['--write', '--source', sourcePath, '--out', 'tools/blog/previews'],
    ['--write', '--source', sourcePath, '--out', '../outside'],
    ['--write', '--source', sourcePath, '--out', 'build/candidate-site'],
  ]) {
    const result = cli(root, args);
    assert.notEqual(result.status, 0, args.join(' '));
    assert.match(result.stderr, /out|candidate|write/i);
  }
  put(root, 'build/candidate-site/review/keep.txt', 'Do not overwrite');
  const result = cli(root, ['--write', '--source', sourcePath, '--out', 'build/candidate-site/review']);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /empty|overwrite/i);
  assert.equal(fs.readFileSync(path.join(root, 'build/candidate-site/review/keep.txt'), 'utf8'), 'Do not overwrite');
});

test('opening-image exceptions require a reason actually recorded for the same article', (t) => {
  const root = fixture(t, quote);
  const reason = '作者明确要求本篇保留无首图的文字开篇。';
  const evidence = `drafts/blog/reviews/${slug}.md`;
  put(root, evidence, `# 本篇审查记录\n\n${reason}\n`);
  for (const args of [
    ['--opening-image-exception', reason],
    ['--opening-image-evidence', evidence],
    ['--opening-image-exception', '没有记录的另一个理由。', '--opening-image-evidence', evidence],
    ['--opening-image-exception', reason, '--opening-image-evidence', 'drafts/blog/reviews/other-post.md'],
  ]) {
    const result = cli(root, ['--source', sourcePath, ...args]);
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /exception|evidence|reason|review/i);
  }
  const result = cli(root, ['--source', sourcePath, '--opening-image-exception', reason, '--opening-image-evidence', evidence]);
  assert.equal(result.status, 0, result.stderr);
  const report = JSON.parse(result.stdout);
  assert.equal(report.openingImage.present, false);
  assert.equal(report.openingImage.exception.reason, reason);
  assert.equal(report.openingImage.exception.evidence, evidence);
  assert.equal(report.openingImage.exception.sha256, crypto.createHash('sha256').update(fs.readFileSync(path.join(root, evidence))).digest('hex'));
});

test('existing preview evidence must be a noindex review of the same draft, not an empty page or redirect', (t) => {
  const root = fixture(t, `${quote}\n\n${imageLine}`);
  const evidence = `tools/blog/previews/${slug}.html`;
  const args = ['--source', sourcePath, '--opening-image-exception', '本篇已在首图规则启用之前完成首次完整预览。', '--opening-image-evidence', evidence];
  const good = '<!doctype html><html><head><meta name="robots" content="noindex, nofollow"></head><body><h1 class="post-title">候选预览标题</h1><div class="post-body"><p>已有完整审阅正文。</p></div></body></html>';
  for (const html of ['', '<meta http-equiv="refresh" content="0;url=../posts/example.html">', good.replace('noindex, nofollow', 'index'), good.replace('候选预览标题', '其他稿件')]) {
    put(root, evidence, html);
    const result = cli(root, args);
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /evidence|preview/i);
  }
  put(root, evidence, good);
  const result = cli(root, args);
  assert.equal(result.status, 0, result.stderr);
  assert.equal(JSON.parse(result.stdout).openingImage.exception.kind, 'existing-preview');
});

test('an opening exception never bypasses invalid or missing body-image validation', (t) => {
  const reason = '作者允许本篇保持先导语后图片的结构。';
  for (const replacement of [null, svg.replace('width="1280"', 'width="400"'), '<svg width="1280" height="720"><script>alert(1)</script></svg>']) {
    const root = fixture(t, `${quote}\n\n${imageLine}`);
    const evidence = `drafts/blog/reviews/${slug}.md`;
    put(root, evidence, reason);
    if (replacement === null) fs.unlinkSync(path.join(root, imagePath));
    else put(root, imagePath, replacement);
    const result = cli(root, ['--source', sourcePath, '--opening-image-exception', reason, '--opening-image-evidence', evidence]);
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /image|SVG|dimensions|missing|exist/i);
  }
});

test('unsafe and cross-article image references cannot become registered candidate assets', (t) => {
  for (const ref of ['https://example.com/context.svg', '../../assets/images/blog/other-post/context.svg', '../../assets/images/blog/preview-fixture/../other-post/context.svg', '../../assets/images/blog/preview-fixture/%2e%2e/context.svg']) {
    const root = fixture(t, `${imageLine.replace(`../../${imagePath}`, ref)}\n\n${quote}`);
    const result = cli(root, ['--source', sourcePath]);
    assert.notEqual(result.status, 0, ref);
    assert.match(result.stderr, /image|local|path|article/i);
  }
});

test('source, image, public input, and output symlinks cannot escape the repository contract', (t) => {
  for (const target of ['source', 'image', 'public', 'output']) {
    const root = fixture(t);
    const outside = path.join(root, 'private');
    fs.mkdirSync(outside);
    put(root, 'private/keep.txt', 'Private sentinel');
    let args = ['--write', '--source', sourcePath, '--out', 'build/candidate-site/review'];
    if (target === 'source' || target === 'image' || target === 'public') {
      const relative = target === 'source' ? sourcePath : target === 'image' ? imagePath : 'assets/js/analytics.js';
      const original = fs.readFileSync(path.join(root, relative));
      put(root, `private/${path.basename(relative)}`, original);
      fs.unlinkSync(path.join(root, relative));
      fs.symlinkSync(path.join(outside, path.basename(relative)), path.join(root, relative));
    } else {
      fs.mkdirSync(path.join(root, 'build'), { recursive: true });
      fs.symlinkSync(outside, path.join(root, 'build/candidate-site'));
    }
    const result = cli(root, args);
    assert.notEqual(result.status, 0, target);
    assert.match(result.stderr, /symlink|symbolic/i);
    assert.equal(fs.readFileSync(path.join(outside, 'keep.txt'), 'utf8'), 'Private sentinel');
    assert.equal(fs.existsSync(path.join(outside, 'review')), false);
  }
});

test('standalone opening checker validates the draft without needing a published metadata entry', (t) => {
  const root = fixture(t);
  const result = cli(root, ['--source', sourcePath], 'scripts/check-blog-opening-image.js');
  assert.equal(result.status, 0, result.stderr);
  const report = JSON.parse(result.stdout);
  assert.equal(report.openingImage.present, true);
  assert.equal(report.images[0].src, imagePath);
  assert.equal(report.images[0].width, 1280);
  assert.equal(report.images[0].height, 720);
  assert.equal(report.images[0].alt, '开篇对象与问题关系');
  assert.equal(report.images[0].caption, '开篇对象帮助读者理解本文的问题。');
});
