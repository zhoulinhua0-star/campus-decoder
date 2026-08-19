# Campus Decoder — Product Context & Agent Working Guide

## 1. Document purpose

This file preserves the product context, decisions, and hackathon strategy for **Campus Decoder**. Future agents should read it before proposing features, writing product copy, designing interfaces, or implementing the application.

Treat this document as the current product brief. Preserve the central problem and MVP focus unless the user explicitly changes direction.

## 2. Founder context

- The founder is participating in a hackathon and is beginning the project now.
- The founder recently completed the university application process and is personally familiar with the experience of Chinese international students.
- The preferred cause pillar is **Track 2: Equity in Education**.
- The product should primarily serve Chinese international students studying at, or preparing to enter, an English-speaking university.
- This founder–problem fit is an important part of the pitch: the project grows from a real, recently experienced problem rather than an abstract market opportunity.

## 3. Hackathon rules and judging criteria

### Judging weights

Projects are evaluated by a panel using:

1. **Social Impact — 40%**
   Does the project solve a real-world problem effectively?

2. **Technical Execution — 30%**
   Does the prototype, no-code app, or design function as intended and clearly demonstrate the idea?

3. **Innovation — 20%**
   Is the approach creative, unique, or highly original?

4. **Design & UX — 10%**
   Is the tool intuitive, visually appealing, and accessible to the end user?

Projects with the highest overall scores will be selected as winners. Judges’ decisions are final.

### Submission requirements

Every submission must:

- Address a real challenge within one Cause Pillar: Accessibility & Health, Equity in Education, or Open Impact & Sustainability.
- Be original work created by the participants for this event.
- Include a completed Devpost Project Page with a clear explanation of the problem and proposed solution.
- Include at least one visual element, such as screenshots, designs, or prototype images.
- Include a demo video or pitch no longer than five minutes.
- Optionally include a GitHub repository or live website.
- Artificial intelligence tools may be used during development.
- The deliverable may be a working code prototype, no-code application, or pure design mockup presentation.

### Momen track opportunity — not selected

Momen was considered because using it would qualify the project for the **Best No-Code AI App built with Momen** award. The founder has since chosen a traditional web implementation. Do not reintroduce Momen-specific architecture or instructions unless the founder explicitly reverses this decision.

### Cause pillars

#### Track 1: Accessibility & Health

Empower people with disabilities, improve access to mental-health support, or democratize healthcare information. Example concepts include a neurodivergent-friendly UI overlay, ambient therapy support, and tools that simplify medical bills.

#### Track 2: Equity in Education — selected track

Create tools that bridge the digital divide, personalize learning, or connect students with mentors and resources. Example concepts include adaptive AI tutors, gamified coding platforms, and college-preparation mentorship tools.

#### Track 3: Open Impact & Sustainability

Build solutions for climate action, community building, or broad social impact that does not fit the first two pillars. Example concepts include carbon tracking, neighborhood cleanup coordination, and financial-literacy tools.

## 4. Product name

**Campus Decoder**

Working Chinese descriptions may use phrases such as:

- 校园文化解码器
- 留学潜台词
- 国际学生校园沟通教练

The official product name remains **Campus Decoder** unless the founder explicitly changes it.

## 5. Product vision

### One-sentence pitch

**Campus Decoder helps Chinese international students understand the hidden rules of university life and practice high-stakes campus conversations before they happen.**

Chinese version:

> Campus Decoder 帮助中国留学生理解大学校园中的“隐性规则”，并在真实场景发生前，通过双语 AI 角色扮演进行练习和获得反馈。

### Core insight

English proficiency is not the same as cultural fluency.

Many Chinese international students have strong test scores and sufficient academic English, but still lack access to the unwritten knowledge that domestic or culturally familiar students acquire informally. Examples include:

- What office hours are actually for and how to begin a conversation.
- How to email a professor without sounding excessively apologetic, overly formal, vague, or demanding.
- How to enter a classroom discussion or respectfully disagree.
- How to divide work, follow up, and resolve conflict in a group project.
- What terms such as participation, extension, accommodation, and academic integrity mean in practice.
- Whether a problem belongs with a professor, TA, academic advisor, counseling center, disability services, career center, or international student office.

This is not merely a language-translation problem. It is an **educational equity problem caused by unequal access to institutional and cultural knowledge**.

