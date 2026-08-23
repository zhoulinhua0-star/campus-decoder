<p align="center">
  <img src="./assets/readme/hero.svg" width="100%" alt="Campus Decoder helps international students understand unfamiliar university norms, practice an Office Hours conversation, receive structured feedback, and leave with an action plan.">
</p>

<p align="center">
  <strong>A campus communication coach for the university rules no one teaches.</strong><br>
  Understand the context, practice the conversation, receive supportive feedback, and leave ready to act.
</p>

<p align="center">
  <a href="https://campus-decoder.zhoulinhua0.workers.dev"><strong>Try the live Office Hours journey →</strong></a>
</p>

<p align="center">
  <code>Equity in Education</code>
  <code>Next.js 16</code>
  <code>Cloudflare Workers</code>
  <code>Works without an API key</code>
</p>

> **Live now:** one complete Office Hours journey, including personal or sample setup, campus-context coaching, typed or bilingual voice input, structured feedback, and an editable meeting outline. Production intentionally uses the clearly labeled deterministic Demo provider. The Kimi adapter is implemented but is not funded, configured, or enabled.

## Try the product

Open **[Campus Decoder](https://campus-decoder.zhoulinhua0.workers.dev)**, choose **Practice Office Hours**, and complete one conversation:

1. Choose **Use my situation** for an empty form or **Try the sample** for the judge demo.
2. Add the course, what happened, your concern, and what you want from the meeting.
3. Review a grounded decode of the literal source, likely campus context, uncertainty, and one constructive next move.
4. Reply in English by typing or speaking. Press `Enter` to send and `Shift` + `Enter` for a new line.
5. If you dictate in Mandarin, review the transcript and use the explicit **Convert to natural English** step before sending.
6. Finish with transcript-grounded feedback and an editable meeting outline.

The professor is presented honestly as **Practice Professor**, paired with the course the student entered. The opening turn is requested with the full situation context, while avoiding claims that the student has already shared private concerns aloud.

## Why Campus Decoder exists

English proficiency is not the same as cultural or institutional fluency.

Chinese international students can arrive academically prepared while still lacking access to the university “hidden curriculum”: what Office Hours are for, how to ask a professor for clarification, when to follow up, and how to advocate for themselves without feeling impolite or confrontational.

Campus Decoder treats that gap as an **educational equity problem**, not merely a translation problem. The product loop is:

> **Understand → Practice → Feedback → Act**

The focused MVP follows a newly arrived student who receives disappointing or unclear feedback and is unsure how to approach Office Hours. Instead of supplying a perfect script immediately, Campus Decoder explains the norm, lets the student rehearse their own words, and turns the session into a concrete next action.

## One journey, five stages

| Stage | Student outcome |
| --- | --- |
| **1 · Setup** | Describe a genuine situation or load the clearly separated sample. |
| **2 · Context** | Decode the submitted situation into literal source, campus context, uncertainty, and one constructive next move. |
| **3 · Practice** | Write or dictate responses to a simulated professor in natural English. |
| **4 · Feedback** | Review clarity, tone, specificity, initiative, campus fit, and two high-value improvements. |
| **5 · Action** | Edit and copy a meeting outline for the real conversation. |

## What makes it different

- **Cultural context, not mind-reading.** Coaching distinguishes literal source text, likely campus context, uncertainty, and a constructive next move.
- **Practice before prescription.** The student writes their own response before seeing an editable alternative.
- **Grounded feedback.** Demo comparisons quote only language the student actually submitted.
- **A neutral practice identity.** The role-play no longer invents “Professor Chen” or assumes every situation concerns an essay.
- **Bilingual input with an English conversation goal.** Students can dictate in English or Mandarin, but Chinese text must pass through a visible review-and-convert step before it reaches the simulated English-speaking professor.
- **Action over information.** Every completed session ends with a usable meeting outline rather than generic reassurance.

## Honest Demo and optional live AI

| Capability | Production Demo | Kimi live mode |
| --- | --- | --- |
| Availability | Default; no API key required | Optional; server-side key required |
| Context decode | Deterministic guidance grounded in the submitted setup | Structured bilingual decode validated with Zod |
| Opening turn | Neutral, deterministic opening | Context-aware opening generated from the setup |
| Follow-up turns | Clearly labeled guided sample path | Dynamic English professor dialogue |
| Feedback | Representative coaching grounded in submitted text | Structured bilingual coaching validated with Zod |
| Mandarin dictation | Browser speech recognition | Browser speech recognition |
| Natural-English conversion | Unavailable without fabrication; Chinese draft is preserved | Meaning-preserving English rewrite |
| Failure behavior | Remains usable | Falls back safely to Demo for context, practice, and feedback |

Demo ratings never pretend to be personalized AI analysis. Demo mode also refuses to fabricate an English conversion: `/api/translate` returns a safe unavailable response and keeps the original Chinese draft editable.

## How it works

```mermaid
flowchart LR
    A["Student context"] --> B["Five-stage Office Hours UI"]
    V["Browser speech recognition\nEnglish or Mandarin"] --> B
    B --> C["POST /api/context"]
    B --> P["POST /api/practice"]
    B --> F["POST /api/feedback"]
    B --> T["POST /api/translate"]
    C --> S
    P --> S{"Configured provider"}
    F --> S
    T --> S
    S -- "Kimi + server key" --> K["Validated live output"]
    S -- "Default or failure" --> D["Honest deterministic Demo"]
    K --> O["Context · Practice · Feedback · Action"]
    D --> O
```

| Layer | Implementation |
| --- | --- |
| Application | Next.js 16 App Router, React 19, TypeScript |
| Interface | Tailwind CSS 4 with the project’s off-white, deep-teal, and warm-amber system |
| AI boundary | `DemoProvider` and optional `KimiProvider` behind one server-side contract |
| Validation | Zod request, context, translation, and structured-feedback schemas |
| Voice | Browser Web Speech API with explicit `en-US` / `zh-CN` switching |
| Testing | Playwright; 17 mobile Chromium journey, route, and provider tests |
| Hosting | OpenNext, Wrangler, and Cloudflare Workers |
| Persistence | None by design for the MVP; session state is ephemeral |

## Run locally

Requirements: **Node.js 20 or newer**.

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The complete deterministic journey works without an external AI service or API key.

## Optional Kimi live mode

The app exposes one internal provider contract with two implementations:

```text
DemoProvider   # Default, deterministic, no external service
KimiProvider   # Optional live dialogue, feedback, and English conversion
```

Kimi uses its OpenAI-compatible Chat Completions API. Structured feedback is requested with JSON Schema and validated again with the existing Zod contract.

After funding and evaluating a Kimi project key, configure these **server-only** values:

```dotenv
AI_PROVIDER=kimi
MOONSHOT_API_KEY=your_server_side_key
KIMI_MODEL=kimi-k3
```

The three route contracts remain provider-neutral:

- `POST /api/practice` — generate the opening or next professor turn.
- `POST /api/feedback` — generate the completed-session report and action plan.
- `POST /api/translate` — convert a Chinese draft into concise, natural spoken English.

Never expose the API key through a `NEXT_PUBLIC_*` variable. Invalid, empty, truncated, timed-out, or unavailable live practice and feedback output falls back safely to the Demo provider.

## Verify changes

```bash
npm run lint
npm run build
npm run test:e2e
```

Install the Playwright browser once if needed:

```bash
npx playwright install chromium
```

Current automated coverage includes:

- personal versus sample setup;
- grounded English and Simplified Chinese context guidance, including the no-feedback path;
- context request validation and invalid structured-output rejection;
- context-aware opening requests with an empty transcript;
- deterministic Demo openings and follow-ups;
- `Enter`, `Shift` + `Enter`, and IME-safe submission;
- mocked English and Mandarin speech recognition;
- Mandarin-to-natural-English conversion and restoration of the Chinese draft;
- Kimi request shapes, JSON Schema feedback, provider selection, and invalid-output rejection.

## Deploy to Cloudflare Workers

Production: **[https://campus-decoder.zhoulinhua0.workers.dev](https://campus-decoder.zhoulinhua0.workers.dev)**

Preview the OpenNext build in Cloudflare’s local `workerd` runtime:

```bash
npm run preview:cloudflare
```

Deploy from an authenticated maintainer environment:

```bash
npm run deploy:cloudflare
```

The manual workflow at `.github/workflows/deploy-cloudflare.yml` uses the repository secrets `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`. Before enabling Kimi, add `MOONSHOT_API_KEY` as a Cloudflare Worker secret and set `AI_PROVIDER=kimi` as a runtime variable. GitHub Pages is not supported because this application requires server-side Route Handlers.

## Project map

```text
app/
  api/
    context/route.ts        # Grounded campus-context decode
    practice/route.ts       # Opening and follow-up professor turns
    feedback/route.ts       # Structured feedback and action plan
    translate/route.ts      # Chinese draft to natural English
  practice/office-hours/    # Complete five-stage journey
components/practice/        # Setup, context, practice, feedback, and action UI
lib/ai/
  providers.ts              # Provider contract, Demo fallback, Kimi adapter
  prompts.ts                # Context, role-play, feedback, and conversion prompts
  schemas.ts                # Request and structured-output validation
  mock.ts                   # Deterministic Demo output
tests/e2e/                   # Office Hours and provider coverage
types/practice.ts           # Shared UI and API contracts
wrangler.jsonc              # Cloudflare Worker configuration
open-next.config.ts         # OpenNext adapter configuration
```

## Current limits

- Production still uses deterministic Demo mode; Kimi has not been evaluated with a funded key or enabled.
- Demo Context guidance is grounded in the student’s setup through fixed coaching rules; Kimi-generated context has not yet been evaluated with a funded key.
- Emailing a Professor and Group Project Conflict are preview cards, not implemented journeys.
- Voice input depends on browser Web Speech API support, microphone permission, and the browser’s speech service. Typed input remains available.
- Automated voice tests use a browser mock; real Chrome and Safari microphone behavior still needs hands-on QA.
- Automated UI coverage currently targets mobile Chromium; broader desktop, tablet, Safari, long-content, and reduced-motion QA remains.
- The MVP has no authentication, database, saved history, analytics, or progress tracking.
- Live-AI fallback is safe but does not yet have production observability.

## Next priorities

1. Evaluate Kimi for English dialogue, Simplified Chinese coaching, translation fidelity, transcript grounding, schema reliability, latency, cost, and fallback behavior.
2. Test the Office Hours journey with Chinese and other international students new to U.S. university culture.
3. Verify English and Mandarin dictation on the real Chrome and Safari devices planned for the demo.
4. Complete cross-device and accessibility QA, then capture screenshots and record the hackathon demo.
5. Expand to Emailing a Professor only after the Office Hours journey is validated.

## Safety

Campus Decoder provides educational practice, not official university, immigration, legal, medical, or mental-health advice. Users should verify policy-sensitive guidance with the relevant institution or a qualified professional. The product never sends a real-world message without explicit review.

## License

Campus Decoder is available under the [MIT License](./LICENSE).
