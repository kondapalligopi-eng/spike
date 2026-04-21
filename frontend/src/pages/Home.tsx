import { Link } from 'react-router-dom';

export function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero Banner — logo-matching palette (yellow + dark navy) */}
      <section className="relative overflow-hidden bg-gradient-to-br from-accent-300 via-accent-400 to-accent-500 text-warm-900">
        {/* Optional real photo — drop /hero-dogs.jpg into public/ to replace the SVG decoration */}
        <img
          src="/hero-dogs.jpg"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover object-right opacity-0 transition-opacity duration-500"
          onLoad={(e) => { (e.currentTarget as HTMLImageElement).style.opacity = '1'; }}
          onError={(e) => { (e.currentTarget as HTMLImageElement).remove(); }}
        />

        {/* Decorative paw-print pattern in dark navy (matches logo dog silhouette) */}
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-[0.10]"
          style={{
            backgroundImage:
              `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 60 60'><g fill='%23172554'><path d='M14 18a3 3 0 1 1 0 6 3 3 0 0 1 0-6zm18 0a3 3 0 1 1 0 6 3 3 0 0 1 0-6zM18 8a3 3 0 1 1 0 6 3 3 0 0 1 0-6zm10 0a3 3 0 1 1 0 6 3 3 0 0 1 0-6zm-5 10a6 6 0 0 0-5.3 8.9l-.5 3.3c-.2 1.4.9 2.6 2.3 2.6h7a2.3 2.3 0 0 0 2.3-2.6l-.5-3.3A6 6 0 0 0 23 18z'/></g></svg>")`,
            backgroundSize: '140px 140px',
          }}
        />

        {/* Soft yellow gradient overlay so text stays crisp */}
        <div className="absolute inset-0 bg-gradient-to-r from-accent-300/90 via-accent-400/60 to-transparent" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-[460px] lg:min-h-[540px] flex items-center">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full py-16 lg:py-20">
            {/* Left: headline + CTA */}
            <div className="max-w-xl">
              <p className="text-xs sm:text-sm font-semibold tracking-[0.3em] text-primary-900 mb-4 uppercase">
                Your Dog's Everything, In One Place
              </p>
              <h1 className="text-5xl lg:text-6xl font-extrabold uppercase tracking-tight leading-[1.05] mb-6 text-primary-950">
                From Wellness
                <br />
                To Wagging Tails
              </h1>
              <p className="text-lg lg:text-xl text-warm-800 mb-8 leading-relaxed">
                Trusted vets, dog parks, swim lessons, grooming, and premium
                supplies — every service your best friend needs, under one roof.
              </p>
              <Link
                to="/hospital"
                className="inline-block px-8 py-3 bg-primary-900 hover:bg-primary-800 text-white font-semibold rounded-md transition-colors shadow-lg"
              >
                Explore Services
              </Link>
            </div>

            {/* Right: service label */}
            <div className="hidden lg:flex items-start justify-end">
              <div className="text-right">
                <p className="text-sm font-semibold tracking-[0.3em] text-primary-900 mb-2">
                  THE CUDDLY FRIEND
                </p>
                <p className="text-5xl font-extrabold uppercase tracking-tight leading-none text-primary-950">
                  All-In-One
                </p>
                <p className="text-2xl font-light uppercase tracking-[0.25em] text-warm-800 mt-2">
                  Pet Care
                </p>
                <ul className="mt-6 text-xs tracking-[0.25em] uppercase text-warm-800 space-y-1.5">
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
