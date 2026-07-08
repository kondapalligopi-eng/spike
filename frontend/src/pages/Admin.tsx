import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createHospital,
  deleteHospital,
  listHospitals,
  updateHospital,
  type HospitalCreate,
  type HospitalRead,
} from '@/api/hospitals';
import {
  createPark,
  deletePark,
  listParks,
  updatePark,
  type ParkCreate,
  type ParkRead,
} from '@/api/parks';
import {
  createSwimSchool,
  deleteSwimSchool,
  listSwimSchools,
  updateSwimSchool,
  type SwimSchoolCreate,
  type SwimSchoolRead,
} from '@/api/swimSchools';
import {
  createGroomingSalon,
  deleteGroomingSalon,
  listGroomingSalons,
  updateGroomingSalon,
  type GroomingSalonCreate,
  type GroomingSalonRead,
} from '@/api/groomingSalons';
import {
  createPetFood,
  deletePetFood,
  listPetFoods,
  updatePetFood,
  type PetFoodCreate,
  type PetFoodRead,
} from '@/api/petFoods';
import {
  listSiteSettings,
  updateSiteSetting,
  type SiteSettingKey,
} from '@/api/siteSettings';
import {
  listAllPetPages,
  deletePetPage,
} from '@/api/petPages';
import {
  listSubmissions,
  setSubmissionHandled,
  deleteSubmission,
  type SubmissionRead,
} from '@/api/submissions';
import { toast } from '@/store/toastStore';
import {
  getRangedStats,
  getVisitStats,
  type RangedVisitStats,
  type VisitStats,
} from '@/lib/visitTracker';
import { readSheetRows, downloadTemplate, downloadRows, type SheetRow } from '@/lib/spreadsheet';
import { getCounter } from '@/api/counters';
import { listUsers } from '@/api/users';

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

type ListingKind = 'hospital' | 'park' | 'swimming' | 'grooming' | 'food';
type ListingAction = 'add' | 'edit' | 'remove' | 'import';
type ListingCard = { label: string; emoji: string; tint: string; kind: ListingKind; action: ListingAction };

const ADD_LISTING_CARDS: ListingCard[] = [
  { label: 'Add Hospital',    emoji: '🏥',  tint: 'from-rose-200 to-rose-400',       kind: 'hospital', action: 'add' },
  { label: 'Add Park',        emoji: '🌳',  tint: 'from-emerald-200 to-emerald-400', kind: 'park',     action: 'add' },
  { label: 'Add Swim School', emoji: '🐕💦', tint: 'from-sky-200 to-sky-400',         kind: 'swimming', action: 'add' },
  { label: 'Add Grooming',    emoji: '✂️',  tint: 'from-amber-200 to-amber-400',     kind: 'grooming', action: 'add' },
  { label: 'Add Pet Food',    emoji: '🥫',  tint: 'from-orange-200 to-orange-400',   kind: 'food',     action: 'add' },
];

const EDIT_LISTING_CARDS: ListingCard[] = [
  { label: 'Edit Hospital',    emoji: '🏥',  tint: 'from-rose-100 to-rose-200',       kind: 'hospital', action: 'edit' },
  { label: 'Edit Park',        emoji: '🌳',  tint: 'from-emerald-100 to-emerald-200', kind: 'park',     action: 'edit' },
  { label: 'Edit Swim School', emoji: '🐕💦', tint: 'from-sky-100 to-sky-200',         kind: 'swimming', action: 'edit' },
  { label: 'Edit Grooming',    emoji: '✂️',  tint: 'from-amber-100 to-amber-200',     kind: 'grooming', action: 'edit' },
  { label: 'Edit Pet Food',    emoji: '🥫',  tint: 'from-orange-100 to-orange-200',   kind: 'food',     action: 'edit' },
];

const REMOVE_LISTING_CARDS: ListingCard[] = [
  { label: 'Remove Hospital',    emoji: '🏥',  tint: 'from-rose-50 to-rose-100',       kind: 'hospital', action: 'remove' },
  { label: 'Remove Park',        emoji: '🌳',  tint: 'from-emerald-50 to-emerald-100', kind: 'park',     action: 'remove' },
  { label: 'Remove Swim School', emoji: '🐕💦', tint: 'from-sky-50 to-sky-100',         kind: 'swimming', action: 'remove' },
  { label: 'Remove Grooming',    emoji: '✂️',  tint: 'from-amber-50 to-amber-100',     kind: 'grooming', action: 'remove' },
  { label: 'Remove Pet Food',    emoji: '🥫',  tint: 'from-orange-50 to-orange-100',   kind: 'food',     action: 'remove' },
];

// Bulk Excel import is only offered for the three directory types with the
// most rows to enter. Add/Edit/Remove above stay the per-item path.
const IMPORT_LISTING_CARDS: ListingCard[] = [
  { label: 'Import Hospitals',    emoji: '🏥',  tint: 'from-rose-100 to-rose-300',       kind: 'hospital', action: 'import' },
  { label: 'Import Parks',        emoji: '🌳',  tint: 'from-emerald-100 to-emerald-300', kind: 'park',     action: 'import' },
  { label: 'Import Swim Schools', emoji: '🐕💦', tint: 'from-sky-100 to-sky-300',         kind: 'swimming', action: 'import' },
  { label: 'Import Grooming',     emoji: '✂️',  tint: 'from-amber-100 to-amber-300',     kind: 'grooming', action: 'import' },
];

const PET_FOOD_LIFESTAGES = ['Puppy', 'Adult', 'Senior', 'All Lifestages'];
const PET_FOOD_FORMS = ['Dry Food', 'Wet Food', 'Freeze-Dried', 'Raw', 'Treats'];

// Pressing Enter inside a single-line <input> would otherwise submit the
// form — in Edit mode every required field is pre-filled, so an accidental
// Enter mid-typing fires the mutation and closes the modal. Suppress that
// here while still letting Enter add newlines in <textarea> and still
// letting the explicit submit button work.
function suppressEnterSubmit(e: React.KeyboardEvent<HTMLFormElement>) {
  if (e.key === 'Enter' && e.target instanceof HTMLInputElement) {
    e.preventDefault();
  }
}

