// Draws problem text. Content is a list of "blocks":
//   "a string"          a paragraph. Inside it: `code`, **bold** and *italic*
//   { list: [ ... ] }   a bullet list (each item may use the same inline marks)
//   { code: "..." }     a block of code
// Everything is built with createElement / textContent, never innerHTML.

import { h } from '../dom.js';

const INLINE = /(`[^`]+`|\*\*[^*]+\*\*|\*[^*\n]+\*)/g;

export function inline(text) {
  const out = [];
  for (const part of String(text).split(INLINE)) {
    if (!part) continue;
    if (part.startsWith('`')) out.push(h('code', { text: part.slice(1, -1) }));
    else if (part.startsWith('**')) out.push(h('strong', { text: part.slice(2, -2) }));
    else if (part.startsWith('*') && part.length > 2) out.push(h('em', { text: part.slice(1, -1) }));
    else out.push(part);
  }
  return out;
}

export function blocks(list) {
  return (list || []).map((block) => {
    if (typeof block === 'string') return h('p', null, inline(block));
    if (block.list) return h('ul', null, block.list.map((item) => h('li', null, inline(item))));
    if (block.code !== undefined) return h('pre', { class: 'code-block' }, h('code', { text: block.code }));
    return null;
  });
}
