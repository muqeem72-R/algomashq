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
| 4. Progress (DONE, see sections 14 to 17) | Solved tracking, submission history, streaks, bookmarks, personal notes, per-topic progress | Full progress on the dashboard |
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

## 17. Phase 4d status: the Progress page (done)

What 4d does (the page behind "Progress" in the sidebar):

- **Numbers on top:** problems solved (the one large figure), active days, current streak, best streak.
- **A 61-day calendar:** 30 days back, today and 30 days ahead, laid out under Monday to Sunday, with the **date of every day printed
  in its cell** (1, 2, 3 ...) and the month name on the first day and on every 1st. A day with one solve is lit softly, a day with two or
  more is lit fully, today has a ring, days to come are empty outlines. Hover or keyboard focus on a day shows how many problems were
  solved and which ones (with their language). A table view lists the days with solves.
- **Milestones** (a small set, to be tuned later): first solve, 10, 25 and 50 problems, all the Easy ones, every problem, 7 days in a
  row, and a problem in each of the three languages. Each shows "reached" or how far you are.
- **By topic** (only topics that have problems, plus a line about the others still to come), **by difficulty** and **by language**.
- **Solved each week:** a column chart of the last 12 weeks (thin columns, value labels only on this week and the best week), with a
  readout on hover and a table view.
- **How you learn:** solved without any hint, accepted on the first submit, solution opened before solving, hints opened in all,
  concepts read, submits per solved problem. Plain numbers with no judgement.
- **Solved problems:** a list, newest first, with the languages and the first-solved date, filtered by difficulty and language.

How it is built:

- No new table or endpoint: it reads the solves and the per-problem state that the account already keeps (section 14), and the
  counting is in `progress-stats.js` (day numbers, streaks, the calendar, weekly totals, rows, habits, milestones) with 13 unit tests
  that also pass in other time zones. The dashboard uses the same day and streak counting.
- The charts follow a few fixed rules (from the data-visualisation guide used for this page): one hue in steps for "how much", thin
  marks, a readout on every mark that also works with the keyboard, text in text colours, no number on every point, and a table view
  under each chart.

What to know:

- The calendar shows the days on which something was **solved**, not the days on which something was tried: a submit that is not
  accepted is not saved, and hints and attempts have no time stamp.
- Days are the learner's own local days.
- Phase 4 is complete (4a to 4d). Phase 5, writing the other nine topics, is in section 18.


## 18. Phase 5: the other nine topics, one topic at a time

Every topic has exactly 100 problems: 30 easy, 45 medium and 25 hard, numbered by effort. Topic number `T` uses the numbers
`(T - 1) * 100 + 1` to `T * 100`. A topic is written, checked in all three languages, and only then released and deployed; the next
topic is started after the released one has been checked on the live site.

How it works:

- `tools/problems/release.json` lists the released topics. They must be the first topics of the roadmap in order, and each must
  have exactly 100 problems. Only released topics are written to `public/problems`; the unit tests enforce this.
- The sources of a topic live in `tools/problems/topics/<topic id>/`. A file may hold many problems, and the build gives the
  numbers (easy, then medium, then hard).
- `node tools/problems/build.mjs --all --out <folder>` builds every topic, also the unreleased ones, into a folder. The checking
  scripts can serve that folder instead of the site, so a topic can be verified before it is on the site.
