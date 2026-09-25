import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { listAllShops, listRecentShops } from '@/api/petShops';
import { PageHead } from '@/components/PageHead';
import { HeroPaws } from '@/components/HeroPaws';
import { useAuth } from '@/hooks/useAuth';
import { useBackendWarmup } from '@/lib/warmupBackend';

export function PetShops() {
  useBackendWarmup();
  const { user, isAdmin } = useAuth();
  // Demo storefronts are filtered out of the public list server-side. Admins
  // read the moderation list instead, which still includes them, so the demo
  // stays one click away for us without being part of the directory.
  const { data, isLoading } = useQuery({
    queryKey: ['pet-shops-directory', isAdmin],
    queryFn: () => (isAdmin ? listAllShops() : listRecentShops(24)),
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
          {/* Goes to the pitch, not the form: an owner arriving cold has no idea
              a storefront, shelves and order flow sit behind this button. */}
          <Link
            to="/for-shops"
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
            {/* An empty directory is the moment the pitch matters most — say what
                a shop actually gets rather than only asking them to sign up. */}
            <ul className="mt-5 mx-auto max-w-md text-left text-sm text-warm-600 space-y-2">
              <li className="flex gap-2"><span aria-hidden="true">🏪</span> Your own shop page with your products and timings</li>
              <li className="flex gap-2"><span aria-hidden="true">💬</span> Customers order on WhatsApp, or straight from the page</li>
              <li className="flex gap-2"><span aria-hidden="true">💸</span> They pay you directly — no commission, no setup fee</li>
            </ul>
            <Link to="/for-shops" className="mt-6 inline-flex rounded-full bg-primary-600 px-6 py-3 text-sm font-bold text-white hover:bg-primary-700 transition-colors">
              See what you get — it&rsquo;s free
            </Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {shops.map((s) => {
              const isOwner = !!user && String(s.owner_id) === String(user.id);
              return (
                <div
                  key={s.id}
                  className="group relative flex flex-col rounded-3xl border border-warm-200 bg-white p-5 hover:border-primary-300 hover:shadow-md transition"
                >
                  {/* Stretched link makes the whole card open the storefront in
                      a new tab, while the Edit link below sits above it (z-10). */}
                  <Link
                    to={`/petshop/${s.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute inset-0 rounded-3xl"
                    aria-label={`View ${s.name}`}
                  />
                  {s.hidden && (
                    <span className="absolute top-3 left-3 z-10 inline-flex items-center gap-1 rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">
                      Admin only
                    </span>
                  )}
                  {isOwner && (
                    <Link
                      to="/my-shop"
                      className="absolute top-3 right-3 z-10 inline-flex items-center gap-1 rounded-full border border-primary-200 bg-primary-50 px-3 py-1 text-xs font-bold text-primary-700 hover:bg-primary-100 transition-colors"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Edit
                    </Link>
                  )}
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
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
