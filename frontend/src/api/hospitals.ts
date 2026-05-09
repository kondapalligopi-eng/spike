import apiClient from './client';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';
const MOCK_KEY = 'hispike_mock_hospitals';
const MOCK_SEEDED_KEY = 'hispike_mock_hospitals_seeded';

// Default hospitals — kept in sync with backend/scripts/seed_hospitals.py.
// In mock mode the store is auto-seeded with these on first read so the
// admin's add/delete experience matches production.
const DEFAULT_HOSPITALS: Omit<HospitalRead, 'id' | 'created_at' | 'updated_at'>[] = [
  {
    name: 'SKS Veterinary Hospital',
    locality: 'Indiranagar',
    address: '17, Service Rd, Geethanjali Layout, HAL 3rd Stage, New Tippasandra, Bengaluru 560075',
    phone: '+91 80 4000 0000',
    specialties: 'General, Surgery, Diagnostics, Grooming',
    rating: '4.7',
    website: 'https://www.skspethospital.com/indira-nagar/',
  },
  {
    name: 'V-Care Pet Polyclinic',
    locality: 'Koramangala',
    address: 'No. 15, 1st Main, 1st Block, near Kabab Magic, Koramangala, Bengaluru',
    phone: '+918147006342',
    specialties: 'General, Dentistry, Vaccination',
    rating: '4.6',
    website: 'http://www.vcarepetpolyclinic.com/',
  },
  {
    name: 'V-Care Pet Polyclinic',
    locality: 'Whitefield',
    address: 'Opposite CSI Church, Whitefield, Bengaluru 560066',
    phone: '+918147006341',
    specialties: 'General, Surgery, Pet Supplies',
    rating: '4.6',
    website: 'http://www.vcarepetpolyclinic.com/',
  },
  {
    name: 'Vetic Pet Clinic',
    locality: 'HSR Layout',
    address: '1070, Ground Floor, MM Heights, 24th Main Rd, near HSR Layout Police Station, Bengaluru',
    phone: '+91 80 4000 0000',
    specialties: '24x7 Care, General, Diagnostics',
    rating: '4.8',
    website: 'https://vetic.in/clinics/bengaluru/hsr-bengaluru',
  },
  {
    name: 'Dr. Doodley Pet Hospital',
    locality: 'Jayanagar',
    address: 'No. 18, 1356, 4th T Block East, 32nd E Cross Road, Jayanagar, Bengaluru 560041',
    phone: '+919902356133',
    specialties: 'General, Surgery, Emergency',
    rating: '4.7',
    website: 'https://doodley.in/',
  },
  {
    name: 'Cessna Lifeline Veterinary Hospital',
    locality: 'Domlur',
    address: 'No. 148, Near Fiat Showroom, HCBS Amarjyothi Layout, KGA Road, Domlur, Bengaluru 560071',
    phone: '+917676365365',
    specialties: 'Multispecialty, Emergency, Surgery, Boarding',
    rating: '4.8',
    website: 'https://cessnalifeline.com/',
  },
];

export type HospitalRead = {
  id: string;
  name: string;
  locality: string;
  address: string;
  phone: string;
  specialties: string | null;
  rating: string | null;
  website: string | null;
  created_at: string;
  updated_at: string;
};

export type HospitalCreate = {
  name: string;
  locality: string;
  address: string;
  phone: string;
  specialties?: string;
  rating?: string;
  website?: string;
};

function makeId(): string {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `mock-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function seedMockStoreIfEmpty(): void {
  if (typeof localStorage === 'undefined') return;
  // Only seed once — the marker survives admin-deleted entries so we don't
  // re-add hospitals the admin explicitly removed.
  if (localStorage.getItem(MOCK_SEEDED_KEY)) return;
  const now = new Date().toISOString();
  // Stagger created_at slightly so list-newest-first ordering is stable.
  const seeded = DEFAULT_HOSPITALS.map((h, i) => {
    const ts = new Date(Date.now() - (DEFAULT_HOSPITALS.length - i) * 1000).toISOString();
    return {
      ...h,
      id: makeId(),
      created_at: ts,
      updated_at: now,
    } satisfies HospitalRead;
  });
  try {
    localStorage.setItem(MOCK_KEY, JSON.stringify(seeded));
    localStorage.setItem(MOCK_SEEDED_KEY, '1');
  } catch {
    // Ignore quota errors
  }
}

function readMockStore(): HospitalRead[] {
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

function writeMockStore(rows: HospitalRead[]): void {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(MOCK_KEY, JSON.stringify(rows));
  } catch {
    // Ignore quota errors — mock data is non-critical
  }
}

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function listHospitals(): Promise<HospitalRead[]> {
  if (USE_MOCK) {
    await delay(150);
    // Newest first, matching the backend order
    return [...readMockStore()].sort((a, b) =>
      b.created_at.localeCompare(a.created_at),
    );
  }
  const response = await apiClient.get<HospitalRead[]>('/hospitals');
  return response.data;
}

export async function createHospital(data: HospitalCreate): Promise<HospitalRead> {
  if (USE_MOCK) {
    await delay(300);
    const now = new Date().toISOString();
    const row: HospitalRead = {
      id: makeId(),
      name: data.name,
      locality: data.locality,
      address: data.address,
      phone: data.phone,
      specialties: data.specialties?.trim() || null,
      rating: data.rating?.trim() || null,
      website: data.website?.trim() || null,
      created_at: now,
      updated_at: now,
    };
    const store = readMockStore();
    store.push(row);
    writeMockStore(store);
    return row;
  }
  const response = await apiClient.post<HospitalRead>('/hospitals', data);
  return response.data;
}

export async function deleteHospital(id: string): Promise<void> {
  if (USE_MOCK) {
    await delay(200);
    const store = readMockStore();
    writeMockStore(store.filter((h) => h.id !== id));
    return;
  }
  await apiClient.delete(`/hospitals/${id}`);
}
