import { Link } from 'react-router-dom';

export function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero Banner — cinematic wide layout */}
      <section className="relative overflow-hidden bg-gradient-to-r from-primary-900 via-primary-800 to-primary-600 text-white">
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

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-[280px] lg:min-h-[340px] flex items-center">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full py-8 lg:py-10">
            {/* Left: headline + CTA */}
            <div className="max-w-xl">
              <p className="text-[11px] sm:text-xs font-semibold tracking-[0.3em] text-accent-300 mb-2 uppercase">
                Your Dog's Everything, In One Place
              </p>
              <h1 className="text-3xl lg:text-4xl font-extrabold uppercase tracking-tight leading-[1.05] mb-3">
                From Wellness
                <br />
                To Wagging Tails
              </h1>
              <p className="text-sm lg:text-base text-primary-100/90 mb-4 leading-relaxed">
                Trusted vets, dog parks, swim lessons, grooming, and premium
                supplies — every service your best friend needs, under one roof.
              </p>
              <Link
                to="/hospital"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-accent-400 hover:bg-accent-300 text-warm-900 text-sm font-bold tracking-[0.15em] uppercase ring-2 ring-accent-300/50 hover:ring-accent-200 transition-all shadow-lg"
              >
                Explore Services
              </Link>
            </div>

            {/* Right: dog illustration + service label.
                justify-between separates the dog (left) from the brand
                stack (right) so they share the column without overlapping. */}
            <div className="hidden lg:flex items-center justify-between gap-6">
              <span
                aria-hidden="true"
                className="text-[160px] drop-shadow-2xl select-none -scale-x-100 leading-none"
              >
                🐕
              </span>
              <div className="text-right">
                {/* HiSpike wordmark — typographic contrast (light "HI"
                    paired with extrabold "SPIKE") instead of two-tone
                    colour. Both white so it reads cleanly on the dark
                    hero, with a gold underline below. */}
                <p
                  className="text-5xl tracking-[0.12em] uppercase leading-none inline-flex items-center gap-1"
                  style={{ fontFamily: '"Bebas Neue", "Inter", system-ui, sans-serif' }}
                >
                  <span className="text-accent-400 hover:text-white hover:scale-110 transition-all cursor-default inline-block origin-center">HI</span>
                  {/* Inline paw SVG so its colour can be set to gold via
                      currentColor — emoji 🐾 inherits OS colours and can't
                      be tinted with CSS. */}
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-5 h-5 text-accent-400 shrink-0"
                  >
                    <ellipse cx="5.5" cy="11" rx="2" ry="2.6" />
                    <ellipse cx="18.5" cy="11" rx="2" ry="2.6" />
                    <ellipse cx="9" cy="6" rx="1.8" ry="2.4" />
                    <ellipse cx="15" cy="6" rx="1.8" ry="2.4" />
                    <path d="M12 12c-3 0-5 2-5 4.5 0 2.2 1.7 3.5 5 3.5s5-1.3 5-3.5c0-2.5-2-4.5-5-4.5z" />
                  </svg>
                  <span className="text-white hover:text-accent-400 hover:scale-110 transition-all cursor-default inline-block origin-center">SPIKE</span>
                </p>
                <div className="ml-auto mt-3 mb-4 h-0.5 w-20 bg-accent-400 rounded-full" />
                <p className="text-2xl font-extrabold uppercase tracking-tight leading-none text-primary-100">
                  All-In-One
                </p>
                <p className="text-base font-light uppercase tracking-[0.25em] text-primary-100/80 mt-1">
                  Pet Care
                </p>
                <ul className="mt-4 space-y-1.5">
                  {[
                    { icon: '🏥', label: 'Vet Hospital', to: '/hospital' },
                    { icon: '🌳', label: 'Dog Parks', to: '/park' },
                    { icon: '🏊', label: 'Swim Training', to: '/swimming' },
                    { icon: '✂️', label: 'Grooming Salon', to: '/grooming' },
                    { icon: '🛒', label: 'Pet Supplies', to: '/pet-supplies' },
                  ].map(({ icon, label, to }) => (
                    <li key={to}>
                      <Link
                        to={to}
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold tracking-[0.2em] uppercase text-primary-100 bg-white/10 hover:bg-accent-400 hover:text-warm-900 ring-1 ring-white/20 hover:ring-accent-400 transition-all"
                      >
                        <span aria-hidden="true">{icon}</span>
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services / Categories — editorial thumbnail grid */}
      <section className="py-6 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6 sm:gap-8">
            {[
              { label: 'Hospital', dog: '🐶', badge: '🩺', kicker: 'Vet Care', image: '/services/hospital.jpg', tint: 'from-rose-200 to-rose-400', to: '/hospital' },
              { label: 'Park', dog: '🐕', badge: '🌳', kicker: 'Outdoors', image: '/services/park.jpg', tint: 'from-emerald-200 to-emerald-500', to: '/park' },
              { label: 'Swimming', dog: '🐶💦', badge: '🌊', kicker: 'Aquatic', image: '/services/swimming.jpg', tint: 'from-sky-200 to-sky-500', to: '/swimming' },
              { label: 'Grooming', dog: '🐩', badge: '✂️', kicker: 'Salon', image: '/services/grooming.jpg', tint: 'from-amber-200 to-amber-400', to: '/grooming' },
              { label: 'Pet Supplies', dog: '🐶🦴', badge: '🥣', kicker: 'Shop', image: '/services/pet-supplies.jpg', tint: 'from-violet-200 to-violet-400', to: '/pet-supplies' },
            ].map(({ label, dog, badge, kicker, image, tint, to }) => (
              <Link key={label} to={to} className="group block text-center">
                <p className="text-xs text-warm-600 mb-3 tracking-wide">{kicker}</p>
                <div className={`relative mx-auto aspect-square w-20 sm:w-24 lg:w-28 rounded-full overflow-visible bg-gradient-to-br ${tint} ring-1 ring-warm-200 group-hover:ring-primary-400 transition`}>
                  <img
                    src={image}
                    alt=""
                    aria-hidden="true"
                    className="absolute inset-0 w-full h-full object-cover opacity-0 rounded-full transition-all duration-500 group-hover:scale-[1.05]"
                    onLoad={(e) => { (e.currentTarget as HTMLImageElement).style.opacity = '1'; }}
                    onError={(e) => { (e.currentTarget as HTMLImageElement).remove(); }}
                  />
                  <span aria-hidden="true" className="absolute inset-0 flex items-center justify-center text-3xl sm:text-4xl drop-shadow">
                    {dog}
                  </span>
                  <span
                    aria-hidden="true"
                    className="absolute -bottom-1 -right-1 w-11 h-11 sm:w-12 sm:h-12 flex items-center justify-center rounded-full bg-white text-xl sm:text-2xl shadow-lg ring-2 ring-primary-300 group-hover:ring-primary-500 group-hover:scale-110 transition"
                  >
                    {badge}
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
