import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { PageHead } from '@/components/PageHead';
import { useBackendWarmup } from '@/lib/warmupBackend';

type Service = {
  label: string;
  dog: string;
  badge: string;
  kicker: string;
  tint: string;
  to: string;
};

const SERVICES: Service[] = [
  { label: 'Hospital', dog: '🐶', badge: '🩺', kicker: 'Vet Care', tint: 'from-rose-200 to-rose-400', to: '/hospital' },
  { label: 'Park', dog: '🐕', badge: '🌳', kicker: 'Outdoors', tint: 'from-emerald-200 to-emerald-500', to: '/park' },
  { label: 'Swimming', dog: '🐶💦', badge: '🌊', kicker: 'Aquatic', tint: 'from-sky-200 to-sky-500', to: '/swimming' },
  { label: 'Grooming', dog: '🐩', badge: '✂️', kicker: 'Salon', tint: 'from-amber-200 to-amber-400', to: '/grooming' },
  { label: 'Pet Shops', dog: '🐶', badge: '🏪', kicker: 'Local Shops', tint: 'from-teal-200 to-teal-400', to: '/petshops' },
  { label: 'Pet Stories', dog: '🐶', badge: '📖', kicker: 'Stories', tint: 'from-fuchsia-200 to-fuchsia-400', to: '/pet-stories' },
  { label: 'Pet Play', dog: '🐶', badge: '🦴', kicker: 'Play', tint: 'from-indigo-200 to-indigo-400', to: '/pet-play' },
  { label: 'Dog Walking', dog: '🦮', badge: '🚶', kicker: 'Walkers', tint: 'from-lime-200 to-lime-400', to: '/dog-walking' },
  // Pet Supplies sits last deliberately — it is the commerce tile, and the
  // service tiles ahead of it are what the directory leads with.
  { label: 'Pet Supplies', dog: '🐶🦴', badge: '🥣', kicker: 'Shop', tint: 'from-violet-200 to-violet-400', to: '/pet-supplies' },
];

type ChevronDirection = 'left' | 'right' | 'up' | 'down';

const CHEVRON: Record<ChevronDirection, string> = {
  left: 'M15 19l-7-7 7-7',
  right: 'M9 5l7 7-7 7',
  up: 'M5 15l7-7 7 7',
  down: 'M19 9l-7 7-7-7',
};

const BACKWARD: ChevronDirection[] = ['left', 'up'];

function RailArrow({
  direction,
  enabled,
  onClick,
}: {
  direction: ChevronDirection;
  enabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      // Disabled rather than hidden at the ends. These sit in fixed positions,
      // so dropping one would shuffle its partner sideways every time you
      // reach an edge.
      disabled={!enabled}
      aria-label={
        BACKWARD.includes(direction) ? 'Show previous services' : 'Show more services'
      }
      className={[
        'w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shrink-0',
        // Brand gold with a dark chevron — white on #facc15 measures 1.53:1 and
        // is effectively invisible, warm-900 on it measures 11.4:1.
        'bg-accent-400 text-warm-900 ring-1 ring-accent-500/30',
        'hover:bg-accent-300 active:scale-95 transition',
        'disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-accent-400 disabled:active:scale-100',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2',
      ].join(' ')}
    >
      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d={CHEVRON[direction]} />
      </svg>
    </button>
  );
}

function ServiceTile({ service, className = '' }: { service: Service; className?: string }) {
  const { label, dog, badge, kicker, tint, to } = service;
  return (
    <Link to={to} className={`group block text-center ${className}`}>
      <p className="text-xs text-warm-600 mb-3 tracking-wide">{kicker}</p>
      <div className={`relative mx-auto aspect-square w-20 sm:w-24 lg:w-28 rounded-full overflow-visible bg-gradient-to-br ${tint} ring-1 ring-warm-200 group-hover:ring-primary-400 transition`}>
        <span aria-hidden="true" className="absolute inset-0 flex items-center justify-center text-3xl sm:text-4xl drop-shadow group-hover:scale-110 transition-transform">
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
  );
}

/**
 * Tracks whether a scroll container still has room in either direction, and
 * pages it along by most of a viewport.
 *
 * Initial state is deliberately "at the start, not at the end": nine tiles
 * overflow every realistic viewport, so the forward arrow starts live and the
 * effect only ever corrects it — no disabled-then-enabled flicker on load.
 * Both values are constants, so the pre-rendered HTML and the first client
 * render still agree exactly.
 *
 * A hidden layout (the one the current breakpoint isn't showing) measures zero
 * on every axis and simply reports itself as fully scrolled. That costs nothing
 * because it isn't visible, and the ResizeObserver re-syncs it the moment a
 * resize brings it back.
 */
function useScrollEdges(axis: 'x' | 'y') {
  const ref = useRef<HTMLDivElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const sync = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const position = axis === 'x' ? el.scrollLeft : el.scrollTop;
    const viewport = axis === 'x' ? el.clientWidth : el.clientHeight;
    const total = axis === 'x' ? el.scrollWidth : el.scrollHeight;
    // 1px of slack: sub-pixel sizes mean the offset almost never lands exactly
    // on the maximum, which would leave the forward arrow lit forever.
    setAtStart(position <= 1);
    setAtEnd(position + viewport >= total - 1);
  }, [axis]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    sync();
    // Catches what a scroll listener misses: emoji and fonts landing late and
    // resizing the tiles, and the viewport itself changing.
    const observer = new ResizeObserver(sync);
    observer.observe(el);
    return () => observer.disconnect();
  }, [sync]);

  const nudge = (direction: -1 | 1) => {
    const el = ref.current;
    if (!el) return;
    const step = (axis === 'x' ? el.clientWidth : el.clientHeight) * 0.8;
    el.scrollBy(
      axis === 'x'
        ? { left: direction * step, behavior: 'smooth' }
        : { top: direction * step, behavior: 'smooth' },
    );
  };

  return { ref, atStart, atEnd, sync, nudge };
}

