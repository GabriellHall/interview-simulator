"use client";

import { useState } from "react";
import type { Question, AnswerMode } from "@/lib/types";

interface Props {
  question: Question;
  onSubmit: (mode: AnswerMode, content: string) => void;
  submitting: boolean;
}

export function AnswerInput({ question, onSubmit, submitting }: Props) {
  const [mode, setMode] = useState<AnswerMode>("free");
  const [text, setText] = useState("");
  const [choice, setChoice] = useState<string>("");

  const canSubmit = mode === "free" ? text.trim().length > 0 : choice.length > 0;

  return (
    <div className="space-y-5">
      <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-1 text-sm">
        <button
          type="button"
          onClick={() => setMode("free")}
          className={`px-4 py-1.5 rounded-md font-medium transition ${
            mode === "free" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
          }`}
        >
          Free-form
        </button>
        <button
          type="button"
          onClick={() => setMode("mcq")}
          className={`px-4 py-1.5 rounded-md font-medium transition ${
            mode === "mcq" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
          }`}
        >
          Multiple choice
        </button>
      </div>

      {mode === "free" ? (
        <textarea
          rows={8}
          placeholder="Walk through your answer. For behavioral questions, cover Situation, Task, Action, Result."
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm shadow-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-100 focus:outline-none"
        />
      ) : (
        <div className="space-y-2">
          {question.multipleChoice.map((opt) => {
            const selected = choice === opt.label;
            return (
              <button
                type="button"
                key={opt.label}
                onClick={() => setChoice(opt.label)}
                className={`w-full text-left rounded-xl border px-4 py-3 transition ${
                  selected
                    ? "border-brand-500 bg-brand-50 ring-2 ring-brand-100"
                    : "border-slate-200 hover:border-slate-300 bg-white"
                }`}
              >
                <div className="flex items-start gap-3">
                  <span
                    className={`flex-shrink-0 h-6 w-6 rounded-md text-xs font-bold flex items-center justify-center ${
                      selected ? "bg-brand-600 text-white" : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {opt.label}
                  </span>
                  <span className="text-sm text-slate-800">{opt.text}</span>
                </div>
              </button>
            );
          })}
        </div>
      )}

      <div className="flex justify-end">
        <button
          type="button"
          disabled={!canSubmit || submitting}
          onClick={() => {
            const content =
              mode === "free"
                ? text
                : `Option ${choice}: ${question.multipleChoice.find((o) => o.label === choice)?.text ?? ""}`;
            onSubmit(mode, content);
          }}
          className="rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-soft hover:bg-brand-700 transition disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {submitting ? "Analyzing…" : "Submit answer"}
        </button>
      </div>
    </div>
  );
}
