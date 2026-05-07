// Lightweight per-device visit tracking using localStorage. No backend
// required, but the resulting numbers are scoped to a single browser
// profile — they do not aggregate across devices or users. For real
// site-wide analytics, integrate Cloudflare Web Analytics, Plausible,
// or an equivalent service.

const KEY_VISITOR_ID = 'hispike_visitor_id';
const KEY_PAGE_VIEWS = 'hispike_page_views';
const KEY_UNIQUE_SESSIONS = 'hispike_unique_sessions';
const KEY_FIRST_VISIT = 'hispike_first_visit_at';
const KEY_LAST_VISIT = 'hispike_last_visit_at';

// A new "session" is counted whenever a visit comes in after at least
// 30 minutes of inactivity — same window most analytics tools use.
const SESSION_GAP_MS = 30 * 60 * 1000;

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
}

export function recordPageView(): void {
  if (!isBrowser()) return;

  const now = Date.now();
  const storedLast = Number(localStorage.getItem(KEY_LAST_VISIT) ?? '0');

  if (!localStorage.getItem(KEY_VISITOR_ID)) {
    // First-ever visit from this browser
    const id =
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `v-${now}-${Math.random().toString(36).slice(2, 10)}`;
    localStorage.setItem(KEY_VISITOR_ID, id);
    localStorage.setItem(KEY_FIRST_VISIT, String(now));
    localStorage.setItem(KEY_UNIQUE_SESSIONS, '1');
  } else if (storedLast === 0 || now - storedLast > SESSION_GAP_MS) {
    // Returning visitor after a long gap → new session
    const sessions = Number(localStorage.getItem(KEY_UNIQUE_SESSIONS) ?? '0');
    localStorage.setItem(KEY_UNIQUE_SESSIONS, String(sessions + 1));
  }

  const views = Number(localStorage.getItem(KEY_PAGE_VIEWS) ?? '0');
  localStorage.setItem(KEY_PAGE_VIEWS, String(views + 1));
  localStorage.setItem(KEY_LAST_VISIT, String(now));
}

export type VisitStats = {
  pageViews: number;
  uniqueSessions: number;
  firstVisitAt: Date | null;
  lastVisitAt: Date | null;
  visitorId: string | null;
};

export function getVisitStats(): VisitStats {
  if (!isBrowser()) {
    return {
      pageViews: 0,
      uniqueSessions: 0,
      firstVisitAt: null,
      lastVisitAt: null,
      visitorId: null,
    };
  }
  const first = Number(localStorage.getItem(KEY_FIRST_VISIT) ?? '0');
  const last = Number(localStorage.getItem(KEY_LAST_VISIT) ?? '0');
  return {
    pageViews: Number(localStorage.getItem(KEY_PAGE_VIEWS) ?? '0'),
    uniqueSessions: Number(localStorage.getItem(KEY_UNIQUE_SESSIONS) ?? '0'),
    firstVisitAt: first ? new Date(first) : null,
    lastVisitAt: last ? new Date(last) : null,
    visitorId: localStorage.getItem(KEY_VISITOR_ID),
  };
}

export function resetVisitStats(): void {
  if (!isBrowser()) return;
  [
    KEY_VISITOR_ID,
    KEY_PAGE_VIEWS,
    KEY_UNIQUE_SESSIONS,
    KEY_FIRST_VISIT,
    KEY_LAST_VISIT,
  ].forEach((k) => localStorage.removeItem(k));
}
