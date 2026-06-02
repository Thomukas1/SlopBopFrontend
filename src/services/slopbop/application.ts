import { API_URL, apiFetch } from './client';

// Static form data, served from memory by the backend. Fetch once on mount and
// cache — Tiers 2–4 are rendered entirely from this.
export interface FormConfig {
  scale: string[];    // Likert statements, in source order (weights are server-side only)
  questions: {        // audition buckets — pick one question from each
    self: string[];
    past: string[];
    others: string[];
    loves: string[];
  };
  zodiac: string[];   // 12 signs for the dropdown
  genres: string[];   // genre options for the multi-select
}

// One filled-in audition answer. `question` is the full text that was asked
// (the source of truth), sent back alongside the user's answer.
export interface AuditionAnswer {
  question: string;
  answer: string; // 1–300 chars
}

// Everything the form collects. Wire format is snake_case; the backend is the
// trust boundary, so these mirror its validation rules in the comments only.
export interface ApplicationPayload {
  nickname: string;            // 1–32 chars, [a-zA-Z0-9_-] only
  gender: 'male' | 'female';
  bio: string;                 // 1–140 chars
  scale_answers: number[];     // exactly config.scale.length ints, each 1–5, in source order
  audition_answers: AuditionAnswer[]; // exactly 4
  zodiac_sign: string;         // one of config.zodiac
  favorite_genres: string[];   // exactly 3 distinct, each from config.genres
  favorite_singer: string;     // 1–32 chars
  x_handle?: string | null;    // optional; leading @ stripped server-side; [a-zA-Z0-9_], <=32
  email?: string | null;       // optional; standard email, <=100
}

// Returned on a successful 201. `archetype` is the derived personality result —
// show it on the thank-you screen. `scale_answers` are never returned.
export interface ApplicationResult {
  nickname: string;
  archetype: string;
}

// Discriminated outcome of submit: success carries the result, validation
// failure carries the field→message map. A 500 (or network error) rejects.
export type SubmitOutcome =
  | { ok: true; data: ApplicationResult }
  | { ok: false; errors: Record<string, string> };

export const fetchFormConfig = () =>
  apiFetch<FormConfig>('/slopbop/form/config');

// POST the filled form. Bypasses `apiFetch` because the 400 response carries a
// field-error body we need to read rather than discard.
export async function submitApplication(
  payload: ApplicationPayload,
): Promise<SubmitOutcome> {
  const res = await fetch(`${API_URL}/slopbop/form/apply`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json();

  if (res.status === 201) return { ok: true, data: data as ApplicationResult };
  if (res.status === 400) {
    return { ok: false, errors: (data.errors ?? {}) as Record<string, string> };
  }
  throw new Error(data.error || 'Submit failed');
}

const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

// One random question from each of the 4 audition buckets, in fixed order.
// Hold the result in state for the form's lifetime and submit each as the
// `question` field of an audition answer. Re-rolling on revisit is expected.
export function pickAuditionQuestions(q: FormConfig['questions']): string[] {
  return [pick(q.self), pick(q.past), pick(q.others), pick(q.loves)];
}