/**
 * The services strip. Two layouts, one heading.
 *
 * It used to be a fixed grid, which meant every new service made all the
 * circles smaller — by nine tiles they were squeezed. Now phones get a
 * two-column grid six tiles tall that scrolls vertically, and everything from
 * `sm` up gets a horizontal rail. Either way the list can keep growing without
 * the tiles shrinking; a new service is one entry in SERVICES and nothing else.
 */
function ServicesSection() {
  const rail = useScrollEdges('x'); // sm and up
  const stack = useScrollEdges('y'); // phones

  return (
    <>
      <div className="flex items-end justify-between gap-4 mb-6">
        <div>
          {/* Deliberately shares no wording with the hero directly above, which
              already says "everything", "in one place", "under one roof",
              "every service your best friend needs" and "EXPLORE SERVICES".
              The hero sells; this heading just opens the door to the tiles. */}
          <h2 className="text-xl sm:text-2xl font-extrabold text-warm-900 tracking-tight">
            What brings you in today?
          </h2>
          <div className="mt-2 h-0.5 w-16 bg-accent-400 rounded-full" />
        </div>
        {/* Horizontal controls belong to the rail, so they follow it and stay
            off phones — the vertical pair below serves that layout instead. */}
        <div className="hidden sm:flex items-center gap-2 shrink-0">
          <RailArrow direction="left" enabled={!rail.atStart} onClick={() => rail.nudge(-1)} />
          <RailArrow direction="right" enabled={!rail.atEnd} onClick={() => rail.nudge(1)} />
        </div>
      </div>

      {/* Phones — two columns, six tiles visible, scrolled vertically.
          max-h is exactly three rows: each tile is ~140px (16px kicker line +
          12px gap + 80px circle + 12px gap + 20px label) and rows sit 24px
          apart, so 3*140 + 2*24 = 468. */}
      <div className="sm:hidden">
        {/* Up above the grid, down below it, each pointing at the tiles it
            reveals. The up arrow sits disabled on first paint — that is the
            honest state, and it matches how the desktop left arrow behaves. */}
        <div className="flex justify-center mb-4">
          <RailArrow direction="up" enabled={!stack.atStart} onClick={() => stack.nudge(-1)} />
        </div>

        <div
          ref={stack.ref}
          onScroll={stack.sync}
          // pr-1 is gone with the scrollbar it used to make room for.
          className="grid grid-cols-2 gap-6 max-h-[468px] overflow-y-auto snap-y snap-mandatory no-scrollbar"
        >
          {SERVICES.map((service) => (
            <ServiceTile
              key={service.label}
              service={service}
              className="snap-start justify-self-center w-24"
            />
          ))}
        </div>

        <div className="flex justify-center mt-4">
          <RailArrow direction="down" enabled={!stack.atEnd} onClick={() => stack.nudge(1)} />
        </div>
      </div>

      {/* sm and up — the horizontal rail. */}
      <div className="relative hidden sm:block">
        <div
          ref={rail.ref}
          onScroll={rail.sync}
          // pb-1 rather than pb-3 now that no scrollbar needs the room; the
          // remainder just keeps the tiles' hover shadow off the section edge.
          className="flex gap-8 overflow-x-auto snap-x snap-mandatory no-scrollbar pb-1 -mx-6 px-6 lg:mx-0 lg:px-0"
        >
          {SERVICES.map((service) => (
            <ServiceTile
              key={service.label}
              service={service}
              className="shrink-0 w-28 lg:w-32 snap-start"
            />
          ))}
        </div>

        {/* Edge fades — the secondary cue. Each is pinned to the rail's real
            edge, which bleeds past this wrapper below lg. They run the full
            height now that the scrollbar they used to stop short of is hidden.
            Colour has to track the section background. */}
        <div
          aria-hidden="true"
          className={`pointer-events-none absolute inset-y-0 -left-6 lg:left-0 w-12 bg-gradient-to-r from-primary-50 to-transparent transition-opacity duration-200 ${rail.atStart ? 'opacity-0' : 'opacity-100'}`}
        />
        <div
          aria-hidden="true"
          className={`pointer-events-none absolute inset-y-0 -right-6 lg:right-0 w-12 bg-gradient-to-l from-primary-50 to-transparent transition-opacity duration-200 ${rail.atEnd ? 'opacity-0' : 'opacity-100'}`}
        />
      </div>
    </>
  );
}

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
        {/* Static base opacity so the paws still show if the animation can't
            run (reduced-motion / GPU off). Keep prose OUT of the CSS below —
            apostrophes/em-dashes inside a <style> text node cause an SSR
            hydration mismatch (React #425). */}
        <style>{`
          @keyframes hero-paw-pulse {
            0%, 100% { opacity: 0.06; }
            50%       { opacity: 0.20; }
          }
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
                className="text-[210px] drop-shadow-2xl select-none -scale-x-100 leading-none"
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
                {/* The service links that used to sit here were removed: they
                    duplicate the service circles directly below the hero, and
                    the list grew ~28px with every new service (it reached 8),
                    pushing the laptop hero to 476px tall. */}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services / Categories — scrollable rail with prev/next arrows */}
      <section className="py-10 bg-primary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ServicesSection />
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
