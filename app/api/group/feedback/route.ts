import { NextResponse } from "next/server";
import { groupFeedbackRequestSchema } from "@/lib/ai/group-schemas";
import { demoProvider, getAiProvider } from "@/lib/ai/providers";
import { logAiFallback } from "@/lib/ai/telemetry";

export async function POST(request: Request) {
  const parsed = groupFeedbackRequestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "There is not enough practice content to create feedback." }, { status: 400 });

  const { context, messages } = parsed.data;
  const provider = getAiProvider();
  if (provider.mode === "demo") {
    return NextResponse.json({
      report: await provider.generateGroupFeedback(context, messages),
      mode: "demo",
      notice: "Sample feedback is active. Quotes come from your transcript; ratings and coaching are representative until live AI is connected.",
    });
  }

  const startedAt = Date.now();
  try {
    return NextResponse.json({ report: await provider.generateGroupFeedback(context, messages), mode: "live", notice: null });
  } catch (error) {
    logAiFallback({ operation: "feedback", model: provider.modelFor("feedback"), error, elapsedMs: Date.now() - startedAt });
    return NextResponse.json({
      report: await demoProvider.generateGroupFeedback(context, messages),
      mode: "demo",
      notice: "Live feedback was unavailable. Quotes come from your transcript, but the ratings and coaching shown are representative.",
    });
  }
}
