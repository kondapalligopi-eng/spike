import { useEffect, useState } from 'react';
import { getVisitStats, resetVisitStats, type VisitStats } from '@/lib/visitTracker';

function formatDateTime(d: Date | null): string {
  if (!d) return '—';
  return d.toLocaleString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function VisitsSection() {
  const [visit, setVisit] = useState<VisitStats>(() => getVisitStats());

  // Refresh on mount + every 5s so newly-tracked navigations are picked up
  useEffect(() => {
    setVisit(getVisitStats());
    const id = window.setInterval(() => setVisit(getVisitStats()), 5000);
    return () => window.clearInterval(id);
  }, []);

  const handleReset = () => {
    if (window.confirm('Reset local visit counters on this device? This cannot be undone.')) {
      resetVisitStats();
      setVisit(getVisitStats());
    }
  };

  return (
    <section className="mb-10">
      <div className="flex items-end justify-between mb-4 gap-3 flex-wrap">
        <div>
          <p className="text-[11px] font-semibold tracking-[0.3em] text-accent-600 uppercase mb-1">
            Site Analytics
          </p>
          <h2 className="text-xl font-bold text-warm-900">Website visits</h2>
        </div>
        <button
          type="button"
          onClick={handleReset}
          className="text-xs text-warm-500 hover:text-red-600 underline transition-colors"
        >
          Reset device counters
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border-2 border-primary-100 bg-white p-5">
          <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-primary-700 mb-2">
            Total Visits
          </p>
          <p className="text-3xl font-extrabold text-warm-900">
            {visit.pageViews.toLocaleString('en-IN')}
          </p>
          <p className="text-xs text-warm-500 mt-1">Page views from this device</p>
        </div>

        <div className="rounded-2xl border-2 border-primary-100 bg-white p-5">
          <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-primary-700 mb-2">
            Unique Visits
          </p>
          <p className="text-3xl font-extrabold text-warm-900">
            {visit.uniqueSessions.toLocaleString('en-IN')}
          </p>
          <p className="text-xs text-warm-500 mt-1">Sessions (30-min idle window)</p>
        </div>

        <div className="rounded-2xl border-2 border-primary-100 bg-white p-5">
          <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-primary-700 mb-2">
            First Visit
          </p>
          <p className="text-base font-bold text-warm-900 leading-tight">
            {formatDateTime(visit.firstVisitAt)}
          </p>
        </div>

        <div className="rounded-2xl border-2 border-primary-100 bg-white p-5">
          <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-primary-700 mb-2">
            Last Visit
          </p>
          <p className="text-base font-bold text-warm-900 leading-tight">
            {formatDateTime(visit.lastVisitAt)}
          </p>
        </div>
      </div>

      {import.meta.env.VITE_CF_BEACON_TOKEN ? (
        <div className="mt-4 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-xs text-emerald-800 leading-relaxed flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <p>
            <span className="font-semibold">✓ Cloudflare Web Analytics is active.</span>{' '}
            The numbers above only count this browser. Site-wide totals (across every visitor and device) live in the Cloudflare dashboard.
          </p>
          <a
            href="https://dash.cloudflare.com/?to=/:account/analytics/web/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white border-2 border-emerald-300 text-emerald-700 text-xs font-bold tracking-wider uppercase hover:border-emerald-500 hover:text-emerald-900 transition-colors shrink-0"
          >
            Open Cloudflare
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </a>
        </div>
      ) : (
        <div className="mt-4 rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-xs text-amber-800 leading-relaxed">
          <p className="font-semibold mb-1">⚠ Per-device counter — Cloudflare Analytics not yet configured</p>
          <p className="mb-2">
            These numbers track visits from the current browser only. To get real site-wide totals across every visitor:
          </p>
          <ol className="list-decimal pl-5 space-y-0.5">
            <li>
              Go to{' '}
              <a
                href="https://dash.cloudflare.com/?to=/:account/analytics/web/"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-amber-900 font-semibold"
              >
                Cloudflare → Analytics &amp; Logs → Web Analytics
              </a>
            </li>
            <li>Click <strong>Add a site</strong>, enter <code className="px-1 bg-amber-100 rounded">hispike.in</code></li>
            <li>Copy the <code className="px-1 bg-amber-100 rounded">token</code> from the snippet Cloudflare returns</li>
            <li>Set <code className="px-1 bg-amber-100 rounded">VITE_CF_BEACON_TOKEN</code> in your Render service environment, then redeploy</li>
          </ol>
        </div>
      )}
    </section>
  );
}

export function Admin() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-warm-900 mb-2">Admin Dashboard</h1>
        <p className="text-warm-500">Site activity at a glance</p>
      </div>

      <VisitsSection />
    </div>
  );
}
