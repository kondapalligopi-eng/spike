// One-time pull of HiSpike directory data from the Google Places API (New).
//
// Produces one .xlsx per category in the EXACT column format the Admin "Import"
// screens expect, so you can upload them straight away and then curate.
//
// This is a SEED: we only map fields Google reliably returns (name, address,
// locality, phone, rating, website, opening hours). Curation-only fields
// (specialties, features, pool type, email, image, highlights) are left blank
// for you to fill in the Admin — which also keeps us clear of Google's
// data-storage terms (we don't store reviews or photos).
//
// Usage (from the frontend/ folder):
//   node scripts/import-google-places.mjs YOUR_GOOGLE_MAPS_API_KEY
//   node scripts/import-google-places.mjs YOUR_KEY --max 40 --out ./google-import
// Or:  GOOGLE_MAPS_API_KEY=... node scripts/import-google-places.mjs
//
// Requires Node 18+ (built-in fetch). Run `npm install` first if needed.

import * as XLSX from 'xlsx';
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

// ---- args ----
const args = process.argv.slice(2);
const apiKey = (args.find((a) => !a.startsWith('--')) || process.env.GOOGLE_MAPS_API_KEY || '').trim();
const getFlag = (name, def) => {
  const i = args.indexOf(`--${name}`);
  return i !== -1 && args[i + 1] ? args[i + 1] : def;
};
const MAX_PER_CATEGORY = Number(getFlag('max', '40'));
const OUT_DIR = resolve(getFlag('out', '.'));

if (!apiKey) {
  console.error(
    '\nMissing API key.\n' +
      'Usage: node scripts/import-google-places.mjs YOUR_GOOGLE_MAPS_API_KEY [--max 40] [--out ./folder]\n',
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
      throw new Error(`Places API ${res.status}: ${text.slice(0, 400)}`);
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
function localityOf(place) {
  const comps = place.addressComponents || [];
  const pick = (type) => comps.find((c) => (c.types || []).includes(type))?.longText;
  return (
    pick('sublocality_level_1') ||
    pick('sublocality') ||
    pick('neighborhood') ||
    pick('locality') ||
    'Bengaluru'
  );
}

function cityOf(place) {
  const comps = place.addressComponents || [];
  return comps.find((c) => (c.types || []).includes('locality'))?.longText || 'Bengaluru';
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

// Per-category config: search queries + a row builder matching the Admin
// Import columns exactly (see IMPORT_CONFIGS in Admin.tsx).
const CATEGORIES = [
  {
    file: 'hospitals.xlsx',
    label: 'Hospitals / Vets',
    queries: ['veterinary hospital in Bengaluru', 'pet clinic in Bengaluru'],
    headers: ['Name', 'Locality', 'Address', 'Phone', 'Specialties', 'Rating', 'Email', 'Open hours', 'Website'],
    row: (p) => {
      const c = common(p);
      return {
        Name: c.name,
        Locality: localityOf(p),
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
    queries: ['dog park in Bengaluru', 'dog friendly park in Bengaluru'],
    headers: ['Name', 'Locality', 'Address', 'Rating', 'Cost', 'Off-leash', 'Features', 'Open hours', 'Phone', 'Email', 'Website', 'Image URL', 'Highlights'],
    row: (p) => {
      const c = common(p);
      return {
        Name: c.name,
        Locality: localityOf(p),
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
    queries: ['dog swimming pool in Bengaluru', 'pet swimming in Bengaluru'],
    headers: ['Name', 'Locality', 'Address', 'Rating', 'Pool type', 'Cost', 'Open hours', 'Phone', 'Email', 'Website', 'Image URL', 'Highlights'],
    row: (p) => {
      const c = common(p);
      return {
        Name: c.name,
        Locality: localityOf(p),
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
    queries: ['pet grooming in Bengaluru', 'dog grooming salon in Bengaluru'],
    headers: ['Name', 'Area', 'City', 'Address', 'Phone', 'Rating', 'Open hours', 'Email', 'Website', 'Image URL'],
    row: (p) => {
      const c = common(p);
      return {
        Name: c.name,
        Area: localityOf(p),
        City: cityOf(p),
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
  mkdirSync(OUT_DIR, { recursive: true });
  console.log(`\nPulling up to ${MAX_PER_CATEGORY} places per category from Google Places (New)…\n`);
  for (const cat of CATEGORIES) {
    console.log(`▶ ${cat.label}`);
    const places = await gather(cat.queries, MAX_PER_CATEGORY);
    const rows = places.map(cat.row).filter((r) => r.Name && r.Address);
    const path = writeXlsx(cat.file, cat.headers, rows);
    console.log(`   → wrote ${rows.length} rows to ${path}\n`);
  }
  console.log(
    'Done. Next: open Admin → Import (Hospitals/Parks/Swim/Grooming) and upload each file,\n' +
      'then review & fill the blank curation columns (Specialties, Features, Email, Image, …).\n',
  );
}

main().catch((err) => {
  console.error('\n✗ Failed:', err.message, '\n');
  process.exit(1);
});
