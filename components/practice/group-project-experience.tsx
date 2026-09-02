"use client";

import { useEffect, useRef, useState } from "react";
import { GroupActionStage } from "@/components/practice/group-action-stage";
import { GroupContextStage } from "@/components/practice/group-context-stage";
import { GroupFeedbackStage } from "@/components/practice/group-feedback-stage";
import { GroupPracticeStage } from "@/components/practice/group-practice-stage";
import { GroupSetupStage } from "@/components/practice/group-setup-stage";
import { PracticeStage as Stage, ProgressSteps } from "@/components/practice/progress-steps";
import { DEMO_TEAMMATE_OPENING } from "@/lib/ai/group-mock";
import type { GroupContextApiResponse, GroupContextGuidance, GroupFeedbackApiResponse, GroupFeedbackReport, GroupPracticeApiResponse, GroupPracticeContext, GroupPracticeMessage } from "@/types/group-practice";

const emptyContext: GroupPracticeContext = { course: "", role: "", projectSituation: "", conflict: "", goal: "", concern: "" };
const sampleContext: GroupPracticeContext = {
  course: "Introduction to Marketing — campaign presentation",
  role: "I am coordinating the research and combining the final slides",
  projectSituation: "Our four-person group presents next Friday. Research should be finished by Tuesday so we can combine the slides and rehearse.",
  conflict: "One teammate missed the research deadline and has not answered two messages. Another teammate wants me to finish that section, but I already have my own work and the final slide assembly.",
  goal: "Agree on a fair task division, a new deadline, and a check-in before the presentation",
  concern: "I worry that being direct will sound controlling or damage the group relationship, but staying quiet may leave me with most of the work.",
};

function getGeneralGuidance(context: GroupPracticeContext): GroupContextGuidance {
  return {
    literal_source: `You described the conflict this way:\n\n“${context.conflict}”`,
    task_division_context: "Make each remaining task, owner, and deadline explicit so the group can see the plan and revise it together.",
    follow_up_context: "Refer to observable commitments and ask whether the plan needs to change instead of guessing why someone has not replied.",
    disagreement_context: "State the shared goal, the project impact, and one alternative. Directness does not require blame.",
    uncertainty: "General guidance cannot tell us a teammate's intention or what the instructor would decide.",
    constructive_next_move: `Ask the group to confirm a task owner, deadline, and check-in that support this goal: “${context.goal}”`,
  };
}

