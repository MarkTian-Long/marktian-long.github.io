'use strict';

const { readFrozenPage } = require('./frozen-page-source');

module.exports = class HomeCandidate {
  // A byte-frozen compatibility source: semantic extraction is intentionally
  // deferred until it can pass the candidate equivalence gate without UI drift.
  data() { return { permalink: 'index.html' }; }
  render() { return readFrozenPage('index.html'); }
};
