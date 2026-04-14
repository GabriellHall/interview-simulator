import type { Feedback } from "@/lib/types";

interface Props {
  feedback: Feedback;
}

function ScoreBadge({ score }: { score: number }) {
  const color =
    score >= 8 ? "bg-emerald-100 text-emerald-800" :
    score >= 6 ? "bg-amber-100 text-amber-800" :
    "bg-rose-100 text-rose-800";
  return (
    <div className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold ${color}`}>
      Score: {score}/10
    </div>
  );
}

export function FeedbackPanel({ feedback }: Props) {
  return (
    <div className="space-y-6">
      <div>
        <ScoreBadge score={feedback.score} />
      </div>

      <section className="rounded-2xl bg-white shadow-soft border border-slate-100 p-6">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-emerald-700">Strengths</h3>
        <ul className="mt-3 space-y-2">
          {feedback.strengths.map((s, i) => (
            <li key={i} className="flex gap-2 text-slate-700 text-sm">
              <span className="text-emerald-600 mt-0.5">✓</span>
              <span>{s}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-2xl bg-white shadow-soft border border-slate-100 p-6">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-rose-700">Areas for improvement</h3>
        <ul className="mt-3 space-y-2">
          {feedback.improvements.map((s, i) => (
            <li key={i} className="flex gap-2 text-slate-700 text-sm">
              <span className="text-rose-600 mt-0.5">→</span>
              <span>{s}</span>
            </li>
          ))}
        </ul>
      </section>

      {feedback.starBreakdown && (
        <section className="rounded-2xl bg-white shadow-soft border border-slate-100 p-6">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-brand-700">STAR breakdown</h3>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            {(["situation", "task", "action", "result"] as const).map((k) => (
              <div key={k} className="rounded-lg bg-slate-50 p-4">
                <div className="text-xs font-semibold uppercase text-slate-500">{k}</div>
                <div className="mt-1 text-slate-800">{feedback.starBreakdown?.[k]}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="rounded-2xl bg-gradient-to-br from-brand-50 to-white shadow-soft border border-brand-100 p-6">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-brand-700">Suggested revision</h3>
        <p className="mt-3 text-slate-800 text-sm whitespace-pre-wrap leading-relaxed">{feedback.suggestedRevision}</p>
      </section>
    </div>
  );
}
