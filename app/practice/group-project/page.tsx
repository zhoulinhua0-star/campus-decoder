import type { Metadata } from "next";
import { GroupProjectExperience } from "@/components/practice/group-project-experience";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "Group Project Conflict | Campus Decoder",
  description: "Understand group-project norms, practice a constructive teammate conversation, and build an editable coordination plan.",
};

export default function GroupProjectPage() {
  return <main className="min-h-screen bg-[#fbfdfb]" id="main-content" tabIndex={-1}><SiteHeader compact /><GroupProjectExperience /></main>;
}
