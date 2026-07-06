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
