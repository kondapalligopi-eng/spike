import { useEffect, useState } from 'react';
import { incrementCounter } from '@/api/counters';

const COUNTER_KEY = 'helpful';
const GUARD_KEY = 'hispike_helpful_voted';

/**
 * Compact "was HiSpike helpful?" thumbs-up for the navbar, beside search.
 *
 * Public visitors see only the icon — no number. Every click bumps a single
 * backend counter (/api/v1/counters/helpful) that the admin reads in /admin.
 * A localStorage guard keeps one visitor to a single vote.
 *
 * SSG-safe: the voted state is only read on the client (in an effect), so the
 * server markup and first client render match.
 */
export function HelpfulButton() {
  const [voted, setVoted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [showThanks, setShowThanks] = useState(false);

  useEffect(() => {
    try {
      setVoted(localStorage.getItem(GUARD_KEY) === '1');
    } catch {
      // ignore
    }
  }, []);

  const handleClick = async () => {
    if (voted || busy) return;
    setBusy(true);
    setVoted(true);
    setShowThanks(true);
    try {
      localStorage.setItem(GUARD_KEY, '1');
    } catch {
      // ignore quota
    }
    try {
      await incrementCounter(COUNTER_KEY);
    } catch {
      // keep the optimistic vote; the guard prevents a retry loop
    } finally {
      setBusy(false);
      window.setTimeout(() => setShowThanks(false), 2200);
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={handleClick}
        disabled={voted || busy}
        aria-pressed={voted}
        aria-label={voted ? 'Thanks — you found HiSpike helpful' : 'Was HiSpike helpful? Give a thumbs up'}
        title={voted ? 'Thanks! 🐾' : 'Was HiSpike helpful?'}
        className={[
          'p-2 rounded-lg transition-colors',
          voted
            ? 'text-accent-500 bg-accent-50 cursor-default'
            : 'text-warm-700 hover:bg-warm-100',
        ].join(' ')}
      >
        <svg
          className="w-5 h-5"
          fill={voted ? 'currentColor' : 'none'}
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3zM7 22H4a2 2 0 01-2-2v-7a2 2 0 012-2h3"
          />
        </svg>
      </button>

      {showThanks && (
        <span className="absolute right-0 top-full mt-1.5 z-30 whitespace-nowrap rounded-lg bg-warm-900 text-white text-xs font-medium px-2.5 py-1 shadow-lg animate-fade-in">
          Thanks! 🐾
        </span>
      )}
    </div>
  );
}