## 6. Target users

### Primary user

A Chinese international undergraduate student in their first one or two years at an English-speaking university who:

- Can understand English but lacks confidence in unfamiliar campus situations.
- Worries about being impolite, asking a “bad” question, losing face, or inconveniencing professors.
- Does not always recognize the implied meaning of university communication.
- May avoid useful resources because the process is unclear or culturally unfamiliar.

### Secondary users

- Incoming international students preparing before arrival.
- Other international or first-generation students who face similar hidden-curriculum barriers.
- International student offices, orientation programs, and academic-support teams.

The hackathon MVP should remain designed around the primary Chinese international student persona. This is the product's **beachhead audience**, not a permanent restriction on who may use the product. Starting with a narrow audience strengthens founder–problem fit, makes the hidden-curriculum problem concrete, and avoids turning Campus Decoder into a generic AI student assistant.

The product architecture and language system should nevertheless support broader adoption. Position the expansion path as:

1. Chinese international students entering English-speaking universities.
2. International students from other language and cultural backgrounds.
3. First-generation and other students who lack informal access to university norms.

In pitches and product copy, say that Campus Decoder **begins with** Chinese international students; do not say that only Chinese students can use it.

## 7. Jobs to be done

When I face an unfamiliar or stressful campus interaction, help me:

1. Understand what is expected in this situation.
2. Recognize the cultural context or implied meaning.
3. Practice what I want to say in a safe environment.
4. Receive specific, supportive feedback.
5. Leave with a concrete next action I can use in real life.

The intended product loop is:

> **Understand → Practice → Feedback → Act**

## 8. Recommended MVP

Build a focused, end-to-end experience rather than a broad “all-in-one study abroad assistant.”

### MVP scenarios

Implement three scenario categories:

1. **Office Hours** — primary demo scenario.
2. **Emailing a Professor**.
3. **Group Project Conflict**.

### Core features

#### A. Scenario selection

The user chooses a realistic situation from clear scenario cards. Each card should explain the goal, estimated practice time, and what the user will learn.

#### B. Context setup

Collect only the information needed to personalize the exercise, such as:

- User’s goal.
- Course or situation.
- What has already happened.
- Preferred language or support level.
- Optional pasted message, assignment feedback, or syllabus excerpt.

#### C. AI role-play

The AI plays a professor, TA, or classmate. The user practices through text first; voice can be a stretch goal. The role-play should feel like a conversation, not a form that instantly generates a perfect response.

#### D. Cross-cultural feedback

After the exercise, provide concise feedback across structured dimensions:

- Clarity.
- Politeness and tone.
- Specificity.
- Initiative and self-advocacy.
- Cultural/contextual fit.

Feedback must explain what worked, identify one or two improvements, and show a better alternative without shaming the user.

#### E. “Hidden meaning” explanation

Where relevant, distinguish among:

- Literal meaning.
- Likely campus-context meaning.
- A constructive response or next move.

This is a defining feature and a major source of product differentiation.

#### F. Action output

End each session with something immediately usable, such as:

- An editable email draft.
- An office-hours discussion outline.
- A group-project follow-up message.
- A list of questions to ask.
- A recommended campus resource and explanation of why it fits.

## 9. Primary demo story

The strongest demonstration is an Office Hours journey:

1. A Chinese first-year student receives a lower-than-expected essay grade.
2. She wants help but feels that attending office hours could appear confrontational or waste the professor’s time.
3. Campus Decoder explains what office hours are for and helps her define a constructive goal.
4. She practices with an AI professor.
5. The system identifies excessive apologizing, vague questions, or a lack of specific evidence.
6. It provides culturally aware, supportive feedback.
7. It produces a short meeting outline she can use in the real conversation.

The demo should make the transformation visible:

> **Real anxiety → contextual understanding → safe practice → actionable feedback → confident next step**

Use this scenario as the main narrative in the demo video. Show the other two scenarios briefly as evidence that the product can expand.

## 10. Product differentiation

Campus Decoder must not feel like a thin ChatGPT wrapper.

At least two—and preferably four—of the following should be visible in the prototype:

