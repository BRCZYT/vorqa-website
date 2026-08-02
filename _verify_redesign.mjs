import puppeteer from 'puppeteer';
const base = 'http://localhost:3000';
const pages = ['/tr/', '/en/', '/ar/', '/tr/akademi/', '/en/academy/', '/ar/academy/', '/tr/iletisim/', '/en/contact/', '/ar/contact/'];
const browser = await puppeteer.launch({ headless: 'new' });
let allOk = true;

for (const path of pages) {
  const page = await browser.newPage();
  const failed = [];
  const consoleErrors = [];
  page.on('response', (res) => { if (res.status() >= 400) failed.push(`${res.status()} ${res.url()}`); });
  page.on('console', (msg) => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });
  page.on('pageerror', (err) => consoleErrors.push(err.message));
  const resp = await page.goto(base + path, { waitUntil: 'networkidle0', timeout: 30000 });
  const dir = await page.$eval('html', el => el.getAttribute('dir'));
  console.log(`[${path}] status=${resp.status()} dir=${dir}`);
  if (failed.length) { allOk = false; console.log('  BROKEN:', failed); }
  if (consoleErrors.length) { allOk = false; console.log('  ERRORS:', consoleErrors); }
  await page.close();
}

// Home page: check images load, spine node count, panel count
const page = await browser.newPage();
await page.goto(base + '/en/', { waitUntil: 'networkidle0' });
await page.evaluate(() => document.querySelector('#industries').scrollIntoView());
await page.waitForNetworkIdle();
const indImgs = await page.$$eval('.ind-panel .ind-img img', els => els.map(i => i.naturalWidth));
const nodes = await page.$$eval('.step-node .n', els => els.map(e => e.textContent));
const steps = await page.$$eval('.step', els => els.length);
const rows = await page.$$eval('.wwd-row', els => els.length);
const panels = await page.$$eval('.ind-panel', els => els.length);
console.log('industries img widths:', indImgs);
console.log('spine nodes:', nodes, 'step count:', steps);
console.log('wwd rows:', rows, 'ind panels:', panels);
if (indImgs.some(w => w === 0)) { allOk = false; console.log('  INDUSTRY IMAGE BROKEN'); }
if (steps !== 5 || rows !== 4 || panels !== 4) { allOk = false; console.log('  COUNT MISMATCH'); }
await page.close();

await browser.close();
console.log(allOk ? '\nALL OK' : '\nISSUES FOUND');
process.exit(allOk ? 0 : 1);