function AddHospitalModal({ onClose, existing }: { onClose: () => void; existing?: HospitalRead }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<HospitalCreate>(
    existing
      ? {
          name: existing.name,
          locality: existing.locality,
          address: existing.address,
          phone: existing.phone,
          specialties: existing.specialties ?? '',
          rating: existing.rating ?? '',
          website: existing.website ?? '',
          hours: existing.hours ?? '',
          email: existing.email ?? '',
        }
      : {
          name: '',
          locality: '',
          address: '',
          phone: '',
          specialties: '',
          rating: '',
          website: '',
          hours: '',
          email: '',
        }
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const mutation = useMutation({
    mutationFn: existing
      ? (data: HospitalCreate) => updateHospital(existing.id, data)
      : createHospital,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hospitals'] });
      toast.success(existing ? 'Hospital updated.' : 'Hospital added — visible on the Hospital page now.');
      onClose();
    },
    onError: (err: Error) => {
      toast.error(err.message || `Could not ${existing ? 'update' : 'add'} hospital. Please try again.`);
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
      hours: form.hours?.trim() || undefined,
      email: form.email?.trim() || undefined,
    });
  };

  const requiredAsterisk = <span className="text-red-500">*</span>;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-hospital-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
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
                {existing ? 'Edit hospital' : 'Add a hospital'}
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

          <form onSubmit={onSubmit} onKeyDown={suppressEnterSubmit} className="space-y-4">
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="block">
                <span className="block text-sm font-semibold text-warm-900 mb-1">Open hours</span>
                <input
                  type="text"
                  value={form.hours ?? ''}
                  onChange={(e) => setForm({ ...form, hours: e.target.value })}
                  placeholder="e.g. 9 am to 9 pm, daily"
                  className="w-full px-3 py-2 border-2 border-warm-300 rounded-md text-sm outline-none focus:border-primary-500 transition-colors"
                />
              </label>
              <label className="block">
                <span className="block text-sm font-semibold text-warm-900 mb-1">Email</span>
                <input
                  type="email"
                  value={form.email ?? ''}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="clinic@example.com"
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
                {mutation.isPending ? (existing ? 'Saving…' : 'Adding…') : (existing ? 'Save' : 'Add')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

type GenericRemoveProps<T> = {
  onClose: () => void;
  title: string;
  eyebrow: string;
  successMessage: string;
  emptyMessage: string;
  loadingLabel: string;
  errorLabel: string;
  queryKey: readonly unknown[];
  fetchItems: () => Promise<T[]>;
  deleteItem: (id: string) => Promise<void>;
  getId: (item: T) => string;
  getPrimary: (item: T) => string;
  getSecondary: (item: T) => string;
};

type GenericPickProps<T> = {
  onClose: () => void;
  onPick: (item: T) => void;
  title: string;
  eyebrow: string;
  emptyMessage: string;
  loadingLabel: string;
  errorLabel: string;
  queryKey: readonly unknown[];
  fetchItems: () => Promise<T[]>;
  getId: (item: T) => string;
  getPrimary: (item: T) => string;
  getSecondary: (item: T) => string;
};

function GenericPickModal<T>({
  onClose,
  onPick,
  title,
  eyebrow,
  emptyMessage,
  loadingLabel,
  errorLabel,
  queryKey,
  fetchItems,
  getId,
  getPrimary,
  getSecondary,
}: GenericPickProps<T>) {
  const { data, isLoading, isError } = useQuery({
    queryKey,
    queryFn: fetchItems,
  });

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 sm:p-8 pb-4">
          <div className="flex items-start justify-between gap-4 mb-1">
            <div>
              <p className="text-[11px] font-semibold tracking-[0.3em] text-accent-600 uppercase mb-1">
                {eyebrow}
              </p>
              <h2 className="text-2xl font-extrabold text-warm-900">{title}</h2>
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
            Pick the entry you want to edit.
          </p>
        </div>

        <div className="px-6 sm:px-8 pb-6 sm:pb-8 overflow-y-auto">
          {isLoading ? (
            <p className="text-sm text-warm-500 py-6 text-center">{loadingLabel}</p>
          ) : isError ? (
            <p className="text-sm text-red-600 py-6 text-center">{errorLabel}</p>
          ) : !data || data.length === 0 ? (
            <p className="text-sm text-warm-500 py-6 text-center">{emptyMessage}</p>
          ) : (
            <ul className="divide-y divide-warm-200 border border-warm-200 rounded-xl overflow-hidden">
              {data.map((item) => (
                <li key={getId(item)} className="flex items-center justify-between gap-3 px-4 py-3">
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-warm-900 truncate">{getPrimary(item)}</p>
                    <p className="text-xs text-warm-500 truncate">📍 {getSecondary(item)}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onPick(item)}
                    className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-colors border-2 border-warm-300 bg-white text-warm-700 hover:border-primary-500 hover:text-primary-700"
                  >
                    Edit
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

function GenericRemoveModal<T>({
  onClose,
  title,
  eyebrow,
  successMessage,
  emptyMessage,
  loadingLabel,
  errorLabel,
  queryKey,
  fetchItems,
  deleteItem,
  getId,
  getPrimary,
  getSecondary,
}: GenericRemoveProps<T>) {
  const queryClient = useQueryClient();
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey,
    queryFn: fetchItems,
  });

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const mutation = useMutation({
    mutationFn: deleteItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast.success(successMessage);
      setConfirmId(null);
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Could not remove. Please try again.');
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 sm:p-8 pb-4">
          <div className="flex items-start justify-between gap-4 mb-1">
            <div>
              <p className="text-[11px] font-semibold tracking-[0.3em] text-accent-600 uppercase mb-1">
                {eyebrow}
              </p>
              <h2 className="text-2xl font-extrabold text-warm-900">{title}</h2>
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
            <p className="text-sm text-warm-500 py-6 text-center">{loadingLabel}</p>
          ) : isError ? (
            <p className="text-sm text-red-600 py-6 text-center">{errorLabel}</p>
          ) : !data || data.length === 0 ? (
            <p className="text-sm text-warm-500 py-6 text-center">{emptyMessage}</p>
          ) : (
            <ul className="divide-y divide-warm-200 border border-warm-200 rounded-xl overflow-hidden">
              {data.map((item) => {
                const id = getId(item);
                const staged = confirmId === id;
                const removing = staged && mutation.isPending;
                return (
                  <li key={id} className="flex items-center justify-between gap-3 px-4 py-3">
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-warm-900 truncate">{getPrimary(item)}</p>
                      <p className="text-xs text-warm-500 truncate">📍 {getSecondary(item)}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDelete(id)}
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

function AddParkModal({ onClose, existing }: { onClose: () => void; existing?: ParkRead }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<ParkCreate>(
    existing
      ? {
          name: existing.name,
          locality: existing.locality,
          rating: existing.rating,
          image_url: existing.image_url ?? '',
          address: existing.address,
          hours: existing.hours ?? '',
          cost: existing.cost ?? '',
          off_leash: existing.off_leash ?? '',
          features: existing.features ?? '',
          phone: existing.phone ?? '',
          email: existing.email ?? '',
          website: existing.website ?? '',
          highlights: existing.highlights ?? [],
        }
      : {
          name: '', locality: '', rating: 4, image_url: '',
          address: '', hours: '', cost: '', off_leash: '',
          features: '', phone: '', email: '', website: '', highlights: [],
        }
  );
  const [highlightsText, setHighlightsText] = useState(
    existing ? (existing.highlights ?? []).join('\n') : ''
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const mutation = useMutation({
    mutationFn: existing
      ? (data: ParkCreate) => updatePark(existing.id, data)
      : createPark,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parks'] });
      toast.success(existing ? 'Park updated.' : 'Park added — visible on the Park page now.');
      onClose();
    },
    onError: (err: Error) => toast.error(err.message || `Could not ${existing ? 'update' : 'add'} park.`),
  });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.locality.trim() || !form.address.trim()) {
      toast.error('Park name, locality, and address are required.');
      return;
    }
    const highlights = highlightsText.split('\n').map((l) => l.trim()).filter(Boolean);
    mutation.mutate({
      name: form.name.trim(),
      locality: form.locality.trim(),
      rating: form.rating,
      image_url: form.image_url?.trim() || undefined,
      address: form.address.trim(),
      hours: form.hours?.trim() || undefined,
      cost: form.cost?.trim() || undefined,
      off_leash: form.off_leash?.trim() || undefined,
      features: form.features?.trim() || undefined,
      phone: form.phone?.trim() || undefined,
      email: form.email?.trim() || undefined,
      website: form.website?.trim() || undefined,
      highlights,
    });
  };

  const star = <span className="text-red-500">*</span>;
  const inputCls = 'w-full px-3 py-2 border-2 border-warm-300 rounded-md text-sm outline-none focus:border-primary-500 transition-colors';
  return (
    <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 sm:p-8">
          <div className="flex items-start justify-between gap-4 mb-1">
            <div>
              <p className="text-[11px] font-semibold tracking-[0.3em] text-accent-600 uppercase mb-1">Outdoors · Bangalore</p>
              <h2 className="text-2xl font-extrabold text-warm-900">{existing ? 'Edit park' : 'Add a park'}</h2>
            </div>
            <button type="button" onClick={onClose} aria-label="Close" className="p-2 rounded-full text-warm-700 hover:text-warm-900 hover:bg-warm-100 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.25} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          <div className="h-0.5 w-12 bg-accent-400 rounded-full mb-5" />
          <form onSubmit={onSubmit} onKeyDown={suppressEnterSubmit} className="space-y-4">
            <label className="block">
              <span className="block text-sm font-semibold text-warm-900 mb-1">Park name {star}</span>
              <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Cubbon Park" className={inputCls} />
            </label>
            <label className="block">
              <span className="block text-sm font-semibold text-warm-900 mb-1">Locality {star}</span>
              <input type="text" required value={form.locality} onChange={(e) => setForm({ ...form, locality: e.target.value })} placeholder="e.g. Sampangi Rama Nagar, Bengaluru" className={inputCls} />
            </label>
            <label className="block">
              <span className="block text-sm font-semibold text-warm-900 mb-1">Full address {star}</span>
              <textarea required rows={2} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Street, area, city, PIN" className={`${inputCls} resize-y`} />
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="block">
                <span className="block text-sm font-semibold text-warm-900 mb-1">Open hours</span>
                <input type="text" value={form.hours ?? ''} onChange={(e) => setForm({ ...form, hours: e.target.value })} placeholder="e.g. 5 am to 8 pm" className={inputCls} />
              </label>
              <label className="block">
                <span className="block text-sm font-semibold text-warm-900 mb-1">Cost</span>
                <input type="text" value={form.cost ?? ''} onChange={(e) => setForm({ ...form, cost: e.target.value })} placeholder="e.g. Free to use" className={inputCls} />
              </label>
            </div>
            <label className="block">
              <span className="block text-sm font-semibold text-warm-900 mb-1">Off-leash policy</span>
              <input type="text" value={form.off_leash ?? ''} onChange={(e) => setForm({ ...form, off_leash: e.target.value })} placeholder="e.g. Yes, in designated areas" className={inputCls} />
            </label>
            <label className="block">
              <span className="block text-sm font-semibold text-warm-900 mb-1">Features / amenities</span>
              <input type="text" value={form.features ?? ''} onChange={(e) => setForm({ ...form, features: e.target.value })} placeholder="Walking trails, Playground, Restrooms" className={inputCls} />
              <span className="block text-xs text-warm-500 mt-1">Comma-separated list</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="block">
                <span className="block text-sm font-semibold text-warm-900 mb-1">Phone</span>
                <input type="tel" value={form.phone ?? ''} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+91 ..." className={inputCls} />
              </label>
              <label className="block">
                <span className="block text-sm font-semibold text-warm-900 mb-1">Email</span>
                <input type="email" value={form.email ?? ''} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="park@example.com" className={inputCls} />
              </label>
            </div>
            <label className="block">
              <span className="block text-sm font-semibold text-warm-900 mb-1">Website</span>
              <input type="url" value={form.website ?? ''} onChange={(e) => setForm({ ...form, website: e.target.value })} placeholder="https://..." className={inputCls} />
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="block">
                <span className="block text-sm font-semibold text-warm-900 mb-1">Rating (1–5)</span>
                <input type="number" min={1} max={5} value={form.rating} onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })} className={inputCls} />
              </label>
              <label className="block">
                <span className="block text-sm font-semibold text-warm-900 mb-1">Image URL</span>
                <input type="text" value={form.image_url ?? ''} onChange={(e) => setForm({ ...form, image_url: e.target.value })} placeholder="/parks/your-park.jpg" className={inputCls} />
              </label>
            </div>
            <label className="block">
              <span className="block text-sm font-semibold text-warm-900 mb-1">Highlights</span>
              <textarea rows={4} value={highlightsText} onChange={(e) => setHighlightsText(e.target.value)} placeholder="One per line, e.g. Off-leash zone in the morning" className={`${inputCls} resize-y`} />
              <span className="block text-xs text-warm-500 mt-1">One highlight per line</span>
            </label>
            <div className="pt-2 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
              <button type="button" onClick={onClose} className="px-5 py-2 rounded-full border-2 border-warm-300 text-warm-700 hover:bg-warm-100 text-sm font-semibold transition-colors">Cancel</button>
              <button type="submit" disabled={mutation.isPending} className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-accent-400 hover:bg-accent-300 disabled:opacity-60 disabled:cursor-not-allowed text-warm-900 text-sm font-bold tracking-[0.15em] uppercase ring-2 ring-accent-300/50 hover:ring-accent-200 transition-all shadow-md">{mutation.isPending ? (existing ? 'Saving…' : 'Adding…') : (existing ? 'Save' : 'Add')}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function AddSwimSchoolModal({ onClose, existing }: { onClose: () => void; existing?: SwimSchoolRead }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<SwimSchoolCreate>(
    existing
      ? {
          name: existing.name,
          locality: existing.locality,
          rating: existing.rating,
          image_url: existing.image_url ?? '',
          address: existing.address,
          hours: existing.hours ?? '',
          cost: existing.cost ?? '',
          pool_type: existing.pool_type ?? '',
          phone: existing.phone ?? '',
          email: existing.email ?? '',
          website: existing.website ?? '',
          highlights: existing.highlights ?? [],
        }
      : {
          name: '', locality: '', rating: 4, image_url: '', address: '',
          hours: '', cost: '', pool_type: '', phone: '', email: '', website: '', highlights: [],
        }
  );
  const [highlightsText, setHighlightsText] = useState(
    existing ? (existing.highlights ?? []).join('\n') : ''
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const mutation = useMutation({
    mutationFn: existing
      ? (data: SwimSchoolCreate) => updateSwimSchool(existing.id, data)
      : createSwimSchool,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['swim-schools'] });
      toast.success(existing ? 'Swim school updated.' : 'Swim school added — visible on the Swimming page now.');
      onClose();
    },
    onError: (err: Error) => toast.error(err.message || `Could not ${existing ? 'update' : 'add'} swim school.`),
  });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.locality.trim() || !form.address.trim()) {
      toast.error('Name, locality, and address are required.');
      return;
    }
    const highlights = highlightsText
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);
    mutation.mutate({
      name: form.name.trim(),
      locality: form.locality.trim(),
      rating: form.rating,
      image_url: form.image_url?.trim() || undefined,
      address: form.address.trim(),
      hours: form.hours?.trim() || undefined,
      cost: form.cost?.trim() || undefined,
      pool_type: form.pool_type?.trim() || undefined,
      phone: form.phone?.trim() || undefined,
      email: form.email?.trim() || undefined,
      website: form.website?.trim() || undefined,
      highlights,
    });
  };

  const star = <span className="text-red-500">*</span>;
  return (
    <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 sm:p-8">
          <div className="flex items-start justify-between gap-4 mb-1">
            <div>
              <p className="text-[11px] font-semibold tracking-[0.3em] text-accent-600 uppercase mb-1">Aquatic · Bangalore</p>
              <h2 className="text-2xl font-extrabold text-warm-900">{existing ? 'Edit swim school' : 'Add a swim school'}</h2>
            </div>
            <button type="button" onClick={onClose} aria-label="Close" className="p-2 rounded-full text-warm-700 hover:text-warm-900 hover:bg-warm-100 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.25} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          <div className="h-0.5 w-12 bg-accent-400 rounded-full mb-5" />
          <form onSubmit={onSubmit} onKeyDown={suppressEnterSubmit} className="space-y-4">
            <label className="block">
              <span className="block text-sm font-semibold text-warm-900 mb-1">Swim school name {star}</span>
              <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Indiranagar Aquatic Pet Centre" className="w-full px-3 py-2 border-2 border-warm-300 rounded-md text-sm outline-none focus:border-primary-500 transition-colors" />
            </label>
            <label className="block">
              <span className="block text-sm font-semibold text-warm-900 mb-1">Locality {star}</span>
              <input type="text" required value={form.locality} onChange={(e) => setForm({ ...form, locality: e.target.value })} placeholder="e.g. Indiranagar, Bengaluru" className="w-full px-3 py-2 border-2 border-warm-300 rounded-md text-sm outline-none focus:border-primary-500 transition-colors" />
            </label>
            <label className="block">
              <span className="block text-sm font-semibold text-warm-900 mb-1">Address {star}</span>
              <textarea required rows={2} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Street, area, city, PIN" className="w-full px-3 py-2 border-2 border-warm-300 rounded-md text-sm outline-none focus:border-primary-500 transition-colors resize-y" />
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="block">
                <span className="block text-sm font-semibold text-warm-900 mb-1">Rating (1–5)</span>
                <input type="number" min={1} max={5} value={form.rating} onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })} className="w-full px-3 py-2 border-2 border-warm-300 rounded-md text-sm outline-none focus:border-primary-500 transition-colors" />
              </label>
              <label className="block">
                <span className="block text-sm font-semibold text-warm-900 mb-1">Image URL</span>
                <input type="text" value={form.image_url ?? ''} onChange={(e) => setForm({ ...form, image_url: e.target.value })} placeholder="/swim/swim7.jpg" className="w-full px-3 py-2 border-2 border-warm-300 rounded-md text-sm outline-none focus:border-primary-500 transition-colors" />
              </label>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="block">
                <span className="block text-sm font-semibold text-warm-900 mb-1">Open hours</span>
                <input type="text" value={form.hours ?? ''} onChange={(e) => setForm({ ...form, hours: e.target.value })} placeholder="e.g. 7 am to 9 pm" className="w-full px-3 py-2 border-2 border-warm-300 rounded-md text-sm outline-none focus:border-primary-500 transition-colors" />
              </label>
              <label className="block">
                <span className="block text-sm font-semibold text-warm-900 mb-1">Cost</span>
                <input type="text" value={form.cost ?? ''} onChange={(e) => setForm({ ...form, cost: e.target.value })} placeholder="e.g. ₹600 / 30-min session" className="w-full px-3 py-2 border-2 border-warm-300 rounded-md text-sm outline-none focus:border-primary-500 transition-colors" />
              </label>
            </div>
            <label className="block">
              <span className="block text-sm font-semibold text-warm-900 mb-1">Pool type</span>
              <input type="text" value={form.pool_type ?? ''} onChange={(e) => setForm({ ...form, pool_type: e.target.value })} placeholder="e.g. Heated indoor pool" className="w-full px-3 py-2 border-2 border-warm-300 rounded-md text-sm outline-none focus:border-primary-500 transition-colors" />
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="block">
                <span className="block text-sm font-semibold text-warm-900 mb-1">Phone</span>
                <input type="tel" value={form.phone ?? ''} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+91 ..." className="w-full px-3 py-2 border-2 border-warm-300 rounded-md text-sm outline-none focus:border-primary-500 transition-colors" />
              </label>
              <label className="block">
                <span className="block text-sm font-semibold text-warm-900 mb-1">Email</span>
                <input type="email" value={form.email ?? ''} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="pool@example.com" className="w-full px-3 py-2 border-2 border-warm-300 rounded-md text-sm outline-none focus:border-primary-500 transition-colors" />
              </label>
            </div>
            <label className="block">
              <span className="block text-sm font-semibold text-warm-900 mb-1">Website</span>
              <input type="url" value={form.website ?? ''} onChange={(e) => setForm({ ...form, website: e.target.value })} placeholder="https://..." className="w-full px-3 py-2 border-2 border-warm-300 rounded-md text-sm outline-none focus:border-primary-500 transition-colors" />
            </label>
            <label className="block">
              <span className="block text-sm font-semibold text-warm-900 mb-1">Highlights</span>
              <textarea rows={4} value={highlightsText} onChange={(e) => setHighlightsText(e.target.value)} placeholder="One per line, e.g. Heated pool" className="w-full px-3 py-2 border-2 border-warm-300 rounded-md text-sm outline-none focus:border-primary-500 transition-colors resize-y" />
              <span className="block text-xs text-warm-500 mt-1">One highlight per line</span>
            </label>
            <div className="pt-2 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
              <button type="button" onClick={onClose} className="px-5 py-2 rounded-full border-2 border-warm-300 text-warm-700 hover:bg-warm-100 text-sm font-semibold transition-colors">Cancel</button>
              <button type="submit" disabled={mutation.isPending} className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-accent-400 hover:bg-accent-300 disabled:opacity-60 disabled:cursor-not-allowed text-warm-900 text-sm font-bold tracking-[0.15em] uppercase ring-2 ring-accent-300/50 hover:ring-accent-200 transition-all shadow-md">{mutation.isPending ? (existing ? 'Saving…' : 'Adding…') : (existing ? 'Save' : 'Add')}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function AddGroomingSalonModal({ onClose, existing }: { onClose: () => void; existing?: GroomingSalonRead }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<GroomingSalonCreate>(
    existing
      ? {
          name: existing.name,
          area: existing.area,
          city: existing.city,
          state: existing.state,
          address: existing.address,
          phone: existing.phone,
          rating_avg: existing.rating_avg,
          rating_count: existing.rating_count,
          tint: existing.tint,
          hero_emoji: existing.hero_emoji,
          image_url: existing.image_url ?? '',
          hours: existing.hours ?? '',
          email: existing.email ?? '',
          website: existing.website ?? '',
        }
      : {
          name: '', area: '', city: 'Bengaluru', state: 'KA', address: '', phone: '',
          rating_avg: 4.5, rating_count: 0, tint: 'from-amber-200 to-amber-400', hero_emoji: '✂️',
          image_url: '', hours: '', email: '', website: '',
        }
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const mutation = useMutation({
    mutationFn: existing
      ? (data: GroomingSalonCreate) => updateGroomingSalon(existing.id, data)
      : createGroomingSalon,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['grooming-salons'] });
      toast.success(existing ? 'Salon updated.' : 'Salon added — visible on the Grooming page now.');
      onClose();
    },
    onError: (err: Error) => toast.error(err.message || `Could not ${existing ? 'update' : 'add'} salon.`),
  });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.area.trim() || !form.address.trim() || !form.phone.trim()) {
      toast.error('Name, area, address, and phone are required.');
      return;
    }
    mutation.mutate({
      name: form.name.trim(),
      area: form.area.trim(),
      city: (form.city || '').trim() || 'Bengaluru',
      state: (form.state || '').trim() || 'KA',
      address: form.address.trim(),
      phone: form.phone.trim(),
      rating_avg: form.rating_avg ?? 4.5,
      rating_count: form.rating_count ?? 0,
      tint: (form.tint || '').trim() || 'from-amber-200 to-amber-400',
      hero_emoji: (form.hero_emoji || '').trim() || '✂️',
      image_url: (form.image_url || '').trim() || null,
      hours: (form.hours || '').trim() || null,
      email: (form.email || '').trim() || null,
      website: (form.website || '').trim() || null,
    });
  };

  const star = <span className="text-red-500">*</span>;
  return (
    <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 sm:p-8">
          <div className="flex items-start justify-between gap-4 mb-1">
            <div>
              <p className="text-[11px] font-semibold tracking-[0.3em] text-accent-600 uppercase mb-1">Salons · Bangalore</p>
              <h2 className="text-2xl font-extrabold text-warm-900">{existing ? 'Edit salon' : 'Add a salon'}</h2>
            </div>
            <button type="button" onClick={onClose} aria-label="Close" className="p-2 rounded-full text-warm-700 hover:text-warm-900 hover:bg-warm-100 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.25} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          <div className="h-0.5 w-12 bg-accent-400 rounded-full mb-5" />
          <form onSubmit={onSubmit} onKeyDown={suppressEnterSubmit} className="space-y-4">
            <label className="block">
              <span className="block text-sm font-semibold text-warm-900 mb-1">Salon name {star}</span>
              <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Pawsh Paws Grooming Studio" className="w-full px-3 py-2 border-2 border-warm-300 rounded-md text-sm outline-none focus:border-primary-500 transition-colors" />
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="block">
                <span className="block text-sm font-semibold text-warm-900 mb-1">Area {star}</span>
                <select required value={form.area} onChange={(e) => setForm({ ...form, area: e.target.value })} className={`w-full px-3 py-2 border-2 border-warm-300 rounded-md text-sm outline-none focus:border-primary-500 transition-colors bg-white ${form.area ? 'text-warm-900' : 'text-warm-400'}`}>
                  <option value="" disabled>Pick an area</option>
                  {BANGALORE_NEIGHBOURHOODS.map((n) => <option key={n} value={n} className="text-warm-900">{n}</option>)}
                </select>
              </label>
              <label className="block">
                <span className="block text-sm font-semibold text-warm-900 mb-1">City</span>
                <input type="text" value={form.city ?? ''} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="Bengaluru" className="w-full px-3 py-2 border-2 border-warm-300 rounded-md text-sm outline-none focus:border-primary-500 transition-colors" />
              </label>
            </div>
            <label className="block">
              <span className="block text-sm font-semibold text-warm-900 mb-1">Address {star}</span>
              <textarea required rows={2} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Street, area, city, PIN" className="w-full px-3 py-2 border-2 border-warm-300 rounded-md text-sm outline-none focus:border-primary-500 transition-colors resize-y" />
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="block">
                <span className="block text-sm font-semibold text-warm-900 mb-1">Phone {star}</span>
                <input type="tel" required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+91 80 ..." className="w-full px-3 py-2 border-2 border-warm-300 rounded-md text-sm outline-none focus:border-primary-500 transition-colors" />
              </label>
              <label className="block">
                <span className="block text-sm font-semibold text-warm-900 mb-1">Avg rating (0–5)</span>
                <input type="number" min={0} max={5} step={0.1} value={form.rating_avg ?? 4.5} onChange={(e) => setForm({ ...form, rating_avg: Number(e.target.value) })} className="w-full px-3 py-2 border-2 border-warm-300 rounded-md text-sm outline-none focus:border-primary-500 transition-colors" />
              </label>
            </div>
            <label className="block">
              <span className="block text-sm font-semibold text-warm-900 mb-1">Image URL</span>
              <input type="text" value={form.image_url ?? ''} onChange={(e) => setForm({ ...form, image_url: e.target.value })} placeholder="/groom/your-salon.jpg" className="w-full px-3 py-2 border-2 border-warm-300 rounded-md text-sm outline-none focus:border-primary-500 transition-colors" />
            </label>
            <label className="block">
              <span className="block text-sm font-semibold text-warm-900 mb-1">Open hours</span>
              <input type="text" value={form.hours ?? ''} onChange={(e) => setForm({ ...form, hours: e.target.value })} placeholder="e.g. 8 am to 9 pm, daily" className="w-full px-3 py-2 border-2 border-warm-300 rounded-md text-sm outline-none focus:border-primary-500 transition-colors" />
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="block">
                <span className="block text-sm font-semibold text-warm-900 mb-1">Email</span>
                <input type="email" value={form.email ?? ''} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="salon@example.com" className="w-full px-3 py-2 border-2 border-warm-300 rounded-md text-sm outline-none focus:border-primary-500 transition-colors" />
              </label>
              <label className="block">
                <span className="block text-sm font-semibold text-warm-900 mb-1">Website</span>
                <input type="url" value={form.website ?? ''} onChange={(e) => setForm({ ...form, website: e.target.value })} placeholder="https://..." className="w-full px-3 py-2 border-2 border-warm-300 rounded-md text-sm outline-none focus:border-primary-500 transition-colors" />
              </label>
            </div>
            <div className="pt-2 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
              <button type="button" onClick={onClose} className="px-5 py-2 rounded-full border-2 border-warm-300 text-warm-700 hover:bg-warm-100 text-sm font-semibold transition-colors">Cancel</button>
              <button type="submit" disabled={mutation.isPending} className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-accent-400 hover:bg-accent-300 disabled:opacity-60 disabled:cursor-not-allowed text-warm-900 text-sm font-bold tracking-[0.15em] uppercase ring-2 ring-accent-300/50 hover:ring-accent-200 transition-all shadow-md">{mutation.isPending ? (existing ? 'Saving…' : 'Adding…') : (existing ? 'Save' : 'Add')}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function AddPetFoodModal({ onClose, existing }: { onClose: () => void; existing?: PetFoodRead }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<PetFoodCreate>(
    existing
      ? {
          brand: existing.brand,
          name: existing.name,
          image_url: existing.image_url ?? '',
          emoji: existing.emoji,
          rating: existing.rating,
          reviews: existing.reviews,
          price: existing.price,
          per_unit: existing.per_unit,
          list_price: existing.list_price,
          sale_price: existing.sale_price,
          save_pct: existing.save_pct,
          sponsored: existing.sponsored,
          deal: existing.deal,
          lifestage: existing.lifestage ?? '',
          form: existing.form ?? '',
        }
      : {
          brand: '', name: '', image_url: '', emoji: '🥫',
          rating: 4.5, reviews: 0, price: 0, per_unit: '',
          list_price: null, sale_price: null, save_pct: null,
          sponsored: false, deal: false, lifestage: '', form: '',
        }
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const mutation = useMutation({
    mutationFn: existing
      ? (data: PetFoodCreate) => updatePetFood(existing.id, data)
      : createPetFood,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pet-foods'] });
      toast.success(existing ? 'Pet food updated.' : 'Pet food added — visible on Pet Supplies now.');
      onClose();
    },
    onError: (err: Error) => toast.error(err.message || `Could not ${existing ? 'update' : 'add'} pet food.`),
  });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.brand.trim() || !form.name.trim() || form.price <= 0) {
      toast.error('Brand, product name, and a price greater than zero are required.');
      return;
    }
    mutation.mutate({
      brand: form.brand.trim(),
      name: form.name.trim(),
      image_url: form.image_url?.trim() || null,
      emoji: (form.emoji ?? '🥫').trim() || '🥫',
      rating: form.rating,
      reviews: form.reviews,
      price: form.price,
      per_unit: form.per_unit?.trim() || '—',
      list_price: form.list_price && form.list_price > 0 ? form.list_price : null,
      sale_price: form.sale_price && form.sale_price > 0 ? form.sale_price : null,
      save_pct: form.save_pct && form.save_pct > 0 ? form.save_pct : null,
      sponsored: form.sponsored,
      deal: form.deal,
      lifestage: form.lifestage?.trim() || null,
      form: form.form?.trim() || null,
    });
  };

  const star = <span className="text-red-500">*</span>;
  const inputCls = 'w-full px-3 py-2 border-2 border-warm-300 rounded-md text-sm outline-none focus:border-primary-500 transition-colors';
  return (
    <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 sm:p-8">
          <div className="flex items-start justify-between gap-4 mb-1">
            <div>
              <p className="text-[11px] font-semibold tracking-[0.3em] text-accent-600 uppercase mb-1">Shop · Bangalore</p>
              <h2 className="text-2xl font-extrabold text-warm-900">{existing ? 'Edit pet food' : 'Add a pet food product'}</h2>
            </div>
            <button type="button" onClick={onClose} aria-label="Close" className="p-2 rounded-full text-warm-700 hover:text-warm-900 hover:bg-warm-100 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.25} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          <div className="h-0.5 w-12 bg-accent-400 rounded-full mb-5" />
          <form onSubmit={onSubmit} onKeyDown={suppressEnterSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-[1fr_80px] gap-4">
              <label className="block">
                <span className="block text-sm font-semibold text-warm-900 mb-1">Brand {star}</span>
                <input type="text" required value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} placeholder="e.g. Royal Canin" className={inputCls} />
              </label>
              <label className="block">
                <span className="block text-sm font-semibold text-warm-900 mb-1">Emoji</span>
                <input type="text" value={form.emoji ?? ''} onChange={(e) => setForm({ ...form, emoji: e.target.value })} placeholder="🥫" className={`${inputCls} text-center text-lg`} />
              </label>
            </div>

            <label className="block">
              <span className="block text-sm font-semibold text-warm-900 mb-1">Product name / description {star}</span>
              <textarea required rows={2} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Size Health Nutrition Medium Adult Dry Dog Food, 7-kg bag" className={`${inputCls} resize-y`} />
            </label>

            <label className="block">
              <span className="block text-sm font-semibold text-warm-900 mb-1">Image URL</span>
              <input type="text" value={form.image_url ?? ''} onChange={(e) => setForm({ ...form, image_url: e.target.value })} placeholder="/supplies-9.jpg or https://..." className={inputCls} />
              <span className="block text-xs text-warm-500 mt-1">Leave blank to fall back to the emoji card.</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="block">
                <span className="block text-sm font-semibold text-warm-900 mb-1">Price (₹) {star}</span>
                <input type="number" required min={1} value={form.price || ''} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} placeholder="2499" className={inputCls} />
              </label>
              <label className="block">
                <span className="block text-sm font-semibold text-warm-900 mb-1">Per-unit label</span>
                <input type="text" value={form.per_unit} onChange={(e) => setForm({ ...form, per_unit: e.target.value })} placeholder="₹360/kg" className={inputCls} />
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <label className="block">
                <span className="block text-sm font-semibold text-warm-900 mb-1">List price (₹)</span>
                <input type="number" min={0} value={form.list_price ?? ''} onChange={(e) => setForm({ ...form, list_price: e.target.value === '' ? null : Number(e.target.value) })} placeholder="2599" className={inputCls} />
              </label>
              <label className="block">
                <span className="block text-sm font-semibold text-warm-900 mb-1">Autoship price (₹)</span>
                <input type="number" min={0} value={form.sale_price ?? ''} onChange={(e) => setForm({ ...form, sale_price: e.target.value === '' ? null : Number(e.target.value) })} placeholder="1599" className={inputCls} />
              </label>
              <label className="block">
                <span className="block text-sm font-semibold text-warm-900 mb-1">Save %</span>
                <input type="number" min={0} max={100} value={form.save_pct ?? ''} onChange={(e) => setForm({ ...form, save_pct: e.target.value === '' ? null : Number(e.target.value) })} placeholder="35" className={inputCls} />
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="block">
                <span className="block text-sm font-semibold text-warm-900 mb-1">Rating (0–5)</span>
                <input type="number" min={0} max={5} step={0.1} value={form.rating} onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })} className={inputCls} />
              </label>
              <label className="block">
                <span className="block text-sm font-semibold text-warm-900 mb-1">Review count</span>
                <input type="number" min={0} value={form.reviews} onChange={(e) => setForm({ ...form, reviews: Number(e.target.value) })} placeholder="8098" className={inputCls} />
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="block">
                <span className="block text-sm font-semibold text-warm-900 mb-1">Lifestage</span>
                <select value={form.lifestage ?? ''} onChange={(e) => setForm({ ...form, lifestage: e.target.value })} className={`${inputCls} bg-white ${form.lifestage ? 'text-warm-900' : 'text-warm-400'}`}>
                  <option value="">— Not specified —</option>
                  {PET_FOOD_LIFESTAGES.map((l) => <option key={l} value={l} className="text-warm-900">{l}</option>)}
                </select>
              </label>
              <label className="block">
                <span className="block text-sm font-semibold text-warm-900 mb-1">Food form</span>
                <select value={form.form ?? ''} onChange={(e) => setForm({ ...form, form: e.target.value })} className={`${inputCls} bg-white ${form.form ? 'text-warm-900' : 'text-warm-400'}`}>
                  <option value="">— Not specified —</option>
                  {PET_FOOD_FORMS.map((f) => <option key={f} value={f} className="text-warm-900">{f}</option>)}
                </select>
              </label>
            </div>

            <div className="flex flex-wrap gap-4 pt-1">
              <label className="inline-flex items-center gap-2 text-sm text-warm-800 cursor-pointer">
                <input type="checkbox" checked={form.sponsored} onChange={(e) => setForm({ ...form, sponsored: e.target.checked })} className="w-4 h-4 accent-primary-600 cursor-pointer" />
                Sponsored
              </label>
              <label className="inline-flex items-center gap-2 text-sm text-warm-800 cursor-pointer">
                <input type="checkbox" checked={form.deal} onChange={(e) => setForm({ ...form, deal: e.target.checked })} className="w-4 h-4 accent-primary-600 cursor-pointer" />
                Show "Deal" badge
              </label>
            </div>

            <div className="pt-2 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
              <button type="button" onClick={onClose} className="px-5 py-2 rounded-full border-2 border-warm-300 text-warm-700 hover:bg-warm-100 text-sm font-semibold transition-colors">Cancel</button>
              <button type="submit" disabled={mutation.isPending} className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-accent-400 hover:bg-accent-300 disabled:opacity-60 disabled:cursor-not-allowed text-warm-900 text-sm font-bold tracking-[0.15em] uppercase ring-2 ring-accent-300/50 hover:ring-accent-200 transition-all shadow-md">{mutation.isPending ? (existing ? 'Saving…' : 'Adding…') : (existing ? 'Save' : 'Add')}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Bulk Excel import (Hospital / Park / Swim School)
