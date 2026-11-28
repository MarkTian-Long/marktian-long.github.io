'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { parseSourceMarkdown } = require('./markdown-source.js');
const siteConfig = require('../../scripts/site-config.js');

const SAFE_SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const FULL_SHA = /^[a-f0-9]{40}$/i;

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function buildPreviewRedirect({ slug, title, siteUrl = siteConfig.siteUrl }) {
  if (!SAFE_SLUG.test(slug)) throw new Error('Invalid article slug: ' + slug);
  const target = '../posts/' + slug + '.html';
  const canonical = siteUrl.replace(/\/$/, '') + siteConfig.blog.path + 'posts/' + slug + '.html';
  return [
    '<!DOCTYPE html>',
    '<html lang="zh-CN">',
    '<head>',
    '<meta charset="UTF-8">',
    '<meta name="viewport" content="width=device-width,initial-scale=1">',
    '<meta name="robots" content="noindex,follow">',
    '<meta http-equiv="refresh" content="0;url=' + target + '">',
    '<link rel="canonical" href="' + escapeHtml(canonical) + '">',
    '<title>文章已正式发布 — Leo 的思考碎片</title>',
    '</head>',
    '<body>',
    '<p>文章已正式发布：<a href="' + target + '">' + escapeHtml(title) + '</a></p>',
    '<script>location.replace(' + JSON.stringify(target) + '+location.hash);</script>',
    '</body>',
    '</html>',
    '',
  ].join('\n');
}

function parseArgs(argv) {
  const values = new Map();
  let prepare = false;
  let dryRun = false;
  for (let index = 0; index < argv.length; index += 1) {
    const flag = argv[index];
    if (flag === '--prepare') {
      if (prepare) throw new Error('Duplicate argument: --prepare');
      prepare = true;
      continue;
    }
    if (flag === '--dry-run') {
      if (dryRun) throw new Error('Duplicate argument: --dry-run');
      dryRun = true;
      continue;
    }
    if (!['--slug', '--approved-ref', '--date'].includes(flag)) {
      throw new Error('Unknown argument: ' + flag);
    }
    const value = argv[index + 1];
    if (!value || value.startsWith('--')) throw new Error('Argument ' + flag + ' requires a value');
    if (values.has(flag)) throw new Error('Duplicate argument: ' + flag);
    values.set(flag, value);
    index += 1;
  }

  const slug = values.get('--slug');
  const approvedRef = values.get('--approved-ref');
  const date = values.get('--date');
  if (!prepare) throw new Error('Formal release preparation requires the explicit --prepare flag');
  if (!slug || !SAFE_SLUG.test(slug)) throw new Error('--slug must be lowercase kebab-case');
  if (!approvedRef || !FULL_SHA.test(approvedRef)) throw new Error('--approved-ref must be a complete 40-character commit SHA');
  if (date !== undefined && !/^\d{4}\.\d{2}$/.test(date)) throw new Error('--date must use YYYY.MM');
  return { slug, approvedRef: approvedRef.toLowerCase(), date, dryRun };
}

