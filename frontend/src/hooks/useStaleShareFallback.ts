import { useEffect, useRef, useState } from 'react';

/**
 * Recovers from a shared link whose listing no longer matches.
 *
 * Share links on the directory pages carry ?q=<listing name>, because those
 * categories have no per-listing detail page. That works until the listing is
 * renamed or removed — then the recipient lands on an empty page and has no
 * idea why, having just been sent it by a friend.
 *
 * When a URL-supplied search returns nothing, this clears the filter so the
 * full category is shown, and hands back the term that missed so the page can
 * say what happened. Showing the category with an explanation beats both a
 * silent redirect (which loses what they clicked) and a bare empty state.
 *
 * Deliberately narrow — it only fires for a search that arrived in the URL. A
 * search the visitor typed themselves is left alone: clearing that from under
 * them would feel broken, and "no results" is the honest answer there.
 *
 * @returns the search term that found nothing, or null. Non-null exactly once
 *          per distinct term, so the notice does not reappear after dismissal.
 */
export function useStaleShareFallback({
  urlQuery,
  appliedSearch,
  resultCount,
  isLoading,
  onClear,
}: {
  /** The ?q= value from the URL. */
  urlQuery: string;
  /** The search currently applied — used to check the visitor has not moved on. */
  appliedSearch: string;
  /** How many listings survive the current filters. */
  resultCount: number;
  /** True while listings are still being fetched. */
  isLoading: boolean;
  /** Clears the active filters. */
  onClear: () => void;
}): string | null {
  const [missedTerm, setMissedTerm] = useState<string | null>(null);
  // Guards against re-firing: onClear changes `applied`, which re-runs this
  // effect, and without the guard it would clear again on every render.
  const handled = useRef<string | null>(null);

  useEffect(() => {
    // Zero results while loading just means "not here yet".
    if (isLoading) return;
    if (!urlQuery) return;
    // The visitor has typed something since arriving — their search, their call.
    if (appliedSearch !== urlQuery) return;
    if (resultCount > 0) return;
    if (handled.current === urlQuery) return;

    handled.current = urlQuery;
    setMissedTerm(urlQuery);
    onClear();
  }, [isLoading, urlQuery, appliedSearch, resultCount, onClear]);

  return missedTerm;
}
