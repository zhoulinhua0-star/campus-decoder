"use client";

import { FormEvent, useRef, useState } from "react";
import { ArrowRightIcon, CheckIcon, ScenarioIcon, SparkIcon } from "@/components/icons";
import type { EmailPracticeContext } from "@/types/email-practice";

type EmailSetupStageProps = {
  context: EmailPracticeContext;
  contextSource: "mine" | "sample";
  onChange: (context: EmailPracticeContext) => void;
  onContinue: () => void;
  onSelectContextSource: (source: "mine" | "sample") => void;
};

type RequiredField = "course" | "recipient" | "purpose" | "whatHappened" | "existingDraft";
type Errors = Partial<Record<RequiredField, string>>;

const minimumLengths: Record<RequiredField, number> = {
  course: 2,
  recipient: 2,
  purpose: 4,
  whatHappened: 4,
  existingDraft: 10,
};

const errorMessages: Record<RequiredField, string> = {
  course: "Add the course or subject.",
  recipient: "Add the professor or recipient.",
  purpose: "Describe what you want the email to accomplish.",
  whatHappened: "Briefly explain the relevant situation.",
  existingDraft: "Add at least a short draft to revise.",
};

export function EmailSetupStage({ context, contextSource, onChange, onContinue, onSelectContextSource }: EmailSetupStageProps) {
  const [errors, setErrors] = useState<Errors>({});
  const errorRef = useRef<HTMLDivElement>(null);

  function update<K extends keyof EmailPracticeContext>(key: K, value: EmailPracticeContext[K]) {
    onChange({ ...context, [key]: value });
    if (key in errors) setErrors((current) => ({ ...current, [key]: undefined }));
  }

  function validateField(field: RequiredField) {
    if (context[field].trim().length < minimumLengths[field]) {
      setErrors((current) => ({ ...current, [field]: errorMessages[field] }));
    }
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    const nextErrors: Errors = {};
    (Object.keys(minimumLengths) as RequiredField[]).forEach((field) => {
      if (context[field].trim().length < minimumLengths[field]) nextErrors[field] = errorMessages[field];
    });
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      requestAnimationFrame(() => errorRef.current?.focus());
      return;
    }
    onContinue();
  }

  function selectContextSource(source: "mine" | "sample") {
    setErrors({});
    onSelectContextSource(source);
  }

  return (
    <section className="page-shell py-10 sm:py-14">
      <div className="grid gap-8 lg:grid-cols-[.7fr_1.3fr] lg:gap-16">
        <div>
          <span className="eyebrow">Start with your draft</span>
          <h1 className="font-display mt-5 text-4xl font-bold leading-tight text-[#0b2e2a] sm:text-5xl" tabIndex={-1}>Give the professor the context they need—not your whole story.</h1>
          <p className="mt-5 text-lg leading-8 text-[#59706e]">A few details help us explain the campus norm. You will still decide what belongs in the message and write the revision yourself.</p>
          <div className="mt-8 rounded-3xl border border-[#cfe0dc] bg-[#eef7f3] p-5">
            <p className="text-sm font-extrabold text-[#0b2e2a]">What happens next</p>
            <ul className="mt-3 space-y-3 text-sm text-[#45625e]">
              {["Decode what the email needs to communicate", "Revise your own draft with focused hints", "Review feedback and copy an editable final email"].map((item) => <li className="flex gap-2.5" key={item}><CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-[#0b766d]" /> {item}</li>)}
            </ul>
          </div>
        </div>

        <form className="card p-5 sm:p-8" noValidate onSubmit={submit}>
          <fieldset className="mb-8 border-b border-[#e4eeeb] pb-8">
            <legend className="text-lg font-extrabold text-[#0b2e2a]">How would you like to begin?</legend>
            <p className="mt-1 text-sm leading-6 text-[#59706e]">Use your own email or load a sample for a quick guided demo.</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <button aria-pressed={contextSource === "mine"} className={`min-h-28 rounded-2xl border p-4 text-left transition-colors ${contextSource === "mine" ? "border-[#0b766d] bg-[#eef7f3]" : "border-[#cfe0dc] bg-white hover:border-[#78a69d]"}`} onClick={() => selectContextSource("mine")} type="button">
                <span className="flex items-start gap-3"><span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${contextSource === "mine" ? "bg-[#0b766d] text-white" : "bg-[#dcefeb] text-[#075d56]"}`}>{contextSource === "mine" ? <CheckIcon className="h-5 w-5" /> : <ScenarioIcon className="h-5 w-5" type="email" />}</span><span><span className="block font-extrabold text-[#0b2e2a]">Use my draft</span><span className="mt-1 block text-sm leading-5 text-[#59706e]">Start with empty fields and add only what feels relevant.</span>{contextSource === "mine" ? <span className="mt-2 block text-xs font-extrabold uppercase tracking-[0.08em] text-[#075d56]">Selected</span> : null}</span></span>
              </button>
              <button aria-pressed={contextSource === "sample"} className={`min-h-28 rounded-2xl border p-4 text-left transition-colors ${contextSource === "sample" ? "border-[#b85f14] bg-[#fff7e8]" : "border-[#cfe0dc] bg-white hover:border-[#d6a462]"}`} onClick={() => selectContextSource("sample")} type="button">
                <span className="flex items-start gap-3"><span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${contextSource === "sample" ? "bg-[#b85f14] text-white" : "bg-[#ffe7c0] text-[#9a5011]"}`}>{contextSource === "sample" ? <CheckIcon className="h-5 w-5" /> : <SparkIcon className="h-5 w-5" />}</span><span><span className="block font-extrabold text-[#0b2e2a]">Try the sample email</span><span className="mt-1 block text-sm leading-5 text-[#59706e]">Load a first-year writing example for a faster demo.</span>{contextSource === "sample" ? <span className="mt-2 block text-xs font-extrabold uppercase tracking-[0.08em] text-[#9a5011]">Selected</span> : null}</span></span>
              </button>
            </div>
          </fieldset>

          {Object.keys(errors).length > 0 ? <div aria-labelledby="email-setup-error-title" className="mb-6 rounded-2xl border border-[#e7a6a0] bg-[#fff1ef] p-4" ref={errorRef} role="alert" tabIndex={-1}><h2 className="font-extrabold text-[#8f1f17]" id="email-setup-error-title">Please complete the highlighted fields.</h2></div> : null}

          <div className="grid gap-5 sm:grid-cols-2">
            <div><label className="field-label" htmlFor="email-course">Course or subject</label><input aria-describedby={errors.course ? "email-course-error" : undefined} aria-invalid={Boolean(errors.course)} className="text-field" id="email-course" maxLength={120} onBlur={() => validateField("course")} onChange={(event) => update("course", event.target.value)} value={context.course} />{errors.course ? <p className="field-error" id="email-course-error">{errors.course}</p> : null}</div>
            <div><label className="field-label" htmlFor="email-recipient">Professor or recipient</label><input aria-describedby={errors.recipient ? "email-recipient-error" : "email-recipient-help"} aria-invalid={Boolean(errors.recipient)} className="text-field" id="email-recipient" maxLength={120} onBlur={() => validateField("recipient")} onChange={(event) => update("recipient", event.target.value)} value={context.recipient} />{errors.recipient ? <p className="field-error" id="email-recipient-error">{errors.recipient}</p> : <p className="field-help" id="email-recipient-help">A title and last name are enough. Avoid personal contact details.</p>}</div>
            <div className="sm:col-span-2"><label className="field-label" htmlFor="email-purpose">What should this email accomplish?</label><input aria-describedby={errors.purpose ? "email-purpose-error" : "email-purpose-help"} aria-invalid={Boolean(errors.purpose)} className="text-field" id="email-purpose" maxLength={500} onBlur={() => validateField("purpose")} onChange={(event) => update("purpose", event.target.value)} value={context.purpose} />{errors.purpose ? <p className="field-error" id="email-purpose-error">{errors.purpose}</p> : <p className="field-help" id="email-purpose-help">Name the reply or next step you hope to receive.</p>}</div>
            <div className="sm:col-span-2"><label className="field-label" htmlFor="email-happened">What happened?</label><textarea aria-describedby={errors.whatHappened ? "email-happened-error" : undefined} aria-invalid={Boolean(errors.whatHappened)} className="text-area" id="email-happened" maxLength={1200} onBlur={() => validateField("whatHappened")} onChange={(event) => update("whatHappened", event.target.value)} value={context.whatHappened} />{errors.whatHappened ? <p className="field-error" id="email-happened-error">{errors.whatHappened}</p> : null}</div>
            <div className="sm:col-span-2"><label className="field-label" htmlFor="email-concern">What worries you most? <span className="font-normal text-[#536461]">Optional</span></label><textarea className="text-area !min-h-24" id="email-concern" maxLength={500} onChange={(event) => update("concern", event.target.value)} value={context.concern} /></div>
            <div className="sm:col-span-2"><label className="field-label" htmlFor="existing-email-draft">Your current draft</label><textarea aria-describedby={errors.existingDraft ? "existing-email-draft-error" : "existing-email-draft-help"} aria-invalid={Boolean(errors.existingDraft)} className="text-area !min-h-56 font-mono text-sm leading-6" id="existing-email-draft" maxLength={4000} onBlur={() => validateField("existingDraft")} onChange={(event) => update("existingDraft", event.target.value)} value={context.existingDraft} />{errors.existingDraft ? <p className="field-error" id="existing-email-draft-error">{errors.existingDraft}</p> : <p className="field-help" id="existing-email-draft-help">It can be unfinished. You will revise it in the Practice step.</p>}</div>
          </div>

          <div className="mt-8 flex flex-col-reverse gap-3 border-t border-[#e4eeeb] pt-6 sm:flex-row sm:items-center sm:justify-between"><p className="text-xs leading-5 text-[#6a7775]">Avoid sharing student IDs, phone numbers, or sensitive personal information.</p><button className="button-primary shrink-0" type="submit">See email guidance <ArrowRightIcon className="h-5 w-5" /></button></div>
        </form>
      </div>
    </section>
  );
}
