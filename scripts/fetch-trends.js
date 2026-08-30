/**
 * fetch-trends.js
 * 生成候选或校验、写入逐条事实核验后的热点快照
 *
 * 用法：
 *   cd scripts
 *   node fetch-trends.js --check
 *   node fetch-trends.js --discover --candidate ..\\build\\candidate-site\\trends-candidate.json
 *   node fetch-trends.js --write --input ..\\build\\candidate-site\\trends-reviewed.json
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
const fetch = globalThis.fetch;
const {
  assertValidSnapshot,
} = require('../tools/trends/contract.js');

if (typeof fetch !== 'function') {
  throw new Error('fetch-trends.js requires Node.js 18 or later');
}

function loadCheerio() {
  // Offline check/candidate modes must run in the deployment verifier without
  // installing the HTML scraper used only by explicit --write refreshes.
  return require('cheerio');
}

function fetchWithTimeout(url, { timeout = 15000, ...options } = {}) {
  return fetch(url, { ...options, signal: AbortSignal.timeout(timeout) });
}

const OUTPUT_PATH = path.resolve(__dirname, '../tools/trends/data/trends.json');
const PUBLIC_DATA_ROOT = path.resolve(__dirname, '../tools/trends/data');
const CANDIDATE_ROOT = path.resolve(__dirname, '../build/candidate-site');
const GENERATOR_ARGS = process.argv.slice(2);
if (GENERATOR_ARGS.includes('--write') && GENERATOR_ARGS.includes('--candidate')) throw new Error('Choose exactly one generator mode');
const GENERATOR_MODE = GENERATOR_ARGS.includes('--write') ? 'write'
  : GENERATOR_ARGS.includes('--candidate') ? 'candidate' : 'check';

function optionValue(flag) {
  const index = GENERATOR_ARGS.indexOf(flag);
  if (index < 0) return null;
  const value = GENERATOR_ARGS[index + 1];
  return value && !value.startsWith('--') ? value : null;
}

function boundedFileTarget(value, root, message) {
  if (!value) throw new Error(message);
  const target = path.resolve(value);
  const relative = path.relative(root, target);
  if (!relative || relative === '..' || relative.startsWith(`..${path.sep}`) || path.isAbsolute(relative)) throw new Error(message);
  return target;
}

function candidateTarget() {
  return boundedFileTarget(optionValue('--candidate'), CANDIDATE_ROOT, 'Candidate output must stay under build/candidate-site');
}

function publicTarget(value) {
  return boundedFileTarget(value || OUTPUT_PATH, PUBLIC_DATA_ROOT, 'Public trends data target must stay under tools/trends/data');
}

function reviewedInputTarget(value) {
  return boundedFileTarget(value, CANDIDATE_ROOT, 'Reviewed input must stay under build/candidate-site');
}

function atomicWrite(target, content, fileSystem = fs) {
  const temporary = path.join(
    path.dirname(target),
    `.${path.basename(target)}.${process.pid}.${Date.now()}.tmp`,
  );
  try {
    fileSystem.mkdirSync(path.dirname(target), { recursive: true });
    fileSystem.writeFileSync(temporary, content, 'utf8');
    fileSystem.renameSync(temporary, target);
  } catch (error) {
    try {
      if (typeof fileSystem.rmSync === 'function') fileSystem.rmSync(temporary, { force: true });
      else if (typeof fileSystem.unlinkSync === 'function') fileSystem.unlinkSync(temporary);
    } catch (_) {
      // Preserve the original write failure; cleanup is best effort.
    }
    throw error;
  }
}

function readPublishedTrends(options = {}) {
  const raw = fs.readFileSync(OUTPUT_PATH, 'utf8');
  const published = JSON.parse(raw);
  const validation = assertValidSnapshot(published, {
    now: options.now || today(),
    requireFreshness: Boolean(options.requireFreshness),
  });
  if (validation.warnings.length) {
    validation.warnings.forEach(warning => console.warn(`⚠ ${warning}`));
  }
  return { raw, published, validation };
}

function reviewedInputPath() {
  return optionValue('--input') || (GENERATOR_ARGS[0] === '--write' && GENERATOR_ARGS[1] && !GENERATOR_ARGS[1].startsWith('--') ? GENERATOR_ARGS[1] : null);
}

function writeReviewedSnapshot(inputPath, targetPath = OUTPUT_PATH, options = {}) {
  if (!inputPath) throw new Error('Reviewed input is required; --write never fetches live data');
  const input = reviewedInputTarget(inputPath);
  const target = publicTarget(targetPath);
  const raw = fs.readFileSync(input, 'utf8');
  const snapshot = JSON.parse(raw);
  const validation = assertValidSnapshot(snapshot, {
    now: options.now || today(),
    requireFreshness: Boolean(options.requireFreshness),
  });
  assertCompleteForPublic(snapshot);
  atomicWrite(target, `${JSON.stringify(snapshot, null, 2)}\n`, options.fileSystem || fs);
  return { target, snapshot, validation };
}

// ── 工具函数 ──────────────────────────────────────────────────────────────────

async function fetchHtml(url) {
  const res = await fetchWithTimeout(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
    },
    timeout: 15000,
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.text();
}

function today(value = new Date()) {
  return new Date(value).toISOString().slice(0, 10);
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
  const $ = loadCheerio().load(html);
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
  const idsRes = await fetchWithTimeout('https://hacker-news.firebaseio.com/v0/topstories.json', { timeout: 10000 });
  const ids = await idsRes.json();
  const top = ids.slice(0, 20);

  const items = [];
  for (const [topIndex, id] of top.entries()) {
    if (items.length >= 6) break;
    try {
      const res = await fetchWithTimeout(`https://hacker-news.firebaseio.com/v0/item/${id}.json`, { timeout: 8000 });
      const item = await res.json();
      if (item.type !== 'story' || !item.title || !item.url) continue;
      items.push({
        rank: topIndex + 1,
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
  const $ = loadCheerio().load(html);
  const items = [];

  // PH 的结构：每个产品在 data-test="post-item" 或类似选择器
  $('[data-test="post-item"], .styles_item__Dk_nz, article').each((i, el) => {
    if (items.length >= 6) return;
    const $el = $(el);
    const title = truncate($el.find('h3, h2, [class*="title"], [class*="name"]').first().text(), 60);
    const desc = truncate($el.find('p, [class*="tagline"], [class*="description"]').first().text(), 80);
    const href = $el.find('a[href^="/posts/"]').attr('href');
    if (!title || title.length < 2 || !href) return;
    items.push({
      rank: items.length + 1,
      title,
      summary: desc || '暂无描述',
      insight: '',
      url: `https://www.producthunt.com${href}`,
      source: 'Product Hunt',
      tags: ['新产品', '本月'],
    });
  });

  // 解析失败不生成榜单页占位项；候选输出会记录诊断状态，等待结构检查与事实核验。
  if (items.length === 0) {
    console.log('  ⚠ Product Hunt 解析失败（页面结构可能已变），不生成占位项');
  }

  return items;
}

// ── 36Kr AI 频道 ──────────────────────────────────────────────────────────────

async function fetch36Kr() {
  const url = 'https://36kr.com/information/AI/';
  console.log(`  抓取 36Kr AI 频道: ${url}`);
  const html = await fetchHtml(url);
  const $ = loadCheerio().load(html);
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

// ── 候选发现与主流程 ──────────────────────────────────────────────────────────

const BOARD_CONFIG = Object.freeze([
  { id: 'github-ai', title: 'GitHub AI 热榜', icon: '⚡', intro: 'GitHub Trending 的 AI 相关仓库候选，记录来源周榜与新增 Stars 口径。', source_id: 'source-github', source_name: 'GitHub Trending', source_url: 'https://github.com/trending?since=weekly', ranking_basis: '按来源周榜的新增 Stars 排序；不同平台不直接横比', collect: () => fetchGithubTrending('weekly') },
  { id: 'product-hunt', title: 'Product Hunt 本月', icon: '🚀', intro: 'Product Hunt 月榜候选，记录来源页面当时的产品票数口径。', source_id: 'source-product-hunt', source_name: 'Product Hunt', source_url: 'https://www.producthunt.com/leaderboard/monthly', ranking_basis: '按来源月榜的票数排序；历史榜单不代表当前产品热度', collect: () => fetchProductHunt() },
  { id: 'hacker-news', title: 'HN 热议', icon: '🔥', intro: 'Hacker News Top Stories 候选，保留 API 返回顺序并展示每条 story 的 Points。', source_id: 'source-hacker-news', source_name: 'Hacker News Top Stories', source_url: 'https://hacker-news.firebaseio.com/v0/topstories.json', ranking_basis: '按 Hacker News Top Stories API 返回顺序记录；展示 Points，不等于产品验证', candidateMetric: item => ({ label: 'Points（候选）', value: `${Number(item.score) || 0} points`, definition: '按 Hacker News Top Stories API 返回顺序记录；Points 仅表示来源互动口径。', source_url: item.hnUrl || item.url, caveat: '候选发现尚未结构检查与事实核验，不可直接发布。' }), collect: () => fetchHackerNews() },
  { id: 'overseas-ai', title: '出海 AI 动态', icon: '🌍', intro: '仅从 GitHub Trending 周榜筛选 AI 相关仓库候选，不外推为完整出海媒体监测。', source_id: 'source-overseas', source_name: 'GitHub Trending', source_url: 'https://github.com/trending?since=weekly', ranking_basis: '仅按 GitHub 周榜观察排序；不构成市场规模排名', collect: () => fetchOverseasAI() },
  { id: 'china-ai', title: '国内 AI 热点', icon: '🇨🇳', intro: '仅从 36Kr AI 频道整理国内 AI 资讯候选，不声明覆盖其他媒体。', source_id: 'source-china-ai', source_name: '36Kr AI 频道', source_url: 'https://36kr.com/information/AI/', ranking_basis: '仅按 36Kr AI 频道文章流与报道时间整理；不构成行业规模排名', collect: () => fetch36Kr() },
]);

function candidateItem(config, item, index, observedAt) {
  if (!item || typeof item.title !== 'string' || !item.title.trim()) throw new Error('candidate item has no title');
  if (typeof item.url !== 'string' || !/^https:\/\//i.test(item.url)) throw new Error('candidate item has no HTTPS URL');
  const sourceRank = Number.isInteger(item.rank) && item.rank > 0 ? item.rank : index + 1;
  const summary = typeof item.summary === 'string' && item.summary.trim() ? item.summary : '候选发现，等待结构检查与事实核验。';
  const metric = typeof config.candidateMetric === 'function'
    ? config.candidateMetric(item, sourceRank)
    : {
      label: '来源排名（候选）',
      value: String(sourceRank),
      definition: '自动抓取到的来源排名，只用于结构检查与事实核验候选，不代表公开热度结论。',
      source_url: item.url,
      caveat: '候选发现尚未结构检查与事实核验，不可直接发布。',
    };
  return {
    id: `candidate-${config.id}-${String(index + 1).padStart(2, '0')}`,
    rank: sourceRank,
    title: item.title,
    summary,
    url: item.url,
    source_id: config.source_id,
    observed_at: observedAt,
    verification_level: 'candidate',
    actions: ['watch'],
    tags: Array.isArray(item.tags) ? item.tags : [],
    metrics: [{
      ...metric,
      kind: 'external-research',
      as_of: observedAt,
      source_url: metric.source_url || item.url,
      caveat: metric.caveat || '候选发现尚未结构检查与事实核验，不可直接发布。',
    }],
    judgment: {
      change: summary,
      evidence: [summary],
      impact: '候选信号可能值得加入后续人工研究队列。',
      uncertainty: '自动抓取没有验证事实、时间范围、热度口径或因果关系。',
      next_step: '打开具体来源，核对条目、时间与排名依据，再决定是否写入公开快照。',
    },
  };
}

function candidateBoard(config, items, observedAt, diagnostics = []) {
  return {
    id: config.id,
    title: config.title,
    icon: config.icon,
    intro: config.intro,
    ranking_basis: config.ranking_basis,
    source: { id: config.source_id, name: config.source_name, url: config.source_url, as_of: observedAt },
    status: items.length > 0 ? 'ready' : 'failed',
    diagnostics,
    items,
  };
}

async function discoverCandidate({ now = new Date() } = {}) {
  const observedAt = today(now);
  const boards = [];
  for (const config of BOARD_CONFIG) {
    try {
      console.log(`[candidate] ${config.title}`);
      const discovered = await config.collect();
      const diagnostics = [];
      const items = [];
      for (const [index, item] of discovered.entries()) {
        try {
          items.push(candidateItem(config, item, index, observedAt));
        } catch (error) {
          diagnostics.push({ code: 'invalid_candidate', message: error.message });
        }
      }
      if (items.length === 0) diagnostics.push({ code: 'empty_result', message: '没有可供结构检查与事实核验的具体条目；未生成榜单页占位项。' });
      boards.push(candidateBoard(config, items, observedAt, diagnostics));
    } catch (error) {
      boards.push(candidateBoard(config, [], observedAt, [{ code: 'fetch_failed', message: error.message }]));
      console.error(`  ✗ ${config.title}: ${error.message}`);
    }
  }
  const candidate = {
    contract_version: 2,
    snapshot_id: `candidate-${observedAt}`,
    snapshot_status: 'candidate',
    as_of: observedAt,
    observed_at: observedAt,
    collection_mode: 'candidate',
    verification_level: 'candidate',
    review_scope: 'candidate',
    facts_verified_at: null,
    boards,
    method: {
      collection_boundary: '自动发现仅生成候选；候选须先完成结构检查，再逐条事实核验，公开写入前必须通过完整 JSON 门禁。',
      evidence_policy: '候选摘要是来源记录，不是独立事实证据。',
    },
  };
  const validation = require('../tools/trends/contract.js').assertValidCandidate(candidate, { now: observedAt });
  return { candidate, validation };
}

function assertCompleteForPublic(snapshot) {
  if (!Array.isArray(snapshot.boards) || snapshot.boards.some(board => !Array.isArray(board.items) || board.items.length === 0)) {
    throw new Error('Refusing partial trends result with an empty board');
  }
  if (snapshot.review_scope !== 'facts_verified'
    || snapshot.collection_mode !== 'manual_fact_reviewed'
    || snapshot.verification_level !== 'manual_fact_reviewed'
    || !snapshot.facts_verified_at) {
    throw new Error('Public trends write requires a fact-verified snapshot: review_scope=facts_verified, manual_fact_reviewed, and facts_verified_at');
  }
}

async function main() {
  const requireFreshness = GENERATOR_ARGS.includes('--freshness');
  if (GENERATOR_MODE === 'check') {
    const result = readPublishedTrends({ requireFreshness });
    const freshness = result.validation.freshness;
    console.log(`✓ check: published trends artifact is structurally complete (${freshness.label}, age=${freshness.age_days}d)`);
    return;
  }
  if (GENERATOR_MODE === 'candidate') {
    const target = candidateTarget();
    if (GENERATOR_ARGS.includes('--discover')) {
      const result = await discoverCandidate();
      atomicWrite(target, `${JSON.stringify(result.candidate, null, 2)}\n`);
      console.log(`✓ candidate discovery: ${target}`);
      return;
    }
    const { raw } = readPublishedTrends({ requireFreshness });
    atomicWrite(target, raw);
    console.log(`✓ candidate copy: ${target}`);
    return;
  }
  if (GENERATOR_MODE === 'write') {
    const result = writeReviewedSnapshot(reviewedInputPath(), optionValue('--target') || OUTPUT_PATH, { requireFreshness });
    result.validation.warnings.forEach(warning => console.warn(`⚠ ${warning}`));
    console.log(`✓ reviewed snapshot written: ${result.target}`);
    return;
  }
  throw new Error(`Unsupported generator mode: ${GENERATOR_MODE}`);
}

module.exports = {
  OUTPUT_PATH,
  CANDIDATE_ROOT,
  PUBLIC_DATA_ROOT,
  BOARD_CONFIG,
  candidateItem,
  candidateBoard,
  discoverCandidate,
  readPublishedTrends,
  writeReviewedSnapshot,
  boundedFileTarget,
  atomicWrite,
};

if (require.main === module || (process.argv[1] && path.resolve(process.argv[1]) === __filename)) {
  main().catch(err => {
    console.error('❌ 抓取失败:', err);
    process.exit(1);
  });
}
