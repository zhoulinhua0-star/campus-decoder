import { ArrowLeftIcon, ArrowRightIcon, ScenarioIcon, SparkIcon } from "@/components/icons";
import type { EmailContextGuidance, EmailPracticeContext } from "@/types/email-practice";

type EmailContextStageProps = {
  context: EmailPracticeContext;
  guidance: EmailContextGuidance | null;
  isLoading: boolean;
  mode: "live" | "demo" | null;
  notice: string | null;
  onBack: () => void;
  onContinue: () => void;
};

export function EmailContextStage({ context, guidance, isLoading, mode, notice, onBack, onContinue }: EmailContextStageProps) {
  const cards = guidance ? [
    { label: "Literal draft", title: "Start with the words you actually wrote.", body: guidance.literal_source, accent: "teal" },
    { label: "Campus context", title: "Make four details easy to find.", body: guidance.campus_context, accent: "amber" },
    { label: "What remains uncertain", title: "Do not predict the professor’s response.", body: guidance.uncertainty, accent: "teal" },
    { label: "Constructive next move", title: "Choose one revision target.", body: guidance.constructive_next_move, accent: "amber" },
  ] as const : [];

  return (
    <section className="page-shell py-10 sm:py-14">
      <div className="mx-auto max-w-[960px]">
        <div className="text-center"><span className="eyebrow">Decode the email</span><h1 className="font-display mx-auto mt-5 max-w-[780px] text-4xl font-bold leading-tight text-[#0b2e2a] sm:text-5xl" tabIndex={-1}>Help the professor understand the purpose and the next step.</h1><p className="mx-auto mt-5 max-w-[720px] text-lg leading-8 text-[#59706e]">This guidance explains common campus email expectations without guessing how this professor will respond.</p></div>
        {notice ? <div className="mt-7 rounded-2xl border border-[#ead8bc] bg-[#fff8eb] px-4 py-3 text-sm font-semibold leading-6 text-[#79502c]" role="status">{notice}</div> : null}
        {isLoading ? <div className="mt-10 min-h-44 rounded-3xl border border-[#cfe0dc] bg-white p-8 text-center" role="status"><div aria-hidden="true" className="mx-auto h-11 w-11 animate-pulse rounded-2xl bg-[#dcefeb]" /><h2 className="mt-5 text-lg font-extrabold text-[#0b2e2a]">Reading the draft in context…</h2><p className="mx-auto mt-2 max-w-[560px] text-sm leading-6 text-[#59706e]">We are separating your words, common campus norms, uncertainty, and one next move.</p></div> : <div className="mt-10 grid gap-4 md:grid-cols-2">{cards.map((card) => { const amber = card.accent === "amber"; return <article className={`min-w-0 rounded-3xl border p-6 sm:p-7 ${amber ? "border-[#f0d09f] bg-[#fff7e8]" : "border-[#cfe0dc] bg-white"}`} key={card.label}><div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${amber ? "bg-[#ffe7c0] text-[#9a5011]" : "bg-[#dcefeb] text-[#075d56]"}`}>{amber ? <SparkIcon className="h-5 w-5" /> : <ScenarioIcon className="h-5 w-5" type="email" />}</div><p className={`mt-5 text-xs font-extrabold uppercase tracking-[0.1em] ${amber ? "text-[#9a5011]" : "text-[#0b766d]"}`}>{card.label}</p><h2 className="mt-2 text-lg font-extrabold leading-7 text-[#0b2e2a]">{card.title}</h2><p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-[#59706e] [overflow-wrap:anywhere]">{card.body}</p></article>; })}</div>}
        {!isLoading && guidance ? <div className="mt-8 rounded-3xl bg-[#0b2e2a] p-6 text-white sm:flex sm:items-center sm:justify-between sm:gap-8"><div className="min-w-0"><p className="text-xs font-extrabold uppercase tracking-[0.1em] text-[#8ed1c8]">Your email purpose</p><p className="mt-2 max-w-[650px] font-semibold leading-7 [overflow-wrap:anywhere]">{context.purpose}</p></div><div className="mt-4 flex min-w-0 flex-col items-start gap-2 sm:mt-0 sm:max-w-[40%] sm:items-end"><span className="block max-w-full rounded-3xl bg-white/10 px-4 py-2 text-sm font-bold text-[#d6e9e5] [overflow-wrap:anywhere]">To {context.recipient}</span>{mode ? <span className="text-xs font-bold text-[#8ed1c8]">{mode === "live" ? "Live AI decode" : "Grounded Demo decode"}</span> : null}</div></div> : null}
        <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between"><button className="button-secondary" onClick={onBack} type="button"><ArrowLeftIcon className="h-5 w-5" /> Edit setup</button><button className="button-primary" disabled={isLoading || !guidance} onClick={onContinue} type="button">Revise my draft <ArrowRightIcon className="h-5 w-5" /></button></div>
      </div>
    </section>
  );
}
