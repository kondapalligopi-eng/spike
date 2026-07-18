import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { listRecentShops } from '@/api/petShops';
import { PageHead } from '@/components/PageHead';
import { useBackendWarmup } from '@/lib/warmupBackend';

export function PetShops() {
  useBackendWarmup();
  const { data, isLoading } = useQuery({
    queryKey: ['pet-shops-directory'],
    queryFn: () => listRecentShops(24),
  });
  const shops = data ?? [];

  return (
    <div className="min-h-screen bg-warm-50">
      <PageHead
        title="Pet Shops in Bengaluru — Local Stores & Products | HiSpike"
        description="Discover local pet shops in Bengaluru on HiSpike — browse their products and message them directly on WhatsApp. Food, toys, grooming supplies & more."
        path="/petshops"
      />

      {/* Hero */}
      <div className="bg-gradient-to-br from-primary-600 to-primary-500 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-16 text-center">
          <p className="text-[11px] font-bold tracking-[0.3em] uppercase text-white/80 mb-2">Pet Shops · Bengaluru</p>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight">Local pet shops, one tap away</h1>
          <p className="mt-3 text-white/90 max-w-2xl mx-auto text-lg">
            Browse neighbourhood pet stores, see their products, and message them directly. Own a shop?
            <Link to="/my-shop" className="underline font-semibold ml-1">List it free →</Link>
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        {isLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-40 rounded-3xl border border-warm-200 bg-white animate-pulse" />
            ))}
          </div>
        ) : shops.length === 0 ? (
          <div className="rounded-3xl border-2 border-dashed border-warm-300 p-10 text-center">
            <div className="text-5xl mb-3">🏪</div>
            <p className="text-lg font-bold text-warm-900">No shops listed yet</p>
            <p className="text-warm-500 mt-1">Be the first pet shop in Bengaluru on HiSpike.</p>
            <Link to="/my-shop" className="mt-5 inline-flex rounded-full bg-primary-600 px-6 py-3 text-sm font-bold text-white hover:bg-primary-700 transition-colors">
              Create your shop page — free
            </Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {shops.map((s) => (
              <Link
                key={s.id}
                to={`/petshop/${s.slug}`}
                className="group flex flex-col rounded-3xl border border-warm-200 bg-white p-5 hover:border-primary-300 hover:shadow-md transition"
              >
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-warm-100 overflow-hidden flex items-center justify-center text-2xl shrink-0">
                    {s.logo_url ? <img src={s.logo_url} alt="" className="w-full h-full object-cover" /> : '🏪'}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-warm-900 truncate group-hover:text-primary-700 transition-colors">{s.name}</p>
                    {s.area && <p className="text-xs text-warm-500 truncate">📍 {s.area}</p>}
                  </div>
                </div>
                {s.about && <p className="mt-3 text-sm text-warm-500 leading-relaxed line-clamp-2">{s.about}</p>}
                <span className="mt-3 text-sm font-semibold text-primary-600">View shop →</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
