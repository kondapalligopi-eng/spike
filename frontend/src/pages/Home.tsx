import { Link } from 'react-router-dom';
import { PageHead } from '@/components/PageHead';
import { useBackendWarmup } from '@/lib/warmupBackend';

export function Home() {
  // Wake the Render dyno the moment any user lands here, so by the time they
  // click into Hospital / Park / Swimming / Grooming the API is warm. Cheap
  // win for Google-search visitors who often land on Home first.
  useBackendWarmup();

  return (
    <div className="flex flex-col">
      <PageHead
        title="HiSpike — All-In-One Pet Care for Dogs in Bengaluru"
        description="HiSpike is Bengaluru's all-in-one pet care platform — find trusted vets, dog parks, swim coaches, grooming salons, and premium pet supplies in one place. Verified providers, honest reviews, hyperlocal."
        path="/"
      />

      {/* Announcement bar — full-width band sitting flush above the hero,
          using the HiSpike accent yellow (matches the logo's yellow circle). */}
      <div
        role="region"
        aria-label="Announcement"
        className="bg-gradient-to-r from-accent-300 via-accent-400 to-accent-300 text-warm-900 text-sm sm:text-base font-semibold text-center py-2.5 px-4 border-y border-accent-500/30"
      >
        <span aria-hidden="true" className="mr-1.5">🐾</span>
        List your pet business on HiSpike — free for verified providers in Bengaluru
        <Link
          to="/feedback"
          className="ml-2 underline underline-offset-2 hover:text-warm-700 font-bold"
        >
          Get listed →
        </Link>
      </div>

      {/* Hero Banner — cinematic wide layout */}
      <section className="relative overflow-hidden bg-gradient-to-r from-primary-900 via-primary-800 to-primary-600 text-white">
        {/* Decorative paws — scattered at hand-picked spots instead of a tiled
            grid so the banner feels organic, not corporate. Each paw pulses
            between 6% and 20% opacity, with a small per-paw animation-delay
            so they don't blink in lockstep. Honours prefers-reduced-motion. */}
        <style>{`
          @keyframes hero-paw-pulse {
            0%, 100% { opacity: 0.06; }
            50%       { opacity: 0.20; }
          }
          /* Base opacity set statically (not only via keyframes) so the paws
             still look intentional when the animation can't run — corporate
             Chrome with hardware acceleration off, or prefers-reduced-motion.
             No will-change: promoting these to GPU compositor layers makes them
             freeze on the first frame when the GPU is blocklisted; opacity
             animates fine on the main thread without it. */
          .hero-paw-bg { opacity: 0.12; animation: hero-paw-pulse 2.6s ease-in-out infinite; }
          @keyframes hero-sparkle {
            0%, 100% { opacity: 0;   transform: translate(-50%, -50%) scale(0)   rotate(0deg); }
            45%      { opacity: 1;   transform: translate(-50%, -50%) scale(1)   rotate(25deg); }
            55%      { opacity: 0.9; transform: translate(-50%, -50%) scale(1.1) rotate(30deg); }
          }
          .hero-sparkle {
            opacity: 0.6;
            animation: hero-sparkle 2.2s ease-in-out infinite;
            filter: drop-shadow(0 0 4px rgba(255,255,255,0.9));
          }
          @media (prefers-reduced-motion: reduce) {
            .hero-paw-bg, .hero-sparkle { animation: none !important; }
          }
        `}</style>

        <div aria-hidden="true" className="absolute inset-0 pointer-events-none">
          {/* Paws are pinned to the top and bottom safe bands of the hero so
              they never sit on top of the wordmark, the "ALL-IN-ONE" line, or
              the service-button column. Vertical extremes are the only zones
              with no text on either breakpoint. */}
          {[
            { top: '6%',  left: '4%',  size: 50, rotate: -14, delay: 0   },
            { top: '4%',  left: '24%', size: 38, rotate: -6,  delay: 1.2 },
            { top: '3%',  left: '46%', size: 42, rotate: -20, delay: 1.5 },
            { top: '5%',  left: '72%', size: 36, rotate: 12,  delay: 1.8 },
            { top: '86%', left: '8%',  size: 42, rotate: 16,  delay: 0.6 },
            { top: '88%', left: '30%', size: 34, rotate: 22,  delay: 0.3 },
            { top: '84%', left: '54%', size: 44, rotate: 8,   delay: 0.9 },
            { top: '90%', left: '80%', size: 36, rotate: -10, delay: 0.4 },
          ].map((p, i) => (
            // Each paw is wrapped with 3 sparkle stars positioned around it,
            // so the sparkles read as the paw glinting — not as decoration
            // floating somewhere else on the hero.
            <div
              key={i}
              className="absolute"
              style={{
                top: p.top, left: p.left,
                width: p.size, height: p.size,
              }}
            >
              <svg
                viewBox="0 0 60 60"
                className="hero-paw-bg block w-full h-full"
                style={{
                  transform: `rotate(${p.rotate}deg)`,
                  animationDelay: `${p.delay}s`,
                }}
              >
                <g fill="white">
                  <ellipse cx="14" cy="28" rx="5" ry="6.5" />
                  <ellipse cx="46" cy="28" rx="5" ry="6.5" />
                  <ellipse cx="22.5" cy="15" rx="4.5" ry="6" />
                  <ellipse cx="37.5" cy="15" rx="4.5" ry="6" />
                  <path d="M30 30c-7.5 0-12.5 5-12.5 11.25 0 5.5 4.25 8.75 12.5 8.75s12.5-3.25 12.5-8.75c0-6.25-5-11.25-12.5-11.25z" />
                </g>
              </svg>
              {[
                { top: '-5%',  left: '95%',  scale: 0.32, offset: 0    },
                { top: '60%',  left: '-10%', scale: 0.28, offset: 0.55 },
                { top: '100%', left: '50%',  scale: 0.24, offset: 1.05 },
              ].map((sp, j) => (
                <svg
                  key={j}
                  viewBox="0 0 10 10"
                  className="absolute hero-sparkle"
                  style={{
                    top: sp.top, left: sp.left,
                    width: p.size * sp.scale,
                    height: p.size * sp.scale,
                    animationDelay: `${p.delay + sp.offset}s`,
                  }}
                >
                  <path
                    d="M5 0 L5.9 4.1 L10 5 L5.9 5.9 L5 10 L4.1 5.9 L0 5 L4.1 4.1 Z"
                    fill="white"
                  />
                </svg>
              ))}
            </div>
          ))}
        </div>

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
                    { icon: '🦮', label: 'Dog Walking', to: '/dog-walking' },
                    { icon: '🛒', label: 'Pet Supplies', to: '/pet-supplies' },
                  ].map(({ icon, label, to }) => (
                    <li key={to}>
                      <Link
                        to={to}
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold tracking-[0.2em] uppercase bg-accent-400 hover:bg-accent-300 text-warm-900 ring-2 ring-accent-300/50 hover:ring-accent-200 transition-all shadow-md"
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
      <section className="py-10 bg-primary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6 sm:gap-8">
            {[
              { label: 'Hospital', dog: '🐶', badge: '🩺', kicker: 'Vet Care', image: '/services/hospital.jpg', tint: 'from-rose-200 to-rose-400', to: '/hospital' },
              { label: 'Park', dog: '🐕', badge: '🌳', kicker: 'Outdoors', image: '/services/park.jpg', tint: 'from-emerald-200 to-emerald-500', to: '/park' },
              { label: 'Swimming', dog: '🐶💦', badge: '🌊', kicker: 'Aquatic', image: '/services/swimming.jpg', tint: 'from-sky-200 to-sky-500', to: '/swimming' },
              { label: 'Grooming', dog: '🐩', badge: '✂️', kicker: 'Salon', image: '/services/grooming.jpg', tint: 'from-amber-200 to-amber-400', to: '/grooming' },
              { label: 'Pet Supplies', dog: '🐶🦴', badge: '🥣', kicker: 'Shop', image: '/services/pet-supplies.jpg', tint: 'from-violet-200 to-violet-400', to: '/pet-supplies' },
              { label: 'Pet Stories', dog: '🐶', badge: '📖', kicker: 'Stories', image: '/services/pet-stories.jpg', tint: 'from-fuchsia-200 to-fuchsia-400', to: '/pet-stories' },
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

      {/* Why HiSpike — value-prop callouts. Fills the previous blank
          gap between the service circles and the footer with something
          the user actually reads. */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <p className="text-[11px] sm:text-xs font-semibold tracking-[0.3em] text-accent-600 uppercase mb-2">
              Why HiSpike
            </p>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-warm-900">
              Built for Bengaluru's dog owners
            </h2>
            <div className="mx-auto mt-3 h-0.5 w-16 bg-accent-400 rounded-full" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                emoji: '✅',
                title: 'Verified providers',
                body: 'Every vet, salon, swim coach, and trainer is vetted before they make it to our directory.',
              },
              {
                emoji: '🎯',
                title: 'Hyperlocal picks',
                body: 'Recommendations tied to your neighbourhood — Indiranagar, Koramangala, Whitefield, HSR Layout, and more.',
              },
              {
                emoji: '🐾',
                title: 'All in one place',
                body: 'Vets, parks, swimming, grooming, and supplies — no more juggling ten apps.',
              },
              {
                emoji: '⭐',
                title: 'Honest reviews',
                body: 'Transparent ratings and notes from real Bengaluru dog parents, not paid promotions.',
              },
            ].map(({ emoji, title, body }) => (
              <div
                key={title}
                className="rounded-2xl border-2 border-primary-100 bg-white p-5 hover:border-primary-300 hover:shadow-md transition-all"
              >
                <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center text-2xl mb-4">
                  {emoji}
                </div>
                <h3 className="text-base font-bold text-warm-900 mb-1">{title}</h3>
                <p className="text-sm text-warm-600 leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
