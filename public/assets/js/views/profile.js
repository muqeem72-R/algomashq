// "My profile": the signed-in member's own details, and exactly what other members can see of them.

import { h } from '../dom.js';
import { api, describeError } from '../api.js';
import { LANGUAGES } from '../data/topics.js';
import { avatar, letterAvatar } from '../components/avatar.js';
import { memberCard, countryName } from '../components/member.js';
import { createPhotoPicker } from '../components/photo-picker.js';
import { toast } from '../components/toast.js';

export function profileView(ctx) {
  const user = ctx.user();
  const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ');
  const language = (LANGUAGES.find((l) => l.id === user.preferredLanguage) || LANGUAGES[0]).label;
  const joined = new Date(user.createdAt).toLocaleDateString('en', { day: 'numeric', month: 'long', year: 'numeric' });

  const detail = (label, value) => h('div', { class: 'detail' }, h('dt', { text: label }), h('dd', { text: value }));

  // ---- Photo: null = unchanged, '' = remove it, 'data:...' = replace it ----
  let pending = null;
  const save = h('button', { class: 'btn btn-primary btn-sm', type: 'button', disabled: true, text: 'Save changes' });
  const picker = createPhotoPicker({
    label: '',
    initial: user.photoVersion ? `/api/users/${encodeURIComponent(user.userId)}/photo?v=${user.photoVersion}` : '',
    hint: 'Without a photo you get a letter logo made from your first name.',
    fallback: () => letterAvatar(user.initial, 88),
    onChange: (url) => { pending = url; save.disabled = false; }
  });
  save.addEventListener('click', async () => {
    save.disabled = true;
    try {
      if (pending === '') await api('/api/me/photo', { method: 'DELETE' });
      else await api('/api/me/photo', { method: 'POST', body: { photo: pending } });
      await ctx.refreshUser();
      toast(pending === '' ? 'Photo removed' : 'Profile photo updated');
    } catch (err) {
      picker.setError(describeError(err));
      save.disabled = false;
    }
  });

  // ---- What others see (the server tells us, so this can never drift from the real rules) ----
  const everywhere = h('div', { class: 'seen-slot' }, h('p', { class: 'muted', text: 'Loading' }));
  const inChat = h('div', { class: 'seen-slot' }, h('p', { class: 'muted', text: 'Loading' }));
  api(`/api/users/${encodeURIComponent(user.userId)}`)
    .then((res) => {
      everywhere.replaceChildren(memberCard(res.asSeenByOthers.everywhere));
      inChat.replaceChildren(memberCard(res.asSeenByOthers.inChat));
    })
    .catch(() => {
      everywhere.replaceChildren(h('p', { class: 'muted', text: 'Could not load this preview.' }));
      inChat.replaceChildren();
    });

  return h('div', { class: 'page' },
    h('div', { class: 'profile-head' },
      avatar(user),
      h('div', null,
        h('h2', { text: fullName }),
        h('span', { class: 'user-id', text: user.userId })
      )
    ),
    h('div', { class: 'card' },
      h('h3', { text: 'Your details' }),
      h('dl', { class: 'details' },
        detail('Full name', fullName),
        detail('Email', user.email),
        detail('Preferred language', language),
        detail('Country', countryName(user.country)),
        detail('State / region', user.state),
        detail('Member since', joined)
      ),
      h('p', { class: 'privacy-note', text: 'This page is only for you.' })
    ),
    h('div', { class: 'card' },
      h('h3', { text: 'How other members see you' }),
      h('p', { class: 'muted', text: 'Your name and email are never shown to anyone else.' }),
      h('div', { class: 'seen-grid' },
        h('div', null, h('div', { class: 'pop-label', text: 'Around the platform' }), everywhere),
        h('div', null, h('div', { class: 'pop-label', text: 'When you chat with someone' }), inChat)
      )
    ),
    h('div', { class: 'card' },
      h('h3', { text: 'Your photo' }),
      h('div', { class: 'settings-stack' }, picker.el, h('div', null, save))
    )
  );
}
