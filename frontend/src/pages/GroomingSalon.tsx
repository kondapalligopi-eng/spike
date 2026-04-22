import { ReactNode } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getSalon } from '@/data/groomingSalons';

function Stars({ value, size = 'sm' }: { value: number; size?: 'sm' | 'lg' }) {
  const dim = size === 'lg' ? 'text-2xl' : 'text-sm';
  return (
    <div className={`flex items-center gap-0.5 ${dim}`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className={i < value ? 'text-accent-500' : 'text-warm-300'}>
          ★
        </span>
      ))}
    </div>
  );
}

function ServiceImage({ image, emoji }: { image: string; emoji: string }): ReactNode {
  return (
    <div className="relative aspect-[4/3] bg-primary-100 rounded-lg overflow-hidden">
      <img
        src={image}
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).style.display = 'none';
        }}
      />
      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary-200 to-primary-400 text-6xl">
        {emoji}🐕
      </div>
      <div className="absolute left-3 bottom-3 w-16 h-16 rounded-full bg-red-600 text-white flex flex-col items-center justify-center text-center shadow-md border-2 border-white">
        <span className="text-[9px] font-bold leading-tight tracking-wider">GROOMING</span>
        <span className="text-xl leading-none my-0.5">✂️</span>
        <span className="text-[9px] font-bold leading-tight tracking-wider">SALON</span>
      </div>
    </div>
  );
}

export function GroomingSalon() {
  const { slug } = useParams<{ slug: string }>();
  const salon = slug ? getSalon(slug) : undefined;

  if (!salon) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-warm-900 mb-3">Salon not found</h1>
        <p className="text-warm-600 mb-6">
          We couldn't find a grooming salon at that location.
        </p>
        <Link
          to="/grooming"
          className="inline-block px-5 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-md transition-colors"
        >
          See all salons
        </Link>
      </div>
    );
  }

  const totalReviews = salon.ratingDistribution.reduce((sum, r) => sum + r.count, 0);
  const avgRating = (
    salon.ratingDistribution.reduce((sum, r) => sum + r.stars * r.count, 0) / totalReviews
  ).toFixed(1);
  const maxCount = Math.max(...salon.ratingDistribution.map((r) => r.count));

  return (
    <div className="bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Breadcrumb */}
        <nav className="text-xs text-warm-500 mb-3">
          <Link to="/grooming" className="hover:underline">Cuddly Friend Grooming</Link>
          <span className="mx-2">·</span>
          {salon.state}
          <span className="mx-2">·</span>
          <span className="text-warm-800">{salon.area}</span>
        </nav>

        {/* Title */}
        <h1 className="text-3xl font-bold text-warm-900 mb-6">
          {salon.name}
        </h1>

        {/* Grooming Services */}
        <section className="pb-10 border-b border-warm-200">
          <h2 className="text-xl font-bold text-warm-900 mb-6">Grooming Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {salon.services.map((s) => (
              <div key={s.title}>
                <ServiceImage image={s.image} emoji={s.emoji} />
                <h3 className="font-bold text-warm-900 mt-3 mb-1">{s.title}</h3>
                <p className="text-sm text-warm-600 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
          <div className="flex justify-center">
            <button
              type="button"
              className="px-8 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-md transition-colors"
            >
              Book now
            </button>
          </div>
        </section>

        {/* Ratings & reviews */}
        <section className="pt-10 border-t border-warm-200">
          <h2 className="text-xl font-bold text-warm-900 mb-6">Ratings &amp; reviews</h2>

          <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] gap-10">
            <div>
              <div className="mb-4">
                <p className="text-4xl font-bold text-warm-900">{avgRating}</p>
                <Stars value={Math.round(Number(avgRating))} size="lg" />
              </div>
              <ul className="space-y-2">
                {salon.ratingDistribution.map((r) => (
                  <li key={r.stars} className="flex items-center gap-3 text-sm">
                    <span className="w-10 text-warm-700 whitespace-nowrap">
                      {r.stars}<span className="text-accent-500">★</span>
                    </span>
                    <div className="flex-1 h-1.5 bg-warm-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary-500"
                        style={{ width: `${(r.count / maxCount) * 100}%` }}
                      />
                    </div>
                    <span className="w-8 text-right text-warm-500">{r.count}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="text-sm text-warm-500 border-b border-warm-200 pb-3 mb-5">
                1–{salon.reviews.length} of {totalReviews} Reviews
              </p>
              <ul className="space-y-6">
                {salon.reviews.map((r, i) => (
                  <li key={i}>
                    <Stars value={r.stars} />
                    <p className="text-sm mt-1">
                      <span className="font-bold text-warm-900">{r.name}</span>
                      <span className="text-warm-500"> · {r.age}</span>
                    </p>
                    <p className="text-sm text-warm-700 mt-1 leading-relaxed">{r.body}</p>
                    {r.response && (
                      <div className="mt-3 pl-4 border-l-2 border-primary-200">
                        <p className="text-sm font-semibold text-warm-900">
                          Response from {r.response.from}
                          <span className="text-warm-500 font-normal"> · {r.response.age}</span>
                        </p>
                        <p className="text-sm text-warm-600 mt-1 leading-relaxed">{r.response.body}</p>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
