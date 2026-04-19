import { useAdminStatsQuery } from '@/hooks/useDogs';
import { useDogsQuery } from '@/hooks/useDogs';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ErrorMessage } from '@/components/ErrorMessage';
import { DogCard } from '@/components/DogCard';
import { Link } from 'react-router-dom';

export function Admin() {
  const { data: stats, isLoading: statsLoading, isError: statsError, error: statsErrorObj } = useAdminStatsQuery();
  const { data: recentDogs, isLoading: dogsLoading } = useDogsQuery({}, 1);

  if (statsLoading) return <LoadingSpinner fullPage />;

  if (statsError) {
    return (
      <ErrorMessage
        title="Access Denied"
        message={(statsErrorObj as Error)?.message ?? 'You do not have permission to view this page.'}
      />
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-warm-900 mb-2">Admin Dashboard</h1>
        <p className="text-warm-500">Overview of platform activity</p>
      </div>

      {/* Stats Grid */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-10">
          {[
            {
              label: 'Total Dogs',
              value: stats.total_dogs,
              emoji: '🐕',
              color: 'bg-amber-50 border-amber-200',
              textColor: 'text-amber-700',
            },
            {
              label: 'Available',
              value: stats.available_dogs,
              emoji: '✅',
              color: 'bg-green-50 border-green-200',
              textColor: 'text-green-700',
            },
            {
              label: 'Adopted',
              value: stats.adopted_dogs,
              emoji: '❤️',
              color: 'bg-pink-50 border-pink-200',
              textColor: 'text-pink-700',
            },
            {
              label: 'Total Users',
              value: stats.total_users,
              emoji: '👥',
              color: 'bg-blue-50 border-blue-200',
              textColor: 'text-blue-700',
            },
            {
              label: 'All Adoptions',
              value: stats.total_adoptions,
              emoji: '📋',
              color: 'bg-purple-50 border-purple-200',
              textColor: 'text-purple-700',
            },
            {
              label: 'Pending',
              value: stats.pending_adoptions,
              emoji: '⏳',
              color: 'bg-yellow-50 border-yellow-200',
              textColor: 'text-yellow-700',
            },
          ].map(({ label, value, emoji, color, textColor }) => (
            <div
              key={label}
              className={`${color} border rounded-2xl p-5 text-center`}
            >
              <div className="text-3xl mb-2">{emoji}</div>
              <div className={`text-3xl font-extrabold ${textColor}`}>
                {value.toLocaleString()}
              </div>
              <div className="text-xs text-warm-500 mt-1 font-medium">{label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Charts row (visual representation) */}
      {stats && (
        <div className="grid md:grid-cols-2 gap-6 mb-10">
          {/* Dog Status Distribution */}
          <div className="bg-white rounded-2xl border border-warm-200 shadow-sm p-6">
            <h3 className="font-bold text-warm-900 mb-5">Dog Status Distribution</h3>
            <div className="space-y-4">
              {[
                { label: 'Available', value: stats.available_dogs, total: stats.total_dogs, color: 'bg-green-400' },
                { label: 'Adopted', value: stats.adopted_dogs, total: stats.total_dogs, color: 'bg-pink-400' },
                {
                  label: 'Pending',
                  value: stats.total_dogs - stats.available_dogs - stats.adopted_dogs,
                  total: stats.total_dogs,
                  color: 'bg-yellow-400',
                },
              ].map(({ label, value, total, color }) => {
                const pct = total > 0 ? Math.round((value / total) * 100) : 0;
                return (
                  <div key={label}>
                    <div className="flex items-center justify-between mb-1.5 text-sm">
                      <span className="font-medium text-warm-700">{label}</span>
                      <span className="text-warm-400">
                        {value} ({pct}%)
                      </span>
                    </div>
                    <div className="w-full bg-warm-100 rounded-full h-3 overflow-hidden">
                      <div
                        className={`${color} h-3 rounded-full transition-all duration-700`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Adoption Funnel */}
          <div className="bg-white rounded-2xl border border-warm-200 shadow-sm p-6">
            <h3 className="font-bold text-warm-900 mb-5">Platform Summary</h3>
            <div className="space-y-3">
              {[
                { label: 'Registered Users', value: stats.total_users, icon: '👤' },
                { label: 'Dogs Listed', value: stats.total_dogs, icon: '🐕' },
                { label: 'Adoption Requests', value: stats.total_adoptions, icon: '📝' },
                { label: 'Successful Adoptions', value: stats.adopted_dogs, icon: '🏠' },
                {
                  label: 'Adoption Rate',
                  value: stats.total_dogs > 0
                    ? `${Math.round((stats.adopted_dogs / stats.total_dogs) * 100)}%`
                    : '0%',
                  icon: '📊',
                },
              ].map(({ label, value, icon }) => (
                <div
                  key={label}
                  className="flex items-center justify-between py-2.5 border-b border-warm-100 last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{icon}</span>
                    <span className="text-sm text-warm-600 font-medium">{label}</span>
                  </div>
                  <span className="font-bold text-warm-900 text-sm">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Recent Dogs */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-warm-900">Recent Dog Listings</h2>
          <Link
            to="/dogs"
            className="text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            View all →
          </Link>
        </div>

        {dogsLoading ? (
          <div className="flex justify-center py-10">
            <LoadingSpinner />
          </div>
        ) : recentDogs && recentDogs.items.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {recentDogs.items.slice(0, 8).map((dog) => (
              <DogCard key={dog.id} dog={dog} />
            ))}
          </div>
        ) : (
          <div className="text-center py-10 text-warm-500">
            No dogs listed yet.
          </div>
        )}
      </div>
    </div>
  );
}
