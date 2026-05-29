import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { listHospitals, type HospitalRead } from '@/api/hospitals';
import { toast } from '@/store/toastStore';

type Hospital = {
  name: string;
  locality: string;
  address: string;
  specialties: string;
  rating: string;
  phone?: string;
  website?: string;
  hours?: string;
  email?: string;
};

// All hospitals now live in the database (or the localStorage mock store
// in dev). The in-page seed used to live here — it has been moved into
// backend/scripts/seed_hospitals.py and frontend/src/api/hospitals.ts so
// admins can add and delete via the API.

// +918147006342 -> +91 81470 06342 (3-digit country code + 5/5 split).
// Falls back to the raw value for any other format.
function formatPhone(raw: string): string {
  if (raw.startsWith('+91') && raw.length === 13) {
    return `+91 ${raw.slice(3, 8)} ${raw.slice(8)}`;
  }
  return raw;
}

function mapsUrl(address: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
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

// Normalise an API HospitalRead into the local Hospital shape (null → '').
function normaliseApiHospital(h: HospitalRead): Hospital {
  return {
    name: h.name,
    locality: h.locality,
    address: h.address,
    specialties: h.specialties ?? '',
    rating: h.rating ?? '',
    phone: h.phone ?? undefined,
    website: h.website ?? undefined,
    hours: h.hours ?? undefined,
    email: h.email ?? undefined,
  };
}

// Filter dropdown defaults — used both as labels and as sentinel "no filter"
// values so we can compare against them cheaply.
const ALL_SPECIALTIES = 'All Specialties';
const ALL_LOCATIONS = 'All Locations';

// Comprehensive list of Bangalore neighbourhoods used by the
// "List your hospital" registration form. Broader than CITIES (which is
// limited to areas where we already list a hospital) so a new clinic in
// any major Bangalore neighbourhood can be submitted.
const BANGALORE_NEIGHBOURHOODS = [
  'Banashankari',
  'Banaswadi',
  'Basavanagudi',
  'Bellandur',
  'Bommanahalli',
  'Brookefield',
  'BTM Layout',
  'CV Raman Nagar',
  'Domlur',
  'Electronic City',
  'Frazer Town',
  'HBR Layout',
  'Hebbal',
  'Hennur',
  'Hoodi',
  'Hosur Road',
  'HSR Layout',
  'Indiranagar',
  'ITPL',
  'Jakkur',
  'Jalahalli',
  'Jayanagar',
  'JP Nagar',
  'Kalyan Nagar',
  'Kammanahalli',
  'Kengeri',
  'Koramangala',
  'KR Puram',
  'Mahadevapura',
  'Malleshwaram',
  'Marathahalli',
  'MG Road',
  'Nagavara',
  'Nagarbhavi',
  'Padmanabhanagar',
  'Rajajinagar',
  'Rajarajeshwari Nagar',
  'Ramamurthy Nagar',
  'RT Nagar',
  'Sadashivanagar',
  'Sahakara Nagar',
  'Sarjapur Road',
  'Shivajinagar',
  'Ulsoor',
  'Vasanth Nagar',
  'Vijayanagar',
  'Whitefield',
  'Yelahanka',
  'Yeshwantpur',
];

export function Hospital() {
  const [search, setSearch] = useState('');
  const [specialty, setSpecialty] = useState(ALL_SPECIALTIES);
  const [location, setLocation] = useState(ALL_LOCATIONS);
  const [activeCity, setActiveCity] = useState<string | null>(null);
  const [applied, setApplied] = useState({ search: '', specialty: ALL_SPECIALTIES, location: ALL_LOCATIONS });

  // Admin-added hospitals from the API. Fails open — if the request errors,
  // we just show the hardcoded seed list with a one-line warning.
  const adminHospitalsQuery = useQuery({
    queryKey: ['hospitals'],
    queryFn: listHospitals,
    staleTime: 30_000,
  });

  const allHospitals = useMemo(
    () => (adminHospitalsQuery.data ?? []).map(normaliseApiHospital),
    [adminHospitalsQuery.data],
  );

  // Filter dropdowns + chip row are derived from the combined list so admin-
  // added hospitals contribute their own specialties / localities to the UI.
  const SPECIALTIES = useMemo(
    () => [
      ALL_SPECIALTIES,
      ...Array.from(
        new Set(
          allHospitals
            .flatMap((h) => h.specialties.split(','))
            .map((s) => s.trim())
            .filter(Boolean),
        ),
      ).sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' })),
    ],
    [allHospitals],
  );
  const LOCATIONS = useMemo(
    () => [
      ALL_LOCATIONS,
      ...Array.from(new Set(allHospitals.map((h) => h.locality)))
        .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' })),
    ],
    [allHospitals],
  );
  const CITIES = useMemo(() => LOCATIONS.slice(1), [LOCATIONS]);

  const applySearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    setApplied({ search: search.trim(), specialty, location });
  };

  const resetFilters = () => {
    setSearch('');
    setSpecialty(ALL_SPECIALTIES);
    setLocation(ALL_LOCATIONS);
    setActiveCity(null);
    setApplied({ search: '', specialty: ALL_SPECIALTIES, location: ALL_LOCATIONS });
  };

  // List-your-hospital modal
  const [registerOpen, setRegisterOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: '',
    locality: '',
    address: '',
    specialties: '',
    phone: '',
    website: '',
  });

  // Close modal on ESC
  useEffect(() => {
    if (!registerOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setRegisterOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [registerOpen]);

  const submitHospitalListing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.locality || !form.address.trim() || !form.phone.trim()) {
      toast.error('Hospital name, locality, address, and phone are required.');
      return;
    }
    setSubmitting(true);

    // No backend endpoint for hospital listings yet — route submissions
    // through FormSubmit's AJAX endpoint which forwards the form data as
    // an email to support@hispike.in. First submission triggers a one-time
    // activation email to that mailbox; once it's clicked, all subsequent
    // submissions deliver automatically. When a real backend ships,
    // replace this fetch with the proper POST.
    try {
      const response = await fetch(
        'https://formsubmit.co/ajax/267799cdb3e1f5ab88dbf80bc8e9e283',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({
            _subject: `New HiSpike hospital listing: ${form.name.trim()}`,
            _template: 'table',
            _captcha: 'false',
            'Hospital name': form.name.trim(),
            Locality: form.locality,
            Address: form.address.trim(),
            Specialties: form.specialties.trim() || '(not provided)',
            Phone: form.phone.trim() || '(not provided)',
            Website: form.website.trim() || '(not provided)',
          }),
        },
      );
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      setRegisterOpen(false);
      setForm({ name: '', locality: '', address: '', specialties: '', phone: '', website: '' });
      toast.success('Thanks! Your hospital submission has been received.');
    } catch {
      toast.error('Could not submit right now. Please try again in a moment.');
    } finally {
      setSubmitting(false);
    }
  };

  // Pagination — 6 cards per page fits the existing 6 hospitals on a single
  // page (so pagination is invisible until the directory grows). Reset to
  // page 1 whenever filters change so users don't land on an empty page.
  const PAGE_SIZE = 6;
  const [currentPage, setCurrentPage] = useState(1);
  useEffect(() => {
    setCurrentPage(1);
  }, [applied, activeCity]);

  const filteredHospitals = allHospitals
    .filter((h) => {
      const q = applied.search.toLowerCase();
      if (q && !`${h.name} ${h.locality} ${h.specialties}`.toLowerCase().includes(q)) return false;
      if (applied.specialty !== ALL_SPECIALTIES && !h.specialties.toLowerCase().includes(applied.specialty.toLowerCase())) return false;
      if (applied.location !== ALL_LOCATIONS && !h.locality.toLowerCase().includes(applied.location.toLowerCase())) return false;
      if (activeCity && !h.locality.toLowerCase().includes(activeCity.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));

  const totalPages = Math.max(1, Math.ceil(filteredHospitals.length / PAGE_SIZE));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const pagedHospitals = filteredHospitals.slice(
    (safeCurrentPage - 1) * PAGE_SIZE,
    safeCurrentPage * PAGE_SIZE,
  );

  return (
    <div className="bg-white">
      {/* Title hero — matches the Home gradient + paw-print language */}
      <section className="relative overflow-hidden bg-gradient-to-r from-primary-900 via-primary-800 to-primary-600 text-white">
        {/* Decorative paw-print pattern */}
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
          <span aria-hidden="true" className="text-4xl sm:text-5xl drop-shadow">🏥</span>
          <div className="flex-1">
            <p className="text-[11px] sm:text-xs font-semibold tracking-[0.3em] text-accent-400 uppercase mb-1">
              Vet Care · Bangalore
            </p>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight">
              Best Pet Hospitals in Bangalore
            </h1>
            <div className="mt-2 h-0.5 w-16 bg-accent-400 rounded-full" />
            <p className="mt-2 text-sm text-primary-100/90 max-w-2xl">
              Trusted veterinary clinics and 24×7 emergency care across Indiranagar, Koramangala, Whitefield, HSR Layout, Jayanagar, and Domlur.
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
            List Your Hospital
          </button>
        </div>
      </section>

      {/* Search toolbar */}
      <section className="border-b border-warm-200 bg-primary-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <form onSubmit={applySearch} className="flex flex-wrap items-center gap-2 lg:gap-3">
            {/* Search input */}
            <label className="flex items-center gap-2 px-3 py-2 border-2 border-warm-400 rounded-md bg-white flex-1 w-full sm:w-auto sm:min-w-[200px]">
              <svg className="w-4 h-4 text-warm-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z" />
              </svg>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search Vet"
                className="w-full text-sm outline-none bg-transparent placeholder:text-warm-400"
              />
            </label>

            {/* Specialty — wrap in <label> so clicking the icon or wrapper
                area opens the native select, not just the arrow. */}
            <label className="flex items-center gap-2 px-3 py-2 border-2 border-warm-400 rounded-md bg-white w-full sm:w-auto sm:min-w-[200px] cursor-pointer">
              <svg aria-hidden="true" className="w-4 h-4 text-warm-500 pointer-events-none shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <select
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
                className="w-full text-sm outline-none bg-transparent text-warm-700 cursor-pointer"
              >
                {SPECIALTIES.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </label>

            {/* Location */}
            <label className="flex items-center gap-2 px-3 py-2 border-2 border-warm-400 rounded-md bg-white w-full sm:w-auto sm:min-w-[200px] cursor-pointer">
              <svg aria-hidden="true" className="w-4 h-4 text-warm-500 pointer-events-none shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full text-sm outline-none bg-transparent text-warm-700 cursor-pointer"
              >
                {LOCATIONS.map((l) => (
                  <option key={l}>{l}</option>
                ))}
              </select>
            </label>

            {/* Primary CTA — Search the directory */}
            <button
              type="submit"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-accent-400 hover:bg-accent-300 text-warm-900 text-sm font-bold tracking-[0.15em] uppercase ring-2 ring-accent-300/50 hover:ring-accent-200 transition-all shadow-md"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z" />
              </svg>
              Search
            </button>

            {/* Secondary action — clear all filters */}
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

      {/* City chips */}
      <section className="bg-primary-100 border-b border-warm-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-wrap justify-center gap-3">
            {CITIES.map((city) => {
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

      {/* Results */}
      <section className="py-12 bg-primary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {adminHospitalsQuery.isLoading && allHospitals.length === 0 ? (
            <div className="max-w-md mx-auto text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary-100 flex items-center justify-center text-3xl animate-pulse">
                🐾
              </div>
              <h3 className="text-lg font-bold text-warm-900 mb-2">Loading hospitals…</h3>
              <p className="text-sm text-warm-600">
                Waking up our directory. This can take a few seconds on the first visit.
              </p>
            </div>
          ) : filteredHospitals.length === 0 ? (
            <div className="max-w-md mx-auto text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-warm-100 flex items-center justify-center text-3xl">
                🐾
              </div>
              <h3 className="text-lg font-bold text-warm-900 mb-2">
                No hospitals match your filters
              </h3>
              <p className="text-sm text-warm-600 mb-6">
                Try a different specialty, area, or search term — or clear the filters to see every clinic we list.
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
              <span className="text-base font-extrabold text-accent-700">{filteredHospitals.length}</span>
              <span className="text-warm-800 font-semibold">
                {filteredHospitals.length === 1 ? 'hospital' : 'hospitals'} found
              </span>
            </span>
            <PaginationControls
              currentPage={safeCurrentPage}
              totalPages={totalPages}
              onChange={setCurrentPage}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {pagedHospitals
              .map((h) => (
                <div
                  key={`${h.name}-${h.locality}`}
                  className="p-6 rounded-2xl border border-warm-200 hover:border-primary-400 hover:shadow-md transition-all bg-white flex flex-col"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 rounded-lg bg-primary-100 text-primary-700 flex items-center justify-center text-xl">
                      🏥
                    </div>
                    <div className="flex items-center gap-1 text-sm font-semibold text-accent-600">
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.363 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.176 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.363-1.118L2.98 8.719c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      {h.rating}
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-warm-900 mb-1">{h.name}</h3>
                  {/* Locality + address open Google Maps in a new tab */}
                  <a
                    href={mapsUrl(h.address)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block mb-3 group/maps"
                  >
                    <p className="text-sm text-warm-500 mb-1 group-hover/maps:text-primary-700 transition-colors">
                      📍 {h.locality}{' '}
                      <span className="text-xs text-primary-600 group-hover/maps:underline">
                        · View on Maps
                      </span>
                    </p>
                    <p className="text-xs text-warm-500 leading-snug group-hover/maps:text-warm-700 transition-colors">
                      {h.address}
                    </p>
                  </a>
                  {h.phone && (
                    <a
                      href={`tel:${h.phone}`}
                      className="inline-flex items-center gap-1.5 mb-2 text-sm font-semibold text-primary-700 hover:text-primary-800 hover:underline transition-colors"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M6.6 10.8a15.1 15.1 0 006.6 6.6l2.2-2.2a1 1 0 011-.25 11.4 11.4 0 003.6.57 1 1 0 011 1V20a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.5a1 1 0 011 1c0 1.25.2 2.45.57 3.6a1 1 0 01-.25 1l-2.22 2.2z" />
                      </svg>
                      {formatPhone(h.phone)}
                    </a>
                  )}
                  {h.email && (
                    <a
                      href={`mailto:${h.email}`}
                      className="inline-flex items-center gap-1.5 mb-2 text-sm font-semibold text-primary-700 hover:text-primary-800 hover:underline transition-colors break-all"
                    >
                      <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      {h.email}
                    </a>
                  )}
                  {h.hours && (
                    <p className="inline-flex items-center gap-1.5 mb-2 text-sm text-warm-600">
                      <svg className="w-4 h-4 shrink-0 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {h.hours}
                    </p>
                  )}
                  <p className="text-sm text-warm-600 mb-4">{h.specialties}</p>
                  <div className="mt-auto flex gap-2">
                    {h.website ? (
                      <a
                        href={h.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 px-3 py-2 bg-primary-600 hover:bg-primary-700 text-white text-xs font-semibold rounded-md transition-colors text-center"
                      >
                        Book
                      </a>
                    ) : (
                      <button
                        type="button"
                        disabled
                        className="flex-1 px-3 py-2 bg-warm-200 text-warm-500 text-xs font-semibold rounded-md cursor-not-allowed"
                      >
                        Book
                      </button>
                    )}
                    {h.phone ? (
                      <a
                        href={`tel:${h.phone}`}
                        className="flex-1 px-3 py-2 border border-warm-300 hover:border-primary-400 text-warm-700 text-xs font-semibold rounded-md transition-colors text-center"
                      >
                        Call
                      </a>
                    ) : (
                      <button
                        type="button"
                        disabled
                        className="flex-1 px-3 py-2 border border-warm-200 text-warm-400 text-xs font-semibold rounded-md cursor-not-allowed"
                        title="Phone not available — visit website"
                      >
                        Call
                      </button>
                    )}
                  </div>
                </div>
              ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <span className="inline-flex items-center gap-2 self-start px-4 py-1.5 rounded-full bg-accent-100 ring-1 ring-accent-300 text-sm shadow-sm">
                <span className="text-base font-extrabold text-accent-700">{filteredHospitals.length}</span>
                <span className="text-warm-800 font-semibold">
                  {filteredHospitals.length === 1 ? 'hospital' : 'hospitals'} found
                </span>
              </span>
              <PaginationControls
                currentPage={safeCurrentPage}
                totalPages={totalPages}
                onChange={setCurrentPage}
              />
            </div>
          )}
          </>
          )}
        </div>
      </section>

      {/* Register-your-hospital modal */}
      {registerOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="register-hospital-title"
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
                    Vet Care · Bangalore
                  </p>
                  <h2 id="register-hospital-title" className="text-2xl font-extrabold text-warm-900">
                    List your hospital
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
                Tell us about your veterinary clinic and we'll review and add it to the HiSpike directory.
              </p>

              <form onSubmit={submitHospitalListing} className="space-y-4">
                <label className="block">
                  <span className="block text-sm font-semibold text-warm-900 mb-1">Hospital name <span className="text-red-500">*</span></span>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. Bangalore Pet Wellness Clinic"
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
                  <span className="block text-sm font-semibold text-warm-900 mb-1">Specialties</span>
                  <input
                    type="text"
                    value={form.specialties}
                    onChange={(e) => setForm({ ...form, specialties: e.target.value })}
                    placeholder="General, Surgery, Diagnostics"
                    className="w-full px-3 py-2 border-2 border-warm-300 rounded-md text-sm outline-none focus:border-primary-500 transition-colors"
                  />
                  <span className="block text-xs text-warm-500 mt-1">
                    Comma-separated list
                  </span>
                </label>

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
