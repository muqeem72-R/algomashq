# AlgoMashq: Workflow and Roadmap

A free, full-page desktop platform where users learn Data Structures and Algorithms by solving problems in the browser, in C++, Java or Python. Status: planning only, nothing is built yet.

## 1. Product goals

- Free for every user.
- Works like LeetCode: read a problem, write code, run it, submit it.
- Three languages with a compiler on the platform itself: C++ first, Java second, Python third.
- Covers the full 10-topic DSA roadmap (section 2). Every topic has Easy, Medium and Hard problems.
- Teaching method: a short concept primer first, then the user builds the logic and solves the problem on their own.
- Desktop only, full-page layout.
- Login handled through Brevo.
- Reference material (for topic order and problem selection only): Striver's A2Z DSA Sheet, NeetCode 150 / Blind 75, LeetCode, GeeksforGeeks, CP-Algorithms.
- Reference project for style and approach: TypeLab, https://typelab.mukeemkhan.workers.dev/#/login

## 2. DSA roadmap (the 10 topics to cover)

Basics come first. Each topic gets Easy, Medium and Hard problems.

1. Basics: time and space complexity (Big-O), recursion, language syntax
2. Arrays and Strings: prefix sum, two pointers, sliding window, sorting, binary search
3. Hashing: HashMap and HashSet
4. Linked List, Stack, Queue (including monotonic stack)
5. Recursion and Backtracking: subsets, permutations, N-Queens
6. Trees: binary tree, BST, traversals, Heap / Priority Queue, Trie
7. Graphs: BFS/DFS, topological sort, Union-Find, Dijkstra, MST
8. Dynamic Programming: 1D, 2D, knapsack, LIS, string DP
9. Greedy, Bit Manipulation, Intervals
10. Advanced: Segment Tree, Fenwick Tree, KMP

## 3. Learning flow on every problem

1. Concept primer for the topic
2. Problem statement
3. The user thinks through the logic on their own
4. Step-by-step hints
5. Run and Submit
6. Solution with the approach explained, with code in all three languages

## 4. Build phases

| Phase | What gets built | Output |
|---|---|---|
| 0. Decisions | Name and domain, stack, code-execution backend | Decisions finalised |
| 1. Foundation and Login (DONE, see section 10) | Full-page desktop layout, themes, Brevo login (email OTP), Turnstile, sessions, D1 database, user ids, profile photo, welcome tour | A user can log in and see a dashboard |
| 2. Problem workspace | 3-pane page: problem statement, code editor with C++/Java/Python switch, input/output console, Run and Submit buttons | One problem works end to end |
| 3. Content engine | Concept primer per topic, problems, hints, test cases, solutions in all three languages | One topic fully live |
| 4. Progress | Solved tracking, submission history, streaks, bookmarks, personal notes, per-topic progress | Full progress on the dashboard |
| 5. Content writing | All 10 topics, each with Easy, Medium and Hard problems | Complete curriculum |
| 6. Polish and hardening | Admin page, rate limits, security, analytics, accessibility | Public launch |
| 7. Optional | Leaderboard, discussion, contests, mock interviews | Later |

## 5. Pages

Landing, Login, Dashboard / Roadmap, Topic page (concept), Problem list, Problem workspace, Progress, Submissions, Settings.

## 6. Content scale

About 10 topics x 3 levels x 5-10 problems = roughly 150-300 problems. Each problem needs test cases and reference solutions in all three languages. Most of the effort is content, not code.

## 7. What was found in the existing workspace

- TypeLab: the live page is rendered on the client, so only the navigation and routes were visible (`#/practice`, `#/course`, `#/stats`, `#/learn`, `#/settings`). The login screen and the source code were not visible. The TypeLab source is not in `D:\Webfolder`, which only holds `Portfolio` and `Game\python-quest`.
- Existing stack (from `Portfolio`): vanilla JS with no framework, Cloudflare Pages Functions, KV storage, secrets read from `env`, strict CSP headers. The new platform should follow the same style.

## 8. Phase 0 decisions

1. **Code execution.** Cloudflare Workers cannot run C++, Java or Python. Because the platform must stay free, user code needs a separate sandbox server.
   - Self-hosted Judge0 or Piston on a VPS (open source, full control, but the server cost is ours). Recommended.
   - Public free APIs: rate-limited and unreliable, so not a dependency.
   - In-browser WASM: Python (Pyodide) is easy, C++ and Java are heavy and hard.
2. **Database.** KV is too weak for users, submissions and progress. Cloudflare D1 (SQLite, free tier) is the better fit.
3. **Brevo limits.** The free plan allows roughly 300 emails per day, and good deliverability needs a verified domain of our own (workers.dev cannot be a sender). Use long-lived sessions so users are not asked for an OTP repeatedly.
4. **Content and copyright.** LeetCode, Striver and NeetCode are references for topic order and problem selection only. Problem statements and editorials must be original, not copied.
5. **CSP.** The Portfolio CSP blocks external scripts. The code editor (Monaco or CodeMirror) must be self-hosted, or the CSP adjusted.

