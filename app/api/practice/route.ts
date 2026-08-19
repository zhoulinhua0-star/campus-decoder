import { NextResponse } from "next/server";
import { getOpenAIClient, OPENAI_MODEL } from "@/lib/ai/client";
import { getMockProfessorReply } from "@/lib/ai/mock";
import { buildContextPrompt, OFFICE_HOURS_ROLEPLAY_PROMPT } from "@/lib/ai/prompts";
import { practiceRequestSchema } from "@/lib/ai/schemas";

export async function POST(request: Request) {
  const parsed = practiceRequestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Please check the practice details and try again." }, { status: 400 });
  }

  const { context, messages } = parsed.data;
  const openai = getOpenAIClient();

  if (!openai) {
    return NextResponse.json({
      professorReply: getMockProfessorReply(messages),
      mode: "demo",
      notice: "Demo responses are active. Add OPENAI_API_KEY for live role-play.",
    });
  }

  try {
    const response = await openai.responses.create({
      model: OPENAI_MODEL,
      input: [
        { role: "system", content: OFFICE_HOURS_ROLEPLAY_PROMPT },
        { role: "user", content: buildContextPrompt(context) },
        ...messages.map((message) => ({ role: message.role, content: message.content })),
      ],
    });

    const professorReply = response.output_text.trim();
    if (!professorReply) throw new Error("The model returned an empty response.");

    return NextResponse.json({ professorReply, mode: "live", notice: null });
  } catch {
    return NextResponse.json({
      professorReply: getMockProfessorReply(messages),
      mode: "demo",
      notice: "Live AI was unavailable, so the guided demo continued safely.",
    });
  }
}
