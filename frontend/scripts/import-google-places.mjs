// One-time pull of HiSpike directory data from the Google Places API (New).
//
// Produces one .xlsx per city per category in the EXACT column format the Admin
// "Import" screens expect, so you can upload them straight away and then curate.
//
// This is a SEED: we only map fields Google reliably returns (name, address,
// locality, phone, rating, website, opening hours). Curation-only fields
// (specialties, features, pool type, email, image, highlights) are left blank
// for you to fill in the Admin — which also keeps us clear of Google's
// data-storage terms (we don't store reviews or photos).
//
// Usage (from the frontend/ folder):
//   node scripts/import-google-places.mjs YOUR_GOOGLE_MAPS_API_KEY
//   node scripts/import-google-places.mjs YOUR_KEY --city Pune
//   node scripts/import-google-places.mjs YOUR_KEY --city pune,hyderabad,mumbai
//   node scripts/import-google-places.mjs YOUR_KEY --city all --max 40 --out ./elsewhere
//   node scripts/import-google-places.mjs YOUR_KEY --count-only
// Or:  GOOGLE_MAPS_API_KEY=... node scripts/import-google-places.mjs
//
// With no --city it pulls the cities that exist in src/lib/cities.ts but are
// not live yet — i.e. exactly the ones still waiting for data. Bengaluru is
// already populated, so it is skipped unless you ask for it by name.
//
// Requires Node 18+ (built-in fetch). Run `npm install` first if needed.

import * as XLSX from 'xlsx';
import { mkdirSync, readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));

// ---- the city list -----------------------------------------------------------
// Read from src/lib/cities.ts rather than duplicated here. A second copy is how
// a city ends up spelled two ways, and the spelling is what the app filters on.
function loadCities() {
  const file = resolve(HERE, '../src/lib/cities.ts');
  let source;
  try {
    source = readFileSync(file, 'utf8');
  } catch {
    throw new Error(`Could not read ${file} — run this from the frontend/ folder.`);
  }
  const cities = [];
  // `live` is matched loosely rather than as the fourth field: a city entry has
  // grown a `categories` list since, and pinning the field order is what made an
  // earlier version of this parse silently find nothing.
  const entry =
    /\{\s*slug:\s*'([^']+)',\s*name:\s*'([^']+)',\s*state:\s*'([^']+)',[^}]*?live:\s*(true|false)\s*,?\s*\}/g;
  let m;
  while ((m = entry.exec(source))) {
    cities.push({ slug: m[1], name: m[2], state: m[3], live: m[4] === 'true' });
  }
  if (cities.length === 0) {
    throw new Error(
      'Could not parse any cities out of src/lib/cities.ts — has the CITIES shape changed?',
    );
  }
  return cities;
}

const ALL_CITIES = loadCities();

// ---- args ----
const args = process.argv.slice(2);
const apiKey = (args.find((a) => !a.startsWith('--')) || process.env.GOOGLE_MAPS_API_KEY || '').trim();
const getFlag = (name, def) => {
  const i = args.indexOf(`--${name}`);
  return i !== -1 && args[i + 1] ? args[i + 1] : def;
};
const hasFlag = (name) => args.includes(`--${name}`);

const MAX_PER_CATEGORY = Number(getFlag('max', '40'));
// Defaults into google-import/ because that is the folder .gitignore excludes.
// Writing to the repo root instead put a whole Google Places pull into a commit,
// which is exactly what not storing this data long-term is meant to avoid.
const OUT_DIR = resolve(getFlag('out', './google-import'));
// Fetches and reports counts without writing any spreadsheets — a cheap way to
// see how much a city actually has before committing to curating it.
const COUNT_ONLY = hasFlag('count-only');

function pickCities() {
  const raw = getFlag('city', '').trim();
  if (!raw) {
    // Default: everything still waiting for data.
    const pending = ALL_CITIES.filter((c) => !c.live);
    if (pending.length === 0) {
      throw new Error('Every city in cities.ts is already live — pass --city <name> to re-pull one.');
    }
    return pending;
  }
  if (raw.toLowerCase() === 'all') return ALL_CITIES;

  const wanted = raw.split(',').map((s) => s.trim().toLowerCase()).filter(Boolean);
  const picked = [];
  for (const w of wanted) {
    const city = ALL_CITIES.find((c) => c.slug === w || c.name.toLowerCase() === w);
    if (!city) {
      throw new Error(
        `Unknown city "${w}". Known: ${ALL_CITIES.map((c) => c.name).join(', ')}.\n` +
          'Add it to src/lib/cities.ts first — that list is what the site filters on.',
      );
    }
    if (!picked.some((c) => c.slug === city.slug)) picked.push(city);
  }
  return picked;
}

if (!apiKey) {
  console.error(
    '\nMissing API key.\n' +
      'Usage: node scripts/import-google-places.mjs YOUR_GOOGLE_MAPS_API_KEY [--city pune,mumbai] [--max 40] [--out ./folder] [--count-only]\n' +
      `Known cities: ${ALL_CITIES.map((c) => `${c.name}${c.live ? '' : ' (not live)'}`).join(', ')}\n`,
  );
  process.exit(1);
}

