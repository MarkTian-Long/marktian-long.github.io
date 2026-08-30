'use strict';

function normalizedLines(markdown) {
  return String(markdown).replace(/\r/g, '').split('\n');
}

function parseSourceMarkdown(markdown, sourcePath = '<inline Markdown>') {
  const lines = normalizedLines(markdown);
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
    .filter(({ line, index }) => outsideFence[index] && /^#\s+/.test(line));
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

  return { sourceTitle, sourceSummary, summaryBlockquote, separatorIndex };
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
