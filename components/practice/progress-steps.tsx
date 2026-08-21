const stages = ["Setup", "Context", "Practice", "Feedback", "Action"] as const;

export type PracticeStage = (typeof stages)[number];

export function ProgressSteps({ current }: { current: PracticeStage }) {
  const currentIndex = stages.indexOf(current);
  const progress = ((currentIndex + 1) / stages.length) * 100;

  return (
    <nav aria-label="Practice progress" className="border-b border-[#dbe8e4] bg-white">
      <div className="page-shell py-4 md:hidden">
        <div className="flex items-center justify-between gap-4">
          <p className="text-xs font-extrabold uppercase tracking-[0.08em] text-[#153d39]">Step {currentIndex + 1} of {stages.length}</p>
          <p aria-current="step" className="text-sm font-extrabold text-[#075d56]">{current}</p>
        </div>
        <div aria-hidden="true" className="mt-3 h-2 overflow-hidden rounded-full bg-[#e5efec]">
          <div className="h-full rounded-full bg-[#0b766d] transition-[width] duration-300" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <ol className="page-shell hidden items-center py-4 md:flex">
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
