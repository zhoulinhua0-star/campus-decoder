import { NextResponse } from "next/server";
import { demoProvider, getAiProvider } from "@/lib/ai/providers";
import { contextRequestSchema } from "@/lib/ai/schemas";

export async function POST(request: Request) {
  const parsed = contextRequestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Please check the situation details and try again." }, { status: 400 });
  }

  const chinese = parsed.data.context.preferredLanguage === "简体中文";
  const provider = getAiProvider();
  if (provider.mode === "demo") {
    return NextResponse.json({
      guidance: await provider.generateContextGuidance(parsed.data.context),
      mode: "demo",
      notice: chinese
        ? "Grounded Demo 指导会根据你填写的内容和固定的辅导规则生成；它不是 AI 个性化分析。"
        : "Grounded Demo guidance uses the details you entered with fixed coaching rules; it is not personalized AI analysis.",
    });
  }

  try {
    return NextResponse.json({
      guidance: await provider.generateContextGuidance(parsed.data.context),
      mode: "live",
      notice: null,
    });
  } catch {
    return NextResponse.json({
      guidance: await demoProvider.generateContextGuidance(parsed.data.context),
      mode: "demo",
      notice: chinese
        ? "实时语境指导暂时不可用，因此系统改用你填写的内容生成 Grounded Demo 指导。"
        : "Live context coaching was unavailable, so grounded Demo guidance was created from your entries instead.",
    });
  }
}