- The program generator reads matrices (`g:int[n][m]`), lists of words (`w:word[n]`) and grids of lines, and `fast: true` gives
  fast input in all three languages (needed for inputs of thousands of numbers, where Java's `Scanner` is too slow).
- The tests are not made smaller to save space: the largest tests (up to 20000 numbers) are what separates a fast solution from
  a slow one.

How a topic is checked before it is released:

- The build refuses duplicate numbers, titles and slugs, a missing field, and a level that goes backwards.
- Every Python solution runs natively against every example and hidden test, and the problems that are easy to get wrong
  compare their reference solution with a brute force while the tests are built.
- All solutions and all starter files go through the real judge in a real browser (Edge), in Python, C++ and Java.
- A real browser session on a clean server: sign up, the dashboard, the roadmap, the problem list with its filters, solving
  problems through the editor, and the Progress page.

### Arrays and Strings (101-200, released)

| Numbers | What they teach |
|---|---|
| 101-110 | one pass over an array: counters, running sums, rotation, a write index, merging, runs, a sum formula, range sums |
| 111-116 | digits with a carry, looking at neighbours, matrices (transpose, diagonals, row and column sums, the border) |
| 117-126 | strings: counting letters, anagrams, prefixes, words, runs of letters, subsequence, rotation, pattern search |
| 127-130 | binary search, two pointers on sorted arrays, Pascal's triangle |
| 131-137 | binary search variants (lower bound, rotated arrays, a peak) and binary search on the answer |
| 138-148 | sliding windows and two pointers: window sums, distinct letters, replacements, flips, permutation in a string, water, triplets, three colours |
| 149-160 | maximum subarray (sum, product, circle), prefix products, next permutation, difference arrays, mountains, cycle detection, intervals, custom sorting |
| 161-167 | matrices: rotation, spiral, zeroes, search in a sorted matrix, diagonals, the Game of Life, rectangle sums |
| 168-175 | strings in depth: palindromes, parsing a number, zigzag, Roman numerals, version numbers, count and say |
| 176-184 | hard windows and searches: the smallest window, trapped water, the first missing positive, the median of two arrays, the k-th smallest by binary search |
| 185-194 | hard arrays: inversions with merge sort, reverse pairs, "exactly k" windows, two blocks, the best rectangle, chunks, swaps and cycles, flips, a deletion |
| 195-200 | text justification, the k-th permutation, a number in English, divide and conquer on a string, four numbers with a sum, an expression with precedence |

How it was checked: 1171 native Python runs against the JavaScript reference with no difference; 100 of 100 solutions Accepted in
each of Python, C++ and Java by the real judge in a real browser, and all 300 starter files compile; 290 unit tests pass; a browser
session on a clean server passed 25 checks (dashboard, roadmap, list and filters, three problems solved through the editor,
Progress page).

### Hashing (201-300, released)

| Numbers | What they teach |
|---|---|
| 201-210 | sets and maps: two numbers that add up, duplicates, distinct values, frequency tables, the most frequent value, the first repeat, a number without a partner, intersections, one-to-one mappings, "can the note be written" |
| 211-220 | counting pairs with a map (equal pairs, a given sum or difference), a missing and a repeated number, equal frequencies, jewels, happy numbers (a cycle found with a set), the majority element, repeated and missing values |
| 221-230 | word patterns, a block with sum zero from equal prefix sums, same multisets, the first number that occurs once, word frequencies, an arithmetic progression, successors, palindromes from letter counts |
| 231-239 | prefix sums with a map: blocks with sum k, the longest block, equally many 0s and 1s, remainders modulo k, odd numbers, vowels against consonants, prefix xor |
| 240-249 | grouping by a key: anagram groups, the longest run of consecutive values, the k most frequent values, four arrays with sum zero, anagram positions, duplicates close to each other, shifted words, letters by frequency, a brick wall, multiset intersection |
| 250-259 | lookups: equal distances from a point, favourite lists, a harmonious subsequence, bulls and cows, a sudoku board, pairs with a sum divisible by d, k-sum pairs, rows equal to columns, normalised email addresses, the degree of an array |
| 260-267 | text and counting: repeated DNA blocks, blocks of length k, words from letters, common letters, anagram index mapping, groups of digit sums, "close" strings, dominoes |
| 268-275 | keys that are computed: subdomain visits, rabbits in a forest, nice pairs after a reversal, an unusual alphabet, balanced splits, anagram steps, a window with limited frequency, a palindrome from two-letter words |
| 276-282 | hashing of strings: a rolling hash with binary search (longest repeated block, longest common block), all different substrings, the shortest palindrome by prepending, a block with a given hash value, doubled substrings, a Zobrist hash for anagram pairs |
| 283-290 | blocks made of all the words, the most points on a line (reduced slopes), palindrome pairs, three equal letter counts, a walk that moves by one step, bitmask prefixes, a removed block for divisibility, buckets for "almost" duplicates |
| 291-300 | canonical forms of rows, a subsequence ending with a value, reduced fractions, taking from both ends, the xor of both sides, rectangles with a given sum, squares through a query point, equal products, words that are subsequences (buckets by the next letter), the sum of distances to equal elements |

How it was checked: 1203 native Python runs against the JavaScript reference with no difference (the references of the string
problems are exact, for example a suffix automaton, and most medium and hard problems are also compared with a brute force while
the tests are built); 100 of 100 solutions Accepted in each of Python, C++ and Java by the real judge in a real browser, and all
starter files compile; 390 unit tests pass; a browser session on a clean server passed 25 checks (three topics on the site,
roadmap, list and filters, three problems solved through the editor, Progress page).

Two things that came up: the build now accepts hidden tests of up to 5 MB per problem (the tests are not made smaller to fit),
and a Java solution had a real compile error in the real judge (a `long` used as a string index) that the other two languages
did not show, which is why every language is run for every problem.

### Linked List, Stack, Queue (301-400, released)

| Numbers | What they teach |
|---|---|
| 301-310 | lists: reversing, the middle, duplicates in a sorted list, merging, a palindrome, removing values, the k-th node from the end, a cycle, sorted insertion, a binary number |
| 311-322 | stacks: matching brackets, adjacent duplicates, a score record, backspaces, postfix expressions, the next greater element, a stack with the minimum, discounts, nesting depth, folders |
| 323-330 | queues: a queue from two stacks, recent requests, a moving sum, the first unique value, tickets, sandwiches, a circular queue, a stack from a queue |
| 331-345 | list surgery: the n-th node from the end, swaps in pairs, rotation, partition, adding numbers, odd and even nodes, reversing a part, reordering, sorting, the start of a cycle, two lists that meet, the middle node, twin sums |
| 346-363 | monotonic stacks and stack parsing: warmer days, nested strings, file paths, asteroids, removing digits, stock span, car fleets, minimums of subarrays, scores of brackets, valid sequences, the smallest subsequence, function times, the 132 pattern, larger nodes in a list, text in brackets |
| 364-375 | deques and queue designs: the maximum of a sliding window, a circular deque, scores of jumps, a limited range, people seen in a queue, a hit counter, a senate vote, a deck of cards, a queue with the maximum, a stack with increments, browser history, robots within a budget |
| 376-382 | hard lists: groups of k, merging k lists with a heap, a deep copy with random pointers, an LRU cache, an LFU cache, zero-sum blocks, groups of growing size |
| 383-391 | stacks on grids and text: the largest rectangle in a histogram, in a grid of ones, counting rectangles, two calculators (parentheses and precedence), the longest valid parentheses, the sum of ranges of subarrays, the widest ramp, the atoms of a formula |
| 392-400 | deques and designs: a shortest block with a large sum (negative numbers), a sum with length limits, the best minimum for every window size, the second greater element, a most-frequent stack, a text editor with a cursor, a maximum min-product, the cheapest tree from its leaves, dinner plate stacks |

How it was checked: 1206 native Python runs against the JavaScript reference with no difference (and 13 more after the tests of
one problem were changed, see below; every hard problem and most
medium problems are also compared with a brute force while the tests are built; the list problems check the result by walking the
nodes, and the copy with random pointers prints `invalid` if the copy shares a node with the original); 100 of 100 solutions
Accepted in each of Python, C++ and Java by the real judge in a real browser, and all starter files compile; 490 unit tests pass;
a browser session on a clean server passed 25 checks (four topics on the site, roadmap, list and filters, three problems solved
through the editor, Progress page).

Things that came up: a long chain of nodes freed in Python overflowed the stack in the browser, so the Python list code now keeps
a registry of its nodes and frees them in a loop. A correct Java solution of "Merge Two Sorted Lists" threw a
`NullPointerException` in the browser (CheerpJ) on a hidden test where a one-node list sits in the middle of a list of 20000
values. In a separate experiment the error appeared as soon as one branch of the loop had run about 70 times before the other
branch ran for the first time (68 times was fine), and only when the method assigned to its reference parameters; copying the
parameters to local variables avoided it. That is a fault of the engine and not of the solution, so the hidden tests of that
problem now put the one-node list at the smallest or the largest value (still 1 against 20000) and use a middle value only with a
short list. The number of tests did not go down (it went up by three). Once, during a long Java run, the runner gave no answer in
time; the same problem was Accepted at once when it was run alone.

### Recursion and Backtracking (401-500, released)

| Numbers | What they teach |
|---|---|
| 401-410 | recursion on numbers, text and structures: ways to split a number, stairs with broken steps, numbers made of fours and sevens, every cut of a number, nested lists, a pattern that contains itself, a number in words, brace expansion, routes in a DAG, groups without conflicts |
| 411-420 | the first enumerations: subsets, subsets with a given sum, combinations, permutations, derangements, strings without two ones in a row, balanced brackets, phone keypad words, the Gray code, two piles with equal sums |
| 421-430 | more easy searches: walks in a grid without revisiting, case variants, the XOR of all subsets, plus or minus to a target, n queens, codes with a digit sum, climbing with steps of 1, 2 and 3, subsets with a small product, numbers without a repeated digit, palindromes over an alphabet |
| 431-439 | subsets and orders: different subsets and arrangements of lists with repeats, the rank of a permutation, the k-th combination, combination sums, the smallest difference of two piles, beautiful arrangements, words from tiles |
| 440-449 | strings: palindrome cuts, IP addresses, all sentences of a dictionary, additive sequences, strobogrammatic numbers, unique concatenations, the best words from a bag of letters, every bracketing of an expression, abbreviations, signs between digits |
| 450-458 | grids and games: word search, the smallest path in a maze, a walk over every square, a gold mine, noughts and crosses, the flipping game, a number-picking game, taking from both ends of a row, the 24 game |
| 459-468 | constraints: queens with forbidden squares, the first placement of n queens, a small sudoku, graph colouring, a walk through all towns, the largest independent set, seating without enemies, equal sums in k groups, fair cookie sharing, magic squares |
| 469-475 | puzzles: shopping offers, cryptarithms, painting a grid, rooks, domino tilings, prime rings, kings that do not touch |
| 476-481 | hard: sudoku, expressions that reach a target, fixing brackets, many words in a grid with a trie, word squares, the largest sequence with spaced pairs |
| 482-488 | hard: the smallest team, work sessions, the closest subset sum (meet in the middle), settling debts, the shortest superstring, stickers, exact covers |
| 489-494 | hard: skyscrapers, lights out, bike assignment, squareful arrays, the smallest Hamiltonian path, a number path puzzle |
| 495-500 | hard: the chromatic number, dominating sets, Latin squares, automorphisms, tromino tilings, futoshiki |

How it was checked: 1587 native Python runs against the JavaScript reference with no difference (most medium and hard problems
are also compared with a brute force or an independent method while the tests are built; the puzzles use generated puzzles whose
number of solutions is checked); 100 of 100 solutions Accepted in each of Python, C++ and Java by the real judge in a real
browser (300 checks, on files identical to the released ones), and all starter files compile; 590 unit tests pass; a browser
session on a clean server passed 25 checks (five topics on the site, roadmap, list and filters, three problems solved through
the editor, Progress page).

Things that came up: the Basics topic already has the simple recursions (factorial, Fibonacci with a memo, fast power, the Tower
of Hanoi, all binary strings), so this topic starts with recursion on structures and goes on to backtracking. A list of results
is only used when the number of lines is small (at most a few thousand); the other problems ask for a count, the first or the
smallest answer, or a yes or no. The real-browser check found one Java compile error that the other languages did not show (a
variable called `sc` clashed with the scanner of the generated program), and a unit test found a few test inputs without the
final newline; both were fixed before the release. The hidden tests were chosen so that the slowest Python reference takes
about two seconds natively (the browser limit for Python is ten); no hidden test was made smaller to fit.

### Trees (501-600, released)

| Numbers | What they teach |
|---|---|
| 501-510 | the basics of a binary tree: depth, counting nodes and leaves, sums, the three depth-first walks and the level order, the minimum depth, the largest and the smallest value |
| 511-520 | comparing and changing trees: equal trees, mirror symmetry, inverting, a root-to-leaf sum, a balanced height, left leaves, the level with the largest sum, similar leaves, merging two trees, a subtree inside a tree |
| 521-530 | search trees, a heap and a trie: look up, check, insert, the k-th smallest, a range sum, the closest value, the smallest difference, a balanced tree from a sorted list, a min-heap by hand, a trie of words and prefixes |
| 531-540 | paths: lowest common ancestors (in any tree and in a search tree), the diameter, paths with a given sum (count, list, numbers formed by digits), good nodes, the right-side view, zigzag levels, the bottom-left value |
| 541-550 | shape and building: a tree from two walks, a search tree from its pre-order, writing a tree as text and reading it back, flattening, vertical order, the widest level, nodes at distance k, choosing nodes that are not neighbours |
| 551-559 | search tree operations: delete, trim, add the bigger values, an iterator, pairs with a given sum, the next larger value, a valid pre-order, rank and k-th with subtree sizes, merging two search trees |
| 560-568 | heaps: the k-th largest of a stream, the two heaviest stones, joining ropes, a task scheduler with a cooldown, reorganising a string, the running median, meeting rooms, numbers built from given primes, the k closest points |
| 569-575 | tries and general trees: counting words by prefix, shortest unique prefixes, a dictionary with dots, replacing words by roots, and depth, subtree sizes and the diameter of trees given by parents or by edges |
| 576-584 | hard, binary trees: the best path with negative values, cameras, two swapped values, orderings that build the same tree, the richest search tree inside a tree, duplicate subtrees, good pairs of leaves, the most common subtree sum, deleting nodes to get a forest |
| 585-592 | hard, general trees: the sum of distances (rerooting), the k-th ancestor and the lowest common ancestor with binary lifting, subtree sums with updates (Euler tour and Fenwick tree), centroids, the longest path with different neighbours, rooted tree isomorphism, the best roots for the lowest tree |
| 593-600 | hard, heaps and tries: the skyline, the median of every window, the narrowest range over k lists, rain on a grid of heights, projects and capital, the best team, courses with deadlines, the largest XOR with a limit |

How it was checked: 2461 native Python runs against the JavaScript reference with no difference (most medium and hard problems
are also compared with a brute force or an independent method while the tests are built); 100 of 100 solutions Accepted in each of
Python, C++ and Java by the real judge in a real browser (300 checks, on files identical to the released ones), and all starter
files compile; 690 unit tests pass; a browser session on a clean server passed 25 checks (six topics on the site, roadmap,
list and filters, three problems solved through the editor, Progress page).

Things that came up: a binary-tree problem reads the tree in level order, and the first number of the input is the number of words
of the description. Python ignores that number but C++ and Java read exactly that many words, so a wrong number in one test is only
seen in two of the three languages; the real-browser check found one such test, and a small script now checks the number in every
test of the topic. The tree functions are recursive, so the trees in the tests are at most 800 levels tall (the recursion limit of
Python is 1000), and a tree can have up to 20000 nodes; the problems on general trees (given by parents or by edges) can be paths
of 20000 nodes, and their solutions use loops with a breadth-first order instead of recursion. The result of "Straighten the Tree
Into a List" is a chain of 20000 nodes, and freeing it at the end of the run crashed Python in the browser ("Maximum call stack
size exceeded", which also made every later Python run in that browser session fail); like in the list topic, the starter code of
that one problem cuts the chain in a loop at the end. The build keeps the hidden tests of one problem under 5 MB, so for the
trees with 20000 nodes the tests use fewer queries per tree, but every problem still has its biggest tests (up to 20000 nodes and
up to 20000 queries); no hidden test was made smaller. A problem that was planned (Word Search II with a trie) already exists in
the Backtracking topic, so it was replaced by "The Largest XOR With a Limit".

Next: Graphs (601-700).
