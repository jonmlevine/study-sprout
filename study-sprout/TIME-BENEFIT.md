# Time benefit

Open **Time benefit** from the navigation, or visit `http://127.0.0.1:4173/#benefit`. Create or select a study plan first.

## The measured task

Choose one topic to study next, describe the action you will take, and assign a number of study minutes within your daily budget.

Each comparison has two rounds using the same notes, deadline, and time budget:

- **Manual planning:** choose using your source notes, without the generated recommendation on this screen.
- **With Study Sprout:** choose using a snapshot of the existing plan's recommendation and topic summary. You may accept the suggestion or enter your own decision.

The suggested starting method alternates between completed comparisons. This helps expose order effects but is not a randomized controlled study.

## How to use it

1. Select which method goes first and choose **Start a new comparison**.
2. Select **Start timer & reveal material**. The clock measures reading, deciding, and entering your decision.
3. Enter a topic, study action, and planned study minutes. Choose **Finish this round**.
4. Start and complete the other method, then choose **Finish & compare**.
5. View both times, the signed difference, the percentage change, and your saved decisions. Use **Download results** to export a JSON report.

The planned study minutes you enter are not used as elapsed time. The stopwatch measures actual active time with the browser's monotonic performance clock.

## Pausing and recovery

Pause manually whenever you need a break. The material is hidden while paused. Leaving the screen or hiding the tab also pauses the timer. Time spent paused is excluded, and the pause count is included in the result.

Saved paused rounds can be resumed. If a running timer cannot be recovered reliably after an interruption, the app requires restarting that round rather than inventing its duration. A completed first round is retained.

Completed comparisons and drafts are stored locally in this browser, under a separate key from study plans. Measurements are grouped by the exact plan ID, notes, subject, exam date, and daily time budget. Changing those inputs starts a different comparison group. Nothing is uploaded as analytics.

## Calculations

For each completed pair:

```text
Time difference = manual active time − Study Sprout active time
Percentage change = time difference ÷ manual active time × 100
```

A negative value means the assisted attempt took longer; the app reports that result rather than clamping it to zero. Across repeated attempts, the screen shows median manual time, median assisted time, the median of paired differences, and the median of paired percentage changes. The median paired difference is not necessarily equal to the difference between the two separate medians.

## Interpretation

This measures the time to select a next action **from an existing study plan**. It excludes initial note entry, initial plan generation, actual study duration, and learning outcomes. The manual round is an in-app proxy for independent planning, not a recording of the user's usual workflow in other tools.

Both rounds reuse the same material, so familiarity, order, and timing behavior can affect the result. Decisions are self-reported and are not graded for equal quality. A short time alone does not establish a better decision. Results are personal observations, not proof of improved grades, causal time savings, or typical user performance.

The downloadable report includes the metric definition, these limitations, the method order, both decisions, pause counts, raw elapsed milliseconds, and paired summaries. It excludes the original source notes.

For the proposed student pilot, use a separate observed first-use protocol to measure the complete journey from raw notes to a useful next action. This feature intentionally measures a narrower recurring decision task.
