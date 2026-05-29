import { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getSalon, type GroomingSalonData } from '@/data/groomingSalons';
import { listGroomingSalons, type GroomingSalonRead } from '@/api/groomingSalons';

function Stars({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-0.5 text-sm">
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className={i < value ? 'text-accent-500' : 'text-warm-300'}>
          ★
        </span>
      ))}
    </div>
  );
}

// Default single-line hours used when the admin didn't enter anything for
// an API-fed salon (or for any static seed missing the field).
const DEFAULT_HOURS_FALLBACK = '8 am to 8 pm, daily';

function areaToSlug(area: string): string {
  return area.toLowerCase().trim().replace(/\s+/g, '-');
}

// Mirrors Grooming.tsx::nameToSlug so a list-page tile's slug round-trips
// to a matching detail-page lookup.
function nameToSlug(name: string, id?: string): string {
  const base = name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
  if (!base) return id ? id.slice(0, 8) : 'salon';
  return base;
}

function apiToSalonData(api: GroomingSalonRead): GroomingSalonData {
  // Synthesize a rating distribution that produces the stored avg/count.
  // We put rating_count at the floor of rating_avg (rounded) and zero
  // elsewhere — the totals match, the page just doesn't show a histogram.
  const roundedStar = Math.max(1, Math.min(5, Math.round(api.rating_avg)));
  const ratingDistribution = [5, 4, 3, 2, 1].map((stars) => ({
    stars,
    count: stars === roundedStar ? api.rating_count : 0,
  }));
  return {
    slug: areaToSlug(api.area),
    name: api.name,
    area: api.area,
    city: api.city,
    state: api.state,
    address: api.address,
    phone: api.phone,
    email: api.email ?? undefined,
    website: api.website ?? undefined,
    ratingAvg: api.rating_avg,
    openTodayUntil: '8pm',
    hours: api.hours ?? DEFAULT_HOURS_FALLBACK,
    mapLabel: [api.area.toUpperCase()],
    tint: api.tint,
    heroEmoji: api.hero_emoji,
    services: [],
    ratingDistribution,
    reviews: [],
  };
}

