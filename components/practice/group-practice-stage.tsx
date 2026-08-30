"use client";

import { FormEvent, KeyboardEvent, useEffect, useRef, useState } from "react";
import { ArrowLeftIcon, ArrowRightIcon, MessageIcon, SparkIcon } from "@/components/icons";
import type { GroupPracticeContext, GroupPracticeMessage } from "@/types/group-practice";

type Props = {
  context: GroupPracticeContext;
  messages: GroupPracticeMessage[];
  isSending: boolean;
  isFinishing: boolean;
  notice: string | null;
  onBack: () => void;
  onSend: (message: string) => Promise<void>;
  onFinish: () => Promise<void>;
};

export function GroupPracticeStage({ context, messages, isSending, isFinishing, notice, onBack, onSend, onFinish }: Props) {
  const [draft, setDraft] = useState("");
  const [showHints, setShowHints] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const userTurns = messages.filter((message) => message.role === "user").length;

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }); }, [messages, isSending]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    const message = draft.trim();
    if (!message || isSending) return;
    setDraft("");
    setShowHints(false);
    await onSend(message);
  }

  function handleComposerKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key !== "Enter" || event.shiftKey || event.nativeEvent.isComposing) return;
    event.preventDefault();
    event.currentTarget.form?.requestSubmit();
  }

  const hints = [
    "I want us to finish this well, and I’d like to clarify…",
    "I noticed that [specific task or deadline]…",
    "Could we agree on who will own… by…?",
  ];

  return (
    <section className="page-shell py-7 sm:py-10">
      <div className="grid min-w-0 gap-6 lg:grid-cols-[290px_minmax(0,1fr)]">
        <aside className="min-w-0 space-y-4 lg:sticky lg:top-5 lg:self-start">
          <div className="card p-5"><p className="text-xs font-extrabold uppercase tracking-[0.1em] text-[#0b766d]">Conversation goal</p><p className="mt-3 text-sm font-bold leading-6 text-[#234a46] [overflow-wrap:anywhere]">{context.goal}</p><dl className="mt-5 space-y-4 border-t border-[#e4eeeb] pt-5 text-sm"><div><dt className="font-extrabold text-[#0b2e2a]">Scenario</dt><dd className="mt-1 text-[#59706e]">Group Project Conflict</dd></div><div><dt className="font-extrabold text-[#0b2e2a]">Your role</dt><dd className="mt-1 text-[#59706e] [overflow-wrap:anywhere]">{context.role}</dd></div><div><dt className="font-extrabold text-[#0b2e2a]">Teammate replies</dt><dd className="mt-1 text-[#59706e]">English</dd></div></dl></div>
          <div className="rounded-3xl border border-[#f0d09f] bg-[#fff7e8] p-5"><div className="flex gap-3"><SparkIcon className="mt-0.5 h-5 w-5 shrink-0 text-[#b85f14]" /><div><p className="text-sm font-extrabold text-[#69401b]">Discuss work, impact, and next action</p><p className="mt-1 text-xs leading-5 text-[#79502c]">You do not need to diagnose the teammate or make your wording perfect.</p></div></div></div>
          <button className="button-quiet w-full !justify-start" onClick={onBack} type="button"><ArrowLeftIcon className="h-4 w-4" /> Back to context</button>
        </aside>

        <div className="card flex min-h-[680px] min-w-0 flex-col overflow-hidden !rounded-[28px]">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e4eeeb] px-5 py-4 sm:px-7"><div className="flex items-center gap-3"><span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#dcefeb] text-[#075d56]"><MessageIcon className="h-5 w-5" /></span><div className="min-w-0"><h1 className="text-sm font-extrabold text-[#0b2e2a]" tabIndex={-1}>Practice Teammate</h1><p className="text-xs font-semibold text-[#6a7775] [overflow-wrap:anywhere]">{context.course} · Group conversation</p></div></div><span className="flex items-center gap-2 rounded-full bg-[#eef7f3] px-3 py-1.5 text-xs font-extrabold text-[#075d56]"><span className="h-2 w-2 rounded-full bg-[#23a094]" /> Practice room</span></div>
          {notice ? <div className="border-b border-[#ead8bc] bg-[#fff8eb] px-5 py-2.5 text-center text-xs font-semibold text-[#79502c]" role="status">{notice}</div> : null}
          <div aria-live="polite" className="flex-1 space-y-5 overflow-y-auto bg-[#fcfdfc] px-4 py-6 sm:px-7 sm:py-8">
            {messages.map((message, index) => <div className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`} key={`${message.role}-${index}`}>{message.role === "assistant" ? <span className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#dcefeb] text-xs font-extrabold text-[#075d56]">PT</span> : null}<div className={`max-w-[84%] whitespace-pre-wrap px-4 py-3 text-sm leading-7 [overflow-wrap:anywhere] sm:max-w-[72%] ${message.role === "user" ? "rounded-[18px_18px_5px_18px] bg-[#0b766d] text-white" : "rounded-[18px_18px_18px_5px] border border-[#dbe8e4] bg-white text-[#234a46]"}`}>{message.content}</div></div>)}
            {isSending ? <div className="flex items-center gap-3"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#dcefeb] text-xs font-extrabold text-[#075d56]">PT</span><span aria-label="Practice teammate is typing" className="flex h-11 items-center gap-1 rounded-[18px_18px_18px_5px] border border-[#dbe8e4] bg-white px-4">{[0, 1, 2].map((dot) => <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#7ca39c]" key={dot} style={{ animationDelay: `${dot * 150}ms` }} />)}</span></div> : null}
            <div ref={endRef} />
          </div>
          <div className="border-t border-[#e4eeeb] bg-white p-4 sm:p-6">
            {showHints ? <div className="mb-4 rounded-2xl border border-[#cfe0dc] bg-[#eef7f3] p-4"><p className="text-xs font-extrabold uppercase tracking-[0.09em] text-[#075d56]">Choose a start, then finish in your own words</p><div className="mt-3 flex flex-wrap gap-2">{hints.map((hint) => <button className="min-h-11 rounded-xl border border-[#adc9c3] bg-white px-3 py-2 text-left text-xs font-bold leading-5 text-[#234a46] hover:border-[#0b766d]" key={hint} onClick={() => setDraft(hint)} type="button">{hint}</button>)}</div></div> : null}
            <form onSubmit={submit}><label className="sr-only" htmlFor="group-practice-message">Your response to the group member</label><textarea aria-describedby="group-practice-composer-help" className="text-area !min-h-24" disabled={isSending || isFinishing} id="group-practice-message" maxLength={2000} onChange={(event) => setDraft(event.target.value)} onKeyDown={handleComposerKeyDown} placeholder="Type what you would say to your teammate…" value={draft} /><p className="mt-2 text-xs text-[#6a7775]" id="group-practice-composer-help">Enter to send · Shift + Enter for a new line</p><div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-center gap-1"><button className="button-quiet !px-3 text-sm" onClick={() => setShowHints((shown) => !shown)} type="button"><SparkIcon className="h-4 w-4" /> I’m stuck</button><span className="text-xs text-[#536461]">{draft.length}/2000</span></div><button className="button-primary !min-h-11" disabled={!draft.trim() || isSending || isFinishing} type="submit">Send response <ArrowRightIcon className="h-4 w-4" /></button></div></form>
            <div className="mt-4 flex flex-col gap-3 border-t border-[#edf2f0] pt-4 sm:flex-row sm:items-center sm:justify-between"><p className="text-xs leading-5 text-[#6a7775]">Finish after 1–3 turns when you have proposed a next step.</p><button className="button-secondary !min-h-11 text-sm" disabled={userTurns < 1 || isSending || isFinishing} onClick={onFinish} type="button">{isFinishing ? "Analyzing…" : "Finish & see feedback"}</button></div>
          </div>
        </div>
      </div>
    </section>
  );
}
