"use client";

import { FormEvent, KeyboardEvent, useEffect, useRef, useState } from "react";
import { ArrowLeftIcon, ArrowRightIcon, MessageIcon, MicrophoneIcon, SparkIcon } from "@/components/icons";
import type { PracticeContext, PracticeMessage, TranslationApiResponse } from "@/types/practice";

type SpeechLanguage = "en-US" | "zh-CN";

type SpeechRecognitionEventLike = {
  results: {
    length: number;
    [index: number]: { [index: number]: { transcript: string } };
  };
};

type SpeechRecognitionLike = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onend: (() => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onstart: (() => void) | null;
  abort: () => void;
  start: () => void;
  stop: () => void;
};

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

function getSpeechRecognition() {
  if (typeof window === "undefined") return undefined;
  const speechWindow = window as typeof window & {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  };
  return speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition;
}

function containsChineseText(text: string) {
  return /[\u3400-\u9fff]/u.test(text);
}

type PracticeStageProps = {
  context: PracticeContext;
  messages: PracticeMessage[];
  isSending: boolean;
  isFinishing: boolean;
  notice: string | null;
  onBack: () => void;
  onSend: (message: string) => Promise<void>;
  onFinish: () => Promise<void>;
};

export function PracticeStage({ context, messages, isSending, isFinishing, notice, onBack, onSend, onFinish }: PracticeStageProps) {
  const [draft, setDraft] = useState("");
  const [showHints, setShowHints] = useState(false);
  const [speechLanguage, setSpeechLanguage] = useState<SpeechLanguage>("en-US");
  const [isListening, setIsListening] = useState(false);
  const [speechStatus, setSpeechStatus] = useState<string | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationError, setTranslationError] = useState<string | null>(null);
  const [originalChineseDraft, setOriginalChineseDraft] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const speechBaseDraftRef = useRef("");
  const speechHadErrorRef = useRef(false);
  const chinese = context.preferredLanguage === "简体中文";
  const userTurns = messages.filter((message) => message.role === "user").length;
  const draftContainsChinese = containsChineseText(draft);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }); }, [messages, isSending]);

  useEffect(() => {
    return () => {
      const recognition = recognitionRef.current;
      if (!recognition) return;
      recognition.onend = null;
      recognition.onerror = null;
      recognition.onresult = null;
      recognition.abort();
    };
  }, []);

  function cancelSpeechRecognition() {
    const recognition = recognitionRef.current;
    if (!recognition) return;
    recognition.onend = null;
    recognition.onerror = null;
    recognition.onresult = null;
    recognition.abort();
    recognitionRef.current = null;
    setIsListening(false);
    setSpeechStatus(null);
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    const message = draft.trim();
    if (!message || isSending || isTranslating) return;
    if (containsChineseText(message)) {
      setTranslationError(chinese ? "请先将中文草稿转换成自然英文，再发送给教授。" : "Convert the Chinese draft to natural English before sending it to the professor.");
      return;
    }
    cancelSpeechRecognition();
    setDraft("");
    setShowHints(false);
    setOriginalChineseDraft(null);
    setTranslationError(null);
    await onSend(message);
  }

  function updateDraft(value: string) {
    setDraft(value);
    setOriginalChineseDraft(null);
    setTranslationError(null);
  }

  function handleComposerKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key !== "Enter" || event.shiftKey || event.nativeEvent.isComposing) return;
    event.preventDefault();
    event.currentTarget.form?.requestSubmit();
  }

  function speechErrorMessage(error: string) {
    if (error === "not-allowed" || error === "service-not-allowed") {
      return chinese ? "无法使用麦克风。请在浏览器设置中允许麦克风权限。" : "Microphone access is blocked. Allow it in your browser settings and try again.";
    }
    if (error === "no-speech") {
      return chinese ? "没有听到语音，请靠近麦克风后重试。" : "I didn’t hear anything. Move closer to the microphone and try again.";
    }
    if (error === "audio-capture") {
      return chinese ? "没有找到可用的麦克风。请检查设备连接。" : "No microphone was found. Check your device connection.";
    }
    return chinese ? "语音输入暂时不可用，请重试或继续打字。" : "Voice input is temporarily unavailable. Try again or continue typing.";
  }

  function selectSpeechLanguage(language: SpeechLanguage) {
    setSpeechLanguage(language);
    setTranslationError(null);
    setSpeechStatus(language === "zh-CN"
      ? (chinese ? "语音识别已切换为中文。" : "Voice recognition is set to Mandarin Chinese.")
      : (chinese ? "语音识别已切换为英文。" : "Voice recognition is set to English."));
  }

  function toggleVoiceInput() {
    if (isListening) {
      recognitionRef.current?.stop();
      return;
    }

    const SpeechRecognition = getSpeechRecognition();
    if (!SpeechRecognition) {
      setSpeechStatus(chinese ? "此浏览器不支持语音输入，请使用最新版 Chrome 或 Safari。" : "Voice input is not supported here. Try the latest Chrome or Safari.");
      return;
    }

    const recognition = new SpeechRecognition();
    speechBaseDraftRef.current = draft.trimEnd();
    speechHadErrorRef.current = false;
    setOriginalChineseDraft(null);
    setTranslationError(null);
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = speechLanguage;
    recognition.onstart = () => {
      setIsListening(true);
      setSpeechStatus(speechLanguage === "zh-CN"
        ? (chinese ? "正在听中文…再次点击麦克风即可停止。" : "Listening in Mandarin Chinese… Select the microphone again to stop.")
        : (chinese ? "正在听英文…再次点击麦克风即可停止。" : "Listening in English… Select the microphone again to stop."));
    };
    recognition.onresult = (event) => {
      let transcript = "";
      for (let index = 0; index < event.results.length; index += 1) {
        transcript += event.results[index][0]?.transcript ?? "";
      }
      const base = speechBaseDraftRef.current;
      const separator = base && transcript.trim() ? " " : "";
      setDraft(`${base}${separator}${transcript.trimStart()}`.slice(0, 2000));
    };
    recognition.onerror = (event) => {
      if (event.error === "aborted") return;
      speechHadErrorRef.current = true;
      setSpeechStatus(speechErrorMessage(event.error));
    };
    recognition.onend = () => {
      recognitionRef.current = null;
      setIsListening(false);
      if (!speechHadErrorRef.current) {
        setSpeechStatus(speechLanguage === "zh-CN"
          ? (chinese ? "中文语音已转成文字。检查草稿后，再转换成自然英文。" : "Your Mandarin speech is now text. Review it, then convert it to natural English.")
          : (chinese ? "语音已转成文字，可以编辑或直接发送。" : "Your speech is now text. Edit it or send when ready."));
      }
      textareaRef.current?.focus();
    };

    recognitionRef.current = recognition;
    try {
      recognition.start();
    } catch {
      recognitionRef.current = null;
      setIsListening(false);
      setSpeechStatus(chinese ? "无法启动语音输入，请重试。" : "Voice input could not start. Please try again.");
    }
  }

  async function convertToNaturalEnglish() {
    const source = draft.trim();
    if (!containsChineseText(source) || isTranslating) return;

    setIsTranslating(true);
    setTranslationError(null);
    setSpeechStatus(chinese ? "正在转换成自然英文…" : "Converting to natural English…");

    try {
      const response = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: source }),
      });
      const payload = await response.json().catch(() => null) as (TranslationApiResponse & { error?: string }) | null;
      if (!response.ok || !payload?.translation) {
        throw new Error(payload?.error || "Natural-English conversion failed.");
      }

      setOriginalChineseDraft(source);
      setDraft(payload.translation);
      setSpeechStatus(chinese ? "已转换成自然英文。请检查并编辑后再发送。" : "Converted to natural English. Review and edit it before sending.");
    } catch (error) {
      setSpeechStatus(null);
      setTranslationError(chinese
        ? "暂时无法转换。若当前是 Demo 模式，请先启用 Kimi；你的中文草稿仍然保留。"
        : (error instanceof Error ? error.message : "Natural-English conversion failed. Your Chinese draft is still here."));
    } finally {
      setIsTranslating(false);
      textareaRef.current?.focus();
    }
  }

  function restoreChineseDraft() {
    if (!originalChineseDraft) return;
    setDraft(originalChineseDraft);
    setOriginalChineseDraft(null);
    setTranslationError(null);
    setSpeechStatus(chinese ? "已恢复转换前的中文草稿。" : "Restored the Chinese draft from before conversion.");
    textareaRef.current?.focus();
  }

  const hints = [
    "Thanks for meeting with me. I’d like to understand your feedback on…",
    "Could we look at your comment about…?",
    "For my next essay, what would you recommend I focus on first?",
  ];

  return (
    <section className="page-shell py-7 sm:py-10">
      <div className="grid gap-6 lg:grid-cols-[290px_1fr]">
        <aside className="space-y-4 lg:sticky lg:top-5 lg:self-start">
          <div className="card p-5">
            <p className="text-xs font-extrabold uppercase tracking-[0.1em] text-[#0b766d]">{chinese ? "练习目标" : "Practice goal"}</p>
            <p className="mt-3 text-sm font-bold leading-6 text-[#234a46]">{context.goal}</p>
            <dl className="mt-5 space-y-4 border-t border-[#e4eeeb] pt-5 text-sm">
              <div><dt className="font-extrabold text-[#0b2e2a]">{chinese ? "场景" : "Scenario"}</dt><dd className="mt-1 text-[#59706e]">Office Hours</dd></div>
              <div><dt className="font-extrabold text-[#0b2e2a]">{chinese ? "课程" : "Course"}</dt><dd className="mt-1 text-[#59706e]">{context.course}</dd></div>
              <div><dt className="font-extrabold text-[#0b2e2a]">{chinese ? "教授回复" : "Professor replies"}</dt><dd className="mt-1 text-[#59706e]">English</dd></div>
            </dl>
          </div>
          <div className="rounded-3xl border border-[#f0d09f] bg-[#fff7e8] p-5">
            <div className="flex gap-3"><SparkIcon className="mt-0.5 h-5 w-5 shrink-0 text-[#b85f14]" /><div><p className="text-sm font-extrabold text-[#69401b]">{chinese ? "这是练习，不是测试" : "This is practice, not a test"}</p><p className="mt-1 text-xs leading-5 text-[#79502c]">{chinese ? "可以停顿、修改，也可以使用句子开头提示。" : "Pause, revise, or use a sentence starter whenever you need one."}</p></div></div>
          </div>
          <button className="button-quiet w-full !justify-start" onClick={onBack} type="button"><ArrowLeftIcon className="h-4 w-4" /> {chinese ? "返回语境解释" : "Back to context"}</button>
        </aside>

        <div className="card flex min-h-[680px] flex-col overflow-hidden !rounded-[28px]">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e4eeeb] px-5 py-4 sm:px-7">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#dcefeb] text-[#075d56]"><MessageIcon className="h-5 w-5" /></span>
              <div className="min-w-0"><h1 className="text-sm font-extrabold text-[#0b2e2a]">Practice Professor</h1><p className="text-xs font-semibold text-[#6a7775]">{context.course} · Office hours</p></div>
            </div>
            <span className="flex items-center gap-2 rounded-full bg-[#eef7f3] px-3 py-1.5 text-xs font-extrabold text-[#075d56]"><span className="h-2 w-2 rounded-full bg-[#23a094]" /> Practice room</span>
          </div>

          {notice ? <div className="border-b border-[#ead8bc] bg-[#fff8eb] px-5 py-2.5 text-center text-xs font-semibold text-[#79502c]" role="status">{notice}</div> : null}

          <div aria-live="polite" className="flex-1 space-y-5 overflow-y-auto bg-[#fcfdfc] px-4 py-6 sm:px-7 sm:py-8">
            {messages.map((message, index) => (
              <div className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`} key={`${message.role}-${index}`}>
                {message.role === "assistant" ? <span className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#dcefeb] text-xs font-extrabold text-[#075d56]">PP</span> : null}
                <div className={`max-w-[84%] px-4 py-3 text-sm leading-7 sm:max-w-[72%] ${message.role === "user" ? "rounded-[18px_18px_5px_18px] bg-[#0b766d] text-white" : "rounded-[18px_18px_18px_5px] border border-[#dbe8e4] bg-white text-[#234a46]"}`}>
                  {message.content}
                </div>
              </div>
            ))}
            {isSending ? (
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#dcefeb] text-xs font-extrabold text-[#075d56]">PP</span>
                <span className="flex h-11 items-center gap-1 rounded-[18px_18px_18px_5px] border border-[#dbe8e4] bg-white px-4" aria-label="Practice professor is typing">
                  {[0, 1, 2].map((dot) => <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#7ca39c]" key={dot} style={{ animationDelay: `${dot * 150}ms` }} />)}
                </span>
              </div>
            ) : null}
            <div ref={endRef} />
          </div>

          <div className="border-t border-[#e4eeeb] bg-white p-4 sm:p-6">
            {showHints ? (
              <div className="mb-4 rounded-2xl border border-[#cfe0dc] bg-[#eef7f3] p-4">
                <p className="text-xs font-extrabold uppercase tracking-[0.09em] text-[#075d56]">{chinese ? "选择一个句子开头，继续用自己的话完成" : "Choose a start, then finish in your own words"}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {hints.map((hint) => <button className="min-h-11 rounded-xl border border-[#adc9c3] bg-white px-3 py-2 text-left text-xs font-bold leading-5 text-[#234a46] hover:border-[#0b766d]" key={hint} onClick={() => updateDraft(hint)} type="button">{hint}</button>)}
                </div>
              </div>
            ) : null}
            <form onSubmit={submit}>
              <label className="sr-only" htmlFor="practice-message">Your response to the professor</label>
              <textarea aria-describedby="practice-composer-help speech-input-status translation-error" className="text-area !min-h-24" disabled={isSending || isFinishing || isTranslating} id="practice-message" maxLength={2000} onChange={(event) => updateDraft(event.target.value)} onKeyDown={handleComposerKeyDown} placeholder="Type what you would say to the professor…" ref={textareaRef} value={draft} />
              <p className="mt-2 text-xs text-[#6a7775]" id="practice-composer-help">{chinese ? "Enter 发送 · Shift + Enter 换行" : "Enter to send · Shift + Enter for a new line"}</p>
              <p aria-atomic="true" className={`mt-2 min-h-5 text-xs font-semibold ${isListening ? "text-[#b42318]" : "text-[#59706e]"}`} id="speech-input-status" role="status">{speechStatus}</p>
              {translationError ? <p className="mt-2 text-xs font-bold leading-5 text-[#b42318]" id="translation-error" role="alert">{translationError}</p> : <span className="sr-only" id="translation-error" />}
              {draftContainsChinese ? (
                <div className="mt-3 flex flex-col gap-3 rounded-2xl border border-[#f0d09f] bg-[#fff7e8] p-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-xs font-semibold leading-5 text-[#69401b]">{chinese ? "中文草稿不会直接发给教授。先转换成自然英文，再检查并发送。" : "Your Chinese draft will not be sent yet. Convert it to natural English, then review and send."}</p>
                  <button className="button-secondary shrink-0 !min-h-11 !px-4 text-sm" disabled={isListening || isTranslating || isSending || isFinishing} onClick={convertToNaturalEnglish} type="button"><SparkIcon className="h-4 w-4" /> {isTranslating ? (chinese ? "转换中…" : "Converting…") : (chinese ? "转换成自然英文" : "Convert to natural English")}</button>
                </div>
              ) : null}
              {originalChineseDraft ? <div className="mt-2 flex justify-end"><button className="button-quiet !min-h-11 !px-3 text-xs" onClick={restoreChineseDraft} type="button">{chinese ? "恢复中文原稿" : "Restore Chinese draft"}</button></div> : null}
              <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-1">
                  <button className="button-quiet !px-3 text-sm" onClick={() => setShowHints((shown) => !shown)} type="button"><SparkIcon className="h-4 w-4" /> {chinese ? "我卡住了" : "I’m stuck"}</button>
                  <span className="text-xs text-[#86928f]">{draft.length}/2000</span>
                </div>
                <div className="flex flex-wrap items-center justify-end gap-2">
                  <div aria-label={chinese ? "语音识别语言" : "Voice recognition language"} className="flex rounded-full border border-[#adc9c3] bg-white p-1" role="group">
                    {(["en-US", "zh-CN"] as const).map((language) => {
                      const selected = speechLanguage === language;
                      const label = language === "en-US" ? "EN" : "中文";
                      return <button aria-label={language === "en-US" ? (chinese ? "英文语音识别" : "English voice recognition") : (chinese ? "中文语音识别" : "Mandarin Chinese voice recognition")} aria-pressed={selected} className={`min-h-11 rounded-full px-3 text-xs font-extrabold transition-colors duration-200 ${selected ? "bg-[#dcefeb] text-[#075d56]" : "bg-white text-[#59706e] hover:bg-[#eef7f3]"}`} disabled={isListening || isTranslating || isSending || isFinishing} key={language} onClick={() => selectSpeechLanguage(language)} type="button">{label}</button>;
                    })}
                  </div>
                  <button aria-label={isListening ? (chinese ? "停止语音输入" : "Stop voice input") : speechLanguage === "zh-CN" ? (chinese ? "开始中文语音输入" : "Start voice input in Mandarin Chinese") : (chinese ? "开始英文语音输入" : "Start voice input in English")} aria-pressed={isListening} className={`relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full border transition-colors duration-200 ${isListening ? "border-[#b42318] bg-[#b42318] text-white shadow-[0_8px_20px_rgb(180_35_24/0.2)]" : "border-[#adc9c3] bg-white text-[#075d56] hover:border-[#0b766d] hover:bg-[#eef7f3]"}`} disabled={isSending || isFinishing || isTranslating} onClick={toggleVoiceInput} type="button">
                    {isListening ? <span aria-hidden="true" className="absolute inset-0 animate-ping rounded-full border border-[#b42318] opacity-30" /> : null}
                    <MicrophoneIcon className="relative h-5 w-5" />
                  </button>
                  <button className="button-primary !min-h-11" disabled={!draft.trim() || draftContainsChinese || isSending || isFinishing || isTranslating} type="submit">{chinese ? "发送回复" : "Send response"} <ArrowRightIcon className="h-4 w-4" /></button>
                </div>
              </div>
            </form>
            <div className="mt-4 flex flex-col gap-3 border-t border-[#edf2f0] pt-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs leading-5 text-[#6a7775]">{chinese ? "完成 1–3 轮后即可获得反馈。" : "Finish after 1–3 turns when you feel ready."}</p>
              <button className="button-secondary !min-h-11 text-sm" disabled={userTurns < 1 || isSending || isFinishing} onClick={onFinish} type="button">{isFinishing ? (chinese ? "正在分析…" : "Analyzing…") : (chinese ? "结束练习并查看反馈" : "Finish & see feedback")}</button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
