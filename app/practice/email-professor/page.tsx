import type { Metadata } from "next";
import { EmailProfessorExperience } from "@/components/practice/email-professor-experience";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "Email a Professor | Campus Decoder",
  description: "Understand, revise, and prepare a clear professor email in your own voice.",
};

export default function EmailProfessorPage() {
  return <main className="min-h-screen bg-[#fbfdfb]" id="main-content" tabIndex={-1}><SiteHeader compact /><EmailProfessorExperience /></main>;
}
