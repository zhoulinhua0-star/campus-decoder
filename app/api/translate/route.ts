import { NextResponse } from "next/server";
import { getAiProvider } from "@/lib/ai/providers";
import { translationRequestSchema } from "@/lib/ai/schemas";

export async function POST(request: Request) {
  const parsed = translationRequestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Enter a Chinese draft before converting it to English." }, { status: 400 });
  }

  const provider = getAiProvider();
  if (provider.mode === "demo") {
    return NextResponse.json({
      error: "Natural-English conversion needs live AI. Your Chinese draft has been kept so you can continue editing it.",
    }, { status: 503 });
  }

  try {
    return NextResponse.json({
      translation: await provider.translateToNaturalEnglish(parsed.data.text),
      mode: "live",
    });
  } catch {
    return NextResponse.json({
      error: "The English conversion is temporarily unavailable. Your Chinese draft has been kept—please try again.",
    }, { status: 502 });
  }
}
