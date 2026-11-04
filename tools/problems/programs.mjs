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
//     starterHelpers: { ... }, starterBody: { ... },              // optional: what the starter shows instead of the bare comment
//     fast: true                                                  // optional: fast input for big inputs (see below)
//   }
//
// Types in `io`: int (64-bit), real (double), word (text without spaces), line (a whole line), char (one character), and
//   name:type[len]            len values on one line (len is a number or an earlier variable)
//   name:int[rows][cols]      a matrix: `rows` lines of `cols` values (int, real or word)
//   name:rows[len]            `len` lines, each with one word (a grid of characters, a list of words)
// Several declarations in one entry ('a:int b:int') are read from the same line.
//
// `fast: true` is for inputs with many numbers: Python reads with sys.stdin.readline, C++ switches off the synchronisation with C
// streams, and Java reads through a BufferedReader and a StringTokenizer instead of a Scanner (which is slow). It cannot be
// combined with `line`.
//
// If a problem still needs hand-written code, `starter` and `solution.code` can be given for a language and then win over the
// generated text.

const DECL = /^([A-Za-z_]\w*):(int|real|word|line|char|rows)(?:\[(\w+)\](?:\[(\w+)\])?)?$/;

function parseLine(spec) {
  return spec.trim().split(/\s+/).map((part) => {
    const m = DECL.exec(part);
    if (!m) throw new Error(`bad io declaration "${part}"`);
    const [, name, type, len, len2] = m;
    if (type === 'line' && len) throw new Error('arrays of lines are not supported');
    if (type === 'rows' && (!len || len2)) throw new Error('rows needs exactly one length: name:rows[len]');
    if (len2 && !['int', 'real', 'word'].includes(type)) throw new Error('a matrix can hold int, real or word');
    return { name, type, len, len2 };
  });
}

export function dedent(text) {
  const lines = String(text).replace(/\s+$/, '').split('\n');
  while (lines.length && !lines[0].trim()) lines.shift();
  const margin = Math.min(...lines.filter((l) => l.trim()).map((l) => l.match(/^ */)[0].length));
  return lines.map((l) => l.slice(Number.isFinite(margin) ? margin : 0)).join('\n');
}

const indent = (text, n) => text.split('\n').map((l) => (l ? ' '.repeat(n) + l : l)).join('\n');
const parsed = (specs) => specs.map(parseLine);
const usesLine = (specs) => parsed(specs).some((ds) => ds.some((d) => d.type === 'line'));

