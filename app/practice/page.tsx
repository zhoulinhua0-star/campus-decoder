import type { Metadata } from "next";
import { ScenarioCard } from "@/components/scenario-card";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "Choose a Practice Scenario | Campus Decoder",
  description: "Choose a campus moment to understand, practice, and turn into a confident next action.",
};

export default function PracticePage() {
  return (
    <main className="min-h-screen bg-[#fbfdfb]" id="main-content" tabIndex={-1}>
      <SiteHeader compact compactLabel="Back home" />
      <section className="page-shell py-12 sm:py-18 lg:py-22">
        <div className="mx-auto max-w-[820px] text-center">
          <span className="eyebrow">Choose a real moment</span>
          <h1 className="font-display mt-5 text-[clamp(2.8rem,7vw,5.2rem)] font-bold leading-[1.02] text-[#0b2e2a]">What would you like to practice?</h1>
          <p className="mx-auto mt-6 max-w-[680px] text-lg leading-8 text-[#59706e]">Every scenario follows the same path: understand the campus context, try your own response, get focused feedback, and leave with something usable.</p>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          <ScenarioCard active description="Prepare to discuss feedback, ask useful questions, and show initiative without feeling confrontational." outcome="A first conversation after a lower grade" title="Office Hours" type="office" />
          <ScenarioCard active description="Turn a vague, overly formal, or apologetic draft into a clear and respectful professor email." outcome="Tone, specificity, and a clear ask" title="Emailing a Professor" type="email" />
          <ScenarioCard description="Practice following up on missed work, proposing task division, and handling disagreement with peers." outcome="Direct but constructive collaboration" title="Group Project Conflict" type="group" />
        </div>

        <div className="mx-auto mt-8 max-w-[760px] rounded-2xl border border-[#ead8bc] bg-[#fff8eb] px-5 py-4 text-center text-sm font-semibold leading-6 text-[#79502c]">
          Group Project Conflict is next in development. Office Hours and Emailing a Professor are ready now.
        </div>
      </section>
    </main>
  );
}
