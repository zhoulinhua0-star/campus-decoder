import { zodTextFormat } from "openai/helpers/zod";
import { NextResponse } from "next/server";
import { getOpenAIClient, OPENAI_MODEL } from "@/lib/ai/client";
import { getMockFeedback } from "@/lib/ai/mock";
import { buildFeedbackInput, OFFICE_HOURS_FEEDBACK_PROMPT } from "@/lib/ai/prompts";
import { feedbackReportSchema, feedbackRequestSchema } from "@/lib/ai/schemas";

export async function POST(request: Request) {
  const parsed = feedbackRequestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "There is not enough practice content to create feedback." }, { status: 400 });
  }

  const { context, messages } = parsed.data;
  const openai = getOpenAIClient();

  if (!openai) {
    return NextResponse.json({
      report: getMockFeedback(context, messages),
      mode: "demo",
      notice: "Sample feedback is active. Quotes come from your transcript; ratings and coaching are representative until live AI is connected.",
    });
  }

  try {
    const response = await openai.responses.parse({
      model: OPENAI_MODEL,
      input: [
        { role: "system", content: OFFICE_HOURS_FEEDBACK_PROMPT },
        { role: "user", content: buildFeedbackInput(context, messages) },
      ],
      text: { format: zodTextFormat(feedbackReportSchema, "office_hours_feedback") },
    });

    if (!response.output_parsed) throw new Error("The model returned no structured feedback.");

    return NextResponse.json({ report: response.output_parsed, mode: "live", notice: null });
  } catch {
    return NextResponse.json({
      report: getMockFeedback(context, messages),
      mode: "demo",
      notice: "Live feedback was unavailable. Quotes come from your transcript, but the ratings and coaching shown are representative.",
    });
  }
}