export function GroomingSalon() {
  const { slug } = useParams<{ slug: string }>();

  // Fetch admin-added salons; we'll fall through to this list if the slug
  // doesn't match the static data file.
  const apiQuery = useQuery({
    queryKey: ['grooming-salons'],
    queryFn: listGroomingSalons,
    staleTime: 30_000,
  });

  const salon = useMemo<GroomingSalonData | undefined>(() => {
    if (!slug) return undefined;
    // Look up the API list first so an admin-added salon whose name-slug
    // happens to clash with a static area-slug still resolves to the
    // admin's record (e.g. /grooming/whitefield used to always win the
    // static "Furry Tale Grooming" even when an admin added a different
    // Whitefield salon).
    const apiByName = apiQuery.data?.find((s) => nameToSlug(s.name, s.id) === slug);
    if (apiByName) return apiToSalonData(apiByName);
    const fromStatic = getSalon(slug);
    if (fromStatic) return fromStatic;
    // Legacy fallback: very old slugs that used area-only.
    const apiByArea = apiQuery.data?.find((s) => areaToSlug(s.area) === slug);
    return apiByArea ? apiToSalonData(apiByArea) : undefined;
  }, [slug, apiQuery.data]);

  if (apiQuery.isLoading && !salon) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center text-warm-500">
        Loading salon…
      </div>
    );
  }

  if (!salon) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-warm-900 mb-3">Salon not found</h1>
        <p className="text-warm-600 mb-6">
          We couldn't find a grooming salon at that location.
        </p>
        <Link
          to="/grooming"
          className="inline-block px-5 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-md transition-colors"
        >
          See all salons
        </Link>
      </div>
    );
  }

  const totalReviews = salon.ratingDistribution.reduce((sum, r) => sum + r.count, 0);
  const avgRating = totalReviews
    ? (
        salon.ratingDistribution.reduce((sum, r) => sum + r.stars * r.count, 0) / totalReviews
      ).toFixed(1)
    : '0.0';

  return (
    <div className="bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Back to results */}
        <Link
          to="/grooming"
          className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full bg-white border-2 border-warm-300 text-warm-700 text-sm font-semibold hover:border-primary-500 hover:text-primary-700 hover:shadow-sm transition-all"
        >
          <svg aria-hidden="true" className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
          Back to results
        </Link>

        {/* Title row — matches Park/Swimming detail-view styling */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-6">
          <div>
            <p className="text-[11px] font-semibold tracking-[0.3em] text-accent-600 uppercase mb-1">
              Salons · {salon.city}
            </p>
            <h1 className="text-2xl sm:text-3xl font-bold text-warm-900 leading-tight">
              {salon.name}
            </h1>
            <p className="text-sm text-warm-500 mt-1">📍 {salon.area}, {salon.city}</p>
          </div>
          <div className="inline-flex items-center gap-2 self-start px-3 py-1.5 rounded-full bg-accent-50 ring-1 ring-accent-300 text-accent-700 text-sm font-bold shrink-0">
            <Stars value={Math.round(Number(avgRating))} />
            <span>{avgRating}</span>
            <span className="text-warm-500 font-normal">· {totalReviews} reviews</span>
          </div>
        </div>

        {/* Two-column: branded info card + live Google Maps */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
          <div className="rounded-2xl border-2 border-primary-100 bg-white shadow-sm overflow-hidden flex flex-col">
            <div className="flex items-start gap-4 px-5 py-4 border-b border-primary-100">
              <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-lg font-bold shrink-0">📍</div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold tracking-[0.2em] text-primary-700 uppercase mb-0.5">Address</p>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${salon.name}, ${salon.address}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-warm-800 hover:text-primary-700 hover:underline transition-colors"
                >
                  {salon.address}
                </a>
              </div>
            </div>

            <div className="flex items-start gap-4 px-5 py-4 border-b border-primary-100">
              <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-lg font-bold shrink-0">📞</div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold tracking-[0.2em] text-primary-700 uppercase mb-0.5">Phone</p>
                <a
                  href={`tel:${salon.phone.replace(/\s+/g, '')}`}
                  className="text-sm text-warm-800 hover:text-primary-700 transition-colors"
                >
                  {salon.phone}
                </a>
              </div>
            </div>

            {salon.email && (
              <div className="flex items-start gap-4 px-5 py-4 border-b border-primary-100">
                <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-lg font-bold shrink-0">✉️</div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold tracking-[0.2em] text-primary-700 uppercase mb-0.5">Email</p>
                  <a
                    href={`mailto:${salon.email}`}
                    className="text-sm text-warm-800 hover:text-primary-700 transition-colors break-all"
                  >
                    {salon.email}
                  </a>
                </div>
              </div>
            )}

            {salon.website && (
              <div className="flex items-start gap-4 px-5 py-4 border-b border-primary-100">
                <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-lg font-bold shrink-0">🌐</div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold tracking-[0.2em] text-primary-700 uppercase mb-0.5">Website</p>
                  <a
                    href={salon.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-warm-800 hover:text-primary-700 hover:underline transition-colors break-all"
                  >
                    {salon.website}
                  </a>
                </div>
              </div>
            )}

            <div className="flex items-start gap-4 px-5 py-4 flex-1">
              <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-lg font-bold shrink-0">🕐</div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold tracking-[0.2em] text-primary-700 uppercase mb-0.5">Open Hours</p>
                <p className="text-sm text-warm-800">{salon.hours}</p>
              </div>
            </div>

            <div className="px-5 py-4 bg-primary-50 border-t border-primary-100">
              <button
                type="button"
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-accent-400 hover:bg-accent-300 text-warm-900 text-sm font-bold tracking-[0.15em] uppercase ring-2 ring-accent-300/50 hover:ring-accent-200 transition-all shadow-md"
              >
                Book now
              </button>
            </div>
          </div>

          <div className="rounded-2xl border-2 border-primary-100 overflow-hidden">
            <div className="relative aspect-[4/3] bg-warm-100 min-h-[300px]">
              <iframe
                title={`Map of ${salon.name}`}
                src={`https://www.google.com/maps?q=${encodeURIComponent(`${salon.name}, ${salon.address}`)}&output=embed`}
                className="absolute inset-0 w-full h-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${salon.name}, ${salon.address}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute top-3 right-3 px-3 py-1.5 bg-warm-900/90 hover:bg-warm-900 text-white text-xs font-semibold rounded-md"
              >
                Open in Maps
              </a>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
