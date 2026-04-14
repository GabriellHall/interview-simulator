import { NextResponse } from "next/server";
import { getAnthropic, MODEL } from "@/lib/anthropic";
import {
  buildSystemPrompt,
  buildEvaluateUserPrompt,
  EVALUATE_TOOL,
} from "@/lib/prompts";
import type { Profile, Question, AnswerMode, Feedback } from "@/lib/types";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      profile: Profile;
      jdText?: string;
      question: Question;
      answer: string;
      answerMode: AnswerMode;
    };

    const client = getAnthropic();
    const system = buildSystemPrompt(body.profile, body.jdText);
    const userPrompt = buildEvaluateUserPrompt(
      body.question.prompt,
      body.answer,
      body.answerMode,
      body.question.category,
    );

    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 1500,
      system: [
        {
          type: "text",
          text: system,
          cache_control: { type: "ephemeral" },
        },
      ],
      tools: [EVALUATE_TOOL],
      tool_choice: { type: "tool", name: "emit_feedback" },
      messages: [{ role: "user", content: userPrompt }],
    });

    const toolUse = response.content.find((c) => c.type === "tool_use");
    if (!toolUse || toolUse.type !== "tool_use") {
      return NextResponse.json({ error: "No tool use in response" }, { status: 500 });
    }
    const feedback = toolUse.input as Feedback;
    return NextResponse.json({ feedback });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
