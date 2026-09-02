'use strict';

const IMAGE_CONTRACT_VERSION = 1;
const COVER_WIDTH = 1200;
const COVER_HEIGHT = 630;
const INLINE_WIDTH = 1280;
const INLINE_HEIGHT = 720;
const MAX_INLINE_IMAGES = 2;
const MAX_TEXT_LENGTH = 160;
const SAFE_SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const GENERIC_INLINE_NAMES = /^(?:asset|cover|figure|final|image|illustration|img|inline|new|photo)(?:-\d+)?$/;

function isPlainObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function assertPlainObject(value, label) {
  if (!isPlainObject(value)) throw new Error(`${label} must be an object`);
}

function assertExactKeys(value, keys, label) {
  const expected = [...keys].sort();
  const actual = Object.keys(value).sort();
  if (actual.length !== expected.length || actual.some((key, index) => key !== expected[index])) {
    throw new Error(`${label} must contain exactly: ${expected.join(', ')}`);
  }
}

function assertVisualKeys(value, label) {
  const keys = Object.keys(value);
  if (!keys.includes('inline') || keys.some(key => key !== 'cover' && key !== 'inline')) {
    throw new Error(`${label} must contain inline and may optionally contain cover`);
  }
}

function assertText(value, label) {
  if (typeof value !== 'string' || !value.trim() || value !== value.trim() || value.length > MAX_TEXT_LENGTH) {
    throw new Error(`${label} must be trimmed text between 1 and ${MAX_TEXT_LENGTH} characters`);
  }
}

function assertMarkdownImageText(value, label, unsupportedPattern) {
  if (unsupportedPattern.test(value)) {
    throw new Error(`${label} contains characters unsupported by the standalone Markdown image syntax`);
  }
}

function registerPath(paths, imagePath) {
  if (paths.has(imagePath)) throw new Error(`Duplicate blog image path: ${imagePath}`);
  paths.add(imagePath);
}

function validateCover(post, paths) {
  const label = `Post ${post.slug} cover`;
  assertPlainObject(post.visuals.cover, label);
  assertExactKeys(post.visuals.cover, ['src', 'alt', 'width', 'height'], label);
  const cover = post.visuals.cover;
  const expectedPath = `assets/images/blog/${post.slug}/cover.jpg`;
  if (cover.src !== expectedPath) {
    throw new Error(`${label} path must be ${expectedPath}`);
  }
  if (cover.width !== COVER_WIDTH || cover.height !== COVER_HEIGHT) {
    throw new Error(`${label} dimensions must be ${COVER_WIDTH} x ${COVER_HEIGHT}`);
  }
  assertText(cover.alt, `${label} alt`);
  registerPath(paths, cover.src);
}

function validateInlineImage(post, image, paths) {
  const label = `Post ${post.slug} inline image`;
  assertPlainObject(image, label);
  assertExactKeys(image, ['src', 'alt', 'caption', 'width', 'height'], label);
  const escapedSlug = post.slug.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = new RegExp(`^assets/images/blog/${escapedSlug}/([a-z0-9]+(?:-[a-z0-9]+)*)\\.webp$`).exec(image.src);
  if (!match) {
    throw new Error(`${label} path must stay under assets/images/blog/${post.slug}/ and use a kebab-case .webp filename`);
  }
  if (GENERIC_INLINE_NAMES.test(match[1])) {
    throw new Error(`Post ${post.slug} inline image needs a descriptive filename: ${match[1]}`);
  }
  if (image.width !== INLINE_WIDTH || image.height !== INLINE_HEIGHT) {
    throw new Error(`${label} dimensions must be ${INLINE_WIDTH} x ${INLINE_HEIGHT}`);
  }
  assertText(image.alt, `${label} alt`);
  assertText(image.caption, `${label} caption`);
  assertMarkdownImageText(image.alt, `${label} alt`, /[\]\r\n]/);
  assertMarkdownImageText(image.caption, `${label} caption`, /["\r\n]/);
  registerPath(paths, image.src);
}

function validateImageContract(metadata) {
  assertPlainObject(metadata, 'Blog metadata');
  assertPlainObject(metadata.image_contract, 'image_contract');
  if (metadata.image_contract.version !== IMAGE_CONTRACT_VERSION) {
    throw new Error(`image_contract version must be ${IMAGE_CONTRACT_VERSION}`);
  }
  const exemptions = metadata.image_contract.legacy_without_visuals;
  if (!Array.isArray(exemptions)) {
    throw new Error('image_contract legacy_without_visuals must be an array');
  }
  const exemptionSet = new Set();
  for (const slug of exemptions) {
    if (typeof slug !== 'string' || !slug.trim() || slug !== slug.trim()) {
      throw new Error('Trimmed legacy exemption slugs must be non-empty strings');
    }
    if (exemptionSet.has(slug)) throw new Error(`Duplicate legacy exemption: ${slug}`);
    exemptionSet.add(slug);
  }

  if (!Array.isArray(metadata.posts)) throw new Error('Blog metadata posts must be an array');
  const postSlugs = new Set();
  for (const post of metadata.posts) {
    assertPlainObject(post, 'Blog post');
    if (typeof post.slug !== 'string' || !SAFE_SLUG.test(post.slug)) {
      throw new Error('Blog post slug must be lowercase kebab-case');
    }
    if (postSlugs.has(post.slug)) throw new Error(`Duplicate blog post slug: ${post.slug}`);
    postSlugs.add(post.slug);
  }
  for (const slug of exemptionSet) {
    if (!postSlugs.has(slug)) throw new Error(`Unknown legacy exemption: ${slug}`);
  }

  const paths = new Set();
  for (const post of metadata.posts) {
    const exempt = exemptionSet.has(post.slug);
    if (post.visuals === undefined) {
      continue;
    }
    if (exempt) throw new Error(`Post ${post.slug} is still legacy-exempt but already has visuals`);
    assertPlainObject(post.visuals, `Post ${post.slug} visuals`);
    assertVisualKeys(post.visuals, `Post ${post.slug} visuals`);
    if (!Array.isArray(post.visuals.inline)) {
      throw new Error(`Post ${post.slug} inline images must be an array`);
    }
    if (post.visuals.inline.length > MAX_INLINE_IMAGES) {
      throw new Error(`Post ${post.slug} must have 0 to ${MAX_INLINE_IMAGES} inline images`);
    }
    if (post.visuals.cover !== undefined) validateCover(post, paths);
    for (const image of post.visuals.inline) validateInlineImage(post, image, paths);
  }
  return true;
}

function collectPostImagePaths(posts) {
  const paths = new Set();
  for (const post of posts || []) {
    if (!post || !post.visuals) continue;
    if (post.visuals.cover && post.visuals.cover.src) paths.add(post.visuals.cover.src);
    for (const image of post.visuals.inline || []) {
      if (image && image.src) paths.add(image.src);
    }
  }
  return [...paths].sort();
}

function resolvePostCover(post, config) {
  if (post && post.visuals && post.visuals.cover) return post.visuals.cover;
  if (!config || !config.blog) throw new Error('Blog image fallback configuration is required');
  return {
    src: String(config.blog.imagePath || '').replace(/^\/+/, ''),
    alt: config.blog.imageAlt,
    width: config.blog.imageWidth,
    height: config.blog.imageHeight,
  };
}

module.exports = {
  IMAGE_CONTRACT_VERSION,
  COVER_WIDTH,
  COVER_HEIGHT,
  INLINE_WIDTH,
  INLINE_HEIGHT,
  MAX_INLINE_IMAGES,
  validateImageContract,
  collectPostImagePaths,
  resolvePostCover,
};
