'use strict';

const childProcess = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const { validateBlogMetadata } = require('../../scripts/generate-search-assets.js');
const { checkBlogTaxonomy } = require('./check-blog-taxonomy.js');

const TAXONOMY_RELATIVE_PATH = 'tools/blog/data/blog-taxonomy.json';
const ENTITY_COLLECTIONS = [
  ['category', taxonomy => [...(taxonomy.categories?.active || []), ...(taxonomy.categories?.legacy || [])]],
  ['tag', taxonomy => taxonomy.tags || []],
  ['topic', taxonomy => taxonomy.topics || []],
];
const SEMANTIC_FIELDS = {
  category: ['core_question', 'definition', 'status', 'scope', 'renamed_to', 'merged_into'],
  tag: ['definition', 'distinguish_from', 'notes', 'status', 'scope', 'renamed_to', 'merged_into'],
  topic: ['definition', 'distinguish_from', 'notes', 'status', 'scope', 'renamed_to', 'merged_into'],
};

function changeKind(field, nextEntry) {
  if (field === 'status') return nextEntry.status === 'deprecated' ? 'deprecated' : 'status_changed';
  if (field === 'renamed_to') return 'renamed';
  if (field === 'merged_into') return 'merged';
  return `${field}_changed`;
}

function entriesByName(entries) {
  return new Map(entries.map(entry => [entry.name, entry]));
}

function diffTaxonomySemantics(before, after) {
  const changes = [];
  for (const [entity, entries] of ENTITY_COLLECTIONS) {
    const previous = entriesByName(entries(before));
    const current = entriesByName(entries(after));
    const names = [...new Set([...previous.keys(), ...current.keys()])].sort();
    for (const name of names) {
      const oldEntry = previous.get(name);
      const newEntry = current.get(name);
      if (!oldEntry) {
        changes.push({ kind: 'added', entity, name });
        if (newEntry.status === 'deprecated') changes.push({ kind: 'deprecated', entity, name });
        continue;
      }
      if (!newEntry) {
        changes.push({ kind: 'removed', entity, name });
        continue;
      }
      for (const field of SEMANTIC_FIELDS[entity]) {
        if (oldEntry[field] !== newEntry[field]) {
          changes.push({ kind: changeKind(field, newEntry), entity, name });
        }
      }
    }
  }
  return changes;
}

function textMatchesChange(post, change) {
  const fields = [
    ['title', post.title],
    ['summary', post.summary],
    ['concepts', (post.concepts || []).join(' ')],
    ['tags', (post.tags || []).join(' ')],
    ['topics', (post.topics || []).join(' ')],
    ['category', post.category],
  ];
  return fields.filter(([, value]) => String(value || '').includes(change.name)).map(([field]) => `metadata ${field} mentions: ${change.name}`);
}

function fullScreenReason(change) {
  if (change.kind === 'added') return `added ${change.entity}: full metadata screen`;
  if (change.kind === 'removed') return `removed ${change.entity}: full metadata screen`;
  if (change.kind === 'deprecated') return `deprecated ${change.entity}: full metadata screen`;
  if (change.kind === 'renamed') return `renamed ${change.entity}: full metadata screen`;
  if (change.kind === 'merged') return `merged ${change.entity}: full metadata screen`;
  return `${change.kind.replace(/_changed$/, '')} change: full metadata screen`;
}

