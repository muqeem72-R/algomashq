// Profile photo picker: upload a picture or take one with the camera.
// The picture is cropped to a centered square, shrunk to 256x256 and saved as a small JPEG,
// so what is sent to the server is only about 20-40 KB. A photo is optional: without one the
// member gets a letter logo.

import { h, icon } from '../dom.js';

const SIZE = 256;
const MAX_FILE_BYTES = 12 * 1024 * 1024;

// Draws the centered square of `source` onto a canvas and returns a JPEG data URL.
function toJpeg(source, width, height) {
  const side = Math.min(width, height);
  const canvas = document.createElement('canvas');
  canvas.width = SIZE;
  canvas.height = SIZE;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, SIZE, SIZE);
  ctx.drawImage(source, (width - side) / 2, (height - side) / 2, side, side, 0, 0, SIZE, SIZE);
  for (const quality of [0.85, 0.7, 0.55]) {
    const url = canvas.toDataURL('image/jpeg', quality);
    if (url.length < 120000) return url;
  }
  return canvas.toDataURL('image/jpeg', 0.4);
}

function loadImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('unreadable')); };
    img.src = url;
  });
}

function openCamera(onCapture) {
  const video = h('video', { autoplay: true, playsinline: true, muted: true });
  const note = h('p', { class: 'modal-note', text: 'Center your face in the circle.' });
  const shoot = h('button', { class: 'btn btn-primary', type: 'button', disabled: true }, icon('camera', 18), 'Take photo');
  const cancel = h('button', { class: 'btn btn-ghost', type: 'button', text: 'Cancel' });
  const modal = h('div', { class: 'modal', role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Take a photo' },
    h('h3', { text: 'Take a photo' }),
    h('div', { class: 'camera-frame' }, video),
    note,
    h('div', { class: 'modal-actions' }, cancel, shoot)
  );
  const backdrop = h('div', { class: 'modal-backdrop' }, modal);
  let stream = null;

  function close() {
    if (stream) stream.getTracks().forEach((t) => t.stop());
    document.removeEventListener('keydown', onKey, true);
    backdrop.remove();
  }
  function onKey(e) { if (e.key === 'Escape') close(); }

  cancel.addEventListener('click', close);
  shoot.addEventListener('click', () => {
    if (!video.videoWidth) return;
    onCapture(toJpeg(video, video.videoWidth, video.videoHeight));
    close();
  });
  document.addEventListener('keydown', onKey, true);
  document.body.append(backdrop);
  cancel.focus();

  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    note.textContent = 'This browser cannot use the camera. Please upload a photo instead.';
    return;
  }
  navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 640 } }, audio: false })
    .then((s) => {
      stream = s;
      video.srcObject = s;
      shoot.disabled = false;
      shoot.focus();
    })
    .catch(() => {
      note.textContent = 'Camera access was not allowed or no camera was found. Please upload a photo instead.';
    });
}

// Options:
//   label     text above the picker ('' for none)
//   hint      small text under the buttons
//   fallback  () => Node shown while there is no photo (for example the letter logo)
//   onChange  called with the new data URL, or '' when the photo is removed
// Returns { el, value(), setError(message), refresh() }. Call refresh() when the fallback should be redrawn.
export function createPhotoPicker({ initial = '', label = 'Profile photo', hint = '', fallback, onChange } = {}) {
  let value = initial;
  const preview = h('div', { class: 'photo-preview', 'aria-hidden': 'true' });
  const error = h('p', { class: 'field-error', role: 'alert' });
  const file = h('input', { type: 'file', accept: 'image/jpeg,image/png,image/webp', hidden: true });
  const upload = h('button', { class: 'btn btn-ghost btn-sm', type: 'button' }, icon('upload', 16), 'Upload photo');
  const camera = h('button', { class: 'btn btn-ghost btn-sm', type: 'button' }, icon('camera', 16), 'Use camera');
  const remove = h('button', { class: 'btn btn-ghost btn-sm', type: 'button', text: 'Remove', hidden: true });

  function draw() {
    preview.classList.toggle('has-photo', !!value);
    preview.classList.toggle('has-fallback', !value && !!fallback);
    remove.hidden = !value;
    if (value) preview.replaceChildren(h('img', { src: value, alt: 'Your profile photo preview' }));
    else preview.replaceChildren(fallback ? fallback() : icon('image', 32));
  }
  function show(url) {
    value = url;
    error.textContent = '';
    draw();
    if (onChange) onChange(url);
  }

  upload.addEventListener('click', () => file.click());
  camera.addEventListener('click', () => openCamera(show));
  remove.addEventListener('click', () => show(''));
  file.addEventListener('change', async () => {
    const chosen = file.files && file.files[0];
    file.value = '';
    if (!chosen) return;
    if (!/^image\/(jpeg|png|webp)$/.test(chosen.type)) { error.textContent = 'Choose a JPG, PNG or WebP picture.'; return; }
    if (chosen.size > MAX_FILE_BYTES) { error.textContent = 'That picture is too large. Choose one under 12 MB.'; return; }
    try {
      const img = await loadImage(chosen);
      show(toJpeg(img, img.naturalWidth, img.naturalHeight));
    } catch (e) {
      error.textContent = 'That picture could not be opened. Try another one.';
    }
  });

  draw();

  const el = h('div', { class: 'field' },
    label ? h('span', { class: 'field-label', text: label }) : null,
    h('div', { class: 'photo-picker' },
      preview,
      h('div', null,
        h('div', { class: 'photo-actions' }, upload, camera, remove),
        hint ? h('p', { class: 'photo-hint', text: hint }) : null
      )
    ),
    file,
    error
  );

  return {
    el,
    value: () => value,
    setError: (message) => { error.textContent = message || ''; },
    refresh: draw
  };
}
