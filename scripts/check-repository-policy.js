const { execFileSync } = require('node:child_process');
const path = require('node:path');

const repoRoot = path.resolve(__dirname, '..');
const { projectSkills: PROJECT_SKILLS } = require('./repository-policy.json');
const REQUIRED_IGNORE_PATTERNS = [
  '.claude/settings.local.json',
  '.claude/worktrees/',
  '.codex/',
  '.gstack/',
  '.codebuddy/',
  '.idea/',
  '.vscode/',
  '.worktrees/',
  'docs/personal/',
  'node_modules/',
  'scripts/node_modules/',
  'dist/',
  'build/',
  '/skills/',
  '.agents/*',
  '!.agents/skills/',
  '.agents/skills/*',
  '.DS_Store',
  'Thumbs.db',
  'Desktop.ini',
  '*.swp',
  '*.swo',
  '*~',
  '.env',
  '.env.*',
  '!.env.example',
  '.envrc',
  '.npmrc',
  '.pypirc',
  '.netrc',
  '*.local.*',
  'credentials.json',
  'secrets.json',
  'service-account*.json',
  '*.pem',
  '*.key',
  '*.p12',
  '*.pfx',
  'id_rsa*',
  '*.tmp',
  '*.bak',
  '*.log',
  'index-preview.html',
  'docs/blog/files.zip',
];

function normalize(filePath) {
  return filePath.replaceAll('\\', '/');
}

