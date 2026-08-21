"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeftIcon, CheckIcon, CopyIcon } from "@/components/icons";
import type { CoachingLanguage, FeedbackReport } from "@/types/practice";

function formatActionPlan(plan: FeedbackReport["action_plan"]) {
  return `MEETING GOAL\n${plan.goal}\n\nOPENING\n${plan.opening}\n\nQUESTIONS TO ASK\n${plan.questions.map((question, index) => `${index + 1}. ${question}`).join("\n")}\n\nWHAT TO BRING\n${plan.evidence_to_bring.map((item) => `• ${item}`).join("\n")}\n\nCLOSING\n${plan.closing}`;
}

export function ActionStage({ report, language, mode, onBack, onRestart }: { report: FeedbackReport; language: CoachingLanguage; mode: "live" | "demo"; onBack: () => void; onRestart: () => void }) {
  const initialPlan = useMemo(() => formatActionPlan(report.action_plan), [report]);
  const [draft, setDraft] = useState(initialPlan);
  const [copied, setCopied] = useState(false);
  const chinese = language === "简体中文";
  const demo = mode === "demo";

  async function copyPlan() {
    try {
      await navigator.clipboard.writeText(draft);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <section className="page-shell py-10 sm:py-14">
      <div className="mx-auto max-w-[980px]">
        <div className="text-center">
          <span className="eyebrow">{demo ? (chinese ? "Demo 行动计划" : "Representative demo action plan") : (chinese ? "从练习到行动" : "From practice to action")}</span>
          <h1 className="font-display mx-auto mt-5 max-w-[760px] text-4xl font-bold leading-tight text-[#0b2e2a] sm:text-5xl">{demo ? (chinese ? "修改这份示例，让它符合你的真实情况。" : "Adapt this sample outline to your real situation.") : (chinese ? "把这份提纲带进真正的 Office Hours。" : "Take this outline into the real office hour.")}</h1>
          <p className="mx-auto mt-5 max-w-[680px] text-lg leading-8 text-[#59706e]">{demo ? (chinese ? "其中的目标来自你的设置，但具体建议仍是代表性示例；连接 Live AI 后才会进行个性化分析。" : "The goal comes from your setup, but the coaching remains representative until live AI is connected.") : (chinese ? "这是一个起点，不是必须照读的脚本。请修改成符合你表达方式的版本。" : "This is a starting point, not a script you must follow. Edit it until it sounds like you.")}</p>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_270px]">
          <div className="card overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e4eeeb] px-5 py-4 sm:px-7">
              <div><h2 className="text-lg font-extrabold text-[#0b2e2a]">{demo ? (chinese ? "示例会面提纲" : "Sample meeting outline") : (chinese ? "我的会面提纲" : "My meeting outline")}</h2><p className="mt-0.5 text-xs text-[#6a7775]">{chinese ? "可以直接编辑" : "Editable before you use it"}</p></div>
              <button className="button-secondary !min-h-11 !px-4 text-sm" onClick={copyPlan} type="button">{copied ? <CheckIcon className="h-4 w-4" /> : <CopyIcon className="h-4 w-4" />}{copied ? (chinese ? "已复制" : "Copied") : (chinese ? "复制提纲" : "Copy outline")}</button>
            </div>
            <label className="sr-only" htmlFor="action-plan">Editable office hours meeting outline</label>
            <textarea className="min-h-[570px] w-full resize-y border-0 bg-white px-5 py-6 font-mono text-sm leading-7 text-[#234a46] outline-none focus:bg-[#fcfdfc] sm:px-7" id="action-plan" onChange={(event) => setDraft(event.target.value)} value={draft} />
          </div>

          <aside className="space-y-4">
            <div className="rounded-3xl bg-[#0b2e2a] p-6 text-white">
              <p className="text-xs font-extrabold uppercase tracking-[0.1em] text-[#8ed1c8]">{chinese ? "会面前" : "Before you go"}</p>
              <ul className="mt-4 space-y-4 text-sm leading-6 text-[#d6e9e5]">
                {[chinese ? "带上作业、评语和课程要求。" : "Bring the assignment, feedback, and prompt.", chinese ? "选择最重要的两个问题。" : "Choose the two questions that matter most.", chinese ? "记住：目标是理解和改进。" : "Remember: the goal is understanding and improvement."].map((tip) => <li className="flex gap-2.5" key={tip}><CheckIcon className="mt-1 h-4 w-4 shrink-0 text-[#8ed1c8]" /> {tip}</li>)}
              </ul>
            </div>
            <div className="rounded-3xl border border-[#f0d09f] bg-[#fff8eb] p-5 text-sm leading-6 text-[#69401b]">{chinese ? "Campus Decoder 提供的是练习与教育性指导，不代表学校的正式政策。" : "Campus Decoder provides practice and educational guidance, not official university policy."}</div>
          </aside>
        </div>

        <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button className="button-secondary" onClick={onBack} type="button"><ArrowLeftIcon className="h-5 w-5" /> {chinese ? "返回反馈" : "Back to feedback"}</button>
          <div className="flex flex-col gap-3 sm:flex-row"><button className="button-secondary" onClick={onRestart} type="button">{chinese ? "重新练习" : "Practice again"}</button><Link className="button-primary" href="/">{chinese ? "完成" : "Done"} <CheckIcon className="h-5 w-5" /></Link></div>
        </div>
      </div>
    </section>
  );
}
