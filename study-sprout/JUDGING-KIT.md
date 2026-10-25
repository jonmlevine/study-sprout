# Study Sprout — judging kit

## Positioning

**For grades 6–8 students who need help starting test preparation, Study Sprout turns their notes and recall evidence into a doable next study task. The student uses it; the parent is the intended buyer.**

The single-test workflow is the wedge. Garden motivation is a future layer, not a current demo feature. Parent demand, willingness to pay, and learning effects remain unvalidated.

Use [the revised submission](../SUBMISSION.md) for rubric-ready copy and [the walkthrough](../DEMO.md) for the demo. The [public app](https://study-sprout-journal.saltyegret15.chatgpt.site/) and [public judge page](https://study-sprout-journal.saltyegret15.chatgpt.site/demo) are judge entry points. Loopback links work only while running the Node server locally.

## Response to the judge

| Criterion | Concrete response | Evidence boundary |
|---|---|---|
| Demand / 25% | Before: parent helps choose work and rebuild a schedule. After: notes → task → recall → revised plan. Pilot target: at least 30% lower median planning time. | Workflow and impact are hypotheses. Measure three baseline and three app evenings per family; no reduction achieved yet. |
| Customer / 20% | User: middle-school student. Buyer: parent. Recruit 20 families through one tutoring provider or parent community. Historical U.S. public-school grades 6–8 population: about 11.1 million. | No partner, paid household, conversion, or current market measurement is claimed. |
| Solution / 20% | One child, one subject, one test. Start a specific next task and review mistakes within a daily budget. | Garden, timer, parent dashboard, and native-app blocking are not built. |
| Technical / 20% | Public app and walkthrough; 17 repository tests and 21 live browser-local checks passed October 25, 2026. | Hosted app uses browser rules. Repository has a separate Node/OCI path. Mock OCI tests do not prove live inference. |
| Differentiation / 15% | Explained recall/confidence-to-plan loop. Return-use target: 12 of 20 students on three distinct days over two weeks. | Targets are not traction. Validate parent purchase intent and repeated use before expanding. |

## Market calculation

[NCES Digest 2023, Table 203.10](https://nces.ed.gov/programs/digest/d23/tables/dt23_203.10.asp), fall 2022 row, values in thousands: grade 6 = 3,643; grade 7 = 3,685; grade 8 = 3,783. Sum = **11,111 thousand, approximately 11.1 million students**. The table was prepared December 2023; figures cover public schools in the 50 states and DC. This is historical population context, not a current estimate, household count, product-demand measure, or revenue TAM.

## Pilot and expansion gates

1. Interview 10 parents and their children with parent permission. Reconstruct the last study evening before showing the app: planning time, reminders, materials, interruptions. Record anonymous notes with permission, including evidence against the hypothesis.
2. Seek one tutoring provider or parent community to invite 20 parent–student pairs. No partner is secured; no school procurement or school-system access is required.
3. Record three usual-workflow evenings and three app evenings per family. Primary target: at least 30% lower median planning time, from opening materials to choosing a specific first task. Report paired differences and first-use failures. Also count parent reminders.
4. During two weeks, look for at least 12 of 20 students returning on three distinct study days. This is a decision threshold, not a forecast. The MVP has no shared analytics; use consented research logs.
5. Compare delayed recall using educator-written unseen questions with comparable topics/time. Do not infer better grades from repeating generated questions.
6. After repeat use, test parent purchase intent with a clearly priced paid pilot; distinguish actual opt-ins from stated interest. Expand to recurring tests and subjects within the family, then test garden motivation and tutoring referrals.

## Honest answers

**Is it live?** The hosted app and walkthrough opened and their core flow was checked. The hosted browser adaptation differs from the Node/OCI build; source-to-release mapping is unverified. Check independent visitor access before submission.

**Is it AI?** Hosted generation is rule-based. The repository OCI adapter has mock and signature checks; no successful real OCI call is evidenced.

**What is production-ready?** No production-readiness claim is made. The offline workflow supports a fictional-data demo. Family use needs reliable releases and recovery, validated content, age-appropriate privacy/consent design, and access controls/quotas before paid inference.

**Does it improve grades?** Unmeasured. Planning effort, parent reminders, return use, and delayed recall are proposed measures.

**Why not a garden focus app?** [Forest](https://www.forestapp.cc/) already offers tree growth and focus tools. The proposed value is helping a child choose what to study and revisit, with less parent prompting. Garden motivation is not a moat.

**What is the ask?** One parent-community or tutoring pilot partner, 20 families, and an educator to assess age-appropriate question quality. No existing traction is claimed.