function runGit(args) {
  return execFileSync('git', args, {
    cwd: repoRoot,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
}

function readIndexFile(filePath) {
  return execFileSync('git', ['show', `:${filePath}`], {
    cwd: repoRoot,
    encoding: null,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
}

function listTrackedFiles() {
  return runGit(['ls-files', '-z'])
    .split('\0')
    .filter(Boolean)
    .map(normalize);
}

function listUntrackedFiles() {
  return runGit(['ls-files', '--others', '--exclude-standard', '-z'])
    .split('\0')
    .filter(Boolean)
    .map(normalize);
}

function matchesLocalOnly(filePath) {
  const normalizedPath = normalize(filePath);
  const lowerPath = normalizedPath.toLowerCase();
  const exactPaths = new Set([
    '.claude/settings.local.json',
    'index-preview.html',
    'docs/blog/files.zip',
    '.ds_store',
    'thumbs.db',
    'desktop.ini',
  ]);
  const localPrefixes = [
    '.claude/worktrees/',
    '.codex/',
    '.gstack/',
    '.codebuddy/',
    '.idea/',
    '.vscode/',
    '.worktrees/',
    'docs/personal/',
    'node_modules/',
    'scripts/node_modules/',
    'dist/',
    'build/',
    'skills/',
  ];

  if (exactPaths.has(lowerPath)) return true;
  if (localPrefixes.some((prefix) => lowerPath.startsWith(prefix))) return true;
  if (/(^|\/)\.env(?:\..+)?$/i.test(normalizedPath) && !/\.env\.example$/i.test(normalizedPath)) {
    return true;
  }
  if (/(^|\/)\.(envrc|npmrc|pypirc|netrc)$/i.test(normalizedPath)) return true;
  if (/(^|\/)id_rsa[^/]*$/i.test(normalizedPath)) return true;
  if (/\.(pem|key|p12|pfx)$/i.test(normalizedPath)) return true;
  if (/(^|\/)[^/]*\.local\.[^/]+$/i.test(normalizedPath)) return true;
  if (/(^|\/)(credentials|secrets)\.json$/i.test(normalizedPath)) return true;
  if (/(^|\/)service-account[^/]*\.json$/i.test(normalizedPath)) return true;
  if (/^docs\/[^/]+\.(docx|pdf|html)$/i.test(normalizedPath)) return true;
  if (/\.(swp|swo)$/i.test(normalizedPath)) return true;
  return /(?:\.bak(?:\..*)?|\.tmp|\.log|~)$/i.test(normalizedPath);
}

function decodeText(content) {
  if (content.length >= 2 && content[0] === 0xff && content[1] === 0xfe) {
    return content.subarray(2).toString('utf16le');
  }
  if (content.length >= 2 && content[0] === 0xfe && content[1] === 0xff) {
    const swapped = Buffer.from(content.subarray(2));
    swapped.swap16();
    return swapped.toString('utf16le');
  }

  let evenNulls = 0;
  let oddNulls = 0;
  for (let index = 0; index < content.length; index += 1) {
    if (content[index] !== 0) continue;
    if (index % 2 === 0) evenNulls += 1;
    else oddNulls += 1;
  }

  const pairs = Math.max(1, Math.floor(content.length / 2));
  if (oddNulls / pairs > 0.2 && evenNulls / pairs < 0.05) {
    return content.toString('utf16le');
  }
  if (evenNulls / pairs > 0.2 && oddNulls / pairs < 0.05) {
    const swapped = Buffer.from(content);
    if (swapped.length % 2 !== 0) return null;
    swapped.swap16();
    return swapped.toString('utf16le');
  }
  if (evenNulls + oddNulls > 0) return null;
  return content.toString('utf8');
}

function parseFrontmatter(text) {
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  if (!match) return null;

  const fields = new Map();
  for (const line of match[1].split(/\r?\n/)) {
    const field = line.match(/^([A-Za-z][A-Za-z0-9_-]*):\s*(.+)$/);
    if (field) fields.set(field[1], field[2].trim());
  }
  return fields;
}

function validateSkillFrontmatter(content, skillName, filePath, errors) {
  const text = decodeText(content);
  const fields = text && parseFrontmatter(text);
  if (!fields) {
    errors.push(`Skill 缺少有效 frontmatter: ${filePath}`);
    return;
  }
  for (const field of ['name', 'description', 'type']) {
    if (!fields.get(field)) {
      errors.push(`Skill frontmatter 缺少 ${field}: ${filePath}`);
    }
  }
  if (fields.get('name') && fields.get('name') !== skillName) {
    errors.push(`Skill name 与目录不一致: ${filePath}`);
  }
}

function compareSkillTrees(errors, tracked) {
  for (const skillName of PROJECT_SKILLS) {
    const canonicalPrefix = `.agents/skills/${skillName}/`;
    const compatibilityPrefix = `.claude/skills/${skillName}/`;
    const canonicalFiles = [...tracked]
      .filter((filePath) => filePath.startsWith(canonicalPrefix))
      .map((filePath) => filePath.slice(canonicalPrefix.length));
    const compatibilityFiles = [...tracked]
      .filter((filePath) => filePath.startsWith(compatibilityPrefix))
      .map((filePath) => filePath.slice(compatibilityPrefix.length));
    const allFiles = new Set([...canonicalFiles, ...compatibilityFiles]);

    for (const relativePath of [...allFiles].sort()) {
      const displayPath = `${skillName}/${relativePath}`;
      const canonicalGitPath = `.agents/skills/${displayPath}`;
      const compatibilityGitPath = `.claude/skills/${displayPath}`;
      if (!tracked.has(canonicalGitPath)) {
        errors.push(`Claude 兼容 Skill 缺少 canonical 文件: ${displayPath}`);
        continue;
      }
      if (!tracked.has(compatibilityGitPath)) {
        errors.push(`Claude 兼容 Skill 缺少镜像文件: ${displayPath}`);
        continue;
      }

      const canonical = readIndexFile(canonicalGitPath);
      const compatibility = readIndexFile(compatibilityGitPath);
      if (!canonical.equals(compatibility)) {
        errors.push(`Skill 内容漂移: ${displayPath}`);
      }
      if (relativePath === 'SKILL.md') {
        validateSkillFrontmatter(canonical, skillName, canonicalGitPath, errors);
      }
    }
  }
}

function findSecrets(text) {
  const secretPatterns = [
    ['GitHub token', /github_pat_[A-Za-z0-9_]{20,}/g],
    ['GitHub legacy token', /ghp_[A-Za-z0-9]{20,}/g],
    ['Google API key', /AIza[0-9A-Za-z_-]{20,}/g],
    ['AWS access key', /AKIA[0-9A-Z]{16}/g],
    ['npm token', /npm_[A-Za-z0-9]{36}/g],
    ['Slack token', /xox[baprs]-[A-Za-z0-9-]{20,}/g],
    ['GitLab token', /glpat-[A-Za-z0-9_-]{20,}/g],
    ['OpenRouter key', /sk-or-v1-[A-Za-z0-9]{20,}/g],
    ['OpenAI project key', /sk-proj-[A-Za-z0-9_-]{20,}/g],
    ['OpenAI legacy key', /sk-[A-Za-z0-9]{32,}/g],
    ['private key block', /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/g],
  ];

  const findings = [];
  for (const [label, pattern] of secretPatterns) {
    for (const match of text.matchAll(pattern)) {
      const token = match[0];
      const payload = token
        .replace(/^github_pat_/i, '')
        .replace(/^ghp_/i, '')
        .replace(/^AIza/, '')
        .replace(/^AKIA/, '')
        .replace(/^npm_/i, '')
        .replace(/^xox[baprs]-/i, '')
        .replace(/^glpat-/i, '')
        .replace(/^sk-(?:or-v1-|proj-)?/i, '')
        .replace(/[^A-Za-z0-9]/g, '');
      if (/^(?:x+|example|placeholder|yourtoken)$/i.test(payload)) continue;
      findings.push(label);
    }
  }

  const genericAssignment =
    /(?<![A-Za-z0-9_])(?:api[_-]?key|client[_-]?secret|access[_-]?token|auth[_-]?token|password|passwd)\s*["']?\s*[:=]\s*(["'])([^"'\r\n]{12,})\1/gi;
  for (const match of text.matchAll(genericAssignment)) {
    const value = match[2].trim();
    const payload = value
      .replace(/^sk-(?:or-v1-|proj-)?/i, '')
      .replace(/[^A-Za-z0-9]/g, '');
    if (/^(?:x+|example|placeholder|changeme|your(?:api)?key|yourtoken)$/i.test(payload)) {
      continue;
    }
    findings.push('generic credential assignment');
  }
  return findings;
}

function scanTrackedSecrets(trackedFiles, errors) {
  for (const filePath of trackedFiles) {
    let content;
    try {
      content = readIndexFile(filePath);
    } catch {
      continue;
    }
    const text = decodeText(content) ?? content.toString('latin1');
    for (const label of new Set(findSecrets(text))) {
      errors.push(`疑似真实 ${label}: ${filePath}`);
    }
  }
}

function main() {
  const errors = [];
  const trackedFiles = listTrackedFiles();
  const tracked = new Set(trackedFiles);
  const untrackedFiles = listUntrackedFiles();

  for (const filePath of trackedFiles) {
    if (matchesLocalOnly(filePath)) {
      errors.push(`本地专用文件已被 Git 跟踪: ${filePath}`);
    }
  }
  for (const filePath of untrackedFiles) {
    errors.push(`未分类或未暂存的新文件: ${filePath}`);
  }

  const requiredFiles = [
    '.gitignore',
    'AGENTS.md',
    'CLAUDE.md',
    'CONVENTIONS.md',
    'README.md',
    'docs/repository-policy.md',
    'scripts/check-repository-policy.js',
    'scripts/repository-policy.json',
    'robots.txt',
    'sitemap.xml',
    'feed.xml',
    ...PROJECT_SKILLS.flatMap((skillName) => [
      `.agents/skills/${skillName}/SKILL.md`,
      `.claude/skills/${skillName}/SKILL.md`,
    ]),
  ];
  for (const filePath of requiredFiles) {
    if (!tracked.has(filePath)) {
      errors.push(`必须纳入版本控制的文件未被跟踪: ${filePath}`);
    }
  }

  const requiredPrefixes = ['docs/agent-context/'];
  for (const prefix of requiredPrefixes) {
    if (!trackedFiles.some((filePath) => filePath.startsWith(prefix))) {
      errors.push(`必须纳入版本控制的目录没有已跟踪文件: ${prefix}`);
    }
  }

  if (tracked.has('.gitignore')) {
    const ignoreText = decodeText(readIndexFile('.gitignore'));
    const ignoreRules = new Set(
      (ignoreText || '')
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter((line) => line && !line.startsWith('#')),
    );
    const expectedIgnorePatterns = [
      ...REQUIRED_IGNORE_PATTERNS,
      ...PROJECT_SKILLS.flatMap((skillName) => [
        `!.agents/skills/${skillName}/`,
        `!.agents/skills/${skillName}/**`,
      ]),
    ];
    for (const pattern of expectedIgnorePatterns) {
      if (!ignoreRules.has(pattern)) {
        errors.push(`.gitignore 缺少必要规则: ${pattern}`);
      }
    }
  }

  compareSkillTrees(errors, tracked);
  scanTrackedSecrets(trackedFiles, errors);

  if (errors.length > 0) {
    for (const error of errors) console.error(`[ERROR] ${error}`);
    console.error(`Repository policy check failed: ${errors.length} error(s).`);
    process.exitCode = 1;
    return;
  }

  console.log(`Repository policy check passed: ${trackedFiles.length} tracked files checked.`);
}

if (require.main === module) {
  main();
}

module.exports = {
  decodeText,
  findSecrets,
  matchesLocalOnly,
  parseFrontmatter,
};
