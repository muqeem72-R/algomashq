// /api/me/photo   (your own photo)
//   GET     the photo (JPEG)
//   POST    { photo: "data:image/jpeg;base64,..." } replaces it
//   DELETE  removes it; the member then gets a letter logo made from their first name

import { json, fail, readJson, sameOrigin } from '../../_lib/http.js';
import { requireUser } from '../../_lib/auth.js';
import { cleanPhoto } from '../../_lib/validate.js';
import { photoResponse } from '../../_lib/photo.js';

export async function onRequestGet(context) {
  const { user, error } = await requireUser(context);
  if (error) return error;
  return photoResponse(context.env.DB, user.user_id);
}

export async function onRequestPost(context) {
  if (!sameOrigin(context.request)) return fail(403, 'forbidden');
  const { user, error } = await requireUser(context);
  if (error) return error;
  const parsed = await readJson(context.request, 170000);
  if (parsed.error) return parsed.error;
  const data = cleanPhoto(parsed.body.photo);
  if (!data) return fail(422, 'invalid_input', { fields: { photo: 'That photo could not be used. Try another one.' } });
  const now = Date.now();
  await context.env.DB
    .prepare(
      `INSERT INTO user_photos (user_id, mime, data, updated_at) VALUES (?1, 'image/jpeg', ?2, ?3)
       ON CONFLICT(user_id) DO UPDATE SET data = ?2, updated_at = ?3`
    )
    .bind(user.user_id, data, now)
    .run();
  return json({ photoVersion: now });
}

export async function onRequestDelete(context) {
  if (!sameOrigin(context.request)) return fail(403, 'forbidden');
  const { user, error } = await requireUser(context);
  if (error) return error;
  await context.env.DB.prepare('DELETE FROM user_photos WHERE user_id = ?').bind(user.user_id).run();
  return json({ photoVersion: null });
}
