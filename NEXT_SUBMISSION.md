# Study Sprout — next submission

Use the four answers below in the corresponding submission fields. Each exceeds 80 characters. Targets, historical population context, and technical checks are distinct from customer outcomes.

## What did you build?

We built Study Sprout for parents who repeatedly help a middle-school child decide what to study next. Their child uses a working web app that turns English-language notes, an exam date, and a daily time budget into one manageable study task. A short quiz captures both answers and confidence; confident mistakes become priority reviews in a revised schedule the student previews before applying. Our smallest useful product is one child, one subject, and one upcoming science test. The aim is less parent-assisted planning and a more independent start to studying, not another generic checklist or quiz generator.

## Who has this problem?

Our intended buyer is a parent who repeatedly helps a grades 6–8 child start test preparation; the student is the user. We first target families already seeking homework help and able to supply text notes. Our proposed entry market is a two-week pilot with 20 parent–student pairs, recruited through permission-based invitations from one tutoring provider or parent community. This channel reaches families around an existing homework-support need without school procurement or an LMS integration. No recruiting partner, participants, or paid customers are secured. For broader historical scope, NCES reports approximately 11.1 million U.S. public-school students in grades 6–8 in fall 2022; that is population context, not product demand or paying households. If the single-test use case works, the same families can use it for recurring tests and additional subjects before we test tutor referrals.

## How does your app solve it?

Before Study Sprout, our target-family hypothesis is that a child rereads scattered notes while a parent chooses tasks, maintains a checklist, and rebuilds it after missed work. Afterward, the child pastes notes, sets a deadline and daily budget, opens the next task, checks recall, and previews a revised schedule based on answers and confidence. The concrete outcome we will measure is time from opening study materials to choosing the first specific task. Our proposed KPI is at least 30% lower median planning time versus each family's usual workflow. For illustration, a 10-minute baseline would imply a target of 7 minutes, saving 3 minutes per evening; those are hypothetical values, not observed results. We will compare three baseline evenings with three app evenings per family and count parent reminders. A second pilot target is 12 of 20 students returning on three distinct study days over two weeks. Neither target has been measured yet.

## How did you build it?

We built the interface with HTML, CSS, and JavaScript, collaborated through GitHub, and published a browser-based version on ChatGPT Sites. Hosted generation uses transparent rules rather than live AI, and progress stays in browser storage. An isolated judge mode supplies fictional notes, a repeatable two-question quiz, and a reset that affects demo progress only. Local storage can fall back to tab session storage, with visible warnings when persistence is restricted. On October 25, 2026, 23 repository tests and 21 live browser smoke checks passed; the recorded live flow covers source evidence, completion, quiz feedback, confidence-based replanning, and reload persistence. These are technical checks, not proof of student impact. The repository also includes a Node.js server and an optional Oracle Cloud Generative AI adapter, but live OCI inference remains unverified. This is a working hackathon prototype, not a production student service; broader family use needs validated content, reliable recovery, and age-appropriate privacy and consent design.

## Optional judge-access notes field

Public judge entry: https://study-sprout-journal.saltyegret15.chatgpt.site/?judge=1 . No app login, account, credentials, or live AI service is required. It seeds fictional notes and a two-question quiz in storage separate from the study workspace. Select Reset judge demo before starting. Keep JavaScript and browser storage enabled; session storage is the fallback when local storage is unavailable. A direct request without login cookies returned HTTP 200 during our current check, but we have not reproduced or resolved the gate reported in AI Judge's own browser environment. If that environment shows an access wall, record its URL and visible message rather than signing in with a personal account. The current recorded repository result is 23 tests, superseding the earlier submission's 17-test count; the browser smoke page reports its separate 21 checks.

## Judge links and deeper workflow

- App: https://study-sprout-journal.saltyegret15.chatgpt.site/
- Isolated judge entry: https://study-sprout-journal.saltyegret15.chatgpt.site/?judge=1
- Walkthrough and browser checks: https://study-sprout-journal.saltyegret15.chatgpt.site/demo
- Source: https://github.com/jonmlevine/study-sprout

Use the isolated entry, then **Reset judge demo → Take my next step → Read the source evidence → Mark session complete → Practice now → answer and confidence → Check answer → finish both questions → Preview my adapted plan → Apply this plan → reload**. The meaningful demonstration is a confident mistake becoming a scheduled review while completed work remains saved. A homepage screenshot alone does not prove that loop.

The application is designed to need no judge login. The latest judge report nevertheless says verification appeared gated; use the current independent access result before claiming that specific reported blocker is resolved. Do not replace a public demo URL with a ChatGPT conversation or editor URL.

## Evidence behind the market figure

[NCES Digest 2023, Table 203.10](https://nces.ed.gov/programs/digest/d23/tables/dt23_203.10.asp?current=yes), fall 2022 public-school enrollment, values in thousands: grade 6 = 3,643; grade 7 = 3,685; grade 8 = 3,783. Their sum is 11,111 thousand, or approximately 11.1 million students. This dated population figure is not a current market estimate, a count of unique households, an obtainable market, or a revenue forecast. The immediate recruitment goal remains 20 families.

## What would close the remaining evidence gap?

The feedback flag `missing_outcome_evidence` remains unresolved by technical tests or better wording. No real customer interview results, observed planning-time savings, partner commitment, repeat-use rate, payment, or learning effect is currently evidenced. The [synthetic interview scenarios](CUSTOMER_DISCOVERY_SIMULATION.md) are fictional planning exercises and must not be submitted as customer findings.

Before claiming impact, collect paired usual-workflow and app observations with parent permission and student assent. Report the sample count, failures, missing observations, and measured planning-time change. The 30% target and 10-to-7-minute illustration must remain labeled expected outcomes until then. Technical smoke timings must not be reported as time saved by a student.

The next business gate is actual repeated use and a clearly priced paid pilot. After that, test recurring subjects within the same family and tutor referrals. The prototype is easy to copy; trusted distribution and validated question quality are potential future advantages, not an existing moat.
