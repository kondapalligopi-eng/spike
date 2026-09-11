// The cities HiSpike runs a directory for.
//
// One source of truth, used by the public routes, the city switcher, the admin
// forms and the Excel import. A city's `slug` is its URL and is permanent once
// Google has indexed it — renaming one costs the ranking that page has earned.
//
// `live` is the publish switch. A city stays false until its four directories
// have enough real listings to be worth landing on: false keeps it out of the
// switcher, out of the pre-render, out of the sitemap and marked noindex, while
// the URL still works so you can preview it. Thin, near-empty city pages are
// how a directory gets treated as low-value, so this is deliberately opt-in.

export type City = {
  /** URL segment. Permanent once indexed. */
  slug: string;
  /** Display name, and the value stored on every listing's `city` column. */
  name: string;
  /** Shown under the name in the switcher. */
  state: string;
  /** Published? See the note above before flipping one on. */
  live: boolean;
};

export const CITIES: City[] = [
  { slug: 'bengaluru', name: 'Bengaluru', state: 'Karnataka', live: true },
  { slug: 'pune', name: 'Pune', state: 'Maharashtra', live: false },
  { slug: 'hyderabad', name: 'Hyderabad', state: 'Telangana', live: false },
  { slug: 'mumbai', name: 'Mumbai', state: 'Maharashtra', live: false },
];

/** Where a visitor with no city in the URL ends up. */
export const DEFAULT_CITY: City = CITIES[0];

/** Cities a visitor can reach from the switcher. */
export const LIVE_CITIES = CITIES.filter((c) => c.live);

/** The names the admin can pick from — every city, live or not, since listings
 *  have to be loaded before a city can go live. */
export const CITY_NAMES = CITIES.map((c) => c.name);

export function cityBySlug(slug: string | undefined): City | undefined {
  if (!slug) return undefined;
  const needle = slug.toLowerCase();
  return CITIES.find((c) => c.slug === needle);
}

export function cityByName(name: string | null | undefined): City | undefined {
  if (!name) return undefined;
  const needle = name.trim().toLowerCase();
  return CITIES.find((c) => c.name.toLowerCase() === needle);
}

/** Build a path inside a city, e.g. cityPath(city, 'hospital'). */
export function cityPath(city: City, segment: string): string {
  return `/${city.slug}/${segment.replace(/^\//, '')}`;
}

/**
 * Does this listing belong to `city`?
 *
 * Listings created before multi-city carry "Bengaluru" from the column default,
 * but the static grooming seeds have no city field at all — a missing value is
 * read as the default city rather than dropped, so nothing silently disappears
 * from the Bengaluru pages.
 */
export function isInCity(listingCity: string | null | undefined, city: City): boolean {
  const name = (listingCity ?? '').trim();
  if (!name) return city.slug === DEFAULT_CITY.slug;
  return name.toLowerCase() === city.name.toLowerCase();
}
