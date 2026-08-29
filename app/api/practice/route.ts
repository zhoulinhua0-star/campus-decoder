import { NextResponse } from "next/server";
import { demoProvider, getAiProvider } from "@/lib/ai/providers";
import { practiceRequestSchema } from "@/lib/ai/schemas";
import { logAiFallback } from "@/lib/ai/telemetry";

export async function POST(request: Request) {
  const parsed = practiceRequestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Please check the practice details and try again." }, { status: 400 });
  }

  const { context, messages } = parsed.data;
  const provider = getAiProvider();

  if (provider.mode === "demo") {
    return NextResponse.json({
      professorReply: await provider.generateProfessorReply(context, messages),
      mode: "demo",
      notice: "Guided demo is active. Professor replies follow a short sample path until live AI is connected.",
    });
  }

  const startedAt = Date.now();
  try {
    return NextResponse.json({
      professorReply: await provider.generateProfessorReply(context, messages),
      mode: "live",
      notice: null,
    });
  } catch (error) {
    logAiFallback({ operation: "practice", model: provider.modelFor("practice"), error, elapsedMs: Date.now() - startedAt });
    return NextResponse.json({
      professorReply: await demoProvider.generateProfessorReply(context, messages),
      mode: "demo",
      notice: "Live AI was unavailable, so the guided demo continued safely.",
    });
  }
}
