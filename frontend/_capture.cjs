const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  const hits = [];
  page.on('console', (msg) => {
    const t = msg.text();
    if (/hydrat|did not match|Text content|Minified React|error #4/i.test(t)) hits.push(`[${msg.type()}] ${t.slice(0, 200)}`);
  });
  page.on('pageerror', (err) => hits.push(`[pageerror] ${err.message.slice(0, 200)}`));
  try { await page.goto('http://localhost:3002/', { waitUntil: 'networkidle2', timeout: 45000 }); }
  catch (e) { hits.push(`[goto-error] ${e.message}`); }
  await new Promise((r) => setTimeout(r, 2500));
  console.log('===== RESULT =====');
  console.log(hits.length ? hits.join('\n') : '✅ NO hydration/text-mismatch errors — clean!');
  await browser.close();
})();
