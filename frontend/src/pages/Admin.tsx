import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createHospital,
  deleteHospital,
  listHospitals,
  type HospitalCreate,
  type HospitalRead,
} from '@/api/hospitals';
import { toast } from '@/store/toastStore';
import {
  getRangedStats,
  getVisitStats,
  type RangedVisitStats,
  type VisitStats,
} from '@/lib/visitTracker';

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

type ListingKind = 'hospital' | 'park' | 'swimming' | 'grooming';
type ListingAction = 'add' | 'remove';
type ListingCard = { label: string; emoji: string; tint: string; kind: ListingKind; action: ListingAction };

const ADD_LISTING_CARDS: ListingCard[] = [
  { label: 'Add Hospital',    emoji: '🏥',  tint: 'from-rose-200 to-rose-400',       kind: 'hospital', action: 'add' },
  { label: 'Add Park',        emoji: '🌳',  tint: 'from-emerald-200 to-emerald-400', kind: 'park',     action: 'add' },
  { label: 'Add Swim School', emoji: '🐕💦', tint: 'from-sky-200 to-sky-400',         kind: 'swimming', action: 'add' },
  { label: 'Add Grooming',    emoji: '✂️',  tint: 'from-amber-200 to-amber-400',     kind: 'grooming', action: 'add' },
];

const REMOVE_LISTING_CARDS: ListingCard[] = [
  { label: 'Remove Hospital',    emoji: '🏥',  tint: 'from-rose-100 to-rose-300',       kind: 'hospital', action: 'remove' },
  { label: 'Remove Park',        emoji: '🌳',  tint: 'from-emerald-100 to-emerald-300', kind: 'park',     action: 'remove' },
  { label: 'Remove Swim School', emoji: '🐕💦', tint: 'from-sky-100 to-sky-300',         kind: 'swimming', action: 'remove' },
  { label: 'Remove Grooming',    emoji: '✂️',  tint: 'from-amber-100 to-amber-300',     kind: 'grooming', action: 'remove' },
];

