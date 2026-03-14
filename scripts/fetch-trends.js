/**
 * fetch-trends.js
 * 抓取各平台热点数据，写入 tools/trends/data/trends.json
 *
 * 用法：
 *   cd scripts
 *   node fetch-trends.js
 *
 * 数据来源：
 *   - GitHub Trending（抓取 HTML）
 *   - Hacker News（官方 API）
 *   - Product Hunt（抓取 HTML）
 *   - 出海 AI 动态（GitHub Trending AI 专项）
 *   - 36Kr AI 频道（抓取 HTML）
 */

const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');
const cheerio = require('cheerio');

const OUTPUT_PATH = path.resolve(__dirname, '../tools/trends/data/trends.json');

// ── 工具函数 ──────────────────────────────────────────────────────────────────

async function fetchHtml(url) {
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
    },
    timeout: 15000,
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.text();
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function truncate(str, max = 60) {
  if (!str) return '';
  str = str.trim().replace(/\s+/g, ' ');
  return str.length > max ? str.slice(0, max - 1) + '…' : str;
}

// ── GitHub Trending ───────────────────────────────────────────────────────────

async function fetchGithubTrending(since = 'weekly', lang = '') {
  const url = `https://github.com/trending${lang ? `/${lang}` : ''}?since=${since}`;
  console.log(`  抓取 GitHub Trending: ${url}`);
  const html = await fetchHtml(url);
  const $ = cheerio.load(html);
  const items = [];

  $('article.Box-row').each((i, el) => {
    if (items.length >= 6) return;
    const $el = $(el);
    const repoPath = $el.find('h2 a').attr('href')?.trim().replace(/^\//, '');
    const title = repoPath || '';
    const desc = truncate($el.find('p').first().text(), 60);
    const starsText = $el.find('a[href$="/stargazers"]').text().trim().replace(/,/g, '');
    const stars = starsText ? parseInt(starsText) || 0 : 0;
    const lang_ = $el.find('[itemprop="programmingLanguage"]').text().trim();
    const gainText = $el.find('.float-sm-right').text().trim();

    if (!title) return;
    items.push({
      rank: items.length + 1,
      title: title.split('/').pop(),
      repoPath: title,
      summary: desc || `${lang_ ? lang_ + ' · ' : ''}${stars ? stars.toLocaleString() + ' stars' : ''}`,
      insight: '',
      url: `https://github.com/${title}`,
      source: 'GitHub Trending',
      tags: [lang_ || 'Open Source', since === 'weekly' ? '周榜' : '日榜'].filter(Boolean),
      stars,
      starsGain: gainText,
    });
  });

  return items;
}

// ── Hacker News ───────────────────────────────────────────────────────────────

async function fetchHackerNews() {
  console.log('  抓取 Hacker News Top Stories...');
  const idsRes = await fetch('https://hacker-news.firebaseio.com/v0/topstories.json', { timeout: 10000 });
  const ids = await idsRes.json();
  const top = ids.slice(0, 20);

  const items = [];
  for (const id of top) {
    if (items.length >= 6) break;
    try {
      const res = await fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`, { timeout: 8000 });
      const item = await res.json();
      if (item.type !== 'story' || !item.title || !item.url) continue;
      items.push({
        rank: items.length + 1,
        title: truncate(item.title, 80),
        summary: `${item.score} points · ${item.descendants || 0} comments`,
        insight: '',
        url: item.url,
        hnUrl: `https://news.ycombinator.com/item?id=${item.id}`,
        source: 'Hacker News',
        tags: guessHNTags(item.title),
        score: item.score,
      });
    } catch (e) {
      // skip failed item
    }
  }
  return items;
}

function guessHNTags(title) {
  const t = title.toLowerCase();
  const tags = [];
  if (t.includes('ai') || t.includes('llm') || t.includes('gpt') || t.includes('claude') || t.includes('model')) tags.push('AI');
  if (t.includes('rust') || t.includes('python') || t.includes('go ') || t.includes('typescript')) tags.push('编程');
  if (t.includes('security') || t.includes('vuln') || t.includes('hack')) tags.push('安全');
  if (t.includes('open source') || t.includes('github')) tags.push('开源');
  if (t.includes('startup') || t.includes('launch') || t.includes('yc')) tags.push('创业');
  return tags.slice(0, 3).length ? tags.slice(0, 3) : ['技术'];
}

