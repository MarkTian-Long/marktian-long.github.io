'use strict';

const fs = require('node:fs');
const path = require('node:path');

function relativeFiles(rootDir) {
  const files = [];
  function visit(directory, relativeDirectory = '') {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const relativePath = path.join(relativeDirectory, entry.name);
      if (entry.isDirectory()) visit(path.join(directory, entry.name), relativePath);
      else if (entry.isFile()) files.push(relativePath);
    }
  }
  visit(rootDir);
  return files.sort();
}

function checkSkillCompatibility({ canonical, compatibility }) {
  const errors = [];
  if (!fs.existsSync(canonical)) return [`missing canonical skill directory: ${canonical}`];
  if (!fs.existsSync(compatibility)) return [`missing compatibility skill directory: ${compatibility}`];
  const canonicalFiles = relativeFiles(canonical);
  const compatibilityFiles = relativeFiles(compatibility);
  const canonicalFileSet = new Set(canonicalFiles);
  for (const relativePath of canonicalFiles) {
    const canonicalPath = path.join(canonical, relativePath);
    const compatibilityPath = path.join(compatibility, relativePath);
    if (!fs.existsSync(compatibilityPath)) {
      errors.push(`missing compatibility file: ${relativePath.replace(/\\/g, '/')}`);
      continue;
    }
    if (!fs.readFileSync(canonicalPath).equals(fs.readFileSync(compatibilityPath))) {
      errors.push(`content differs: ${relativePath.replace(/\\/g, '/')}`);
    }
  }
  for (const relativePath of compatibilityFiles) {
    if (!canonicalFileSet.has(relativePath)) errors.push(`compatibility-only file: ${relativePath.replace(/\\/g, '/')}`);
  }
  return errors;
}

function parseArgs(argv) {
  if (!argv.length) return { skill: null };
  if (argv.length === 2 && argv[0] === '--skill' && argv[1]) return { skill: argv[1] };
  throw new Error('Usage: node scripts/check-project-skill-compatibility.js [--skill <name>]');
}

function main(argv = process.argv.slice(2), rootDir = path.resolve(__dirname, '..')) {
  const { skill } = parseArgs(argv);
  const policy = JSON.parse(fs.readFileSync(path.join(rootDir, 'scripts/repository-policy.json'), 'utf8'));
  const skills = skill ? [skill] : policy.projectSkills;
  if (skill && !policy.projectSkills.includes(skill)) throw new Error(`Not a project-owned skill: ${skill}`);
  const errors = [];
  for (const name of skills) {
    for (const error of checkSkillCompatibility({
      canonical: path.join(rootDir, '.agents/skills', name),
      compatibility: path.join(rootDir, '.claude/skills', name),
    })) {
      errors.push(`${name}: ${error}`);
    }
  }
  if (errors.length) {
    for (const error of errors) console.error(`✗ ${error}`);
    return 1;
  }
  console.log(`✓ project skill compatibility: ${skills.length} skill(s)`);
  return 0;
}

if (require.main === module) process.exitCode = main();

module.exports = { checkSkillCompatibility, main, parseArgs, relativeFiles };