function AddHospitalModal({ onClose }: { onClose: () => void }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<HospitalCreate>({
    name: '',
    locality: '',
    address: '',
    phone: '',
    specialties: '',
    rating: '',
    website: '',
  });

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const mutation = useMutation({
    mutationFn: createHospital,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hospitals'] });
      toast.success('Hospital added — visible on the Hospital page now.');
      onClose();
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Could not add hospital. Please try again.');
    },
  });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.locality || !form.address.trim() || !form.phone.trim()) {
      toast.error('Name, locality, address, and phone are required.');
      return;
    }
    mutation.mutate({
      name: form.name.trim(),
      locality: form.locality,
      address: form.address.trim(),
      phone: form.phone.trim(),
      specialties: form.specialties?.trim() || undefined,
      rating: form.rating?.trim() || undefined,
      website: form.website?.trim() || undefined,
    });
  };

  const requiredAsterisk = <span className="text-red-500">*</span>;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-hospital-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={onClose}
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
              <h2 id="add-hospital-title" className="text-2xl font-extrabold text-warm-900">
                Add a hospital
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="p-2 rounded-full text-warm-700 hover:text-warm-900 hover:bg-warm-100 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.25} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="h-0.5 w-12 bg-accent-400 rounded-full mb-5" />

          <form onSubmit={onSubmit} className="space-y-4">
            <label className="block">
              <span className="block text-sm font-semibold text-warm-900 mb-1">Hospital name {requiredAsterisk}</span>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. SKS Veterinary Hospital"
                className="w-full px-3 py-2 border-2 border-warm-300 rounded-md text-sm outline-none focus:border-primary-500 transition-colors"
              />
            </label>

            <label className="block">
              <span className="block text-sm font-semibold text-warm-900 mb-1">Locality {requiredAsterisk}</span>
              <select
                required
                value={form.locality}
                onChange={(e) => setForm({ ...form, locality: e.target.value })}
                className={`w-full px-3 py-2 border-2 border-warm-300 rounded-md text-sm outline-none focus:border-primary-500 transition-colors bg-white ${
                  form.locality ? 'text-warm-900' : 'text-warm-400'
                }`}
              >
                <option value="" disabled>Please select a locality</option>
                {BANGALORE_NEIGHBOURHOODS.map((n) => (
                  <option key={n} value={n} className="text-warm-900">{n}</option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="block text-sm font-semibold text-warm-900 mb-1">Full address {requiredAsterisk}</span>
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
                value={form.specialties ?? ''}
                onChange={(e) => setForm({ ...form, specialties: e.target.value })}
                placeholder="e.g. General, Surgery, Vaccination"
                className="w-full px-3 py-2 border-2 border-warm-300 rounded-md text-sm outline-none focus:border-primary-500 transition-colors"
              />
              <span className="block text-xs text-warm-500 mt-1">Comma-separated list</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="block">
                <span className="block text-sm font-semibold text-warm-900 mb-1">Phone {requiredAsterisk}</span>
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
                <span className="block text-sm font-semibold text-warm-900 mb-1">Rating</span>
                <input
                  type="text"
                  value={form.rating ?? ''}
                  onChange={(e) => setForm({ ...form, rating: e.target.value })}
                  placeholder="e.g. 4.7"
                  className="w-full px-3 py-2 border-2 border-warm-300 rounded-md text-sm outline-none focus:border-primary-500 transition-colors"
                />
              </label>
            </div>

            <label className="block">
              <span className="block text-sm font-semibold text-warm-900 mb-1">Website</span>
              <input
                type="url"
                value={form.website ?? ''}
                onChange={(e) => setForm({ ...form, website: e.target.value })}
                placeholder="https://..."
                className="w-full px-3 py-2 border-2 border-warm-300 rounded-md text-sm outline-none focus:border-primary-500 transition-colors"
              />
            </label>

            <div className="pt-2 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 rounded-full border-2 border-warm-300 text-warm-700 hover:bg-warm-100 text-sm font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={mutation.isPending}
                className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-accent-400 hover:bg-accent-300 disabled:opacity-60 disabled:cursor-not-allowed text-warm-900 text-sm font-bold tracking-[0.15em] uppercase ring-2 ring-accent-300/50 hover:ring-accent-200 transition-all shadow-md"
              >
                {mutation.isPending ? 'Adding…' : 'Add'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function RemoveHospitalModal({ onClose }: { onClose: () => void }) {
  const queryClient = useQueryClient();
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['hospitals'],
    queryFn: listHospitals,
  });

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const mutation = useMutation({
    mutationFn: deleteHospital,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hospitals'] });
      toast.success('Hospital removed.');
      setConfirmId(null);
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Could not remove hospital. Please try again.');
    },
  });

  const handleDelete = (id: string) => {
    if (confirmId !== id) {
      setConfirmId(id);
      return;
    }
    mutation.mutate(id);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="remove-hospital-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 sm:p-8 pb-4">
          <div className="flex items-start justify-between gap-4 mb-1">
            <div>
              <p className="text-[11px] font-semibold tracking-[0.3em] text-accent-600 uppercase mb-1">
                Vet Care · Bangalore
              </p>
              <h2 id="remove-hospital-title" className="text-2xl font-extrabold text-warm-900">
                Remove a hospital
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="p-2 rounded-full text-warm-700 hover:text-warm-900 hover:bg-warm-100 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.25} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="h-0.5 w-12 bg-accent-400 rounded-full mb-3" />
          <p className="text-sm text-warm-600">
            Click <span className="font-semibold text-red-600">Remove</span> twice to confirm — first click stages the row, second click deletes it.
          </p>
        </div>

        <div className="px-6 sm:px-8 pb-6 sm:pb-8 overflow-y-auto">
          {isLoading ? (
            <p className="text-sm text-warm-500 py-6 text-center">Loading hospitals…</p>
          ) : isError ? (
            <p className="text-sm text-red-600 py-6 text-center">
              Could not load hospitals. Please close and try again.
            </p>
          ) : !data || data.length === 0 ? (
            <p className="text-sm text-warm-500 py-6 text-center">
              No hospitals to remove.
            </p>
          ) : (
            <ul className="divide-y divide-warm-200 border border-warm-200 rounded-xl overflow-hidden">
              {data.map((h: HospitalRead) => {
                const staged = confirmId === h.id;
                const removing = staged && mutation.isPending;
                return (
                  <li key={h.id} className="flex items-center justify-between gap-3 px-4 py-3">
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-warm-900 truncate">{h.name}</p>
                      <p className="text-xs text-warm-500 truncate">📍 {h.locality}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDelete(h.id)}
                      disabled={removing}
                      className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-colors ${
                        staged
                          ? 'bg-red-600 text-white hover:bg-red-700 disabled:opacity-60'
                          : 'border-2 border-warm-300 bg-white text-warm-700 hover:border-red-500 hover:text-red-600'
                      }`}
                    >
                      {removing ? 'Removing…' : staged ? 'Confirm' : 'Remove'}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

function AddListingsSection() {
  const [openModal, setOpenModal] = useState<{ kind: ListingKind; action: ListingAction } | null>(null);

  const handleClick = (kind: ListingKind, action: ListingAction) => {
    if (kind === 'hospital') {
      setOpenModal({ kind, action });
      return;
    }
    toast.info(`${kind[0].toUpperCase()}${kind.slice(1)} ${action}-form is coming next.`);
  };

  const renderRow = (cards: ListingCard[]) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map(({ label, emoji, kind, action, tint }) => (
        <button
          key={`${action}-${kind}`}
          type="button"
          onClick={() => handleClick(kind, action)}
          className="group rounded-2xl border-2 border-primary-100 bg-white overflow-hidden hover:border-primary-300 hover:shadow-md transition-all flex flex-col text-left"
        >
          <div className={`aspect-[4/2] bg-gradient-to-br ${tint} flex items-center justify-center text-5xl`}>
            <span aria-hidden="true">{emoji}</span>
          </div>
          <div className="p-4 flex items-center justify-between gap-2">
            <span className="text-sm font-bold text-warm-900 group-hover:text-primary-700 transition-colors">
              {label}
            </span>
            <span className={`${action === 'remove' ? 'text-red-400 group-hover:text-red-600' : 'text-warm-400 group-hover:text-primary-600'} transition-colors`}>
              {action === 'remove' ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M9 7V4a2 2 0 012-2h2a2 2 0 012 2v3" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                </svg>
              )}
            </span>
          </div>
        </button>
      ))}
    </div>
  );

  return (
    <section className="mb-10">
      <div className="mb-4">
        <p className="text-[11px] font-semibold tracking-[0.3em] text-accent-600 uppercase mb-1">
          Listings
        </p>
        <h2 className="text-xl font-bold text-warm-900">Manage listings</h2>
        <p className="text-sm text-warm-500 mt-1">
          Add or remove entries from the public directory. Changes appear on the corresponding service page immediately.
        </p>
      </div>

      <div className="space-y-4">
        {renderRow(ADD_LISTING_CARDS)}
        {renderRow(REMOVE_LISTING_CARDS)}
      </div>

      {openModal?.kind === 'hospital' && openModal.action === 'add' && (
        <AddHospitalModal onClose={() => setOpenModal(null)} />
      )}
      {openModal?.kind === 'hospital' && openModal.action === 'remove' && (
        <RemoveHospitalModal onClose={() => setOpenModal(null)} />
      )}
    </section>
  );
}

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

// YYYY-MM-DD in the user's local timezone (matches what <input type="date">
// produces and consumes).
function toDateInputValue(d: Date): string {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function startOfDayMs(yyyymmdd: string): number {
  const [y, m, d] = yyyymmdd.split('-').map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1, 0, 0, 0, 0).getTime();
}

function endOfDayMs(yyyymmdd: string): number {
  const [y, m, d] = yyyymmdd.split('-').map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1, 23, 59, 59, 999).getTime();
}

function lastNDaysRange(days: number): { start: string; end: string } {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - (days - 1));
  return { start: toDateInputValue(start), end: toDateInputValue(end) };
}

function VisitsSection() {
  // Default range: last 30 days
  const initialRange = useMemo(() => lastNDaysRange(30), []);
  const [startDate, setStartDate] = useState(initialRange.start);
  const [endDate, setEndDate] = useState(initialRange.end);

  const [allTime, setAllTime] = useState<VisitStats>(() => getVisitStats());
  const [ranged, setRanged] = useState<RangedVisitStats>(() =>
    getRangedStats(startOfDayMs(initialRange.start), endOfDayMs(initialRange.end)),
  );

  const refresh = () => {
    setAllTime(getVisitStats());
    setRanged(getRangedStats(startOfDayMs(startDate), endOfDayMs(endDate)));
  };

  // Recompute whenever the date range changes
  useEffect(() => {
    setRanged(getRangedStats(startOfDayMs(startDate), endOfDayMs(endDate)));
  }, [startDate, endDate]);

  // Refresh on mount + every 5s so newly-tracked navigations are picked up
  useEffect(() => {
    refresh();
    const id = window.setInterval(refresh, 5000);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDate, endDate]);

  const setPreset = (days: number) => {
    const r = lastNDaysRange(days);
    setStartDate(r.start);
    setEndDate(r.end);
  };

  const dateInputClass =
    'px-3 py-2 border-2 border-warm-300 rounded-md text-sm outline-none focus:border-primary-500 transition-colors bg-white text-warm-900';

  return (
    <section className="mb-10">
      <div className="mb-4">
        <p className="text-[11px] font-semibold tracking-[0.3em] text-accent-600 uppercase mb-1">
          Site Analytics
        </p>
        <h2 className="text-xl font-bold text-warm-900">Website visits</h2>
      </div>

      {/* Date range controls */}
      <div className="rounded-2xl border-2 border-primary-100 bg-white p-4 mb-4">
        <div className="flex flex-wrap items-end gap-4">
          <label className="flex flex-col gap-1">
            <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-primary-700">
              Start date
            </span>
            <input
              type="date"
              value={startDate}
              max={endDate}
              onChange={(e) => setStartDate(e.target.value)}
              className={dateInputClass}
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-primary-700">
              End date
            </span>
            <input
              type="date"
              value={endDate}
              min={startDate}
              max={toDateInputValue(new Date())}
              onChange={(e) => setEndDate(e.target.value)}
              className={dateInputClass}
            />
          </label>
          <div className="flex flex-wrap gap-2">
            {[
              { label: '7d', days: 7 },
              { label: '30d', days: 30 },
              { label: '90d', days: 90 },
              { label: '1y', days: 365 },
            ].map(({ label, days }) => (
              <button
                key={label}
                type="button"
                onClick={() => setPreset(days)}
                className="px-3 py-1.5 rounded-full border border-warm-300 bg-white text-xs font-semibold text-warm-700 hover:border-primary-500 hover:text-primary-700 transition-colors"
              >
                Last {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border-2 border-primary-100 bg-white p-5">
          <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-primary-700 mb-2">
            Total Visits
          </p>
          <p className="text-3xl font-extrabold text-warm-900">
            {ranged.pageViews.toLocaleString('en-IN')}
          </p>
          <p className="text-xs text-warm-500 mt-1">
            Page views in the selected range
          </p>
        </div>

        <div className="rounded-2xl border-2 border-primary-100 bg-white p-5">
          <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-primary-700 mb-2">
            Unique Visits
          </p>
          <p className="text-3xl font-extrabold text-warm-900">
            {ranged.uniqueSessions.toLocaleString('en-IN')}
          </p>
          <p className="text-xs text-warm-500 mt-1">
            Sessions in range (30-min idle window)
          </p>
        </div>

        <div className="rounded-2xl border-2 border-primary-100 bg-white p-5">
          <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-primary-700 mb-2">
            Last Visit
          </p>
          <p className="text-base font-bold text-warm-900 leading-tight">
            {formatDateTime(allTime.lastVisitAt)}
          </p>
          <p className="text-xs text-warm-500 mt-1">All-time most recent</p>
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

      <AddListingsSection />
      <VisitsSection />
    </div>
  );
}
