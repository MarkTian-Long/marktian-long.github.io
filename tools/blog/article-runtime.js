(function (root, factory) {
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.BlogArticleRuntime = api;
  if (typeof document !== 'undefined') api.boot();
})(typeof window !== 'undefined' ? window : globalThis, function () {
  'use strict';

  var SHARED_THEME_KEY = 'blog_theme';
  var LEGACY_THEME_KEY = 'blog-theme';
  var ARTICLE_LINK_STYLESHEET = 'article-links.css';
  var REFERENCE_HEADING = '参考资料';
  var RELATION_LABELS = {
    builds_on: '承接前文', follow_up: '后续延展', revises: '修正前文',
    revised_by: '后续修正', companion: '并列阅读', same_topic: '同主题'
  };

  function dateCompare(a, b) { return String(b.date).localeCompare(String(a.date)); }
  function overlap(a, b) {
    var right = new Set(b || []);
    return (a || []).filter(function (value) { return right.has(value); }).length;
  }
  function relationLabel(type, inverse) {
    if (type === 'builds_on') return inverse ? 'follow_up' : 'builds_on';
    if (type === 'revises') return inverse ? 'revised_by' : 'revises';
    return 'companion';
  }
  function normalizedText(value) { return String(value || '').replace(/\s+/g, ' ').trim(); }
  function isReferenceHeading(value) { return normalizedText(value) === REFERENCE_HEADING; }
  function isReferenceNote(value) { return /^来源可信度(?:说明)?[：:]/.test(normalizedText(value)); }
  function isReferenceTerminator(node) {
    var id = String((node && node.id) || '');
    var className = String((node && node.className) || '');
    return id === 'continueReading' || id === 'postNav' || /(^|\s)(continue-reading|post-nav|footer-nav)(\s|$)/.test(className);
  }
  function referencePresentationRoles(nodes) {
    var active = false;
    var terminated = false;
    return (nodes || []).map(function (node) {
      if (terminated || isReferenceTerminator(node)) { terminated = true; return null; }
      var tagName = String((node && node.tagName) || '').toUpperCase();
      if (!active) {
        if (tagName === 'H2' && isReferenceHeading(node.text)) { active = true; return 'reference-heading'; }
        return null;
      }
      if (tagName === 'H3') return 'reference-group';
      if (tagName === 'UL' || tagName === 'OL') return 'reference-list';
      if (tagName === 'P') return isReferenceNote(node.text) ? 'reference-note' : 'reference-copy';
      return null;
    });
  }
  function explicitCandidates(posts, current) {
    var bySlug = new Map(posts.map(function (post) { return [post.slug, post]; }));
    var seen = new Set();
    var result = [];
    function add(slug, type, inverse, priority) {
      if (seen.has(slug) || !bySlug.has(slug)) return;
      seen.add(slug);
      result.push({ post: bySlug.get(slug), relationType: relationLabel(type, inverse), priority: priority });
    }
    (current.relations || []).forEach(function (relation, index) { add(relation.slug, relation.type, false, index); });
    posts.filter(function (post) { return post.slug !== current.slug; }).sort(dateCompare).forEach(function (post, index) {
      (post.relations || []).filter(function (relation) { return relation.slug === current.slug; })
        .forEach(function (relation) { add(post.slug, relation.type, true, 100 + index); });
    });
    return result.sort(function (a, b) { return a.priority - b.priority || dateCompare(a.post, b.post); });
  }
  function selectContinueReading(posts, currentSlug, bodyLinkedSlugs) {
    var current = posts.find(function (post) { return post.slug === currentSlug; });
    if (!current) return [];
    var bodyLinks = new Set(bodyLinkedSlugs || []);
    var selected = [];
    var repeatedBodyLink = false;
    explicitCandidates(posts, current).forEach(function (candidate) {
      if (selected.length >= 3) return;
      if (bodyLinks.has(candidate.post.slug)) {
        if (repeatedBodyLink) return;
        repeatedBodyLink = true;
      }
      selected.push(candidate);
    });
    if (selected.length >= 3) return selected;
    var selectedSlugs = new Set(selected.map(function (candidate) { return candidate.post.slug; }));
    posts.filter(function (post) {
      return post.slug !== current.slug && !selectedSlugs.has(post.slug) && !bodyLinks.has(post.slug)
        && overlap(current.topics, post.topics) > 0;
    }).map(function (post) {
      return { post: post, relationType: 'same_topic', topicOverlap: overlap(current.topics, post.topics),
        tagOverlap: overlap(current.tags, post.tags), categoryMatch: current.category === post.category ? 1 : 0 };
    }).sort(function (a, b) {
      return b.topicOverlap - a.topicOverlap || b.tagOverlap - a.tagOverlap || b.categoryMatch - a.categoryMatch || dateCompare(a.post, b.post);
    }).slice(0, 3 - selected.length).forEach(function (candidate) { selected.push(candidate); });
    return selected;
  }

  function loadArticleLinkStyles() {
    if (document.querySelector('link[data-blog-link-styles]')) return;
    var script = document.currentScript || document.querySelector('script[src$="article-runtime.js"]');
    var link = document.createElement('link');
    link.rel = 'stylesheet'; link.href = script && script.src ? new URL(ARTICLE_LINK_STYLESHEET, script.src).href : ARTICLE_LINK_STYLESHEET;
    link.setAttribute('data-blog-link-styles', ''); document.head.appendChild(link);
  }
  function readTheme() {
    try {
      var saved = localStorage.getItem(SHARED_THEME_KEY);
      if (saved !== null) return saved === 'dark' ? 'dark' : 'light';
      var legacy = localStorage.getItem(LEGACY_THEME_KEY);
      if (legacy !== null) { var migrated = legacy === 'dark' ? 'dark' : 'light'; localStorage.setItem(SHARED_THEME_KEY, migrated === 'dark' ? 'dark' : ''); localStorage.removeItem(LEGACY_THEME_KEY); return migrated; }
    } catch (error) { /* localStorage can be restricted. */ }
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  function applyTheme() { document.body.dataset.theme = readTheme(); }
  function showMetadataFallback() {
    if (document.getElementById('metadataFallback')) return;
    var header = document.querySelector('.post-header'); if (!header) return;
    var note = document.createElement('p'); note.id = 'metadataFallback'; note.setAttribute('role', 'status');
    note.style.cssText = 'margin-top:12px;font-size:.75rem;color:var(--text-2);'; note.textContent = '文章索引暂时不可用，正文仍可正常阅读。'; header.appendChild(note);
  }
  function currentSlug() { var match = location.pathname.match(/\/posts\/([^/]+)\.html$/); return match ? match[1] : ''; }
  function articleHref(post) { return post.url.split('/').pop(); }
  function bodyLinkedSlugs(posts) {
    var links = new Set(); var byPath = new Map(posts.map(function (post) { return [post.url, post.slug]; }));
    document.querySelectorAll('.post-body a[href]').forEach(function (link) {
      try { var match = new URL(link.href, location.href).pathname.match(/\/tools\/blog\/(posts\/[^/]+\.html)$/); if (match && byPath.has(match[1])) links.add(byPath.get(match[1])); } catch (error) { /* Ignore malformed links. */ }
    });
    return links;
  }
  function escapeHtml(value) { var node = document.createElement('span'); node.textContent = value; return node.innerHTML; }
  function renderTags(post) {
    var target = document.getElementById('post-tags');
    if (target) target.innerHTML = post.tags.concat(post.topics).map(function (tag) { return '<span class="tag">' + escapeHtml(tag) + '</span>'; }).join('');
  }
  function renderContinueReading(candidates) {
    var section = document.getElementById('continueReading'); var list = document.getElementById('continueReadingList');
    if (!section || !list || !candidates.length) return;
    list.innerHTML = candidates.map(function (candidate) {
      var post = candidate.post;
      return '<a class="continue-reading-item" data-analytics-source="continue_reading" data-relation-type="' + candidate.relationType + '" href="' + articleHref(post) + '"><span class="continue-reading-label">' + RELATION_LABELS[candidate.relationType] + '</span><span class="continue-reading-title">' + escapeHtml(post.title) + '</span><span class="continue-reading-date">' + escapeHtml(post.date) + '</span></a>';
    }).join(''); section.hidden = false;
  }
  function renderPostNav(posts, slug) {
    var adjacent = adjacentPosts(posts, slug);
    [[adjacent.prev, 'navPrev', 'navPrevTitle'], [adjacent.next, 'navNext', 'navNextTitle']].forEach(function (entry) {
      var post = entry[0]; var link = document.getElementById(entry[1]); var title = document.getElementById(entry[2]);
      if (!post || !link || !title) return;
      link.href = articleHref(post); link.style.display = 'flex'; link.dataset.analyticsSource = 'post_nav'; title.textContent = post.title;
    });
  }
  function referenceDescriptor(element) { return { tagName: element.tagName, id: element.id, className: element.className, text: element.textContent }; }
  function applyReferenceRoles(elements) {
    referencePresentationRoles(elements.map(referenceDescriptor)).forEach(function (role, index) {
      if (role) elements[index].classList.add(role);
    });
  }
  function applyReferencePresentation() {
    document.querySelectorAll('.post-body .refs').forEach(function (section) {
      var heading = section.querySelector('h2');
      if (!heading || !isReferenceHeading(heading.textContent)) return;
      section.classList.add('reference-section');
      applyReferenceRoles(Array.prototype.slice.call(section.children));
    });
    document.querySelectorAll('.post-body > h2').forEach(function (heading) {
      if (!isReferenceHeading(heading.textContent) || (heading.parentElement && heading.parentElement.classList.contains('refs'))) return;
      var elements = [heading];
      var current = heading.nextElementSibling;
      while (current && !isReferenceTerminator(referenceDescriptor(current))) { elements.push(current); current = current.nextElementSibling; }
      heading.classList.add('reference-section');
      applyReferenceRoles(elements);
    });
  }
  function installReferencePresentationStyles() {
    if (document.getElementById('referencePresentationStyles')) return;
    var style = document.createElement('style'); style.id = 'referencePresentationStyles';
    style.textContent = [
      '.post-body .refs.reference-section{margin-top:2.5rem!important;padding-top:1.25rem!important;border-top:1px solid var(--border)!important}',
      '.post-body>h2.reference-section{margin:2.5rem 0 .75rem!important;padding:1.25rem 0 0!important;border-top:1px solid var(--border)!important;border-left:0!important}',
      '.post-body .reference-section .reference-heading,.post-body>h2.reference-heading{padding-left:0!important;border-left:0!important;color:var(--text-2)!important;font-size:.8125rem!important;font-weight:600!important;line-height:1.4!important;letter-spacing:.06em;text-transform:uppercase;margin:0 0 .75rem!important}',
      '.post-body .reference-section .reference-group,.post-body>.reference-group{color:var(--text-2)!important;font-size:.75rem!important;font-weight:600!important;line-height:1.4!important;margin:.875rem 0 .5rem!important}',
      '.post-body .reference-section .reference-list,.post-body>.reference-list{margin:0 0 1rem!important;padding-left:0!important;list-style:none!important}',
      '.post-body .reference-section .reference-list li,.post-body>.reference-list li{color:var(--text-2)!important;font-size:.75rem!important;line-height:1.6!important;margin-bottom:.375rem!important}',
      '.post-body .reference-section .reference-copy,.post-body>.reference-copy{color:var(--text-2)!important;font-size:.75rem!important;line-height:1.6!important;margin:0 0 1rem!important}',
      '.post-body .reference-section .reference-note,.post-body>.reference-note{color:var(--text-2)!important;font-size:.75rem!important;line-height:1.6!important;margin:.875rem 0 0!important;padding-top:.625rem!important;border-top:1px solid var(--border)!important}',
      '.post-body .reference-section a,.post-body>.reference-list a,.post-body>.reference-copy a,.post-body>.reference-note a{color:var(--text-2)!important;text-decoration:none!important}',
      '.post-body .reference-section a:hover,.post-body>.reference-list a:hover,.post-body>.reference-copy a:hover,.post-body>.reference-note a:hover{color:var(--clay)!important;text-decoration:underline!important;text-underline-offset:.16em}'
    ].join('');
    document.head.appendChild(style);
  }
  function adjacentPosts(posts, slug) {
    var sorted = posts.slice().sort(dateCompare); var index = sorted.findIndex(function (post) { return post.slug === slug; });
    return { prev: index > 0 ? sorted[index - 1] : null, next: index >= 0 && index < sorted.length - 1 ? sorted[index + 1] : null };
  }
  function installStyles() {
    if (document.getElementById('continueReadingStyles')) return;
    var style = document.createElement('style'); style.id = 'continueReadingStyles';
    style.textContent = '.continue-reading{margin-top:2.5rem;padding-top:1.5rem;border-top:1px solid var(--border)}.continue-reading-heading{font-size:.75rem;letter-spacing:.08em;text-transform:uppercase;color:var(--text-2);margin:0 0 1rem}.continue-reading-item{display:grid;grid-template-columns:auto minmax(0,1fr) auto;gap:.4rem .75rem;align-items:baseline;padding:.55rem 0;text-decoration:none}.continue-reading-label{font-size:.72rem;color:var(--clay);white-space:nowrap}.continue-reading-title{font-size:.9rem;color:var(--text-1)}.continue-reading-date{font-size:.75rem;color:var(--text-2);white-space:nowrap}.continue-reading-item:hover .continue-reading-title,.continue-reading-item:focus-visible .continue-reading-title{color:var(--clay)}.continue-reading-item:focus-visible{outline:2px solid var(--clay);outline-offset:3px;border-radius:3px}@media(max-width:600px){.continue-reading-item{grid-template-columns:1fr auto;gap:.25rem .55rem}.continue-reading-label{grid-column:1/-1}.continue-reading-title{min-width:0}}'; document.head.appendChild(style);
  }
  function initializeNavigation() {
    var slug = currentSlug(); if (!slug || !window.fetch) return;
    fetch('../data/posts-meta.json').then(function (response) { if (!response.ok) throw new Error('文章索引请求失败'); return response.json(); }).then(function (data) {
      var posts = data.posts || []; var current = posts.find(function (post) { return post.slug === slug; }); if (!current) return;
      renderTags(current); renderContinueReading(selectContinueReading(posts, slug, bodyLinkedSlugs(posts))); renderPostNav(posts, slug);
    }).catch(showMetadataFallback);
  }
  function boot() { loadArticleLinkStyles(); applyTheme(); installStyles(); installReferencePresentationStyles(); document.addEventListener('DOMContentLoaded', function () { window.setTimeout(function () { applyTheme(); applyReferencePresentation(); initializeNavigation(); }, 0); }); }
  return { RELATION_LABELS: RELATION_LABELS, explicitCandidates: explicitCandidates, selectContinueReading: selectContinueReading, relationLabel: relationLabel, adjacentPosts: adjacentPosts, isReferenceHeading: isReferenceHeading, referencePresentationRoles: referencePresentationRoles, boot: boot };
});
