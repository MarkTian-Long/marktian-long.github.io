const { resolvePostCover } = require('./blog-image-contract');

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
  const text = String(value ?? '');
  if (/[\u0000-\u0008\u000B\u000C\u000E-\u001F\uFFFE\uFFFF]/.test(text)) {
    throw new Error('Value contains characters forbidden by XML 1.0');
  }
  for (let index = 0; index < text.length; index++) {
    const codeUnit = text.charCodeAt(index);
    if (codeUnit >= 0xD800 && codeUnit <= 0xDBFF) {
      const nextCodeUnit = text.charCodeAt(index + 1);
      if (!(nextCodeUnit >= 0xDC00 && nextCodeUnit <= 0xDFFF)) {
        throw new Error('Value contains an unpaired UTF-16 surrogate forbidden by XML 1.0');
      }
      index++;
    } else if (codeUnit >= 0xDC00 && codeUnit <= 0xDFFF) {
      throw new Error('Value contains an unpaired UTF-16 surrogate forbidden by XML 1.0');
    }
  }
  return text
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

function extractHead(html) {
  const match = String(html).match(/<head\b[^>]*>[\s\S]*<\/head>/i);
  if (!match) {
    throw new Error('No <head> found');
  }
  return match[0];
}

function articleUrl(config, metadata) {
  if (!metadata || !metadata.url) {
    throw new Error('Article metadata requires url');
  }
  return absoluteUrl(config.siteUrl, joinPaths(config.blog.path, metadata.url));
}

function authorUrl(config) {
  return config.author.url || absoluteUrl(config.siteUrl, '/');
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

function resolveArticleImage(config, metadata) {
  const cover = resolvePostCover(metadata, config);
  return {
    url: absoluteUrl(config.siteUrl, cover.src),
    alt: cover.alt,
    width: cover.width,
    height: cover.height,
  };
}

function buildArticleJsonLd(config, metadata, url, image = resolveArticleImage(config, metadata)) {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: metadata.title,
    description: metadata.summary,
    url,
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    image: [image.url],
    author: {
      '@type': 'Person',
      name: config.author.name,
      url: authorUrl(config)
    }
  }).replace(/</g, '\\u003c');
}

function buildArticleSeoBlock(metadata, config) {
  const url = articleUrl(config, metadata);
  const feedUrl = absoluteUrl(config.siteUrl, config.blog.feedPath);
  const image = resolveArticleImage(config, metadata);
  const jsonLd = buildArticleJsonLd(config, metadata, url, image);

  return [
    '<!-- search-foundation:start -->',
    `<meta name="description" content="${htmlAttributeEscape(metadata.summary)}" />`,
    `<link rel="canonical" href="${htmlAttributeEscape(url)}" />`,
    `<link rel="alternate" type="application/rss+xml" title="${htmlAttributeEscape(config.blog.title)}" href="${htmlAttributeEscape(feedUrl)}" />`,
    `<meta property="og:title" content="${htmlAttributeEscape(metadata.title)}" />`,
    `<meta property="og:description" content="${htmlAttributeEscape(metadata.summary)}" />`,
    `<meta property="og:url" content="${htmlAttributeEscape(url)}" />`,
    `<meta property="og:image" content="${htmlAttributeEscape(image.url)}" />`,
    `<meta property="og:image:width" content="${htmlAttributeEscape(image.width)}" />`,
    `<meta property="og:image:height" content="${htmlAttributeEscape(image.height)}" />`,
    `<meta property="og:image:alt" content="${htmlAttributeEscape(image.alt)}" />`,
    '<meta name="twitter:card" content="summary_large_image" />',
    `<meta name="twitter:title" content="${htmlAttributeEscape(metadata.title)}" />`,
    `<meta name="twitter:description" content="${htmlAttributeEscape(metadata.summary)}" />`,
    `<meta name="twitter:image" content="${htmlAttributeEscape(image.url)}" />`,
    `<meta name="twitter:image:alt" content="${htmlAttributeEscape(image.alt)}" />`,
    `<script type="application/ld+json">${jsonLd}</script>`,
    '<!-- search-foundation:end -->'
  ].join('\n');
}

