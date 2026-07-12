import apiClient from './client';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

// A pet shop's storefront page — owner-created, lives at hispike.in/petshop/<slug>.
export type ShopProduct = {
  id: string;
  shop_id: string;
  name: string;
  price: string | null;
  description: string;
  photo_url: string | null;
  created_at: string;
  updated_at: string;
};

export type ShopUpdate = {
  id: string;
  shop_id: string;
  title: string;
  body: string;
  created_at: string;
  updated_at: string;
};

export type PetShopSummary = {
  id: string;
  slug: string;
  name: string;
  logo_url: string | null;
  about: string;
  area: string | null;
  hours: string | null;
  phone: string | null;
  whatsapp: string | null;
  owner_id: string;
  created_at: string;
  updated_at: string;
};

export type PetShopRead = PetShopSummary & {
  products: ShopProduct[];
  updates: ShopUpdate[];
};

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));
function status404(err: unknown): boolean {
  return (err as { response?: { status?: number } } | undefined)?.response?.status === 404;
}

// A sample shop so the public page renders in mock/dev mode (no backend).
function sampleShop(slug: string): PetShopRead {
  const now = new Date().toISOString();
  const day = (n: number) => new Date(Date.now() - n * 86_400_000).toISOString();
  return {
    id: 'mock-shop',
    slug,
    name: 'Paws & Whiskers',
    logo_url: null,
    about:
      "Your neighbourhood pet store — premium food, toys, grooming supplies & everything your pet needs. Home delivery within 5 km.",
    area: 'Indiranagar, Bengaluru',
    hours: '10am–9pm',
    phone: '+919876543210',
    whatsapp: '+919876543210',
    owner_id: 'u',
    created_at: now,
    updated_at: now,
    products: [
      { id: 'p1', shop_id: 'mock-shop', name: 'Royal Canin Adult 3kg', price: '₹1,299', description: 'Complete, balanced nutrition for adult dogs.', photo_url: null, created_at: now, updated_at: now },
      { id: 'p2', shop_id: 'mock-shop', name: 'Chew Toy Bundle', price: '₹499', description: 'Durable rubber toys — pack of 3.', photo_url: null, created_at: now, updated_at: now },
      { id: 'p3', shop_id: 'mock-shop', name: 'Cozy Pet Bed (M)', price: '₹1,899', description: 'Soft, washable bed for a snug nap.', photo_url: null, created_at: now, updated_at: now },
      { id: 'p4', shop_id: 'mock-shop', name: 'Grooming Kit', price: '₹749', description: 'Brush, nail clipper & gentle shampoo.', photo_url: null, created_at: now, updated_at: now },
    ],
    updates: [
      { id: 'u1', shop_id: 'mock-shop', title: '🆕 Fresh stock just arrived!', body: 'New batches of Royal Canin & Farmina are in — grab them before they\'re gone.', created_at: day(2), updated_at: day(2) },
      { id: 'u2', shop_id: 'mock-shop', title: '🎉 Monsoon sale — 15% off', body: 'Flat 15% off all raincoats & cozy beds this week only.', created_at: day(5), updated_at: day(5) },
      { id: 'u3', shop_id: 'mock-shop', title: '🐾 Now delivering to your door', body: 'Free home delivery within 5 km on orders above ₹499.', created_at: day(8), updated_at: day(8) },
    ],
  };
}

/** Public shop page (with products + updates) by slug. Null if not found. */
export async function getShopBySlug(slug: string): Promise<PetShopRead | null> {
  if (USE_MOCK) {
    await delay(150);
    return sampleShop(slug);
  }
  try {
    const res = await apiClient.get<PetShopRead>(`/pet-shops/by-slug/${encodeURIComponent(slug)}`);
    return res.data;
  } catch (err) {
    if (status404(err)) return null;
    throw err;
  }
}

/** Recent public shops — for directory teasers (Phase 4). */
export async function listRecentShops(limit = 8): Promise<PetShopSummary[]> {
  if (USE_MOCK) {
    await delay(120);
    return [sampleShop('paws-and-whiskers')];
  }
  const res = await apiClient.get<PetShopSummary[]>('/pet-shops/recent', { params: { limit } });
  return res.data;
}
