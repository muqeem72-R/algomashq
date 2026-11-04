// The problem page: the idea first, then the problem, hints, the editor and the console.
// Left: Concept | Problem | Hints | Solution.   Right: editor on top, console below.

import { h, icon } from '../dom.js';
import { blocks, inline } from '../components/blocks.js';
import { loadEditor } from '../components/editor.js';
import { toast } from '../components/toast.js';
import { TOPICS } from '../data/topics.js';
import { loadProblem } from '../problems-data.js';
import * as progress from '../progress.js';
import * as engine from '../runner/engine.js';
import * as judge from '../judge/judge.js';

const STATUS_TEXT = {
  accepted: 'Accepted', wrong_answer: 'Wrong Answer', runtime_error: 'Runtime Error', time_limit: 'Time Limit Exceeded',
  output_limit: 'Output Limit Exceeded', memory_limit: 'Memory Limit Exceeded', compile_error: 'Compile Error', cancelled: 'Stopped', ok: 'Finished', not_run: 'Not run'
};
const LANG_LIST = ['python', 'cpp', 'java'];
const mb = (bytes) => (bytes / 1048576).toFixed(1);
const seconds = (ms) => (ms / 1000).toFixed(ms % 1000 === 0 ? 0 : 1);

function pre(text, extraClass) {
  return h('pre', { class: 'out-block' + (extraClass ? ' ' + extraClass : '') }, text === '' ? h('span', { class: 'out-empty', text: '(empty)' }) : text);
}

