import { NextResponse } from "next/server";
import { demoProvider, getAiProvider } from "@/lib/ai/providers";
import { groupContextRequestSchema } from "@/lib/ai/group-schemas";
import { logAiFallback } from "@/lib/ai/telemetry";

export async function POST(request: Request) {
  const parsed = groupContextRequestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Please check the group project details and try again." }, { status: 400 });

  const { context } = parsed.data;
  const provider = getAiProvider();
  if (provider.mode === "demo") {
    return NextResponse.json({
      guidance: await provider.generateGroupContextGuidance(context),
      mode: "demo",
      notice: "Grounded Demo guidance uses your entries with fixed coaching rules; it is not personalized AI analysis.",
    });
  }

  const startedAt = Date.now();
  try {
    return NextResponse.json({ guidance: await provider.generateGroupContextGuidance(context), mode: "live", notice: null });
  } catch (error) {
    logAiFallback({ operation: "context", model: provider.modelFor("context"), error, elapsedMs: Date.now() - startedAt });
    return NextResponse.json({
      guidance: await demoProvider.generateGroupContextGuidance(context),
      mode: "demo",
      notice: "Live AI was unavailable, so grounded Demo guidance is shown instead.",
    });
  }
}
