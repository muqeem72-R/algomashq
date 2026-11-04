// The code editor (CodeMirror 6, bundled in /vendor/codemirror/editor.js). It is loaded only when a problem page opens.

let loading = null;

// Returns the CodeMirror wrapper module: { createEditor(parent, options) }.
export function loadEditor() {
  if (!loading) loading = import('/vendor/codemirror/editor.js');
  return loading;
}
