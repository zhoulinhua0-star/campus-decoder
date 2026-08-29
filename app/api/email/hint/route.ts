import { NextResponse } from "next/server";
import { emailHintRequestSchema } from "@/lib/ai/email-schemas";
import { demoProvider, getAiProvider } from "@/lib/ai/providers";
import { logAiFallback } from "@/lib/ai/telemetry";

export async function POST(request: Request) {
  const parsed = emailHintRequestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Add more of your draft before requesting a hint." }, { status: 400 });
  }

  const { context, draft } = parsed.data;
  const provider = getAiProvider();
  if (provider.mode === "demo") {
    return NextResponse.json({
      hint: await provider.generateEmailHint(context, draft),
      mode: "demo",
      notice: "Guided Demo hint uses fixed revision rules and leaves the writing to you.",
    });
  }

  const startedAt = Date.now();
  try {
    return NextResponse.json({
      hint: await provider.generateEmailHint(context, draft),
      mode: "live",
      notice: null,
    });
  } catch (error) {
    logAiFallback({ operation: "practice", model: provider.modelFor("practice"), error, elapsedMs: Date.now() - startedAt });
    return NextResponse.json({
      hint: await demoProvider.generateEmailHint(context, draft),
      mode: "demo",
      notice: "Live revision coaching was unavailable, so one fixed-rule Demo hint is shown instead.",
    });
  }
}
