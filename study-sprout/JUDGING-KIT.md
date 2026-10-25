# Study Sprout — judging kit

**Version 1.3:** See `HACKATHON-UPGRADE.md` for the latest Learning lab demo, recovery simulator and participant-evidence workflow. The older quiz-first demo below remains available.

## Positioning

**For first-year college STEM students with an exam approaching and limited daily time, Study Sprout turns their own notes and quiz evidence into the next useful study session.**

The initial user and campus channel are product hypotheses, not validated customers. The local application is working. Live OCI inference, public hosting, and student outcomes remain unverified.

Open `http://127.0.0.1:4173/demo` for the complete judge-facing walkthrough. The student app is at `http://127.0.0.1:4173`; sample setup is at `http://127.0.0.1:4173/?demo=1`. These URLs work only on the computer running the server.

## Mapping to the photographed rubric

| Category / weight | Criteria addressed | Reviewable proof | Remaining external proof |
|---|---|---|---|
| Demand Reality & Problem Severity / 25% | Specific pain; target user; current workflow; potential impact | Seven-day exam scenario, notes-to-recall-to-plan workflow, research sources, explicit impact hypotheses, anonymous pilot observation console | Interviews must establish frequency, severity, and what students actually do today. No customer interviews are claimed. |
| Target Customer & Market Scope / 20% | Clear user; broader relevance; creative AI use; differentiation; reason to use | Narrow initial audience, evidence of student AI adoption, confidence-aware coaching, campus distribution hypothesis, capacity-constrained scheduling | Validate the target segment and campus buyer. A market-size estimate or buyer commitment has not been established. |
| Solution Fit & Product Design / 20% | Better workflow; before/after; intuitive key action; clean interface | Guided setup, source evidence, confidence input, source-backed explain-back self-checks, topic evidence map, recovery simulation with days off, visible recommendations, replan preview, daily totals, persistence, responsive UI | Observe uncoached students using the app. Better learning or reduced planning effort remains a hypothesis. |
| Technical Execution & Demo Proof / 20% | Working software; URL; login/verification steps; AI use; architecture; performance | Local URL, no local login, sample notes, 32 automated tests, 23 browser-run smoke assertions, downloadable verification report, architecture on `/demo`, OCI adapter and Dockerfile | Public HTTPS URL and live OCI quality/latency/cost need team credentials and deployment. Offline operation is explicitly labeled rule-based. |
| Differentiation & Investment Readiness / 15% | Meaningful difference; alternatives; defensibility; next-version proof | Confidence → review → capacity-aware plan loop; honest competitor comparison; business hypothesis; proposed pilot; clearly stated limitations | No moat, traction, revenue, willingness-to-pay evidence, or outcome advantage is claimed. These must be earned through research and operation. |

Weights total 100%. This table is an evidence map, not a prediction of the judges' score.

## Three-minute pitch and demonstration

**0:00–0:25 — The problem**

“Imagine an exam in seven days and only 30 minutes to study each day. Your notes tell you what the course covered, but not what you should work on next. Study Sprout connects your source material, recall, confidence, and available time into one actionable plan.”

**0:25–0:55 — The first step**

Open the sample setup. Explain the notes, deadline, and daily budget. Generate the plan. Open a topic, show its source, and mark a session complete. State that this run uses the offline generator unless OCI has actually been connected.

**0:55–1:55 — The distinctive moment**

Open a topic and select “Practice this topic” for a shorter demo. Deliberately miss one question and mark “Very sure.” Finish the topic quiz. Show how confidence distinguishes a possible misconception from an uncertain correct answer.

**1:55–2:30 — Close the loop**

Select “Preview my adapted plan.” Point out the priority review, the reasons, and the daily totals. Briefly lower the budget to show that the app blocks a plan when work cannot fit. Restore a sufficient budget and apply. Refresh to prove the plan persists.

**2:30–3:00 — Technical proof and next step**

“This local MVP is working; the backend has an OCI adapter, with real cloud validation still pending. We can run local verification here. Our next step is a two-week pilot with 20 students and one learning-support partner to test planning time, repeat use, and delayed recall.”

## Evidence and appropriate claims

- [HEPI / Kortext Student Generative AI Survey 2026](https://www.hepi.ac.uk/wp-content/uploads/2026/03/HEPI-Report-199-Gen-AI-Survey-2026.pdf), pp. 4, 9–10: 1,054 full-time UK undergraduates, surveyed in December 2025; 95% reported using AI in at least one way. This is category context. It does not establish demand for this product or generalize automatically to every country or student group.
- [APS summary of the Dunlosky et al. learning-techniques review](https://www.psychologicalscience.org/observer/which-study-strategies-make-the-grade-2): practice testing and distributed practice received high utility ratings. This supports the design rationale, not the effectiveness of our specific confidence rules or fixed review intervals.
- [Quizlet Study Guide Maker](https://quizlet.com/features/study-guides/): existing tools already generate study material from notes. Our comparison focuses on the experience we intend to test. Do not claim that AI quizzes are novel or that competitors cannot adapt.

## What the next version should prove

Pilot proposal, not a completed study:

1. Interview 10 students before showing the product. Ask them to reconstruct their most recent exam-preparation session: how they selected topics, how long planning took, when a plan stopped being useful, and what they used instead. Record anonymous notes with permission. Do not prompt them toward the desired pain.
2. Recruit 20 consenting adult student volunteers through one program, using materials they are allowed to share. Observe an uncoached first-use session. Target a median under two minutes to the first useful study action; record failures as well as successes.
3. Over two weeks, measure whether at least 12 of 20 return on three distinct study days. This is a proposed decision threshold, not a forecast. The current MVP does not collect shared analytics; use a consented research process or build opt-in event logging.
4. With an educator, create unseen recall questions and a controlled 48-hour comparison against the usual study approach. Balance topics and time, and avoid claims from repeated practice questions. Treat a small pilot as exploratory, not proof of higher grades.
5. Interview five tutoring-program leads about adoption, procurement, privacy, and willingness to pay. No price or market-size claim should be presented as validated.
6. Measure real OCI response quality, failures, token usage, cost per plan, and p50/p95 latency after access is available. Add authentication, quotas, and HTTPS before exposing paid inference publicly.

## Honest answers to likely judge questions

**“Is this using AI right now?”** In offline mode, no: topics and questions are extracted by rules. The OCI adapter is implemented and tested with mocks and signature verification. Only a successful real OCI request supports claiming live cloud AI.

**“Does it improve grades?”** We have not measured that. We demonstrate a workflow and propose a delayed-recall pilot.

**“What makes it hard to copy?”** The prototype is easy to copy. Outcome data collected with consent, validated question quality, and trusted institutional distribution are possible future advantages, not current assets.

**“Why not Quizlet?”** Existing study tools already solve substantial parts of the problem. We are testing whether a transparent confidence-aware schedule is easier to act on for students with a strict daily budget.

**“Can I open it on my phone?”** The layout is responsive. The current loopback URL is reachable only on the host computer; a public HTTPS deployment is still required for independent judge access.

**“What are you asking for?”** One pilot partner, 20 volunteers, and OCI sandbox access to validate quality, usefulness, and cost.
