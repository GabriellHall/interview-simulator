"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ProfileForm } from "@/components/ProfileForm";
import { loadProfile, saveProfile, saveSession } from "@/lib/storage";
import { DEFAULT_PROFILE } from "@/lib/default-profile";
import type { Profile, QuestionType, Difficulty, InterviewSession } from "@/lib/types";

const TIMER_OPTIONS: { label: string; value: number }[] = [
  { label: "None", value: 0 },
  { label: "2 min", value: 120 },
  { label: "3 min", value: 180 },
  { label: "5 min", value: 300 },
];

export default function SetupPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [type, setType] = useState<QuestionType>("behavioral");
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [jdUrl, setJdUrl] = useState("");
  const [jdText, setJdText] = useState("");
  const [fetchingJd, setFetchingJd] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    setProfile(loadProfile() ?? DEFAULT_PROFILE);
  }, []);

  const handleProfileSave = (p: Profile) => {
    saveProfile(p);
    setProfile(p);
  };

  const handleFetchJd = async () => {
    if (!jdUrl) return;
    setFetchingJd(true);
    setError(null);
    try {
      const res = await fetch("/api/fetch-jd", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: jdUrl }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Fetch failed");
      setJdText(data.text);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Fetch failed");
    } finally {
      setFetchingJd(false);
    }
  };

  const handleStart = async () => {
    if (!profile) return;
    setGenerating(true);
    setError(null);
    try {
      const res = await fetch("/api/generate-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile, type, difficulty, jdText: jdText || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to generate questions");

      const session: InterviewSession = {
        id: `s_${Date.now()}`,
        createdAt: Date.now(),
        profile,
        config: { type, difficulty, jdText: jdText || undefined, timerSeconds: timerSeconds || undefined },
        questions: data.questions,
        currentIndex: 0,
        answers: {},
      };
      saveSession(session);
      router.push("/interview");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Set up your session</h1>
        <p className="mt-2 text-slate-600">
          Your profile is pre-filled with your background. Adjust anything before starting.
        </p>
      </div>

      <section className="rounded-2xl bg-white shadow-soft border border-slate-100 p-8">
        <h2 className="text-lg font-semibold text-slate-900">Your background</h2>
        <p className="text-sm text-slate-500 mt-1 mb-6">Used to personalize every question and feedback response.</p>
        <ProfileForm initial={profile} onSave={handleProfileSave} />
      </section>

      {profile && (
        <section className="rounded-2xl bg-white shadow-soft border border-slate-100 p-8 space-y-6">
          <h2 className="text-lg font-semibold text-slate-900">This session</h2>

          <div>
            <label className="text-sm font-medium text-slate-700">Question type</label>
            <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-3">
              {([
                ["behavioral", "Behavioral", "STAR-format questions about past experiences"],
                ["case", "Case", "Open-ended problem solving"],
                ["situational", "Situational", "Judgment calls in hypothetical scenarios"],
              ] as const).map(([val, label, desc]) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setType(val)}
                  className={`text-left rounded-xl border px-4 py-3 transition ${
                    type === val
                      ? "border-brand-500 bg-brand-50 ring-2 ring-brand-100"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="font-semibold text-slate-900">{label}</div>
                  <div className="text-xs text-slate-500 mt-1">{desc}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-8">
            <div>
              <label className="text-sm font-medium text-slate-700">Difficulty</label>
              <div className="mt-2 inline-flex rounded-lg border border-slate-200 bg-slate-50 p-1 text-sm">
                {(["easy", "medium", "hard"] as const).map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDifficulty(d)}
                    className={`px-4 py-1.5 rounded-md font-medium capitalize transition ${
                      difficulty === d ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">Time limit per question</label>
              <div className="mt-2 inline-flex rounded-lg border border-slate-200 bg-slate-50 p-1 text-sm">
                {TIMER_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setTimerSeconds(opt.value)}
                    className={`px-4 py-1.5 rounded-md font-medium transition ${
                      timerSeconds === opt.value
                        ? "bg-white text-slate-900 shadow-sm"
                        : "text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium text-slate-700">Job description (optional)</label>
            <div className="flex gap-2">
              <input
                type="url"
                placeholder="https://example.com/jobs/senior-pm"
                value={jdUrl}
                onChange={(e) => setJdUrl(e.target.value)}
                className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-100 focus:outline-none"
              />
              <button
                type="button"
                onClick={handleFetchJd}
                disabled={!jdUrl || fetchingJd}
                className="rounded-lg bg-slate-900 text-white px-4 py-2 text-sm font-semibold hover:bg-slate-800 transition disabled:opacity-40"
              >
                {fetchingJd ? "Fetching…" : "Fetch URL"}
              </button>
            </div>
            <div className="text-xs text-slate-500">Or paste the full text below:</div>
            <textarea
              rows={6}
              placeholder="Paste the job description text here (works even if URL fetching fails)"
              value={jdText}
              onChange={(e) => setJdText(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-100 focus:outline-none"
            />
          </div>

          {error && (
            <div className="rounded-lg bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 text-sm">
              {error}
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleStart}
              disabled={generating}
              className="rounded-lg bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-soft hover:bg-brand-700 transition disabled:opacity-40"
            >
              {generating ? "Generating questions…" : "Start interview →"}
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
