"use client";

import { useEffect, useState } from "react";
import { ActionStage } from "@/components/practice/action-stage";
import { ContextStage } from "@/components/practice/context-stage";
import { FeedbackStage } from "@/components/practice/feedback-stage";
import { PracticeStage } from "@/components/practice/practice-stage";
import { PracticeStage as Stage, ProgressSteps } from "@/components/practice/progress-steps";
import { SetupStage } from "@/components/practice/setup-stage";
import { DEMO_OPENING } from "@/lib/ai/constants";
import type { FeedbackApiResponse, FeedbackReport, PracticeApiResponse, PracticeContext, PracticeMessage } from "@/types/practice";

const emptyContext: PracticeContext = {
  course: "",
  goal: "",
  whatHappened: "",
  concern: "",
  professorFeedback: "",
  preferredLanguage: "English",
};

const sampleContext: PracticeContext = {
  course: "First-Year Writing Seminar",
  goal: "Understand the feedback and improve my next essay",
  whatHappened: "I received a C+ on my first essay. The grade was lower than I expected, and I want to understand what to work on next.",
  concern: "I worry that going to office hours will sound like I am arguing about the grade or wasting the professor’s time.",
  professorFeedback: "The thesis is too broad, and the analysis needs to connect more clearly to the evidence.",
  preferredLanguage: "English",
};

export function OfficeHoursExperience() {
  const [stage, setStage] = useState<Stage>("Setup");
  const [context, setContext] = useState(emptyContext);
  const [contextSource, setContextSource] = useState<"mine" | "sample">("mine");
  const [messages, setMessages] = useState<PracticeMessage[]>([]);
  const [report, setReport] = useState<FeedbackReport | null>(null);
  const [feedbackMode, setFeedbackMode] = useState<"live" | "demo" | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => { window.scrollTo({ top: 0, behavior: "smooth" }); }, [stage]);

  function selectContextSource(source: "mine" | "sample") {
    if (source === contextSource) return;
    setContextSource(source);
    setContext(source === "sample" ? sampleContext : emptyContext);
    setMessages([]);
    setNotice(null);
  }

  function updateContext(nextContext: PracticeContext) {
    setContext(nextContext);
    setMessages([]);
    setNotice(null);
  }

  async function beginPractice() {
    setStage("Practice");
    if (messages.length > 0) return;

    setIsSending(true);
    setNotice(null);
    try {
      const response = await fetch("/api/practice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ context, messages: [] }),
      });
      if (!response.ok) throw new Error("Opening request failed");
      const data = (await response.json()) as PracticeApiResponse;
      setMessages([{ role: "assistant", content: data.professorReply }]);
      setNotice(data.notice);
    } catch {
      setMessages([{ role: "assistant", content: DEMO_OPENING }]);
      setNotice("A personalized opening could not load, so the general practice opening is shown.");
    } finally {
      setIsSending(false);
    }
  }

  async function sendMessage(content: string) {
    const nextMessages: PracticeMessage[] = [...messages, { role: "user", content }];
    setMessages(nextMessages);
    setIsSending(true);
    setNotice(null);
    try {
      const response = await fetch("/api/practice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ context, messages: nextMessages }),
      });
      if (!response.ok) throw new Error("Practice request failed");
      const data = (await response.json()) as PracticeApiResponse;
      setMessages((current) => [...current, { role: "assistant", content: data.professorReply }]);
      setNotice(data.notice);
    } catch {
      setNotice("The professor response could not load. Your message is saved—please try again.");
    } finally {
      setIsSending(false);
    }
  }

  async function finishPractice() {
    setIsFinishing(true);
    setNotice(null);
    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ context, messages }),
      });
      if (!response.ok) throw new Error("Feedback request failed");
      const data = (await response.json()) as FeedbackApiResponse;
      setReport(data.report);
      setFeedbackMode(data.mode);
      setNotice(data.notice);
      setStage("Feedback");
    } catch {
      setNotice("Feedback could not be created yet. Please send one more response or try again.");
    } finally {
      setIsFinishing(false);
    }
  }

  function restart() {
    setMessages([]);
    setReport(null);
    setFeedbackMode(null);
    setNotice(null);
    setStage("Context");
  }

  return (
    <>
      <ProgressSteps current={stage} />
      {stage === "Setup" ? <SetupStage context={context} contextSource={contextSource} onChange={updateContext} onContinue={() => setStage("Context")} onSelectContextSource={selectContextSource} /> : null}
      {stage === "Context" ? <ContextStage context={context} onBack={() => setStage("Setup")} onContinue={beginPractice} /> : null}
      {stage === "Practice" ? <PracticeStage context={context} isFinishing={isFinishing} isSending={isSending} messages={messages} notice={notice} onBack={() => setStage("Context")} onFinish={finishPractice} onSend={sendMessage} /> : null}
      {stage === "Feedback" && report && feedbackMode ? <FeedbackStage language={context.preferredLanguage} mode={feedbackMode} notice={notice} onContinue={() => setStage("Action")} report={report} /> : null}
      {stage === "Action" && report && feedbackMode ? <ActionStage language={context.preferredLanguage} mode={feedbackMode} onBack={() => setStage("Feedback")} onRestart={restart} report={report} /> : null}
    </>
  );
}
