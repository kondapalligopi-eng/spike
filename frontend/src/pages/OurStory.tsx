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
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6">
          <span aria-hidden="true" className="text-4xl sm:text-5xl drop-shadow">🐾</span>
          <div className="flex-1">
            <p className="text-[11px] sm:text-xs font-semibold tracking-[0.3em] text-accent-400 uppercase mb-1">
              About · HiSpike
            </p>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight">
              Our Story
            </h1>
            <div className="mt-2 h-0.5 w-16 bg-accent-400 rounded-full" />
            <p className="mt-2 text-sm text-primary-100/90 max-w-2xl">
              Built in Bengaluru, by dog parents, for dog parents.
            </p>
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

      {/* Meet Spike — the dog the platform is named after. */}
      <section className="bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12 items-center">
            <div className="relative">
              <div className="absolute -inset-3 bg-gradient-to-br from-accent-200 to-primary-200 rounded-3xl rotate-2 opacity-70" aria-hidden="true" />
              <img
                src="/spike/spike.jpg"
                alt="Spike — a black Labrador resting in a Bengaluru park"
                loading="lazy"
                className="relative rounded-3xl shadow-lg w-full h-auto object-cover aspect-[4/3]"
              />
              <span className="absolute -bottom-3 -right-3 bg-warm-900 text-white text-[10px] font-bold tracking-[0.25em] uppercase px-3 py-1.5 rounded-full shadow-md">
                Our boy
              </span>
            </div>

            <div>
              <p className="text-[11px] font-semibold tracking-[0.3em] text-accent-600 uppercase mb-2">
                Meet Spike
              </p>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-warm-900 leading-tight mb-3">
                The dog who started it all
              </h2>
              <div className="h-0.5 w-12 bg-accent-400 rounded-full mb-5" />
              <div className="space-y-4 text-warm-800 leading-relaxed">
                <p>
                  This is <span className="font-semibold">Spike</span> — a
                  black Lab who's spent most of his life shuttling between
                  Whitefield's dog parks, Indiranagar's vets, and any patch
                  of grass with a breeze. He's the reason this platform
                  exists, and the <span className="font-bold text-primary-700">H</span> and{' '}
                  <span className="font-bold text-accent-600">S</span> in
                  the HiSpike logo.
                </p>
                <p>
                  Caring for Spike meant juggling clinic phone numbers,
                  scattered Google reviews, last-minute grooming
                  appointments, and one truly bad swimming lesson. We built
                  HiSpike so the next dog parent in Bengaluru doesn't have
                  to do the same scavenger hunt.
                </p>
                <p className="text-sm text-warm-600 italic">
                  Spike's job description today: chief taste-tester of every
                  vet, park, and salon we add to the directory.
                </p>
              </div>
            </div>
          </div>
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
