# Campus Decoder — Agent Guide

## Purpose

This file defines durable product and engineering constraints. Read it before proposing features, changing copy, designing interfaces, or editing code. Use `SESSION_HANDOFF.md` for current implementation status and next steps.

## Product

**Campus Decoder** helps Chinese international students understand the unwritten rules of university life, practice unfamiliar campus interactions, receive culturally aware feedback, and leave with a usable next action.

- **Hackathon track:** Equity in Education.
- **Primary audience:** Chinese international undergraduates in their first two years at an English-speaking university.
- **Expansion audience:** Other international and first-generation students who lack informal access to university norms.
- **Core problem:** English proficiency does not guarantee cultural or institutional fluency. Unequal access to the university “hidden curriculum” limits students’ use of office hours, advising, mentorship, and other resources.
- **Product loop:** Understand → Practice → Feedback → Act.
- **Differentiator:** Cultural-context translation plus behavioral rehearsal, not direct translation or a generic chatbot.

The founder recently completed the university application process and has direct familiarity with the Chinese international-student experience. Preserve this founder–problem fit in the pitch.

## MVP and demo narrative

Protect one polished Office Hours vertical slice before expanding scope.

The primary demo follows a newly arrived Chinese first-year student who receives disappointing or unclear essay feedback, does not know what Office Hours are for, and worries that asking for help may appear confrontational or burdensome. Campus Decoder should:

1. Explain the relevant campus norm.
2. Help the student define a constructive goal.
3. Simulate a professor conversation.
4. Provide supportive, transcript-grounded feedback.
5. Produce an editable meeting outline.

The visible transformation is:

> Uncertainty → context → safe practice → specific feedback → confident action

Emailing a Professor and Group Project Conflict are expansion scenarios. They may remain visible as previews until the Office Hours journey is validated and demo-ready.

## Experience contract

### Setup

Collect only what is needed: course, goal, what happened, concern, optional professor feedback or source text, and coaching language.

### Context

Separate:

- What the source literally says.
- What it may mean in the campus context.
- What remains uncertain.
- A constructive next move.

Do not claim to know another person’s private intention. Pasted feedback is optional; the flow must also work for students who simply do not understand Office Hours norms.

### Practice

The student should write their own responses. Hints and sentence starters may assist, but the product must not skip directly to a perfect answer.

### Feedback

Feedback should be supportive and specific. Evaluate clarity, tone, specificity, initiative, and campus fit. Explain what worked, identify the two highest-value improvements, and compare the student’s actual wording with editable alternatives.

### Action

End with an immediately usable artifact such as a meeting outline, question list, email draft, or follow-up message. Never send a real-world message without explicit user review.

## Language and cultural guidance

- The interface and judge-facing demo are English-first.
- `preferredLanguage` supports `English` and `简体中文` and must remain extensible.
- Simulated professor dialogue and suggested real-world messages remain in natural English.
- Campus context, coaching, improvement explanations, and next steps follow `preferredLanguage`.
- Default to English when the preference is missing or unsupported.
- Use `campus_context`, not `hidden_meaning`, in structured output.
- Treat cultural patterns as context, not stereotypes. Preserve multiple valid communication styles and the user’s agency.

## Demo integrity

The application must remain usable without any live-provider API key. `DemoProvider` is the deterministic default and failure fallback.

- Deterministic professor replies must be labeled as a guided demo.
- Fixed ratings and coaching must be labeled as representative or sample content.
- Demo feedback may quote only text the user actually submitted.
- Demo output must not imply that fixed content is AI-personalized analysis.
- Live-AI failures should fall back safely rather than strand the user mid-session.
- Chinese speech-to-text may use the browser's speech-recognition capability. Natural-English conversion must use the server-side provider boundary; if live AI is unavailable, preserve the Chinese draft and explain that conversion is unavailable rather than fabricating a translation.

## Scope and safety

In scope for the hackathon:

- One complete, polished Office Hours journey.
- Three visible scenario choices.
- Structured cross-cultural practice and feedback.
- Optional Simplified Chinese coaching.
- A concrete final action artifact.

Do not add authentication, a database, persistence, voice, or institution-specific directories before the Office Hours journey is validated. Do not turn the product into a universal tutor, admissions service, inbox, task manager, or campus portal.

Do not provide authoritative legal, immigration, medical, mental-health, or university-policy advice. State uncertainty and direct users to qualified people or official resources when appropriate.

