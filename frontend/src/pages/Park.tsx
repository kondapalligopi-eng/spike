import { useState } from 'react';

type ParkSpot = {
  name: string;
  locality: string;
  rating: number;
  image: string;
};

const INFO_ROWS = [
  { icon: '📗', label: 'Address:', value: 'Kasturba Road, Sampangi Rama Nagar, Bengaluru, Karnataka 560001', link: true },
  { icon: '🕐', label: 'Open Times:', value: '5 am to 8 pm' },
  { icon: '💲', label: 'Cost:', value: 'Free to use, may need to pay for parking' },
  { icon: '🐕', label: 'Off-Leash:', value: 'Yes, in designated areas only' },
];

const HIGHLIGHTS = [
  'Neighborhood park with on and off-leash dog play areas',
  'Unfenced, grass surface',
  'Restrooms, a playground, and a community center are also located in the park',
  'Street parking only',
  'Popular spot to socialize with other dog owners and creatives',
];

const SPOTS: ParkSpot[] = [
  {
    name: 'Cubbon Park',
    locality: 'Sampangi Rama Nagar, Bengaluru',
    rating: 5,
    image: '/park-1.jpg',
  },
  {
    name: 'Lalbagh Botanical Garden',
    locality: 'Mavalli, Bengaluru',
    rating: 5,
    image: '/park-2.jpg',
  },
  {
    name: 'Agara Lake Park',
    locality: 'HSR Layout, Bengaluru',
    rating: 4,
    image: '/park-3.jpg',
  },
  {
    name: 'Indiranagar Defence Colony Park',
    locality: 'Indiranagar, Bengaluru',
    rating: 4,
    image: '/park-4.jpg',
  },
  {
    name: 'Bellandur Lake Park',
    locality: 'Bellandur, Bengaluru',
    rating: 4,
    image: '/park-5.jpg',
  },
  {
    name: 'Whitefield Memorial Park',
    locality: 'Whitefield, Bengaluru',
    rating: 4,
    image: '/park-6.jpg',
  },
];

const QUICK_LINKS = [
  { icon: '🏨', label: 'Hotels' },
  { icon: '🍽️', label: 'Restaurants' },
  { icon: '🎾', label: 'Activities' },
  { icon: '🎉', label: 'Events' },
  { icon: '🛎️', label: 'Services' },
];

function PawRating({ value, max = 5 }: { value: number; max?: number }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: max }).map((_, i) => (
        <span
          key={i}
          className={i < value ? 'text-accent-400' : 'text-white/40'}
        >
          🐾
        </span>
      ))}
    </div>
  );
}

function PawRatingDark({ value, max = 5 }: { value: number; max?: number }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: max }).map((_, i) => (
        <span
          key={i}
          className={i < value ? 'text-accent-500' : 'text-warm-300'}
        >
          🐾
        </span>
      ))}
    </div>
  );
}

