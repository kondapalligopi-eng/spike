import { Link } from 'react-router-dom';
import { GROOMING_SALONS } from '@/data/groomingSalons';

function salonAvgRating(dist: { stars: number; count: number }[]) {
  const total = dist.reduce((s, r) => s + r.count, 0);
  if (total === 0) return { avg: '0.0', total: 0 };
  const sum = dist.reduce((s, r) => s + r.stars * r.count, 0);
  return { avg: (sum / total).toFixed(1), total };
}

export function Grooming() {
  return (
    <div className="bg-white">
      {/* Page intro */}
      <section className="bg-gradient-to-br from-primary-800 to-primary-600 text-white py-14">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-sm font-semibold tracking-[0.3em] text-primary-200 mb-3">
            CUDDLY FRIEND · GROOMING SALONS
          </p>
          <h1 className="text-4xl lg:text-5xl font-extrabold uppercase tracking-tight mb-4">
            Find a Salon Near You
          </h1>
          <p className="text-primary-100 text-lg max-w-2xl">
            Bath, blow-dry, breed-specific styling, and walk-in touch-ups across
            Bengaluru. Pick a location to see hours, services, and reviews.
          </p>
        </div>
      </section>

      {/* Salon tiles */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {GROOMING_SALONS.map((salon) => {
            const { avg, total } = salonAvgRating(salon.ratingDistribution);
            return (
              <Link
                key={salon.slug}
                to={`/grooming/${salon.slug}`}
                className="group block rounded-lg border border-warm-200 hover:border-primary-400 hover:shadow-md transition overflow-hidden bg-white"
              >
                <div
                  className={`relative aspect-[4/3] bg-gradient-to-br ${salon.tint} flex items-center justify-center`}
                >
                  <span className="text-6xl drop-shadow-sm">{salon.heroEmoji}🐕</span>
                  <div className="absolute left-3 bottom-3 w-14 h-14 rounded-full bg-red-600 text-white flex flex-col items-center justify-center text-center shadow-md border-2 border-white">
                    <span className="text-[8px] font-bold leading-tight tracking-wider">GROOM</span>
                    <span className="text-lg leading-none my-0.5">✂️</span>
                    <span className="text-[8px] font-bold leading-tight tracking-wider">SALON</span>
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-xs font-semibold tracking-[0.2em] text-primary-600 uppercase mb-1">
                    {salon.city}
                  </p>
                  <h3 className="font-bold text-warm-900 group-hover:text-primary-700 transition-colors mb-1">
                    {salon.area}
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs text-warm-600 mb-2">
                    <span className="font-semibold text-warm-900">{avg}</span>
                    <span className="text-accent-500">★</span>
                    <span>· {total} reviews</span>
                  </div>
                  <p className="text-xs text-warm-500 line-clamp-2">{salon.address}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