- Structured, campus-specific feedback criteria.
- A practice-first interaction instead of immediately generating an answer.
- A “literal meaning vs. campus meaning” comparison.
- Personalization based on the user’s role, situation, relationship, and goal.
- Navigation to the right campus resource or department.
- A clear before-and-after comparison of the user’s response.
- Saved practice progress or evidence of skill improvement.
- Scenario-specific conversation logic for professors, TAs, and peers.

The defensible idea is not “AI answers questions.” It is a guided behavioral-learning experience that translates institutional culture into practice and action.

## 11. UX principles

- **Supportive, never judgmental:** The user may already feel anxious or embarrassed.
- **English-first, multilingual by design:** The interface and default coaching output should be English so judges and a broad international audience can use the product. Simplified Chinese should be an optional support language for the initial audience, not a required or exclusive experience.
- **Progressive assistance:** Let confident users practice independently and allow anxious users to request examples or sentence starters.
- **Action over information:** Every flow should end in a real next step.
- **Specific over generic:** Advice should refer to the user’s actual goal and scenario.
- **Accessible and calm:** Use readable typography, strong contrast, clear hierarchy, plain language, and limited visual clutter.
- **Preserve agency:** Suggestions should be editable and should not pretend there is only one culturally “correct” personality or communication style.
- **Restrained motion:** Use subtle reveal-on-scroll motion only for meaningful below-the-fold groups. Keep essential content immediately readable, avoid scroll-jacking or large parallax effects, and always honor `prefers-reduced-motion`.

### Language strategy

- Use **English as the default interface language** for the hackathon prototype, Devpost screenshots, demo video, and judge-facing experience.
- Provide a visible coaching-language option such as `English | 简体中文` when feasible.
- Keep simulated professor responses and suggested real-world messages in natural English, because the student must use them in an English-speaking campus environment.
- Return cultural explanations, coaching feedback, and next steps in the user's selected coaching language.
- If the language preference is missing or unsupported, default to English.
- Do not remove Simplified Chinese merely because the event is international. Optional Chinese support demonstrates understanding of the initial audience and reduces cognitive load in stressful situations.
- Future language options may include Spanish, Korean, Arabic, and others; do not hard-code product logic around Chinese text.

For the traditional web prototype, use a `preferredLanguage` field, with `English` as the initial debug and demo value. The server-side AI flow should follow these output-language rules:

- `professor_reply`: English.
- `suggested_response`: English.
- `campus_context`: User's preferred coaching language.
- `improvement`: User's preferred coaching language.
- `next_action`: User's preferred coaching language.

Prefer the structured-output field name `campus_context` over `hidden_meaning`. The interface may label it **What this may mean** or **Campus context**. The output should describe the professor's likely intention and relevant university norms without claiming certainty about another person's private thoughts.

## 12. Suggested information architecture

### Home

- Product promise.
- Three scenario cards.
- A short explanation of how it works.
- Start Practice call to action.

### Scenario setup

- Goal and context inputs.
- Language/support preference.
- Optional pasted source material.

### Practice room

- AI role label and scenario goal.
- Conversation interface.
- Optional “I’m stuck” hints.
- Clear finish-practice control.

### Feedback report

- What went well.
- Two highest-value improvements.
- Structured dimension ratings or qualitative indicators.
- Literal/contextual meaning comparison when relevant.
- Before-and-after example.

### Action plan

- Editable real-world output.
- Recommended next step or campus resource.
- Repeat scenario option.

## 13. Scope and non-goals

### In scope for the hackathon

- A polished vertical slice through at least one complete scenario.
- Three visible scenario choices.
- AI-generated role-play and structured feedback.
- Bilingual or language-toggle support.
- A clear final action artifact.
- Enough visual polish to produce screenshots and a convincing demo.

### Stretch goals

- Voice conversation.
- Institution-specific resource directories.
- User accounts and practice history.
- Improvement tracking across repeated sessions.
- Additional scenarios such as classroom participation and advisor meetings.

### Out of scope for the MVP

- A universal AI tutor for academic subjects.
- College admissions counseling.
- Immigration or visa legal advice.
- Medical or mental-health diagnosis.
- Authoritative interpretation of university policy.
- A comprehensive database for every university.
- Automatic sending of emails or messages without explicit user review.

When safety-sensitive topics arise, the product should clarify its limits and direct users to an appropriate qualified person or official campus resource.

