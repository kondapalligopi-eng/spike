import apiClient from './client';
import { useAuthStore } from '@/store/authStore';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';
const MOCK_KEY = 'hispike_mock_pet_pages';

// A public, shareable profile page for a pet — owner-created, lives at
// hispike.in/pet/<slug>. Works for living pets (celebrate them) and memorials
// alike; the copy is kept celebratory, not memorial-only.
export type PetPageRead = {
  id: string;
  slug: string;
  name: string;
  photos: string[]; // gallery; photos[0] is the primary/cover image
  highlights: string[]; // selected keys from PET_HIGHLIGHTS
  memories: string;
  owner_id: string;
  created_at: string;
  updated_at: string;
};

export type PetPageCreate = {
  slug: string;
  name: string;
  photos: string[];
  highlights: string[];
  memories: string;
};

export const MAX_MEMORY_WORDS = 500;
export const MAX_PHOTOS = 6;

// Curated trait chips an owner can toggle — rendered as the "Highlights" row on
// the public page (icon + label, two columns), like a sitter-profile highlight.
export type PetHighlight = { key: string; emoji: string; label: string };
export const PET_HIGHLIGHTS: PetHighlight[] = [
  { key: 'vaccinated', emoji: '💉', label: 'Vaccinated' },
  { key: 'neutered', emoji: '🩺', label: 'Neutered / spayed' },
  { key: 'house_trained', emoji: '🏠', label: 'House-trained' },
  { key: 'good_with_kids', emoji: '🧒', label: 'Good with kids' },
  { key: 'good_with_dogs', emoji: '🐕', label: 'Good with other dogs' },
  { key: 'good_with_cats', emoji: '🐈', label: 'Good with cats' },
  { key: 'loves_walks', emoji: '🦮', label: 'Loves walks' },
  { key: 'loves_swimming', emoji: '🏊', label: 'Loves swimming' },
  { key: 'microchipped', emoji: '🔖', label: 'Microchipped' },
  { key: 'friendly', emoji: '😊', label: 'Super friendly' },
  { key: 'trained', emoji: '🎓', label: 'Knows commands' },
  { key: 'cuddly', emoji: '🫶', label: 'Loves cuddles' },
];

const HIGHLIGHT_BY_KEY = new Map(PET_HIGHLIGHTS.map((h) => [h.key, h]));
export function highlightFor(key: string): PetHighlight | undefined {
  return HIGHLIGHT_BY_KEY.get(key);
}

// Slugs that must never be taken — they collide with sub-paths we may add under
// /pet/ later (e.g. /pet/new for the editor). Site-page collisions (/about,
// /admin …) are already impossible because every page lives under /pet/.
export const RESERVED_SLUGS = new Set(['new', 'create', 'edit', 'me', 'mine', 'admin']);

/** Normalise free text into a URL-safe slug: lowercase, dashes, a–z0–9 only. */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function countWords(text: string): number {
  const trimmed = text.trim();
  return trimmed ? trimmed.split(/\s+/).length : 0;
}

/** True when `slug` is well-formed and not reserved (does not check uniqueness). */
export function isSlugWellFormed(slug: string): boolean {
  return slug.length >= 2 && slug.length <= 60 && slug === slugify(slug) && !RESERVED_SLUGS.has(slug);
}

// ---- mock store (localStorage) so the feature is fully usable in local dev ----

