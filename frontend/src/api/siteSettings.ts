import apiClient from './client';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';
const MOCK_KEY = 'hispike_mock_site_settings';

export type SiteSettingKey = 'pet_supplies_enabled';

export type SiteSetting = {
  key: string;
  enabled: boolean;
};

// Site-wide defaults so a brand-new install (no DB rows yet) doesn't
// accidentally hide live services. Kept in sync with backend DEFAULT_FLAGS.
const DEFAULT_FLAGS: Record<string, boolean> = {
  pet_supplies_enabled: true,
};

function readMock(): Record<string, boolean> {
  if (typeof localStorage === 'undefined') return { ...DEFAULT_FLAGS };
  try {
    const raw = localStorage.getItem(MOCK_KEY);
    if (!raw) return { ...DEFAULT_FLAGS };
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_FLAGS, ...(parsed && typeof parsed === 'object' ? parsed : {}) };
  } catch {
    return { ...DEFAULT_FLAGS };
  }
}

function writeMock(values: Record<string, boolean>): void {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(MOCK_KEY, JSON.stringify(values));
  } catch {
    // ignore quota
  }
}

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function listSiteSettings(): Promise<SiteSetting[]> {
  if (USE_MOCK) {
    await delay(80);
    const values = readMock();
    return Object.entries(values).map(([key, enabled]) => ({ key, enabled }));
  }
  const response = await apiClient.get<SiteSetting[]>('/site-settings');
  // Overlay defaults on top of API response too — handles the case where the
  // API is reachable but a brand-new key the frontend knows about hasn't been
  // seeded server-side yet.
  const merged: Record<string, boolean> = { ...DEFAULT_FLAGS };
  for (const row of response.data) merged[row.key] = row.enabled;
  return Object.entries(merged).map(([key, enabled]) => ({ key, enabled }));
}

export async function updateSiteSetting(
  key: SiteSettingKey,
  enabled: boolean,
): Promise<SiteSetting> {
  if (USE_MOCK) {
    await delay(150);
    const values = readMock();
    values[key] = enabled;
    writeMock(values);
    return { key, enabled };
  }
  const response = await apiClient.put<SiteSetting>(`/site-settings/${key}`, { enabled });
  return response.data;
}

// ---------------------------------------------------------------------------
// Hook helper
// ---------------------------------------------------------------------------
// useSiteSetting('pet_supplies_enabled') returns the current bool. While the
// initial fetch is pending, it returns the safe default (true / live) so we
// never flash a Coming Soon screen for a service that is actually live.

import { useQuery } from '@tanstack/react-query';

export function useSiteSetting(key: SiteSettingKey): boolean {
  const { data } = useQuery({
    queryKey: ['site-settings'],
    queryFn: listSiteSettings,
    staleTime: 60 * 1000,
  });
  if (!data) return DEFAULT_FLAGS[key] ?? true;
  const row = data.find((r) => r.key === key);
  return row ? row.enabled : DEFAULT_FLAGS[key] ?? true;
}
