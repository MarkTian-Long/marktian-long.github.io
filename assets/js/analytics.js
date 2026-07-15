/* GA4 telemetry: Measurement IDs are public identifiers, never credentials. */
(function () {
  'use strict';
  const MEASUREMENT_ID = 'G-B9RF669CGH';
  const BLOCKED_KEYS = /email|phone|name|content/i;
  window.trackAnalyticsEvent = function (eventName, params) {
    if (!/^G-[A-Z0-9]+$/.test(MEASUREMENT_ID)) return;
    const safe = Object.fromEntries(Object.entries(params || {}).filter(([key]) => !BLOCKED_KEYS.test(key)));
    window.gtag && window.gtag('event', eventName, safe);
  };
  if (!/^G-[A-Z0-9]+$/.test(MEASUREMENT_ID)) return;
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
  window.gtag('js', new Date());
  window.gtag('config', MEASUREMENT_ID);
  const tag = document.createElement('script');
  tag.async = true;
  tag.src = 'https://www.googletagmanager.com/gtag/js?id=' + MEASUREMENT_ID;
  document.head.appendChild(tag);

  document.addEventListener('click', (event) => {
    const link = event.target.closest('a');
    if (!link) return;
    const href = link.getAttribute('href') || '';
    const blog = href.match(/tools\/blog\/posts\/([^/]+)\.html|([^/]+)\.html$/);
    if (blog && (href.includes('blog/posts') || location.pathname.includes('/tools/blog/'))) {
      window.trackAnalyticsEvent('blog_article_open', { article_slug: blog[1] || blog[2], source_surface: location.pathname.includes('/tools/blog/') ? 'archive' : 'homepage' });
    } else if (href.startsWith('mailto:')) {
      window.trackAnalyticsEvent('contact_click', { contact_method: 'email' });
    } else if (href.includes('tools/')) {
      window.trackAnalyticsEvent('tool_open', { tool_name: href.split('/')[1] || 'unknown', source_surface: 'direct_link' });
    }
  });

  const match = location.pathname.match(/\/tools\/blog\/posts\/([^/]+)\.html$/);
  if (!match) return;
  const articleSlug = match[1];
  window.trackAnalyticsEvent('blog_article_view', { article_slug: articleSlug });
  const sent = new Set();
  function readDepth() {
    const max = document.documentElement.scrollHeight - innerHeight;
    const percent = max > 0 ? Math.round((scrollY / max) * 100) : 100;
    [50, 90].forEach((threshold) => {
      if (percent >= threshold && !sent.has(threshold)) {
        sent.add(threshold);
        window.trackAnalyticsEvent('blog_read_depth', { article_slug: articleSlug, percent: threshold });
      }
    });
  }
  addEventListener('scroll', readDepth, { passive: true });
  addEventListener('load', readDepth, { once: true });
})();
