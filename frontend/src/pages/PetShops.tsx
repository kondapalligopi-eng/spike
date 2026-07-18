import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { listRecentShops } from '@/api/petShops';
import { PageHead } from '@/components/PageHead';
import { HeroPaws } from '@/components/HeroPaws';
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
      <section className="relative overflow-hidden bg-gradient-to-r from-primary-900 via-primary-800 to-primary-600 text-white">
        <HeroPaws />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6">
          <span aria-hidden="true" className="text-4xl sm:text-5xl drop-shadow">🏪</span>
          <div className="flex-1">
            <p className="text-[11px] sm:text-xs font-semibold tracking-[0.3em] text-accent-400 uppercase mb-1">
              Pet Shops · Bengaluru
            </p>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight">
              Local Pet Shops in Bengaluru
            </h1>
            <div className="mt-2 h-0.5 w-16 bg-accent-400 rounded-full" />
            <p className="mt-2 text-sm text-primary-100/90 max-w-2xl">
              Browse neighbourhood pet stores, see their products, and message them directly on WhatsApp — food, toys, grooming supplies, and more.
            </p>
          </div>
          <Link
            to="/my-shop"
            className="self-start md:self-auto inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-accent-400 hover:bg-accent-300 text-warm-900 text-sm font-bold tracking-[0.15em] uppercase ring-2 ring-accent-300/50 hover:ring-accent-200 transition-all shadow-md"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            List Your Shop
          </Link>
        </div>
      </section>

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
