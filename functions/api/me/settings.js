// PATCH /api/me/settings   Body: { preferredLanguage: "cpp" | "java" | "python" }

import { json, fail, readJson, sameOrigin } from '../../_lib/http.js';
import { requireUser } from '../../_lib/auth.js';
import { LANGUAGE_IDS } from '../../_lib/validate.js';

export async function onRequestPatch(context) {
  if (!sameOrigin(context.request)) return fail(403, 'forbidden');
  const { user, error } = await requireUser(context);
  if (error) return error;
  const parsed = await readJson(context.request, 500);
  if (parsed.error) return parsed.error;
  const language = parsed.body.preferredLanguage;
  if (!LANGUAGE_IDS.includes(language)) return fail(422, 'invalid_input', { fields: { preferredLanguage: 'Choose C++, Java or Python.' } });
  await context.env.DB.prepare('UPDATE users SET preferred_language = ? WHERE seq = ?').bind(language, user.seq).run();
  return json({ preferredLanguage: language });
}
