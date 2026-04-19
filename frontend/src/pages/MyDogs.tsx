import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMyDogsQuery, useDeleteDog } from '@/hooks/useDogs';
import { DogCard } from '@/components/DogCard';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ErrorMessage } from '@/components/ErrorMessage';

export function MyDogs() {
  const { data: dogs, isLoading, isError, error, refetch } = useMyDogsQuery();
  const deleteDog = useDeleteDog();
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

  const handleDelete = async (id: number) => {
    if (confirmDelete !== id) {
      setConfirmDelete(id);
      return;
    }
    await deleteDog.mutateAsync(id);
    setConfirmDelete(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-warm-900 mb-1">My Dog Listings</h1>
          <p className="text-warm-500">
            {dogs ? `${dogs.length} listing${dogs.length !== 1 ? 's' : ''}` : 'Manage your dog listings'}
          </p>
        </div>
        <Link
          to="/my-dogs/new"
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary-500 text-white font-bold rounded-xl hover:bg-primary-600 transition-colors shadow-lg shadow-primary-200"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add New Dog
        </Link>
      </div>

      {/* Delete confirmation banner */}
      {confirmDelete !== null && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center justify-between gap-4 animate-fade-in">
          <p className="text-red-800 font-medium text-sm">
            Are you sure you want to delete this listing? This action cannot be undone.
          </p>
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setConfirmDelete(null)}
              className="px-4 py-2 text-sm text-warm-600 hover:text-warm-900 font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => handleDelete(confirmDelete)}
              disabled={deleteDog.isPending}
              className="px-4 py-2 bg-red-500 text-white text-sm font-bold rounded-xl hover:bg-red-600 transition-colors disabled:opacity-60 flex items-center gap-2"
            >
              {deleteDog.isPending ? <LoadingSpinner size="sm" /> : null}
              Delete
            </button>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-24">
          <LoadingSpinner size="lg" />
        </div>
      ) : isError ? (
        <ErrorMessage
          message={(error as Error).message}
          onRetry={() => refetch()}
        />
      ) : dogs && dogs.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {dogs.map((dog) => (
            <DogCard
              key={dog.id}
              dog={dog}
              showActions
              onDelete={(id) => handleDelete(id)}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="text-7xl mb-6">🐶</div>
          <h2 className="text-2xl font-bold text-warm-900 mb-3">No listings yet</h2>
          <p className="text-warm-500 max-w-md mb-8">
            You haven't listed any dogs for adoption yet. Create your first listing and help find a loving home!
          </p>
          <Link
            to="/my-dogs/new"
            className="inline-flex items-center gap-2 px-8 py-4 bg-primary-500 text-white font-bold rounded-2xl hover:bg-primary-600 transition-colors shadow-lg shadow-primary-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create First Listing
          </Link>
        </div>
      )}
    </div>
  );
}
