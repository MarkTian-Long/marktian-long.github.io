const test = require('node:test');
const assert = require('node:assert/strict');
const childProcess = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const { checkSkillCompatibility } = require('./check-project-skill-compatibility.js');

function fixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'project-skill-compatibility-'));
  const canonical = path.join(root, '.agents/skills/blog-human-writing');
  const compatibility = path.join(root, '.claude/skills/blog-human-writing');
  fs.mkdirSync(path.join(canonical, 'references'), { recursive: true });
  fs.mkdirSync(path.join(compatibility, 'references'), { recursive: true });
  fs.writeFileSync(path.join(canonical, 'SKILL.md'), 'authoritative rules\n');
  fs.writeFileSync(path.join(canonical, 'references/material-check.md'), 'authoritative reference\n');
  fs.copyFileSync(path.join(canonical, 'SKILL.md'), path.join(compatibility, 'SKILL.md'));
  fs.copyFileSync(path.join(canonical, 'references/material-check.md'), path.join(compatibility, 'references/material-check.md'));
  return { canonical, compatibility };
}

test('project skill compatibility checks the full canonical directory, including references', () => {
  const { canonical, compatibility } = fixture();
  assert.deepEqual(checkSkillCompatibility({ canonical, compatibility }), []);
  fs.writeFileSync(path.join(compatibility, 'references/material-check.md'), 'drifted reference\n');
  assert.deepEqual(checkSkillCompatibility({ canonical, compatibility }), ['content differs: references/material-check.md']);
});

test('project skill compatibility reports a missing compatibility file', () => {
  const { canonical, compatibility } = fixture();
  fs.rmSync(path.join(compatibility, 'SKILL.md'));
  assert.deepEqual(checkSkillCompatibility({ canonical, compatibility }), ['missing compatibility file: SKILL.md']);
});

test('project skill compatibility reports compatibility-only files that could retain obsolete rules', () => {
  const { canonical, compatibility } = fixture();
  fs.writeFileSync(path.join(compatibility, 'references/obsolete-rule.md'), 'old rule\n');
  assert.deepEqual(checkSkillCompatibility({ canonical, compatibility }), ['compatibility-only file: references/obsolete-rule.md']);
});

test('project skill compatibility resolves the repository root when npm runs it from scripts', () => {
  assert.doesNotThrow(() => childProcess.execFileSync(
    process.execPath,
    ['check-project-skill-compatibility.js'],
    { cwd: __dirname, stdio: 'pipe' },
  ));
});