export function GroupProjectExperience() {
  const [stage, setStage] = useState<Stage>("Setup");
  const previousStageRef = useRef<Stage>(stage);
  const slowDecodeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [context, setContext] = useState(emptyContext);
  const [contextSource, setContextSource] = useState<"mine" | "sample">("mine");
  const [messages, setMessages] = useState<GroupPracticeMessage[]>([]);
  const [guidance, setGuidance] = useState<GroupContextGuidance | null>(null);
  const [contextMode, setContextMode] = useState<"live" | "demo" | null>(null);
  const [report, setReport] = useState<GroupFeedbackReport | null>(null);
  const [feedbackMode, setFeedbackMode] = useState<"live" | "demo" | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [contextNotice, setContextNotice] = useState<string | null>(null);
  const [isDecoding, setIsDecoding] = useState(false);
  const [isSlowDecoding, setIsSlowDecoding] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    if (previousStageRef.current !== stage) requestAnimationFrame(() => document.querySelector<HTMLElement>("#group-project-stage h1")?.focus({ preventScroll: true }));
    previousStageRef.current = stage;
  }, [stage]);

  useEffect(() => () => {
    if (slowDecodeTimerRef.current) clearTimeout(slowDecodeTimerRef.current);
  }, []);

  function resetGeneratedState() {
    setMessages([]); setGuidance(null); setContextMode(null); setContextNotice(null); setReport(null); setFeedbackMode(null); setNotice(null);
  }

  function selectContextSource(source: "mine" | "sample") {
    if (source === contextSource) return;
    setContextSource(source); setContext(source === "sample" ? sampleContext : emptyContext); resetGeneratedState();
  }

  function updateContext(nextContext: GroupPracticeContext) { setContext(nextContext); resetGeneratedState(); }

  async function decodeContext() {
    setStage("Context"); setIsDecoding(true); setGuidance(null); setContextMode(null); setContextNotice(null);
    setIsSlowDecoding(false);
    if (slowDecodeTimerRef.current) clearTimeout(slowDecodeTimerRef.current);
    slowDecodeTimerRef.current = setTimeout(() => {
      setIsSlowDecoding(true);
      slowDecodeTimerRef.current = null;
    }, 5_000);
    try {
      const response = await fetch("/api/group/context", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ context }) });
      if (!response.ok) throw new Error("Group context request failed");
      const data = (await response.json()) as GroupContextApiResponse;
      setGuidance(data.guidance); setContextMode(data.mode); setContextNotice(data.notice);
    } catch {
      setGuidance(getGeneralGuidance(context)); setContextNotice("Situation-specific guidance could not load, so general group-project guidance is shown.");
    } finally {
      if (slowDecodeTimerRef.current) clearTimeout(slowDecodeTimerRef.current);
      slowDecodeTimerRef.current = null;
      setIsSlowDecoding(false);
      setIsDecoding(false);
    }
  }

  async function beginPractice() {
    setStage("Practice");
    if (messages.length > 0) return;
    setIsSending(true); setNotice(null);
    try {
      const response = await fetch("/api/group/practice", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ context, messages: [] }) });
      if (!response.ok) throw new Error("Group opening request failed");
      const data = (await response.json()) as GroupPracticeApiResponse;
      setMessages([{ role: "assistant", content: data.teammateReply }]); setNotice(data.notice);
    } catch {
      setMessages([{ role: "assistant", content: DEMO_TEAMMATE_OPENING }]); setNotice("A personalized opening could not load, so the general practice opening is shown.");
    } finally { setIsSending(false); }
  }

  async function sendMessage(content: string) {
    const nextMessages: GroupPracticeMessage[] = [...messages, { role: "user", content }];
    setMessages(nextMessages); setIsSending(true); setNotice(null);
    try {
      const response = await fetch("/api/group/practice", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ context, messages: nextMessages }) });
      if (!response.ok) throw new Error("Group practice request failed");
      const data = (await response.json()) as GroupPracticeApiResponse;
      setMessages((current) => [...current, { role: "assistant", content: data.teammateReply }]); setNotice(data.notice);
    } catch { setNotice("The teammate response could not load. Your message is saved—please try again."); }
    finally { setIsSending(false); }
  }

  async function finishPractice() {
    setIsFinishing(true); setNotice(null);
    try {
      const response = await fetch("/api/group/feedback", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ context, messages }) });
      if (!response.ok) throw new Error("Group feedback request failed");
      const data = (await response.json()) as GroupFeedbackApiResponse;
      setReport(data.report); setFeedbackMode(data.mode); setNotice(data.notice); setStage("Feedback");
    } catch { setNotice("Feedback could not be created yet. Please send one more response or try again."); }
    finally { setIsFinishing(false); }
  }

  function restart() { setMessages([]); setReport(null); setFeedbackMode(null); setNotice(null); setStage("Context"); }

  return <><ProgressSteps current={stage} /><div id="group-project-stage">{stage === "Setup" ? <GroupSetupStage context={context} contextSource={contextSource} onChange={updateContext} onContinue={decodeContext} onSelectContextSource={selectContextSource} /> : null}{stage === "Context" ? <GroupContextStage context={context} guidance={guidance} isLoading={isDecoding} isSlowLoading={isSlowDecoding} mode={contextMode} notice={contextNotice} onBack={() => setStage("Setup")} onContinue={beginPractice} /> : null}{stage === "Practice" ? <GroupPracticeStage context={context} isFinishing={isFinishing} isSending={isSending} messages={messages} notice={notice} onBack={() => setStage("Context")} onFinish={finishPractice} onSend={sendMessage} /> : null}{stage === "Feedback" && report && feedbackMode ? <GroupFeedbackStage mode={feedbackMode} notice={notice} onContinue={() => setStage("Action")} report={report} /> : null}{stage === "Action" && report && feedbackMode ? <GroupActionStage mode={feedbackMode} onBack={() => setStage("Feedback")} onRestart={restart} report={report} /> : null}</div></>;
}
