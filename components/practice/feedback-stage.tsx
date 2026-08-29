import { ArrowRightIcon, CheckIcon, SparkIcon } from "@/components/icons";
import type { FeedbackReport } from "@/types/practice";

const ratingKeys = [
  ["clarity", "Clarity"],
  ["tone", "Tone"],
  ["specificity", "Specificity"],
  ["initiative", "Initiative"],
  ["campus_fit", "Campus fit"],
] as const;

export function FeedbackStage({ report, mode, notice, onContinue }: { report: FeedbackReport; mode: "live" | "demo"; notice: string | null; onContinue: () => void }) {
  const demo = mode === "demo";
  return (
    <section className="page-shell py-10 sm:py-14">
      <div className="mx-auto max-w-[1040px]">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-[720px]">
            <span className="eyebrow">{demo ? "Representative demo feedback" : "Your practice feedback"}</span>
            <h1 className="font-display mt-5 text-4xl font-bold leading-tight text-[#0b2e2a] sm:text-5xl" tabIndex={-1}>{demo ? "Here is how your personalized coaching will be structured." : "You turned anxiety into a clear purpose."}</h1>
          </div>
          <span className="inline-flex w-fit rounded-full bg-[#dcefeb] px-4 py-2 text-sm font-extrabold text-[#075d56]">{demo ? "Sample report" : "Practice complete"}</span>
        </div>

        {notice ? <div className="mt-6 rounded-2xl border border-[#ead8bc] bg-[#fff8eb] px-4 py-3 text-sm font-semibold text-[#79502c]" role="status">{notice}</div> : null}

        <div className="mt-8 grid gap-5 lg:grid-cols-[1.16fr_.84fr]">
          <article className="card p-6 sm:p-8">
            <p className="text-xs font-extrabold uppercase tracking-[0.1em] text-[#0b766d]">Overall read</p>
            <p className="mt-4 text-lg font-semibold leading-8 text-[#234a46]">{report.summary}</p>
            <div className="mt-7 border-t border-[#e4eeeb] pt-6">
              <h2 className="text-lg font-extrabold text-[#0b2e2a]">{demo ? "What this sample highlights" : "What worked well"}</h2>
              <ul className="mt-4 space-y-3">
                {report.strengths.map((strength) => <li className="flex gap-3 rounded-2xl bg-[#eef7f3] p-4 text-sm font-semibold leading-6 text-[#345652]" key={strength}><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#d4ebe6] text-[#075d56]"><CheckIcon className="h-4 w-4" /></span>{strength}</li>)}
              </ul>
            </div>
          </article>

          <aside className="card p-6 sm:p-8">
            <h2 className="text-lg font-extrabold text-[#0b2e2a]">Communication dimensions</h2>
            <p className="mt-1 text-sm text-[#6a7775]">{demo ? "These ratings demonstrate the report structure; they are not AI analysis of this practice." : "Scores point to the next skill—not your personality."}</p>
            <dl className="mt-6 space-y-5">
              {ratingKeys.map(([key, label]) => {
                const rating = Math.max(1, Math.min(5, Math.round(report.ratings[key])));
                return <div className="grid grid-cols-[1fr_auto] items-center gap-x-4" key={key}><dt className="text-sm font-bold text-[#345652]">{label}</dt><dd className="contents"><span className="text-sm font-extrabold text-[#0b2e2a]">{rating}<span className="font-semibold text-[#536461]">/5</span></span><span aria-hidden="true" className="col-span-2 mt-2 h-2 overflow-hidden rounded-full bg-[#e5efec]"><span className="block h-full rounded-full bg-[#0b766d]" style={{ width: `${rating * 20}%` }} /></span></dd></div>;
              })}
            </dl>
          </aside>
        </div>

        <div className="mt-8">
          <div><p className="text-xs font-extrabold uppercase tracking-[0.1em] text-[#9a5011]">Two highest-value improvements</p><h2 className="font-display mt-2 text-3xl font-bold text-[#0b2e2a]">Keep your voice. Make the ask more specific.</h2></div>
          <div className="mt-6 grid gap-5 lg:grid-cols-2">
            {report.improvements.map((improvement, index) => (
              <article className="card overflow-hidden" key={`${improvement.dimension}-${index}`}>
                <div className="border-b border-[#e4eeeb] bg-[#fff8eb] px-6 py-4"><span className="rounded-full bg-[#ffe5bc] px-3 py-1 text-xs font-extrabold text-[#8d4b12]">{improvement.dimension}</span><h3 className="mt-3 text-lg font-extrabold leading-7 text-[#0b2e2a]">{improvement.observation}</h3></div>
                <div className="p-6">
                  <p className="text-sm leading-7 text-[#59706e]">{improvement.why_it_matters}</p>
                  <div className="mt-5 grid gap-3">
                    <div className="rounded-2xl bg-[#f5f6f5] p-4"><p className="text-[0.68rem] font-extrabold uppercase tracking-[0.1em] text-[#536461]">From the practice</p><p className="mt-2 text-sm italic leading-6 text-[#4f6360]">“{improvement.original_response}”</p></div>
                    <div className="rounded-2xl border border-[#b9d8d2] bg-[#eef7f3] p-4"><p className="text-[0.68rem] font-extrabold uppercase tracking-[0.1em] text-[#075d56]">Try this</p><p className="mt-2 text-sm font-semibold leading-6 text-[#234a46]">“{improvement.suggested_response}”</p></div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>

        <section className="mt-8 rounded-[28px] border border-[#f0d09f] bg-[#fff8eb] p-6 sm:p-8">
          <div className="flex items-start gap-3"><SparkIcon className="mt-1 h-6 w-6 shrink-0 text-[#b85f14]" /><div><p className="text-xs font-extrabold uppercase tracking-[0.1em] text-[#9a5011]">Campus context</p><h2 className="font-display mt-2 text-3xl font-bold text-[#3d3326]">The professor’s question may be giving you the lead.</h2></div></div>
          {report.campus_context.map((context, index) => <div className="mt-6 grid gap-4 md:grid-cols-3" key={index}><div className="rounded-2xl bg-white/70 p-5"><p className="text-xs font-extrabold uppercase tracking-[0.09em] text-[#8d4b12]">Literal meaning</p><p className="mt-2 text-sm leading-7 text-[#59472f]">{context.literal_meaning}</p></div><div className="rounded-2xl bg-white/70 p-5"><p className="text-xs font-extrabold uppercase tracking-[0.09em] text-[#8d4b12]">Likely campus context</p><p className="mt-2 text-sm leading-7 text-[#59472f]">{context.likely_context}</p></div><div className="rounded-2xl bg-white/70 p-5"><p className="text-xs font-extrabold uppercase tracking-[0.09em] text-[#8d4b12]">Constructive next move</p><p className="mt-2 text-sm leading-7 text-[#59472f]">{context.constructive_next_move}</p></div></div>)}
        </section>

        <div className="mt-8 flex justify-end"><button className="button-primary" onClick={onContinue} type="button">{demo ? "View sample action plan" : "Build my action plan"} <ArrowRightIcon className="h-5 w-5" /></button></div>
      </div>
    </section>
  );
}