## UX rules

- Calm, supportive, and non-judgmental.
- Specific advice over generic reassurance.
- Clear hierarchy, plain language, strong contrast, visible labels, keyboard focus, and 44–48px minimum interactive targets.
- Responsive from small phones upward. Mobile progress uses a compact current-step indicator rather than a horizontally scrolling desktop stepper.
- Use the existing off-white, deep-teal, and warm-amber visual system.
- Use consistent inline SVG icons rather than emoji or mixed icon libraries.
- Keep motion restrained. Use the existing `IntersectionObserver` reveal pattern, preserve no-JavaScript visibility, and honor `prefers-reduced-motion`.

## Architecture

- Next.js 16 App Router, React 19, TypeScript.
- Tailwind CSS 4 with project tokens and component classes in `app/globals.css`.
- A provider-neutral server-side AI boundary. `DemoProvider` is the deterministic default and fallback; `KimiProvider` is the first live adapter, using Kimi's OpenAI-compatible Chat Completions API and JSON Schema output.
- Zod for request validation and structured feedback contracts.
- Playwright for the Office Hours browser journey.
- OpenNext, Wrangler, and Cloudflare Workers for hosting.

Primary boundaries:

- `POST /api/context` turns the validated setup into four bounded fields: literal source, campus context, uncertainty, and a constructive next move.
- `POST /api/practice` generates the context-aware opening or next professor turn.
- `POST /api/feedback` generates the completed-session report and action plan.
- `POST /api/translate` converts a user-reviewed Chinese practice draft into natural spoken English before it is sent to the simulated professor.
- Select the runtime through `AI_PROVIDER`; the first supported modes should be `demo` and `kimi`.
- Keep `MOONSHOT_API_KEY` and all future provider credentials server-only. Never expose them through `NEXT_PUBLIC_*` or call a model provider from client components.
- Preserve one internal provider contract so routes, shared types, and UI components do not depend on a vendor SDK.
- Parse and validate every live response with the existing Zod contracts; retry or fall back to `DemoProvider` on invalid, empty, timed-out, or unavailable output.
- Do not add a second live provider before Kimi is evaluated against English dialogue, bilingual coaching, schema reliability, latency, transcript grounding, and fallback behavior.
- Keep scenario prompts and behavior in server-side modules.
- Treat the Zod context and feedback schemas as UI contracts. Update schemas, shared types, prompts, mocks, routes, and rendering together.
- Client session state is intentionally ephemeral for the MVP.

Key locations:

- `app/` — pages and Route Handlers.
- `components/practice/` — five-stage Office Hours experience.
- `lib/ai/` — providers, prompts, schemas, and deterministic demo output.
- `types/` — shared contracts.
- `tests/e2e/` — Playwright journey.
- `design-system/campus-decoder/MASTER.md` — visual system.
- `.github/workflows/` — CI and manual Cloudflare deployment.
- `wrangler.jsonc` and `open-next.config.ts` — Cloudflare runtime configuration.

## Testing and deployment

Before publishing meaningful changes:

1. Run `npm run lint`.
2. Run `npm run build`.
3. Run `npm run test:e2e` for user-flow changes.
4. Verify the Cloudflare/OpenNext runtime for deployment changes.

The production target is Cloudflare Workers. GitHub Pages cannot host the server-side API routes, and Vercel is not the selected platform. The manual deployment workflow uses `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` repository secrets. When Kimi support is implemented, keep `MOONSHOT_API_KEY` as a Cloudflare runtime secret.

## Hackathon priorities

Judging weights are Social Impact 40%, Technical Execution 30%, Innovation 20%, and Design & UX 10%.

Optimize for:

- A clear educational-equity problem within 20 seconds.
- One reliable end-to-end demo rather than broad feature coverage.
- Visible differentiation from translation software and generic chat.
- A supportive, actionable result grounded in the student’s situation.
- A Devpost page with visuals and a demo video under five minutes.

## Working rules for future agents

- Preserve the narrow Office Hours MVP unless the founder explicitly changes direction.
- Distinguish durable decisions in this file from current status in `SESSION_HANDOFF.md`.
- Inspect existing code and local Next.js documentation before implementation.
- Prefer small, testable changes and explicit success criteria.
- Preserve unrelated user changes in a dirty worktree.
- Do not reintroduce Momen unless the founder explicitly reverses the traditional-web decision.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
