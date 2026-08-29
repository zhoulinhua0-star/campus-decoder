import { NextResponse } from "next/server";
import { emailFeedbackRequestSchema } from "@/lib/ai/email-schemas";
import { demoProvider, getAiProvider } from "@/lib/ai/providers";
import { logAiFallback } from "@/lib/ai/telemetry";

export async function POST(request: Request) {
  const parsed = emailFeedbackRequestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Revise the draft before requesting feedback." }, { status: 400 });
  }

  const { context, revisedDraft } = parsed.data;
  const provider = getAiProvider();
  if (provider.mode === "demo") {
    return NextResponse.json({
      report: await provider.generateEmailFeedback(context, revisedDraft),
      mode: "demo",
      notice: "Sample feedback is active. Excerpts and the editable email come from your revision; ratings and coaching are representative.",
    });
  }

  const startedAt = Date.now();
  try {
    return NextResponse.json({
      report: await provider.generateEmailFeedback(context, revisedDraft),
      mode: "live",
      notice: null,
    });
  } catch (error) {
    logAiFallback({ operation: "feedback", model: provider.modelFor("feedback"), error, elapsedMs: Date.now() - startedAt });
    return NextResponse.json({
      report: await demoProvider.generateEmailFeedback(context, revisedDraft),
      mode: "demo",
      notice: "Live feedback was unavailable. Excerpts and the editable email come from your revision, while ratings and coaching are representative.",
    });
  }
}
