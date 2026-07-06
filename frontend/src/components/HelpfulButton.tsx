import { useEffect, useState } from 'react';
import { incrementCounter } from '@/api/counters';

const COUNTER_KEY = 'helpful';
const GUARD_KEY = 'hispike_helpful_voted';

/**
 * Compact Instagram-style "love" heart for the navbar, beside search.
 *
 * Public visitors see only the heart — no number. Tapping fills it red and
 * bumps a single backend counter (/api/v1/counters/helpful) that the admin
 * reads in /admin. A localStorage guard keeps one visitor to a single vote.
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
        aria-label={voted ? 'Thanks — you love HiSpike' : 'Loved HiSpike? Tap the heart'}
        title={voted ? 'Thanks! 🐾' : 'Loved HiSpike?'}
        className={[
          'p-2 rounded-lg transition-colors',
          voted
            ? 'text-red-500 bg-red-50 cursor-default'
            : 'text-warm-700 hover:bg-warm-100 hover:text-red-500',
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
            d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
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
