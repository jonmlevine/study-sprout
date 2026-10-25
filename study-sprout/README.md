# Study Sprout

A hackathon prototype for grades 6–8 students and their parent buyers: turn notes for one upcoming test into a doable study plan, check recall, and choose what to revisit. Parent demand and student outcomes remain unvalidated. See [the revised submission](../SUBMISSION.md) for the customer, sourced population context, and measurable pilot targets.

Version 1.1 adds confidence-aware review priorities and capacity-aware replanning with previews. **Use the [ChatGPT Site](https://study-sprout-journal.saltyegret15.chatgpt.site/) and its [judge walkthrough](https://study-sprout-journal.saltyegret15.chatgpt.site/demo) for judging.** Read `JUDGING-KIT.md` for the middle-school/parent rubric map and pilot proposal; read `VERIFICATION.md` for observed test results.

## Project references

- [Live Study Sprout app](https://study-sprout-journal.saltyegret15.chatgpt.site/)
- [ChatGPT conversation: Create Study Sprout Website](https://chatgpt.com/c/6ade811e-e10c-83e8-908a-c5311931240e)
- [ChatGPT Sites build brief](../SITES_BUILD_PROMPT.md)

The conversation link may require the originating ChatGPT account. It is a project reference, not a published app URL.

## Optional source reproduction for developers

These instructions run the separate Node implementation for code verification. They are not the hosted demo or judge entry point; use the ChatGPT Site above to evaluate the public app.

Requires Node.js 20.12 or newer. No dependencies, package installation, account, or API key are needed for offline mode.

```sh
npm start
```

Open **http://127.0.0.1:4173**. On Windows, you can also double-click `start.cmd` and open that address. Keep the server running while using the app. If your environment restricts Node's path resolution, run `node --preserve-symlinks --preserve-symlinks-main server.mjs`.

Choose **Try a sample plan**, then **Build my study plan**, to explore with biology notes. Use the same browser and address each time to retain progress.

## What works

- Create multiple study plans using a subject, exam date, daily time budget, and pasted or imported `.txt` notes.
- Organize notes into up to eight topics and schedule whole study sessions before the exam. Daily totals never exceed the selected time budget. Time estimates are heuristics, not predictions of how long mastery takes.
- Read topic summaries and source evidence, practice active recall, and mark sessions complete.
- Practice up to five questions, with explanations after each answer.
- Review missed topics. Topic accuracy uses the latest answer to each question; overall quiz accuracy includes all completed attempts.
- Report confidence before checking an answer. Confident mistakes receive first review priority; uncertain correct answers receive earlier recall suggestions than confident correct answers.
- Rebalance unfinished study work and evidence-based reviews. Preview daily totals before applying; plans that cannot fit before the exam are blocked without dropping work. Replanning may divide a session across days while preserving its total estimated time.
- Save notes, plans, completion status, and finished quizzes in this browser's local storage.
- Switch plans from the plan, practice, or notes screens. Export the active plan, progress, and original notes as Markdown.
- Responsive layouts, keyboard-accessible controls, native modal focus management, and reduced-motion support.

## Offline mode and OCI mode

**Offline mode is rule-based, not an AI model.** It extracts sentences from English-language notes and generates fill-in-the-blank recall questions. Topic headings and blank lines improve extraction. Its distractors are vocabulary from the notes, so they can be less natural than AI-written choices. It is designed to make the entire demo work without a paid service. Very short or vocabulary-poor material may not support a quiz.

**OCI mode** sends the submitted subject and notes from the Node backend to OCI Generative AI. The server requests structured topics and multiple-choice questions, validates the returned schema, and requires source quotations to appear in the submitted notes. This evidence check does not guarantee all model interpretations are correct. Errors are shown to the user; OCI failure never silently switches to offline mode.

To connect your team's OCI tenancy:

1. Copy `.env.example` to `.env` in this application folder.
2. Fill in your region, compartment OCID, tenancy OCID, user OCID, API-key fingerprint, and the absolute path to the API-signing private key. Set the optional key passphrase if needed.
3. Set `OCI_MODEL_ID` to an **on-demand model available in your region that supports the GENERIC chat API**. No model identifier is hardcoded, because access and model availability vary by tenancy and region. Cohere-specific chat payloads, dedicated serving, and instance-principal authentication are not implemented.
4. Restart the server. The setup dialog enables **OCI Generative AI** when all required settings are present. Availability here means configured; the first real request verifies credentials and service access.

The signing key remains on the server. The server serves only explicitly allowed public files. Never place keys in `public/` or commit `.env`.

Implementation references: [Oracle request signing](https://docs.oracle.com/en-us/iaas/Content/API/Concepts/signingrequests.htm), [GenericChatRequest](https://docs.oracle.com/en-us/iaas/tools/typescript/latest/modules/_generativeaiinference_lib_model_generic_chat_request_.genericchatrequest.html), and [GenericChatResponse](https://docs.oracle.com/en-us/iaas/tools/typescript/latest/modules/_generativeaiinference_lib_model_generic_chat_response_.genericchatresponse.html).

## Tests

```sh
npm test
```

The 17 automated tests cover the original study workflow plus confidence priorities, review timing, capacity-aware catch-up planning, completed-work preservation, review deduplication, and impossible deadlines. See `VERIFICATION.md` for the measured result and browser checks.

In the restricted build environment, run:

```sh
node --preserve-symlinks --preserve-symlinks-main --test tests
```

The real OCI API has not been exercised without credentials. The adapter is verified with a mocked service and cryptographic signature verification. Browser checks cover sample-plan creation, session completion, the five-question quiz, answer explanations, results, targeted review, and persistence after refresh.

## Two-minute demo

1. Say: “Study Sprout turns an overwhelming pile of notes into one useful next step.”
2. Load the sample photosynthesis notes and create a plan.
3. Open the first topic, read its summary and evidence, then mark it complete.
4. Take the mixed-topic practice quiz. Deliberately miss a light-dependent reactions question.
5. Show the results and the **Practice missed topics** action. Explain that the next practice session focuses on the student's gaps.
6. Return to the dashboard to show progress and the review recommendation.

## Architecture and deployment

- `public/index.html`, `styles.css`, `app.js`: dependency-free browser application.
- `public/engine.js`: input checks, offline generator, scheduler, quiz selection, and progress calculations.
- `public/adaptive.js` and `adaptive.css`: confidence controls, explainable coaching, and the replan preview.
- `public/demo.html`, `demo.css`, `demo.js`: the published version 3 judge page, synchronized from its source archive; rubric evidence, dated market context, and 21 browser-local smoke checks. These checks do not exercise the Node API or OCI.
- `server.mjs`: static serving and the JSON API.
- `oci.mjs`: server-side OCI signed requests and response validation.
- `Dockerfile`: a portable Node container for a secured OCI compute/container environment.

Local storage belongs to a single browser origin. There is no login, cloud database, cross-device sync, PDF/OCR import, or server-side student history. Closing an unfinished quiz loses that attempt. Saved plans remain until the browser's site data is cleared. Export is a readable Markdown copy, not a restorable backup.

This is a single-user hackathon MVP. The service binds to loopback by default. The Docker image listens on all container interfaces; publish its port to loopback for local use. Before exposing an OCI-enabled deployment publicly, add authentication, per-user quotas, HTTPS, and persistent user-scoped storage. A concurrency limit is present, but it is not a substitute for access control or billing limits.

Example local container run:

```sh
docker build -t study-sprout .
docker run --rm -p 127.0.0.1:4173:4173 study-sprout
```

For an OCI-enabled container, inject the environment variables and mount the private key read-only at the configured container path. Do not bake credentials into the image. A browser-only adaptation is hosted at the ChatGPT Sites URL above and was checked on October 25, 2026. It generates plans in the browser and disables OCI; it is not the same server architecture as this repository. The exact source-to-deployment mapping and an OCI deployment have not been verified. Do not treat local changes as published until the hosted release is updated and checked.

## Product boundaries

This wedge is one child, one subject, one test, and a useful next task. Garden growth, an elapsed-time focus timer, parent dashboards, native-app blocking, and isolated demo records are not implemented. Recorded study time sums estimated durations of self-reported completed sessions. The current workflow is a fictional-data demonstration, not a production student service. Family use needs validated content, reliable releases and recovery, age-appropriate privacy and consent design, and controls before paid inference.