function makeId(): string {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `mock-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

// Tolerate older mock rows that stored a single `photo_url` / no highlights.
function normalizeRow(r: Record<string, unknown>): PetPageRead {
  const photos = Array.isArray(r.photos)
    ? (r.photos as string[])
    : typeof r.photo_url === 'string' && r.photo_url
      ? [r.photo_url]
      : [];
  return {
    id: String(r.id),
    slug: String(r.slug),
    name: String(r.name ?? ''),
    photos,
    highlights: Array.isArray(r.highlights) ? (r.highlights as string[]) : [],
    memories: String(r.memories ?? ''),
    owner_id: String(r.owner_id ?? ''),
    created_at: String(r.created_at ?? ''),
    updated_at: String(r.updated_at ?? ''),
  };
}

function readStore(): PetPageRead[] {
  if (typeof localStorage === 'undefined') return [];
  try {
    const raw = localStorage.getItem(MOCK_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.map(normalizeRow) : [];
  } catch {
    return [];
  }
}

function writeStore(rows: PetPageRead[]): void {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(MOCK_KEY, JSON.stringify(rows));
  } catch {
    // Ignore quota errors (large base64 photos can overflow in mock mode).
  }
}

function currentOwnerId(): string {
  return String(useAuthStore.getState().user?.id ?? 'mock-owner');
}

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

function status404(err: unknown): boolean {
  return (err as { response?: { status?: number } } | undefined)?.response?.status === 404;
}

function cleanPayload(data: PetPageCreate) {
  return {
    slug: data.slug,
    name: data.name.trim(),
    photos: (data.photos ?? []).slice(0, MAX_PHOTOS),
    highlights: data.highlights ?? [],
    memories: data.memories.trim(),
  };
}

// ---- API ----

/** The signed-in owner's own pages, newest first. */
export async function listMyPetPages(): Promise<PetPageRead[]> {
  if (USE_MOCK) {
    await delay(150);
    const owner = currentOwnerId();
    return readStore()
      .filter((p) => p.owner_id === owner)
      .sort((a, b) => b.created_at.localeCompare(a.created_at));
  }
  const res = await apiClient.get<PetPageRead[]>('/pet-pages/mine');
  return res.data;
}

/** Public lookup by slug. Returns null when no page exists (404). */
export async function getPetPageBySlug(slug: string): Promise<PetPageRead | null> {
  if (USE_MOCK) {
    await delay(150);
    return readStore().find((p) => p.slug === slug) ?? null;
  }
  try {
    const res = await apiClient.get<PetPageRead>(`/pet-pages/by-slug/${encodeURIComponent(slug)}`);
    return res.data;
  } catch (err) {
    if (status404(err)) return null;
    throw err;
  }
}

/** Whether `slug` is free to use. `excludeId` skips a page (for edits). */
export async function checkSlugAvailable(slug: string, excludeId?: string): Promise<boolean> {
  if (!isSlugWellFormed(slug)) return false;
  if (USE_MOCK) {
    await delay(120);
    return !readStore().some((p) => p.slug === slug && p.id !== excludeId);
  }
  const res = await apiClient.get<{ available: boolean }>(
    `/pet-pages/slug-available/${encodeURIComponent(slug)}`,
    { params: excludeId ? { exclude_id: excludeId } : undefined },
  );
  return res.data.available;
}

export async function createPetPage(data: PetPageCreate): Promise<PetPageRead> {
  if (USE_MOCK) {
    await delay(300);
    const store = readStore();
    if (store.some((p) => p.slug === data.slug)) {
      throw new Error('That link is already taken — try another.');
    }
    const now = new Date().toISOString();
    const row: PetPageRead = {
      id: makeId(),
      owner_id: currentOwnerId(),
      ...cleanPayload(data),
      created_at: now,
      updated_at: now,
    };
    store.push(row);
    writeStore(store);
    return row;
  }
  const res = await apiClient.post<PetPageRead>('/pet-pages', data);
  return res.data;
}

export async function updatePetPage(id: string, data: PetPageCreate): Promise<PetPageRead> {
  if (USE_MOCK) {
    await delay(250);
    const store = readStore();
    const idx = store.findIndex((p) => p.id === id);
    if (idx === -1) throw new Error('Page not found.');
    if (store.some((p) => p.slug === data.slug && p.id !== id)) {
      throw new Error('That link is already taken — try another.');
    }
    const updated: PetPageRead = {
      ...store[idx],
      ...cleanPayload(data),
      updated_at: new Date().toISOString(),
    };
    store[idx] = updated;
    writeStore(store);
    return updated;
  }
  const res = await apiClient.put<PetPageRead>(`/pet-pages/${id}`, data);
  return res.data;
}

export async function deletePetPage(id: string): Promise<void> {
  if (USE_MOCK) {
    await delay(200);
    writeStore(readStore().filter((p) => p.id !== id));
    return;
  }
  await apiClient.delete(`/pet-pages/${id}`);
}