const SEARCH_URL = 'https://places.googleapis.com/v1/places:searchText';
const FIELD_MASK = [
  'places.id',
  'places.displayName',
  'places.formattedAddress',
  'places.shortFormattedAddress',
  'places.addressComponents',
  'places.nationalPhoneNumber',
  'places.internationalPhoneNumber',
  'places.rating',
  'places.userRatingCount',
  'places.websiteUri',
  'places.regularOpeningHours',
].join(',');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const truncate = (s, n) => (s && s.length > n ? s.slice(0, n - 1).trimEnd() + '…' : s || '');

// Pull a single text query, following nextPageToken up to `max` results.
async function searchText(query, max) {
  const out = [];
  let pageToken;
  for (let page = 0; page < 3 && out.length < max; page++) {
    const body = { textQuery: query, regionCode: 'IN', pageSize: 20 };
    if (pageToken) body.pageToken = pageToken;
    const res = await fetch(SEARCH_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': FIELD_MASK,
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const text = await res.text();
      let detail = text.slice(0, 400);
      try {
        detail = JSON.parse(text).error?.message ?? detail;
      } catch {
        // Not JSON — the raw body is the best we have.
      }
      throw new Error(`Places API ${res.status}: ${detail}`);
    }
    const data = await res.json();
    out.push(...(data.places || []));
    pageToken = data.nextPageToken;
    if (!pageToken) break;
    await sleep(2000); // give the page token a moment to become valid
  }
  return out.slice(0, max);
}

// Run several queries for a category and de-dupe by place id.
async function gather(queries, max) {
  const byId = new Map();
  for (const q of queries) {
    process.stdout.write(`   • "${q}" … `);
    const places = await searchText(q, max);
    let added = 0;
    for (const p of places) {
      if (p.id && !byId.has(p.id)) {
        byId.set(p.id, p);
        added++;
      }
    }
    console.log(`${places.length} found (${added} new)`);
  }
  return [...byId.values()].slice(0, max);
}

// Pull "Locality"/area from address components (neighbourhood → sublocality).
// Falls back to the city we searched, never a hardcoded one.
function localityOf(place, city) {
  const comps = place.addressComponents || [];
  const pick = (type) => comps.find((c) => (c.types || []).includes(type))?.longText;
  return (
    pick('sublocality_level_1') ||
    pick('sublocality') ||
    pick('neighborhood') ||
    pick('locality') ||
    city.name
  );
}

// The city column the Admin import reads. Google's own `locality` is preferred
// so a result that is really in Thane or Navi Mumbai says so rather than being
// filed under the city we happened to search — except that it must still match
// one of OUR city names to be importable, so anything unrecognised falls back
// to the searched city and can be corrected during curation.
function cityOf(place, city, knownNames) {
  const comps = place.addressComponents || [];
  const found = comps.find((c) => (c.types || []).includes('locality'))?.longText;
  if (found && knownNames.has(found.toLowerCase())) return found;
  return city.name;
}

function hoursOf(place) {
  const lines = place.regularOpeningHours?.weekdayDescriptions || [];
  // Keep it within the schema's 120-char limit for hours.
  return truncate(lines.join('; '), 120);
}

const common = (place) => ({
  name: place.displayName?.text || '',
  address: place.shortFormattedAddress || place.formattedAddress || '',
  phone: truncate(place.nationalPhoneNumber || place.internationalPhoneNumber || '', 40),
  rating: place.rating != null ? String(place.rating) : '',
  website: truncate(place.websiteUri || '', 500),
  hours: hoursOf(place),
});

