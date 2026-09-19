'use strict';

const fs = require('node:fs');
const path = require('node:path');

const TAXONOMY_PATH = path.join(__dirname, 'data', 'blog-taxonomy.json');
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function loadBlogTaxonomy(taxonomyPath = TAXONOMY_PATH) {
  const taxonomy = JSON.parse(fs.readFileSync(taxonomyPath, 'utf8'));
  if (!taxonomy || taxonomy.version !== 1) throw new Error('blog-taxonomy.json version must be 1');
  for (const collection of [taxonomy.categories?.active, taxonomy.categories?.legacy, taxonomy.tags, taxonomy.topics]) {
    if (!Array.isArray(collection) || collection.some((item) => !item || typeof item.name !== 'string' || !item.name.trim())) {
      throw new Error('blog-taxonomy.json contains an invalid named collection');
    }
  }
  if (!Array.isArray(taxonomy.relation_types) || !taxonomy.concepts || !Number.isInteger(taxonomy.concepts.min_items) || !Number.isInteger(taxonomy.concepts.max_items)) {
    throw new Error('blog-taxonomy.json contains an invalid validator contract');
  }
  return taxonomy;
}

function names(items) { return new Set(items.map((item) => item.name)); }
function assertStringArray(value, field, source) {
  if (!Array.isArray(value) || !value.length || !value.every((item) => typeof item === 'string' && item.trim() === item && item)) {
    throw new Error(`${field} must be a non-empty trimmed string array: ${source}`);
  }
  if (new Set(value).size !== value.length) throw new Error(`${field} entries must be unique: ${source}`);
}

function validateCategory(category, { allowLegacy = false, taxonomy = loadBlogTaxonomy(), source = '<metadata>' } = {}) {
  if (names(taxonomy.categories.active).has(category)) return;
  if (names(taxonomy.categories.legacy).has(category)) {
    if (allowLegacy) return;
    throw new Error(`Legacy category is not allowed for new Markdown: ${category} (${source})`);
  }
  throw new Error(`Category is not defined by blog taxonomy: ${category} (${source})`);
}

function validateVocabulary(values, field, taxonomy, source) {
  assertStringArray(values, field, source);
  const allowed = names(taxonomy[field]);
  for (const value of values) {
    if (!allowed.has(value)) throw new Error(`${field} value is not defined by blog taxonomy: ${value} (${source})`);
  }
}

function validateConcepts(concepts, { tags = [], topics = [], taxonomy = loadBlogTaxonomy(), source = '<metadata>' } = {}) {
  assertStringArray(concepts, 'concepts', source);
  if (concepts.length < taxonomy.concepts.min_items || concepts.length > taxonomy.concepts.max_items) {
    throw new Error(`concepts must contain ${taxonomy.concepts.min_items} to ${taxonomy.concepts.max_items} entries: ${source}`);
  }
  const generic = new Set(taxonomy.concepts.generic_terms);
  if (concepts.some((value) => generic.has(value))) throw new Error(`concepts cannot use generic terms: ${source}`);
  if (taxonomy.concepts.disallow_exact_tag_topic_duplicates) {
    const labels = new Set([...tags, ...topics]);
    if (concepts.some((value) => labels.has(value))) throw new Error(`concepts cannot duplicate tag or topic exactly: ${source}`);
  }
}

function validateRelations(relations, { slug, knownSlugs = [], taxonomy = loadBlogTaxonomy(), source = '<metadata>' } = {}) {
  if (!Array.isArray(relations)) throw new Error(`relations must be an array: ${source}`);
  const targets = new Set();
  const known = new Set(knownSlugs);
  for (const relation of relations) {
    if (!relation || typeof relation !== 'object' || Array.isArray(relation) || Object.keys(relation).length !== 2 || typeof relation.slug !== 'string' || typeof relation.type !== 'string') {
      throw new Error(`relations must contain only slug and type: ${source}`);
    }
    if (!SLUG_PATTERN.test(relation.slug)) throw new Error(`relation target must be a kebab-case slug: ${source}`);
    if (!known.has(relation.slug)) throw new Error(`relation target must exist: ${relation.slug} (${source})`);
    if (relation.slug === slug) throw new Error(`relation cannot reference itself: ${slug}`);
    if (!taxonomy.relation_types.includes(relation.type)) throw new Error(`relation type is invalid: ${relation.type}`);
    if (targets.has(relation.slug)) throw new Error(`relation target is duplicated: ${relation.slug}`);
    targets.add(relation.slug);
  }
}

function validateSemanticMetadata(metadata, { allowLegacyCategory = false, knownSlugs = [], taxonomy = loadBlogTaxonomy(), source = '<metadata>' } = {}) {
  validateCategory(metadata.category, { allowLegacy: allowLegacyCategory, taxonomy, source });
  validateVocabulary(metadata.tags, 'tags', taxonomy, source);
  validateVocabulary(metadata.topics, 'topics', taxonomy, source);
  validateConcepts(metadata.concepts, { tags: metadata.tags, topics: metadata.topics, taxonomy, source });
  if (typeof metadata.share_quote !== 'string' || !metadata.share_quote.trim() || metadata.share_quote.trim() !== metadata.share_quote) {
    throw new Error(`share_quote must be a trimmed non-empty string: ${source}`);
  }
  validateRelations(metadata.relations || [], { slug: metadata.slug, knownSlugs, taxonomy, source });
}

module.exports = {
  TAXONOMY_PATH,
  loadBlogTaxonomy,
  validateCategory,
  validateVocabulary,
  validateConcepts,
  validateRelations,
  validateSemanticMetadata,
};
