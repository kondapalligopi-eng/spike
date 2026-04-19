import { useState } from 'react';
import { useDogsQuery } from '@/hooks/useDogs';
import { DogCard } from '@/components/DogCard';
import { DogFilters } from '@/components/DogFilters';
import { Pagination } from '@/components/Pagination';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ErrorMessage } from '@/components/ErrorMessage';
import type { DogFilters as DogFiltersType } from '@/types';

export function Dogs() {
  const [filters, setFilters] = useState<DogFiltersType>({});
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const { data, isLoading, isError, error, refetch } = useDogsQuery(filters, page);

  const handleFiltersChange = (newFilters: DogFiltersType) => {
    setFilters(newFilters);
    setPage(1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold text-warm-900 mb-2">Browse Dogs</h1>
        <p className="text-warm-500">
          {data ? `${data.total} dog${data.total !== 1 ? 's' : ''} available` : 'Find your perfect companion'}
        </p>
      </div>

      {/* Mobile filter toggle */}
      <div className="lg:hidden mb-4">
        <button
          onClick={() => setShowFilters((o) => !o)}
          className="flex items-center gap-2 px-4 py-2.5 bg-white border border-warm-200 rounded-xl text-sm font-medium text-warm-700 shadow-sm hover:bg-warm-50 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          {showFilters ? 'Hide Filters' : 'Show Filters'}
        </button>
      </div>

      <div className="flex gap-8">
        {/* Filters Sidebar */}
        <div className={`${showFilters ? 'block' : 'hidden'} lg:block w-full lg:w-72 shrink-0`}>
          <DogFilters filters={filters} onChange={handleFiltersChange} />
        </div>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          {isLoading ? (
            <div className="flex justify-center py-24">
              <LoadingSpinner size="lg" />
            </div>
          ) : isError ? (
            <ErrorMessage
              message={(error as Error).message}
              onRetry={() => refetch()}
            />
          ) : data && data.items.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {data.items.map((dog) => (
                  <DogCard key={dog.id} dog={dog} />
                ))}
              </div>
              <Pagination
                currentPage={page}
                totalPages={data.pages}
                onPageChange={setPage}
              />
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="text-6xl mb-4">🐾</div>
              <h3 className="text-xl font-semibold text-warm-800 mb-2">No dogs found</h3>
              <p className="text-warm-500 max-w-sm">
                Try adjusting your filters or search terms to find more dogs.
              </p>
              <button
                onClick={() => handleFiltersChange({})}
                className="mt-6 px-6 py-2.5 bg-primary-500 text-white rounded-xl font-medium hover:bg-primary-600 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
