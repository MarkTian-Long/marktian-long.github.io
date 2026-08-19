const fs = require('node:fs');
const path = require('node:path');

const schema = require('../docs/portfolio-evidence.schema.json');
const repoRoot = path.resolve(__dirname, '..');

function valueType(value) {
  if (value === null) return 'null';
  if (Array.isArray(value)) return 'array';
  return typeof value;
}

function joinPath(parent, key) {
  return typeof key === 'number' ? `${parent}[${key}]` : parent ? `${parent}.${key}` : key;
}

function resolveSchema(node) {
  if (!node.$ref) return node;
  const parts = node.$ref.replace(/^#\//, '').split('/');
  return parts.reduce((current, part) => current[part], schema);
}

function validateValue(value, rawNode, location, errors) {
  const node = resolveSchema(rawNode);
  const label = location || '根对象';

  if (Object.hasOwn(node, 'const') && value !== node.const) {
    errors.push(`${label} 必须等于 ${JSON.stringify(node.const)}`);
    return;
  }
  if (node.enum && !node.enum.includes(value)) {
    errors.push(`${label} 不在允许值中`);
    return;
  }
  if (node.type) {
    const allowed = Array.isArray(node.type) ? node.type : [node.type];
    if (!allowed.includes(valueType(value))) {
      errors.push(`${label} 类型不合法`);
      return;
    }
  }

  if (typeof value === 'string') {
    if (node.minLength && value.length < node.minLength) errors.push(`${label} 缺失或为空`);
    if (node.pattern && !new RegExp(node.pattern).test(value)) errors.push(`${label} 格式不合法`);
  }

  if (Array.isArray(value)) {
    if (node.minItems && value.length < node.minItems) errors.push(`${label} 至少需要 ${node.minItems} 项`);
    if (node.items) value.forEach((item, index) => validateValue(item, node.items, joinPath(location, index), errors));
    return;
  }

  if (value && typeof value === 'object') {
    for (const field of node.required || []) {
      if (!Object.hasOwn(value, field)) errors.push(`${joinPath(location, field)} 缺失`);
    }
    for (const [field, childValue] of Object.entries(value)) {
      if (node.properties && Object.hasOwn(node.properties, field)) {
        validateValue(childValue, node.properties[field], joinPath(location, field), errors);
      } else if (node.additionalProperties === false) {
        errors.push(`${joinPath(location, field)} 不允许出现`);
      }
    }
  }
}

function validatePortfolio(document) {
  const errors = [];
  validateValue(document, schema, '', errors);

  const ids = new Set();
  if (document && Array.isArray(document.portfolio)) {
    for (const [index, record] of document.portfolio.entries()) {
      if (!record || typeof record.id !== 'string') continue;
      if (ids.has(record.id)) errors.push(`portfolio[${index}].id 重复: ${record.id}`);
      ids.add(record.id);
    }
  }
  return errors;
}

function parseArgs(args) {
  if (args.length === 0) return { file: 'docs/portfolio-evidence.examples.json' };
  if (args.length === 2 && args[0] === '--file' && args[1]) return { file: args[1] };
  throw new Error('Usage: node scripts/check-portfolio-evidence.js [--file <relative.json>]');
}

function readDocument(relative) {
  if (path.isAbsolute(relative) || relative.split(/[\\/]/).includes('..')) {
    throw new Error('只接受仓库内的相对 JSON 文件路径');
  }
  return JSON.parse(fs.readFileSync(path.join(repoRoot, relative), 'utf8'));
}

function successMessage(document) {
  return `Portfolio evidence check passed: ${document.portfolio.length} records.`;
}

function main(args = process.argv.slice(2)) {
  const { file } = parseArgs(args);
  const document = readDocument(file);
  const errors = validatePortfolio(document);
  if (errors.length) {
    errors.forEach((error) => console.error(`[ERROR] ${error}`));
    process.exitCode = 1;
  } else console.log(successMessage(document));
}

if (require.main === module) main();

module.exports = { parseArgs, readDocument, successMessage, validatePortfolio };
