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
const KEY_CURRENT_SESSION_ID = 'hispike_current_session_id';
const KEY_VISIT_LOG = 'hispike_visit_log';

// A new "session" is counted whenever a visit comes in after at least
// 30 minutes of inactivity — same window most analytics tools use.
const SESSION_GAP_MS = 30 * 60 * 1000;

// Cap event log size so localStorage doesn't grow unbounded. ~5000
// events is roughly 6 months of moderate solo use at <50 KB.
const MAX_LOG_EVENTS = 5000;

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
}

type VisitEvent = { ts: number; sid: string };

function readVisitLog(): VisitEvent[] {
  if (!isBrowser()) return [];
  try {
    const raw = localStorage.getItem(KEY_VISIT_LOG);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as VisitEvent[]) : [];
  } catch {
    return [];
  }
}

function writeVisitLog(log: VisitEvent[]): void {
  if (!isBrowser()) return;
  const trimmed =
    log.length > MAX_LOG_EVENTS ? log.slice(log.length - MAX_LOG_EVENTS) : log;
  try {
    localStorage.setItem(KEY_VISIT_LOG, JSON.stringify(trimmed));
  } catch {
    // Quota exceeded — drop the oldest half and retry once.
    try {
      const halved = trimmed.slice(Math.floor(trimmed.length / 2));
      localStorage.setItem(KEY_VISIT_LOG, JSON.stringify(halved));
    } catch {
      // Give up silently — the aggregate counters still work.
    }
  }
}

function nextSessionId(now: number): string {
  return `s-${now}-${Math.random().toString(36).slice(2, 8)}`;
}

export function recordPageView(): void {
  if (!isBrowser()) return;

  const now = Date.now();
  const storedLast = Number(localStorage.getItem(KEY_LAST_VISIT) ?? '0');
  const isNewSession = storedLast === 0 || now - storedLast > SESSION_GAP_MS;

  if (!localStorage.getItem(KEY_VISITOR_ID)) {
    // First-ever visit from this browser
    const id =
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `v-${now}-${Math.random().toString(36).slice(2, 10)}`;
    localStorage.setItem(KEY_VISITOR_ID, id);
    localStorage.setItem(KEY_FIRST_VISIT, String(now));
    localStorage.setItem(KEY_UNIQUE_SESSIONS, '1');
  } else if (isNewSession) {
    const sessions = Number(localStorage.getItem(KEY_UNIQUE_SESSIONS) ?? '0');
    localStorage.setItem(KEY_UNIQUE_SESSIONS, String(sessions + 1));
  }

  // Reuse existing session id when within the idle window, otherwise mint one
  let sessionId = localStorage.getItem(KEY_CURRENT_SESSION_ID);
  if (!sessionId || isNewSession) {
    sessionId = nextSessionId(now);
    localStorage.setItem(KEY_CURRENT_SESSION_ID, sessionId);
  }

  const views = Number(localStorage.getItem(KEY_PAGE_VIEWS) ?? '0');
  localStorage.setItem(KEY_PAGE_VIEWS, String(views + 1));
  localStorage.setItem(KEY_LAST_VISIT, String(now));

  const log = readVisitLog();
  log.push({ ts: now, sid: sessionId });
  writeVisitLog(log);
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

export type RangedVisitStats = {
  pageViews: number;
  uniqueSessions: number;
  lastVisitAt: Date | null;
};

// Returns aggregate stats for visits whose timestamp falls within
// [startMs, endMs] (inclusive). Sessions are counted as the number of
// distinct session IDs observed in the range.
export function getRangedStats(startMs: number, endMs: number): RangedVisitStats {
  if (!isBrowser()) {
    return { pageViews: 0, uniqueSessions: 0, lastVisitAt: null };
  }
  const log = readVisitLog();
  const inRange = log.filter((e) => e.ts >= startMs && e.ts <= endMs);
  if (inRange.length === 0) {
    return { pageViews: 0, uniqueSessions: 0, lastVisitAt: null };
  }
  const sessions = new Set(inRange.map((e) => e.sid));
  const lastTs = inRange[inRange.length - 1].ts;
  return {
    pageViews: inRange.length,
    uniqueSessions: sessions.size,
    lastVisitAt: new Date(lastTs),
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
    KEY_CURRENT_SESSION_ID,
    KEY_VISIT_LOG,
  ].forEach((k) => localStorage.removeItem(k));
}
