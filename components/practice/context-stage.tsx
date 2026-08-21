import { ArrowLeftIcon, ArrowRightIcon, ScenarioIcon, SparkIcon } from "@/components/icons";
import type { PracticeContext } from "@/types/practice";

export function ContextStage({ context, onBack, onContinue }: { context: PracticeContext; onBack: () => void; onContinue: () => void }) {
  const chinese = context.preferredLanguage === "简体中文";
  const cards = chinese ? [
    { label: "字面情况", title: "你收到的成绩和反馈低于预期。", body: "你希望通过 Office Hours 理解反馈，并为下一次作业制定改进方向。" },
    { label: "校园语境", title: "Office Hours 本来就是用来讨论这些问题的。", body: "带着具体问题请教授解释反馈，通常体现主动性，而不是对成绩发起挑战。" },
    { label: "建设性下一步", title: "把目标从“解释分数”转向“理解与改进”。", body: "带上论文、作业要求和一条具体评语，并准备说明自己已经尝试理解了什么。" },
  ] : [
    { label: "Literal situation", title: "You received a grade and feedback below your expectations.", body: "You want to use office hours to understand the feedback and improve your next assignment." },
    { label: "Campus context", title: "Office hours are designed for conversations like this.", body: "Asking a professor to explain specific feedback usually signals initiative; it does not automatically challenge the grade." },
    { label: "Constructive next move", title: "Shift from defending the grade to understanding and improving.", body: "Bring the essay, prompt, and one specific comment. Be ready to explain what you have already tried to understand." },
  ];

  return (
    <section className="page-shell py-10 sm:py-14">
      <div className="mx-auto max-w-[960px]">
        <div className="text-center">
          <span className="eyebrow">{chinese ? "Office Hours 基础说明" : "General Office Hours guidance"}</span>
          <h1 className="font-display mx-auto mt-5 max-w-[760px] text-4xl font-bold leading-tight text-[#0b2e2a] sm:text-5xl">{chinese ? "去 Office Hours 不是在浪费教授的时间。" : "Going to office hours is not wasting your professor’s time."}</h1>
          <p className="mx-auto mt-5 max-w-[720px] text-lg leading-8 text-[#59706e]">{chinese ? "你不需要证明自己遇到了“足够严重”的问题。清楚说明目标，并提出具体问题，就已经是一次有建设性的会面。" : "You do not need to prove that your problem is serious enough. A clear goal and a specific question are enough to make the meeting constructive."}</p>
          <p className="mx-auto mt-3 max-w-[720px] text-sm leading-6 text-[#6a7775]">{chinese ? "此步骤解释通用校园规范；它目前不是对你所填内容的 AI 个性化分析。" : "This step explains the general campus norm; it is not yet AI-personalized analysis of your entries."}</p>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {cards.map((card, index) => (
            <article className={`rounded-3xl border p-6 ${index === 1 ? "border-[#f0d09f] bg-[#fff7e8]" : "border-[#cfe0dc] bg-white"}`} key={card.label}>
              <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${index === 1 ? "bg-[#ffe7c0] text-[#9a5011]" : "bg-[#dcefeb] text-[#075d56]"}`}>
                {index === 1 ? <SparkIcon className="h-5 w-5" /> : <ScenarioIcon className="h-5 w-5" type="office" />}
              </div>
              <p className={`mt-5 text-xs font-extrabold uppercase tracking-[0.1em] ${index === 1 ? "text-[#9a5011]" : "text-[#0b766d]"}`}>{card.label}</p>
              <h2 className="mt-2 text-lg font-extrabold leading-7 text-[#0b2e2a]">{card.title}</h2>
              <p className="mt-3 text-sm leading-7 text-[#59706e]">{card.body}</p>
            </article>
          ))}
        </div>

        <div className="mt-8 rounded-3xl bg-[#0b2e2a] p-6 text-white sm:flex sm:items-center sm:justify-between sm:gap-8">
          <div><p className="text-xs font-extrabold uppercase tracking-[0.1em] text-[#8ed1c8]">{chinese ? "你的练习目标" : "Your practice goal"}</p><p className="mt-2 max-w-[650px] font-semibold leading-7">{context.goal}</p></div>
          <span className="mt-4 inline-flex shrink-0 rounded-full bg-white/10 px-4 py-2 text-sm font-bold text-[#d6e9e5] sm:mt-0">{context.course}</span>
        </div>

        <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
          <button className="button-secondary" onClick={onBack} type="button"><ArrowLeftIcon className="h-5 w-5" /> {chinese ? "修改背景" : "Edit context"}</button>
          <button className="button-primary" onClick={onContinue} type="button">{chinese ? "开始练习" : "Start the role-play"} <ArrowRightIcon className="h-5 w-5" /></button>
        </div>
      </div>
    </section>
  );
}
