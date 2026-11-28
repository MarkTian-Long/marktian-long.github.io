'use strict';

function escapeHtml(value) {
  return String(value == null ? '' : value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function validatePosts(posts) {
  if (!Array.isArray(posts)) throw new Error('Blog archive posts must be an array');
  const slugs = new Set();
  for (const post of posts) {
    if (!post || typeof post !== 'object' || Array.isArray(post)) {
      throw new Error('Each blog archive post must be an object');
    }
    for (const field of ['slug', 'date', 'title', 'summary', 'category', 'url']) {
      if (typeof post[field] !== 'string' || !post[field].trim()) {
        throw new Error('Blog archive post ' + field + ' must be a non-empty string');
      }
    }
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(post.slug)) {
      throw new Error('Invalid blog archive slug: ' + post.slug);
    }
    if (!/^\d{4}\.(0[1-9]|1[0-2])$/.test(post.date)) {
      throw new Error('Invalid blog archive date for ' + post.slug + ': ' + post.date);
    }
    if (post.url !== 'posts/' + post.slug + '.html') {
      throw new Error('Invalid blog archive URL for ' + post.slug + ': ' + post.url);
    }
    if (slugs.has(post.slug)) throw new Error('Duplicate blog archive slug: ' + post.slug);
    slugs.add(post.slug);
    for (const field of ['tags', 'topics']) {
      if (post[field] !== undefined
        && (!Array.isArray(post[field]) || post[field].some(value => typeof value !== 'string'))) {
        throw new Error('Blog archive post ' + field + ' must be an array of strings: ' + post.slug);
      }
    }
  }
  return slugs;
}

function validateFeaturedSlugs(featuredSlugs, knownSlugs) {
  if (!Array.isArray(featuredSlugs)) {
    throw new Error('Featured blog slugs must be an array');
  }
  const seen = new Set();
  for (const slug of featuredSlugs) {
    if (typeof slug !== 'string' || !slug.trim()) {
      throw new Error('Featured blog slug must be a non-empty string');
    }
    if (seen.has(slug)) throw new Error('Duplicate featured blog slug: ' + slug);
    if (!knownSlugs.has(slug)) throw new Error('Unknown featured blog slug: ' + slug);
    seen.add(slug);
  }
  return seen;
}

function renderPostRows(posts, isFeatured, featuredSlugSet) {
  return posts.map(post => {
    const category = escapeHtml(post.category);
    const tags = (post.tags || []).concat(post.topics || []);
    const featuredLabel = !isFeatured && featuredSlugSet.has(post.slug)
      ? '<span class="post-featured">精选</span>'
      : '';
    return '<article class="post-row">'
      + '<div class="post-content">'
      + '<div class="post-meta">'
      + (isFeatured ? '<span class="post-date">' + escapeHtml(post.date) + '</span>' : '')
      + '<button class="post-category" type="button" data-cat="' + category
      + '" aria-label="筛选' + category + '分类">' + category + '</button>'
      + featuredLabel
      + '</div>'
      + '<h2 class="post-heading"><a class="post-title" href="' + escapeHtml(post.url)
      + '" target="_blank" rel="noopener">' + escapeHtml(post.title) + '</a></h2>'
      + '<div class="post-summary">' + escapeHtml(post.summary) + '</div>'
      + (tags.length
        ? '<div class="post-tags">' + tags.map(tag => '<span class="post-tag">' + escapeHtml(tag) + '</span>').join('') + '</div>'
        : '')
      + '</div>'
      + '</article>';
  }).join('');
}

function renderNoScriptRows(posts) {
  return posts.map(post => {
    const tags = (post.tags || []).concat(post.topics || []);
    return '<article class="post-row">'
      + '<div class="post-content">'
      + '<div class="post-meta">'
      + '<span class="post-date">' + escapeHtml(post.date) + '</span>'
      + '<span class="post-category">' + escapeHtml(post.category) + '</span>'
      + '</div>'
      + '<h2 class="post-heading"><a class="post-title" href="' + escapeHtml(post.url)
      + '" target="_blank" rel="noopener">' + escapeHtml(post.title) + '</a></h2>'
      + '<div class="post-summary">' + escapeHtml(post.summary) + '</div>'
      + (tags.length
        ? '<div class="post-tags">' + tags.map(tag => '<span class="post-tag">' + escapeHtml(tag) + '</span>').join('') + '</div>'
        : '')
      + '</div>'
      + '</article>';
  }).join('');
}

function renderGroups(posts, renderRows) {
  const byMonth = new Map();
  for (const post of posts) {
    if (!byMonth.has(post.date)) byMonth.set(post.date, []);
    byMonth.get(post.date).push(post);
  }
  return [...byMonth.keys()].sort().reverse().map(month => {
    const label = month.replace('.', ' · ');
    return '<div class="year-group">'
      + '<div class="year-label">' + escapeHtml(label) + '</div>'
      + renderRows(byMonth.get(month))
      + '</div>';
  }).join('');
}

function buildBlogArchive(posts, featuredSlugs, options = {}) {
  const knownSlugs = validatePosts(posts);
  const featuredSet = validateFeaturedSlugs(featuredSlugs, knownSlugs);
  const pageSize = options.pageSize === undefined ? 10 : options.pageSize;
  if (!Number.isInteger(pageSize) || pageSize < 1) {
    throw new Error('Blog archive pageSize must be a positive integer');
  }

  const sortedPosts = posts.slice().sort((a, b) => b.date.localeCompare(a.date));
  const bySlug = new Map(sortedPosts.map(post => [post.slug, post]));
  const featuredPosts = featuredSlugs.map(slug => bySlug.get(slug));
  const firstPagePosts = sortedPosts.filter(post => !featuredSet.has(post.slug)).slice(0, pageSize);
  const firstPageSlugs = new Set(firstPagePosts.map(post => post.slug));
  const remainingPosts = sortedPosts.filter(post => (
    !featuredSet.has(post.slug) && !firstPageSlugs.has(post.slug)
  ));

  const featuredHtml = featuredPosts.length
    ? '<section class="featured-section" aria-label="精选阅读">'
      + '<div class="featured-label">精选阅读</div>'
      + renderPostRows(featuredPosts, true, featuredSet)
      + '</section>'
    : '';
  const archiveHtml = firstPagePosts.length
    ? renderGroups(firstPagePosts, group => renderPostRows(group, false, featuredSet))
    : '<p class="empty">没有符合条件的文章。</p>';
  const noScriptHtml = remainingPosts.length
    ? '<noscript><section class="noscript-archive" aria-label="更多文章">'
      + '<div class="featured-label">更多文章</div>'
      + renderGroups(remainingPosts, renderNoScriptRows)
      + '</section></noscript>'
    : '';

  return { featuredHtml, archiveHtml, noScriptHtml };
}

function replaceMarkerBlock(sourceHtml, name, content) {
  const start = '<!-- blog-archive:' + name + ':start -->';
  const end = '<!-- blog-archive:' + name + ':end -->';
  const startCount = sourceHtml.split(start).length - 1;
  const endCount = sourceHtml.split(end).length - 1;
  if (startCount !== 1 || endCount !== 1) {
    throw new Error('Expected one blog archive marker pair for ' + name);
  }
  const startIndex = sourceHtml.indexOf(start);
  const contentStart = startIndex + start.length;
  const endIndex = sourceHtml.indexOf(end, contentStart);
  if (endIndex < contentStart) {
    throw new Error('Blog archive markers are out of order for ' + name);
  }
  return sourceHtml.slice(0, contentStart)
    + '\n' + content + '\n'
    + sourceHtml.slice(endIndex);
}

function renderBlogArchivePage(sourceHtml, posts, featuredSlugs, options = {}) {
  const archive = buildBlogArchive(posts, featuredSlugs, options);
  let nextHtml = replaceMarkerBlock(sourceHtml, 'featured', archive.featuredHtml);
  nextHtml = replaceMarkerBlock(nextHtml, 'archive', archive.archiveHtml + archive.noScriptHtml);
  return nextHtml;
}

module.exports = {
  buildBlogArchive,
  renderBlogArchivePage,
  validateFeaturedSlugs,
  validatePosts
};
