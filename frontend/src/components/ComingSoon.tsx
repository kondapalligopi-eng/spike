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
};

export function ComingSoon({ emoji, eyebrow, title, body, notifySubject }: ComingSoonProps) {
  const mailtoHref = `mailto:support@hispike.in?subject=${encodeURIComponent(
    `Notify me when ${notifySubject}`,
  )}`;

  return (
    <div className="bg-white">
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
          <p className="text-base sm:text-lg text-primary-100/95 max-w-xl mx-auto mb-8">{body}</p>
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
