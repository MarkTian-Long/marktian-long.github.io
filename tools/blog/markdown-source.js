'use strict';

const { validateSemanticMetadata } = require('./blog-taxonomy.js');

const REQUIRED_FRONTMATTER_FIELDS = new Set(['category', 'tags', 'topics', 'concepts', 'share_quote', 'relations']);

function normalizedLines(markdown) {
  return String(markdown).replace(/^\uFEFF/, '').replace(/\r/g, '').split('\n');
}

function parseFrontmatter(lines, sourcePath) {
  if (lines[0] !== '---') return { frontmatter: null, contentStartIndex: 0 };
  const closingIndex = lines.findIndex((line, index) => index > 0 && line === '---');
  if (closingIndex === -1) throw new Error(`Markdown frontmatter is not closed: ${sourcePath}`);

  const frontmatter = {};
  for (const line of lines.slice(1, closingIndex)) {
    const match = /^([a-z_]+):\s*(.*)$/.exec(line);
    if (!match) throw new Error(`Markdown frontmatter must use one field per line: ${sourcePath}`);
    const [, field, rawValue] = match;
    if (!REQUIRED_FRONTMATTER_FIELDS.has(field)) throw new Error(`Markdown frontmatter contains an unknown field: ${field} (${sourcePath})`);
    if (Object.hasOwn(frontmatter, field)) throw new Error(`Markdown frontmatter field is duplicated: ${field} (${sourcePath})`);
    if (field === 'category') {
      if (!rawValue || rawValue !== rawValue.trim() || rawValue.startsWith('"')) throw new Error(`Markdown frontmatter category must be an unquoted value: ${sourcePath}`);
      frontmatter[field] = rawValue;
      continue;
    }
    try {
      frontmatter[field] = JSON.parse(rawValue);
    } catch {
      throw new Error(`Markdown frontmatter ${field} must use a JSON-compatible inline value: ${sourcePath}`);
    }
  }
  for (const field of REQUIRED_FRONTMATTER_FIELDS) {
    if (!Object.hasOwn(frontmatter, field)) throw new Error(`Markdown frontmatter is missing required field: ${field} (${sourcePath})`);
  }
  return { frontmatter, contentStartIndex: closingIndex + 1 };
}

function parseSourceMarkdown(markdown, sourcePath = '<inline Markdown>') {
  const lines = normalizedLines(markdown);
  const { frontmatter, contentStartIndex } = parseFrontmatter(lines, sourcePath);
  const outsideFence = [];
  let fenceChar = null;

  for (let index = 0; index < lines.length; index++) {
    const fence = lines[index].match(/^\s*(`{3,}|~{3,})/);
    outsideFence[index] = fenceChar === null;
    if (!fence) continue;
    const nextFenceChar = fence[1][0];
    if (fenceChar === null) fenceChar = nextFenceChar;
    else if (fenceChar === nextFenceChar) fenceChar = null;
  }
  if (fenceChar !== null) throw new Error(`Markdown source has an unclosed code fence: ${sourcePath}`);

  const headings = lines
    .map((line, index) => ({ line, index }))
    .filter(({ line, index }) => index >= contentStartIndex && outsideFence[index] && /^#\s+/.test(line));
  if (headings.length !== 1) {
    throw new Error(`Markdown source must contain exactly one H1: ${sourcePath}`);
  }

  const h1 = headings[0];
  const sourceTitle = h1.line.replace(/^#\s+/, '').trim();
  const separatorIndex = lines.findIndex((line, index) => (
    index > h1.index && outsideFence[index] && /^---+\s*$/.test(line)
  ));
  if (separatorIndex === -1) {
    throw new Error(`Markdown source lacks the body separator after H1: ${sourcePath}`);
  }

  const summaryBlockquote = [];
  const summaryGroups = [];
  let currentGroup = null;
  let invalidPreamble = false;
  for (const [offset, line] of lines.slice(h1.index + 1, separatorIndex).entries()) {
    if (!outsideFence[h1.index + 1 + offset]) continue;
    const quote = line.match(/^\s{0,3}>\s?(.*)$/);
    if (quote) {
      if (!currentGroup) {
        currentGroup = [];
        summaryGroups.push(currentGroup);
      }
      currentGroup.push(quote[1].trim());
      continue;
    }
    currentGroup = null;
    if (line.trim()) invalidPreamble = true;
  }

  if (summaryGroups.length !== 1 || invalidPreamble) {
    throw new Error(`Markdown source summary blockquote is ambiguous: ${sourcePath}`);
  }
  summaryBlockquote.push(...summaryGroups[0]);
  const sourceSummary = summaryBlockquote.join(' ').replace(/\s+/g, ' ').trim();
  if (!sourceSummary) throw new Error(`Markdown source summary is empty: ${sourcePath}`);

  const bodyMarkdown = lines.slice(separatorIndex + 1).join('\n');
  if (frontmatter) {
    validateSemanticMetadata({ ...frontmatter, slug: sourcePath === '<inline Markdown>' ? '<inline>' : sourcePath.split(/[\\/]/).pop().replace(/\.md$/, '') }, {
      knownSlugs: frontmatter.relations.map((relation) => relation && relation.slug).filter(Boolean),
      source: sourcePath,
    });
    if (!bodyMarkdown.includes(frontmatter.share_quote)) {
      throw new Error(`Markdown frontmatter share_quote must exist in the final body: ${sourcePath}`);
    }
  }

  return { frontmatter, sourceTitle, sourceSummary, summaryBlockquote, separatorIndex, bodyMarkdown, contentStartIndex };
}

function extractSummaryBlockquote(markdown, sourcePath) {
  return parseSourceMarkdown(markdown, sourcePath).summaryBlockquote;
}

function extractSourceSummary(markdown, sourcePath) {
  return parseSourceMarkdown(markdown, sourcePath).sourceSummary;
}

module.exports = {
  parseSourceMarkdown,
  extractSummaryBlockquote,
  extractSourceSummary
};