## 9. Open items

- The name AlgoMashq is decided. The site runs on the free Cloudflare address `algomashq.<subdomain>.workers.dev`.
  A paid custom domain (`algomashq.dev`) is optional and can wait.
- Confirmation of the VPS option for code execution (needed before Phase 2).
- Git auto-deploy: pushing to GitHub should deploy the Worker through Cloudflare's Workers Builds. Builds were stuck
  during a Cloudflare incident on 2026-11-03, so the first deployments were made with `npm run deploy`. Confirm that a
  push now deploys by itself.
- Email delivery: login codes are sent from a personal Gmail address through Brevo. If they land in spam, a custom
  domain with SPF and DKIM is the fix.

## 10. Phase 1 status: done

Decisions made while building it:

- Login is an email one-time code (no magic link, no passwords), sent through Brevo. Cloudflare Turnstile guards the form.
- Hash routing and vanilla JavaScript, as in TypeLab. Database is Cloudflare D1. Everything stays on free tiers.
- Every member gets a public user id such as `mk001A` (initials + number 001-999 + letters A, B ... Z, AA ...).
- Three visibility levels. Owner: everything. Other members: user id, photo (or letter logo) and country.
  Members chatting together: the same plus state and preferred language. Name and email are never shown to others.
  The chat level exists in code but no endpoint serves it until chat is built.
- Sign-up collects first name, last name (not marked optional in the form), email, country, state, preferred
  language and a profile photo (upload or camera). The photo is optional: without one a letter logo is made from the
  first letter of the first name, and the color is fixed per letter.
- Everything must stay free, so the site uses a free Cloudflare Workers address; a `.dev` domain is optional and can be
  added later. It is deployed as one Cloudflare Worker (static files plus the API). The platform is independent of
  TypeLab (no shared code or design).
- A welcome tour runs once for a new member (remembered on the server) and can be replayed from Settings.

Live at https://algomashq.mukeemkhan.workers.dev (one Cloudflare Worker, a D1 database, a Turnstile widget and Brevo
for the login emails, all on free plans). A real sign-up, email code and login worked on the live site on 2026-11-03.

Verified: 16 unit tests (`npm test`), 53 API checks against a local server, and full browser runs (sign-up with and
without a photo, code, dashboard, tour, profile, settings, reload, log out, camera capture, photo upload and removal).

Next: Phase 2, the problem workspace. It needs the code-execution decision from section 8.

## 11. Phase 2 spike results: running code in the browser

Decision: code runs in the user's own browser with WebAssembly (free, no server, no abuse risk). A throwaway spike
(not part of the repository) tested all three languages in a real browser (Edge 156) on 2026-11-04.

| | Python | C++ | Java |
|---|---|---|---|
| Engine | Pyodide 314 | YoWASP clang 22 (clang + wasm-ld + libc++) | CheerpJ 5, Java 21 runtime |
| Works | Yes | Yes | Yes |
| First download | about 6-7 MB compressed | about 20-26 MB compressed (100 MB raw) | measured first compile: 30 s |
| Start / compile | start 3.5-4 s | compile 4-7 s (0.2 s with only `<cstdio>`) | compile 3 s after the first one |
| Run | 3-4x slower than normal Python | near native (sieve of 20 million: 0.33 s) | under 1 s |
| Compile errors | traceback | clang messages with line and column | javac messages with line and column |
| Stop a runaway program | kill the worker (1.5 s) | kill the worker | not solved: runs on the main thread |

Known limits and workarounds:

- C++: no exceptions (`try`/`catch` is refused; compile with `-fno-exceptions`), a 64 MB stack flag is needed for deep
  recursion, `bits/stdc++.h` needs a shim header (done in the spike), `cin` is slow for huge inputs (1 million numbers:
  4.8 s, `scanf`: 0.08 s), stdout must be reported as a plain file so `printf` is fast, and big global arrays make the
  compile slow (16 MB: 5 s, 32 MB: 23 s, 100 MB: the browser crashes). Advise `vector` for large data.
- C++ toolchain files are larger than the 25 MiB limit of one static asset (the main wasm is 72 MB), so they must be
  split in parts and joined in the browser.
- Java: the runtime is loaded from CheerpJ's own CDN (a third-party dependency, and the CSP must allow it). The license
  says free for personal, educational and hobby use; read the terms before launch. Running on the main thread means an
  infinite loop would freeze the tab, so it needs isolation (untested). Reading stdin is untested.
- Python is slower than normal, so its time limits must be more generous.
- Because the judge runs in the browser, a verdict can be faked. That is fine for learning; contests and
  leaderboards would need a server-side check.

Online compiler APIs (Judge0, JDoodle, Piston): the free tiers are tiny (Judge0 on RapidAPI about 50 submissions a
day, JDoodle about 200 credits a day) and every user would share one key; public community instances have no uptime
guarantee. They can only be an optional best-effort fallback, never the main engine.
