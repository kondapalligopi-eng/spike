import apiClient from './client';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

type CounterRead = { key: string; value: number };

function mockKey(key: string): string {
  return `hispike_mock_counter_${key}`;
}

function readMock(key: string): number {
  if (typeof localStorage === 'undefined') return 0;
  const raw = Number(localStorage.getItem(mockKey(key)) ?? '0');
  return Number.isFinite(raw) ? raw : 0;
}

/** Current value of a counter (0 if it has never been incremented). */
export async function getCounter(key: string): Promise<number> {
  if (USE_MOCK) return readMock(key);
  const res = await apiClient.get<CounterRead>(`/counters/${key}`);
  return res.data.value;
}

/** Bump a counter by one and return the new value. */
export async function incrementCounter(key: string): Promise<number> {
  if (USE_MOCK) {
    const next = readMock(key) + 1;
    try {
      localStorage.setItem(mockKey(key), String(next));
    } catch {
      // ignore quota
    }
    return next;
  }
  const res = await apiClient.post<CounterRead>(`/counters/${key}/increment`);
  return res.data.value;
}

/** Admin: every counter, highest first. Optionally filtered by key prefix
 *  (e.g. "hospital:") so a report can pull just one category. */
export async function listCounters(prefix?: string, limit = 500): Promise<CounterRead[]> {
  if (USE_MOCK) {
    if (typeof localStorage === 'undefined') return [];
    const rows: CounterRead[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (!k || !k.startsWith('hispike_mock_counter_')) continue;
      const key = k.slice('hispike_mock_counter_'.length);
      if (prefix && !key.startsWith(prefix)) continue;
      rows.push({ key, value: Number(localStorage.getItem(k) ?? '0') });
    }
    return rows.sort((a, b) => b.value - a.value).slice(0, limit);
  }
  const res = await apiClient.get<CounterRead[]>('/counters', { params: { prefix, limit } });
  return res.data;
}
