const test = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const sharp = require('sharp');

const {
  prepareBlogImage,
  parseArgs: parsePrepareArgs,
} = require('./prepare-blog-image');
const { validateBlogImages } = require('./check-blog-images');

const BUILD_FIXTURE_ROOT = path.resolve(__dirname, '..', 'build', 'test-blog-images');

function fixtureRoot() {
  fs.mkdirSync(BUILD_FIXTURE_ROOT, { recursive: true });
  return fs.mkdtempSync(path.join(BUILD_FIXTURE_ROOT, 'case-'));
}

async function createInput(rootDir, name = 'candidate.png', width = 1600, height = 1000) {
  const inputDir = path.join(rootDir, 'candidate');
  fs.mkdirSync(inputDir, { recursive: true });
  const inputPath = path.join(inputDir, name);
  await sharp({
    create: {
      width,
      height,
      channels: 3,
      background: { r: 18, g: 36, b: 61 },
    },
  }).png().toFile(inputPath);
  return inputPath;
}

function metadata(slug, visuals, exempt = false) {
  return {
    image_contract: {
      version: 1,
      legacy_without_visuals: exempt ? [slug] : [],
    },
    posts: [{
      slug,
      title: 'Sample',
      summary: 'Sample summary',
      url: `posts/${slug}.html`,
      ...(visuals ? { visuals } : {}),
    }],
  };
}

function coverVisual(slug) {
  return {
    cover: {
      src: `assets/images/blog/${slug}/cover.jpg`,
      alt: '深色背景中的个人工作台与多个协作模块形成闭环',
      width: 1200,
      height: 630,
    },
    inline: [],
  };
}

function inlineVisual(slug, name = 'context-loop') {
  return {
    src: `assets/images/blog/${slug}/${name}.webp`,
    alt: '上下文与反馈形成闭环',
    caption: '闭环把本次任务转化为下次任务可复用的上下文。',
    width: 1280,
    height: 720,
  };
}

