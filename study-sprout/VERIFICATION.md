# Verification — October 25, 2026

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
