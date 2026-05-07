import { useEffect } from 'react';

// Loads the Cloudflare Web Analytics beacon when VITE_CF_BEACON_TOKEN is
// set. The beacon collects pageviews + Core Web Vitals without cookies and
// hooks into pushState/replaceState/popstate, so single-page navigations
// are tracked automatically — no per-route recordPageView call needed.
//
// Token lives in the Cloudflare dashboard:
// dash.cloudflare.com → Analytics & Logs → Web Analytics → your site → Edit
export function CloudflareAnalytics() {
  useEffect(() => {
    const token = import.meta.env.VITE_CF_BEACON_TOKEN;
    if (!token) return;
    if (typeof document === 'undefined') return;

    // Avoid double-injection during dev/HMR
    const existing = document.querySelector('script[data-cf-beacon-injected="true"]');
    if (existing) return;

    const script = document.createElement('script');
    script.defer = true;
    script.src = 'https://static.cloudflareinsights.com/beacon.min.js';
    script.setAttribute('data-cf-beacon', JSON.stringify({ token }));
    script.setAttribute('data-cf-beacon-injected', 'true');
    document.head.appendChild(script);
  }, []);

  return null;
}
