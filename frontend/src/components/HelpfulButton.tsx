import { useEffect, useState } from 'react';
import { getCounter, incrementCounter } from '@/api/counters';

const COUNTER_KEY = 'helpful';
const GUARD_KEY = 'hispike_helpful_voted';

/**
 * A site-wide "was HiSpike helpful?" thumbs-up. Every click bumps a single
 * backend counter (see /api/v1/counters/helpful) and shows the running tally
 * as social proof. A localStorage guard keeps one visitor to a single vote.
 *
 * SSG-safe: liked-state and the count are only read on the client (in an
 * effect), so the server-rendered markup and first client render match.
 */
export function HelpfulButton() {
  const [count, setCount] = useState<number | null>(null);
  const [voted, setVoted] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    try {
      setVoted(localStorage.getItem(GUARD_KEY) === '1');
    } catch {
      // ignore
    }
    getCounter(COUNTER_KEY)
      .then(setCount)
      .catch(() => {
        /* leave count hidden if the backend is asleep */
      });
  }, []);

  const handleClick = async () => {
    if (voted || busy) return;
    setBusy(true);
    setVoted(true);
    setCount((c) => (c ?? 0) + 1); // optimistic
    try {
      localStorage.setItem(GUARD_KEY, '1');
    } catch {
      // ignore quota
    }
    try {
      const next = await incrementCounter(COUNTER_KEY);
      setCount(next); // reconcile with the real total
    } catch {
      // keep the optimistic bump; the guard already prevents a retry loop
    } finally {
      setBusy(false);
    }
  };

  const nice = count !== null ? count.toLocaleString('en-IN') : null;

  return (
    <div className="mt-10 flex flex-col items-center gap-3 text-center">
      <p className="text-sm font-semibold text-warm-700">
        {voted ? 'Thanks for the love! 🐾' : 'Did HiSpike help you today?'}
      </p>
      <button
        type="button"
        onClick={handleClick}
        disabled={voted || busy}
        aria-pressed={voted}
        className={[
          'inline-flex items-center gap-2.5 rounded-full pl-3 pr-4 py-2 font-semibold transition-all',
          voted
            ? 'bg-accent-100 text-accent-800 ring-1 ring-accent-300 cursor-default'
            : 'bg-primary-700 text-white hover:bg-primary-800 hover:-translate-y-0.5 shadow-md',
        ].join(' ')}
      >
        <span className="text-xl leading-none" aria-hidden="true">
          👍
        </span>
        <span className="text-sm">{voted ? 'Helpful!' : 'Yes, helpful'}</span>
        {nice !== null && (
          <span
            className={[
              'ml-0.5 min-w-[1.75rem] rounded-full px-2 py-0.5 text-xs font-bold tabular-nums',
              voted ? 'bg-accent-200 text-accent-900' : 'bg-white/20 text-white',
            ].join(' ')}
          >
            {nice}
          </span>
        )}
      </button>
      {nice !== null && (
        <p className="text-xs text-warm-400">
          {nice} dog {count === 1 ? 'parent has' : 'parents have'} found HiSpike helpful
        </p>
      )}
    </div>
  );
}
