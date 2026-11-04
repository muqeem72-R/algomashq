# AlgoMashq

A free platform to learn Data Structures and Algorithms by solving problems in C++, Java and Python.
The product plan is in [ROADMAP.md](ROADMAP.md). This repository holds **Phase 1** (login and accounts) and **Phase 2** (problems that run in the browser, in Python, C++ and Java).

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
- A dashboard that shows the learner's own progress (the next problem, solved problems by difficulty, a solving streak and the
  recently solved list), the Roadmap page (the 10 topics, only there), the Problems pages, the Submissions page (your history),
  My profile and Settings, and the Progress page (below).

## What Phase 2 includes

- A **Problems** page with filters (topic, difficulty, search) and a check mark on solved problems.
- A **problem page** built around learning: the *Concept* tab first (the idea in plain words), then the *Problem*, three
  step-by-step *Hints*, and a *Solution* tab that unlocks when the problem is solved (or when the learner chooses to open it).
- A code editor (CodeMirror) with syntax colors, a language switch (Python, C++, Java), drafts that
  are saved in the browser, and Run (own input), Examples and Submit buttons.
- A judge with the usual verdicts: Accepted, Wrong Answer, Runtime Error, Time Limit Exceeded, Memory Limit, Output Limit and
  Compile Error. Hidden test data is never shown.
- 100 original problems in the Basics topic, numbered 1 to 100 by effort (1-50 easy, 51-81 medium, 82-100 hard). They start with
  printing `hello world!` and go through input and arithmetic, conditions, loops, arrays and strings, number theory, recursion and
  complexity ("a loop would take years, find the formula") up to big-number arithmetic and matrix power. Every problem has a concept
  note, a statement with examples, three hints, starter code, a worked solution with its complexity, and hidden tests, in Python,
  C++ and Java.
- 100 original problems in the **Arrays and Strings** topic, numbered 101 to 200 by effort (101-130 easy, 131-175 medium,
  176-200 hard): prefix sums, two pointers, sliding windows, sorting, binary search (also on the answer), matrices, and strings
  from counting letters to parsing. The other topics follow the same pattern, one topic at a time (see ROADMAP.md, section 18).
  A topic has exactly 100 problems and topic number `T` uses the numbers `(T - 1) * 100 + 1` to `T * 100`.

**How code runs.** Everything runs in the learner's own browser with WebAssembly, so it costs nothing and needs no server:

| Language | Engine | First download | Notes |
|---|---|---|---|
| Python | Pyodide (CPython) | about 7 MB | slower than normal Python, so it gets 5x the time limit |
| C++ | clang + lld + libc++ compiled to WebAssembly | about 26 MB | compile takes 2-5 s; no `try/catch` (exceptions are off); `scanf` is much faster than `cin` for huge input |
| Java | CheerpJ 5 (a Java 21 runtime and `javac` in the browser) | about 75 MB | compile takes about 10 s; about as slow as Python (so it gets 5x the time limit); recursion is limited to about 3000 nested calls; `System.exit` and static fields are handled like in a fresh process |

The downloads happen once and are cached by the browser. Because the judge runs in the browser, a verdict could be faked; that
is fine for learning, but contests or a leaderboard would need a server-side check. Progress is stored in this browser for now
(the account database is used for it in a later phase).

