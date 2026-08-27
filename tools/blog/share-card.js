(function (root, factory) {
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.BlogShareCard = api;
  if (typeof document !== 'undefined') api.boot();
})(typeof window !== 'undefined' ? window : globalThis, function () {
  'use strict';

  var POSTER_WIDTH = 1080;
  var POSTER_HEIGHT = 1920;
  var QR_ERROR_CORRECTION = 'M';
  var QR_QUIET_ZONE = 4;
  var POSTER_SERIF = '"Libre Baskerville", Georgia, serif';
  var POSTER_SANS = '"Source Sans 3", -apple-system, BlinkMacSystemFont, sans-serif';

  function applyPageTheme() {
    var theme;
    try {
      var saved = localStorage.getItem('blog_theme');
      if (saved !== null) theme = saved === 'dark' ? 'dark' : 'light';
    } catch (error) { /* localStorage can be restricted. */ }
    if (!theme) theme = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    document.body.dataset.theme = theme;
  }

  function requiredText(value, label) {
    if (typeof value !== 'string' || !value.trim()) throw new Error(label + '不能为空。');
    return value.trim();
  }
  function canonicalArticleUrl(siteConfig, post) {
    var siteUrl = requiredText(siteConfig && siteConfig.siteUrl, '站点地址');
    var blogPath = requiredText(siteConfig && siteConfig.blogPath, '博客路径');
    var postUrl = requiredText(post && post.url, '文章地址');
    return new URL(postUrl, new URL(blogPath, siteUrl)).href;
  }
  function formatPosterDate(value) { return requiredText(value, '文章日期').replace('.', '/'); }
  function createPosterModel(post, siteConfig) {
    return {
      slug: requiredText(post && post.slug, '文章 slug'),
      title: requiredText(post && post.title, '文章标题'),
      summary: requiredText(post && post.summary, '文章摘要'),
      quote: requiredText(post && post.share_quote, '文章分享引语'),
      date: formatPosterDate(post && post.date),
      authorName: requiredText(siteConfig && siteConfig.authorName, '作者名'),
      articleUrl: canonicalArticleUrl(siteConfig, post)
    };
  }
  function createQrMatrix(payload, qrFactory) {
    var factory = qrFactory || (typeof qrcode === 'function' ? qrcode : null);
    if (!factory) throw new Error('二维码组件未加载。');
    var code = factory(0, QR_ERROR_CORRECTION);
    code.addData(payload, 'Byte');
    code.make();
    return {
      payload: payload,
      errorCorrection: QR_ERROR_CORRECTION,
      quietZone: QR_QUIET_ZONE,
      moduleCount: code.getModuleCount(),
      isDark: function (row, column) { return code.isDark(row, column); }
    };
  }
  function renderQrPixels(matrix, scale) {
    var moduleScale = Math.max(1, Math.floor(scale || 1));
    var totalModules = matrix.moduleCount + matrix.quietZone * 2;
    var width = totalModules * moduleScale;
    var data = new Uint8ClampedArray(width * width * 4);
    for (var y = 0; y < width; y++) {
      for (var x = 0; x < width; x++) {
        var row = Math.floor(y / moduleScale) - matrix.quietZone;
        var column = Math.floor(x / moduleScale) - matrix.quietZone;
        var dark = row >= 0 && column >= 0 && row < matrix.moduleCount && column < matrix.moduleCount && matrix.isDark(row, column);
        var index = (y * width + x) * 4;
        data[index] = dark ? 0 : 255; data[index + 1] = dark ? 0 : 255; data[index + 2] = dark ? 0 : 255; data[index + 3] = 255;
      }
    }
    return { data: data, width: width, height: width };
  }
  function textTokens(text) {
    return String(text).match(/“[^”]*”|‘[^’]*’|[A-Za-z0-9][A-Za-z0-9+._#\/'’-]*|[\s\S]/g) || [];
  }
  function splitTokenForWidth(ctx, token, maxWidth) {
    var pieces = []; var piece = '';
    Array.from(token).forEach(function (character) {
      var candidate = piece + character;
      if (piece && ctx.measureText(candidate).width > maxWidth) { pieces.push(piece); piece = character; }
      else piece = candidate;
    });
    if (piece) pieces.push(piece);
    return pieces;
  }
  function linesForWidth(ctx, text, maxWidth) {
    var lines = []; var line = '';
    textTokens(text).forEach(function (token) {
      if (!line) {
        var initial = token.replace(/^\s+/, '');
        if (!initial) return;
        if (ctx.measureText(initial).width > maxWidth) {
          var initialPieces = splitTokenForWidth(ctx, initial, maxWidth);
          lines = lines.concat(initialPieces.slice(0, -1)); line = initialPieces[initialPieces.length - 1] || '';
        } else line = initial;
        return;
      }
      if (ctx.measureText(line + token).width <= maxWidth) { line += token; return; }
      var completed = line.replace(/\s+$/, '');
      if (completed) lines.push(completed);
      var next = token.replace(/^\s+/, '');
      if (!next) { line = ''; return; }
      if (ctx.measureText(next).width > maxWidth) {
        var pieces = splitTokenForWidth(ctx, next, maxWidth);
        lines = lines.concat(pieces.slice(0, -1)); line = pieces[pieces.length - 1] || '';
      } else line = next;
    });
    var finalLine = line.replace(/\s+$/, '');
    if (finalLine) lines.push(finalLine);
    return lines;
  }
  function fitText(ctx, options) {
    for (var size = options.maxSize; size >= options.minSize; size--) {
      ctx.font = options.weight + ' ' + size + 'px ' + options.font;
      var lines = linesForWidth(ctx, options.text, options.maxWidth);
      var lineHeight = Math.round(size * options.leading);
      var height = lines.length * lineHeight;
      if (lines.length <= options.maxLines && (!options.maxHeight || height <= options.maxHeight)) return { size: size, lines: lines, lineHeight: lineHeight, height: height };
    }
    throw new Error(options.label + '过长，无法在海报中完整排版。');
  }
  function roundedRect(ctx, x, y, width, height, radius) {
    var corner = Math.min(radius, width / 2, height / 2);
    ctx.beginPath(); ctx.moveTo(x + corner, y); ctx.arcTo(x + width, y, x + width, y + height, corner); ctx.arcTo(x + width, y + height, x, y + height, corner); ctx.arcTo(x, y + height, x, y, corner); ctx.arcTo(x, y, x + width, y, corner); ctx.closePath();
  }
  function drawLines(ctx, lines, x, y, lineHeight) {
    lines.forEach(function (line, index) { ctx.fillText(line, x, y + index * lineHeight); });
  }
  function drawQr(ctx, matrix, x, y, size, colors) {
    var totalModules = matrix.moduleCount + matrix.quietZone * 2;
    var moduleSize = Math.floor(size / totalModules);
    var renderedSize = moduleSize * totalModules;
    var offsetX = x + Math.floor((size - renderedSize) / 2);
    var offsetY = y + Math.floor((size - renderedSize) / 2);
    ctx.fillStyle = colors.paper; ctx.fillRect(x, y, size, size);
    ctx.fillStyle = colors.qr;
    for (var row = 0; row < matrix.moduleCount; row++) for (var column = 0; column < matrix.moduleCount; column++) {
      if (matrix.isDark(row, column)) ctx.fillRect(offsetX + (column + matrix.quietZone) * moduleSize, offsetY + (row + matrix.quietZone) * moduleSize, moduleSize, moduleSize);
    }
  }
  function readTheme() {
    var style = typeof getComputedStyle === 'function' && typeof document !== 'undefined' ? getComputedStyle(document.documentElement) : null;
    function color(name, fallback) { return style && style.getPropertyValue(name).trim() || fallback; }
    return { ink: color('--poster-ink', '#f5f4ed'), paper: color('--poster-paper', '#faf9f5'), text: color('--poster-text', '#141413'), muted: color('--poster-muted', '#5e5d59'), accent: color('--poster-accent', '#c96442'), line: color('--poster-line', '#e8e6dc'), footerLine: color('--poster-footer-line', 'rgba(201,100,66,.68)'), quoteBg: color('--poster-quote-bg', '#f0eee6'), quoteBorder: color('--poster-quote-border', 'rgba(201,100,66,.48)'), grainLight: color('--poster-grain-light', 'rgba(255,255,255,.52)'), grainDark: color('--poster-grain-dark', 'rgba(201,100,66,.055)'), qr: color('--poster-qr', '#141413') };
  }
  function seededRandom(seedText) {
    var seed = 2166136261;
    Array.from(String(seedText)).forEach(function (character) { seed = Math.imul(seed ^ character.codePointAt(0), 16777619); });
    return function () {
      seed += 0x6D2B79F5;
      var value = seed;
      value = Math.imul(value ^ value >>> 15, value | 1);
      value ^= value + Math.imul(value ^ value >>> 7, value | 61);
      return ((value ^ value >>> 14) >>> 0) / 4294967296;
    };
  }
  function drawTexture(ctx, seedText, colors) {
    var random = seededRandom(seedText);
    for (var index = 0; index < 2200; index++) {
      ctx.fillStyle = random() > 0.44 ? colors.grainLight : colors.grainDark;
      ctx.fillRect(12 + Math.floor(random() * (POSTER_WIDTH - 24)), 12 + Math.floor(random() * (POSTER_HEIGHT - 24)), random() > 0.82 ? 2 : 1, random() > 0.9 ? 2 : 1);
    }
  }
  function drawMasthead(ctx, model, colors) {
    var firstName = model.authorName.split(/\s+/)[0];
    ctx.fillStyle = colors.accent; ctx.font = 'italic 400 54px ' + POSTER_SERIF; ctx.fillText(firstName, 96, 150);
    var firstNameWidth = ctx.measureText(firstName).width;
    ctx.fillStyle = colors.text; ctx.font = '400 50px ' + POSTER_SERIF; ctx.fillText(' 的博客', 102 + firstNameWidth, 150);
  }
  function drawPoster(canvas, model, qrFactory) {
    if (!canvas || canvas.width !== POSTER_WIDTH || canvas.height !== POSTER_HEIGHT) throw new Error('海报画布尺寸必须为 1080 × 1920。');
    var ctx = canvas.getContext('2d'); if (!ctx) throw new Error('当前浏览器不支持 Canvas。');
    var colors = readTheme(); var qr = createQrMatrix(model.articleUrl, qrFactory);
    ctx.fillStyle = colors.ink; ctx.fillRect(0, 0, POSTER_WIDTH, POSTER_HEIGHT);
    drawTexture(ctx, model.slug, colors);
    drawMasthead(ctx, model, colors);
    ctx.fillStyle = colors.muted; ctx.font = '400 30px ' + POSTER_SANS; ctx.fillText('写于 ' + model.date, 96, 218);
    ctx.fillStyle = colors.text;
    var title = fitText(ctx, { text: model.title, maxWidth: 900, maxLines: 3, maxSize: 72, minSize: 42, leading: 1.28, weight: '700', font: POSTER_SERIF, label: '文章标题' });
    var titleY = 368;
    ctx.font = '700 ' + title.size + 'px ' + POSTER_SERIF; drawLines(ctx, title.lines, 96, titleY, title.lineHeight);
    var titleRuleY = Math.max(552, titleY + (title.lines.length - 1) * title.lineHeight + 74);
    ctx.strokeStyle = colors.footerLine; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(96, titleRuleY); ctx.lineTo(202, titleRuleY); ctx.stroke();

    ctx.fillStyle = colors.muted;
    var summaryY = titleRuleY + 100;
    var summary = fitText(ctx, { text: model.summary, maxWidth: 870, maxLines: 6, maxSize: 34, minSize: 20, leading: 1.58, weight: '400', font: POSTER_SANS, label: '文章摘要' });
    ctx.font = '400 ' + summary.size + 'px ' + POSTER_SANS; drawLines(ctx, summary.lines, 96, summaryY, summary.lineHeight);

    var quoteY = Math.max(1100, summaryY + summary.height + 88);
    var quote = fitText(ctx, { text: model.quote, maxWidth: 700, maxLines: 5, maxSize: 52, minSize: 28, maxHeight: 300, leading: 1.38, weight: '700', font: POSTER_SERIF, label: '分享引语' });
    var quoteBox = { x: 72, y: quoteY, width: 936, height: Math.max(330, quote.height + 144) };
    ctx.fillStyle = colors.quoteBg; roundedRect(ctx, quoteBox.x, quoteBox.y, quoteBox.width, quoteBox.height, 32); ctx.fill();
    ctx.strokeStyle = colors.quoteBorder; ctx.lineWidth = 2; roundedRect(ctx, quoteBox.x, quoteBox.y, quoteBox.width, quoteBox.height, 32); ctx.stroke();
    ctx.fillStyle = colors.accent; ctx.font = '700 96px ' + POSTER_SERIF; ctx.fillText('“', 118, quoteBox.y + 134);
    ctx.fillStyle = colors.text;
    ctx.font = '700 ' + quote.size + 'px ' + POSTER_SERIF; drawLines(ctx, quote.lines, 202, quoteBox.y + 126, quote.lineHeight);

    var footerRuleY = quoteBox.y + quoteBox.height + 68;
    ctx.strokeStyle = colors.footerLine; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(96, footerRuleY); ctx.lineTo(984, footerRuleY); ctx.stroke();
    var authorY = footerRuleY + 76;
    ctx.fillStyle = colors.text; ctx.font = '400 28px ' + POSTER_SERIF; ctx.fillText(model.authorName, 96, authorY);
    ctx.fillStyle = colors.muted; ctx.font = '400 24px ' + POSTER_SANS; ctx.fillText('扫码阅读全文', 96, authorY + 58);
    ctx.fillStyle = colors.accent; ctx.font = '400 22px ' + POSTER_SANS; ctx.fillText(new URL(model.articleUrl).host, 96, authorY + 100);
    var hostLinkArea = { x: 96, y: authorY + 74, width: 520, height: 38 };
    var qrCard = { x: 744, y: footerRuleY + 34, size: 216 };
    roundedRect(ctx, qrCard.x, qrCard.y, qrCard.size, qrCard.size, 6); ctx.fillStyle = colors.paper; ctx.fill();
    drawQr(ctx, qr, qrCard.x + 16, qrCard.y + 16, qrCard.size - 32, colors);
    return { model: model, qr: qr, qrCard: qrCard, hostLinkArea: hostLinkArea };
  }
  function filenameFor(model) { return model.slug + '-share.png'; }
  function downloadPoster(canvas, model) {
    return new Promise(function (resolve, reject) {
      canvas.toBlob(function (blob) {
        if (!blob) return reject(new Error('PNG 生成失败。'));
        var link = document.createElement('a'); link.href = URL.createObjectURL(blob); link.download = filenameFor(model); link.click();
        window.setTimeout(function () { URL.revokeObjectURL(link.href); }, 0); resolve(blob);
      }, 'image/png');
    });
  }
  function setAccessibleText(model) {
    var target = document.getElementById('posterAccessibleText');
    if (target) target.textContent = model.title + '。' + model.quote + '。扫码可打开原文：' + model.articleUrl;
  }
  function setArticleLinks(model, poster) {
    var openArticle = document.getElementById('openArticle');
    if (openArticle) openArticle.href = model.articleUrl;
    function placeLink(id, area) {
      var link = document.getElementById(id);
      if (!link || !area) return;
      link.href = model.articleUrl;
      link.hidden = false;
      link.setAttribute('aria-label', '打开《' + model.title + '》原文');
      link.style.left = (area.x / POSTER_WIDTH * 100) + '%';
      link.style.top = (area.y / POSTER_HEIGHT * 100) + '%';
      link.style.width = (area.width / POSTER_WIDTH * 100) + '%';
      link.style.height = (area.height / POSTER_HEIGHT * 100) + '%';
    }
    placeLink('posterArticleLink', poster.qrCard && { x: poster.qrCard.x, y: poster.qrCard.y, width: poster.qrCard.size, height: poster.qrCard.size });
    placeLink('posterHostLink', poster.hostLinkArea);
  }
  function showError(error) {
    var message = document.getElementById('shareCardError'); var actions = document.getElementById('shareCardActions');
    if (message) { message.hidden = false; message.textContent = '无法生成分享图：' + error.message; }
    if (actions) actions.hidden = true;
  }
  function boot() {
    var canvas = document.getElementById('shareCard'); if (!canvas || !window.fetch) return;
    applyPageTheme();
    Promise.all([
      fetch('data/share-card-config.json', { cache: 'no-store' }).then(function (response) { if (!response.ok) throw new Error('站点配置请求失败。'); return response.json(); }),
      fetch('data/posts-meta.json', { cache: 'no-store' }).then(function (response) { if (!response.ok) throw new Error('文章索引请求失败。'); return response.json(); })
    ]).then(function (values) {
      var slug = new URLSearchParams(location.search).get('slug');
      if (!slug) throw new Error('缺少文章 slug。');
      var post = (values[1].posts || []).find(function (item) { return item.slug === slug; });
      if (!post) throw new Error('未找到对应文章。');
      var model = createPosterModel(post, values[0]);
      var returnLink = document.getElementById('returnToArticle'); if (returnLink) returnLink.href = post.url;
      return Promise.resolve(document.fonts && document.fonts.ready).then(function () { return model; });
    }).then(function (model) {
      var poster = drawPoster(canvas, model); setAccessibleText(model); setArticleLinks(model, poster); canvas.dataset.slug = model.slug;
      var button = document.getElementById('downloadPoster'); if (button) { button.disabled = false; button.addEventListener('click', function () { downloadPoster(canvas, model).catch(showError); }); }
    }).catch(showError);
  }
  return { POSTER_WIDTH: POSTER_WIDTH, POSTER_HEIGHT: POSTER_HEIGHT, QR_ERROR_CORRECTION: QR_ERROR_CORRECTION, QR_QUIET_ZONE: QR_QUIET_ZONE, canonicalArticleUrl: canonicalArticleUrl, createPosterModel: createPosterModel, createQrMatrix: createQrMatrix, renderQrPixels: renderQrPixels, linesForWidth: linesForWidth, fitText: fitText, drawPoster: drawPoster, filenameFor: filenameFor, boot: boot };
});
