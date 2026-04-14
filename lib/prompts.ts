import type { Profile, QuestionType, Difficulty } from "./types";

export function buildSystemPrompt(profile: Profile, jdText?: string): string {
  const jdBlock = jdText
    ? `\n\nTARGET JOB DESCRIPTION (tailor questions and feedback to this role):\n"""\n${jdText.slice(0, 8000)}\n"""\n`
    : "";

  return `You are an expert interview coach and hiring manager with deep experience across industries. Your job is to run a realistic, high-signal interview practice session that is tailored to the candidate below.

CANDIDATE PROFILE:
- Industry: ${profile.industry || "(not specified)"}
- Years of experience: ${profile.yearsExperience || "(not specified)"}
- Current role: ${profile.currentRole || "(not specified)"}
- Target role: ${profile.targetRole || "(not specified)"}
- Career goals: ${profile.careerGoals || "(not specified)"}
${profile.strengths ? `- Self-reported strengths: ${profile.strengths}` : ""}
${jdBlock}

RULES:
- Calibrate every question to the candidate's experience level and target role.
- Behavioral questions must be STAR-compatible (Situation, Task, Action, Result).
- Case questions should be open-ended and probe structured thinking.
- Situational judgment questions should describe a realistic workplace scenario and ask what the candidate would do.
- Multiple-choice options must all be plausible; exactly one should be clearly the strongest. Label options A/B/C/D.
- Feedback must be specific, actionable, and reference concrete phrases from the candidate's answer when possible.
- Never invent facts about the candidate beyond what is in the profile.
- Always produce output via the provided tool. Never return prose outside the tool call.`;
}

export function buildGenerateUserPrompt(type: QuestionType, difficulty: Difficulty, count = 5): string {
  const typeLabel: Record<QuestionType, string> = {
    behavioral: "behavioral (STAR method)",
    case: "open-ended case",
    situational: "situational judgment",
  };
  return `Generate ${count} ${difficulty}-difficulty ${typeLabel[type]} interview questions for this candidate. For each question, also produce 4 multiple-choice answer options (A-D) representing distinct plausible responses, and a brief outline of what a strong answer would include. For behavioral questions, include a short STAR rubric describing what a great Situation/Task/Action/Result would look like. Call the emit_questions tool with the result.`;
}

export function buildEvaluateUserPrompt(
  question: string,
  answer: string,
  answerMode: "free" | "mcq",
  category: QuestionType,
): string {
  const header =
    answerMode === "mcq"
      ? `The candidate selected this multiple-choice option:`
      : `The candidate wrote this free-form answer:`;
  const starNote =
    category === "behavioral"
      ? "\n\nBecause this is a behavioral question, evaluate it against the STAR framework and fill in starBreakdown."
      : "";
  return `QUESTION:\n"""\n${question}\n"""\n\n${header}\n"""\n${answer}\n"""${starNote}\n\nProvide detailed, specific feedback. Call the emit_feedback tool with strengths, improvements, a 1-10 score, and a suggested revision (a short rewritten version of the candidate's answer that would score higher).`;
}

export const GENERATE_TOOL = {
  name: "emit_questions",
  description: "Emit the generated interview questions.",
  input_schema: {
    type: "object" as const,
    properties: {
      questions: {
        type: "array",
        items: {
          type: "object",
          properties: {
            id: { type: "string" },
            prompt: { type: "string" },
            category: { type: "string", enum: ["behavioral", "case", "situational"] },
            starRubric: { type: "string" },
            multipleChoice: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  label: { type: "string" },
                  text: { type: "string" },
                },
                required: ["label", "text"],
              },
            },
            modelAnswerOutline: { type: "string" },
          },
          required: ["id", "prompt", "category", "multipleChoice", "modelAnswerOutline"],
        },
      },
    },
    required: ["questions"],
  },
};

export const EVALUATE_TOOL = {
  name: "emit_feedback",
  description: "Emit detailed feedback for the candidate's answer.",
  input_schema: {
    type: "object" as const,
    properties: {
      score: { type: "number", description: "Overall score from 1 to 10" },
      strengths: { type: "array", items: { type: "string" } },
      improvements: { type: "array", items: { type: "string" } },
      starBreakdown: {
        type: "object",
        properties: {
          situation: { type: "string" },
          task: { type: "string" },
          action: { type: "string" },
          result: { type: "string" },
        },
      },
      suggestedRevision: { type: "string" },
    },
    required: ["score", "strengths", "improvements", "suggestedRevision"],
  },
};
