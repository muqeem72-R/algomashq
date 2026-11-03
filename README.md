# AlgoMashq

A free platform to learn Data Structures and Algorithms by solving problems in C++, Java and Python.
The product plan is in [ROADMAP.md](ROADMAP.md). This repository currently holds **Phase 1: foundation and login**.

Address: the free Cloudflare address `https://algomashq.<your-subdomain>.workers.dev`. A paid custom domain such as
`algomashq.dev` is optional and can be added later.

Everything runs on free tiers: one Cloudflare Worker (site and API), Cloudflare D1 (database), Cloudflare Turnstile
(human check) and Brevo (login emails).

## What Phase 1 includes

- Full-page desktop layout with a sidebar, a top bar, light / dark / system themes and five accent colors.
- Login and sign-up with a 6-digit email code (no passwords). Codes are sent through Brevo.
- Cloudflare Turnstile on the login form, so only real people can ask for a code.
- Sign-up collects first name, last name (optional), email, country, state, preferred language and a profile photo
  (upload, or take one with the camera). The photo is optional: without one, a letter logo is made from the first
  letter of the first name. A member can change or remove the photo later on the profile page.
- A unique public **user id** for every member (see below).
- Privacy rules (three levels, written once in `functions/_lib/users.js`):

  | Who looks | Sees |
  |---|---|
  | The member | everything: name, email, country, state, language, photo |
  | Other members, around the platform | user id, photo (or letter logo), country |
  | Two members chatting together | the above plus state and preferred language |

  Name and email are never shown to other members. The profile page has a "How other members see you" card that
  shows both of the last two levels. The chat level is ready (`chatView`) but is not served by any endpoint yet:
  when chat is built, the chat endpoints must first confirm that both people belong to that chat.
- A one-time welcome tour for new members, which can be replayed from Settings.
- Dashboard, Roadmap (the 10 topics), My profile and Settings pages. Problems, Progress and Submissions are placeholders.

## User ids

Format: `<initials><number><letters>`, for example `mk001A`.

| Part | Rule |
|---|---|
| initials | first letter of the first name + first letter of the last name, lower case. Just one letter when there is no last name. Accents are ignored and non-Latin names fall back to `u`. |
| number | `001` to `999`, then it starts again at `001`. |
| letters | `A` for the first 999 members, `B` for the next 999, and so on up to `Z`, then `AA`, `AB` ... |

So the first member `Mukeem Khan` is `mk001A`, the second member `shaan` is `s002A`, member 999 ends in `999A` and
member 1000 ends in `001B`. The number and letters come from the global sign-up counter (`users.seq`), so two
members can never get the same id, whatever their names are. The code is in `functions/_lib/users.js`.

## Project layout

```
public/                 static site, served directly by Cloudflare
  index.html
  _headers              security headers and the Content-Security-Policy
  assets/css/           tokens (themes), base, auth screen, app shell
  assets/js/            main.js, router, api, theme, views/, components/, data/
src/worker.js           the Worker: sends every /api/* request to the matching handler in functions/
functions/              the API handlers
  api/auth/             request-otp, verify-otp, me, logout
  api/me/               photo, tour, settings
  api/users/[id].js     what other members can see of a member
  api/config.js         public settings for the browser
  _lib/                 shared code: validation, crypto, sessions, rate limits, Turnstile, Brevo
db/schema.sql           database tables
tests/                  unit tests (npm test)
wrangler.toml           Cloudflare configuration
```

## Run it on your computer

Requires Node.js 20 or newer.

```bash
npm install
cp .dev.vars.example .dev.vars     # local settings; uses Cloudflare's test Turnstile keys
npm run db:local                   # creates the local database tables
npm run dev                        # http://localhost:8788
```

With `DEV_LOG_OTP=1` (set in `.dev.vars`) no email is sent: the login code is printed in the terminal that runs
`npm run dev`. Run the unit tests with `npm test`.

## Put it online (all free)

1. **Push the code to GitHub.** Make sure `.dev.vars` is not committed (it is already in `.gitignore`).

2. **Create the database.** Either in the dashboard (Storage & databases > D1 SQL database > Create database, name
   `algomashq`, then open its Console tab and run the contents of `db/schema.sql`), or from the terminal:
   ```bash
   npx wrangler login
   npx wrangler d1 create algomashq
   npx wrangler d1 execute algomashq --remote --file=db/schema.sql
   ```
   Copy the database id into `wrangler.toml` (`database_id`).

