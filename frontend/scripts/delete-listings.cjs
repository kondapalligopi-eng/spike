// Bulk-remove directory listings that should not be there.
//
// Written for the multi-city rollout: the Google pull returned ~66 "swim
// schools" for Pune, Hyderabad and Mumbai that are really boarding kennels and
// daycares, because dedicated dog pools barely exist outside Bengaluru. Removing
// those one at a time through the Admin is not reasonable.
//
// DELETION IS PERMANENT. There is no undo, so this dry-runs by default and
// prints every listing it would remove. Read that list before adding --apply.
//
// Usage (from the frontend/ folder):
//   node scripts/delete-listings.cjs --city Pune --kind swimming
//   node scripts/delete-listings.cjs --city Pune --kind swimming --apply
//   node scripts/delete-listings.cjs --kind swimming --id d47a717a-....   (one row)
//
// Options:
//   --kind  <k>     hospital | park | swimming | grooming   (required)
//   --city  <name>  only listings in this city
//   --id    <uuid>  only this listing (may be repeated as a comma list)
//   --api   <url>   API base (default https://petdogs-backend.onrender.com)
//   --apply         actually delete; without it nothing is removed
//
// You are prompted for your admin email and password. Neither is stored or
// logged, and the password is not echoed as you type.

const readline = require('node:readline');

const args = process.argv.slice(2);
const flag = (name, def) => {
  const i = args.indexOf(`--${name}`);
  return i !== -1 && args[i + 1] ? args[i + 1] : def;
};
const has = (name) => args.includes(`--${name}`);

const KIND = flag('kind');
const CITY = flag('city');
const IDS = (flag('id', '') || '').split(',').map((s) => s.trim()).filter(Boolean);
const API = flag('api', 'https://petdogs-backend.onrender.com').replace(/\/$/, '');
const APPLY = has('apply');

const ENDPOINTS = {
  hospital: '/api/v1/hospitals',
  park: '/api/v1/parks',
  swimming: '/api/v1/swim-schools',
  grooming: '/api/v1/grooming-salons',
};

if (!KIND || !ENDPOINTS[KIND] || (!CITY && IDS.length === 0)) {
  console.error(
    '\nUsage: node scripts/delete-listings.cjs --kind <hospital|park|swimming|grooming>' +
      ' (--city <Name> | --id <uuid>) [--apply]\n' +
      'Refuses to run without a --city or --id: deleting a whole category by accident is not recoverable.\n',
  );
  process.exit(1);
}

function ask(question, { hidden = false } = {}) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true });
  return new Promise((res) => {
    if (hidden) {
      const onData = (char) => {
        if (['\n', '\r', ''].includes(String(char))) process.stdin.removeListener('data', onData);
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

async function main() {
  const endpoint = ENDPOINTS[KIND];
  const all = await api(endpoint);

  let targets = all;
  if (CITY) targets = targets.filter((r) => r.city === CITY);
  if (IDS.length) targets = targets.filter((r) => IDS.some((id) => r.id.startsWith(id)));

  console.log(`\n${endpoint} — ${all.length} total, ${targets.length} matched`);
  console.log(`Filter: kind=${KIND}${CITY ? ` city=${CITY}` : ''}${IDS.length ? ` id=${IDS.join(',')}` : ''}`);
  console.log(APPLY ? 'MODE: apply — these will be PERMANENTLY DELETED.\n' : 'MODE: dry run — nothing will be deleted.\n');

  if (targets.length === 0) {
    console.log('Nothing matched. Stopping.');
    return;
  }

  for (const r of targets) {
    console.log(`  ${r.id.slice(0, 8)}  ${String(r.name).slice(0, 46).padEnd(48)} ${r.locality ?? r.area ?? ''}`);
  }

  if (!APPLY) {
    console.log(`\nDry run. ${targets.length} listing(s) would be deleted. Re-run with --apply.\n`);
    return;
  }

  const confirm = await ask(`\nType the number ${targets.length} to confirm permanent deletion: `);
  if (confirm !== String(targets.length)) {
    console.log('Not confirmed — nothing deleted.');
    return;
  }

  const email = await ask('Admin email: ');
  const password = await ask('Admin password: ', { hidden: true });
  const { access_token: token } = await api('/api/v1/auth/login', {
    method: 'POST',
    body: { email, password },
  });
  console.log('Signed in.\n');

  let ok = 0;
  for (const r of targets) {
    try {
      await api(`${endpoint}/${r.id}`, { method: 'DELETE', token });
      ok++;
      process.stdout.write('.');
    } catch (err) {
      console.log(`\n  ! ${r.name}: ${err.message}`);
    }
  }
  console.log(`\n\nDeleted ${ok} of ${targets.length}.\n`);
}

main().catch((err) => {
  console.error('\n✗ Failed:', err.message, '\n');
  process.exitCode = 1;
});
