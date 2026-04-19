import { useState, useEffect } from 'react';
import type { DogFilters, DogSize, DogStatus, DogGender } from '@/types';

interface DogFiltersProps {
  filters: DogFilters;
  onChange: (filters: DogFilters) => void;
}

const SIZES: { value: DogSize; label: string }[] = [
  { value: 'small', label: 'Small' },
  { value: 'medium', label: 'Medium' },
  { value: 'large', label: 'Large' },
  { value: 'extra_large', label: 'Extra Large' },
];

const STATUSES: { value: DogStatus | ''; label: string }[] = [
  { value: '', label: 'All' },
  { value: 'available', label: 'Available' },
  { value: 'pending', label: 'Pending' },
  { value: 'adopted', label: 'Adopted' },
];

const GENDERS: { value: DogGender | ''; label: string }[] = [
  { value: '', label: 'Any' },
  { value: 'male', label: 'Male ♂' },
  { value: 'female', label: 'Female ♀' },
];

export function DogFilters({ filters, onChange }: DogFiltersProps) {
  const [search, setSearch] = useState(filters.search ?? '');

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      onChange({ ...filters, search: search || undefined });
    }, 400);
    return () => clearTimeout(timer);
  }, [search]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleSize = (size: DogSize) => {
    const current = filters.size ?? [];
    const updated = current.includes(size)
      ? current.filter((s) => s !== size)
      : [...current, size];
    onChange({ ...filters, size: updated.length > 0 ? updated : undefined });
  };

  const handleReset = () => {
    setSearch('');
    onChange({});
  };

  const hasFilters =
    !!filters.search ||
    (filters.size && filters.size.length > 0) ||
    !!filters.status ||
    !!filters.gender ||
    filters.min_age !== undefined ||
    filters.max_age !== undefined;

  return (
    <aside className="bg-white rounded-2xl shadow-sm border border-warm-200 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-warm-900 text-lg">Filters</h2>
        {hasFilters && (
          <button
            onClick={handleReset}
            className="text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Search */}
      <div>
        <label htmlFor="dog-search" className="block text-sm font-medium text-warm-700 mb-2">
          Search by name or breed
        </label>
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-warm-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            id="dog-search"
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="e.g. Labrador..."
            className="w-full pl-10 pr-4 py-2.5 border border-warm-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
          />
        </div>
      </div>

      {/* Status */}
      <div>
        <fieldset>
          <legend className="block text-sm font-medium text-warm-700 mb-3">Status</legend>
          <div className="space-y-2">
            {STATUSES.map(({ value, label }) => (
              <label key={value} className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="radio"
                  name="status"
                  value={value}
                  checked={(filters.status ?? '') === value}
                  onChange={() =>
                    onChange({
                      ...filters,
                      status: value === '' ? undefined : value,
                    })
                  }
                  className="w-4 h-4 text-primary-500 border-warm-300 focus:ring-primary-400"
                />
                <span className="text-sm text-warm-700 group-hover:text-warm-900">{label}</span>
              </label>
            ))}
          </div>
        </fieldset>
      </div>

      {/* Gender */}
      <div>
        <fieldset>
          <legend className="block text-sm font-medium text-warm-700 mb-3">Gender</legend>
          <div className="space-y-2">
            {GENDERS.map(({ value, label }) => (
              <label key={value} className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="radio"
                  name="gender"
                  value={value}
                  checked={(filters.gender ?? '') === value}
                  onChange={() =>
                    onChange({
                      ...filters,
                      gender: value === '' ? undefined : value,
                    })
                  }
                  className="w-4 h-4 text-primary-500 border-warm-300 focus:ring-primary-400"
                />
                <span className="text-sm text-warm-700 group-hover:text-warm-900">{label}</span>
              </label>
            ))}
          </div>
        </fieldset>
      </div>

      {/* Size */}
      <div>
        <fieldset>
          <legend className="block text-sm font-medium text-warm-700 mb-3">Size</legend>
          <div className="space-y-2">
            {SIZES.map(({ value, label }) => (
              <label key={value} className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={(filters.size ?? []).includes(value)}
                  onChange={() => toggleSize(value)}
                  className="w-4 h-4 text-primary-500 border-warm-300 rounded focus:ring-primary-400"
                />
                <span className="text-sm text-warm-700 group-hover:text-warm-900">{label}</span>
              </label>
            ))}
          </div>
        </fieldset>
      </div>

      {/* Age range */}
      <div>
        <legend className="block text-sm font-medium text-warm-700 mb-3">Age (months)</legend>
        <div className="flex items-center gap-3">
          <input
            type="number"
            min={0}
            max={filters.max_age}
            value={filters.min_age ?? ''}
            onChange={(e) =>
              onChange({
                ...filters,
                min_age: e.target.value ? Number(e.target.value) : undefined,
              })
            }
            placeholder="Min"
            className="w-full px-3 py-2 border border-warm-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
          />
          <span className="text-warm-400 text-sm shrink-0">to</span>
          <input
            type="number"
            min={filters.min_age ?? 0}
            value={filters.max_age ?? ''}
            onChange={(e) =>
              onChange({
                ...filters,
                max_age: e.target.value ? Number(e.target.value) : undefined,
              })
            }
            placeholder="Max"
            className="w-full px-3 py-2 border border-warm-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
          />
        </div>
      </div>
    </aside>
  );
}
