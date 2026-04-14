import { NextResponse } from "next/server";
import { getAnthropic, MODEL } from "@/lib/anthropic";
import {
  buildSystemPrompt,
  buildGenerateUserPrompt,
  GENERATE_TOOL,
} from "@/lib/prompts";
import type { Profile, QuestionType, Difficulty, Question } from "@/lib/types";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      profile: Profile;
      type: QuestionType;
      difficulty: Difficulty;
      jdText?: string;
    };

    const client = getAnthropic();
    const system = buildSystemPrompt(body.profile, body.jdText);
    const userPrompt = buildGenerateUserPrompt(body.type, body.difficulty, 5);

    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 2500,
      system: [
        {
          type: "text",
          text: system,
          cache_control: { type: "ephemeral" },
        },
      ],
      tools: [GENERATE_TOOL],
      tool_choice: { type: "tool", name: "emit_questions" },
      messages: [{ role: "user", content: userPrompt }],
    });

    const toolUse = response.content.find((c) => c.type === "tool_use");
    if (!toolUse || toolUse.type !== "tool_use") {
      return NextResponse.json({ error: "No tool use in response" }, { status: 500 });
    }
    const input = toolUse.input as { questions: Question[] };
    // Ensure IDs exist
    const questions = input.questions.map((q, i) => ({
      ...q,
      id: q.id || `q_${Date.now()}_${i}`,
      category: body.type,
    }));
    return NextResponse.json({ questions });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
