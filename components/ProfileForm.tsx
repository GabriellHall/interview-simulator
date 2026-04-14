"use client";

import { useState } from "react";
import type { Profile } from "@/lib/types";

interface Props {
  initial: Profile | null;
  onSave: (profile: Profile) => void;
}

const empty: Profile = {
  industry: "",
  yearsExperience: "",
  currentRole: "",
  targetRole: "",
  careerGoals: "",
  strengths: "",
};

export function ProfileForm({ initial, onSave }: Props) {
  const [p, setP] = useState<Profile>(initial ?? empty);

  const field = (label: string, key: keyof Profile, placeholder: string, textarea = false) => (
    <label className="block">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      {textarea ? (
        <textarea
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-100 focus:outline-none"
          rows={3}
          placeholder={placeholder}
          value={p[key] ?? ""}
          onChange={(e) => setP({ ...p, [key]: e.target.value })}
        />
      ) : (
        <input
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-100 focus:outline-none"
          placeholder={placeholder}
          value={p[key] ?? ""}
          onChange={(e) => setP({ ...p, [key]: e.target.value })}
        />
      )}
    </label>
  );

  return (
    <form
      className="space-y-5"
      onSubmit={(e) => {
        e.preventDefault();
        onSave(p);
      }}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {field("Industry", "industry", "e.g. Fintech, Biotech, Consulting")}
        {field("Years of experience", "yearsExperience", "e.g. 3")}
        {field("Current role", "currentRole", "e.g. Associate PM")}
        {field("Target role", "targetRole", "e.g. Senior PM at an AI company")}
      </div>
      {field("Career goals", "careerGoals", "What are you aiming for in the next 1-3 years?", true)}
      {field("Key strengths (optional)", "strengths", "What do you want interviewers to know?", true)}
      <div className="flex justify-end">
        <button
          type="submit"
          className="rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-soft hover:bg-brand-700 transition"
        >
          Save profile
        </button>
      </div>
    </form>
  );
}
