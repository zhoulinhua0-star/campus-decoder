"use client";

import { FormEvent, useRef, useState } from "react";
import { ArrowRightIcon, CheckIcon } from "@/components/icons";
import type { PracticeContext } from "@/types/practice";

type SetupStageProps = {
  context: PracticeContext;
  onChange: (context: PracticeContext) => void;
  onContinue: () => void;
};

type Errors = Partial<Record<"course" | "goal" | "whatHappened", string>>;

export function SetupStage({ context, onChange, onContinue }: SetupStageProps) {
  const [errors, setErrors] = useState<Errors>({});
  const errorRef = useRef<HTMLDivElement>(null);

  function update<K extends keyof PracticeContext>(key: K, value: PracticeContext[K]) {
    onChange({ ...context, [key]: value });
    if (key in errors) setErrors((current) => ({ ...current, [key]: undefined }));
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    const nextErrors: Errors = {};
    if (context.course.trim().length < 2) nextErrors.course = "Add the course or subject.";
    if (context.goal.trim().length < 4) nextErrors.goal = "Describe what you want from the conversation.";
    if (context.whatHappened.trim().length < 4) nextErrors.whatHappened = "Briefly explain what happened.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      requestAnimationFrame(() => errorRef.current?.focus());
      return;
    }
    onContinue();
  }

  return (
    <section className="page-shell py-10 sm:py-14">
      <div className="grid gap-8 lg:grid-cols-[.7fr_1.3fr] lg:gap-16">
        <div>
          <span className="eyebrow">A little context first</span>
          <h1 className="font-display mt-5 text-4xl font-bold leading-tight text-[#0b2e2a] sm:text-5xl">Make the practice feel like your situation.</h1>
          <p className="mt-5 text-lg leading-8 text-[#59706e]">You do not need to tell us everything. A clear goal and a few details are enough to shape the professor&apos;s responses.</p>
          <div className="mt-8 rounded-3xl border border-[#cfe0dc] bg-[#eef7f3] p-5">
            <p className="text-sm font-extrabold text-[#0b2e2a]">What happens next</p>
            <ul className="mt-3 space-y-3 text-sm text-[#45625e]">
              {["Decode what office hours are for", "Practice a short conversation", "Get structured feedback and an action plan"].map((item) => <li className="flex gap-2.5" key={item}><CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-[#0b766d]" /> {item}</li>)}
            </ul>
          </div>
        </div>

        <form className="card p-5 sm:p-8" noValidate onSubmit={submit}>
          {Object.keys(errors).length > 0 ? (
            <div aria-labelledby="setup-error-title" className="mb-6 rounded-2xl border border-[#e7a6a0] bg-[#fff1ef] p-4" ref={errorRef} role="alert" tabIndex={-1}>
              <h2 className="font-extrabold text-[#8f1f17]" id="setup-error-title">Please complete the highlighted fields.</h2>
            </div>
          ) : null}

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="field-label" htmlFor="course">Course or subject</label>
              <input aria-describedby={errors.course ? "course-error" : undefined} aria-invalid={Boolean(errors.course)} className="text-field" id="course" maxLength={120} onBlur={() => context.course.trim().length < 2 && setErrors((current) => ({ ...current, course: "Add the course or subject." }))} onChange={(event) => update("course", event.target.value)} value={context.course} />
              {errors.course ? <p className="field-error" id="course-error">{errors.course}</p> : null}
            </div>
            <div className="sm:col-span-2">
              <label className="field-label" htmlFor="goal">What do you want from this conversation?</label>
              <input aria-describedby={errors.goal ? "goal-error" : "goal-help"} aria-invalid={Boolean(errors.goal)} className="text-field" id="goal" maxLength={500} onBlur={() => context.goal.trim().length < 4 && setErrors((current) => ({ ...current, goal: "Describe what you want from the conversation." }))} onChange={(event) => update("goal", event.target.value)} value={context.goal} />
              {errors.goal ? <p className="field-error" id="goal-error">{errors.goal}</p> : <p className="field-help" id="goal-help">Focus on understanding or improving, rather than requesting a particular grade.</p>}
            </div>
            <div className="sm:col-span-2">
              <label className="field-label" htmlFor="happened">What happened?</label>
              <textarea aria-describedby={errors.whatHappened ? "happened-error" : undefined} aria-invalid={Boolean(errors.whatHappened)} className="text-area" id="happened" maxLength={1200} onChange={(event) => update("whatHappened", event.target.value)} value={context.whatHappened} />
              {errors.whatHappened ? <p className="field-error" id="happened-error">{errors.whatHappened}</p> : null}
            </div>
            <div>
              <label className="field-label" htmlFor="concern">What worries you most? <span className="font-normal text-[#788784]">Optional</span></label>
              <textarea className="text-area !min-h-24" id="concern" maxLength={500} onChange={(event) => update("concern", event.target.value)} value={context.concern} />
            </div>
            <div>
              <label className="field-label" htmlFor="feedback">Professor feedback <span className="font-normal text-[#788784]">Optional</span></label>
              <textarea className="text-area !min-h-24" id="feedback" maxLength={2000} onChange={(event) => update("professorFeedback", event.target.value)} value={context.professorFeedback} />
            </div>
          </div>

          <fieldset className="mt-6">
            <legend className="field-label">Coaching language</legend>
            <p className="field-help !mt-0 mb-3">Professor dialogue stays in English. Explanations follow this choice.</p>
            <div className="grid grid-cols-2 gap-2 rounded-2xl bg-[#eef3f1] p-1.5">
              {(["English", "简体中文"] as const).map((language) => (
                <label className={`flex min-h-11 cursor-pointer items-center justify-center rounded-xl px-4 text-sm font-extrabold transition ${context.preferredLanguage === language ? "bg-white text-[#075d56] shadow-sm" : "text-[#59706e] hover:text-[#153d39]"}`} key={language}>
                  <input checked={context.preferredLanguage === language} className="sr-only" name="language" onChange={() => update("preferredLanguage", language)} type="radio" />
                  {language}
                </label>
              ))}
            </div>
          </fieldset>

          <div className="mt-8 flex flex-col-reverse gap-3 border-t border-[#e4eeeb] pt-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs leading-5 text-[#6a7775]">Avoid sharing names or sensitive personal information.</p>
            <button className="button-primary shrink-0" type="submit">Decode this situation <ArrowRightIcon className="h-5 w-5" /></button>
          </div>
        </form>
      </div>
    </section>
  );
}
