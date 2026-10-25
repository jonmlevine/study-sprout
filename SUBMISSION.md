# Study Sprout — revised hackathon submission

## Paste-ready application answers

### What did you build?

We built Study Sprout, a working study companion for middle-school students preparing for an upcoming test. It connects a student's notes, deadline, available time, quiz answers, and confidence to one manageable next task. A confident mistake becomes a priority review, and students preview a revised schedule before applying it. The first use case is deliberately small: one child, one subject, one test. Our proposed pilot targets 30% lower median planning time; this is an expected KPI, not a measured result.

### Who has this problem?

Parents who repeatedly help a child start test preparation are our intended buyers; students in grades 6–8 are the users. We are testing the hypothesis that choosing what to study and rebuilding a missed schedule creates recurring work for both. Our first recruitment goal is 20 families reached through one tutoring provider or parent community; no partner or participants are secured. For broader historical context, U.S. public schools enrolled approximately 11.1 million students in grades 6–8 in fall 2022, according to [NCES](https://nces.ed.gov/programs/digest/d23/tables/dt23_203.10.asp). That population is not a count of customers or evidence of purchase intent.

### How does your app solve it?

Before Study Sprout, our hypothesized customer rereads notes, asks a parent where to start, and maintains a separate checklist or calendar. Afterward, the student pastes notes, chooses a test date and daily budget, and opens a specific study task. Recall questions and confidence reveal what deserves another review; unfinished work can be replanned without exceeding the chosen daily budget. No student account is required, progress stays in the browser, and recommendations explain their reasoning. In a proposed two-week pilot, we will compare three usual-workflow evenings with three app evenings, targeting 30% lower median planning time and 12 of 20 students returning on three distinct study days. Neither target has been achieved or measured.

### How did you build it?

We built the interface with HTML, CSS, and JavaScript, collaborated through GitHub, and published a browser-based adaptation on ChatGPT Sites. The hosted app uses rules to generate study material and saves progress in browser storage. The repository also includes a Node.js server and an optional Oracle Cloud Generative AI adapter; mocked tests do not establish successful live AI operation. Seventeen repository tests passed. We also directly verified short-note plan creation and reload persistence on the published site. The product is a working hackathon prototype, with customer demand, content quality, production readiness, and learning outcomes still to validate.

## Customer discovery status

We used [synthetic interview scenarios](CUSTOMER_DISCOVERY_SIMULATION.md) to challenge our assumptions and prepare real interview questions. **These scenarios are invented, not interviews with customers, testimonials, or validation.** No customer traction or willingness to pay is claimed.

The scenarios suggest testing whether the main obstacle is choosing a task, obtaining usable notes, or understanding the material. If families already start independently, or cannot supply text notes, this initial product may not fit. We will test the existing single-test workflow before adding parent dashboards, garden rewards, or additional AI features.

## Why this could become a repeatable business

The initial buyer hypothesis is a parent paying for less repeated planning help, not for another generic quiz generator. The proposed differentiator is an explained loop from recall and confidence to a time-budgeted next task. The prototype itself is easy to copy. If families return and planning effort falls, test an explicitly priced pilot and recurring exams within the same household, then tutor referrals. Repeat use, actual paid opt-ins, trusted distribution, and independently assessed question quality would strengthen the investment case; none is established today.

## Demand reality and problem severity

Study Sprout is for a grades 6–8 student with notes, an upcoming test, and a short evening study window who needs a parent to help decide where to start. The student uses it; the parent is the intended buyer. We aim to reduce planning effort and repeated parent reminders. Customer interviews and a measured baseline are still pending.

**Before:** the student rereads notes, asks a parent what to study, and creates a checklist or calendar separately. A missed evening or a quiz mistake means deciding what to revisit and rebuilding the schedule. This is a workflow hypothesis, not an observed customer baseline.

**After:** paste one subject's notes, set the test date and daily time budget, open the next study task, and answer a short recall quiz with confidence. A confident mistake becomes a priority review. Preview a revised schedule that fits the available time before applying it.

**Primary pilot KPI: at least 30% lower median planning time versus each family's usual workflow.** For 20 consenting parent–student pairs, measure from opening study materials to choosing the first specific task across three baseline evenings and three app evenings. Report paired changes and first-use failures. Count parent reminders as a secondary measure. This is a proposed threshold, not an achieved result; completed sessions do not prove learning.

## Target customer and market scope

**First user:** a middle-school student preparing for one science test from English-language text notes. **First buyer:** the parent who currently helps that child start studying. Reach families already seeking homework help through permission-based invitations from one tutoring provider or parent community. No recruiting partner is secured. A two-week, 20-family pilot needs no school procurement, LMS integration, or student account. Purchase intent remains unvalidated.

[NCES Digest Table 203.10](https://nces.ed.gov/programs/digest/d23/tables/dt23_203.10.asp) reports fall 2022 U.S. public-school enrollment of **3.643 million in grade 6, 3.685 million in grade 7, and 3.783 million in grade 8: approximately 11.1 million students combined**. These are historical enrollment figures, not current customers, unique paying households, revenue TAM, or proof all these students need the product. The first recruitment goal is 20 families.

## Solution fit and product design

**Smallest wedge: one child, one subject, one upcoming test, one useful next task.** Notes-to-plan, a recall check, and time-budgeted replanning deliver the initial value. The current app has Overview, My study plan, Practice quiz, and My notes, with browser-saved progress and Markdown export.

The garden is the intended motivation layer, not the current demo: plants would grow through completed work, with flowers for successful recall. Plant growth, a timer, parent dashboards, and automatic app blocking are not implemented. First prove students start work and return with less parent intervention. A website cannot itself block other native applications; current blocking requires separately configured device controls.

## Technical execution and demo proof

- [Live app](https://study-sprout-journal.saltyegret15.chatgpt.site/) and [live judge walkthrough](https://study-sprout-journal.saltyegret15.chatgpt.site/demo).
- [Source repository](https://github.com/jonmlevine/study-sprout). Run `npm start` and `npm test` inside `study-sprout/`. See [demo steps](DEMO.md) and [verification evidence](study-sprout/VERIFICATION.md).
- Observed October 25, 2026: **17/17 repository tests and 21/21 published browser-local smoke checks passed**. The live sample-plan, quiz, feedback, and adaptive-preview flow was exercised. Technical check counts are not customer traction or student impact.

The hosted version generates plans and questions in the browser using rules; **it does not make live AI calls**. The repository also contains a Node server and OCI adapter tested with mocks and signature verification. The hosted adaptation differs from that server build. Do not claim identical deployed source or verified OCI inference; confirm the release mapping before deployment.

**Readiness:** the public prototype supports a fictional-data demonstration; it is not a production student service. There are no student accounts, cross-device history, validated question quality, or measured learning outcomes. Production family use needs reliable releases and data recovery, age-appropriate content, parent consent/privacy design, and authentication and per-user quotas before exposing paid inference. No real student data is needed for judging.

## Differentiation and investment readiness

The hypothesis is a parent-paid route to more independent study: **notes → recall and confidence → an explained next task within the child's time budget**, eventually reinforced by garden growth. A garden timer alone is not distinctive: [Forest already offers tree growth and focus tools](https://www.forestapp.cc/). The current prototype is easy to copy; no moat or learning advantage is claimed.

The approximately **11.1 million-student historical population** gives context; the immediate gate is much smaller: can 20 families see less planning effort and return voluntarily? Proposed thresholds are **30% lower median planning time** and **at least 12 of 20 students returning on three distinct study days over two weeks**. These are targets, not traction. The app does not collect shared analytics; use consented pilot logs and track purchase intent separately.

If the single-test wedge works, expand to recurring tests and additional subjects within the same family. Test whether garden rewards improve return use, then test an explicitly priced parent-paid pilot and tutoring-provider referrals. Trusted distribution, validated question quality, and consented outcome evidence could become advantages; those assets do not exist yet.
