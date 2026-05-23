import apiClient from './client';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';
const MOCK_KEY = 'hispike_mock_pet_foods';
const MOCK_SEEDED_KEY = 'hispike_mock_pet_foods_seeded';

export type PetFoodRead = {
  id: string;
  brand: string;
  name: string;
  image_url: string | null;
  emoji: string;
  rating: number;
  reviews: number;
  price: number;
  per_unit: string;
  list_price: number | null;
  sale_price: number | null;
  save_pct: number | null;
  sponsored: boolean;
  deal: boolean;
  lifestage: string | null;
  form: string | null;
  created_at: string;
  updated_at: string;
};

export type PetFoodCreate = {
  brand: string;
  name: string;
  image_url?: string | null;
  emoji?: string;
  rating: number;
  reviews: number;
  price: number;
  per_unit: string;
  list_price?: number | null;
  sale_price?: number | null;
  save_pct?: number | null;
  sponsored: boolean;
  deal: boolean;
  lifestage?: string | null;
  form?: string | null;
};

// Default catalog — mirrored to backend on first deploy via a seed script.
// In mock mode the store seeds itself once so add/edit/remove behaves like prod.
const DEFAULT_PET_FOODS: Omit<PetFoodRead, 'id' | 'created_at' | 'updated_at'>[] = [
  {
    brand: 'Royal Canin',
    name: 'Size Health Nutrition Medium Adult Dry Dog Food, 7-kg bag',
    image_url: '/supplies-1.jpg',
    emoji: '🥫',
    rating: 4.7,
    reviews: 8098,
    price: 2499,
    per_unit: '₹360/kg',
    list_price: 2599,
    sale_price: 1599,
    save_pct: 35,
    sponsored: true,
    deal: false,
    lifestage: 'Adult',
    form: 'Dry Food',
  },
  {
    brand: 'Royal Canin',
    name: 'Size Health Nutrition Medium Puppy Dry Dog Food, 14-kg bag',
    image_url: '/supplies-2.jpg',
    emoji: '🥫',
    rating: 4.7,
    reviews: 8098,
    price: 3999,
    per_unit: '₹290/kg',
    list_price: null,
    sale_price: 1999,
    save_pct: 50,
    sponsored: true,
    deal: false,
    lifestage: 'Puppy',
    form: 'Dry Food',
  },
  {
    brand: 'Pedigree',
    name: 'Complete Nutrition Grilled Steak & Vegetable Flavor Dog Kibble Adult Dry Dog Food, 20-kg bag',
    image_url: '/supplies-3.jpg',
    emoji: '🥩',
    rating: 4.7,
    reviews: 9772,
    price: 2599,
    per_unit: '₹130/kg',
    list_price: null,
    sale_price: 2199,
    save_pct: 15,
    sponsored: true,
    deal: false,
    lifestage: 'Adult',
    form: 'Dry Food',
  },
  {
    brand: 'Royal Canin Veterinary Diet',
    name: 'Gastrointestinal Low Fat Dry Dog Food, 8-kg bag',
    image_url: '/supplies-4.jpg',
    emoji: '🍖',
    rating: 4.6,
    reviews: 3123,
    price: 11299,
    per_unit: '₹800/kg',
    list_price: null,
    sale_price: 9599,
    save_pct: 35,
    sponsored: true,
    deal: false,
    lifestage: 'All Lifestages',
    form: 'Dry Food',
  },
  {
    brand: 'ACANA',
    name: 'Singles Limited Ingredient Salmon & Pumpkin Recipe Dry Dog Food, 11-kg bag',
    image_url: '/supplies-5.jpg',
    emoji: '🐟',
    rating: 4.5,
    reviews: 5612,
    price: 3349,
    per_unit: '₹260/kg',
    list_price: null,
    sale_price: 2699,
    save_pct: 20,
    sponsored: false,
    deal: true,
    lifestage: 'Adult',
    form: 'Dry Food',
  },
  {
    brand: 'Pedigree',
    name: 'Choice Cuts in Gravy with Beef & Country Stew Adult Wet Dog Food, 600-g cans',
    image_url: '/supplies-6.jpg',
    emoji: '🐕',
    rating: 4.6,
    reviews: 11420,
    price: 1899,
    per_unit: '₹140/kg',
    list_price: null,
    sale_price: null,
    save_pct: null,
    sponsored: false,
    deal: false,
    lifestage: 'Adult',
    form: 'Wet Food',
  },
  {
    brand: 'Royal Canin',
    name: 'Aging Care 12+ Small Senior Dry Dog Food, 6-kg bag',
    image_url: '/supplies-7.jpg',
    emoji: '🐶',
    rating: 4.8,
    reviews: 6240,
    price: 5199,
    per_unit: '₹380/kg',
    list_price: null,
    sale_price: 4399,
    save_pct: 15,
    sponsored: false,
    deal: false,
    lifestage: 'Senior',
    form: 'Dry Food',
  },
  {
    brand: 'ACANA',
    name: 'Wholesome Grains Free-Run Chicken & Pumpkin Recipe Treats',
    image_url: '/supplies-8.jpg',
    emoji: '🍗',
    rating: 4.7,
    reviews: 8800,
    price: 1099,
    per_unit: '—',
    list_price: null,
    sale_price: 799,
    save_pct: 20,
    sponsored: false,
    deal: true,
    lifestage: 'All Lifestages',
    form: 'Treats',
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
  const seeded = DEFAULT_PET_FOODS.map((f, i) => {
    const ts = new Date(Date.now() - (DEFAULT_PET_FOODS.length - i) * 1000).toISOString();
    return {
      ...f,
      id: makeId(),
      created_at: ts,
      updated_at: now,
    } satisfies PetFoodRead;
  });
  try {
    localStorage.setItem(MOCK_KEY, JSON.stringify(seeded));
    localStorage.setItem(MOCK_SEEDED_KEY, '1');
  } catch {
    // Ignore quota errors
  }
}

function readMockStore(): PetFoodRead[] {
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

function writeMockStore(rows: PetFoodRead[]): void {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(MOCK_KEY, JSON.stringify(rows));
  } catch {
    // Ignore quota errors
  }
}

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

function normalizePayload(data: PetFoodCreate): Omit<PetFoodRead, 'id' | 'created_at' | 'updated_at'> {
  return {
    brand: data.brand.trim(),
    name: data.name.trim(),
    image_url: data.image_url?.trim() || null,
    emoji: (data.emoji ?? '🥫').trim() || '🥫',
    rating: data.rating,
    reviews: data.reviews,
    price: data.price,
    per_unit: data.per_unit?.trim() || '—',
    list_price: data.list_price ?? null,
    sale_price: data.sale_price ?? null,
    save_pct: data.save_pct ?? null,
    sponsored: data.sponsored,
    deal: data.deal,
    lifestage: data.lifestage?.trim() || null,
    form: data.form?.trim() || null,
  };
}

export async function listPetFoods(): Promise<PetFoodRead[]> {
  if (USE_MOCK) {
    await delay(150);
    return [...readMockStore()].sort((a, b) =>
      b.created_at.localeCompare(a.created_at),
    );
  }
  const response = await apiClient.get<PetFoodRead[]>('/pet-foods');
  return response.data;
}

export async function createPetFood(data: PetFoodCreate): Promise<PetFoodRead> {
  if (USE_MOCK) {
    await delay(300);
    const now = new Date().toISOString();
    const row: PetFoodRead = {
      ...normalizePayload(data),
      id: makeId(),
      created_at: now,
      updated_at: now,
    };
    const store = readMockStore();
    store.push(row);
    writeMockStore(store);
    return row;
  }
  const response = await apiClient.post<PetFoodRead>('/pet-foods', data);
  return response.data;
}

export async function updatePetFood(id: string, data: PetFoodCreate): Promise<PetFoodRead> {
  if (USE_MOCK) {
    await delay(250);
    const store = readMockStore();
    const idx = store.findIndex((f) => f.id === id);
    if (idx === -1) throw new Error('Pet food not found');
    const now = new Date().toISOString();
    const updated: PetFoodRead = {
      ...store[idx],
      ...normalizePayload(data),
      updated_at: now,
    };
    store[idx] = updated;
    writeMockStore(store);
    return updated;
  }
  const response = await apiClient.put<PetFoodRead>(`/pet-foods/${id}`, data);
  return response.data;
}

export async function deletePetFood(id: string): Promise<void> {
  if (USE_MOCK) {
    await delay(200);
    const store = readMockStore();
    writeMockStore(store.filter((f) => f.id !== id));
    return;
  }
  await apiClient.delete(`/pet-foods/${id}`);
}
