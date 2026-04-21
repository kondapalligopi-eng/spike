import { Link } from 'react-router-dom';

export function Home() {
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
              <p className="text-xs sm:text-sm font-semibold tracking-[0.3em] text-accent-300 mb-4 uppercase">
                Your Dog's Everything, In One Place
              </p>
              <h1 className="text-5xl lg:text-6xl font-extrabold uppercase tracking-tight leading-[1.05] mb-6">
                From Adoption
                <br />
                To Adventure
              </h1>
              <p className="text-lg lg:text-xl text-primary-100/90 mb-8 leading-relaxed">
                Trusted vets, dog parks, swim lessons, grooming, and premium
                supplies — every service your best friend needs, under one roof.
              </p>
              <Link
                to="/hospital"
                className="inline-block px-8 py-3 bg-primary-500 hover:bg-primary-400 text-white font-semibold rounded-md transition-colors shadow-lg"
              >
                Explore Services
              </Link>
            </div>

            {/* Right: service label */}
            <div className="hidden lg:flex items-start justify-end">
              <div className="text-right">
                <p className="text-sm font-semibold tracking-[0.3em] text-primary-200 mb-2">
                  THE CUDDLY FRIEND
                </p>
                <p className="text-5xl font-extrabold uppercase tracking-tight leading-none">
                  All-In-One
                </p>
                <p className="text-2xl font-light uppercase tracking-[0.25em] text-primary-100 mt-2">
                  Pet Care
                </p>
                <ul className="mt-6 text-xs tracking-[0.25em] uppercase text-primary-100/80 space-y-1.5">
                  <li>🏥 Vet Hospital</li>
                  <li>🌳 Dog Parks</li>
                  <li>🏊 Swim Training</li>
                  <li>✂️ Grooming Salon</li>
                  <li>🛒 Pet Supplies</li>
                </ul>
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
              { label: 'Hospital', emoji: '🏥', to: '/hospital' },
              { label: 'Park', emoji: '🌳', to: '/park' },
              { label: 'Swimming', emoji: '🏊', to: '/swimming' },
              { label: 'Grooming', emoji: '✂️', to: '/grooming' },
              { label: 'Pet Supplies', emoji: '🛒', to: '/pet-supplies' },
            ].map(({ label, emoji, to }) => (
              <Link
                key={label}
                to={to}
                className="flex flex-col items-center justify-center gap-2 p-5 rounded-2xl bg-warm-50 border border-warm-200 hover:border-primary-400 hover:bg-primary-50 hover:-translate-y-0.5 transition-all shadow-sm"
              >
                <span className="text-4xl">{emoji}</span>
                <span className="text-sm font-semibold text-warm-800">{label}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
