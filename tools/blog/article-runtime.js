(function () {
  'use strict';

  var SHARED_THEME_KEY = 'blog_theme';
  var LEGACY_THEME_KEY = 'blog-theme';
  var META_FILE_NAME = 'posts-meta.json';

  function readTheme() {
    try {
      var saved = localStorage.getItem(SHARED_THEME_KEY);
      if (saved !== null) return saved === 'dark' ? 'dark' : 'light';

      var legacy = localStorage.getItem(LEGACY_THEME_KEY);
      if (legacy !== null) {
        var migrated = legacy === 'dark' ? 'dark' : 'light';
        localStorage.setItem(SHARED_THEME_KEY, migrated === 'dark' ? 'dark' : '');
        localStorage.removeItem(LEGACY_THEME_KEY);
        return migrated;
      }
    } catch (error) {
      // localStorage can be unavailable in private or restricted contexts.
    }

    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  }

  function applyTheme() {
    document.body.dataset.theme = readTheme();
  }

  function isMetadataRequest(input) {
    var url = typeof input === 'string' ? input : input && input.url;
    return typeof url === 'string' && url.indexOf(META_FILE_NAME) !== -1;
  }

  function showMetadataFallback() {
    if (document.getElementById('metadataFallback')) return;

    var header = document.querySelector('.post-header');
    if (!header) return;

    var note = document.createElement('p');
    note.id = 'metadataFallback';
    note.setAttribute('role', 'status');
    note.style.cssText = 'margin-top:12px;font-size:.75rem;color:var(--text-2);';
    note.textContent = '文章索引暂时不可用，正文仍可正常阅读。';
    header.appendChild(note);
  }

  var nativeFetch = window.fetch;
  if (typeof nativeFetch === 'function') {
    window.fetch = function (input, init) {
      if (!isMetadataRequest(input)) return nativeFetch.apply(window, arguments);

      return nativeFetch.call(window, input, init)
        .then(function (response) {
          if (!response.ok) throw new Error('文章索引请求失败');
          return response;
        })
        .catch(function () {
          showMetadataFallback();
          return {
            json: function () {
              return Promise.resolve({ posts: [] });
            }
          };
        });
    };
  }

  applyTheme();
  document.addEventListener('DOMContentLoaded', function () {
    window.setTimeout(applyTheme, 0);
  });
})();
