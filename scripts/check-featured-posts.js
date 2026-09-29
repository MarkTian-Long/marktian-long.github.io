const fs = require('node:fs');
const path = require('node:path');

const rootDir = path.resolve(__dirname, '..');
const FEATURED_CATEGORIES = ['技术', '产品', '商业', '行业', '实践'];

function validateFeaturedConfig(config, posts) {
  const errors = [];
  if (!config || typeof config !== 'object' || Array.isArray(config)) {
    return ['Featured config must be a JSON object.'];
  }
  if (config.version !== 1) errors.push('Featured config version must be 1.');
  if (!Array.isArray(config.featured)) {
    errors.push('Featured config featured must be an array.');
    return errors;
  }
  if (config.featured.length !== FEATURED_CATEGORIES.length) {
    errors.push(`Featured config must contain exactly ${FEATURED_CATEGORIES.length} slugs, one per active category.`);
  }

  const postBySlug = new Map((Array.isArray(posts) ? posts : []).map((post) => [post.slug, post]));
  const seenSlugs = new Set();
  const seenCategories = new Set();

  config.featured.forEach((slug, index) => {
    if (typeof slug !== 'string' || !slug.trim()) {
      errors.push(`Featured slug at index ${index} must be a non-empty string.`);
      return;
    }
    if (seenSlugs.has(slug)) errors.push(`Featured slug is duplicated: ${slug}`);
    seenSlugs.add(slug);

    const post = postBySlug.get(slug);
    if (!post) {
      errors.push(`Featured slug does not exist in posts-meta.json: ${slug}`);
      return;
    }
    if (!FEATURED_CATEGORIES.includes(post.category)) {
      errors.push(`Featured post uses unsupported category: ${slug} -> ${post.category}`);
      return;
    }
    if (seenCategories.has(post.category)) {
      errors.push(`Featured category is duplicated: ${post.category}`);
    }
    seenCategories.add(post.category);
  });

  for (const category of FEATURED_CATEGORIES) {
    if (!seenCategories.has(category)) errors.push(`Featured category is missing: ${category}`);
  }
  return errors;
}

function main() {
  const metadataPath = path.join(rootDir, 'tools', 'blog', 'data', 'posts-meta.json');
  const featuredPath = path.join(rootDir, 'tools', 'blog', 'data', 'featured-posts.json');
  let metadata;
  let featured;

  try {
    metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
  } catch (error) {
    console.error(`[ERROR] Cannot parse posts-meta.json: ${error.message}`);
    process.exitCode = 1;
    return;
  }
  try {
    featured = JSON.parse(fs.readFileSync(featuredPath, 'utf8'));
  } catch (error) {
    console.error(`[ERROR] Cannot parse featured-posts.json: ${error.message}`);
    process.exitCode = 1;
    return;
  }

  const errors = validateFeaturedConfig(featured, metadata.posts);
  if (errors.length) {
    errors.forEach((error) => console.error(`[ERROR] ${error}`));
    process.exitCode = 1;
    return;
  }
  console.log('PASS featured posts: 5 configured slugs cover 技术 / 产品 / 商业 / 行业 / 实践 exactly once.');
}

if (require.main === module) main();

module.exports = { FEATURED_CATEGORIES, validateFeaturedConfig };
