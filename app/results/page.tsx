"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { addToHistory, clearSession, loadSession } from "@/lib/storage";
import type { InterviewSession } from "@/lib/types";

const TYPE_LABEL: Record<string, string> = {
  behavioral: "Behavioral · STAR",
  case: "Case",
  situational: "Situational",
};

const DIFFICULTY_LABEL: Record<string, string> = {
  easy: "Easy",
  medium: "Medium",
  hard: "Hard",
};

function ScoreRing({ score, size = 64 }: { score: number; size?: number }) {
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const fill = (score / 10) * circ;
  const color =
    score >= 8 ? "#059669" : score >= 6 ? "#d97706" : "#e11d48";

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#e2e8f0" strokeWidth={6} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={6}
        strokeDasharray={`${fill} ${circ - fill}`}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      <text x={size / 2} y={size / 2 + 5} textAnchor="middle" fontSize={13} fontWeight={700} fill={color}>
        {score}
      </text>
    </svg>
  );
}

function ScoreBadge({ score }: { score: number }) {
  const cls =
    score >= 8
      ? "bg-emerald-100 text-emerald-800"
      : score >= 6
      ? "bg-amber-100 text-amber-800"
      : "bg-rose-100 text-rose-800";
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${cls}`}>{score}/10</span>
  );
}

export default function ResultsPage() {
  const router = useRouter();
  const [session, setSession] = useState<InterviewSession | null>(null);

  useEffect(() => {
    const s = loadSession();
    if (!s) {
      router.push("/setup");
      return;
    }
    addToHistory(s);
    clearSession();
    setSession(s);
  }, [router]);

  if (!session) return null;

  const answered = session.questions.filter((q) => session.answers[q.id]?.feedback);
  const scores = answered.map((q) => session.answers[q.id].feedback!.score);
  const avg = scores.length
    ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10
    : 0;

  const green = scores.filter((s) => s >= 8).length;
  const amber = scores.filter((s) => s >= 6 && s < 8).length;
  const red = scores.filter((s) => s < 6).length;

  const weakest = [...answered].sort(
    (a, b) =>
      (session.answers[a.id].feedback?.score ?? 10) - (session.answers[b.id].feedback?.score ?? 10)
  )[0];

  const date = new Date(session.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap gap-2 items-center">
            <span className="inline-flex rounded-full bg-brand-50 text-brand-700 px-3 py-1 text-xs font-semibold uppercase tracking-wider">
              {TYPE_LABEL[session.config.type] ?? session.config.type}
            </span>
            <span className="inline-flex rounded-full bg-slate-100 text-slate-600 px-3 py-1 text-xs font-semibold uppercase tracking-wider">
              {DIFFICULTY_LABEL[session.config.difficulty] ?? session.config.difficulty}
            </span>
            <span className="text-xs text-slate-400">{date}</span>
          </div>
          <h1 className="mt-3 text-3xl font-bold text-slate-900">Session complete</h1>
        </div>
      </div>

      {/* Aggregate score */}
      <section className="rounded-2xl bg-white shadow-soft border border-slate-100 p-8">
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="flex-shrink-0">
            <ScoreRing score={avg} size={96} />
          </div>
          <div className="flex-1 space-y-1 text-center md:text-left">
            <div className="text-2xl font-bold text-slate-900">
              {avg >= 8 ? "Excellent performance" : avg >= 6 ? "Solid performance" : "Room to grow"}
            </div>
            <p className="text-sm text-slate-500">
              Average score across {answered.length} question{answered.length !== 1 ? "s" : ""}
            </p>
          </div>
          <div className="flex gap-6 text-center">
            <div>
              <div className="text-2xl font-bold text-emerald-600">{green}</div>
              <div className="text-xs text-slate-500 mt-0.5">Strong (8–10)</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-amber-600">{amber}</div>
              <div className="text-xs text-slate-500 mt-0.5">Good (6–7)</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-rose-600">{red}</div>
              <div className="text-xs text-slate-500 mt-0.5">Needs work (&lt;6)</div>
            </div>
          </div>
        </div>
      </section>

      {/* Question breakdown */}
      <section>
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Question breakdown</h2>
        <div className="space-y-3">
          {session.questions.map((q, i) => {
            const entry = session.answers[q.id];
            const fb = entry?.feedback;
            return (
              <div
                key={q.id}
                className="rounded-xl bg-white shadow-soft border border-slate-100 px-6 py-4 flex items-start gap-4"
              >
                <div className="flex-shrink-0 mt-0.5">
                  <div className="h-7 w-7 rounded-full bg-brand-50 text-brand-700 text-xs font-bold flex items-center justify-center">
                    {i + 1}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 line-clamp-2">{q.prompt}</p>
                  {entry && (
                    <p className="mt-1 text-xs text-slate-400 line-clamp-1">{entry.content}</p>
                  )}
                </div>
                <div className="flex-shrink-0">
                  {fb ? <ScoreBadge score={fb.score} /> : <span className="text-xs text-slate-400">Skipped</span>}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Suggested next step */}
      {weakest && session.answers[weakest.id]?.feedback && (
        <section className="rounded-2xl bg-gradient-to-br from-brand-50 to-white border border-brand-100 p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-brand-700">Suggested next step</h2>
          <p className="mt-2 text-slate-700 text-sm">
            Your lowest-scoring question was a{" "}
            <span className="font-semibold">{TYPE_LABEL[weakest.category]}</span> question (score:{" "}
            {session.answers[weakest.id].feedback!.score}/10). Consider practicing more{" "}
            <span className="font-semibold">{weakest.category}</span> questions to strengthen this area.
          </p>
          <Link
            href={`/setup`}
            className="mt-4 inline-block rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 transition"
          >
            Practice {weakest.category} questions →
          </Link>
        </section>
      )}

      {/* Actions */}
      <div className="flex justify-between">
        <Link
          href="/history"
          className="rounded-lg bg-white border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:border-slate-300 transition"
        >
          View history
        </Link>
        <Link
          href="/setup"
          className="rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-soft hover:bg-brand-700 transition"
        >
          Start new session →
        </Link>
      </div>
    </div>
  );
}
