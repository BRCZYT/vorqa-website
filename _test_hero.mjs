import puppeteer from 'puppeteer';
const browser = await puppeteer.launch({ headless: 'new' });

async function shot(urlPath, width, height, label) {
  const page = await browser.newPage();
  await page.setViewport({ width, height });
  const errors = [];
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', e => errors.push(e.message));
  await page.goto('http://localhost:3000' + urlPath, { waitUntil: 'networkidle0', timeout: 60000 });
  await new Promise(r => setTimeout(r, 3600)); // preloader
  await page.screenshot({ path: `_hero_${label}.png` });
  console.log(`[${label}] console errors:`, errors);
  await page.close();
}

await shot('/en/', 1440, 900, 'en_1440');
await shot('/en/', 375, 800, 'en_375');
await shot('/tr/', 1440, 900, 'tr_1440');
await shot('/ar/', 1440, 900, 'ar_1440');
await browser.close();
