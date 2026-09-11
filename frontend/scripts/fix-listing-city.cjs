// One-off repair: set the City of listings that were imported before the API
// started honouring it.
//
// Background: `city` was added to the models and schemas but the create/update
// endpoints never assigned it, so imported rows silently took the column
// default ("Bengaluru") whatever the spreadsheet said. This matches the rows
// from a pull spreadsheet against what is live and moves them to the right
// city. Once the fixed backend is deployed this script has no further use.
//
// Usage (from the frontend/ folder) — DRY RUN first, it changes nothing:
//   node scripts/fix-listing-city.cjs --file google-import/pune-hospitals.xlsx --city Pune
//
// Then, to actually write:
//   node scripts/fix-listing-city.cjs --file google-import/pune-hospitals.xlsx --city Pune --apply
//
// Options:
//   --file   <path>   the spreadsheet whose rows were imported (required)
//   --city   <name>   the city those rows belong to (required)
//   --kind   <k>      hospital | park | swimming  (default: guessed from the filename)
//   --api    <url>    API base (default https://petdogs-backend.onrender.com)
//   --apply           perform the updates; without it nothing is written
//
// You are prompted for your admin email and password. Neither is stored or
// logged — the password is not echoed as you type.

const XLSX = require('xlsx');
const readline = require('node:readline');
const { resolve } = require('node:path');

const args = process.argv.slice(2);
const flag = (name, def) => {
  const i = args.indexOf(`--${name}`);
  return i !== -1 && args[i + 1] ? args[i + 1] : def;
};
const has = (name) => args.includes(`--${name}`);

const FILE = flag('file');
const CITY = flag('city');
const API = flag('api', 'https://petdogs-backend.onrender.com').replace(/\/$/, '');
const APPLY = has('apply');

const ENDPOINTS = {
  hospital: '/api/v1/hospitals',
  park: '/api/v1/parks',
  swimming: '/api/v1/swim-schools',
};

function guessKind(file) {
  if (/hospital/i.test(file)) return 'hospital';
  if (/park/i.test(file)) return 'park';
  if (/swim/i.test(file)) return 'swimming';
  return null;
}

const KIND = flag('kind', guessKind(FILE || ''));

if (!FILE || !CITY || !KIND || !ENDPOINTS[KIND]) {
  console.error(
    '\nUsage: node scripts/fix-listing-city.cjs --file <xlsx> --city <Name> [--kind hospital|park|swimming] [--apply]\n' +
      'Grooming is not listed here: its endpoint has always honoured City, so it needs no repair.\n',
  );
  process.exit(1);
}

function ask(question, { hidden = false } = {}) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true });
  return new Promise((res) => {
    if (hidden) {
      // Swallow the echo so the password does not appear on screen or in a
      // scrollback someone else might read.
      const onData = (char) => {
        if (['\n', '\r', ''].includes(String(char))) process.stdin.removeListener('data', onData);
        else rl.output.write('[2K[200D' + question + '*'.repeat(rl.line.length));
      };
      process.stdin.on('data', onData);
    }
    rl.question(question, (answer) => {
      rl.close();
      if (hidden) process.stdout.write('\n');
      res(answer.trim());
    });
  });
}

async function api(path, { method = 'GET', token, body } = {}) {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  if (!res.ok) {
    let detail = text.slice(0, 300);
    try {
      detail = JSON.parse(text).detail ?? detail;
    } catch {
      /* not JSON */
    }
    throw new Error(`${method} ${path} -> ${res.status}: ${detail}`);
  }
  return text ? JSON.parse(text) : null;
}

const norm = (s) => String(s || '').trim().toLowerCase().replace(/\s+/g, ' ');

async function main() {
  const sheetPath = resolve(FILE);
  const wb = XLSX.readFile(sheetPath);
  const rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { defval: '' });
  const wanted = new Set(rows.map((r) => norm(r.Name)).filter(Boolean));
  console.log(`\n${rows.length} rows in ${FILE} (${wanted.size} distinct names)`);
  console.log(`Target city: ${CITY}   Endpoint: ${ENDPOINTS[KIND]}   API: ${API}`);
  console.log(APPLY ? 'MODE: apply — listings will be updated.\n' : 'MODE: dry run — nothing will be written.\n');

  const email = await ask('Admin email: ');
  const password = await ask('Admin password: ', { hidden: true });

  const { access_token: token } = await api('/api/v1/auth/login', {
    method: 'POST',
    body: { email, password },
  });
  console.log('Signed in.\n');

  const live = await api(ENDPOINTS[KIND]);
  const targets = live.filter((r) => wanted.has(norm(r.name)) && r.city !== CITY);

  if (targets.length === 0) {
    console.log('Nothing to change — no listing from this sheet has the wrong city.');
    return;
  }

  console.log(`${targets.length} listing(s) to move to ${CITY}:`);
  for (const t of targets) console.log(`  - ${t.name}  (currently ${t.city})`);

  if (!APPLY) {
    console.log('\nDry run. Re-run with --apply to make these changes.\n');
    return;
  }

  let ok = 0;
  for (const t of targets) {
    // PUT replaces the record, so send it back whole with only city changed.
    const { id, created_at, updated_at, ...rest } = t;
    void created_at;
    void updated_at;
    try {
      await api(`${ENDPOINTS[KIND]}/${id}`, { method: 'PUT', token, body: { ...rest, city: CITY } });
      ok++;
      process.stdout.write('.');
    } catch (err) {
      console.log(`\n  ! ${t.name}: ${err.message}`);
    }
  }
  console.log(`\n\nUpdated ${ok} of ${targets.length}.\n`);
}

main().catch((err) => {
  console.error('\n✗ Failed:', err.message, '\n');
  process.exitCode = 1;
});
