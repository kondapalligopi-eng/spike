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

      {/* Services / Categories — editorial thumbnail grid */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6 sm:gap-8">
            {[
              { label: 'Hospital', emoji: '🏥', kicker: 'Vet Care', image: '/services/hospital.jpg', tint: 'from-rose-200 to-rose-400', to: '/hospital' },
              { label: 'Park', emoji: '🌳', kicker: 'Outdoors', image: '/services/park.jpg', tint: 'from-emerald-200 to-emerald-500', to: '/park' },
              { label: 'Swimming', emoji: '🏊', kicker: 'Aquatic', image: '/services/swimming.jpg', tint: 'from-sky-200 to-sky-500', to: '/swimming' },
              { label: 'Grooming', emoji: '✂️', kicker: 'Salon', image: '/services/grooming.jpg', tint: 'from-amber-200 to-amber-400', to: '/grooming' },
              { label: 'Pet Supplies', emoji: '🛒', kicker: 'Shop', image: '/services/pet-supplies.jpg', tint: 'from-violet-200 to-violet-400', to: '/pet-supplies' },
            ].map(({ label, emoji, kicker, image, tint, to }) => (
              <Link key={label} to={to} className="group block text-center">
                <p className="text-xs text-warm-600 mb-3 tracking-wide">{kicker}</p>
                <div className={`relative aspect-[4/3] overflow-hidden bg-gradient-to-br ${tint}`}>
                  <img
                    src={image}
                    alt=""
                    aria-hidden="true"
                    className="absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-500 group-hover:scale-[1.03]"
                    onLoad={(e) => { (e.currentTarget as HTMLImageElement).style.opacity = '1'; }}
                    onError={(e) => { (e.currentTarget as HTMLImageElement).remove(); }}
                  />
                  <span aria-hidden="true" className="absolute inset-0 flex items-center justify-center text-5xl drop-shadow">
                    {emoji}
                  </span>
                  <span className="absolute bottom-2 right-2 text-[11px] font-medium text-white bg-black/60 px-2 py-0.5 rounded-sm tracking-wide">
                    {emoji}
                  </span>
                </div>
                <p className="mt-3 text-sm text-warm-900 group-hover:text-primary-700 transition-colors">{label}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