// ---------------------------------------------------------------------------

type ImportColumn = { header: string; required?: boolean; hint?: string };

type ImportConfig = {
  kind: 'hospital' | 'park' | 'swimming' | 'grooming';
  title: string;
  eyebrow: string;
  templateFile: string;
  columns: ImportColumn[];
  sample: Record<string, string>;
  queryKey: readonly unknown[];
  // Validate one sheet row and create it. Throws Error(message) on a bad row;
  // returns a short label (the created item's name) on success.
  importRow: (row: SheetRow) => Promise<string>;
};

function reqCell(row: SheetRow, key: string): string {
  const v = (row[key] ?? '').trim();
  if (!v) throw new Error(`Missing required "${key}"`);
  return v;
}
function optCell(row: SheetRow, key: string): string | undefined {
  const v = (row[key] ?? '').trim();
  return v || undefined;
}
function parseRating(row: SheetRow): number {
  const raw = (row['Rating'] ?? '').trim();
  if (!raw) return 4;
  const n = Number(raw);
  if (Number.isNaN(n)) throw new Error(`Rating "${raw}" is not a number`);
  return Math.max(1, Math.min(5, Math.round(n)));
}
function parseHighlights(row: SheetRow): string[] {
  return (row['Highlights'] ?? '')
    .split('|')
    .map((h) => h.trim())
    .filter(Boolean);
}

