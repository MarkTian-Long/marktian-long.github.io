'use strict';

const { absoluteUrl, articleUrl, validateToolPages } = require('./search-foundation');

function escapeMarkdownText(value) {
  return String(value == null ? '' : value)
    .replace(/\\/g, '\\\\')
    .replace(/\[/g, '\\[')
    .replace(/\]/g, '\\]')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/[\r\n]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function validatePosts(posts) {
  if (!Array.isArray(posts)) throw new Error('LLM index posts must be an array');
  const bySlug = new Map();
  for (const post of posts) {
    if (!post || typeof post !== 'object' || Array.isArray(post)) {
      throw new Error('Each LLM index post must be an object');
    }
    for (const field of ['slug', 'title', 'summary', 'date', 'url']) {
      if (typeof post[field] !== 'string' || !post[field].trim()) {
        throw new Error('LLM index post ' + field + ' must be a non-empty string');
      }
    }
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(post.slug)
      || post.url !== 'posts/' + post.slug + '.html') {
      throw new Error('Invalid LLM index article identity: ' + post.slug);
    }
    if (bySlug.has(post.slug)) throw new Error('Duplicate LLM index article slug: ' + post.slug);
    bySlug.set(post.slug, post);
  }
  return bySlug;
}

function validateFeaturedSlugs(featuredSlugs, postsBySlug) {
  if (!Array.isArray(featuredSlugs)) throw new Error('LLM index featured slugs must be an array');
  const seen = new Set();
  const posts = [];
  for (const slug of featuredSlugs) {
    if (typeof slug !== 'string' || !slug.trim()) {
      throw new Error('LLM index featured slug must be a non-empty string');
    }
    if (seen.has(slug)) throw new Error('Duplicate LLM index featured slug: ' + slug);
    if (!postsBySlug.has(slug)) throw new Error('Unknown LLM index featured slug: ' + slug);
    seen.add(slug);
    posts.push(postsBySlug.get(slug));
  }
  return posts;
}

function validatePublicProjects(projects) {
  if (!Array.isArray(projects)) throw new Error('publicProjects must be an array');
  const seen = new Set();
  for (const project of projects) {
    if (!project || typeof project !== 'object' || Array.isArray(project)) {
      throw new Error('Each public project must be an object');
    }
    for (const field of ['name', 'url', 'description']) {
      if (typeof project[field] !== 'string' || !project[field].trim()) {
        throw new Error('Public project ' + field + ' must be a non-empty string');
      }
    }
    if (typeof project.featured !== 'boolean') {
      throw new Error('Public project featured must be a boolean: ' + project.name);
    }
    let parsed;
    try {
      parsed = new URL(project.url);
    } catch {
      throw new Error('Invalid public GitHub project URL: ' + project.url);
    }
    const segments = parsed.pathname.split('/').filter(Boolean);
    if (parsed.protocol !== 'https:' || parsed.hostname !== 'github.com'
      || parsed.search || parsed.hash || segments.length !== 2
      || segments[0] !== 'MarkTian-Long'
      || !/^[A-Za-z0-9._-]+$/.test(segments[1])) {
      throw new Error('Only explicitly curated MarkTian-Long public repository URLs are allowed: ' + project.url);
    }
    const normalizedUrl = parsed.origin + '/' + segments.join('/');
    if (normalizedUrl !== project.url.replace(/\/+$/, '')) {
      throw new Error('Public GitHub project URL must be canonical: ' + project.url);
    }
    if (seen.has(normalizedUrl)) throw new Error('Duplicate public GitHub project URL: ' + normalizedUrl);
    seen.add(normalizedUrl);
  }
  return projects;
}