export function Park() {
  const [query, setQuery] = useState('California');
  const [selectedSpot, setSelectedSpot] = useState<ParkSpot | null>(null);

  const detailInfoRows = (spot: ParkSpot) => [
    { ...INFO_ROWS[0], value: `${spot.locality} — ${INFO_ROWS[0].value.split(',').slice(-2).join(',').trim()}` },
    INFO_ROWS[1],
    INFO_ROWS[2],
    INFO_ROWS[3],
  ];

  return (
    <div className="bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-8">
        {/* Left / main column */}
        <div>
          {selectedSpot ? (
            <>
              {/* Back button */}
              <button
                type="button"
                onClick={() => setSelectedSpot(null)}
                className="inline-flex items-center gap-2 mb-6 text-sm text-primary-700 hover:text-primary-900 font-semibold"
              >
                <span aria-hidden="true">←</span> Back to results
              </button>

              {/* Title */}
              <div className="flex items-start justify-between mb-4 gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-warm-900">{selectedSpot.name}</h2>
                  <p className="text-sm text-warm-500 mt-1">📍 {selectedSpot.locality}</p>
                </div>
                <PawRatingDark value={selectedSpot.rating} />
              </div>

              {/* Info table */}
              <div className="border border-warm-200 rounded-md overflow-hidden mb-8">
                <table className="w-full text-sm">
                  <tbody>
                    {detailInfoRows(selectedSpot).map((row, idx) => (
                      <tr
                        key={row.label}
                        className={idx % 2 === 0 ? 'bg-primary-50' : 'bg-white'}
                      >
                        <td className="w-48 px-4 py-3 font-semibold text-primary-800 border-r border-warm-200">
                          <span className="mr-2">{row.icon}</span>
                          {row.label}
                        </td>
                        <td className="px-4 py-3 text-warm-700">
                          <span className="mr-1">📍</span>
                          {row.link ? (
                            <a href="#" className="text-primary-700 underline hover:text-primary-800">
                              {row.value}
                            </a>
                          ) : (
                            row.value
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Highlights */}
              <ul className="space-y-3 mb-10">
                {HIGHLIGHTS.map((h) => (
                  <li key={h} className="flex items-start gap-3 text-warm-800">
                    <span className="mt-0.5 text-primary-600 text-lg">🐾</span>
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <>
          {/* Search bar */}
          <div className="flex items-center gap-2 mb-3">
            <div className="flex-1 flex items-center gap-2 px-3 py-2 border border-warm-300 rounded-md bg-white">
              <svg className="w-4 h-4 text-warm-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z" />
              </svg>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search location"
                className="w-full text-sm outline-none bg-transparent text-warm-700"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="text-warm-400 hover:text-warm-600 text-sm"
                  aria-label="Clear"
                >
                  ✕
                </button>
              )}
            </div>
            <button
              type="button"
              className="px-5 py-2 bg-primary-500 hover:bg-primary-600 text-white text-sm font-semibold rounded-md transition-colors"
            >
              Fetch
            </button>
          </div>

          {/* Filter row */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-warm-600 border-b border-warm-200 pb-4 mb-6">
            <div className="flex flex-wrap gap-4">
              <button className="hover:text-primary-700 inline-flex items-center gap-1">
                All Activities <span className="text-[10px]">▾</span>
              </button>
              <button className="hover:text-primary-700 inline-flex items-center gap-1">
                Rating <span className="text-accent-400">🐾🐾🐾🐾🐾</span>
              </button>
              <button className="hover:text-primary-700 inline-flex items-center gap-1">
                Distance <span className="text-[10px]">▾</span>
              </button>
              <button className="hover:text-primary-700">Search Within Results</button>
            </div>
            <button className="hover:text-primary-700 inline-flex items-center gap-1">
              Sort by Recommended <span className="text-[10px]">▾</span>
            </button>
          </div>

          {/* Title & intro */}
          <h2 className="text-2xl font-bold text-warm-900 mb-3">
            Dog Friendly Activities in {query || 'Your Area'}
          </h2>
          <p className="text-sm text-warm-600 mb-6 leading-relaxed">
            Don't leave Fido in the hotel room when you're on vacation. Get out and play! No matter where you're
            headed in {query || 'your area'}, we can point you towards the nearest off-leash dog park, the most popular dog
            beach, a really great hiking trail, and lots of other places to play with Fido.
          </p>

          {/* Spot cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {SPOTS.map((spot) => (
              <article
                key={spot.name}
                onClick={() => setSelectedSpot(spot)}
                className="relative rounded-md overflow-hidden aspect-[4/3] bg-warm-200 group cursor-pointer"
              >
                <img
                  src={spot.image}
                  alt={spot.name}
                  className="absolute inset-0 w-full h-full object-cover"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).style.display = 'none';
                  }}
                />
                {/* Fallback */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-6xl opacity-0 [&:has(+img[style*='display: none'])]:opacity-100">
                  🏖️🐕
                </div>
                {/* Top-left badge */}
                <div className="absolute top-3 left-3 w-8 h-8 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center text-white">
                  ☀️
                </div>
                {/* Bottom overlay */}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 text-white">
                  <h3 className="font-bold text-lg leading-tight mb-1">{spot.name}</h3>
                  <PawRating value={spot.rating} />
                  <p className="text-xs text-white/80 mt-1">{spot.locality}</p>
                </div>
              </article>
            ))}
          </div>
            </>
          )}
        </div>

        {/* Right sidebar */}
        <aside className="space-y-6">
          {/* Map card */}
          <div className="border border-warm-200 rounded-md overflow-hidden">
            <div className="relative aspect-[4/3] bg-gradient-to-br from-primary-100 via-warm-100 to-accent-100 flex items-center justify-center">
              <div className="absolute inset-0 opacity-60" style={{
                backgroundImage:
                  'radial-gradient(circle at 30% 40%, #bfdbfe 0, transparent 40%), radial-gradient(circle at 70% 60%, #fef08a 0, transparent 35%)',
              }} />
              <span className="relative text-5xl">🗺️</span>
              <button
                type="button"
                className="absolute top-3 right-3 px-3 py-1.5 bg-warm-900/90 hover:bg-warm-900 text-white text-xs font-semibold rounded-md"
              >
                View Results on Map
              </button>
            </div>
          </div>

          {/* Quick links */}
          <div className="border border-warm-200 rounded-md">
            <div className="px-4 py-3 border-b border-warm-200 text-center">
              <p className="text-xs font-bold tracking-widest text-warm-700">
                {(query || 'LOCAL').toUpperCase()} QUICK LINKS
              </p>
            </div>
            <ul>
              {QUICK_LINKS.map((link) => (
                <li
                  key={link.label}
                  className="flex items-center justify-between px-4 py-3 border-b border-warm-100 last:border-b-0 hover:bg-warm-50 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{link.icon}</span>
                    <span className="text-sm text-warm-800">{link.label}</span>
                  </div>
                  <span className="text-warm-400 text-xs">▾</span>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
