import { Link } from 'react-router-dom';
import { useAdoptionsQuery, useCancelAdoption } from '@/hooks/useAdoptions';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ErrorMessage } from '@/components/ErrorMessage';
import {
  formatDateShort,
  formatAge,
  getAdoptionStatusColor,
  getAdoptionStatusLabel,
} from '@/utils/formatters';

export function Adoptions() {
  const { data: adoptions, isLoading, isError, error, refetch } = useAdoptionsQuery();
  const cancelAdoption = useCancelAdoption();

  const pendingAdoptions = adoptions?.filter((a) => a.status === 'pending') ?? [];
  const otherAdoptions = adoptions?.filter((a) => a.status !== 'pending') ?? [];
  const sorted = [...pendingAdoptions, ...otherAdoptions];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-warm-900 mb-2">My Adoption Requests</h1>
        <p className="text-warm-500">Track the status of your adoption applications</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-24">
          <LoadingSpinner size="lg" />
        </div>
      ) : isError ? (
        <ErrorMessage
          message={(error as Error).message}
          onRetry={() => refetch()}
        />
      ) : sorted.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="text-7xl mb-6">📋</div>
          <h2 className="text-2xl font-bold text-warm-900 mb-3">No adoption requests yet</h2>
          <p className="text-warm-500 max-w-md mb-8">
            Browse available dogs and submit an adoption request to get started on your journey!
          </p>
          <Link
            to="/dogs"
            className="inline-flex items-center gap-2 px-8 py-4 bg-primary-500 text-white font-bold rounded-2xl hover:bg-primary-600 transition-colors shadow-lg shadow-primary-200"
          >
            Browse Dogs →
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {sorted.map((adoption) => {
            const dog = adoption.dog;
            const placeholderImg = `https://placedog.net/80/80?id=${adoption.dog_id}`;

            return (
              <div
                key={adoption.id}
                className="bg-white rounded-2xl border border-warm-200 shadow-sm overflow-hidden"
              >
                <div className="flex flex-col sm:flex-row">
                  {/* Dog image */}
                  <div className="sm:w-28 h-28 sm:h-auto shrink-0 bg-warm-100">
                    {dog ? (
                      <Link to={`/dogs/${dog.id}`}>
                        <img
                          src={dog.image_url ?? placeholderImg}
                          alt={dog.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = placeholderImg;
                          }}
                        />
                      </Link>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl">
                        🐕
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="flex-1 min-w-0">
                      {dog ? (
                        <Link
                          to={`/dogs/${dog.id}`}
                          className="font-bold text-warm-900 text-lg hover:text-primary-600 transition-colors"
                        >
                          {dog.name}
                        </Link>
                      ) : (
                        <span className="font-bold text-warm-900 text-lg">Dog #{adoption.dog_id}</span>
                      )}

                      {dog && (
                        <p className="text-warm-500 text-sm mt-0.5">
                          {dog.breed} &bull; {formatAge(dog.age_months)} old
                        </p>
                      )}

                      {adoption.message && (
                        <p className="text-warm-400 text-sm mt-2 line-clamp-2 italic">
                          "{adoption.message}"
                        </p>
                      )}

                      <p className="text-warm-300 text-xs mt-2">
                        Submitted {formatDateShort(adoption.created_at)}
                      </p>
                    </div>

                    {/* Status & actions */}
                    <div className="flex sm:flex-col items-center sm:items-end gap-3 shrink-0">
                      <span
                        className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold ${getAdoptionStatusColor(adoption.status)}`}
                      >
                        {getAdoptionStatusLabel(adoption.status)}
                      </span>

                      {adoption.status === 'pending' && (
                        <button
                          onClick={() => cancelAdoption.mutate(adoption.id)}
                          disabled={cancelAdoption.isPending}
                          className="text-xs text-red-500 hover:text-red-700 font-medium transition-colors disabled:opacity-60 flex items-center gap-1"
                        >
                          {cancelAdoption.isPending && cancelAdoption.variables === adoption.id ? (
                            <LoadingSpinner size="sm" />
                          ) : null}
                          Cancel request
                        </button>
                      )}

                      {adoption.status === 'approved' && dog && (
                        <Link
                          to={`/dogs/${dog.id}`}
                          className="text-xs text-primary-600 hover:underline font-medium"
                        >
                          View dog details →
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
