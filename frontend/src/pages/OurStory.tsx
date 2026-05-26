export function OurStory() {
  return (
    <div className="bg-white">
      <section className="relative overflow-hidden bg-gradient-to-r from-primary-900 via-primary-800 to-primary-600 text-white">
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage:
              `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 60 60'><g fill='white'><path d='M14 18a3 3 0 1 1 0 6 3 3 0 0 1 0-6zm18 0a3 3 0 1 1 0 6 3 3 0 0 1 0-6zM18 8a3 3 0 1 1 0 6 3 3 0 0 1 0-6zm10 0a3 3 0 1 1 0 6 3 3 0 0 1 0-6zm-5 10a6 6 0 0 0-5.3 8.9l-.5 3.3c-.2 1.4.9 2.6 2.3 2.6h7a2.3 2.3 0 0 0 2.3-2.6l-.5-3.3A6 6 0 0 0 23 18z'/></g></svg>")`,
            backgroundSize: '120px 120px',
          }}
        />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 grid grid-cols-1 md:grid-cols-[1fr_auto] items-center gap-8 md:gap-12">
          <div>
            <p className="text-[11px] sm:text-xs font-semibold tracking-[0.3em] text-accent-400 uppercase mb-2">
              About · HiSpike
            </p>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
              Built by dog parents,<br className="hidden sm:inline" /> for dog parents.
            </h1>
            <div className="mt-3 h-1 w-16 bg-accent-400 rounded-full" />
            <p className="mt-4 text-base sm:text-lg text-primary-100/95 max-w-xl">
              Meet <span className="font-semibold text-white">Spike</span> — the
              black Lab who started it all. HiSpike is named after him, and
              built so every dog parent in Bengaluru gets the kind of care
              we kept wishing for him.
            </p>
          </div>
          <div className="relative justify-self-center md:justify-self-end shrink-0">
            {/* Soft warm halo behind the polaroid so it lifts off the dark hero. */}
            <div
              aria-hidden="true"
              className="absolute -inset-8 bg-accent-400/40 rounded-[2.5rem] blur-2xl"
            />

            {/* Polaroid card — thick white frame, narrower top/sides, taller
                bottom margin where the signature lives. Slight tilt for the
                photographed-and-pinned feel. */}
            <div className="relative -rotate-2 hover:rotate-0 transition-transform duration-300 bg-white pt-3 px-3 pb-12 sm:pt-4 sm:px-4 sm:pb-14 rounded-md shadow-2xl ring-1 ring-warm-200">
              <img
                src="/spike/spike.jpg"
                alt="Spike — a black Labrador resting in a Bengaluru park"
                loading="lazy"
                className="block w-56 sm:w-64 md:w-72 lg:w-80 h-auto aspect-[4/3] object-cover"
              />
              {/* Handwritten signature in the bottom margin of the polaroid. */}
              <p
                className="absolute bottom-3 left-0 right-0 text-center text-warm-900 leading-none"
                style={{
                  fontFamily: "'Caveat', cursive",
                  fontSize: 'clamp(2.25rem, 5vw, 2.75rem)',
                  fontWeight: 700,
                }}
              >
                Spike <span aria-hidden="true" className="text-accent-500">🐾</span>
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-primary-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-6 text-warm-800 leading-relaxed">
          <p>
            HiSpike began with a simple frustration. Finding a trusted vet, a
            decent dog park, a salon that doesn't shave a Pomeranian like a
            Poodle — every search meant five tabs, ten reviews, and a phone
            call to a friend who'd just adopted.
          </p>
          <p>
            We started HiSpike in 2024 to put every part of caring for a dog
            in one place. One platform. Real listings. Real reviews. Built
            specifically for Bengaluru — Indiranagar, Koramangala, HSR
            Layout, Whitefield, Jayanagar, and the neighbourhoods in between.
          </p>
        </div>
      </section>

      <section className="bg-primary-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-6 text-warm-800 leading-relaxed">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { stat: '5', label: 'Services in one place' },
              { stat: '40+', label: 'Bengaluru neighbourhoods' },
              { stat: '100%', label: 'Verified providers' },
            ].map(({ stat, label }) => (
              <div
                key={label}
                className="rounded-2xl border-2 border-primary-100 bg-white p-5 text-center"
              >
                <p className="text-3xl font-extrabold text-primary-700">{stat}</p>
                <p className="text-xs text-warm-600 mt-1 leading-snug">{label}</p>
              </div>
            ))}
          </div>

          <h2 className="text-xl font-bold text-warm-900 pt-6">What we believe</h2>
          <ul className="space-y-3">
            {[
              "Pet care should be local. National chains can't tell you which clinic stays open after 9pm in HSR.",
              "Reviews should be honest. We don't run paid placements that bury bad experiences.",
              'Verification matters. Every vet, salon, and trainer is checked before they appear in our directory.',
              "Dogs come first. If a service provider isn't treating animals well, they don't belong here.",
            ].map((point) => (
              <li key={point} className="flex items-start gap-3">
                <span className="mt-1 w-2 h-2 rounded-full bg-accent-400 shrink-0" />
                <span>{point}</span>
              </li>
            ))}
          </ul>

          <div className="rounded-2xl border-2 border-primary-100 bg-white p-5 mt-8">
            <p className="text-[11px] font-semibold tracking-[0.25em] text-accent-600 uppercase mb-1.5">
              Get in touch
            </p>
            <p className="text-sm text-warm-700 leading-relaxed">
              Questions, feedback, or want to partner with us? Email{' '}
              <a
                href="mailto:support@hispike.in"
                className="text-primary-700 font-semibold hover:underline"
              >
                support@hispike.in
              </a>{' '}
              — we usually reply within a day.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
