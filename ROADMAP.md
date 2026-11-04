# AlgoMashq: Workflow and Roadmap

A free, full-page desktop platform where users learn Data Structures and Algorithms by solving problems in the browser, in C++, Java or Python. Status: Phases 1 and 2 are done and live; the Basics topic has its 100 problems (section 13).

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
| 2. Problem workspace (DONE for Python, C++ and Java; see section 12) | Concept, problem, hints and solution tabs, code editor, console, Run, Examples and Submit, a judge, code running in the browser | One problem works end to end |
| 3. Content engine | Concept primer per topic, problems, hints, test cases, solutions in all three languages | One topic fully live |
| 4. Progress (4a, 4b and 4c DONE, see sections 14 to 16) | Solved tracking, submission history, streaks, bookmarks, personal notes, per-topic progress | Full progress on the dashboard |
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
- Java runs in the product through a second Worker (algomashq-java). Open points: the CheerpJ license credit (the site no longer shows it in the sidebar, see section 12) and the 75 MB first download.
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

Next: Phase 2, the problem workspace (see sections 11 and 12).

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

## 12. Phase 2 status: done (Python, C++ and Java)

What exists:

- Problems page (`#/problems`, with topic pages at `#/problems/<topic>`) and the problem page (`#/problem/<slug>`).
- The problem page teaches before it tests: Concept first, then Problem, three Hints and a Solution tab that unlocks after
  the problem is solved (or when the learner chooses to open it).
- Editor (CodeMirror 6, mounted in a shadow root so its styles work under the strict CSP), drafts saved per problem and language.
- A judge: compile once, run the tests, stop at the first failure. Verdicts: Accepted, Wrong Answer, Runtime Error, Time Limit,
  Memory Limit, Output Limit, Compile Error. Hidden test data is never shown.
- Python (Pyodide) and C++ (clang in WebAssembly) run in Web Workers inside the learner's browser. A program that passes its
  time limit is stopped by terminating its worker.
- Java (CheerpJ 5, Java 21 and javac in the browser) runs in a **second Worker on its own origin**, `algomashq-java`, because
  CheerpJ needs `unsafe-eval`, which the main site never allows. The main site embeds it in a hidden iframe and talks to it only
  with `postMessage`; both sides check the origin. A program that never ends is stopped by terminating the Java worker inside
  the sandbox. All the tests of one submission run in one Java process, each in a fresh class loader, so static fields start
  fresh. `System.exit` ends only that test. The same code is not compiled twice.
- 100 original problems in the Basics topic (section 13). Several of them make a naive solution fail on time on purpose.
- All 300 reference solutions (100 problems x 3 languages) were run through the real judge in a real browser and are Accepted,
  and every starter file compiles. Wrong, slow, crashing and non-compiling programs get the right verdicts in every language
  (checked on the first 6 problems). Java was also checked on the live site with the real Content-Security-Policy on both origins.

What to know about Java in the browser (it is the heaviest language here):

- First use downloads about 75 MB from CheerpJ's CDN (kept by the browser afterwards). Every compile takes about 10 s, and a
  Submit with the same code as the last Examples run reuses the compile. After a program was stopped the next run is slow
  (about 30 s) because the Java process starts again.
- It is about as slow as Python (a loop of 50 million additions takes 6 s), so it gets 5 times the C++ time limit.
- One Java worker stops answering after roughly 60 compiles and runs (the 68th compile of a tiny program never returned). The
  client therefore replaces the worker with a fresh one after 30 operations (the replacement takes 10 to 30 s, once in a long
  while), and also throws a worker away when a request does not answer.
