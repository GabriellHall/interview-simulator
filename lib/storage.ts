import type { Profile, InterviewSession, SessionHistoryEntry } from "./types";

const PROFILE_KEY = "is.profile";
const SESSION_KEY = "is.session";
const HISTORY_KEY = "is.history";
const HISTORY_LIMIT = 20;

export function loadProfile(): Profile | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    return raw ? (JSON.parse(raw) as Profile) : null;
  } catch {
    return null;
  }
}

export function saveProfile(profile: Profile): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}

export function loadSession(): InterviewSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as InterviewSession) : null;
  } catch {
    return null;
  }
}

export function saveSession(session: InterviewSession): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearSession(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(SESSION_KEY);
}

export function loadHistory(): SessionHistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? (JSON.parse(raw) as SessionHistoryEntry[]) : [];
  } catch {
    return [];
  }
}

export function addToHistory(session: InterviewSession): void {
  if (typeof window === "undefined") return;
  const scores = session.questions
    .map((q) => session.answers[q.id]?.feedback?.score)
    .filter((s): s is number => s !== undefined);

  if (scores.length === 0) return;

  const entry: SessionHistoryEntry = {
    id: session.id,
    createdAt: session.createdAt,
    config: { type: session.config.type, difficulty: session.config.difficulty },
    questionCount: scores.length,
    averageScore: Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10,
    scores,
  };

  const history = loadHistory();
  const deduped = history.filter((e) => e.id !== entry.id);
  const updated = [entry, ...deduped].slice(0, HISTORY_LIMIT);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
}

export function clearHistory(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(HISTORY_KEY);
}
