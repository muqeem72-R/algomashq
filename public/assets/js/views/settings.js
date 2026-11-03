import { h } from '../dom.js';
import { api, describeError } from '../api.js';
import { LANGUAGES } from '../data/topics.js';
import { themeControls } from '../components/shell.js';
import { toast } from '../components/toast.js';

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
          h('button', { class: 'btn btn-ghost', type: 'button', text: 'Log out', onClick: () => ctx.logout() }))
      )
    )
  );
}
