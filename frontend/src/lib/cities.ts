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

export type Category = 'hospital' | 'park' | 'swimming' | 'grooming';

export const ALL_CATEGORIES: Category[] = ['hospital', 'park', 'swimming', 'grooming'];

export type City = {
  /** URL segment. Permanent once indexed. */
  slug: string;
  /** Display name, and the value stored on every listing's `city` column. */
  name: string;
  /** Shown under the name in the switcher. */
  state: string;
  /**
   * The categories this city actually has listings for. A category left out
   * renders a "coming soon" splash instead of an empty directory.
   *
   * Static rather than counted from the API, because the decision has to hold
   * during pre-rendering: at build time the data has not been fetched, so a
   * data-driven check emits a normal, indexable page for a category with
   * nothing in it. Add a category here once its listings are imported.
   */
  categories: Category[];
  /** Published? See the note above before flipping one on. */
  live: boolean;
};

export const CITIES: City[] = [
  { slug: 'bengaluru', name: 'Bengaluru', state: 'Karnataka', categories: ALL_CATEGORIES, live: true },
  // No dog pools worth listing here — swimming shows a coming-soon splash.
  { slug: 'pune', name: 'Pune', state: 'Maharashtra', categories: ['hospital', 'park', 'grooming'], live: true },
  // No dog pools worth listing here — swimming shows a coming-soon splash.
  { slug: 'hyderabad', name: 'Hyderabad', state: 'Telangana', categories: ['hospital', 'park', 'grooming'], live: true },
  // No dog pools worth listing here — swimming shows a coming-soon splash.
  { slug: 'mumbai', name: 'Mumbai', state: 'Maharashtra', categories: ['hospital', 'park', 'grooming'], live: true },
];

/** Where a visitor with no city in the URL ends up. */
export const DEFAULT_CITY: City = CITIES[0];

/** Cities a visitor can reach from the switcher. */
export const LIVE_CITIES = CITIES.filter((c) => c.live);

/** The names the admin can pick from — every city, live or not, since listings
 *  have to be loaded before a city can go live. */
export const CITY_NAMES = CITIES.map((c) => c.name);

/**
 * The live cities as a readable phrase: "Bengaluru, Pune, Hyderabad & Mumbai".
 *
 * Past `max` it counts instead of naming, because a banner listing eight
 * cities stops being read. Derived from CITIES so copy that names our
 * coverage cannot quietly go stale the next time one is published.
 */
export function liveCitiesLabel(max = 4): string {
  const names = CITIES.filter((c) => c.live).map((c) => c.name);
  if (names.length === 0) return DEFAULT_CITY.name;
  if (names.length === 1) return names[0];
  if (names.length > max) return `${names.length} Indian cities`;
  return `${names.slice(0, -1).join(', ')} & ${names[names.length - 1]}`;
}

/** Live cities that list this category — used to point a visitor at one
 *  that has what the city they are on does not. */
export function citiesWithCategory(category: Category): City[] {
  return CITIES.filter((c) => c.live && c.categories.includes(category));
}

/** Does this city list anything in this category? */
export function hasCategory(city: City, category: Category): boolean {
  return city.categories.includes(category);
}

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