const IMPORT_CONFIGS: Record<ImportConfig['kind'], ImportConfig> = {
  hospital: {
    kind: 'hospital',
    title: 'Bulk import hospitals',
    eyebrow: 'Vet Care · Bangalore',
    templateFile: 'hispike-hospitals-template.xlsx',
    columns: [
      { header: 'Name', required: true },
      { header: 'Locality', required: true },
      { header: 'Address', required: true },
      { header: 'Phone', required: true },
      { header: 'Specialties', hint: 'comma-separated' },
      { header: 'Rating', hint: 'e.g. 4.7' },
      { header: 'Email' },
      { header: 'Open hours' },
      { header: 'Website' },
    ],
    sample: {
      Name: 'SKS Veterinary Hospital',
      Locality: 'Indiranagar',
      Address: '17 Service Rd, HAL 3rd Stage, Bengaluru 560075',
      Phone: '+91 80 4000 0000',
      Specialties: 'General, Surgery, Diagnostics',
      Rating: '4.7',
      Email: 'care@sksvet.in',
      'Open hours': '9 am to 9 pm, daily',
      Website: 'https://example.com',
    },
    queryKey: ['hospitals'],
    importRow: async (row) => {
      const created = await createHospital({
        name: reqCell(row, 'Name'),
        locality: reqCell(row, 'Locality'),
        address: reqCell(row, 'Address'),
        phone: reqCell(row, 'Phone'),
        specialties: optCell(row, 'Specialties'),
        rating: optCell(row, 'Rating'),
        email: optCell(row, 'Email'),
        hours: optCell(row, 'Open hours'),
        website: optCell(row, 'Website'),
      });
      return created.name;
    },
  },
  park: {
    kind: 'park',
    title: 'Bulk import parks',
    eyebrow: 'Outdoors · Bangalore',
    templateFile: 'hispike-parks-template.xlsx',
    columns: [
      { header: 'Name', required: true },
      { header: 'Locality', required: true },
      { header: 'Address', required: true },
      { header: 'Rating', hint: '1–5' },
      { header: 'Cost' },
      { header: 'Off-leash' },
      { header: 'Features', hint: 'comma-separated' },
      { header: 'Open hours' },
      { header: 'Phone' },
      { header: 'Email' },
      { header: 'Website' },
      { header: 'Image URL' },
      { header: 'Highlights', hint: 'separate with |' },
    ],
    sample: {
      Name: 'Cubbon Park',
      Locality: 'Sampangi Rama Nagar, Bengaluru',
      Address: 'Kasturba Road, Bengaluru 560001',
      Rating: '5',
      Cost: 'Free to use',
      'Off-leash': 'Yes, in designated areas',
      Features: 'Walking trails, Playground, Restrooms',
      'Open hours': '5 am to 8 pm',
      Phone: '+91 80 1234 5678',
      Email: 'info@cubbonpark.in',
      Website: 'https://example.com',
      'Image URL': '/parks/cubbon-park.jpg',
      Highlights: 'Off-leash zone in the morning|Shaded benches|Street parking',
    },
    queryKey: ['parks'],
    importRow: async (row) => {
      const created = await createPark({
        name: reqCell(row, 'Name'),
        locality: reqCell(row, 'Locality'),
        address: reqCell(row, 'Address'),
        rating: parseRating(row),
        cost: optCell(row, 'Cost'),
        off_leash: optCell(row, 'Off-leash'),
        features: optCell(row, 'Features'),
        hours: optCell(row, 'Open hours'),
        phone: optCell(row, 'Phone'),
        email: optCell(row, 'Email'),
        website: optCell(row, 'Website'),
        image_url: optCell(row, 'Image URL'),
        highlights: parseHighlights(row),
      });
      return created.name;
    },
  },
  swimming: {
    kind: 'swimming',
    title: 'Bulk import swim schools',
    eyebrow: 'Aquatic · Bangalore',
    templateFile: 'hispike-swim-schools-template.xlsx',
    columns: [
      { header: 'Name', required: true },
      { header: 'Locality', required: true },
      { header: 'Address', required: true },
      { header: 'Rating', hint: '1–5' },
      { header: 'Pool type' },
      { header: 'Cost' },
      { header: 'Open hours' },
      { header: 'Phone' },
      { header: 'Email' },
      { header: 'Website' },
      { header: 'Image URL' },
      { header: 'Highlights', hint: 'separate with |' },
    ],
    sample: {
      Name: 'Indiranagar Aquatic Pet Centre',
      Locality: 'Indiranagar, Bengaluru',
      Address: '12, 100 Feet Rd, Indiranagar, Bengaluru 560038',
      Rating: '5',
      'Pool type': 'Heated indoor pool',
      Cost: '₹600 per 30-min session',
      'Open hours': '7 am to 9 pm',
      Phone: '+91 80 4123 1816',
      Email: 'swim@example.in',
      Website: 'https://example.com',
      'Image URL': '/swim/swim1.jpg',
      Highlights: 'Certified coaches|Life-jacket rental|Small-batch sessions',
    },
    queryKey: ['swim-schools'],
    importRow: async (row) => {
      const created = await createSwimSchool({
        name: reqCell(row, 'Name'),
        locality: reqCell(row, 'Locality'),
        address: reqCell(row, 'Address'),
        rating: parseRating(row),
        pool_type: optCell(row, 'Pool type'),
        cost: optCell(row, 'Cost'),
        hours: optCell(row, 'Open hours'),
        phone: optCell(row, 'Phone'),
        email: optCell(row, 'Email'),
        website: optCell(row, 'Website'),
        image_url: optCell(row, 'Image URL'),
        highlights: parseHighlights(row),
      });
      return created.name;
    },
  },
  grooming: {
    kind: 'grooming',
    title: 'Bulk import grooming salons',
    eyebrow: 'Salons · Bangalore',
    templateFile: 'hispike-grooming-salons-template.xlsx',
    columns: [
      { header: 'Name', required: true },
      { header: 'Area', required: true },
      { header: 'City' },
      { header: 'Address', required: true },
      { header: 'Phone', required: true },
      { header: 'Rating', hint: '0–5, e.g. 4.7' },
      { header: 'Open hours' },
      { header: 'Email' },
      { header: 'Website' },
      { header: 'Image URL' },
    ],
    sample: {
      Name: 'Pawsh Paws Grooming Studio',
      Area: 'Indiranagar',
      City: 'Bengaluru',
      Address: '100 Feet Rd, HAL 2nd Stage, Indiranagar, Bengaluru 560038',
      Phone: '+91 80 4123 1816',
      Rating: '4.7',
      'Open hours': '8 am to 9 pm, daily',
      Email: 'hello@pawshpaws.in',
      Website: 'https://example.com',
      'Image URL': '/groom/groom1.jpg',
    },
    queryKey: ['grooming-salons'],
    importRow: async (row) => {
      const ratingRaw = (row['Rating'] ?? '').trim();
      let ratingAvg = 4.5;
      if (ratingRaw) {
        const n = Number(ratingRaw);
        if (Number.isNaN(n)) throw new Error(`Rating "${ratingRaw}" is not a number`);
        ratingAvg = Math.max(0, Math.min(5, n));
      }
      const created = await createGroomingSalon({
        name: reqCell(row, 'Name'),
        area: reqCell(row, 'Area'),
        city: optCell(row, 'City') ?? 'Bengaluru',
        address: reqCell(row, 'Address'),
        phone: reqCell(row, 'Phone'),
        rating_avg: ratingAvg,
        hours: optCell(row, 'Open hours'),
        email: optCell(row, 'Email'),
        website: optCell(row, 'Website'),
        image_url: optCell(row, 'Image URL'),
      });
      return created.name;
    },
  },
};

