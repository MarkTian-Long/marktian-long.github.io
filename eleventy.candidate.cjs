'use strict';

const path = require('node:path');

module.exports = function candidateConfig(config) {
  config.addTemplateFormats('11ty.js');
  return {
    dir: {
      input: 'site/candidate',
      includes: '_includes',
      data: '_data',
    },
    templateFormats: ['11ty.js'],
    htmlTemplateEngine: false,
    markdownTemplateEngine: false,
  };
};
