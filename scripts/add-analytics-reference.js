const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
const snippet = '<script src="/assets/js/analytics.js" defer></script>';
const targets = [
  ...['ai-insights','radar','trends','agent-hub','asci','service-agent','stock','esop-extractor'].map(name => path.join(root, 'tools', name, 'index.html')),
  ...fs.readdirSync(path.join(root, 'tools', 'blog', 'posts')).filter(name => name.endsWith('.html')).map(name => path.join(root, 'tools', 'blog', 'posts', name))
];
for (const file of targets) {
  const source = fs.readFileSync(file, 'utf8');
  if (!source.includes(snippet)) fs.writeFileSync(file, source.replace(/<\/body>/i, `${snippet}\n</body>`));
}
