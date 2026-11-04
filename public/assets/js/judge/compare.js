// Output checking. Programs are judged on their tokens (the words and numbers), not on blank lines or on
// spaces at the end of a line, like most online judges do.

const tokens = (text) => String(text).split(/\s+/).filter(Boolean);

export function sameOutput(expected, actual) {
  const a = tokens(expected);
  const b = tokens(actual);
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
  return true;
}

// A short version of long text for the result panel.
export function clip(text, max = 600) {
  const s = String(text);
  return s.length <= max ? s : s.slice(0, max) + `\n... (${s.length - max} more characters)`;
}
