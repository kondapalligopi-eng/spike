import { useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';

// Render free-tier services sleep after ~15 min of idle. The first request
// after sleep takes 30–60s to wake the dyno — which on a service page lands
// as a page that "won't load until you refresh." Firing a non-blocking
// GET /health the moment a service-discovery page mounts wakes the dyno in
// parallel with React rendering, so by the time React Query fires the real
// list endpoint, the backend is already booting (or warm). Same pattern as
// the admin page warmup.
//
// SSR-safe: skipped during the SSG pre-render (no `window`). Failure of the
// warmup ping is intentionally ignored — it's best-effort.

let lastPingMs = 0;
const PING_COOLDOWN_MS = 60_000; // don't re-ping if we already pinged in the last minute

export function pingBackend(): void {
  if (typeof window === 'undefined') return;
  const now = Date.now();
  if (now - lastPingMs < PING_COOLDOWN_MS) return;
  lastPingMs = now;
  fetch(`${API_URL}/health`, { method: 'GET', cache: 'no-store' }).catch(() => {
    // best-effort; don't block or surface.
  });
}

export function useBackendWarmup(): void {
  useEffect(() => {
    pingBackend();
  }, []);
}
