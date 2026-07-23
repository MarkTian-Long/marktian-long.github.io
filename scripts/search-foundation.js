function trimTrailingSlash(value) {
  return String(value || '').replace(/\/+$/, '');
}

function normalizePath(value) {
  const raw = String(value || '/').trim();
  const withSlash = raw.startsWith('/') ? raw : '/' + raw;
  const normalized = withSlash.replace(/\/{2,}/g, '/');
  return normalized || '/';
}

function joinPaths(...parts) {
  return normalizePath(parts.filter(Boolean).join('/'));
}

function absoluteUrl(siteUrl, relativePath) {
  return trimTrailingSlash(siteUrl) + normalizePath(relativePath);
}

function xmlEscape(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function htmlAttributeEscape(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function extractBody(html) {
  const match = String(html).match(/<body\b[^>]*>[\s\S]*<\/body>/i);
  if (!match) {
    throw new Error('No <body> found');
  }
  return match[0];
}

function articleUrl(config, metadata) {
  if (!metadata || !metadata.url) {
    throw new Error('Article metadata requires url');
  }
  return absoluteUrl(config.siteUrl, joinPaths(config.blog.path, metadata.url));
}

function buildRobots(config) {
  return 'User-agent: *\nAllow: /\n\n'
    + `Sitemap: ${absoluteUrl(config.siteUrl, '/sitemap.xml')}\n`;
}

function buildSitemap(config, pages) {
  const seen = new Set();
  const urls = [];
  for (const page of pages) {
    const url = absoluteUrl(config.siteUrl, page);
    if (!seen.has(url)) {
      seen.add(url);
      urls.push(url);
    }
  }

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls.map(url => `  <url><loc>${xmlEscape(url)}</loc></url>`),
    '</urlset>',
    ''
  ].join('\n');
}

function buildRss(config, posts) {
  const limit = config.blog.feedLimit || 20;
  const items = posts.slice(0, limit).map(post => {
    const url = articleUrl(config, post);
    return [
      '    <item>',
      `      <title>${xmlEscape(post.title)}</title>`,
      `      <link>${xmlEscape(url)}</link>`,
      `      <guid>${xmlEscape(url)}</guid>`,
      `      <description>${xmlEscape(post.summary)}</description>`,
      '    </item>'
    ].join('\n');
  });

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0">',
    '  <channel>',
    `    <title>${xmlEscape(config.blog.title)}</title>`,
    `    <link>${xmlEscape(absoluteUrl(config.siteUrl, config.blog.path))}</link>`,
    `    <description>${xmlEscape(config.blog.description)}</description>`,
    ...items,
    '  </channel>',
    '</rss>',
    ''
  ].join('\n');
}

function buildArticleJsonLd(config, metadata, url) {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: metadata.title,
    description: metadata.summary,
    url,
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    image: [absoluteUrl(config.siteUrl, config.blog.imagePath)],
    author: {
      '@type': 'Person',
      name: config.author.name,
      url: config.author.url
    }
  }).replace(/</g, '\\u003c');
}

function buildArticleSeoBlock(html, metadata, config) {
  const url = articleUrl(config, metadata);
  const feedUrl = absoluteUrl(config.siteUrl, config.blog.feedPath);
  const jsonLd = buildArticleJsonLd(config, metadata, url);

  return [
    '<!-- search-foundation:start -->',
    `<meta name="description" content="${htmlAttributeEscape(metadata.summary)}" />`,
    `<link rel="canonical" href="${htmlAttributeEscape(url)}" />`,
    `<link rel="alternate" type="application/rss+xml" title="${htmlAttributeEscape(config.blog.title)}" href="${htmlAttributeEscape(feedUrl)}" />`,
    `<script type="application/ld+json">${jsonLd}</script>`,
    '<!-- search-foundation:end -->'
  ].join('\n');
}

function ensureArticleSeo(sourceHtml, metadata, config) {
  const beforeBody = extractBody(sourceHtml);
  const block = buildArticleSeoBlock(sourceHtml, metadata, config);
  const markerPattern = /<!-- search-foundation:start -->[\s\S]*?<!-- search-foundation:end -->/;
  let nextHtml;

  if (markerPattern.test(sourceHtml)) {
    nextHtml = sourceHtml.replace(markerPattern, block);
  } else if (/<\/title>/i.test(sourceHtml)) {
    nextHtml = sourceHtml.replace(/<\/title>/i, match => `${match}\n${block}`);
  } else {
    throw new Error('No </title> found');
  }

  if (!/<head\b[^>]*>[\s\S]*<\/head>/i.test(nextHtml)) {
    throw new Error('No <head> found');
  }

  if (extractBody(nextHtml) !== beforeBody) {
    throw new Error('Article SEO update changed <body>');
  }

  return nextHtml;
}

module.exports = {
  absoluteUrl,
  xmlEscape,
  htmlAttributeEscape,
  extractBody,
  buildRobots,
  buildSitemap,
  buildRss,
  ensureArticleSeo,
  articleUrl
};
