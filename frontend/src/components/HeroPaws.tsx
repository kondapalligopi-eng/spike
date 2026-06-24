// Decorative paws + sparkles for the compact hero band used on Hospital,
// Park, Swimming, Grooming (and Pet Supplies). Mirrors the Home hero's
// scattered-paws look but with fewer, smaller paws so it sits behind a
// single-row icon + text + button layout without crowding the type.
//
// Each paw pulses (6%→20% opacity, 2.6s) and is wreathed in 3 sparkle stars
// that twinkle slightly after the paw — so each paw reads as actively
// glinting. Honours prefers-reduced-motion.

export function HeroPaws() {
  return (
    <>
      <style>{`
        @keyframes hero-paw-pulse {
          0%, 100% { opacity: 0.06; }
          50%      { opacity: 0.20; }
        }
        /* Base opacity is set statically (not only via the keyframes) so the
           paws still look intentional when the animation can't run — e.g.
           corporate Chrome with hardware acceleration disabled, or
           prefers-reduced-motion. No will-change: promoting these to their own
           compositor layers makes them freeze on the first frame when the GPU
           is blocklisted; opacity animates fine on the main thread without it. */
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
        {/* Paws pinned to the hero's top and bottom safe bands so they don't
            overlap the icon, headline, paragraph, or "List Your …" button. */}
        {[
          { top: '6%',  left: '4%',  size: 36, rotate: -14, delay: 0   },
          { top: '4%',  left: '40%', size: 28, rotate: -6,  delay: 1.2 },
          { top: '7%',  left: '92%', size: 32, rotate: 12,  delay: 1.8 },
          { top: '74%', left: '12%', size: 32, rotate: 16,  delay: 0.6 },
          { top: '78%', left: '52%', size: 26, rotate: 22,  delay: 0.3 },
          { top: '72%', left: '88%', size: 34, rotate: -10, delay: 0.4 },
        ].map((p, i) => (
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
    </>
  );
}
