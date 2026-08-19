const stages = ["Setup", "Context", "Practice", "Feedback", "Action"] as const;

export type PracticeStage = (typeof stages)[number];

export function ProgressSteps({ current }: { current: PracticeStage }) {
  const currentIndex = stages.indexOf(current);
  return (
    <nav aria-label="Practice progress" className="overflow-x-auto border-b border-[#dbe8e4] bg-white">
      <ol className="page-shell flex min-w-[620px] items-center py-4">
        {stages.map((stage, index) => {
          const complete = index < currentIndex;
          const active = index === currentIndex;
          return (
            <li aria-current={active ? "step" : undefined} className="flex flex-1 items-center" key={stage}>
              <div className="flex items-center gap-2.5">
                <span className={`flex h-7 w-7 items-center justify-center rounded-full border text-xs font-extrabold ${complete ? "border-[#0b766d] bg-[#0b766d] text-white" : active ? "border-[#0b766d] bg-[#dcefeb] text-[#075d56]" : "border-[#cbd8d5] bg-white text-[#788784]"}`}>
                  {complete ? <span aria-label="Completed">&#10003;</span> : index + 1}
                </span>
                <span className={`text-xs font-extrabold uppercase tracking-[0.08em] ${active || complete ? "text-[#153d39]" : "text-[#86928f]"}`}>{stage}</span>
              </div>
              {index < stages.length - 1 ? <span aria-hidden="true" className={`mx-3 h-px flex-1 ${index < currentIndex ? "bg-[#0b766d]" : "bg-[#dbe8e4]"}`} /> : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
