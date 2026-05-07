type Press = {
  date: string;
  source: string;
  headline: string;
  excerpt: string;
  href: string;
};

const PRESS: Press[] = [
  {
    date: '2026-04-12',
    source: 'YourStory',
    headline: 'HiSpike raises seed round to localise pet care for Indian cities',
    excerpt:
      'Bengaluru-based HiSpike has closed a seed round to expand its directory of vetted pet-care providers — vets, salons, swim coaches, and dog parks — across Indian metros.',
    href: '#',
  },
  {
    date: '2026-03-02',
    source: 'The Hindu',
    headline: 'A Bengaluru startup is fixing how pet parents find vets',
    excerpt:
      'HiSpike\'s hyperlocal model is winning over dog owners in Indiranagar and HSR Layout, where finding a trustworthy clinic used to take days.',
    href: '#',
  },
  {
    date: '2026-01-18',
    source: 'Dogs Trust India',
    headline: 'HiSpike partners with Bengaluru shelters for adoption listings',
    excerpt:
      'A new partnership opens HiSpike\'s adoption tab to dogs from partnered shelters across the city, surfacing rescues alongside service listings.',
    href: '#',
  },
];

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function Newsroom() {
  return (
    <div className="bg-white">
      <section className="relative overflow-hidden bg-gradient-to-r from-primary-900 via-primary-800 to-primary-600 text-white">
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage:
              `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 60 60'><g fill='white'><path d='M14 18a3 3 0 1 1 0 6 3 3 0 0 1 0-6zm18 0a3 3 0 1 1 0 6 3 3 0 0 1 0-6zM18 8a3 3 0 1 1 0 6 3 3 0 0 1 0-6zm10 0a3 3 0 1 1 0 6 3 3 0 0 1 0-6zm-5 10a6 6 0 0 0-5.3 8.9l-.5 3.3c-.2 1.4.9 2.6 2.3 2.6h7a2.3 2.3 0 0 0 2.3-2.6l-.5-3.3A6 6 0 0 0 23 18z'/></g></svg>")`,
            backgroundSize: '120px 120px',
          }}
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6">
          <span aria-hidden="true" className="text-4xl sm:text-5xl drop-shadow">📰</span>
          <div className="flex-1">
            <p className="text-[11px] sm:text-xs font-semibold tracking-[0.3em] text-accent-400 uppercase mb-1">
              Press · HiSpike
            </p>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight">
              Newsroom
            </h1>
            <div className="mt-2 h-0.5 w-16 bg-accent-400 rounded-full" />
            <p className="mt-2 text-sm text-primary-100/90 max-w-2xl">
              HiSpike in the news, partnerships, and product announcements.
            </p>
          </div>
          <a
            href="mailto:press@hispike.in"
            className="self-start md:self-auto inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-accent-400 hover:bg-accent-300 text-warm-900 text-sm font-bold tracking-[0.15em] uppercase ring-2 ring-accent-300/50 hover:ring-accent-200 transition-all shadow-md"
          >
            Press Enquiries
          </a>
        </div>
      </section>

      <section className="bg-primary-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-5">
          {PRESS.map((p) => (
            <article
              key={p.headline}
              className="rounded-2xl border-2 border-primary-100 bg-white p-6 hover:border-primary-300 hover:shadow-md transition-all"
            >
              <div className="flex flex-wrap items-center gap-3 mb-2 text-xs font-semibold uppercase tracking-[0.2em]">
                <span className="text-primary-700">{p.source}</span>
                <span className="text-warm-400">·</span>
                <span className="text-warm-500">{formatDate(p.date)}</span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-warm-900 mb-2 leading-snug">
                {p.headline}
              </h2>
              <p className="text-sm text-warm-700 leading-relaxed mb-3">{p.excerpt}</p>
              <a
                href={p.href}
                className="inline-flex items-center gap-1 text-sm font-semibold text-primary-700 hover:text-primary-800 hover:underline"
              >
                Read more
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </a>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
