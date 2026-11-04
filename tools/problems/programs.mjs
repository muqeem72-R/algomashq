// Turns a short description of a program into complete starter code and solution code in Python, C++ and Java.
// A problem that has a `program` entry does not need to spell out six full programs by hand:
//
//   program: {
//     io: ['n:int', 'a:int[n]'],        // the input, one entry per line of input
//     python: 'print(sum(a))',          // the solution logic; it can use the variables read above
//     cpp:    'long long s = 0;\nfor (long long x : a) s += x;\ncout << s << "\\n";',
//     java:   '...',
//     helpers: { python: '...', cpp: '...', java: '...' },       // optional: functions placed above main
//     includes: ['<algorithm>', '<cmath>'],                       // optional: extra C++ headers
//     starterHelpers: { ... }, starterBody: { ... }               // optional: what the starter shows instead of the bare comment
//   }
//
// Types in `io`: int (64-bit), real (double), word (text without spaces), line (a whole line), char (one character).
// `name:type[len]` reads `len` values (len is a number or an earlier variable). Several declarations in one entry
// ('a:int b:int') are read from the same line. If a problem still needs hand-written code, `starter` and
// `solution.code` can be given for a language and then win over the generated text.

const DECL = /^([A-Za-z_]\w*):(int|real|word|line|char)(?:\[(\w+)\])?$/;

function parseLine(spec) {
  return spec.trim().split(/\s+/).map((part) => {
    const m = DECL.exec(part);
    if (!m) throw new Error(`bad io declaration "${part}"`);
    const [, name, type, len] = m;
    if (type === 'line' && len) throw new Error('arrays of lines are not supported');
    return { name, type, len };
  });
}

export function dedent(text) {
  const lines = String(text).replace(/\s+$/, '').split('\n');
  while (lines.length && !lines[0].trim()) lines.shift();
  const margin = Math.min(...lines.filter((l) => l.trim()).map((l) => l.match(/^ */)[0].length));
  return lines.map((l) => l.slice(Number.isFinite(margin) ? margin : 0)).join('\n');
}

const indent = (text, n) => text.split('\n').map((l) => (l ? ' '.repeat(n) + l : l)).join('\n');

// ---- Python ----
function pythonReads(specs) {
  const out = [];
  for (const spec of specs) {
    const ds = parseLine(spec);
    const names = ds.map((d) => d.name).join(', ');
    if (ds.length === 1) {
      const d = ds[0];
      if (d.len) out.push(`${d.name} = ` + (d.type === 'int' ? 'list(map(int, input().split()))' : d.type === 'real' ? 'list(map(float, input().split()))' : 'input().split()'));
      else out.push(`${d.name} = ` + { int: 'int(input())', real: 'float(input())', word: 'input().strip()', char: 'input().strip()', line: 'input()' }[d.type]);
    } else if (ds.every((d) => d.type === 'int' && !d.len)) out.push(`${names} = map(int, input().split())`);
    else if (ds.every((d) => d.type === 'real' && !d.len)) out.push(`${names} = map(float, input().split())`);
    else {
      out.push(`${names} = input().split()`);
      for (const d of ds) if (d.type === 'int') out.push(`${d.name} = int(${d.name})`); else if (d.type === 'real') out.push(`${d.name} = float(${d.name})`);
    }
  }
  return out;
}

// ---- C++ ----
const CPP_TYPE = { int: 'long long', real: 'double', word: 'string', line: 'string', char: 'char' };
function cppReads(specs) {
  const out = [];
  for (const spec of specs) {
    const ds = parseLine(spec);
    if (ds.length === 1 && ds[0].type === 'line') {
      out.push(`string ${ds[0].name};`, `getline(cin >> ws, ${ds[0].name});`);
    } else if (ds.length === 1 && ds[0].len) {
      const d = ds[0];
      out.push(`vector<${CPP_TYPE[d.type]}> ${d.name}(${d.len});`, `for (int i = 0; i < ${d.len}; i++) cin >> ${d.name}[i];`);
    } else {
      for (const d of ds) out.push(`${CPP_TYPE[d.type]} ${d.name};`);
      out.push(`cin >> ${ds.map((d) => d.name).join(' >> ')};`);
    }
  }
  return out;
}

