const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

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