**Why Java lives on a second origin.** CheerpJ needs `unsafe-eval` in the Content-Security-Policy, which the main site must never
allow. So Java runs in a tiny second Worker (`java/`, deployed as `algomashq-java`), on its own address. The main site embeds
it in a hidden iframe and talks to it only with `postMessage`; both sides check who they are talking to, and only the main
site may embed the sandbox. The sandbox has no cookies, no login and no access to the site's data. The Java runtime itself is
loaded from CheerpJ's CDN, under CheerpJ's free Community license for non-commercial use. That license asks for the credit
"Built with CheerpJ". The sidebar of the site does not show it (the owner's choice); the credit is kept in this file, in
`public/vendor/THIRD_PARTY.md` and on the sandbox page itself. Whether that is enough for the license is worth checking at
https://cheerpj.com/licensing/. All the tests of one submission run in one Java process, each in a fresh class loader, so one
test cannot affect the next.

## Where the progress lives

The account (the D1 tables `solved` and `problem_state`) is the source of truth, so the progress follows a learner to every
device. The browser keeps a copy in localStorage (one copy per account) so pages open at once and nothing is lost when the
connection drops: every change goes to the copy first and then through a small queue that is retried until the server has it.
Solving is never undone and the counters only grow, so two copies are merged by keeping the most. The first sign-in after the
update moves the progress that older versions kept in the browser into the account.

The same holds for the code, with one rule: **only an accepted solution is saved**. For every problem and language the account keeps
one: the last code that was Accepted (the `submissions` table). Accepting a newer solution in the same language replaces it, another
language keeps its own, so a learner has at most three saved solutions per problem. A submission that is not accepted saves nothing
(not its code, not its result) and never touches a saved solution. The code typed so far (a *draft*) is a different thing: it is saved in
the account when a problem is submitted or left, not on every keystroke, and comes back on another device; the newer copy wins, and the
problem opens in the language of its newest draft. Bookmarks and notes follow the same pattern. A bookmark is a star on a problem (in the list and in the problem's header); a note is a
private plain-text note of at most 500 characters on a problem (the Notes tab). Both are kept in the account, the newer copy wins, and
removing a bookmark or emptying a note keeps a small record with its time, so an old copy on another device cannot bring it back. The
Problems list can be filtered by what you did: all, solved, unsolved, bookmarked, and with notes; the numbers on the filters count what
the topic, difficulty and search leave.

**The Progress page** reads all of it and needs no server of its own (no table, no endpoint): the numbers are worked out in the
browser by `public/assets/js/progress-stats.js`, which has its own unit tests. It shows: the problems solved, active days and the current
and best streak; a **61-day calendar** (30 days back, today, 30 days ahead, the date printed in every cell, a day lights up when you
solve something, a readout with the problems on hover and on keyboard focus); eight **milestones**; progress **by topic** (only
topics that have problems), **by difficulty** and **by language**; a chart of **solves per week** for the last 12 weeks; **how you
learn** (solved without hints, accepted on the first submit, solutions opened before solving, hints opened, concepts read, submits
per problem, all plain numbers); and the list of **solved problems** with filters. Each chart has a table view with the same numbers.
Calendar days are the learner's own local days; only solves count, because a failed submit is not saved.

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
  assets/js/runner/     the code runner: engine.js, the Web Workers for Python and C++, and java-client.js (talks to the Java sandbox)
  assets/js/judge/      the judge: output comparison and running the tests
  vendor/               browser compilers and the editor, generated by npm run vendor (committed)
  problems/             the problem files, generated by npm run problems (committed)
src/worker.js           the Worker: sends every /api/* request to the matching handler in functions/
functions/              the API handlers
  api/auth/             request-otp, verify-otp, me, logout
  api/me/               photo, tour, settings, progress, solved, state, import, submissions, drafts, bookmarks, notes
  api/users/[id].js     what other members can see of a member
  api/config.js         public settings for the browser
  _lib/                 shared code: validation, crypto, sessions, rate limits, Turnstile, Brevo
java/                   the Java sandbox: a second, static-only Worker on its own origin (bridge.js, java-worker.js, headers)
db/schema.sql           database tables
tests/                  unit tests (npm test)
tools/vendor/           builds public/vendor (Pyodide, the C++ compiler in gzip parts, the editor)
tools/problems/         the problem sources (one file per problem) and the build script
wrangler.toml           Cloudflare configuration
```

## Run it on your computer

Requires Node.js 20 or newer.

```bash
npm install
cp .dev.vars.example .dev.vars     # local settings; uses Cloudflare's test Turnstile keys
npm run db:local                   # creates the local database tables
npm run dev                        # http://localhost:8788
npm run dev:java                   # in a second terminal: the Java sandbox, http://127.0.0.1:8789
```

Java needs the second terminal and `JAVA_ORIGIN=http://127.0.0.1:8789` in `.dev.vars` (it is in `.dev.vars.example`). The sandbox
must be a different site from the app, which is why the app uses `localhost` and the sandbox `127.0.0.1`. The site's
Content-Security-Policy only names the live sandbox, so to try Java locally in a browser you must allow the local one (for
example with a browser extension or a test browser that bypasses CSP); the unit tests and the live site are not affected.

With `DEV_LOG_OTP=1` (set in `.dev.vars`) no email is sent: the login code is printed in the terminal that runs
`npm run dev`. Run the unit tests with `npm test`.

## Adding or changing a problem

Each problem has the text (concept, statement, formats, hints), starter code and solution code for Python, C++ and Java, a
JavaScript reference solution (`solve`), and a function that makes the test inputs. The expected outputs are computed from the
reference solution. Basics problems are one file each in `tools/problems/problems/`. The other topics live in
`tools/problems/topics/<topic id>/`, where a file may export one problem or an array of problems, and a problem does not need
`topic` (the folder name is used) or `order`.

The number of a problem is its `order`: it is unique, and a harder level never comes before an easier one (the build checks
both). In a topic folder the build gives the numbers itself: easy problems first, then medium, then hard, each level in the
order of the files. A problem with no input sets `noInput: true`.

A topic goes on the site when its id is listed in `tools/problems/release.json`. The released topics must be the first topics of
the roadmap, in order, and each must have exactly 100 problems (the build and `npm test` check this). Topics that are not
released can still be built into another folder to be checked: `node tools/problems/build.mjs --all --out <folder>`.

To avoid writing six full programs by hand, a problem can describe its program once in a `program` entry: the input (`io`, for
example `['n:int', 'a:int[n]']`) and the solution logic in each language. `tools/problems/programs.mjs` then writes the complete
starter code and solution code (reading the input, includes, `main`, optional helper functions). Hand-written `starter` or
`solution.code` for a language still wins over the generated text. `io` also reads a matrix (`'g:int[n][m]'`), a list of words
(`'w:word[n]'`), and a grid of lines (`'rows:rows[n]'`); `fast: true` switches Python, C++ and Java to fast input for big inputs.

```bash
npm run problems        # rebuilds public/problems/*.json and checks that every problem is complete
npm test                # checks the problem files, the judge and the asset sizes
```

A problem is only added when its Python, C++ and Java solutions are all Accepted by the real judge in a real browser.

`npm run vendor` rebuilds the browser compilers and the editor. It is only needed when those packages are updated.

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

   **Java (a second Worker).** Run `npm run deploy:java` once. It creates the Worker `algomashq-java` (free, static files only) at
   `https://algomashq-java.<your-subdomain>.workers.dev`. That address must match `JAVA_ORIGIN` in `wrangler.toml`, the
   `frame-src` in `public/_headers`, and the page list in `java/public/_headers` and `java/public/bridge.js` (a test checks
   that they agree). Without `JAVA_ORIGIN` the site simply offers Python and C++ only.

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
| `GET /api/me/progress` | your own progress: the problems you solved (with language and time), how each problem went, your bookmarked problems and the problems that have a note |
| `POST /api/me/solved` | record a solve `{ slug, lang, at? }`; repeating it changes nothing |
| `PATCH /api/me/state` | save how a problem is going (concept read, hints shown, solution opened, submissions); values only grow |
| `GET /api/me/submissions` | your saved solutions, newest first, without the code: one per problem and language (`?problem=<slug>`) |
| `POST /api/me/submissions` | save an ACCEPTED solution `{ slug, lang, verdict: "accepted", passed, total, timeMs?, code?, at? }`: it replaces the earlier one for that problem and language and counts the problem as solved; any other result is refused (422 `not_accepted`) and saves nothing |
| `GET /api/me/submissions/:slug/:lang` | your saved solution of one problem in one language, with its code |
| `DELETE /api/me/submissions` | clear your saved solutions (`?problem=<slug>` for one problem); your solved problems stay |
| `PUT /api/me/drafts` | save the code typed so far `{ slug, lang, code, at }`; a newer copy replaces an older one; `code: null` removes it |
| `GET /api/me/drafts/:slug` | your saved drafts of one problem |
| `PUT /api/me/bookmarks` | bookmark or un-bookmark a problem `{ slug, marked, at }`; the copy with the newer time wins |
| `PUT /api/me/notes` | save your private note on a problem `{ slug, body, at }`: plain text, at most 500 characters (longer is refused with 422), an empty body removes it; the newer copy wins |
| `GET /api/me/notes/:slug` | your own note on one problem, `{ note: { body, at } }` or `{ note: null }` |
| `POST /api/me/import` | move the progress that older versions kept in the browser into the account (once, nothing is removed) |
| `GET /api/users/:id` | your own profile (with a preview of what others see), or the public view of another member |

## Security notes

- No passwords exist. Login codes are 6 digits, expire after 10 minutes, work once, allow 5 wrong tries, and only a
  keyed hash is stored.
- Sessions use a random token in an HttpOnly, SameSite=Lax cookie (Secure on https); only its hash is stored.
  A session lasts 30 days from the last visit.
- The login form answers the same way for known and unknown emails, so it cannot be used to find out who is registered.
- Rate limits (per IP, per email, and a daily cap on emails) are kept in the database, so they hold across servers.
- Every request that changes data checks the `Origin` header. Pages of the site are served with a strict Content-Security-Policy.
  It allows WebAssembly (`wasm-unsafe-eval`) and Web Workers from this site only, and still blocks inline styles and scripts; the
  code editor is mounted in a shadow root so that its styles work under that policy.
- A learner's program runs in a Web Worker and is stopped by the page when it passes its time limit, so an endless loop cannot
  freeze the page. Output and memory are capped.
- The main site never allows `unsafe-eval`. Java, which needs it, runs on a separate origin that has no cookies and no access
  to the main site, can only be embedded by the main site, and only answers messages from it. A test (`tests/security.test.js`)
  fails if the main site's policy is ever loosened or if the two sides stop agreeing on who may talk to whom.
- Progress, your saved solutions (with your code), your drafts, bookmarks and notes are private: only its owner can read it, and no view of a member that
  other members can get contains any of it. The judge runs in the browser, so the server cannot re-check a solve; it only checks
  that a report is well formed, names a real problem and language, and has a believable time. Writes are rate-limited.
- Profile photos are small JPEGs stored as base64 in D1 (about 30 KB each). They are served only to signed-in members,
  never to the public. Looking up other members is rate-limited, so a script cannot walk through every user id.
