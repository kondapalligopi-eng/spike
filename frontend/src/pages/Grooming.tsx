import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { listGroomingSalons, type GroomingSalonRead } from '@/api/groomingSalons';
import { createSubmission } from '@/api/submissions';
import { toast } from '@/store/toastStore';

// Static (seeded) salons use bespoke area-based slugs hardcoded in
// data/groomingSalons.ts. API-fed salons (admin-added) need a slug derived
// from the *name* — area alone collides when multiple salons share a
// neighbourhood, which would route every click to the static seed. Falls
// back to a UUID prefix on the unlikely case two admin salons share a name.
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

type SalonTile = {
  slug: string;
  name: string;
  area: string;
  city: string;
  address: string;
  tint: string;
  heroEmoji: string;
  image: string;
  avg: number;
  total: number;
};

function apiToTile(s: GroomingSalonRead): SalonTile {
  return {
    slug: nameToSlug(s.name, s.id),
    name: s.name,
    area: s.area,
    city: s.city,
    address: s.address,
    tint: s.tint,
    heroEmoji: s.hero_emoji,
    image: s.image_url ?? '',
    avg: s.rating_avg,
    total: s.rating_count,
  };
}

const BANGALORE_NEIGHBOURHOODS = [
  'Banashankari', 'Banaswadi', 'Basavanagudi', 'Bellandur', 'Bommanahalli',
  'Brookefield', 'BTM Layout', 'CV Raman Nagar', 'Domlur', 'Electronic City',
  'Frazer Town', 'HBR Layout', 'Hebbal', 'Hennur', 'Hoodi', 'Hosur Road',
  'HSR Layout', 'Indiranagar', 'ITPL', 'Jakkur', 'Jalahalli', 'Jayanagar',
  'JP Nagar', 'Kalyan Nagar', 'Kammanahalli', 'Kengeri', 'Koramangala',
  'KR Puram', 'Mahadevapura', 'Malleshwaram', 'Marathahalli', 'MG Road',
  'Nagavara', 'Nagarbhavi', 'Padmanabhanagar', 'Rajajinagar',
  'Rajarajeshwari Nagar', 'Ramamurthy Nagar', 'RT Nagar', 'Sadashivanagar',
  'Sahakara Nagar', 'Sampangi Rama Nagar', 'Sarjapur Road', 'Shivajinagar',
  'Ulsoor', 'Vasanth Nagar', 'Vijayanagar', 'Whitefield', 'Yelahanka',
  'Yeshwantpur',
];

function PawRating({ value, max = 5 }: { value: number; max?: number }) {
  return (
    <div className="inline-flex items-center gap-1.5 text-accent-300 text-xs font-bold">
      <svg aria-hidden="true" className="w-4 h-4" fill="currentColor" viewBox="0 0 32 32">
        <ellipse cx="11" cy="6" rx="2.5" ry="3.3" transform="rotate(-12 11 6)" />
        <ellipse cx="21" cy="6" rx="2.5" ry="3.3" transform="rotate(12 21 6)" />
        <ellipse cx="5" cy="12" rx="2.3" ry="3" transform="rotate(-28 5 12)" />
        <ellipse cx="27" cy="12" rx="2.3" ry="3" transform="rotate(28 27 12)" />
        <path d="M16 13c-5.5 0-9 4-9 8.5 0 1.8 0.8 3.3 2.5 4.3 1.5 0.9 3.5 1.7 6.5 1.7s5-0.8 6.5-1.7c1.7-1 2.5-2.5 2.5-4.3 0-4.5-3.5-8.5-9-8.5z" />
      </svg>
      <span>{value.toFixed(1)}/{max}</span>
    </div>
  );
}

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  onChange: (page: number) => void;
};

