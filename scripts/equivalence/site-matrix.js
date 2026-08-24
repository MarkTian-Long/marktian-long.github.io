'use strict';

const path = require('node:path');
const { publicFiles } = require('../public-dist-manifest');

const APPROVED_BASELINE_SHA = '74b531562ff14a5c38830c0edf88304af9f19933';
const EXPECTED_PUBLIC_FILE_COUNT = 73;
const EXPECTED_HTML_ROUTE_COUNT = 49;
const REPOSITORY_BASE_PATH = '/repo-name/';

const VIEWPORTS = Object.freeze({
  desktop: Object.freeze({ width: 1440, height: 1000 }),
  mobile: Object.freeze({ width: 390, height: 844 }),
});

const THEMES = Object.freeze(['light', 'dark']);

function toRoute(relativePath) {
  return `/${relativePath.split(path.sep).join('/')}`;
}

function createSiteMatrix(rootDir, { candidateRoot = null } = {}) {
  const files = publicFiles(rootDir);
  const htmlRoutes = files.filter(file => file.endsWith('.html')).map(toRoute);

  return Object.freeze({
    files: Object.freeze([...files]),
    htmlRoutes: Object.freeze(htmlRoutes),
    basePaths: Object.freeze(['/', REPOSITORY_BASE_PATH]),
    viewports: VIEWPORTS,
    themes: THEMES,
    candidate: Object.freeze({ enabled: Boolean(candidateRoot), rootDir: candidateRoot ? path.resolve(candidateRoot) : null }),
  });
}

module.exports = {
  APPROVED_BASELINE_SHA,
  EXPECTED_HTML_ROUTE_COUNT,
  EXPECTED_PUBLIC_FILE_COUNT,
  REPOSITORY_BASE_PATH,
  THEMES,
  VIEWPORTS,
  createSiteMatrix,
  toRoute,
};
