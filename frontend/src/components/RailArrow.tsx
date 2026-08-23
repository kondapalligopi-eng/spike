export type ChevronDirection = 'left' | 'right' | 'up' | 'down';

const CHEVRON: Record<ChevronDirection, string> = {
  left: 'M15 19l-7-7 7-7',
  right: 'M9 5l7 7-7 7',
  up: 'M5 15l7-7 7 7',
  down: 'M19 9l-7 7-7-7',
};

const BACKWARD: ChevronDirection[] = ['left', 'up'];

/**
 * The gold circular scroll control used by the homepage services rail and the
 * pet-shop category shelves. Pair it with useScrollEdges.
 */
export function RailArrow({
  direction,
  enabled,
  onClick,
  ariaLabel,
}: {
  direction: ChevronDirection;
  enabled: boolean;
  onClick: () => void;
  /** Say what is being scrolled — "Show more services", "Scroll Food right". */
  ariaLabel?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      // Disabled rather than hidden at the ends. These sit in fixed positions,
      // so dropping one would shuffle its partner sideways every time you
      // reach an edge.
      disabled={!enabled}
      aria-label={ariaLabel ?? (BACKWARD.includes(direction) ? 'Show previous' : 'Show more')}
      className={[
        'w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shrink-0',
        // Brand gold with a dark chevron — white on #facc15 measures 1.53:1 and
        // is effectively invisible, warm-900 on it measures 11.4:1.
        'bg-accent-400 text-warm-900 ring-1 ring-accent-500/30',
        'hover:bg-accent-300 active:scale-95 transition',
        'disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-accent-400 disabled:active:scale-100',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2',
      ].join(' ')}
    >
      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d={CHEVRON[direction]} />
      </svg>
    </button>
  );
}
