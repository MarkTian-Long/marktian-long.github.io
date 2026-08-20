'use strict';

function normalizeWhitespace(value) {
  return String(value || '').replace(/\r\n?/g, '\n').replace(/[\t ]+/g, ' ').trim();
}

function normalizeUrl(value) {
  return String(value || '')
    .replace(/http:\/\/127\.0\.0\.1:\d+/g, 'http://a0.local')
    .replace(/\\/g, '/');
}

function normalizeNode(node) {
  if (!node || node.text !== undefined) return node;
  return {
    ...node,
    attributes: node.attributes.map(([name, value]) => [name, normalizeUrl(value)]),
    children: node.children.map(normalizeNode),
  };
}

function normalizeDocument(snapshot) {
  return {
    head: normalizeNode(snapshot.head),
    body: normalizeNode(snapshot.body),
    text: normalizeWhitespace(snapshot.text),
    links: snapshot.links.map(link => ({ ...link, href: normalizeUrl(link.href) })),
    ids: [...snapshot.ids],
    classes: [...snapshot.classes],
    aria: snapshot.aria.map(item => ({ ...item })),
  };
}

function normalizeAriaSnapshot(snapshot) {
  return normalizeUrl(snapshot).replace(/\r\n?/g, '\n').trim();
}

async function captureDocument(page) {
  return page.evaluate(() => {
    function nodeShape(node) {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent.replace(/\s+/g, ' ').trim();
        return text ? { text } : null;
      }
      if (node.nodeType !== Node.ELEMENT_NODE) return null;
      const attributes = [...node.attributes]
        .map(attribute => [attribute.name, attribute.value])
        .sort((a, b) => a[0].localeCompare(b[0]));
      const children = [...node.childNodes].map(nodeShape).filter(Boolean);
      return { tag: node.tagName.toLowerCase(), attributes, children };
    }
    const elements = [...document.querySelectorAll('*')];
    return {
      head: nodeShape(document.head),
      body: nodeShape(document.body),
      text: document.body.innerText,
      links: [...document.querySelectorAll('a')].map(link => ({ href: link.getAttribute('href') || '', text: link.textContent.trim() })),
      ids: elements.filter(element => element.id).map(element => element.id),
      classes: elements.filter(element => element.classList.length).map(element => [...element.classList].sort().join(' ')),
      aria: elements.filter(element => [...element.attributes].some(attribute => attribute.name === 'role' || attribute.name.startsWith('aria-')))
        .map(element => ({
          tag: element.tagName.toLowerCase(),
          id: element.id,
          attributes: [...element.attributes]
            .filter(attribute => attribute.name === 'role' || attribute.name.startsWith('aria-'))
            .map(attribute => [attribute.name, attribute.value])
            .sort((a, b) => a[0].localeCompare(b[0])),
        })),
    };
  });
}

module.exports = {
  captureDocument,
  normalizeAriaSnapshot,
  normalizeDocument,
  normalizeUrl,
  normalizeWhitespace,
};
