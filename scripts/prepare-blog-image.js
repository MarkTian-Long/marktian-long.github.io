'use strict';

const fs = require('node:fs');
const path = require('node:path');
const sharp = require('sharp');

const PROFILES = Object.freeze({
  cover: Object.freeze({
    width: 1200,
    height: 630,
    extension: '.jpg',
    format: 'jpeg',
    maxBytes: 350 * 1024,
    qualities: [82, 78, 74],
    encode: (image, quality) => image.jpeg({ quality, progressive: true, mozjpeg: true }),
  }),
  inline: Object.freeze({
    width: 1280,
    height: 720,
    extension: '.webp',
    format: 'webp',
    maxBytes: 250 * 1024,
    qualities: [82, 78, 74],
    encode: (image, quality) => image.webp({ quality, effort: 5 }),
  }),
});

const KEBAB_CASE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function assertSafeSegment(value, label) {
  if (typeof value !== 'string' || !KEBAB_CASE.test(value)) {
    throw new Error(`${label} must be lowercase kebab-case`);
  }
}

function resolveInside(rootDir, relativePath) {
  const absoluteRoot = path.resolve(rootDir);
  const absolutePath = path.resolve(absoluteRoot, relativePath);
  const relative = path.relative(absoluteRoot, absolutePath);
  if (!relative || relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error(`Blog image output must stay under the repository root: ${relativePath}`);
  }
  return absolutePath;
}

function orientedSize(metadata) {
  const swapsAxes = [5, 6, 7, 8].includes(metadata.orientation);
  return {
    width: swapsAxes ? metadata.height : metadata.width,
    height: swapsAxes ? metadata.width : metadata.height,
  };
}

async function prepareBlogImage({
  rootDir = path.resolve(__dirname, '..'),
  slug,
  role,
  name,
  inputPath,
}) {
  assertSafeSegment(slug, 'slug');
  if (!Object.hasOwn(PROFILES, role)) throw new Error(`role must be one of: ${Object.keys(PROFILES).join(', ')}`);
  if (role === 'inline') assertSafeSegment(name, 'inline name');
  if (role === 'cover' && name !== undefined) throw new Error('cover does not accept an inline name');
  if (typeof inputPath !== 'string' || !inputPath.trim()) throw new Error('input path is required');

  const profile = PROFILES[role];
  const resolvedInput = path.isAbsolute(inputPath)
    ? path.resolve(inputPath)
    : path.resolve(rootDir, inputPath);
  if (!fs.existsSync(resolvedInput) || !fs.statSync(resolvedInput).isFile()) {
    throw new Error(`Input image does not exist: ${inputPath}`);
  }

  const sourceMetadata = await sharp(resolvedInput).metadata();
  const sourceSize = orientedSize(sourceMetadata);
  if (!sourceSize.width || !sourceSize.height) throw new Error('Input image dimensions could not be read');
  if (sourceSize.width < profile.width || sourceSize.height < profile.height) {
    throw new Error(`Input image is smaller than ${profile.width} x ${profile.height}; upscaling is not allowed`);
  }

  const filename = role === 'cover' ? `cover${profile.extension}` : `${name}${profile.extension}`;
  const relativePath = path.posix.join('assets/images/blog', slug, filename);
  const outputPath = resolveInside(rootDir, relativePath);
  if (fs.existsSync(outputPath)) throw new Error(`Refusing to overwrite existing blog image: ${relativePath}`);

  const base = sharp(resolvedInput)
    .rotate()
    .resize(profile.width, profile.height, {
      fit: 'cover',
      position: 'centre',
      withoutEnlargement: true,
    });

  let selected = null;
  let lastBytes = 0;
  for (const quality of profile.qualities) {
    const buffer = await profile.encode(base.clone(), quality).toBuffer();
    lastBytes = buffer.length;
    if (buffer.length <= profile.maxBytes) {
      selected = { buffer, quality };
      break;
    }
  }
  if (!selected) {
    throw new Error(`Prepared ${role} remains over ${Math.round(profile.maxBytes / 1024)} KB at quality ${profile.qualities.at(-1)} (${lastBytes} bytes)`);
  }

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, selected.buffer, { flag: 'wx' });
  return {
    outputPath,
    relativePath,
    width: profile.width,
    height: profile.height,
    format: profile.format,
    bytes: selected.buffer.length,
    quality: selected.quality,
  };
}

function parseArgs(argv) {
  const allowed = new Set(['--slug', '--role', '--name', '--input']);
  const values = new Map();
  for (let index = 0; index < argv.length; index += 2) {
    const flag = argv[index];
    const value = argv[index + 1];
    if (!allowed.has(flag)) throw new Error(`Unknown argument: ${flag}`);
    if (value === undefined || value.startsWith('--')) throw new Error(`Argument ${flag} requires a value`);
    if (values.has(flag)) throw new Error(`Duplicate argument: ${flag}`);
    values.set(flag, value);
  }
  const result = {
    slug: values.get('--slug'),
    role: values.get('--role'),
    inputPath: values.get('--input'),
  };
  if (values.has('--name')) result.name = values.get('--name');
  return result;
}

async function main(argv = process.argv.slice(2)) {
  const result = await prepareBlogImage({
    rootDir: path.resolve(__dirname, '..'),
    ...parseArgs(argv),
  });
  console.log(`WROTE ${result.relativePath} ${result.width}x${result.height} ${result.format} ${result.bytes} bytes quality=${result.quality}`);
  return result;
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}

module.exports = { PROFILES, prepareBlogImage, parseArgs, main };
