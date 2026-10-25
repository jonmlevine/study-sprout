# Verification — October 25, 2026

## Judge reliability update — deployed version 5

Commit `b4a7b503fc8a01d3e1a1b7a4998a94cfe6598cd6` passed **23/23 repository tests**. The new cases cover legacy progress loading, session-storage fallback, restoration of the latest fallback snapshot after quota failure, preservation of invalid raw records, truthful memory-only status, and the fixed two-question judge fixture.

Directly checked on the [public judge entry](https://study-sprout-journal.saltyegret15.chatgpt.site/?judge=1): seeded study topic and source evidence, explicit session completion persisting after reload, two confidently incorrect quiz answers, corresponding review reasons, applying the time-budgeted schedule, and completion plus review state surviving reload. Reset restored the demo to its initial state; the regular workspace remained available separately. The public `/demo` checks passed **21/21** after deployment (median **4.3 ms**, maximum **10.3 ms**, browser-local generation).

Sites reported version 5 published from that commit. Storage restrictions were injected in automated tests, not browser settings. If both local and session storage are blocked, reload persistence is impossible and the app reports that limitation; hosting-level access controls cannot be bypassed by application code.

## Earlier checks recorded with the imported source

17 tests passed with Node.js 20.17.0:

```sh
node --preserve-symlinks --preserve-symlinks-main --test tests
```

Coverage: source-grounded offline questions; daily time budgets and deadlines; DST/year boundaries; input rejection; quiz sampling; progress replacement; AI schema/evidence checks; RSA-SHA256 signing; mocked OCI response and error paths; HTTP serving and private-file isolation; confidence priorities; review due dates; latest-answer replacement; overdue work; capacity checks; non-mutating previews; review deduplication; partial-review preservation; past deadlines; and already-completed study time.

## Browser verification

Verified in the in-app browser:

- An answer cannot be checked until both an option and confidence are selected.
- A deliberately wrong “Very sure” answer created a priority review with its explanation.
- The replan preview added that review and kept daily scheduled totals at or under the selected limit.
- Reducing the daily budget to 10 minutes showed 90 minutes that would not fit and disabled Apply.
- Restoring 30 minutes allowed the plan to be applied; the revised plan survived reload.
- The judge page loaded, accurately reported local-only/offline status, and ran its live verification.

The judge page passed **23 of 23 assertions**, using five offline plan requests. Measured browser-to-local-server request times: **median 14.7 ms**, **maximum 39.3 ms** at approximately 4:58 PM America/Chicago on October 25, 2026.

These are observations from this machine and this small run, not a production performance guarantee, load test, or OCI inference benchmark. Run `/demo` → **Run live verification** for fresh measurements and download the resulting report.

At the time of that earlier run, live OCI calls, public deployment, interviews, student outcomes, and commercial validation had not been verified. The published-site checks below supersede the earlier deployment status.

## Public ChatGPT Site — October 25, 2026

Judge entry points: [published app](https://study-sprout-journal.saltyegret15.chatgpt.site/) and [published walkthrough](https://study-sprout-journal.saltyegret15.chatgpt.site/demo). These are the demo URLs. Local development addresses are not judge entry points.

Observed directly in Chrome on the public site before the judging-copy revision:

- `/demo` passed **21/21 browser-local checks**, using five rule-based plan generations: median **5.7 ms**, maximum **13.6 ms**, at approximately **7:00 PM America/New_York**. These are browser-local smoke timings, not server or OCI inference latency.
- Created the fictional plan `Judge verification · Biology` with a seven-day deadline and 30-minute daily budget, opened a study topic, and recorded a completed session.
- Completed a five-question quiz with confidence and answer feedback. A deliberately incorrect “Very sure” answer produced the expected misconception review.
- At 10 minutes per day the preview reported **115 minutes** that would not fit, preserved the previously completed 25-minute session, and disabled Apply. Restoring 30 minutes allowed applying the plan.
- Reload preserved the adapted schedule, completed work, and the saved **1/5** quiz attempt in Recent practice. The quiz results screen itself is transient.
- No captured browser console errors were present during this exercised flow. This is not an exhaustive audit.

The hosted app is a browser-only adaptation with OCI disabled; the repository also includes a separate Node server and OCI adapter. A later source-import chat references commit `1335269ecba4d76d9193c089f57795db726f39dc`, but an exact deployed-tree comparison has not been performed. Do not present a repository test pass as proof of identical hosted code.

Repository checks were rerun separately with **Node.js 22.14.0: 17/17 passed**. The sandbox initially blocked the temporary HTTP listener; the same suite passed when permitted to bind. A localhost preview was used earlier to inspect unpublished copy; all judge-facing verification uses the public ChatGPT Site.

No specific failing judge-browser trace was supplied. The main live flow passed in this check; unspecified judge failures cannot be claimed resolved. No real OCI inference, customer interviews, paid adoption, student-outcome study, independent signed-out visitor session, or production-readiness certification is established by these checks.

## Published judging revision — version 3

The existing ChatGPT Site was updated in place. Its live `/demo` was checked directly after publication: all five rubric sections render with grades 6–8 as users, parents as buyers, the 30% planning-time target, proposed 20-family pilot, and dated NCES source. There are no localhost judge links.

The deployed page passed **21/21 browser-local checks** at approximately **7:08:55 PM America/New_York on October 25, 2026**: five generations, median **3.3 ms**, maximum **5.5 ms**. At a **390 × 844** viewport, document and content widths were both **390 pixels**; the market and solution sections were visually inspected. This is one phone-width check, not full device or accessibility coverage. The student app was preserved by this judge-page-only deployment; its core flow was exercised before publication as described above.

The deployable archive was downloaded as `study-sprout-hosted-source-v3.zip`, SHA-256 `7751352c426206d83f7e436ff821a94e2bdb24d3f9385bebff10ab23d1811569`. The repository's `public/demo.html` and `demo.css` match both the archive's public source and deployed `dist` copies byte-for-byte. `demo.js` has the same content, with trailing whitespace removed from two blank lines. The repository student app still uses its Node API; the hosted student app uses its existing browser adaptation. This update does not migrate either runtime.

Pilot numbers remain proposals. No student or commercial outcomes were measured.
