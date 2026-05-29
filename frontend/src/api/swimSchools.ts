import apiClient from './client';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';
const MOCK_KEY = 'hispike_mock_swim_schools';
const MOCK_SEEDED_KEY = 'hispike_mock_swim_schools_seeded';

export type SwimSchoolRead = {
  id: string;
  name: string;
  locality: string;
  rating: number;
  image_url: string | null;
  address: string;
  hours: string | null;
  cost: string | null;
  pool_type: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  highlights: string[];
  created_at: string;
  updated_at: string;
};

export type SwimSchoolCreate = {
  name: string;
  locality: string;
  rating: number;
  image_url?: string;
  address: string;
  hours?: string;
  cost?: string;
  pool_type?: string;
  phone?: string;
  email?: string;
  website?: string;
  highlights?: string[];
};

const DEFAULTS: Omit<SwimSchoolRead, 'id' | 'created_at' | 'updated_at' | 'phone' | 'email' | 'website'>[] = [
  {
    name: 'Indiranagar Aquatic Pet Centre',
    locality: 'Indiranagar, Bengaluru',
    rating: 5,
    image_url: '/swim/swim1.jpg',
    address: '12, 100 Feet Rd, Indiranagar, Bengaluru 560038',
    hours: '7 am to 9 pm',
    cost: '₹600 per 30-min session',
    pool_type: 'Heated indoor pool',
    highlights: [
      'Climate-controlled, pH-balanced water at 28-30°C',
      'Certified canine swim coaches with small-batch sessions',
      'Life-jacket rental and post-swim towel-dry included',
      'Suitable for all breeds, including brachycephalic dogs',
    ],
  },
  {
    name: 'Whitefield Splash Academy',
    locality: 'Whitefield, Bengaluru',
    rating: 5,
    image_url: '/swim/swim2.jpg',
    address: 'Forum Value Mall area, Whitefield, Bengaluru 560066',
    hours: '6:30 am to 8 pm',
    cost: '₹500 per 30-min session',
    pool_type: 'Outdoor heated pool',
    highlights: [
      'Year-round heated water for outdoor swim sessions',
      'Hydrotherapy programs for senior dogs and post-surgery recovery',
      'On-site rest area with shaded benches for owners',
      'Large pool with shallow zone for first-time swimmers',
    ],
  },
  {
    name: 'HSR Canine Swim Club',
    locality: 'HSR Layout, Bengaluru',
    rating: 4,
    image_url: '/swim/swim3.jpg',
    address: '24th Main Rd, HSR Layout, Bengaluru 560102',
    hours: '7 am to 8:30 pm',
    cost: '₹550 per 30-min session',
    pool_type: 'Heated indoor pool',
    highlights: [
      'Group play sessions on weekends',
      'Underwater treadmill for rehabilitation',
      'Parking available for members',
      'On-site pet groomer for post-swim cleanup',
    ],
  },
  {
    name: 'Sarjapur Splash & Paddle',
    locality: 'Sarjapur Road, Bengaluru',
    rating: 4,
    image_url: '/swim/swim4.jpg',
    address: 'Sarjapur Main Rd, near Wipro Gate, Bengaluru 560035',
    hours: '6 am to 9 pm',
    cost: '₹650 per 30-min session',
    pool_type: 'Heated indoor pool',
    highlights: [
      'Spacious pool with separate beginner and advanced lanes',
      'Trainers experienced with rescue and adopted dogs',
      'Cafe on-site for owners',
      'Open-swim hours every Saturday',
    ],
  },
  {
    name: 'Koramangala Pet Pool Club',
    locality: 'Koramangala, Bengaluru',
    rating: 4,
    image_url: '/swim/swim5.jpg',
    address: '5th Block, Koramangala, Bengaluru 560095',
    hours: '7 am to 8 pm',
    cost: '₹600 per 30-min session',
    pool_type: 'Heated indoor pool',
    highlights: [
      'Solo and group sessions available',
      'Compact but well-equipped facility',
      'Easy access from BTM, HSR, and Indiranagar',
      'Specialised programs for puppies under 6 months',
    ],
  },
  {
    name: 'Domlur Aquatic Hub',
    locality: 'Domlur, Bengaluru',
    rating: 4,
    image_url: '/swim/swim6.jpg',
    address: 'KGA Road, Domlur, Bengaluru 560071',
    hours: '6:30 am to 9 pm',
    cost: '₹550 per 30-min session',
    pool_type: 'Heated indoor pool',
    highlights: [
      'Vet on call for hydrotherapy referrals',
      '24x7 emergency consult line',
      'Towel-dry and brush-out post-swim',
      'Subscription packages with monthly discounts',
    ],
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
    return { ...s, phone: null, email: null, website: null, id: makeId(), created_at: ts, updated_at: now } satisfies SwimSchoolRead;
  });
  try {
    localStorage.setItem(MOCK_KEY, JSON.stringify(seeded));
    localStorage.setItem(MOCK_SEEDED_KEY, '1');
  } catch {
    // ignore quota
  }
}

function readMockStore(): SwimSchoolRead[] {
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

function writeMockStore(rows: SwimSchoolRead[]): void {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(MOCK_KEY, JSON.stringify(rows));
  } catch {
    // ignore quota
  }
}

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function listSwimSchools(): Promise<SwimSchoolRead[]> {
  if (USE_MOCK) {
    await delay(150);
    return [...readMockStore()].sort((a, b) => b.created_at.localeCompare(a.created_at));
  }
  const response = await apiClient.get<SwimSchoolRead[]>('/swim-schools');
  return response.data;
}

export async function createSwimSchool(data: SwimSchoolCreate): Promise<SwimSchoolRead> {
  if (USE_MOCK) {
    await delay(300);
    const now = new Date().toISOString();
    const row: SwimSchoolRead = {
      id: makeId(),
      name: data.name,
      locality: data.locality,
      rating: data.rating,
      image_url: data.image_url?.trim() || null,
      address: data.address,
      hours: data.hours?.trim() || null,
      cost: data.cost?.trim() || null,
      pool_type: data.pool_type?.trim() || null,
      phone: data.phone?.trim() || null,
      email: data.email?.trim() || null,
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
  const response = await apiClient.post<SwimSchoolRead>('/swim-schools', data);
  return response.data;
}

export async function updateSwimSchool(id: string, data: SwimSchoolCreate): Promise<SwimSchoolRead> {
  if (USE_MOCK) {
    await delay(250);
    const store = readMockStore();
    const idx = store.findIndex((s) => s.id === id);
    if (idx === -1) throw new Error('Swim school not found');
    const now = new Date().toISOString();
    const updated: SwimSchoolRead = {
      ...store[idx],
      name: data.name,
      locality: data.locality,
      rating: data.rating,
      image_url: data.image_url?.trim() || null,
      address: data.address,
      hours: data.hours?.trim() || null,
      cost: data.cost?.trim() || null,
      pool_type: data.pool_type?.trim() || null,
      highlights: (data.highlights ?? []).map((h) => h.trim()).filter(Boolean),
      updated_at: now,
    };
    store[idx] = updated;
    writeMockStore(store);
    return updated;
  }
  const response = await apiClient.put<SwimSchoolRead>(`/swim-schools/${id}`, data);
  return response.data;
}

export async function deleteSwimSchool(id: string): Promise<void> {
  if (USE_MOCK) {
    await delay(200);
    writeMockStore(readMockStore().filter((s) => s.id !== id));
    return;
  }
  await apiClient.delete(`/swim-schools/${id}`);
}