function prepareImpactReview({ changes, posts, reviewCategories = [], forceFullScreen = false }) {
  const candidates = [];
  const taxonomyChanges = changes.filter(change => change.kind !== 'manual_scope');
  const fullScreenReasons = [
    ...(forceFullScreen ? ['explicit full-screen'] : []),
    ...taxonomyChanges.map(fullScreenReason),
  ];
  for (const post of posts) {
    const reasons = [];
    reasons.push(...fullScreenReasons);
    if (reviewCategories.includes(post.category)) reasons.push(`review category: ${post.category}`);
    for (const change of changes) {
      if (change.entity === 'category' && post.category === change.name) reasons.push(`changed category: ${change.name}`);
      if (change.entity === 'tag' && (post.tags || []).includes(change.name)) reasons.push(`changed tag: ${change.name}`);
      if (change.entity === 'topic' && (post.topics || []).includes(change.name)) reasons.push(`changed topic: ${change.name}`);
      reasons.push(...textMatchesChange(post, change));
    }
    if (reasons.length) candidates.push({
      slug: post.slug,
      title: post.title,
      category: post.category,
      tags: post.tags || [],
      topics: post.topics || [],
      concepts: post.concepts || [],
      reasons: [...new Set(reasons)],
    });
  }
  return {
    changes,
    candidates,
    fullMetadataScreen: fullScreenReasons.length > 0,
    mutationCount: 0,
    message: changes.length ? '候选池已准备；请依次阅读线上正式页、仓库发布 HTML、Markdown 后作人工结论。' : '历史 audit 完成，无需迁移。',
  };
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function taxonomyFromGitRef(rootDir, ref) {
  const source = childProcess.execFileSync('git', ['show', `${ref}:${TAXONOMY_RELATIVE_PATH}`], { cwd: rootDir, encoding: 'utf8' });
  return JSON.parse(source);
}

function parseArgs(argv) {
  const options = { categories: [], json: false, fullScreen: false };
  for (let index = 0; index < argv.length; index++) {
    const argument = argv[index];
    if (argument === '--before' || argument === '--base-ref' || argument === '--categories' || argument === '--focus') {
      const value = argv[++index];
      if (!value) throw new Error(`Missing value for ${argument}`);
      if (argument === '--before') options.before = value;
      if (argument === '--base-ref') options.baseRef = value;
      if (argument === '--categories') options.categories = value.split(',').filter(Boolean);
      if (argument === '--focus') {
        const [entity, name] = value.split(':');
        if (!ENTITY_COLLECTIONS.some(([kind]) => kind === entity) || !name) throw new Error('--focus must use category:<name>, tag:<name>, or topic:<name>');
        options.focus = { kind: 'manual_scope', entity, name };
      }
      continue;
    }
    if (argument === '--json') {
      options.json = true;
      continue;
    }
    if (argument === '--full-screen') {
      options.fullScreen = true;
      continue;
    }
    throw new Error(`Unknown option: ${argument}`);
  }
  if (options.before && options.baseRef) throw new Error('Use either --before or --base-ref, not both');
  if (options.fullScreen && !options.before && !options.baseRef && !options.focus) {
    throw new Error('--full-screen requires --focus or a taxonomy comparison');
  }
  return options;
}

function auditTaxonomyImpact({ rootDir = path.resolve(__dirname, '..', '..'), before, baseRef, categories = [], focus, fullScreen = false, checkTaxonomy = checkBlogTaxonomy } = {}) {
  const taxonomyCheck = checkTaxonomy(rootDir);
  if (taxonomyCheck.errors.length) {
    throw new Error(`Taxonomy validation failed:\n${taxonomyCheck.errors.join('\n')}`);
  }
  const current = readJson(path.join(rootDir, TAXONOMY_RELATIVE_PATH));
  const metadata = readJson(path.join(rootDir, 'tools/blog/data/posts-meta.json'));
  validateBlogMetadata(metadata);
  const baseline = before ? readJson(path.resolve(rootDir, before)) : baseRef ? taxonomyFromGitRef(rootDir, baseRef) : null;
  const changes = baseline ? diffTaxonomySemantics(baseline, current) : focus ? [focus] : [];
  return prepareImpactReview({ changes, posts: metadata.posts, reviewCategories: categories, forceFullScreen: fullScreen });
}

function main(argv = process.argv.slice(2)) {
  const options = parseArgs(argv);
  const result = auditTaxonomyImpact(options);
  if (options.json) {
    console.log(JSON.stringify(result, null, 2));
    return;
  }
  console.log(`taxonomy impact changes: ${result.changes.length}; candidates: ${result.candidates.length}; metadata writes: ${result.mutationCount}`);
  for (const candidate of result.candidates) console.log(`- ${candidate.slug}: ${candidate.reasons.join('; ')}`);
  console.log(result.message);
}

if (require.main === module) main();

module.exports = {
  auditTaxonomyImpact,
  diffTaxonomySemantics,
  parseArgs,
  prepareImpactReview,
};