- Recursion is limited to about 3000 nested calls, and a deeper one is reported as a stack overflow. A very large allocation
  fails with a plain ArithmeticException (CheerpJ's way of reporting an out-of-range size).
- Needs a recent Chromium-based browser. Browsers that block storage for embedded pages may not run it.
- License: CheerpJ's free Community tier (individuals and non-commercial open source) asks for the credit "Built with CheerpJ".
  The sidebar of the site does not show it any more (the owner's choice); the credit is kept in the README, in
  public/vendor/THIRD_PARTY.md and on the sandbox page. Check https://cheerpj.com/licensing/ to be sure that this is enough.
  A company sponsor or a paid edition would need a different tier; the repository has no open-source license file yet,
  which may be worth adding.

What is not done:

- Progress is kept in the browser only. The solved list moves to the account database in Phase 4.
- More problems and the other 9 topics (Phases 3 and 5).
- Not tried: CheerpJ's experimental WasmGC engine (the test did not finish), a long-lived Java process to make compiles
  faster, and Firefox and Safari.

## 13. Basics content: the 100 problems (done)

The Basics topic has 100 problems. The number of a problem is its effort: 1 is the easiest and 100 the hardest, and a harder
level never comes before an easier one (the build checks this). Levels: 1-50 easy, 51-81 medium, 82-100 hard.

| Numbers | What they teach |
|---|---|
| 1-4 | printing: `hello world!`, several lines, the result of a calculation, a fixed pattern |
| 5-18 | reading input, variables, 64-bit integers, `/` and `%`, decimals and formatted output, units, digits of a number |
| 19-32 | `if / else if / else`, `and` / `or`, `switch`, characters and ASCII, combining small rules (leap year, days in a month, a calculator) |
| 33-43 | `for` and `while` loops, the accumulator pattern, digits of a number (count, sum, reverse, palindrome), powers by multiplying |
| 44-50 | the first arrays and strings: sum, smallest and largest, counting, linear search, reversing |
| 51-61 | strings and arrays in practice, nested loops (star and number patterns), frequency array, Caesar cipher |
| 62-73 | gcd and lcm, primes, divisors, perfect and Armstrong numbers, prime factors, binary, digital root, Collatz, Fibonacci by loop |
| 74-78 | recursion: factorial, the call stack, recursion with two parameters, recursion that calls itself twice |
| 79-92 | complexity thinking: formulas instead of loops (sum to 10^18, trailing zeros, inclusion-exclusion), binary search on the answer, fast power, memoization, Hanoi, recursion that generates, the sieve, number theory formulas |
| 93-98 | big numbers as strings and arrays, a 2-D array (spiral), modular division with Fermat, matrix power |
| 99-100 | Josephus and Fibonacci modulo for a gigantic n |

Every problem has a concept note (with code in the three languages where a new piece of syntax appears), the statement with
examples, three hints, starter code, a worked solution with its complexity, and hidden tests, in Python, C++ and Java.

How it was checked:

- The build (`npm run problems`) refuses duplicate numbers, titles and slugs, a missing field, and a level that goes backwards.
- Every Python solution was run natively against every example and hidden test (1525 runs, no difference from the JavaScript
  reference), and the problems whose formulas could be wrong (totient, digit ones, Tribonacci) check their reference against a
  plain brute force while the tests are built.
- All 300 solutions and all 300 starter files went through the real judge in a real browser (Edge): 100 of 100 Accepted in each
  language, no browser errors. The unit tests pass (134).

Limits to keep in mind when adding problems: recursion depth must stay below about 500 (Python and Java), Java inputs should
stay below a few thousand numbers (Scanner is slow), and printed decimals must avoid exact ties (languages round them
differently).

## 14. Phase 4a status: progress in the account (done)

Phase 4 is built in four parts: 4a progress in the account, 4b submission history (with the submitted code, the last 5 per
problem) and syncing drafts, 4c bookmarks and notes, 4d the Progress page.

What 4a does:

- Tables `solved` (user, problem, language, time) and `problem_state` (concept read, hints shown, solution opened, submissions).
  Both only ever grow, so merging two copies is "keep the most" and there are no conflicts.
- `GET /api/me/progress`, `POST /api/me/solved`, `PATCH /api/me/state` and `POST /api/me/import` (see the README).
- The browser keeps a copy per account, writes to it first and sends changes through a retried queue, so nothing is lost offline.
  The dashboard, the problem list and the problem page read the same data as before; it simply comes from the account now.
- The first sign-in after the update moves the progress that older versions kept in the browser into the account.
- Private by design: only the owner can read it, and no member view contains it (tests check both).

What to know:

- The judge runs in the browser, so a solve is reported by the browser and the server cannot re-check it. The server checks that the
  problem and language are real and the time is believable. This is fine for a personal learning platform; a leaderboard
  (Phase 7) would need another idea.
- Free-tier cost: a first solve is about 2 database writes, a hint or a submission about 2 more. A learner finishing all 100
  problems writes a few hundred rows in total.
- Still only in the browser: drafts (they come with 4b), and the streak is computed from the solve times.
- If a shared computer is used, the very first sign-in after the update takes over the old browser-only progress. Later accounts
  on that browser start empty, because each account now has its own saved copy.

## 15. Phase 4b status: saved solutions and drafts (done)

What 4b does:

- Table `submissions`: only an ACCEPTED solution is saved. For every problem and language the account keeps ONE, the last accepted
  one: tests passed, slowest time and its code. Accepting a newer solution in the same language replaces it; another language keeps
  its own, so there are at most three per problem. A submission that is not accepted saves nothing (not its code, not its result)
  and never replaces a saved solution; the server refuses it with 422 `not_accepted`. Run and Examples are not recorded. Saving a
  solution also marks the problem solved. A report that waited offline and is older than the stored one does not replace it.
- Table `drafts`: the code typed so far, per problem and language. It is not a submission: it reaches the account when a problem is
  submitted or left (or the page is hidden), not on every keystroke. The newer copy wins. A problem opens in the language of its
  newest draft.
- The Submissions page (`#/submissions`, and `#/submissions/<problem>` from the "Submissions" link on a problem): a table with the
  language, tests and time; a click shows the code, with "Use this code in the editor" and "Copy"; and "Clear all". It does not
  touch what you solved.
- Everything is private to its owner; the tests check that other learners get 404 or an empty answer and that no member view
  contains any of it.

What to know:

- Free-tier cost: a failed Submit writes nothing to the solutions; an accepted one is about 3 database writes (the rate limit
  counter, the solution and the solved row). The attempt counter and the draft add a few more.
- The storage is small and bounded: at most 3 saved solutions per problem, 300 per learner, each at most 20 000 characters.
- A draft that a learner resets on one device can come back from another device that still has the old text (there are no
  "deleted" markers). It is a small price for keeping the sync simple.
- Still to come in Phase 4: 4c bookmarks and notes, 4d the Progress page (per-topic progress, a year-long activity calendar).

## 16. Phase 4c status: bookmarks, notes and filters (done)

What 4c does:

- Bookmarks: a star on every problem, in the Problems list and in the header of a problem. Table `bookmarks` keeps a row per problem
  with a marked flag and its time (a removed bookmark keeps its row with marked = 0, so a stale copy on another device cannot bring
  it back). The list of bookmarked problems comes with the one progress call.
- Notes: a Notes tab on every problem with a private note, plain text, **at most 500 characters** (the field stops at 500 and the
  server refuses more). It is saved a moment after typing stops, when the field loses focus and when the tab or the problem is left.
  Table `notes`: the newer copy wins, and an emptied note keeps an empty row with its time for the same reason as above. A dot on the
  tab and a note mark in the list show which problems have one; the note itself is fetched when a problem is opened.
- Filters in the Problems list: **All / Solved / Unsolved** with the number of problems behind each, plus **Bookmarked** and **With
  notes** chips. The numbers count what the topic, the difficulty and the search leave, so they always match the list.
- Everything is private to its owner (the tests check that other learners get an empty answer, and that no member view contains any
  of it). Notes are shown as text, never as markup.

What to know:

- Free-tier cost: a bookmark or a note save is about 2 database writes (the rate limit counter and the row).
- Two devices editing the same note at the same time do not merge: the copy with the newer time wins.
- Not done on purpose, to look at later: a "Saved for later" card on the dashboard.
- Still to come in Phase 4: 4d the Progress page (per-topic progress, a year-long activity calendar).

