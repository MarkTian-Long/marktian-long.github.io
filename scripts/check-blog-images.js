'use strict';

const fs = require('node:fs');
const path = require('node:path');
const sharp = require('sharp');
const { PUBLIC_FILES } = require('./public-dist-manifest');

const {
  validateImageContract,
  collectPostImagePaths,
  INLINE_TALL_SVG_HEIGHT,
} = require('./blog-image-contract');

const PROFILE_BY_EXTENSION = Object.freeze({
  '.jpg': Object.freeze({ width: 1200, height: 630, format: 'jpeg', maxBytes: 350 * 1024, label: '350 KB' }),
  '.webp': Object.freeze({ width: 1280, height: 720, format: 'webp', maxBytes: 250 * 1024, label: '250 KB' }),
  '.svg': Object.freeze({ width: 1280, height: 720, extraHeights: Object.freeze([INLINE_TALL_SVG_HEIGHT]), format: 'svg', maxBytes: 250 * 1024, label: '250 KB' }),
});

const SOURCED_PHOTO_ALLOWLIST = Object.freeze({
  'fsd-optimus': Object.freeze({
    src: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b4/StockholmOptimus01.jpg/1280px-StockholmOptimus01.jpg',
    alt: '2024 年 5 月斯德哥尔摩展陈中的两台 Tesla Optimus 样机',
    width: 1280,
    height: 853,
    caption: 'Tesla Optimus 2024 年实物陈列照。摄影：Ulf Klingström（Ulkl），Wikimedia Commons 公有领域；不代表机器人操作能力。',
    sourcePage: 'https://commons.wikimedia.org/wiki/File:StockholmOptimus01.jpg',
  }),
});
// Published SVG diagrams are static and self-contained, including when opened directly.
function validateStaticSvg(source, imagePath) {
  if (!/^\s*<svg\b/i.test(source) || !/<\/svg>\s*$/i.test(source)
    || /<!DOCTYPE|<!ENTITY|<\?(?:xml-stylesheet)/i.test(source)
    || /<(?:script|foreignObject|iframe|image|use|a|animate\w*|set)\b/i.test(source)
    || /\son[a-z]+\s*=/i.test(source) || /\b(?:href|src)\s*=/i.test(source)
    || /@import|@font-face|javascript:|data:|expression\s*\(/i.test(source)
    || /url\(\s*["']?(?!#)/i.test(source)) {
    throw new Error(`SVG must be a static, self-contained diagram: ${imagePath}`);
  }
}

function posixPath(value) {
  return value.split(path.sep).join('/');
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function occurrenceCount(value, needle) {
  return String(value).split(needle).length - 1;
}

function validateSourcedPhotos(html, post) {
  const marker = '<figure class="post-figure sourced-photo">';
  const expected = SOURCED_PHOTO_ALLOWLIST[post.slug] ? [SOURCED_PHOTO_ALLOWLIST[post.slug]] : [];
  let cursor = 0;
  let count = 0;
  while (true) {
    const start = html.indexOf(marker, cursor);
    if (start === -1) break;
    const close = html.indexOf('</figure>', start);
    if (close === -1) throw new Error(`Post ${post.slug} has an unclosed sourced-photo figure`);
    const figure = html.slice(start, close + '</figure>'.length);
    const spec = expected[count];
    if (!spec) throw new Error(`Post ${post.slug} contains a sourced-photo outside the allowlist`);
    const expectedFigure = marker + '\n'
      + `  <img src="${spec.src}" alt="${escapeHtml(spec.alt)}" width="${spec.width}" height="${spec.height}" loading="lazy" decoding="async" referrerpolicy="no-referrer" />\n`
      + `  <figcaption>${escapeHtml(spec.caption)} <a href="${spec.sourcePage}" target="_blank" rel="noopener noreferrer">查看原图与授权</a></figcaption>\n`
      + '</figure>';
    if (figure !== expectedFigure) {
      throw new Error(`Post ${post.slug} sourced-photo must match the registered source, dimensions, attribution and fallback link`);
    }
    count += 1;
    cursor = close + '</figure>'.length;
  }
  if (count !== expected.length) {
    throw new Error(`Post ${post.slug} sourced-photo count must match the allowlist (${expected.length})`);
  }
}
function validateRenderedPostImages(rootDir, metadata) {
  for (const post of metadata.posts) {
    const postPath = path.join(rootDir, 'tools', 'blog', 'posts', `${post.slug}.html`);
    if (!fs.existsSync(postPath) || !fs.statSync(postPath).isFile()) {
      throw new Error(`Missing rendered blog article: tools/blog/posts/${post.slug}.html`);
    }
    const html = fs.readFileSync(postPath, 'utf8').replace(/\r\n?/g, '\n');
    validateSourcedPhotos(html, post);
    const coverMarker = '<figure class="post-cover">';
    const coverCount = occurrenceCount(html, coverMarker);
    if (!post.visuals) {
      if (coverCount !== 0) throw new Error(`Post ${post.slug} without visuals must not render a post-cover`);
      continue;
    }

    const cover = post.visuals.cover;
    if (!cover) {
      if (coverCount !== 0) throw new Error(`Post ${post.slug} without a cover must not render a post-cover`);
    } else {
      if (coverCount !== 1) {
        throw new Error(`Post ${post.slug} must contain exactly one rendered post-cover`);
      }
      const coverStart = html.indexOf(coverMarker);
      const headerStart = html.indexOf('<header class="post-header"');
      const headerEnd = html.indexOf('</header>', headerStart);
      const dividerStart = html.indexOf('<hr class="divider"', headerEnd);
      if (headerStart === -1 || headerEnd === -1 || dividerStart === -1
        || !(headerEnd < coverStart && coverStart < dividerStart)) {
        throw new Error(`Post ${post.slug} rendered post-cover must sit between the article header and divider`);
      }
      const expectedCoverImage = `<img src="../../../${cover.src}" alt="${escapeHtml(cover.alt)}" width="${cover.width}" height="${cover.height}" loading="eager" decoding="async" fetchpriority="high" />`;
      if (!html.includes(expectedCoverImage)) {
        throw new Error(`Post ${post.slug} rendered post-cover must match metadata`);
      }
    }

    const inlineMarker = '<figure class="post-figure">';
    if (occurrenceCount(html, inlineMarker) !== post.visuals.inline.length) {
      throw new Error(`Post ${post.slug} rendered post-figure count must match metadata`);
    }
    for (const image of post.visuals.inline) {
      const expectedFigure = '<figure class="post-figure">\n'
        + `  <img src="../../../${image.src}" alt="${escapeHtml(image.alt)}" width="${image.width}" height="${image.height}" loading="lazy" decoding="async" />\n`
        + `  <figcaption>${escapeHtml(image.caption)}</figcaption>\n`
        + '</figure>';
      if (!html.includes(expectedFigure)) {
        throw new Error(`Post ${post.slug} is missing the rendered post-figure for ${image.src}`);
      }
    }
  }
}

function listAssetFiles(rootDir) {
  const assetRoot = path.join(rootDir, 'assets', 'images', 'blog');
  if (!fs.existsSync(assetRoot)) return [];
  const files = [];
  function walk(directory) {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const absolute = path.join(directory, entry.name);
      if (entry.isSymbolicLink()) {
        throw new Error(`Blog image symlinks are not allowed: ${posixPath(path.relative(rootDir, absolute))}`);
      }
      if (entry.isDirectory()) walk(absolute);
      else if (entry.isFile()) files.push(posixPath(path.relative(rootDir, absolute)));
    }
  }
  walk(assetRoot);
  return files.sort();
}


/**
 * Draft-only assets are declared jointly by the current Markdown source and a
 * noindex preview included in the public whitelist, not by published posts-meta.
 */
function collectDraftPreviewImagePaths(rootDir, previewPaths = PUBLIC_FILES.filter(
  file => /^tools\/blog\/previews\/[a-z0-9-]+\.html$/.test(file),
)) {
  const images = new Set();
  for (const previewPath of previewPaths) {
    const previewMatch = /^tools\/blog\/previews\/([a-z0-9-]+)\.html$/.exec(previewPath);
    if (!previewMatch) throw new Error('Invalid blog preview path: ' + previewPath);
    const slug = previewMatch[1];
    const draftPath = path.join(rootDir, 'drafts', 'blog', slug + '.md');
    if (!fs.existsSync(draftPath)) continue; // Published previews are redirects.
    const htmlPath = path.join(rootDir, ...previewPath.split('/'));
    if (!fs.existsSync(htmlPath)) throw new Error('Missing blog preview HTML: ' + previewPath);
    const html = fs.readFileSync(htmlPath, 'utf8').replace(/\r\n?/g, '\n');
    if (!/<meta name="robots" content="noindex[^"]*"[^>]*>/.test(html)) {
      throw new Error('Draft preview must be noindex: ' + previewPath);
    }
    const markdown = fs.readFileSync(draftPath, 'utf8').replace(/\r\n?/g, '\n');
    const imagePattern = /^!\[([^\]\r\n]+)\]\(\.\.\/\.\.\/(assets\/images\/blog\/([a-z0-9-]+)\/[a-z0-9-]+\.(?:svg|webp)) "([^"\r\n]+)"\)$/gm;
    const matches = [...markdown.matchAll(imagePattern)];
    if (occurrenceCount(html, '<figure class="post-figure">') !== matches.length) {
      throw new Error('Draft preview figure count must match Markdown: ' + previewPath);
    }
    const currentImages = new Set();
    for (const match of matches) {
      const [, alt, imagePath, imageSlug, caption] = match;
      if (imageSlug !== slug || !alt.trim() || !caption.trim() || alt.length > 160 || caption.length > 160) {
        throw new Error('Invalid or cross-article draft preview image: ' + imagePath);
      }
      const heights = imagePath.endsWith('.svg') ? [720, INLINE_TALL_SVG_HEIGHT] : [720];
      const hasFigure = heights.some(height => {
        const expected = '<figure class="post-figure">\n'
          + '  <img src="../../../' + imagePath + '" alt="' + escapeHtml(alt)
          + '" width="1280" height="' + height + '" loading="lazy" decoding="async" />\n'
          + '  <figcaption>' + escapeHtml(caption) + '</figcaption>\n'
          + '</figure>';
        return html.includes(expected);
      });
      if (!hasFigure) throw new Error('Draft preview image does not match Markdown: ' + imagePath);
      currentImages.add(imagePath);
      images.add(imagePath);
    }
    for (const ref of html.matchAll(/src="\.\.\/\.\.\/\.\.\/(assets\/images\/blog\/[^"]+)"/g)) {
      if (!currentImages.has(ref[1])) throw new Error('Unregistered preview image: ' + ref[1]);
    }
  }
  return [...images].sort();
}