// ── Product Hunt ──────────────────────────────────────────────────────────────

async function fetchProductHunt() {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth() + 1;
  const url = `https://www.producthunt.com/leaderboard/monthly/${y}/${m}`;
  console.log(`  抓取 Product Hunt 月榜: ${url}`);
  const html = await fetchHtml(url);
  const $ = cheerio.load(html);
  const items = [];

  // PH 的结构：每个产品在 data-test="post-item" 或类似选择器
  $('[data-test="post-item"], .styles_item__Dk_nz, article').each((i, el) => {
    if (items.length >= 6) return;
    const $el = $(el);
    const title = truncate($el.find('h3, h2, [class*="title"], [class*="name"]').first().text(), 60);
    const desc = truncate($el.find('p, [class*="tagline"], [class*="description"]').first().text(), 80);
    const href = $el.find('a[href^="/posts/"]').attr('href');
    if (!title || title.length < 2) return;
    items.push({
      rank: items.length + 1,
      title,
      summary: desc || '暂无描述',
      insight: '',
      url: href ? `https://www.producthunt.com${href}` : url,
      source: 'Product Hunt',
      tags: ['新产品', '本月'],
    });
  });

  // fallback：如果选择器没匹配到（PH 频繁改结构），返回榜单页链接占位
  if (items.length === 0) {
    console.log('  ⚠ Product Hunt 解析失败（页面结构可能已变），使用榜单页链接');
    items.push({
      rank: 1,
      title: `Product Hunt ${y}年${m}月榜`,
      summary: '点击查看本月完整榜单',
      insight: '',
      url,
      source: 'Product Hunt',
      tags: ['本月榜单'],
    });
  }

  return items;
}

// ── 36Kr AI 频道 ──────────────────────────────────────────────────────────────

async function fetch36Kr() {
  const url = 'https://36kr.com/information/AI/';
  console.log(`  抓取 36Kr AI 频道: ${url}`);
  const html = await fetchHtml(url);
  const $ = cheerio.load(html);
  const items = [];

  $('a[href*="/p/"]').each((i, el) => {
    if (items.length >= 6) return;
    const $el = $(el);
    const title = truncate($el.text(), 80);
    const href = $el.attr('href');
    if (!title || title.length < 5 || !href) return;
    // 过滤导航链接
    if (title.includes('36氪') || title.includes('首页') || title.length < 8) return;
    const fullUrl = href.startsWith('http') ? href : `https://36kr.com${href}`;
    // 去重
    if (items.some(it => it.url === fullUrl)) return;
    items.push({
      rank: items.length + 1,
      title,
      summary: '点击阅读全文',
      insight: '',
      url: fullUrl,
      source: '36Kr',
      tags: ['国内AI', '资讯'],
    });
  });

  return items;
}

// ── 出海 AI（GitHub Trending AI 英文周榜） ────────────────────────────────────

async function fetchOverseasAI() {
  console.log('  抓取出海 AI 动态（GitHub Trending AI 英文周榜）...');
  // 抓 GitHub Trending，筛选出 AI/ML 相关
  const all = await fetchGithubTrending('weekly', '');
  // 再抓一页英文 Python 项目（AI 主要语言）
  let pyItems = [];
  try {
    pyItems = await fetchGithubTrending('weekly', 'python');
  } catch (e) { /* ignore */ }

  const combined = [...all, ...pyItems];
  const aiKeywords = ['ai', 'llm', 'gpt', 'model', 'agent', 'ml', 'diffusion', 'transformer', 'rag', 'embedding', 'inference', 'vision'];
  const aiItems = combined.filter(it =>
    aiKeywords.some(kw =>
      it.title.toLowerCase().includes(kw) ||
      it.summary.toLowerCase().includes(kw)
    )
  );

  // 去重 + 重新排名
  const seen = new Set();
  const result = [];
  for (const item of aiItems) {
    if (seen.has(item.url) || result.length >= 6) continue;
    seen.add(item.url);
    result.push({ ...item, rank: result.length + 1, tags: [...(item.tags || []), 'AI'], source: 'GitHub Trending AI' });
  }

  // fallback
  if (result.length === 0) {
    result.push(...all.slice(0, 5).map((it, i) => ({ ...it, rank: i + 1, source: 'GitHub Trending AI' })));
  }

  return result;
}

