'use strict';

// Read-only review signals; none of these metrics decides semantic labels.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { loadBlogTaxonomy, validateSemanticMetadata } = require('./blog-taxonomy.js');

const REVIEW_THRESHOLDS = Object.freeze({
  minCorpus: 20, corpusShare: 0.30,
  minCategory: 8, categoryShare: 0.60, minMatches: 6,
});
function canonical(value) {
  if (Array.isArray(value)) return value.map(canonical);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.keys(value).sort().map(key => [key, canonical(value[key])]));
  }
  return value;
}
function digest(value) {
  return crypto.createHash('sha256').update(JSON.stringify(canonical(value))).digest('hex');
}
function analyzeHealth(metadata, taxonomy) {
  if (!metadata || !Array.isArray(metadata.posts)) throw new Error('metadata.posts must be an array');
  const posts = metadata.posts;
  const knownSlugs = posts.map(p => p && p.slug);
  const errors = [], signals = [], valid = [], seen = new Set();
  const addSignal = (code, subject, details, evidence) => {
    signals.push({ code, subject, details, fingerprint: digest({ code, subject, evidence }) });
  };
  for (const post of posts) {
    const source = post && post.slug || '<unknown>';
    try {
      if (!post || typeof post.slug !== 'string' || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(post.slug)) {
        throw new Error('invalid or missing slug');
      }
      if (seen.has(post.slug)) throw new Error('duplicate slug');
      seen.add(post.slug);
      validateSemanticMetadata(post, { taxonomy, knownSlugs, allowLegacyCategory: true, source });
      valid.push(post);
    } catch (error) { errors.push({ slug: source, message: error.message }); }
  }
  const categories = Object.fromEntries([...new Set(valid.map(p => p.category))].sort()
    .map(name => [name, valid.filter(p => p.category === name).length]));
  const distribution = {};
  const density = taxonomy.label_rules?.combined_display || { normal_min_items: 1, normal_max_items: 3 };
  for (const post of valid) {
    const count = post.tags.length + post.topics.length;
    distribution[count] = (distribution[count] || 0) + 1;
    if (count < density.normal_min_items || count > density.normal_max_items) {
      addSignal('label-density', post.slug, { count }, { tags: post.tags, topics: post.topics, density });
    }
    if (post.topics.length === 0) {
      addSignal('topic-gap', post.slug, { title: post.title }, { title: post.title, summary: post.summary, concepts: post.concepts });
    }
  }
  const vocabulary = {};
  for (const field of ['tags', 'topics']) {
    vocabulary[field] = taxonomy[field].map(entry => {
      const matches = valid.filter(p => p[field].includes(entry.name));
      const slugs = matches.map(p => p.slug).sort();
      const byCategory = Object.fromEntries(Object.keys(categories)
        .map(name => [name, matches.filter(p => p.category === name).length]).filter(([, n]) => n));
      const status = entry.status || 'active';
      const evidence = { entry, slugs };
      if (status !== 'active' && matches.length) {
        addSignal('inactive-in-use', `${field}:${entry.name}`, { status, slugs }, evidence);
      }
      if (status === 'active' && matches.length === 0) {
        addSignal('unused-active', `${field}:${entry.name}`, { note: 'Review utility; not an automatic removal.' }, evidence);
      }
      if (status === 'active' && valid.length >= REVIEW_THRESHOLDS.minCorpus
          && matches.length / valid.length >= REVIEW_THRESHOLDS.corpusShare) {
        addSignal('corpus-concentration', `${field}:${entry.name}`,
          { count: matches.length, total: valid.length }, evidence);
      }
      for (const [category, count] of Object.entries(byCategory)) {
        if (status === 'active' && categories[category] >= REVIEW_THRESHOLDS.minCategory
            && count >= REVIEW_THRESHOLDS.minMatches
            && count / categories[category] >= REVIEW_THRESHOLDS.categoryShare) {
          addSignal('category-concentration', `${field}:${entry.name}:${category}`,
            { count, categoryTotal: categories[category] }, evidence);
        }
      }
      return { name: entry.name, status, count: matches.length,
        coveragePct: valid.length ? +(100 * matches.length / valid.length).toFixed(1) : 0,
        byCategory, slugs };
    }).sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
  }
  return {
    version: 1, coverage: errors.length ? 'partial' : 'complete-metadata-only',
    examined: posts.length, valid: valid.length, errors,
    inputFingerprint: digest({ taxonomy, posts: posts.slice().sort((a, b) => String(a?.slug).localeCompare(String(b?.slug))) }),
    categories, distribution, vocabulary,
    reservedTags: (taxonomy.reserved_tags || []).map(t => t.name),
    reviewSignals: signals,
    limitations: ['Does not read article bodies, decide semantic correctness, validate source/index parity, or prove deployments.',
      'Concentration and unused terms are review signals, not errors or automatic retagging instructions.'],
  };
}
function scanRepository(rootDir = process.cwd()) {
  const taxonomy = loadBlogTaxonomy(path.join(rootDir, 'tools/blog/data/blog-taxonomy.json'));
  const metadata = JSON.parse(fs.readFileSync(path.join(rootDir, 'tools/blog/data/posts-meta.json'), 'utf8'));
  return analyzeHealth(metadata, taxonomy);
}
function parseArgs(argv) {
  if (argv.some(a => a !== '--json') || argv.length > 1) throw new Error('Usage: node tools/blog/check-taxonomy-health.js [--json]');
  return { json: argv.includes('--json') };
}
function main() {
  try {
    const options = parseArgs(process.argv.slice(2));
    const report = scanRepository();
    if (options.json) console.log(JSON.stringify(report, null, 2));
    else {
      console.log(`Taxonomy metadata: ${report.valid}/${report.examined}; errors=${report.errors.length}; review signals=${report.reviewSignals.length}`);
      console.log(`Combined label distribution: ${JSON.stringify(report.distribution)}`);
      for (const signal of report.reviewSignals) console.log(`REVIEW ${signal.code} ${signal.subject}`);
      for (const error of report.errors) console.error(`ERROR ${error.slug}: ${error.message}`);
      console.log('Read-only; article-body review and existing source/index checks are still required.');
    }
    if (report.errors.length) process.exitCode = 1;
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}
if (require.main === module) main();
module.exports = { analyzeHealth, scanRepository, parseArgs, REVIEW_THRESHOLDS };