## 14. Success criteria for the prototype

The MVP is successful when a judge can:

1. Understand the educational-equity problem within 20 seconds.
2. Select an Office Hours scenario without instruction.
3. Complete a short AI role-play.
4. See feedback that is clearly more structured and culturally aware than a generic chatbot response.
5. Leave with a useful meeting outline or message.
6. Explain in one sentence how Campus Decoder differs from translation software or ChatGPT.

Useful user-test questions:

- Do users feel more confident after one practice session?
- Is the recommended action specific enough to use immediately?
- Does the explanation reveal an expectation the user did not previously understand?
- Does the feedback feel supportive and culturally respectful?

## 15. Hackathon scoring strategy

### Social Impact — 40%

Lead with unequal access to the university “hidden curriculum.” Explain how this causes students to underuse office hours, advising, mentorship, and other resources even after earning admission. Use the founder’s lived experience and, if available later, a few user interviews or short anonymized quotes.

### Technical Execution — 30%

Prioritize one complete working journey over many disconnected screens. Make the role-play, feedback, and action-output stages visibly functional.

### Innovation — 20%

Frame the innovation as **cultural-context translation plus behavioral rehearsal**, not machine translation. Highlight the movement from explanation to practice and measurable improvement.

### Design & UX — 10%

Build a calm, approachable bilingual interface with a very obvious next action. Avoid an intimidating enterprise-dashboard feel.

## 16. Alternative and supporting concepts

These ideas were considered and can inform future scope:

### Office Hours Coach

A narrower version focused entirely on preparing for a first office-hours conversation. It is the safest fallback if development time is extremely limited.

### Group Project Culture Simulator

Practice proposing task division, following up on missed work, disagreeing respectfully, resolving conflict, and deciding when to involve an instructor.

### Syllabus Decoder

Explain grading structure, deadlines, late policies, participation expectations, extensions, academic integrity, and support resources in simple bilingual language. This is feasible but less differentiated on its own; it works better as an input feature inside Campus Decoder.

### First-Gen International Student Navigator

Help students decide whether to contact a professor, advisor, international student office, counseling center, disability services, financial aid, or career center, then prepare for that interaction. This has strong social impact but requires careful boundaries around legal, medical, and policy advice.

## 17. Naming and messaging options

The selected name is **Campus Decoder**. Earlier naming directions included UnspokenU, BridgeU, OfficeReady, UniCulture, Campus Compass, and 留学潜台词. These are not the current product name but may inspire feature names or messaging.

Potential taglines:

- Decode the rules no one teaches.
- Practice university life before it happens.
- From campus confusion to confident action.
- 不只翻译语言，更解码校园文化。
- 把没人明说的校园规则，变成你可以练习的能力。

## 18. Devpost and pitch structure

Use a simple narrative:

1. **Problem:** Admission does not guarantee equal access to the hidden curriculum.
2. **Personal connection:** The founder recently experienced this transition and recognizes the gap firsthand.
3. **User story:** Show the student who avoids office hours after receiving a low grade.
4. **Solution:** Campus Decoder explains context, provides safe role-play, gives structured feedback, and produces an action plan.
5. **Live demo:** Complete the Office Hours journey.
6. **Differentiation:** Cultural interpretation plus behavioral rehearsal, not generic translation or chat.
7. **Impact:** More confident self-advocacy and more equitable use of university resources.
8. **Future:** Additional scenarios, institution-specific resources, voice practice, and expansion to other international and first-generation students.

Keep the demo video under five minutes. Prefer a clear working story over a long feature tour.

## 19. Working guidance for future agents

When helping with Campus Decoder:

- Begin by protecting the narrow MVP and primary Office Hours demo.
- Relate major feature decisions to the hackathon judging weights.
- Prefer concrete deliverables and testable user flows over broad strategy language.
- Do not turn the product into a generic AI tutor, admissions platform, or all-purpose international-student portal.
- Maintain the distinction between language translation and cultural/institutional context.
- Keep the judge-facing prototype English-first while making Simplified Chinese an optional coaching layer.
- Preserve the initial Chinese international student persona as a focused beachhead audience, while keeping the product architecture extensible to other international and first-generation students.
- Keep simulated professor dialogue and suggested real-world messages in English; generate explanations and feedback in the user's selected coaching language.
- Use `campus_context` rather than language that implies the AI knows another person's private thoughts with certainty.
- Treat cultural patterns as context, not stereotypes; allow individual preferences and multiple valid communication styles.
- Do not claim that generated guidance is official university, immigration, legal, or medical advice.
- Require user review before any real-world message is sent.
- If time is constrained, polish one end-to-end scenario before adding more features.
- Keep visual and written output suitable for screenshots, a Devpost page, and a sub-five-minute demo.
- Surface assumptions when information about the target university, hackathon timeline, platform, or team is missing.

