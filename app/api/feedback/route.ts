import { NextResponse } from "next/server";
import { demoProvider, getAiProvider } from "@/lib/ai/providers";
import { feedbackRequestSchema } from "@/lib/ai/schemas";

export async function POST(request: Request) {
  const parsed = feedbackRequestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "There is not enough practice content to create feedback." }, { status: 400 });
  }

  const { context, messages } = parsed.data;
  const provider = getAiProvider();

  if (provider.mode === "demo") {
    return NextResponse.json({
      report: await provider.generateFeedback(context, messages),
      mode: "demo",
      notice: "Sample feedback is active. Quotes come from your transcript; ratings and coaching are representative until live AI is connected.",
    });
  }

  try {
    return NextResponse.json({
      report: await provider.generateFeedback(context, messages),
      mode: "live",
      notice: null,
    });
  } catch {
    return NextResponse.json({
      report: await demoProvider.generateFeedback(context, messages),
      mode: "demo",
      notice: "Live feedback was unavailable. Quotes come from your transcript, but the ratings and coaching shown are representative.",
    });
  }
}