type ImportResult = { row: number; ok: boolean; label?: string; error?: string };

function ImportExcelModal({ config, onClose }: { config: ImportConfig; onClose: () => void }) {
  const queryClient = useQueryClient();
  const [phase, setPhase] = useState<'idle' | 'running' | 'done'>('idle');
  const [results, setResults] = useState<ImportResult[]>([]);
  const [progress, setProgress] = useState({ done: 0, total: 0 });

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape' && phase !== 'running') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, phase]);

  const isBlankRow = (row: SheetRow) => Object.values(row).every((v) => !v || !v.trim());

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // allow re-selecting the same file later
    if (!file) return;
    setPhase('running');
    setResults([]);
    let rows: SheetRow[];
    try {
      rows = (await readSheetRows(file)).filter((r) => !isBlankRow(r));
    } catch {
      toast.error('Could not read that file. Make sure it is a valid .xlsx or .csv.');
      setPhase('idle');
      return;
    }
    if (rows.length === 0) {
      toast.error('No data rows found in the sheet.');
      setPhase('idle');
      return;
    }

    setProgress({ done: 0, total: rows.length });
    const collected: ImportResult[] = [];
    // Sequential — keeps a free-tier backend from being hammered, and makes
    // the progress counter meaningful.
    for (let i = 0; i < rows.length; i++) {
      try {
        const label = await config.importRow(rows[i]);
        collected.push({ row: i + 2, ok: true, label }); // +2: header row + 1-indexed
      } catch (err) {
        collected.push({ row: i + 2, ok: false, error: err instanceof Error ? err.message : 'Failed' });
      }
      setProgress({ done: i + 1, total: rows.length });
      setResults([...collected]);
    }

    queryClient.invalidateQueries({ queryKey: config.queryKey });
    setPhase('done');
    const ok = collected.filter((r) => r.ok).length;
    const failed = collected.length - ok;
    if (failed === 0) toast.success(`Imported all ${ok} rows.`);
    else toast.error(`Imported ${ok}, ${failed} row${failed === 1 ? '' : 's'} failed — see details.`);
  };

  const okCount = results.filter((r) => r.ok).length;
  const failCount = results.filter((r) => !r.ok).length;

  return (
    <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onMouseDown={(e) => { if (e.target === e.currentTarget && phase !== 'running') onClose(); }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 sm:p-8">
          <div className="flex items-start justify-between gap-4 mb-1">
            <div>
              <p className="text-[11px] font-semibold tracking-[0.3em] text-accent-600 uppercase mb-1">{config.eyebrow}</p>
              <h2 className="text-2xl font-extrabold text-warm-900">{config.title}</h2>
            </div>
            <button type="button" onClick={onClose} disabled={phase === 'running'} aria-label="Close" className="p-2 rounded-full text-warm-700 hover:text-warm-900 hover:bg-warm-100 transition-colors disabled:opacity-40">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.25} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          <div className="h-0.5 w-12 bg-accent-400 rounded-full mb-5" />

          <ol className="text-sm text-warm-700 space-y-1.5 mb-5 list-decimal pl-5">
            <li>Download the template and fill one row per listing.</li>
            <li>Columns marked <span className="text-red-500 font-semibold">*</span> are required.</li>
            <li>Upload the saved .xlsx — every row is created and you get a per-row result.</li>
          </ol>

          <div className="flex flex-wrap items-center gap-3 mb-5">
            <button
              type="button"
              onClick={() => downloadTemplate(config.templateFile, config.columns.map((c) => c.header), config.sample)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border-2 border-primary-300 text-primary-700 text-sm font-bold tracking-wider uppercase hover:border-primary-500 hover:bg-primary-50 transition-colors"
            >
              ⬇ Download template
            </button>
            <label className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-accent-400 hover:bg-accent-300 text-warm-900 text-sm font-bold tracking-wider uppercase ring-2 ring-accent-300/50 transition-all shadow-md cursor-pointer ${phase === 'running' ? 'opacity-60 pointer-events-none' : ''}`}>
              ⬆ Upload .xlsx
              <input type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={handleFile} disabled={phase === 'running'} />
            </label>
          </div>

          {/* Column reference */}
          <div className="rounded-xl bg-warm-50 border border-warm-200 p-3 mb-5">
            <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-warm-500 mb-2">Columns</p>
            <div className="flex flex-wrap gap-1.5">
              {config.columns.map((c) => (
                <span key={c.header} className="inline-flex items-center gap-1 text-xs bg-white border border-warm-200 rounded-md px-2 py-1 text-warm-700">
                  {c.header}{c.required && <span className="text-red-500 font-bold">*</span>}
                  {c.hint && <span className="text-warm-400">· {c.hint}</span>}
                </span>
              ))}
            </div>
          </div>

          {phase === 'running' && (
            <p className="text-sm text-warm-600 mb-3">Importing… {progress.done}/{progress.total}</p>
          )}

          {results.length > 0 && (
            <div>
              <div className="flex items-center gap-3 text-sm font-semibold mb-2">
                <span className="text-emerald-700">✓ {okCount} added</span>
                {failCount > 0 && <span className="text-red-600">✕ {failCount} failed</span>}
              </div>
              <ul className="max-h-48 overflow-y-auto rounded-xl border border-warm-200 divide-y divide-warm-100 text-sm">
                {results.map((r) => (
                  <li key={r.row} className="flex items-start gap-2 px-3 py-2">
                    <span className={`shrink-0 font-bold ${r.ok ? 'text-emerald-600' : 'text-red-600'}`}>{r.ok ? '✓' : '✕'}</span>
                    <span className="text-warm-500 shrink-0">Row {r.row}</span>
                    <span className={`min-w-0 break-words ${r.ok ? 'text-warm-800' : 'text-red-700'}`}>
                      {r.ok ? r.label : r.error}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="pt-5 flex justify-end">
            <button type="button" onClick={onClose} disabled={phase === 'running'} className="px-5 py-2 rounded-full border-2 border-warm-300 text-warm-700 hover:bg-warm-100 text-sm font-semibold transition-colors disabled:opacity-40">
              {phase === 'done' ? 'Done' : 'Close'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

type ModalState =
  | { kind: ListingKind; action: 'add' | 'edit' | 'remove' | 'import' }
  | { kind: 'hospital'; action: 'edit-form'; existing: HospitalRead }
  | { kind: 'park';     action: 'edit-form'; existing: ParkRead }
  | { kind: 'swimming'; action: 'edit-form'; existing: SwimSchoolRead }
  | { kind: 'grooming'; action: 'edit-form'; existing: GroomingSalonRead }
  | { kind: 'food';     action: 'edit-form'; existing: PetFoodRead };

function AddListingsSection() {
  const [openModal, setOpenModal] = useState<ModalState | null>(null);

  const handleClick = (kind: ListingKind, action: ListingAction) => {
    setOpenModal({ kind, action });
  };

  const renderRow = (cards: ListingCard[]) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      {cards.map(({ label, emoji, kind, action, tint }) => (
        <button
          key={`${action}-${kind}`}
          type="button"
          onClick={() => handleClick(kind, action)}
          className="group rounded-xl border-2 border-primary-100 bg-white hover:border-primary-300 hover:shadow-sm transition-all flex items-center gap-3 px-3 py-2 text-left"
        >
          <span
            aria-hidden="true"
            className={`shrink-0 w-9 h-9 rounded-lg bg-gradient-to-br ${tint} flex items-center justify-center text-base`}
          >
            {emoji}
          </span>
          <span className="flex-1 min-w-0 text-sm font-semibold text-warm-900 group-hover:text-primary-700 transition-colors truncate">
            {label}
          </span>
          <span className={`shrink-0 ${
            action === 'remove'
              ? 'text-red-400 group-hover:text-red-600'
              : action === 'edit'
              ? 'text-primary-400 group-hover:text-primary-700'
              : action === 'import'
              ? 'text-emerald-500 group-hover:text-emerald-700'
              : 'text-warm-400 group-hover:text-primary-600'
          } transition-colors`}>
            {action === 'remove' ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M9 7V4a2 2 0 012-2h2a2 2 0 012 2v3" />
              </svg>
            ) : action === 'edit' ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            ) : action === 'import' ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 15V3" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
            )}
          </span>
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
        {renderRow(EDIT_LISTING_CARDS)}
        {renderRow(REMOVE_LISTING_CARDS)}
      </div>

      <div className="mt-6 pt-5 border-t border-warm-200">
        <p className="text-sm font-semibold text-warm-700 mb-3">
          Bulk import from Excel
          <span className="ml-2 text-xs font-normal text-warm-500">— add many at once via a spreadsheet</span>
        </p>
        {renderRow(IMPORT_LISTING_CARDS)}
      </div>

      {openModal?.action === 'import' && (openModal.kind === 'hospital' || openModal.kind === 'park' || openModal.kind === 'swimming' || openModal.kind === 'grooming') && (
        <ImportExcelModal config={IMPORT_CONFIGS[openModal.kind]} onClose={() => setOpenModal(null)} />
      )}

      {openModal?.action === 'add' && openModal.kind === 'hospital' && (
        <AddHospitalModal onClose={() => setOpenModal(null)} />
      )}
      {openModal?.action === 'add' && openModal.kind === 'park' && (
        <AddParkModal onClose={() => setOpenModal(null)} />
      )}
      {openModal?.action === 'add' && openModal.kind === 'swimming' && (
        <AddSwimSchoolModal onClose={() => setOpenModal(null)} />
      )}
      {openModal?.action === 'add' && openModal.kind === 'grooming' && (
        <AddGroomingSalonModal onClose={() => setOpenModal(null)} />
      )}
      {openModal?.action === 'add' && openModal.kind === 'food' && (
        <AddPetFoodModal onClose={() => setOpenModal(null)} />
      )}

      {openModal?.action === 'edit' && openModal.kind === 'hospital' && (
        <GenericPickModal
          onClose={() => setOpenModal(null)}
          onPick={(item) => setOpenModal({ kind: 'hospital', action: 'edit-form', existing: item })}
          title="Pick a hospital to edit"
          eyebrow="Vet Care · Bangalore"
          emptyMessage="No hospitals to edit."
          loadingLabel="Loading hospitals…"
          errorLabel="Could not load hospitals. Please close and try again."
          queryKey={['hospitals']}
          fetchItems={listHospitals}
          getId={(h) => h.id}
          getPrimary={(h) => h.name}
          getSecondary={(h) => h.locality}
        />
      )}
      {openModal?.action === 'edit' && openModal.kind === 'park' && (
        <GenericPickModal
          onClose={() => setOpenModal(null)}
          onPick={(item) => setOpenModal({ kind: 'park', action: 'edit-form', existing: item })}
          title="Pick a park to edit"
          eyebrow="Outdoors · Bangalore"
          emptyMessage="No parks to edit."
          loadingLabel="Loading parks…"
          errorLabel="Could not load parks. Please close and try again."
          queryKey={['parks']}
          fetchItems={listParks}
          getId={(p) => p.id}
          getPrimary={(p) => p.name}
          getSecondary={(p) => p.locality}
        />
      )}
      {openModal?.action === 'edit' && openModal.kind === 'swimming' && (
        <GenericPickModal
          onClose={() => setOpenModal(null)}
          onPick={(item) => setOpenModal({ kind: 'swimming', action: 'edit-form', existing: item })}
          title="Pick a swim school to edit"
          eyebrow="Aquatic · Bangalore"
          emptyMessage="No swim schools to edit."
          loadingLabel="Loading swim schools…"
          errorLabel="Could not load swim schools. Please close and try again."
          queryKey={['swim-schools']}
          fetchItems={listSwimSchools}
          getId={(s) => s.id}
          getPrimary={(s) => s.name}
          getSecondary={(s) => s.locality}
        />
      )}
      {openModal?.action === 'edit' && openModal.kind === 'grooming' && (
        <GenericPickModal
          onClose={() => setOpenModal(null)}
          onPick={(item) => setOpenModal({ kind: 'grooming', action: 'edit-form', existing: item })}
          title="Pick a salon to edit"
          eyebrow="Salons · Bangalore"
          emptyMessage="No salons to edit."
          loadingLabel="Loading salons…"
          errorLabel="Could not load salons. Please close and try again."
          queryKey={['grooming-salons']}
          fetchItems={listGroomingSalons}
          getId={(s) => s.id}
          getPrimary={(s) => s.name}
          getSecondary={(s) => `${s.area}, ${s.city}`}
        />
      )}
      {openModal?.action === 'edit' && openModal.kind === 'food' && (
        <GenericPickModal
          onClose={() => setOpenModal(null)}
          onPick={(item) => setOpenModal({ kind: 'food', action: 'edit-form', existing: item })}
          title="Pick a product to edit"
          eyebrow="Shop · Bangalore"
          emptyMessage="No products to edit."
          loadingLabel="Loading products…"
          errorLabel="Could not load products. Please close and try again."
          queryKey={['pet-foods']}
          fetchItems={listPetFoods}
          getId={(p) => p.id}
          getPrimary={(p) => `${p.brand} — ${p.name}`}
          getSecondary={(p) => `₹${p.price.toLocaleString('en-IN')}${p.per_unit && p.per_unit !== '—' ? ` (${p.per_unit})` : ''}`}
        />
      )}

      {openModal?.action === 'edit-form' && openModal.kind === 'hospital' && (
        <AddHospitalModal onClose={() => setOpenModal(null)} existing={openModal.existing} />
      )}
      {openModal?.action === 'edit-form' && openModal.kind === 'park' && (
        <AddParkModal onClose={() => setOpenModal(null)} existing={openModal.existing} />
      )}
      {openModal?.action === 'edit-form' && openModal.kind === 'swimming' && (
        <AddSwimSchoolModal onClose={() => setOpenModal(null)} existing={openModal.existing} />
      )}
      {openModal?.action === 'edit-form' && openModal.kind === 'grooming' && (
        <AddGroomingSalonModal onClose={() => setOpenModal(null)} existing={openModal.existing} />
      )}
      {openModal?.action === 'edit-form' && openModal.kind === 'food' && (
        <AddPetFoodModal onClose={() => setOpenModal(null)} existing={openModal.existing} />
      )}

      {openModal?.action === 'remove' && openModal.kind === 'hospital' && (
        <GenericRemoveModal
          onClose={() => setOpenModal(null)}
          title="Remove a hospital"
          eyebrow="Vet Care · Bangalore"
          successMessage="Hospital removed."
          emptyMessage="No hospitals to remove."
          loadingLabel="Loading hospitals…"
          errorLabel="Could not load hospitals. Please close and try again."
          queryKey={['hospitals']}
          fetchItems={listHospitals}
          deleteItem={deleteHospital}
          getId={(h) => h.id}
          getPrimary={(h) => h.name}
          getSecondary={(h) => h.locality}
        />
      )}
      {openModal?.action === 'remove' && openModal.kind === 'park' && (
        <GenericRemoveModal
          onClose={() => setOpenModal(null)}
          title="Remove a park"
          eyebrow="Outdoors · Bangalore"
          successMessage="Park removed."
          emptyMessage="No parks to remove."
          loadingLabel="Loading parks…"
          errorLabel="Could not load parks. Please close and try again."
          queryKey={['parks']}
          fetchItems={listParks}
          deleteItem={deletePark}
          getId={(p) => p.id}
          getPrimary={(p) => p.name}
          getSecondary={(p) => p.locality}
        />
      )}
      {openModal?.action === 'remove' && openModal.kind === 'swimming' && (
        <GenericRemoveModal
          onClose={() => setOpenModal(null)}
          title="Remove a swim school"
          eyebrow="Aquatic · Bangalore"
          successMessage="Swim school removed."
          emptyMessage="No swim schools to remove."
          loadingLabel="Loading swim schools…"
          errorLabel="Could not load swim schools. Please close and try again."
          queryKey={['swim-schools']}
          fetchItems={listSwimSchools}
          deleteItem={deleteSwimSchool}
          getId={(s) => s.id}
          getPrimary={(s) => s.name}
          getSecondary={(s) => s.locality}
        />
      )}
      {openModal?.action === 'remove' && openModal.kind === 'grooming' && (
        <GenericRemoveModal
          onClose={() => setOpenModal(null)}
          title="Remove a salon"
          eyebrow="Salons · Bangalore"
          successMessage="Salon removed."
          emptyMessage="No salons to remove."
          loadingLabel="Loading salons…"
          errorLabel="Could not load salons. Please close and try again."
          queryKey={['grooming-salons']}
          fetchItems={listGroomingSalons}
          deleteItem={deleteGroomingSalon}
          getId={(s) => s.id}
          getPrimary={(s) => s.name}
          getSecondary={(s) => `${s.area}, ${s.city}`}
        />
      )}
      {openModal?.action === 'remove' && openModal.kind === 'food' && (
        <GenericRemoveModal
          onClose={() => setOpenModal(null)}
          title="Remove a pet food product"
          eyebrow="Shop · Bangalore"
          successMessage="Pet food removed."
          emptyMessage="No products to remove."
          loadingLabel="Loading products…"
          errorLabel="Could not load products. Please close and try again."
          queryKey={['pet-foods']}
          fetchItems={listPetFoods}
          deleteItem={deletePetFood}
          getId={(p) => p.id}
          getPrimary={(p) => `${p.brand} — ${p.name}`}
          getSecondary={(p) => `₹${p.price.toLocaleString('en-IN')}${p.per_unit && p.per_unit !== '—' ? ` (${p.per_unit})` : ''}`}
        />
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
  // Site-wide "❤️ love" tally (backend counter, admin-only view).
  const [helpfulVotes, setHelpfulVotes] = useState<number | null>(null);

  const refresh = () => {
    setAllTime(getVisitStats());
    setRanged(getRangedStats(startOfDayMs(startDate), endOfDayMs(endDate)));
    getCounter('helpful')
      .then(setHelpfulVotes)
      .catch(() => {
        /* leave it hidden if the backend is asleep */
      });
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

      {/* Love tally — visitors tap the ❤️ heart in the navbar; only admin sees the count */}
      <div className="rounded-2xl border-2 border-red-200 bg-red-50 p-4 mb-4 flex items-center gap-4">
        <span className="text-3xl leading-none" aria-hidden="true">❤️</span>
        <div>
          <p className="text-3xl font-extrabold text-warm-900 tabular-nums leading-none">
            {helpfulVotes === null ? '—' : helpfulVotes.toLocaleString('en-IN')}
          </p>
          <p className="text-sm text-warm-600 mt-1">
            Loves from visitors (navbar heart)
          </p>
        </div>
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

type VisibilityToggle = {
  key: SiteSettingKey;
  label: string;
  description: string;
};

const VISIBILITY_TOGGLES: VisibilityToggle[] = [
  {
    key: 'pet_supplies_enabled',
    label: 'Pet Supplies',
    description:
      'When off, /pet-supplies shows a "Launching soon" splash instead of the catalogue. Tab and home circle stay visible as teasers.',
  },
];

function SiteVisibilitySection() {
  const queryClient = useQueryClient();
  const { data: settings, isLoading, isError } = useQuery({
    queryKey: ['site-settings'],
    queryFn: listSiteSettings,
  });

  const mutation = useMutation({
    mutationFn: ({ key, enabled }: { key: SiteSettingKey; enabled: boolean }) =>
      updateSiteSetting(key, enabled),
    onSuccess: (row) => {
      queryClient.invalidateQueries({ queryKey: ['site-settings'] });
      toast.success(`${row.key.replace(/_/g, ' ')} is now ${row.enabled ? 'Live' : 'Coming Soon'}.`);
    },
    onError: (err: Error) => toast.error(err.message || 'Could not update setting.'),
  });

  return (
    <section className="mb-10">
      <div className="mb-4">
        <p className="text-[11px] font-semibold tracking-[0.3em] text-accent-600 uppercase mb-1">
          Visibility
        </p>
        <h2 className="text-xl font-bold text-warm-900">Service visibility</h2>
        <p className="text-sm text-warm-500 mt-1">
          Flip a service to <span className="font-semibold">Coming Soon</span> to swap its detail page for a launch splash.
        </p>
      </div>

      <div className="rounded-2xl border-2 border-primary-100 bg-white divide-y divide-warm-200 overflow-hidden">
        {isLoading ? (
          <p className="text-sm text-warm-500 px-5 py-6 text-center">Loading settings…</p>
        ) : isError ? (
          <p className="text-sm text-red-600 px-5 py-6 text-center">Could not load settings.</p>
        ) : (
          VISIBILITY_TOGGLES.map(({ key, label, description }) => {
            const row = settings?.find((s) => s.key === key);
            const enabled = row ? row.enabled : true;
            const pending = mutation.isPending && mutation.variables?.key === key;
            return (
              <div key={key} className="flex items-center justify-between gap-4 px-5 py-4">
                <div className="min-w-0 flex-1">
                  <p className="text-base font-bold text-warm-900">{label}</p>
                  <p className="text-xs text-warm-500 mt-0.5 leading-relaxed">{description}</p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={enabled}
                  disabled={pending}
                  onClick={() => mutation.mutate({ key, enabled: !enabled })}
                  className={`shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-colors ${
                    enabled
                      ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                      : 'bg-warm-100 text-warm-600 hover:bg-warm-200'
                  } disabled:opacity-60 disabled:cursor-not-allowed`}
                >
                  <span
                    aria-hidden="true"
                    className={`relative inline-block w-9 h-5 rounded-full transition-colors ${
                      enabled ? 'bg-emerald-500' : 'bg-warm-400'
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${
                        enabled ? 'left-[18px]' : 'left-0.5'
                      }`}
                    />
                  </span>
                  {pending ? 'Saving…' : enabled ? 'Live' : 'Coming Soon'}
                </button>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}

const SUBMISSION_KIND_META: Record<SubmissionRead['kind'], { label: string; badge: string }> = {
  feedback: { label: 'Feedback',     badge: 'bg-primary-100 text-primary-700' },
  hospital: { label: 'Hospital',     badge: 'bg-rose-100 text-rose-700' },
  park:     { label: 'Park',         badge: 'bg-emerald-100 text-emerald-700' },
  swimming: { label: 'Swim School',  badge: 'bg-sky-100 text-sky-700' },
  grooming: { label: 'Grooming',     badge: 'bg-amber-100 text-amber-700' },
};

function SubmissionsSection() {
  const queryClient = useQueryClient();
  const { data, isLoading, isError } = useQuery({
    queryKey: ['submissions'],
    queryFn: listSubmissions,
    refetchInterval: 60_000,
  });

  const [confirmId, setConfirmId] = useState<string | null>(null);

  const handledMutation = useMutation({
    mutationFn: ({ id, handled }: { id: string; handled: boolean }) =>
      setSubmissionHandled(id, handled),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['submissions'] }),
    onError: (err: Error) => toast.error(err.message || 'Could not update submission.'),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteSubmission,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['submissions'] });
      toast.success('Submission removed.');
      setConfirmId(null);
    },
    onError: (err: Error) => toast.error(err.message || 'Could not remove submission.'),
  });

  const submissions = data ?? [];
  const pendingCount = submissions.filter((s) => !s.handled).length;

  const handleDelete = (id: string) => {
    if (confirmId !== id) {
      setConfirmId(id);
      return;
    }
    deleteMutation.mutate(id);
  };

  return (
    <section className="mb-10">
      <div className="mb-4">
        <p className="text-[11px] font-semibold tracking-[0.3em] text-accent-600 uppercase mb-1">
          Inbox
        </p>
        <h2 className="text-xl font-bold text-warm-900">
          Form submissions
          {pendingCount > 0 && (
            <span className="ml-2 align-middle text-xs font-bold text-white bg-red-600 rounded-full px-2 py-0.5">
              {pendingCount} new
            </span>
          )}
        </h2>
        <p className="text-sm text-warm-500 mt-1">
          Feedback and "list your …" requests submitted from the public site. Review,
          then re-enter approved listings via the Add forms above.
        </p>
      </div>

      {isLoading ? (
        <p className="text-sm text-warm-500 py-6">Loading submissions…</p>
      ) : isError ? (
        <p className="text-sm text-red-600 py-6">Could not load submissions. Refresh to retry.</p>
      ) : submissions.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-warm-300 p-8 text-center text-sm text-warm-500">
          No submissions yet. New feedback and listing requests will appear here.
        </div>
      ) : (
        <ul className="space-y-3">
          {submissions.map((s) => {
            const meta = SUBMISSION_KIND_META[s.kind] ?? { label: s.kind, badge: 'bg-warm-100 text-warm-700' };
            const staged = confirmId === s.id;
            return (
              <li
                key={s.id}
                className={`rounded-2xl border-2 bg-white p-4 sm:p-5 transition-colors ${
                  s.handled ? 'border-warm-200 opacity-70' : 'border-primary-100'
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-[10px] font-bold tracking-[0.18em] uppercase px-2.5 py-1 rounded-full ${meta.badge}`}>
                      {meta.label}
                    </span>
                    {s.handled && (
                      <span className="text-[10px] font-bold tracking-[0.18em] uppercase px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700">
                        ✓ Handled
                      </span>
                    )}
                    <span className="text-xs text-warm-500">
                      {formatDateTime(new Date(s.created_at))}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => handledMutation.mutate({ id: s.id, handled: !s.handled })}
                      disabled={handledMutation.isPending}
                      className="px-3 py-1.5 rounded-full border-2 border-warm-300 bg-white text-warm-700 text-xs font-bold uppercase tracking-wider hover:border-primary-500 hover:text-primary-700 transition-colors disabled:opacity-60"
                    >
                      {s.handled ? 'Mark unhandled' : 'Mark handled'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(s.id)}
                      disabled={deleteMutation.isPending && staged}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-colors ${
                        staged
                          ? 'bg-red-600 text-white hover:bg-red-700 disabled:opacity-60'
                          : 'border-2 border-warm-300 bg-white text-warm-700 hover:border-red-500 hover:text-red-600'
                      }`}
                    >
                      {deleteMutation.isPending && staged ? 'Removing…' : staged ? 'Confirm' : 'Remove'}
                    </button>
                  </div>
                </div>
                <dl className="grid grid-cols-1 sm:grid-cols-[160px_1fr] gap-x-4 gap-y-1.5 text-sm">
                  {Object.entries(s.data).map(([key, value]) => (
                    <div key={key} className="contents">
                      <dt className="font-semibold text-warm-500">{key}</dt>
                      <dd className="text-warm-900 break-words">{value}</dd>
                    </div>
                  ))}
                </dl>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

function UsersSection() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin-users'],
    queryFn: listUsers,
    refetchInterval: 60_000,
  });
  const users = data ?? [];

  const fmtDate = (iso: string) => {
    const d = new Date(iso);
    return isNaN(d.getTime())
      ? '—'
      : d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <section className="mb-10">
      <div className="mb-4">
        <p className="text-[11px] font-semibold tracking-[0.3em] text-accent-600 uppercase mb-1">
          Accounts
        </p>
        <h2 className="text-xl font-bold text-warm-900">
          Users
          <span className="ml-2 align-middle text-xs font-bold text-warm-600 bg-warm-100 rounded-full px-2 py-0.5">
            {users.length}
          </span>
        </h2>
        <p className="text-sm text-warm-500 mt-1">
          Everyone who has registered on HiSpike, newest first.
        </p>
      </div>

      {isLoading ? (
        <p className="text-sm text-warm-500 py-6">Loading users…</p>
      ) : isError ? (
        <p className="text-sm text-red-600 py-6">Could not load users. Refresh to retry.</p>
      ) : users.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-warm-300 p-8 text-center text-sm text-warm-500">
          No users yet.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border-2 border-warm-200 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-warm-500 border-b border-warm-200">
                <th className="px-4 py-3 font-semibold">Name</th>
                <th className="px-4 py-3 font-semibold">Email</th>
                <th className="px-4 py-3 font-semibold">Phone</th>
                <th className="px-4 py-3 font-semibold">Role</th>
                <th className="px-4 py-3 font-semibold">Joined</th>
                <th className="px-4 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-warm-100 last:border-0">
                  <td className="px-4 py-3 font-semibold text-warm-900 whitespace-nowrap">
                    {u.full_name || '—'}
                  </td>
                  <td className="px-4 py-3 text-warm-700 break-all">{u.email}</td>
                  <td className="px-4 py-3 text-warm-600 whitespace-nowrap">{u.phone || '—'}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-xs font-bold ${
                        u.role === 'admin'
                          ? 'bg-accent-100 text-accent-800'
                          : 'bg-warm-100 text-warm-700'
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-warm-600 whitespace-nowrap">{fmtDate(u.created_at)}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {u.is_active ? (
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-green-700">
                        <span className="w-2 h-2 rounded-full bg-green-500" />
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-warm-500">
                        <span className="w-2 h-2 rounded-full bg-warm-400" />
                        Inactive
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function PetStoriesSection() {
  const queryClient = useQueryClient();
  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin-pet-pages'],
    queryFn: listAllPetPages,
    refetchInterval: 60_000,
  });

  const [confirmId, setConfirmId] = useState<string | null>(null);

  const deleteMutation = useMutation({
    mutationFn: deletePetPage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-pet-pages'] });
      queryClient.invalidateQueries({ queryKey: ['my-pet-pages'] });
      toast.success('Pet story page removed.');
      setConfirmId(null);
    },
    onError: (err: Error) => toast.error(err.message || 'Could not remove the page.'),
  });

  const pages = data ?? [];

  const handleDelete = (id: string) => {
    if (confirmId !== id) {
      setConfirmId(id);
      return;
    }
    deleteMutation.mutate(id);
  };

  return (
    <section className="mb-10">
      <div className="mb-4">
        <p className="text-[11px] font-semibold tracking-[0.3em] text-accent-600 uppercase mb-1">
          Moderation
        </p>
        <h2 className="text-xl font-bold text-warm-900">
          Pet Stories
          <span className="ml-2 align-middle text-xs font-bold text-warm-600 bg-warm-100 rounded-full px-2 py-0.5">
            {pages.length}
          </span>
        </h2>
        <p className="text-sm text-warm-500 mt-1">
          Owner-created pages at <span className="font-mono">hispike.in/pet/…</span>. Open any page to
          review it, and remove anything inappropriate.
        </p>
      </div>

      {isLoading ? (
        <p className="text-sm text-warm-500 py-6">Loading pet stories…</p>
      ) : isError ? (
        <p className="text-sm text-red-600 py-6">Could not load pet stories. Refresh to retry.</p>
      ) : pages.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-warm-300 p-8 text-center text-sm text-warm-500">
          No pet stories yet. Pages created by owners will appear here.
        </div>
      ) : (
        <ul className="space-y-3">
          {pages.map((p) => {
            const staged = confirmId === p.id;
            const url = `/pet/${p.slug}`;
            const snippet = p.memories.replace(/\s+/g, ' ').trim().slice(0, 140);
            return (
              <li key={p.id} className="rounded-2xl border-2 border-warm-200 bg-white p-4 sm:p-5">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-warm-100 flex items-center justify-center shrink-0">
                    {p.photos[0] ? (
                      <img src={p.photos[0]} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-2xl" aria-hidden="true">🐶</span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-bold text-warm-900 truncate">{p.name || 'Untitled'}</p>
                        <a
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-primary-600 hover:underline font-mono break-all"
                        >
                          hispike.in/pet/{p.slug}
                        </a>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <a
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 rounded-full border-2 border-warm-300 bg-white text-warm-700 text-xs font-bold uppercase tracking-wider hover:border-primary-500 hover:text-primary-700 transition-colors"
                        >
                          View
                        </a>
                        <button
                          type="button"
                          onClick={() => handleDelete(p.id)}
                          disabled={deleteMutation.isPending && staged}
                          className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-colors ${
                            staged
                              ? 'bg-red-600 text-white hover:bg-red-700 disabled:opacity-60'
                              : 'border-2 border-warm-300 bg-white text-warm-700 hover:border-red-500 hover:text-red-600'
                          }`}
                        >
                          {deleteMutation.isPending && staged ? 'Removing…' : staged ? 'Confirm' : 'Remove'}
                        </button>
                      </div>
                    </div>
                    {snippet && (
                      <p className="mt-2 text-sm text-warm-600 line-clamp-2">
                        {snippet}{p.memories.length > 140 ? '…' : ''}
                      </p>
                    )}
                    <div className="mt-2 flex items-center gap-3 text-xs text-warm-400">
                      <span>{p.photos.length} photo{p.photos.length === 1 ? '' : 's'}</span>
                      <span aria-hidden="true">·</span>
                      <span>{formatDateTime(new Date(p.created_at))}</span>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

// ---- Backup / Export: download each category's live data as .xlsx ----

type ExportConfig = {
  kind: string;
  label: string;
  emoji: string;
  file: string;
  headers: string[];
  run: () => Promise<Record<string, string>[]>;
};

// Coerce any field to a cell string (arrays -> "a|b", null -> "").
const cell = (v: unknown): string =>
  Array.isArray(v) ? v.join('|') : v == null ? '' : String(v);

const EXPORT_CONFIGS: ExportConfig[] = [
  {
    kind: 'hospital',
    label: 'Hospitals',
    emoji: '🏥',
    file: 'hispike-hospitals-backup.xlsx',
    headers: ['Name', 'Locality', 'Address', 'Phone', 'Specialties', 'Rating', 'Email', 'Open hours', 'Website'],
    run: async () =>
      (await listHospitals()).map((r) => ({
        Name: cell(r.name), Locality: cell(r.locality), Address: cell(r.address), Phone: cell(r.phone),
        Specialties: cell(r.specialties), Rating: cell(r.rating), Email: cell(r.email),
        'Open hours': cell(r.hours), Website: cell(r.website),
      })),
  },
  {
    kind: 'park',
    label: 'Parks',
    emoji: '🌳',
    file: 'hispike-parks-backup.xlsx',
    headers: ['Name', 'Locality', 'Address', 'Rating', 'Cost', 'Off-leash', 'Features', 'Open hours', 'Phone', 'Email', 'Website', 'Image URL', 'Highlights'],
    run: async () =>
      (await listParks()).map((r) => ({
        Name: cell(r.name), Locality: cell(r.locality), Address: cell(r.address), Rating: cell(r.rating),
        Cost: cell(r.cost), 'Off-leash': cell(r.off_leash), Features: cell(r.features), 'Open hours': cell(r.hours),
        Phone: cell(r.phone), Email: cell(r.email), Website: cell(r.website), 'Image URL': cell(r.image_url),
        Highlights: cell(r.highlights),
      })),
  },
  {
    kind: 'swimming',
    label: 'Swim schools',
    emoji: '🐕💦',
    file: 'hispike-swim-schools-backup.xlsx',
    headers: ['Name', 'Locality', 'Address', 'Rating', 'Pool type', 'Cost', 'Open hours', 'Phone', 'Email', 'Website', 'Image URL', 'Highlights'],
    run: async () =>
      (await listSwimSchools()).map((r) => ({
        Name: cell(r.name), Locality: cell(r.locality), Address: cell(r.address), Rating: cell(r.rating),
        'Pool type': cell(r.pool_type), Cost: cell(r.cost), 'Open hours': cell(r.hours), Phone: cell(r.phone),
        Email: cell(r.email), Website: cell(r.website), 'Image URL': cell(r.image_url), Highlights: cell(r.highlights),
      })),
  },
  {
    kind: 'grooming',
    label: 'Grooming',
    emoji: '✂️',
    file: 'hispike-grooming-salons-backup.xlsx',
    headers: ['Name', 'Area', 'City', 'Address', 'Phone', 'Rating', 'Open hours', 'Email', 'Website', 'Image URL'],
    run: async () =>
      (await listGroomingSalons()).map((r) => ({
        Name: cell(r.name), Area: cell(r.area), City: cell(r.city), Address: cell(r.address), Phone: cell(r.phone),
        Rating: cell(r.rating_avg), 'Open hours': cell(r.hours), Email: cell(r.email), Website: cell(r.website),
        'Image URL': cell(r.image_url),
      })),
  },
];

function BackupSection() {
  const [busy, setBusy] = useState<string | null>(null);

  const exportOne = async (cfg: ExportConfig) => {
    setBusy(cfg.kind);
    try {
      const rows = await cfg.run();
      downloadRows(cfg.file, cfg.headers, rows);
      toast.success(`Downloaded ${rows.length} ${cfg.label.toLowerCase()}.`);
    } catch {
      toast.error(`Could not export ${cfg.label.toLowerCase()}. Please try again.`);
    } finally {
      setBusy(null);
    }
  };

  return (
    <section className="mb-10">
      <div className="mb-4">
        <p className="text-[11px] font-semibold tracking-[0.3em] text-accent-600 uppercase mb-1">
          Backup
        </p>
        <h2 className="text-xl font-bold text-warm-900">Export data</h2>
        <p className="text-sm text-warm-500 mt-1">
          Download the current listings for each category as an Excel (.xlsx) backup. The files use
          the same columns as the Import screens, so you can re-upload them to restore.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {EXPORT_CONFIGS.map((cfg) => (
          <button
            key={cfg.kind}
            type="button"
            onClick={() => exportOne(cfg)}
            disabled={busy !== null}
            className="rounded-2xl border-2 border-warm-200 bg-white p-4 text-center hover:border-primary-400 hover:shadow-sm disabled:opacity-60 disabled:cursor-not-allowed transition-all"
          >
            <span className="block text-2xl mb-1" aria-hidden="true">{cfg.emoji}</span>
            <span className="block text-sm font-bold text-warm-900">{cfg.label}</span>
            <span className="block text-xs text-primary-600 mt-1 font-semibold">
              {busy === cfg.kind ? 'Preparing…' : '↓ Download .xlsx'}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}

export function Admin() {
  // Warm the backend the moment the admin lands here. Render free-tier
  // services sleep after ~15 min idle; the first request after sleep takes
  // 30–60s to wake up, which used to surface as "Network Error" on the
  // very first Add/Edit submit. Hitting /health here means by the time the
  // admin opens a modal and submits, the dyno is already warm.
  useEffect(() => {
    const apiBase = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';
    fetch(`${apiBase}/health`, { method: 'GET', cache: 'no-store' }).catch(() => {
      // Best-effort — failure here doesn't block the admin UI.
    });
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-warm-900 mb-2">Admin Dashboard</h1>
        <p className="text-warm-500">Site activity at a glance</p>
      </div>

      <UsersSection />
      <SubmissionsSection />
      <PetStoriesSection />
      <AddListingsSection />
      <BackupSection />
      <SiteVisibilitySection />
      <VisitsSection />
    </div>
  );
}
