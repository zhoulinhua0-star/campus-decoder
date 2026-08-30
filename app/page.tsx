import Link from "next/link";
import { ArrowRightIcon, CheckIcon, SparkIcon } from "@/components/icons";
import { ScenarioCard } from "@/components/scenario-card";
import { ScrollReveal } from "@/components/scroll-reveal";
import { SiteHeader } from "@/components/site-header";

const steps = [
  { number: "01", title: "Understand the situation", body: "Learn what the campus norm is—and what it does not require you to become." },
  { number: "02", title: "Practice before it happens", body: "Try your response in a private, low-stakes space while keeping your own voice." },
  { number: "03", title: "Leave ready to act", body: "Get specific feedback and an editable artifact you can use after practice." },
];

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#fbfdfb]" id="main-content" tabIndex={-1}>
      <SiteHeader />

      <section className="relative border-b border-[#dbe8e4] py-18 sm:py-24 lg:py-28">
        <div aria-hidden="true" className="absolute -right-24 top-12 h-72 w-72 rounded-full border-[48px] border-[#eef7f3]" />
        <div className="page-shell relative grid items-center gap-14 lg:grid-cols-[1.06fr_.94fr] lg:gap-20">
          <div>
            <span className="eyebrow">Equity starts after admission</span>
            <h1 className="font-display mt-6 max-w-[700px] text-[clamp(3rem,7vw,5.9rem)] font-bold leading-[0.98] text-[#0b2e2a]">
              Decode the rules <span className="text-[#0b766d]">no one teaches.</span>
            </h1>
            <p className="mt-7 max-w-[610px] text-lg leading-8 text-[#4f6965] sm:text-xl">
              Campus Decoder helps international students understand hidden university norms, practice high-stakes conversations, and take the next step with confidence.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link className="button-primary" href="/practice">
                Choose a scenario <ArrowRightIcon className="h-5 w-5" />
              </Link>
              <a className="button-secondary" href="#how-it-works">See how it works</a>
            </div>
            <div className="mt-7 flex flex-wrap gap-x-6 gap-y-2 text-sm font-semibold text-[#59706e]">
              <span className="flex items-center gap-2"><CheckIcon className="h-4 w-4 text-[#0b766d]" /> No account needed</span>
              <span className="flex items-center gap-2"><CheckIcon className="h-4 w-4 text-[#0b766d]" /> Culturally aware coaching</span>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[520px] lg:mx-0">
            <div className="card relative overflow-hidden !rounded-[32px] p-5 shadow-[var(--shadow-lg)] sm:p-7">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e4eeeb] pb-5">
                <div><p className="text-sm font-extrabold text-[#0b2e2a]">One guided path</p><p className="text-xs font-semibold text-[#6a7775]">Built for every scenario</p></div>
                <span className="rounded-full bg-[#eef7f3] px-3 py-1 text-xs font-extrabold text-[#075d56]">Private practice</span>
              </div>
              <ol className="grid gap-3 py-6">
                {[
                  ["01", "Understand", "Decode the campus norm and what remains uncertain."],
                  ["02", "Practice", "Try your own wording in a low-stakes space."],
                  ["03", "Feedback", "See the two changes that matter most."],
                  ["04", "Act", "Leave with an editable next-step artifact."],
                ].map(([number, title, body]) => (
                  <li className="grid grid-cols-[42px_1fr] items-start gap-3 rounded-2xl border border-[#e4eeeb] bg-[#fcfdfc] p-3.5" key={number}>
                    <span className="font-display flex h-10 w-10 items-center justify-center rounded-xl bg-[#dcefeb] text-sm font-bold text-[#075d56]">{number}</span>
                    <div><p className="text-sm font-extrabold text-[#0b2e2a]">{title}</p><p className="mt-0.5 text-xs leading-5 text-[#59706e]">{body}</p></div>
                  </li>
                ))}
              </ol>
              <div className="rounded-2xl border border-[#f0d09f] bg-[#fff7e8] p-4"><div className="flex gap-3"><SparkIcon className="mt-0.5 h-5 w-5 shrink-0 text-[#b85f14]" /><div><p className="text-xs font-extrabold uppercase tracking-[0.09em] text-[#8d4b12]">You stay in control</p><p className="mt-1 text-sm leading-6 text-[#69401b]">Choose the moment, write your response, and review every final artifact.</p></div></div></div>
            </div>
            <div aria-hidden="true" className="absolute -bottom-5 -left-5 -z-10 h-full w-full rounded-[32px] bg-[#dcefeb]" />
          </div>
        </div>
      </section>

      <section className="py-20 sm:py-26" id="scenarios">
        <div className="page-shell">
          <ScrollReveal className="max-w-[680px]">
            <span className="eyebrow">Choose a real moment</span>
            <h2 className="font-display mt-5 text-4xl font-bold leading-tight text-[#0b2e2a] sm:text-5xl">Practice university life before it happens.</h2>
            <p className="mt-5 text-lg leading-8 text-[#59706e]">Start with one moment that feels hard today. All three scenarios are ready for the full guided experience.</p>
          </ScrollReveal>
          <ScrollReveal className="mt-12 grid gap-5 md:grid-cols-3" delay={80} stagger>
            <ScenarioCard active description="Prepare to discuss feedback, ask useful questions, and show initiative without feeling confrontational." outcome="A first conversation after a lower grade" title="Office Hours" type="office" />
            <ScenarioCard active description="Turn a vague, overly formal, or apologetic draft into a clear and respectful professor email." outcome="Tone, specificity, and a clear ask" title="Emailing a Professor" type="email" />
            <ScenarioCard active description="Practice following up on missed work, proposing task division, and handling disagreement with peers." outcome="Direct but constructive collaboration" title="Group Project Conflict" type="group" />
          </ScrollReveal>
        </div>
      </section>

      <section className="border-y border-[#dbe8e4] bg-[#eef7f3] py-20 sm:py-24" id="how-it-works">
        <div className="page-shell">
          <div className="grid gap-12 lg:grid-cols-[.78fr_1.22fr] lg:gap-20">
            <ScrollReveal>
              <span className="eyebrow">Understand → Practice → Act</span>
              <h2 className="font-display mt-5 text-4xl font-bold leading-tight text-[#0b2e2a] sm:text-5xl">More than a better sentence.</h2>
              <p className="mt-5 text-lg leading-8 text-[#59706e]">The goal is not to make you sound like someone else. It is to make the situation legible, so you can choose how to respond.</p>
            </ScrollReveal>
            <ScrollReveal delay={100}>
              <ol className="grid gap-4">
                {steps.map((step) => (
                  <li className="grid gap-4 rounded-3xl border border-[#cfe0dc] bg-white p-6 sm:grid-cols-[70px_1fr] sm:items-start" key={step.number}>
                    <span className="font-display text-3xl font-bold text-[#b85f14]">{step.number}</span>
                    <div><h3 className="text-lg font-extrabold text-[#0b2e2a]">{step.title}</h3><p className="mt-1 text-[0.95rem] leading-7 text-[#59706e]">{step.body}</p></div>
                  </li>
                ))}
              </ol>
            </ScrollReveal>
          </div>
        </div>
      </section>

      <section className="py-20 sm:py-28">
        <ScrollReveal className="page-shell">
          <div className="rounded-[32px] bg-[#0b2e2a] px-6 py-14 text-center text-white sm:px-12 sm:py-18">
            <span className="text-xs font-extrabold uppercase tracking-[0.13em] text-[#8ed1c8]">Your next conversation can feel different</span>
            <h2 className="font-display mx-auto mt-5 max-w-[760px] text-4xl font-bold leading-tight sm:text-5xl">Choose the campus moment you want to handle differently.</h2>
            <p className="mx-auto mt-5 max-w-[620px] text-lg leading-8 text-[#c9ded9]">Start with the situation that feels hardest today, then follow one clear path from context to action.</p>
            <Link className="button-primary mt-8 !border-[#f4b65e] !bg-[#f4b65e] !text-[#0b2e2a] hover:!border-[#ffd08a] hover:!bg-[#ffd08a]" href="/practice">Choose a scenario <ArrowRightIcon className="h-5 w-5" /></Link>
          </div>
        </ScrollReveal>
      </section>

      <footer className="border-t border-[#dbe8e4] py-8">
        <div className="page-shell flex flex-col gap-3 text-sm text-[#59706e] sm:flex-row sm:items-center sm:justify-between">
          <p className="font-semibold">Campus Decoder begins with Chinese international students—and is designed to grow.</p>
          <p>Guidance is educational, not official university advice.</p>
        </div>
      </footer>
    </main>
  );
}