// ---- Java ----
const JAVA_TYPE = { int: 'long', real: 'double', word: 'String', line: 'String', char: 'char' };
const JAVA_READ = { int: 'sc.nextLong()', real: 'Double.parseDouble(sc.next())', word: 'sc.next()', char: 'sc.next().charAt(0)', line: 'sc.nextLine()' };
function javaReads(specs) {
  const out = [];
  let pendingNewline = false;   // after a token read, the rest of that line is still unread
  for (const spec of specs) {
    const ds = parseLine(spec);
    for (const d of ds) {
      if (d.type === 'line') {
        if (pendingNewline) out.push('sc.nextLine();');
        out.push(`String ${d.name} = sc.nextLine();`);
        pendingNewline = false;
      } else if (d.len) {
        const size = /^\d+$/.test(d.len) ? d.len : `(int) ${d.len}`;
        out.push(`${JAVA_TYPE[d.type]}[] ${d.name} = new ${JAVA_TYPE[d.type]}[${size}];`, `for (int i = 0; i < ${d.name}.length; i++) ${d.name}[i] = ${JAVA_READ[d.type]};`);
        pendingNewline = true;
      } else {
        out.push(`${JAVA_TYPE[d.type]} ${d.name} = ${JAVA_READ[d.type]};`);
        pendingNewline = true;
      }
    }
  }
  return out;
}

const COMMENT = 'Your code here';

function assemble(prog, mode) {
  const specs = prog.io || [];
  const has = specs.length > 0;
  const pick = (group, lang) => (group && group[lang] ? dedent(group[lang]) : '');
  const body = {
    python: mode === 'starter' ? (pick(prog.starterBody, 'python') || `# ${COMMENT}`) : dedent(prog.python),
    cpp: mode === 'starter' ? (pick(prog.starterBody, 'cpp') || `// ${COMMENT}`) : dedent(prog.cpp),
    java: mode === 'starter' ? (pick(prog.starterBody, 'java') || `// ${COMMENT}`) : dedent(prog.java)
  };
  const helper = (lang) => pick(mode === 'starter' ? prog.starterHelpers : prog.helpers, lang);

  const python = [helper('python'), pythonReads(specs).join('\n'), body.python].filter(Boolean).join('\n\n') + '\n';

  const headers = ['<iostream>', ...(has ? ['<vector>', '<string>'] : []), ...(prog.includes || [])];
  const cppMain = [cppReads(specs).join('\n'), body.cpp, 'return 0;'].filter(Boolean).join('\n\n');
  const cpp = [headers.map((x) => `#include ${x}`).join('\n') + '\nusing namespace std;', helper('cpp'), `int main() {\n${indent(cppMain, 4)}\n}`].filter(Boolean).join('\n\n') + '\n';

  const javaReadBlock = has ? ['Scanner sc = new Scanner(System.in);', ...javaReads(specs)].join('\n') : '';
  const javaMain = [javaReadBlock, body.java].filter(Boolean).join('\n\n');
  const javaClass = [helper('java') ? indent(helper('java'), 4) : '', `    public static void main(String[] args) {\n${indent(javaMain, 8)}\n    }`].filter(Boolean).join('\n\n');
  const java = [has || prog.util ? 'import java.util.*;' : '', `public class Main {\n${javaClass}\n}`].filter(Boolean).join('\n\n') + '\n';

  return { python, cpp, java };
}

// Fills `starter` and `solution.code` of a problem from its `program`. Hand-written code for a language wins.
export function expand(p) {
  if (!p.program) return p;
  const starter = { ...assemble(p.program, 'starter'), ...(p.starter || {}) };
  const code = { ...assemble(p.program, 'solution'), ...((p.solution && p.solution.code) || {}) };
  return { ...p, starter, solution: { ...p.solution, code } };
}
