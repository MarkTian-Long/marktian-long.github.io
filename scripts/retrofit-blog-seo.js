const fs = require('fs');
const path = require('path');

const siteConfig = require('./site-config');
const { validatePosts } = require('./generate-search-assets');
const { ensureArticleSeo, extractBody } = require('./search-foundation');

function normalizeRelPath(value) {
  return String(value || '').replace(/\\/g, '/').replace(/^\.\//, '');
}

function parseArgs(argv) {
  const args = {
    write: false,
    check: false,
    excludes: []
  };

  for (let index = 0; index < argv.length; index++) {
    const arg = argv[index];
    if (arg === '--write') {
      args.write = true;
      continue;
    }
    if (arg === '--check') {
      args.check = true;
      continue;
    }
    if (arg === '--exclude') {
      const value = argv[index + 1];
      if (!value || value.startsWith('--')) {
        throw new Error('--exclude requires a non-option path');
      }
      args.excludes.push(normalizeRelPath(value));
      index++;
      continue;
    }
    throw new Error(`Unknown option: ${arg}`);
  }

  if (args.write && args.check) {
    throw new Error('Use either --write or --check, not both');
  }

  return args;
}

function loadPosts(rootDir) {
  const metadataPath = path.join(rootDir, 'tools/blog/data/posts-meta.json');
  const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
  if (!Array.isArray(metadata.posts)) {
    throw new Error('posts-meta.json must contain posts array');
  }
  validatePosts(metadata.posts);
  return metadata.posts;
}

function hasSearchBlock(html) {
  return /<!-- search-foundation:start -->[\s\S]*?<!-- search-foundation:end -->/.test(html);
}

function articleFileForPost(rootDir, post) {
  const relPath = normalizeRelPath(path.posix.join('tools/blog', post.url));
  const postsRoot = path.resolve(rootDir, 'tools/blog/posts');
  const absPath = path.resolve(rootDir, relPath);
  const relativeToPosts = path.relative(postsRoot, absPath);
  if (relativeToPosts.startsWith('..') || path.isAbsolute(relativeToPosts)) {
    throw new Error(`Article path escapes tools/blog/posts: ${post.url}`);
  }
  return {
    relPath,
    absPath
  };
}

function retrofitBlogSeo({ argv = process.argv.slice(2), rootDir = path.resolve(__dirname, '..'), siteConfig: config = siteConfig } = {}) {
  const messages = [];
  const errors = [];
  const changed = [];
  const skipped = [];
  let args;
  let posts;

  try {
    args = parseArgs(argv);
    posts = loadPosts(rootDir);
  } catch (error) {
    return { code: 1, messages, errors: [error.message], changed, skipped };
  }

  for (const post of posts) {
    let articleFile;
    try {
      articleFile = articleFileForPost(rootDir, post);
    } catch (error) {
      errors.push(error.message);
      continue;
    }
    const { relPath, absPath } = articleFile;
    if (args.excludes.includes(relPath)) {
      skipped.push(relPath);
      messages.push(`SKIP ${relPath}`);
      continue;
    }

    if (!fs.existsSync(absPath)) {
      errors.push(`Missing article file: ${relPath}`);
      continue;
    }

    try {
      const before = fs.readFileSync(absPath, 'utf8');
      const beforeBody = extractBody(before);
      const after = ensureArticleSeo(before, post, config);
      if (extractBody(after) !== beforeBody) {
        throw new Error('Article SEO update changed <body>');
      }

      if (after !== before) {
        changed.push(relPath);
        messages.push(`${hasSearchBlock(before) ? 'STALE' : 'MISSING'} ${relPath}`);
        if (args.write) {
          fs.writeFileSync(absPath, after, 'utf8');
          messages.push(`WROTE ${relPath}`);
        }
      }
    } catch (error) {
      errors.push(`${relPath}: ${error.message}`);
    }
  }

  if (errors.length) {
    return { code: 1, messages, errors, changed, skipped };
  }

  if (args.check && changed.length) {
    return { code: 1, messages, errors, changed, skipped };
  }

  if (!args.write && !args.check) {
    messages.push(`WOULD UPDATE ${changed.length} blog article${changed.length === 1 ? '' : 's'}`);
  } else if (args.write) {
    messages.push(`UPDATED ${changed.length} blog article${changed.length === 1 ? '' : 's'}`);
  } else {
    messages.push(`PASS blog article SEO: ${posts.length - skipped.length}/${posts.length}`);
  }

  return { code: 0, messages, errors, changed, skipped };
}

function main() {
  const result = retrofitBlogSeo();
  for (const message of result.messages) {
    console.log(message);
  }
  for (const error of result.errors) {
    console.error(error);
  }
  return result.code;
}

if (require.main === module) {
  process.exitCode = main();
}

module.exports = {
  retrofitBlogSeo,
  parseArgs
};
