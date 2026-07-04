import { PageHead } from '@/components/PageHead';
import { HeroPaws } from '@/components/HeroPaws';

export function OurStory() {
  return (
    <div className="bg-white">
      <PageHead
        title="About HiSpike — Built by Dog Parents in Bengaluru"
        description="HiSpike was born in Bengaluru to put every part of caring for a dog in one place — vets, parks, swim coaches, grooming, and supplies. Verified providers, honest reviews. Meet Spike, the Lab who started it all."
        path="/about"
      />
      <section className="relative overflow-hidden bg-gradient-to-r from-primary-900 via-primary-800 to-primary-600 text-white">
        <HeroPaws />
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
            {/* Soft warm halo plus a deeper dark wash to imply a surface
                underneath the polaroid. Together they give the card a real
                sense of resting on something rather than floating. */}
            <div
              aria-hidden="true"
              className="absolute -inset-10 bg-accent-400/35 rounded-[3rem] blur-3xl"
            />
            <div
              aria-hidden="true"
              className="absolute -inset-6 translate-y-4 bg-warm-900/55 rounded-[2.5rem] blur-2xl"
            />

            {/* Second polaroid peeking from behind — adds the stacked, casual
                "scattered photos" feel and a layer of depth. */}
            <div
              aria-hidden="true"
              className="absolute inset-0 rotate-6 translate-x-3 translate-y-2 bg-white pt-3 px-3 pb-12 sm:pt-4 sm:px-4 sm:pb-14 rounded-md shadow-xl ring-1 ring-warm-300/60"
            >
              <div className="w-56 sm:w-64 md:w-72 lg:w-80 h-auto aspect-[4/3] bg-gradient-to-br from-warm-200 to-warm-100 rounded-sm" />
            </div>

            {/* Foreground polaroid — heavier custom shadow so it visibly
                sits on top of the back card and the halos behind. */}
            <div
              className="relative -rotate-2 hover:rotate-0 transition-transform duration-300 bg-white pt-3 px-3 pb-12 sm:pt-4 sm:px-4 sm:pb-14 rounded-md ring-1 ring-warm-200"
              style={{
                boxShadow:
                  '0 30px 60px -20px rgba(0,0,0,0.55), 0 18px 30px -12px rgba(0,0,0,0.35)',
              }}
            >
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
            HiSpike began with a simple idea: caring for a dog in Bengaluru
            shouldn't feel like a research project. Finding a trusted vet
            for a midnight emergency, a dog park that's actually open after
            the rain, a groomer who won't shave a Pomeranian like a Poodle
            — every search used to mean five tabs, ten conflicting reviews,
            and a hopeful WhatsApp to whichever friend had just adopted.
          </p>
          <p>
            We launched HiSpike in 2026 to put every part of caring for a
            dog into one place — one platform, verified listings, honest
            reviews, and providers we've actually walked through the door
            of. Built proudly in Bengaluru, for every neighbourhood across
            the city where a tail's still wagging.
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
              {
                title: 'Local always wins.',
                body: "Pet care is hyperlocal — no national chain can tell you which clinic stays open past 9 pm in your part of town. We can.",
              },
              {
                title: 'Reviews you can trust.',
                body: "No paid placements, no promoted listings, no quietly buried complaints. What real dog parents in the city say, you get to read.",
              },
              {
                title: 'Verified, not scraped.',
                body: "Every vet, salon, swim coach, and trainer here is vetted by us before going live — credentials checked, facilities visited.",
              },
              {
                title: 'Dogs come first, always.',
                body: "If a provider isn't treating pets with care, no amount of listing revenue keeps them on this platform.",
              },
            ].map(({ title, body }) => (
              <li key={title} className="flex items-start gap-3">
                <span className="mt-1.5 w-2 h-2 rounded-full bg-accent-400 shrink-0" />
                <span>
                  <span className="font-semibold text-warm-900">{title}</span>{' '}
                  {body}
                </span>
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
            <div className="mt-4 pt-4 border-t border-warm-100 text-sm text-warm-600 leading-relaxed">
              <p className="font-semibold text-warm-900">HiSpike</p>
              <p>Proprietorship · GSTIN <span className="font-mono">29EHWPS8826R1ZK</span></p>
              <p className="mt-1">
                WeWork Salarpuria Magnificia, Tin Factory, 78 Old Madras Road,
                Mahadevapura, next to KR Puram, Bangalore, Karnataka 560016
              </p>
              <a
                href="https://www.google.com/maps/search/?api=1&query=WeWork%20Salarpuria%20Magnificia%2C%20Mahadevapura%2C%20Bangalore%20560016"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs font-semibold text-primary-600 hover:text-primary-700 hover:underline mt-2"
              >
                Get directions <span aria-hidden="true">→</span>
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
