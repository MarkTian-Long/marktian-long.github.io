const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');

const {
  decodeText,
  findSecrets,
  matchesLocalOnly,
} = require('./check-repository-policy');
const { projectSkills } = require('./repository-policy.json');

const repoRoot = path.resolve(__dirname, '..');

function run(root, command, args) {
  return execFileSync(command, args, {
    cwd: root,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
}

function writeFile(root, filePath, content = '') {
  const absolutePath = path.join(root, filePath);
  fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
  fs.writeFileSync(absolutePath, content);
}

function createRepositoryFixture(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'qiuzhi-policy-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));

  fs.mkdirSync(path.join(root, 'scripts'), { recursive: true });
  fs.copyFileSync(
    path.join(repoRoot, 'scripts', 'check-repository-policy.js'),
    path.join(root, 'scripts', 'check-repository-policy.js'),
  );
  fs.copyFileSync(
    path.join(repoRoot, 'scripts', 'repository-policy.json'),
    path.join(root, 'scripts', 'repository-policy.json'),
  );
  fs.copyFileSync(path.join(repoRoot, '.gitignore'), path.join(root, '.gitignore'));

  for (const filePath of [
    'AGENTS.md',
    'CLAUDE.md',
    'CONVENTIONS.md',
    'README.md',
    'docs/repository-policy.md',
    'docs/agent-context/README.md',
    'robots.txt',
    'sitemap.xml',
    'feed.xml',
  ]) {
    writeFile(root, filePath, `${filePath}\n`);
  }
  for (const skillName of projectSkills) {
    const content = [
      '---',
      `name: ${skillName}`,
      'description: fixture skill',
      'type: workflow',
      '---',
      '',
    ].join('\n');
    writeFile(root, `.agents/skills/${skillName}/SKILL.md`, content);
    writeFile(root, `.claude/skills/${skillName}/SKILL.md`, content);
  }

  run(root, 'git', ['init', '--quiet']);
  run(root, 'git', ['config', 'user.email', 'fixture@example.com']);
  run(root, 'git', ['config', 'user.name', 'Repository Policy Test']);
  run(root, 'git', ['add', '--all']);
  return root;
}

function runPolicy(root) {
  try {
    return {
      status: 0,
      output: run(root, process.execPath, ['scripts/check-repository-policy.js']),
    };
  } catch (error) {
    return {
      status: error.status,
      output: `${error.stdout || ''}${error.stderr || ''}`,
    };
  }
}

test('classifies machine-only files and allows project-owned files', () => {
  const localOnly = [
    '.claude/settings.local.json',
    '.codex/state.json',
    '.env',
    '.env.production',
    '.envrc',
    '.npmrc',
    'certificates/deploy.key',
    'id_rsa_work',
    'config.local.ts',
    'credentials.json',
    '.DS_Store',
    'notes.swp',
    '.Codex/state.json',
    'tools/stock/config.local.js',
    'docs/personal/resume.md',
    'docs/resume.pdf',
    'index.html.bak',
  ];
  const projectOwned = [
    '.agents/skills/code-health-check/SKILL.md',
    '.claude/skills/code-health-check/SKILL.md',
    '.env.example',
    'tools/stock/config.example.js',
    'docs/blog/article.md',
    'feed.xml',
  ];

  for (const filePath of localOnly) {
    assert.equal(matchesLocalOnly(filePath), true, filePath);
  }
  for (const filePath of projectOwned) {
    assert.equal(matchesLocalOnly(filePath), false, filePath);
  }
});

test('detects representative real secret formats', () => {
  const githubToken = ['github', 'pat', '1234567890abcdefghijklmnop'].join('_');
  const awsKey = ['AKIA', '1234567890ABCDEF'].join('');
  const openRouterKey = ['sk', 'or', 'v1', '1234567890abcdefghijklmnopqrstuv'].join('-');
  const privateKeyHeader = ['-----BEGIN ', 'PRIVATE KEY-----'].join('');
  const genericCredential = ['real', 'credential', 'value', '123456'].join('-');
  const assignmentName = ['api', 'Key'].join('');

  assert.deepEqual(findSecrets(githubToken), ['GitHub token']);
  assert.deepEqual(findSecrets(awsKey), ['AWS access key']);
  assert.deepEqual(
    findSecrets(openRouterKey),
    ['OpenRouter key'],
  );
  assert.deepEqual(findSecrets(privateKeyHeader), ['private key block']);
  assert.deepEqual(
    findSecrets(`${assignmentName} = "${genericCredential}"`),
    ['generic credential assignment'],
  );
});

test('ignores documented placeholders and ordinary sk-prefixed words', () => {
  const text = [
    'sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
    'sk-or-v1-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
    'github_pat_xxxxxxxxxxxxxxxxxxxxxxxx',
    'apiKey: "YOUR_API_KEY"',
    'https://example.com/sk-hynix-holds-market-share',
  ].join('\n');

  assert.deepEqual(findSecrets(text), []);
});

test('decodes UTF-16 text before scanning secrets', () => {
  const key = ['sk', 'or', 'v1', '1234567890abcdefghijklmnopqrstuv'].join('-');
  const utf16 = Buffer.concat([
    Buffer.from([0xff, 0xfe]),
    Buffer.from(`token=${key}`, 'utf16le'),
  ]);

  assert.deepEqual(findSecrets(decodeText(utf16)), ['OpenRouter key']);
});

test('repository policy CLI accepts a clean staged snapshot', (t) => {
  const root = createRepositoryFixture(t);
  const result = runPolicy(root);

  assert.equal(result.status, 0, result.output);
});

test('repository policy CLI rejects a tracked machine-local file', (t) => {
  const root = createRepositoryFixture(t);
  writeFile(root, '.claude/settings.local.json', '{}\n');
  run(root, 'git', ['add', '--force', '.claude/settings.local.json']);
  const result = runPolicy(root);

  assert.notEqual(result.status, 0);
  assert.match(result.output, /本地专用文件已被 Git 跟踪/);
});

test('repository policy CLI rejects Skill drift', (t) => {
  const root = createRepositoryFixture(t);
  const skillPath = '.claude/skills/add-tool/SKILL.md';
  writeFile(root, skillPath, '---\nname: wrong-name\ndescription: drift\n---\n');
  run(root, 'git', ['add', skillPath]);
  const result = runPolicy(root);

  assert.notEqual(result.status, 0);
  assert.match(result.output, /Skill 内容漂移/);
});

test('repository policy CLI rejects incomplete Skill frontmatter', (t) => {
  const root = createRepositoryFixture(t);
  const content = '---\nname: add-tool\ndescription: missing type\n---\n';
  for (const filePath of [
    '.agents/skills/add-tool/SKILL.md',
    '.claude/skills/add-tool/SKILL.md',
  ]) {
    writeFile(root, filePath, content);
    run(root, 'git', ['add', filePath]);
  }
  const result = runPolicy(root);

  assert.notEqual(result.status, 0);
  assert.match(result.output, /frontmatter 缺少 type/);
});

test('repository policy CLI rejects a missing required ignore rule', (t) => {
  const root = createRepositoryFixture(t);
  const ignorePath = path.join(root, '.gitignore');
  const ignore = fs.readFileSync(ignorePath, 'utf8').replace('.npmrc\n', '');
  fs.writeFileSync(ignorePath, ignore);
  run(root, 'git', ['add', '.gitignore']);
  const result = runPolicy(root);

  assert.notEqual(result.status, 0);
  assert.match(result.output, /\.gitignore 缺少必要规则: \.npmrc/);
});

test('repository policy CLI rejects staged secrets', (t) => {
  const root = createRepositoryFixture(t);
  const token = ['github', 'pat', '1234567890abcdefghijklmnop'].join('_');
  writeFile(root, 'assets/secret.txt', `token=${token}\n`);
  run(root, 'git', ['add', 'assets/secret.txt']);
  const result = runPolicy(root);

  assert.notEqual(result.status, 0);
  assert.match(result.output, /疑似真实 GitHub token/);
});

test('repository policy CLI rejects untracked non-ignored files', (t) => {
  const root = createRepositoryFixture(t);
  writeFile(root, 'docs/blog/new-draft.md', '# Draft\n');
  const result = runPolicy(root);

  assert.notEqual(result.status, 0);
  assert.match(result.output, /未分类或未暂存的新文件/);
});

test('repository policy CLI evaluates staged Skill content', (t) => {
  const root = createRepositoryFixture(t);
  writeFile(root, '.claude/skills/add-tool/SKILL.md', 'unstaged drift\n');
  const result = runPolicy(root);

  assert.equal(result.status, 0, result.output);
});
