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
  return skill.slice(skill.indexOf('## 3. 验证与提交'), skill.indexOf('## 4. 分支写入与推送 HITL'));
}

test('ordinary blog publishing always runs taxonomy validation without requiring a taxonomy base ref', () => {
  const section = finalValidationSection();
  assert.match(section, /每篇文章始终运行[\s\S]*node tools\/blog\/check-blog-taxonomy\.js/);
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
    assert.match(content, /node tools\/blog\/check-blog-taxonomy\.js/);
    assert.match(content, /tools\/blog\/data\/blog-taxonomy\.json/);
    assert.match(content, /audit-taxonomy-impact\.js --base-ref <真实的 taxonomy 变更前 git ref>/);
    assert.doesNotMatch(content, /<taxonomy-change-base-ref>/);
  }
});

// These checks apply to every main-branch build, not only to manual publication.
test('CI runs blog taxonomy/source sync, release equivalence and Continue Reading shell checks', () => {
  const source = fs.readFileSync(path.join(__dirname, 'check-all.js'), 'utf8');
  assert.match(source, /\['Blog taxonomy and source sync', node, \['tools\/blog\/check-blog-taxonomy\.js'\], repoRoot\]/);
  assert.match(source, /\['Blog release source equivalence', node, \['scripts\/check-blog-release-equivalence\.js'\], repoRoot\]/);
  assert.match(source, /\['Blog Continue Reading shells', node, \['scripts\/migrate-blog-continue-reading\.js', '--check'\], repoRoot\]/);
});

test('legacy migration no longer offers template or writing-guide overwrite commands', () => {
  const script = path.join(__dirname, 'migrate-blog-continue-reading.js');
  for (const flag of ['--create-template', '--update-writing-guide']) {
    const result = spawnSync(process.execPath, [script, flag], { cwd: path.resolve(__dirname, '..'), encoding: 'utf8' });
    assert.notEqual(result.status, 0, `${flag} should be rejected`);
    assert.match(result.stderr, /Usage:.*--write\|--check/);
  }
});

test('publish Skill defines GitHub Connector branch, PR and Pages recovery semantics', () => {
  const skill = fs.readFileSync(canonicalSkillPath, 'utf8');
  assert.match(skill, /GitHub Connector/);
  assert.match(skill, /create_branch/);
  assert.match(skill, /create_tree/);
  assert.match(skill, /expected_sha/);
  assert.match(skill, /create_pull_request/);
  assert.match(skill, /verify-pr/i);
  assert.match(skill, /fresh workflow run/i);
  assert.match(skill, /Do not rerun the same Pages workflow run after artifact upload/i);
  assert.match(skill, /cannot execute Node/i);
});
