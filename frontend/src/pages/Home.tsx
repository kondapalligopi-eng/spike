import { Link } from 'react-router-dom';

export function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero Banner — cinematic wide layout */}
      <section className="relative overflow-hidden bg-gradient-to-r from-primary-900 via-primary-800 to-primary-600 text-white">
        {/* Optional real photo — drop /hero-dogs.jpg into public/ to replace the SVG decoration */}
        <img
          src="/hero-dogs.jpg"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover object-right opacity-0 transition-opacity duration-500"
          onLoad={(e) => { (e.currentTarget as HTMLImageElement).style.opacity = '1'; }}
          onError={(e) => { (e.currentTarget as HTMLImageElement).remove(); }}
        />

        {/* Decorative paw-print pattern (full banner) */}
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage:
              `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 60 60'><g fill='white'><path d='M14 18a3 3 0 1 1 0 6 3 3 0 0 1 0-6zm18 0a3 3 0 1 1 0 6 3 3 0 0 1 0-6zM18 8a3 3 0 1 1 0 6 3 3 0 0 1 0-6zm10 0a3 3 0 1 1 0 6 3 3 0 0 1 0-6zm-5 10a6 6 0 0 0-5.3 8.9l-.5 3.3c-.2 1.4.9 2.6 2.3 2.6h7a2.3 2.3 0 0 0 2.3-2.6l-.5-3.3A6 6 0 0 0 23 18z'/></g></svg>")`,
            backgroundSize: '140px 140px',
          }}
        />

        {/* Large stylized dog silhouette on the right */}
        <svg
          aria-hidden="true"
          viewBox="0 0 512 512"
          className="absolute -right-10 bottom-0 h-[110%] w-auto text-accent-300/20 pointer-events-none hidden sm:block"
          fill="currentColor"
        >
          <path d="M437 150c-10-18-32-28-52-23l-32 8c-6-30-32-53-63-53-36 0-65 29-65 65v12l-28 7c-9 2-16 7-20 14l-44 76c-9 15-11 33-6 50l24 78c5 17 21 29 39 29h20v47c0 11 9 20 20 20s20-9 20-20v-48h80v48c0 11 9 20 20 20s20-9 20-20v-51c19-8 33-25 37-46l20-96c3-14 0-29-7-42l-1-2 4-2c17-8 26-27 22-46zM290 67c16 0 29 13 29 29s-13 29-29 29-29-13-29-29 13-29 29-29zm-82 84h43c6 0 11 4 12 10l14 53c1 5-3 10-8 10H161c-5 0-9-5-8-10l10-39c3-12 13-20 25-24zm190 180-20 96c-2 9-10 16-19 16H213c-8 0-15-5-17-13l-24-78c-3-9-2-19 3-27l15-26c1-2 4-2 5 0 6 8 15 12 25 12h130c14 0 27-7 34-19l5-8c1-2 4-2 5 0l6 10c5 7 6 16 4 24z" />
        </svg>

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
                From Wellness
                <br />
                To Wagging Tails
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
