import apiClient from './client';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';
const MOCK_KEY = 'hispike_mock_submissions';

export type SubmissionKind = 'feedback' | 'hospital' | 'park' | 'swimming' | 'grooming';

export type SubmissionRead = {
  id: string;
  kind: SubmissionKind;
  data: Record<string, string>;
  handled: boolean;
  created_at: string;
  updated_at: string;
};

function makeId(): string {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `mock-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function readMock(): SubmissionRead[] {
  if (typeof localStorage === 'undefined') return [];
  try {
    const raw = localStorage.getItem(MOCK_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeMock(rows: SubmissionRead[]): void {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(MOCK_KEY, JSON.stringify(rows));
  } catch {
    // ignore quota
  }
}

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

// Public — called by the feedback + "list your …" forms. No auth needed.
export async function createSubmission(
  kind: SubmissionKind,
  data: Record<string, string>,
): Promise<SubmissionRead> {
  if (USE_MOCK) {
    await delay(250);
    const now = new Date().toISOString();
    const row: SubmissionRead = { id: makeId(), kind, data, handled: false, created_at: now, updated_at: now };
    const store = readMock();
    store.push(row);
    writeMock(store);
    return row;
  }
  const response = await apiClient.post<SubmissionRead>('/submissions', { kind, data });
  return response.data;
}

// Admin — list newest first.
export async function listSubmissions(): Promise<SubmissionRead[]> {
  if (USE_MOCK) {
    await delay(120);
    return [...readMock()].sort((a, b) => b.created_at.localeCompare(a.created_at));
  }
  const response = await apiClient.get<SubmissionRead[]>('/submissions');
  return response.data;
}

export async function setSubmissionHandled(id: string, handled: boolean): Promise<SubmissionRead> {
  if (USE_MOCK) {
    await delay(120);
    const store = readMock();
    const idx = store.findIndex((s) => s.id === id);
    if (idx === -1) throw new Error('Submission not found');
    store[idx] = { ...store[idx], handled, updated_at: new Date().toISOString() };
    writeMock(store);
    return store[idx];
  }
  const response = await apiClient.patch<SubmissionRead>(`/submissions/${id}`, { handled });
  return response.data;
}

export async function deleteSubmission(id: string): Promise<void> {
  if (USE_MOCK) {
    await delay(120);
    writeMock(readMock().filter((s) => s.id !== id));
    return;
  }
  await apiClient.delete(`/submissions/${id}`);
}
