"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FeedbackPanel } from "@/components/FeedbackPanel";
import { loadSession, saveSession, clearSession } from "@/lib/storage";
import type { InterviewSession } from "@/lib/types";

export default function FeedbackPage() {
  const router = useRouter();
  const [session, setSession] = useState<InterviewSession | null>(null);

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
  const entry = q ? session.answers[q.id] : undefined;
  const feedback = entry?.feedback;

  if (!q || !feedback) {
    return (
      <div className="rounded-2xl bg-white shadow-soft border border-slate-100 p-8 text-slate-600">
        No feedback yet. <Link href="/interview" className="text-brand-600 font-semibold">Go answer a question →</Link>
      </div>
    );
  }

  const isLast = session.currentIndex >= session.questions.length - 1;

  const handleNext = () => {
    const updated: InterviewSession = { ...session, currentIndex: session.currentIndex + 1 };
    saveSession(updated);
    router.push("/interview");
  };

  const handleNewSession = () => {
    clearSession();
    router.push("/setup");
  };

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Feedback · Question {session.currentIndex + 1} of {session.questions.length}
          </div>
          <h1 className="mt-2 text-2xl font-bold text-slate-900">{q.prompt}</h1>
        </div>
      </div>

      <section className="rounded-2xl bg-slate-50 border border-slate-200 p-6">
        <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Your answer</div>
        <p className="mt-2 text-sm text-slate-800 whitespace-pre-wrap leading-relaxed">{entry?.content}</p>
      </section>

      <FeedbackPanel feedback={feedback} />

      <div className="flex justify-between">
        <button
          onClick={handleNewSession}
          className="rounded-lg bg-white border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:border-slate-300 transition"
        >
          New session
        </button>
        {!isLast ? (
          <button
            onClick={handleNext}
            className="rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-soft hover:bg-brand-700 transition"
          >
            Next question →
          </button>
        ) : (
          <button
            onClick={handleNewSession}
            className="rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-soft hover:bg-brand-700 transition"
          >
            Finish & start new
          </button>
        )}
      </div>
    </div>
  );
}
