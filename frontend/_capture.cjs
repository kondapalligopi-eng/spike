const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  const logs = [];

  page.on('console', (msg) => {
    const text = msg.text();
    if (/hydrat|did not match|Text content|server|client|Warning|Minified React/i.test(text)) {
      logs.push(`[${msg.type()}] ${text}`);
    }
  });
  page.on('pageerror', (err) => logs.push(`[pageerror] ${err.message}`));

  try {
    await page.goto('http://localhost:3002/', { waitUntil: 'networkidle2', timeout: 45000 });
  } catch (e) {
    logs.push(`[goto-error] ${e.message}`);
  }
  await new Promise((r) => setTimeout(r, 2500));

  console.log('===== CAPTURED =====');
  console.log(logs.length ? logs.join('\n\n') : '(no matching console messages)');
  await browser.close();
})();
