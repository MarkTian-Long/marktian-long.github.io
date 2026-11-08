'use strict';

const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { execFileSync } = require('node:child_process');

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const IMAGE_LINE = /^!\[([^\]\r\n]+)\]\(([^\s()]+)\s+"([^"\r\n]+)"\)\s*$/gm;
const normalize = value => String(value).replace(/\r\n/g, '\n');
const digest = value => crypto.createHash('sha256').update(value).digest('hex');

function verifyPromotion(approved, published, options = {}) {
  const { slug, readApprovedImage, readPublishedImage } = options;
  if (!SLUG.test(slug || '')) throw new Error('Invalid slug');
  const source = normalize(approved);
  const target = normalize(published);
  const images = [];
  const expected = source.replace(IMAGE_LINE, (line, alt, imagePath) => {
    const prefix = `assets/${slug}/`;
    const filename = imagePath.startsWith(prefix) ? imagePath.slice(prefix.length) : '';
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*\.(?:svg|webp|jpg)$/.test(filename)) {
      throw new Error(`Unexpected approved image path: ${imagePath}`);
    }
    const publishedPath = `assets/images/blog/${slug}/${filename}`;
    images.push({ approvedPath: `drafts/blog/${imagePath}`, publishedPath });
    return line.replace(`](${imagePath}`, `](../../${publishedPath}`);
  });
  if (expected !== target) throw new Error('Approved content changed beyond image-path migration');
  if (images.length && (typeof readApprovedImage !== 'function' || typeof readPublishedImage !== 'function')) {
    throw new Error('Image readers are required');
  }
  const receipts = images.map(image => {
    const before = Buffer.from(readApprovedImage(image.approvedPath));
    const after = Buffer.from(readPublishedImage(image.publishedPath));
    if (!before.equals(after)) throw new Error(`Image bytes changed: ${image.publishedPath}`);
    return { ...image, sha256: digest(after) };
  });
  return {
    slug,
    images: receipts.length,
    approvedSourceSha256: digest(source),
    publishedSourceSha256: digest(target),
    assets: receipts,
  };
}

function parseArgs(argv) {
  if (argv.length !== 4 || argv[0] !== '--approved-ref' || argv[2] !== '--slug'
    || !/^[a-f0-9]{40}$/i.test(argv[1]) || !SLUG.test(argv[3])) {
    throw new Error('Usage: node scripts/check-blog-release-equivalence.js --approved-ref <40-character-commit-sha> --slug <slug>');
  }
  return { approvedRef: argv[1], slug: argv[3] };
}

function main(argv = process.argv.slice(2), rootDir = path.resolve(__dirname, '..')) {
  const { approvedRef, slug } = parseArgs(argv);
  const readGit = relativePath => execFileSync('git', ['show', `${approvedRef}:${relativePath}`], {
    cwd: rootDir, maxBuffer: 8 * 1024 * 1024,
  });
  const receipt = verifyPromotion(
    readGit(`drafts/blog/${slug}.md`).toString('utf8'),
    fs.readFileSync(path.join(rootDir, 'docs/blog', `${slug}.md`), 'utf8'),
    {
      slug,
      readApprovedImage: readGit,
      readPublishedImage: relativePath => fs.readFileSync(path.join(rootDir, relativePath)),
    },
  );
  console.log(`PASS approved-to-published equivalence: ${slug}; ${receipt.images} unchanged images; approved ref ${approvedRef}`);
  console.log(JSON.stringify(receipt, null, 2));
  return receipt;
}

if (require.main === module) {
  try { main(); } catch (error) { console.error(error.message); process.exitCode = 1; }
}

module.exports = { verifyPromotion, parseArgs, main };
