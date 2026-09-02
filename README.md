<p align="center">
  <img src="./assets/readme/hero.svg" width="100%" alt="Campus Decoder helps international students choose a campus scenario, understand the context, practice their own response, receive structured feedback, and leave with an editable next action.">
</p>

<p align="center">
  <strong>A campus communication coach for the university rules no one teaches.</strong><br>
  Choose a real moment, understand the context, practice your response, receive supportive feedback, and leave ready to act.
</p>

<p align="center">
  <a href="https://campus-decoder.zhoulinhua0.workers.dev"><strong>Try the live demo</strong></a>
  ·
  <a href="#three-journeys-one-learning-loop">Explore the journeys</a>
  ·
  <a href="#run-locally">Run locally</a>
</p>

<p align="center">
  <code>Equity in Education</code>
  <code>Next.js 16</code>
  <code>Cloudflare Workers</code>
  <code>Works without an API key</code>
</p>

> **Current release:** three complete five-stage journeys—**Office Hours**, **Emailing a Professor**, and **Group Project Conflict**—are live on Cloudflare Workers. Production uses Kimi K2.6 behind a provider-neutral server boundary, while the honest Demo fallback keeps every journey usable without an API key.

## Choose a campus moment

Open the **[live scenario chooser](https://campus-decoder.zhoulinhua0.workers.dev/practice)** and pick the campus moment you want to handle differently. No account or setup is required.

| Scenario | What the student practices | Repository status |
| --- | --- | --- |
| **Office Hours** | Discuss feedback, ask focused questions, and identify a next step without sounding confrontational. | Complete |
| **Emailing a Professor** | Revise an overly formal, vague, or apologetic draft into a clear email with an explicit request. | Complete |
| **Group Project Conflict** | Follow up on missed work, propose task division, and handle disagreement constructively. | Complete |

The chooser gives all three complete scenarios the same visual hierarchy.

## Verified baseline

| Proof | Current result |
| --- | --- |
| Complete journeys | Three, each using Setup → Context → Practice → Feedback → Action |
| Provider contracts | Demo and Kimi paths cover all three scenarios with Zod validation, transcript grounding, retries, and safe fallback |
| Automated regression | **53 passing checks**, 20 intentional project-specific skips, 0 failures |
| Funded live evaluation | **9/9 Kimi runs passed**: three complete runs for each scenario |
| Production smoke | Five public pages and all nine API routes returned HTTP 200; every API response remained in live mode with complete English output |
| Responsive coverage | 375px portrait, mobile landscape, 768px tablet, and 1440px desktop |
| Browser engines | Chromium plus desktop WebKit as a Safari-engine approximation |
| Accessibility | Five-stage axe WCAG 2 A/AA scans, skip navigation, keyboard focus, 44px targets, and reduced-motion checks |
| Demo resilience | Deterministic no-key provider plus safe route-level fallback for invalid, timed-out, or unavailable live output |

## Why Campus Decoder exists

English proficiency is not the same as cultural or institutional fluency.

Chinese international students can arrive academically prepared while still lacking access to the university “hidden curriculum”: what Office Hours are for, how to ask a professor for clarification, how direct an email request should be, when to follow up, and how to advocate for themselves without feeling impolite or confrontational.

Campus Decoder treats that gap as an **educational equity problem**, not merely a translation problem. The founder recently completed the university application process and brings direct familiarity with the Chinese international-student experience.

The product loop is:

> **Understand → Practice → Feedback → Act**

The student sees the campus norm, tries their own wording, receives specific feedback grounded in what they submitted, and leaves with an editable artifact instead of generic reassurance.

## Three journeys, one learning loop

Every scenario moves through **Setup → Context → Practice → Feedback → Action**, but each one ends with a different usable result:

- **Office Hours** — decode course feedback, rehearse a conversation with a Practice Professor, review clarity and initiative, then edit a meeting outline.
- **Emailing a Professor** — understand what the email must communicate, revise the draft personally with one focused hint, review grounded excerpts, then edit the subject and final email.
- **Group Project Conflict** — separate observable work from assumptions about motivation, rehearse a teammate conversation, review directness and accountability, then edit a conversation plan, task division, and follow-up message.

In live Kimi mode, the final email is an AI-edited version of the student’s own revision. It must preserve submitted facts, purpose, and placeholders and may not invent dates, policies, permissions, or prior agreements. In Demo mode, the final email remains the student’s revision rather than pretending fixed coaching produced a personalized rewrite.

## What makes it different

- **Cultural context, not mind-reading.** Coaching distinguishes literal source text, likely campus context, uncertainty, and a constructive next move.
- **Practice before prescription.** The student tries their own wording before seeing focused alternatives or an AI-edited final artifact.
- **Grounded feedback.** Quoted comparisons must be verbatim excerpts from the student’s submitted response or revised draft.
- **Cultural awareness without stereotypes.** The product explains common institutional patterns while preserving multiple valid communication styles and the student’s agency.
- **One focused English experience.** The interface, coaching, simulated dialogue, feedback, and action artifacts remain English-only.
- **Action over information.** Every completed session ends with something editable and usable: a meeting outline, professor email, or three-part group-project action kit.

## Honest Demo and optional live AI

| Capability | Demo fallback | Kimi live mode |
| --- | --- | --- |
| Availability | Default; no API key required | Server-side key required |
| Context | Deterministic guidance grounded in submitted setup | Structured guidance validated with Zod |
| Office Hours Practice | Clearly labeled guided professor path | Dynamic context-aware professor dialogue |
| Email Practice | Fixed-rule hint that leaves the writing to the student | One structured, focused revision hint |
| Group Project Practice | Clearly labeled guided teammate path | Dynamic context-aware teammate dialogue |
| Feedback | Representative ratings and coaching; quotes remain grounded | Structured coaching with verbatim excerpt validation |
| Action | Student-grounded editable artifacts | Live meeting outline, edited email, or group-project action kit |
| Failure behavior | Remains usable | Falls back safely and visibly to Demo |

Demo output never claims that fixed ratings or coaching are personalized AI analysis.

## How it works

```mermaid
flowchart LR
    S["Scenario chooser"] --> O["Office Hours UI"]
    S --> E["Emailing a Professor UI"]
    S --> G["Group Project Conflict UI"]
    O --> OA["/api/context · /api/practice · /api/feedback"]
    E --> EA["/api/email/context · /api/email/hint · /api/email/feedback"]
    G --> GA["/api/group/context · /api/group/practice · /api/group/feedback"]
    OA --> P{"Configured provider"}
    EA --> P
    GA --> P
    P -- "Kimi + server key" --> K["Validated live output"]
    P -- "Default or failure" --> D["Honest deterministic Demo"]
    K --> A["Editable next-action artifact"]
    D --> A
```

| Layer | Implementation |
| --- | --- |
| Application | Next.js 16 App Router, React 19, TypeScript |
| Interface | Tailwind CSS 4 with the project’s off-white, deep-teal, and warm-amber system |
| AI boundary | `DemoProvider` and optional `KimiProvider` behind one server-side contract |
| Validation | Zod request and structured-output contracts for all three journeys |
| Voice | English browser speech recognition in Office Hours; typed input always remains available |
| Testing | Playwright plus axe-core across mobile, tablet, desktop Chromium, and desktop WebKit projects |
| Hosting | OpenNext, Wrangler, and Cloudflare Workers |
| Persistence | None by design for the MVP; session state is ephemeral |

## Run locally

Requirements: **Node.js 20 or newer**.

```bash
npm install
npm run dev
```

Open **[http://localhost:3000/practice](http://localhost:3000/practice)**. All three complete journeys work through the deterministic Demo provider without an external AI service or API key.

## Optional Kimi live mode

The app exposes one internal provider contract with two implementations:

```text
DemoProvider   # Default, deterministic, no external service
KimiProvider   # Optional live context, practice, and feedback
```

Kimi uses its OpenAI-compatible Chat Completions API. Structured output is requested with JSON Schema and validated again with Zod before the UI receives it.

Configure these **server-only** values in `.env.local`:

```dotenv
AI_PROVIDER=kimi
MOONSHOT_API_KEY=your_server_side_key
KIMI_CONTEXT_MODEL=kimi-k2.6
KIMI_PRACTICE_MODEL=kimi-k2.6
KIMI_FEEDBACK_MODEL=kimi-k2.6
```

Restart `npm run dev` after changing environment variables. `KIMI_MODEL` remains available as an optional global override. Never expose the API key through a `NEXT_PUBLIC_*` variable.

The provider-neutral route contracts are:

- `POST /api/context` — grounded Office Hours campus guidance.
- `POST /api/practice` — Office Hours opening or next professor turn.
- `POST /api/feedback` — Office Hours report and meeting outline.
- `POST /api/email/context` — grounded professor-email context guidance.
- `POST /api/email/hint` — one focused hint without a complete replacement draft.
- `POST /api/email/feedback` — grounded email feedback and an editable final email.
- `POST /api/group/context` — task-division, follow-up, disagreement, and uncertainty guidance.
- `POST /api/group/practice` — Group Project opening or next teammate turn.
- `POST /api/group/feedback` — grounded collaboration feedback and three editable action artifacts.

Context and Feedback allow up to 45 seconds per request; Practice and Hint use a 20-second timeout. Structured, empty, truncated, schema-invalid, ungrounded, or non-English-script output is retried where appropriate and then falls back safely. Verbatim student-source and transcript fields are preserved rather than treated as generated coaching. Privacy-safe telemetry records operation, model, reason, safe schema paths, and elapsed time without student inputs, transcripts, drafts, credentials, or raw errors.

## Verify changes

```bash
npm run lint
npm run build
AI_PROVIDER=demo npm run test:e2e
npm run test:kimi # opt-in funded live evaluation; never runs in CI
```

Install Playwright browsers once if needed:

```bash
npx playwright install chromium webkit
```

The current suite reports **53 passing checks** across five Playwright projects, with 20 intentional project-specific skips. Coverage includes:

- neutral homepage entry points and three equal-size scenario cards;
- complete Office Hours, Emailing a Professor, and Group Project Conflict journeys;
- required-field and unchanged-draft validation;
- grounded Context, Feedback, email excerpts, and group-conversation excerpts;
- Demo/Kimi provider selection, JSON Schema requests, retries, and fallback behavior;
- browser speech mocks, microphone denial, missing-device, restart, and dictation limits;
- 375px portrait, mobile landscape, tablet, and desktop overflow and target-size checks;
- keyboard focus, skip navigation, five-stage axe scans, reduced motion, and long unbroken content;
- desktop WebKit layout coverage as an automated Safari-engine approximation.

## Deploy to Cloudflare Workers

Current production demo: **[campus-decoder.zhoulinhua0.workers.dev](https://campus-decoder.zhoulinhua0.workers.dev)**

The production Worker contains all three complete journeys. Post-deployment smoke checks returned HTTP 200 for the homepage, scenario chooser, and all three journey pages. All nine API routes returned `mode: live`, complete English output, and the expected structured fields without using Demo fallback.

```bash
npm run preview:cloudflare
npm run deploy:cloudflare
```

The manual workflow at `.github/workflows/deploy-cloudflare.yml` uses the repository secrets `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`. Add `MOONSHOT_API_KEY` as a Cloudflare Worker secret and set `AI_PROVIDER=kimi` as a runtime variable. GitHub Pages is not supported because the product requires server-side Route Handlers.

## Project map

```text
app/
  api/
    context/route.ts              # Office Hours grounded context
    practice/route.ts             # Office Hours professor turns
    feedback/route.ts             # Office Hours feedback and action plan
    email/
      context/route.ts            # Email campus-context guidance
      hint/route.ts               # Focused draft hint
      feedback/route.ts           # Email feedback and final editable draft
    group/
      context/route.ts            # Group coordination context
      practice/route.ts           # Teammate conversation turns
      feedback/route.ts           # Collaboration feedback and action kit
  practice/
    page.tsx                      # Neutral three-scenario chooser
    office-hours/                 # Complete five-stage Office Hours journey
    email-professor/              # Complete five-stage email journey
    group-project/                # Complete five-stage Group Project journey
components/practice/              # Shared and journey-specific stage interfaces
lib/ai/
  providers.ts                    # Demo/Kimi contract and fallback
  prompts.ts                      # Office Hours prompts
  email-prompts.ts                # Email Context, Hint, and Feedback prompts
  group-prompts.ts                # Group Context, Practice, and Feedback prompts
  schemas.ts                      # Office Hours validation
  email-schemas.ts                # Email validation
  group-schemas.ts                # Group validation
  mock.ts                         # Office Hours deterministic Demo output
  email-mock.ts                   # Email deterministic Demo output
  group-mock.ts                   # Group deterministic Demo output
tests/e2e/
  scenario-selection.spec.ts      # Neutral entry and equal card hierarchy
  office-hours.spec.ts            # Office Hours journey and speech behavior
  email-professor.spec.ts         # Complete email journey
  group-project.spec.ts           # Complete group-project journey
  providers.spec.ts               # Contracts, grounding, retry, fallback
  qa.spec.ts                      # Responsive and accessibility QA
types/
  practice.ts                     # Office Hours contracts
  email-practice.ts               # Email contracts
  group-practice.ts               # Group-project contracts
```

## Current limits

- The funded live-Kimi suite covers all three journeys with three repeated runs each; the sample remains intentionally small, so production retry/fallback frequency and latency still need monitoring.
- Voice input is available only in Office Hours and depends on browser speech-recognition support, microphone permission, and the browser’s speech service. Typed input remains universal.
- Desktop WebKit automation approximates Safari’s engine; real Safari permissions, speech services, and microphone hardware still require hands-on verification.
- The MVP has no authentication, database, saved history, analytics, or progress tracking.
- Guidance is educational and does not replace official university policy or qualified legal, immigration, medical, or mental-health advice.

## Next priorities

1. Run hands-on live-Kimi QA for all three journeys on the actual demo devices.
2. Test English dictation, permission denial, restart behavior, and long speech in real Chrome and Safari.
3. Validate the complete learning loop with Chinese and other international students new to U.S. university culture.
4. Monitor production latency, retry reasons, and fallback frequency; one funded Group Feedback run reached 40.2 seconds against the 45-second timeout.
5. Capture 3–5 production screenshots, record the under-five-minute demo video, and complete the Devpost submission package.

## Safety

Campus Decoder provides educational practice, not official university, immigration, legal, medical, or mental-health advice. Users should verify policy-sensitive guidance with the relevant institution or a qualified professional. The product never sends a real-world message without explicit review.

## License

Campus Decoder is available under the [MIT License](./LICENSE).
