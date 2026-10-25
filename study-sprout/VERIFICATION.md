# Verification — October 25, 2026

## Guest demo update (version 1.4)

All **34 automated tests passed**, including browser-only generation and runtime discovery without a server. An independent static-file server on localhost port 4174 (no application API) verified instant sample creation and a custom plan with fewer than 100 characters of notes. The static judge page passed 23 / 23 browser-only checks; median generation was 6.1 ms in this smoke run, not a production benchmark. No console errors were reported.

The supplied public site was opened and its sample plan generated without a sign-in prompt in the available browser. It displayed an earlier build with four main navigation items. Its hosting publication settings were not changed, and the newer package has not been republished to that URL. A separately signed-out session was not available for verifying host-level access restrictions.

## Learning lab update (version 1.3)

All **32 automated tests passed**. Ten additional tests cover source-only explain-back points, complete self-check validation, gap priorities without fabricated quiz scores, priority ordering, matched-question comparisons including declines, the exact 48-hour boundary, recovery with days off and preserved completed work, impossible capacity, saved availability in ordinary replanning, and consent/rehearsal/deduplication rules for pilot feedback. The HTTP test also verifies the new browser modules are served.

Browser verification used the isolated localhost QA sample, leaving the main 127.0.0.1 plan records untouched:

- Empty explain-backs were rejected. An explanation was captured, sources revealed, and two self-identified gaps saved. The topic moved to the top of the evidence map while quiz coverage stayed at zero.
- A recovery preview at 10 minutes/day showed 90 minutes of overflow and disabled Apply. At 45 minutes/day, reserving October 25 as a day off scheduled zero minutes that day and fitted all 160 minutes across other days. Applying the preview persisted the changed plan through reload.
- Learning progress displayed no fabricated matched-question results and showed the saved reflection and adaptation.
- A synthetic record explicitly labeled rehearsal was saved in the pilot console; real participant counts remained zero. No real interview or customer outcome is claimed.
- Desktop and 390-pixel mobile topic-map layouts were inspected. Browser console checks found no errors on the new learning and pilot pages.

The checks below are historical results from earlier releases.

## Time-benefit update (version 1.2)

All **22 automated tests passed** after adding the new time-benefit feature. The five additional tests cover active-time measurement and pauses, signed positive/negative results, paired medians, valid study decisions, grouping by plan inputs, and duration formatting.

An isolated browser sample labeled **QA sample · Timing feature** verified the complete manual/assisted flow, empty-decision rejection, pause/resume, navigation away and back, retained decisions, a completed comparison, alternate-order suggestions, and history after a full reload. These automated interaction times are QA data, not evidence of user time savings. They were kept on a separate localhost browser origin from the main app's saved plans. No browser console errors were reported during the check.

The results below describe the earlier rubric-alignment verification and remain historical observations.

## Automated checks

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

No live OCI calls, public cloud deployment, student interviews, learning-outcome study, or commercial validation have been performed.
