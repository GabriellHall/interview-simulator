import type { Question } from "@/lib/types";

interface Props {
  question: Question;
  index: number;
  total: number;
}

const categoryLabel: Record<Question["category"], string> = {
  behavioral: "Behavioral · STAR",
  case: "Case",
  situational: "Situational judgment",
};

export function QuestionCard({ question, index, total }: Props) {
  return (
    <div className="rounded-2xl bg-white shadow-soft border border-slate-100 p-8">
      <div className="flex items-center justify-between text-xs font-medium text-slate-500 uppercase tracking-wider">
        <span>
          Question {index + 1} of {total}
        </span>
        <span className="rounded-full bg-brand-50 text-brand-700 px-3 py-1">
          {categoryLabel[question.category]}
        </span>
      </div>
      <h2 className="mt-4 text-2xl font-semibold text-slate-900 leading-snug">{question.prompt}</h2>
      {question.starRubric && (
        <p className="mt-3 text-sm text-slate-500 italic">Rubric hint: {question.starRubric}</p>
      )}
    </div>
  );
}
