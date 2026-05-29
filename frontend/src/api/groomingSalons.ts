import apiClient from './client';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';
const MOCK_KEY = 'hispike_mock_grooming_salons';
const MOCK_SEEDED_KEY = 'hispike_mock_grooming_salons_seeded';

export type GroomingSalonRead = {
  id: string;
  name: string;
  area: string;
  city: string;
  state: string;
  address: string;
  phone: string;
  rating_avg: number;
  rating_count: number;
  tint: string;
  hero_emoji: string;
  hours: string | null;
  email: string | null;
  website: string | null;
  created_at: string;
  updated_at: string;
};

export type GroomingSalonCreate = {
  name: string;
  area: string;
  city?: string;
  state?: string;
  address: string;
  phone: string;
  rating_avg?: number;
  rating_count?: number;
  tint?: string;
  hero_emoji?: string;
  hours?: string | null;
  email?: string | null;
  website?: string | null;
};

const DEFAULTS: Omit<GroomingSalonRead, 'id' | 'created_at' | 'updated_at' | 'email' | 'website'>[] = [
  {
    name: 'Pawsh Paws Grooming Studio',
    area: 'Indiranagar',
    city: 'Bengaluru',
    state: 'KA',
    address: '100 Feet Rd, HAL 2nd Stage, Indiranagar, Bengaluru 560038',
    phone: '+91 80 4123 1816',
    rating_avg: 4.7,
    rating_count: 242,
    tint: 'from-amber-200 to-amber-400',
    hero_emoji: '✂️',
    hours: '8 am to 8 pm, daily',
  },
  {
    name: 'Wagging Tails Pet Spa',
    area: 'Koramangala',
    city: 'Bengaluru',
    state: 'KA',
    address: '80 Feet Rd, 4th Block, Koramangala, Bengaluru 560034',
    phone: '+91 80 4567 2200',
    rating_avg: 4.8,
    rating_count: 215,
    tint: 'from-rose-200 to-rose-400',
    hero_emoji: '🛁',
    hours: '9 am to 9 pm, daily',
  },
  {
    name: 'Snip & Snout Pet Salon',
    area: 'HSR Layout',
    city: 'Bengaluru',
    state: 'KA',
    address: '27th Main, Sector 2, HSR Layout, Bengaluru 560102',
    phone: '+91 80 4321 9988',
    rating_avg: 4.8,
    rating_count: 182,
    tint: 'from-emerald-200 to-emerald-500',
    hero_emoji: '💅',
    hours: '8 am to 9 pm, daily',
  },
  {
    name: 'The Furry Tale Grooming',
    area: 'Whitefield',
    city: 'Bengaluru',
    state: 'KA',
    address: 'ITPL Main Rd, near Phoenix Marketcity, Whitefield, Bengaluru 560066',
    phone: '+91 80 4900 7711',
    rating_avg: 4.7,
    rating_count: 163,
    tint: 'from-sky-200 to-sky-500',
    hero_emoji: '✂️',
    hours: '8 am to 8 pm, daily',
  },
];

function makeId(): string {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `mock-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function seedMockStoreIfEmpty(): void {
  if (typeof localStorage === 'undefined') return;
  if (localStorage.getItem(MOCK_SEEDED_KEY)) return;
  const now = new Date().toISOString();
  const seeded = DEFAULTS.map((s, i) => {
    const ts = new Date(Date.now() - (DEFAULTS.length - i) * 1000).toISOString();
    return { ...s, email: null, website: null, id: makeId(), created_at: ts, updated_at: now } satisfies GroomingSalonRead;
  });
  try {
    localStorage.setItem(MOCK_KEY, JSON.stringify(seeded));
    localStorage.setItem(MOCK_SEEDED_KEY, '1');
  } catch {
    // ignore quota
  }
}

function readMockStore(): GroomingSalonRead[] {
  if (typeof localStorage === 'undefined') return [];
  seedMockStoreIfEmpty();
  try {
    const raw = localStorage.getItem(MOCK_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeMockStore(rows: GroomingSalonRead[]): void {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(MOCK_KEY, JSON.stringify(rows));
  } catch {
    // ignore quota
  }
}

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function listGroomingSalons(): Promise<GroomingSalonRead[]> {
  if (USE_MOCK) {
    await delay(150);
    return [...readMockStore()].sort((a, b) => b.created_at.localeCompare(a.created_at));
  }
  const response = await apiClient.get<GroomingSalonRead[]>('/grooming-salons');
  return response.data;
}

export async function createGroomingSalon(data: GroomingSalonCreate): Promise<GroomingSalonRead> {
  if (USE_MOCK) {
    await delay(300);
    const now = new Date().toISOString();
    const row: GroomingSalonRead = {
      id: makeId(),
      name: data.name,
      area: data.area,
      city: data.city || 'Bengaluru',
      state: data.state || 'KA',
      address: data.address,
      phone: data.phone,
      rating_avg: data.rating_avg ?? 4.5,
      rating_count: data.rating_count ?? 0,
      tint: data.tint || 'from-amber-200 to-amber-400',
      hero_emoji: data.hero_emoji || '✂️',
      hours: data.hours?.trim() || null,
      email: data.email?.trim() || null,
      website: data.website?.trim() || null,
      created_at: now,
      updated_at: now,
    };
    const store = readMockStore();
    store.push(row);
    writeMockStore(store);
    return row;
  }
  const response = await apiClient.post<GroomingSalonRead>('/grooming-salons', data);
  return response.data;
}

export async function updateGroomingSalon(id: string, data: GroomingSalonCreate): Promise<GroomingSalonRead> {
  if (USE_MOCK) {
    await delay(250);
    const store = readMockStore();
    const idx = store.findIndex((s) => s.id === id);
    if (idx === -1) throw new Error('Salon not found');
    const now = new Date().toISOString();
    const updated: GroomingSalonRead = {
      ...store[idx],
      name: data.name,
      area: data.area,
      city: data.city || 'Bengaluru',
      state: data.state || 'KA',
      address: data.address,
      phone: data.phone,
      rating_avg: data.rating_avg ?? store[idx].rating_avg,
      rating_count: data.rating_count ?? store[idx].rating_count,
      tint: data.tint || store[idx].tint,
      hero_emoji: data.hero_emoji || store[idx].hero_emoji,
      hours: data.hours?.trim() || store[idx].hours,
      email: data.email?.trim() || store[idx].email,
      website: data.website?.trim() || store[idx].website,
      updated_at: now,
    };
    store[idx] = updated;
    writeMockStore(store);
    return updated;
  }
  const response = await apiClient.put<GroomingSalonRead>(`/grooming-salons/${id}`, data);
  return response.data;
}

export async function deleteGroomingSalon(id: string): Promise<void> {
  if (USE_MOCK) {
    await delay(200);
    writeMockStore(readMockStore().filter((s) => s.id !== id));
    return;
  }
  await apiClient.delete(`/grooming-salons/${id}`);
}
