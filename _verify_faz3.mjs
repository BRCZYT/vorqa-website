import puppeteer from 'puppeteer';

const base = 'http://localhost:3000';
const pages = [
  ['tr', '/tr/'], ['en', '/en/'], ['ar', '/ar/'],
  ['tr', '/tr/akademi/'], ['en', '/en/academy/'], ['ar', '/ar/academy/'],
  ['tr', '/tr/iletisim/'], ['en', '/en/contact/'], ['ar', '/ar/contact/'],
];

const browser = await puppeteer.launch({ headless: 'new' });
let allOk = true;

for (const [lang, path] of pages) {
  const page = await browser.newPage();
  const failed = [];
  const consoleErrors = [];
  page.on('response', (res) => {
    if (res.status() >= 400) failed.push(`${res.status()} ${res.url()}`);
  });
  page.on('console', (msg) => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });
  page.on('pageerror', (err) => consoleErrors.push(err.message));

  const resp = await page.goto(base + path, { waitUntil: 'networkidle0', timeout: 30000 });
  const dir = await page.$eval('html', el => el.getAttribute('dir'));
  const favicon32 = await page.$eval('link[rel="icon"][sizes="32x32"]', el => el.href).catch(() => null);
  const appleIcon = await page.$eval('link[rel="apple-touch-icon"]', el => el.href).catch(() => null);

  console.log(`\n[${path}] status=${resp.status()} dir=${dir}`);
  if (favicon32) console.log(`  favicon-32: ${favicon32}`);
  if (appleIcon) console.log(`  apple-touch-icon: ${appleIcon}`);

  if (failed.length) { allOk = false; console.log('  BROKEN REQUESTS:', failed); }
  if (consoleErrors.length) { allOk = false; console.log('  CONSOLE ERRORS:', consoleErrors); }

  // Check Mira image presence + natural size (proves it actually loaded, not broken)
  const miraSelector = path.includes('akademi') || path.includes('academy') ? '.mira-strip-avatar' :
                        (path.includes('iletisim') || path.includes('contact')) ? '.mira-frame img' : null;
  if (miraSelector) {
    const miraInfo = await page.$eval(miraSelector, img => ({
      src: img.currentSrc || img.src,
      naturalWidth: img.naturalWidth,
      naturalHeight: img.naturalHeight,
    })).catch(() => null);
    console.log('  Mira img:', miraInfo);
    if (!miraInfo || miraInfo.naturalWidth === 0) { allOk = false; console.log('  MIRA IMAGE BROKEN'); }
  }

  await page.close();
}

await browser.close();
console.log(allOk ? '\nALL OK' : '\nISSUES FOUND');
process.exit(allOk ? 0 : 1);
