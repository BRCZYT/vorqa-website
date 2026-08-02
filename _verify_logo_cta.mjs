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

  const logoInfo = await page.$eval('.logo-plaque img, .nav-logo img', img => ({
    src: img.currentSrc || img.src, naturalWidth: img.naturalWidth,
  })).catch(() => null);
  const footLogoInfo = await page.$eval('.foot-logo-plaque img', img => ({
    src: img.currentSrc || img.src, naturalWidth: img.naturalWidth,
  })).catch(() => null);

  const ctaGone = !(await page.$('#final-cta'));

  console.log(`[${path}] status=${resp.status()} dir=${dir} navLogo=${logoInfo ? logoInfo.naturalWidth : 'MISSING'} footLogo=${footLogoInfo ? footLogoInfo.naturalWidth : 'MISSING'} ctaGone=${ctaGone}`);

  if (!logoInfo || logoInfo.naturalWidth === 0) { allOk = false; console.log('  NAV LOGO BROKEN'); }
  if (!footLogoInfo || footLogoInfo.naturalWidth === 0) { allOk = false; console.log('  FOOTER LOGO BROKEN'); }
  if (path.match(/\/(tr|en|ar)\/$/) && !ctaGone) { allOk = false; console.log('  CTA BAND STILL PRESENT'); }
  if (failed.length) { allOk = false; console.log('  BROKEN REQUESTS:', failed); }
  if (consoleErrors.length) { allOk = false; console.log('  CONSOLE ERRORS:', consoleErrors); }
  await page.close();
}
await browser.close();
console.log(allOk ? '\nALL OK' : '\nISSUES FOUND');
process.exit(allOk ? 0 : 1);
