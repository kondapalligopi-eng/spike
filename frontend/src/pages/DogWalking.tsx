import { useMemo, useState } from 'react';
import { PageHead } from '@/components/PageHead';
import { FaqSchema, type FaqItem } from '@/components/FaqSchema';
import { HeroPaws } from '@/components/HeroPaws';
import { ShareButtons } from '@/components/ShareButtons';

type Walker = {
  name: string;
  area: string;
  rate: string;
  phone: string;
  hours: string;
  blurb: string;
};

// Real walkers only. An earlier draft of this page shipped eight invented
// businesses ("Pawfect Strides", "WagOnTheGo", …) with plausible +91 80 4xxx
// landline numbers behind Call buttons, next to a "verified by HiSpike" badge.
// Those numbers fall inside live Bengaluru landline ranges, so visitors could
// have ended up ringing unrelated businesses — and the page asserted we had
// checked references for services that did not exist. They are not coming back.
//
// Walkers apply through /feedback; add a confirmed one here and the filter bar
// and card grid below light up on their own. Once there are enough to be worth
// indexing, add the /dog-walking rewrite to render.yaml so the page is
// pre-rendered for crawlers.
const WALKERS: Walker[] = [];

const AREAS = ['All areas', ...Array.from(new Set(WALKERS.map((w) => w.area))).sort()];

const DOG_WALKING_FAQS: FaqItem[] = [
  {
    q: 'How much do dog walkers charge in Bengaluru?',
    a: 'Dog walking in Bengaluru typically runs ₹250–₹450 for a 30-minute walk. Rates vary by neighbourhood, whether the walk is solo or in a small group, and whether the walker handles reactive, senior, or special-needs dogs.',
  },
  {
    q: 'How do I book a dog walker on HiSpike?',
    a: 'The walker directory is still opening, so there are no listings to book yet. Once walkers are listed, each entry carries a Call button so you can ring them directly to confirm timings, your dog\'s breed and temperament, and the pickup point.',
  },
  {
    q: 'Are HiSpike dog walkers verified?',
    a: 'Every walking service is checked before it goes live — references confirmed, areas of operation verified, and complaints history reviewed. We don\'t run paid placements, and we don\'t list a walker until that check is done. No walkers are listed yet.',
  },
  {
    q: 'I walk dogs in Bengaluru — how do I get listed?',
    a: 'Use the "List Your Service" button on this page. Tell us the areas you cover, your rates, your hours, and the breeds or temperaments you are comfortable with. We verify references before publishing, and listing is free.',
  },
  {
    q: 'What if my dog is reactive or needs special handling?',
    a: 'Always discuss your dog\'s temperament, any medication, and equipment or muzzle requirements with a walker before the first booking. When listings go live, walkers who handle reactive, senior, or special-needs dogs will say so in their blurb.',
  },
];

