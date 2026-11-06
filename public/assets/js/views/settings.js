import { h } from '../dom.js';
import { api, describeError } from '../api.js';
import { LANGUAGES } from '../data/topics.js';
import { themeControls } from '../components/shell.js';
import { toast } from '../components/toast.js';
import * as progress from '../progress.js';

export function settingsView(ctx) {
  const user = ctx.user();
  const { segmented, swatches } = themeControls();

  const languages = h('div', { class: 'segmented', role: 'radiogroup', 'aria-label': 'Preferred language' },
    LANGUAGES.map((l) =>
      h('label', null,
        h('input', {
          type: 'radio', name: 'language', value: l.id, checked: user.preferredLanguage === l.id,
          onChange: async () => {
            try {
              await api('/api/me/settings', { method: 'PATCH', body: { preferredLanguage: l.id } });
              ctx.patchUser({ preferredLanguage: l.id });
              toast(`Preferred language: ${l.label}`);
            } catch (err) {
              toast(describeError(err));
              languages.querySelector(`input[value="${user.preferredLanguage}"]`).checked = true;
            }
          }
        }),
        h('span', { text: l.label })
      )
    )
  );

  // ---- Sign out everywhere, and delete the account ----
  const signOutAll = h('button', { class: 'btn btn-ghost', type: 'button', text: 'Sign out everywhere' });
  signOutAll.addEventListener('click', async () => {
    if (!window.confirm('Sign out on every device, including this one?')) return;
    signOutAll.disabled = true;
    try {
      await api('/api/me/logout-all', { method: 'POST' });
      ctx.logout();   // this browser's cookie is already cleared; this tidies the page
    } catch (err) {
      signOutAll.disabled = false;
      toast(describeError(err));
    }
  });

  const deleteSlot = h('div');
  const deleteButton = h('button', { class: 'btn btn-danger', type: 'button', text: 'Delete my account' });
  deleteButton.addEventListener('click', () => {
    const confirmInput = h('input', { class: 'input', id: 'f-confirm', type: 'text', autocomplete: 'off', spellcheck: 'false', placeholder: user.userId, 'aria-label': 'Type your user ID to confirm' });
    const error = h('p', { class: 'field-error', role: 'alert' });
    const go = h('button', { class: 'btn btn-danger', type: 'button', text: 'Delete everything', disabled: true });
    const cancel = h('button', { class: 'btn btn-ghost', type: 'button', text: 'Keep my account', onClick: () => { deleteSlot.replaceChildren(); deleteButton.hidden = false; } });
    confirmInput.addEventListener('input', () => { go.disabled = confirmInput.value.trim() !== user.userId; error.textContent = ''; });
    go.addEventListener('click', async () => {
      go.disabled = true;
      try {
        await api('/api/me/account', { method: 'DELETE', body: { confirm: confirmInput.value.trim() } });
        progress.purge(user.userId);
        window.location.hash = '#/login';
        window.location.reload();   // a clean start: nothing of the deleted account stays in memory
      } catch (err) {
        go.disabled = false;
        error.textContent = describeError(err);
      }
    });
    deleteButton.hidden = true;
    deleteSlot.replaceChildren(h('div', { class: 'confirm-box' },
      h('p', null, 'This removes your profile, photo, progress, saved solutions, notes and bookmarks for good. It cannot be undone. Type your user ID ', h('strong', { class: 'user-id small', text: user.userId }), ' to confirm.'),
      confirmInput, error,
      h('div', { class: 'confirm-actions' }, go, cancel)));
    confirmInput.focus();
  });

  const row = (title, text, control) =>
    h('div', { class: 'setting' }, h('div', null, h('h4', { text: title }), h('p', { text })), control);

  return h('div', { class: 'page' },
    h('div', { class: 'page-head' }, h('h2', { text: 'Settings' }), h('p', { text: 'Make the platform yours.' })),
    h('div', { class: 'settings-stack' },
      h('section', { class: 'card settings-block' },
        h('h3', { text: 'Appearance' }),
        row('Theme', 'Light, dark, or follow your computer.', segmented),
        row('Accent color', 'Used for buttons and highlights.', swatches)
      ),
      h('section', { class: 'card settings-block' },
        h('h3', { text: 'Coding' }),
        row('Preferred language', 'The editor will open in this language by default.', languages)
      ),
      h('section', { class: 'card settings-block' },
        h('h3', { text: 'Account' }),
        row('Product tour', 'Walk through where everything is again.',
          h('button', { class: 'btn btn-ghost', type: 'button', text: 'Replay tour', onClick: () => ctx.startTour() })),
        row('Signed in as', user.email,
          h('button', { class: 'btn btn-ghost', type: 'button', text: 'Log out', onClick: () => ctx.logout() })),
        row('Other devices', 'End every login of this account, on all devices.', signOutAll)
      ),
      h('section', { class: 'card settings-block danger-zone' },
        h('h3', { text: 'Delete account' }),
        row('Delete my account', 'Removes everything that belongs to you, for good.', deleteButton),
        deleteSlot
      ),
      h('p', { class: 'privacy-note' }, h('a', { href: '/privacy.html', text: 'Privacy' }), ' · ', h('a', { href: '/terms.html', text: 'Terms' }))
    )
  );
}