function runGit(args, rootDir) {
  const result = spawnSync('git', args, {
    cwd: rootDir,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error('git ' + args.join(' ') + ' failed: ' + String(result.stderr || '').trim());
  }
  return result.stdout;
}

function runNode(rootDir, args, label) {
  console.log('\n== ' + label + ' ==');
  const result = spawnSync(process.execPath, args, { cwd: rootDir, stdio: 'inherit' });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(label + ' failed with exit code ' + result.status);
}

function assertCleanWorktree(rootDir) {
  const status = runGit(['status', '--porcelain', '--untracked-files=normal'], rootDir).trim();
  if (status) {
    throw new Error('Release preparation requires a clean worktree. Existing changes were left untouched:\n' + status);
  }
}

function assertApprovedDraft({ rootDir, slug, approvedRef }) {
  if (!FULL_SHA.test(approvedRef)) throw new Error('A complete approved commit SHA is required');
  runGit(['cat-file', '-e', approvedRef + '^{commit}'], rootDir);
  const ancestor = spawnSync('git', ['merge-base', '--is-ancestor', approvedRef, 'HEAD'], {
    cwd: rootDir,
    stdio: 'ignore',
  });
  if (ancestor.error) throw ancestor.error;
  if (ancestor.status !== 0) throw new Error('Approved commit must be an ancestor of the current HEAD');

  const draftRelative = 'drafts/blog/' + slug + '.md';
  const docRelative = 'docs/blog/' + slug + '.md';
  const htmlRelative = 'tools/blog/posts/' + slug + '.html';
  const previewRelative = 'tools/blog/previews/' + slug + '.html';
  const draftPath = path.join(rootDir, ...draftRelative.split('/'));
  const docPath = path.join(rootDir, ...docRelative.split('/'));
  const htmlPath = path.join(rootDir, ...htmlRelative.split('/'));
  const previewPath = path.join(rootDir, ...previewRelative.split('/'));
  if (!fs.existsSync(draftPath) || !fs.statSync(draftPath).isFile()) {
    throw new Error('Missing unique current draft: ' + draftRelative);
  }
  if (fs.existsSync(docPath)) throw new Error('Formal Markdown already exists; refusing to create a second source: ' + docRelative);
  if (fs.existsSync(htmlPath)) throw new Error('Formal HTML already exists; inspect current publication state before continuing: ' + htmlRelative);

  const approvedSource = runGit(['show', approvedRef + ':' + draftRelative], rootDir);
  const currentSource = fs.readFileSync(draftPath, 'utf8');
  if (approvedSource !== currentSource) {
    throw new Error('Current draft differs from the author-approved commit. Reconfirm the changed source before publishing.');
  }
  const parsed = parseSourceMarkdown(currentSource, draftRelative);
  if (!parsed.frontmatter) throw new Error('Formal publication requires strict frontmatter: ' + draftRelative);

  const metadataPath = path.join(rootDir, 'tools/blog/data/posts-meta.json');
  const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
  if (metadata.posts.some(post => post.slug === slug)) {
    throw new Error('Article already exists in formal metadata: ' + slug);
  }
  return {
    draftRelative,
    docRelative,
    htmlRelative,
    previewRelative,
    draftPath,
    docPath,
    htmlPath,
    previewPath,
    title: parsed.sourceTitle,
    hasPreview: fs.existsSync(previewPath),
  };
}

function ensureEmptyBuildOutput(rootDir, slug) {
  const relative = 'build/public-dist-' + slug;
  const absolute = path.join(rootDir, ...relative.split('/'));
  if (fs.existsSync(absolute) && fs.readdirSync(absolute).length > 0) {
    throw new Error('Public build output already exists and is not empty: ' + relative);
  }
  return relative;
}

function prepareRelease(options, rootDir = path.resolve(__dirname, '../..')) {
  const plan = assertApprovedDraft({ rootDir, ...options });
  const buildOutput = ensureEmptyBuildOutput(rootDir, options.slug);
  const previewContent = buildPreviewRedirect({
    slug: options.slug,
    title: plan.title,
  });

  if (options.dryRun) {
    console.log(JSON.stringify({
      mode: 'dry-run',
      approvedRef: options.approvedRef,
      source: plan.draftRelative,
      destination: plan.docRelative,
      html: plan.htmlRelative,
      previewRedirect: plan.hasPreview ? plan.previewRelative : null,
      buildOutput,
      commitOrPush: false,
    }, null, 2));
    return { dryRun: true, plan };
  }

  const syncArgs = ['tools/blog/sync-post-metadata.js', '--write', plan.draftRelative];
  if (options.date) syncArgs.push('--date', options.date);
  runNode(rootDir, syncArgs, 'Sync formal metadata and register inline visuals');
  runNode(rootDir, [
    'tools/blog/generate-post.js',
    '--write',
    plan.draftRelative,
    plan.htmlRelative,
  ], 'Generate formal article HTML');
  runNode(rootDir, ['scripts/generate-search-assets.js', '--write'], 'Refresh SEO, RSS and sitemap');

  if (plan.hasPreview) {
    fs.writeFileSync(plan.previewPath, previewContent, 'utf8');
  }
  fs.renameSync(plan.draftPath, plan.docPath);

  runNode(rootDir, [
    'scripts/check-blog-release-equivalence.js',
    '--approved-ref',
    options.approvedRef,
    '--slug',
    options.slug,
  ], 'Verify approved source and image equivalence');
  runNode(rootDir, ['scripts/check-all.js'], 'Run full repository and blog checks');
  runNode(rootDir, ['scripts/check-blog-body-integrity.js'], 'Check published body integrity');
  runNode(rootDir, ['scripts/generate-search-assets.js', '--check'], 'Verify generated search assets');
  runNode(rootDir, ['scripts/build-public-dist.js', '--out', buildOutput], 'Build isolated public artifact');
  runNode(rootDir, ['scripts/check-public-dist.js', '--out', buildOutput], 'Smoke-check public artifact');

  const status = runGit(['status', '--short'], rootDir);
  console.log('\nRelease assets prepared. Review the following changes before committing:\n' + status);
  console.log('No git commit or push was performed. Local browser/visual review and the normal push authorization still apply.');
  return { dryRun: false, plan, buildOutput, status };
}

function main(argv = process.argv.slice(2)) {
  const options = parseArgs(argv);
  const rootDir = path.resolve(__dirname, '../..');
  assertCleanWorktree(rootDir);
  return prepareRelease(options, rootDir);
}

if (require.main === module) {
  try {
    main();
  } catch (error) {
    console.error(error.message);
    console.error('No commit or push was performed. Inspect git status before retrying.');
    process.exitCode = 1;
  }
}

module.exports = {
  assertApprovedDraft,
  buildPreviewRedirect,
  ensureEmptyBuildOutput,
  parseArgs,
  prepareRelease,
};
