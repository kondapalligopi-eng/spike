// Per-listing click tracking for the directory pages.
//
// Cloudflare Web Analytics gives pageviews but has no custom events, so until
// this existed nothing recorded which listing anyone actually acted on. That is
// the number that matters for a directory — it is what tells a vet or salon
// "you got 40 calls from HiSpike last month".
//
// Counts land in the existing app_counters table via POST /counters/{key}/increment,
// keyed as "<category>:<action>:<id>". Nothing about the visitor is recorded —
// no id, no session, no address — only that the click happened.

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';
const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';

export type TrackCategory = 'hospital' | 'park' | 'swimming' | 'grooming';
export type TrackAction = 'book' | 'call' | 'maps' | 'whatsapp' | 'copy';

/**
 * app_counters.key is VARCHAR(64). The longest real key is
 * "swimming:whatsapp:" + a 36-char UUID = 54, so this is comfortable — but
 * truncating rather than overflowing keeps a bad id from erroring the insert.
 */
const MAX_KEY = 64;

/** djb2 — small, stable, and identical across browsers. Only used to keep an
 *  over-long key unique; nothing security-sensitive rides on it. */
function shortHash(input: string): string {
  let h = 5381;
  for (let i = 0; i < input.length; i++) h = ((h << 5) + h + input.charCodeAt(i)) | 0;
  return (h >>> 0).toString(36);
}

export function counterKey(category: TrackCategory, action: TrackAction, id: string): string {
  const key = `${category}:${action}:${id}`;
  if (key.length <= MAX_KEY) return key;
  // Plain truncation would merge two listings whose ids share a long prefix —
  // possible now that grooming keys on a name-derived slug. Trim and append a
  // hash of the full id so the key stays unique and stable.
  const suffix = `~${shortHash(id)}`;
  return key.slice(0, MAX_KEY - suffix.length) + suffix;
}

/**
 * Record a click. Fire-and-forget by design: never awaited, never throws, and
 * never blocks the click it is attached to.
 *
 * Uses sendBeacon because most of these clicks navigate away immediately —
 * `tel:`, a shop's website, WhatsApp. A normal fetch is cancelled when the page
 * unloads, so those clicks (the most valuable ones) would be the ones that go
 * missing. sendBeacon hands the request to the browser to deliver regardless.
 */
export function trackClick(category: TrackCategory, action: TrackAction, id?: string): void {
  if (!id || typeof window === 'undefined') return;
  const key = counterKey(category, action, id);

  if (USE_MOCK) {
    try {
      const k = `hispike_mock_counter_${key}`;
      localStorage.setItem(k, String(Number(localStorage.getItem(k) ?? '0') + 1));
    } catch {
      // ignore quota
    }
    return;
  }

  const url = `${API_URL}/api/v1/counters/${encodeURIComponent(key)}/increment`;
  try {
    if (navigator.sendBeacon?.(url)) return;
    // Fallback for browsers without sendBeacon. keepalive lets the request
    // outlive the page for the same reason.
    void fetch(url, { method: 'POST', keepalive: true }).catch(() => {});
  } catch {
    // Analytics must never break a user's click.
  }
}
