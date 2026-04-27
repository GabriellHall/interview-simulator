"use client";

import { useState } from "react";
import Link from "next/link";
import { clearHistory, loadHistory } from "@/lib/storage";
import type { SessionHistoryEntry } from "@/lib/types";

const TYPE_LABEL: Record<string, string> = {
  behavioral: "Behavioral",
  case: "Case",
  situational: "Situational",
};

const DIFFICULTY_COLOR: Record<string, string> = {
  easy: "bg-emerald-50 text-emerald-700",
  medium: "bg-amber-50 text-amber-700",
  hard: "bg-rose-50 text-rose-700",
};

function MiniScoreRing({ score }: { score: number }) {
  const size = 44;
  const r = (size - 6) / 2;
  const circ = 2 * Math.PI * r;
  const fill = (score / 10) * circ;
  const color = score >= 8 ? "#059669" : score >= 6 ? "#d97706" : "#e11d48";

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#e2e8f0" strokeWidth={5} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={5}
        strokeDasharray={`${fill} ${circ - fill}`}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      <text x={size / 2} y={size / 2 + 4} textAnchor="middle" fontSize={11} fontWeight={700} fill={color}>
        {score}
      </text>
    </svg>
  );
}

export default function HistoryPage() {
  const [history, setHistory] = useState<SessionHistoryEntry[]>(() => loadHistory());
  const [confirming, setConfirming] = useState(false);

  const handleClear = () => {
    if (!confirming) {
      setConfirming(true);
      return;
    }
    clearHistory();
    setHistory([]);
    setConfirming(false);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Session history</h1>
          <p className="mt-2 text-slate-600">Your last {history.length > 0 ? history.length : ""} practice sessions.</p>
        </div>
        <Link
          href="/setup"
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-soft hover:bg-brand-700 transition"
        >
          New session →
        </Link>
      </div>

      {history.length === 0 ? (
        <div className="rounded-2xl bg-white shadow-soft border border-slate-100 p-12 text-center">
          <div className="text-4xl mb-4">📋</div>
          <h2 className="text-lg font-semibold text-slate-900">No sessions yet</h2>
          <p className="mt-2 text-sm text-slate-500">
            Complete a practice session to start building your history.
          </p>
          <Link
            href="/setup"
            className="mt-6 inline-block rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-soft hover:bg-brand-700 transition"
          >
            Start practicing →
          </Link>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {history.map((entry) => {
              const date = new Date(entry.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              });
              const time = new Date(entry.createdAt).toLocaleTimeString("en-US", {
                hour: "numeric",
                minute: "2-digit",
              });

              return (
                <div
                  key={entry.id}
                  className="rounded-xl bg-white shadow-soft border border-slate-100 px-6 py-4 flex items-center gap-4"
                >
                  <div className="flex-shrink-0">
                    <MiniScoreRing score={entry.averageScore} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-semibold text-slate-900">
                        {TYPE_LABEL[entry.config.type] ?? entry.config.type}
                      </span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${
                          DIFFICULTY_COLOR[entry.config.difficulty] ?? "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {entry.config.difficulty}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-slate-400">
                      {date} at {time} · {entry.questionCount} question{entry.questionCount !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <div className="text-sm font-semibold text-slate-700">Avg {entry.averageScore}/10</div>
                    <div className="mt-1 flex gap-1 justify-end">
                      {entry.scores.map((s, i) => (
                        <div
                          key={i}
                          className="h-1.5 w-1.5 rounded-full"
                          style={{
                            backgroundColor:
                              s >= 8 ? "#059669" : s >= 6 ? "#d97706" : "#e11d48",
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleClear}
              className={`rounded-lg border px-4 py-2 text-sm font-medium transition ${
                confirming
                  ? "border-rose-300 bg-rose-50 text-rose-700 hover:bg-rose-100"
                  : "border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-700"
              }`}
            >
              {confirming ? "Confirm clear history" : "Clear history"}
            </button>
            {confirming && (
              <button
                onClick={() => setConfirming(false)}
                className="ml-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-500 hover:border-slate-300 transition"
              >
                Cancel
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
