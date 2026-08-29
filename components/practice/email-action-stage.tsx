"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeftIcon, CheckIcon, CopyIcon } from "@/components/icons";
import type { EmailFeedbackReport, EmailPracticeContext } from "@/types/email-practice";

export function EmailActionStage({ context, report, mode, onBack, onRestart }: { context: EmailPracticeContext; report: EmailFeedbackReport; mode: "live" | "demo"; onBack: () => void; onRestart: () => void }) {
  const [subject, setSubject] = useState(report.subject_line);
  const [body, setBody] = useState(report.final_email);
  const [copyStatus, setCopyStatus] = useState<string | null>(null);
  const demo = mode === "demo";

  async function copyEmail() {
    try {
      await navigator.clipboard.writeText(`To: ${context.recipient}\nSubject: ${subject}\n\n${body}`);
      setCopyStatus("Email copied. Review the recipient and details before sending.");
      window.setTimeout(() => setCopyStatus(null), 3000);
    } catch {
      setCopyStatus("Copy was unavailable. Select the subject and email text manually.");
    }
  }

  return (
    <section className="page-shell py-10 sm:py-14">
      <div className="mx-auto max-w-[980px]">
        <div className="text-center"><span className="eyebrow">{demo ? "Representative Demo action" : "From revision to action"}</span><h1 className="font-display mx-auto mt-5 max-w-[780px] text-4xl font-bold leading-tight text-[#0b2e2a] sm:text-5xl" tabIndex={-1}>{demo ? "Review your editable email before you use it." : "Your email is ready for your final review."}</h1><p className="mx-auto mt-5 max-w-[700px] text-lg leading-8 text-[#59706e]">{demo ? "The body below is your own revision. Demo mode does not claim that fixed coaching created a personalized final answer." : "This is still your message. Check every name, fact, date, attachment, and request before you send it."}</p></div>

        <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_270px]">
          <div className="card overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e4eeeb] px-5 py-4 sm:px-7"><div><h2 className="text-lg font-extrabold text-[#0b2e2a]">Final email</h2><p className="mt-0.5 text-xs text-[#6a7775]">Editable and copyable—never sent automatically</p></div><button className="button-secondary !min-h-11 !px-4 text-sm" onClick={copyEmail} type="button"><CopyIcon className="h-4 w-4" /> Copy email</button></div>
            <div className="grid gap-5 p-5 sm:p-7"><div><label className="field-label" htmlFor="final-email-recipient">To</label><input className="text-field bg-[#f5f7f6]" id="final-email-recipient" readOnly value={context.recipient} /></div><div><label className="field-label" htmlFor="final-email-subject">Subject</label><input className="text-field" id="final-email-subject" maxLength={200} onChange={(event) => setSubject(event.target.value)} value={subject} /></div><div><label className="field-label" htmlFor="final-email-body">Email body</label><textarea className="text-area min-h-[440px] font-mono text-sm leading-7" id="final-email-body" maxLength={5000} onChange={(event) => setBody(event.target.value)} value={body} /></div><div aria-live="polite" className="min-h-6 text-sm font-semibold text-[#075d56]">{copyStatus}</div></div>
          </div>

          <aside className="space-y-4"><div className="rounded-3xl bg-[#0b2e2a] p-6 text-white"><p className="text-xs font-extrabold uppercase tracking-[0.1em] text-[#8ed1c8]">Before you send</p><ul className="mt-4 space-y-4 text-sm leading-6 text-[#d6e9e5]">{["Confirm the recipient, course, names, and dates.", "Attach or link anything the email mentions.", "Read the request once: can the professor answer it directly?"].map((tip) => <li className="flex gap-2.5" key={tip}><CheckIcon className="mt-1 h-4 w-4 shrink-0 text-[#8ed1c8]" /> {tip}</li>)}</ul></div><div className="rounded-3xl border border-[#f0d09f] bg-[#fff8eb] p-5 text-sm leading-6 text-[#69401b]">Campus Decoder never sends the email. You decide what to change, copy, and send.</div></aside>
        </div>

        <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between"><button className="button-secondary" onClick={onBack} type="button"><ArrowLeftIcon className="h-5 w-5" /> Back to feedback</button><div className="flex flex-col gap-3 sm:flex-row"><button className="button-secondary" onClick={onRestart} type="button">Practice again</button><Link className="button-primary" href="/">Done <CheckIcon className="h-5 w-5" /></Link></div></div>
      </div>
    </section>
  );
}
