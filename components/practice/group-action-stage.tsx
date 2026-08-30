"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowLeftIcon, CheckIcon, CopyIcon } from "@/components/icons";
import type { GroupFeedbackReport } from "@/types/group-practice";

function formatConversationPlan(plan: GroupFeedbackReport["conversation_plan"]) {
  return `OPENING\n${plan.opening}\n\nPOINTS TO RAISE\n${plan.points_to_raise.map((item, index) => `${index + 1}. ${item}`).join("\n")}\n\nQUESTIONS\n${plan.questions.map((item, index) => `${index + 1}. ${item}`).join("\n")}\n\nCLOSING\n${plan.closing}`;
}

function formatTaskDivision(tasks: GroupFeedbackReport["task_division"]) {
  return tasks.map((item, index) => `${index + 1}. ${item.owner}\nTask: ${item.task}\nDeadline: ${item.deadline}`).join("\n\n");
}

export function GroupActionStage({ report, mode, onBack, onRestart }: { report: GroupFeedbackReport; mode: "live" | "demo"; onBack: () => void; onRestart: () => void }) {
  const initialPlan = useMemo(() => formatConversationPlan(report.conversation_plan), [report]);
  const initialTasks = useMemo(() => formatTaskDivision(report.task_division), [report]);
  const [plan, setPlan] = useState(initialPlan);
  const [tasks, setTasks] = useState(initialTasks);
  const [message, setMessage] = useState(report.follow_up_message);
  const [copyStatus, setCopyStatus] = useState<string | null>(null);
  const demo = mode === "demo";

  async function copyActionKit() {
    try {
      await navigator.clipboard.writeText(`CONVERSATION PLAN\n${plan}\n\nTASK DIVISION\n${tasks}\n\nFOLLOW-UP MESSAGE\n${message}`);
      setCopyStatus("Action kit copied. Review names, tasks, and deadlines before you use it.");
      window.setTimeout(() => setCopyStatus(null), 3000);
    } catch {
      setCopyStatus("Copy was unavailable. Select the editable text manually.");
    }
  }

  return (
    <section className="page-shell py-10 sm:py-14">
      <div className="mx-auto max-w-[1040px]">
        <div className="text-center"><span className="eyebrow">{demo ? "Representative demo action kit" : "From conversation to coordination"}</span><h1 className="font-display mx-auto mt-5 max-w-[820px] text-4xl font-bold leading-tight text-[#0b2e2a] sm:text-5xl" tabIndex={-1}>{demo ? "Adapt these three artifacts to the agreement you actually reach." : "Turn the conversation into a plan everyone can check."}</h1><p className="mx-auto mt-5 max-w-[740px] text-lg leading-8 text-[#59706e]">Everything below is editable. Do not treat placeholders or proposed responsibilities as an agreement until the group reviews them.</p></div>
        <div className="mt-10 flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-xl font-extrabold text-[#0b2e2a]">Your group-project action kit</h2><p className="mt-1 text-sm text-[#6a7775]">Conversation plan · task division · follow-up message</p></div><button className="button-secondary !min-h-11 !px-4 text-sm" onClick={copyActionKit} type="button"><CopyIcon className="h-4 w-4" /> Copy all three</button></div>
        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          <article className="card overflow-hidden"><div className="border-b border-[#e4eeeb] px-5 py-4 sm:px-6"><p className="text-xs font-extrabold uppercase tracking-[0.1em] text-[#0b766d]">01 · Conversation plan</p><h2 className="mt-1 text-lg font-extrabold text-[#0b2e2a]">What to raise in the conversation</h2></div><label className="sr-only" htmlFor="group-conversation-plan">Editable conversation plan</label><textarea className="min-h-[440px] w-full resize-y border-0 bg-white px-5 py-6 font-mono text-sm leading-7 text-[#234a46] outline-none focus:bg-[#fcfdfc] sm:px-6" id="group-conversation-plan" maxLength={6000} onChange={(event) => setPlan(event.target.value)} value={plan} /></article>
          <article className="card overflow-hidden"><div className="border-b border-[#e4eeeb] px-5 py-4 sm:px-6"><p className="text-xs font-extrabold uppercase tracking-[0.1em] text-[#0b766d]">02 · Task division</p><h2 className="mt-1 text-lg font-extrabold text-[#0b2e2a]">Who owns what, by when</h2></div><label className="sr-only" htmlFor="group-task-division">Editable task division</label><textarea className="min-h-[440px] w-full resize-y border-0 bg-white px-5 py-6 font-mono text-sm leading-7 text-[#234a46] outline-none focus:bg-[#fcfdfc] sm:px-6" id="group-task-division" maxLength={6000} onChange={(event) => setTasks(event.target.value)} value={tasks} /></article>
          <article className="card overflow-hidden lg:col-span-2"><div className="border-b border-[#e4eeeb] px-5 py-4 sm:px-6"><p className="text-xs font-extrabold uppercase tracking-[0.1em] text-[#9a5011]">03 · Follow-up message</p><h2 className="mt-1 text-lg font-extrabold text-[#0b2e2a]">Recap the proposal and invite corrections</h2><p className="mt-1 text-xs text-[#6a7775]">Editable and copyable—never sent automatically</p></div><label className="sr-only" htmlFor="group-follow-up-message">Editable follow-up message</label><textarea className="min-h-[300px] w-full resize-y border-0 bg-white px-5 py-6 font-mono text-sm leading-7 text-[#234a46] outline-none focus:bg-[#fcfdfc] sm:px-6" id="group-follow-up-message" maxLength={3000} onChange={(event) => setMessage(event.target.value)} value={message} /></article>
        </div>
        <div aria-live="polite" className="mt-3 min-h-6 text-sm font-semibold text-[#075d56]">{copyStatus}</div>
        <aside className="mt-5 rounded-3xl bg-[#0b2e2a] p-6 text-white"><p className="text-xs font-extrabold uppercase tracking-[0.1em] text-[#8ed1c8]">Before you use this</p><ul className="mt-4 grid gap-4 text-sm leading-6 text-[#d6e9e5] md:grid-cols-3">{["Replace every placeholder with a real owner, task, and deadline.", "Ask the group to correct the written recap; do not imply agreement early.", "If the conflict persists, bring observable facts and the assignment guidance to the instructor."].map((tip) => <li className="flex gap-2.5" key={tip}><CheckIcon className="mt-1 h-4 w-4 shrink-0 text-[#8ed1c8]" /> {tip}</li>)}</ul></aside>
        <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between"><button className="button-secondary" onClick={onBack} type="button"><ArrowLeftIcon className="h-5 w-5" /> Back to feedback</button><div className="flex flex-col gap-3 sm:flex-row"><button className="button-secondary" onClick={onRestart} type="button">Practice again</button><Link className="button-primary" href="/practice">Done <CheckIcon className="h-5 w-5" /></Link></div></div>
      </div>
    </section>
  );
}