export function workspaceView(ctx, slug) {
  const root = h('div', { class: 'ws', 'data-flush': 'true' });
  let destroyed = false;
  let cleanup = () => {};
  root.__destroy = () => { destroyed = true; cleanup(); };

  // The drafts typed on another device are fetched together with the problem (it never waits long for them).
  Promise.all([loadProblem(slug), progress.loadDrafts(slug)]).then(([problem]) => { if (!destroyed) build(problem); }).catch((error) => {
    root.replaceChildren(h('div', { class: 'page' }, h('div', { class: 'card empty' },
      h('h3', { text: 'Problem not found' }), h('p', { text: error.message }),
      h('a', { class: 'btn btn-primary', href: '#/problems', text: 'Back to the problems' }))));
  });
  root.append(h('div', { class: 'ws-loading' }, h('span', { class: 'spinner' }), 'Loading the problem'));
  return root;

  function build(problem) {
    document.title = `${problem.title} · ${ctx.appName}`;
    const topic = TOPICS.find((t) => t.id === problem.topic);
    const state = progress.getState(slug);
    let lang = pickLanguage();
    let busy = false;
    let editorApi = null;
    let draftTimer = null;
    const hintsShown = () => progress.getState(slug).hints;

    function pickLanguage() {
      const usable = (l) => engine.LANGUAGES[l] && engine.LANGUAGES[l].available && problem.starter[l];
      const saved = progress.getLanguage();
      const preferred = ctx.user().preferredLanguage;
      const chosen = saved && usable(saved) ? saved : usable(preferred) ? preferred : usable('cpp') ? 'cpp' : 'python';
      // Code typed on another device may be in a different language: then open on that one, so the work in progress is in front.
      const draftLanguage = progress.latestDraftLanguage(slug);
      return draftLanguage && usable(draftLanguage) && progress.getDraft(slug, chosen) === null ? draftLanguage : chosen;
    }

    // ---------- Header ----------
    const solvedBadge = h('span', { class: 'solved-badge', hidden: !progress.isSolved(slug) }, icon('check', 14), 'Solved');
    const head = h('div', { class: 'ws-head' },
      h('a', { class: 'ws-back', href: '#/problems', 'aria-label': 'Back to the problems' }, icon('back', 18)),
      h('h2', { text: `${problem.order}. ${problem.title}` }),
      h('span', { class: `level ${problem.difficulty}`, text: problem.difficulty[0].toUpperCase() + problem.difficulty.slice(1) }),
      topic ? h('span', { class: 'ws-topic', text: topic.title }) : null,
      solvedBadge,
      h('a', { class: 'ws-history', href: `#/submissions/${slug}`, title: 'Your accepted solutions of this problem, in each language' }, icon('clock', 15), 'Submissions')
    );

    // ---------- Left: tabs ----------
    const tabs = [
      { id: 'concept', label: 'Concept' },
      { id: 'problem', label: 'Problem' },
      { id: 'hints', label: 'Hints' },
      { id: 'solution', label: 'Solution' }
    ];
    const tabBar = h('div', { class: 'ws-tabs', role: 'tablist' });
    const pane = h('div', { class: 'ws-pane', role: 'tabpanel', tabindex: '0' });
    let currentTab = null;
    const tabButtons = {};
    for (const t of tabs) {
      const b = h('button', { type: 'button', role: 'tab', text: t.label, onClick: () => showTab(t.id) });
      tabButtons[t.id] = b;
      tabBar.append(b);
    }

    function showTab(id) {
      currentTab = id;
      for (const t of tabs) tabButtons[t.id].setAttribute('aria-selected', String(t.id === id));
      pane.replaceChildren(...(id === 'concept' ? conceptPane() : id === 'problem' ? problemPane() : id === 'hints' ? hintsPane() : solutionPane()));
      pane.scrollTop = 0;
    }

    function conceptPane() {
      return [
        h('div', { class: 'pane-kicker', text: 'Start here' }),
        h('h3', { text: problem.concept.title }),
        h('div', { class: 'prose' }, blocks(problem.concept.body)),
        h('button', {
          class: 'btn btn-primary', type: 'button',
          onClick: () => { progress.setState(slug, { conceptSeen: true }); showTab('problem'); }
        }, 'I have read it. Show me the problem', icon('arrow', 16))
      ];
    }

    function problemPane() {
      const examples = problem.examples.map((e, i) => h('div', { class: 'example' },
        h('div', { class: 'example-title', text: `Example ${i + 1}` }),
        h('div', { class: 'example-grid' },
          h('div', null, h('div', { class: 'mini-label', text: 'Input' }), problem.noInput ? h('p', { class: 'muted', text: 'This problem has no input.' }) : pre(e.input)),
          h('div', null, h('div', { class: 'mini-label', text: 'Output' }), pre(e.output))),
        e.note ? h('p', { class: 'example-note' }, inline(e.note)) : null
      ));
      return [
        h('div', { class: 'prose' }, blocks(problem.statement)),
        h('h4', { text: 'Input' }), h('div', { class: 'prose' }, blocks(problem.inputFormat)),
        h('h4', { text: 'Output' }), h('div', { class: 'prose' }, blocks(problem.outputFormat)),
        h('h4', { text: 'Constraints' }), h('ul', { class: 'constraints' }, problem.constraints.map((c) => h('li', null, h('code', { text: c })))),
        h('h4', { text: 'Examples' }), ...examples,
        h('p', { class: 'limit-note' }, `Time limit: ${seconds(judge.timeLimitFor(problem, 'cpp'))} s for C++ and ${seconds(judge.timeLimitFor(problem, 'python'))} s for Python and Java (both are slower in the browser).`),
        h('p', { class: 'limit-note' }, 'Good to know: your code runs in your own browser. In C++, try/catch is not available, and for very large inputs scanf reads much faster than cin. In Java, recursion is limited to about 3000 nested calls, and every compile takes several seconds.')
      ];
    }

    function hintsPane() {
      const n = hintsShown();
      const items = problem.hints.slice(0, n).map((text, i) => h('div', { class: 'hint-card' }, h('div', { class: 'mini-label', text: `Hint ${i + 1}` }), h('p', null, inline(text))));
      const more = n < problem.hints.length
        ? h('button', {
          class: 'btn btn-ghost', type: 'button',
          onClick: () => { progress.setState(slug, { hints: n + 1 }); showTab('hints'); }
        }, `Show hint ${n + 1}`)
        : h('p', { class: 'muted', text: 'That was the last hint.' });
      return [
        h('p', { class: 'muted', text: 'Try to build the idea yourself first. Open one hint at a time, only when you are stuck.' }),
        ...items, more
      ];
    }

    function solutionPane() {
      const open = progress.isSolved(slug) || progress.getState(slug).revealed;
      if (!open) {
        return [h('div', { class: 'card locked' },
          icon('lock', 28),
          h('h3', { text: 'Try it yourself first' }),
          h('p', { text: 'The solution unlocks when you solve the problem. If you are completely stuck, you can open it now.' }),
          h('button', {
            class: 'btn btn-ghost', type: 'button',
            onClick: () => { if (window.confirm('Open the solution now? It is more useful after a real attempt.')) { progress.setState(slug, { revealed: true }); showTab('solution'); } }
          }, 'Show the solution anyway'))];
      }
      const langs = LANG_LIST.filter((l) => problem.solution.code[l]);
      let shown = langs.includes(lang) ? lang : langs[0];
      const codeBox = h('pre', { class: 'code-block solution-code' });
      const langBar = h('div', { class: 'segmented' });
      const draw = () => {
        codeBox.replaceChildren(h('code', { text: problem.solution.code[shown] }));
        langBar.querySelectorAll('input').forEach((i) => { i.checked = i.value === shown; });
      };
      for (const l of langs) {
        langBar.append(h('label', null,
          h('input', { type: 'radio', name: 'solution-language', value: l, onChange: () => { shown = l; draw(); } }),
          h('span', { text: engine.LANGUAGES[l].label })));
      }
      draw();
      return [
        h('h3', { text: 'How it works' }),
        h('div', { class: 'prose' }, blocks(problem.solution.explanation)),
        h('p', { class: 'complexity' }, h('strong', { text: 'Complexity: ' }), problem.solution.complexity),
        h('div', { class: 'solution-bar' }, h('h4', { text: 'Code' }), langBar),
        codeBox
      ];
    }

    const left = h('div', { class: 'ws-left' }, tabBar, pane);

    // ---------- Right: toolbar, editor, console ----------
    const langSelect = h('select', { class: 'select ws-lang', 'aria-label': 'Language' },
      LANG_LIST.map((l) => {
        const info = engine.LANGUAGES[l];
        const ok = info.available && problem.starter[l];
        return h('option', { value: l, disabled: !ok, selected: l === lang, text: ok ? info.label : `${info.label} (coming soon)` });
      }));
    const engineNote = h('div', { class: 'engine-note', role: 'status' });
    const engineBar = h('div', { class: 'engine-bar', hidden: true }, h('i'));
    const resetBtn = h('button', { class: 'btn btn-ghost btn-sm', type: 'button', onClick: resetCode }, 'Reset');
    const runBtn = h('button', { class: 'btn btn-ghost btn-sm', type: 'button', title: 'Run with your own input (Ctrl+Enter)', onClick: () => runCustom() }, icon('play', 14), 'Run');
    const examplesBtn = h('button', { class: 'btn btn-ghost btn-sm', type: 'button', title: 'Run the examples', onClick: () => runExamples() }, 'Examples');
    const submitBtn = h('button', { class: 'btn btn-primary btn-sm', type: 'button', title: 'Submit (Ctrl+Shift+Enter)', onClick: () => submit() }, 'Submit');
    const stopBtn = h('button', { class: 'btn btn-danger btn-sm', type: 'button', hidden: true, onClick: () => engine.cancel() }, 'Stop');
    const toolbar = h('div', { class: 'ws-toolbar' }, langSelect, engineNote, h('div', { class: 'grow' }), resetBtn, stopBtn, runBtn, examplesBtn, submitBtn);

    const editorHost = h('div', { class: 'ws-editor' }, h('div', { class: 'ws-loading' }, h('span', { class: 'spinner' }), 'Loading the editor'));

    const inputBox = h('textarea', { class: 'console-input', spellcheck: 'false', 'aria-label': 'Custom input', placeholder: 'Type the input for your program here' });
    inputBox.value = problem.examples[0].input;
    const outputBox = h('div', { class: 'console-out' }, h('p', { class: 'muted', text: 'Press Run to see the output of your program here.' }));
    const resultBox = h('div', { class: 'console-out' }, h('p', { class: 'muted', text: 'Press Examples to check the examples, or Submit to run every test.' }));
    const consoleTabs = [
      { id: 'input', label: 'Input', el: inputBox },
      { id: 'output', label: 'Output', el: outputBox },
      { id: 'result', label: 'Result', el: resultBox }
    ];
    const consoleBar = h('div', { class: 'ws-tabs small', role: 'tablist' });
    const consoleBody = h('div', { class: 'console-body' });
    const consoleButtons = {};
    for (const t of consoleTabs) {
      const b = h('button', { type: 'button', role: 'tab', text: t.label, onClick: () => showConsole(t.id) });
      consoleButtons[t.id] = b;
      consoleBar.append(b);
    }
    function showConsole(id) {
      for (const t of consoleTabs) consoleButtons[t.id].setAttribute('aria-selected', String(t.id === id));
      consoleBody.replaceChildren(consoleTabs.find((t) => t.id === id).el);
    }
    const consolePanel = h('div', { class: 'ws-console' }, consoleBar, consoleBody);
    const splitH = h('div', { class: 'ws-split-h', role: 'separator', 'aria-orientation': 'horizontal', 'aria-label': 'Resize the console' });
    const right = h('div', { class: 'ws-right' }, toolbar, engineBar, editorHost, splitH, consolePanel);
    const splitV = h('div', { class: 'ws-split-v', role: 'separator', 'aria-orientation': 'vertical', 'aria-label': 'Resize the problem panel' });
    const body = h('div', { class: 'ws-body' }, left, splitV, right);

    root.replaceChildren(head, body);

    // ---------- Resizing the panels ----------
    function dragger(handle, onMove) {
      handle.addEventListener('pointerdown', (event) => {
        event.preventDefault();
        handle.setPointerCapture(event.pointerId);
        const move = (e) => onMove(e);
        const up = () => { handle.removeEventListener('pointermove', move); handle.removeEventListener('pointerup', up); };
        handle.addEventListener('pointermove', move);
        handle.addEventListener('pointerup', up);
      });
    }
    dragger(splitV, (e) => {
      const box = body.getBoundingClientRect();
      const w = Math.min(Math.max(e.clientX - box.left, 320), box.width - 420);
      body.style.setProperty('--ws-left', w + 'px');
    });
    dragger(splitH, (e) => {
      const box = right.getBoundingClientRect();
      const hgt = Math.min(Math.max(box.bottom - e.clientY, 110), box.height - 200);
      right.style.setProperty('--ws-console', hgt + 'px');
    });

    // ---------- Engine status ----------
    function updateButtons() {
      // Only a download in progress blocks the buttons. After a program was stopped the engine restarts on the next click.
      const usable = engine.status(lang) !== 'loading';
      for (const b of [runBtn, examplesBtn, submitBtn]) b.disabled = busy || !usable;
      resetBtn.disabled = busy;
      langSelect.disabled = busy;
      stopBtn.hidden = !busy;
    }

    function setEngineNote(text, fraction) {
      engineNote.textContent = text;
      engineBar.hidden = fraction === undefined;
      if (fraction !== undefined) engineBar.firstChild.style.width = Math.round(fraction * 100) + '%';
    }

    async function ensureEngine() {
      const target = lang;
      updateButtons();
      if (engine.status(target) === 'ready') { setEngineNote(`${engine.LANGUAGES[target].label} is ready`); return true; }
      const info = engine.LANGUAGES[target];
      const first = target === 'cpp' ? `Setting up the C++ compiler (${info.download}, downloaded once)`
        : target === 'java' ? `Setting up Java (${info.download}). The very first time can take a minute or two.`
          : `Starting ${info.label}`;
      setEngineNote(first, target === 'cpp' ? 0 : undefined);
      try {
        await engine.prepare(target, (p) => {
          if (target !== lang || destroyed) return;
          if (p.total) setEngineNote(`Setting up the C++ compiler: ${mb(p.done)} of ${mb(p.total)} MB (downloaded once)`, p.done / p.total);
        });
      } catch (error) {
        if (target === lang && !destroyed) setEngineNote(`Could not start ${info.label}: ${error.message}. Reload the page to try again.`);
        updateButtons();
        return false;
      }
      if (target === lang && !destroyed) setEngineNote(`${info.label} is ready`);
      updateButtons();
      return true;
    }

    // ---------- Code ----------
    const startCode = () => progress.getDraft(slug, lang) ?? problem.starter[lang];
    const currentCode = () => (editorApi ? editorApi.getValue() : startCode());

    function resetCode() {
      const changed = currentCode() !== problem.starter[lang];
      if (changed && !window.confirm('Replace your code with the starting code?')) return;
      progress.clearDraft(slug, lang);
      if (editorApi) editorApi.setValue(problem.starter[lang]);
    }

    function onCodeChange(text) {
      clearTimeout(draftTimer);
      const editedLang = lang;
      draftTimer = setTimeout(() => progress.saveDraft(slug, editedLang, text, problem.starter[editedLang]), 400);
    }

    langSelect.addEventListener('change', async () => {
      const next = langSelect.value;
      if (next === lang) return;
      progress.saveDraft(slug, lang, currentCode(), problem.starter[lang]);
      lang = next;
      progress.setLanguage(lang);
      if (editorApi) { editorApi.setLanguage(lang); editorApi.setValue(startCode()); }
      await ensureEngine();
    });

    // ---------- Running ----------
    function guard(fn) {
      return async (...args) => {
        if (busy) return;
        if (!(await ensureEngine())) return;
        busy = true; updateButtons();
        try { await fn(...args); } finally {
          busy = false;
          if (!destroyed) {
            updateButtons();
            // A stopped Python program restarts the engine; start it again now so the next run is quick.
            if (engine.status(lang) === 'idle') ensureEngine();
          }
        }
      };
    }

    function runLine(info) {
      if (info.phase === 'compiling') return lang === 'java' ? 'Compiling (Java takes about 10 seconds)' : 'Compiling';
      return `Running test ${info.index} of ${info.total}`;
    }

    const runCustom = guard(async () => {
      showConsole('output');
      outputBox.replaceChildren(h('p', { class: 'muted' }, h('span', { class: 'spinner' }), ' ' + runLine({ phase: 'compiling' })));
      const compiled = await engine.compile(lang, currentCode());
      if (!compiled.ok) { outputBox.replaceChildren(statusLine('compile_error'), pre(compiled.log, 'is-error')); return; }
      outputBox.replaceChildren(h('p', { class: 'muted' }, h('span', { class: 'spinner' }), ' Running'));
      const r = await engine.run(lang, compiled.program, inputBox.value, { timeLimitMs: judge.timeLimitFor(problem, lang) });
      const parts = [statusLine(r.status, r.ms)];
      if (r.status === 'time_limit') parts.push(h('p', { class: 'muted', text: `The program was stopped after ${seconds(judge.timeLimitFor(problem, lang))} s. Is there a faster way to solve it?` }));
      parts.push(h('div', { class: 'mini-label', text: 'Output' }), pre(r.stdout));
      if (r.stderr) parts.push(h('div', { class: 'mini-label', text: 'Errors' }), pre(r.stderr, 'is-error'));
      outputBox.replaceChildren(...parts);
    });

    const runExamples = guard(async () => {
      showConsole('result');
      resultBox.replaceChildren(h('p', { class: 'muted' }, h('span', { class: 'spinner' }), ' ' + runLine({ phase: 'compiling' })));
      const r = await judge.runExamples(problem, lang, currentCode(), (info) => resultBox.replaceChildren(h('p', { class: 'muted' }, h('span', { class: 'spinner' }), ' ' + runLine(info))));
      if (r.status === 'compile_error') { resultBox.replaceChildren(statusLine('compile_error'), pre(r.log, 'is-error')); return; }
      const list = r.results.map((x, i) => {
        const ok = x.status === 'accepted';
        const skipped = x.status === 'not_run';
        const parts = [h('div', { class: 'case-head' }, h('strong', { text: x.test.label }), h('span', { class: ok ? 'verdict-ok' : skipped ? 'muted' : 'verdict-bad', text: STATUS_TEXT[x.status] || x.status }), skipped ? null : h('span', { class: 'muted', text: `${x.ms} ms` }))];
        if (!ok && !skipped) parts.push(...failureDetail({ status: x.status, input: x.test.input, expected: x.test.output, actual: x.stdout, stderr: x.stderr }));
        return h('div', { class: 'case' + (ok ? '' : ' is-bad') }, parts);
      });
      const passed = r.results.filter((x) => x.status === 'accepted').length;
      resultBox.replaceChildren(h('div', { class: 'verdict-line' }, h('span', { class: passed === r.results.length ? 'verdict-ok big' : 'verdict-bad big', text: `${passed} of ${r.results.length} examples passed` })), ...list);
    });

    const submit = guard(async () => {
      showConsole('result');
      progress.setState(slug, { attempts: progress.getState(slug).attempts + 1 });
      const code = currentCode();
      const submittedLang = lang;
      resultBox.replaceChildren(h('p', { class: 'muted' }, h('span', { class: 'spinner' }), ' ' + runLine({ phase: 'compiling' })));
      const v = await judge.submit(problem, submittedLang, code, (info) => resultBox.replaceChildren(h('p', { class: 'muted' }, h('span', { class: 'spinner' }), ' ' + runLine(info))));
      renderVerdict(v);
      // Only an accepted solution is saved in the account (the last one for this language); a failed Submit saves nothing.
      progress.recordSubmission({ slug, lang: submittedLang, verdict: v.status, passed: v.passed, total: v.total, timeMs: v.slowest, code });
      progress.saveDraft(slug, submittedLang, code, problem.starter[submittedLang]);
      progress.syncDrafts();
      if (v.status === 'accepted') {
        const first = progress.markSolved(slug, submittedLang);
        solvedBadge.hidden = false;
        if (first) toast('Solved! The solution is now unlocked.');
        if (currentTab === 'solution') showTab('solution');
      }
    });

    function statusLine(status, ms) {
      return h('div', { class: 'verdict-line' },
        h('span', { class: (status === 'accepted' || status === 'ok' ? 'verdict-ok' : 'verdict-bad') + ' big', text: STATUS_TEXT[status] || status }),
        ms !== undefined ? h('span', { class: 'muted', text: `${ms} ms` }) : null);
    }

    function failureDetail(f) {
      const out = [];
      if (f.input !== undefined) {
        out.push(h('div', { class: 'mini-label', text: 'Input' }), pre(f.input));
        if (f.status === 'wrong_answer') out.push(h('div', { class: 'mini-label', text: 'Expected output' }), pre(f.expected), h('div', { class: 'mini-label', text: 'Your output' }), pre(f.actual));
      }
      if (f.stderr) out.push(h('div', { class: 'mini-label', text: 'Errors' }), pre(f.stderr, 'is-error'));
      return out;
    }

    function renderVerdict(v) {
      if (v.status === 'compile_error') { resultBox.replaceChildren(statusLine('compile_error'), pre(v.log, 'is-error')); return; }
      if (v.status === 'cancelled') { resultBox.replaceChildren(statusLine('cancelled'), h('p', { class: 'muted', text: `${v.passed} of ${v.total} tests had passed.` })); return; }
      if (v.status === 'accepted') {
        resultBox.replaceChildren(statusLine('accepted'),
          h('p', null, `All ${v.total} tests passed. The slowest test took ${v.slowest} ms.`),
          h('p', { class: 'muted', text: 'Well done. Open the Solution tab to compare your idea with the explanation.' }));
        return;
      }
      const parts = [statusLine(v.status, v.ms), h('p', null, `Failed on ${v.hidden ? 'a hidden test' : v.label}. ${v.passed} of ${v.total} tests passed before it.`)];
      if (v.hidden) {
        const tips = {
          wrong_answer: 'Hidden test data is not shown. Check the edge cases: the smallest and the largest values, zero, negative numbers, and answers too big for a 32-bit integer.',
          time_limit: 'Your program is correct on small data but too slow here. Look at the constraints: how many steps does your idea take for the largest input?',
          runtime_error: 'The program crashed on this test. A common cause is reading outside an array, dividing by zero, or recursing too deep.',
          memory_limit: 'The program used too much memory. Do you need to store everything at once?',
          output_limit: 'The program printed far more than expected. Is there a loop that never ends?'
        };
        parts.push(h('p', { class: 'muted', text: tips[v.status] || '' }));
        if (v.stderr) parts.push(h('div', { class: 'mini-label', text: 'Errors' }), pre(v.stderr, 'is-error'));
      } else {
        parts.push(...failureDetail(v));
      }
      resultBox.replaceChildren(...parts);
    }

    // ---------- Start ----------
    showTab(state.conceptSeen || progress.isSolved(slug) ? 'problem' : 'concept');
    showConsole('input');
    updateButtons();

    loadEditor().then(({ createEditor }) => {
      if (destroyed) return;
      editorHost.replaceChildren();
      editorApi = createEditor(editorHost, {
        doc: startCode(), language: lang, label: `${problem.title} code editor`,
        onChange: onCodeChange, onRun: () => runCustom(), onSubmit: () => submit()
      });
    }).catch(() => {
      editorHost.replaceChildren(h('div', { class: 'ws-loading', text: 'The code editor could not be loaded. Reload the page.' }));
    });

    ensureEngine();

    cleanup = () => {
      clearTimeout(draftTimer);
      if (editorApi) { progress.saveDraft(slug, lang, editorApi.getValue(), problem.starter[lang]); editorApi.destroy(); }
      progress.syncDrafts();   // the account hears about the code of this problem when it is left
      engine.cancel();
    };
  }
}
