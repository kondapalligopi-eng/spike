import { Link } from 'react-router-dom';
import { useFeaturedDogsQuery, useAdminStatsQuery } from '@/hooks/useDogs';
import { DogCard } from '@/components/DogCard';
import { LoadingSpinner } from '@/components/LoadingSpinner';

export function Home() {
  const { data: featuredDogs, isLoading: dogsLoading } = useFeaturedDogsQuery();
  const { data: stats } = useAdminStatsQuery();

  return (
    <div className="flex flex-col">
      {/* Hero Banner — cinematic wide layout */}
      <section className="relative overflow-hidden bg-gradient-to-r from-primary-900 via-primary-800 to-primary-600 text-white">
        {/* Background image (optional — drop /hero-dogs.jpg into public/) */}
        <img
          src="/hero-dogs.jpg"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover object-right opacity-0 transition-opacity duration-500"
          onLoad={(e) => { (e.currentTarget as HTMLImageElement).style.opacity = '1'; }}
          onError={(e) => { (e.currentTarget as HTMLImageElement).remove(); }}
        />
        {/* Left-to-right dark gradient overlay so text stays readable */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary-900/95 via-primary-900/70 to-transparent" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-[460px] lg:min-h-[540px] flex items-center">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full py-16 lg:py-20">
            {/* Left: headline + CTA */}
            <div className="max-w-xl">
              <h1 className="text-5xl lg:text-6xl font-extrabold uppercase tracking-tight leading-[1.05] mb-6">
                Make That Tail-Wag
                <br />
                Feeling Last
              </h1>
              <p className="text-lg lg:text-xl text-primary-100/90 mb-8 leading-relaxed">
                The joy of companionship never ends when you're
                <br className="hidden sm:block" />
                coming home to the ultimate best friend.
              </p>
              <Link
                to="/dogs"
                className="inline-block px-8 py-3 bg-primary-500 hover:bg-primary-400 text-white font-semibold rounded-md transition-colors shadow-lg"
              >
                Find Yours
              </Link>
            </div>

            {/* Right: event label */}
            <div className="hidden lg:flex items-start justify-end">
              <div className="text-right">
                <p className="text-sm font-semibold tracking-[0.3em] text-primary-200 mb-2">
                  THE CUDDLY FRIEND
                </p>
                <p className="text-5xl font-extrabold uppercase tracking-tight leading-none">
                  Adoption
                </p>
                <p className="text-2xl font-light uppercase tracking-[0.25em] text-primary-100 mt-2">
                  Event
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services / Categories */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
            {[
              { label: 'Hospital', emoji: '🏥' },
              { label: 'Park', emoji: '🌳' },
              { label: 'Swimming', emoji: '🏊' },
              { label: 'Grooming', emoji: '✂️' },
              { label: 'Pet Supplies', emoji: '🛒' },
            ].map(({ label, emoji }) => (
              <button
                key={label}
                type="button"
                className="flex flex-col items-center justify-center gap-2 p-5 rounded-2xl bg-warm-50 border border-warm-200 hover:border-primary-400 hover:bg-primary-50 hover:-translate-y-0.5 transition-all shadow-sm"
              >
                <span className="text-4xl">{emoji}</span>
                <span className="text-sm font-semibold text-warm-800">{label}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      {stats && (
        <section className="py-12 bg-warm-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { label: 'Dogs Listed', value: stats.total_dogs, emoji: '🐕' },
                { label: 'Available Now', value: stats.available_dogs, emoji: '✅' },
                { label: 'Families Helped', value: stats.total_users, emoji: '👨‍👩‍👧' },
                { label: 'Happy Adoptions', value: stats.adopted_dogs, emoji: '❤️' },
              ].map(({ label, value, emoji }) => (
                <div
                  key={label}
                  className="bg-white rounded-2xl p-6 text-center shadow-sm border border-warm-200"
                >
                  <div className="text-4xl mb-2">{emoji}</div>
                  <div className="text-3xl font-extrabold text-warm-900">{value.toLocaleString()}</div>
                  <div className="text-sm text-warm-500 mt-1">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Dogs */}
      <section className="py-16 bg-warm-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-primary-600 font-semibold text-sm uppercase tracking-wider mb-2">
                Waiting for a home
              </p>
              <h2 className="text-4xl font-extrabold text-warm-900">
                Meet Our Dogs
              </h2>
            </div>
            <Link
              to="/dogs"
              className="hidden sm:flex items-center gap-2 text-primary-600 font-semibold hover:text-primary-700 transition-colors"
            >
              View all dogs →
            </Link>
          </div>

          {dogsLoading ? (
            <div className="flex justify-center py-16">
              <LoadingSpinner size="lg" />
            </div>
          ) : featuredDogs && featuredDogs.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredDogs.map((dog) => (
                <DogCard key={dog.id} dog={dog} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🐾</div>
              <p className="text-warm-500 text-lg">No dogs available yet.</p>
              <Link to="/my-dogs/new" className="mt-4 inline-block text-primary-600 font-medium hover:underline">
                Be the first to list a dog →
              </Link>
            </div>
          )}

          <div className="mt-10 text-center sm:hidden">
            <Link
              to="/dogs"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary-500 text-white font-semibold rounded-xl hover:bg-primary-600 transition-colors"
            >
              Browse All Dogs →
            </Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-extrabold text-warm-900 mb-4">How It Works</h2>
            <p className="text-warm-500 text-lg max-w-xl mx-auto">
              Finding your perfect companion has never been easier
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Browse Dogs',
                description: 'Explore our collection of adoptable dogs. Filter by breed, size, age, and more to find your perfect match.',
                emoji: '🔍',
              },
              {
                step: '02',
                title: 'Submit Request',
                description: 'Found the one? Submit an adoption request with a personal message about why you\'d be a great owner.',
                emoji: '📝',
              },
              {
                step: '03',
                title: 'Welcome Home',
                description: 'Once approved, coordinate with the current owner and welcome your new best friend home!',
                emoji: '🏠',
              },
            ].map(({ step, title, description, emoji }) => (
              <div key={step} className="relative flex flex-col items-center text-center p-8 rounded-2xl bg-warm-50 border border-warm-200">
                <div className="text-5xl mb-4">{emoji}</div>
                <div className="text-xs font-bold text-primary-500 uppercase tracking-widest mb-2">
                  Step {step}
                </div>
                <h3 className="text-xl font-bold text-warm-900 mb-3">{title}</h3>
                <p className="text-warm-500 leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-16 bg-gradient-to-r from-primary-500 to-accent-500 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-extrabold mb-4">
            Have a Dog Looking for a Home?
          </h2>
          <p className="text-primary-100 text-lg mb-8 max-w-xl mx-auto">
            Create a listing in minutes and connect with thousands of potential adopters.
          </p>
          <Link
            to="/my-dogs/new"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-primary-600 font-bold rounded-2xl hover:bg-primary-50 transition-all shadow-lg"
          >
            List a Dog for Adoption
          </Link>
        </div>
      </section>
    </div>
  );
}
