"use client";

import { useEffect, useRef, useState } from "react";
import { ActionStage } from "@/components/practice/action-stage";
import { ContextStage } from "@/components/practice/context-stage";
import { FeedbackStage } from "@/components/practice/feedback-stage";
import { PracticeStage } from "@/components/practice/practice-stage";
import { PracticeStage as Stage, ProgressSteps } from "@/components/practice/progress-steps";
import { SetupStage } from "@/components/practice/setup-stage";
import { DEMO_OPENING } from "@/lib/ai/constants";
import type { ContextApiResponse, ContextGuidance, FeedbackApiResponse, FeedbackReport, PracticeApiResponse, PracticeContext, PracticeMessage } from "@/types/practice";

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

function getGeneralContextGuidance(context: PracticeContext): ContextGuidance {
  if (context.preferredLanguage === "简体中文") {
    return {
      literal_source: "你希望通过 Office Hours 更好地理解当前情况，并确定一个可行的下一步。",
      campus_context: "Office Hours 通常可以用来澄清课程内容、作业反馈和改进方向。提出具体问题通常体现主动性。",
      uncertainty: "目前无法载入针对你所填内容的解释，因此这里不会推测教授的个人意图或具体要求。",
      constructive_next_move: `带上相关材料，说明你的目标：“${context.goal}”，然后从一个具体问题开始。`,
    };
  }

  return {
    literal_source: "You want to use office hours to understand the situation and identify a workable next step.",
    campus_context: "Office hours are commonly used to clarify course material, assignment feedback, and possible ways to improve. A specific question usually signals initiative.",
    uncertainty: "Situation-specific guidance could not load, so this view does not infer the professor’s private intention or exact expectations.",
    constructive_next_move: `Bring the relevant material, state your goal—“${context.goal}”—and begin with one specific question.`,
  };
}

export function OfficeHoursExperience() {
  const [stage, setStage] = useState<Stage>("Setup");
  const previousStageRef = useRef<Stage>(stage);
  const [context, setContext] = useState(emptyContext);
  const [contextSource, setContextSource] = useState<"mine" | "sample">("mine");
  const [messages, setMessages] = useState<PracticeMessage[]>([]);
  const [contextGuidance, setContextGuidance] = useState<ContextGuidance | null>(null);
  const [contextMode, setContextMode] = useState<"live" | "demo" | null>(null);
  const [contextNotice, setContextNotice] = useState<string | null>(null);
  const [report, setReport] = useState<FeedbackReport | null>(null);
  const [feedbackMode, setFeedbackMode] = useState<"live" | "demo" | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [isDecoding, setIsDecoding] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    if (previousStageRef.current !== stage) {
      requestAnimationFrame(() => document.querySelector<HTMLElement>("#office-hours-stage h1")?.focus({ preventScroll: true }));
    }
    previousStageRef.current = stage;
  }, [stage]);

  function selectContextSource(source: "mine" | "sample") {
    if (source === contextSource) return;
    setContextSource(source);
    setContext(source === "sample" ? sampleContext : emptyContext);
    setMessages([]);
    setContextGuidance(null);
    setContextMode(null);
    setContextNotice(null);
    setNotice(null);
  }

  function updateContext(nextContext: PracticeContext) {
    setContext(nextContext);
    setMessages([]);
    setContextGuidance(null);
    setContextMode(null);
    setContextNotice(null);
    setNotice(null);
  }

  async function decodeContext() {
    setStage("Context");
    setIsDecoding(true);
    setContextGuidance(null);
    setContextMode(null);
    setContextNotice(null);

    try {
      const response = await fetch("/api/context", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ context }),
      });
      if (!response.ok) throw new Error("Context request failed");
      const data = (await response.json()) as ContextApiResponse;
      setContextGuidance(data.guidance);
      setContextMode(data.mode);
      setContextNotice(data.notice);
    } catch {
      setContextGuidance(getGeneralContextGuidance(context));
      setContextMode(null);
      setContextNotice(context.preferredLanguage === "简体中文"
        ? "针对你所填内容的指导暂时无法载入，因此这里显示通用的 Office Hours 指导。"
        : "Situation-specific guidance could not load, so general Office Hours guidance is shown.");
    } finally {
      setIsDecoding(false);
    }
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
      <div id="office-hours-stage">
        {stage === "Setup" ? <SetupStage context={context} contextSource={contextSource} onChange={updateContext} onContinue={decodeContext} onSelectContextSource={selectContextSource} /> : null}
        {stage === "Context" ? <ContextStage context={context} guidance={contextGuidance} isLoading={isDecoding} mode={contextMode} notice={contextNotice} onBack={() => setStage("Setup")} onContinue={beginPractice} /> : null}
        {stage === "Practice" ? <PracticeStage context={context} isFinishing={isFinishing} isSending={isSending} messages={messages} notice={notice} onBack={() => setStage("Context")} onFinish={finishPractice} onSend={sendMessage} /> : null}
        {stage === "Feedback" && report && feedbackMode ? <FeedbackStage language={context.preferredLanguage} mode={feedbackMode} notice={notice} onContinue={() => setStage("Action")} report={report} /> : null}
        {stage === "Action" && report && feedbackMode ? <ActionStage language={context.preferredLanguage} mode={feedbackMode} onBack={() => setStage("Feedback")} onRestart={restart} report={report} /> : null}
      </div>
    </>
  );
}
