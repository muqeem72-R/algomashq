// Serving a member's profile photo.

import { fail } from './http.js';

// The photo as an image response, or 404 when the member has none (the browser then draws the letter logo).
export async function photoResponse(db, userId) {
  const photo = await db.prepare('SELECT mime, data FROM user_photos WHERE user_id = ?').bind(userId).first();
  if (!photo) return fail(404, 'no_photo');
  const bytes = Uint8Array.from(atob(photo.data), (c) => c.charCodeAt(0));
  return new Response(bytes, {
    headers: {
      'Content-Type': photo.mime,
      'Cache-Control': 'private, max-age=86400',   // the address carries ?v=<version>, so a new photo gets a new address
      'X-Content-Type-Options': 'nosniff'
    }
  });
}
