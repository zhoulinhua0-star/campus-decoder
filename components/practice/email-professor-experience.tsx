"use client";

import { useEffect, useRef, useState } from "react";
import { EmailActionStage } from "@/components/practice/email-action-stage";
import { EmailContextStage } from "@/components/practice/email-context-stage";
import { EmailFeedbackStage } from "@/components/practice/email-feedback-stage";
import { EmailPracticeStage } from "@/components/practice/email-practice-stage";
import { EmailSetupStage } from "@/components/practice/email-setup-stage";
import { PracticeStage as Stage, ProgressSteps } from "@/components/practice/progress-steps";
import type { EmailContextApiResponse, EmailContextGuidance, EmailFeedbackApiResponse, EmailFeedbackReport, EmailHint, EmailHintApiResponse, EmailPracticeContext } from "@/types/email-practice";

const emptyContext: EmailPracticeContext = { course: "", recipient: "", purpose: "", whatHappened: "", concern: "", existingDraft: "" };

const sampleContext: EmailPracticeContext = {
  course: "First-Year Writing Seminar",
  recipient: "Professor Morgan",
  purpose: "Ask for a brief meeting about narrowing my research topic",
  whatHappened: "I have two possible research questions for the next paper, but I am not sure which one is focused enough for the assignment.",
  concern: "I worry that asking for guidance will make it look like I did not prepare or that I am bothering the professor.",
  existingDraft: "Dear Professor Morgan,\n\nSorry to bother you. I am confused about my paper topic and I do not know what to do. Could you help me?\n\nBest,\n[Your name]",
};

function getGeneralEmailGuidance(context: EmailPracticeContext): EmailContextGuidance {
  return {
    literal_source: `The draft you provided says:\n\n“${context.existingDraft}”`,
    campus_context: "A useful professor email usually identifies the course, states why you are writing, gives only the relevant context, and makes the requested next step easy to answer.",
    uncertainty: "General guidance cannot predict the professor’s availability, decision, or course-specific policy.",
    constructive_next_move: `Revise one sentence so your purpose—“${context.purpose}”—and the response you want are explicit.`,
  };
}

export function EmailProfessorExperience() {
  const [stage, setStage] = useState<Stage>("Setup");
  const previousStageRef = useRef<Stage>(stage);
  const [context, setContext] = useState(emptyContext);
  const [contextSource, setContextSource] = useState<"mine" | "sample">("mine");
  const [guidance, setGuidance] = useState<EmailContextGuidance | null>(null);
  const [contextMode, setContextMode] = useState<"live" | "demo" | null>(null);
  const [revisedDraft, setRevisedDraft] = useState("");
  const [hint, setHint] = useState<EmailHint | null>(null);
  const [hintMode, setHintMode] = useState<"live" | "demo" | null>(null);
  const [report, setReport] = useState<EmailFeedbackReport | null>(null);
  const [feedbackMode, setFeedbackMode] = useState<"live" | "demo" | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [contextNotice, setContextNotice] = useState<string | null>(null);
  const [isDecoding, setIsDecoding] = useState(false);
  const [isLoadingHint, setIsLoadingHint] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    if (previousStageRef.current !== stage) requestAnimationFrame(() => document.querySelector<HTMLElement>("#email-professor-stage h1")?.focus({ preventScroll: true }));
    previousStageRef.current = stage;
  }, [stage]);

  function resetGeneratedState() {
    setGuidance(null);
    setContextMode(null);
    setContextNotice(null);
    setHint(null);
    setHintMode(null);
    setReport(null);
    setFeedbackMode(null);
    setNotice(null);
  }

  function selectContextSource(source: "mine" | "sample") {
    if (source === contextSource) return;
    const nextContext = source === "sample" ? sampleContext : emptyContext;
    setContextSource(source);
    setContext(nextContext);
    setRevisedDraft(nextContext.existingDraft);
    resetGeneratedState();
  }

  function updateContext(nextContext: EmailPracticeContext) {
    setContext(nextContext);
    setRevisedDraft(nextContext.existingDraft);
    resetGeneratedState();
  }

  async function decodeContext() {
    setStage("Context");
    setIsDecoding(true);
    setGuidance(null);
    setContextMode(null);
    setContextNotice(null);
    try {
      const response = await fetch("/api/email/context", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ context }) });
      if (!response.ok) throw new Error("Email context request failed");
      const data = (await response.json()) as EmailContextApiResponse;
      setGuidance(data.guidance);
      setContextMode(data.mode);
      setContextNotice(data.notice);
    } catch {
      setGuidance(getGeneralEmailGuidance(context));
      setContextNotice("Situation-specific guidance could not load, so general professor-email guidance is shown.");
    } finally {
      setIsDecoding(false);
    }
  }

  function beginPractice() {
    setRevisedDraft((current) => current || context.existingDraft);
    setNotice(null);
    setStage("Practice");
  }

  async function requestHint() {
    setIsLoadingHint(true);
    setNotice(null);
    try {
      const response = await fetch("/api/email/hint", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ context, draft: revisedDraft }) });
      if (!response.ok) throw new Error("Email hint request failed");
      const data = (await response.json()) as EmailHintApiResponse;
      setHint(data.hint);
      setHintMode(data.mode);
      setNotice(data.notice);
    } catch {
      setNotice("A revision hint could not load. Your draft is saved, so you can continue editing or try again.");
    } finally {
      setIsLoadingHint(false);
    }
  }

  async function finishPractice() {
    setIsFinishing(true);
    setNotice(null);
    try {
      const response = await fetch("/api/email/feedback", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ context, revisedDraft }) });
      if (!response.ok) throw new Error("Email feedback request failed");
      const data = (await response.json()) as EmailFeedbackApiResponse;
      setReport(data.report);
      setFeedbackMode(data.mode);
      setNotice(data.notice);
      setStage("Feedback");
    } catch {
      setNotice("Feedback could not be created yet. Check your revision and try again.");
    } finally {
      setIsFinishing(false);
    }
  }

  function restart() {
    setRevisedDraft(context.existingDraft);
    setHint(null);
    setHintMode(null);
    setReport(null);
    setFeedbackMode(null);
    setNotice(null);
    setStage("Context");
  }

  return <><ProgressSteps current={stage} /><div id="email-professor-stage">{stage === "Setup" ? <EmailSetupStage context={context} contextSource={contextSource} onChange={updateContext} onContinue={decodeContext} onSelectContextSource={selectContextSource} /> : null}{stage === "Context" ? <EmailContextStage context={context} guidance={guidance} isLoading={isDecoding} mode={contextMode} notice={contextNotice} onBack={() => setStage("Setup")} onContinue={beginPractice} /> : null}{stage === "Practice" ? <EmailPracticeStage context={context} draft={revisedDraft} hint={hint} hintMode={hintMode} isFinishing={isFinishing} isLoadingHint={isLoadingHint} notice={notice} onBack={() => setStage("Context")} onChange={setRevisedDraft} onFinish={finishPractice} onRequestHint={requestHint} /> : null}{stage === "Feedback" && report && feedbackMode ? <EmailFeedbackStage mode={feedbackMode} notice={notice} onContinue={() => setStage("Action")} report={report} /> : null}{stage === "Action" && report && feedbackMode ? <EmailActionStage context={context} mode={feedbackMode} onBack={() => setStage("Feedback")} onRestart={restart} report={report} /> : null}</div></>;
}
