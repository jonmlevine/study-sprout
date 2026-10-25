# Study Sprout 1.3 — a demo built around evidence

The strongest story is now **notes → recall → explain → identify a gap → recover the plan → measure what happened**. Show one student and one difficult moment, rather than a tour of every screen.

## What is new

| Feature | What the user can do | Rubric contribution |
|---|---|---|
| Topic evidence map | See question coverage, confident mistakes, and self-identified explanation gaps with a reason for each priority | Solution fit; intuitive next action; differentiation |
| Explain-back studio | Write an explanation from memory, reveal exact source excerpts, assess each point, and feed gaps into review scheduling | Meaningful workflow; source transparency; more depth than summaries alone |
| Exam recovery simulator | Change daily minutes and the exam date, mark days off, inspect overflow, and apply only a feasible schedule | Real everyday frustration; technical execution; clear before/after |
| Learning progress | Compare first and latest answers on the same questions; inspect repeated recall with a 48-hour gap; export evidence | Measurable behavior; technical proof; next-version learning hypothesis |
| Pilot evidence console | Record anonymous interviews with permission; separate rehearsals; summarize latest feedback per participant; export records | Problem severity (25%); customer and market (20%); investment readiness |

## Three-minute demo

Prepare a sample plan before presenting. Keep test data and real participant observations distinct. Demo interactions are illustrative, not student outcome evidence.

1. **0:00–0:25 — The student and pain.** “An exam is a week away. I have notes and a limited amount of time. The hard question is what deserves my next session.” Show the plan and actual generation mode.
2. **0:25–1:15 — The learning loop.** Open Learning lab → Explain it back. Write a short explanation, reveal the source points, and mark one point missing. Save. Show the new explanation-gap priority and its reason. Explain that this is the learner’s source-based self-check, not an AI correctness grade.
3. **1:15–2:00 — The recovery moment.** Open Exam recovery. Mark a day off. Lower the daily budget to expose work that will not fit. Increase it until feasible, inspect the sessions, and apply. Refresh to show that the plan and explanation persist.
4. **2:00–2:30 — Measurable value.** Show Learning progress and Time benefit. Use actual saved measurements or explain the empty state. Do not substitute automated QA timing for user time savings. Repeated-question progress is not a causal learning result.
5. **2:30–3:00 — Demand and technical proof.** Open `/demo#pilot` and show real interviews only if collected. Show live verification and current OCI status. Finish with the next test: a small student pilot with a controlled delayed-recall protocol.

## Ask these questions before showing the product

- “Tell me about the last time you decided what to study before an exam.”
- “What did you do, how long did it take, and where did you get stuck?”
- “How often does that happen? How painful is it, from one to five?”

Then ask the student to find a gap and recover their schedule without coaching. Record observed difficulties as well as successes. Ask whether they would return, but do not equate their answer with actual repeat use. Use anonymous participant codes, obtain permission, and omit names or contact details.

## What remains outside this local build

- Real OCI credentials and model access are still needed to demonstrate cloud inference. The existing signed server adapter is included. Explain-back assessment, prioritization, capacity checks and measurement are deterministic application logic in both modes.
- A public HTTPS URL remains a deployment task. Localhost works on the running computer only. Follow the deployment guidance in `README.md` before exposing paid AI generation.
- Customer demand, learning outcomes, willingness to pay and defensibility require real external evidence. The console records observations; it does not authenticate them or establish market demand.
- Learning progress compares repeated questions. A future controlled study should use unseen, validated questions, a comparison group and appropriate consent.

No feature guarantees a ranking. The upgrade gives the team a more concrete demonstration and tools to collect the evidence the rubric asks for.

## Implementation and data

The app retains existing plans and quiz history. Explain-back drafts (one per topic), completed self-checks, recovery settings and plan adaptations are stored with each plan in browser localStorage. Pilot records use a separate storage key. There is no account or cross-device synchronization.

`lab-model.js` contains source filtering, reflection validation, matched-question metrics, recovery scenarios and pilot aggregation. `lab.js` renders the learning workflow. `engine.js` combines quiz and self-check priorities and respects unavailable dates. `pilot.js` renders the team’s interview console. New browser files are explicitly allowlisted by the Node server.

Learning evidence exports include explanations and source excerpts; pilot exports include anonymous interview observations. Downloading these files does not send them to a cloud service.
