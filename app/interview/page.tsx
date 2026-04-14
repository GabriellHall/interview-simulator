"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { QuestionCard } from "@/components/QuestionCard";
import { AnswerInput } from "@/components/AnswerInput";
import { loadSession, saveSession } from "@/lib/storage";
import type { InterviewSession, AnswerMode } from "@/lib/types";

export default function InterviewPage() {
  const router = useRouter();
  const [session, setSession] = useState<InterviewSession | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const s = loadSession();
    if (!s) {
      router.push("/setup");
      return;
    }
    setSession(s);
  }, [router]);

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

  return (
    <div className="space-y-6">
      <QuestionCard question={q} index={session.currentIndex} total={session.questions.length} />
      <div className="rounded-2xl bg-white shadow-soft border border-slate-100 p-8">
        <AnswerInput question={q} onSubmit={handleSubmit} submitting={submitting} />
        {error && (
          <div className="mt-4 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 text-sm">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