function buildLlmsIndex(config, posts, featuredSlugs) {
  if (!config || typeof config.siteUrl !== 'string' || !config.siteUrl.trim()) {
    throw new Error('LLM index requires a siteUrl');
  }
  if (!config.blog || !config.author || !config.siteDescription) {
    throw new Error('LLM index requires site, blog, and author configuration');
  }
  const site = new URL(config.siteUrl);
  if (site.protocol !== 'https:') throw new Error('LLM index siteUrl must use HTTPS');

  const postsBySlug = validatePosts(posts);
  const featuredPosts = validateFeaturedSlugs(featuredSlugs, postsBySlug);
  const toolPages = validateToolPages(config.toolPages || []);
  const projects = validatePublicProjects(config.publicProjects);
  const featuredProjects = projects.filter(project => project.featured);
  const otherProjects = projects.filter(project => !project.featured);
  const categories = [...new Set(posts.map(post => post.category).filter(Boolean))];
  const topicCounts = new Map();
  for (const post of posts) {
    for (const topic of (Array.isArray(post.topics) ? post.topics : [])) {
      topicCounts.set(topic, (topicCounts.get(topic) || 0) + 1);
    }
  }
  const topics = [...topicCounts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 10)
    .map(entry => entry[0]);

  const lines = [
    '# Leo Liu — AI Builder',
    '',
    '> ' + escapeMarkdownText(config.siteDescription),
    '',
    '## Site',
    '- Homepage: ' + absoluteUrl(config.siteUrl, '/'),
    '- Blog archive: ' + absoluteUrl(config.siteUrl, config.blog.path),
    '- RSS feed: ' + absoluteUrl(config.siteUrl, config.blog.feedPath),
    '- Sitemap: ' + absoluteUrl(config.siteUrl, '/sitemap.xml'),
    '',
    '## About',
    '- Author: ' + escapeMarkdownText(config.author.name),
    '- Positioning: AI Builder.',
    '- Focus: AI 技术、产品设计、工程实践、商业与行业观察。',
    '',
    '## Content areas',
    '- Categories: ' + categories.map(escapeMarkdownText).join('、'),
    '- Topics: ' + topics.map(escapeMarkdownText).join('、'),
    '',
    '## Featured writing',
    ...(featuredPosts.length ? featuredPosts.map(post => (
      '- [' + escapeMarkdownText(post.title) + '](' + articleUrl(config, post) + ') — '
      + escapeMarkdownText(post.date) + ' · ' + escapeMarkdownText(post.summary)
    )) : ['- No featured articles are currently configured.']),
    '',
    '## Public tools',
    ...toolPages.map(tool => (
      '- [' + escapeMarkdownText(tool.title) + '](' + absoluteUrl(config.siteUrl, tool.path) + ') — '
      + escapeMarkdownText(tool.description)
    )),
    '',
    '## Featured GitHub projects',
    ...(featuredProjects.length ? featuredProjects.map(project => (
      '- [' + escapeMarkdownText(project.name) + '](' + project.url + ') — '
      + escapeMarkdownText(project.description)
    )) : ['- No featured GitHub projects are currently configured.']),
    '',
    '## Other public projects',
    ...(otherProjects.length ? otherProjects.map(project => (
      '- [' + escapeMarkdownText(project.name) + '](' + project.url + ') — '
      + escapeMarkdownText(project.description)
    )) : ['- None.']),
    '',
    '## Notes for AI systems',
    '- Site content is primarily written in Simplified Chinese.',
    '- Use each page canonical URL as its authoritative URL; the blog archive and RSS are discovery entry points.',
    '- Public tools include prototypes, static research archives, and Mock-based demonstrations. Read each page description before treating displayed data as live or production evidence.',
    '- Blog metadata records month-level dates only; do not infer a specific publication day.',
    '- This index contains explicitly curated public repositories only. Private repositories, personal configuration, credentials, and local machine paths are excluded.',
    ''
  ];
  return lines.join('\n');
}

module.exports = {
  buildLlmsIndex,
  escapeMarkdownText,
  validateFeaturedSlugs,
  validatePosts,
  validatePublicProjects
};
