import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { listSwimSchools, type SwimSchoolRead } from '@/api/swimSchools';
import { createSubmission } from '@/api/submissions';
import { toast } from '@/store/toastStore';
import { PageHead } from '@/components/PageHead';
import { ShareButtons } from '@/components/ShareButtons';

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

type SwimSpot = {
  name: string;
  locality: string;
  rating: number;
  image: string;
  address: string;
  hours: string;
  cost: string;
  poolType: string;
  phone: string;
  email: string;
  website: string;
  highlights: string[];
};

// Swim schools now live in the database — see backend/scripts/seed_swim_schools.py
// for the seed data and frontend/src/api/swimSchools.ts for the local mock store.

function apiToSpot(s: SwimSchoolRead): SwimSpot {
  return {
    name: s.name,
    locality: s.locality,
    rating: s.rating,
    image: s.image_url ?? '',
    address: s.address,
    hours: s.hours ?? '',
    cost: s.cost ?? '',
    poolType: s.pool_type ?? '',
    phone: s.phone ?? '',
    email: s.email ?? '',
    website: s.website ?? '',
    highlights: s.highlights ?? [],
  };
}


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
      <span>{value}/{max}</span>
    </div>
  );
}

function PawRatingDark({ value, max = 5 }: { value: number; max?: number }) {
  return (
    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-accent-50 ring-1 ring-accent-300 text-accent-700 text-sm font-bold">
      <svg aria-hidden="true" className="w-4 h-4" fill="currentColor" viewBox="0 0 32 32">
        <ellipse cx="11" cy="6" rx="2.5" ry="3.3" transform="rotate(-12 11 6)" />
        <ellipse cx="21" cy="6" rx="2.5" ry="3.3" transform="rotate(12 21 6)" />
        <ellipse cx="5" cy="12" rx="2.3" ry="3" transform="rotate(-28 5 12)" />
        <ellipse cx="27" cy="12" rx="2.3" ry="3" transform="rotate(28 27 12)" />
        <path d="M16 13c-5.5 0-9 4-9 8.5 0 1.8 0.8 3.3 2.5 4.3 1.5 0.9 3.5 1.7 6.5 1.7s5-0.8 6.5-1.7c1.7-1 2.5-2.5 2.5-4.3 0-4.5-3.5-8.5-9-8.5z" />
      </svg>
      <span>{value}/{max}</span>
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

export function Swimming() {
  const [query, setQuery] = useState('');
  const [appliedQuery, setAppliedQuery] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [activeCity, setActiveCity] = useState<string | null>(null);
  const [selectedSpot, setSelectedSpot] = useState<SwimSpot | null>(null);

  const swimSchoolsQuery = useQuery({
    queryKey: ['swim-schools'],
    queryFn: listSwimSchools,
    staleTime: 30_000,
  });
  const allSpots = useMemo<SwimSpot[]>(
    () => (swimSchoolsQuery.data ?? []).map(apiToSpot),
    [swimSchoolsQuery.data],
  );
  const POOL_LOCALITIES = useMemo(
    () =>
      Array.from(new Set(allSpots.map((s) => s.locality.split(',')[0].trim()))).sort(
        (a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }),
      ),
    [allSpots],
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

  const [registerOpen, setRegisterOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: '',
    locality: '',
    address: '',
    poolType: '',
    hours: '',
    cost: '',
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

  const submitSwimListing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.locality || !form.address.trim() || !form.phone.trim()) {
      toast.error('Swim school name, locality, address, and phone are required.');
      return;
    }
    setSubmitting(true);
    try {
      await createSubmission('swimming', {
        'Swim school name': form.name.trim(),
        Locality: form.locality,
        Address: form.address.trim(),
        'Pool type': form.poolType.trim() || '(not provided)',
        'Open hours': form.hours.trim() || '(not provided)',
        Cost: form.cost.trim() || '(not provided)',
        Phone: form.phone.trim(),
        Email: form.email.trim() || '(not provided)',
        Website: form.website.trim() || '(not provided)',
      });
      setRegisterOpen(false);
      setForm({ name: '', locality: '', address: '', poolType: '', hours: '', cost: '', phone: '', email: '', website: '' });
      toast.success('Thanks! Your swim school submission has been received.');
    } catch {
      toast.error('Could not submit right now. Please try again in a moment.');
    } finally {
      setSubmitting(false);
    }
  };

  const visibleSpots = allSpots
    .filter((s) => {
      if (
        appliedQuery &&
        !`${s.name} ${s.locality}`.toLowerCase().includes(appliedQuery.toLowerCase())
      )
        return false;
      const area = s.locality.split(',')[0].trim();
      if (locationFilter && area !== locationFilter) return false;
      if (activeCity && area !== activeCity) return false;
      return true;
    })
    .sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));

  const PAGE_SIZE = 8;
  const [currentPage, setCurrentPage] = useState(1);
  useEffect(() => {
    setCurrentPage(1);
  }, [appliedQuery, locationFilter, activeCity]);
  const totalPages = Math.max(1, Math.ceil(visibleSpots.length / PAGE_SIZE));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const pagedSpots = visibleSpots.slice(
    (safeCurrentPage - 1) * PAGE_SIZE,
    safeCurrentPage * PAGE_SIZE,
  );

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [selectedSpot]);

  return (
    <div className="bg-white">
      <PageHead
        title="Dog Swimming Lessons & Pools in Bengaluru"
        description="Heated dog swim pools and certified canine swim coaches across Bengaluru — Indiranagar, Whitefield, HSR Layout, Sarjapur, Koramangala. Hydrotherapy, swim safety, and small-batch sessions for all breeds."
        path="/swimming"
      />
      {!selectedSpot && (
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
            <span aria-hidden="true" className="text-4xl sm:text-5xl drop-shadow">🐕💦</span>
            <div className="flex-1">
              <p className="text-[11px] sm:text-xs font-semibold tracking-[0.3em] text-accent-400 uppercase mb-1">
                Aquatic · Bangalore
              </p>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight">
                Best Dog Swim Schools in Bangalore
              </h1>
              <div className="mt-2 h-0.5 w-16 bg-accent-400 rounded-full" />
              <p className="mt-2 text-sm text-primary-100/90 max-w-2xl">
                Heated pools, certified canine swim coaches, and water-safety classes — Indiranagar, Whitefield, HSR Layout, Sarjapur Road, Koramangala, and Domlur.
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
              List Your Swim School
            </button>
          </div>
        </section>
      )}

      {!selectedSpot && (
        <>
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
                    placeholder="Search swim school"
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
                    {POOL_LOCALITIES.map((l) => (
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

        </>
      )}

      <div className={`${!selectedSpot ? 'bg-primary-50' : ''}`}>
      <div className={`max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-1 gap-8 ${selectedSpot ? 'lg:grid-cols-[1fr_280px]' : ''}`}>
        <div>
          {selectedSpot ? (
            <>
              <button
                type="button"
                onClick={() => setSelectedSpot(null)}
                className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full bg-white border-2 border-warm-300 text-warm-700 text-sm font-semibold hover:border-primary-500 hover:text-primary-700 hover:shadow-sm transition-all"
              >
                <svg aria-hidden="true" className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                </svg>
                Back to results
              </button>

              <div className="flex items-start justify-between mb-4 gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-warm-900">{selectedSpot.name}</h2>
                  <p className="text-sm text-warm-500 mt-1">📍 {selectedSpot.locality}</p>
                </div>
                <PawRatingDark value={selectedSpot.rating} />
              </div>

              <div className="mb-6">
                <ShareButtons
                  name={selectedSpot.name}
                  url="/swimming"
                  context={selectedSpot.locality}
                />
              </div>

              <div className="rounded-2xl border-2 border-primary-100 bg-white shadow-sm mb-8 overflow-hidden">
                {[
                  { icon: '📍', label: 'Address', value: selectedSpot.address, link: true },
                  { icon: '🕐', label: 'Open Times', value: selectedSpot.hours },
                  { icon: '₹', label: 'Cost', value: selectedSpot.cost },
                  { icon: '🌊', label: 'Pool Type', value: selectedSpot.poolType },
                  { icon: '📞', label: 'Phone', value: selectedSpot.phone },
                  { icon: '✉️', label: 'Email', value: selectedSpot.email },
                  { icon: '🌐', label: 'Website', value: selectedSpot.website },
                ].filter((row) => row.value).map((row, idx, arr) => (
                  <div
                    key={row.label}
                    className={`flex items-start gap-4 px-5 py-4 ${idx < arr.length - 1 ? 'border-b border-primary-100' : ''}`}
                  >
                    <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-lg font-bold shrink-0">
                      {row.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold tracking-[0.2em] text-primary-700 uppercase mb-0.5">
                        {row.label}
                      </p>
                      {row.link ? (
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(row.value)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-warm-800 hover:text-primary-700 hover:underline transition-colors"
                        >
                          {row.value}
                        </a>
                      ) : (
                        <p className="text-sm text-warm-800">{row.value}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <ul className="space-y-3 mb-10">
                {selectedSpot.highlights.map((h) => (
                  <li key={h} className="flex items-start gap-3 text-warm-800">
                    <svg aria-hidden="true" className="mt-1 w-4 h-4 text-accent-500 shrink-0" fill="currentColor" viewBox="0 0 32 32">
                      <ellipse cx="11" cy="6" rx="2.5" ry="3.3" transform="rotate(-12 11 6)" />
                      <ellipse cx="21" cy="6" rx="2.5" ry="3.3" transform="rotate(12 21 6)" />
                      <ellipse cx="5" cy="12" rx="2.3" ry="3" transform="rotate(-28 5 12)" />
                      <ellipse cx="27" cy="12" rx="2.3" ry="3" transform="rotate(28 27 12)" />
                      <path d="M16 13c-5.5 0-9 4-9 8.5 0 1.8 0.8 3.3 2.5 4.3 1.5 0.9 3.5 1.7 6.5 1.7s5-0.8 6.5-1.7c1.7-1 2.5-2.5 2.5-4.3 0-4.5-3.5-8.5-9-8.5z" />
                    </svg>
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <>
          {swimSchoolsQuery.isLoading && allSpots.length === 0 ? (
            <div className="max-w-md mx-auto text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary-100 flex items-center justify-center text-3xl animate-pulse">
                🐾
              </div>
              <h3 className="text-lg font-bold text-warm-900 mb-2">Loading swim schools…</h3>
              <p className="text-sm text-warm-600">
                Waking up our directory. This can take a few seconds on the first visit.
              </p>
            </div>
          ) : visibleSpots.length === 0 ? (
            <div className="max-w-md mx-auto text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-warm-100 flex items-center justify-center text-3xl">
                🐾
              </div>
              <h3 className="text-lg font-bold text-warm-900 mb-2">
                No swim schools match your filters
              </h3>
              <p className="text-sm text-warm-600 mb-6">
                Try a different area or search term — or clear the filters to see every swim school we list.
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
              <span className="text-base font-extrabold text-accent-700">{visibleSpots.length}</span>
              <span className="text-warm-800 font-semibold">
                {visibleSpots.length === 1 ? 'swim school' : 'swim schools'} found
              </span>
            </span>
            <PaginationControls
              currentPage={safeCurrentPage}
              totalPages={totalPages}
              onChange={setCurrentPage}
            />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 auto-rows-fr gap-3 sm:gap-4">
            {pagedSpots.map((spot) => (
              <article
                key={spot.name}
                onClick={() => setSelectedSpot(spot)}
                className="rounded-md overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow group cursor-pointer flex flex-col"
              >
                <div className="relative aspect-square bg-warm-200">
                  <img
                    src={spot.image}
                    alt={spot.name}
                    className="absolute inset-0 w-full h-full object-cover"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.display = 'none';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-br from-sky-300 to-primary-600 flex items-center justify-center text-6xl opacity-0 [&:has(+img[style*='display: none'])]:opacity-100">
                    🏊🐕
                  </div>
                </div>
                <div className="bg-primary-600 group-hover:bg-primary-700 transition-colors p-3 sm:p-4 text-white flex-1">
                  <h3 className="font-extrabold text-sm sm:text-base leading-tight mb-1">
                    {spot.name}
                  </h3>
                  <div className="text-[11px] mb-1">
                    <PawRating value={spot.rating} />
                  </div>
                  <p className="text-[11px] text-white/90 font-medium leading-tight">
                    {spot.locality}
                  </p>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <span className="inline-flex items-center gap-2 self-start px-4 py-1.5 rounded-full bg-accent-100 ring-1 ring-accent-300 text-sm shadow-sm">
              <span className="text-base font-extrabold text-accent-700">{visibleSpots.length}</span>
              <span className="text-warm-800 font-semibold">
                {visibleSpots.length === 1 ? 'swim school' : 'swim schools'} found
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
            </>
          )}
        </div>

        {selectedSpot && (
          <aside className="space-y-6">
            <div className="border border-warm-200 rounded-md overflow-hidden">
              <div className="relative aspect-[4/3] bg-warm-100">
                <iframe
                  key={selectedSpot.name}
                  title={`Map of ${selectedSpot.name}`}
                  src={`https://www.google.com/maps?q=${encodeURIComponent(`${selectedSpot.name}, ${selectedSpot.locality}`)}&output=embed`}
                  className="absolute inset-0 w-full h-full border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${selectedSpot.name}, ${selectedSpot.locality}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute top-3 right-3 px-3 py-1.5 bg-warm-900/90 hover:bg-warm-900 text-white text-xs font-semibold rounded-md"
                >
                  Open in Maps
                </a>
              </div>
            </div>

            <div className="rounded-2xl border-2 border-primary-100 bg-white shadow-sm overflow-hidden">
              <div className="px-4 py-2.5 bg-primary-100 border-b border-primary-200">
                <p className="text-[11px] font-extrabold tracking-[0.3em] text-primary-700 uppercase text-center">
                  Location
                </p>
              </div>
              <div className="p-4 flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-accent-100 ring-1 ring-accent-300 text-accent-700 flex items-center justify-center shrink-0">
                  <svg aria-hidden="true" className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2a8 8 0 00-8 8c0 5.5 8 12 8 12s8-6.5 8-12a8 8 0 00-8-8zm0 11a3 3 0 110-6 3 3 0 010 6z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-warm-900 leading-tight mb-0.5">
                    {selectedSpot.name}
                  </p>
                  <p className="text-xs text-warm-600 leading-snug">{selectedSpot.locality}</p>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${selectedSpot.name}, ${selectedSpot.locality}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 mt-2 text-xs font-semibold text-primary-700 hover:text-primary-800 hover:underline"
                  >
                    View on Google Maps
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </aside>
        )}
      </div>
      </div>

      {registerOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="register-swim-title"
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
                    Aquatic · Bangalore
                  </p>
                  <h2 id="register-swim-title" className="text-2xl font-extrabold text-warm-900">
                    List your swim school
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
                Tell us about your dog swim school or canine pool and we'll review and add it to the HiSpike directory.
              </p>

              <form onSubmit={submitSwimListing} className="space-y-4">
                <label className="block">
                  <span className="block text-sm font-semibold text-warm-900 mb-1">Swim school name <span className="text-red-500">*</span></span>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. Bangalore Canine Aquatics"
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
                  <span className="block text-sm font-semibold text-warm-900 mb-1">Pool type</span>
                  <input
                    type="text"
                    value={form.poolType}
                    onChange={(e) => setForm({ ...form, poolType: e.target.value })}
                    placeholder="e.g. Heated indoor pool, outdoor saltwater"
                    className="w-full px-3 py-2 border-2 border-warm-300 rounded-md text-sm outline-none focus:border-primary-500 transition-colors"
                  />
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <label className="block">
                    <span className="block text-sm font-semibold text-warm-900 mb-1">Open hours</span>
                    <input
                      type="text"
                      value={form.hours}
                      onChange={(e) => setForm({ ...form, hours: e.target.value })}
                      placeholder="e.g. 7 am to 9 pm"
                      className="w-full px-3 py-2 border-2 border-warm-300 rounded-md text-sm outline-none focus:border-primary-500 transition-colors"
                    />
                  </label>

                  <label className="block">
                    <span className="block text-sm font-semibold text-warm-900 mb-1">Cost</span>
                    <input
                      type="text"
                      value={form.cost}
                      onChange={(e) => setForm({ ...form, cost: e.target.value })}
                      placeholder="e.g. ₹600 / 30-min session"
                      className="w-full px-3 py-2 border-2 border-warm-300 rounded-md text-sm outline-none focus:border-primary-500 transition-colors"
                    />
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <label className="block">
                    <span className="block text-sm font-semibold text-warm-900 mb-1">Phone <span className="text-red-500">*</span></span>
                    <input
                      type="tel"
                      required
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder="+91 ..."
                      className="w-full px-3 py-2 border-2 border-warm-300 rounded-md text-sm outline-none focus:border-primary-500 transition-colors"
                    />
                  </label>

                  <label className="block">
                    <span className="block text-sm font-semibold text-warm-900 mb-1">Email</span>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="pool@example.com"
                      className="w-full px-3 py-2 border-2 border-warm-300 rounded-md text-sm outline-none focus:border-primary-500 transition-colors"
                    />
                  </label>
                </div>

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