async function validateBlogImages({ rootDir = path.resolve(__dirname, '..'), previewPaths } = {}) {
  const metadataPath = path.join(rootDir, 'tools', 'blog', 'data', 'posts-meta.json');
  if (!fs.existsSync(metadataPath)) throw new Error(`Missing blog metadata: ${metadataPath}`);
  const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
  validateImageContract(metadata);

  const declared = [...new Set([
    ...collectPostImagePaths(metadata.posts),
    ...collectDraftPreviewImagePaths(rootDir, previewPaths),
  ])].sort();
  const actual = listAssetFiles(rootDir);
  const declaredSet = new Set(declared);
  const actualSet = new Set(actual);
  for (const imagePath of declared) {
    if (!actualSet.has(imagePath)) throw new Error(`Missing declared blog image: ${imagePath}`);
  }
  for (const imagePath of actual) {
    if (!declaredSet.has(imagePath)) throw new Error(`Orphan blog image: ${imagePath}`);
  }

  let checked = 0;
  for (const imagePath of declared) {
    const extension = path.extname(imagePath).toLowerCase();
    const profile = PROFILE_BY_EXTENSION[extension];
    if (!profile) throw new Error(`Unexpected blog image extension: ${imagePath}`);
    const absolutePath = path.join(rootDir, ...imagePath.split('/'));
    const fileStat = fs.lstatSync(absolutePath);
    if (fileStat.isSymbolicLink()) throw new Error(`Blog image symlinks are not allowed: ${imagePath}`);
    if (fileStat.size > profile.maxBytes) {
      throw new Error(`Blog image must be at most ${profile.label}: ${imagePath} (${fileStat.size} bytes)`);
    }
    if (extension === '.svg') validateStaticSvg(fs.readFileSync(absolutePath, 'utf8'), imagePath);
    const image = await sharp(absolutePath).metadata();
    if (image.format !== profile.format) {
      throw new Error(`Blog image format must be ${profile.format}: ${imagePath} (found ${image.format})`);
    }
    const allowedHeights = [profile.height, ...(profile.extraHeights || [])];
    if (image.width !== profile.width || !allowedHeights.includes(image.height)) {
      throw new Error(`Blog image dimensions must be ${profile.width} x ${allowedHeights.join(' or ')}: ${imagePath}`);
    }
    try {
      await sharp(absolutePath, { failOn: 'warning' }).stats();
    } catch (error) {
      throw new Error(`Blog image failed full decode: ${imagePath} (${error.message})`);
    }
    checked += 1;
  }
  validateRenderedPostImages(rootDir, metadata);
  return { declared: declared.length, checked };
}

async function main() {
  const result = await validateBlogImages();
  console.log(`PASS blog image assets: ${result.checked}/${result.declared}`);
  return result;
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}

module.exports = { PROFILE_BY_EXTENSION, listAssetFiles, collectDraftPreviewImagePaths, validateBlogImages, validateRenderedPostImages, validateStaticSvg, main };
