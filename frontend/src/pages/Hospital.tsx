import { useState } from 'react';

const SPECIALTIES = [
  'All Specialties',
  'General Checkup',
  'Surgery',
  'Dermatology',
  'Dentistry',
  'Orthopedics',
  'Cardiology',
  'Emergency Care',
];

const LOCATIONS = [
  'All Locations',
  'Indiranagar',
  'Koramangala',
  'Whitefield',
  'HSR Layout',
  'Jayanagar',
  'Marathahalli',
  'Electronic City',
  'BTM Layout',
];

const CITIES = ['Indiranagar', 'Koramangala', 'Whitefield', 'HSR Layout', 'Jayanagar', 'Marathahalli'];

export function Hospital() {
  const [search, setSearch] = useState('');
  const [specialty, setSpecialty] = useState(SPECIALTIES[0]);
  const [location, setLocation] = useState(LOCATIONS[0]);
  const [activeCity, setActiveCity] = useState<string | null>(null);

  return (
    <div className="bg-white">
      {/* Search toolbar */}
      <section className="border-b border-warm-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-wrap items-center gap-2 lg:gap-3">
            {/* Search input */}
            <label className="flex items-center gap-2 px-3 py-2 border border-warm-300 rounded-md bg-white flex-1 min-w-[200px]">
              <svg className="w-4 h-4 text-warm-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z" />
              </svg>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search Vet"
                className="w-full text-sm outline-none bg-transparent placeholder:text-warm-400"
              />
            </label>

            {/* Specialty */}
            <div className="flex items-center gap-2 px-3 py-2 border border-warm-300 rounded-md bg-white min-w-[200px]">
              <svg className="w-4 h-4 text-warm-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <select
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
                className="w-full text-sm outline-none bg-transparent text-warm-700"
              >
                {SPECIALTIES.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* Location */}
            <div className="flex items-center gap-2 px-3 py-2 border border-warm-300 rounded-md bg-white min-w-[200px]">
              <svg className="w-4 h-4 text-warm-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full text-sm outline-none bg-transparent text-warm-700"
              >
                {LOCATIONS.map((l) => (
                  <option key={l}>{l}</option>
                ))}
              </select>
            </div>

            {/* Search button */}
            <button
              type="button"
              className="inline-flex items-center gap-2 px-5 py-2 bg-primary-700 hover:bg-primary-800 text-white text-sm font-semibold rounded-md transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z" />
              </svg>
              Search
            </button>

            {/* Call Now */}
            <button
              type="button"
              className="inline-flex items-center gap-2 px-5 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-md transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              Call Now
            </button>

            {/* Book */}
            <button
              type="button"
              className="inline-flex items-center gap-2 px-5 py-2 bg-accent-500 hover:bg-accent-600 text-warm-900 text-sm font-semibold rounded-md transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Book An Appointment
            </button>

            {/* Emergency */}
            <button
              type="button"
              aria-label="Emergency"
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary-900 hover:bg-primary-950 text-white text-sm font-semibold rounded-md transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h8m-8 4h8m-8 4h5m5 5l3-3m0 0l-3-3m3 3H9a4 4 0 01-4-4V7a4 4 0 014-4h6a4 4 0 014 4v4" />
              </svg>
            </button>
          </div>
        </div>
      </section>

      {/* Dark title strip */}
      <section className="bg-primary-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-xl sm:text-2xl font-semibold">Best Pet Hospitals Near Me</h1>
        </div>
      </section>

      {/* City chips */}
      <section className="bg-white border-b border-warm-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-wrap justify-center gap-3">
            {CITIES.map((city) => {
              const active = activeCity === city;
              return (
                <button
                  key={city}
                  type="button"
                  onClick={() => setActiveCity(active ? null : city)}
                  className={`px-5 py-1.5 rounded-full border text-sm font-medium transition-colors ${
                    active
                      ? 'bg-primary-700 text-white border-primary-700'
                      : 'bg-white text-primary-700 border-warm-300 hover:border-primary-600 hover:text-primary-800'
                  }`}
                >
                  {city}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Results placeholder */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                name: 'Bandra Pet Care Hospital',
                locality: 'Bandra West',
                specialties: 'General, Surgery, Dermatology',
                rating: '4.8',
              },
              {
                name: 'Mulund Animal Clinic',
                locality: 'Mulund',
                specialties: 'General, Dentistry, Orthopedics',
                rating: '4.6',
              },
              {
                name: 'Vashi 24x7 Vet Emergency',
                locality: 'Vashi',
                specialties: 'Emergency, Critical Care',
                rating: '4.9',
              },
              {
                name: 'Mahim Companion Hospital',
                locality: 'Mahim',
                specialties: 'General, Cardiology',
                rating: '4.7',
              },
              {
                name: 'Kalyan Paws & Claws Centre',
                locality: 'Kalyan',
                specialties: 'General, Dermatology',
                rating: '4.5',
              },
              {
                name: 'Andheri Veterinary Superspeciality',
                locality: 'Andheri East',
                specialties: 'Surgery, Orthopedics, Oncology',
                rating: '4.8',
              },
            ]
              .filter((h) => !activeCity || h.locality.toLowerCase().includes(activeCity.toLowerCase()))
              .map((h) => (
                <div
                  key={h.name}
                  className="p-6 rounded-2xl border border-warm-200 hover:border-primary-400 hover:shadow-md transition-all bg-white"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 rounded-lg bg-primary-100 text-primary-700 flex items-center justify-center text-xl">
                      🏥
                    </div>
                    <div className="flex items-center gap-1 text-sm font-semibold text-accent-600">
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.363 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.176 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.363-1.118L2.98 8.719c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      {h.rating}
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-warm-900 mb-1">{h.name}</h3>
                  <p className="text-sm text-warm-500 mb-3">📍 {h.locality}</p>
                  <p className="text-sm text-warm-600 mb-4">{h.specialties}</p>
                  <div className="flex gap-2">
                    <button className="flex-1 px-3 py-2 bg-primary-600 hover:bg-primary-700 text-white text-xs font-semibold rounded-md transition-colors">
                      Book
                    </button>
                    <button className="flex-1 px-3 py-2 border border-warm-300 hover:border-primary-400 text-warm-700 text-xs font-semibold rounded-md transition-colors">
                      Call
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </section>
    </div>
  );
}
