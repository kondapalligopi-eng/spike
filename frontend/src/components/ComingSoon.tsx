import { Link } from 'react-router-dom';
import { PageHead } from './PageHead';

// Shared launching-soon splash. Used by /pet-supplies when the admin
// toggles it off, and by /newsroom, /blog, /careers which are placeholder
// routes until we have real content to ship.

type ComingSoonProps = {
  /** Big icon at the top of the hero. */
  emoji: string;
  /** Small uppercase kicker above the headline (e.g. "Shop · Bangalore"). */
  eyebrow: string;
  /** Main heading — short, the noun of the thing that is coming. */
  title: string;
  /** Supporting paragraph beneath the headline. */
  body: string;
  /** Subject line for the "Notify me" mailto, e.g. "Pet Supplies launches". */
  notifySubject: string;
  /** Path used for canonical/og URL — omitted means no SEO head injected
   *  (used when a parent already sets PageHead, e.g. PetSupplies toggle). */
  path?: string;
  /** Keep it out of search results. An empty category is a real page for
   *  a visitor but nothing Google should file as a directory. */
  noindex?: boolean;
  /** Somewhere this thing does exist — shown as "Open in: <links>". Only
   *  pass places that genuinely have it, or the link is another dead end. */
  elsewhere?: { name: string; to: string }[];
};

export function ComingSoon({ emoji, eyebrow, title, body, notifySubject, path, noindex, elsewhere }: ComingSoonProps) {
  const mailtoHref = `mailto:support@hispike.in?subject=${encodeURIComponent(
    `Notify me when ${notifySubject}`,
  )}`;

  return (
    <div className="bg-white">
      {path && (
        <PageHead
          title={title}
          description={body}
          path={path}
          noindex={noindex}
        />
      )}
      <section className="relative overflow-hidden bg-gradient-to-r from-primary-900 via-primary-800 to-primary-600 text-white">
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-[0.10]"
          style={{
            backgroundImage:
              `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 60 60'><g fill='white'><path d='M14 18a3 3 0 1 1 0 6 3 3 0 0 1 0-6zm18 0a3 3 0 1 1 0 6 3 3 0 0 1 0-6zM18 8a3 3 0 1 1 0 6 3 3 0 0 1 0-6zm10 0a3 3 0 1 1 0 6 3 3 0 0 1 0-6zm-5 10a6 6 0 0 0-5.3 8.9l-.5 3.3c-.2 1.4.9 2.6 2.3 2.6h7a2.3 2.3 0 0 0 2.3-2.6l-.5-3.3A6 6 0 0 0 23 18z'/></g></svg>")`,
            backgroundSize: '140px 140px',
          }}
        />
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 text-center">
          <span aria-hidden="true" className="inline-block text-6xl sm:text-7xl mb-6 drop-shadow">
            {emoji}
          </span>
          <p className="text-[11px] sm:text-xs font-semibold tracking-[0.3em] text-accent-300 uppercase mb-3">
            {eyebrow}
          </p>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight mb-4">
            {title}
          </h1>
          <div className="mx-auto h-1 w-20 bg-accent-400 rounded-full mb-5" />
          <p className="text-base sm:text-lg text-primary-100/95 max-w-xl mx-auto mb-6">{body}</p>

          {/* Where it does exist. Cheaper than a city dropdown here, and it
              cannot land anyone on a second empty page.

              Given its own panel rather than a line of text: this is the only
              thing on the page that actually leads somewhere useful, so it has
              to out-rank the two buttons below it. Solid white pills against the
              blue read as buttons at a glance. */}
          {elsewhere && elsewhere.length > 0 && (
            <div className="mx-auto mb-8 max-w-lg rounded-2xl border border-white/20 bg-white/[0.08] px-5 py-4 backdrop-blur-sm">
              <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-accent-300 mb-3">
                Available in these cities
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2.5">
                {elsewhere.map((place) => (
                  <Link
                    key={place.to}
                    to={place.to}
                    className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-sm font-bold text-primary-800 shadow-sm hover:bg-accent-300 hover:text-warm-900 transition-colors"
                  >
                    {place.name}
                    <span aria-hidden="true">→</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-accent-400 hover:bg-accent-300 text-warm-900 text-sm font-bold tracking-[0.15em] uppercase ring-2 ring-accent-300/50 hover:ring-accent-200 transition-all shadow-md"
            >
              Back to Home
            </Link>
            <a
              href={mailtoHref}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/10 hover:bg-white/15 text-white text-sm font-bold tracking-[0.15em] uppercase border border-white/30 transition-all"
            >
              Notify Me
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
