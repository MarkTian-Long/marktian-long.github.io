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
  if (taxonomy.label_rules !== undefined) {
    for (const field of ['tags', 'topics']) {
      const rule = taxonomy.label_rules[field];
      if (!rule || !Number.isInteger(rule.min_items) || !Number.isInteger(rule.max_items)
        || rule.min_items < 0 || rule.max_items < rule.min_items) {
        throw new Error(`Invalid label cardinality: ${field}`);
      }
    }
  }
  return taxonomy;
}

function names(items) { return new Set(items.map((item) => item.name)); }
function assertStringArray(value, field, source, { minItems = 1, maxItems = Infinity } = {}) {
  if (!Array.isArray(value) || !value.every((item) => typeof item === 'string' && item.trim() === item && item)) {
    throw new Error(`${field} must be a trimmed string array: ${source}`);
  }
  if (value.length < minItems || value.length > maxItems) {
    throw new Error(`${field} must contain ${minItems} to ${maxItems} entries: ${source}`);
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

function validateVocabulary(values, field, taxonomy, source, { allowDeprecated = false } = {}) {
  // Counts belong to the dictionary. The fallback preserves older taxonomy fixtures.
  const rule = taxonomy.label_rules?.[field] || { min_items: 1, max_items: 2 };
  assertStringArray(values, field, source, { minItems: rule.min_items, maxItems: rule.max_items });
  const byName = new Map(taxonomy[field].map((item) => [item.name, item]));
  for (const value of values) {
    if (!byName.has(value)) throw new Error(`${field} value is not defined by blog taxonomy: ${value} (${source})`);
    if (!allowDeprecated && byName.get(value).status === 'deprecated') {
      throw new Error(`${field} value is deprecated for new Markdown: ${value} (${source})`);
    }
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
  const vocabularyOptions = { allowDeprecated: allowLegacyCategory };
  validateVocabulary(metadata.tags, 'tags', taxonomy, source, vocabularyOptions);
  validateVocabulary(metadata.topics, 'topics', taxonomy, source, vocabularyOptions);
  if (metadata.tags.some((tag) => metadata.topics.includes(tag))) {
    throw new Error(`tags and topics must not overlap: ${source}`);
  }
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