async function writeMetadata(rootDir, value) {
  const metadataPath = path.join(rootDir, 'tools', 'blog', 'data', 'posts-meta.json');
  fs.mkdirSync(path.dirname(metadataPath), { recursive: true });
  fs.writeFileSync(metadataPath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function writePostHtml(rootDir, slug, visuals, {
  includeCover = true,
  includeInline = true,
  coverAfterDivider = false,
  lineEnding = '\n',
} = {}) {
  const postPath = path.join(rootDir, 'tools', 'blog', 'posts', `${slug}.html`);
  fs.mkdirSync(path.dirname(postPath), { recursive: true });
  const cover = includeCover
    ? `<figure class="post-cover">\n  <img src="../../../${visuals.cover.src}" alt="${visuals.cover.alt}" width="${visuals.cover.width}" height="${visuals.cover.height}" loading="eager" decoding="async" fetchpriority="high" />\n</figure>`
    : '';
  const figures = includeInline
    ? visuals.inline.map(image => `<figure class="post-figure">\n  <img src="../../../${image.src}" alt="${image.alt}" width="${image.width}" height="${image.height}" loading="lazy" decoding="async" />\n  <figcaption>${image.caption}</figcaption>\n</figure>`).join('\n')
    : '';
  const body = coverAfterDivider
    ? `<main><header class="post-header">Header</header>\n<hr class="divider" />\n<div class="post-body">${cover}\n${figures}</div>\n<hr class="divider" /></main>`
    : `<main><header class="post-header">Header</header>\n${cover}\n<hr class="divider" />\n<div class="post-body">${figures}</div></main>`;
  fs.writeFileSync(postPath, body.replace(/\n/g, lineEnding), 'utf8');
}

test('cover preparation writes a bounded 1200x630 JPEG under the slug directory', async () => {
  const rootDir = fixtureRoot();
  const inputPath = await createInput(rootDir);
  const result = await prepareBlogImage({
    rootDir,
    slug: 'sample-post',
    role: 'cover',
    inputPath,
  });

  const image = await sharp(result.outputPath).metadata();
  assert.equal(result.relativePath, 'assets/images/blog/sample-post/cover.jpg');
  assert.equal(image.format, 'jpeg');
  assert.equal(image.width, 1200);
  assert.equal(image.height, 630);
  assert.ok(result.bytes <= 350 * 1024);
});

test('inline preparation writes a bounded named 1280x720 WebP', async () => {
  const rootDir = fixtureRoot();
  const inputPath = await createInput(rootDir);
  const result = await prepareBlogImage({
    rootDir,
    slug: 'sample-post',
    role: 'inline',
    name: 'context-loop',
    inputPath,
  });

  const image = await sharp(result.outputPath).metadata();
  assert.equal(result.relativePath, 'assets/images/blog/sample-post/context-loop.webp');
  assert.equal(image.format, 'webp');
  assert.equal(image.width, 1280);
  assert.equal(image.height, 720);
  assert.ok(result.bytes <= 250 * 1024);
});

test('inline 4:3 preparation preserves a selected tall editorial composition', async () => {
  const rootDir = fixtureRoot();
  const inputPath = await createInput(rootDir, 'four-three.png', 1600, 1200);
  const result = await prepareBlogImage({ rootDir, slug: 'sample-post', role: 'inline', name: 'parallel-agents', aspect: '4:3', inputPath });
  const image = await sharp(result.outputPath).metadata();
  assert.deepEqual({ width: image.width, height: image.height, format: image.format }, { width: 1280, height: 960, format: 'webp' });
  assert.ok(result.bytes <= 250 * 1024);
  assert.deepEqual(parsePrepareArgs(['--slug','sample-post','--role','inline','--name','parallel-agents','--input','candidate.png','--aspect','4:3']), {
    slug:'sample-post', role:'inline', name:'parallel-agents', inputPath:'candidate.png', aspect:'4:3',
  });
});

test('preparation rejects unsafe arguments, undersized inputs, and overwrites', async () => {
  const rootDir = fixtureRoot();
  const inputPath = await createInput(rootDir);
  const smallInput = await createInput(rootDir, 'small.png', 900, 500);

  await assert.rejects(
    () => prepareBlogImage({ rootDir, slug: '../escape', role: 'cover', inputPath }),
    /slug/i,
  );
  await assert.rejects(
    () => prepareBlogImage({ rootDir, slug: 'sample-post', role: 'poster', inputPath }),
    /role/i,
  );
  await assert.rejects(
    () => prepareBlogImage({ rootDir, slug: 'sample-post', role: 'inline', inputPath }),
    /name/i,
  );
  await assert.rejects(
    () => prepareBlogImage({ rootDir, slug: 'sample-post', role: 'inline', name: 'Image 1', inputPath }),
    /name/i,
  );
  await assert.rejects(
    () => prepareBlogImage({ rootDir, slug: 'sample-post', role: 'cover', inputPath: smallInput }),
    /smaller.*1200.*630/i,
  );

  await prepareBlogImage({ rootDir, slug: 'sample-post', role: 'cover', inputPath });
  await assert.rejects(
    () => prepareBlogImage({ rootDir, slug: 'sample-post', role: 'cover', inputPath }),
    /refus.*overwrite/i,
  );
});

test('CLI parsing requires documented role-specific arguments', () => {
  assert.deepEqual(parsePrepareArgs([
    '--slug', 'sample-post', '--role', 'cover', '--input', 'candidate.png',
  ]), {
    slug: 'sample-post',
    role: 'cover',
    inputPath: 'candidate.png',
  });
  assert.deepEqual(parsePrepareArgs([
    '--slug', 'sample-post', '--role', 'inline', '--name', 'context-loop', '--input', 'candidate.png',
  ]), {
    slug: 'sample-post',
    role: 'inline',
    name: 'context-loop',
    inputPath: 'candidate.png',
  });
  assert.throws(() => parsePrepareArgs(['--slug', 'sample-post', '--wat', 'x']), /unknown/i);
  assert.throws(() => parsePrepareArgs(['--slug']), /value/i);
});

test('asset validation accepts one declared, correctly prepared cover', async () => {
  const rootDir = fixtureRoot();
  const slug = 'sample-post';
  const inputPath = await createInput(rootDir);
  await prepareBlogImage({ rootDir, slug, role: 'cover', inputPath });
  const visuals = coverVisual(slug);
  await writeMetadata(rootDir, metadata(slug, visuals));
  writePostHtml(rootDir, slug, visuals);

  const result = await validateBlogImages({ rootDir });
  assert.deepEqual(result, { declared: 1, checked: 1 });
});

test('asset validation accepts a current article with no images', async () => {
  const rootDir = fixtureRoot();
  const slug = 'text-only-post';
  const visuals = { inline: [] };
  await writeMetadata(rootDir, metadata(slug));
  writePostHtml(rootDir, slug, visuals, { includeCover: false, includeInline: false });

  assert.deepEqual(await validateBlogImages({ rootDir }), { declared: 0, checked: 0 });
});

test('asset validation fully decodes declared images instead of trusting headers', async () => {
  const rootDir = fixtureRoot();
  const slug = 'sample-post';
  const outputPath = path.join(rootDir, 'assets', 'images', 'blog', slug, 'cover.jpg');
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  const pixels = crypto.randomBytes(1200 * 630 * 3);
  const complete = await sharp(pixels, { raw: { width: 1200, height: 630, channels: 3 } })
    .jpeg({ quality: 35 })
    .toBuffer();
  const truncated = complete.subarray(0, Math.floor(complete.length * 0.6));
  fs.writeFileSync(outputPath, truncated);
  const header = await sharp(outputPath).metadata();
  assert.equal(header.width, 1200);
  assert.equal(header.height, 630);
  const visuals = coverVisual(slug);
  await writeMetadata(rootDir, metadata(slug, visuals));
  writePostHtml(rootDir, slug, visuals);

  await assert.rejects(() => validateBlogImages({ rootDir }), /decode|corrupt|premature|truncat/i);
});

test('asset validation requires declared covers and inline images in the rendered article', async () => {
  const missingCoverRoot = fixtureRoot();
  const slug = 'sample-post';
  const inputPath = await createInput(missingCoverRoot);
  await prepareBlogImage({ rootDir: missingCoverRoot, slug, role: 'cover', inputPath });
  const coverOnly = coverVisual(slug);
  await writeMetadata(missingCoverRoot, metadata(slug, coverOnly));
  writePostHtml(missingCoverRoot, slug, coverOnly, { includeCover: false });
  await assert.rejects(() => validateBlogImages({ rootDir: missingCoverRoot }), /rendered.*post-cover/i);
  writePostHtml(missingCoverRoot, slug, coverOnly, { coverAfterDivider: true });
  await assert.rejects(() => validateBlogImages({ rootDir: missingCoverRoot }), /between.*header.*divider/i);

  const missingInlineRoot = fixtureRoot();
  const secondInput = await createInput(missingInlineRoot);
  await prepareBlogImage({ rootDir: missingInlineRoot, slug, role: 'cover', inputPath: secondInput });
  await prepareBlogImage({ rootDir: missingInlineRoot, slug, role: 'inline', name: 'context-loop', inputPath: secondInput });
  const withInline = coverVisual(slug);
  withInline.inline = [inlineVisual(slug)];
  await writeMetadata(missingInlineRoot, metadata(slug, withInline));
  writePostHtml(missingInlineRoot, slug, withInline, { includeInline: false });
  await assert.rejects(() => validateBlogImages({ rootDir: missingInlineRoot }), /rendered.*post-figure|context-loop/i);
});

test('asset validation accepts generator markup after a CRLF checkout', async () => {
  const rootDir = fixtureRoot();
  const slug = 'sample-post';
  const inputPath = await createInput(rootDir);
  await prepareBlogImage({ rootDir, slug, role: 'cover', inputPath });
  await prepareBlogImage({ rootDir, slug, role: 'inline', name: 'context-loop', inputPath });
  const visuals = coverVisual(slug);
  visuals.inline = [inlineVisual(slug)];
  await writeMetadata(rootDir, metadata(slug, visuals));
  writePostHtml(rootDir, slug, visuals, { lineEnding: '\r\n' });

  assert.deepEqual(await validateBlogImages({ rootDir }), { declared: 2, checked: 2 });
});

test('asset validation rejects missing and orphan blog images', async () => {
  const missingRoot = fixtureRoot();
  await writeMetadata(missingRoot, metadata('missing-post', coverVisual('missing-post')));
  await assert.rejects(() => validateBlogImages({ rootDir: missingRoot }), /missing.*cover\.jpg/i);

  const orphanRoot = fixtureRoot();
  await writeMetadata(orphanRoot, metadata('legacy-post', null, true));
  const orphanPath = path.join(orphanRoot, 'assets', 'images', 'blog', 'legacy-post', 'orphan.webp');
  fs.mkdirSync(path.dirname(orphanPath), { recursive: true });
  await sharp({ create: { width: 1280, height: 720, channels: 3, background: '#123456' } })
    .webp().toFile(orphanPath);
  await assert.rejects(() => validateBlogImages({ rootDir: orphanRoot }), /orphan.*orphan\.webp/i);
});


test('noindex draft preview assets are verified without publishing metadata', async () => {
  const rootDir = fixtureRoot();
  await writeMetadata(rootDir, metadata('legacy-post', null, true));
  writePostHtml(rootDir, 'legacy-post', { inline: [] }, { includeCover: false, includeInline: false });

  const slug = 'preview-post';
  const imagePath = 'assets/images/blog/' + slug + '/cost-mechanism.svg';
  const assetPath = path.join(rootDir, ...imagePath.split('/'));
  fs.mkdirSync(path.dirname(assetPath), { recursive: true });
  fs.writeFileSync(assetPath,
    '<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="0 0 1280 720">'
    + '<rect width="1280" height="720" fill="#faf9f5"/></svg>');

  const alt = 'AI 改变使用和建设成本';
  const caption = '示意两条成本变化路径。';
  const draftPath = path.join(rootDir, 'drafts', 'blog', slug + '.md');
  fs.mkdirSync(path.dirname(draftPath), { recursive: true });
  fs.writeFileSync(draftPath, '![' + alt + '](../../' + imagePath + ' "' + caption + '")\n');

  const previewPath = 'tools/blog/previews/' + slug + '.html';
  const previewFile = path.join(rootDir, ...previewPath.split('/'));
  fs.mkdirSync(path.dirname(previewFile), { recursive: true });
  const figure = '<figure class="post-figure">\n'
    + '  <img src="../../../' + imagePath + '" alt="' + alt
    + '" width="1280" height="720" loading="lazy" decoding="async" />\n'
    + '  <figcaption>' + caption + '</figcaption>\n</figure>';
  fs.writeFileSync(previewFile,
    '<html><head><meta name="robots" content="noindex, nofollow"/></head>'
    + '<body>' + figure + '</body></html>');

  assert.deepEqual(await validateBlogImages({ rootDir, previewPaths: [previewPath] }),
    { declared: 1, checked: 1 });

  fs.writeFileSync(previewFile,
    '<html><head><meta name="robots" content="noindex, nofollow"/></head>'
    + '<body>' + figure.replace('alt="' + alt + '"', 'alt="wrong"') + '</body></html>');
  await assert.rejects(
    () => validateBlogImages({ rootDir, previewPaths: [previewPath] }),
    /preview image does not match/i,
  );
});

test('asset validation rejects wrong dimensions, format, and byte budget', async () => {
  const wrongSizeRoot = fixtureRoot();
  const wrongSizePath = path.join(wrongSizeRoot, 'assets', 'images', 'blog', 'sample-post', 'cover.jpg');
  fs.mkdirSync(path.dirname(wrongSizePath), { recursive: true });
  await sharp({ create: { width: 800, height: 600, channels: 3, background: '#123456' } })
    .jpeg().toFile(wrongSizePath);
  await writeMetadata(wrongSizeRoot, metadata('sample-post', coverVisual('sample-post')));
  await assert.rejects(() => validateBlogImages({ rootDir: wrongSizeRoot }), /1200.*630/i);

  const wrongFormatRoot = fixtureRoot();
  const wrongFormatPath = path.join(wrongFormatRoot, 'assets', 'images', 'blog', 'sample-post', 'cover.jpg');
  fs.mkdirSync(path.dirname(wrongFormatPath), { recursive: true });
  await sharp({ create: { width: 1200, height: 630, channels: 3, background: '#123456' } })
    .png().toFile(wrongFormatPath);
  await writeMetadata(wrongFormatRoot, metadata('sample-post', coverVisual('sample-post')));
  await assert.rejects(() => validateBlogImages({ rootDir: wrongFormatRoot }), /format.*jpeg/i);

  const oversizedRoot = fixtureRoot();
  const oversizedPath = path.join(oversizedRoot, 'assets', 'images', 'blog', 'sample-post', 'cover.jpg');
  fs.mkdirSync(path.dirname(oversizedPath), { recursive: true });
  const noise = crypto.randomBytes(1200 * 630 * 3);
  const oversized = await sharp(noise, { raw: { width: 1200, height: 630, channels: 3 } })
    .jpeg({ quality: 100, chromaSubsampling: '4:4:4' }).toBuffer();
  assert.ok(oversized.length > 350 * 1024);
  fs.writeFileSync(oversizedPath, oversized);
  await writeMetadata(oversizedRoot, metadata('sample-post', coverVisual('sample-post')));
  await assert.rejects(() => validateBlogImages({ rootDir: oversizedRoot }), /350.*KB/i);
});

test('sourced external photos are checked against the exact publication allowlist', async () => {
  const rootDir = fixtureRoot();
  const visuals = { inline: [] };
  await writeMetadata(rootDir, metadata('fsd-optimus', visuals));
  writePostHtml(rootDir, 'fsd-optimus', visuals, { includeCover: false, includeInline: false });
  const postPath = path.join(rootDir, 'tools', 'blog', 'posts', 'fsd-optimus.html');
  const figure = '<figure class="post-figure sourced-photo">\n'
    + '  <img src="https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b4/StockholmOptimus01.jpg/1280px-StockholmOptimus01.jpg" alt="2024 年 5 月斯德哥尔摩展陈中的两台 Tesla Optimus 样机" width="1280" height="853" loading="lazy" decoding="async" referrerpolicy="no-referrer" />\n'
    + '  <figcaption>Tesla Optimus 2024 年实物陈列照。摄影：Ulf Klingström（Ulkl），Wikimedia Commons 公有领域；不代表机器人操作能力。 <a href="https://commons.wikimedia.org/wiki/File:StockholmOptimus01.jpg" target="_blank" rel="noopener noreferrer">查看原图与授权</a></figcaption>\n'
    + '</figure>';
  let html = fs.readFileSync(postPath, 'utf8');
  html = html.replace('<div class="post-body">', '<div class="post-body">' + figure);
  fs.writeFileSync(postPath, html, 'utf8');
  await assert.doesNotReject(() => validateBlogImages({ rootDir }));
  html = html.replace('width="1280" height="853"', 'width="1280" height="720"');
  fs.writeFileSync(postPath, html, 'utf8');
  await assert.rejects(() => validateBlogImages({ rootDir }), /sourced-photo/i);
});
