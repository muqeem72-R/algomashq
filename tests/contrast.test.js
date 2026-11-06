// Accessibility: the text colors of both themes must be readable on the surfaces they are used on (WCAG AA: 4.5:1 for text,
// 3:1 for large text and for the borders of controls). The numbers are read from tokens.css, so a new color is checked too.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const css = fs.readFileSync(path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../public/assets/css/tokens.css'), 'utf8');

const block = (selector) => {
  const start = css.indexOf(selector + ' {');
  assert.ok(start >= 0, selector + ' not found');
  return css.slice(start, css.indexOf('}', start));
};
const vars = (selector) => Object.fromEntries([...block(selector).matchAll(/--([\w-]+):\s*(#[0-9a-fA-F]{6})\b/g)].map((m) => [m[1], m[2]]));

// #fff -> #ffffff
const full = (hex) => (hex.length === 4 ? '#' + [...hex.slice(1)].map((c) => c + c).join('') : hex);
const luminance = (hexValue) => {
  const hex = full(hexValue);
  const channel = (i) => {
    const c = parseInt(hex.slice(1 + i * 2, 3 + i * 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(0) + 0.7152 * channel(1) + 0.0722 * channel(2);
};
const ratio = (a, b) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

for (const theme of ['dark', 'light']) {
  const t = vars(`:root[data-theme="${theme}"]`);
  const accents = Object.fromEntries([...css.matchAll(/:root\[data-accent="(\w+)"\]\s*\{([^}]*)\}/g)].map((m) => [m[1], Object.fromEntries([...m[2].matchAll(/--([\w-]+):\s*(#[0-9a-fA-F]{3,6})/g)].map((x) => [x[1], x[2]]))]));

  test(`${theme}: body and secondary text are readable on the page and on cards`, () => {
    for (const surface of ['bg', 'surface', 'surface-2']) {
      assert.ok(ratio(t.text, t[surface]) >= 7, `text on ${surface}`);
      assert.ok(ratio(t.muted, t[surface]) >= 4.5, `muted on ${surface}: ${ratio(t.muted, t[surface]).toFixed(2)}`);
    }
  });

  test(`${theme}: the faint hint text still reaches 4.5:1 on cards`, () => {
    for (const surface of ['bg', 'surface', 'surface-2']) {
      assert.ok(ratio(t.faint, t[surface]) >= 4.5, `faint on ${surface}: ${ratio(t.faint, t[surface]).toFixed(2)}`);
    }
  });

  test(`${theme}: error and success colors are readable on cards`, () => {
    assert.ok(ratio(t.danger, t.surface) >= 4.5, `danger: ${ratio(t.danger, t.surface).toFixed(2)}`);
    assert.ok(ratio(t.success, t.surface) >= 4.5, `success: ${ratio(t.success, t.surface).toFixed(2)}`);
  });

  test(`${theme}: for every accent, links and the text on buttons are readable`, () => {
    for (const [name, a] of Object.entries(accents)) {
      const link = theme === 'dark' ? a['accent-d'] : a['accent-l'];
      assert.ok(ratio(link, t.surface) >= 4.5, `${name} link text on cards: ${ratio(link, t.surface).toFixed(2)}`);
      assert.ok(ratio(link, t.bg) >= 4.5, `${name} link text on the page: ${ratio(link, t.bg).toFixed(2)}`);
      assert.ok(ratio(a['accent-ink'], a.accent) >= 4.5, `${name} button text: ${ratio(a['accent-ink'], a.accent).toFixed(2)}`);
    }
  });
}
