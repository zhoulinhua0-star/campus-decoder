import { ArrowLeftIcon, ArrowRightIcon, ScenarioIcon, SparkIcon } from "@/components/icons";
import type { ContextGuidance, PracticeContext } from "@/types/practice";

type ContextStageProps = {
  context: PracticeContext;
  guidance: ContextGuidance | null;
  isLoading: boolean;
  mode: "live" | "demo" | null;
  notice: string | null;
  onBack: () => void;
  onContinue: () => void;
};

export function ContextStage({ context, guidance, isLoading, mode, notice, onBack, onContinue }: ContextStageProps) {
  const chinese = context.preferredLanguage === "简体中文";
  const cards = guidance ? [
    {
      label: chinese ? "原始信息" : "Literal source",
      title: chinese ? "先从你实际提供的内容开始。" : "Start with what was actually provided.",
      body: guidance.literal_source,
      accent: "teal",
    },
    {
      label: chinese ? "校园语境" : "Campus context",
      title: chinese ? "把信息放进 Office Hours 的语境中。" : "Place it in the Office Hours context.",
      body: guidance.campus_context,
      accent: "amber",
    },
    {
      label: chinese ? "仍不确定的部分" : "What remains uncertain",
      title: chinese ? "不猜测教授没有说出的想法。" : "Do not guess what the professor did not say.",
      body: guidance.uncertainty,
      accent: "teal",
    },
    {
      label: chinese ? "建设性下一步" : "Constructive next move",
      title: chinese ? "把理解转化为一个具体行动。" : "Turn the context into one concrete action.",
      body: guidance.constructive_next_move,
      accent: "amber",
    },
  ] as const : [];

  return (
    <section className="page-shell py-10 sm:py-14">
      <div className="mx-auto max-w-[960px]">
        <div className="text-center">
          <span className="eyebrow">{chinese ? "解读你的情况" : "Decode your situation"}</span>
          <h1 className="font-display mx-auto mt-5 max-w-[760px] text-4xl font-bold leading-tight text-[#0b2e2a] sm:text-5xl" tabIndex={-1}>{chinese ? "先分清我们知道什么，以及还不知道什么。" : "Separate what we know from what we still need to ask."}</h1>
          <p className="mx-auto mt-5 max-w-[720px] text-lg leading-8 text-[#59706e]">{chinese ? "下面的解读会使用你提供的信息，但不会声称知道教授没有说出的想法。" : "This decode uses the details you provided without claiming to know what your professor privately intended."}</p>
        </div>

        {notice ? <div className="mt-7 rounded-2xl border border-[#ead8bc] bg-[#fff8eb] px-4 py-3 text-sm font-semibold leading-6 text-[#79502c]" role="status">{notice}</div> : null}

        {isLoading ? (
          <div className="mt-10 rounded-3xl border border-[#cfe0dc] bg-white p-8 text-center" role="status">
            <div aria-hidden="true" className="mx-auto h-11 w-11 animate-pulse rounded-2xl bg-[#dcefeb]" />
            <h2 className="mt-5 text-lg font-extrabold text-[#0b2e2a]">{chinese ? "正在整理你提供的信息…" : "Organizing the details you provided…"}</h2>
            <p className="mx-auto mt-2 max-w-[560px] text-sm leading-6 text-[#59706e]">{chinese ? "我们会把原始信息、校园语境、不确定之处和下一步分开。" : "We are separating the literal source, campus context, uncertainty, and next move."}</p>
          </div>
        ) : (
          <div className="mt-10 grid gap-4 md:grid-cols-2">
            {cards.map((card) => {
              const amber = card.accent === "amber";
              return (
                <article className={`rounded-3xl border p-6 sm:p-7 ${amber ? "border-[#f0d09f] bg-[#fff7e8]" : "border-[#cfe0dc] bg-white"}`} key={card.label}>
                  <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${amber ? "bg-[#ffe7c0] text-[#9a5011]" : "bg-[#dcefeb] text-[#075d56]"}`}>
                    {amber ? <SparkIcon className="h-5 w-5" /> : <ScenarioIcon className="h-5 w-5" type="office" />}
                  </div>
                  <p className={`mt-5 text-xs font-extrabold uppercase tracking-[0.1em] ${amber ? "text-[#9a5011]" : "text-[#0b766d]"}`}>{card.label}</p>
                  <h2 className="mt-2 text-lg font-extrabold leading-7 text-[#0b2e2a]">{card.title}</h2>
                  <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-[#59706e] [overflow-wrap:anywhere]">{card.body}</p>
                </article>
              );
            })}
          </div>
        )}

        {!isLoading && guidance ? <div className="mt-8 rounded-3xl bg-[#0b2e2a] p-6 text-white sm:flex sm:items-center sm:justify-between sm:gap-8">
          <div className="min-w-0"><p className="text-xs font-extrabold uppercase tracking-[0.1em] text-[#8ed1c8]">{chinese ? "你的练习目标" : "Your practice goal"}</p><p className="mt-2 max-w-[650px] font-semibold leading-7 [overflow-wrap:anywhere]">{context.goal}</p></div>
          <div className="mt-4 flex min-w-0 flex-col items-start gap-2 sm:mt-0 sm:max-w-[40%] sm:items-end"><span className="block max-w-full rounded-3xl bg-white/10 px-4 py-2 text-sm font-bold text-[#d6e9e5] [overflow-wrap:anywhere]">{context.course}</span>{mode ? <span className="text-xs font-bold text-[#8ed1c8]">{mode === "live" ? (chinese ? "实时 AI 解读" : "Live AI decode") : (chinese ? "Grounded Demo 解读" : "Grounded Demo decode")}</span> : null}</div>
        </div> : null}

        <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
          <button className="button-secondary" onClick={onBack} type="button"><ArrowLeftIcon className="h-5 w-5" /> {chinese ? "修改背景" : "Edit context"}</button>
          <button className="button-primary" disabled={isLoading || !guidance} onClick={onContinue} type="button">{chinese ? "开始练习" : "Start the role-play"} <ArrowRightIcon className="h-5 w-5" /></button>
        </div>
      </div>
    </section>
  );
}
