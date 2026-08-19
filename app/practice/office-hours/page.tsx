import type { Metadata } from "next";
import { OfficeHoursExperience } from "@/components/practice/office-hours-experience";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "Office Hours Practice | Campus Decoder",
  description: "Understand, practice, and prepare for a constructive office-hours conversation.",
};

export default function OfficeHoursPage() {
  return (
    <main className="min-h-screen bg-[#fbfdfb]">
      <SiteHeader compact />
      <OfficeHoursExperience />
    </main>
  );
}