// ── 主流程 ────────────────────────────────────────────────────────────────────

async function main() {
  console.log('🚀 开始抓取热点数据...\n');

  const boards = [];

  const BOARD_INTROS = {
    'github-ai': 'GitHub 本周增长最快的 AI 相关仓库，按新增 Stars 排序。反映开源社区当前最热门的技术方向。',
    'product-hunt': 'Product Hunt 本月获票最多的新产品，覆盖 AI 工具、开发者工具、效率产品等方向。数据由 Claude 搜索整理。',
    'hacker-news': 'Hacker News 当前热度最高的技术讨论，按 Points 排序。HN 社区以技术深度和高质量讨论著称，是观察全球技术趋势的风向标。',
    'overseas-ai': 'GitHub 英文 AI 项目周榜 + 海外社区热点，关注出海产品机会和国际 AI 技术动向。',
    'cn-ai': '36Kr AI 频道最新文章，聚焦国内 AI 产品、融资、创业动态，是了解国内 AI 生态的快捷窗口。',
  };

  // 1. GitHub AI 热榜
  try {
    console.log('[1/5] GitHub AI 热榜');
    const items = await fetchGithubTrending('weekly');
    boards.push({ id: 'github-ai', title: 'GitHub AI 热榜', icon: '⚡', intro: BOARD_INTROS['github-ai'], items });
    console.log(`  ✓ 获取 ${items.length} 条\n`);
  } catch (e) {
    console.error(`  ✗ 失败: ${e.message}\n`);
    boards.push({ id: 'github-ai', title: 'GitHub AI 热榜', icon: '⚡', intro: BOARD_INTROS['github-ai'], items: [] });
  }

  // 2. Product Hunt 本月（由 Claude 搜索填充，爬虫跳过）
  console.log('[2/5] Product Hunt 本月（由 /update-trends 更新，跳过）\n');
  boards.push({ id: 'product-hunt', title: 'Product Hunt 本月', icon: '🚀', intro: BOARD_INTROS['product-hunt'], items: [] });

  // 3. HN 热议
  try {
    console.log('[3/5] Hacker News 热议');
    const items = await fetchHackerNews();
    boards.push({ id: 'hacker-news', title: 'HN 热议', icon: '🔥', intro: BOARD_INTROS['hacker-news'], items });
    console.log(`  ✓ 获取 ${items.length} 条\n`);
  } catch (e) {
    console.error(`  ✗ 失败: ${e.message}\n`);
    boards.push({ id: 'hacker-news', title: 'HN 热议', icon: '🔥', intro: BOARD_INTROS['hacker-news'], items: [] });
  }

  // 4. 出海 AI 动态
  try {
    console.log('[4/5] 出海 AI 动态');
    const items = await fetchOverseasAI();
    boards.push({ id: 'overseas-ai', title: '出海 AI 动态', icon: '🌍', intro: BOARD_INTROS['overseas-ai'], items });
    console.log(`  ✓ 获取 ${items.length} 条\n`);
  } catch (e) {
    console.error(`  ✗ 失败: ${e.message}\n`);
    boards.push({ id: 'overseas-ai', title: '出海 AI 动态', icon: '🌍', intro: BOARD_INTROS['overseas-ai'], items: [] });
  }

  // 5. 国内 AI 热点
  try {
    console.log('[5/5] 国内 AI 热点（36Kr）');
    const items = await fetch36Kr();
    boards.push({ id: 'cn-ai', title: '国内 AI 热点', icon: '🇨🇳', intro: BOARD_INTROS['cn-ai'], items });
    console.log(`  ✓ 获取 ${items.length} 条\n`);
  } catch (e) {
    console.error(`  ✗ 失败: ${e.message}\n`);
    boards.push({ id: 'cn-ai', title: '国内 AI 热点', icon: '🇨🇳', intro: BOARD_INTROS['cn-ai'], items: [] });
  }

  const output = {
    updated_at: today(),
    boards,
  };

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(output, null, 2), 'utf-8');
  console.log(`\n✅ 写入完成：${OUTPUT_PATH}`);
  console.log(`   更新时间：${today()}`);
  boards.forEach(b => console.log(`   ${b.icon} ${b.title}：${b.items.length} 条`));
}

main().catch(err => {
  console.error('❌ 抓取失败:', err);
  process.exit(1);
});
