// Log in / sign up with an email code. Two steps: the form, then the 6-digit code.
// A new member also gives a name, country, state and a profile photo.

import { h, icon, logoMark } from '../dom.js';
import { api, ApiError, describeError } from '../api.js';
import { COUNTRY_CODES, STATES } from '../data/geo.js';
import { LANGUAGES } from '../data/topics.js';
import { createTurnstile } from '../components/turnstile.js';
import { createPhotoPicker } from '../components/photo-picker.js';
import { letterAvatar } from '../components/avatar.js';

const regions = new Intl.DisplayNames(['en'], { type: 'region' });
const COUNTRIES = COUNTRY_CODES.map((code) => ({ code, name: regions.of(code) || code })).sort((a, b) => a.name.localeCompare(b.name));
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// ctx: { config, onAuthenticated(user, isNewUser) }
export function loginView(ctx) {
  const { config } = ctx;
  const data = { firstName: '', lastName: '', email: '', country: '', state: '', language: 'cpp', photo: '' };
  let mode = 'login';       // 'login' | 'signup'
  let turnstile = null;
  let timer = null;
  let secondsLeft = 0;

  const card = h('div', { class: 'auth-card' });

  function teardown() {
    if (turnstile) { turnstile.destroy(); turnstile = null; }
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
    let photoPicker = null;
    if (signup) {
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

      body = h('div', { class: 'form-grid' },
        fields.firstName.el, fields.lastName.el,
        h('div', { class: 'full' }, fields.email.el),
        fields.country.el, stateSlot,
        h('div', { class: 'full' }, language),
        h('div', { class: 'full' }, photoPicker.el)
      );
    } else {
      body = fields.email.el;
    }

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

    function showMessage(text, kind = 'error') {
      message.replaceChildren(text ? h('p', { class: `alert alert-${kind}`, text }) : '');
    }
    function showFieldErrors(errors) {
      let first = null;
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

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      showMessage('');
      data.email = data.email.trim();
      const problems = {};
      if (!EMAIL_RE.test(data.email)) problems.email = 'Enter a valid email address.';
      if (signup) {
        if (!data.firstName.trim()) problems.firstName = 'Enter your first name.';
        if (!data.country) problems.country = 'Choose your country.';
        if (!String(data.state).trim()) problems.state = STATES[data.country] ? 'Choose your state.' : 'Enter your state or region.';
        if (config.photoRequired && !data.photo) problems.photo = 'Add a profile photo to continue.';
      }
      if (Object.keys(problems).length) { showFieldErrors(problems); return; }
      if (!turnstile.token()) { showMessage('Please finish the human check above first.'); return; }

      submit.disabled = true;
      submit.replaceChildren(h('span', { class: 'spinner' }), 'Sending code');
      try {
        await api('/api/auth/request-otp', {
          method: 'POST',
          body: {
            purpose: mode,
            email: data.email,
            turnstileToken: turnstile.token(),
            profile: signup
              ? { firstName: data.firstName, lastName: data.lastName, country: data.country, state: data.state, language: data.language, photo: data.photo }
              : undefined
          }
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

    card.replaceChildren(
      tabs,
      h('h2', { text: signup ? 'Create your free account' : 'Welcome back' }),
      h('p', { class: 'sub', text: signup ? 'We will email you a code to confirm it is really you. No password needed.' : 'Enter your email and we will send you a one-time code.' }),
      form
    );
    const first = fields.firstName || fields.email;
    first.input.focus();
  }

  // ---- Step 2: the code --------------------------------------------------------------------

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
          body: {
            purpose: mode,
            email: data.email,
            turnstileToken: turnstile.token(),
            profile: mode === 'signup'
              ? { firstName: data.firstName, lastName: data.lastName, country: data.country, state: data.state, language: data.language, photo: data.photo }
              : undefined
          }
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
      h('p', { class: 'form-switch' }, h('button', { class: 'btn-link', type: 'button', text: 'Use a different email', onClick: () => renderForm() }))
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
      h('p', { class: 'auth-foot', text: 'Your email is only used to sign you in.' })
    ),
    h('section', { class: 'auth-main', id: 'login-main' }, card)
  );

  renderForm();
  return root;
}
