export type QuestionType = "behavioral" | "case" | "situational";
export type Difficulty = "easy" | "medium" | "hard";
export type AnswerMode = "free" | "mcq";

export interface Profile {
  industry: string;
  yearsExperience: string;
  currentRole: string;
  targetRole: string;
  careerGoals: string;
  strengths?: string;
}

export interface SessionConfig {
  type: QuestionType;
  difficulty: Difficulty;
  jdText?: string;
}

export interface Question {
  id: string;
  prompt: string;
  category: QuestionType;
  starRubric?: string;
  multipleChoice: { label: string; text: string }[];
  modelAnswerOutline: string;
}

export interface Feedback {
  score: number;
  strengths: string[];
  improvements: string[];
  starBreakdown?: {
    situation: string;
    task: string;
    action: string;
    result: string;
  };
  suggestedRevision: string;
}

export interface InterviewSession {
  id: string;
  createdAt: number;
  profile: Profile;
  config: SessionConfig;
  questions: Question[];
  currentIndex: number;
  answers: Record<string, { mode: AnswerMode; content: string; feedback?: Feedback }>;
}
