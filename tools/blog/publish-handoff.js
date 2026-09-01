'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { validateBlogMetadata } = require('../../scripts/generate-search-assets.js');

const ALLOWED_RELATION_TYPES = new Set(['builds_on', 'revises', 'companion']);
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function parsePublishHandoff(markdown, sourcePath = '<inline Markdown>') {
  const lines = String(markdown).replace(/\r/g, '').split('\n');
  let fence = null;
  const rawStarts = [];
  const fencedBlocks = [];

  for (let index = 0; index < lines.length; index++) {
    if (fence) {
      if (isFenceClose(lines[index], fence)) {
        fencedBlocks.push({ ...fence, end: index, lines: lines.slice(fence.start + 1, index) });
        fence = null;
      }
      continue;
    }

    const opening = parseFenceStart(lines[index]);
    if (opening) {
      fence = { ...opening, start: index };
      continue;
    }
    if (/^publish_handoff:\s*$/.test(lines[index])) rawStarts.push(index);
  }
  if (fence) throw new Error(`Markdown source has an unclosed code fence: ${sourcePath}`);

  const candidates = [];
  for (const start of rawStarts) {
    candidates.push({ start, handoff: parseTransportBlock(lines.slice(start), sourcePath) });
  }
  for (const block of fencedBlocks) {
    if (!/^(?:yaml|yml)$/.test(block.info)) continue;
    const firstContent = block.lines.find(line => line.trim());
    if (!/^publish_handoff:\s*$/.test(firstContent || '')) continue;
    try {
      candidates.push({ start: block.start, end: block.end, handoff: parseTransportBlock(block.lines, sourcePath) });
    } catch (error) {
      if (!lines.slice(block.end + 1).some(line => line.trim())) throw error;
      // A non-transport YAML example must not block a valid handoff elsewhere.
    }
  }

  if (!candidates.length) return { handoff: null, markdown: String(markdown).replace(/\r/g, '') };
  if (candidates.length !== 1) throw new Error(`Publish handoff must appear at most once: ${sourcePath}`);

  const candidate = candidates[0];
  if (candidate.end !== undefined && lines.slice(candidate.end + 1).some(line => line.trim())) {
    throw new Error(`Publish handoff must be the final transport block: ${sourcePath}`);
  }
  return {
    handoff: candidate.handoff,
    markdown: lines.slice(0, candidate.start).join('\n').replace(/\n+$/, '\n')
  };
}

function parseFenceStart(line) {
  const match = /^\s*(`{3,}|~{3,})([^\r\n]*)$/.exec(line);
  if (!match) return null;
  return { char: match[1][0], length: match[1].length, info: match[2].trim() };
}

function isFenceClose(line, fence) {
  const match = /^\s*(`{3,}|~{3,})\s*$/.exec(line);
  return Boolean(match && match[1][0] === fence.char && match[1].length >= fence.length);
}

