import { NextResponse } from "next/server";
import { demoProvider, getAiProvider } from "@/lib/ai/providers";
import { contextRequestSchema } from "@/lib/ai/schemas";
import { logAiFallback } from "@/lib/ai/telemetry";

export async function POST(request: Request) {
  const parsed = contextRequestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Please check the situation details and try again." }, { status: 400 });
  }

  const provider = getAiProvider();
  if (provider.mode === "demo") {
    return NextResponse.json({
      guidance: await provider.generateContextGuidance(parsed.data.context),
      mode: "demo",
      notice: "Grounded Demo guidance uses the details you entered with fixed coaching rules; it is not personalized AI analysis.",
    });
  }

  const startedAt = Date.now();
  try {
    return NextResponse.json({
      guidance: await provider.generateContextGuidance(parsed.data.context),
      mode: "live",
      notice: null,
    });
  } catch (error) {
    logAiFallback({ operation: "context", model: provider.modelFor("context"), error, elapsedMs: Date.now() - startedAt });
    return NextResponse.json({
      guidance: await demoProvider.generateContextGuidance(parsed.data.context),
      mode: "demo",
      notice: "Live context coaching was unavailable, so grounded Demo guidance was created from your entries instead.",
    });
  }
}
