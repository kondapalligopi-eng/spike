import { useEffect, useState } from 'react';
import { incrementCounter } from '@/api/counters';

const COUNTER_KEY = 'helpful';
const GUARD_KEY = 'hispike_helpful_voted';
const HINT_KEY = 'hispike_helpful_hinted';

/**
 * Compact Instagram-style "love" heart for the navbar, beside search.
 *
 * Public visitors see only the heart — no number. Tapping fills it red and
 * bumps a single backend counter (/api/v1/counters/helpful) that the admin
 * reads in /admin. A localStorage guard keeps one visitor to a single vote.
 *
 * The "Loved HiSpike?" label is a custom bubble (not the native title tooltip,
 * which never shows on touch): it appears on hover/focus on desktop and
 * auto-pops once on first visit so mobile users can discover the heart too.
 *
 * SSG-safe: voted/hint state is only read on the client (in an effect), so the
 * server markup and first client render match.
 */
export function HelpfulButton() {
  const [voted, setVoted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [showThanks, setShowThanks] = useState(false);
  const [showHint, setShowHint] = useState(false); // pre-vote "Loved HiSpike?"
  const [hover, setHover] = useState(false);

  useEffect(() => {
    let didVote = false;
    try {
      didVote = localStorage.getItem(GUARD_KEY) === '1';
    } catch {
      // ignore
    }
    setVoted(didVote);

    // One-time discovery nudge (mainly for mobile, which can't hover).
    if (didVote) return;
    let hinted = false;
    try {
      hinted = localStorage.getItem(HINT_KEY) === '1';
    } catch {
      // ignore
    }
    if (hinted) return;
    try {
      localStorage.setItem(HINT_KEY, '1');
    } catch {
      // ignore quota
    }
    setShowHint(true);
    const id = window.setTimeout(() => setShowHint(false), 3200);
    return () => window.clearTimeout(id);
  }, []);

  const handleClick = async () => {
    if (voted || busy) return;
    setBusy(true);
    setVoted(true);
    setShowHint(false);
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

  // What (if anything) the bubble should say right now.
  const bubble = showThanks
    ? 'Thanks! 🐾'
    : !voted && (showHint || hover)
      ? 'Loved HiSpike?'
      : null;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={handleClick}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        onFocus={() => setHover(true)}
        onBlur={() => setHover(false)}
        disabled={voted || busy}
        aria-pressed={voted}
        aria-label={voted ? 'Thanks — you love HiSpike' : 'Loved HiSpike? Tap the heart'}
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

      {bubble && (
        <span className="absolute right-0 top-full mt-1.5 z-30 whitespace-nowrap rounded-lg bg-accent-400 text-warm-900 text-xs font-semibold px-2.5 py-1 shadow-lg animate-fade-in">
          {bubble}
        </span>
      )}
    </div>
  );
}