// Per-category config: search queries + a row builder matching the Admin Import
// columns exactly (see IMPORT_CONFIGS in Admin.tsx). Queries take the city, so
// one config serves every city.
const CATEGORIES = [
  {
    file: 'hospitals.xlsx',
    label: 'Hospitals / Vets',
    queries: (city) => [`veterinary hospital in ${city.name}`, `pet clinic in ${city.name}`],
    headers: ['Name', 'Locality', 'City', 'Address', 'Phone', 'Specialties', 'Rating', 'Email', 'Open hours', 'Website'],
    row: (p, city, known) => {
      const c = common(p);
      return {
        Name: c.name,
        Locality: localityOf(p, city),
        City: cityOf(p, city, known),
        Address: c.address,
        Phone: c.phone,
        Specialties: '',
        Rating: c.rating,
        Email: '',
        'Open hours': c.hours,
        Website: c.website,
      };
    },
  },
  {
    file: 'parks.xlsx',
    label: 'Parks',
    queries: (city) => [`dog park in ${city.name}`, `dog friendly park in ${city.name}`],
    headers: ['Name', 'Locality', 'City', 'Address', 'Rating', 'Cost', 'Off-leash', 'Features', 'Open hours', 'Phone', 'Email', 'Website', 'Image URL', 'Highlights'],
    row: (p, city, known) => {
      const c = common(p);
      return {
        Name: c.name,
        Locality: localityOf(p, city),
        City: cityOf(p, city, known),
        Address: c.address,
        Rating: c.rating,
        Cost: '',
        'Off-leash': '',
        Features: '',
        'Open hours': c.hours,
        Phone: c.phone,
        Email: '',
        Website: c.website,
        'Image URL': '',
        Highlights: '',
      };
    },
  },
  {
    file: 'swim-schools.xlsx',
    label: 'Swimming',
    queries: (city) => [`dog swimming pool in ${city.name}`, `pet swimming in ${city.name}`],
    headers: ['Name', 'Locality', 'City', 'Address', 'Rating', 'Pool type', 'Cost', 'Open hours', 'Phone', 'Email', 'Website', 'Image URL', 'Highlights'],
    row: (p, city, known) => {
      const c = common(p);
      return {
        Name: c.name,
        Locality: localityOf(p, city),
        City: cityOf(p, city, known),
        Address: c.address,
        Rating: c.rating,
        'Pool type': '',
        Cost: '',
        'Open hours': c.hours,
        Phone: c.phone,
        Email: '',
        Website: c.website,
        'Image URL': '',
        Highlights: '',
      };
    },
  },
  {
    file: 'grooming-salons.xlsx',
    label: 'Grooming',
    queries: (city) => [`pet grooming in ${city.name}`, `dog grooming salon in ${city.name}`],
    headers: ['Name', 'Area', 'City', 'Address', 'Phone', 'Rating', 'Open hours', 'Email', 'Website', 'Image URL'],
    row: (p, city, known) => {
      const c = common(p);
      return {
        Name: c.name,
        Area: localityOf(p, city),
        City: cityOf(p, city, known),
        Address: c.address,
        Phone: c.phone,
        Rating: c.rating,
        'Open hours': c.hours,
        Email: '',
        Website: c.website,
        'Image URL': '',
      };
    },
  },
];

function writeXlsx(file, headers, rows) {
  const aoa = [headers, ...rows.map((r) => headers.map((h) => r[h] ?? ''))];
  const sheet = XLSX.utils.aoa_to_sheet(aoa);
  sheet['!cols'] = headers.map((h) => ({ wch: Math.max(14, Math.min(40, h.length + 6)) }));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, sheet, 'Import');
  const path = resolve(OUT_DIR, file);
  XLSX.writeFile(wb, path);
  return path;
}

async function main() {
  const cities = pickCities();
  const knownNames = new Set(ALL_CITIES.map((c) => c.name.toLowerCase()));
  if (!COUNT_ONLY) mkdirSync(OUT_DIR, { recursive: true });

  console.log(
    `\nPulling up to ${MAX_PER_CATEGORY} places per category from Google Places (New)` +
      `\nCities: ${cities.map((c) => c.name).join(', ')}` +
      (COUNT_ONLY ? '\nCount-only run — no spreadsheets will be written.' : '') +
      '\n',
  );

  const tally = [];
  for (const city of cities) {
    console.log(`━━ ${city.name} ━━`);
    for (const cat of CATEGORIES) {
      console.log(`▶ ${cat.label}`);
      const places = await gather(cat.queries(city), MAX_PER_CATEGORY);
      const rows = places
        .map((p) => cat.row(p, city, knownNames))
        .filter((r) => r.Name && r.Address);
      tally.push({ city: city.name, category: cat.label, rows: rows.length });
      if (COUNT_ONLY) {
        console.log(`   → ${rows.length} usable rows (not written)\n`);
        continue;
      }
      // City-prefixed so a multi-city run cannot overwrite itself, and so a
      // stray .xlsx in your downloads still says which city it holds.
      const path = writeXlsx(`${city.slug}-${cat.file}`, cat.headers, rows);
      console.log(`   → wrote ${rows.length} rows to ${path}\n`);
    }
  }

  console.log('Summary');
  console.log('─'.repeat(46));
  for (const t of tally) {
    console.log(`${t.city.padEnd(12)} ${t.category.padEnd(20)} ${String(t.rows).padStart(4)}`);
  }
  console.log('─'.repeat(46));

  if (COUNT_ONLY) {
    console.log('\nCount-only run. Drop --count-only to write the spreadsheets.\n');
    return;
  }

  console.log(
    '\nNext: Admin → Import (Hospitals/Parks/Swim/Grooming), upload each file,\n' +
      'then review and fill the blank curation columns (Specialties, Features, Email, Image, …).\n' +
      '\nThe City column is filled in, so these rows land in the right city directory.\n' +
      'A city stays invisible to visitors until you set live: true for it in\n' +
      'src/lib/cities.ts and add its Render rewrite — so import and curate first,\n' +
      'then publish.\n',
  );
}

main().catch((err) => {
  console.error('\n✗ Failed:', err.message, '\n');
  process.exitCode = 1;
});
