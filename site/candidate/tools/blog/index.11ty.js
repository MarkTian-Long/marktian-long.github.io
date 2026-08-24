'use strict';

const { readFrozenPage } = require('../../frozen-page-source');

module.exports = class BlogIndexCandidate {
  // The archive remains byte-frozen while its metadata/runtime migration is
  // separately proved; candidate-only rendering verifies its route contract.
  data() { return { permalink: 'tools/blog/index.html' }; }
  render() { return readFrozenPage('tools/blog/index.html'); }
};
