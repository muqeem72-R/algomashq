// The code editor. CodeMirror 6 is bundled into public/vendor/codemirror/editor.js by tools/vendor/build.mjs.
// Only this small API leaves the bundle, so the rest of the site never touches CodeMirror classes.
// Colors come from CSS variables (see tokens.css), so the editor follows the light/dark theme and the accent color.

import { EditorState, Compartment } from '@codemirror/state';
import {
  EditorView, keymap, lineNumbers, highlightActiveLine, highlightActiveLineGutter, drawSelection, dropCursor,
  placeholder as placeholderExt
} from '@codemirror/view';
import { history, defaultKeymap, historyKeymap, indentWithTab } from '@codemirror/commands';
import { indentOnInput, bracketMatching, syntaxHighlighting, HighlightStyle, indentUnit } from '@codemirror/language';
import { closeBrackets, closeBracketsKeymap } from '@codemirror/autocomplete';
import { tags as t } from '@lezer/highlight';
import { cpp } from '@codemirror/lang-cpp';
import { python } from '@codemirror/lang-python';
import { java } from '@codemirror/lang-java';

const LANGUAGES = { cpp: () => cpp(), python: () => python(), java: () => java() };

const highlight = HighlightStyle.define([
  { tag: [t.keyword, t.modifier, t.operatorKeyword, t.controlKeyword, t.definitionKeyword], color: 'var(--syn-keyword)' },
  { tag: [t.string, t.special(t.string), t.regexp], color: 'var(--syn-string)' },
  { tag: [t.number, t.bool, t.null, t.atom], color: 'var(--syn-number)' },
  { tag: [t.comment, t.lineComment, t.blockComment], color: 'var(--syn-comment)', fontStyle: 'italic' },
  { tag: [t.typeName, t.className, t.namespace], color: 'var(--syn-type)' },
  { tag: [t.function(t.variableName), t.function(t.propertyName), t.definition(t.function(t.variableName))], color: 'var(--syn-function)' },
  { tag: [t.meta, t.processingInstruction, t.macroName], color: 'var(--syn-meta)' },
  { tag: [t.operator, t.punctuation, t.bracket], color: 'var(--syn-punct)' }
]);

const theme = EditorView.theme({
  '&': { height: '100%', backgroundColor: 'var(--surface)', color: 'var(--text)', fontSize: '14px' },
  '&.cm-focused': { outline: 'none' },
  '.cm-scroller': { fontFamily: 'var(--mono)', lineHeight: '1.6', overflow: 'auto' },
  '.cm-content': { caretColor: 'var(--accent)', padding: '12px 0' },
  '.cm-cursor, .cm-dropCursor': { borderLeftColor: 'var(--accent)', borderLeftWidth: '2px' },
  '.cm-gutters': { backgroundColor: 'var(--surface)', color: 'var(--faint)', border: 'none', paddingLeft: '4px' },
  '.cm-activeLine': { backgroundColor: 'var(--surface-2)' },
  '.cm-activeLineGutter': { backgroundColor: 'var(--surface-2)', color: 'var(--text)' },
  '&.cm-focused .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection': { backgroundColor: 'var(--accent-soft)' },
  '.cm-matchingBracket': { backgroundColor: 'var(--accent-soft)', outline: '1px solid var(--accent)' },
  '.cm-placeholder': { color: 'var(--faint)' }
});

// createEditor(parent, { doc, language, readOnly, onChange, onRun, onSubmit })
export function createEditor(parent, options = {}) {
  // The editor lives in a shadow root. CodeMirror then adds its styles as a constructable stylesheet, which the strict
  // Content-Security-Policy (style-src 'self') allows. A <style> tag in the page itself would be blocked.
  const shadow = parent.shadowRoot || parent.attachShadow({ mode: 'open' });
  const mount = document.createElement('div');
  mount.style.height = '100%';
  shadow.replaceChildren(mount);

  const language = new Compartment();
  const editable = new Compartment();
  const makeLanguage = (name) => (LANGUAGES[name] || LANGUAGES.cpp)();

  const state = EditorState.create({
    doc: options.doc || '',
    extensions: [
      lineNumbers(),
      highlightActiveLineGutter(),
      highlightActiveLine(),
      history(),
      drawSelection(),
      dropCursor(),
      indentOnInput(),
      bracketMatching(),
      closeBrackets(),
      indentUnit.of('    '),
      EditorState.tabSize.of(4),
      syntaxHighlighting(highlight),
      theme,
      language.of(makeLanguage(options.language)),
      editable.of([EditorView.editable.of(!options.readOnly), EditorState.readOnly.of(!!options.readOnly)]),
      keymap.of([
        { key: 'Mod-Enter', run: () => { if (options.onRun) options.onRun(); return true; } },
        { key: 'Mod-Shift-Enter', run: () => { if (options.onSubmit) options.onSubmit(); return true; } },
        ...closeBracketsKeymap,
        ...defaultKeymap,
        ...historyKeymap,
        indentWithTab
      ]),
      EditorView.updateListener.of((update) => { if (update.docChanged && options.onChange) options.onChange(update.state.doc.toString()); }),
      EditorView.contentAttributes.of({ 'aria-label': options.label || 'Code editor' }),
      options.placeholder ? placeholderExt(options.placeholder) : []
    ]
  });
  const view = new EditorView({ state, parent: mount, root: shadow });

  return {
    getValue: () => view.state.doc.toString(),
    setValue(text) { view.dispatch({ changes: { from: 0, to: view.state.doc.length, insert: text } }); },
    setLanguage(name) { view.dispatch({ effects: language.reconfigure(makeLanguage(name)) }); },
    focus: () => view.focus(),
    destroy: () => view.destroy()
  };
}
