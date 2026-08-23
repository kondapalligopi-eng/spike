import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Tracks whether a scroll container still has room in either direction, and
 * pages it along by most of a viewport. Drives the arrows on the homepage
 * services rail and the pet-shop category shelves.
 *
 * Initial state is deliberately "at the start, not at the end": these rails
 * normally overflow, so the forward arrow starts live and the effect only ever
 * corrects it — no disabled-then-enabled flicker on load. Both values are
 * constants, so pre-rendered HTML and the first client render agree exactly.
 *
 * A container that is hidden at the current breakpoint measures zero on every
 * axis and simply reports itself as fully scrolled. That costs nothing while
 * it is invisible, and the ResizeObserver re-syncs it the moment a resize
 * brings it back.
 */
export function useScrollEdges(axis: 'x' | 'y') {
  const ref = useRef<HTMLDivElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const sync = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const position = axis === 'x' ? el.scrollLeft : el.scrollTop;
    const viewport = axis === 'x' ? el.clientWidth : el.clientHeight;
    const total = axis === 'x' ? el.scrollWidth : el.scrollHeight;
    // 1px of slack: sub-pixel sizes mean the offset almost never lands exactly
    // on the maximum, which would leave the forward arrow lit forever.
    setAtStart(position <= 1);
    setAtEnd(position + viewport >= total - 1);
  }, [axis]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    sync();
    // Catches what a scroll listener misses: images, emoji and fonts landing
    // late and resizing the contents, and the viewport itself changing.
    const observer = new ResizeObserver(sync);
    observer.observe(el);
    return () => observer.disconnect();
  }, [sync]);

  const nudge = (direction: -1 | 1) => {
    const el = ref.current;
    if (!el) return;
    const step = (axis === 'x' ? el.clientWidth : el.clientHeight) * 0.8;
    el.scrollBy(
      axis === 'x'
        ? { left: direction * step, behavior: 'smooth' }
        : { top: direction * step, behavior: 'smooth' },
    );
  };

  return { ref, atStart, atEnd, sync, nudge };
}