## 20. Current product decision summary

- **Project:** Campus Decoder.
- **Track:** Equity in Education.
- **Primary audience:** Chinese international university students, initially focused on early undergraduate transition; this is the beachhead audience, not an exclusive eligibility rule.
- **Expansion audience:** Other international students and first-generation students who face hidden-curriculum barriers.
- **Language:** English-first interface and judge-facing demo; optional Simplified Chinese coaching, with an extensible preferred-language system.
- **Output language rule:** Professor dialogue and suggested responses remain in English; campus context, improvement feedback, and next actions follow the user's coaching-language preference.
- **Problem:** Unequal access to the hidden cultural and institutional rules of university life.
- **Core experience:** Understand → Practice → Feedback → Act.
- **Primary demo:** Preparing for and rehearsing an Office Hours conversation after receiving a disappointing essay grade.
- **Additional MVP scenarios:** Emailing a professor and handling group-project conflict.
- **Differentiator:** Structured cross-cultural rehearsal and feedback rather than generic AI answers or direct translation.
- **Build strategy:** A polished, functional Next.js vertical slice; the founder has chosen a traditional web implementation instead of Momen.
- **Impact claim:** Campus Decoder helps students advocate for themselves and access educational resources more equitably.

## 21. Implementation architecture and engineering constraints

Campus Decoder is a traditional server-rendered web application rather than a no-code build.

### Technology stack

- Next.js 16 App Router with React 19 and TypeScript.
- Tailwind CSS 4 plus project-level design tokens and component classes in `app/globals.css`.
- OpenAI JavaScript SDK using the Responses API from server-side Route Handlers.
- Zod for request validation and structured feedback output.
- ESLint and the TypeScript checks performed by the production build.

### Application boundaries

- Keep the OpenAI API key server-only. Never expose it through a `NEXT_PUBLIC_*` variable or call OpenAI directly from a client component.
- Keep practice generation and transcript feedback as separate server responsibilities. The current route boundary is `POST /api/practice` for the next professor turn and `POST /api/feedback` for the completed-session report and action plan.
- Treat the structured feedback schema as a UI contract. Update the Zod schema, shared TypeScript types, prompts, mocks, API route, and rendering components together when changing it.
- Preserve a deterministic demo mode when `OPENAI_API_KEY` is absent so the complete hackathon journey remains testable and recordable without external services.
- Live AI failures should degrade to a safe demo response rather than strand the user mid-session.
- Keep scenario-specific prompts and behavior in server-side modules. Do not bury prompt rules in visual components.
- The MVP intentionally has no authentication, database, or persistence. Do not add these before the core Office Hours journey is polished and validated.

### Current application structure

- `app/` contains the App Router pages, global styles, and server Route Handlers.
- `components/practice/` contains the five-stage Office Hours experience: setup, campus context, practice, feedback, and action plan.
- `lib/ai/` contains the OpenAI client, prompts, Zod schemas, and deterministic demo responses.
- `types/` contains shared practice and feedback contracts.
- `design-system/campus-decoder/MASTER.md` records the visual system and motion decisions.

### Frontend conventions

- Prefer semantic HTML, visible labels, keyboard focus states, 44–48px minimum interactive targets, and responsive layouts that work from small phones upward.
- Keep icons as consistent inline SVG components rather than emoji or mixed icon libraries.
- Use the existing calm off-white, deep-teal, and warm-amber visual language. Avoid an enterprise dashboard or generic chatbot aesthetic.
- Use the native `IntersectionObserver` scroll-reveal utility for the current lightweight motion pattern rather than adding a large animation dependency solely for that effect.
- Ensure server-rendered content remains visible until reveal behavior initializes, and render the final state immediately for reduced-motion users.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
