import { useMemo, useState } from 'react';
import { PageHead } from '@/components/PageHead';
import { FaqSchema, type FaqItem } from '@/components/FaqSchema';
import { HeroPaws } from '@/components/HeroPaws';
import { ShareButtons } from '@/components/ShareButtons';

// Seed listings for the launch directory. Real walkers replace these as
// they apply via /feedback. Kept inline (no backend table yet) so the
// page ships immediately — when real signups arrive we promote this list
// into a dog_walkers table mirroring grooming_salons.

type Walker = {
  name: string;
  area: string;
  rate: string;
  phone: string;
  hours: string;
  blurb: string;
};

const WALKERS: Walker[] = [
  {
    name: 'Pawfect Strides',
    area: 'Indiranagar',
    rate: '₹350 / 30 min walk',
    phone: '+91 80 4567 1100',
    hours: '6 am – 9 am, 5 pm – 8 pm',
    blurb: 'Small-group leash walks with breed-aware pacing. Familiar with apartments around 100 Feet Road.',
  },
  {
    name: 'WagOnTheGo',
    area: 'Koramangala',
    rate: '₹300 / 30 min walk',
    phone: '+91 80 4811 9200',
    hours: '6 am – 10 am, 4 pm – 9 pm',
    blurb: 'Solo and pair walks across 4th and 5th Block. Daily slots and weekend top-ups available.',
  },
  {
    name: 'Happy Tails Walkers',
    area: 'HSR Layout',
    rate: '₹400 / 30 min walk',
    phone: '+91 80 4321 5566',
    hours: '6 am – 10 am, 5 pm – 9 pm',
    blurb: 'Trained walkers comfortable with high-energy breeds — Labradors, Retrievers, Huskies.',
  },
  {
    name: 'Bengaluru Bark Walkers',
    area: 'Whitefield',
    rate: '₹350 / 30 min walk',
    phone: '+91 80 4900 4422',
    hours: '6 am – 9 am, 5 pm – 8 pm',
    blurb: 'Group walks along Pattandur Agrahara green strip. Pickup/drop from ITPL-area apartments.',
  },
  {
    name: 'Sniff & Stride',
    area: 'Jayanagar',
    rate: '₹275 / 30 min walk',
    phone: '+91 80 4233 7711',
    hours: '6 am – 9 am, 5 pm – 8 pm',
    blurb: 'Senior-dog friendly. Slow-pace decompression walks around 4th Block parks.',
  },
  {
    name: 'Pawsome Walks',
    area: 'Sarjapur Road',
    rate: '₹400 / 30 min walk',
    phone: '+91 80 4500 6688',
    hours: '6 am – 10 am, 5 pm – 9 pm',
    blurb: 'Reactive-dog handling, muzzle-trained walkers, one-on-one slots only.',
  },
  {
    name: 'Tail Trotters',
    area: 'Bellandur',
    rate: '₹350 / 30 min walk',
    phone: '+91 80 4677 2299',
    hours: '6 am – 10 am, 4 pm – 8 pm',
    blurb: 'Lake-side walks around Bellandur and Yemalur. GPS-tracked routes shared after each walk.',
  },
  {
    name: 'Urban Pups Walkers',
    area: 'Domlur',
    rate: '₹325 / 30 min walk',
    phone: '+91 80 4955 3344',
    hours: '6 am – 9 am, 5 pm – 8 pm',
    blurb: 'CBD-area walkers covering Domlur, Diamond District, and Old Airport Road.',
  },
];

const AREAS = ['All areas', ...Array.from(new Set(WALKERS.map((w) => w.area))).sort()];

const DOG_WALKING_FAQS: FaqItem[] = [
  {
    q: 'How much do dog walkers charge in Bengaluru?',
    a: 'Most verified walkers on HiSpike charge between ₹275 and ₹400 for a 30-minute walk. Rates vary by area, group vs. solo walks, and whether the walker handles reactive or special-needs dogs.',
  },
  {
    q: 'How do I book a dog walker on HiSpike?',
    a: 'Each listing has a "Call" button — ring the walker directly to confirm timings, your dog\'s breed and temperament, and the pickup point. Most walkers in our directory respond same-day.',
  },
  {
    q: 'Are HiSpike dog walkers verified?',
    a: 'Yes. Every walking service listed has been checked by HiSpike — references confirmed, areas of operation verified, and complaints history reviewed before going live. We don\'t run paid placements.',
  },
  {
    q: 'What if my dog is reactive or needs special handling?',
    a: 'Several listed walkers explicitly handle reactive, senior, or special-needs dogs (look for it in the listing blurb). Always call ahead to discuss your dog\'s temperament and any meds, equipment, or muzzle requirements before booking.',
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

  return (
    <div className="flex flex-col">
      <PageHead
        title="Dog Walkers in Bengaluru — Verified, Hyperlocal"
        description="Find vetted dog walkers across Bengaluru — Indiranagar, Koramangala, HSR Layout, Whitefield, Jayanagar, Sarjapur Road, Bellandur, Domlur. Honest rates, real reviews, no paid placements."
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
              Verified, hyperlocal dog walkers across Indiranagar, Koramangala, HSR Layout, Whitefield, Jayanagar, Sarjapur Road, Bellandur, and Domlur.
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

      <section className="py-10 bg-primary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {filtered.length === 0 ? (
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
                      url={`https://hispike.in/dog-walking#${encodeURIComponent(w.name)}`}
                      title={`${w.name} — verified dog walker in ${w.area}, Bengaluru`}
                      compact
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