3. **Create a Turnstile widget.** Cloudflare dashboard > Turnstile > Add widget. Add the site's hostname
   (for example `algomashq.<your-subdomain>.workers.dev`, plus a custom domain later if you add one), choose *Managed*.
   Put the **site key** in `wrangler.toml` (`TURNSTILE_SITE_KEY`). Keep the **secret key** for step 5.

4. **Set up Brevo.** Create a free account, then:
   - SMTP & API > API keys > create a key. Keep it for step 5.
   - Senders, domains & dedicated IPs > add a sender and verify it. Put that address in `wrangler.toml`
     (`BREVO_SENDER_EMAIL`).
   - For reliable inbox delivery, authenticate your own domain (SPF, DKIM, DMARC) and use an address on it.
     A free mail address such as Gmail may land in spam. The free plan allows 300 emails a day; the app stops
     at 250 a day to stay under that.

5. **Create the Worker from GitHub.** Cloudflare dashboard > Workers & Pages > Create application > import the
   repository `algomashq`. Use:
   - Build command: *(leave empty)*
   - Deploy command: `npx wrangler deploy` (the default)
   - Root directory: `/`

   Every push to `main` then deploys automatically. Open the Worker > Settings > Variables and Secrets and add these
   as **secrets**:

   | Secret | Value |
   |---|---|
   | `APP_SECRET` | a long random text (for example 40+ random characters). Never change it casually: it protects login codes. |
   | `BREVO_API_KEY` | the Brevo API key from step 4 |
   | `TURNSTILE_SECRET` | the Turnstile secret key from step 3 |

   Do **not** set `DEV_LOG_OTP` online. It makes the app print codes instead of emailing them.

6. Redeploy, open the site and sign up. The first member to sign up gets sequence number `001` (for example `mk001A`).

7. **Optional: a custom domain** (for example `algomashq.dev`). Worker > Settings > Domains & Routes > Add > Custom
   domain. Add the hostname to the Turnstile widget, and in Brevo authenticate the same domain (Senders, domains &
   dedicated IPs > Domains) so login emails reach the inbox. A domain is the only part that costs money: it is paid
   yearly at a registrar.

If something is missing, the API answers `not_configured`, `captcha_unavailable` or `email_failed`, and the Worker's
logs (Worker > Observability > Logs) say why.

## Changing the app name

Set `APP_NAME` and `BREVO_SENDER_NAME` in `wrangler.toml`. Every screen, the browser tab title and the login email
read the name from there (through `/api/config`). Also update the `<title>` in `public/index.html`, which is only shown
for a moment while the app loads.

## API summary

| Endpoint | Purpose |
|---|---|
| `GET /api/config` | public settings (app name, Turnstile site key) |
| `POST /api/auth/request-otp` | email a login code (login or sign-up) |
| `POST /api/auth/verify-otp` | check the code, create the account if new, start a session |
| `GET /api/auth/me` | the signed-in member, or `{ "user": null }` |
| `POST /api/auth/logout` | end the session |
| `GET/POST/DELETE /api/me/photo` | read, replace or remove your own photo |
| `GET /api/users/:id/photo` | another member's photo (signed-in members only; 404 when they have none) |
| `POST /api/me/tour` | remember that the tour was seen |
| `PATCH /api/me/settings` | change the preferred language |
| `GET /api/users/:id` | your own profile (with a preview of what others see), or the public view of another member |

## Security notes

- No passwords exist. Login codes are 6 digits, expire after 10 minutes, work once, allow 5 wrong tries, and only a
  keyed hash is stored.
- Sessions use a random token in an HttpOnly, SameSite=Lax cookie (Secure on https); only its hash is stored.
  A session lasts 30 days from the last visit.
- The login form answers the same way for known and unknown emails, so it cannot be used to find out who is registered.
- Rate limits (per IP, per email, and a daily cap on emails) are kept in the database, so they hold across servers.
- Every request that changes data checks the `Origin` header. Pages of the site are served with a strict Content-Security-Policy.
- Profile photos are small JPEGs stored as base64 in D1 (about 30 KB each). They are served only to signed-in members,
  never to the public. Looking up other members is rate-limited, so a script cannot walk through every user id.