// ---- Python ----
function pythonReads(specs, fast) {
  const out = [];
  for (const spec of specs) {
    const ds = parseLine(spec);
    const names = ds.map((d) => d.name).join(', ');
    if (ds.length === 1) {
      const d = ds[0];
      if (d.type === 'rows') out.push(`${d.name} = [input().strip() for _ in range(${d.len})]`);
      else if (d.len2) out.push(`${d.name} = [${d.type === 'int' ? 'list(map(int, input().split()))' : d.type === 'real' ? 'list(map(float, input().split()))' : 'input().split()'} for _ in range(${d.len})]`);
      else if (d.len) out.push(`${d.name} = ` + (d.type === 'int' ? 'list(map(int, input().split()))' : d.type === 'real' ? 'list(map(float, input().split()))' : 'input().split()'));
      else out.push(`${d.name} = ` + { int: 'int(input())', real: 'float(input())', word: 'input().strip()', char: 'input().strip()', line: fast ? "input().rstrip('\\n')" : 'input()' }[d.type]);
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
    } else if (ds.length === 1 && ds[0].type === 'rows') {
      const d = ds[0];
      out.push(`vector<string> ${d.name}(${d.len});`, `for (int i = 0; i < ${d.len}; i++) {`, `    cin >> ${d.name}[i];`, '}');
    } else if (ds.length === 1 && ds[0].len2) {
      const d = ds[0];
      out.push(`vector<vector<${CPP_TYPE[d.type]}>> ${d.name}(${d.len}, vector<${CPP_TYPE[d.type]}>(${d.len2}));`,
        `for (int i = 0; i < ${d.len}; i++) {`, `    for (int j = 0; j < ${d.len2}; j++) {`, `        cin >> ${d.name}[i][j];`, '    }', '}');
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
const JAVA_READ_FAST = { int: 'Long.parseLong(next())', real: 'Double.parseDouble(next())', word: 'next()', char: 'next().charAt(0)' };
const JAVA_FAST_HELPER = `static BufferedReader in = new BufferedReader(new InputStreamReader(System.in));
static StringTokenizer tokens = new StringTokenizer("");

static String next() throws IOException {
    while (!tokens.hasMoreTokens()) {
        tokens = new StringTokenizer(in.readLine());
    }
    return tokens.nextToken();
}`;
const sizeOf = (len) => (/^\d+$/.test(len) ? len : `(int) ${len}`);

function javaReads(specs, fast) {
  const out = [];
  const read = fast ? JAVA_READ_FAST : JAVA_READ;
  let pendingNewline = false;   // after a token read, the rest of that line is still unread
  for (const spec of specs) {
    const ds = parseLine(spec);
    for (const d of ds) {
      if (d.type === 'line') {
        if (pendingNewline) out.push('sc.nextLine();');
        out.push(`String ${d.name} = sc.nextLine();`);
        pendingNewline = false;
      } else if (d.type === 'rows') {
        out.push(`String[] ${d.name} = new String[${sizeOf(d.len)}];`, `for (int i = 0; i < ${d.name}.length; i++) {`, `    ${d.name}[i] = ${read.word};`, '}');
        pendingNewline = true;
      } else if (d.len2) {
        const t = JAVA_TYPE[d.type];
        out.push(`${t}[][] ${d.name} = new ${t}[${sizeOf(d.len)}][${sizeOf(d.len2)}];`,
          `for (int i = 0; i < ${d.name}.length; i++) {`, `    for (int j = 0; j < ${d.name}[i].length; j++) {`, `        ${d.name}[i][j] = ${read[d.type]};`, '    }', '}');
        pendingNewline = true;
      } else if (d.len) {
        const t = JAVA_TYPE[d.type];
        out.push(`${t}[] ${d.name} = new ${t}[${sizeOf(d.len)}];`, `for (int i = 0; i < ${d.name}.length; i++) ${d.name}[i] = ${read[d.type]};`);
        pendingNewline = true;
      } else {
        out.push(`${JAVA_TYPE[d.type]} ${d.name} = ${read[d.type]};`);
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
  const fast = !!prog.fast;
  if (fast && usesLine(specs)) throw new Error('fast input cannot read a whole line');
  const pick = (group, lang) => (group && group[lang] ? dedent(group[lang]) : '');
  const body = {
    python: mode === 'starter' ? (pick(prog.starterBody, 'python') || `# ${COMMENT}`) : dedent(prog.python),
    cpp: mode === 'starter' ? (pick(prog.starterBody, 'cpp') || `// ${COMMENT}`) : dedent(prog.cpp),
    java: mode === 'starter' ? (pick(prog.starterBody, 'java') || `// ${COMMENT}`) : dedent(prog.java)
  };
  const helper = (lang) => pick(mode === 'starter' ? prog.starterHelpers : prog.helpers, lang);

  const pythonReadLines = pythonReads(specs, fast);
  const pythonFast = fast && has ? 'import sys\ninput = sys.stdin.readline' : '';
  const python = [pythonFast, helper('python'), pythonReadLines.join('\n'), body.python].filter(Boolean).join('\n\n') + '\n';

  const headers = ['<iostream>', ...(has ? ['<vector>', '<string>'] : []), ...(prog.includes || [])];
  const cppFast = fast && has ? 'ios::sync_with_stdio(false);\ncin.tie(nullptr);' : '';
  const cppMain = [cppFast, cppReads(specs).join('\n'), body.cpp, 'return 0;'].filter(Boolean).join('\n\n');
  const cpp = [headers.map((x) => `#include ${x}`).join('\n') + '\nusing namespace std;', helper('cpp'), `int main() {\n${indent(cppMain, 4)}\n}`].filter(Boolean).join('\n\n') + '\n';

  const javaReadBlock = has ? [...(fast ? [] : ['Scanner sc = new Scanner(System.in);']), ...javaReads(specs, fast)].join('\n') : '';
  const javaMain = [javaReadBlock, body.java].filter(Boolean).join('\n\n');
  const javaHelpers = [fast && has ? JAVA_FAST_HELPER : '', helper('java')].filter(Boolean).join('\n\n');
  const throwsClause = fast && has ? ' throws IOException' : '';
  const javaClass = [javaHelpers ? indent(javaHelpers, 4) : '', `    public static void main(String[] args)${throwsClause} {\n${indent(javaMain, 8)}\n    }`].filter(Boolean).join('\n\n');
  const javaImports = [fast && has ? 'import java.io.*;' : '', has || prog.util ? 'import java.util.*;' : ''].filter(Boolean).join('\n');
  const java = [javaImports, `public class Main {\n${javaClass}\n}`].filter(Boolean).join('\n\n') + '\n';

  return { python, cpp, java };
}

// Fills `starter` and `solution.code` of a problem from its `program`. Hand-written code for a language wins.
export function expand(p) {
  if (!p.program) return p;
  const starter = { ...assemble(p.program, 'starter'), ...(p.starter || {}) };
  const code = { ...assemble(p.program, 'solution'), ...((p.solution && p.solution.code) || {}) };
  return { ...p, starter, solution: { ...p.solution, code } };
}
