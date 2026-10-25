# Study Sprout judge walkthrough

## Open and verify

- [Published app](https://study-sprout-journal.saltyegret15.chatgpt.site/)
- [Published walkthrough and checks](https://study-sprout-journal.saltyegret15.chatgpt.site/demo)
- [Source and local instructions](study-sprout/README.md)
- [Revised submission](SUBMISSION.md)

No student account is needed for the demonstrated workflow. Use fictional notes and a separate browser profile for an empty workspace: sample plans currently share regular browser storage. A new tab does not isolate storage. Do not clear someone else's progress.

## Three-minute demo

1. Describe a middle-school student with a test next week who needs a parent to help choose what to study. State that this workflow is a hypothesis, not a customer interview.
2. From an empty workspace, choose **Try a fictional sample plan** on the hosted app (**Try a sample plan** locally). With existing plans, choose **New study plan**, then **Use fictional sample notes** (**Use sample notes** locally).
3. Set a test date seven days away and a 30-minute daily budget. Build the plan. Open **Take my next step**, show source evidence, then **Mark session complete**. This is self-reported work, not measured study time.
4. Choose **Practice now**. Select an answer and confidence; checking requires both. Deliberately miss a question with **Very sure** confidence, show feedback, complete all five questions, then **See my results** to save the attempt.
5. Choose **Preview my adapted plan**. Show the confident-mistake review and daily totals. Select 10 minutes to demonstrate that over-capacity work blocks Apply; restore 30 minutes and apply.
6. Refresh and show saved sessions and quiz history. The transient results screen need not survive; saved history must. Open `/demo` and run its checks. Explain that this hosted demo uses browser-local rules, not OCI AI.

## Impact and limitations

The proposed pilot is 20 parent–student pairs: target at least 30% lower median planning time versus their usual workflow, and 12 of 20 returning on three distinct study days in two weeks. These are thresholds, not results. See `SUBMISSION.md` for measurement design and the sourced historical population of approximately 11.1 million U.S. public-school students in grades 6–8.

The hosted browser adaptation differs from the repository Node build; the source-to-release mapping is unverified. OCI is disabled on the hosted version. Garden growth, a timer, automatic app blocking, demo-data isolation, and a parent dashboard are not built. See `study-sprout/VERIFICATION.md` for observed checks and release work.
