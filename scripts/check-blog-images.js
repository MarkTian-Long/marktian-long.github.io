'use strict';

const fs = require('node:fs');
const path = require('node:path');
const sharp = require('sharp');

const {
  validateImageContract,
  collectPostImagePaths,
} = require('./blog-image-contract');

const PROFILE_BY_EXTENSION = Object.freeze({
  '.jpg': Object.freeze({ width: 1200, height: 630, format: 'jpeg', maxBytes: 350 * 1024, label: '350 KB' }),
  '.webp': Object.freeze({ width: 1280, height: 720, format: 'webp', maxBytes: 250 * 1024, label: '250 KB' }),
});

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

function validateRenderedPostImages(rootDir, metadata) {
  for (const post of metadata.posts) {
    const postPath = path.join(rootDir, 'tools', 'blog', 'posts', `${post.slug}.html`);
    if (!fs.existsSync(postPath) || !fs.statSync(postPath).isFile()) {
      throw new Error(`Missing rendered blog article: tools/blog/posts/${post.slug}.html`);
    }
    const html = fs.readFileSync(postPath, 'utf8').replace(/\r\n?/g, '\n');
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

async function validateBlogImages({ rootDir = path.resolve(__dirname, '..') } = {}) {
  const metadataPath = path.join(rootDir, 'tools', 'blog', 'data', 'posts-meta.json');
  if (!fs.existsSync(metadataPath)) throw new Error(`Missing blog metadata: ${metadataPath}`);
  const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
  validateImageContract(metadata);

  const declared = collectPostImagePaths(metadata.posts);
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
    const image = await sharp(absolutePath).metadata();
    if (image.format !== profile.format) {
      throw new Error(`Blog image format must be ${profile.format}: ${imagePath} (found ${image.format})`);
    }
    if (image.width !== profile.width || image.height !== profile.height) {
      throw new Error(`Blog image dimensions must be ${profile.width} x ${profile.height}: ${imagePath}`);
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

module.exports = { PROFILE_BY_EXTENSION, listAssetFiles, validateBlogImages, validateRenderedPostImages, main };
