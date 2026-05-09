import apiClient from './client';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';
const MOCK_KEY = 'hispike_mock_parks_v2';
const MOCK_SEEDED_KEY = 'hispike_mock_parks_v2_seeded';

export type ParkRead = {
  id: string;
  name: string;
  locality: string;
  rating: number;
  image_url: string | null;
  address: string;
  hours: string | null;
  cost: string | null;
  off_leash: string | null;
  features: string | null;
  phone: string | null;
  website: string | null;
  highlights: string[];
  created_at: string;
  updated_at: string;
};

export type ParkCreate = {
  name: string;
  locality: string;
  rating: number;
  image_url?: string;
  address: string;
  hours?: string;
  cost?: string;
  off_leash?: string;
  features?: string;
  phone?: string;
  website?: string;
  highlights?: string[];
};

const DEFAULT_HIGHLIGHTS = [
  'Neighborhood park with on and off-leash dog play areas',
  'Restrooms and shaded benches available',
  'Street parking only',
  'Popular spot to socialize with other dog owners',
];

const DEFAULT_PARKS: Omit<ParkRead, 'id' | 'created_at' | 'updated_at'>[] = [
  { name: 'Cubbon Park',                     locality: 'Sampangi Rama Nagar, Bengaluru', rating: 5, image_url: '/parks/cubbon-park.jpg', address: 'Kasturba Road, Sampangi Rama Nagar, Bengaluru, Karnataka 560001', hours: '5 am to 8 pm', cost: 'Free to use, may need to pay for parking', off_leash: 'Yes, in designated areas only', features: 'Walking trails, Playground, Restrooms', phone: null, website: null, highlights: DEFAULT_HIGHLIGHTS },
  { name: 'Lalbagh Botanical Garden',        locality: 'Mavalli, Bengaluru',             rating: 5, image_url: '/parks/lalbagh.jpg',      address: 'Mavalli, Bengaluru, Karnataka 560004',                            hours: '6 am to 7 pm', cost: '₹20 entry; free under 12',               off_leash: 'On-leash only',                       features: 'Glass house, Lake, Walking trails',       phone: null, website: null, highlights: DEFAULT_HIGHLIGHTS },
  { name: 'Agara Lake Park',                 locality: 'HSR Layout, Bengaluru',          rating: 4, image_url: '/parks/agara.jpg',        address: 'HSR Layout, Bengaluru, Karnataka 560102',                          hours: '5 am to 9 pm', cost: 'Free to use',                            off_leash: 'On-leash only',                       features: 'Lakeside walk, Jogging track',            phone: null, website: null, highlights: DEFAULT_HIGHLIGHTS },
  { name: 'Indiranagar Defence Colony Park', locality: 'Indiranagar, Bengaluru',         rating: 4, image_url: '/parks/indiranagar.jpg',  address: 'Defence Colony, Indiranagar, Bengaluru 560038',                    hours: '5 am to 8 pm', cost: 'Free to use',                            off_leash: 'Yes, in designated areas',            features: 'Off-leash zone, Playground, Restrooms',   phone: null, website: null, highlights: DEFAULT_HIGHLIGHTS },
  { name: 'Bellandur Lake Park',             locality: 'Bellandur, Bengaluru',           rating: 4, image_url: '/parks/bellandur.jpg',    address: 'Bellandur, Bengaluru, Karnataka 560103',                           hours: '6 am to 7 pm', cost: 'Free to use',                            off_leash: 'On-leash only',                       features: 'Lake views, Walking trails',              phone: null, website: null, highlights: DEFAULT_HIGHLIGHTS },
  { name: 'Whitefield Memorial Park',        locality: 'Whitefield, Bengaluru',          rating: 4, image_url: '/parks/whitefield.jpg',   address: 'Whitefield, Bengaluru, Karnataka 560066',                          hours: '5 am to 9 pm', cost: 'Free to use',                            off_leash: 'Yes, in designated areas',            features: 'Walking trails, Benches, Off-leash zone', phone: null, website: null, highlights: DEFAULT_HIGHLIGHTS },
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
  const seeded = DEFAULT_PARKS.map((p, i) => {
    const ts = new Date(Date.now() - (DEFAULT_PARKS.length - i) * 1000).toISOString();
    return { ...p, id: makeId(), created_at: ts, updated_at: now } satisfies ParkRead;
  });
  try {
    localStorage.setItem(MOCK_KEY, JSON.stringify(seeded));
    localStorage.setItem(MOCK_SEEDED_KEY, '1');
  } catch {
    // ignore quota
  }
}

function readMockStore(): ParkRead[] {
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

function writeMockStore(rows: ParkRead[]): void {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(MOCK_KEY, JSON.stringify(rows));
  } catch {
    // ignore quota
  }
}

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function listParks(): Promise<ParkRead[]> {
  if (USE_MOCK) {
    await delay(150);
    return [...readMockStore()].sort((a, b) => b.created_at.localeCompare(a.created_at));
  }
  const response = await apiClient.get<ParkRead[]>('/parks');
  return response.data;
}

export async function createPark(data: ParkCreate): Promise<ParkRead> {
  if (USE_MOCK) {
    await delay(300);
    const now = new Date().toISOString();
    const row: ParkRead = {
      id: makeId(),
      name: data.name,
      locality: data.locality,
      rating: data.rating,
      image_url: data.image_url?.trim() || null,
      address: data.address,
      hours: data.hours?.trim() || null,
      cost: data.cost?.trim() || null,
      off_leash: data.off_leash?.trim() || null,
      features: data.features?.trim() || null,
      phone: data.phone?.trim() || null,
      website: data.website?.trim() || null,
      highlights: (data.highlights ?? []).map((h) => h.trim()).filter(Boolean),
      created_at: now,
      updated_at: now,
    };
    const store = readMockStore();
    store.push(row);
    writeMockStore(store);
    return row;
  }
  const response = await apiClient.post<ParkRead>('/parks', data);
  return response.data;
}

export async function updatePark(id: string, data: ParkCreate): Promise<ParkRead> {
  if (USE_MOCK) {
    await delay(250);
    const store = readMockStore();
    const idx = store.findIndex((p) => p.id === id);
    if (idx === -1) throw new Error('Park not found');
    const now = new Date().toISOString();
    const updated: ParkRead = {
      ...store[idx],
      name: data.name,
      locality: data.locality,
      rating: data.rating,
      image_url: data.image_url?.trim() || null,
      address: data.address,
      hours: data.hours?.trim() || null,
      cost: data.cost?.trim() || null,
      off_leash: data.off_leash?.trim() || null,
      features: data.features?.trim() || null,
      phone: data.phone?.trim() || null,
      website: data.website?.trim() || null,
      highlights: (data.highlights ?? []).map((h) => h.trim()).filter(Boolean),
      updated_at: now,
    };
    store[idx] = updated;
    writeMockStore(store);
    return updated;
  }
  const response = await apiClient.put<ParkRead>(`/parks/${id}`, data);
  return response.data;
}

export async function deletePark(id: string): Promise<void> {
  if (USE_MOCK) {
    await delay(200);
    writeMockStore(readMockStore().filter((p) => p.id !== id));
    return;
  }
  await apiClient.delete(`/parks/${id}`);
}
