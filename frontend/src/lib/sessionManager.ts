// Proactive session manager.
//
// Job: keep the user's access token fresh in the background so a long
// admin-editing session never trips the 401 → silent-refresh → retry path
// in the middle of a save. Triggered after login, restarted whenever the
// access token rotates, stopped on logout.
//
// Behaviour:
//   * Decodes the access JWT to find its `exp`.
//   * Schedules a refresh ~60s before that expiry.
//   * Also re-checks on tab visibility change, since background tabs have
//     their setTimeout throttled by the browser and may miss the deadline.
//   * On a successful refresh: silently rotates the token. No toast — too
//     noisy at 28-minute intervals.
//   * On a failed refresh (network down, refresh token actually expired):
//     warns the user with a toast so they know to save work and re-login.

import { refreshAccessToken } from '@/api/auth';
import { toast } from '@/store/toastStore';
import { useAuthStore } from '@/store/authStore';

const REFRESH_LEAD_TIME_MS = 60 * 1000; // refresh 60s before exp
const MIN_DELAY_MS = 5 * 1000;          // never schedule sooner than 5s
const MAX_DELAY_MS = 25 * 60 * 1000;    // setTimeout sanity ceiling: 25 min

let timerId: number | null = null;
let visibilityHandler: (() => void) | null = null;
let warnedNearExpiry = false;

function decodeJwtExpMs(token: string): number | null {
  try {
    const payload = token.split('.')[1];
    if (!payload) return null;
    // base64url → base64
    const b64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = b64 + '='.repeat((4 - (b64.length % 4)) % 4);
    const json = JSON.parse(atob(padded));
    return typeof json.exp === 'number' ? json.exp * 1000 : null;
  } catch {
    return null;
  }
}

async function doProactiveRefresh(): Promise<void> {
  const refreshTokenValue = localStorage.getItem('auth_refresh_token');
  if (!refreshTokenValue) {
    // Nothing to refresh with — stop the loop. The next API call will
    // surface a 401 and the client.ts handler will toast + redirect.
    stopSessionManager();
    return;
  }

  try {
    const { access_token } = await refreshAccessToken(refreshTokenValue);
    localStorage.setItem('auth_token', access_token);
    useAuthStore.getState().setTokens(access_token);
    warnedNearExpiry = false;
    scheduleNext(access_token);
  } catch {
    // Refresh failed. Likely the refresh token itself has expired (7-day
    // window elapsed) or the backend is unreachable. Tell the user so they
    // can save work — then let the next API call drive the actual logout.
    toast.error(
      'Could not extend your session. Please save your work and sign in again.',
    );
    stopSessionManager();
  }
}

function scheduleNext(accessToken: string): void {
  clearTimer();
  const expMs = decodeJwtExpMs(accessToken);
  if (!expMs) return;

  const now = Date.now();
  let delay = expMs - now - REFRESH_LEAD_TIME_MS;

  // Already past (or within) the lead window → refresh immediately.
  if (delay <= 0) {
    void doProactiveRefresh();
    return;
  }
  // Clamp into a safe range. If we cap, we'll re-check at the next tick
  // and either fire then or reschedule closer.
  if (delay < MIN_DELAY_MS) delay = MIN_DELAY_MS;
  if (delay > MAX_DELAY_MS) delay = MAX_DELAY_MS;

  timerId = window.setTimeout(() => {
    const remaining = expMs - Date.now();
    if (remaining <= REFRESH_LEAD_TIME_MS) {
      void doProactiveRefresh();
    } else {
      // We're here because of the MAX_DELAY_MS clamp — just reschedule.
      scheduleNext(accessToken);
    }
  }, delay);
}

function onVisibilityChange(): void {
  if (document.visibilityState !== 'visible') return;
  // Background tabs throttle setTimeout; when the tab comes forward we may
  // already be past the refresh deadline. Re-evaluate immediately.
  const token = localStorage.getItem('auth_token');
  if (!token) return;
  const expMs = decodeJwtExpMs(token);
  if (!expMs) return;
  const remaining = expMs - Date.now();
  if (remaining <= REFRESH_LEAD_TIME_MS) {
    void doProactiveRefresh();
  } else if (remaining < 2 * REFRESH_LEAD_TIME_MS && !warnedNearExpiry) {
    // Edge case: tab was hidden long enough that we're seconds from a 401.
    // Quietly nudge the schedule forward so refresh fires now-ish.
    scheduleNext(token);
  }
}

function clearTimer(): void {
  if (timerId !== null) {
    window.clearTimeout(timerId);
    timerId = null;
  }
}

export function startSessionManager(): void {
  if (typeof window === 'undefined') return; // SSR pre-render guard
  const token = localStorage.getItem('auth_token');
  if (!token) return;

  // Re-entrant safe — wipe any previous schedule first.
  stopSessionManager({ keepWarnFlag: true });

  visibilityHandler = onVisibilityChange;
  document.addEventListener('visibilitychange', visibilityHandler);
  scheduleNext(token);
}

export function stopSessionManager(opts?: { keepWarnFlag?: boolean }): void {
  clearTimer();
  if (visibilityHandler) {
    document.removeEventListener('visibilitychange', visibilityHandler);
    visibilityHandler = null;
  }
  if (!opts?.keepWarnFlag) warnedNearExpiry = false;
}
