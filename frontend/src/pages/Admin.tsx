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

type ListingKind = 'hospital' | 'park' | 'swimming' | 'grooming' | 'food';
type ListingAction = 'add' | 'edit' | 'remove';
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

const PET_FOOD_LIFESTAGES = ['Puppy', 'Adult', 'Senior', 'All Lifestages'];
const PET_FOOD_FORMS = ['Dry Food', 'Wet Food', 'Freeze-Dried', 'Raw', 'Treats'];

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
        }
      : {
          name: '',
          locality: '',
          address: '',
          phone: '',
          specialties: '',
          rating: '',
          website: '',
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
          website: existing.website ?? '',
          highlights: existing.highlights ?? [],
        }
      : {
          name: '', locality: '', rating: 4, image_url: '',
          address: '', hours: '', cost: '', off_leash: '',
          features: '', phone: '', website: '', highlights: [],
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
      website: form.website?.trim() || undefined,
      highlights,
    });
  };

  const star = <span className="text-red-500">*</span>;
  const inputCls = 'w-full px-3 py-2 border-2 border-warm-300 rounded-md text-sm outline-none focus:border-primary-500 transition-colors';
  return (
    <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
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
          <form onSubmit={onSubmit} className="space-y-4">
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
                <span className="block text-sm font-semibold text-warm-900 mb-1">Website</span>
                <input type="url" value={form.website ?? ''} onChange={(e) => setForm({ ...form, website: e.target.value })} placeholder="https://..." className={inputCls} />
              </label>
            </div>
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
          highlights: existing.highlights ?? [],
        }
      : {
          name: '', locality: '', rating: 4, image_url: '', address: '',
          hours: '', cost: '', pool_type: '', highlights: [],
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
      highlights,
    });
  };

  const star = <span className="text-red-500">*</span>;
  return (
    <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
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
          <form onSubmit={onSubmit} className="space-y-4">
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
        }
      : {
          name: '', area: '', city: 'Bengaluru', state: 'KA', address: '', phone: '',
          rating_avg: 4.5, rating_count: 0, tint: 'from-amber-200 to-amber-400', hero_emoji: '✂️',
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
    });
  };

  const star = <span className="text-red-500">*</span>;
  return (
    <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
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
          <form onSubmit={onSubmit} className="space-y-4">
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
                <span className="block text-sm font-semibold text-warm-900 mb-1">Hero emoji</span>
                <input type="text" value={form.hero_emoji ?? ''} onChange={(e) => setForm({ ...form, hero_emoji: e.target.value })} placeholder="✂️" className="w-full px-3 py-2 border-2 border-warm-300 rounded-md text-sm outline-none focus:border-primary-500 transition-colors" />
              </label>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="block">
                <span className="block text-sm font-semibold text-warm-900 mb-1">Avg rating (0–5)</span>
                <input type="number" min={0} max={5} step={0.1} value={form.rating_avg ?? 4.5} onChange={(e) => setForm({ ...form, rating_avg: Number(e.target.value) })} className="w-full px-3 py-2 border-2 border-warm-300 rounded-md text-sm outline-none focus:border-primary-500 transition-colors" />
              </label>
              <label className="block">
                <span className="block text-sm font-semibold text-warm-900 mb-1">Review count</span>
                <input type="number" min={0} value={form.rating_count ?? 0} onChange={(e) => setForm({ ...form, rating_count: Number(e.target.value) })} className="w-full px-3 py-2 border-2 border-warm-300 rounded-md text-sm outline-none focus:border-primary-500 transition-colors" />
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
    <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
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
          <form onSubmit={onSubmit} className="space-y-4">
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

type ModalState =
  | { kind: ListingKind; action: 'add' | 'edit' | 'remove' }
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