function mapsUrl(addressOrArea: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addressOrArea + ', Bengaluru')}`;
}

export function DogWalking() {
  const [area, setArea] = useState<string>('All areas');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return WALKERS.filter((w) => {
      if (area !== 'All areas' && w.area !== area) return false;
      if (q && !`${w.name} ${w.area} ${w.blurb}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [area, search]);

  // With no walkers listed, the search box and area dropdown would be dead
  // controls over an empty set, so the filter bar only appears once there is
  // something to filter.
  const hasListings = WALKERS.length > 0;

  return (
    <div className="flex flex-col">
      <PageHead
        title="Dog Walkers in Bengaluru — HiSpike"
        description="HiSpike's dog walker directory for Bengaluru is opening — Indiranagar, Koramangala, HSR Layout, Whitefield, Jayanagar, Sarjapur Road, Bellandur and Domlur. Walkers can list free; references are checked before publishing."
        path="/dog-walking"
      />
      <FaqSchema faqs={DOG_WALKING_FAQS} />

      <section className="relative overflow-hidden bg-gradient-to-r from-primary-900 via-primary-800 to-primary-600 text-white">
        <HeroPaws />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6">
          <span aria-hidden="true" className="text-4xl sm:text-5xl drop-shadow">🦮</span>
          <div className="flex-1">
            <p className="text-[11px] sm:text-xs font-semibold tracking-[0.3em] text-accent-400 uppercase mb-1">
              Dog Walkers · Bangalore
            </p>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight">
              Dog Walkers in Bangalore
            </h1>
            <div className="mt-2 h-0.5 w-16 bg-accent-400 rounded-full" />
            <p className="mt-2 text-sm text-primary-100/90 max-w-2xl">
              Hyperlocal dog walkers across Indiranagar, Koramangala, HSR Layout, Whitefield,
              Jayanagar, Sarjapur Road, Bellandur, and Domlur — references checked before we list them.
            </p>
          </div>
          <a
            href="/feedback"
            className="self-start md:self-auto inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-accent-400 hover:bg-accent-300 text-warm-900 text-sm font-bold tracking-[0.15em] uppercase ring-2 ring-accent-300/50 hover:ring-accent-200 transition-all shadow-md"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            List Your Service
          </a>
        </div>
      </section>

      {hasListings && (
        <section className="border-b border-warm-200 bg-primary-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-wrap items-center gap-2 lg:gap-3">
            <label className="flex items-center gap-2 px-3 py-2 border-2 border-warm-400 rounded-md bg-white flex-1 w-full sm:w-auto sm:min-w-[200px]">
              <svg className="w-4 h-4 text-warm-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z" />
              </svg>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search walkers"
                className="w-full text-sm outline-none bg-transparent placeholder:text-warm-400"
              />
            </label>

            <label className="flex items-center gap-2 px-3 py-2 border-2 border-warm-400 rounded-md bg-white w-full sm:w-auto sm:min-w-[200px] cursor-pointer">
              <svg aria-hidden="true" className="w-4 h-4 text-warm-500 pointer-events-none shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0L6.343 16.657M16 11a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <select
                value={area}
                onChange={(e) => setArea(e.target.value)}
                className="w-full text-sm outline-none bg-transparent text-warm-700 cursor-pointer"
              >
                {AREAS.map((a) => (
                  <option key={a}>{a}</option>
                ))}
              </select>
            </label>
          </div>
        </section>
      )}

      <section className="py-10 bg-primary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {!hasListings ? (
            <div className="max-w-2xl mx-auto text-center bg-white rounded-2xl border-2 border-dashed border-primary-200 px-6 py-12">
              <div className="text-5xl mb-4" aria-hidden="true">🦮</div>
              <h2 className="text-xl font-extrabold text-warm-900 mb-2">
                The first walkers are being verified
              </h2>
              <p className="text-sm text-warm-600 max-w-md mx-auto mb-6">
                We&rsquo;re checking references for dog walkers across Indiranagar, Koramangala,
                HSR Layout, Whitefield, Jayanagar, Sarjapur Road, Bellandur and Domlur. We list
                a walker only once that check is done — so this page stays empty until it is.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <a
                  href="/feedback"
                  className="inline-flex items-center justify-center px-5 py-2.5 rounded-full bg-primary-700 hover:bg-primary-800 text-white text-sm font-semibold transition-colors"
                >
                  I walk dogs — list me
                </a>
                <a
                  href="/feedback"
                  className="inline-flex items-center justify-center px-5 py-2.5 rounded-full bg-white ring-1 ring-warm-300 text-warm-700 text-sm font-semibold hover:bg-warm-100 transition-colors"
                >
                  Tell me when walkers go live
                </a>
              </div>
            </div>
          ) : filtered.length === 0 ? (
            <p className="text-center text-warm-600 py-12">
              No walkers match those filters yet. Try a different area or clear the search.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map((w) => (
                <article
                  key={w.name}
                  className="bg-white rounded-2xl border-2 border-primary-100 p-5 flex flex-col gap-3 hover:border-primary-300 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="text-lg font-bold text-warm-900 leading-tight">{w.name}</h2>
                      <p className="text-xs text-warm-500 mt-0.5">
                        <a
                          href={mapsUrl(w.area)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-primary-700 hover:underline"
                        >
                          {w.area}, Bengaluru
                        </a>
                      </p>
                    </div>
                    <span className="text-xs font-semibold text-accent-700 bg-accent-100 px-2 py-1 rounded-full whitespace-nowrap">
                      Verified
                    </span>
                  </div>

                  <p className="text-sm text-warm-700 leading-snug">{w.blurb}</p>

                  <dl className="text-xs text-warm-600 space-y-1">
                    <div className="flex gap-2">
                      <dt className="font-semibold text-warm-800 shrink-0">Rate:</dt>
                      <dd>{w.rate}</dd>
                    </div>
                    <div className="flex gap-2">
                      <dt className="font-semibold text-warm-800 shrink-0">Hours:</dt>
                      <dd>{w.hours}</dd>
                    </div>
                  </dl>

                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-warm-100 mt-auto">
                    <a
                      href={`tel:${w.phone.replace(/\s/g, '')}`}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11 11 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      Call
                    </a>
                    <ShareButtons
                      name={w.name}
                      url={`/dog-walking#${encodeURIComponent(w.name)}`}
                      context={`Verified dog walker in ${w.area}, Bengaluru`}
                      variant="compact"
                    />
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
