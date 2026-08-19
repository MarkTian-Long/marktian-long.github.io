const fs = require('node:fs');
const path = require('node:path');

const rootDir = path.resolve(__dirname, '..');

function validateFeaturedConfig(config, postSlugs) {
  const errors = [];
  if (!config || typeof config !== 'object' || Array.isArray(config)) {
    return ['Featured config must be a JSON object.'];
  }
  if (config.version !== 1) errors.push('Featured config version must be 1.');
  if (!Array.isArray(config.featured)) {
    errors.push('Featured config featured must be an array.');
    return errors;
  }
  if (config.featured.length > 3) errors.push('Featured config supports at most 3 slugs.');

  const seen = new Set();
  config.featured.forEach((slug, index) => {
    if (typeof slug !== 'string' || !slug.trim()) {
      errors.push(`Featured slug at index ${index} must be a non-empty string.`);
      return;
    }
    if (seen.has(slug)) errors.push(`Featured slug is duplicated: ${slug}`);
    seen.add(slug);
    if (!postSlugs.has(slug)) errors.push(`Featured slug does not exist in posts-meta.json: ${slug}`);
  });
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

  const postSlugs = new Set(Array.isArray(metadata.posts) ? metadata.posts.map((post) => post.slug) : []);
  const errors = validateFeaturedConfig(featured, postSlugs);
  if (errors.length) {
    errors.forEach((error) => console.error(`[ERROR] ${error}`));
    process.exitCode = 1;
    return;
  }
  console.log(`PASS featured posts: ${featured.featured.length} configured slug(s) validated.`);
}

if (require.main === module) main();

module.exports = { validateFeaturedConfig };
