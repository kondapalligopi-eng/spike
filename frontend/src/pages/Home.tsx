import { Link } from 'react-router-dom';
import { useFeaturedDogsQuery, useAdminStatsQuery } from '@/hooks/useDogs';
import { DogCard } from '@/components/DogCard';
import { LoadingSpinner } from '@/components/LoadingSpinner';

export function Home() {
  const { data: featuredDogs, isLoading: dogsLoading } = useFeaturedDogsQuery();
  const { data: stats } = useAdminStatsQuery();

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-500 via-primary-600 to-accent-600 text-white">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 text-9xl">🐶</div>
          <div className="absolute bottom-10 right-10 text-9xl">🐾</div>
          <div className="absolute top-1/2 left-1/4 text-7xl">🦴</div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium mb-6">
              <span>🌟</span>
              <span>Find your perfect furry companion</span>
            </div>
            <h1 className="text-5xl lg:text-7xl font-extrabold leading-tight mb-6">
              Every Dog
              <br />
              <span className="text-primary-200">Deserves a</span>
              <br />
              Loving Home
            </h1>
            <p className="text-xl text-primary-100 mb-10 leading-relaxed max-w-xl">
              Browse hundreds of adoptable dogs from shelters and loving families.
              Your next best friend is just a click away.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/dogs"
                className="px-8 py-4 bg-white text-primary-600 font-bold rounded-2xl hover:bg-primary-50 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Browse Dogs
              </Link>
              <Link
                to="/register"
                className="px-8 py-4 bg-white/20 backdrop-blur-sm text-white font-bold rounded-2xl hover:bg-white/30 transition-all border border-white/30"
              >
                List Your Dog
              </Link>
            </div>
          </div>
        </div>

        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 80L60 72C120 64 240 48 360 42.7C480 37.3 600 42.7 720 48C840 53.3 960 58.7 1080 58.7C1200 58.7 1320 53.3 1380 50.7L1440 48V80H1380C1320 80 1200 80 1080 80C960 80 840 80 720 80C600 80 480 80 360 80C240 80 120 80 60 80H0Z" fill="#fafaf9"/>
          </svg>
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
