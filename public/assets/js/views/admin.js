// The Admin page (only for the emails named in the ADMIN_EMAILS setting; the server checks, this page only hides the link).
//   Overview  members and activity, how people sign in, what went wrong, mail volume, where members come from
//   Members   find a member, take down a photo, end their logins, delete the account
//   Problems  which problems are solved most, and where members get stuck
// Everything is a count or a name. Nobody's code, notes or drafts are ever shown here.

import { h } from '../dom.js';
import { api, describeError } from '../api.js';
import { LANGUAGES } from '../data/topics.js';
import { loadIndex } from '../problems-data.js';
import { createTooltip } from '../components/viz-tooltip.js';
import { toast } from '../components/toast.js';
import { columnChart, rankedBars, statTile, tableView, plural, shortDay } from '../components/charts.js';
import { countryName } from '../components/member.js';

const languageLabel = (id) => (LANGUAGES.find((l) => l.id === id) || { label: id }).label;
const when = (ms) => (ms ? new Date(ms).toLocaleString(undefined, { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'never');
const sum = (byDay) => Object.values(byDay || {}).reduce((a, b) => a + b, 0);

// What each counter means, in words an owner understands. `bad` marks the ones that deserve attention when they are not zero.
const EVENT_TEXT = {
  server_error: { text: 'The server hit an unexpected error', bad: true },
  email_failed: { text: 'A login email could not be sent (check Brevo)', bad: true },
  rate_limited: { text: 'Someone was stopped by a rate limit' },
  otp_wrong: { text: 'A wrong email code was typed' },
  'google_failed:wrong_audience': { text: 'A Google sign-in was made for another site (is GOOGLE_CLIENT_ID right?)', bad: true },
  'google_failed:keys_unavailable': { text: "Google's public keys could not be fetched", bad: true },
  'google_failed:bad_signature': { text: 'A Google sign-in had a wrong signature (forged or damaged)' },
  'google_failed:expired': { text: 'A Google sign-in had expired by the time it arrived' },
  'google_failed:email_not_verified': { text: 'A Google account without a verified email tried to sign in' },
  'google_failed:wrong_issuer': { text: 'A sign-in token was not issued by Google' },
  'google_failed:malformed': { text: 'A broken sign-in token was sent' },
  'google_failed:bad_algorithm': { text: 'A sign-in token used a signing method we do not accept' },
  'google_failed:unknown_key': { text: 'A sign-in token used a key Google does not publish' },
  'google_failed:no_email': { text: 'A Google sign-in carried no email address' },
  'google_failed:not_yet_valid': { text: 'A Google sign-in was dated in the future (clock difference)' },
  'client:google_script_failed': { text: 'The Google script could not load in a browser (blocked or offline)' },
  'client:google_script_slow': { text: 'The Google script was slow, so the email form was offered' },
  'client:google_signin_failed': { text: 'A visitor clicked Google but the server refused the sign-in' },
  'client:google_hint_used': { text: 'A visitor chose the email code instead of Google' },
  'client:engine_failed_python': { text: 'The Python engine could not start in a browser' },
  'client:engine_failed_cpp': { text: 'The C++ engine could not start in a browser' },
  'client:engine_failed_java': { text: 'The Java engine could not start in a browser' }
};
const PROBLEM_METRICS = Object.keys(EVENT_TEXT);

export function adminView(ctx) {
  const tip = createTooltip();
  const body = h('div', { class: 'admin-body' });
  let tab = 'overview';
  const tabButtons = {};

  const tabs = h('div', { class: 'admin-tabs', role: 'tablist', 'aria-label': 'Admin sections' },
    [['overview', 'Overview'], ['members', 'Members'], ['problems', 'Problems']].map(([id, label]) => {
      const b = h('button', { type: 'button', role: 'tab', 'aria-selected': String(id === tab), text: label, onClick: () => show(id) });
      tabButtons[id] = b;
      return b;
    }));
  const refresh = h('button', { class: 'btn btn-ghost', type: 'button', text: 'Refresh', onClick: () => show(tab) });

  const page = h('div', { class: 'page admin' },
    h('div', { class: 'page-head admin-head' },
      h('div', null, h('h2', { text: 'Admin' }), h('p', { text: 'Only admins can see this page. It shows counts and names, never anyone\'s code or notes.' })),
      refresh),
    tabs, body, tip.el);

  function loading() {
    body.replaceChildren(h('div', { class: 'card empty' }, h('p', { class: 'muted', text: 'Loading...' })));
  }
  function failed(err, retry) {
    body.replaceChildren(h('div', { class: 'card empty' }, h('h3', { text: 'Could not load this section' }), h('p', { text: describeError(err) }),
      h('button', { class: 'btn btn-primary', type: 'button', text: 'Try again', onClick: retry })));
  }

  async function show(id) {
    tab = id;
    for (const [key, b] of Object.entries(tabButtons)) b.setAttribute('aria-selected', String(key === id));
    tip.hide();
    loading();
    try {
      if (id === 'overview') body.replaceChildren(...renderOverview(await api('/api/admin/overview')));
      else if (id === 'members') renderMembers();
      else body.replaceChildren(...renderProblems(await api('/api/admin/problems'), (await loadIndex()).problems));
    } catch (err) {
      failed(err, () => show(id));
    }
  }

  // ---------- Overview ----------

  function renderOverview(data) {
    const t = data.totals;
    const m = data.metrics;
    const today = data.days[data.days.length - 1];
    const per = (metric) => data.days.map((d) => (m[metric] && m[metric][d]) || 0);
    const total = (metric) => sum(m[metric]);
    const todayOf = (metric) => (m[metric] && m[metric][today]) || 0;

    // 1. Anything that needs the owner's attention today comes first.
    const attention = Object.keys(EVENT_TEXT).filter((k) => EVENT_TEXT[k].bad && todayOf(k) > 0);
    const notice = attention.length
      ? h('div', { class: 'alert alert-error', role: 'alert' },
        h('strong', { text: 'Needs attention today: ' }),
        attention.map((k, i) => h('span', { text: `${i ? '; ' : ''}${EVENT_TEXT[k].text} (${todayOf(k)})` })))
      : h('div', { class: 'alert alert-info', text: 'Nothing needs attention today: no server errors, no failed emails.' });

    const tiles = h('div', { class: 'stat-row' },
      statTile({ label: 'Members', value: t.members, hint: `${plural(t.signups7, 'new member', 'new members')} this week, ${t.signups30.toLocaleString()} in 30 days` }),
      statTile({ label: 'Active today', value: t.active1, hint: `${t.active7.toLocaleString()} this week, ${t.active30.toLocaleString()} this month` }),
      statTile({ label: 'Solutions', value: t.solves, hint: `${plural(t.solvers, 'member has', 'members have')} solved something` }),
      statTile({ label: 'Linked to Google', value: t.googleLinked, hint: t.members ? `${Math.round((t.googleLinked / t.members) * 100)}% of members` : 'No members yet' }));

    const signupDays = data.days.map((d) => data.signups[d] || 0);
    const solveDays = data.days.map((d) => data.solvesPerDay[d] || 0);
    const dayRows = (values) => data.days.map((d, i) => [shortDay(d), values[i]]);
    const chartCard = (title, subtitle, values, noun, label) => h('section', { class: 'card prog-card' },
      h('h3', { text: title }),
      h('p', { class: 'sub', text: subtitle }),
      columnChart({ days: data.days, values, noun, tip, ariaLabel: label }),
      tableView('View as a table', ['Day', noun[1][0].toUpperCase() + noun[1].slice(1)], dayRows(values)));
    const charts = h('div', { class: 'prog-row prog-two' },
      chartCard('New members', `${plural(signupDays.reduce((a, b) => a + b, 0), 'sign-up', 'sign-ups')} in the last 30 days.`, signupDays, ['sign-up', 'sign-ups'], 'New members on each of the last 30 days'),
      chartCard('Solutions', `${plural(solveDays.reduce((a, b) => a + b, 0), 'solution', 'solutions')} in the last 30 days.`, solveDays, ['solution', 'solutions'], 'Solutions on each of the last 30 days'));

    // 2. How people sign in, over the last 30 days.
    const loginRows = [
      { label: 'Logged in with Google', value: total('login_google') },
      { label: 'Logged in with an email code', value: total('login_otp') },
      { label: 'Joined with Google', value: total('signup_google') },
      { label: 'Joined with an email code', value: total('signup_otp') }
    ];
    const googleShare = (() => {
      const g = total('login_google') + total('signup_google');
      const all = g + total('login_otp') + total('signup_otp');
      return all ? `${Math.round((g / all) * 100)}% of sign-ins used Google.` : 'No sign-ins counted yet.';
    })();
    const emailLimit = data.emails.dailyCap ? data.emails.sentToday / data.emails.dailyCap : 0;
    const signinCard = h('section', { class: 'card prog-card' },
      h('h3', { text: 'How people sign in' }),
      h('p', { class: 'sub', text: `Last 30 days. ${googleShare}` }),
      rankedBars({ rows: loginRows, noun: ['sign-in', 'sign-ins'], tip }),
      h('div', { class: 'meter-row admin-meter' },
        h('div', { class: 'meter-name', text: 'Login emails sent today' }),
        h('div', { class: 'meter-count', text: `${data.emails.sentToday} / ${data.emails.dailyCap}` }),
        h('progress', { class: 'bar tint', max: data.emails.dailyCap || 1, value: data.emails.sentToday, 'aria-label': `${data.emails.sentToday} of ${data.emails.dailyCap} login emails sent today` })),
      emailLimit >= 0.8 ? h('p', { class: 'alert alert-error', role: 'alert', text: 'The daily email limit is nearly used up. Google sign-in helps, because it sends no email.' }) : null);

    // 3. What went wrong: every counter with a plain-English meaning, for the last 30 days.
    const seen = new Set(PROBLEM_METRICS);
    const known = PROBLEM_METRICS.filter((k) => total(k) > 0);
    const unknown = Object.keys(m).filter((k) => !seen.has(k) && /^(google_failed:|client:)/.test(k) && total(k) > 0);
    const problemRows = [...known, ...unknown].map((k) => [(EVENT_TEXT[k] || { text: k }).text, total(k), todayOf(k)]);
    const issuesCard = h('section', { class: 'card prog-card' },
      h('h3', { text: 'What went wrong' }),
      h('p', { class: 'sub', text: 'Counts from the last 30 days. Nobody is named: only how often it happened.' }),
      problemRows.length
        ? h('table', { class: 'admin-table' },
          h('thead', null, h('tr', null, ['What happened', '30 days', 'Today'].map((c) => h('th', { text: c })))),
          h('tbody', null, problemRows.map((r) => h('tr', null, h('td', { text: r[0] }), h('td', { class: 'num', text: String(r[1]) }), h('td', { class: 'num', text: String(r[2]) })))))
        : h('p', { class: 'muted', text: 'Nothing went wrong in the last 30 days, or nothing has been counted yet.' }));

    // 4. Who the members are.
    const countryCard = h('section', { class: 'card prog-card' },
      h('h3', { text: 'Where members are' }),
      h('p', { class: 'sub', text: 'The ten biggest countries.' }),
      rankedBars({ rows: data.countries.map((c) => ({ label: countryName(c.country), value: c.n })), noun: ['member', 'members'], tip }));
    const languageCard = h('section', { class: 'card prog-card' },
      h('h3', { text: 'Languages' }),
      h('p', { class: 'sub', text: 'Preferred language of members, and solutions by language.' }),
      h('h4', { class: 'admin-mini', text: 'Preferred' }),
      rankedBars({ rows: data.languages.map((l) => ({ label: languageLabel(l.lang), value: l.n })).sort((a, b) => b.value - a.value), noun: ['member', 'members'], tip }),
      h('h4', { class: 'admin-mini', text: 'Solved in' }),
      rankedBars({ rows: data.solvedByLang.map((l) => ({ label: languageLabel(l.lang), value: l.n })).sort((a, b) => b.value - a.value), noun: ['solution', 'solutions'], tip }));

    const logCard = h('section', { class: 'card prog-card' },
      h('h3', { text: 'What admins did' }),
      data.adminLog.length
        ? h('table', { class: 'admin-table' },
          h('thead', null, h('tr', null, ['When', 'Admin', 'Action', 'Member'].map((c) => h('th', { text: c })))),
          h('tbody', null, data.adminLog.map((e) => h('tr', null, h('td', { text: when(e.at) }), h('td', { text: e.admin || 'removed' }), h('td', { text: e.action.replace('_', ' ') }), h('td', { text: e.target })))))
        : h('p', { class: 'muted', text: 'No admin action yet.' }));

    return [notice, tiles, charts, h('div', { class: 'prog-row prog-two' }, signinCard, issuesCard), h('div', { class: 'prog-row prog-two' }, countryCard, languageCard), logCard];
  }

  // ---------- Members ----------

  function renderMembers() {
    let query = '';
    let timer = null;
    let nextCursor = null;
    const tbody = h('tbody');
    const more = h('button', { class: 'btn btn-ghost', type: 'button', text: 'Show more', hidden: true });
    const status = h('p', { class: 'muted admin-status', role: 'status' });
    const search = h('input', { class: 'input', type: 'search', placeholder: 'Search by email, name or user ID (start of the text)', 'aria-label': 'Search members', maxlength: '60' });

    const act = async (member, action, label) => {
      const text = action === 'delete'
        ? `Delete ${member.userId} (${member.email}) and everything they saved? This cannot be undone.`
        : `${label} for ${member.userId} (${member.email})?`;
      if (!window.confirm(text)) return;
      try {
        await api(`/api/admin/users/${encodeURIComponent(member.userId)}`, { method: 'POST', body: { action } });
        toast(action === 'delete' ? 'Account deleted' : action === 'sign_out' ? 'Signed out everywhere' : 'Photo removed');
        load(true);
      } catch (err) {
        toast(err && err.code === 'is_admin' ? 'An admin account cannot be deleted here.' : describeError(err));
      }
    };

    const row = (m) => {
      const buttons = h('div', { class: 'admin-actions' },
        m.hasPhoto ? h('button', { class: 'btn btn-ghost btn-sm', type: 'button', text: 'Remove photo', onClick: () => act(m, 'remove_photo', 'Remove the photo') }) : null,
        h('button', { class: 'btn btn-ghost btn-sm', type: 'button', text: 'Sign out', onClick: () => act(m, 'sign_out', 'Sign out of every device') }),
        m.isAdmin ? null : h('button', { class: 'btn btn-ghost btn-sm danger', type: 'button', text: 'Delete', onClick: () => act(m, 'delete', 'Delete the account') }));
      return h('tr', null,
        h('td', null, h('span', { class: 'user-id small', text: m.userId }), m.isAdmin ? h('span', { class: 'badge', text: 'admin' }) : null),
        h('td', { text: m.name || '-' }),
        h('td', { class: 'break', text: m.email }),
        h('td', { text: `${countryName(m.country)}` }),
        h('td', { text: languageLabel(m.language) }),
        h('td', { class: 'num', text: String(m.solved) }),
        h('td', { text: m.google ? 'Google' : 'Email code' }),
        h('td', { text: when(m.createdAt) }),
        h('td', { text: when(m.lastLoginAt) }),
        h('td', null, buttons));
    };

    async function load(reset) {
      if (reset) { nextCursor = null; tbody.replaceChildren(); }
      more.disabled = true;
      status.textContent = 'Loading...';
      try {
        const params = new URLSearchParams();
        if (query) params.set('q', query);
        if (!reset && nextCursor) params.set('before', String(nextCursor));
        const data = await api('/api/admin/users?' + params.toString());
        tbody.append(...data.users.map(row));
        nextCursor = data.next;
        more.hidden = !data.next;
        status.textContent = tbody.children.length ? '' : (query ? 'No member matches that.' : 'No members yet.');
      } catch (err) {
        status.textContent = describeError(err);
      }
      more.disabled = false;
    }

    search.addEventListener('input', () => {
      clearTimeout(timer);
      timer = setTimeout(() => { query = search.value.trim(); load(true); }, 300);
    });
    more.addEventListener('click', () => load(false));

    body.replaceChildren(h('section', { class: 'card prog-card' },
      h('h3', { text: 'Members' }),
      h('p', { class: 'sub', text: 'Newest first. Admins see emails here; no other page of the site shows them.' }),
      h('div', { class: 'admin-search' }, search),
      h('div', { class: 'admin-scroll' },
        h('table', { class: 'admin-table' },
          h('thead', null, h('tr', null, ['User ID', 'Name', 'Email', 'Country', 'Language', 'Solved', 'Signs in with', 'Joined', 'Last login', ''].map((c) => h('th', { text: c })))),
          tbody)),
      status,
      h('div', { class: 'sub-more' }, more)));
    load(true);
  }

  // ---------- Problems ----------

  function renderProblems(data, problems) {
    const bySlug = new Map(problems.map((p) => [p.slug, p]));
    const name = (slug) => { const p = bySlug.get(slug); return p ? `${p.order}. ${p.title}` : slug; };
    const most = h('section', { class: 'card prog-card' },
      h('h3', { text: 'Solved by the most members' }),
      h('p', { class: 'sub', text: 'The 25 problems with the most members who solved them.' }),
      rankedBars({ rows: data.mostSolved.map((r) => ({ label: name(r.slug), value: r.solvers })), noun: ['member', 'members'], tip, empty: 'No problem has been solved yet.' }));
    const stuck = h('section', { class: 'card prog-card' },
      h('h3', { text: 'Where members get stuck' }),
      h('p', { class: 'sub', text: 'Problems that members opened (hints, solution or submissions) but did not solve, most first.' }),
      data.struggle.length
        ? h('div', { class: 'admin-scroll' }, h('table', { class: 'admin-table' },
          h('thead', null, h('tr', null, ['Problem', 'Opened by', 'Solved by', 'Not solved', 'Hints used', 'Solutions opened', 'Submissions'].map((c) => h('th', { text: c })))),
          h('tbody', null, data.struggle.map((r) => h('tr', null,
            h('td', { text: name(r.slug) }), h('td', { class: 'num', text: String(r.learners) }), h('td', { class: 'num', text: String(r.solvers) }),
            h('td', { class: 'num', text: String(r.stuck) }), h('td', { class: 'num', text: String(r.hints) }), h('td', { class: 'num', text: String(r.revealed) }), h('td', { class: 'num', text: String(r.attempts) }))))))
        : h('p', { class: 'muted', text: 'No activity yet.' }));
    return [most, stuck];
  }

  show('overview');
  return page;
}
