"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { QuestionCard } from "@/components/QuestionCard";
import { AnswerInput } from "@/components/AnswerInput";
import { loadSession, saveSession } from "@/lib/storage";
import type { InterviewSession, AnswerMode } from "@/lib/types";

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function TimerDisplay({ remaining, total }: { remaining: number; total: number }) {
  const pct = total > 0 ? remaining / total : 1;
  const isRed = remaining <= 30;
  const isAmber = !isRed && remaining <= 60;
  const colorClass = isRed
    ? "text-rose-600 border-rose-200 bg-rose-50"
    : isAmber
    ? "text-amber-600 border-amber-200 bg-amber-50"
    : "text-slate-600 border-slate-200 bg-slate-50";

  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm font-mono font-semibold transition-colors ${colorClass} ${
        isRed ? "animate-pulse" : ""
      }`}
    >
      <svg className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.5" />
        <path
          d={`M8 8 L8 3`}
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          style={{ transform: `rotate(${(1 - pct) * 360}deg)`, transformOrigin: "8px 8px" }}
        />
      </svg>
      {formatTime(remaining)}
    </div>
  );
}

export default function InterviewPage() {
  const router = useRouter();
  const [session, setSession] = useState<InterviewSession | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [timeExpired, setTimeExpired] = useState(false);
  const submitRef = useRef<((mode: AnswerMode, content: string) => void) | null>(null);
  const pendingAnswerRef = useRef<{ mode: AnswerMode; content: string } | null>(null);

  useEffect(() => {
    const s = loadSession();
    if (!s) {
      router.push("/setup");
      return;
    }
    setSession(s);
    if (s.config.timerSeconds) {
      setRemaining(s.config.timerSeconds);
      setTimeExpired(false);
    }
  }, [router]);

  // Reset timer when question changes
  useEffect(() => {
    if (!session?.config.timerSeconds) return;
    setRemaining(session.config.timerSeconds);
    setTimeExpired(false);
  }, [session?.currentIndex, session?.config.timerSeconds]);

  // Countdown tick
  useEffect(() => {
    if (remaining === null || remaining <= 0) return;
    const id = setInterval(() => {
      setRemaining((r) => {
        if (r === null || r <= 1) {
          clearInterval(id);
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [remaining !== null && remaining > 0 ? "running" : "stopped"]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-submit when timer hits 0
  useEffect(() => {
    if (remaining !== 0) return;
    setTimeExpired(true);
    const pending = pendingAnswerRef.current;
    if (pending && submitRef.current) {
      submitRef.current(pending.mode, pending.content);
    }
  }, [remaining]);

  if (!session) return null;

  const q = session.questions[session.currentIndex];
  if (!q) {
    router.push("/setup");
    return null;
  }

  const handleSubmit = async (mode: AnswerMode, content: string) => {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/evaluate-answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profile: session.profile,
          jdText: session.config.jdText,
          question: q,
          answer: content,
          answerMode: mode,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to evaluate");

      const updated: InterviewSession = {
        ...session,
        answers: {
          ...session.answers,
          [q.id]: { mode, content, feedback: data.feedback },
        },
      };
      saveSession(updated);
      setSession(updated);
      router.push("/feedback");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    } finally {
      setSubmitting(false);
    }
  };

  submitRef.current = handleSubmit;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <QuestionCard question={q} index={session.currentIndex} total={session.questions.length} />
        </div>
        {remaining !== null && (
          <div className="pt-8 pr-1">
            <TimerDisplay remaining={remaining} total={session.config.timerSeconds ?? 0} />
          </div>
        )}
      </div>

      {timeExpired && !submitting && (
        <div className="rounded-lg bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 text-sm font-medium">
          Time&apos;s up — submit your answer to continue.
        </div>
      )}

      <div className="rounded-2xl bg-white shadow-soft border border-slate-100 p-8">
        <AnswerInput
          question={q}
          onSubmit={handleSubmit}
          submitting={submitting}
          timeExpired={timeExpired}
          onAnswerChange={(mode, content) => {
            pendingAnswerRef.current = { mode, content };
          }}
        />
        {error && (
          <div className="mt-4 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 text-sm">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
