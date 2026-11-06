// Log in / sign up with Google or with an email code.
//
//   Google          one click; a new member then gives a name, country and state ("One more step").
//   Email code      type the email, then the 6-digit code. A new member gives the same details with the form.
//
// The email code is always right next to the Google button. If Google does not load, does not open, or the server refuses
// the sign-in, the page says what happened and points to the email code, so nobody is ever locked out by Google.

import { h, icon, logoMark } from '../dom.js';
import { api, ApiError, describeError, reportEvent } from '../api.js';
import { COUNTRY_CODES, STATES } from '../data/geo.js';
import { LANGUAGES } from '../data/topics.js';
import { createTurnstile } from '../components/turnstile.js';
import { createGoogleButton } from '../components/google-button.js';
import { createPhotoPicker } from '../components/photo-picker.js';
import { letterAvatar } from '../components/avatar.js';

const regions = new Intl.DisplayNames(['en'], { type: 'region' });
const COUNTRIES = COUNTRY_CODES.map((code) => ({ code, name: regions.of(code) || code })).sort((a, b) => a.name.localeCompare(b.name));
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const GOOGLE_TIMEOUT_MS = 20000;

// ctx: { config, onAuthenticated(user, isNewUser) }
export function loginView(ctx) {
  const { config } = ctx;
  const data = { firstName: '', lastName: '', email: '', country: '', state: '', language: 'cpp', photo: '' };
  let mode = 'login';       // 'login' | 'signup'
  let turnstile = null;
  let googleButton = null;
  let timer = null;
  let secondsLeft = 0;

  const card = h('div', { class: 'auth-card' });

  function teardown() {
    if (turnstile) { turnstile.destroy(); turnstile = null; }
    if (googleButton) { googleButton.destroy(); googleButton = null; }
    clearInterval(timer);
  }

  // ---- Small building blocks ----------------------------------------------------------------

  function textField({ name, label, type = 'text', autocomplete, maxlength, placeholder, onInput }) {
    const error = h('p', { class: 'field-error', id: `e-${name}`, role: 'alert' });
    const input = h('input', {
      class: 'input', id: `f-${name}`, name, type, autocomplete, maxlength, placeholder,
      value: data[name], 'aria-describedby': `e-${name}`
    });
    input.addEventListener('input', () => {
      data[name] = input.value;
      input.removeAttribute('aria-invalid');
      error.textContent = '';
      if (onInput) onInput();
    });
    return { name, input, error, el: h('div', { class: 'field' }, h('label', { htmlFor: `f-${name}`, text: label }), input, error) };
  }

  function selectField({ name, label, options, placeholder, onChange }) {
    const error = h('p', { class: 'field-error', id: `e-${name}`, role: 'alert' });
    const select = h('select', { class: 'select', id: `f-${name}`, name, 'aria-describedby': `e-${name}` },
      h('option', { value: '', text: placeholder }),
      options.map((o) => h('option', { value: o.value, text: o.label, selected: data[name] === o.value }))
    );
    select.addEventListener('change', () => {
      data[name] = select.value;
      select.removeAttribute('aria-invalid');
      error.textContent = '';
      if (onChange) onChange();
    });
    return { name, input: select, error, el: h('div', { class: 'field' }, h('label', { htmlFor: `f-${name}`, text: label }), select, error) };
  }

  // The messages of a form: one general message, and an error under each field (and under the photo).
  function notifier(fields, message, getPhotoPicker) {
    function showMessage(text, kind = 'error') {
      message.replaceChildren(text ? h('p', { class: `alert alert-${kind}`, text }) : '');
    }
    function showFieldErrors(errors) {
      let first = null;
      const photoPicker = getPhotoPicker();
      for (const [name, text] of Object.entries(errors)) {
        if (name === 'photo' && photoPicker) { photoPicker.setError(text); first = first || photoPicker.el; continue; }
        const f = fields[name];
        if (!f) { showMessage(text); continue; }
        f.error.textContent = text;
        f.input.setAttribute('aria-invalid', 'true');
        first = first || f.input;
      }
      if (first && first.focus) first.focus();
    }
    return { showMessage, showFieldErrors };
  }

  const profileOf = () => ({ firstName: data.firstName, lastName: data.lastName, country: data.country, state: data.state, language: data.language, photo: data.photo });

  // What a new member has to give, checked in the browser first (the server checks again).
  function profileProblems() {
    const problems = {};
    if (!data.firstName.trim()) problems.firstName = 'Enter your first name.';
    if (!data.country) problems.country = 'Choose your country.';
    if (!String(data.state).trim()) problems.state = STATES[data.country] ? 'Choose your state.' : 'Enter your state or region.';
    if (config.photoRequired && !data.photo) problems.photo = 'Add a profile photo to continue.';
    return problems;
  }

  // The name, country, state, language and photo fields: shared by the sign-up form and the step after Google.
  // withEmail adds the email field between the names and the country (the sign-up form needs it, Google already gave it).
  function profileGrid(fields, { withEmail }) {
    let photoPicker = null;
    // The letter logo in the photo picker follows the first name as it is typed.
    fields.firstName = textField({
      name: 'firstName', label: 'First name', autocomplete: 'given-name', maxlength: '40',
      onInput: () => { if (photoPicker) photoPicker.refresh(); }
    });
    fields.lastName = textField({ name: 'lastName', label: 'Last name', autocomplete: 'family-name', maxlength: '40' });
    fields.country = selectField({
      name: 'country', label: 'Country', placeholder: 'Select your country',
      options: COUNTRIES.map((c) => ({ value: c.code, label: c.name })),
      onChange: () => { data.state = ''; renderStateField(); }
    });
    const stateSlot = h('div', { class: 'full-slot' });
    function renderStateField() {
      const list = STATES[data.country];
      fields.state = list
        ? selectField({ name: 'state', label: 'State', placeholder: 'Select your state', options: list.map((s) => ({ value: s, label: s })) })
        : textField({ name: 'state', label: 'State / province / region', autocomplete: 'address-level1', maxlength: '60' });
      stateSlot.replaceChildren(fields.state.el);
    }
    renderStateField();

    const language = h('div', { class: 'field' },
      h('span', { class: 'field-label', id: 'lang-label', text: 'Preferred language' }),
      h('div', { class: 'segmented block', role: 'radiogroup', 'aria-labelledby': 'lang-label' },
        LANGUAGES.map((l) =>
          h('label', null,
            h('input', { type: 'radio', name: 'language', value: l.id, checked: data.language === l.id, onChange: () => { data.language = l.id; } }),
            h('span', { text: l.label })
          )
        )
      )
    );
    photoPicker = createPhotoPicker({
      initial: data.photo,
      hint: config.photoRequired
        ? 'Other members can see your photo.'
        : 'Optional. Skip it and we will make a letter logo from your name. Other members can see it.',
      fallback: () => {
        const first = Array.from(data.firstName.trim())[0];
        return first ? letterAvatar(first, 88) : icon('image', 32);
      },
      onChange: (url) => { data.photo = url; }
    });

    const body = h('div', { class: 'form-grid' },
      fields.firstName.el, fields.lastName.el,
      withEmail ? h('div', { class: 'full' }, fields.email.el) : null,
      fields.country.el, stateSlot,
      h('div', { class: 'full' }, language),
      h('div', { class: 'full' }, photoPicker.el)
    );
    return { body, getPhotoPicker: () => photoPicker };
  }

  // ---- Step 1: the form --------------------------------------------------------------------

  function renderForm() {
    teardown();
    const fields = {};
    const message = h('div', { role: 'alert' });
    const signup = mode === 'signup';

    fields.email = textField({ name: 'email', label: 'Email', type: 'email', autocomplete: 'email', maxlength: '254', placeholder: 'you@example.com' });
    const tabs = h('div', { class: 'tabs', role: 'tablist' },
      ['login', 'signup'].map((m) =>
        h('button', {
          type: 'button', role: 'tab', 'aria-selected': String(mode === m), text: m === 'login' ? 'Log in' : 'Sign up',
          onClick: () => { if (mode !== m) { mode = m; renderForm(); } }
        })
      )
    );

    let body;
    let getPhotoPicker = () => null;
    if (signup) {
      const grid = profileGrid(fields, { withEmail: true });
      body = grid.body;
      getPhotoPicker = grid.getPhotoPicker;
    } else {
      body = fields.email.el;
    }
    const { showMessage, showFieldErrors } = notifier(fields, message, () => getPhotoPicker());

    const submit = h('button', { class: 'btn btn-primary btn-block', type: 'submit' }, signup ? 'Create account' : 'Send me a code');
    turnstile = createTurnstile(config.turnstileSiteKey);

    const form = h('form', { class: 'form', novalidate: true },
      body,
      turnstile.el,
      message,
      h('div', { class: 'form-actions' },
        submit,
        h('p', { class: 'form-switch' },
          signup ? 'Already have an account? ' : 'New here? ',
          h('button', { class: 'btn-link', type: 'button', text: signup ? 'Log in' : 'Create an account', onClick: () => { mode = signup ? 'login' : 'signup'; renderForm(); } })
        )
      )
    );

    // Sends the person to the email form: used when Google does not work, and by the hint under the Google button.
    function useEmailInstead() {
      form.classList.add('attention');
      const target = fields.email.input;
      target.focus();
      target.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      showMessage('');
      data.email = data.email.trim();
      const problems = {};
      if (!EMAIL_RE.test(data.email)) problems.email = 'Enter a valid email address.';
      if (signup) Object.assign(problems, profileProblems());
      if (Object.keys(problems).length) { showFieldErrors(problems); return; }
      if (!turnstile.token()) { showMessage('Please finish the human check above first.'); return; }

      submit.disabled = true;
      submit.replaceChildren(h('span', { class: 'spinner' }), 'Sending code');
      try {
        await api('/api/auth/request-otp', {
          method: 'POST',
          body: { purpose: mode, email: data.email, turnstileToken: turnstile.token(), profile: signup ? profileOf() : undefined }
        });
        secondsLeft = config.resendSeconds;
        renderCode();
      } catch (err) {
        if (err instanceof ApiError && err.code === 'invalid_input' && err.data.fields) showFieldErrors(err.data.fields);
        else showMessage(describeError(err));
        turnstile.reset();
        submit.disabled = false;
        submit.replaceChildren(signup ? 'Create account' : 'Send me a code');
      }
    });

    // ---- The Google part (only when the server has a Google client id) ----
    let google = null;
    if (config.googleClientId) {
      const status = h('p', { class: 'google-status', role: 'status' });
      const alertBox = h('div', { role: 'alert' });
      const button = createGoogleButton({
        clientId: config.googleClientId,
        onCredential: (credential) => signInWithGoogle(credential, { alertBox, status, useEmailInstead }),
        onState: (state) => {
          if (state === 'ready') status.textContent = '';
          else if (state === 'slow') { status.textContent = 'Google is taking a while to load. You can use an email code instead.'; reportEvent('google_script_slow'); }
          else if (state === 'failed') {
            status.textContent = '';
            button.el.replaceChildren(h('p', { class: 'alert alert-info', text: 'Google sign-in could not load. An extension or a network setting may be blocking it. Please use an email code below.' }));
            reportEvent('google_script_failed');
          }
        }
      });
      googleButton = button;
      google = h('div', { class: 'google-block' },
        button.el,
        status,
        alertBox,
        h('p', { class: 'google-hint' },
          'Google did not open, or nothing happened? ',
          h('button', { class: 'btn-link', type: 'button', text: 'Use an email code instead', onClick: () => { reportEvent('google_hint_used'); useEmailInstead(); } })
        ),
        h('div', { class: 'divider', role: 'separator' }, h('span', { text: 'or use an email code' }))
      );
    }

    card.replaceChildren(
      tabs,
      h('h2', { text: signup ? 'Create your free account' : 'Welcome back' }),
      h('p', { class: 'sub', text: config.googleClientId
        ? (signup ? 'Continue with Google, or fill in the form and we will email you a code. No password needed.' : 'Continue with Google, or ask for a one-time code by email.')
        : (signup ? 'We will email you a code to confirm it is really you. No password needed.' : 'Enter your email and we will send you a one-time code.') }),
      google,
      form
    );
    const first = google ? null : (fields.firstName || fields.email);
    if (first) first.input.focus();
  }

  // ---- Google: the token arrived, ask the server to sign the person in ---------------------------

  let googleBusy = false;
  async function signInWithGoogle(credential, { alertBox, status, useEmailInstead }) {
    if (googleBusy) return;
    googleBusy = true;
    alertBox.replaceChildren();
    status.textContent = 'Signing you in with Google…';
    try {
      const result = await api('/api/auth/google', { method: 'POST', body: { credential }, timeoutMs: GOOGLE_TIMEOUT_MS });
      if (result.needsProfile) { renderGoogleProfile(credential, result.suggested); return; }
      ctx.onAuthenticated(result.user, result.isNewUser);
    } catch (err) {
      status.textContent = '';
      alertBox.replaceChildren(h('p', { class: 'alert alert-error', text: describeError(err) }));
      if (!(err instanceof ApiError && err.code === 'rate_limited')) reportEvent('google_signin_failed');
      useEmailInstead();   // whatever went wrong, the email code is the way forward
    } finally {
      googleBusy = false;
    }
  }

  // ---- Step after Google: the first time, the account needs a name, a country and a state ----------

  function renderGoogleProfile(credential, suggested) {
    teardown();
    data.email = suggested.email;
    if (!data.firstName) data.firstName = suggested.firstName || '';
    if (!data.lastName) data.lastName = suggested.lastName || '';
    const fields = {};
    const message = h('div', { role: 'alert' });
    const grid = profileGrid(fields, { withEmail: false });
    const { showMessage, showFieldErrors } = notifier(fields, message, grid.getPhotoPicker);
    const submit = h('button', { class: 'btn btn-primary btn-block', type: 'submit', text: 'Create my account' });

    const form = h('form', { class: 'form', novalidate: true },
      grid.body,
      message,
      h('div', { class: 'form-actions' },
        submit,
        h('p', { class: 'form-switch' }, h('button', { class: 'btn-link', type: 'button', text: 'Use a different way to sign in', onClick: () => renderForm() }))
      )
    );
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      showMessage('');
      const problems = profileProblems();
      if (Object.keys(problems).length) { showFieldErrors(problems); return; }
      submit.disabled = true;
      submit.replaceChildren(h('span', { class: 'spinner' }), 'Creating your account');
      try {
        const result = await api('/api/auth/google', { method: 'POST', body: { credential, profile: profileOf() }, timeoutMs: GOOGLE_TIMEOUT_MS });
        ctx.onAuthenticated(result.user, result.isNewUser);
      } catch (err) {
        if (err instanceof ApiError && err.code === 'invalid_input' && err.data.fields) showFieldErrors(err.data.fields);
        else if (err instanceof ApiError && err.code === 'google_failed') {
          showMessage(describeError(err));
          submit.replaceChildren('Create my account');
          submit.disabled = true;
          form.append(h('button', { class: 'btn btn-ghost btn-block', type: 'button', text: 'Start again', onClick: () => renderForm() }));
          return;
        } else showMessage(describeError(err));
        submit.disabled = false;
        submit.replaceChildren('Create my account');
      }
    });

    card.replaceChildren(
      h('h2', { text: 'One more step' }),
      h('p', { class: 'sub' }, 'Google confirmed ', h('strong', { text: suggested.email }), '. Tell us a little about you to create your free account.'),
      form
    );
    fields.firstName.input.focus();
  }

  // ---- Step 2 of the email way: the code ----------------------------------------------------

  function renderCode() {
    teardown();
    const message = h('div', { role: 'alert' });
    const code = h('input', {
      class: 'input code-input', id: 'f-code', type: 'text', inputMode: 'numeric', autocomplete: 'one-time-code',
      maxlength: '6', placeholder: '······', 'aria-label': '6-digit code'
    });
    const verify = h('button', { class: 'btn btn-primary btn-block', type: 'submit', text: 'Verify and continue' });
    const resend = h('button', { class: 'btn-link', type: 'button', text: 'Resend code', disabled: true });
    const resendNote = h('span');
    let busy = false;
    let locked = false;

    turnstile = createTurnstile(config.turnstileSiteKey, { quiet: true, onChange: () => updateResend() });

    function showMessage(text, kind = 'error') {
      message.replaceChildren(text ? h('p', { class: `alert alert-${kind}`, text }) : '');
    }
    function updateResend() {
      const waiting = secondsLeft > 0;
      resend.disabled = waiting || !turnstile || !turnstile.token();
      resendNote.textContent = waiting ? `You can ask for a new code in ${secondsLeft}s` : '';
    }

    async function submitCode() {
      if (busy || locked) return;
      const value = code.value.replace(/\D/g, '');
      if (value.length !== 6) { showMessage('Enter the 6-digit code from your email.'); return; }
      busy = true;
      verify.disabled = true;
      verify.replaceChildren(h('span', { class: 'spinner' }), 'Checking');
      try {
        const result = await api('/api/auth/verify-otp', { method: 'POST', body: { email: data.email, code: value } });
        ctx.onAuthenticated(result.user, result.isNewUser);
      } catch (err) {
        showMessage(describeError(err));
        if (err instanceof ApiError && err.code === 'too_many_attempts') locked = true;
        code.value = '';
        code.focus();
        busy = false;
        verify.disabled = locked;
        verify.replaceChildren('Verify and continue');
      }
    }

    code.addEventListener('input', () => {
      code.value = code.value.replace(/\D/g, '').slice(0, 6);
      if (code.value.length === 6) submitCode();
    });

    resend.addEventListener('click', async () => {
      resend.disabled = true;
      showMessage('');
      try {
        await api('/api/auth/request-otp', {
          method: 'POST',
          body: { purpose: mode, email: data.email, turnstileToken: turnstile.token(), profile: mode === 'signup' ? profileOf() : undefined }
        });
        locked = false;
        verify.disabled = false;
        secondsLeft = config.resendSeconds;
        showMessage('A new code is on its way.', 'info');
      } catch (err) {
        showMessage(describeError(err));
      }
      turnstile.reset();
      updateResend();
    });

    timer = setInterval(() => {
      if (secondsLeft > 0) secondsLeft -= 1;
      updateResend();
    }, 1000);

    const form = h('form', { class: 'form', novalidate: true },
      h('div', { class: 'field' }, h('label', { htmlFor: 'f-code', text: 'Your code' }), code),
      turnstile.el,
      message,
      h('div', { class: 'form-actions' },
        verify,
        h('div', { class: 'resend-row' }, resendNote, resend)
      ),
      h('p', { class: 'form-switch' }, h('button', { class: 'btn-link', type: 'button', text: 'Use a different email, or Google', onClick: () => renderForm() }))
    );
    form.addEventListener('submit', (e) => { e.preventDefault(); submitCode(); });

    card.replaceChildren(
      h('h2', { text: 'Check your email' }),
      h('p', { class: 'sub' },
        'A 6-digit code is on its way to ', h('strong', { text: data.email }), `. It works for ${config.codeMinutes} minutes. Nothing yet? Check your spam folder, or make sure you typed the email you signed up with.`
      ),
      form
    );
    updateResend();
    code.focus();
  }

  // ---- The page ------------------------------------------------------------------------------

  const point = (title, text) =>
    h('li', null, icon('check', 20), h('span', null, h('strong', { text: title }), ' ' + text));

  const root = h('div', { class: 'auth' },
    h('section', { class: 'auth-brand' },
      h('a', { class: 'brand', href: '#/login' }, logoMark(), config.appName),
      h('div', { class: 'auth-hero' },
        h('h1', null, 'Learn DSA by ', h('em', { text: 'solving' }), ', not by watching.'),
        h('p', { text: 'A free place to learn Data Structures and Algorithms: a short idea first, then problems you crack on your own.' }),
        h('ul', { class: 'auth-points' },
          point('Concept first.', 'A quick note explains the idea, then you build the logic yourself.'),
          point('Ten topics.', 'From Big-O to segment trees, each with Easy, Medium and Hard problems.'),
          point('Free for everyone.', 'No ads, no paywall, no limits.')
        ),
        h('div', { class: 'lang-chips', 'aria-label': 'Supported languages' }, LANGUAGES.map((l) => h('span', { class: 'chip', text: l.label })))
      ),
      h('p', { class: 'auth-foot' },
        'Your email is only used to sign you in. ',
        h('a', { href: '/privacy.html', text: 'Privacy' }), ' · ', h('a', { href: '/terms.html', text: 'Terms' })
      )
    ),
    h('section', { class: 'auth-main', id: 'login-main' }, card)
  );

  renderForm();
  return root;
}
