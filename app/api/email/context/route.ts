import { NextResponse } from "next/server";
import { demoProvider, getAiProvider } from "@/lib/ai/providers";
import { emailContextRequestSchema } from "@/lib/ai/email-schemas";
import { logAiFallback } from "@/lib/ai/telemetry";

export async function POST(request: Request) {
  const parsed = emailContextRequestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Please check the email details and try again." }, { status: 400 });
  }

  const provider = getAiProvider();
  if (provider.mode === "demo") {
    return NextResponse.json({
      guidance: await provider.generateEmailContextGuidance(parsed.data.context),
      mode: "demo",
      notice: "Grounded Demo guidance uses your entries with fixed coaching rules; it is not personalized AI analysis.",
    });
  }

  const startedAt = Date.now();
  try {
    return NextResponse.json({
      guidance: await provider.generateEmailContextGuidance(parsed.data.context),
      mode: "live",
      notice: null,
    });
  } catch (error) {
    logAiFallback({ operation: "context", model: provider.modelFor("context"), error, elapsedMs: Date.now() - startedAt });
    return NextResponse.json({
      guidance: await demoProvider.generateEmailContextGuidance(parsed.data.context),
      mode: "demo",
      notice: "Live email context coaching was unavailable, so grounded Demo guidance was created from your entries instead.",
    });
  }
}
