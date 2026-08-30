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
    checked += 1;
  }
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

module.exports = { PROFILE_BY_EXTENSION, listAssetFiles, validateBlogImages, main };
