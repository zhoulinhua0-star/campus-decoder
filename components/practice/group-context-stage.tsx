import { ArrowLeftIcon, ArrowRightIcon, ScenarioIcon, SparkIcon } from "@/components/icons";
import type { GroupContextGuidance, GroupPracticeContext } from "@/types/group-practice";

type Props = { context: GroupPracticeContext; guidance: GroupContextGuidance | null; isLoading: boolean; mode: "live" | "demo" | null; notice: string | null; onBack: () => void; onContinue: () => void };

export function GroupContextStage({ context, guidance, isLoading, mode, notice, onBack, onContinue }: Props) {
  const cards = guidance ? [
    { label: "What you reported", title: "Start with the observable conflict", body: guidance.literal_source, accent: "teal" },
    { label: "Task division", title: "Ownership works best when it is explicit", body: guidance.task_division_context, accent: "teal" },
    { label: "Following up", title: "A reminder can support the shared work", body: guidance.follow_up_context, accent: "amber" },
    { label: "Expressing disagreement", title: "Direct does not have to mean personal", body: guidance.disagreement_context, accent: "amber" },
    { label: "What remains uncertain", title: "Do not fill the gap with a motive", body: guidance.uncertainty, accent: "teal" },
    { label: "Constructive next move", title: "Turn the conflict into one decision", body: guidance.constructive_next_move, accent: "amber" },
  ] : [];

  return (
    <section className="page-shell py-10 sm:py-14">
      <div className="mx-auto max-w-[1040px]">
        <div className="max-w-[780px]"><span className="eyebrow">Decode the collaboration norm</span><h1 className="font-display mt-5 text-4xl font-bold leading-tight text-[#0b2e2a] sm:text-5xl" tabIndex={-1}>Separate the work problem from the story about the person.</h1><p className="mt-5 text-lg leading-8 text-[#59706e]">Good coordination makes ownership, deadlines, and disagreement discussable. It cannot tell us what a teammate privately intended.</p></div>
        {notice ? <div className="mt-6 rounded-2xl border border-[#ead8bc] bg-[#fff8eb] px-4 py-3 text-sm font-semibold leading-6 text-[#79502c]" role="status">{notice}</div> : null}
        {isLoading ? <div className="mt-8 grid gap-5 md:grid-cols-2"><div className="card min-h-48 animate-pulse bg-[#f8faf9] p-6" /><div className="card min-h-48 animate-pulse bg-[#f8faf9] p-6" /></div> : null}
        {!isLoading && guidance ? <div className="mt-8 grid gap-5 md:grid-cols-2">{cards.map((card) => { const amber = card.accent === "amber"; return <article className={`min-w-0 rounded-3xl border p-6 sm:p-7 ${amber ? "border-[#f0d09f] bg-[#fff7e8]" : "border-[#cfe0dc] bg-white"}`} key={card.label}><div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${amber ? "bg-[#ffe7c0] text-[#9a5011]" : "bg-[#dcefeb] text-[#075d56]"}`}>{amber ? <SparkIcon className="h-5 w-5" /> : <ScenarioIcon className="h-5 w-5" type="group" />}</div><p className={`mt-5 text-xs font-extrabold uppercase tracking-[0.1em] ${amber ? "text-[#9a5011]" : "text-[#0b766d]"}`}>{card.label}</p><h2 className="mt-2 text-lg font-extrabold leading-7 text-[#0b2e2a]">{card.title}</h2><p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-[#59706e] [overflow-wrap:anywhere]">{card.body}</p></article>; })}</div> : null}
        {!isLoading && guidance ? <div className="mt-8 rounded-3xl bg-[#0b2e2a] p-6 text-white sm:flex sm:items-center sm:justify-between sm:gap-8"><div className="min-w-0"><p className="text-xs font-extrabold uppercase tracking-[0.1em] text-[#8ed1c8]">Your collaboration goal</p><p className="mt-2 max-w-[650px] font-semibold leading-7 [overflow-wrap:anywhere]">{context.goal}</p></div><div className="mt-4 flex min-w-0 flex-col items-start gap-2 sm:mt-0 sm:max-w-[40%] sm:items-end"><span className="block max-w-full rounded-3xl bg-white/10 px-4 py-2 text-sm font-bold text-[#d6e9e5] [overflow-wrap:anywhere]">Your role: {context.role}</span>{mode ? <span className="text-xs font-bold text-[#8ed1c8]">{mode === "live" ? "Live AI decode" : "Grounded Demo decode"}</span> : null}</div></div> : null}
        <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between"><button className="button-secondary" onClick={onBack} type="button"><ArrowLeftIcon className="h-5 w-5" /> Edit setup</button><button className="button-primary" disabled={isLoading || !guidance} onClick={onContinue} type="button">Start teammate practice <ArrowRightIcon className="h-5 w-5" /></button></div>
      </div>
    </section>
  );
}
