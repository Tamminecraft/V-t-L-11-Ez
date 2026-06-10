export const apiBase = import.meta.env.VITE_API_BASE || 'http://localhost:8787/api';

async function safeFetch(url: string, options: RequestInit = {}) {
  const res = await fetch(url, { ...options, credentials: 'include' });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || res.statusText || 'API error');
  }
  return res.json();
}

export type ProgressItem = {
  id: string;
  userId?: string;
  topic: string;
  status: string;
  value?: any;
  _savedAt?: string;
};

export async function fetchProgress(): Promise<ProgressItem[]> {
  return safeFetch(`${apiBase}/progress`);
}

export async function saveProgress(item: Omit<ProgressItem, 'id' | '_savedAt'>) {
  return safeFetch(`${apiBase}/progress`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(item),
  });
}

export type QuizScore = {
  id: string;
  userId?: string;
  quizId: string;
  score: number;
  maxScore: number;
  _savedAt?: string;
};

export async function fetchQuizScores(): Promise<QuizScore[]> {
  return safeFetch(`${apiBase}/quiz-scores`);
}

export async function saveQuizScore(item: Omit<QuizScore, 'id' | '_savedAt'>) {
  return safeFetch(`${apiBase}/quiz-scores`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(item),
  });
}