function PaginationControls({ currentPage, totalPages, onChange }: PaginationProps) {
  if (totalPages <= 1) return null;
  return (
    <nav aria-label="Pagination" className="flex items-center gap-3">
      <button
        type="button"
        onClick={() => onChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border-2 border-warm-300 bg-white text-warm-700 text-sm font-semibold hover:border-primary-500 hover:text-primary-700 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-warm-300 disabled:hover:text-warm-700 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
        </svg>
        Previous
      </button>
      <span className="text-sm font-semibold text-warm-700">
        Page {currentPage} of {totalPages}
      </span>
      <button
        type="button"
        onClick={() => onChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border-2 border-warm-300 bg-white text-warm-700 text-sm font-semibold hover:border-primary-500 hover:text-primary-700 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-warm-300 disabled:hover:text-warm-700 transition-colors"
      >
        Next
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </nav>
  );
}

export function Grooming() {
  const [query, setQuery] = useState('');
  const [appliedQuery, setAppliedQuery] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [activeCity, setActiveCity] = useState<string | null>(null);

  const salonsQuery = useQuery({
    queryKey: ['grooming-salons'],
    queryFn: listGroomingSalons,
    staleTime: 30_000,
  });
  const allSalons = useMemo<SalonTile[]>(
    () => (salonsQuery.data ?? []).map(apiToTile),
    [salonsQuery.data],
  );
  const SALON_LOCALITIES = useMemo(
    () =>
      Array.from(new Set(allSalons.map((s) => s.area))).sort((a, b) =>
        a.localeCompare(b, undefined, { sensitivity: 'base' }),
      ),
    [allSalons],
  );

  const fetchResults = (e?: React.FormEvent) => {
    e?.preventDefault();
    setAppliedQuery(query.trim());
  };

  const resetFilters = () => {
    setQuery('');
    setAppliedQuery('');
    setLocationFilter('');
    setActiveCity(null);
  };

  const visibleSalons = allSalons
    .filter((s) => {
      if (
        appliedQuery &&
        !`${s.name} ${s.area}`.toLowerCase().includes(appliedQuery.toLowerCase())
      )
        return false;
      if (locationFilter && s.area !== locationFilter) return false;
      if (activeCity && s.area !== activeCity) return false;
      return true;
    })
    .sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));

  const [registerOpen, setRegisterOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: '',
    locality: '',
    address: '',
    services: '',
    hours: '',
    phone: '',
    email: '',
    website: '',
  });

  useEffect(() => {
    if (!registerOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setRegisterOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [registerOpen]);

  const submitSalonListing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.locality || !form.address.trim() || !form.phone.trim()) {
      toast.error('Salon name, locality, address, and phone are required.');
      return;
    }
    setSubmitting(true);
    try {
      await createSubmission('grooming', {
        'Salon name': form.name.trim(),
        Locality: form.locality,
        Address: form.address.trim(),
        'Services offered': form.services.trim() || '(not provided)',
        'Open hours': form.hours.trim() || '(not provided)',
        Phone: form.phone.trim() || '(not provided)',
        Email: form.email.trim() || '(not provided)',
        Website: form.website.trim() || '(not provided)',
      });
      setRegisterOpen(false);
      setForm({ name: '', locality: '', address: '', services: '', hours: '', phone: '', email: '', website: '' });
      toast.success('Thanks! Your salon submission has been received.');
    } catch {
      toast.error('Could not submit right now. Please try again in a moment.');
    } finally {
      setSubmitting(false);
    }
  };

  const PAGE_SIZE = 8;
  const [currentPage, setCurrentPage] = useState(1);
  useEffect(() => {
    setCurrentPage(1);
  }, [appliedQuery, locationFilter, activeCity]);
  const totalPages = Math.max(1, Math.ceil(visibleSalons.length / PAGE_SIZE));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const pagedSalons = visibleSalons.slice(
    (safeCurrentPage - 1) * PAGE_SIZE,
    safeCurrentPage * PAGE_SIZE,
  );

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
          <span aria-hidden="true" className="text-4xl sm:text-5xl drop-shadow">✂️</span>
          <div className="flex-1">
            <p className="text-[11px] sm:text-xs font-semibold tracking-[0.3em] text-accent-400 uppercase mb-1">
              Salons · Bangalore
            </p>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight">
              Best Dog Grooming Salons in Bangalore
            </h1>
            <div className="mt-2 h-0.5 w-16 bg-accent-400 rounded-full" />
            <p className="mt-2 text-sm text-primary-100/90 max-w-2xl">
              Bath, blow-dry, breed-specific styling, and walk-in touch-ups — Indiranagar, Koramangala, HSR Layout, Whitefield, and more.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setRegisterOpen(true)}
            className="self-start md:self-auto inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-accent-400 hover:bg-accent-300 text-warm-900 text-sm font-bold tracking-[0.15em] uppercase ring-2 ring-accent-300/50 hover:ring-accent-200 transition-all shadow-md"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            List Your Salon
          </button>
        </div>
      </section>

      <section className="border-b border-warm-200 bg-primary-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <form onSubmit={fetchResults} className="flex flex-wrap items-center gap-2 lg:gap-3">
            <label className="flex items-center gap-2 px-3 py-2 border-2 border-warm-400 rounded-md bg-white flex-1 w-full sm:w-auto sm:min-w-[200px] cursor-text">
              <svg aria-hidden="true" className="w-4 h-4 text-warm-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z" />
              </svg>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search salon"
                className="w-full text-sm outline-none bg-transparent placeholder:text-warm-400"
              />
            </label>

            <label className="flex items-center gap-2 px-3 py-2 border-2 border-warm-400 rounded-md bg-white w-full sm:w-auto sm:min-w-[200px] cursor-pointer">
              <svg aria-hidden="true" className="w-4 h-4 text-warm-500 pointer-events-none shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <select
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className={`w-full text-sm outline-none bg-transparent cursor-pointer ${locationFilter ? 'text-warm-700' : 'text-warm-400'}`}
              >
                <option value="">All Locations</option>
                {SALON_LOCALITIES.map((l) => (
                  <option key={l} value={l} className="text-warm-900">
                    {l}
                  </option>
                ))}
              </select>
            </label>

            <button
              type="submit"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-accent-400 hover:bg-accent-300 text-warm-900 text-sm font-bold tracking-[0.15em] uppercase ring-2 ring-accent-300/50 hover:ring-accent-200 transition-all shadow-md"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z" />
              </svg>
              Search
            </button>

            <button
              type="button"
              onClick={resetFilters}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full border-2 border-warm-400 bg-white hover:border-primary-500 hover:text-primary-700 text-warm-700 text-sm font-bold tracking-[0.15em] uppercase transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Clear
            </button>
          </form>
        </div>
      </section>

      <section className="bg-primary-100 border-b border-warm-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-wrap justify-center gap-3">
            {SALON_LOCALITIES.map((city) => {
              const active = activeCity === city;
              return (
                <button
                  key={city}
                  type="button"
                  onClick={() => setActiveCity(active ? null : city)}
                  className={`px-5 py-1.5 rounded-full border text-sm font-medium transition-colors ${
                    active
                      ? 'bg-primary-700 text-white border-primary-700'
                      : 'bg-white text-primary-700 border-warm-300 hover:border-primary-600 hover:text-primary-800'
                  }`}
                >
                  {city}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <div className="bg-primary-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          {salonsQuery.isLoading && allSalons.length === 0 ? (
            <div className="max-w-md mx-auto text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary-100 flex items-center justify-center text-3xl animate-pulse">
                🐾
              </div>
              <h3 className="text-lg font-bold text-warm-900 mb-2">Loading salons…</h3>
              <p className="text-sm text-warm-600">
                Waking up our directory. This can take a few seconds on the first visit.
              </p>
            </div>
          ) : visibleSalons.length === 0 ? (
            <div className="max-w-md mx-auto text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-warm-100 flex items-center justify-center text-3xl">
                🐾
              </div>
              <h3 className="text-lg font-bold text-warm-900 mb-2">
                No salons match your filters
              </h3>
              <p className="text-sm text-warm-600 mb-6">
                Try a different area or search term — or clear the filters to see every salon we list.
              </p>
              <button
                type="button"
                onClick={resetFilters}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-accent-400 hover:bg-accent-300 text-warm-900 text-sm font-bold tracking-[0.15em] uppercase ring-2 ring-accent-300/50 hover:ring-accent-200 transition-all shadow-md"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
                <span className="inline-flex items-center gap-2 self-start px-4 py-1.5 rounded-full bg-accent-100 ring-1 ring-accent-300 text-sm shadow-sm">
                  <span className="text-base font-extrabold text-accent-700">{visibleSalons.length}</span>
                  <span className="text-warm-800 font-semibold">
                    {visibleSalons.length === 1 ? 'salon' : 'salons'} found
                  </span>
                </span>
                <PaginationControls
                  currentPage={safeCurrentPage}
                  totalPages={totalPages}
                  onChange={setCurrentPage}
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 auto-rows-fr gap-3 sm:gap-4">
                {pagedSalons.map((salon) => (
                  <Link
                    key={salon.slug + salon.name}
                    to={`/grooming/${salon.slug}`}
                    className="rounded-md overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow group cursor-pointer flex flex-col"
                  >
                    <div className={`relative aspect-square bg-gradient-to-br ${salon.tint} flex items-center justify-center`}>
                      {salon.image ? (
                        <img
                          src={salon.image}
                          alt={salon.name}
                          loading="lazy"
                          className="absolute inset-0 w-full h-full object-cover"
                          onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                        />
                      ) : (
                        <span className="text-6xl drop-shadow-sm">{salon.heroEmoji}🐕</span>
                      )}
                      <div className="absolute left-3 bottom-3 w-12 h-12 rounded-full bg-red-600 text-white flex flex-col items-center justify-center text-center shadow-md border-2 border-white z-10">
                        <span className="text-[7px] font-bold leading-tight tracking-wider">GROOM</span>
                        <span className="text-base leading-none my-0.5">✂️</span>
                        <span className="text-[7px] font-bold leading-tight tracking-wider">SALON</span>
                      </div>
                    </div>
                    <div className="bg-primary-600 group-hover:bg-primary-700 transition-colors p-3 sm:p-4 text-white flex-1">
                      <h3 className="font-extrabold text-sm sm:text-base leading-tight mb-1">
                        {salon.name}
                      </h3>
                      <div className="text-[11px] mb-1 flex items-center gap-2">
                        <PawRating value={salon.avg} />
                      </div>
                      <p className="text-[11px] text-white/90 font-medium leading-tight">
                        {salon.area}, {salon.city}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>

              <div className="mt-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <span className="inline-flex items-center gap-2 self-start px-4 py-1.5 rounded-full bg-accent-100 ring-1 ring-accent-300 text-sm shadow-sm">
                  <span className="text-base font-extrabold text-accent-700">{visibleSalons.length}</span>
                  <span className="text-warm-800 font-semibold">
                    {visibleSalons.length === 1 ? 'salon' : 'salons'} found
                  </span>
                </span>
                <PaginationControls
                  currentPage={safeCurrentPage}
                  totalPages={totalPages}
                  onChange={setCurrentPage}
                />
              </div>
            </>
          )}
        </div>
      </div>

      {registerOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="register-salon-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          onClick={() => setRegisterOpen(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 sm:p-8">
              <div className="flex items-start justify-between gap-4 mb-1">
                <div>
                  <p className="text-[11px] font-semibold tracking-[0.3em] text-accent-600 uppercase mb-1">
                    Salons · Bangalore
                  </p>
                  <h2 id="register-salon-title" className="text-2xl font-extrabold text-warm-900">
                    List your salon
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setRegisterOpen(false)}
                  aria-label="Close"
                  className="p-2 rounded-full text-warm-700 hover:text-warm-900 hover:bg-warm-100 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.25} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="h-0.5 w-12 bg-accent-400 rounded-full mb-5" />
              <p className="text-sm text-warm-600 mb-6">
                Tell us about your dog grooming salon and we'll review and add it to the HiSpike directory.
              </p>

              <form onSubmit={submitSalonListing} className="space-y-4">
                <label className="block">
                  <span className="block text-sm font-semibold text-warm-900 mb-1">Salon name <span className="text-red-500">*</span></span>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. Bengaluru Pet Grooming Studio"
                    className="w-full px-3 py-2 border-2 border-warm-300 rounded-md text-sm outline-none focus:border-primary-500 transition-colors"
                  />
                </label>

                <label className="block">
                  <span className="block text-sm font-semibold text-warm-900 mb-1">Locality <span className="text-red-500">*</span></span>
                  <select
                    required
                    value={form.locality}
                    onChange={(e) => setForm({ ...form, locality: e.target.value })}
                    className={`w-full px-3 py-2 border-2 border-warm-300 rounded-md text-sm outline-none focus:border-primary-500 transition-colors bg-white ${
                      form.locality ? 'text-warm-900' : 'text-warm-400'
                    }`}
                  >
                    <option value="" disabled>
                      Please select a locality
                    </option>
                    {BANGALORE_NEIGHBOURHOODS.map((n) => (
                      <option key={n} value={n} className="text-warm-900">
                        {n}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className="block text-sm font-semibold text-warm-900 mb-1">Full address <span className="text-red-500">*</span></span>
                  <textarea
                    required
                    rows={2}
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                    placeholder="Street, area, city, PIN"
                    className="w-full px-3 py-2 border-2 border-warm-300 rounded-md text-sm outline-none focus:border-primary-500 transition-colors resize-y"
                  />
                </label>

                <label className="block">
                  <span className="block text-sm font-semibold text-warm-900 mb-1">Services offered</span>
                  <input
                    type="text"
                    value={form.services}
                    onChange={(e) => setForm({ ...form, services: e.target.value })}
                    placeholder="Bath, blow-dry, breed cut, nail trim, de-shed"
                    className="w-full px-3 py-2 border-2 border-warm-300 rounded-md text-sm outline-none focus:border-primary-500 transition-colors"
                  />
                  <span className="block text-xs text-warm-500 mt-1">
                    Comma-separated list
                  </span>
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <label className="block">
                    <span className="block text-sm font-semibold text-warm-900 mb-1">Open hours</span>
                    <input
                      type="text"
                      value={form.hours}
                      onChange={(e) => setForm({ ...form, hours: e.target.value })}
                      placeholder="e.g. 8 am to 8 pm"
                      className="w-full px-3 py-2 border-2 border-warm-300 rounded-md text-sm outline-none focus:border-primary-500 transition-colors"
                    />
                  </label>

                  <label className="block">
                    <span className="block text-sm font-semibold text-warm-900 mb-1">Phone <span className="text-red-500">*</span></span>
                    <input
                      type="tel"
                      required
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder="+91 80 ..."
                      className="w-full px-3 py-2 border-2 border-warm-300 rounded-md text-sm outline-none focus:border-primary-500 transition-colors"
                    />
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <label className="block">
                    <span className="block text-sm font-semibold text-warm-900 mb-1">Email</span>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="salon@example.com"
                      className="w-full px-3 py-2 border-2 border-warm-300 rounded-md text-sm outline-none focus:border-primary-500 transition-colors"
                    />
                  </label>

                  <label className="block">
                    <span className="block text-sm font-semibold text-warm-900 mb-1">Website</span>
                    <input
                      type="url"
                      value={form.website}
                      onChange={(e) => setForm({ ...form, website: e.target.value })}
                      placeholder="https://..."
                      className="w-full px-3 py-2 border-2 border-warm-300 rounded-md text-sm outline-none focus:border-primary-500 transition-colors"
                    />
                  </label>
                </div>

                <div className="pt-2 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setRegisterOpen(false)}
                    className="px-5 py-2 rounded-full border-2 border-warm-300 text-warm-700 hover:bg-warm-100 text-sm font-semibold transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-accent-400 hover:bg-accent-300 disabled:opacity-60 disabled:cursor-not-allowed text-warm-900 text-sm font-bold tracking-[0.15em] uppercase ring-2 ring-accent-300/50 hover:ring-accent-200 transition-all shadow-md"
                  >
                    {submitting ? 'Submitting…' : 'Submit for review'}
                  </button>
                </div>
              </form>
              <p className="text-xs text-warm-500 text-center mt-5">
                Issues with the form? Email{' '}
                <a className="text-primary-700 font-semibold hover:underline" href="mailto:support@hispike.in">
                  support@hispike.in
                </a>
                .
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
