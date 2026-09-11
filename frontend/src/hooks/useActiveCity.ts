import { useEffect, useState } from 'react';
import { DEFAULT_CITY, cityBySlug, type City } from '@/lib/cities';
import { useCity } from './useCity';

const STORAGE_KEY = 'hispike_city';

/**
 * The city to use for chrome that appears on every page — nav links, the city
 * switcher, the footer.
 *
 * Inside a city route that city wins and is remembered. Everywhere else (the
 * home page, a blog post) the last city the visitor chose is used, falling back
 * to the default.
 *
 * The stored value is read in an effect rather than during render: the
 * pre-rendered HTML has no localStorage, so reading it while rendering would
 * make the first client render disagree with the server's and break hydration.
 */
export function useActiveCity(): City {
  const routeCity = useCity();
  const [remembered, setRemembered] = useState<City>(DEFAULT_CITY);

  useEffect(() => {
    if (routeCity) {
      setRemembered(routeCity);
      try {
        localStorage.setItem(STORAGE_KEY, routeCity.slug);
      } catch {
        // A browser refusing storage just means the choice is not remembered.
      }
      return;
    }
    try {
      const stored = cityBySlug(localStorage.getItem(STORAGE_KEY) ?? undefined);
      if (stored) setRemembered(stored);
    } catch {
      // Ignore — the default is a fine answer.
    }
  }, [routeCity]);

  return routeCity ?? remembered;
}