function removeLinesMatching(html, patterns) {
  let next = html;
  for (const pattern of patterns) {
    next = next.replace(pattern, '');
  }
  return next;
}

function insertAfterTitle(sourceHtml, block) {
  if (!/<\/title>/i.test(sourceHtml)) {
    throw new Error('No </title> found');
  }
  return sourceHtml.replace(/<\/title>\s*/i, match => {
    const titleEnd = match.match(/<\/title>/i)[0];
    return `${titleEnd}\n${block}\n`;
  });
}

function jsonLdContainsType(value, expectedTypes) {
  if (Array.isArray(value)) {
    return value.some(item => jsonLdContainsType(item, expectedTypes));
  }
  if (!value || typeof value !== 'object') {
    return false;
  }
  const nodeTypes = Array.isArray(value['@type']) ? value['@type'] : [value['@type']];
  if (nodeTypes.some(type => expectedTypes.has(type))) {
    return true;
  }
  if (Array.isArray(value['@graph'])) {
    return value['@graph'].some(item => jsonLdContainsType(item, expectedTypes));
  }
  return false;
}

function removeJsonLdScriptsByType(sourceHtml, types) {
  const expectedTypes = new Set(types);
  return sourceHtml.replace(
    /[ \t]*<script\b(?=[^>]*\btype=["']application\/ld\+json["'])[^>]*>([\s\S]*?)<\/script>[ \t]*\r?\n?/gi,
    (script, contents) => {
      try {
        return jsonLdContainsType(JSON.parse(contents), expectedTypes) ? '' : script;
      } catch {
        const mentionsExpectedType = [...expectedTypes].some(type => (
          new RegExp(`"@type"\\s*:\\s*"${type}"`, 'i').test(contents)
        ));
        return mentionsExpectedType ? '' : script;
      }
    }
  );
}

function stripArticleSeo(sourceHtml) {
  const withoutTags = removeLinesMatching(sourceHtml, [
    /[ \t]*<!-- search-foundation:start -->[\s\S]*?<!-- search-foundation:end -->[ \t]*\r?\n?/gi,
    /[ \t]*<meta\b(?=[^>]*\bname=["']description["'])[^>]*\/?>[ \t]*\r?\n?/gi,
    /[ \t]*<link\b(?=[^>]*\brel=["']canonical["'])[^>]*\/?>[ \t]*\r?\n?/gi,
    /[ \t]*<link\b(?=[^>]*\brel=["']alternate["'])(?=[^>]*\btype=["']application\/rss\+xml["'])[^>]*\/?>[ \t]*\r?\n?/gi,
    /[ \t]*<meta\b(?=[^>]*\bproperty=["']og:(?:title|description|url|image(?::(?:width|height|alt))?)["'])[^>]*\/?>[ \t]*\r?\n?/gi,
    /[ \t]*<meta\b(?=[^>]*\bname=["']twitter:(?:card|title|description|image(?::alt)?)["'])[^>]*\/?>[ \t]*\r?\n?/gi
  ]);
  return removeJsonLdScriptsByType(withoutTags, ['BlogPosting']);
}

function ensureArticleSeo(sourceHtml, metadata, config) {
  const beforeBody = extractBody(sourceHtml);
  extractHead(sourceHtml);
  const stripped = stripArticleSeo(sourceHtml);
  const nextHtml = insertAfterTitle(stripped, buildArticleSeoBlock(metadata, config));

  if (extractBody(nextHtml) !== beforeBody) {
    throw new Error('Article SEO update changed <body>');
  }

  return nextHtml;
}

function buildEntryJsonLd(config, pageType) {
  const siteUrl = absoluteUrl(config.siteUrl, '/');
  if (pageType === 'home') {
    return JSON.stringify({
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'WebSite',
          name: config.siteName,
          url: siteUrl,
          description: config.siteDescription
        },
        {
          '@type': 'Person',
          name: config.author.name,
          url: authorUrl(config)
        }
      ]
    }).replace(/</g, '\\u003c');
  }
  if (pageType === 'blog') {
    const blogUrl = absoluteUrl(config.siteUrl, config.blog.path);
    return JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: config.blog.title,
      description: config.blog.description,
      url: blogUrl,
      isPartOf: {
        '@type': 'WebSite',
        name: config.siteName,
        url: siteUrl
      }
    }).replace(/</g, '\\u003c');
  }
  throw new Error(`Unknown entry page type: ${pageType}`);
}

function buildEntrySeoBlock(config, pageType) {
  const isHome = pageType === 'home';
  const canonical = absoluteUrl(config.siteUrl, isHome ? '/' : config.blog.path);
  const title = isHome ? config.siteName : config.blog.title;
  const description = isHome ? config.siteDescription : config.blog.description;
  const feedUrl = absoluteUrl(config.siteUrl, config.blog.feedPath);
  const jsonLd = buildEntryJsonLd(config, pageType);

  return [
    '<!-- search-foundation-entry:start -->',
    `<meta name="description" content="${htmlAttributeEscape(description)}" />`,
    `<link rel="canonical" href="${htmlAttributeEscape(canonical)}" />`,
    `<link rel="alternate" type="application/rss+xml" title="${htmlAttributeEscape(config.blog.title)}" href="${htmlAttributeEscape(feedUrl)}" />`,
    '<meta property="og:type" content="website" />',
    `<meta property="og:title" content="${htmlAttributeEscape(title)}" />`,
    `<meta property="og:description" content="${htmlAttributeEscape(description)}" />`,
    `<meta property="og:url" content="${htmlAttributeEscape(canonical)}" />`,
    `<script type="application/ld+json">${jsonLd}</script>`,
    '<!-- search-foundation-entry:end -->'
  ].join('\n');
}

function stripEntrySeo(sourceHtml, pageType) {
  const schemaTypes = pageType === 'home' ? ['WebSite', 'Person'] : ['CollectionPage'];
  const withoutTags = removeLinesMatching(sourceHtml, [
    /[ \t]*<!-- search-foundation-entry:start -->[\s\S]*?<!-- search-foundation-entry:end -->[ \t]*\r?\n?/gi,
    /[ \t]*<meta\b(?=[^>]*\bname=["']description["'])[^>]*\/?>[ \t]*\r?\n?/gi,
    /[ \t]*<link\b(?=[^>]*\brel=["']canonical["'])[^>]*\/?>[ \t]*\r?\n?/gi,
    /[ \t]*<link\b(?=[^>]*\brel=["']alternate["'])(?=[^>]*\btype=["']application\/rss\+xml["'])[^>]*\/?>[ \t]*\r?\n?/gi,
    /[ \t]*<meta\b(?=[^>]*\bproperty=["']og:(?:type|title|description|url)["'])[^>]*\/?>[ \t]*\r?\n?/gi
  ]);
  return removeJsonLdScriptsByType(withoutTags, schemaTypes);
}

function ensureEntryPageSeo(sourceHtml, pageType, config) {
  const beforeBody = extractBody(sourceHtml);
  extractHead(sourceHtml);
  const stripped = stripEntrySeo(sourceHtml, pageType);
  const nextHtml = insertAfterTitle(stripped, buildEntrySeoBlock(config, pageType));
  if (extractBody(nextHtml) !== beforeBody) {
    throw new Error('Entry SEO update changed <body>');
  }
  return nextHtml;
}

module.exports = {
  absoluteUrl,
  resolveArticleImage,
  xmlEscape,
  htmlAttributeEscape,
  extractBody,
  extractHead,
  buildRobots,
  buildSitemap,
  buildRss,
  buildArticleJsonLd,
  buildEntryJsonLd,
  ensureArticleSeo,
  ensureEntryPageSeo,
  articleUrl
};
