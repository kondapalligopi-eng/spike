import type { ReactNode } from 'react';
import { PageHead } from './PageHead';

// Shared shell for legal/policy pages (Terms, Privacy) — branded hero band +
// a readable white "document" card. Keeps both pages visually consistent.
export function LegalLayout({
  title,
  intro,
  lastUpdated,
  path,
  children,
}: {
  title: string;
  intro: string;
  lastUpdated: string;
  path: string;
  children: ReactNode;
}) {
  return (
    <div className="bg-warm-50 min-h-screen">
      <PageHead title={title} description={intro} path={path} />

      <section className="bg-gradient-to-r from-primary-900 via-primary-800 to-primary-600 text-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-12">
          <p className="text-[11px] sm:text-xs font-semibold tracking-[0.3em] text-accent-400 uppercase mb-1">
            HiSpike · Legal
          </p>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">{title}</h1>
          <div className="mt-2 h-0.5 w-16 bg-accent-400 rounded-full" />
          <p className="mt-3 text-sm text-primary-100/90">Last updated: {lastUpdated}</p>
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        <div className="bg-white rounded-2xl border border-warm-200 shadow-sm p-6 sm:p-8 space-y-7 text-[15px] leading-relaxed text-warm-700">
          {children}
        </div>
      </div>
    </div>
  );
}

// One numbered/headed section within a legal document.
export function LegalSection({ heading, children }: { heading: string; children: ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-bold text-warm-900">{heading}</h2>
      {children}
    </section>
  );
}
