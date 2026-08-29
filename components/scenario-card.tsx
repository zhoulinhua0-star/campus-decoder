import Link from "next/link";
import { ArrowRightIcon, ClockIcon, ScenarioIcon } from "@/components/icons";

type ScenarioCardProps = {
  title: string;
  description: string;
  outcome: string;
  type: "office" | "email" | "group";
  active?: boolean;
};

export function ScenarioCard({ title, description, outcome, type, active = false }: ScenarioCardProps) {
  const content = (
    <>
      <div className="flex items-start justify-between gap-4">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#dcefeb] text-[#075d56]"><ScenarioIcon className="h-6 w-6" type={type} /></span>
        <span className={`rounded-full px-3 py-1 text-[0.68rem] font-extrabold uppercase tracking-[0.1em] ${active ? "bg-[#dcefeb] text-[#075d56]" : "bg-[#f3f4f3] text-[#536461]"}`}>{active ? "Ready" : "Coming next"}</span>
      </div>
      <div>
        <h3 className="font-display mt-6 text-2xl font-bold text-[#0b2e2a]">{title}</h3>
        <p className="mt-2 text-[0.95rem] leading-7 text-[#59706e]">{description}</p>
      </div>
      <div className="mt-auto border-t border-[#e4eeeb] pt-5">
        <p className="text-xs font-extrabold uppercase tracking-[0.1em] text-[#6a7775]">You&apos;ll practice</p>
        <p className="mt-1 text-sm font-bold text-[#234a46]">{outcome}</p>
        <div className="mt-4 flex items-center justify-between text-sm font-bold">
          <span className="flex items-center gap-1.5 text-[#6a7775]"><ClockIcon className="h-4 w-4" /> 5–7 min</span>
          {active ? <span className="flex items-center gap-1.5 text-[#075d56]">Begin <ArrowRightIcon className="h-4 w-4" /></span> : null}
        </div>
      </div>
    </>
  );

  const classes = "card flex min-h-[390px] flex-col p-6 text-left no-underline transition duration-200";
  const href = type === "email" ? "/practice/email-professor" : "/practice/office-hours";
  return active ? <Link className={`${classes} hover:-translate-y-1 hover:border-[#78a69d] hover:shadow-[0_22px_50px_rgba(11,46,42,0.1)]`} href={href}>{content}</Link> : <article className={classes}>{content}</article>;
}
