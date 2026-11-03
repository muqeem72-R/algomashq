// Input cleaning and validation for everything a visitor can type.
// The country and state lists are shared with the browser form.

import { isCountryCode, STATES } from '../../public/assets/js/data/geo.js';
import { PHOTO_MAX_BYTES, PHOTO_REQUIRED } from './config.js';

export const LANGUAGE_IDS = ['cpp', 'java', 'python'];

const NAME_RE = /^[\p{L}\p{M}][\p{L}\p{M} .'’-]*$/u;
const FREE_STATE_RE = /^[\p{L}\p{M}\p{N}][\p{L}\p{M}\p{N} .,'’()/-]*$/u;
const EMAIL_RE = /^[^\s@<>()[\]\\,;:"]+@[^\s@<>()[\]\\,;:"]+\.[^\s@<>()[\]\\,;:"]{2,}$/;

const squash = (v) => (typeof v === 'string' ? v.replace(/[\u0000-\u001F\u007F]/g, '').replace(/\s+/g, ' ').trim() : '');

export function cleanEmail(value) {
  const email = squash(value).toLowerCase();
  return email.length <= 254 && EMAIL_RE.test(email) ? email : '';
}

export function cleanName(value, { required }) {
  const name = squash(value);
  if (!name) return required ? null : '';
  return name.length <= 40 && NAME_RE.test(name) ? name : null;
}

export function cleanState(country, value) {
  const state = squash(value);
  const list = STATES[country];
  if (list) return list.find((s) => s.toLowerCase() === state.toLowerCase()) || null;
  return state.length >= 2 && state.length <= 60 && FREE_STATE_RE.test(state) ? state : null;
}

// Accepts "data:image/jpeg;base64,...." and returns the bare base64, or null.
export function cleanPhoto(value) {
  if (typeof value !== 'string') return null;
  const prefix = 'data:image/jpeg;base64,';
  if (!value.startsWith(prefix)) return null;
  const data = value.slice(prefix.length);
  if (!/^[A-Za-z0-9+/]+={0,2}$/.test(data)) return null;
  if (!data.startsWith('/9j/')) return null;             // every JPEG starts with FF D8 FF
  if (Math.floor((data.length * 3) / 4) > PHOTO_MAX_BYTES) return null;
  return data;
}

// Validates the sign-up profile. Returns { value } or { errors: { field: message } }.
export function cleanProfile(input) {
  const src = input && typeof input === 'object' ? input : {};
  const errors = {};

  const firstName = cleanName(src.firstName, { required: true });
  if (firstName === null) errors.firstName = 'Enter your first name using letters only.';

  const lastName = cleanName(src.lastName, { required: false });
  if (lastName === null) errors.lastName = 'Use letters only for your last name.';

  const country = typeof src.country === 'string' ? src.country.toUpperCase() : '';
  if (!isCountryCode(country)) errors.country = 'Choose your country.';

  const state = errors.country ? null : cleanState(country, src.state);
  if (!errors.country && state === null) errors.state = STATES[country] ? 'Choose your state.' : 'Enter your state or region.';

  const language = LANGUAGE_IDS.includes(src.language) ? src.language : 'cpp';

  let photo = null;
  if (src.photo) {
    photo = cleanPhoto(src.photo);
    if (!photo) errors.photo = 'That photo could not be used. Try another one.';
  } else if (PHOTO_REQUIRED) {
    errors.photo = 'Add a profile photo to continue.';
  }

  if (Object.keys(errors).length) return { errors };
  return { value: { firstName, lastName, country, state, language, photo } };
}
