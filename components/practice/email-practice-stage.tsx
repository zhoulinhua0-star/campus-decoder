"use client";

import { FormEvent, useRef, useState } from "react";
import { ArrowLeftIcon, ArrowRightIcon, ScenarioIcon, SparkIcon } from "@/components/icons";
import type { EmailHint, EmailPracticeContext } from "@/types/email-practice";

type EmailPracticeStageProps = {
  context: EmailPracticeContext;
  draft: string;
  hint: EmailHint | null;
  hintMode: "live" | "demo" | null;
  isFinishing: boolean;
  isLoadingHint: boolean;
  notice: string | null;
  onBack: () => void;
  onChange: (draft: string) => void;
  onFinish: () => Promise<void>;
  onRequestHint: () => Promise<void>;
};

export function EmailPracticeStage({ context, draft, hint, hintMode, isFinishing, isLoadingHint, notice, onBack, onChange, onFinish, onRequestHint }: EmailPracticeStageProps) {
  const [error, setError] = useState<string | null>(null);
  const errorRef = useRef<HTMLDivElement>(null);
  const hasChanged = draft.trim() !== context.existingDraft.trim();

  function updateDraft(value: string) {
    onChange(value);
    if (error) setError(null);
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (draft.trim().length < 10) {
      setError("Keep at least a short greeting, purpose, and request in your draft.");
      requestAnimationFrame(() => errorRef.current?.focus());
      return;
    }
    if (!hasChanged) {
      setError("Make at least one change in your own words before requesting feedback.");
      requestAnimationFrame(() => errorRef.current?.focus());
      return;
    }
    await onFinish();
  }

  return (
    <section className="page-shell py-7 sm:py-10">
      <div className="grid min-w-0 gap-6 lg:grid-cols-[290px_minmax(0,1fr)]">
        <aside className="min-w-0 space-y-4 lg:sticky lg:top-5 lg:self-start">
          <div className="card p-5"><p className="text-xs font-extrabold uppercase tracking-[0.1em] text-[#0b766d]">Email purpose</p><p className="mt-3 text-sm font-bold leading-6 text-[#234a46] [overflow-wrap:anywhere]">{context.purpose}</p><dl className="mt-5 space-y-4 border-t border-[#e4eeeb] pt-5 text-sm"><div><dt className="font-extrabold text-[#0b2e2a]">To</dt><dd className="mt-1 text-[#59706e] [overflow-wrap:anywhere]">{context.recipient}</dd></div><div><dt className="font-extrabold text-[#0b2e2a]">Course</dt><dd className="mt-1 text-[#59706e] [overflow-wrap:anywhere]">{context.course}</dd></div><div><dt className="font-extrabold text-[#0b2e2a]">Your job</dt><dd className="mt-1 text-[#59706e]">Revise before you review</dd></div></dl></div>
          <div className="rounded-3xl border border-[#f0d09f] bg-[#fff7e8] p-5"><div className="flex gap-3"><SparkIcon className="mt-0.5 h-5 w-5 shrink-0 text-[#b85f14]" /><div><p className="text-sm font-extrabold text-[#69401b]">The hint will not write it for you</p><p className="mt-1 text-xs leading-5 text-[#79502c]">It points to one revision target and gives a short sentence starter you can adapt or ignore.</p></div></div></div>
          <button className="button-quiet w-full !justify-start" onClick={onBack} type="button"><ArrowLeftIcon className="h-4 w-4" /> Back to context</button>
        </aside>

        <form className="card min-w-0 overflow-hidden !rounded-[28px]" noValidate onSubmit={submit}>
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e4eeeb] px-5 py-4 sm:px-7"><div className="flex items-center gap-3"><span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#dcefeb] text-[#075d56]"><ScenarioIcon className="h-5 w-5" type="email" /></span><div><h1 className="text-lg font-extrabold text-[#0b2e2a]" tabIndex={-1}>Revise your email</h1><p className="text-xs font-semibold text-[#6a7775]">Your wording stays editable</p></div></div><span className={`rounded-full px-3 py-1 text-xs font-extrabold ${hasChanged ? "bg-[#dcefeb] text-[#075d56]" : "bg-[#f3f4f3] text-[#536461]"}`}>{hasChanged ? "Revision started" : "Original draft"}</span></div>

          <div className="p-5 sm:p-7">
            {notice ? <div className="mb-5 rounded-2xl border border-[#ead8bc] bg-[#fff8eb] px-4 py-3 text-sm font-semibold leading-6 text-[#79502c]" role="status">{notice}</div> : null}
            {error ? <div aria-labelledby="email-practice-error" className="mb-5 rounded-2xl border border-[#e7a6a0] bg-[#fff1ef] p-4" ref={errorRef} role="alert" tabIndex={-1}><h2 className="font-extrabold text-[#8f1f17]" id="email-practice-error">{error}</h2></div> : null}

            <label className="field-label" htmlFor="email-revision">Your revised email</label>
            <p className="mb-3 text-sm leading-6 text-[#59706e]" id="email-revision-help">Keep your voice. Aim to make the purpose, necessary context, and requested next step easy to find.</p>
            <textarea aria-describedby="email-revision-help" className="text-area min-h-[360px] font-mono text-sm leading-7" id="email-revision" maxLength={4000} onChange={(event) => updateDraft(event.target.value)} value={draft} />
            <div className="mt-2 flex justify-end text-xs font-semibold text-[#6a7775]">{draft.length}/4000</div>

            <div className="mt-6 min-h-48 rounded-3xl border border-[#cfe0dc] bg-[#eef7f3] p-5 sm:p-6" role="status">
              {isLoadingHint ? <div><p className="text-xs font-extrabold uppercase tracking-[0.1em] text-[#0b766d]">One focused hint</p><h2 className="mt-3 text-lg font-extrabold text-[#0b2e2a]">Looking for the highest-value next revision…</h2></div> : hint ? <div><div className="flex flex-wrap items-center justify-between gap-3"><p className="text-xs font-extrabold uppercase tracking-[0.1em] text-[#0b766d]">One focused hint</p>{hintMode ? <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-[#075d56]">{hintMode === "live" ? "Live AI hint" : "Guided Demo hint"}</span> : null}</div><h2 className="mt-3 text-xl font-extrabold text-[#0b2e2a]">Focus: {hint.focus}</h2><p className="mt-2 text-sm leading-7 text-[#45625e]">{hint.observation}</p><div className="mt-4 rounded-2xl bg-white p-4"><p className="text-xs font-extrabold uppercase tracking-[0.08em] text-[#536461]">Your revision prompt</p><p className="mt-2 text-sm font-semibold leading-6 text-[#234a46]">{hint.revision_prompt}</p><p className="mt-3 text-sm leading-6 text-[#59706e]"><span className="font-extrabold text-[#0b2e2a]">Optional starter:</span> “{hint.sentence_starter}”</p></div></div> : <div><p className="text-xs font-extrabold uppercase tracking-[0.1em] text-[#0b766d]">One focused hint</p><h2 className="mt-3 text-lg font-extrabold text-[#0b2e2a]">Ask for direction when you need it.</h2><p className="mt-2 text-sm leading-7 text-[#59706e]">The hint will identify one next move without replacing your draft.</p></div>}
            </div>

            <details className="mt-5 rounded-2xl border border-[#e4eeeb] bg-[#f8faf9] p-4"><summary className="min-h-11 cursor-pointer py-2 text-sm font-extrabold text-[#345652]">Compare with my original draft</summary><p className="mt-3 whitespace-pre-wrap border-t border-[#e4eeeb] pt-4 font-mono text-sm leading-7 text-[#59706e] [overflow-wrap:anywhere]">{context.existingDraft}</p></details>
          </div>

          <div className="flex flex-col gap-3 border-t border-[#e4eeeb] bg-[#fcfdfc] px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-7"><button className="button-secondary" disabled={isLoadingHint || isFinishing || draft.trim().length < 10} onClick={onRequestHint} type="button"><SparkIcon className="h-5 w-5" /> {hint ? "Get another hint" : "Get one revision hint"}</button><button className="button-primary" disabled={isLoadingHint || isFinishing} type="submit">{isFinishing ? "Reviewing your revision…" : "Review my revision"} <ArrowRightIcon className="h-5 w-5" /></button></div>
        </form>
      </div>
    </section>
  );
}
