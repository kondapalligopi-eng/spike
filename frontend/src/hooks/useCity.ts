import { useParams } from 'react-router-dom';
import { cityBySlug, type City } from '@/lib/cities';

/**
 * The city the current route is scoped to.
 *
 * Returns undefined when the slug isn't one of ours (`/atlantis/hospital`). The
 * page must render a not-found state in that case rather than falling back to
 * Bengaluru: quietly serving another city's listings under an arbitrary slug
 * would let crawlers index an unbounded number of duplicate pages.
 */
export function useCity(): City | undefined {
  const { city } = useParams<{ city: string }>();
  return cityBySlug(city);
}
