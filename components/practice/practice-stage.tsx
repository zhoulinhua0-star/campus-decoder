"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { ArrowLeftIcon, ArrowRightIcon, MessageIcon, SparkIcon } from "@/components/icons";
import type { PracticeContext, PracticeMessage } from "@/types/practice";

type PracticeStageProps = {
  context: PracticeContext;
  messages: PracticeMessage[];
  isSending: boolean;
  isFinishing: boolean;
  notice: string | null;
  onBack: () => void;
  onSend: (message: string) => Promise<void>;
  onFinish: () => Promise<void>;
};

export function PracticeStage({ context, messages, isSending, isFinishing, notice, onBack, onSend, onFinish }: PracticeStageProps) {
  const [draft, setDraft] = useState("");
  const [showHints, setShowHints] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const chinese = context.preferredLanguage === "简体中文";
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

  const hints = [
    "Thanks for meeting with me. I’d like to understand your feedback on…",
    "Could we look at your comment about…?",
    "For my next essay, what would you recommend I focus on first?",
  ];

  return (
    <section className="page-shell py-7 sm:py-10">
      <div className="grid gap-6 lg:grid-cols-[290px_1fr]">
        <aside className="space-y-4 lg:sticky lg:top-5 lg:self-start">
          <div className="card p-5">
            <p className="text-xs font-extrabold uppercase tracking-[0.1em] text-[#0b766d]">{chinese ? "练习目标" : "Practice goal"}</p>
            <p className="mt-3 text-sm font-bold leading-6 text-[#234a46]">{context.goal}</p>
            <dl className="mt-5 space-y-4 border-t border-[#e4eeeb] pt-5 text-sm">
              <div><dt className="font-extrabold text-[#0b2e2a]">{chinese ? "场景" : "Scenario"}</dt><dd className="mt-1 text-[#59706e]">Office Hours</dd></div>
              <div><dt className="font-extrabold text-[#0b2e2a]">{chinese ? "课程" : "Course"}</dt><dd className="mt-1 text-[#59706e]">{context.course}</dd></div>
              <div><dt className="font-extrabold text-[#0b2e2a]">{chinese ? "教授回复" : "Professor replies"}</dt><dd className="mt-1 text-[#59706e]">English</dd></div>
            </dl>
          </div>
          <div className="rounded-3xl border border-[#f0d09f] bg-[#fff7e8] p-5">
            <div className="flex gap-3"><SparkIcon className="mt-0.5 h-5 w-5 shrink-0 text-[#b85f14]" /><div><p className="text-sm font-extrabold text-[#69401b]">{chinese ? "这是练习，不是测试" : "This is practice, not a test"}</p><p className="mt-1 text-xs leading-5 text-[#79502c]">{chinese ? "可以停顿、修改，也可以使用句子开头提示。" : "Pause, revise, or use a sentence starter whenever you need one."}</p></div></div>
          </div>
          <button className="button-quiet w-full !justify-start" onClick={onBack} type="button"><ArrowLeftIcon className="h-4 w-4" /> {chinese ? "返回语境解释" : "Back to context"}</button>
        </aside>

        <div className="card flex min-h-[680px] flex-col overflow-hidden !rounded-[28px]">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e4eeeb] px-5 py-4 sm:px-7">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#dcefeb] text-[#075d56]"><MessageIcon className="h-5 w-5" /></span>
              <div><h1 className="text-sm font-extrabold text-[#0b2e2a]">Professor Chen</h1><p className="text-xs font-semibold text-[#6a7775]">First-Year Writing · Office hours</p></div>
            </div>
            <span className="flex items-center gap-2 rounded-full bg-[#eef7f3] px-3 py-1.5 text-xs font-extrabold text-[#075d56]"><span className="h-2 w-2 rounded-full bg-[#23a094]" /> Practice room</span>
          </div>

          {notice ? <div className="border-b border-[#ead8bc] bg-[#fff8eb] px-5 py-2.5 text-center text-xs font-semibold text-[#79502c]" role="status">{notice}</div> : null}

          <div aria-live="polite" className="flex-1 space-y-5 overflow-y-auto bg-[#fcfdfc] px-4 py-6 sm:px-7 sm:py-8">
            {messages.map((message, index) => (
              <div className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`} key={`${message.role}-${index}`}>
                {message.role === "assistant" ? <span className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#dcefeb] text-xs font-extrabold text-[#075d56]">PC</span> : null}
                <div className={`max-w-[84%] px-4 py-3 text-sm leading-7 sm:max-w-[72%] ${message.role === "user" ? "rounded-[18px_18px_5px_18px] bg-[#0b766d] text-white" : "rounded-[18px_18px_18px_5px] border border-[#dbe8e4] bg-white text-[#234a46]"}`}>
                  {message.content}
                </div>
              </div>
            ))}
            {isSending ? (
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#dcefeb] text-xs font-extrabold text-[#075d56]">PC</span>
                <span className="flex h-11 items-center gap-1 rounded-[18px_18px_18px_5px] border border-[#dbe8e4] bg-white px-4" aria-label="Professor is typing">
                  {[0, 1, 2].map((dot) => <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#7ca39c]" key={dot} style={{ animationDelay: `${dot * 150}ms` }} />)}
                </span>
              </div>
            ) : null}
            <div ref={endRef} />
          </div>

          <div className="border-t border-[#e4eeeb] bg-white p-4 sm:p-6">
            {showHints ? (
              <div className="mb-4 rounded-2xl border border-[#cfe0dc] bg-[#eef7f3] p-4">
                <p className="text-xs font-extrabold uppercase tracking-[0.09em] text-[#075d56]">{chinese ? "选择一个句子开头，继续用自己的话完成" : "Choose a start, then finish in your own words"}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {hints.map((hint) => <button className="min-h-11 rounded-xl border border-[#adc9c3] bg-white px-3 py-2 text-left text-xs font-bold leading-5 text-[#234a46] hover:border-[#0b766d]" key={hint} onClick={() => setDraft(hint)} type="button">{hint}</button>)}
                </div>
              </div>
            ) : null}
            <form onSubmit={submit}>
              <label className="sr-only" htmlFor="practice-message">Your response to the professor</label>
              <textarea className="text-area !min-h-24" disabled={isSending || isFinishing} id="practice-message" maxLength={2000} onChange={(event) => setDraft(event.target.value)} placeholder="Type what you would say to the professor…" value={draft} />
              <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-1">
                  <button className="button-quiet !px-3 text-sm" onClick={() => setShowHints((shown) => !shown)} type="button"><SparkIcon className="h-4 w-4" /> {chinese ? "我卡住了" : "I’m stuck"}</button>
                  <span className="text-xs text-[#86928f]">{draft.length}/2000</span>
                </div>
                <button className="button-primary !min-h-11" disabled={!draft.trim() || isSending || isFinishing} type="submit">{chinese ? "发送回复" : "Send response"} <ArrowRightIcon className="h-4 w-4" /></button>
              </div>
            </form>
            <div className="mt-4 flex flex-col gap-3 border-t border-[#edf2f0] pt-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs leading-5 text-[#6a7775]">{chinese ? "完成 1–3 轮后即可获得反馈。" : "Finish after 1–3 turns when you feel ready."}</p>
              <button className="button-secondary !min-h-11 text-sm" disabled={userTurns < 1 || isSending || isFinishing} onClick={onFinish} type="button">{isFinishing ? (chinese ? "正在分析…" : "Analyzing…") : (chinese ? "结束练习并查看反馈" : "Finish & see feedback")}</button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
