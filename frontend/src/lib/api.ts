// In production, API requests are proxied through SvelteKit (hooks.server.ts)
// In development, they go directly to the local backend
const API_BASE = '';

async function request<T>(path: string, opts?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...opts?.headers },
    ...opts
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || `Request failed: ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

// --- Universities ---
export const universities = {
  list: () => request<any[]>('/api/universities'),
  get: (id: string) => request<any>(`/api/universities/${id}`),
  create: (name: string) => request<any>('/api/universities', { method: 'POST', body: JSON.stringify({ name }) }),
  update: (id: string, name: string) => request<any>(`/api/universities/${id}`, { method: 'PUT', body: JSON.stringify({ name }) }),
  delete: (id: string) => request<void>(`/api/universities/${id}`, { method: 'DELETE' }),
  degrees: {
    list: (uniId: string) => request<any[]>(`/api/universities/${uniId}/degrees`),
    create: (uniId: string, name: string, code: string) =>
      request<any>(`/api/universities/${uniId}/degrees`, { method: 'POST', body: JSON.stringify({ name, code }) })
  }
};

// --- Challenges ---
export const challenges = {
  list: () => request<any[]>('/api/challenges'),
  get: (id: string) => request<any>(`/api/challenges/${id}`),
  update: (id: string, data: any) => request<any>(`/api/challenges/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  upload: (text: string, degreeId: string) =>
    request<any>('/api/challenges/upload', { method: 'POST', body: JSON.stringify({ text, degreeId }) }),
  regenerateNumbers: (id: string) => request<any>(`/api/challenges/${id}/regenerate-numbers`, { method: 'POST' }),
  publish: (id: string) => request<any>(`/api/challenges/${id}/publish`, { method: 'POST' })
};

// --- Applicants ---
export const applicants = {
  list: () => request<any[]>('/api/applicants'),
  get: (id: string) => request<any>(`/api/applicants/${id}`),
  submissions: (id: string) => request<any[]>(`/api/applicants/${id}/submissions`),
  decision: (id: string, decision: 'accepted' | 'rejected') =>
    request<any>(`/api/applicants/${id}/decision`, { method: 'POST', body: JSON.stringify({ decision }) })
};

// --- Submissions ---
export const submissions = {
  create: (data: {
    challengeId: string;
    name: string;
    email: string;
    degree: string;
    payload: Record<string, unknown>;
    score: number;
    hintsUsed?: number;
  }) => request<any>('/api/submissions', { method: 'POST', body: JSON.stringify(data) }),
  all: () => request<any[]>('/api/submissions')
};

// --- Admin ---
export const admin = {
  dashboard: () => request<any>('/api/admin/dashboard'),
  submissions: () => request<any[]>('/api/submissions')
};
