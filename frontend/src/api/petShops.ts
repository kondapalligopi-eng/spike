import apiClient from './client';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';
const MOCK_KEY = 'hispike_mock_pet_shops';

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

export type PetShopCreate = {
  slug: string;
  name: string;
  logo_url: string | null;
  about: string;
  area: string | null;
  hours: string | null;
  phone: string | null;
  whatsapp: string | null;
};

export type ShopProductCreate = {
  name: string;
  price: string | null;
  description: string;
  photo_url: string | null;
};

export type ShopUpdateCreate = { title: string; body: string };

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));
function status404(err: unknown): boolean {
  return (err as { response?: { status?: number } } | undefined)?.response?.status === 404;
}
function makeId(): string {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `mock-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

// --- mock localStorage store (dev only) --------------------------------------
function readStore(): PetShopRead[] {
  if (typeof localStorage === 'undefined') return [];
  try {
    const raw = localStorage.getItem(MOCK_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
function writeStore(rows: PetShopRead[]): void {
  try {
    localStorage.setItem(MOCK_KEY, JSON.stringify(rows));
  } catch {
    /* ignore quota */
  }
}

// A ready-made shop so the public page has something to show before any real
// shop exists (dev/demo only).
function sampleShop(slug: string): PetShopRead {
  const now = new Date().toISOString();
  const day = (n: number) => new Date(Date.now() - n * 86_400_000).toISOString();
  return {
    id: 'mock-shop', slug, name: 'Paws & Whiskers', logo_url: null,
    about: "Your neighbourhood pet store — premium food, toys, grooming supplies & everything your pet needs. Home delivery within 5 km.",
    area: 'Indiranagar, Bengaluru', hours: '10am–9pm', phone: '+919876543210', whatsapp: '+919876543210',
    owner_id: 'mock-me', created_at: now, updated_at: now,
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

const toSummary = (s: PetShopRead): PetShopSummary => {
  const { products: _p, updates: _u, ...rest } = s;
  void _p; void _u;
  return rest;
};

// --- public ------------------------------------------------------------------

export async function getShopBySlug(slug: string): Promise<PetShopRead | null> {
  if (USE_MOCK) {
    await delay(150);
    const store = readStore();
    const found = store.find((s) => s.slug === slug);
    if (found) return found;
    return store.length === 0 ? sampleShop(slug) : null;
  }
  try {
    const res = await apiClient.get<PetShopRead>(`/pet-shops/by-slug/${encodeURIComponent(slug)}`);
    return res.data;
  } catch (err) {
    if (status404(err)) return null;
    throw err;
  }
}

export async function listRecentShops(limit = 8): Promise<PetShopSummary[]> {
  if (USE_MOCK) {
    await delay(120);
    const store = readStore();
    return (store.length ? store.map(toSummary) : [toSummary(sampleShop('paws-and-whiskers'))]).slice(0, limit);
  }
  const res = await apiClient.get<PetShopSummary[]>('/pet-shops/recent', { params: { limit } });
  return res.data;
}

// --- admin -------------------------------------------------------------------

export async function listAllShops(): Promise<PetShopSummary[]> {
  if (USE_MOCK) {
    await delay(120);
    return readStore().map(toSummary);
  }
  const res = await apiClient.get<PetShopSummary[]>('/pet-shops');
  return res.data;
}

// --- owner: shops ------------------------------------------------------------

export async function listMyShops(): Promise<PetShopSummary[]> {
  if (USE_MOCK) {
    await delay(120);
    return readStore().map(toSummary);
  }
  const res = await apiClient.get<PetShopSummary[]>('/pet-shops/mine');
  return res.data;
}

export async function slugAvailable(slug: string, excludeId?: string): Promise<boolean> {
  if (USE_MOCK) {
    await delay(120);
    return !readStore().some((s) => s.slug === slug && s.id !== excludeId);
  }
  const res = await apiClient.get<{ available: boolean }>(
    `/pet-shops/slug-available/${encodeURIComponent(slug)}`,
    { params: excludeId ? { exclude_id: excludeId } : {} },
  );
  return res.data.available;
}

export async function createShop(payload: PetShopCreate): Promise<PetShopRead> {
  if (USE_MOCK) {
    await delay(300);
    const now = new Date().toISOString();
    const shop: PetShopRead = { ...payload, id: makeId(), owner_id: 'mock-me', created_at: now, updated_at: now, products: [], updates: [] };
    writeStore([shop, ...readStore()]);
    return shop;
  }
  const res = await apiClient.post<PetShopRead>('/pet-shops', payload);
  return res.data;
}

export async function updateShop(id: string, payload: PetShopCreate): Promise<PetShopRead> {
  if (USE_MOCK) {
    await delay(300);
    const store = readStore();
    const idx = store.findIndex((s) => s.id === id);
    if (idx === -1) throw new Error('Shop not found');
    store[idx] = { ...store[idx], ...payload, updated_at: new Date().toISOString() };
    writeStore(store);
    return store[idx];
  }
  const res = await apiClient.put<PetShopRead>(`/pet-shops/${id}`, payload);
  return res.data;
}

export async function deleteShop(id: string): Promise<void> {
  if (USE_MOCK) {
    await delay(200);
    writeStore(readStore().filter((s) => s.id !== id));
    return;
  }
  await apiClient.delete(`/pet-shops/${id}`);
}

export async function uploadShopPhoto(file: File): Promise<string> {
  if (USE_MOCK) {
    await delay(300);
    return "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><rect width='200' height='200' rx='20' fill='%232563eb'/></svg>";
  }
  const form = new FormData();
  form.append('file', file);
  const res = await apiClient.post<{ url: string }>('/pet-shops/photos', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data.url;
}

// --- owner: products ---------------------------------------------------------

function mutateStoreShop(shopId: string, fn: (s: PetShopRead) => void): void {
  const store = readStore();
  const shop = store.find((s) => s.id === shopId);
  if (shop) { fn(shop); shop.updated_at = new Date().toISOString(); writeStore(store); }
}

export async function addProduct(shopId: string, payload: ShopProductCreate): Promise<ShopProduct> {
  if (USE_MOCK) {
    await delay(250);
    const now = new Date().toISOString();
    const product: ShopProduct = { ...payload, id: makeId(), shop_id: shopId, created_at: now, updated_at: now };
    mutateStoreShop(shopId, (s) => s.products.push(product));
    return product;
  }
  const res = await apiClient.post<ShopProduct>(`/pet-shops/${shopId}/products`, payload);
  return res.data;
}

export async function updateProduct(productId: string, payload: ShopProductCreate): Promise<ShopProduct> {
  if (USE_MOCK) {
    await delay(250);
    const store = readStore();
    for (const s of store) {
      const p = s.products.find((x) => x.id === productId);
      if (p) { Object.assign(p, payload, { updated_at: new Date().toISOString() }); writeStore(store); return p; }
    }
    throw new Error('Product not found');
  }
  const res = await apiClient.put<ShopProduct>(`/pet-shops/products/${productId}`, payload);
  return res.data;
}

export async function deleteProduct(productId: string): Promise<void> {
  if (USE_MOCK) {
    await delay(200);
    const store = readStore();
    for (const s of store) s.products = s.products.filter((x) => x.id !== productId);
    writeStore(store);
    return;
  }
  await apiClient.delete(`/pet-shops/products/${productId}`);
}

// --- owner: updates ----------------------------------------------------------

export async function addUpdate(shopId: string, payload: ShopUpdateCreate): Promise<ShopUpdate> {
  if (USE_MOCK) {
    await delay(250);
    const now = new Date().toISOString();
    const upd: ShopUpdate = { ...payload, id: makeId(), shop_id: shopId, created_at: now, updated_at: now };
    mutateStoreShop(shopId, (s) => s.updates.unshift(upd));
    return upd;
  }
  const res = await apiClient.post<ShopUpdate>(`/pet-shops/${shopId}/updates`, payload);
  return res.data;
}

export async function deleteUpdate(updateId: string): Promise<void> {
  if (USE_MOCK) {
    await delay(200);
    const store = readStore();
    for (const s of store) s.updates = s.updates.filter((x) => x.id !== updateId);
    writeStore(store);
    return;
  }
  await apiClient.delete(`/pet-shops/updates/${updateId}`);
}
