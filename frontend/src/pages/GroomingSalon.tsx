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

        {/* Top info card */}
        <section className="grid grid-cols-1 md:grid-cols-[1fr_1fr_1.2fr] gap-6 pb-10 border-b border-warm-200">
          <div>
            <p className="text-sm text-warm-700 mb-1">
              <span className="font-semibold">Cuddly Friend Grooming</span>{' '}
              <Link to="/grooming" className="text-accent-600 hover:underline text-xs ml-1">
                Change
              </Link>
            </p>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-bold text-warm-900">{avgRating}</span>
              <Stars value={Math.round(Number(avgRating))} />
              <span className="text-xs text-warm-500">{totalReviews} reviews</span>
            </div>
            <p className="text-sm text-warm-700">{salon.address}</p>
            <p className="text-sm text-warm-500 mb-4">{salon.phone}</p>
            <button
              type="button"
              className="text-sm font-semibold text-accent-600 hover:underline mb-4 block"
            >
              Get Directions
            </button>
            <button
              type="button"
              className="inline-block px-5 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-md transition-colors"
            >
              Book now
            </button>
          </div>

          <div>
            <p className="text-sm text-primary-700 font-semibold mb-2">
              Open today until {salon.openTodayUntil}
            </p>
            <dl className="text-sm space-y-0.5">
              {salon.hours.map((h) => (
                <div key={h.day} className="flex justify-between max-w-[180px] text-warm-700">
                  <dt className="italic">{h.day}</dt>
                  <dd className="italic">{h.hours}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="relative rounded-md overflow-hidden border border-warm-200 min-h-[180px] bg-gradient-to-br from-warm-100 via-primary-50 to-accent-50">
            <div
              aria-hidden="true"
              className="absolute inset-0 opacity-70"
              style={{
                backgroundImage:
                  'linear-gradient(115deg, #e5e7eb 20%, transparent 20%), linear-gradient(65deg, #fef9c3 25%, transparent 25%), radial-gradient(circle at 80% 30%, #bfdbfe 0, transparent 40%)',
              }}
            />
            <div className="absolute top-3 left-3 text-[10px] font-bold tracking-widest text-warm-600">
              {salon.mapLabel.map((line, i) => (
                <span key={i}>
                  {line}
                  {i < salon.mapLabel.length - 1 && <br />}
                </span>
              ))}
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <svg className="w-10 h-10 text-primary-700 drop-shadow" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5A2.5 2.5 0 0112 6.5a2.5 2.5 0 010 5z" />
              </svg>
            </div>
          </div>
        </section>

        {/* Grooming Services */}
        <section className="py-10">
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
