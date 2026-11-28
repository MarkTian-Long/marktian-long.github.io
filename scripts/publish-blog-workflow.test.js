const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const canonicalSkillPath = path.resolve(__dirname, '../.agents/skills/publish-blog/SKILL.md');
const workflowPaths = [
  canonicalSkillPath,
  path.resolve(__dirname, '../tools/blog/README.md'),
  path.resolve(__dirname, '../tools/blog/WRITING_GUIDE.md'),
];

function finalValidationSection() {
  const skill = fs.readFileSync(canonicalSkillPath, 'utf8');
  return skill.slice(skill.indexOf('## 3. 验证与提交'), skill.indexOf('## 4. 推送 HITL'));
}

test('ordinary blog publishing always runs taxonomy validation without requiring a taxonomy base ref', () => {
  const section = finalValidationSection();
  assert.match(section, /tools\/blog\/publish\.js/);
  assert.match(section, /scripts\/check-blog-release\.js --release/);
  assert.doesNotMatch(section, /完整仓库检查/);
  assert.match(section, /普通文章发布不得要求 taxonomy base ref/);
  assert.doesNotMatch(section, /<taxonomy-change-base-ref>/);
});

test('taxonomy changes require a real pre-change git ref before impact audit runs', () => {
  const section = finalValidationSection();
  assert.match(section, /只有本次发布\/维护实际修改了 `tools\/blog\/data\/blog-taxonomy\.json`，才运行[\s\S]*audit-taxonomy-impact\.js --base-ref <真实的 taxonomy 变更前 git ref>/);
});

test('publish workflow documentation consistently describes conditional taxonomy impact audit', () => {
  for (const workflowPath of workflowPaths) {
    const content = fs.readFileSync(workflowPath, 'utf8');
    assert.match(content, /tools\/blog\/publish\.js/);
    assert.match(content, /check-blog-release\.js --release/);
    assert.match(content, /tools\/blog\/data\/blog-taxonomy\.json/);
    assert.match(content, /audit-taxonomy-impact\.js --base-ref <真实的 taxonomy 变更前 git ref>/);
    assert.doesNotMatch(content, /<taxonomy-change-base-ref>/);
  }
});

test('CI routes blog-only changes through focused source/release checks and keeps engineering changes on the full suite', () => {
  const classifier = fs.readFileSync(path.join(__dirname, 'classify-public-changes.js'), 'utf8');
  const workflow = fs.readFileSync(path.join(__dirname, '../.github/workflows/deploy.yml'), 'utf8');
  assert.match(classifier, /blogReleaseChanged/);
  assert.match(workflow, /blog_release_changed/);
  assert.match(workflow, /check-blog-release\.js --source/);
  assert.match(workflow, /check-blog-release\.js --release --base-ref/);
  assert.match(workflow, /npm run check/);
});

// These checks apply to every main-branch build, not only to manual publication.
test('CI runs blog taxonomy/source sync and Continue Reading shell checks', () => {
  const source = fs.readFileSync(path.join(__dirname, 'check-all.js'), 'utf8');
  assert.match(source, /\['Blog taxonomy and source sync', node, \['tools\/blog\/check-blog-taxonomy\.js'\], repoRoot\]/);
  assert.match(source, /\['Blog Continue Reading shells', node, \['scripts\/migrate-blog-continue-reading\.js', '--check'\], repoRoot\]/);
});

test('release verification fetches the pre-push commit for historical body comparison', () => {
  const workflow = fs.readFileSync(path.join(__dirname, '../.github/workflows/deploy.yml'), 'utf8');
  const verifyJob = workflow.slice(workflow.indexOf('  verify:'), workflow.indexOf('  deploy:'));
  assert.match(verifyJob, /uses: actions\/checkout@v4\s+with:\s+fetch-depth: 0/);
});

test('legacy migration no longer offers template or writing-guide overwrite commands', () => {
  const script = path.join(__dirname, 'migrate-blog-continue-reading.js');
  for (const flag of ['--create-template', '--update-writing-guide']) {
    const result = spawnSync(process.execPath, [script, flag], { cwd: path.resolve(__dirname, '..'), encoding: 'utf8' });
    assert.notEqual(result.status, 0, `${flag} should be rejected`);
    assert.match(result.stderr, /Usage:.*--write\|--check/);
  }
});
