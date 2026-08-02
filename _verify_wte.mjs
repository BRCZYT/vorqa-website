import puppeteer from 'puppeteer';
const base = 'http://localhost:3000';
const browser = await puppeteer.launch({ headless: 'new' });
let allOk = true;

for (const path of ['/tr/', '/en/', '/ar/']) {
  const page = await browser.newPage();
  const failed = [];
  page.on('response', (res) => { if (res.status() >= 400) failed.push(`${res.status()} ${res.url()}`); });
  const consoleErrors = [];
  page.on('console', (msg) => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });

  await page.goto(base + path, { waitUntil: 'networkidle0' });
  const dir = await page.$eval('html', el => el.getAttribute('dir'));
  await page.evaluate(() => document.querySelector('#industries').scrollIntoView());
  await page.waitForNetworkIdle();

  const imgs = await page.$$eval('.co-hx-card .co-hx-img img', els => els.map(img => ({
    src: img.currentSrc || img.src, naturalWidth: img.naturalWidth,
  })));
  console.log(`[${path}] dir=${dir}`);
  imgs.forEach((im, i) => console.log(`  card ${i}:`, JSON.stringify(im)));
  if (imgs.some(im => im.naturalWidth === 0)) { allOk = false; console.log('  BROKEN IMAGE'); }
  if (imgs.some(im => im.src.includes('illustrations/srv-'))) { allOk = false; console.log('  STILL USING SVG ILLUSTRATION'); }
  if (failed.length) { allOk = false; console.log('  BROKEN REQUESTS:', failed); }
  if (consoleErrors.length) { allOk = false; console.log('  CONSOLE ERRORS:', consoleErrors); }
  await page.close();
}
await browser.close();
console.log(allOk ? '\nALL OK' : '\nISSUES FOUND');
process.exit(allOk ? 0 : 1);
