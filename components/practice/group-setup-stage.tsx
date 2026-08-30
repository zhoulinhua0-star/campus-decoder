"use client";

import { FormEvent, useRef, useState } from "react";
import { ArrowRightIcon, CheckIcon, ScenarioIcon, SparkIcon } from "@/components/icons";
import type { GroupPracticeContext } from "@/types/group-practice";

type Props = {
  context: GroupPracticeContext;
  contextSource: "mine" | "sample";
  onChange: (context: GroupPracticeContext) => void;
  onContinue: () => void;
  onSelectContextSource: (source: "mine" | "sample") => void;
};

type RequiredField = "course" | "role" | "projectSituation" | "conflict" | "goal";
type Errors = Partial<Record<RequiredField, string>>;

const minimumLengths: Record<RequiredField, number> = { course: 2, role: 2, projectSituation: 4, conflict: 4, goal: 4 };
const errorMessages: Record<RequiredField, string> = {
  course: "Add the course or project.",
  role: "Describe your role or current responsibility.",
  projectSituation: "Briefly describe the project and where the group is now.",
  conflict: "Describe the specific conflict or coordination problem.",
  goal: "Add what you want the conversation to accomplish.",
};

export function GroupSetupStage({ context, contextSource, onChange, onContinue, onSelectContextSource }: Props) {
  const [errors, setErrors] = useState<Errors>({});
  const errorRef = useRef<HTMLDivElement>(null);

  function update<K extends keyof GroupPracticeContext>(key: K, value: GroupPracticeContext[K]) {
    onChange({ ...context, [key]: value });
    if (key in errors) setErrors((current) => ({ ...current, [key]: undefined }));
  }

  function validateField(field: RequiredField) {
    if (context[field].trim().length < minimumLengths[field]) setErrors((current) => ({ ...current, [field]: errorMessages[field] }));
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

  function selectSource(source: "mine" | "sample") {
    setErrors({});
    onSelectContextSource(source);
  }

  const fields: { key: RequiredField; label: string; help?: string; textarea?: boolean; maxLength: number }[] = [
    { key: "course", label: "Course or project", maxLength: 120 },
    { key: "role", label: "Your role or responsibility", help: "For example: coordinator, researcher, editor, presenter, or an informal role.", maxLength: 300 },
    { key: "projectSituation", label: "What is the project situation?", help: "Include the stage, deadline, and what the group is trying to produce.", textarea: true, maxLength: 1200 },
    { key: "conflict", label: "What conflict or coordination problem happened?", help: "Focus on observable work, messages, decisions, or deadlines—not guesses about motivation.", textarea: true, maxLength: 1600 },
    { key: "goal", label: "What should the conversation accomplish?", help: "Name the decision, task plan, or next step you want the group to reach.", textarea: true, maxLength: 500 },
  ];

  return (
    <section className="page-shell py-10 sm:py-14">
      <div className="grid gap-8 lg:grid-cols-[.7fr_1.3fr] lg:gap-16">
        <div>
          <span className="eyebrow">Start with the shared work</span>
          <h1 className="font-display mt-5 text-4xl font-bold leading-tight text-[#0b2e2a] sm:text-5xl" tabIndex={-1}>Make the project problem specific before you make it personal.</h1>
          <p className="mt-5 text-lg leading-8 text-[#59706e]">A few concrete details help separate task ambiguity, missed follow-up, and real disagreement. You will decide what to say in the practice conversation.</p>
          <div className="mt-8 rounded-3xl border border-[#cfe0dc] bg-[#eef7f3] p-5">
            <p className="text-sm font-extrabold text-[#0b2e2a]">What happens next</p>
            <ul className="mt-3 space-y-3 text-sm text-[#45625e]">
              {["Decode task division, follow-up, and disagreement norms", "Practice a direct but constructive teammate conversation", "Leave with three editable action artifacts"].map((item) => <li className="flex gap-2.5" key={item}><CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-[#0b766d]" /> {item}</li>)}
            </ul>
          </div>
        </div>

        <form className="card p-5 sm:p-8" noValidate onSubmit={submit}>
          <fieldset className="mb-8 border-b border-[#e4eeeb] pb-8">
            <legend className="text-lg font-extrabold text-[#0b2e2a]">How would you like to begin?</legend>
            <p className="mt-1 text-sm leading-6 text-[#59706e]">Use your own project or load a sample for a quick guided demo.</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <button aria-pressed={contextSource === "mine"} className={`min-h-28 rounded-2xl border p-4 text-left transition-colors ${contextSource === "mine" ? "border-[#0b766d] bg-[#eef7f3]" : "border-[#cfe0dc] bg-white hover:border-[#78a69d]"}`} onClick={() => selectSource("mine")} type="button">
                <span className="flex items-start gap-3"><span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${contextSource === "mine" ? "bg-[#0b766d] text-white" : "bg-[#dcefeb] text-[#075d56]"}`}>{contextSource === "mine" ? <CheckIcon className="h-5 w-5" /> : <ScenarioIcon className="h-5 w-5" type="group" />}</span><span><span className="block font-extrabold text-[#0b2e2a]">Use my project</span><span className="mt-1 block text-sm leading-5 text-[#59706e]">Start empty and add only what feels relevant.</span>{contextSource === "mine" ? <span className="mt-2 block text-xs font-extrabold uppercase tracking-[0.08em] text-[#075d56]">Selected</span> : null}</span></span>
              </button>
              <button aria-pressed={contextSource === "sample"} className={`min-h-28 rounded-2xl border p-4 text-left transition-colors ${contextSource === "sample" ? "border-[#b85f14] bg-[#fff7e8]" : "border-[#cfe0dc] bg-white hover:border-[#d6a462]"}`} onClick={() => selectSource("sample")} type="button">
                <span className="flex items-start gap-3"><span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${contextSource === "sample" ? "bg-[#b85f14] text-white" : "bg-[#ffe7c0] text-[#9a5011]"}`}>{contextSource === "sample" ? <CheckIcon className="h-5 w-5" /> : <SparkIcon className="h-5 w-5" />}</span><span><span className="block font-extrabold text-[#0b2e2a]">Try the sample project</span><span className="mt-1 block text-sm leading-5 text-[#59706e]">Load a missed-deadline example for a faster demo.</span>{contextSource === "sample" ? <span className="mt-2 block text-xs font-extrabold uppercase tracking-[0.08em] text-[#9a5011]">Selected</span> : null}</span></span>
              </button>
            </div>
          </fieldset>

          {Object.keys(errors).length > 0 ? <div aria-labelledby="group-setup-error-title" className="mb-6 rounded-2xl border border-[#e7a6a0] bg-[#fff1ef] p-4" ref={errorRef} role="alert" tabIndex={-1}><h2 className="font-extrabold text-[#8f1f17]" id="group-setup-error-title">Please complete the highlighted fields.</h2></div> : null}

          <div className="grid gap-5 sm:grid-cols-2">
            {fields.map(({ key, label, help, textarea, maxLength }, index) => {
              const inputId = `group-${key}`;
              const errorId = `${inputId}-error`;
              const helpId = `${inputId}-help`;
              const shared = { "aria-describedby": errors[key] ? errorId : help ? helpId : undefined, "aria-invalid": Boolean(errors[key]), id: inputId, maxLength, onBlur: () => validateField(key), onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => update(key, event.target.value), value: context[key] };
              return <div className={index < 2 ? "" : "sm:col-span-2"} key={key}><label className="field-label" htmlFor={inputId}>{label}</label>{textarea ? <textarea {...shared} className="text-area" /> : <input {...shared} className="text-field" />}{errors[key] ? <p className="field-error" id={errorId}>{errors[key]}</p> : help ? <p className="field-help" id={helpId}>{help}</p> : null}</div>;
            })}
            <div className="sm:col-span-2"><label className="field-label" htmlFor="group-concern">What worries you most? <span className="font-normal text-[#536461]">Optional</span></label><textarea className="text-area !min-h-24" id="group-concern" maxLength={700} onChange={(event) => update("concern", event.target.value)} value={context.concern} /><p className="field-help">For example: sounding controlling, creating tension, losing face, or being blamed.</p></div>
          </div>

          <div className="mt-8 flex flex-col-reverse gap-3 border-t border-[#e4eeeb] pt-6 sm:flex-row sm:items-center sm:justify-between"><p className="text-xs leading-5 text-[#6a7775]">Avoid sharing student IDs, private contact details, or sensitive personal information.</p><button className="button-primary shrink-0" type="submit">See group guidance <ArrowRightIcon className="h-5 w-5" /></button></div>
        </form>
      </div>
    </section>
  );
}