function parseTransportBlock(blockLines, sourcePath) {
  const lines = blockLines;
  const handoff = { relations: undefined, bodyLinkOnly: undefined };
  const seenFields = new Set();
  let index = 0;

  function consumeBlankLines() {
    while (index < lines.length && !lines[index].trim()) index++;
  }
  function readSlug(value, description) {
    if (!SLUG_PATTERN.test(value)) throw new Error(`Publish handoff ${description} must be a kebab-case slug: ${sourcePath}`);
    return value;
  }

  consumeBlankLines();
  if (index >= lines.length || !/^publish_handoff:\s*$/.test(lines[index])) {
    throw new Error(`Publish handoff must start with publish_handoff: ${sourcePath}`);
  }
  index++;
  consumeBlankLines();
  while (index < lines.length) {
    const field = /^  (relations|body_link_only):(\s*\[\])?\s*$/.exec(lines[index]);
    if (!field) throw new Error(`Publish handoff must be the final transport block: ${sourcePath}`);
    const [, name, empty] = field;
    if (seenFields.has(name)) throw new Error(`Publish handoff field is duplicated: ${name}`);
    seenFields.add(name);
    index++;

    if (name === 'relations') {
      const relations = [];
      if (!empty) {
        while (index < lines.length) {
          const relation = /^    - slug:\s*([^\s]+)\s*$/.exec(lines[index]);
          if (!relation) break;
          const slug = readSlug(relation[1], 'relation target');
          index++;
          const type = /^      type:\s*([a-z_]+)\s*$/.exec(lines[index] || '');
          if (!type) throw new Error(`Publish handoff relation must declare type: ${sourcePath}`);
          relations.push({ slug, type: type[1] });
          index++;
        }
      }
      handoff.relations = relations;
    } else {
      const bodyLinkOnly = [];
      if (!empty) {
        while (index < lines.length) {
          const item = /^    -\s*([^\s]+)\s*$/.exec(lines[index]);
          if (!item) break;
          bodyLinkOnly.push(readSlug(item[1], 'body_link_only target'));
          index++;
        }
      }
      handoff.bodyLinkOnly = bodyLinkOnly;
    }
    consumeBlankLines();
  }

  if (!seenFields.size) throw new Error(`Publish handoff cannot be empty: ${sourcePath}`);
  return handoff;
}

function validateHandoff(handoff, slug, posts) {
  const postSlugs = new Set(posts.map((post) => post.slug));
  const validateTarget = (target, description) => {
    if (!postSlugs.has(target)) throw new Error(`Publish handoff ${description} target must exist: ${target}`);
    if (target === slug) throw new Error(`Publish handoff ${description} cannot reference itself: ${slug}`);
  };

  const relationTargets = new Set();
  for (const relation of handoff.relations || []) {
    validateTarget(relation.slug, 'relation');
    if (!ALLOWED_RELATION_TYPES.has(relation.type)) throw new Error(`Publish handoff relation type is invalid: ${relation.type}`);
    if (relationTargets.has(relation.slug)) throw new Error(`Publish handoff relation target is duplicated: ${relation.slug}`);
    relationTargets.add(relation.slug);
  }
  const bodyLinkTargets = new Set();
  for (const target of handoff.bodyLinkOnly || []) {
    validateTarget(target, 'body_link_only');
    if (bodyLinkTargets.has(target)) throw new Error(`Publish handoff body_link_only target is duplicated: ${target}`);
    bodyLinkTargets.add(target);
  }
}

function applyPublishHandoff({ sourcePath, rootDir = process.cwd() }) {
  const absoluteSourcePath = path.resolve(sourcePath);
  const source = fs.readFileSync(absoluteSourcePath, 'utf8');
  const parsed = parsePublishHandoff(source, sourcePath);
  if (!parsed.handoff) throw new Error(`No publish handoff found: ${sourcePath}`);

  const metadataPath = path.join(rootDir, 'tools/blog/data/posts-meta.json');
  const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
  const slug = path.basename(absoluteSourcePath, '.md');
  const post = metadata.posts.find((entry) => entry.slug === slug);
  if (!post) throw new Error(`No metadata found for handoff source slug: ${slug}`);

  validateHandoff(parsed.handoff, slug, metadata.posts);
  if (parsed.handoff.relations !== undefined) post.relations = parsed.handoff.relations;
  validateBlogMetadata(metadata);

  fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2) + '\n', 'utf8');
  fs.writeFileSync(absoluteSourcePath, parsed.markdown, 'utf8');
  return { slug, relations: parsed.handoff.relations, bodyLinkOnly: parsed.handoff.bodyLinkOnly };
}

function main(argv = process.argv.slice(2)) {
  if (argv.length !== 2 || argv[0] !== '--write') {
    throw new Error('Usage: node tools/blog/publish-handoff.js --write <source.md>');
  }
  const result = applyPublishHandoff({ sourcePath: argv[1] });
  console.log(`Applied publish handoff for ${result.slug}.`);
}

if (require.main === module) main();

module.exports = { applyPublishHandoff, parsePublishHandoff, validateHandoff };
